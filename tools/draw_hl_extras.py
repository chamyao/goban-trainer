"""Draw the Red Chamber map pieces (Book 1, world 31), in Jade's outlined pixel style (tools/draw_tk_extras.Grid).

    python3 tools/draw_hl_extras.py     # -> assets/hl/drawn_hl.png, drawn_hl_tiles.png and the kinds in every kit

Places' list is redchamber/book1/assets-needed.md (its briefs in redchamber/book1/plans.py ART). Each piece is drawn
here once and added to jade, xianxia and genshin as sheet "drawn_hl", only where a kit has no art of its own for the
kind (a kit's own art wins). The kinds Jade draws and the other two kits only stand in for (the gatehouse, the grand
hall, the wing) are Jade's own sprites copied onto this sheet. Its own sheet, so drawn_b2.png and every existing
sprite stay as they are. python3 tools/mapfactory/plans.py --world 31 --plans hlm1 --assets FILE lists what is left.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from draw_tk_extras import Grid  # noqa: E402

KITS = ("jade", "xianxia", "genshin")
SHEET, TSHEET = ROOT / "assets/hl/drawn_hl.png", ROOT / "assets/hl/drawn_hl_tiles.png"
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"

TILE, TILE_L, TILE_D, RIDGE = "#4e5462", "#6a7080", "#3a3e4a", "#30343e"   # grey roof tiles
RED, RED_D, RED_L = "#a8283a", "#7a1a28", "#c8404e"
WHITE, WHITE_D = "#e8e4dc", "#c4beb2"
STONE, STONE_L, STONE_D = "#9a9ea6", "#b8bcc2", "#6e727a"
WOOD, WOOD_D, WOOD_L = "#7a4a22", "#5a3418", "#9a6a3a"
GOLD, GOLD_D = "#e6c14a", "#a8842a"


def _roof(g, x0, x1, y0, y1, flare=2):
    """A grey tiled roof from x0 to x1, y0 to y1: a dark ridge, rows of tiles, the eaves flared at the corners."""
    g.rect(x0 + flare, y0, x1 - x0 - 2 * flare, 2, RIDGE)
    for y in range(y0 + 2, y1):
        g.rect(x0 + (0 if y > y1 - 3 else 1), y, x1 - x0 - (0 if y > y1 - 3 else 2), 1, TILE_L if (y - y0) % 3 == 0 else TILE)
    for x in range(x0 + 2, x1 - 1, 3):
        g.rect(x, y0 + 2, 1, y1 - y0 - 3, TILE_D)                                    # the tile channels
    g.rect(x0, y1 - 1, x1 - x0, 1, TILE_D)
    g.set(x0 - 1, y1 - 3, TILE); g.set(x1, y1 - 3, TILE)                            # upturned corners
    g.set(x0 - 1, y1 - 4, TILE_L); g.set(x1, y1 - 4, TILE_L)


def _wall(g, x0, x1, top, bottom):
    """A whitewashed wall with a little tiled coping."""
    g.rect(x0, top + 3, x1 - x0, bottom - top - 3, WHITE)
    g.rect(x0, bottom - 3, x1 - x0, 3, WHITE_D)
    g.rect(x0, top, x1 - x0, 2, TILE); g.rect(x0, top + 2, x1 - x0, 1, TILE_D)


# ---------------------------------------------------------------- gates (2 x 1, walked through)

def festoongate():   # 垂花门: a gabled roof over a red doorway, hanging pillars ending in lotus buds, painted beams
    g = Grid(44, 46)
    _wall(g, 0, 7, 16, 46); _wall(g, 37, 44, 16, 46)                                # the courtyard wall either side
    _roof(g, 4, 40, 1, 11, flare=3)
    g.rect(6, 11, 32, 3, "#2e7a5a"); g.rect(6, 11, 32, 1, GOLD)                       # the painted beam: green, gold line
    for x in range(9, 36, 6):
        g.rect(x, 12, 3, 2, "#3a6aa8"); g.set(x + 1, 12, "#f4ead2")                 # blue and white roundels
    g.rect(8, 14, 28, 2, RED_D)                                                     # the lintel
    for x in (6, 36):                                                               # hanging pillars: no foot, a lotus bud
        g.rect(x, 11, 2, 7, RED); g.rect(x - 1, 18, 4, 2, "#e86a7a"); g.set(x, 20, "#e86a7a"); g.set(x + 1, 20, "#c84a5a")
        g.set(x - 1, 17, "#3e8a5a"); g.set(x + 2, 17, "#3e8a5a")
    for x in (9, 33):                                                               # the standing pillars
        g.rect(x, 16, 2, 28, RED); g.rect(x + 1, 16, 1, 28, RED_D)
    for x0 in (11, 29):                                                             # the red leaves, folded open
        g.rect(x0, 16, 4, 28, RED_L); g.rect(x0 + (3 if x0 < 20 else 0), 16, 1, 28, RED_D)
        g.set(x0 + 1, 29, GOLD); g.set(x0 + 2, 29, GOLD)
    g.rect(7, 44, 30, 2, STONE); g.rect(7, 44, 30, 1, STONE_L)                       # the threshold (the gap is open)
    return g.outline().image()


def halfgate():   # 半大门: a small plain gate in a whitewashed wall, half a court gate's height, the leaves open
    g = Grid(36, 30)
    _wall(g, 0, 6, 10, 30); _wall(g, 30, 36, 10, 30)
    _roof(g, 4, 32, 1, 8, flare=2)
    g.rect(5, 8, 26, 2, RED_D)                                                      # the lintel
    for x in (6, 28):
        g.rect(x, 10, 2, 19, "#6a2a22")                                             # the jambs
    for x0 in (8, 24):                                                              # dark red leaves standing open
        g.rect(x0, 10, 4, 19, "#8a2a22"); g.rect(x0 + (3 if x0 < 18 else 0), 10, 1, 19, "#5a1a14")
    g.rect(6, 28, 24, 2, STONE)
    return g.outline().image()


def blackgate():   # 黑油大门: black-lacquered leaves with brass studs, a grey tiled roof, set in a high wall
    g = Grid(56, 48)
    _wall(g, 0, 9, 14, 48); _wall(g, 47, 56, 14, 48)
    _roof(g, 6, 50, 1, 14, flare=3)
    g.rect(8, 14, 40, 3, "#3a2a26"); g.rect(8, 14, 40, 1, "#5a4a44")                # the lintel
    for x in (9, 44):
        g.rect(x, 17, 3, 29, "#4a2620"); g.rect(x + 2, 17, 1, 29, "#2e1612")        # jambs
    g.rect(16, 17, 24, 29, "#241e22")                                               # the passage, dark
    g.rect(16, 40, 24, 6, "#5e5a52"); g.rect(16, 40, 24, 1, "#4a4640")               # its floor
    for x0 in (12, 40):                                                             # the black leaves, standing open
        g.rect(x0, 17, 4, 29, "#1e1c22"); g.rect(x0, 17, 4, 1, "#3a3840")
        for y in range(20, 44, 4):
            for x in (x0 + 1, x0 + 2):
                g.set(x, y, "#d8b050")                                              # brass studs
        g.set(x0 + 1 if x0 < 30 else x0 + 2, 31, "#f0d070")                         # the knocker
    g.rect(8, 46, 40, 2, STONE); g.rect(8, 46, 40, 1, STONE_L)                       # the step
    return g.outline().image()


# ---------------------------------------------------------------- outside

def stonelion():   # 石狮子: a grey stone lion crouching on a carved plinth, mouth open, a paw on a ball
    g = Grid(32, 38)
    g.rect(3, 27, 26, 10, STONE); g.rect(3, 27, 26, 2, STONE_L); g.rect(24, 29, 5, 8, STONE_D)   # the plinth
    for x in range(5, 23, 4):
        g.rect(x, 31, 2, 4, STONE_D)                                                # carved panels
    lion, lionL, lionD = "#aeb2b8", "#ccd0d4", "#7e828a"
    g.ellipse(18, 21, 9, 6.5, lion); g.ellipse(21, 23, 6, 4, lionD)                 # the body, haunch shadowed
    g.rect(24, 12, 3, 5, lion); g.set(27, 11, lion); g.set(26, 10, lionD)          # the tail curling up
    g.rect(9, 18, 4, 9, lion); g.rect(9, 18, 1, 9, lionL)                           # a foreleg
    g.rect(17, 20, 4, 7, lionD)                                                     # the far foreleg
    g.ellipse(6.5, 24, 3.5, 3.5, lion); g.ellipse(6.5, 24, 3.5, 3.5, lionD, ring=.55)   # the ball, its carved ring
    g.rect(5, 20, 5, 2, lionL)                                                      # the paw on it
    g.ellipse(13, 10, 9.5, 8.5, lionD)                                              # the mane
    for x, y in ((5, 6), (8, 3), (12, 1), (16, 2), (20, 4), (22, 8), (4, 11), (22, 13), (6, 15), (19, 16)):
        g.ellipse(x, y, 1.8, 1.8, lion); g.set(x, y, lionL)                         # its curls
    g.ellipse(13, 10.5, 6.5, 5, lionL)                                              # the broad face
    for ex in (10, 16):
        g.rect(ex - 1, 7, 3, 3, "#f4f0e8"); g.rect(ex, 8, 2, 2, "#2a2a32")          # round bulging eyes
        g.rect(ex - 2, 6, 4, 1, lionD)                                              # heavy curled brows
    g.rect(12, 10, 3, 2, lionD)                                                     # the broad nose
    g.rect(9, 13, 9, 3, "#5a2a2a"); g.rect(10, 14, 7, 1, "#8a3a3a")                 # the wide open mouth
    g.set(9, 13, "#f4f0e8"); g.set(17, 13, "#f4f0e8"); g.set(9, 15, "#f4f0e8"); g.set(17, 15, "#f4f0e8")   # fangs
    return g.outline().image()


def sedan():   # 轿子: a dark wooden box set down, a curtained front, gauze side windows, a little domed roof, two poles
    g = Grid(34, 36)
    g.rect(0, 29, 34, 2, WOOD_L); g.rect(0, 31, 34, 1, WOOD_D)                       # the near pole, on the ground
    g.rect(2, 26, 31, 2, WOOD)                                                      # the far pole
    g.rect(8, 11, 15, 21, "#4a2a1a"); g.rect(23, 12, 6, 19, "#3a2014")              # the box: front, side
    g.ellipse(18, 9, 11, 4.5, "#3a2a26"); g.ellipse(18, 8, 9, 3, "#5a4a44")         # the domed roof
    g.rect(17, 1, 2, 4, GOLD); g.set(17, 0, "#fff2a0")                              # its finial
    g.rect(10, 14, 11, 17, "#2e5a7a"); g.rect(10, 14, 11, 2, GOLD)                   # the front curtain, blue, gold valance
    for x in (12, 15, 18):
        g.rect(x, 16, 1, 15, "#264a66")                                             # its folds
    g.rect(24, 16, 4, 6, "#c8d8c0"); g.rect(25, 16, 1, 6, "#9ab09a"); g.rect(24, 19, 4, 1, "#9ab09a")   # gauze window
    return g.outline().image()


def greencart():   # 翠幄青绸车: a two-wheeled cart under a green silk canopy and curtains, the shafts on the ground
    g = Grid(50, 38)
    for y0 in (30, 33):
        for x in range(0, 16):
            g.set(x, y0 + (15 - x) // 6 - 2, WOOD)                                   # the shafts, sloping to the ground
    g.rect(13, 18, 30, 9, WOOD_D); g.rect(13, 18, 30, 1, WOOD_L)                     # the bed
    g.ellipse(28, 9, 16, 9, "#3e8a5a"); g.rect(12, 9, 32, 10, "#3e8a5a")            # the canopy
    g.ellipse(28, 8, 13, 6, "#5aaa7a")
    for x in range(14, 43, 5):
        g.rect(x, 10, 1, 9, "#2e6a46")                                              # silk folds
    g.rect(12, 18, 32, 1, GOLD)                                                     # a gold edge
    g.rect(15, 12, 6, 7, "#2a4a36")                                                 # the front, curtained
    g.ellipse(32, 28, 8, 8, "#6a4a2a"); g.ellipse(32, 28, 8, 8, "#4a3018", ring=.7)   # the wheel
    for dx, dy in ((0, -6), (0, 6), (-6, 0), (6, 0), (-4, -4), (4, 4), (-4, 4), (4, -4)):
        g.set(32 + dx, 28 + dy, "#4a3018")
    g.ellipse(32, 28, 1.6, 1.6, "#3a2414")
    return g.outline().image()


def bench():   # 大板凳: a long plain wooden bench against a wall by a gate
    g = Grid(64, 12)
    g.rect(1, 3, 62, 3, WOOD_L); g.rect(1, 3, 62, 1, "#b88a4a"); g.rect(1, 6, 62, 1, WOOD)
    for x in (4, 30, 57):
        g.rect(x, 7, 2, 4, WOOD_D); g.rect(x + 1, 7, 1, 4, WOOD)
    return g.outline().image()


def birdcage():   # a round bamboo cage with a green parrot, hung from a hook under the eaves
    g = Grid(16, 26)
    g.rect(7, 0, 2, 4, "#4a4a52"); g.set(8, 4, "#4a4a52")                           # the hook
    g.ellipse(8, 13, 6.5, 8, "#dde6d6")                                             # the air inside
    for x in (2, 4, 6, 8, 10, 12, 14):
        for y in range(5, 21):
            if ((x + .5 - 8) / 6.5) ** 2 + ((y + .5 - 13) / 8) ** 2 <= 1:
                g.set(x, y, "#c8a060")                                              # bamboo bars
    g.ellipse(8, 6, 4, 1.5, "#a8803a")                                              # the top
    g.rect(7, 12, 3, 5, "#3aaa4a"); g.set(8, 11, "#3aaa4a"); g.set(9, 11, "#3aaa4a")  # the parrot
    g.set(10, 12, "#e84a2a"); g.set(8, 12, "#1c1418"); g.set(7, 16, "#2a8a3a")
    g.rect(5, 15, 7, 1, WOOD)                                                       # its perch
    g.rect(1, 20, 15, 2, "#8a6a3a"); g.rect(2, 22, 13, 1, "#6a4a22")                # the base ring
    return g.outline().image()


def toyload():   # a hawker's carrying pole set down across two flat baskets of toys
    g = Grid(38, 22)
    for cx in (9, 29):
        g.ellipse(cx, 16, 8.5, 4.5, "#9a7442"); g.ellipse(cx, 15, 7.5, 3.2, "#b8925a")   # the baskets
        for x in range(cx - 7, cx + 8, 2):
            g.set(x, 18, "#7a5a32")                                                 # weave
    toys = [(5, 13, "#c8392c"), (7, 12, "#3a6aa8"), (12, 13, "#e6c14a"), (24, 13, "#e8a040"), (27, 12, "#f4ead2"), (33, 13, "#3aaa4a")]
    for x, y, c in toys:
        g.rect(x, y, 2, 3, c); g.set(x, y - 1, "#f2c79c")                           # clay figures, sugar figures
    g.rect(9, 11, 3, 3, "#c8283c"); g.rect(9, 11, 3, 1, "#f4ead2")                   # a little drum
    g.rect(30, 3, 1, 10, WOOD)                                                      # a paper windmill on its stick
    for dx, dy, c in ((-2, -1, "#e84a6a"), (1, -2, "#4ac8e8"), (2, 1, "#e8d84a"), (-1, 2, "#6ae86a")):
        g.rect(30 + dx, 3 + dy, 2, 2, c)
    g.rect(1, 10, 36, 1, "#8a6a3a"); g.rect(1, 9, 36, 1, "#a8844a")                # the pole, laid across
    return g.outline().image()


# ---------------------------------------------------------------- inside

def kang():   # 炕: a raised brick platform under a red felt rug, a low kang table with tea things, bolsters behind
    g = Grid(48, 36)
    g.rect(0, 25, 48, 11, "#9a6a52")                                                # the brick front
    for y in (28, 31, 34):
        g.rect(0, y, 48, 1, "#7a4a3a")
    for y in (25, 28, 31):
        for x in range(3 + (y % 2) * 3, 48, 6):
            g.rect(x, y + 1, 1, 2, "#7a4a3a")                                       # mortar
    g.rect(6, 30, 5, 6, "#2a1a14"); g.rect(7, 29, 3, 1, "#2a1a14"); g.set(8, 34, "#c85a2a")   # the stoke hole
    g.rect(0, 22, 48, 3, "#b89a6a")                                                 # the wooden edge
    g.rect(0, 6, 48, 16, "#a83a32"); g.rect(2, 8, 44, 12, "#b8463c")                 # the red felt rug
    g.rect(2, 8, 44, 1, GOLD_D); g.rect(2, 19, 44, 1, GOLD_D)
    for x in (4, 20, 36):
        g.ellipse(x + 4, 3.5, 4, 2.5, "#4a6a8a"); g.ellipse(x + 4, 3, 3, 1.5, "#6a8aaa")   # bolsters at the back
    g.rect(15, 10, 18, 7, "#5a2418"); g.rect(15, 10, 18, 2, "#7a3020")               # the low kang table
    g.rect(16, 17, 2, 3, "#3a160e"); g.rect(30, 17, 2, 3, "#3a160e")
    g.rect(19, 9, 3, 2, "#f4f4f0"); g.set(20, 8, "#3a6aa8")                          # a covered cup
    g.ellipse(26.5, 9, 2.5, 2, "#e8e8e4"); g.set(29, 8, "#e8e8e4"); g.set(26, 7, "#3a6aa8")   # the teapot
    return g.outline().image()


def cushion():   # 锦褥: a deep red brocade cushion with gold roundels, lying flat
    g = Grid(16, 10)
    g.rect(1, 2, 14, 7, RED); g.rect(2, 1, 12, 1, RED); g.rect(1, 2, 14, 1, RED_L); g.rect(1, 8, 14, 1, RED_D)
    for x, y in ((4, 4), (11, 4), (7, 6)):
        g.rect(x, y, 2, 2, GOLD); g.set(x, y, "#f6e08a")
    return g.outline().image()


def clock():   # 自鸣钟: a western striking clock in a carved box on a red pillar, its brass weight swinging below
    g = Grid(16, 36)
    g.rect(5, 0, 6, 34, RED); g.rect(9, 0, 2, 34, RED_D); g.rect(5, 0, 1, 34, RED_L)   # the pillar, to the floor
    g.rect(3, 33, 10, 3, STONE); g.rect(3, 33, 10, 1, STONE_L)                       # its stone base
    g.rect(2, 4, 12, 11, "#6a3a1a"); g.rect(2, 4, 12, 1, "#8a5a2a"); g.rect(3, 3, 10, 1, GOLD_D)   # the carved box
    g.set(2, 3, GOLD); g.set(13, 3, GOLD)
    g.ellipse(8, 9.5, 3.6, 3.6, "#f4ead2"); g.ellipse(8, 9.5, 3.6, 3.6, GOLD_D, ring=.75)   # the dial
    g.rect(8, 7, 1, 3, "#1c1418"); g.rect(8, 9, 2, 1, "#1c1418")                    # its hands
    g.rect(7, 15, 2, 9, GOLD); g.rect(8, 15, 1, 9, GOLD_D)                          # the rod
    g.rect(6, 24, 4, 1, "#d8b050"); g.rect(5, 25, 6, 3, "#c8a03a"); g.rect(6, 28, 4, 1, GOLD_D)   # the steelyard weight
    g.set(6, 25, "#f0d070")
    return g.outline().image()


def plaque():   # 匾: a great horizontal plaque, blue ground, a frame of gold dragons, 荣禧堂 in gold
    W, H = 48, 18
    g = Grid(W, H)
    g.rect(0, 0, W, H, GOLD); g.rect(2, 2, W - 4, H - 4, "#1e3a6a")
    for x in range(1, W - 1, 3):
        g.set(x, 0, GOLD_D); g.set(x + 1, H - 1, GOLD_D)                            # the dragons' scales along the frame
    for y in range(2, H - 2, 3):
        g.set(0, y, GOLD_D); g.set(W - 1, y + 1, GOLD_D)
    g.rect(1, 1, 3, 3, "#f6e08a"); g.rect(W - 4, 1, 3, 3, "#f6e08a")                 # dragon heads at the top corners
    im = g.outline().image()
    txt = Image.new("L", (W, H))
    font = ImageFont.truetype(FONT, 12, index=1)                                    # the Sharp face: crisp at this size
    d = ImageDraw.Draw(txt)
    for i, ch in enumerate("荣禧堂"):
        d.text((5 + i * 13, 2), ch, font=font, fill=255)
    px, tp = im.load(), txt.load()
    for y in range(3, H - 3):
        for x in range(3, W - 3):
            if tp[x, y] > 110:
                px[x, y] = (240, 200, 80, 255)
    return im


def handwarmer():   # 手炉: a little round brass hand-warmer with a pierced lid, its tiny tongs beside it
    g = Grid(14, 12)
    g.ellipse(6, 7.5, 5, 3.5, "#c8a03a"); g.ellipse(6, 6, 4, 2, "#e6c86a")
    for x, y in ((4, 6), (6, 5), (8, 6), (5, 7), (7, 7)):
        g.set(x, y, "#6a4a1a")                                                      # the pierced lid
    for x in range(2, 11):
        g.set(x, 2 + abs(x - 6) // 2, "#a8842a")                                    # the handle
    g.rect(12, 4, 1, 7, "#b8925a"); g.set(13, 5, "#b8925a")                         # the tongs
    return g.outline().image()


def _mix(a, b, t):
    a, b = [int(a[i:i + 2], 16) for i in (1, 3, 5)], [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#%02x%02x%02x" % tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def gauze():   # 碧纱橱: green gauze stretched in a carved red-lacquer frame, a bed glimpsed through it
    W, H = 48, 32
    g = Grid(W, H)
    green = "#8acaa0"
    # behind the gauze: the bed's dark frame and pale bedding, seen through the green
    g.rect(3, 6, 42, 24, _mix("#c8d8c8", green, .55))
    g.rect(6, 16, 36, 10, _mix("#5a2a1a", green, .5)); g.rect(8, 13, 32, 5, _mix("#f4ead2", green, .5))
    g.rect(10, 13, 8, 3, _mix("#e8a0b0", green, .5))
    for x in (13, 33):
        g.rect(x, 6, 1, 24, _mix("#a8d8b8", green, .3))                            # the gauze's seams
    g.rect(0, 0, W, 5, RED_D); g.rect(1, 1, W - 2, 3, RED)                          # the carved top rail
    for x in range(3, W - 2, 4):
        g.set(x, 2, GOLD)
    for x in (0, 22, W - 3):
        g.rect(x, 5, 3, H - 6, RED); g.rect(x + 2, 5, 1, H - 6, RED_D)              # posts
    g.rect(0, H - 2, W, 2, RED_D)
    return g.outline().image()


def curtain():   # a hanging bead curtain: a rod and strings of red, gold and white beads
    g = Grid(16, 26)
    g.rect(0, 0, 16, 2, WOOD); g.rect(0, 0, 16, 1, WOOD_L)
    beads = ("#c8392c", "#e6c14a", "#f4ead2")
    for i, x in enumerate(range(1, 16, 2)):
        n = 20 + (2 if i % 3 == 1 else 0) - (2 if i % 3 == 2 else 0)
        for y in range(2, 2 + n):
            g.set(x, y, beads[(y + i) % 3] if y % 2 else "#8a6a4a")
    return g.outline().image()


def hearth():   # a brick kitchen stove with an iron pot on it and a fire in its mouth (Jade had only a campfire)
    g = Grid(32, 26)
    g.rect(24, 0, 5, 9, "#8a5a42"); g.rect(24, 0, 5, 1, "#3a2a26")                  # the chimney
    g.rect(1, 9, 30, 16, "#9a6a52"); g.rect(1, 6, 30, 4, "#7a7468"); g.rect(1, 6, 30, 1, "#9a948a")   # body, top
    for y in (13, 17, 21):
        g.rect(1, y, 30, 1, "#7a4a3a")
    g.ellipse(11, 7, 7, 2.5, "#3a3a42"); g.ellipse(11, 6.5, 5, 1.5, "#56565e")       # the pot
    g.rect(7, 16, 8, 8, "#2a1a14"); g.rect(8, 15, 6, 1, "#2a1a14")                  # the fire mouth
    g.rect(8, 19, 6, 5, "#ff8a2a"); g.rect(9, 20, 4, 3, "#ffc84a"); g.set(10, 21, "#fff2a0")
    return g.outline().image()


def lattice_tile(v):   # wall.lattice: wooden lattice panels on a stone sill, the court seen through the gaps
    im = Image.new("RGBA", (16, 16), (184, 180, 168, 255))
    px = im.load()
    wood, dark = (122, 74, 34, 255), (90, 52, 24, 255)
    for y in range(16):
        for x in range(16):
            if x in (0, 15) or y in (0, 15) or (x - 1) % 5 == 0 or (y - 1 + (2 if v else 0)) % 5 == 0:
                px[x, y] = dark if x in (0, 15) or y in (0, 15) else wood
    for x in range(16):
        px[x, 14] = (110, 114, 122, 255); px[x, 15] = (90, 94, 102, 255)              # the sill
    return im


def _jade(kind, i):   # Jade's own sprite, copied for the kits that only stand in for it
    kit = json.loads((ROOT / "assets/tk/kits/jade.json").read_text())
    sheet, x, y, w, h = kit["kinds"][kind][i]
    return Image.open(ROOT / kit["sheets"][sheet]).convert("RGBA").crop((x, y, x + w, y + h))


PIECES = {
    "building.festoongate": festoongate, "building.halfgate": halfgate, "building.blackgate": blackgate,
    "landmark.stonelion": stonelion, "prop.sedan": sedan, "prop.greencart": greencart, "prop.bench": bench,
    "prop.birdcage": birdcage, "prop.toyload": toyload, "furn.kang": kang, "furn.cushion": cushion,
    "furn.clock": clock, "furn.plaque": plaque, "furn.handwarmer": handwarmer, "furn.gauze": gauze,
    "furn.curtain": curtain, "furn.hearth": hearth,
}
COPIED = {"building.gatehouse": 1, "building.hall_grand": 2, "building.wing": 2}   # Jade's kinds and how many variants
TILES = {"wall.lattice": [lattice_tile(0), lattice_tile(1)]}


def main():
    ims = {(k, 0): f() for k, f in PIECES.items()}
    for k, n in COPIED.items():
        for i in range(n):
            ims[(k, i)] = _jade(k, i)
    W, x, y, rowh, pos = 256, 0, 0, 0, {}
    for key, im in sorted(ims.items(), key=lambda kv: (-kv[1].height, kv[0])):   # rows by height, 1 px apart
        if x + im.width > W:
            x, y, rowh = 0, y + rowh + 1, 0
        pos[key] = [x, y, im.width, im.height]
        x += im.width + 1
        rowh = max(rowh, im.height)
    sheet = Image.new("RGBA", (W, y + rowh))
    for key, (px, py, _, _) in pos.items():
        sheet.alpha_composite(ims[key], (px, py))
    SHEET.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(SHEET)
    tsheet = Image.new("RGBA", (32, 16 * len(TILES)))
    tpos = {}
    for row, (mat, tiles) in enumerate(TILES.items()):
        for col, im in enumerate(tiles):
            tsheet.alpha_composite(im, (col * 16, row * 16))
        tpos[mat] = [["drawn_hl_tiles", col, row, 1] for col in range(len(tiles))]
    tsheet.save(TSHEET)
    for name in KITS:
        path = ROOT / "assets/tk/kits" / f"{name}.json"
        kit = json.loads(path.read_text())
        kit["sheets"]["drawn_hl"] = str(SHEET.relative_to(ROOT))
        kit["sheets"]["drawn_hl_tiles"] = str(TSHEET.relative_to(ROOT))
        for mat, tiles in tpos.items():
            if mat not in kit["materials"] or "drawn_hl_tiles" in str(kit["materials"][mat]):
                kit["materials"][mat] = {"tiles": tiles}
        for kind in sorted({k for k, _ in pos}):
            mine = [v for v in kit["kinds"].get(kind, []) if v[0] != "drawn_hl"]
            if not mine:   # the kit's own art wins
                kit["kinds"][kind] = [["drawn_hl", *pos[(k, i)]] for k, i in sorted(pos) if k == kind]
        path.write_text(json.dumps(kit, indent=1))
    print(f"{len(ims)} sprites -> {SHEET.relative_to(ROOT)} ({sheet.width}x{sheet.height}), in {', '.join(KITS)}")


if __name__ == "__main__":
    main()
