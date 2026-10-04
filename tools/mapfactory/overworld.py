"""The overworld: one walkable map of the whole world, with every place on it.

    region (places, links) + story nodes (x, y)  →  data/tk_maps/w<N>/overworld.map.json

Like a world map in an old adventure game, you walk the party between
towns instead of picking them from a list. Each place stands where it sat
on the story's node map, drawn as a small cluster that says what it is
(huts for a village, a hall and houses for a city, tents for a camp, crags
for a mountain pass, peach trees for the garden); roads follow the story's
links between places; forests, hills and lakes fill the country between.

Every place has an entrance in front of its cluster: an ordinary exit, so
the world's own rule applies (places the story hasn't opened stay shut,
with a word to say so). Coming out of a place onto the overworld, you
stand at its entrance ("entries" keyed by place id). It is an ordinary
tk-map/1 map, so every art kit draws it.
"""
import random
from collections import deque

from vocab import KINDS

W, H = 80, 48
LEGEND = {".": "grass", "=": "dirt", "~": "water", ":": "sand"}

# what each kind of place looks like from afar: (kind, dx, dy) around the entrance at (0, 0)
SITES = {
    "village": [("building.hut", -4, -3), ("building.house", 0, -3), ("tree.small", 4, -2), ("plant.flower", -1, -1)],
    "town": [("building.house", -5, -3), ("building.shop", -1, -3), ("building.house", 2, -3), ("lamp.post", -2, -1)],
    "city": [("building.hall", -2, -4), ("building.house", -6, -3), ("building.inn", 2, -3), ("banner.red", -3, -1),
             ("banner.red", 2, -1)],
    "garden": [("tree.peach_big", -1, -3), ("tree.peach", -3, -2), ("tree.peach", 2, -2), ("building.moongate", -1, -1)],
    "road": [("landmark.notice", -3, -1), ("tree.small", 2, -2), ("rock.small", 1, -1)],
    "mountain": [("rock.crag", -2, -3), ("rock.crag", 1, -4), ("tree.pine", -4, -2), ("tree.pine", 3, -2)],
    "hills": [("rock.crag", -1, -3), ("tree.dead", -3, -2), ("tree.dead", 2, -2), ("rock.big", 3, -4)],
    "camp": [("building.tent", -4, -3), ("building.tent", 1, -3), ("camp.firepit", -1, -1), ("banner.yellow", 3, -1)],
}
FILL = {  # the country between: per 100 tiles
    "tree.grove": 1.1, "tree.small": 1.0, "tree.pine": .6, "plant.bush": 1.2, "plant.flower": 1.0, "plant.grass": 1.6,
    "rock.small": .5, "rock.big": .25,
}


class Overworld:
    def __init__(self, places, nodes, n, seed):
        self.rng = random.Random(seed)
        self.n = n
        self.t = [["."] * W for _ in range(H)]
        self.used, self.keep = set(), set()
        self.objects, self.exits, self.entries = [], [], {}
        # where each place sat on the node map, scaled onto ours
        xy = {}
        for nd in nodes:
            xy.setdefault(nd["place"], []).append((nd["x"], nd["y"]))
        xs = [x for v in xy.values() for x, _ in v]
        ys = [y for v in xy.values() for _, y in v]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        self.places = []
        cen = {}
        for p in places:
            pts = xy.get(p["name"])
            if pts:
                cen[p["id"]] = (sum(a for a, _ in pts) / len(pts), sum(b for _, b in pts) / len(pts))
        # half by position, half by rank: the node map bunches its places low and to
        # the left; ranks spread them over the whole country, positions keep its shape
        rx = {pid: i / max(1, len(cen) - 1) for i, pid in enumerate(sorted(cen, key=lambda k: cen[k][0]))}
        ry = {pid: i / max(1, len(cen) - 1) for i, pid in enumerate(sorted(cen, key=lambda k: cen[k][1]))}
        for p in places:
            if p["id"] not in cen:
                continue
            cx, cy = cen[p["id"]]
            fx = .5 * (cx - x0) / max(1, x1 - x0) + .5 * rx[p["id"]]
            fy = .5 * (cy - y0) / max(1, y1 - y0) + .5 * ry[p["id"]]
            gx = 7 + round(fx * (W - 15))
            gy = 9 + round(fy * (H - 17))   # the entry, 2 below, stays clear of the border
            self.places.append(dict(p, at=(gx, gy)))
        self.spread()

    # ---------- helpers ----------
    def inb(self, x, y, m=1):
        return m <= x < W - m and m <= y < H - m

    def free(self, x, y, w, h):
        return all(self.inb(xx, yy) and (xx, yy) not in self.used and (xx, yy) not in self.keep and self.t[yy][xx] != "~"
                   for yy in range(y, y + h) for xx in range(x, x + w))

    def put(self, kind, x, y, **extra):
        w, h, _ = KINDS[kind]
        self.objects.append({"kind": kind, "x": x, "y": y, "w": w, "h": h, **extra})
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.used.add((xx, yy))

    def spread(self):
        """Nudge places apart so their clusters don't overlap (at least 9 x 6 tiles between entrances)."""
        for _ in range(60):
            moved = False
            for a in self.places:
                for b in self.places:
                    if a is b:
                        continue
                    (ax, ay), (bx, by) = a["at"], b["at"]
                    if abs(ax - bx) < 12 and abs(ay - by) < 8:
                        dx = 1 if ax >= bx else -1
                        dy = 1 if ay >= by else -1
                        if abs(ax - bx) >= abs(ay - by) * 1.4:
                            a["at"] = (max(7, min(W - 8, ax + dx)), ay)
                        else:
                            a["at"] = (ax, max(9, min(H - 7, ay + dy)))
                        moved = True
            if not moved:
                break

    # ---------- roads ----------
    def road(self, a, b):
        """A dirt road between two entrances: a path that wanders a little and keeps off the sites."""
        start, goal = (a[0], a[1] + 1), (b[0], b[1] + 1)
        cost = {start: 0}
        prev = {start: None}
        q = [(0, start)]
        import heapq
        while q:
            d, c = heapq.heappop(q)
            if c == goal:
                break
            if d > cost.get(c, 1e9):
                continue
            for n in ((c[0] + 1, c[1]), (c[0] - 1, c[1]), (c[0], c[1] + 1), (c[0], c[1] - 1)):
                if not self.inb(*n, 2) or (n in self.used and n != goal):
                    continue
                step = 1 + (0 if self.t[n[1]][n[0]] == "=" else .6) + self.noise[n[1]][n[0]]
                nd = d + step
                if nd < cost.get(n, 1e9):
                    cost[n], prev[n] = nd, c
                    heapq.heappush(q, (nd, n))
        c = goal
        while c is not None:
            self.t[c[1]][c[0]] = "="
            self.keep.add(c)
            c = prev.get(c)

    # ---------- build ----------
    def build(self, links, start):
        self.noise = [[self.rng.random() * .8 for _ in range(W)] for _ in range(H)]
        # every entrance and the ground in front of it is kept clear first, so no
        # place's cluster can sit on another's doorstep
        for p in self.places:
            ex, ey = p["at"]
            self.keep.update({(ex + dx, ey + dy) for dx in (-1, 0, 1) for dy in (0, 1, 2, 3)})
        # sites: the cluster, a patch of road in front, the entrance
        for p in self.places:
            ex, ey = p["at"]
            for kind, dx, dy in SITES.get(p["archetype"], SITES["village"]):
                w, h, _ = KINDS[kind]
                x, y = ex + dx, ey + dy - (h - 1)
                if self.free(x, y, w, h):
                    self.put(kind, x, y)
            for dx in (-1, 0, 1):
                self.t[ey][ex + dx] = "="
                self.keep.add((ex + dx, ey))
            self.t[ey + 1][ex] = "="
            self.keep.add((ex, ey + 1))
            # the entrance: step onto the square in front of the place
            self.exits.append({"to": p["id"], "side": "N", "x": ex - .5, "y": ey - .2, "w": 2, "h": .9})
            self.entries[p["id"]] = [ex, ey + 2]
            self.keep.update({(ex, ey + 2), (ex, ey + 3)})
        self.entries[""] = self.entries.get(start) or [W // 2, H // 2]
        # roads along the story's links
        at = {p["id"]: p["at"] for p in self.places}
        done = set()
        for p in self.places:
            for l in links.get(p["id"], []):
                if l in at and frozenset((p["id"], l)) not in done:
                    done.add(frozenset((p["id"], l)))
                    self.road(at[p["id"]], at[l])
        # a lake or two where the country is empty
        for _ in range(2):
            for _ in range(200):
                w, h = self.rng.randint(5, 8), self.rng.randint(3, 5)
                x, y = self.rng.randint(4, W - w - 4), self.rng.randint(4, H - h - 4)
                if self.free(x - 2, y - 2, w + 4, h + 4) and all(self.t[yy][xx] == "." for yy in range(y - 2, y + h + 2) for xx in range(x - 2, x + w + 2)):
                    cx, cy = x + (w - 1) / 2, y + (h - 1) / 2
                    for yy in range(y, y + h):
                        for xx in range(x, x + w):
                            if ((xx - cx) / (w / 2)) ** 2 + ((yy - cy) / (h / 2)) ** 2 <= 1.05:
                                self.t[yy][xx] = "~"
                                self.used.add((xx, yy))
                    break
        # mountains rise around the mountain and hill places
        for p in self.places:
            if p["archetype"] in ("mountain", "hills"):
                ex, ey = p["at"]
                for _ in range(10):
                    kind = self.rng.choice(["rock.crag", "rock.big", "tree.pine" if p["archetype"] == "mountain" else "tree.dead"])
                    w, h, _ = KINDS[kind]
                    x, y = ex + self.rng.randint(-9, 8), ey + self.rng.randint(-8, 3)
                    if self.free(x - 1, y - 1, w + 2, h + 2) and all(self.t[yy][xx] == "." for yy in range(y, y + h) for xx in range(x, x + w)):
                        self.put(kind, x, y)
        # a border of forest, then the country between
        for y in range(H):
            for x in range(W):
                if (x < 2 or y < 2 or x >= W - 2 or y >= H - 2) and (x, y) not in self.used:
                    kind = self.rng.choice(["tree.grove", "tree.small", "tree.pine"])
                    w, h, _ = KINDS[kind]
                    if x + w <= W and y + h <= H and all((xx, yy) not in self.used for yy in range(y, y + h) for xx in range(x, x + w)):
                        self.put(kind, x, y)
        area = W * H / 100
        for kind, per in FILL.items():
            w, h, solid = KINDS[kind]
            n = int(per * area)
            for _ in range(n * 20):
                if n <= 0:
                    break
                x, y = self.rng.randint(2, W - w - 2), self.rng.randint(2, H - h - 2)
                if self.free(x - (1 if solid else 0), y - (1 if solid else 0), w + (2 if solid else 0), h + (2 if solid else 0)) \
                        and all(self.t[yy][xx] == "." for yy in range(y, y + h) for xx in range(x, x + w)):
                    self.put(kind, x, y)
                    n -= 1
        missing = self.check()
        if missing:
            raise RuntimeError("overworld: can't walk to " + ", ".join(missing))
        return {
            "format": "tk-map/1", "id": "overworld", "world": self.n, "name": "The Realm", "archetype": "overworld",
            "size": [W, H], "seed": self.rng.random(),
            "terrain": {"legend": LEGEND, "rows": ["".join(r) for r in self.t]},
            "objects": self.objects, "spots": [], "npcs": [], "exits": self.exits, "entries": self.entries,
        }

    def check(self):
        solid = {(xx, yy) for o in self.objects if KINDS[o["kind"]][2]
                 for yy in range(o["y"], o["y"] + o["h"]) for xx in range(o["x"], o["x"] + o["w"])}
        ok = lambda c: self.inb(*c, 0) and self.t[c[1]][c[0]] != "~" and c not in solid
        start = tuple(self.entries[""])
        seen, q = {start}, deque([start])
        while q:
            x, y = q.popleft()
            for c in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if c not in seen and ok(c):
                    seen.add(c)
                    q.append(c)
        return [pid for pid, (x, y) in self.entries.items() if pid and ((x, y) not in seen or (x, y - 2) not in seen)]


def build_overworld(places, nodes, links, start, n):
    for seed in range(20):
        try:
            return Overworld(places, nodes, n, 7000 + n * 100 + seed).build(links, start)
        except RuntimeError as e:
            err = e
    raise err
