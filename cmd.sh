# rebuild without one huge .npz: per-array .npy files in a folder (a >4 GB npz came out unreadable here)
cd ~/goban
pkill -f run2.sh; rm -f cwi6.npz mix2.tmp.npz
# train.py: DATA may be a folder of <key>.npy files
python3 - <<'PY'
s = open("train.py").read()
o = '    d = dict(np.load(a.data))'
if o in s and "os.path.isdir(a.data)" not in s:
    s = s.replace(o, '    d = {f[:-4]: np.load(os.path.join(a.data, f)) for f in os.listdir(a.data) if f.endswith(".npy")} if os.path.isdir(a.data) else dict(np.load(a.data))   # (a folder of .npy: very large sets)')
    open("train.py", "w").write(s); print("train.py: folder data ok")
PY
# prep.py: save to a folder when OUT ends with /
python3 - <<'PY'
s = open("prep.py").read()
o = '    np.savez(out, board='
if o in s and "endswith(\"/\")" not in s:
    s = s.replace(o, '    if out.endswith("/"):\n        os.makedirs(out, exist_ok=True)\n        for k, v in dict(board=np.stack([r[0] for r in rows]), ko=np.array([r[1] for r in rows], np.int16), last=np.array([r[2] for r in rows], np.int16), black=np.array([r[3] for r in rows], np.int8), komi=np.array([r[4] for r in rows], np.float32), move=np.array([r[5] for r in rows], np.int16), win=np.array([r[6] for r in rows], np.int8), hcap=np.array([r[7] for r in rows], np.int8)).items(): np.save(os.path.join(out, k + ".npy"), v)\n        print("positions", len(rows)); return\n' + o)
    open("prep.py", "w").write(s); print("prep.py: folder output ok")
PY
nohup sh -c 'python3 prep.py cwi6/ cwi 0.6 > cwi6.log 2>&1 && python3 - > mix2.log 2>&1 <<"PY"
import numpy as np, os
a, b = np.load("kgs.npz"), np.load("kgs2.npz"); c = {f[:-4]: np.load("cwi6/" + f) for f in os.listdir("cwi6")}
n = len(a["move"]) + len(b["move"]) + len(c["move"]); perm = np.random.default_rng(11).permutation(n); os.makedirs("mix2", exist_ok=True)
for k in a.files: np.save("mix2/" + k + ".npy", np.concatenate([a[k], b[k], c[k]])[perm])
print("mix2", n, "kgs", len(a["move"]), "kgs2", len(b["move"]), "cwi6", len(c["move"]))
PY
sed -i "s#\[ ! -f mix2.npz \]#[ ! -d mix2 ]#; s#mix2.npz run2#mix2 run2#; s#mix2.npz run3#mix2 run3#; s#train.py mix2.npz#train.py mix2#" run2.sh && sed -i "s#python3 prep.py cwi6.npz cwi 0.6#true#" run2.sh && nohup ./run2.sh > run2.log 2>&1' > rebuild.log 2>&1 &
sleep 3; grep -n "mix2" run2.sh | head -5
