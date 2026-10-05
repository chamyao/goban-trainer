"""Pixel art from Retro Diffusion (on Replicate) for a new art kit: ground textures, objects,
and character sprites, all held to one palette.

    python3 tools/gen_pixel.py                 # make every piece in PIECES that doesn't exist yet
    python3 tools/gen_pixel.py --only hall --force
    python3 tools/gen_pixel.py --list

Needs REPLICATE_API_TOKEN. Writes assets/tk/gen/<id>.png and assets/tk/gen/gen.json (what made
each). The look is a Chinese fantasy game: jade, teal, vermilion and gold, pale stone, ink
outlines. Textures tile seamlessly (tile_x/tile_y); objects come with their background removed;
sprites are 4-direction sheets. PALETTE below is drawn to palette.png and sent with every request.
"""
import argparse
import json
import os
import sys
import time
import urllib.request
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from gen_stills import data_uri, fetch, http  # noqa: E402

OUT = ROOT / "assets/tk/gen"

PALETTE = ["#2a2230", "#4a3f4f", "#6b3e26", "#9a6a3e", "#2f5d50", "#4f8a6b", "#8cc49a", "#3e7c86",
           "#7fbcc4", "#c0392b", "#e0603a", "#d9a441", "#f2d27a", "#f2a7b8", "#e8e2d0", "#b8b09a",
           "#7d7466", "#f7f3ea"]

LOOK = "Chinese fantasy RPG, xianxia, Eastern Han dynasty"

# id: model, style, size, prompt, and how: tile (seamless ground), cutout (background removed),
# sheet (animation as a sprite sheet)
PIECES = {
    "grass": ("rd-plus", "topdown_map", (64, 64), "lush jade-green grass with clover and tiny white flowers, "
              "flat top-down ground texture, no objects", "tile"),
    "stone": ("rd-plus", "topdown_map", (64, 64), "pale grey flagstone courtyard paving, irregular stones, moss in the "
              "cracks, flat top-down ground texture", "tile"),
    "water": ("rd-plus", "topdown_map", (64, 64), "clear teal pond water with soft ripples and a few lotus pads, flat "
              "top-down texture", "tile"),
    "t16_grass": ("rd-fast", "texture", (64, 64), "jade-green grass with clover and a few tiny white flowers, flat seamless game texture, 16 pixel tiles", "tile"),
    "t16_stone": ("rd-fast", "texture", (64, 64), "pale grey flagstone courtyard paving with moss in the cracks, flat seamless game texture, 16 pixel tiles", "tile"),
    "t16_water": ("rd-fast", "texture", (64, 64), "clear teal pond water with soft ripples, flat seamless game texture, 16 pixel tiles", "tile"),
    "t16_dirt": ("rd-fast", "texture", (64, 64), "packed light-brown dirt road with small pebbles, flat seamless game texture, 16 pixel tiles", "tile"),
    "t16_wall": ("rd-fast", "texture", (64, 64), "white plaster wall with faint cracks and a grey stone base, flat seamless game texture, 16 pixel tiles", "tile"),
    "t16_roof": ("rd-fast", "texture", (64, 64), "jade-green glazed Chinese roof tiles in curved overlapping rows, flat seamless game texture, 16 pixel tiles", "tile"),
    "t32_grass": ("rd-fast", "texture", (128, 128), "jade-green grass with clover and a few tiny white flowers, flat seamless game texture, 32 pixel tiles", "tile"),
    "t32_stone": ("rd-fast", "texture", (128, 128), "pale grey flagstone courtyard paving with moss in the cracks, flat seamless game texture, 32 pixel tiles", "tile"),
    "t32_water": ("rd-fast", "texture", (128, 128), "clear teal pond water with soft ripples, flat seamless game texture, 32 pixel tiles", "tile"),
    "t32_dirt": ("rd-fast", "texture", (128, 128), "packed light-brown dirt road with small pebbles, flat seamless game texture, 32 pixel tiles", "tile"),
    "t32_wall": ("rd-fast", "texture", (128, 128), "white plaster wall with faint cracks and a grey stone base, flat seamless game texture, 32 pixel tiles", "tile"),
    "t32_roof": ("rd-fast", "texture", (128, 128), "jade-green glazed Chinese roof tiles in curved overlapping rows, flat seamless game texture, 32 pixel tiles", "tile"),
    "hall": ("rd-plus", "topdown_asset", (96, 96), "Chinese palace hall, red lacquered pillars, curved upswept roof with "
             "jade-green glazed tiles and gold ridge ornaments, white stone steps, front door", "cutout"),
    "pine": ("rd-plus", "topdown_asset", (48, 64), "twisted Chinese pine tree with flat layered clusters of dark green "
             "needles, like an ink painting", "cutout"),
    "peach": ("rd-plus", "topdown_asset", (48, 48), "peach tree in full pink blossom, dark twisting trunk", "cutout"),
    "moongate": ("rd-plus", "topdown_asset", (64, 64), "round moon gate in a white plaster wall with grey tiled coping",
                 "cutout"),
    "liubei": ("rd-animation", "small_sprites", (32, 32), "young Chinese hero in a white robe with gold trim, black "
               "topknot, short black beard", "sheet"),
    "liubei64": ("rd-plus", "topdown_asset", (64, 64), "full-body game character sprite of a young Chinese hero "
                 "standing, white robe with gold trim, black topknot, short black beard, 3/4 top-down view", "cutout"),
    "liubei64turn": ("rd-plus", "character_turnaround", (256, 64), "young Chinese hero in a white robe with gold "
                     "trim, black topknot, short black beard; front, side, back and three-quarter views", "cutout"),
    "liubei48": ("rd-animation", "four_angle_walking", (48, 48), "young Chinese hero in a white robe with gold trim, "
                 "black topknot, short black beard", "sheet"),
}


def palette_png():
    p = OUT / "palette.png"
    if not p.exists():
        im = Image.new("RGB", (len(PALETTE), 1))
        for i, c in enumerate(PALETTE):
            im.putpixel((i, 0), tuple(int(c[k:k + 2], 16) for k in (1, 3, 5)))
        im.resize((len(PALETTE) * 8, 8), Image.NEAREST).save(p)
    return p


def run(model, inp):
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    r = http(f"https://api.replicate.com/v1/models/retro-diffusion/{model}/predictions", {"input": inp}, h)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2)
        r = http(r["urls"]["get"], headers=h)
    if r["status"] != "succeeded":
        raise RuntimeError(f"{model}: {r.get('status')} {r.get('error')}")
    out = r["output"]
    return fetch(out[0] if isinstance(out, list) else out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", action="append")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--pause", type=float, default=12, help="seconds between requests (rate limits)")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    log_path = OUT / "gen.json"
    log = json.loads(log_path.read_text()) if log_path.exists() else {}
    if a.list:
        for k, (m, st, (w, h), p, how) in PIECES.items():
            print(f"{'✓' if (OUT / f'{k}.png').exists() else '·'} {k:10} {m}/{st} {w}x{h} {how}: {p}")
        return
    pal = data_uri(palette_png())
    first = True
    for k, (model, style, (w, h), prompt, how) in PIECES.items():
        if (a.only and k not in a.only) or ((OUT / f"{k}.png").exists() and not a.force):
            continue
        if not first:
            time.sleep(a.pause)
        first = False
        inp = {"prompt": f"{prompt}, {LOOK}", "style": style, "width": w, "height": h}
        if model != "rd-animation":
            inp["input_palette"] = pal
            if how == "tile":
                inp["tile_x"] = inp["tile_y"] = True
                inp["bypass_prompt_expansion"] = True   # it adds scenery to a plain texture otherwise
            if how == "cutout":
                inp["remove_bg"] = True
        else:
            inp["return_spritesheet"] = True
        t = time.time()
        try:
            raw = run(model, inp)
        except Exception as e:
            print(f"  {k}: failed: {e}")
            continue
        (OUT / f"{k}.png").write_bytes(raw)
        size = Image.open(OUT / f"{k}.png").size
        log[k] = {"model": f"retro-diffusion/{model}", "style": style, "prompt": inp["prompt"], "size": list(size),
                  "how": how, "seconds": round(time.time() - t, 1), "made": date.today().isoformat()}
        log_path.write_text(json.dumps(log, indent=1))
        print(f"  {k}: {model}/{style} {size[0]}x{size[1]} in {log[k]['seconds']}s → assets/tk/gen/{k}.png")


if __name__ == "__main__":
    main()
