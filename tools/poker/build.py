"""Turn the solves (out/<id>.json, from run.py) into hands for poker.js: data/poker.json.

A hand follows one line through the flop, turn and river (the user: "I wanted it to go to turn and river"): at each
of the hero's decisions on that line, the solver's answer for this exact hand (each action's frequency and EV), the
action the line takes (it goes on that way whatever was chosen), and at the end a decision that's the hand's last.
A hand is used only if the hero takes the line's action at least 60% of the time at each step (so the line is one this
hand really plays), and its last decision is clear (one action >= 70%) with a wrong choice costing something. A step
where the hero checks almost always (>= 90%) is played for them ("auto"), not asked.

Each hand gets a difficulty rating (for poker.js's rating, like the Stream's) from the gap between the best and the
second-best action at each decision: see difficulty(). Usage: python3 build.py"""
import json, os, random
from collections import Counter

here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(here, "spots.json")))
SUIT = {"s": "♠", "h": "♥", "d": "♦", "c": "♣"}
RANKS = "23456789TJQKA"
STREET = ["flop", "turn", "river"]
PER_CHAIN = 4         # hands per line
CLEAR = 0.7           # the last decision's answer: at least this often
ONLINE = 0.6          # the line's action at each earlier step: at least this often
AUTO = 0.9            # a check this sure is played for the hero
GAP = 0.3             # bb: how far the next-best action trails at the last decision (or 3% of the pot)
random.seed(7)

# the lines: steps of (line to the hero's decision, the action the line takes there; None = the last decision)
CHAINS = {
    "srp": {
        "ip": [(["check"], "bet"), (["check", "bet", "call", "T", "check"], "bet"),
               (["check", "bet", "call", "T", "check", "bet", "call", "R", "check"], None)],
        "ip-raise": [(["check"], "bet"), (["check", "bet", "call", "T", "check"], "bet"),
                     (["check", "bet", "call", "T", "check", "bet", "call", "R", "check"], "bet"),
                     (["check", "bet", "call", "T", "check", "bet", "call", "R", "check", "bet", "raise"], None)],
        "oop": [([], "check"), (["check", "bet"], "call"), (["check", "bet", "call", "T"], "check"),
                (["check", "bet", "call", "T", "check", "bet"], "call"),
                (["check", "bet", "call", "T", "check", "bet", "call", "R"], "check"),
                (["check", "bet", "call", "T", "check", "bet", "call", "R", "check", "bet"], None)],
    },
    "3bp": {
        "oop": [([], "bet"), (["bet", "call", "T"], "bet"), (["bet", "call", "T", "bet", "call", "R"], None)],
        "ip": [(["bet"], "call"), (["bet", "call", "T", "bet"], "call"), (["bet", "call", "T", "bet", "call", "R", "allin"], None)],
    },
}


def bb(ch): return round(ch / 10, 1)
def fmt(x): return ("%.1f" % x).rstrip("0").rstrip(".")
def pretty(c): return ("10" if c[0] == "T" else c[0]) + SUIT[c[1]]


def replay(spot, kind, walked):
    """Walk the line: the history as text, the pot before this street's bets, each player's chips in front and left."""
    names = [kind["oop_name"], kind["ip_name"]]
    pot, left = kind["pot"], [kind["stack"], kind["stack"]]
    street, actor, front = 0, 0, [0, 0]
    board = [spot["flop"][i:i + 2] for i in (0, 2, 4)]
    lines, cur = [kind["pre"]], []
    head = lambda: f"{STREET[street].capitalize()} {' '.join(pretty(c) for c in board)}:"
    for w in walked:
        if len(w) == 2 and w[0] in RANKS and w[1] in SUIT:
            lines.append(head() + " " + ", ".join(cur) + ".")
            pot += front[0] + front[1]; front = [0, 0]; cur = []
            street += 1; board.append(w); actor = 0
            continue
        a, *amt = w.split()
        who = names[actor]
        if a == "check": cur.append(f"{who} checks")
        elif a == "call":
            pay = front[1 - actor] - front[actor]; front[actor] += pay; left[actor] -= pay; cur.append(f"{who} calls")
        elif a in ("bet", "raise", "allin"):
            to = int(amt[0]); left[actor] -= to - front[actor]; front[actor] = to
            cur.append({"bet": f"{who} bets {fmt(bb(to))} bb", "raise": f"{who} raises to {fmt(bb(to))} bb"}.get(a, f"{who} goes all-in for {fmt(bb(to))} bb"))
        elif a == "fold": cur.append(f"{who} folds")
        actor = 1 - actor
    lines.append(head() + " " + ", ".join(cur) + "." if cur else head()[:-1] + ".")
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


def find(acts, want):
    """The index of the line's action among the node's actions ("bet" = the smallest bet)."""
    for i, a in enumerate(acts):
        if a == want or (want in ("bet", "raise", "allin") and a.startswith(want)): return i
    return None


def difficulty(steps):
    """How hard the hand is, from the solve alone (the user: "something objective"): at each decision you're asked, the
    gap in bb between the best action and the nearest one that counts as wrong; the closer, the harder to tell apart. The hand's
    score sums 1 / gap over its decisions (a gap under 0.1 bb counts as 0.1). Only the order matters: main() spreads
    the hands evenly from 800 to 1800 by this score."""
    score = 0.0
    for s in steps:
        if s["auto"]: continue
        best = max(x["ev"] for x in s["actions"])
        # the nearest action that counts as wrong (as poker.js grades: under 25% and costing more than a sliver);
        # a decision where nothing can be wrong adds nothing
        wrong = [best - x["ev"] for x in s["actions"] if x["f"] < 0.25 and best - x["ev"] > max(0.05, s["pot"] * 0.01)]
        if wrong: score += 1 / max(0.1, min(wrong))
    return score


def main():
    hands = []
    for sp in S["spots"]:
        path = os.path.join(here, "out", sp["id"] + ".json")
        if not os.path.exists(path): print("no solve yet:", sp["id"]); continue
        kind = S[sp["kind"]]
        res = json.load(open(path))
        sub = lambda l: [sp["turn"] if x == "T" else sp["river"] if x == "R" else x for x in l]
        nodes = {tuple(n["line"]): n for n in res["nodes"] if "error" not in n}
        for cname, chain in CHAINS[sp["kind"]].items():
            ns = [nodes.get(tuple(sub(l))) for l, _ in chain]
            if any(n is None for n in ns): print("missing a decision:", sp["id"], cname); continue
            me = ns[0]["player"]
            idx = [{h["h"]: h for h in n["hands"]} for n in ns]
            common = set(idx[0]).intersection(*idx[1:])
            groups = {}
            for hs in sorted(common):
                ok = True
                for (line, want), n, ix in zip(chain[:-1], ns[:-1], idx[:-1]):
                    j = find(n["actions"], want)
                    if j is None or ix[hs]["f"][j] < ONLINE: ok = False; break
                if not ok: continue
                last, h = ns[-1], idx[-1][hs]
                top = max(range(len(last["actions"])), key=lambda i: h["f"][i])
                if h["f"][top] < CLEAR: continue
                _, pot0, front, _, _ = replay(sp, kind, last["walked"])
                gap = h["ev"][top] - max(h["ev"][i] for i in range(len(h["ev"])) if i != top)
                if gap < max(GAP * 10, 0.03 * (pot0 + sum(front))): continue
                groups.setdefault(last["actions"][top].split()[0], []).append(hs)
            picks = []
            for k in sorted(groups, key=lambda k: -len(groups[k])):
                picks += random.sample(groups[k], min(2, len(groups[k])))
            for hs in picks[:PER_CHAIN]:
                steps = []
                for (line, want), n, ix in zip(chain, ns, idx):
                    hist, pot0, front, left, board = replay(sp, kind, n["walked"])
                    pot_now = pot0 + front[0] + front[1]
                    h = ix[hs]; facing = front[1 - me] - front[me]
                    j = find(n["actions"], want) if want else None
                    steps.append({
                        "street": STREET[len(board) - 3], "board": board, "history": hist,
                        "pot": bb(pot_now), "heroStack": bb(left[me]), "villainStack": bb(left[1 - me]),
                        "facingLabel": (f"bets {fmt(bb(front[1 - me]))} bb" if front[me] == 0 else f"raises to {fmt(bb(front[1 - me]))} bb") if facing else "",
                        "actions": [{"label": label(a, pot_now, front, me), "f": h["f"][i], "ev": bb(h["ev"][i])} for i, a in enumerate(n["actions"])],
                        "line": j, "auto": bool(want == "check" and j is not None and h["f"][j] >= AUTO),
                        "mix": n["mix"], "equity": h["eq"],
                    })
                hands.append({"id": f"{sp['id']}-{cname}-{hs}", "spot": sp["id"], "kind": sp["kind"],
                              "hero": kind["oop_name"] if me == 0 else kind["ip_name"], "villain": kind["ip_name"] if me == 0 else kind["oop_name"],
                              "raiser": kind["raiser"], "raiseLabel": kind["raise_label"], "hand": hs,
                              "rating": difficulty(steps), "steps": steps})
    # spread evenly by difficulty, 800 (easiest) to 1800 (hardest): the raw scores rank the hands, the rank is the rating
    hands.sort(key=lambda x: x["rating"])
    for i, x in enumerate(hands): x["rating"] = int(round((800 + 1000 * i / max(1, len(hands) - 1)) / 10) * 10)
    out = os.path.join(here, "..", "..", "data", "poker.json")
    json.dump({"v": 2, "about": "Heads-up 100bb; answers from postflop-solver (tools/poker). Sizes: flop BTN 33%/75%, BB lead 50%; turn and river 75%; raises 3x; all-in.",
               "hands": hands}, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
    if hands:
        print(len(hands), "hands; decisions", sum(sum(1 for s in x["steps"] if not s["auto"]) for x in hands),
              "; by spot", dict(Counter(x["spot"] for x in hands)), "; ratings", min(x["rating"] for x in hands), "-", max(x["rating"] for x in hands),
              "; last answers", dict(Counter(max(x["steps"][-1]["actions"], key=lambda a: a["f"])["label"].split()[0] for x in hands)))


if __name__ == "__main__":
    main()
