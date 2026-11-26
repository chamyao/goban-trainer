"""Who predicts Takemiya Masaki's moves best? His held-out games (proprep.py's split: every 10th of his games), up to
PER positions a game where he is to move. Our networks (features as prep.py builds them) and KataGo's human-SL net
(b18c384nbt-humanv0) with humanSLProfile proyear_<the game's year> and rank_9d, its human policy at one visit.
Out: per model, top-1 match and mean log loss of his move; and blends: KataGo's pro-of-the-year nudged by our
Takemiya copy's difference from its base (log p = log p_KataGo + a (log p_copy - log p_base))."""
import json, os, re, random, subprocess, sys
import numpy as np, torch
import prep, train
torch.set_num_threads(2)
NAME, PER = sys.argv[1], 8   # "Takemiya Masaki" / "Go Seigen"
COPY, OUT, NEW = sys.argv[2], sys.argv[3], sys.argv[4]
NETS = [("old style copy", COPY), ("run 3", "../kg/run3-150000.pt"), ("distilled student", "../kg/ps/student.pt"), ("NEW fine-tune (student + 6,000)", NEW)]
def rows_for(path, name):   # (proprep.py's: the positions where that pro is to move; it decides the held-out split)
    t = open(path, encoding="utf-8", errors="replace").read()
    pb = re.search(r"PB\[([^\]]*)\]", t); pw = re.search(r"PW\[([^\]]*)\]", t)
    me = 1 if pb and pb.group(1).strip().startswith(name) else -1 if pw and pw.group(1).strip().startswith(name) else 0
    if not me: return None
    g = prep.game((path, 1.0, 0))
    if not g: return None
    return [r for r in g if (1 if r[3] == 1 else -1) == me]
D = "../pro/cwi"; K = "../kg"
COLS = "ABCDEFGHJKLMNOPQRST"; gtp = lambda i: "pass" if i == 361 else f"{COLS[i % 19]}{19 - i // 19}"
files = sorted(os.path.join(r, f) for r, _, fs in os.walk(D) for f in fs if f.endswith(".sgf"))
val, ng = [], 0
for f in files:
    rs = rows_for(f, NAME)
    if not rs: continue
    if ng % 10 == 9: val.append(f)
    ng += 1
rnd = random.Random(5); pos = []
for f in val:
    t = open(f, encoding="utf-8", errors="replace").read()
    root, moves = prep.parse(t)
    yr = int(re.search(r"DT\[(\d{4})", t).group(1)) if re.search(r"DT\[(\d{4})", t) else 1990
    komi = float((root.get("KM") or ["0"])[0] or 0)
    pb = re.search(r"PB\[([^\]]*)\]", t); me = 1 if pb and pb.group(1).strip().startswith(NAME) else -1
    b = [0] * 361; init = []
    for s in root.get("AB", []):
        if prep.pt(s) < 361: b[prep.pt(s)] = 1; init.append(["B", gtp(prep.pt(s))])
    for s in root.get("AW", []):
        if prep.pt(s) < 361: b[prep.pt(s)] = -1; init.append(["W", gtp(prep.pt(s))])
    ko, hist, played, cands = -1, [], [], []
    try:
        for col, mv in moves:
            if col == me and mv < 361:
                cands.append({"board": prep.libboard(b), "ko": ko, "last": (hist[::-1] + [-1] * 4)[:4], "black": 1 if col == 1 else 0, "komi": komi,
                              "move": mv, "q": {"initialStones": init, "moves": played[:], "initialPlayer": "B" if moves[0][0] == 1 else "W", "komi": komi}, "year": yr})
            ko = -1 if mv == 361 else prep.play(b, mv, col); hist.append(mv); played.append(["B" if col == 1 else "W", gtp(mv)])
    except Exception: continue
    pos += rnd.sample(cands, min(PER, len(cands)))
print("games", len(val), "positions", len(pos), flush=True)
X = train.planes(np.stack([p["board"] for p in pos]), np.array([p["ko"] for p in pos]), np.array([p["last"] for p in pos]),
                 np.array([p["black"] for p in pos], np.int8), np.array([p["komi"] for p in pos], np.float32))
Y = np.array([p["move"] for p in pos])

import sys as _s
pre = np.load(OUT.replace(".json", "-preds.npz"))
assert (pre["Y"] == Y).all(), "positions differ from the saved run"
LP = {}
for name, path in NETS:
    ck = torch.load(path, map_location="cpu", weights_only=False); n = train.Net(ck["cfg"]["blocks"], ck["cfg"]["ch"]); n.load_state_dict(ck["model"]); n.eval()
    out = []
    with torch.no_grad():
        for i in range(0, len(X), 256): out.append(torch.log_softmax(n(torch.from_numpy(X[i:i + 256]))[0], 1).numpy())
    LP[name] = np.concatenate(out)
for k in pre.files:
    if k.startswith("KataGo"): LP[k.replace("_", " ")] = pre[k].astype(np.float64)
def score(lp):
    lp = lp - np.logaddexp.reduce(lp, 1, keepdims=True)
    rank = (lp > lp[np.arange(len(Y)), Y][:, None]).sum(1)
    return 100 * np.mean(rank == 0), 100 * np.mean(rank < 3), 100 * np.mean(rank < 5), -np.mean(lp[np.arange(len(Y)), Y])
print(f"{'model':45s} {'top-1':>6s} {'top-3':>6s} {'top-5':>6s} {'log loss':>9s}")
for k, v in LP.items():
    a1, a3, a5, ll = score(v); print(f"{k:45s} {a1:5.1f}% {a3:5.1f}% {a5:5.1f}% {ll:9.3f}")
