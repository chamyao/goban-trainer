"""Build the explorable Zhuo County town for the Three Kingdoms campaign.

Writes:
  assets/tk/jade/tiles.png   ground tileset (16px tiles cut from the Jade pack)
  data/tk_town_zhuo.json     the map, in Tiled's JSON format (opens in Tiled)

The map has one tile layer ("ground") and one object layer ("objects").
Objects are anchored at their bottom-centre (x, y in map pixels):
  type "prop"   name = a sprite in tk-town.js PROPS
  type "npc"    name = an id; properties: who | folk, line, wander, challenge, face
  type "spot"   name = an id the story uses (notice, inn, garden, exit-*)
  type "spawn"  where the player starts
"""
import json
import random
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
JADE = ROOT / "assets/tk/jade"
W, H, T = 44, 32, 16

# ---------- ground tileset ----------
town = Image.open(JADE / "town.png").convert("RGBA")
nature = Image.open(JADE / "nature.png").convert("RGBA")
ground = Image.open(JADE / "ground.png").convert("RGBA")


def tile(im, tx, ty):
    return im.crop((tx * T, ty * T, tx * T + T, ty * T + T))


def over(base, top):
    b = base.copy()
    b.alpha_composite(top)
    return b


cream = tile(town, 2, 0)
TILES = [
    tile(town, 4, 1),               # 1 grass
    tile(town, 3, 1),               # 2 grass, darker patch
    tile(nature, 6, 15),            # 3 dirt path
    over(cream, tile(town, 1, 1)),  # 4 stone square
    over(cream, tile(ground, 0, 0)),  # 5 tilled field
]
sheet = Image.new("RGBA", (T * len(TILES), T))
for i, t in enumerate(TILES):
    sheet.paste(t, (i * T, 0))
sheet.save(JADE / "tiles.png")
GRASS, GRASS2, PATH, SQUARE, FIELD = 1, 2, 3, 4, 5

# ---------- layout ----------
rnd = random.Random(184)
g = [[GRASS] * W for _ in range(H)]


def fill(x0, y0, x1, y1, v):
    for y in range(max(0, y0), min(H, y1 + 1)):
        for x in range(max(0, x0), min(W, x1 + 1)):
            g[y][x] = v


# darker grass patches
for _ in range(26):
    cx, cy, r = rnd.randrange(W), rnd.randrange(H), rnd.randrange(1, 3)
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r - 1, cx + r + 2):
            if 0 <= x < W and 0 <= y < H and rnd.random() < .8:
                g[y][x] = GRASS2

fill(11, 13, 20, 20, SQUARE)          # town square
fill(0, 16, 10, 17, PATH)             # west road from Lousang Village
fill(15, 9, 16, 12, PATH)             # north to the inn
fill(21, 16, 31, 17, PATH)            # east to Zhang Fei's farm
fill(30, 18, 31, 21, PATH)            # up to the farmhouse door
fill(15, 21, 16, H - 1, PATH)         # south road toward Daxing
fill(4, 12, 10, 13, PATH)             # to the teahouse
fill(4, 14, 5, 15, PATH)
fill(24, 22, 29, 27, FIELD)           # Zhang Fei's fields
fill(32, 11, 33, 15, PATH)            # gate path into the peach garden

objs = []


def obj(type_, name, x, y, **props):
    o = {"id": len(objs) + 1, "name": name, "type": type_, "x": x, "y": y, "width": 0, "height": 0,
         "point": True, "rotation": 0, "visible": True}
    if props:
        o["properties"] = [{"name": k, "type": "string" if isinstance(v, str) else "int", "value": v} for k, v in props.items()]
    objs.append(o)


def prop(name, tx, ty, dx=0, dy=0):
    """Bottom-centre at the bottom-middle of tile (tx, ty)."""
    obj("prop", name, tx * T + 8 + dx, ty * T + T + dy)


# buildings
prop("inn", 15, 8, 8)              # the village inn (north of the square)
prop("teahouse", 5, 11)            # teahouse with the storyteller
prop("house", 4, 23)
prop("house", 9, 27)
prop("home", 22, 11)
prop("office", 27, 10)             # the county office
prop("farmhouse", 30, 17)          # Zhang Fei's farm
prop("notice", 15, 13, 8, 2)       # the notice board in the square
for x in (12, 19):
    prop("lantern", x, 13)
prop("planter", 13, 20, 8)
prop("planter", 18, 20, 8)

# Zhang Fei's fields and the peach garden behind the farm
for x in range(24, 30, 2):
    prop("fence", x, 21, 8)
for y in range(11, 30):
    if y not in (13, 14):
        prop("fenceV", 34, y)
for y in range(12, 30, 3):
    for x in range(36, 43, 3):
        if not (x == 39 and y in (18, 21)):        # a clearing in the middle for the Star Lords
            prop("peach", x, y, rnd.randrange(-3, 4), rnd.randrange(-2, 3))
prop("gotable", 39, 18, 8, -2)                    # the two old men's weiqi board
prop("lotus", 42, 22, 8)

# border woods
for x in range(0, W, 2):
    if not 14 <= x <= 17:
        prop(rnd.choice(["oak", "oak2"]), x, 1, rnd.randrange(-4, 5))
        if not 14 <= x <= 17:
            prop(rnd.choice(["oak", "oak2", "cypress"]), x + 1, H - 1, rnd.randrange(-3, 4))
for y in range(3, H - 1, 2):
    if not 15 <= y <= 18:
        prop(rnd.choice(["cypress", "cypress2", "bamboo"]), 0, y)
for y in range(3, 11, 2):
    prop(rnd.choice(["cypress", "cypress2"]), W - 1, y)

# scattered nature on open grass
taken = set()
for o in objs:
    taken.add((o["x"] // T, o["y"] // T))


def free(tx, ty, r=1):
    if not (1 <= tx < W - 1 and 2 <= ty < H - 1):
        return False
    for y in range(ty - r, ty + r + 1):
        for x in range(tx - r, tx + r + 1):
            if 0 <= x < W and 0 <= y < H and (g[y][x] != GRASS and g[y][x] != GRASS2 or (x, y) in taken):
                return False
    return True


# keep clear of buildings: mark their footprints
for name, tx0, ty0, tx1, ty1 in [("inn", 11, 3, 19, 9), ("teahouse", 1, 6, 9, 12), ("home", 18, 7, 26, 12),
                                 ("office", 24, 3, 30, 11), ("farm", 26, 13, 33, 18), ("garden", 34, 10, 43, 30),
                                 ("houses", 1, 19, 12, 28)]:
    for y in range(ty0, ty1 + 1):
        for x in range(tx0, tx1 + 1):
            taken.add((x, y))

for name, n in [("bush", 22), ("rock", 8), ("flowers", 26), ("tuft", 30), ("oak", 5), ("cherry", 3)]:
    k = tries = 0
    while k < n and tries < 4000:
        tries += 1
        tx, ty = rnd.randrange(W), rnd.randrange(H)
        if free(tx, ty, 1 if name in ("oak", "cherry") else 0):
            prop(name, tx, ty, rnd.randrange(-4, 5), rnd.randrange(-3, 3))
            taken.add((tx, ty))
            k += 1

# people and story spots
obj("spawn", "start", 2 * T, 17 * T + 4)
obj("spot", "notice", 15 * T + 16, 14 * T + 6)
obj("spot", "inn", 15 * T + 16, 9 * T + 10)
obj("spot", "garden", 39 * T + 16, 19 * T + 12)  # in the clearing, in front of the board
obj("spot", "exit-south", 15 * T + 16, (H - 1) * T)
obj("spot", "exit-west", 0, 17 * T)
obj("npc", "storyteller", 5 * T + 8, 12 * T + 14, folk=5, line="storyteller")
obj("npc", "zhangfei", 18 * T + 4, 15 * T + 4, who="zhangfei", line="zhangfei-wait")
obj("npc", "guanyu", 17 * T + 8, 10 * T + 6, who="guanyu", line="guanyu-wait")
obj("npc", "stargrey", 38 * T + 6, 18 * T + 12, who="stargrey", face="right")
obj("npc", "starred", 41 * T, 18 * T + 12, who="starred", face="left")
prop("gotable", 12, 18, 8, -2)                    # the old weiqi player in the square
obj("npc", "elder", 12 * T + 2, 18 * T - 2, folk=0, challenge="elder", face="down")
obj("npc", "innkeeper", 19 * T + 8, 9 * T + 6, folk=4, challenge="innkeeper")
obj("npc", "farmer", 27 * T, 24 * T + 4, folk=3, challenge="farmer")
obj("npc", "scholar", 27 * T + 8, 11 * T + 10, folk=7, challenge="scholar")
obj("npc", "folk2", 7 * T, 21 * T, folk=1, line="folk2", wander=1)
obj("npc", "folk5", 20 * T, 26 * T, folk=6, line="folk5", wander=1)

tmj = {
    "type": "map", "version": "1.10", "tiledversion": "1.10.2", "orientation": "orthogonal", "renderorder": "right-down",
    "width": W, "height": H, "tilewidth": T, "tileheight": T, "infinite": False,
    "nextlayerid": 3, "nextobjectid": len(objs) + 1,
    "tilesets": [{"firstgid": 1, "name": "ground", "image": "../assets/tk/jade/tiles.png", "imagewidth": T * len(TILES),
                  "imageheight": T, "tilewidth": T, "tileheight": T, "tilecount": len(TILES), "columns": len(TILES),
                  "margin": 0, "spacing": 0}],
    "layers": [
        {"id": 1, "name": "ground", "type": "tilelayer", "width": W, "height": H, "x": 0, "y": 0, "opacity": 1,
         "visible": True, "data": [v for row in g for v in row]},
        {"id": 2, "name": "objects", "type": "objectgroup", "draworder": "topdown", "x": 0, "y": 0, "opacity": 1,
         "visible": True, "objects": objs},
    ],
}
out = ROOT / "data/tk_town_zhuo.json"
out.write_text(json.dumps(tmj, separators=(",", ":")))
print(f"{out.relative_to(ROOT)}: {W}x{H} tiles, {len(objs)} objects")
