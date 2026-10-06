#!/usr/bin/env python3
"""Check the unwired Book 2 draft (tools/tk_story_w2_new.py) with check_story.py's rules.

    python3 tools/check_story_w2_new.py

The draft is not loaded by the game yet, so check_story.py never sees it. This
runs the same per-world checks on it, with Book 1's Chinese and cast merged in.
Several problems in one scene are allowed here (an engine request: docs/book2/research.md);
everything else is checked as for a live world.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_story as cs  # noqa: E402


def main():
    zh = cs.load("tk_story_zh")
    new = cs.load("tk_story_w2_new")
    ZH = dict(zh.ZH)
    ZH.update(new.ZH2)
    CAST = dict(zh.CAST)
    CAST.update(new.CAST2)
    errors, warnings = [], []
    cs.check_world(new.WORLD2, ZH, CAST, errors, warnings, {}, zh.FOLK_VOICE)
    errors = [e for e in errors if "problems (needs exactly 1)" not in e or " has 0 problems" in e]
    errors += board_owners(new.WORLD2)
    for m in warnings:
        print("warning:", m)
    for m in errors:
        print("ERROR:", m)
    print(f"{len(new.WORLD2['scenes'])} scenes, {len(new.WORLD2['nodes'])} nodes checked: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


def board_owners(w):
    """Every board must be played by its own protagonist. A party step takes effect when its scene
    ends, so a board belongs to whoever leads when its scene begins: that lead must be the dilemma's
    "who" (each one, when "dilemma" is a list). Walks the main chain in order from the first node."""
    nodes = {n["key"]: n for n in w["nodes"]}
    nxt = {a: b for a, b in w["edges"]}
    lead, k, out = (w.get("party") or [None])[0], w["nodes"][0]["key"], []
    seen = set()
    while k and k not in seen:
        seen.add(k)
        n = nodes[k]
        d = n.get("dilemma")
        for x in (d if isinstance(d, list) else [d] if d else []):
            if x.get("who") != lead:
                out.append(f"node {k!r}: its board is {x.get('who')!r}'s, but {lead!r} leads when the scene begins "
                           f"(hand off at the end of the scene before)")
        for st in w["scenes"][n["scene"]]["steps"]:
            if st[0] == "party":
                lead = st[1][0]
        k = nxt.get(k)
    return out


if __name__ == "__main__":
    main()
