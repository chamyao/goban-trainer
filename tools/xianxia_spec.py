"""What the generated Chinese-fantasy kit ("xianxia") is made of: every ground tile and outdoor
object the World 1 maps use, with the prompt that makes it and the size it must fit (the Jade
kit's footprint, so map layouts don't change). tools/gen_pixel.py --set xianxia makes them,
tools/build_xianxia_kit.py packs them into a kit. Interiors keep the current art for now.

GROUND: 16x16 seamless tiles, several variants each.
OBJECTS: kind -> (prompt, (w, h) to fit, variants).
"""

# Ground is drawn (tools/build_xianxia_kit.py, ground()) in colours matched to the objects: the
# generated ground came out as yellow sand and patterned rugs. GROUND below is kept for a retry.
DRAWN_GROUND = ("grass", "dirt", "sand", "water")

# pieces that came out wrong (a box for a go table, shrines for small rocks...): they keep the
# Jade kit's art until they are regenerated
REDO = {"furniture.gotable", "camp.table", "camp.hay", "building.moongate", "rock.small"}

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


# Story characters as 4-direction walking sheets (rd-animation four_angle_walking, 48x48 frames:
# 4 directions x 4 steps). Looks follow the stills' cast (tools/tk_stills.py CAST).
CHARACTERS = {
    "liubei": "young Chinese hero, white robe with gold trim and a green sash, black topknot, short neat black beard, "
              "twin swords at his belt, calm",
    "guanyu": "tall Chinese general, full head of black hair in a topknot under a green cloth headscarf, deep red "
              "face, very long flowing black beard reaching his chest, long green robe, holding a crescent-bladed glaive",
    "zhangfei": "burly Chinese warrior in a dark brown robe with a black sash, no armour, black hair in a topknot, big "
                "wild black beard covering his jaw, round fierce eyes, holding a long serpent spear",
}

# how many tries (different seeds) to make of each, to choose from: char.<who>-<n>.png
CHAR_TRIES = {"liubei": 1, "guanyu": 3, "zhangfei": 3}
# which try is used in the game (the user's pick), and how tall the heroes stand in pixels
CHAR_PICK = {"liubei": 1, "guanyu": 1, "zhangfei": 2,   # the user's picks
             **{k: 1 for k in ("caocao", "dongzhuo", "zhangjiao", "zhangbao", "luzhi", "zhujun", "huangfusong",
                               "militia", "rebel", "f_soldier", "f_farmer", "f_official", "f_woman", "f_elder")}}
HERO_H = 22


# ---- parallel batches (each run by its own helper session, into assets/tk/gen/<set>/) ----

# second tries at the pieces that came out wrong (REDO), with plainer prompts
REDO_OBJECTS = {
    "furniture.gotable": ("small square grey stone table with a weiqi board on top, black and white stones on it", (24, 16), 2),
    "camp.table": ("low plain wooden table with a rolled-up map scroll on it", (28, 28), 2),
    "camp.hay": ("pile of golden straw, loose hay heap", (32, 30), 2),
    "building.moongate": ("short white plaster garden wall with a big round moon-shaped doorway through its middle, "
                          "grey tiles along the top", (48, 40), 2),
    "rock.small": ("a single small rough grey stone, nothing else", (16, 13), 2),
}

# indoor furniture for the rooms (Jade's are Ninja Adventure pieces)
INTERIOR = {
    "furn.stool": ("small round wooden stool", (14, 13), 2),
    "furn.jar": ("Chinese ceramic wine jar with a cloth-tied lid", (14, 16), 2),
    "furn.shelf": ("tall wooden shelf with scrolls, bowls and boxes", (32, 30), 2),
    "furn.table": ("low square Chinese wooden table", (28, 28), 2),
    "furn.plant": ("potted bonsai pine in a blue ceramic pot", (15, 24), 2),
    "furn.barrel": ("wooden barrel with iron bands", (16, 30), 1),
    "furn.chest": ("red lacquered wooden chest with brass fittings", (16, 13), 2),
    "furn.sacks": ("stack of grain sacks", (14, 26), 1),
    "furn.bed": ("simple Chinese wooden bed with a blue quilt", (24, 16), 1),
    "furn.drawers": ("Chinese wooden cabinet with small drawers and brass pulls", (16, 23), 1),
    "furn.mat": ("woven straw floor mat", (32, 32), 1),
    "furn.desk": ("long low Chinese writing desk with brush, ink stone and scrolls", (46, 14), 2),
    "furn.counter": ("long wooden shop counter", (46, 14), 1),
    "furn.rack": ("wooden weapon rack with spears and halberds", (32, 22), 1),
    "furn.screen": ("folding Chinese screen painted with mountains and cranes", (32, 30), 2),
    "furn.rug": ("red patterned Chinese rug", (48, 48), 1),
    "furn.hearth": ("brick cooking stove with a wok and a fire", (32, 24), 1),
}

# the rest of the cast as walking sheets (CHARACTERS covers the three brothers)
CHARACTERS2 = {
    "caocao": "sharp-eyed Chinese commander, short goatee, black official's cap, dark red robe with gold trim, sword at his side",
    "dongzhuo": "fat, arrogant Chinese warlord, short beard, black official's cap, purple robe with gold trim",
    "zhangjiao": "old Chinese sorcerer, long white hair and long white beard, yellow headscarf, flowing yellow robe, holding a staff",
    "zhangbao": "wild-haired Chinese sorcerer general, yellow headscarf, yellow robe, holding a sword",
    "luzhi": "dignified old Chinese scholar-general, long grey beard, black official's cap, blue robe with pale trim",
    "zhujun": "Chinese imperial general, short beard, grey iron helmet, dark red robe over armour, sword",
    "huangfusong": "Chinese imperial general, long black beard, grey iron helmet, blue robe over armour, sword",
    "militia": "young Chinese village volunteer, red headband, olive-green tunic, holding a spear",
    "rebel": "Yellow Turban rebel, yellow headscarf, ragged brown tunic, holding a spear",
    "f_soldier": "Han dynasty soldier, grey iron helmet, red tunic, holding a spear",
    "f_farmer": "Chinese peasant farmer, straw hat, plain brown clothes",
    "f_official": "Chinese clerk, black official's cap, blue robe, thin moustache",
    "f_woman": "Chinese village woman, hair in a bun with a red pin, pink dress",
    "f_elder": "old Chinese village elder, long white beard, pale robe, walking stick",
}


# Props for the xianxia kit only (the Jade kit keeps the hand-drawn ones in drawn.png and props.png).
# Map kinds by their vocab name; cutscene props as "prop.<atlas frame>" (tools/build_props.py), which the
# cutscene player uses in place of the atlas frame when the kit has one.
PROPS_GEN = {
    "landmark.shrine": ("small outdoor weiqi shrine: a carved grey stone stele with a little tiled cap, a square stone "
                        "go board on a low plinth in front of it with a few black and white stones, a small bronze "
                        "incense burner beside it", (32, 30), 2),
    "ruin.hall": ("burned-out ruin of a Chinese hall: roofless, charred black pillars of different heights on a grey "
                  "stone base, a fallen burnt beam, ash", (64, 44), 2),
    "ruin.columns": ("two charred black wooden columns on a stone base, one snapped short, ash around them",
                     (32, 40), 2),
    "ruin.rubble": ("small heap of grey stones and burnt black timber", (16, 12), 2),
    "prop.pig": ("a pink domestic pig tied with a rope round its middle, side view", (20, 14), 2),
    "prop.well": ("round grey stone well with a wooden frame, little tiled roof and a rope bucket", (28, 30), 2),
    "prop.mirror": ("round polished bronze mirror on a small carved wooden stand", (16, 22), 2),
    "prop.pond": ("small oval lotus pond with a grey stone rim, lily pads and pink lotus flowers", (36, 18), 2),
    "prop.cagecart": ("wooden prisoner cage on a two-wheeled cart, thick wooden bars", (48, 40), 2),
    "prop.cart": ("small wooden handcart with two wheels and long handles", (32, 28), 2),
    "prop.forge": ("blacksmith's stone forge with glowing orange coals", (32, 26), 2),
    "prop.anvil": ("iron blacksmith's anvil on a wooden stump", (16, 14), 2),
    "prop.ox": ("black ox standing, side view", (24, 18), 2),
    "prop.post": ("thick wooden hitching post with an iron ring", (12, 20), 2),
    "prop.steelbars": ("small stack of iron ingots", (16, 10), 2),
    "prop.staves": ("bundle of four wooden staves leaning together", (16, 18), 2),
    "prop.switches": ("bundle of thin green willow switches tied with string", (16, 12), 2),
    "prop.waterbowl": ("plain clay bowl of water", (14, 10), 2),
    "prop.book": ("rolled bamboo-slip book tied with cord", (14, 10), 2),
    "prop.letter": ("folded letter on yellowed paper", (14, 10), 2),
    "prop.seal": ("square jade official seal with a carved animal on top", (12, 12), 2),
}

# generated props that came out unreadable at this size: the kit keeps the drawn atlas frame for these
PROPS_SKIP = {"prop.forge", "prop.cart", "prop.anvil", "prop.steelbars", "prop.staves", "prop.switches", "prop.book"}
