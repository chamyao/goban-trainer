"""Interiors: a room behind every building's door.

After a place is laid out, each building in it (inn, house, hall, …) gets
an interior map in the same pack-independent format (tk-map/1): a walled
room on a dark surround, furnished for what the building is, with its door
in the middle of the bottom wall. The outdoor map gains a door you walk into
(press against the building's door) and the room an exit back out to the
same spot. Interiors are places of their own in region.json, with a
"parent": they are open whenever their place is.

Who's inside comes from ROOMS in tools/tk_places.py (lines need Chinese in
tools/tk_story_zh.py, like every line the places speak).
"""
import random
from collections import deque

from vocab import KINDS

LEGEND = {"#": "wood", "%": "stone", "&": "mat", "e": "earth", "W": "wall", " ": "void"}
FLOOR = {"wood": "#", "stone": "%", "mat": "&", "earth": "e"}
MIN_W, MIN_H = 20, 12      # at least a screen, so the camera never shows beyond the map

# size inside the walls, floor, and furniture: (kind, where) — where is
# back (against the top wall), left/right (against a side wall), corner,
# centre, or table (a table with stools either side)
TEMPLATES = {
    "building.inn": dict(size=(12, 7), floor="wood", furniture=[
        ("furn.shelf", "back"), ("furn.counter", "back2"), ("furn.barrel", "corner"), ("furn.barrel", "corner"),
        ("furn.jar", "right"), ("furn.table", "table"), ("furn.table", "table"), ("furn.table", "table"), ("furn.plant", "corner")]),
    "building.shop": dict(size=(10, 6), floor="wood", furniture=[
        ("furn.shelf", "back"), ("furn.jar", "back"), ("furn.jar", "back"), ("furn.counter", "right"),
        ("furn.table", "table"), ("furn.table", "table"), ("furn.plant", "corner")]),
    "building.hall": dict(size=(12, 8), floor="stone", furniture=[
        ("furn.screen", "backmid"), ("furn.desk", "dais"), ("furn.rug", "rug"), ("banner.red", "flank"), ("banner.red", "flank"),
        ("furn.shelf", "back"), ("furn.shelf", "back"), ("furn.plant", "corner"), ("furn.plant", "corner"), ("furn.chest", "left")]),
    "building.house": dict(size=(8, 6), floor="wood", furniture=[
        ("furn.bed", "back"), ("furn.drawers", "back"), ("furn.shelf", "back"), ("furn.table", "table"), ("furn.jar", "corner")]),
    "building.hut": dict(size=(6, 5), floor="mat", furniture=[
        ("furn.mat", "back"), ("furn.hearth", "back"), ("furn.jar", "corner"), ("furn.sacks", "left")]),
    "building.lodge": dict(size=(9, 6), floor="earth", furniture=[
        ("furn.hearth", "backmid"), ("furn.bed", "back"), ("furn.sacks", "left"), ("furn.sacks", "left"), ("furn.barrel", "right"),
        ("furn.table", "table"), ("furn.jar", "corner")]),
    "building.tent": dict(size=(8, 6), floor="earth", furniture=[
        ("furn.desk", "backmid"), ("furn.rug", "rug"), ("furn.rack", "left"), ("furn.chest", "corner"), ("furn.barrel", "right")]),
}
NAMES = {"building.inn": "Inn", "building.shop": "Teahouse", "building.hall": "Hall", "building.house": "House",
         "building.hut": "Hut", "building.lodge": "Farmhouse", "building.tent": "Tent"}


class Room:
    def __init__(self, parent, building, seed, people):
        self.parent, self.b, self.rng = parent, building, random.Random(seed)
        self.T = TEMPLATES[building["kind"]]
        w, h = self.T["size"]
        self.W, self.H = max(w + 2, MIN_W), max(h + 3, MIN_H)
        self.rx, self.ry = (self.W - w) // 2, (self.H - h - 1) // 2   # top-left floor cell
        self.w, self.h = w, h
        self.t = [[" "] * self.W for _ in range(self.H)]
        f = FLOOR[self.T["floor"]]
        for y in range(self.ry - 1, self.ry + h + 1):
            for x in range(self.rx - 1, self.rx + w + 1):
                inside = self.rx <= x < self.rx + w and self.ry <= y < self.ry + h
                self.t[y][x] = f if inside else "W"
        self.door = (self.rx + w // 2, self.ry + h)                   # the gap in the bottom wall
        self.t[self.door[1]][self.door[0]] = f
        self.used, self.solid, self.objects, self.npcs = set(), set(), [], []
        # an aisle from the door up into the room stays clear
        self.keep = {(self.door[0] + dx, y) for dx in (-1, 0, 1) for y in range(self.ry + h - 2, self.ry + h + 1)}
        self.people = people

    def floor(self, x, y):
        return self.rx <= x < self.rx + self.w and self.ry <= y < self.ry + self.h

    def free(self, x, y, w, h, margin=0):
        for yy in range(y - margin, y + h + margin):
            for xx in range(x - margin, x + w + margin):
                inside = x <= xx < x + w and y <= yy < y + h
                if inside and (not self.floor(xx, yy) or (xx, yy) in self.used or (xx, yy) in self.keep):
                    return False
                if not inside and (xx, yy) in self.solid:
                    return False
        return True

    def put(self, kind, x, y):
        fw, fh, solid = KINDS[kind]
        self.objects.append({"kind": kind, "x": x, "y": y, "w": fw, "h": fh})
        for yy in range(y, y + fh):
            for xx in range(x, x + fw):
                self.used.add((xx, yy))
                if solid:
                    self.solid.add((xx, yy))

    def candidates(self, kind, where):
        fw, fh, _ = KINDS[kind]
        R, B, top = self.rx + self.w - fw, self.ry + self.h - fh, self.ry
        mid = self.rx + (self.w - fw) // 2
        if where == "back":
            xs = list(range(self.rx, R + 1))
            self.rng.shuffle(xs)
            return [(x, top) for x in xs]
        if where == "back2":   # a counter a step out from the back wall, at one side
            return [(self.rx + 1, top + 2), (R - 1, top + 2), (self.rx, top + 2), (R, top + 2)]
        if where == "backmid":
            return [(mid, top), (mid - 1, top), (mid + 1, top)]
        if where == "dais":
            return [(mid, top + 2), (mid, top + 1)]
        if where == "rug":
            return [(mid, top + 3), (mid, top + 4), (mid, top + 2)]
        if where == "flank":
            return [(mid - 2, top), (mid + KINDS["furn.screen"][0] + 1, top), (mid - 3, top), (mid + 4, top)]
        if where in ("left", "right"):
            ys = list(range(top + 1, B + 1))
            self.rng.shuffle(ys)
            return [((self.rx if where == "left" else R), y) for y in ys]
        if where == "corner":
            return [(self.rx, top), (R, top), (self.rx, B), (R, B)]
        if where in ("table", "centre"):
            cells = [(x, y) for y in range(top + 2, B) for x in range(self.rx + 1, R)]
            self.rng.shuffle(cells)
            return cells
        return []

    def furnish(self):
        for kind, where in self.T["furniture"]:
            fw, fh, _ = KINDS[kind]
            for x, y in self.candidates(kind, where):
                if where == "table":
                    # a table with a stool at each end, and room to walk round
                    if self.free(x - 1, y, fw + 2, fh, margin=1):
                        self.put(kind, x, y)
                        self.put("furn.stool", x - 1, y)
                        self.put("furn.stool", x + fw, y)
                        break
                elif self.free(x, y, fw, fh):
                    self.put(kind, x, y)
                    break

    def reach(self, start):
        seen, q = {start}, deque([start])
        while q:
            x, y = q.popleft()
            for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if n not in seen and (self.floor(*n) or n == self.door) and n not in self.solid:
                    seen.add(n)
                    q.append(n)
        return seen

    def seat_people(self):
        reach = self.reach(self.door)
        anchors = [(o["x"] + o["w"] // 2, o["y"] + o["h"]) for o in self.objects if o["kind"] in ("furn.counter", "furn.desk", "furn.hearth", "furn.table")]
        for i, p in enumerate(self.people):
            want = anchors[i % len(anchors)] if anchors else (self.rx + self.w // 2, self.ry + 2)
            cells = sorted((c for c in reach if c not in self.used and c not in self.keep and c != self.door),
                           key=lambda c: (abs(c[0] - want[0]) + abs(c[1] - want[1]), self.rng.random()))
            if not cells:
                continue
            x, y = cells[0]
            self.used.add((x, y))
            npc = {"id": f"in-{i + 1}", "kind": p["kind"], "x": x + .5, "y": y + .9, "say": [p["say"]] if isinstance(p.get("say"), str) else p.get("say", [])}
            if p.get("wander"):
                npc["wander"] = True
            self.npcs.append(npc)

    def build(self, rid, world_n):
        self.furnish()
        self.seat_people()
        inside = (self.door[0], self.door[1] - 1)
        floor_cells = sum(1 for y in range(self.H) for x in range(self.W) if self.floor(x, y) and (x, y) not in self.solid)
        if len(self.reach(self.door)) < floor_cells * .8:
            raise RuntimeError("furniture blocks the room")
        b = self.b
        return {
            "format": "tk-map/1", "id": rid, "world": world_n, "parent": self.parent["id"],
            "name": b.get("label") or f"{NAMES[b['kind']]}, {self.parent['name']}", "archetype": "interior",
            "building": b.get("id"), "size": [self.W, self.H], "seed": self.rng.random(),
            "terrain": {"legend": LEGEND, "rows": ["".join(r) for r in self.t]},
            "objects": self.objects, "spots": [], "npcs": self.npcs,
            "exits": [{"to": self.parent["id"], "side": "S", "x": self.door[0], "y": self.door[1], "w": 1, "h": 1}],
            "entries": {self.parent["id"]: list(inside), "": list(inside)},
        }


def add_spot(r, node, label=""):
    """A story spot inside a room: open floor in the middle, in front of the furniture."""
    walk = {ch for ch, mat in LEGEND.items() if mat in FLOOR}
    solid = {(xx, yy) for o in r["objects"] if KINDS[o["kind"]][2]
             for yy in range(o["y"], o["y"] + o["h"]) for xx in range(o["x"], o["x"] + o["w"])}
    taken = {(int(p["x"]), int(p["y"])) for p in r["npcs"]}
    start = tuple(r["entries"][""])
    seen, q = {start}, deque([start])
    while q:
        x, y = q.popleft()
        for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if n not in seen and 0 <= n[1] < len(r["terrain"]["rows"]) and 0 <= n[0] < len(r["terrain"]["rows"][0]) \
                    and r["terrain"]["rows"][n[1]][n[0]] in walk and n not in solid:
                seen.add(n)
                q.append(n)
    rows = [y for _, y in seen]
    cx = sum(x for x, _ in seen) / len(seen)
    cy = (min(rows) + max(rows)) / 2
    x, y = min((c for c in seen if c not in taken and c != start),
               key=lambda c: (abs(c[0] - cx) + abs(c[1] - cy), c))
    spot = {"id": f"spot-{node}", "x": x + .5, "y": y + .7, "node": node, **({"label": label} if label else {})}
    r["spots"].append(spot)
    return spot["id"]


def furnish_place(m, place, rooms, world_n):
    """Give every building in an outdoor map a door and a room. Returns the interiors."""
    out, counts = [], {}
    for o in m["objects"]:
        if o["kind"] not in TEMPLATES:
            continue
        if not o.get("id"):
            counts[o["kind"]] = counts.get(o["kind"], 0) + 1
            o["id"] = f"{o['kind'].split('.')[1]}-{counts[o['kind']]}"
        rid = f"{m['id']}--{o['id']}"
        brief = rooms.get(o["kind"], {})
        people = brief.get("people", [])
        seed = sum(map(ord, rid))
        room = None
        for k in range(20):
            try:
                room = Room({"id": m["id"], "name": m["name"]}, o, seed + k * 101, people).build(rid, world_n)
                break
            except RuntimeError:
                continue
        if room is None:
            continue
        # the door: press against the middle of the building's front wall
        dx = o["x"] + o["w"] / 2
        m["exits"].append({"to": rid, "side": "N", "x": round(dx - .4, 2), "y": o["y"] + o["h"] - .15, "w": .8, "h": .45, "door": True})
        m["entries"][rid] = [int(dx - .5) if o["w"] % 2 else int(dx), o["y"] + o["h"]]
        out.append(room)
    return out
