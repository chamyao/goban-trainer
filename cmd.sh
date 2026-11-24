# why NaN: the first lines of the distillation log, and the labels
cd ~/goban; head -5 distill/b22500.log | cut -c1-200
python3 - <<'PY'
import numpy as np
for k in ["t_wr","t_score","t_own","komi","board","last","ko"]:
    a = np.load(f"labels/{k}.npy", mmap_mode="r"); x = np.asarray(a[:200000]).astype(np.float64)
    print(k, a.shape, a.dtype, "nan", int(np.isnan(x).sum()), "min", x.min(), "max", x.max())
PY
