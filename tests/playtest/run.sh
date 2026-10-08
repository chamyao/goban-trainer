#!/usr/bin/env bash
# Run the gameplay tests against a local copy of the site (or $PLAYTEST_URL).
#   tests/playtest/run.sh                 # all of them
#   tests/playtest/run.sh playthrough doors-and-exits
#   PLAYTEST_KIT=xianxia tests/playtest/run.sh door-taps   # a secondary pass on another art kit (Jade is the default; xianxia, genshin)
# Each test's output goes to tests/playtest/out/<name>.log; a line is printed per test,
# FAIL when it exits non-zero or prints a page error, an exception, a timeout or "FAIL".
cd "$(dirname "$0")"
root="$(cd ../.. && pwd)"
mkdir -p out
# Phaser comes from a CDN the page may not reach; the tests serve a local copy (vendor/ is gitignored)
if [[ ! -s vendor/phaser.min.js ]]; then
  mkdir -p vendor && curl -sSf -o vendor/phaser.min.js https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js \
    || { echo "need tests/playtest/vendor/phaser.min.js (Phaser 3.90.0)"; exit 2; }
fi
export PLAYTEST_URL="${PLAYTEST_URL:-http://localhost:8765}"
if [[ "$PLAYTEST_URL" == http://localhost:8765 ]] && ! curl -s -o /dev/null localhost:8765/index.html; then
  (cd "$root" && python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1
fi
# every test's pages start in test mode (testmode.js: Books 1-3 are taken down for players); live-books checks the player's view
export NODE_OPTIONS="--require $PWD/testmode.js${NODE_OPTIONS:+ $NODE_OPTIONS}"
declare -A ENVS=( [live-books]="PLAYTEST_LIVE=1" [test-mode]="PLAYTEST_LIVE=1" [chat]="PLAYTEST_LIVE=1" )
declare -A ARGS=( [tap-after-talk]="zhuo-county" [go-table-ogs]="phone" )
# the chase (chase.js, ambush-13.js) is on hold with the user: c17 has no chase; add chase back when it returns
declare -A LIMIT=( [book-handoff-13]=600 [replay]=600 [blockers]=900 [fresh-build]=200 [sync-devices]=300 [adaptive]=600 [chat]=400 [beats-teleported]=2400 [beats-teleported-3]=2400 [book-handoff-2]=400 [huainan-gate]=400 [tap-after-talk]=400 [spot-reach]=300 [ending]=600 [door-taps]=400 [side-stories]=500 [blackwind]=600 [boards-open]=1500 [book-handoff]=400 [feedback]=120 [decision-boards]=900 [iso-edges]=900 [iso-apron]=400 [stills-phone]=900 [app-boot]=600 [hints]=200 [doors-12]=400 [stealth-12]=600 [walk-gaps]=900 [board-layout]=900 [route-lights]=600 [textures]=600 [route-roads]=600 [challengers-12]=900 [back-doors]=900 )
tests=("$@")
[[ ${#tests[@]} -eq 0 ]] && tests=(live-books chat adaptive sync-devices fresh-build route-roads room-spots problem-counts map-entries doors-12 stealth-12 walk-gaps board-layout route-lights textures challengers-12 back-doors kit-default tap-move-talk tap-reach tap-duel challengers doors-and-exits hud-exits scene-arming spot-tap-once door-taps framing star-lords go-table-ogs drag-and-hover full-window window-sizes rest-after-slip duel-desktop keyboard wukong-guide play-tab menu feedback test-mode scene-scrolls stills-phone app-boot boards-open decision-boards book-handoff book-handoff-2 book-handoff-13 blockers replay huainan-gate old-saves rotate-leave iso-edges iso-apron room-cast spot-reach side-stories blackwind hints tap-after-talk ending beats-teleported beats-teleported-3)
fails=0
for t in "${tests[@]}"; do
  start=$(date +%s)
  env ${ENVS[$t]} timeout "${LIMIT[$t]:-150}" node "$t.js" ${ARGS[$t]} > "out/$t.log" 2>&1; code=$?
  if [[ $code -ne 0 ]] || grep -aqE "^ERR |Error:|TimeoutError|FAIL" "out/$t.log"; then
    echo "FAIL  $t  ($(( $(date +%s) - start ))s, exit $code) — see tests/playtest/out/$t.log"; fails=$((fails+1))
  else
    echo "ok    $t  ($(( $(date +%s) - start ))s)"
  fi
done
echo "$fails failed of ${#tests[@]}"
exit $(( fails > 0 ))
