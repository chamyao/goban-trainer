"""Map factory: turn the plot into game maps.

    python3 tools/mapfactory build   --world 1               # plot → abstract maps + region.json
    python3 tools/mapfactory compile --world 1 --kit ninja   # abstract maps → Tiled maps for one art pack
    python3 tools/mapfactory scenes  --world 1               # story scenes → staged cutscenes (cutscenes.json)
    python3 tools/mapfactory all     --world 1 --kit ninja --kit jade --preview

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

from interiors import furnish_place  # noqa: E402
from layout import layout  # noqa: E402
from plot import build_region  # noqa: E402
from tk_story_zh import ZH  # noqa: E402


def out_dir(n):
    return ROOT / f"data/tk_maps/w{n}"


def build(n):
    from tk_places import PLACES, ROOMS
    world = next(w for w in json.loads((ROOT / "data/tk.json").read_text())["worlds"] if w["n"] == n)
    region = build_region(world, PLACES.get(n, {}))
    d = out_dir(n)
    d.mkdir(parents=True, exist_ok=True)
    places = []
    for p in region["places"]:
        m = layout(p, n, zlib.crc32(f"{n}/{p['id']}".encode()) % 100000)
        (d / f"{p['id']}.map.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
        for q in region["quests"]:
            if q["place"] == p["id"]:
                q["spot"] = next(s["id"] for s in m["spots"] if s["node"] == q["node"])
        # a room behind every building's door (interiors.py)
        rooms = furnish_place(m, p, ROOMS, n)
        (d / f"{p['id']}.map.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
        places.append({"id": p["id"], "name": p["name"], "zh": ZH.get(p["name"], ""), "archetype": m["archetype"],
                       "map": f"{p['id']}.map.json", "links": p["links"] + [r["id"] for r in rooms]})
        for r in rooms:
            (d / f"{r['id']}.map.json").write_text(json.dumps(r, ensure_ascii=False, indent=1))
            kind_zh = ZH.get(r["name"].split(",")[0], "")
            places.append({"id": r["id"], "name": r["name"], "zh": ZH.get(r["name"]) or f"{ZH.get(p['name'], '')}·{kind_zh}",
                           "archetype": "interior", "map": f"{r['id']}.map.json", "links": [p["id"]], "parent": p["id"]})
        print(f"  {p['id']:22} {m['archetype']:9} {m['size'][0]}x{m['size'][1]}  "
              f"{len(m['objects'])} objects, {len(m['spots'])} spots, {len(m['npcs'])} people, {len(m['exits'])} exits")
    for q in region["quests"]:  # Chinese beside every line the player reads
        q["objective_zh"] = ZH.get(q["objective"], "")
        q["title_zh"] = world["scenes"][q["scene"]].get("zh", "")
    out = {"format": "tk-region/1", "world": n, "name": world["name"], "zh": world.get("zh", ""), "start": region["start"],
           "party": world.get("party", []), "places": places, "quests": region["quests"]}
    (d / "region.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"wrote {len(places)} maps ({sum(1 for p in places if p.get('parent'))} interiors) and region.json to {d.relative_to(ROOT)}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["build", "compile", "scenes", "all"])
    ap.add_argument("--world", type=int, default=1)
    ap.add_argument("--kit", action="append", help="art kit(s) to compile for (default: ninja)")
    ap.add_argument("--preview", action="store_true", help="also render PNG previews into docs/maps/")
    a = ap.parse_args()
    if a.cmd in ("build", "all"):
        build(a.world)
    if a.cmd in ("compile", "all"):
        from compile import compile_world
        for kit in a.kit or ["ninja"]:
            compile_world(a.world, kit, preview=a.preview)
    if a.cmd in ("scenes", "all"):
        from scenes import build_scenes
        build_scenes(a.world)


main()
