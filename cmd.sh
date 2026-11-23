cd ~/goban
python3 - <<'PY' 2>&1 | tail -5
import numpy as np
parts = [np.load(f) for f in ("kgs.npz", "kgs2.npz", "cwi6.npz")]
print({f: len(p["move"]) for f, p in zip(("kgs", "kgs2", "cwi6"), parts)}, flush=True)
n = sum(len(p["move"]) for p in parts); perm = np.random.default_rng(11).permutation(n)
out = {}
for k in parts[0].files:
    out[k] = np.concatenate([p[k] for p in parts])[perm]
np.savez("mix2.tmp.npz", **out); print("mix2", n, flush=True)
PY
[ -f mix2.tmp.npz ] && mv mix2.tmp.npz mix2.npz && ls -la mix2.npz && nohup ./run2.sh > run2.log 2>&1 &
sleep 60; tail -n 3 run2.log
