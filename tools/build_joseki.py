"""The joseki explorer's tree (app.js viewJoseki, #/joseki), from the pros' own games (the user: "what if we curated based
off a few pros' games, like Wu Qingyuan"; "let's build without annotations for now"): every corner's opening sequence in
the game records on the site (data/games), one tree.

A corner's sequence: the moves played in its 10×10 quarter, in order, within the game's first 150 moves, up to 20 of
them; a move elsewhere in between, by the side whose turn it was there, is a tenuki ("tt"), and so is the corner left for
good at its end: a line ending in a tenuki is a whole joseki (the page marks where the pros mostly left). Turned to the top-left
corner, and folded on the diagonal by the first move off it, so the eight ways a corner can face are one. The side that
started the corner is shown as Black.

Positions, not move orders: one reached by different orders is one node (main()). nodes[i]: n games through it; g up
to G example games, the latest first, a game once: [pro, game file index, move number in the game]; e its moves:
{move: [next node, t (the next node's frame is this one's mirror), games, won by the side that played it, games with a
result, {pro: [games from that pro's records, games where the pro played it himself]}]}. Node 0 is the empty corner.
Handicap and setup-stone games are left out. A position seen once keeps its game, not its moves on.

    python3 tools/build_joseki.py        # -> data/joseki.json
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROS = [("go-seigen", "Go Seigen"), ("takemiya", "Takemiya"), ("dosaku", "Dosaku"), ("doteki", "Doteki"), ("huang-longshi", "Huang Longshi")]
COLS = "abcdefghijklmnopqrs"
MAXLEN, HORIZON, G = 20, 150, 6


def corner_seqs(moves):
    """[(seq of (move, game move index, game colour)), first player's colour] for each corner."""
    out = []
    for cx in (0, 1):
        for cy in (0, 1):
            seq = []
            for i, (c, x, y) in enumerate(moves[:HORIZON]):
                X, Y = (x if cx == 0 else 18 - x), (y if cy == 0 else 18 - y)
                if X <= 9 and Y <= 9:
                    seq.append((c, X, Y, i))
                    if len(seq) >= MAXLEN:
                        break
            if not seq:
                continue
            flip = next(((X < Y) for _, X, Y, _ in seq if X != Y), False)
            first, toks, prev = seq[0][0], [], None
            for c, X, Y, i in seq:
                if prev is not None and c == prev:   # the other side played elsewhere: a tenuki
                    toks.append(("tt", i, "W" if c == "B" else "B"))
                    if len(toks) >= MAXLEN:
                        break
                a, b = (Y, X) if flip else (X, Y)
                toks.append((COLS[a] + COLS[b], i, c))
                prev = c
                if len(toks) >= MAXLEN:
                    break
            # the players left the corner for good (the game went on, and not back here in its opening): a tenuki ends it,
            # so a line that ends in one is a whole joseki (the user: "consider the joseki full depth if it ends in tenuki")
            last_i = seq[-1][3]
            if len(toks) < MAXLEN and len(seq) < MAXLEN and last_i + 1 < len(moves):
                toks.append(("tt", last_i + 1, "W" if prev == "B" else "B"))
            out.append((toks[:MAXLEN], first))
    return out


def play(stones, x, y, col):
    """stones {(x, y): colour} after colour plays at x, y: what it captures taken off"""
    s = dict(stones); s[(x, y)] = col; opp = "W" if col == "B" else "B"
    def group(p):
        c, seen, st, libs = s[p], {p}, [p], False
        while st:
            a, b = st.pop()
            for q in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                if not (0 <= q[0] < 19 and 0 <= q[1] < 19):
                    continue
                if q not in s:
                    libs = True
                elif s[q] == c and q not in seen:
                    seen.add(q); st.append(q)
        return seen, libs
    for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if q in s and s[q] == opp:
            g, libs = group(q)
            if not libs:
                for r in g:
                    del s[r]
    return s


T = lambda m: m if m == "tt" else m[1] + m[0]                       # a move across the corner's diagonal
key = lambda st, tm: (tuple(sorted(st.items())), tm)
flip = lambda st: {(b, a): c for (a, b), c in st.items()}


def main():
    """A position is a node, however its moves came (the user: transpositions, "similar patterns in different corners"):
    the corner's stones and whose turn it is, in the one of its two diagonal mirror images that sorts first (its frame).
    A node's moves are in its own frame; an edge's t says the next node's frame is the mirror of this one's, so the page
    turns the board as it steps (and at a position that is its own mirror, a move and its mirror are one, the one below
    the diagonal kept)."""
    nodes, index = [], {}
    def node_for(k):
        if k not in index:
            index[k] = len(nodes); nodes.append({"n": 0, "g": [], "e": {}})
        return index[k]
    root = node_for(key({}, "B"))
    games = 0
    for pi, (d, name) in enumerate(PROS):
        meta = json.loads((ROOT / f"data/games/{d}.json").read_text())["games"]
        last = name.split()[-1]
        for fi, row in enumerate(meta):
            path = ROOT / f"data/games/{d}/{row[0]}"
            if not path.exists():
                continue
            s = path.read_text(encoding="utf-8", errors="ignore")
            if re.search(r"\bA[BW]\[", s) or re.search(r"HA\[[2-9]", s) or not re.search(r";[BW]\[", s):
                continue
            sz = re.search(r"SZ\[(\d+)", s)
            if sz and sz.group(1) != "19":
                continue
            pb = (re.search(r"PB\[([^\]]*)", s) or [None, ""])[1]
            pw = (re.search(r"PW\[([^\]]*)", s) or [None, ""])[1]
            pro_col = "B" if last in pb else "W" if last in pw else None
            res = (re.search(r"RE\[([BW])\+", s) or [None, None])[1]
            moves = [(c, COLS.index(p[0]), COLS.index(p[1])) for c, p in re.findall(r";([BW])\[([a-s]{2})\]", s)]
            games += 1
            for toks, _ in corner_seqs(moves):
                st, tm, cur, flipped = {}, "B", root, False   # flipped: the sequence's frame is the mirror of the node's
                nodes[cur]["n"] += 1
                for mv, i, col in toks:
                    m = T(mv) if flipped else mv
                    if m != "tt" and key(st, tm) == key(flip(st), tm) and COLS.index(m[0]) < COLS.index(m[1]):
                        m, flipped = T(m), not flipped     # (a position its own mirror: the move below the diagonal)
                    nst = st if m == "tt" else play(st, COLS.index(m[0]), COLS.index(m[1]), tm)
                    ntm = "W" if tm == "B" else "B"
                    t = key(flip(nst), ntm) < key(nst, ntm)
                    if t:
                        nst, flipped = flip(nst), not flipped
                    nxt = node_for(key(nst, ntm))
                    e = nodes[cur]["e"].setdefault(m, [nxt, int(t), 0, 0, 0, {}])
                    e[2] += 1
                    if res:
                        e[4] += 1; e[3] += res == col
                    pp = e[5].setdefault(str(pi), [0, 0]); pp[0] += 1; pp[1] += pro_col == col
                    nodes[nxt]["n"] += 1
                    nodes[nxt]["g"].append([pi, fi, i, row[1] or ""])
                    st, tm, cur = nst, ntm, nxt
    # a position seen once keeps its game but not its moves on; examples: the latest G, a game once
    for nd in nodes:
        if nd["n"] < 2:
            nd["e"] = {}
        seen, g = set(), []
        for x in sorted(nd["g"], key=lambda x: x[3], reverse=True):
            if (x[0], x[1]) not in seen:
                seen.add((x[0], x[1])); g.append(x[:3])
            if len(g) >= G:
                break
        nd["g"] = g
    keep, order, st = {root}, [root], [root]
    while st:
        u = st.pop()
        for e in nodes[u]["e"].values():
            if e[0] not in keep:
                keep.add(e[0]); order.append(e[0]); st.append(e[0])
    new = {u: j for j, u in enumerate(order)}
    out_nodes = []
    for u in order:
        nd = nodes[u]
        o = {"n": nd["n"], "g": nd["g"]}
        if nd["e"]:
            o["e"] = {m: [new[e[0]], e[1], e[2], e[3], e[4], e[5]] for m, e in nd["e"].items()}
        out_nodes.append(o)
    out = {"v": 2, "pros": [[d, name] for d, name in PROS], "games": games, "nodes": out_nodes}
    (ROOT / "data/joseki.json").write_text(json.dumps(out, separators=(",", ":")))
    print(f"{games} games, {nodes[root]['n']} corners, {len(out_nodes)} positions, {(ROOT / 'data/joseki.json').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
