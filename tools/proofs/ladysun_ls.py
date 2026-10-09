# Lady Sun's marriage (Book 15): the map proofs that the book's beats lean on, on the plans' own walk grid.
#   1. Sweet Dew Temple: the abbot's hall can't be reached without passing the axemen (within 3 tiles of one), since
#      Zhao Yun has to have walked the corridors (「雲於廊下巡視，見房內有刀斧手埋伏」).
#   2. The road to Chaisang: from where the road block stood to s14, every way comes within 1.4 tiles of a man of each
#      rank (tk-feats.js: moving that close to one who hasn't yielded is a catch), so each rank must be faced down; and
#      each man's place to step aside into is off the road.
#   3. Nanxu, the loud town: the gossips' "tells" chains. Every gossip can be walked to; the news reaches Lady Wu's
#      gatekeeper (who fires s4) only by the chain from Qiao Guolao's gate; every red hanging names a gossip.
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

# 2. the face-down on the road: a tile is closed if her feet there are within 1.4 tiles of a man's feet
mb = builder("The road to Chaisang")
spots = {s["id"]: tile(s) for s in mb.spots}
men = [n for n in mb.npcs if n.get("yield")]
s14 = spots["s14"]
goal = {(s14[0] + i, s14[1] + j) for i in (-1, 0, 1) for j in (-1, 0, 1)}


def closed(group):
    feet = [(n["x"], n["y"]) for n in men if n["yield"]["group"] == group]
    return {(x, y) for x in range(mb.W) for y in range(mb.H)
            if any((x + .5 - fx) ** 2 + (y + .9 - fy) ** 2 < 1.4 ** 2 for fx, fy in feet)}


reach = walk(mb, spots["block-start"])
r2 = bool(goal & set(reach))
print(f"road: s14 reachable from where the block stood: {r2}")
road = set(mb.lines_tiles("road")) if hasattr(mb, "lines_tiles") else set()
for group in sorted({n["yield"]["group"] for n in men}):
    held = not (goal & set(walk(mb, spots["block-start"], frozenset(closed(group)))))
    asides = [(int(n["x"] + n["yield"]["aside"][0]), int(n["y"] + n["yield"]["aside"][1] - .9)) for n in men if n["yield"]["group"] == group]
    off_road = all(mb.walkable(a) and abs(a[1] - spots["block-start"][1]) >= 2 for a in asides)
    print(f"  {group}: {sum(n['yield']['group'] == group for n in men)} men; no way past without coming within 1.4 tiles: {held}; "
          f"each steps aside onto open ground off the road: {off_road} {asides}")
    r2 &= held and off_road
ok &= r2

# 3. the loud town
mb = builder("Nanxu")
people = {n["id"]: n for n in mb.npcs}
gossips = {k: n for k, n in people.items() if n.get("gossip")}
fires = next(s for s in mb.spots if s.get("fires"))
target = fires["fires"].split(":", 1)[1]
dock = tile(next(s for s in mb.spots if s["id"] == "dock"))
reach = walk(mb, dock)
unwalked = [k for k, n in gossips.items() if not any((tile(n)[0] + i, tile(n)[1] + j) in reach for i in (-1, 0, 1) for j in (-1, 0, 1))]


def spread(first):
    told, todo = {first}, [first]
    while todo:
        for m in (people[todo.pop()].get("gossip") or {}).get("tells", []):
            if m not in told:
                told.add(m)
                todo.append(m)
    return told


starts = sorted(k for k in gossips if target in spread(k))
heads = {k for k in gossips if not any(k in (g["gossip"]["tells"]) for g in gossips.values())}
hangings = [o for o in mb.objects if o.get("told")]
bad_hangings = [o["told"] for o in hangings if o["told"] not in gossips]
r3 = (not unwalked and target in people and not people[target].get("gossip") and starts
      and all(k in spread("g-qiao") for k in starts) and not bad_hangings and len(hangings) == 12)
print(f"town: {len(gossips)} gossips in {len(heads)} chains (heads {sorted(heads)}); all walkable from the dock: {not unwalked}")
print(f"  s4 fires on {target} (told, not tellable: {target in people and not people[target].get('gossip')}); "
      f"tellings that reach him: {starts}, all on the chain from Qiao Guolao's gate: {all(k in spread('g-qiao') for k in starts)}")
print(f"  red hangings: {len(hangings)}, each naming a gossip: {not bad_hangings}")
ok &= bool(r3)

print("all ok" if ok else "FAILED")
sys.exit(0 if ok else 1)
