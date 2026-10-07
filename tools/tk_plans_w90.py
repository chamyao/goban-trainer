"""Book 90: Talk with Claude. One room, no story: the study where Claude sits at the main desk.

A plan grid (docs/book2/plan-grid.md) read by tools/mapfactory/plans.py, as Book 2's rooms are:

    python3 tools/mapfactory/plans.py --world 90 --out data/tk_maps/w90 --assets docs/book90-assets.md
    python3 tools/mapfactory compile --world 90 --kit jade

Cells are 2 tiles: the room is 16x12 tiles inside its walls, the door at the bottom.
"""
from tk_plans_w2 import LINE_KINDS, ZONE_KINDS, room

# Kinds this room uses that tools/mapfactory/vocab.py doesn't have: footprint in tiles (w, h, solid).
NEW_KINDS = {
    "furn.computer": (2, 1, True),   # a desk with a glowing screen; stands in as a desk until it's drawn
}

ART = {
    "furn.computer": "a low dark-wood scholar's desk with a slim glowing screen on it, a soft blue-white light on the desk top and "
                     "the floor in front; a brush pot and a few papers beside the screen; the same 3/4 view and scale as furn.desk",
}

PLANS90 = {
    "Claude's Study": {
        "id": "claude-study",
        "archetype": "interior",
        "plan": room(
            [8, 6], [4, 5], floor="wood",
            things=[
                # the back wall: books and windows behind Claude's desk
                {"id": "shelf-1", "kind": "furn.shelf", "rect": [1, 1, 1, 1], "label": "Bookshelves"},
                {"id": "shelf-2", "kind": "furn.shelf", "rect": [2, 1, 1, 1]},
                {"id": "window-w", "kind": "furn.window", "rect": [3, 1, 1, 1], "label": "A window"},
                {"id": "window-e", "kind": "furn.window", "rect": [5, 1, 1, 1]},
                {"id": "shelf-3", "kind": "furn.shelf", "rect": [6, 1, 1, 1]},
                # the desks: Claude's in the middle, facing the door; one at each side
                {"id": "desk", "kind": "furn.computer", "rect": [4, 2, 1, 1], "label": "Claude's desk"},
                {"id": "desk-w", "kind": "furn.computer", "rect": [1, 2, 1, 1]},
                {"id": "desk-e", "kind": "furn.computer", "rect": [6, 2, 1, 1]},
                # a game of go laid out on a low table, a rug before the desk, lamps and plants
                {"id": "gotable", "kind": "furniture.gotable", "rect": [1, 3, 1, 1], "label": "A go board on a low table"},
                {"id": "stool", "kind": "furn.stool", "rect": [2, 3, 1, 1]},
                {"id": "rug", "kind": "furn.rug", "rect": [3, 3, 2, 1]},
                {"id": "lamp", "kind": "furn.lamp", "rect": [6, 3, 1, 1]},
                {"id": "plant-w", "kind": "furn.plant", "rect": [1, 4, 1, 1]},
                {"id": "plant-e", "kind": "furn.plant", "rect": [6, 4, 1, 1]},
            ],
            spots=[{"id": "claude", "at": [4, 3], "label": "Claude's desk", "trigger": "talk",
                    "note": "the talk spot, in front of the desk: the engine drives the conversation"}],
        ),
        # Claude behind the main desk, facing the door; the engine supplies what's said
        "npcs": [{"id": "claude", "kind": "hero.claude", "at": [4, 1], "behind": "desk", "face": "S", "label": "Claude"}],
    },
}

TABLES = {"NEW_KINDS": NEW_KINDS, "LINE_KINDS": LINE_KINDS, "ZONE_KINDS": ZONE_KINDS, "ART": ART}

ZH_PLACES90 = {
    "Claude's Study": "Claude的书房",
    "Claude's desk": "Claude的书桌",
    "Bookshelves": "书架",
    "A window": "窗",
    "A go board on a low table": "矮几上的棋盘",
    "Claude": "Claude",
}

WORLD90 = {"n": 90, "name": "Talk with Claude", "zh": "与Claude对话", "nodes": [], "edges": [], "scenes": {},
           "start": "claude-study", "party": []}
