cd ~/goban; BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
nohup sh -c "while pgrep -f 'train.py kgs.npz,kgs2.npz,cwi6/ run2' >/dev/null; do sleep 30; done; python3 train.py kgs.npz,kgs2.npz,cwi6/ run3 --blocks 8 --ch 96 --steps 150000 --batch 256 --lr 0.05 --every 2500 --threads 4 --device cuda $BF > train3.log 2>&1" > /dev/null 2>&1 &
# run2.sh's push loop stops when run 2 ends; keep pushing while run 3 trains
nohup sh -c "sleep 60; while pgrep -f 'run2.sh' >/dev/null; do sleep 30; done; sed -i 's#while pgrep -f \"train.py kgs\"#while pgrep -f \"train.py kgs.npz\"#' run2.sh; sleep 90; ./run2.sh >> run2.log 2>&1" > /dev/null 2>&1 &
echo queued; grep "^step" train2.log | tail -1 | cut -c1-80
