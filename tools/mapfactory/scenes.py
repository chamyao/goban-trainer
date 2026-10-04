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
- props (a cage cart, a forge, wine jars, a city gate) stand on open ground,
  move like actors and can carry someone ("board"); an army can ring a prop
  or a person ("surround", "close"); a gift is walked over and handed on
  ("give"); poses, emote bubbles, camera zoom and a dark mood set the tone
- "light" tints the whole scene for the time of day (night, dusk, dawn, a
  storm); set before the first line, the scene opens in that light

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
# props: footprint (w, h) in tiles; drawn bottom-centre on the anchor tile
PROPS = {"cagecart": (3, 1), "forge": (2, 1), "anvil": (1, 1), "winejars": (2, 1), "table": (2, 1),
         "rack": (2, 1), "fire": (2, 1), "tent": (3, 2), "gate": (3, 1),
         "desk": (2, 1), "hall": (4, 2)}
POSES = {"drink", "cheer", "bow", "kneel", "sit", "drunk", "raise", "sleep", "stand"}
EMOTES = {"!", "?", "...", "music", "anger", "sweat", "zzz", "heart"}
LIGHTS = {"day", "night", "dusk", "dawn", "storm"}   # or "#rrggbb"


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
        self.props = {}     # prop id -> kind
        self.aboard = {}    # rider id -> prop id
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

    def foot(self, pid, at=None):
        """The tiles a prop stands on."""
        w, h = PROPS[self.props[pid]]
        x, y = at or self.pos[pid]
        return {(x - w // 2 + i, y - j) for i in range(w) for j in range(h)}

    def taken(self, who=None):
        out = set()
        for a, p in self.pos.items():
            if a == who or a in self.gone or a in self.aboard:
                continue
            out |= self.foot(a) if a in self.props else {p}
        return out

    def snap(self, c, who=None):
        taken = self.taken(who)
        cx, cy = max(0, min(self.W - 1, c[0])), max(0, min(self.H - 1, c[1]))
        if who in self.props:   # the whole footprint on open ground
            return next(self.near((cx, cy), lambda p: all(q in self.reach and q not in taken for q in self.foot(who, p))))
        return next(self.near((cx, cy), lambda p: p in self.reach and p not in taken))

    def path(self, a, b):
        if a == b:
            return [a]
        props = set().union(*(self.foot(p) for p in self.props if p not in self.gone and p in self.pos)) - {a, b}
        prev, q = {a: None}, deque([a])
        while q:
            c = q.popleft()
            if c == b:
                break
            x, y = c
            for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if n not in prev and n in self.reach and n not in props:
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
        if aid == "party":
            return [a for a in self.party if a in self.cast and a not in self.gone]
        return self.groups.get(aid, [aid])

    def find(self, who):
        """An actor by id, or the one playing a character."""
        if who in self.cast and who not in self.gone:
            return who
        return next((a for a in self.live() if self.cast[a].get("who") == who and "group" not in self.cast[a]), None)

    def live(self):
        return [a for a in self.cast if a not in self.gone]

    def enemy_of(self, aid, standing=True):
        side = self.cast[aid]["side"]
        cands = [b for b in self.live() if self.cast[b]["side"] not in (side, "prop") and (not standing or b not in self.fallen)]
        if not cands:
            return None
        ax, ay = self.pos[aid]
        return min(cands, key=lambda b: (self.pos[b][0] - ax) ** 2 + (self.pos[b][1] - ay) ** 2)

    def formation(self, n):
        """Ranks filling away from the party: three deep with gaps for a band,
        five deep and close for a host, so a big army still fits the screen."""
        deep, gap = (3, 2) if n <= 9 else (5, 1)
        return [(i // deep, (i % deep - deep // 2) * gap) for i in range(n)]

    def side_of(self, who, cell):
        if who in self.party or who in FRIENDLY:
            return "us"
        return "us" if (cell[0] - self.spot[0]) * self.dir < 0 else "them"

    # ---------- beats ----------
    def walk_beats(self, aid, target, speed):
        start = self.pos[aid]
        end = self.snap(target, aid)
        self.pos[aid] = end
        for r, p in self.aboard.items():
            if p == aid:
                self.pos[r] = end
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
            c = self.snap((centre[0] + col * away * self.dir, centre[1] + row))
            self.add(aid, who, c, side, gid)
            ids.append(aid)
        self.groups[gid] = ids
        if not opening:
            self.beats.append({"do": "appear", "place": [{"actor": a, "at": self.xy(self.pos[a]), "face": self.face_dir(-away)} for a in ids]})

    def move(self, aid, target, speed):
        # the fallen stay where they fell
        ids = [a for a in self.members(aid) if a in self.cast and a not in self.gone and a not in self.fallen and a not in self.aboard]
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
        speaker = self.find(who)
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

    def fall(self, aid, count=None):
        ids = [a for a in self.members(aid) if a in self.cast and a not in self.gone and a not in self.fallen]
        if count is not None and ids:
            # those nearest the enemy fall first
            foe = [self.pos[b] for b in self.live() if self.cast[b]["side"] not in (self.cast[ids[0]]["side"], "prop")]
            if foe:
                ids.sort(key=lambda a: min((self.pos[a][0] - f[0]) ** 2 + (self.pos[a][1] - f[1]) ** 2 for f in foe))
            ids = ids[:count]
        self.fallen.update(ids)
        self.beats.append({"do": "fall", "actors": ids})

    def remove(self, aid):
        ids = [a for a in self.members(aid) if a in self.cast and a not in self.gone]
        ids += [r for r, p in self.aboard.items() if p in ids and r not in self.gone]   # a prop takes its riders
        if ids:
            self.beats.append({"do": "fade", "actors": ids})
        self.gone.update(ids)
        for a in ids:
            self.aboard.pop(a, None)
        for a in ids:
            self.fallen.discard(a)

    # ---------- props, gifts, rings ----------
    def prop(self, pid, kind, cell):
        self.props[pid] = kind
        self.cast[pid] = {"prop": kind, "side": "prop"}
        self.pos[pid] = cell
        self.gone.discard(pid)
        self.pos[pid] = self.snap(cell, pid)
        self.beats.append({"do": "appear", "place": [{"actor": pid, "at": self.xy(self.pos[pid])}]})

    def board(self, who, pid, opening):
        a = self.find(who)
        if a is None or pid not in self.props:
            return
        x, y = self.pos[pid]
        if not opening and abs(self.pos[a][0] - x) + abs(self.pos[a][1] - y) > 3:   # walk up to it first
            self.beats.append(self.walk_beats(a, (x, y + 1), WALK))
        self.aboard[a] = pid
        self.pos[a] = self.pos[pid]
        self.beats.append({"do": "board", "actor": a, "prop": pid, "at": self.xy(self.pos[pid])})

    def unboard(self, who):
        a = self.find(who)
        if a not in self.aboard:
            return
        pid = self.aboard.pop(a)
        x, y = self.pos[pid]
        self.pos[a] = self.snap((x, y + 1), a)
        self.beats.append({"do": "unboard", "actor": a, "to": self.xy(self.pos[a])})

    def turn_to(self, a, cell):
        dx, dy = cell[0] - self.pos[a][0], cell[1] - self.pos[a][1]
        if abs(dx) >= abs(dy):
            return {"actor": a, "dir": "right" if dx > 0 else "left"} if dx else None
        return {"actor": a, "dir": "down" if dy > 0 else "up"}

    def give(self, src, dst, item):
        g, r = self.find(src), self.find(dst)
        if g is None or r is None:
            self.beats.append({"do": "gain", "item": item})
            return
        rx, ry = self.pos[r]
        side = 1 if self.pos[g][0] >= rx else -1
        if abs(self.pos[g][0] - rx) + abs(self.pos[g][1] - ry) > 1:
            self.beats.append(self.walk_beats(g, (rx + side, ry), WALK))
        turns = [t for t in (self.turn_to(g, (rx, ry)), self.turn_to(r, self.pos[g])) if t]
        self.beats.append({"do": "give", "from": g, "to": r, "item": item, "face": turns,
                           "camera": self.frame([g, r])})

    def ring(self, gid, target, r, speed):
        """A group stands in a ring round a prop or a person."""
        import math
        t = self.find(target)
        ids = [a for a in self.members(gid) if a in self.cast and a not in self.gone and a not in self.fallen and a not in self.aboard]
        if t is None or not ids:
            return
        tx, ty = self.pos[t]
        if t in self.props:   # round the middle of the prop
            w, h = PROPS[self.props[t]]
            ty -= (h - 1) / 2
        R = max(1.5, r / PX)
        cx = sum(self.pos[a][0] for a in ids) / len(ids)
        cy = sum(self.pos[a][1] for a in ids) / len(ids)
        a0 = math.atan2(cy - ty, cx - tx)
        # each man takes the ring place nearest him, in angle order
        order = sorted(ids, key=lambda a: (math.atan2(self.pos[a][1] - ty, self.pos[a][0] - tx) - a0) % (2 * math.pi))
        walks, turns = [], []
        for i, a in enumerate(order):
            ang = a0 + 2 * math.pi * i / len(order)
            walks.append(self.walk_beats(a, (round(tx + R * math.cos(ang)), round(ty + R * math.sin(ang))), speed))
        for a in order:
            tt = self.turn_to(a, (round(tx), round(ty)))
            if tt:
                turns.append(tt)
        self.beats.append({"do": "together", "beats": walks})
        self.beats.append({"do": "face", "turns": turns})


def stage_scene(scene, m, spot, party, chars):
    st = Stage(m, spot, party)
    steps = scene["steps"]
    opening = True
    arrivals = []
    for s in steps:
        op = s[0]
        if op in ("n", "say", "fx", "pose", "move", "run", "remove", "party", "wait", "scroll", "problem",
                  "emote", "give", "surround", "close", "camera", "mood", "unboard") and opening:
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
                st.fall(s[1], s[3] if len(s) > 3 else None)
            elif s[2] in POSES:
                ids = [a for a in st.members(s[1]) if a in st.cast and a not in st.gone and a not in st.fallen]
                if ids:
                    st.beats.append({"do": "pose", "actors": ids, "pose": s[2]})
        elif op == "fx":
            c = st.offset(s[3], s[4])
            st.beats.append({"do": "fx", "name": s[1], "at": st.xy(c)})
        elif op == "remove":
            st.remove(s[1])
        elif op == "prop":
            st.prop(s[1], s[2], st.offset(s[4], s[5]))
        elif op == "board":
            if s[1] in arrivals:   # already inside when the scene opens
                arrivals.remove(s[1])
            st.board(s[1], s[2], opening)
        elif op == "unboard":
            st.unboard(s[1])
        elif op == "emote":
            ids = [a for a in st.members(s[1]) if a in st.cast and a not in st.gone]
            if s[2] in EMOTES and ids:
                st.beats.append({"do": "emote", "actors": ids, "icon": s[2]})
        elif op == "give":
            st.give(s[1], s[2], s[3])
        elif op in ("surround", "close"):
            st.ring(s[1], s[2], s[3], RUN if op == "surround" else WALK)
        elif op == "camera":
            if s[1] == "zoom":
                st.beats.append({"do": "zoom", "z": max(1, min(2, s[2])), "ms": s[3] if len(s) > 3 else 600})
            elif s[1] == "shake":
                st.beats.append({"do": "shake"})
        elif op == "light":
            tint = s[1] if s[1] in LIGHTS or re.fullmatch(r"#[0-9a-fA-F]{6}", str(s[1])) else "day"
            if opening:   # the scene opens in this light
                st.beats[0]["light"] = tint
            else:
                st.beats.append({"do": "light", "tint": tint, "ms": s[2] if len(s) > 2 else 1500})
        elif op == "mood":
            st.beats.append({"do": "mood", "dark": s[1] == "dark"})
        elif op == "party":
            st.beats.append({"do": "party", "list": s[1]})
        elif op == "gain":
            st.beats.append({"do": "gain", "item": s[1]})
        elif op == "wait":
            st.beats.append({"do": "wait", "ms": s[1]})
        elif op == "problem":  # the scene's Go problem: the player solves it before the rest plays
            st.beats.append({"do": "problem"})
        elif op == "n":
            st.beats.append({"do": "line", "line": s, "camera": st.frame(st.live())})
        elif op == "say":
            st.say(s, chars)
    # whoever is still standing at the end, except the party, leaves
    rest = [a for a in st.live() if a not in st.party and st.cast[a].get("who") not in st.party]
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
