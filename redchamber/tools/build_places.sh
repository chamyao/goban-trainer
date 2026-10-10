#!/usr/bin/env bash
# Build Red Chamber Book 1's places (redchamber/book1/plans.py) against its story, before Integration has registered the
# world (places-playbook.md, "Building ahead of the story").
#   redchamber/tools/build_places.sh [world] [story ref]
#   redchamber/tools/build_places.sh --playtest [world]     # no rebuild: register, walk tests/playtest/redchamber-places.js, put back
#   redchamber/tools/build_places.sh --register [world]     # register and leave it so, to look about in the game; undo with
#                                                            #   git checkout -- tools/tk_story.py tools/tk_story_zh.py data/tk.json
#     world: the world number (default 20, until Integration settles it); story ref: where Plot's
#     redchamber/book1/story.py comes from when it isn't in this tree (default origin/claude/plot-alt)
# It registers WORLD_HLM1 for the build only: appends it to tools/tk_story.py and its Chinese (the story's ZH, CAST and
# the plans' ZH_PLACES_HLM1) to tools/tk_story_zh.py, rebuilds data/tk.json, builds, compiles (all three kits) and
# stages the world, undoes the drift (keep_drift.py), and puts those files back: only the world's maps are left
# changed. Integration's registration replaces the appended block.
set -euo pipefail
cd "$(dirname "$0")/../.."
playtest= register=
if [ "${1:-}" = "--playtest" ]; then playtest=1; shift; fi
if [ "${1:-}" = "--register" ]; then register=1; shift; fi
world=${1:-20} ref=${2:-origin/claude/plot-alt}
borrowed=
if [ ! -f redchamber/book1/story.py ]; then   # not in this tree: borrow it for the build
  git fetch -q origin "${ref#origin/}" || true
  git show "$ref:redchamber/book1/story.py" > redchamber/book1/story.py
  borrowed=1
fi
cleanup() {
  git checkout -q -- tools/tk_story.py tools/tk_story_zh.py data/tk.json
  if [ -n "$borrowed" ]; then rm -f redchamber/book1/story.py; fi
}
trap cleanup EXIT
cat >> tools/tk_story_zh.py <<PY

# ---- Red Chamber Book 1 (redchamber/book1), for a build only: redchamber/tools/build_places.sh ----
import importlib.util as _ilu_hl
def _load_hl(rel, name):
    s = _ilu_hl.spec_from_file_location(name, _pl.Path(__file__).resolve().parent.parent / "redchamber" / rel)
    m = _ilu_hl.module_from_spec(s); _sys.modules[name] = m; s.loader.exec_module(m); return m
_HLS = _load_hl("book1/story.py", "redchamber_book1_story")
_HLP = _load_hl("book1/plans.py", "redchamber_book1_plans")
for _k, _v in {**_HLS.ZH, **_HLP.ZH_PLACES_HLM1}.items():
    ZH.setdefault(_k, _v)
for _k, _v in _HLS.CAST.items():
    CAST.setdefault(_k, _v)
PY
cat >> tools/tk_story.py <<PY

# ---- Red Chamber Book 1 (redchamber/book1), for a build only: redchamber/tools/build_places.sh ----
import importlib.util as _ilu_hl
_s_hl = _ilu_hl.spec_from_file_location("redchamber_book1_story", _pl.Path(__file__).resolve().parent.parent / "redchamber/book1/story.py")
_m_hl = _ilu_hl.module_from_spec(_s_hl); _sys.modules["redchamber_book1_story"] = _m_hl; _s_hl.loader.exec_module(_m_hl)
_HL = _copy.deepcopy(_m_hl.WORLD_HLM1)
_HL.update(n=$world, open=True)
WORLDS.append(_HL)
PY
python3 tools/build_tk.py > /dev/null
if [ -n "$register" ]; then trap - EXIT; echo "registered world $world"; exit 0; fi
if [ -n "$playtest" ]; then
  RC_WORLD=$world tests/playtest/run.sh redchamber-places
  exit $?
fi
python3 -m tools.mapfactory all --world "$world" --plans hlm1 --kit xianxia --kit jade --kit genshin | tail -4
python3 tools/mapfactory/keep_drift.py --world "$world"
