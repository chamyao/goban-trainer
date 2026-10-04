"""Build the cutscene prop atlas from Ninja Adventure pieces (CC0).

    python3 tools/build_props.py   →  assets/tk/props.png + assets/tk/props.json

The pieces come from assets/tk/ninja (tools/fetch_ninja_pack.py copies them):
the cage cart is the pack's barred railing raised into a cage on a plank bed
with log-end wheels; the forge is the pack's stone hearth with its ashes lit
to glowing coals; emote bubbles and gift icons are the pack's own. Each frame
is listed as name -> [x, y, w, h] and drawn bottom-centre on its tile.

PROPS below is the one registry of cutscene props, read by the scene
generator (footprint) and the player (how to draw it). Adding a prop is one
line: its footprint in tiles and where its picture comes from, either a
frame of this atlas ("atlas"), the art kit's own sprite ("kit": vocab kinds
tried in order), or a horse of a coat ("horse"). A kind the story uses that
isn't here still plays: 1x1, drawn as a crate (see docs/graphics-needs.md).
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


def ox():
    """The black ox of the oath's sacrifice: the pack's cow, side on (frames are
    24 px wide), its white hide turned black and its pink belly dark brown; the
    snout, horns and outline stay as they are."""
    cow = img("props/Animal_Cow_SpriteSheetWhiteSide.png").crop((0, 0, 24, 16))
    px = cow.load()
    for y in range(cow.height):
        for x in range(cow.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            if min(r, g, b) > 200:                       # white hide
                px[x, y] = (66, 58, 60, a)
            elif b > g + 15 and r > g + 15:              # pink belly
                px[x, y] = (70, 48, 40, a)
            elif abs(r - g) < 20 and abs(g - b) < 20 and r > 70:   # grey patches
                px[x, y] = (40, 34, 38, a)
    return trim(cow)


def bundle(name, n, gap, tilt=0):
    """A few of one item side by side (iron bars, staves)."""
    one = trim(img(name))
    out = Image.new("RGBA", (one.width + gap * (n - 1), one.height + tilt * (n - 1)))
    for i in range(n):
        out.alpha_composite(one, (i * gap, tilt * (n - 1 - i)))
    return trim(out)


# the registry of props: kind -> footprint (w, h tiles) and how to draw it
PROPS = {
    "cagecart": {"size": [3, 1], "atlas": "cagecart"},
    "cart": {"size": [2, 1], "atlas": "cart"},
    "forge": {"size": [2, 1], "atlas": "forge"},
    "anvil": {"size": [1, 1], "atlas": "anvil"},
    "ox": {"size": [1, 1], "atlas": "ox"},
    "whitehorse": {"size": [2, 1], "horse": "white"},
    "book": {"size": [1, 1], "atlas": "book"},
    "letter": {"size": [1, 1], "atlas": "letter"},
    "seal": {"size": [1, 1], "atlas": "seal"},
    "steelbars": {"size": [1, 1], "atlas": "steelbars"},
    "staves": {"size": [1, 1], "atlas": "staves"},
    "switches": {"size": [1, 1], "atlas": "switches"},
    "waterbowl": {"size": [1, 1], "atlas": "waterbowl"},
    "post": {"size": [1, 1], "atlas": "post"},
    "bucket": {"size": [1, 1], "kit": ["furn.barrel", "furn.jar"]},
    "chest": {"size": [1, 1], "kit": ["furn.chest", "furn.drawers"]},
    "straw": {"size": [2, 1], "kit": ["camp.hay", "furn.sacks"]},
    "redbanner": {"size": [1, 1], "kit": ["banner.red"]},
    "yellowbanner": {"size": [1, 1], "kit": ["banner.yellow", "banner.red"]},
    "winejars": {"size": [2, 1], "kit": ["furn.jar", "furn.barrel"], "pair": True, "with": "gourd"},
    "table": {"size": [2, 1], "kit": ["furn.table", "camp.table"]},
    "rack": {"size": [2, 1], "kit": ["furn.rack"]},
    "fire": {"size": [2, 1], "kit": ["camp.firepit", "camp.cookfire"], "fire": True},
    "tent": {"size": [3, 2], "kit": ["building.tent", "building.hut", "building.house"]},
    "gate": {"size": [3, 1], "kit": ["building.gate", "building.moongate"]},
    "desk": {"size": [2, 1], "kit": ["furn.desk", "furn.table", "camp.table"]},
    "hall": {"size": [4, 2], "kit": ["building.hall", "building.inn", "building.house"]},
}
PROPS["forge"]["fire"] = True


def main():
    el = img("element.png")
    frames = {
        "cart": trim(el.crop((0, 48, 32, 80))),
        "ox": ox(),
        "book": trim(img("props/Object_Book.png")),
        "letter": trim(img("props/Other_Letter.png")),
        "seal": trim(img("props/Other_Stamp.png")),
        "steelbars": trim(img("props/Resource_BarIron.png")),
        "staves": bundle("props/Weapons_Stick.png", 4, 3),
        "switches": trim(img("props/Resource_Branch.png")),
        "waterbowl": trim(el.crop((96, 160, 112, 176))),
        "post": trim(el.crop((48, 32, 64, 48))),
        "crate": trim(img("props/Object_CrateEmpty.png")),
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
    for k, v in PROPS.items():
        assert "atlas" not in v or v["atlas"] in out, k
    (ROOT / "assets/tk/props.json").write_text(json.dumps({"image": "assets/tk/props.png", "frames": out, "kinds": PROPS}, indent=1))
    print(f"wrote {len(out)} props to assets/tk/props.png ({W}x{H})")


if __name__ == "__main__":
    main()
