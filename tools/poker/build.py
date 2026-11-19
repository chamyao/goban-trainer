"""Turn the solves (out/<id>.json, from run.py) into puzzles: data/poker.json for poker.js.

At each decision the solver reached, a few hands are chosen whose answer is clear (one action at least 70% of the
time), one per action where possible, so the puzzles don't all have the same answer. Each puzzle: the board, the hand,
the action so far as text, the pot and stacks in big blinds, and for every action the solver's frequency with that hand
and its EV (bb). Usage: python3 build.py"""
import json, os, random

here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(here, "spots.json")))
SUIT = {"s": "♠", "h": "♥", "d": "♦", "c": "♣"}
RANKS = "23456789TJQKA"
STREET = ["flop", "turn", "river"]
PER_NODE = 2          # puzzles per decision
CLEAR = 0.7           # the answer's frequency, at least
GAP = 0.3             # bb: how far the next-best action must trail (or 3% of the pot, if more)
random.seed(7)


def bb(ch): return round(ch / 10, 1)
def fmt(x): return ("%.1f" % x).rstrip("0").rstrip(".")
def pretty(c): return (("10" if c[0] == "T" else c[0]) + SUIT[c[1]])


def replay(spot, kind, walked):
    """Walk the line: the history as text, the pot and each player's chips in front, at the end."""
    names = [kind["oop_name"], kind["ip_name"]]
    pot, stack = kind["pot"], kind["stack"]
    left = [stack, stack]
    street, actor, front = 0, 0, [0, 0]
    board = [spot["flop"][i:i + 2] for i in (0, 2, 4)]
    lines, cur = [kind["pre"]], []
    head = lambda: f"{STREET[street].capitalize()} {' '.join(pretty(c) for c in board)}:"
    for w in walked:
        if len(w) == 2 and w[0] in RANKS and w[1] in SUIT:   # a card: the next street
            lines.append(head() + " " + ", ".join(cur) + ".")
            pot += front[0] + front[1]; front = [0, 0]; cur = []
            street += 1; board.append(w); actor = 0
            continue
        a, *amt = w.split()
        who = names[actor]
        if a == "check": cur.append(f"{who} checks")
        elif a == "call":
            pay = front[1 - actor] - front[actor]; front[actor] += pay; left[actor] -= pay
            cur.append(f"{who} calls")
        elif a in ("bet", "raise", "allin"):
            to = int(amt[0]); pay = to - front[actor]; front[actor] = to; left[actor] -= pay
            size = to if a == "bet" else to
            if a == "bet": cur.append(f"{who} bets {fmt(bb(to))} bb")
            elif a == "raise": cur.append(f"{who} raises to {fmt(bb(to))} bb")
            else: cur.append(f"{who} goes all-in for {fmt(bb(to))} bb")
        elif a == "fold": cur.append(f"{who} folds")
        actor = 1 - actor
    lines.append(head() + " " + ", ".join(cur) + "." if cur else head()[:-1] + ".")   # (a street just dealt: nothing yet)
    return lines, pot, front, left, board


def label(a, pot_now, front, me):
    k, *amt = a.split()
    if k == "check": return "Check"
    if k == "fold": return "Fold"
    if k == "call": return f"Call {fmt(bb(front[1 - me] - front[me]))} bb"
    to = int(amt[0])
    if k == "bet": return f"Bet {fmt(bb(to))} bb ({round(100 * to / pot_now)}%)"
    if k == "raise": return f"Raise to {fmt(bb(to))} bb"
    return f"All-in {fmt(bb(to))} bb"


def main():
    puzzles = []
    for sp in S["spots"]:
        path = os.path.join(here, "out", sp["id"] + ".json")
        if not os.path.exists(path): print("no solve yet:", sp["id"]); continue
        kind = S[sp["kind"]]
        res = json.load(open(path))
        for ni, node in enumerate(res["nodes"]):
            if "error" in node: continue
            me = node["player"]
            hist, pot0, front, left, board = replay(sp, kind, node["walked"])
            pot_now = pot0 + front[0] + front[1]
            acts = node["actions"]
            # clear hands, grouped by their answer; one or two answers' worth, spread out
            by = {}
            wmax = max([hd["w"] for hd in node["hands"]] or [0])
            for hd in node["hands"]:
                if hd["w"] < 0.2 * wmax: continue                # hands that rarely get here (or are mostly blocked) left out
                top = max(range(len(acts)), key=lambda i: hd["f"][i])
                if hd["f"][top] < CLEAR: continue
                # a wrong choice has to cost something: the best other action at least GAP behind (else any answer is fine)
                gap = hd["ev"][top] - max(hd["ev"][i] for i in range(len(acts)) if i != top)
                if gap < max(GAP * 10, 0.03 * pot_now): continue
                by.setdefault(top, []).append(hd)
            picks = []
            for top in sorted(by, key=lambda t: -node["mix"][t]):
                if len(picks) >= PER_NODE: break
                picks.append(random.choice(by[top]))
            for hd in picks:
                street = STREET[len(board) - 3]
                facing = front[1 - me] - front[me]
                puzzles.append({
                    "id": f"{sp['id']}-{ni}-{hd['h']}",
                    "street": street,
                    "hero": kind["oop_name"] if me == 0 else kind["ip_name"],
                    "villain": kind["ip_name"] if me == 0 else kind["oop_name"],
                    "board": board, "hand": hd["h"],
                    "pot": bb(pot_now), "heroStack": bb(left[me]), "villainStack": bb(left[1 - me]),
                    "facing": bb(facing), "facingLabel": f"bets {fmt(bb(front[1 - me]))} bb" if facing and front[me] == 0 else (f"raises to {fmt(bb(front[1 - me]))} bb" if facing else ""),
                    "history": hist,
                    "actions": [{"label": label(a, pot_now, front, me), "f": hd["f"][i], "ev": bb(hd["ev"][i])} for i, a in enumerate(acts)],
                    "mix": node["mix"],
                    "equity": hd["eq"],
                })
    # flop first, then turn, then river; within a street, the spots interleaved
    order = {"flop": 0, "turn": 1, "river": 2}
    puzzles.sort(key=lambda p: (order[p["street"]], p["id"]))
    out = os.path.join(here, "..", "..", "data", "poker.json")
    json.dump({"v": 1, "about": "Heads-up 100bb; answers from postflop-solver (tools/poker). Sizes: flop BTN 33%/75%, BB lead 50%; turn and river 75%; raises 3x; all-in.", "puzzles": puzzles}, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
    from collections import Counter
    print(len(puzzles), "puzzles", dict(Counter(p["street"] for p in puzzles)), "answers", dict(Counter(max(p["actions"], key=lambda a: a["f"])["label"].split()[0] for p in puzzles)))


if __name__ == "__main__":
    main()
