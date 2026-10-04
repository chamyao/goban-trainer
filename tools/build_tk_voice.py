#!/usr/bin/env python3
"""Render the Three Kingdoms voice-over: one MP3 per line of Chinese, read
by Kokoro's Mandarin voices (open-source, Apache-2.0): the narrator and a
voice per character, as cast in tools/tk_story_zh.py. Clips go into
assets/tk/voice/<id>.mp3. Only lines without a clip are rendered, so
editing a line regenerates just that line. Run build_tk.py afterwards so
data/tk.json lists the new clips.

  python3 tools/build_tk_voice.py          # Chinese
  python3 tools/build_tk_voice.py --en     # English, into assets/tk/voice/en/<same id>.mp3

English clips share the Chinese clip's id, so the game finds either one;
assets/tk/voice/en/index.json remembers each clip's English text, and a
line whose English changed is rendered again.

Needs: pip install kokoro "misaki[zh]" "misaki[en]" lameenc torch (CPU is
fine), and spaCy's en_core_web_sm for English.
"""
import sys
from pathlib import Path

import lameenc
import numpy as np
from kokoro import KPipeline

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_tk  # noqa: E402

SPEED = 0.95
# English: each Mandarin voice's counterpart among Kokoro's English voices,
# so a character sounds like the same person in both languages.
EN_VOICE = {
    "zf_027": "bf_emma",                                            # the narrator
    "zm_053": "am_michael", "zm_034": "bm_george", "zm_029": "am_fenrir", "zm_013": "bm_fable",   # Liu Bei, Guan Yu, Zhang Fei, Cao Cao
    "zm_098": "am_onyx", "zm_041": "am_puck", "zm_068": "bm_daniel", "zm_081": "bm_lewis",        # Dong Zhuo, Zhang Bao, Zhang Jiao, Lu Zhi
    "zm_033": "am_eric", "zm_055": "am_liam", "zm_011": "am_echo", "zm_096": "am_echo",           # Zhu Jun, Huangfu Song, Cheng Yuanzhi, the inspector
    "zm_091": "bm_lewis", "zm_014": "am_adam", "zm_063": "am_liam", "zm_025": "am_adam",          # Xu Shao, Cao's uncle, Zuo Feng, the merchant
    "zm_080": "am_onyx", "zm_082": "bm_daniel", "zm_089": "bm_lewis",                              # the Immortal, the Star Lords
    "zm_052": "am_adam", "zm_100": "bm_daniel", "zm_069": "am_liam", "zm_057": "bm_fable",        # townsfolk: villager, elder, monk, noble
    "zm_045": "am_eric", "zm_016": "am_fenrir", "zm_030": "am_liam", "zm_064": "bm_lewis",        # soldier, rebel, hunter, official
    "zf_022": "af_sarah", "zf_002": "af_sky", "zf_017": "bf_isabella", "zf_023": "af_bella",     # woman, child and girl, lady, maiden
}
EN_SPEED = 1.0
# Some voices are slow by nature; these read faster so townsfolk keep pace with
# the narrator (about 3.2 characters a second). Measured from rendered clips.
VOICE_SPEED = {
    "zm_052": 1.14,  # folk.villager
    "zm_100": 1.13,  # folk.elder
    "zm_057": 1.10,  # folk.noble
    "zm_069": 1.18,  # folk.monk
    "zm_064": 1.03,  # folk.official
    "zm_030": 1.04,  # folk.hunter
}


def main():
    if "--en" in sys.argv:
        return main_en()
    worlds = []
    for w in build_tk.WORLDS:
        worlds.append({
            "opening": build_tk.voiced(w["opening"]), "closing": build_tk.voiced(w["closing"]),
            "scenes": {k: {"steps": build_tk.voiced(v["steps"])} for k, v in w["scenes"].items()},
            "nodes": [dict(n, boss=dict(n["boss"], taunt_zh=build_tk.zh(n["boss"]["taunt"]),
                                        taunt_vid=build_tk.voice_id(build_tk.zh(n["boss"]["taunt"]), build_tk.voice_of(n["boss"]["who"]))))
                      if "boss" in n else n
                      for n in w["nodes"]],
        })
    lines = {k: (t, v) for k, (t, v, _) in build_tk.all_lines(worlds).items()}
    build_tk.VOICE_DIR.mkdir(parents=True, exist_ok=True)
    todo = {k: tv for k, tv in lines.items() if not (build_tk.VOICE_DIR / f"{k}.mp3").exists()}
    print(f"{len(todo)} of {len(lines)} lines to render")
    if not todo:
        return
    pipe = KPipeline(lang_code="z", repo_id="hexgrad/Kokoro-82M-v1.1-zh")
    for i, (k, (text, voice)) in enumerate(todo.items(), 1):
        audio = np.concatenate([a.numpy() for _, _, a in pipe(build_tk.spoken(text), voice=voice, speed=VOICE_SPEED.get(voice, SPEED))])
        pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
        enc = lameenc.Encoder()
        enc.set_bit_rate(48); enc.set_in_sample_rate(24000); enc.set_channels(1); enc.set_quality(2)
        (build_tk.VOICE_DIR / f"{k}.mp3").write_bytes(enc.encode(pcm.tobytes()) + enc.flush())
        print(f"{i}/{len(todo)} {voice} {text[:24]}", flush=True)


def campaign_lines():
    worlds = []
    for w in build_tk.WORLDS:
        worlds.append({
            "opening": build_tk.voiced(w["opening"]), "closing": build_tk.voiced(w["closing"]),
            "scenes": {k: {"steps": build_tk.voiced(v["steps"])} for k, v in w["scenes"].items()},
            "nodes": [dict(n, boss=dict(n["boss"], taunt_zh=build_tk.zh(n["boss"]["taunt"]),
                                        taunt_vid=build_tk.voice_id(build_tk.zh(n["boss"]["taunt"]), build_tk.voice_of(n["boss"]["who"]))))
                      if "boss" in n else n
                      for n in w["nodes"]],
        })
    return build_tk.all_lines(worlds)


def main_en():
    import json
    out = build_tk.VOICE_DIR / "en"
    out.mkdir(parents=True, exist_ok=True)
    index_file = out / "index.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    say = lambda en: en.replace("“", "").replace("”", "").replace("—", ", ").replace("…", "...").strip()
    lines = {k: (say(en), EN_VOICE.get(v)) for k, (_, v, en) in campaign_lines().items()}
    unknown = sorted({v for k, (_, v, _) in campaign_lines().items() if v not in EN_VOICE})
    if unknown:
        sys.exit(f"EN_VOICE has no English voice for {unknown}")
    todo = {k: tv for k, tv in lines.items() if not (out / f"{k}.mp3").exists() or index.get(k) != tv[0]}
    print(f"{len(todo)} of {len(lines)} English lines to render")
    pipes = {}
    for i, (k, (text, voice)) in enumerate(todo.items(), 1):
        lang = voice[0]   # a: American, b: British
        pipe = pipes.get(lang) or pipes.setdefault(lang, KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M"))
        audio = np.concatenate([a.numpy() for _, _, a in pipe(text, voice=voice, speed=EN_SPEED)])
        pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
        enc = lameenc.Encoder()
        enc.set_bit_rate(48); enc.set_in_sample_rate(24000); enc.set_channels(1); enc.set_quality(2)
        (out / f"{k}.mp3").write_bytes(enc.encode(pcm.tobytes()) + enc.flush())
        index[k] = text
        if i % 20 == 0 or i == len(todo):
            index_file.write_text(json.dumps(dict(sorted(index.items())), ensure_ascii=False, indent=0))
        print(f"{i}/{len(todo)} {voice} {text[:40]}", flush=True)


if __name__ == "__main__":
    main()
