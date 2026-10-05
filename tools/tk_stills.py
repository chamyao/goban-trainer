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
STYLE = ("Style: Chinese gongbi painting brought to a modern game illustration: fine ink outlines, rich flat "
         "mineral colours, gold leaf accents, stylised clouds and waves. No text, no speech or thought bubbles, no captions, no calligraphy, no seals, no "
         "signature, no watermark.")

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
    "ghibli": "Style: in the style of Studio Ghibli.",
}

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
                          "neck, a deep red face, a very long black beard down to his chest and narrow eyes under "
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
        "A small boy of six stands under a great mulberry tree, chin up, pointing at its canopy and declaring he will ride "
        "in a carriage like that one day; his uncle, a middle-aged farmer, startled beside him, hand raised to hush him.",
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
        "a handcart, everyone turning to look; Liu Bei and Zhang Fei at a table by the wall.",
        "Liu Bei, Guan Yu and Zhang Fei leaning together over a small inn table with wine cups, deep in talk, faces lit "
        "by a single lamp, the rest of the room fading into shadow.",
        "Rain streaking past the paper window of an inn at night, the warm silhouettes of three men inside, a handcart "
        "left out in the wet lane.",
    ),
    "oath": (
        "A peach orchard in full pink blossom at dawn, an altar with incense smoke curling upward, a black ox and a white "
        "horse tethered for the sacrifice, three figures kneeling, petals drifting through shafts of light.",
        "Liu Bei, Guan Yu and Zhang Fei kneeling side by side before the altar, eyes closed, hands clasped, swearing "
        "brotherhood, incense smoke between them, petals in their hair.",
        "Three wine cups raised and touching above a table under peach blossom, petals falling into the wine, "
        "golden evening light.",
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
        "greet him.",
        "A general's desk in a tent: scrolls, a brush, an inkstone and a battle map pinned with small flags, "
        "lamplight and shadow.",
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
        "Close on the rough wooden bars of a cage cart and an old scholar's hands resting on them, a lonely road "
        "stretching away under clouds.",
    ),
    "office": (
        "Han troops fleeing in rout across hills under a stormy sky, pursued by Yellow Turbans, as three brothers "
        "charge in from the side and turn the battle.",
        "Dong Zhuo seated in his army camp with banners behind him, sneering down at Liu Bei standing before him, as "
        "Zhang Fei lunges for his sword in rage and Liu Bei and Guan Yu together hold him back.",
        "A general's cup tipped over on a table, wine spilling, the shadow of a raised fist on the tent wall.",
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
        "Torn paper soldiers drifting down onto grass in clear light after a storm, the sky breaking open.",
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
assert all(c in STILLS for c in CHOSEN)
