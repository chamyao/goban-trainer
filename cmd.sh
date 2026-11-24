# KataGo (CUDA) and the teacher network on the box
cd ~/goban; nproc; free -g | head -2; df -h ~ | tail -1; nvidia-smi --query-gpu=name,driver_version --format=csv,noheader
cp code/tools/ownnet/*.py . 2>/dev/null; (cd code && git pull -q) && cp code/tools/ownnet/*.py .
command -v unzip >/dev/null || { apt-get update -qq && apt-get install -y -qq unzip libzip4 > /dev/null 2>&1 || apt-get install -y -qq unzip > /dev/null; }
python3 -m pip install -q "nvidia-cudnn-cu12==8.9.7.29" nvidia-cublas-cu12 nvidia-cuda-runtime-cu12 2>&1 | tail -2
mkdir -p kgo && cd kgo
[ -f katago ] || { curl -sSfL -o k.zip https://github.com/lightvector/KataGo/releases/download/v1.15.3/katago-v1.15.3-cuda12.1-cudnn8.9.7-linux-x64.zip && unzip -o -q k.zip && ls; }
[ -f b18.bin.gz ] || curl -sSfL -o b18.bin.gz https://media.katagotraining.org/uploaded/networks/models/kata1/kata1-b18c384nbt-s9996604416-d4316597426.bin.gz
SP=$(python3 -c "import site; print(site.getsitepackages()[0])")
export LD_LIBRARY_PATH=$(ls -d $SP/nvidia/*/lib | tr '\n' ':')$LD_LIBRARY_PATH
echo "$LD_LIBRARY_PATH" > ld.txt
ldd ./katago | grep -i "not found"
./katago version 2>&1 | head -3
echo '{"id":"t","moves":[["B","Q16"],["W","D4"]],"rules":"chinese","komi":7.5,"boardXSize":19,"boardYSize":19,"maxVisits":1,"includeOwnership":true}' | timeout 300 ./katago analysis -config analysis_example.cfg -model b18.bin.gz -override-config "logDir=,logToStderr=false" 2>&1 | tail -2 | cut -c1-300
