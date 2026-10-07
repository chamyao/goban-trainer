"""Book 2 places (Hulao Pass), the Diaochan arc: plan grids (the next pass; the playable pass is tk_places_w2.py).

Unwired draft: tk_places.py still reads Book 2 from tk_story_w2.py. When the
new book is ready, Plot switches both imports in one commit.

The format is the plan grid (docs/book2/plan-grid.md): every place is a coarse
plan in cells. Things claim the cells they cover and never share them; roads,
rivers and walls are lines with their own width in tiles; zones lie under both.
The generator fills in the details inside the cells. The design behind the
plans is docs/book2/places-design.md; check them with
    python3 tools/check_plans_w2.py            (add --png to draw them into docs/book2/plans/)

Shapes used below:
  plan     {"grid": [cols, rows], "cell": tiles per cell, "margin": tiles kept round each thing,
            "ground": [zones], "lines": [lines], "things": [things], "spots": [spots], "dress": [...]}
  zone     {"id", "kind", "rect": [x, y, w, h]} or "mask": rows of "#"/"." at "at": [x, y]
  line     {"id", "kind", "path": [[x, y], …] (cell centres), "width": tiles, "gates": {id: [x, y]}}
  thing    {"id", "kind", "rect": [x, y, w, h], "door": "N"|"S"|"E"|"W" or "doors": […],
            "label", "node", "map": an inner map (a compound or a room), "on": "water"}
  spot     {"id", "at": [x, y], "node", "label", "trigger"}: a marker, claims no cell
  exit     {"to": place, "at": [x, y], "side"}
  state    {"id", "when": condition, "until": condition, "light": day|dusk|night|lantern, "weather"}: one map, several looks
  npcs     as in Book 1 (say/challenge/gives/when/until/face), plus "in": [state ids] and
           "near": a thing id or "at": [x, y]; "watch": a stealth watcher (cone, beat)
"""

# Kinds the plans use that tools/mapfactory/vocab.py doesn't have yet: footprint in tiles (w, h, solid).
# Listed for Integration in docs/book2/places-notes.md.
NEW_KINDS = {
    # buildings and big things
    "building.compound": (None, None, True),        # a walled compound: fills its claim; has a map of its own
    "building.palace": (None, None, True),          # a palace compound on its plateau
    "building.hall_grand": (10, 5, True),           # a great hall: Wang Yun's halls, the Chancellor's middle hall, Dong Zhuo's hall at Meiwu
    "building.wing": (6, 4, True),                  # a side wing of a compound (maids' rooms, stores)
    "building.pavilion": (3, 3, True),              # open-sided pavilion (peony, Phoenix); may stand on water
    "building.pavilion_painted": (3, 3, True),      # the painted pavilion: two storeys
    "building.gatetower": (3, 6, True),             # a gate tower in a city wall, climbable (Xuanping)
    "building.granary": (6, 2, True),
    "building.storehouse": (6, 2, True),
    "building.posthouse": (5, 3, True),             # a Han post-pavilion (亭)
    "building.gatehouse": (4, 1, False),            # a compound's gate: you walk through it
    "building.markettower": (6, 2, True),           # a Han market tower (市楼): tall, a flag and a drum on top
    "building.tent_small": (2, 2, True),
    "camp.banquet": (10, 2, True),                  # a long banquet table under awnings
    "landmark.ridge": (6, 2, False),                # raised earth you stand on
    "landmark.heights": (10, 6, True),              # a height over a valley, with a post on top
    "landmark.hitchingpost": (1, 1, True),
    "market.stalls": (6, 2, True),
    "garden.rockery": (2, 2, True),                 # cover: blocks sight
    "garden.trellis": (4, 1, True),                 # the 荼蘼 trellis
    "garden.screenwall": (4, 1, True),              # a spirit screen inside a compound gate (影壁)
    "tree.willow": (1, 1, True),                    # cover: blocks sight
    "corral": (8, 6, True),                         # a fenced corral with horses
    # inside rooms
    "furn.dais": (3, 2, True),
    "furn.curtain": (1, 1, False),                  # a hanging curtain: blocks sight, not walking
    "furn.swordwall": (1, 1, True),                 # a sword hanging on the wall
    "furn.window": (1, 1, True),
    "furn.lamp": (1, 1, True),
    "furn.seat": (1, 1, False),
    "furn.qin": (2, 1, True),                       # a qin on its stand (Cai Yong's, the scorched tail)                     # a chair that fills as legwork is done
}
# What each new piece of art should look like: the brief for generating it (plans.py --assets lists
# every kind the built maps use that a kit can't draw yet, with these words). Late Han, Chang'an, c. 192.
ART = {
    "building.compound": "a walled Han residence seen from above: rammed-earth wall with grey tile coping, a gatehouse in the front wall, roofs of halls showing inside",
    "building.palace": "Weiyang Palace on its raised terrace: a vast hall with a double-eaved hip roof of dark grey tiles, red pillars, white stone balustrade and steps",
    "building.hall_grand": "a great hall of an official's residence: wide hip-and-gable roof of grey tiles, red lacquered pillars, latticed doors across the front, stone base",
    "building.wing": "a side wing of a courtyard house: long low gable roof, lattice windows, door facing the courtyard (drawn facing E, W or S as `faces` says)",
    "building.pavilion": "an open-sided garden pavilion: four or six red pillars, upturned eaves, no walls; may stand on piles in a lotus pond",
    "building.pavilion_painted": "the painted pavilion: a two-storey garden pavilion with carved, painted beams and a balcony",
    "building.gatetower": "a city-gate tower (Xuanping Gate): a tall timber tower on the city wall over the gate passage, stairs up its inner side",
    "building.granary": "a Han granary: long rammed-earth storehouse, thatched or tiled gable roof, raised floor, small high vents",
    "building.storehouse": "a treasury storehouse: stout walls, heavy double doors with bronze fittings, tiled roof",
    "building.posthouse": "a Han post-pavilion (亭): a small walled station with a gate and a lookout, a signboard by the road",
    "building.gatehouse": "a compound's gatehouse: a roofed gateway in the compound wall, double doors",
    "building.markettower": "a Han market tower (市楼): a slender two-storey timber tower with a hip roof, a drum in the upper storey and a long flag on a pole; tall, so it reads from afar",
    "building.tent_small": "a small square officer's tent",
    "camp.banquet": "a long banquet table under awnings, low tables and cushions in a row, wine jars",
    "landmark.ridge": "an earthen ridge: raised bare earth with a gentle slope, grass on its flanks",
    "landmark.heights": "a rocky height over a valley mouth, a signal post on top (gongs on one, drums on the other)",
    "landmark.hitchingpost": "a wooden hitching post; with a tethered horse when Lü Bu is inside",
    "market.stalls": "a row of market stalls with cloth awnings, baskets and goods",
    "garden.rockery": "a garden rockery of pierced Taihu stones",
    "garden.trellis": "a 荼蘼 (rose) trellis arching over a garden path, white flowers",
    "garden.screenwall": "a spirit screen (影壁): a free-standing wall inside a gate, tiled coping",
    "tree.willow": "a weeping willow, long drooping green strands",
    "tree.poplar": "a tall slender poplar, for roadside rows",
    "plant.peony": "a bed of peonies, large pink and red blooms",
    "water.lotus": "lotus leaves and flowers floating on a pond tile",
    "corral": "a wooden-railed corral with two or three horses",
    "milestone": "a small stone road marker",
    "banner.black": "a black banner on a pole (the Chancellor's)",
    "prop.lanterns": "a red paper lantern on a stand, for rows along the avenue at night",
    "prop.body_lamp": "a dark covered mound in the street with a small lamp flame on it (non-graphic)",
    "furn.dais": "a raised dais with a low seat and armrest, a screen behind",
    "furn.curtain": "a hanging bead curtain across part of a room",
    "furn.swordwall": "a sword in its scabbard hanging on a wall rack",
    "furn.window": "a latticed window in a wall",
    "furn.lamp": "a bronze standing lamp, lit",
    "furn.seat": "a floor cushion with a low armrest",
    "furn.qin": "a guqin on its stand (Cai Yong's, its tail scorched)",
    # lines and zones (drawn as ground)
    "road": "a beaten-earth road; the avenue is paved, three lanes, the middle lane edged",
    "path": "a narrow garden path of pebbles or stepping stones",
    "bridge": "a stone or timber bridge; the Phoenix Pavilion's is a zig-zag timber bridge",
    "gallery": "a covered gallery: a roofed walkway with red pillars and lattice railings on both sides",
    "wall.city": "Chang'an's rammed-earth city wall, crenellated, wide enough to walk on",
    "wall": "a compound or room wall",
    "wall.lattice": "a lattice wall: wooden lattice panels you can see through but not walk through",
    "curtain": "a hanging curtain line across a room",
    "court": "a stone-flagged courtyard",
    "passage": "a narrow flagged passage between buildings",
    "garden": "garden ground: grass, moss, scattered stones",
    "market": "packed earth with straw and litter, a busy market",
    "plateau": "the raised Longshou terrace: an edge of dressed stone, steps where roads climb it",
    "field.wheat": "a wheat field in rows",
    "field": "open meadow outside the walls, longer grass",
    "loess": "dry yellow loess ground",
    "cliff": "a loess cliff face",
    "hills": "rough hill ground, scrub",
    "plain": "open treeless grassland",
    "camp": "trampled camp ground",
    "stage": "a raised wooden stage floor behind a curtain",
    "ward": "the paved ground of an officials' ward",
    "city": "the paved ground of the city",
}

# line kinds: walkable or not, and whether they block sight
LINE_KINDS = {"road": (True, False), "path": (True, False), "bridge": (True, False), "gallery": (True, False),
              "river": (False, False), "stream": (False, False), "wall": (False, True), "wall.city": (False, True),
              "wall.lattice": (False, False), "curtain": (True, True)}
# zone kinds: walkable or not
ZONE_KINDS = {"water": False, "cliff": False, "hills": False, "field": True, "field.wheat": True, "market": True,
              "ward": True, "city": True, "plateau": True, "court": True, "garden": True, "passage": True,
              "camp": True, "loess": True, "plain": True, "stage": True, "floor": True}

# ---------------------------------------------------------------------------------------------
# A room inside a building: its own small map (cell 2: two tiles), walls round the edge, a door.
def room(grid, door, things=(), spots=(), lines=(), ground=(), floor="stone", exits=()):
    w, h = grid
    gates = {"door": door, **{f"to-{e['to']}": e["at"] for e in exits}}
    return {"grid": [w, h], "cell": 2, "margin": 0, "floor": floor,
            "ground": [{"id": "floor", "kind": "floor", "rect": [1, 1, w - 2, h - 2]}, *ground],
            "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, w, h], "width": 1, "gates": gates}, *lines],
            "things": list(things), "spots": list(spots), "exits": list(exits), "entries": {"": door}}


PLANS2 = {
    # =========================================================================================
    "Chang'an": {
        "archetype": "city",
        "banners": "black",          # the Chancellor's banners; red (Han) from state "after"
        "plan": {
            "grid": [17, 17], "cell": 4, "margin": 1,
            "ground": [
                {"id": "farewell", "kind": "field", "rect": [8, 1, 4, 2]},            # outside the north wall
                {"id": "wheat-n", "kind": "field.wheat", "rect": [13, 1, 3, 2]},
                {"id": "city", "kind": "city", "rect": [2, 4, 13, 12]},
                {"id": "markets", "kind": "market", "rect": [2, 4, 13, 2]},
                {"id": "ward", "kind": "ward", "rect": [2, 6, 13, 5]},
                {"id": "plateau", "kind": "plateau", "rect": [2, 12, 13, 4], "raised": True},   # Longshou: the palace stands high
            ],
            "lines": [
                {"id": "wei", "kind": "river", "path": [[0, 0], [16, 0]], "width": 4},
                {"id": "wall", "kind": "wall.city", "outline": [1, 3, 15, 14], "width": 2,
                 "gates": {"hengmen-gate": [6, 3], "xuanping-gate": [15, 5]}},
                {"id": "west-road", "kind": "road", "path": [[0, 2], [6, 2]], "width": 3},
                {"id": "avenue", "kind": "road", "path": [[6, 2], [6, 11]], "width": 4,   # Heng Gate to the North Side Gate
                 "lanes": [1, 2, 1], "middle": "the emperor's lane: no one walks it"},
                {"id": "market-street", "kind": "road", "path": [[2, 5], [15, 5]], "width": 3},
                {"id": "ward-street", "kind": "road", "path": [[2, 9], [14, 9]], "width": 3},
                {"id": "west-lane", "kind": "road", "path": [[2, 5], [2, 9]], "width": 2},   # loops: no dead ends
                {"id": "east-lane", "kind": "road", "path": [[14, 5], [14, 11]], "width": 2},
                {"id": "palace-lane", "kind": "road", "path": [[2, 11], [14, 11]], "width": 2},   # along the foot of the terrace
            ],
            "things": [
                # outside the walls
                {"id": "hengmen", "kind": "camp.banquet", "rect": [9, 1, 3, 1], "label": "The farewell banquet outside the Heng Gate"},
                {"id": "ridge", "kind": "landmark.ridge", "rect": [2, 1, 2, 1], "label": "An earthen ridge above the west road"},
                # the markets: shops face south onto the market street
                {"id": "jeweller", "kind": "building.shop", "rect": [2, 4, 2, 1], "door": "S", "label": "The jeweller's",
                 "map": "jeweller"},
                {"id": "wineshop", "kind": "building.shop", "rect": [4, 4, 2, 1], "door": "S", "label": "A wine shop"},
                {"id": "teahouse", "kind": "building.shop", "rect": [7, 4, 2, 1], "door": "S", "label": "A teahouse",
                 "map": "teahouse", "plaque": "茶肆"},
                {"id": "market-tower", "kind": "building.markettower", "rect": [9, 4, 2, 1], "label": "The market tower",
                 "note": "a Han 市楼: two storeys, a flag and a drum; seen from all over the north of the city"},
                {"id": "gotable", "kind": "furniture.gotable", "rect": [13, 4, 1, 1], "label": "The market go table"},
                {"id": "stalls", "kind": "market.stalls", "rect": [11, 4, 2, 1]},
                # the officials' ward: compounds face south onto the ward street
                {"id": "wangyun", "kind": "building.compound", "rect": [3, 6, 3, 3], "door": "S", "label": "Wang Yun's residence",
                 "map": "wangyun", "plaque": "王府"},
                {"id": "xiangfu", "kind": "building.compound", "rect": [8, 6, 4, 3], "door": "S", "label": "The Chancellor's residence",
                 "map": "xiangfu", "plaque": "相府", "open_to": ["diaochan"],
                 "refuse": ["The gatekeeper bars the way. “The Grand Preceptor receives no one today.”"]},
                {"id": "lubu", "kind": "building.compound", "rect": [12, 6, 2, 3], "door": "S", "label": "Lü Bu's quarters",
                 "map": "lubu", "plaque": "吕府"},
                {"id": "shisun", "kind": "building.house", "rect": [2, 10, 2, 1], "door": "S", "label": "Shisun Rui's house", "plaque": "士孙府",
                 "node": "2-a12a"},
                {"id": "huangwan", "kind": "building.house", "rect": [4, 10, 2, 1], "door": "S", "label": "Huang Wan's house", "plaque": "黄府",
                 "node": "2-a12b"},
                {"id": "caiyong", "kind": "building.house", "rect": [8, 10, 2, 1], "door": "S", "label": "Cai Yong's house", "map": "caiyong", "plaque": "蔡府"},
                {"id": "house-2", "kind": "building.house", "rect": [10, 10, 2, 1], "door": "S"},
                {"id": "house-3", "kind": "building.house", "rect": [12, 10, 2, 1], "door": "S"},
                # the palace on its plateau
                {"id": "palace", "kind": "building.palace", "rect": [3, 12, 7, 4], "door": "N", "label": "Weiyang Palace",
                 "map": "palace", "gate_label": "The North Side Gate", "plaque": "北掖门"},
                {"id": "changle", "kind": "building.palace", "rect": [11, 12, 3, 3], "label": "Changle Palace", "note": "roofs only: not enterable"},
                {"id": "xuanping", "kind": "building.gatetower", "rect": [15, 5, 1, 2], "label": "The Xuanping Gate tower",
                 "door": "W", "map": "xuanping-top", "open_to": ["node:a17"],
                 "refuse": ["The guards at the stair cross their halberds. “No one goes up to the Son of Heaven's tower.”"]},
            ],
            "spots": [
                {"id": "a1", "at": [10, 2], "node": "2-a1", "label": "The farewell banquet", "trigger": "near"},
                {"id": "a3", "at": [13, 9], "at_door": "lubu", "node": "2-a3", "label": "Lü Bu's gate", "trigger": "talk"},
                {"id": "a6", "at": [6, 7], "node": "2-a6", "label": "Between the red lanterns", "trigger": "near"},
                {"id": "a11", "at": [3, 1], "node": "2-a11", "label": "Lü Bu on the ridge", "trigger": "near", "on": "ridge"},
                {"id": "market", "at": [6, 5], "node": "2-a15", "label": "The market crossroads", "trigger": "near"},
                {"id": "a13d", "at": [6, 8], "node": "2-a13d", "label": "The street before the palace", "trigger": "near"},
                {"id": "north-gate", "at": [6, 11], "node": "2-a14", "label": "The North Side Gate", "trigger": "near"},
                {"id": "xuanping-foot", "at": [14, 5], "label": "The foot of the Xuanping Gate tower", "note": "the stair up to the tower top (A18)"},
                {"id": "qingsuo", "at": [7, 11], "node": "2-a18p", "label": "The palace steps", "note": "Lü Bu's plea outside the Qingsuo Gate"},
            ],
            "props": [   # on the lines layer: claim no cell
                {"kind": "landmark.hitchingpost", "at": [10, 9], "in": ["capital"], "label": "Lü Bu's horse, tied at the gate", "note": "A9: the clue that gives him away",
                 "when": "node:a8", "until": "node:a9"},
                {"kind": "prop.lanterns", "along": "avenue", "from": [6, 3], "to": [6, 9], "in": ["night-a6"]},
                {"kind": "prop.body_lamp", "at": [6, 5], "in": ["after"]},
            ],
            "dress": [   # how the generator should dress it
                {"kind": "tree.willow", "along": "avenue", "every": 3, "both_sides": True},
                {"kind": "tree.willow", "along": "ward-street", "every": 4},
                {"kind": "lamp.post", "along": "market-street", "every": 4},
                {"kind": "tree.poplar", "along": "west-road", "every": 3},
                {"kind": "banner", "at_gates": True},
                {"kind": "banner.black", "at_door": "xiangfu", "pair": True},     # the Chancellor's black banners
                {"kind": "prop.lanterns", "at_door": "wangyun", "pair": True},    # Wang Yun's red lanterns
                {"kind": "furn.rack", "at_door": "lubu"},                         # a weapon rack at the soldier's gate
                {"kind": "banner.red", "at_door": "palace", "pair": True},
            ],
            "exits": [{"to": "Meiwu Road", "at": [0, 2], "side": "W"}],
            "entries": {"": [6, 4], "Meiwu Road": [1, 2]},
        },
        "states": [
            {"id": "capital", "light": "day"},
            {"id": "night-a2", "when": "node:a1", "until": "node:a2", "light": "night"},
            {"id": "night-a6", "when": "node:a5", "until": "node:a6", "light": "lantern"},
            {"id": "away", "when": "node:a10", "until": "node:a13", "light": "day",   # Dong Zhuo has taken her to Meiwu
             "exits_closed": ["xiangfu"],
             "exits_closed_say": {"xiangfu": ["The gatekeeper shakes his head. “The Grand Preceptor has gone back to Meiwu.”"]}},
            {"id": "gate-day", "when": "node:a13c", "until": "node:a14", "light": "day", "weather": "clear"},
            {"id": "after", "when": "node:a14", "until": "node:a16", "light": "day", "banners": "red"},
            {"id": "sack", "when": "node:a17", "light": "dusk", "weather": "smoke", "exits_open": ["xuanping"]},
        ],
        "maps": {
            # ---- Wang Yun's residence: a three-court compound, gate south, garden north --------------
            "wangyun": {
                "grid": [14, 22], "cell": 2, "margin": 0,
                "ground": [
                    {"id": "front-court", "kind": "court", "rect": [1, 17, 12, 4]},
                    {"id": "passage-w", "kind": "passage", "rect": [1, 14, 3, 3]},
                    {"id": "passage-e", "kind": "passage", "rect": [10, 14, 3, 3]},
                    {"id": "middle-court", "kind": "court", "rect": [1, 12, 12, 2]},
                    {"id": "rear-w", "kind": "passage", "rect": [3, 9, 1, 3]},
                    {"id": "rear-e", "kind": "passage", "rect": [10, 9, 1, 3]},
                    {"id": "wy-garden", "kind": "garden", "rect": [1, 1, 12, 7]},
                    {"id": "pond", "kind": "water", "at": [5, 2], "mask": [".##.", "####", ".##."]},
                ],
                "lines": [
                    {"id": "walls", "kind": "wall", "outline": [0, 0, 14, 22], "width": 1, "gates": {"gate": [6, 21]}},
                    {"id": "garden-wall", "kind": "wall", "path": [[1, 8], [12, 8]], "width": 1, "gates": {"moongate": [3, 8]}},
                    {"id": "path-1", "kind": "path", "path": [[3, 7], [3, 4]], "width": 1},
                    {"id": "path-2", "kind": "path", "path": [[3, 5], [9, 5], [9, 4], [11, 4]], "width": 1},
                ],
                "things": [
                    {"id": "screenwall", "kind": "garden.screenwall", "rect": [6, 19, 2, 1], "label": "The spirit screen"},
                    {"id": "wy-hall", "kind": "building.hall_grand", "rect": [4, 14, 6, 3], "door": "S", "label": "The front hall",
                     "map": "wy-hall"},
                    {"id": "wing-w", "kind": "building.wing", "rect": [1, 9, 2, 3], "door": "S", "label": "The maids' rooms"},
                    {"id": "wy-rearhall", "kind": "building.hall_grand", "rect": [4, 9, 6, 3], "door": "S", "label": "The rear hall",
                     "map": "wy-rearhall"},
                    {"id": "wing-e", "kind": "building.wing", "rect": [11, 9, 2, 3], "door": "S", "label": "The stores"},
                    {"id": "peony", "kind": "building.pavilion", "rect": [2, 2, 2, 2], "door": "S", "label": "The peony pavilion"},
                    {"id": "wy-pavilion", "kind": "building.pavilion_painted", "rect": [10, 2, 2, 2], "door": "S",
                     "label": "The painted pavilion"},
                    {"id": "trellis", "kind": "garden.trellis", "rect": [4, 6, 2, 1], "label": "The 荼蘼 trellis"},
                    {"id": "rockery", "kind": "garden.rockery", "rect": [10, 6, 1, 1]},
                ],
                "spots": [
                    {"id": "a2", "at": [3, 4], "node": "2-a2", "label": "The peony pavilion", "trigger": "near"},
                ],
                "dress": [{"kind": "plant.peony", "in": "wy-garden", "near": "peony"}, {"kind": "tree.willow", "in": "wy-garden", "count": 3},
                          {"kind": "plant.flower", "in": "wy-garden", "count": 8}],
                "exits": [{"to": "Chang'an", "at": [6, 21], "side": "S"}],
            },
            # ---- the Chancellor's residence: Diaochan's stealth space ----------------------------------
            "xiangfu": {
                "grid": [18, 22], "cell": 2, "margin": 0,
                "ground": [
                    {"id": "front-court", "kind": "court", "rect": [1, 17, 16, 4]},
                    {"id": "inner-court", "kind": "court", "rect": [1, 11, 16, 2]},
                    {"id": "bedroom-step", "kind": "passage", "rect": [12, 16, 3, 1]},   # in front of the bedchamber, to the east passage   # keeps the gallery clear of the halls' roofs
                    {"id": "passage-w", "kind": "passage", "rect": [4, 13, 1, 4]},
                    {"id": "passage-e", "kind": "passage", "rect": [11, 13, 1, 4]},
                    {"id": "pond-court", "kind": "court", "rect": [15, 13, 2, 3]},
                    {"id": "xf-garden", "kind": "garden", "rect": [1, 1, 16, 9]},
                    {"id": "lotus", "kind": "water", "at": [8, 2], "mask": [".######.", "########", "########", "#######.", ".#####.."]},
                    {"id": "window-pond", "kind": "water", "rect": [16, 14, 1, 1]},
                ],
                "lines": [
                    {"id": "walls", "kind": "wall", "outline": [0, 0, 18, 22], "width": 1,
                     "gates": {"gate": [8, 21], "garden-gate": [17, 5]}},
                    {"id": "gallery", "kind": "gallery", "path": [[1, 10], [16, 10]], "width": 2,
                     "sides": "wall.lattice", "label": "The covered gallery"},
                    {"id": "flower-path", "kind": "path", "path": [[2, 9], [2, 7], [6, 7], [6, 8], [10, 8], [10, 7], [12, 7]], "width": 1},
                    {"id": "bridge", "kind": "bridge", "path": [[12, 7], [12, 5]], "width": 1, "zigzag": True},
                ],
                "things": [
                    {"id": "xf-hall", "kind": "building.hall_grand", "rect": [5, 13, 6, 4], "doors": ["S", "N"],
                     "label": "The middle hall", "map": "xf-hall"},
                    {"id": "wing-w", "kind": "building.wing", "rect": [1, 13, 3, 3], "door": "N", "label": "The maids' rooms"},
                    {"id": "xf-bedroom", "kind": "building.wing", "rect": [12, 13, 3, 3], "door": "S", "label": "Dong Zhuo's bedchamber",
                     "map": "xf-bedroom", "window": "E"},
                    {"id": "phoenix", "kind": "building.pavilion", "rect": [11, 3, 2, 2], "on": "water", "door": "S",
                     "label": "The Phoenix Pavilion"},
                    {"id": "rockery", "kind": "garden.rockery", "rect": [3, 5, 2, 2], "label": "A rockery", "note": "cover beside the path"},
                    {"id": "willow-1", "kind": "tree.willow", "rect": [3, 8, 1, 1]},
                    {"id": "willow-2", "kind": "tree.willow", "rect": [5, 6, 1, 1]},
                    {"id": "willow-3", "kind": "tree.willow", "rect": [8, 9, 1, 1]},
                    {"id": "willow-4", "kind": "tree.willow", "rect": [13, 8, 1, 1]},
                    {"id": "halberds", "kind": "furn.rack", "rect": [14, 18, 1, 1], "label": "A halberd rack"},
                    {"id": "plant-e", "kind": "furn.plant", "rect": [11, 16, 1, 1], "label": "A potted plum", "note": "the niche behind it is always safe"},
                ],
                "spots": [
                    {"id": "a9", "at": [12, 5], "node": "2-a9", "label": "The Phoenix Pavilion", "trigger": "near"},
                    {"id": "collision", "at": [16, 5], "label": "The garden gate", "note": "Dong Zhuo runs into Li Ru here, at the end of A9"},
                ],
                "dress": [{"kind": "plant.flower", "along": "flower-path", "every": 1}, {"kind": "water.lotus", "in": "lotus"}],
                "exits": [{"to": "Chang'an", "at": [8, 21], "side": "S"}],
                # stealth: who watches where, in Diaochan's states. A beat is a path of cells; "pause" in seconds.
                "watchers": [
                    {"id": "maid-1", "kind": "folk.maiden", "beat": [[2, 10], [7, 10], [7, 10], [2, 10]], "shape": "U", "pause": [7, 10, 3],
                     "cone": 4, "in_beats": ["2-a9"], "seen": "maid", "back_to": "xf-bedroom"},
                    {"id": "maid-2", "kind": "folk.maiden", "beat": [[15, 10], [9, 10], [9, 10], [15, 10]], "shape": "U", "pause": [9, 10, 3],
                     "cone": 4, "in_beats": ["2-a9"], "seen": "maid", "back_to": "xf-bedroom"},
                    {"id": "steward", "kind": "folk.official", "beat": [[9, 7], [11, 7], [9, 7]], "shape": "U", "pause": [11, 7, 2],
                     "cone": 5, "in_beats": ["2-a9"], "seen": "steward", "back_to": "xf-bedroom"},
                    {"id": "guard-1", "kind": "folk.soldier", "at": [6, 19], "face": "N", "cone": 6, "in_beats": ["2-a7", "2-a7c", "2-a8", "2-a9", "2-a10"]},
                    {"id": "guard-2", "kind": "folk.soldier", "at": [11, 19], "face": "N", "cone": 6, "in_beats": ["2-a7", "2-a7c", "2-a8", "2-a9", "2-a10"]},
                ],
                "checks": [   # play checks the generated details must pass (places-notes.md, request 6)
                    {"check": "covered_route", "from": [13, 16], "to": [12, 5], "beats": ["2-a9"], "must_wait": True},
                    {"check": "safe_spot", "in": ["passage-e", "xf-garden"]},
                ],
            },
            "lubu": {
                "grid": [8, 12], "cell": 2, "margin": 0,
                "ground": [{"id": "yard", "kind": "court", "rect": [1, 6, 6, 5]}],
                "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, 8, 12], "width": 1, "gates": {"gate": [3, 11]}}],
                "things": [
                    {"id": "lubu-house", "kind": "building.hall_grand", "rect": [1, 1, 5, 3], "door": "S", "label": "Lü Bu's hall", "map": "lubu-hall"},
                    {"id": "stable", "kind": "building.wing", "rect": [4, 6, 3, 2], "door": "W", "label": "The stable", "note": "Red Hare is here"},
                    {"id": "rack", "kind": "furn.rack", "rect": [1, 7, 1, 1]},
                ],
                "exits": [{"to": "Chang'an", "at": [3, 11], "side": "S"}],
            },
            "palace": {   # behind the North Side Gate: the gate court, round the halls by the side passages to their south fronts
                "grid": [16, 15], "cell": 2, "margin": 0,
                "ground": [{"id": "gate-court", "kind": "court", "rect": [1, 1, 14, 4]},
                           {"id": "passages", "kind": "passage", "rect": [1, 5, 14, 5]},     # either side of the halls
                           {"id": "front-court", "kind": "court", "rect": [1, 10, 14, 4]}],
                "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, 16, 15], "width": 1, "gates": {"north-gate": [7, 0]}}],
                "things": [
                    # halls face south, as halls do: you come in at the back by the North Side Gate and walk round to the front
                    {"id": "dutang", "kind": "building.hall_grand", "rect": [3, 5, 7, 4], "door": "S", "label": "The great hall of state",
                     "map": "dutang"},
                    {"id": "side-hall", "kind": "building.wing", "rect": [11, 6, 2, 3], "door": "S", "label": "The emperor's side hall",
                     "map": "side-hall"},
                ],
                "spots": [
                    {"id": "inside-gate", "at": [7, 2], "label": "Inside the North Side Gate", "note": "A14 starts at the gate on the city map and plays on in here"},
                    {"id": "li-ru", "at": [9, 2], "label": "The gate court", "note": "A15: Li Ru is brought in bound"},
                ],
                "exits": [{"to": "Chang'an", "at": [7, 0], "side": "N"}],
                "watchers": [   # A12c: reaching the emperor unseen past Dong Zhuo's eunuchs, down a side passage
                    {"id": "eunuch-1", "kind": "folk.official", "beat": [[2, 11], [13, 11], [2, 11]], "shape": "U", "pause": [13, 11, 2], "cone": 4,
                     "in_beats": ["2-a12c"], "seen": "eunuch", "back_to": "north-gate"},
                    {"id": "eunuch-2", "kind": "folk.official", "beat": [[10, 2], [10, 9], [10, 2]], "shape": "U", "pause": [10, 2, 2], "cone": 4,
                     "in_beats": ["2-a12c"], "seen": "eunuch", "back_to": "north-gate"},
                ],
                "checks": [{"check": "covered_route", "from": [7, 1], "to": [12, 9], "beats": ["2-a12c"], "must_wait": True},
                           {"check": "safe_spot", "in": ["passages"]}],
            },
            # ---- rooms: each a small map of its own ----------------------------------------------------
            "wy-hall": room([12, 7], [6, 6],
                            things=[{"id": "dais", "kind": "furn.dais", "rect": [5, 1, 2, 1]},
                                    {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 2, 1]},
                                    {"id": "table-2", "kind": "furn.table", "rect": [7, 3, 2, 1]}],
                            ground=[{"id": "stage", "kind": "stage", "rect": [9, 1, 2, 3]}],
                            lines=[{"id": "curtain", "kind": "curtain", "path": [[9, 1], [9, 4]], "width": 1}],
                            spots=[{"id": "a5", "at": [6, 4], "node": "2-a5", "label": "The second banquet"}]),
            "wy-rearhall": room([12, 7], [6, 6],
                                things=[{"id": "screen", "kind": "furn.screen", "rect": [1, 2, 1, 2], "label": "A painted screen hiding a door"},
                                        {"id": "chest", "kind": "furn.chest", "rect": [10, 1, 1, 1], "label": "The family chest"},
                                        {"id": "table-1", "kind": "furn.table", "rect": [4, 2, 2, 1]},
                                        {"id": "table-2", "kind": "furn.table", "rect": [7, 2, 2, 1]}],
                                spots=[{"id": "a4", "at": [6, 4], "node": "2-a4", "label": "The first banquet"}],
                                exits=[{"to": "wy-secret", "at": [0, 1], "side": "W", "behind": "screen"}]),
            "wy-secret": room([10, 6], [9, 3], floor="wood",
                              things=[{"id": "lamp", "kind": "furn.lamp", "rect": [4, 1, 1, 1]},
                                      {"id": "table", "kind": "furn.table", "rect": [4, 2, 2, 1]},
                                      {"id": "seat-lubu", "kind": "furn.seat", "rect": [3, 3, 1, 1], "when": "node:a11"},
                                      {"id": "seat-shisun", "kind": "furn.seat", "rect": [6, 3, 1, 1], "when": "node:a12a"},
                                      {"id": "seat-huang", "kind": "furn.seat", "rect": [6, 1, 1, 1], "when": "node:a12b"},
                                      {"id": "seat-lisu", "kind": "furn.seat", "rect": [3, 1, 1, 1], "when": "node:a12c"}],
                              spots=[{"id": "secret", "at": [5, 4], "node": "2-a12p", "label": "The secret room"},
                                     {"id": "a12", "at": [7, 4], "node": "2-a12", "label": "Li Su"}]),
            "xf-hall": room([14, 8], [7, 7],
                            things=[{"id": "dais", "kind": "furn.dais", "rect": [6, 1, 2, 1], "label": "Dong Zhuo's seat"},
                                    {"id": "table", "kind": "furn.table", "rect": [6, 3, 2, 1]},
                                    {"id": "sword", "kind": "furn.swordwall", "rect": [10, 1, 1, 1], "label": "A sword on the wall"},
                                    {"id": "rack", "kind": "furn.rack", "rect": [11, 1, 2, 1]}],
                            ground=[{"id": "behind-curtain", "kind": "stage", "rect": [1, 1, 1, 5]}],
                            lines=[{"id": "curtain", "kind": "curtain", "path": [[2, 1], [2, 3]], "width": 1}],
                            spots=[{"id": "a10", "at": [9, 4], "node": "2-a10", "label": "The sword on the wall"},
                                   {"id": "curtain", "at": [1, 4], "node": "2-a7c", "label": "Behind the curtain",
                                    "sight": {"seen_by": "lubu", "unseen_by": "dongzhuo"}}],
                            exits=[{"to": "gallery", "at": [4, 0], "side": "N"}]),
            "xf-bedroom": room([10, 7], [5, 6],
                               things=[{"id": "bed", "kind": "furn.bed", "rect": [2, 3, 3, 2]},
                                       {"id": "window", "kind": "furn.window", "rect": [8, 2, 1, 1], "label": "The window over the pond"},
                                       {"id": "mirror", "kind": "furn.drawers", "rect": [8, 4, 1, 1], "label": "A dressing table"}],
                               spots=[{"id": "a7", "at": [7, 2], "node": "2-a7", "label": "The window"},
                                      {"id": "a8", "at": [3, 2], "node": "2-a8", "label": "Behind the bed"}]),
            "lubu-hall": room([12, 7], [6, 6], floor="wood",
                              things=[{"id": "rack", "kind": "furn.rack", "rect": [1, 1, 2, 1]},
                                      {"id": "table", "kind": "furn.table", "rect": [5, 2, 2, 1]}],
                              spots=[{"id": "a6-house", "at": [6, 4], "label": "Lü Bu's house", "note": "A6 plays on in here after the lanterns"}]),
            # ---- the teahouse: a public tea room, and a scholar's study behind its curtain (Talk with Claude) ----
            "teahouse": room([10, 7], [5, 6], floor="wood",
                             things=[{"id": "counter", "kind": "furn.counter", "rect": [1, 1, 2, 1], "label": "The tea counter"},
                                     {"id": "jar-1", "kind": "furn.jar", "rect": [3, 1, 1, 1]},
                                     {"id": "lamp", "kind": "furn.lamp", "rect": [6, 1, 1, 1]},
                                     {"id": "table-1", "kind": "furn.table", "rect": [2, 3, 1, 1]},
                                     {"id": "table-2", "kind": "furn.table", "rect": [4, 3, 1, 1]},
                                     {"id": "table-3", "kind": "furn.table", "rect": [6, 3, 1, 1]},
                                     {"id": "stool-1", "kind": "furn.stool", "rect": [2, 4, 1, 1]},
                                     {"id": "stool-2", "kind": "furn.stool", "rect": [6, 4, 1, 1]},
                                     {"id": "plant", "kind": "furn.plant", "rect": [1, 5, 1, 1]}],
                             exits=[{"to": "claude-study", "at": [8, 0], "side": "N"}]),
            "claude-study": room([8, 6], [4, 5], floor="wood",   # as Book 90's study (tools/tk_plans_w90.py)
                                 things=[{"id": "shelf-1", "kind": "furn.shelf", "rect": [1, 1, 1, 1], "label": "Bookshelves"},
                                         {"id": "shelf-2", "kind": "furn.shelf", "rect": [2, 1, 1, 1]},
                                         {"id": "window-w", "kind": "furn.window", "rect": [3, 1, 1, 1]},
                                         {"id": "window-e", "kind": "furn.window", "rect": [5, 1, 1, 1]},
                                         {"id": "shelf-3", "kind": "furn.shelf", "rect": [6, 1, 1, 1]},
                                         {"id": "desk", "kind": "furn.computer", "rect": [4, 2, 1, 1], "label": "The scholar's desk"},
                                         {"id": "desk-w", "kind": "furn.computer", "rect": [1, 2, 1, 1]},
                                         {"id": "desk-e", "kind": "furn.computer", "rect": [6, 2, 1, 1]},
                                         {"id": "gotable", "kind": "furniture.gotable", "rect": [1, 3, 1, 1], "label": "A go board on a low table"},
                                         {"id": "stool", "kind": "furn.stool", "rect": [2, 3, 1, 1]},
                                         {"id": "rug", "kind": "furn.rug", "rect": [3, 3, 2, 1]},
                                         {"id": "lamp", "kind": "furn.lamp", "rect": [6, 3, 1, 1]},
                                         {"id": "plant-w", "kind": "furn.plant", "rect": [1, 4, 1, 1]},
                                         {"id": "plant-e", "kind": "furn.plant", "rect": [6, 4, 1, 1]}],
                                 spots=[{"id": "claude", "at": [4, 3], "label": "The scholar's desk", "trigger": "talk",
                                         "note": "the talk spot: for apo110 the engine opens Talk with Claude (opts.onTalkTo)"}])
                            | {"label": "The back room"},
            "jeweller": room([10, 6], [5, 5], floor="wood",
                             things=[{"id": "bench", "kind": "furn.counter", "rect": [3, 1, 3, 1], "label": "The workbench"},
                                     {"id": "lamp", "kind": "furn.lamp", "rect": [7, 1, 1, 1]}]),
            "dutang": room([16, 8], [8, 0],
                           things=[{"id": "dais", "kind": "furn.dais", "rect": [7, 5, 2, 1]},
                                   {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 2, 1]},
                                   {"id": "table-2", "kind": "furn.table", "rect": [11, 3, 2, 1]}],
                           spots=[{"id": "a15c", "at": [8, 3], "node": "2-a15c", "label": "The victory feast"}]),
            "caiyong": room([10, 7], [5, 6], floor="wood",
                            things=[{"id": "slips-1", "kind": "furn.shelf", "rect": [1, 1, 2, 1], "label": "Bamboo-slip books"},
                                    {"id": "slips-2", "kind": "furn.shelf", "rect": [7, 1, 2, 1], "label": "Bamboo-slip books"},
                                    {"id": "gotable", "kind": "furniture.gotable", "rect": [4, 2, 1, 1], "label": "Cai Yong's go table"},
                                    {"id": "qin", "kind": "furn.qin", "rect": [7, 4, 2, 1], "label": "A qin with a scorched tail"}],
                            spots=[{"id": "a12y", "at": [5, 3], "node": "2-a12y", "label": "Cai Yong's study"}]),
            # the top of the Xuanping Gate tower: battlements over the armies, the Son of Heaven behind (A18)
            "xuanping-top": room([12, 6], [6, 5],
                                 things=[{"id": "banner-1", "kind": "banner.red", "rect": [2, 1, 1, 1]},
                                         {"id": "banner-2", "kind": "banner.red", "rect": [9, 1, 1, 1]},
                                         {"id": "brazier", "kind": "furn.lamp", "rect": [6, 1, 1, 1]}],
                                 spots=[{"id": "a18", "at": [6, 2], "node": "2-a18", "label": "The Xuanping Gate tower"}]),
            "side-hall": room([10, 6], [5, 0],
                              things=[{"id": "seat", "kind": "furn.dais", "rect": [4, 3, 2, 1], "label": "The boy emperor"}],
                              spots=[{"id": "a12c", "at": [5, 2], "node": "2-a12c", "label": "The secret edict"}]),
        },
        "npcs": [
            # important people stand still at gates and crossroads; lines change with the state
            {"kind": "folk.soldier", "at": [7, 5], "face": "W", "in": ["capital", "night-a2", "night-a6", "away"],
             "say": "“Keep to the side lanes. The middle of the avenue is the Son of Heaven's. And the Grand Preceptor's.”"},
            {"kind": "folk.villager", "at": [5, 6], "in": ["capital", "away"],
             "say": "“Two hundred and fifty thousand of us built it. Walls as high as these. Twenty years of grain inside, they say.”"},
            {"kind": "folk.woman", "near": "stalls", "in": ["capital", "away"],
             "say": "“They drove us west from Luoyang like geese. My house is ash, and here I sell turnips.”"},
            {"kind": "folk.official", "near": "wineshop", "in": ["capital", "away"], "when": "node:a1",
             "say": "“He laughed, and went on eating. I couldn't hold my chopsticks. I still can't, some days.”"},
            {"kind": "folk.child", "near": "markets", "in": ["capital"], "say": "“Mother says don't look at the soldiers with the long halberds.”"},
            # the pearls and the crown: the steward by the family chest, the jeweller at his bench (inside their rooms)
            {"kind": "folk.elder", "place": "wy-rearhall", "at": [9, 2], "face": "up",
             "say": "“The master hasn't slept. He walks the garden and sighs.”",
             "gives": "pearls", "gives_when": "node:a2",
             "give": ["The old steward unlocks the family chest. “The pearls your father kept, master. Whatever you need them for, I never saw.”"],
             "given": ["“The chest is locked again, master. No one will know.”"]},
            # the teahouse, in every state: no quests here
            {"kind": "folk.villager", "place": "teahouse", "at": [2, 2], "face": "S",
             "say": "“Tea, sir? The spring leaves came up from Shu this week.”"},
            {"kind": "folk.elder", "place": "teahouse", "at": [3, 4], "face": "E",
             "say": "“Thirty years I've drunk tea in this room. Chancellors come and go; the tea stays the same.”"},
            {"kind": "folk.official", "place": "teahouse", "at": [7, 3], "face": "W",
             "say": "“The back room? Some scholar rents it. Writes all day and hardly says a word.”"},
            # behind the curtain: Clawd at his desk (who "claude"); apo110 talks with Claude, anyone else gets this line
            {"id": "claude", "kind": "hero.claude", "place": "claude-study", "at": [4, 1], "behind": "desk", "face": "S", "label": "Claude",
             "say": "The scholar is lost in his scrolls."},
            {"kind": "folk.noble", "place": "jeweller", "at": [4, 2], "face": "down",
             "say": "“Pearls like these, Minister? Set in gold, they'd crown a general.”", "gives": "crown", "gives_when": "item:pearls",
             "give": ["“Pearls from your own house, Minister? Then the crown will be the best thing I ever made.”"],
             "given": ["“That crown was the best work of my life. I hope it went to someone worth it.”"]},
            {"kind": "folk.soldier", "near": "xiangfu", "face": "S", "in": ["capital", "night-a2", "night-a6"],
             "say": "“The Grand Preceptor receives no one today.”",
             "watch": {"beat": [[8, 9], [12, 9], [8, 9]], "shape": "U", "pause": [12, 9, 2], "cone": 3, "in_beats": ["2-a3"],
                       "seen": ["“Minister Wang? Out with a parcel? The Grand Preceptor likes to know what his ministers carry.”"],
                       "back_to": "market"}},
            {"kind": "folk.soldier", "near": "lubu", "in": ["capital"],
             "say": "“In Liangzhou we ride before we walk. These Chang'an streets are too narrow for a horse to stretch.”"},
            {"kind": "folk.villager", "at": [6, 6], "in": ["night-a2", "night-a6"],
             "say": "“Second watch, and all's well. Keep your lantern lit, sir. The Liangzhou patrols take a dark street for a guilty one.”"},
            {"kind": "folk.maiden", "near": "wangyun", "in": ["night-a6", "capital"], "when": "node:a5", "until": "node:a10",
             "say": "“They say Lady Diaochan went in the covered carriage, straight to the Grand Preceptor's.”"},
            {"kind": "folk.villager", "near": "stalls", "in": ["away"], "say": "“The Grand Preceptor's at Meiwu. The streets breathe again.”"},
            {"kind": "folk.soldier", "at": [5, 3], "in": ["away"], "say": "“General Lü stood on that ridge till the dust was gone. Didn't say a word.”"},
            {"kind": "folk.official", "at": [5, 7], "in": ["gate-day"],
             "say": "“The Son of Heaven is recovered from his illness! All officials to the Weiyang Hall!”"},
            {"kind": "folk.official", "at": [7, 9], "in": ["gate-day"], "say": "“Why are we all wearing swords to a celebration?”"},
            {"kind": "folk.villager", "at": [7, 6], "in": ["after"], "say": "“Sell the coat! Buy wine! The old traitor is dead!”"},
            {"kind": "folk.villager", "at": [5, 5], "in": ["after"], "say": "“That one's for my brother, who died on the road from Luoyang.”"},
            {"kind": "folk.child", "near": "markets", "in": ["after"], "say": "“Ten thousand years! Ten thousand years!”"},
            {"kind": "folk.official", "near": "wineshop", "in": ["after"], "say": "“I held a cup today. My hand didn't shake once.”"},
            {"kind": "folk.villager", "at": [8, 5], "in": ["sack"], "say": "“The Liangzhou men are inside! Li Meng and Wang Fang opened the gates!”"},
            {"kind": "folk.woman", "at": [12, 5], "in": ["sack"], "say": "“East! Get to the Xuanping Gate, the Son of Heaven is there!”"},
            {"kind": "folk.villager", "at": [5, 6], "in": ["sack"], "say": "“I built his walls. Now his men burn mine.”"},
            # inside the Chancellor's residence (Diaochan)
            {"kind": "folk.maiden", "place": "xiangfu", "at": [4, 14], "in_beats": ["2-a7"],
             "say": "“The Grand Preceptor spent the night with the new girl and hasn't got up.”"},
            {"kind": "folk.woman", "place": "xiangfu", "at": [2, 16], "say": "“Walk softly near the middle hall. He throws things when he's woken.”"},
            {"kind": "folk.soldier", "place": "xiangfu", "at": [8, 20], "say": "“The young mistress doesn't go out. The Grand Preceptor's orders.”"},
        ],
        "seen_lines": {
            "maid": ["“Mistress? You've lost your way. The Grand Preceptor likes to know where you are.”"],
            "steward": ["“The garden is cold this hour, mistress. Let me walk you back.”"],
            "eunuch": ["“Minister Wang, so far from the court? The Grand Preceptor will want to hear of it.”"],
        },
        "objectives": {
            "2-a1": "See the Grand Preceptor off: out through the Heng Gate, at the north end of the avenue, to the banquet tent.",
            "2-a2": "Go home to your residence, on the ward street just west of the avenue, and walk out into the rear garden.",
            "2-a3": "Take the crown to Lü Bu's gate, with the weapon rack, at the east end of the ward street, past the Chancellor's gate.",
            "2-a4": "Receive Lü Bu in the rear hall.",
            "2-a5": "Dance for the Grand Preceptor in the front hall.",
            "2-a6": "Ride home down the avenue, between the red lanterns.",
            "2-a7": "Go to the window.",
            "2-a7c": "Show yourself to Lü Bu behind the curtain, where the Grand Preceptor can't see.",
            "2-a8": "Nurse the Grand Preceptor.",
            "2-a9": "Meet Lü Bu at the Phoenix Pavilion, unseen.",
            "2-a10": "Answer the Grand Preceptor in the middle hall.",
            "2-a11": "Find Lü Bu on the earthen ridge above the west road, outside the Heng Gate.",
            "2-a12a": "Sound out Shisun Rui, on the lane at the foot of the palace terrace, at its west end.",
            "2-a12b": "Sound out Huang Wan, next door to Shisun Rui.",
            "2-a12p": "Return to the secret room in your residence.",
            "2-a12c": "Reach the Son of Heaven unseen: into the palace by the North Side Gate, at the south end of the avenue.",
            "2-a12": "Bring Li Su into the plan.",
            "2-a13d": "Escort the Grand Preceptor to the palace.",
            "2-a14": "Escort the Grand Preceptor's carriage down the avenue to the North Side Gate, the red gatehouse at its south end.",
            "2-a15": "Walk the city.",
            "2-a15c": "Go to the victory feast in the great hall of state, inside the palace.",
            "2-a18p": "Go to the palace steps, beside the North Side Gate.",
            "2-a18": "Go to the Son of Heaven at the Xuanping Gate, at the east end of the market street.",
            "2-a12y": "Call on Cai Yong, across the avenue from Huang Wan, near the palace steps.",
        },
    },
    # =========================================================================================
    "Meiwu Road": {
        "archetype": "road",
        "plan": {
            "grid": [36, 9], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills", "kind": "hills", "rect": [0, 8, 36, 1]},            # the Qinling foothills, the south edge
                {"id": "wheat-w", "kind": "field.wheat", "rect": [1, 6, 6, 2]},
                {"id": "plain", "kind": "plain", "rect": [17, 5, 8, 3]},             # open, treeless: the fog stop
                {"id": "wheat-e", "kind": "field.wheat", "rect": [26, 6, 9, 2]},
                {"id": "night-camp", "kind": "camp", "rect": [28, 4, 5, 2]},
            ],
            "lines": [
                {"id": "wei", "kind": "river", "path": [[0, 1], [11, 1], [11, 0], [24, 0], [24, 1], [35, 1]], "width": 4},
                {"id": "stream", "kind": "stream", "path": [[7, 1], [7, 7]], "width": 2},
                {"id": "road", "kind": "road", "path": [[0, 4], [9, 4], [9, 5], [16, 5], [16, 4], [27, 4], [27, 3], [35, 3]],
                 "width": 3},
            ],
            "things": [
                {"id": "post-10", "kind": "building.posthouse", "rect": [3, 2, 2, 2], "door": "S", "label": "The ten-li post"},
                {"id": "post-30", "kind": "building.posthouse", "rect": [11, 3, 2, 2], "door": "S", "label": "The thirty-li post"},
                {"id": "hamlet-1", "kind": "building.hut", "rect": [13, 6, 2, 1], "door": "N"},
                {"id": "hamlet-2", "kind": "building.hut", "rect": [15, 7, 2, 1]},
                {"id": "post-100", "kind": "building.posthouse", "rect": [21, 2, 2, 2], "door": "S", "label": "The hundred-li post"},
                {"id": "tent-dz", "kind": "building.tent", "rect": [30, 4, 2, 1], "label": "Dong Zhuo's tent"},
                {"id": "tent-2", "kind": "building.tent", "rect": [28, 5, 2, 1]},
            ],
            "spots": [
                {"id": "wheel", "at": [9, 5], "node": "2-a13a", "label": "The broken wheel", "trigger": "near"},
                {"id": "fog", "at": [20, 4], "node": "2-a13b", "label": "Wind and fog", "trigger": "near"},
                {"id": "fields", "at": [33, 7], "node": "2-a13c", "label": "Children singing in the fields", "trigger": "near"},
            ],
            "dress": [{"kind": "tree.poplar", "along": "road", "every": 2, "skip": "plain"},
                      {"kind": "tree.willow", "along": "stream", "every": 2}, {"kind": "milestone", "along": "road", "every": 5}],
            "exits": [{"to": "Meiwu", "at": [0, 4], "side": "W"}, {"to": "Chang'an", "at": [35, 3], "side": "E"}],
            "entries": {"": [34, 3], "Meiwu": [1, 4], "Chang'an": [34, 3]},
        },
        "states": [
            {"id": "ride-out", "when": "node:a12", "until": "node:a13", "light": "day"},
            {"id": "procession", "when": "node:a13", "until": "node:a13c", "light": "day",
             "procession": {"column": ["outriders", "carriage:dongzhuo", "carriage:diaochan", "player", "rearguard"],
                            "path": "road", "from": [0, 4], "to": [35, 3], "leash": 6,
                            "leash_line": "Li Su must keep near the Grand Preceptor.", "stops": ["wheel", "fog", "fields"]}},
            {"id": "fog", "when": "node:a13a", "until": "node:a13b", "light": "dusk", "weather": "storm", "visibility": 3, "sound": {"bells": "carriage"}},
            {"id": "night", "when": "node:a13b", "until": "node:a13c", "light": "night", "sound": {"children": "fields"}},
            {"id": "raid", "when": "node:a15", "until": "node:a16", "light": "day"},
            {"id": "march", "when": "node:a16m", "light": "day", "weather": "dust"},
        ],
        "npcs": [
            {"kind": "folk.villager", "at": [14, 5], "in": ["ride-out"], "say": "“We built it, and they sent us home with nothing but a sore back.”"},
            {"kind": "folk.villager", "at": [14, 6], "in": ["procession"], "face": "down", "say": "“Heads down, heads down. Don't let him see your face.”"},
            {"kind": "folk.soldier", "at": [10, 5], "in": ["procession"], "when": "node:a13a",
             "say": "“A new carriage by noon. The Grand Preceptor says it's a sign: the new for the old.”"},
            {"kind": "folk.soldier", "at": [19, 4], "in": ["fog"], "say": "“I can't see the horse in front of me. Where's the carriage?”"},
            {"kind": "folk.villager", "near": "tent-2", "in": ["night"], "say": "“Children in the fields at this hour? Whose children?”"},
            {"kind": "hero.lubu", "near": "tent-dz", "in": ["night"], "say": "Lü Bu sleeps outside the Grand Preceptor's tent, his halberd across his knees."},
        ],
        "objectives": {"2-a13a": "Ride beside the Grand Preceptor's carriage.", "2-a13b": "Find the Grand Preceptor in the fog.",
                       "2-a13c": "Follow the singing into the fields."},
    },
    # =========================================================================================
    "Meiwu": {
        "archetype": "fortress",
        "banners": "black",
        "plan": {
            "grid": [16, 13], "cell": 4, "margin": 1,
            "ground": [
                {"id": "inner-court", "kind": "court", "rect": [4, 2, 6, 4]},
                {"id": "outer-court", "kind": "court", "rect": [2, 7, 10, 3]},
                {"id": "wheat", "kind": "field.wheat", "rect": [1, 12, 14, 1]},
            ],
            "lines": [
                {"id": "wei", "kind": "river", "path": [[0, 0], [15, 0]], "width": 3},
                {"id": "walls", "kind": "wall.city", "outline": [1, 1, 12, 10], "width": 3, "height": "as Chang'an's",
                 "gates": {"gate": [7, 10]}},
                {"id": "inner-wall", "kind": "wall", "path": [[2, 6], [11, 6]], "width": 1, "gates": {"inner-gate": [7, 6]}},
                {"id": "road", "kind": "road", "path": [[15, 11], [7, 11], [7, 10]], "width": 3},
                {"id": "west-road", "kind": "road", "path": [[7, 11], [0, 11]], "width": 2},   # the long road west, to Liangzhou
                {"id": "spine", "kind": "road", "path": [[7, 10], [7, 4]], "width": 3},
            ],
            "things": [
                {"id": "hall", "kind": "building.hall_grand", "rect": [5, 2, 4, 2], "door": "S", "label": "Dong Zhuo's hall", "map": "hall"},
                {"id": "mother", "kind": "building.wing", "rect": [2, 2, 2, 2], "door": "E", "label": "His mother's rooms", "map": "mother"},
                {"id": "diaochan", "kind": "building.wing", "rect": [10, 2, 2, 2], "door": "W", "label": "Diaochan's rooms", "map": "diaochan"},
                {"id": "women-w", "kind": "building.wing", "rect": [2, 4, 2, 2], "door": "E", "label": "The women's quarters"},
                {"id": "women-e", "kind": "building.wing", "rect": [10, 4, 2, 2], "door": "W", "label": "The women's quarters"},
                # granaries in two rows facing an aisle: twenty years of grain, and the hall always in view up the spine
                {"id": "granary-1", "kind": "building.granary", "rect": [2, 7, 2, 1], "door": "S"},
                {"id": "granary-2", "kind": "building.granary", "rect": [4, 7, 2, 1], "door": "S"},
                {"id": "granary-3", "kind": "building.granary", "rect": [2, 9, 2, 1], "door": "N"},
                {"id": "granary-4", "kind": "building.granary", "rect": [4, 9, 2, 1], "door": "N"},
                {"id": "store-1", "kind": "building.storehouse", "rect": [8, 7, 2, 1], "door": "W", "label": "The treasury: gold and silk"},
                {"id": "store-2", "kind": "building.storehouse", "rect": [8, 9, 2, 1], "door": "W", "label": "The treasury: pearls and jade"},
            ],
            "spots": [
                {"id": "gate", "at": [7, 10], "label": "The gate of Meiwu", "note": "opens for Li Su with the edict"},
            ],
            "dress": [{"kind": "tree.poplar", "along": "road", "every": 2}],
            "exits": [{"to": "Meiwu Road", "at": [15, 11], "side": "E"},
                      {"to": "Liangzhou", "at": [0, 11], "side": "W"}],
            "entries": {"": [14, 11], "Meiwu Road": [14, 11], "Liangzhou": [1, 11]},
        },
        "states": [
            {"id": "fortress", "light": "day"},
            {"id": "road-west-shut", "until": "node:a16m", "exits_closed": ["Liangzhou"],
             "exits_closed_say": {"Liangzhou": ["The long road west runs on to Liangzhou. There's no errand for you there."]}},
            {"id": "raided", "when": "node:a14", "light": "day"},
            {"id": "empty", "when": "node:a16", "light": "day", "weather": "dust"},
        ],
        "maps": {
            "hall": room([14, 8], [7, 7], things=[{"id": "screen", "kind": "furn.screen", "rect": [6, 1, 2, 1]},
                                                  {"id": "dais", "kind": "furn.dais", "rect": [6, 2, 2, 1]}],
                         spots=[{"id": "a13", "at": [7, 4], "node": "2-a13", "label": "Dong Zhuo's hall"}]),
            "mother": room([8, 6], [7, 3], floor="wood", things=[{"id": "bed", "kind": "furn.bed", "rect": [2, 1, 2, 1]},
                                                                  {"id": "incense", "kind": "furn.lamp", "rect": [5, 1, 1, 1]}]),
            "diaochan": room([8, 6], [0, 3], floor="wood", things=[{"id": "mirror", "kind": "furn.drawers", "rect": [5, 1, 1, 1]}],
                             spots=[{"id": "a15m", "at": [4, 3], "node": "2-a15m", "label": "Diaochan's rooms"}]),
        },
        "npcs": [
            {"kind": "folk.soldier", "near": "gate", "in": ["fortress"], "say": "“Walls as thick as Chang'an's. Nothing comes through this gate he doesn't want.”"},
            {"kind": "folk.elder", "near": "granary-3", "in": ["fortress"],
             "say": "“Twenty years of grain. ‘If I succeed I hold the empire,’ he says, ‘and if not, I grow old here.’”"},
            {"kind": "folk.maiden", "near": "women-w", "in": ["fortress"], "say": "“They took me from my mother's door in Chang'an. Eight hundred of us, picked like peaches.”"},
            {"kind": "folk.woman", "near": "mother", "in": ["fortress"], "say": "“The old lady is ninety. She says her flesh trembles. She hasn't slept in days.”"},
            {"kind": "folk.maiden", "near": "women-e", "in": ["raided"], "say": "“The gate is open. Which road goes home?”"},
            {"kind": "folk.official", "near": "store-1", "in": ["raided"], "say": "“Gold, tens of thousands of jin. Silver, millions. I've stopped counting the silk.”"},
            {"kind": "hero.huangfusong", "at": [6, 8], "in": ["raided"], "say": "“Let them out. All of them. Give each a little silver for the road.”"},
        ],
        "objectives": {"2-a13": "Ride out to Meiwu and bring the edict to Dong Zhuo in his hall."},
    },
    # =========================================================================================
    "Liangzhou": {
        "archetype": "loess",
        "banners": "black",
        "plan": {
            "grid": [36, 10], "cell": 4, "margin": 1,
            "ground": [
                {"id": "loess", "kind": "loess", "rect": [0, 0, 36, 10]},
                {"id": "ridge-n", "kind": "hills", "rect": [0, 0, 30, 1]},
                {"id": "ridge-s", "kind": "hills", "rect": [0, 9, 30, 1]},
                {"id": "camp", "kind": "camp", "rect": [1, 1, 7, 4]},
                {"id": "farm-court", "kind": "court", "rect": [17, 6, 3, 2]},
                {"id": "cliff-n", "kind": "cliff", "rect": [30, 0, 6, 2]},
                {"id": "cliff-s", "kind": "cliff", "rect": [30, 8, 6, 2]},
            ],
            "lines": [
                {"id": "road", "kind": "road", "path": [[0, 5], [10, 5], [10, 4], [22, 4], [22, 5], [35, 5]], "width": 3},
                {"id": "farm-wall", "kind": "wall", "outline": [16, 5, 5, 4], "width": 1, "gates": {"farm-gate": [18, 5]}},
            ],
            "things": [
                {"id": "tent-lijue", "kind": "building.tent", "rect": [1, 1, 2, 1], "label": "Li Jue's tent"},
                {"id": "tent-guosi", "kind": "building.tent", "rect": [4, 1, 2, 1], "label": "Guo Si's tent"},
                {"id": "tent-zhangji", "kind": "building.tent", "rect": [1, 3, 2, 1], "label": "Zhang Ji's tent"},
                {"id": "tent-fanchou", "kind": "building.tent", "rect": [4, 3, 2, 1], "label": "Fan Chou's tent"},
                {"id": "tent-jiaxu", "kind": "building.tent_small", "rect": [7, 1, 1, 1], "label": "Jia Xu's tent"},
                {"id": "corral", "kind": "corral", "rect": [11, 1, 3, 2], "label": "The herders' corral"},
                {"id": "hut-1", "kind": "building.hut", "rect": [14, 3, 2, 1], "door": "S"},
                {"id": "hut-2", "kind": "building.hut", "rect": [11, 5, 2, 1], "door": "N"},
                {"id": "farm-1", "kind": "building.house", "rect": [17, 7, 2, 1], "door": "N"},
                {"id": "posthouse", "kind": "building.posthouse", "rect": [24, 3, 2, 2], "door": "S", "label": "The post-pavilion (亭)"},
                {"id": "house-v3", "kind": "building.house", "rect": [27, 4, 2, 1], "door": "S"},
                {"id": "house-v3b", "kind": "building.house", "rect": [24, 6, 2, 1], "door": "N"},
                {"id": "heights-n", "kind": "landmark.heights", "rect": [31, 2, 3, 2], "label": "The gong height"},
                {"id": "heights-s", "kind": "landmark.heights", "rect": [31, 7, 3, 2], "label": "The drum height"},
            ],
            "spots": [
                {"id": "camp", "at": [6, 4], "node": "2-a16", "label": "Li Jue's camp"},
                {"id": "v1", "at": [13, 3], "node": "2-a16a", "label": "The herders' village"},
                {"id": "v2", "at": [18, 6], "node": "2-a16b", "label": "The walled farm"},
                {"id": "v3", "at": [26, 5], "node": "2-a16c", "label": "The post town"},
                {"id": "march", "at": [29, 5], "node": "2-a16m", "label": "The road east"},
                {"id": "rengu", "at": [32, 5], "node": "2-a17", "label": "The mouth of Ren Valley"},
            ],
            "dress": [{"kind": "rock.small", "count": 20}, {"kind": "tree.dead", "count": 8}],
            "exits": [{"to": "Meiwu", "at": [35, 5], "side": "E"}],
            "entries": {"": [2, 5], "Meiwu": [34, 5]},
        },
        "states": [{"id": "road-east-shut", "until": "node:a17", "exits_closed": ["Meiwu"],
                    "exits_closed_say": {"Meiwu": ["Not yet. Lü Bu holds the road east. The mouth of Ren Valley comes first."]}},
                   {"id": "rumour", "light": "day", "weather": "harsh"}, {"id": "army", "when": "node:a16m", "light": "day", "weather": "dust"}],
        "npcs": [
            {"kind": "folk.soldier", "near": "camp", "in": ["rumour"], "say": "“No pardon. The envoy came back with nothing. I'm going home to my mother.”"},
            {"kind": "folk.elder", "near": "corral", "in": ["rumour"], "until": "node:a16a",
             "say": "“Wang Yun? A man of the east. What does he know of Liangzhou?”"},
            {"kind": "folk.elder", "near": "corral", "when": "node:a16a", "say": "“Then we're dead men either way. Better on horseback.”"},
            {"kind": "folk.woman", "near": "farm-1", "say": "“We have a wall. Walls kept out the Qiang. Will they keep out Chang'an?”"},
            {"kind": "folk.soldier", "follower": True, "say": "“Better die marching than in our beds.”"},
        ],
        "objectives": {"2-a16": "Hear the envoy at Li Jue's camp.", "2-a16a": "Spread the word in the herders' village.",
                       "2-a16b": "Spread the word at the walled farm.", "2-a16c": "Win over the constable at the post town.",
                       "2-a16m": "March east.", "2-a17": "Hold the mouth of Ren Valley."},
    },
}

# A7's curtain: Dong Zhuo eats on the dais and turns between his food and the room; Lü Bu stands below.
# Diaochan must stand where Lü Bu sees her and Dong Zhuo doesn't. "turns": he faces each way in turn.
_xf_hall = PLANS2["Chang'an"]["maps"]["xf-hall"]
_xf_hall["watchers"] = [
    {"id": "dongzhuo", "kind": "hero.dongzhuo", "at": [6, 2], "turns": ["S", "W"], "cone": 6, "in_beats": ["2-a7c"]},
    {"id": "lubu", "kind": "hero.lubu", "at": [5, 6], "face": "W", "cone": 5, "in_beats": ["2-a7c"]},
]
_xf_hall["checks"] = [{"check": "sight_puzzle", "seen_by": "lubu", "unseen_by": "dongzhuo", "in": "behind-curtain"}]



# ---- road challengers: 14 on the arc's walks, 6 of them blocking -------------------------------------------
# Each sets one go problem (flawless, the usual 30-second wait after a wrong move). "at" is a cell of the
# plan they stand in ("map": a compound or room of the place, else the place's own plan). A blocking one has
# "blocks": the spot, thing (its door) or {"exit": place} you can't reach without coming into his view;
# "view" is how far he sees: a radius in cells, or with "face" a cone. check_plans_w2.py proves the block.
def _ch(cid, kind, at, when, until, intro, win, done, blocks=None, view=1, face=None, map=None, entry=None):
    c = {"id": cid, "kind": kind, "at": at, "when": when, "until": until, "intro": [intro], "win": [win], "done": [done],
         "view": view}
    for k, v in (("blocks", blocks), ("face", face), ("map", map), ("from", entry)):
        if v is not None:
            c[k] = v
    return c


PLANS2["Chang'an"]["challengers"] = [
    # the crown errand (before A3): a runner watches Lü Bu's gate from across the ward street
    _ch("runner", "folk.official", [14, 8], "node:a2", "node:a3",
        "A runner in the Chancellor's colours steps into your path. “Minister Wang, out on foot? The Grand Preceptor likes to know who walks where.”",
        "“Nothing worth reporting, then. Good day, Minister.”", "The runner watches you pass, and says nothing.",
        blocks="a3", view=1),
    _ch("flyingbear", "folk.soldier", [5, 5], "node:a2", "node:a3",
        "A Flying Bear soldier lounges against the wall, dice in his fist. “Bored, old man? Play me. Lose, and you buy the wine.”",
        "“Hah! The old man bites. Go on.”", "“Not again, old man. My purse can't take it.”"),
    # the conspirators' errands (before A12a/A12b): a patrol stands across the lane at Huang Wan's gate
    _ch("patrol", "folk.soldier", [4, 11], "node:a11", "node:a12b",
        "A Flying Bear patrol fills the lane to Huang Wan's gate. “Visiting late, Minister? Every lane in Chang'an answers to the Grand Preceptor.”",
        "“On your way, then. Quickly.”", "The patrol has moved on to the next lane.", blocks="huangwan"),
    _ch("informer", "folk.villager", [2, 8], "node:a11", "node:a12a",
        "A man in a plain coat has sat by Shisun Rui's gate all morning. “A game while you wait, Minister? I have time. I have nothing but time.”",
        "“You play like a man with nothing to hide.”", "The man in the plain coat has gone."),
    # Chang'an optionals
    _ch("scholar", "folk.elder", [13, 5], None, "node:a17",
        "“Sit, Minister. In this city it's safer to talk about stones than people.”",
        "“Ha. You read the board the way you read a room.”", "“Another day, Minister. The stones keep.”", face="N"),
    _ch("officer", "folk.soldier", [14, 7], "node:a5", "node:a6",
        "A Liangzhou officer steps out of a dark lane. “Out after the drum, Minister? Play me for your way home.”",
        "“Go on, then. I never saw you.”", "“Still out, Minister?”"),
]
PLANS2["Meiwu Road"]["challengers"] = [
    # Li Su's ride out (before A13), from the Chang'an end: horsemen across the road and the fields beside it
    _ch("roadpatrol", "folk.soldier", [16, 4], "node:a12", "node:a13",
        "A patrol of the Grand Preceptor's horsemen bars the road. “Rider from Chang'an! Halt, and show us what you carry.”",
        "“An edict for the Grand Preceptor? Ride on, then, and ride fast.”", "The patrol waves you through.",
        blocks={"exit": "Meiwu"}, view=3, entry=[34, 3]),
    _ch("postkeeper", "folk.elder", [12, 5], "node:a12", "node:a13",
        "The post keeper has a board out on the bench. “Long nights out here. Sit a moment, sir.”",
        "“The road's yours. Mind the ruts after the bridge.”", "“Safe road, sir.”"),
]
PLANS2["Meiwu"]["challengers"] = [
    # Li Su at the gate (before A13)
    _ch("gateguard", "folk.soldier", [7, 11], "node:a12", "node:a13",
        "The gate captain turns the edict over in his hands. “Seals can be made in Chang'an. Prove you're who you say.”",
        "“Pass, Commandant Li. Open the gate!”", "The gate stands open for you.", blocks="hall", entry=[14, 11]),
    # the raid, as Lü Bu (before A15m): one guard still holds the treasury doors at the inner gate
    _ch("straggler", "folk.soldier", [7, 7], "node:a15", "node:a15m",
        "One of Dong Zhuo's guards still holds the treasury doors, spear levelled. “The Grand Preceptor's gold! Nobody touches it!”",
        "“…He's dead, isn't he. Take it. Take all of it.”", "The guard has thrown down his spear.", blocks="diaochan"),
    _ch("bearofficer", "folk.soldier", [3, 8], "node:a15", "node:a15m",
        "A Flying Bear officer crouches among the granaries, sword half drawn. “General Lü. I always wondered which of us was better.”",
        "“So now I know.”", "The officer sits against the wall and does not look up."),
]
PLANS2["Liangzhou"]["challengers"] = [
    # Jia Xu between the villages
    _ch("headman", "folk.elder", [15, 4], "node:a16a", "node:a16b",
        "A headman sits on a stone by the road, a stick across his knees. “You're spreading tales from Chang'an. Convince me first.”",
        "“…Then it's true. I'll tell the others myself.”", "“I've told them. They're coming.”"),
    _ch("constable", "folk.official", [25, 5], "node:a16b", "node:a16c",
        "The constable stands at the pavilion, arms folded. “A man without an army is just a man on a road. I've tied up better.”",
        "“…That's no road gang behind you. That's Liangzhou.”", "The constable has taken down his rope.", blocks="v3"),
    # Li Jue before Ren Valley
    _ch("scout", "folk.soldier", [30, 4], "node:a16m", "node:a17",
        "A scout calls down from his post on the hill. “General! Lü Bu's dust on the east road. Want to know how many?”",
        "“Then you know as well as I do. Ready the gongs and drums.”", "The scout watches the east road."),
]

from tk_places_w2_zh import ZH_PLACES2  # noqa: E402,F401  (Plot's file: English line -> Chinese)
