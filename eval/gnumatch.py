"""Our network vs GnuGo 3.8 (level 10; OGS's GnuGo bot is rated ~10k): an anchor to real OGS ranks.
    python3 gnumatch.py CKPT GAMES OUT.jsonl     (colors alternate; GnuGo's own count decides; komi 7.5, Chinese)"""
import json, subprocess, sys, time
import ownbot
class GTP:
    def __init__(self):
        self.p = subprocess.Popen(["/usr/games/gnugo", "--mode", "gtp", "--level", "10", "--chinese-rules", "--komi", "7.5"],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
    def cmd(self, c):
        self.p.stdin.write(c + "\n"); self.p.stdin.flush(); out = []
        while True:
            l = self.p.stdout.readline()
            if l == "": raise RuntimeError("gnugo exited")   # (EOF: it died; don't spin)
            if l.strip() == "" and out: break
            if l.strip(): out.append(l.strip())
        r = " ".join(out); return r[1:].strip()
    def close(self): self.p.kill()
ck, games, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
bot = ownbot.OwnBot(ck)
for g in range(games):
    t = time.time(); gg = GTP(); gg.cmd("boardsize 19"); gg.cmd("clear_board")
    bot_black = g % 2 == 0; moves = []; passes = 0
    while len(moves) < 400:
        black = len(moves) % 2 == 0; col = "B" if black else "W"
        if black == bot_black:
            mv = ownbot.to_gtp(bot.genmove([], [(1 if c == "B" else -1, ownbot.to_idx(m)) for c, m in moves], 7.5))
            gg.cmd(f"play {col} {mv}")
        else:
            mv = gg.cmd(f"genmove {col}")
            if mv.lower() == "resign": break
        moves.append([col, mv]); passes = passes + 1 if mv.lower() == "pass" else 0
        if passes >= 2: break
    res = "resign" if moves and len(moves) < 400 and passes < 2 else gg.cmd("final_score")
    if res == "resign": winner = "bot"
    else: winner = "bot" if (res.startswith("B") == bot_black) else "gnugo"
    r = {"ckpt": ck, "game": g, "bot_black": bot_black, "result": res, "winner": winner, "moves": len(moves), "secs": round(time.time() - t), "record": moves}
    open(out, "a").write(json.dumps(r) + "\n"); gg.close()
    print(g, "bot" if bot_black else "gnugo", "black;", res, "->", winner, f"({len(moves)} moves, {r['secs']}s)", flush=True)
