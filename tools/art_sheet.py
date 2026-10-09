"""Contact sheets for checking art before it goes in, and the portrait edge check.

    python3 tools/art_sheet.py stills OUT.jpg ID ...              # review candidates <id>--final-1.jpg (or installed stills)
    python3 tools/art_sheet.py portraits OUT.jpg WHO ...          # cut-outs on dark, as the game shows them
    python3 tools/art_sheet.py kinds OUT.png KIT KIND ...         # kit sprites at 5x, on day grass and on night
    python3 tools/art_sheet.py props OUT.png FRAME ...            # assets/tk/props.png frames at 5x
    python3 tools/art_sheet.py edges WHO ...                      # opaque pixels on each edge of a portrait

A good portrait cut-out touches only the bottom edge (cut at the waist): anything on the top, left or right is a crop
the player sees (apo110: "some of the portraits look cropped and cut off"). Fix those with outpaint_portrait.py.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
STILLS = ROOT / "assets/tk/stills"
REVIEW = STILLS / "samples/review"
PORTRAITS = ROOT / "assets/tk/portraits"


def stills(out, ids):
    W, H, cols = 384, 216, 5
    s = Image.new("RGB", (cols * W, ((len(ids) + cols - 1) // cols) * (H + 18)), "black")
    d = ImageDraw.Draw(s)
    for i, k in enumerate(ids):
        f = REVIEW / f"{k}--final-1.jpg"
        im = Image.open(f if f.exists() else STILLS / f"{k}.jpg").convert("RGB").resize((W, H))
        x, y = (i % cols) * W, (i // cols) * (H + 18)
        s.paste(im, (x, y + 18))
        d.text((x + 4, y + 3), k, fill="white")
    s.save(out, quality=85)


def portraits(out, whos):
    ims = [Image.open(PORTRAITS / f"{w}.webp").convert("RGBA") for w in whos]
    ims = [i.resize((int(i.width * 260 / i.height), 260)) for i in ims]
    s = Image.new("RGBA", (sum(i.width + 8 for i in ims) + 8, 270), (32, 30, 40, 255))
    x = 4
    for i in ims:
        s.alpha_composite(i, (x, 5))
        x += i.width + 8
    s.convert("RGB").save(out)


def _sheet(out, ims, S=5):
    W = sum(i.width * S + 20 for i in ims) + 10
    H = max(i.height for i in ims) * S + 20
    sheet = Image.new("RGBA", (W, H * 2))
    for row, bg in enumerate(((96, 140, 70, 255), (18, 20, 34, 255))):
        s = Image.new("RGBA", (W, H), bg)
        x = 10
        for i in ims:
            s.alpha_composite(i.resize((i.width * S, i.height * S), Image.NEAREST), (x, H - 10 - i.height * S))
            x += i.width * S + 20
        sheet.paste(s, (0, row * H))
    sheet.save(out)


def kinds(out, kit, names):
    k = json.loads((ROOT / f"assets/tk/kits/{kit}.json").read_text())
    ims = []
    for n in names:
        sh, x, y, w, h = k["kinds"][n][0]
        ims.append(Image.open(ROOT / k["sheets"][sh]).convert("RGBA").crop((x, y, x + w, y + h)))
    _sheet(out, ims)


def props(out, names):
    pj = json.loads((ROOT / "assets/tk/props.json").read_text())
    sheet = Image.open(ROOT / pj["image"]).convert("RGBA")
    _sheet(out, [sheet.crop((x, y, x + w, y + h)) for n in names for x, y, w, h in [pj["frames"][n]]])


def edges(whos):
    for w in whos:
        a = Image.open(PORTRAITS / f"{w}.webp").convert("RGBA").getchannel("A")
        W, H = a.size
        n = lambda box: sum(1 for p in a.crop(box).getdata() if p > 128)
        e = dict(top=n((0, 0, W, 1)), left=n((0, 0, 1, H)), right=n((W - 1, 0, W, H)), bottom=n((0, H - 1, W, H)))
        bad = [k for k in ("top", "left", "right") if e[k]]
        print(f"{w:12} {W}x{H}  " + "  ".join(f"{k} {v}" for k, v in e.items()) + ("   CUT: " + ", ".join(bad) if bad else "   ok"))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    {"stills": lambda: stills(a[1], a[2:]), "portraits": lambda: portraits(a[1], a[2:]),
     "kinds": lambda: kinds(a[1], a[2], a[3:]), "props": lambda: props(a[1], a[2:]),
     "edges": lambda: edges(a[1:])}[a[0]]()
