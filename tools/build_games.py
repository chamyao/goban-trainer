"""A shelf of game records for the Library (app.js viewGames): copies a folder of SGF files into
data/games/<id>/ and writes data/games/<id>.json, one row a game: [file, date, black, black rank, white,
white rank, result, event, moves]. Text only is read from the files; they're served as they are.

    python3 -I tools/build_games.py go-seigen "Go Seigen" 吴清源 <folder of .sgf> ["Go Seigen"]

The optional last argument keeps only the games that player played in (the collection holds a few others').

The Go Seigen collection: Andries Brouwer's database, homepages.cwi.nl/~aeb/go/games/ (go_seigen.tgz, public
domain by its compiler's note; much of it from GoGoD).
"""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def prop(text, key):
    m = re.search(r"(?<![A-Z])" + key + r"\[((?:\\.|[^\]])*)\]", text)
    return m.group(1).replace("\\]", "]").strip() if m else ""


def main():
    gid, title, native, src = sys.argv[1], sys.argv[2], sys.argv[3], Path(sys.argv[4])
    player = sys.argv[5] if len(sys.argv) > 5 else None
    out = ROOT / "data" / "games" / gid
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    for f in sorted(src.rglob("*.sgf")):
        raw = f.read_bytes()
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            text = raw.decode("latin-1")
        moves = len(re.findall(r";\s*[BW]\[", text))
        # (a team or consultation game names its side "A & B & C")
        if prop(text, "SZ") not in ("", "19"):   # the Review tab plays 19x19 (two 9x9 exhibition games in Go Seigen's)
            continue
        if not moves or (player and player not in prop(text, "PB").split(" & ") + prop(text, "PW").split(" & ")):
            continue
        # no KM: these old records leave it out for a game without komi (before komi was standard, or a handicap
        # game); say so, or the Review tab would take a modern 6.5 (the user: "was it really komi 6.5?")
        if not prop(text, "KM"):
            text = re.sub(r"\(\s*;", lambda m: m.group(0) + "KM[0]", text, count=1)
        name = re.sub(r"[^A-Za-z0-9._-]", "_", str(f.relative_to(src)))   # a subfolder's games: "Yomiuri_1953-03-31.sgf"
        (out / name).write_text(text, encoding="utf-8")
        # no DT (only the date it was published, DTX): the file's own name is its date
        date = prop(text, "DT") or (re.match(r"\d{4}-\d\d-\d\d", f.stem) or [""])[0]
        rows.append([name, date, prop(text, "PB"), prop(text, "BR"), prop(text, "PW"), prop(text, "WR"),
                     prop(text, "RE"), " · ".join(x for x in (prop(text, "EV"), prop(text, "RO")) if x), moves])
    rows.sort(key=lambda r: (r[1], r[0]))
    (ROOT / "data" / "games" / f"{gid}.json").write_text(json.dumps(
        {"id": gid, "title": title, "native": native, "games": rows}, ensure_ascii=False, separators=(",", ":")))
    print(f"{gid}: {len(rows)} games")


if __name__ == "__main__":
    main()
