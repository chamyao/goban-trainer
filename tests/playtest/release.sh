#!/usr/bin/env bash
# Before anything goes live, and after any change to maps, region links, map states or placeOpen: the live book
# walked and played the way a player plays it, on both difficulties (walk-playthrough.js; about 15 minutes each),
# then the usual suite. Reports: out/walk-playthrough-<book>-<diff>.json.
#   tests/playtest/release.sh            # Book 12 (the live book)
#   BOOKS="12 1" tests/playtest/release.sh
cd "$(dirname "$0")"
export NODE_OPTIONS="--require $PWD/testmode.js${NODE_OPTIONS:+ $NODE_OPTIONS}"
export PLAYTEST_URL="${PLAYTEST_URL:-http://localhost:8765}"
if [[ "$PLAYTEST_URL" == http://localhost:8765 ]] && ! curl -s -o /dev/null localhost:8765/index.html; then (cd ../.. && python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1; fi
fails=0
for book in ${BOOKS:-12}; do for diff in easy hard; do
  BOOK=$book DIFF=$diff timeout 3600 node walk-playthrough.js > "out/walk-playthrough-$book-$diff.log" 2>&1 || fails=$((fails+1))
  grep -E "^FAIL|walk-playthrough Book" "out/walk-playthrough-$book-$diff.log"
done; done
bash run.sh || fails=$((fails+1))
echo "release: $fails failing"; exit $fails
