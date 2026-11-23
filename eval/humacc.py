"""KataGo's human-SL net (rank profiles) on our held-out positions (the first 20,000 rows of mix.npz, which
train.py never trains on): top-1 accuracy and the probability it gives the move played."""
import json, math, subprocess, sys
import numpy as np
COLS = "ABCDEFGHJKLMNOPQRST"
N = int(sys.argv[1]); profiles = sys.argv[2:]
d = np.load("../kgs/mix.npz", mmap_mode="r")
ix = np.random.default_rng(0).choice(20000, N, replace=False)
B, black, mv, komi = d["board"][ix], d["black"][ix], d["move"][ix], d["komi"][ix]
v = lambda i: f"{COLS[i % 19]}{19 - i // 19}"
p = subprocess.Popen(["./katago", "analysis", "-config", "bin/analysis_example.cfg", "-model", "/home/user/goban-trainer/engine/katago-small.bin.gz",
     "-human-model", "human.bin.gz", "-override-config", "numAnalysisThreads=1,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false"],
     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
for prof in profiles:
    hit = 0; lp = 0.0; n = 0
    for k in range(N):
        stones = [["B" if s > 0 else "W", v(i)] for i, s in enumerate(B[k]) if s != 0]
        q = {"id": str(k), "initialStones": stones, "initialPlayer": "B" if black[k] == 1 else "W", "moves": [], "rules": "chinese",
             "komi": float(komi[k]), "boardXSize": 19, "boardYSize": 19, "maxVisits": 1, "includePolicy": True, "overrideSettings": {"humanSLProfile": prof}}
        p.stdin.write(json.dumps(q) + "\n"); p.stdin.flush()
        a = json.loads(p.stdout.readline())
        if "error" in a: continue
        pol = np.array(a["humanPolicy"]); m = int(mv[k]); m = 361 if m == 361 else m
        hit += int(np.argmax(pol) == m); lp += -math.log(max(pol[m], 1e-6)); n += 1
    print(f"{prof}: top-1 {hit / n:.1%}  loss {lp / n:.3f}  ({n} positions)", flush=True)
p.kill()
