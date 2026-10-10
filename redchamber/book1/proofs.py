"""Red Chamber, Book 1: what a player could get wrong in its places, proved on the built maps, state by state.

    python3 redchamber/book1/proofs.py [--world 20]

Walked on tiles as plans.verify walks them (the terrain's walkability, every solid object), with each state's shut
gates as walls. It proves:
  1. Part 1 keeps Daiyu inside: in every state up to d8, from wherever she is put down in the house (the start, the
     carriage back from Lady Xing's), no way out to the street and no step outside the outer wall.
  2. Part 2 has one way in: before g3 the street's back gate is shut and so is every other gate; after it, only the
     back gate opens, and through it she reaches Zhou Rui's house, Xifeng's courtyard and nothing outside the walls.
  3. The same gate: Xifeng's half-size gate on the passage is the only way to her rooms (shut it, and her door can't be
     reached from anywhere), and d6a's spot, where Lady Wang points it out, stands before it, just past the screen wall.
  4. Every beat can be reached, in its own state, from where the lead arrives for it.
  5. The road challengers and cue people stand where she can walk up to them, and no one stands on a beat's spot.
"""
import argparse
import json
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "tools"), str(ROOT / "tools" / "mapfactory")]
from plans import KINDS, PASSABLE  # noqa: E402

SIDES = ((1, 0), (-1, 0), (0, 1), (0, -1))


class Map:
    def __init__(self, d, mid):
        self.id = mid
        self.m = json.loads((d / f"{mid}.map.json").read_text())
        self.W, self.H = self.m["size"]
        t = self.m["terrain"]
        self.walk, self.leg, self.rows = t["walk"], t["legend"], t["rows"]
        self.solid = set()
        for o in self.m["objects"]:
            if o["kind"].startswith(("plant.", "water.", "prop.", "banner.", "milestone")) and not KINDS.get(o["kind"], (0, 0, False))[2] \
                    or o["kind"] in PASSABLE:
                continue
            if KINDS.get(o["kind"], (1, 1, True))[2] or o["kind"] not in KINDS:
                self.solid |= {(i, j) for j in range(int(o["y"]), int(o["y"] + o["h"])) for i in range(int(o["x"]), int(o["x"] + o["w"]))}
        self.states = {s["id"]: s for s in self.m.get("states", [])}
        # a way out (not a door): stepping into it takes her away, so a walk ends there
        self.ways = set().union(*[self.rect(e) for e in self.m["exits"] if not e.get("door")] or [set()])

    def shut(self, state):
        out = set()
        for g in (self.states.get(state) or {}).get("shut", []):
            x, y, w, h = g["rect"]
            out |= {(i, j) for j in range(y, y + h) for i in range(x, x + w)}
        return out

    def ok(self, t, blocked):
        x, y = t
        return 0 <= x < self.W and 0 <= y < self.H and t not in self.solid and t not in blocked \
            and self.walk.get(self.leg[self.rows[y][x]], True)

    def reach(self, start, state=None, blocked=frozenset()):
        blocked = set(blocked) | self.shut(state)
        start = tuple(int(v) for v in start)
        seen, q = {start}, deque([start])
        while q:
            c = q.popleft()
            if c in self.ways and c != start:
                continue
            for dx, dy in SIDES:
                n = (c[0] + dx, c[1] + dy)
                if n not in seen and self.ok(n, blocked):
                    seen.add(n)
                    q.append(n)
        return seen

    def rect(self, r):
        return {(int(r["x"]) + i, int(r["y"]) + j) for i in range(max(1, round(r["w"]))) for j in range(max(1, round(r["h"])))}

    def near(self, tiles, seen):
        return any((x + dx, y + dy) in seen for x, y in tiles for dx in (-1, 0, 1) for dy in (-1, 0, 1))

    def into(self, tiles, seen):
        """She can stand in it (a way out she can step into), not just beside it."""
        return bool(set(tiles) & seen)

    def exit_to(self, to):
        return [e for e in self.m["exits"] if e["to"] == to]

    def spot(self, sid):
        s = next(s for s in self.m["spots"] if s["id"] == sid or s.get("node", "").endswith("-" + sid))
        return (int(s["x"]), int(s["y"]))

    def gate(self, gid):
        return next(o for o in self.m["objects"] if o.get("id") == gid)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--world", type=int, default=20)
    a = ap.parse_args()
    d = ROOT / f"data/tk_maps/w{a.world}"
    n = a.world
    fails, said = [], []

    def prove(ok, what):
        (said if ok else fails).append(what)

    rong, street = Map(d, "the-rong-mansion"), Map(d, "ning-rong-street")
    xing, village = Map(d, "lady-xings-court"), Map(d, "the-village")
    E = rong.m["entries"]
    inside = {(x, y) for x in range(rong.W) for y in range(rong.H)}
    # the outer wall's band hugs the inside of the ring of edge cells: beyond it (the outermost tile) is outside
    C = 2
    outside = {(x, y) for x, y in inside if x < C - 1 or y < C - 1 or x >= rong.W - (C - 1) or y >= rong.H - (C - 1)}
    to_street = set().union(*[rong.rect(e) for e in rong.exit_to("ning-rong-street")])

    # 1. Part 1 keeps Daiyu inside
    for st in ("afternoon", "evening", "night"):
        for name, at in (("the start", E[""]), ("the carriage back from Lady Xing's", E["lady-xings-court"])):
            seen = rong.reach(at, st)
            prove(not rong.into(to_street, seen), f"Part 1 ({st}): from {name}, the back gate to the street is shut")
            prove(not (seen & outside), f"Part 1 ({st}): from {name}, not one step outside the outer wall")
    for st in ("afternoon",):
        seen = xing.reach(xing.m["entries"]["the-rong-mansion"], st)
        prove(not xing.into(set().union(*[xing.rect(e) for e in xing.exit_to("ning-rong-street")]), seen),
              "Lady Xing's: the black-lacquered gate is shut while she is there")

    # 2. Part 2 has one way in
    back = set().union(*[street.rect(e) for e in street.exit_to("the-rong-mansion")])
    arrive = street.m["entries"]["the-village"]
    seen = street.reach(arrive, "morning")
    prove(not street.into(back, seen), "Part 2 (before g3): the street's back gate is shut")
    for g in ("rong-side-gate", "rong-main-gate", "xing-gate", "ning-gate"):
        o = street.gate(g)
        prove(not street.into(street.rect(o), seen),
              f"Part 2 (before g3): {o.get('label') or g} is shut")
    prove(street.near({street.spot("g2")}, seen) and street.near({street.spot("g3")}, seen),
          "Part 2 (before g3): the side gate (g2) and the back gate's doorstep (g3) can be walked to from the road in")
    seen = street.reach(arrive, "day")
    prove(street.into(back, seen), "Part 2 (after g3): the back gate opens")
    for g in ("rong-side-gate", "rong-main-gate", "xing-gate", "ning-gate"):
        prove(all(t in street.shut("day") for t in street.rect(street.gate(g))), f"Part 2 (after g3): {g} stays shut")
    for st in ("morning", "dusk"):
        seen = rong.reach(E["ning-rong-street"], st)
        prove(not (seen & outside), f"Part 2 ({st}): in by the back gate, not one step outside the outer wall")
        prove(rong.into(to_street, seen), f"Part 2 ({st}): the back gate is the way out again")

    # 3. The same gate
    door = next(e for e in rong.m["exits"] if e["to"].endswith("--xf-eastroom"))
    half = rong.rect(rong.gate("half-gate"))
    for name, at in (("the back gate", E["ning-rong-street"]), ("the start", E[""])):
        prove(rong.near(rong.rect(door), rong.reach(at, "morning")), f"Xifeng's door can be walked to from {name}")
        prove(not rong.near(rong.rect(door), rong.reach(at, "morning", half)),
              f"with her half-size gate shut, Xifeng's door can't be reached from {name}: it is the only way in")
    sx, sy = rong.spot("d6a")
    gx = sum(t[0] for t in half) / len(half)
    gy = max(t[1] for t in half)
    screen = rong.gate("xf-screen") if any(o.get("id") == "xf-screen" for o in rong.m["objects"]) else None
    prove(abs(sx + .5 - (gx + .5)) <= 2 and 0 < sy - gy <= 10,
          f"d6a's spot stands before the half-size gate ({sy - gy} tiles south of it, in line with it)")
    prove(screen is not None and gy < screen["y"] < sy, "the whitewashed screen wall stands between d6a's spot and the gate")

    # 4. Every beat can be reached in its state, from where the lead arrives for it
    def door_of(m, room):
        return next(e for e in m.m["exits"] if e["to"].endswith("--" + room))
    checks = [
        (rong, E[""], "afternoon", {rong.spot("d1")}, "d1: the festooned gate, from the start"),
        (rong, E[""], "afternoon", rong.rect(door_of(rong, "jm-rooms")), "d2-d3: Grandmother Jia's door, from the festooned gate"),
        (xing, xing.m["entries"]["the-rong-mansion"], "afternoon", xing.rect(door_of(xing, "xing-hall")), "d4: Lady Xing's door, from her gate"),
        (rong, E["lady-xings-court"], "evening", rong.rect(door_of(rong, "wf-rooms")), "d5: Rongxi Hall, from the carriage"),
        (rong, E[f"the-rong-mansion--wf-rooms"], "evening", {rong.spot("d6a")}, "d6a: the passage, from Rongxi Hall's door"),
        (rong, rong.spot("d6a"), "evening", rong.rect(door_of(rong, "jm-rooms")), "d6: Grandmother Jia's door, from the passage"),
        (village, village.spot("gouer-house"), "dusk", village.rect(door_of(village, "gouer-house")), "g1: Gou'er's door, where the cut lands her"),
        (street, arrive, "morning", {street.spot("g2")}, "g2: the side gate, from the road in"),
        (street, street.spot("g2"), "morning", {street.spot("g3")}, "g3: the back gate, round by the west lane"),
        (rong, E["ning-rong-street"], "morning", rong.rect(door_of(rong, "zhou-house")), "g4: Zhou Rui's door, inside the back gate"),
        (rong, E["the-rong-mansion--zhou-house"], "morning", rong.rect(door), "g5: Xifeng's door, from Zhou Rui's"),
        (street, street.m["entries"]["the-rong-mansion"], "dusk", {street.spot("g7")}, "g7: outside the back gate, coming out"),
    ]
    for m, at, st, goal, what in checks:
        prove(m.near(goal, m.reach(at, st)), what)
    for rid, nxt in (("the-rong-mansion--jm-rooms", "gauze-closet"), ("the-rong-mansion--xf-eastroom", "xf-rooms")):
        r = Map(d, rid)
        prove(r.near(r.rect(door_of(r, nxt)), r.reach(r.m["entries"][""])), f"{rid}: the doorway on to {nxt}")

    # 5. People: challengers and cues can be walked up to, and nobody stands on a beat's spot
    for p in sorted(d.glob("*.map.json")):
        mid = p.name.removesuffix(".map.json")
        if mid == "overworld":
            continue
        m = Map(d, mid)
        seen = m.reach(m.m["entries"][""])
        spots = {(int(s["x"]), int(s["y"])) for s in m.m["spots"] if s.get("node")}
        for npc in m.m["npcs"]:
            t = (int(npc["x"]), int(npc["y"]))
            if npc.get("challenge") or npc["kind"].startswith("hero."):
                who = npc.get("challenge") or npc["kind"]
                prove(m.near({t}, seen), f"{mid}: {who} can be walked up to")
                prove(t not in spots, f"{mid}: {who} doesn't stand on a beat's spot")

    for x in said:
        print("  ok  ", x)
    for x in fails:
        print("  FAIL", x)
    print(f"{len(said)} proved, {len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
