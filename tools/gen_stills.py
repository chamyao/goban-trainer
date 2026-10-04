"""Make the painted stills (tools/tk_stills.py) with an image-generation API.

    python3 tools/gen_stills.py                # make every still that doesn't exist yet
    python3 tools/gen_stills.py --list         # what exists, what's missing, with the full prompts
    python3 tools/gen_stills.py --only oath --force   # remake one
    python3 tools/gen_stills.py --provider openai     # pick a provider (default: the first with a key)
    python3 tools/gen_stills.py --import DIR          # bring in images made by hand (DIR/<id>.png|jpg|webp),
                                                      # e.g. from Midjourney/Niji, which has no API
    python3 tools/gen_stills.py --provider replicate --only feast_wide \
        --compare black-forest-labs/flux-schnell black-forest-labs/flux-2-klein-4b
                                                      # the same prompts on several models, side by side in
                                                      # assets/tk/stills/samples/index.html (the game's stills
                                                      # and stills.json are left alone)

Providers, chosen by which key is in the environment (set it in the cloud
environment's settings, or export it locally):

    OPENAI_API_KEY        openai     gpt-image-1        (TK_IMAGE_MODEL to change)
    REPLICATE_API_TOKEN   replicate  black-forest-labs/flux-1.1-pro
    FAL_KEY               fal        fal-ai/flux/dev
    GEMINI_API_KEY        google     gemini-2.5-flash-image
    (none)                dummy      a plain placeholder, to test the pipeline

Every image is cropped to 16:9 and saved as assets/tk/stills/<id>.jpg
(1280x720). assets/tk/stills/stills.json records what made each one (prompt,
provider, model, date), which the game reads to know what exists and the
credits read to say the stills are AI-generated.
"""
import argparse
import base64
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from tk_stills import STILLS, STYLE  # noqa: E402

OUT = ROOT / "assets/tk/stills"
SIZE = (1280, 720)


def http(url, body=None, headers=None, method=None, timeout=300):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method or ("POST" if data else "GET"),
                                 headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
    return json.loads(raw) if raw[:1] in (b"{", b"[") else raw


def fetch(url):
    with urllib.request.urlopen(url, timeout=300) as r:
        return r.read()


# ---------- providers: prompt → image bytes ----------
def openai(prompt, model):
    model = model or "gpt-image-1"
    r = http("https://api.openai.com/v1/images/generations",
             {"model": model, "prompt": prompt, "size": "1536x1024", "quality": "high", "n": 1},
             {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"})
    d = r["data"][0]
    return (base64.b64decode(d["b64_json"]) if d.get("b64_json") else fetch(d["url"])), model


def replicate(prompt, model):
    model = model or "black-forest-labs/flux-1.1-pro"
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    url = f"https://api.replicate.com/v1/models/{model}/predictions"
    try:
        r = http(url, {"input": {"prompt": prompt, "aspect_ratio": "16:9", "output_format": "png"}}, h)
    except urllib.error.HTTPError as e:
        if e.code != 422:                       # 422: this model names its inputs differently
            raise
        print(f"    ({model} refused aspect_ratio/output_format: {e.read()[:200]!r}; retrying with the prompt alone)")
        r = http(url, {"input": {"prompt": prompt}}, h)
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(2)
        r = http(r["urls"]["get"], headers=h)
    if r["status"] != "succeeded":
        raise RuntimeError(f"replicate: {r.get('status')} {r.get('error')}")
    out = r["output"]
    return fetch(out[0] if isinstance(out, list) else out), model


def fal(prompt, model):
    model = model or "fal-ai/flux/dev"
    r = http(f"https://fal.run/{model}", {"prompt": prompt, "image_size": "landscape_16_9", "num_images": 1},
             {"Authorization": f"Key {os.environ['FAL_KEY']}"})
    return fetch(r["images"][0]["url"]), model


def google(prompt, model):
    # Imagen 4 was retired on 17 Aug 2026; Gemini's image model takes its place
    model = model or "gemini-2.5-flash-image"
    r = http(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
             {"contents": [{"parts": [{"text": prompt}]}],
              "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}},
             {"x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    parts = r["candidates"][0]["content"]["parts"]
    return base64.b64decode(next(p["inlineData"]["data"] for p in parts if "inlineData" in p)), model


def dummy(prompt, model):
    """No key: a labelled gradient, so the whole pipeline (and the game's step) can be tested."""
    im = Image.new("RGB", SIZE)
    d = ImageDraw.Draw(im)
    for y in range(SIZE[1]):
        t = y / SIZE[1]
        d.line([(0, y), (SIZE[0], y)], fill=(int(70 + 120 * t), int(60 + 70 * t), int(50 + 40 * t)))
    d.text((40, 40), "placeholder still\n" + prompt[len(STYLE):][:300], fill=(240, 230, 210))
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return buf.getvalue(), "dummy"


PROVIDERS = {"openai": ("OPENAI_API_KEY", openai), "replicate": ("REPLICATE_API_TOKEN", replicate),
             "fal": ("FAL_KEY", fal), "google": ("GEMINI_API_KEY", google), "dummy": (None, dummy)}


def pick(name):
    if name:
        key, fn = PROVIDERS[name]
        if key and not os.environ.get(key):
            sys.exit(f"{name} needs {key} in the environment")
        return name, fn
    for n, (key, fn) in PROVIDERS.items():
        if key and os.environ.get(key):
            return n, fn
    return "dummy", dummy


def fit(raw):
    """Crop to 16:9 around the centre and scale to 1280x720."""
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = im.size
    tw, th = (w, round(w * 9 / 16)) if w * 9 / 16 <= h else (round(h * 16 / 9), h)
    im = im.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th))
    return im.resize(SIZE, Image.LANCZOS)


def compare(name, fn, models, ids):
    """Each still on each model, saved as samples/<id>--<model>.jpg, with an index.html
    that shows them side by side and how long each took."""
    out = OUT / "samples"
    out.mkdir(parents=True, exist_ok=True)
    log_path = out / "samples.json"
    log = json.loads(log_path.read_text()) if log_path.exists() else {}
    for sid in ids:
        for m in models:
            short = m.split("/")[-1]
            t = time.time()
            try:
                raw, used = fn(f"{STYLE} {STILLS[sid]['prompt']}", m)
            except Exception as e:
                print(f"  {sid} on {short}: failed: {e}")
                continue
            f = f"{sid}--{short}.jpg"
            fit(raw).save(out / f, "JPEG", quality=88)
            log[f] = {"still": sid, "provider": name, "model": used, "seconds": round(time.time() - t, 1),
                      "made": date.today().isoformat()}
            print(f"  {sid} on {short}: {log[f]['seconds']}s → assets/tk/stills/samples/{f}")
            log_path.write_text(json.dumps(log, indent=1))
    rows = []
    for sid in STILLS:
        cells = [f'<figure><img src="{f}"><figcaption>{v["model"]} · {v["seconds"]}s</figcaption></figure>'
                 for f, v in log.items() if v["still"] == sid]
        if cells:
            rows.append(f'<h2>{sid}</h2><p>{STILLS[sid]["prompt"]}</p><div>{"".join(cells)}</div>')
    (out / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>Still samples</title><style>"
        "body{font:15px system-ui;background:#16130f;color:#eee;margin:16px}p{color:#aaa;max-width:70em}"
        "div{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;flex:1 1 480px}img{width:100%}"
        "figcaption{color:#ccc;font-size:13px}</style>" + "".join(rows))
    print(f"side by side: assets/tk/stills/samples/index.html")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--provider", choices=PROVIDERS)
    ap.add_argument("--only", action="append", help="still id(s) to make")
    ap.add_argument("--force", action="store_true", help="remake stills that already exist")
    ap.add_argument("--list", action="store_true", help="show what exists and what's missing")
    ap.add_argument("--import", dest="imp", metavar="DIR", help="fit and record hand-made images named <id>.*")
    ap.add_argument("--compare", nargs="+", metavar="MODEL", help="try each model on the stills, into stills/samples/")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    man_path = OUT / "stills.json"
    man = json.loads(man_path.read_text()) if man_path.exists() else {}
    if a.list:
        for sid, s in STILLS.items():
            have = man.get(sid)
            print(f"{'✓' if have else '·'} {sid:16} scene {s['scene']:10} {have['provider'] + '/' + have['model'] if have else 'missing'}")
            print(f"    {s['prompt']}")
        return
    if a.imp:
        for f in sorted(Path(a.imp).iterdir()):
            sid = f.stem
            if sid not in STILLS or f.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
                print(f"  skipped {f.name} (not a still id in tools/tk_stills.py)" if f.is_file() else "", end="")
                continue
            fit(f.read_bytes()).save(OUT / f"{sid}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
            man[sid] = {"file": f"{sid}.jpg", "scene": STILLS[sid]["scene"], "prompt": f"{STYLE} {STILLS[sid]['prompt']}",
                        "provider": "manual", "model": f.name, "made": date.today().isoformat()}
            print(f"  {sid}: imported {f.name}")
        man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))
        return
    name, fn = pick(a.provider)
    if a.compare:
        return compare(name, fn, a.compare, [sid for sid in STILLS if not a.only or sid in a.only])
    model = os.environ.get("TK_IMAGE_MODEL")
    print(f"provider: {name}" + (" (no API key found: placeholders only)" if name == "dummy" else ""))
    for sid, s in STILLS.items():
        if a.only and sid not in a.only:
            continue
        if sid in man and (OUT / man[sid]["file"]).exists() and not a.force and man[sid]["provider"] != "dummy":
            continue
        prompt = f"{STYLE} {s['prompt']}"
        try:
            raw, used = fn(prompt, model)
        except Exception as e:   # one failure shouldn't stop the rest
            print(f"  {sid}: failed: {e}")
            continue
        fit(raw).save(OUT / f"{sid}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
        man[sid] = {"file": f"{sid}.jpg", "scene": s["scene"], "prompt": prompt, "provider": name, "model": used,
                    "made": date.today().isoformat()}
        print(f"  {sid}: {name}/{used} → assets/tk/stills/{sid}.jpg ({(OUT / f'{sid}.jpg').stat().st_size // 1024} KB)")
        man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
