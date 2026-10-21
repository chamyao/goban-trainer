"""The event page's art (events.js, #/events), painted by Seedream 5 Pro on Replicate (the user: "don't hesitate to
generate graphics, we should avoid relying on emojis"): each event's key-art banner and its currency's icon, and the
page's own icons (the sign-in, tasks, shop and collection tabs, a gift). No text, no logos, no people: the banner's
character is the player's picked avatar, laid over it by the page.

    python3 tools/gen_event_art.py paint [NAME ...]   # raw art into assets/events/raw/ (one try each, ~$0.045 an image)
    python3 tools/gen_event_art.py build              # raw -> assets/events/*.webp (banners) and *.png (icons, cut out)
    python3 tools/gen_event_art.py sheet OUT.png      # a contact sheet of the built art

A new event: a BANNERS and a CURRENCY entry under its id (events.js LIST), then paint and build those two.
"""
import io
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
OUT = ROOT / "assets/events"
RAW = OUT / "raw"

KEY = ("Painterly hand-painted key art for a mobile game's seasonal event banner, cinematic and luminous, rich "
       "saturated colour, soft glow and depth, polished like a gacha game's event page. A wide scene: the left third "
       "calmer and darker (a title goes there), the focus centre-right, a go board with black and white stones somewhere "
       "in the scene. No people, no faces, no text, no letters, no logos, no watermark.")
ICON = ("A single chunky glossy game item icon, painterly hand-painted, bold simple silhouette, rich saturated colour, "
        "soft rim light and a bright highlight, centred, filling most of the frame, in the style of a polished mobile "
        "game's item icons. Isolated on a plain flat pure white background, nothing else. No text, no letters.")

BANNERS = {
    "kisei": "A Japanese title-match room in deep winter: tatami, a thick kaya go board on its legs, sliding shoji open "
             "onto a snowy garden at dusk, a single gold star bright in the indigo sky.",
    "spring-festival": "A Chinese courtyard on Lunar New Year's night: rows of glowing red lanterns, red plum blossom, "
                       "firework sparks overhead, a go board on a lacquered table with red envelopes beside it.",
    "valentines": "A cosy candlelit tea room for Valentine's: soft pink and crimson, roses and rose petals, a go board "
                  "with two teacups, heart-shaped chocolates in a box, warm bokeh lights.",
    "alphago": "A dark futuristic hall of glowing blue circuitry and data streams flowing like rivers of light, a go "
               "board in the centre with stones that glow, a faint neural-network constellation above.",
    "spring": "A spring garden in morning light: cherry blossom trees, a meadow of wildflowers, painted pastel eggs in a "
              "woven basket, a go board on a picnic cloth.",
    "honinbo": "An Edo-period Japanese go house in early summer: open wooden verandah, purple irises in a garden pond, "
               "painted folding fans on a stand, a go board on its legs.",
    "go-seigen": "A quiet scholar's study, half Chinese half Japanese: ink brushes, a red seal and seal paste, bamboo "
                 "outside a round window, an old go board with a game in progress, soft afternoon light.",
    "dragon-boat": "A river festival at the Dragon Boat holiday: long carved dragon boats racing with spray, green "
                   "mountains, a riverside pavilion with zongzi wrapped in bamboo leaves beside a go board.",
    "summer": "A summer beach at golden sunset: turquoise sea, seashells and starfish on the sand, a go board under a "
              "striped parasol, gentle waves and warm light.",
    "qixi": "The Qixi night: a bridge of magpies arching across the glittering Milky Way, a star river of violet and "
            "blue, a lantern-lit pavilion below with a go board.",
    "kyu-to-dan": "A mountain path of stone steps climbing through misty pines toward a temple at dawn, paper scrolls "
                  "tied to a shrine rope, a go board on a stone table on a landing.",
    "mid-autumn": "The Mid-Autumn night: a huge full golden moon, osmanthus blossom, round paper lanterns, mooncakes on a "
                  "plate beside a go board in a moon-viewing pavilion.",
    "halloween": "A haunted go hall on Halloween night: a big pale moon, bats, glowing carved jack-o'-lanterns, candles "
                 "and cobwebs, wrapped candy spilled beside a go board, purples and pumpkin orange. Spooky but friendly.",
    "harvest": "A harvest barn at golden hour for Thanksgiving: wheat sheaves, pumpkins and gourds, a basket of acorns, "
               "maple leaves drifting, a go board on a rustic wooden table, amber light.",
    "winter": "A snowy pavilion at night in winter: falling snowflakes, glowing lanterns, snow-laden pine, frosted "
              "window light, a go board with a light dusting of snow, blue and gold.",
}
CURRENCY = {
    "kisei": "A gold star medal with a soft glow.",
    "spring-festival": "A red paper envelope (hongbao) with a gold pattern and a gold coin peeking out.",
    "valentines": "A glossy red heart-shaped chocolate wrapped in gold foil.",
    "alphago": "A small glowing blue computer chip with circuit lines of light.",
    "spring": "A pastel painted Easter egg with flowers and stripes.",
    "honinbo": "A Japanese folding fan, half open, with a wave pattern.",
    "go-seigen": "A small red jade carved seal stamp with a lion knob.",
    "dragon-boat": "A zongzi rice dumpling wrapped in green bamboo leaves and tied with string.",
    "summer": "A pink and cream spiral seashell.",
    "qixi": "A single glossy black-and-blue magpie feather with an iridescent sheen.",
    "kyu-to-dan": "A rolled paper scroll tied with a red cord and two wooden rollers.",
    "mid-autumn": "A golden-brown mooncake with a pressed flower pattern on top.",
    "halloween": "A wrapped candy in orange and purple striped wrapper with twisted ends.",
    "harvest": "A plump glossy acorn with its cap.",
    "winter": "A sparkling ice-blue snowflake crystal.",
}
UI_ICONS = {
    "tab-signin": "A small wall almanac calendar with red rings and a red ribbon bookmark.",
    "tab-tasks": "A bamboo-slip scroll half unrolled with a gold check mark tag hanging from it.",
    "tab-shop": "A small red market stall with a striped awning and a gold coin pouch on the counter.",
    "tab-collection": "A small lacquered red-and-gold treasure chest, lid slightly open with a glow inside.",
    "gift": "A wrapped gift box with a red ribbon bow, gold paper.",
    "calendar": "A small paper desk calendar with a red header band and a pinned gold star.",
}
PAINT = {**{f"banner-{k}": ("21:9", f"{v} {KEY}") for k, v in BANNERS.items()},
         **{f"cur-{k}": ("1:1", f"{v} {ICON}") for k, v in CURRENCY.items()},
         **{k: ("1:1", f"{v} {ICON}") for k, v in UI_ICONS.items()}}


def paint(names):
    from gen_stills import replicate
    RAW.mkdir(parents=True, exist_ok=True)
    def one(n):
        aspect, prompt = PAINT[n]
        try:
            raw, _ = replicate(prompt, None, aspect)
        except Exception as e:
            return f"  {n}: FAILED {e}"
        Image.open(io.BytesIO(raw)).convert("RGB").save(RAW / f"{n}.webp", quality=95)
        return f"  {n}: painted"
    with ThreadPoolExecutor(8) as ex:
        for line in ex.map(one, names or list(PAINT)):
            print(line, flush=True)


def build():
    from build_portraits import cut_851
    OUT.mkdir(parents=True, exist_ok=True)
    def one(n):
        src = RAW / f"{n}.webp"
        if not src.exists():
            return f"  {n}: not painted"
        dst = OUT / (f"{n}.webp" if n.startswith("banner-") else f"{n}.png")
        if dst.exists() and dst.stat().st_mtime > src.stat().st_mtime:
            return f"  {n}: up to date"
        im = Image.open(src)
        if n.startswith("banner-"):   # 1600x560: the painting's middle band
            w = im.width; h = round(w * 560 / 1600); y0 = (im.height - h) // 2
            im.convert("RGB").crop((0, y0, w, y0 + h)).resize((1600, 560), Image.LANCZOS).save(OUT / f"{n}.webp", quality=82, method=6)
        else:   # cut out, cropped to the solid art, squared, 192px
            im = cut_851(im)
            solid = im.getchannel("A").point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.MinFilter(5))
            x0, y0, x1, y1 = solid.getbbox()
            im = im.crop((x0, y0, x1, y1))
            s = max(im.size); sq = Image.new("RGBA", (s, s)); sq.alpha_composite(im, ((s - im.width) // 2, (s - im.height) // 2))
            sq.resize((192, 192), Image.LANCZOS).save(OUT / f"{n}.png", optimize=True)
        return f"  {n}: built"
    with ThreadPoolExecutor(2) as ex:   # (the remover allows only a few at once: 429 beyond)
        for line in ex.map(one, list(PAINT)):
            print(line, flush=True)


def sheet(out):
    ims = sorted(OUT.glob("*.webp")) + sorted(OUT.glob("*.png"))
    W, cols = 1600, 4
    tiles = [Image.open(p).convert("RGBA") for p in ims]
    tiles = [t.resize((W // cols, round(t.height * (W // cols) / t.width))) for t in tiles]
    rows = [tiles[i:i + cols] for i in range(0, len(tiles), cols)]
    H = sum(max(t.height for t in r) for r in rows)
    sh = Image.new("RGBA", (W, H), (60, 60, 70, 255)); y = 0
    for r in rows:
        for i, t in enumerate(r):
            sh.alpha_composite(t, (i * (W // cols), y))
        y += max(t.height for t in r)
    sh.convert("RGB").save(out)


if __name__ == "__main__":
    cmd, args = sys.argv[1], sys.argv[2:]
    {"paint": lambda: paint(args), "build": build, "sheet": lambda: sheet(args[0])}[cmd]()
