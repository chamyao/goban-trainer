"""Story content for the Three Kingdoms campaign, read by build_tk.py.

Each world is a map of nodes. Main story points sit on the fixed nodes
(the ones every route passes through, i.e. before each fork and after
each merge), in the novel's order. Side roads carry side stories: the
long road tells one in a few parts, the shortcut tells another from a
different angle. A scene is a list of steps the map plays:

  ["n", text]                  narration
  ["say", who, text]           a line of dialogue (who = a character id)
  ["spawn", id, who, at, dx, dy]  put an actor on the map near node `at`
  ["move", id, at, dx, dy]     walk an actor there
  ["remove", id]
  ["party", [who, ...]]        the party walking the map from now on
  ["gain", item]               the party gets a thing from the world's "items" (a mount, a weapon, …)
  ["army", id, who, count, at, dx, dy]  a body of soldiers in formation (id names the group)
  ["run", id, at, dx, dy]      like move, at a run (ids may name a group)
  ["fx", name, at, dx, dy]     an effect: petals, incense, blackwind, flash, whip, dust, paper
  ["pose", id, pose, n]        stand, kneel, strike, fall; for a group, n = how many fall (nearest the enemy)
  ["wait", ms]
  ["scroll", title, [paragraphs]]  a storyteller scroll
  ["problem"]                  the scene's Go problem: what comes before builds to it, what comes after is its payoff

Actors: spawned ids, or a party member by character id (e.g. "zhangfei").
Positions: "at" is a node key in the same world; dx/dy are map pixels (the map is 480x270).
"""

WORLDS = [
    {
        "n": 1,
        "name": "The Peach Garden Oath",
        "zh": "桃园结义",
        "chapters": [1, 2],
        "couplets": [
            ["宴桃园豪杰三结义　斩黄巾英雄首立功",
             "Three heroes feast in the Peach Garden and swear brotherhood; slaying the Yellow Turbans, they win their first glory"],
            ["张翼德怒鞭督邮　何国舅谋诛宦竖",
             "Zhang Fei whips the inspector in a rage; Imperial Uncle He Jin plots to kill the eunuchs"],
        ],
        "grades": ["12K", "12K+"],
        "boss": "redmond",
        "party": ["liubei"],
        # Things the story gives the party (["gain", key] in a scene). A mount
        # puts the party on horseback; coats are per rider.
        "items": {
            "horses": {"name": "Fifty northern horses", "zh": "良马五十匹", "kind": "mount",
                       "coats": {"liubei": "white", "guanyu": "brown", "zhangfei": "black"}},
            "silver": {"name": "Five hundred taels of silver", "zh": "金银五百两", "kind": "treasure"},
            "twin_swords": {"name": "Twin swords", "zh": "双股剑", "kind": "weapon", "who": "liubei"},
            "green_dragon": {"name": "Green Dragon Crescent Blade", "zh": "青龙偃月刀", "kind": "weapon", "who": "guanyu"},
            "serpent_spear": {"name": "Eighteen-foot serpent spear", "zh": "丈八蛇矛", "kind": "weapon", "who": "zhangfei"},
            "pigblood": {"name": "Pig's blood", "zh": "猪血", "kind": "supply"},
            "sheepblood": {"name": "Sheep's blood", "zh": "羊血", "kind": "supply"},
            "dogblood": {"name": "Dog's blood", "zh": "狗血", "kind": "supply"},
        },
        # Map, 480x270. "role": main (fixed, carries a main story point),
        # side (long road), short (shortcut), boss. The horse dealers are a
        # main point; the long road branches off after them and rejoins at Daxing.
        "nodes": [
            {"key": "start", "x": 34, "y": 236, "role": "main", "place": "Lousang Village", "step": 0.0, "scene": "tree"},
            {"key": "c1", "x": 52, "y": 226, "role": "main", "place": "Zhuo County", "room": "office", "step": 0.0, "scene": "council"},
            {"key": "n1", "x": 70, "y": 214, "role": "main", "place": "Zhuo County", "step": 0.0, "scene": "notice"},
            {"key": "i1", "x": 89, "y": 200, "role": "main", "place": "Zhuo County", "room": "inn", "step": 0.05, "scene": "inn"},
            {"key": "n2", "x": 108, "y": 186, "role": "main", "place": "The Peach Garden", "step": 0.1, "scene": "oath"},
            {"key": "a1", "x": 140, "y": 222, "role": "side", "place": "Road to Julu", "room": "cave", "step": 0.15, "scene": "peace1"},
            {"key": "a2", "x": 180, "y": 236, "role": "side", "place": "Julu", "room": "house-1", "step": 0.2, "scene": "peace2"},
            {"key": "a3", "x": 214, "y": 212, "role": "side", "place": "Yellow Hills", "room": "tent", "step": 0.25, "scene": "peace3"},
            {"key": "as", "x": 160, "y": 150, "role": "main", "place": "Horse Trail", "step": 0.12, "scene": "horses"},
            {"key": "n3", "x": 246, "y": 178, "role": "main", "place": "Daxing Mountain", "step": 0.35, "scene": "daxing"},
            {"key": "n4", "x": 282, "y": 206, "role": "main", "place": "Qingzhou", "step": 0.45, "scene": "qingzhou",
             "hint": "Give ground, and make them follow."},
            {"key": "n4b", "x": 292, "y": 198, "role": "main", "place": "Qingzhou", "step": 0.47, "scene": "qingzhou2", "board": False,
             # the ambush plays once both brothers are on their hills
             "gate": [{"needs": ["mark:flank_left", "mark:flank_right"], "else": "qingzhouwait",
                       "objective": "Post Guan Yu on the left hill and Zhang Fei on the right.", "at": "Qingzhou"}]},
            {"key": "t1", "x": 299, "y": 191, "role": "main", "place": "Guangzong Road", "room": "luzhi-tent", "step": 0.5, "scene": "tent"},
            {"key": "e1", "x": 352, "y": 186, "role": "main", "place": "Changshe", "step": 0.52, "scene": "yingchuan"},
            {"key": "n5", "x": 316, "y": 176, "role": "main", "place": "Guangzong Road", "step": 0.55, "scene": "cart", "dilemma": {"q": "Free Lu Zhi, or trust the court?", "who": "liubei", "open": "If I free him, I am a rebel. If I stand by, an honest man goes to his ruin.", "win": "It is clear to me now.", "slip": "Not yet. Let me think it through once more."}},
            {"key": "b1", "x": 342, "y": 214, "role": "side", "place": "Qiao", "room": "caohome", "step": 0.6, "scene": "caocao1"},
            {"key": "b2", "x": 378, "y": 230, "role": "side", "place": "Luoyang Gates", "room": "hall-1", "step": 0.65, "scene": "caocao2"},
            {"key": "b2g", "x": 386, "y": 224, "role": "side", "place": "Luoyang Gates", "step": 0.66, "scene": "staves"},
            {"key": "f1", "x": 395, "y": 217, "role": "side", "place": "Changshe", "room": "camp", "step": 0.67, "scene": "fireplan"},
            {"key": "b3", "x": 412, "y": 204, "role": "side", "place": "Changshe", "step": 0.7, "scene": "caocao3"},
            {"key": "bs", "x": 360, "y": 146, "role": "short", "place": "Envoy's Road", "step": 0.65, "scene": "bribe"},
            {"key": "n6", "x": 420, "y": 164, "role": "main", "place": "The Hills North of Guangzong", "step": 0.8, "scene": "office"},
            {"key": "n7", "x": 388, "y": 114, "role": "main", "place": "Hills of Black Wind", "step": 0.9, "scene": "blackwind", "board": False},
            {"key": "n7b", "x": 408, "y": 90, "role": "main", "place": "Hills of Black Wind", "step": 0.92, "scene": "shrine", "shrine": True,
             "hint": "Pigs, sheep, dogs. Blood."},
            {"key": "boss", "x": 432, "y": 62, "role": "boss", "place": "Yangcheng", "scene": "bosswin",
             "boss": {"who": "zhangbao", "title": "Zhang Bao, General of Earth",
                      "taunt": "Wind and thunder answer to me! Your little band will be swept away like dust."},
             # a gated battle: attempted early, the storm routs the army again and no board opens
             "gate": [
                 {"needs": ["node:n7b"], "else": "bossearly"},
                 {"needs": ["item:pigblood", "item:sheepblood", "item:dogblood"], "else": "bossearly2",
                  "objective": "Gather the blood of pigs, sheep and dogs at the farm east of the pine.", "at": "Hills of Black Wind"},
                 {"needs": ["mark:ridge_left", "mark:ridge_right"], "else": "bossearly3",
                  "objective": "Take the blood up to Guan Yu on the left ridge and Zhang Fei on the right.", "at": "Hills of Black Wind"}]},
            {"key": "ax1", "x": 448, "y": 44, "role": "main", "place": "Anxi", "room": "hostel", "step": 0.95, "scene": "hostel"},
            {"key": "ax2", "x": 462, "y": 26, "role": "main", "place": "Anxi", "step": 0.97, "scene": "post", "dilemma": {"q": "Kill the inspector, or spare him?", "who": "liubei", "open": "He deserves to die. But I am a sheriff, and he is the court's own man.", "win": "I know what I must do.", "slip": "Not yet. I cannot bring myself to say it."}},
        ],
        "edges": [["start", "c1"], ["c1", "n1"], ["n1", "i1"], ["i1", "n2"], ["as", "a1"], ["a1", "a2"], ["a2", "a3"], ["a3", "n3"],
                  ["n2", "as"], ["as", "n3"], ["n3", "n4"], ["n4", "n4b"], ["n4b", "t1"], ["t1", "e1"], ["e1", "n5"], ["n5", "b1"], ["b1", "b2"], ["b2", "b2g"], ["b2g", "f1"], ["f1", "b3"],
                  ["b3", "n6"], ["n5", "bs"], ["bs", "n6"], ["n6", "n7"], ["n7", "n7b"], ["n7", "boss"], ["boss", "ax1"], ["ax1", "ax2"]],
        "opening": [
            ["scroll", "臨江仙 · The Immortal by the River", [
                "On and on the Yangtze rolls east, its waves washing the heroes away.",
                "Right and wrong, triumph and ruin — turn your head, and all is empty.",
                "Yet the green hills remain, through how many crimson sunsets.",
                "— Yang Shen",
            ]],
            ["scroll", "Chapter 1", [
                "The empire, long divided, must unite; long united, must divide.",
                "The Han has ruled for four hundred years. Now Emperor Ling trusts only his eunuchs, the Ten Attendants, who sell offices and silence honest men. Omens fill the sky: a serpent coils on the throne, hens turn into cocks, black vapour drifts into the palace.",
                "In Julu, a healer named Zhang Jiao preaches the Way of Great Peace. In the year 184 half a million rise behind him, yellow scarves on their heads, chanting: “The Blue Heaven is dead! The Yellow Heaven shall rise!”",
                "The Yellow Turbans must be put down. The court sends its generals against them, and the governor of You Province posts a call for volunteers. The notice reaches Zhuo County…",
            ]],
        ],
        "scenes": {
            # ---- main story ----
            "council": {"title": "The Governor's Council", "kind": "main", "steps": [
                ["n", "The Yellow Turbans have crossed into You Province. Governor Liu Yan summons his officer Zou Jing."],
                ["spawn", "ly", "f_noble", "c1", 10, -6], ["spawn", "zj", "f_official", "c1", 22, -6],
                ["n", "Zou Jing advises him: “The rebels are many and our soldiers are few. My lord, you should raise troops at once, and meet them.”"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["n", "Liu Yan agrees, and has a notice posted calling for volunteers. It goes up on the wall at Zhuo County, and it draws out a hero."],
                ["remove", "ly"], ["remove", "zj"],
            ]},
            "tent": {"title": "Lu Zhi's Tent", "kind": "main", "steps": [
                ["still", "tent_b", "slow zoom in"],
                ["n", "Liu Bei goes into the tent and bows to his old teacher. Lu Zhi is glad to see him, and keeps him at his side."],
                ["spawn", "lz", "luzhi", "t1", 12, -4],
                ["still", "tent_c", "slow zoom in"],
                ["say", "luzhi", "I have Zhang Jiao penned in here. His brothers Zhang Liang and Zhang Bao are at Yingchuan, facing the court's generals, Huangfu Song and Zhu Jun."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "luzhi", "Take your own men, and I will give you a thousand more. Go to Yingchuan, learn how they stand, and we will fix a day to destroy them."],
                ["n", "Liu Bei takes his orders, and marches through the night."],
                ["remove", "lz"],
            ]},
            "fireplan": {"title": "The Fire Plan", "kind": "side", "steps": [
                ["n", "On the night Liu Bei nears Yingchuan, outside the rebels' camp at Changshe…"],
                ["spawn", "hs", "huangfusong", "f1", 8, -4],
                ["army", "troops", "militia", 3, "f1", -10, 6],
                ["n", "At Changshe, the Yellow Turbans pitched their camp in tall grass."],
                ["say", "huangfusong", "They camp in grass. Fire will take them. Every man, bring a bundle of straw."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["prop", "sw1", "straw", "f1", -4, 8], ["prop", "sw2", "straw", "f1", 4, 8],
                ["n", "Every man is told to carry a bundle of straw, and hide it."],
            ]},
            "tree": {"title": "The Mulberry Tree at Lousang", "kind": "main", "steps": [
                ["n", "The man that notice will draw out grew up here, in Lousang Village, Zhuo County. His name is Liu Bei."],
                ["still", "tree_a", "slow pan up"],
                ["n", "South-east of his house stands a mulberry tree more than fifty feet tall. From far off, it looks like the canopy over an emperor's carriage."],
                ["spawn", "ft", "f_elder", "start", -34, 12], ["move", "ft", "start", -8, 10],
                ["n", "A passing fortune-teller looks at it and says: this house will produce a great man."],
                ["remove", "ft"],
                ["spawn", "kid", "liubei_child", "start", 10, 4],
                ["army", "kids", "f_child", 3, "start", 22, 6],
                ["n", "Liu Bei's father died early. As a boy he plays under the tree with the village children."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["still", "tree_b", "slow zoom in"],
                ["say", "liubei_child", "When I am the Son of Heaven, I will ride under a canopy like this!"],
                ["wait", 1200],
                ["spawn", "unc", "liuyuanqi", "start", 30, 6], ["move", "unc", "start", 14, 4],
                ["n", "His uncle, Liu Yuanqi, hears him."],
                ["say", "liuyuanqi", "This is no ordinary child!"],
                ["n", "The family is poor. His uncle Liu Yuanqi helps them from then on."],
                ["remove", "kid"], ["remove", "unc"], ["remove", "kids"],
                ["spawn", "mom", "f_woman", "start", -26, 6], ["move", "mom", "start", -12, 6],
                ["still", "tree_c", "slow pan across"],
                ["n", "At fifteen, his mother sends him to study under Zheng Xuan and Lu Zhi, and he befriends Gongsun Zan."],
                ["emote", "mom", "heart"],
                ["n", "He serves his mother with the utmost devotion."],
                ["n", "Years pass. By the time the governor calls for volunteers, Liu Bei is twenty-eight."],
            ]},
            "notice": {"title": "The Notice at Zhuo", "kind": "main", "steps": [
                ["army", "crowd", "f_villager", 5, "n1", -16, 10],
                ["still", "notice_a", "slow pull back"],
                ["n", "Zhuo County. A crowd gathers at a notice on the wall: the governor is raising volunteers to put down the Yellow Turbans."],
                ["n", "Liu Bei, twenty-eight, descends from Prince Jing of Zhongshan — yet he sells sandals and weaves mats for a living. His ears reach his shoulders; his arms hang past his knees."],
                ["n", "He reads the notice, and sighs."],
                ["spawn", "zf", "zhangfei", "n1", 30, 4],
                ["move", "zf", "n1", 12, 2],
                ["still", "notice_b", "slow pull back"],
                ["n", "A man behind him, with a leopard's head, round eyes and a voice like thunder, cries out. This is Zhang Fei, who farms near Zhuo, sells wine and slaughters pigs."],
                ["say", "zhangfei", "A real man should serve his country! What are you sighing for?"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "liubei", "I am of the Han imperial house, Liu Bei, called Xuande. I long to crush these rebels and bring peace, but I lack the strength."],
                ["say", "zhangfei", "I'm Zhang Fei, called Yide. I've got money and land. Let's raise men together! But first, wine."],
                ["n", "Liu Bei is delighted, and the two go into the village inn to drink."],
                ["remove", "zf"], ["remove", "crowd"],
                ["party", ["liubei", "zhangfei"]],
            ]},
            "inn": {"title": "The Stranger at the Inn", "kind": "main", "steps": [
                ["n", "After the notice, Liu Bei and Zhang Fei sit down to wine at a village inn, and talk of the Yellow Turbans."],
                ["still", "inn_a", "slow pan across"],
                ["n", "Then a giant pushing a cart strides in: nine feet tall, a beard two feet long, a face like a ripe red date."],
                ["prop", "tbl", "table", "i1", 6, 8], ["prop", "wine", "winejars", "i1", 18, 8],
                ["spawn", "keep", "f_villager", "i1", 24, -8],
                ["prop", "gycart", "cart", "i1", -44, -12],
                ["spawn", "gy", "guanyu", "i1", -40, -10],
                ["move", "gy", "i1", -12, 0], ["move", "gycart", "i1", -22, -8],
                ["say", "guanyu", "Wine, quickly! I'm off to the city to join the army."],
                ["emote", "keep", "!"],
                ["say", "zhangfei", "Who is this red-faced giant? He walks in like he owns the road."],
                ["say", "liubei", "Then sit with us, friend. We have the same purpose."],
                ["say", "guanyu", "Guan Yu, called Yunchang, of Hedong. I killed a bully who preyed on my village, and I've been on the run five years."],
                ["say", "zhangfei", "A man who kills a bully is no stranger at this table."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["still", "inn_b", "slow zoom in"],
                ["n", "Liu Bei tells him his own aim, and Guan Yu is delighted. The three go together to Zhang Fei's farm to plan their great enterprise."],
                ["say", "zhangfei", "Behind my farm is a peach garden in full bloom. Tomorrow, let's swear brotherhood there before Heaven and Earth!"],
                ["say", "liubei", "Very good."],
                ["say", "guanyu", "Very good."],
                ["remove", "gy"],
                ["party", ["liubei", "guanyu", "zhangfei"]],
            ]},
            "oath": {"title": "The Peach Garden Oath", "kind": "main", "steps": [
                ["still", "oath_a", "slow pan across"],
                ["n", "The next day, in the peach garden behind Zhang Fei's farm, the blossoms are in full bloom."],
                ["fx", "petals", "n2", 0, -20],
                ["prop", "ox", "ox", "n2", -26, 14], ["prop", "wh", "whitehorse", "n2", -14, 18],
                ["n", "With a black ox and a white horse for sacrifice, the three burn incense and bow."],
                ["fx", "incense", "n2", -14, -4],
                ["still", "oath_b", "slow zoom in"],
                ["say", "liubei", "We do not ask to be born on the same day of the same month of the same year…"],
                ["say", "guanyu", "…only to die on the same day of the same month of the same year."],
                ["say", "zhangfei", "Heaven and Earth, witness it! If we betray this oath, may Heaven and men strike us down!"],
                ["wait", 1500],
                ["prop", "tbl", "table", "n2", 0, 14], ["prop", "wine", "winejars", "n2", 22, 14],
                ["pose", "party", "drink"], ["emote", "zhangfei", "music"], ["pose", "party", "cheer"],
                ["army", "braves", "militia", 8, "n2", -70, 0], ["move", "braves", "n2", -28, 0],
                ["still", "oath_c", "slow pan up"],
                ["n", "Liu Bei becomes eldest brother, Guan Yu second, Zhang Fei youngest. Five hundred village braves join them, and they drink in the garden until they can drink no more."],
                ["pose", "braves", "bow"], ["pose", "zhangfei", "drunk"], ["emote", "zhangfei", "zzz"], ["wait", 900], ["pose", "braves", "stand"],
                ["problem", "starred"],  # after the oath: the old men at their board (intro and outro in tk_places.py)
                ["n", "The next day they gather their weapons, but they have no horses to ride."],
            ]},
            "daxing": {"title": "First Blood at Daxing Mountain", "kind": "main", "steps": [
                ["army", "braves", "militia", 5, "n3", -24, 0],
                ["spawn", "ly", "f_noble", "n3", -50, -12],
                ["n", "Liu Bei and his five hundred report to the governor, Liu Yan. Learning that Liu Bei is of the same imperial house, Liu Yan is delighted and takes him as a nephew."],
                ["remove", "ly"],
                ["n", "Not many days later, the Yellow Turban general Cheng Yuanzhi marches on Zhuo with fifty thousand men. Liu Bei meets him with five hundred."],
                ["army", "yt", "rebel", 24, "n3", 72, 0],
                ["spawn", "r1", "rebel", "n3", 40, -8], ["spawn", "r2", "chengyuanzhi", "n3", 46, 6],
                ["still", "daxing_a", "slow pan across"],
                ["say", "liubei", "Traitors to the realm! Why not surrender now?"],
                ["say", "chengyuanzhi", "Deng Mao — bring me his head!"],
                ["n", "His lieutenant, Deng Mao, rides out."],
                ["spawn", "sg", "stargrey", "n3", -40, 18], ["spawn", "sr", "starred", "n3", -32, 22],
                ["n", "Under an old pine by the road sit the two white-haired men from the peach garden, over a board on a flat rock, as if no army were coming."],
                ["say", "stargrey", "Read this first."],
                ["problem", "stargrey"],  # the board comes up here; the rest plays once it is solved
                ["say", "starred", "To catch the bandits, first catch their king."],
                ["remove", "sg"], ["remove", "sr"],
                ["move", "r1", "n3", 14, -4],
                ["pose", "zhangfei", "strike"], ["fx", "flash", "n3", 14, -4], ["pose", "r1", "fall"],
                ["n", "Zhang Fei's spear takes Deng Mao through the heart."],
                ["move", "r2", "n3", 14, 4],
                ["pose", "guanyu", "strike"], ["fx", "flash", "n3", 14, 4], ["pose", "r2", "fall"],
                ["n", "Cheng Yuanzhi charges — and Guan Yu's great blade cuts him in two. The rebels throw down their spears and run."],
                ["run", "yt", "n3", 160, 0], ["remove", "yt"],
                ["remove", "r1"], ["remove", "r2"],
                ["n", "The very next day, a messenger gallops in from Qingzhou."],
            ]},
            "qingzhou": {"title": "The Ambush at Qingzhou", "kind": "main", "steps": [
                ["spawn", "msg", "f_soldier", "n4", -50, 4], ["move", "msg", "n4", -14, 4],
                ["prop", "lt", "letter", "n4", -12, 6],
                ["n", "A messenger runs in with a letter from Gong Jing, governor of Qingzhou: the Yellow Turbans have his city surrounded, and it is about to fall. He begs for help."],
                ["say", "liubei", "Qingzhou must not fall. We go at once."],
                ["remove", "msg"], ["remove", "lt"],
                ["prop", "gate", "gate", "n4", 70, -16],
                ["army", "relief", "militia", 4, "n4", -24, 0],
                ["army", "yt", "rebel", 15, "n4", 80, 0],
                ["spawn", "gj", "f_noble", "n4", 64, -12],
                ["emote", "gj", "!"],
                ["still", "qingzhou_a", "slow pull back"],
                ["n", "Liu Bei marches to relieve the city. But the rebels are too many, and his force is beaten back thirty li."],
                ["surround", "yt", "gate", 32], ["emote", "liubei", "sweat"],
                ["spawn", "sg", "stargrey", "n4", -36, 20], ["spawn", "sr", "starred", "n4", -28, 24],
                ["light", "night", 1200],
                ["n", "That night, at the edge of the camp, the two old men are at their board again."],
                ["say", "stargrey", "Another."],
                ["problem", "stargrey"],  # the board comes up here; the rest plays once it is solved
                ["say", "starred", "Don't hold the strong point. Give ground, and make them follow."],
                ["remove", "sg"], ["remove", "sr"],
                ["say", "liubei", "They are many and we are few. Only surprise will win this. Yunchang, hide your men behind the left hill. Yide, behind the right. When the gongs sound, strike."],
            ]},
            "qingzhou2": {"title": "The Ambush at Qingzhou", "kind": "main", "steps": [
                # the morning of the ambush: plays once Guan Yu and Zhang Fei are on their hills (a gate on n4b)
                ["prop", "gate", "gate", "n4b", 70, -16],
                ["army", "relief", "militia", 4, "n4b", -24, 0],
                ["army", "yt", "rebel", 15, "n4b", 80, 0],
                ["move", "guanyu", "n4b", 8, -40], ["move", "zhangfei", "n4b", 8, 40],
                ["light", "dawn", 1500],
                ["n", "Next morning Liu Bei attacks — then turns and flees. The rebels chase him over the ridge."],
                ["light", "day", 1500],
                ["run", "liubei", "n4b", 30, 0], ["run", "liubei", "n4b", -30, 0],
                ["run", "yt", "n4b", 10, 0],
                ["fx", "dust", "n4b", 0, 0],
                ["fx", "flash", "n4b", -30, 0],
                ["run", "guanyu", "n4b", 2, -10], ["run", "zhangfei", "n4b", 2, 10], ["run", "liubei", "n4b", -8, 0],
                ["n", "Gongs crash. Guan Yu and Zhang Fei burst from both flanks as Liu Bei wheels around. Caught from three sides, the rebels break, and the siege of Qingzhou is lifted."],
                ["pose", "yt", "fall", 4], ["run", "yt", "n4b", 160, 0], ["remove", "yt"],
                ["say", "liubei", "I hear my old teacher Lu Zhi is fighting Zhang Jiao at Guangzong. I once studied under him, and I wish to go and help."],
            ]},
            "qingzhouwait": {"title": "Not Yet", "kind": "main", "steps": [
                # no board: the hills are not yet held
                ["army", "relief", "militia", 4, "n4b", -24, 0],
                ["army", "yt", "rebel", 15, "n4b", 80, 0],
                ["n", "Liu Bei sends the army out, but the hills on either side are empty, and the rebels press him back."],
                ["say", "liubei", "Not yet. Yunchang must be on the left hill and Yide on the right, before I strike."],
                ["remove", "relief"], ["remove", "yt"],
            ]},
            "yingchuan": {"title": "Yingchuan, Too Late", "kind": "main", "steps": [
                # Lu Zhi's errand: learn how Huangfu Song and Zhu Jun stand. The war has moved on.
                ["army", "han", "militia", 5, "e1", -30, 0],
                ["spawn", "hs", "huangfusong", "e1", 44, -6], ["spawn", "zj", "zhujun", "e1", 56, 8],
                ["fx", "fire", "e1", 78, 0],
                ["still", "yingchuan_a", "slow pan across"],
                ["n", "Liu Bei marches through the night to Yingchuan. He hears shouting, and sees the sky lit with fire. By the time he arrives, the rebels are routed."],
                ["say", "liubei", "My teacher Lu Zhi sends me, with a thousand men. How do you stand?"],
                ["say", "huangfusong", "Zhu Jun and I have burned their camp at Changshe, and their army is broken."],
                ["say", "zhujun", "Their army lost thousands in the fire, and the rest ran."],
                ["say", "huangfusong", "Zhang Liang and Zhang Bao have no strength left. They will run to Guangzong, to Zhang Jiao. Go back at once, and help."],
                ["problem"],
                ["n", "Liu Bei takes his orders, and turns his army back through the night."],
                ["remove", "hs"], ["remove", "zj"], ["remove", "han"],
            ]},
            "cart": {"title": "The Cage Cart", "kind": "main", "steps": [
                ["still", "cart_a", "slow pan along the road"],
                ["n", "Halfway back to Guangzong, they meet soldiers guarding a prison cart."],
                ["prop", "cart", "cagecart", "n5", 30, -6],
                ["spawn", "lz", "luzhi", "n5", 30, -6], ["board", "lz", "cart"],
                ["army", "guards", "f_soldier", 4, "n5", 44, 0],
                ["mood", "dark"], ["camera", "zoom", 1.4, 800],
                ["still", "cart_b", "slow zoom in"],
                ["say", "luzhi", "Xuande! I had Zhang Jiao surrounded. But the court's envoy demanded a bribe, and I refused him. Now I go to the capital in chains, and Dong Zhuo takes my army."],
                ["camera", "zoom", 1, 500], ["emote", "zhangfei", "anger"],
                ["say", "zhangfei", "I'll cut down these guards and set him free!"],
                ["n", "Liu Bei looks at the cart, at the four guards, at Zhang Fei's hand on his blade."],
                ["problem"],  # the board is Liu Bei weighing it; solving it is the choice
                ["say", "liubei", "The court will judge him fairly. Don't be rash, Yide!"],
                ["wait", 1200],
                ["emote", "lz", "..."],
                ["move", "cart", "n5", 70, -10], ["move", "guards", "n5", 84, -10],
                ["remove", "cart"], ["remove", "guards"], ["mood", "clear"],
                ["still", "cart_c", "slow pan along the road"],
                ["n", "The cart rolls away toward Luoyang."],
                ["say", "guanyu", "Lu Zhi is under arrest, and Dong Zhuo has his army. We have no one left to turn to here. Let us go back to Zhuo."],
                ["n", "Liu Bei agrees, and they march north. Again the road divides."],
            ]},
            "office": {"title": "“What Office Do You Hold?”", "kind": "main", "steps": [
                ["army", "han", "f_soldier", 6, "n6", 46, 0],
                ["army", "yt", "rebel", 10, "n6", 84, 0], ["prop", "yb", "yellowbanner", "n6", 88, -10],
                ["n", "Heading home, the brothers hear a roar behind the hills. Dong Zhuo, who took over Lu Zhi's army, has just been beaten by Zhang Jiao: Han troops in rout, and behind them banners reading GENERAL OF HEAVEN."],
                ["run", "han", "n6", -8, 0], ["run", "yt", "n6", 36, 0], ["move", "yb", "n6", 40, -10],
                ["still", "office_a", "slow pan across"],
                ["say", "liubei", "That is Zhang Jiao! Charge!"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["run", "liubei", "n6", 30, -6], ["run", "guanyu", "n6", 30, 0], ["run", "zhangfei", "n6", 30, 6],
                ["fx", "dust", "n6", 20, -10], ["pose", "party", "strike"],
                ["run", "yt", "n6", 180, 0], ["remove", "yt"], ["remove", "yb"],
                ["n", "The three ride into his flank and drive him back fifty li. They bring the beaten commander, Dong Zhuo, safely back to his camp."],
                ["spawn", "dz", "dongzhuo", "n6", 18, -6],
                ["say", "dongzhuo", "And what office do you hold?"],
                ["say", "liubei", "None, my lord. We are commoners."],
                ["still", "office_b", "zoom in"],
                ["n", "Dong Zhuo looks down on them, and turns his back without a word of thanks. Zhang Fei starts forward, and his brothers hold him back."],
                ["remove", "dz"],
                ["wait", 1000],
                ["say", "zhangfei", "We bled to save that wretch and he treats us like dirt! I'll kill him!"],
                ["still", "office_c", "slow zoom in"],
                ["say", "liubei", "He is an officer of the court! You cannot."],
                ["say", "zhangfei", "If I don't kill him, I'll have to take his orders, and I won't. Stay here if you like, brothers. I'm going elsewhere."],
                ["say", "liubei", "We three are bound in life and death. How could we part? Then we will all go elsewhere."],
                ["say", "zhangfei", "If so, that eases my anger a little."],
                ["wait", 1000],
                ["light", "night", 2000],
                ["n", "That night they leave to join Zhu Jun instead, the general they met at Yingchuan. He is fighting Zhang Bao in the hills near Yangcheng."],
            ]},
            "blackwind": {"title": "Black Wind, Paper Soldiers", "kind": "main", "steps": [
                # the first try, and it fails: no board, no Star Lords
                ["spawn", "zj", "zhujun", "n7", -14, -10],
                ["army", "han", "militia", 6, "n7", -30, 0],
                ["spawn", "zb", "zhangbao", "n7", 70, 0],
                ["army", "yt", "rebel", 14, "n7", 86, 0],
                ["light", "night", 0],   # they left Dong Zhuo's camp at night (office); the night carries into the march
                ["n", "They ride all night, and reach Zhu Jun's camp in the hills as the sky grows pale."],
                ["light", "dawn", 1500],
                ["n", "Zhu Jun receives them warmly. The two armies join, and Zhu Jun makes Liu Bei his vanguard against Zhang Bao."],
                ["light", "day", 1500],
                ["still", "zhangbao_a", "slow pan across"],
                ["n", "Zhang Bao is Zhang Jiao's brother, the Yellow Turbans' General of Earth, and he is said to command sorcery: he calls up wind and thunder, and armies out of thin air. He has eighty or ninety thousand men camped behind the hills."],
                ["n", "If he is not stopped, Zhu Jun's army cannot advance."],
                ["spawn", "gs", "rebel", "n7", 62, 4],
                ["n", "The armies meet. Zhang Fei spears Zhang Bao's officer Gao Sheng from the saddle — and then Zhang Bao lets down his hair, raises his sword, and chants."],
                ["pose", "zhangfei", "strike"], ["fx", "flash", "n7", 56, 4], ["pose", "gs", "fall"],
                ["pose", "zb", "strike"],
                ["light", "storm", 800],
                ["fx", "blackwind", "n7", 40, -4],
                ["still", "blackwind_a", "slow zoom out"],
                ["n", "Wind howls and thunder rolls. Out of a black cloud pours a numberless host of horsemen. They are not men: they are riders cut from paper and straw, and the spell gives them life."],
                ["n", "Liu Bei's army, seeing a host it cannot hurt, breaks and flees."],
                ["run", "yt", "n7", 16, 0], ["run", "han", "n7", -120, 0], ["remove", "han"],
                ["say", "zhujun", "Sorcery. Paper and straw wearing the shape of men; no blade can kill what was never alive. Fall back to the road."],
                ["light", "day", 1500],
                ["n", "As they fall back, Liu Bei sees a game laid out on the little shrine under the old pine by the road."],
                ["remove", "yt"], ["remove", "zb"], ["remove", "zj"],
            ]},
            "shrine": {"title": "The Shrine under the Pine", "kind": "main", "steps": [
                # the shrine lights after the failure; the Star Lords speak, then the board
                ["spawn", "zj", "zhujun", "n7b", -14, -10],
                ["n", "At the little stone shrine under the pine sit the two white-haired men from the peach garden, over the board cut into its offering table, wine cups beside them, as if nothing had happened."],
                ["spawn", "sg", "stargrey", "n7b", -34, 20], ["spawn", "sr", "starred", "n7b", -26, 24],
                ["say", "stargrey", "Read this, before you go back."],
                ["still", "blackwind_c", "slow drift down"],
                ["say", "starred", "Pigs, sheep, dogs. Blood."],
                ["problem", "stargrey"],  # the board comes up here; the Star Lords are gone by the time it closes
                ["remove", "sg"], ["remove", "sr"],
                ["say", "zhujun", "Blood breaks sorcery. Tomorrow, hide men on the hilltops with the blood of pigs, sheep and dogs. When his spirits come, drench them, and the spell will break."],
                ["n", "Zhu Jun's own men have no blood to spare. But at the farm just east of the pine, the farmers keep pigs, sheep and hounds."],
                ["remove", "zj"],
                ["still", "bloodplan_a", "slow zoom in"],
                ["say", "liubei", "The blood of pigs, sheep and dogs. The farm east of here has all three. I will go and ask the farmers for it."],
                ["say", "guanyu", "Then Yide and I take a ridge each, I the left and he the right, with a thousand men and a bucket for every man."],
                ["say", "zhangfei", "And when the paper horses come down, we drown them!"],
                ["say", "liubei", "First the blood, all three. Then up to my brothers on the ridges. When the gun sounds, we strike."],
            ]},
            "bossearly": {"title": "The Wind Again", "kind": "main", "steps": [
                # no board, no cooldown: the army is routed again; the shrine has not been read yet
                ["army", "han", "militia", 5, "boss", -26, 0],
                ["spawn", "zb", "zhangbao", "boss", 60, 0],
                ["army", "yt", "rebel", 12, "boss", 76, 0],
                ["n", "Liu Bei marches on Yangcheng with nothing to break the sorcery. Again Zhang Bao lets down his hair and chants."],
                ["light", "storm", 800], ["fx", "blackwind", "boss", 40, -4],
                ["n", "Again the black wind pours out of the cloud. The army breaks."],
                ["run", "han", "boss", -120, 0], ["run", "liubei", "boss", -16, 0],
                ["light", "day", 1500],
                ["say", "liubei", "No man can fight a wind. Fall back."],
                ["remove", "han"], ["remove", "yt"], ["remove", "zb"],
            ]},
            "bossearly2": {"title": "The Wind Again", "kind": "main", "steps": [
                # the hint is taken but the blood is not delivered: Guan Yu names what is missing
                ["army", "han", "militia", 5, "boss", -26, 0],
                ["spawn", "zb", "zhangbao", "boss", 60, 0],
                ["army", "yt", "rebel", 12, "boss", 76, 0],
                ["n", "Liu Bei marches on Yangcheng with nothing to break the sorcery. Again Zhang Bao lets down his hair and chants."],
                ["light", "storm", 800], ["fx", "blackwind", "boss", 40, -4],
                ["n", "Again the black wind pours out of the cloud. The army breaks."],
                ["run", "han", "boss", -120, 0], ["run", "liubei", "boss", -16, 0],
                ["light", "day", 1500],
                ["say", "guanyu", "The old men said blood. Pigs, sheep, dogs. We have none. Go to the farm east of the pine and ask."],
                ["remove", "han"], ["remove", "yt"], ["remove", "zb"],
            ]},
            "bossearly3": {"title": "The Wind Again", "kind": "main", "steps": [
                # the blood is held, but it has not gone up to the ridges
                ["army", "han", "militia", 5, "boss", -26, 0],
                ["spawn", "zb", "zhangbao", "boss", 60, 0],
                ["army", "yt", "rebel", 12, "boss", 76, 0],
                ["n", "Liu Bei marches on Yangcheng with the blood still on his own carts. Again Zhang Bao lets down his hair and chants."],
                ["light", "storm", 800], ["fx", "blackwind", "boss", 40, -4],
                ["n", "Again the black wind pours out of the cloud. The army breaks."],
                ["run", "han", "boss", -120, 0], ["run", "liubei", "boss", -16, 0],
                ["light", "day", 1500],
                ["say", "liubei", "The blood is no use down here. It must go up to my brothers on the ridges, left and right."],
                ["remove", "han"], ["remove", "yt"], ["remove", "zb"],
            ]},
            "bosswin": {"title": "The General of Earth Falls", "kind": "main", "steps": [
                ["prop", "gate", "gate", "boss", 96, -16],
                ["army", "han", "militia", 5, "boss", -26, 0],
                ["army", "ridgeL", "militia", 3, "boss", 14, -42], ["army", "ridgeR", "militia", 3, "boss", 14, 42],
                ["spawn", "zb", "zhangbao", "boss", 60, 0],
                ["army", "yt", "rebel", 12, "boss", 76, 0],
                ["n", "Again Zhang Bao calls the wind. Liu Bei turns and flees, as planned, and the rebels chase him in under the ridges."],
                ["light", "storm", 800],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["still", "bosswin_a", "slow pan across"],
                ["n", "A signal gun — and blood and filth rain down from the ridge."],
                ["fx", "flash", "boss", 14, -42], ["camera", "shake"],
                ["run", "ridgeL", "boss", 34, -12], ["run", "ridgeR", "boss", 34, 12],
                ["run", "yt", "boss", 20, 0],
                ["fx", "flash", "boss", 12, -8],
                ["fx", "paper", "boss", 20, 0],
                ["pose", "yt", "fall"],
                ["light", "day", 1200],
                ["still", "bosswin_c", "slow drift down"],
                ["n", "Paper men and straw horses flutter to the ground. The wind dies. Liu Bei's arrow strikes Zhang Bao in the arm, and he flees into Yangcheng."],
                ["pose", "liubei", "strike"], ["fx", "flash", "boss", 60, 0],
                ["remove", "yt"], ["run", "zb", "boss", 70, 0],
                ["spawn", "yz", "yanzheng", "boss", 84, 4],
                ["n", "Zhu Jun's army surrounds Yangcheng. Zhang Bao holds the walls and will not come out. Behind him stands his own officer, Yan Zheng."],
                ["surround", "han", "gate", 48], ["mood", "dark"], ["close", "han", "gate", 28],
                ["wait", 800],
                ["move", "yz", "boss", 76, 0],
                ["pose", "yz", "strike"], ["fx", "flash", "boss", 70, 0], ["pose", "zb", "fall"], ["camera", "shake"],
                ["still", "bosswin_d", "slow zoom in"],
                ["n", "Yan Zheng stabs him, and carries his head out to surrender."],
                ["remove", "zb"], ["remove", "yz"],
                ["mood", "clear"], ["pose", "han", "cheer"],
            ]},
            # ---- side stories: the long road ----
            "peace1": {"title": "The Way of Great Peace · I: The Old Man in the Cave", "kind": "side", "steps": [
                ["n", "Years before, the man who would lead the Yellow Turbans was only a failed scholar named Zhang Jiao. One day he went into the hills to gather herbs."],
                ["spawn", "zj", "zhangjiao", "a1", 14, 4], ["spawn", "imm", "immortal", "a1", -10, -4],
                ["still", "peace1_a", "slow zoom in"],
                ["n", "There he met an old man with green eyes and a child's face, leaning on a staff, who led him into a cave."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["prop", "bk", "book", "a1", -6, -2],
                ["say", "immortal", "These three books are the Essentials of Great Peace. Take them, spread Heaven's teaching, and save the world. But harbour one rebellious thought, and you will be punished."],
                ["move", "bk", "a1", 10, 4],
                ["say", "zhangjiao", "Master, what is your name?"],
                ["say", "immortal", "I am the Old Immortal of Southern Florescence."],
                ["fx", "dust", "a1", -10, -4], ["remove", "imm"],
                ["n", "And he vanished in a breath of wind."],
            ]},
            "peace2": {"title": "The Way of Great Peace · II: The Blue Heaven Is Dead", "kind": "side", "steps": [
                ["spawn", "zj", "zhangjiao", "a2", 0, 0],
                ["army", "sick", "f_villager", 3, "a2", 12, 6], ["pose", "sick", "kneel"],
                ["prop", "wb", "waterbowl", "a2", 6, 2],
                ["n", "Zhang Jiao studied the books day and night until he could summon wind and rain. When plague swept the land, he went about giving out charmed water, and the sick recovered."],
                ["pose", "sick", "stand"], ["emote", "sick", "heart"],
                ["army", "disc", "f_monk", 6, "a2", -18, 6],
                ["n", "He styled himself the Great and Virtuous Teacher. His disciples numbered in the hundreds of thousands, organised in thirty-six divisions."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["still", "peace2_b", "slow pan up"],
                ["say", "zhangjiao", "The Blue Heaven is dead! The Yellow Heaven shall rise! In the year jiazi, great fortune for all under Heaven!"],
                ["prop", "jz", "jiazi", "a2", 18, -6],
                ["n", "Across eight provinces, families chalked the word jiazi on their doors."],
            ]},
            "peace3": {"title": "The Way of Great Peace · III: Betrayed", "kind": "side", "steps": [
                ["spawn", "zj", "zhangjiao", "a3", 0, 0],
                ["say", "zhangjiao", "The hardest thing in the world to win is the people's hearts — and now they are ours. To let this moment pass would be a crime."],
                ["spawn", "eun", "f_official", "a3", -18, -4],
                ["n", "His agent Ma Yuanyi took gold to the palace eunuch Feng Xu, to have him open the gates from within. But his disciple Tang Zhou carried the plan straight to the court."],
                ["spawn", "tz", "f_official", "a3", -10, 8], ["run", "tz", "a3", -60, 8],
                ["spawn", "my", "f_official", "a3", 22, 0], ["spawn", "ex", "f_soldier", "a3", 28, -4], ["pose", "my", "kneel"],
                ["n", "Ma Yuanyi was caught in Luoyang and beheaded."],
                ["pose", "ex", "strike"], ["fx", "flash", "a3", 22, 0], ["pose", "my", "fall"],
                ["remove", "tz"], ["remove", "eun"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["spawn", "zbao", "zhangbao", "a3", 14, 10], ["spawn", "zl", "rebel", "a3", 14, -10],
                ["say", "zhangjiao", "Then we rise now. I am the General of Heaven. Zhang Bao, you are General of Earth. Zhang Liang, General of Man."],
                ["army", "yt", "rebel", 12, "a3", 30, 0], ["prop", "yb", "yellowbanner", "a3", 24, -8],
                ["n", "Half a million rose in yellow scarves, and the imperial armies scattered before them like leaves."],
            ]},
            "caocao1": {"title": "The Hero of Chaos · I: The Feigned Stroke", "kind": "side", "steps": [
                ["spawn", "cc", "caocao", "b1", 4, 6], ["spawn", "cs", "f_elder", "b1", 20, -4],
                ["n", "Liu Bei is not the only young man this war will raise. Years before, far to the south in Qiao, lived a boy named Cao Cao."],
                ["n", "He loved hunting, music and mischief, and his uncle kept telling his father so."],
                ["spawn", "unc", "uncle", "b1", -26, -4], ["move", "unc", "b1", -10, -4],
                ["n", "So one day, seeing his uncle coming, Cao Cao dropped to the ground, twitching."],
                ["pose", "cc", "drunk"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "uncle", "Brother! Your son has had a stroke!"],
                ["pose", "cc", "stand"],
                ["say", "caocao", "A stroke? I've never had one in my life. Uncle just dislikes me, so he tells tales about me."],
                ["n", "From then on, whatever the uncle reported, Cao Cao's father never believed a word."],
            ]},
            "caocao2": {"title": "The Hero of Chaos · II: A Villain in Chaos", "kind": "side", "steps": [
                ["n", "When he was grown, Cao Cao went to see Xu Shao of Runan, who was famous for judging men."],
                ["say", "caocao", "What kind of man am I?"],
                ["n", "Xu Shao would not answer. Cao Cao asked again."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "xushao", "In an age of order, an able minister. In an age of chaos — a cunning villain."],
                ["still", "caocao2_b", "zoom in"],
                ["n", "Cao Cao laughed with delight."],
            ]},
            "staves": {"title": "The Hero of Chaos · II-b: The Five-Coloured Staves", "kind": "side", "steps": [
                ["light", "night", 800],
                ["prop", "st1", "staves", "b2g", -20, -14], ["prop", "st2", "staves", "b2g", -20, 14],
                ["spawn", "cc", "caocao", "b2g", -30, 0], ["army", "watch", "f_soldier", 3, "b2g", -34, 6],
                ["n", "Cao Cao is made captain of the north district of Luoyang. As soon as he takes office, he hangs more than ten coloured staves at the four gates of the city."],
                ["n", "Anyone who breaks the curfew is beaten, rich or powerful alike."],
                ["spawn", "jsu", "f_noble", "b2g", 60, 0], ["move", "jsu", "b2g", 18, 0],
                ["n", "One night the uncle of the eunuch Jian Shuo walks the street with a sword in his hand. Cao Cao's patrol catches him."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["fx", "whip", "b2g", 16, 0], ["fx", "whip", "b2g", 16, 0], ["fx", "whip", "b2g", 16, 0],
                ["n", "Cao Cao has him beaten with the staves."],
                ["n", "After that, no one inside the city or out dares to break the rule, and Cao Cao's name spreads."],
                ["light", "day", 1500],
            ]},
            "caocao3": {"title": "The Hero of Chaos · III: Red Banners at Changshe", "kind": "side", "steps": [
                ["n", "That same night, as Liu Bei hurried toward Yingchuan, the rebels fled the flames at Changshe."],
                ["army", "yt", "rebel", 10, "b3", 40, 0],
                ["spawn", "zbao", "zhangbao", "b3", 54, -6], ["spawn", "zl", "rebel", "b3", 54, 6],
                ["light", "night", 1500],
                ["fx", "fire", "b3", 0, -14], ["fx", "fire", "b3", 40, 0],
                ["n", "That night a great wind rose. The camp went up in flames; the rebels fled without saddles or armour."],
                ["run", "yt", "b3", 90, 0], ["run", "zbao", "b3", 110, -6], ["run", "zl", "b3", 110, 6],
                ["light", "dawn", 1500],
                ["army", "col", "militia", 8, "b3", 170, 0], ["prop", "rb", "redbanner", "b3", 160, -10],
                ["n", "At dawn, as Zhang Bao and Zhang Liang ran, a column under red banners barred the road."],
                ["move", "col", "b3", 118, 0], ["move", "rb", "b3", 112, -10],
                ["light", "day", 1500],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["spawn", "cc", "caocao", "b3", 124, 0],
                ["still", "caocao3_b", "slow zoom in"],
                ["say", "caocao", "Cao Cao, Commandant of Cavalry. You go no further."],
                ["pose", "col", "strike"], ["pose", "yt", "fall", 8],
                ["n", "Ten thousand heads were taken. The two brothers barely escaped with their lives."],
                ["run", "zbao", "b3", 200, -30], ["run", "zl", "b3", 200, 30],
            ]},
            # ---- the closing: the inspector at Anxi ----
            "hostel": {"title": "The Inspector's Visit", "kind": "main", "steps": [
                ["prop", "tbl", "table", "ax1", -20, 10],
                ["still", "anxi_a", "slow zoom in"],
                ["n", "At Anxi, Liu Bei governs for a month and wrongs no one. The three eat at one table and sleep in one bed. When Liu Bei sits among crowds, Guan Yu and Zhang Fei stand at his side all day without tiring."],
                ["pose", "party", "sit"], ["wait", 1000], ["pose", "party", "stand"],
                ["n", "Less than four months after he took office, an edict orders officers with military merit to be culled. Liu Bei fears he is among them. An inspector arrives."],
                ["spawn", "ins", "inspector", "ax1", 0, -24], ["pose", "ins", "sit"],   # behind the hostel's own desk, high and facing south
                ["n", "Liu Bei goes out of the city to greet him. The inspector stays on his horse and answers with a small flick of his whip. Guan Yu and Zhang Fei are furious."],
                ["n", "At the hostel the inspector sits facing south; Liu Bei stands below the steps."],
                ["say", "inspector", "What is your origin, Sheriff Liu?"],
                ["say", "liubei", "I descend from Prince Jing of Zhongshan. I fought the Yellow Turbans from Zhuo County in over thirty battles."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "inspector", "You claim imperial blood and invent your merits! The court is purging frauds like you."],
                ["wait", 1000],
                ["n", "Liu Bei asks his clerks what to do. The inspector only wants a bribe, they say. But Liu Bei has taken nothing from the people, and has nothing to give. The inspector seizes the clerks, and each time Liu Bei comes to plead, he is turned away at the gate."],
            ]},
            "post": {"title": "The Hitching Post", "kind": "main", "steps": [
                ["army", "elders", "f_villager", 5, "ax2", -30, 6],
                ["still", "post_a", "slow pull back"],
                ["n", "Zhang Fei, a few cups of gloomy wine in, rides past the hostel and finds fifty or sixty old villagers weeping at the gate."],
                ["wait", 1200],
                ["n", "The inspector is forcing the clerks to accuse Liu Bei, they tell him, and the gatekeepers beat them away when they come to plead for him."],
                ["spawn", "ins", "inspector", "ax2", 30, 0], ["prop", "post", "post", "ax2", 20, 0],
                ["say", "zhangfei", "Tormentor of the people! Do you know who I am?"],
                ["n", "He drags the inspector out by the hair, to the hitching post before the county office, and ties him there."],
                ["move", "ins", "ax2", 20, 0],
                ["fx", "whip", "ax2", 20, 0], ["fx", "whip", "ax2", 20, 0], ["fx", "whip", "ax2", 20, 0],
                ["prop", "sw", "switches", "ax2", 14, 8],
                ["still", "post_b", "slow zoom in"],
                ["n", "Zhang Fei breaks ten or more willow switches across his legs."],
                ["say", "inspector", "Lord Xuande! Save my life!"],
                ["n", "Liu Bei, a gentle man at heart, orders Zhang Fei to stop."],
                ["say", "guanyu", "Brother, you won great merit and were given only a sheriff's post, and now an inspector insults you. A phoenix does not roost among thorns. Let us kill him, give up the office, and make greater plans elsewhere."],
                ["wait", 1200],
                ["problem"],  # the board is Liu Bei weighing it; solving it is the choice
                ["prop", "seal", "seal", "ax2", 12, -4],
                ["n", "He hangs the seal around the inspector's neck."],
                ["say", "liubei", "For what you have done to the people you deserve to die. I spare your life. I return my seal of office, and I am gone."],
                ["remove", "ins"],
                ["scroll", "Chapter 2", [
                    "Emperor Ling died. In the capital, his brother-in-law, General He Jin, resolved to destroy the eunuchs at last — and sent for the warlords of the provinces to march on Luoyang and force the Empress's hand.",
                    "“A mistake,” warned his secretary Chen Lin. “You hand the spear to others, point first.”",
                    "A man beside them clapped and laughed. “This is as easy as turning over a hand. Why so much talk?” It was Cao Cao.",
                    "What did Cao Cao propose? Hear the next chapter.",
                ]],
            ]},
            # ---- side stories: the shortcuts ----
            "horses": {"title": "Horses from the North", "kind": "main", "steps": [
                ["spawn", "zsp", "merchant", "as", 26, -6], ["spawn", "zsp2", "merchant", "as", 30, 2],
                ["army", "herd", "horse", 6, "as", 44, 0],
                ["still", "horses_a", "slow pan across"],
                ["n", "While they are still worrying, word comes of two horse dealers, Zhang Shiping and Su Shuang, camped on the northern trail with a herd of horses."],
                ["say", "liubei", "This is Heaven's help!"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "merchant", "Bandits have closed the road north. If you mean to crush them, take fifty horses — and five hundred taels of silver, and a thousand jin of steel for your weapons."],
                ["move", "herd", "as", 16, 0],
                ["prop", "chest", "chest", "as", 38, -6], ["prop", "bars", "steelbars", "as", 38, 2],
                ["gain", "horses"], ["gain", "silver"],
                ["prop", "forge", "forge", "as", -24, -16], ["prop", "anvil", "anvil", "as", -12, -12],
                ["spawn", "smith", "f_porter", "as", -14, -4],
                ["fx", "sparkle", "as", -12, -12], ["wait", 300], ["fx", "sparkle", "as", -12, -12],
                ["n", "Liu Bei has twin swords forged. Guan Yu's blade is the Green Dragon Crescent, eighty-two jin, called Cold Beauty. Zhang Fei's is an eighteen-foot serpent spear of steel."],
                ["give", "smith", "liubei", "twin_swords"],
                ["give", "smith", "guanyu", "green_dragon"],
                ["give", "smith", "zhangfei", "serpent_spear"],
                ["pose", "party", "raise"],
                ["still", "horses_b", "slow pan across"],   # after the gives, so nothing moves under it
                ["n", "Armed and mounted at last, the brothers lead their five hundred to the governor."],
            ]},
            "bribe": {"title": "A Bribe Refused", "kind": "side", "steps": [
                ["n", "How did Lu Zhi come to be in that cart? Go back a few weeks, to his camp."],
                ["n", "At Guangzong, Lu Zhi had Zhang Jiao penned in, though the rebel's sorcery kept him from the final blow. Then the court's envoy arrived: the eunuch Zuo Feng."],
                ["say", "zuofeng", "Your victories are splendid, general. And where is the gift for the Emperor's envoy?"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "luzhi", "My army lacks grain. Where would I find money to flatter an envoy?"],
                ["n", "Zuo Feng rode back to Luoyang and reported that Lu Zhi skulked behind his walls and would not fight."],
            ]},
        },
        "closing": [
            ["scroll", "The Yellow Turbans Fall", [
                "At Guangzong, Huangfu Song took over from Dong Zhuo, but Zhang Jiao had already died of illness. Huangfu Song beat Zhang Liang in seven battles and broke open the Great Teacher's coffin. The rebellion was over.",
                "At Wancheng, Liu Bei gave Zhu Jun some advice: “Surround them completely and every man fights to the death. Leave them one way out, and they will run.” It worked. There too, a young officer named Sun Jian was first over the wall: a name to remember.",
                "But the eunuchs gave rewards only to those who paid. For all his battles, Liu Bei was made a mere county sheriff, at Anxi.",
            ]],
        ],
    },
]

# ---- World 2 (Book 2: Hulao Pass) lives in tk_story_w2.py ----
import pathlib as _pl, sys as _sys  # noqa: E402
_sys.path.insert(0, str(_pl.Path(__file__).resolve().parent))
from tk_story_w2 import WORLD2 as _WORLD2  # noqa: E402
WORLDS.append(_WORLD2)
from tk_story_w3 import WORLD3 as _WORLD3  # noqa: E402
WORLDS.append(_WORLD3)
# ---- the new Book 2, as a test book (world 12) until it replaces World 2: #/tk/12 in test mode ----
import copy as _copy  # noqa: E402
from tk_story_w2_new import WORLD2 as _DRAFT2  # noqa: E402
_DRAFT2 = _copy.deepcopy(_DRAFT2)
_DRAFT2.update(n=12, name="Diaochan", zh="貂蝉", chapters=[8, 9], open=True, book=2,
               easy_grades=["14K", "14K+"])   # the menu's Easy: 14K problems (the user, 2026-10-07)   # live, open to everyone (the user, 2026-10-07)
_DRAFT2.setdefault("boss", "redmond")  # Book 2's boss pool
_DRAFT2["next"] = 14   # on into Lü Bu's fall
# ---- the Cao Cao arc (novel chapters 3-5), world 13, published (apo110, 2026-10-08); it comes first: chapters 3-5, before the Diaochan arc's 8-9 ----
from tk_story_w2_new import WORLD2_CC as _CC  # noqa: E402
_CC = _copy.deepcopy(_CC)
_CC.update(n=13, name="Cao Cao", zh="曹操", open=True, book=1, next=12, easy_grades=["14K", "14K+"])
WORLDS.append(_CC)   # listed before the Diaochan arc: new players start here
WORLDS.append(_DRAFT2)
# ---- Lü Bu's fall (novel chapters 13-19, White Gate Tower), world 14, published ----
from tk_story_w2_new import WORLD2_LB as _LB  # noqa: E402
_LB = _copy.deepcopy(_LB)
_LB.update(n=14, name="White Gate Tower", zh="白门楼", open=True, book=3, easy_grades=["14K", "14K+"])   # published (the user, 2026-10-08: "publish to main page instead of testing from now on")
_LB.setdefault("boss", "redmond")
WORLDS.append(_LB)
# ---- Lady Sun's marriage (novel chapters 54-55, Three Silk Pouches), world 15: the book after White Gate Tower ----
from tk_story_w2_new import WORLD2_LS as _LS  # noqa: E402
_LS = _copy.deepcopy(_LS)
_LS.update(n=15, name="Three Silk Pouches", zh="锦囊妙计", open=True, book=4, easy_grades=["14K", "14K+"])   # published (Testing's player walk 15/15, 2026-10-09)
_LB["next"] = 15   # White Gate Tower goes on into it
WORLDS.append(_LS)
# ---- Misaeng (Season 1, the webtoon), world 21: a modern book, English only (tk_story_w21.py; Integration alt2) ----
# hidden (test mode only) until its maps are built and the user publishes it
from tk_story_w21 import WORLD21 as _MS, CAST21 as _MS_CAST  # noqa: E402
_MS = _copy.deepcopy(_MS)
_MS.update(cast=_MS_CAST, hidden=True, novel="misaeng", book=1, kit="seoul", easy_grades=["14K", "14K+"])   # its own Library card (tk.js TK_NOVELS)
WORLDS.append(_MS)
# Books 1-3 are taken down for now (the user, 2026-10-07): kept, and still open in test mode (?test=1)
for _w in WORLDS:
    if _w["n"] in (1, 2, 3):
        _w["hidden"] = True
