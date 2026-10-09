# Lady Sun's marriage (Book 15): the map proofs that the book's beats lean on, on the plans' own walk grid.
#   1. Sweet Dew Temple: the abbot's hall can't be reached without passing the axemen (within 3 tiles of one), since
#      Zhao Yun has to have walked the corridors (「雲於廊下巡視，見房內有刀斧手埋伏」).
#   2. The road to Chaisang: from where the road block stood to s14, every way comes within 3 tiles of each rank of the
#      pursuers, so each must be faced down (the face-down; pushing past is a catch).
#   3. Nanxu: the news can go from the dock to Lady Wu's gate house by house, each step at most 20 tiles of walking
#      (the loud town; a told townsperson walks to the next house).
import sys
from collections import deque
sys.path[:0] = ["tools", "tools/mapfactory"]
import plans  # noqa: E402

P, tables, zh = plans.load("ls")


def builder(pid):
    b = P[pid]
    mb = plans.MapBuilder(15, pid, pid, b["plan"], tables, 1, pid, b.get("archetype", "city"))
    mb.build(b, b.get("npcs", []), b.get("challengers", []), b.get("watchers", []))
    return mb


def walk(mb, start, blocked=frozenset()):
    """Walking distance in tiles from start to every tile it reaches."""
    d = {start: 0}
    q = deque([start])
    while q:
        t = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            u = (t[0] + dx, t[1] + dy)
            if u not in d and u not in blocked and mb.walkable(u):
                d[u] = d[t] + 1
                q.append(u)
    return d


def near(points, r):
    return {(x + i, y + j) for x, y in points for i in range(-r, r + 1) for j in range(-r, r + 1) if i * i + j * j <= r * r}


def tile(p):
    return int(p["x"]), int(p["y"])


STEP = 20   # tiles of walking from one house that knows to the next: a told townsperson carries it that far
ok = True

# 1. the temple's corridors
mb = builder("Sweet Dew Temple")
start = mb.near_cell((10, 14), want_visible=False)
door = mb.anchor["abbot"]
axemen = [tile(n) for n in mb.npcs if n["kind"] == "folk.soldier"]
free = walk(mb, start)
past = walk(mb, start, frozenset(near(axemen, 3)))
r1 = door in free and door not in past
print(f"temple: the abbot's door is reachable: {door in free}; without passing the axemen ({len(axemen)}): {door in past} -> {'ok' if r1 else 'FAIL'}")
ok &= r1

# 2. the face-down on the road
mb = builder("The road to Chaisang")
spots = {s["id"]: tile(s) for s in mb.spots}
yielders = [tile(n) for n in mb.npcs if n.get("yield")]
ranks = {}
for y in yielders:
    ranks.setdefault(y[0] // mb.C, []).append(y)
s14 = spots["s14"]
goal = {(s14[0] + i, s14[1] + j) for i in (-1, 0, 1) for j in (-1, 0, 1)}
reach = walk(mb, spots["block-start"])
r2 = bool(goal & set(reach))
print(f"road: s14 reachable from where the block stood: {r2}")
for cx, rank in sorted(ranks.items()):
    by = walk(mb, spots["block-start"], frozenset(near(rank, 3)))
    held = not (goal & set(by))
    print(f"  the rank at cell x={cx} ({len(rank)} men): no way past without coming within 3 tiles: {held}")
    r2 &= held
ok &= r2

# 3. the loud town
mb = builder("Nanxu")
houses = {o["id"]: mb.anchor[o["id"]] for o in mb.objects if o.get("news")}
spots = {s["id"]: tile(s) for s in mb.spots}
nodes = {"dock": spots["dock"], **houses, "wu-gate": spots["wu-gate"]}
dist = {k: walk(mb, v) for k, v in nodes.items()}
told, frontier = {"dock"}, ["dock"]
while frontier:
    a = frontier.pop()
    for b, t in nodes.items():
        if b not in told and dist[a].get(t, 10 ** 9) <= STEP:
            told.add(b)
            frontier.append(b)
r3 = "wu-gate" in told
print(f"town: the news goes from the dock to {len(told) - 1} of {len(nodes) - 1} houses and gates, steps <= {STEP} tiles; "
      f"it reaches Lady Wu's gate: {r3}")
ok &= r3

print("all ok" if ok else "FAILED")
sys.exit(0 if ok else 1)
