"""What a go problem asks, for a board that must match its scene (Plot: "the puzzles don't always match the dialogue").

The library tags each problem with its type (qt: 死活题 life and death, 手筋题 tesuji, 对杀题 capturing race, 官子题
endgame, 吃子题 capture). kinds(p) turns that into words a story can ask for, and reads two more from the problem's
correct line, played out on a board (Black moves first, as on the site):
  - "live" or "kill" (life and death): whose stones sit nearer the edge, on average, is the group in danger, the
    other side's wall outside it (Black's: Black to live; White's: Black to kill). It agrees with 192 of the 193
    problems whose notes (Michael Redmond's) say which side dies;
  - "sacrifice": Black's first stone is captured later in the correct line;
  - "snapback": that first stone is taken at once, and Black's next move takes back two or more.
"""

TYPES = {"死活题": "ld", "Life & Death": "ld", "手筋题": "tesuji", "对杀题": "race", "官子题": "endgame", "吃子题": "capture"}


def _xy(m):
    return ord(m[0]) - 97, ord(m[1]) - 97


def _nb(x, y):
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if 0 <= x + dx < 19 and 0 <= y + dy < 19:
            yield x + dx, y + dy


def _group(bd, p):
    c, seen, st, libs = bd[p], {p}, [p], set()
    while st:
        q = st.pop()
        for n in _nb(*q):
            if n not in bd:
                libs.add(n)
            elif bd[n] == c and n not in seen:
                seen.add(n); st.append(n)
    return seen, libs


def _play(bd, p, c):
    """Put a stone down; returns the points it captured."""
    bd[p] = c
    took = set()
    for n in _nb(*p):
        if bd.get(n) and bd[n] != c:
            g, libs = _group(bd, n)
            if not libs:
                took |= g
    for q in took:
        del bd[q]
    return took


def _main_line(p):
    lines = [L for L in p.get("lines", []) if L and L[0] == 1 and len(L) > 1]
    return max(lines, key=len) if lines else None


def kinds(p):
    t = TYPES.get(p.get("qt"))
    out = {t} if t else set()
    L = _main_line(p)
    if not L:
        return out
    bd = {_xy(m): "b" for m in p["b"]}
    bd.update({_xy(m): "w" for m in p["w"]})
    first = _xy(L[1])
    if t == "ld":   # the group in danger sits nearer the edge, the attacker's wall outside it
        edge = lambda ms: sum(min(x, 18 - x) + min(y, 18 - y) for x, y in map(_xy, ms)) / len(ms)
        if p["b"] and p["w"] and edge(p["b"]) != edge(p["w"]):
            out.add("live" if edge(p["b"]) < edge(p["w"]) else "kill")
    took = []
    for i, m in enumerate(L[1:]):
        took.append(_play(bd, _xy(m), "b" if i % 2 == 0 else "w"))
    if any(first in g for g in took[1::2]):
        out.add("sacrifice")
        if len(took) > 2 and first in took[1] and len(took[2]) >= 2:
            out.add("snapback")
    return out
