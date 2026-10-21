"""The site's skins' UI art, one set per look: painted by Seedream 5 Pro, then cut out, tiled, sliced and given
hover/pressed states here. No logos, no text, nothing traced from any game.

  tavern (body.theme-tavern, assets/ui/): a warm East Asian go-tavern, chunky card-game look: lacquered wood, cloud
      scrolls, jade and gold.
  halloween (body.season-halloween, assets/ui/halloween/): a haunted go hall: manor stone, gnarled wood, wrought iron,
      cobwebs, pumpkins and bone.
  harvest (body.season-harvest, assets/ui/harvest/): a harvest barn at Thanksgiving: barn wood, wicker, wheat,
      maple leaves, acorns, gourds, cranberry and amber.
  boards (assets/boards/): the event boards' painted surfaces (Events ITEMS board.tex), under the grid and stones.
  A new season is a PAINT block, a build function and a SLICES entry in SETS below, plus its CSS block in
  theme-seasonal.css (body.season-<name>, urls into assets/ui/<name>/).

    python3 tools/gen_ui.py [--set NAME] paint [ASSET ...]   # raw art into <dir>/raw/ (one try each, ~$0.045 an image)
    python3 tools/gen_ui.py [--set NAME] edit ASSET "instruction"  # fix a painting by an image edit of itself (~$0.045);
                                                             # the original is kept as raw/ASSET.orig.webp
    python3 tools/gen_ui.py [--set NAME] build               # raw art -> <dir>/*.webp|png and <dir>/ui.json (sizes, slices)
    python3 tools/gen_ui.py [--set NAME] sheet OUT.png       # a contact sheet of the built assets

REPLICATE_API_TOKEN comes from the environment. Cut-outs use 851-labs/background-remover (tools/build_portraits.py).
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
UI = ROOT / "assets/ui"
RAW = UI / "raw"

LOOK = ("Painterly hand-painted game UI art, chunky and warm-lit, rich saturated colours, soft highlights, in the style "
        "of a cosy fantasy card game's interface, East Asian tavern motifs: red-brown lacquered wood, carved cloud "
        "scrolls, jade and gold. No text, no letters, no logos.")
ON_WHITE = "Isolated on a plain flat pure white background, nothing else."

PAINT = {   # name: (aspect, prompt)
    "tavern-wall": ("1:1", "A flat, front-on texture of a dark warm tavern wall: rich brown wooden planks running "
                           "vertically with one dark carved beam across, worn and warm, evenly lit, no objects, "
                           "fills the whole frame edge to edge, seamless texture. " + LOOK),
    "parchment": ("1:1", "A flat, front-on texture of soft warm parchment paper, cream and pale gold with gentle "
                         "fibres and faint mottling, evenly lit, no marks, no border, fills the whole frame edge to "
                         "edge, seamless texture. " + LOOK),
    "hearth-hero": ("21:9", "A wide view inside a cosy Chinese go tavern at night: a glowing stone hearth on the "
                            "right, red paper lanterns hanging from dark carved beams, a wooden go board with black "
                            "and white stones on a low table in the warm firelight, tea cups, shelves of scrolls, a "
                            "round lattice window; distant patrons only as soft silhouettes, no faces in focus. " + LOOK),
    "frame-wood": ("1:1", "A square ornate picture frame, front-on: thick carved red-brown lacquered wood with "
                          "cloud-scroll carving along each side and polished gold caps on all four corners, the "
                          "centre an empty plain white square, the frame only. " + ON_WHITE + " " + LOOK),
    "panel-trim": ("1:1", "A thin square decorative border, front-on: a slim line of gold filigree with small "
                          "cloud-scroll flourishes at the four corners and a tiny jade bead at each corner, the "
                          "centre empty plain white, the border only. " + ON_WHITE + " " + LOOK),
    "btn-gold": ("21:9", "A single wide chunky game button plate, front-on, rounded rectangle: polished gold with a "
                         "bevelled rim, a warm glossy highlight on top and a darker lower edge, a small cloud-scroll "
                         "ornament at each end, empty in the middle. " + ON_WHITE + " " + LOOK),
    "btn-jade": ("21:9", "A single wide chunky game button plate, front-on, rounded rectangle: polished green jade "
                         "with a thin gold bevelled rim, a soft glossy highlight on top, a small gold cloud-scroll "
                         "ornament at each end, empty in the middle. " + ON_WHITE + " " + LOOK),
    "banner-ribbon": ("21:9", "A single long red silk ribbon banner for a title, front-on, flat in the middle with "
                              "folded swallow-tail ends curling back at both sides, a thin gold trim along its edges, "
                              "empty in the middle. " + ON_WHITE + " " + LOOK),
    "card-frame": ("3:4", "A tall ornate collectible-card frame, front-on: carved red-brown lacquered wood border with "
                          "gold trim, a round jade gem set at the top centre, a gold nameplate band across the lower "
                          "third, the picture window an empty plain white rectangle, the frame only. "
                          + ON_WHITE + " " + LOOK),
}

# how each built asset is sliced (CSS border-image): insets in px of the built size
SLICES = {"frame-wood": 86, "panel-trim": 24, "btn-gold": [0, 48], "btn-jade": [0, 48], "banner-ribbon": [0, 72],
          "card-frame": [71, 49, 114, 50]}   # card-frame: its picture window (top right bottom left)

HW_LOOK = ("Painterly hand-painted game UI art, chunky and moody, in the style of a cosy fantasy card game's Halloween "
           "event: moonlit purples and deep blue-greys lit by warm pumpkin-orange candlelight, gnarled dark wood, "
           "wrought iron, cobwebs. Spooky but friendly, not gory. No text, no letters, no logos, no faces of people.")
HW_PAINT = {
    "wall": ("1:1", "A flat, front-on texture of a haunted manor wall at night: rough dark grey-violet stone blocks with "
                    "a little moss and faint cobweb wisps, evenly lit by soft moonlight, no objects, no windows, fills "
                    "the whole frame edge to edge, seamless texture. " + HW_LOOK),
    "parchment": ("1:1", "A flat, front-on texture of old aged parchment paper, pale bone-cream with soft grey-lilac "
                         "mottling and faint foxing spots, light overall, evenly lit, no marks, no border, fills the "
                         "whole frame edge to edge, seamless texture. " + HW_LOOK),
    "header-beam": ("21:9", "A flat, front-on texture of one long dark carved wooden beam running horizontally across "
                            "the whole frame, black-brown gnarled wood grain with a few thin cobweb strands, evenly "
                            "lit, fills the whole frame edge to edge, seamless texture. " + HW_LOOK),
    "board-frame": ("1:1", "A square ornate picture frame, front-on: thick gnarled carved dark haunted wood, twisting "
                           "roots and branches along each side, a small glowing carved jack-o'-lantern on each of the "
                           "four corners, a few cobwebs, the centre an empty plain white square, the frame only. "
                           + ON_WHITE + " " + HW_LOOK),
    "panel-frame": ("1:1", "A thin square decorative border, front-on: a slim line of black wrought iron with small "
                           "curling scrolls and a tiny cobweb in each of the four corners, the centre empty plain "
                           "white, the border only. " + ON_WHITE + " " + HW_LOOK),
    "btn-pumpkin": ("21:9", "A single wide chunky game button plate, front-on, rounded rectangle: glossy carved pumpkin "
                            "orange with ribbed rind texture and a dark bevelled rim, a warm highlight on top, a curling "
                            "green vine tendril ornament at each end, empty in the middle. " + ON_WHITE + " " + HW_LOOK),
    "btn-bone": ("21:9", "A single wide chunky game button plate, front-on, rounded rectangle: deep violet polished stone "
                         "with a pale bone-white bevelled rim, a soft glossy highlight on top, a small carved bone "
                         "ornament at each end, empty in the middle. " + ON_WHITE + " " + HW_LOOK),
    "ribbon": ("21:9", "A single long tattered purple cloth banner for a title, front-on, flat in the middle with "
                       "ragged torn swallow-tail ends at both sides, a thin orange trim along its edges, empty in the "
                       "middle. " + ON_WHITE + " " + HW_LOOK),
    "stone-white": ("1:1", "A single big chunky piece of classic candy corn seen from straight above, a plump rounded "
                           "triangle filling most of the frame: a broad bright yellow base, an orange middle band and a "
                           "bright white tip, glossy, simple bold shapes, very light and bright overall. "
                           + ON_WHITE + " " + HW_LOOK),
    "stone-black": ("1:1", "A single big round dark chocolate truffle seen from straight above, filling most of the frame, "
                           "very dark near-black cocoa-dusted surface with a soft glossy highlight, simple bold shape, very "
                           "dark overall. " + ON_WHITE + " " + HW_LOOK),
    "bat": ("1:1", "A single small cute cartoon bat flying, wings spread wide, seen from the front, dark violet-black "
                   "with soft purple highlights, simple silhouette. " + ON_WHITE + " " + HW_LOOK),
}
HW_SLICES = {"btn-pumpkin": [0, 48], "btn-bone": [0, 48], "ribbon": [0, 72]}   # the frames: measured in build

HV_LOOK = ("Painterly hand-painted game UI art, chunky and warm, in the style of a cosy fantasy card game's autumn harvest "
           "festival: golden-hour amber light, russet, burnt orange, deep cranberry red and wheat gold, rustic weathered "
           "barn wood, woven wicker, wheat sheaves, maple and oak leaves, acorns, small gourds. Warm and homely. No text, "
           "no letters, no logos, no people, no turkeys.")
HV_PAINT = {
    "wall": ("1:1", "A flat, front-on texture of a rustic harvest barn wall: weathered warm brown wooden boards running "
                    "vertically, a few small bundles of dried wheat and autumn leaves hung on nails, evenly lit by warm "
                    "lantern light, no windows, fills the whole frame edge to edge, seamless texture. " + HV_LOOK),
    "parchment": ("1:1", "A flat, front-on texture of soft warm cream linen paper, pale wheat and light honey tones with "
                         "gentle fibres and faint mottling, light overall, evenly lit, no marks, no border, no objects, "
                         "fills the whole frame edge to edge, seamless texture. " + HV_LOOK),
    "header-beam": ("21:9", "A flat, front-on texture of one long rustic wooden beam running horizontally across the whole "
                            "frame with a garland of red and orange autumn maple leaves, acorns and wheat draped along "
                            "it, evenly lit, fills the whole frame edge to edge, seamless texture. " + HV_LOOK),
    "board-frame": ("1:1", "A square ornate picture frame, front-on: thick woven golden wicker and braided wheat with "
                           "russet autumn maple leaves along each side, a small cluster of mini pumpkins, gourds and "
                           "acorns on each of the four corners, the centre an empty plain white square, the frame only. "
                           + ON_WHITE + " " + HV_LOOK),
    "panel-frame": ("1:1", "A thin square decorative border, front-on: a slim braided wheat-straw line with a small "
                           "cluster of oak leaves and an acorn in each of the four corners, the centre empty plain "
                           "white, the border only. " + ON_WHITE + " " + HV_LOOK),
    "btn-wheat": ("21:9", "A single wide chunky game button plate, front-on, rounded rectangle: polished warm honey-gold "
                          "amber with a dark walnut-wood bevelled rim, a warm glossy highlight on top, a small wheat-ear "
                          "ornament at each end, empty in the middle. " + ON_WHITE + " " + HV_LOOK),
    "btn-cranberry": ("21:9", "A single wide chunky game button plate, front-on, rounded rectangle: polished deep "
                              "cranberry red with a thin golden-wheat bevelled rim, a soft glossy highlight on top, a "
                              "small acorn ornament at each end, empty in the middle. " + ON_WHITE + " " + HV_LOOK),
    "ribbon": ("21:9", "A single long woven burlap and russet plaid cloth banner for a title, front-on, flat in the "
                       "middle with folded swallow-tail ends at both sides, a thin golden stitched trim along its edges, "
                       "empty in the middle. " + ON_WHITE + " " + HV_LOOK),
    "leaf": ("1:1", "A single red-orange autumn maple leaf, seen flat from above, with a short stem, rich glowing "
                    "colours, simple bold shape. " + ON_WHITE + " " + HV_LOOK),
}
BD_LOOK = ("A flat, front-on, evenly lit texture filling the whole square frame edge to edge, seen straight from above, "
           "painterly hand-painted game art. The middle is calm and even, a medium tone (neither dark nor light), with "
           "only soft low-contrast detail; any motifs are faint and kept toward the corners. No grid, no lines, no "
           "stones, no border, no frame, no text, no letters, no logos.")
BD_PAINT = {   # the event boards' surfaces (Events ITEMS board.tex): drawn under the grid and stones, so they stay calm
    "haunted": ("1:1", "The playing surface of a haunted go board: dusky medium violet-purple wood with faint, soft "
                       "ghostly swirling grain, a gentle pale moonlight sheen across it, the faintest cobweb wisps in "
                       "the four corners. " + BD_LOOK),
    "moonlit": ("1:1", "The playing surface of a moonlit go board: medium night-blue lacquer, smooth and softly glossy, "
                       "with tiny faint silver star flecks scattered sparsely and a soft pale moon glow in one corner. "
                       + BD_LOOK),
}


BD_SOFTEN = {"haunted": .15}   # less softening where the grain is the point (the user: 'look like wood grain')


def build_boards(save):
    """Each board 1024 square, its detail softened a little so lines and both colours of stone read on it."""
    for n in BD_PAINT:
        im = Image.open(RAW / f"{n}.webp").convert("RGB").resize((1024, 1024), Image.LANCZOS)
        im = Image.blend(im, im.filter(ImageFilter.GaussianBlur(5)), BD_SOFTEN.get(n, .45))
        im.save(UI / f"{n}.webp", quality=80, method=6)
        save.meta[n] = {"file": f"{n}.webp", "size": [1024, 1024]}


HV_SLICES = {"btn-wheat": [0, 48], "btn-cranberry": [0, 48], "ribbon": [0, 72]}   # the frames: measured in build


def paint(names):
    from gen_stills import replicate
    RAW.mkdir(parents=True, exist_ok=True)
    for n in names or SET["paint"]:
        aspect, prompt = SET["paint"][n]
        raw, _ = replicate(prompt, None, aspect)
        Image.open(io.BytesIO(raw)).convert("RGB").save(RAW / f"{n}.webp", quality=95)
        print(f"  {n}: painted")


def edit(name, instruction):
    """An image edit of the painting itself (never a repaint): Seedream gets it as its input image."""
    import base64, os, time
    from gen_stills import fetch, http
    src = RAW / f"{name}.webp"
    buf = io.BytesIO(); Image.open(src).convert("RGB").save(buf, "JPEG", quality=92)
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    prompt = f"Edit this image. {instruction} Change nothing else: same colours, style and lighting."
    r = http("https://api.replicate.com/v1/models/bytedance/seedream-5-pro/predictions",
             {"input": {"prompt": prompt, "image_input": ["data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()],
                        "aspect_ratio": SET["paint"][name][0], "size": "1K", "output_format": "png"}}, h)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2); r = http(r["urls"]["get"], headers=h)
    if r["status"] != "succeeded":
        sys.exit(f"{name}: {r['status']} {r.get('error')}")
    out = r["output"]
    orig = RAW / f"{name}.orig.webp"
    if not orig.exists():
        src.rename(orig)
    Image.open(io.BytesIO(fetch(out[0] if isinstance(out, list) else out))).convert("RGB").save(src, quality=95)
    print(f"  {name}: edited (original kept as {orig.name})")


def seamless(im, size):
    """Tile without seams: the image and its half-offset copy, blended by a mask that hides each one's edges."""
    im = im.resize((size, size), Image.LANCZOS)
    off = ImageChops.offset(im, size // 2, size // 2)
    mask = Image.new("L", (size, size))
    m = mask.load()
    for y in range(size):
        for x in range(size):
            d = min(x, y, size - 1 - x, size - 1 - y) / (size / 2)   # 0 at the edge, 1 at the centre
            m[x, y] = int(255 * min(1, d * 2.2))
    return Image.composite(im, off, mask)


def mirrored(im, size):
    """Tile without seams for a strongly lined texture (the wall's planks): the image and its mirrors in a 2x2."""
    h = size // 2
    im = im.resize((h, h), Image.LANCZOS)
    out = Image.new("RGB", (size, size))
    flip, flop = im.transpose(Image.FLIP_LEFT_RIGHT), im.transpose(Image.FLIP_TOP_BOTTOM)
    out.paste(im, (0, 0)); out.paste(flip, (h, 0))
    out.paste(flop, (0, h)); out.paste(flop.transpose(Image.FLIP_LEFT_RIGHT), (h, h))
    return out


def cutout(name):
    from build_portraits import cut_851
    im = cut_851(Image.open(RAW / f"{name}.webp"))
    # crop to the solid art, not to every faint speck the remover leaves: a speck off to one side pads that side and
    # the art sits off-centre in its canvas (frame-wood was 63px right and 64px high of centre: the board looked shoved)
    solid = im.getchannel("A").point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.MinFilter(5))
    x0, y0, x1, y1 = solid.getbbox()
    return im.crop((max(0, x0 - 2), max(0, y0 - 2), min(im.width, x1 + 2), min(im.height, y1 + 2)))


def clear_window(im, frac=.5):
    """Make the frame's white window transparent: flood near-white from the centre."""
    im = im.copy()
    px = im.load()
    W, H = im.size
    seen, stack = set(), [(W // 2, int(H * frac))]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H):
            continue
        r, g, b, a = px[x, y]
        if a and min(r, g, b) < 225:
            continue
        seen.add((x, y))
        px[x, y] = (0, 0, 0, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


def states(im, h=64):
    """A button plate at h px tall, and its hover (brighter, a warm glow) and pressed (darker, nudged down) states."""
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    hover = ImageEnhance.Brightness(im).enhance(1.15)
    pressed = Image.new("RGBA", im.size)
    pressed.alpha_composite(ImageEnhance.Brightness(im).enhance(.82), (0, 2))
    return {"": im, "-hover": hover, "-pressed": pressed}


def saver(meta):
    """save(name, im, fmt): write a built asset into the set's dir and note its size and slice (hover/pressed share
    their plate's slice) in meta, which becomes ui.json."""
    UI.mkdir(parents=True, exist_ok=True)
    def save(name, im, fmt="webp"):
        path = UI / f"{name}.{fmt}"
        im.save(path, quality=88) if fmt == "webp" else im.save(path)
        base = name.split("-hover")[0].split("-pressed")[0]
        meta[name] = {"file": path.name, "size": list(im.size), **({"slice": SET["slices"][base]} if base in SET["slices"] else {})}
    save.meta = meta
    return save


def build():
    meta = {}
    SET["build"](saver(meta))
    if SET is not SETS["boards"]:   # (the boards are plain pictures: nothing to slice)
        (UI / "ui.json").write_text(json.dumps(meta, indent=1))
    print(f"built {len(meta)} assets in {UI.relative_to(ROOT)}")


def build_tavern(save):
    wall = Image.open(RAW / "tavern-wall.webp").convert("RGB")   # the planks only: a beam would double when tiled
    save("tavern-wall", mirrored(wall.crop((0, int(wall.height * .04), wall.width, int(wall.height * .34))), 512))
    parch = Image.open(RAW / "parchment.webp").convert("RGB")    # its plain middle: the model added a border
    W, H = parch.size
    save("parchment", seamless(parch.crop((int(W * .28), int(H * .28), int(W * .72), int(H * .72))), 512))
    hero = Image.open(RAW / "hearth-hero.webp").convert("RGB")
    w = hero.width; h = round(w * 420 / 1600)
    y0 = hero.height - h - int(hero.height * .04)   # the go board sits near the foot of the painting: keep it in
    save("hearth-hero", hero.crop((0, y0, w, y0 + h)).resize((1600, 420), Image.LANCZOS))
    save("frame-wood", clear_window(cutout("frame-wood")).resize((512, 512), Image.LANCZOS), "png")
    save("panel-trim", clear_window(cutout("panel-trim")).resize((256, 256), Image.LANCZOS), "png")
    for b in ("btn-gold", "btn-jade"):
        for suf, im in states(cutout(b)).items():
            save(b + suf, im, "png")
    rib = cutout("banner-ribbon")
    save("banner-ribbon", rib.resize((round(rib.width * 72 / rib.height), 72), Image.LANCZOS), "png")
    save("card-frame", clear_window(cutout("card-frame"), .45).resize((300, 420), Image.LANCZOS), "png")


def window_inset(im):
    """A frame's 9-slice inset: the smallest k whose inner square (k from every edge) holds no opaque pixel, so the
    slices take all of the frame (bosses and corner pumpkins that reach inward included) and none of the window."""
    a = im.getchannel("A").point(lambda v: 255 if v > 128 else 0)
    k = 1
    while a.crop((k, k, im.width - k, im.height - k)).getbbox():
        k += 1
    return k


def candy_stone(im, size=128, fill=.92):
    k = size * fill / max(im.size)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    out = Image.new("RGBA", (size, size))
    x, y = (size - im.width) // 2, (size - im.height) // 2
    shadow = Image.new("RGBA", im.size, (20, 10, 5, 0)); shadow.putalpha(im.getchannel("A").point(lambda v: v * .45))
    out.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(3)), (x + 2, min(size - im.height, y + 3)))
    out.alpha_composite(im, (x, y - 1 if y else 0))
    return out


def build_skin(save, buttons, sprite):
    """A season's skin (see the Halloween set): the wall and parchment tiled by mirroring, the header beam repeated
    sideways, the board and panel frames as 9-slices with measured insets, two button plates with their states, the
    banner, and a small ambient sprite (bat, leaf, snowflake ...)."""
    wall = Image.open(RAW / "wall.webp").convert("RGB")
    save("wall", mirrored(wall, 1024))
    parch = Image.open(RAW / "parchment.webp").convert("RGB")   # its plain middle, softened for reading
    W, H = parch.size
    parch = parch.crop((int(W * .15), int(H * .15), int(W * .85), int(H * .85)))
    parch = ImageEnhance.Contrast(ImageEnhance.Brightness(parch).enhance(1.06)).enhance(.75)
    save("parchment", mirrored(parch, 512))   # mottling mirrors cleanly (seamless() left a cross here)
    beam = Image.open(RAW / "header-beam.webp").convert("RGB")   # repeats sideways: the beam and its mirror
    beam = beam.resize((round(beam.width * 160 / beam.height), 160), Image.LANCZOS)
    both = Image.new("RGB", (beam.width * 2, 160)); both.paste(beam, (0, 0)); both.paste(beam.transpose(Image.FLIP_LEFT_RIGHT), (beam.width, 0))
    save("header-beam", both)
    for n, size in (("board-frame", 512), ("panel-frame", 256)):
        im = clear_window(cutout(n)).resize((size, size), Image.LANCZOS)
        SET["slices"][n] = window_inset(im)
        save(n, im, "png")
    for b in buttons:
        for suf, im in states(cutout(b)).items():
            save(b + suf, im, "png")
    rib = cutout("ribbon")
    save("ribbon", rib.resize((round(rib.width * 72 / rib.height), 72), Image.LANCZOS), "png")
    sp = cutout(sprite)
    save(sprite, sp.resize((round(sp.width * 96 / sp.height), 96), Image.LANCZOS), "png")


def build_halloween(save):   # a haunted go hall; its candy stones for the Easter egg
    build_skin(save, ("btn-pumpkin", "btn-bone"), "bat")
    for c in ("white", "black"):   # centred, 92% of a 128 square, a soft shadow inside
        save(f"stone-{c}-1", candy_stone(cutout(f"stone-{c}")), "webp")


def build_harvest(save):   # a harvest barn at Thanksgiving
    build_skin(save, ("btn-wheat", "btn-cranberry"), "leaf")


def sheet(out):
    meta = json.loads((UI / "ui.json").read_text())
    ims = [(n, Image.open(UI / m["file"]).convert("RGBA")) for n, m in meta.items()]
    ims = [(n, i if i.height <= 260 else i.resize((round(i.width * 260 / i.height), 260))) for n, i in ims]
    W = 1600
    rows, row, x = [], [], 0
    for n, i in ims:
        if x + i.width > W and row:
            rows.append(row); row, x = [], 0
        row.append((n, i)); x += i.width + 12
    rows.append(row)
    H = sum(max(i.height for _, i in r) + 26 for r in rows)
    s = Image.new("RGBA", (W, H), (34, 24, 18, 255))
    d = ImageDraw.Draw(s)
    y = 0
    for r in rows:
        x = 0
        for n, i in r:
            s.alpha_composite(i, (x, y + 18)); d.text((x + 2, y + 3), n, fill="#f2cc5a"); x += i.width + 12
        y += max(i.height for _, i in r) + 26
    s.save(out)


SETS = {
    "tavern": {"dir": UI, "paint": PAINT, "slices": SLICES, "build": build_tavern},
    "halloween": {"dir": UI / "halloween", "paint": HW_PAINT, "slices": HW_SLICES, "build": build_halloween},
    "harvest": {"dir": UI / "harvest", "paint": HV_PAINT, "slices": HV_SLICES, "build": build_harvest},
    "boards": {"dir": ROOT / "assets/boards", "paint": BD_PAINT, "slices": {}, "build": build_boards},
}
SET = SETS["tavern"]

if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["--set"]:
        SET = SETS[a[1]]; a = a[2:]
        UI = SET["dir"]; RAW = UI / "raw"
    if not a:
        sys.exit(__doc__)
    {"paint": lambda: paint(a[1:]), "edit": lambda: edit(a[1], a[2]), "build": build, "sheet": lambda: sheet(a[1])}[a[0]]()
