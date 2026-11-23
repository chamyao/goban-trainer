# install the CUDA 12.8 PyTorch build (the RTX 5070 Ti needs it), check it on the GPU, restart the run
cd ~/goban
pkill -f "goban/run.sh|./run.sh" ; pkill -f "pip install" ; sleep 3
python3 -m pip install -q --force-reinstall torch --index-url https://download.pytorch.org/whl/cu128 2>&1 | grep -v "root user" | tail -3
python3 -m pip install -q numpy 2>&1 | tail -1
python3 - <<'PY'
import torch, time
print("torch", torch.__version__, "cuda", torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "")
x = torch.randn(4096, 4096, device="cuda"); torch.cuda.synchronize(); t = time.time()
for _ in range(20): y = x @ x
torch.cuda.synchronize(); print(f"matmul ok: {20*2*4096**3/(time.time()-t)/1e12:.1f} TFLOP/s fp32")
print("bf16", torch.cuda.is_bf16_supported())
PY
nohup ./run.sh > run.log 2>&1 &
sleep 20; tail -n 5 run.log
