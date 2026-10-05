"""Put the user's still picks (stills-picker.html) in the game.

    python3 tools/apply_still_picks.py 'STILL PICKS [{"id": ..., "blob": ...}, ...]'   # or a file holding it

Each pick names a candidate in assets/tk/stills/picker/picker.json by its blob; the full-size original
(on the samples branch, or an earlier version of the still) is fitted into assets/tk/stills/<id>.jpg and
recorded in stills.json as the user's pick.
"""
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from gen_stills import OUT, fit  # noqa: E402
from tk_stills import STILLS  # noqa: E402


def main():
    arg = sys.argv[1]
    text = Path(arg).read_text() if Path(arg).exists() else arg
    picks = json.loads(re.search(r"\[.*\]", text, re.S).group(0))
    slots = {s["id"]: s for s in json.loads((OUT / "picker/picker.json").read_text())["slots"]}
    man_path = OUT / "stills.json"
    man = json.loads(man_path.read_text())
    for p in picks:
        slot = slots.get(p["id"])
        c = slot and next((c for c in slot["candidates"] if c["blob"] == p["blob"]), None)
        if not c:
            print(f"  {p['id']}: no candidate {p['blob']}")
            continue
        if c["blob"] == slot["current"]:
            print(f"  {p['id']}: already in the game")
            continue
        raw = subprocess.run(["git", "show", c["src"]], cwd=ROOT, capture_output=True, check=True).stdout
        fit(raw).save(OUT / f"{p['id']}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
        txt = c["src"].rsplit(".", 1)[0] + ".txt"
        prompt = subprocess.run(["git", "show", txt], cwd=ROOT, capture_output=True).stdout.decode().strip()
        look = c["label"].rsplit("-", 1)[0].rsplit("-", 1)[-1] if "--" not in c["label"] else ""
        man[p["id"]] = {**man.get(p["id"], {}), "file": f"{p['id']}.jpg", "scene": STILLS[p["id"]]["scene"],
                        "prompt": prompt or man.get(p["id"], {}).get("prompt", ""), "picked": c["label"],
                        "look": man.get(p["id"], {}).get("look", "") if c["label"].startswith("in game") else look,
                        "approved": f"user, {date.today().isoformat()} (still picker)", "made": date.today().isoformat()}
        print(f"  {p['id']}: {c['cid']} {c['label']}")
    man_path.write_text(json.dumps(man, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
