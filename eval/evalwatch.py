"""Rank milestones while training runs (the user: "evaluate the milestones interleaved with training, so we don't
get 7 25k bots and 1 9 dan"). Watches RUN for checkpoints at the steps in WANT; for each, a short staircase (8
games) against KataGo's human-SL reference, starting from the last estimate. Writes one line per milestone to OUT
and every game to OUT.games.jsonl. Low priority: one thread each, so training keeps most of the CPU.

    nice -n 10 python3 evalwatch.py RUN OUT.jsonl [FINAL_STEP]
"""
import json, os, sys, time
import arena
arena.REF_VISITS = 1
import math
GAMES = 8
SIGMA = 1.6   # P(win) = 1 / (1 + exp(-(strength - opponent) / SIGMA)): a one-rank edge wins ~65%

def estimate(games, prior, sd=4.0):
    """all the games at once (the user: "momentum ... converge within 8 games"): the posterior over the bot's rank
    value under the logistic model above and a broad prior at the last milestone's rank -> (mean, sd)"""
    grid = [x / 20 for x in range(-200, 701)]   # rank values -10 .. 35 (20k = 0, 1d = 20)
    lp = []
    for th in grid:
        v = -0.5 * ((th - prior) / sd) ** 2
        for g in games:
            p = 1 / (1 + math.exp(-(th - g["rv"]) / SIGMA))
            v += math.log(p if g["winner"] == "bot" else 1 - p)
        lp.append(v)
    m = max(lp); w = [math.exp(v - m) for v in lp]; z = sum(w)
    mean = sum(t * x for t, x in zip(grid, w)) / z
    return mean, math.sqrt(sum((t - mean) ** 2 * x for t, x in zip(grid, w)) / z)

def rank_of(v):   # a rank value (1k = 19, 1d = 20) -> the arena's kyu number (10 = 10k, -1 = 1d)
    v = round(v)
    return 20 - v if v <= 19 else -(v - 19)

def test(run, s, k, out, seed0):
    """one 8-game staircase of checkpoint s from rank k -> its games"""
    ck = os.path.join(run, f"m{s:07d}.pt")
    bot = arena.bot_spec(f"own:{ck}")
    games, k = [], max(-8, min(20, k))
    step, last = 2, None   # PEST: the step doubles after two same results, halves on a change
    for g in range(GAMES):
        t = time.time()
        r = arena.play(bot, k, g % 2 == 0, seed0 + g)
        r.update({"step": s, "game": g, "rank": arena.rank_name(k), "rv": arena.rank_val(k), "bot_black": g % 2 == 0, "secs": round(time.time() - t)})
        games.append({x: v for x, v in r.items() if x != "record"})   # (the record kept in the games file, to replay)
        with open(out + ".games.jsonl", "a") as f: f.write(json.dumps(r) + "\n")
        if r["winner"] == "ref" and k == 20: break   # lost to the weakest reference: below 20k, no more to learn (the user: "fast fail")
        won = r["winner"] == "bot"
        if last is not None: step = min(4, step * 2) if won == last else max(1, step // 2)
        last = won
        k = arena.step(k, step if won else -step)
    return games

def all_games(out, s):   # every recorded game of checkpoint s (evalwatch's, and rejudge.py's re-tests)
    gs = []
    for fn in (out + ".games.jsonl", os.path.join(os.path.dirname(out) or ".", "rejudge.jsonl.games.jsonl")):
        if not os.path.exists(fn): continue
        for l in open(fn):
            r = json.loads(l)
            if r.get("step") == s or str(r.get("ckpt", "")).endswith(f"m{s:07d}.pt"): gs.append(r)
    return gs

def record(out, s, games, prior, tests):
    est, sd = estimate(games, prior)
    rec = {"step": s, "est_rv": round(est, 2), "est": arena.val_name(est), "sd_ranks": round(sd, 1), "games": len(games), "tests": tests,
           "wins": sum(g["winner"] == "bot" for g in games), "lost_to": [g["rank"][5:] for g in games if g["winner"] == "ref"],
           "beat": [g["rank"][5:] for g in games if g["winner"] == "bot"]}
    with open(out, "a") as f: f.write(json.dumps(rec) + "\n")
    print(json.dumps(rec), flush=True)
    return rec

MAX_TESTS = 3   # re-tests of one checkpoint, at most (24 games)

def main():
    """the newest untested checkpoint first (the user: "if the last core is idle might as well eval"); with none
    waiting, a re-test of the milestone with the widest error bar, all its games pooled. One line per result in OUT
    (the last line of a step is its current estimate)."""
    run, out = sys.argv[1], sys.argv[2]
    while True:
        recs = [json.loads(l) for l in open(out)] if os.path.exists(out) else []
        cur = {}
        for r in recs: cur[r["step"]] = r
        cks = sorted(int(f[1:8]) for f in os.listdir(run) if f.startswith("m") and f.endswith(".pt"))
        new = [s for s in cks if s >= 1500 and s not in cur]
        training = os.system("pgrep -f 'train.py mix' >/dev/null") == 0
        if new:
            s = max(new); time.sleep(10)   # (the file finished writing)
            below = [x for x in cur if x < s]
            k = rank_of(cur[max(below)]["est_rv"]) if below else 20
            g = test(run, s, k, out, s * 100)
            record(out, s, g, arena.rank_val(max(-8, min(20, k))), 1)
            continue
        cand = [r for r in cur.values() if r["est_rv"] > 0 and r.get("tests", 1) < MAX_TESTS]
        if cand:
            r = max(cand, key=lambda r: r.get("sd_ranks", 2.0)); s = r["step"]; n = r.get("tests", 1) + 1
            test(run, s, rank_of(r["est_rv"]), out, s * 100 + 10 * n)
            record(out, s, all_games(out, s), r["est_rv"], n)
            continue
        if not training: break
        time.sleep(60)

if __name__ == "__main__":
    main()
