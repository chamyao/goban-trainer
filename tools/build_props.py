"""Build the cutscene prop atlas from Ninja Adventure pieces (CC0).

    python3 tools/build_props.py   →  assets/tk/props.png + assets/tk/props.json

The pieces come from assets/tk/ninja (tools/fetch_ninja_pack.py copies them):
the cage cart is the pack's barred railing raised into a cage on a plank bed
with log-end wheels; the forge is the pack's stone hearth with its ashes lit
to glowing coals; emote bubbles and gift icons are the pack's own. Each frame
is listed as name -> [x, y, w, h] and drawn bottom-centre on its tile.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
N = ROOT / "assets/tk/ninja"


def img(name):
    return Image.open(N / name).convert("RGBA")


def trim(im):
    return im.crop(im.getbbox())


def cagecart():
    el, camp = img("element.png"), img("camp.png")
    rail = el.crop((32, 176, 80, 192))               # top rail, bars, bottom rail
    top, bars, bottom = rail.crop((0, 0, 48, 6)), rail.crop((0, 6, 48, 12)), rail.crop((0, 12, 48, 16))
    wheel = trim(camp.crop((48, 80, 64, 96)))        # a log end
    out = Image.new("RGBA", (48, 40))
    out.alpha_composite(top, (0, 0))
    for i in range(3):                               # bars tall enough for a seated man
        out.alpha_composite(bars, (0, 6 + i * 6))
    out.alpha_composite(bottom, (0, 24))
    for x in (5, 43 - wheel.width):
        out.alpha_composite(wheel, (x, 26))         # under the bed
    return trim(out)


def forge():
    hearth = img("camp.png").crop((160, 48, 192, 80))
    px = hearth.load()
    for y in range(hearth.height):
        for x in range(hearth.width):
            r, g, b, a = px[x, y]
            if a and r > g + 25 and r > b + 40:         # the ashes: brown → coals
                v = (r + g) / 2
                px[x, y] = (255, int(60 + v * .55), 30, 255) if v > 120 else (200, int(40 + v * .3), 20, 255)
    return trim(hearth)


def music():
    im = img("props/Emote_emote20.png")              # the "..." bubble, its dots cleared
    fill = im.getpixel((7, 3))
    d = ImageDraw.Draw(im)
    d.rectangle((2, 4, 11, 8), fill=fill)
    ink = (64, 52, 60, 255)
    d.rectangle((8, 2, 8, 7), fill=ink)              # a quaver
    d.rectangle((9, 3, 10, 3), fill=ink)
    d.rectangle((6, 7, 8, 8), fill=ink)
    d.rectangle((4, 4, 4, 8), fill=ink)              # and a crotchet
    d.rectangle((3, 8, 4, 8), fill=ink)
    return im


def sweat():
    im = img("props/Emote_emote19.png")
    d = ImageDraw.Draw(im)
    blue, light = (70, 140, 230, 255), (190, 225, 255, 255)
    d.rectangle((11, 2, 11, 2), fill=blue)
    d.rectangle((10, 3, 12, 5), fill=blue)
    d.rectangle((10, 3, 10, 3), fill=light)
    return im


def twin_swords():
    s = img("props/Weapons_Sword.png")
    out = Image.new("RGBA", (s.width * 2 + 1, s.height))
    out.alpha_composite(s, (0, 0))
    out.alpha_composite(s.transpose(Image.FLIP_LEFT_RIGHT), (s.width + 1, 0))
    return out


def main():
    frames = {
        "cagecart": cagecart(),
        "forge": forge(),
        "anvil": trim(img("props/Tool_Anvil.png")),
        "hammer": trim(img("props/Tool_Hammer.png")),
        "gourd": trim(img("props/Object_Gourd.png")),
        "emote.!": img("props/Emote_emote22.png"),
        "emote.?": img("props/Emote_emote23.png"),
        "emote....": img("props/Emote_emote20.png"),
        "emote.music": music(),
        "emote.anger": img("props/Emote_emote4.png"),
        "emote.sweat": sweat(),
        "emote.zzz": img("props/Emote_emote28.png"),
        "emote.heart": img("props/Emote_emote27.png"),
        "item.twin_swords": twin_swords(),
        "item.green_dragon": trim(img("props/Weapons_Lance.png")),
        "item.serpent_spear": trim(img("props/Weapons_Lance2.png")),
        "item.silver": trim(img("props/Object_MoneyBag.png")),
    }
    # one row, 1px apart
    W = sum(f.width + 1 for f in frames.values())
    H = max(f.height for f in frames.values())
    sheet, out, x = Image.new("RGBA", (W, H)), {}, 0
    for name, f in frames.items():
        sheet.alpha_composite(f, (x, 0))
        out[name] = [x, 0, f.width, f.height]
        x += f.width + 1
    sheet.save(ROOT / "assets/tk/props.png")
    (ROOT / "assets/tk/props.json").write_text(json.dumps({"image": "assets/tk/props.png", "frames": out}, indent=1))
    print(f"wrote {len(out)} props to assets/tk/props.png ({W}x{H})")


if __name__ == "__main__":
    main()
