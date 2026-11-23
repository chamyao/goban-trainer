cd ~/goban; ls -la *.npz; python3 -c "
import numpy as np
for f in ('kgs.npz','kgs2.npz','cwi6.npz','cwi.npz','mix.npz'):
    try: d=np.load(f); print(f, d.files[:9], len(d[d.files[0]]))
    except Exception as e: print(f, 'ERR', e)
"
