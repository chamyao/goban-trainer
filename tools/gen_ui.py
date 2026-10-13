"""The tavern theme's UI art (body.theme-tavern): painted by Seedream 5 Pro, then cut out, tiled, sliced and given
hover/pressed states here. A warm East Asian go-tavern in a chunky, painterly, warm-lit card-game look: lacquered wood,
cloud scrolls, jade and gold. No logos, no text, nothing traced from any game.

    python3 tools/gen_ui.py paint [NAME ...]   # paint the raw art into assets/ui/raw/ (one try each, ~$0.045 an image)
    python3 tools/gen_ui.py build              # raw art -> assets/ui/*.webp|png, and assets/ui/ui.json (sizes, slices)
    python3 tools/gen_ui.py sheet OUT.png      # a contact sheet of the built assets on dark and on parchment

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
SLICES = {"frame-wood": 100, "panel-trim": 24, "btn-gold": [0, 48], "btn-jade": [0, 48], "banner-ribbon": [0, 72],
          "card-frame": [73, 52, 114, 52]}   # card-frame: its picture window (top right bottom left)


def paint(names):
    from gen_stills import replicate
    RAW.mkdir(parents=True, exist_ok=True)
    for n in names or PAINT:
        aspect, prompt = PAINT[n]
        raw, _ = replicate(prompt, None, aspect)
        Image.open(io.BytesIO(raw)).convert("RGB").save(RAW / f"{n}.webp", quality=95)
        print(f"  {n}: painted")


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
    return im.crop(im.getbbox())


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


def build():
    UI.mkdir(parents=True, exist_ok=True)
    meta = {}
    def save(name, im, fmt="webp"):
        path = UI / f"{name}.{fmt}"
        im.save(path, quality=88) if fmt == "webp" else im.save(path)
        meta[name] = {"file": path.name, "size": list(im.size), **({"slice": SLICES[name.split("-hover")[0].split("-pressed")[0]]}
                                                                   if name.split("-hover")[0].split("-pressed")[0] in SLICES else {})}
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
    (UI / "ui.json").write_text(json.dumps(meta, indent=1))
    print(f"built {len(meta)} assets in {UI.relative_to(ROOT)}")


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


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    {"paint": lambda: paint(a[1:]), "build": build, "sheet": lambda: sheet(a[1])}[a[0]]()
