"""Make the painted stills (tools/tk_stills.py) with an image-generation API.

    python3 tools/gen_stills.py                # make every still that doesn't exist yet
    python3 tools/gen_stills.py --list         # what exists, what's missing, with the full prompts
    python3 tools/gen_stills.py --chosen       # only the stills the game uses (Plot's choice, tk_stills.CHOSEN)
    python3 tools/gen_stills.py --only oath --force   # remake one
    python3 tools/gen_stills.py --provider openai     # pick a provider (default: the first with a key)
    python3 tools/gen_stills.py --import DIR          # bring in images made by hand (DIR/<id>.png|jpg|webp),
                                                      # e.g. from Midjourney/Niji, which has no API
    python3 tools/gen_stills.py --portraits 4 --only liubei --only guanyu --only zhangfei
                                                      # candidate character designs, to choose from in
                                                      # assets/tk/stills/refs/candidates/index.html
    python3 tools/gen_stills.py --pick guanyu 3       # make candidate 3 Guan Yu's reference image
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
from tk_stills import CAST, CHOSEN, PORTRAITS, STILLS, STYLE, STYLES, cast_in, portrait, prompt  # noqa: E402

OUT = ROOT / "assets/tk/stills"
SIZE = (1280, 720)


def http(url, body=None, headers=None, method=None, timeout=300):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method or ("POST" if data else "GET"),
                                 headers={"Content-Type": "application/json", "User-Agent": "goban-trainer/gen_stills",
                                          **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
    return json.loads(raw) if raw[:1] in (b"{", b"[") else raw


def fetch(url):
    with urllib.request.urlopen(url, timeout=300) as r:
        return r.read()


# ---------- providers: prompt → image bytes ----------
def openai(prompt, model, aspect="16:9", images=()):
    model = model or "gpt-image-1"
    r = http("https://api.openai.com/v1/images/generations",
             {"model": model, "prompt": prompt, "size": "1536x1024" if aspect == "16:9" else "1024x1536", "quality": "high", "n": 1},
             {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"})
    d = r["data"][0]
    return (base64.b64decode(d["b64_json"]) if d.get("b64_json") else fetch(d["url"])), model


def replicate(prompt, model, aspect="16:9", images=()):
    model = model or "black-forest-labs/flux-1.1-pro"
    h = {"Authorization": f"Bearer {os.environ['REPLICATE_API_TOKEN']}", "Prefer": "wait"}
    url = f"https://api.replicate.com/v1/models/{model}/predictions"
    try:
        inp = {"prompt": prompt, "aspect_ratio": aspect, "output_format": "png"}
        if images:
            inp["images"] = list(images)        # flux-2 models: up to 5 reference images
        r = http(url, {"input": inp}, h)
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


def fal(prompt, model, aspect="16:9", images=()):
    model = model or "fal-ai/flux/dev"
    r = http(f"https://fal.run/{model}", {"prompt": prompt, "image_size": "landscape_16_9" if aspect == "16:9" else "portrait_4_3", "num_images": 1},
             {"Authorization": f"Key {os.environ['FAL_KEY']}"})
    return fetch(r["images"][0]["url"]), model


def google(prompt, model, aspect="16:9", images=()):
    # Imagen 4 was retired on 17 Aug 2026; Gemini's image model takes its place
    model = model or "gemini-2.5-flash-image"
    r = http(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
             {"contents": [{"parts": [{"text": prompt}]}],
              "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}},
             {"x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    parts = r["candidates"][0]["content"]["parts"]
    return base64.b64decode(next(p["inlineData"]["data"] for p in parts if "inlineData" in p)), model


def dummy(prompt, model, aspect="16:9", images=()):
    """No key: a labelled gradient, so the whole pipeline (and the game's step) can be tested."""
    im = Image.new("RGB", SIZE)
    d = ImageDraw.Draw(im)
    for y in range(SIZE[1]):
        t = y / SIZE[1]
        d.line([(0, y), (SIZE[0], y)], fill=(int(70 + 120 * t), int(60 + 70 * t), int(50 + 40 * t)))
    d.text((40, 40), "placeholder still\n" + prompt[:300], fill=(240, 230, 210))
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


MAX_REFS = 5
TAKES_REFS = ("replicate",)          # providers whose models here take reference images (flux-2)


def data_uri(path):
    """An image as a data: URI, shrunk to 1024 px so requests stay small."""
    im = Image.open(path).convert("RGB")
    im.thumbnail((1024, 1024))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def style_refs():
    d = OUT / "refs/style"
    return sorted(f for f in d.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")) if d.exists() else []


def request(provider, sid=None, key=None):
    """(prompt, images) for a still or a portrait: style images first, then cast portraits."""
    style = style_refs()[:MAX_REFS] if provider in TAKES_REFS else []
    if key:
        return portrait(key, len(style)), [data_uri(f) for f in style]
    cast = [k for k in cast_in(sid) if (OUT / f"refs/{k}.jpg").exists()] if provider in TAKES_REFS else []
    cast = cast[:MAX_REFS - len(style)]
    images = [data_uri(f) for f in style] + [data_uri(OUT / f"refs/{k}.jpg") for k in cast]
    return prompt(sid, len(style), cast), images


def fit(raw):
    """Crop to 16:9 around the centre and scale to 1280x720."""
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = im.size
    tw, th = (w, round(w * 9 / 16)) if w * 9 / 16 <= h else (round(h * 16 / 9), h)
    im = im.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th))
    return im.resize(SIZE, Image.LANCZOS)


def portraits(name, fn, keys, n, model):
    """n candidate face portraits of each person, into refs/candidates/<key>-<i>.jpg (1:1), with an
    index.html to choose from. --pick KEY I then makes one the reference: refs/<key>.jpg."""
    out = OUT / "refs/candidates"
    out.mkdir(parents=True, exist_ok=True)
    for key in keys:
        start = len(list(out.glob(f"{key}-*.jpg")))      # more candidates add to the ones there
        for i in range(start + 1, start + n + 1):
            try:
                text, images = request(name, key=key)
                raw, used = fn(text, model, "3:4", images)   # half-body cards
            except Exception as e:
                print(f"  {key} #{i}: failed: {e}")
                continue
            im = Image.open(io.BytesIO(raw)).convert("RGB")
            im.thumbnail((768, 1024))
            im.save(out / f"{key}-{i}.jpg", "JPEG", quality=88)
            print(f"  {key} #{i}: {name}/{used} → assets/tk/stills/refs/candidates/{key}-{i}.jpg")
    rows = []
    for key, (cname, look) in CAST.items():
        files = sorted(out.glob(f"{key}-*.jpg"), key=lambda f: int(f.stem.split("-")[1]))
        if files:
            figs = "".join(f'<figure><img src="{f.name}"><figcaption>{key} {f.stem.split("-")[1]}</figcaption></figure>'
                           for f in files)
            rows.append(f"<h2>{cname}</h2><p>{look}</p><div>{figs}</div>")
    (out / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>Character designs</title><style>"
        "body{font:15px system-ui;background:#16130f;color:#eee;margin:16px}p{color:#aaa}"
        "div{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:300px}img{width:100%}"
        "figcaption{color:#ccc}</style>" + "".join(rows))
    print("choose from: assets/tk/stills/refs/candidates/index.html, then --pick KEY N")


def styles(name, fn, ids, keys, model):
    """Each candidate style (tk_stills.STYLES) on the given stills, and each portrait framing
    (PORTRAITS) x style on the given people, into samples/styles/ with an index.html to choose from."""
    out = OUT / "samples/styles"
    out.mkdir(parents=True, exist_ok=True)
    jobs = [(f"{sid}--{st}", prompt(sid).replace(STYLE, sty), "16:9") for sid in ids for st, sty in STYLES.items()]
    for key in keys:
        nm, look = CAST[key]
        for fr, tpl in PORTRAITS.items():
            for st, sty in STYLES.items():
                jobs.append((f"portrait-{key}-{fr}--{st}", f"{tpl.format(name=nm, look=look, held='his weapon')} {sty}", "3:4" if fr != "bust" else "1:1"))
    for i, (stem, text, aspect) in enumerate(jobs):
        if (out / f"{stem}.jpg").exists():
            continue
        if i:
            time.sleep(15)   # back to back, Replicate turns away about half with 429s
        try:
            raw, used = fn(text, model, aspect)
        except Exception as e:
            print(f"  {stem}: failed: {e}")
            continue
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        im.thumbnail((1280, 1280))
        im.save(out / f"{stem}.jpg", "JPEG", quality=86)
        print(f"  {stem}: {name}/{used}")
    files = sorted(out.glob("*.jpg"))
    rows = []
    for group in sorted({f.stem.split("--")[0] for f in files}):
        figs = "".join(f'<figure><img src="{f.name}"><figcaption>{f.stem.split("--")[1]}</figcaption></figure>'
                       for f in files if f.stem.split("--")[0] == group)
        rows.append(f"<h2>{group}</h2><div>{figs}</div>")
    (out / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>Style candidates</title><style>body{font:15px system-ui;"
        "background:#16130f;color:#eee;margin:16px}div{display:flex;flex-wrap:wrap;gap:10px}figure{margin:0;"
        "width:300px}img{width:100%}</style>" + "".join(rows))


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
                text, images = request(name, sid)
                raw, used = fn(text, m, "16:9", images)
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
    ap.add_argument("--chosen", action="store_true", help="only the stills the game uses (tk_stills.CHOSEN)")
    ap.add_argument("--force", action="store_true", help="remake stills that already exist")
    ap.add_argument("--list", action="store_true", help="show what exists and what's missing")
    ap.add_argument("--import", dest="imp", metavar="DIR", help="fit and record hand-made images named <id>.*")
    ap.add_argument("--portraits", type=int, metavar="N", help="N candidate portraits per person (--only to pick who)")
    ap.add_argument("--pick", nargs=2, metavar=("KEY", "N"), help="make candidate N of KEY that person's reference")
    ap.add_argument("--styles", nargs="*", metavar="KEY", help="every candidate style on --only stills, and every "
                    "portrait framing x style on these people (e.g. guanyu), into stills/samples/styles/")
    ap.add_argument("--compare", nargs="+", metavar="MODEL", help="try each model on the stills, into stills/samples/")
    a = ap.parse_args()
    if a.chosen:
        a.only = (a.only or []) + CHOSEN
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
            man[sid] = {"file": f"{sid}.jpg", "scene": STILLS[sid]["scene"], "prompt": prompt(sid),
                        "provider": "manual", "model": f.name, "made": date.today().isoformat()}
            print(f"  {sid}: imported {f.name}")
        man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))
        return
    if a.pick:
        key, i = a.pick
        src = OUT / f"refs/candidates/{key}-{i}.jpg"
        (OUT / f"refs/{key}.jpg").write_bytes(src.read_bytes())
        print(f"{CAST[key][0]}: reference is now {src.name}")
        return
    name, fn = pick(a.provider)
    if a.portraits:
        return portraits(name, fn, [k for k in CAST if not a.only or k in a.only], a.portraits,
                         os.environ.get("TK_IMAGE_MODEL"))
    if a.styles is not None:
        return styles(name, fn, [s for s in STILLS if a.only and s in a.only], a.styles, os.environ.get("TK_IMAGE_MODEL"))
    if a.compare:
        return compare(name, fn, a.compare, [sid for sid in STILLS if not a.only or sid in a.only])
    model = os.environ.get("TK_IMAGE_MODEL")
    print(f"provider: {name}" + (" (no API key found: placeholders only)" if name == "dummy" else ""))
    for sid, s in STILLS.items():
        if a.only and sid not in a.only:
            continue
        if sid in man and (OUT / man[sid]["file"]).exists() and not a.force and man[sid]["provider"] != "dummy":
            continue
        text, images = request(name, sid)
        try:
            raw, used = fn(text, model, "16:9", images)
        except Exception as e:   # one failure shouldn't stop the rest
            print(f"  {sid}: failed: {e}")
            continue
        fit(raw).save(OUT / f"{sid}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
        man[sid] = {"file": f"{sid}.jpg", "scene": s["scene"], "prompt": text, "provider": name, "model": used,
                    "made": date.today().isoformat()}
        print(f"  {sid}: {name}/{used} → assets/tk/stills/{sid}.jpg ({(OUT / f'{sid}.jpg').stat().st_size // 1024} KB)")
        man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
