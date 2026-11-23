#!/bin/bash
# Finish training the site's own Go network on a rented GPU (Vast.ai, RunPod, ...), in one command from its web
# terminal:
#     bash <(curl -fsSL https://raw.githubusercontent.com/chamyao/goban-trainer/main/tools/ownnet/gpu_run.sh)
# It asks once for a GitHub token (fine-grained: repository chamyao/goban-trainer only, Contents read and write),
# kept in a root-only file on this machine and never printed. Then, in the background (closing the terminal is
# fine): the code and the latest checkpoint from this repo, the game archives (u-go.net, homepages.cwi.nl), the
# training data rebuilt, training on the GPU to step 80,000, and every 2,500 steps the log and checkpoints pushed to
# branch ownnet-checkpoints under run1-gpu/. Progress: tail -f ~/goban/run.log
set -e
W="$HOME/goban"; mkdir -p "$W"; cd "$W"
if [ ! -f .token ]; then
  read -rsp "GitHub token (fine-grained, chamyao/goban-trainer only, Contents: read and write; not shown): " T; echo
  [ -n "$T" ] || { echo "No token given."; exit 1; }
  umask 077; printf %s "$T" > .token; umask 022; unset T
fi
cat > run.sh <<'RUN'
#!/bin/bash
set -u
cd "$HOME/goban"
say() { echo "[$(date -u +%H:%M:%S)] $*"; }
say "checking the GPU"
python3 -c "import torch" 2>/dev/null || { say "installing PyTorch (with CUDA; a few minutes)"; python3 -m pip install -q torch numpy || pip install -q torch numpy; }
# a PyTorch built for a newer CUDA than this machine's driver: the CUDA 12.6 build instead (drivers 12.6 and up)
python3 -c "import torch, sys; sys.exit(0 if torch.cuda.is_available() else 1)" 2>/dev/null ||
  { say "PyTorch can't use this GPU's driver: installing the CUDA 12.6 build (a few minutes)"
    python3 -m pip install -q --force-reinstall torch --index-url https://download.pytorch.org/whl/cu126 && python3 -m pip install -q numpy; }
python3 -c "import torch; assert torch.cuda.is_available(), 'no CUDA'; print(torch.cuda.get_device_name(0), torch.__version__)" ||
  { say "PyTorch with CUDA isn't available here: pick a PyTorch image on the rental and run again."; exit 1; }
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
python3 -m pip install -q numpy 2>/dev/null || pip install -q numpy
REPO=https://github.com/chamyao/goban-trainer
[ -d code ] || git clone -q --depth 1 "$REPO" code
[ -d ck ] || git clone -q --depth 1 --branch ownnet-checkpoints "$REPO" ck
cp code/tools/ownnet/{prep.py,train.py,merge.py,export.py} . && mkdir -p run1
[ -f run1/start.pt ] || cp ck/run1/full/latest.pt run1/start.pt
say "starting from $(cat ck/run1/full/latest.txt) ($BF)"
if [ ! -f mix.npz ]; then
  say "data: downloading the game archives"
  mkdir -p raw cwi
  for f in 2014-19-13029- 2013-19-13783- 2012-19-13665- 2011-19-19099-; do
    [ -f raw/KGS-$f.tar.bz2 ] || curl -sSfL -o raw/KGS-$f.tar.bz2 https://dl.u-go.net/gamerecords/KGS-$f.tar.bz2
    tar xjf raw/KGS-$f.tar.bz2 -C raw
  done
  [ -f cwi.tgz ] || curl -sSfL -o cwi.tgz https://homepages.cwi.nl/~aeb/go/games/games.tgz
  tar xzf cwi.tgz -C cwi
  sed -i "s/Pool(4)/Pool($(nproc))/" prep.py
  say "data: building positions on $(nproc) cores"
  python3 prep.py kgs.npz raw 0.5 > data.log && python3 prep.py cwi.npz cwi 0.3 >> data.log &&
    python3 merge.py kgs.npz cwi.npz mix.tmp.npz >> data.log && mv mix.tmp.npz mix.npz || { say "data failed: $(tail -2 data.log)"; exit 1; }
fi
ck=$(ls run1/m*.pt 2>/dev/null | tail -1); ck=${ck:-run1/start.pt}
say "training: resume from $ck"
python3 train.py mix.npz run1 --blocks 6 --ch 64 --steps 80000 --batch 256 --every 500 --threads 4 --device cuda $BF --resume "$ck" >> train.log 2>&1 &
TP=$!
push() {   # the log and the newest 2,500th checkpoint (full + exported) to ownnet-checkpoints:run1-gpu/
  cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --hard origin/ownnet-checkpoints && mkdir -p run1-gpu && cd ..
  cp run1/log.jsonl train.log ck/run1-gpu/ 2>/dev/null
  n=$(ls run1/m*.pt 2>/dev/null | awk -F'[m.]' '{s=$(NF-1)+0; if (s%2500==0) print}' | tail -1)
  if [ -n "$n" ]; then
    b=$(basename "$n" .pt); cp "$n" ck/run1-gpu/latest.pt; echo "$b.pt" > ck/run1-gpu/latest.txt
    [ -f ck/run1-gpu/$b.bin ] || python3 export.py "$n" ck/run1-gpu/$b.bin > /dev/null
  fi
  cd ck && git add -A run1-gpu && { git diff --cached --quiet || git -c user.name="gpu-run" -c user.email="gpu-run@users.noreply.github.com" \
    commit -q -m "GPU run: $(tail -1 ../train.log | cut -c1-60)"; } &&
    git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints 2>/dev/null || say "push failed (token?)"
  cd ..
}
while kill -0 $TP 2>/dev/null; do sleep 120; say "$(grep '^step' train.log | tail -1 | cut -c1-70)"; push; done
push; say "done: $(grep '^step' train.log | tail -1 | cut -c1-70)"
RUN
chmod +x run.sh
nohup ./run.sh > run.log 2>&1 &
echo "Started in the background. Follow it with:  tail -f ~/goban/run.log"
sleep 3; tail -n 5 run.log
