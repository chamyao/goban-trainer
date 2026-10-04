"""Cut the Jade pack's ground tiles into assets/tk/jade/tiles.png.

The Jade kit (assets/tk/kits/jade.json, sheet "tiles") uses this strip:
grass, darker grass, dirt path, stone square, tilled field.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
JADE = ROOT / "assets/tk/jade"
T = 16

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
print((JADE / "tiles.png").relative_to(ROOT))
