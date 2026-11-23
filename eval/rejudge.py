"""A fresh test of one checkpoint with evalwatch.py's method (momentum steps, all-games rating).
    python3 rejudge.py CKPT START_KYU OUT.jsonl"""
import json, sys, time
import arena, evalwatch as E
ck, k, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
bot = arena.bot_spec(f"own:{ck}"); games = []; prior, step, last = arena.rank_val(k), 2, None
for g in range(E.GAMES):
    t = time.time()
    r = arena.play(bot, k, g % 2 == 0, 777000 + g)
    r.update({"ckpt": ck, "game": g, "rank": arena.rank_name(k), "rv": arena.rank_val(k), "bot_black": g % 2 == 0, "secs": round(time.time() - t)})
    with open(out + ".games.jsonl", "a") as f: f.write(json.dumps(r) + "\n")
    games.append({x: v for x, v in r.items() if x != "record"})
    won = r["winner"] == "bot"
    if last is not None: step = min(4, step * 2) if won == last else max(1, step // 2)
    last = won; k = arena.step(k, step if won else -step)
m, sd = E.estimate(games, prior)
rec = {"ckpt": ck, "est": arena.val_name(m), "est_rv": round(m, 2), "sd_ranks": round(sd, 1), "games": [(x["rank"][5:], x["winner"]) for x in games]}
open(out, "a").write(json.dumps(rec) + "\n"); print(json.dumps(rec))
