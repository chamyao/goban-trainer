"""Paint a still with the portraits of the CAST it names as reference images (their white-background originals),
so the people match their dialogue portraits. Misaeng: the user asked that stills match the character designs.

    python3 tools/ref_still.py ID assets/tk/stills/samples/review/ID--final-1.jpg   # then install_stills.py as usual
"""
import base64, os, sys, time
from pathlib import Path
sys.path.insert(0, "tools")
from gen_stills import fetch, fit, http
import tk_stills as t
R = Path("assets/tk/stills/samples/review")
def src(key):   # the portrait's original: an edit, else an outpaint, else the first try
    for p in (R / "edit" / f"face_{key}--1.png", R / "outpaint" / f"face_{key}--1.png", R / f"face_{key}--1.png"):
        if p.exists():
            return p
sid, dest = sys.argv[1], sys.argv[2]
keys = [k for k in t.cast_in(sid) if src(k)]
text = t.prompt(sid)
lead = " ".join(f"Reference image {i + 1} shows {t.CAST[k][0]}." for i, k in enumerate(keys))
if keys:
    lead += " Keep each person's face, hair and clothes exactly as in their reference, drawn into this scene (not the white background or the pose). "
uris = ["data:image/png;base64," + base64.b64encode(src(k).read_bytes()).decode() for k in keys]
h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
body = {"prompt": lead + text, "aspect_ratio": "16:9", "size": "1K", "output_format": "png"}
if uris:
    body["image_input"] = uris
r = http("https://api.replicate.com/v1/models/bytedance/seedream-5-pro/predictions", {"input": body}, h)
while r.get("status") not in ("succeeded", "failed", "canceled"):
    time.sleep(2); r = http(r["urls"]["get"], headers=h)
if r["status"] != "succeeded":
    sys.exit(f"{sid}: failed: {r.get('error')}")
out = r["output"]
fit(fetch(out[0] if isinstance(out, list) else out)).save(dest, "JPEG", quality=86)
Path(dest).with_suffix(".txt").write_text(lead + text)
print(f"{sid}: ok, refs {keys}")
