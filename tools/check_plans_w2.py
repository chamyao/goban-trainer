"""Check Book 2's plan grids (tools/tk_plans_w2.py), and optionally draw them.

    python3 tools/check_plans_w2.py          # check; exit 1 on errors
    python3 tools/check_plans_w2.py --png    # also draw every plan into docs/book2/plans/

The rules are those of docs/book2/plan-grid.md:
  - things claim whole cells; no two things share a cell
  - a claim is at least the kind's footprint plus the plan's margin all round
  - nothing stands on a line (road, river, wall) or in water, unless it says "on"
  - every door opens onto walkable ground (in a city-scale plan: onto a road)
  - every spot, door, exit and person can be walked to from the entry
  - beat keys are the Shared keys of docs/book2/diaochan-arc.md; kinds are in vocab.py or NEW_KINDS
  - stealth: each covered route exists, each safe spot exists (a coarse first check of the cones)
"""
import math
import re
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "tools" / "mapfactory"))
ARC = sys.argv[sys.argv.index("--arc") + 1] if "--arc" in sys.argv else "diaochan"
if ARC == "cc":   # the Cao Cao arc (tools/tk_plans_cc.py, docs/book2/caocao-arc.md)
    from tk_plans_cc import LINE_KINDS, NEW_KINDS, PLANS_CC as PLANS2, ZONE_KINDS  # noqa: E402
elif ARC == "lb":   # Lü Bu's fall (tools/tk_plans_lb.py, docs/book2/lvbu-arc.md "Building it")
    from tk_plans_lb import KEYS_LB, LINE_KINDS, NEW_KINDS, PLANS_LB as PLANS2, ZONE_KINDS  # noqa: E402
elif ARC == "ls":   # Lady Sun's marriage (tools/tk_plans_ls.py, docs/book2/ladysun-arc.md)
    from tk_plans_ls import KEYS_LS, LINE_KINDS, NEW_KINDS, PLANS_LS as PLANS2, ZONE_KINDS  # noqa: E402
elif ARC == "hlm1":   # Red Chamber, Book 1 (redchamber/book1/plans.py, redchamber/book1/design.md)
    import importlib.util as _ilu
    _spec = _ilu.spec_from_file_location("redchamber_book1_plans", ROOT / "redchamber/book1/plans.py")
    _mod = _ilu.module_from_spec(_spec)
    sys.modules["redchamber_book1_plans"] = _mod
    _spec.loader.exec_module(_mod)
    KEYS_HLM1, LINE_KINDS, NEW_KINDS, PLANS2, ZONE_KINDS = _mod.KEYS_HLM1, _mod.LINE_KINDS, _mod.NEW_KINDS, _mod.PLANS_HLM1, _mod.ZONE_KINDS
else:
    from tk_plans_w2 import LINE_KINDS, NEW_KINDS, PLANS2, ZONE_KINDS  # noqa: E402
from vocab import FOLK, KINDS  # noqa: E402

SIDES = {"N": (0, -1), "S": (0, 1), "W": (-1, 0), "E": (1, 0)}
OPEN_GROUND = {"court", "passage", "garden", "field", "field.wheat", "market", "camp", "plain", "loess", "stage", "floor", "ward",
               "city", "plateau"}
PASSABLE_THINGS = {"furn.seat", "furn.curtain", "furn.rug", "landmark.ridge", "building.gatehouse", "building.gate", "building.moongate",
                   "building.festoongate", "building.halfgate", "building.blackgate", "furn.cushion", "furn.handwarmer", "furn.gauze"}
IN_WALL = {"building.gate", "building.gatehouse", "building.gatetower", "building.moongate", "wall.stairs",
           "building.festoongate", "building.halfgate", "building.blackgate"}   # stand in a wall: no margin
EXTRA_KINDS = {"prop.lanterns", "prop.body_lamp", "milestone", "banner", "plant.peony", "water.lotus", "tree.poplar", "tree.willow",
               "camp.gong", "camp.drum"}


def shared_keys():
    if ARC == "lb":   # the design's beat table (x1 ... x20), as the plans module lists it
        return set(KEYS_LB)
    if ARC == "ls":   # the design's beat table (s1 ... s16)
        return set(KEYS_LS)
    if ARC == "hlm1":   # the story's nodes (d1 ... d8, g1 ... g7)
        return set(KEYS_HLM1)
    if ARC == "cc":   # the "Shared keys" table: | c1 | Luoyang | ...
        text = (ROOT / "docs/book2/caocao-arc.md").read_text().split("## Shared keys")[1]
        return set(re.findall(r"^\| (c\d+) \|", text, re.M))
    text = (ROOT / "docs/book2/diaochan-arc.md").read_text()
    table = text.split("**Beat keys**")[1]
    keys = set()
    for cell in re.findall(r"^\| ([^|]+) \|", table, re.M):
        for k in re.findall(r"`([a-z0-9]+)`", cell):
            keys.add(k)
        m = re.search(r"`(a\d+)([a-z])`–`a\d+([a-z])`", cell)
        if m:
            keys |= {m.group(1) + chr(c) for c in range(ord(m.group(2)), ord(m.group(3)) + 1)}
    return keys


def known_kind(k):
    return k in KINDS or k in NEW_KINDS or k in FOLK or k in EXTRA_KINDS or k.startswith("hero.")


class Plan:
    def __init__(self, name, p):
        self.name, self.p = name, p
        self.W, self.H = p["grid"]
        self.C, self.M = p["cell"], p.get("margin", 1)
        self.errors = []
        self.zone = {}          # cell -> zone kind (later zones win)
        for z in p.get("ground", []):
            for c in self.zone_cells(z):
                self.zone[c] = z["kind"]
        self.line_at = {}       # cell -> [line kinds]
        self.gates = {}
        for l in p.get("lines", []):
            for c in self.line_cells(l):
                self.line_at.setdefault(c, []).append(l["kind"])
            for gid, g in (l.get("gates") or {}).items():
                self.gates[tuple(g)] = gid
        self.owner = {}

    def err(self, msg):
        self.errors.append(f"{self.name}: {msg}")

    def inb(self, c):
        return 0 <= c[0] < self.W and 0 <= c[1] < self.H

    def zone_cells(self, z):
        if "mask" in z:
            x0, y0 = z["at"]
            return {(x0 + i, y0 + j) for j, row in enumerate(z["mask"]) for i, ch in enumerate(row) if ch == "#"}
        x, y, w, h = z["rect"]
        return {(i, j) for i in range(x, x + w) for j in range(y, y + h)}

    def line_cells(self, l):
        if "outline" in l:
            x, y, w, h = l["outline"]
            return {(i, j) for i in range(x, x + w) for j in range(y, y + h) if i in (x, x + w - 1) or j in (y, y + h - 1)}
        C, r, cells = self.C, l["width"] / 2, set()
        for (x0, y0), (x1, y1) in zip(l["path"], l["path"][1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * C * 2) + 1
            hz = y0 == y1
            for i in range(n + 1):
                cx = min((x0 + (x1 - x0) * i / n + .5) * C, (max(x0, x1) + 1) * C - .01)
                cy = min((y0 + (y1 - y0) * i / n + .5) * C, (max(y0, y1) + 1) * C - .01)
                for tx in ([int(cx)] if hz else range(int(cx - r), int(math.ceil(cx + r)))):
                    for ty in (range(int(cy - r), int(math.ceil(cy + r))) if hz else [int(cy)]):
                        cells.add((tx // C, ty // C))
        return cells

    def walkable(self, c, through_things=False):
        if not self.inb(c):
            return False
        if c in self.gates:
            return True
        kinds = self.line_at.get(c, [])
        if any(LINE_KINDS[k][0] for k in kinds):        # a road or bridge crosses anything
            return True
        if kinds:
            return False
        if ZONE_KINDS.get(self.zone.get(c, "field"), True) is False:
            return False
        t = self.owner.get(c)
        return t is None or through_things or t["kind"] in PASSABLE_THINGS

    def check(self, keys):
        p = self.p
        for l in p.get("lines", []):
            if l["kind"] not in LINE_KINDS:
                self.err(f"line {l['id']}: unknown kind {l['kind']}")
            for c in self.line_cells(l):
                if not self.inb(c):
                    self.err(f"line {l['id']} leaves the grid at {c}")
                    break
        for z in p.get("ground", []):
            if z["kind"] not in ZONE_KINDS:
                self.err(f"zone {z['id']}: unknown kind {z['kind']}")
        for t in p.get("things", []):
            if not known_kind(t["kind"]):
                self.err(f"{t['id']}: unknown kind {t['kind']}")
            x, y, w, h = t["rect"]
            cells = {(i, j) for i in range(x, x + w) for j in range(y, y + h)}
            if not all(self.inb(c) for c in cells):
                self.err(f"{t['id']}: off the grid")
            for c in sorted(cells):
                if c in self.owner:
                    self.err(f"overlap: {t['id']} and {self.owner[c]['id']} both claim cell {c}")
                self.owner[c] = t
            fw, fh, _ = NEW_KINDS.get(t["kind"]) or KINDS.get(t["kind"], (None, None, None))
            if fw is not None:
                m = t.get("margin", 0 if t["kind"] in IN_WALL else self.M)
                need_w, need_h = math.ceil((fw + 2 * m) / self.C), math.ceil((fh + 2 * m) / self.C)
                if (w < need_w or h < need_h) and (w < need_h or h < need_w):   # a footprint may be turned
                    self.err(f"too small: {t['id']} ({t['kind']}) needs {fw}x{fh} tiles + {self.M} margin = {need_w}x{need_h} cells; "
                             f"the plan gives {w}x{h}")
            on_line = [(c, k) for c in cells for k in self.line_at.get(c, []) if c not in self.gates]
            if on_line and t["kind"] not in PASSABLE_THINGS | IN_WALL:
                self.err(f"on a line: {t['id']} on {on_line[0][1]} at {on_line[0][0]}")
            wet = [c for c in cells if self.zone.get(c) == "water"]
            if wet and t.get("on") != "water":
                self.err(f"in the water: {t['id']} at {wet[0]}")
            if t.get("on") == "water" and len(wet) < len(cells):
                self.err(f"{t['id']} is meant to stand in the water, but only {len(wet)}/{len(cells)} cells are water")
            if t.get("node") and t["node"].split("-", 1)[-1] not in keys:
                self.err(f"{t['id']}: node {t['node']} is not a Shared key")
        # doors
        self.doors = []
        for t in p.get("things", []):
            for d in t.get("doors") or ([t["door"]] if t.get("door") else []):
                x, y, w, h = t["rect"]
                dx, dy = SIDES[d]
                edge = {"N": [(i, y - 1) for i in range(x, x + w)], "S": [(i, y + h) for i in range(x, x + w)],
                        "W": [(x - 1, j) for j in range(y, y + h)], "E": [(x + w, j) for j in range(y, y + h)]}[d]
                ok = [c for c in edge if self.walkable(c)]
                if self.C >= 4:   # out in a town: onto a road or an open court, never onto bare grass
                    ok = [c for c in ok if any(LINE_KINDS[k][0] for k in self.line_at.get(c, [])) or self.zone.get(c) in OPEN_GROUND - {"ward", "city", "loess"}]
                if not ok:
                    self.err(f"door: {t['id']} ({d}) opens onto no {'road or court' if self.C >= 4 else 'walkable ground'}")
                else:
                    self.doors.append((f"door {t['id']}", ok[len(ok) // 2]))
        # spots, exits, people, watchers: on the grid and walkable
        need = list(self.doors)
        for s in p.get("spots", []):
            c = tuple(s["at"])
            if s.get("node") and s["node"].split("-", 1)[-1] not in keys:
                self.err(f"spot {s['id']}: node {s['node']} is not a Shared key")
            if s.get("on"):
                host = self.owner.get(c)
                if not host or host["id"] != s["on"]:
                    self.err(f"spot {s['id']}: meant to be on {s['on']}")
                nb = [(c[0] + dx, c[1] + dy) for dx, dy in SIDES.values()]
                c = next((n for n in nb if self.walkable(n)), c)
            elif not self.walkable(c):
                self.err(f"spot {s['id']} at {c} is not walkable ({self.owner.get(c, {}).get('id') or self.line_at.get(c) or self.zone.get(c)})")
            need.append((f"spot {s['id']}", c))
        for e in p.get("exits", []):
            need.append((f"exit to {e['to']}", tuple(e["at"])))
        for i, w in enumerate(p.get("watchers", [])):
            for c in w.get("beat") or [w["at"]]:
                if not self.walkable(tuple(c)):
                    self.err(f"watcher {w['id']}: beat point {c} is not walkable")
                elif self.hidden(tuple(c)):
                    self.err(f"watcher {w['id']}: beat point {c} is behind {self.owner[(c[0], c[1] + 1)]['id']}; the player must see the watchers")
        start = None
        for k in ("",):
            if k in p.get("entries", {}):
                start = tuple(p["entries"][k])
        if start is None and p.get("exits"):
            ex = tuple(p["exits"][0]["at"])
            start = next(((ex[0] + dx, ex[1] + dy) for dx, dy in SIDES.values() if self.walkable((ex[0] + dx, ex[1] + dy))), ex)
        if start is None:
            for l in p.get("lines", []):
                for g in (l.get("gates") or {}).values():
                    start = tuple(g)
        if start is None or not self.walkable(start):
            self.err(f"no walkable entry ({start})")
            return
        seen, q = {start}, deque([start])
        while q:
            c = q.popleft()
            for dx, dy in SIDES.values():
                n = (c[0] + dx, c[1] + dy)
                if n not in seen and self.walkable(n):
                    seen.add(n)
                    q.append(n)
        self.reach = seen
        for name, c in need:
            if c not in seen:
                self.err(f"unreachable: {name} at {c}")
        for chk in p.get("checks", []):
            self.play_check(chk)

    # ---- stealth: a coarse cone check ------------------------------------------------------
    def blocks_sight(self, c):
        t = self.owner.get(c)
        if t and t["kind"] in ("tree.willow", "garden.rockery", "furn.plant", "furn.screen", "garden.screenwall") or (t and t["kind"].startswith("building.")):
            return True
        return any(LINE_KINDS[k][1] for k in self.line_at.get(c, []))

    def cone(self, pos, facing, length):
        dx, dy = SIDES[facing]
        out = set()
        for d in range(1, length + 1):
            for s in range(-(d // 2), d // 2 + 1):
                c = (pos[0] + dx * d + dy * s, pos[1] + dy * d + dx * s)
                # sight line: blocked if any cell between is blocking
                steps = max(abs(c[0] - pos[0]), abs(c[1] - pos[1]))
                blocked = any(self.blocks_sight((round(pos[0] + (c[0] - pos[0]) * k / steps), round(pos[1] + (c[1] - pos[1]) * k / steps)))
                              for k in range(1, steps))
                if self.inb(c) and not blocked and not self.blocks_sight(c):
                    out.add(c)
        return out

    def watcher_views(self, w):
        """Cells seen at each position of the beat (facing along the walk, both ways on a back-and-forth)."""
        if "at" in w:
            return [self.cone(tuple(w["at"]), f, w["cone"]) for f in w.get("turns") or [w.get("face", "S")]]
        views, beat = [], [tuple(b) for b in w["beat"]]
        for a, b in zip(beat, beat[1:] + beat[:1]):
            if a == b:
                continue
            f = "E" if b[0] > a[0] else "W" if b[0] < a[0] else "S" if b[1] > a[1] else "N"
            n = max(abs(b[0] - a[0]), abs(b[1] - a[1]))
            for k in range(n + 1):
                views.append(self.cone((a[0] + (b[0] - a[0]) * k // n, a[1] + (b[1] - a[1]) * k // n), f, w["cone"]))
        return views

    def bfs(self, start, avoid=frozenset()):
        seen, q = {start}, deque([start])
        while q:
            c = q.popleft()
            for dx, dy in SIDES.values():
                n = (c[0] + dx, c[1] + dy)
                if n not in seen and n not in avoid and self.walkable(n):
                    seen.add(n)
                    q.append(n)
        return seen

    def target_cells(self, t):
        if isinstance(t, dict):
            return {tuple(e["at"]) for e in self.p.get("exits", []) if e["to"] == t["exit"]}
        s = next((s for s in self.p.get("spots", []) if s["id"] == t), None)
        if s:
            return {tuple(s["at"])}
        thing = next((x for x in self.p.get("things", []) if x["id"] == t), None)
        if thing:
            x, y, w, h = thing["rect"]
            out = set()
            for d in thing.get("doors") or [thing.get("door", "S")]:
                out |= {"N": {(i, y - 1) for i in range(x, x + w)}, "S": {(i, y + h) for i in range(x, x + w)},
                        "W": {(x - 1, j) for j in range(y, y + h)}, "E": {(x + w, j) for j in range(y, y + h)}}[d]
            return {c for c in out if self.walkable(c)}
        self.err(f"challenger target {t!r} names no spot, thing or exit")
        return set()

    def view_of(self, c):
        at = tuple(c["at"])
        if c.get("face"):
            return self.cone(at, c["face"], c["view"]) | {at}
        r = c["view"]
        return {(at[0] + dx, at[1] + dy) for dx in range(-r, r + 1) for dy in range(-r, r + 1)}

    def hidden(self, c):
        """A person is hidden if every tile of their cell lies under the roof or crown of the thing just south
        of it: a building's roof rises about 3 tiles above its footprint, a tree's or rock's about 2. On a
        4-tile cell with a 1-tile margin the north half stays clear, and the generator must stand them there."""
        t = self.owner.get((c[0], c[1] + 1))
        if t is None or t["kind"] in PASSABLE_THINGS or t["kind"].split(".")[0] not in ("building", "tree", "rock", "garden", "landmark"):
            return False
        rise = 3 if t["kind"].startswith("building.") else 2
        top = (c[1] + 1) * self.C + (0 if t["kind"] in IN_WALL else self.M)   # the footprint's top tile row
        return top - rise <= c[1] * self.C                                     # no clear row left in the cell

    def check_challengers(self, chs, seen_ids):
        for c in chs:
            if c["id"] in seen_ids:
                self.err(f"challenger id {c['id']!r} used twice")
            seen_ids.add(c["id"])
            if not known_kind(c["kind"]):
                self.err(f"challenger {c['id']}: unknown kind {c['kind']}")
            at = tuple(c["at"])
            if self.hidden(at):
                self.err(f"challenger {c['id']} at {at} stands behind {self.owner[(at[0], at[1] + 1)]['id']}, out of sight")
            if not self.walkable(at):
                self.err(f"challenger {c['id']} at {at} stands where no one can walk")
            elif at not in self.reach:
                self.err(f"challenger {c['id']} at {at} can't be reached")
            if c.get("blocks") is not None:
                start = tuple(c.get("from") or self.p.get("entries", {}).get("") or at)
                goal = self.target_cells(c["blocks"])
                if not goal & self.bfs(start):
                    self.err(f"challenger {c['id']}: {c['blocks']} can't be reached even without him")
                elif goal & self.bfs(start, frozenset(self.view_of(c))):
                    self.err(f"challenger {c['id']} doesn't block: {c['blocks']} can be reached from {start} without coming into his view")

    def play_check(self, chk):
        beats = set(chk.get("beats", []))
        ws = [w for w in self.p.get("watchers", []) if not beats or beats & set(w.get("in_beats", []))]
        always, ever = set(), set()
        for w in ws:
            views = self.watcher_views(w)
            ever |= set().union(*views)
            always |= set.intersection(*views) if len(views) > 1 else views[0]
        if chk["check"] == "covered_route":
            a, b = tuple(chk["from"]), tuple(chk["to"])
            # gates the beat's state shuts ("shut" in tk-world): not a way out, whoever rides
            shut = {c for c, gid in self.gates.items() if gid in chk.get("shut", [])}
            seen, q = {a}, deque([a])
            while q:
                c = q.popleft()
                for dx, dy in SIDES.values():
                    n = (c[0] + dx, c[1] + dy)
                    if n not in seen and self.walkable(n) and n not in always and n not in shut:
                        seen.add(n)
                        q.append(n)
            if b not in seen:
                self.err(f"covered route {a}→{b}: every way passes a cell some watcher never stops seeing")
            if chk.get("must_wait") and b in self.bfs(a, frozenset(ever | shut)):   # too easy: a way no watcher ever sees
                self.err(f"covered route {a}→{b}: there's a way no watcher ever sees, so the player never has to wait")
            self.covered = (a, b, len([c for c in seen if c not in ever]))
        elif chk["check"] == "sight_puzzle":   # for each way the one watcher faces, some cell the other sees and he doesn't
            byid = {w["id"]: w for w in self.p.get("watchers", [])}
            zone = set().union(*(self.zone_cells(z) for z in self.p.get("ground", []) if z["id"] == chk["in"]))
            see = set().union(*self.watcher_views(byid[chk["seen_by"]]))
            for k, view in enumerate(self.watcher_views(byid[chk["unseen_by"]])):
                ok = sorted(c for c in zone if c in see and c not in view and self.walkable(c))
                if not ok:
                    self.err(f"sight puzzle: with {chk['unseen_by']} facing way {k + 1}, no cell in {chk['in']} is seen by "
                             f"{chk['seen_by']} and not by {chk['unseen_by']}")
                else:
                    self.puzzle = getattr(self, "puzzle", []) + [ok]
        elif chk["check"] == "safe_spot":
            for zid in chk["in"]:
                zcells = set()
                for z in self.p.get("ground", []):
                    if z["id"] == zid:
                        zcells |= self.zone_cells(z)
                for l in self.p.get("lines", []):
                    if l["id"] == zid:
                        zcells |= self.line_cells(l)
                safe = [c for c in zcells if self.walkable(c) and c not in ever]
                if not safe:
                    self.err(f"safe spot: no cell in {zid} is out of every cone")


def chase_slip(P, ch, start, goal, corridor=None, horizon=400):
    """Steps (one cell each, at the player's gallop) of the quickest way from start to goal that no rider sees, waiting
    where it must, or None. Riders walk their beats in a loop at the engine's pace; one sees a cell in his cone (cone
    tiles rounded up to cells, the way he rides) or anywhere in his own cell (the engine's 2-tile ring). Cells are the
    plan's; corridor (a route's waypoints) keeps the search to that route's cells."""
    T, C = 16, P.C
    r_step = (42 / T / C) / (110 / T / C)          # cells a rider rides while the player gallops one
    riders = []
    for r in ch["riders"]:
        pts = [tuple(c) for c in r["beat"]] or [tuple(r["post"])]
        loop = pts + pts[-2:0:-1] if len(pts) > 1 else pts      # there and back
        segs = [(a, b) for a, b in zip(loop, loop[1:] + loop[:1]) if a != b]
        riders.append((segs, -(-r.get("cone", 5) // C), r.get("dir", "S")))
    cache = {}

    def seen_at(k):
        if k in cache:
            return cache[k]
        out = set()
        for segs, cone, d0 in riders:
            if not segs:
                pos, f = None, d0
            else:
                L = sum(max(abs(b[0] - a[0]), abs(b[1] - a[1])) for a, b in segs)
                d = (k * r_step) % L
                for a, b in segs:
                    n = max(abs(b[0] - a[0]), abs(b[1] - a[1]))
                    if d <= n:
                        pos = (round(a[0] + (b[0] - a[0]) * d / n), round(a[1] + (b[1] - a[1]) * d / n))
                        f = "E" if b[0] > a[0] else "W" if b[0] < a[0] else "S" if b[1] > a[1] else "N"
                        break
                    d -= n
            pos = pos or tuple(ch["riders"][riders.index((segs, cone, d0))]["post"])
            out |= P.cone(pos, f, cone) | {pos}
        cache[k] = out
        return out
    allowed = None
    if corridor:
        allowed = set()
        for a, b in zip(corridor, corridor[1:]):
            x, y = a
            while True:
                allowed.add((x, y))
                if (x, y) == tuple(b):
                    break
                x += (b[0] > x) - (b[0] < x) if x != b[0] else 0
                y += (b[1] > y) - (b[1] < y) if x == b[0] else 0
    if start in seen_at(0):
        return None
    seen, q = {(start, 0)}, deque([(start, 0)])
    while q:
        c, k = q.popleft()
        if c == goal:
            return k
        if k >= horizon:
            continue
        for dx, dy in list(SIDES.values()) + [(0, 0)]:
            n = (c[0] + dx, c[1] + dy)
            if (n, k + 1) in seen or not P.walkable(n) or (allowed is not None and n not in allowed) or n in seen_at(k + 1):
                continue
            seen.add((n, k + 1))
            q.append((n, k + 1))
    return None


def plans():
    for place, b in PLANS2.items():
        yield place, b["plan"], b
        for mid, m in (b.get("maps") or {}).items():
            yield f"{place} / {mid}", m, b


def draw(name, P, out):
    from PIL import Image, ImageDraw, ImageFont
    px = 8 if P.C >= 4 else 14
    T = P.C * px
    img = Image.new("RGB", (P.W * T, P.H * T), (122, 168, 96))
    d = ImageDraw.Draw(img, "RGBA")
    col = {"water": (70, 130, 190), "cliff": (120, 100, 80), "hills": (140, 150, 110), "field": (168, 190, 110),
           "field.wheat": (214, 196, 110), "market": (200, 180, 140), "ward": (170, 175, 150), "city": (160, 165, 140),
           "plateau": (185, 175, 150), "court": (205, 200, 185), "passage": (190, 185, 170), "garden": (110, 170, 100),
           "camp": (175, 160, 120), "loess": (205, 180, 130), "plain": (180, 190, 120), "stage": (170, 120, 120),
           "floor": (150, 120, 90)}
    for c, k in P.zone.items():
        d.rectangle([c[0] * T, c[1] * T, (c[0] + 1) * T - 1, (c[1] + 1) * T - 1], fill=col.get(k, (150, 150, 150)))
    lc = {"road": (225, 205, 160), "path": (230, 215, 175), "bridge": (160, 110, 70), "gallery": (180, 60, 50), "river": (60, 115, 180),
          "stream": (80, 140, 200), "wall": (90, 80, 75), "wall.city": (80, 70, 65), "wall.lattice": (150, 90, 60), "curtain": (190, 60, 90)}
    for l in P.p.get("lines", []):
        if "outline" in l:
            x, y, w, h = l["outline"]
            d.rectangle([x * T + T // 2, y * T + T // 2, (x + w - 1) * T + T // 2, (y + h - 1) * T + T // 2],
                        outline=lc[l["kind"]], width=max(3, int(l["width"] * px)))
        else:
            pts = [(x * T + T / 2, y * T + T / 2) for x, y in l["path"]]
            d.line(pts, fill=lc[l["kind"]], width=max(2, int(l["width"] * px)), joint="curve")
        for g in (l.get("gates") or {}).values():
            d.rectangle([g[0] * T + 2, g[1] * T + 2, (g[0] + 1) * T - 3, (g[1] + 1) * T - 3], outline=(250, 230, 120), width=3)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 11)
    except OSError:
        font = ImageFont.load_default()
    for t in P.p.get("things", []):
        x, y, w, h = t["rect"]
        k = t["kind"]
        fill = (150, 60, 50) if k.startswith("building.") else (60, 110, 60) if k.startswith("tree.") else (120, 110, 100)
        m = P.M * px
        d.rectangle([x * T + m, y * T + m, (x + w) * T - m - 1, (y + h) * T - m - 1], fill=fill + (230,), outline=(30, 20, 20))
        d.rectangle([x * T, y * T, (x + w) * T - 1, (y + h) * T - 1], outline=(255, 255, 255, 70))
        for dd in t.get("doors") or ([t["door"]] if t.get("door") else []):
            cx, cy = (x + w / 2) * T, (y + h / 2) * T
            dx, dy = SIDES[dd]
            ex, ey = cx + dx * (w * T / 2 - m), cy + dy * (h * T / 2 - m)
            d.rectangle([ex - 4, ey - 4, ex + 4, ey + 4], fill=(250, 230, 120))
        lab = (t.get("label") or t["id"]).split(" (")[0]
        if not k.startswith("tree."):
            d.text((x * T + m + 3, y * T + m + 2), lab[:28], fill=(255, 255, 255), font=font)
    for w in P.p.get("watchers", []):
        views = P.watcher_views(w)
        for c in set().union(*views):
            d.rectangle([c[0] * T, c[1] * T, (c[0] + 1) * T - 1, (c[1] + 1) * T - 1], fill=(255, 60, 60, 45))
        for b in w.get("beat") or [w["at"]]:
            d.ellipse([b[0] * T + T / 2 - 4, b[1] * T + T / 2 - 4, b[0] * T + T / 2 + 4, b[1] * T + T / 2 + 4], fill=(200, 30, 30))
    for c in getattr(P, "challengers", []):   # already only this map's
        if c.get("blocks") is not None:
            for v in P.view_of(c):
                if P.inb(v):
                    d.rectangle([v[0] * T, v[1] * T, (v[0] + 1) * T - 1, (v[1] + 1) * T - 1], fill=(60, 90, 255, 45))
        x, y = c["at"]
        d.ellipse([x * T + T / 2 - 6, y * T + T / 2 - 6, x * T + T / 2 + 6, y * T + T / 2 + 6], fill=(40, 70, 230),
                  outline=(255, 255, 255) if c.get("blocks") is not None else (0, 0, 0), width=2)
        d.text((x * T + T / 2 + 7, y * T + T / 2 + 2), c["id"], fill=(20, 30, 120), font=font)
    for s in P.p.get("spots", []):
        x, y = s["at"]
        r = 6 if s.get("node") else 4
        d.ellipse([x * T + T / 2 - r, y * T + T / 2 - r, x * T + T / 2 + r, y * T + T / 2 + r],
                  fill=(240, 40, 160) if s.get("node") else (240, 160, 220), outline=(0, 0, 0))
        if s.get("node"):
            d.text((x * T + T / 2 + 7, y * T + T / 2 - 6), s["node"][2:], fill=(0, 0, 0), font=font)
    for i in range(P.W + 1):
        d.line([(i * T, 0), (i * T, P.H * T)], fill=(0, 0, 0, 25))
    for j in range(P.H + 1):
        d.line([(0, j * T), (P.W * T, j * T)], fill=(0, 0, 0, 25))
    out.mkdir(parents=True, exist_ok=True)
    fn = out / (re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") + ".png")
    img.save(fn)
    return fn


def main():
    keys = shared_keys()
    errors, drawn = [], []
    ch_ids = set()
    for name, p, b in plans():
        P = Plan(name, p)
        P.check(keys)
        mid = name.split(" / ", 1)[1] if " / " in name else None
        if hasattr(P, "reach"):   # the place's own challengers, or those placed in this compound map
            P.check_challengers([c for c in b.get("challengers", []) if c.get("map") == mid], ch_ids)
            P.challengers = [c for c in b.get("challengers", []) if c.get("map") == mid]
        if b.get("chase", {}).get("riders") and p is b["plan"]:   # riders on beats: some way through, with the right timing
            # (a chase with a wave and ambushes is proved at tile level when plans.py builds the map: prove_chase)
            spot = {s["id"]: s["at"] for s in p.get("spots", [])}
            ch = b["chase"]
            free = chase_slip(P, ch, tuple(spot[ch["from"]]), tuple(spot[ch["to"]]))
            if free is None:
                P.err("chase: no timing gets from the Chancellor's gate to the goal unseen by every rider")
            P.chase_routes = {r: chase_slip(P, ch, tuple(spot[ch["from"]]), tuple(spot[ch["to"]]), corridor=pts)
                              for r, pts in ch.get("routes", {}).items()}
            if "--verbose" in sys.argv:
                print(f"chase in {name}: unseen in {free} steps;", ", ".join(f"{r}: {'unseen in %d steps' % v if v else 'no unseen timing'}"
                                                                       for r, v in P.chase_routes.items()))
        errors += P.errors
        if "--png" in sys.argv:
            drawn.append(draw(name, P, ROOT / ({"cc": "docs/book2/plans-cc", "lb": "docs/book2/plans-lb", "ls": "docs/book2/plans-ls", "hlm1": "redchamber/book1/plans-png"}.get(ARC, "docs/book2/plans"))))
    # people placed inside a compound or room map ("place": its id, "at": a cell there)
    for place, b in PLANS2.items():
        for i, n in enumerate(b.get("npcs", [])):
            if n.get("place"):
                m = (b.get("maps") or {}).get(n["place"])
                if m is None:
                    errors.append(f"{place}: npc {i + 1} is in {n['place']!r}, which is no map of the place")
                    continue
                P = Plan(f"{place} / {n['place']}", m)
                P.check(keys)
                c = tuple(n["at"])
                if P.hidden(c):
                    errors.append(f"{place} / {n['place']}: npc {i + 1} ({n['kind']}) at {c} stands behind {P.owner[(c[0], c[1] + 1)]['id']}, out of sight")
                if n.get("behind"):   # at a desk: reached across it, so a cell beside the thing must be reachable
                    t = next((t for t in m.get("things", []) if t["id"] == n["behind"]), None)
                    if t is None:
                        errors.append(f"{place} / {n['place']}: npc {i + 1} stands behind {n['behind']!r}, which is no thing there")
                    else:
                        x, y, w, h = t["rect"]
                        around = {(i2, j) for i2 in range(x - 1, x + w + 1) for j in range(y - 1, y + h + 1)} - {(i2, j) for i2 in range(x, x + w) for j in range(y, y + h)}
                        if not around & getattr(P, "reach", set()):
                            errors.append(f"{place} / {n['place']}: npc {i + 1} ({n['kind']}) behind {n['behind']}: no one can walk up to it")
                elif not P.walkable(c) or c not in getattr(P, "reach", set()):
                    errors.append(f"{place} / {n['place']}: npc {i + 1} ({n['kind']}) at {c} stands where no one can walk to")
    # every condition names one of the book's keys, bare ("node:d4"): the engine reads a short key as this world's, so a
    # plans' prefix in a condition ("node:hl1-d4") never comes true
    def conds(b):
        for st in b.get("states", []) + [st for m in (b.get("maps") or {}).values() for st in m.get("states", [])]:
            yield f"state {st.get('id')}", st
        for n in b.get("npcs", []) + b.get("challengers", []):
            yield f"{n.get('id') or n['kind']}", n
    for place, b in PLANS2.items():
        for who, x in conds(b):
            for k in ("when", "until"):
                for c in (x.get(k) if isinstance(x.get(k), list) else [x.get(k)]):
                    if isinstance(c, str) and c.startswith("node:") and c[5:] not in keys:
                        errors.append(f"{place}: {who} {k} {c!r}: not one of the book's keys (a condition names the bare key)")
    # every Shared key that names a Places spot should have one
    placed = {s["node"].split("-", 1)[-1] for _, p, _ in plans() for s in p.get("spots", []) if s.get("node")}
    placed |= {t["node"].split("-", 1)[-1] for _, p, _ in plans() for t in p.get("things", []) if t.get("node")}
    missing = sorted(keys - placed)
    for e in errors:
        print("ERROR", e)
    chs = [c for b in PLANS2.values() for c in b.get("challengers", [])]
    print(f"{len(chs)} road challengers, {sum(1 for c in chs if c.get('blocks') is not None)} blocking")
    print(f"{sum(1 for _ in plans())} plans, {len(errors)} errors; beats with no spot: {', '.join(missing) or 'none'}")
    for fn in drawn:
        print("drew", fn.relative_to(ROOT))
    sys.exit(1 if errors else 0)


main()
