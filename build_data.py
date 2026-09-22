#!/usr/bin/env python3
"""Build compact per-book problem bundles for the web app.

Reads the 101books repo checkout (vendor/101books): books/*.tex define book
metadata and problem order; problems/<book>/<chapter>/<id>.json hold the raw
101weiqi qqdata. Writes data/index.json and data/books/<book>.json.
"""

import ast
import base64
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).parent / "vendor" / "101books"
OUT = Path(__file__).parent / "data"

XOR_KEYS = ["101222", "101333"]


def decode_position(b64: str, black_first: bool):
    for key in XOR_KEYS:
        raw = base64.b64decode(b64).decode("utf-8")
        s = "".join(chr(ord(ch) ^ ord(key[i % len(key)])) for i, ch in enumerate(raw))
        try:
            pair = ast.literal_eval(s)
        except (ValueError, SyntaxError):
            continue
        if isinstance(pair, list) and len(pair) == 2:
            first, second = pair
            return (first, second) if black_first else (second, first)
    raise ValueError("cannot decode position")


def valid_move(m) -> bool:
    return isinstance(m, str) and len(m) == 2 and all("a" <= c <= "s" for c in m)


def neighbors(c, r):
    if c > 0:
        yield c - 1, r
    if c < 18:
        yield c + 1, r
    if r > 0:
        yield c, r - 1
    if r < 18:
        yield c, r + 1


def group_liberties(g, c, r):
    color = g[r][c]
    seen, libs, stack = set(), 0, [(c, r)]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        for nx, ny in neighbors(x, y):
            if g[ny][nx] == 0:
                libs += 1
            elif g[ny][nx] == color:
                stack.append((nx, ny))
    return seen, libs


def line_replays_legally(black, white, moves) -> bool:
    """Replay with captures; black moves first (positions are normalized)."""
    g = [[0] * 19 for _ in range(19)]
    for s in black:
        g[ord(s[1]) - 97][ord(s[0]) - 97] = 1
    for s in white:
        g[ord(s[1]) - 97][ord(s[0]) - 97] = 2
    for i, m in enumerate(moves):
        c, r = ord(m[0]) - 97, ord(m[1]) - 97
        if g[r][c] != 0:
            return False
        color = 1 if i % 2 == 0 else 2
        g[r][c] = color
        for nx, ny in neighbors(c, r):
            if g[ny][nx] == 3 - color:
                stones, libs = group_liberties(g, nx, ny)
                if libs == 0:
                    for x, y in stones:
                        g[y][x] = 0
        if group_liberties(g, c, r)[1] == 0:
            return False
    return True


def sflip(m: str) -> str:
    return m[1] + m[0]


def parse_book_tex(path: Path):
    content = path.read_text(encoding="utf-8")
    title = re.search(r"\\def\\entitle\{([^}]+)\}", content).group(1)
    title = title.replace("~", " ").replace("\\&", "&")
    level = re.search(r"\\def\\level\{([^}]+)\}", content).group(1)
    level = level.replace("ky\\=u", "k").replace("\\=u", "").replace(" dan", "d").replace(" k", "k")
    category = re.search(r"^%(\w+)", content, re.MULTILINE).group(1)
    source = re.search(r"\\def\\source\{([^}]+)\}", content)
    native = re.search(r"\\def\\(?:zh|jp|kr)title\{([^}]+)\}", content)
    problems = re.findall(r"\\p\{(\d+)\}\{(\d+)\}", content)
    return {
        "id": path.stem,
        "title": title,
        "native": native.group(1) if native else "",
        "level": level,
        "category": category,
        "source": source.group(1) if source else "",
        "refs": [(int(ch), int(pid)) for ch, pid in problems],
    }


def build_problem(book_dir: Path, chapter: int, pid: int):
    path = book_dir / str(chapter) / f"{pid}.json"
    if not path.exists():
        return None, "missing"
    d = json.loads(path.read_text(encoding="utf-8"))
    if d.get("status") == 1:
        return None, "eliminated"

    # Colors are normalized so the solver always plays black and moves first:
    # for blackfirst=False problems the stone lists are swapped (color swap
    # preserves the problem). Same convention as the 101books PDFs.
    black_first = bool(d["blackfirst"])
    try:
        black, white = decode_position(d["c"], black_first)
    except ValueError:
        return None, "undecodable"

    # xv flip applies to the encoded position only: answer moves are already
    # stored in display orientation (see extract.py, flip before evolve(moves)).
    if d.get("xv", 0) % 3 != 0:
        black = [sflip(m) for m in black]
        white = [sflip(m) for m in white]

    lines = []
    for a in d.get("answers", []):
        moves = [p["p"] for p in a.get("pts", [])]
        if not moves or not all(valid_move(m) for m in moves):
            continue
        if not line_replays_legally(black, white, moves):
            continue
        lines.append([a.get("ty", 1), *moves])
    if not any(line[0] == 1 for line in lines):
        return None, "no-solution"

    return {
        "id": pid,
        "b": black,
        "w": white,
        "lv": d.get("levelname", ""),
        "qt": d.get("qtypename", ""),
        "lines": lines,
    }, None


def level_sort_key(level: str):
    m = re.search(r"(\d+)", level)
    n = int(m.group(1)) if m else 0
    return 100 - n if "k" in level else 100 + n


def main():
    (OUT / "books").mkdir(parents=True, exist_ok=True)
    index = []
    skip_counts = {}

    for tex in sorted((REPO / "books").glob("*.tex")):
        if tex.name == "header.tex":
            continue
        book = parse_book_tex(tex)
        book_dir = REPO / "problems" / book["id"]
        problems, seen = [], set()
        for chapter, pid in book["refs"]:
            if pid in seen:
                continue
            seen.add(pid)
            problem, skip = build_problem(book_dir, chapter, pid)
            if problem:
                problems.append(problem)
            else:
                skip_counts[skip] = skip_counts.get(skip, 0) + 1

        out = {k: book[k] for k in ("id", "title", "native", "level", "category", "source")}
        out["problems"] = problems
        (OUT / "books" / f"{book['id']}.json").write_text(
            json.dumps(out, ensure_ascii=False, separators=(",", ":")))
        index.append({**{k: book[k] for k in ("id", "title", "native", "level", "category")},
                      "count": len(problems)})

    index.sort(key=lambda b: (["tsumego", "tesuji", "endgame"].index(b["category"]),
                              level_sort_key(b["level"]), b["title"]))
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")))

    total = sum(b["count"] for b in index)
    print(f"books: {len(index)}  problems: {total}  skipped: {skip_counts}")


if __name__ == "__main__":
    sys.exit(main())
