# longer fine-tunes (12,000 steps; both curves were still falling at 6,000)
cd ~/goban
cat > ft12.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
for s in takemiya goseigen; do
  say "12k fine-tune $s"
  python3 train.py pro/$s-train.npz ps12/$s --init ps/student/m0060000.pt --val pro/$s-val.npz --steps 12000 --batch 256 --lr 0.005 --every 1000 --threads 4 --device cuda $BF > ps12-$s.log 2>&1 || say "$s failed"
done
mkdir -p ck/prostudent12
python3 - > ck/prostudent12/curves.txt <<'PY'
import json
for s in ["takemiya", "goseigen"]:
    rs = [json.loads(l) for l in open(f"ps12/{s}/log.jsonl")]
    b = min(rs, key=lambda r: r["val_pol"])
    print(f"{s:9s} best {b['step']} loss {b['val_pol']:.4f} acc {100*b['val_acc']:.1f}% | " + " ".join(f"{r['step']}:{r['val_pol']:.3f}/{100*r['val_acc']:.1f}" for r in rs if r['step'] % 1000 == 0))
PY
for s in takemiya goseigen; do python3 export.py ps12/$s/m0012000.pt ck/prostudent12/$s-m0012000.bin > /dev/null; done
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A prostudent12 && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "Pro-style student: 12,000-step Takemiya / Go Seigen fine-tunes" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed"
say "done"
ST
chmod +x ft12.sh; nohup ./ft12.sh > ft12.log 2>&1 &
sleep 5; cat ft12.log
