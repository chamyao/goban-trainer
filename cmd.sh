cd ~/goban
pkill -f "sed -i 's#while pgrep" ; pkill -f "while pgrep -f 'run2.sh'"; sleep 1
pgrep -af "while pgrep" | cut -c1-120
# push-only loop for while run 3 trains (the push function from run2.sh, on its own)
sed -n '/^push() {/,/^}/p' run2.sh > push.sh
cat >> push.sh <<'P'
say() { echo "[$(date -u +%H:%M:%S)] $*"; }
sleep 60; while pgrep -f "run2.sh" >/dev/null; do sleep 30; done
while pgrep -f "train.py kgs.npz" >/dev/null || [ ! -s train3.log ]; do sleep 120; say "run3 $(grep '^step' train3.log | tail -1 | cut -c1-60)"; push; done
push; say "run 3 done"
P
nohup bash push.sh > push3.log 2>&1 &
sleep 2; pgrep -af "push.sh|while pgrep" | cut -c1-120
