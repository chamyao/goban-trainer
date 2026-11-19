"""Solve every spot in spots.json with pkgen (cargo build --release first) into out/<id>.json. Slow: ~6 min a spot.
Usage: python3 run.py [spot ids...]"""
import json, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(here, "spots.json")))
os.makedirs(os.path.join(here, "out"), exist_ok=True)
want = set(sys.argv[1:])
for sp in S["spots"]:
    if want and sp["id"] not in want: continue
    out = os.path.join(here, "out", sp["id"] + ".json")
    if os.path.exists(out) and not want: continue
    k = S[sp["kind"]]
    lines = [[sp["turn"] if x == "T" else sp["river"] if x == "R" else x for x in l] for l in S.get("lines_" + sp["kind"], S["lines"])]
    spec = {"oop": k["oop"], "ip": k["ip"], "flop": sp["flop"], "pot": k["pot"], "stack": k["stack"], "target": 0.005, "iters": 400, "lines": lines, **S["sizes"]}
    print(sp["id"], "…", flush=True)
    r = subprocess.run([os.path.join(here, "target/release/pkgen")], input=json.dumps(spec), capture_output=True, text=True)
    print(r.stderr.strip(), flush=True)
    if r.returncode == 0: open(out, "w").write(r.stdout)
