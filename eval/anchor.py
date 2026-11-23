"""A checkpoint against one fixed reference setting (the user: "on terms with the kata human 5k"): N games,
colors alternating, against KataGo's human-SL model at rank KYU (5 = the "5k" setting; OGS's 5k-kgs-humanlike-kata
is rated ~6.3k). Prints the running win rate.   python3 anchor.py CKPT KYU GAMES OUT.jsonl"""
import json, math, sys, time
import arena
arena.REF_VISITS = 1
ck, kyu, n, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
bot = arena.bot_spec(f"own:{ck}")
prev = [json.loads(l) for l in open(out)] if __import__("os").path.exists(out) else []
prev = [r for r in prev if r["ckpt"] == ck and r["kyu"] == kyu]; w = sum(r["winner"] == "bot" for r in prev)   # (resume after a restart)
for g in range(len(prev), n):
    t = time.time(); r = arena.play(bot, kyu, g % 2 == 0, 555000 + g)
    r.update({"ckpt": ck, "kyu": kyu, "game": g, "bot_black": g % 2 == 0, "secs": round(time.time() - t)})
    open(out, "a").write(json.dumps(r) + "\n"); w += r["winner"] == "bot"; p = w / (g + 1)
    print(f"{g}: {'won' if r['winner'] == 'bot' else 'lost'} as {'B' if g % 2 == 0 else 'W'}  ->  {w}/{g + 1} = {p:.0%} ± {math.sqrt(max(p * (1 - p), 0.05) / (g + 1)):.0%}", flush=True)
