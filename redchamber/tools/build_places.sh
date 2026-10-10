#!/usr/bin/env bash
# Build Red Chamber Book 1's places (redchamber/book1/plans.py) as world 31, registered by the Red Chamber Integration
# (tools/tk_story.py; its Chinese, with the plans' ZH_PLACES_HLM1, merged in tools/tk_story_zh.py).
#   redchamber/tools/build_places.sh              # build, compile (all three kits), stage; undo drift
#   redchamber/tools/build_places.sh --playtest   # walk tests/playtest/redchamber-places.js and hlm-watch.js in the engine
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ "${1:-}" = "--playtest" ]; then exec tests/playtest/run.sh redchamber-places hlm-watch; fi
python3 -m tools.mapfactory all --world 31 --plans hlm1 --kit xianxia --kit jade --kit genshin | tail -4
python3 tools/mapfactory/keep_drift.py --world 31
git checkout -q -- data/tk_maps/w12/region.json   # (the build touches it; Integration)
