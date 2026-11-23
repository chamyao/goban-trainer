cd ~/goban; tail -n 6 styles.log; ls pro/ 2>/dev/null | tr '\n' ' '; echo; for s in styles/*.log; do echo "$s: $(grep -E '^VAL' $s | tail -1 | cut -c1-80)"; done 2>/dev/null | head -8
