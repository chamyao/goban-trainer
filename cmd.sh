# labelling progress after a few minutes
cd ~/goban; sleep 240; tail -3 label.log; nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv,noheader; uptime
