"""Undo a rebuild's drift in one world, so only what the change touched is committed (places-playbook.md, "Drift").

    python3 tools/mapfactory/keep_drift.py --world 15

A rebuild re-rolls two things that didn't change:
  - each beat's problem picks in region.json (pool, pool_easy, problems): put back as committed, for every beat key that
    was there before (a new beat keeps its new picks);
  - the overworld (its seed is random): overworld.map.json and every kit's overworld.tmj, put back as committed.
Run it after `python3 -m tools.mapfactory all ...` and before `git add`.
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
KEEP = ("pool", "pool_easy", "problems", "problem")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--world", type=int, required=True)
    ap.add_argument("--rev", default="HEAD", help="what to keep (default: the last commit)")
    a = ap.parse_args()
    d = f"data/tk_maps/w{a.world}"
    ow = [f"{d}/overworld.map.json"] + [str(p.relative_to(ROOT)) for p in (ROOT / d).glob("*/overworld.tmj")]
    subprocess.run(["git", "checkout", a.rev, "--", *ow], cwd=ROOT, check=True)
    old = json.loads(subprocess.run(["git", "show", f"{a.rev}:{d}/region.json"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    path = ROOT / d / "region.json"
    new = json.loads(path.read_text())
    before = {q["node"]: q for q in old["quests"]}
    kept = 0
    for q in new["quests"]:
        o = before.get(q["node"])
        for k in KEEP if o else ():
            if k in o and k in q and q[k] != o[k]:
                q[k] = o[k]
                kept += 1
    path.write_text(json.dumps(new, ensure_ascii=False, indent=1))
    print(f"w{a.world}: overworld as at {a.rev}; {kept} problem picks kept")


if __name__ == "__main__":
    main()
