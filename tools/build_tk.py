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
from tk_story_zh import CAST, FOLK_VOICE, NARRATOR, ZH, spoken  # noqa: E402

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


def voice_of(who=None):
    if who and who not in CAST:
        sys.exit(f"tools/tk_story_zh.py CAST has no voice for {who!r}")
    return CAST[who] if who else NARRATOR


def voice_id(text, voice=NARRATOR):
    """Voice-over clip for a line of Chinese; the name follows what is spoken, and by whom."""
    key = spoken(text) if voice == NARRATOR else f"{voice}|{spoken(text)}"  # narrator clips keep their names
    return hashlib.sha1(key.encode()).hexdigest()[:12]


def voiced(steps):
    """Attach Chinese and voice clip ids: n -> [n, en, zh, vid], say -> [say, who, en, zh, vid],
    scroll -> [scroll, title, paras, zh title, zh paras, vids]."""
    out = []
    for s in steps:
        s = list(s)
        if s[0] == "n":
            s += [zh(s[1]), voice_id(zh(s[1]))]
        elif s[0] == "say":
            s += [zh(s[2]), voice_id(zh(s[2]), voice_of(s[1]))]
        elif s[0] == "scroll":
            zps = [zh(t) for t in s[2]]
            s += [zh(s[1]), zps, [voice_id(t) for t in zps]]
        out.append(s)
    return out


def place_step(line, kind=None):
    """A line from tools/tk_places.py as a voiced dialogue step, and its voice.
    kind is the speaker's npc kind; None for a story spot's intro/outro.
    [who, text] is a character speaking; a hero's quoted line is his own speech;
    a townsperson's line is read in their voice; anything else is narration."""
    if isinstance(line, (list, tuple)):
        who, en = line
        z = zh(en)
        return ["say", who, en, z, voice_id(z, voice_of(who))], voice_of(who)
    z = zh(line)
    if kind and kind.startswith("hero.") and line.startswith("“"):
        who = kind[5:]
        z = z.strip("“”")
        return ["say", who, line.strip("“”"), z, voice_id(z, voice_of(who))], voice_of(who)
    if kind and kind.startswith("folk."):
        v = FOLK_VOICE.get(kind, FOLK_VOICE["folk.villager"])
        return ["n", line, z, voice_id(z, v)], v
    return ["n", line, z, voice_id(z)], NARRATOR


def place_lines():
    """Every line the places in tools/tk_places.py speak: id -> (Chinese text, voice, English text)."""
    from tk_places import PLACES
    lines = {}
    for places in PLACES.values():
        for b in places.values():
            said = [(l, None) for lm in b.get("landmarks", [])
                    for k in ("intro", "outro", "empty", "waiting", "deliver", "delivered", "call", "refuse") for l in lm.get(k, [])]
            for p in b.get("npcs", []):
                for k in ("say", "intro", "win", "done", "give", "given", "call"):
                    v = p.get(k)
                    said += [(l, p["kind"]) for l in ([v] if isinstance(v, str) else v or [])]
            said += [(l, None) for ls in b.get("seen_lines", {}).values() for l in ls]   # a stealth watcher who sees you
            said += [(l, p["kind"]) for p in b.get("npcs", []) if isinstance((p.get("watch") or {}).get("seen"), list) for l in p["watch"]["seen"]]
            said += [(st["procession"]["leash_line"], None) for st in b.get("states", [])   # the procession's pull back
                     if (st.get("procession") or {}).get("leash_line")]
            for l, kind in said:
                step, voice = place_step(l, kind)
                lines[step[-1]] = (step[-2], voice, step[1] if step[0] == "n" else step[2])
    from tk_places import ROOMS   # people inside buildings
    for room in ROOMS.values():
        for p in room.get("people", []):
            for l in ([p["say"]] if isinstance(p.get("say"), str) else p.get("say", [])):
                step, voice = place_step(l, p["kind"])
                lines[step[-1]] = (step[-2], voice, step[1] if step[0] == "n" else step[2])
    # and whatever the built maps say that isn't in a brief (a book built from plan grids, tools/mapfactory/plans.py)
    import json as _json
    for f in sorted((ROOT / "data" / "tk_maps").glob("w*/*.map.json")):
        m = _json.loads(f.read_text())
        said = [(l, None) for ls in (m.get("seen_lines") or {}).values() for l in ls]
        said += [(l, None) for e in m.get("exits", []) for l in e.get("refuse") or []]
        said += [(st["procession"]["leash_line"], None) for st in m.get("states") or [] if (st.get("procession") or {}).get("leash_line")]
        said += [(l, None) for st in m.get("states") or [] for v in (st.get("exits_closed_say") or {}).values()
                 for l in ([v] if isinstance(v, str) else v)]
        for sp in m.get("spots", []):
            said += [(l, None) for k in ("intro", "outro", "empty", "waiting", "deliver", "delivered", "call") for l in sp.get(k) or []]
        for n in m.get("npcs", []):
            for k in ("say", "intro", "win", "done", "give", "given", "call"):
                v = n.get(k)
                said += [(l, n["kind"]) for l in ([v] if isinstance(v, str) else v or [])]
            seen = (n.get("watch") or {}).get("seen")
            said += [(l, n["kind"]) for l in (seen if isinstance(seen, list) else [])]
        for l, kind in said:
            if not isinstance(l, str):
                continue
            step, voice = place_step(l, kind)
            lines.setdefault(step[-1], (step[-2], voice, step[1] if step[0] == "n" else step[2]))
    return lines


def all_lines(worlds):
    """Every clip the campaign voices: id -> (Chinese text, voice, English text).
    The English voice-over reuses the id (assets/tk/voice/en/<id>.mp3)."""
    lines = {}
    for w in worlds:
        for steps in [w["opening"], w["closing"], *(v["steps"] for v in w["scenes"].values())]:
            for s in steps:
                if s[0] == "n":
                    lines[s[3]] = (s[2], NARRATOR, s[1])
                elif s[0] == "say":
                    lines[s[4]] = (s[3], voice_of(s[1]), s[2])
                elif s[0] == "scroll":
                    lines.update((k, (t, NARRATOR, e)) for k, t, e in zip(s[5], s[4], s[2]))
        for n in w["nodes"]:
            for k in ("spotted", "caught", "solved", "restart"):   # a chase's lines (tk-world.js chaseStep), voiced
                for l in (n.get("chase") or {}).get(k, []):
                    if l[0] == "n": lines[l[3] if len(l) > 3 else voice_id(l[2])] = (l[2], NARRATOR, l[1])
                    elif l[0] == "say": lines[l[4] if len(l) > 4 else voice_id(l[3], voice_of(l[1]))] = (l[3], voice_of(l[1]), l[2])
            if "boss" in n:
                lines[n["boss"]["taunt_vid"]] = (n["boss"]["taunt_zh"], voice_of(n["boss"]["who"]), n["boss"]["taunt"])
            dl = n.get("dilemma") or {}
            for d in (dl if isinstance(dl, list) else [dl]):   # one per board, in a scene with several
                for k in ("open", "win", "slip"):
                    if k in d:
                        z = d.get(k + "_zh") or zh(d[k])
                        lines[d.get(k + "_vid") or voice_id(z, voice_of(d.get("who")))] = (z, voice_of(d.get("who")), d[k])
    lines.update(place_lines())
    return lines
# Life and death only, for now: tesuji, capturing races, capture and endgame
# problems are less reliably vetted, so the campaign doesn't use them.
TSUMEGO = {"死活题", "Life & Death"}


# KataGo vetting (tools/vet_tsumego.mjs): "book/id" -> {"ok": bool, "why": ...}.
# Rejected problems are never drawn; vetted-clean ones are preferred.
VETTED_FILE = ROOT / "data" / "tk_vetted.json"
VETTED = json.loads(VETTED_FILE.read_text()) if VETTED_FILE.exists() else {}


def vet(ref):
    r = VETTED.get(f"{ref[0]}/{ref[1]}")
    return None if r is None else r["ok"]


def usable(p):
    # A real answer key: at least one correct line with a move in it.
    return p.get("qt") in TSUMEGO and any(l[0] == 1 and len(l) > 1 for l in p.get("lines", []))


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

    unvetted = []

    def draw(rank, n=POOL):
        out = []
        for want in (True, None):  # KataGo-clean problems first, then ones not vetted yet; never rejected ones
            d = 0
            while len(out) < n and d < len(GRADES):  # borrow neighbouring grades if thin
                for r in sorted({rank - d, rank + d}):
                    if 0 <= r < len(GRADES):
                        out += [x for x in by_grade.get(GRADES[r], []) if vet(x) is want and tuple(x) not in taken and x not in out][:n - len(out)]
                d += 1
        unvetted.extend(x for x in out if vet(x) is None)
        taken.update(map(tuple, out))
        return out

    worlds = []
    for w in WORLDS:
        lo, hi = RANK[w["grades"][0]], RANK[w["grades"][-1]]
        nodes = []
        for src in w["nodes"]:
            node = {k: v for k, v in src.items() if k != "step"}
            node["key"] = f"{w['n']}-{src['key']}"
            if node.get("chase"):   # its lines get their clip ids, as scene lines do: [n, en, zh, vid], [say, who, en, zh, vid]
                ch = node["chase"] = dict(node["chase"])
                for k in ("spotted", "caught", "solved", "restart"):
                    ch[k] = [list(l) + [voice_id(l[2])] if l[0] == "n" and len(l) == 3
                             else list(l) + [voice_id(l[3], voice_of(l[1]))] if l[0] == "say" and len(l) == 4 else l for l in ch.get(k, [])]
            if "place" in node:
                node["place_zh"] = zh(node["place"])
            role = src.get("role")
            if role == "boss":
                if w.get("boss") == "redmond":
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
        # an easy version (the menu's difficulty): every board's problems drawn again at easier grades, in a
        # second pass so the book's own (hard) pools stay exactly as they were
        if w.get("easy_grades"):
            # too few problems this easy to give every board its own: the boards share the easy grades' problems
            # (within a grade of them, never rejected), each board starting further along so neighbours differ;
            # problems other books use are allowed here
            elo, ehi = RANK[w["easy_grades"][0]], RANK[w["easy_grades"][-1]]
            near = [x for r in range(max(0, elo - 2), min(len(GRADES), ehi + 3)) for x in by_grade.get(GRADES[r], []) if vet(x) is not False]
            near.sort(key=lambda x: vet(x) is not True)   # KataGo-clean first
            k = 0
            for node, src in zip(nodes, w["nodes"]):
                if src.get("role") and src.get("role") != "boss" and near:
                    node["grade_easy"] = w["easy_grades"][0]
                    node["pool_easy"] = [near[(k * 7 + j) % len(near)] for j in range(12)]
                    k += 1
        key = lambda k: f"{w['n']}-{k}"
        out = {k: v for k, v in w.items() if k not in ("nodes", "edges")}
        # adaptive difficulty (the menu's default; tk.js TKElo): problems at every grade from 15K to 3D, each with
        # its grade's rank, for the game to pick by the player's rating; KataGo-clean first, never rejected ones
        if w.get("easy_grades"):
            rated = []
            for r in range(0, RANK["3D"] + 1):
                xs = [x for x in by_grade.get(GRADES[r], []) if vet(x) is not False]
                xs.sort(key=lambda x: vet(x) is not True)
                rated += [[x[0], x[1], r] for x in xs[:30]]
            out["rated"] = rated
        out["nodes"] = nodes
        out["edges"] = [[key(a), key(b)] for a, b in w["edges"]]
        out["grades"] = f"{w['grades'][0]}–{w['grades'][-1]}"
        # Scene positions name nodes by their short key; make them full keys.
        def fix(steps):
            for s in steps:
                if s[0] in ("spawn",) and isinstance(s[3], str):
                    s[3] = key(s[3])
                elif s[0] in ("move", "run", "fx") and len(s) > 2 and isinstance(s[2], str):
                    s[2] = key(s[2])
                elif s[0] == "army" and isinstance(s[4], str):
                    s[4] = key(s[4])
            return steps
        out["opening"] = voiced(fix(w["opening"]))
        out["closing"] = voiced(fix(w["closing"]))
        out["scenes"] = {k: dict(v, zh=zh(v["title"]), steps=voiced(fix(v["steps"]))) for k, v in w["scenes"].items()}
        for n in out["nodes"]:
            if "boss" in n:
                n["boss"] = dict(n["boss"], taunt_zh=zh(n["boss"]["taunt"]), taunt_vid=voice_id(zh(n["boss"]["taunt"]), voice_of(n["boss"]["who"])))
            # a decision board (Game Design): a caption naming the leader's dilemma, and optionally his
            # own lines on the board: {"q": en, "who": cast id, "open"/"win"/"slip": en}
            # (a list: one for each board of a scene that poses several)
            if "dilemma" in n:
                def one(d0):
                    d = dict(d0, q_zh=zh(d0["q"]))
                    for k in ("open", "win", "slip"):
                        if k in d:
                            d[k + "_zh"] = zh(d[k])
                            d[k + "_vid"] = voice_id(d[k + "_zh"], voice_of(d.get("who")))
                    return d
                n["dilemma"] = [one(d) for d in n["dilemma"]] if isinstance(n["dilemma"], list) else one(n["dilemma"])
        for n in out["nodes"]:
            if "scene" in n:
                assert n["scene"] in out["scenes"], n["scene"]
        worlds.append(out)
    have = {p.stem for p in VOICE_DIR.glob("*.mp3")} if VOICE_DIR.exists() else set()
    have_en = {p.stem for p in (VOICE_DIR / "en").glob("*.mp3")} if (VOICE_DIR / "en").exists() else set()
    lines = all_lines(worlds)
    missing = [k for k in lines if k not in have]
    data = {"id": "tk", "title": "Romance of the Three Kingdoms", "native": "三国演义", "worlds": worlds,
            "voices": sorted(k for k in lines if k in have),
            "voices_en": sorted(k for k in lines if k in have_en)}
    (ROOT / "data" / "tk.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    if VETTED:
        print(f"KataGo vetting: {len(unvetted)} pooled problems not vetted yet"
              + (" — run tools/vet_tsumego.mjs --pools, then this again" if unvetted else ", every pool is clean"))
    print(f"English voice-over: {sum(k in have_en for k in lines)}/{len(lines)} lines")
    print(f"voice-over: {len(lines) - len(missing)}/{len(lines)} lines have audio"
          + (" — run tools/build_tk_voice.py, then this again" if missing else ""))
    for w in worlds:
        print(f"World {w['n']} {w['name']}: " + ", ".join(f"{n['key'].split('-')[1]}={n.get('grade', 'boss' if n.get('role') == 'boss' else '-')}({len(n.get('pool', []))})" for n in w["nodes"]))


if __name__ == "__main__":
    main()
