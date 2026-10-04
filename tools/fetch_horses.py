"""Fetch the LPC horses and scale them to the heroes' size.

    python3 tools/fetch_horses.py

Source: "[LPC] Horses" by bluecarrot16, https://opengameart.org/content/lpc-horses
(CC-BY 3.0 / CC-BY-SA 3.0 / GPL / OGA-BY 3.0; used under OGA-BY 3.0, credit in
assets/tk/CREDITS.txt). The sheets are drawn for 32px-tall people on 128px
frames; our heroes are 20px tall, so the walk cycles are scaled by 0.4.

Writes assets/tk/horses/<coat>.png: four rows (down, left, right, up), four
walk frames each, every frame FRAME x FRAME with the hooves on the same line,
and assets/tk/horses/horses.json with the frame size and the hoof line.
"""
import io
import json
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/tk/horses"
URL = "https://opengameart.org/sites/default/files/horse-{}_0.png"
COATS = ["brown", "black", "white", "gray", "golden"]
SRC = 128                                           # source frame size
WALK = {"up": 4, "left": 5, "down": 6, "right": 7}  # source rows of the walk cycle
ORDER = ["down", "left", "right", "up"]
SCALE = .4


def shrink(frame):
    """Box-filter down, then make every pixel fully opaque or fully clear."""
    w = round(frame.width * SCALE)
    small = frame.resize((w, w), Image.BOX)
    px = small.load()
    for y in range(w):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= 110 else (0, 0, 0, 0)
    return small


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = None
    for coat in COATS:
        req = urllib.request.Request(URL.format(coat), headers={"User-Agent": "goban-trainer"})
        sheet = Image.open(io.BytesIO(urllib.request.urlopen(req).read())).convert("RGBA")
        frames = {d: [shrink(sheet.crop((c * SRC, r * SRC, c * SRC + SRC, r * SRC + SRC))) for c in range(4)]
                  for d, r in WALK.items()}
        # one crop box for every frame, so the horse doesn't jitter
        boxes = [f.getbbox() for fs in frames.values() for f in fs]
        x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
        x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
        fw, fh = x1 - x0, y1 - y0
        out = Image.new("RGBA", (fw * 4, fh * 4))
        for row, d in enumerate(ORDER):
            for c, f in enumerate(frames[d]):
                out.paste(f.crop((x0, y0, x1, y1)), (c * fw, row * fh))
        out.save(OUT / f"{coat}.png")
        meta = {"frame": [fw, fh], "rows": ORDER, "walk": [0, 1, 2, 3],
                "credit": "[LPC] Horses by bluecarrot16, OGA-BY 3.0, https://opengameart.org/content/lpc-horses"}
        print(f"{coat}: {fw}x{fh} frames")
    (OUT / "horses.json").write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
