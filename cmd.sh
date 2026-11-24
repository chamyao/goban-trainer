# KataGo's libraries in its own folder (cuDNN 8, libzip5, OpenSSL 1.1); PyTorch's cuDNN 9 back
cd ~/goban/kgo
python3 -m pip install -q "nvidia-cudnn-cu12==9.1.0.70" 2>&1 | grep -v WARNING | tail -1
python3 -m pip install -q --target libs "nvidia-cudnn-cu12==8.9.7.29" nvidia-cublas-cu12 nvidia-cuda-runtime-cu12 2>&1 | grep -v WARNING | tail -1
mkdir -p debs sys && cd debs
for u in http://archive.ubuntu.com/ubuntu/pool/universe/libz/libzip/libzip5_1.5.1-0ubuntu1_amd64.deb http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb; do curl -sSfL -O "$u" || echo "fail $u"; done
for d in *.deb; do dpkg -x "$d" ../sys; done; cd ..
LD="$(ls -d $PWD/libs/nvidia/*/lib | tr '\n' ':')$PWD/sys/usr/lib/x86_64-linux-gnu:$PWD/sys/lib/x86_64-linux-gnu"
echo "$LD" > ld.txt
export LD_LIBRARY_PATH=$LD
ldd ./katago | grep -i "not found"
./katago version 2>&1 | head -2
time (echo '{"id":"t","moves":[["B","Q16"],["W","D4"]],"rules":"chinese","komi":7.5,"boardXSize":19,"boardYSize":19,"maxVisits":1,"includeOwnership":true}' | timeout 600 ./katago analysis -config analysis_example.cfg -model b18.bin.gz -override-config "logDir=,logToStderr=false" 2>&1 | tail -1 | cut -c1-200)
python3 -c "import torch; x=torch.randn(8,17,19,19,device='cuda'); c=torch.nn.Conv2d(17,64,3,padding=1).cuda(); print('torch conv ok', c(x).shape)"
