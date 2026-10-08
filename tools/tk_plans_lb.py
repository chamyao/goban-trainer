"""Lü Bu's fall (novel chapters 13–19, with the Chang'an prologue), as plan grids (docs/book2/plan-grid.md).

Design: docs/book2/lvbu-arc.md (Plot), "Building it". Beat keys are its shared keys, 3-x1 ... 3-x20.

    python3 tools/check_plans_w2.py --arc lb [--png]       # check (and draw into docs/book2/plans-lb/)
    python3 tools/mapfactory build --world 14 --plans lb   # once Plot's story for the arc is in

The places, in the story's order: Chang'an after its fall (reusing the Diaochan arc's map) -> Xuzhou -> Xiaopei ->
the Shouchun Road -> Xiao Pass -> the Xiapi Road -> Xiapi, which floods in stages (the arc's mechanic). Road
challengers: 10, 3 of them blocking (the design's table). Cells, claims, lines, rooms and states work as in
tools/tk_plans_w2.py, whose kinds and room() this reuses.

Two state keys are new, for the flood and for gates shut by the story (Integration's engine):
  "water": [[x, y, w, h], ...]   cells under water in that state: no one crosses but a mount that crosses water
  "shut":  {gate id: [lines]}    a gate of a wall shut in that state, and what it says when you try it
plans.py turns both into tiles ("water": tile rects; "shut": the gate's tile rect and its lines).
"""
import copy

from tk_plans_w2 import ART as ART2, LINE_KINDS, NEW_KINDS as NEW_KINDS2, PLANS2, ZONE_KINDS, _ch, room

# the beats this arc's plans place (the design's table: x1 ... x20)
KEYS_LB = {f"x{i}" for i in range(1, 21)}

# Kinds this arc adds: footprint in tiles (w, h, solid)
NEW_KINDS = {**NEW_KINDS2,
             "prop.halberd": (1, 1, True),      # a halberd planted upright in the ground (x6: 150 paces from the tent)
             "prop.carriage": (4, 2, True),     # a covered carriage hung with red silk (x9: the bride's)
             }
ART = {**ART2,
       "prop.halberd": "Lü Bu's sky-piercer halberd (方天画戟) planted upright in the earth, its crescent blade catching the "
                       "light, a red tassel; one tile, tall; the same 3/4 view as the camp props",
       "prop.carriage": "a Han bridal carriage: a covered two-wheeled carriage hung with red silk and tassels, its shafts "
                        "down (no horse), four tiles wide and two deep",
       }


def _talk(kind, at, say, **kw):
    return {"kind": kind, "at": at, "say": say, **kw}


# =========================================================================================
# Chang'an after its fall: the Diaochan arc's city, taken by Li Jue and Guo Si. Lady Yan and her daughter come out of
# Pang Shu's house and walk to the west gate past the patrols (x1). Only the city's streets and Pang Shu's house are
# kept: the Diaochan arc's rooms, beats and people are left out, and a west gate is cut in the wall.
_ca = copy.deepcopy(PLANS2["Chang'an"])
_cap = _ca["plan"]
for _t in _cap["things"]:
    for _k in ("node", "map", "open_to", "refuse"):
        _t.pop(_k, None)
    if _t["id"] == "house-2":
        _t.update(id="pangshu", label="Pang Shu's house", plaque="庞府", map="pangshu")
next(l for l in _cap["lines"] if l["id"] == "wall")["gates"]["west-gate"] = [1, 9]
next(l for l in _cap["lines"] if l["id"] == "ward-street")["path"] = [[0, 9], [14, 9]]   # out through the west gate
_cap["things"] = [t for t in _cap["things"] if t["id"] not in ("hengmen", "ridge")]   # the Diaochan arc's farewell, long over
_cap["checks"] = [{"check": "covered_route", "from": [10, 11], "to": [1, 9], "beats": ["3-x1"], "must_wait": True}]
_cap["spots"] = [
    {"id": "pangshu-gate", "at": [10, 11], "at_door": "pangshu", "label": "Pang Shu's door", "note": "x1: where the walk starts"},
    {"id": "x1", "at": [1, 9], "node": "3-x1", "label": "The west gate", "trigger": "near"},
]
_cap["props"] = [{"kind": "camp.firepit", "at": [11, 5], "label": "A soldiers' fire"}]
_cap["dress"] = [d for d in _cap["dress"] if d.get("at_door") not in ("wangyun", "palace")] + [
    {"kind": "banner.black", "at_gates": True}]
_cap["exits"] = []
_cap["entries"] = {"": [10, 11]}
# Li Jue's patrols (x1): stealth, as the Diaochan arc's watchers. Caught, she's taken back to Pang Shu's door.
_cap["watchers"] = [
    {"id": "patrol-avenue", "kind": "folk.soldier", "beat": [[6, 5], [6, 10], [6, 5]], "shape": "U", "pause": [6, 10, 2],
     "cone": 5, "in_beats": ["3-x1"], "seen": "patrol", "back_to": "pangshu-gate"},
    {"id": "patrol-ward", "kind": "folk.soldier", "beat": [[3, 9], [12, 9], [3, 9]], "shape": "U", "pause": [12, 9, 3],
     "cone": 5, "in_beats": ["3-x1"], "seen": "patrol", "back_to": "pangshu-gate"},
    {"id": "patrol-lane", "kind": "folk.soldier", "beat": [[13, 11], [3, 11], [13, 11]], "shape": "U", "pause": [3, 11, 2],
     "cone": 4, "in_beats": ["3-x1"], "seen": "patrol", "back_to": "pangshu-gate"},
]
_ca.update(
    banners="black",
    states=[{"id": "fallen", "light": "dusk", "weather": "smoke"}],
    seen_lines={"patrol": ["“Halt! Whose women are these?” Pang Shu's servant hurries them back indoors before the patrol looks again."]},
    npcs=[
        _talk("folk.villager", [8, 5], "“Li Jue's men took the market this morning. Whatever they want, they take.”"),
        _talk("folk.elder", [12, 7], "“Wang Yun is dead, and General Lü fled with a hundred horsemen. He left his own family behind.”"),
    ],
    maps={
        # Pang Shu's house, where he hides Lü Bu's wife and daughter (「龐舒在長安城中，私藏呂布妻小」)
        "pangshu": room([10, 7], [5, 6], floor="wood",
                        things=[{"id": "screen", "kind": "furn.screen", "rect": [3, 1, 2, 1]},
                                {"id": "bed", "kind": "furn.bed", "rect": [1, 1, 1, 1], "label": "Where they hid"},
                                {"id": "chest", "kind": "furn.chest", "rect": [8, 1, 1, 1]},
                                {"id": "table", "kind": "furn.table", "rect": [6, 3, 1, 1]}],
                        spots=[{"id": "pangshu-in", "at": [5, 4], "label": "Pang Shu's house", "note": "x1 starts in here"}])
        | {"label": "Pang Shu's house"},
    },
    challengers=[
        # the walk to the west gate (x1): a looter at the west lane's mouth, by the gate (blocking); a soldier dicing by a fire
        _ch("looter", "folk.soldier", [2, 8], None, "node:x1",
            "A Liangzhou soldier steps out of the lane, a bundle of silk under his arm. “Where are you off to, with the city burning? Show me what's in your sleeves.”",
            "“…Bah. Nothing worth the trouble. Go on.”", "The looter has gone after richer pickings.",
            blocks="x1", view=1, guard="door"),
        _ch("dicer", "folk.soldier", [10, 5], None, "node:x1",
            "A soldier squats by the fire, rattling dice. “A game, lady? Win, and I never saw you.”",
            "“Ha! Then I never saw you.”", "The dicer is busy with his own game."),
    ],
    objectives={"3-x1": "Walk Lady Yan and her daughter from Pang Shu's house to the west gate, past Li Jue's patrols."},
)


PLANS_LB = {
    "Chang'an": _ca,

    # =========================================================================================
    # Xuzhou: the prefecture's city. Liu Bei takes Lü Bu in (x2-x4); the night gate (x5); Lü Bu holds it (x7-x10);
    # locked out under its wall (x14).
    "Xuzhou": {
        "archetype": "city",
        "banners": "red",
        "plan": {
            "grid": [20, 15], "cell": 4, "margin": 1,
            "ground": [
                {"id": "city", "kind": "city", "rect": [2, 2, 16, 11]},
                {"id": "fore-hall", "kind": "court", "rect": [3, 6, 4, 1]},       # before the prefecture hall
                {"id": "fore-lodging", "kind": "court", "rect": [11, 6, 4, 1]},   # before Lü Bu's lodging
                {"id": "market", "kind": "market", "rect": [11, 9, 4, 3]},
            ],
            "lines": [
                {"id": "wall", "kind": "wall.city", "outline": [1, 1, 18, 13], "width": 2,
                 "gates": {"west-gate": [1, 7], "east-gate": [18, 7], "south-gate": [9, 13], "north-gate": [9, 1]}},
                {"id": "main-street", "kind": "road", "path": [[0, 7], [19, 7]], "width": 3},
                {"id": "cross-street", "kind": "road", "path": [[9, 0], [9, 14]], "width": 3},
                {"id": "west-lane", "kind": "road", "path": [[2, 7], [2, 12]], "width": 2},
                {"id": "east-lane", "kind": "road", "path": [[16, 7], [16, 12]], "width": 2},
                {"id": "back-street", "kind": "road", "path": [[2, 12], [16, 12]], "width": 2},
            ],
            "things": [
                # north of the main street, fronts to the south
                {"id": "zhoufu", "kind": "building.hall_grand", "rect": [3, 3, 4, 3], "door": "S", "label": "The prefecture hall",
                 "map": "xz-hall", "plaque": "徐州府"},
                {"id": "house-n1", "kind": "building.house", "rect": [7, 4, 2, 2]},
                {"id": "lodging", "kind": "building.compound", "rect": [11, 3, 4, 3], "door": "S", "label": "Lü Bu's lodging",
                 "map": "lb-lodging", "plaque": "吕府"},
                {"id": "house-n2", "kind": "building.house", "rect": [15, 4, 2, 2]},
                # south of the main street
                {"id": "liubei", "kind": "building.compound", "rect": [3, 8, 4, 3], "door": "N", "label": "Liu Bei's residence",
                 "plaque": "刘府"},
                {"id": "wineshop", "kind": "building.shop", "rect": [7, 8, 2, 1], "door": "N", "label": "A wine shop",
                 "note": "where Zhang Fei drinks"},
                {"id": "stalls", "kind": "market.stalls", "rect": [12, 9, 2, 1], "label": "Market stalls"},
                {"id": "gotable", "kind": "furniture.gotable", "rect": [11, 11, 1, 1], "label": "A go table in the market"},
                {"id": "house-s1", "kind": "building.house", "rect": [7, 10, 2, 1]},
            ],
            "spots": [
                {"id": "liubei-gate", "at": [5, 7], "at_door": "liubei", "label": "Liu Bei's gate"},
                {"id": "x5", "at": [0, 8], "node": "3-x5", "label": "The west gate, at night", "trigger": "near",
                 "note": "outside the gate: 「劉使君有機密使人至」"},
                {"id": "x14", "at": [0, 4], "node": "3-x14", "label": "Under Xuzhou's wall", "trigger": "near",
                 "note": "Mi Zhu shouts down from the wall above"},
            ],
            "dress": [
                {"kind": "tree.willow", "along": "main-street", "every": 4},
                {"kind": "lamp.post", "along": "cross-street", "every": 4},
                {"kind": "banner", "at_gates": True},
                {"kind": "banner.red", "at_door": "zhoufu", "pair": True},
                {"kind": "furn.rack", "at_door": "lodging"},
            ],
            "exits": [{"to": "Xiaopei", "at": [0, 7], "side": "W"},
                      {"to": "The Xiapi Road", "at": [19, 7], "side": "E"},
                      {"to": "The Shouchun Road", "at": [9, 14], "side": "S"},
                      {"to": "Xiao Pass", "at": [9, 0], "side": "N"}],
            "entries": {"": [9, 7], "Xiaopei": [0, 6], "The Xiapi Road": [18, 7], "The Shouchun Road": [9, 13], "Xiao Pass": [9, 1]},
        },
        "states": [
            {"id": "guest", "light": "day"},
            {"id": "moon", "when": "node:x4", "until": "node:x5", "light": "night", "weather": "clear",   # 「是夜月白風清」
             "shut": {"west-gate": ["The gate is barred for the night. Someone inside must open it."]}},
            {"id": "held", "when": "node:x5", "until": "node:x14", "light": "day"},
            {"id": "locked", "when": "node:x14", "light": "day", "banners": "blue",
             "shut": {g: ["The gate stays shut. Up on the wall, Mi Zhu has Cao Cao's banners raised."]
                      for g in ("west-gate", "east-gate", "south-gate", "north-gate")}},
        ],
        "maps": {
            # ---- the prefecture hall: Liu Bei receives Lü Bu (x2), shows him Cao Cao's letter (x4); Lü Bu's own later ----
            "xz-hall": room([16, 8], [8, 7],
                            things=[{"id": "dais", "kind": "furn.dais", "rect": [7, 1, 2, 1], "label": "The prefect's seat"},
                                    {"id": "screen", "kind": "furn.screen", "rect": [10, 1, 2, 1]},
                                    {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 1, 1]},
                                    {"id": "table-2", "kind": "furn.table", "rect": [12, 3, 1, 1]},
                                    {"id": "rack", "kind": "furn.rack", "rect": [1, 5, 1, 1]}],
                            spots=[{"id": "x2", "at": [6, 5], "node": "3-x2", "label": "The prefecture hall"},
                                   {"id": "x4", "at": [10, 5], "node": "3-x4", "label": "Cao Cao's letter"},
                                   {"id": "x8", "at": [6, 4], "node": "3-x8", "label": "The condolence call"},
                                   {"id": "x10", "at": [10, 4], "node": "3-x10", "label": "The hawk"}])
            | {"label": "The prefecture hall"},
            # ---- Lü Bu's lodging: a walled court, the rear hall at the back, Lady Yan's rooms on the east ----
            "lb-lodging": {
                "grid": [14, 12], "cell": 2, "margin": 0, "label": "Lü Bu's lodging",
                "ground": [{"id": "court", "kind": "court", "rect": [1, 5, 12, 6]}],
                "lines": [{"id": "walls", "kind": "wall", "outline": [0, 0, 14, 12], "width": 1, "gates": {"gate": [6, 11]}}],
                "things": [
                    {"id": "reartang", "kind": "building.hall_grand", "rect": [1, 1, 7, 3], "door": "S", "label": "The rear hall",
                     "map": "lb-reartang"},
                    {"id": "yan", "kind": "building.wing", "rect": [9, 1, 4, 3], "door": "S", "label": "Lady Yan's rooms",
                     "map": "yan-room"},
                    {"id": "rack", "kind": "furn.rack", "rect": [1, 8, 1, 1]},
                ],
                "exits": [{"to": "Xuzhou", "at": [6, 11], "side": "S"}],
            },
            "lb-reartang": room([12, 7], [6, 6],
                                things=[{"id": "table-1", "kind": "furn.table", "rect": [3, 2, 2, 1]},
                                        {"id": "table-2", "kind": "furn.table", "rect": [7, 2, 2, 1]},
                                        {"id": "screen", "kind": "furn.screen", "rect": [5, 1, 2, 1]},
                                        {"id": "lamp", "kind": "furn.lamp", "rect": [10, 1, 1, 1]}],
                                spots=[{"id": "x3", "at": [6, 4], "node": "3-x3", "label": "The rear hall",
                                        "note": "「布令妻女出拜玄德」"}])
            | {"label": "The rear hall"},
            "yan-room": room([10, 7], [5, 6], floor="wood",
                             things=[{"id": "bed", "kind": "furn.bed", "rect": [1, 1, 1, 1]},
                                     {"id": "mirror", "kind": "furn.mirror", "rect": [4, 1, 1, 1]},
                                     {"id": "screen", "kind": "furn.screen", "rect": [6, 1, 2, 1]},
                                     {"id": "chest", "kind": "furn.chest", "rect": [8, 1, 1, 1], "label": "The bride's chest"}],
                             spots=[{"id": "x7", "at": [5, 4], "node": "3-x7", "label": "Lady Yan's rooms"}])
            | {"label": "Lady Yan's rooms"},
        },
        "npcs": [
            _talk("folk.villager", [10, 7], "“The Lord Liu gave Lü Bu a feast. Lord Zhang Fei didn't come, they say. Or came, and left shouting.”",
                  **{"in": ["guest"]}),
            _talk("folk.elder", [13, 7], "“Cao Bao keeps the west gate. A Danyang man, and Lü Bu is his son-in-law, you know.”",
                  **{"in": ["guest", "moon"]}),
            _talk("folk.soldier", [4, 7], "“No one troubles the Lord Liu's ladies. General Lü's orders.”", **{"in": ["held"]}),
        ],
        "challengers": [
            # Xuzhou's streets (x2-x10): neither blocks
            _ch("drinker", "folk.villager", [8, 7], "node:x1", "node:x10",
                "One of Zhang Fei's drinking companions sways out of the wine shop. “You're the one he calls the slave of three surnames! A game, and if you lose, you drink!”",
                "“…Hic. You play better than he says.”", "Zhang Fei's friend is asleep on the bench."),
            _ch("danyang", "folk.soldier", [2, 9], "node:x1", "node:x10",
                "A Danyang soldier of Cao Bao's leans on his spear. “Our general's daughter married you, didn't she? Let's see if you're worth her.”",
                "“Hah. You'll do.”", "The Danyang soldier salutes."),
        ],
        "objectives": {
            "3-x2": "Go to the prefecture hall, on the main street west of the cross, where Liu Bei receives you.",
            "3-x3": "Go to your lodging's rear hall, on the north side of the main street east of the cross.",
            "3-x4": "Go to the prefecture hall: Liu Bei has something to show you.",
            "3-x5": "Ride to Xuzhou's west gate in the moonlight.",
            "3-x7": "Go to Lady Yan's rooms, in the lodging's court.",
            "3-x8": "Go to the prefecture hall: Chen Gui has come to call.",
            "3-x10": "Go to the prefecture hall.",
            "3-x14": "Ride back to Xuzhou's west gate.",
        },
    },

    # =========================================================================================
    # Xiaopei: Lü Bu's camp outside the little town, its gate 150 paces from his tent (x6); the hunting ground south of
    # the road, and the side path where Chen Gong rides the courier down (x11).
    "Xiaopei": {
        "archetype": "village",
        "plan": {
            "grid": [26, 15], "cell": 4, "margin": 1,
            "ground": [
                {"id": "camp", "kind": "camp", "rect": [2, 2, 10, 8]},
                {"id": "town", "kind": "ward", "rect": [17, 3, 6, 6]},
                {"id": "town-square", "kind": "court", "rect": [17, 5, 6, 1]},
                {"id": "hunt", "kind": "field", "rect": [1, 11, 24, 4]},          # the hunting ground (dressed thick)
            ],
            "lines": [
                {"id": "palisade", "kind": "wall", "outline": [2, 2, 10, 8], "width": 1, "gates": {"camp-gate": [11, 6]}},
                {"id": "road", "kind": "road", "path": [[11, 6], [25, 6]], "width": 3},
                {"id": "town-wall", "kind": "wall", "outline": [16, 2, 8, 8], "width": 1,
                 "gates": {"town-west": [16, 6], "town-east": [23, 6]}},
                {"id": "south-road", "kind": "road", "path": [[13, 6], [13, 13], [25, 13]], "width": 3},   # the courier's road
                {"id": "side-path", "kind": "path", "path": [[3, 13], [8, 13], [8, 11], [11, 11], [11, 13]], "width": 2},
            ],
            "things": [
                {"id": "lb-tent", "kind": "building.tent", "rect": [3, 5, 2, 2], "door": "E", "label": "Lü Bu's tent", "map": "lb-camp"},
                {"id": "tent-2", "kind": "building.tent", "rect": [3, 3, 2, 1], "door": "S"},
                {"id": "tent-3", "kind": "building.tent", "rect": [6, 3, 2, 1], "door": "S"},
                {"id": "tent-4", "kind": "building.tent", "rect": [6, 8, 2, 1], "door": "N"},
                {"id": "halberd", "kind": "prop.halberd", "rect": [10, 5, 1, 1], "label": "Lü Bu's halberd, planted at the camp gate",
                 "note": "x6: 150 paces from the tent; 「吾若一箭射中戟上小枝，你兩家罷兵」"},
                {"id": "fire", "kind": "camp.firepit", "rect": [8, 6, 1, 1]},
                {"id": "town-hall", "kind": "building.hall", "rect": [18, 3, 2, 2], "door": "S", "label": "Xiaopei's county hall"},
                {"id": "town-house-1", "kind": "building.house", "rect": [21, 3, 2, 2], "door": "S"},
                {"id": "town-house-2", "kind": "building.house", "rect": [18, 7, 2, 2], "door": "N"},
                {"id": "town-house-3", "kind": "building.house", "rect": [21, 7, 2, 2], "door": "N"},
            ],
            "spots": [
                {"id": "camp-gate", "at": [12, 6], "label": "The camp gate", "note": "the halberd stands just inside"},
                {"id": "x11", "at": [12, 13], "node": "3-x11", "label": "Where the side path meets the road", "trigger": "near",
                 "note": "Chen Gong cuts the courier off here"},
            ],
            "dress": [
                {"kind": "tree.poplar", "along": "road", "every": 3},
                {"kind": "tree.willow", "in": "hunt", "count": 14},
                {"kind": "banner.red", "at_door": "lb-tent", "pair": True},
                {"kind": "banner", "at_gates": True},
            ],
            "exits": [{"to": "Xuzhou", "at": [25, 6], "side": "E"}],
            "entries": {"": [12, 6], "Xuzhou": [24, 6]},
        },
        "states": [
            {"id": "camp", "light": "day"},
            {"id": "cao", "when": "node:x14", "light": "day", "banners": "blue"},   # Cao Ren's flags on Xiaopei's wall
        ],
        "maps": {
            # ---- Lü Bu's tent: the banquet with Ji Ling and Liu Bei, the bow (x6) ----
            "lb-camp": room([12, 8], [6, 7], floor="earth",
                            things=[{"id": "seat", "kind": "furn.dais", "rect": [5, 1, 2, 1], "label": "Lü Bu's seat"},
                                    {"id": "table-1", "kind": "furn.table", "rect": [2, 3, 1, 1], "label": "Ji Ling's table"},
                                    {"id": "table-2", "kind": "furn.table", "rect": [9, 3, 1, 1], "label": "Liu Bei's table"},
                                    {"id": "rack", "kind": "furn.rack", "rect": [1, 1, 1, 1], "label": "The bow and the arrows"}],
                            spots=[{"id": "x6", "at": [6, 5], "node": "3-x6", "label": "Lü Bu's tent",
                                    "note": "the shot goes out of the tent door, east, to the halberd at the camp gate"}])
            | {"label": "Lü Bu's tent"},
        },
        "npcs": [
            _talk("folk.soldier", [9, 4], "“They say the general can put an arrow through a halberd's side blade at a hundred and fifty paces. I say nobody can.”",
                  **{"until": "node:x6"}),
            _talk("folk.soldier", [9, 4], "“I saw it. Straight through the little blade. Ji Ling went home without a fight.”",
                  **{"when": "node:x6"}),
        ],
        "challengers": [
            _ch("falconer", "folk.villager", [5, 12], "node:x10", "node:x11",
                "A falconer looks up from his bird. “Out hunting, Adviser? The hawk won't fly for a man in a hurry. Play me while she settles.”",
                "“She'll fly for you now.”", "The falconer's hawk is on the wing."),
        ],
        "objectives": {
            "3-x6": "Go to your tent in the camp, west of Xiaopei. The halberd stands at the camp gate.",
            "3-x11": "Take the side path through the hunting ground to the road, and cut the courier off.",
        },
    },

    # =========================================================================================
    # The Shouchun Road: thirty li of road south from Xuzhou, the bridal party ahead (x9). One of Ji Ling's outriders
    # holds the defile before it (blocking).
    "The Shouchun Road": {
        "archetype": "road",
        "plan": {
            "grid": [36, 9], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills-n", "kind": "hills", "rect": [0, 0, 36, 2]},
                {"id": "hills-s", "kind": "hills", "rect": [0, 7, 36, 2]},
                {"id": "fields", "kind": "field.wheat", "rect": [2, 5, 12, 2]},
                {"id": "defile-n", "kind": "hills", "rect": [22, 2, 4, 2]},       # the road narrows between two spurs
                {"id": "defile-s", "kind": "hills", "rect": [22, 5, 4, 2]},
                {"id": "halt", "kind": "plain", "rect": [28, 2, 7, 5]},            # where the bridal party has halted
            ],
            "lines": [{"id": "road", "kind": "road", "path": [[0, 4], [35, 4]], "width": 3}],
            "things": [
                {"id": "carriage", "kind": "prop.carriage", "rect": [31, 2, 2, 1], "label": "The bridal carriage"},
                {"id": "drums", "kind": "camp.table", "rect": [29, 2, 1, 1], "label": "The drums and pipes"},
            ],
            "spots": [{"id": "x9", "at": [31, 4], "node": "3-x9", "label": "The bridal party", "trigger": "near"}],
            "dress": [{"kind": "milestone", "along": "road", "every": 3}, {"kind": "tree.poplar", "along": "road", "every": 3},
                      {"kind": "banner.red", "at_door": "carriage", "pair": True}],
            "exits": [{"to": "Xuzhou", "at": [0, 4], "side": "W"}],
            "entries": {"": [1, 4], "Xuzhou": [1, 4]},
        },
        "states": [{"id": "road", "light": "day"}],
        "npcs": [_talk("folk.villager", [10, 5], "“Drums and pipes went by an hour ago, with a red carriage. A wedding for the south, they said.”")],
        "challengers": [
            _ch("outrider", "folk.soldier", [24, 4], "node:x8", "node:x9",
                "One of Ji Ling's outriders wheels his horse across the narrows. “The bride of the House of Yuan rides under our guard. Turn back.”",
                "“…Lü Bu's own man. Then go and argue with her escort, not me.”", "The outrider has ridden back to the column.",
                blocks="x9", view=2, guard=[24, 4]),
        ],
        "objectives": {"3-x9": "Ride the Shouchun road south after the bridal party, thirty li, and bring the bride home."},
    },

    # =========================================================================================
    # Xiao Pass at night: the pass road climbs from the Xuzhou side to Chen Gong's men on the top; Cao Cao's camp lies
    # below the cliff on the far side, where Chen Deng shoots his three letters down (x13).
    "Xiao Pass": {
        "archetype": "hills",
        "plan": {
            "grid": [24, 16], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills", "kind": "hills", "rect": [0, 0, 24, 16]},
                {"id": "valley", "kind": "plain", "rect": [10, 9, 6, 7]},          # the Xuzhou side, below the climb
                {"id": "top", "kind": "plain", "rect": [5, 1, 9, 5]},              # the top of the pass: Chen Gong's men
                {"id": "cliff", "kind": "cliff", "rect": [4, 1, 1, 7]},            # the drop to the west
                {"id": "cao-camp", "kind": "camp", "rect": [0, 1, 4, 7]},           # Cao Cao's camp, below: seen, not reached
            ],
            "lines": [{"id": "pass-road", "kind": "road", "path": [[12, 15], [12, 8], [8, 8], [8, 5]], "width": 3}],
            "things": [
                {"id": "cg-tent", "kind": "building.tent", "rect": [10, 1, 2, 1], "door": "S", "label": "Chen Gong's men's tents"},
                {"id": "cg-tent-2", "kind": "building.tent", "rect": [12, 2, 2, 1], "door": "S"},
                {"id": "fire", "kind": "camp.firepit", "rect": [9, 3, 1, 1], "label": "A watch fire"},
                {"id": "cao-tent-1", "kind": "building.tent", "rect": [1, 2, 2, 1], "label": "Cao Cao's camp, below the pass"},
                {"id": "cao-tent-2", "kind": "building.tent", "rect": [1, 5, 2, 1]},
            ],
            "checks": [{"check": "covered_route", "from": [8, 6], "to": [5, 4], "beats": ["3-x13"], "must_wait": True}],
            "spots": [{"id": "pass-foot", "at": [8, 6], "label": "The top of the pass road"},
                      {"id": "x13", "at": [5, 4], "node": "3-x13", "label": "The cliff's edge above Cao Cao's camp", "trigger": "near",
                       "note": "the three arrow letters go down from here"}],
            "watchers": [   # Chen Gong's men on the top of the pass (x13): get the letters down unseen
                {"id": "sentry-fire", "kind": "folk.soldier", "beat": [[7, 3], [12, 3], [7, 3]], "shape": "U", "pause": [12, 3, 2],
                 "cone": 4, "in_beats": ["3-x13"], "seen": "sentry", "back_to": "pass-foot"},
                {"id": "sentry-edge", "kind": "folk.soldier", "beat": [[6, 1], [6, 5], [6, 1]], "shape": "U", "pause": [6, 1, 3],
                 "cone": 4, "in_beats": ["3-x13"], "seen": "sentry", "back_to": "pass-foot"},
            ],
            "dress": [{"kind": "tree.poplar", "in": "valley", "count": 5}, {"kind": "banner.blue", "in": "cao-camp", "count": 3}],
            "exits": [{"to": "Xuzhou", "at": [12, 15], "side": "S"}],
            "entries": {"": [12, 14], "Xuzhou": [12, 14]},
        },
        "states": [{"id": "night", "light": "night"}],
        "seen_lines": {"sentry": ["“Who goes there? Oh, Master Chen. The Adviser said no one comes up tonight.” You're sent back down the road."]},
        "challengers": [
            _ch("bandit", "folk.villager", [10, 8], "node:x12", "node:x13",
                "A Taishan bandit blocks the narrow road, a club on his shoulder. “Toll, scholar. Or a game, if you're too poor for silver.”",
                "“…Go on, then. I never liked Chen Gong's lot anyway.”", "The bandit has melted back into the hills.",
                blocks="x13", view=1, guard=[10, 8]),
            _ch("sentry", "folk.soldier", [13, 10], "node:x12", "node:x13",
                "One of Chen Gong's sentries leans on his spear by the bend. “Cold night for a walk, sir. Keep me awake a while?”",
                "“Ha. Now I'm awake.”", "The sentry stamps his feet against the cold."),
        ],
        "objectives": {"3-x13": "Climb the pass road at night and reach the cliff's edge above Cao Cao's camp, unseen by Chen Gong's men."},
    },

    # =========================================================================================
    # The Xiapi Road: Lü Bu moves his household and his grain to Xiapi (x12), an escorted walk.
    "The Xiapi Road": {
        "archetype": "road",
        "plan": {
            "grid": [36, 9], "cell": 4, "margin": 1,
            "ground": [
                {"id": "hills-n", "kind": "hills", "rect": [0, 0, 36, 1]},
                {"id": "fields-n", "kind": "field.wheat", "rect": [4, 1, 14, 2]},
                {"id": "fields-s", "kind": "field.wheat", "rect": [18, 6, 14, 2]},
                {"id": "marsh", "kind": "water", "rect": [6, 6, 8, 3]},
            ],
            "lines": [
                {"id": "road", "kind": "road", "path": [[0, 4], [35, 4]], "width": 3},
                {"id": "si", "kind": "river", "path": [[31, 0], [31, 8]], "width": 3},   # the Si, bridged just before Xiapi
            ],
            "things": [
                {"id": "inn", "kind": "building.inn", "rect": [16, 3, 2, 1], "door": "S", "label": "A roadside inn"},
            ],
            "spots": [{"id": "x12", "at": [34, 4], "node": "3-x12", "label": "Xiapi in sight", "trigger": "near"}],
            "dress": [{"kind": "milestone", "along": "road", "every": 5}, {"kind": "tree.willow", "along": "road", "every": 3}],
            "exits": [{"to": "Xuzhou", "at": [0, 4], "side": "W"}, {"to": "Xiapi", "at": [35, 4], "side": "E"}],
            "entries": {"": [1, 4], "Xuzhou": [1, 4], "Xiapi": [34, 4]},
        },
        "states": [
            {"id": "road", "light": "day"},
            {"id": "move", "when": "node:x11", "until": "node:x12", "light": "day",
             "procession": {"column": ["outriders", "carriage:yan", "carriage:diaochan", "player", "carriage:grain", "carriage:grain",
                                       "rearguard"],
                            "path": "road", "from": [0, 4], "to": [35, 4], "leash": 6,
                            "leash_line": "Lü Bu keeps beside his household's carriages.", "stops": ["x12"]}},
        ],
        "npcs": [_talk("folk.villager", [16, 4], "“Grain carts, all morning. Whatever's coming to Xuzhou, the general isn't staying to meet it.”",
                       **{"in": ["road"]})],
        "objectives": {"3-x12": "Escort your household and the grain carts down the road to Xiapi."},
    },

    # =========================================================================================
    # Xiapi on the Si: the siege (x15-x16), then the flood in two stages (x17, x18-x19): 「只剩得東門無水」. Lü Bu's
    # residence (lb-fu), the stables by the east gate where Hou Cheng takes Red Hare (x19), the White Gate tower (x20).
    # Outside: Cao Cao's siege camp east, Liu Bei's camp south on the road to Huainan (x16).
    "Xiapi": {
        "archetype": "city",
        "banners": "red",
        "plan": {
            "grid": [26, 20], "cell": 4, "margin": 1,
            "ground": [
                {"id": "city", "kind": "city", "rect": [5, 4, 15, 12]},
                {"id": "fore-fu", "kind": "court", "rect": [6, 7, 4, 1]},
                {"id": "stable-yard", "kind": "court", "rect": [15, 10, 3, 1]},
                {"id": "cao-camp", "kind": "camp", "rect": [22, 3, 4, 13]},
                {"id": "liubei-camp", "kind": "camp", "rect": [8, 18, 9, 2]},
            ],
            "lines": [
                {"id": "si", "kind": "river", "path": [[1, 0], [1, 19]], "width": 4},     # the Si, along the west
                {"id": "yi", "kind": "river", "path": [[1, 1], [25, 1]], "width": 3},     # the Yi, along the north
                {"id": "wall", "kind": "wall.city", "outline": [4, 3, 17, 14], "width": 2,
                 "gates": {"west-gate": [4, 9], "east-gate": [20, 9], "south-gate": [12, 16]}},
                {"id": "main-street", "kind": "road", "path": [[0, 9], [25, 9]], "width": 3},
                {"id": "south-street", "kind": "road", "path": [[12, 9], [12, 19]], "width": 3},   # out by the White Gate, to Huainan
                {"id": "fu-lane", "kind": "road", "path": [[8, 7], [8, 9]], "width": 2},
            ],
            "things": [
                {"id": "lbfu", "kind": "building.hall_grand", "rect": [6, 5, 4, 2], "door": "S", "label": "Lü Bu's residence",
                 "map": "lb-fu", "plaque": "吕府"},
                {"id": "granary", "kind": "building.granary", "rect": [14, 5, 2, 1], "label": "The granary"},
                {"id": "house-1", "kind": "building.house", "rect": [16, 5, 2, 1]},
                {"id": "stables", "kind": "building.stable", "rect": [15, 11, 3, 2], "door": "N", "label": "The stables",
                 "note": "x19: Red Hare is here"},
                {"id": "house-2", "kind": "building.house", "rect": [6, 11, 2, 1]},
                {"id": "house-3", "kind": "building.house", "rect": [8, 11, 2, 1]},
                {"id": "house-4", "kind": "building.house", "rect": [6, 13, 2, 1]},
                {"id": "white-gate", "kind": "building.gatetower", "rect": [12, 16, 2, 1], "door": "N", "label": "The White Gate tower",
                 "map": "white-gate", "plaque": "白门"},
                {"id": "cao-tent-1", "kind": "building.tent", "rect": [23, 4, 2, 1], "door": "W", "label": "Cao Cao's siege camp"},
                {"id": "cao-tent-2", "kind": "building.tent", "rect": [23, 12, 2, 1], "door": "W"},
                {"id": "lb-tent-1", "kind": "building.tent", "rect": [9, 18, 2, 1], "label": "Liu Bei's camp"},
                {"id": "lb-tent-2", "kind": "building.tent", "rect": [14, 18, 2, 1]},
            ],
            "spots": [
                {"id": "stables-door", "at": [16, 10], "at_door": "stables", "label": "The stables' door",
                 "note": "x19: Hou Cheng starts here"},
                {"id": "x16", "at": [12, 18], "node": "3-x16", "label": "Liu Bei's lines", "trigger": "near",
                 "note": "Guan Yu and Zhang Fei bar the way; he turns back"},
                {"id": "x19", "at": [22, 9], "node": "3-x19", "label": "Out of the east gate", "trigger": "near",
                 "note": "Wei Xu opens the gate and 'chases' him for show"},
            ],
            "watchers": [   # x19: Lü Bu's men on the causeway, the one dry road; Hou Cheng on Red Hare can go round by the water
                {"id": "guard-causeway", "kind": "folk.soldier", "beat": [[13, 9], [18, 9], [13, 9]], "shape": "U", "pause": [18, 9, 2],
                 "cone": 5, "in_beats": ["3-x19"], "seen": "guard", "back_to": "stables-door"},
                {"id": "guard-gate", "kind": "folk.soldier", "at": [19, 9], "turns": ["W", "S"], "cone": 4, "in_beats": ["3-x19"],
                 "seen": "guard", "back_to": "stables-door"},
            ],
            "dress": [
                {"kind": "tree.willow", "along": "main-street", "every": 4},
                {"kind": "banner", "at_gates": True},
                {"kind": "banner.red", "at_door": "lbfu", "pair": True},
                {"kind": "banner.blue", "in": "cao-camp", "count": 4},
                {"kind": "banner.green", "in": "liubei-camp", "count": 2},
            ],
            # the flood (cells): the low ground first, with the south and west gates; then all but the causeway to the east gate
            "floods": {
                "flood1": [[0, 11, 26, 9], [0, 2, 9, 9]],
                "flood2": [[0, 0, 26, 9], [0, 10, 26, 10], [0, 9, 13, 1]],
            },
            "exits": [{"to": "The Xiapi Road", "at": [0, 9], "side": "W"}],
            "entries": {"": [10, 9], "The Xiapi Road": [3, 9]},
        },
        "states": [
            {"id": "siege", "until": "node:x16", "light": "day"},
            {"id": "flood1", "when": "node:x16", "until": "node:x17", "light": "day", "weather": "rain", "water": "flood1"},
            {"id": "flood2", "when": "node:x17", "until": "node:x19", "light": "day", "weather": "rain", "water": "flood2"},
            {"id": "night", "when": "node:x18", "until": "node:x19", "light": "night", "water": "flood2"},
            {"id": "taken", "when": "node:x19", "light": "day", "water": "flood1", "banners": "blue"},
        ],
        "seen_lines": {"guard": ["“Who's at the horses? General Hou?” The guard peers through the rain, and you back off into the dark."]},
        "maps": {
            # ---- Lü Bu's residence: the counsel (x15), the mirror (x17), the lashes (x18) ----
            "lb-fu": room([16, 8], [8, 7],
                          things=[{"id": "dais", "kind": "furn.dais", "rect": [7, 1, 2, 1], "label": "Lü Bu's seat"},
                                  {"id": "screen", "kind": "furn.screen", "rect": [10, 1, 2, 1]},
                                  {"id": "mirror", "kind": "furn.mirror", "rect": [13, 1, 1, 1], "label": "The mirror",
                                   "note": "x17: 「吾被酒色傷矣！」"},
                                  {"id": "table-1", "kind": "furn.table", "rect": [3, 3, 1, 1]},
                                  {"id": "table-2", "kind": "furn.table", "rect": [12, 3, 1, 1]},
                                  {"id": "rack", "kind": "furn.rack", "rect": [1, 1, 1, 1], "label": "The halberd"}],
                          spots=[{"id": "x15", "at": [8, 5], "node": "3-x15", "label": "The counsel"},
                                 {"id": "x17", "at": [13, 3], "node": "3-x17", "label": "The mirror"},
                                 {"id": "x18", "at": [5, 5], "node": "3-x18", "label": "Fifty lashes"}])
            | {"label": "Lü Bu's residence"},
            # ---- the top of the White Gate tower: Lü Bu asleep in his chair; Cao Cao's judgement (x20) ----
            "white-gate": room([14, 8], [7, 7],
                               things=[{"id": "chair", "kind": "furn.seat", "rect": [6, 2, 1, 1], "label": "The chair where Lü Bu dozed"},
                                       {"id": "screen", "kind": "furn.screen", "rect": [9, 1, 2, 1]},
                                       {"id": "rack", "kind": "furn.rack", "rect": [2, 1, 1, 1]},
                                       {"id": "flags", "kind": "banner.white", "rect": [12, 1, 1, 1], "label": "White flags"}],
                               spots=[{"id": "x20", "at": [7, 4], "node": "3-x20", "label": "The White Gate tower"}])
            | {"label": "The White Gate tower"},
        },
        "npcs": [
            _talk("folk.soldier", [10, 9], "“Cao Cao's dug in on three sides and Liu Bei sits on the Huainan road. Nobody's getting out.”",
                  **{"in": ["siege"]}),
            _talk("folk.villager", [17, 9], "“The water's up to the doorsteps on the south side. The east gate's the only dry way left.”",
                  **{"in": ["flood2"]}),
        ],
        "challengers": [
            # Xiapi before the flood (x15-x16): neither blocks
            _ch("grumbler", "folk.soldier", [10, 10], "node:x14", "node:x16",
                "An officer of Hou Cheng's spits in the gutter. “No wine, no pay, and the general up there with his women. Play me, General, and tell me why I should stay.”",
                "“…Fair enough. I'll stay. For now.”", "The officer goes back to his post, still muttering."),
            _ch("wall-sentry", "folk.soldier", [19, 12], "node:x14", "node:x16",
                "A sentry at the foot of the wall stairs stands to. “General! I've counted Cao Cao's fires all night. Shall I count them for you?”",
                "“Then you know what I know.”", "The sentry has gone back up the wall."),
        ],
        "objectives": {
            "3-x15": "Go to your residence, on the north-west of the city, where Chen Gong waits.",
            "3-x16": "Carry your daughter out by the White Gate and down the Huainan road to Liu Bei's lines.",
            "3-x17": "Ride Red Hare round the flooded city, then back to your residence.",
            "3-x18": "Go to your residence.",
            "3-x19": "Take Red Hare from the stables and ride out of the dry east gate, unseen.",
            "3-x20": "Go up the White Gate tower.",
        },
    },
}

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}
