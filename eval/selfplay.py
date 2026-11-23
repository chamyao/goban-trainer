"""Our checkpoints against each other (the user: "play these versions against each other ... establish relative rank
quickly, then smooth/anchor the rankings collectively"). Fast: no reference engine during play. Each game: the first
OPEN moves drawn from each side's own policy (variety; otherwise two deterministic nets replay one game), then each
plays its favourite legal move; the network's own pass. Scored at the end by KataGo's human-SL net (rank_9d) judging
the final position: area from its ownership (verified earlier against the referee's winners), komi 7.5.

    python3 selfplay.py PAIRS.txt GAMES_PER_PAIR OUT.jsonl      (PAIRS.txt: "ckptA ckptB" per line)
"""
import json, subprocess, sys, os
import numpy as np, torch
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "kgs"))
import train, prep
torch.set_num_threads(1)
OPEN, KOMI, N = 8, 7.5, 361
COLS = "ABCDEFGHJKLMNOPQRST"
gtp = lambda i: "pass" if i == N else f"{COLS[i % 19]}{19 - i // 19}"

NETS = {}
def net(path):
    if path not in NETS:
        ck = torch.load(path, map_location="cpu"); n = train.Net(ck["cfg"]["blocks"], ck["cfg"]["ch"]); n.load_state_dict(ck["model"]); n.eval()
        NETS[path] = n
    return NETS[path]

def legal_moves(b, col, ko):
    out = []
    for i in range(N):
        if b[i] or i == ko: continue
        nb = prep.NB[i]
        if any(b[j] == 0 for j in nb): out.append(i); continue
        ok = False
        for j in nb:   # captures, or joins a group of its own that keeps a liberty
            g, l = prep.group(b, j)
            if (b[j] == -col and len(l) == 1) or (b[j] == col and len(l) > 1): ok = True; break
        if ok: out.append(i)
    return out

def policy(n, b, col, ko, hist):
    last = (hist[::-1] + [-1] * 4)[:4]
    x = train.planes(prep.libboard(b)[None], np.array([ko]), np.array([last]), np.array([1 if col == 1 else 0], np.int8), np.array([KOMI], np.float32))
    with torch.no_grad(): p, _ = n(torch.from_numpy(x))
    return torch.softmax(p[0], 0).numpy()

def game(pa, pb, a_black, rng):
    b, ko, hist, moves, passes = [0] * N, -1, [], [], 0
    for t in range(400):
        col = 1 if t % 2 == 0 else -1
        n = net(pa if (col == 1) == a_black else pb)
        pol = policy(n, b, col, ko, hist); lg = legal_moves(b, col, ko)
        p = np.zeros(N + 1); p[lg] = pol[lg]; p[N] = pol[N]
        if t < OPEN:
            p[N] = 0; q = p / p.sum(); m = int(rng.choice(N + 1, p=q))
        else: m = int(p.argmax())
        if m == N: passes += 1; ko = -1
        else: passes = 0; ko = prep.play(b, m, col)
        hist.append(m); moves.append(["B" if col == 1 else "W", gtp(m)])
        if passes >= 2: break
    return moves

class Scorer:
    def __init__(self):
        d = os.path.dirname(os.path.abspath(__file__))
        self.p = subprocess.Popen([f"{d}/katago", "analysis", "-config", f"{d}/bin/analysis_example.cfg", "-model", f"{d}/human.bin.gz", "-override-config",
            "humanSLProfile=rank_9d,numAnalysisThreads=1,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false,reportAnalysisWinratesAs=BLACK"],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
    def black_area_lead(self, moves):
        mv = moves[:]
        while mv and mv[-1][1] == "pass": mv = mv[:-1]
        self.p.stdin.write(json.dumps({"id": "s", "moves": mv, "rules": "chinese", "komi": KOMI, "boardXSize": 19, "boardYSize": 19, "maxVisits": 2, "includeOwnership": True}) + "\n"); self.p.stdin.flush()
        a = json.loads(self.p.stdout.readline())
        return sum(a["ownership"]) - KOMI

def main():
    pairs = [l.split() for l in open(sys.argv[1]) if l.strip()]
    k, out = int(sys.argv[2]), sys.argv[3]
    sc, rng = Scorer(), np.random.default_rng(42)
    done = {}
    if os.path.exists(out):
        for l in open(out):
            r = json.loads(l); done[(r["a"], r["b"])] = done.get((r["a"], r["b"]), 0) + 1
    for pa, pb in pairs:
        w = 0
        for g in range(done.get((pa, pb), 0), k):   # (games already played are kept)
            a_black = g % 2 == 0
            mv = game(pa, pb, a_black, rng); lead = sc.black_area_lead(mv)
            a_won = (lead > 0) == a_black; w += a_won
            open(out, "a").write(json.dumps({"a": pa, "b": pb, "a_black": a_black, "a_won": a_won, "lead_black": round(lead, 1), "moves": len(mv)}) + "\n")
        print(f"{os.path.basename(pa)} vs {os.path.basename(pb)}: {w}/{k}", flush=True)

if __name__ == "__main__":
    main()
