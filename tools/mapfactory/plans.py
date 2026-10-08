"""Plan grids → abstract maps (tk-map/1): the reader for places written as plans.

A plan (docs/book2/plan-grid.md; Book 2's are tools/tk_plans_w2.py) fixes where every
building, road, wall, gate and zone goes, in coarse cells. This reader keeps all of that
exactly and fills in only what's inside the cells: each footprint placed in its claim
against its door side, path edges, scattered planting from the "dress" hints, and where
each person stands (in view: never under a roof or a tree crown). Nothing the plan fixes
moves; the detail is drawn with a seed, so a rebuild is identical.

Every place gives one outdoor map; every compound or room in its "maps" gives another
(city → compound → room), linked by their doors and gates. Story spots, people,
challengers and stealth watchers come through in tiles, with the plan's own fields
(states, watchers, challengers, the procession) kept for the game.

    python3 tools/mapfactory/plans.py --world 2 [--out DIR] [--png]     # build Book 2 from its plans
    python3 tools/mapfactory build --world 12 --plans 2                # the test book, from Book 2's plans

Owned by the Places session; the art for the new kinds is Graphics' (vocab fallbacks, kits).
"""
import json
import math
import os
import random
import re
import sys
from collections import deque
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "tools"))

from vocab import KINDS  # noqa: E402

SIDES = {"N": (0, -1), "S": (0, 1), "W": (-1, 0), "E": (1, 0)}
DIRS = {"N": "up", "S": "down", "W": "left", "E": "right"}
# the plan's light (day, dusk, night, lantern) and weather → the engine's one light
LIGHT = {("lantern", None): "night", ("day", "clear"): "morning", ("dusk", "storm"): "storm", ("dusk", "smoke"): "smoke",
         ("day", "storm"): "storm", ("day", "smoke"): "smoke"}
# what a tile is made of, and whether you can walk on it (zones and lines become materials)
WALK = {"grass": True, "dirt": True, "sand": True, "water": False, "void": False, "wall": False,
        "wood": True, "stone": True, "mat": True, "earth": True}
IN_WALL = {"building.gate", "building.gatehouse", "building.gatetower", "building.moongate", "wall.stairs"}
PASSABLE = {"furn.seat", "furn.curtain", "furn.rug", "landmark.ridge", "building.gatehouse", "building.gate", "building.moongate",
            "plant.flower", "plant.bush", "plant.grass", "plant.peony", "rock.small", "water.lotus"}
DOOR_AT_FOOT = {"building.gatetower"}   # drawn front-on in a wall: an E/W door is at the foot of that face, by the drawn arch
SIDE_DRAWN = {"building.wing"}   # drawn in side view when it faces E or W, its doorway on the front
TALL = ("building", "tree", "rock", "ruin", "garden", "landmark")   # what a roof or crown rises above
NPC_KEYS = ("challenge", "intro", "win", "done", "until", "face", "when", "gives", "gives_when", "give", "given", "call",
            "in", "in_beats", "inside", "follower", "blocks", "view", "label", "note")


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")


def kinds_of(tables):
    """Footprints: today's vocab, then the plans' own NEW_KINDS (which Graphics adds to vocab)."""
    out = {k: (w, h, s) for k, (w, h, s) in KINDS.items()}
    out.update(tables.get("NEW_KINDS", {}))
    return out


class MapBuilder:
    """One plan → one tk-map/1."""

    def __init__(self, n, place, mid, plan, tables, seed, title, archetype):
        self.n, self.place, self.mid, self.p = n, place, mid, plan
        self.C, self.M = plan["cell"], plan.get("margin", 1)
        self.cols, self.rows = plan["grid"]
        self.W, self.H = self.cols * self.C, self.rows * self.C
        self.K = kinds_of(tables)
        self.gatehouse = {}   # building id -> width of the gatehouse drawn at its far-side door
        self.LINE = tables["LINE_KINDS"]
        self.ZONE = tables["ZONE_KINDS"]
        self.rng = random.Random(seed)
        self.seed, self.title, self.archetype = seed, title, archetype
        self.room = archetype == "interior"
        base = "void" if self.room else "grass"
        self.mat = [[base] * self.W for _ in range(self.H)]
        self.walk = {}                                   # material -> walkable
        self.objects, self.spots, self.npcs, self.exits, self.entries = [], [], [], [], {}
        self.solid, self.covered, self.keep = set(), set(), set()
        self.anchor = {}                                 # thing id -> the tile in front of its door
        self.foot = {}                                   # thing id -> footprint (x, y, w, h) in tiles
        self.gate_tiles = {}                             # gate id -> tiles of the doorway
        self.door_gap = {}                               # building id -> (first tile, width) of the gate its door opens through

    # ---------- helpers ----------
    def cell_tiles(self, cx, cy):
        return [(cx * self.C + i, cy * self.C + j) for j in range(self.C) for i in range(self.C)]

    def set(self, t, m, walk):
        x, y = t
        if 0 <= x < self.W and 0 <= y < self.H:
            self.mat[y][x] = m
            self.walk[m] = walk

    def walkable(self, t):
        x, y = t
        if not (0 <= x < self.W and 0 <= y < self.H) or t in self.solid:
            return False
        m = self.mat[y][x]
        return self.walk.get(m, WALK.get(m, True))

    def zone_cells(self, z):
        if "mask" in z:
            x0, y0 = z["at"]
            return [(x0 + i, y0 + j) for j, row in enumerate(z["mask"]) for i, ch in enumerate(row) if ch == "#"]
        x, y, w, h = z["rect"]
        return [(i, j) for j in range(y, y + h) for i in range(x, x + w)]

    def line_tiles(self, l):
        """The band of tiles a line covers. A path runs through cell centres, `width` tiles wide; an outline
        is a wall round a rectangle of cells, its band on the inner edge of the ring of cells."""
        C, w = self.C, l["width"]
        out = set()
        if "outline" in l:
            x, y, cw, ch = l["outline"]
            x0, y0, x1, y1 = x * C, y * C, (x + cw) * C, (y + ch) * C      # outer edge, in tiles
            inner = (x0 + C - w, y0 + C - w, x1 - C + w, y1 - C + w)        # the band hugs the inside of the ring
            for ty in range(inner[1], inner[3]):
                for tx in range(inner[0], inner[2]):
                    if tx < inner[0] + w or tx >= inner[2] - w or ty < inner[1] + w or ty >= inner[3] - w:
                        out.add((tx, ty))
            return out
        pts = [((px + .5) * C, (py + .5) * C) for px, py in l["path"]]
        r = w / 2
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            lo_x, hi_x = min(ax, bx) - r, max(ax, bx) + r
            lo_y, hi_y = min(ay, by) - r, max(ay, by) + r
            for ty in range(math.floor(lo_y), math.ceil(hi_y)):
                for tx in range(math.floor(lo_x), math.ceil(hi_x)):
                    if lo_x <= tx + .5 <= hi_x and lo_y <= ty + .5 <= hi_y:
                        out.add((tx, ty))
        return {t for t in out if 0 <= t[0] < self.W and 0 <= t[1] < self.H}

    # ---------- 1. ground and lines ----------
    def lay_ground(self):
        if self.room:   # inside a room: its floor
            floor = {"wood": "wood", "stone": "stone", "mat": "mat", "earth": "earth"}.get(self.p.get("floor", "stone"), "stone")
        for z in self.p.get("ground", []):
            kind = z["kind"]
            m = floor if (self.room and kind == "floor") else kind
            walk = self.ZONE.get(kind, True)
            for c in self.zone_cells(z):
                for t in self.cell_tiles(*c):
                    self.set(t, m, walk)
        self.round_water()

    def round_water(self):
        """Water from cell masks: round off the corners so a pond reads as a pond, not a block."""
        for y in range(self.H):
            for x in range(self.W):
                if self.mat[y][x] != "water":
                    continue
                nb = [(x + dx, y + dy) for dx, dy in SIDES.values()]
                dry = sum(1 for a, b in nb if not (0 <= a < self.W and 0 <= b < self.H) or self.mat[b][a] != "water")
                if dry >= 2 and self.rng.random() < .7:
                    self.mark_shore.append((x, y))
        for x, y in self.mark_shore:
            self.set((x, y), "sand" if not self.room else self.mat[y][x], True)

    def lay_lines(self):
        for l in self.p.get("lines", []):
            kind = l["kind"]
            walk, _sight = self.LINE.get(kind, (True, False))
            m = {"river": "water", "stream": "water"}.get(kind, kind)
            band = self.line_tiles(l)
            l["_tiles"] = band
            for t in band:
                if not walk and self.walkable(t) and any(t in o["_tiles"] for o in self.p.get("lines", [])
                                                         if o is not l and o.get("_tiles") and self.LINE.get(o["kind"], (True,))[0]
                                                         and o["kind"] in ("road", "path", "bridge")):
                    continue   # a road already crosses here: it bridges the stream
                self.set(t, m, walk)
        # roads and bridges are laid again on top, so they cross rivers and streams
        for l in self.p.get("lines", []):
            if l["kind"] in ("road", "path", "bridge", "gallery"):
                for t in l["_tiles"]:
                    under = self.mat[t[1]][t[0]]
                    self.set(t, "bridge" if under == "water" and l["kind"] != "bridge" else l["kind"], True)
        # gates: a doorway through the wall's band, as wide as the road through it (or 2 tiles)
        for l in self.p.get("lines", []):
            for gid, (gx, gy) in (l.get("gates") or {}).items():
                cell = set(self.cell_tiles(gx, gy))
                wall = cell & l["_tiles"]
                if not wall:
                    continue
                cross = [o for o in self.p.get("lines", []) if o is not l and o["kind"] in ("road", "path", "gallery") and o["_tiles"] & cell]
                width = max([o["width"] for o in cross] + [2 if self.C >= 4 else 1])
                xs, ys = sorted({t[0] for t in wall}), sorted({t[1] for t in wall})
                horiz = len(xs) >= len(ys)                      # the wall runs E-W here: the doorway is a gap in x
                mid = (gx + .5) * self.C
                gap = {t for t in wall if (abs(t[0] + .5 - mid) <= width / 2 if horiz else abs(t[1] + .5 - (gy + .5) * self.C) <= width / 2)}
                under = next((o["kind"] for o in cross), "court" if not self.room else self.p.get("floor", "stone"))
                for t in gap:
                    self.set(t, under, True)
                self.gate_tiles[gid] = sorted(gap)
                if l["kind"] in ("wall.city", "wall") and not self.room and not any(
                        t["rect"][0] <= gx < t["rect"][0] + t["rect"][2] and t["rect"][1] <= gy < t["rect"][1] + t["rect"][3]
                        for t in self.p.get("things", [])):
                    gx0, gy0 = min(t[0] for t in gap), min(t[1] for t in gap)
                    gw, gh = max(t[0] for t in gap) - gx0 + 1, max(t[1] for t in gap) - gy0 + 1
                    self.objects.append({"kind": "building.gate" if l["kind"] == "wall.city" else "building.gatehouse",
                                         "x": gx0, "y": gy0, "w": gw, "h": gh, "id": gid, "width": max(gw, gh),
                                         "wall": l["id"], "door": "S" if horiz else ("E" if gx >= self.cols // 2 else "W")})

    # ---------- 2. things: each footprint inside its claim, against its door ----------
    def lay_things(self):
        for t in self.p.get("things", []):
            x, y, w, h = t["rect"]
            kind = t["kind"]
            fw, fh, solid = self.K.get(kind, (None, None, True))
            m = t.get("margin", 0 if kind in IN_WALL else self.M)   # a thing may stand right against its cell's edge
            cw, ch = w * self.C - 2 * m, h * self.C - 2 * m
            if fw is None:
                fw, fh = cw, ch                                # a compound or palace fills its claim
            elif (fw > cw or fh > ch) and fh <= cw and fw <= ch:
                fw, fh = fh, fw                                # turned to fit (a wing along a court)
            fw, fh = min(fw, cw), min(fh, ch)
            door = t.get("door") or (t.get("doors") or [None])[0]
            # against the door side; centred along it
            ox, oy = x * self.C + m, y * self.C + m
            fx = ox + (cw - fw) // 2 if door not in ("E", "W") else (ox + cw - fw if door == "E" else ox)
            fy = oy + (ch - fh) // 2 if door not in ("N", "S") else (oy + ch - fh if door == "S" else oy)
            if door is None and kind.startswith("building."):
                fy = oy + ch - fh                              # no door: it still faces south, onto the open side
            if door and kind not in IN_WALL:
                # it may slide into its claim's margin: a door that can be walked through comes first
                fx, fy = self.door_to_gate(t["id"], door, fx, fy, fw, fh, ox - m, oy - m, cw + 2 * m, ch + 2 * m)
            o = {"kind": kind, "x": fx, "y": fy, "w": fw, "h": fh, "id": t["id"]}
            # a wing facing E or W is drawn in side view with its doorway on the front, at the bottom (Jade's
            # wing_side; the stand-ins face front too): the way in is there, while it still faces its court
            enter = "S" if kind in SIDE_DRAWN and door in ("E", "W") else door
            if enter != door:
                o["enter"] = enter
            if kind.startswith("building."):
                o["door"] = door
                o["faces"] = t.get("faces") or (door if door in SIDES else "S")
            for k in ("label", "note", "map", "open_to", "refuse", "gives", "when", "until", "window", "plaque"):
                if t.get(k) is not None:
                    o[k] = t[k]
            if t.get("doors"):
                o["doors"] = t["doors"]
            if t.get("on") == "water":
                o["on"] = "water"
                br = next((l for l in self.p.get("lines", []) if l["kind"] == "bridge"
                           and any(fx - 1 <= tx <= fx + fw and fy - 1 <= ty <= fy + fh for tx, ty in l["_tiles"])), None)
                if br:
                    o["bridge"] = br["id"]
                    if br.get("zigzag"):
                        o["zigzag"] = True
            self.objects.append(o)
            self.foot[t["id"]] = (fx, fy, fw, fh)
            tiles = {(i, j) for j in range(fy, fy + fh) for i in range(fx, fx + fw)}
            if solid and kind not in PASSABLE:
                self.solid |= tiles
            self.covered |= tiles
            if kind.startswith(("tree.", "garden.rockery", "furn.plant", "furn.screen", "garden.screenwall")) or kind.startswith("building."):
                o["blocks_sight"] = True
            # the tile in front of each door, kept clear; the anchor for people and spots
            for d in [enter if d == door else d for d in (t.get("doors") or ([door] if door else []))]:
                low = kind in DOOR_AT_FOOT and d in ("E", "W")   # its doorway is drawn at the bottom of the front
                ax, ay = {"S": (fx + fw // 2, fy + fh), "N": (fx + fw // 2, fy - 1),
                          "E": (fx + fw, fy + fh - 1 if low else fy + fh // 2), "W": (fx - 1, fy + fh - 1 if low else fy + fh // 2)}[d]
                self.anchor.setdefault(t["id"], (ax, ay))
                ox_, oy_ = {"S": (0, 1), "N": (0, -1), "E": (1, 0), "W": (-1, 0)}[d]   # outward, away from the building
                self.keep |= {(ax + dx + k * ox_, ay + k * oy_) for dx in (-1, 0, 1) for k in (0, 1) if d in "NS"} | \
                             {(ax + k * ox_, ay + dy) for dy in (-1, 0, 1) for k in (0, 1) if d in "EW"} | {(ax, ay)}
                if d == "N" and d == door and t.get("map") and kind.startswith("building.") and kind not in IN_WALL:
                    # a door on the far side, which the camera can't see: a gatehouse stands at it, so the way in shows
                    gw = self.K.get("building.gatehouse", (4, 1, False))[0]
                    self.keep |= {(i, j) for i in range(ax - gw // 2 - 1, ax - gw // 2 + gw + 1) for j in (fy - 2, fy - 1)}   # no tree before it
                    self.gatehouse[t["id"]] = gw
                    self.objects.append({"kind": "building.gatehouse", "x": ax - gw // 2, "y": fy, "w": gw, "h": 1,
                                         "id": f"{t['id']}-gate", "faces": "S", **({"label": t["gate_label"]} if t.get("gate_label") else {})})
            if t["id"] not in self.anchor:
                self.anchor[t["id"]] = (fx + fw // 2, fy + fh)

    def door_to_gate(self, tid, door, fx, fy, fw, fh, ox, oy, cw, ch):
        """A door that opens through a wall's gate (Pang Shu's door, through the lane wall): the building slides along
        its claim so the door is centred in the gap. Centred in its claim instead, an even-width house puts its door on
        a tile edge, a tile off a gate that fills its cell, and her feet (10 px) can't get through (Testing). The build
        fails if the door still doesn't clear the gap's sides by her half-width."""
        along = 0 if door in ("N", "S") else 1                 # the axis the door slides along
        out = {"N": (0, -1), "S": (0, 1), "E": (1, 0), "W": (-1, 0)}[door]
        mid = (fx + fw / 2, fy + fh / 2)[along]
        edge = {"N": fy - 1, "S": fy + fh, "W": fx - 1, "E": fx + fw}[door]   # the row (or column) just outside the door
        for gid, gap in self.gate_tiles.items():
            rows = {t[1 - along] for t in gap}
            hit = [r for r in (edge + k * out[1 - along] for k in range(3)) if r in rows]
            if not hit or not any(abs(t[along] + .5 - mid) <= 1.5 for t in gap if t[1 - along] == hit[0]):   # the gap the door opens into
                continue
            span = [t[along] for t in gap if t[1 - along] == hit[0]]
            g0, gw = min(span), max(span) - min(span) + 1
            size, lo, hi = (fw, ox, ox + cw - fw) if along == 0 else (fh, oy, oy + ch - fh)
            at = min(max(round(g0 + (gw - size) / 2), lo), hi)
            fx, fy = (at, fy) if along == 0 else (fx, at)
            self.door_gap[tid] = (g0, gw)
            c = at + size / 2
            if not (g0 + 6 / 16 <= c <= g0 + gw - 6 / 16):
                raise RuntimeError(f"{self.mid}: {tid}'s door ({door}) can't be centred in gate {gid} (tiles {g0}..{g0 + gw - 1}); "
                                   f"its claim leaves it at {c:.1f} (claim {lo}..{hi + size}, size {size})")
            break
        return fx, fy

    # ---------- 3. dress: planting and props from the plan's hints ----------
    def free(self, t, margin=0):
        x, y = t
        for j in range(y - margin, y + margin + 1):
            for i in range(x - margin, x + margin + 1):
                if (i, j) in self.covered or (i, j) in self.keep or not self.walkable((i, j)):
                    return False
        return self.mat[y][x] not in ("road", "path", "bridge", "gallery", "court", "market", "stage")

    def put(self, kind, t, **extra):
        fw, fh, solid = self.K.get(kind, (1, 1, False))
        x, y = t
        cells = {(i, j) for j in range(y, y + fh) for i in range(x, x + fw)}
        if not all(self.free(c) for c in cells):
            return False
        self.objects.append({"kind": kind, "x": x, "y": y, "w": fw, "h": fh, **extra})
        self.covered |= cells
        if solid and kind not in PASSABLE:
            self.solid |= cells
        return True

    def lay_dress(self):
        banners = self.place_brief.get("banners")
        for d in self.p.get("dress", []):
            kind = d["kind"]
            if kind == "banner":
                kind = f"banner.{banners or 'red'}"
            if d.get("along"):
                line = next((l for l in self.p.get("lines", []) if l["id"] == d["along"]), None)
                if not line:
                    continue
                every = max(1, d.get("every", 2)) * (self.C // 2 or 1)
                band = line["_tiles"]
                edge = sorted({(tx + dx, ty + dy) for tx, ty in band for dx, dy in SIDES.values()} - band)
                k = 0
                for t in edge:
                    if (t[0] + t[1]) % every == 0 and (d.get("both_sides", True) or k % 2 == 0):
                        if self.put(kind, t):
                            k += 1
            elif d.get("in"):
                zone = next((z for z in self.p.get("ground", []) if z["id"] == d["in"]), None)
                tiles = [t for c in (self.zone_cells(zone) if zone else []) for t in self.cell_tiles(*c)]
                if kind == "water.lotus":   # lotus leaves on the pond itself
                    for t in tiles:
                        if self.mat[t[1]][t[0]] == "water" and self.rng.random() < .25:
                            self.objects.append({"kind": kind, "x": t[0], "y": t[1], "w": 1, "h": 1})
                    continue
                self.rng.shuffle(tiles)
                n = d.get("count", max(3, len(tiles) // 12))
                if d.get("near") in self.foot:
                    fx, fy, fw, fh = self.foot[d["near"]]
                    tiles.sort(key=lambda t: abs(t[0] - (fx + fw / 2)) + abs(t[1] - (fy + fh)))
                for t in tiles:
                    if n <= 0:
                        break
                    if self.put(kind, t):
                        n -= 1
            elif d.get("at_door") in self.anchor:   # flanking a door, so you know it from down the street
                ax, ay = self.anchor[d["at_door"]]
                fx, fy, fw, fh = self.foot[d["at_door"]]
                y = fy + fh - 1 if not self.free((ax - 2, ay)) else ay
                off = self.gatehouse[d["at_door"]] // 2 + 1 if d["at_door"] in self.gatehouse else 2   # outside a gatehouse
                sides = (-off, off) if d.get("pair") else (-off,)
                for dx in sides:
                    for t in ((ax + dx, ay), (ax + dx + (1 if dx > 0 else -1), ay), (ax + dx, ay - 1), (ax + dx, ay - 2)):
                        if self.put(kind, t):
                            break
            elif d.get("at_gates"):
                for gid, gap in self.gate_tiles.items():
                    gx = min(t[0] for t in gap) - 1
                    gy = max(t[1] for t in gap) + 1
                    self.put(kind, (gx, gy)) or self.put(kind, (gx - 1, gy))
            elif d.get("count"):
                tiles = [(x, y) for y in range(self.H) for x in range(self.W)]
                self.rng.shuffle(tiles)
                n = d["count"]
                for t in tiles:
                    if n <= 0:
                        break
                    if self.put(kind, t):
                        n -= 1
        for pr in self.p.get("props", []):
            extra = {k: pr[k] for k in ("in", "when", "until", "label", "note") if pr.get(k)}
            if pr.get("along"):
                line = next((l for l in self.p.get("lines", []) if l["id"] == pr["along"]), None)
                edge = sorted({(tx + dx, ty) for tx, ty in (line["_tiles"] if line else ()) for dx in (-1, 1)} - (line["_tiles"] if line else set()))
                for t in edge[::2]:
                    self.objects.append({"kind": pr["kind"], "x": t[0], "y": t[1], "w": 1, "h": 1, **extra})
            else:
                t = self.near_cell(tuple(pr["at"]), want_visible=False)
                if t:
                    self.objects.append({"kind": pr["kind"], "x": t[0], "y": t[1], "w": 1, "h": 1, **extra})

    # ---------- 4. spots, exits, people ----------
    def hidden(self, t):
        """Under a roof (3 tiles above a building) or a crown (2 above a tree or rock), across its width."""
        x, y = t
        for o in self.objects:
            if not (o["kind"].split(".")[0] in TALL and o["kind"] not in PASSABLE and self.K.get(o["kind"], (0, 0, True))[2]):
                continue
            rise = 3 if o["kind"].startswith("building.") else 2
            if o["x"] <= x < o["x"] + o["w"] and o["y"] - rise <= y < o["y"]:
                return True
        return False

    def near_cell(self, c, want_visible=True, taken=()):
        """The best tile in a cell: walkable, in view, nearest its centre; else the nearest one outside it."""
        cx, cy = (c[0] + .5) * self.C, (c[1] + .5) * self.C
        tiles = sorted(self.cell_tiles(*c), key=lambda t: (t[0] + .5 - cx) ** 2 + (t[1] + .5 - cy) ** 2)
        ok = [t for t in tiles if self.walkable(t) and t not in taken and not (want_visible and self.hidden(t))]
        if ok:
            return ok[0]
        return self.near_tile((int(cx), int(cy)), want_visible, taken)

    def near_tile(self, t0, want_visible=True, taken=(), front=None, keep_ok=False):
        for r in range(0, 12):
            ring = [(t0[0] + dx, t0[1] + dy) for dx in range(-r, r + 1) for dy in range(-r, r + 1) if max(abs(dx), abs(dy)) == r]
            if front:   # in front of a door first
                ring.sort(key=lambda t: -((t[1] - t0[1]) * front[1] + (t[0] - t0[0]) * front[0]))
            for t in ring:
                if self.walkable(t) and t not in taken and (keep_ok or t not in self.keep) and not (want_visible and self.hidden(t)):
                    return t
        return None

    def lay_spots(self):
        for t in self.p.get("things", []):   # a building that hosts a beat: its spot is at its door
            if t.get("node") and t["id"] in self.anchor:   # a step out from the door, clear of the roof drawn over the doorstep
                a = self.anchor[t["id"]]
                d = next((x.get("enter") for x in self.objects if x.get("id") == t["id"] and x.get("enter")), None) or \
                    t.get("door") or (t.get("doors") or ["S"])[0]
                ox, oy = {"S": (0, 1), "N": (0, -1), "E": (1, 0), "W": (-1, 0)}.get(d, (0, 1))
                if self.walkable((a[0] + ox, a[1] + oy)):
                    a = (a[0] + ox, a[1] + oy)
                self.spots.append({"id": t["id"], "x": a[0] + .5, "y": a[1] + .7, "node": t["node"], "label": t.get("label", "")})
        for s in self.p.get("spots", []):
            c = tuple(s["at"])
            if s.get("at_door") in self.anchor:      # square in front of a building's door, a step out so you don't walk in (the crown at Lü Bu's gate)
                ax, ay = self.anchor[s["at_door"]]
                d = next((x.get("enter") or x.get("door") for x in self.objects if x.get("id") == s["at_door"]), "S")
                t = {"S": (ax, ay + 1), "N": (ax, ay - 1), "E": (ax + 1, ay), "W": (ax - 1, ay)}.get(d, (ax, ay + 1))
            elif s.get("on") and s["on"] in self.foot:
                fx, fy, fw, fh = self.foot[s["on"]]
                t = (fx + fw // 2, fy + fh // 2)
            else:
                t = self.near_cell(c, want_visible=False)
            spot = {"id": s["id"], "x": t[0] + .5, "y": t[1] + .7, "node": s.get("node", ""), "label": s.get("label", "")}
            for k in ("trigger", "note", "on", "sight", "cover"):   # cover: a place to hide (hide and wait)
                if s.get(k):
                    spot[k] = s[k]
            self.spots.append(spot)
            self.keep.add(t)
            if s.get("cover") and s.get("with"):
                # what she hides behind (a hay cart, a well-house, jars by a doorway), drawn on the cover's own tile so it
                # stands in front of her; walked through, so she can crouch in it (it never blocks the lane)
                self.objects.append({"kind": s["with"], "x": t[0], "y": t[1], "w": 1, "h": 1, "solid": False,
                                     "label": s.get("label", "")})

    def person(self, i, p, t, prefix="npc"):
        say = p.get("say")
        n = {"id": f"{prefix}-{i + 1}", "kind": p["kind"], "x": t[0] + .5, "y": t[1] + .9,
             "say": [say] if isinstance(say, str) else (say or [])}
        for k in NPC_KEYS:
            if p.get(k) is not None:
                n[k] = p[k]
        if p.get("watch"):   # a townsperson who also watches (the Chancellor's gate guard on the crown errand)
            n["watch"] = self.watch({"id": n["id"], **p["watch"], "beat": p["watch"].get("beat") or [p.get("at") or [0, 0]]})
        if p.get("id"):
            n["id"] = p["id"]
        u = n.get("until")
        if isinstance(u, str) and u.startswith("node:"):   # the game's "until" names a node key
            n["until"] = f"{self.n}-{u[5:]}"
        elif isinstance(u, str) and re.match(r"^\d+-", u):
            n["until"] = f"{self.n}-{u.split('-', 1)[1]}"
        if p["kind"].startswith("folk.") and not p.get("near") and not p.get("at") and not p.get("challenge"):
            n["wander"] = True
        return n

    def lay_people(self, npcs, challengers, watchers):
        taken = {(int(s["x"]), int(s["y"])) for s in self.spots}
        for i, p in enumerate(npcs):
            if p.get("at"):
                t = self.near_cell(tuple(p["at"]), taken=taken)
            elif p.get("near") in self.anchor:
                a = self.anchor[p["near"]]
                t = self.near_tile(a, taken=taken, front=(0, 1))
            else:
                t = self.near_cell((self.cols // 2, self.rows // 2), taken=taken)
            if t is None:
                raise RuntimeError(f"{self.mid}: no place for npc {i + 1} ({p['kind']})")
            taken.add(t)
            n = self.person(i, p, t)
            if p.get("behind") in self.foot:   # seated at a desk: feet just inside its top edge, so it hides the legs
                fx, fy, fw, fh = self.foot[p["behind"]]
                n["x"], n["y"] = fx + fw / 2, fy + .35
            self.npcs.append(n)
        for i, c in enumerate(challengers):
            t = self.near_cell(tuple(c["at"]), taken=taken)
            taken.add(t)
            n = self.person(i, c, t, prefix="ch")
            n["challenge"] = c["id"]
            if c.get("face"):
                n["face"] = DIRS[c["face"]]
            n["view"] = c.get("view", 1) * self.C   # how far he sees you, in tiles
            if c.get("blocks") is not None:         # what he guards
                n["blocks"] = c["blocks"]
            if c.get("guard") is not None:          # the point he holds, declined or not: a gate's gap, or a cell
                g = c["guard"]
                if g == "door":                      # on the doorstep of what he blocks (a thing's door, or a spot)
                    b = c["blocks"]
                    spot = next((s for s in self.spots if s["id"] == b), None)
                    d = (int(spot["x"]), int(spot["y"])) if spot else self.anchor[b]
                    n["guard"] = [d[0] + .5, d[1] + .5]
                elif isinstance(g, str):
                    gap = self.gate_tiles[g]
                    n["guard"] = [sum(t[0] for t in gap) / len(gap) + .5, sum(t[1] for t in gap) / len(gap) + .5]
                else:
                    n["guard"] = [g[0] * self.C + self.C / 2, g[1] * self.C + self.C / 2]
                self.prove_guard(c, n)
            self.npcs.append(n)
        for i, w in enumerate(watchers):
            n = {"id": w["id"], "kind": w["kind"], "say": [], "watch": self.watch(w)}
            n["x"], n["y"] = n["watch"]["beat"][0]
            self.npcs.append(n)

    def prove_guard(self, c, n):
        """A guard holds the way: from where the walk starts, what he blocks can't be reached without passing within
        2.5 tiles of his point (the engine's reach). Raises if there's a way round."""
        start = self.near_cell(tuple(c.get("from") or self.p.get("entries", {}).get("") or c["at"]), want_visible=False)
        b = c.get("blocks")
        if isinstance(b, dict):   # a road out: any tile of that exit's cell
            e = next((e for e in self.p.get("exits", []) if e["to"] == b.get("exit")), None)
            if e is None:
                raise RuntimeError(f"{self.mid}: guard {c['id']} blocks {b!r}, which is no exit here")
            goals = {(e["at"][0] * self.C + i, e["at"][1] * self.C + j) for i in range(self.C) for j in range(self.C)}
        else:
            spot = next((s for s in self.spots if s["id"] == b), None)
            goal = (int(spot["x"]), int(spot["y"])) if spot else self.anchor.get(b)
            if goal is None:
                raise RuntimeError(f"{self.mid}: guard {c['id']} blocks {b!r}, which is no spot or thing here")
            goals = {tuple(goal)}
        gx, gy = n["guard"]
        near = lambda t: (t[0] + .5 - gx) ** 2 + (t[1] + .5 - gy) ** 2 < 2.5 ** 2   # noqa: E731
        seen, q = {start}, deque([start])
        while q:
            t = q.popleft()
            if t in goals:
                raise RuntimeError(f"{self.mid}: {c['id']} doesn't hold the way: {b} can be reached round his guard point")
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                u = (t[0] + dx, t[1] + dy)
                if u not in seen and 0 <= u[0] < self.W and 0 <= u[1] < self.H and (self.walkable(u) or u in goals) and not near(u):
                    seen.add(u)
                    q.append(u)

    def watch(self, w):
        """A stealth watcher in the engine's terms (docs/map-format.md, Book 2 additions): tiles, not cells."""
        pts = w.get("beat") or [w["at"]]
        tiles = [self.near_cell(tuple(b), want_visible=False) for b in pts]
        out = {"id": w.get("id", ""), "cone": w["cone"] * self.C, "beat": [[t[0] + .5, t[1] + .9] for t in tiles]}
        if w.get("face"):
            out["face"] = DIRS.get(w["face"], w["face"])
        if w.get("turns"):
            out["turns"] = [DIRS.get(f, f) for f in w["turns"]]
        if w.get("pause"):
            px, py, secs = w["pause"]
            t = self.near_cell((px, py), want_visible=False)
            out["pause"] = [t[0] + .5, t[1] + .9, secs]
        for k in ("in_beats", "seen", "back_to", "shape", "hide"):
            if w.get(k) is not None:
                out[k] = w[k]
        return out

    # ---------- 5. build ----------
    def build(self, place_brief, npcs, challengers, watchers):
        self.place_brief = place_brief
        self.mark_shore = []
        self.lay_ground()
        self.lay_lines()
        self.lay_things()
        self.lay_spots()
        self.lay_dress()
        self.lay_people(npcs, challengers, watchers)
        mats = sorted({m for row in self.mat for m in row})
        chars = ".=~:#%&e W" + "abcdfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXYZ0123456789"
        fixed = {"grass": ".", "dirt": "=", "water": "~", "sand": ":", "wood": "#", "stone": "%", "mat": "&", "earth": "e",
                 "void": " ", "wall": "W"}
        legend, free = {}, iter(c for c in chars if c not in fixed.values())
        for m in mats:
            legend[fixed.get(m) or next(free)] = m
        back = {m: ch for ch, m in legend.items()}
        out = {"format": "tk-map/1", "id": self.mid, "world": self.n, "name": self.title, "archetype": self.archetype,
               "size": [self.W, self.H], "seed": self.seed, "plan": True,
               "terrain": {"legend": legend, "rows": ["".join(back[m] for m in row) for row in self.mat],
                           "walk": {m: self.walk.get(m, WALK.get(m, True)) for m in mats}},
               "lines": [{k: v for k, v in l.items() if k != "_tiles"} | {"tiles": len(l["_tiles"])} for l in self.p.get("lines", [])],
               "objects": self.objects, "spots": self.spots, "npcs": self.npcs, "exits": self.exits, "entries": self.entries}
        return out


# ---------- the world: every place, compound and room, linked ----------
STEP4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
DASH = {"N": (0, -1), "S": (0, 1), "E": (1, 0), "W": (-1, 0)}


def lay_chase(mb, ch):
    """A chase with a wave behind and ambushes ahead (caocao-arc.md, "Redesign"), in tiles for the engine. Each ambusher
    waits at his post (a wall's gate, a thing's front, or a cell) and dashes straight across the street to `to`, the
    last open tile that way (at most `len` tiles, default 8)."""
    spot = {s["id"]: (s["x"], s["y"]) for s in mb.spots}
    out = {"chase": ch["chase"], "state": ch.get("state"), "from": list(spot[ch["from"]]), "to": list(spot[ch["to"]]), "pace": ch["pace"],
           "wave": {**ch["wave"], "from": list(spot[ch["wave"].get("from", ch["from"])])}, "ambush": [], "routes": {}}
    for a in ch["ambush"]:
        dx, dy = DASH[a["dash"]]
        if isinstance(a["post"], str) and a["post"] in mb.gate_tiles:     # in the gateway
            gap = mb.gate_tiles[a["post"]]
            px, py = sum(t[0] for t in gap) / len(gap) + .5, sum(t[1] for t in gap) / len(gap) + .5
        elif isinstance(a["post"], str):                                 # in front of a thing (the wall stairs)
            fx, fy, fw, fh = mb.foot[a["post"]]
            px = fx + fw / 2 if dx == 0 else (fx + fw + .5 if dx > 0 else fx - .5)
            py = fy + fh / 2 if dy == 0 else (fy + fh + .5 if dy > 0 else fy - .5)
        else:
            t = mb.near_cell(tuple(a["post"]), want_visible=False)
            px, py = t[0] + .5, t[1] + .5
        t, n = (int(px), int(py)), 0
        while n < a.get("len", 8) and mb.walkable((t[0] + dx, t[1] + dy)):
            t, n = (t[0] + dx, t[1] + dy), n + 1
        to = (px + dx * n, py + dy * n)
        if n < 2:
            raise RuntimeError(f"{mb.mid}: ambusher {a['id']} at {a['post']} has nowhere to dash {a['dash']}")
        out["ambush"].append({"id": a["id"], "post": [round(px, 2), round(py, 2)], "to": [round(to[0], 2), round(to[1], 2)],
                              "dash": a["dash"], "kind": a.get("kind", "folk.soldier")})
    return out


def _corridor(mb, pts):
    """The tiles of the cells along a route's waypoints, and one cell either side."""
    cells = set()
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        for x in range(min(ax, bx), max(ax, bx) + 1):
            for y in range(min(ay, by), max(ay, by) + 1):
                cells |= {(x + i, y + j) for i in (-1, 0, 1) for j in (-1, 0, 1)}
    return {t for c in cells for t in mb.cell_tiles(*c) if mb.walkable(t)}


def chase_run(mb, out, corridor, pts, naive=False, spare=20, horizon=500):
    """Ride the chase on tiles, a step a tile at the horse's pace. naive: the shortest way, straight on, and which
    ambushers hit it. Else the quickest clean ride (no ambusher touches him, the wave never reaches him), waiting
    where it helps, as (steps, ambushers sprung); None if there is none."""
    pc, T = out["pace"], 16
    dt = T / pc["horse"]                                        # seconds a step
    va, vw = pc["ambusher"] / T * dt, pc["wave"] / T * dt       # tiles a step
    after = pc["wave_after"] / dt                               # steps before the wave is out of the gate
    hold = pc["hold"] / dt
    hit2 = pc["hit"] ** 2
    amb = []
    for a in out["ambush"]:
        (px, py), (qx, qy) = a["post"], a["to"]
        d = math.hypot(qx - px, qy - py)
        amb.append((px, py, qx, qy, d / va, d))
    start = (int(out["from"][0]), int(out["from"][1]))
    gx, gy = out["to"]
    goal = lambda t: (t[0] + .5 - gx) ** 2 + (t[1] + .5 - gy) ** 2 <= (36 / T) ** 2   # noqa: E731  the spot's own reach

    def where(i, age):   # an ambusher's place, `age` steps after he sprang; None once he's fallen in with the wave
        px, py, qx, qy, out_s, d = amb[i]
        if age <= out_s:
            f = age / out_s
        elif age <= out_s + hold:
            f = 1
        else:
            return None
        return px + (qx - px) * f, py + (qy - py) * f

    vpt, vat = pc["horse"] / T, pc["ambusher"] / T

    def springs(i, cx, cy, mv):   # he springs when he can just reach Cao Cao's line as Cao Cao reaches his
        px, py, qx, qy, _o, d = amb[i]
        ux, uy = (qx - px) / d, (qy - py) / d                      # his way across
        across = (cx - px) * ux + (cy - py) * uy                    # how far out Cao Cao's line is
        side = (cx - px) * uy - (cy - py) * ux                      # how far Cao Cao is from crossing his, signed
        toward = side * (mv[0] * uy - mv[1] * ux) < 0               # and heading for it (tk-world: never once past it)
        near = (cx - px) ** 2 + (cy - py) ** 2 < pc["reach"] ** 2   # as tk-world's ambushStep has it, to the letter
        return toward and near and abs(side) / vpt <= min(d, abs(across)) / vat + pc["lead"]

    def advance(tile, t, trig, at=None, mv=(0, 0)):   # spring whoever is due; drop those gone home; hit?
        cx, cy = at or (tile[0] + .5, tile[1] + .5)
        nt, hits = list(trig), []
        for i in range(len(amb)):
            if nt[i] == -1 and springs(i, cx, cy, mv):
                nt[i] = t
            if nt[i] >= 0:
                w = where(i, t - nt[i])
                if w is None:
                    nt[i] = -2
                elif (w[0] - cx) ** 2 + (w[1] - cy) ** 2 < hit2:
                    hits.append(i)
        return tuple(nt), hits

    if naive:   # straight down the middle of the street, cell centre to cell centre, at a gallop, never slowing
        C, sub = mb.C, 4
        line = [(out["from"][0], out["from"][1])] + [((x + .5) * C, (y + .5) * C) for x, y in pts[1:]]
        trig, hit, k, ridden = tuple([-1] * len(amb)), set(), 0, 0.0
        for (ax, ay), (bx, by) in zip(line, line[1:]):
            d = math.hypot(bx - ax, by - ay)
            for j in range(int(d * sub)):
                x, y = ax + (bx - ax) * j / (d * sub), ay + (by - ay) * j / (d * sub)
                trig, h = advance(None, ridden, trig, at=(x, y), mv=(bx - ax, by - ay))
                hit |= set(h)
                if (x - gx) ** 2 + (y - gy) ** 2 <= (36 / T) ** 2:
                    return round(ridden), [out["ambush"][i]["id"] for i in sorted(hit)]
                ridden += 1 / sub
        return round(ridden), [out["ambush"][i]["id"] for i in sorted(hit)]

    # how far each tile is from the goal: a ride may run late by `spare` steps, no more (a dodge, not a detour)
    dist, q = {}, deque()
    for t in corridor:
        if goal(t):
            dist[t] = 0
            q.append(t)
    while q:
        t = q.popleft()
        for dx, dy in STEP4:
            u = (t[0] + dx, t[1] + dy)
            if u in corridor and u not in dist:
                dist[u] = dist[t] + 1
                q.append(u)
    budget = dist.get(start, horizon) + spare
    layer = {(start, tuple([-1] * len(amb))): 0}               # (tile, springs) -> tiles ridden
    for t in range(1, horizon):
        nxt = {}
        for (tile, trig), ridden in layer.items():
            for dx, dy in STEP4 + ((0, 0),):
                u = (tile[0] + dx, tile[1] + dy)
                if u not in dist or t + dist[u] > budget:
                    continue
                r = ridden + (dx != 0 or dy != 0)
                if r - max(0, t - after) * vw < pc["hit"]:      # the wave is on him
                    continue
                ntrig, hits = advance(u, t, trig, mv=(dx, dy))
                if hits:
                    continue
                if goal(u):
                    return t, [out["ambush"][i]["id"] for i, v in enumerate(ntrig) if v != -1]
                key = (u, ntrig)
                if nxt.get(key, -1) < r:
                    nxt[key] = r
        layer = nxt
        if not layer:
            return None
    return None


def prove_chase(mb, ch, out):
    """Every route can be ridden clean, at the engine's pace, by a rider who dodges well; and riding it straight, the
    ambushes on it are in the way. Raises if a route has no clean ride. Records each route in out["routes"]."""
    for name, pts in ch.get("routes", {}).items():
        corridor = _corridor(mb, pts)
        steps, hit = chase_run(mb, out, corridor, pts, naive=True)
        clean = chase_run(mb, out, corridor, pts)
        if clean is None:
            raise RuntimeError(f"{mb.mid}: chase route {name!r} can't be ridden clean (the wave or an ambusher always gets him)")
        dt = 16 / out["pace"]["horse"]
        out["routes"][name] = {"tiles": steps, "straight_hits": hit, "clean_s": round(clean[0] * dt, 1), "sprung": clean[1]}
        if "--verbose" in sys.argv or os.environ.get("CHASE_VERBOSE"):
            print(f"  chase {name}: {steps} tiles ({steps * dt:.1f}s straight), straight on hits {hit}; "
                  f"clean in {clean[0] * dt:.1f}s past {clean[1]}")


def flood_tiles(mb, name):
    """The open ground under a plan's named flood (cells), in tiles: walls and buildings stand above it."""
    C = mb.C
    return {(x, y) for X, Y, W, H in mb.p["floods"][name] for x in range(X * C, (X + W) * C) for y in range(Y * C, (Y + H) * C)
            if 0 <= x < mb.W and 0 <= y < mb.H and mb.walkable((x, y))}


def flood_layers(mb, states):
    """tk-world's per-state water: one tile layer for each set of states a tile is under water in, named
    "water:<state ids>" ("water:flood1,flood2"). Returns [{"states": [...], "tiles": [[x, y], ...]}]."""
    wet = {}
    for st in states:
        if st.get("water"):
            for t in flood_tiles(mb, st["water"]):
                wet.setdefault(t, []).append(st["id"])
    groups = {}
    for t, ids in wet.items():
        groups.setdefault(tuple(ids), []).append(list(t))
    return [{"states": list(k), "tiles": sorted(v)} for k, v in sorted(groups.items())]


def prove_flood(mb, states, afoot):
    """In each state with water: on a horse that crosses water (Red Hare), every spot and door can be reached from the
    map's entry; on foot, the places `afoot` names for that state can be, and none it marks "!" (a horse is needed).
    In a state with no water, everything is reachable on foot (verify checks that as for any map). Raises if not."""
    start = mb.near_cell(tuple(mb.p.get("entries", {}).get("") or (0, 0)), want_visible=False)
    targets = {s["id"]: (int(s["x"]), int(s["y"])) for s in mb.spots}
    targets.update({f"door:{k}": v for k, v in mb.anchor.items()})

    def reach(ok):
        seen, q = {start}, deque([start])
        while q:
            t = q.popleft()
            for dx, dy in STEP4:
                u = (t[0] + dx, t[1] + dy)
                if u not in seen and ok(u):
                    seen.add(u)
                    q.append(u)
        return seen

    near = lambda r, t: any((t[0] + i, t[1] + j) in r for i in (-1, 0, 1) for j in (-1, 0, 1))   # noqa: E731
    for st in states:
        if not st.get("water"):
            continue
        w = flood_tiles(mb, st["water"])
        horse = reach(mb.walkable)                                  # water is no bar to Red Hare
        foot = reach(lambda t: mb.walkable(t) and t not in w)
        lost = sorted(k for k, t in targets.items() if not near(horse, t))
        if lost:
            raise RuntimeError(f"{mb.mid}: in {st['id']}, even on Red Hare these can't be reached: {lost}")
        for k in afoot.get(st["id"], []):
            need_horse = k.startswith("!")
            t = targets[k.lstrip("!")]
            if near(foot, t) == need_horse:
                raise RuntimeError(f"{mb.mid}: in {st['id']}, {k.lstrip('!')} " +
                                   ("can be reached on foot, but the flood should cut it off" if need_horse else "can't be reached on foot"))
        if "--verbose" in sys.argv or os.environ.get("CHASE_VERBOSE"):
            dry = sorted(k for k, t in targets.items() if near(foot, t))
            print(f"  flood {st['id']}: {len(w)} tiles under water; on foot from the entry: {dry}")


def ways(mb):
    """The streets of a map as a graph, in tiles: nodes at every bend, end and crossing of a road, lane,
    garden path, bridge or gallery (their centre lines), edges along them. The game's lit route follows it,
    so the way shown runs down the streets, not across roofs and lawns."""
    C = mb.C
    segs = []
    for l in mb.p.get("lines", []):
        if l["kind"] not in ("road", "path", "bridge", "gallery") or "path" not in l:
            continue
        pts = [((x + .5) * C, (y + .5) * C) for x, y in l["path"]]
        segs += [(a, b, l["kind"]) for a, b in zip(pts, pts[1:]) if a != b]
    cuts = {i: {0.0, 1.0} for i in range(len(segs))}
    for i, (a, b, _) in enumerate(segs):   # crossings and T-joins: the lines are straight and axis-aligned
        for j, (c, d, _) in enumerate(segs):
            if i == j:
                continue
            for p in (c, d):   # an end of one line lying on the other
                if min(a[0], b[0]) - .01 <= p[0] <= max(a[0], b[0]) + .01 and min(a[1], b[1]) - .01 <= p[1] <= max(a[1], b[1]) + .01:
                    L = math.hypot(b[0] - a[0], b[1] - a[1])
                    cuts[i].add(round(math.hypot(p[0] - a[0], p[1] - a[1]) / L, 4))
            if (a[0] == b[0]) != (c[0] == d[0]):   # one vertical, one horizontal: a crossing?
                v, h = ((a, b), (c, d)) if a[0] == b[0] else ((c, d), (a, b))
                x, y = v[0][0], h[0][1]
                if min(h[0][0], h[1][0]) <= x <= max(h[0][0], h[1][0]) and min(v[0][1], v[1][1]) <= y <= max(v[0][1], v[1][1]):
                    L = math.hypot(b[0] - a[0], b[1] - a[1])
                    cuts[i].add(round(math.hypot(x - a[0], y - a[1]) / L, 4))
    nodes, index, edges = [], {}, set()

    def node(p):
        k = (round(p[0], 2), round(p[1], 2))
        if k not in index:
            index[k] = len(nodes)
            nodes.append([k[0], k[1]])
        return index[k]
    for i, (a, b, _) in enumerate(segs):
        ts = sorted(cuts[i])
        ps = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t) for t in ts]
        for p, q in zip(ps, ps[1:]):
            u, v = node(p), node(q)
            if u != v:
                edges.add((min(u, v), max(u, v)))
    return {"nodes": nodes, "edges": sorted(edges)} if edges else None


def entry_covers(m):
    """Hide and wait: on a map whose watchers hunt by sight, every way in is a cover (the doorway she comes out of, the
    shadow of a gate). A catch sends her back to her last cover, or to where she came in, before her first hide; that
    place must be one she can wait in, or a pause there is a loop (Testing, the burning ward)."""
    if not any((n.get("watch") or {}).get("hide") for n in m["npcs"]):
        return
    covers = [(s["x"], s["y"]) for s in m["spots"] if s.get("cover")]
    gates = {x["to"] for x in m["exits"] if not x.get("door")}
    for k, (x, y) in sorted(m["entries"].items()):
        px, py = x + .5, y + .7
        if any(abs(px - cx) <= 1 and -.5 <= py - cy <= 1.5 for cx, cy in covers):
            continue   # already in a cover
        m["spots"].append({"id": f"cover-way-{k or 'start'}", "x": px, "y": py, "node": "", "cover": True,
                           "label": "The shadow of the gateway" if k in gates else "A dark doorway"})
        covers.append((px, py))


def state(st, mb, plans):
    """A plan's state → the engine's: light from light+weather, distances and points in tiles of this map."""
    out = {k: v for k, v in st.items() if k not in ("light", "weather", "visibility", "procession", "exits_open", "exits_closed",
                                                    "exits_closed_say", "water", "shut")}
    light = LIGHT.get((st.get("light"), st.get("weather"))) or LIGHT.get((st.get("light"), None)) or st.get("light", "day")
    out["light"] = light if light in ("day", "morning", "dusk", "night", "storm", "smoke", "fire") else "day"   # fire: a city burning
    if st.get("weather"):
        out["weather"] = st["weather"]
    if st.get("visibility"):
        out["visibility"] = st["visibility"] * mb.C
    if st.get("procession"):
        pr = dict(st["procession"])
        for k in ("from", "to"):
            t = mb.near_cell(tuple(pr[k]), want_visible=False)
            pr[k] = [t[0] + .5, t[1] + .5]
        pr["leash"] = pr.get("leash", 4) * mb.C
        out["procession"] = pr
    places = {slug(p) for p in plans}
    doors = {t["id"]: f"{mb.mid}--{t['map']}" for t in mb.p.get("things", []) if t.get("map")}   # a door, by its building's id
    to = lambda x: doors.get(x) or (slug(x) if slug(x) in places else None)   # noqa: E731
    for k in ("exits_open", "exits_closed"):
        ids = [to(x) for x in st.get(k, []) if to(x)]
        if ids:
            out[k] = ids
    if st.get("exits_closed_say"):   # what a shut road or door says, by the place it leads to
        out["exits_closed_say"] = {to(k): v for k, v in st["exits_closed_say"].items() if to(k)}
    if st.get("shut"):    # gates of a wall shut in this state: their tiles, and what they say
        out["shut"] = []
        for gid, say in st["shut"].items():
            gap = mb.gate_tiles[gid]
            x0, y0 = min(t[0] for t in gap), min(t[1] for t in gap)
            out["shut"].append({"gate": gid, "rect": [x0, y0, max(t[0] for t in gap) - x0 + 1, max(t[1] for t in gap) - y0 + 1],
                                "say": say})
    return out


INWARD = {"N": (0, 1), "S": (0, -1), "W": (1, 0), "E": (-1, 0)}


def edge_side(r, mb):
    """The side of the room a door is on: the nearest edge (a door in the top wall is N, not S)."""
    d = {"N": r["y"], "S": mb.H - (r["y"] + r["h"]), "W": r["x"], "E": mb.W - (r["x"] + r["w"])}
    return min(d, key=lambda k: (d[k], k != "S"))


def spot_tiles(mb):
    """Where the story's spots are: no one arrives on one (its scene would start at once)."""
    return {(int(x["x"]), int(x["y"])) for x in mb.spots}


def rect_tiles(r):
    return {(x, y) for x in range(r["x"], r["x"] + r["w"]) for y in range(r["y"], r["y"] + r["h"])}


def build_world(n, world, plans, tables, zh=None, prefix=None):
    """Build every map of a world from its plans. Returns (maps, places, quests) as `mapfactory build`
    writes them. `prefix` renames the plans' node keys (Book 2's "2-a…" → the test book's "12-a…")."""
    zh = zh or {}
    src = prefix or str(n)

    def node(k):
        return f"{n}-{k.split('-', 1)[1]}" if k and k.startswith(f"{src}-") else k

    maps, places = {}, []
    owner = {}   # map id -> the map that opens into it (through a door, or an exit by name)
    for pname, b in plans.items():
        pid = b.get("id") or slug(pname)   # a plan may name its own id
        P = b["plan"]
        for t in P.get("things", []):
            if t.get("map"):
                owner[f"{pid}--{t['map']}"] = pid
        for mid, m in (b.get("maps") or {}).items():
            for t in m.get("things", []):
                if t.get("map"):
                    owner[f"{pid}--{t['map']}"] = f"{pid}--{mid}"
            for e in m.get("exits", []):
                if e["to"] in (b.get("maps") or {}) and f"{pid}--{e['to']}" not in owner:
                    owner[f"{pid}--{e['to']}"] = f"{pid}--{mid}"

    for pname, b in plans.items():
        pid = b.get("id") or slug(pname)   # a plan may name its own id
        P = b["plan"]
        seed = sum(map(ord, f"{n}/{pid}"))
        rename = lambda p: {**p, **({"node": node(p["node"])} if p.get("node") else {}),   # noqa: E731
                            **({"in_beats": [node(k) for k in p["in_beats"]]} if p.get("in_beats") else {}),
                            **({"watch": {**p["watch"], "in_beats": [node(k) for k in p["watch"].get("in_beats", [])]}} if p.get("watch") else {})}
        Pn = {**P, "spots": [rename(s) for s in P.get("spots", [])], "things": [rename(t) for t in P.get("things", [])]}
        mb = MapBuilder(n, pid, pid, Pn, tables, seed, pname, b.get("archetype", "city"))
        outdoor_people = [p for p in b.get("npcs", []) if not p.get("place")]
        chs = [c for c in b.get("challengers", []) if not c.get("map")]
        m = mb.build(b, [rename(p) for p in outdoor_people], chs, [rename(w) for w in P.get("watchers", [])])
        if b.get("chase", {}).get("riders"):   # a chase's riders (Integration's engine): an npc each, its beat in tiles
            ch = b["chase"]
            for r in ch["riders"]:
                post = mb.near_cell(tuple(r["post"]), want_visible=False)
                beat = [list(mb.near_cell(tuple(c), want_visible=False)) for c in r.get("beat", [])]
                m["npcs"].append({"id": r["id"], "kind": r.get("kind", "folk.soldier"), "x": post[0] + .5, "y": post[1] + .9, "say": [],
                                  "face": r.get("dir", "S"), "rider": {"chase": ch["chase"], "beat": beat, "cone": r.get("cone", 5),
                                                                      "dir": r.get("dir", "S"),
                                                                      **({"pause": [*mb.near_cell(tuple(r["pause"][:2]), want_visible=False),
                                                                                    r["pause"][2]]} if r.get("pause") else {})}})
        elif b.get("chase", {}).get("ambush"):   # a wave behind and ambushes ahead: laid on tiles, then proved
            m["chase"] = lay_chase(mb, b["chase"])
            prove_chase(mb, b["chase"], m["chase"])
        m["states"] = [state(st, mb, plans) for st in b.get("states", [])]
        shut = {}   # a gate shut in some states is drawn shut in them (tk-world only blocks it)
        for st in m["states"]:
            for g in st.get("shut", []):
                shut.setdefault(g["gate"], (g["rect"], []))[1].append(st["id"])
        for gid, ((x, y, w, h), ids) in shut.items():
            m["objects"].append({"kind": "prop.gateshut_ns" if w > h else "prop.gateshut",   # a north/south wall's gate is wide
                                 "x": x, "y": y, "w": w, "h": h, "id": f"{gid}-shut", "in": ids})
        if P.get("floods"):   # a flood that rises with the states: tile layers "water:<state ids>", proved state by state
            m["water_layers"] = flood_layers(mb, b.get("states", []))
            prove_flood(mb, b.get("states", []), P.get("flood_afoot", {}))
        if (w := ways(mb)):
            m["ways"] = w
        for k in ("seen_lines", "banners"):
            if b.get(k):
                m[k] = b[k]
        maps[pid] = (m, mb)
        for mid, sub in (b.get("maps") or {}).items():
            sid = f"{pid}--{mid}"
            arch = "interior" if sub.get("floor") or sub.get("cell", 4) == 2 and any(z["kind"] == "floor" for z in sub.get("ground", [])) else "compound"
            subn = {**sub, "spots": [rename(s) for s in sub.get("spots", [])], "things": [rename(t) for t in sub.get("things", [])]}
            label = sub.get("label") or next((t.get("label") for src_plan in [P] + list((b.get("maps") or {}).values())
                          for t in src_plan.get("things", []) if t.get("map") == mid and t.get("label")), None) or mid
            smb = MapBuilder(n, pid, sid, subn, tables, seed + sum(map(ord, mid)), label, arch)
            sm = smb.build(b, [rename(p) for p in b.get("npcs", []) if p.get("place") == mid],
                           [c for c in b.get("challengers", []) if c.get("map") == mid], [rename(w) for w in sub.get("watchers", [])])
            if (w := ways(smb)):
                sm["ways"] = w
            if sub.get("states"):   # a compound or room with looks of its own (the burning ward's night)
                sm["states"] = [state(st, smb, plans) for st in sub["states"]]
            sm["parent"] = pid
            sm["building"] = mid
            maps[sid] = (sm, smb)

    # links: doors into compounds and rooms, gates and exits back out, and edges between places
    def map_of(pid, to):
        if slug(to) in maps:
            return slug(to)
        if f"{pid}--{to}" in maps:
            return f"{pid}--{to}"
        return None

    def front(mb, t):
        return [t[0], t[1]]

    for mid_, (m, mb) in maps.items():
        pid = m.get("parent") or mid_
        # a door into a compound or room: press against it, as furnish_place does
        for o in m["objects"]:
            if o.get("map"):
                child = f"{pid}--{o['map']}"
                if child not in maps:
                    continue
                d = o.get("enter") or o.get("door") or "S"
                fx, fy, fw, fh = o["x"], o["y"], o["w"], o["h"]
                ex = {"S": {"x": round(fx + fw / 2 - .4, 2), "y": fy + fh - .15, "w": .8, "h": .45},
                      "N": {"x": round(fx + fw / 2 - .4, 2), "y": fy - .3, "w": .8, "h": .45},
                      "E": {"x": fx + fw - .15, "y": round((fy + fh - .5 if o["kind"] in DOOR_AT_FOOT else fy + fh / 2) - .4, 2), "w": .45, "h": .8},
                      "W": {"x": fx - .3, "y": round((fy + fh - .5 if o["kind"] in DOOR_AT_FOOT else fy + fh / 2) - .4, 2), "w": .45, "h": .8}}[d]
                if o.get("id") in mb.door_gap:   # through a wall's gate: the walls funnel her in, so the whole gap is the door
                    g0, gw = mb.door_gap[o["id"]]
                    ex.update({"x": g0, "w": gw} if d in ("N", "S") else {"y": g0, "h": gw})
                # a door only some may pass (the protagonist named, or a condition), and what it says to the rest
                # the engine's side is the way you walk to go in (Book 1: a south-facing door is side "N")
                m["exits"].append({"to": child, "side": {"S": "N", "N": "S", "E": "W", "W": "E"}[d], **ex, "door": True, **{k: o[k] for k in ("open_to", "refuse") if o.get(k)}})
                m["entries"][child] = list(mb.anchor[o["id"]])
        # gates and edges with "to": back to the owner, to another room, to another place
        P = mb.p
        for e in P.get("exits", []):
            target = map_of(pid, e["to"])
            if target is None:   # a line or zone of the compound this room opens onto (the gallery)
                target = owner.get(mid_)
            if target is None:
                continue
            c = tuple(e["at"])
            gap = next((g for gid, g in mb.gate_tiles.items()
                        if any(c == (t[0] // mb.C, t[1] // mb.C) for t in g)), None)
            if gap:
                xs, ys = [t[0] for t in gap], [t[1] for t in gap]
                rect = {"x": min(xs), "y": min(ys), "w": max(xs) - min(xs) + 1, "h": max(ys) - min(ys) + 1}
            else:   # the map's edge
                side = e.get("side", "W")
                x0, y0 = c[0] * mb.C, c[1] * mb.C
                rect = {"x": 0 if side == "W" else mb.W - 1 if side == "E" else x0,
                        "y": 0 if side == "N" else mb.H - 1 if side == "S" else y0,
                        "w": 1 if side in "EW" else mb.C, "h": 1 if side in "NS" else mb.C}
            m["exits"].append({"to": target, "side": e.get("side") or edge_side(rect, mb), **rect})
            # arriving through it: the nearest tile off the exit itself, on the inside (on it, or beyond it,
            # your first step would take you straight back out)
            inside = mb.near_tile((rect["x"] + rect["w"] // 2, rect["y"] + rect["h"] // 2), want_visible=False, taken=rect_tiles(rect) | spot_tiles(mb),
                                  front=INWARD[m["exits"][-1]["side"]], keep_ok=True)
            m["entries"].setdefault(target, list(inside))
        # a room's own door leads back to whatever opens into it
        if m.get("parent") and owner.get(mid_) and not any(x["to"] == owner[mid_] for x in m["exits"]):
            gap = mb.gate_tiles.get("door")
            if gap:
                xs, ys = [t[0] for t in gap], [t[1] for t in gap]
                rect = {"x": min(xs), "y": min(ys), "w": max(xs) - min(xs) + 1, "h": max(ys) - min(ys) + 1}
                m["exits"].append({"to": owner[mid_], "side": edge_side(rect, mb), **rect})
                m["entries"].setdefault(owner[mid_], list(mb.near_tile((rect["x"] + rect["w"] // 2, rect["y"] + rect["h"] // 2), want_visible=False, taken=rect_tiles(rect) | spot_tiles(mb),
                                                                      front=INWARD[m["exits"][-1]["side"]], keep_ok=True)))
        on_exit = set().union(*[rect_tiles(x) for x in m["exits"] if not x.get("door")])
        for k, v in P.get("entries", {}).items():
            key = map_of(pid, k) if k else ""
            if key is not None:
                t = mb.near_cell(tuple(v), want_visible=False, taken=on_exit)
                # the plan's cell is the way in itself: just inside it, as for an exit's own arrival
                way = next((x for x in sorted(m["exits"], key=lambda x: x["to"] != key) if not x.get("door")
                            and rect_tiles(x) & set(mb.cell_tiles(*tuple(v)))), None)
                if way:
                    t = mb.near_tile((way["x"] + way["w"] // 2, way["y"] + way["h"] // 2), want_visible=False,
                                     taken=on_exit | spot_tiles(mb), front=INWARD[way["side"]], keep_ok=True) or t
                m["entries"][key] = list(t)
        if "" not in m["entries"]:
            first = next(iter(m["entries"].values()), None)
            m["entries"][""] = first or list(mb.near_cell((mb.cols // 2, mb.rows // 2), want_visible=False))
        entry_covers(m)
        m["links"] = sorted({x["to"] for x in m["exits"]})

    # the story's quests: each node's spot, in whichever map holds it
    quests = []
    after = {}
    for a, b2 in world["edges"]:
        after.setdefault(b2, []).append(a)
    for nd in world["nodes"]:
        key = nd["key"]
        where = next(((mid_, s["id"]) for mid_, (m, _) in maps.items() for s in m["spots"] if s["node"] == key), None)
        if where is None:
            raise RuntimeError(f"node {key}: no spot in the plans")
        pb = plans.get(nd["place"], {})
        scene = world["scenes"][nd["scene"]]
        objective = pb.get("objectives", {}).get(key) or pb.get("objectives", {}).get(f"{src}-{key.split('-', 1)[1]}") or f"Go to {nd['place']}."
        q = {"node": key, "role": nd.get("role", "main"), "place": where[0], "spot": where[1], "scene": nd["scene"],
             "title": scene["title"], "objective": objective, "after": after.get(key, []), "grade": nd.get("grade"),
             "pool": nd.get("pool", []), **({"pool_easy": nd["pool_easy"]} if nd.get("pool_easy") else {})}
        for k in ("boss", "hint", "shrine"):
            if nd.get(k):
                q[k] = nd[k]
        if nd.get("board") is False:
            q["board"] = False
        if nd.get("gate"):
            q["gate"] = [{**g, "needs": g["needs"] if isinstance(g["needs"], list) else [g["needs"]],
                          **({"place": slug(g["at"])} if g.get("at") else {})} for g in nd["gate"]]
        quests.append(q)

    # places for region.json: outdoor places link to each other along the story's edges
    edges = set()
    by_key = {nd["key"]: slug(nd["place"]) for nd in world["nodes"]}
    for a, b2 in world["edges"]:
        pa, pb2 = by_key[a], by_key[b2]
        if pa != pb2:
            edges |= {(pa, pb2), (pb2, pa)}
    for mid_, (m, mb) in maps.items():
        if m.get("parent"):
            places.append({"id": mid_, "name": m["name"], "zh": zh.get(m["name"], ""), "archetype": m["archetype"],
                           "map": f"{mid_}.map.json", "links": m["links"], "parent": m["parent"],
                           **({"gives": g} if (g := [x["gives"] for x in m["npcs"] if x.get("gives")]) else {})})
        else:
            # the roads that really leave this map (its exits), so the lit route and the travel map follow them;
            # a story edge with no road (Chang'an to Meiwu, with the Meiwu Road between) is only a fallback
            links = sorted(set(m["links"]) or {b2 for a, b2 in edges if a == mid_})
            places.append({"id": mid_, "name": m["name"], "zh": zh.get(m["name"], ""), "archetype": m["archetype"],
                           "map": f"{mid_}.map.json", "links": links})
    return {k: v[0] for k, v in maps.items()}, places, quests


def verify(maps):
    """On every built map: the arrival point, each exit, spot and person can be walked to, and nobody stands
    under a roof or a crown. Returns a list of problems."""
    out = []
    for mid, m in maps.items():
        walk = m["terrain"]["walk"]
        leg = m["terrain"]["legend"]
        rows = m["terrain"]["rows"]
        W, H = m["size"]
        solid = set()
        for o in m["objects"]:
            fw, fh, sol = KINDS.get(o["kind"], (1, 1, True))
            if o["kind"].startswith(("plant.", "water.", "prop.", "banner.", "milestone")) or o["kind"] in PASSABLE:
                continue
            if sol or o["kind"] not in KINDS:
                solid |= {(i, j) for j in range(o["y"], o["y"] + o["h"]) for i in range(o["x"], o["x"] + o["w"])}

        def ok(t):
            x, y = t
            return 0 <= x < W and 0 <= y < H and t not in solid and walk.get(leg[rows[y][x]], True)
        start = tuple(m["entries"][""])
        seen, q = {start}, deque([start])
        while q:
            c = q.popleft()
            for dx, dy in SIDES.values():
                nb = (c[0] + dx, c[1] + dy)
                if nb not in seen and ok(nb):
                    seen.add(nb)
                    q.append(nb)

        def near(t):
            return any((t[0] + dx, t[1] + dy) in seen for dx in (-1, 0, 1) for dy in (-1, 0, 1))
        for s in m["spots"]:
            if not near((int(s["x"]), int(s["y"]))):
                out.append(f"{mid}: spot {s['id']} can't be reached")
        for e in m["exits"]:
            if not any(near((int(e["x"]) + i, int(e["y"]) + j)) for i in range(max(1, int(e["w"]))) for j in range(max(1, int(e["h"])))):
                out.append(f"{mid}: exit to {e['to']} can't be reached")
        for n in m["npcs"]:
            t = (int(n["x"]), int(n["y"]))
            if not near(t):
                out.append(f"{mid}: {n.get('challenge') or n['kind']} at {t} can't be reached")
            for o in m["objects"]:
                if o["kind"].split(".")[0] in TALL and o["kind"] not in PASSABLE and KINDS.get(o["kind"], (0, 0, True))[2] \
                        and o["x"] <= t[0] < o["x"] + o["w"] and o["y"] - (3 if o["kind"].startswith("building.") else 2) <= t[1] < o["y"]:
                    out.append(f"{mid}: {n.get('challenge') or n['kind']} at {t} stands behind {o.get('id') or o['kind']}")
                    break
    return out


def assets(maps, tables, kits_dir=None):
    """Every kind the built maps use, per art kit: drawn by the kit, standing in (a vocab fallback), or missing.
    What isn't drawn natively goes on the list to generate, with its footprint, where it's used and its brief."""
    import vocab
    from vocab import FALLBACK, FOLK
    mat_fb = getattr(vocab, "MATERIAL_FALLBACK", {})   # Graphics' stand-in grounds
    used = {}
    for mid, m in maps.items():
        for o in m["objects"]:
            used.setdefault(o["kind"], {"maps": set(), "count": 0, "size": (o["w"], o["h"])})
            used[o["kind"]]["maps"].add(mid)
            used[o["kind"]]["count"] += 1
        for mat in m["terrain"]["walk"]:
            used.setdefault(mat, {"maps": set(), "count": 0, "size": None, "ground": True})["maps"].add(mid)
        for n in m["npcs"]:
            if n["kind"].startswith("folk."):
                used.setdefault(n["kind"], {"maps": set(), "count": 0, "size": None, "folk": True})["maps"].add(mid)
    art = tables.get("ART", {})
    kits = {}
    for f in sorted(Path(kits_dir or ROOT / "assets/tk/kits").glob("*.json")):
        k = json.loads(f.read_text())
        folk = k.get("folk") or {}
        kits[k["kit"]] = (set(k.get("kinds", {})), set(k.get("materials", {})), set(folk.get("kinds", {})) | set(folk.get("drawn", {})))
    rows = []
    for kind, u in sorted(used.items()):
        status = {}
        for kit, (kk, mats, folk) in kits.items():
            have = mats if u.get("ground") else folk if u.get("folk") else kk
            if kind in have:
                status[kit] = "drawn"
                continue
            chain = mat_fb.get(kind, []) if u.get("ground") else \
                [getattr(vocab, "FOLK_FALLBACK", "folk.villager")] if u.get("folk") else FALLBACK.get(kind, [])
            stand = next((fb for fb in chain if fb in have), None)
            status[kit] = f"stand-in: {stand}" if stand else "missing"
        rows.append({"kind": kind, "status": status, "size": u["size"], "ground": bool(u.get("ground")), "maps": sorted(u["maps"]), "count": u["count"],
                     "brief": art.get(kind, "")})
    return rows


ARCS = {13: "cc", 14: "lb"}   # books whose plans are an arc's: Book 13 is the Cao Cao arc, Book 14 Lü Bu's fall


def key_prefix(plans_world):
    """The book number the plans' beat keys carry ("2-c1" for the Cao Cao arc's plans)."""
    return {"cc": "2", "lb": "3"}.get(ARCS.get(plans_world, plans_world), str(plans_world))


def plans_arg(v):
    """--plans: a book number, or an arc's name ("cc")."""
    return int(v) if str(v).isdigit() else v


def load(plans_world):
    """The plans module of a book: (PLANS, tables, zh)."""
    plans_world = ARCS.get(plans_world, plans_world)
    if plans_world == 2:
        import tk_plans_w2 as mod
        return mod.PLANS2, {"NEW_KINDS": mod.NEW_KINDS, "LINE_KINDS": mod.LINE_KINDS, "ZONE_KINDS": mod.ZONE_KINDS,
                            "ART": getattr(mod, "ART", {})}, getattr(mod, "ZH_PLACES2", {})
    if plans_world == "cc":   # the Cao Cao arc (Book 2's chapters 3-5): beat keys "2-c…"
        import tk_plans_cc as mod
        from tk_places_w2_zh import ZH_PLACES2
        return mod.PLANS_CC, {"NEW_KINDS": mod.NEW_KINDS, "LINE_KINDS": mod.LINE_KINDS, "ZONE_KINDS": mod.ZONE_KINDS,
                              "ART": mod.ART}, ZH_PLACES2
    if plans_world == "lb":   # Lü Bu's fall (Book 3's chapters 13-19): beat keys "3-x…"
        import tk_plans_lb as mod
        from tk_places_w2_zh import ZH_PLACES2
        return mod.PLANS_LB, mod.TABLES, ZH_PLACES2
    if plans_world == 90:   # Talk with Claude: the study, no story
        import tk_plans_w90 as mod
        return mod.PLANS90, mod.TABLES, mod.ZH_PLACES90
    raise SystemExit(f"no plans for book {plans_world}")


def story_world(n, plans_world):
    """The story for a book, keyed as the game keys it ("<n>-<key>")."""
    plans_world = ARCS.get(plans_world, plans_world)
    if plans_world == 2:
        from tk_story_w2_new import WORLD2 as W
    elif plans_world == 90:
        from tk_plans_w90 import WORLD90 as W
    elif plans_world == "cc":
        from tk_story_w2_new import WORLD2_CC as W
    elif plans_world == "lb":
        try:
            from tk_story_w2_new import WORLD2_LB as W
        except ImportError:
            raise SystemExit("no story yet for Lü Bu's fall (Plot's WORLD2_LB in tools/tk_story_w2_new.py)")
    else:
        raise SystemExit(f"no story for book {plans_world}")
    return {**W, "nodes": [{**nd, "key": f"{n}-{nd['key']}"} for nd in W["nodes"]],
            "edges": [[f"{n}-{a}", f"{n}-{b}"] for a, b in W["edges"]]}


def draw_png(m, path):
    """A quick look at a built map: terrain by material, footprints, spots, people."""
    from PIL import Image, ImageDraw
    px = 6
    W, H = m["size"]
    col = {"grass": (122, 168, 96), "dirt": (196, 170, 120), "water": (70, 130, 190), "sand": (215, 200, 150), "void": (20, 20, 24),
           "wall": (80, 70, 65), "wall.city": (80, 70, 65), "road": (226, 206, 160), "path": (230, 215, 175), "bridge": (160, 110, 70),
           "gallery": (180, 70, 55), "court": (205, 200, 185), "passage": (190, 185, 170), "garden": (110, 170, 100), "market": (200, 180, 140),
           "ward": (160, 168, 140), "city": (150, 160, 130), "plateau": (185, 175, 150), "field": (168, 190, 110), "field.wheat": (214, 196, 110),
           "hills": (140, 150, 110), "cliff": (120, 100, 80), "loess": (205, 180, 130), "plain": (180, 190, 120), "camp": (175, 160, 120),
           "stone": (150, 150, 145), "wood": (150, 115, 80), "stage": (170, 120, 120), "curtain": (190, 60, 90), "wall.lattice": (150, 90, 60)}
    img = Image.new("RGB", (W * px, H * px))
    d = ImageDraw.Draw(img, "RGBA")
    leg = m["terrain"]["legend"]
    for y, row in enumerate(m["terrain"]["rows"]):
        for x, ch in enumerate(row):
            d.rectangle([x * px, y * px, x * px + px - 1, y * px + px - 1], fill=col.get(leg[ch], (150, 150, 150)))
    for o in m["objects"]:
        k = o["kind"]
        fill = (150, 60, 50) if k.startswith("building.") else (50, 105, 55) if k.startswith("tree.") else \
            (230, 120, 170) if k.startswith("plant.") else (110, 105, 100)
        d.rectangle([o["x"] * px, o["y"] * px, (o["x"] + o["w"]) * px - 1, (o["y"] + o["h"]) * px - 1], fill=fill + (235,), outline=(25, 20, 20))
    for e in m["exits"]:
        d.rectangle([e["x"] * px, e["y"] * px, (e["x"] + e["w"]) * px, (e["y"] + e["h"]) * px], outline=(250, 230, 90), width=2)
    for s in m["spots"]:
        d.ellipse([s["x"] * px - 4, s["y"] * px - 4, s["x"] * px + 4, s["y"] * px + 4], fill=(240, 40, 160))
    for n in m["npcs"]:
        c = (40, 70, 230) if n.get("challenge") else (240, 240, 240) if not n.get("watch") else (220, 40, 40)
        d.ellipse([n["x"] * px - 3, n["y"] * px - 5, n["x"] * px + 3, n["y"] * px + 1], fill=c, outline=(0, 0, 0))
    img.save(path)


def main():
    import argparse
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--world", type=int, default=2, help="the book number the maps are for")
    ap.add_argument("--plans", type=plans_arg, default=None, help="whose plans: a book number, or an arc (cc) (default: the same book)")
    ap.add_argument("--out", default=None, help="write the maps and region.json here (default: print a summary only)")
    ap.add_argument("--png", action="store_true", help="also draw each map as a PNG next to it")
    ap.add_argument("--assets", default=None, help="write the art to generate (kinds no kit draws natively) to this .md (and .json)")
    ap.add_argument("--kits", default=None, help="the kits folder to check against (default assets/tk/kits)")
    a = ap.parse_args()
    pw = a.plans or a.world
    plans, tables, zh = load(pw)
    world = story_world(a.world, pw)
    maps, places, quests = build_world(a.world, world, plans, tables, zh,
                                       prefix=key_prefix(pw) if key_prefix(pw) != str(a.world) else None)
    for mid, m in maps.items():
        print(f"  {mid:28} {m['archetype']:9} {m['size'][0]:3}x{m['size'][1]:<3} {len(m['objects']):3} objects, "
              f"{len(m['spots'])} spots, {len(m['npcs'])} people, exits to {', '.join(sorted({e['to'] for e in m['exits']}))}")
    problems = verify(maps)
    for x in problems:
        print("PROBLEM", x)
    print(f"{len(maps)} maps, {len(quests)} quests, {len(problems)} problems")
    if a.assets:
        rows = assets(maps, tables, a.kits)
        need = [r for r in rows if any(v != "drawn" for v in r["status"].values())]
        md = [f"# Art to generate for Book {pw}'s maps", "",
              f"Written by `python3 tools/mapfactory/plans.py --world {a.world} --assets {a.assets}` from the built maps. "
              "Each kind below is used by the plans but isn't drawn natively by every kit: a stand-in (a vocab fallback) "
              "shows until its art lands, and \"missing\" means nothing draws it at all. Graphics generates from this list; "
              "rerun after new art to see what's left.", "",
              f"{len(need)} of {len(rows)} kinds need art.", "",
              "| Kind | Size (tiles) | Used | " + " | ".join(sorted(rows[0]["status"])) + " | Brief |",
              "|---|---|---|" + "---|" * len(rows[0]["status"]) + "---|"]
        for r in need:
            size = f"{r['size'][0]}×{r['size'][1]}" if r["size"] else "ground" if r["ground"] else "—"
            md.append(f"| `{r['kind']}` | {size} | {r['count'] or ''} in {len(r['maps'])} map{'s' * (len(r['maps']) != 1)} | "
                      + " | ".join(r["status"][k] for k in sorted(r["status"])) + f" | {r['brief']} |")
        Path(a.assets).write_text("\n".join(md) + "\n")
        Path(a.assets).with_suffix(".json").write_text(json.dumps(need, ensure_ascii=False, indent=1))
        print(f"{len(need)} kinds need art; listed in {a.assets}")
    if a.out:
        d = Path(a.out)
        d.mkdir(parents=True, exist_ok=True)
        for mid, m in maps.items():
            (d / f"{mid}.map.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
            if a.png:
                draw_png(m, d / f"{mid}.png")
        out = {"format": "tk-region/1", "world": a.world, "name": world["name"], "zh": world.get("zh", ""),
               "start": slug(world.get("start") or world["nodes"][0]["place"]), "party": world.get("party", []), "places": places, "quests": quests}
        (d / "region.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
        print("wrote", d)


if __name__ == "__main__":
    main()
