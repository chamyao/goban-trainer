# status check from the goban-trainer session
nvidia-smi --query-gpu=name,driver_version,memory.used,memory.total,utilization.gpu --format=csv
echo; echo "== processes"; pgrep -af "run.sh|train.py|prep.py|merge.py|control.sh" | cut -c1-150
echo; echo "== run.log"; tail -n 25 ~/goban/run.log
echo; echo "== train.log"; grep -E "^step|VAL" ~/goban/train.log 2>/dev/null | tail -3 | cut -c1-120
python3 -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available())"
nproc; free -g | head -2; df -h ~ | tail -1
