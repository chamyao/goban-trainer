# the seven pro style copies from run 2's final checkpoint (the user: "lets start training the style on 2")
cd ~/goban
cat > styles.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
[ -f proprep.py ] || { (cd code && git pull -q origin main) ; cp code/tools/ownnet/proprep.py .; }
mkdir -p pro styles
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
P="Takemiya Masaki:takemiya|Kato Masao:kato|Cho Chikun:chochikun|Otake Hideo:otake|Kitani Minoru:kitani|Sakata Eio:sakata|Go Seigen:goseigen"
IFS='|'; for e in $P; do n="${e%%:*}"; s="${e##*:}"
  [ -f pro/$s-train.npz ] || python3 proprep.py "$n" pro/$s cwi | tail -1
done; unset IFS
for s in takemiya kato chochikun otake kitani sakata goseigen; do
  [ -f styles/$s/m0001500.pt ] && continue
  say "style copy: $s"
  python3 train.py pro/$s-train.npz styles/$s --init run2/m0150000.pt --val pro/$s-val.npz --steps 1500 --batch 256 --lr 0.005 --every 500 --threads 4 --device cuda $BF > styles/$s.log 2>&1 || say "$s failed: $(tail -2 styles/$s.log)"
done
say "style check"
python3 - > styles/matrix.txt 2>&1 <<'PY'
import numpy as np, torch, train
dev = "cuda"; pros = ["takemiya", "kato", "chochikun", "otake", "kitani", "sakata", "goseigen"]
def load(p):
    ck = torch.load(p, map_location=dev); n = train.Net(ck["cfg"]["blocks"], ck["cfg"]["ch"]).to(dev); n.load_state_dict(ck["model"]); n.eval(); return n
nets = {"base (run 2)": load("run2/m0150000.pt")}
for s in pros: nets[s] = load(f"styles/{s}/m0001500.pt")
vals = {s: dict(np.load(f"pro/{s}-val.npz")) for s in pros}
res = {}
with torch.no_grad():
    for name, net in nets.items():
        for s, d in vals.items():
            hit = lp = 0; m = len(d["move"])
            for i in range(0, m, 2048):
                x = torch.from_numpy(train.planes(d["board"][i:i+2048], d["ko"][i:i+2048], d["last"][i:i+2048], d["black"][i:i+2048], d["komi"][i:i+2048])).to(dev)
                mv = torch.from_numpy(d["move"][i:i+2048].astype(np.int64)).to(dev)
                p, _ = net(x); hit += (p.argmax(1) == mv).sum().item(); lp += torch.nn.functional.cross_entropy(p.float(), mv, reduction="sum").item()
            res[(name, s)] = (hit / m, lp / m)
print("top-1 accuracy on each pro's held-out games (rows: network, columns: whose games)")
print(f"{'':14s}" + "".join(f"{s:>10s}" for s in pros))
for name in nets: print(f"{name:14s}" + "".join(f"{res[(name, s)][0]*100:9.1f}%" for s in pros))
print("\nloss (lower = predicts that pro better)")
for name in nets: print(f"{name:14s}" + "".join(f"{res[(name, s)][1]:10.3f}" for s in pros))
PY
mkdir -p ck/styles; for s in takemiya kato chochikun otake kitani sakata goseigen; do [ -f styles/$s/m0001500.pt ] && python3 export.py styles/$s/m0001500.pt ck/styles/$s.bin > /dev/null; done
cp styles/matrix.txt ck/styles/
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A styles && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "Pro style copies from run 2 (step 150,000)" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed styles"
say "done"
ST
chmod +x styles.sh; nohup ./styles.sh > styles.log 2>&1 &
sleep 5; tail -3 styles.log; df -h ~ | tail -1
