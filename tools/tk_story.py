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
        },
        # Map, 480x270. "role": main (fixed, carries a main story point),
        # side (long road), short (shortcut), boss.
        "nodes": [
            {"key": "start", "x": 34, "y": 236, "place": "Lousang Village"},
            {"key": "n1", "x": 70, "y": 214, "role": "main", "place": "Zhuo County", "step": 0.0, "scene": "notice"},
            {"key": "n2", "x": 108, "y": 186, "role": "main", "place": "The Peach Garden", "step": 0.1, "scene": "oath"},
            {"key": "a1", "x": 140, "y": 222, "role": "side", "place": "Road to Julu", "step": 0.15, "scene": "peace1"},
            {"key": "a2", "x": 180, "y": 236, "role": "side", "place": "Julu", "step": 0.2, "scene": "peace2"},
            {"key": "a3", "x": 214, "y": 212, "role": "side", "place": "Yellow Hills", "step": 0.25, "scene": "peace3"},
            {"key": "as", "x": 160, "y": 150, "role": "short", "place": "Horse Trail", "step": 0.2, "scene": "horses"},
            {"key": "n3", "x": 246, "y": 178, "role": "main", "place": "Daxing Mountain", "step": 0.35, "scene": "daxing"},
            {"key": "n4", "x": 282, "y": 206, "role": "main", "place": "Qingzhou", "step": 0.45, "scene": "qingzhou"},
            {"key": "n5", "x": 316, "y": 176, "role": "main", "place": "Guangzong Road", "step": 0.55, "scene": "cart"},
            {"key": "b1", "x": 342, "y": 214, "role": "side", "place": "Qiao", "step": 0.6, "scene": "caocao1"},
            {"key": "b2", "x": 378, "y": 230, "role": "side", "place": "Luoyang Gates", "step": 0.65, "scene": "caocao2"},
            {"key": "b3", "x": 412, "y": 204, "role": "side", "place": "Changshe", "step": 0.7, "scene": "caocao3"},
            {"key": "bs", "x": 360, "y": 146, "role": "short", "place": "Envoy's Road", "step": 0.65, "scene": "bribe"},
            {"key": "n6", "x": 420, "y": 164, "role": "main", "place": "Dong Zhuo's Camp", "step": 0.8, "scene": "office"},
            {"key": "n7", "x": 388, "y": 114, "role": "main", "place": "Hills of Black Wind", "step": 0.9, "scene": "blackwind"},
            {"key": "boss", "x": 432, "y": 62, "role": "boss", "place": "Yangcheng", "scene": "bosswin",
             "boss": {"who": "zhangbao", "title": "Zhang Bao, General of Earth",
                      "taunt": "Wind and thunder answer to me! Your little band will be swept away like dust."}},
        ],
        "edges": [["start", "n1"], ["n1", "n2"], ["n2", "a1"], ["a1", "a2"], ["a2", "a3"], ["a3", "n3"],
                  ["n2", "as"], ["as", "n3"], ["n3", "n4"], ["n4", "n5"], ["n5", "b1"], ["b1", "b2"], ["b2", "b3"],
                  ["b3", "n6"], ["n5", "bs"], ["bs", "n6"], ["n6", "n7"], ["n7", "boss"]],
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
                "The governor of You Province posts a call for volunteers. The notice reaches Zhuo County…",
            ]],
        ],
        "scenes": {
            # ---- main story ----
            "notice": {"title": "The Notice at Zhuo", "kind": "main", "steps": [
                ["n", "Zhuo County. A crowd gathers at a notice on the wall: the governor is raising volunteers against the Yellow Turbans."],
                ["n", "Liu Bei, twenty-eight, descends from Prince Jing of Zhongshan — yet he sells sandals and weaves mats for a living. His ears reach his shoulders; his arms hang past his knees."],
                ["n", "He reads the notice, and sighs."],
                ["spawn", "zf", "zhangfei", "n1", 30, 4],
                ["move", "zf", "n1", 12, 2],
                ["say", "zhangfei", "A real man should serve his country! What are you sighing for?"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "liubei", "I am of the Han imperial house. I long to crush these rebels and bring peace — but I lack the strength."],
                ["say", "zhangfei", "I've got money and land. Let's raise men together! But first — wine."],
                ["n", "At the village inn, a giant pushing a cart strides in: nine feet tall, a beard two feet long, a face like a ripe red date."],
                ["spawn", "gy", "guanyu", "n1", -40, -10],
                ["move", "gy", "n1", -12, 0],
                ["say", "guanyu", "Wine, quickly! I'm off to the city to join the army."],
                ["say", "liubei", "Then sit with us, friend. We have the same purpose."],
                ["say", "guanyu", "Guan Yu, of Hedong. I killed a bully who preyed on my village, and I've been on the run five years."],
                ["n", "Liu Bei tells him his own aim, and Guan Yu is delighted. The three go together to Zhang Fei's farm to plan their great enterprise."],
                ["say", "zhangfei", "Behind my farm is a peach garden in full bloom. Tomorrow, let's swear brotherhood there before Heaven and Earth!"],
                ["say", "liubei", "Very good."],
                ["say", "guanyu", "Very good."],
                ["remove", "zf"], ["remove", "gy"],
                ["party", ["liubei", "guanyu", "zhangfei"]],
            ]},
            "oath": {"title": "The Peach Garden Oath", "kind": "main", "steps": [
                ["n", "The next day, in the peach garden behind Zhang Fei's farm, the blossoms are in full bloom."],
                ["fx", "petals", "n2", 0, -20],
                ["n", "With a black ox and a white horse for sacrifice, the three burn incense and bow."],
                ["fx", "incense", "n2", -14, -4],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "liubei", "Though we were not born on the same day of the same month of the same year…"],
                ["say", "guanyu", "…we wish to die on the same day of the same month of the same year."],
                ["say", "zhangfei", "Heaven and Earth, witness it! If we betray this oath, may Heaven and men strike us down!"],
                ["wait", 1500],
                ["prop", "tbl", "table", "n2", 0, 14], ["prop", "wine", "winejars", "n2", 22, 14],
                ["pose", "party", "drink"], ["emote", "zhangfei", "music"], ["pose", "party", "cheer"],
                ["army", "braves", "militia", 8, "n2", -70, 0], ["move", "braves", "n2", -28, 0],
                ["n", "Liu Bei becomes eldest brother, Guan Yu second, Zhang Fei youngest. Three hundred village braves join them, and they drink in the garden until they can drink no more."],
                ["pose", "braves", "bow"], ["pose", "zhangfei", "drunk"], ["emote", "zhangfei", "zzz"], ["wait", 900], ["pose", "braves", "stand"],
                ["n", "Their road forks here. The long road passes through the rebels' heartland; the mountain trail is shorter, and steeper."],
            ]},
            "daxing": {"title": "First Blood at Daxing Mountain", "kind": "main", "steps": [
                # the novel's gifts come before the first battle, whichever road you took
                ["gain", "horses"], ["gain", "twin_swords"], ["gain", "green_dragon"], ["gain", "serpent_spear"],
                ["army", "braves", "militia", 5, "n3", -24, 0],
                ["army", "yt", "rebel", 24, "n3", 72, 0],
                ["n", "Liu Bei and his five hundred report to the governor, Liu Yan. Learning that Liu Bei is of the same imperial house, Liu Yan is delighted and takes him as a nephew."],
                ["n", "Not many days later, the Yellow Turban general Cheng Yuanzhi marches on Zhuo with fifty thousand men. Liu Bei meets him with five hundred."],
                ["spawn", "r1", "rebel", "n3", 40, -8], ["spawn", "r2", "chengyuanzhi", "n3", 46, 6],
                ["say", "liubei", "Traitors to the realm! Why not surrender now?"],
                ["say", "chengyuanzhi", "Deng Mao — bring me his head!"],
                ["spawn", "sg", "stargrey", "n3", -40, 18], ["spawn", "sr", "starred", "n3", -32, 22],
                ["n", "Under an old tree by the road, two white-haired men sit over a weiqi board, as if no army were coming."],
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
            ]},
            "qingzhou": {"title": "The Ambush at Qingzhou", "kind": "main", "steps": [
                ["prop", "gate", "gate", "n4", 70, -16],
                ["army", "relief", "militia", 4, "n4", -24, 0],
                ["army", "yt", "rebel", 15, "n4", 80, 0],
                ["n", "A letter comes from Gong Jing, governor of Qingzhou: the Yellow Turbans have his city surrounded, and it is about to fall. He begs for help."],
                ["say", "liubei", "I will go and rescue it."],
                ["n", "Rebels besiege Qingzhou. The relief force is outnumbered and falls back thirty li."],
                ["surround", "yt", "gate", 32], ["emote", "liubei", "sweat"],
                ["spawn", "sg", "stargrey", "n4", -36, 20], ["spawn", "sr", "starred", "n4", -28, 24],
                ["n", "That night, at the edge of the camp, the two old men are at their board again."],
                ["say", "stargrey", "Another."],
                ["problem", "stargrey"],  # the board comes up here; the rest plays once it is solved
                ["say", "starred", "Don't hold the strong point. Give ground, and make them follow."],
                ["remove", "sg"], ["remove", "sr"],
                ["say", "liubei", "They are many and we are few. Only surprise will win this. Yunchang, hide your men left of the ridge. Yide, to the right. When the gongs sound, strike."],
                ["move", "guanyu", "n4", 8, -40], ["move", "zhangfei", "n4", 8, 40],
                ["n", "Next morning Liu Bei attacks — then turns and flees. The rebels chase him over the ridge."],
                ["run", "liubei", "n4", 30, 0], ["run", "liubei", "n4", -30, 0],
                ["run", "yt", "n4", 10, 0],
                ["fx", "dust", "n4", 0, 0],
                ["fx", "flash", "n4", -30, 0],
                ["run", "guanyu", "n4", 2, -10], ["run", "zhangfei", "n4", 2, 10], ["run", "liubei", "n4", -8, 0],
                ["n", "Gongs crash. Guan Yu and Zhang Fei burst from both flanks as Liu Bei wheels around. Caught from three sides, the rebels break, and the siege of Qingzhou is lifted."],
                ["pose", "yt", "fall", 4], ["run", "yt", "n4", 160, 0], ["remove", "yt"],
            ]},
            "cart": {"title": "The Cage Cart", "kind": "main", "steps": [
                ["n", "Qingzhou is relieved. Liu Bei hears that his old teacher Lu Zhi is fighting Zhang Jiao himself at Guangzong, and goes to help him."],
                ["n", "Lu Zhi is glad to see him, and keeps him at his tent. Then he sends him with a thousand more men to Yingchuan, to learn how Huangfu Song and Zhu Jun are doing against Zhang Jiao's brothers."],
                ["n", "By the time Liu Bei arrives, the rebels have been routed by fire. Huangfu Song tells him the brothers will run to Zhang Jiao at Guangzong, and he turns back through the night."],
                ["n", "Halfway there, they meet soldiers guarding a prison cart."],
                ["prop", "cart", "cagecart", "n5", 30, -6],
                ["spawn", "lz", "luzhi", "n5", 30, -6], ["board", "lz", "cart"],
                ["army", "guards", "f_soldier", 4, "n5", 44, 0],
                ["mood", "dark"], ["camera", "zoom", 1.4, 800],
                ["say", "luzhi", "Xuande! I had Zhang Jiao surrounded. But the court's envoy demanded a bribe, and I refused him. Now I go to the capital in chains, and Dong Zhuo takes my army."],
                ["camera", "zoom", 1, 500], ["emote", "zhangfei", "anger"],
                ["say", "zhangfei", "I'll cut down these guards and set him free!"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "liubei", "The court will judge him fairly. Don't be rash, Yide!"],
                ["wait", 1200],
                ["emote", "lz", "..."],
                ["move", "cart", "n5", 70, -10], ["move", "guards", "n5", 84, -10],
                ["remove", "cart"], ["remove", "guards"], ["mood", "clear"],
                ["n", "The cart rolls away toward Luoyang."],
                ["say", "guanyu", "Lu Zhi is under arrest, and another man will lead his army. We have no one left to turn to here. Let us go back to Zhuo."],
                ["n", "Liu Bei agrees, and they march north. Again the road divides."],
            ]},
            "office": {"title": "“What Office Do You Hold?”", "kind": "main", "steps": [
                ["n", "Heading home, the brothers hear a roar behind the hills: Han troops in rout, and behind them banners reading GENERAL OF HEAVEN."],
                ["say", "liubei", "That is Zhang Jiao! Charge!"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["fx", "dust", "n6", 20, -10],
                ["n", "The three ride into his flank and drive him back fifty li. They escort the defeated commander, Dong Zhuo, safely to his camp."],
                ["spawn", "dz", "dongzhuo", "n6", 18, -6],
                ["say", "dongzhuo", "And what office do you hold?"],
                ["say", "liubei", "None, my lord. We are commoners."],
                ["n", "Dong Zhuo turns his back without a word of thanks."],
                ["remove", "dz"],
                ["wait", 1000],
                ["say", "zhangfei", "We bled to save that wretch and he treats us like dirt! I'll kill him!"],
                ["say", "liubei", "He is an officer of the court! You cannot."],
                ["say", "zhangfei", "If I don't kill him, I'll have to take his orders, and I won't. Stay here if you like, brothers. I'm going elsewhere."],
                ["say", "liubei", "We three are bound in life and death. How could we part? Then we will all go elsewhere."],
                ["say", "zhangfei", "If so, that eases my anger a little."],
                ["wait", 1000],
                ["n", "That night they leave to join the general Zhu Jun instead."],
            ]},
            "blackwind": {"title": "Black Wind, Paper Soldiers", "kind": "main", "steps": [
                ["spawn", "zj", "zhujun", "n7", -14, -10],
                ["army", "han", "militia", 6, "n7", -30, 0],
                ["spawn", "zb", "zhangbao", "n7", 70, 0],
                ["army", "yt", "rebel", 14, "n7", 86, 0],
                ["n", "Zhu Jun receives them warmly. The two armies join, and Zhu Jun makes Liu Bei his vanguard against Zhang Bao."],
                ["n", "Zhu Jun's army faces Zhang Bao, the General of Earth. Zhang Fei spears his officer Gao Sheng from the saddle — and then Zhang Bao lets down his hair, raises his sword, and chants."],
                ["pose", "zb", "strike"],
                ["fx", "blackwind", "n7", 40, -4],
                ["n", "Wind howls and thunder rolls. Out of a black cloud pours a numberless host of horsemen. Liu Bei's army breaks and flees."],
                ["run", "yt", "n7", 16, 0], ["run", "han", "n7", -120, 0], ["remove", "han"],
                ["spawn", "sg", "stargrey", "n7", -34, 20], ["spawn", "sr", "starred", "n7", -26, 24],
                ["n", "At a roadside shrine the two old men sit over their board, as if nothing were happening."],
                ["say", "stargrey", "Read this, before you run."],
                ["problem", "stargrey"],  # the board comes up here; the rest plays once it is solved
                ["say", "starred", "Pigs, sheep, dogs. Blood."],
                ["remove", "sg"], ["remove", "sr"],
                ["say", "zhujun", "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them. The spell will break."],
                ["n", "Guan Yu and Zhang Fei each take a thousand men up the ridge behind the hill, with the blood and filth."],
                ["remove", "yt"], ["remove", "zb"], ["remove", "zj"],
            ]},
            "bosswin": {"title": "The General of Earth Falls", "kind": "main", "steps": [
                ["prop", "gate", "gate", "boss", 96, -16],
                ["army", "han", "militia", 5, "boss", -26, 0],
                ["spawn", "zb", "zhangbao", "boss", 60, 0],
                ["army", "yt", "rebel", 12, "boss", 76, 0],
                ["n", "Again Zhang Bao calls the wind; again Liu Bei flees, and the rebels chase him to the hill."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["n", "A signal gun — and blood and filth rain down from the ridge."],
                ["run", "yt", "boss", 20, 0],
                ["fx", "flash", "boss", 12, -8],
                ["fx", "paper", "boss", 20, 0],
                ["pose", "yt", "fall"],
                ["n", "Paper men and straw horses flutter to the ground. The wind dies. Liu Bei's arrow strikes Zhang Bao in the arm, and he flees into Yangcheng."],
                ["remove", "yt"], ["run", "zb", "boss", 70, 0],
                ["spawn", "yz", "yanzheng", "boss", 84, 4],
                ["n", "Zhu Jun's army surrounds Yangcheng. Zhang Bao holds the walls and will not come out. Behind him stands his own officer, Yan Zheng."],
                ["surround", "han", "gate", 48], ["mood", "dark"], ["close", "han", "gate", 28],
                ["wait", 800],
                ["move", "yz", "boss", 76, 0],
                ["pose", "yz", "strike"], ["fx", "flash", "boss", 70, 0], ["pose", "zb", "fall"], ["camera", "shake"],
                ["n", "Yan Zheng stabs him, and carries his head out to surrender."],
                ["remove", "zb"], ["remove", "yz"],
                ["mood", "clear"], ["pose", "han", "cheer"],
            ]},
            # ---- side stories: the long road ----
            "peace1": {"title": "The Way of Great Peace · I: The Old Man in the Cave", "kind": "side", "steps": [
                ["n", "Meanwhile — or rather, years before — a failed scholar named Zhang Jiao went into the hills to gather herbs."],
                ["n", "There he met an old man with green eyes and a child's face, leaning on a staff, who led him into a cave."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "immortal", "These three books are the Essentials of Great Peace. Take them, spread Heaven's teaching, and save the world. But harbour one rebellious thought, and you will be punished."],
                ["say", "zhangjiao", "Master, what is your name?"],
                ["say", "immortal", "I am the Old Immortal of Southern Florescence."],
                ["n", "And he vanished in a breath of wind."],
            ]},
            "peace2": {"title": "The Way of Great Peace · II: The Blue Heaven Is Dead", "kind": "side", "steps": [
                ["n", "Zhang Jiao studied the books day and night until he could summon wind and rain. When plague swept the land, he went about giving out charmed water, and the sick recovered."],
                ["n", "They called him the Great and Virtuous Teacher. His disciples numbered in the hundreds of thousands, organised in thirty-six divisions."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "zhangjiao", "The Blue Heaven is dead! The Yellow Heaven shall rise! In the year jiazi, great fortune for all under Heaven!"],
                ["n", "Across eight provinces, families chalked the word jiazi on their doors."],
            ]},
            "peace3": {"title": "The Way of Great Peace · III: Betrayed", "kind": "side", "steps": [
                ["say", "zhangjiao", "The hardest thing in the world to win is the people's hearts — and now they are ours. To let this moment pass would be a crime."],
                ["n", "He bribed a eunuch in the palace to open the gates from within. But his disciple Tang Zhou carried the plan straight to the court. In Luoyang, his agent Ma Yuanyi was beheaded."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "zhangjiao", "Then we rise now. I am the General of Heaven. Zhang Bao, you are General of Earth. Zhang Liang, General of Man."],
                ["n", "Half a million rose in yellow scarves, and the imperial armies scattered before them like leaves."],
            ]},
            "caocao1": {"title": "The Hero of Chaos · I: The Feigned Stroke", "kind": "side", "steps": [
                ["n", "Far to the south, in Qiao, a boy named Cao Cao loved hunting, music and mischief — and his uncle kept telling his father so."],
                ["n", "So one day, seeing his uncle coming, Cao Cao dropped to the ground, twitching."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "uncle", "Brother! Your son has had a stroke!"],
                ["say", "caocao", "A stroke? I've never had one in my life. Uncle just dislikes me, so he tells tales about me."],
                ["n", "From then on, whatever the uncle reported, Cao Cao's father never believed a word."],
            ]},
            "caocao2": {"title": "The Hero of Chaos · II: A Villain in Chaos", "kind": "side", "steps": [
                ["n", "Xu Shao of Runan was famous for judging men. Cao Cao went to see him."],
                ["say", "caocao", "What kind of man am I?"],
                ["n", "Xu Shao would not answer. Cao Cao asked again."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "xushao", "In an age of order, an able minister. In an age of chaos — a cunning villain."],
                ["n", "Cao Cao laughed with delight. Later, as a captain in Luoyang, he hung coloured staves at the city gates and flogged anyone caught breaking curfew — even the uncle of the eunuch Jian Shuo. After that, nobody dared."],
            ]},
            "caocao3": {"title": "The Hero of Chaos · III: Red Banners at Changshe", "kind": "side", "steps": [
                ["n", "At Changshe, the Yellow Turbans pitched their camp in tall grass."],
                ["say", "huangfusong", "They camp in grass. Fire will take them. Every man, bring a bundle of straw."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["fx", "fire", "b3", 0, -14],
                ["n", "That night a great wind rose. The camp went up in flames; the rebels fled without saddles or armour."],
                ["n", "At dawn, as Zhang Bao and Zhang Liang ran, a column under red banners barred the road."],
                ["say", "caocao", "Cao Cao, Commandant of Cavalry. You go no further."],
                ["n", "Ten thousand heads were taken. The two brothers barely escaped with their lives."],
            ]},
            # ---- side stories: the shortcuts ----
            "horses": {"title": "Horses from the North", "kind": "side", "steps": [
                ["spawn", "zsp", "merchant", "as", 26, -6],
                ["army", "herd", "horse", 6, "as", 44, 0],
                ["n", "The brothers had men, but no horses. Then two travelling merchants, Zhang Shiping and Su Shuang, came down the trail driving a herd."],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "merchant", "Bandits have closed the road north. If you mean to crush them, take fifty horses — and five hundred taels of silver, and a thousand jin of steel for your weapons."],
                ["move", "herd", "as", 16, 0],
                ["gain", "horses"], ["gain", "silver"],
                ["prop", "forge", "forge", "as", -24, -16], ["prop", "anvil", "anvil", "as", -12, -12],
                ["spawn", "smith", "f_porter", "as", -14, -4],
                ["fx", "sparkle", "as", -12, -12], ["wait", 300], ["fx", "sparkle", "as", -12, -12],
                ["n", "Liu Bei had twin swords forged. Guan Yu's blade was the Green Dragon Crescent, eighty-two jin, called Cold Beauty. Zhang Fei's was an eighteen-foot serpent spear of steel."],
                ["give", "smith", "liubei", "twin_swords"],
                ["give", "smith", "guanyu", "green_dragon"],
                ["give", "smith", "zhangfei", "serpent_spear"],
                ["pose", "party", "raise"],
            ]},
            "bribe": {"title": "A Bribe Refused", "kind": "side", "steps": [
                ["n", "At Guangzong, Lu Zhi had Zhang Jiao penned in, though the rebel's sorcery kept him from the final blow. Then the court's envoy arrived."],
                ["say", "zuofeng", "Your victories are splendid, general. And where is the gift for the Emperor's envoy?"],
                ["problem"],  # the board comes up here; the rest plays once it is solved
                ["say", "luzhi", "My army lacks grain. Where would I find money to flatter an envoy?"],
                ["n", "Zuo Feng rode back to Luoyang and reported that Lu Zhi skulked behind his walls and would not fight."],
            ]},
        },
        "closing": [
            ["scroll", "The Yellow Turbans Fall", [
                "By the time Huangfu Song took over, Zhang Jiao was already dead. Huangfu Song beat Zhang Liang in seven battles and broke open the Great Teacher's coffin. The rebellion was over.",
                "At Wancheng, Liu Bei gave Zhu Jun some advice: “Surround them completely and every man fights to the death. Leave them one way out, and they will run.” It worked. There too, a young officer named Sun Jian was first over the wall: a name to remember.",
                "But the eunuchs gave rewards only to those who paid. For all his battles, Liu Bei was made a mere county sheriff, at Anxi.",
            ]],
            ["n", "At Anxi, Liu Bei governs for a month and wrongs no one. The three eat at one table and sleep in one bed. When Liu Bei sits among crowds, Guan Yu and Zhang Fei stand at his side all day without tiring."],
            ["wait", 1000],
            ["n", "Less than four months after he took office, an edict orders officers with military merit to be culled. Liu Bei fears he is among them. An inspector arrives."],
            ["spawn", "ins", "inspector", "boss", -30, 40],
            ["n", "Liu Bei goes out of the city to greet him. The inspector stays on his horse and answers with a small flick of his whip. Guan Yu and Zhang Fei are furious."],
            ["n", "At the hostel the inspector sits facing south; Liu Bei stands below the steps."],
            ["say", "inspector", "What is your origin, Sheriff Liu?"],
            ["say", "liubei", "I descend from Prince Jing of Zhongshan. I fought the Yellow Turbans from Zhuo County in over thirty battles."],
            ["say", "inspector", "You claim imperial blood and invent your merits! The court is purging frauds like you."],
            ["wait", 1000],
            ["n", "Liu Bei asks his clerks what to do. The inspector only wants a bribe, they say. But Liu Bei has taken nothing from the people, and has nothing to give. The inspector seizes the clerks, and each time Liu Bei comes to plead, he is turned away at the gate."],
            ["n", "Zhang Fei, a few cups of gloomy wine in, rides past the hostel and finds fifty or sixty old villagers weeping at the gate."],
            ["wait", 1200],
            ["n", "The inspector is forcing the clerks to accuse Liu Bei, they tell him, and the gatekeepers beat them away when they come to plead for him."],
            ["move", "zhangfei", "boss", -20, 40],
            ["say", "zhangfei", "Tormentor of the people! Do you know who I am?"],
            ["n", "He drags the inspector out by the hair, to the hitching post before the county office, and ties him there."],
            ["fx", "whip", "boss", -30, 34], ["fx", "whip", "boss", -30, 34], ["fx", "whip", "boss", -30, 34],
            ["n", "Zhang Fei breaks ten or more willow switches across his legs."],
            ["say", "inspector", "Lord Xuande! Save my life!"],
            ["n", "Liu Bei, a gentle man at heart, orders Zhang Fei to stop."],
            ["say", "guanyu", "Brother, you won great merit and were given only a sheriff's post, and now an inspector insults you. A phoenix does not roost among thorns. Let us kill him, give up the office, and make greater plans elsewhere."],
            ["wait", 1200],
            ["n", "He hangs the seal around the inspector's neck."],
            ["say", "liubei", "For what you have done to the people you deserve to die. I spare your life. I return my seal of office, and I am gone."],
            ["remove", "ins"],
            ["scroll", "Chapter 2", [
                "Emperor Ling died. In the capital, his brother-in-law, General He Jin, resolved to destroy the eunuchs at last — and sent for the warlords of the provinces to march on Luoyang and force the Empress's hand.",
                "“A mistake,” warned his secretary Chen Lin. “You hand the spear to others, point first.”",
                "A man beside them clapped and laughed. “This is as easy as turning over a hand. Why so much talk?” It was Cao Cao.",
                "What did Cao Cao propose? Hear the next chapter.",
            ]],
        ],
    },
]
