"""Room for the townsfolk who wander.

tk-world.js turns a wanderer back once he is 40 px (2.5 tiles) from home, so that is how far he roams. His home keeps
that far and another tile from every drawn face (a building's footprint and the roof drawn 3 tiles above it, a tree's
or rock's 2): otherwise he walks over the face, and a tap on it picks him instead of the door (Testing: Zhuo County's
villager on the shop). Both builders settle their wanderers here, and compile checks it on every map.
"""
from collections import deque

from vocab import KINDS

TALL = ("building", "tree", "rock", "ruin")   # what draws a face above its footprint
ROAM = 3.5                                    # tiles of room around a wanderer's home
NOT_WALKED = {"water", "wall", "void"}


def _solid(o):
    return o.get("solid", KINDS.get(o["kind"], (0, 0, False))[2])


def faces(m):
    """Every tile a tall solid thing draws over: its footprint and the roof or crown above it."""
    out = set()
    for o in m["objects"]:
        if o["kind"].split(".")[0] in TALL and _solid(o):
            rise = 3 if o["kind"].startswith("building.") else 2
            x, y, w, h = int(o["x"]), int(o["y"]), max(1, round(o.get("w", 1))), max(1, round(o.get("h", 1)))
            out |= {(xx, yy) for xx in range(x, x + w) for yy in range(y - rise, y + h)}
    return out


def roomy(t, face):
    r = int(ROAM) + 1
    return not any((t[0] + i, t[1] + j) in face for i in range(-r, r + 1) for j in range(-r, r + 1) if i * i + j * j <= ROAM ** 2)


def cramped(m):
    """The wanderers whose roaming would take them over a drawn face."""
    face = faces(m)
    return [n["id"] for n in m["npcs"] if n.get("wander") and not roomy((int(n["x"]), int(n["y"])), face)]


def settle(m, walkable=None, reach=14):
    """Move each cramped wanderer to the nearest tile he can walk to that has room; with none within reach he stands
    still instead. Returns {id: (old tile, new tile or None)}."""
    W, H = m["size"]
    legend, rows = m["terrain"]["legend"], m["terrain"]["rows"]
    walk = m["terrain"].get("walk", {})
    solid = set()
    for o in m["objects"]:
        if _solid(o):
            x, y, w, h = int(o["x"]), int(o["y"]), max(1, round(o.get("w", 1))), max(1, round(o.get("h", 1)))
            solid |= {(xx, yy) for xx in range(x, x + w) for yy in range(y, y + h)}
    if walkable is None:
        def walkable(t):
            x, y = t
            if not (1 <= x < W - 1 and 1 <= y < H - 1) or t in solid:
                return False
            mat = legend[rows[y][x]]
            return walk.get(mat, mat not in NOT_WALKED)
    face = faces(m)
    near_exit = set()
    for e in m.get("exits", []):
        ex, ey, ew, eh = int(e["x"]), int(e["y"]), max(1, round(e.get("w", 1))), max(1, round(e.get("h", 1)))
        near_exit |= {(xx, yy) for xx in range(ex - 1, ex + ew + 1) for yy in range(ey - 1, ey + eh + 1)}
        if e.get("w", 1) < 1.5 and e.get("h", 1) < 1.5:   # a door: and the way straight in, 3 wide and 6 out (door lanes)
            ux, uy = {"N": (0, 1), "S": (0, -1), "E": (-1, 0), "W": (1, 0)}.get(e.get("side", "N"), (0, 1))
            cx, cy = int(e["x"] + e.get("w", 1) / 2), int(e["y"] + e.get("h", 1) / 2)
            near_exit |= {(cx + k * ux + j * uy, cy + k * uy + j * ux) for k in range(7) for j in (-1, 0, 1)}
    taken = {(int(s["x"]), int(s["y"])) for s in m.get("spots", [])}
    moved = {}
    for n in m["npcs"]:
        home = (int(n["x"]), int(n["y"]))
        if not n.get("wander") or roomy(home, face):
            taken.add(home)
            continue
        others = {(int(o["x"]), int(o["y"])) for o in m["npcs"] if o is not n}
        busy = taken | others | near_exit
        seen, q, to = {home: 0}, deque([home]), None
        while q:
            t = q.popleft()
            if t != home and t not in busy and roomy(t, face) and \
                    not any((t[0] + i, t[1] + j) in others for i in (-1, 0, 1) for j in (-1, 0, 1)):
                to = t
                break
            if seen[t] >= reach:
                continue
            for dx, dy in ((0, 1), (1, 0), (-1, 0), (0, -1)):
                u = (t[0] + dx, t[1] + dy)
                if u not in seen and walkable(u):
                    seen[u] = seen[t] + 1
                    q.append(u)
        if to:
            n["x"], n["y"] = to[0] + .5, to[1] + .9
            taken.add(to)
        else:
            n["wander"] = False
            taken.add(home)
        moved[n["id"]] = (home, to)
    return moved
