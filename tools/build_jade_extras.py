"""Larger nature pieces for the Jade kit, composed from the pack's own sprites.

    python3 tools/build_jade_extras.py   →  assets/tk/jade/extras.png (+ its frames printed)

The Jade pack has single trees only; this groups them into groves, keeping
the pack's pixels and palette. Frames (x, y, w, h) go in jade.json "kinds".
(Big rocks and crags come from the Ninja pack's nature sheet: piled Jade
boulders looked like eggs in a carton.)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
NAT = Image.open(ROOT / "assets/tk/jade/nature.png").convert("RGBA")
TREE_A, TREE_B = NAT.crop((172, 51, 208, 92)), NAT.crop((224, 51, 256, 92))


def pile(size, parts):
    """Sprites placed back to front (sorted by their bottom edge)."""
    im = Image.new("RGBA", size)
    for spr, x, y in sorted(parts, key=lambda p: p[2] + p[0].height):
        im.alpha_composite(spr, (x, y))
    return im.crop(im.getbbox())


PIECES = {
    "tree.grove#0": pile((72, 56), [(TREE_A, 18, 0), (TREE_B, 0, 10), (TREE_A, 34, 12)]),
    "tree.grove#1": pile((72, 56), [(TREE_B, 22, 0), (TREE_A, 0, 8), (TREE_B, 38, 10)]),
}


def main():
    W = sum(p.width + 1 for p in PIECES.values())
    H = max(p.height for p in PIECES.values())
    sheet, x, frames = Image.new("RGBA", (W, H)), 0, {}
    for name, p in PIECES.items():
        sheet.alpha_composite(p, (x, 0))
        frames[name] = ["extras", x, 0, p.width, p.height]
        x += p.width + 1
    sheet.save(ROOT / "assets/tk/jade/extras.png")
    for k, v in frames.items():
        print(k, v)
    return frames


if __name__ == "__main__":
    main()
