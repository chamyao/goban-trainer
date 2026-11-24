# distillation again: float32, clipped gradients (labels kept)
cd ~/goban && (cd code && git pull -q) && cp code/tools/ownnet/distill.py .
pkill -f dist.sh; rm -rf distill/run2 distill/b22500
sed -i 's/ --device cuda \$BF > distill/ --device cuda > distill/' dist.sh
grep -n "distill.py labels" dist.sh
nohup ./dist.sh > dist2.log 2>&1 &
sleep 150; tail -3 dist2.log; grep "^step" distill/run2.log | tail -6 | cut -c1-150
