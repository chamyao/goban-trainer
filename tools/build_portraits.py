"""Dialogue portraits in the Genshin look: cut each generated portrait off its white background.

    python3 tools/build_portraits.py DIR    # DIR holds face_<who>--<n>.png (gen_stills --review output)

Writes assets/tk/portraits/<who>.webp (the figure on transparency, 720 px tall at most) and
assets/tk/portraits/portraits.json ({who: file}), which the dialogue box reads (tk-town.js). The
background is whatever near-white region touches the image's edge, so white inside the figure
(a robe, a beard) stays. PICK chooses a try other than the first.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/tk/portraits"
PICK = {}      # who -> try number, when the first isn't the best


def cut(im, near=232):
    """The figure on transparency: flood the near-white from every edge pixel, then soften the rim."""
    im = im.convert("RGB")
    w, h = im.size
    r, g, b = im.split()
    white = ImageChops.darker(ImageChops.darker(r, g), b).point(lambda v: 255 if v >= near else 0)
    # flood from the edges: mark background 128 in a copy, then keep only what the flood reached
    bg = white.copy()
    for x in range(0, w, 4):
        for y in (0, h - 1):
            if bg.getpixel((x, y)) == 255:
                ImageDraw.floodfill(bg, (x, y), 128)
    for y in range(0, h, 4):
        for x in (0, w - 1):
            if bg.getpixel((x, y)) == 255:
                ImageDraw.floodfill(bg, (x, y), 128)
    alpha = bg.point(lambda v: 0 if v == 128 else 255)
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))   # no white fringe
    out = im.convert("RGBA")
    out.putalpha(alpha)
    box = alpha.point(lambda v: 255 if v > 16 else 0).getbbox()
    return out.crop(box) if box else out


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets/tk/stills/samples/review"
    OUT.mkdir(parents=True, exist_ok=True)
    man_path = OUT / "portraits.json"
    man = json.loads(man_path.read_text()) if man_path.exists() else {}
    for p in sorted(src.glob("face_*--*.png")):
        who, n = p.stem[5:].rsplit("--", 1)
        n = n.rsplit("-", 1)[-1]
        if n != str(PICK.get(who, 1)):
            continue
        im = cut(Image.open(p))
        if im.height > 720:
            im = im.resize((round(im.width * 720 / im.height), 720), Image.LANCZOS)
        im.save(OUT / f"{who}.webp", "WEBP", quality=86, method=6)   # with alpha, a tenth of the png
        man[who] = f"{who}.webp"
        print(f"  {who}: {im.width}x{im.height}")
    man_path.write_text(json.dumps(dict(sorted(man.items())), indent=1))
    print(f"{len(man)} portraits in {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
