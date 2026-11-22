"""Train the site's own Go network on KGS positions (prep.py), saving milestones along the way.

Inputs (17 planes, from the side to move): own stones with 1/2/3+ liberties, the opponent's the same, empty, the ko
point, the last four moves, ones, Black-to-move, and komi from the side to move (komi if White to move, else -komi,
/15), so handicap games (komi 0.5, Black's stones set) and even games both read right.
Outputs: policy over 361 points + pass, and a value (tanh: +1 the side to move wins).

    python3 train.py DATA.npz OUTDIR [--blocks 6 --ch 64 --steps 200000 --batch 256 --every 5000]
"""
import argparse, json, math, os, time
import numpy as np
import torch, torch.nn as nn, torch.nn.functional as F

N, P = 19, 17

def planes(board, ko, last, black, komi):
    """numpy batch -> float32 [B, 17, 19, 19]"""
    B = board.shape[0]
    side = np.where(black[:, None] == 1, 1, -1).astype(np.int8)
    rel = board * side   # + own, - opponent
    x = np.zeros((B, P, N * N), np.float32)
    for l in (1, 2, 3):
        x[:, l - 1] = rel == l
        x[:, 2 + l] = rel == -l
    x[:, 6] = board == 0
    idx = np.arange(B)
    k = ko >= 0; x[idx[k], 7, ko[k]] = 1
    for j in range(4):
        m = (last[:, j] >= 0) & (last[:, j] < 361); x[idx[m], 8 + j, last[m, j]] = 1
    x[:, 12] = 1
    x[:, 13] = black[:, None]
    x[:, 14] = (np.where(black == 1, -komi, komi) / 15.0)[:, None]
    return x.reshape(B, P, N, N)

# the 8 symmetries of the board, as index maps on 0..360
def sym_maps():
    r, c = np.divmod(np.arange(N * N), N); out = []
    for t in range(8):
        rr, cc = (r, c) if t < 4 else (c, r)
        for _ in range(t % 4): rr, cc = cc, N - 1 - rr
        out.append(rr * N + cc)
    return out
SYMS = sym_maps()

class Block(nn.Module):
    def __init__(s, ch):
        super().__init__()
        s.c1, s.b1 = nn.Conv2d(ch, ch, 3, padding=1, bias=False), nn.BatchNorm2d(ch)
        s.c2, s.b2 = nn.Conv2d(ch, ch, 3, padding=1, bias=False), nn.BatchNorm2d(ch)
    def forward(s, x):
        y = F.relu(s.b1(s.c1(x)))
        return F.relu(x + s.b2(s.c2(y)))

class Net(nn.Module):
    def __init__(s, blocks=6, ch=64):
        super().__init__()
        s.cfg = {"blocks": blocks, "ch": ch, "planes": P}
        s.stem, s.bstem = nn.Conv2d(P, ch, 3, padding=1, bias=False), nn.BatchNorm2d(ch)
        s.tower = nn.Sequential(*[Block(ch) for _ in range(blocks)])
        s.pconv, s.pbn = nn.Conv2d(ch, 2, 1, bias=False), nn.BatchNorm2d(2)
        s.pfc = nn.Linear(2 * N * N, N * N + 1)
        s.vconv, s.vbn = nn.Conv2d(ch, 1, 1, bias=False), nn.BatchNorm2d(1)
        s.vfc1, s.vfc2 = nn.Linear(N * N, 64), nn.Linear(64, 1)
    def forward(s, x):
        x = s.tower(F.relu(s.bstem(s.stem(x))))
        p = s.pfc(F.relu(s.pbn(s.pconv(x))).flatten(1))
        v = torch.tanh(s.vfc2(F.relu(s.vfc1(F.relu(s.vbn(s.vconv(x))).flatten(1)))))
        return p, v.squeeze(1)

def batch(d, ix, rng):
    x = planes(d["board"][ix], d["ko"][ix], d["last"][ix], d["black"][ix], d["komi"][ix])
    mv = d["move"][ix].astype(np.int64)
    t = rng.integers(8)
    if t:   # one symmetry for the whole batch
        m = SYMS[t]; inv = np.argsort(m)
        x = x.reshape(len(ix), P, N * N)[:, :, inv].reshape(len(ix), P, N, N)
        on = mv < 361; mv[on] = m[mv[on]]   # (a stone at p is now at m[p], and so is a move)
    return torch.from_numpy(x), torch.from_numpy(mv), torch.from_numpy(d["win"][ix].astype(np.float32))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("data"); ap.add_argument("out")
    ap.add_argument("--blocks", type=int, default=6); ap.add_argument("--ch", type=int, default=64)
    ap.add_argument("--steps", type=int, default=200000); ap.add_argument("--batch", type=int, default=256)
    ap.add_argument("--every", type=int, default=5000); ap.add_argument("--lr", type=float, default=0.05)
    ap.add_argument("--resume", default="")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    torch.set_num_threads(os.cpu_count())
    d = dict(np.load(a.data))
    n = len(d["move"]); nval = min(20000, n // 20)
    tr, va = np.arange(nval, n), np.arange(nval)
    net = Net(a.blocks, a.ch); step0 = 0
    opt = torch.optim.SGD(net.parameters(), lr=a.lr, momentum=0.9, weight_decay=1e-4, nesterov=True)
    if a.resume:
        ck = torch.load(a.resume); net.load_state_dict(ck["model"]); opt.load_state_dict(ck["opt"]); step0 = ck["step"]
    rng = np.random.default_rng(step0)
    log = open(os.path.join(a.out, "log.jsonl"), "a")
    lr_at = lambda s: a.lr * 0.5 * (1 + math.cos(math.pi * min(1, s / a.steps)))   # cosine to 0
    t0, run = time.time(), [0, 0, 0, 0]
    for step in range(step0 + 1, a.steps + 1):
        for g in opt.param_groups: g["lr"] = lr_at(step)
        net.train()
        x, mv, w = batch(d, rng.choice(tr, a.batch), rng)
        p, v = net(x)
        lp, lv = F.cross_entropy(p, mv), F.mse_loss(v, w)
        loss = lp + 0.25 * lv
        opt.zero_grad(); loss.backward(); opt.step()
        run[0] += lp.item(); run[1] += lv.item(); run[2] += (p.argmax(1) == mv).float().mean().item(); run[3] += 1
        if step % 500 == 0:
            print(f"step {step} pol {run[0]/run[3]:.3f} val {run[1]/run[3]:.3f} acc {run[2]/run[3]:.3f} lr {lr_at(step):.4f} {500*a.batch/(time.time()-t0):.0f} pos/s", flush=True)
            t0, run = time.time(), [0, 0, 0, 0]
        if step % a.every == 0 or step == a.steps or step in (250, 500, 1000, 1500):   # (early ones: the weak milestones)
            net.eval(); acc = pl = vl = 0; m = 0
            with torch.no_grad():
                for i in range(0, nval, 1000):
                    ix = va[i:i + 1000]; x, mv, w = batch(d, ix, np.random.default_rng(0))
                    p, v = net(x)
                    acc += (p.argmax(1) == mv).float().sum().item(); pl += F.cross_entropy(p, mv, reduction="sum").item()
                    vl += F.mse_loss(v, w, reduction="sum").item(); m += len(ix)
            rec = {"step": step, "positions": step * a.batch, "val_acc": acc / m, "val_pol": pl / m, "val_v": vl / m, "time": time.time()}
            log.write(json.dumps(rec) + "\n"); log.flush(); print("VAL", rec, flush=True)
            torch.save({"model": net.state_dict(), "opt": opt.state_dict(), "step": step, "cfg": net.cfg, "val": rec},
                       os.path.join(a.out, f"m{step:07d}.pt"))

if __name__ == "__main__":
    main()
