"""One pro's games (CWI collection) -> positions where that pro is to move (prep.py's format), split by game into
train / held-out (every 10th game).   python3 proprep.py "Takemiya Masaki" OUTPREFIX CWI_DIR"""
import os, re, sys, random
import numpy as np
import prep

def rows_for(path, name):
    t = open(path, encoding="utf-8", errors="replace").read()
    pb = re.search(r"PB\[([^\]]*)\]", t); pw = re.search(r"PW\[([^\]]*)\]", t)
    me = 1 if pb and pb.group(1).strip().startswith(name) else -1 if pw and pw.group(1).strip().startswith(name) else 0
    if not me: return None
    g = prep.game((path, 1.0, 0))
    if not g: return None
    return [r for r in g if (1 if r[3] == 1 else -1) == me]

def save(rows, out):
    np.savez(out, board=np.stack([r[0] for r in rows]), ko=np.array([r[1] for r in rows], np.int16), last=np.array([r[2] for r in rows], np.int16),
             black=np.array([r[3] for r in rows], np.int8), komi=np.array([r[4] for r in rows], np.float32), move=np.array([r[5] for r in rows], np.int16),
             win=np.array([r[6] for r in rows], np.int8), hcap=np.array([r[7] for r in rows], np.int8))

name, out, d = sys.argv[1], sys.argv[2], sys.argv[3]
files = sorted(os.path.join(r, f) for r, _, fs in os.walk(d) for f in fs if f.endswith(".sgf"))
tr, va, ng = [], [], 0
for f in files:
    rs = rows_for(f, name)
    if not rs: continue
    (va if ng % 10 == 9 else tr).extend(rs); ng += 1
random.Random(1).shuffle(tr)
save(tr, out + "-train.npz"); save(va, out + "-val.npz")
print(name, "games", ng, "train", len(tr), "val", len(va))
