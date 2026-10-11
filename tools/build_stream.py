"""Stream mode's problem pool (app.js viewStream): life-and-death problems at every grade from 15K to 3D, each
with its grade's rank, for the site to deal by the same rating the game keeps (tk.js TKElo). KataGo-clean first
in each grade, then ones not vetted yet; never a rejected one (data/tk_vetted.json, tools/vet_tsumego.mjs).

    python3 tools/build_stream.py      -> data/stream.json  [[book, id, rank, null, clean], ...] (the 4th, kinds, as the game's typed pools: none)
"""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRADES = [f"{k}K{p}" for k in range(15, 0, -1) for p in ("", "+")] + [f"{d}D{p}" for d in range(1, 8) for p in ("", "+")]
RANK = {g: i for i, g in enumerate(GRADES)}
TSUMEGO = {"死活题", "Life & Death"}
PER_GRADE = 150

VETTED = json.loads((ROOT / "data" / "tk_vetted.json").read_text())


def main():
    rng = random.Random(20261011)
    by_grade = {}
    for b in json.loads((ROOT / "data" / "index.json").read_text()):
        for p in json.loads((ROOT / "data" / "books" / f"{b['id']}.json").read_text())["problems"]:
            if p.get("qt") not in TSUMEGO or p.get("lv") not in RANK or RANK[p["lv"]] > RANK["3D"]:
                continue
            if not any(l[0] == 1 and len(l) > 1 for l in p.get("lines", [])):   # a real answer key
                continue
            v = VETTED.get(f"{b['id']}/{p['id']}")
            if v is not None and not v["ok"]:
                continue
            by_grade.setdefault(RANK[p["lv"]], []).append([b["id"], p["id"], RANK[p["lv"]], None, 1 if v else 0])
    out = []
    for r in sorted(by_grade):
        xs = by_grade[r]
        rng.shuffle(xs)
        xs.sort(key=lambda x: -x[4])
        out += xs[:PER_GRADE]
    (ROOT / "data" / "stream.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    clean = sum(x[4] for x in out)
    print(f"stream: {len(out)} problems over {len(by_grade)} grades, {clean} KataGo-clean")


if __name__ == "__main__":
    main()
