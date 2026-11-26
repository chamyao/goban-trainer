"""Teacher move distributions for a pro-style student (the user: "as close to Takemiya Masaki as possible"): positions
from the professional games (CWI collection), each with KataGo's human-SL network's move distribution for a
professional of that game's year (humanSLProfile proyear_<year>, one visit) and its win rate. The held-out games of the
pros we measure (proprep.py's split: every 10th of their games) are left out, so the measurement stays fair.

    python3 labelpro.py CWI_DIR OUTDIR KEEP KATAGO HUMAN_MODEL CONFIG "Takemiya Masaki,Go Seigen" [MAX_POSITIONS]
OUTDIR: prep.py's fields as .npy, plus t_pol (float16 [n, 362]) and t_wr (Black's win rate).
"""
import json, os, random, re, subprocess, sys, threading, time
import numpy as np
from multiprocessing import Pool
import prep

COLS = "ABCDEFGHJKLMNOPQRST"
gtp = lambda i: "pass" if i == 361 else f"{COLS[i % 19]}{19 - i // 19}"

def heldout(files, name):   # proprep.py's split for one pro: the 10th, 20th, ... of their games that give positions
    out, ng = set(), 0
    for f in files:
        t = open(f, encoding="utf-8", errors="replace").read()
        pb = re.search(r"PB\[([^\]]*)\]", t); pw = re.search(r"PW\[([^\]]*)\]", t)
        me = 1 if pb and pb.group(1).strip().startswith(name) else -1 if pw and pw.group(1).strip().startswith(name) else 0
        if not me: continue
        g = prep.game((f, 1.0, 0))
        if not g or not [r for r in g if (1 if r[3] == 1 else -1) == me]: continue
        if ng % 10 == 9: out.add(f)
        ng += 1
    return out

def game(args):
    path, keep, seed = args
    rnd = random.Random(seed)
    try:
        t = open(path, encoding="utf-8", errors="replace").read()
        root, moves = prep.parse(t)
        if root.get("SZ", ["19"])[0] != "19" or len(moves) < 30: return None
        m = re.search(r"DT\[(\d{4})", t); year = min(2023, max(1800, int(m.group(1)))) if m else 1990
        komi = float((root.get("KM") or ["0"])[0] or 0)
        re_ = (root.get("RE") or [""])[0].upper()
        winner = 1 if re_.startswith("B+") else -1 if re_.startswith("W+") else 0
        hcap = int((root.get("HA") or ["0"])[0] or 0)
        b = [0] * 361; init = []
        for s in root.get("AB", []):
            if prep.pt(s) < 361: b[prep.pt(s)] = 1; init.append(["B", gtp(prep.pt(s))])
        for s in root.get("AW", []):
            if prep.pt(s) < 361: b[prep.pt(s)] = -1; init.append(["W", gtp(prep.pt(s))])
        ko, hist, played, out = -1, [], [], []
        for col, mv in moves:
            if rnd.random() < keep:
                q = {"initialStones": init, "moves": played[:], "initialPlayer": "B" if moves[0][0] == 1 else "W", "komi": komi,
                     "overrideSettings": {"humanSLProfile": f"proyear_{year}"}}
                out.append(((prep.libboard(b), ko, (hist[::-1] + [-1] * 4)[:4], 1 if col == 1 else 0, komi, mv, winner * col, hcap), q))
            ko = -1 if mv == 361 else prep.play(b, mv, col); hist.append(mv); played.append(["B" if col == 1 else "W", gtp(mv)])
        return out
    except Exception:
        return None

def main():
    d, outdir, keep, katago, model, cfg, names = sys.argv[1:8]; keep = float(keep)
    cap = int(sys.argv[8]) if len(sys.argv) > 8 else 10**9
    files = sorted(os.path.join(r, f) for r, _, fs in os.walk(d) for f in fs if f.endswith(".sgf"))
    skip = set().union(*(heldout(files, n.strip()) for n in names.split(",")))
    print(f"{len(files)} games, {len(skip)} held out", flush=True)
    files = [f for f in files if f not in skip]; random.Random(3).shuffle(files)
    eng = subprocess.Popen([katago, "analysis", "-config", cfg, "-model", model, "-override-config",
        "numAnalysisThreads=96,numSearchThreadsPerAnalysisThread=1,nnMaxBatchSize=96,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1 << 20)
    rows, labels, inflight, lock = [], {}, [0], threading.Lock()
    def reader():
        for line in eng.stdout:
            a = json.loads(line)
            if "error" in a or "rootInfo" not in a: labels[int(a.get("id", -1))] = None
            else:
                pol = np.array(a.get("humanPolicy") or a["policy"], np.float32); pol[pol < 0] = 0; pol /= max(pol.sum(), 1e-9)
                labels[int(a["id"])] = (a["rootInfo"]["winrate"], pol.astype(np.float16))
            with lock: inflight[0] -= 1
    threading.Thread(target=reader, daemon=True).start()
    t0 = time.time(); n = 0
    with Pool(max(1, os.cpu_count() - 2)) as p:
        for g in p.imap_unordered(game, [(f, keep, i) for i, f in enumerate(files)], chunksize=16):
            if not g: continue
            for row, q in g:
                if n >= cap: break
                q.update({"id": str(n), "rules": "japanese", "boardXSize": 19, "boardYSize": 19, "maxVisits": 1, "includePolicy": True})
                while inflight[0] > 2000: time.sleep(0.01)
                with lock: inflight[0] += 1
                eng.stdin.write(json.dumps(q) + "\n"); rows.append(row); n += 1
            eng.stdin.flush()
            if n >= cap: break
            if n and n % 100000 < len(g): print(f"{n} sent, {len(labels)} labelled, {len(labels)/(time.time()-t0):.0f}/s", flush=True)
    while inflight[0] > 0: time.sleep(0.1)
    eng.stdin.close()
    ix = [i for i in range(n) if labels.get(i) is not None]
    print(f"labelled {len(ix)} of {n} in {time.time()-t0:.0f} s", flush=True)
    os.makedirs(outdir, exist_ok=True)
    R = [rows[i] for i in ix]; L = [labels[i] for i in ix]
    for k, j, dt in [("board", 0, None), ("ko", 1, np.int16), ("last", 2, np.int16), ("black", 3, np.int8), ("komi", 4, np.float32), ("move", 5, np.int16), ("win", 6, np.int8), ("hcap", 7, np.int8)]:
        np.save(f"{outdir}/{k}.npy", np.stack([r[j] for r in R]) if dt is None else np.array([r[j] for r in R], dt))
    np.save(f"{outdir}/t_wr.npy", np.array([l[0] for l in L], np.float32)); np.save(f"{outdir}/t_pol.npy", np.stack([l[1] for l in L]))
    print("saved", outdir, flush=True)

if __name__ == "__main__":
    main()
