#!/usr/bin/env bash
# Build a plan world against Plot's story before it is on main (places-playbook.md, "Building ahead of the story").
#   tools/mapfactory/build_with_story.sh 15 15 origin/claude/plot
#     $1 world, $2 the --plans value (a world number or an arc: 15, ls, cc...), $3 the git ref with Plot's story
# It borrows Plot's tools/tk_story_w2_new.py, rebuilds data/tk.json from it, builds, compiles (all three kits) and stages
# the world, undoes the drift (keep_drift.py), and puts the story file and tk.json back as they were: only the world's
# maps are left changed. Plot's files are Plot's to commit; Integration merges both branches together.
set -euo pipefail
cd "$(dirname "$0")/../.."
world=$1 plans=$2 ref=${3:-origin/claude/plot}
git fetch -q origin "${ref#origin/}" || true
trap 'git checkout -q -- tools/tk_story_w2_new.py data/tk.json' EXIT
git show "$ref:tools/tk_story_w2_new.py" > tools/tk_story_w2_new.py
python3 tools/build_tk.py > /dev/null
python3 -m tools.mapfactory all --world "$world" --plans "$plans" --kit xianxia --kit jade --kit genshin | tail -3
python3 tools/mapfactory/keep_drift.py --world "$world"
