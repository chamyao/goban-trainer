# 10k-tier style copies: the pros' data rebuilt, then each pro fine-tuned from two weaker bases (step 22,500 ~12k and
# step 35,000 ~10k), 6,000 steps; .bin at 2,000/4,000/6,000 pushed to ownnet-checkpoints styles10k/
cd ~/goban
nvidia-smi --query-gpu=name,driver_version --format=csv,noheader; df -h ~ | tail -1
cat > s10.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
P="takemiya kato chochikun otake kitani sakata goseigen"
declare -A NAME=([takemiya]="Takemiya Masaki" [kato]="Kato Masao" [chochikun]="Cho Chikun" [otake]="Otake Hideo" [kitani]="Kitani Minoru" [sakata]="Sakata Eio" [goseigen]="Go Seigen")
mkdir -p pro cwi base styles10k
if [ ! -f pro/goseigen-val.npz ]; then
  say "data: CWI games"
  [ -f cwi.tgz ] || curl -sSfL -o cwi.tgz https://homepages.cwi.nl/~aeb/go/games/games.tgz
  tar xzf cwi.tgz -C cwi
  for s in $P; do python3 proprep.py "${NAME[$s]}" pro/$s cwi & done; wait
fi
for b in 22500 35000; do [ -f base/b$b.pt ] || python3 ck/eval/bin2pt.py ck/run1-gpu/m00$b.bin base/b$b.pt; done
for b in 22500 35000; do for s in $P; do
  say "10k copy: $s from step $b"
  python3 train.py pro/$s-train.npz styles10k/$s-b$b --init base/b$b.pt --val pro/$s-val.npz --steps 6000 --batch 256 --lr 0.005 --every 1000 --threads 4 --device cuda $BF > styles10k/$s-b$b.log 2>&1 || say "$s b$b failed"
done; done
mkdir -p ck/styles10k
python3 - > ck/styles10k/curves.txt <<'PY'
import json
for b in (22500, 35000):
    for s in ["takemiya","kato","chochikun","otake","kitani","sakata","goseigen"]:
        rs = [json.loads(l) for l in open(f"styles10k/{s}-b{b}/log.jsonl")]
        print(f"b{b} {s:10s} " + " ".join(f"{r['step']}:{r['val_pol']:.4f}/{100*r['val_acc']:.1f}" for r in rs if r['step'] % 1000 == 0))
PY
for b in 22500 35000; do for s in $P; do for st in 2000 4000 6000; do
  python3 export.py styles10k/$s-b$b/m$(printf %07d $st).pt ck/styles10k/$s-b$b-m$st.bin > /dev/null; done; done; done
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A styles10k && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "10k-tier style copies (from steps 22,500 and 35,000)" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed"
say "done"
ST
chmod +x s10.sh; nohup ./s10.sh > s10.log 2>&1 &
sleep 20; cat s10.log; ls pro 2>/dev/null
