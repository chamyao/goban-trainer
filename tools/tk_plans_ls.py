"""Lady Sun's marriage (novel chapters 54–55), as plan grids (docs/book2/plan-grid.md).

Design: docs/book2/ladysun-arc.md (Plot). Beat keys are its keys, 4-s1 ... 4-s16 (rebuilt around Zhou Yu's schemes: docs/book2/ladysun-arc.md). Every Chinese line here is modern
Mandarin in simplified characters (the user: "write this book's language in modern Chinese that's easier to understand").

    python3 tools/check_plans_w2.py --arc ls [--png]       # check (and draw into docs/book2/plans-ls/)
    python3 tools/mapfactory build --world 15 --plans ls   # with Plot's WORLD2_LS

The places, in the story's order: Chaisang (a cutaway only) -> Jingzhou -> Nanxu (the loud town) -> Sweet Dew Temple
(the axemen searched for) -> Nanxu again (the bridal room and the gilded cage, cutaways; the riding ground at the year's
end; the east palace, where Lady Sun takes the lead; New Year's Day) -> the road to Chaisang (the road block and the
pursuit, two face-downs) -> Liulangpu.

The book's map mechanics, in the engine's syntax (tk-feats.js, Integration):
  the loud town (Nanxu, while s4 is open):
    npc "gossip": {"tells": [ids], "in_beats": ["s4"]}   told (talked to), they walk to each neighbour named and tell them
                 + "relay": true                       told only by a neighbour, never by the player
    prop "told": id                                        red hangings at a house door, shown once that person knows
    spot "fires": "told:<id>"                              its beat starts by itself once the news reaches them
  the face-downs (the road to Chaisang: Xu Sheng and Ding Feng's men after s13, Chen Wu and Pan Zhang's after s14):
    npc "yield": {"group", "reach" (tiles), "aside" [dx, dy] (tiles), "line", "caught", "back_to": spot}
        standing still and facing them within reach, they step aside one by one; moving within 1.4 tiles of one who
        hasn't is a catch, back to back_to
  the axemen (Sweet Dew Temple, before s5): a spot that delivers a mark ("needs", "when", "delivers", "deliver"), in
    three of the six side rooms, by the axemen; s5's gate needs all three marks (Plot)
"""
from tk_plans_w2 import ART as ART2, LINE_KINDS, NEW_KINDS as NEW_KINDS2, ZONE_KINDS, room

# the beats this arc's plans place (the design's table: s1 ... s16)
KEYS_LS = {f"s{i}" for i in range(1, 17)}

# Kinds this arc adds: footprint in tiles (w, h, solid)
NEW_KINDS = {**NEW_KINDS2,
             "prop.boat": (4, 2, True),          # a river boat moored at a jetty (Nanxu's dock)
             "prop.target": (1, 1, True),        # an archery butt on a stand (the riding ground outside the east gate)
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


# what Zhao Yun says on finding each group of axemen (s5's gate needs all three)
FOUND = {
    "axemen_1": "Axes, and men enough to swing them. These aren't monks. I'll keep my hand on my sword and back out slowly.",
    "axemen_2": "Men sitting in the dark with axes, waiting for a signal. Who's going to give it?",
    "axemen_3": "Axemen, hidden right beside the corridor my lord will walk down. This is a trap.",
}


def _axemen(room_id, says):
    """A side room where Jia Hua's axemen hide: three of them, until the meeting (s5). The one nearest the door, talked
    to, is found: Zhao Yun's line, and the mark that s5's gate needs (the spot he stands by delivers it)."""
    return [{"kind": "folk.soldier", "place": room_id, "at": at, "say": say, "until": "node:s5", "face": face}
            for at, say, face in zip(([4, 2], [2, 2], [6, 2]), says, ("S", "E", "W"))]


def _side_room(c, rid, mark=None):
    """One of the temple's six side rooms (a door on the corridor; c: "w" or "e" side). With a mark, the axemen's: a spot
    by the door that delivers it once Zhao Yun finds them."""
    door = [7, 3] if c == "w" else [0, 3]
    spots = []
    if mark:
        spots = [{"id": mark, "at": [4, 3], "label": "Axemen in the side room", "needs": ["node:s4"], "when": "node:s4",
                  "delivers": mark, "deliver": [["zhaoyun", FOUND[mark]]],
                  "delivered": ["The axemen watch you from the dark. No one moves yet."],
                  "empty": ["An empty side room. Whoever was here has gone."]}]
    things = [{"id": "curtain", "kind": "furn.curtain", "rect": [6 if c == "w" else 1, 3, 1, 1]},
              {"id": "jar", "kind": "furn.jar", "rect": [1 if c == "w" else 6, 1, 1, 1]}]
    if mark:
        things.append({"id": "axes", "kind": "furn.rack", "rect": [3, 1, 1, 1], "label": "A rack of axes"})
    else:
        things.append({"id": "table", "kind": "furn.table", "rect": [3, 1, 2, 1]})
    return room([8, 6], door, things=things, spots=spots) | {"label": "A side room"}


def _narrows(n, x, w, ranks):
    """A narrows in the road, one cell wide between the hills (x .. x+w-1), and a pocket off the road just beyond each
    rank, for its men to step aside into (reached only past them)."""
    return [{"id": f"defile-{n}n", "kind": "hills", "rect": [x, 3, w, 2]}, {"id": f"defile-{n}s", "kind": "hills", "rect": [x, 6, w, 2]},
            *[{"id": f"pocket-{n}{r}{c}", "kind": "plain", "rect": [rx + 1, 4 if c == "n" else 6, 1, 1]}
              for r, rx in enumerate(ranks) for c in "ns"]]


def _rank(x, group, when, until, back_to, caught, men):
    """A rank of three across a narrows at cell x, from beat `when` until `until`: faced down, each man steps aside into
    a pocket beyond the rank (two north, one south, the officer first)."""
    asides = ([4, -4], [4, 4], [6, -4])
    return [{"kind": kind, "at": [x, 5], "say": [], "when": f"node:{when}", "until": f"node:{until}",
             "yield": {"group": group, "reach": 4, "aside": aside, "line": [line], "caught": [caught], "back_to": back_to},
             **({"label": label} if label else {})}
            for (kind, line, label), aside in zip(men, asides)]


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
    # Later the wedding (red; the bridal room s7 and the gilded cage s8 are cutaways), the winter (snow: Zhao Yun at the
    # riding ground outside the east gate, s9; then into the east palace, the cage, where Lady Sun takes the lead, s10),
    # Lady Wu's hall again (s11, New Year's Day), and out by the west gate onto the road.
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
                # Lady Sun's own rooms, beside the east palace
                {"id": "lsfu", "kind": "building.hall", "rect": [12, 3, 3, 2], "door": "S", "label": "Lady Sun's rooms"},
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
                # the year's end: Zhao Yun rides and shoots outside the east gate, and opens the second pouch (s9)
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
            {"id": "winter", "when": "node:s8", "until": "node:s10", "light": "day", "weather": "snow"},   # 「住到年终」
            {"id": "newyear", "when": "node:s10", "light": "morning"},                    # New Year's Day: she leaves
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
            # the gilded cage (in the east palace): they play and dance for him, and the gifts keep coming
            {"kind": "folk.lady", "place": "east-palace", "at": [4, 9], "face": "N",
             "say": "A musician plays the zither. “His lordship hasn't set foot outside the palace since the wedding. Why would he?”"},
            {"kind": "folk.maiden", "place": "east-palace", "at": [6, 10], "face": "E",
             "say": "A dancer in silk turns and turns, smiling, and looks at no one."},
            {"kind": "folk.elder", "place": "east-palace", "at": [8, 8], "face": "N",
             "say": "A steward sets out gold cups on the table. “Gifts from the Marquis. More come every day.”"},
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
            # Sun Quan's hall: the cutaways s8, the gilded cage (Sun Quan 0,-4, Zhang Zhao 8,0), and s12, the jade inkstone
            # (Cheng Pu at -8,0 as well)
            "sq-hall": room([14, 7], [7, 6],
                            things=[{"id": "seat", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "The Marquis's seat"},
                                    {"id": "desk", "kind": "furn.table", "rect": [8, 1, 1, 1], "label": "A desk with a jade inkstone"},
                                    {"id": "rack", "kind": "furn.rack", "rect": [1, 1, 1, 1]}],
                            spots=[{"id": "s8", "at": [6, 5], "node": "4-s8", "label": "Sun Quan's hall"},
                                   {"id": "s12", "at": [6, 4], "node": "4-s12", "label": "Sun Quan's hall"}])
            | {"label": "Sun Quan's hall"},
            # the east palace: a court before the main hall; the bridal room on the west, Lady Sun's maids on the east.
            # Dressed as the gilded cage (Zhou Yu's second scheme, 軟困): musicians at their zithers, a dancer in silk, a
            # table of the Marquis's gold and silk, silk carpets on the way in, red silk over the hall door, peonies.
            # s10: Liu Bei at 2,-2, Zhao Yun walks in to 18,4, Lady Sun comes from her rooms at -8,-6
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
                    # the cage: what the Marquis keeps him with
                    {"id": "qin-1", "kind": "furn.qin", "rect": [3, 8, 1, 1], "label": "A zither"},
                    {"id": "qin-2", "kind": "furn.qin", "rect": [5, 8, 1, 1], "label": "A zither"},
                    {"id": "gifts", "kind": "furn.table", "rect": [8, 7, 1, 1], "label": "Gold cups and rolls of silk"},
                    *[{"id": f"rug-{y}", "kind": "furn.rug", "rect": [10, y, 2, 1]} for y in (9, 10, 12)],
                ],
                "props": [{"kind": "deco.redhang", "over": "hall", "lift": 6}],
                "spots": [{"id": "s10", "at": [11, 8], "node": "4-s10", "label": "The east palace"}],
                "dress": [{"kind": "plant.peony", "in": "garden", "count": 6}, {"kind": "prop.lanterns", "at_door": "hall", "pair": True},
                          {"kind": "prop.lanterns", "at_door": "bridal", "pair": True}],
                "exits": [{"to": "Nanxu", "at": [11, 13], "side": "S"}],
                "entries": {"": [11, 11]},
                "states": [{"id": "wedding", "light": "day"}],
            },
            # the bridal room hung with blades, the maids armed (s7, a cutaway: Liu Bei at 8,4, Lady Sun 0,-6, the matron 10,0)
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
            "4-s9": "The year is ending. Ride out by the east gate to the riding ground.",
            "4-s10": "Go into the east palace, to Liu Bei.",
            "4-s11": "It is New Year's Day. Go to Lady Wu's palace, and ask your mother's leave.",
        },
    },

    # =========================================================================================
    # Sweet Dew Temple, on a hill above the river. The way up from Nanxu comes in by the south gate into the front court
    # (s6: the stone; the scene sets the rock 4 tiles east, 2 north of its spot). The abbot's hall (s5) stands at the back
    # and is reached only down the side corridors, walled off from its court. Off the corridors are six side rooms, all
    # alike from outside; Jia Hua has hidden his axemen in three of them (「伏於兩廊」). The meeting won't start until Zhao
    # Yun has searched them and found all three (s5 is gated on axemen_1-3; else s5_wait). In the other three are monks,
    # who have seen and heard things. Out of the north gate, the slope runs down to the river (the horses).
    "Sweet Dew Temple": {
        "archetype": "hills",
        "plan": {
            "grid": [20, 16], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills", "kind": "hills", "rect": [0, 0, 20, 16]},
                {"id": "river", "kind": "water", "rect": [0, 0, 20, 2]},
                {"id": "slope", "kind": "plain", "rect": [5, 2, 10, 3]},          # Rein-In Slope, above the river
                {"id": "grounds", "kind": "court", "rect": [3, 6, 14, 7]},         # inside the temple walls
                {"id": "path", "kind": "plain", "rect": [9, 13, 3, 3]},           # the way up from Nanxu
            ],
            "lines": [
                {"id": "wall", "kind": "wall", "outline": [2, 5, 16, 9], "width": 1,
                 "gates": {"south-gate": [10, 13], "north-gate": [12, 5]}},
                {"id": "inner", "kind": "wall", "path": [[2, 9], [17, 9]], "width": 1, "gates": {"west-way": [5, 9], "east-way": [14, 9]}},
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
                # the six side rooms, three along each corridor, their doors on it
                *[{"id": f"side-{c}{i}", "kind": "building.house", "rect": [3 if c == "w" else 15, 5 + i, 2, 1], "door": "E" if c == "w" else "W",
                   "label": "A side room", "map": f"side-{c}{i}", "margin": 0} for c in "we" for i in (1, 2, 3)],
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
            _talk("folk.villager", [11, 12], "A monk sweeps the courtyard. “The Dowager is in the abbot's hall. Go round by the side corridors.”"),
            # Jia Hua's man in each corridor: he watches you, and says nothing you want to hear
            _talk("folk.soldier", [5, 10], "A guard leans by the corridor's mouth, too heavy in the shoulders for a monk. “Only monks' rooms down there.”",
                  **{"in": ["feast"]}),
            _talk("folk.soldier", [14, 10], "A guard watches you from the corridor's mouth, one hand inside his sleeve. He doesn't say a word.",
                  **{"in": ["feast"]}),
            # the axemen, hidden in three of the side rooms (until the meeting: then the Dowager sends them away)
            *_axemen("side-w1", [
                "The man in the doorway holds an axe behind his back. “Nothing here. Move along.”",
                "A man sits on a sack with an axe across his knees, and stares at you.",
                "Three more men stand against the wall. None of them moves."]),
            *_axemen("side-w3", [
                "Two men crouch in the side room with axes across their knees. They look away.",
                "A man by the window tests his blade with his thumb.",
                "Someone in the dark corner coughs, and is hushed."]),
            *_axemen("side-e2", [
                "A man by the curtain grips his axe and holds his breath.",
                "Men sit shoulder to shoulder on the floor, their axes wrapped in cloth.",
                "A big man rises halfway, sees your sword, and sits back down."]),
            # the monks in the other three rooms: each has seen or heard something
            {"kind": "folk.elder", "place": "side-w2", "at": [4, 2], "face": "S",
             "say": "A monk copies sutras by lamplight. “Boots went past an hour ago. Heavy ones. Not ours.”"},
            {"kind": "folk.elder", "place": "side-e1", "at": [4, 2], "face": "S",
             "say": "An old monk sorts incense. “The Marquis's people took the rooms along this side. We were told to keep out of them.”"},
            {"kind": "folk.villager", "place": "side-e3", "at": [4, 2], "face": "S",
             "say": "A novice stirs a great pot of rice gruel. “Three hundred bowls, they told us. For whom, I'd like to know.”"},
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
            # the side rooms, all alike: a curtain in the doorway, a room behind it
            **{f"side-{c}{i}": _side_room(c, f"side-{c}{i}", {"w1": "axemen_1", "w3": "axemen_2", "e2": "axemen_3"}.get(f"{c}{i}"))
               for c in "we" for i in (1, 2, 3)},
        },
        "objectives": {
            "4-s5": "Something is wrong at Sweet Dew Temple. Search the side rooms along the corridors, then go to the abbot's hall, where Lady Wu waits.",
            "4-s6": "Go out into the temple courtyard.",
        },
    },

    # =========================================================================================
    # The road to Chaisang: the road under the hills from Nanxu toward the border, west to east. Two face-downs, each in
    # a narrows one cell wide between the hills, where she stops before each rank, facing it, and it gives way
    # (「四員將見了孫夫人，只得下馬」); pushing past a man who hasn't sends her back to where that block began.
    #   s13 (the road block: Xu Sheng 16 tiles ahead of its spot, their men 22) -> face-down 1, Xu Sheng's and Ding
    #   Feng's men -> s14 just past it (the boss: the generals 10 ahead, their men 18) -> face-down 2, Chen Wu's and Pan
    #   Zhang's men -> s15 beyond (they came up from behind: the generals 12 and 18 tiles west of it) -> Liulangpu.
    "The road to Chaisang": {
        "archetype": "road",
        "plan": {
            "grid": [52, 11], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills-n", "kind": "hills", "rect": [0, 0, 52, 3]},
                {"id": "hills-s", "kind": "hills", "rect": [0, 8, 52, 3]},
                {"id": "fields", "kind": "field.wheat", "rect": [1, 6, 4, 2]},
                *_narrows(1, 12, 8, (14, 17)),     # face-down 1: Xu Sheng's men, then Ding Feng's
                *_narrows(2, 30, 11, (33, 38)),    # face-down 2: Chen Wu's men, then Pan Zhang's
            ],
            "lines": [{"id": "road", "kind": "road", "path": [[0, 5], [51, 5]], "width": 3}],
            "spots": [
                {"id": "s13", "at": [5, 5], "node": "4-s13", "label": "The road under the hill", "trigger": "near"},
                {"id": "block1-start", "at": [8, 5], "label": "Before the road block",
                 "note": "face-down 1: pushing past a man without stopping sends her back here"},
                {"id": "s14", "at": [22, 5], "node": "4-s14", "label": "Past the road block", "trigger": "near"},
                {"id": "block2-start", "at": [27, 5], "label": "Where the pursuit caught up",
                 "note": "face-down 2: pushing past a man without stopping sends her back here"},
                {"id": "s15", "at": [46, 5], "node": "4-s15", "label": "The open road", "trigger": "near"},
            ],
            "dress": [{"kind": "milestone", "along": "road", "every": 4}, {"kind": "tree.poplar", "in": "fields", "count": 3}],
            "exits": [{"to": "Nanxu", "at": [0, 5], "side": "W"}, {"to": "Liulangpu", "at": [51, 5], "side": "E"}],
            "entries": {"": [1, 5], "Nanxu": [1, 5], "Liulangpu": [50, 5]},
        },
        "states": [{"id": "flight", "light": "day"}],
        "npcs": [
            # face-down 1 (s13 -> s14): the block Zhou Yu set, Xu Sheng's men, then Ding Feng's, across the first narrows
            *_rank(14, "xusheng", "s13", "s14", "block1-start", "“Halt! On Grand Commander Zhou's orders, no one passes!” You fall back.", [
                ("folk.official", "Xu Sheng's captain sees who is in the carriage, and his hand comes off his sword. “Make way!”", "Xu Sheng's captain"),
                ("folk.soldier", "“The Marquis's own sister…” He lowers his spear and backs off the road.", None),
                ("folk.soldier", "He looks at his captain, then at her, and leads his horse aside.", None)]),
            *_rank(17, "dingfeng", "s13", "s14", "block1-start", "“Stop the carriage! Those are our orders!” The spears come down, and you fall back.", [
                ("folk.official", "Ding Feng's captain swallows. “We were told it was Liu Bei. No one said anything about the Lady.” He stands aside.", "Ding Feng's captain"),
                ("folk.soldier", "“Not my quarrel, madam.” He steps out of the way.", None),
                ("folk.soldier", "He drops his eyes, and his spear with them.", None)]),
            # face-down 2 (s14 -> s15): Chen Wu and two of his men across the second narrows, then Pan Zhang and two of his
            *_rank(33, "chenwu", "s14", "s15", "block2-start", "“Halt! On the Marquis's orders, no one passes!” You fall back.", [
                ("folk.official", "Chen Wu sees who is in the carriage, swings down from his horse, and stands aside with his hands clasped.", "Chen Wu"),
                ("folk.soldier", "“It's the Lady herself!” He backs his horse off the road.", None),
                ("folk.soldier", "“Not our quarrel, madam.” He leads his horse aside.", None)]),
            *_rank(38, "panzhang", "s14", "s15", "block2-start", "“Stop the carriage!” The spears come down, and you fall back.", [
                ("folk.official", "Pan Zhang looks at Zhao Yun, then at the Lady, and dismounts. “Madam.”", "Pan Zhang"),
                ("folk.soldier", "“Pan Zhang can argue with her himself.” He reins his horse off the road.", None),
                ("folk.soldier", "He lowers his spear and gets out of the way.", None)]),
        ],
        "objectives": {
            "4-s13": "Push on along the road toward the border, ahead of the pursuit.",
            "4-s14": "Xu Sheng and Ding Feng's men block the road. Stop in front of each rank, facing it, and let them see who is in the carriage.",
            "4-s15": "Chen Wu and Pan Zhang's men are on the road. Stop in front of each rank, facing it, and let them see you.",
        },
    },

    # =========================================================================================
    # Liulangpu: a bank of the river with no ferry. The river is 6 tiles below the s16 spot (the boats; Zhuge Liang in
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
            "spots": [{"id": "s16", "at": [12, 6], "node": "4-s16", "label": "Liulangpu", "trigger": "near"}],
            "dress": [{"kind": "tree.willow", "in": "bank", "count": 6}, {"kind": "tree.pine", "in": "hills-w", "count": 5}],
            "exits": [{"to": "The road to Chaisang", "at": [0, 5], "side": "W"}],
            "entries": {"": [1, 5], "The road to Chaisang": [1, 5]},
        },
        "states": [{"id": "river", "light": "day"}],
        "objectives": {"4-s16": "Go on to the river at Liulangpu."},
    },
}

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}
