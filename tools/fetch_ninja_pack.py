"""Fetch the Ninja Adventure asset pack (Pixel-boy & AAA, CC0) and copy the
sheets the map kit uses into assets/tk/ninja/.

    python3 tools/fetch_ninja_pack.py            # download from itch.io
    python3 tools/fetch_ninja_pack.py PACK.zip   # or use a zip you already have

Pack page: https://pixel-boy.itch.io/ninja-adventure-asset-pack
The download is free; this follows the same steps as the page's
"Download Now" button (no account needed).
"""
import io
import json
import re
import shutil
import sys
import tempfile
import urllib.parse
import urllib.request
import zipfile
from http.cookiejar import CookieJar
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/tk/ninja"
PAGE = "https://pixel-boy.itch.io/ninja-adventure-asset-pack"
UPLOAD = 16981275  # "Ninja Adventure - Asset Pack.zip"

# zip path (under "Ninja Adventure - Asset Pack/") -> file name in assets/tk/ninja
TILESETS = {
    "Backgrounds/Tilesets/TilesetFloor.png": "floor.png",
    "Backgrounds/Tilesets/TilesetWater.png": "water.png",
    "Backgrounds/Tilesets/TilesetNature.png": "nature.png",
    "Backgrounds/Tilesets/TilesetHouse.png": "house.png",
    "Backgrounds/Tilesets/tileset_camp.png": "camp.png",
    "Backgrounds/Tilesets/TilesetElement.png": "element.png",                # furniture
    "Backgrounds/Tilesets/Interior/TilesetInteriorFloor.png": "floor_in.png",  # floors inside
    "Backgrounds/Tilesets/Interior/TilesetWallSimple.png": "wall_in.png",     # a room's walls
}
# townsfolk with full 4x4 walk sheets (Child and OldWoman only have two frames)
FOLK = ["Villager", "Villager2", "Villager3", "Villager4", "Villager5", "Woman", "OldMan", "OldMan2",
        "Monk", "Boy", "Noble", "Hunter", "Master", "Samurai", "Inspector"]
FILES = dict(TILESETS)
for f in FOLK:
    FILES[f"Actor/Character/{f}/SpriteSheet.png"] = f"folk/{f.lower()}.png"
# pieces for cutscene props, emote bubbles and gift icons (tools/build_props.py)
PROPS = ["Ui/Emote/emote4.png", "Ui/Emote/emote19.png", "Ui/Emote/emote20.png", "Ui/Emote/emote22.png",
         "Ui/Emote/emote23.png", "Ui/Emote/emote27.png", "Ui/Emote/emote28.png",
         "Items/Tool/Anvil.png", "Items/Tool/Hammer.png", "Items/Object/Gourd.png", "Items/Object/MoneyBag.png",
         "Items/Weapons/Sword/Sprite.png", "Items/Weapons/Lance/Sprite.png", "Items/Weapons/Lance2/Sprite.png"]
for f in PROPS:
    FILES[f] = "props/" + f.split("/", 1)[1].replace("/Sprite.png", ".png").replace("/", "_")
FILES["LICENSE.txt"] = "LICENSE.txt"


def download(dest):
    jar = CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    html = op.open(PAGE).read().decode()
    csrf = re.search(r'name="csrf_token" value="([^"]+)"', html).group(1)
    body = urllib.parse.urlencode({"csrf_token": csrf}).encode()
    url = f"{PAGE}/file/{UPLOAD}?source=view_game&as_props=1&after_download_lightbox=true"
    signed = json.loads(op.open(url, body).read())["url"]
    with op.open(signed) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)


def main():
    if len(sys.argv) > 1:
        zpath = Path(sys.argv[1])
    else:
        zpath = Path(tempfile.gettempdir()) / "ninja-adventure.zip"
        if not zpath.exists():
            print("downloading the Ninja Adventure pack (about 90 MB)…")
            download(zpath)
    with zipfile.ZipFile(zpath) as z:
        names = {n.split("/", 1)[1]: n for n in z.namelist() if "/" in n}
        for src, dst in FILES.items():
            out = OUT / dst
            out.parent.mkdir(parents=True, exist_ok=True)
            data = z.read(names[src])
            if dst.endswith(".png") and "/" not in dst:
                # trim sheets to whole tiles (TilesetFloor is 417px tall)
                im = Image.open(io.BytesIO(data))
                w, h = im.width // 16 * 16, im.height // 16 * 16
                if (w, h) != im.size:
                    buf = io.BytesIO()
                    im.crop((0, 0, w, h)).save(buf, "PNG")
                    data = buf.getvalue()
            out.write_bytes(data)
    print(f"copied {len(FILES)} files into {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
