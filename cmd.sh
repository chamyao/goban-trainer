cd ~/goban; tail -n 3 train3.log | cut -c1-110; tail -n 2 push3.log; pgrep -af "train.py" | cut -c1-90; nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv,noheader
