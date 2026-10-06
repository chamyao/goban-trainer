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
    # inside buildings
    "wood": True,    # board floors: houses, inns, teahouses
    "stone": True,   # flagstones: halls, offices
    "mat": True,     # straw mats: huts
    "earth": True,   # packed earth: tents, farm kitchens
    "wall": False,   # a room's walls
    "void": False,   # outside the room: drawn black
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
    "furniture.gotable": (1, 1, True),   # a weiqi table, where the Star Lords sit
    "ruin.hall": (4, 2, True),           # Book 2's burned Luoyang: a roofless hall, charred pillars
    "ruin.columns": (2, 1, True),
    "ruin.rubble": (1, 1, False),        # stones and burnt timber you walk over
    "landmark.shrine": (2, 1, True),     # the Star Lords' weiqi shrine: one per town (looks: dark, lit, settled)
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

# furniture (inside buildings)
KINDS.update({
    "furn.table": (2, 1, True),
    "furn.stool": (1, 1, False),
    "furn.counter": (3, 1, True),
    "furn.shelf": (2, 1, True),       # stands against the back wall
    "furn.drawers": (1, 1, True),
    "furn.bed": (2, 1, True),
    "furn.mat": (2, 1, False),        # a straw sleeping mat
    "furn.jar": (1, 1, True),
    "furn.barrel": (1, 1, True),
    "furn.chest": (1, 1, True),
    "furn.desk": (2, 1, True),
    "furn.screen": (3, 1, True),      # a folding screen behind a seat of honour
    "furn.rug": (3, 2, False),
    "furn.plant": (1, 1, True),
    "furn.hearth": (2, 1, True),
    "furn.sacks": (1, 1, True),
    "furn.rack": (2, 1, True),        # a weapons rack
})

# the new Book 2's plan grids (tools/tk_plans_w2.py, docs/book2/plan-grid.md): kinds the plans place.
# A compound or palace fills the claim its plan gives it; the footprint here is only a default.
KINDS.update({
    "building.compound": (8, 6, True),      # a walled compound: has a map of its own
    "building.palace": (12, 8, True),
    "building.hall_grand": (10, 5, True),   # Wang Yun's halls, the Chancellor's middle hall, Meiwu's hall
    "building.wing": (6, 4, True),          # a side wing of a siheyuan; its door may face E or W
    "building.pavilion": (3, 3, True),      # open-sided; may stand on water
    "building.pavilion_painted": (3, 3, True),
    "building.gatetower": (3, 6, True),     # a gate tower in a city wall, climbable
    "building.granary": (6, 2, True),
    "building.storehouse": (6, 2, True),
    "building.posthouse": (5, 3, True),     # a Han post-pavilion (亭)
    "building.gatehouse": (4, 1, False),    # a compound's gate: you walk through it
    "building.tent_small": (2, 2, True),
    "camp.banquet": (10, 2, True),          # a long banquet table under awnings
    "landmark.ridge": (6, 2, False),
    "landmark.heights": (10, 6, True),
    "landmark.hitchingpost": (1, 1, True),
    "market.stalls": (6, 2, True),
    "garden.rockery": (2, 2, True),
    "garden.trellis": (4, 1, True),         # the 荼蘼 trellis
    "garden.screenwall": (4, 1, True),      # a spirit screen inside a compound gate (影壁)
    "tree.willow": (1, 1, True),
    "corral": (8, 6, True),
    "furn.dais": (3, 2, True),
    "furn.curtain": (1, 1, False),          # blocks sight, not walking
    "furn.swordwall": (1, 1, True),
    "furn.window": (1, 1, True),
    "furn.lamp": (1, 1, True),
    "furn.seat": (1, 1, False),
    "furn.qin": (2, 1, True),
})
# line kinds -> (walkable, blocks sight); zone kinds -> walkable (the plan grids' lines and zones)
LINE_KINDS = {"road": (True, False), "path": (True, False), "bridge": (True, False), "gallery": (True, False),
              "river": (False, False), "stream": (False, False), "wall": (False, True), "wall.city": (False, True),
              "wall.lattice": (False, False), "curtain": (True, True)}
ZONE_KINDS = {"water": False, "cliff": False, "hills": False, "field": True, "field.wheat": True, "market": True,
              "ward": True, "city": True, "plateau": True, "court": True, "garden": True, "passage": True,
              "camp": True, "loess": True, "plain": True, "stage": True, "floor": True}

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
    "furniture.gotable": ["camp.table"],
    "furn.table": ["camp.table"],
    "furn.desk": ["furn.table", "camp.table"],
    "furn.counter": ["furn.table", "camp.table"],
    "furn.hearth": ["camp.cookfire", "camp.firepit"],
    "furn.barrel": ["furn.jar"],
    "furn.sacks": ["camp.hay", "furn.jar"],
    "furn.chest": ["furn.drawers"],
    "furn.mat": ["furn.bed"],
    "furn.rack": ["lamp.post"],
    "furn.plant": ["plant.bush"],
    # the plan grids' kinds, until the kits draw them
    "building.compound": ["building.hall", "building.house"],
    "building.palace": ["building.hall", "building.house"],
    "building.hall_grand": ["building.hall", "building.house"],
    "building.wing": ["building.lodge", "building.house"],
    "building.pavilion": ["building.moongate", "building.shop", "building.house"],
    "building.pavilion_painted": ["building.pavilion", "building.shop", "building.house"],
    "building.gatetower": ["building.gate"],
    "building.granary": ["building.lodge", "building.house"],
    "building.storehouse": ["building.lodge", "building.house"],
    "building.posthouse": ["building.house"],
    "building.gatehouse": ["building.gate"],
    "building.tent_small": ["building.tent", "building.hut", "building.house"],
    "camp.banquet": ["camp.table", "camp.logs"],
    "landmark.ridge": ["rock.small"],
    "landmark.heights": ["rock.crag", "rock.big"],
    "landmark.hitchingpost": ["lamp.post"],
    "market.stalls": ["building.shop", "camp.table"],
    "garden.rockery": ["rock.crag", "rock.big"],
    "garden.trellis": ["plant.flower", "plant.bush"],
    "garden.screenwall": ["furn.screen", "landmark.notice"],
    "tree.willow": ["tree.small"],
    "corral": ["camp.logs"],
    "furn.dais": ["furn.rug"],
    "furn.curtain": ["furn.screen"],
    "furn.swordwall": ["furn.rack", "lamp.post"],
    "furn.window": ["furn.shelf"],
    "furn.lamp": ["lamp.post"],
    "furn.seat": ["furn.stool"],
    "furn.qin": ["furn.desk", "furn.table"],
}

# people: folk.* are townsfolk drawn by the kit; hero.<id> are story
# characters drawn by the game itself (TKArt), so every kit shows them the same.
FOLK = ["folk.villager", "folk.woman", "folk.elder", "folk.child", "folk.monk",
        "folk.noble", "folk.soldier", "folk.rebel", "folk.hunter", "folk.official",
        "folk.lady", "folk.maiden", "folk.girl"]  # court ladies (high chignons), maidens (looped buns) and girls: drawn by the game in every kit
FOLK_FALLBACK = "folk.villager"
