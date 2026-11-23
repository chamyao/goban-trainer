# per-pro dataset sizes (positions in train / held-out files), and progress
cd ~/goban; python3 - <<'PY'
import numpy as np
for s in ["takemiya","kato","chochikun","otake","kitani","sakata","goseigen"]:
    t = np.load(f"pro/{s}-train.npz"); v = np.load(f"pro/{s}-val.npz")
    print(f"{s:10s} train {len(t['move']):7d}  val {len(v['move']):6d}")
PY
ls pro/ | head -30; cat pro/*.txt pro/*.log 2>/dev/null | tail -20; tail -2 styles2.log
