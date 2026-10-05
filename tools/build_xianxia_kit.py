"""Pack the generated Chinese-fantasy pieces into an art kit: assets/tk/kits/xianxia.json.

    python3 tools/build_xianxia_kit.py [SRC]   # SRC: the generated pieces (default assets/tk/gen/xianxia)

The pieces come from tools/gen_pixel.py --set xianxia (Retro Diffusion, prompts in
tools/xianxia_spec.py). Each object is trimmed and fitted to its footprint (the size the Jade
kit's sprite has, so map layouts don't change), shrunk if it came out bigger, and its colours
kept to its own few; then everything is packed into assets/tk/xianxia/objects.png. Ground tiles
go to tiles.png, and the paths, sand and ponds get their ragged grass edges from the same code
the Jade kit uses (tools/build_jade_edges.py). Interiors and townsfolk stay on the Jade kit's art.
Variants the user doesn't like can be dropped by deleting their PNG and running this again.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build_jade_edges import block  # noqa: E402
from xianxia_spec import DRAWN_GROUND, OBJECTS, REDO  # noqa: E402
import random  # noqa: E402

T = 16
OUT = ROOT / "assets/tk/xianxia"
SLACK = 1.15
DROP = {"plant.flower-2"}   # variants not used at all: this one sits on a mound of earth, like a stone basin
DETAIL_SKIP = {"plant.flower-1", "plant.flower-2"}   # flowers read as pebbles at a distance   # a piece may be this much bigger than its footprint before it's shrunk


def quantize_like(small, big, alpha):
    """Keep the shrunk piece to the colours the original used, with hard edges (pixel art)."""
    n = len(big.convert("RGB").getcolors(1 << 16) or []) or 48
    pal = big.convert("RGB").quantize(colors=min(48, max(2, n)), method=Image.Quantize.MEDIANCUT)
    rgb = small.convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE).convert("RGBA")
    a = small.getchannel("A").point(lambda v: 255 if v >= alpha else 0)
    rgb.putalpha(a)
    return rgb


def fit(im, box):
    im = im.convert("RGBA")
    bb = im.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    w, h = box
    s = min(w * SLACK / im.width, h * SLACK / im.height)
    if s < 1:
        small = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.Resampling.BOX)
        im = quantize_like(small, im, 110)
    return im


def tile16(im):
    """A ground tile: 16x16 already, or a bigger seamless texture boxed down (still seamless)."""
    im = im.convert("RGBA")
    if im.size != (T, T):
        im = quantize_like(im.resize((T, T), Image.Resampling.BOX), im, 0)
    return im


# drawn ground, in colours taken from the generated trees and buildings: muted jade grass,
# warm earth, pale sand, teal water
COL = {
    "grass": [(104, 140, 86), (94, 128, 78), (116, 152, 94), (84, 116, 72), (130, 164, 102)],
    "dirt": [(176, 146, 104), (162, 132, 94), (190, 160, 118), (146, 118, 84)],
    "sand": [(222, 206, 166), (210, 194, 154), (232, 218, 182), (196, 180, 142)],
    "water": [(86, 150, 156), (78, 140, 148), (104, 168, 172), (140, 196, 196)],
}


def ground_tile(mat, seed):
    """A seamless 16x16 tile: the base colour, speckled with its darker and lighter shades, and on
    grass a few short blades; water gets short ripple lines instead."""
    rnd = random.Random(f"{mat}/{seed}")
    c = COL[mat]
    im = Image.new("RGBA", (T, T), c[0] + (255,))
    px = im.load()
    for _ in range(40 if mat != "water" else 10):
        x, y = rnd.randrange(T), rnd.randrange(T)
        px[x, y] = rnd.choice(c[1:3]) + (255,)
    if mat == "grass":
        for _ in range(rnd.choice((2, 3, 4))):   # a blade: dark root, light tip
            x, y = rnd.randrange(T), rnd.randrange(1, T)
            px[x, y] = c[3] + (255,)
            px[x, (y - 1) % T] = c[4] + (255,)
    if mat == "dirt":
        for _ in range(2):                       # a pebble
            x, y = rnd.randrange(T), rnd.randrange(T)
            px[x, y], px[(x + 1) % T, y] = c[2] + (255,), c[3] + (255,)
    if mat == "water":
        for _ in range(2):                       # a ripple
            x, y = rnd.randrange(T), rnd.randrange(T)
            for k in range(rnd.choice((3, 4, 5))):
                px[(x + k) % T, y] = c[3] + (255,)
    return im


def variants(src, name):
    return sorted(src.glob(f"{name}-*.png"), key=lambda p: int(p.stem.rsplit("-", 1)[1]))


def pack(items, width=512):
    """Shelf-pack (name, image) pairs; returns the sheet and name -> [x, y, w, h]."""
    x = y = shelf = 0
    pos = {}
    for name, im in sorted(items, key=lambda it: -it[1].height):
        if x + im.width > width:
            x, y, shelf = 0, y + shelf + 1, 0
        pos[name] = [x, y, im.width, im.height]
        x += im.width + 1
        shelf = max(shelf, im.height)
    sheet = Image.new("RGBA", (width, y + shelf))
    for name, im in items:
        sheet.alpha_composite(im, tuple(pos[name][:2]))
    return sheet, pos


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets/tk/gen/xianxia"
    OUT.mkdir(parents=True, exist_ok=True)
    kit = json.loads((ROOT / "assets/tk/kits/jade.json").read_text())

    # ground: a row of 16x16 tiles per material
    ground = {m: [ground_tile(m, i) for i in range(4 if m == "grass" else 2)] for m in DRAWN_GROUND}
    # and a last row of grass detail (tufts, flowers), each centred on a clear tile
    detail = []
    for kind in ("plant.grass", "plant.flower"):
        for p in variants(src, kind):
            if p.stem in DETAIL_SKIP:   # drawn on its own patch of earth: reads as a stone from afar
                continue
            im = fit(Image.open(p), (12, 12))
            cell = Image.new("RGBA", (T, T))
            cell.alpha_composite(im, ((T - im.width) // 2, T - im.height))
            detail.append(cell)
    cols = max([len(v) for v in ground.values()] + [len(detail)])
    tiles = Image.new("RGBA", (cols * T, (len(ground) + 1) * T))
    row = {}
    for j, (m, v) in enumerate(ground.items()):
        row[m] = j
        for i, t in enumerate(v):
            tiles.paste(t, (i * T, j * T))
    for i, t in enumerate(detail):
        tiles.paste(t, (i * T, len(ground) * T))
    tiles.save(OUT / "tiles.png")

    # edges where paths, sand and water meet the grass (Jade's code, our tiles)
    grass = ground["grass"][0]
    edged = [(m, shade, rim) for m, shade, rim in (("dirt", .78, None), ("sand", .8, None),
                                                   ("water", .7, (196, 226, 236, 255))) if m in ground]
    edges = Image.new("RGBA", (10 * T * len(edged), 10 * T))
    for i, (m, shade, rim) in enumerate(edged):
        edges.paste(block(ground[m][0], grass, i + 1, shade, rim), (i * 10 * T, 0))
    edges.save(OUT / "edges.png")

    # objects
    items, made = [], {}
    for kind, (_, box, _) in OBJECTS.items():
        if kind in REDO:
            continue
        for k, p in enumerate(v for v in variants(src, kind) if v.stem not in DROP):
            items.append((f"{kind}#{k}", fit(Image.open(p), box)))
            made.setdefault(kind, []).append(f"{kind}#{k}")
    sheet, pos = pack(items)
    sheet.save(OUT / "objects.png")

    # the kit: Jade's, with the outdoors swapped for ours
    kit.update(kit="xianxia", name="Xianxia",
               credit="Outdoor ground and objects generated for the game with Retro Diffusion (tools/gen_pixel.py, "
                      "tools/xianxia_spec.py); interiors and townsfolk from the Jade kit: " + kit["credit"])
    kit["sheets"].update(x_tiles="assets/tk/xianxia/tiles.png", x_edges="assets/tk/xianxia/edges.png",
                         x_objects="assets/tk/xianxia/objects.png")
    kit["materials"]["grass"] = {"tiles": [["x_tiles", i, row["grass"], 3 if i == 0 else 1]
                                           for i in range(len(ground["grass"]))]}
    for i, (m, _, _) in enumerate(edged):
        kit["materials"][m] = {"blob": ["x_edges", i * 10, 0, 10, 10], "inside": [i * 10 + 2, 9],
                               "outside": ["x_tiles", 0, row["grass"]]}
    for kind, names in made.items():
        kit["kinds"][kind] = [["x_objects", *pos[n]] for n in names]
    if detail:   # the scatter on the grass: our tufts and flowers
        kit["detail"] = {"tiles": [["x_tiles", i, len(ground), 1] for i in range(len(detail))],
                         "density": kit["detail"]["density"]}
    (ROOT / "assets/tk/kits/xianxia.json").write_text(json.dumps(kit, indent=1))
    missing = sorted(k for k in OBJECTS if k not in made)
    print(f"xianxia kit: {sum(len(v) for v in ground.values())} ground tiles, {len(edged)} edge sets, "
          f"{len(items)} object sprites for {len(made)} kinds" + (f"; still Jade's: {', '.join(missing)}" if missing else ""))


if __name__ == "__main__":
    main()
