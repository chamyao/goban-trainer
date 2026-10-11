"""Handoffs leave the new lead a walk: every handoff in a built book, where the new lead starts (a named spot: 26 px
below it, as tk-world places them; none: where the scene played, its beat's spot), and how far that is from the next
beat's spot when that is on the same map. The house rule is 6 tiles (Testing). Exits 1 if any is under.

    python3 tools/proofs/handoffs.py 21        # a book's world (its story from data/tk.json, its built maps)
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
n = int(sys.argv[1]) if len(sys.argv) > 1 else 21
W = next(w for w in json.loads((ROOT / "data/tk.json").read_text())["worlds"] if w["n"] == n)
region = json.loads((ROOT / f"data/tk_maps/w{n}/region.json").read_text())
maps = {p["id"]: json.loads((ROOT / f"data/tk_maps/w{n}/{p['map']}").read_text()) for p in region["places"] if p["id"] != "overworld"}
q = {x["node"]: x for x in region["quests"]}
order = [nd["key"].split("-", 1)[1] for nd in W["nodes"]]
cuts = json.loads((ROOT / f"data/tk_maps/w{n}/cutscenes.json").read_text())["scenes"]


def lead_end(scene):
    """Where the scene's lead (its party's first) stands at its end: the last cut, appear or walk that moves them."""
    sc = cuts.get(scene)
    if not sc or not sc.get("party"):
        return None
    lead, at = sc["party"][0], None

    def visit(beats):
        nonlocal at
        for b in beats:
            for pl in b.get("place") or []:
                if pl.get("actor") == lead:
                    at = tuple(pl["at"])
            if b.get("actor") == lead and b.get("path"):
                at = tuple(b["path"][-1])
            if b.get("beats"):
                visit(b["beats"])
    visit(sc["beats"])
    return at


def spot(mid, sid): return next((s for s in maps[mid]["spots"] if s["id"] == sid), None)
def place_id(name): return next((p["id"] for p in region["places"] if p["id"] == name or p["name"] == name), None)
bad = 0
for i, key in enumerate(order[:-1]):
    nd = next(x for x in W["nodes"] if x["key"] == f"{n}-{key}")
    nxt = q[f"{n}-{order[i + 1]}"]
    for st in W["scenes"][nd["scene"]]["steps"]:
        if st[0] != "party": continue
        to = st[2].get("to") if len(st) > 2 and isinstance(st[2], dict) else None
        here = q[f"{n}-{key}"]
        if isinstance(to, str):   # {"to": "<beat>"}: the new lead starts at that beat, on purpose (Oh at his own desk)
            print(f"{key} -> {order[i + 1]} ({st[1][0]}): starts at beat {to}'s spot, by design")
            continue
        if to and to.get("spot"):
            mid = place_id(to["place"]); s = spot(mid, to["spot"]) if mid else None
            if not s: print(f"{key}: lands at {to} which doesn't exist"); bad += 1; continue
            at, how = (s["x"], s["y"] + 26 / 16), f"spot {to['spot']}"
        elif to:
            continue   # arriving by an entry ("from"): the walk from the edge
        else:
            # no landing spot: the new lead is set down where the scene left the lead (in a room, scenes.py stages every
            # scene in the middle of the floor, not at its spot): the lead's last place in the staged cutscene
            mid = here["place"]
            at, how = lead_end(nd["scene"]), "where the scene left the lead"
            if at is None:
                s = spot(mid, here["spot"]); at, how = (s["x"], s["y"]), "at the beat's spot (no cutscene)"
        if nxt["place"] != mid: continue
        t = spot(mid, nxt["spot"]); d = math.dist(at, (t["x"], t["y"]))
        flag = "  <-- under 6" if d < 6 else ""
        bad += d < 6
        print(f"{key} -> {order[i + 1]} ({', '.join(st[1])}) in {mid}: {how}, {d:.1f} tiles{flag}")
print("under 6:", bad)
sys.exit(1 if bad else 0)
