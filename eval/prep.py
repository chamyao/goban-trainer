"""KGS SGF games -> training positions (numpy), for the site's own Go network.

Per position (from the main line of a 19x19 game; handicap stones, komi and the side to move kept):
  board  int8[361]  +l black / -l white, l = the group's liberties capped at 3 (0 empty)
  ko     int16      the ko point or -1
  last   int16[4]   the last four moves (newest first; -1 none, 361 pass)
  black  int8       1 if Black is to move
  komi   float32
  move   int16      the move played (0..360, 361 pass)
  win    int8       +1 if the side to move won, -1 lost, 0 unknown
  hcap   int8       the game's handicap

    python3 prep.py OUT.npz SGF_DIR [KEEP=0.5]
"""
import os, re, sys, random
import numpy as np
from multiprocessing import Pool

N = 19
NB = [[] for _ in range(N * N)]
for i in range(N * N):
    r, c = divmod(i, N)
    if r > 0: NB[i].append(i - N)
    if r < N - 1: NB[i].append(i + N)
    if c > 0: NB[i].append(i - 1)
    if c < N - 1: NB[i].append(i + 1)

def group(b, i):
    col, seen, libs, st = b[i], {i}, set(), [i]
    while st:
        j = st.pop()
        for k in NB[j]:
            v = b[k]
            if v == 0: libs.add(k)
            elif v == col and k not in seen: seen.add(k); st.append(k)
    return seen, libs

def play(b, i, col):   # returns the ko point (or -1); raises on an illegal move
    if b[i] != 0: raise ValueError("occupied")
    b[i] = col
    caps = []
    for k in NB[i]:
        if b[k] == -col:
            g, l = group(b, k)
            if not l:
                for j in g: b[j] = 0
                caps.extend(g)
    g, l = group(b, i)
    if not l: raise ValueError("suicide")
    return caps[0] if len(caps) == 1 and len(g) == 1 and len(l) == 1 else -1

def libboard(b):
    out = np.zeros(N * N, np.int8); done = set()
    for i in range(N * N):
        if b[i] and i not in done:
            g, l = group(b, i); v = min(len(l), 3) * b[i]
            for j in g: out[j] = v
            done |= g
    return out

def pt(s):
    if len(s) != 2 or s == "tt": return 361
    c, r = ord(s[0]) - 97, ord(s[1]) - 97
    return 361 if not (0 <= c < N and 0 <= r < N) else r * N + c

PROP = re.compile(r"(AB|AW|SZ|KM|RE|HA|B|W)((?:\s*\[[^\]]*\])+)")
def parse(text):
    nodes = text.split(";")[1:]
    root = {}
    moves = []
    for k, (n) in enumerate(nodes):
        if "(" in n and k > 0 and moves and n.strip().startswith("("): break
        for key, vals in PROP.findall(n):
            vs = re.findall(r"\[([^\]]*)\]", vals)
            if key in ("B", "W") and k > 0: moves.append((1 if key == "B" else -1, pt(vs[0])))
            elif k == 0: root.setdefault(key, []).extend(vs)
    return root, moves

def game(args):
    path, keep, seed = args
    rnd = random.Random(seed)
    try:
        root, moves = parse(open(path, encoding="utf-8", errors="replace").read())
        if root.get("SZ", ["19"])[0] != "19" or len(moves) < 30: return None
        komi = float((root.get("KM") or ["0"])[0] or 0)
        re_ = (root.get("RE") or [""])[0].upper()
        winner = 1 if re_.startswith("B+") else -1 if re_.startswith("W+") else 0
        hcap = int((root.get("HA") or ["0"])[0] or 0)
        b = [0] * (N * N)
        for s in root.get("AB", []): b[pt(s)] = 1 if pt(s) < 361 else 0
        for s in root.get("AW", []): b[pt(s)] = -1 if pt(s) < 361 else 0
        ko, hist, out = -1, [], []
        for col, mv in moves:
            if rnd.random() < keep:
                last = (hist[::-1] + [-1] * 4)[:4]
                out.append((libboard(b), ko, last, 1 if col == 1 else 0, komi, mv, winner * col, hcap))
            if mv == 361: ko = -1
            else: ko = play(b, mv, col)
            hist.append(mv)
        return out
    except Exception:
        return None

def main():
    out, d = sys.argv[1], sys.argv[2]
    keep = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    files = sorted(os.path.join(r, f) for r, _, fs in os.walk(d) for f in fs if f.endswith(".sgf"))
    rows = []
    with Pool(4) as p:
        for i, g in enumerate(p.imap_unordered(game, [(f, keep, i) for i, f in enumerate(files)], chunksize=64)):
            if g: rows.extend(g)
            if i % 5000 == 0: print(i, len(rows), flush=True)
    random.Random(1).shuffle(rows)
    np.savez(out, board=np.stack([r[0] for r in rows]), ko=np.array([r[1] for r in rows], np.int16),
             last=np.array([r[2] for r in rows], np.int16), black=np.array([r[3] for r in rows], np.int8),
             komi=np.array([r[4] for r in rows], np.float32), move=np.array([r[5] for r in rows], np.int16),
             win=np.array([r[6] for r in rows], np.int8), hcap=np.array([r[7] for r in rows], np.int8))
    print("positions", len(rows))

if __name__ == "__main__":
    main()
