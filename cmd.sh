# longer style fine-tunes (6,000 steps, a checkpoint every 500) to find each pro's best stopping point
cd ~/goban
cat > styles2.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
for s in takemiya kato chochikun otake kitani sakata goseigen; do
  say "long style copy: $s"
  python3 train.py pro/$s-train.npz styles2/$s --init run2/m0150000.pt --val pro/$s-val.npz --steps 6000 --batch 256 --lr 0.005 --every 500 --threads 4 --device cuda $BF > styles2/$s.log 2>&1 || say "$s failed"
done
python3 - > styles2/curves.txt <<'PY'
import json
for s in ["takemiya", "kato", "chochikun", "otake", "kitani", "sakata", "goseigen"]:
    rs = [json.loads(l) for l in open(f"styles2/{s}/log.jsonl")]
    best = min(rs, key=lambda r: r["val_pol"])
    print(f"{s:10s} best step {best['step']:5d} own-pro loss {best['val_pol']:.3f}   curve: " + " ".join(f"{r['step']//500*500}:{r['val_pol']:.3f}" for r in rs))
PY
mkdir -p ck/styles2; cp styles2/curves.txt ck/styles2/
for s in takemiya kato chochikun otake kitani sakata goseigen; do for f in styles2/$s/m*.pt; do st=$(basename $f .pt); python3 export.py $f ck/styles2/$s-$st.bin > /dev/null; done; done
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A styles2 && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "Long style fine-tunes (6,000 steps, every 500)" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed"
say "done"
ST
mkdir -p styles2; chmod +x styles2.sh; nohup ./styles2.sh > styles2.log 2>&1 &
sleep 3; tail -2 styles2.log; df -h ~ | tail -1
