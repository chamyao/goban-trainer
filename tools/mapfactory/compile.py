"""Compile abstract maps (tk-map/1) into Tiled maps for one art kit.

    abstract map + assets/tk/kits/<kit>.json  →  data/tk_maps/w<N>/<kit>/<place>.tmj

The Tiled map has a ground layer, one layer per extra material (dirt, water),
and an object layer. Objects carry their kind and footprint as properties, so
the game takes collisions from the abstract map, not from the pack's sprites.
"""
import json
import math
import random
import zlib
from pathlib import Path

from PIL import Image, ImageDraw

from vocab import FALLBACK, FOLK_FALLBACK, KINDS, MATERIAL_FALLBACK, MATERIALS
from build_tk import place_step  # lines get their Chinese and voice clip here
import wander
from tk_story_zh import ZH

ROOT = Path(__file__).resolve().parent.parent.parent
DIRS = {"N": (0, -1), "E": (1, 0), "S": (0, 1), "W": (-1, 0), "NE": (1, -1), "SE": (1, 1), "SW": (-1, 1), "NW": (-1, -1)}
ORDER = ["N", "E", "S", "W", "NE", "SE", "SW", "NW"]
CORNERS = {"NE": ("N", "E"), "SE": ("S", "E"), "SW": ("S", "W"), "NW": ("N", "W")}


ROADLIKE = {"road", "path", "dirt", "bridge", "gallery", "passage", "market", "court"}   # terrain the lit route prefers

def norm(sig):
    """Drop corner bits whose two edges aren't both inside: they can't show."""
    s = set(sig)
    for c, (a, b) in CORNERS.items():
        if c in s and not (a in s and b in s):
            s.discard(c)
    return frozenset(s)


def building_walls(m, kit, T):
    """A building's art is often wider than its footprint (an inn, a hall), or narrower (a small
    house). Its wall follows what's drawn (cl, cr: pixels left and right of its centre), but stops short of anyone
    standing there, a way in or a story spot, and leaves a walkway to the next building."""
    out, blds = {}, []
    for o in m["objects"]:
        if not (o["kind"].startswith("building.") and KINDS[o["kind"]][2]):
            continue
        _, spr = kit.sprite(o["kind"], f"{m['id']}/{o['x']},{o['y']}")
        if not spr:
            continue
        cx, fw = (o["x"] + o["w"] / 2) * T, o["w"] * T
        half = max(T / 2, spr[3] / 2 - 4)   # what's drawn, wider or narrower than the footprint
        blds.append({"o": o, "cx": cx, "fw": fw, "min": min(fw / 2, half), "y0": o["y"] * T, "y1": (o["y"] + o["h"]) * T, "l": half, "r": half})
    pts = [((n["x"] + .5) * T, (n["y"] + .9) * T) for n in m["npcs"]] + \
          [((x + .5) * T, (y + .9) * T) for x, y in m["entries"].values()] + \
          [((s["x"] + .5) * T, (s["y"] + .5) * T) for s in m.get("spots", [])]
    for b in blds:
        for px, py in pts:
            if b["y0"] - 8 < py < b["y1"] + 10:
                if px < b["cx"]:
                    b["l"] = min(b["l"], max(b["min"], b["cx"] - px - 10))
                else:
                    b["r"] = min(b["r"], max(b["min"], px - b["cx"] - 10))
    for a in blds:   # a walkway (a tile) between neighbours
        for b in blds:
            if a is b or not (a["y0"] < b["y1"] and b["y0"] < a["y1"]) or a["cx"] > b["cx"]:
                continue
            over = (a["cx"] + a["r"]) + T - (b["cx"] - b["l"])
            if over > 0:
                ta, tb = a["r"] - a["min"], b["l"] - b["min"]   # what each can give back
                ga = min(ta, over * ta / max(ta + tb, 1e-6))
                a["r"] -= ga
                b["l"] -= min(tb, over - ga)
    for b in blds:
        if b["l"] != b["fw"] / 2 or b["r"] != b["fw"] / 2:
            out[id(b["o"])] = {"cl": round(b["l"], 1), "cr": round(b["r"], 1)}
    return out


class Kit:
    def __init__(self, name):
        self.path = ROOT / f"assets/tk/kits/{name}.json"
        self.k = json.loads(self.path.read_text())
        self.T = self.k["tile"]
        self.img = {s: Image.open(ROOT / p).convert("RGBA") for s, p in self.k["sheets"].items()}
        self.blobs = {}
        self.missing = set()

    # ----- autotile: learn each blob tile's neighbours from its border pixels -----
    def blob(self, mat):
        if mat in self.blobs:
            return self.blobs[mat]
        d = self.k["materials"][mat]
        sheet, x0, y0, w, h = d["blob"]
        im, T = self.img[sheet], self.T
        osh, ox, oy = d["outside"]
        out_tile = self.img[osh].crop((ox * T, oy * T, ox * T + T, oy * T + T)).convert("RGB")
        opx = list(out_tile.getdata())
        ref = tuple(sum(p[i] for p in opx) / len(opx) for i in range(3))
        oset = set(opx)

        def outside(p):
            return p in oset or sum((a - b) ** 2 for a, b in zip(p, ref)) < 1200
        pts = {"N": [(T // 2 - 1, 0), (T // 2, 0)], "E": [(T - 1, T // 2 - 1), (T - 1, T // 2)],
               "S": [(T // 2 - 1, T - 1), (T // 2, T - 1)], "W": [(0, T // 2 - 1), (0, T // 2)],
               "NE": [(T - 1, 0)], "SE": [(T - 1, T - 1)], "SW": [(0, T - 1)], "NW": [(0, 0)]}
        table = {}
        for ty in range(y0, y0 + h):
            for tx in range(x0, x0 + w):
                if im.crop((tx * T, ty * T, tx * T + T, ty * T + T)).getchannel("A").getextrema()[0] < 255:
                    continue
                sig = norm(k for k in ORDER if not all(outside(im.getpixel((tx * T + x, ty * T + y))[:3]) for x, y in pts[k]))
                table.setdefault(sig, []).append((sheet, tx, ty))
        full = frozenset(ORDER)
        if full not in table:
            table[full] = [(sheet, *d["inside"])]
        self.blobs[mat] = table
        return table

    def pick_blob(self, mat, sig, rnd):
        table = self.blob(mat)
        sig = norm(sig)
        if sig in table:
            return rnd.choice(table[sig])
        # nearest: edges matter more than corners
        def cost(s):
            return sum((3 if k in "NESW" else 1) for k in ORDER if (k in s) != (k in sig))
        best = min(table, key=cost)
        return rnd.choice(table[best])

    def material(self, mat):
        if mat not in self.k["materials"]:   # a ground this kit has no tiles of: its stand-in
            mat = next((m for m in MATERIAL_FALLBACK.get(mat, []) if m in self.k["materials"]), mat)
        d = self.k["materials"].get(mat)
        seen = set()
        while d and "same" in d and d["same"] not in seen:
            seen.add(d["same"])
            mat, d = d["same"], self.k["materials"].get(d["same"])
        return mat, d

    def sprite(self, kind, key):
        for k in [kind] + FALLBACK.get(kind, []):
            v = self.k["kinds"].get(k)
            if v:
                i = zlib.crc32(key.encode()) % len(v)
                return f"{k}#{i}", v[i]
        self.missing.add(kind)
        return None, None

    def folk(self, kind, key):
        """The townsperson's sprite, and whether the game draws it like a hero (folk.drawn)."""
        drawn = self.k["folk"].get("drawn") or {}
        kinds = self.k["folk"]["kinds"]
        # drawn like a hero when the kit says so for this kind (or has no pack sprite for it)
        if kind in drawn or (drawn and kind not in kinds):
            v = drawn.get(kind) or drawn[FOLK_FALLBACK]
            return v[zlib.crc32(key.encode()) % len(v)], True
        v = kinds.get(kind) or kinds.get(FOLK_FALLBACK)
        i = zlib.crc32(key.encode()) % len(v)
        return f"{kind if kind in kinds else FOLK_FALLBACK}#{i}", False


SEEN = {}   # the world's seen_lines, by key (filled by compile_world)


def voiced_states(states):
    """A procession's leash line as a spoken step (Chinese and voice clip)."""
    out = []
    for st in states:
        pr = st.get("procession")
        if pr and isinstance(pr.get("leash_line"), str):
            st = {**st, "procession": {**pr, "leash_line": place_step(pr["leash_line"])[0]}}
        if st.get("shut"):   # a gate the state has shut: what it says when you walk into it
            st = {**st, "shut": [{**g, "say": [place_step(l)[0] for l in ([g["say"]] if isinstance(g["say"], str) else g["say"])]}
                                 for g in st["shut"]]}
        if st.get("exits_closed_say"):   # what you're told at a road the state has shut
            st = {**st, "exits_closed_say": {k: [place_step(l)[0] for l in ([v] if isinstance(v, str) else v)]
                                             for k, v in st["exits_closed_say"].items()}}
        out.append(st)
    return out


def doors_blocked(objs):
    """The doors (small exits) the engine's player can't go into: no stance puts the point 3 px above her feet in the
    exit while her body (10 x 6, feet at its bottom edge) is clear of every solid. Each solid is the box tk-world makes from a prop: cl/cr either side of x, fh tall, less 1 px
    all round. A door drawn into its own building's solid (the White Gate tower's north door) fails here."""
    P = lambda o: {p["name"]: p["value"] for p in o.get("properties", [])}   # noqa: E731
    zones = []
    for o in objs:
        p = P(o)
        if o["type"] != "prop" or not p.get("solid") or p.get("in"):
            continue
        l, r = p.get("cl", p.get("fw", 0) / 2), p.get("cr", p.get("fw", 0) / 2)
        cx, cy, w, h = o["x"] + (r - l) / 2, o["y"] - p.get("fh", 0) / 2, l + r - 2, p.get("fh", 0) - 2
        zones.append((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2))
    hit = lambda a: any(a[0] < z[2] and z[0] < a[2] and a[1] < z[3] and z[1] < a[3] for z in zones)   # noqa: E731
    bad = []
    for o in objs:
        if o["type"] != "exit" or o["width"] >= 16 or o["height"] >= 16:
            continue   # a map's edge or a wall's gate: long, walked through
        ex = (o["x"], o["y"], o["x"] + o["width"], o["y"] + o["height"])
        # she goes in when the point 3 px above her feet is in the exit: some stance must put it there with her body
        # (10 x 6 above her feet, and 2 px more each way for where the physics settles her) clear of every solid
        if not any(not hit((fx - 7, fy - 8, fx + 7, fy + 2))
                   for fx in range(int(ex[0]), int(ex[2]) + 1) for fy in range(int(ex[1]) + 3, int(ex[3]) + 4)
                   if ex[0] <= fx <= ex[2] and ex[1] <= fy - 3 <= ex[3]):
            bad.append(P(o).get("to", o["name"]))
    return bad


def doors_front_blocked(objs, T):
    """The doors you can't walk straight into: from 3 tiles out on the face it's entered by, along the door's middle,
    her body (10 x 6) meets a solid or someone standing there before the point 3 px above her feet is in the exit. A
    banner set before Lü Bu's tent door, a farmer before Xuzhou's hall (Testing)."""
    P = lambda o: {p["name"]: p["value"] for p in o.get("properties", [])}   # noqa: E731
    boxes = []
    for o in objs:
        p = P(o)
        if o["type"] == "prop" and p.get("solid") and not p.get("in"):
            l, r = p.get("cl", p.get("fw", 0) / 2), p.get("cr", p.get("fw", 0) / 2)
            cx, cy, w, h = o["x"] + (r - l) / 2, o["y"] - p.get("fh", 0) / 2, l + r - 2, p.get("fh", 0) - 2
            boxes.append((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2))
        elif o["type"] == "npc":
            boxes.append((o["x"] - 5, o["y"] - 6, o["x"] + 5, o["y"]))
    hit = lambda a: any(a[0] < z[2] and z[0] < a[2] and a[1] < z[3] and z[1] < a[3] for z in boxes)   # noqa: E731
    bad = []
    for o in objs:
        if o["type"] != "exit" or o["width"] >= 16 or o["height"] >= 16:
            continue
        side = P(o).get("side", "N")
        ux, uy = {"N": (0, 1), "S": (0, -1), "E": (-1, 0), "W": (1, 0)}[side]   # out, the way she comes from
        ex = (o["x"], o["y"], o["x"] + o["width"], o["y"] + o["height"])
        fx, fy = (ex[0] + ex[2]) / 2, (ex[1] + ex[3]) / 2 + 3   # feet: the point 3 px above them at the exit's middle
        ok = False
        for k in range(3 * T, -1, -2):
            x, y = fx + ux * k, fy + uy * k
            if hit((x - 5, y - 6, x + 5, y)):
                break
            if ex[0] <= x <= ex[2] and ex[1] <= y - 3 <= ex[3]:
                ok = True
                break
        if not ok:
            bad.append(P(o).get("to", o["name"]))
    return bad


def compile_map(m, kit, out_dir):
    T = kit.T
    W, H = m["size"]
    legend = m["terrain"]["legend"]
    grid = [[legend[c] for c in row] for row in m["terrain"]["rows"]]
    # a ground this kit has no tiles of is drawn as its stand-in (vocab MATERIAL_FALLBACK), edges and all
    sub = {mat: kit.material(mat)[0] for mat in {c for row in grid for c in row}
           if (mat not in kit.k["materials"] or "same" in kit.k["materials"][mat])
           and mat not in kit.k.get("room_styles", {}).get(m.get("style"), {})}
    sub = {k: v for k, v in sub.items() if k != v}
    if sub:
        grid = [[sub.get(c, c) for c in row] for row in grid]
    rnd = random.Random(m["seed"])

    # tilesets: every kit sheet used by a material, plus a swatch sheet for flat colours
    tilesets, gids = [], {}
    swatches = []

    def gid(sheet, tx, ty):
        if sheet not in gids:
            im = kit.img[sheet] if sheet != "_swatch" else None
            cols = (im.width // T) if im else 64
            rows = (im.height // T) if im else 1
            first = 1 + sum(t["tilecount"] for t in tilesets)
            gids[sheet] = (first, cols)
            tilesets.append({"firstgid": first, "name": sheet, "tilewidth": T, "tileheight": T, "columns": cols,
                             "tilecount": cols * rows, "margin": 0, "spacing": 0,
                             "image": "" if sheet == "_swatch" else str(Path("../../../..") / kit.k["sheets"][sheet]),
                             "imagewidth": cols * T, "imageheight": rows * T})
        first, cols = gids[sheet]
        return first + ty * cols + tx

    def plain(d, mat):
        if "tiles" in d:
            ts = d["tiles"]
            sheet, tx, ty, _ = rnd.choices(ts, weights=[t[3] for t in ts])[0]
            return gid(sheet, tx, ty)
        if "color" in d:
            if d["color"] not in swatches:
                swatches.append(d["color"])
            return gid("_swatch", swatches.index(d["color"]), 0)
        return 0

    layers = []
    # a room may carry a "style" (its building's kind): the kit can dress it differently
    # ("room_styles": {"building.hall": {"wall": {...}, "stone": {...}}})
    style = kit.k.get("room_styles", {}).get(m.get("style"), {})

    def material(mat):
        return (mat, style[mat]) if mat in style else kit.material(mat)
    base_mat, base = kit.material("grass")
    OUTDOOR = ("grass", "sand", "dirt", "water")   # drawn over grass, edges by the blob layers below

    def ground(mat):
        if mat in OUTDOOR:
            return plain(base, "grass")
        rm, d = material(mat)
        if d and "edge" in d:                       # a wall: what shows through its gaps
            rm, d = material(d.get("under", "void"))
        return plain(d, rm) if d else 0
    layers.append(("ground", [ground(grid[y][x]) for y in range(H) for x in range(W)]))
    # one layer per other material present, in a fixed order (water over roads)
    resolved = {}
    for mat in ["sand", "dirt", "water"]:
        rm, d = kit.material(mat)
        resolved.setdefault(rm, (d, set()))[1].add(mat)
    for rm, (d, members) in resolved.items():
        if rm == base_mat or d is None:
            continue
        cells = [(x, y) for y in range(H) for x in range(W) if grid[y][x] in members]
        if not cells:
            continue
        inside = set(cells)
        data = [0] * (W * H)
        for x, y in cells:
            if "blob" in d:
                sig = [k for k in ORDER if not (0 <= x + DIRS[k][0] < W and 0 <= y + DIRS[k][1] < H)
                       or (x + DIRS[k][0], y + DIRS[k][1]) in inside]
                data[y * W + x] = gid(*kit.pick_blob(rm, sig, rnd))
            else:
                data[y * W + x] = plain(d, rm)
        layers.append((rm, data))
    # a flood that rises with the map's states (Places' "water_layers"): a water layer for each set of states, named
    # "water:<state ids>", which tk-world shows and makes impassable only while one of those states is on
    wd, wrm = kit.material("water")[1], kit.material("water")[0]
    base_water = {(x, y) for y in range(H) for x in range(W) if grid[y][x] == "water"}
    for wl in m.get("water_layers", []):
        cells = [tuple(t) for t in wl["tiles"]]
        inside = set(cells) | base_water
        data = [0] * (W * H)
        for x, y in cells:
            if wd and "blob" in wd:
                sig = [k for k in ORDER if not (0 <= x + DIRS[k][0] < W and 0 <= y + DIRS[k][1] < H)
                       or (x + DIRS[k][0], y + DIRS[k][1]) in inside]
                data[y * W + x] = gid(*kit.pick_blob(wrm, sig, rnd))
            elif wd:
                data[y * W + x] = plain(wd, wrm)
        layers.append(("water:" + ",".join(wl["states"]), data))

    # small ground detail (sprouts, petals) scattered over open grass, if the
    # kit has it: "detail": {"tiles": [[sheet, tx, ty, weight], ...], "density": 0.08}
    det = kit.k.get("detail")
    if det:
        covered = {(xx, yy) for o in m["objects"] for yy in range(int(o["y"]), math.ceil(o["y"] + o["h"]))
               for xx in range(int(o["x"]), math.ceil(o["x"] + o["w"]))}   # (a prop drawn over a building sits on a fraction)
        drnd = random.Random(f"{m['seed']}/detail")   # its own stream: the other layers don't change
        data = [0] * (W * H)
        for y in range(H):
            for x in range(W):
                if grid[y][x] == "grass" and (x, y) not in covered and drnd.random() < det["density"]:
                    sheet, tx, ty, _ = drnd.choices(det["tiles"], weights=[t[3] for t in det["tiles"]])[0]
                    data[y * W + x] = gid(sheet, tx, ty)
        if any(data):
            layers.append(("detail", data))

    # walls: a frame of edge and corner pieces, chosen by where the floor is
    walls = {(x, y) for y in range(H) for x in range(W) if grid[y][x] == "wall"}
    if walls:
        _, d = material("wall")
        data = [0] * (W * H)
        floor = lambda x, y: 0 <= x < W and 0 <= y < H and MATERIALS.get(grid[y][x]) and grid[y][x] != "void"
        for x, y in walls:
            n, s_, e, w_ = floor(x, y - 1), floor(x, y + 1), floor(x + 1, y), floor(x - 1, y)
            piece = ("t" if s_ else "b" if n else "l" if e else "r" if w_ else
                     "tl" if floor(x + 1, y + 1) else "tr" if floor(x - 1, y + 1) else "bl" if floor(x + 1, y - 1) else "br")
            if d and "edge" in d:
                sh = d["edge"]["sheet"]
                data[y * W + x] = gid(sh, *d["edge"][piece])
            elif d:
                data[y * W + x] = plain(d, "wall")
        layers.append(("wall", data))

    objs = []

    def obj(name, type_, x, y, w=0, h=0, **props):
        o = {"id": len(objs) + 1, "name": name, "type": type_, "x": round(x, 2), "y": round(y, 2),
             "width": w, "height": h, "rotation": 0, "visible": True}
        if not w:
            o["point"] = True
        if props:
            o["properties"] = [{"name": k, "type": "bool" if isinstance(v, bool) else "int" if isinstance(v, int) else
                                "float" if isinstance(v, float) else "string", "value": v} for k, v in props.items()]
        objs.append(o)

    for s in m.get("spots", []):   # cover to hide in (hide and wait): a two-tile square round the spot, a "cover" object
        if s.get("cover"):
            obj(s["id"], "cover", (s["x"] - 1) * T, (s["y"] - 1.5) * T, 2 * T, 2 * T, label=s.get("label", ""),
                label_zh=ZH.get(s.get("label", ""), ""))
    walls = building_walls(m, kit, T)
    for o in m["objects"]:
        # a building whose front faces E or W (a siheyuan wing): its side view, if the kit has one; the side
        # sprite's door faces E, so a W-facing one is drawn mirrored
        faces = o.get("faces") or o.get("door")
        side = f"{o['kind']}_side" if faces in ("E", "W") else None
        draw_kind = side if side and kit.k["kinds"].get(side) else o["kind"]
        key, spr = kit.sprite(draw_kind, f"{m['id']}/{o['x']},{o['y']}")
        solid = o.get("solid", KINDS[o["kind"]][2])   # a cover's thing is walked through
        drawn = (key or "").split("#")[0]
        gated = any(x.get("id") == f"{o.get('id')}-gate" for x in m["objects"])   # its door already has a gatehouse drawn
        if key and not gated and drawn != draw_kind and o["kind"].startswith("building.") and drawn in KINDS and \
                (KINDS[drawn][0] < o["w"] or KINDS[drawn][1] < o["h"]):
            # a big building (a walled compound, a palace) this kit draws with a smaller stand-in: the stand-in
            # stands at the door on a footprint of its own, so the door is at the building you see (the iso view
            # draws art at its footprint's centre), solid where it's drawn
            fw, fh = min(KINDS[drawn][0], o["w"]), min(KINDS[drawn][1], o["h"])
            d = o.get("enter") or o.get("door") or "S"
            fx = o["x"] + (o["w"] - fw) / 2 if d in ("N", "S") else (o["x"] + o["w"] - fw if d == "E" else o["x"])
            fy = (o["y"] + o["h"] - fh if o["kind"] == "building.gatetower" else o["y"] + (o["h"] - fh) / 2) if d in ("E", "W") else (o["y"] + o["h"] - fh if d == "S" else o["y"])
            obj(key, "prop", (fx + fw / 2) * T, (fy + fh) * T, kind=o["kind"], fw=fw * T, fh=fh * T, solid=solid,
                **({"ref": o["id"]} if o.get("id") else {}),
                **({"in": json.dumps([o["in"]] if isinstance(o["in"], str) else o["in"])} if o.get("in") else {}),
                **({"plaque": o["plaque"]} if o.get("plaque") else {}))
            continue
        obj(key or "", "prop", (o["x"] + o["w"] / 2) * T, (o["y"] + o["h"]) * T,
            kind=o["kind"], fw=o["w"] * T, fh=o["h"] * T, solid=solid, **({"ref": o["id"]} if o.get("id") else {}),
            **({"in": json.dumps([o["in"]] if isinstance(o["in"], str) else o["in"])} if o.get("in") else {}),
            **({"flip": True} if draw_kind == side and faces == "W" else {}),
            **({"plaque": o["plaque"]} if o.get("plaque") else {}),   # a name board over its gate (tk-world draws it)
            **({"told": o["told"]} if o.get("told") else {}),   # the loud town: shown once that person has the news (red hangings)
            **({"lift": o["lift"]} if o.get("lift") else {}),   # px to draw it higher than its foot (which sets its depth)
            **walls.get(id(o), {}))
    runs = []
    for y in range(H):
        x = 0
        while x < W:
            if grid[y][x] == "wall":
                x0 = x
                while x < W and grid[y][x] == "wall":
                    x += 1
                runs.append((x0, y, x - x0))
            x += 1
    for x0, y, n in runs:
        obj("", "prop", (x0 + n / 2) * T, (y + 1) * T, kind="wall", fw=n * T, fh=T, solid=True)
    # every other ground the plan says can't be walked (a city wall, hills, a cliff face) is solid too: the engine
    # collides only with solid props and water, so without these she walked through Xiapi's city wall and over Xiao
    # Pass's hills, and the plans' proofs (blockers, covered routes, shut gates) held only on paper. Water has its own
    # layers (the flood's included), and a compound's wall its runs above
    walk = m["terrain"].get("walk", {})
    plain = [[legend[c] for c in row] for row in m["terrain"]["rows"]]
    for y in range(H):
        x = 0
        while x < W:
            mat = plain[y][x]
            if walk.get(mat, True) is False and mat not in ("water", "wall"):
                x0 = x
                while x < W and plain[y][x] == mat:
                    x += 1
                obj("", "prop", (x0 + (x - x0) / 2) * T, (y + 1) * T, kind="wall", fw=(x - x0) * T, fh=T, solid=True)
            else:
                x += 1
    for s in m["spots"]:
        obj(s["id"], "spot", s["x"] * T, s["y"] * T, node=s["node"], label=s.get("label", ""), label_zh=ZH.get(s.get("label", ""), ""),
            **({"trigger": s["trigger"]} if s.get("trigger") else {}), **({"use": s["use"]} if s.get("use") else {}),
            **({"needs": json.dumps(s["needs"] if isinstance(s["needs"], list) else [s["needs"]])} if s.get("needs") else {}),
            **({"sight": json.dumps(s["sight"])} if s.get("sight") else {}),
            **({"via": json.dumps(s["via"])} if s.get("via") else {}),   # the goal marker's way round (tiles)
            **{k: s[k] for k in ("delivers", "when", "fires") if s.get(k)},
            **{k: json.dumps([place_step(l)[0] for l in s[k]], ensure_ascii=False) for k in ("empty", "waiting", "deliver", "delivered", "call") if s.get(k)},
            **{k: json.dumps([place_step(l)[0] for l in s[k]], ensure_ascii=False) for k in ("intro", "outro") if s.get(k)})
    for n in m["npcs"]:
        sprite, drawn = (n["kind"][5:], False) if n["kind"].startswith("hero.") else kit.folk(n["kind"], f"{m['id']}/{n['id']}")
        obj(n["id"], "npc", n["x"] * T, n["y"] * T, kind=n["kind"], sprite=sprite, wander=bool(n.get("wander")),
            **({"drawn": True} if drawn else {}),
            say=json.dumps([place_step(l, n["kind"])[0] for l in n.get("say", [])], ensure_ascii=False),
            **{k: n[k] for k in ("challenge", "until", "face", "when", "gives", "gives_when") if n.get(k)},
            **({"view": json.dumps(n["view"])} if n.get("view") else {}),
            **({"watch": json.dumps({**n["watch"], "seen": [place_step(l, n["kind"])[0] for l in
                                                            (SEEN.get(n["watch"]["seen"], []) if isinstance(n["watch"].get("seen"), str) else n["watch"].get("seen") or [])]},
                                    ensure_ascii=False)} if n.get("watch") else {}),
            **({"rider": json.dumps(n["rider"])} if n.get("rider") else {}),   # a chase rider (tk-world chaseStep)
            # the loud town (tk-feats.js): news to pass on to the neighbours named; and a blocker who gives way when faced
            **({"gossip": json.dumps(n["gossip"])} if n.get("gossip") else {}),
            **({"yield": json.dumps({**n["yield"], **{k: [place_step(l, n["kind"])[0] for l in n["yield"].get(k, [])] for k in ("line", "caught")}},
                                    ensure_ascii=False)} if n.get("yield") else {}),
            **({"in": json.dumps([n["in"]] if isinstance(n["in"], str) else n["in"])} if n.get("in") else {}),
            **({"guard_x": n["guard"][0] * T, "guard_y": n["guard"][1] * T} if n.get("guard") else {}),
            **{k: json.dumps([place_step(l, n["kind"])[0] for l in ([n[k]] if isinstance(n[k], str) else n[k])], ensure_ascii=False)
               for k in ("intro", "win", "done", "give", "given", "call") if n.get(k)})
    for e in m["exits"]:
        obj(f"exit-{e['to']}", "exit", e["x"] * T, e["y"] * T, e["w"] * T, e["h"] * T, to=e["to"], side=e["side"],
            **({"open_to": json.dumps(e["open_to"])} if e.get("open_to") else {}),
            **({"refuse": json.dumps([place_step(l)[0] for l in ([e["refuse"]] if isinstance(e["refuse"], str) else e["refuse"])], ensure_ascii=False)}
               if e.get("refuse") else {}))
    for k, (x, y) in m["entries"].items():
        obj(f"entry-{k}" if k else "entry", "entry", (x + .5) * T, (y + .9) * T, **({"from": k} if k else {}))

    # always written (the game loads it for every kit); holds the kit's flat colours
    sw = Image.open(out_dir / "swatch.png").convert("RGBA") if (out_dir / "swatch.png").exists() else Image.new("RGBA", (64 * T, T))
    for i, c in enumerate(swatches):
        sw.paste(Image.new("RGBA", (T, T), c), (i * T, 0))
    sw.save(out_dir / "swatch.png")
    if swatches:
        for t in tilesets:
            if t["name"] == "_swatch":
                t["image"] = "swatch.png"

    tmj = {"type": "map", "version": "1.10", "tiledversion": "1.10.2", "orientation": "orthogonal",
           "renderorder": "right-down", "width": W, "height": H, "tilewidth": T, "tileheight": T, "infinite": False,
           "nextlayerid": len(layers) + 2, "nextobjectid": len(objs) + 1,
           "properties": [{"name": "kit", "type": "string", "value": kit.k["kit"]},
                          {"name": "source", "type": "string", "value": f"{m['id']}.map.json"}]
                         + ([{"name": "states", "type": "string", "value": json.dumps(voiced_states(m["states"]), ensure_ascii=False)}] if m.get("states") else [])
                         + ([{"name": "ways", "type": "string", "value": json.dumps(m["ways"], separators=(",", ":"))}] if m.get("ways") else [])   # the streets, for the lit route
                         + ([{"name": "chase", "type": "string", "value": json.dumps(m["chase"], separators=(",", ":"))}] if m.get("chase") else [])   # a wave and ambushes (tiles): tk-world reads it
                         + ([{"name": "paths", "type": "string", "value": "|".join("".join("1" if m["terrain"]["legend"].get(ch, "") in ROADLIKE else "0" for ch in row)
                                                                                 for row in m["terrain"]["rows"])}]
                            if m.get("archetype") != "interior" else []),   # the drawn roads and paths, which the lit route keeps to
           "tilesets": tilesets,
           "layers": [{"id": i + 1, "name": n, "type": "tilelayer", "width": W, "height": H, "x": 0, "y": 0,
                       "opacity": 1, "visible": True, "data": data} for i, (n, data) in enumerate(layers)] +
                     [{"id": len(layers) + 1, "name": "objects", "type": "objectgroup", "draworder": "topdown",
                       "x": 0, "y": 0, "opacity": 1, "visible": True, "objects": objs}]}
    bad = doors_blocked(objs)
    if bad:
        raise RuntimeError(f"{m['id']} ({kit.k['kit']}): no one can step into the door to {', '.join(bad)}: it is inside a solid")
    bad = doors_front_blocked(objs, T)
    if bad:
        raise RuntimeError(f"{m['id']} ({kit.k['kit']}): the straight way in to the door to {', '.join(bad)} is blocked")
    bad = wander.cramped(m)
    if bad:
        raise RuntimeError(f"{m['id']}: {', '.join(bad)} would wander over a drawn face: settle the map (wander.settle)")
    (out_dir / f"{m['id']}.tmj").write_text(json.dumps(tmj, ensure_ascii=False, separators=(",", ":")))
    return tmj


# ---------- previews ----------
def render(tmj, kit, out_dir):
    T, W, H = kit.T, tmj["width"], tmj["height"]
    canvas = Image.new("RGBA", (W * T, H * T), (0, 0, 0, 255))
    sheets = []
    for ts in sorted(tmj["tilesets"], key=lambda t: t["firstgid"]):
        im = Image.open(out_dir / ts["image"]).convert("RGBA") if ts["name"] == "_swatch" else kit.img[ts["name"]]
        sheets.append((ts["firstgid"], ts["columns"], im))

    def tile(g):
        for first, cols, im in reversed(sheets):
            if g >= first:
                i = g - first
                return im.crop(((i % cols) * T, (i // cols) * T, (i % cols) * T + T, (i // cols) * T + T))
    for layer in tmj["layers"]:
        if layer["type"] != "tilelayer":
            continue
        for i, g in enumerate(layer["data"]):
            if g:
                canvas.alpha_composite(tile(g), ((i % W) * T, (i // W) * T))
    objs = next(l for l in tmj["layers"] if l["type"] == "objectgroup")["objects"]
    props = lambda o: {p["name"]: p["value"] for p in o.get("properties", [])}
    d = ImageDraw.Draw(canvas)
    folk = kit.k["folk"]
    draw = []
    for o in objs:
        p = props(o)
        if o["type"] == "prop" and p.get("kind") == "wall":
            continue
        if o["type"] == "prop":
            if o["name"]:
                kind, i = o["name"].split("#")
                sh, x, y, w, h = kit.k["kinds"][kind][int(i)]
                spr = kit.img[sh].crop((x, y, x + w, y + h))
                draw.append((o["y"], spr, (int(o["x"] - w / 2), int(o["y"] - h))))
            else:
                d.rectangle([o["x"] - p["fw"] / 2, o["y"] - p["fh"], o["x"] + p["fw"] / 2, o["y"]], outline=(255, 0, 255))
        elif o["type"] == "npc":
            if p["kind"].startswith("hero.") or p.get("drawn"):   # drawn by the game, not the pack
                d.ellipse([o["x"] - 5, o["y"] - 14, o["x"] + 5, o["y"] - 4], fill=(200, 40, 40), outline=(0, 0, 0))
            else:
                kind, i = p["sprite"].split("#")
                f = folk["kinds"][kind][int(i)]
                fw, fh = folk["frame"]
                im = Image.open(ROOT / folk["sheets"][f["sheet"]]).convert("RGBA")
                c, r = f["origin"][0] + folk["dirs"]["down"][0] + folk["step"][0] * folk["still"], \
                    f["origin"][1] + folk["dirs"]["down"][1] + folk["step"][1] * folk["still"]
                spr = im.crop((c * fw, r * fh, c * fw + fw, r * fh + fh))
                draw.append((o["y"], spr, (int(o["x"] - fw / 2), int(o["y"] - fh))))
    for _, spr, xy in sorted(draw, key=lambda t: t[0]):
        canvas.alpha_composite(spr, xy)
    for o in objs:
        p = props(o)
        if o["type"] == "spot":
            x, y = o["x"], o["y"]
            d.polygon([(x, y - 9), (x + 5, y - 4), (x, y + 1), (x - 5, y - 4)], fill=(255, 215, 0), outline=(0, 0, 0))
        elif o["type"] == "exit":
            d.rectangle([o["x"], o["y"], o["x"] + o["width"] - 1, o["y"] + o["height"] - 1], outline=(0, 255, 255), width=2)
    return canvas


def compile_world(n, kit_name, preview=False):
    src = ROOT / f"data/tk_maps/w{n}"
    out = src / kit_name
    out.mkdir(parents=True, exist_ok=True)
    kit = Kit(kit_name)
    region = json.loads((src / "region.json").read_text())
    shots = []
    maps = {p["id"]: json.loads((src / p["map"]).read_text()) for p in region["places"]}
    SEEN.clear()   # a watcher's "seen" may name lines kept on another map of the world (the city's seen_lines)
    for m in maps.values():
        SEEN.update(m.get("seen_lines") or {})
    for p in region["places"]:
        m = maps[p["id"]]
        tmj = compile_map(m, kit, out)
        if preview:
            img = render(tmj, kit, out)
            pd = ROOT / f"docs/maps/w{n}/{kit_name}"
            pd.mkdir(parents=True, exist_ok=True)
            img.convert("RGB").save(pd / f"{p['id']}.png")
            shots.append((p["name"], img))
    print(f"compiled {len(region['places'])} maps for kit '{kit_name}' into {out.relative_to(ROOT)}")
    if kit.missing:
        print(f"  kit '{kit_name}' draws nothing for: {', '.join(sorted(kit.missing))} (solid but invisible)")
    if preview:
        overview(shots, ROOT / f"docs/maps/w{n}/{kit_name}/overview.png")


def overview(shots, path, cols=4, cell=(360, 270)):
    rows = (len(shots) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell[0], rows * (cell[1] + 18)), (24, 28, 24))
    d = ImageDraw.Draw(sheet)
    for i, (name, img) in enumerate(shots):
        im = img.copy()
        im.thumbnail(cell, Image.NEAREST)
        x, y = (i % cols) * cell[0], (i // cols) * (cell[1] + 18)
        sheet.paste(im.convert("RGB"), (x + (cell[0] - im.width) // 2, y + 16))
        d.text((x + 6, y + 2), name, fill=(240, 230, 200))
    sheet.save(path)
