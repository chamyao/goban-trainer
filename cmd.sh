cd ~/goban; BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
nohup python3 train.py kgs.npz,kgs2.npz,cwi6/ run3 --blocks 8 --ch 96 --steps 150000 --batch 256 --lr 0.05 --every 2500 --threads 4 --device cuda $BF > train3.log 2>&1 &
sleep 150; tail -n 3 train3.log | cut -c1-120; free -g | head -2; nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv,noheader
