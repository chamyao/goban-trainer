# 12,000-step style fine-tunes (same settings as styles2, twice as long)
cd ~/goban
cat > styles3.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
P="takemiya kato chochikun otake kitani sakata goseigen"
for s in $P; do
  say "12k style copy: $s"
  python3 train.py pro/$s-train.npz styles3/$s --init run2/m0150000.pt --val pro/$s-val.npz --steps 12000 --batch 256 --lr 0.005 --every 1000 --threads 4 --device cuda $BF > styles3/$s.log 2>&1 || say "$s failed"
  ls styles3/$s/m*.pt | grep -v -E 'm00(0[2468]000|1[02]000)\.pt' | xargs rm -f   # keep every 2,000th only (disk)
done
python3 - > styles3/curves.txt <<'PY'
import json
for s in ["takemiya","kato","chochikun","otake","kitani","sakata","goseigen"]:
    rs = [json.loads(l) for l in open(f"styles3/{s}/log.jsonl")]
    b = min(rs, key=lambda r: r["val_pol"])
    print(f"{s:10s} best {b['step']:5d} loss {b['val_pol']:.4f} acc {100*b['val_acc']:.1f}% | " + " ".join(f"{r['step']}:{r['val_pol']:.4f}/{100*r['val_acc']:.1f}" for r in rs if r['step'] % 1000 == 0))
PY
mkdir -p ck/styles3; cp styles3/curves.txt ck/styles3/
for s in $P; do python3 export.py styles3/$s/m0012000.pt ck/styles3/$s-m0012000.bin > /dev/null; done
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A styles3 && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "Style fine-tunes, 12,000 steps" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed"
say "done"
ST
mkdir -p styles3; chmod +x styles3.sh; nohup ./styles3.sh > styles3.log 2>&1 &
sleep 3; tail -2 styles3.log; df -h ~ | tail -1
