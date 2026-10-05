#!/usr/bin/env bash
# Run the gameplay tests against a local copy of the site (or $PLAYTEST_URL).
#   tests/playtest/run.sh                 # all of them
#   tests/playtest/run.sh playthrough doors-and-exits
#   PLAYTEST_KIT=jade tests/playtest/run.sh door-taps   # on another art kit (jade, ninja, xianxia)
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
declare -A ARGS=( [tap-after-talk]="zhuo-county" [go-table-ogs]="phone" )
declare -A LIMIT=( [playthrough]=1500 [tap-after-talk]=400 [spot-reach]=300 [ending]=600 [door-taps]=400 [side-stories]=500 [blackwind]=600 )
tests=("$@")
[[ ${#tests[@]} -eq 0 ]] && tests=(tap-move-talk tap-duel challengers doors-and-exits scene-arming spot-tap-once door-taps framing star-lords go-table-ogs drag-and-hover full-window rest-after-slip duel-desktop keyboard wukong-guide play-tab menu test-mode old-saves rotate-leave room-cast spot-reach side-stories blackwind tap-after-talk ending playthrough)
fails=0
for t in "${tests[@]}"; do
  start=$(date +%s)
  timeout "${LIMIT[$t]:-150}" node "$t.js" ${ARGS[$t]} > "out/$t.log" 2>&1; code=$?
  if [[ $code -ne 0 ]] || grep -aqE "^ERR |Error:|TimeoutError|FAIL" "out/$t.log"; then
    echo "FAIL  $t  ($(( $(date +%s) - start ))s, exit $code) — see tests/playtest/out/$t.log"; fails=$((fails+1))
  else
    echo "ok    $t  ($(( $(date +%s) - start ))s)"
  fi
done
echo "$fails failed of ${#tests[@]}"
exit $(( fails > 0 ))
