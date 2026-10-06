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


def jiazi():
    """甲子 chalked on a gate plank, as the Yellow Turbans marked doors for their year:
    the camp sheet's plank, darkened, with the characters in GNU Unifont (pixel glyphs)."""
    from PIL import ImageFont
    plank = img("camp.png").crop((0, 112, 48, 128))
    px = plank.load()
    for y in range(plank.height):
        for x in range(plank.width):
            r, g, b, a = px[x, y]
            px[x, y] = (int(r * .5), int(g * .42), int(b * .38), a)
    plank = trim(plank)
    board = Image.new("RGBA", (plank.width, plank.height * 2 - 2))   # two planks, one above the other
    board.alpha_composite(plank, (0, plank.height - 2))
    board.alpha_composite(plank, (0, 0))
    plank = board
    font = ImageFont.truetype("/usr/share/fonts/opentype/unifont/unifont_jp.otf", 16)
    d = ImageDraw.Draw(plank)
    w = d.textlength("甲子", font=font)
    d.text(((plank.width - w) / 2, (plank.height - 16) / 2 - 1), "甲子", font=font, fill=(236, 230, 214, 255))
    return plank


def bundle(name, n, gap, tilt=0):
    """A few of one item side by side (iron bars, staves)."""
    one = trim(img(name))
    out = Image.new("RGBA", (one.width + gap * (n - 1), one.height + tilt * (n - 1)))
    for i in range(n):
        out.alpha_composite(one, (i * gap, tilt * (n - 1 - i)))
    return trim(out)


# ---- drawn by hand (tools/draw_tk_extras.Grid): what the pack lacks, for Book 2 ----
def _grid(w, h):
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    from draw_tk_extras import Grid
    return Grid(w, h)


def pig():   # a tied pig, side view
    g = _grid(20, 14)
    pink, pinkD = "#e8a0a0", "#c07878"
    g.ellipse(10, 7, 8, 5, pink); g.ellipse(10, 9, 7, 3, pinkD)
    g.ellipse(17, 6, 3, 3, pink); g.rect(19, 6, 1, 2, "#a85a5a")        # snout
    g.set(16, 4, "#222222"); g.rect(14, 2, 2, 2, pinkD)                  # eye, ear
    for x in (5, 8, 12, 15):
        g.rect(x, 11, 2, 2, pinkD)                                       # legs
    g.set(2, 5, pinkD); g.set(1, 4, pinkD)                               # tail
    g.rect(6, 6, 1, 6, "#8a6a3a")                                        # the rope round its middle
    return g.outline().image()


def well():   # a round stone well with a wooden frame and a rope bucket
    g = _grid(28, 30)
    st, stD, stL = "#9a9ea6", "#6a6e76", "#c0c4c8"
    g.rect(3, 16, 22, 11, stD); g.ellipse(14, 16, 11, 4, st); g.ellipse(14, 16, 8, 2.5, "#2a2e36")
    for x in range(4, 24, 5):
        g.rect(x, 19, 1, 8, stL)                                         # stone joints
    wood = "#8a5a2a"
    g.rect(3, 2, 2, 16, wood); g.rect(23, 2, 2, 16, wood); g.rect(2, 2, 24, 2, wood); g.rect(1, 0, 26, 2, "#3e4350")
    g.rect(13, 4, 1, 8, "#c8a070"); g.rect(11, 12, 5, 4, "#7a5228")      # rope and bucket
    return g.outline().image()


def mirror():   # a round bronze mirror on a wooden stand
    g = _grid(16, 22)
    g.ellipse(8, 7, 6.5, 6.5, "#b08a42"); g.ellipse(8, 7, 5, 5, "#e2c886"); g.ellipse(6.5, 5.5, 1.5, 1.5, "#fff4d0")
    g.rect(7, 13, 2, 6, "#7a4a22"); g.rect(3, 19, 10, 2, "#7a4a22")
    return g.outline().image()


def pond():   # a small lotus pond with a stone rim
    g = _grid(36, 18)
    g.ellipse(18, 9, 17, 8, "#8a8e94"); g.ellipse(18, 9, 15, 6.5, "#4a8aa8"); g.ellipse(18, 10, 13, 5, "#3a7a98")
    for x, y in ((9, 8), (22, 6), (26, 11), (14, 12)):
        g.ellipse(x, y, 2.5, 1.5, "#5aa05a")                             # lily pads
    g.rect(21, 4, 2, 2, "#f0a8c0"); g.set(22, 3, "#f8d0e0")              # a lotus flower
    g.rect(13, 10, 2, 2, "#f0a8c0")
    return g.outline().image()


def halberd():   # a halberd planted at a camp gate (Book 3, ch. 16): a crescent blade, a red tassel, a stone at its foot
    g = _grid(16, 36)
    pole, poleD, steel, steelD = "#7a5a3a", "#5a3e26", "#d0d4d8", "#9aa0a8"
    g.rect(7, 4, 2, 28, pole); g.rect(8, 4, 1, 28, poleD)                         # the shaft
    g.rect(7, 0, 2, 5, steel); g.set(7, 0, steelD)                                  # the spike
    for y, (x0, x1) in enumerate(((10, 11), (10, 12), (10, 13), (10, 13), (10, 12), (10, 11)), start=3):
        g.rect(x0, y, x1 - x0 + 1, 1, steel)                                          # the crescent blade
    g.set(13, 5, steelD); g.set(13, 6, steelD); g.rect(9, 4, 1, 4, steelD)
    g.rect(4, 6, 3, 1, steel); g.set(3, 7, steel)                                   # the small back hook
    g.rect(6, 9, 4, 1, "#c8392c"); g.rect(5, 10, 2, 4, "#c8392c"); g.rect(9, 10, 2, 3, "#a82a22")   # the tassel
    g.rect(4, 31, 8, 4, "#7a7e86"); g.rect(5, 30, 6, 1, "#9a9ea4"); g.rect(4, 34, 8, 1, "#5e636b")  # the stone it stands in
    return g.outline().image()


def carriage():   # a Han covered carriage, side view: two wheels, a box with felt curtains, a round canopy, shafts
    g = _grid(34, 28)
    wood, woodD, felt, feltD, canopy, canopyD = "#8a5a2a", "#5a3a1a", "#b8423a", "#8a2e28", "#3e4350", "#2a2e38"
    g.rect(0, 17, 10, 1, wood); g.set(0, 16, wood)                                  # the shafts, forward
    g.rect(8, 9, 20, 9, felt); g.rect(8, 16, 20, 2, feltD)                          # the box, hung with red felt
    for x in (12, 17, 22):
        g.rect(x, 9, 1, 7, feltD)                                                   # the curtain folds
    g.rect(13, 10, 3, 4, "#e6c860"); g.rect(13, 13, 3, 1, feltD)                    # a curtain drawn up at the window
    g.rect(7, 17, 22, 2, wood)                                                      # the floor beam
    g.ellipse(18, 5.5, 13, 3.5, canopy); g.ellipse(18, 6.5, 12, 2.2, canopyD)       # the round canopy over it
    g.rect(17, 0, 2, 3, wood); g.rect(17, 3, 2, 6, wood)                            # its pole
    for x in (6, 30):
        g.rect(x, 7, 1, 2, "#e6c14a")                                               # tassels at its rim
    g.ellipse(22, 21, 6, 6, woodD); g.ellipse(22, 21, 4.6, 4.6, wood); g.ellipse(22, 21, 1.5, 1.5, woodD)   # the wheel
    for dx, dy in ((0, -4), (0, 4), (-4, 0), (4, 0), (-3, -3), (3, 3), (-3, 3), (3, -3)):
        g.set(22 + dx // 1, 21 + dy // 1, woodD)                                    # its spokes
    return g.outline().image()


def curtain():   # a bead curtain hung across a room: a lacquered rail and strings of beads
    g = _grid(36, 30)
    g.rect(0, 0, 36, 3, "#7a2a22"); g.rect(0, 0, 36, 1, "#a83a32"); g.rect(1, 3, 34, 1, "#e6c14a")   # the rail
    beads = ("#f4f0e0", "#d8c890", "#c8d8e8")
    for i, x in enumerate(range(2, 35, 2)):
        n = 22 + (3 if 8 < x < 28 else 0) - abs(x - 18) // 6                        # the strings hang in a soft curve
        for y in range(4, 4 + n):
            if (y + i) % 2 == 0:
                g.set(x, y, beads[(x // 2 + y // 4) % 3])
            else:
                g.set(x, y, "#a8987a")
    return g.image()   # no outline: the room shows between the strings


def pearls():   # a string of pearls coiled on a red cloth: separate beads, each with its highlight
    g = _grid(16, 10)
    g.ellipse(8, 6.5, 7.5, 3, "#b8423a"); g.ellipse(8, 7.5, 7, 2, "#8a2e28")
    for x, y in ((2, 5), (5, 6), (8, 6), (11, 6), (13, 4), (11, 3), (8, 3), (5, 3)):
        g.rect(x, y, 2, 2, "#e8e4dc"); g.set(x, y, "#ffffff"); g.set(x + 1, y + 1, "#b8b4ac")
    return g.outline().image()


def crown():   # a gold crown set with pearls
    g = _grid(16, 12)
    gold, goldD = "#e6c14a", "#b08a2a"
    g.rect(2, 6, 12, 5, gold); g.rect(2, 10, 12, 1, goldD)
    for x in (2, 6, 10, 13):
        g.rect(x, 3, 2, 3, gold); g.set(x, 2, gold)                                 # the points
    for x in (4, 8, 12):
        g.ellipse(x, 8, 1.2, 1.2, "#f4f0ea")                                         # the pearls set in it
    g.set(7, 1, "#c8283c"); g.set(7, 2, gold)                                       # a red stone at the top
    return g.outline().image()


def edict():   # the Emperor's secret edict: a yellow silk scroll, rolled, tied with a red cord
    g = _grid(16, 10)
    g.rect(2, 2, 12, 6, "#e8c84a"); g.rect(2, 7, 12, 1, "#c8a030")
    g.rect(0, 1, 2, 8, "#7a4a22"); g.rect(14, 1, 2, 8, "#7a4a22")                    # the rollers
    g.rect(7, 2, 2, 6, "#c8283c")                                                   # the cord
    g.rect(4, 4, 2, 1, "#8a6a2a"); g.rect(10, 4, 2, 1, "#8a6a2a")                   # a glimpse of characters
    return g.outline().image()


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
    "jiazi": {"size": [3, 1], "atlas": "jiazi"},
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
    # Book 2
    "pig": {"size": [1, 1], "atlas": "pig"},
    "well": {"size": [2, 1], "atlas": "well"},
    "mirror": {"size": [1, 1], "atlas": "mirror"},
    "water": {"size": [2, 1], "atlas": "pond"},
    # Book 3
    "halberd": {"size": [1, 1], "atlas": "halberd"},
    # the new Book 2 (ch. 8-9)
    "carriage": {"size": [2, 1], "atlas": "carriage"},
    "curtain": {"size": [2, 1], "atlas": "curtain"},
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
        "jiazi": jiazi(),
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
        "pig": pig(),
        "well": well(),
        "mirror": mirror(),
        "pond": pond(),
        "halberd": halberd(),
        "carriage": carriage(),
        "curtain": curtain(),
        "item.pearls": pearls(),
        "item.crown": crown(),
        "item.edict": edict(),
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
