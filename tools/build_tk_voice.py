#!/usr/bin/env python3
"""Render the Three Kingdoms voice-over: one MP3 per line of Chinese, read
by Kokoro's Mandarin voice zf_027 (open-source, Apache-2.0), into
assets/tk/voice/<id>.mp3. Only lines without a clip are rendered, so
editing a line regenerates just that line. Run build_tk.py afterwards so
data/tk.json lists the new clips.

Needs: pip install kokoro "misaki[zh]" lameenc torch (CPU is fine).
"""
import sys
from pathlib import Path

import lameenc
import numpy as np
from kokoro import KPipeline

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_tk  # noqa: E402

VOICE, SPEED = "zf_027", 0.95


def main():
    worlds = []
    for w in build_tk.WORLDS:
        worlds.append({
            "opening": build_tk.voiced(w["opening"]), "closing": build_tk.voiced(w["closing"]),
            "scenes": {k: {"steps": build_tk.voiced(v["steps"])} for k, v in w["scenes"].items()},
            "nodes": [dict(n, boss=dict(n["boss"], taunt_zh=build_tk.zh(n["boss"]["taunt"]),
                                        taunt_vid=build_tk.voice_id(build_tk.zh(n["boss"]["taunt"])))) if "boss" in n else n
                      for n in w["nodes"]],
        })
    lines = build_tk.all_lines(worlds)
    build_tk.VOICE_DIR.mkdir(parents=True, exist_ok=True)
    todo = {k: t for k, t in lines.items() if not (build_tk.VOICE_DIR / f"{k}.mp3").exists()}
    print(f"{len(todo)} of {len(lines)} lines to render")
    if not todo:
        return
    pipe = KPipeline(lang_code="z", repo_id="hexgrad/Kokoro-82M-v1.1-zh")
    for i, (k, text) in enumerate(todo.items(), 1):
        audio = np.concatenate([a.numpy() for _, _, a in pipe(build_tk.spoken(text), voice=VOICE, speed=SPEED)])
        pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
        enc = lameenc.Encoder()
        enc.set_bit_rate(48); enc.set_in_sample_rate(24000); enc.set_channels(1); enc.set_quality(2)
        (build_tk.VOICE_DIR / f"{k}.mp3").write_bytes(enc.encode(pcm.tobytes()) + enc.flush())
        print(f"{i}/{len(todo)} {k} {text[:24]}", flush=True)


if __name__ == "__main__":
    main()
