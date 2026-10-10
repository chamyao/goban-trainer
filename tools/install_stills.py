"""Put picked review candidates in the game as the stills.

    python3 tools/install_stills.py DIR LOOK ID[:N] ...   # e.g. ... assets/tk/stills/samples/review final inn_b oath_a:2
    python3 tools/install_stills.py --replace DIR LOOK ID  # only when the user has asked for that still to be replaced

DIR holds gen_stills --review output (<id>--<model>-<look>-<n>.jpg and its .txt prompt). Each ID takes
candidate N (default 1) of LOOK; it is fitted like any still (gen_stills.fit) into assets/tk/stills/<id>.jpg
and recorded in stills.json with the prompt that made it.
"""
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from gen_stills import OUT, fit  # noqa: E402
from tk_stills import STILLS  # noqa: E402


def main():
    args = sys.argv[1:]
    replace = "--replace" in args
    args = [a for a in args if a != "--replace"]
    src, look, picks = Path(args[0]), args[1], args[2:]
    man_path = OUT / "stills.json"
    man = json.loads(man_path.read_text())
    for p in picks:
        sid, n = (p.split(":") + ["1"])[:2]
        found = sorted(src.glob(f"{sid}--*{look}-{n}.*"))
        img = next((f for f in found if f.suffix in (".jpg", ".png")), None)
        if sid in man and not replace:   # the house rule: an existing still is never regenerated over (fix it by edit_still.py)
            print(f"  {sid}: already in stills.json, left alone (--replace only if the user asked for a new one)")
            continue
        if sid not in STILLS or not img:
            print(f"  {sid}: no candidate {n} in the {look} look")
            continue
        fit(img.read_bytes()).save(OUT / f"{sid}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
        txt = img.with_suffix(".txt")
        model = img.stem.split("--", 1)[1].rsplit(f"-{look}-", 1)[0]
        man[sid] = {"file": f"{sid}.jpg", "scene": STILLS[sid]["scene"],
                    "prompt": txt.read_text().strip() if txt.exists() else STILLS[sid]["prompt"],
                    "provider": "replicate", "model": f"bytedance/{model}" if model.startswith("seedream") else model,
                    "look": look, "made": date.today().isoformat()}
        print(f"  {sid}: {img.name}")
    man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
