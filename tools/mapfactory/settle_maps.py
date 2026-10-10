"""Settle the wanderers of maps already built (wander.py), without rebuilding them: for Books 1-3, whose maps are kept
as they are (their generator, layout.py, has moved on, so a rebuild would change their layout).

    python3 tools/mapfactory/settle_maps.py            # every world with a region.json
    python3 tools/mapfactory/settle_maps.py --world 1

Each cramped wanderer moves to the nearest roomy tile (or stands still) in the map.json, and the same person is moved in
each kit's tmj in place: nothing else in either file changes. New builds settle their own (both builders call
wander.settle), and compile fails a map that still has one.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "tools"), str(ROOT / "tools/mapfactory")]
import wander  # noqa: E402
from compile import Kit  # noqa: E402

KITS = ("xianxia", "jade", "genshin")


def settle_world(n):
    src = ROOT / f"data/tk_maps/w{n}"
    for p in json.loads((src / "region.json").read_text())["places"]:
        m = json.loads((src / p["map"]).read_text())
        if not wander.cramped(m):
            continue
        moved = wander.settle(m)
        (src / p["map"]).write_text(json.dumps(m, ensure_ascii=False, indent=1))
        people = {x["id"]: x for x in m["npcs"]}
        for k in KITS:
            f = src / k / f"{p['id']}.tmj"
            if not f.exists():
                continue
            T = Kit(k).T
            t = json.loads(f.read_text())
            for o in t["layers"][-1]["objects"]:
                if o["type"] == "npc" and o["name"] in moved:
                    q = people[o["name"]]
                    o["x"], o["y"] = round(q["x"] * T, 2), round(q["y"] * T, 2)
                    for pr in o.get("properties", []):
                        if pr["name"] == "wander":
                            pr["value"] = bool(q.get("wander"))
            f.write_text(json.dumps(t, ensure_ascii=False, separators=(",", ":")))
        print(f"w{n} {p['id']}: " + ", ".join(f"{k} {a}->{b or 'stands still'}" for k, (a, b) in moved.items()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--world", type=int)
    a = ap.parse_args()
    worlds = [a.world] if a.world else sorted(int(d.name[1:]) for d in (ROOT / "data/tk_maps").glob("w*") if (d / "region.json").exists())
    for n in worlds:
        settle_world(n)


if __name__ == "__main__":
    main()
