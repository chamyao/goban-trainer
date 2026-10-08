"""The Cao Cao arc's places (novel chapters 3-4 and the start of 5), as plan grids (docs/book2/plan-grid.md).

Design: docs/book2/caocao-arc.md (Plot). Beat keys are its Shared keys, 2-c1 ... 2-c23.

    python3 tools/check_plans_w2.py --arc cc          # check
    python3 tools/check_plans_w2.py --arc cc --png    # and draw into docs/book2/plans-cc/

The places are walked in the novel's order: Luoyang (Beimang to its north, the camps outside its west gate)
-> the East Road (Zhongmou) -> Chenggao -> Chenliu. Road challengers: 12, 4 of them blocking (the design's table).
Cells, claims, lines, rooms and states work as in tools/tk_plans_w2.py, whose kinds and room() this reuses.
"""
from tk_plans_w2 import ART as ART2, LINE_KINDS, NEW_KINDS as NEW_KINDS2, ZONE_KINDS, _ch, room

# Kinds this arc adds: footprint in tiles (w, h, solid)
NEW_KINDS = {**NEW_KINDS2,
             "building.tower": (3, 5, True),     # a palace tower: Cuihua Tower, the tower of Yong'an Palace
             "building.stable": (6, 3, True),    # a long stable with stalls open to the yard
             "furn.mirror": (1, 1, True),        # a bronze dressing mirror on a stand (C16)
             "banner.white": (1, 1, True),       # the white banner of the volunteers, 忠义 (C23)
             "wall.stairs": (4, 1, True),   # stairs up the inside of a city wall (马道), against its foot
             }
ART = {**ART2,
       "building.tower": "a tall Han palace tower (阙/楼): three storeys of timber on a rammed-earth base, hip roof of dark tiles, a balcony at the top; reads from far off",
       "building.stable": "a long Han stable: a tiled roof on posts, stalls open to the yard, hay racks, a horse or two looking out",
       "furn.mirror": "a polished bronze dressing mirror on a wooden stand, about head height when sitting",
       "banner.white": "a tall white banner on a pole, two black characters 忠义",
       "wall.stairs": "a flight of rammed-earth steps (马道) climbing the inside face of a city wall to the wall-walk, "
                              "four tiles long, one deep; drawn against the wall's foot, the same 3/4 view as the wall",
       }


def _talk(kind, at, say, **kw):
    return {"kind": kind, "at": at, "say": say, **kw}


PLANS_CC = {
    # =========================================================================================
    # Luoyang: one map, four states: the court before the coup, the burning night, under Dong Zhuo, the day of the sword
    "Luoyang": {
        "archetype": "city",
        "banners": "red",            # Han red; black (the Chancellor's) once Dong Zhuo holds the city
        "plan": {
            # The south half is walled wards (坊), as Han Luoyang was: their walls make the streets real streets, with
            # gates and lanes along them. That's where the chase out of the city (state "sword") is ridden.
            "grid": [22, 17], "cell": 4, "margin": 1,
            "ground": [
                {"id": "city", "kind": "city", "rect": [2, 2, 18, 13]},
                {"id": "wenming", "kind": "garden", "rect": [2, 2, 5, 3]},          # the Wenming Garden, by the palace
                {"id": "forecourt", "kind": "court", "rect": [8, 7, 6, 1]},         # before the Jiade Gate
                {"id": "market", "kind": "market", "rect": [15, 10, 3, 3]},         # inside the market wall
                {"id": "xf-court", "kind": "court", "rect": [4, 12, 3, 1]},         # inside the Chancellor's ward gate
                {"id": "ward-court", "kind": "court", "rect": [10, 10, 2, 3]},      # the houses' lane, inside their ward
                {"id": "lodging-court", "kind": "court", "rect": [17, 6, 2, 1]},    # before Cao Cao's lodging
                {"id": "fields-n", "kind": "field", "rect": [0, 0, 22, 1]},
                {"id": "fields-s", "kind": "field", "rect": [0, 16, 22, 1]},
            ],
            "lines": [
                {"id": "wall", "kind": "wall.city", "outline": [1, 1, 20, 15], "width": 2,
                 "gates": {"north-gate": [16, 1], "west-gate": [1, 8], "east-gate": [20, 8]}},
                {"id": "main-street", "kind": "road", "path": [[0, 8], [21, 8]], "width": 3},   # west gate to the East Gate
                {"id": "north-road", "kind": "road", "path": [[16, 0], [16, 8]], "width": 3},   # out to Beimang
                {"id": "garden-lane", "kind": "road", "path": [[7, 2], [7, 8]], "width": 2},    # past the Wenming Garden
                {"id": "west-lane", "kind": "road", "path": [[2, 8], [2, 14]], "width": 2},
                {"id": "ward-lane", "kind": "road", "path": [[8, 8], [8, 14]], "width": 2},     # between the Chancellor's ward and the next
                {"id": "market-lane", "kind": "road", "path": [[13, 8], [13, 14]], "width": 2},
                {"id": "east-lane", "kind": "road", "path": [[19, 8], [19, 14]], "width": 2},
                {"id": "south-street", "kind": "road", "path": [[2, 14], [19, 14]], "width": 3},
                # the north side of the main street, east of the palace: a ward wall, the lodging's gate in it
                {"id": "ward-ne", "kind": "wall", "path": [[14, 6], [14, 7], [20, 7]], "width": 1, "gates": {"lodging-gate": [18, 7]}},
                {"id": "ward-ne-w", "kind": "wall", "path": [[14, 2], [14, 6]], "width": 3},   # its west wall, against the palace's
                # the wards south of the main street, each walled, with its gates
                {"id": "ward-xf", "kind": "wall", "path": [[3, 9], [7, 9], [7, 13], [3, 13], [3, 9]], "width": 1,
                 "gates": {"chancellor-gate": [5, 13], "side-gate": [7, 11]}},          # the Chancellor's ward
                {"id": "ward-s", "kind": "wall", "path": [[9, 9], [12, 9], [12, 13], [9, 13], [9, 9]], "width": 1,
                 "gates": {"ward-w-gate": [9, 11], "ward-e-gate": [12, 11]}},   # an alley through it, the houses either side
                {"id": "market-wall", "kind": "wall", "path": [[14, 9], [18, 9], [18, 13], [14, 13], [14, 9]], "width": 1,
                 "gates": {"market-n-gate": [16, 9], "market-ne-gate": [17, 9], "market-s-gate": [16, 13], "market-se-gate": [17, 13],
                           "market-e-gate": [18, 11]}},   # two gates each side: one to ride through, one for the ambush
            ],
            "things": [
                # north of the main street, fronts to the south
                {"id": "banquet", "kind": "camp.banquet", "rect": [3, 2, 3, 1], "label": "The banquet in the Wenming Garden"},
                {"id": "hejin", "kind": "building.hall_grand", "rect": [2, 6, 3, 2], "door": "S", "label": "He Jin's residence",
                 "map": "hj-hall", "plaque": "何府"},
                {"id": "wangyun", "kind": "building.hall", "rect": [5, 7, 2, 1], "door": "S", "label": "Wang Yun's house",
                 "map": "wyl-rearhall", "plaque": "王府"},
                {"id": "palace", "kind": "building.palace", "rect": [8, 2, 6, 5], "door": "S", "label": "Changle Palace",
                 "map": "palace", "gate_label": "The Jiade Gate", "plaque": "嘉德门"},
                {"id": "yongan", "kind": "building.tower", "rect": [17, 2, 2, 2], "label": "The tower of Yong'an Palace",
                 "note": "the deposed emperor's prison; seen from the street in C13"},
                {"id": "lodging", "kind": "building.house", "rect": [17, 5, 2, 1], "door": "S", "label": "Cao Cao's lodging"},
                # south of the main street: the Chancellor's residence in its own ward, a ward of houses, the market
                {"id": "xiangfu", "kind": "building.compound", "rect": [4, 10, 3, 2], "door": "S", "label": "The Chancellor's residence",
                 "map": "xiangfu", "plaque": "相府"},
                {"id": "house-1", "kind": "building.house", "rect": [10, 10, 2, 1], "door": "S"},
                {"id": "house-2", "kind": "building.house", "rect": [10, 12, 2, 1], "door": "N"},
                {"id": "stalls", "kind": "market.stalls", "rect": [15, 10, 2, 1], "label": "Market stalls"},
                {"id": "stalls-2", "kind": "market.stalls", "rect": [16, 12, 2, 1]},
                {"id": "gotable", "kind": "furniture.gotable", "rect": [17, 10, 1, 1], "label": "A go table in the market"},
                # stairs up the inside of the city wall (马道), in the wall's band: its guards come down them onto the south street
                {"id": "stairs-w", "kind": "wall.stairs", "rect": [11, 15, 1, 1], "door": "N",
                 "label": "Stairs up the city wall"},
                {"id": "stairs-e", "kind": "wall.stairs", "rect": [15, 15, 1, 1], "door": "N"},
            ],
            "spots": [
                {"id": "c2", "at": [10, 7], "node": "2-c2", "label": "Before the Jiade Gate", "trigger": "near"},
                {"id": "c6", "at": [4, 3], "node": "2-c6", "label": "The Wenming Garden banquet"},
                {"id": "wenming-gate", "at": [6, 4], "label": "The garden gate", "note": "C6: Lü Bu rides past outside, halberd in hand"},
                {"id": "c13", "at": [14, 8], "node": "2-c13", "label": "The street under Dong Zhuo", "trigger": "near",
                 "note": "the tower of Yong'an Palace in view to the north-east; the carts come in by the East Gate"},
                {"id": "c17", "at": [19, 8], "node": "2-c17", "label": "The East Gate", "trigger": "near"},
                {"id": "xf-gate", "at": [5, 14], "label": "The Chancellor's gate", "note": "the chase out of Luoyang starts (and restarts) here"},
            ],
            "props": [
                {"kind": "landmark.notice", "at": [20, 7], "in": ["dong"], "label": "Yuan Shao's seal of office, hanging on the East Gate",
                 "when": "node:c11"},
            ],
            "dress": [
                {"kind": "tree.willow", "in": "wenming", "count": 4},
                {"kind": "plant.flower", "in": "wenming", "count": 8},
                {"kind": "banner", "at_gates": True},
                {"kind": "banner.red", "at_door": "palace", "pair": True},
                {"kind": "banner.black", "at_door": "xiangfu", "pair": True},
            ],
            "exits": [{"to": "Beimang", "at": [16, 0], "side": "N"},
                      {"to": "The Camps", "at": [0, 8], "side": "W"},
                      {"to": "The East Road", "at": [21, 8], "side": "E"}],
            "entries": {"": [10, 8], "Beimang": [16, 2], "The Camps": [2, 8], "The East Road": [19, 8]},
        },
        "states": [
            {"id": "court", "light": "day",
             "exits_closed": ["Beimang", "The Camps", "The East Road"],
             "exits_closed_say": {"Beimang": ["The north gate is shut. The whole city waits on He Jin."],
                                  "The Camps": ["Outside the walls is no place for a colonel today. He Jin's council is sitting."],
                                  "The East Road": ["Not now. The council is sitting at He Jin's."]}},
            {"id": "burning", "when": "node:c2", "until": "node:c3", "light": "night", "weather": "smoke",
             "exits_closed": ["Beimang", "The Camps", "The East Road"],
             "exits_closed_say": {"Beimang": ["The gates are barred. The Emperor is somewhere inside the burning palace."],
                                  "The Camps": ["The gates are barred. The Emperor is somewhere inside the burning palace."],
                                  "The East Road": ["The gates are barred. The Emperor is somewhere inside the burning palace."]}},
            {"id": "dong", "when": "node:c5", "until": "node:c16", "light": "day", "banners": "black",
             "exits_closed": ["Beimang", "The East Road"],
             "exits_closed_say": {"Beimang": ["Xiliang horsemen hold the north gate. No one leaves without Dong Zhuo's word."],
                                  "The East Road": ["Xiliang horsemen hold the East Gate. No one leaves without Dong Zhuo's word."]}},
            {"id": "sword", "when": "node:c16", "until": "node:c17", "light": "day", "banners": "black",
             "exits_closed": ["Beimang", "The Camps", "The East Road"],
             "exits_closed_say": {"Beimang": ["Not that way. East, out of the city, before they think to send for you."],
                                  "The Camps": ["Not that way. East, out of the city, before they think to send for you."],
                                  "The East Road": ["The East Gate is ahead. Ride up to it as if you had every right."]}},
            {"id": "wanted", "when": "node:c17", "light": "day", "banners": "black",
             "exits_closed": ["Beimang", "The Camps"],
             "exits_closed_say": {"Beimang": ["Your face is on every gate in Luoyang now. East, and keep going."],
                                  "The Camps": ["Your face is on every gate in Luoyang now. East, and keep going."]}},
        ],
        "maps": {
            # ---- the palace behind the Jiade Gate: the outer court, the Qingsuo Gate, the inner court and its halls ----
            "palace": {
                "grid": [18, 16], "cell": 2, "margin": 0,
                "ground": [{"id": "outer-court", "kind": "court", "rect": [1, 10, 16, 5]},
                           {"id": "inner-court", "kind": "court", "rect": [1, 4, 16, 5]}],
                "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, 18, 16], "width": 1, "gates": {"jiade-gate": [8, 15]}},
                          {"id": "inner-wall", "kind": "wall", "path": [[1, 9], [16, 9]], "width": 1, "gates": {"qingsuo-gate": [8, 9]}},
                          {"id": "gallery", "kind": "gallery", "path": [[11, 6], [16, 6]], "width": 2}],   # 阁下: C14
                "things": [
                    {"id": "cuihua", "kind": "building.tower", "rect": [1, 1, 2, 3], "label": "Cuihua Tower"},
                    {"id": "jiade-hall", "kind": "building.hall_grand", "rect": [4, 1, 5, 3], "door": "S", "label": "The Jiade Hall",
                     "map": "jiade-hall"},
                    {"id": "sheng", "kind": "building.hall_grand", "rect": [11, 1, 5, 3], "door": "S", "label": "The Secretariat",
                     "map": "sheng-hall"},
                    {"id": "store", "kind": "building.storehouse", "rect": [1, 11, 3, 1], "door": "S", "label": "A palace storehouse"},
                ],
                "spots": [
                    {"id": "c3", "at": [3, 4], "node": "2-c3", "label": "By Cuihua Tower", "trigger": "near"},
                    {"id": "c14", "at": [13, 6], "node": "2-c14", "label": "The palace gallery", "trigger": "near"},
                    {"id": "inside-gate", "at": [8, 13], "label": "Inside the Jiade Gate", "note": "C2: He Jin goes in alone; C3 starts here"},
                ],
                "exits": [{"to": "Luoyang", "at": [8, 15], "side": "S"}],
            },
            "jiade-hall": room([16, 8], [8, 7],
                               things=[{"id": "throne", "kind": "furn.dais", "rect": [7, 1, 2, 1], "label": "The throne"},
                                       {"id": "screen", "kind": "furn.screen", "rect": [7, 2, 2, 1]},
                                       {"id": "table-1", "kind": "furn.table", "rect": [3, 4, 1, 1]},
                                       {"id": "table-2", "kind": "furn.table", "rect": [12, 4, 1, 1]}],
                               spots=[{"id": "c12", "at": [8, 5], "node": "2-c12", "label": "The Jiade Hall"}]),
            "sheng-hall": room([16, 8], [8, 7],
                               things=[{"id": "dais", "kind": "furn.dais", "rect": [7, 1, 2, 1], "label": "Dong Zhuo's seat"},
                                       {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 1, 1]},
                                       {"id": "table-2", "kind": "furn.table", "rect": [5, 3, 1, 1]},
                                       {"id": "table-3", "kind": "furn.table", "rect": [10, 3, 1, 1]},
                                       {"id": "table-4", "kind": "furn.table", "rect": [12, 3, 1, 1]},
                                       {"id": "rack-w", "kind": "furn.rack", "rect": [1, 5, 1, 1], "label": "Lü Bu's armoured men"},
                                       {"id": "rack-e", "kind": "furn.rack", "rect": [14, 5, 1, 1]}],
                               spots=[{"id": "c11", "at": [8, 5], "node": "2-c11", "label": "The Secretariat banquet"}]),
            "hj-hall": room([12, 7], [6, 6],
                            things=[{"id": "dais", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "He Jin's seat"},
                                    {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 1, 1]},
                                    {"id": "table-2", "kind": "furn.table", "rect": [8, 3, 1, 1]},
                                    {"id": "screen", "kind": "furn.screen", "rect": [9, 1, 2, 1]}],
                            spots=[{"id": "c1", "at": [6, 4], "node": "2-c1", "label": "He Jin's council"}]),
            "wyl-rearhall": room([12, 7], [6, 6], floor="wood",
                                 things=[{"id": "table-1", "kind": "furn.table", "rect": [3, 2, 2, 1]},
                                         {"id": "table-2", "kind": "furn.table", "rect": [7, 2, 2, 1]},
                                         {"id": "lamp", "kind": "furn.lamp", "rect": [10, 1, 1, 1]},
                                         {"id": "chest", "kind": "furn.chest", "rect": [1, 1, 1, 1], "label": "Where the Seven-Star Sword is kept"}],
                                 spots=[{"id": "c15", "at": [6, 4], "node": "2-c15", "label": "Wang Yun's \"birthday\""}]),
            # ---- the Chancellor's residence: the hall, the small pavilion where Dong Zhuo lies down, the stables ----
            "xiangfu": {
                "grid": [14, 12], "cell": 2, "margin": 0,
                "ground": [{"id": "court", "kind": "court", "rect": [1, 4, 12, 7]}],
                "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, 14, 12], "width": 1, "gates": {"gate": [6, 11]}}],
                "things": [
                    {"id": "hall", "kind": "building.hall_grand", "rect": [1, 1, 5, 3], "door": "S", "label": "The Chancellor's hall"},
                    {"id": "pavilion", "kind": "building.lodge", "rect": [6, 2, 2, 1], "door": "S", "label": "The small pavilion",
                     "map": "xf-pavilion"},
                    {"id": "stables", "kind": "building.stable", "rect": [9, 1, 3, 2], "door": "S", "label": "The stables",
                     "note": "Lü Bu goes to choose a horse (C16)"},
                    {"id": "post", "kind": "landmark.hitchingpost", "rect": [11, 5, 1, 1], "label": "Where Lü Bu brings the horse"},
                ],
                "spots": [{"id": "xf-gate", "at": [6, 9], "label": "Inside the Chancellor's gate"}],
                "exits": [{"to": "Luoyang", "at": [6, 11], "side": "S"}],
            },
            "xf-pavilion": room([10, 7], [5, 6], floor="wood",
                                things=[{"id": "couch", "kind": "furn.bed", "rect": [2, 1, 2, 1], "label": "The couch where he lies down"},
                                        {"id": "mirror", "kind": "furn.mirror", "rect": [5, 1, 1, 1], "label": "The dressing mirror"},
                                        {"id": "screen", "kind": "furn.screen", "rect": [7, 1, 2, 1]},
                                        {"id": "lamp", "kind": "furn.lamp", "rect": [8, 4, 1, 1]}],
                                spots=[{"id": "c16", "at": [5, 4], "node": "2-c16", "label": "The small pavilion"}]),
        },
        "npcs": [
            # under Dong Zhuo (C13-C15): the town as the novel paints it
            _talk("folk.villager", [12, 8], "“Xiliang horsemen ride down the middle of the street. You step aside or you're ridden down.”", **{"in": ["dong"]}),
            _talk("folk.official", [6, 8], "“Zheng Tai went, and Lu Zhi went. A man with a family stays, and bows, and says nothing.”", **{"in": ["dong"]}),
            _talk("folk.maiden", [11, 7], "“The old emperor sits in the tower of Yong'an Palace. They say he wrote a poem about two swallows.”",
                  **{"in": ["dong"], "until": "node:c14"}),
            _talk("folk.maiden", [11, 7], "“The Prince of Hongnong is dead. They don't say how. No one asks.”", **{"in": ["dong"], "when": "node:c14"}),
            _talk("folk.elder", [17, 11], "“Carts came in from Yangcheng with heads hung under them. ‘Bandits,’ they said. It was market day there.”",
                  **{"in": ["dong"], "when": "node:c13"}),
            _talk("folk.soldier", [12, 7], "“The Jiade Gate is shut. The general went in to see the Empress, and he's not come out.”", **{"in": ["court"]}),
            _talk("folk.villager", [5, 8], "“The Ten Attendants and He Jin both want the court. Whoever wins, we pay.”", **{"in": ["court"]}),
        ],
        # The chase out of Luoyang (caocao-arc.md, "Redesign"), in state "sword" (c16 -> c17): Cao Cao rides from the
        # Chancellor's gate to the East Gate. A wave of Dong Zhuo's men pours out of the gate after him and follows his
        # trail, a little slower than his horse; soldiers spring out of gates, lane mouths and the wall stairs ahead of
        # him and dash across the street. Read by plans.py, which places each post on its tiles and proves every route
        # can be ridden clean (prove_chase), and writes the result as the map's "chase" (tiles) for the engine.
        "chase": {
            "chase": "c17", "state": "sword", "from": "xf-gate", "to": "c17",
            # the engine's numbers this layout is proved against (px/s, s, tiles; tk-world reads this "chase" as it is, and
            # springs an ambusher only while Cao Cao heads toward his line): Integration's to change; rerun the build
            "pace": {"horse": 165, "wave": 150, "wave_after": 1.0, "ambusher": 140, "reach": 9, "lead": 0.1, "hold": 1.0, "hit": 0.8},
            "wave": {"from": "xf-gate", "kind": "folk.soldier", "count": 8},
            # where each soldier waits (a gate of a wall, a cell, or a thing he stands in front of) and which way he
            # dashes: straight across the street, to its far side
            "ambush": [
                {"id": "side-gate", "post": "side-gate", "dash": "E", "note": "the Chancellor's side gate, onto the ward lane"},
                {"id": "jiade", "post": [11, 7], "dash": "S", "note": "palace guards from the Jiade Gate, across the main street"},
                {"id": "lane-mouth", "post": [13, 9], "dash": "N", "note": "out of the market lane, across the main street"},
                {"id": "market-n", "post": "market-ne-gate", "dash": "N", "note": "out of the market's east north gate"},
                {"id": "lodging", "post": "lodging-gate", "dash": "S", "note": "the jailers sent to Cao Cao's lodging, out of its gate"},
                {"id": "ward-lane", "post": [8, 13], "dash": "S", "note": "out of the ward lane, across the south street"},
                {"id": "stairs-w", "post": "stairs-w", "dash": "N", "note": "down the wall stairs, across the south street"},
                {"id": "lane-mouth-s", "post": [13, 13], "dash": "S", "note": "out of the market lane, across the south street"},
                {"id": "market-s", "post": "market-se-gate", "dash": "S", "note": "out of the market's east south gate"},
                {"id": "stairs-e", "post": "stairs-e", "dash": "N", "note": "down the east wall stairs"},
                {"id": "market-e", "post": "market-e-gate", "dash": "E", "note": "out of the market's east gate, across the east lane"},
                {"id": "stall", "post": [15, 11], "dash": "E", "note": "from behind the stalls, along the market's middle aisle"},
            ],
            # the three ways to the gate (cells); each must have a clean ride, and each ambush on it must be in the way
            "routes": {
                "main street": [[5, 14], [8, 14], [8, 8], [19, 8]],       # up the ward lane, then the wide main street
                "south street": [[5, 14], [19, 14], [19, 8]],             # the south street under the wall, then the east lane
                "market": [[5, 14], [16, 14], [16, 8], [19, 8]],          # in at the market's south gate, out at its north
            },
        },
        "objectives": {
            "2-c1": "Go to He Jin's residence, on the main street west of the palace. The council is already sitting.",
            "2-c2": "Go to the Jiade Gate of the palace, at the north side of the main street.",
            "2-c3": "Get through the burning palace to Cuihua Tower, at its north-west corner.",
            "2-c6": "Go to the banquet in the Wenming Garden, beside the palace.",
            "2-c11": "Go to the Secretariat, in the palace behind the Qingsuo Gate.",
            "2-c12": "Go to the Jiade Hall, in the palace behind the Qingsuo Gate.",
            "2-c13": "Walk the main street east towards the gate.",
            "2-c14": "Go to the gallery in the palace, east of the inner court.",
            "2-c15": "Go to Wang Yun's house, on the main street beside He Jin's.",
            "2-c16": "Go to the Chancellor's residence, south of the palace, and find him in the small pavilion.",
            "2-c17": "Ride for the East Gate, at the end of the main street.",
        },
    },

    # =========================================================================================
    # Beimang: the river, the reeds, the thorny slope, Cui Yi's farm; the road back south to the capital
    "Beimang": {
        "archetype": "hills",
        "plan": {
            "grid": [16, 12], "cell": 4, "margin": 1,
            "ground": [
                {"id": "bank", "kind": "field", "rect": [0, 2, 16, 10]},
                {"id": "reeds", "kind": "field", "rect": [1, 2, 6, 2]},          # the riverbank reeds: dressed tall
                {"id": "thorns", "kind": "field", "rect": [2, 4, 5, 3]},         # the thorny slope
                {"id": "farm", "kind": "field", "rect": [8, 4, 6, 3]},           # Cui Yi's farm
                {"id": "hill-w", "kind": "hills", "rect": [0, 7, 7, 5]},
                {"id": "hill-e", "kind": "hills", "rect": [13, 7, 3, 5]},
            ],
            "lines": [
                {"id": "river", "kind": "river", "path": [[0, 1], [15, 1]], "width": 4},
                {"id": "firefly-path", "kind": "path", "path": [[3, 3], [3, 6], [9, 6]], "width": 2},   # the fireflies' way
                {"id": "road", "kind": "road", "path": [[9, 6], [10, 6], [10, 11]], "width": 3},       # back to the capital
            ],
            "things": [
                {"id": "farmhouse", "kind": "building.hut", "rect": [9, 4, 2, 1], "door": "S", "label": "Cui Yi's farm"},
                {"id": "haystack", "kind": "camp.hay", "rect": [12, 5, 1, 1], "label": "Cui Yi's haystack"},
                {"id": "barn", "kind": "building.hut", "rect": [12, 4, 2, 1], "label": "A barn"},
            ],
            "spots": [
                {"id": "reeds-hide", "at": [2, 3], "label": "Hiding in the reeds", "note": "C4 starts here: the two brothers, wet with dew"},
                {"id": "c4", "at": [12, 6], "node": "2-c4", "label": "Cui Yi's haystack", "trigger": "near"},
                {"id": "c5", "at": [10, 9], "node": "2-c5", "label": "The road back to the capital", "trigger": "near"},
            ],
            "dress": [
                {"kind": "plant.grass", "in": "reeds", "count": 24},
                {"kind": "plant.bush", "in": "thorns", "count": 14},
                {"kind": "tree.small", "in": "hill-w", "count": 6},
                {"kind": "tree.small", "in": "hill-e", "count": 3},
            ],
            "exits": [{"to": "Luoyang", "at": [10, 11], "side": "S"}],
            "entries": {"": [2, 3], "Luoyang": [10, 10]},
        },
        "states": [
            {"id": "night", "until": "node:c4", "light": "night",
             "exits_closed": ["Luoyang"], "exits_closed_say": {"Luoyang": ["Not in the dark, with Zhang Rang's men still out. Find somewhere to hide."]}},
            {"id": "morning", "when": "node:c4", "light": "morning"},
        ],
        "objectives": {"2-c4": "Follow the fireflies up from the river to a farm.", "2-c5": "Go out to the road back to the capital, south of the farm."},
    },

    # =========================================================================================
    # The camps outside the city: Ding Yuan's palisade to the west, the field between, Dong Zhuo's camp to the east
    "The Camps": {
        "archetype": "camp",
        "banners": "black",
        "plan": {
            "grid": [24, 12], "cell": 4, "margin": 1,
            "ground": [
                {"id": "dy-camp", "kind": "camp", "rect": [1, 1, 7, 10]},
                {"id": "field", "kind": "field", "rect": [8, 0, 7, 12]},
                {"id": "dz-camp", "kind": "camp", "rect": [15, 1, 9, 10]},
            ],
            "lines": [
                {"id": "palisade", "kind": "wall", "outline": [1, 1, 7, 10], "width": 1, "gates": {"dy-gate": [7, 6]}},   # Ding Yuan's camp
                {"id": "road", "kind": "road", "path": [[7, 6], [23, 6]], "width": 3},
                {"id": "dz-way", "kind": "road", "path": [[19, 6], [19, 4]], "width": 2},
            ],
            "things": [
                # Ding Yuan's camp
                {"id": "dy-tent", "kind": "building.tent", "rect": [2, 3, 2, 1], "door": "S", "label": "Ding Yuan's tent", "map": "dy-tent"},
                {"id": "lb-tent", "kind": "building.tent", "rect": [4, 3, 2, 1], "door": "S", "label": "Lü Bu's tent", "map": "lb-tent"},
                {"id": "dy-tent-2", "kind": "building.tent", "rect": [2, 8, 2, 1], "door": "S"},
                {"id": "dy-fire", "kind": "camp.firepit", "rect": [5, 7, 1, 1]},
                # Dong Zhuo's camp
                {"id": "dz-tent", "kind": "building.tent", "rect": [18, 2, 2, 1], "door": "S", "label": "Dong Zhuo's tent", "map": "dz-tent"},
                {"id": "stables", "kind": "building.stable", "rect": [15, 2, 2, 2], "door": "S", "label": "Dong Zhuo's stables"},
                {"id": "paymaster", "kind": "building.tent_small", "rect": [21, 3, 1, 1], "door": "S", "label": "The paymaster's tent"},
                {"id": "dz-tent-2", "kind": "building.tent", "rect": [16, 8, 2, 1], "door": "S"},
                {"id": "dz-tent-3", "kind": "building.tent", "rect": [20, 8, 2, 1], "door": "S"},
                {"id": "dz-fire", "kind": "camp.firepit", "rect": [22, 5, 1, 1]},
            ],
            "spots": [
                {"id": "charge", "at": [11, 6], "label": "The field between the camps", "note": "C7: Lü Bu's charge"},
                {"id": "c8", "at": [17, 5], "node": "2-c8", "label": "Dong Zhuo's stables"},
            ],
            "dress": [{"kind": "banner", "at_gates": True}, {"kind": "banner.black", "at_door": "dz-tent", "pair": True},
                      {"kind": "plant.grass", "in": "field", "count": 12}],
            "exits": [{"to": "Luoyang", "at": [23, 6], "side": "E"}],
            "entries": {"": [20, 5], "Luoyang": [22, 6]},
        },
        "maps": {
            "dz-tent": room([12, 7], [6, 6], floor="wood",
                            things=[{"id": "seat", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "Dong Zhuo's seat"},
                                    {"id": "table", "kind": "furn.table", "rect": [5, 3, 2, 1]},
                                    {"id": "rack", "kind": "furn.rack", "rect": [9, 1, 1, 1]}],
                            spots=[{"id": "c7", "at": [6, 4], "node": "2-c7", "label": "Dong Zhuo's tent"}]),
            "lb-tent": room([10, 7], [5, 6], floor="wood",
                            things=[{"id": "table", "kind": "furn.table", "rect": [4, 2, 2, 1]},
                                    {"id": "rack", "kind": "furn.rack", "rect": [1, 1, 1, 1], "label": "Lü Bu's halberd"},
                                    {"id": "bed", "kind": "furn.bed", "rect": [7, 1, 2, 1]}],
                            spots=[{"id": "c9", "at": [5, 4], "node": "2-c9", "label": "Lü Bu's tent"}]),
            "dy-tent": room([10, 7], [5, 6], floor="wood",
                            things=[{"id": "desk", "kind": "furn.desk", "rect": [4, 2, 2, 1], "label": "Ding Yuan's desk"},
                                    {"id": "lamp", "kind": "furn.lamp", "rect": [6, 2, 1, 1], "label": "The candle"},
                                    {"id": "bed", "kind": "furn.bed", "rect": [1, 1, 2, 1]}],
                            spots=[{"id": "c10", "at": [5, 4], "node": "2-c10", "label": "Ding Yuan's tent"}]),
        },
        "states": [
            {"id": "day", "light": "day"},
            {"id": "second-watch", "when": "node:c9", "until": "node:c10", "light": "night"},
        ],
        "npcs": [
            # the two givers of C8
            {"kind": "folk.soldier", "near": "stables", "label": "The stable master", "say": "“Red Hare. A thousand li a day, and he bites.”",
             "gives": "redhare", "gives_when": "node:c7",
             "give": ["The stable master brings out a horse red as coals, and puts the halter in your hand. “Mind his teeth.”"],
             "given": ["“Red Hare's gone, then. The stall looks empty without him.”"]},
            {"kind": "folk.official", "near": "paymaster", "label": "The paymaster", "say": "“Nothing goes out of here without the Lord's seal.”",
             "gives": "gold", "gives_when": "node:c7",
             "give": ["The paymaster counts out a thousand taels of gold, a few dozen bright pearls and a jade belt, and makes you sign for each."],
             "given": ["“A thousand taels, signed for. I hope he's worth it.”"]},
            {"kind": "folk.soldier", "at": [5, 5], "say": "“The young general rides in front. No one in the Xiliang army can stand against him.”"},
            {"kind": "folk.soldier", "at": [21, 7], "say": "“Thirty li we fell back. One man did that. One man and a halberd.”"},
        ],
        "objectives": {"2-c7": "Go to Dong Zhuo's tent.", "2-c8": "Collect the gifts: Red Hare from the stables, the gold from the paymaster.",
                       "2-c9": "Take the gifts to Lü Bu's tent, in Ding Yuan's camp to the west.", "2-c10": "Go to Ding Yuan's tent."},
    },

    # =========================================================================================
    # The East Road: a post station barring the road, the river crossing, Zhongmou's pass and its county jail
    "The East Road": {
        "archetype": "road",
        "plan": {
            "grid": [36, 9], "cell": 4, "margin": 1,
            "ground": [
                {"id": "valley", "kind": "plain", "rect": [0, 2, 36, 5]},
                {"id": "hills-n", "kind": "hills", "rect": [0, 0, 36, 2]},
                {"id": "hills-s", "kind": "hills", "rect": [0, 7, 36, 2]},
                {"id": "zhongmou", "kind": "ward", "rect": [27, 2, 8, 5]},
            ],
            "lines": [
                {"id": "road", "kind": "road", "path": [[0, 4], [35, 4]], "width": 3},
                {"id": "post-barrier", "kind": "wall", "path": [[8, 1], [8, 7]], "width": 1, "gates": {"post-gate": [8, 4]}},
                {"id": "river", "kind": "river", "path": [[16, 0], [16, 8]], "width": 4},
                {"id": "ferry", "kind": "bridge", "path": [[15, 4], [17, 4]], "width": 2},      # the ferry landing and the crossing
                {"id": "pass-wall", "kind": "wall", "path": [[26, 1], [26, 7]], "width": 1, "gates": {"pass-gate": [26, 4]}},
            ],
            "things": [
                {"id": "posthouse", "kind": "building.posthouse", "rect": [5, 2, 2, 2], "door": "S", "label": "A post station"},
                {"id": "notice-1", "kind": "landmark.notice", "rect": [6, 5, 1, 1], "label": "A wanted portrait: “a thousand gold and a marquisate”"},
                {"id": "ferry-hut", "kind": "building.hut", "rect": [12, 2, 2, 1], "door": "S", "label": "The ferryman's hut"},
                {"id": "posthouse-2", "kind": "building.posthouse", "rect": [21, 2, 2, 2], "door": "S", "label": "A post station"},
                {"id": "notice-2", "kind": "landmark.notice", "rect": [22, 5, 1, 1], "label": "The same portrait, nailed up again"},
                {"id": "jail", "kind": "building.hall", "rect": [29, 3, 2, 1], "door": "S", "label": "Zhongmou county jail", "map": "jail-court"},
                {"id": "zm-house-1", "kind": "building.house", "rect": [32, 3, 2, 1], "door": "S"},
                {"id": "zm-house-2", "kind": "building.house", "rect": [29, 5, 2, 1], "door": "N"},
            ],
            "spots": [
                {"id": "c18", "at": [25, 4], "node": "2-c18", "label": "The pass at Zhongmou", "trigger": "near"},
            ],
            "dress": [{"kind": "milestone", "along": "road", "every": 6}, {"kind": "tree.poplar", "along": "road", "every": 3}],
            "exits": [{"to": "Luoyang", "at": [0, 4], "side": "W"}, {"to": "Chenggao", "at": [35, 4], "side": "E"}],
            "entries": {"": [1, 4], "Luoyang": [1, 4], "Chenggao": [34, 4]},
        },
        "maps": {
            "jail-court": room([12, 8], [6, 7], floor="stone",
                               things=[{"id": "stocks", "kind": "furn.rack", "rect": [2, 1, 1, 1], "label": "The stocks"},
                                       {"id": "lamp", "kind": "furn.lamp", "rect": [9, 1, 1, 1]},
                                       {"id": "table", "kind": "furn.table", "rect": [5, 2, 2, 1], "label": "The magistrate's table"}],
                               spots=[{"id": "c19", "at": [6, 5], "node": "2-c19", "label": "The back courtyard of the jail"}])
            | {"label": "The back courtyard of the jail"},
        },
        "states": [
            {"id": "road", "until": "node:c19", "light": "day",
             "exits_closed": ["Luoyang", "Chenggao"],
             "exits_closed_say": {"Luoyang": ["Your portrait hangs on every gate of Luoyang. There's no going back."],
                                  "Chenggao": ["Zhongmou's pass is shut to a man with your face. Get through it first."]}},
            {"id": "night", "when": "node:c18", "until": "node:c19", "light": "night"},
            {"id": "free", "when": "node:c19", "light": "day",
             "exits_closed": ["Luoyang"], "exits_closed_say": {"Luoyang": ["Not back. East, to your father's country."]}},
        ],
        "npcs": [
            _talk("folk.villager", [10, 5], "“They say he tried to kill the Chancellor with a jewelled sword. A thousand gold for him, and a marquisate.”"),
            _talk("folk.elder", [31, 6], "“Our magistrate came from Dongjun. He keeps his own counsel.”"),
        ],
        "objectives": {"2-c18": "Ride on east to the pass at Zhongmou.", "2-c19": "The jail's back courtyard."},
    },

    # =========================================================================================
    # Chenggao: the deep wood, Lü Boshe's farm, the road to the west village, a roadside inn
    "Chenggao": {
        "archetype": "village",
        "plan": {
            "grid": [24, 12], "cell": 4, "margin": 1,
            "ground": [
                {"id": "wood", "kind": "field", "rect": [0, 1, 7, 10]},          # the deep wood (dressed thick)
                {"id": "farm", "kind": "court", "rect": [8, 2, 8, 5]},           # Lü Boshe's farmyard
                {"id": "fields", "kind": "field.wheat", "rect": [8, 9, 8, 3]},
                {"id": "verge", "kind": "field", "rect": [16, 1, 8, 7]},
            ],
            "lines": [
                {"id": "road", "kind": "road", "path": [[0, 8], [23, 8]], "width": 3},
                {"id": "wood-path", "kind": "path", "path": [[3, 8], [3, 3]], "width": 2},
                {"id": "farm-lane", "kind": "path", "path": [[12, 7], [12, 8]], "width": 2},
                {"id": "farm-wall", "kind": "wall", "outline": [8, 1, 8, 7], "width": 1, "gates": {"farm-gate": [12, 7]}},
            ],
            "things": [
                {"id": "lbs-hall", "kind": "building.house", "rect": [11, 4, 2, 1], "door": "S", "label": "Lü Boshe's front hall", "map": "lbs-hall"},
                {"id": "rear-hall", "kind": "building.hut", "rect": [9, 2, 2, 1], "door": "S", "label": "The thatched rear hall",
                 "note": "the knives are being sharpened behind it (C20)"},
                {"id": "kitchen", "kind": "building.hut", "rect": [13, 2, 2, 1], "door": "S", "label": "The kitchen",
                 "note": "where the pig is tied up for the slaughter"},
                {"id": "inn", "kind": "building.inn", "rect": [19, 7, 2, 1], "door": "S", "label": "A roadside inn", "map": "inn-room"},
            ],
            "spots": [
                {"id": "overhear", "at": [9, 3], "label": "Behind the thatched hall", "trigger": "near",
                 "note": "C20, walked: Cao Cao creeps here and hears 「缚而杀之，何如？」 (crouched)"},
                {"id": "boshe-road", "at": [17, 8], "label": "The road towards the west village", "note": "C20: Lü Boshe comes back with the wine"},
            ],
            "dress": [{"kind": "tree.big", "in": "wood", "count": 16}, {"kind": "tree.small", "in": "wood", "count": 10},
                      {"kind": "tree.willow", "along": "road", "every": 5}],
            "exits": [{"to": "The East Road", "at": [0, 8], "side": "W"}, {"to": "Chenliu", "at": [23, 8], "side": "E"}],
            "entries": {"": [1, 8], "The East Road": [1, 8], "Chenliu": [22, 8]},
        },
        "maps": {
            "lbs-hall": room([12, 7], [6, 6], floor="wood",
                             things=[{"id": "table", "kind": "furn.table", "rect": [5, 2, 2, 1]},
                                     {"id": "hearth", "kind": "furn.hearth", "rect": [1, 1, 1, 1]},
                                     {"id": "jars", "kind": "furn.jar", "rect": [10, 1, 1, 1]}],
                             spots=[{"id": "c20", "at": [6, 4], "node": "2-c20", "label": "Lü Boshe's front hall"}]),
            "inn-room": room([10, 7], [5, 6], floor="wood",
                             things=[{"id": "bed-1", "kind": "furn.bed", "rect": [1, 1, 2, 1], "label": "Where Cao Cao sleeps"},
                                     {"id": "bed-2", "kind": "furn.bed", "rect": [7, 1, 2, 1]},
                                     {"id": "lamp", "kind": "furn.lamp", "rect": [4, 1, 1, 1]}],
                             spots=[{"id": "c21", "at": [5, 4], "node": "2-c21", "label": "The inn, by moonlight"}]),
        },
        "states": [
            {"id": "dusk", "until": "node:c20", "light": "dusk",
             "exits_closed": ["The East Road", "Chenliu"],
             "exits_closed_say": {"The East Road": ["Back towards the pass? Not with Chen Gong's post deserted behind you."],
                                  "Chenliu": ["It's nearly dark. Lü Boshe's farm is here, your father's sworn brother's."]}},
            {"id": "night", "when": "node:c20", "until": "node:c21", "light": "night",
             "exits_closed": ["The East Road", "Chenliu"],
             "exits_closed_say": {"The East Road": ["Not back. Not now."], "Chenliu": ["Not in the dark. The inn first."]}},
            {"id": "morning", "when": "node:c21", "light": "morning",
             "exits_closed": ["The East Road"], "exits_closed_say": {"The East Road": ["East. Home."]}},
        ],
        "objectives": {"2-c20": "Go to Lü Boshe's farm, in the walled yard north of the road.", "2-c21": "Go into the roadside inn."},
    },

    # =========================================================================================
    # Chenliu: the Cao family house, Wei Hong's mansion, the market, the village drilling ground
    "Chenliu": {
        "archetype": "village",
        "plan": {
            "grid": [20, 13], "cell": 4, "margin": 1,
            "ground": [
                {"id": "town", "kind": "ward", "rect": [0, 1, 20, 6]},
                {"id": "market", "kind": "market", "rect": [11, 2, 5, 4]},
                {"id": "drill", "kind": "camp", "rect": [7, 8, 11, 4]},         # the village drilling ground
                {"id": "fields", "kind": "field.wheat", "rect": [0, 8, 6, 5]},
            ],
            "lines": [
                {"id": "road", "kind": "road", "path": [[0, 7], [19, 7]], "width": 3},
                {"id": "drill-way", "kind": "road", "path": [[12, 7], [12, 9]], "width": 2},
            ],
            "things": [
                {"id": "cao-house", "kind": "building.hall", "rect": [2, 6, 2, 1], "door": "S", "label": "The Cao family house", "plaque": "曹府"},
                {"id": "weihong", "kind": "building.hall_grand", "rect": [6, 5, 3, 2], "door": "S", "label": "Wei Hong's mansion",
                 "map": "wh-hall", "plaque": "卫府"},
                {"id": "stalls", "kind": "market.stalls", "rect": [12, 3, 2, 1], "label": "Grain stalls"},
                {"id": "house-1", "kind": "building.house", "rect": [16, 6, 2, 1], "door": "S"},
                {"id": "banner", "kind": "banner.white", "rect": [12, 10, 1, 1], "label": "The white banner, 忠义", "when": "node:c22"},
            ],
            "spots": [
                {"id": "c23", "at": [13, 9], "node": "2-c23", "label": "The village drilling ground", "trigger": "near"},
            ],
            "dress": [{"kind": "tree.willow", "along": "road", "every": 4}],
            "exits": [{"to": "Chenggao", "at": [0, 7], "side": "W"}],
            "entries": {"": [1, 7], "Chenggao": [1, 7]},
        },
        "maps": {
            "wh-hall": room([12, 7], [6, 6],
                            things=[{"id": "dais", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "Wei Hong's seat"},
                                    {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 1, 1]},
                                    {"id": "table-2", "kind": "furn.table", "rect": [8, 3, 1, 1]},
                                    {"id": "chest", "kind": "furn.chest", "rect": [10, 1, 1, 1], "label": "Wei Hong's strongbox"}],
                            spots=[{"id": "c22", "at": [6, 4], "node": "2-c22", "label": "Wei Hong's banquet"}]),
        },
        "states": [{"id": "home", "light": "day"}, {"id": "rally", "when": "node:c22", "light": "day"}],
        "npcs": [
            {"kind": "folk.elder", "near": "cao-house", "label": "Cao Song", "say": "“Money, son. An army eats before it fights.”"},
            _talk("folk.villager", [15, 10], "“They put up a white banner. Loyalty and right. I came for the rice, and I'll stay for the banner.”",
                  **{"in": ["rally"]}),
            _talk("folk.hunter", [9, 10], "“Two thousand of us from the hills, and more coming. Is it true he went at Dong Zhuo with a sword?”",
                  **{"in": ["rally"]}),
        ],
        "objectives": {"2-c22": "Go to Wei Hong's mansion, on the road east of your father's house.",
                       "2-c23": "Take Wei Hong's fortune to the drilling ground, south of the road."},
    },
}

# Road challengers: 12, 4 blocking (caocao-arc.md, "Road challengers")
PLANS_CC["Luoyang"]["challengers"] = [
    # the burning palace (C3), Cao Cao: an armed guard at the Qingsuo Gate (blocking), a looter in the outer court
    _ch("gate-guard", "folk.soldier", [8, 10], "node:c2", "node:c3",
        "A eunuch's guardsman bars the Qingsuo Gate, blade out, smoke pouring past him. “No one goes in! The Attendants' orders!”",
        "“…The Attendants are fled. Go in, then. Find him.”", "The guardsman has thrown down his blade and gone.",
        blocks="c3", view=1, map="palace", entry=[8, 14], guard="qingsuo-gate"),
    _ch("looter", "folk.villager", [3, 13], "node:c2", "node:c3",
        "A man with an armful of palace silk backs out of the storehouse. “Everyone's taking something. Want to stop me? Play me for it.”",
        "“…Fine. Fine! It's back on the shelf.”", "The silk is back on the shelf.", map="palace"),
    # Luoyang under Dong Zhuo (C13-C15): a Xiliang cavalryman on the street, an official who resigned with Lu Zhi
    _ch("cavalryman", "folk.soldier", [12, 8], "node:c12", "node:c16",
        "A Xiliang horseman wheels in front of you. “Colonel Cao. The Chancellor's man, now? Prove you can think as well as bow.”",
        "“Huh. Not a fool, then.”", "The horseman rides on down the middle of the street."),
    _ch("resigned", "folk.official", [16, 11], "node:c12", "node:c16",
        "An old official sits at the market go table in a plain robe. “I resigned with Lu Zhi. Sit, Colonel, and tell me with stones why you didn't.”",
        "“…So you have a plan of your own. Good. Don't tell me.”", "“Go on, Colonel. Whatever you mean to do, do it well.”"),
]
PLANS_CC["The Camps"]["challengers"] = [
    # Li Su's ride to Lü Bu (C9): the novel's own ambush pickets, blocking the gate of Ding Yuan's camp; one of Ding Yuan's scouts
    _ch("pickets", "folk.soldier", [8, 6], "node:c8", "node:c9",
        "Pickets lying in ambush by the road spring up and surround you. “Who rides to General Lü's camp with a horse like that?”",
        "“…An old friend of the general's. Pass, then.”", "The pickets wave you through.", blocks="lb-tent", view=1, entry=[20, 6], guard="dy-gate"),
    _ch("scout", "folk.soldier", [11, 3], "node:c8", "node:c9",
        "One of Ding Yuan's scouts reins in beside you. “Xiliang colours, and gifts. What does Dong Zhuo want with us?”",
        "“…Peace, then. I hope so.”", "The scout rides back to watch the road."),
]
PLANS_CC["The East Road"]["challengers"] = [
    # the east road (C17-C18), Cao Cao: a post station checking faces (blocking), the ferryman (blocking), a bounty hunter
    _ch("post-guard", "folk.soldier", [7, 4], "node:c17", "node:c18",
        "The post-station guard holds up the portrait and looks from it to you. “Your name, and your business on this road.”",
        "“…No. He'd be older. Go on.”", "The guard is looking at someone else now.", blocks="c18", view=1, guard="post-gate"),
    _ch("ferryman", "folk.villager", [14, 4], "node:c17", "node:c18",
        "The ferryman leans on his pole. “Crossing's a coin. Or a game, if you're short. I've seen your face somewhere, I think.”",
        "“…No, I haven't. Get in.”", "“Same price as before, sir.”", blocks="c18", view=1, guard=[16, 4]),
    _ch("bounty", "folk.hunter", [20, 5], "node:c17", "node:c18",
        "A man with the portrait folded in his belt falls in beside you. “A thousand gold. Thinking of it makes a man sharp.”",
        "“…Not sharp enough, it seems.”", "The bounty hunter studies every face that passes."),
]
PLANS_CC["Chenggao"]["challengers"] = [
    # Zhongmou to Chenggao (C19-C20): a woodcutter in the deep wood
    _ch("woodcutter", "folk.villager", [3, 4], "node:c19", "node:c20",
        "A woodcutter sets down his load in the deep wood. “Two riders, at dusk, off the road. Play me, and I'll forget I saw you.”",
        "“…I never saw you. Lü Boshe's farm is just past the trees.”", "The woodcutter goes back to his axe."),
]
PLANS_CC["Chenliu"]["challengers"] = [
    # Chenliu (C22-C23): a volunteer swordsman testing the recruiter, a grain merchant
    _ch("swordsman", "folk.soldier", [16, 10], "node:c22", None,
        "A volunteer swordsman blocks the recruiter's table. “I'll follow a man who can think. Show me you can.”",
        "“…Put my name down.”", "The swordsman is drilling with the others."),
    _ch("merchant", "folk.villager", [14, 4], "node:c22", None,
        "A grain merchant eyes Wei Hong's carts. “An army needs grain, and I have grain. Let's see what kind of bargainer you are.”",
        "“…Done. Half the price, for the banner.”", "“The carts go out tomorrow, Lord Cao.”"),
]
