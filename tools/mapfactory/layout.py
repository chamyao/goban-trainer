"""Lay out one place as an abstract map (tk-map/1) from its archetype.

The steps, the same for every place:
  1. exits on the edges facing each linked place, roads from each exit to a hub
  2. a plaza or clearing at the hub (towns, camps, cities)
  3. landmarks from the brief, then the archetype's filler buildings, each with
     its door on a short path to the road; story spots in front of their landmark
  4. a pond, banners, a border of trees or rocks, scattered plants and stones
  5. people near their landmark or the hub
  6. a check that every exit, spot and person can be walked to; if not, the
     layout is redrawn with the next seed
"""
import random
from collections import deque

from vocab import KINDS

LEGEND = {".": "grass", "=": "dirt", "~": "water", ":": "sand"}
MAT = {v: k for k, v in LEGEND.items()}

# size, plaza (w, h) or None, filler buildings, border kinds, decor {kind: count per 100 tiles}, pond
ARCHETYPES = {
    "village": dict(size=(36, 26), plaza=(4, 3), fill=["building.house", "building.house", "building.hut"],
                    border=["tree.small", "tree.grove", "tree.pine"],
                    decor={"plant.bush": 1.4, "plant.flower": 1.6, "plant.grass": 2.0, "tree.small": .5, "rock.small": .3},
                    clusters=(4, ["tree.small", "tree.grove", "plant.bush"]), pond=True),
    "town": dict(size=(42, 30), plaza=(8, 5), fill=["building.house", "building.house", "building.house", "building.shop"],
                 border=["tree.grove", "tree.small", "tree.pine"],
                 decor={"plant.bush": 1.0, "plant.flower": 1.0, "plant.grass": 1.5, "tree.small": .4, "lamp.post": .15},
                 clusters=(3, ["tree.small", "tree.grove", "plant.bush"]), pond=False),
    "city": dict(size=(40, 30), plaza=(8, 5), paved=True,
                 fill=["building.hall", "building.house", "building.house", "building.inn", "building.shop",
                       "building.house", "building.shop", "building.house"],
                 border=["tree.grove", "tree.pine"],
                 decor={"plant.bush": .8, "plant.grass": 1.0, "lamp.post": .2, "tree.small": .3},
                 clusters=(3, ["tree.small", "tree.pine", "plant.bush"]), pond=False),
    "garden": dict(size=(32, 24), plaza=(5, 3), fill=[],
                   border=["tree.peach", "tree.grove", "tree.peach"],
                   decor={"tree.peach": 2.2, "plant.flower": 3.0, "plant.grass": 1.5, "plant.bush": .6},
                   clusters=(3, ["tree.peach", "tree.peach", "plant.flower"]), pond=True),
    "road": dict(size=(46, 22), plaza=None, fill=[],
                 border=["tree.small", "tree.grove", "tree.pine", "rock.big"],
                 decor={"plant.grass": 2.2, "plant.bush": 1.2, "rock.small": .6, "tree.small": .6, "plant.flower": .6},
                 clusters=(6, ["tree.small", "tree.grove", "tree.pine", "plant.bush"]), pond=False),
    "mountain": dict(size=(40, 30), plaza=(5, 4), fill=[],
                     border=["rock.crag", "rock.big", "tree.pine"],
                     decor={"rock.small": 1.2, "tree.pine": 1.2, "rock.crag": .35, "plant.grass": 1.0, "rock.big": .25},
                     clusters=(5, ["rock.crag", "rock.big", "tree.pine", "tree.pine"]), patches=5, pond=False),
    "hills": dict(size=(40, 28), plaza=(5, 4), fill=[],
                  border=["rock.crag", "tree.dead", "rock.big"],
                  decor={"tree.dead": .8, "rock.small": 1.0, "plant.grass": 1.4, "rock.crag": .25, "plant.bush": .5},
                  clusters=(4, ["tree.dead", "rock.crag", "rock.big"]), patches=6, pond=False),
    "camp": dict(size=(38, 28), plaza=(10, 7), fill=["building.tent", "building.tent", "building.tent", "building.tent"],
                 border=["tree.grove", "tree.pine", "rock.big"],
                 decor={"plant.grass": 1.5, "rock.small": .4, "plant.bush": .6},
                 clusters=(3, ["tree.small", "tree.pine", "tree.grove"]),
                 props=["camp.firepit", "camp.firepit", "camp.logs", "camp.hay", "camp.cookfire", "camp.table"],
                 pond=False),
}
BUILDING = ("building.",)
SIDES = {"N": (0, -1), "S": (0, 1), "W": (-1, 0), "E": (1, 0)}


def guess_archetype(name):
    n = name.lower()
    for words, a in [(("road", "trail", "path", "way"), "road"), (("mountain", "pass", "peak"), "mountain"),
                     (("hills", "ridge"), "hills"), (("camp",), "camp"), (("garden",), "garden"),
                     (("gate", "city", "capital"), "city"), (("county", "town"), "town")]:
        if any(w in n for w in words):
            return a
    return "village"


class Layout:
    def __init__(self, place, world_n, seed):
        self.place, self.seed = place, seed
        self.rng = random.Random(seed)
        b = place["brief"]
        self.arch_name = b.get("archetype") or guess_archetype(place["name"])
        self.A = ARCHETYPES[self.arch_name]
        self.W, self.H = self.A["size"]
        self.world_n = world_n
        self.t = [["."] * self.W for _ in range(self.H)]
        self.solid = set()      # cells blocked by solid footprints
        self.used = set()       # cells covered by any object footprint
        self.keep = set()       # cells that must stay clear (door fronts, spots, entries, exits)
        self.road = set()
        self.objects, self.spots, self.npcs, self.exits, self.entries = [], [], [], [], {}
        self.anchors = {}       # landmark id -> door-front cell

    # ---------- helpers ----------
    def inb(self, x, y, m=0):
        return m <= x < self.W - m and m <= y < self.H - m

    def paint(self, cells, ch):
        for x, y in cells:
            if self.inb(x, y):
                self.t[y][x] = ch

    def free_rect(self, x, y, w, h, margin=1, allow_dirt=False):
        for yy in range(y - margin, y + h + margin):
            for xx in range(x - margin, x + w + margin):
                if not self.inb(xx, yy):
                    return False
                inside = x <= xx < x + w and y <= yy < y + h
                if (xx, yy) in self.used or (xx, yy) in self.keep:
                    return False
                if inside:
                    if self.t[yy][xx] == "~" or (xx, yy) in self.road:
                        return False
                    if self.t[yy][xx] == "=" and not allow_dirt:
                        return False
        return True

    def put(self, kind, x, y, w=None, h=None, **extra):
        fw, fh, solid = KINDS[kind]
        w, h = w or fw, h or fh
        o = {"kind": kind, "x": x, "y": y, "w": w, "h": h}
        o.update(extra)
        self.objects.append(o)
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.used.add((xx, yy))
                if solid:
                    self.solid.add((xx, yy))
        return o

    def carve(self, path, width=2):
        for x, y in path:
            for dx in range(width):
                for dy in range(width):
                    c = (x + dx, y + dy)
                    if self.inb(*c) and c not in self.solid:
                        self.road.add(c)
                        self.t[c[1]][c[0]] = "="

    # ---------- 1. exits and roads ----------
    def lay_exits(self):
        rng, W, H = self.rng, self.W, self.H
        self.hub = (W // 2 + rng.randint(-3, 3), H // 2 + rng.randint(-2, 2))
        by_side = {}
        for to, side in self.place["sides"].items():
            by_side.setdefault(side, []).append(to)
        for side, tos in by_side.items():
            n = len(tos)
            for i, to in enumerate(tos):
                if side in "EW":
                    span = H - 8
                    pos = 4 + int(span * (i + 1) / (n + 1)) + rng.randint(-2, 2)
                    x = W - 1 if side == "E" else 0
                    ex = {"to": to, "side": side, "x": x, "y": pos, "w": 1, "h": 2}
                    entry = (W - 3 if side == "E" else 2, pos + 1)
                    mouth = (W - 2 if side == "E" else 0, pos)
                else:
                    span = W - 8
                    pos = 4 + int(span * (i + 1) / (n + 1)) + rng.randint(-2, 2)
                    y = H - 1 if side == "S" else 0
                    ex = {"to": to, "side": side, "x": pos, "y": y, "w": 2, "h": 1}
                    entry = (pos + 1, H - 3 if side == "S" else 2)
                    mouth = (pos, H - 2 if side == "S" else 0)
                self.exits.append(ex)
                self.entries[to] = entry
                self.road_to_hub(mouth, side)
                for dx in range(-1, 3):
                    for dy in range(-1, 3):
                        self.keep.add((mouth[0] + dx, mouth[1] + dy))

    def road_to_hub(self, start, side):
        (x, y), (hx, hy) = start, self.hub
        path = []
        if side in "EW":   # leave the edge horizontally, then turn
            bend = hx if self.rng.random() < .6 else (x + hx) // 2
            step = 1 if bend >= x else -1
            path += [(xx, y) for xx in range(x, bend + step, step)]
            step = 1 if hy >= y else -1
            path += [(bend, yy) for yy in range(y, hy + step, step)]
            step = 1 if hx >= bend else -1
            path += [(xx, hy) for xx in range(bend, hx + step, step)]
        else:
            bend = hy if self.rng.random() < .6 else (y + hy) // 2
            step = 1 if bend >= y else -1
            path += [(x, yy) for yy in range(y, bend + step, step)]
            step = 1 if hx >= x else -1
            path += [(xx, bend) for xx in range(x, hx + step, step)]
            step = 1 if hy >= bend else -1
            path += [(hx, yy) for yy in range(bend, hy + step, step)]
        self.carve(path)

    # ---------- 2. plaza ----------
    def lay_plaza(self):
        pz = self.A.get("plaza")
        if not pz:
            return
        w, h = pz
        x0, y0 = self.hub[0] - w // 2, self.hub[1] - h // 2
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                if self.inb(x, y, 1):
                    self.t[y][x] = "="
        self.plaza = (x0, y0, w, h)

    # ---------- 3. landmarks ----------
    def door_path(self, door):
        """Shortest walk over open ground from a door to the road, carved as dirt."""
        start = door
        seen, q = {start: None}, deque([start])
        while q:
            c = q.popleft()
            if c in self.road or self.t[c[1]][c[0]] == "=" and c != start:
                path = []
                while c is not None:
                    path.append(c)
                    c = seen[c]
                self.carve(path, 1)
                return True
            for dx, dy in SIDES.values():
                n = (c[0] + dx, c[1] + dy)
                if self.inb(*n, 1) and n not in seen and n not in self.used and self.t[n[1]][n[0]] != "~":
                    seen[n] = c
                    q.append(n)
        return False

    def place_landmark(self, kind, lid=None, label=None, node=None, near_hub=False, near=None, lines=None, use=None):
        fw, fh, _ = KINDS[kind]
        building = kind.startswith(BUILDING)
        best = None
        for _ in range(500):
            x = self.rng.randint(2, self.W - fw - 2)
            y = self.rng.randint(2, self.H - fh - 3)
            if not self.free_rect(x, y, fw, fh, margin=1, allow_dirt=not building):
                continue
            door = (x + fw // 2, y + fh)
            if door in self.solid or not self.inb(*door, 1) or self.t[door[1]][door[0]] == "~":
                continue
            # distance from the door to the nearest road or plaza
            d = min((abs(door[0] - rx) + abs(door[1] - ry) for rx, ry in self.road), default=0)
            if hasattr(self, "plaza"):
                px, py, pw, ph = self.plaza
                d = min(d, abs(door[0] - max(px, min(door[0], px + pw - 1))) + abs(door[1] - max(py, min(door[1], py + ph - 1))))
            hub = self.anchors.get(near, self.hub)
            hubd = abs(door[0] - hub[0]) + abs(door[1] - hub[1])
            if near in self.anchors:  # beside another landmark: a few tiles off, never on top of it
                score = abs(hubd - 3) * 4 + self.rng.random()
            else:
                score = abs(d - (2 if building else 1)) * 3 + (hubd * (.5 if (node or near_hub) else .05)) + self.rng.random() * 2
            if best is None or score < best[0]:
                best = (score, x, y, door)
        if best is None:
            return None
        _, x, y, door = best
        o = self.put(kind, x, y, **({"id": lid} if lid else {}))
        if label:
            o["label"] = label
        for dx in (-1, 0, 1):
            for dy in (0, 1):
                self.keep.add((door[0] + dx, door[1] + dy))
        if building:
            self.door_path(door)
        if lid:
            self.anchors[lid] = door
        if node or use:   # a story spot, or one with a use of its own (e.g. "ogs": the go table for live games)
            self.spots.append({"id": lid or f"spot-{node}", "x": door[0] + (0 if fw % 2 == 0 else .5), "y": door[1] + .7,
                               "node": node or "", "label": label or "", **({"use": use, "trigger": "talk"} if use else {}), **(lines or {})})
        return o

    def lay_landmarks(self):
        b = self.place["brief"]
        done_nodes = set()
        for lm in b.get("landmarks", []):
            lines = {k: lm[k] for k in ("intro", "outro", "trigger") if lm.get(k)}
            o = self.place_landmark(lm["kind"], lm.get("id"), lm.get("label"), lm.get("node"), near=lm.get("near"), lines=lines, use=lm.get("use"))
            if o is None:
                raise RuntimeError(f"no room for {lm['kind']}")
            if lm.get("node"):
                done_nodes.add(lm["node"])
        # nodes without a landmark: a spot at the hub
        for n in self.place["nodes"]:
            if n.get("scene") and n["key"] not in done_nodes:
                self.place_landmark("camp.table", f"spot-{n['key']}", "", n["key"], near_hub=True)
        for kind in self.A["fill"]:
            self.place_landmark(kind)
        for kind in self.A.get("props", []):
            self.place_landmark(kind, near_hub=True)

    # ---------- 4. pond, banners, border, decor ----------
    def lay_pond(self):
        if not self.A.get("pond"):
            return
        for _ in range(200):
            w, h = self.rng.randint(4, 7), self.rng.randint(3, 5)
            x, y = self.rng.randint(3, self.W - w - 3), self.rng.randint(3, self.H - h - 3)
            if self.free_rect(x, y, w, h, margin=2):
                cells = [(xx, yy) for yy in range(y, y + h) for xx in range(x, x + w)]
                # a rounded pond inside the rectangle: its corners stay grass
                # (own random stream, so the rest of the layout is unchanged)
                shape = random.Random(x * 1000 + y)
                cx, cy, rx, ry = x + (w - 1) / 2, y + (h - 1) / 2, w / 2, h / 2
                water = [(xx, yy) for xx, yy in cells
                         if ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.05 + shape.uniform(-.1, .15)]
                self.paint(water, "~")
                for c in cells:
                    self.used.add(c)
                return

    def lay_banners(self):
        colour = self.place["brief"].get("banners")
        if not colour:
            return
        kind = f"banner.{colour}"
        targets = [(s["x"], s["y"]) for s in self.spots] + [self.hub]
        placed = 0
        for tx, ty in targets:
            for dx in (-3, 3, -4, 4):
                x, y = int(tx + dx), int(ty) - 1
                if self.free_rect(x, y, 1, 1, margin=0, allow_dirt=False) and placed < 6:
                    self.put(kind, x, y)
                    placed += 1
                    break

    def lay_patches(self):
        """Bare ground on dry places: blobs of overlapping rectangles, at least 3 tiles thick."""
        for _ in range(self.A.get("patches", 0)):
            cx, cy = self.rng.randint(4, self.W - 5), self.rng.randint(4, self.H - 5)
            for _ in range(self.rng.randint(2, 4)):
                w, h = self.rng.randint(3, 6), self.rng.randint(3, 5)
                x0, y0 = cx + self.rng.randint(-3, 1), cy + self.rng.randint(-2, 1)
                for y in range(y0, y0 + h):
                    for x in range(x0, x0 + w):
                        if self.inb(x, y, 2) and (x, y) not in self.used and self.t[y][x] == ".":
                            self.t[y][x] = "="

    def lay_clusters(self):
        """Copses and rock fields: a few tight groups that break up open ground."""
        n, kinds = self.A.get("clusters", (0, []))
        for _ in range(n):
            for _ in range(50):
                cx, cy = self.rng.randint(4, self.W - 5), self.rng.randint(4, self.H - 5)
                if self.free_rect(cx - 2, cy - 2, 5, 5, margin=1):
                    break
            else:
                continue
            for _ in range(self.rng.randint(5, 10)):
                kind = self.rng.choice(kinds)
                fw, fh, solid = KINDS[kind]
                x, y = cx + self.rng.randint(-3, 3), cy + self.rng.randint(-2, 2)
                if self.free_rect(x, y, fw, fh, margin=0):
                    self.put(kind, x, y)

    def lay_border(self):
        kinds = self.A["border"]
        cells = [(x, y) for y in range(self.H) for x in range(self.W)
                 if (x < 2 or y < 2 or x >= self.W - 2 or y >= self.H - 2)]
        self.rng.shuffle(cells)
        for x, y in cells:
            kind = self.rng.choice(kinds)
            fw, fh, _ = KINDS[kind]
            x, y = min(x, self.W - fw), min(y, self.H - fh)
            if self.free_rect(x, y, fw, fh, margin=0) and all((xx, yy) not in self.keep for yy in range(y - 1, y + fh + 1) for xx in range(x - 1, x + fw + 1)):
                self.put(kind, x, y)

    def lay_decor(self):
        area = self.W * self.H / 100
        for kind, per in self.A["decor"].items():
            n = int(per * area)
            fw, fh, solid = KINDS[kind]
            for _ in range(n * 30):
                if n <= 0:
                    break
                x, y = self.rng.randint(2, self.W - fw - 2), self.rng.randint(2, self.H - fh - 2)
                if self.free_rect(x, y, fw, fh, margin=1 if solid else 0):
                    self.put(kind, x, y)
                    n -= 1

    # ---------- 5. people ----------
    def lay_npcs(self):
        for i, p in enumerate(self.place["brief"].get("npcs", [])):
            cx, cy = self.anchors.get(p.get("near"), self.hub)
            for r in range(2, 9):
                cands = [(cx + dx, cy + dy) for dx in range(-r, r + 1) for dy in range(-r, r + 1)
                         if abs(dx) + abs(dy) >= 2]
                self.rng.shuffle(cands)
                ok = [c for c in cands if self.inb(*c, 2) and c not in self.used and c not in self.keep
                      and self.t[c[1]][c[0]] != "~" and not any(abs(c[0] - n["x"]) + abs(c[1] - n["y"]) < 2 for n in self.npcs)]
                if ok:
                    x, y = ok[0]
                    npc = {"id": f"npc-{i + 1}", "kind": p["kind"], "x": x + .5, "y": y + .9, "say": [p["say"]] if isinstance(p.get("say"), str) else p.get("say", [])}
                    if p["kind"].startswith("folk.") and not p.get("near") and not p.get("challenge"):
                        npc["wander"] = True
                    for k in ("challenge", "intro", "win", "done", "until", "face"):  # challengers and story people
                        if p.get(k):
                            npc[k] = p[k]
                    self.npcs.append(npc)
                    self.used.add((x, y))
                    break

    # ---------- 6. check ----------
    def walkable(self, c):
        x, y = c
        return self.inb(x, y) and c not in self.solid and self.t[y][x] != "~"

    def check(self):
        start = self.entries[""]
        seen, q = {start}, deque([start])
        while q:
            c = q.popleft()
            for dx, dy in SIDES.values():
                n = (c[0] + dx, c[1] + dy)
                if n not in seen and self.walkable(n):
                    seen.add(n)
                    q.append(n)
        need = [("entry " + k, v) for k, v in self.entries.items()]
        need += [("spot " + s["id"], (int(s["x"]), int(s["y"]))) for s in self.spots]
        need += [("npc " + n["id"], (int(n["x"]), int(n["y"]))) for n in self.npcs]
        missing = [name for name, c in need if c not in seen]
        return missing

    def build(self):
        self.lay_exits()
        self.lay_plaza()
        self.lay_landmarks()
        # a first arrival (a new game) starts at the first landmark's door, or the hub
        first = next(iter(self.anchors.values()), None)
        self.entries[""] = (first[0], first[1] + 1) if first else self.hub
        self.lay_pond()
        self.lay_banners()
        self.lay_patches()
        self.lay_clusters()
        self.lay_border()
        self.lay_decor()
        self.lay_npcs()
        missing = self.check()
        if missing:
            raise RuntimeError("unreachable: " + ", ".join(missing))
        if self.A.get("paved"):   # a city's streets and square are paved
            self.t = [[":" if ch == "=" else ch for ch in row] for row in self.t]
        return {
            "format": "tk-map/1",
            "id": self.place["id"],
            "world": self.world_n,
            "name": self.place["name"],
            "archetype": self.arch_name,
            "size": [self.W, self.H],
            "seed": self.seed,
            "terrain": {"legend": LEGEND, "rows": ["".join(r) for r in self.t]},
            "objects": self.objects,
            "spots": self.spots,
            "npcs": self.npcs,
            "exits": self.exits,
            "entries": {k: list(v) for k, v in self.entries.items()},
        }


def layout(place, world_n, base_seed, tries=40):
    last = None
    for k in range(tries):
        try:
            return Layout(place, world_n, base_seed + k * 7919).build()
        except RuntimeError as e:
            last = e
    raise RuntimeError(f"{place['name']}: no valid layout after {tries} tries ({last})")
