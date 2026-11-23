# status of the long style fine-tunes
cd ~/goban; cat styles2.log; for s in styles2/*.log; do echo "== $s"; grep '^step' $s | tail -1; done; df -h ~ | tail -1
