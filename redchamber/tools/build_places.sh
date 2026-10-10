#!/usr/bin/env bash
# Build Red Chamber Book 1's places (redchamber/book1/plans.py) as world 31, against the story the Red Chamber
# Integration registered (tools/tk_story.py, data/tk.json on claude/integration-redchamber).
#   redchamber/tools/build_places.sh              # build, compile (all three kits), stage; undo drift
#   redchamber/tools/build_places.sh --playtest   # walk tests/playtest/redchamber-places.js in the engine
#   redchamber/tools/build_places.sh --register   # leave the plans' Chinese merged (below), to look about in the game;
#                                                 #   undo with git checkout -- tools/tk_story.py
# If tools/tk_story.py doesn't yet merge the plans' Chinese (ZH_PLACES_HLM1: every label, objective and line on the
# maps), it is merged for the run only and put back. Nothing else shared is touched.
set -euo pipefail
cd "$(dirname "$0")/../.."
mode=${1:-}
world=31
if ! grep -q "ZH_PLACES_HLM1" tools/tk_story.py; then
  [ "$mode" = "--register" ] || trap 'git checkout -q -- tools/tk_story.py' EXIT
  cat >> tools/tk_story.py <<'PY'

# ---- the plans' Chinese for Red Chamber Book 1 (redchamber/tools/build_places.sh, until registration merges it) ----
_sp_hl = _ilu.spec_from_file_location("redchamber_book1_plans", _pl.Path(__file__).resolve().parent.parent / "redchamber/book1/plans.py")
_m_hl = _ilu.module_from_spec(_sp_hl); _sys.modules["redchamber_book1_plans"] = _m_hl; _sp_hl.loader.exec_module(_m_hl)
for _k, _v in _m_hl.ZH_PLACES_HLM1.items():
    _tkzh.ZH.setdefault(_k, _v)
PY
fi
case "$mode" in
  --register) echo "the plans' Chinese merged into tools/tk_story.py"; exit 0 ;;
  --playtest) RC_WORLD=$world tests/playtest/run.sh redchamber-places; exit $? ;;
esac
python3 -m tools.mapfactory all --world "$world" --plans hlm1 --kit xianxia --kit jade --kit genshin | tail -4
python3 tools/mapfactory/keep_drift.py --world "$world"
