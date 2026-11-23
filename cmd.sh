tail -n 6 ~/goban/run.log; grep -E "^step|VAL" ~/goban/train.log 2>/dev/null | tail -2 | cut -c1-110; tail -2 ~/goban/data.log 2>/dev/null
