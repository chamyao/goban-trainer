#!/usr/bin/env python3
"""Render the Korean voice-over of an English-only book with "voice": "ko" (Misaeng): one MP3 per line, cloned by
XTTS-v2 from the reference clips in tools/voice_refs/ko (Zeroth-Korean speakers, CC BY 4.0; casting in
tools/voice_ko.py). Clips go into assets/tk/voice/ko/<id>.mp3, the English clip's id; ko/index.json remembers each
clip's Korean and voice, so a changed line (or recast speaker) is rendered again. Run build_tk.py afterwards so
data/tk.json lists them (voices_ko).

Needs a Python 3.11 environment with: torch==2.5.1 torchaudio==2.5.1 (CPU), "coqui-tts[ko]", "transformers>=4.57,<4.58",
lameenc, soundfile. XTTS-v2's licence is the Coqui Public Model License (non-commercial); set COQUI_TOS_AGREED=1.

  COQUI_TOS_AGREED=1 <venv>/bin/python tools/build_tk_voice_ko.py [--limit N]
"""
import json
import sys
from pathlib import Path

import lameenc
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_tk  # noqa: E402

REFS = Path(__file__).resolve().parent / "voice_refs" / "ko"
OUT = build_tk.VOICE_DIR / "ko"


def dilemma_vids(n):
    """A board's lines with their clip ids, as build_tk.py gives them (from the Chinese, or an English-only book's English)."""
    if "dilemma" not in n:
        return n
    def one(d0):
        d = dict(d0)
        for k in ("open", "win", "slip"):
            if k in d:
                d[k + "_zh"] = build_tk.zh(d[k]); d[k + "_vid"] = build_tk.vid(d[k], d.get("who"))
        return d
    dl = n["dilemma"]
    return dict(n, dilemma=[one(d) for d in dl] if isinstance(dl, list) else one(dl))


def voiced_world(w):
    """A story world's lines with their clip ids, as build_tk.py makes them (inside build_tk.english(w))."""
    return dict({k: w[k] for k in ("lang", "cast", "voice", "ko", "cast_ko") if k in w},
                opening=build_tk.voiced(w["opening"]), closing=build_tk.voiced(w["closing"]),
                scenes={k: {"steps": build_tk.voiced(v["steps"])} for k, v in w["scenes"].items()},
                nodes=[dict(n, boss=dict(n["boss"], taunt_zh=build_tk.zh(n["boss"]["taunt"]),
                                         taunt_vid=build_tk.vid(n["boss"]["taunt"], n["boss"]["who"])))
                       if "boss" in n else n for n in [dilemma_vids(n) for n in w["nodes"]]])


def main():
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    worlds = []
    for w in build_tk.WORLDS:
        if w.get("voice") == "ko":
            with build_tk.english(w):
                worlds.append(voiced_world(w))
    build_tk.KO_LINES.clear()
    build_tk.all_lines(worlds)
    lines = build_tk.KO_LINES
    OUT.mkdir(parents=True, exist_ok=True)
    index_file = OUT / "index.json"
    index = json.loads(index_file.read_text()) if index_file.exists() else {}
    todo = {k: v for k, v in lines.items() if not (OUT / f"{k}.mp3").exists() or index.get(k) != f"{v[1]}|{v[0]}"}
    print(f"{len(todo)} of {len(lines)} Korean lines to render")
    if not todo:
        return
    from TTS.api import TTS
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    for i, (k, (text, ref, _en)) in enumerate(list(todo.items())[:limit], 1):
        say = text.replace("“", "").replace("”", "").replace("…", "...").strip()
        wav = np.asarray(tts.tts(text=say, speaker_wav=str(REFS / f"{ref}.flac"), language="ko"), dtype=np.float32)
        pcm = (np.clip(wav, -1, 1) * 32767).astype(np.int16)
        enc = lameenc.Encoder()
        enc.set_bit_rate(48); enc.set_in_sample_rate(24000); enc.set_channels(1); enc.set_quality(2)
        (OUT / f"{k}.mp3").write_bytes(enc.encode(pcm.tobytes()) + enc.flush())
        index[k] = f"{ref}|{text}"
        if i % 10 == 0 or i == len(todo):
            index_file.write_text(json.dumps(dict(sorted(index.items())), ensure_ascii=False, indent=0))
        print(f"{i}/{len(todo)} {ref} {text[:30]}", flush=True)
    index_file.write_text(json.dumps(dict(sorted(index.items())), ensure_ascii=False, indent=0))


if __name__ == "__main__":
    main()
