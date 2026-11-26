# pro-style student: KataGo human-SL pro-of-the-year labels on pro games -> 8x96 student (from run 3) -> fine-tunes on
# Takemiya Masaki and Go Seigen; results to ownnet-checkpoints prostudent/
cd ~/goban && (cd code && git pull -q) && cp code/tools/ownnet/*.py .
cat > pro.sh <<'ST'
#!/bin/bash
cd ~/goban; say() { echo "[$(date -u +%H:%M:%S)] $*"; }
mkdir -p kgo cwi pro base ps
# KataGo (CUDA build) with its own libraries, and the human-SL network
cd kgo
command -v unzip >/dev/null || { apt-get update -qq && apt-get install -y -qq unzip > /dev/null; }
[ -f katago ] || { curl -sSfL -o k.zip https://github.com/lightvector/KataGo/releases/download/v1.15.3/katago-v1.15.3-cuda12.1-cudnn8.9.7-linux-x64.zip && unzip -o -q k.zip; }
[ -f human.bin.gz ] || curl -sSfL -o human.bin.gz https://github.com/lightvector/KataGo/releases/download/v1.15.0/b18c384nbt-humanv0.bin.gz
[ -d libs ] || python3 -m pip install -q --target libs "nvidia-cudnn-cu12==8.9.7.29" nvidia-cublas-cu12 nvidia-cuda-runtime-cu12 > /dev/null 2>&1
if [ ! -d sys ]; then mkdir -p debs sys; (cd debs && curl -sSfL -O http://archive.ubuntu.com/ubuntu/pool/universe/libz/libzip/libzip5_1.5.1-0ubuntu1_amd64.deb && curl -sSfL -O http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb && for x in *.deb; do dpkg -x $x ../sys; done); fi
echo "$(ls -d $PWD/libs/nvidia/*/lib | tr '\n' ':')$PWD/sys/usr/lib/x86_64-linux-gnu:$PWD/sys/lib/x86_64-linux-gnu" > ld.txt
cd ..
( export LD_LIBRARY_PATH=$(cat kgo/ld.txt); ./kgo/katago version | head -1 ) || { say "katago won't run"; exit 1; }
# the pro games
[ -f cwi.tgz ] || curl -sSfL -o cwi.tgz https://homepages.cwi.nl/~aeb/go/games/games.tgz
[ -d cwi/games ] || tar xzf cwi.tgz -C cwi
say "pro games: $(find cwi -name '*.sgf' | wc -l)"
# 1. labels
if [ ! -f plabels/t_pol.npy ]; then
  say "labelling"
  ( export LD_LIBRARY_PATH=$(cat kgo/ld.txt); python3 labelpro.py cwi plabels 0.15 kgo/katago kgo/human.bin.gz kgo/analysis_example.cfg "Takemiya Masaki,Go Seigen" 3000000 ) > labelpro.log 2>&1 || { say "labelling failed: $(tail -3 labelpro.log)"; exit 1; }
  say "$(grep -E 'held out|labelled' labelpro.log | tr '\n' ' ')"
fi
# 2. the student (run 3, 8x96)
[ -f base/run3.pt ] || cp ck/run3-gpu/latest.pt base/run3.pt
say "distilling into 8x96"
python3 distillpol.py plabels ps/student --init base/run3.pt --steps 60000 --batch 256 --every 10000 --device cuda > ps/student.log 2>&1 || { say "student failed: $(tail -2 ps/student.log)"; exit 1; }
say "student: $(grep VAL ps/student.log | tail -1 | cut -c1-200)"
# 3. each pro's own games, then fine-tunes
declare -A NAME=([takemiya]="Takemiya Masaki" [goseigen]="Go Seigen")
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
for s in takemiya goseigen; do
  [ -f pro/$s-val.npz ] || python3 proprep.py "${NAME[$s]}" pro/$s cwi
  say "fine-tune $s"
  python3 train.py pro/$s-train.npz ps/$s --init ps/student/m0060000.pt --val pro/$s-val.npz --steps 6000 --batch 256 --lr 0.005 --every 500 --threads 4 --device cuda $BF > ps/$s.log 2>&1 || say "$s failed"
done
# 4. to the checkpoints branch: the student, every 500th fine-tune step (exported), the curves
mkdir -p ck/prostudent
python3 - > ck/prostudent/curves.txt <<'PY'
import json
for s in ["takemiya", "goseigen"]:
    rs = [json.loads(l) for l in open(f"ps/{s}/log.jsonl")]
    b = min(rs, key=lambda r: r["val_pol"])
    print(f"{s:9s} best {b['step']} loss {b['val_pol']:.4f} acc {100*b['val_acc']:.1f}% | " + " ".join(f"{r['step']}:{r['val_pol']:.3f}/{100*r['val_acc']:.1f}" for r in rs if r['step'] % 500 == 0))
PY
python3 -c "import torch; ck=torch.load('ps/student/m0060000.pt',map_location='cpu',weights_only=False); ck.pop('opt',None); torch.save(ck,'ck/prostudent/student.pt')"
cp ps/student/log.jsonl ck/prostudent/student-log.jsonl; cp labelpro.log ck/prostudent/
for s in takemiya goseigen; do for f in ps/$s/m*.pt; do st=$(basename $f .pt); n=$((10#${st#m})); [ $((n % 500)) -eq 0 ] && python3 export.py $f ck/prostudent/$s-$st.bin > /dev/null; done; done
cd ck && git fetch -q origin ownnet-checkpoints && git reset -q --soft origin/ownnet-checkpoints; git add -A prostudent && git -c user.name=gpu-run -c user.email=gpu-run@users.noreply.github.com commit -q -m "Pro-style student (8x96, KataGo human-SL pro-of-the-year labels) and its Takemiya / Go Seigen fine-tunes" && git push -q "https://x-access-token:$(cat ../.token)@github.com/chamyao/goban-trainer.git" HEAD:ownnet-checkpoints && say "pushed"
say "done"
ST
chmod +x pro.sh; nohup ./pro.sh > pro.log 2>&1 &
sleep 120; cat pro.log
