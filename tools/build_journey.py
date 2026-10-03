#!/usr/bin/env python3
"""Build data/journey.json: "Wukong's Journey", a map book of worlds whose
levels get harder along the path. Each level is a pool of same-difficulty
problems drawn from the other books (a slip draws a fresh one); each
world ends in a boss from Michael Redmond's videos (early worlds) or the
Maeda tsumego (later worlds, rated a notch above the world).

Usage: tools/build_journey.py   (deterministic; rerun after books change)
"""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = ROOT / "data" / "books"
BOSS_BOOKS = {"redmond-life-and-death", "maeda-tsumego-part-1", "maeda-tsumego-part-2", "maeda-tsumego-part-3"}

# Grades easiest → hardest, as the problems label them.
GRADES = [f"{k}K{p}" for k in range(15, 0, -1) for p in ("", "+")] + [f"{d}D{p}" for d in range(1, 8) for p in ("", "+")]
RANK = {g: i for i, g in enumerate(GRADES)}

WORLDS = [  # name, theme, grades
    ("Flower-Fruit Mountain", "meadow", ["15K", "15K+", "14K", "14K+", "13K", "13K+"]),
    ("Water-Curtain Cave", "cave", ["12K", "12K+", "11K", "11K+"]),
    ("Dragon Palace", "sea", ["10K", "10K+", "9K", "9K+"]),
    ("Heavenly Peach Garden", "peach", ["8K", "8K+", "7K", "7K+"]),
    ("Cave of Silken Webs", "forest", ["6K", "6K+", "5K", "5K+"]),
    ("Flaming Mountains", "fire", ["4K", "4K+", "3K", "3K+"]),
    ("River of Flowing Sand", "desert", ["2K", "2K+", "1K", "1K+"]),
    ("Lion-Camel Ridge", "snow", ["1D", "1D+", "2D", "2D+"]),
    ("Heavenly Palace", "sky", ["3D", "3D+", "4D", "4D+"]),
    ("Thunderclap Monastery", "temple", ["5D", "5D+", "6D", "6D+", "7D"]),
]

# Map template (960×520). Two forks per world: the long road (several
# levels at the world's grade) or a shortcut (one level about 4 grades
# harder) that rejoins it. "step" = place in the difficulty ramp (0..1);
# "short" marks a shortcut.
NODES = [  # key suffix, x, y, step, short
    ("1", 160, 420, 0.0, False), ("2", 250, 360, 0.15, False),
    ("3", 320, 440, 0.25, False), ("4", 410, 460, 0.3, False), ("5", 500, 420, 0.35, False),  # long road
    ("s1", 400, 290, 0.3, True),                                                          # shortcut
    ("6", 590, 340, 0.5, False), ("7", 660, 260, 0.6, False),
    ("8", 730, 380, 0.7, False), ("9", 820, 340, 0.8, False),                              # long road
    ("s2", 770, 190, 0.75, True),                                                         # shortcut
    ("10", 870, 230, 0.95, False),
    ("boss", 900, 100, 1.0, False),
]
EDGES = [("start", "1"), ("1", "2"), ("2", "3"), ("3", "4"), ("4", "5"), ("5", "6"), ("2", "s1"), ("s1", "6"),
         ("6", "7"), ("7", "8"), ("8", "9"), ("9", "10"), ("7", "s2"), ("s2", "10"), ("10", "boss")]
SHORTCUT = 8  # half-grades harder: two 8k levels vs one 4k
POOL = 40


def usable(p):
    # A real answer key: at least one correct line with a move in it.
    return any(l[0] == 1 and len(l) > 1 for l in p.get("lines", []))


def main():
    rng = random.Random(20261003)
    index = json.loads((ROOT / "data" / "index.json").read_text())
    by_grade, maeda = {}, []
    redmond = []
    for b in index:
        book = json.loads((BOOKS / f"{b['id']}.json").read_text())
        for p in book["problems"]:
            if not usable(p):
                continue
            ref = [b["id"], p["id"]]
            if b["id"] == "redmond-life-and-death":
                redmond.append(ref)
            elif b["id"].startswith("maeda-tsumego"):
                if p.get("lv") in RANK:
                    maeda.append((RANK[p["lv"]], ref))
            elif p.get("lv") in RANK:
                by_grade.setdefault(p["lv"], []).append(ref)
    for v in by_grade.values():
        rng.shuffle(v)
    rng.shuffle(maeda)
    redmond.sort(key=lambda r: r[1])
    thirds = [redmond[i * len(redmond) // 3:(i + 1) * len(redmond) // 3] for i in range(3)]

    def draw(rank, taken, n=POOL):
        # Problems at this grade; borrow neighbouring grades if it's thin.
        out, d = [], 0
        while len(out) < n and d < len(GRADES):
            for r in {rank - d, rank + d}:
                if 0 <= r < len(GRADES):
                    out += [x for x in by_grade.get(GRADES[r], []) if tuple(x) not in taken and x not in out]
            d += 1
        out = out[:n]
        taken.update(map(tuple, out))
        return out

    worlds = []
    for wi, (name, theme, grades) in enumerate(WORLDS):
        taken = set()
        jit = random.Random(wi)
        lo, hi = RANK[grades[0]], RANK[grades[-1]]
        nodes = [{"key": "start", "x": 70, "y": 430, "kind": "start"}]
        for key, x, y, step, short in NODES:
            node = {"key": f"{wi + 1}-{key}", "x": x + jit.randint(-12, 12), "y": y + jit.randint(-10, 10)}
            if key == "boss":
                node["kind"] = "boss"
                if wi < 3:
                    pool = thirds[wi][:]
                    rng.shuffle(pool)
                    node["grade"] = "Redmond"
                else:
                    pool = [r for g, r in maeda if hi < g <= hi + 3]
                    if len(pool) < 15:  # the hardest worlds: Maeda's hardest problems
                        pool = [r for g, r in sorted(maeda, key=lambda t: -t[0])][:POOL]
                    node["grade"] = "Maeda"
                node["pool"] = pool[:POOL]
            else:
                rank = round(lo + (hi - lo) * step) + (SHORTCUT if short else 0)
                rank = min(rank, len(GRADES) - 1)
                node["kind"] = "shortcut" if short else "level"
                node["grade"] = GRADES[rank]
                node["pool"] = draw(rank, taken)
            nodes.append(node)
        edges = [[(a if a == "start" else f"{wi + 1}-{a}"), (b if b == "start" else f"{wi + 1}-{b}")] for a, b in EDGES]
        worlds.append({"n": wi + 1, "name": name, "theme": theme, "grades": f"{grades[0]}–{grades[-1]}",
                       "nodes": nodes, "edges": edges})
    out = {"id": "journey", "title": "Wukong's Journey", "worlds": worlds}
    (ROOT / "data" / "journey.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    for w in worlds:
        print(w["n"], w["name"], w["grades"], " ".join(f'{n["key"].split("-")[1]}:{n["grade"]}/{len(n["pool"])}' for n in w["nodes"][1:]))


if __name__ == "__main__":
    main()
