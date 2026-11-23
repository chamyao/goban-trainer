# partial curves (own-pro held-out loss by step) from what has finished so far
cd ~/goban; tail -3 styles2.log; python3 - <<'PY'
import json, os
for s in ["takemiya","kato","chochikun","otake","kitani","sakata","goseigen"]:
    f = f"styles2/{s}/log.jsonl"
    if not os.path.exists(f): continue
    rs = [json.loads(l) for l in open(f)]
    if not rs: continue
    b = min(rs, key=lambda r: r["val_pol"])
    print(f"{s:10s} best {b['step']:5d} {b['val_pol']:.4f} | " + " ".join(f"{r['step']}:{r['val_pol']:.4f}" for r in rs))
PY
