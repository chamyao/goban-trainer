# top-move accuracy on each pro's held-out games, by step; and push status
cd ~/goban; tail -3 styles2.log; python3 - <<'PY'
import json
for s in ["takemiya","kato","chochikun","otake","kitani","sakata","goseigen"]:
    rs = [json.loads(l) for l in open(f"styles2/{s}/log.jsonl")]
    print(f"{s:10s} " + " ".join(f"{r['step']}:{100*r['val_acc']:.1f}" for r in rs))
PY
ls ck/styles2 | wc -l; df -h ~ | tail -1
