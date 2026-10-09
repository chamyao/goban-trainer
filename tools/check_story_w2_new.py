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
    bad = 0
    for label, world in (("Diaochan arc (WORLD2)", new.WORLD2), ("Cao Cao arc (WORLD2_CC)", getattr(new, "WORLD2_CC", None)), ("Lü Bu arc (WORLD2_LB)", getattr(new, "WORLD2_LB", None)), ("Lady Sun (WORLD2_LS)", getattr(new, "WORLD2_LS", None))):
        if world is None:
            continue
        errors, warnings = [], []
        cs.check_world(world, ZH, CAST, errors, warnings, {}, zh.FOLK_VOICE)
        errors = [e for e in errors if "problems (needs exactly 1)" not in e or " has 0 problems" in e]
        for m in warnings:
            print(f"warning [{label}]:", m)
        for m in errors:
            print(f"ERROR [{label}]:", m)
        print(f"{label}: {len(world['scenes'])} scenes, {len(world['nodes'])} nodes checked: {len(errors)} errors, {len(warnings)} warnings")
        bad += len(errors)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
