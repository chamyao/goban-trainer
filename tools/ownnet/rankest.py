"""Rank estimate by move likelihood (the KataGo human-SL way): for each of a bot's moves, how likely a player of each
rank would be to play it (b18c384nbt-humanv0's policy with humanSLProfile=rank_X); the rank whose policy best
predicts the bot's moves (largest summed log-probability) is its estimate. Moves 1-10 (the opening, where every rank
agrees) and passes are left out.

    python3 rankest.py GAMES.jsonl [BOT ...]
"""
import json, math, os, subprocess, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SMALL = "/home/user/goban-trainer/engine/katago-small.bin.gz"
COLS = "ABCDEFGHJKLMNOPQRST"
RANKS = ["rank_18k", "rank_15k", "rank_12k", "rank_10k", "rank_8k", "rank_6k", "rank_4k", "rank_2k", "rank_1d", "rank_3d", "rank_5d", "rank_7d"]

def idx(mv):   # policy index: row-major from the top-left, as KataGo reports it
    x = COLS.index(mv[0].upper()); y = 19 - int(mv[1:])
    return y * 19 + x

def main():
    games = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
    want = set(sys.argv[2:])
    games = [g for g in games if "record" in g and (not want or g["bot"] in want)]
    p = subprocess.Popen([f"{HERE}/katago", "analysis", "-config", f"{HERE}/bin/analysis_example.cfg", "-model", SMALL, "-human-model", f"{HERE}/human.bin.gz",
                          "-override-config", "numAnalysisThreads=2,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false"],
                         stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
    ll = defaultdict(lambda: defaultdict(float)); cnt = defaultdict(int)
    for gi, g in enumerate(games):
        rec, mine = g["record"], "B" if g["bot_black"] else "W"
        turns = [t for t in range(10, len(rec)) if rec[t][0] == mine and rec[t][1].lower() != "pass"]
        if not turns: continue
        for r in RANKS:
            q = {"id": f"{gi}-{r}", "moves": rec, "rules": "chinese", "komi": 7.5, "boardXSize": 19, "boardYSize": 19, "maxVisits": 1,
                 "analyzeTurns": turns, "includePolicy": True, "overrideSettings": {"humanSLProfile": r}}
            p.stdin.write(json.dumps(q) + "\n"); p.stdin.flush()
            got = 0
            while got < len(turns):
                a = json.loads(p.stdout.readline())
                if "error" in a: raise SystemExit(a)
                t = a["turnNumber"]; pol = a.get("humanPolicy")
                if pol is None: raise SystemExit("no humanPolicy in the response")
                ll[g["bot"]][r] += math.log(max(pol[idx(rec[t][1])], 1e-6))
                got += 1
        cnt[g["bot"]] += len(turns)
        print(f"  {g['bot']} game {g['game']}: {len(turns)} moves", file=sys.stderr, flush=True)
    p.kill()
    out = {}
    for b in ll:
        best = max(RANKS, key=lambda r: ll[b][r])
        out[b] = {"estimate": best, "moves": cnt[b], "avg_logp": {r: round(ll[b][r] / cnt[b], 3) for r in RANKS}}
        print(f"{b}: {best} ({cnt[b]} moves)  " + "  ".join(f"{r[5:]} {ll[b][r] / cnt[b]:.3f}" for r in RANKS))
    json.dump(out, open(sys.argv[1] + ".rankest.json", "w"), indent=1)

if __name__ == "__main__":
    main()
