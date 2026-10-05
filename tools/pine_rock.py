"""The Star Lords' rock under the pine (ch. 69: they play go on a flat rock under a great pine), in each kit.

    python3 tools/pine_rock.py            # every kit: jade, xianxia, genshin
    python3 tools/pine_rock.py genshin    # one

Each kit's look is made from its own art, so it matches: the kit's first pine (tree.pine), and in front of
it a flat slab drawn in colours taken from the kit's big rock (rock.big), with a board scratched into its
top. Three looks, side by side in assets/tk/<dir>/pinerock.png, replace the old shrine's:
    landmark.shrine           dark: the empty board
    landmark.shrine.lit       a game in progress, two wine cups and a plate of dried meat beside it
    landmark.shrine.settled   the finished game left on the rock, the cups drained
No incense or smoke in any of them. build_xianxia_kit.py runs this after it writes a kit.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
KITS = {"jade": "jade", "xianxia": "xianxia", "genshin": "genshin"}   # kit -> assets/tk/<dir>
STATES = ("dark", "lit", "settled")


def crop(kit, ref):
    sheet, x, y, w, h = ref
    return Image.open(ROOT / kit["sheets"][sheet]).convert("RGBA").crop((x, y, x + w, y + h))


def palette(rock):
    """Shadow, body, top and line colours from the kit's rock: its grey pixels only (the generated rocks
    stand on a patch of sand or grass), by brightness; plain greys if it has too few."""
    px = [p for p in rock.get_flattened_data() if p[3] > 200 and max(p[:3]) - min(p[:3]) < 28]
    if len(px) < 40 or sorted(sum(q[:3]) for q in px)[len(px) // 2] < 300:   # too few, or only the dark ones
        px = [(60, 62, 70, 255), (110, 114, 120, 255), (150, 154, 158, 255), (196, 198, 196, 255)] * 10
    px.sort(key=lambda p: p[0] * 3 + p[1] * 6 + p[2])
    at = lambda f: px[min(len(px) - 1, int(len(px) * f))][:3] + (255,)
    return {"line": at(.02), "shadow": at(.3), "body": at(.6), "top": at(.92)}


def slab(w, pal, state):
    """The flat rock, w wide: a rounded top with the board scratched into it, a darker side under it,
    and in the lit and settled looks the cups and the plate beside the board."""
    top, side = 10, 5
    h = top + side
    im = Image.new("RGBA", (w, h))
    p = im.load()
    cx, ry = (w - 1) / 2, (top - 1) / 2
    inside = lambda x, y: ((x - cx) / (w / 2)) ** 2 + ((y - ry) / (top / 2)) ** 2 <= 1
    for x in range(w):
        for y in range(h):
            if y <= ry + 1 and inside(x, y):
                p[x, y] = pal["top"]
            elif y > ry and (inside(x, min(y, ry + .01)) or inside(x, ry)) and y < h - 1 - abs(x - cx) // (w // 2 - 1 or 1):
                p[x, y] = pal["shadow"] if y > top else pal["body"]
    # outline: any filled pixel next to an empty one
    filled = {(x, y) for x in range(w) for y in range(h) if p[x, y][3]}
    for x, y in filled:
        if any((x + dx, y + dy) not in filled for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            p[x, y] = pal["line"]
    # the line where the top meets the side
    for x in range(w):
        y = int(ry) + 3
        if (x, y) in filled and (x, y + 1) in filled:
            p[x, y + 2] = pal["shadow"] if p[x, y + 2][3] else p[x, y + 2]
    # the board: a square of scratched lines, 3 x 3 cells, on the left of the top
    bx, by, cell = 4, 2, 2
    for i in range(4):
        for t in range(7):
            p[bx + i * cell, by + min(t, 6)] = pal["shadow"]
            p[bx + min(t, 6), by + i * cell] = pal["shadow"]
    black, white = (24, 22, 28, 255), (250, 246, 236, 255)
    pts = [(bx + i * cell, by + j * cell) for j in range(4) for i in range(4)]
    if state == "lit":         # a game half played
        stones = [(pts[k], black if n % 2 == 0 else white) for n, k in enumerate((5, 6, 9, 10, 2, 13))]
    elif state == "settled":   # the finished game: every point taken
        stones = [(q, black if (i * 5 + 3) % 7 < 4 else white) for i, q in enumerate(pts)]
    else:
        stones = []
    for (x, y), c in stones:
        p[x, y] = c
    if state != "dark":        # two wine cups and a plate of dried meat to the right of the board
        cup, rim = (226, 210, 176, 255), (120, 96, 70, 255)
        wine = (128, 34, 34, 255) if state == "lit" else (70, 52, 44, 255)   # drained: only the dark bottom
        for x0 in (w - 9, w - 6):
            p[x0, 2], p[x0 + 1, 2] = wine, wine
            p[x0, 3], p[x0 + 1, 3] = cup, cup
            p[x0, 4], p[x0 + 1, 4] = rim, rim
        plate, meat = (196, 160, 112, 255), (150, 66, 40, 255)
        for x in range(w - 10, w - 4):
            p[x, 7] = plate
        if state == "lit":
            for x in (w - 9, w - 8, w - 6):
                p[x, 6] = meat
    return im


def build(name):
    path = ROOT / "assets/tk/kits" / f"{name}.json"
    kit = json.loads(path.read_text())
    pine = crop(kit, kit["kinds"]["tree.pine"][0])
    pal = palette(crop(kit, kit["kinds"]["rock.big"][0]))
    bb = pine.getbbox()
    pine = pine.crop(bb)
    sw = 26
    W = max(pine.width + 8, sw + 4)
    H = pine.height + 6
    frames = []
    for state in STATES:
        im = Image.new("RGBA", (W, H))
        im.alpha_composite(pine, (0, 0))                       # the pine behind, to the left
        im.alpha_composite(slab(sw, pal, state), (W - sw, H - 15))   # the rock in front of it, under its branches
        frames.append(im)
    out = ROOT / "assets/tk" / KITS[name] / "pinerock.png"
    sheet = Image.new("RGBA", (W * len(frames), H))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (i * W, 0))
    sheet.save(out)
    kit["sheets"]["pinerock"] = str(out.relative_to(ROOT))
    for i, state in enumerate(STATES):
        key = "landmark.shrine" if state == "dark" else f"landmark.shrine.{state}"
        # as many variants as before: the compiled maps name a variant by its number ("landmark.shrine#1")
        kit["kinds"][key] = [["pinerock", i * W, 0, W, H]] * max(1, len(kit["kinds"].get(key, [])))
    path.write_text(json.dumps(kit, indent=1))
    print(f"{name}: {W}x{H} x3 -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    for k in sys.argv[1:] or KITS:
        build(k)
