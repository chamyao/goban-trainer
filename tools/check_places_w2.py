"""Check Book 2's playable places (tools/tk_places_w2.py) against the new story, with the real map factory.

    python3 tools/check_places_w2.py

  - every place the story uses has a brief, and every brief is a place the story uses
  - every landmark node is a 2-<key> of the story; every beat has a spot (a landmark node or a room)
  - every room a node names is a building here whose kind has an interior
  - every kind is in tools/mapfactory/vocab.py; every "near" names a landmark; challenge ids are unique
  - when/until/gives_when name real keys and items
  - the map factory lays out every place and furnishes every room (as `mapfactory build` would)
Exit 1 on errors.
"""
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "tools" / "mapfactory"))
from interiors import TEMPLATES, add_spot, furnish_place  # noqa: E402
from layout import layout  # noqa: E402
from plot import build_region  # noqa: E402
from tk_places_w2 import PLACES2  # noqa: E402
from tk_story_w2_new import WORLD2  # noqa: E402
from vocab import FOLK, KINDS  # noqa: E402

N = 2


def main():
    errors, notes = [], []
    world = {**WORLD2, "nodes": [{**n, "key": f"{N}-{n['key']}"} for n in WORLD2["nodes"]],
             "edges": [[f"{N}-{a}", f"{N}-{b}"] for a, b in WORLD2["edges"]]}
    keys = {n["key"] for n in world["nodes"]}
    items = set(WORLD2.get("items", {}))
    story_places = {n["place"] for n in world["nodes"]}
    for p in sorted(story_places - set(PLACES2)):
        errors.append(f"the story uses place {p!r}, which has no brief")
    for p in sorted(set(PLACES2) - story_places):
        errors.append(f"brief {p!r} is not a place in the story")

    def cond(c, where):
        kind, _, v = c.partition(":")
        if kind == "node" and f"{N}-{v}" not in keys or kind == "item" and v not in items:
            errors.append(f"{where}: {c} names nothing in the story")

    spotted = set()
    for pname, b in PLACES2.items():
        ids = {lm.get("id") for lm in b.get("landmarks", [])}
        for lm in b.get("landmarks", []):
            if lm["kind"] not in KINDS:
                errors.append(f"{pname} / {lm.get('id')}: kind {lm['kind']} is not in vocab.py")
            if lm.get("near") and lm["near"] not in ids:
                errors.append(f"{pname} / {lm.get('id')}: near {lm['near']!r} is no landmark")
            if lm.get("node"):
                if lm["node"] not in keys:
                    errors.append(f"{pname} / {lm['id']}: node {lm['node']} is not in the story")
                spotted.add(lm["node"])
        seen_ch = set()
        for i, p in enumerate(b.get("npcs", [])):
            where = f"{pname} / npc {i + 1} ({p['kind']})"
            if p["kind"] not in FOLK and not p["kind"].startswith("hero."):
                errors.append(f"{where}: kind is not in vocab.FOLK")
            if p.get("near") and p["near"] not in ids:
                errors.append(f"{where}: near {p['near']!r} is no landmark")
            if p.get("challenge"):
                if p["challenge"] in seen_ch:
                    errors.append(f"{where}: challenge id {p['challenge']!r} used twice")
                seen_ch.add(p["challenge"])
                if not (p.get("intro") and p.get("win")):
                    errors.append(f"{where}: a challenger needs intro and win lines")
            for k in ("when", "gives_when"):
                if p.get(k):
                    cond(p[k], where)
            if p.get("until") and p["until"] not in keys:
                errors.append(f"{where}: until {p['until']} is not in the story")
            if p.get("gives") and p["gives"] not in items:
                errors.append(f"{where}: gives {p['gives']!r}, which is not one of the story's items")
        for k in b.get("objectives", {}):
            if k not in keys:
                errors.append(f"{pname}: objective for {k}, which is not in the story")
    # rooms the story names
    for n in world["nodes"]:
        b = PLACES2.get(n["place"], {})
        if n.get("room"):
            lm = next((l for l in b.get("landmarks", []) if l.get("id") == n["room"]), None)
            if lm is None:
                errors.append(f"{n['key']}: room {n['room']!r} is no building in {n['place']}")
            elif lm["kind"] not in TEMPLATES:
                errors.append(f"{n['key']}: room {n['room']!r} is a {lm['kind']}, which has no interior "
                              f"(the story should drop the room, and the beat plays at the landmark outdoors)")
            else:
                spotted.add(n["key"])
    for k in sorted(keys - spotted, key=lambda k: [int(x) if x.isdigit() else x for x in k.replace("-", " ").split()]):
        n = next(n for n in world["nodes"] if n["key"] == k)
        if not n.get("room"):
            notes.append(f"{k}: no landmark; the factory will put its spot at the centre of {n['place']}")
    # the factory, as `mapfactory build` runs it: rooms the story can't use yet are left out so the rest is tried
    trial = {**world, "nodes": [{k: v for k, v in n.items() if not (k == "room" and not any(
        l.get("id") == v and l["kind"] in TEMPLATES for l in PLACES2.get(n["place"], {}).get("landmarks", [])))} for n in world["nodes"]]}
    region = build_region(trial, PLACES2)
    from tk_places import ROOMS
    for p in region["places"]:
        try:
            m = layout(p, N, zlib.crc32(f"{N}/{p['id']}".encode()) % 100000)
        except RuntimeError as e:
            errors.append(f"factory: {e}")
            continue
        rooms = furnish_place(m, p, ROOMS, N)
        for q in region["quests"]:
            if q["place"] == p["id"] and q.get("room"):
                r = next((r for r in rooms if r.get("building") == q["room"]), None)
                if r is None:
                    errors.append(f"factory: {q['node']} has no room {q['room']!r} in {p['id']}")
                else:
                    add_spot(r, q["node"], q["title"])
        print(f"  {p['id']:12} {m['archetype']:6} {m['size'][0]}x{m['size'][1]}  {len(m['spots'])} spots, "
              f"{len(m['npcs'])} people, {len(rooms)} rooms, exits to {', '.join(e['to'] for e in m['exits'] if not e.get('door'))}")
    for x in notes:
        print("note ", x)
    for e in errors:
        print("ERROR", e)
    print(f"{len(PLACES2)} places, {sum(len(b.get('npcs', [])) for b in PLACES2.values())} people, "
          f"{sum(1 for b in PLACES2.values() for p in b.get('npcs', []) if p.get('challenge'))} challengers; {len(errors)} errors")
    sys.exit(1 if errors else 0)


main()
