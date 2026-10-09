# Lady Sun's marriage (Book 15): the map proofs that the book's beats lean on, on the plans' own walk grid.
#   1. Sweet Dew Temple: the axemen (「伏於兩廊」) are in three of six side rooms that look alike from outside, and
#      each group delivers the mark s5's gate needs; every side room can be walked into.
#   2. The road to Chaisang, both face-downs: from where each block began to the beat past it, every way comes within
#      1.4 tiles of a man of each rank (tk-feats.js: moving that close to one who hasn't yielded is a catch), so each
#      rank must be faced down; and each man's place to step aside into is off the road.
#   3. Nanxu, the loud town: the player tells at most three; the rest are relays a chain reaches; the news reaches Lady
#      Wu's gatekeeper (on whom s4 and her palace door wait) only by the chain from Qiao Guolao's gate, quickly; every
#      red hanging lights.
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

# 1. the temple's side rooms: s5's gate needs axemen_1-3 (Plot). Each is delivered by a spot in a side room, where the
#    axemen are; all six side rooms look alike from outside (searching, not knowing); every one can be walked into.
mb = builder("Sweet Dew Temple")
P_t = P["Sweet Dew Temple"]
start = mb.near_cell((10, 14), want_visible=False)
free = walk(mb, start)
sides = [t for t in P_t["plan"]["things"] if str(t.get("map", "")).startswith("side-")]
marks = {sp["delivers"]: m for m, sub in P_t["maps"].items() for sp in sub.get("spots", []) if sp.get("delivers")}
axemen = {m: sum(1 for n in P_t["npcs"] if n.get("place") == m and n["kind"] == "folk.soldier") for m in marks.values()}
doors = {t["id"]: mb.anchor.get(t["id"]) for t in sides}
open_doors = {k: d is not None and any((d[0] + i, d[1] + j) in free for i in (-1, 0, 1) for j in (-1, 0, 1)) for k, d in doors.items()}
alike = len({t["label"] for t in sides}) == 1 and len({P_t["maps"][t["map"]].get("label") for t in sides}) == 1
r1 = (sorted(marks) == ["axemen_1", "axemen_2", "axemen_3"] and all(v >= 3 for v in axemen.values())
      and len(sides) - len(marks) >= 3 and alike and all(open_doors.values()) and mb.anchor["abbot"] in free)
print(f"temple: {len(sides)} side rooms, alike from outside: {alike}; axemen in {sorted(marks.values())} ({axemen}), "
      f"delivering {sorted(marks)}; {len(sides) - len(marks)} with monks; every door walkable to: {all(open_doors.values())} "
      f"-> {'ok' if r1 else 'FAIL'}")
ok &= r1

# 2. the face-downs on the road: for each rank, from where its block began to the beat past it, every way comes within
#    1.4 tiles of a man of it (her feet to his), so each rank must be faced down; and each man steps aside off the road.
mb = builder("The road to Chaisang")
spots = {s["id"]: tile(s) for s in mb.spots}
men = [n for n in mb.npcs if n.get("yield")]


def closed(group):
    feet = [(n["x"], n["y"]) for n in men if n["yield"]["group"] == group]
    return {(x, y) for x in range(mb.W) for y in range(mb.H)
            if any((x + .5 - fx) ** 2 + (y + .9 - fy) ** 2 < 1.4 ** 2 for fx, fy in feet)}


r2 = True
for group in sorted({n["yield"]["group"] for n in men}, key=lambda g: min(n["x"] for n in men if n["yield"]["group"] == g)):
    ms = [n for n in men if n["yield"]["group"] == group]
    back, past = spots[ms[0]["yield"]["back_to"]], spots[ms[0]["until"].split("-")[-1]]
    goal = {(past[0] + i, past[1] + j) for i in (-1, 0, 1) for j in (-1, 0, 1)}
    way = bool(goal & set(walk(mb, back)))
    held = not (goal & set(walk(mb, back, frozenset(closed(group)))))
    asides = [(int(n["x"] + n["yield"]["aside"][0]), int(n["y"] + n["yield"]["aside"][1] - .9)) for n in ms]
    off_road = all(mb.walkable(a) and abs(a[1] - back[1]) >= 2 for a in asides)
    behind = all(n["x"] > back[0] and n["x"] < past[0] for n in ms)
    print(f"road: {group}: {len(ms)} men between {ms[0]['yield']['back_to']} and {ms[0]['until']}: {behind}; the way is open: {way}; "
          f"no way past without coming within 1.4 tiles: {held}; each steps aside onto open ground off the road: {off_road}")
    r2 &= way and held and off_road and behind
ok &= r2

# 3. the loud town: the player tells at most three people; every relay is reached by a chain from one of them; only
#    the chain from Qiao Guolao's gate reaches Lady Wu's gatekeeper, and it gets there quickly. A teller walks the
#    way to his neighbour (findPath) at HURRY px/s and tells him after a wait of up to WAIT s (tk-feats.js).
HURRY, WAIT, QUICK = 80, 1.5, 25
mb = builder("Nanxu")
people = {n["id"]: n for n in mb.npcs}
gossips = {k: n for k, n in people.items() if n.get("gossip")}
tellable = sorted(k for k, n in gossips.items() if not n["gossip"].get("relay"))
door = next(o for o in mb.objects if o.get("id") == "wufu")   # her palace door opens, and s4 plays, once he's told
target = next(c for c in door["open_to"] if c.startswith("told:")).split(":", 1)[1]
dock = tile(next(s for s in mb.spots if s["id"] == "dock"))
reach = walk(mb, dock)
near_walk = lambda t: next(((t[0] + i, t[1] + j) for i in (0, -1, 1) for j in (0, -1, 1) if (t[0] + i, t[1] + j) in reach), None)  # noqa: E731
unwalked = [k for k in list(gossips) + [target] if near_walk(tile(people[k])) is None]


def spread(first):
    """Who hears it, and when (s), once `first` is told."""
    at, todo = {first: 0.0}, [first]
    while todo:
        k = todo.pop(0)
        d = walk(mb, near_walk(tile(people[k])))
        for m in (people[k].get("gossip") or {}).get("tells", []):
            t = at[k] + WAIT + d.get(near_walk(tile(people[m])), 999) * 16 / HURRY
            if t < at.get(m, 1e9):
                at[m] = t
                todo.append(m)
    return at


heard = {k: spread(k) for k in tellable}
relays = set(gossips) - set(tellable)
orphans = sorted(relays - {m for h in heard.values() for m in h})
leads = [k for k in tellable if target in heard[k]]
hangings = [o for o in mb.objects if o.get("told")]
bad_hangings = [o["told"] for o in hangings if o["told"] not in gossips]
dark = sorted({o["told"] for o in hangings} - {m for h in heard.values() for m in h})
secs = heard.get("g-qiao", {}).get(target)
r3 = (not unwalked and len(tellable) <= 3 and not orphans and leads == ["g-qiao"] and target in people
      and not people[target].get("gossip") and not bad_hangings and not dark and len(hangings) == 12 and secs and secs <= QUICK)
print(f"town: the player tells {len(tellable)} ({', '.join(tellable)}); {len(relays)} relays, each reached from one of them: {not orphans}; "
      f"all walkable from the dock: {not unwalked}")
for k in tellable:
    print(f"  {k}: {len(heard[k]) - 1} hear it from them, the last after {max(heard[k].values()):.0f} s")
print(f"  s4 and her door wait on {target} (told, not tellable: {target in people and not people[target].get('gossip')}); "
      f"only Qiao Guolao's chain reaches him: {leads == ['g-qiao']}, in {secs:.0f} s (at most {QUICK})")
print(f"  red hangings: {len(hangings)}, each naming a gossip some chain reaches: {not bad_hangings and not dark}")
ok &= bool(r3)

print("all ok" if ok else "FAILED")
sys.exit(0 if ok else 1)
