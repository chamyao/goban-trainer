"""Plot → region: places, links and quests from the story file's nodes.

Every node in data/tk.json names a place, a scene and a role. Places become
maps, edges between nodes in different places become exits, and nodes become
quests in story order. Exits face the way the old node map drew the
neighbouring place, so the world keeps its geography.
"""
import re

ROLE_DEFAULT = {
    "main": "Go to {place}.",
    "side": "Side story: {title}.",
    "short": "Shortcut: {title}.",
    "boss": "Defeat the boss at {place}.",
}


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")


def side_toward(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if abs(dx) >= abs(dy) * 0.8:
        return "E" if dx > 0 else "W"
    return "S" if dy > 0 else "N"


def build_region(world, briefs):
    nodes = world["nodes"]
    order, places = [], {}
    for n in nodes:
        pid = slug(n["place"])
        if pid not in places:
            b = briefs.get(n["place"], {})
            places[pid] = {"id": pid, "name": n["place"], "brief": b, "nodes": [], "links": [], "xy": []}
            order.append(pid)
        places[pid]["nodes"].append(n)
        places[pid]["xy"].append((n["x"], n["y"]))
    for p in places.values():
        xs, ys = zip(*p["xy"])
        p["centre"] = (sum(xs) / len(xs), sum(ys) / len(ys))

    by_key = {n["key"]: n for n in nodes}
    after = {n["key"]: [] for n in nodes}
    for a, b in world["edges"]:
        after[b].append(a)
        pa, pb = slug(by_key[a]["place"]), slug(by_key[b]["place"])
        if pa != pb:
            for x, y in ((pa, pb), (pb, pa)):
                if y not in places[x]["links"]:
                    places[x]["links"].append(y)
    for p in places.values():
        p["sides"] = {to: side_toward(p["centre"], places[to]["centre"]) for to in p["links"]}

    quests = []
    for n in nodes:
        if not n.get("scene"):
            continue
        p = places[slug(n["place"])]
        scene = world["scenes"][n["scene"]]
        objective = p["brief"].get("objectives", {}).get(n["key"]) or \
            ROLE_DEFAULT[n.get("role", "main")].format(place=n["place"], title=scene["title"])
        q = {"node": n["key"], "role": n.get("role", "main"), "place": p["id"], "spot": None,
             "scene": n["scene"], "title": scene["title"], "objective": objective,
             "after": after[n["key"]], "grade": n.get("grade"), "pool": n.get("pool", [])}
        if n.get("boss"):
            q["boss"] = n["boss"]
        if n.get("board") is False:   # a scene with no board (a defeat): playing it is the beat
            q["board"] = False
        if n.get("shrine"):   # this node is its place's shrine (dark / lit / settled); "hint" is what it repeats
            q["shrine"] = True
        if n.get("hint"):   # counsel that gates the next step: repeated by a shrine, and kept under the goal line
            q["hint"] = n["hint"]
        if n.get("gate"):   # a gated battle: each {"needs", "else" scene, "objective", "at" place}, in order
            q["gate"] = [{**g, "needs": g["needs"] if isinstance(g["needs"], list) else [g["needs"]],
                          **({"place": slug(g["at"])} if g.get("at") else {})} for g in n["gate"]]
        if n.get("room"):   # played inside one of the place's buildings (its landmark "id")
            q["room"] = n["room"]
            if n.get("trigger"):   # near (default), arrive or talk, as for landmarks
                q["trigger"] = n["trigger"]
        quests.append(q)
    start = slug(nodes[0]["place"])
    return {"places": [places[k] for k in order], "quests": quests, "start": start}
