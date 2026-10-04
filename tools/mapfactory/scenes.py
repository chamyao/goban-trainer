"""Scene generator: stage each story scene as a cutscene in its generated map.

    story steps (data/tk.json)  +  the place's map (*.map.json)  →  data/tk_maps/w<N>/cutscenes.json

The story writes scenes as steps placed relative to a node on the old node
map ("spawn r1 at n3 +34,-8", "move", "pose", "fx", "army", "run"). This
turns them into beats on the place's real map, in tiles, so any renderer can
play them:

- the stage is the quest's story spot; the party lines up there, and the
  side with more open ground becomes the "far" side, where enemies stand
- node-map offsets become tile offsets (8 px → 1 tile), snapped to open
  ground the party can reach, never two actors on one tile
- every walk is a real path around houses, trees and water
- armies stand in formation and move as one; people who arrive at the start
  walk in from off to the side; speakers face whoever they address and the
  camera frames them; anyone who speaks but isn't on stage is brought on
- a strike lunges at the nearest enemy; a fallen or removed actor fades

The format is in docs/cutscene-format.md.
"""
import json
import re
from collections import deque
from pathlib import Path

from vocab import KINDS

ROOT = Path(__file__).resolve().parent.parent.parent
PX = 8          # node-map pixels per tile
WALK, RUN = 4.0, 7.5   # tiles per second
FRIENDLY = {"militia"}  # extras on the party's side


def characters():
    src = (ROOT / "tk.js").read_text()
    block = src[src.index("const TK_CHARS = {"):src.index("};", src.index("const TK_CHARS = {"))]
    return set(re.findall(r"^  (\w+): \{", block, re.M))


class Stage:
    def __init__(self, m, spot, party):
        self.m = m
        self.W, self.H = m["size"]
        legend = m["terrain"]["legend"]
        self.block = set()
        for y, row in enumerate(m["terrain"]["rows"]):
            for x, ch in enumerate(row):
                if legend[ch] == "water":
                    self.block.add((x, y))
        for o in m["objects"]:
            if KINDS[o["kind"]][2]:
                for yy in range(o["y"], o["y"] + o["h"]):
                    for xx in range(o["x"], o["x"] + o["w"]):
                        self.block.add((xx, yy))
        self.spot = (int(spot["x"]), int(spot["y"]))
        self.reach = self.flood(self.spot)
        # enemies go on the side with more open ground
        sx, sy = self.spot
        right = sum((x, y) in self.reach for x in range(sx + 2, sx + 11) for y in range(sy - 3, sy + 4))
        left = sum((x, y) in self.reach for x in range(sx - 10, sx - 1) for y in range(sy - 3, sy + 4))
        self.dir = 1 if right >= left else -1
        self.pos = {}       # actor id -> cell
        self.beats = []
        self.cast = {}
        self.groups = {}    # group id -> [member ids]
        self.gone = set()
        self.fallen = set()
        self.party = list(party)
        # the party lines up on the spot, facing the far side
        marks = [(0, 0), (-1, -1), (-1, 1), (-2, 0), (-2, -2), (-2, 2)]
        for i, who in enumerate(self.party):
            c = self.snap((sx + marks[i][0] * self.dir, sy + marks[i][1]))
            self.add(who, who, c, side="us")
        self.beats.append({"do": "cut", "place": [{"actor": a, "at": self.xy(self.pos[a]), "face": self.face_dir(1)}
                                                  for a in self.party]})

    # ---------- grid ----------
    def ok(self, c):
        return 0 <= c[0] < self.W and 0 <= c[1] < self.H and c not in self.block

    def flood(self, start):
        if not self.ok(start):
            start = next(c for c in self.near(start, lambda c: self.ok(c)))
        seen, q = {start}, deque([start])
        while q:
            x, y = q.popleft()
            for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if n not in seen and self.ok(n):
                    seen.add(n)
                    q.append(n)
        return seen

    def near(self, c, good, limit=30):
        for r in range(limit):
            ring = [(c[0] + dx, c[1] + dy) for dx in range(-r, r + 1) for dy in range(-r, r + 1) if max(abs(dx), abs(dy)) == r]
            ring.sort(key=lambda p: (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2)
            for p in ring:
                if good(p):
                    yield p

    def snap(self, c, who=None):
        taken = {p for a, p in self.pos.items() if a != who and a not in self.gone}
        cx, cy = max(0, min(self.W - 1, c[0])), max(0, min(self.H - 1, c[1]))
        return next(self.near((cx, cy), lambda p: p in self.reach and p not in taken))

    def path(self, a, b):
        if a == b:
            return [a]
        prev, q = {a: None}, deque([a])
        while q:
            c = q.popleft()
            if c == b:
                break
            x, y = c
            for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if n not in prev and n in self.reach:
                    prev[n] = c
                    q.append(n)
        if b not in prev:
            return [a, b]
        cells = []
        c = b
        while c is not None:
            cells.append(c)
            c = prev[c]
        cells.reverse()
        # keep only the corners
        out = [cells[0]]
        for i in range(1, len(cells) - 1):
            p, c, n = cells[i - 1], cells[i], cells[i + 1]
            if (c[0] - p[0], c[1] - p[1]) != (n[0] - c[0], n[1] - c[1]):
                out.append(c)
        out.append(cells[-1])
        return out

    @staticmethod
    def xy(c):
        return [c[0] + .5, c[1] + .85]

    def face_dir(self, sign):
        return "right" if sign * self.dir > 0 else "left"

    def offset(self, dx, dy):
        return (self.spot[0] + round(dx / PX) * self.dir, self.spot[1] + round(dy / PX))

    # ---------- cast ----------
    def add(self, aid, who, cell, side, group=None):
        self.cast[aid] = {"who": who, "side": side, **({"group": group} if group else {})}
        self.pos[aid] = cell
        self.gone.discard(aid)

    def members(self, aid):
        return self.groups.get(aid, [aid])

    def live(self):
        return [a for a in self.cast if a not in self.gone]

    def enemy_of(self, aid, standing=True):
        side = self.cast[aid]["side"]
        cands = [b for b in self.live() if self.cast[b]["side"] != side and (not standing or b not in self.fallen)]
        if not cands:
            return None
        ax, ay = self.pos[aid]
        return min(cands, key=lambda b: (self.pos[b][0] - ax) ** 2 + (self.pos[b][1] - ay) ** 2)

    def formation(self, n):
        """Ranks three deep, filling away from the party."""
        out = []
        for i in range(n):
            col, row = i // 3, i % 3
            out.append((col, row - 1))
        return out

    def side_of(self, who, cell):
        if who in self.party or who in FRIENDLY:
            return "us"
        return "us" if (cell[0] - self.spot[0]) * self.dir < 0 else "them"

    # ---------- beats ----------
    def walk_beats(self, aid, target, speed):
        start = self.pos[aid]
        end = self.snap(target, aid)
        self.pos[aid] = end
        pts = self.path(start, end)
        return {"do": "walk", "actor": aid, "path": [self.xy(p) for p in pts], "speed": speed}

    def arrive(self, ids, speed=WALK):
        """People already on stage at the start walk in from further out."""
        moves = []
        for a in ids:
            mark = self.pos[a]
            away = 1 if (mark[0] - self.spot[0]) * self.dir >= 0 else -1
            out = self.snap((mark[0] + 5 * away * self.dir, mark[1]), a)
            self.pos[a] = out
            moves.append((a, out, mark))
        place = [{"actor": a, "at": self.xy(o), "face": self.face_dir(-(1 if (m[0] - self.spot[0]) * self.dir >= 0 else -1))}
                 for a, o, m in moves]
        walks = [self.walk_beats(a, m, speed) for a, _, m in moves]
        return [{"do": "appear", "place": place}, {"do": "together", "beats": walks}]

    def spawn(self, aid, who, cell, side, group=None, opening=False):
        c = self.snap(cell)
        self.add(aid, who, c, side, group)
        if not opening:
            self.beats.append({"do": "appear", "place": [{"actor": aid, "at": self.xy(c), "face": self.face_dir(-1 if side == "them" else 1)}]})

    def army(self, gid, who, n, centre, opening):
        side = self.side_of(who, centre)
        away = 1 if (centre[0] - self.spot[0]) * self.dir >= 0 else -1
        ids = []
        for i, (col, row) in enumerate(self.formation(n)):
            aid = f"{gid}.{i}"
            c = self.snap((centre[0] + col * away * self.dir, centre[1] + row * 2))
            self.add(aid, who, c, side, gid)
            ids.append(aid)
        self.groups[gid] = ids
        if not opening:
            self.beats.append({"do": "appear", "place": [{"actor": a, "at": self.xy(self.pos[a]), "face": self.face_dir(-away)} for a in ids]})

    def move(self, aid, target, speed):
        ids = [a for a in self.members(aid) if a in self.cast and a not in self.gone]
        if not ids:
            return
        if len(ids) == 1:
            self.beats.append(self.walk_beats(ids[0], target, speed))
            return
        # a group keeps its shape around the new centre
        cx = sum(self.pos[a][0] for a in ids) / len(ids)
        cy = sum(self.pos[a][1] for a in ids) / len(ids)
        walks = []
        for a in sorted(ids, key=lambda a: -(self.pos[a][0] - cx) * (target[0] - cx)):
            dx, dy = self.pos[a][0] - cx, self.pos[a][1] - cy
            walks.append(self.walk_beats(a, (round(target[0] + dx), round(target[1] + dy)), speed))
        self.beats.append({"do": "together", "beats": walks})

    def frame(self, ids):
        ids = [a for a in ids if a in self.pos and a not in self.gone]
        if not ids:
            ids = [a for a in self.party if a not in self.gone] or list(self.pos)
        xs = [self.pos[a][0] for a in ids]
        ys = [self.pos[a][1] for a in ids]
        return [round((min(xs) + max(xs)) / 2 + .5, 2), round((min(ys) + max(ys)) / 2 + .5, 2)]

    def say(self, step, chars):
        who = step[1]
        speaker = who if who in self.cast and who not in self.gone else \
            next((a for a in self.live() if self.cast[a]["who"] == who and "group" not in self.cast[a]), None)
        if speaker is None and who in chars:
            # someone speaks who isn't on stage: bring them on, facing the party
            far = self.offset(28, -6 if len([a for a in self.live() if self.cast[a]["side"] == "them"]) else 0)
            self.spawn(who, who, far, "them")
            speaker = who
        if speaker is None:
            self.beats.append({"do": "line", "line": step})
            return
        other = self.enemy_of(speaker, standing=False) or (self.party[0] if speaker != self.party[0] else None)
        turns = []
        if other:
            sx, ox = self.pos[speaker][0], self.pos[other][0]
            if sx != ox:
                turns.append({"actor": speaker, "dir": "right" if ox > sx else "left"})
                turns.append({"actor": other, "dir": "left" if ox > sx else "right"})
        self.beats.append({"do": "line", "line": step, "speaker": speaker, "face": turns,
                           "camera": self.frame([speaker] + ([other] if other else []))})

    def strike(self, aid):
        for a in self.members(aid):
            if a not in self.cast or a in self.gone:
                continue
            t = self.enemy_of(a)
            self.beats.append({"do": "strike", "actor": a, **({"target": t} if t else {})})

    def fall(self, aid):
        ids = [a for a in self.members(aid) if a in self.cast and a not in self.gone]
        self.fallen.update(ids)
        self.beats.append({"do": "fall", "actors": ids})

    def remove(self, aid):
        ids = [a for a in self.members(aid) if a in self.cast and a not in self.gone]
        if ids:
            self.beats.append({"do": "fade", "actors": ids})
        self.gone.update(ids)
        for a in ids:
            self.fallen.discard(a)


def stage_scene(scene, m, spot, party, chars):
    st = Stage(m, spot, party)
    steps = scene["steps"]
    opening = True
    arrivals = []
    for s in steps:
        op = s[0]
        if op in ("n", "say", "fx", "pose", "move", "run", "remove", "party", "wait", "scroll") and opening:
            opening = False
            if arrivals:
                st.beats.append({"do": "camera", "to": st.frame(list(st.pos)), "ms": 600})
                st.beats += st.arrive(arrivals)
        if op == "spawn":
            cell = st.offset(s[4], s[5])
            st.spawn(s[1], s[2], cell, st.side_of(s[2], cell), opening=opening)
            if opening:
                arrivals.append(s[1])
        elif op == "army":
            centre = st.offset(s[5], s[6])
            st.army(s[1], s[2], s[3], centre, opening)
            if opening:
                arrivals += st.groups[s[1]]
        elif op in ("move", "run"):
            st.move(s[1], st.offset(s[3], s[4]), RUN if op == "run" else WALK)
        elif op == "pose":
            if s[2] == "strike":
                st.strike(s[1])
            elif s[2] == "fall":
                st.fall(s[1])
            else:
                st.beats.append({"do": "pose", "actors": st.members(s[1]), "pose": s[2]})
        elif op == "fx":
            c = st.offset(s[3], s[4])
            st.beats.append({"do": "fx", "name": s[1], "at": st.xy(c)})
        elif op == "remove":
            st.remove(s[1])
        elif op == "party":
            st.beats.append({"do": "party", "list": s[1]})
        elif op == "wait":
            st.beats.append({"do": "wait", "ms": s[1]})
        elif op == "n":
            st.beats.append({"do": "line", "line": s, "camera": st.frame(st.live())})
        elif op == "say":
            st.say(s, chars)
    # whoever is still standing at the end, except the party, leaves
    rest = [a for a in st.live() if a not in st.party and st.cast[a]["who"] not in st.party]
    if rest:
        st.beats.append({"do": "fade", "actors": rest})
    lead = st.party[0] if st.party else None
    end = {"leader": st.xy(st.pos[lead])} if lead in st.pos else {}
    return {"cast": st.cast, "beats": st.beats, "end": end, "facing": st.face_dir(1)}


def build_scenes(n):
    world = next(w for w in json.loads((ROOT / "data/tk.json").read_text())["worlds"] if w["n"] == n)
    d = ROOT / f"data/tk_maps/w{n}"
    region = json.loads((d / "region.json").read_text())
    chars = characters()
    party = list(region.get("party") or ["liubei"])
    out = {}
    for q in region["quests"]:
        scene = world["scenes"].get(q["scene"])
        if not scene:
            continue
        m = json.loads((d / f"{q['place']}.map.json").read_text())
        spot = next(s for s in m["spots"] if s["node"] == q["node"])
        # party at this point in the story: the main line's party changes carry forward
        staged = stage_scene(scene, m, spot, party, chars)
        out[q["scene"]] = {"place": q["place"], "spot": spot["id"], "node": q["node"], "party": party, **staged}
        if q["role"] in ("main", "boss"):
            for s in scene["steps"]:
                if s[0] == "party":
                    party = list(s[1])
        moves = sum(1 for b in staged["beats"] for _ in ([b] if b["do"] == "walk" else b.get("beats", [])))
        print(f"  {q['scene']:10} {q['place']:20} cast {len(staged['cast']):2}  beats {len(staged['beats']):3}  walks {moves}")
    (d / "cutscenes.json").write_text(json.dumps({"format": "tk-cutscene/1", "world": n, "tile": "tiles",
                                                   "scenes": out}, ensure_ascii=False, separators=(",", ":")))
    print(f"wrote {len(out)} cutscenes to {(d / 'cutscenes.json').relative_to(ROOT)}")
