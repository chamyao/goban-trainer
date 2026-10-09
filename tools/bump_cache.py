"""Bump the cache key a changed art file is fetched under, so browsers stop showing the old one.

    python3 tools/bump_cache.py stills       # stills.json ?v (tk-cutscene.js) + tk-cutscene.js ?v (index.html)
    python3 tools/bump_cache.py portraits    # TownUI.PORTRAIT_V (tk-town.js) + tk-town.js ?v
    python3 tools/bump_cache.py props        # props.json/png ?v (tk-cutscene.js) + tk-cutscene.js ?v
    python3 tools/bump_cache.py script tk.js # one script's ?v in index.html (e.g. after TK_CHARS changes)

Kit json and sheet keys (kits ?v in tk-world.js, sheets tied to it) are Integration's: ask them to bump those.
An individual still's URL also carries its stills.json "made"+"look", so a redone still needs a new "made" date.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def sub(path, pattern, label):
    p = ROOT / path
    s = p.read_text()
    m = re.search(pattern, s)
    if not m:
        sys.exit(f"{label}: not found in {path}")
    new = s[:m.start(1)] + str(int(m.group(1)) + 1) + s[m.end(1):]
    p.write_text(new)
    print(f"{label}: {m.group(1)} -> {int(m.group(1)) + 1}")


def script(name):
    sub("index.html", rf'"{re.escape(name)}\?v=(\d+)"', name)


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "stills":
        sub("tk-cutscene.js", r"stills\.json\?v=(\d+)", "stills.json"); script("tk-cutscene.js")
    elif a[0] == "portraits":
        sub("tk-town.js", r"PORTRAIT_V: (\d+)", "PORTRAIT_V"); script("tk-town.js")
    elif a[0] == "props":
        for k in ("json", "png"):
            p = ROOT / "tk-cutscene.js"
            s = p.read_text()
            s = re.sub(rf"props\.{k}\?v=(\d+)", lambda m: f"props.{k}?v={int(m.group(1)) + 1}", s)
            p.write_text(s)
        print("props.json/png: bumped"); script("tk-cutscene.js")
    elif a[0] == "script":
        script(a[1])
    else:
        sys.exit(__doc__)
