"""Draw the new Book 2's smaller map pieces, in Jade's outlined pixel style (tools/draw_tk_extras.Grid).

    python3 tools/draw_b2_extras.py     # -> assets/tk/drawn_b2.png and the kinds in every kit

Places' plan grids (tools/tk_plans_w2.py) use kinds no pack has: peonies and lotus, poplars and willows,
lanterns, milestones, a black banner, a trellis and a spirit screen, and the room furniture of the
Diaochan arc. Each is drawn here once and added to jade, xianxia and genshin as sheet "drawn_b2"
(a kit's own art for a kind wins: only kinds a kit lacks, or draws by a stand-in, are set).
python3 tools/mapfactory/plans.py --world 2 --assets FILE lists what is still missing.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from draw_tk_extras import Grid  # noqa: E402

KITS = ("jade", "xianxia", "genshin")


def banner_black():   # the Chancellor's black banner: Jade's red banner, dyed
    kit = json.loads((ROOT / "assets/tk/kits/jade.json").read_text())
    sheet, x, y, w, h = kit["kinds"]["banner.red"][0]
    im = Image.open(ROOT / kit["sheets"][sheet]).convert("RGBA").crop((x, y, x + w, y + h))
    px = im.load()
    for j in range(h):
        for i in range(w):
            r, g, b, a = px[i, j]
            if a and r > g + 40 and r > b + 40:          # the red cloth -> black, its light folds dark grey
                v = (r + g + b) // 3
                px[i, j] = (24 + v // 6, 22 + v // 6, 28 + v // 6, a)
    return im


def milestone():   # a small stone road marker with a rounded top and a carved line
    g = Grid(12, 16)
    g.rect(2, 4, 8, 10, "#9a9ea6"); g.rect(3, 2, 6, 2, "#9a9ea6"); g.rect(8, 4, 2, 10, "#7a7e86")
    g.rect(5, 5, 2, 6, "#6a6e76"); g.rect(1, 14, 10, 2, "#6a6450")
    return g.outline().image()


def peony():   # a bed of peonies: dark leaves, big pink and red blooms
    g = Grid(16, 14)
    g.ellipse(8, 9, 7.5, 4.5, "#3e7a3a"); g.ellipse(8, 10, 6, 3, "#2e5e2c")
    for cx, cy, c, l in ((4, 6, "#e8708a", "#f8b0c0"), (11, 5, "#c8283c", "#f07080"), (8, 9, "#f0a0b8", "#fcd8e0")):
        g.ellipse(cx, cy, 2.6, 2.3, c); g.set(cx - 1, cy - 1, l); g.set(cx, cy, "#f6d860")
    return g.outline().image()


def lotus():   # lotus leaves and a flower floating on water (drawn over the water tile)
    g = Grid(16, 16)
    g.ellipse(5, 10, 4, 3, "#4a9a4a"); g.set(5, 10, "#2e6e2e"); g.rect(5, 8, 1, 2, "#2e6e2e")
    g.ellipse(12, 12, 3, 2.2, "#5aaa5a"); g.ellipse(11, 5, 3, 2.2, "#4a9a4a")
    g.ellipse(10, 9, 2.2, 1.6, "#f0a8c0"); g.rect(9, 7, 3, 2, "#f8c8d8"); g.set(10, 6, "#fce0ea")
    return g.outline().image()


def lantern_stand():   # a red paper lantern hung on a wooden stand
    g = Grid(14, 30)
    g.rect(6, 4, 2, 24, "#7a4a22"); g.rect(3, 4, 8, 1, "#7a4a22"); g.rect(4, 27, 6, 2, "#5a3418")
    g.rect(3, 5, 1, 2, "#e6c14a")
    g.ellipse(3.5, 11, 3.2, 4, "#d8382c"); g.rect(1, 10, 6, 1, "#a82a22"); g.rect(2, 7, 3, 1, "#e6c14a"); g.rect(2, 15, 3, 1, "#e6c14a")
    g.set(3, 9, "#ff9a6a"); g.set(2, 11, "#ff9a6a")
    return g.outline().image()


def body_lamp():   # a dark covered mound in the street, a small flame on it
    g = Grid(22, 14)
    g.ellipse(11, 9, 10, 4.5, "#2a2630"); g.ellipse(9, 8, 6, 2.5, "#3a3440")
    g.rect(11, 2, 1, 3, "#ffd84a"); g.set(11, 1, "#fff2a0"); g.rect(10, 5, 3, 1, "#8a6a32")
    return g.outline().image()


def poplar():   # a tall slender poplar
    g = Grid(14, 42)
    g.rect(6, 32, 2, 9, "#6a4a2a")
    g.ellipse(7, 18, 5.5, 16, "#4a8a3a"); g.ellipse(5.5, 16, 3, 13, "#5aa048"); g.ellipse(9, 22, 2.5, 11, "#3a7030")
    for y in range(6, 32, 5):
        g.set(4 + (y % 3), y, "#78c060")
    return g.outline().image()


def willow():   # a weeping willow: a crooked trunk and long drooping strands
    g = Grid(34, 38)
    g.rect(15, 18, 4, 19, "#6a4a2a"); g.rect(18, 18, 1, 19, "#4a3018"); g.set(14, 30, "#6a4a2a")
    g.ellipse(17, 10, 14, 9, "#5a9a40"); g.ellipse(15, 8, 9, 6, "#6aac4a")
    for i, x in enumerate(range(4, 31, 2)):
        top = 10 + abs(17 - x) // 3
        for y in range(top, top + 14 + (i % 3) * 4):
            g.set(x, y, "#4a8a36" if (x + y) % 3 else "#6aac4a")
    return g.outline().image()


def trellis():   # the 荼蘼 trellis: a wooden arch over the path, white flowers on green vines
    g = Grid(64, 30)
    wood = "#8a5a2a"
    for x in (2, 60):
        g.rect(x, 6, 2, 23, wood)
    g.rect(1, 4, 62, 2, wood); g.rect(1, 6, 62, 1, "#5a3a1a")
    for x in range(4, 60, 6):
        g.rect(x, 2, 1, 3, wood)
    for x in range(0, 64, 3):
        g.rect(x, 1 + (x % 2), 3, 3, "#3e7a3a")
    for x in (0, 1, 2, 60, 61, 62, 63):
        for y in range(7, 26, 3):
            g.set(x, y + (x % 2), "#3e7a3a")
    for x, y in ((3, 2), (9, 1), (15, 3), (22, 2), (29, 1), (35, 3), (42, 2), (49, 1), (55, 3), (61, 2), (1, 10), (62, 14), (1, 19)):
        g.rect(x, y, 2, 2, "#f8f4ec"); g.set(x, y, "#ffffff")
    return g.outline().image()


def screenwall():   # a spirit screen (影壁): a free-standing wall with tiled coping and a carved panel
    g = Grid(64, 30)
    g.rect(2, 22, 60, 7, "#8a8e94"); g.rect(2, 28, 60, 1, "#5e636b")                 # the plinth
    g.rect(4, 7, 56, 15, "#d8d2c4"); g.rect(56, 7, 4, 15, "#b8b2a4")                  # the plastered face
    g.rect(0, 3, 64, 3, "#3e4350"); g.rect(2, 1, 60, 2, "#3e4350"); g.rect(1, 6, 62, 1, "#2a2e38")   # the tiled coping
    g.rect(22, 9, 20, 11, "#9a8a6a"); g.rect(23, 10, 18, 9, "#c8b890")                # the carved panel
    g.ellipse(32, 14.5, 5, 3.5, "#9a8a6a", ring=.5)
    return g.outline().image()


def qin():   # a guqin on its low stand (Cai Yong's: its tail scorched)
    g = Grid(34, 12)
    g.rect(1, 3, 32, 4, "#3a2018"); g.rect(1, 3, 32, 1, "#5a3020"); g.rect(28, 3, 5, 4, "#1a1010")   # the board, the burnt tail
    for y in (4, 5):
        g.rect(3, y, 28, 1, "#d8c890")                                                # strings
    g.rect(3, 7, 2, 4, "#6a4a2a"); g.rect(29, 7, 2, 4, "#6a4a2a"); g.rect(3, 10, 28, 1, "#6a4a2a")   # the stand
    return g.outline().image()


def window():   # a latticed window in a wall
    g = Grid(16, 18)
    g.rect(1, 1, 14, 16, "#7a4a22"); g.rect(3, 3, 10, 12, "#e8dcb8")
    for x in (5, 8, 11):
        g.rect(x, 3, 1, 12, "#7a4a22")
    for y in (6, 9, 12):
        g.rect(3, y, 10, 1, "#7a4a22")
    return g.outline().image()


def swordwall():   # a sword in its scabbard hanging on a wall rack
    g = Grid(16, 24)
    g.rect(2, 3, 12, 2, "#7a4a22"); g.rect(3, 1, 1, 3, "#5a3418"); g.rect(12, 1, 1, 3, "#5a3418")
    g.rect(7, 5, 2, 15, "#3a2a22"); g.rect(7, 5, 2, 1, "#e6c14a"); g.rect(5, 4, 6, 1, "#c8a03a")   # scabbard, guard
    g.rect(7, 1, 2, 3, "#6a4a2a"); g.rect(7, 20, 2, 2, "#c8a03a"); g.rect(9, 6, 1, 6, "#c8283c")    # hilt, chape, tassel
    return g.outline().image()


def seat():   # a floor cushion with a low armrest
    g = Grid(16, 12)
    g.ellipse(8, 8, 7, 3.5, "#a83a32"); g.ellipse(7, 7, 5, 2, "#c84a40"); g.rect(10, 2, 5, 2, "#6a4a2a"); g.rect(11, 4, 1, 4, "#6a4a2a"); g.rect(14, 4, 1, 4, "#6a4a2a")
    return g.outline().image()


def lamp():   # a bronze standing lamp, lit
    g = Grid(12, 26)
    g.rect(5, 6, 2, 17, "#8a6a32"); g.rect(3, 22, 6, 2, "#6a4a22"); g.ellipse(6, 5.5, 4, 1.8, "#b08a42")
    g.rect(5, 1, 2, 3, "#ffc84a"); g.set(5, 0, "#fff2a0"); g.set(6, 2, "#ff8a2a")
    return g.outline().image()


def dais():   # a raised dais: a low platform, a seat and armrest, a screen behind
    g = Grid(48, 34)
    g.rect(2, 2, 44, 14, "#7a2a22"); g.rect(4, 4, 40, 10, "#a83a32")                 # the screen
    for x in range(8, 44, 8):
        g.rect(x, 4, 1, 10, "#c8a03a")
    g.rect(0, 16, 48, 14, "#6a4a2a"); g.rect(0, 16, 48, 2, "#8a6a3a"); g.rect(0, 29, 48, 2, "#3a2418")   # the platform
    g.rect(16, 18, 16, 6, "#c84a40"); g.rect(16, 18, 16, 1, "#e06a5a"); g.rect(30, 14, 3, 6, "#3a2418")  # the seat, armrest
    for x in (12, 22, 32):
        g.rect(x, 26, 4, 1, "#3a2418")                                                 # the steps' edge
    return g.outline().image()


def corral():   # a wooden-railed corral (horses are added by the scene)
    W, H = 128, 96
    g = Grid(W, H)
    wood, woodD = "#8a5a2a", "#5a3a1a"
    for y in (10, 18):
        g.rect(2, y, W - 4, 2, wood); g.rect(2, H - 20 + (y - 10), W - 4, 2, wood)
    for x in (2, W - 4):
        g.rect(x, 10, 2, H - 10, woodD)
    for x in range(2, W, 14):
        g.rect(x, 6, 2, 16, woodD); g.rect(x, H - 24, 2, 16, woodD)
    for y in range(10, H - 8, 14):
        g.rect(0, y, 6, 2, wood); g.rect(W - 6, y, 6, 2, wood)
    g.rect(52, 40, 24, 6, "#7a5a3a"); g.rect(54, 41, 20, 3, "#5a8ac8")               # a water trough
    g.rect(20, 50, 14, 8, "#d8b867"); g.rect(22, 48, 10, 2, "#e8c877")               # hay
    return g.outline().image()


def hitchingpost():   # a wooden hitching post with an iron ring
    g = Grid(12, 24)
    g.rect(5, 3, 3, 19, "#7a4a22"); g.rect(4, 1, 5, 2, "#5a3418"); g.rect(3, 21, 7, 2, "#5a3418")
    g.ellipse(9.5, 9, 2.2, 2.2, "#4a4a52", ring=.35)
    return g.outline().image()


# ---- ground tiles (16 x 16, two variants each) for the plan grids' grounds ----
def _tile(base, specks, seed, rows=None):
    import random
    r = random.Random(seed)
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, base)
    for col, n in specks:
        for _ in range(n):
            g.set(r.randrange(16), r.randrange(16), col)
    if rows:
        for y, col in rows:
            g.rect(0, y, 16, 1, col)
    return g.image()


def wheat(v):   # wheat in rows: gold stalks, darker furrows
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, "#d8b048")
    for y in (3, 7, 11, 15):
        g.rect(0, y, 16, 1, "#9a7428")
    for x in range(v, 16, 3):
        for y in (1, 5, 9, 13):
            g.set(x, y, "#f2d27a"); g.set(x, y + 1, "#c89a38")
    return g.image()


def cliff(v):   # a loess cliff face: layered ochre bands, cracks
    g = Grid(16, 16)
    for y, c in ((0, "#c89a58"), (4, "#b08448"), (8, "#c89a58"), (12, "#a07038")):
        g.rect(0, y, 16, 4, c)
    for y in (3, 7, 11, 15):
        g.rect(0, y, 16, 1, "#7a5228")
    for x, y in ((3 + v, 1), (11 - v, 5), (6, 9), (13, 13)):
        g.rect(x, y, 1, 2, "#6a4420")
    return g.image()


def plateau(v):   # the raised terrace: dressed pale stone in courses
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, "#d8d2c4")
    for y in (0, 8):
        g.rect(0, y, 16, 1, "#a8a294")
    for x in ((0, 8) if v else (4, 12)):
        g.rect(x, 1, 1, 7, "#a8a294")
    for x in ((4, 12) if v else (0, 8)):
        g.rect(x, 9, 1, 7, "#a8a294")
    return g.image()


def citywall(v):   # the top of a rammed-earth city wall: packed earth in layers, a walkway edge
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, "#b8946a")
    for y in (2, 6, 10, 14):
        g.rect(0, y, 16, 1, "#9a7650")
    g.rect(0, 0, 16, 1, "#7a5a38")
    for x in range(v * 4, 16, 8):
        g.rect(x, 1, 4, 1, "#d8b88a")
    return g.image()


def planks(v, pillar=False):   # gallery or bridge boards; a gallery has red pillars at its edges
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, "#a8743a")
    for y in (3, 7, 11, 15):
        g.rect(0, y, 16, 1, "#7a4e22")
    for y, x in ((1, 5 + v), (5, 11 - v), (9, 3 + v), (13, 9)):
        g.set(x, y, "#c8945a")
    if pillar:
        g.rect(0, 6, 2, 4, "#b8302a"); g.rect(14, 6, 2, 4, "#b8302a")
    return g.image()


SAME = {"court": "stone", "ward": "stone", "passage": "stone", "road": "dirt", "path": "sand", "camp": "dirt",
        "city": "dirt", "field": "grass", "plain": "grass", "garden": "grass", "stage": "wood", "curtain": "wood"}

TILES = {
    "field.wheat": [wheat(0), wheat(1)],
    "cliff": [cliff(0), cliff(1)],
    "plateau": [plateau(0), plateau(1)],
    "wall.city": [citywall(0), citywall(1)],
    "gallery": [planks(0, True), planks(1, True)],
    "bridge": [planks(0), planks(1)],
    "hills": [_tile("#4a8a3a", (("#3a7030", 18), ("#6a9a3a", 10), ("#8a7a4a", 5)), 1),
              _tile("#4a8a3a", (("#3a7030", 18), ("#6a9a3a", 10), ("#8a7a4a", 5)), 2)],
    "loess": [_tile("#d8b878", (("#c8a060", 20), ("#e8cc90", 12)), 3),
              _tile("#d8b878", (("#c8a060", 20), ("#e8cc90", 12)), 4)],
    "market": [_tile("#c8a878", (("#b08a58", 18), ("#e0c890", 8), ("#d8c050", 4)), 5),
               _tile("#c8a878", (("#b08a58", 18), ("#e0c890", 8), ("#d8c050", 4)), 6)],
}


PIECES = {
    "banner.black": banner_black, "milestone": milestone, "plant.peony": peony, "water.lotus": lotus,
    "prop.lanterns": lantern_stand, "prop.body_lamp": body_lamp, "tree.poplar": poplar, "tree.willow": willow,
    "garden.trellis": trellis, "garden.screenwall": screenwall, "furn.qin": qin, "furn.window": window,
    "furn.swordwall": swordwall, "furn.seat": seat, "furn.lamp": lamp, "furn.dais": dais, "corral": corral,
    "landmark.hitchingpost": hitchingpost,
}


def main():
    ims = {k: f() for k, f in PIECES.items()}
    # one row per height band, 1 px apart
    W = 256
    x = y = rowh = 0
    pos = {}
    for k, im in sorted(ims.items(), key=lambda kv: -kv[1].height):
        if x + im.width > W:
            x, y, rowh = 0, y + rowh + 1, 0
        pos[k] = [x, y, im.width, im.height]
        x += im.width + 1
        rowh = max(rowh, im.height)
    sheet = Image.new("RGBA", (W, y + rowh))
    for k, (px, py, _, _) in pos.items():
        sheet.alpha_composite(ims[k], (px, py))
    out = ROOT / "assets/tk/drawn_b2.png"
    sheet.save(out)
    # the ground tiles: a 16 px grid of their own
    tiles_out = ROOT / "assets/tk/drawn_b2_tiles.png"
    tsheet = Image.new("RGBA", (16 * 2, 16 * len(TILES)))
    tpos = {}
    for row, (mat, ims_) in enumerate(TILES.items()):
        for col, im in enumerate(ims_):
            tsheet.alpha_composite(im, (col * 16, row * 16))
        tpos[mat] = [["drawn_b2_tiles", col, row, 1] for col in range(len(ims_))]
    tsheet.save(tiles_out)
    for name in KITS:
        path = ROOT / "assets/tk/kits" / f"{name}.json"
        kit = json.loads(path.read_text())
        kit["sheets"]["drawn_b2"] = str(out.relative_to(ROOT))
        kit["sheets"]["drawn_b2_tiles"] = str(tiles_out.relative_to(ROOT))
        for mat, tiles in tpos.items():
            if mat not in kit["materials"] or "drawn_b2_tiles" in str(kit["materials"][mat]):
                kit["materials"][mat] = {"tiles": tiles}
        # grounds that are the kit's own tiles under another name: the courtyard is its flagstones, and so on
        for mat, base in SAME.items():
            if mat not in kit["materials"] and base in kit["materials"]:
                kit["materials"][mat] = {"same": base}
        for k, r in pos.items():
            mine = [v for v in kit["kinds"].get(k, []) if v[0] != "drawn_b2"]
            if not mine:   # the kit's own art wins
                kit["kinds"][k] = [["drawn_b2", *r]]
        path.write_text(json.dumps(kit, indent=1))
    print(f"{len(ims)} pieces -> {out.relative_to(ROOT)} ({sheet.width}x{sheet.height}), in {', '.join(KITS)}")


if __name__ == "__main__":
    main()
