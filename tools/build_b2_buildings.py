"""Put the picked new-Book-2 buildings (gen_pixel.py --set jade-b2) into the Jade kit.

    python3 tools/build_b2_buildings.py     # -> assets/tk/jade/b2_buildings.png and kits/jade.json

PICKS names, per kind, the tries kept (more than one: variants the maps pick between). Each is trimmed
to its pixels and packed on one sheet; the kind's sprites in jade.json become these (its stand-in goes).
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/tk/gen/jade-b2"
# banquet-1 came back nearly empty: not picked
PICKS = {
    "building.hall_grand": [1, 2], "building.palace": [2], "building.wing": [1, 2],
    "building.pavilion": [2], "building.pavilion_painted": [2], "building.gatetower": [1],
    "building.granary": [1], "building.storehouse": [1], "building.posthouse": [1],
    "building.gatehouse": [1], "camp.banquet": [2], "market.stalls": [2],
    # the second batch (--set jade-b2b): the rockeries and ridges came back as scenes and buildings (drawn by
    # code instead, tools/draw_b2_extras.py); wing_side-1 is a front view
    "building.compound": [1, 2], "building.wing_side": [2], "landmark.heights": [1, 2],
    "building.hut": [1, 2], "building.tent_small": [1, 2],
}


def main():
    ims = []
    for kind, tries in PICKS.items():
        for n in tries:
            im = Image.open(SRC / f"{kind}-{n}.png").convert("RGBA")
            ims.append((kind, im.crop(im.getbbox())))
    W = 512
    x = y = rowh = 0
    pos = []
    for kind, im in sorted(ims, key=lambda t: -t[1].height):
        if x + im.width > W:
            x, y, rowh = 0, y + rowh + 1, 0
        pos.append((kind, im, x, y))
        x += im.width + 1
        rowh = max(rowh, im.height)
    sheet = Image.new("RGBA", (W, y + rowh))
    for _, im, px, py in pos:
        sheet.alpha_composite(im, (px, py))
    out = ROOT / "assets/tk/jade/b2_buildings.png"
    sheet.save(out)
    path = ROOT / "assets/tk/kits/jade.json"
    kit = json.loads(path.read_text())
    kit["sheets"]["b2_buildings"] = str(out.relative_to(ROOT))
    kinds = {}
    for kind, im, px, py in pos:
        kinds.setdefault(kind, []).append(["b2_buildings", px, py, im.width, im.height])
    kit["kinds"].update(kinds)
    path.write_text(json.dumps(kit, indent=1))
    print(f"{len(pos)} sprites for {len(kinds)} kinds -> {out.relative_to(ROOT)} ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
