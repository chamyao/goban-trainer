"""Every entered building is entered where its door is drawn.

    python3 tools/proofs/doors.py <world>

A modern front (a storefront, office block, tower, villa, pojangmacha) draws its door at the middle of its south face.
For each door exit in the world's built maps, find the building it belongs to; if its kind is one of those, the exit
must be walked into northward (its side "N") and its trigger must sit on the drawn door: at the footprint's bottom
edge, within half a tile of its middle. apo110: "the entries to the rooms are not always where the door is drawn"
(a villa entered by its west wall, a pojangmacha by its side, storefronts by their roofline).
"""
import glob
import json
import sys

SOUTH_DOOR = {"building.storefront", "building.office_block", "building.office_tower", "building.villa",
              "building.pojangmacha"}

n = sys.argv[1] if len(sys.argv) > 1 else "21"
bad = checked = 0
for f in sorted(glob.glob(f"data/tk_maps/w{n}/*.map.json")):
    m = json.load(open(f))
    for e in m["exits"]:
        if not e.get("door"):
            continue
        cx, cy = e["x"] + e["w"] / 2, e["y"] + e["h"] / 2
        owner = next((o for o in m["objects"] if o.get("kind", "").startswith("building.")
                      and o["x"] - 1 <= cx <= o["x"] + o["w"] + 1 and o["y"] - 1 <= cy <= o["y"] + o["h"] + 1), None)
        if not owner or owner["kind"] not in SOUTH_DOOR:
            continue
        checked += 1
        mid_x, foot = owner["x"] + owner["w"] / 2, owner["y"] + owner["h"]
        ok = e["side"] == "N" and abs(cx - mid_x) <= 0.5 and foot - 1 <= cy <= foot + 0.5
        if not ok:
            bad += 1
            print(f"{m['id']}: the door to {e['to']} ({owner['kind']} {owner.get('id', '')}) is entered from {e['side']} at "
                  f"({cx:.1f}, {cy:.1f}), but its door is drawn at ({mid_x:.1f}, {foot:.1f}) on the south face")
print(f"{checked} doors checked, {bad} not where they're drawn")
sys.exit(1 if bad else 0)
