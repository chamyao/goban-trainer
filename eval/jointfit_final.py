"""One rating per checkpoint from all the evidence at once (the user: "use the confidence from their combined
benchmarks and smooth the ranking / anchor the rankings collectively").

Strength theta on the benchmark's rank-value scale (20k = 0, 10k = 10, 1d = 20).
  - a benchmark game against the human-SL reference at rank value r: P(win) = s((theta - r) / 1.6)
  - a head-to-head game between checkpoints:                       P(a wins) = s((theta_a - theta_b) / S)
    S (how many rank values one "head-to-head step" is worth) is fitted too: self-play can stretch or squeeze
    differences, the reference games fix the scale.
MAP with a broad prior on each theta; error bars from the curvature (Laplace). Then the OGS translation through
OGS's KataGo human-SL bots: benchmark "10k" -> OGS 13.1k, "5k" -> OGS 6.3k (straight line).
    python3 jointfit.py
"""
import json, math, os, re
import numpy as np
from scipy.optimize import minimize

def ck_id(path):
    m = re.search(r"st[23]/([a-z]+)-(\d+)\.pt", path)
    if m: return f"{m.group(1)}:{int(m.group(2))}"
    m = re.search(r"(run[23])-0*(\d+)\.pt", path)
    if m: return f"{m.group(1)}:{int(m.group(2))}"
    m = re.search(r"m0*(\d+)\.pt", path) or re.search(r"(?:gpu|ec2)-0*(\d+)\.pt", path)
    src = "gpu" if "gpu-" in path else "ec2" if "ec2-" in path else "local"
    return f"{src}:{int(m.group(1))}" if m else path

ref, h2h = [], []
for l in open("mil.jsonl.games.jsonl"):                       # the staircase tests of local checkpoints
    r = json.loads(l)
    if "step" in r and "rv" in r: ref.append((f"local:{r['step']}", r["rv"], r["winner"] == "bot"))
for l in open("rejudge.jsonl.games.jsonl"):                   # re-tests and the GPU/EC2 checkpoints' staircases
    r = json.loads(l); ref.append((ck_id(r["ckpt"]), r["rv"], r["winner"] == "bot"))
if os.path.exists("anchor5.jsonl"):                            # fixed matches against "5k" (rank value 15)
    for l in open("anchor5.jsonl"):
        r = json.loads(l); ref.append((ck_id(r["ckpt"]), 20 - r["kyu"], r["winner"] == "bot"))
for f in ["st2/h2h.jsonl", "st3/h2h.jsonl"]:
    for l in open(f):
        r = json.loads(l); h2h.append((ck_id(r["a"]), ck_id(r["b"]), r["a_won"]))
for l in open("selfplay.jsonl"):
    r = json.loads(l); h2h.append((ck_id(r["a"]), ck_id(r["b"]), r["a_won"]))

ids = sorted({x[0] for x in ref} | {x[0] for x in h2h} | {x[1] for x in h2h}, key=lambda s: (s.split(":")[0] != "local", int(s.split(":")[1])))
ids = sorted(ids, key=lambda s: int(s.split(":")[1]))
ix = {s: i for i, s in enumerate(ids)}
R = np.array([[ix[a], rv, w] for a, rv, w in ref], float) if ref else np.zeros((0, 3))
H = np.array([[ix[a], ix[b], w] for a, b, w in h2h], float) if h2h else np.zeros((0, 3))

def nll(v):
    th, S = v[:-1], math.exp(v[-1])
    z = (th[R[:, 0].astype(int)] - R[:, 1]) / 1.6
    out = -np.sum(R[:, 2] * -np.logaddexp(0, -z) + (1 - R[:, 2]) * -np.logaddexp(0, z))
    if len(H):
        z = (th[H[:, 0].astype(int)] - th[H[:, 1].astype(int)]) / S
        out -= np.sum(H[:, 2] * -np.logaddexp(0, -z) + (1 - H[:, 2]) * -np.logaddexp(0, z))
    out += np.sum((th - 10) ** 2) / (2 * 10 ** 2) + (v[-1] - math.log(1.6)) ** 2 / (2 * 1.0 ** 2)   # broad priors
    return out

v0 = np.r_[np.full(len(ids), 10.0), math.log(1.6)]
res = minimize(nll, v0, method="L-BFGS-B")
v = res.x
# Laplace error bars: numerical Hessian
eps = 1e-3; n = len(v); Hm = np.zeros((n, n))
for i in range(n):
    for j in range(i, n):
        ei = np.zeros(n); ej = np.zeros(n); ei[i] = eps; ej[j] = eps
        Hm[i, j] = Hm[j, i] = (nll(v + ei + ej) - nll(v + ei - ej) - nll(v - ei + ej) + nll(v - ei - ej)) / (4 * eps * eps)
cov = np.linalg.pinv(Hm); sd = np.sqrt(np.maximum(np.diag(cov), 0))
nref = {s: sum(1 for x in ref if x[0] == s) for s in ids}; nh = {s: sum(1 for x in h2h if s in (x[0], x[1])) for s in ids}
print(f"head-to-head scale S = {math.exp(v[-1]):.2f} rank values per logit unit (reference games: 1.6)   [{len(ref)} reference games, {len(h2h)} head-to-head]")
print(f"{'checkpoint':14s} {'benchmark':>10s} {'± ':>5s}  {'OGS (approx)':>12s}  games: ref / h2h")
for s in ids:
    th = v[ix[s]]; bk = 20 - th; ogs = 6.3 + (bk - 5) * 1.36
    print(f"{s:14s} {bk:8.1f}k ±{sd[ix[s]]:4.1f}   ~{ogs:5.1f}k ±{math.hypot(sd[ix[s]] * 1.36, 1.3):.1f}   {nref[s]:3d} / {nh[s]:3d}")
json.dump({s: {"bench_kyu": round(20 - v[ix[s]], 2), "sd": round(float(sd[ix[s]]), 2), "ogs_kyu": round(6.3 + (15 - v[ix[s]]) * 1.36, 2)} for s in ids}, open("jointfit-final.json", "w"), indent=1)
