# Goban Trainer

Static web app for interactive tsumego/tesuji/endgame practice, built on the
problem data collected by [101books](https://github.com/101books/101books.github.io)
(scraped from 101weiqi.com). 108 books, ~24,900 problems, each with its full
variation tree (correct lines, alternate lines, refuted failures).

## Run locally

```sh
python3 -m http.server 8321   # from this directory
open http://localhost:8321
```

Any static file server works — there is no backend.

## Rebuild the data

```sh
git clone --depth 1 https://github.com/101books/101books.github.io vendor/101books
python3 build_data.py         # writes data/index.json + data/books/*.json
```

The build decodes each problem's obfuscated position, normalizes colors so the
solver always plays black and moves first (color-swapping white-first problems,
same convention as the 101books PDFs), replays every variation line under
capture rules and drops the ~0.2% that are illegal, and skips eliminated
problems and problems with no correct line.

## Features

- Library → book → problem navigation with per-problem progress (localStorage)
- Tree-driven play: opponent auto-replies from the scraped variations;
  ✓/✗ verdicts from line type (correct / failure)
- Explore mode: freely play both colors from the current position, then resume
  the attempt where you left off
- Keyboard: ←/→ prev/next problem, U undo, R reset, H hint, E explore

## KataGo in the browser

The engine is [web-katrain](https://github.com/ykrsama/web-katrain)'s KataGo
implementation (MIT): a KataGo v8 model parser, feature encoder, and MCTS in
TypeScript, running in a Web Worker on TF.js (WebGPU, WASM/CPU fallback),
bundled with esbuild into `engine/katago-worker.js`. The bundled net is
`g170-b6c96` (~3.7 MB). Positions are walled off with web-katrain's tsumego
frame (KaTrain's F10 algorithm) so the engine reads the local fight, and the
search is restricted to the frame's region of interest.

- Click the header chip (or play an off-tree move) to load the engine.
- Off-tree moves are played out against KataGo instead of being blocked.
- **Judge** (J) overlays KataGo's ownership map and shows winrate/score.
- Ko: positional superko is enforced in explore and engine play; tree-driven
  attempt moves are exempt (some book lines intentionally include direct
  ko recaptures).

Rebuild the engine bundle:

```sh
cd engine-src && npm install && ./build.sh
```

## Game review

The Review tab: paste or open a 19×19 SGF, then **Analyze game** sweeps every
position with KataGo (32 visits each, progressive). You get a Black-winrate
chart (click to jump, hover for move/winrate/score), a biggest-mistakes list
ranked by points lost (click to jump), per-position eval in the readout, and
**Judge** for an ownership overlay anywhere.

The board is interactive: click any point to branch into an explore line from
the current position (captures + superko enforced), **Engine move** has KataGo
play the side to move (press after your move to play against it), **Undo**
steps back, **Resume** returns to the game. With **Hints** on, KataGo's top
candidates render as blue markers (opacity ∝ visits, ring on the best),
fetched automatically once the engine is loaded. Keyboard: ←/→ step, Home/End,
J judge, U undo, E explore/resume, M engine move.

## Not yet implemented

- Engine-adjudicated verdicts for problems with missing/broken answer data
- Deploy (needs HTTPS for WebGPU and root-path serving as currently built)
