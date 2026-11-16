#!/usr/bin/env python3
"""Precompute the poker trainer's spots: python3 poker/solver/build.py [--quick] [--only SPOT] [--jobs N]

For every spot (two 6-max positions that saw a flop) and every flop listed below, this writes a solver config,
runs ./solver (built from solver.c), and gzips its output to poker/data/<spot>-<flop>.bin.gz; then it writes
poker/data/manifest.json, which app.js reads.

The ranges are hand-written approximations of 100bb 6-max GTO opening, flatting and 3-betting ranges
(a weight after ':' is the fraction of the combos that take the line).
"""
import argparse, gzip, json, os, random, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
RANKS = "23456789TJQKA"
SUITS = "cdhs"


def card(s):
    return RANKS.index(s[0]) * 4 + SUITS.index(s[1])


def cname(c):
    return RANKS[c >> 2] + SUITS[c & 3]


def expand(token):
    """'AKs', 'T9o', '77', 'A2s+', '22+', 'KTs-K6s', 'AJo+' -> list of (r1, r2, kind) with r1 >= r2."""
    def one(t):
        if len(t) == 2:
            return (RANKS.index(t[0]), RANKS.index(t[1]), "p")
        return (RANKS.index(t[0]), RANKS.index(t[1]), t[2])
    if "-" in token:
        a, b = token.split("-")
        a, b = one(a), one(b)
        if a[2] == "p":
            lo, hi = sorted((a[0], b[0]))
            return [(r, r, "p") for r in range(lo, hi + 1)]
        lo, hi = sorted((a[1], b[1]))
        return [(a[0], r, a[2]) for r in range(lo, hi + 1)]
    if token.endswith("+"):
        a = one(token[:-1])
        if a[2] == "p":
            return [(r, r, "p") for r in range(a[0], 13)]
        return [(a[0], r, a[2]) for r in range(a[1], a[0])]
    return [one(token)]


def combos(r1, r2, kind):
    out = []
    for s1 in range(4):
        for s2 in range(4):
            if kind == "p" and s2 <= s1:
                continue
            if kind == "s" and s1 != s2:
                continue
            if kind == "o" and s1 == s2:
                continue
            out.append((r1 * 4 + s1, r2 * 4 + s2))
    return out


def parse_range(text):
    w = {}
    for tok in text.replace("\n", " ").split(","):
        tok = tok.strip()
        if not tok:
            continue
        weight = 1.0
        if ":" in tok:
            tok, ws = tok.split(":")
            weight = float(ws)
        for r1, r2, kind in expand(tok):
            for c in combos(r1, r2, kind):
                w[c] = weight  # later entries override earlier ones
    return w


RANGES = {
    # openers
    "UTG_open": "22+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s:0.5, 76s:0.5, 65s:0.5, ATo+, KJo+, QJo:0.5",
    "CO_open": "22+, A2s+, K5s+, Q8s+, J8s+, T7s+, 97s+, 86s+, 75s+, 64s+, 54s, A7o+, A5o, K9o+, Q9o+, J9o+, T9o",
    "BTN_open": "22+, A2s+, K2s+, Q4s+, J6s+, T6s+, 96s+, 85s+, 74s+, 63s+, 53s+, 43s, A2o+, K8o+, Q9o+, J8o+, "
                "T8o+, 97o+, 87o, 76o:0.5",
    # big blind flats (the 3-bet part removed or thinned)
    "BB_call_UTG": "22-JJ, QQ:0.4, AQs-A2s, AKs:0.3, KQs-K6s, QJs-Q8s, JTs-J8s, T9s-T8s, 98s-97s, 87s-86s, 76s-75s, "
                   "65s-64s, 54s, AQo-ATo, AKo:0.4, KQo-KJo, QJo, KTo:0.5",
    "BB_call_CO": "22-TT, JJ:0.5, AQs-A2s, KQs-K3s, QJs-Q6s, JTs-J7s, T9s-T7s, 98s-96s, 87s-85s, 76s-74s, 65s-64s, "
                  "54s-53s, 43s, AQo-A8o, A5o, KQo-KTo, QJo-QTo, JTo, T9o:0.5",
    "BB_call_BTN": "22-99, TT:0.5, AJs-A2s, AQs:0.3, KQs-K2s, QJs-Q2s, JTs-J4s, T9s-T6s, 98s-95s, 87s-85s, 76s-74s, "
                   "65s-63s, 54s-52s, 43s-42s, 32s, AJo-A2o, AQo:0.5, KQo-K5o, QJo-Q8o, JTo-J8o, T9o-T8o, 98o, 87o, "
                   "76o, 65o:0.5",
    # button flats a cutoff open
    "BTN_call_CO": "22-TT, JJ:0.3, AQs-A9s, A5s-A4s, KQs-K9s, QJs-Q9s, JTs-J9s, T9s-T8s, 98s, 87s, 76s, 65s, "
                   "AQo-AJo, AKo:0.3, KQo, KJo:0.5",
    # 3-bet pots
    "BB_3bet_BTN": "TT+, 99:0.5, AJs+, ATs:0.5, A5s-A2s, KQs, KJs, KTs:0.5, QJs:0.5, JTs:0.5, 76s:0.3, 65s:0.3, "
                   "AQo+, AJo:0.5, KQo:0.4",
    "BTN_call_BB3bet": "22-JJ, QQ:0.4, ATs-A6s, AJs:0.7, A5s-A2s:0.5, KTs+, QTs+, J9s+, T8s+, 97s+, 87s, 76s, 65s, "
                       "AQo-ATo, KQo, KJo:0.5, AKs:0.3, AKo:0.3",
    "BTN_3bet_CO": "TT+, 99:0.5, ATs+, A5s-A4s, KQs, KJs:0.6, QJs:0.5, JTs:0.4, AQo+, AJo:0.4, KQo:0.4",
    "CO_call_BTN3bet": "22-JJ, QQ:0.5, AJs-A8s, A5s:0.5, KTs+, QTs+, JTs, T9s, 98s, 87s:0.5, AQo-AJo, KQo:0.6, "
                       "AKs:0.3, AKo:0.4",
}

# OOP first. pot/stack in big blinds at the flop (stacks 100bb, open 2.5, 3-bets to 11 out of position, 8.5 in position).
SPOTS = {
    "btn-bb":  dict(title="BTN open, BB call", kind="Single-raised pot", pos=["BB", "BTN"], ranges=["BB_call_BTN", "BTN_open"], pot=5.5, stack=97.5),
    "co-bb":   dict(title="CO open, BB call", kind="Single-raised pot", pos=["BB", "CO"], ranges=["BB_call_CO", "CO_open"], pot=5.5, stack=97.5),
    "utg-bb":  dict(title="UTG open, BB call", kind="Single-raised pot", pos=["BB", "UTG"], ranges=["BB_call_UTG", "UTG_open"], pot=5.5, stack=97.5),
    "co-btn":  dict(title="CO open, BTN call", kind="Single-raised pot", pos=["CO", "BTN"], ranges=["CO_open", "BTN_call_CO"], pot=6.5, stack=97.5),
    "bb3-btn": dict(title="BTN open, BB 3-bet, BTN call", kind="3-bet pot", pos=["BB", "BTN"], ranges=["BB_3bet_BTN", "BTN_call_BB3bet"], pot=22.5, stack=89),
    "btn3-co": dict(title="CO open, BTN 3-bet, CO call", kind="3-bet pot", pos=["CO", "BTN"], ranges=["CO_call_BTN3bet", "BTN_3bet_CO"], pot=18.5, stack=91.5),
}

FLOPS = {
    "btn-bb":  ["Ks7d2c", "8h7h4c", "QsJd9s", "Ad5c5h", "6s4d3c"],
    "co-bb":   ["Ah9d4c", "Jc8c3h", "Td9s7d", "Kh6s6c"],
    "utg-bb":  ["As8d3c", "7c6d5s", "KdQh4h", "9s9c2d"],
    "co-btn":  ["Kc9h3d", "Tc6c2s", "Qd7h5h", "8s7s6d"],
    "bb3-btn": ["Ac7s3d", "Th9h4c", "Kd8c2s", "6c5d2h"],
    "btn3-co": ["Qh8c3s", "Js7d7h", "9d8d5c", "Ah Kd 6c".replace(" ", "")],
}

SIZES = {
    "srp": {0: [0.33, 0.75], 1: [0.66], 2: [0.5, 1.0]},
    "3bp": {0: [0.25, 0.6], 1: [0.66], 2: [0.5, 1.0]},
}


def build_one(spot_id, flop, args):
    spot = SPOTS[spot_id]
    rng = random.Random(f"{spot_id}-{flop}")
    fl = [card(flop[i:i + 2]) for i in (0, 2, 4)]
    deck = [c for c in range(52) if c not in fl]
    turns = rng.sample(deck, args.T)
    rivers = [rng.sample([c for c in deck if c != t], args.R) for t in turns]
    lines = [f"pot {spot['pot']}", f"stack {spot['stack']}", "flop " + " ".join(map(str, fl)), f"turns {args.T} {args.R}"]
    for t, rs in zip(turns, rivers):
        lines.append(f"{t} " + " ".join(map(str, rs)))
    sz = SIZES["3bp" if spot["kind"].startswith("3") else "srp"]
    for s, fr in sz.items():
        lines.append(f"sizes {s} {len(fr)} " + " ".join(map(str, fr)))
    exports = []
    for p in range(2):
        w = parse_range(RANGES[spot["ranges"][p]])
        cs = [(c, wt) for c, wt in sorted(w.items()) if wt > 0 and c[0] not in fl and c[1] not in fl]
        lines.append(f"range {p} {len(cs)}")
        lines += [f"{a} {b} {wt}" for (a, b), wt in cs]
        # exported combos: weighted sample without replacement, so the villain's hand follows the range
        pool = list(range(len(cs)))
        chosen = []
        while pool and len(chosen) < args.K:
            tot = sum(cs[i][1] for i in pool)
            x = rng.random() * tot
            for j, i in enumerate(pool):
                x -= cs[i][1]
                if x <= 0:
                    break
            chosen.append(pool.pop(j))
        chosen.sort()
        lines.append(f"export {p} {len(chosen)} " + " ".join(map(str, chosen)))
        exports.append(len(cs))
    out = os.path.join(args.tmp, f"{spot_id}-{flop}.bin")
    lines += [f"iters {args.iters}", f"target {args.target}", f"threads {args.threads}", f"out {out}"]
    cfg = os.path.join(args.tmp, f"{spot_id}-{flop}.txt")
    with open(cfg, "w") as f:
        f.write("\n".join(lines) + "\n")
    t0 = time.time()
    log = subprocess.run([os.path.join(HERE, "solver"), cfg], capture_output=True, text=True)
    if log.returncode:
        sys.exit(log.stderr)
    last = [l for l in log.stderr.splitlines() if l.startswith("iter")][-1]
    print(f"{spot_id} {flop}: {log.stderr.splitlines()[0]} | {last} | {time.time() - t0:.0f}s", flush=True)
    with open(out, "rb") as f:
        raw = f.read()
    name = f"{spot_id}-{flop}.bin.gz"
    with gzip.open(os.path.join(DATA, name), "wb", compresslevel=9) as f:
        f.write(raw)
    expl = float(last.split("exploitability ")[1].split("%")[0])
    return dict(file=name, flop=flop, exploitability=expl)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true", help="few iterations, for testing")
    ap.add_argument("--only", help="comma-separated spot ids")
    ap.add_argument("--flops", type=int, default=99, help="at most this many flops per spot")
    ap.add_argument("--T", type=int, default=6, help="sampled turn cards")
    ap.add_argument("--R", type=int, default=4, help="sampled river cards per turn")
    ap.add_argument("--K", type=int, default=14, help="exported combos per player")
    ap.add_argument("--iters", type=int, default=500)
    ap.add_argument("--target", type=float, default=0.003, help="stop at this exploitability (fraction of pot)")
    ap.add_argument("--threads", type=int, default=os.cpu_count())
    ap.add_argument("--tmp", default=os.path.join(HERE, "tmp"))
    args = ap.parse_args()
    if args.quick:
        args.iters, args.target = 50, 0.05
    os.makedirs(args.tmp, exist_ok=True)
    os.makedirs(DATA, exist_ok=True)
    subprocess.run(["gcc", "-O3", "-march=native", "-fopenmp", "-Wno-unused-result", "-o", os.path.join(HERE, "solver"),
                    os.path.join(HERE, "solver.c"), "-lm"], check=True)
    man_path = os.path.join(DATA, "manifest.json")
    manifest = {"spots": []}
    if os.path.exists(man_path):
        manifest = json.load(open(man_path))
    old = {s["id"]: s for s in manifest["spots"]}
    only = args.only.split(",") if args.only else list(SPOTS)
    for sid in SPOTS:
        if sid not in only:
            continue
        sp = SPOTS[sid]
        boards = [build_one(sid, fl, args) for fl in FLOPS[sid][:args.flops]]
        old[sid] = dict(id=sid, title=sp["title"], kind=sp["kind"], pos=sp["pos"], pot=sp["pot"], stack=sp["stack"], boards=boards)
        manifest["spots"] = [old[k] for k in SPOTS if k in old]
        with open(man_path, "w") as f:
            json.dump(manifest, f, indent=1)


if __name__ == "__main__":
    main()
