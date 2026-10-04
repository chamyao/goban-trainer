"""Edge tiles for the Jade kit: paths, sand and ponds that meet the grass
with a ragged, shaded edge instead of a square one.

    python3 tools/build_jade_edges.py   →  assets/tk/jade/edges.png

The Jade pack has ground tiles but no transitions, so this composes them
from the pack's own pixels: for each of the 47 ways a tile can sit among
its neighbours (the "blob" set), the path tile with the pack's grass laid
over every side that faces grass, along an irregular line, with a line of
shade where the grass overhangs. The map compiler (tools/mapfactory/
compile.py) reads which sides each tile has from its border pixels, so the
sheet needs no index: jade.json just points each material at its block.

Blocks, each 10 x 10 tiles (two variants of every pattern), side by side:
dirt (from tiles.png #2), sand (#3), water (drawn.png, with a light rim).
"""
import random
from itertools import product
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
T = 16
ORDER = ["N", "E", "S", "W", "NE", "SE", "SW", "NW"]
CORNERS = {"NE": ("N", "E"), "SE": ("S", "E"), "SW": ("S", "W"), "NW": ("N", "W")}


def tile(im, i, j=0):
    return im.crop((i * T, j * T, i * T + T, j * T + T)).convert("RGBA")


def sigs():
    """The 47 blob patterns: which neighbours are the same material."""
    out = set()
    for bits in product((0, 1), repeat=8):
        s = {k for k, b in zip(ORDER, bits) if b}
        for c, (a, b) in CORNERS.items():
            if c in s and not (a in s and b in s):
                s.discard(c)
        out.add(frozenset(s))
    return sorted(out, key=lambda s: (len(s), sorted(s)))


def mask(sig, rng):
    """1 where the grass covers the tile: a ragged band along each open side
    and a rounded notch in each open corner between two closed sides."""
    m = [[0] * T for _ in range(T)]
    depth = {}
    for side in "NESW":
        # a wobbly depth along the side, 2-5 px, changing smoothly
        d, row = rng.choice((3, 4)), []
        for _ in range(T):
            d = max(2, min(5, d + rng.choice((-1, 0, 0, 1))))
            row.append(d)
        depth[side] = row
    for y in range(T):
        for x in range(T):
            if "N" not in sig and y < depth["N"][x]:
                m[y][x] = 1
            if "S" not in sig and T - 1 - y < depth["S"][x]:
                m[y][x] = 1
            if "W" not in sig and x < depth["W"][y]:
                m[y][x] = 1
            if "E" not in sig and T - 1 - x < depth["E"][y]:
                m[y][x] = 1
    for c, (a, b) in CORNERS.items():
        if a not in sig and b not in sig:          # an outer corner: round it off
            cx = T - 1 if "E" in c else 0
            cy = T - 1 if "S" in c else 0
            sx, sy = (-1 if cx else 1), (-1 if cy else 1)
            r = rng.choice((6, 7))
            ox, oy = cx + sx * (depth[b][0 if cy == 0 else T - 1] + r), cy + sy * (depth[a][0 if cx == 0 else T - 1] + r)
            for y in range(T):
                for x in range(T):
                    if (x - ox) * sx < 0 and (y - oy) * sy < 0 and (x - ox) ** 2 + (y - oy) ** 2 > r * r:
                        m[y][x] = 1
        if a in sig and b in sig and c not in sig:
            cx = T - 1 if "E" in c else 0
            cy = T - 1 if "S" in c else 0
            r = rng.choice((3, 4))
            for y in range(T):
                for x in range(T):
                    if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + rng.choice((0, 1, 2)):
                        m[y][x] = 1
    return m


def compose(inner, grass, m, shade, rim=None):
    out = inner.copy()
    px, g = out.load(), grass.load()
    for y in range(T):
        for x in range(T):
            if m[y][x]:
                px[x, y] = g[x, y]
    # shade the inner pixels just under the grass edge (light falls from above-left)
    for y in range(T):
        for x in range(T):
            if m[y][x]:
                continue
            near = [(x, y - 1), (x - 1, y), (x + 1, y), (x, y + 1)]
            if any(0 <= a < T and 0 <= b < T and m[b][a] for a, b in near):
                r, gg, bb, al = px[x, y]
                if rim and any(0 <= a < T and 0 <= b < T and m[b][a] for a, b in near[2:]):
                    px[x, y] = rim
                else:
                    px[x, y] = (int(r * shade), int(gg * shade), int(bb * shade), al)
    return out


def block(inner, grass, seed, shade, rim=None):
    rng = random.Random(seed)
    S = sigs()
    im = Image.new("RGBA", (10 * T, 10 * T))
    i = 0
    for s in S:
        for _ in range(2):
            m = mask(s, rng)
            im.paste(compose(inner, grass, m, shade, rim), ((i % 10) * T, (i // 10) * T))
            i += 1
            if not any(any(r) for r in m):   # the full tile: one is enough
                break
    return im


def main():
    tiles = Image.open(ROOT / "assets/tk/jade/tiles.png").convert("RGBA")
    drawn = Image.open(ROOT / "assets/tk/drawn.png").convert("RGBA")
    grass = tile(tiles, 0)
    blocks = [
        block(tile(tiles, 2), grass, 1, .78),                       # dirt path
        block(tile(tiles, 3), grass, 2, .8),                        # sand: stone squares on cream
        block(tile(drawn, 0, 3), grass, 3, .7, rim=(196, 226, 250, 255)),   # water, with a light rim
    ]
    sheet = Image.new("RGBA", (10 * T * len(blocks), 10 * T))
    for i, b in enumerate(blocks):
        sheet.paste(b, (i * 10 * T, 0))
    sheet.save(ROOT / "assets/tk/jade/edges.png")
    print(f"wrote assets/tk/jade/edges.png: {len(sigs())} patterns x {len(blocks)} materials")


if __name__ == "__main__":
    main()
