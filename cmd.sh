# first command on a new box: a hello
cd ~/goban; hostname; nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv; python3 -c "import torch; print(torch.__version__, torch.cuda.is_available())"; df -h ~ | tail -1; ls
