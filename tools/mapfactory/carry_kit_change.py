"""Carry an art-kit change into maps that are kept as they are (Books 1-3: places-playbook.md, "Starting fresh").

    python3 tools/mapfactory/carry_kit_change.py --before 262768c1 --world 1 --world 2 --world 3

A kit change (Graphics' new floors, say) reaches a map only when it is compiled, and the frozen maps can't simply be
recompiled: a fresh compile of them also differs a little from what's committed, from changes to compile itself since
they were made (a few decoration tiles). So each map is compiled twice from its committed map.json, by the code and kits
of `--before` (the commit before the kit change) and by those of HEAD. The cells where the two differ are the kit
change's, and only those cells take HEAD's tile; every other cell keeps the committed one. Tiles are compared by
(tileset, local id), so a tileset that grew still lines up. The objects layer is never touched. Writes each kit's tmj in
place and prints how many cells changed per map.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
KITS = ("xianxia", "jade", "genshin")
FLIP = 0x1FFFFFFF   # Tiled's flip flags live in the top 3 bits

COMPILE = r'''
import sys, json
from pathlib import Path
sys.path[:0] = ["tools", "tools/mapfactory"]
import compile as C
C.doors_blocked = lambda *a: []          # the build's checks are for new maps; these are kept as they are
C.doors_front_blocked = lambda *a: []
try:
    import wander; wander.cramped = lambda m: []
except ImportError:
    pass
src_root, out_root = Path(sys.argv[1]), Path(sys.argv[2])
for n in sys.argv[3].split(","):
    src = src_root / f"data/tk_maps/w{n}"
    region = json.loads((src / "region.json").read_text())
    maps = {p["id"]: json.loads((src / p["map"]).read_text()) for p in region["places"]}
    C.SEEN.clear()
    for m in maps.values():
        C.SEEN.update(m.get("seen_lines") or {})
    for k in sys.argv[4].split(","):
        kit, out = C.Kit(k), out_root / f"w{n}" / k
        out.mkdir(parents=True, exist_ok=True)
        for pid, m in maps.items():
            if (src / k / f"{pid}.tmj").exists():
                C.compile_map(m, kit, out)
'''


def compile_at(tree, worlds, out):
    """Compile the worlds' committed maps with the code and kits in `tree`, into `out` (tmj per kit)."""
    script = Path(tempfile.mkdtemp()) / "compile_all.py"
    script.write_text(COMPILE)
    subprocess.run([sys.executable, str(script), str(ROOT), str(out), ",".join(map(str, worlds)), ",".join(KITS)],
                   cwd=tree, check=True, stdout=subprocess.DEVNULL)


def decoder(tilesets):
    ts = sorted(tilesets, key=lambda t: t["firstgid"])

    def dec(g):
        if not g:
            return None
        flags, g = g & ~FLIP, g & FLIP
        t = max((t for t in ts if t["firstgid"] <= g), key=lambda t: t["firstgid"])
        return t.get("name") or t.get("source"), g - t["firstgid"], flags
    return dec


def encoder(tilesets):
    first = {t.get("name") or t.get("source"): t["firstgid"] for t in tilesets}
    return lambda c: 0 if c is None else (first[c[0]] + c[1]) | c[2]


def carry(cur, before, after):
    """The committed tmj `cur` with the cells that changed from `before` to `after` taken from `after`."""
    tilesets = [dict(t) for t in after["tilesets"]]
    names = {t.get("name") or t.get("source") for t in tilesets}
    nxt = max(t["firstgid"] + t.get("tilecount", 0) for t in tilesets)
    for t in cur["tilesets"]:   # a tileset only the committed map uses keeps its tiles, at the end
        if (t.get("name") or t.get("source")) not in names:
            tilesets.append({**t, "firstgid": nxt})
            nxt += t.get("tilecount", 0)
    dc, db, da, enc = decoder(cur["tilesets"]), decoder(before["tilesets"]), decoder(after["tilesets"]), encoder(tilesets)
    lb = {l["name"]: l for l in before["layers"] if l["type"] == "tilelayer"}
    la = {l["name"]: l for l in after["layers"] if l["type"] == "tilelayer"}
    changed, layers = 0, []
    for l in cur["layers"]:
        if l["type"] != "tilelayer" or l["name"] not in lb or l["name"] not in la:
            layers.append(l)
            continue
        out = []
        for c, b, a in zip(l["data"], lb[l["name"]]["data"], la[l["name"]]["data"]):
            b, a = db(b), da(a)
            if b != a:
                out.append(enc(a))
                changed += 1
            else:
                out.append(enc(dc(c)))
        layers.append({**l, "data": out})
    for name, l in la.items():   # a tile layer the kit change added
        if name not in lb and name not in {x["name"] for x in cur["layers"]}:
            layers.insert(len(layers) - 1, {**l, "data": [enc(da(g)) for g in l["data"]]})
            changed += sum(1 for g in l["data"] if g)
    return {**cur, "tilesets": tilesets, "layers": layers}, changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--before", required=True, help="the commit before the kit change")
    ap.add_argument("--world", type=int, action="append", required=True)
    a = ap.parse_args()
    tmp = Path(tempfile.mkdtemp())
    wt = tmp / "before"
    subprocess.run(["git", "worktree", "add", "-q", "--detach", str(wt), a.before], cwd=ROOT, check=True)
    try:
        compile_at(wt, a.world, tmp / "a")
    finally:
        subprocess.run(["git", "worktree", "remove", "--force", str(wt)], cwd=ROOT, check=True)
    compile_at(ROOT, a.world, tmp / "b")
    total = 0
    for n in a.world:
        for k in KITS:
            for f in sorted((tmp / "a" / f"w{n}" / k).glob("*.tmj")):
                dest = ROOT / f"data/tk_maps/w{n}/{k}/{f.name}"
                cur = json.loads(dest.read_text())
                new, changed = carry(cur, json.loads(f.read_text()), json.loads((tmp / "b" / f"w{n}" / k / f.name).read_text()))
                if changed:
                    dest.write_text(json.dumps(new, ensure_ascii=False, separators=(",", ":")))
                    print(f"w{n}/{k}/{f.stem}: {changed} cells")
                    total += 1
    print(f"{total} tmj changed")


if __name__ == "__main__":
    main()
