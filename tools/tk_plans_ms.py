"""Misaeng (미생), Season 1, as plan grids (docs/book2/plan-grid.md). English only (the user: "we dont need chinese lines
for this").

Design: docs/book2/misaeng-arc.md (Plot alt2); the story is tools/tk_story_w21.py (WORLD21). Beat keys are its keys,
m1 ... m24 and m3b, m4b, m5b, m19b, m23b, written here as "21-m1" ... (world 21; the prefix is the world, so nothing is
renamed). Research: docs/book2/misaeng-research.md. The engine's keys: docs/book2/misaeng-engine.md (Integration alt2).

    python3 tools/check_plans_w2.py --arc ms [--png]       # check (and draw into docs/book2/plans-ms/)
    python3 -m tools.mapfactory all --world 21 --plans ms --kit xianxia --kit jade --kit genshin

Modern Seoul in 2012, so every building and most furniture are new kinds (NEW_KINDS, each with a stand-in in
vocab.FALLBACK and a brief in ART for Graphics). The places, and how they join:

    Susaek-dong (Jang's home; the relatives' flat at Chuseok)
      └─ Susaek Station's stairs ── The subway (one carriage: the commuter with the pocket board) ── Jongno's stairs
    Jongno (the street: Tapgol Park, the One International tower, the corner shop, the market, Pimatgol's pojangmacha)
      ├─ the tower's door ── One International (the lobby: front desk, ID gates, bins; a lift to each floor:
      │                      the PT room, HR, finance, Sales Team 3, the audit room, the board room, the executive, the roof)
      ├─ W ── the Korea Baduk Association (the front office; the trainees' room)
      ├─ W ── Baekjin Trading (a lane of small offices; the coached clerk at its door)
      ├─ E ── Sun's neighbourhood (the daycare; Sun's flat)
      ├─ E ── the pizza shop (Kim Dong-su's, beside a big mart)
      └─ E ── the new office (m24)
    Amman (one street; reached only by the epilogue's handoff)

Rules this book adds to the factory's:
  - a door into another place: a thing with "to": <place> (the subway's stairs, the tower's doors). Its door is an exit
    to that place's map, and coming back you arrive on its doorstep.
  - a street's carriageway is "asphalt" ground, which no one walks: it's crossed only at a crosswalk (a line), and
    parked and passing cars stand in it as things.
  - entered buildings face S, E or W. A north door would get the factory's gatehouse (the old books' rule for a door
    the camera can't see), which a Seoul street doesn't have.
  - a lift (Integration alt2's "use": "lift"): one in the lobby and one on every floor, each with the whole menu. The
    floors hang off the lobby ("owns"), and each floor's own door is the stairs down to it.
"""
from tk_plans_w2 import ART as ART2, LINE_KINDS as LINE_KINDS2, NEW_KINDS as NEW_KINDS2, ZONE_KINDS as ZONE_KINDS2, _ch, room

W = "21"   # the world; beat keys are written f"{W}-m1"


def k(n):
    return f"{W}-m{n}"


KEYS_MS = {f"m{i}" for i in range(1, 25)} | {"m3b", "m4b", "m5b", "m19b", "m23b"}

# Kinds this book adds: footprint in tiles (w, h, solid)
NEW_KINDS = {**NEW_KINDS2,
             # outdoors: Seoul (and one street in Amman)
             "building.office_tower": (12, 5, True),   # One International's glass tower in Jongno
             "building.office_block": (6, 3, True),    # a small 4-5 storey office building (Baekjin, the KBA, the new office)
             "building.villa": (5, 3, True),           # a red-brick multi-family villa (빌라), Susaek-dong
             "building.apartment": (8, 4, True),       # a slab of flats (아파트)
             "building.storefront": (4, 2, True),      # a shop at street level: signboard, glass front, flats above
             "building.mart": (8, 3, True),            # a big supermarket (대형마트)
             "building.pojangmacha": (3, 2, True),     # an orange-tarp street tent bar
             "building.subway_entrance": (3, 2, True), # a subway entrance: stairs down under a glass canopy
             "building.stone_house": (5, 3, True),     # Amman: a pale limestone house, flat roof
             "building.stone_shop": (4, 2, True),      # Amman: a café in a limestone front
             "building.rooftop_box": (3, 2, True),     # a roof's stairhouse and lift motor room
             "landmark.pagoda": (3, 3, True),          # Tapgol Park's ten-storey stone pagoda in its glass case
             "prop.car": (4, 2, True),                 # a car in the carriageway
             "prop.water_tank": (2, 2, True),          # a water tank on a roof
             "prop.bus_stop": (3, 1, True),
             "prop.vending": (1, 1, True),             # a drinks vending machine
             "prop.bench": (2, 1, True),
             "prop.scooter": (1, 1, True),             # a delivery scooter with a box on the back
             "tree.ginkgo": (1, 1, True),              # Seoul's street tree
             "tree.olive": (1, 1, True),
             # indoors: the office
             "furn.office_desk": (2, 1, True),         # a desk with a monitor, a chair at it
             "furn.exec_desk": (3, 1, True),           # a big dark desk: a department head's, the executive's
             "furn.meeting_table": (4, 2, True),
             "furn.reception": (4, 1, True),           # the lobby's front desk
             "furn.chair": (1, 1, False),              # an office chair: walked past, not into
             "furn.copier": (2, 1, True),
             "furn.water_cooler": (1, 1, True),
             "furn.whiteboard": (2, 1, True),
             "furn.projector_screen": (3, 1, True),
             "furn.lectern": (1, 1, True),
             "furn.bin": (1, 1, True),                 # recycling bins (the waybill, m3)
             "furn.sofa": (2, 1, True),
             "furn.filing": (1, 1, True),              # a grey filing cabinet
             "furn.lift_door": (2, 1, True),           # a lift's steel doors and the floor number above them
             "furn.boxes": (1, 1, True),               # archive boxes, packed (the audit packing up)
             "furn.phone": (1, 1, True),               # a desk phone on a side table
             "furn.noticeboard": (2, 1, True),
             "furn.ashtray": (1, 1, True),             # a standing ashtray (the smokers' corner)
             # indoors: shops, homes, the KBA
             "furn.go_board": (1, 1, True),            # a go board on the floor between two cushions
             "furn.trophy_case": (2, 1, True),
             "furn.store_shelf": (2, 1, True),
             "furn.fridge_case": (2, 1, True),         # a glass-door drinks fridge
             "furn.plastic_table": (1, 1, True),       # a round plastic table (the pojangmacha)
             "furn.pizza_oven": (2, 1, True),
             "furn.low_table": (2, 1, True),           # a low table you sit at on the floor (상)
             "furn.wardrobe": (2, 1, True),
             "furn.tv": (2, 1, True),
             "furn.toy_shelf": (2, 1, True),
             "furn.kid_mat": (2, 1, False),            # a padded play mat
             "furn.subway_seat": (4, 1, True),         # a subway carriage's long bench seat
             # the board room's drinks (m17), each shown on the table once set down
             "prop.glass_water": (1, 1, False),
             "prop.teacup": (1, 1, False),
             "prop.coffee_cup": (1, 1, False),
             }
LINE_KINDS = {**LINE_KINDS2,
              "crosswalk": (True, False),   # zebra stripes across the carriageway
              "barrier": (False, False),    # the lobby's ID gates: glass flaps, seen through
              "parapet": (False, False)}    # a roof's low wall: seen over
ZONE_KINDS = {**ZONE_KINDS2, "asphalt": False}   # a carriageway: cars, never walked

ART = {**ART2,
       "building.office_tower": "a modern glass-and-steel office tower in central Seoul, 2012: blue-grey curtain wall, a "
                                "granite base with revolving doors on the front, the company name in steel letters over the "
                                "entrance (ONE INTERNATIONAL); drawn tall (it rises far above its footprint), same 3/4 view",
       "building.office_block": "a small 4-5 storey Seoul office building: tiled or concrete front, rows of windows, a glass "
                                "door at the bottom centre with a signboard over it, an AC unit or two",
       "building.villa": "a red-brick multi-family villa (빌라) of a Seoul hillside neighbourhood: 3-4 storeys, small "
                         "balconies with laundry, a door at the foot with a number plate, a satellite dish",
       "building.apartment": "a slab of Korean flats (아파트): white and pale grey, a big block number painted on the side, "
                             "balconies with glass, a lobby door at the foot",
       "building.storefront": "a Seoul street-level shop: a big bright signboard (hangul), glass front with posters, a "
                              "rolled-up shutter, a floor of flats above; one sprite that reads as any small shop",
       "building.mart": "a big Korean supermarket (대형마트): a wide low box, a red and yellow sign, trolleys at the door",
       "building.pojangmacha": "a pojangmacha: an orange tarp tent bar on the pavement, lit from inside, plastic stools, a "
                               "steaming cart; the flap open at the front",
       "building.subway_entrance": "a Seoul subway entrance: stairs going down under a glass canopy, a blue sign with the "
                                   "line number and station name on a post beside it",
       "building.stone_house": "an Amman house of pale limestone blocks, flat roof with a water tank, small windows with "
                               "iron grilles, a door at the foot",
       "building.stone_shop": "an Amman café in a limestone front: an awning, a few chairs outside, a hookah, Arabic sign",
       "building.rooftop_box": "a rooftop stairhouse and lift motor room: a concrete box, a steel door, vents",
       "landmark.pagoda": "Tapgol Park's ten-storey marble pagoda (원각사지 십층석탑) inside its glass protective case",
       "prop.car": "a parked or passing car seen from above at the same 3/4 angle (a white or grey sedan, a black taxi with "
                   "a roof light), four tiles long, two deep",
       "prop.water_tank": "a rooftop water tank: a squat cylinder on a frame",
       "prop.bus_stop": "a Seoul bus stop: a glass shelter, a route map, a bench inside",
       "prop.vending": "a drinks vending machine, lit, cans in rows",
       "prop.bench": "a park bench, slats and iron legs",
       "prop.scooter": "a delivery scooter with an insulated box on the back",
       "tree.ginkgo": "a ginkgo street tree in a square of iron grating, fan-shaped leaves",
       "tree.olive": "an olive tree, silver-green, a gnarled trunk",
       "furn.office_desk": "an office desk: a grey top, a monitor and keyboard, papers, a mug, a black office chair pulled "
                           "up; seen at the same 3/4 angle as furn.desk",
       "furn.exec_desk": "a department head's or executive's desk: big, dark wood, a leather chair behind, a name plate",
       "furn.meeting_table": "a long meeting table with chairs round it, a jug of water, notepads",
       "furn.reception": "a lobby front desk: a long counter in pale stone with the company logo on its front",
       "furn.chair": "a black office chair on castors",
       "furn.copier": "an office copier, its lid up, paper stacked beside it",
       "furn.water_cooler": "a water cooler with a stack of paper cups",
       "furn.whiteboard": "a whiteboard on a stand, scribbled with arrows and figures",
       "furn.projector_screen": "a pull-down projector screen, a slide lit on it",
       "furn.lectern": "a lectern with a microphone",
       "furn.bin": "office recycling bins in a row: paper, cans, general (blue, yellow, grey)",
       "furn.sofa": "a two-seat sofa in dark leather or grey cloth",
       "furn.filing": "a grey steel filing cabinet",
       "furn.lift_door": "a lift's brushed steel doors, the floor number lit above them",
       "furn.boxes": "archive boxes stacked and taped, ready to go",
       "furn.phone": "an office desk phone on a small side table, a red light blinking",
       "furn.noticeboard": "a cork noticeboard with sheets pinned to it",
       "furn.ashtray": "a standing steel ashtray, the smokers' corner",
       "furn.go_board": "a go board on the floor (a thick wooden board on legs), a cushion on either side, bowls of stones",
       "furn.trophy_case": "a glass case of trophies and framed photos",
       "furn.store_shelf": "a convenience store's shelf of snacks and noodles",
       "furn.fridge_case": "a glass-door drinks fridge, lit",
       "furn.plastic_table": "a round red or blue plastic table with soju bottles and a dish on it",
       "furn.pizza_oven": "a pizza shop's steel oven",
       "furn.low_table": "a low wooden table you sit at on the floor (상), set with dishes",
       "furn.wardrobe": "a wardrobe, plain wood",
       "furn.tv": "a television on a low cabinet",
       "furn.toy_shelf": "a low shelf of toys and picture books",
       "furn.kid_mat": "a padded play mat in bright colours",
       "furn.subway_seat": "a Seoul subway carriage's long bench seat along the wall, grab rails above",
       "prop.glass_water": "a glass of still water on a coaster, drawn small on a table top (no ice)",
       "prop.teacup": "a white cup of green tea on a saucer, drawn small on a table top",
       "prop.coffee_cup": "a white cup of black coffee on a saucer, drawn small on a table top",
       # grounds and lines
       "asphalt": "a Seoul carriageway: dark asphalt, white lane lines and dashes, a yellow centre line; tiles that join "
                  "into a road four or more tiles wide",
       "crosswalk": "a zebra crossing: broad white stripes across dark asphalt, running the short way across the road",
       "barrier": "an office lobby's ID speed gates: waist-high steel posts with glass flaps between them, a card reader on "
                  "each post; a 1-tile gap is the way through",
       "parapet": "a roof's low concrete parapet with a steel railing on top, the city's towers beyond",
       "carpet": "an office floor of grey-blue carpet tiles, a faint grid",
       "office_tile": "a tower lobby's floor: large polished pale stone tiles with a soft reflection",
       "lino": "a Korean home's floor: glossy yellow-brown vinyl (장판) over the heated ondol, a faint wood grain",
       # townsfolk in modern dress (walkers, as the old folk.* are): Seoul in 2012, and Amman
       "folk.salaryman": "a Korean office worker, 2012: dark suit, white shirt, lanyard ID card, black shoes; a few "
                         "variants (tie or none, glasses, a briefcase or a phone)",
       "folk.officewoman": "a Korean office worker, 2012: a skirt or trouser suit, blouse, lanyard ID card, low heels; a few "
                           "variants (hair up or down, a folder, a coffee)",
       "folk.grandpa": "an old Korean man of Tapgol Park: flat cap or bare grey head, a padded jacket or a cardigan, slacks",
       "folk.ajumma": "a middle-aged Korean woman: permed short hair, a quilted vest or a cardigan, an apron or a shopping trolley",
       "folk.kid": "a Korean child of 6-12: a backpack, trainers, a school uniform or play clothes",
       "folk.jordanian": "a man in Amman: a red-and-white keffiyeh or bare-headed, a shirt and trousers, a moustache",
       }

# the tower's floors, in the lift's order (the lift's menu: tk-modern.js "use": "lift"); each floor's own label names it
FLOORS = [("pt-room", "3F", "The PT room"), ("hr", "5F", "HR"), ("finance", "6F", "Finance"), ("resources", "9F", "The resources team"),
          ("sales3", "14F", "Sales Team 3"), ("meeting", "15F", "A meeting room"), ("audit", "16F", "The audit room"),
          ("board-room", "20F", "The board room"), ("exec-floor", "21F", "The executive's office"), ("roof", "R", "The roof")]
LOBBY = "one-international"


def _lift_floors():
    return [{"label": "1F · The lobby", "to": LOBBY}, *[{"label": f"{n} · {label}", "to": f"{LOBBY}--{mid}"} for mid, n, label in FLOORS]]


def _with_lift(mid, plan, at=None, doors_at=None):
    """A floor with its lift: the lift's doors by the floor's own door (which is the stairs down to the lobby), the
    spot that opens its menu, and arrivals by lift (from the lobby or any floor) at it."""
    w, h = plan["grid"]
    door = plan["entries"][""]
    at = at or [door[0] - 2, h - 2]
    doors_at = doors_at or [at[0] - 1, at[1]]
    plan = {**plan, "things": [*plan["things"], {"id": "lift-doors", "kind": "furn.lift_door", "rect": [*doors_at, 1, 1], "label": "The lift"}],
            "spots": [*plan.get("spots", []), {"id": "lift", "at": at, "label": "The lift", "use": "lift", "floors": _lift_floors()}],
            "entries": {**plan["entries"], "One International": at, **{m: at for m, _, _ in FLOORS if m != mid}}}
    return plan


def _talk(kind, at, say, **kw):
    return {"kind": kind, "at": at, "say": say, **kw}


def _in(place, kind, at, say, **kw):
    """Someone in one of a place's rooms."""
    return {"kind": kind, "place": place, "at": at, "say": say, **kw}


def _desks(cells, **kw):
    return [{"id": f"desk-{x}-{y}", "kind": "furn.office_desk", "rect": [x, y, 1, 1], **kw} for x, y in cells]


def _street(grid, road_y, things, exits, entries, dress=(), ground=(), lines=(), spots=()):
    """A small street, cell 4: a road along row road_y, city ground round it."""
    w, h = grid
    return {"grid": [w, h], "cell": 4, "margin": 1,
            "ground": [{"id": "town", "kind": "city", "rect": [0, 0, w, h]}, *ground],
            "lines": [{"id": "street", "kind": "road", "path": [[0, road_y], [w - 1, road_y]], "width": 3}, *lines],
            "things": list(things), "spots": list(spots), "exits": list(exits), "entries": entries, "dress": list(dress)}


# =========================================================================================
# The tower's floors (One International): each a room whose door leads back to the lobby
def _sales3():
    """Sales Team 3's floor: three islands of desks, each with its head's desk at the end. Sales Team 1 (Sun's) on
    the west, Sales Team 3 in the middle (Oh's desk at its head, Jang's the last at the foot), another team east.
    Jang's call notes (icb_call, m12-m13) are at his desk; the whiteboard opens the audit board."""
    return room([18, 12], [9, 11], floor="carpet", things=[
        {"id": "copier", "kind": "furn.copier", "rect": [2, 1, 1, 1], "label": "The copier"},
        {"id": "cooler", "kind": "furn.water_cooler", "rect": [4, 1, 1, 1]},
        {"id": "board-1", "kind": "furn.whiteboard", "rect": [7, 1, 1, 1], "label": "Sales Team 3's whiteboard"},
        {"id": "filing-1", "kind": "furn.filing", "rect": [11, 1, 1, 1]},
        {"id": "filing-2", "kind": "furn.filing", "rect": [12, 1, 1, 1]},
        {"id": "plant-n", "kind": "furn.plant", "rect": [15, 1, 1, 1]},
        # Sales Team 1: Sun Ji-young's island
        *_desks([(2, 4), (3, 4), (2, 5), (3, 5)]),
        {"id": "sun-desk", "kind": "furn.office_desk", "rect": [4, 4, 1, 2], "label": "Sun Ji-young's desk"},
        # Sales Team 3
        {"id": "desk-park", "kind": "furn.office_desk", "rect": [8, 4, 1, 1], "label": "Park's desk"},
        {"id": "desk-kim", "kind": "furn.office_desk", "rect": [9, 4, 1, 1], "label": "Kim Dong-sik's desk"},
        {"id": "desk-spare", "kind": "furn.office_desk", "rect": [9, 5, 1, 1]},
        {"id": "desk-jang", "kind": "furn.office_desk", "rect": [8, 5, 1, 1], "label": "Jang's desk"},
        {"id": "oh-desk", "kind": "furn.office_desk", "rect": [10, 4, 1, 2], "label": "Oh's desk"},
        # the team east
        *_desks([(13, 4), (14, 4), (13, 5), (14, 5)]),
        {"id": "head-e", "kind": "furn.office_desk", "rect": [15, 4, 1, 2]},
        # the south half: where the teams meet
        {"id": "meet-w", "kind": "furn.meeting_table", "rect": [2, 8, 2, 1], "label": "A meeting table"},
        {"id": "meet-e", "kind": "furn.meeting_table", "rect": [13, 8, 2, 1]},
        {"id": "plant-sw", "kind": "furn.plant", "rect": [1, 10, 1, 1]},
        {"id": "plant-se", "kind": "furn.plant", "rect": [16, 10, 1, 1]},
    ], spots=[
        {"id": "m3", "at": [7, 3], "node": k(3), "label": "Sales Team 3"},
        {"id": "m5", "at": [4, 6], "node": k(5), "label": "Sun Ji-young's desk"},
        {"id": "m9", "at": [8, 6], "node": k(9), "label": "Jang's desk"},
        {"id": "m10", "at": [9, 3], "node": k(10), "label": "Kim Dong-sik's desk"},
        {"id": "m11", "at": [5, 5], "node": k(11), "label": "Sun Ji-young's desk"},
        {"id": "m21", "at": [7, 4], "node": k(21), "label": "The team's phone"},
        {"id": "m23", "at": [11, 5], "node": k(23), "label": "Oh's desk"},
        # handoffs (Plot): back to Jang at his desk; to Sun Ji-young at hers
        {"id": "sales3", "at": [9, 6], "label": "Jang's desk", "note": "handoffs to Jang land here"},
        {"id": "sun-desk-hand", "at": [5, 4], "label": "Sun Ji-young's desk", "note": "the handoff to Sun lands here"},
        # the audit board (m12-m13): Jang's own notes of his call to ICB, and the whiteboard that opens the board
        {"id": "call-notes", "at": [7, 5], "label": "Jang's desk", "gives": "icb_call", "gives_when": f"node:{k(12)}",
         "give": ["Your notes from the call to ICB, in your own hand. In the margin you've written: Korean? In the room behind?"],
         "given": ["Your desk. The call notes are in your bag."]},
        {"id": "whiteboard", "at": [7, 2], "label": "Sales Team 3's whiteboard", "opens": "audit"},
    ]) | {"label": "Sales Team 3"}


def _resources():
    """The resources team (Ahn Young-yi's): two islands, her desk the last at the foot of the first; the head's desk."""
    return room([14, 9], [7, 8], floor="carpet", things=[
        *_desks([(2, 3), (3, 3), (2, 4)]),
        {"id": "ahn-desk", "kind": "furn.office_desk", "rect": [3, 4, 1, 1], "label": "Ahn Young-yi's desk"},
        *_desks([(9, 3), (10, 3), (9, 4), (10, 4)]),
        {"id": "head", "kind": "furn.exec_desk", "rect": [6, 1, 2, 1], "label": "The department head's desk"},
        {"id": "filing-1", "kind": "furn.filing", "rect": [1, 1, 1, 1]},
        {"id": "filing-2", "kind": "furn.filing", "rect": [12, 1, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [12, 7, 1, 1]},
    ], spots=[{"id": "resources", "at": [4, 5], "label": "The resources team", "note": "the handoff to Ahn lands here"}]) \
        | {"label": "The resources team"}


def _meeting():
    """A meeting room (m4b: the client's president comes to One International)."""
    return room([12, 8], [6, 7], floor="carpet", things=[
        {"id": "table", "kind": "furn.meeting_table", "rect": [5, 3, 2, 1], "label": "The meeting table"},
        *[{"id": f"chair-{x}-{y}", "kind": "furn.chair", "rect": [x, y, 1, 1]} for x, y in ((4, 3), (7, 3), (5, 2), (6, 2))],
        {"id": "board", "kind": "furn.whiteboard", "rect": [2, 1, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [10, 1, 1, 1]},
    ], spots=[{"id": "m4b", "at": [6, 5], "node": k("4b"), "label": "A meeting room"}]) | {"label": "A meeting room"}


def _finance():
    return room([14, 9], [7, 8], floor="carpet", things=[
        {"id": "filing-1", "kind": "furn.filing", "rect": [1, 1, 1, 1]},
        {"id": "filing-2", "kind": "furn.filing", "rect": [2, 1, 1, 1]},
        {"id": "kim-desk", "kind": "furn.exec_desk", "rect": [6, 2, 2, 1], "label": "Kim Seon-ju's desk"},
        {"id": "filing-3", "kind": "furn.filing", "rect": [11, 1, 1, 1]},
        {"id": "filing-4", "kind": "furn.filing", "rect": [12, 1, 1, 1]},
        *_desks([(2, 4), (3, 4), (2, 5), (3, 5), (10, 4), (11, 4), (10, 5), (11, 5)]),
        {"id": "plant", "kind": "furn.plant", "rect": [12, 7, 1, 1]},
    ], spots=[{"id": "m8", "at": [7, 4], "node": k(8), "label": "Kim Seon-ju's desk"}]) | {"label": "Finance"}


def _hr():
    return room([12, 8], [6, 7], floor="carpet", things=[
        *_desks([(2, 2), (3, 2), (8, 2), (9, 2)]),
        {"id": "hr-desk", "kind": "furn.exec_desk", "rect": [5, 2, 2, 1], "label": "The HR manager's desk"},
        {"id": "results", "kind": "furn.noticeboard", "rect": [1, 4, 1, 1], "label": "The noticeboard"},
        {"id": "filing", "kind": "furn.filing", "rect": [10, 4, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [10, 6, 1, 1]},
    ]) | {"label": "HR"}


def _audit():
    """The audit room: the auditors packing up (m13). ICB's registration is on their table, which also opens the
    audit board (m12-m13)."""
    return room([14, 9], [7, 8], floor="carpet", things=[
        {"id": "boxes-1", "kind": "furn.boxes", "rect": [1, 1, 1, 1], "label": "Archive boxes, packed"},
        {"id": "boxes-2", "kind": "furn.boxes", "rect": [2, 1, 1, 1]},
        {"id": "boxes-3", "kind": "furn.boxes", "rect": [1, 2, 1, 1]},
        {"id": "audit-board", "kind": "furn.whiteboard", "rect": [6, 1, 1, 1], "label": "A whiteboard"},
        {"id": "table", "kind": "furn.meeting_table", "rect": [5, 3, 2, 1], "label": "The auditors' table"},
        {"id": "chair-w", "kind": "furn.chair", "rect": [4, 3, 1, 1]},
        {"id": "chair-e", "kind": "furn.chair", "rect": [7, 3, 1, 1]},
        {"id": "phone", "kind": "furn.phone", "rect": [11, 2, 1, 1], "label": "The phone"},
        {"id": "filing", "kind": "furn.filing", "rect": [12, 1, 1, 1]},
    ], spots=[
        {"id": "m13", "at": [6, 5], "node": k(13), "label": "The audit room"},
        {"id": "audit-table", "at": [5, 4], "label": "The auditors' table", "opens": "audit",
         "gives": "icb_listing", "gives_when": f"node:{k(12)}",
         "give": ["On the auditors' table, among the papers they're packing: ICB's registration. You take a copy."],
         "given": ["The auditors' table. You have ICB's registration already."]},
    ]) | {"label": "The audit room"}


SEATS = [(x, 3) for x in range(5, 11)] + [(x, 5) for x in range(5, 11)]   # the board room's places, north row then south
# Setting the room (m17): the three places the notes name, each a spot by its chair that takes the drink from the bag
# ("takes"), and the drink on the table once set down (a prop over its stretch of table, on its mark)
SETTINGS = [
    ("seat_president", "water", [12, 4], "table-2", "prop.glass_water", "The president's place",
     "Still water, no ice, at the head of the table.", "The notes say the president's water goes here."),
    ("seat_exec", "green_tea", [6, 2], "table-0", "prop.teacup", "The executive vice president's place",
     "Green tea, at the executive vice president's place.", "The notes say the executive vice president's tea goes here."),
    ("seat_division", "coffee", [6, 6], "table-1", "prop.coffee_cup", "The division head's place",
     "Black coffee, at the division head's place.", "The notes say the division head's coffee goes here."),
]


def _board_room():
    """The board room: one long table (three meeting tables end to end), six places a side and the president's at the
    head."""
    return room([16, 10], [8, 9], floor="carpet", things=[
        {"id": "screen", "kind": "furn.projector_screen", "rect": [7, 1, 2, 1], "label": "The screen"},
        {"id": "cooler", "kind": "furn.water_cooler", "rect": [1, 1, 1, 1]},
        *[{"id": f"table-{i}", "kind": "furn.meeting_table", "rect": [5 + 2 * i, 4, 2, 1], **({"label": "The board table"} if i == 1 else {})}
          for i in range(3)],
        *[{"id": f"seat-{'n' if y == 3 else 's'}{x - 4}", "kind": "furn.chair", "rect": [x, y, 1, 1]} for x, y in SEATS],
        {"id": "seat-head", "kind": "furn.chair", "rect": [11, 4, 1, 1], "label": "The president's place"},
        {"id": "sideboard", "kind": "furn.counter", "rect": [1, 7, 2, 1], "label": "The side table"},
        {"id": "plant-1", "kind": "furn.plant", "rect": [14, 1, 1, 1]},
        {"id": "plant-2", "kind": "furn.plant", "rect": [14, 8, 1, 1]},
    ], spots=[{"id": "m17", "at": [8, 7], "node": k(17), "label": "The board room"},
              {"id": "board-room", "at": [10, 7], "label": "The board room", "note": "the handoff to Jang lands here"},
              *[{"id": mark, "at": at, "label": label, "needs": [f"item:{item}"], "when": "item:seating_notes", "delivers": mark,
                 "takes": True, "deliver": [line], "waiting": [wait], "delivered": [line]}
                for mark, item, at, _, _, label, line, wait in SETTINGS]]) \
        | {"label": "The board room",
           "props": [{"kind": kind, "over": on, "when": f"mark:{mark}", "lift": 6} for mark, _, _, on, kind, *_ in SETTINGS]}


def _exec_floor():
    return room([14, 9], [7, 8], floor="carpet", things=[
        {"id": "shelf-1", "kind": "furn.shelf", "rect": [1, 1, 1, 1]},
        {"id": "shelf-2", "kind": "furn.shelf", "rect": [2, 1, 1, 1]},
        {"id": "desk", "kind": "furn.exec_desk", "rect": [6, 2, 2, 1], "label": "The executive's desk"},
        {"id": "window-1", "kind": "furn.window", "rect": [9, 1, 1, 1]},
        {"id": "window-2", "kind": "furn.window", "rect": [10, 1, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [12, 1, 1, 1]},
        {"id": "sofa-1", "kind": "furn.sofa", "rect": [2, 5, 1, 1]},
        {"id": "sofa-2", "kind": "furn.sofa", "rect": [3, 5, 1, 1]},
        {"id": "low-table", "kind": "furn.low_table", "rect": [2, 6, 1, 1]},
    ], spots=[{"id": "m14", "at": [6, 4], "node": k(14), "label": "The executive's office"},
              {"id": "m22", "at": [8, 4], "node": k(22), "label": "The executive's office"}]) | {"label": "The executive's office"}


def _pt_room():
    """The training floor: a lectern and screen at the front, the interviewers' table to one side, the interns' rows."""
    rows = [(x, y) for y in (5, 7) for x in (2, 3, 4, 5, 10, 11, 12, 13)]
    return room([16, 10], [8, 9], floor="carpet", things=[
        {"id": "screen", "kind": "furn.projector_screen", "rect": [6, 1, 2, 1], "label": "The screen"},
        {"id": "lectern", "kind": "furn.lectern", "rect": [9, 2, 1, 1], "label": "The lectern"},
        {"id": "panel", "kind": "furn.meeting_table", "rect": [12, 2, 2, 1], "label": "The interviewers' table"},
        *[{"id": f"row-{x}-{y}", "kind": "furn.desk", "rect": [x, y, 1, 1]} for x, y in rows],
    ], spots=[{"id": "m6", "at": [8, 3], "node": k(6), "label": "The lectern"},
              {"id": "m7", "at": [7, 3], "node": k(7), "label": "The PT room"}]) | {"label": "The PT room"}


def _roof():
    """The roof: a parapet round it, the door back down in its north side, the smokers' corner, and where Ahn is told
    to drop her proposal (m19)."""
    return {"grid": [16, 10], "cell": 2, "margin": 0, "label": "The roof",
            "ground": [{"id": "deck", "kind": "court", "rect": [0, 0, 16, 10]}],
            "lines": [{"id": "parapet", "kind": "parapet", "outline": [0, 0, 16, 10], "width": 1, "gates": {"door": [8, 0]}}],
            "things": [{"id": "stairhouse", "kind": "building.rooftop_box", "rect": [2, 1, 2, 2], "label": "The lift motor room"},
                       {"id": "tank", "kind": "prop.water_tank", "rect": [12, 1, 1, 1]},
                       {"id": "ashtray", "kind": "furn.ashtray", "rect": [12, 6, 1, 1], "label": "The smokers' corner"},
                       {"id": "bench-1", "kind": "prop.bench", "rect": [13, 6, 1, 1]},
                       {"id": "bench-2", "kind": "prop.bench", "rect": [4, 7, 1, 1]}],
            "spots": [{"id": "m19", "at": [6, 5], "node": k(19), "label": "The roof"},
                      {"id": "roof", "at": [9, 4], "label": "The roof", "note": "the handoff to Ahn lands here"}],
            "exits": [], "entries": {"": [8, 1]},
            "states": [{"id": "day", "light": "day"}]}


def _lobby():
    """The lobby: the door from Jongno in the south; the front desk and the recycling bins on the visitors' side; the
    ID gates across the middle; behind them, the lift (its menu goes to every floor)."""
    w = 18
    plan = room([w, 10], [w // 2, 9], floor="office_tile", exits=[{"to": "Jongno", "at": [w // 2, 9], "side": "S"}],
                lines=[{"id": "id-gates", "kind": "barrier", "path": [[1, 4], [w - 2, 4]], "width": 1,
                        "gates": {"gates-w": [5, 4], "gates-e": [w - 6, 4]}}],
                things=[{"id": "plant-w", "kind": "furn.plant", "rect": [1, 3, 1, 1]},
                        {"id": "plant-e", "kind": "furn.plant", "rect": [w - 2, 3, 1, 1]},
                        {"id": "directory", "kind": "furn.noticeboard", "rect": [1, 5, 1, 1], "label": "The floor directory"},
                        {"id": "reception", "kind": "furn.reception", "rect": [w - 6, 6, 2, 1], "label": "The front desk"},
                        {"id": "bin-1", "kind": "furn.bin", "rect": [2, 7, 1, 1], "label": "The recycling bins"},
                        {"id": "bin-2", "kind": "furn.bin", "rect": [3, 7, 1, 1]},
                        {"id": "sofa-1", "kind": "furn.sofa", "rect": [w - 3, 8, 1, 1]},
                        {"id": "sofa-2", "kind": "furn.sofa", "rect": [w - 2, 8, 1, 1]}],
                spots=[{"id": "m2", "at": [w - 6, 7], "node": k(2), "label": "The front desk"},
                       # m3b (Oh): the waybill's other half is in the bins by the gates (the gate needs the scrap)
                       {"id": "bins", "at": [2, 8], "label": "The recycling bins", "gives": "waybill_scrap", "gives_when": f"node:{k(3)}",
                        "give": ["You go through the bins by the gates, sheet by sheet. Stuck to the back of a torn page: the rest of the "
                                 "waybill, and a name on it in someone else's hand. Kim Seok-ho."],
                        "given": ["The recycling bins. You've found what you were looking for."]},
                       {"id": "m3b", "at": [4, 8], "node": k("3b"), "label": "The lobby"},
                       {"id": "lobby-lift", "at": [w // 2, 3], "label": "The lifts", "note": "the handoff to Oh lands here"},
                       {"id": "lift", "at": [w // 2, 1], "label": "The lift", "use": "lift", "floors": _lift_floors()}])
    plan["things"] += [{"id": "lift-w", "kind": "furn.lift_door", "rect": [w // 2 - 1, 1, 1, 1], "label": "The lift"},
                       {"id": "lift-e", "kind": "furn.lift_door", "rect": [w // 2 + 1, 1, 1, 1], "label": "The lift"}]
    # the floors hang off the lobby (their doors, the stairs, come back down here); arrivals from them at the lift
    return plan | {"owns": [m for m, _, _ in FLOORS], "entries": {**plan["entries"], **{m: [w // 2, 2] for m, _, _ in FLOORS}}}


PLANS_MS = {
    # =========================================================================================
    # Susaek-dong: a hillside of red-brick villas above the main road. Jang's home (his mother's room) and, at
    # Chuseok, the relatives' flat, up the lanes; Susaek Station's stairs on the main road.
    "Susaek-dong": {
        "archetype": "city",
        "plan": {
            "grid": [16, 12], "cell": 4, "margin": 1,
            "ground": [{"id": "town", "kind": "city", "rect": [0, 0, 16, 12]},
                       {"id": "hill", "kind": "hills", "rect": [0, 0, 16, 2]},
                       {"id": "yard", "kind": "garden", "rect": [13, 3, 3, 5]}],
            "lines": [
                {"id": "main-road", "kind": "road", "path": [[0, 9], [15, 9]], "width": 3},
                {"id": "lane-w", "kind": "road", "path": [[4, 9], [4, 2]], "width": 2},
                {"id": "lane-e", "kind": "road", "path": [[10, 9], [10, 2]], "width": 2},
                {"id": "lane-top", "kind": "road", "path": [[4, 2], [10, 2]], "width": 2},
            ],
            "things": [
                {"id": "home", "kind": "building.villa", "rect": [5, 3, 2, 2], "door": "W", "label": "Jang's home", "map": "home"},
                {"id": "relatives", "kind": "building.villa", "rect": [11, 3, 2, 2], "door": "W", "label": "The relatives' flat",
                 "map": "relatives"},
                {"id": "villa-1", "kind": "building.villa", "rect": [2, 3, 2, 2], "door": "E"},
                {"id": "villa-2", "kind": "building.villa", "rect": [8, 3, 2, 2], "door": "E"},
                {"id": "villa-3", "kind": "building.villa", "rect": [2, 6, 2, 2], "door": "E"},
                {"id": "villa-4", "kind": "building.villa", "rect": [5, 6, 2, 2], "door": "W"},
                {"id": "villa-5", "kind": "building.villa", "rect": [8, 6, 2, 2], "door": "E"},
                {"id": "villa-6", "kind": "building.villa", "rect": [11, 6, 2, 2], "door": "W"},
                {"id": "store", "kind": "building.storefront", "rect": [2, 10, 2, 1], "door": "N", "label": "A corner store"},
                {"id": "shop-2", "kind": "building.storefront", "rect": [6, 10, 2, 1], "door": "N"},
                {"id": "station", "kind": "building.subway_entrance", "rect": [12, 10, 2, 1], "door": "N",
                 "label": "Susaek Station", "to": "The subway"},
            ],
            # the end of m1: grown up, home (Plot's handoff)
            "spots": [{"id": "home", "at": [4, 4], "at_door": "home", "label": "Jang's home", "note": "m1's handoff lands here"}],
            "dress": [{"kind": "tree.ginkgo", "along": "main-road", "every": 3}, {"kind": "lamp.post", "along": "lane-w", "every": 4},
                      {"kind": "plant.bush", "in": "yard", "count": 5}, {"kind": "tree.small", "in": "yard", "count": 3},
                      {"kind": "prop.vending", "at_door": "store"}],
            "exits": [],
            "entries": {"": [4, 5]},
        },
        "states": [{"id": "day", "light": "day"}],
        "npcs": [
            _talk("folk.ajumma", [7, 9], "An ajumma with a shopping trolley. “The Jang boy? Up before dawn every day of his life, that one.”"),
            _talk("folk.grandpa", [10, 5], "An old man on a plastic stool by the lane. “Seven years at those stones. Now what?”"),
            # his mother, at home
            _in("home", "folk.ajumma", [6, 3], "His mother looks up from the ironing. “Eat something before you go.”", label="His mother"),
            _in("relatives", "folk.salaryman", [8, 4], "An uncle, red in the face. “So what is it you do now, exactly? An intern? At your age?”"),
            _in("relatives", "folk.ajumma", [3, 5], "An aunt. “Our boy got into a big company. Regular, of course.”"),
        ],
        "maps": {
            # his mother's room: the futon rolled away, a low table, the television; his old go board on the shelf
            "home": room([10, 7], [5, 6], floor="lino", things=[
                {"id": "wardrobe", "kind": "furn.wardrobe", "rect": [1, 1, 1, 1]},
                {"id": "mat", "kind": "furn.mat", "rect": [2, 1, 1, 1]},
                {"id": "tv", "kind": "furn.tv", "rect": [7, 1, 1, 1]},
                {"id": "table", "kind": "furn.low_table", "rect": [5, 3, 1, 1], "label": "The low table"},
                {"id": "goban", "kind": "furn.go_board", "rect": [8, 4, 1, 1], "label": "His old go board"},
            ]) | {"label": "Jang's home"},
            # Chuseok (m15): the relatives round the low table; the kitchen next door, where his mother goes
            "relatives": room([12, 8], [6, 7], floor="lino", exits=[{"to": "relatives-kitchen", "at": [11, 3], "side": "E"}], things=[
                *[{"id": f"feast-{x}", "kind": "furn.low_table", "rect": [x, 3, 1, 1], **({"label": "The Chuseok table"} if x == 5 else {})}
                  for x in (4, 5, 6, 7)],
                {"id": "tv", "kind": "furn.tv", "rect": [9, 1, 1, 1]},
                {"id": "sofa", "kind": "furn.sofa", "rect": [1, 5, 1, 1]},
            ], spots=[{"id": "m15", "at": [6, 5], "node": k(15), "label": "The relatives' flat"}]) | {"label": "The relatives' flat"},
            "relatives-kitchen": room([6, 6], [0, 3], floor="lino", things=[
                {"id": "counter", "kind": "furn.counter", "rect": [1, 1, 2, 1], "label": "The sink"},
                {"id": "fridge", "kind": "furn.fridge_case", "rect": [4, 1, 1, 1]},
            ]) | {"label": "The kitchen"},
        },
        "objectives": {k(15): "It's Chuseok. Go to the relatives' flat with your mother."},
    },

    # =========================================================================================
    # The subway: one carriage, Susaek-dong's end to Jongno's. A commuter studying a pocket board stands in the aisle
    # at the Jongno doors (m2, blocking).
    "The subway": {
        "archetype": "interior",
        "plan": room([24, 6], [0, 3], exits=[{"to": "Susaek-dong", "at": [0, 3], "side": "W"},
                                             {"to": "Jongno", "at": [23, 3], "side": "E"}], things=[
            *[{"id": f"seat-n{i}", "kind": "furn.subway_seat", "rect": [x, 1, 2, 1]} for i, x in enumerate((2, 6, 10, 14, 18))],
            *[{"id": f"seat-s{i}", "kind": "furn.subway_seat", "rect": [x, 4, 2, 1]} for i, x in enumerate((2, 6, 10, 14, 18))],
        ]) | {"label": "The subway"},
        "states": [{"id": "rush", "light": "morning"}],
        "npcs": [
            _talk("folk.salaryman", [5, 2], "A man asleep on his feet, swaying with the train."),
            _talk("folk.officewoman", [12, 3], "A woman in a suit reads the same page of her phone for three stops."),
        ],
    },

    # =========================================================================================
    # Jongno: the avenue east-west, its carriageway crossed at two crosswalks. North: Tapgol Park (old men at stone go
    # tables; the Palgakjeong pavilion; the pagoda in its glass case), the One International tower on its forecourt,
    # the corner shop (m18), a lane of offices. South: Jongno 3-ga Station's stairs, shopfronts, Pimatgol's alley with
    # the pojangmacha, the market.
    "Jongno": {
        "archetype": "city",
        "plan": {
            "grid": [28, 16], "cell": 4, "margin": 1,
            "ground": [
                {"id": "town", "kind": "city", "rect": [0, 0, 28, 16]},
                {"id": "park", "kind": "garden", "rect": [2, 1, 8, 5]},
                {"id": "carriageway", "kind": "asphalt", "rect": [0, 8, 28, 2]},
                {"id": "market", "kind": "market", "rect": [19, 11, 6, 5]},
            ],
            "lines": [
                {"id": "park-wall", "kind": "wall", "outline": [1, 0, 10, 7], "width": 1, "gates": {"park-gate": [6, 6]}},
                {"id": "park-path", "kind": "path", "path": [[6, 6], [6, 1]], "width": 2},
                {"id": "pave-n", "kind": "road", "path": [[0, 7], [27, 7]], "width": 4},
                {"id": "pave-s", "kind": "road", "path": [[0, 10], [27, 10]], "width": 4},
                {"id": "cross-w", "kind": "crosswalk", "path": [[5, 7], [5, 10]], "width": 3},
                {"id": "cross-e", "kind": "crosswalk", "path": [[18, 7], [18, 10]], "width": 3},
                {"id": "forecourt", "kind": "road", "path": [[12, 6], [16, 6]], "width": 4},
                {"id": "office-lane", "kind": "road", "path": [[19, 4], [27, 4]], "width": 2},
                {"id": "lane-link", "kind": "road", "path": [[19, 4], [19, 7]], "width": 2},
                {"id": "pimatgol", "kind": "road", "path": [[13, 10], [13, 15]], "width": 3},
                {"id": "market-alley", "kind": "road", "path": [[21, 10], [21, 15]], "width": 3},
                {"id": "back-lane", "kind": "road", "path": [[0, 15], [27, 15]], "width": 2},   # behind the south shops
            ],
            "things": [
                # Tapgol Park
                {"id": "pavilion", "kind": "building.pavilion", "rect": [2, 1, 2, 2], "label": "Palgakjeong"},
                {"id": "pagoda", "kind": "landmark.pagoda", "rect": [8, 1, 2, 2], "label": "The ten-storey pagoda"},
                {"id": "gotable-1", "kind": "furniture.gotable", "rect": [3, 4, 1, 1], "label": "A stone go table"},
                {"id": "gotable-2", "kind": "furniture.gotable", "rect": [8, 4, 1, 1], "label": "A stone go table"},
                {"id": "gotable-3", "kind": "furniture.gotable", "rect": [4, 5, 1, 1], "label": "A stone go table"},
                # the tower, on its forecourt
                {"id": "tower", "kind": "building.office_tower", "rect": [12, 1, 5, 5], "door": "S", "label": "One International",
                 "to": "One International", "plaque": "ONE INTERNATIONAL"},
                # the lane of offices behind the shops: the client's (m4) and the group's headquarters (m19's meeting)
                {"id": "client", "kind": "building.office_block", "rect": [20, 2, 2, 2], "door": "S", "label": "The client's office",
                 "map": "client"},
                {"id": "hq", "kind": "building.office_block", "rect": [23, 2, 2, 2], "door": "S", "label": "Group headquarters",
                 "map": "hq"},
                {"id": "office-3", "kind": "building.office_block", "rect": [25, 0, 2, 2]},
                # the north shops
                {"id": "corner-shop", "kind": "building.storefront", "rect": [20, 6, 2, 1], "door": "S", "label": "The corner shop",
                 "map": "corner-shop"},
                {"id": "phone-shop", "kind": "building.storefront", "rect": [23, 6, 2, 1], "door": "S", "label": "A phone shop"},
                {"id": "cafe", "kind": "building.storefront", "rect": [25, 6, 2, 1], "door": "S", "label": "A café"},
                # the south side
                {"id": "station", "kind": "building.subway_entrance", "rect": [1, 11, 2, 1], "door": "N",
                 "label": "Jongno 3-ga Station", "to": "The subway"},
                {"id": "shop-s1", "kind": "building.storefront", "rect": [4, 11, 2, 1], "door": "N"},
                {"id": "shop-s2", "kind": "building.storefront", "rect": [7, 11, 2, 1], "door": "N"},
                {"id": "shop-s3", "kind": "building.storefront", "rect": [10, 11, 2, 1], "door": "N"},
                {"id": "shop-s4", "kind": "building.storefront", "rect": [15, 11, 2, 1], "door": "N"},
                {"id": "shop-s5", "kind": "building.storefront", "rect": [25, 11, 2, 1], "door": "N"},
                {"id": "pojangmacha", "kind": "building.pojangmacha", "rect": [14, 13, 2, 1], "door": "W", "label": "A pojangmacha",
                 "map": "pojangmacha"},
                {"id": "eatery", "kind": "building.storefront", "rect": [11, 13, 2, 1], "door": "E", "label": "A soup house"},
                # the blocks behind: offices and flats along the back lane
                {"id": "block-s1", "kind": "building.office_block", "rect": [1, 13, 2, 2], "door": "S"},
                {"id": "block-s2", "kind": "building.office_block", "rect": [4, 13, 2, 2], "door": "S"},
                {"id": "block-s3", "kind": "building.villa", "rect": [7, 13, 2, 2], "door": "S"},
                {"id": "block-s4", "kind": "building.office_block", "rect": [16, 13, 2, 2], "door": "S"},
                {"id": "block-s5", "kind": "building.villa", "rect": [25, 13, 2, 2], "door": "S"},
                {"id": "stalls-1", "kind": "market.stalls", "rect": [19, 12, 2, 1], "label": "Market stalls"},
                {"id": "stalls-2", "kind": "market.stalls", "rect": [22, 12, 2, 1], "label": "Market stalls"},
                {"id": "stalls-3", "kind": "market.stalls", "rect": [19, 14, 2, 1], "label": "A dried-goods stall"},
                {"id": "stalls-4", "kind": "market.stalls", "rect": [22, 14, 2, 1]},
                # the traffic
                {"id": "car-1", "kind": "prop.car", "rect": [2, 8, 2, 1]},
                {"id": "car-2", "kind": "prop.car", "rect": [9, 9, 2, 1]},
                {"id": "car-3", "kind": "prop.car", "rect": [14, 8, 2, 1]},
                {"id": "car-4", "kind": "prop.car", "rect": [23, 9, 2, 1]},
            ],
            "spots": [
                {"id": "m18", "at": [21, 7], "at_door": "corner-shop", "node": k(18), "label": "The corner shop"},
                {"id": "park-tables", "at": [5, 4], "label": "Tapgol Park's go tables", "note": "the regulars play here (m2, m4)"},
                # Jang's last day (m23b): out on the tower's forecourt; and the handoffs Plot lands here
                {"id": "m23b", "at": [14, 6], "node": k("23b"), "label": "The forecourt"},
                {"id": "forecourt", "at": [16, 6], "label": "The forecourt", "note": "m23's handoff lands here"},
                {"id": "pojangmacha-door", "at": [13, 13], "at_door": "pojangmacha", "label": "The pojangmacha",
                 "note": "m19's handoff (to the spot 'pojangmacha' in the tent itself)"},
            ],
            "dress": [{"kind": "tree.ginkgo", "along": "pave-n", "every": 3},
                      {"kind": "tree.ginkgo", "along": "pave-s", "every": 3},
                      {"kind": "lamp.post", "along": "pimatgol", "every": 3}, {"kind": "lamp.post", "along": "back-lane", "every": 4},
                      {"kind": "tree.ginkgo", "along": "office-lane", "every": 4},
                      {"kind": "tree.pine", "in": "park", "count": 6}, {"kind": "prop.bench", "in": "park", "count": 3},
                      {"kind": "lamp.post", "along": "forecourt", "every": 3}, {"kind": "prop.vending", "at_door": "corner-shop"},
                      {"kind": "prop.bus_stop", "along": "pave-s", "every": 16}],
            "exits": [{"to": "Korea Baduk Association", "at": [0, 7], "side": "W"},
                      {"to": "Baekjin Trading", "at": [0, 10], "side": "W"},
                      {"to": "Sun's neighbourhood", "at": [27, 10], "side": "E"},
                      {"to": "The pizza shop", "at": [27, 7], "side": "E"},
                      {"to": "The new office", "at": [27, 4], "side": "E"}],
            "entries": {"": [14, 7], "Korea Baduk Association": [1, 7], "Baekjin Trading": [1, 10],
                        "Sun's neighbourhood": [26, 10], "The pizza shop": [26, 7], "The new office": [26, 4]},
        },
        "states": [{"id": "day", "until": f"node:{k(19)}", "light": "day"},
                   {"id": "night", "when": f"node:{k(19)}", "until": f"node:{k('19b')}", "light": "night"},   # the tent bar (m19b)
                   {"id": "after", "when": f"node:{k('19b')}", "light": "day"}],
        "npcs": [
            _talk("folk.grandpa", [7, 3], "An old man by the pagoda. “Sixty years I've come here. The stones don't change. We do.”"),
            _talk("folk.salaryman", [9, 7], "A man in a suit, on his phone, walking fast. “No, the shipment, the shipment—”"),
            _talk("folk.officewoman", [16, 10], "An office worker with a coffee in each hand. “Lunch is an hour. It's never an hour.”"),
            _talk("folk.salaryman", [24, 4], "A courier with a trolley of boxes. “Fourteenth floor? Every one of them's the fourteenth floor.”"),
            _talk("folk.ajumma", [21, 14], "A stallholder. “Dried squid, dried filefish. Cheaper than the shops, and better.”"),
            # the ₩100,000 mission (m18, tk-modern.js): the stall that sells the stock, and the passers-by he offers it to
            {"id": "sock-stall", "kind": "folk.ajumma", "at": [21, 12], "label": "The sock stall", "shop": ["socks"],
             "say": "A stall of socks, gloves and towels. “Ten pairs for twenty thousand. Wholesale price, for you.”"},
            {"id": "buyer-bus", "kind": "folk.salaryman", "at": [8, 10], "when": f"node:{k(17)}", "until": f"node:{k(18)}", "label": "A man waiting for the bus",
             "say": "A man waiting for the bus, checking his watch.",
             "buyer": {"wants": ["socks"], "pays": 30000,
                       "yes": ["“Socks? My wife's been on at me about socks for a week. Fine. Thirty thousand.”"],
                       "no": ["“No, thanks. Not today.”"]}},
            {"id": "buyer-lunch", "kind": "folk.officewoman", "at": [16, 7], "when": f"node:{k(17)}", "until": f"node:{k(18)}", "label": "An office worker",
             "say": "An office worker on her way back from lunch.",
             "buyer": {"wants": ["socks"], "pays": 25000,
                       "yes": ["“For my father, maybe. He never buys his own. Here.”"],
                       "no": ["“I'm sorry, I'm in a hurry.”"]}},
            {"id": "buyer-student", "kind": "folk.kid", "at": [3, 10], "when": f"node:{k(17)}", "until": f"node:{k(18)}", "label": "A student",
             "say": "A student in a school blazer, waiting at the station stairs.",
             "buyer": {"wants": ["socks"], "pays": 20000,
                       "yes": ["“For PE? Mum keeps saying I need more. Twenty thousand, that's all I've got.”"],
                       "no": ["“I've got no money, sorry.”"]}},
            {"id": "buyer-oldman", "kind": "folk.grandpa", "at": [24, 10], "when": f"node:{k(17)}", "until": f"node:{k(18)}", "label": "An old man",
             "say": "An old man with a newspaper under his arm.",
             "buyer": {"wants": ["socks"], "pays": 0,
                       "no": ["“From a young man in a suit, on the pavement? No. Go and sell to someone who needs them.”"]}},
            _talk("folk.ajumma", [13, 14], "An old woman setting out plastic stools. “Come back after dark, young man. That's when we're open.”"),
            # in the corner shop and the pojangmacha
            _in("corner-shop", "folk.salaryman", [2, 3], "The owner, behind the till, doesn't look up from his paper.", behind="counter",
                label="The corner-shop owner"),
            _in("pojangmacha", "folk.ajumma", [4, 2], "The woman at the cart. “Soju? Eomuk? Sit, sit.”", behind="cart"),
        ],
        "maps": {
            # the corner shop (m18): the owner behind the till; the drinks fridges, the shelves; the dried squid
            "corner-shop": room([10, 7], [5, 6], floor="office_tile", things=[
                {"id": "fridge-1", "kind": "furn.fridge_case", "rect": [6, 1, 1, 1], "label": "The drinks fridge"},
                {"id": "fridge-2", "kind": "furn.fridge_case", "rect": [7, 1, 1, 1]},
                {"id": "fridge-3", "kind": "furn.fridge_case", "rect": [8, 1, 1, 1]},
                {"id": "shelf-1", "kind": "furn.store_shelf", "rect": [4, 3, 1, 1]},
                {"id": "shelf-2", "kind": "furn.store_shelf", "rect": [5, 3, 1, 1]},
                {"id": "shelf-3", "kind": "furn.store_shelf", "rect": [7, 3, 1, 1]},
                {"id": "shelf-4", "kind": "furn.store_shelf", "rect": [8, 3, 1, 1]},
                {"id": "counter", "kind": "furn.counter", "rect": [1, 4, 2, 1], "label": "The till, and the dried squid"},
            ]) | {"label": "The corner shop"},
            # the client's office (m4): Park Jong-gi's client, whose staff laugh at him
            "client": room([12, 8], [6, 7], floor="carpet", things=[
                *_desks([(2, 2), (3, 2), (8, 2), (9, 2)]),
                {"id": "boss", "kind": "furn.exec_desk", "rect": [5, 1, 2, 1], "label": "The client's president's desk"},
                {"id": "sofa", "kind": "furn.sofa", "rect": [2, 5, 1, 1]},
                {"id": "table", "kind": "furn.low_table", "rect": [3, 5, 1, 1]},
                {"id": "plant", "kind": "furn.plant", "rect": [10, 6, 1, 1]},
            ], spots=[{"id": "m4", "at": [6, 4], "node": k(4), "label": "The client's office"}]) | {"label": "The client's office"},
            # the group's headquarters: the resources meeting where Ahn's proposal is chosen (told in m19)
            "hq": room([14, 8], [7, 7], floor="carpet", things=[
                *[{"id": f"table-{i}", "kind": "furn.meeting_table", "rect": [4 + 2 * i, 3, 2, 1], **({"label": "The group's meeting table"} if i == 1 else {})}
                  for i in range(3)],
                {"id": "screen", "kind": "furn.projector_screen", "rect": [6, 1, 2, 1], "label": "The screen"},
                {"id": "plant", "kind": "furn.plant", "rect": [12, 1, 1, 1]},
            ]) | {"label": "Group headquarters"},
            # Pimatgol's pojangmacha (m19b, at night): the cart at the back, three tables
            "pojangmacha": room([10, 6], [5, 5], floor="earth", spots=[
                {"id": "m19b", "at": [3, 4], "node": k("19b"), "label": "The pojangmacha"},
                {"id": "pojangmacha", "at": [6, 4], "label": "The pojangmacha", "note": "m19's handoff to Ahn lands here"},
            ], things=[
                {"id": "cart", "kind": "furn.counter", "rect": [3, 1, 2, 1], "label": "The cart: eomuk, soju"},
                {"id": "table-1", "kind": "furn.plastic_table", "rect": [2, 3, 1, 1]},
                {"id": "table-2", "kind": "furn.plastic_table", "rect": [7, 3, 1, 1]},
                {"id": "table-3", "kind": "furn.plastic_table", "rect": [7, 1, 1, 1]},
                {"id": "stool-1", "kind": "furn.stool", "rect": [3, 3, 1, 1]},
                {"id": "stool-2", "kind": "furn.stool", "rect": [6, 3, 1, 1]},
            ]) | {"label": "The pojangmacha", "states": [{"id": "night", "light": "night"}]},
        },
        "objectives": {k(4): "Go with Park Jong-gi to the client's office, along the lane behind the shops.",
                       k(18): "You have ₩100,000. Buy stock at the market stalls, and sell it on the street.",
                       k("19b"): "Go to the pojangmacha in Pimatgol, off Jongno.",
                       k("23b"): "Go out to the forecourt."},
    },

    # =========================================================================================
    # One International: inside the tower. Its plan is the lobby; the floors are its rooms, each reached by its own
    # lift from the lobby's back wall.
    "One International": {
        "id": "one-international",
        "archetype": "interior",
        "plan": _lobby() | {"label": "One International"},
        "states": [{"id": "day", "light": "day"}],
        "npcs": [
            {"id": "receptionist", "kind": "folk.officewoman", "at": [13, 5], "behind": "reception", "face": "S", "label": "The receptionist",
             "say": "“Visitor passes are issued here. Who are you here to see?”"},
            _talk("folk.salaryman", [6, 5], "A security guard by the ID gates. “Card on the reader, please. One at a time.”", label="Security"),
            _talk("folk.salaryman", [8, 2], "Someone waiting for a lift taps his card against his leg. “Come on, come on.”"),
            # the floors' people (the cast come with the scenes; these are the office around them)
            _in("sales3", "folk.officewoman", [14, 6], "A woman from the next team. “Sales Team 3? They're the ones who work through lunch.”"),
            _in("sales3", "folk.salaryman", [3, 7], "A deputy from Sales Team 1, reading a fax. “Another intern? We used to get six a year.”"),
            _in("finance", "folk.salaryman", [10, 6], "A finance clerk. “If it isn't on the form, it doesn't exist.”"),
            _in("hr", "folk.officewoman", [8, 4], "Someone from HR, stacking contracts. “Two-year contracts are on the left. Regulars on the right.”"),
            _in("pt-room", "folk.salaryman", [4, 6], "An intern, rehearsing under his breath. “In conclusion. In conclusion…”"),
            _in("pt-room", "folk.officewoman", [11, 6], "An intern with a stack of cue cards, very pale. “Is it my turn? It's not my turn.”"),
        ],
        "maps": {mid: _with_lift(mid, plan, *({"roof": ([6, 2], [5, 2])}.get(mid, ()))) for mid, plan in (
            ("sales3", _sales3()), ("resources", _resources()), ("meeting", _meeting()), ("finance", _finance()), ("hr", _hr()),
            ("audit", _audit()), ("board-room", _board_room()), ("exec-floor", _exec_floor()), ("pt-room", _pt_room()), ("roof", _roof()))},
        "objectives": {
            k(2): "Your first day at One International. Get through the front desk.",
            k(3): "Take the lift up to Sales Team 3.",
            k("3b"): "Search the lobby for the rest of the waybill.",
            k("4b"): "The client's president has come to One International. Go to the meeting room.",
            k(5): "Go to Sun Ji-young's desk.",
            k(6): "Go to the PT room. It's your pair's turn to present.",
            k(7): "Go back to the PT room for the individual test.",
            k(8): "Take the plan to finance yourself.",
            k(9): "Go back to your desk.",
            k(10): "Go to Kim Dong-sik's desk. There's homework.",
            k(11): "Go to Sun Ji-young's desk.",
            k(13): "Go to the audit room before the auditors pack up.",
            k(14): "Go up to the executive's office.",
            k(17): "Set the board room for the Jordan briefing.",
            k(19): "Go up to the roof.",
            k(21): "The team's phone is ringing.",
            k(22): "Go up to the executive's office.",
            k(23): "Go to Oh's desk.",
        },
    },

    # =========================================================================================
    # The Korea Baduk Association (Hongik-dong): the front office, and through it the trainees' room, rows of boards.
    "Korea Baduk Association": {
        "archetype": "city",
        "plan": _street([12, 8], 5, things=[
            {"id": "kba", "kind": "building.office_block", "rect": [4, 3, 3, 2], "door": "S", "label": "The Korea Baduk Association",
             "map": "kba-front", "plaque": "한국기원"},
            {"id": "block-w", "kind": "building.office_block", "rect": [1, 3, 2, 2], "door": "S"},
            {"id": "block-e", "kind": "building.office_block", "rect": [8, 3, 2, 2], "door": "S"},
            {"id": "shop-1", "kind": "building.storefront", "rect": [2, 6, 2, 1], "door": "N"},
            {"id": "shop-2", "kind": "building.storefront", "rect": [7, 6, 2, 1], "door": "N"},
        ], exits=[{"to": "Jongno", "at": [11, 5], "side": "E"}], entries={"": [5, 5], "Jongno": [10, 5]},
            dress=[{"kind": "tree.ginkgo", "along": "street", "every": 4}]),
        "states": [{"id": "dawn", "light": "morning"}],
        "npcs": [
            _talk("folk.kid", [6, 5], "A boy of ten with a go book under his arm, running late."),
            _in("kba-front", "folk.salaryman", [6, 2], "A man at the front desk. “Trainees go straight through. You know the way.”",
                behind="desk", label="The KBA's front desk", until=f"node:{k(17)}"),
            # the ₩100,000 mission (m18): the staff member who knew him as a trainee. Any offer is refused: the rebuke
            _in("kba-front", "folk.salaryman", [6, 2], "The man at the front desk looks up, and knows you.", behind="desk",
                label="A KBA staff member", id="kba-staff", when=f"node:{k(17)}", until=f"node:{k(18)}",
                buyer={"wants": ["socks"], "pays": 0,
                       "no": ["“Geu-rae? You've come here to sell? I'd buy whatever you brought. Out of pity, to encourage you, to cheer "
                              "you on, any of it. Could you call that doing your job?”"]}),
            *[_in("kba-trainees", "folk.kid", at, say) for at, say in (
                ([2, 3], "A trainee, eleven or twelve, replaying a game from a book, stone by stone."),
                ([10, 3], "Two trainees bent over a board. Neither has spoken for an hour."),
                ([12, 5], "A girl in a school uniform counts the score twice."),
                ([4, 7], "A trainee packs his stones away. “Next month. There's always next month.”"))],
        ],
        "maps": {
            "kba-front": room([12, 8], [6, 7], exits=[{"to": "kba-trainees", "at": [9, 0], "side": "N"}], things=[
                {"id": "trophies-1", "kind": "furn.trophy_case", "rect": [1, 1, 1, 1], "label": "Trophies and photographs of the pros"},
                {"id": "trophies-2", "kind": "furn.trophy_case", "rect": [2, 1, 1, 1]},
                {"id": "desk", "kind": "furn.reception", "rect": [5, 3, 2, 1], "label": "The front desk"},
                {"id": "notices", "kind": "furn.noticeboard", "rect": [10, 3, 1, 1], "label": "The trainees' rankings"},
                {"id": "sofa", "kind": "furn.sofa", "rect": [1, 5, 1, 1]},
            ], floor="office_tile") | {"label": "The Korea Baduk Association"},
            # the trainees' room (m1): three rows of boards on the floor, a clock on the wall
            "kba-trainees": room([16, 10], [8, 9], floor="wood", things=[
                *[{"id": f"board-{x}-{y}", "kind": "furn.go_board", "rect": [x, y, 1, 1]}
                  for y in (2, 4, 6) for x in (2, 4, 6, 10, 12, 14)],
            ], spots=[{"id": "m1", "at": [7, 6], "node": k(1), "label": "The trainees' room"}]) | {"label": "The trainees' room"},
        },
        "objectives": {k(1): "Go to the trainees' room. This game decides everything."},
    },

    # =========================================================================================
    # Baekjin Trading: a lane of small offices. Park's coached clerk keeps the door (m12, blocking); a courier goes by.
    "Baekjin Trading": {
        "archetype": "city",
        "plan": _street([16, 8], 5, things=[
            {"id": "baekjin", "kind": "building.office_block", "rect": [9, 3, 2, 2], "door": "S", "label": "Baekjin Trading",
             "map": "baekjin", "plaque": "백진무역"},
            {"id": "block-1", "kind": "building.office_block", "rect": [2, 3, 2, 2], "door": "S"},
            {"id": "block-2", "kind": "building.office_block", "rect": [5, 3, 2, 2], "door": "S"},
            {"id": "block-3", "kind": "building.office_block", "rect": [12, 3, 2, 2], "door": "S"},
            {"id": "shop-1", "kind": "building.storefront", "rect": [3, 6, 2, 1], "door": "N"},
            {"id": "shop-2", "kind": "building.storefront", "rect": [10, 6, 2, 1], "door": "N"},
        ], exits=[{"to": "Jongno", "at": [0, 5], "side": "W"}], entries={"": [1, 5], "Jongno": [1, 5]},
            dress=[{"kind": "prop.scooter", "along": "street", "every": 6}, {"kind": "lamp.post", "along": "street", "every": 4}]),
        "states": [{"id": "day", "light": "day"}],
        "npcs": [
            _in("baekjin", "folk.officewoman", [3, 4], "A clerk who won't meet your eye. “The figures are all in order. Mr Park went through them with us.”"),
            _in("baekjin", "folk.salaryman", [8, 4], "A man at the window, on the phone. He turns his back."),
        ],
        "maps": {
            "baekjin": room([12, 8], [6, 7], floor="carpet", things=[
                *_desks([(2, 2), (3, 2), (8, 2), (9, 2)]),
                {"id": "boss-desk", "kind": "furn.exec_desk", "rect": [5, 1, 2, 1], "label": "The manager's desk"},
                {"id": "filing-1", "kind": "furn.filing", "rect": [1, 4, 1, 1]},
                {"id": "filing-2", "kind": "furn.filing", "rect": [1, 5, 1, 1]},
                {"id": "boxes", "kind": "furn.boxes", "rect": [10, 5, 1, 1]},
            ], spots=[{"id": "m12", "at": [6, 4], "node": k(12), "label": "Baekjin Trading"},
                      {"id": "clue-coached", "at": [3, 5], "label": "Baekjin's clerk", "note": "the audit board: the staff Park coached"}])
            | {"label": "Baekjin Trading"},
        },
        "objectives": {k(12): "Go to Baekjin Trading with Kim Dong-sik."},
    },

    # =========================================================================================
    # Sun's neighbourhood: her block of flats (m20, a cutaway) and the daycare down the street (m5).
    "Sun's neighbourhood": {
        "archetype": "city",
        "plan": _street([14, 8], 5, things=[
            {"id": "flats", "kind": "building.apartment", "rect": [2, 3, 3, 2], "door": "S", "label": "Sun Ji-young's block",
             "map": "sun-flat", "plaque": "103동"},
            {"id": "daycare", "kind": "building.storefront", "rect": [7, 4, 2, 1], "door": "S", "label": "The daycare", "map": "daycare"},
            {"id": "villa", "kind": "building.villa", "rect": [10, 3, 2, 2], "door": "S"},
            {"id": "shop-1", "kind": "building.storefront", "rect": [3, 6, 2, 1], "door": "N"},
            {"id": "shop-2", "kind": "building.storefront", "rect": [9, 6, 2, 1], "door": "N"},
        ], ground=[{"id": "playground", "kind": "garden", "rect": [12, 1, 2, 3]}],
            exits=[{"to": "Jongno", "at": [0, 5], "side": "W"}], entries={"": [8, 5], "Jongno": [1, 5]},
            dress=[{"kind": "tree.ginkgo", "along": "street", "every": 4}, {"kind": "prop.bench", "in": "playground", "count": 2}]),
        "states": [{"id": "evening", "light": "dusk"}],
        "npcs": [_talk("folk.ajumma", [6, 5], "A mother with a pushchair. “The daycare closes at seven. On the dot.”"),
                 _in("daycare", "folk.officewoman", [5, 2], "The teacher. “You're here for Somi? Her mother rang. You must be from her office.”",
                     label="The teacher"),
                 _in("daycare", "folk.kid", [3, 4], "A small boy with a toy car. “Are you somebody's dad?”")],
        "maps": {
            "daycare": room([12, 8], [6, 7], floor="lino", things=[
                {"id": "toys-1", "kind": "furn.toy_shelf", "rect": [1, 1, 1, 1]},
                {"id": "toys-2", "kind": "furn.toy_shelf", "rect": [2, 1, 1, 1]},
                {"id": "toys-3", "kind": "furn.toy_shelf", "rect": [9, 1, 1, 1]},
                {"id": "mat-1", "kind": "furn.kid_mat", "rect": [2, 3, 1, 1]},
                {"id": "mat-2", "kind": "furn.kid_mat", "rect": [3, 3, 1, 1]},
                {"id": "table", "kind": "furn.low_table", "rect": [8, 4, 1, 1]},
            ], spots=[{"id": "m5b", "at": [6, 4], "node": k("5b"), "label": "The daycare"}]) | {"label": "The daycare"},
            "sun-flat": room([12, 8], [6, 7], floor="lino", things=[
                {"id": "tv", "kind": "furn.tv", "rect": [2, 1, 1, 1]},
                {"id": "sofa", "kind": "furn.sofa", "rect": [2, 3, 1, 1]},
                {"id": "table", "kind": "furn.table", "rect": [8, 3, 1, 1], "label": "The kitchen table"},
                {"id": "wardrobe", "kind": "furn.wardrobe", "rect": [10, 1, 1, 1]},
                {"id": "toys", "kind": "furn.toy_shelf", "rect": [5, 1, 1, 1]},
            ], spots=[{"id": "m20", "at": [6, 5], "node": k(20), "label": "Sun Ji-young's flat"}]) | {"label": "Sun Ji-young's flat"},
        },
        "objectives": {k("5b"): "Collect Somi from the daycare before it closes."},
    },

    # =========================================================================================
    # The pizza shop: Kim Dong-su's, empty, across from a big mart (m16).
    "The pizza shop": {
        "archetype": "city",
        "plan": _street([12, 8], 5, things=[
            {"id": "pizza", "kind": "building.storefront", "rect": [3, 4, 2, 1], "door": "S", "label": "Kim Dong-su's pizza shop",
             "map": "pizza"},
            {"id": "mart", "kind": "building.mart", "rect": [7, 3, 3, 2], "door": "S", "label": "A big mart"},
            {"id": "shop-1", "kind": "building.storefront", "rect": [2, 6, 2, 1], "door": "N"},
            {"id": "shop-2", "kind": "building.storefront", "rect": [6, 6, 2, 1], "door": "N"},
        ], exits=[{"to": "Jongno", "at": [0, 5], "side": "W"}], entries={"": [4, 5], "Jongno": [1, 5]},
            dress=[{"kind": "prop.scooter", "at_door": "pizza"}, {"kind": "tree.ginkgo", "along": "street", "every": 4}]),
        "states": [{"id": "evening", "light": "dusk"}],
        "npcs": [_talk("folk.ajumma", [9, 5], "A woman pushing a trolley out of the mart. “Two pizzas for the price of one, in there.”")],
        "maps": {
            "pizza": room([12, 7], [6, 6], floor="office_tile", things=[
                {"id": "oven", "kind": "furn.pizza_oven", "rect": [2, 1, 1, 1]},
                {"id": "counter", "kind": "furn.counter", "rect": [4, 2, 2, 1], "label": "The counter"},
                {"id": "table-1", "kind": "furn.table", "rect": [9, 2, 1, 1]},
                {"id": "table-2", "kind": "furn.table", "rect": [9, 4, 1, 1]},
                {"id": "stool-1", "kind": "furn.stool", "rect": [10, 2, 1, 1]},
            ], spots=[{"id": "m16", "at": [6, 4], "node": k(16), "label": "The pizza shop"}]) | {"label": "Kim Dong-su's pizza shop"},
        },
        "objectives": {k(16): "Kim Dong-su has asked you to come by his shop."},
    },

    # =========================================================================================
    # The new office (m24): Oh's new company, three weeks old, upstairs on a narrow street.
    "The new office": {
        "archetype": "city",
        "plan": _street([10, 7], 4, things=[
            {"id": "office", "kind": "building.office_block", "rect": [4, 2, 2, 2], "door": "S", "label": "The new office", "map": "new-office"},
            {"id": "block-w", "kind": "building.office_block", "rect": [1, 2, 2, 2], "door": "S"},
            {"id": "block-e", "kind": "building.office_block", "rect": [7, 2, 2, 2], "door": "S"},
            {"id": "shop", "kind": "building.storefront", "rect": [3, 5, 2, 1], "door": "N"},
        ], exits=[{"to": "Jongno", "at": [0, 4], "side": "W"}], entries={"": [5, 4], "Jongno": [1, 4]},
            dress=[{"kind": "lamp.post", "along": "street", "every": 4}]),
        "states": [{"id": "day", "light": "day"}],
        "maps": {
            "new-office": room([12, 8], [6, 7], floor="carpet", things=[
                {"id": "board", "kind": "furn.whiteboard", "rect": [2, 1, 1, 1], "label": "A whiteboard: JORDAN"},
                {"id": "oh-desk", "kind": "furn.office_desk", "rect": [5, 2, 1, 1], "label": "Oh's desk"},
                *_desks([(2, 3), (3, 3), (8, 3), (9, 3)]),
                {"id": "boxes-1", "kind": "furn.boxes", "rect": [9, 1, 1, 1], "label": "Boxes not yet unpacked"},
                {"id": "boxes-2", "kind": "furn.boxes", "rect": [10, 1, 1, 1]},
            ], spots=[{"id": "m24", "at": [6, 4], "node": k(24), "label": "The new office"}]) | {"label": "The new office"},
        },
        "objectives": {k(24): "Three weeks later. Go to the new office."},
    },

    # =========================================================================================
    # Amman: one street of pale stone, reached only by the epilogue's handoff (m24). A café player at his board.
    "Amman": {
        "archetype": "city",
        "plan": _street([16, 8], 4, things=[
            *[{"id": f"house-n{i}", "kind": "building.stone_house", "rect": [x, 2, 2, 2], "door": "S"} for i, x in enumerate((1, 4, 10, 13))],
            {"id": "cafe", "kind": "building.stone_shop", "rect": [7, 3, 2, 1], "door": "S", "label": "A café"},
            *[{"id": f"house-s{i}", "kind": "building.stone_house", "rect": [x, 5, 2, 2], "door": "N"} for i, x in enumerate((2, 6, 12))],
        ], exits=[], entries={"": [1, 4]},
            spots=[{"id": "amman", "at": [8, 4], "label": "A street in Amman", "note": "m24's handoff lands here"}],
            dress=[{"kind": "tree.olive", "along": "street", "every": 5}, {"kind": "lamp.post", "along": "street", "every": 6}]),
        "states": [{"id": "sun", "light": "day", "weather": "clear"}],
        "npcs": [_talk("folk.jordanian", [5, 4], "A man selling coffee from a brass pot. “Korean? The traders from Seoul come every month now.”")],
    },
}

# Road challengers: 10, 3 blocking (misaeng-arc.md, "Road challengers")
PLANS_MS["The subway"]["challengers"] = [
    # Susaek-dong to Jongno (m2): a commuter with a pocket board in the aisle at the Jongno doors (blocking)
    _ch("commuter", "folk.salaryman", [21, 3], f"node:{k(1)}", f"node:{k(2)}",
        "A man in a grey suit stands in the doorway with a magnetic pocket board, a problem half-solved. “Excuse me. Do you play? "
        "I've been stuck on this since Hapjeong.”",
        "“…Oh. Of course. Thank you. This is my stop too.”", "The man with the pocket board is on the next problem.",
        blocks={"exit": "Jongno"}, view=1, guard="to-Jongno"),
]
PLANS_MS["Jongno"]["challengers"] = [
    # Tapgol Park's regulars: one on the first morning (m2), two when Jang goes out with Park Jong-gi (m4)
    _ch("regular-1", "folk.grandpa", [3, 5], f"node:{k(1)}", f"node:{k(2)}",
        "An old man at the stone table waves you over without looking up. “You. You've got a player's hands. Sit.”",
        "“Hm. Where did you learn that? Go on, go to work.”", "The old man is playing someone else now."),
    _ch("regular-2", "folk.grandpa", [8, 5], f"node:{k(3)}", f"node:{k(4)}",
        "An old man in a flat cap sets out the stones. “A young man in a tie, at Tapgol? Sit down, it's free.”",
        "“…Again tomorrow. Same time.”", "The old man in the flat cap is asleep on the bench."),
    _ch("regular-3", "folk.grandpa", [5, 5], f"node:{k(3)}", f"node:{k(4)}",
        "The man who keeps the score for everyone. “Nobody's beaten him all week. Want to try?”",
        "“Huh. Wait till I tell him.”", "The scorekeeper is telling everyone about your game."),
    # the ₩100,000 mission (m18): the corner-shop owner at his door (blocking); two passers-by who play
    _ch("shop-owner", "folk.salaryman", [20, 7], f"node:{k(17)}", f"node:{k(18)}",
        "The corner-shop owner leans in his doorway. “Selling on my pavement, are you? Let's see if you can sell to me.”",
        "“…Not bad. Not good enough, but not bad.”", "The corner-shop owner is selling dried squid, faster than you.",
        blocks="m18", view=1, guard=[21, 7]),
    # (the same man is the mission's rival seller: talked to while it's on, he out-sells you; tk-modern.js "rival")
    _ch("passer-1", "folk.salaryman", [10, 10], f"node:{k(17)}", f"node:{k(18)}",
        "An office worker on his lunch break stops at your box. “What are you selling? Tell you what: a game first.”",
        "“Fine. I'll take one. Don't tell my wife.”", "The office worker has gone back in."),
    _ch("passer-2", "folk.officewoman", [24, 10], f"node:{k(17)}", f"node:{k(18)}",
        "A woman with a go app open on her phone. “You're the one from the Baduk Association, aren't you? I've seen your face.”",
        "“…I must have been wrong. Good luck.”", "The woman is back on her phone."),
]
PLANS_MS["Baekjin Trading"]["challengers"] = [
    # to Baekjin Trading (m12): Park's coached clerk at the door (blocking); a courier
    _ch("clerk", "folk.salaryman", [9, 5], f"node:{k(11)}", f"node:{k(12)}",
        "A clerk steps out of Baekjin's door as you come up. “Sales Team 3? Mr Park said you might come. Everything's in order. "
        "There's nothing to see.”",
        "“…Go in, then. It's not my business.”", "The clerk has gone back to his desk.", blocks="baekjin", view=1, guard="door"),
    _ch("courier", "folk.salaryman", [4, 5], f"node:{k(11)}", f"node:{k(12)}",
        "A courier sits on his scooter, a board balanced on the box. “Ten minutes till my next drop. One game?”",
        "“Ha! Good one.”", "The courier has gone."),
]
PLANS_MS["Amman"]["challengers"] = [
    # m24: a café player
    _ch("cafe-player", "folk.jordanian", [9, 5], f"node:{k(23)}", None,
        "A man at the café table has a go board out among the coffee cups. “A Korean! Sit. My cousin taught me in Seoul.”",
        "“Next time you come, I'll be better.”", "The man at the café is teaching his nephew."),
]
del PLANS_MS["Amman"]["challengers"][0]["until"]   # the epilogue: he stays
PLANS_MS["Jongno"]["challengers"][3]["rival"] = {"say": [
    "The corner-shop owner calls out to the same people you were about to ask. “Dried squid! Grilled while you wait!” They go to him.",
    "“Look at you. Holding them out like you're apologising. Selling's not begging, son.”"]}

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}
ZH_PLACES_MS = {}   # English only (the user: "we dont need chinese lines for this")
