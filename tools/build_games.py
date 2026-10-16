"""A shelf of game records for the Library (app.js viewGames): copies a folder of SGF files into
data/games/<id>/ and writes data/games/<id>.json, one row a game: [file, date, black, black rank, white,
white rank, result, event, moves]. Text only is read from the files; they're served as they are.

    python3 -I tools/build_games.py go-seigen "Go Seigen" 吴清源 <folder of .sgf> ["Go Seigen"]

The optional last argument keeps only the games that player played in (the collection holds a few others').
--numbered: the collection's own order and numbers ("No. 12") in place of dates, for one whose dates can't be
trusted (Huang Longshi's: few dated, some before he was born).

    python3 -I tools/build_games.py huang-longshi "Huang Longshi" 黄龙士 <folder> "Huang Longshi" --numbered

Huang Longshi's 121 games: GoMagic's "Huang Longshi SGF Pack" (gomagic.org/download/huang-longshi-sgf-pack-121-games/).

Honinbo Dosaku's 163 and Honinbo Doteki's 12 (the user): the same database's games.tgz, every game either played in
(his own folder, the castle games, Hoshiai Hasseki's), one copy of each (11 of Dosaku's filed twice).

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


def nested(text):
    """A value whose text holds its own [ ] (Huang Longshi's No. 118: "modern interpolations in [ ]", notes in [..]
    inside comments) ends early for any SGF reader: escape a ] that closes a [ opened inside the value."""
    out, i, inval, depth = [], 0, False, 0
    while i < len(text):
        ch = text[i]
        if inval and ch == "\\":
            out.append(text[i:i + 2]); i += 2; continue
        if not inval and ch == "[":
            inval, depth = True, 0
        elif inval and ch == "[":
            depth += 1
        elif inval and ch == "]":
            if depth:
                depth -= 1; out.append("\\]"); i += 1; continue
            inval = False
        out.append(ch); i += 1
    return "".join(out)


def komi_of(text):
    y = re.match(r"\d{4}", prop(text, "DT"))
    year = int(y.group(0)) if y else 0
    if prop(text, "HA") not in ("", "0", "1") or year < 1955:
        return "0"
    if "Ing Cup" in prop(text, "EV") or "Ing" in prop(text, "RU"):
        return "8"
    return "4.5" if year < 1974 else "5.5" if year < 2003 else "6.5"


def main():
    numbered = "--numbered" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--numbered"]
    gid, title, native, src = args[0], args[1], args[2], Path(args[3])
    player = args[4] if len(args) > 4 else None
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
        # an empty first node, the game's info in the second (8 of Huang Longshi's): one root node, so the Review
        # tab finds the players and the komi where it looks
        text = nested(text)
        text = re.sub(r"^\s*\(\s*;((?:\s*[A-Z]+(?:\[(?:\\.|[^\]])*\])+)*)\s*;(\s*(?:PB|PW|HA|KM|RE|DT|BR|WR|EV)\[)", r"(;\1\2", text, count=1)
        text = text.replace("Xi Xingyou", "Xu Xingyou")   # a misspelling in one game (No. 46): the search finds him
        # no KM: fill in the komi the game was played with, or the Review tab would take a modern 6.5 (the user:
        # "was it really komi 6.5?"): none in a handicap game or before komi (Go Seigen's early games), then the
        # Japanese pro standard of its year (4.5 from 1955, 5.5 from 1974, 6.5 from 2003), 8 under Ing rules
        if not prop(text, "KM"):
            text = re.sub(r"\(\s*;", lambda m: m.group(0) + f"KM[{komi_of(text)}]", text, count=1)
        name = re.sub(r"[^A-Za-z0-9._-]", "_", str(f.relative_to(src)))   # a subfolder's games: "Yomiuri_1953-03-31.sgf"
        (out / name).write_text(text, encoding="utf-8")
        # no DT (only the date it was published, DTX): the file's own name is its date
        date = f"No. {int(f.stem)}" if numbered and f.stem.isdigit() else prop(text, "DT") or (re.match(r"\d{4}-\d\d-\d\d", f.stem) or [""])[0]
        rows.append([name, date, prop(text, "PB"), prop(text, "BR"), prop(text, "PW"), prop(text, "WR"),
                     prop(text, "RE"), " · ".join(x for x in (prop(text, "EV"), prop(text, "RO")) if x), moves])
    rows.sort(key=lambda r: r[0] if numbered else (r[1], r[0]))
    (ROOT / "data" / "games" / f"{gid}.json").write_text(json.dumps(
        {"id": gid, "title": title, "native": native, "games": rows}, ensure_ascii=False, separators=(",", ":")))
    print(f"{gid}: {len(rows)} games")


if __name__ == "__main__":
    main()
