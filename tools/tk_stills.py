"""The stills: painted images for the moments a pixel map can't show.

A scene shows one with the story step ["still", id, move] (tk-cutscene.js):
it fades in over the map, drifts (a Ken Burns pan or zoom) while the lines
play over it, then fades back. tools/gen_stills.py makes the images from
the prompts below; a still that hasn't been made yet is simply skipped.

Three things keep the set looking like one hand and the people like
themselves:

    STYLE  one short style line, the end of every request (portraits too)
    CAST   each person's fixed look, added to every request that names them
    refs   images sent with the prompt, on models that take them (flux-2-klein,
           up to 5): first any style images in assets/tk/stills/refs/style/
           (art to match the look of; the user's, kept on the samples branch,
           not in the game), then the approved portrait of each person the
           still names (assets/tk/stills/refs/<key>.jpg, chosen with --pick)

A request is built in this order, most important first (models weigh the
start of a prompt most, and flux-schnell cuts off after ~256 tokens): the
scene, then the cast it names, then the style. Keep a scene to about 60
words and name people only; their look belongs in CAST.
"""
import re

# the user's pick from the candidates below (gongbi), with what it tended to add uninvited ruled out
# what every still rules out, whatever its look
NEGATIVE = ("No text, no speech or thought bubbles, no captions, no calligraphy, no inscriptions, no characters, "
            "no red seal stamps, no seals, no signature, no watermark. Han dynasty China, about 184 AD: no guns, "
            "rifles, firearms, modern helmets or modern uniforms, no glass, no paved roads.")
# the same exclusions as a list, for models that take a separate negative prompt (gen_stills: qwen)
NEGATIVE_LIST = ("text, letters, words, Chinese characters, calligraphy, inscriptions, writing on signboards, "
                 "writing on lanterns, writing on banners, seal stamps, red seals, signature, watermark, speech "
                 "bubbles, captions, guns, rifles, firearms, modern helmets, modern uniforms, modern shoes, sneakers, "
                 "glass, glass windows, paved roads, extra people, duplicate person")
STYLE = ("Style: Chinese gongbi painting brought to a modern game illustration: fine ink outlines, rich flat "
         "mineral colours, gold leaf accents, stylised clouds and waves. " + NEGATIVE)

# candidates for STYLE, to choose by eye (gen_stills.py --styles): the user wants the stills to
# look like modern Chinese xianxia game art, Sword and Fairy cover art especially
STYLES = {
    "paladin": "Style: Chinese xianxia game cover art in the style of Sword and Fairy (Chinese Paladin): "
               "semi-realistic digital painting, elegant figures with flowing hair and silk robes, ethereal glowing "
               "light, misty mountains, soft luminous colours, cinematic composition.",
    "wuxia": "Style: modern Chinese wuxia game key art, like Wandering Sword and Where Winds Meet: cinematic, "
             "realistic digital painting, dramatic lighting, rich detail in silk and armour, dust and petals in the "
             "air, epic scale.",
    "inkwash": "Style: Chinese fantasy illustration blending traditional ink-wash painting with modern digital art: "
               "flowing brushstrokes, mist, muted jade and vermilion, rice-paper texture, bold negative space.",
    "liyue": "Style: anime Chinese fantasy key art like Genshin Impact's Liyue: clean cel shading, vivid colours, "
             "glowing particles, ornate gold details, jade-green and crimson.",
    "gongbi": "Style: Chinese gongbi painting brought to a modern game illustration: fine ink outlines, rich flat "
              "mineral colours, gold leaf accents, stylised clouds and waves.",
    "ghibli": "Style: in the style of Studio Ghibli: hand-painted anime, soft watercolour backgrounds, warm natural "
              "light, gentle rounded character designs, lush detailed nature, calm storybook mood.",
    # anime looks the user asked to compare (named, and described in words for models that don't know the name)
    "towerofgod": "Style: in the style of the anime Tower of God: clean modern Korean webtoon anime, sharp angular "
                  "lineart, flat cel shading with soft gradients, cool muted colours with glowing highlights, "
                  "dramatic framing.",
    "gohs": "Style: in the style of the anime The God of High School: bold dynamic action anime, thick energetic "
            "lineart, high contrast, vivid saturated colours, speed lines and impact effects, extreme fighting poses.",
    # the same anime look for the quiet scenes (the user: "too crazy on scenes that are supposed to be calm ...
    # why is even them sharing a drink so violent"): the battles keep "gohs"
    "gohs_calm": "Style: anime illustration with the character designs and clean bold lineart of The God of High "
                 "School, but a calm, quiet slice-of-life moment: relaxed natural poses, gentle expressions, soft warm "
                 "natural light, a still, peaceful village mood, a steady eye-level camera; no action lines, no speed "
                 "lines, no impact effects, no flying debris, no motion blur, no aggressive poses.",
    # the default for every still that isn't a battle (the user: "only use GoH for battle scenes, something more
    # neutral as default"): calm, story-telling, no action effects
    "neutral": "Style: clean modern anime illustration like a quiet historical anime film: natural colours, soft "
               "daylight or warm lamplight, gentle cel shading, detailed painted backgrounds, calm story-telling "
               "composition at eye level, natural poses and expressions; no speed lines, no impact effects, no "
               "motion blur, no exaggerated action poses.",
    "genshin": "Style: in the style of Genshin Impact key art: polished anime cel shading, bright vivid colours, "
               "ornate gold trim and jade accents, glowing particles, clean detailed fantasy illustration.",
    "watercolor": "Style: Chinese watercolour painting: loose wet washes of colour bleeding softly on rice paper, "
                  "light expressive ink brush outlines, muted earthy tones with touches of vermilion and jade, misty "
                  "atmosphere, generous white space, figures painted with a few confident strokes.",
    "mahjongsoul": "Style: in the style of Mahjong Soul character art: glossy modern anime illustration, soft "
                   "pastel-bright colours, clean thin lineart, smooth shading, cute stylised attractive characters.",
    # the user asked to see the look of the donghua Rakshasa Street, described in words (no show named)
    "donghua": "Style: modern Chinese donghua key frame: crisp clean lineart and cel shading, high contrast, "
               "dramatic rim light and back light, a dark moody palette of ink blacks, deep teal and crimson with "
               "glowing accents of spirit light and embers, a dynamic low or high camera angle, intense poses, "
               "cinematic and dark-fantasy.",
}

# the battles keep the God of High School look; every other still is "neutral"
BATTLE = {"blackwind_a", "blackwind_c", "bosswin_a", "caocao3_b", "hulao_a", "hulao_b", "xianshan_a", "xingyang_a",
          "zumao_a"}

# the quiet stills, redone in "gohs_calm" (village, inn, oath, partings); the battles stay "gohs"
CALM = ["tree_a", "tree_b", "notice_a", "notice_b", "inn_a", "inn_b", "oath_a", "oath_b", "oath_c", "tent_b",
        "tent_c", "cart_b", "cart_c", "caocao2_b", "bosswin_c", "horses_a", "horses_b", "post_a"]
# Book 2's quiet ones (garden_a stays: the user picked that one)
CALM2 = ["fireflies_a", "pavilion_a", "wine_a", "wine_b", "lvboshe_a", "seal_a", "seal_b", "ruins_a"]

# the user's pick for the stills: the God of High School look, on Seedream 5 Pro (gen_stills' default)
STYLE = f"{STYLES['gohs']} {NEGATIVE}"

# candidates for the portrait framing (the reference faces), to choose by eye
PORTRAITS = {
    "bust": "Character face portrait of {name}, {look}. Head and shoulders close-up, the face filling most of the "
            "frame, three-quarter view, a characteristic expression, plain flat background.",
    "card": "Character art of {name}, {look}. Half-body, three-quarter view, holding {held}, a "
            "characteristic expression, swirling mist and clouds behind him, like a game character card.",
    "select": "Full-body character art of {name}, {look}. Standing in a heroic pose, whole figure visible from head "
              "to feet, soft gradient background, like a game's character select screen.",
}

# key -> (name as the scenes write it, look)
CAST = {
    "liubei": ("Liu Bei", "a gentle man of twenty-eight with a short neat black beard, long earlobes and "
                          "kind eyes, hair in a topknot, in a white robe trimmed with gold"),
    "guanyu": ("Guan Yu", "a towering giant of a man, a head taller than anyone, with massive shoulders and a thick "
                          "neck, a deep red face (only his face is red; his neck and hands are normal skin), a very long black beard down to his chest and narrow eyes under "
                          "heavy brows, hair in a topknot, in a green robe"),
    "zhangfei": ("Zhang Fei", "a stocky, barrel-chested, powerfully muscled man, broad rather than tall, with a fierce square jaw, big glaring eyes and "
                              "a wild bristling black beard, hair in a topknot, in black and dark brown clothes"),
    "luzhi": ("Lu Zhi", "a dignified old scholar-general with a long grey beard, in plain grey clothes"),
    "zhangbao": ("Zhang Bao", "a sorcerer general with long loose black hair and a yellow headscarf, "
                              "in a yellow robe"),
    "zhangjiao": ("Zhang Jiao", "a gaunt old sorcerer with long white hair and a long white beard, a yellow headscarf "
                                "and a flowing yellow robe, burning eyes"),
    "caocao": ("Cao Cao", "a lean man of about thirty with a thin moustache and a quick, sharp look, black official's "
                          "cap, dark red robe with gold trim"),
    "dongzhuo": ("Dong Zhuo", "a huge, heavy, bearded bully of a warlord with a sneer, in a general's armour"),
    "zhujun": ("Zhu Jun", "an imperial general with a short beard, iron helmet, dark red robe over armour"),
    "huangfusong": ("Huangfu Song", "an imperial general with a long black beard, iron helmet, blue robe over armour"),
    "inspector": ("the inspector", "a plump, sneering court official with a thin moustache, in a Han dynasty black "
                                   "gauze official's cap (a small stiff cap with two flaps, not a top hat) and a blue silk robe"),
    # Book 2 (World 2)
    "lvbu": ("Lü Bu", "a tall, strikingly handsome young warrior, broad-shouldered, in ornate red and gold armour with "
                     "a gold crown bearing two long pheasant-feather plumes, carrying a tall crescent-bladed halberd"),
    "yuanshao": ("Yuan Shao", "a proud, richly dressed nobleman in his forties with a neat beard, in a purple brocade "
                              "robe and a tall official's cap"),
    "gongsunzan": ("Gongsun Zan", "a lean general in white armour on a white horse"),
    "sunjian": ("Sun Jian", "a broad, powerful general in his late thirties with a short beard, in red lacquered armour "
                            "and a red cap"),
    "dingyuan": ("Ding Yuan", "an old provincial governor with a grey beard, in a dark official robe"),
    "chengong": ("Chen Gong", "a thin, upright county magistrate in his thirties with a sparse beard, in a plain dark "
                              "robe and scholar's cap"),
    "caohong": ("Cao Hong", "a sturdy young officer with a short beard, stripped to a plain tunic"),
    "lvboshe": ("Lü Boshe", "a kindly old farmer with a white beard, in a patched hemp robe and a straw hat"),
    "wangyun": ("Wang Yun", "an old minister with a long grey beard, in dark court robes and a tall official's cap"),
    "diaochan": ("Diaochan", "a graceful young woman of sixteen in a pale silk robe, hair in an elegant bun with a "
                             "jade pin"),
    "lisu": ("Li Su", "a lean officer in plain armour with a drawn sword"),
    "zumao": ("Zu Mao", "a wiry officer in red armour with two swords"),
    "xushao": ("Xu Shao", "a calm scholar with a thin beard and knowing eyes, scholar's hat, pale robe"),
}


def style_note(n):
    """What to say about n style reference images sent first."""
    if not n:
        return ""
    which = "Reference image 1 shows" if n == 1 else f"Reference images 1-{n} show"
    return (f"{which} the art style only: match its line work, colours, shading and texture, "
            f"but not its characters, clothes, objects or background. ")


# how a person's portrait is shot, when not at eye level (a low camera makes Guan Yu read as big)
ANGLE = {"guanyu": "Seen from slightly below, looming, his shoulders filling the frame."}


# what each holds in his portrait card
HELD = {"liubei": "a pair of twin swords", "guanyu": "a long crescent-bladed glaive, the Green Dragon blade",
        "zhangfei": "a long spear with a wavy serpent blade", "caocao": "a sword", "zhangjiao": "a tall wooden staff",
        "zhangbao": "a sword", "luzhi": "a rolled scroll", "zhujun": "a sword", "huangfusong": "a sword",
        "dongzhuo": "a wine cup", "xushao": "a writing brush"}


def portrait(key, n_style=0):
    """The request for a person's reference portrait (the "card" framing, the user's pick): what the
    stills are given to keep a face and costume the same from one image to the next."""
    name, look = CAST[key]
    return (f"{PORTRAITS['card'].format(name=name, look=look, held=HELD.get(key, 'nothing, hands folded'))} "
            f"{ANGLE[key] + ' ' if key in ANGLE else ''}{style_note(n_style)}{STYLE}")


STILLS = {
    "oath": {
        "scene": "oath",
        "prompt": "Three sworn brothers kneel side by side at an altar in a peach orchard in full pink blossom, "
                  "burning incense; a black ox and a white horse stand tethered for the sacrifice; petals drift "
                  "in spring light. Liu Bei in the middle, Guan Yu on the left, Zhang Fei on the right.",
    },
    # the feast after the oath: "Three hundred village braves join them, and they drink in the garden
    # until they can drink no more." Three framings to choose from.
    "feast_wide": {
        "scene": "oath",
        "prompt": "A joyful feast in a peach orchard in full pink blossom at golden dusk: Liu Bei, Guan Yu and "
                  "Zhang Fei sit at a low wooden table heaped with wine jars and bowls, surrounded by cheering "
                  "village volunteers in rough hemp clothes raising cups; paper lanterns hang in the branches.",
    },
    "feast_toast": {
        "scene": "oath",
        "prompt": "Close, warm shot of three sworn brothers raising wine bowls together in a toast under "
                  "blossoming peach trees, wine splashing, soft evening light: Liu Bei in the middle smiling "
                  "gently, Guan Yu calm and proud, Zhang Fei roaring with laughter.",
    },
    "feast_night": {
        "scene": "oath",
        "prompt": "Night in a peach orchard after a feast: village volunteers dance and sing around a bonfire, "
                  "sparks rising into the blossoms. Zhang Fei has fallen asleep sitting against a giant wine "
                  "jar, eyes closed; Liu Bei and Guan Yu watch from the table, smiling.",
    },
    "yellow_turbans": {
        "scene": "daxing",
        "prompt": "A vast rebel host of fifty thousand men in yellow headscarves fills a valley below Daxing "
                  "Mountain, banners of yellow cloth, dust rising, seen from a ridge where five hundred volunteer "
                  "soldiers wait in a small dark line.",
    },
    "black_wind": {
        "scene": "blackwind",
        "prompt": "Zhang Bao raises a sword and chants on a hilltop; a black whirlwind of storm cloud, sand and "
                  "stones pours from the sky onto a line of soldiers, with ghostly paper figures of men and horses "
                  "riding in the wind.",
    },
    "cage_cart": {
        "scene": "cart",
        "prompt": "On a dusty road Lu Zhi sits inside a wooden prisoner's cage cart guarded by soldiers with "
                  "spears; Liu Bei, Guan Yu and Zhang Fei have reined in their horses beside it, Zhang Fei "
                  "gripping his spear in fury.",
    },
    "yangcheng": {
        "scene": "bosswin",
        "prompt": "The walled city of Yangcheng under siege at dusk, the government army's red banners ringing the "
                  "walls, the city gate opening from within as a traitor officer surrenders; smoke over the roofs.",
    },
}


def cast_in(sid):
    """The CAST keys a still's scene names, in the order they appear."""
    scene = STILLS[sid]["prompt"]
    found = [(scene.find(name), key) for key, (name, _) in CAST.items() if re.search(rf"\b{name}\b", scene)]
    return [key for _, key in sorted(found)]


def prompt(sid, n_style=0, cast_refs=()):
    """The full request for a still: scene, then the cast it names, then the style. With reference
    images, n_style style images come first, then a portrait for each key in cast_refs, in order."""
    if STILLS[sid].get("raw"):   # a mock screen, sent as written
        return STILLS[sid]["prompt"]
    parts = [STILLS[sid]["prompt"]]
    for key in cast_in(sid):
        name, look = CAST[key]
        ref = (f" (reference image {n_style + list(cast_refs).index(key) + 1}: keep his face, hair and clothes)"
               if key in cast_refs else "")
        parts.append(f"{name} is {look}{ref}.")
    return " ".join(parts) + " " + style_note(n_style) + STYLE


# ---- the World 1 set: every scene seen three ways, for variety --------------------------------
# A: wide, the place and the event. B: close, a face and a feeling. C: a telling detail, a mood,
# a dramatic angle. Times of day and weather are spread across the set on purpose.
LENSES = ("a", "b", "c")

SCENES = {
    "tree": (
        "A humble village of earth-walled houses at golden morning, and above it a gigantic mulberry tree, "
        "its round crown spreading like the canopy of an imperial carriage; villagers pause in the lane to stare up.",
        "A small boy of six in a plain hemp tunic and straw sandals, hair in two tufts, stands under a great mulberry tree, "
        "chin up, pointing at its canopy and declaring he will ride in a carriage like that one day; his uncle, a strong "
        "dark-haired man with a short black beard, in a farmer's hemp robe, startled beside him, hand raised to hush him. Han dynasty China, about 184 AD: nothing modern, no glass, no paved roads.",
        "Looking straight up through the leaves of a vast mulberry tree, sunlight breaking through in rays, the leaves "
        "forming a perfect round canopy against a deep blue sky.",
    ),
    "notice": (
        "A dusty county town square at noon, a crowd of townsfolk pressing around a notice pasted on a whitewashed "
        "wall, red official seals on the paper, banners stirring in a hot wind.",
        "Liu Bei stands at the back of the crowd reading the notice, sighing deeply, while behind him Zhang Fei looms "
        "with arms folded, glaring, about to call out to him.",
        "Close on the notice itself, brushed characters and a red seal on rough paper nailed to a wall, a hand reaching "
        "toward it, shadows of the crowd falling across.",
    ),
    "inn": (
        "A warm, crowded village inn at evening, lanterns glowing, as the door bangs open and Guan Yu strides in pushing "
        "a handcart, everyone turning to look; Liu Bei in white and Zhang Fei in black at a table by the wall, clay "
        "wine jars and bowls on it. Bare plank walls, no scrolls or hangings.",
        "Exactly three men leaning together over a small inn table: Liu Bei in white on the left, Guan Yu in green with a "
        "long black beard in the middle, Zhang Fei in black on the right, with shallow clay wine bowls, deep in talk, faces lit by a single small oil lamp, the rest of the room fading into shadow.",
        "Rain streaking past the paper window of an inn at night, the warm silhouettes of three men inside, a handcart "
        "left out in the wet lane.",
    ),
    "oath": (
        "A peach orchard in full pink blossom at dawn, an altar with incense smoke curling upward, a black ox and a white "
        "horse tethered for the sacrifice, three figures kneeling, petals drifting through shafts of light.",
        "Liu Bei, Guan Yu and Zhang Fei kneeling side by side before the altar, eyes closed, hands clasped, swearing "
        "brotherhood, incense smoke between them, petals in their hair.",
        "Exactly three hands, each holding one small bronze wine cup, the three cups touching in the middle in a toast: "
        "one hand in a white sleeve from the left, one in a green sleeve from the top, one in a black sleeve from the "
        "right. A carved table below, blossoming peach branches around. Han dynasty China, about 184 AD: nothing "
        "modern, no glass, no paved roads.",
    ),
    "council": (
        "A grand hall of a provincial governor, red pillars and a raised dais, officers in rows, a messenger kneeling "
        "with urgent news of rebels crossing the border.",
        "Liu Bei bowing before the governor in a lamplit hall, his brothers behind him, the governor leaning forward "
        "with interest on hearing he is of the imperial clan.",
        "A map of the province spread on a lacquered table, a red brush mark across it where the rebels advance, "
        "a candle guttering beside it.",
    ),
    "daxing": (
        "A vast rebel host in yellow headscarves pouring down the slopes of Daxing Mountain under yellow banners, dust "
        "rising, while a small line of five hundred volunteers waits on the plain below.",
        "Guan Yu on horseback charging, his long glaive sweeping, his long black beard streaming in the wind, eyes "
        "blazing, enemy banners falling around him.",
        "A fallen yellow banner trampled in the mud of a battlefield at sunset, smoke drifting, the sky red behind "
        "a mountain ridge.",
    ),
    "qingzhou": (
        "The walled city of Qingzhou besieged under grey skies, rebel tents ringing its walls, while on the hills "
        "around, hidden soldiers crouch behind rocks waiting for the signal.",
        "Liu Bei on a hilltop at dusk raising his hand to give the signal, Guan Yu and Zhang Fei waiting tense at his "
        "sides, drums ready.",
        "Gongs and war drums on a hillside, drumsticks raised, smoke from below, the moment before the ambush.",
    ),
    "tent": (
        "An imperial army camp outside Guangzong at evening, rows of tents and banners, campfires lit, and the command "
        "tent glowing in the middle.",
        "Inside a lamplit army tent, Liu Bei bowing low to his old teacher Lu Zhi, who rises from his desk smiling to "
        "greet him; a bronze oil lamp on the desk is the only light.",
        "A general's desk in a tent: scrolls, a brush, an inkstone and a battle map pinned with small flags, "
        "lit by a small open-flame bronze oil lamp, a shallow dish with a wick, no glass, no arm; light and shadow. Han dynasty China, about 184 AD: nothing modern, no glass, no paved roads.",
    ),
    "fireplan": (
        "Night at Changshe: a rebel camp of tents in tall dry grass, a strong wind bending the grass, imperial soldiers "
        "creeping in the dark with torches.",
        "Huangfu Song and Zhu Jun standing on a rise, cloaks whipping in the wind, watching the first flames catch "
        "in the grass below.",
        "A wall of fire racing through tall grass under a black sky, sparks streaming in the wind.",
    ),
    "caocao3": (
        "At dawn after the fire, fleeing rebels on a smoking plain run straight into a line of soldiers under bright "
        "red banners that appear over the hill.",
        "Cao Cao on horseback at the head of his red-bannered cavalry, half-smiling, sword drawn, as the sun rises "
        "behind him.",
        "A row of red banners snapping in the wind against a pale dawn sky, smoke still rising from the plain.",
    ),
    "cart": (
        "A dusty road between fields, a wooden prisoner's cage cart escorted by soldiers with spears, and three riders "
        "who have reined in beside it.",
        "Lu Zhi in the cage cart, calm and dignified, speaking quietly to Liu Bei through the bars, while Zhang Fei "
        "behind him grips his spear in fury.",
        "Close on the rough wooden bars of a cage cart and an old scholar's hands resting on them, a lonely rutted "
        "dirt road with wheel tracks, no paving, no markings, stretching away under clouds. Han dynasty China, about "
        "184 AD: nothing modern, no glass, no paved roads.",
    ),
    "office": (
        "Han troops fleeing in rout across hills under a stormy sky, pursued by Yellow Turbans, as three brothers "
        "charge in from the side and turn the battle.",
        "Dong Zhuo seated in his army camp with banners behind him, sneering down at Liu Bei standing before him, as "
        "Zhang Fei lunges for his sword in rage and Liu Bei and Guan Yu together hold him back.",
        "An overturned bronze ding-shaped wine vessel with handles, clearly an ancient vessel, not a can, on a table, wine spilling, the shadow of a raised fist on the tent wall. Han dynasty China, about 184 AD: nothing modern, no glass, no paved roads.",
    ),
    "blackwind": (
        "Zhang Bao on a hilltop with his hair loose, sword raised, chanting, as a black whirlwind of storm cloud, sand "
        "and stones pours down onto a line of soldiers.",
        "Soldiers shielding their faces from a howling black wind, their horses rearing, Liu Bei turning his horse to "
        "flee, his brothers beside him.",
        "Ghostly paper cut-out soldiers and horses riding in a black wind, swirling like leaves, under a dark sky.",
    ),
    "bosswin": (
        "A hillside ambush: soldiers hurl jars of filth at the summoned wind, and the sorcery breaks apart into "
        "fluttering paper scraps falling from the sky.",
        "Zhang Bao on his horse, his face turning to dismay as his spell fails and paper figures crumble around him.",
        "Torn paper cut-outs shaped like little horsemen and spearmen, flat red and white Chinese paper cuttings, "
        "drifting down like leaves onto empty grass in clear light after a storm, the sky breaking open. No real "
        "people in the picture.",
    ),
    "peace1": (
        "A failed scholar gathering herbs in misty mountains, a hidden cave mouth among pines, an old man with a "
        "child's face and a staff waiting at its entrance.",
        "The old immortal in the cave handing three scrolls of a sacred book to the young Zhang Jiao, who kneels to take "
        "them, light glowing from the pages.",
        "Three ancient scrolls tied with cord resting on a stone in a cave, a beam of light falling on them through the "
        "mist.",
    ),
    "peace2": (
        "A plague-stricken town where crowds kneel before Zhang Jiao as he gives out charm water; yellow cloths "
        "everywhere, and the characters 甲子 chalked on the doors.",
        "Zhang Jiao, white-haired, raising his arms before a vast crowd in yellow headscarves at sunset, preaching "
        "that the Blue Heaven is dead and the Yellow Heaven shall rise.",
        "A wooden door with 甲子 chalked on it in white, a yellow cloth tied to the handle, at dusk.",
    ),
    "peace3": (
        "Night in the imperial capital Luoyang: palace guards with torches pouring through the streets, a secret letter "
        "carried by a running messenger.",
        "Zhang Jiao in his hall learning his plot is betrayed, his face hardening, as his brothers Zhang Bao and "
        "Zhang Liang stand beside him in yellow.",
        "Countless yellow headscarves being tied on by many hands at once, close up, torchlight, the night of the rising.",
    ),
    "caocao1": (
        "A rich household courtyard in Qiao, a mischievous boy Cao Cao playing with hawks and hounds while servants "
        "watch disapprovingly.",
        "The boy Cao Cao sprawled on the ground pretending a fit, peeking with one eye as his worried uncle hurries "
        "toward him.",
        "A falcon on a gloved fist against a bright sky, a hunting horn and a lute lying in the grass.",
    ),
    "caocao2": (
        "The quiet study of the famous judge of men Xu Shao in Runan, scrolls everywhere, late afternoon light, a young "
        "visitor seated before him.",
        "Cao Cao laughing with delight at Xu Shao's verdict, head thrown back, while Xu Shao watches him gravely.",
        "A brushed verdict on paper beside a teacup, steam rising, light slanting across the characters.",
    ),
    "staves": (
        "The north gate of Luoyang at dusk, more than ten staves painted in five colours hanging on either side of the "
        "gate, guards standing to attention.",
        "Cao Cao, newly made captain, sitting in judgement at the gate, cold-eyed, as a powerful man caught out after "
        "curfew is dragged before him.",
        "Five-coloured staves, red, blue, yellow, white and black, hanging in a row on a gatehouse wall, lantern light.",
    ),
    "hostel": (
        "A small country town of Anxi, a modest government hostel with a courtyard, villagers and the three brothers "
        "bowing as an official's carriage arrives.",
        "The inspector lounging arrogantly on a seat in the hostel, his nose in the air, while Liu Bei stands bowing "
        "before him and Zhang Fei glowers in the doorway.",
        "A brush and an accusation scroll on a desk next to a heavy purse, the shadow of a greedy hand.",
    ),
    "post": (
        "Outside the hostel in morning light, a crowd of old villagers kneeling and weeping at the gate as Zhang Fei "
        "rides up, frowning.",
        "Zhang Fei in a towering rage, the bound inspector tied to a hitching post, a bundle of willow switches in "
        "Zhang Fei's fist, Liu Bei rushing up to stop him.",
        "An official's seal of office hanging from a hitching post, swinging on its cord, willow switches scattered "
        "on the ground.",
    ),
    "horses": (
        "Two merchants arriving with a long string of fine northern horses down a country road, dust glowing in the "
        "late sun, the brothers coming out to meet them.",
        "Liu Bei, Guan Yu and Zhang Fei each receiving his weapon from the smith: twin swords, a crescent-bladed "
        "glaive, a long serpent spear, sparks still in the air.",
        "A blacksmith's forge at night, glowing steel on the anvil, sparks flying, the shape of a great curved blade.",
    ),
    "bribe": (
        "An imperial army before the walls of Guangzong, as a eunuch envoy in rich robes arrives in a carriage with "
        "an escort.",
        "Lu Zhi standing firm, refusing the eunuch envoy, who leans in with an open palm waiting for a bribe and a "
        "smirk on his face.",
        "An open empty palm held out, and behind it a stern old general turning away, cold light.",
    ),
}

# a fourth view where Plot asked for a moment the three don't cover
EXTRA = {
    "bosswin_d": ("bosswin", "Inside the walls of Yangcheng at night, Zhang Bao turns away from the gate as his own officer "
                             "Yan Zheng steps up behind him and drives a blade into his back; torchlight, a few guards frozen "
                             "at the edge of the frame. Dark and quiet, no gore, just the moment."),
}

# The second pass (the user turned down the first set): each still is drawn from the one line it sits
# under in tools/tk_story.py, with every named person present, one clear action and few figures, and no
# face references. Nothing goes back into the game until the user has approved it (gen_stills --review).
REVIEW = {
    # inn: "a giant pushing a cart strides in: nine feet tall, a beard two feet long, a face like a ripe red date"
    "inn_v2": ("inn", "Guan Yu shoves open the plain wooden door of a small village inn at evening, pushing a wooden "
                      "handcart ahead of him and stooping under the lintel; at one table inside, Liu Bei and Zhang Fei "
                      "turn to stare up at him. Plank walls, paper-screened lattice windows, plain unmarked paper "
                      "lanterns, clay wine jars and bowls. No signboards, no wall hangings, no other figures."),
    # oath: "With a black ox and a white horse for sacrifice, the three burn incense and bow."
    "oath_v2": ("oath", "Liu Bei, Guan Yu and Zhang Fei kneel in a row on the same side of a low stone altar, facing "
                        "it with their backs half to us, heads bowed and hands clasped, thin sticks of incense smoking "
                        "in a bronze burner on the altar; a black ox and a white horse stand tethered beside it; a "
                        "peach orchard in full pink blossom. Nobody stands behind the altar. Only these three men."),
    # post: "Zhang Fei breaks ten or more willow switches across his legs." (the inspector's; docs/stills-must-show.md)
    "post_v2": ("post", "In front of a county office gate, the inspector stands with his back against a thick wooden "
                        "hitching post, his arms bound behind him around the post and ropes wound across his chest, "
                        "howling in pain; Zhang Fei raises a bundle of thin green willow switches and lashes them "
                        "down across the inspector's legs, broken switches scattered on the ground; Liu Bei hurries in "
                        "from the side with a hand raised to stop him. Only these three men; Liu Bei is not tied or "
                        "beaten. Plain gate, no signboard."),
    # blackwind: "Out of a black cloud pours a numberless host of horsemen. Liu Bei's army breaks and flees."
    "blackwind_v2": ("blackwind", "Zhang Bao stands on a rocky hilltop, hair loose, sword raised high, mouth open "
                                  "chanting; a black whirlwind of storm cloud, sand and stones pours down the slope "
                                  "onto a line of Han spearmen in cloth headwraps and lamellar armour, who break and "
                                  "run; ghostly paper-like riders gallop inside the cloud."),
}

# The final World 1 set: one prompt per still the story uses, written from docs/stills-must-show.md
# (Plot): who must be in the frame, the one action, and what must not be there. Each man is placed in the
# frame, objects belong to whoever holds them, and nothing names writing. Replaces the scene prompts above.
FINAL = {
    "tree_a": "A humble village of mud-walled houses with thatched roofs, and above it one enormous mulberry tree, over "
              "fifty feet tall, its round crown spreading like the canopy of an imperial carriage; a few villagers in "
              "the lane glance up at it. Morning light.",
    "tree_b": "Under a huge mulberry tree, a small boy of six in a plain hemp tunic and straw sandals points up at the "
              "round canopy, chin high, boasting; beside him his uncle, a strong dark-haired farmer of forty with a short "
              "black beard in a hemp robe, startled, raises a hand to hush him. Only these two.",
    "notice_a": "A crowd of villagers in plain hemp clothes packs a dusty town square, all reading a large paper notice "
                "pasted on a whitewashed wall; no one stands out from the crowd.",
    "notice_b": "At the back of a crowd before a paper notice on a wall, Liu Bei reads it and sighs, head lowered; right "
                "behind him Zhang Fei leans in, glaring, about to speak to him.",
    "inn_a": REVIEW["inn_v2"][1],
    "inn_b": "Liu Bei, Guan Yu and Zhang Fei sit at one small inn table, leaning in close over clay wine bowls, lit by a "
             "single small open-flame oil lamp; Guan Yu, in the middle, is talking, telling his story; the room behind "
             "them falls into shadow. Exactly three men.",
    "oath_a": "A peach orchard in full pink blossom at dawn; in the middle a low stone altar with incense smoke curling "
              "up from a bronze burner; a black ox and a white horse stand tethered beside it. No people.",
    "oath_b": "Liu Bei, Guan Yu and Zhang Fei kneel in a row on the same side of a low stone altar, facing it, backs "
              "half to us, heads bowed and hands clasped: Liu Bei in the middle, Guan Yu on the left, Zhang Fei on the "
              "right; incense smoke rises from a bronze burner on the altar; peach blossom all around. Nobody stands "
              "behind the altar. Exactly three men.",
    "oath_c": "Close-up of three hands raising three small bronze wine cups together in a toast under peach blossom, "
              "pink petals falling into the wine: one hand in a white sleeve, one in a green sleeve, one in a black "
              "sleeve. No faces.",
    "tent_b": "Inside an army tent, Liu Bei bows low to his old teacher Lu Zhi, who stands and reaches out to greet him "
              "warmly. Only these two.",
    "tent_c": "A general's camp desk inside a tent: rolled bamboo scrolls, a brush, an inkstone, and a blank map drawn "
              "only with hills and rivers, pinned with small coloured flags, lit by a small open-flame bronze oil lamp. "
              "No people.",
    "cart_a": "A dusty country road: a wooden cage cart holds an old prisoner in grey, imperial soldiers with spears walk "
              "around it, and beside it three riders rein in their horses to stare.",
    "cart_b": "Lu Zhi sits inside a wooden cage cart, speaking quietly through the bars to Liu Bei, who grips the bars "
              "from outside; behind Liu Bei, Zhang Fei glares, furious, both hands on his spear.",
    "cart_c": "Close-up of the rough wooden bars of a cage cart with an old man's hands resting on them, and beyond "
              "the bars an empty rutted dirt road stretching away to the hills. No faces.",
    "office_b": "In an open army camp under banners, Dong Zhuo sits on the right, sneering down at them; on the left "
                "Zhang Fei lunges, hand on his sword, and Liu Bei and Guan Yu hold him back by both arms.",
    "office_c": "A bronze wine cup lies tipped over on a wooden camp table, wine spilling across it; on the tent canvas "
                "behind falls the shadow of a raised fist. No faces.",
    "blackwind_a": REVIEW["blackwind_v2"][1],
    "blackwind_c": "Riders and horses made of cut white paper whirl through a howling black wind under a dark sky, like "
                   "leaves in a storm. No real people.",
    "bosswin_a": "On a hillside ridge, soldiers hurl clay jars of filth down the slope; the jars burst, and the black "
                 "whirlwind below tears apart into scraps of paper.",
    "bosswin_c": "Torn paper soldiers and paper horses drift down onto empty green grass in clear light after the storm, "
                 "the dark clouds breaking up. No real people.",
    "bosswin_d": "Inside the walls of Yangcheng at night, Zhang Bao turns away toward the gate while his own officer, a "
                 "lean man in dark armour, steps up behind him and drives a sword into his back; torchlight; a few guards "
                 "frozen at the edges. No blood.",
    "peace2_b": "Zhang Jiao raises both arms high before a vast crowd of followers in yellow headscarves at sunset, "
                "the crowd roaring back.",
    "caocao2_b": "In a scholar's quiet study, a lean young man of twenty with a thin moustache, in a black official's cap "
                 "and a dark red robe, throws his head back laughing with delight; across from him Xu Shao sits, "
                 "grave, watching him. Only these two.",
    "caocao3_b": "Cao Cao rides out at dawn on a dark horse, sword drawn and raised, red banners and a column of cavalry "
                 "behind him.",
    "post_a": "Fifty or sixty old villagers kneel weeping at the gate of a hostel; from the side, Zhang Fei rides up on "
              "a horse and reins in, frowning down at them.",
    "post_b": REVIEW["post_v2"][1],
    "horses_a": "Two travelling merchants on foot drive a string of fine northern horses down a country road toward "
                "Liu Bei, Guan Yu and Zhang Fei, who wait at the roadside; dust glows in the low sun.",
    "horses_b": "In a smithy full of sparks, a burly smith hands over new weapons: twin swords to Liu Bei, a "
                "crescent-bladed long halberd to Guan Yu, and a long spear with a wavy serpent blade to Zhang Fei.",
}

# Book 2 (World 2): one prompt per still step in tools/tk_story_w2.py, from docs/stills-must-show-w2.md.
FINAL2 = {
    "alliance_b": "A long feast table of rich lords in a great tent: Yuan Shao sits at the head, richly dressed; Liu "
                  "Bei sits at the very lowest place at the far end, hands on his knees; behind him Guan Yu and Zhang "
                  "Fei stand with arms folded, faces cool. The lords ignore him.",
    "wine_a": "Outside a camp gate, Cao Cao holds out a bronze cup of steaming hot wine; Guan Yu, already in the saddle "
              "with his long crescent-bladed halberd, does not take it and looks toward the gate; a low table beside "
              "them, steam rising from the cup.",
    "wine_b": "Before the lords' table, Guan Yu stands calm with his crescent-bladed halberd grounded; at his feet lies "
              "the helmeted head of the enemy general, and beside it on the table the same bronze cup, still steaming; "
              "the lords stare, stunned. No blood.",
    "hulao_a": "On a wide field before a fortress pass, Lü Bu on a tall red horse chases a fleeing rider, Gongsun Zan "
               "on a white horse, his halberd raised to thrust; from the side Zhang Fei charges in on horseback, spear "
               "levelled. Only these three riders.",
    "hulao_b": "Lü Bu on a tall red horse in the middle of a dusty field, halberd swinging, ringed by three riders: "
               "Zhang Fei in front with his serpent spear, Guan Yu at the side with his crescent halberd, Liu Bei at the "
               "flank with twin swords; far behind, the allied lords watch from a hill. Exactly four fighters.",
    "ruins_a": "The burned palace city of Luoyang under an ash-grey sky: charred black columns, collapsed roofs, thin "
               "smoke, an empty gate hall; in the foreground, small, Liu Bei, Guan Yu and Zhang Fei stand looking at it. "
               "No crowds, no flames.",
    "fireflies_a": "At night in tall river reeds, two boys in torn silk robes, one about fourteen and one about nine, "
                   "hold hands and look up as a line of fireflies rises before them, lighting the way. Only the two "
                   "boys.",
    "dingyuan_a": "Inside a lamplit tent at night, Ding Yuan sits at a desk reading by a candle and looks up; Lü Bu "
                  "stands over him in armour with a drawn sword. Only these two. No blood.",
    "lvboshe_a": "A dirt road at dusk: Lü Boshe rides a donkey with two clay wine jars hanging from the saddle, raising "
                 "a hand in greeting; ahead of him Cao Cao and Chen Gong sit on horseback, and Cao Cao has turned back, "
                 "sword drawn.",
    "lvboshe_b": "On a dusk road, Cao Cao sits on his horse, sword lowered, face hard; beside him Chen Gong stares at "
                 "him in appalled silence; far behind them on the road lie a fallen donkey and a still figure. No blood.",
    "xingyang_a": "Wading a river at dusk: Cao Cao rides a strong horse with an arrow in his shoulder, and Cao Hong, on "
                  "foot in the water beside it, leads the horse by the bridle.",
    "zumao_a": "In a dark wood, a burnt tree stump stands with a red cap hanging on it; enemy cavalry with torches "
               "ring it warily; half hidden among the trees behind, Zu Mao crouches with two swords drawn.",
    "seal_a": "In palace ruins at night, a round stone well glows with five-coloured light rising out of it; Sun Jian "
              "and a few soldiers with torches lean over the rim, faces lit from below.",
    "seal_b": "In a torchlit camp, Sun Jian in armour raises one hand in an oath; before him Yuan Shao sits at a table "
              "with his hand held out as if to receive something; the other lords watch. Empty hands.",
    "xianshan_a": "A steep wooded ridge at night: Sun Jian on horseback among the trees looks up as a rain of stones "
                  "and arrows pours down from the slope above; his riders scatter behind him. No blood.",
    "garden_a": "A peony garden at night under the moon: Diaochan kneels with her forehead near the ground; before her "
                "Wang Yun bows low; behind them a small pavilion with a stone weiqi board on its table and two stones on "
                "it, no one at it. Only these two.",
    "pavilion_a": "Beside a lotus pond at a garden pavilion, Diaochan rests in Lü Bu's arms, her face turned up to his, "
                  "wet with tears; his tall halberd leans against the railing. Only these two.",
    "fall_a": "At a palace gate, Dong Zhuo, huge and heavy in armour, lies on the ground beside a carriage with a "
              "broken wheel, looking up in terror; Lü Bu stands over him with the halberd point at his throat; Li Su "
              "beside him with a sword; guards in the background. No blood.",
    "tower_a": "A city gate tower on fire at dusk: Wang Yun stands at the parapet beside a small boy in an emperor's "
               "robe, both looking down at a rebel army massing below.",
}

# Mock screenshots to choose a new look for the sprites and dialogue (the user, Book 2): each style twice,
# a map screen and a dialogue screen. Sent as written (no cast lines, no style line): "raw".
_BROS = ("Liu Bei (a gentle man with a short black beard, white robe with gold trim), Guan Yu (a towering man with a "
         "deep red face and a very long black beard, green robe, holding a crescent-bladed halberd) and Zhang Fei "
         "(stocky, wild black beard, black clothes, a long spear)")
_TALK = ("Guan Yu: Wine, quickly! I'm off to the city to join the army.", "关羽：快斟酒来吃，我待赶入城去投军！")
_LOOKS = {
    "hd2d": "an HD-2D game in the manner of Octopath Traveler but set in ancient China: detailed pixel-art characters "
            "in a diorama-like world with real lighting, soft depth-of-field blur, glowing lanterns, bloom",
    "paladin": "a classic 1990s Chinese RPG in the manner of Chinese Paladin (Sword and Fairy) and Xuan-Yuan Sword: "
               "hand-painted isometric backgrounds with rich detail, small finely drawn characters, ornate Chinese "
               "UI frames",
    "ink": "an ink-wash painting game in the manner of Tale of Immortal and Eastern Exorcist: the whole world painted "
           "like a Chinese ink scroll, rice-paper texture, soft washes of colour, characters with brush outlines",
    "genshin": "Genshin Impact, in its Liyue region: an open-world anime action RPG with cel-shaded 3D characters, "
               "a bright painterly world with golden light, jade and crimson Chinese architecture, glowing particles, "
               "its clean modern HUD",
    "chibi": "a polished modern Chinese mobile wuxia RPG: cute chibi 3D-rendered characters with big heads, bright "
             "detailed stylised world, clean glossy UI",
}
for _k, _look in _LOOKS.items():
    STILLS[f"mock_{_k}_map"] = {"scene": "mock", "lens": "map", "raw": True, "prompt": (
        f"A gameplay screenshot from {_look}. Top-down three-quarter view of a small ancient Chinese village with "
        f"earth-walled houses, a huge mulberry tree and peach trees in blossom; the three heroes {_BROS} walk together "
        f"along a dirt path, a few villagers nearby. A small quest marker in the top-left corner and a minimap in the "
        f"top-right. Han dynasty China; nothing modern.")}
    STILLS[f"mock_{_k}_talk"] = {"scene": "mock", "lens": "talk", "raw": True, "prompt": (
        f"A dialogue screenshot from {_look}. The game world (an ancient Chinese village inn at evening) behind, "
        f"dimmed; in front, a large character portrait of Guan Yu (a towering man with a deep red face, narrow eyes, "
        f"a very long black beard, green robe and green headscarf) on the left, and a dialogue box along the bottom "
        f"with his name and the line \"{_TALK[0]}\" with the Chinese \"{_TALK[1]}\" above it. Han dynasty China; "
        f"nothing modern.")}

# Dialogue portraits in the Genshin look (the user's pick for the new style): one half-body cut-out per
# speaker, on white for the background to be keyed out (tools/build_portraits.py). Looks beyond CAST here.
FACE_LOOKS = {
    "starred": ("the Red Star Lord", "a cheerful immortal old man with a long white beard, rosy cheeks, in a flowing "
                                     "crimson robe embroidered with stars"),
    "stargrey": ("the Grey Star Lord", "a stern immortal old man with a long white beard and long eyebrows, in a "
                                       "flowing silver-grey robe embroidered with stars"),
    "immortal": ("the hermit immortal", "an ancient Daoist hermit with a white beard to his waist, a wooden staff and a "
                                        "gourd, in a plain pale robe, kind wise eyes"),
    "liubei_child": ("young Liu Bei", "a bright-eyed boy of six with his hair in two tufts, in a plain hemp tunic"),
    "liuyuanqi": ("Liu Yuanqi", "a strong dark-haired farmer of forty with a short black beard, in a hemp robe"),
    "uncle": ("Liu Bei's uncle", "a strong dark-haired farmer of forty with a short black beard, in a hemp robe"),
    "chengyuanzhi": ("Cheng Yuanzhi", "a hulking Yellow Turban rebel general with a yellow headscarf, leather armour "
                                      "and a heavy broadsword"),
    "merchant": ("the horse merchant", "a prosperous northern horse trader with a fur-trimmed cap and a neat moustache"),
    "zuofeng": ("Zuo Feng", "a smug court eunuch envoy, beardless, in a dark official robe and gauze cap"),
    "yuanshu": ("Yuan Shu", "an arrogant young nobleman with a thin moustache, in gold brocade and a tall cap"),
    "xiandi": ("the Prince of Chenliu", "a calm, serious boy of nine in a yellow silk robe with a small crown"),
    "shaodi": ("the boy Emperor", "a frightened boy of fourteen in an emperor's yellow robe and crown"),
    "hetaihou": ("Empress Dowager He", "a proud imperial lady in her thirties in rich red and gold court robes, a tall "
                                       "jewelled headdress"),
    "tangfei": ("Consort Tang", "a gentle young court lady in a pale lavender robe, hair in an elegant bun"),
    "liru": ("Li Ru", "Dong Zhuo's sly advisor, thin with narrow eyes and a wispy beard, in a dark robe and scholar's cap"),
    "dongmu": ("Dong Zhuo's mother", "a frail old woman of ninety with white hair, in a dark brocade robe"),
    "caiyong": ("Cai Yong", "a sorrowful old scholar with a grey beard, in a plain scholar's robe and cap"),
    "chengpu": ("Cheng Pu", "a veteran general with a grizzled beard, in red armour, holding a long spear"),
    "handang": ("Han Dang", "a tough general with a square jaw and short beard, in red armour, holding a broadsword"),
    # tries at a tougher or plainer Liu Bei (liubei_b/_c/_d): the user kept the original (CAST's look)
    "liubei_b": ("Liu Bei", "a battle-hardened young hero of twenty-eight, the leader of a band of volunteers: lean and "
                            "tough, a short black beard, long earlobes, a faint scar on his cheekbone, a fierce confident "
                            "half-smile, hair tied up in a topknot, a dusty white robe with gold trim, sleeves bound for "
                            "fighting, one hand resting on a sword hilt"),
}
FACE_STYLE = ("In the style of Genshin Impact character art: polished anime cel shading, clean lineart, vibrant "
              "colours, soft rim light. Plain flat pure white background, nothing else behind the figure. Han dynasty "
              "China, about 184 AD: no text, no modern items.")
for _who, (_name, _look) in {**{k: v for k, v in CAST.items()}, **FACE_LOOKS}.items():
    STILLS[f"face_{_who}"] = {"scene": "face", "lens": _who, "raw": True, "aspect": "3:4", "prompt": (
        f"Character portrait of {_name}, {_look}. Half-body from the waist up, turned three-quarters toward the "
        f"viewer, a characteristic expression. {FACE_STYLE}")}

# the stills the game uses (Plot/Story's choice: the emotional peaks, the partings, the one death)
CHOSEN = ["tree_b", "notice_b", "inn_b", "oath_b", "oath_c", "tent_b", "cart_b", "cart_c", "office_b", "blackwind_a",
          "bosswin_c", "bosswin_d", "peace2_b", "caocao2_b", "caocao3_b", "post_b", "horses_b",
          # and eleven more (Plot, 8c8b3dd): a scene may carry several
          "tree_a", "notice_a", "inn_a", "oath_a", "tent_c", "cart_a", "office_c", "blackwind_c", "bosswin_a",
          "post_a", "horses_a"]

for _scene, _shots in SCENES.items():
    for _lens, _text in zip(LENSES, _shots):
        STILLS.setdefault(f"{_scene}_{_lens}", {"scene": _scene, "lens": _lens, "prompt": _text})

for _id, (_scene, _text) in EXTRA.items():
    STILLS.setdefault(_id, {"scene": _scene, "lens": _id[-1], "prompt": _text})
for _id, (_scene, _text) in REVIEW.items():
    STILLS.setdefault(_id, {"scene": _scene, "lens": "v2", "prompt": _text})
for _id, _text in FINAL.items():   # the final prompt replaces the first-pass scene text
    STILLS.setdefault(_id, {"scene": _id.rsplit("_", 1)[0], "lens": _id.rsplit("_", 1)[1]})["prompt"] = _text
for _id, _text in FINAL2.items():
    STILLS[_id] = {"scene": _id.rsplit("_", 1)[0], "lens": _id.rsplit("_", 1)[1], "prompt": _text}
assert all(c in STILLS for c in CHOSEN)
