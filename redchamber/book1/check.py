#!/usr/bin/env python3
"""Check Red Chamber Book 1 (redchamber/book1/story.py) with the Three Kingdoms checker's per-world rules.

    python3 redchamber/book1/check.py
"""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
import check_story as cs  # noqa: E402


def load_story():
    spec = importlib.util.spec_from_file_location("hlm_book1", Path(__file__).with_name("story.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    story = load_story()
    zh = cs.load("tk_story_zh")
    errors, warnings = [], []
    cs.check_world(story.WORLD_HLM1, story.ZH, story.CAST, errors, warnings, {}, zh.FOLK_VOICE)
    for m in warnings:
        print("warning:", m)
    for m in errors:
        print("ERROR:", m)
    w = story.WORLD_HLM1
    boards = sum(1 for sc in w["scenes"].values() for st in sc["steps"] if st[0] == "problem")
    print(f"Red Chamber Book 1: {len(w['scenes'])} scenes, {len(w['nodes'])} nodes, {boards} boards: {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
