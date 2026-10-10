#!/usr/bin/env python3
"""Render a Red Chamber book's story world as a readable bilingual script, using the Three Kingdoms renderer.

    python3 redchamber/tools/script_md.py            # writes redchamber/book1/script.md
"""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
import tk_script_md as r  # noqa: E402


def main():
    spec = importlib.util.spec_from_file_location("hlm_book1", ROOT / "redchamber/book1/story.py")
    story = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(story)
    story.ZH2 = story.ZH           # the renderer reads the story module's ZH2
    r.story = story
    r.NAMES.update(story.NAMES)
    out = ROOT / "redchamber/book1/script.md"
    text = r.render(story.WORLD_HLM1, "Red Chamber, Book 1: Deep as the Sea (侯门深似海)")
    text = text.replace("tools/tk_story_w2_new.py by tools/tk_script_md.py", "redchamber/book1/story.py by redchamber/tools/script_md.py")
    out.write_text(text, encoding="utf-8")
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
