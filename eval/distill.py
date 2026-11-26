"""Distil KataGo's judgement into our network (label.py's labels): the value head learns KataGo's win rate instead of
who won the game, and two new heads learn Black's lead in points and who owns each point. The move policy is held to
the starting network's own (KL to a frozen copy), so its strength and style stay as they were: only its judgement
changes, for search (a weak network that reads: the user, "a weaker engine with higher visits to model calculating
players") and for scoring.

    python3 distill.py LABELS_DIR OUTDIR --init BASE.pt [--steps 40000 --batch 256 --lr 0.01 --device cuda --bf16]
"""
import argparse, json, math, os, time
import numpy as np
import torch, torch.nn as nn, torch.nn.functional as F
import train

class DNet(train.Net):
    """train.Net plus a score head (from the value head's hidden layer, points from the side to move) and an
    ownership head (1x1 conv on the trunk, tanh: +1 the side to move owns the point)"""
    def __init__(s, blocks=6, ch=64):
        super().__init__(blocks, ch)
        s.cfg["heads"] = ["policy", "value", "score", "ownership"]
        s.sfc = nn.Linear(64, 1)
        s.oconv = nn.Conv2d(ch, 1, 1)
    def forward(s, x, all_heads=False):
        t = s.tower(F.relu(s.bstem(s.stem(x))))
        p = s.pfc(F.relu(s.pbn(s.pconv(t))).flatten(1))
        hdn = F.relu(s.vfc1(F.relu(s.vbn(s.vconv(t))).flatten(1)))
        v = torch.tanh(s.vfc2(hdn)).squeeze(1)
        if not all_heads: return p, v
        return p, v, s.sfc(hdn).squeeze(1) * 20, torch.tanh(s.oconv(t)).flatten(1)

HEADS = {"vconv", "vbn", "vfc1", "vfc2", "sfc", "oconv"}

def load(d):
    return {k[:-4]: np.load(os.path.join(d, k), mmap_mode="r") for k in os.listdir(d) if k.endswith(".npy")}

def batch(d, ix, rng):
    ix = np.sort(ix)
    x = train.planes(d["board"][ix], d["ko"][ix], d["last"][ix], d["black"][ix], d["komi"][ix])
    side = np.where(d["black"][ix] == 1, 1.0, -1.0).astype(np.float32)
    wr = (2 * d["t_wr"][ix] - 1) * side; sc = d["t_score"][ix] * side
    own = d["t_own"][ix].astype(np.float32) / 100 * side[:, None]
    t = rng.integers(8)
    if t:
        m = train.SYMS[t]; inv = np.argsort(m)
        x = x.reshape(len(ix), train.P, 361)[:, :, inv].reshape(len(ix), train.P, 19, 19)
        own = own[:, inv]
    return [torch.from_numpy(np.ascontiguousarray(a)) for a in (x, wr, sc, own)]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("labels"); ap.add_argument("out"); ap.add_argument("--init", required=True)
    ap.add_argument("--steps", type=int, default=40000); ap.add_argument("--batch", type=int, default=256)
    ap.add_argument("--lr", type=float, default=0.005); ap.add_argument("--every", type=int, default=5000)
    ap.add_argument("--warmup", type=int, default=2000)   # first steps: only the value, score and ownership heads learn
    ap.add_argument("--kl", type=float, default=3.0)      # weight holding the policy to the base's
    ap.add_argument("--device", default="cuda"); ap.add_argument("--bf16", action="store_true")
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    d = load(a.labels); n = len(d["move"]); nval = min(20000, n // 20); tr, va = np.arange(nval, n), np.arange(nval)
    ck = torch.load(a.init, map_location="cpu"); B, C = ck["cfg"]["blocks"], ck["cfg"]["ch"]
    dev = torch.device(a.device)
    net = DNet(B, C); net.load_state_dict(ck["model"], strict=False); net = net.to(dev)
    base = train.Net(B, C); base.load_state_dict(ck["model"]); base = base.to(dev).eval()
    for q in base.parameters(): q.requires_grad_(False)
    opt = torch.optim.SGD(net.parameters(), lr=a.lr, momentum=0.9, weight_decay=1e-4, nesterov=True)
    amp = lambda: torch.autocast(dev.type, dtype=torch.bfloat16, enabled=a.bf16)
    lr_at = lambda s: a.lr * 0.5 * (1 + math.cos(math.pi * min(1, s / a.steps)))
    rng = np.random.default_rng(0); log = open(os.path.join(a.out, "log.jsonl"), "a"); t0 = time.time(); run = np.zeros(5); k = 0
    def losses(x, wr, sc, own):
        with amp():
            p, v, s, o = net(x, True)
            with torch.no_grad(): pb, _ = base(x)
        p, v, s, o, pb = p.float(), v.float(), s.float(), o.float(), pb.float()
        lp = F.kl_div(F.log_softmax(p, 1), F.log_softmax(pb, 1), log_target=True, reduction="batchmean")
        lv = F.mse_loss(v, wr); ls = F.smooth_l1_loss(s / 10, sc / 10); lo = F.mse_loss(o, own)
        return lp, lv, ls, lo, (s - sc).abs().mean()
    for step in range(1, a.steps + 1):
        for g in opt.param_groups: g["lr"] = lr_at(step)
        warm = step <= a.warmup
        for nm, q in net.named_parameters(): q.requires_grad_(not warm or nm.split(".")[0] in HEADS)
        net.train()
        for m in net.modules():   # (batch norms keep their running statistics: the bases' are folded in, exported .bin)
            if isinstance(m, nn.BatchNorm2d): m.eval()
        x, wr, sc, own = [t.to(dev, non_blocking=True) for t in batch(d, rng.choice(tr, a.batch), rng)]
        lp, lv, ls, lo, se = losses(x, wr, sc, own)
        loss = a.kl * lp + lv + ls + lo
        opt.zero_grad(set_to_none=True); loss.backward(); opt.step()
        run += [lp.item(), lv.item(), ls.item(), lo.item(), se.item()]; k += 1
        if step % 500 == 0:
            r = run / k; print(f"step {step} kl {r[0]:.3f} value {r[1]:.3f} score {r[2]:.3f} own {r[3]:.3f} |score err| {r[4]:.2f} lr {lr_at(step):.4f} {500*a.batch/(time.time()-t0):.0f} pos/s", flush=True)
            t0 = time.time(); run[:] = 0; k = 0
        if step % a.every == 0 or step == a.steps:
            net.eval(); acc = np.zeros(5); m = 0
            with torch.no_grad():
                for i in range(0, nval, 1000):
                    x, wr, sc, own = [t.to(dev) for t in batch(d, va[i:i + 1000], np.random.default_rng(1))]
                    acc += [float(z) * len(x) for z in losses(x, wr, sc, own)]; m += len(x)
            acc /= m
            rec = {"step": step, "val_kl": acc[0], "val_value_mse": acc[1], "val_score": acc[2], "val_own_mse": acc[3], "val_score_abs_err": acc[4], "time": time.time()}
            log.write(json.dumps(rec) + "\n"); log.flush(); print("VAL", rec, flush=True)
            torch.save({"model": net.state_dict(), "step": step, "cfg": net.cfg, "val": rec}, os.path.join(a.out, f"d{step:07d}.pt"))

if __name__ == "__main__":
    main()
