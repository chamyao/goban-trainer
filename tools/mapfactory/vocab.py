"""The map vocabulary: what a map may contain, independent of any art pack.

Maps name materials and kinds from these tables; a kit (assets/tk/kits/*.json)
says how each one looks in its pack. Adding a kind here makes it usable by the
factory; kits that don't draw it fall back along FALLBACK.

Footprints are the ground the thing stands on, in tiles (w, h). The sprite is
drawn with its bottom-centre on the footprint's bottom-centre, so a house's
roof rises above its footprint and you can walk behind it. A solid footprint
blocks walking, whatever the pack draws.
"""

# material -> walkable
MATERIALS = {
    "grass": True,   # the default ground
    "dirt": True,    # roads, paths, plazas, camp ground
    "sand": True,    # dry ground, riverbanks
    "water": False,  # ponds, rivers
}

# kind -> (footprint w, h in tiles, solid)
KINDS = {
    # buildings: the door is at the bottom-centre of the footprint
    "building.house": (4, 2, True),
    "building.hall": (4, 2, True),       # a grand house: county office, mansion
    "building.inn": (4, 2, True),
    "building.shop": (3, 2, True),       # teahouse, stall
    "building.hut": (3, 2, True),        # a poor hut, a hermit's shelter
    "building.lodge": (4, 2, True),      # a farmhouse
    "building.tent": (3, 2, True),
    "building.gate": (2, 1, False),      # a gateway you walk through
    "building.moongate": (3, 1, False),
    "landmark.notice": (2, 1, True),     # a notice board
    # trees and plants
    "tree.small": (1, 1, True),
    "tree.big": (2, 1, True),
    "tree.pine": (1, 1, True),
    "tree.dead": (1, 1, True),
    "tree.peach": (1, 1, True),          # a peach / blossom tree
    "tree.peach_big": (2, 1, True),
    "tree.grove": (3, 1, True),          # a clump of trees
    "tree.bamboo": (1, 1, True),
    "plant.bush": (1, 1, False),
    "plant.flower": (1, 1, False),
    "plant.grass": (1, 1, False),
    # rocks
    "rock.small": (1, 1, False),         # pebbles you walk over
    "rock.big": (3, 2, True),
    "rock.crag": (3, 2, True),
    # camp and battle
    "camp.firepit": (2, 1, True),
    "camp.cookfire": (2, 1, True),
    "camp.logs": (2, 1, True),
    "camp.hay": (2, 1, True),
    "camp.table": (2, 1, True),
    "banner.red": (1, 1, True),          # Han / loyalist
    "banner.yellow": (1, 1, True),       # Yellow Turbans
    "banner.green": (1, 1, True),
    "banner.blue": (1, 1, True),
    "banner.purple": (1, 1, True),
    "lamp.post": (1, 1, True),
}

# what to draw when a kit has no sprite for a kind (tried in order)
FALLBACK = {
    "building.hall": ["building.house"],
    "building.inn": ["building.hall", "building.house"],
    "building.shop": ["building.house"],
    "building.hut": ["building.house"],
    "building.lodge": ["building.house"],
    "building.tent": ["building.hut", "building.house"],
    "building.moongate": ["building.gate"],
    "tree.big": ["tree.small"],
    "tree.pine": ["tree.small"],
    "tree.dead": ["tree.small"],
    "tree.peach": ["tree.small"],
    "tree.peach_big": ["tree.peach", "tree.big"],
    "tree.grove": ["tree.big", "tree.small"],
    "tree.bamboo": ["tree.pine", "tree.small"],
    "rock.big": ["rock.crag", "rock.small"],
    "rock.crag": ["rock.big"],
    "camp.cookfire": ["camp.firepit"],
    "camp.hay": ["camp.logs"],
    "camp.table": ["camp.logs"],
    "banner.yellow": ["banner.red"],
    "banner.green": ["banner.red"],
    "banner.blue": ["banner.red"],
    "banner.purple": ["banner.red"],
    "plant.flower": ["plant.grass"],
    "landmark.notice": ["camp.table"],
}

# people: folk.* are townsfolk drawn by the kit; hero.<id> are story
# characters drawn by the game itself (TKArt), so every kit shows them the same.
FOLK = ["folk.villager", "folk.woman", "folk.elder", "folk.child", "folk.monk",
        "folk.noble", "folk.soldier", "folk.rebel", "folk.hunter", "folk.official"]
FOLK_FALLBACK = "folk.villager"
