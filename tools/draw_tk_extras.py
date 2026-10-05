"""Draw the pieces the free packs lack, in Jade's outlined pixel style.

Writes assets/tk/drawn.png, a small sheet the kits use like any pack sheet
(see assets/tk/kits/*.json, sheet "drawn"). Layout, in pixels:

  notice board   0,0    40x34      go table   40,0   22x14
  moon gate      64,0   48x40      water      0,48 and 16,48 (16x16 tiles)
  fire pit       32,48  32x16      gateway    64,48  32x32
  shrine         0,80 dark, 32,80 lit, 64,80 settled (32x30 each)
  ruins (Book 2's burned Luoyang): hall 0,112 64x44   columns 64,112 32x40   rubble 96,112 16x12
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTLINE = (28, 20, 24, 255)


def hexc(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


class Grid:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.c = [[None] * w for _ in range(h)]

    def set(self, x, y, col):
        if 0 <= x < self.w and 0 <= y < self.h and col:
            self.c[y][x] = hexc(col) if isinstance(col, str) else col

    def rect(self, x, y, w, h, col):
        for j in range(h):
            for i in range(w):
                self.set(x + i, y + j, col)

    def ellipse(self, cx, cy, rx, ry, col, ring=None):
        for y in range(self.h):
            for x in range(self.w):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                if d <= 1 and (ring is None or d >= ring):
                    self.set(x, y, col)

    def clear_ellipse(self, cx, cy, rx, ry):
        for y in range(self.h):
            for x in range(self.w):
                if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1:
                    self.c[y][x] = None

    def outline(self):
        add = []
        for y in range(self.h):
            for x in range(self.w):
                if self.c[y][x]:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    X, Y = x + dx, y + dy
                    if 0 <= X < self.w and 0 <= Y < self.h and self.c[Y][X] and self.c[Y][X] != OUTLINE:
                        add.append((x, y))
                        break
        for x, y in add:
            self.c[y][x] = OUTLINE
        return self

    def image(self):
        im = Image.new("RGBA", (self.w, self.h))
        for y in range(self.h):
            for x in range(self.w):
                if self.c[y][x]:
                    im.putpixel((x, y), self.c[y][x])
        return im


def notice_board():
    g = Grid(40, 34)
    wood, woodD, roof, roofD, paper = "#b8742c", "#8a5020", "#c8392c", "#8a2418", "#f4ead2"
    g.rect(1, 3, 38, 3, roof); g.rect(3, 1, 34, 2, roof); g.rect(1, 5, 38, 1, roofD); g.set(0, 4, roof); g.set(39, 4, roof)
    g.rect(4, 6, 3, 27, wood); g.rect(33, 6, 3, 27, wood); g.rect(6, 6, 1, 27, woodD); g.rect(35, 6, 1, 27, woodD)
    g.rect(7, 8, 26, 16, woodD); g.rect(8, 9, 24, 14, wood)
    g.rect(10, 10, 9, 12, paper); g.rect(21, 11, 9, 10, paper)
    for y in range(12, 21, 2):
        g.rect(12, y, 5, 1, "#3a2a22")
        if y < 19:
            g.rect(23, y + 1, 5, 1, "#3a2a22")
    g.rect(13, 20, 3, 1, "#c8392c")
    g.rect(3, 32, 5, 1, woodD); g.rect(32, 32, 5, 1, woodD)
    return g.outline().image()


def go_table():
    g = Grid(22, 14)
    g.rect(1, 1, 20, 9, "#e2b468"); g.rect(1, 10, 20, 1, "#8a5a22")
    for i in range(5):
        g.rect(3 + i * 4, 2, 1, 7, "#7a5228"); g.rect(2, 2 + int(i * 1.6), 18, 1, "#7a5228")
    for x, y, c in [(3, 4, "#222222"), (7, 3, "#ffffff"), (11, 5, "#222222"), (15, 4, "#ffffff"), (7, 7, "#222222"), (15, 7, "#ffffff"), (11, 3, "#ffffff")]:
        g.rect(x, y, 2, 2, c)
    g.rect(2, 11, 2, 2, "#c8903c"); g.rect(18, 11, 2, 2, "#c8903c")
    return g.outline().image()


def moon_gate():  # a white wall with a round gate and a tiled cap
    g = Grid(48, 40)
    wall, wallS, cap, capD = "#ece4d2", "#cfc4ac", "#5b6170", "#3e4350"
    g.rect(1, 6, 46, 33, wall); g.rect(1, 36, 46, 3, wallS)
    g.rect(0, 2, 48, 4, cap); g.rect(0, 5, 48, 1, capD)
    for x in range(1, 47, 3):
        g.set(x, 2, capD)
    g.ellipse(24, 25, 15, 15, "#b8a888", ring=.72)  # stone ring
    g.clear_ellipse(24, 25, 12, 12)
    for y in range(37, 40):
        for x in range(13, 36):
            g.c[y][x] = None
    return g.outline().image()


def water(variant):  # Jade-ish water: flat blue with a few light ripples
    g = Grid(16, 16)
    g.rect(0, 0, 16, 16, "#3f86c8")
    marks = [(2, 3), (9, 6), (4, 11), (12, 13)] if variant == 0 else [(6, 2), (1, 8), (11, 9), (7, 14)]
    for x, y in marks:
        g.rect(x, y, 3, 1, "#8cc4ec"); g.set(x + 1, y - 1, "#cfe8f8")
    return g.image()


def fire_pit():
    g = Grid(32, 16)
    for i, x in enumerate(range(3, 29, 4)):
        g.ellipse(x + 1.5, 12, 2.2, 2, "#8a8a8a" if i % 2 else "#a8a8a8")
    g.rect(9, 9, 14, 3, "#5a3a22")
    g.ellipse(16, 7, 5, 5, "#e8642c"); g.ellipse(16, 8, 3, 3.5, "#f8c040"); g.rect(15, 1, 2, 3, "#e8642c")
    return g.outline().image()


def gateway():  # a simple wooden gateway (pailou) you walk through
    g = Grid(32, 32)
    wood, woodD, roof = "#a8382c", "#7a2418", "#3e4350"
    g.rect(4, 8, 3, 23, wood); g.rect(25, 8, 3, 23, wood); g.rect(6, 8, 1, 23, woodD); g.rect(27, 8, 1, 23, woodD)
    g.rect(1, 4, 30, 3, roof); g.rect(3, 2, 26, 2, roof); g.set(0, 5, roof); g.set(31, 5, roof)
    g.rect(4, 10, 24, 2, wood); g.rect(12, 7, 8, 3, "#e6c14a")
    return g.outline().image()


def shrine(state):
    """The Star Lords' weiqi shrine in each town: a stone stele, a stone board and a bronze burner.
    state: "dark" (cold stone), "lit" (the stones glow, incense burns), "settled" (soft glow, no smoke)."""
    g = Grid(32, 30)
    st, stD, stL = "#8a8e94", "#5e636b", "#b4b8bc"
    lit, settled = state == "lit", state == "settled"
    # the stele behind, with a little tiled cap
    g.rect(5, 6, 10, 14, stD); g.rect(6, 7, 8, 12, st); g.rect(3, 3, 14, 2, "#3e4350"); g.rect(5, 1, 10, 2, "#3e4350")
    g.rect(9, 9, 2, 8, "#d8b04a" if lit else "#c8a860" if settled else stD)   # the carved line (no characters)
    # the plinth
    g.rect(1, 23, 30, 5, stD); g.rect(2, 22, 28, 2, st); g.rect(2, 27, 28, 1, "#4a4e56")
    # the stone board on it: three lines each way, a few stones on the points
    g.rect(3, 14, 18, 9, "#e6dcb4" if lit else stL); g.rect(3, 22, 18, 1, stD)
    line = "#d8a838" if lit else "#c9b98a" if settled else "#7a7e86"
    for x in (6, 11, 16):
        g.rect(x, 15, 1, 7, line)
    for y in (16, 18, 20):
        g.rect(4, y, 16, 1, line)
    for x, y, c in [(5, 15, "#222222"), (10, 17, "#f8f8f8"), (15, 15, "#222222"), (15, 19, "#f8f8f8")]:
        if lit:   # a halo round each stone
            for dx, dy in ((-1, 0), (-1, 1), (2, 0), (2, 1), (0, -1), (1, -1), (0, 2), (1, 2)):
                g.set(x + dx, y + dy, "#8ae8ff")
        g.rect(x, y, 2, 2, "#1a1a1a" if c == "#222222" else c)
    # the bronze burner (a round ding on three legs)
    g.ellipse(25.5, 19, 4, 3, "#8a6a32"); g.rect(21, 16, 9, 1, "#b08a42"); g.rect(22, 15, 1, 1, "#b08a42"); g.rect(28, 15, 1, 1, "#b08a42")
    g.rect(22, 21, 1, 2, "#5a4420"); g.rect(25, 22, 1, 1, "#5a4420"); g.rect(28, 21, 1, 2, "#5a4420")
    for x in (24, 26):
        g.rect(x, 12, 1, 4, "#6a5a48" if state == "dark" else "#c8a070")
        if lit:
            g.set(x, 11, "#ff7a2c")
    img = g.outline().image()
    if lit:   # smoke over the outline: thin grey wisps
        for x, y in ((24, 9), (23, 7), (24, 5), (26, 9), (27, 7), (26, 5), (25, 3), (23, 2)):
            img.putpixel((x, y), (214, 218, 224, 170))
    return img


CHAR, CHARD, ASH, ASHD = "#3a2e2a", "#241c1a", "#8a8682", "#5e5a56"


def ruin_hall():   # a burned hall: the walls stand, the roof is gone, charred beams across the gap
    g = Grid(64, 44)
    g.rect(2, 26, 60, 17, "#6e6660"); g.rect(2, 26, 60, 2, "#4e4844")            # the stone base
    for x in (4, 18, 32, 46, 58):
        top = 6 + (x * 7) % 11
        g.rect(x, top, 4, 26 - top, CHAR); g.rect(x + 3, top, 1, 26 - top, CHARD)  # burnt pillars, broken at odd heights
    g.rect(4, 12, 40, 3, CHARD); g.rect(30, 9, 18, 2, CHAR)                         # beams fallen across
    g.rect(22, 30, 14, 13, "#1c1614")                                             # the empty doorway
    for x, y in ((8, 38), (40, 36), (52, 40), (14, 34)):
        g.rect(x, y, 3, 2, ASH)                                                   # ash and stones on the base
    return g.outline().image()


def ruin_columns():   # two charred columns, one snapped
    g = Grid(32, 40)
    g.rect(4, 4, 6, 33, CHAR); g.rect(8, 4, 2, 33, CHARD); g.rect(3, 2, 8, 3, "#4a3e38")
    g.rect(20, 16, 6, 21, CHAR); g.rect(24, 16, 2, 21, CHARD); g.set(20, 15, CHAR); g.set(23, 14, CHAR); g.set(25, 15, CHAR)
    g.rect(1, 36, 30, 3, "#6e6660")
    for x in (12, 15, 27):
        g.rect(x, 34, 3, 2, ASH)
    return g.outline().image()


def ruin_rubble():   # a heap of stones and burnt timber
    g = Grid(16, 12)
    g.ellipse(8, 9, 7, 3, ASHD); g.ellipse(6, 8, 3, 2, ASH); g.ellipse(11, 8, 3, 2, "#a09c96")
    g.rect(2, 5, 9, 2, CHAR); g.set(12, 4, CHAR)
    return g.outline().image()


def main():
    sheet = Image.new("RGBA", (112, 160))
    sheet.alpha_composite(notice_board(), (0, 0))
    sheet.alpha_composite(go_table(), (40, 0))
    sheet.alpha_composite(moon_gate(), (64, 0))
    sheet.alpha_composite(water(0), (0, 48))
    sheet.alpha_composite(water(1), (16, 48))
    sheet.alpha_composite(fire_pit(), (32, 48))
    sheet.alpha_composite(gateway(), (64, 48))
    for i, state in enumerate(("dark", "lit", "settled")):
        sheet.alpha_composite(shrine(state), (32 * i, 80))
    sheet.alpha_composite(ruin_hall(), (0, 112))
    sheet.alpha_composite(ruin_columns(), (64, 112))
    sheet.alpha_composite(ruin_rubble(), (96, 112))
    out = ROOT / "assets/tk/drawn.png"
    sheet.save(out)
    print(out.relative_to(ROOT))


if __name__ == "__main__":
    main()
