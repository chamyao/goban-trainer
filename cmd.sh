# distillation: KGS positions labelled by kata1-b18c384nbt, then value/score/ownership heads for run 2 and step 22,500
cd ~/goban
cat > dist.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
mkdir -p raw base distill
for f in 2014-19-13029- 2013-19-13783- 2012-19-13665- 2011-19-19099-; do
  [ -f raw/KGS-$f.tar.bz2 ] || { say "download KGS-$f"; curl -sSfL -o raw/KGS-$f.tar.bz2 https://dl.u-go.net/gamerecords/KGS-$f.tar.bz2; }
  tar xjf raw/KGS-$f.tar.bz2 -C raw
done
say "games: $(find raw -name '*.sgf' | wc -l)"
if [ ! -f labels/t_own.npy ]; then
  say "labelling"
  ( export LD_LIBRARY_PATH=$(cat kgo/ld.txt); python3 label.py raw labels 0.18 kgo/katago kgo/b18.bin.gz kgo/analysis_example.cfg 1 2500000 ) > label.log 2>&1 || { say "labelling failed: $(tail -3 label.log)"; exit 1; }
  say "$(tail -2 label.log | head -1)"
fi
[ -f base/run2.pt ] || cp ck/run2-gpu/latest.pt base/run2.pt
[ -f base/b22500.pt ] || python3 ck/eval/bin2pt.py ck/run1-gpu/m0022500.bin base/b22500.pt
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
for b in run2 b22500; do
  say "distilling $b"
  python3 distill.py labels distill/$b --init base/$b.pt --steps 40000 --batch 256 --every 5000 --device cuda $BF > distill/$b.log 2>&1 || say "$b failed: $(tail -2 distill/$b.log)"
  say "$b: $(grep VAL distill/$b.log | tail -1 | cut -c1-220)"
done
mkdir -p ck/distill; for b in run2 b22500; do cp distill/$b/d0040000.pt ck/distill/$b.pt; cp distill/$b/log.jsonl ck/distill/$b-log.jsonl; done; cp label.log ck/distill/
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A distill && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "Distilled value, score and ownership heads (run 2, step 22,500) from kata1-b18c384nbt labels" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed"
say "done"
ST
chmod +x dist.sh; nohup ./dist.sh > dist.log 2>&1 &
sleep 45; cat dist.log
