"""Red Chamber, Book 1: 侯门深似海 Deep as the Sea, as plan grids (docs/book2/plan-grid.md, docs/places-playbook.md).

The story is Plot's WORLD_HLM1 (redchamber/book1/story.py); its design is redchamber/book1/design.md ("Places", "Road
challengers"). Beat keys here are "hl1-d1" ... "hl1-g7"; the factory renames them to the world's own ("<n>-d1").

    python3 tools/check_plans_w2.py --arc hlm1 [--png]      # check (and draw into redchamber/book1/plans-png/)
    redchamber/tools/build_places.sh                         # build, compile (three kits) and stage, against the story

One house, two ways in. The places:
  The Rong Mansion   inside the walls (cell 2): the west side gate and the festooned gate (d1), Grandmother Jia's court
                     and rooms (d2, d3, d6, d7; the green gauze closet, d8), the great court and Rongxi Hall (d5), the
                     wide north-south passage with Xifeng's screen wall and half-size gate (shown to Daiyu in d6; Granny
                     Liu goes through it in g5), Xifeng's courtyard and rooms (g5, g6), the back yard inside the back
                     gate and Zhou Rui's house (g4)
  Lady Xing's Court  behind a black-lacquered gate east of the main gate, three inner gates deep, cut off from a garden (d4)
  The Village        outside the city: fields, a few farmhouses, Gou'er's house (g1)
  Ning-Rong Street   the outside of both mansions (cell 4): the Ning mansion's gate, the Rong mansion's main gate with its
                     stone lions and sedan chairs, its west side gate and the bench of servants (g2), the lane round the
                     west end, the back street with its hawkers and children and the back gate (g3, g7)

How the gates go (the engine lands an arrival at the entry kept for the map it came from, so each pair of maps has one
way between them that is open): in Part 1 every gate to the street is shut (Daiyu takes "not one step more"); the
carriage to Lady Xing's and back is a handoff, landing inside the west side gate. In Part 2 only the back gate opens,
once a child has led Granny Liu to it (g3); the side gate's men send her round, and the main gate never opens.
"""
import sys
from pathlib import Path

_TOOLS = Path(__file__).resolve().parents[2] / "tools"
sys.path[:0] = [str(_TOOLS), str(_TOOLS / "mapfactory")]
from tk_plans_w2 import ART as ART2, LINE_KINDS, NEW_KINDS as NEW_KINDS2, ZONE_KINDS, _ch, room  # noqa: E402

# The beat keys. A spot's "node" carries the plans' prefix (K("d1") is "hl1-d1"; the factory renames it to the world's);
# a condition ("when", "until": "node:d4") names the bare key, which the engine reads as this world's.
KEYS_HLM1 = {f"d{i}" for i in range(1, 9)} | {"d6a"} | {f"g{i}" for i in range(1, 8)}
P = "hl1"   # the plans' key prefix: "hl1-d1"


def K(k):
    return f"{P}-{k}"


# Kinds this book adds: footprint in tiles (w, h, solid), copied into vocab.KINDS. Each has a stand-in (vocab.FALLBACK)
# and a brief for Graphics (ART).
NEW_KINDS = {**NEW_KINDS2,
             "building.festoongate": (2, 1, False),   # 垂花门: a gate in a court wall under a little roof hung with carved pendants
             "building.halfgate": (2, 1, False),      # 半大门: a gate half the size of a court gate (Xifeng's)
             "building.blackgate": (2, 1, False),     # 黑油大门: Lady Xing's black-lacquered gate
             "landmark.stonelion": (2, 2, True),      # 石狮子: a great stone lion on a plinth, one each side of a mansion gate
             "prop.sedan": (2, 2, True),              # 轿子: a sedan chair, set down, its poles on the ground
             "prop.greencart": (3, 2, True),          # 翠幄青绸车: a covered carriage hung with green silk
             "prop.bench": (4, 1, True),              # 大板凳: a long wooden bench by a gate
             "prop.birdcage": (1, 1, True),           # a bird cage hung under the eaves of a covered walk (parrots, thrushes)
             "prop.toyload": (2, 1, True),            # a hawker's carrying pole and two baskets of toys, set down
             "furn.kang": (3, 2, True),               # 炕: a heated brick platform bed-seat, a low table on it
             "furn.cushion": (1, 1, False),           # 锦褥: a brocade cushion laid on a kang
             "furn.clock": (1, 1, True),              # 自鸣钟: a striking clock in a box on a pillar, its weight swinging below
             "furn.plaque": (3, 1, True),             # 匾: a great gilt plaque on the back wall, characters in gold
             "furn.handwarmer": (1, 1, False),        # 手炉: a little brass hand-warmer on a kang table
             "furn.gauze": (3, 1, False),             # 碧纱橱: a partition of green gauze in a carved frame
             }
ART = {**ART2,
       "building.festoongate": "a Chinese 'festooned gate' (垂花门) set in a whitewashed courtyard wall: a small gabled roof of "
                                "grey tiles over a red-lacquered doorway, carved hanging pillars ending in painted lotus-bud "
                                "pendants at the front corners, green and gold painted beams; two tiles wide, the same 3/4 "
                                "view as the gatehouses, the opening walkable",
       "building.halfgate": "a small plain gate in a whitewashed courtyard wall, half the height of a court gate (半大门), dark "
                            "red leaves standing open, a little tiled roof; two tiles wide, walkable through",
       "building.blackgate": "a mansion's gate with black-lacquered leaves (黑油大门) and brass studs under a grey tiled roof, "
                             "set in a high wall; two tiles wide, the same view as the gatehouses",
       "landmark.stonelion": "a great grey stone guardian lion (石狮子) crouching on a carved plinth, mouth open, one paw on a "
                             "ball; two tiles square, as tall as a person and a half; a pair flanks a mansion gate",
       "prop.sedan": "a Qing sedan chair (轿子) set down: a box of dark wood with a curtained front and gauze side windows, a "
                     "little domed roof, two long carrying poles resting on the ground; two tiles square",
       "prop.greencart": "a covered carriage (翠幄青绸车): a two-wheeled cart with a green silk canopy and curtains, no horse "
                         "(it is led off), shafts resting on the ground; three tiles long, two deep",
       "prop.bench": "a long plain wooden bench (大板凳) set against a wall by a gate, four tiles long",
       "prop.birdcage": "a round bamboo bird cage with a green parrot in it, hung from a hook; one tile, drawn at head "
                        "height under the eaves of a covered walk",
       "prop.toyload": "a hawker's carrying pole set down with two flat baskets of toys: clay figures, little drums, paper "
                       "windmills, sugar figures; two tiles wide",
       "furn.kang": "a kang (炕) seen from the room: a raised platform of brick under a red felt rug, a low lacquered kang "
                    "table on it with tea things, bolsters at the back; three tiles wide, two deep",
       "furn.cushion": "a brocade seat cushion (锦褥), deep red with gold roundels, flat on the kang or floor; one tile",
       "furn.clock": "a western striking clock (自鸣钟) in a carved box hung on a red pillar, a brass pendulum weight below "
                     "it; one tile wide, drawn two tiles tall, the pillar to the floor",
       "furn.plaque": "a great horizontal plaque (匾) on the back wall: blue ground, a frame of gold dragons, three large "
                      "gold characters; three tiles wide, hung high",
       "furn.handwarmer": "a little round brass hand-warmer (手炉) with a pierced lid and a pair of tiny brass tongs on a "
                          "kang table; one tile",
       "furn.gauze": "a partition of green gauze (碧纱橱) stretched in a carved red-lacquer frame, the bed glimpsed through "
                     "it; three tiles wide, walked round, not through",
       }
# Their stand-ins, until Graphics draws them, are in tools/mapfactory/vocab.py FALLBACK (and the footprints in its KINDS).


def _room(grid, door, label, **kw):
    return room(grid, door, **kw) | {"label": label}


# The watching layer (design.md, "Read the room"): before a board, the people in the room each give a cue. Plot's
# ROOM_CUES (redchamber/book1/story.py, 216a5cf), placed: (beat, who, the cell in the beat's room or place, facing,
# the line). Each stands there while the beat is the open one (from the beat before it until it is won), so a room's
# board spots wait for a tap ("trigger": "talk"): she can look about her first. The cutscene hides them, and they go
# when the beat is won.
PREV = {"d2": "d1", "d3": "d2", "d4": "d3", "d5": "d4", "d6a": "d5", "d6": "d6a", "d7": "d6", "d8": "d7",
        "g1": "d8", "g2": "g1", "g3": "g2", "g4": "g3", "g5": "g4", "g6": "g5", "g7": "g6"}
CUES = [
    ("d2", "jmmaid", [3, 7], "E", "Everyone stands back for the old lady. The two holding her up never let go."),
    ("d2", "laomama", [13, 7], "W", "The silver-haired one is the old lady herself, miss."),
    ("d3", "tanchun", [14, 5], "W", "This is Cousin Lian's wife."),
    ("d3", "jmmaid", [3, 4], "E", "Nobody calls her Pepper Feng but the old lady."),
    ("d4", "laomama", [8, 5], "W", "The old lady said both uncles, miss, and the light's going."),
    ("d5", "laomama", [9, 7], "E", "Two cushions on the kang, facing each other. Somebody's places."),
    ("d5", "jmmaid", [15, 6], "W", "The mistress always sits on the lower side. The east place is the master's."),
    ("d5", "jmmaid", [19, 5], "W", "The mistress smiles when she talks about him. Everyone does."),
    ("d6", "liwan", [14, 4], "W", "We don't sit. We serve the old lady."),
    ("d6", "jmmaid", [6, 3], "E", "The spittoon comes before the tea you drink."),
    ("d6", "tanchun", [15, 7], "W", "Grandmother thinks girls only need a few characters."),
    ("d7", "jmmaid", [4, 8], "E", "A jade? What does he mean? Nobody knows."),
    ("g2", "oldservant", [9, 11], "W", "Those idlers are having their fun. Don't wait by that wall."),
    ("g3", "backchild", [13, 1], "W", "There are three Zhou Da-niangs here. Which one?"),
    ("g4", "zhouruijia", [7, 2], "W", "I do like to be asked. It's not my job, mind, but I know everyone."),
    ("g5", "zhouruijia", [4, 5], "E", "Miss Ping, this is the granny I told you of."),
    ("g6", "zhouruijia", [10, 5], "W", "Go on. Say it now, while there's no one else here."),
]
ROOM_OF = {"d2": "jm-rooms", "d3": "jm-rooms", "d6": "jm-rooms", "d7": "jm-rooms", "d4": "xing-hall", "d5": "wf-rooms",
           "g4": "zhou-house", "g5": "xf-eastroom", "g6": "xf-rooms", "g2": None, "g3": None}


def cues(place_keys):
    """The cue-givers of the beats in place_keys, as plan npcs: a cast member saying their line, while the beat is open."""
    return [{"kind": f"hero.{who}", **({"place": ROOM_OF[k]} if ROOM_OF[k] else {}), "at": at, "face": face,
             "say": [[who, line]], "when": f"node:{PREV[k]}", "until": f"node:{k}"}
            for k, who, at, face, line in CUES if k in place_keys]


# =========================================================================================================== the house
# The Rong Mansion, cells of 2 tiles. North up; the street is outside the south wall, the back street outside the north.
#   x 1-13   Grandmother Jia's court (y 4-21), the festooned gate in its south wall; the west lane below it (y 23-28),
#            from the west side gate
#   x 15-18  the wide north-south passage (y 8-21): Xifeng's half-size gate at its north end, the whitewashed screen wall
#            before it, the inverted hall at its south end; Xifeng's courtyard north of the gate (y 1-6)
#   x 20-30  the back yard inside the back gate (y 1-9), Zhou Rui's house; the great court (y 11-21) and Rongxi Hall;
#            the outer court inside the main gate (y 23-28), x 15-30
RONG = {
    "archetype": "compound",
    "plan": {
        "grid": [32, 30], "cell": 2, "margin": 0,
        "ground": [
            {"id": "jm-court", "kind": "court", "rect": [1, 1, 13, 21]},       # Grandmother Jia's
            {"id": "jm-garden", "kind": "garden", "rect": [2, 15, 3, 5]},
            {"id": "jm-garden-e", "kind": "garden", "rect": [10, 15, 3, 5]},
            {"id": "west-lane", "kind": "court", "rect": [1, 23, 13, 6]},
            {"id": "xf-court", "kind": "court", "rect": [15, 1, 4, 6]},       # Xifeng's
            {"id": "passage", "kind": "passage", "rect": [15, 8, 4, 14]},
            {"id": "back-yard", "kind": "court", "rect": [20, 1, 11, 9]},
            {"id": "great-court", "kind": "court", "rect": [20, 11, 11, 11]},
            {"id": "outer-court", "kind": "court", "rect": [15, 23, 16, 6]},
            {"id": "jm-back", "kind": "garden", "rect": [2, 1, 11, 2]},      # behind Grandmother Jia's rooms
        ],
        "lines": [
            {"id": "outer", "kind": "wall", "outline": [0, 0, 32, 30], "width": 1,
             "gates": {"back-gate": [25, 0], "west-side-gate": [6, 29], "main-gate": [24, 29]}},
            {"id": "wall-s", "kind": "wall", "path": [[0, 22], [31, 22]], "width": 1,
             "gates": {"festooned-gate": [7, 22], "ceremonial-gate": [25, 22]},
             "gate_kinds": {"festooned-gate": "building.festoongate"},
             "gate_labels": {"festooned-gate": "The festooned gate", "ceremonial-gate": "The ceremonial gate"}},
            {"id": "wall-jm", "kind": "wall", "path": [[14, 0], [14, 29]], "width": 1,
             "gates": {"jm-crosshall": [14, 11], "west-crosshall": [14, 25]},
             "gate_labels": {"jm-crosshall": "A cross-hall to Grandmother Jia's court", "west-crosshall": "The cross-hall"}},
            {"id": "wall-xf", "kind": "wall", "path": [[15, 7], [18, 7]], "width": 1,
             "gates": {"half-gate": [17, 7]}, "gate_kinds": {"half-gate": "building.halfgate"},
             "gate_labels": {"half-gate": "Sister Feng's gate"}},
            {"id": "wall-e", "kind": "wall", "path": [[19, 0], [19, 22]], "width": 1,
             "gates": {"yard-gate": [19, 9], "corner-gate": [19, 14]},
             "gate_labels": {"yard-gate": "A side gate to the back yard", "corner-gate": "A corner gate"}},
            {"id": "wall-gc", "kind": "wall", "path": [[19, 10], [31, 10]], "width": 1},
            # the covered walks: from the festooned gate up both sides of her court, and down the great court's east side
            {"id": "walk-w", "kind": "gallery", "path": [[7, 21], [3, 21], [3, 11]], "width": 2},
            {"id": "walk-e", "kind": "gallery", "path": [[7, 21], [11, 21], [11, 11]], "width": 2},
            {"id": "walk-gc", "kind": "gallery", "path": [[29, 21], [29, 12]], "width": 2},
        ],
        "things": [
            # Grandmother Jia's court: the marble screen inside the walks, then her five-bay rooms
            {"id": "jm-screen", "kind": "garden.screenwall", "rect": [6, 18, 3, 1], "label": "A marble screen in a red sandalwood frame"},
            {"id": "jm-hall", "kind": "building.hall_grand", "rect": [4, 5, 7, 3], "door": "S", "label": "Grandmother Jia's rooms",
             "map": "jm-rooms"},
            # the passage: the inverted hall at the south end; the screen wall before Xifeng's gate at the north
            {"id": "xf-screen", "kind": "garden.screenwall", "rect": [16, 9, 2, 1], "label": "A whitewashed screen wall"},
            {"id": "inverted-hall", "kind": "building.house", "rect": [16, 20, 2, 1], "door": "N", "label": "The inverted hall"},
            # Xifeng's courtyard: her small house
            {"id": "xf-house", "kind": "building.hall", "rect": [15, 1, 4, 2], "door": "S", "label": "Sister Feng's rooms",
             "map": "xf-eastroom"},
            # the back yard: Zhou Rui's house just inside the back gate, servants' houses
            {"id": "zhou", "kind": "building.house", "rect": [26, 1, 3, 1], "door": "S", "label": "Zhou Rui's house", "map": "zhou-house"},
            {"id": "yard-h1", "kind": "building.house", "rect": [21, 1, 3, 1], "door": "S"},
            {"id": "yard-h2", "kind": "building.house", "rect": [21, 6, 3, 1], "door": "S"},
            {"id": "yard-h3", "kind": "building.house", "rect": [27, 6, 3, 1], "door": "S"},
            # the great court: Rongxi Hall
            {"id": "rongxi", "kind": "building.hall_grand", "rect": [22, 12, 6, 3], "door": "S", "label": "Rongxi Hall",
             "map": "wf-rooms", "plaque": "荣禧堂"},
            {"id": "gc-gotable", "kind": "furniture.gotable", "rect": [30, 16, 1, 1], "label": "A go board in the covered walk"},
            # the west lane: the green carriage that takes her to Lady Xing's and brings her back
            {"id": "cart", "kind": "prop.greencart", "rect": [2, 26, 2, 1], "label": "A covered carriage"},
            {"id": "sedan", "kind": "prop.sedan", "rect": [10, 24, 1, 1], "label": "The sedan chair she came in"},
            # the outer court, inside the shut main gate
            {"id": "lodge", "kind": "building.house", "rect": [16, 24, 3, 1], "door": "S", "label": "The gatekeepers' lodge"},
            {"id": "sedan-2", "kind": "prop.sedan", "rect": [28, 25, 1, 1]},
        ],
        "spots": [
            # d1: the chair is set down at the festooned gate; the game starts here
            {"id": "d1", "at": [7, 24], "node": K("d1"), "label": "The festooned gate", "trigger": "near"},
            # d6a: Lady Wang shows Daiyu Xifeng's door from the passage, before the screen wall (planted); Granny Liu goes
            # in by the same gate in g5
            {"id": "d6a", "at": [17, 11], "node": K("d6a"), "label": "Sister Feng's gate", "trigger": "near",
             "note": "the screen wall and the half-size gate: d6a, and g5's way in"},
        ],
        "dress": [
            {"kind": "prop.birdcage", "along": "walk-w", "every": 3},
            {"kind": "prop.birdcage", "along": "walk-e", "every": 3},
            {"kind": "plant.peony", "in": "jm-garden", "count": 4},
            {"kind": "plant.flower", "in": "jm-garden-e", "count": 4},
            {"kind": "tree.small", "in": "jm-back", "count": 3},
            {"kind": "prop.lanterns", "at_door": "jm-hall", "pair": True},
            {"kind": "prop.lanterns", "at_door": "rongxi", "pair": True},
            {"kind": "tree.willow", "in": "back-yard", "count": 2},
            {"kind": "furn.jar", "in": "back-yard", "count": 3},
        ],
        "exits": [{"to": "Ning-Rong Street", "at": [25, 0], "side": "N"}],
        "entries": {"": [7, 26], "Lady Xing's Court": [5, 25], "Ning-Rong Street": [25, 1]},
    },
    "states": [
        # Part 1: every gate to the street is shut; afternoon into evening, then night
        {"id": "afternoon", "until": "node:d4", "light": "day", "shut": "_part1"},
        {"id": "evening", "when": "node:d4", "until": "node:d7", "light": "dusk", "shut": "_part1"},
        {"id": "night", "when": "node:d7", "until": "node:d8", "light": "night", "shut": "_part1"},
        # Part 2: one morning; the back gate is the way in and out
        {"id": "morning", "when": "node:d8", "until": "node:g6", "light": "morning", "shut": "_part2"},
        {"id": "dusk", "when": "node:g6", "light": "dusk", "shut": "_part2"},
    ],
    "npcs": [
        # the house at work (Part 1): maids and nurses who keep their eyes down
        {"kind": "folk.maiden", "at": [9, 12], "face": "S", "until": "node:d7",
         "say": "A maid with a feather duster stops, steps aside and lowers her eyes until you have passed."},
        {"kind": "folk.woman", "at": [23, 24], "face": "N", "until": "node:d7",
         "say": "An old serving woman bows low. “Welcome, Miss Lin. The whole house has been waiting for you.”"},
        {"kind": "folk.maiden", "at": [17, 16], "face": "N", "when": "node:d4", "until": "node:d7",
         "say": "A maid hurries down the passage with a covered dish, and not a sound from her feet."},
        # the back yard (Part 2)
        {"kind": "folk.woman", "at": [23, 8], "face": "S", "when": "node:d8",
         "say": "A woman scrubbing a pot looks you up and down. “Looking for Zhou Rui's? Just there, by the gate.”"},
        {"kind": "folk.child", "when": "node:d8",
         "say": "A small boy in a padded jacket stares at Ban'er, and Ban'er stares back."},
        {"kind": "folk.maiden", "at": [17, 14], "face": "W", "when": "node:g3", "until": "node:g6",
         "say": "A little maid with a tray stops dead. “The second mistress is coming down to eat. Hush!”"},
    ],
    "maps": {
        # Grandmother Jia's rooms: d2 (the embrace), d3 (Xifeng sweeps in from the back door), d6 (dinner, tea), d7 (the
        # jade). Her couch at the back; the girls' chairs; the green gauze closet through the east doorway.
        "jm-rooms": _room([20, 10], [10, 9], "Grandmother Jia's rooms", floor="wood",
                          things=[{"id": "couch", "kind": "furn.kang", "rect": [9, 1, 2, 1], "label": "Grandmother Jia's couch"},
                                  {"id": "screen", "kind": "furn.screen", "rect": [12, 1, 2, 1]},
                                  {"id": "back-door", "kind": "furn.curtain", "rect": [16, 1, 1, 1], "label": "The back door"},
                                  {"id": "table", "kind": "furn.table", "rect": [9, 4, 2, 1], "label": "The dinner table"},
                                  {"id": "chair-w1", "kind": "furn.seat", "rect": [7, 4, 1, 1]},
                                  {"id": "chair-e1", "kind": "furn.seat", "rect": [12, 4, 1, 1]},
                                  {"id": "shelf", "kind": "furn.shelf", "rect": [2, 1, 2, 1]},
                                  {"id": "plant", "kind": "furn.plant", "rect": [1, 8, 1, 1]},
                                  {"id": "jar", "kind": "furn.jar", "rect": [18, 8, 1, 1]}],
                          spots=[{"id": "d2", "at": [5, 6], "node": K("d2"), "trigger": "talk", "label": "Grandmother Jia's rooms"},
                                 {"id": "d3", "at": [7, 6], "node": K("d3"), "trigger": "talk", "label": "Grandmother Jia's rooms"},
                                 {"id": "d6", "at": [10, 6], "node": K("d6"), "trigger": "talk", "label": "Grandmother Jia's rooms"},
                                 {"id": "d7", "at": [8, 7], "node": K("d7"), "trigger": "talk", "label": "Grandmother Jia's rooms"}],
                          exits=[{"to": "gauze-closet", "at": [19, 4]}]),
        # the green gauze closet, off her rooms: d8, at night (Yingge 3,0; Xiren walks in from 10,2 to 4,1)
        "gauze-closet": _room([10, 6], [0, 3], "The green gauze closet", floor="wood",
                              things=[{"id": "bed", "kind": "furn.bed", "rect": [6, 1, 2, 1], "label": "The bed"},
                                      {"id": "gauze", "kind": "furn.gauze", "rect": [3, 1, 2, 1], "label": "The green gauze partition"},
                                      {"id": "lamp", "kind": "furn.lamp", "rect": [8, 4, 1, 1]}],
                              spots=[{"id": "d8", "at": [3, 3], "node": K("d8"), "label": "The green gauze closet"}])
        | {"states": [{"id": "night", "light": "night"}]},
        # Rongxi Hall: the hall under its plaque, then Lady Wang's side room east of it (the two cushions, d5's spot) and,
        # behind a lattice, the east-corridor room where she sits on the kang (10 east, 6 north of the spot)
        "wf-rooms": _room([22, 10], [5, 9], "Lady Wang's rooms", floor="stone",
                          lines=[{"id": "lattice", "kind": "wall.lattice", "path": [[11, 1], [11, 6]], "width": 1}],
                          things=[{"id": "plaque", "kind": "furn.plaque", "rect": [4, 1, 3, 1], "label": "A gold plaque: Hall of Glorious Felicity",
                                   "plaque": "荣禧堂"},
                                  {"id": "altar", "kind": "furn.table", "rect": [4, 3, 3, 1], "label": "A long table: a bronze cauldron, a scroll of dragons"},
                                  {"id": "seat-w", "kind": "furn.seat", "rect": [2, 5, 1, 1]},
                                  {"id": "seat-e", "kind": "furn.seat", "rect": [8, 5, 1, 1]},
                                  {"id": "kang-1", "kind": "furn.kang", "rect": [12, 6, 2, 1], "label": "A kang, two brocade cushions laid facing"},
                                  {"id": "cushion-1", "kind": "furn.cushion", "rect": [14, 6, 1, 1]},
                                  {"id": "chair-1", "kind": "furn.seat", "rect": [16, 7, 1, 1], "label": "A chair on the east side"},
                                  {"id": "kang-2", "kind": "furn.kang", "rect": [17, 2, 2, 1], "label": "Lady Wang's kang, a worn black back-rest on the east"},
                                  {"id": "chairs-2", "kind": "furn.seat", "rect": [15, 3, 1, 1], "label": "Three chairs in a row"},
                                  {"id": "shelf", "kind": "furn.shelf", "rect": [19, 1, 2, 1]}],
                          spots=[{"id": "d5", "at": [13, 8], "node": K("d5"), "trigger": "talk", "label": "Lady Wang's rooms"}]),
        # Xifeng's main room (g5): the clock on its pillar, Ping'er by the kang in the east room; her own room to the west
        "xf-eastroom": _room([16, 8], [8, 7], "The east room", floor="wood",
                             things=[{"id": "clock", "kind": "furn.clock", "rect": [7, 2, 1, 1], "label": "A box on a pillar, a weight swinging under it"},
                                     {"id": "kang", "kind": "furn.kang", "rect": [12, 2, 2, 1], "label": "The kang in the east room"},
                                     {"id": "curtain", "kind": "furn.curtain", "rect": [11, 4, 1, 1], "label": "A scarlet felt curtain"},
                                     {"id": "jar", "kind": "furn.jar", "rect": [2, 1, 1, 1]},
                                     {"id": "plant", "kind": "furn.plant", "rect": [14, 6, 1, 1]}],
                             spots=[{"id": "g5", "at": [9, 5], "node": K("g5"), "trigger": "talk", "label": "The east room"}],
                             exits=[{"to": "xf-rooms", "at": [0, 3]}]),
        # Xifeng's own room (g6): she sits on the kang at the hand-warmer (0,-6), Ping'er beside her; Jia Rong comes in by
        # the door from the main room (14,4)
        "xf-rooms": _room([14, 8], [13, 4], "Xifeng's rooms", floor="wood",
                          things=[{"id": "kang", "kind": "furn.kang", "rect": [5, 1, 2, 1], "label": "Xifeng's kang"},
                                  {"id": "warmer", "kind": "furn.handwarmer", "rect": [7, 1, 1, 1], "label": "A brass hand-warmer"},
                                  {"id": "screen", "kind": "furn.screen", "rect": [9, 1, 2, 1], "label": "A painted screen"},
                                  {"id": "chest", "kind": "furn.chest", "rect": [1, 1, 1, 1]},
                                  {"id": "drawers", "kind": "furn.drawers", "rect": [2, 6, 1, 1]}],
                          spots=[{"id": "g6", "at": [6, 5], "node": K("g6"), "trigger": "talk", "label": "Xifeng's rooms"}]),
        # Zhou Rui's house, inside the back gate (g4)
        "zhou-house": _room([10, 6], [5, 5], "Zhou Rui's house", floor="wood",
                            things=[{"id": "kang", "kind": "furn.kang", "rect": [5, 1, 2, 1]},
                                    {"id": "table", "kind": "furn.table", "rect": [2, 2, 1, 1]},
                                    {"id": "jar", "kind": "furn.jar", "rect": [8, 1, 1, 1]}],
                            spots=[{"id": "g4", "at": [4, 3], "node": K("g4"), "trigger": "talk", "label": "Zhou Rui's house"}]),
    },
    "objectives": {
        K("d1"): "Get down from the sedan chair at the festooned gate.",
        K("d2"): "Go through the festooned gate and the covered walks, into Grandmother Jia's rooms.",
        K("d4"): "Go back into Grandmother Jia's rooms.",
        K("d5"): "Go east through the cross-hall and the ceremonial gate to Rongxi Hall, where Lady Wang waits.",
        K("d6a"): "Go with Lady Wang by the back way: out by the corner gate of the great court, into the passage.",
        K("d6"): "Go through the cross-hall off the passage, to Grandmother Jia's rooms for dinner.",
        K("d7"): "Stay in Grandmother Jia's rooms.",
        K("d8"): "Go to bed in the green gauze closet, through the east doorway of Grandmother Jia's rooms.",
        K("g4"): "The back gate is open. Zhou Rui's house is just inside it.",
        K("g5"): "Follow Zhou Rui's wife down the passage, round the screen wall and through Sister Feng's gate.",
        K("g6"): "Go through to Sister Feng's own room.",
    },
}


# Part 1 shuts every gate to the street; Part 2 only the side and main gates (states are filled in below)
_SHUT1 = {"west-side-gate": ["The side gate is barred. The bearers have gone, and you came here to stay."],
          "main-gate": ["The great gate is shut. It opens only for the master's business, not for a girl's."],
          "back-gate": ["That is the back gate, for servants and tradesmen. Not one step further than you must."]}
_SHUT2 = {"west-side-gate": ["The side gate is barred from inside. The men on the bench have the key, and they won't use it for you."],
          "main-gate": ["The great gate is shut, as it always is."]}
for _st in RONG["states"]:
    _st["shut"] = _SHUT1 if _st["shut"] == "_part1" else _SHUT2

# Road challengers: Grandmother Jia's court (d1-d3) and the great court's covered walk (d5-d6), none blocking
RONG["challengers"] = [
    _ch("steps-maid", "folk.maiden", [10, 10], "node:d1", "node:d3",
        "So you're the new cousin from Yangzhou. They say the south plays a careful game. Show me.",
        "Careful, and quick too. I'll tell the others.", "The old lady's waiting, miss."),
    _ch("walk-nurse", "folk.woman", [29, 16], "node:d4", "node:d6a",
        "I play a game here while the mistresses talk. Sit a moment, miss. Nobody will see.",
        "Your mother played like that. She never let a stone go to waste.", "Go on, miss. Don't keep them waiting."),
]


# =========================================================================================================== Lady Xing's
# Lady Xing's Court: a black-lacquered gate on the street (shut: the carriage brought her in), three inner gates, small
# pretty courts with trees and rocks everywhere (cut off from the garden), the main rooms with their wings.
XING = {
    "archetype": "compound",
    "plan": {
        "grid": [16, 20], "cell": 2, "margin": 0,
        "ground": [
            {"id": "outer", "kind": "court", "rect": [1, 16, 14, 3]},
            {"id": "middle", "kind": "court", "rect": [1, 12, 14, 3]},
            {"id": "inner", "kind": "court", "rect": [1, 1, 14, 10]},
            {"id": "garden-w", "kind": "garden", "rect": [1, 6, 3, 4]},
            {"id": "garden-e", "kind": "garden", "rect": [12, 6, 3, 4]},
        ],
        "lines": [
            {"id": "outer-wall", "kind": "wall", "outline": [0, 0, 16, 20], "width": 1, "gates": {"black-gate": [8, 19]},
             "gate_kinds": {"black-gate": "building.blackgate"}, "gate_labels": {"black-gate": "The black-lacquered gate"}},
            {"id": "gate-2", "kind": "wall", "path": [[0, 15], [15, 15]], "width": 1, "gates": {"second-gate": [8, 15]}},
            {"id": "gate-3", "kind": "wall", "path": [[0, 11], [15, 11]], "width": 1, "gates": {"third-gate": [8, 11]}},
        ],
        "things": [
            {"id": "xing-main", "kind": "building.hall", "rect": [6, 1, 4, 2], "door": "S", "label": "Lady Xing's rooms", "map": "xing-hall"},
            {"id": "wing-w", "kind": "building.wing", "rect": [1, 1, 3, 2], "door": "E"},
            {"id": "wing-e", "kind": "building.wing", "rect": [12, 1, 3, 2], "door": "W"},
            {"id": "rocks-w", "kind": "garden.rockery", "rect": [2, 7, 1, 1]},
            {"id": "rocks-e", "kind": "garden.rockery", "rect": [13, 7, 1, 1]},
            {"id": "cart", "kind": "prop.greencart", "rect": [3, 17, 2, 1], "label": "The covered carriage, waiting"},
        ],
        "dress": [{"kind": "tree.peach", "in": "garden-w", "count": 2}, {"kind": "tree.bamboo", "in": "garden-e", "count": 3},
                  {"kind": "tree.small", "in": "middle", "count": 2}, {"kind": "prop.lanterns", "at_door": "xing-main", "pair": True}],
        "exits": [{"to": "Ning-Rong Street", "at": [8, 19], "side": "S"}],
        "entries": {"": [8, 17], "The Rong Mansion": [8, 17]},
    },
    "states": [{"id": "afternoon", "light": "day",
                "shut": {"black-gate": ["The carriage waits at the gate. Your grandmother's order was to call on both uncles."]}}],
    "npcs": [
        {"kind": "folk.woman", "at": [8, 13], "face": "S", "say": "A serving woman bows you through the next gate. “The mistress is inside, miss.”"},
        {"kind": "folk.maiden", "at": [5, 9], "face": "E", "say": "Maids in bright clothes peep at you from the rockery, and giggle, and are hushed."},
    ],
    "maps": {
        # d4: Lady Xing on her seat (4,-4); the servant back from the study (10,2)
        "xing-hall": _room([12, 8], [6, 7], "Lady Xing's hall", floor="wood",
                           things=[{"id": "kang", "kind": "furn.kang", "rect": [5, 1, 2, 1], "label": "Lady Xing's kang"},
                                   {"id": "screen", "kind": "furn.screen", "rect": [8, 1, 2, 1]},
                                   {"id": "table", "kind": "furn.table", "rect": [2, 3, 1, 1]},
                                   {"id": "jar", "kind": "furn.jar", "rect": [10, 6, 1, 1]}],
                           spots=[{"id": "d4", "at": [4, 5], "node": K("d4"), "trigger": "talk", "label": "Lady Xing's hall"}]),
    },
    "objectives": {K("d4"): "Go through the three inner gates to Lady Xing's rooms."},
}


# =========================================================================================================== the village
# The Village: outside the city walls, a few farm households; Gou'er's house among them (g1, at dusk). The road east
# goes into the city, shut until the plan is made.
VILLAGE = {
    "archetype": "village",
    "plan": {
        "grid": [16, 11], "cell": 4, "margin": 1,
        "ground": [
            {"id": "fields-n", "kind": "field.wheat", "rect": [1, 0, 14, 3]},
            {"id": "yard", "kind": "plain", "rect": [3, 4, 10, 4]},
            {"id": "fields-s", "kind": "field", "rect": [1, 8, 14, 3]},
        ],
        "lines": [
            {"id": "road", "kind": "road", "path": [[0, 6], [15, 6]], "width": 3},
            {"id": "track", "kind": "path", "path": [[7, 6], [7, 4]], "width": 2},
        ],
        "things": [
            {"id": "gouer", "kind": "building.lodge", "rect": [6, 3, 2, 1], "door": "S", "label": "Gou'er's house", "map": "gouer-house"},
            {"id": "farm-1", "kind": "building.hut", "rect": [3, 3, 2, 1], "door": "S"},
            {"id": "farm-2", "kind": "building.hut", "rect": [10, 3, 2, 1], "door": "S"},
            {"id": "hay", "kind": "camp.hay", "rect": [9, 7, 1, 1]},
        ],
        "spots": [{"id": "gouer-house", "at": [7, 4], "at_door": "gouer", "label": "Gou'er's house",
                   "note": "d8 hands Granny Liu on to here (a cut, not a meeting)"}],
        "dress": [{"kind": "tree.willow", "along": "road", "every": 5}, {"kind": "tree.dead", "in": "fields-s", "count": 3}],
        "exits": [{"to": "Ning-Rong Street", "at": [15, 6], "side": "E"}],
        "entries": {"": [7, 5], "Ning-Rong Street": [14, 6]},
    },
    "states": [{"id": "dusk", "light": "dusk", "exits_closed": ["Ning-Rong Street"],
                "exits_closed_say": {"Ning-Rong Street": ["The city is a long walk, and the house has nothing put by for winter. Go home first."]}}],
    "npcs": [
        {"kind": "folk.villager", "at": [11, 7], "face": "W", "say": "A neighbour with a hoe. “Cold early this year. Your Gou'er's been at the wine again, granny.”"},
        {"kind": "folk.child", "say": "A child chases a hen across the yard."},
    ],
    "maps": {
        # g1: Gou'er (4,-2) and Liu-shi (8,0) in the house; the kang Granny talks from
        "gouer-house": _room([10, 6], [5, 5], "Gou'er's house", floor="earth",
                             things=[{"id": "kang", "kind": "furn.kang", "rect": [1, 1, 2, 1], "label": "The kang"},
                                     {"id": "hearth", "kind": "furn.hearth", "rect": [7, 1, 1, 1]},
                                     {"id": "sacks", "kind": "furn.sacks", "rect": [8, 3, 1, 1], "label": "Empty sacks"}],
                             spots=[{"id": "g1", "at": [3, 3], "node": K("g1"), "label": "Gou'er's house"}]),
    },
    "objectives": {K("g1"): "Go into Gou'er's house."},
}


# =========================================================================================================== the street
# Ning-Rong Street, cells of 4 tiles. The front street runs west-east south of both mansions (y 11): from the west the
# road in from the village, the Rong mansion's west side gate (the bench) and main gate (the lions, the sedan chairs),
# Lady Xing's black gate, and the Ning mansion's gate. A lane round the Rong mansion's west end (x 2) joins the back
# street (y 1), where the hawkers set down their loads outside the back gate.
_MANSION_ROOFS = [{"id": f"roof-{i}", "kind": k, "rect": r} for i, (k, r) in enumerate([
    ("building.hall_grand", [6, 4, 3, 2]), ("building.hall_grand", [11, 4, 3, 2]), ("building.hall", [15, 4, 2, 2]),
    ("building.hall", [6, 7, 2, 1]), ("building.hall", [15, 7, 2, 1]), ("building.hall_grand", [24, 4, 3, 2]),
    ("building.hall", [20, 5, 2, 1])])]
STREET = {
    "archetype": "city",
    "plan": {
        "grid": [30, 16], "cell": 4, "margin": 1,
        "ground": [
            {"id": "back-street", "kind": "city", "rect": [1, 0, 19, 2]},
            {"id": "west-lane", "kind": "city", "rect": [1, 2, 3, 9]},
            {"id": "front", "kind": "city", "rect": [0, 10, 30, 3]},
            {"id": "houses-s", "kind": "city", "rect": [0, 13, 30, 3]},
            {"id": "rong-inside", "kind": "court", "rect": [5, 3, 13, 6]},      # behind the walls: roofs seen over them
            {"id": "xing-inside", "kind": "court", "rect": [20, 4, 2, 5]},
            {"id": "ning-inside", "kind": "court", "rect": [24, 3, 5, 6]},
        ],
        "lines": [
            {"id": "rong-wall", "kind": "wall", "outline": [4, 2, 15, 8], "width": 1,
             "gates": {"rong-back-gate": [11, 2], "rong-side-gate": [7, 9], "rong-main-gate": [12, 9]},
             "gate_labels": {"rong-back-gate": "The Rong mansion's back gate", "rong-side-gate": "The Rong mansion's west side gate",
                             "rong-main-gate": "The Rong mansion's great gate"}},
            {"id": "xing-wall", "kind": "wall", "outline": [19, 3, 4, 7], "width": 1, "gates": {"xing-gate": [20, 9]},
             "gate_kinds": {"xing-gate": "building.blackgate"}, "gate_labels": {"xing-gate": "A black-lacquered gate"}},
            {"id": "ning-wall", "kind": "wall", "outline": [23, 2, 7, 8], "width": 1, "gates": {"ning-gate": [26, 9]},
             "gate_labels": {"ning-gate": "The Ning mansion's great gate"}},
            {"id": "front-street", "kind": "road", "path": [[0, 12], [29, 12]], "width": 4},
            {"id": "lane", "kind": "road", "path": [[2, 12], [2, 1], [18, 1]], "width": 3},
        ],
        "things": [
            *_MANSION_ROOFS,
            {"id": "lion-w", "kind": "landmark.stonelion", "rect": [10, 10, 1, 1], "label": "A stone lion"},
            {"id": "lion-e", "kind": "landmark.stonelion", "rect": [14, 10, 1, 1], "label": "A stone lion"},
            {"id": "ning-lion-w", "kind": "landmark.stonelion", "rect": [24, 10, 1, 1], "label": "A stone lion"},
            {"id": "ning-lion-e", "kind": "landmark.stonelion", "rect": [28, 10, 1, 1], "label": "A stone lion"},
            {"id": "bench", "kind": "prop.bench", "rect": [5, 10, 2, 1], "label": "A long bench of men by the side gate"},
            {"id": "sedan-1", "kind": "prop.sedan", "rect": [15, 10, 1, 1], "label": "Sedan chairs crowd the great gate"},
            {"id": "sedan-2", "kind": "prop.sedan", "rect": [16, 10, 1, 1]},
            {"id": "sedan-3", "kind": "prop.sedan", "rect": [9, 10, 1, 1]},
            {"id": "toys", "kind": "prop.toyload", "rect": [8, 0, 1, 1], "label": "A hawker's load of toys"},
            {"id": "food", "kind": "prop.toyload", "rect": [14, 0, 1, 1], "label": "A hawker's load of sweets"},
            # houses across the street
            *[{"id": f"house-{i}", "kind": "building.house", "rect": [x, 13, 2, 2], "door": "N"} for i, x in enumerate((1, 5, 9, 18, 22, 26))],
            {"id": "shop", "kind": "building.shop", "rect": [13, 13, 3, 2], "door": "N", "label": "A teahouse"},
        ],
        "spots": [
            {"id": "g2", "at": [7, 10], "node": K("g2"), "label": "The side gate", "trigger": "near"},
            {"id": "g3", "at": [11, 1], "node": K("g3"), "label": "The back gate", "trigger": "near"},
            {"id": "g7", "at": [10, 1], "node": K("g7"), "label": "The back gate", "trigger": "near"},
            {"id": "wall-corner", "at": [3, 10], "label": "The corner of the wall", "note": "g2: where the gatemen tell her to wait"},
        ],
        "dress": [{"kind": "tree.willow", "along": "front-street", "every": 5}, {"kind": "lamp.post", "at_door": "shop", "pair": True},
                  {"kind": "tree.small", "in": "houses-s", "count": 3}],
        "exits": [{"to": "The Village", "at": [0, 12], "side": "W"},
                  {"to": "The Rong Mansion", "at": [11, 2], "side": "S"},
                  {"to": "Lady Xing's Court", "at": [20, 9], "side": "N"}],
        "entries": {"": [1, 12], "The Village": [1, 12], "The Rong Mansion": [11, 1]},
    },
    "states": [
        {"id": "morning", "when": "node:g1", "until": "node:g3", "light": "morning",
         "shut": {"rong-back-gate": ["The back gate is shut. Children are playing in front of it, and nobody answers your knock."],
                  "rong-side-gate": ["“Wait by the corner of the wall, granny.” The men on the bench don't even look up."],
                  "rong-main-gate": ["Sedan chairs and horses crowd the great gate. You don't dare go near it."],
                  "xing-gate": ["A black-lacquered gate, shut. Not the one Gou'er told you about."],
                  "ning-gate": ["The Ning mansion's gate. That isn't where Zhou Rui's wife lives."]}},
        {"id": "day", "when": "node:g3", "until": "node:g6", "light": "morning",
         "shut": {"rong-side-gate": ["The men on the bench are laughing at someone else now."],
                  "rong-main-gate": ["Sedan chairs and horses crowd the great gate. You don't dare go near it."],
                  "xing-gate": ["A black-lacquered gate, shut."], "ning-gate": ["The Ning mansion's gate, shut."]}},
        {"id": "dusk", "when": "node:g6", "light": "dusk",
         "shut": {"rong-side-gate": ["The side gate is shut for the night."], "rong-main-gate": ["The great gate is shut."],
                  "xing-gate": ["A black-lacquered gate, shut."], "ning-gate": ["The Ning mansion's gate, shut."]}},
    ],
    "npcs": [
        # the bench (g2 stages the gate servant and the old man; these sit with them)
        {"kind": "folk.official", "at": [6, 11], "face": "N", "until": "node:g2",
         "say": "A man on the bench with his chest out and his belly forward. “Where are you from, granny? Ha!”"},
        {"kind": "folk.official", "at": [4, 10], "face": "E", "until": "node:g2",
         "say": "“Go on, wait by the wall. Somebody'll be out.” He laughs, and the others laugh with him."},
        {"kind": "folk.villager", "at": [19, 11], "face": "W", "say": "A water-carrier sets down his buckets. “The Rong mansion? That's the one with the lions, granny. Don't go near the front.”"},
        {"kind": "folk.woman", "at": [3, 6], "face": "E", "say": "A woman with a basket of washing. “The back street? Keep on round the corner.”"},
        {"kind": "folk.child", "when": "node:g2", "until": "node:g3",
         "say": "Children race past shrieking, a paper windmill held high."},
        {"kind": "folk.elder", "at": [17, 1], "face": "W", "say": "An old peddler with a tray of sugar figures. “Buy one for the boy, granny? No? Then mind your feet.”"},
    ],
    "objectives": {
        K("g2"): "Go along the street to the Rong mansion. Don't go near the great gate: try the side gate.",
        K("g3"): "Go round by the lane at the west end, to the back street and the back gate.",
        K("g7"): "Go out by the back gate.",
    },
}
STREET["challengers"] = [
    _ch("lion-groom", "folk.villager", [17, 10], "node:g1", "node:g2",
        "Hey, granny, this gate's for sedan chairs. Beat me at a game and I'll tell you which door's for you.",
        "Not bad for a country granny! The side gate, to the west. Mind the men on the bench.", "West, granny. The side gate."),
    _ch("toy-hawker", "folk.villager", [7, 1], "node:g2", "node:g3",
        "A toy for the little one? Win a game and he can have one for nothing.",
        "A deal's a deal. Here, little one.", "The back gate's just there."),
    _ch("back-child", "folk.child", [15, 1], "node:g2", "node:g3",
        "Granny! Granny! Play me! I always win!", "You cheated! No you didn't. Again tomorrow!", "Which Zhou Da-niang do you want?"),
]

RONG["npcs"] += cues({"d2", "d3", "d5", "d6", "d7", "g4", "g5", "g6"})
XING["npcs"] += cues({"d4"})
STREET["npcs"] += cues({"g2", "g3"})

PLANS_HLM1 = {
    "The Rong Mansion": RONG,
    "Lady Xing's Court": XING,
    "The Village": VILLAGE,
    "Ning-Rong Street": STREET,
}

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}

# The Chinese for every place name, label, objective and line above (Plot checks them): the novel's vernacular, in
# simplified characters. build_tk.py needs a line's Chinese; the game shows a label's and an objective's.
ZH_PLACES_HLM1 = {
    # places and rooms
    # (the place and room names are Plot's PLACE_NAMES and ROOM_NAMES, story.py 216a5cf)
    "The Rong Mansion": "荣国府", "Lady Xing's Court": "邢夫人院", "The Village": "城外村庄", "Ning-Rong Street": "宁荣街",
    "Grandmother Jia's rooms": "贾母正房", "The green gauze closet": "碧纱橱", "Lady Wang's rooms": "王夫人房",
    "Zhou Rui's house": "周瑞家", "The east room": "东边屋内", "Xifeng's rooms": "凤姐屋里", "Lady Xing's hall": "邢夫人正室",
    "Gou'er's house": "狗儿家",
    "Rongxi Hall": "荣禧堂", "Sister Feng's rooms": "凤姐儿的屋子", "Lady Xing's rooms": "邢夫人正房",
    # the house
    "A marble screen in a red sandalwood frame": "紫檀架子大理石的大插屏", "A whitewashed screen wall": "粉油大影壁",
    "The inverted hall": "倒厅", "A go board in the covered walk": "游廊下一张棋桌", "A covered carriage": "翠幄青绸车",
    "The sedan chair she came in": "她坐来的轿子", "The gatekeepers' lodge": "门房", "The festooned gate": "垂花门",
    "Sister Feng's gate": "凤姐儿的院门", "The ceremonial gate": "仪门", "A cross-hall to Grandmother Jia's court": "通往贾母院的穿堂",
    "The cross-hall": "东西穿堂", "A side gate to the back yard": "通后院的角门", "A corner gate": "角门",
    "Grandmother Jia's couch": "贾母的榻", "The back door": "后房门", "The dinner table": "饭桌", "The bed": "床",
    "The green gauze partition": "碧纱橱", "A gold plaque: Hall of Glorious Felicity": "赤金九龙青地大匾：荣禧堂",
    "A long table: a bronze cauldron, a scroll of dragons": "大紫檀雕螭案，设着青绿古铜鼎，悬着待漏随朝墨龙大画",
    "A kang, two brocade cushions laid facing": "临窗大炕，炕沿上两个锦褥对设", "A chair on the east side": "东边一张椅子",
    "Lady Wang's kang, a worn black back-rest on the east": "王夫人的炕，靠东壁设着半旧的青缎靠背",
    "Three chairs in a row": "挨炕一溜三张椅子", "A box on a pillar, a weight swinging under it": "柱子上挂着一个匣子，底下坠着一个秤砣般的东西",
    "The kang in the east room": "东边屋里的炕", "A scarlet felt curtain": "猩红毡帘", "Xifeng's kang": "凤姐儿的炕",
    "A brass hand-warmer": "小铜手炉", "A painted screen": "一架画屏",
    "The side gate is barred. The bearers have gone, and you came here to stay.": "角门关着。轿夫早去了，你是来这里住下的。",
    "The great gate is shut. It opens only for the master's business, not for a girl's.": "正门关着。那是老爷们办大事开的，不为一个姑娘开。",
    "That is the back gate, for servants and tradesmen. Not one step further than you must.": "那是后门，下人和做买卖的走的。多一步路也不肯走。",
    "The side gate is barred from inside. The men on the bench have the key, and they won't use it for you.": "角门从里头闩着。钥匙在板凳上那些人手里，他们不肯为你开。",
    "The great gate is shut, as it always is.": "正门照旧关着。",
    "A maid with a feather duster stops, steps aside and lowers her eyes until you have passed.": "一个拿掸子的丫头站住，让在一边，垂着眼，等你过去。",
    "An old serving woman bows low. “Welcome, Miss Lin. The whole house has been waiting for you.”": "一个老婆子深深一福。“林姑娘来了。一家子都等着呢。”",
    "A maid hurries down the passage with a covered dish, and not a sound from her feet.": "一个丫头捧着盖碗从夹道里快步走过，脚下一点声儿也没有。",
    "A woman scrubbing a pot looks you up and down. “Looking for Zhou Rui's? Just there, by the gate.”": "一个刷锅的媳妇上下打量你。“找周瑞家的？就在门边上。”",
    "A small boy in a padded jacket stares at Ban'er, and Ban'er stares back.": "一个穿棉袄的小小子盯着板儿看，板儿也盯着他看。",
    "A little maid with a tray stops dead. “The second mistress is coming down to eat. Hush!”": "一个端盘子的小丫头站住了。“奶奶下来吃饭了。别出声！”",
    "“…Well! I'll tell the others the southern cousin is no fool.”": "“……哟！我可要告诉她们，南边来的姑娘不是好惹的。”",
    "An old nurse at a go board in the covered walk looks up. “Miss Lin? Sit a moment, miss. Lady Wang's maids are still laying out the tea.”": "游廊下一个老嬷嬷守着棋盘，抬起头来。“林姑娘？坐一坐罢。二太太那边丫头们还在摆茶呢。”",
    "The old nurse is setting out the stones again, for herself.": "老嬷嬷又自己摆起棋子来了。",
    "Get down from the sedan chair at the festooned gate.": "在垂花门前下轿。",
    "Go through the festooned gate and the covered walks, into Grandmother Jia's rooms.": "进垂花门，走抄手游廊，到贾母房中去。",
    "Go back into Grandmother Jia's rooms.": "回贾母房中去。",
    "Go east through the cross-hall and the ceremonial gate to Rongxi Hall, where Lady Wang waits.": "往东穿过穿堂，进仪门，到荣禧堂去，王夫人在那里等着。",
    "Go with Lady Wang by the back way: out by the corner gate of the great court, into the passage.": "跟着王夫人从后头走：出了大院的角门，到夹道里去。",
    "Go through the cross-hall off the passage, to Grandmother Jia's rooms for dinner.": "从夹道穿过穿堂，到贾母房中吃晚饭。",
    "Stay in Grandmother Jia's rooms.": "留在贾母房中。",
    "Go to bed in the green gauze closet, through the east doorway of Grandmother Jia's rooms.": "从贾母房中东边的门进去，到碧纱橱里安歇。",
    "The back gate is open. Zhou Rui's house is just inside it.": "后门开着。周瑞家就在门里。",
    "Follow Zhou Rui's wife down the passage, round the screen wall and through Sister Feng's gate.": "跟着周瑞家的走夹道，转过影壁，进凤姐儿的院门。",
    "Go through to Sister Feng's own room.": "到凤姐儿自己屋里去。",
    # Lady Xing's
    "The covered carriage, waiting": "等着的翠幄青绸车", "The black-lacquered gate": "黑油大门", "Lady Xing's kang": "邢夫人的炕",
    "The carriage waits at the gate. Your grandmother's order was to call on both uncles.": "车在门外等着。外祖母吩咐的，两个母舅都要拜见。",
    "A serving woman bows you through the next gate. “The mistress is inside, miss.”": "一个媳妇引你进了下一道门。“太太在里头呢，姑娘。”",
    "Maids in bright clothes peep at you from the rockery, and giggle, and are hushed.": "几个妆饰艳丽的丫头从山石后头偷看你，嘻嘻一笑，又被人喝住了。",
    "Go through the three inner gates to Lady Xing's rooms.": "进了三层仪门，到邢夫人正房去。",
    # the village
    "The kang": "炕", "Empty sacks": "空口袋",
    "The city is a long walk, and the house has nothing put by for winter. Go home first.": "进城路远，家里冬事未办。先回家去。",
    "A neighbour with a hoe. “Cold early this year. Your Gou'er's been at the wine again, granny.”": "扛锄头的邻居。“今年冷得早。姥姥，你家狗儿又喝上了。”",
    "A child chases a hen across the yard.": "一个孩子满院子撵鸡。",
    "Go into Gou'er's house.": "进狗儿家去。",
    # the street
    "A stone lion": "石狮子", "A long bench of men by the side gate": "角门前一条大板凳，坐着几个人",
    "Sedan chairs crowd the great gate": "大门前簇簇轿马", "A hawker's load of toys": "卖顽耍物件的担子",
    "A hawker's load of sweets": "卖吃的担子", "A teahouse": "茶馆", "The side gate": "角门", "The back gate": "后门",
    "The corner of the wall": "墙角", "The Rong mansion's back gate": "荣府后门", "The Rong mansion's west side gate": "荣府西角门",
    "The Rong mansion's great gate": "荣府大门", "A black-lacquered gate": "黑油大门", "The Ning mansion's great gate": "宁府大门",
    "The back gate is shut. Children are playing in front of it, and nobody answers your knock.": "后门关着。门前一群孩子在玩，敲了门也没人应。",
    "“Wait by the corner of the wall, granny.” The men on the bench don't even look up.": "“远远的在那墙角下等着罢。”板凳上的人头也不抬。",
    "Sedan chairs and horses crowd the great gate. You don't dare go near it.": "大门前簇簇轿马，你不敢过去。",
    "A black-lacquered gate, shut. Not the one Gou'er told you about.": "一座黑油大门，关着。不是狗儿说的那个门。",
    "The Ning mansion's gate. That isn't where Zhou Rui's wife lives.": "这是宁府的大门。周瑞家的不住这边。",
    "The men on the bench are laughing at someone else now.": "板凳上那些人又在取笑别人了。",
    "A black-lacquered gate, shut.": "一座黑油大门，关着。", "The Ning mansion's gate, shut.": "宁府的大门，关着。",
    "The side gate is shut for the night.": "角门已经关了。", "The great gate is shut.": "大门关着。",
    "A man on the bench with his chest out and his belly forward. “Where are you from, granny? Ha!”": "板凳上一个挺胸叠肚的人。“姥姥打那里来的？哈！”",
    "“Go on, wait by the wall. Somebody'll be out.” He laughs, and the others laugh with him.": "“去，墙根底下等着，一会子就有人出来。”他一笑，大家都跟着笑。",
    "A water-carrier sets down his buckets. “The Rong mansion? That's the one with the lions, granny. Don't go near the front.”": "挑水的放下担子。“荣府？就是门口有石狮子的那家。姥姥，可别往大门上去。”",
    "A woman with a basket of washing. “The back street? Keep on round the corner.”": "挎着一篮衣裳的妇人。“后街？顺着墙角绕过去就是。”",
    "Children race past shrieking, a paper windmill held high.": "孩子们举着纸风车，尖叫着跑过去。",
    "An old peddler with a tray of sugar figures. “Buy one for the boy, granny? No? Then mind your feet.”": "端着糖人盘子的老货郎。“给哥儿买一个？不买？那就看着脚底下。”",
    "“…Ha! Not the front, granny. Try the side gate, where they sit on the bench.”": "“……哈！姥姥，别走大门。去角门，就是板凳上坐着人的那个。”",
    "A hawker with a load of toys blocks the street with his pole. “A clay tiger for the boy? No money? Play me for it, then.”": "卖顽耍物件的拿扁担把街一横。“给哥儿买个泥老虎？没钱？那就跟我下一盘赌它。”",
    "The hawker is calling his wares to the children.": "货郎对着孩子们吆喝他的货。",
    "“…She can! Hey, everybody, the country granny beat me!”": "“……她会！大伙儿快来，乡下姥姥赢了我了！”",
    "Go along the street to the Rong mansion. Don't go near the great gate: try the side gate.": "顺着街走到荣府。别往大门上去，去角门试试。",
    "Go round by the lane at the west end, to the back street and the back gate.": "从西头的巷子绕过去，到后街后门上。",
    "Go out by the back gate.": "从后门出去。",
}
