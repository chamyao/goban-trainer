import json, random, sys
sys.path.insert(0, "../kgs"); import prep
games = [json.loads(l) for l in open("../kg/anchor5.jsonl")]
random.Random(7).shuffle(games)
pos = []
for g in games:
    rec = g["record"]
    for st in (60, 140, 220):
        if len(rec) > st + 10 and len([p for p in pos if p["st"] == st]) < 40: pos.append({"st": st, "moves": rec[:st]})
M = {}
for l in open("meas.jsonl"):
    r = json.loads(l); M[(r["net"], r["i"])] = r["score"]
COLS = "ABCDEFGHJKLMNOPQRST"
out = []
for i in [0, 1, 40, 41, 80, 81, 100, 119]:
    p = pos[i]; b = [0] * 361; hist = []
    for col, mv in p["moves"]:
        c = 1 if col == "B" else -1
        if mv == "pass": hist.append({"x": -1, "y": -1, "player": "black" if c == 1 else "white"}); continue
        x = COLS.index(mv[0]); y = 19 - int(mv[1:]); prep.play(b, y * 19 + x, c)
        hist.append({"x": x, "y": y, "player": "black" if c == 1 else "white"})
    grid = [[1 if b[r * 19 + c] == 1 else 2 if b[r * 19 + c] == -1 else 0 for c in range(19)] for r in range(19)]
    nxt = "black" if len(p["moves"]) % 2 == 0 else "white"
    out.append({"i": i, "st": p["st"], "grid": grid, "hist": hist[-8:], "next": nxt, "raw": M.get(("b15-raw", i)), "v200": M.get(("b15-200v", i)), "teacher": M.get(("b18-teacher", i))})
json.dump(out, open("probe.json", "w")); print(len(out))
