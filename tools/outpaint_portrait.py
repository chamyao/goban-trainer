"""Give a cut-off dialogue portrait its headroom and side margins back, with the same face and costume: the original
generated portrait (assets/tk/stills/samples/review/face_<who>--1.png) is placed small on a wider white canvas, waist on
the bottom edge, and Seedream 5 Pro paints in what was cut off. The results go to a separate folder, ready for
build_portraits.

    python3 tools/outpaint_portrait.py WHO ...       # -> assets/tk/stills/samples/review/outpaint/face_<who>--1.png
    python3 tools/build_portraits.py assets/tk/stills/samples/review/outpaint --remover 851 --only WHO ...

Then check the edges (tools/art_sheet.py edges WHO ...: a good cut-out touches only the bottom) and bump PORTRAIT_V.
About $0.045 per portrait (REPLICATE_API_TOKEN, from the environment).
"""
import base64
import io
import os
import sys
import time
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from gen_stills import fetch, http  # noqa: E402

SRC = ROOT / "assets/tk/stills/samples/review"
DEST = SRC / "outpaint"
PROMPT = ("Outpaint this character portrait: the picture has been placed small in the middle of a larger plain white "
          "canvas. Complete everything that was cut off at the edges (the top of the hair and hair ornaments, the sleeves, "
          "arms, sword or weapon) so the whole figure, from the top of the head down to the waist, fits inside the frame "
          "with clear white space above the head and on both sides. Keep the same person, face, expression, pose, costume, "
          "colours and art style exactly. Plain flat pure white background, nothing else.")


def outpaint(who):
    src = Image.open(SRC / f"face_{who}--1.png").convert("RGB")
    w, h = src.size
    W, H = int(w * 1.5), int(h * 1.3)
    canvas = Image.new("RGB", (W, H), "white")
    canvas.paste(src, ((W - w) // 2, H - h))
    canvas.thumbnail((1024, 1024))
    buf = io.BytesIO()
    canvas.save(buf, "PNG")
    uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    hd = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    r = http("https://api.replicate.com/v1/models/bytedance/seedream-5-pro/predictions",
             {"input": {"prompt": PROMPT, "image_input": [uri], "aspect_ratio": "3:4", "size": "1K", "output_format": "png"}}, hd)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2)
        r = http(r["urls"]["get"], headers=hd)
    if r["status"] != "succeeded":
        print(f"{who}: {r['status']} {r.get('error')}")
        return
    out = r["output"]
    im = Image.open(io.BytesIO(fetch(out[0] if isinstance(out, list) else out))).convert("RGB")
    im.thumbnail((768, 1024))
    DEST.mkdir(parents=True, exist_ok=True)
    im.save(DEST / f"face_{who}--1.png")
    print(f"{who}: {(DEST / f'face_{who}--1.png').relative_to(ROOT)}")


if __name__ == "__main__":
    for w in sys.argv[1:] or sys.exit(__doc__):
        outpaint(w)
