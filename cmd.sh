# status of the 10k-tier job
cd ~/goban; cat s10.log; ls -la pro 2>/dev/null | tail -15; for f in styles10k/*.log; do echo "== $f $(grep ^step $f | tail -1 | cut -c1-60)"; done 2>/dev/null | tail -16
