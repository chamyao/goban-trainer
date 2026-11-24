"""Teacher labels for distillation (the user: "train a point/score ai", "make a weaker engine with higher visits ...
it requires our value net to be meaningful"): positions from KGS games (prep.py's format, the same features our network
reads), each judged by a strong KataGo network, so our value head can learn from that judgement instead of who
happened to win a kyu game, and new heads can learn the score and who owns each point.

Per kept position, besides prep.py's fields: t_wr (Black's win rate), t_score (Black's lead, points), t_own (int8[361],
Black's ownership x 100), all from KataGo's analysis engine (maxVisits VISITS: 1 = the network's own judgement),
Chinese rules, the game's komi and handicap stones, the moves so far as history.

    python3 label.py SGF_DIR OUTDIR KEEP KATAGO MODEL CONFIG [VISITS=1] [MAX_POSITIONS]
OUTDIR gets one .npy per field (train.py reads such a folder).
"""
import json, os, random, subprocess, sys, threading, time
import numpy as np
from multiprocessing import Pool
import prep

COLS = "ABCDEFGHJKLMNOPQRST"
gtp = lambda i: "pass" if i == 361 else f"{COLS[i % 19]}{19 - i // 19}"

def game(args):   # prep.game, plus the KataGo query of each kept position
    path, keep, seed = args
    rnd = random.Random(seed)
    try:
        root, moves = prep.parse(open(path, encoding="utf-8", errors="replace").read())
        if root.get("SZ", ["19"])[0] != "19" or len(moves) < 30: return None
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
                last = (hist[::-1] + [-1] * 4)[:4]
                q = {"initialStones": init, "moves": played[:], "initialPlayer": "B" if (moves[0][0] == 1) else "W", "komi": komi}
                out.append(((prep.libboard(b), ko, last, 1 if col == 1 else 0, komi, mv, winner * col, hcap), q))
            if mv == 361: ko = -1
            else: ko = prep.play(b, mv, col)
            hist.append(mv); played.append(["B" if col == 1 else "W", gtp(mv)])
        return out
    except Exception:
        return None

def main():
    d, outdir, keep, katago, model, cfg = sys.argv[1:7]; keep = float(keep)
    visits = int(sys.argv[7]) if len(sys.argv) > 7 else 1
    cap = int(sys.argv[8]) if len(sys.argv) > 8 else 10**9
    files = sorted(os.path.join(r, f) for r, _, fs in os.walk(d) for f in fs if f.endswith(".sgf"))
    random.Random(3).shuffle(files)
    eng = subprocess.Popen([katago, "analysis", "-config", cfg, "-model", model, "-override-config",
        "numAnalysisThreads=96,numSearchThreadsPerAnalysisThread=1,nnMaxBatchSize=96,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1 << 20)
    rows, labels, inflight, lock = [], {}, [0], threading.Lock()
    def reader():
        for line in eng.stdout:
            a = json.loads(line)
            if "error" in a or "rootInfo" not in a:
                labels[int(a.get("id", -1))] = None
            else:
                labels[int(a["id"])] = (a["rootInfo"]["winrate"], a["rootInfo"]["scoreLead"], np.round(np.array(a["ownership"]) * 100).astype(np.int8))
            with lock: inflight[0] -= 1
    threading.Thread(target=reader, daemon=True).start()
    t0 = time.time(); n = 0
    with Pool(max(1, os.cpu_count() - 2)) as p:
        for g in p.imap_unordered(game, [(f, keep, i) for i, f in enumerate(files)], chunksize=32):
            if not g: continue
            for row, q in g:
                if n >= cap: break
                q.update({"id": str(n), "rules": "chinese", "boardXSize": 19, "boardYSize": 19, "maxVisits": visits, "includeOwnership": True})
                while inflight[0] > 2000: time.sleep(0.01)
                with lock: inflight[0] += 1
                eng.stdin.write(json.dumps(q) + "\n"); rows.append(row); n += 1
            eng.stdin.flush()
            if n >= cap: break
            if n and n % 50000 < len(g): print(f"{n} positions sent, {len(labels)} labelled, {len(labels)/(time.time()-t0):.0f}/s", flush=True)
    while inflight[0] > 0: time.sleep(0.1)
    eng.stdin.close()
    keep_ix = [i for i in range(n) if labels.get(i) is not None]
    print(f"labelled {len(keep_ix)} of {n} in {time.time()-t0:.0f} s", flush=True)
    os.makedirs(outdir, exist_ok=True)
    R = [rows[i] for i in keep_ix]; L = [labels[i] for i in keep_ix]
    np.save(f"{outdir}/board.npy", np.stack([r[0] for r in R])); np.save(f"{outdir}/ko.npy", np.array([r[1] for r in R], np.int16))
    np.save(f"{outdir}/last.npy", np.array([r[2] for r in R], np.int16)); np.save(f"{outdir}/black.npy", np.array([r[3] for r in R], np.int8))
    np.save(f"{outdir}/komi.npy", np.array([r[4] for r in R], np.float32)); np.save(f"{outdir}/move.npy", np.array([r[5] for r in R], np.int16))
    np.save(f"{outdir}/win.npy", np.array([r[6] for r in R], np.int8)); np.save(f"{outdir}/hcap.npy", np.array([r[7] for r in R], np.int8))
    np.save(f"{outdir}/t_wr.npy", np.array([l[0] for l in L], np.float32)); np.save(f"{outdir}/t_score.npy", np.array([l[1] for l in L], np.float32))
    np.save(f"{outdir}/t_own.npy", np.stack([l[2] for l in L]))
    print("saved", outdir, flush=True)

if __name__ == "__main__":
    main()
