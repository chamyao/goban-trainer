"""Map factory: turn the plot into game maps.

    python3 tools/mapfactory build   --world 1               # plot → abstract maps + region.json
    python3 tools/mapfactory compile --world 1 --kit xianxia   # abstract maps → Tiled maps for one art pack
    python3 tools/mapfactory scenes  --world 1               # story scenes → staged cutscenes (cutscenes.json)
    python3 tools/mapfactory all     --world 1 --kit xianxia --kit jade --kit genshin --preview

Reads data/tk.json (built from tools/tk_story.py) and tools/tk_places.py.
Writes data/tk_maps/w<N>/. The format is described in docs/map-format.md.
"""
import argparse
import json
import sys
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "tools"))

from interiors import add_spot, furnish_place  # noqa: E402
from overworld import build_overworld  # noqa: E402
from layout import layout  # noqa: E402
from plot import build_region  # noqa: E402
from tk_story_zh import ZH  # noqa: E402


def out_dir(n):
    return ROOT / f"data/tk_maps/w{n}"


def build_from_plans(n, pw, world):
    """A book whose places are written as plan grids (plans.py): every map, room and quest from its plans."""
    from plans import build_world, key_prefix, load, verify
    plans, tables, zh = load(pw)
    maps, places, quests = build_world(n, world, plans, tables, {**ZH, **zh},
                                       prefix=key_prefix(pw) if key_prefix(pw) != str(n) else None)
    problems = verify(maps)
    if problems:
        sys.exit("plans: " + "; ".join(problems))
    d = out_dir(n)
    d.mkdir(parents=True, exist_ok=True)
    for mid, m in maps.items():
        (d / f"{mid}.map.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
        print(f"  {mid:28} {m['archetype']:9} {m['size'][0]}x{m['size'][1]}  {len(m['objects'])} objects, "
              f"{len(m['spots'])} spots, {len(m['npcs'])} people, {len(m['exits'])} exits")
    return places, quests, plans


def build(n, plans_of=None):
    from tk_places import PLACES, ROOMS
    world = next(w for w in json.loads((ROOT / "data/tk.json").read_text())["worlds"] if w["n"] == n)
    if plans_of:
        places, quests, _ = build_from_plans(n, plans_of, world)
        from plans import slug
        return finish(n, world, places, {"quests": quests, "start": slug(world["nodes"][0]["place"])})
    region = build_region(world, PLACES.get(n, {}))
    d = out_dir(n)
    d.mkdir(parents=True, exist_ok=True)
    places = []
    for p in region["places"]:
        m = layout(p, n, zlib.crc32(f"{n}/{p['id']}".encode()) % 100000)
        (d / f"{p['id']}.map.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
        for q in region["quests"]:
            if q["place"] == p["id"] and not q.get("room"):   # a beat in a room gets its spot in that room, below
                q["spot"] = next(s["id"] for s in m["spots"] if s["node"] == q["node"])
        # a room behind every building's door (interiors.py)
        rooms = furnish_place(m, p, ROOMS, n)
        (d / f"{p['id']}.map.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
        places.append({"id": p["id"], "name": p["name"], "zh": ZH.get(p["name"], ""), "archetype": m["archetype"],
                       "map": f"{p['id']}.map.json", "links": p["links"] + [r["id"] for r in rooms]})
        for q in region["quests"]:   # a story beat played inside a building
            if q["place"] == p["id"] and q.get("room"):
                r = next((r for r in rooms if r.get("building") == q["room"]), None)
                if r is None:
                    sys.exit(f"node {q['node']}: {p['id']} has no building with id {q['room']!r}")
                q["place"], q["spot"] = r["id"], add_spot(r, q["node"], q["title"], q.pop("trigger", None))
        for r in rooms:
            (d / f"{r['id']}.map.json").write_text(json.dumps(r, ensure_ascii=False, indent=1))
            kind_zh = ZH.get(r["name"].split(",")[0], "")
            places.append({"id": r["id"], "name": r["name"], "zh": ZH.get(r["name"]) or f"{ZH.get(p['name'], '')}·{kind_zh}",
                           "archetype": "interior", "map": f"{r['id']}.map.json", "links": r.get("links", [p["id"]]), "parent": p["id"],
                           **({"gives": g} if (g := [n["gives"] for n in r["npcs"] if n.get("gives")]) else {})})   # the guide finds givers indoors
        print(f"  {p['id']:22} {m['archetype']:9} {m['size'][0]}x{m['size'][1]}  "
              f"{len(m['objects'])} objects, {len(m['spots'])} spots, {len(m['npcs'])} people, {len(m['exits'])} exits")
    finish(n, world, places, region)


def finish(n, world, places, region):
    d = out_dir(n)
    # the overworld: every place on one walkable map (overworld.py)
    outdoor = [p for p in places if not p.get("parent")]
    links = {p["id"]: [l for l in p["links"] if not l.startswith(p["id"] + "--")] for p in outdoor}
    ow = build_overworld(outdoor, world["nodes"], links, region["start"], n)
    (d / "overworld.map.json").write_text(json.dumps(ow, ensure_ascii=False, indent=1))
    places.append({"id": "overworld", "name": ow["name"], "zh": ZH.get(ow["name"], "天下"), "archetype": "overworld",
                   "map": "overworld.map.json", "links": []})
    print(f"  overworld              {ow['size'][0]}x{ow['size'][1]}  {len(ow['objects'])} objects, {len(ow['exits'])} entrances")
    for q in region["quests"]:  # Chinese beside every line the player reads
        q["objective_zh"] = ZH.get(q["objective"], "")
        q["title_zh"] = world["scenes"][q["scene"]].get("zh", "")
        if q.get("hint"):
            q["hint_zh"] = ZH.get(q["hint"], "")
        for g in q.get("gate", []):
            if g.get("objective"):
                g["objective_zh"] = ZH.get(g["objective"], "")
    out = {"format": "tk-region/1", "world": n, "name": world["name"], "zh": world.get("zh", ""), "start": region["start"],
           "party": world.get("party", []), "places": places, "quests": region["quests"]}
    (d / "region.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"wrote {len(places)} maps ({sum(1 for p in places if p.get('parent'))} interiors) and region.json to {d.relative_to(ROOT)}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["build", "compile", "scenes", "all"])
    ap.add_argument("--world", type=int, default=1)
    ap.add_argument("--kit", action="append", help="art kit(s) to compile for (default: xianxia, jade, genshin)")
    ap.add_argument("--preview", action="store_true", help="also render PNG previews into docs/maps/")
    ap.add_argument("--plans", type=lambda v: int(v) if v.isdigit() else v, default=None, help="build the places from this book's plan grids (plans.py), e.g. --world 12 --plans 2, or an arc: --plans cc")
    a = ap.parse_args()
    if a.cmd in ("build", "all"):
        build(a.world, a.plans)
    if a.cmd in ("compile", "all"):
        from compile import compile_world
        for kit in a.kit or ["xianxia", "jade", "genshin"]:
            compile_world(a.world, kit, preview=a.preview)
    if a.cmd in ("scenes", "all"):
        from scenes import build_scenes
        build_scenes(a.world)


main()
