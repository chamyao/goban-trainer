"""Dialogue portraits in the Genshin look: cut each generated portrait off its white background.

    python3 tools/build_portraits.py DIR    # DIR holds face_<who>--<n>.png (gen_stills --review output)
    python3 tools/build_portraits.py DIR --remover 851   # cut out by 851-labs/background-remover on Replicate
                                                         # (needs REPLICATE_API_TOKEN; cleaner edges, no white fringe)
    python3 tools/build_portraits.py DIR --remover 851 --only liubei --only diaochan

Writes assets/tk/portraits/<who>.webp (the figure on transparency, 720 px tall at most) and
assets/tk/portraits/portraits.json ({who: file}), which the dialogue box reads (tk-town.js). The
background is whatever near-white region touches the image's edge, so white inside the figure
(a robe, a beard) stays. PICK chooses a try other than the first.
"""
import base64
import io
import json
import os
import sys
import time
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/tk/portraits"
PICK = {"liubei": "old"}      # who -> try, when the first isn't the one in the game (Liu Bei: the user kept the original)


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


REMOVER = "851-labs/background-remover"


def cut_851(im):
    """The figure on transparency, cut by 851-labs/background-remover on Replicate (its own alpha matte)."""
    sys.path.insert(0, str(ROOT / "tools"))
    from gen_stills import fetch, http
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    if not getattr(cut_851, "version", None):   # a community model: run its latest version
        cut_851.version = http(f"https://api.replicate.com/v1/models/{REMOVER}", headers=h)["latest_version"]["id"]
    buf = io.BytesIO()
    im.convert("RGB").save(buf, "PNG")
    uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    r = http("https://api.replicate.com/v1/predictions",
             {"version": cut_851.version, "input": {"image": uri, "format": "png", "background_type": "rgba"}}, h)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2)
        r = http(r["urls"]["get"], headers=h)
    if r["status"] != "succeeded":
        raise RuntimeError(f"{REMOVER}: {r.get('status')} {r.get('error')}")
    out = r["output"]
    return Image.open(io.BytesIO(fetch(out if isinstance(out, str) else out[0]))).convert("RGBA")


def main():
    args = sys.argv[1:]
    remover = args[args.index("--remover") + 1] if "--remover" in args else None
    only = {args[i + 1] for i, a in enumerate(args) if a == "--only"}
    pos = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or not args[i - 1].startswith("--"))]
    src = Path(pos[0]) if pos else ROOT / "assets/tk/stills/samples/review"
    OUT.mkdir(parents=True, exist_ok=True)
    man_path = OUT / "portraits.json"
    man = json.loads(man_path.read_text()) if man_path.exists() else {}
    for p in sorted(src.glob("face_*--*.png")):
        who, n = p.stem[5:].rsplit("--", 1)
        n = n.rsplit("-", 1)[-1]
        if n != str(PICK.get(who, 1)) or (only and who not in only):
            continue
        im = cut_851(Image.open(p)) if remover == "851" else cut(Image.open(p))
        im = im.crop(im.getchannel("A").getbbox() or (0, 0, *im.size))
        if im.height > 720:
            im = im.resize((round(im.width * 720 / im.height), 720), Image.LANCZOS)
        im.save(OUT / f"{who}.webp", "WEBP", quality=86, method=6)   # with alpha, a tenth of the png
        man[who] = f"{who}.webp"
        print(f"  {who}: {im.width}x{im.height}")
    man_path.write_text(json.dumps(dict(sorted(man.items())), indent=1))
    print(f"{len(man)} portraits in {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
