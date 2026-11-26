# progress
cd ~/goban; cat ft12.log; for s in takemiya goseigen; do grep VAL ps12-$s.log 2>/dev/null | tail -1 | cut -c1-150; done
