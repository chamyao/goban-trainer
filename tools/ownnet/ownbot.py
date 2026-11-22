"""Play with our own trained network (../kgs/train.py checkpoints): one policy evaluation per move, the most likely
legal move (or a sample at temperature T), the network's own pass."""
import sys, os
import numpy as np, torch
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import train, prep
COLS = "ABCDEFGHJKLMNOPQRST"

def to_idx(s):   # GTP vertex -> 0..360 / 361 pass
    s = s.strip().upper()
    if s in ("PASS", "RESIGN"): return 361
    return (19 - int(s[1:])) * 19 + COLS.index(s[0])
def to_gtp(i): return "pass" if i == 361 else f"{COLS[i % 19]}{19 - i // 19}"

class OwnBot:
    def __init__(self, path, temp=0.0):
        ck = torch.load(path, map_location="cpu")
        self.net = train.Net(ck["cfg"]["blocks"], ck["cfg"]["ch"]); self.net.load_state_dict(ck["model"]); self.net.eval()
        self.temp = temp
        torch.set_num_threads(1)
    def policy(self, setup, moves, komi):
        """setup: [(col, idx)] handicap stones; moves: [(col, idx)] played. -> (policy[362], value, board, ko)"""
        b = [0] * 361
        for c, i in setup: b[i] = c
        ko = -1
        for c, i in moves:
            ko = -1 if i == 361 else prep.play(b, i, c)
        tomove = -moves[-1][0] if moves else (-1 if setup else 1)
        last = ([i for _, i in moves[::-1]] + [-1] * 4)[:4]
        x = train.planes(prep.libboard(b)[None], np.array([ko]), np.array([last]), np.array([1 if tomove == 1 else 0], np.int8), np.array([komi], np.float32))
        with torch.no_grad():
            p, v = self.net(torch.from_numpy(x))
        return torch.softmax(p[0], 0).numpy(), float(v[0]), b, ko, tomove
    def genmove(self, setup, moves, komi):
        pol, v, b, ko, col = self.policy(setup, moves, komi)
        legal = np.zeros(362, bool); legal[361] = True
        for i in range(361):
            if b[i] == 0 and i != ko:
                bb = b[:]
                try: prep.play(bb, i, col); legal[i] = True
                except ValueError: pass
        p = np.where(legal, pol, 0)
        if self.temp > 0:
            q = p ** (1 / self.temp); q /= q.sum(); return int(np.random.choice(362, p=q))
        return int(p.argmax())
