"""What the generated Chinese-fantasy kit ("xianxia") is made of: every ground tile and outdoor
object the World 1 maps use, with the prompt that makes it and the size it must fit (the Jade
kit's footprint, so map layouts don't change). tools/gen_pixel.py --set xianxia makes them,
tools/build_xianxia_kit.py packs them into a kit. Interiors keep the current art for now.

GROUND: 16x16 seamless tiles, several variants each.
OBJECTS: kind -> (prompt, (w, h) to fit, variants).
"""

# the ground materials taken from GROUND; the rest stay the Jade kit's (the first generated
# grass, dirt and stone came out as yellow sand and patterned rugs: regenerate before adding them)
USE_GROUND = set()

GROUND = {
    "grass": ("soft light jade-green grass, a few tiny flowers, even and calm", 4),
    "dirt": ("packed light-brown earth path, a few small pebbles, even", 2),
    "sand": ("pale cream sand, smooth, a few grains", 2),
    "water": ("clear teal pond water, gentle ripples, even", 2),
    "stone": ("pale grey square flagstone paving, thin dark seams", 2),
}

OBJECTS = {
    # buildings
    "building.house": ("small Chinese village house, white plaster walls, dark grey curved tile roof, wooden door", (48, 46), 2),
    "building.hut": ("humble Chinese farm hut, mud walls, thatched straw roof, wooden door", (48, 44), 1),
    "building.shop": ("Chinese market shop, open wooden front with goods, grey curved tiled roof, red cloth awning", (96, 64), 1),
    "building.inn": ("two-storey Chinese inn, red lacquered pillars, grey curved tiled roof, red lanterns, wine flag", (96, 72), 1),
    "building.lodge": ("long low Chinese farmhouse, grey tiled roof, wooden veranda", (84, 48), 1),
    "building.hall": ("Chinese government hall, red pillars, curved jade-green glazed tile roof, white stone steps", (72, 88), 1),
    "building.tent": ("ancient Chinese army tent, cream canvas with red trim, open flap", (48, 46), 2),
    "building.moongate": ("round moon gate in a short white plaster wall with grey tile coping", (48, 40), 1),
    "building.gate": ("Chinese wooden memorial archway, red pillars, small curved tiled roof", (40, 36), 1),
    "landmark.notice": ("wooden notice board with paper notices under a small tiled roof", (40, 34), 1),
    "furniture.gotable": ("small square stone table with a go board on it", (24, 16), 1),
    "lamp.post": ("Chinese stone garden lantern", (16, 32), 1),
    "banner.red": ("tall narrow red silk war banner on a wooden pole", (16, 30), 1),
    "banner.yellow": ("tall narrow yellow silk banner on a wooden pole", (16, 30), 1),
    # camp
    "camp.table": ("low wooden camp table with a map scroll on it", (28, 28), 1),
    "camp.firepit": ("ring of stones with a small burning campfire", (32, 18), 1),
    "camp.logs": ("stack of cut firewood logs", (48, 24), 1),
    "camp.hay": ("round haystack", (32, 30), 1),
    # trees and plants
    "tree.pine": ("Chinese pine tree, flat layered clusters of dark green needles, twisting trunk", (32, 34), 3),
    "tree.small": ("round leafy green tree", (36, 40), 3),
    "tree.grove": ("cluster of three leafy green trees", (70, 54), 2),
    "tree.peach": ("peach tree in full pink blossom, dark twisting trunk", (36, 40), 2),
    "tree.peach_big": ("large old peach tree in full pink blossom, wide canopy", (48, 48), 1),
    "tree.big": ("large old camphor tree, wide dark green canopy", (48, 48), 1),
    "tree.dead": ("bare dead tree, gnarled grey branches", (32, 32), 2),
    "plant.grass": ("small tuft of tall green grass", (16, 16), 2),
    "plant.bush": ("small round green shrub", (16, 16), 2),
    "plant.flower": ("small patch of pink and white wildflowers", (16, 16), 2),
    "rock.small": ("small grey stone", (16, 13), 2),
    "rock.big": ("large mossy grey boulder", (60, 44), 2),
    "rock.crag": ("tall jagged grey rock spire", (48, 46), 2),
}
