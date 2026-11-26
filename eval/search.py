"""A weak network that reads (the user: "a weaker engine with higher visits to model calculating players"): PUCT
search over our network's policy, judging positions with its value head (distill.py's, learnt from KataGo's judgement).
Matches: search player vs a plain player (selfplay.py's: its favourite move), scored as selfplay.py scores.

    python3 search.py A.pt VISITS_A B.pt VISITS_B GAMES OUT.jsonl     (VISITS 0: the plain favourite move)
"""
import json, math, sys, os
import numpy as np, torch
import selfplay as sp, distill, train, prep
torch.set_num_threads(1)
N = 361

NETS = {}
def net(path):
    if path not in NETS:
        ck = torch.load(path, map_location="cpu", weights_only=False); heads = ck["cfg"].get("heads")
        n = (distill.DNet if heads else train.Net)(ck["cfg"]["blocks"], ck["cfg"]["ch"]); n.load_state_dict(ck["model"], strict=False); n.eval()
        NETS[path] = n
    return NETS[path]

def evaluate(n, b, col, ko, hist):
    last = (hist[::-1] + [-1] * 4)[:4]
    x = train.planes(prep.libboard(b)[None], np.array([ko]), np.array([last]), np.array([1 if col == 1 else 0], np.int8), np.array([sp.KOMI], np.float32))
    with torch.no_grad(): p, v = n(torch.from_numpy(x))
    return torch.softmax(p[0], 0).numpy(), float(v[0])

class Node:
    __slots__ = ("P", "kids", "N", "W", "moves")
    def __init__(s, pri, moves): s.P, s.moves, s.kids, s.N, s.W = pri, moves, {}, np.zeros(len(moves)), np.zeros(len(moves))

def expand(n, b, col, ko, hist):
    pol, v = evaluate(n, b, col, ko, hist)
    lg = sp.legal_moves(b, col, ko)
    if not lg: return None, v
    pri = pol[lg]; pri = pri / pri.sum() if pri.sum() > 0 else np.full(len(lg), 1 / len(lg))
    return Node(pri, lg), v

def search(n, b, col, ko, hist, visits, c=1.5):
    root, _ = expand(n, b, col, ko, hist)
    if root is None: return N
    for _ in range(visits):
        node, bb, cc, kk, hh, path = root, b[:], col, ko, hist[:], []
        while True:
            tot = node.N.sum()
            q = np.where(node.N > 0, node.W / np.maximum(node.N, 1), (node.W.sum() / max(tot, 1)) - 0.2 if tot else 0)
            u = c * node.P * math.sqrt(tot + 1) / (1 + node.N)
            i = int(np.argmax(q + u)); mv = node.moves[i]
            path.append((node, i))
            kk = prep.play(bb, mv, cc); hh.append(mv); cc = -cc
            if i in node.kids: node = node.kids[i]; continue
            child, v = expand(n, bb, cc, kk, hh)
            if child is not None: node.kids[i] = child
            break
        # v: for the side to move at the leaf (cc); back up as each mover's own
        for node_, i_ in reversed(path):
            v = -v; node_.N[i_] += 1; node_.W[i_] += v
    return root.moves[int(np.argmax(root.N))]

def move(n, visits, b, col, ko, hist, t, rng):
    pol, _ = evaluate(n, b, col, ko, hist)
    lg = sp.legal_moves(b, col, ko)
    p = np.zeros(N + 1); p[lg] = pol[lg]; p[N] = pol[N]
    if t < sp.OPEN: p[N] = 0; return int(rng.choice(N + 1, p=p / p.sum()))
    if p[N] >= p[:N].max() or not lg: return N   # (its own pass, as the plain player does)
    return int(p.argmax()) if visits == 0 else search(n, b, col, ko, hist, visits)

def game(A, va, B, vb, a_black, rng):
    b, ko, hist, moves, passes = [0] * N, -1, [], [], 0
    for t in range(400):
        col = 1 if t % 2 == 0 else -1
        mine = (col == 1) == a_black
        m = move(net(A if mine else B), va if mine else vb, b, col, ko, hist, t, rng)
        if m == N: passes += 1; ko = -1
        else: passes = 0; ko = prep.play(b, m, col)
        hist.append(m); moves.append(["B" if col == 1 else "W", sp.gtp(m)])
        if passes >= 2: break
    return moves

if __name__ == "__main__":
    A, va, B, vb, k, out = sys.argv[1], int(sys.argv[2]), sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
    sc, rng = sp.Scorer(), np.random.default_rng(int(os.environ.get("SEED", 7)))
    done = sum(1 for l in open(out) if json.loads(l)["a"] == f"{A}@{va}" and json.loads(l)["b"] == f"{B}@{vb}") if os.path.exists(out) else 0
    w = 0
    for g in range(done, k):
        a_black = g % 2 == 0
        mv = game(A, va, B, vb, a_black, rng); lead = sc.black_area_lead(mv); a_won = (lead > 0) == a_black; w += a_won
        open(out, "a").write(json.dumps({"a": f"{A}@{va}", "b": f"{B}@{vb}", "a_black": a_black, "a_won": a_won, "lead_black": round(lead, 1), "moves": len(mv)}) + "\n")
        print(f"game {g}: {'won' if a_won else 'lost'} ({len(mv)} moves, B{lead:+.1f})", flush=True)
