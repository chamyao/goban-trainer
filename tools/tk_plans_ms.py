"""Misaeng (미생), Season 1, as plan grids (docs/book2/plan-grid.md). English only (the user: "we dont need chinese lines
for this").

Design: docs/book2/misaeng-arc.md (Plot alt2); Misaeng is five books on worlds 21-25. World 21 is Book 1, "Not Yet
Alive" (episodes 0-33; the story is tools/tk_story_w21.py, WORLD21): beat keys m1 ... m20 and m13b, written here as
"21-m1" ... (the prefix is the world, so nothing is renamed). Each book is a config over the same places (see book()). Research: docs/book2/misaeng-research.md. The engine's keys: docs/book2/misaeng-engine.md (Integration alt2).

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
    Daehanmun (Deoksugung's gate on the main road: the memorial tent, Book 1's last morning)
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
             "prop.memorial_tent": (4, 2, True),       # a white memorial tent: portraits, chrysanthemums (Daehanmun, Book 1's end)
             "prop.machine": (4, 2, True),             # a plant's machine on the floor (Ulsan)
             "furn.cleaning_cupboard": (1, 1, True),   # a narrow steel cupboard: mop, bucket (Sales 3, m14)
             "prop.spill": (1, 1, False),              # a coffee spill trodden into the carpet, walked over (Sales 3, m14)
             "building.palace_gate": (6, 3, False),    # Daehanmun: the gate in Deoksugung's wall, walked through under its roof
             "furn.cloth_bolts": (2, 1, True),         # bolts of cloth on a rack, sample books below (the textile floor)
             # the board room's drinks (m17), each shown on the table once set down
             "prop.glass_water": (1, 1, False),
             "prop.teacup": (1, 1, False),
             "prop.coffee_cup": (1, 1, False),
             }
LINE_KINDS = {**LINE_KINDS2,
              "wall.palace": (False, True),   # Deoksugung's wall (Daehanmun)
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
       "building.palace_gate": "Daehanmun, Deoksugung's main gate: three red bays, a tiled hipped roof with painted eaves and a "
                               "name board, on a stone base with steps; stands in the palace wall's gap, walked through",
       "furn.cloth_bolts": "bolts of coloured cloth on a steel rack, sample books on the bottom shelf",
       "wall.palace": "Deoksugung's wall: a stone base, plastered wall, a tiled coping on top",
       "furn.cleaning_cupboard": "a narrow grey steel cleaning cupboard against an office wall, its door ajar on a mop and a yellow bucket",
       "prop.spill": "a brown coffee stain trodden across grey office carpet, a paper cup on its side; a floor decal, walked over",
       "prop.machine": "an industrial machine on a plant floor in Ulsan: a steel press or a lathe in safety yellow and grey, "
                       "pipes and a control panel; four tiles long, two deep",
       "prop.memorial_tent": "a white Korean memorial tent (분향소) on a plaza: a white canopy on poles, a long table in white cloth "
                             "with framed black-and-white portraits, white chrysanthemums laid in rows, incense; four tiles wide",
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
# =========================================================================================
# How this file is built. Misaeng is five books (worlds 21-25, Plot alt2's misaeng-arc.md), all on the same places. So
# the places are written once, with no beats in them (the builders below), and each book is a config (BOOK1 ...) that
# says which places and tower floors it uses, and adds its own beat spots, mechanics, people, challengers, lights and
# objectives. book(cfg) puts them together; an exit to a place the book doesn't use is left out.
#   cfg["spots"]:   {"Place" or "Place/map": [spots]}        cfg["npcs"]: {"Place": [people]} (rooms by "place")
#   cfg["challengers"]: {"Place": [...]}  cfg["states"]: {"Place" or "Place/map": [states]}  cfg["objectives"]: {key: text}
# Fragments a later book reuses (the audit board's clues, the board room's seats, the trade loop) are functions below.

# the tower's floors: id -> (storey, label, builder); a book's lift lists only the floors it uses
def _floors():
    return {"general-affairs": ("2F", "General Affairs", _general_affairs),
            "pt-room": ("3F", "The PT room", _pt_room), "hr": ("5F", "HR", _hr), "finance": ("6F", "Finance", _finance),
            "textile": ("8F", "The textile team", _textile), "resources": ("9F", "The resources team", _resources),
            "sales3": ("14F", "Sales Team 3", _sales3), "meeting": ("15F", "A meeting room", _meeting),
            "audit": ("16F", "The audit room", _audit), "board-room": ("20F", "The board room", _board_room),
            "exec-floor": ("21F", "The executive's office", _exec_floor), "roof": ("R", "The roof", _roof)}


LOBBY = "one-international"


def _lift_floors(floors):
    F = _floors()
    return [{"label": "1F · The lobby", "to": LOBBY}, *[{"label": f"{F[m][0]} · {F[m][1]}", "to": f"{LOBBY}--{m}"} for m in floors]]


def _with_lift(mid, plan, floors, at=None, doors_at=None):
    """A floor with its lift: the lift's doors by the floor's own door (which is the stairs down to the lobby), the
    spot that opens its menu, and arrivals by lift (from the lobby or any floor) at it."""
    w, h = plan["grid"]
    door = plan["entries"][""]
    at = at or [door[0] - 2, h - 2]
    doors_at = doors_at or [at[0] - 1, at[1]]
    return {**plan, "things": [*plan["things"], {"id": "lift-doors", "kind": "furn.lift_door", "rect": [*doors_at, 1, 1], "label": "The lift"}],
            "spots": [*plan.get("spots", []), {"id": "lift", "at": at, "label": "The lift", "use": "lift", "floors": _lift_floors(floors)}],
            "entries": {**plan["entries"], "One International": at, **{m: at for m in floors if m != mid}}}


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


def _give(sid, at, label, item, when, give, given):
    """A thing that gives an item when searched (the bins, a table, the copier): a spot with "gives"."""
    return {"id": sid, "at": at, "label": label, "gives": item, "gives_when": when, "give": [give], "given": [given]}


def _deliver(sid, at, label, item, mark, when, deliver, waiting, delivered=None, set_down=False):
    """A handoff: it takes the item from the bag and sets its mark. It's made to whoever stands within 64 px of it (the
    engine's rule), so the book stands its recipient beside it while it's open (the build fails a delivery with no one
    there: apo110 handed things "to circles not people"), unless it's set down at a place ("set_down": a seat)."""
    return {"id": sid, "at": at, "label": label, "needs": [f"item:{item}"], "when": when, "delivers": mark, "takes": True,
            "deliver": [deliver], "waiting": [waiting], "delivered": [delivered or deliver], **({"set_down": True} if set_down else {})}


# =========================================================================================
# The tower's floors (One International): each a room whose door (the stairs) leads back to the lobby
def _sales3():
    """Sales Team 3's floor: three islands of desks, each with its head's desk at the end. Sales Team 1 (Sun's) on
    the west, Sales Team 3 in the middle (Oh's desk at its head, Jang's the last at the foot), another team east; the
    copier and the pantry's coffee machine on the north wall, the filing cabinets."""
    return room([18, 12], [9, 11], floor="carpet", things=[
        {"id": "copier", "kind": "furn.copier", "rect": [2, 1, 1, 1], "label": "The copier"},
        {"id": "cooler", "kind": "furn.water_cooler", "rect": [5, 1, 1, 1], "label": "The pantry: coffee and water"},
        {"id": "board-1", "kind": "furn.whiteboard", "rect": [7, 1, 1, 1], "label": "Sales Team 3's whiteboard"},
        {"id": "filing-1", "kind": "furn.filing", "rect": [13, 1, 1, 1], "label": "The filing cabinets"},
        {"id": "filing-2", "kind": "furn.filing", "rect": [14, 1, 1, 1]},
        {"id": "plant-n", "kind": "furn.plant", "rect": [16, 1, 1, 1]},
        # Sales Team 1: Sun Ji-young's island
        *_desks([(2, 4), (3, 4), (2, 5), (3, 5)]),
        {"id": "sun-desk", "kind": "furn.office_desk", "rect": [4, 4, 1, 2], "label": "Sun Ji-young's desk"},
        # Sales Team 3
        {"id": "desk-deputy", "kind": "furn.office_desk", "rect": [8, 4, 1, 1], "label": "The deputy's desk"},
        {"id": "desk-spare", "kind": "furn.office_desk", "rect": [9, 4, 1, 1]},
        {"id": "desk-kim", "kind": "furn.office_desk", "rect": [9, 5, 1, 1], "label": "Kim Dong-sik's desk"},
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
    ]) | {"label": "Sales Team 3"}


def _textile():
    """The textile team's floor: two islands, bolts of cloth and sample books on shelves, Steve Han's desk by the window."""
    return room([14, 9], [7, 8], floor="carpet", things=[
        *_desks([(2, 3), (3, 3), (2, 4), (3, 4), (9, 3), (10, 3), (9, 4)]),
        {"id": "steve-desk", "kind": "furn.office_desk", "rect": [10, 4, 1, 1], "label": "Steve Han's desk"},
        {"id": "head", "kind": "furn.exec_desk", "rect": [6, 1, 2, 1], "label": "The team head's desk"},
        {"id": "samples-1", "kind": "furn.cloth_bolts", "rect": [1, 1, 1, 1], "label": "Bolts of cloth and sample books"},
        {"id": "samples-2", "kind": "furn.cloth_bolts", "rect": [2, 1, 1, 1]},
        {"id": "window", "kind": "furn.window", "rect": [11, 1, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [12, 7, 1, 1]},
    ]) | {"label": "The textile team"}


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
    ]) | {"label": "The resources team"}


def _meeting():
    return room([12, 8], [6, 7], floor="carpet", things=[
        {"id": "table", "kind": "furn.meeting_table", "rect": [5, 3, 2, 1], "label": "The meeting table"},
        *[{"id": f"chair-{x}-{y}", "kind": "furn.chair", "rect": [x, y, 1, 1]} for x, y in ((4, 3), (7, 3), (5, 2), (6, 2))],
        {"id": "board", "kind": "furn.whiteboard", "rect": [2, 1, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [10, 1, 1, 1]},
    ]) | {"label": "A meeting room"}


def _general_affairs():
    """General Affairs (총무팀): a counter, a clerk who takes requisitions, shelves of supplies."""
    return room([12, 8], [6, 7], floor="carpet", things=[
        {"id": "counter", "kind": "furn.reception", "rect": [5, 2, 2, 1], "label": "General Affairs' counter"},
        {"id": "shelf-1", "kind": "furn.store_shelf", "rect": [1, 1, 1, 1], "label": "Supplies: pens, sticky notes, glue sticks"},
        {"id": "shelf-2", "kind": "furn.store_shelf", "rect": [2, 1, 1, 1]},
        {"id": "boxes", "kind": "furn.boxes", "rect": [10, 1, 1, 1]},
        *_desks([(9, 4), (10, 4)]),
    ]) | {"label": "General Affairs"}


def _finance():
    return room([14, 9], [7, 8], floor="carpet", things=[
        {"id": "filing-1", "kind": "furn.filing", "rect": [1, 1, 1, 1]},
        {"id": "filing-2", "kind": "furn.filing", "rect": [2, 1, 1, 1]},
        {"id": "kim-desk", "kind": "furn.exec_desk", "rect": [6, 2, 2, 1], "label": "Kim Seon-ju's desk"},
        {"id": "filing-3", "kind": "furn.filing", "rect": [11, 1, 1, 1]},
        {"id": "filing-4", "kind": "furn.filing", "rect": [12, 1, 1, 1]},
        *_desks([(2, 4), (3, 4), (2, 5), (3, 5), (10, 4), (11, 4), (10, 5), (11, 5)]),
        {"id": "plant", "kind": "furn.plant", "rect": [12, 7, 1, 1]},
    ]) | {"label": "Finance"}


def _hr():
    return room([12, 8], [6, 7], floor="carpet", things=[
        *_desks([(2, 2), (3, 2), (8, 2), (9, 2)]),
        {"id": "hr-desk", "kind": "furn.exec_desk", "rect": [5, 2, 2, 1], "label": "The HR manager's desk"},
        {"id": "results", "kind": "furn.noticeboard", "rect": [1, 4, 1, 1], "label": "The noticeboard"},
        {"id": "filing", "kind": "furn.filing", "rect": [10, 4, 1, 1]},
        {"id": "plant", "kind": "furn.plant", "rect": [10, 6, 1, 1]},
    ]) | {"label": "HR"}


def _audit():
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
    ]) | {"label": "The audit room"}


SEATS = [(x, 3) for x in range(5, 11)] + [(x, 5) for x in range(5, 11)]   # the board room's places, north row then south


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
    ]) | {"label": "The board room"}


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
    ]) | {"label": "The executive's office"}


def _pt_room():
    """The training floor: the lectern and screen at the front, the interviewers' table to one side, and two rows of the
    interns' desks right across the room, with one aisle up the middle (x 7): the only way from the door to the front."""
    rows = [(x, y) for y in (5, 7) for x in (*range(1, 7), *range(8, 15))]
    return room([16, 10], [8, 9], floor="carpet", things=[
        {"id": "screen", "kind": "furn.projector_screen", "rect": [5, 1, 2, 1], "label": "The screen"},
        {"id": "lectern", "kind": "furn.lectern", "rect": [9, 2, 1, 1], "label": "The lectern"},
        {"id": "panel", "kind": "furn.meeting_table", "rect": [12, 2, 2, 1], "label": "The interviewers' table"},
        *[{"id": f"row-{x}-{y}", "kind": "furn.desk", "rect": [x, y, 1, 1]} for x, y in rows],
    ]) | {"label": "The PT room"}


def _roof():
    """The roof: a parapet round it, the door back down in its north side, the smokers' corner."""
    return {"grid": [16, 10], "cell": 2, "margin": 0, "label": "The roof",
            "ground": [{"id": "deck", "kind": "court", "rect": [0, 0, 16, 10]}],
            "lines": [{"id": "parapet", "kind": "parapet", "outline": [0, 0, 16, 10], "width": 1, "gates": {"door": [8, 0]}}],
            "things": [{"id": "stairhouse", "kind": "building.rooftop_box", "rect": [2, 1, 2, 2], "label": "The lift motor room"},
                       {"id": "tank", "kind": "prop.water_tank", "rect": [12, 1, 1, 1]},
                       {"id": "ashtray", "kind": "furn.ashtray", "rect": [12, 6, 1, 1], "label": "The smokers' corner"},
                       {"id": "bench-1", "kind": "prop.bench", "rect": [13, 6, 1, 1]},
                       {"id": "bench-2", "kind": "prop.bench", "rect": [4, 7, 1, 1]}],
            "spots": [], "exits": [], "entries": {"": [8, 1]},
            "states": [{"id": "day", "light": "day"}]}


LIFT_AT = {"roof": ([6, 2], [5, 2])}   # where a floor's lift isn't the default (beside its door)
LOBBY_W = 18


def _lobby(floors):
    """The lobby: the door from Jongno in the south; the front desk and the recycling bins on the visitors' side; the
    ID gates across the middle; behind them, the lift (its menu goes to every floor)."""
    w = LOBBY_W
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
                        {"id": "sofa-2", "kind": "furn.sofa", "rect": [w - 2, 8, 1, 1]},
                        {"id": "lift-w", "kind": "furn.lift_door", "rect": [w // 2 - 1, 1, 1, 1], "label": "The lift"},
                        {"id": "lift-e", "kind": "furn.lift_door", "rect": [w // 2 + 1, 1, 1, 1], "label": "The lift"}],
                spots=[{"id": "lift", "at": [w // 2, 1], "label": "The lift", "use": "lift", "floors": _lift_floors(floors)}])
    # the floors hang off the lobby (their doors, the stairs, come back down here); arrivals from them at the lift
    return plan | {"owns": list(floors), "entries": {**plan["entries"], **{m: [w // 2, 2] for m in floors}}}


# =========================================================================================
# The places, with no beats in them
def _places(floors):
    return {
        # Susaek-dong: a hillside of red-brick villas above the main road. Jang's home (his mother's room) and the
        # relatives' flat up the lanes; Susaek Station's stairs on the main road.
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
                    # behind the shops, the baduk class's front (a storefront's door is drawn on its south face)
                    {"id": "class-alley", "kind": "road", "path": [[4, 9], [4, 11], [7, 11]], "width": 2},
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
                    {"id": "baduk-class", "kind": "building.storefront", "rect": [6, 10, 2, 1], "door": "S", "label": "The neighbourhood baduk class",
                     "map": "baduk-class", "plaque": "바둑교실"},
                    {"id": "station", "kind": "building.subway_entrance", "rect": [12, 10, 2, 1], "door": "N",
                     "label": "Susaek Station", "to": "The subway"},
                ],
                "spots": [{"id": "home", "at": [4, 4], "at_door": "home", "label": "Jang's home", "note": "handoffs to Jang at home land here"}],
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
                _in("home", "folk.ajumma", [6, 3], "His mother looks up from the ironing. “Eat something before you go.”", label="His mother"),
                _in("relatives", "folk.salaryman", [8, 4], "An uncle, red in the face. “So what is it you do now, exactly? An intern? At your age?”"),
                _in("relatives", "folk.ajumma", [3, 5], "An aunt. “Our boy got into a big company. Regular, of course.”"),
            ],
            "maps": {
                "home": room([10, 7], [5, 6], floor="lino", things=[
                    {"id": "wardrobe", "kind": "furn.wardrobe", "rect": [1, 1, 1, 1]},
                    {"id": "mat", "kind": "furn.mat", "rect": [2, 1, 1, 1]},
                    {"id": "tv", "kind": "furn.tv", "rect": [7, 1, 1, 1]},
                    {"id": "table", "kind": "furn.low_table", "rect": [5, 3, 1, 1], "label": "The low table"},
                    {"id": "goban", "kind": "furn.go_board", "rect": [8, 4, 1, 1], "label": "His old go board"},
                ]) | {"label": "Jang's home"},
                "relatives": room([12, 8], [6, 7], floor="lino", exits=[{"to": "relatives-kitchen", "at": [11, 3], "side": "E"}], things=[
                    *[{"id": f"feast-{x}", "kind": "furn.low_table", "rect": [x, 3, 1, 1], **({"label": "The Chuseok table"} if x == 5 else {})}
                      for x in (4, 5, 6, 7)],
                    {"id": "tv", "kind": "furn.tv", "rect": [9, 1, 1, 1]},
                    {"id": "sofa", "kind": "furn.sofa", "rect": [1, 5, 1, 1]},
                ]) | {"label": "The relatives' flat"},
                "relatives-kitchen": room([6, 6], [0, 3], floor="lino", things=[
                    {"id": "counter", "kind": "furn.counter", "rect": [1, 1, 2, 1], "label": "The sink"},
                    {"id": "fridge", "kind": "furn.fridge_case", "rect": [4, 1, 1, 1]},
                ]) | {"label": "The kitchen"},
                # the neighbourhood baduk class where his uncle sent him: rows of boards, the teacher's desk, prizes
                "baduk-class": room([12, 8], [6, 7], floor="wood", things=[
                    *[{"id": f"board-{x}-{y}", "kind": "furn.go_board", "rect": [x, y, 1, 1]} for y in (2, 4) for x in (2, 4, 8, 10)],
                    {"id": "teacher-desk", "kind": "furn.desk", "rect": [6, 1, 1, 1], "label": "The teacher's desk"},
                    {"id": "prizes", "kind": "furn.trophy_case", "rect": [1, 6, 1, 1], "label": "Certificates and small trophies"},
                ]) | {"label": "The baduk class"},
            },
        },

        # The subway: one carriage, Susaek-dong's end to Jongno's.
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

        # Jongno: the avenue east-west, its carriageway crossed at two crosswalks. North: Tapgol Park, the One
        # International tower on its forecourt, a lane of offices (the client's, group HQ), the corner shop. South: Jongno
        # 3-ga Station's stairs, shopfronts, Pimatgol's alley with the pojangmacha, the market, a back lane.
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
                    {"id": "hof-lane", "kind": "road", "path": [[10, 12], [13, 12]], "width": 2},   # the hof's front, off Pimatgol
                    {"id": "market-alley", "kind": "road", "path": [[21, 10], [21, 15]], "width": 3},
                    {"id": "back-lane", "kind": "road", "path": [[0, 15], [27, 15]], "width": 2},
                ],
                "things": [
                    {"id": "pavilion", "kind": "building.pavilion", "rect": [2, 1, 2, 2], "label": "Palgakjeong"},
                    {"id": "pagoda", "kind": "landmark.pagoda", "rect": [8, 1, 2, 2], "label": "The ten-storey pagoda"},
                    {"id": "gotable-1", "kind": "furniture.gotable", "rect": [3, 4, 1, 1], "label": "A stone go table"},
                    {"id": "gotable-2", "kind": "furniture.gotable", "rect": [8, 4, 1, 1], "label": "A stone go table"},
                    {"id": "gotable-3", "kind": "furniture.gotable", "rect": [4, 5, 1, 1], "label": "A stone go table"},
                    {"id": "tower", "kind": "building.office_tower", "rect": [12, 1, 5, 5], "door": "S", "label": "One International",
                     "to": "One International", "plaque": "ONE INTERNATIONAL"},
                    {"id": "client", "kind": "building.office_block", "rect": [20, 2, 2, 2], "door": "S", "label": "The client's office",
                     "map": "client"},
                    {"id": "hq", "kind": "building.office_block", "rect": [23, 2, 2, 2], "door": "S", "label": "Group headquarters",
                     "map": "hq"},
                    {"id": "office-3", "kind": "building.office_block", "rect": [25, 0, 2, 2]},
                    {"id": "corner-shop", "kind": "building.storefront", "rect": [20, 6, 2, 1], "door": "S", "label": "The corner shop",
                     "map": "corner-shop"},
                    {"id": "phone-shop", "kind": "building.storefront", "rect": [23, 6, 2, 1], "door": "S", "label": "A phone shop"},
                    {"id": "cafe", "kind": "building.storefront", "rect": [25, 6, 2, 1], "door": "S", "label": "A café", "map": "cafe"},
                    {"id": "station", "kind": "building.subway_entrance", "rect": [1, 11, 2, 1], "door": "N",
                     "label": "Jongno 3-ga Station", "to": "The subway"},
                    {"id": "shop-s1", "kind": "building.storefront", "rect": [4, 11, 2, 1], "door": "N"},
                    {"id": "shop-s2", "kind": "building.storefront", "rect": [7, 11, 2, 1], "door": "N"},
                    {"id": "hof", "kind": "building.storefront", "rect": [10, 11, 2, 1], "door": "S", "label": "A hof", "map": "hof", "plaque": "호프"},
                    {"id": "shop-s4", "kind": "building.storefront", "rect": [15, 11, 2, 1], "door": "N"},
                    {"id": "shop-s5", "kind": "building.storefront", "rect": [25, 11, 2, 1], "door": "N"},
                    {"id": "pojangmacha", "kind": "building.pojangmacha", "rect": [14, 13, 2, 1], "door": "W", "label": "A pojangmacha",
                     "map": "pojangmacha"},
                    {"id": "eatery", "kind": "building.storefront", "rect": [11, 13, 2, 1], "door": "E", "label": "A soup house"},
                    {"id": "block-s1", "kind": "building.office_block", "rect": [1, 13, 2, 2], "door": "S"},
                    {"id": "sponsor", "kind": "building.office_block", "rect": [4, 13, 2, 2], "door": "S", "label": "The sponsor's office building",
                     "map": "sponsor-office"},
                    {"id": "block-s3", "kind": "building.villa", "rect": [7, 13, 2, 2], "door": "S"},
                    {"id": "block-s4", "kind": "building.office_block", "rect": [16, 13, 2, 2], "door": "S"},
                    {"id": "block-s5", "kind": "building.villa", "rect": [25, 13, 2, 2], "door": "S"},
                    {"id": "stalls-1", "kind": "market.stalls", "rect": [19, 12, 2, 1], "label": "Market stalls"},
                    {"id": "stalls-2", "kind": "market.stalls", "rect": [22, 12, 2, 1], "label": "Market stalls"},
                    {"id": "stalls-3", "kind": "market.stalls", "rect": [19, 14, 2, 1], "label": "A dried-goods stall"},
                    {"id": "stalls-4", "kind": "market.stalls", "rect": [22, 14, 2, 1]},
                    {"id": "car-1", "kind": "prop.car", "rect": [2, 8, 2, 1]},
                    {"id": "car-2", "kind": "prop.car", "rect": [9, 9, 2, 1]},
                    {"id": "car-3", "kind": "prop.car", "rect": [14, 8, 2, 1]},
                    {"id": "car-4", "kind": "prop.car", "rect": [23, 9, 2, 1]},
                ],
                "spots": [
                    {"id": "park-tables", "at": [5, 4], "label": "Tapgol Park's go tables", "note": "the regulars play here"},
                    {"id": "forecourt", "at": [16, 6], "label": "The forecourt", "note": "handoffs to the tower's forecourt land here"},
                ],
                "dress": [{"kind": "tree.ginkgo", "along": "pave-n", "every": 3},
                          {"kind": "tree.ginkgo", "along": "pave-s", "every": 3},
                          {"kind": "lamp.post", "along": "pimatgol", "every": 3}, {"kind": "lamp.post", "along": "back-lane", "every": 4},
                          {"kind": "tree.ginkgo", "along": "office-lane", "every": 4},
                          {"kind": "tree.pine", "in": "park", "count": 6}, {"kind": "prop.bench", "in": "park", "count": 3},
                          {"kind": "lamp.post", "along": "forecourt", "every": 3}, {"kind": "prop.vending", "at_door": "corner-shop"},
                          {"kind": "prop.bus_stop", "along": "pave-s", "every": 16}],
                # west to the KBA and Baekjin, east to Sun's neighbourhood, the pizza shop, the new office, and (by the
                # top lane) Daehanmun; a book keeps only the exits to places it uses
                "exits": [{"to": "Korea Baduk Association", "at": [0, 7], "side": "W"},
                          {"to": "Baekjin Trading", "at": [0, 10], "side": "W"},
                          {"to": "Daehanmun", "at": [0, 15], "side": "W"},
                          {"to": "Sun's neighbourhood", "at": [27, 10], "side": "E"},
                          {"to": "The pizza shop", "at": [27, 7], "side": "E"},
                          {"to": "The new office", "at": [27, 4], "side": "E"}],
                "entries": {"": [14, 7], "Korea Baduk Association": [1, 7], "Baekjin Trading": [1, 10], "Daehanmun": [1, 15],
                            "Susaek-dong": [2, 10],   # come by the subway: up the station's stairs
                            "Sun's neighbourhood": [26, 10], "The pizza shop": [26, 7], "The new office": [26, 4]},
            },
            "states": [{"id": "day", "light": "day"}],
            "npcs": [
                _talk("folk.grandpa", [7, 3], "An old man by the pagoda. “Sixty years I've come here. The stones don't change. We do.”"),
                _talk("folk.salaryman", [9, 7], "A man in a suit, on his phone, walking fast. “No, the shipment, the shipment—”"),
                _talk("folk.officewoman", [16, 10], "An office worker with a coffee in each hand. “Lunch is an hour. It's never an hour.”"),
                _talk("folk.ajumma", [21, 14], "A stallholder. “Dried squid, dried filefish. Cheaper than the shops, and better.”"),
                _talk("folk.ajumma", [13, 14], "An old woman setting out plastic stools. “Come back after dark, young man. That's when we're open.”"),
                _in("corner-shop", "folk.salaryman", [2, 3], "The owner, behind the till, doesn't look up from his paper.", behind="counter",
                    label="The corner-shop owner"),
                _in("pojangmacha", "folk.ajumma", [4, 2], "The woman at the cart. “Soju? Eomuk? Sit, sit.”", behind="cart"),
                _in("client", "folk.salaryman", [3, 4], "A clerk at the client's, smirking at his screen. He doesn't get up."),
                _in("client", "folk.officewoman", [9, 4], "A woman at the client's answers the phone. “He's in a meeting. He's always in a meeting.”"),
            ],
            "maps": {
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
                "client": room([12, 8], [6, 7], floor="carpet", things=[
                    *_desks([(2, 2), (3, 2), (8, 2), (9, 2)]),
                    {"id": "boss", "kind": "furn.exec_desk", "rect": [5, 1, 2, 1], "label": "The client's president's desk"},
                    {"id": "sofa", "kind": "furn.sofa", "rect": [2, 5, 1, 1]},
                    {"id": "table", "kind": "furn.low_table", "rect": [3, 5, 1, 1]},
                    {"id": "plant", "kind": "furn.plant", "rect": [10, 6, 1, 1]},
                ]) | {"label": "The client's office"},
                # the man who got him the job: an office high up, a desk, a sofa, a go board on a side table
                "sponsor-office": room([12, 8], [6, 7], floor="carpet", things=[
                    {"id": "desk", "kind": "furn.exec_desk", "rect": [5, 1, 2, 1], "label": "The sponsor's desk"},
                    {"id": "sofa-1", "kind": "furn.sofa", "rect": [2, 4, 1, 1]},
                    {"id": "sofa-2", "kind": "furn.sofa", "rect": [2, 5, 1, 1]},
                    {"id": "table", "kind": "furn.low_table", "rect": [3, 4, 1, 1]},
                    {"id": "goban", "kind": "furniture.gotable", "rect": [10, 4, 1, 1], "label": "A go board on a side table"},
                    {"id": "window", "kind": "furn.window", "rect": [9, 1, 1, 1]},
                ]) | {"label": "The sponsor's office"},
                # the café where the buyer waits (m8)
                "cafe": room([12, 8], [6, 7], floor="wood", things=[
                    {"id": "counter", "kind": "furn.counter", "rect": [8, 1, 2, 1], "label": "The counter"},
                    *[{"id": f"table-{x}-{y}", "kind": "furn.table", "rect": [x, y, 1, 1]} for x, y in ((2, 2), (2, 4), (5, 4), (9, 5))],
                    {"id": "plant", "kind": "furn.plant", "rect": [1, 6, 1, 1]},
                ]) | {"label": "A café on Jongno"},
                # the hof: long tables, pitchers, the interns' study night (m12)
                "hof": room([14, 8], [7, 7], floor="wood", things=[
                    {"id": "bar", "kind": "furn.counter", "rect": [1, 1, 2, 1], "label": "The bar"},
                    *[{"id": f"table-{x}-{y}", "kind": "furn.table", "rect": [x, y, 1, 1]} for x, y in ((4, 3), (6, 3), (10, 3), (4, 5), (10, 5))],
                    {"id": "fridge", "kind": "furn.fridge_case", "rect": [12, 1, 1, 1], "label": "Beer"},
                ]) | {"label": "The hof"},
                "hq": room([14, 8], [7, 7], floor="carpet", things=[
                    *[{"id": f"table-{i}", "kind": "furn.meeting_table", "rect": [4 + 2 * i, 3, 2, 1], **({"label": "The group's meeting table"} if i == 1 else {})}
                      for i in range(3)],
                    {"id": "screen", "kind": "furn.projector_screen", "rect": [6, 1, 2, 1], "label": "The screen"},
                    {"id": "plant", "kind": "furn.plant", "rect": [12, 1, 1, 1]},
                ]) | {"label": "Group headquarters"},
                "pojangmacha": room([10, 6], [5, 5], floor="earth", spots=[
                    {"id": "pojangmacha", "at": [6, 4], "label": "The pojangmacha", "note": "handoffs into the tent land here"},
                ], things=[
                    {"id": "cart", "kind": "furn.counter", "rect": [3, 1, 2, 1], "label": "The cart: eomuk, soju"},
                    {"id": "table-1", "kind": "furn.plastic_table", "rect": [2, 3, 1, 1]},
                    {"id": "table-2", "kind": "furn.plastic_table", "rect": [7, 3, 1, 1]},
                    {"id": "table-3", "kind": "furn.plastic_table", "rect": [7, 1, 1, 1]},
                    {"id": "stool-1", "kind": "furn.stool", "rect": [3, 3, 1, 1]},
                    {"id": "stool-2", "kind": "furn.stool", "rect": [6, 3, 1, 1]},
                ]) | {"label": "The pojangmacha", "states": [{"id": "night", "light": "night"}]},
            },
        },

        # One International: inside the tower. Its plan is the lobby; the floors are its rooms, reached by the lift.
        "One International": {
            "id": "one-international",
            "archetype": "interior",
            "plan": _lobby(floors) | {"label": "One International"},
            "states": [{"id": "day", "light": "day"}],
            "npcs": [
                {"id": "receptionist", "kind": "folk.officewoman", "at": [13, 5], "behind": "reception", "face": "S", "label": "The receptionist",
                 "say": "“Visitor passes are issued here. Who are you here to see?”"},
                _talk("folk.salaryman", [6, 5], "A security guard by the ID gates. “Card on the reader, please. One at a time.”", label="Security"),
                _talk("folk.salaryman", [8, 2], "Someone waiting for a lift taps his card against his leg. “Come on, come on.”"),
                *[p for p in (
                    _in("sales3", "folk.officewoman", [14, 6], "A woman from the next team. “Sales Team 3? They're the ones who work through lunch.”"),
                    _in("sales3", "folk.salaryman", [3, 7], "A deputy from Sales Team 1, reading a fax. “Another intern? We used to get six a year.”"),
                    _in("finance", "folk.salaryman", [10, 6], "A finance clerk. “If it isn't on the form, it doesn't exist.”"),
                    _in("hr", "folk.officewoman", [8, 4], "Someone from HR, stacking contracts. “Two-year contracts are on the left. Regulars on the right.”"),
                    _in("textile", "folk.salaryman", [4, 6], "Someone from the textile team, a swatch in each hand. “Navy, or midnight? The buyer says they're different.”"),
                ) if p["place"] in floors],
            ],
            "maps": {m: _with_lift(m, _floors()[m][2](), floors, *LIFT_AT.get(m, ())) for m in floors},
        },

        # The Korea Baduk Association (Hongik-dong): the front office, and through it the trainees' room.
        "Korea Baduk Association": {
            "archetype": "city",
            "plan": _street([12, 8], 5, things=[
                {"id": "kba", "kind": "building.office_block", "rect": [4, 3, 3, 2], "door": "S", "label": "The Korea Baduk Association",
                 "map": "kba-front", "plaque": "한국기원"},
                {"id": "block-w", "kind": "building.office_block", "rect": [1, 3, 2, 2], "door": "S"},
                {"id": "block-e", "kind": "building.office_block", "rect": [8, 3, 2, 2], "door": "S"},
                {"id": "kba-cafe", "kind": "building.storefront", "rect": [2, 6, 2, 1], "door": "S", "label": "A café across the street",
                 "map": "kba-cafe"},
                {"id": "shop-2", "kind": "building.storefront", "rect": [7, 6, 2, 1], "door": "N"},
            ], exits=[{"to": "Jongno", "at": [11, 5], "side": "E"}], entries={"": [5, 5], "Jongno": [10, 5]},
                dress=[{"kind": "tree.ginkgo", "along": "street", "every": 4}],
                # down the side and round to the café's front (a storefront's door is drawn on its south face)
                lines=[{"id": "cafe-alley", "kind": "road", "path": [[1, 5], [1, 7], [3, 7]], "width": 2}]),
            "states": [{"id": "dawn", "light": "morning"}],
            "npcs": [
                _talk("folk.kid", [6, 5], "A boy of ten with a go book under his arm, running late."),
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
                "kba-trainees": room([16, 10], [8, 9], floor="wood", things=[
                    *[{"id": f"board-{x}-{y}", "kind": "furn.go_board", "rect": [x, y, 1, 1]}
                      for y in (2, 4, 6) for x in (2, 4, 6, 10, 12, 14)],
                ]) | {"label": "The trainees' room"},
                "kba-cafe": room([12, 8], [6, 7], floor="office_tile", things=[
                    {"id": "counter", "kind": "furn.counter", "rect": [1, 1, 2, 1], "label": "The counter"},
                    *[{"id": f"table-{x}-{y}", "kind": "furn.plastic_table", "rect": [x, y, 1, 1]} for x, y in ((3, 4), (6, 4), (9, 4), (9, 2))],
                    {"id": "game", "kind": "prop.vending", "rect": [10, 6, 1, 1], "label": "An arcade machine"},
                ]) | {"label": "The café across the street"},
            },
        },

        # Baekjin Trading: a lane of small offices.
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
                ]) | {"label": "Baekjin Trading"},
            },
        },

        # Sun's neighbourhood: her block of flats and the daycare down the street.
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
                spots=[{"id": "sun-flat-door", "at": [3, 5], "at_door": "flats", "label": "Sun Ji-young's door",
                        "note": "handoffs to Sun at home land here"}],
                exits=[{"to": "Jongno", "at": [0, 5], "side": "W"}], entries={"": [8, 5], "Jongno": [1, 5]},
                dress=[{"kind": "tree.ginkgo", "along": "street", "every": 4}, {"kind": "prop.bench", "in": "playground", "count": 2}]),
            "states": [{"id": "day", "light": "day"}],
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
                ]) | {"label": "The daycare"},
                "sun-flat": room([12, 8], [6, 7], floor="lino", things=[
                    {"id": "tv", "kind": "furn.tv", "rect": [2, 1, 1, 1]},
                    {"id": "sofa", "kind": "furn.sofa", "rect": [2, 3, 1, 1]},
                    {"id": "table", "kind": "furn.table", "rect": [8, 3, 1, 1], "label": "The kitchen table"},
                    {"id": "wardrobe", "kind": "furn.wardrobe", "rect": [10, 1, 1, 1]},
                    {"id": "toys", "kind": "furn.toy_shelf", "rect": [5, 1, 1, 1]},
                ]) | {"label": "Sun Ji-young's flat"},
            },
        },

        # Daehanmun: the old gate of Deoksugung on the main road, the palace wall either side of it, and the plaza in
        # front where the company sets up a memorial tent with portraits (Book 1's last morning).
        "Daehanmun": {
            "archetype": "city",
            "plan": {
                "grid": [16, 10], "cell": 4, "margin": 1,
                "ground": [{"id": "town", "kind": "city", "rect": [0, 0, 16, 10]},
                           {"id": "palace", "kind": "garden", "rect": [0, 0, 16, 3]},     # inside the palace wall
                           {"id": "plaza", "kind": "court", "rect": [2, 4, 12, 3]},
                           {"id": "carriageway", "kind": "asphalt", "rect": [0, 8, 16, 2]}],
                "lines": [{"id": "palace-wall", "kind": "wall.palace", "path": [[0, 3], [15, 3]], "width": 1, "gates": {"daehanmun": [8, 3]}},
                          {"id": "pave", "kind": "road", "path": [[0, 7], [15, 7]], "width": 4},
                          {"id": "palace-path", "kind": "path", "path": [[8, 3], [8, 1]], "width": 4}],   # (as wide as the gate's middle bay)
                "things": [{"id": "daehanmun", "kind": "building.palace_gate", "rect": [7, 3, 3, 1], "label": "Daehanmun", "plaque": "大漢門"},{"id": "tent", "kind": "prop.memorial_tent", "rect": [10, 4, 2, 1], "label": "A memorial tent: portraits and chrysanthemums"},
                           {"id": "car-1", "kind": "prop.car", "rect": [3, 8, 2, 1]},
                           {"id": "car-2", "kind": "prop.car", "rect": [11, 9, 2, 1]}],
                "spots": [],
                "dress": [{"kind": "tree.pine", "in": "palace", "count": 6}, {"kind": "tree.ginkgo", "along": "pave", "every": 4}],
                "exits": [{"to": "Jongno", "at": [15, 7], "side": "E"}],
                "entries": {"": [14, 7], "Jongno": [14, 7]},
            },
            "states": [{"id": "morning", "light": "morning"}],
            "npcs": [_talk("folk.salaryman", [5, 7], "A man in a black suit with a white ribbon on his lapel. He bows to the tent, and walks on."),
                     _talk("folk.ajumma", [12, 6], "A woman sets white chrysanthemums along the table, one by one."),
                     # the early commuters, on their way past to City Hall
                     _talk("folk.officewoman", [3, 7], "A commuter hurrying past with a coffee. “Every morning there's a tent here for someone.”"),
                     _talk("folk.salaryman", [13, 7], "A commuter checks his watch, slows at the tent, and goes on.")],
        },

        # The pizza shop: Kim Dong-su's, across from a big mart.
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
                ]) | {"label": "Kim Dong-su's pizza shop"},
            },
        },

        # The new office: Oh's new company, upstairs on a narrow street.
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
                ]) | {"label": "The new office"},
            },
        },

        # Oh's home: a flat in the small hours, his wife and son asleep (a cutaway: played off stage, never walked to)
        "Oh's home": {
            "archetype": "interior",
            "plan": room([12, 8], [6, 7], floor="lino", things=[
                {"id": "sofa", "kind": "furn.sofa", "rect": [2, 2, 1, 1]},
                {"id": "tv", "kind": "furn.tv", "rect": [2, 1, 1, 1]},
                {"id": "table", "kind": "furn.table", "rect": [8, 3, 1, 1], "label": "The kitchen table"},
                {"id": "toys", "kind": "furn.toy_shelf", "rect": [10, 1, 1, 1]},
                {"id": "golf", "kind": "furn.boxes", "rect": [10, 5, 1, 1], "label": "A golf bag, never used"},
            ]) | {"label": "Oh's home"},
            "states": [{"id": "night", "light": "night"}],
        },

        # Mountain (episode 3, Oh's run): a wooded hill north of Seoul on a weekday morning. The summit's rocks and its
        # view over the city at the top; a trail switching back down the slope (the wood itself can't be walked: the
        # run is the trail's); the car park at the bottom, Oh's car, and the road in, jammed.
        "Mountain": {
            "archetype": "city",
            "plan": {
                "grid": [12, 16], "cell": 4, "margin": 1,
                "ground": [{"id": "slope", "kind": "hills", "rect": [0, 0, 12, 16]},
                           {"id": "summit", "kind": "plateau", "rect": [2, 0, 8, 3]},
                           {"id": "lookout", "kind": "plateau", "rect": [9, 6, 3, 2]},   # a lookout off the trail's bend
                           {"id": "car-park", "kind": "city", "rect": [0, 13, 12, 2]},
                           {"id": "road-in", "kind": "asphalt", "rect": [0, 15, 12, 1]}],
                "lines": [
                    # the trail: down off the summit, then four switchbacks to the car park (about 110 tiles: a run)
                    {"id": "trail", "kind": "path", "path": [[6, 2], [6, 4], [2, 4], [2, 7], [9, 7], [9, 10], [3, 10], [3, 13]],
                     "width": 2},
                ],
                "things": [
                    {"id": "crag", "kind": "rock.crag", "rect": [7, 0, 2, 1], "label": "The summit rocks"},
                    {"id": "rock-w", "kind": "rock.big", "rect": [2, 1, 2, 1]},
                    {"id": "pine-s1", "kind": "tree.pine", "rect": [9, 2, 1, 1]},
                    {"id": "bench", "kind": "prop.bench", "rect": [4, 0, 1, 1], "label": "A bench, and Seoul below"},
                    {"id": "trail-sign", "kind": "landmark.notice", "rect": [4, 13, 1, 1], "label": "The trail map"},
                    {"id": "oh-car", "kind": "prop.car", "rect": [6, 13, 2, 1], "label": "Oh's car"},
                    {"id": "car-a", "kind": "prop.car", "rect": [9, 13, 2, 1]},
                    *[{"id": f"jam-{x}", "kind": "prop.car", "rect": [x, 15, 2, 1]} for x in (0, 3, 6, 9)],
                    {"id": "pine-c1", "kind": "tree.pine", "rect": [0, 13, 1, 1]},
                    {"id": "pine-c2", "kind": "tree.pine", "rect": [11, 13, 1, 1]},
                ],
                "spots": [], "exits": [], "entries": {"": [5, 1]},
            },
            "states": [{"id": "morning", "light": "morning"}],
            "npcs": [
                # hikers, off the trail itself (on a two-tile trail they'd stand in the run's way; no challengers either)
                _talk("folk.grandpa", [5, 1], "An old man in full hiking kit, poles and all, steps aside. “Running down? On a weekday? Young people.”"),
                _talk("folk.ajumma", [11, 7], "A woman with a thermos and a visor. “Careful going down. The steps are wet.”"),
                _talk("folk.salaryman", [10, 14], "A man in a suit jacket and trainers, phone to his ear, by his car. “…No, I'm at my desk. Yes. My desk.”"),
            ],
        },

        # Ulsan: a plant floor in the industrial south (a cutaway: the site department head on the phone to Seoul)
        "Ulsan": {
            "archetype": "interior",
            "plan": room([18, 10], [9, 9], floor="earth", things=[
                *[{"id": f"machine-{x}", "kind": "prop.machine", "rect": [x, 2, 4, 2], **({"label": "The line"} if x == 7 else {})} for x in (1, 7, 13)],
                *[{"id": f"crates-{x}", "kind": "furn.boxes", "rect": [x, 6, 1, 1]} for x in (2, 3, 14, 15)],
                {"id": "office", "kind": "furn.desk", "rect": [8, 6, 1, 1], "label": "The site office's desk"},
            ]) | {"label": "The plant at Ulsan"},
            "states": [{"id": "day", "light": "day"}],
        },

        # Amman: one street of pale stone (Book 5's last beat hands off to it).
        "Amman": {
            "archetype": "city",
            "plan": _street([16, 8], 4, things=[
                *[{"id": f"house-n{i}", "kind": "building.stone_house", "rect": [x, 2, 2, 2], "door": "S"} for i, x in enumerate((1, 4, 10, 13))],
                {"id": "cafe", "kind": "building.stone_shop", "rect": [7, 3, 2, 1], "door": "S", "label": "A café"},
                *[{"id": f"house-s{i}", "kind": "building.stone_house", "rect": [x, 5, 2, 2], "door": "N"} for i, x in enumerate((2, 6, 12))],
            ], exits=[], entries={"": [1, 4]},
                spots=[{"id": "amman", "at": [8, 4], "label": "A street in Amman", "note": "the epilogue's handoff lands here"}],
                dress=[{"kind": "tree.olive", "along": "street", "every": 5}, {"kind": "lamp.post", "along": "street", "every": 6}]),
            "states": [{"id": "sun", "light": "day", "weather": "clear"}],
            "npcs": [_talk("folk.jordanian", [5, 4], "A man selling coffee from a brass pot. “Korean? The traders from Seoul come every month now.”")],
        },
    }


def book(cfg):
    """A book's plans: the places it uses, with its own beats, mechanics, people, challengers, lights and objectives."""
    import copy
    floors = cfg["floors"]
    allp = _places(floors)
    keep = cfg["places"]
    out = {}
    for name in keep:
        b = copy.deepcopy(allp[name])
        P = b["plan"]
        # exits (and their arrivals) only to places in the book
        P["exits"] = [e for e in P.get("exits", []) if e["to"] in keep or e["to"] in (b.get("maps") or {})]
        P["entries"] = {k_: v for k_, v in P.get("entries", {}).items() if not k_ or k_ in keep or k_ in (b.get("maps") or {})
                        or (name == "One International" and k_ in floors)}
        for where, spots in cfg.get("spots", {}).items():
            pl, _, mid = where.partition("/")
            if pl == name:
                tgt = b["maps"][mid] if mid else P
                tgt["spots"] = [*tgt.get("spots", []), *spots]
        for where, things in cfg.get("things", {}).items():
            pl, _, mid = where.partition("/")
            if pl == name:
                tgt = b["maps"][mid] if mid else P
                tgt["things"] = [*tgt.get("things", []), *things]
        for where, props in cfg.get("props", {}).items():
            pl, _, mid = where.partition("/")
            if pl == name:
                tgt = b["maps"][mid] if mid else P
                tgt["props"] = [*tgt.get("props", []), *props]
        for where, states in cfg.get("states", {}).items():
            pl, _, mid = where.partition("/")
            if pl == name:
                if mid:
                    b["maps"][mid]["states"] = states
                else:
                    b["states"] = states
        b["npcs"] = [*b.get("npcs", []), *cfg.get("npcs", {}).get(name, [])]
        if cfg.get("challengers", {}).get(name):
            b["challengers"] = cfg["challengers"][name]
        b["objectives"] = {key: text for key, (pl, text) in cfg.get("objectives", {}).items() if pl == name}
        out[name] = b
    return out


# =========================================================================================
# Fragments the later books reuse (Season 1's single-book design; each book passes its own beat keys)
def audit_spots(when):
    """The audit board (tk-modern.js "audit"): ICB's registration on the auditors' table, which also opens the board;
    Jang's call notes at his desk; Sales 3's whiteboard opens the board too."""
    return {"One International/audit": [{**_give("audit-table", [5, 4], "The auditors' table", "icb_listing", when,
                                                  "On the auditors' table, among the papers they're packing: ICB's registration. You take a copy.",
                                                  "The auditors' table. You have ICB's registration already."), "opens": "audit"}],
            "One International/sales3": [_give("call-notes", [7, 5], "Jang's desk", "icb_call", when,
                                               "Your notes from the call to ICB, in your own hand. In the margin you've written: Korean? In the room behind?",
                                               "Your desk. The call notes are in your bag."),
                                         {"id": "whiteboard", "at": [7, 2], "label": "Sales Team 3's whiteboard", "opens": "audit"}]}


SETTINGS = [   # setting the board room: the place, the drink, the spot by its chair, the stretch of table the drink shows on
    ("seat_president", "water", [12, 4], "table-2", "prop.glass_water", "The president's place",
     "Still water, no ice, at the head of the table.", "The notes say the president's water goes here."),
    ("seat_exec", "green_tea", [6, 2], "table-0", "prop.teacup", "The executive vice president's place",
     "Green tea, at the executive vice president's place.", "The notes say the executive vice president's tea goes here."),
    ("seat_division", "coffee", [6, 6], "table-1", "prop.coffee_cup", "The division head's place",
     "Black coffee, at the division head's place.", "The notes say the division head's coffee goes here."),
]


def seat_spots(when="item:seating_notes"):
    return ({"One International/board-room": [_deliver(mark, at, label, item, mark, when, line, wait, set_down=True)
                                              for mark, item, at, _, _, label, line, wait in SETTINGS]},
            {"One International/board-room": [{"kind": kind, "over": on, "when": f"mark:{mark}", "lift": 6}
                                              for mark, _, _, on, kind, *_ in SETTINGS]})


def trade_people(when, until):
    """The ₩100,000 mission (tk-modern.js "trade"): the sock stall, four passers-by, and the KBA staff member whose
    refusal is the rebuke. (The corner-shop owner is the rival: a challenger with "rival", in the book's challengers.)"""
    w = {"when": when, "until": until}
    return {"Jongno": [
        {"id": "sock-stall", "kind": "folk.ajumma", "at": [21, 12], "label": "The sock stall", "shop": ["socks"],
         "say": "A stall of socks, gloves and towels. “Ten pairs for twenty thousand. Wholesale price, for you.”"},
        {"id": "buyer-bus", "kind": "folk.salaryman", "at": [8, 10], **w, "label": "A man waiting for the bus", "say": "A man waiting for the bus, checking his watch.",
         "buyer": {"wants": ["socks"], "pays": 30000, "yes": ["“Socks? My wife's been on at me about socks for a week. Fine. Thirty thousand.”"],
                   "no": ["“No, thanks. Not today.”"]}},
        {"id": "buyer-lunch", "kind": "folk.officewoman", "at": [16, 7], **w, "label": "An office worker", "say": "An office worker on her way back from lunch.",
         "buyer": {"wants": ["socks"], "pays": 25000, "yes": ["“For my father, maybe. He never buys his own. Here.”"], "no": ["“I'm sorry, I'm in a hurry.”"]}},
        {"id": "buyer-student", "kind": "folk.kid", "at": [3, 10], **w, "label": "A student", "say": "A student in a school blazer, waiting at the station stairs.",
         "buyer": {"wants": ["socks"], "pays": 20000, "yes": ["“For PE? Mum keeps saying I need more. Twenty thousand, that's all I've got.”"],
                   "no": ["“I've got no money, sorry.”"]}},
        {"id": "buyer-oldman", "kind": "folk.grandpa", "at": [24, 10], **w, "label": "An old man", "say": "An old man with a newspaper under his arm.",
         "buyer": {"wants": ["socks"], "pays": 0, "no": ["“From a young man in a suit, on the pavement? No. Go and sell to someone who needs them.”"]}}],
        "Korea Baduk Association": [
        _in("kba-front", "folk.salaryman", [6, 2], "The man at the front desk looks up, and knows you.", behind="desk",
            label="A KBA staff member", id="kba-staff", **w,
            buyer={"wants": ["socks"], "pays": 0,
                   "no": ["“Geu-rae? You've come here to sell? I'd buy whatever you brought. Out of pity, to encourage you, to cheer "
                          "you on, any of it. Could you call that doing your job?”"]})]}


RIVAL = {"say": ["The corner-shop owner calls out to the same people you were about to ask. “Dried squid! Grilled while you wait!” They go to him.",
                 "“Look at you. Holding them out like you're apologising. Selling's not begging, son.”"]}


# =========================================================================================
# Book 1, "Not Yet Alive" (episodes 0-16, world 21): Plot alt2's design (misaeng-arc.md "Book 1"; tools/tk_story_w21.py).
# Misaeng is nine books, one per volume (worlds 21-29), at 1-2 beats an episode.
def _b1():
    n = lambda key: f"node:{k(key)}"   # noqa: E731
    sales3 = "One International/sales3"
    return {
        "keys": {f"m{i}" for i in (1, 2, 4, 5, 7, 8, 10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22)} | {"m19c", "m21b", "m22b"},
        "places": ["Susaek-dong", "The subway", "Korea Baduk Association", "Jongno", "One International", "Mountain"],
        "floors": ["general-affairs", "sales3", "meeting", "roof"],
        "spots": {
            "Korea Baduk Association/kba-trainees": [
                {"id": "m2", "at": [3, 6], "node": k(2), "label": "The trainees' room"},
                {"id": "kba-trainees", "at": [13, 8], "label": "The trainees' room", "note": "the handoff to Jang at eleven lands here"}],
            # m1 (the uncle brings the stones, by the old go board) and m4 (years later), both in the family flat
            "Susaek-dong/home": [{"id": "m1", "at": [7, 4], "node": k(1), "label": "Jang's home"},
                                 {"id": "m4", "at": [3, 4], "node": k(4), "label": "Jang's home"}],
            "Jongno/sponsor-office": [{"id": "m5", "at": [6, 5], "node": k(5), "label": "The sponsor's office"}],
            # m7, Oh's run (episode 3): cut to the summit, run the trail down to the car (the clock is on m7)
            "Mountain": [{"id": "summit", "at": [4, 2], "label": "The summit", "note": "the cut to Oh lands here; the run is to m7"},
                         {"id": "m7", "at": [7, 14], "node": k(7), "label": "Oh's car"}],
            "Jongno/cafe": [{"id": "m8", "at": [5, 6], "node": k(8), "label": "A café on Jongno"},
                            {"id": "cafe", "at": [10, 2], "label": "A café on Jongno", "note": "the cut to the café lands here"}],
            "Jongno": [{"id": "m16", "at": [15, 6], "node": k(16), "label": "The plaza"},
                       # m21b: out of the hof after drinks, on the street by its door; Go's team comes up the street
                       {"id": "m21b", "at": [13, 13], "node": k("21b"), "label": "Outside the hof"}],
            # m10's gate: Kim's requisition (given in m8's scene), handed to the clerk at General Affairs' counter
            "One International/general-affairs": [
                _deliver("ga-counter", [6, 4], "General Affairs' counter", "requisition", "requisition", n(8),
                         "The clerk stamps Kim Dong-sik's requisition without reading it. “Supplies are by the lift. Sign here.”",
                         "The clerk looks up. “Requisition? You need the form. Signed.”",
                         "General Affairs has the requisition.")],
            "Jongno/hof": [{"id": "m12", "at": [7, 6], "node": k(12), "label": "The hof"}],
            sales3: [
                # (every spot you walk up to here at least 76 px from every giver and delivery)
                {"id": "m10", "at": [6, 8], "node": k(10), "label": "Jang's desk"},
                {"id": "m13", "at": [3, 9], "node": k(13), "label": "Jang's desk, at night"},
                {"id": "m14", "at": [12, 7], "node": k(14), "label": "Sales Team 3"},
                {"id": "m18", "at": [15, 7], "node": k(18), "label": "Sales Team 3"},
                {"id": "m19", "at": [9, 10], "node": k(19), "label": "Sales Team 3"},
                {"id": "m20", "at": [3, 7], "node": k(20), "label": "Sales Team 3"},
                {"id": "m21", "at": [12, 5], "node": k(21), "label": "Oh's desk"},   # Go comes over from Sales Team 1
                {"id": "m22", "at": [8, 9], "node": k(22), "label": "Sales Team 3"},   # the 13th-floor clash (staged on 14)
                {"id": "m22b", "at": [4, 9], "node": k("22b"), "label": "The team's table"},
                {"id": "sales3", "at": [15, 9], "label": "Sales Team 3", "note": "handoffs to Jang land here (6+ tiles from the next beat)"},
                # m14's pile-up, all at once (episode 7): the forwarder on the team phone, Kim's copies, the floor
                _give("copier", [2, 2], "The copier", "copy", n(13), "The copier groans out Kim Dong-sik's copies, warm.",
                      "The copier. You've done Kim's copies."),
                _deliver("errand-copy", [9, 6], "Kim Dong-sik's desk", "copy", "errand_copy", n(13),
                         "Kim Dong-sik takes the copies without looking up. “Thirty? I said thirty-two. …No, thirty. Fine.”",
                         "Kim Dong-sik taps the desk. “The copies, Jang. Today, if you can.”",
                         "Kim Dong-sik is reading the copies."),
                {"id": "errand-bl", "at": [6, 5], "label": "The team phone", "needs": [n(13)], "when": n(13), "delivers": "errand_bl",
                 "set_down": True,
                 "deliver": ["You ring the forwarder about the B/L. On hold. Then a voice: the bill of lading went out this morning. You write it down."],
                 "waiting": ["The team phone."], "delivered": ["The team phone. The forwarder's call is done."]},
                # "wipe this floor" (episode 7): the mop from the cleaning cupboard, to the spill by the east desks
                _give("mop-cupboard", [11, 2], "The cleaning cupboard", "mop", n(13), "A mop and a bucket, behind the cupboard door. You take them.",
                      "The cleaning cupboard. The mop's back on its hook."),
                _deliver("errand-floor", [14, 10], "A spill on the floor", "mop", "errand_floor", n(13),
                         "Coffee, trodden into the carpet all morning. You mop it, wring it, mop it again. Nobody looks up.",
                         "Coffee, trodden into the carpet. Someone said: wipe this floor.",
                         "The floor's clean. Nobody noticed.", set_down=True),
            ],
            "One International/meeting": [{"id": "m19c", "at": [4, 4], "node": k("19c"), "label": "Asleep in a meeting room"}],
            "One International/roof": [{"id": "m17", "at": [11, 5], "node": k(17), "label": "The smokers' corner"},
                                       {"id": "roof", "at": [3, 5], "label": "The roof", "note": "handoffs to the roof land here"}],
        },
        "things": {sales3: [{"id": "team-phone", "kind": "furn.phone", "rect": [6, 4, 1, 1], "label": "The team phone"},
                            {"id": "mop-cupboard", "kind": "furn.cleaning_cupboard", "rect": [11, 1, 1, 1], "label": "The cleaning cupboard"},
                            {"id": "spill", "kind": "prop.spill", "rect": [14, 10, 1, 1], "label": "A spill"}]},
        "npcs": {
            "One International": [
                # the clerk at General Affairs takes the requisition (a delivery is a handoff to a person)
                {"id": "ga-clerk", "kind": "folk.officewoman", "place": "general-affairs", "at": [5, 3], "face": "S", "label": "General Affairs",
                 "say": "A clerk at General Affairs' counter, sorting forms into trays."},
                # m14: Kim Dong-sik at his desk for his copies
                {"id": "kim-errand", "kind": "hero.ms_kimds", "place": "sales3", "at": [10, 6], "face": "W", "label": "Kim Dong-sik",
                 "when": n(13), "until": n(14), "say": "Kim Dong-sik doesn't look up from his screen."},
            ],
            # episode 1's evening, as Jongno's townsfolk while m5 is open: the city's office workers after hours
            "Jongno": [
                _talk("folk.salaryman", [16, 10], "A table of office workers outside a beer hall, ties loose, toasting nobody in particular.", **{"in": ["evening"]}),
                _talk("folk.salaryman", [12, 10], "A team dinner spills onto the pavement. “To the director's leadership!” The glasses go up. The director beams.",
                      **{"in": ["evening"]}),
                _talk("folk.salaryman", [7, 7], "A man smoking by the kerb. “Our department head? Useless. Couldn't find his own—” His phone rings. "
                      "“Yes, sir! Of course, sir. Right away, sir.”", **{"in": ["evening"]}),
                _talk("folk.officewoman", [22, 7], "Two juniors share a cigarette. “Cogs. That's all we are. Ants, carrying crumbs home.”", **{"in": ["evening"]}),
                _talk("folk.salaryman", [4, 10], "A drunk sways at the crossing and points at the sky. “See that plane? It's circling Seoul! For me! "
                      "A genius, you know, one genius feeds thousands!”", **{"in": ["evening"]}),
            ],
        },
        "states": {
            "Jongno": [{"id": "day", "until": n(4), "light": "day"},
                       {"id": "evening", "when": n(4), "until": n(5), "light": "dusk"},   # m5: the evening, the sponsor's office
                       {"id": "day2", "when": n(5), "until": n(10), "light": "day"},
                       {"id": "night", "when": n(10), "until": n(13), "light": "night"},   # m12 at the hof, and back to the tower
                       {"id": "day3", "when": n(13), "light": "day"},
                       # (the last state that holds wins) the street after drinks (m21b)
                       {"id": "drinks", "when": n(21), "until": n("21b"), "light": "night"}],
            "Jongno/sponsor-office": [{"id": "evening", "light": "dusk"}],
            "Jongno/hof": [{"id": "night", "light": "night"}],
            "One International/sales3": [{"id": "day", "until": n(12), "light": "day"},
                                         {"id": "night", "when": n(12), "until": n(13), "light": "night"},   # m13 at night
                                         {"id": "dawn", "when": n(13), "until": n(14), "light": "morning"},   # m14 at dawn
                                         {"id": "day2", "when": n(14), "light": "day"}],
        },
        # Road challengers: 7, 2 blocking, along the walks
        "challengers": {
            "The subway": [
                _ch("commuter", "folk.salaryman", [21, 3], n(4), n(5),
                    "A man in a grey suit stands in the doorway with a magnetic pocket board, a problem half-solved. “Excuse me. Do you play? "
                    "I've been stuck on this since Hapjeong.”",
                    "“…Oh. Of course. Thank you. This is my stop too.”", "The man with the pocket board is on the next problem.",
                    blocks={"exit": "Jongno"}, view=1, guard="to-Jongno"),
                _ch("dawn-commuter", "folk.officewoman", [8, 2], n(13), n(14),
                    "Crushed against the door at dawn, a woman holds a pocket board over everyone's heads. “Black to live. You look like you'd know.”",
                    "“…Of course. Thank you. I'll be thinking about that all day.”", "The woman with the pocket board is asleep on her feet."),
            ],
            "Jongno": [
                _ch("regular-1", "folk.grandpa", [3, 5], n(4), n(5),
                    "An old man at the stone table, in the evening, waves you over without looking up. “You. You've got a player's hands. Sit.”",
                    "“Hm. Where did you learn that? Go on, then.”", "The old man is playing someone else now."),
                _ch("regular-2", "folk.grandpa", [8, 5], n(8), n(10),
                    "An old man in a flat cap sets out the stones. “A young man in a tie, at Tapgol? Sit down, it's free.”",
                    "“…Again tomorrow. Same time.”", "The old man in the flat cap is asleep on the bench."),
                _ch("courier", "folk.salaryman", [24, 4], n(14), n(16),
                    "A courier with a trolley of boxes parks it across the lane. “Fourteenth floor? Every one of them's the fourteenth floor. "
                    "Sit a minute. One game while the lift comes.”",
                    "“Ha! I'll take the stairs, then.”", "The courier's trolley rattles off down the lane."),
                # the interns' study night (m12): one of them keeps the hof's door (blocking)
                _ch("hof-door", "folk.salaryman", [11, 12], n(10), n(12),
                    "An intern from the other teams leans in the hof's doorway. “The parachute. The rest of us got in on paper. "
                    "Beat me, and you can sit with us.”",
                    "“…Huh. Sit down, then. You're buying.”", "The intern at the door has gone in to his table.",
                    blocks="hof", view=1, guard="door") | {"label": "An intern at the hof's door"},
                _ch("hof-drunk", "folk.salaryman", [11, 4], n(10), n(12),
                    "A salaryman at the next table, his tie round his head. “Students! Interns! Play me, the loser pays!”",
                    "“…Bah. Barman! Their table's on me.”", "The salaryman is asleep on his arms.", map="hof", entry=[7, 6]),
            ],
        },
        "objectives": {
            k(1): ("Susaek-dong", "Home. Your uncle has brought something."),
            k(2): ("Korea Baduk Association", "The trainees' room. This game decides everything."),
            k(4): ("Susaek-dong", "Go home."),
            k(5): ("Jongno", "Go to the sponsor's office, on the lane behind Jongno's shops."),
            k(7): ("Mountain", "Run down the trail to the car. The deal won't wait."),
            k(8): ("Jongno", "The buyer is waiting at a café on Jongno."),
            k(10): ("One International", "Your desk in Sales Team 3, fourteenth floor. Take the lift."),
            k(12): ("Jongno", "The interns' study night, at the hof in Pimatgol."),
            k(13): ("One International", "Your desk, Sales Team 3."),
            k(14): ("One International", "Sales Team 3."),
            k(16): ("Jongno", "Out on the plaza in front of the tower."),
            k(17): ("One International", "Go up to the roof."),
            k(18): ("One International", "Back to Sales Team 3."),
            k(19): ("One International", "Sales Team 3."),
            k("19c"): ("One International", "The meeting room, fifteenth floor."),
            k(20): ("One International", "Back to Sales Team 3."),
            k(21): ("One International", "Oh's desk, Sales Team 3."),
            k("21b"): ("Jongno", "Out on the street by the hof."),
            k(22): ("One International", "Back to Sales Team 3."),
            k("22b"): ("One International", "Sales Team 3's table."),
        },
    }


# =========================================================================================
# Book 1 as first written (episodes 0-33; superseded, now the start of Book 2): kept as a reference for Book 2's config
# (its errands, the slippers, the PT room's blockers, Daehanmun). Not used.
def _b1_first_draft():
    n = lambda key: f"node:{k(key)}"   # noqa: E731
    sales3 = "One International/sales3"
    return {
        "keys": {f"m{i}" for i in range(1, 21)} | {"m13b"},
        "places": ["Korea Baduk Association", "Susaek-dong", "The subway", "Jongno", "One International", "Sun's neighbourhood", "Daehanmun"],
        "floors": ["pt-room", "hr", "textile", "sales3", "meeting", "roof"],
        "spots": {
            "Korea Baduk Association/kba-trainees": [{"id": "m1", "at": [7, 6], "node": k(1), "label": "The trainees' room"}],
            "One International": [
                {"id": "m2", "at": [LOBBY_W - 6, 7], "node": k(2), "label": "The front desk"},
                # m8 (Oh): the waybill's other half is in the bins by the gates (the gate needs the scrap)
                _give("bins", [2, 8], "The recycling bins", "waybill_scrap", n(7),
                      "You go through the bins by the gates, sheet by sheet. Stuck to the back of a torn page: the rest of the "
                      "waybill, glue on the back, and a name on it in someone else's hand. Kim Seok-ho.",
                      "The recycling bins. You've found what you were looking for."),
                {"id": "m8", "at": [6, 8], "node": k(8), "label": "The lobby"},   # (clear of the bins it waits on)
                {"id": "lobby-lift", "at": [LOBBY_W // 2, 3], "label": "The lifts", "note": "the handoff to Oh lands here"}],
            sales3: [
                # (every spot you walk up to here, a beat, a giver, a delivery, at least 76 px from every other, so
                #  that walking past one never sets off the next: Testing, round 3)
                {"id": "m3", "at": [6, 8], "node": k(3), "label": "Jang's desk"},
                {"id": "m4", "at": [3, 9], "node": k(4), "label": "The team's meeting table"},
                {"id": "m5", "at": [12, 8], "node": k(5), "label": "Sales Team 3"},
                {"id": "m7", "at": [15, 7], "node": k(7), "label": "Sales Team 3"},
                {"id": "m13", "at": [4, 6], "node": k(13), "label": "Sun Ji-young's desk"},
                {"id": "m15", "at": [9, 10], "node": k(15), "label": "Sales Team 3"},
                {"id": "sales3", "at": [15, 9], "label": "Sales Team 3", "note": "handoffs to Jang land here (6+ tiles from the next beat)"},
                # m4's three errands, all at once: three things to fetch, each to its senior's desk
                _give("copier", [2, 2], "The copier", "copy", n(3), "The copier groans out Kim Dong-sik's thirty pages, warm.",
                      "The copier. You've done Kim's copies."),
                _give("filing", [13, 2], "The filing cabinets", "file", n(3), "Third drawer down, under O: section head Oh's file.",
                      "The filing cabinets. You have Oh's file."),
                _give("pantry", [5, 2], "The pantry", "coffee", n(3), "One coffee from the machine, black, for the deputy.",
                      "The pantry. You have the deputy's coffee."),
                _deliver("errand-copy", [9, 6], "Kim Dong-sik's desk", "copy", "errand_copy", n(3),
                         "Kim Dong-sik takes the copies without looking up. “Thirty? I said thirty-two. …No, thirty. Fine.”",
                         "Kim Dong-sik taps the desk. “The copies, Jang. Today, if you can.”",
                         "Kim Dong-sik is reading the copies."),
                _deliver("errand-file", [11, 4], "Oh's desk", "file", "errand_file", n(3),
                         "Section head Oh holds out his hand for the file, and keeps reading the one in front of him.",
                         "Section head Oh doesn't look up. “The file. I asked for it ten minutes ago.”",
                         "Oh has his file."),
                _deliver("errand-coffee", [7, 4], "The deputy's desk", "coffee", "errand_coffee", n(3),
                         "The deputy takes the coffee, sips, and winces. “Black. Right. Thanks.”",
                         "The deputy waves an empty cup at you. “Coffee? Sometime this morning?”",
                         "The deputy is drinking his coffee."),
            ],
            "One International/pt-room": [
                {"id": "m6", "at": [8, 3], "node": k(6), "label": "The lectern"},
                # (a handoff with no landing spot leaves the new lead where the scene staged them, the middle of the room:
                #  so m17 and m18, each reached that way, stand 6+ tiles from it, at the west front and by the panel)
                {"id": "m16", "at": [6, 3], "node": k(16), "label": "The PT room"},
                {"id": "m17", "at": [2, 3], "node": k(17), "label": "The front of the room"},
                {"id": "m18", "at": [13, 4], "node": k(18), "label": "The interviewers' table"},
                {"id": "pt-door", "at": [7, 8], "label": "The PT room's door", "note": "the costumed team's intern stands here before m16"}],
            "One International/textile": [
                {"id": "m9", "at": [10, 5], "node": k(9), "label": "Steve Han's desk"},
                {"id": "textile", "at": [3, 6], "label": "The textile team", "note": "the handoff to Kim Bu-ryeon lands here (6+ tiles from m9)"}],
            "One International/roof": [
                {"id": "m10", "at": [11, 5], "node": k(10), "label": "The smokers' corner"},
                {"id": "roof", "at": [3, 5], "label": "The roof", "note": "the handoff to Jang lands here (6+ tiles from m10)"}],
            "One International/meeting": [{"id": "m12", "at": [6, 5], "node": k(12), "label": "A meeting room"}],
            "One International/hr": [{"id": "m19", "at": [2, 4], "node": k(19), "label": "The noticeboard"}],
            "Jongno/client": [{"id": "m11", "at": [6, 4], "node": k(11), "label": "The client's office"}],
            "Sun's neighbourhood/daycare": [{"id": "m13b", "at": [6, 4], "node": k("13b"), "label": "The daycare"}],
            "Sun's neighbourhood/sun-flat": [{"id": "m14", "at": [6, 5], "node": k(14), "label": "Sun Ji-young's flat"}],
            "Daehanmun": [{"id": "m20", "at": [9, 5], "node": k(20), "label": "The memorial tent"}],
        },
        "npcs": {
            # m18's gate: section head Oh lends his office slippers, at his desk (Oh's walker is Graphics' ms_oh)
            "One International": [
                # m4's errands are handed to people: each senior stands by his own desk, beside his delivery, until m4
                {"id": "kim-errand", "kind": "hero.ms_kimds", "place": "sales3", "at": [10, 6], "face": "W", "label": "Kim Dong-sik",
                 "when": n(3), "until": n(4), "say": "Kim Dong-sik doesn't look up from his screen."},
                {"id": "oh-errand", "kind": "hero.ms_oh", "place": "sales3", "at": [12, 4], "face": "W", "label": "Section head Oh",
                 "when": n(3), "until": n(4), "say": "Section head Oh is on the phone, and holds up one finger."},
                {"id": "deputy-errand", "kind": "folk.salaryman", "place": "sales3", "at": [6, 4], "face": "E", "label": "The deputy",
                 "when": n(3), "until": n(4), "say": "The deputy turns his empty cup round and round."},
                {"id": "oh-slippers", "kind": "hero.ms_oh", "place": "sales3", "at": [11, 5], "behind": "oh-desk", "face": "W",
                 "label": "Section head Oh", "when": n(17), "until": n(18), "gives": "slippers", "gives_when": n(17),
                 "say": "Section head Oh is reading, in his socks.",
                 "give": ["“My slippers? …Fine. Bring them back.” He pushes them across the floor with his foot."],
                 "given": ["“You have them. Go on, sell them.”"]},
            ],
        },
        "states": {
            "Sun's neighbourhood": [{"id": "day", "until": n(13), "light": "day"},
                                    {"id": "dusk", "when": n(13), "until": n("13b"), "light": "dusk"},   # the daycare closes at seven
                                    {"id": "night", "when": n("13b"), "light": "night"}],
            "Sun's neighbourhood/sun-flat": [{"id": "night", "light": "night"}],
            "Daehanmun": [{"id": "early", "light": "morning"}],
        },
        # Road challengers: 8, 2 blocking (Book 1's design)
        "challengers": {
            "The subway": [
                _ch("commuter", "folk.salaryman", [21, 3], n(1), n(2),
                    "A man in a grey suit stands in the doorway with a magnetic pocket board, a problem half-solved. “Excuse me. Do you play? "
                    "I've been stuck on this since Hapjeong.”",
                    "“…Oh. Of course. Thank you. This is my stop too.”", "The man with the pocket board is on the next problem.",
                    blocks={"exit": "Jongno"}, view=1, guard="to-Jongno")],
            "Jongno": [
                _ch("regular-1", "folk.grandpa", [3, 5], n(1), n(2),
                    "An old man at the stone table waves you over without looking up. “You. You've got a player's hands. Sit.”",
                    "“Hm. Where did you learn that? Go on, go to work.”", "The old man is playing someone else now."),
                _ch("regular-2", "folk.grandpa", [8, 5], n(10), n(11),
                    "An old man in a flat cap sets out the stones. “A young man in a tie, at Tapgol? Sit down, it's free.”",
                    "“…Again tomorrow. Same time.”", "The old man in the flat cap is asleep on the bench."),
                _ch("courier", "folk.salaryman", [24, 4], n(2), n(11),
                    "A courier with a trolley of boxes parks it across the lane. “Fourteenth floor? Every one of them's the fourteenth floor. "
                    "Sit a minute. One game while the lift comes.”",
                    "“Ha! I'll take the stairs, then.”", "The courier's trolley rattles off down the lane.")],
            "One International": [],
            "Daehanmun": [
                _ch("tourist", "folk.salaryman", [8, 4], n(19), n(20),
                    "A tourist with a camera and a travel go set stops you by the gate. “Excuse me! Is this the palace? …You play? "
                    "One game, while the guards change?”",
                    "“Wonderful. Thank you! Good luck in your new job.”", "The tourist is photographing the gate.")],
        },
        # the PT room's: two nervous interns outside it (m15-m16), and the costumed team's intern at its door (blocking)
        "pt_challengers": [
            _ch("nervous-1", "folk.salaryman", [10, 8], n(14), n(16),
                "An intern rehearsing by the door grabs your sleeve. “Quiz me. No, play me. Anything. I can't think about the PT any more.”",
                "“…Thanks. I can breathe again.”", "The intern is rehearsing under his breath.", map="pt-room", entry=[8, 8]),
            _ch("nervous-2", "folk.officewoman", [12, 8], n(14), n(16),
                "An intern with cue cards fanned like a hand of cards. “One quick game? My hands won't stop shaking.”",
                "“Steadier. Good. Good luck in there.”", "The intern is reading her cue cards again.", map="pt-room", entry=[8, 8]),
            _ch("costumed", "folk.salaryman", [7, 6], n(15), n(16),
                "An intern in a hard hat and overalls — his team's costume for their PT — stands square in the aisle. “Our turn first. "
                "Unless you can get past me.”",
                "“…Fine. Go on. Break a leg.”", "The intern in the hard hat is adjusting his costume.",
                blocks="m16", view=1, map="pt-room", entry=[8, 8], guard=[7, 6]) | {"label": "An intern in a hard hat"},
        ],
        "objectives": {
            k(1): ("Korea Baduk Association", "Go to the trainees' room. This game decides everything."),
            k(2): ("One International", "Your first day at One International. Go to the front desk."),
            k(3): ("One International", "Take the lift up to Sales Team 3, to your desk."),
            k(4): ("One International", "Kim Dong-sik's desk, Sales Team 3."),
            k(5): ("One International", "Back to Sales Team 3."),
            k(6): ("One International", "Go to the PT room. It's your turn to present."),
            k(7): ("One International", "Back to Sales Team 3."),
            k(8): ("One International", "Search the lobby for the rest of the waybill."),
            k(9): ("One International", "Go to the textile team's floor, to Steve Han's desk."),
            k(10): ("One International", "Go up to the roof."),
            k(11): ("Jongno", "Go with Park Jong-gi to the client's office, along the lane behind the shops."),
            k(12): ("One International", "The client's president has come to One International. Go to the meeting room."),
            k(13): ("One International", "Go to Sun Ji-young's desk."),
            k("13b"): ("Sun's neighbourhood", "Collect Somi from the daycare before it closes at seven."),
            k(14): ("Sun's neighbourhood", "Go home."),
            k(15): ("One International", "Back to Sales Team 3: the PT with Han."),
            k(16): ("One International", "Go to the PT room. Your pair is next."),
            k(17): ("One International", "Go back to the PT room."),
            k(18): ("One International", "Go back to the PT room for the individual task."),
            k(19): ("One International", "The results are up on HR's noticeboard."),
            k(20): ("Daehanmun", "Go to Daehanmun, to the tent in front of the gate."),
        },
    }


def _book1():
    return book(_b1())


BOOK1 = _b1()
KEYS_MS = BOOK1["keys"]
PLANS_MS = _book1()

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}
ZH_PLACES_MS = {}   # English only (the user: "we dont need chinese lines for this")
