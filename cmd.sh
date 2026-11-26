# the starting point (run 3, before distillation) on the student's held-out labels
cd ~/goban && python3 - <<'PY'
import numpy as np, torch, distillpol, train
d = distillpol.load("plabels"); n = len(d["move"]); nval = min(20000, n // 20); va = np.arange(nval)
ck = torch.load("base/run3.pt", map_location="cpu", weights_only=False); net = train.Net(ck["cfg"]["blocks"], ck["cfg"]["ch"]); net.load_state_dict(ck["model"]); net = net.cuda().eval()
agree = pro = soft = 0
with torch.no_grad():
    for i in range(0, nval, 1000):
        x, pol, wr, mv = [t.cuda() for t in distillpol.batch(d, va[i:i + 1000], np.random.default_rng(1))]
        p, _ = net(x); lp = torch.log_softmax(p.float(), 1)
        soft += float(-(pol * lp).sum(1).sum()); agree += float((p.argmax(1) == pol.argmax(1)).sum()); pro += float((p.argmax(1) == mv).sum())
print(f"run 3 before distillation, {nval} held-out positions: agrees with teacher {100*agree/nval:.1f}%, pro's move {100*pro/nval:.1f}%, soft-CE {soft/nval:.3f}")
PY
grep VAL ps/student.log | tail -2 | cut -c1-260
