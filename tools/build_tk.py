#!/usr/bin/env python3
"""Build data/tk.json: the Romance of the Three Kingdoms campaign.

The story and map come from tools/tk_story.py; this script gives every
level a pool of problems at its grade (a slip draws the next one). Within
a world, levels climb through the world's grades by their "step";
shortcuts sit SHORTCUT half-grades higher; bosses come from Michael
Redmond's videos (early worlds) or the Maeda tsumego (later ones).

Usage: tools/build_tk.py   (deterministic; rerun after books or story change)
"""
import hashlib
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from tk_story import WORLDS  # noqa: E402
from tk_story_zh import ZH, spoken  # noqa: E402

BOOKS = ROOT / "data" / "books"
GRADES = [f"{k}K{p}" for k in range(15, 0, -1) for p in ("", "+")] + [f"{d}D{p}" for d in range(1, 8) for p in ("", "+")]
RANK = {g: i for i, g in enumerate(GRADES)}
SHORTCUT = 8  # half-grades harder: two 12K levels vs one 8K
POOL = 30
VOICE_DIR = ROOT / "assets" / "tk" / "voice"


def zh(en):
    if en not in ZH:
        sys.exit(f"tools/tk_story_zh.py has no Chinese for: {en!r}")
    return ZH[en]


def voice_id(text):
    """Voice-over clip for a line of Chinese; the name follows what is spoken."""
    return hashlib.sha1(spoken(text).encode()).hexdigest()[:12]


def voiced(steps):
    """Attach Chinese and voice clip ids: n -> [n, en, zh, vid], say -> [say, who, en, zh, vid],
    scroll -> [scroll, title, paras, zh title, zh paras, vids]."""
    out = []
    for s in steps:
        s = list(s)
        if s[0] == "n":
            s += [zh(s[1]), voice_id(zh(s[1]))]
        elif s[0] == "say":
            s += [zh(s[2]), voice_id(zh(s[2]))]
        elif s[0] == "scroll":
            zps = [zh(t) for t in s[2]]
            s += [zh(s[1]), zps, [voice_id(t) for t in zps]]
        out.append(s)
    return out


def all_lines(worlds):
    """Every (clip id, Chinese text) the campaign voices."""
    lines = {}
    for w in worlds:
        for steps in [w["opening"], w["closing"], *(v["steps"] for v in w["scenes"].values())]:
            for s in steps:
                if s[0] == "n":
                    lines[s[3]] = s[2]
                elif s[0] == "say":
                    lines[s[4]] = s[3]
                elif s[0] == "scroll":
                    lines.update(zip(s[5], s[4]))
        for n in w["nodes"]:
            if "boss" in n:
                lines[n["boss"]["taunt_vid"]] = n["boss"]["taunt_zh"]
    return lines
SKIP_TYPES = {"欣赏题", "棋理题", "布局题", "定式题"}  # study and opening problems, not life-and-death puzzles


def usable(p):
    # A real answer key: at least one correct line with a move in it.
    return p.get("qt") not in SKIP_TYPES and any(l[0] == 1 and len(l) > 1 for l in p.get("lines", []))


def main():
    rng = random.Random(20261004)
    index = json.loads((ROOT / "data" / "index.json").read_text())
    by_grade, maeda, redmond = {}, [], []
    for b in index:
        book = json.loads((BOOKS / f"{b['id']}.json").read_text())
        for p in book["problems"]:
            if not usable(p):
                continue
            ref = [b["id"], p["id"]]
            if b["id"] == "redmond-life-and-death":
                redmond.append(ref)
            elif b["id"].startswith("maeda-tsumego"):
                if p.get("lv") in RANK:
                    maeda.append((RANK[p["lv"]], ref))
            elif p.get("lv") in RANK:
                by_grade.setdefault(p["lv"], []).append(ref)
    for v in by_grade.values():
        rng.shuffle(v)
    redmond.sort(key=lambda r: r[1])

    taken = set()  # no problem appears twice in the whole campaign

    def draw(rank, n=POOL):
        out, d = [], 0
        while len(out) < n and d < len(GRADES):  # borrow neighbouring grades if thin
            for r in sorted({rank - d, rank + d}):
                if 0 <= r < len(GRADES):
                    out += [x for x in by_grade.get(GRADES[r], []) if tuple(x) not in taken and x not in out][:n - len(out)]
            d += 1
        taken.update(map(tuple, out))
        return out

    worlds = []
    for w in WORLDS:
        lo, hi = RANK[w["grades"][0]], RANK[w["grades"][-1]]
        nodes = []
        for src in w["nodes"]:
            node = {k: v for k, v in src.items() if k != "step"}
            node["key"] = f"{w['n']}-{src['key']}"
            role = src.get("role")
            if role == "boss":
                if w["boss"] == "redmond":
                    pool = redmond[:60]
                else:
                    pool = [r for g, r in maeda if hi < g <= hi + 3] or [r for g, r in sorted(maeda, key=lambda t: -t[0])]
                pool = pool[:]
                random.Random(w["n"]).shuffle(pool)
                node["pool"] = pool[:POOL]
            elif role:
                rank = round(lo + (hi - lo) * src.get("step", 0)) + (SHORTCUT if role == "short" else 0)
                rank = min(rank, len(GRADES) - 1)
                node["grade"] = GRADES[rank]
                node["pool"] = draw(rank)
            nodes.append(node)
        key = lambda k: f"{w['n']}-{k}"
        out = {k: v for k, v in w.items() if k not in ("nodes", "edges")}
        out["nodes"] = nodes
        out["edges"] = [[key(a), key(b)] for a, b in w["edges"]]
        out["grades"] = f"{w['grades'][0]}–{w['grades'][-1]}"
        # Scene positions name nodes by their short key; make them full keys.
        def fix(steps):
            for s in steps:
                if s[0] in ("spawn",) and isinstance(s[3], str):
                    s[3] = key(s[3])
                elif s[0] in ("move", "fx") and len(s) > 2 and isinstance(s[2], str):
                    s[2] = key(s[2])
            return steps
        out["opening"] = voiced(fix(w["opening"]))
        out["closing"] = voiced(fix(w["closing"]))
        out["scenes"] = {k: dict(v, zh=zh(v["title"]), steps=voiced(fix(v["steps"]))) for k, v in w["scenes"].items()}
        for n in out["nodes"]:
            if "boss" in n:
                n["boss"] = dict(n["boss"], taunt_zh=zh(n["boss"]["taunt"]), taunt_vid=voice_id(zh(n["boss"]["taunt"])))
        for n in out["nodes"]:
            if "scene" in n:
                assert n["scene"] in out["scenes"], n["scene"]
        worlds.append(out)
    have = {p.stem for p in VOICE_DIR.glob("*.mp3")} if VOICE_DIR.exists() else set()
    lines = all_lines(worlds)
    missing = [k for k in lines if k not in have]
    data = {"id": "tk", "title": "Romance of the Three Kingdoms", "native": "三国演义", "worlds": worlds,
            "voices": sorted(k for k in lines if k in have)}
    (ROOT / "data" / "tk.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(f"voice-over: {len(lines) - len(missing)}/{len(lines)} lines have audio"
          + (" — run tools/build_tk_voice.py, then this again" if missing else ""))
    for w in worlds:
        print(f"World {w['n']} {w['name']}: " + ", ".join(f"{n['key'].split('-')[1]}={n.get('grade', 'boss' if n.get('role') == 'boss' else '-')}({len(n.get('pool', []))})" for n in w["nodes"]))


if __name__ == "__main__":
    main()
