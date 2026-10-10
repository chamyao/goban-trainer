"""The Seoul kit: Misaeng's modern Seoul (and one street in Amman), drawn in code in Jade's outlined pixel style.

    python3 tools/draw_seoul.py     # -> assets/tk/seoul/pieces.png, tiles.png and assets/tk/kits/seoul.json

seoul.json starts as a copy of jade.json (so every old kind still has art) and then overrides it:
  - the grounds and walls: pavement, asphalt, a carriageway, a zebra crossing, ID gates, a roof parapet, office tile,
    laminate, carpet, plaster walls;
  - every kind Places (Misaeng) added to vocab (KINDS.update in tools/mapfactory/vocab.py), each drawn here at its
    footprint's width and standing on its footprint's bottom edge, as the kit sprites do;
  - the townsfolk: every folk.* is drawn by the game (folk.drawn) from modern TK_CHARS looks (tk.js, ms_*).
The briefs are Places' ART in tools/tk_plans_ms.py. The kit's ?v and the maps' compile are Integration's and Places'.
"""
import copy
import json
import random
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from draw_tk_extras import Grid  # noqa: E402

OUT = ROOT / "assets/tk/seoul"
T = 16


def shade(h, f):
    n = int(h[1:], 16)
    r, g, b = n >> 16, (n >> 8) & 255, n & 255
    m = (lambda v: max(0, min(255, round(v * (1 + f))))) if f < 0 else (lambda v: max(0, min(255, round(v + (255 - v) * f))))
    return "#%02x%02x%02x" % (m(r), m(g), m(b))


def box(g, x, y, w, top_h, front_h, top, front=None, edge=True):
    """A 3/4 box: its top face (top_h px) above its front face (front_h px)."""
    front = front or shade(top, -.25)
    g.rect(x, y, w, top_h, top)
    if edge:
        g.rect(x, y, w, 1, shade(top, .2))
    g.rect(x, y + top_h, w, front_h, front)
    g.rect(x, y + top_h + front_h - 1, w, 1, shade(front, -.2))


def windows(g, x0, y0, w, h, cols, rows, frame, glass, lit=None, seed=0, gap=2):
    """A grid of windows on a façade."""
    r = random.Random(seed)
    cw, ch = (w - gap) // cols, (h - gap) // rows
    for j in range(rows):
        for i in range(cols):
            x, y = x0 + gap + i * cw, y0 + gap + j * ch
            g.rect(x, y, cw - gap, ch - gap, frame)
            g.rect(x + 1, y + 1, cw - gap - 2, ch - gap - 2, lit if lit and r.random() < .25 else glass)
            g.set(x + 1, y + 1, shade(glass, .4))


def img(g):
    return g.outline().image()


# =====================================================================================================================
# grounds: 16 px tiles, two of each
def _specks(g, cols, seed, n=14):
    r = random.Random(seed)
    for c in cols:
        for _ in range(n):
            g.set(r.randrange(16), r.randrange(16), c)


def pavement(v):   # Seoul's pavement: grey square blocks, each a shade apart; v 2 a drain grate, v 3 a yellow tactile block
    r = random.Random(100 + v)
    g = Grid(T, T)
    for by in (0, 8):
        for bx in (0, 8):
            c = r.choice(["#b4b4b0", "#aeaeaa", "#bababa", "#a8a8a4", "#b8b4ac"])
            g.rect(bx, by, 8, 8, c); g.rect(bx, by, 8, 1, shade(c, .12)); g.rect(bx, by, 1, 8, shade(c, -.1))
    _specks(g, ["#9c9c98", "#c4c4c0"], 10 + v, 6)
    if v == 2:
        g.rect(3, 5, 10, 6, "#4a4c50")
        for x in range(4, 13, 2):
            g.rect(x, 6, 1, 4, "#2a2c30")
    if v == 3:
        g.rect(0, 0, 8, 8, "#e8c030")
        for x, y in ((2, 2), (5, 2), (2, 5), (5, 5)):
            g.set(x, y, "#c89a20")
    return g.image()


def pavers(v):   # the walked street: red and grey brick pavers in a herringbone of rows
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#a86a5a")
    for y in range(0, T, 4):
        g.rect(0, y, T, 1, "#8a5448")
        off = 0 if (y // 4 + v) % 2 == 0 else 4
        for x in range(off, T, 8):
            g.rect(x, y, 1, 4, "#8a5448")
    _specks(g, ["#b87a6a", "#9a8a84"], 15 + v, 8)
    return g.image()


def asphalt(v, base="#4a4c52"):
    g = Grid(T, T)
    g.rect(0, 0, T, T, base)
    _specks(g, [shade(base, .12), shade(base, -.15)], 20 + v, 18)
    return g.image()


def crosswalk(v):   # zebra bars: broad white bands across the asphalt, running with the traffic
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#4a4c52")
    _specks(g, ["#55575d"], 30 + v, 10)
    for y in (1, 9):
        g.rect(0, y, T, 5, "#e8e8e4")
    _specks(g, ["#d0d0cc"], 31 + v, 6)
    return g.image()


def lobby(v):   # the lobby's polished stone
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#d8d4cc")
    g.rect(0, 0, T, 1, "#c4c0b8"); g.rect(0, 0, 1, T, "#c4c0b8")
    for i in range(4):
        g.set(3 + i + v * 5, 4 + i, "#ecebe6")
    return g.image()


def barrier(v):   # ID speed gates: a steel post with a glass flap, on the lobby's stone
    im = lobby(v)
    gg = Grid(T, T)
    gg.rect(1, 3, 4, 11, "#8a9098"); gg.rect(1, 3, 4, 2, "#c8ccd2"); gg.rect(2, 6, 2, 2, "#3a8ad8")   # the post, a card reader
    gg.rect(5, 7, 10, 4, "#b8d8ec"); gg.rect(5, 7, 10, 1, "#e8f4fc")                                # the glass flap
    im.alpha_composite(gg.outline().image())
    return im


def parapet(v):   # a roof's low concrete parapet with a steel rail
    g = Grid(T, T)
    g.rect(0, 4, T, 12, "#a8a8a4"); g.rect(0, 4, T, 3, "#c4c4c0"); g.rect(0, 15, T, 1, "#88888a")
    g.rect(0, 0, T, 1, "#7a8088")
    for x in (1 + v * 2, 9 + v * 2):
        g.rect(x, 0, 1, 4, "#7a8088")
    return g.image()


def roof(v):   # a roof deck: grey concrete slabs with tarred seams
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#a2a3a0")
    g.rect(0, 0, T, 1, "#6a6b68"); g.rect(0, 0, 1, T, "#6a6b68")
    _specks(g, ["#969794", "#b0b1ae", "#8a8b88"], 40 + v, 12)
    return g.image()


def office_tile(v):   # office floor: pale grey vinyl squares
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#cfd2d6")
    g.rect(0, 0, T, 1, "#bcc0c4"); g.rect(0, 0, 1, T, "#bcc0c4")
    _specks(g, ["#c4c8cc", "#dadde0"], 50 + v, 8)
    return g.image()


def carpet(v):   # office carpet tile: blue-grey with a fleck
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#5a6478")
    _specks(g, ["#66708a", "#4e586a", "#707a90"], 60 + v, 22)
    g.rect(0, 0, T, 1, "#525c70"); g.rect(0, 0, 1, T, "#525c70")
    return g.image()


def laminate(v):   # a flat's laminate floor: light planks
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#c8a07a")
    for y in (0, 4, 8, 12):
        g.rect(0, y, T, 1, "#b08a66")
        g.set((y * 3 + v * 7) % T, y + 2, "#b08a66")
    _specks(g, ["#d4ae88"], 70 + v, 8)
    return g.image()


def concrete(v):
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#a4a4a0")
    _specks(g, ["#989894", "#b0b0ac"], 80 + v, 14)
    return g.image()


def platform(v):   # the subway carriage's floor: grey with a speckle, a yellow line at the doors
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#8a8e96")
    _specks(g, ["#7e828a", "#969aa2"], 90 + v, 16)
    return g.image()


def limestone(v):   # Amman: pale limestone paving
    g = Grid(T, T)
    g.rect(0, 0, T, T, "#e0d4b8")
    g.rect(0, 7, T, 1, "#c8bc9e"); g.rect(5 + v * 4, 0, 1, 7, "#c8bc9e"); g.rect(11 - v * 4, 8, 1, 8, "#c8bc9e")
    _specks(g, ["#d4c8aa"], 95 + v, 8)
    return g.image()


def wall_tiles():
    """Plaster walls seen from above, as the kit's 'edge' walls: a 3x3 block (corners, sides; the centre unused).
    The wall is 11 px thick on its outer side, the rest of the tile clear (the floor shows)."""
    out = Image.new("RGBA", (3 * T, 3 * T))
    body, hi, lo, cap = "#e4e2dc", "#f4f2ee", "#b8b6b0", "#2a2c32"
    for ty in range(3):
        for tx in range(3):
            if (tx, ty) == (1, 1):
                continue
            g = Grid(T, T)
            top, bot, left, right = ty == 0, ty == 2, tx == 0, tx == 2
            if top:
                g.rect(0, 0, T, 11, body); g.rect(0, 0, T, 2, cap); g.rect(0, 9, T, 1, hi); g.rect(0, 10, T, 1, lo)
            if bot:
                g.rect(0, 5, T, 11, body); g.rect(0, 14, T, 2, cap); g.rect(0, 5, T, 1, lo)
            if left:
                g.rect(0, 0, 11, T, body); g.rect(0, 0, 2, T, cap); g.rect(10, 0, 1, T, lo)
            if right:
                g.rect(5, 0, 11, T, body); g.rect(14, 0, 2, T, cap); g.rect(5, 0, 1, T, lo)
            if top and left:
                g.rect(10, 10, 6, 6, None)
            out.alpha_composite(g.image(), (tx * T, ty * T))
    return out


# =====================================================================================================================
# buildings (drawn tall: each rises above its footprint, its front on the footprint's bottom edge)
def office_tower():   # One International: a glass-and-steel tower on a granite base, revolving door, the name over it
    W, H = 12 * T, 230
    g = Grid(W, H)
    glass, mull = "#6f8ca8", "#4a5a6c"
    g.rect(8, 8, W - 16, 10, "#9aa4ae"); g.rect(8, 8, W - 16, 1, "#c4ccd4")                     # the roof's edge
    g.rect(40, 0, 60, 9, "#8a949e"); g.rect(120, 2, 24, 7, "#7a848e")                            # plant rooms on the roof
    g.rect(8, 18, W - 16, H - 60, glass)
    for x in range(8, W - 8, 8):                                                                   # mullions
        g.rect(x, 18, 1, H - 60, mull)
    for y in range(18, H - 42, 7):                                                                 # floor lines
        g.rect(8, y, W - 16, 1, mull)
    for i in range(40):                                                                            # sky in the glass
        x, y = 12 + (i * 37) % (W - 30), 22 + (i * 53) % (H - 70)
        g.rect(x, y, 3, 1, "#a8c0d8")
    g.rect(W - 30, 18, 22, H - 60, shade(glass, -.18))                                             # the shaded side
    g.rect(0, H - 42, W, 42, "#8a8478"); g.rect(0, H - 42, W, 3, "#a8a296")                       # the granite base
    for x in range(4, W, 24):
        g.rect(x, H - 39, 1, 39, "#787266")
    g.rect(W // 2 - 50, H - 38, 100, 9, "#2a2c32")                                                 # the name board
    for i, x in enumerate(range(W // 2 - 44, W // 2 + 44, 6)):                                      # ONE INTERNATIONAL, as steel letters
        if i != 3:
            g.rect(x, H - 36, 4, 5, "#d8dce4")
    g.rect(W // 2 - 26, H - 26, 52, 26, "#2a3440"); g.rect(W // 2 - 24, H - 24, 48, 24, "#90b0c8")  # glass doors
    g.rect(W // 2 - 1, H - 24, 2, 24, "#4a5a6c")
    g.ellipse(W // 2, H - 12, 9, 10, "#4a5a6c", ring=.7)                                           # the revolving door
    g.rect(W // 2 - 70, H - 20, 14, 20, "#5a6a7a"); g.rect(W // 2 + 56, H - 20, 14, 20, "#5a6a7a")
    return img(g)


def office_block(seed=1, front="#c8bca8", trim="#8a7a66", sign="#2e4a8a"):   # a small 4-5 storey office building
    W, H = 6 * T, 128
    g = Grid(W, H)
    box(g, 2, 0, W - 4, 8, 0, "#9a9a96")
    g.rect(2, 8, W - 4, H - 8, front)
    windows(g, 4, 10, W - 8, H - 34, 4, 6, trim, "#7a9ab8", "#f0d890", seed)
    g.rect(2, H - 24, W - 4, 2, trim)
    g.rect(W // 2 - 20, H - 22, 40, 7, sign); g.rect(W // 2 - 16, H - 20, 32, 3, "#f4f2ec")       # the signboard
    g.rect(W // 2 - 8, H - 14, 16, 14, "#2a3440"); g.rect(W // 2 - 7, H - 13, 14, 13, "#8ab0c8")
    g.rect(W // 2, H - 13, 1, 13, "#2a3440")
    g.rect(W - 18, H - 30, 10, 6, "#e8e8e4"); g.rect(W - 18, H - 25, 10, 1, "#8a8a8a")              # an AC unit
    return img(g)


def villa():   # a red-brick multi-family villa: 3-4 storeys, balconies with laundry, a satellite dish
    W, H = 5 * T, 82
    g = Grid(W, H)
    brick, mortar = "#a8584a", "#8a463a"
    box(g, 1, 0, W - 2, 7, 0, "#8a8884")
    g.rect(1, 7, W - 2, H - 7, brick)
    for y in range(9, H, 3):
        g.rect(1, y, W - 2, 1, mortar)
    for j, y in enumerate((12, 30, 48)):
        for x in (6, 44):
            g.rect(x, y, 28, 13, "#d8d4cc"); g.rect(x + 2, y + 2, 24, 8, "#6a8aa8")                    # windows
            g.rect(x, y + 11, 28, 3, "#c8c4bc")                                                         # the balcony
            if (j + x) % 3:
                for k in range(3):
                    g.rect(x + 4 + k * 8, y + 7, 4, 5, ("#e86a6a", "#6a9ae8", "#f4f2ec")[k])          # laundry
    g.ellipse(70, 10, 4, 4, "#e8e8e4"); g.set(70, 10, "#8a8a8a")                                         # a dish
    g.rect(W // 2 - 7, H - 16, 14, 16, "#5a4a3a"); g.rect(W // 2 - 6, H - 15, 12, 15, "#8a7a6a")
    g.rect(W // 2 - 3, H - 20, 6, 3, "#3a6aa8")                                                         # the number plate
    return img(g)


def apartment():   # a slab of flats: white and pale grey, a big block number, glass balconies
    W, H = 8 * T, 130
    g = Grid(W, H)
    box(g, 2, 0, W - 4, 8, 0, "#a8a8a4")
    g.rect(2, 8, W - 4, H - 8, "#e8e8e4")
    for y in range(12, H - 20, 10):
        for x in range(6, W - 10, 20):
            g.rect(x, y, 16, 7, "#b8c8d8"); g.rect(x, y + 7, 16, 1, "#a8a8a4")
    g.rect(W - 26, 14, 18, 16, "#e8e8e4")
    for i, dx in enumerate((0, 6, 12)):                                                                 # "105"
        g.rect(W - 25 + dx, 16, 4, 12, "#3a6aa8")
        if i:
            g.rect(W - 24 + dx, 18, 2, 8, "#e8e8e4")
    g.rect(W // 2 - 10, H - 16, 20, 16, "#3a4450"); g.rect(W // 2 - 9, H - 15, 18, 15, "#a8c0d4")
    return img(g)


def storefront(seed=3):   # a street-level shop: a bright signboard, a glass front with posters, two floors of flats above
    W, H = 4 * T, 96
    r = random.Random(seed)
    sign = r.choice(["#e84a3a", "#2e8a5a", "#e8a020", "#3a6ad8"])
    face = r.choice(["#c8b8a0", "#d8d4cc", "#b8a48a", "#c4a890"])
    g = Grid(W, H)
    box(g, 1, 0, W - 2, 6, 0, "#8a8884")
    g.rect(1, 6, W - 2, 58, face)
    for y in (10, 36):                                                                                  # the flats' windows
        for x in (5, 23, 41):
            g.rect(x, y, 16, 16, shade(face, -.15)); g.rect(x + 1, y + 1, 14, 13, "#7a9ab8")
            g.rect(x + 1, y + 1, 14, 1, "#a8c0d8"); g.rect(x, y + 14, 16, 2, "#8a8e96")               # a sill, a rail
        if r.random() < .6:
            g.rect(23, y + 10, 4, 4, "#e86a6a")                                                         # laundry, a pot
    g.rect(W - 9, 12, 6, 4, "#e8e8e4")                                                                  # an AC unit
    g.rect(1, 64, W - 2, 10, sign); g.rect(1, 64, W - 2, 1, shade(sign, .3))                           # the signboard
    for x in range(6, W - 8, 5):
        g.rect(x, 67, 3, 4, "#f8f4ec")                                                                  # hangul, as blocks
    g.rect(1, 74, W - 2, H - 74, "#3a3e46")
    g.rect(3, 76, W - 6, H - 78, "#a8c8dc")
    g.rect(8, 79, 8, 10, "#f4c84a"); g.rect(40, 79, 10, 8, "#e86a8a")                                   # posters
    g.rect(W // 2 - 6, 76, 12, H - 76, "#3a3e46"); g.rect(W // 2 - 5, 77, 10, H - 77, "#c8dce8")
    g.rect(1, 74, W - 2, 2, "#8a8e96")                                                                  # the rolled shutter
    return img(g)


def mart():   # a big supermarket: a wide low box, a red and yellow sign, trolleys at the door
    W, H = 8 * T, 70
    g = Grid(W, H)
    box(g, 1, 0, W - 2, 10, 0, "#9a9a96")
    g.rect(1, 10, W - 2, H - 10, "#e8e4dc")
    g.rect(1, 14, W - 2, 16, "#d8382a"); g.rect(1, 14, W - 2, 2, "#f4c020")
    g.ellipse(22, 22, 6, 6, "#f4c020")
    for x in range(36, W - 20, 7):
        g.rect(x, 18, 5, 8, "#f8f4ec")
    g.rect(8, 36, W - 16, H - 36, "#3a3e46"); g.rect(10, 38, W - 20, H - 38, "#a8c8dc")
    g.rect(W // 2 - 12, 38, 24, H - 38, "#c8dce8"); g.rect(W // 2, 38, 1, H - 38, "#3a3e46")
    for x in (14, 20, 26):                                                                               # trolleys
        g.rect(x, H - 10, 5, 6, "#b8bcc4"); g.set(x, H - 4, "#2a2c32"); g.set(x + 4, H - 4, "#2a2c32")
    return img(g)


def pojangmacha():   # an orange-tarp tent bar, lit inside, plastic stools, a steaming cart; the flap open
    W, H = 3 * T, 40
    g = Grid(W, H)
    tarp, tarpD = "#e8742a", "#c45a1a"
    g.rect(2, 2, W - 4, 12, tarp); g.rect(2, 2, W - 4, 1, "#f4a060")
    for x in range(4, W - 4, 8):
        g.rect(x, 2, 1, 12, tarpD)
    g.rect(2, 14, W - 4, H - 14, tarp); g.rect(2, H - 1, W - 4, 1, tarpD)
    g.rect(14, 16, 20, H - 17, "#f8d888")                                                               # the open flap, lit
    g.rect(16, 26, 16, 6, "#b8bcc4"); g.rect(18, 20, 3, 5, "#f4f2ec"); g.rect(25, 19, 3, 6, "#f4f2ec")  # the cart, steam
    g.rect(16, H - 6, 4, 5, "#d8382a"); g.rect(28, H - 6, 4, 5, "#3a6ad8")                              # stools
    return img(g)


def subway_entrance():   # stairs going down under a glass canopy, a blue sign on a post
    W, H = 3 * T, 40
    g = Grid(W, H)
    g.rect(2, 4, W - 4, 4, "#b8d8ec"); g.rect(2, 4, W - 4, 1, "#e8f4fc"); g.rect(2, 8, W - 4, 1, "#6a7a8a")  # the canopy
    g.rect(3, 9, 2, 22, "#6a7a8a"); g.rect(W - 5, 9, 2, 22, "#6a7a8a")
    g.rect(5, 12, W - 10, 26, "#5a5e66")
    for y in range(13, 38, 3):                                                                           # the steps going down
        g.rect(6, y, W - 12, 1, shade("#9a9ea6", -(y - 13) / 40))
    g.rect(2, 30, 3, 8, "#8a8e96"); g.rect(W - 5, 30, 3, 8, "#8a8e96")
    g.rect(W - 4, 0, 2, 20, "#4a4e56"); g.rect(W - 9, 0, 10, 6, "#2a5ab0"); g.ellipse(W - 4, 3, 2, 2, "#f4f2ec")  # line 6's sign
    return img(g)


def stone_house():   # Amman: pale limestone blocks, a flat roof with a water tank, small grilled windows
    W, H = 5 * T, 62
    g = Grid(W, H)
    stone = "#e0d2b0"
    box(g, 1, 6, W - 2, 6, 0, "#cfc2a0")
    g.rect(52, 0, 12, 8, "#b8bcc4"); g.rect(52, 0, 12, 2, "#d8dce4")                                     # a water tank
    g.rect(1, 12, W - 2, H - 12, stone)
    for y in range(16, H, 6):
        g.rect(1, y, W - 2, 1, "#c8b896")
    for x in (8, 54):
        g.rect(x, 22, 16, 14, "#5a6a7a")
        for k in range(4):
            g.rect(x + 1 + k * 4, 22, 1, 14, "#2a2c32")
    g.rect(W // 2 - 7, H - 20, 14, 20, "#5a3a2a"); g.rect(W // 2 - 7, H - 22, 14, 2, "#a89878")
    return img(g)


def stone_shop():   # Amman: a café in a limestone front, a striped awning, chairs outside
    W, H = 4 * T, 48
    g = Grid(W, H)
    box(g, 1, 0, W - 2, 6, 0, "#cfc2a0")
    g.rect(1, 6, W - 2, H - 6, "#e0d2b0")
    g.rect(4, 10, W - 8, 6, "#2a6a4a"); g.rect(8, 11, W - 16, 3, "#f4f0e0")                              # the sign
    for i, x in enumerate(range(2, W - 2, 6)):
        g.rect(x, 18, 6, 6, ("#c8382a", "#f4f0e0")[i % 2])                                                # awning
    g.rect(6, 24, W - 12, 16, "#3a3a3a"); g.rect(8, 26, W - 16, 14, "#f0c878")
    g.rect(4, H - 7, 6, 6, "#6a4a2a"); g.rect(W - 10, H - 7, 6, 6, "#6a4a2a")
    g.rect(W // 2 - 2, H - 10, 4, 9, "#c8a03a"); g.rect(W // 2 - 1, H - 13, 2, 3, "#5a8ac8")              # a hookah
    return img(g)


def rooftop_box():   # a stairhouse and lift motor room: a concrete box, a steel door, vents
    W, H = 3 * T, 38
    g = Grid(W, H)
    box(g, 2, 0, W - 4, 8, H - 8, "#b8b8b4", "#9a9a96")
    g.rect(W // 2 - 6, H - 20, 12, 20, "#6a7480"); g.rect(W // 2 + 3, H - 11, 2, 2, "#d8dce4")
    g.rect(6, 12, 8, 5, "#7a7a78"); g.rect(7, 13, 6, 1, "#5a5a58"); g.rect(7, 15, 6, 1, "#5a5a58")
    return img(g)


def pagoda():   # Tapgol Park's ten-storey marble pagoda in its glass case
    W, H = 3 * T, 76
    g = Grid(W, H)
    g.rect(2, 4, W - 4, H - 6, "#c8dcec"); g.rect(2, 4, W - 4, 1, "#e8f4fc")
    for x in (2, W - 3):
        g.rect(x, 4, 1, H - 6, "#8a9aa8")
    g.rect(2, H - 3, W - 4, 3, "#9a9a96")
    y = 10
    for i in range(10):                                                                                   # the ten storeys
        w = 30 - i
        g.rect(W // 2 - w // 2, H - 10 - (i + 1) * 6, w, 5, "#ecebe6")
        g.rect(W // 2 - w // 2 - 1, H - 10 - (i + 1) * 6 + 4, w + 2, 1, "#b8b6b0")
    g.rect(W // 2 - 1, H - 72, 2, 6, "#b8b6b0")
    g.rect(W // 2 - 16, H - 10, 32, 7, "#d8d6d0")
    return img(g)


# =====================================================================================================================
# street things
def car(seed=0):   # a car seen from above at the 3/4 angle: four tiles long, two deep
    r = random.Random(seed)
    body = r.choice(["#e8e8e8", "#9aa0a8", "#2a2c32", "#e8e8e8", "#8a2a2a"])
    taxi = seed % 4 == 3
    if taxi:
        body = "#2a2c32"
    W, H = 4 * T, 26
    g = Grid(W, H)
    g.rect(4, 6, W - 8, 14, body); g.rect(4, 6, W - 8, 1, shade(body, .3))
    g.rect(18, 2, 26, 8, shade(body, -.1)); g.rect(20, 3, 22, 6, "#5a7a98"); g.rect(30, 3, 1, 6, shade(body, -.1))   # the cabin
    g.rect(4, 14, W - 8, 6, shade(body, -.2))
    for x in (10, W - 16):
        g.ellipse(x + 3, 21, 4, 4, "#1c1c20"); g.set(x + 3, 21, "#8a8a8a")
    g.rect(4, 12, 3, 3, "#f8f0c0"); g.rect(W - 7, 12, 3, 3, "#d8382a")
    if taxi:
        g.rect(28, 0, 8, 3, "#f4c020")
    return img(g)


def water_tank():
    g = Grid(2 * T, 28)
    g.rect(4, 22, 24, 6, "#6a7480")
    g.ellipse(16, 6, 11, 4, "#d8dce4"); g.rect(5, 6, 22, 16, "#b8bcc4"); g.ellipse(16, 22, 11, 3, "#9aa0a8")
    g.rect(5, 6, 22, 1, "#d8dce4")
    return img(g)


def bus_stop():   # a glass shelter, a route map, a bench inside
    W, H = 3 * T, 34
    g = Grid(W, H)
    g.rect(1, 2, W - 2, 4, "#3a6a9a"); g.rect(1, 2, W - 2, 1, "#6a9aca")
    g.rect(2, 6, W - 4, 24, "#c8dcec"); g.rect(2, 6, 1, 24, "#6a7a8a"); g.rect(W - 3, 6, 1, 24, "#6a7a8a")
    g.rect(6, 9, 12, 12, "#f4f2ec"); g.rect(8, 11, 8, 1, "#3a6ad8"); g.rect(8, 14, 6, 1, "#2e8a5a"); g.rect(8, 17, 7, 1, "#d8382a")
    g.rect(22, 22, 22, 4, "#8a6a4a"); g.rect(22, 26, 2, 4, "#5a5e66"); g.rect(42, 26, 2, 4, "#5a5e66")
    return img(g)


def vending():   # a lit drinks machine, cans in rows
    g = Grid(T, 28)
    g.rect(1, 1, 14, 26, "#d8382a"); g.rect(1, 1, 14, 1, "#f86a5a")
    g.rect(3, 3, 10, 14, "#f4f2ec")
    for y in (4, 8, 12):
        for x in range(4, 12, 2):
            g.rect(x, y, 1, 3, ("#3a6ad8", "#f4c020", "#2e8a5a", "#8a2a2a")[(x + y) % 4])
    g.rect(4, 20, 8, 4, "#2a2c32")
    return img(g)


def bench():   # a park bench: slats and iron legs
    g = Grid(2 * T, 14)
    g.rect(2, 1, 28, 2, "#8a6a4a"); g.rect(2, 4, 28, 2, "#8a6a4a")
    g.rect(2, 7, 28, 3, "#a88060"); g.rect(2, 10, 28, 1, "#6a4a32")
    for x in (3, 27):
        g.rect(x, 1, 2, 13, "#3a3c42")
    return img(g)


def scooter():   # a delivery scooter with an insulated box on the back
    g = Grid(T, 18)
    g.rect(2, 2, 9, 7, "#d8382a"); g.rect(3, 3, 7, 2, "#f4f2ec")
    g.rect(4, 9, 9, 4, "#e8e8e4"); g.rect(11, 5, 2, 5, "#4a4e56"); g.rect(10, 4, 5, 1, "#2a2c32")
    g.ellipse(4, 15, 2.5, 2.5, "#1c1c20"); g.ellipse(12, 15, 2.5, 2.5, "#1c1c20")
    return img(g)


def ginkgo(v=0):   # a ginkgo street tree in an iron grating; fan-shaped leaves (yellow in autumn on the second)
    leaf, leafD = (("#7aaa3a", "#5a8a2a"), ("#e8c030", "#c89a20"))[v]
    g = Grid(28, 44)
    g.rect(6, 38, 16, 6, "#4a4e56")
    for x in range(7, 22, 3):
        g.rect(x, 38, 1, 6, "#2a2c32")
    g.rect(13, 22, 3, 18, "#6a4a32")
    for cx, cy, rx, ry in ((14, 18, 8, 9), (9, 22, 5, 5), (19, 21, 5, 6), (14, 8, 6, 6)):
        g.ellipse(cx, cy, rx, ry, leaf)
    for x, y in ((10, 12), (17, 15), (12, 24), (19, 25), (14, 6)):
        g.rect(x, y, 2, 2, leafD)
    return img(g)


def olive():
    g = Grid(28, 40)
    g.rect(12, 24, 4, 16, "#7a6a5a"); g.set(11, 30, "#7a6a5a"); g.set(16, 27, "#7a6a5a")
    for cx, cy, rx, ry in ((14, 16, 11, 9), (8, 20, 6, 5), (20, 20, 6, 5)):
        g.ellipse(cx, cy, rx, ry, "#8aa07a")
    for x, y in ((9, 14), (17, 12), (12, 20), (20, 18)):
        g.rect(x, y, 2, 1, "#b8c8a8")
    return img(g)


def streetlight():   # a modern street light: a grey pole, an arm, a lamp
    g = Grid(T, 40)
    g.rect(7, 4, 2, 36, "#6a7078"); g.rect(4, 38, 8, 2, "#4a4e56")
    g.rect(8, 3, 6, 2, "#6a7078"); g.rect(11, 4, 4, 2, "#f8f0c0")
    return img(g)


# =====================================================================================================================
# office and home furniture (2 px of "top" per tile of depth: the old kits' furniture is low and wide)
def office_desk():   # a grey desk, a monitor and keyboard, papers, a mug, a black chair pulled up
    g = Grid(2 * T, 26)
    box(g, 1, 6, 30, 8, 6, "#c8ccd2", "#8a9098")
    g.rect(10, 0, 12, 9, "#2a2c32"); g.rect(11, 1, 10, 6, "#6a9ac8"); g.rect(15, 9, 2, 2, "#2a2c32")   # monitor
    g.rect(11, 11, 10, 2, "#3a3c42")                                                                     # keyboard
    g.rect(2, 7, 6, 4, "#f4f2ec"); g.rect(25, 8, 3, 3, "#f4f2ec")                                        # papers, a mug
    g.rect(12, 20, 8, 3, "#2a2c32"); g.rect(13, 16, 6, 4, "#3a3c42"); g.rect(15, 23, 2, 2, "#2a2c32")   # the chair
    return img(g)


def exec_desk():   # big, dark wood, a leather chair behind, a name plate
    g = Grid(3 * T, 28)
    g.rect(18, 0, 12, 10, "#2a2228"); g.rect(19, 1, 10, 7, "#4a3a3a")                                     # the chair's back
    box(g, 2, 8, 44, 8, 10, "#6a4a32", "#4a3222")
    g.rect(6, 10, 8, 4, "#f4f2ec"); g.rect(32, 9, 6, 3, "#c8a03a"); g.rect(33, 10, 4, 1, "#2a2228")       # papers, the name plate
    g.rect(20, 10, 8, 2, "#2a2c32")
    return img(g)


def meeting_table():   # a long table, chairs round it, a jug of water, notepads
    W, H = 4 * T, 2 * T + 6
    g = Grid(W, H)
    for x in range(10, W - 8, 10):
        g.rect(x, 0, 6, 5, "#2a2c32"); g.rect(x, H - 6, 6, 6, "#2a2c32")
    g.rect(1, 12, 5, 8, "#2a2c32"); g.rect(W - 6, 12, 5, 8, "#2a2c32")
    box(g, 6, 5, W - 12, 18, 5, "#8a6a4a", "#5a4230")
    for x in range(10, W - 12, 10):
        g.rect(x, 8, 5, 4, "#f4f2ec"); g.rect(x, 17, 5, 4, "#f4f2ec")
    g.rect(W // 2 - 2, 11, 4, 6, "#b8d8ec")
    return img(g)


def reception():   # a long front desk in pale stone, the logo on its front
    g = Grid(4 * T, 22)
    box(g, 1, 4, 62, 6, 12, "#e8e4dc", "#c8c2b6")
    g.ellipse(32, 16, 4, 3, "#2e4a8a"); g.rect(38, 15, 14, 2, "#2e4a8a")
    g.rect(14, 0, 10, 5, "#2a2c32"); g.rect(15, 1, 8, 3, "#6a9ac8")
    return img(g)


def chair():   # a black office chair on castors
    g = Grid(T, 16)
    g.rect(4, 1, 8, 7, "#2a2c32"); g.rect(5, 2, 6, 5, "#3a3c42")
    g.rect(3, 8, 10, 3, "#2a2c32"); g.rect(7, 11, 2, 3, "#5a5e66")
    for x in (3, 7, 11):
        g.set(x, 14, "#1c1c20"); g.set(x + 1, 14, "#1c1c20")
    return img(g)


def copier():   # an office copier, lid up, paper beside it
    g = Grid(2 * T, 26)
    g.rect(4, 0, 18, 6, "#d8dce0"); g.rect(5, 1, 16, 3, "#4a6a8a")                                        # the lid, up
    box(g, 3, 6, 20, 6, 14, "#e8eaec", "#c4c8cc")
    g.rect(16, 7, 4, 2, "#3a8ad8"); g.rect(6, 15, 14, 2, "#9aa0a8"); g.rect(6, 19, 14, 2, "#9aa0a8")
    g.rect(24, 12, 7, 12, "#f4f2ec"); g.rect(24, 12, 7, 1, "#ffffff")                                    # paper
    return img(g)


def water_cooler():   # a water cooler, cups beside it
    g = Grid(T, 28)
    g.rect(4, 0, 8, 10, "#9ac8e8"); g.rect(5, 1, 2, 8, "#c8e4f4"); g.rect(4, 0, 8, 1, "#3a6ab0")
    box(g, 3, 10, 10, 3, 15, "#e8eaec", "#c8ccd0")
    g.set(6, 15, "#3a6ad8"); g.set(9, 15, "#d8382a")
    g.rect(13, 14, 3, 6, "#f4f2ec")
    return img(g)


def whiteboard():   # a whiteboard on a stand, scribbled with arrows and figures
    g = Grid(2 * T, 28)
    g.rect(2, 0, 28, 18, "#9aa0a8"); g.rect(3, 1, 26, 16, "#f8f8f6")
    g.rect(5, 4, 8, 1, "#2a5ab0"); g.rect(5, 7, 12, 1, "#2a2c32"); g.rect(19, 4, 6, 6, "#d8382a")
    for i in range(5):
        g.set(8 + i, 12 - i // 2, "#2a2c32")
    g.set(13, 10, "#2a2c32"); g.set(12, 9, "#2a2c32")
    g.rect(5, 18, 2, 9, "#6a7078"); g.rect(25, 18, 2, 9, "#6a7078"); g.rect(3, 17, 26, 1, "#6a7078")
    return img(g)


def projector_screen():   # a pull-down screen, a slide lit on it
    g = Grid(3 * T, 30)
    g.rect(1, 0, 46, 3, "#4a4e56")
    g.rect(3, 3, 42, 24, "#f4f4f2")
    g.rect(7, 6, 20, 2, "#2e4a8a"); g.rect(7, 10, 14, 1, "#8a9098"); g.rect(7, 13, 16, 1, "#8a9098")
    for i, h in enumerate((5, 8, 11)):
        g.rect(31 + i * 4, 22 - h, 3, h, "#3a8ad8")
    g.rect(22, 27, 4, 2, "#4a4e56")
    return img(g)


def lectern():   # a lectern with a microphone
    g = Grid(T, 26)
    g.rect(9, 0, 1, 7, "#2a2c32"); g.rect(8, 0, 3, 2, "#4a4e56")
    box(g, 2, 6, 12, 4, 16, "#6a4a32", "#4a3222")
    g.ellipse(8, 17, 2, 2, "#c8a03a")
    return img(g)


def bins():   # recycling bins in a row: paper, cans, general
    g = Grid(T, 18)
    for i, c in enumerate(("#3a6ad8", "#f4c020", "#8a9098")):
        box(g, 1 + i * 5, 2, 4, 3, 12, shade(c, .15), c)
    return img(g)


def sofa():   # a two-seat sofa in grey cloth
    g = Grid(2 * T, 18)
    g.rect(1, 1, 30, 8, "#5a6070"); g.rect(1, 1, 30, 1, "#7a8090")
    g.rect(1, 9, 30, 6, "#6a7080"); g.rect(15, 9, 1, 6, "#4a5060")
    g.rect(0, 5, 3, 11, "#4a5060"); g.rect(29, 5, 3, 11, "#4a5060")
    return img(g)


def filing():   # a grey steel filing cabinet
    g = Grid(T, 26)
    box(g, 2, 0, 12, 3, 23, "#b8bcc4", "#9aa0a8")
    for y in (5, 11, 17):
        g.rect(3, y, 10, 1, "#7a8088"); g.rect(6, y + 2, 4, 1, "#5a5e66")
    return img(g)


def lift_door():   # brushed steel doors, the floor number lit above them
    g = Grid(2 * T, 30)
    g.rect(1, 0, 30, 30, "#b8b6b0")
    g.rect(12, 1, 8, 4, "#1c1c20"); g.rect(14, 2, 4, 2, "#e8742a")
    g.rect(4, 6, 24, 24, "#c4c8d0"); g.rect(15, 6, 2, 24, "#8a9098")
    for x in (6, 10, 20, 24):
        g.rect(x, 7, 1, 22, "#d8dce4")
    g.rect(29, 16, 2, 4, "#5a5e66"); g.set(29, 17, "#f4f2ec")
    return img(g)


def boxes():   # archive boxes stacked and taped
    g = Grid(T, 22)
    box(g, 1, 10, 14, 3, 9, "#d8b888", "#c0a070")
    box(g, 3, 1, 11, 3, 6, "#e0c494", "#c8a878")
    g.rect(7, 10, 2, 12, "#c8a060"); g.rect(8, 1, 1, 9, "#c8a060")
    return img(g)


def phone():   # a desk phone on a small side table, a red light blinking
    g = Grid(T, 20)
    box(g, 2, 7, 12, 4, 9, "#8a6a4a", "#6a4a32")
    g.rect(4, 3, 8, 5, "#2a2c32"); g.rect(4, 2, 8, 2, "#3a3c42"); g.set(11, 6, "#f83a2a")
    g.rect(5, 6, 4, 1, "#6a7078")
    return img(g)


def noticeboard():   # a cork noticeboard with sheets pinned to it
    g = Grid(2 * T, 22)
    g.rect(1, 0, 30, 18, "#8a6a4a"); g.rect(2, 1, 28, 16, "#c8a070")
    for x, y, c in ((4, 3, "#f4f2ec"), (12, 2, "#f8f0b8"), (21, 4, "#f4f2ec"), (6, 10, "#c8dcec"), (16, 9, "#f4f2ec")):
        g.rect(x, y, 6, 6, c); g.set(x + 3, y, "#d8382a")
    g.rect(4, 18, 2, 4, "#6a4a32"); g.rect(26, 18, 2, 4, "#6a4a32")
    return img(g)


def ashtray():   # a standing steel ashtray
    g = Grid(T, 20)
    g.ellipse(8, 3, 4, 2, "#9aa0a8"); g.ellipse(8, 3, 2.5, 1, "#5a5e66")
    g.rect(5, 4, 6, 14, "#b8bcc4"); g.rect(5, 4, 1, 14, "#d8dce4"); g.rect(4, 17, 8, 2, "#7a8088")
    return img(g)


def go_board():   # a thick floor board on legs, a cushion each side, bowls of stones
    g = Grid(T, 16)
    g.rect(0, 0, 16, 3, "#6a5a8a"); g.rect(0, 13, 16, 3, "#6a5a8a")
    box(g, 2, 3, 12, 6, 3, "#d8b070", "#a87a40")
    for i in range(3, 14, 3):
        g.rect(i, 3, 1, 6, "#8a6a3a")
    g.rect(2, 5, 12, 1, "#8a6a3a")
    g.set(5, 4, "#1c1418"); g.set(8, 6, "#f4f2ec"); g.set(11, 4, "#1c1418")
    g.ellipse(1.5, 11, 1.5, 1.5, "#5a3a2a"); g.ellipse(14.5, 11, 1.5, 1.5, "#5a3a2a")
    return img(g)


def trophy_case():   # a glass case of trophies and framed photos
    g = Grid(2 * T, 28)
    box(g, 1, 0, 30, 3, 25, "#6a4a32", "#5a3a28")
    g.rect(3, 4, 26, 21, "#c8dcec")
    for x in (5, 13, 21):
        g.rect(x + 1, 6, 3, 3, "#e6c14a"); g.rect(x + 2, 9, 1, 2, "#e6c14a"); g.rect(x + 1, 11, 3, 1, "#c8a03a")
    g.rect(3, 13, 26, 1, "#8a9aa8")
    for x in (5, 15, 23):
        g.rect(x, 16, 6, 6, "#8a6a4a"); g.rect(x + 1, 17, 4, 4, "#d8c8b8")
    return img(g)


def store_shelf():   # a convenience store's shelf of snacks and noodles
    g = Grid(2 * T, 26)
    box(g, 1, 0, 30, 3, 23, "#d8dce0", "#b8bcc4")
    r = random.Random(5)
    for y in (4, 11, 18):
        g.rect(2, y + 6, 28, 1, "#8a9098")
        for x in range(3, 29, 3):
            g.rect(x, y, 2, 6, r.choice(["#d8382a", "#f4c020", "#3a6ad8", "#2e8a5a", "#e8742a", "#f4f2ec"]))
    return img(g)


def fridge_case():   # a glass-door drinks fridge, lit
    g = Grid(2 * T, 28)
    box(g, 1, 0, 30, 3, 25, "#e8eaec", "#c8ccd0")
    g.rect(3, 4, 12, 22, "#d8f0f8"); g.rect(17, 4, 12, 22, "#d8f0f8")
    r = random.Random(7)
    for y in (6, 12, 18):
        for x in list(range(4, 14, 2)) + list(range(18, 28, 2)):
            g.rect(x, y, 1, 4, r.choice(["#2e8a5a", "#d8382a", "#3a6ad8", "#f4c020", "#8a5a2a"]))
    g.rect(15, 4, 2, 22, "#9aa0a8")
    return img(g)


def plastic_table(v=0):   # a round plastic table with soju bottles and a dish
    top = ("#d8382a", "#3a6ad8")[v]
    g = Grid(T, 16)
    g.ellipse(8, 7, 7.5, 4, top); g.ellipse(8, 6.5, 6.5, 3, shade(top, .2))
    g.rect(7, 10, 2, 5, shade(top, -.3))
    g.rect(4, 2, 2, 5, "#4aa86a"); g.rect(10, 3, 2, 4, "#4aa86a"); g.ellipse(8, 7, 2, 1, "#f4f2ec")
    return img(g)


def pizza_oven():   # a pizza shop's steel oven
    g = Grid(2 * T, 26)
    box(g, 1, 0, 30, 4, 20, "#b8bcc4", "#9aa0a8")
    for y in (6, 14):
        g.rect(4, y, 24, 6, "#5a5e66"); g.rect(5, y + 1, 22, 4, "#e8742a"); g.rect(5, y, 22, 1, "#d8dce4")
    g.rect(3, 24, 2, 2, "#2a2c32"); g.rect(27, 24, 2, 2, "#2a2c32")
    return img(g)


def low_table():   # a low wooden table set with dishes, sat at on the floor
    g = Grid(2 * T, 14)
    box(g, 1, 2, 30, 7, 3, "#a87a50", "#7a5434")
    for x, c in ((4, "#f4f2ec"), (10, "#e8742a"), (16, "#f4f2ec"), (22, "#5a8a3a")):
        g.ellipse(x + 2, 5, 2, 1.5, c)
    g.rect(3, 12, 2, 2, "#6a4428"); g.rect(27, 12, 2, 2, "#6a4428")
    return img(g)


def wardrobe():
    g = Grid(2 * T, 30)
    box(g, 2, 0, 28, 3, 27, "#c8a07a", "#a8805a")
    g.rect(15, 3, 1, 27, "#8a6040"); g.rect(13, 14, 1, 3, "#5a3a20"); g.rect(18, 14, 1, 3, "#5a3a20")
    return img(g)


def tv():   # a television on a low cabinet
    g = Grid(2 * T, 24)
    g.rect(4, 0, 24, 14, "#1c1c20"); g.rect(5, 1, 22, 11, "#3a5a7a"); g.rect(6, 2, 6, 2, "#6a8aa8")
    g.rect(14, 14, 4, 2, "#1c1c20")
    box(g, 1, 16, 30, 3, 6, "#8a6a4a", "#6a4a32")
    return img(g)


def toy_shelf():   # a low shelf of toys and picture books
    g = Grid(2 * T, 20)
    box(g, 1, 2, 30, 3, 16, "#e8d8b8", "#d0bc98")
    for i, c in enumerate(("#d8382a", "#3a6ad8", "#f4c020", "#2e8a5a", "#e86a9a")):
        g.rect(3 + i * 5, 6, 4, 5, c)
    g.ellipse(8, 15, 2.5, 2.5, "#f4c020"); g.rect(15, 13, 5, 4, "#3a6ad8"); g.ellipse(25, 15, 2.5, 2, "#d8382a")
    return img(g)


def kid_mat():   # a padded play mat in bright squares
    g = Grid(2 * T, 14)
    for i in range(4):
        for j in range(2):
            g.rect(1 + i * 7 + 1, 1 + j * 6, 7, 6, ("#f4c020", "#3a6ad8", "#d8382a", "#2e8a5a")[(i + j) % 4])
    return g.image()


def subway_seat():   # a carriage's long bench seat along the wall, grab rails and hoops above
    g = Grid(4 * T, 26)
    g.rect(0, 0, 64, 2, "#b8bcc4")
    for x in range(4, 64, 10):
        g.rect(x, 2, 1, 4, "#b8bcc4"); g.ellipse(x + .5, 7, 2, 2, "#f4c020", ring=.3)
    g.rect(1, 12, 62, 7, "#3a7ab8"); g.rect(1, 12, 62, 1, "#6aa0d8")
    for x in range(9, 64, 9):
        g.rect(x, 12, 1, 7, "#2a5a90")
    g.rect(1, 19, 62, 5, "#8a9098"); g.rect(0, 10, 2, 14, "#b8bcc4"); g.rect(62, 10, 2, 14, "#b8bcc4")
    return img(g)


def plant():   # an office plant in a white pot
    g = Grid(T, 24)
    for cx, cy, rx, ry in ((8, 8, 5, 6), (4, 11, 3, 4), (12, 10, 3, 5)):
        g.ellipse(cx, cy, rx, ry, "#4a8a3a")
    g.set(7, 5, "#6aaa4a"); g.set(10, 8, "#6aaa4a")
    g.rect(4, 15, 8, 8, "#f4f2ec"); g.rect(4, 15, 8, 1, "#d8d4cc")
    return img(g)


def window():   # a modern window in a wall: aluminium frame, blinds half down
    g = Grid(T, 18)
    g.rect(1, 1, 14, 16, "#9aa0a8"); g.rect(2, 2, 12, 14, "#9ac0e0")
    for y in range(2, 8, 2):
        g.rect(2, y, 12, 1, "#e8e8e4")
    g.rect(7, 2, 2, 14, "#9aa0a8")
    return img(g)


def counter():   # a shop counter with a till
    g = Grid(3 * T, 22)
    box(g, 1, 6, 46, 5, 11, "#c8ccd2", "#9aa0a8")
    g.rect(32, 0, 10, 7, "#2a2c32"); g.rect(33, 1, 8, 4, "#6ac87a")
    return img(g)


def table():   # a plain modern table
    g = Grid(2 * T, 16)
    box(g, 1, 2, 30, 8, 3, "#e8e4dc", "#c8c2b6")
    for x in (2, 28):
        g.rect(x, 13, 2, 3, "#6a7078")
    return img(g)


def stool():   # a round stool
    g = Grid(T, 12)
    g.ellipse(8, 3, 5, 2.5, "#d8382a"); g.rect(5, 4, 1, 7, "#6a7078"); g.rect(10, 4, 1, 7, "#6a7078")
    return img(g)


def shelf():   # a bookshelf of binders
    g = Grid(2 * T, 28)
    box(g, 1, 0, 30, 3, 25, "#b8bcc4", "#9aa0a8")
    r = random.Random(11)
    for y in (4, 12, 20):
        for x in range(3, 29, 3):
            g.rect(x, y, 2, 7, r.choice(["#2e4a8a", "#d8382a", "#e8e4dc", "#2a2c32", "#5a8a3a"]))
    return img(g)


def desk():   # a plain desk (the old kind, modernised)
    g = Grid(2 * T, 16)
    box(g, 1, 2, 30, 7, 6, "#c8ccd2", "#8a9098")
    g.rect(4, 3, 7, 4, "#f4f2ec")
    return img(g)


def gotable():   # Tapgol Park's stone go table: a granite slab on a pedestal, the grid cut into it, two stone stools
    g = Grid(T, 18)
    g.ellipse(2, 15, 2, 1.5, "#a8a8a4"); g.ellipse(14, 15, 2, 1.5, "#a8a8a4")
    box(g, 2, 2, 12, 9, 3, "#c8c8c4", "#9a9a96")
    for i in range(4, 13, 2):
        g.rect(i, 3, 1, 7, "#8a8a86")
    for j in range(4, 11, 2):
        g.rect(3, j, 10, 1, "#8a8a86")
    g.rect(6, 14, 4, 4, "#9a9a96")
    g.set(5, 4, "#1c1418"); g.set(9, 6, "#f4f2ec"); g.set(7, 8, "#1c1418")
    return img(g)


def glass_water():   # a glass of water on a coaster (small: it stands on a table top)
    g = Grid(T, T)
    g.ellipse(8, 13, 4, 1.5, "#8a6a4a")
    g.rect(6, 5, 5, 8, "#c8e4f4"); g.rect(6, 5, 5, 1, "#e8f4fc"); g.rect(7, 8, 3, 4, "#a8d0ec"); g.set(7, 6, "#ffffff")
    return img(g)


def teacup():   # a white teacup of green tea on its saucer
    g = Grid(T, T)
    g.ellipse(8, 13, 5, 1.6, "#f4f2ec")
    g.rect(5, 8, 7, 5, "#f4f2ec"); g.rect(5, 8, 7, 1, "#8ab05a"); g.rect(12, 9, 2, 2, "#f4f2ec")
    return img(g)


def coffee_cup():   # a coffee cup on its saucer
    g = Grid(T, T)
    g.ellipse(8, 13, 5, 1.6, "#f4f2ec")
    g.rect(5, 7, 7, 6, "#f4f2ec"); g.rect(5, 7, 7, 1, "#5a3a22"); g.rect(12, 8, 2, 3, "#f4f2ec")
    g.set(7, 5, "#d8d4cc"); g.set(9, 4, "#d8d4cc")
    return img(g)


def stalls():   # a row of street-market stalls: blue and orange tarps on poles over trestles, crates of fruit and veg
    W, H = 6 * T, 46
    g = Grid(W, H)
    r = random.Random(17)
    for i, x in enumerate((2, 34, 66)):
        tarp = ("#3a6ad8", "#e8742a", "#3a6ad8")[i]
        g.rect(x + 1, 10, 1, 30, "#8a9098"); g.rect(x + 27, 10, 1, 30, "#8a9098")                        # poles
        g.rect(x, 2, 29, 10, tarp); g.rect(x, 2, 29, 1, shade(tarp, .35)); g.rect(x, 11, 29, 1, shade(tarp, -.3))
        for k in range(x + 4, x + 28, 6):
            g.rect(k, 2, 1, 10, shade(tarp, -.15))
        box(g, x + 2, 26, 26, 6, 8, "#c8a070", "#8a6a4a")                                                 # the trestle
        for k in range(x + 3, x + 26, 6):                                                                  # crates of produce
            g.rect(k, 22, 5, 5, "#b8885a")
            fr = r.choice(["#d8382a", "#f4c020", "#5aa83a", "#e8742a", "#8a3a8a"])
            g.rect(k + 1, 21, 3, 2, fr)
        g.rect(x + 4, 40, 6, 5, "#5a8ac8"); g.rect(x + 18, 40, 6, 5, "#d8b070")                         # crates below
    return img(g)


def mat():   # a rug
    g = Grid(2 * T, 2 * T)
    g.rect(1, 6, 30, 20, "#8a5a5a"); g.rect(3, 8, 26, 16, "#a87070"); g.rect(5, 10, 22, 12, "#8a5a5a")
    return g.image()


PIECES = {
    "building.office_tower": office_tower, "building.office_block": [office_block, lambda: office_block(2, "#d8d4cc", "#6a7078", "#2e8a5a"),
                                                                     lambda: office_block(3, "#b8a48a", "#5a4a3a", "#8a2a2a")],
    "building.villa": villa, "building.apartment": apartment,
    "building.storefront": [lambda: storefront(1), lambda: storefront(2), lambda: storefront(4), lambda: storefront(7)],
    "building.mart": mart, "building.pojangmacha": pojangmacha, "building.subway_entrance": subway_entrance,
    "building.stone_house": stone_house, "building.stone_shop": stone_shop, "building.rooftop_box": rooftop_box,
    "landmark.pagoda": pagoda,
    "prop.car": [lambda: car(0), lambda: car(1), lambda: car(2), lambda: car(3)], "prop.water_tank": water_tank,
    "prop.bus_stop": bus_stop, "prop.vending": vending, "prop.bench": bench, "prop.scooter": scooter,
    "tree.ginkgo": [lambda: ginkgo(0), lambda: ginkgo(1)], "tree.olive": olive,
    "furn.office_desk": office_desk, "furn.exec_desk": exec_desk, "furn.meeting_table": meeting_table,
    "furn.reception": reception, "furn.chair": chair, "furn.copier": copier, "furn.water_cooler": water_cooler,
    "furn.whiteboard": whiteboard, "furn.projector_screen": projector_screen, "furn.lectern": lectern,
    "furn.bin": bins, "furn.sofa": sofa, "furn.filing": filing, "furn.lift_door": lift_door, "furn.boxes": boxes,
    "furn.phone": phone, "furn.noticeboard": noticeboard, "furn.ashtray": ashtray, "furn.go_board": go_board,
    "furn.trophy_case": trophy_case, "furn.store_shelf": store_shelf, "furn.fridge_case": fridge_case,
    "furn.plastic_table": [lambda: plastic_table(0), lambda: plastic_table(1)], "furn.pizza_oven": pizza_oven,
    "furn.low_table": low_table, "furn.wardrobe": wardrobe, "furn.tv": tv, "furn.toy_shelf": toy_shelf,
    "furn.kid_mat": kid_mat, "furn.subway_seat": subway_seat,
    # old kinds the Misaeng plans use, redrawn modern for this kit
    "lamp.post": streetlight, "furn.plant": plant, "furn.window": window, "furn.counter": counter, "furn.table": table,
    "furn.stool": stool, "furn.shelf": shelf, "furn.desk": desk, "furn.mat": mat, "furniture.gotable": gotable, "market.stalls": stalls,
    # m17's drinks, small on a table top
    "prop.glass_water": glass_water, "prop.teacup": teacup, "prop.coffee_cup": coffee_cup,
}

TILES = {
    "city": [(pavement(0), 12), (pavement(1), 12), (pavement(4), 12), (pavement(2), 1)], "road": [pavers(0), pavers(1)],
    "traffic": [asphalt(0), asphalt(1)], "crosswalk": [crosswalk(0), crosswalk(1)],
    "barrier": [barrier(0), barrier(1)], "parapet": [parapet(0), parapet(1)], "roof": [roof(0), roof(1)],
    "stone": [office_tile(0), office_tile(1)], "mat": [carpet(0), carpet(1)], "wood": [laminate(0), laminate(1)],
    "earth": [concrete(0), concrete(1)], "lobby": [lobby(0), lobby(1)], "platform": [platform(0), platform(1)],
    "limestone": [limestone(0), limestone(1)],
}
# grounds that are another's tiles here: the old names Places' plans use, in their modern form
SAME = {"court": "roof", "asphalt": "traffic", "carpet": "mat", "office_tile": "lobby", "lino": "wood", "ward": "city", "passage": "city", "path": "city", "camp": "city", "market": "city",
        "plain": "grass", "garden": "grass", "field": "grass", "stage": "wood", "curtain": "wood", "dirt": "city",
        "sand": "city", "floor": "stone"}

# townsfolk, drawn by the game from TK_CHARS looks (tk.js ms_*): every folk kind, old names too
FOLK = {
    "folk.salaryman": ["ms_worker", "ms_worker3", "ms_commuter"], "folk.officewoman": ["ms_worker2", "ms_officewoman2"],
    "folk.grandpa": ["ms_oldman", "ms_oldman2"], "folk.ajumma": ["ms_ajumma", "ms_ajumma2"],
    "folk.kid": ["ms_kid", "ms_kid2"], "folk.jordanian": ["ms_cafe", "ms_jordanian"],
    "folk.villager": ["ms_passerby", "ms_passerby2", "ms_worker"], "folk.woman": ["ms_passerby", "ms_officewoman2"],
    "folk.elder": ["ms_oldman", "ms_oldman2"], "folk.child": ["ms_kid", "ms_kid2"], "folk.official": ["ms_worker3"],
    "folk.noble": ["ms_worker"], "folk.soldier": ["ms_passerby2"], "folk.rebel": ["ms_passerby2"],
    "folk.hunter": ["ms_passerby2"], "folk.monk": ["ms_oldman"], "folk.lady": ["ms_worker2"],
    "folk.maiden": ["ms_officewoman2"], "folk.girl": ["ms_kid2"],
}


def pack(ims, width=512):
    """Shelf-pack images into one sheet, tallest first, 1 px apart."""
    x = y = rowh = 0
    pos = {}
    for k, im in sorted(ims.items(), key=lambda kv: -kv[1].height):
        if x + im.width > width:
            x, y, rowh = 0, y + rowh + 1, 0
        pos[k] = [x, y, im.width, im.height]
        x += im.width + 1
        rowh = max(rowh, im.height)
    sheet = Image.new("RGBA", (width, y + rowh))
    for k, (px, py, _, _) in pos.items():
        sheet.alpha_composite(ims[k], (px, py))
    return sheet, pos


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    ims = {}
    for kind, f in PIECES.items():
        for i, fn in enumerate(f if isinstance(f, list) else [f]):
            ims[(kind, i)] = fn()
    sheet, pos = pack(ims)
    sheet.save(OUT / "pieces.png")
    # ground tiles: two per row, then the walls' 3x3 block below
    tsheet = Image.new("RGBA", (max(3, max(len(v) for v in TILES.values())) * T, T * len(TILES) + 3 * T))
    tpos = {}
    for row, (mat, tl) in enumerate(TILES.items()):
        tl = [t if isinstance(t, tuple) else (t, 1) for t in tl]   # (tile, weight): a rare variant has a low weight
        for col, (im, _) in enumerate(tl):
            tsheet.alpha_composite(im, (col * T, row * T))
        tpos[mat] = [["seoul_tiles", col, row, w] for col, (_, w) in enumerate(tl)]
    wy = len(TILES)
    tsheet.alpha_composite(wall_tiles(), (0, wy * T))
    tsheet.save(OUT / "tiles.png")

    kit = copy.deepcopy(json.loads((ROOT / "assets/tk/kits/jade.json").read_text()))
    kit["kit"], kit["name"] = "seoul", "Seoul"
    kit["credit"] += " Seoul (modern Misaeng) drawn for the game (tools/draw_seoul.py)."
    kit["sheets"]["seoul"] = str((OUT / "pieces.png").relative_to(ROOT))
    kit["sheets"]["seoul_tiles"] = str((OUT / "tiles.png").relative_to(ROOT))
    for mat, tiles in tpos.items():
        kit["materials"][mat] = {"tiles": tiles}
    for mat, base in SAME.items():
        kit["materials"][mat] = {"same": base}
    wall = {"edge": {"sheet": "seoul_tiles", "tl": [0, wy], "t": [1, wy], "tr": [2, wy], "l": [0, wy + 1],
                     "r": [2, wy + 1], "bl": [0, wy + 2], "b": [1, wy + 2], "br": [2, wy + 2]}, "under": "void"}
    kit["materials"]["wall"] = wall
    kit["room_styles"] = {}   # every room: the plaster walls and the modern floors above
    for (kind, i), r in sorted(pos.items(), key=lambda kv: kv[0]):
        if i == 0:
            kit["kinds"][kind] = []
        kit["kinds"][kind].append(["seoul", *r])
    kit["folk"]["drawn"] = FOLK
    (ROOT / "assets/tk/kits/seoul.json").write_text(json.dumps(kit, indent=1))
    print(f"{len(ims)} sprites ({len(PIECES)} kinds) -> {(OUT / 'pieces.png').relative_to(ROOT)} {sheet.size}; "
          f"{len(TILES)} grounds + walls -> tiles.png; assets/tk/kits/seoul.json")


if __name__ == "__main__":
    main()
