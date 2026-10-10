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


def banner_white():   # a white mourning banner: Jade's red banner, bleached (the folds a pale grey)
    kit = json.loads((ROOT / "assets/tk/kits/jade.json").read_text())
    sheet, x, y, w, h = kit["kinds"]["banner.red"][0]
    im = Image.open(ROOT / kit["sheets"][sheet]).convert("RGBA").crop((x, y, x + w, y + h))
    px = im.load()
    for j in range(h):
        for i in range(w):
            r, g, b, a = px[i, j]
            if a and r > g + 40 and r > b + 40:
                v = (r + g + b) // 3
                px[i, j] = (min(255, 170 + v // 2), min(255, 170 + v // 2), min(255, 176 + v // 2), a)
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


def cliff(v):   # broken rock: chunky boulders and slabs, lit on their upper left, shadowed lower right, dark cracks
    # between (the old layered bands read as paving from above; Places' note). Wraps at the tile's edges.
    import random
    r = random.Random(23 + v * 7)
    W = 16
    g = Grid(W, W)
    g.rect(0, 0, W, W, "#2a221c")                                           # the cracks show through
    rocks = [(r.uniform(0, W), r.uniform(0, W), r.uniform(3, 5.5), r.uniform(2.5, 4)) for _ in range(9)]
    for cx, cy, rx, ry in sorted(rocks, key=lambda t: t[1]):
        tone = r.choice(((112, 98, 82), (96, 84, 70), (124, 110, 92)))
        for ox in (-W, 0, W):
            for oy in (-W, 0, W):
                for y in range(W):
                    for x in range(W):
                        dx, dy = (x + .5 - cx - ox) / rx, (y + .5 - cy - oy) / ry
                        d = dx * dx + dy * dy
                        if d <= 1:
                            k = 1.25 if dx + dy < -.9 else .62 if dx + dy > .7 or d > .8 else 1
                            g.set(x, y, "#%02x%02x%02x" % tuple(min(255, int(c * k)) for c in tone))
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

def floorboards(v):   # an indoor wooden floor: warm boards running across, a dark seam between rows, staggered butt
    # joints and a little grain (the Ninja pack's indoor sheet has no boards: its "wood" was brick)
    g = Grid(16, 16)
    tones = ("#9a6a3a", "#a8784a", "#8e6034", "#a27040")
    for i, y in enumerate(range(0, 16, 4)):
        g.rect(0, y, 16, 3, tones[(i + v) % 4]); g.rect(0, y, 16, 1, "#b8885a")
        g.rect(0, y + 3, 16, 1, "#5a3a1e")                                   # the seam
        j = (3 + 7 * i + 5 * v) % 16
        g.rect(j, y, 1, 3, "#5a3a1e")                                        # a butt joint
        g.set((j + 8) % 16, y + 1, "#7a5228"); g.set((j + 9) % 16, y + 1, "#7a5228")   # grain
    return g.image()


def stoneflags(v):   # an indoor stone floor: square grey flags, lit on their upper-left edges, dark joints
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, "#4a4a50")                                          # the joints
    for x0, y0 in ((0, 0), (8, 0), (0, 8), (8, 8)):
        tone = ("#9a9a96", "#8e8e8a", "#a4a29c", "#929088")[(x0 // 8 + y0 // 8 * 2 + v) % 4]
        g.rect(x0, y0, 7, 7, tone); g.rect(x0, y0, 7, 1, "#b8b6b0"); g.rect(x0, y0, 1, 7, "#b0aea8")
        g.rect(x0 + 6, y0 + 1, 1, 6, "#76746e"); g.rect(x0 + 1, y0 + 6, 6, 1, "#76746e")
    if v:
        g.set(3, 11, "#76746e"); g.set(12, 3, "#76746e")                     # a worn chip or two
    return g.image()


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
    # new rows go last: compiled maps point at tiles by their place on this sheet
    "wood": [floorboards(0), floorboards(1)],
    "stone": [stoneflags(0), stoneflags(1)],
}


def rockery():   # a garden rockery: tall pierced grey Taihu stones, moss at the foot
    g = Grid(32, 40)
    g.ellipse(16, 22, 9, 17, "#8a8e94"); g.ellipse(9, 30, 6, 9, "#9a9ea6"); g.ellipse(23, 31, 6, 8, "#7a7e86")
    g.ellipse(13, 18, 4, 9, "#aab0b6")
    for cx, cy, r in ((15, 12, 2.2), (19, 22, 2.6), (10, 28, 1.8), (23, 31, 1.6), (14, 32, 1.4)):
        g.clear_ellipse(cx, cy, r, r * 1.2)   # the holes
    g.rect(4, 37, 24, 2, "#4a7a3a"); g.rect(8, 36, 4, 1, "#5a9a4a"); g.rect(20, 36, 5, 1, "#5a9a4a")
    return g.outline().image()


def ridge():   # an earthen ridge: a long low mound of bare yellow earth, grass along its crest
    g = Grid(96, 34)
    g.ellipse(48, 22, 46, 11, "#c8a060"); g.ellipse(48, 25, 44, 8, "#b08448"); g.ellipse(44, 18, 34, 5, "#d8b878")
    for x in range(10, 86, 3):
        y = 12 + abs(x - 48) // 7
        g.set(x, y, "#5a9a40"); g.set(x + 1, y - 1, "#4a8a36")
    return g.outline().image()


def jailcell():   # a county jail cell (牢房) against a high wall: black inside, thick iron-bound timber bars, a barred door with a lock
    g = Grid(64, 44)
    g.rect(0, 0, 64, 8, "#8a7a62"); g.rect(0, 0, 64, 2, "#a8987a"); g.rect(0, 7, 64, 1, "#5a4a3a")   # the wall's top
    g.rect(0, 8, 64, 32, "#14100e"); g.rect(2, 30, 60, 10, "#1e1812")                                  # the dark inside
    for x in range(4, 60, 7):                                                                          # straw on the floor
        g.set(x, 36, "#6a5a2a"); g.set(x + 2, 37, "#7a6a32"); g.set(x + 1, 38, "#5a4a22")
    g.rect(0, 8, 64, 3, "#3a2a1c"); g.rect(0, 9, 64, 1, "#5a4a3a")                                     # the lintel beam
    g.rect(0, 38, 64, 4, "#3a2a1c"); g.rect(0, 38, 64, 1, "#5a4a3a")                                   # the sill beam
    for x in list(range(1, 64, 7)):                                                                    # the bars: thick dark timber, the black cell between
        g.rect(x, 11, 3, 27, "#4a3626"); g.rect(x, 11, 1, 27, "#7a5c40")
        for y in (15, 30):
            g.rect(x, y, 3, 1, "#6a6a72")                                                              # iron bands
    g.rect(42, 23, 15, 2, "#4a3626")                                                                   # the door's cross-bar
    g.rect(52, 22, 4, 5, "#8a8a92"); g.rect(53, 25, 2, 1, "#2a2a30"); g.set(53, 21, "#8a8a92"); g.set(54, 20, "#8a8a92")   # the iron lock
    g.rect(0, 42, 64, 2, "#4a3a2a")
    return g.outline().image()


def torch():   # a burning torch on a wooden pole, about head height
    g = Grid(10, 30)
    g.rect(4, 9, 2, 19, "#6a4a2a"); g.rect(4, 9, 1, 19, "#8a6a3a"); g.rect(2, 27, 6, 2, "#4a3a2a")   # the pole and its foot
    g.rect(3, 7, 4, 3, "#3a2a1c"); g.rect(3, 8, 4, 1, "#8a8a92")                                       # the bound head
    g.ellipse(5, 4, 3, 3.6, "#e8661e"); g.ellipse(5, 4.6, 2, 2.4, "#ffb23a"); g.rect(4, 4, 2, 2, "#fff0a0")   # the flame
    g.set(5, 0, "#ff8a2a")
    return g.outline().image()


def wallstairs():   # rammed-earth steps (马道) climbing the inside face of a city wall to the wall-walk, rising left to right
    g = Grid(64, 34)
    g.rect(0, 0, 64, 34, "#a8885a"); g.rect(0, 0, 64, 2, "#c8a878")                                   # the wall face behind
    for y in range(6, 34, 6):
        g.rect(0, y, 64, 1, "#94744a")                                                                 # rammed-earth layers
    for i in range(8):                                                                                 # eight steps
        x, top = i * 8, 30 - i * 4
        g.rect(x, top, 64 - x, 34 - top, "#8a6a42"); g.rect(x, top, 64 - x, 1, "#c8a878"); g.rect(x, top + 1, 64 - x, 1, "#b09060")
    g.rect(0, 0, 2, 34, "#6a4a2a")
    return g.outline().image()


def _prop(name, scale=1):   # a cutscene prop from assets/tk/props.png, as a map piece
    meta = json.loads((ROOT / "assets/tk/props.json").read_text())
    x, y, w, h = meta["frames"][name]
    im = Image.open(ROOT / meta["image"]).convert("RGBA").crop((x, y, x + w, y + h))
    return im.resize((w * scale, h * scale), Image.NEAREST) if scale != 1 else im


def halberd():   # Lü Bu's sky-piercer halberd planted upright (the cutscene prop's art)
    return _prop("halberd")


def bridal_carriage():   # a covered Han carriage hung with red silk (the cutscene prop's art, at map size)
    return _prop("carriage", 2)


def gateshut():   # a city gate drawn shut across the gap in a west or east wall (32x64): two heavy studded timber
    # leaves meeting in the middle, iron bands, and a great beam barring them, the passage running across
    g = Grid(32, 64)
    for y0 in (0, 32):                                                       # the two leaves
        g.rect(1, y0 + 1, 30, 30, "#6a3a22"); g.rect(1, y0 + 1, 30, 2, "#8a5232"); g.rect(1, y0 + 29, 30, 2, "#4a2614")
        for x in range(5, 30, 6):
            g.rect(x, y0 + 3, 1, 26, "#5a301c")                              # planks
        for y in (y0 + 7, y0 + 24):
            g.rect(1, y, 30, 2, "#3a3a42")                                   # iron bands
        for yy in (y0 + 12, y0 + 16, y0 + 20):
            for x in range(4, 30, 5):
                g.set(x, yy, "#d8b050"); g.set(x, yy + 1, "#7a5a22")         # gilt studs
    g.rect(1, 31, 30, 2, "#2a160c")                                          # the seam where they meet
    g.rect(13, 0, 6, 64, "#4a2a18"); g.rect(13, 0, 2, 64, "#7a4a2a")         # the bar across both leaves
    for y in (10, 30, 50):
        g.rect(11, y, 10, 3, "#3a3a42")                                      # its iron brackets
    return g.outline().image()


def gateshut_ns():   # the same shut gate for a north or south wall's gap (64x32), the passage running north-south
    return gateshut().transpose(Image.Transpose.ROTATE_90)


def _plume(im, cx, base, top, rnd, width=7):   # billowing smoke: puffs widening and drifting as they rise, lighter grey at the rims
    p = im.load(); W, H = im.size
    for _ in range(60):
        t = rnd.random(); y = int(base - t * (base - top)); r = int(2 + t * width * .6 + rnd.random() * 2)
        x = int(cx + (rnd.random() - .5) * (2 + t * width) + t * 4)
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                d = dx * dx + dy * dy
                if d <= r * r and 0 <= x + dx < W and 0 <= y + dy < H:
                    rim = d > (r - 1) ** 2
                    v = (62 if rim else 34) + int(t * 26) + (dy < 0) * 8
                    if p[x + dx, y + dy][3] == 0 or not rim:
                        p[x + dx, y + dy] = (v, v - 4, v - 2, 215)


def burning_house():   # Jade's own house, on fire: walls scorched, a hole burnt through the roof with a beam fallen
    # in, flames out of the windows and the roof, black smoke rising (for a city sacked at night)
    import random
    kit = json.loads((ROOT / "assets/tk/kits/jade.json").read_text())
    sheet, x, y, w, h = kit["kinds"]["building.house"][0]
    house = Image.open(ROOT / kit["sheets"][sheet]).convert("RGBA").crop((x, y, x + w, y + h))
    W, H, top = w + 8, h + 22, 22                                   # room above for the flames and smoke
    im = Image.new("RGBA", (W, H)); im.alpha_composite(house, (4, top))
    px = im.load(); rnd = random.Random(7)
    for j in range(H):                                              # scorch: everything darker, redder toward the top
        for i in range(W):
            r, g, b, a = px[i, j]
            if a:
                k = .55 + .25 * (j - top) / h
                px[i, j] = (int(min(255, r * k + 18)), int(g * k * .8), int(b * k * .6), a)
    g = Grid(W, H)
    hx, hy = W // 2 - 6, top + 6                                    # the hole in the roof, a charred beam across it
    g.ellipse(hx + 6, hy + 4, 9, 5, "#1a0e08"); g.ellipse(hx + 6, hy + 4, 6, 3, "#3a1a0c")
    for t in range(16):
        g.set(hx - 2 + t, hy + 1 + t // 3, "#2a1a10")
    def flame(cx, base, ht, wd):                                    # a tongue of flame: red, orange, yellow core
        for k2, col in ((1.0, "#c8321a"), (.72, "#f07a1e"), (.42, "#ffd24a")):
            hh, ww = ht * k2, wd * k2
            for dy in range(int(hh)):
                half = ww * (1 - dy / hh) ** .7
                for dx in range(-int(half), int(half) + 1):
                    g.set(int(cx + dx + (rnd.random() - .5) * (dy / hh) * 2), base - dy, col)
    flame(hx + 6, hy + 6, 22, 8); flame(hx - 6, top + 14, 14, 5); flame(hx + 18, top + 12, 16, 5)
    for wx in (12, W - 16):                                         # flames licking out of the windows
        flame(wx, top + h - 10, 11, 4)
    sm = Image.new("RGBA", (W, H)); _plume(sm, hx + 6, top + 4, 0, rnd, 9)      # black smoke above the fire
    im.alpha_composite(sm); im.alpha_composite(g.image())
    return im


def smoke_column():   # a column of black smoke, about 1x3 tiles, to stand over fires
    import random
    im = Image.new("RGBA", (16, 48)); _plume(im, 6, 46, 2, random.Random(3), 6)
    return im

def redhang():   # wedding hangings for a house front (红绸/喜字): a red silk swag across with a big rosette, its tails
    # hanging down each side, and a red paper 囍 under it (the loud town, Lady Sun's book)
    g = Grid(48, 26)
    red, redD, redL, gold = "#d0242c", "#8e1420", "#f05a5a", "#f2cc5a"
    import math
    for x in range(48):                                                    # the swag: two loops drooping between three knots
        y = 2 + round(4 * math.sin(math.pi * (x % 24) / 24))
        g.rect(x, y, 1, 3, red); g.set(x, y, redL); g.set(x, y + 2, redD)
    for x in (0, 47):
        g.rect(x - (x > 0), 4, 2, 16, red); g.rect(x, 4, 1, 16, redD)          # the tails at the ends
        g.rect(x - (x > 0), 19, 2, 2, gold)
    g.ellipse(24, 5, 5, 4, red); g.ellipse(24, 5, 3, 2.5, redL); g.ellipse(24, 5, 1.2, 1.2, gold)   # the rosette
    g.rect(22, 9, 1, 5, red); g.rect(26, 9, 1, 5, red)                       # its ribbons
    g.rect(18, 13, 12, 12, red); g.rect(18, 13, 12, 1, redL); g.rect(18, 24, 12, 1, redD)   # the 囍 paper
    for x0 in (19, 24):                                                      # 囍: two 喜 side by side, in gold
        g.rect(x0 + 1, 15, 3, 1, gold); g.rect(x0 + 2, 14, 1, 1, gold)
        g.rect(x0, 17, 5, 1, gold); g.rect(x0 + 1, 18, 3, 2, gold); g.set(x0 + 2, 19, red)
        g.rect(x0, 21, 5, 1, gold); g.rect(x0 + 1, 22, 3, 1, gold)
    return g.outline().image()


def riverboat():   # a Han river boat moored at a timber jetty: planked hull, a curved mat cabin roof, oars shipped,
    # water lapping round it (Nanxu's dock)
    g = Grid(64, 40)
    g.rect(0, 22, 64, 18, "#3a6a8a"); g.rect(0, 22, 64, 1, "#5a8aaa")      # the water
    for x, y in ((4, 30), (20, 35), (44, 31), (56, 37), (30, 27)):
        g.rect(x, y, 5, 1, "#7aaacc")
    g.rect(44, 14, 20, 6, "#8a6a42"); g.rect(44, 14, 20, 1, "#a8885a")      # the jetty planks
    for x in range(46, 64, 4):
        g.rect(x, 14, 1, 6, "#6a4a2a")
    for x in (46, 60):
        g.rect(x, 20, 2, 12, "#5a3a1e")                                      # its piles
    g.ellipse(26, 26, 24, 6, "#6a3e1e"); g.rect(4, 20, 44, 6, "#7a4a24")     # the hull
    g.rect(4, 20, 44, 1, "#a06a3a"); g.rect(2, 19, 4, 2, "#7a4a24"); g.rect(46, 18, 5, 3, "#7a4a24")   # bow, stern
    g.ellipse(24, 15, 11, 6, "#c8b078"); g.rect(13, 15, 23, 5, "#c8b078")   # the mat cabin roof
    for x in range(14, 36, 3):
        g.rect(x, 10, 1, 10, "#a08a58")                                      # its mat ribs
    g.rect(13, 19, 23, 1, "#8a7448")
    for x0 in (8, 40):
        d = -1 if x0 < 20 else 1
        for t in range(10):
            g.set(x0 + d * (t * 7 // 9), 21 + t, "#9a7a4a")                  # oars shipped, blades in the water
    return g.outline().image()


def target():   # an archery butt: red and white rings on a straw boss, on a wooden stand
    g = Grid(16, 24)
    g.rect(3, 14, 2, 10, "#6a4a2a"); g.rect(11, 14, 2, 10, "#6a4a2a"); g.rect(2, 22, 12, 2, "#5a3a1e")
    for r, c in ((7, "#d8c890"), (6, "#c8283c"), (4.5, "#f4f0e8"), (3, "#c8283c"), (1.5, "#f4f0e8")):
        g.ellipse(8, 9, r, r, c)
    g.set(8, 9, "#c8283c")
    return g.outline().image()


def incense():   # a temple's bronze incense burner (香炉) on three legs, two handles, smoke curling up
    g = Grid(32, 36)
    bronze, bronzeD, bronzeL = "#8a6a2a", "#5a4218", "#b8923e"
    for x in (6, 15, 24):
        g.rect(x, 30, 3, 6, bronzeD)                                         # the three legs
    g.ellipse(16, 26, 13, 7, bronze); g.ellipse(14, 24, 8, 3, bronzeL)       # the bowl
    g.rect(3, 19, 26, 3, bronzeD); g.rect(3, 19, 26, 1, bronzeL)             # its rim
    for x in (2, 27):
        g.rect(x, 14, 3, 6, bronze); g.rect(x, 14, 3, 1, bronzeL)            # the upright handles
    for x in (11, 15, 19):
        g.rect(x, 12, 1, 7, "#c8392c"); g.set(x, 11, "#ffb23a")              # incense sticks, glowing tips
    im = g.outline().image(); px = im.load()                                 # the smoke, curling, over the outline (soft)
    import math
    for x0 in (11, 15, 19):
        for i in range(11):
            x, y = x0 + round(1.6 * math.sin(i / 2.2 + x0)), 10 - i
            px[x, y] = (210, 210, 220, 200 - i * 14)
    return im


PIECES = {
    "banner.black": banner_black, "banner.white": banner_white, "milestone": milestone, "plant.peony": peony, "water.lotus": lotus,
    "prop.lanterns": lantern_stand, "prop.body_lamp": body_lamp, "tree.poplar": poplar, "tree.willow": willow,
    "garden.trellis": trellis, "garden.screenwall": screenwall, "furn.qin": qin, "furn.window": window,
    "furn.swordwall": swordwall, "furn.seat": seat, "furn.lamp": lamp, "furn.dais": dais, "corral": corral,
    "landmark.hitchingpost": hitchingpost, "garden.rockery": rockery, "landmark.ridge": ridge,
    "furn.jailcell": jailcell, "landmark.torch": torch, "wall.stairs": wallstairs, "prop.halberd": halberd,
    "prop.carriage": bridal_carriage, "prop.gateshut": gateshut, "prop.gateshut_ns": gateshut_ns, "ruin.burning": burning_house, "fx.smoke": smoke_column, "deco.redhang": redhang, "prop.boat": riverboat, "prop.target": target,
    "landmark.incense": incense,
}


# the kits' indoor floors drawn here win over the pack's tiles (the pack's "wood" was brick, its "stone" cobbles)
OWN_FLOORS = ("wood", "stone")


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
            if mat not in kit["materials"] or "drawn_b2_tiles" in str(kit["materials"][mat]) or mat in OWN_FLOORS:
                kit["materials"][mat] = {"tiles": tiles}
        for style in kit.get("room_styles", {}).values():   # a room's own floor: wood is boards, stone is flags
            for mat in OWN_FLOORS:
                if mat in style:
                    style[mat] = {"tiles": tpos[mat]}
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
