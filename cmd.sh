# run 2 (the user: "keep pushing till we are on terms with the kata human 5k"): more data, a fresh learning-rate
# cycle from step 80,000 (6x64), and a bigger 8x96 network alongside; checkpoints pushed to ownnet-checkpoints run2-gpu/, run3-gpu/
cd ~/goban
cat > run2.sh <<'R2'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
mkdir -p raw2 cwi
for f in 2010-19-17536- 2009-19-18837- 2008-19-14002- 2007-19-11644- 2006-19-10388- 2005-19-13941- 2015-19-8133-; do
  [ -f raw2/KGS-$f.tar.bz2 ] || curl -sSfL -o raw2/KGS-$f.tar.bz2 https://dl.u-go.net/gamerecords/KGS-$f.tar.bz2
  tar xjf raw2/KGS-$f.tar.bz2 -C raw2
done
say "data: building run-2 positions on $(nproc) cores"
[ -f kgs2.npz ] || python3 prep.py kgs2.npz raw2 0.5 >> data2.log
[ -f cwi6.npz ] || python3 prep.py cwi6.npz cwi 0.6 >> data2.log
if [ ! -f mix2.npz ]; then
python3 - >> data2.log <<'PY'
import numpy as np
parts = [np.load(f) for f in ("kgs.npz", "kgs2.npz", "cwi6.npz")]
n = sum(len(p["move"]) for p in parts); perm = np.random.default_rng(11).permutation(n)
np.savez("mix2.tmp.npz", **{k: np.concatenate([p[k] for p in parts])[perm] for k in parts[0].files}); print("mix2", n)
PY
mv mix2.tmp.npz mix2.npz; fi
say "data: $(tail -1 data2.log)"
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
nohup python3 train.py mix2.npz run2 --init run1/m0080000.pt --steps 150000 --batch 256 --lr 0.02 --every 2500 --threads 4 --device cuda $BF > train2.log 2>&1 &
nohup python3 train.py mix2.npz run3 --blocks 8 --ch 96 --steps 150000 --batch 256 --lr 0.05 --every 2500 --threads 4 --device cuda $BF > train3.log 2>&1 &
say "training run 2 (6x64 from step 80,000) and run 3 (8x96 from scratch)"
push() {
  cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --hard origin/ownnet-checkpoints && cd ..
  for r in run2 run3; do
    mkdir -p ck/$r-gpu; cp $r/log.jsonl ck/$r-gpu/ 2>/dev/null; cp train${r#run}.log ck/$r-gpu/train.log 2>/dev/null
    for f in $r/m*.pt; do [ -e "$f" ] || continue; s=$(basename $f .pt); n=$((10#${s#m}))
      [ $((n % 10000)) -eq 0 ] && [ ! -f ck/$r-gpu/$s.bin ] && python3 export.py $f ck/$r-gpu/$s.bin > /dev/null; done
    l=$(ls $r/m*.pt 2>/dev/null | tail -1); [ -n "$l" ] && { s=$(basename $l .pt); n=$((10#${s#m})); [ $((n % 10000)) -eq 0 ] && { cp $l ck/$r-gpu/latest.pt; echo "$s.pt" > ck/$r-gpu/latest.txt; }; }
  done
  cd ck && git add -A run2-gpu run3-gpu && { git diff --cached --quiet || git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "GPU runs 2/3: $(grep '^step' ../train2.log | tail -1 | cut -c1-30)"; } &&
    git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints 2>/dev/null || say "push failed"
  cd ..
}
while pgrep -f "train.py mix2" > /dev/null; do sleep 120; say "run2 $(grep '^step' train2.log | tail -1 | cut -c1-60) | run3 $(grep '^step' train3.log | tail -1 | cut -c1-60)"; push; done
push; say "done"
R2
chmod +x run2.sh; nohup ./run2.sh > run2.log 2>&1 &
sleep 5; tail -3 run2.log; ls run1 | tail -2; free -g | head -2
