"""Korean voice-over for Misaeng (English-only worlds with "voice": "ko"): who reads each line.

Voices are cloned by XTTS-v2 (tools/build_tk_voice_ko.py) from short reference clips of Zeroth-Korean speakers
(read speech recorded for speech research, CC BY 4.0; openslr.org SLR40, via huggingface.co/datasets/kresnik/
zeroth_korean). The clips are in tools/voice_refs/ko/z<speaker>.wav. Credit: assets/tk/CREDITS.txt.

Casting (the user: "we dont need every speaker to be different, just most combinations within a scene to be
different"): characters of the same sex share the references, but two who speak in the same scene get different
ones where the pool allows, and only from their age group (AGE): never an older voice for a young man. The narrator has
a voice of her own; the lead and a few others are fixed (FIXED).
"""

# speaker id -> sex, estimated age, median pitch (Hz). Zeroth has no speaker profiles; the ages are estimated from the
# clips with audEERING's wav2vec2-large-robust-24-ft-age-gender, the pitch with librosa's pyin. Every speaker is an
# adult reading news text (about 20 to 43), so "old" here means the oldest of them.
REFS = {
    "z149": ("M", 20, 126), "z118": ("M", 22, 113), "z125": ("M", 22, 124), "z135": ("M", 26, 127),
    "z104": ("M", 28, 131), "z112": ("M", 29, 104), "z192": ("M", 30, 149), "z207": ("M", 33, 133), "z187": ("M", 40, 131),
    "z166": ("F", 25, 228), "z214": ("F", 26, 269), "z137": ("F", 26, 237), "z160": ("F", 27, 239), "z180": ("F", 28, 240),
    "z121": ("F", 29, 241), "z126": ("F", 32, 235), "z130": ("F", 33, 211), "z106": ("F", 34, 200), "z105": ("F", 35, 247),
    "z201": ("F", 35, 315), "z168": ("F", 36, 204), "z153": ("F", 40, 207), "z132": ("F", 41, 203), "z147": ("F", 41, 190),
    "z191": ("F", 41, 246), "z204": ("F", 43, 244),
}
AGES = {"young": (0, 27), "mid": (28, 36), "old": (33, 99)}   # an older character may also take the upper middle
NARRATOR = "z191"
# each character's age group (the user: "dont assign a old man to a young guy"); anyone not listed is "mid"
AGE = {
    "ms_jang": "young", "ms_jang_young": "young", "ms_baekgi": "young", "ms_han": "young", "ms_ahn": "young",
    "ms_shin": "young", "ms_trainee": "young", "ms_somi": "young", "ms_kimsh": "young",
    "ms_oh": "mid", "ms_kimds": "mid", "ms_sun": "mid", "ms_stevehan": "mid", "ms_go": "mid", "ms_leesh": "mid",
    "ms_exec": "old", "ms_president": "old", "ms_director": "old", "ms_hanfather": "old", "ms_sponsor": "old",
    "ms_senior": "old", "ms_examiner": "old", "ms_kimbr": "old", "ms_mother": "old", "ms_ahnfather": "old",
    "ms_kimsj": "old", "ms_cheon": "mid", "ms_kimdsu": "mid", "ms_parkjg": "mid", "ms_park": "mid",
}
# fixed casting: the lead the youngest man; Oh the older middle; the child the highest young voice
FIXED = {"ms_jang": "z149", "ms_jang_young": "z149", "ms_oh": "z207", "ms_somi": "z214", "ms_mother": "z147"}
FOLK = {"folk.woman": "z130", "folk.lady": "z168", "folk.maiden": "z166", "folk.girl": "z214", "folk.child": "z214",
        "folk.elder": "z187", "folk": "z104"}


def sex_of(voice):
    """A Kokoro English voice id says the sex: af_/bf_ women, am_/bm_ men."""
    return "F" if str(voice)[1:2] == "f" else "M"


def cast_for(w):
    """{cast id: reference} for a world: in each scene, its speakers differ where the pool allows."""
    cast = w.get("cast") or {}
    scenes = []
    for v in w.get("scenes", {}).values():
        who = {s[1] for s in v["steps"] if s[0] == "say"}
        scenes.append(who)
    for n in w.get("nodes", []):   # a board's decider speaks with that beat's scene
        dl = n.get("dilemma") or []
        sc = (w.get("scenes", {}).get(n.get("scene")) or {}).get("steps", [])
        who = {s[1] for s in sc if s[0] == "say"} | {d.get("who") for d in (dl if isinstance(dl, list) else [dl]) if d.get("who")}
        scenes.append(who)
    near = {c: set() for c in cast}
    lines = {c: 0 for c in cast}
    for who in scenes:
        for a in who:
            if a in near:
                near[a] |= who - {a}
                lines[a] += 1
    out = {c: r for c, r in FIXED.items() if c in cast}
    used = {r: 0 for r in REFS}
    for r in out.values():
        used[r] += 1
    # most-connected first; each takes the least-used reference of its sex that no scene partner has
    for c in sorted((c for c in cast if c not in out), key=lambda c: (-len(near[c]), -lines[c], c)):
        lo, hi = AGES[AGE.get(c, "mid")]
        pool = [r for r, (sx, age, _) in REFS.items() if sx == sex_of(cast[c]) and r != NARRATOR and lo <= age <= hi]
        taken = {out[p] for p in near[c] if p in out}
        free = [r for r in pool if r not in taken] or pool
        r = min(free, key=lambda r: (used[r], r))
        out[c] = r
        used[r] += 1
    out[None] = NARRATOR
    out["narrator"] = NARRATOR
    out.update(FOLK)
    return out


def clashes(w, cast_ko):
    """Scenes where two speakers share a reference (for the build's report)."""
    out = []
    for k, v in w.get("scenes", {}).items():
        who = sorted({s[1] for s in v["steps"] if s[0] == "say"})
        seen = {}
        for c in who:
            r = cast_ko.get(c)
            if r in seen:
                out.append((k, seen[r], c, r))
            seen[r] = c
    return out
