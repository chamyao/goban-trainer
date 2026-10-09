"""Lady Sun's marriage (novel chapters 54–55), as plan grids (docs/book2/plan-grid.md).

Design: docs/book2/ladysun-arc.md (Plot). Beat keys are its keys, 4-s1 ... 4-s15. Every Chinese line here is modern
Mandarin in simplified characters (the user: "write this book's language in modern Chinese that's easier to understand").

    python3 tools/check_plans_w2.py --arc ls [--png]       # check (and draw into docs/book2/plans-ls/)
    python3 tools/mapfactory build --world 15 --plans ls   # with Plot's WORLD2_LS

The places, in the story's order: Chaisang (a cutaway only) -> Jingzhou -> Nanxu (the loud town) -> Sweet Dew Temple
-> Nanxu again (the wedding, the winter, the flight) -> the road to Chaisang (the road block, the face-down) -> Liulangpu.

The book's two map mechanics, in the engine's syntax (tk-feats.js, Integration):
  the loud town (Nanxu, while s4 is open):
    npc "gossip": {"tells": [ids], "in_beats": ["s4"]}   told (talked to), they walk to each neighbour named and tell them
                 + "relay": true                       told only by a neighbour, never by the player
    prop "told": id                                        red hangings at a house door, shown once that person knows
    spot "fires": "told:<id>"                              its beat starts by itself once the news reaches them
  the face-down (the road to Chaisang, after s13):
    npc "yield": {"group", "reach" (tiles), "aside" [dx, dy] (tiles), "line", "caught", "back_to": spot}
        standing still and facing them within reach, they step aside one by one; moving within 1.4 tiles of one who
        hasn't is a catch, back to back_to
"""
from tk_plans_w2 import ART as ART2, LINE_KINDS, NEW_KINDS as NEW_KINDS2, ZONE_KINDS, room

# the beats this arc's plans place (the design's table: s1 ... s15)
KEYS_LS = {f"s{i}" for i in range(1, 16)}

# Kinds this arc adds: footprint in tiles (w, h, solid)
NEW_KINDS = {**NEW_KINDS2,
             "prop.boat": (4, 2, True),          # a river boat moored at a jetty (Nanxu's dock)
             "prop.target": (1, 1, True),        # an archery butt on a stand (the riding ground, s9)
             "landmark.incense": (2, 1, True),   # a temple's bronze incense burner (Sweet Dew Temple's court)
             }
ART = {**ART2,
       "prop.boat": "a Han river boat moored at a timber jetty: a long hull, a woven-mat cabin roof, oars shipped; "
                    "four tiles long, two deep, seen from above at the same 3/4 angle as the buildings, on water",
       "prop.target": "an archery butt: a round straw target painted in red and white rings on a wooden stand, one tile",
       "landmark.incense": "a temple's great bronze incense burner on three legs, smoke curling up, two tiles wide",
       }


def _talk(kind, at, say, **kw):
    return {"kind": kind, "at": at, "say": say, **kw}


def _gossip(gid, kind, at, say, tells, **kw):
    """A townsperson of the loud town: told, they say so, and take the news to each neighbour in "tells"."""
    return {"id": gid, "kind": kind, "at": at, "say": say, "gossip": {"tells": tells, "in_beats": ["s4"]}, "in": ["news"], **kw}


def _relay(gid, kind, at, say, tells, **kw):
    """A townsperson the news reaches only from a neighbour (never from the player): told, they say their line and take
    it on to each in "tells"."""
    g = _gossip(gid, kind, at, say, tells, **kw)
    g["gossip"]["relay"] = True
    return g


def _yield(kind, at, group, aside, line, caught, **kw):
    """One of the pursuers across the narrow road: faced down, he steps aside (into the pocket beyond his rank)."""
    return {"kind": kind, "at": at, "say": [], "when": "node:s13", "until": "node:s14",
            "yield": {"group": group, "reach": 4, "aside": aside, "line": [line], "caught": [caught], "back_to": "block-start"}, **kw}


PLANS_LS = {
    # =========================================================================================
    # Chaisang: Zhou Yu's seat on the river. Only the cutaway s1 is played here (in his hall); the place is not walked.
    "Chaisang": {
        "archetype": "city",
        "banners": "red",
        "plan": {
            "grid": [14, 10], "cell": 4, "margin": 1,
            "ground": [{"id": "town", "kind": "city", "rect": [2, 3, 10, 6]}],
            "lines": [
                {"id": "river", "kind": "river", "path": [[0, 0], [13, 0]], "width": 4},
                {"id": "wall", "kind": "wall.city", "outline": [1, 2, 12, 8], "width": 2, "gates": {"river-gate": [6, 2]}},
                {"id": "street", "kind": "road", "path": [[6, 1], [6, 8]], "width": 3},
            ],
            "things": [
                {"id": "zhoufu", "kind": "building.hall_grand", "rect": [3, 4, 3, 2], "door": "E", "label": "Zhou Yu's hall",
                 "map": "zy-hall", "plaque": "都督府"},
                {"id": "store", "kind": "building.storehouse", "rect": [8, 5, 3, 2]},
            ],
            "exits": [],
            "entries": {"": [6, 7]},
        },
        "states": [{"id": "day", "light": "day"}],
        "maps": {
            # s1: Zhou Yu lays the trap; Lu Su listens (Zhou Yu at the spot's 0,-4, Lu Su at 8,0)
            "zy-hall": room([12, 7], [6, 6],
                            things=[{"id": "seat", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "The commander's seat"},
                                    {"id": "map", "kind": "furn.screen", "rect": [8, 1, 2, 1], "label": "A map of the river"},
                                    {"id": "rack", "kind": "furn.rack", "rect": [1, 1, 1, 1]}],
                            spots=[{"id": "s1", "at": [4, 4], "node": "4-s1", "label": "Zhou Yu's hall"}])
            | {"label": "Zhou Yu's hall"},
        },
        "objectives": {"4-s1": "Zhou Yu lays a trap."},
    },

    # =========================================================================================
    # Jingzhou: Liu Bei's seat. Zhao Yun starts outside the government hall, where Lü Fan has come from Wu (s2).
    "Jingzhou": {
        "archetype": "city",
        "banners": "red",
        "plan": {
            "grid": [16, 12], "cell": 4, "margin": 1,
            "ground": [
                {"id": "town", "kind": "city", "rect": [2, 2, 12, 8]},
                {"id": "fore-hall", "kind": "court", "rect": [5, 5, 6, 1]},     # before the government hall
                {"id": "market", "kind": "market", "rect": [10, 7, 3, 2]},
            ],
            "lines": [
                {"id": "wall", "kind": "wall.city", "outline": [1, 1, 14, 10], "width": 2, "gates": {"south-gate": [8, 10]}},
                {"id": "main-street", "kind": "road", "path": [[2, 6], [13, 6]], "width": 3},
                {"id": "south-street", "kind": "road", "path": [[8, 6], [8, 11]], "width": 3},
                {"id": "river", "kind": "river", "path": [[0, 11], [15, 11]], "width": 3},
            ],
            "things": [
                {"id": "zhoufu", "kind": "building.hall_grand", "rect": [5, 2, 6, 3], "door": "S", "label": "The government hall",
                 "map": "jz-hall", "plaque": "荆州府"},
                {"id": "house-1", "kind": "building.house", "rect": [2, 7, 2, 2]},
                {"id": "house-2", "kind": "building.house", "rect": [4, 7, 2, 2]},
                {"id": "stalls", "kind": "market.stalls", "rect": [11, 7, 2, 1], "label": "Market stalls"},
                {"id": "house-3", "kind": "building.house", "rect": [11, 2, 3, 2]},
            ],
            "spots": [{"id": "hall-steps", "at": [8, 6], "at_door": "zhoufu", "label": "The steps of the government hall",
                       "note": "Zhao Yun starts here"}],
            "dress": [{"kind": "tree.willow", "along": "main-street", "every": 4}, {"kind": "banner.red", "at_door": "zhoufu", "pair": True}],
            "exits": [],
            "entries": {"": [8, 6]},
        },
        "states": [{"id": "day", "light": "day"}],
        "npcs": [
            _talk("folk.soldier", [6, 6], "“An envoy from Wu, Lü Fan. He came by boat this morning, and the Directing General is with our lord already.”"),
            _talk("folk.villager", [12, 8], "“A boat from Wu at the landing, flying red. A wedding, the boatmen say. Whose?”"),
        ],
        "maps": {
            # s2: Liu Bei receives Lü Fan; Zhuge Liang listens behind the folding screen (13,-7); Lü Fan comes in from the door
            "jz-hall": room([18, 8], [15, 7],
                            things=[{"id": "dais", "kind": "furn.dais", "rect": [3, 1, 2, 1], "label": "Liu Bei's seat"},
                                    {"id": "screen", "kind": "furn.screen", "rect": [9, 3, 2, 1], "label": "A folding screen"},
                                    {"id": "table-1", "kind": "furn.table", "rect": [6, 4, 1, 1]},
                                    {"id": "rack", "kind": "furn.rack", "rect": [16, 1, 1, 1]}],
                            spots=[{"id": "s2", "at": [3, 6], "node": "4-s2", "label": "The government hall"}])
            | {"label": "The government hall"},
        },
        "objectives": {"4-s2": "Go into the government hall. An envoy has come from Wu."},
    },

    # =========================================================================================
    # Nanxu: Sun Quan's city on the south bank. The boats land at the dock outside the river gate (s3). Then the loud
    # town: the five hundred in red buy for the wedding and tell everyone, and the news goes house to house until it
    # reaches Lady Wu's gate, the one person who doesn't know (s4). Liu Bei goes to Qiao Guolao with a lamb and wine.
    # Later the wedding (red), the winter (snow, Zhao Yun riding and shooting outside the east gate, s9), the east palace
    # (s10) and Lady Wu's hall again (s11), and out by the west gate onto the road.
    "Nanxu": {
        "archetype": "city",
        "banners": "red",
        "plan": {
            "grid": [28, 18], "cell": 4, "margin": 1,
            "ground": [
                {"id": "river", "kind": "water", "rect": [0, 0, 28, 1]},              # the Great River
                {"id": "wharf", "kind": "court", "rect": [3, 1, 6, 1]},               # the dock, between the river and the wall
                {"id": "town", "kind": "city", "rect": [3, 3, 18, 13]},
                {"id": "market", "kind": "market", "rect": [9, 6, 3, 3]},           # where the men in red buy for the wedding
                {"id": "riding-ground", "kind": "field", "rect": [22, 10, 5, 6]},   # outside the east gate: riding and archery
            ],
            "lines": [
                {"id": "jetty", "kind": "bridge", "path": [[5, 1], [5, 0]], "width": 2},
                {"id": "wall", "kind": "wall.city", "outline": [2, 2, 20, 15], "width": 2,
                 "gates": {"river-gate": [6, 2], "west-gate": [2, 9], "east-gate": [21, 9]}},
                {"id": "dock-road", "kind": "road", "path": [[3, 1], [8, 1]], "width": 2},
                {"id": "north-street", "kind": "road", "path": [[6, 1], [6, 9]], "width": 3},
                {"id": "main-street", "kind": "road", "path": [[0, 9], [25, 9]], "width": 3},
                {"id": "east-road", "kind": "road", "path": [[25, 9], [25, 2], [27, 2]], "width": 3},   # to Sweet Dew Temple
                {"id": "palace-street", "kind": "road", "path": [[13, 5], [13, 13]], "width": 3},
                {"id": "lane-n", "kind": "road", "path": [[6, 5], [20, 5]], "width": 2},
                {"id": "back-street", "kind": "road", "path": [[3, 13], [20, 13]], "width": 2},
            ],
            "things": [
                {"id": "boat-1", "kind": "prop.boat", "rect": [3, 0, 2, 1], "on": "water", "label": "A boat from Jingzhou"},
                {"id": "boat-2", "kind": "prop.boat", "rect": [6, 0, 2, 1], "on": "water"},
                # Sun Quan's hall (cutaways s8, s12) and the east palace (s10; the bridal room inside, s7), north of the lane
                {"id": "sunfu", "kind": "building.hall_grand", "rect": [8, 3, 4, 2], "door": "S", "label": "Sun Quan's hall",
                 "map": "sq-hall", "plaque": "吴侯府"},
                {"id": "dongfu", "kind": "building.compound", "rect": [15, 3, 5, 2], "door": "S", "label": "The east palace",
                 "map": "east-palace", "plaque": "东府"},
                # Lady Wu's palace, south of the main street: shut to the news until it arrives (s4), open after
                {"id": "wufu", "kind": "building.palace", "rect": [15, 10, 5, 3], "door": "N", "label": "Lady Wu's palace",
                 "map": "wu-hall", "plaque": "国太府", "open_to": ["told:wu-gatekeeper"],
                 "refuse": ["Lady Wu's gate is quiet. The news hasn't reached her yet."]},
                {"id": "qiao", "kind": "building.compound", "rect": [3, 10, 3, 3], "door": "N", "label": "Qiao Guolao's house",
                 "plaque": "乔府"},
                # the market: the men in red buy sheep and wine here
                {"id": "stalls", "kind": "market.stalls", "rect": [9, 6, 2, 1], "label": "A mutton seller"},
                {"id": "wineshop", "kind": "building.shop", "rect": [10, 7, 2, 1], "door": "S", "label": "The wine shop"},
                # the notice board at the crossroads: the wedding is posted there, and the news crosses the palace street
                {"id": "notice", "kind": "landmark.notice", "rect": [12, 8, 1, 1], "label": "A notice board"},
                # the houses the news goes round (each hangs out red once it knows)
                {"id": "h1", "kind": "building.house", "rect": [4, 3, 2, 2], "door": "E"},
                {"id": "h2", "kind": "building.house", "rect": [4, 6, 2, 2], "door": "E"},
                {"id": "h3", "kind": "building.house", "rect": [7, 6, 2, 2], "door": "N"},
                {"id": "h4", "kind": "building.house", "rect": [14, 6, 2, 2], "door": "N"},
                {"id": "h5", "kind": "building.house", "rect": [17, 6, 2, 2], "door": "N"},
                {"id": "h6", "kind": "building.house", "rect": [7, 10, 2, 2], "door": "N"},
                {"id": "h7", "kind": "building.house", "rect": [10, 10, 2, 2], "door": "N"},
                {"id": "h8", "kind": "building.house", "rect": [3, 14, 2, 2], "door": "N"},
                {"id": "h9", "kind": "building.house", "rect": [7, 14, 2, 2], "door": "N"},
                {"id": "h10", "kind": "building.house", "rect": [10, 14, 2, 2], "door": "N"},
                {"id": "h11", "kind": "building.house", "rect": [15, 14, 2, 2], "door": "N"},
                {"id": "h12", "kind": "building.house", "rect": [18, 14, 2, 2], "door": "N"},
            ],
            "spots": [
                {"id": "dock", "at": [5, 1], "label": "The dock", "note": "the boats from Jingzhou land here (s2's handoff)"},
                {"id": "s3", "at": [4, 1], "node": "4-s3", "label": "The dock", "trigger": "near"},
                {"id": "lamb", "at": [9, 7], "label": "A mutton seller", "note": "the lamb for Qiao Guolao"},
                {"id": "wine", "at": [11, 8], "at_door": "wineshop", "label": "The wine shop", "note": "the wine for Qiao Guolao"},
                {"id": "qiao-gate", "at": [4, 9], "at_door": "qiao", "label": "Qiao Guolao's gate"},
                # where the news has to arrive: her gatekeeper (s4, a cutaway in her hall, plays once he's told)
                {"id": "wu-gate", "at": [17, 9], "at_door": "wufu", "label": "Lady Wu's gate"},
                {"id": "s9", "at": [24, 13], "node": "4-s9", "label": "The riding ground", "trigger": "near"},
            ],
            # red hangings over each house front (Graphics' deco.redhang), shown once its resident has the news
            "props": [{"kind": "deco.redhang", "over": f"h{i}", "told": f"g-h{i}", "lift": 6} for i in range(1, 13)],
            "dress": [
                {"kind": "tree.willow", "along": "main-street", "every": 4},
                {"kind": "lamp.post", "along": "palace-street", "every": 3},
                {"kind": "banner", "at_gates": True},
                {"kind": "banner.red", "at_door": "wufu", "pair": True},
                {"kind": "banner.red", "at_door": "sunfu", "pair": True},
                {"kind": "prop.lanterns", "at_door": "dongfu", "pair": True},
                {"kind": "prop.target", "in": "riding-ground", "count": 4},
            ],
            "exits": [{"to": "The road to Chaisang", "at": [0, 9], "side": "W"},
                      {"to": "Sweet Dew Temple", "at": [27, 2], "side": "E"}],
            "entries": {"": [5, 1], "The road to Chaisang": [1, 9], "Sweet Dew Temple": [26, 2]},
        },
        "states": [
            {"id": "arrival", "until": "node:s3", "light": "day"},
            {"id": "news", "when": "node:s3", "until": "node:s4", "light": "day"},       # the loud town
            {"id": "wedding", "when": "node:s4", "until": "node:s8", "light": "day"},
            {"id": "winter", "when": "node:s8", "until": "node:s11", "light": "day", "weather": "snow"},   # 「住到年终」
            {"id": "newyear", "when": "node:s11", "light": "morning"},                   # New Year's Day: she leaves
        ],
        "npcs": [
            # the loud town (s3 -> s4). The player tells three people, all on Liu Bei's errand: the mutton seller and
            # the wine seller (the lamb and wine), and Qiao Guolao's steward at his gate. Each one told hurries to the
            # next house, and that house to the next, hanging out red as it goes: the player watches the news travel.
            # Only the steward's goes to Lady Wu's gate (as in the novel, Qiao Guolao's household takes it to her); the
            # market's light their own streets. Everyone else is a relay, told only by a neighbour, never by the player.
            _gossip("g-lamb", "folk.villager", [9, 7], "“A whole lamb, for Qiao Guolao? So the wedding talk is true!”", ["g-h3"]),
            _gossip("g-wine", "folk.woman", [11, 8], "“My best jar, for Liu Bei's wedding gift? Here, take two.”", ["g-h4"]),
            _gossip("g-qiao", "folk.official", [5, 9], "“A lamb and wine from Liu Bei, for my master? Then it's true. My master will want the Dowager to hear it from him.”",
                    ["g-h6"]),
            _relay("g-h3", "folk.villager", [7, 5], "“So that's what the red cloth is for.”", ["g-h2"]),
            _relay("g-h2", "folk.elder", [6, 7], "“Liu Bei, the Marquis's brother-in-law?”", ["g-h1"]),
            _relay("g-h1", "folk.villager", [6, 3], "“The Marquis's sister! Well, well.”", []),
            _relay("g-h4", "folk.porter", [14, 5], "“No wonder they paid in silver.”", ["g-h5"]),
            _relay("g-h5", "folk.elder", [18, 5], "“Does the Dowager know?”", []),
            _relay("g-h6", "folk.villager", [7, 9], "“Qiao Guolao's own steward said so? Then it's certain.”", ["g-h7", "g-h9"]),
            _relay("g-h7", "folk.porter", [10, 9], "“Her own daughter's wedding, and the Dowager hasn't heard?”", ["wu-gatekeeper", "g-h10"]),
            _relay("g-h9", "folk.villager", [7, 13], "“Liu Bei? The one whose arms reach past his knees?”", ["g-h8"]),
            _relay("g-h8", "folk.porter", [3, 13], "“Even the back streets have heard.”", []),
            _relay("g-h10", "folk.elder", [10, 13], "“A feast, then. I'll get my good clothes out.”", ["g-h11"]),
            _relay("g-h11", "folk.villager", [15, 13], "“Red on every door. Ours too!”", ["g-h12"]),
            _relay("g-h12", "folk.porter", [18, 13], "“The whole city's red, right up to the palace.”", []),
            {"id": "wu-gatekeeper", "kind": "folk.soldier", "at": [16, 9],
             "say": "“The Dowager is at her prayers. Nothing's been said here about any wedding.”", "in": ["arrival", "news"]},
            # townsfolk in between, who don't pass it on
            _talk("folk.villager", [12, 9], "“Red cloth everywhere today. Is it a festival?”", **{"in": ["news"]}),
            _talk("folk.elder", [13, 12], "“The palace is quiet today. The Dowager's at her prayers.”", **{"in": ["news"]}),
            _talk("folk.porter", [7, 1], "“Boats from upriver, flying red? What's all that about?”", **{"in": ["arrival", "news"]}),
            _talk("folk.villager", [12, 5], "“My wife says the butchers have sold out by noon.”", **{"in": ["news"]}),
            _talk("folk.woman", [19, 9], "“I serve in the Dowager's kitchens. Nothing's been said there.”", **{"in": ["news"]}),
            # the wedding and the winter
            _talk("folk.villager", [12, 9], "“Red lanterns on every street. The Marquis's sister is married, and the whole city's had a feast.”",
                  **{"in": ["wedding"]}),
            _talk("folk.soldier", [20, 9], "“Liu Bei's men drill outside the east gate every day. Their general's the one who rode through Changban.”",
                  **{"in": ["wedding", "winter"]}),
            _talk("folk.elder", [12, 12], "“Snow on the river. The year's nearly out, and Liu Bei hasn't left the east palace since autumn.”",
                  **{"in": ["winter"]}),
        ],
        "maps": {
            # Lady Wu's hall: the news arrives (s4: Lady Wu at 0,-4, Qiao Guolao 8,0, Sun Quan in from the door at 20,2)
            # and Lady Sun asks her mother's leave (s11: Lady Wu at 0,-6)
            "wu-hall": room([16, 8], [13, 7],
                            things=[{"id": "seat", "kind": "furn.dais", "rect": [3, 1, 2, 1], "label": "Lady Wu's seat"},
                                    {"id": "screen", "kind": "furn.screen", "rect": [6, 1, 2, 1]},
                                    {"id": "table-1", "kind": "furn.table", "rect": [10, 3, 1, 1]},
                                    {"id": "rack", "kind": "furn.jar", "rect": [14, 1, 1, 1]}],
                            spots=[{"id": "s4", "at": [4, 4], "node": "4-s4", "label": "Lady Wu's hall"},   # a cutaway: told:wu-gatekeeper
                                   {"id": "s11", "at": [5, 5], "node": "4-s11", "label": "Lady Wu's hall"}])
            | {"label": "Lady Wu's hall"},
            # Sun Quan's hall: the cutaways s8 (Sun Quan 0,-4, Zhang Zhao 8,0) and s12 (Cheng Pu at -8,0)
            "sq-hall": room([14, 7], [7, 6],
                            things=[{"id": "seat", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "The Marquis's seat"},
                                    {"id": "desk", "kind": "furn.table", "rect": [8, 1, 1, 1], "label": "A desk with a jade inkstone"},
                                    {"id": "rack", "kind": "furn.rack", "rect": [1, 1, 1, 1]}],
                            spots=[{"id": "s8", "at": [6, 5], "node": "4-s8", "label": "Sun Quan's hall"},
                                   {"id": "s12", "at": [6, 4], "node": "4-s12", "label": "Sun Quan's hall"}])
            | {"label": "Sun Quan's hall"},
            # the east palace: a court before the main hall; the bridal room on the west, Lady Sun's maids on the east.
            # s10: Liu Bei at 0,-4, Zhao Yun runs in to 16,4, Lady Sun comes from her rooms at -8,-6
            "east-palace": {
                "grid": [22, 14], "cell": 2, "margin": 0, "label": "The east palace",
                "ground": [{"id": "court", "kind": "court", "rect": [1, 5, 20, 8]},
                           {"id": "garden", "kind": "garden", "rect": [15, 9, 5, 3]}],
                "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, 22, 14], "width": 1, "gates": {"gate": [11, 13]}}],
                "things": [
                    {"id": "hall", "kind": "building.hall_grand", "rect": [7, 1, 8, 4], "door": "S", "label": "The east palace's hall"},
                    {"id": "bridal", "kind": "building.wing", "rect": [1, 1, 5, 4], "door": "E", "label": "The bridal room",
                     "map": "bridal-room"},
                    {"id": "maids", "kind": "building.wing", "rect": [16, 1, 5, 4], "door": "W", "label": "The maids' quarters"},
                    {"id": "rack-1", "kind": "furn.rack", "rect": [6, 6, 1, 1], "label": "A rack of spears"},
                    {"id": "rack-2", "kind": "furn.rack", "rect": [15, 6, 1, 1], "label": "A rack of swords"},
                ],
                "spots": [{"id": "s10", "at": [11, 8], "node": "4-s10", "label": "The east palace"}],
                "dress": [{"kind": "plant.peony", "in": "garden", "count": 4}, {"kind": "prop.lanterns", "at_door": "hall", "pair": True}],
                "exits": [{"to": "Nanxu", "at": [11, 13], "side": "S"}],
                "entries": {"": [11, 11]},
                "states": [{"id": "wedding", "light": "day"}],
            },
            # the bridal room hung with blades, the maids armed (s7, cutaway: Liu Bei at 6,4, Lady Sun at 0,-6, the matron 10,0)
            "bridal-room": room([12, 8], [6, 7],
                                things=[{"id": "bed", "kind": "furn.bed", "rect": [1, 1, 2, 1], "label": "The bridal bed"},
                                        {"id": "rack-1", "kind": "furn.rack", "rect": [4, 1, 1, 1], "label": "Swords on the wall"},
                                        {"id": "rack-2", "kind": "furn.rack", "rect": [6, 1, 1, 1], "label": "Spears on the wall"},
                                        {"id": "rack-3", "kind": "furn.rack", "rect": [8, 1, 1, 1], "label": "Halberds on the wall"},
                                        {"id": "rack-4", "kind": "furn.rack", "rect": [10, 1, 1, 1]},
                                        {"id": "lamps", "kind": "prop.lanterns", "rect": [1, 6, 1, 1]}],
                                spots=[{"id": "s7", "at": [4, 4], "node": "4-s7", "label": "The bridal room"}])
            | {"label": "The bridal room"},
        },
        "objectives": {
            "4-s3": "Land at Nanxu, and open the first silk pouch at the dock.",
            "4-s4": "Take Liu Bei to Qiao Guolao's gate with a lamb and wine. His household will carry the news to Lady Wu.",
            "4-s9": "Ride out by the east gate to the riding ground. The year is ending.",
            "4-s10": "Go to the east palace, to Liu Bei.",
            "4-s11": "Go to Lady Wu's palace, and ask your mother's leave.",
        },
    },

    # =========================================================================================
    # Sweet Dew Temple, on a hill above the river. The way up from Nanxu comes in by the south gate into the front court
    # (s6: the stone; the scene sets the rock 4 tiles east, 2 north of its spot). The abbot's hall (s5) stands at the back
    # and is reached only down the side corridors, walled off from its court, past the doorways where the axemen hide: Zhao Yun walks them
    # (「雲於廊下巡視，見房內有刀斧手埋伏」). Out of the north gate, the slope runs down to the river (the horses).
    "Sweet Dew Temple": {
        "archetype": "hills",
        "plan": {
            "grid": [20, 16], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills", "kind": "hills", "rect": [0, 0, 20, 16]},
                {"id": "river", "kind": "water", "rect": [0, 0, 20, 2]},
                {"id": "slope", "kind": "plain", "rect": [5, 2, 10, 3]},          # Rein-In Slope, above the river
                {"id": "grounds", "kind": "court", "rect": [5, 6, 10, 7]},         # inside the temple walls
                {"id": "path", "kind": "plain", "rect": [9, 13, 3, 3]},           # the way up from Nanxu
            ],
            "lines": [
                {"id": "wall", "kind": "wall", "outline": [4, 5, 12, 9], "width": 1,
                 "gates": {"south-gate": [10, 13], "north-gate": [12, 5]}},
                {"id": "inner", "kind": "wall", "path": [[4, 9], [15, 9]], "width": 1, "gates": {"west-way": [5, 9], "east-way": [14, 9]}},
                # the side corridors: walled off from the abbot's court, open to it only at their far ends
                {"id": "part-w", "kind": "wall", "path": [[6, 6], [6, 9]], "width": 1, "gates": {"w-in": [6, 6]}},
                {"id": "part-e", "kind": "wall", "path": [[13, 6], [13, 9]], "width": 1, "gates": {"e-in": [13, 6]}},
                {"id": "corridor-w", "kind": "gallery", "path": [[5, 9], [5, 6], [6, 6]], "width": 2},
                {"id": "corridor-e", "kind": "gallery", "path": [[14, 9], [14, 6], [13, 6]], "width": 2},
                {"id": "court-n", "kind": "path", "path": [[12, 7], [12, 5]], "width": 2},   # from the abbot's court to the north gate
                {"id": "up", "kind": "path", "path": [[10, 15], [10, 13]], "width": 2},
                {"id": "down", "kind": "path", "path": [[12, 5], [12, 3]], "width": 2},
            ],
            "things": [
                {"id": "abbot", "kind": "building.hall", "rect": [8, 6, 4, 2], "door": "S", "label": "The abbot's hall", "map": "gl-abbot",
                 "plaque": "方丈"},
                {"id": "incense", "kind": "landmark.incense", "rect": [7, 10, 1, 1], "label": "An incense burner"},
                {"id": "bell", "kind": "building.house", "rect": [13, 12, 2, 1], "label": "The bell house"},
            ],
            "spots": [
                {"id": "s6", "at": [9, 11], "node": "4-s6", "label": "The great rock in the courtyard"},
                {"id": "slope-top", "at": [12, 4], "label": "Rein-In Slope", "note": "s6: the two ride down to the river and back"},
            ],
            "dress": [{"kind": "tree.pine", "in": "hills", "count": 14}, {"kind": "prop.lanterns", "at_door": "abbot", "pair": True}],
            "exits": [{"to": "Nanxu", "at": [10, 15], "side": "S"}],
            "entries": {"": [10, 14], "Nanxu": [10, 14]},
        },
        "states": [
            {"id": "feast", "until": "node:s5", "light": "day"},     # the axemen in the side rooms
            {"id": "after", "when": "node:s5", "light": "day"},
        ],
        "npcs": [
            # the axemen, at the side rooms' doors on the corridors: they hush and look away
            _talk("folk.soldier", [5, 7], "The man in the doorway holds an axe behind his back. “Nothing here. Move along.”", **{"in": ["feast"]}),
            _talk("folk.soldier", [14, 7], "Two men crouch in the side room with axes across their knees. They look away.", **{"in": ["feast"]}),
            _talk("folk.villager", [11, 12], "A monk sweeps the courtyard. “The Dowager is in the abbot's hall. Go round by the side corridors.”"),
        ],
        "maps": {
            # the abbot's hall: Lady Wu at 0,-6, Qiao Guolao 6,-6, Sun Quan -6,-4; Liu Bei kneels at 2,-2; Jia Hua at 14,2
            "gl-abbot": room([14, 8], [7, 7],
                             things=[{"id": "seat", "kind": "furn.dais", "rect": [4, 1, 2, 1], "label": "The Dowager's seat"},
                                     {"id": "buddha", "kind": "furn.screen", "rect": [7, 1, 2, 1], "label": "A painted Buddha"},
                                     {"id": "table-1", "kind": "furn.table", "rect": [2, 3, 1, 1]},
                                     {"id": "table-2", "kind": "furn.table", "rect": [10, 3, 1, 1]}],
                             spots=[{"id": "s5", "at": [5, 5], "node": "4-s5", "label": "The abbot's hall"}])
            | {"label": "The abbot's hall"},
        },
        "objectives": {
            "4-s5": "Go up to Sweet Dew Temple. Walk the side corridors to the abbot's hall, where Lady Wu waits.",
            "4-s6": "Go out into the temple courtyard.",
        },
    },

    # =========================================================================================
    # The road to Chaisang: the road under the hills from Nanxu toward the border. Xu Sheng and Ding Feng block the mouth
    # of a defile (s13: they stand 16 tiles ahead of its spot, their men 22). Past it the road narrows between the hills,
    # and Chen Wu's and Pan Zhang's men come up across it: she stops before each, facing them, and they give way
    # (「四員將見了孫夫人，只得下馬」). Pushing past sends her back to where the block was. Then the open road (s14).
    "The road to Chaisang": {
        "archetype": "road",
        "plan": {
            "grid": [40, 11], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills-n", "kind": "hills", "rect": [0, 0, 40, 3]},
                {"id": "hills-s", "kind": "hills", "rect": [0, 8, 40, 3]},
                {"id": "fields", "kind": "field.wheat", "rect": [2, 6, 6, 2]},
                {"id": "defile-n", "kind": "hills", "rect": [17, 3, 12, 2]},       # the road narrows under the hills: one cell
                {"id": "defile-s", "kind": "hills", "rect": [17, 6, 12, 2]},
                # just beyond each rank, a pocket off the road for its men to step aside into (reached only past them)
                {"id": "pocket-1n", "kind": "plain", "rect": [22, 4, 1, 1]}, {"id": "pocket-1s", "kind": "plain", "rect": [22, 6, 1, 1]},
                {"id": "pocket-2n", "kind": "plain", "rect": [27, 4, 1, 1]}, {"id": "pocket-2s", "kind": "plain", "rect": [27, 6, 1, 1]},
            ],
            "lines": [{"id": "road", "kind": "road", "path": [[0, 5], [39, 5]], "width": 3}],
            "spots": [
                {"id": "s13", "at": [10, 5], "node": "4-s13", "label": "The road under the hill", "trigger": "near"},
                {"id": "block-start", "at": [13, 5], "label": "Where the road block stood",
                 "note": "the face-down: pushing past a man without stopping sends her back here"},
                {"id": "s14", "at": [35, 5], "node": "4-s14", "label": "The open road", "trigger": "near"},   # the generals come up behind (west)
            ],
            "dress": [{"kind": "milestone", "along": "road", "every": 4}, {"kind": "tree.poplar", "in": "fields", "count": 4}],
            "exits": [{"to": "Nanxu", "at": [0, 5], "side": "W"}, {"to": "Liulangpu", "at": [39, 5], "side": "E"}],
            "entries": {"": [1, 5], "Nanxu": [1, 5], "Liulangpu": [38, 5]},
        },
        "states": [{"id": "flight", "light": "day"}],
        "npcs": [
            # the face-down (s13 -> s14): Chen Wu and two of his men across the narrows, then Pan Zhang and two of his.
            # 「四員將見了孫夫人，只得下馬，拱手而立」
            _yield("folk.official", [21, 5], "chenwu", [4, -4], "Chen Wu sees who is in the carriage, swings down from his horse, and stands aside with his hands clasped.",
                   "“Halt! On the Marquis's orders, no one passes!” You fall back.", label="Chen Wu"),
            _yield("folk.soldier", [21, 5], "chenwu", [4, 4], "“It's the Lady herself!” He backs his horse off the road.",
                   "“Halt! On the Marquis's orders, no one passes!” You fall back."),
            _yield("folk.soldier", [21, 5], "chenwu", [6, -4], "“Not our quarrel, madam.” He leads his horse aside.",
                   "“Halt! On the Marquis's orders, no one passes!” You fall back."),
            _yield("folk.official", [26, 5], "panzhang", [4, -4], "Pan Zhang looks at Zhao Yun, then at the Lady, and dismounts. “Madam.”",
                   "“Stop the carriage!” The spears come down, and you fall back.", label="Pan Zhang"),
            _yield("folk.soldier", [26, 5], "panzhang", [4, 4], "“Pan Zhang can argue with her himself.” He reins his horse off the road.",
                   "“Stop the carriage!” The spears come down, and you fall back."),
            _yield("folk.soldier", [26, 5], "panzhang", [6, 4], "He lowers his spear and gets out of the way.",
                   "“Stop the carriage!” The spears come down, and you fall back."),
        ],
        "objectives": {
            "4-s13": "Push on along the road, ahead of the pursuit.",
            "4-s14": "Chen Wu and Pan Zhang's men block the road. Stop in front of them, facing them, and let them see you.",
        },
    },

    # =========================================================================================
    # Liulangpu: a bank of the river with no ferry. The river is 6 tiles below the s15 spot (the boats; Zhuge Liang in
    # them at -10,4), Zhou Yu's fleet comes along the water (20,6), and Guan Yu out of a valley to the north-east (14,-6).
    "Liulangpu": {
        "archetype": "road",
        "plan": {
            "grid": [24, 14], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills-w", "kind": "hills", "rect": [0, 0, 14, 3]},
                {"id": "hills-e", "kind": "hills", "rect": [18, 0, 6, 3]},
                {"id": "valley", "kind": "plain", "rect": [14, 0, 4, 3]},          # where Guan Yu's men come out
                {"id": "bank", "kind": "plain", "rect": [0, 3, 24, 5]},
                {"id": "river", "kind": "water", "rect": [0, 8, 24, 6]},
            ],
            "lines": [{"id": "road", "kind": "road", "path": [[0, 5], [12, 5]], "width": 3},
                      {"id": "valley-path", "kind": "path", "path": [[12, 5], [16, 5], [16, 0]], "width": 2}],
            "spots": [{"id": "s15", "at": [12, 6], "node": "4-s15", "label": "Liulangpu", "trigger": "near"}],
            "dress": [{"kind": "tree.willow", "in": "bank", "count": 6}, {"kind": "tree.pine", "in": "hills-w", "count": 5}],
            "exits": [{"to": "The road to Chaisang", "at": [0, 5], "side": "W"}],
            "entries": {"": [1, 5], "The road to Chaisang": [1, 5]},
        },
        "states": [{"id": "river", "light": "day"}],
        "objectives": {"4-s15": "Go on to the river at Liulangpu."},
    },
}

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}
