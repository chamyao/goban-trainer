"""A student that moves like KataGo's professional of the era (labelpro.py's labels): our network trained on the
teacher's whole move distribution (soft targets) and its win rate, from a starting checkpoint (run 3, 8x96). Then
fine-tune it on one pro's own games with train.py --init ... --val, as the style copies were.

    python3 distillpol.py LABELS_DIR OUTDIR --init BASE.pt [--steps 60000 --batch 256 --lr 0.01 --every 5000 --device cuda]
"""
import argparse, json, math, os, time
import numpy as np
import torch, torch.nn.functional as F
import train

def load(d): return {k[:-4]: np.load(os.path.join(d, k), mmap_mode="r") for k in os.listdir(d) if k.endswith(".npy")}

def batch(d, ix, rng):
    ix = np.sort(ix)
    x = train.planes(d["board"][ix], d["ko"][ix], d["last"][ix], d["black"][ix], d["komi"][ix])
    pol = d["t_pol"][ix].astype(np.float32); mv = d["move"][ix].astype(np.int64)
    side = np.where(d["black"][ix] == 1, 1.0, -1.0).astype(np.float32); wr = (2 * d["t_wr"][ix] - 1) * side
    t = rng.integers(8)
    if t:
        m = train.SYMS[t]; inv = np.argsort(m)
        x = x.reshape(len(ix), train.P, 361)[:, :, inv].reshape(len(ix), train.P, 19, 19)
        pol = np.concatenate([pol[:, :361][:, inv], pol[:, 361:]], 1)
        on = mv < 361; mv[on] = m[mv[on]]
    return [torch.from_numpy(np.ascontiguousarray(a)) for a in (x, pol, wr, mv)]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("labels"); ap.add_argument("out"); ap.add_argument("--init", required=True)
    ap.add_argument("--steps", type=int, default=60000); ap.add_argument("--batch", type=int, default=256)
    ap.add_argument("--lr", type=float, default=0.01); ap.add_argument("--every", type=int, default=5000)
    ap.add_argument("--device", default="cuda")
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    d = load(a.labels); n = len(d["move"]); nval = min(20000, n // 20); tr, va = np.arange(nval, n), np.arange(nval)
    ck = torch.load(a.init, map_location="cpu", weights_only=False); dev = torch.device(a.device)
    net = train.Net(ck["cfg"]["blocks"], ck["cfg"]["ch"]); net.load_state_dict(ck["model"]); net = net.to(dev)
    opt = torch.optim.SGD(net.parameters(), lr=a.lr, momentum=0.9, weight_decay=1e-4, nesterov=True)
    lr_at = lambda s: a.lr * 0.5 * (1 + math.cos(math.pi * min(1, s / a.steps)))
    rng = np.random.default_rng(0); log = open(os.path.join(a.out, "log.jsonl"), "a"); t0 = time.time(); run = np.zeros(4); k = 0
    def losses(x, pol, wr, mv):
        p, v = net(x); lp = F.log_softmax(p.float(), 1)
        soft = -(pol * lp).sum(1).mean(); lv = F.mse_loss(v.float(), wr)
        return soft, lv, (p.argmax(1) == pol.argmax(1)).float().mean(), (p.argmax(1) == mv).float().mean()
    for step in range(1, a.steps + 1):
        for g in opt.param_groups: g["lr"] = lr_at(step)
        net.train()
        x, pol, wr, mv = [t.to(dev, non_blocking=True) for t in batch(d, rng.choice(tr, a.batch), rng)]
        soft, lv, agree, acc = losses(x, pol, wr, mv); loss = soft + 0.25 * lv
        opt.zero_grad(set_to_none=True)
        if not torch.isfinite(loss): print(f"step {step}: loss not finite, skipped", flush=True); continue
        loss.backward(); torch.nn.utils.clip_grad_norm_(net.parameters(), 5.0); opt.step()
        run += [soft.item(), lv.item(), agree.item(), acc.item()]; k += 1
        if step % 500 == 0:
            r = run / k; print(f"step {step} soft-CE {r[0]:.3f} value {r[1]:.3f} agrees with teacher {r[2]:.3f} pro's move {r[3]:.3f} lr {lr_at(step):.4f} {500*a.batch/(time.time()-t0):.0f} pos/s", flush=True)
            t0 = time.time(); run[:] = 0; k = 0
        if step % a.every == 0 or step == a.steps:
            net.eval(); acc_ = np.zeros(4); m = 0
            with torch.no_grad():
                for i in range(0, nval, 1000):
                    x, pol, wr, mv = [t.to(dev) for t in batch(d, va[i:i + 1000], np.random.default_rng(1))]
                    acc_ += [float(z) * len(x) for z in losses(x, pol, wr, mv)]; m += len(x)
            acc_ /= m
            rec = {"step": step, "val_softce": acc_[0], "val_value": acc_[1], "val_agree_teacher": acc_[2], "val_pro_move": acc_[3], "time": time.time()}
            log.write(json.dumps(rec) + "\n"); log.flush(); print("VAL", rec, flush=True)
            torch.save({"model": net.state_dict(), "opt": opt.state_dict(), "step": step, "cfg": net.cfg, "val": rec}, os.path.join(a.out, f"m{step:07d}.pt"))

if __name__ == "__main__":
    main()
