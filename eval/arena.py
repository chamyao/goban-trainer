"""Calibrate the Play-tab bots (aiplay.js) against KataGo's human-SL model at set ranks.

Bot side: the site's own network (engine/katago-small.bin.gz) searched by native KataGo's analysis engine at the
level's visits, with aiplay.js's move choice ported as is (near-best by win-rate slack; levels pick at random,
avatars by style fit + random*0.4; a pass after the opponent's pass when nothing is left to gain).
Reference side: b18c384nbt-humanv0 with humanSLProfile=rank_<R> (moves sampled from the human policy, as in
KataGo's gtp_human5k_example.cfg). 19x19, Chinese, komi 7.5. A staircase per bot: a win moves the reference up,
a loss down; the ranks it settles around are the bot's strength.

    python3 arena.py BOT START_RANK GAMES OUT.jsonl     (rank: 10 = 10k, -1 = 1d ... in "kyu" numbers, 0 unused)
"""
import json, math, os, random, subprocess, sys, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
SMALL = "/home/user/goban-trainer/engine/katago-small.bin.gz"
COLS = "ABCDEFGHJKLMNOPQRST"
SZ = 19

LEVELS = {"easy": (12, 0.12), "medium": (60, 0.04), "strong": (400, 0.0)}
STYLES = {"fighter": 0.04, "territory": 0.04, "influence": 0.04, "solid": 0.035, "trickster": 0.04, "wild": 0.07, "calm": 0.01}
# overrides for tuning runs: BOT=name:visits:slack[:style]
def bot_spec(name):
    p = name.split(":")
    if p[0] == "own": return {"name": name, "own": p[1], "temp": float(p[2]) if len(p) > 2 else 0.0, "visits": 0, "slack": 0, "style": None}
    if p[0] in ("rank", "pick", "frac"): return {"name": name, p[0]: float(p[1]), "visits": 1, "slack": 0, "style": None}
    if len(p) >= 3: return {"name": name, "visits": int(p[1]), "slack": float(p[2]), "style": p[3] if len(p) > 3 else None}
    if name in LEVELS: return {"name": name, "visits": LEVELS[name][0], "slack": LEVELS[name][1], "style": None}
    return {"name": name, "visits": 80, "slack": STYLES[name], "style": name}

def rank_name(k): return f"rank_{k}k" if k > 0 else f"rank_{-k}d"
def step(k, d):   # move d ranks stronger (d>0) on the 20k..1k,1d..9d ladder
    i = (20 - k) if k > 0 else 19 + (-k)          # 20k->0 ... 1k->19, 1d->20 ... 9d->28
    i = max(0, min(28, i + d))
    return 20 - i if i <= 19 else -(i - 19)
def rank_val(k): return (20 - k) if k > 0 else 19 + (-k)   # a number to average (1k=19, 1d=20)
def val_name(v): return f"{20 - v:.1f}k" if v < 19.5 else f"{v - 19:.1f}d"

def gtp_coord(x, y): return "pass" if x < 0 else f"{COLS[x]}{SZ - y}"
def parse_coord(s):
    s = s.strip().upper()
    if s in ("PASS", "RESIGN"): return None
    return COLS.index(s[0]), SZ - int(s[1:])

# the reference's search: its moves are drawn from the human policy (humanSLChosenMoveProp 1, PiklLambda huge), so
# the search barely changes them; evalwatch.py sets 1 to save CPU while training runs (None: ref.cfg's 40)
REF_VISITS = None

class GTP:
    def __init__(self, rank):
        self.p = subprocess.Popen([f"{HERE}/katago", "gtp", "-config", f"{HERE}/ref.cfg", "-model", SMALL, "-human-model", f"{HERE}/human.bin.gz",
                                   "-override-config", f"humanSLProfile={rank_name(rank)},logDir=,logToStderr=false,numSearchThreads=1,delayMoveScale=0,delayMoveMax=0,lagBuffer=0" + (f",maxVisits={REF_VISITS}" if REF_VISITS else "")],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
    def cmd(self, c):
        self.p.stdin.write(c + "\n"); self.p.stdin.flush()
        out = []
        while True:
            l = self.p.stdout.readline()
            if l == "": raise RuntimeError("gtp died")
            if l.strip() == "" and out: break
            if l.strip() == "" : continue
            out.append(l.rstrip("\n"))
        r = "\n".join(out)
        if r.startswith("?"): raise RuntimeError(f"gtp {c}: {r}")
        return r[1:].strip() if r.startswith("=") else r
    def grid(self):
        lines = self.cmd("showboard").split("\n")
        g = [[0] * SZ for _ in range(SZ)]
        for l in lines:
            t = l[:2].strip()
            if not t.isdigit(): continue
            y = SZ - int(t)
            for x in range(SZ):
                ch = l[3 + 2 * x] if len(l) > 3 + 2 * x else "."
                g[y][x] = 1 if ch == "X" else 2 if ch == "O" else 0
        return g
    def close(self):
        try: self.cmd("quit")
        except Exception: pass
        self.p.kill()

class Analyzer:
    def __init__(self):
        self.p = subprocess.Popen([f"{HERE}/katago", "analysis", "-config", f"{HERE}/bin/analysis_example.cfg", "-model", SMALL,
                                   "-override-config", "numAnalysisThreads=1,numSearchThreadsPerAnalysisThread=1,logDir=,logToStderr=false,reportAnalysisWinratesAs=SIDETOMOVE,nnCacheSizePowerOfTwo=18"],
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
        self.n = 0
    def query(self, moves, visits, policy=False):
        self.n += 1
        q = {"id": str(self.n), "moves": moves, "initialStones": getattr(self, "setup", []), **({"initialPlayer": "W"} if getattr(self, "setup", []) else {}), "rules": "chinese", "komi": getattr(self, "komi", 7.5), "boardXSize": SZ, "boardYSize": SZ, "maxVisits": visits, "includePolicy": policy}
        self.p.stdin.write(json.dumps(q) + "\n"); self.p.stdin.flush()
        while True:
            l = self.p.stdout.readline()
            if l == "": raise RuntimeError("analysis died")
            r = json.loads(l)
            if r.get("id") == str(self.n): return r
    def close(self): self.p.kill()

def ai_fit(style, grid, me, x, y, rank):   # aiplay.js aiFit, as is
    line = min(x, y, SZ - 1 - x, SZ - 1 - y) + 1
    d_opp = d_own = 99
    for r in range(max(0, y - 3), min(SZ - 1, y + 3) + 1):
        for c in range(max(0, x - 3), min(SZ - 1, x + 3) + 1):
            v, d = grid[r][c], max(abs(c - x), abs(r - y))
            if v == 3 - me: d_opp = min(d_opp, d)
            elif v == me: d_own = min(d_own, d)
    if style == "fighter": return 3 if d_opp == 1 else 1.5 if d_opp == 2 else 0.5 if d_opp == 3 else 0
    if style == "territory": return (2 if line == 3 else 1.5 if line == 2 else 0.5 if line == 4 else -1) + (0.5 if min(x, SZ - 1 - x) < 6 and min(y, SZ - 1 - y) < 6 else 0)
    if style == "influence": return 2 if line >= 5 else 1.5 if line == 4 else 0 if line == 3 else -2
    if style == "solid": return 2.5 if d_own == 1 else 1 if d_own == 2 else 0
    if style == "trickster": return min(rank, 3)
    if style == "wild": return random.random() * 2
    return -rank

def katrain_n(kyu, legal):   # KaTrain's ai:rank calibration (katrain/core/ai.py): how many random legal moves to draw
    sq = SZ * SZ
    orig = 0.063015 + 0.7624 * sq / (10 ** (-0.05737 * kyu + 1.9482))
    nl = legal / sq
    mod = (0.3931 + 0.6559 * nl * math.exp(-1 * (3.002 * nl * nl - nl - 0.034889 * kyu - 0.5097) ** 2) - 0.01093 * kyu) * orig
    return max(1, round(sq * nl / (1.31165 * (mod + 1) - 0.082653)))

def pick_move(an, bot, moves):   # draw n random legal moves, play the one the policy likes most
    a = an.query(moves, 1, policy=True)
    pol = a["policy"]
    if max(range(len(pol)), key=lambda i: pol[i]) == SZ * SZ: return "pass"
    legal = [i for i in range(SZ * SZ) if pol[i] >= 0]
    if not legal: return "pass"
    n = int(bot["pick"]) if "pick" in bot else max(1, round(bot["frac"] * len(legal))) if "frac" in bot else katrain_n(bot["rank"], len(legal))
    i = max(random.sample(legal, min(n, len(legal))), key=lambda i: pol[i])
    return f"{COLS[i % SZ]}{SZ - i // SZ}"

def bot_move(an, bot, moves, grid, me):
    if "pick" in bot or "rank" in bot or "frac" in bot: return pick_move(an, bot, moves)
    a = an.query(moves, bot["visits"])
    infos = sorted(a.get("moveInfos", []), key=lambda m: m["order"])[:8]   # (topK 8, as the site asks)
    root = a["rootInfo"]["winrate"]
    if not infos or infos[0]["move"] == "pass": return "pass"
    legal = [m for m in infos if m["move"] != "pass"]
    best = legal[0]["winrate"]
    near = [m for m in legal if best - m["winrate"] <= bot["slack"]]
    if bot["style"] or bot["name"] in STYLES:
        st = bot["style"] or "calm"; top, pick = -1e9, None
        for m in near:
            x, y = parse_coord(m["move"])
            f = ai_fit(st, grid, me, x, y, legal.index(m)) + random.random() * 0.4
            if f > top: top, pick = f, m
    else:
        pick = random.choice(near) if near else legal[0]
    pick = pick or legal[0]
    last_pass = moves and moves[-1][1] == "pass"
    if last_pass and abs(pick["winrate"] - root) < 0.01 and root > 0.5: return "pass"
    return pick["move"]

def play(bot, rank, bot_black, seed, hcap=0):
    random.seed(seed)
    ref, an = GTP(rank), Analyzer()
    own = None
    if "own" in bot:
        import ownbot; own = ownbot.OwnBot(bot["own"], bot["temp"])
    komi = 0.5 if hcap >= 2 else 7.5
    try:
        for c in ("boardsize 19", "clear_board", f"komi {komi}", "kata-set-rules chinese"): ref.cmd(c)
        setup = []
        if hcap >= 2: setup = [s for s in ref.cmd(f"fixed_handicap {hcap}").split()]
        an.setup, an.komi = [["B", s] for s in setup], komi
        moves, passes, n = [], 0, 0
        me = 1 if bot_black else 2
        while True:
            black = (len(moves) % 2 == 0) != bool(setup)
            col = "B" if black else "W"
            if black == bot_black:
                if own:
                    import ownbot
                    i = own.genmove([(1, ownbot.to_idx(s)) for s in setup], [(1 if c == "B" else -1, ownbot.to_idx(m)) for c, m in moves], komi)
                    mv = ownbot.to_gtp(i)
                else: mv = bot_move(an, bot, moves, ref.grid(), me)
                try: ref.cmd(f"play {col} {mv}")
                except RuntimeError: mv = "pass"; ref.cmd(f"play {col} pass")
            else:
                mv = ref.cmd(f"genmove {col}")
                if mv.lower() == "resign": return {"winner": "bot", "how": "resign", "moves": len(moves), "record": moves}
            moves.append([col, mv])
            passes = passes + 1 if mv.lower() == "pass" else 0
            if passes >= 2 or len(moves) >= 400: break
            # a lopsided game: settled early by the reference's count
            if len(moves) >= 220 and len(moves) % 40 == 0:
                s = ref.cmd("final_score")
                if s != "0" and float(s[2:]) >= 50: break
        s = ref.cmd("final_score")
        w = "B" if s.startswith("B") else "W"
        return {"winner": "bot" if (w == "B") == bot_black else "ref", "how": s, "moves": len(moves), "record": moves}
    finally:
        ref.close(); an.close()

def staircase(name, start, games, out, hcap=0):
    bot = bot_spec(name)
    k = start
    for g in range(games):
        d = 3 if g < 3 else 2 if g < 6 else 1
        t = time.time()
        r = play(bot, k, g % 2 == 0 if not hcap else hcap > 0, hash((name, g)) & 0xffff, abs(hcap))
        r.update({"hcap": hcap, "bot": name, "game": g, "rank": rank_name(k), "rv": rank_val(k), "bot_black": g % 2 == 0, "secs": round(time.time() - t)})
        with open(out, "a") as f: f.write(json.dumps(r) + "\n")
        print(json.dumps({k: v for k, v in r.items() if k != "record"}), flush=True)
        k = step(k, d if r["winner"] == "bot" else -d)

if __name__ == "__main__":
    # optional 5th: handicap H (>0: the bot takes Black with H stones; <0: the bot is White giving H)
    staircase(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], int(sys.argv[5]) if len(sys.argv) > 5 else 0)
