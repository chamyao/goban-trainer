"""Mark the problems set on a smaller board than 19x19 ("sz": 13, 9, 11, 12) in data/books, from the raw
101weiqi data (vendor/101books, its "lu"), without rebuilding the books. build_data.py writes "sz" itself now;
this is the one-off for the books already built.

    python3 tools/board_sizes.py
"""
import glob
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    size = {}
    for f in glob.glob(str(ROOT / "vendor" / "101books" / "problems" / "*" / "*" / "*.json")):
        try:
            d = json.loads(Path(f).read_text())
        except (ValueError, OSError):
            continue
        if d.get("lu", 19) != 19:
            size[str(d.get("publicid") or Path(f).stem)] = d["lu"]
    n = 0
    for f in sorted(glob.glob(str(ROOT / "data" / "books" / "*.json"))):
        text = Path(f).read_text()
        book = json.loads(text)
        changed = False
        for p in book["problems"]:
            sz = size.get(str(p["id"]))
            if sz and p.get("sz") != sz:
                p["sz"] = sz
                changed = True
                n += 1
        if changed:   # written as build_data.py writes it
            Path(f).write_text(json.dumps(book, ensure_ascii=False, separators=(",", ":")))
    print(f"{n} problems marked with their board size")


if __name__ == "__main__":
    main()
