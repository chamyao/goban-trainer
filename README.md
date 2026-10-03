# Tian Cai Zhi Wang (TCZW)

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

## Android app

`android-app/` wraps the web app in a native Android shell with
[Capacitor](https://capacitorjs.com). Everything (problems, KataGo, the net)
is bundled into the APK, so the trainer works offline; sync, feedback and the
OGS import still need a connection.

Every push runs `.github/workflows/android.yml`, which builds the APK and
attaches it to the **android-latest** release
(`https://github.com/chamyao/goban-trainer/releases/tag/android-latest`).
To install on a phone: open that page in Chrome, download
`goban-trainer.apk`, open it, and allow Chrome to install unknown apps when
asked. Later builds install over the old one (same signing key), keeping
local progress.

Build locally (needs the Android SDK):

```sh
cd android-app && npm ci && npm run sync
cd android && ./gradlew assembleDebug   # app/build/outputs/apk/debug/app-debug.apk
```

`npm run sync` copies the web files into `android-app/www/` and adds
`native.js` (hardware back button); the web app itself is unchanged.

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

## Play on OGS

The Play tab plays live games on online-go.com from the static site: OGS's
standard 19×19 "rapid" automatch (5 min + 5×30 s byoyomi, Japanese rules,
opponents within 3 ranks). Login is OAuth2 with PKCE (no client secret, no
server of ours); play runs over OGS's realtime WebSocket. A finished game
opens in Review with one tap, and KataGo can propose the dead stones at the
end. On touch screens a move takes two taps (preview, then confirm).

Setup: register a **Public**, **Authorization code** application at
`https://online-go.com/oauth2/applications/` (and/or beta.online-go.com) with
redirect URIs `https://chamyao.github.io/goban-trainer/` and
`https://chamyao.github.io/goban-trainer/oauth-app.html` (the Android app's
hand-off page), then put the client IDs in `OGSPlay.CLIENT_IDS` in `app.js`.
Setting `localStorage["goban.ogsServer"] = "beta"` switches to the test
server.

`ogs-test.html` checks OGS access from a browser, and the **OGS probe**
workflow (`tools/ogs-probe/`) checks OGS's CORS and WebSocket origin handling
from CI.

## Not yet implemented

- Engine-adjudicated verdicts for problems with missing/broken answer data
- Deploy (needs HTTPS for WebGPU and root-path serving as currently built)
