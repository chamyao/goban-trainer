cd ~/goban
pkill -f run2.sh; pkill -f "prep.py cwi6"; sleep 2
echo "before:"; df -h ~ | tail -1; du -sh raw raw2 cwi cwi.tgz mix.npz cwi.npz cwi6 run1 2>/dev/null
# run 1's merged data, the run-1 CWI set and the archives are no longer needed (the SGFs for CWI stay: prep reads them)
rm -rf mix.npz cwi.npz cwi6 raw/*.tar.bz2 raw2/*.tar.bz2 cwi.tgz mix2.tmp.npz
# keep run 1's checkpoints only every 2,500 steps (all are on GitHub as needed)
for f in run1/m*.pt; do s=$(basename $f .pt); n=$((10#${s#m})); [ $((n % 2500)) -eq 0 ] || rm -f $f; done
echo "after:"; df -h ~ | tail -1
# train.py: DATA may be several sources joined with commas (shuffled together in memory, no merged copy on disk)
python3 - <<'PY'
s = open("train.py").read()
o = '    d = {f[:-4]: np.load(os.path.join(a.data, f)) for f in os.listdir(a.data) if f.endswith(".npy")} if os.path.isdir(a.data) else dict(np.load(a.data))   # (a folder of .npy: very large sets)'
if o in s:
    s = s.replace(o, '''    def src(p): return {f[:-4]: np.load(os.path.join(p, f)) for f in os.listdir(p) if f.endswith(".npy")} if os.path.isdir(p) else dict(np.load(p))
    parts = [src(p) for p in a.data.split(",")]   # (several sources: joined and shuffled in memory)
    d = parts[0] if len(parts) == 1 else {k: np.concatenate([q[k] for q in parts]) for k in parts[0]}
    if len(parts) > 1:
        pm = np.random.default_rng(11).permutation(len(d["move"])); d = {k: v[pm] for k, v in d.items()}''')
    open("train.py", "w").write(s); print("train.py: multi-source ok")
PY
BF=$(python3 -c "import torch; print('--bf16' if torch.cuda.is_bf16_supported() else '')")
sed -i 's#python3 prep.py cwi6.npz cwi 0.6#true#; s#\[ ! -f mix2.npz \]#false#; s#\[ ! -d mix2 \]#false#; s#train.py mix2.npz #train.py kgs.npz,kgs2.npz,cwi6/ #g; s#train.py mix2 #train.py kgs.npz,kgs2.npz,cwi6/ #g; s#train.py mix2"#train.py kgs"#; s#pgrep -f "train.py mix2"#pgrep -f "train.py kgs.npz"#' run2.sh
nohup sh -c 'python3 prep.py cwi6/ cwi 0.6 > cwi6.log 2>&1 && nohup ./run2.sh > run2.log 2>&1' > /dev/null 2>&1 &
sleep 2; grep -n "train.py\|pgrep" run2.sh | cut -c1-120
