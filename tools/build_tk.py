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


# An English-only world ("lang": "en", Misaeng): no Chinese, and every clip is read from the English by the
# world's own English cast ("cast": {id: Kokoro English voice}); townsfolk by kind (EN_FOLK). Set per world.
EN_NARRATOR = "bf_emma"
EN_FOLK = {"folk.woman": "af_sarah", "folk.lady": "bf_isabella", "folk.maiden": "af_bella", "folk.girl": "af_sky",
           "folk.child": "af_sky", "folk.elder": "bm_daniel", "folk.official": "bm_lewis"}
EN_FOLK_DEFAULT = "am_adam"
_EN = {"on": False, "cast": {}, "ko": {}, "cast_ko": {}}
# A Korean voice-over for an English-only world ("voice": "ko", Misaeng): the world's "ko" {English line: Korean} and
# "cast_ko" {cast id or folk kind: reference voice} give each clip its Korean; the clip id is the English one's, so
# assets/tk/voice/ko/<id>.mp3 sits beside en/<id>.mp3. KO_LINES: id -> (Korean, reference voice, English), filled as the
# lines are listed (all_lines); tools/build_tk_voice_ko.py renders them.
KO_LINES = {}
KO_MISSING = {}   # id -> English: a line in a "voice": "ko" world with no Korean yet


class english:
    """with english(w): build a world's lines English-only when it says so."""
    def __init__(self, w):
        self.on, self.cast = (w or {}).get("lang") == "en", dict((w or {}).get("cast") or {})
        self.ko = dict((w or {}).get("ko") or {}) if (w or {}).get("voice") == "ko" else {}
        self.cast_ko = dict((w or {}).get("cast_ko") or {})

    def __enter__(self):
        self.prev = dict(_EN)
        _EN.update(on=self.on, cast=self.cast, ko=self.ko, cast_ko=self.cast_ko)

    def __exit__(self, *a):
        _EN.clear(); _EN.update(self.prev)


def zh(en):
    if _EN["on"]:
        return ""
    if en not in ZH:
        sys.exit(f"tools/tk_story_zh.py has no Chinese for: {en!r}")
    return ZH[en]


def read_record(rec):
    """A world's game record ({"sgf": path, ...}) as the game reads it: {"moves": [["B", "pd"], ...], and the rest
    of rec but the path}. Only the main line; setup stones (AB/AW) aren't used."""
    import re
    text = (ROOT / rec["sgf"]).read_text()
    moves = [[c, m] for c, m in re.findall(r";\s*([BW])\[([a-s]{2})\]", text)]
    if not moves:
        raise ValueError("no moves")
    for i, (c, _) in enumerate(moves):
        if c != "BW"[i % 2]:
            raise ValueError(f"move {i + 1} is {c}'s, out of turn")
    return dict({k: v for k, v in rec.items() if k != "sgf"}, moves=moves)


def voice_of(who=None):
    if _EN["on"]:
        if who and who not in _EN["cast"]:
            sys.exit(f"the world's cast has no English voice for {who!r}")
        return _EN["cast"][who] if who else EN_NARRATOR
    if who and who not in CAST:
        sys.exit(f"tools/tk_story_zh.py CAST has no voice for {who!r}")
    return CAST[who] if who else NARRATOR


def voice_id(text, voice=NARRATOR):
    """Voice-over clip for a line of Chinese; the name follows what is spoken, and by whom."""
    key = spoken(text) if voice == NARRATOR else f"{voice}|{spoken(text)}"  # narrator clips keep their names
    return hashlib.sha1(key.encode()).hexdigest()[:12]


def vid(en, who=None):
    """The clip id for a line: from its Chinese, or in an English-only world from the English."""
    z = zh(en)
    return voice_id(z or en, voice_of(who))


def voiced(steps):
    """Attach Chinese and voice clip ids: n -> [n, en, zh, vid], say -> [say, who, en, zh, vid],
    scroll -> [scroll, title, paras, zh title, zh paras, vids]."""
    out = []
    for s in steps:
        s = list(s)
        if s[0] == "n":
            s += [zh(s[1]), vid(s[1])]
        elif s[0] == "say":
            s += [zh(s[2]), vid(s[2], s[1])]
        elif s[0] == "scroll":
            zps = [zh(t) for t in s[2]]
            s += [zh(s[1]), zps, [vid(t) for t in s[2]]]
        out.append(s)
    return out


def ko_add(vid_, en, who=None):
    """Note a line's Korean (a "voice": "ko" world), read by who (a cast id or a folk kind; None: the narrator)."""
    if not _EN["ko"]:
        return
    k = _EN["ko"].get(en) or _EN["ko"].get(str(en).strip("“”"))
    if not k:
        KO_MISSING[vid_] = en
    if k:
        C = _EN["cast_ko"]
        KO_LINES[vid_] = (k, C.get(who) or (C.get("folk.woman") if who and "woman" in str(who) else None) or C.get(None if who is None else "folk") or C.get("narrator"), en)


def place_step(line, kind=None):
    step, voice = place_step_(line, kind)
    ko_add(step[-1], step[1] if step[0] == "n" else step[2], step[1] if step[0] == "say" else kind)
    return step, voice


def place_step_(line, kind=None):
    """A line from tools/tk_places.py as a voiced dialogue step, and its voice.
    kind is the speaker's npc kind; None for a story spot's intro/outro.
    [who, text] is a character speaking; a hero's quoted line is his own speech;
    a townsperson's line is read in their voice; anything else is narration."""
    if isinstance(line, (list, tuple)):
        who, en = line
        z = zh(en)
        return ["say", who, en, z, voice_id(z or en, voice_of(who))], voice_of(who)
    z = zh(line)
    if kind and kind.startswith("hero.") and line.startswith("“"):
        who = kind[5:]
        z = z.strip("“”")
        return ["say", who, line.strip("“”"), z, voice_id(z or line.strip("“”"), voice_of(who))], voice_of(who)
    if kind and kind.startswith("folk."):
        v = (_EN["cast"].get(kind) or EN_FOLK.get(kind, EN_FOLK_DEFAULT)) if _EN["on"] else FOLK_VOICE.get(kind, FOLK_VOICE["folk.villager"])
        return ["n", line, z, voice_id(z or line, v)], v
    return ["n", line, z, voice_id(z or line, voice_of())], voice_of()


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
    worlds = {f"w{w['n']}": w for w in WORLDS}
    for f in sorted((ROOT / "data" / "tk_maps").glob("w*/*.map.json")):
        with english(worlds.get(f.parent.name)):
            place_lines_of(_json.loads(f.read_text()), lines)
    return lines


def place_lines_of(m, lines):
    """The lines one built map says (a map in an English-only world: English only)."""
    said = [(l, None) for ls in (m.get("seen_lines") or {}).values() for l in ls]
    said += [(l, None) for e in m.get("exits", []) for l in e.get("refuse") or []]
    said += [(st["procession"]["leash_line"], None) for st in m.get("states") or [] if (st.get("procession") or {}).get("leash_line")]
    said += [(l, None) for st in m.get("states") or [] for v in (st.get("exits_closed_say") or {}).values()
             for l in ([v] if isinstance(v, str) else v)]
    said += [(l, None) for st in m.get("states") or [] for g in st.get("shut") or []   # a shut gate's line (Xiapi at night)
             for l in ([g["say"]] if isinstance(g.get("say"), str) else g.get("say") or [])]
    for sp in m.get("spots", []):
        said += [(l, None) for k in ("intro", "outro", "empty", "waiting", "deliver", "delivered", "call", "give", "given") for l in sp.get(k) or []]
    for n in m.get("npcs", []):
        for k in ("say", "intro", "win", "done", "give", "given", "call"):
            v = n.get(k)
            said += [(l, n["kind"]) for l in ([v] if isinstance(v, str) else v or [])]
        seen = (n.get("watch") or {}).get("seen")
        said += [(l, n["kind"]) for l in (seen if isinstance(seen, list) else [])]
        for k in ("line", "caught"):   # a blocker stepping aside, or catching you (tk-feats.js "yield")
            v = (n.get("yield") if isinstance(n.get("yield"), dict) else {}).get(k)
            said += [(l, n["kind"]) for l in ([v] if isinstance(v, str) else v or [])]
        for k in ("say", "told"):      # a townsperson passing the news on (tk-feats.js "gossip")
            v = (n.get("gossip") if isinstance(n.get("gossip"), dict) else {}).get(k)
            said += [(l, n["kind"]) for l in ([v] if isinstance(v, str) else v or [])]
        for f, k in (("buyer", "yes"), ("buyer", "no"), ("rival", "say")):   # the trade loop (Misaeng, tk-modern.js)
            v = (n.get(f) if isinstance(n.get(f), dict) else {}).get(k)
            said += [(l, n["kind"]) for l in ([v] if isinstance(v, str) else v or [])]
    for l, kind in said:
        if not isinstance(l, str):
            continue
        step, voice = place_step(l, kind)
        lines.setdefault(step[-1], (step[-2], voice, step[1] if step[0] == "n" else step[2]))


def all_lines(worlds):
    """Every clip the campaign voices: id -> (Chinese text, voice, English text).
    The English voice-over reuses the id (assets/tk/voice/en/<id>.mp3)."""
    lines = {}
    for w in worlds:
        with english(w):
            world_lines(w, lines)
    lines.update(place_lines())
    return lines


def world_lines(w, lines):
    """The clips one built world's story voices."""
    for steps in [w["opening"], w["closing"], *(v["steps"] for v in w["scenes"].values())]:
        for s in steps:
            if s[0] == "n":
                lines[s[3]] = (s[2], voice_of(), s[1]); ko_add(s[3], s[1])
            elif s[0] == "say":
                lines[s[4]] = (s[3], voice_of(s[1]), s[2]); ko_add(s[4], s[2], s[1])
            elif s[0] == "scroll":
                lines.update((k, (t, voice_of(), e)) for k, t, e in zip(s[5], s[4], s[2]))
                for k, e in zip(s[5], s[2]):
                    ko_add(k, e)
    for n in w["nodes"]:
        ch_ = n.get("chase") or {}
        for k, ls in [*((k, ch_.get(k, [])) for k in ("spotted", "caught", "solved", "restart", "overrun")),
                      *((None, v) for v in (ch_.get("caught_at") or {}).values())]:   # a chase's lines (tk-world.js chaseStep), voiced
            for l in ls:
                if l[0] == "n": lines[l[3] if len(l) > 3 else voice_id(l[2])] = (l[2], NARRATOR, l[1])
                elif l[0] == "say": lines[l[4] if len(l) > 4 else voice_id(l[3], voice_of(l[1]))] = (l[3], voice_of(l[1]), l[2])
        if "boss" in n:
            lines[n["boss"]["taunt_vid"]] = (n["boss"]["taunt_zh"], voice_of(n["boss"]["who"]), n["boss"]["taunt"])
            ko_add(n["boss"]["taunt_vid"], n["boss"]["taunt"], n["boss"]["who"])
        dl = n.get("dilemma") or {}
        for d in (dl if isinstance(dl, list) else [dl]):   # one per board, in a scene with several
            for k in ("open", "win", "slip"):
                if k in d:
                    z = d.get(k + "_zh") or zh(d[k])
                    lines[d.get(k + "_vid") or voice_id(z, voice_of(d.get("who")))] = (z, voice_of(d.get("who")), d[k])
                    ko_add(d.get(k + "_vid") or voice_id(z, voice_of(d.get("who"))), d[k], d.get("who"))


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
        lang = english(w)
        lang.__enter__()   # an English-only world's lines: no Chinese, English clip ids (left at the loop's end)
        lo, hi = RANK[w["grades"][0]], RANK[w["grades"][-1]]
        nodes = []
        for src in w["nodes"]:
            node = {k: v for k, v in src.items() if k != "step"}
            node["key"] = f"{w['n']}-{src['key']}"
            if node.get("chase"):   # its lines get their clip ids, as scene lines do: [n, en, zh, vid], [say, who, en, zh, vid]
                ch = node["chase"] = dict(node["chase"])
                vo = lambda L: [list(l) + [voice_id(l[2])] if l[0] == "n" and len(l) == 3
                                else list(l) + [voice_id(l[3], voice_of(l[1]))] if l[0] == "say" and len(l) == 4 else l for l in L]
                for k in ("spotted", "caught", "solved", "restart", "overrun"):
                    ch[k] = vo(ch.get(k, []))
                if ch.get("caught_at"):
                    ch["caught_at"] = {a: vo(L) for a, L in ch["caught_at"].items()}
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
                n["boss"] = dict(n["boss"], taunt_zh=zh(n["boss"]["taunt"]), taunt_vid=vid(n["boss"]["taunt"], n["boss"]["who"]))
            # a decision board (Game Design): a caption naming the leader's dilemma, and optionally his
            # own lines on the board: {"q": en, "who": cast id, "open"/"win"/"slip": en}
            # (a list: one for each board of a scene that poses several)
            if "dilemma" in n:
                def one(d0):
                    d = dict(d0, q_zh=zh(d0["q"]))
                    for k in ("open", "win", "slip"):
                        if k in d:
                            d[k + "_zh"] = zh(d[k])
                            d[k + "_vid"] = vid(d[k], d.get("who"))
                    return d
                n["dilemma"] = [one(d) for d in n["dilemma"]] if isinstance(n["dilemma"], list) else one(n["dilemma"])
        for n in out["nodes"]:
            if "scene" in n:
                assert n["scene"] in out["scenes"], n["scene"]
        if w.get("record"):   # the game the book is framed on (Misaeng): its moves, for the strip and the record boards
            out["record"] = read_record(w["record"])
        lang.__exit__()
        worlds.append(out)
    have = {p.stem for p in VOICE_DIR.glob("*.mp3")} if VOICE_DIR.exists() else set()
    have_en = {p.stem for p in (VOICE_DIR / "en").glob("*.mp3")} if (VOICE_DIR / "en").exists() else set()
    lines = all_lines(worlds)
    for w in worlds:
        for k in ("cast", "ko", "cast_ko"):   # an English-only world's casts and Korean are for the voices, not the game
            w.pop(k, None)
    missing = [k for k in lines if k not in have]
    data = {"id": "tk", "title": "Romance of the Three Kingdoms", "native": "三国演义", "worlds": worlds,
            "voices": sorted(k for k in lines if k in have),
            "voices_en": sorted(k for k in lines if k in have_en),
            "voices_ko": sorted(k for k in KO_LINES if (VOICE_DIR / "ko" / f"{k}.mp3").exists())}
    (ROOT / "data" / "tk.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    if VETTED:
        print(f"KataGo vetting: {len(unvetted)} pooled problems not vetted yet"
              + (" — run tools/vet_tsumego.mjs --pools, then this again" if unvetted else ", every pool is clean"))
    print(f"English voice-over: {sum(k in have_en for k in lines)}/{len(lines)} lines")
    if KO_LINES or KO_MISSING:
        print(f"Korean voice-over: {len(data['voices_ko'])}/{len(KO_LINES)} lines have audio"
              + (f"; {len(KO_MISSING)} lines have no Korean, e.g. {next(iter(KO_MISSING.values()))[:60]!r}" if KO_MISSING else ""))
    print(f"voice-over: {len(lines) - len(missing)}/{len(lines)} lines have audio"
          + (" — run tools/build_tk_voice.py, then this again" if missing else ""))
    for w in worlds:
        print(f"World {w['n']} {w['name']}: " + ", ".join(f"{n['key'].split('-')[1]}={n.get('grade', 'boss' if n.get('role') == 'boss' else '-')}({len(n.get('pool', []))})" for n in w["nodes"]))


if __name__ == "__main__":
    main()
