"""The Red Chamber library card icon (assets/hl/jade.png): Baoyu's jade, 通灵宝玉, on a red silk cord with a tassel.
Pixel art at the Three Kingdoms fan's size (78x64, drawn at 39x32 and doubled). Free; drawn in code."""
from pathlib import Path
from PIL import Image

W, H = 39, 32
OUT = Path(__file__).resolve().parent.parent / "assets/hl/jade.png"
LINE = (40, 22, 26, 255)
JADE = [(214, 240, 214), (178, 222, 184), (132, 196, 150), (92, 160, 118), (62, 120, 88)]   # light to dark
RED, REDD, REDL = (200, 40, 52), (140, 24, 36), (236, 92, 92)
GOLD, GOLDD = (232, 194, 74), (168, 124, 38)

px = {}


def put(x, y, c):
    if 0 <= x < W and 0 <= y < H:
        px[(x, y)] = c


# the cord: a loop from the top, hanging into a knot above the stone
for x, y in [(16, 1), (17, 0), (18, 0), (19, 0), (20, 0), (21, 0), (22, 1), (15, 2), (23, 2), (15, 3), (23, 3),
             (16, 4), (22, 4), (17, 5), (21, 5), (18, 6), (20, 6)]:
    put(x, y, RED)
for x, y in [(17, 1), (21, 1), (16, 3), (22, 3)]:
    put(x, y, REDL)
# the gold knot cap
for x in range(17, 22):
    put(x, 7, GOLD)
    put(x, 8, GOLDD if x in (17, 21) else GOLD)
put(19, 7, (255, 236, 150))

# the stone: an egg, light from the upper left
cx, cy, rx, ry = 19.0, 16.0, 6.0, 7.6
for y in range(8, 25):
    for x in range(10, 29):
        dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
        if dx * dx + dy * dy <= 1:
            lit = -(dx * .7 + dy * .7)            # toward the upper left
            k = 0 if lit > .75 else 1 if lit > .25 else 2 if lit > -.35 else 3 if lit > -.8 else 4
            put(x, y, JADE[k])
# a highlight, and the engraved characters suggested by two short carved strokes
for x, y in [(15, 11), (16, 11), (15, 12)]:
    put(x, y, (248, 255, 248))
for x, y in [(19, 13), (19, 14), (19, 15), (18, 14), (20, 14), (19, 17), (18, 18), (20, 18)]:
    put(x, y, JADE[3])

# the tassel below: a gold bead, then red threads
put(19, 24, GOLD)
for x in range(18, 21):   # the tassel's head, then its threads fanning out
    put(x, 25, RED)
put(19, 25, REDL)
for y in range(26, 31):
    for x in (19 - (y - 25) // 2 * 2, 19, 19 + (y - 25) // 2 * 2):
        put(x, y, REDD if y == 30 else RED)

# outline every lit pixel's empty neighbours
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for (x, y), c in px.items():
    img.putpixel((x, y), c if len(c) == 4 else c + (255,))
for y in range(H):
    for x in range(W):
        if (x, y) in px:
            continue
        if any((x + a, y + b) in px for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            img.putpixel((x, y), LINE)
OUT.parent.mkdir(parents=True, exist_ok=True)
img.resize((W * 2, H * 2), Image.NEAREST).save(OUT)
print(OUT, img.size)
