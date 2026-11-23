import numpy as np, sys
a, b = np.load(sys.argv[1]), np.load(sys.argv[2])
n = len(a["move"]) + len(b["move"]); p = np.random.default_rng(7).permutation(n)
out = {k: np.concatenate([a[k], b[k]])[p] for k in a.files}
np.savez(sys.argv[3], **out); print("merged", n, "kgs", len(a["move"]), "pro", len(b["move"]))
