"""Pack the generated Chinese-fantasy pieces into an art kit: assets/tk/kits/xianxia.json.

    python3 tools/build_xianxia_kit.py [GEN]   # GEN: the folder holding the generated batches
                                               # (default assets/tk/gen: xianxia, xianxia-redo, ...)
    python3 tools/build_xianxia_kit.py [GEN] --genshin   # the isometric Genshin kit (kits/genshin.json):
                                               # GEN/genshin's pieces, xianxia's where it has none yet

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
from xianxia_spec import PROPS_GEN, PROPS_SKIP, CHAR_PICK, DRAWN_GROUND, HERO_H, INTERIOR, OBJECTS, REDO  # noqa: E402
import random  # noqa: E402

T = 16
GENSHIN = "--genshin" in sys.argv
LOOK = "genshin" if GENSHIN else "xianxia"
OUT = ROOT / f"assets/tk/{LOOK}"
SLACK = 1.15
DROP = {"plant.flower-2", "furn.rug-1", "prop.post-1", "landmark.shrine-1", "prop.mirror-1", "prop.cagecart-2"}   # variants not used at all: this one sits on a mound of earth, like a stone basin
DETAIL_SKIP = {"plant.flower-1", "plant.flower-2"}   # flowers read as pebbles at a distance   # a piece may be this much bigger than its footprint before it's shrunk


def quantize_like(small, big, alpha):
    """Keep the shrunk piece to the colours the original used, with hard edges (pixel art)."""
    n = len(big.convert("RGB").getcolors(1 << 16) or []) or 48
    pal = big.convert("RGB").quantize(colors=min(48, max(2, n)), method=Image.Quantize.MEDIANCUT)
    rgb = small.convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE).convert("RGBA")
    a = small.getchannel("A").point(lambda v: 255 if v >= alpha else 0)
    rgb.putalpha(a)
    return rgb


def iso_box(box):
    """Where a flat w x h piece's footprint becomes a diamond: wider, a bit taller (as gen_pixel asks)."""
    w, h = box
    return round(w + h / 2), round(h + w / 4)


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
if GENSHIN:   # Liyue in the sun: bright lawn green, golden earth, warm sand, clear blue water
    COL = {
        "grass": [(110, 186, 84), (98, 172, 76), (128, 200, 96), (84, 152, 66), (156, 216, 112)],
        "dirt": [(214, 176, 118), (198, 160, 104), (228, 192, 134), (178, 142, 94)],
        "sand": [(246, 226, 176), (236, 214, 164), (252, 236, 192), (222, 200, 150)],
        "water": [(70, 168, 206), (60, 154, 194), (98, 190, 222), (164, 222, 240)],
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
    """A piece's tries, from the last source folder that has any (a later batch replaces an
    earlier one: the second tries in xianxia-redo over the first run's)."""
    for d in reversed(src if isinstance(src, list) else [src]):
        found = sorted(d.glob(f"{name}-*.png"), key=lambda p: int(p.stem.rsplit("-", 1)[1]))
        if found:
            return found
    return []


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


def hero_sheet(path):
    """A generated walking sheet (rows up, right, down, left; 4 steps of 48x48) cut to the box all
    its frames share, shrunk so the figure stands HERO_H tall, and laid out as the game reads it:
    rows down, up, left, right."""
    im = Image.open(path).convert("RGBA")
    cells = [[im.crop((k * 48, r * 48, k * 48 + 48, r * 48 + 48)) for k in range(4)] for r in range(4)]
    boxes = [c.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox() for row in cells for c in row]
    boxes = [b for b in boxes if b]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    s = HERO_H / (box[3] - box[1])
    fw, fh = max(1, round((box[2] - box[0]) * s)), HERO_H
    out = Image.new("RGBA", (fw * 4, fh * 4))
    for r_out, r_in in enumerate((2, 0, 3, 1)):   # down, up, left, right
        for k in range(4):
            c = cells[r_in][k].crop(box)
            out.alpha_composite(quantize_like(c.resize((fw, fh), Image.Resampling.BOX), c, 110), (k * fw, r_out * fh))
    return out, [fw, fh]


def main():
    # the generated pieces: the first run, then the later batches (any of them may be missing)
    args = [v for v in sys.argv[1:] if not v.startswith("--")]
    base = Path(args[0]) if args else ROOT / "assets/tk/gen"
    batches = ("xianxia", "xianxia-chars2", "xianxia-interior", "xianxia-redo", "xianxia-props") + (("genshin",) if GENSHIN else ())
    src = [base / d for d in batches if (base / d).exists()]
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
    for kind, (_, box, _) in {**OBJECTS, **INTERIOR, **{k: v for k, v in PROPS_GEN.items() if k not in PROPS_SKIP}}.items():
        # a piece that came out wrong is used only once its second try exists
        where = [d for d in src if d.name in ("xianxia-redo", "genshin")] if kind in REDO else src
        for k, p in enumerate(v for v in variants(where, kind) if v.stem not in DROP):
            items.append((f"{kind}#{k}", fit(Image.open(p), iso_box(box) if p.parent.name == "genshin" else box)))
            made.setdefault(kind, []).append(f"{kind}#{k}")
    sheet, pos = pack(items)
    sheet.save(OUT / "objects.png")

    # the kit: Jade's, with the outdoors swapped for ours
    kit.update(kit=LOOK, name=LOOK.capitalize(),
               credit="Outdoor ground and objects generated for the game with Retro Diffusion (tools/gen_pixel.py, "
                      "tools/xianxia_spec.py); interiors and townsfolk from the Jade kit: " + kit["credit"])
    kit["sheets"].update(x_tiles=f"assets/tk/{LOOK}/tiles.png", x_edges=f"assets/tk/{LOOK}/edges.png",
                         x_objects=f"assets/tk/{LOOK}/objects.png")
    if GENSHIN:
        kit["iso"] = True   # tk-iso.js: the world drawn isometrically
        kit["isoVoid"] = "#%02x%02x%02x" % COL["grass"][3]   # beyond the map's diamond: darker grass
    kit["materials"]["grass"] = {"tiles": [["x_tiles", i, row["grass"], 3 if i == 0 else 1]
                                           for i in range(len(ground["grass"]))]}
    for i, (m, _, _) in enumerate(edged):
        kit["materials"][m] = {"blob": ["x_edges", i * 10, 0, 10, 10], "inside": [i * 10 + 2, 9],
                               "outside": ["x_tiles", 0, row["grass"]]}
    for kind, names in made.items():
        kit["kinds"][kind] = [["x_objects", *pos[n]] for n in names]
    # the shrine's lit and settled looks: the generated stone, warmed (the player adds the glow and the smoke)
    if "landmark.shrine" in made:
        base = dict(items)[made["landmark.shrine"][0]]
        for state, tint in (("lit", (255, 236, 170)), ("settled", (240, 230, 205))):
            im = base.copy()
            px = im.load()
            for y in range(im.height):
                for x in range(im.width):
                    r, g, b, a_ = px[x, y]
                    if a_:
                        px[x, y] = (min(255, (r * tint[0]) // 230), min(255, (g * tint[1]) // 230), min(255, (b * tint[2]) // 230), a_)
            items.append((f"landmark.shrine.{state}#0", im))
            made[f"landmark.shrine.{state}"] = [f"landmark.shrine.{state}#0"]
        sheet, pos = pack(items)
        sheet.save(OUT / "objects.png")
    if detail:   # the scatter on the grass: our tufts and flowers
        kit["detail"] = {"tiles": [["x_tiles", i, len(ground), 1] for i in range(len(detail))],
                         "density": kit["detail"]["density"]}
    # story people drawn from generated walking sheets
    (OUT / "chars").mkdir(exist_ok=True)
    kit["heroes"] = {}
    for who, n in CHAR_PICK.items():
        p = next((d / f"char.{who}-{n}.png" for d in reversed(src) if (d / f"char.{who}-{n}.png").exists()), None)
        if p:
            sheet, frame = hero_sheet(p)
            sheet.save(OUT / f"chars/{who}.png")
            kit["heroes"][who] = {"sheet": f"assets/tk/{LOOK}/chars/{who}.png", "frame": frame}
    (ROOT / f"assets/tk/kits/{LOOK}.json").write_text(json.dumps(kit, indent=1))
    missing = sorted(k for k in {**OBJECTS, **INTERIOR} if k not in made)
    print(f"{LOOK} kit: {sum(len(v) for v in ground.values())} ground tiles, {len(edged)} edge sets, "
          f"{len(items)} object sprites for {len(made)} kinds" + (f"; still Jade's: {', '.join(missing)}" if missing else "") + f"; heroes: {', '.join(kit['heroes']) or 'none'}")


if __name__ == "__main__":
    main()
