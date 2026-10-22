"""Avatar skins: an alternate outfit for a painted portrait, made by an image edit of the portrait itself (Seedream 5
Pro), so the face, hair, pose, framing and style stay and only the clothes change. The edit is cut out again
(851-labs/background-remover) onto a canvas the size of the source, the figure where it stood, so a skin swaps in 1:1.

    python3 tools/gen_skins.py [SKIN ...]     # -> assets/tk/portraits/skins/<skin>.webp (+ raw/<skin>.png), ~$0.05 each
    python3 tools/gen_skins.py --fix SKIN "instruction"   # an edit of the skin itself; the old one kept as raw/<skin>.orig.webp

REPLICATE_API_TOKEN comes from the environment. One try each; fix a skin by editing it again, never by repainting.
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
PORT = ROOT / "assets/tk/portraits"
OUT = PORT / "skins"

KEEP = ("Keep exactly the same person: the same face, expression, eyes, hair and hairstyle, the same pose, hands, "
        "framing and crop, the same anime painting style, line work and soft lighting. Change only the clothes and "
        "accessories as described. Plain flat pure white background.")
SKINS = {   # skin: (source portrait, the new outfit)
    "diaochan-fox": ("diaochan", "Dress her as a nine-tailed fox spirit for Halloween: soft white fur fox ears rising "
                     "from her hair, a crimson-and-black hanfu with flowing sleeves and a gold-embroidered sash in place "
                     "of the white robe, several fluffy white fox tails fanning out behind her, and a small glowing red "
                     "paper lantern hanging at her side."),
    "ahn-weekend": ("ms_ahn", "Dress her in a casual autumn weekend outfit in place of the office suit: a soft cream "
                    "cable-knit sweater, an open camel wool coat over it, and a red-and-brown plaid scarf loosely around "
                    "her neck. Keep her small gold earrings, necklace and gold wristwatch."),
    "caocao-armor": ("caocao", "Dress him in a warlord's battle armour in place of the court robes: black lacquered "
                     "lamellar armour with gold edging and gold dragon details on the shoulder plates, a crimson cape "
                     "behind his shoulders, and a black crested war helmet with a red plume in place of the court hat."),
}


def edit(skin, fix=None):
    from gen_stills import fetch, http
    from build_portraits import cut_851
    src_id, outfit = SKINS[skin]
    src = Image.open(PORT / f"{src_id}.webp").convert("RGBA")
    if fix:   # edit the skin as it stands, not the plain portrait
        (OUT / "raw").mkdir(parents=True, exist_ok=True)
        orig = OUT / "raw" / f"{skin}.orig.webp"
        if not orig.exists():
            Image.open(OUT / f"{skin}.webp").save(orig, quality=95)
        src, outfit = Image.open(OUT / f"{skin}.webp").convert("RGBA"), fix + " Keep the outfit otherwise exactly as it is."
    W, H = src.size
    # on white, padded to 3:4 (the figure bottom-left as it stands), so the edit comes back the same shape
    PW, PH = max(W, round(H * 3 / 4)), max(H, round(W * 4 / 3))
    pad = Image.new("RGB", (PW, PH), "white"); pad.paste(src, (0, PH - H), src)
    buf = io.BytesIO(); pad.save(buf, "JPEG", quality=93)
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    r = http("https://api.replicate.com/v1/models/bytedance/seedream-5-pro/predictions",
             {"input": {"prompt": f"Edit this image. {outfit} {KEEP}", "aspect_ratio": "3:4", "size": "1K", "output_format": "png",
                        "image_input": ["data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()]}}, h)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2); r = http(r["urls"]["get"], headers=h)
    if r["status"] != "succeeded":
        sys.exit(f"{skin}: {r['status']} {r.get('error')}")
    out = r["output"]
    raw = Image.open(io.BytesIO(fetch(out[0] if isinstance(out, list) else out))).convert("RGB")
    (OUT / "raw").mkdir(parents=True, exist_ok=True); raw.save(OUT / "raw" / f"{skin}.png")
    back = raw.resize((PW, PH), Image.LANCZOS).crop((0, PH - H, W, PH))   # the source's own box
    cut = cut_851(back)
    cut.save(OUT / f"{skin}.webp", quality=90)
    print(f"  {skin}: {cut.size} from {src_id} ({W}x{H})")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["--fix"]:
        edit(a[1], a[2])
    else:
        for s in a or SKINS:
            edit(s)
