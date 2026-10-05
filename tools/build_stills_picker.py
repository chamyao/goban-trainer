"""Every generated try of every still, for the user to pick from (stills-picker.html).

    python3 tools/build_stills_picker.py [SAMPLES_REF]   # default origin/claude/stills-samples

Collects, for each still the game shows (assets/tk/stills/stills.json), every image ever made for its
scene: the review candidates and style samples on the samples branch, and each version the game has
shown before (this branch's history of assets/tk/stills/<id>.jpg). Each image is shrunk to a web-sized
webp in assets/tk/stills/picker/ (named by its git blob, so a re-run only adds new ones), and
assets/tk/stills/picker/picker.json lists the slots and their candidates. tools/apply_still_picks.py
puts the user's picks in the game from the full-size originals.
"""
import io
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from tk_stills import CATEGORY, CHOSEN, FINAL2, STILLS  # noqa: E402

STILLS_DIR = ROOT / "assets/tk/stills"
OUT = STILLS_DIR / "picker"
SAMPLES = "assets/tk/stills/samples"
WIDTH = 600


def git(*args, binary=False):
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, check=True)
    return r.stdout if binary else r.stdout.decode()


def scene_of(cid):
    """A candidate's scene: its still's, or for a draft id (oath_v2, feast_wide) the part before '_'."""
    return STILLS[cid]["scene"] if cid in STILLS else cid.split("_")[0]


def label_of(path):
    """What made it, from the file name: <id>--<model>-<look>-<n> (review), <id>--<look> (styles)."""
    stem = Path(path).stem
    return stem.split("--", 1)[1] if "--" in stem else stem


def main():
    ref = sys.argv[1] if len(sys.argv) > 1 else "origin/claude/stills-samples"
    man = json.loads((STILLS_DIR / "stills.json").read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    cands = {}   # blob -> {cid, scene, label, src}

    # the samples branch: review candidates (not portraits or mock screens) and style samples
    for line in git("ls-tree", "-r", ref, SAMPLES).splitlines():
        meta, path = line.split("\t", 1)
        blob = meta.split()[2]
        name = Path(path).name
        if Path(path).suffix not in (".jpg", ".png") or name.startswith(("face_", "mock_", "speed-", "portrait-")):
            continue
        cid = name.split("--")[0]
        cands.setdefault(blob, {"cid": cid, "scene": scene_of(cid), "label": label_of(path),
                                "src": f"{ref}:{path}"})

    # every version the game has shown: this branch's history of each still
    for sid in man:
        p = f"assets/tk/stills/{sid}.jpg"
        for commit in git("log", "--format=%H %as", "--", p).splitlines():
            sha, day = commit.split()
            try:
                blob = git("rev-parse", f"{sha}:{p}").strip()
            except subprocess.CalledProcessError:
                continue   # deleted in that commit
            cands.setdefault(blob, {"cid": sid, "scene": scene_of(sid), "label": f"in game until {day}",
                                    "src": f"{sha}:{p}"})

    current = {git("rev-parse", f"HEAD:assets/tk/stills/{sid}.jpg").strip(): sid for sid in man}
    made = 0
    for blob, c in cands.items():
        f = OUT / f"{blob[:12]}.webp"
        c["img"] = f.name
        if blob in current:
            c["label"] = "in game now"
        if f.exists():
            continue
        im = Image.open(io.BytesIO(git("cat-file", "blob", blob, binary=True))).convert("RGB")
        if im.width > WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        im.save(f, "WEBP", quality=68, method=6)
        made += 1

    # the slots: every still the game shows, with its scene's candidates (its own first, the one in the
    # game first of all)
    book1 = set(CHOSEN)
    slots = []
    scenes = []   # scenes in the order the lists first name them, a scene's stills together
    for sid in list(CHOSEN) + list(FINAL2):
        if man.get(sid, {}).get("scene") not in scenes:
            scenes.append(man.get(sid, {}).get("scene"))
    rank = lambda s: scenes.index(man[s]["scene"]) if man[s]["scene"] in scenes else 999
    for sid in sorted(man, key=lambda s: (s not in book1, rank(s), s)):
        mine = [dict(c, blob=b[:12]) for b, c in cands.items() if c["scene"] == man[sid]["scene"]]
        mine.sort(key=lambda c: (c["label"] != "in game now" or c["cid"] != sid, c["cid"] != sid, c["cid"], c["label"]))
        slots.append({"id": sid, "book": 1 if sid in book1 else 2, "scene": man[sid]["scene"],
                      "look": man[sid].get("look", ""), "category": CATEGORY.get(sid, ""), "line": STILLS.get(sid, {}).get("prompt", "").split(". ")[0],
                      "current": next((b[:12] for b, s in current.items() if s == sid), None),
                      "candidates": [{"blob": c["blob"], "img": c["img"], "cid": c["cid"], "label": c["label"],
                                      "src": c["src"]} for c in mine]})
    (OUT / "picker.json").write_text(json.dumps({"slots": slots}, ensure_ascii=False, indent=1))
    size = sum(f.stat().st_size for f in OUT.glob("*.webp")) / 1e6
    print(f"{len(slots)} stills, {len(cands)} images ({made} new), {size:.1f} MB in {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
