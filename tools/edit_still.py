"""Fix an existing still by an image edit of itself, not a regeneration: the still is sent to Seedream 5 Pro as its
input image with an instruction ("remove the third, unheld blade"), so everything the instruction doesn't touch stays.

    python3 tools/edit_still.py ID "instruction"             # -> assets/tk/stills/samples/review/<ID>--edit-<n>.jpg
    python3 tools/edit_still.py ID --install FILE "note"     # put a checked edit in the game; note says what changed

Look at the edit before installing it. Install stamps the stills.json entry with "edit" (the note) and today's "made",
which changes the still's URL key (tk-cutscene stillSrc), then bump stills.json's ?v (tools/bump_cache.py stills).
One call is about $0.045 (REPLICATE_API_TOKEN, from the environment).
"""
import base64
import json
import os
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from gen_stills import OUT, fetch, fit, http  # noqa: E402

MODEL = "bytedance/seedream-5-pro"


def edit(sid, instruction):
    src = OUT / f"{sid}.jpg"
    uri = "data:image/jpeg;base64," + base64.b64encode(src.read_bytes()).decode()
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    prompt = f"Edit this image. {instruction} Change nothing else: same people, faces, colours, style and composition."
    r = http(f"https://api.replicate.com/v1/models/{MODEL}/predictions",
             {"input": {"prompt": prompt, "image_input": [uri], "aspect_ratio": "16:9", "size": "1K", "output_format": "png"}}, h)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2)
        r = http(r["urls"]["get"], headers=h)
    if r["status"] != "succeeded":
        sys.exit(f"{sid}: {r['status']} {r.get('error')}")
    out = r["output"]
    dest_dir = OUT / "samples/review"
    dest_dir.mkdir(parents=True, exist_ok=True)
    n = 1
    while (dest_dir / f"{sid}--edit-{n}.jpg").exists():
        n += 1
    dest = dest_dir / f"{sid}--edit-{n}.jpg"
    fit(fetch(out[0] if isinstance(out, list) else out)).save(dest, "JPEG", quality=86)
    dest.with_suffix(".txt").write_text(prompt)
    print(f"{sid}: {dest.relative_to(ROOT)}")


def install(sid, path, note):
    fit(Path(path).read_bytes()).save(OUT / f"{sid}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    man_path = OUT / "stills.json"
    man = json.loads(man_path.read_text())
    man[sid]["edit"] = note
    man[sid]["made"] = date.today().isoformat()
    man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))
    print(f"{sid}: installed {path}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 4 and a[1] == "--install":
        install(a[0], a[2], a[3])
    elif len(a) == 2:
        edit(*a)
    else:
        sys.exit(__doc__)
