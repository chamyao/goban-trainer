"""World 2 (Book 2): Hulao Pass, chapters 3-9. The design is in docs/world2-script-draft.md.

Kept in its own file so tk_story.py stays readable. tk_story.py appends WORLD2 to
WORLDS; tk_story_zh.py merges ZH2 and CAST2; tk_places.py takes PLACES2.
The helpers N and S write a line and register its Chinese in one go.
"""

ZH2 = {}


def N(en, zh):
    """A line of narration, with its Chinese."""
    ZH2[en] = zh
    return ["n", en]


def S(who, en, zh):
    """A spoken line, with its Chinese."""
    ZH2[en] = zh
    return ["say", who, en]


def T(en, zh):
    """A title, objective, place or other label, with its Chinese."""
    ZH2[en] = zh
    return en


# Voices for the people World 2 adds (Kokoro Mandarin ids, as in tk_story_zh.CAST).
CAST2 = {
    "lvbu": "zm_097", "wangyun": "zm_009", "liru": "zm_010", "lisu": "zm_012", "huaxiong": "zm_015",
    "dingyuan": "zm_020", "yuanshao": "zm_031", "yuanshu": "zm_035", "chengong": "zm_050",
    "caohong": "zm_054", "sunjian": "zm_056", "zumao": "zm_062", "chengpu": "zm_066",
    "handang": "zm_095", "caiyong": "zm_091", "gongsunzan": "zm_037", "lijue": "zm_058",
    "guosi": "zm_061", "lvboshe": "zm_014", "diaochan": "zf_023", "hetaihou": "zf_022",
    "tangfei": "zf_017", "shaodi": "zf_002", "xiandi": "zf_002", "dongmu": "zf_022",
}


def _scenes_main():
    return {
        "pingyuan": {"title": T("The Road to the Lords", "诸侯之路"), "kind": "main", "steps": [
            ["army", "men", "militia", 4, "m1", -34, 0],
            ["spawn", "gz", "gongsunzan", "m1", 50, -8],
            ["army", "riders", "f_soldier", 6, "m1", 72, 6],
            N("After Anxi, Liu Bei's old schoolmate Gongsun Zan spoke up for him, and he was made magistrate of Pingyuan. Then the lords of the east rise against Dong Zhuo, and Gongsun Zan marches past his gate.",
              "安喜之后，玄德的同窗公孙瓒向朝廷举荐了他，他做了平原令。忽然关东诸侯起兵讨伐董卓，公孙瓒的大军正好经过平原。"),
            S("gongsunzan", "Are these the two who broke the Yellow Turbans with you?", "乃同破黄巾者乎？"),
            S("liubei", "It was all their doing.", "皆此二人之力。"),
            ["problem"],
            N("Gongsun Zan takes the three of them along, and they ride for the lords' camp.", "公孙瓒便带玄德、关、张同往诸侯营中。"),
            ["remove", "gz"], ["remove", "riders"], ["remove", "men"],
        ]},
        "alliance": {"title": T("The Lowest Seat", "末座"), "kind": "main", "steps": [
            ["prop", "tbl", "table", "m2", 14, 6], ["prop", "wine", "winejars", "m2", 32, 8],
            ["spawn", "ys", "yuanshao", "m2", 38, -6], ["spawn", "yu", "yuanshu", "m2", 46, 10],
            ["spawn", "cc", "caocao", "m2", 28, 16], ["spawn", "gz", "gongsunzan", "m2", -20, -12],
            N("The lords have gathered, and Yuan Shao, whose family has held the highest offices for four generations, is made head of the alliance.",
              "诸侯会盟，推袁绍为盟主。袁氏四世三公，门多故吏。"),
            S("gongsunzan", "This is Liu Bei, magistrate of Pingyuan, my brother from the same school.", "此吾自幼同舍兄弟，平原令刘备是也。"),
            S("yuanshao", "I do not honour your rank. I honour you for being of the imperial house.", "吾非敬汝名爵，吾敬汝是帝室之胄耳。"),
            N("Liu Bei is given the lowest seat. Guan Yu and Zhang Fei stand behind him, and smile coldly.", "玄德坐于末位。关、张二人立于其后，冷笑不语。"),
            ["emote", "zhangfei", "anger"],
            ["problem"],
            ["remove", "ys"], ["remove", "yu"], ["remove", "cc"], ["remove", "gz"],
        ]},
        "sishui": {"title": T("The Gate Nobody Can Take", "无人能破之关"), "kind": "main", "steps": [
            ["army", "lords", "militia", 6, "m3", -40, 0],
            ["spawn", "hx", "huaxiong", "m3", 92, 0], ["army", "dz", "f_soldier", 6, "m3", 104, 0],
            ["prop", "cap", "redbanner", "m3", 76, -14],
            N("At Sishui Gate Hua Xiong has broken Sun Jian's army. His men carry Sun Jian's red cap on a pole to the lords' camp, shouting abuse.",
              "汜水关守将华雄击败了孙坚。他的军士用长竿挑着孙坚的赤帻，来寨前大骂搦战。"),
            S("yuanshao", "Who dares go out and fight him?", "谁敢去战？"),
            ["spawn", "yu", "f_soldier", "m3", -26, -8], ["run", "yu", "m3", 78, -8], ["pose", "yu", "fall"],
            N("Yu She goes out, and is cut down in three rounds. Han Fu's best general, Pan Feng, goes out with an axe. Soon word comes back that he is dead too.",
              "俞涉出马，不三合被华雄斩了。韩馥的上将潘凤提斧而出，不多时飞马来报：潘凤又被华雄斩了。"),
            ["spawn", "pf", "f_soldier", "m3", -26, 6], ["run", "pf", "m3", 80, 6], ["pose", "pf", "fall"],
            ["emote", "yuanshao", "sweat"],
            S("yuanshao", "A pity my generals Yan Liang and Wen Chou are not here.", "可惜吾上将颜良、文丑未至！"),
            ["problem"],
            ["remove", "hx"], ["remove", "dz"], ["remove", "lords"], ["remove", "cap"],
        ]},
        "wine": {"title": T("The Warm Cup", "温酒斩华雄"), "kind": "main", "steps": [
            ["prop", "tbl", "table", "m3b", -4, 10], ["prop", "cup", "winejars", "m3b", -16, 14],
            ["spawn", "cc", "caocao", "m3b", -22, 2], ["spawn", "yu", "yuanshu", "m3b", -34, -10],
            ["spawn", "hx", "huaxiong", "m3b", 100, 0], ["army", "dz", "f_soldier", 6, "m3b", 112, 0],
            N("The lords sit in silence. Then Guan Yu steps out from behind Liu Bei.", "诸侯默然。关羽从玄德身后走出。"),
            S("guanyu", "Let me go and bring back Hua Xiong's head.", "小将愿往斩华雄头，献于帐下。"),
            N("The lords think little of a mounted archer. Cao Cao pours a cup of hot wine and holds it out to him.",
              "诸侯见他不过一个马弓手，皆不以为意。曹操却斟了一杯热酒，递与关公。"),
            ["fx", "sparkle", "m3b", -16, 8],
            S("guanyu", "Keep the wine. I will be back.", "酒且斟下，某去便来。"),
            ["problem"],
            ["run", "guanyu", "m3b", 110, 0], ["wait", 1200], ["fx", "flash", "m3b", 104, 0], ["camera", "shake"], ["pose", "hx", "fall"],
            ["wait", 900],
            ["run", "guanyu", "m3b", -4, 0],
            N("Guan Yu rides back in and throws Hua Xiong's head on the ground. The wine is still warm.", "关公提华雄之头，掷于地上。其酒尚温。"),
            S("zhangfei", "Our brother has killed Hua Xiong! Why not storm the pass now and take Dong Zhuo alive?", "俺哥哥斩了华雄，不就这里杀入关去，活拿董卓，更待何时！"),
            S("yuanshu", "We great lords hold back, and a magistrate's bowman dares to boast? Throw them out of the tent!", "俺大臣尚自谦让，量一县令手下小卒，安敢在此耀武扬威！都与赶出帐去！"),
            S("caocao", "A man who wins is rewarded. Who cares about rank?", "得功者赏，何计贵贱乎？"),
            N("That night Cao Cao quietly sends beef and wine to the three brothers.", "当夜，曹操暗使人赍牛酒，犒劳三人。"),
            ["remove", "cc"], ["remove", "yu"], ["remove", "dz"], ["remove", "hx"],
        ]},
        "hulao1": {"title": T("The Eight Lords at Hulao", "八路诸侯战吕布"), "kind": "main", "steps": [
            # the first try, and it fails: no board and no Star Lords
            ["army", "lords", "militia", 8, "m4a", -52, 0],
            ["spawn", "lb", "lvbu", "m4a", 96, 0], ["army", "dz", "f_soldier", 8, "m4a", 112, 0],
            N("Dong Zhuo has fortified Hulao Pass, and in front of it stands his adopted son Lü Bu, whom no one has yet withstood.",
              "董卓重兵屯虎牢关，关前立着他的义子吕布，无人能当。"),
            ["run", "lb", "m4a", -30, 0], ["pose", "lb", "strike"], ["pose", "lords", "fall", 3],
            N("Eight lords send their champions against him one after another. Fang Yue falls to a single thrust of the halberd. Mu Shun falls. Wu Anguo's wrist is cut through.",
              "八路诸侯各遣大将出战。方悦被吕布一戟刺于马下，穆顺亦被刺死，武安国被砍断手腕，弃锤而走。"),
            ["run", "lords", "m4a", -140, 0],
            N("The lords draw back thirty li. They agree among themselves: no one can match Lü Bu.", "诸侯退三十里下寨，都说：吕布英雄，无人可敌。"),
            ["remove", "lords"], ["remove", "lb"], ["remove", "dz"],
        ]},
        "shrine2": {"title": T("The Shrine at the Camp", "营中神龛"), "kind": "main", "steps": [
            # the shrine lights after the lords' defeat; the hint is the formation
            N("At the roadside, the old shrine that was dark begins to glow. Two white-haired men sit over its board, as if nothing had happened.",
              "路旁那座暗了的旧神龛忽然发出微光。两位白发老人坐在棋盘前，仿佛什么也没发生。"),
            ["spawn", "sg", "stargrey", "m4b", -34, 20], ["spawn", "sr", "starred", "m4b", -26, 24],
            S("starred", "One cannot match him. Not one.", "一个人敌不过他。一个也不行。"),
            S("stargrey", "Then who?", "那么，是谁？"),
            S("starred", "One, then two, then three.", "一个，两个，三个。"),
            ["problem", "stargrey"],  # the board comes up here; the Star Lords are gone by the time it closes
            ["remove", "sg"], ["remove", "sr"],
            N("The glow settles. The three brothers look at one another.", "微光渐息。三兄弟面面相觑。"),
        ]},
        "hulaoearly": {"title": T("Not Alone", "独木难支"), "kind": "main", "steps": [
            # no board, no cooldown: Liu Bei goes out alone, before the shrine has been read
            ["army", "han", "militia", 4, "boss", -26, 0],
            ["spawn", "lb", "lvbu", "boss", 84, 0], ["army", "dz", "f_soldier", 6, "boss", 100, 0],
            N("Liu Bei rides out against Lü Bu, and cannot stand against him.", "玄德出马迎战吕布，不能当。"),
            ["run", "liubei", "boss", -16, 0],
            N("Back at the camp, the old shrine is glowing.", "回到营中，那座旧神龛正发出微光。"),
            S("liubei", "Not alone. We must find out how to meet him.", "单凭一人，不行。须想个办法对付他。"),
            ["remove", "han"], ["remove", "lb"], ["remove", "dz"],
        ]},
        "hulaoearly2": {"title": T("One, Then Two, Then Three", "一个，两个，三个"), "kind": "main", "steps": [
            # the hint is taken but the brothers are not all in their places
            ["army", "han", "militia", 4, "boss", -26, 0],
            ["spawn", "lb", "lvbu", "boss", 84, 0], ["army", "dz", "f_soldier", 6, "boss", 100, 0],
            N("Zhang Fei charges Lü Bu alone, and is hard pressed. Guan Yu pulls him back.", "张飞独战吕布，渐渐不支。云长将他拉回。"),
            ["run", "liubei", "boss", -16, 0],
            S("guanyu", "One, then two, then three. We are not yet in our places. Send Yide to his post first, then me, then yourself.", "一个，两个，三个。我们还没各就各位。先让翼德就位，再是我，最后是兄长。"),
            ["remove", "han"], ["remove", "lb"], ["remove", "dz"],
        ]},
        "hulao": {"title": T("Three Against One", "三英战吕布"), "kind": "main", "steps": [
            ["army", "lords", "militia", 6, "boss", -60, 0],
            ["spawn", "lb", "lvbu", "boss", 84, 0], ["army", "dz", "f_soldier", 6, "boss", 100, 0],
            ["spawn", "gz", "gongsunzan", "boss", -34, -14],
            N("Lü Bu rides out again. Gongsun Zan goes against him, and after a few rounds turns and runs, with Red Hare on his heels.",
              "吕布复引兵搦战。公孙瓒挥槊亲战，不数合败走。吕布纵赤兔马赶来。"),
            S("zhangfei", "Three-surnamed slave, do not run! Zhang Fei of Yan is here!", "三姓家奴休走！燕人张飞在此！"),
            N("Zhang Fei fights him fifty rounds, and neither gives way. Guan Yu spurs in with his eighty-two jin blade. Then Liu Bei draws his twin swords and comes in from the flank.",
              "张飞与吕布连斗五十余合，不分胜负。云长舞八十二斤青龙偃月刀来夹攻。刘玄德掣双股剑，从斜刺里也来助战。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["pose", "party", "strike"], ["fx", "flash", "boss", 70, 0], ["camera", "shake"],
            N("The three ring him and turn like a lantern. Lü Bu cannot guard against all three. He feints at Liu Bei, who steps aside, and wheels his horse for the pass.",
              "三人围住吕布，转灯儿般厮杀。吕布架隔遮拦不定，看着玄德面上，虚刺一戟，玄德急闪。吕布荡开阵角，倒拖画戟，飞马便回。"),
            ["run", "lb", "boss", 140, 0], ["remove", "lb"], ["remove", "dz"],
            N("The three ride after him to the gate, where arrows and stones keep them back. The lords call them in to be honoured.",
              "三人拍马赶到关下，关上矢石如雨，不得进而回。八路诸侯，同请玄德、关、张贺功。"),
            ["remove", "gz"],
        ]},
        "ruins": {"title": T("The Burned Capital", "焦土洛阳"), "kind": "main", "steps": [
            ["light", "dusk", 800], ["prop", "fire", "fire", "m5", 12, -8], ["fx", "fire", "m5", 24, 6],
            N("Dong Zhuo has fled to Chang'an with the Emperor, burning Luoyang behind him and digging up the tombs of the emperors. The lords ride into the ruins.",
              "董卓劫天子迁长安，临行放火焚烧洛阳，又发掘先皇陵寝。诸侯入城，但见焦土一片。"),
            N("For two hundred li there is not a dog or a chicken.", "二三百里，并无鸡犬人烟。"),
            ["spawn", "cc", "caocao", "m5", 32, 0], ["spawn", "ys", "yuanshao", "m5", 46, -8], ["spawn", "gz", "gongsunzan", "m5", -22, -10],
            S("caocao", "This is the hour Heaven gives. One battle settles it. Why do you hesitate?", "此天亡之时也，一战而天下定矣。诸侯何疑而不进？"),
            N("The lords say it is not wise to move.", "众诸侯皆言不可轻动。"),
            S("caocao", "Boys. Not worth planning with.", "竖子不足与谋！"),
            ["run", "cc", "m5", 130, 0], ["remove", "cc"],
            S("gongsunzan", "Yuan Shao can do nothing. In time he will turn. Let us go home.", "袁绍无能为也，久必有变。吾等且归。"),
            ["problem"],
            N("Gongsun Zan makes Liu Bei chancellor of Pingyuan, and the three brothers go back to their small city.",
              "公孙瓒令玄德为平原相，三人各回本地。"),
            ["remove", "ys"], ["remove", "gz"], ["light", "day", 1500],
        ]},
    }


def _scenes_capital():
    return {
        "fireflies": {"title": T("The Fireflies", "萤火"), "kind": "side", "steps": [
            N("Before the lords rose, in the capital, on a night of fire…", "诸侯起兵之前，都城里，一个起火的夜晚……"),
            ["light", "night", 800],
            ["spawn", "sd", "shaodi", "a1", 0, 4], ["spawn", "xd", "xiandi", "a1", 12, 6],
            N("The palace is burning. The eunuch Zhang Rang has thrown himself into the river, and the two boys, the Emperor and his brother, lie hidden in the reeds, afraid to make a sound.",
              "宫中大乱。张让投河而死。少帝与陈留王伏于河边乱草之内，不敢高声。"),
            N("They tie their robes together, climb the bank in the dark, and cannot find the road.", "二人以衣相结，爬上岸边，黑暗之中，不见行路。"),
            ["fx", "sparkle", "a1", 26, -6], ["fx", "sparkle", "a1", 32, 4],
            S("xiandi", "Heaven is helping us, brother.", "此天助我兄弟也！"),
            ["problem"],
            ["move", "xd", "a1", 40, 0], ["move", "sd", "a1", 30, 2],
            N("They follow the fireflies, and little by little a road appears.", "遂随萤火而行，渐渐见路。"),
            ["remove", "sd"], ["remove", "xd"], ["light", "day", 1500],
        ]},
        "wenming": {"title": T("The Feast at Wenming Garden", "温明园之宴"), "kind": "side", "steps": [
            ["prop", "tbl", "table", "a2", 10, 8], ["prop", "wine", "winejars", "a2", 24, 8],
            ["spawn", "dz", "dongzhuo", "a2", 44, -4], ["spawn", "li", "liru", "a2", 54, 10],
            ["spawn", "dy", "dingyuan", "a2", -12, 10], ["spawn", "lb", "lvbu", "a2", -26, 14],
            ["army", "off", "f_official", 6, "a2", 0, -32],
            N("Dong Zhuo has taken the capital. He calls the officials to a feast in Wenming Garden, and announces that he will depose the Emperor.",
              "董卓入洛阳，召集百官于温明园大排筵会，宣布要废帝。"),
            N("Ding Yuan, governor of Jingzhou, pushes back the table. Behind him stands a tall man with a halberd, glaring: Lü Bu.",
              "荆州刺史丁原推案直出。他身后立着一人，手执方天画戟，怒目而视：吕布。"),
            S("dingyuan", "The Emperor is the late Emperor's own heir and has done no wrong. Why do you speak of deposing him? Do you mean to usurp?",
              "天子乃先帝嫡子，初无过失，何得妄议废立？汝欲为篡逆耶？"),
            ["problem"],
            N("Li Ru, seeing the man behind Ding Yuan, steps in: this is no place to speak of state affairs. The feast breaks up.",
              "李儒见丁原背后那人威风凛凛，急进曰：「今日饮宴之处，不可谈国政。」筵席遂散。"),
            ["remove", "dz"], ["remove", "li"], ["remove", "dy"], ["remove", "lb"], ["remove", "off"],
        ]},
        "redhare": {"title": T("Red Hare", "赤兔马"), "kind": "side", "steps": [
            ["spawn", "lb", "lvbu", "a3", 30, 0], ["spawn", "ls", "lisu", "a3", -16, 6],
            ["prop", "chest", "chest", "a3", -10, 12], ["army", "h", "horse", 1, "a3", -34, -4],
            N("Dong Zhuo would give anything to have Lü Bu. His countryman Li Su offers to win him with a horse, a thousand taels of gold, pearls and a jade belt.",
              "董卓欲得吕布。虎贲中郎将李肃与吕布同乡，愿以赤兔马、黄金一千两、明珠数十颗、玉带一条往说之。"),
            S("lisu", "A horse that goes a thousand li a day, up mountains and across rivers: Red Hare. I bring it to you, brother.",
              "有良马一匹，日行千里，渡水登山，如履平地，名曰赤兔：特献与贤弟，以助虎威。"),
            S("lisu", "A good bird chooses its tree, a good minister chooses his lord. See it too late, and you will regret it.",
              "良禽择木而栖，贤臣择主而佐。见机不早，悔之晚矣。"),
            S("lvbu", "I regret that I never met my master.", "恨不逢其主耳。"),
            ["problem"],
            N("Lü Bu agrees to come over the next day.", "布与肃约于明日来降。"),
            ["remove", "lb"], ["remove", "ls"], ["remove", "chest"], ["remove", "h"],
        ]},
        "lisuwaits": {"title": T("Without the Gifts", "无礼不成"), "kind": "side", "steps": [
            # no board: the player has not brought Dong Zhuo's gifts
            ["spawn", "lb", "lvbu", "a3", 30, 0], ["spawn", "ls", "lisu", "a3", -16, 6],
            S("lisu", "I have nothing to show him. Bring what Dong Zhuo sent, from his man at the garden.",
              "我没有礼物给他看。去园中向董相国的人取来。"),
            ["remove", "lb"], ["remove", "ls"],
        ]},
        "dingyuan": {"title": T("The Night Tent", "夜入丁原帐"), "kind": "side", "steps": [
            ["prop", "desk", "desk", "a4", 14, 4], ["fx", "fire", "a4", 18, 0],
            ["spawn", "dy", "dingyuan", "a4", 10, 2], ["spawn", "lb", "lvbu", "a4", -24, 6],
            N("That night Lü Bu goes into Ding Yuan's tent. The governor sits reading by a candle.", "是夜二更，吕布提刀径入丁原帐中。原正秉烛观书。"),
            S("dingyuan", "My son, what brings you here?", "吾儿来有何事故？"),
            S("lvbu", "I am a grown man. Why should I be your son?", "吾堂堂丈夫，安肯为汝子乎！"),
            ["move", "lb", "a4", 4, 2], ["pose", "lb", "strike"], ["fx", "flash", "a4", 10, 2], ["pose", "dy", "fall"], ["camera", "shake"],
            N("Lü Bu cuts off his head.", "布向前一刀，砍下丁原首级。"),
            S("lvbu", "Ding Yuan was not kind. I have killed him. Follow me, or leave.", "丁原不仁，吾已杀之。肯从吾者在此，不从者自去！"),
            ["remove", "dy"],
            N("Next day he brings the head to Dong Zhuo, and kneels to him as his father.", "次日，布持丁原首级往见董卓，拜卓为义父。"),
            ["spawn", "dz", "dongzhuo", "a4", 30, -4],
            S("dongzhuo", "Today I have you, as parched seedlings have rain.", "卓今得将军，如旱苗之得甘雨也。"),
            ["remove", "lb"], ["remove", "dz"],
        ]},
        "poison": {"title": T("The Cup of Long Life", "寿酒"), "kind": "side", "steps": [
            ["spawn", "sd", "shaodi", "a5", 0, 0], ["spawn", "ht", "hetaihou", "a5", -12, 6], ["spawn", "tf", "tangfei", "a5", 12, 6],
            ["spawn", "li", "liru", "a5", 46, 0], ["army", "gd", "f_soldier", 4, "a5", 58, 0], ["prop", "tray", "table", "a5", 30, 4],
            N("Dong Zhuo has set a new boy on the throne. The old Emperor, his mother and the Consort Tang are shut in the Yong'an Palace with little to eat.",
              "董卓废少帝，另立陈留王。少帝与何太后、唐妃困于永安宫中，衣食渐渐欠缺。"),
            N("One day the Emperor sees two swallows in the courtyard, and writes a poem. Dong Zhuo's spies carry it to him. Li Ru comes with a cup of wine, a short knife and a white silk.",
              "一日，少帝见双燕飞于庭中，吟诗一首，被董卓的探子呈与董卓。李儒带武士十人入宫，以鸩酒奉帝。"),
            S("hetaihou", "If this is wine for long life, you drink first.", "既云寿酒，汝可先饮。"),
            S("tangfei", "Let me drink for the Emperor. Spare his mother.", "妾身代帝饮酒，愿公存母子性命。"),
            S("liru", "Who are you, to die in a prince's place?", "汝何人，可代王死？"),
            S("shaodi", "The sky and sun and moon turn over.", "天地易兮日月翻"),
            ["mood", "dark"], ["wait", 1600],
            N("When the light comes back, the room is quiet.", "灯火再亮时，室内寂然。"),
            ["mood", "clear"],
            ["remove", "sd"], ["remove", "ht"], ["remove", "tf"], ["remove", "li"], ["remove", "gd"],
        ]},
    }


def _scenes_knife():
    return {
        "dagger": {"title": T("Will Weeping Kill Dong Zhuo?", "哭得死董卓否？"), "kind": "side", "steps": [
            N("Before the lords rose, a young captain tried to kill Dong Zhuo.", "诸侯起兵之前，有一位年轻校尉曾想刺杀董卓。"),
            ["prop", "tbl", "table", "b1", 10, 8], ["prop", "wine", "winejars", "b1", 22, 8],
            ["spawn", "wy", "wangyun", "b1", 32, 0], ["spawn", "cc", "caocao", "b1", -22, 10],
            ["army", "off", "f_official", 5, "b1", -8, -28],
            N("Wang Yun gives a birthday dinner for the officials, and weeps before them for the fallen empire. The officials weep too.",
              "王允设宴后堂，公卿皆至。酒行数巡，忽然掩面大哭：「董卓欺主弄权，社稷旦夕难保！」众官皆哭。"),
            S("caocao", "A whole court of ministers crying from night to morning, from morning to night: can that kill Dong Zhuo?",
              "满朝公卿，夜哭到明，明哭到夜，还能哭死董卓否？"),
            N("Wang Yun takes out the seven-star knife and gives it to Cao Cao.", "王允取出七星宝刀，授与曹操。"),
            ["remove", "wy"], ["remove", "off"], ["remove", "tbl"], ["remove", "wine"],
            ["spawn", "dz", "dongzhuo", "b1", 40, -4], ["prop", "mirror", "mirror", "b1", 52, -10],
            N("Next day Cao Cao goes to Dong Zhuo's hall with the knife under his robe. Dong Zhuo, tired, lies down on a couch with his face to the wall.",
              "次日，曹操佩著宝刀，来至相府。董卓胖大不耐久坐，倒身而卧，转面向内。"),
            ["problem"],
            ["move", "cc", "b1", 30, 6], ["pose", "cc", "strike"],
            N("Cao Cao draws the knife. Dong Zhuo's eye catches his reflection in the mirror.",
              "操急掣宝刀在手，恰待要刺，不想董卓仰面看衣镜中，照见曹操在背后拔刀。"),
            ["pose", "cc", "kneel"],
            S("caocao", "I have a precious knife, and I offer it to you, my lord.", "操有宝刀一口，献上恩相。"),
            N("Cao Cao takes a horse, and rides out of the east gate.", "操牵马出相府，加鞭望东南而去。"),
            ["run", "cc", "b1", 150, 20], ["remove", "cc"], ["remove", "dz"], ["remove", "mirror"],
        ]},
        "zhongmou": {"title": T("The Magistrate", "中牟县令"), "kind": "side", "steps": [
            ["prop", "desk", "desk", "b2", 14, -4], ["fx", "fire", "b2", 16, -2],
            ["spawn", "cc", "caocao", "b2", -6, 4], ["spawn", "cg", "chengong", "b2", 26, 0],
            N("Cao Cao is stopped at the Zhongmou pass and taken before the magistrate, Chen Gong. That night Chen Gong has him brought to the back room alone.",
              "曹操逃至中牟县，为守关军士所获，擒见县令陈宫。夜分，陈宫暗地取出曹操，直至后院中审究。"),
            S("chengong", "I hear the Chancellor treated you well. Why do this to yourself?", "我闻丞相待汝不薄，何故自取其祸？"),
            S("caocao", "What do swallows know of the swan's will?", "燕雀安知鸿鹄志哉！"),
            ["problem"],
            S("chengong", "You are truly loyal to the empire.", "公真天下忠义之士也！"),
            N("He cuts the rope with his own hand, takes his sword, and rides out with Cao Cao.", "陈宫亲释其缚，收拾盘费，与曹操背剑乘马，投故乡来。"),
            ["remove", "cc"], ["remove", "cg"],
        ]},
        "lvboshe": {"title": T("Rather I Betray the World", "宁教我负天下人"), "kind": "side", "steps": [
            ["prop", "tbl", "table", "b3", -6, 8], ["prop", "pig", "pig", "b3", 26, 10],
            ["spawn", "lbs", "lvboshe", "b3", 22, 0], ["spawn", "cc", "caocao", "b3", -14, 4], ["spawn", "cg", "chengong", "b3", -26, 8],
            N("At nightfall they come to the farm of Lü Boshe, the sworn brother of Cao Cao's father. He welcomes them, and goes out to buy them wine.",
              "天色向晚，二人至成皋吕伯奢庄。伯奢留宿，起身入内，良久乃出，言：「老夫当往西村沽一樽好酒来相待。」"),
            ["move", "lbs", "b3", 150, 20], ["remove", "lbs"],
            N("Left alone, they hear a knife being sharpened behind the house.", "操与宫坐久，忽闻庄后有磨刀之声。"),
            S("caocao", "Tie him up and kill him: how about that?", "缚而杀之，何如？"),
            ["problem"],
            N("Cao Cao draws his sword, and eight people die. In the kitchen they find a pig, tied for the table.",
              "遂与宫拔剑直入，不问男女，皆杀之，一连杀死八口。搜至厨下，却见缚一猪欲杀。"),
            S("chengong", "Mengde, you are too suspicious. You have killed good people.", "孟德心多，误杀好人矣！"),
            ["spawn", "lbs", "lvboshe", "b3", 150, 20], ["move", "lbs", "b3", 64, 12],
            N("On the road they meet Lü Boshe coming back, with two jars of wine on his donkey.", "行不到二里，只见伯奢驴鞍前悬酒二瓶，手携果菜而来。"),
            S("caocao", "If he goes home and sees what I did, he will not let it be.", "伯奢到家，见杀死多人，安肯干休？"),
            ["pose", "cc", "strike"], ["fx", "flash", "b3", 62, 12], ["pose", "lbs", "fall"],
            S("chengong", "To kill a man knowing he is innocent: that is the greatest wrong.", "知而故杀，大不义也！"),
            S("caocao", "I would rather betray the world than let the world betray me.", "宁教我负天下人，休教天下人负我。"),
            N("Chen Gong says nothing.", "陈宫默然。"),
            N("That night Chen Gong lies awake with his hand on his sword. Before dawn he is gone.",
              "当夜，陈宫欲拔剑杀曹操，转念而止。不等天明，自投东郡去了。"),
            ["remove", "cc"], ["remove", "cg"], ["remove", "lbs"],
        ]},
        "xingyang": {"title": T("The Horse at Xingyang", "荥阳之马"), "kind": "side", "steps": [
            ["light", "dusk", 600],
            ["army", "cs", "militia", 5, "b4", -30, 0], ["army", "xr", "f_soldier", 8, "b4", 90, 0],
            ["spawn", "cc", "caocao", "b4", -4, 0], ["spawn", "ch", "caohong", "b4", -26, 8],
            N("Cao Cao chases Dong Zhuo alone, for the lords will not. At Xingyang Xu Rong's ambush catches him: an arrow in the shoulder, his horse killed under him.",
              "曹操追董卓，战于荥阳。徐荣伏兵尽出，射中曹操肩膊，操马中枪而倒。"),
            ["pose", "cc", "fall"], ["run", "ch", "b4", 4, 4],
            N("Two soldiers seize him. Cao Hong cuts them down, and lifts him onto his own horse.", "两个军士擒住曹操。曹洪砍死两个步军，下马救起曹操。"),
            S("caohong", "My lord, get up! I will go on foot.", "公急上马！洪愿步行。"),
            ["problem"],
            S("caohong", "The world can do without Hong. It cannot do without you.", "天下可无洪，不可无公。"),
            S("caocao", "If I live again, it is by your strength.", "吾若再生，汝之力也。"),
            N("At dawn Xiahou Dun arrives and kills Xu Rong. Five hundred are left of Cao Cao's army.",
              "夏侯惇、夏侯渊引十数骑飞至，惇刺徐荣于马下。聚集残兵五百余人，同回河内。"),
            ["remove", "cs"], ["remove", "xr"], ["remove", "cc"], ["remove", "ch"], ["light", "day", 1500],
        ]},
    }


def _scenes_seal():
    return {
        "zumao": {"title": T("The Red Cap", "赤帻"), "kind": "side", "steps": [
            N("The night before Hua Xiong's men carried the red cap to the lords' camp…", "华雄的人把赤帻挑到诸侯营前的前一夜……"),
            ["light", "night", 800],
            ["spawn", "sj", "sunjian", "c1", -6, 0], ["spawn", "zm", "zumao", "c1", -22, 8],
            ["spawn", "hx", "huaxiong", "c1", 92, 0], ["army", "hxs", "f_soldier", 6, "c1", 106, 0], ["prop", "post", "post", "c1", 62, -10],
            N("Hua Xiong's cavalry hits Sun Jian's camp at midnight. Sun Jian's bow breaks in his hand.", "华雄乘夜袭击孙坚寨。孙坚再放第三箭时，因用力太猛，拽折了弓。"),
            S("zumao", "Lord, your red cap is what they chase. Give it to me.", "主公头上赤帻射目，为贼所识。可脱帻与我戴之。"),
            N("They change caps. Sun Jian slips away into the wood.", "坚脱帻换与祖茂，两人分路而走。"),
            ["run", "sj", "c1", -80, 10], ["remove", "sj"],
            ["move", "zm", "c1", 60, -10],
            N("Zumao hangs the cap on a burnt post and hides in the wood. Hua Xiong's men surround the post, and are afraid to come near it.",
              "祖茂把赤帻挂于烧了一半的庄柱上，自己潜伏林后。华雄军见赤帻，四面围定，不敢近前。"),
            ["problem"],
            N("When they see it is a trick, Zumao rushes out at Hua Xiong with his two swords, and is cut down.",
              "方知是计。祖茂于林后杀出，挥双刀欲劈华雄，被华雄一刀砍于马下。"),
            ["pose", "zm", "strike"], ["fx", "flash", "c1", 70, -8], ["pose", "zm", "fall"],
            ["remove", "hx"], ["remove", "hxs"], ["remove", "post"], ["remove", "zm"], ["light", "day", 1500],
        ]},
        "seal": {"title": T("The Well", "井中玉玺"), "kind": "side", "steps": [
            ["light", "night", 800], ["fx", "fire", "c2", -40, -10],
            ["spawn", "sj", "sunjian", "c2", -6, 0], ["spawn", "cp", "chengpu", "c2", -22, 10],
            ["prop", "well", "well", "c2", 30, 0], ["army", "sol", "militia", 3, "c2", 12, 16],
            N("Sun Jian puts out the fires in Luoyang and camps in the ruins of the palace. That night he looks up at the sky.",
              "孙坚救灭宫中余火，设帐于建章殿基上。是夜，坚按剑露坐，仰观天文。"),
            S("sunjian", "The Emperor's star is dim, a traitor rules, and the capital is empty.", "帝星不明，贼臣乱国，万民涂炭，京城一空！"),
            N("A soldier points: five-coloured light is rising from the well south of the hall.", "傍有军士指曰：「殿南有五色豪光起于井中。」"),
            ["fx", "sparkle", "c2", 30, -4],
            N("They bring up the body of a woman in palace dress, with a brocade bag at her neck. In the bag is a small gold-locked box, and in the box the Imperial Seal.",
              "坚喚军士下井打捞，捞起一妇人尸首，项下带一锦囊，内有朱红小匣，用金锁锁着。启视之，乃一玉玺。"),
            ["prop", "seal", "seal", "c2", 16, -2],
            S("chengpu", "This is the seal handed down by the emperors: \"Having received the mandate of Heaven, may you live long and prosper.\" Heaven gives it to you, my lord.",
              "此传国玺也。「受命于天，既寿永昌」。此天授主公，必有登九五之分。"),
            ["problem"],
            N("Sun Jian tells his men to keep it secret, and decides to keep the seal. But one of his soldiers is Yuan Shao's countryman, and runs to tell him.",
              "坚喝左右勿泄，意欲私藏。军中有袁绍乡人，连夜偷出营寨，来报袁绍。"),
            ["spawn", "ys", "yuanshao", "c2", 42, -8], ["army", "lords", "f_noble", 4, "c2", 54, 14],
            S("yuanshao", "The seal is the court's treasure. You found it. Leave it with the head of the alliance until the traitor is dead.",
              "玉玺乃朝廷之宝，公既获得，当对众留盟主处，候诛了董卓，复归朝廷。"),
            S("sunjian", "If I have this seal and hide it, may I not die a natural death, but die by knife and arrow.",
              "吾若果得此宝，私自藏匿，异日不得善终，死于刀箭之下！"),
            N("The lords say, \"Wentai swears so. It cannot be.\"", "众诸侯曰：「文台如此说誓，想必无之。」"),
            ["remove", "ys"], ["remove", "lords"], ["remove", "sol"], ["remove", "cp"], ["remove", "sj"], ["remove", "well"], ["remove", "seal"], ["light", "day", 1500],
        ]},
        "xianshan": {"title": T("Arrows and Stones", "岘山矢石"), "kind": "side", "steps": [
            ["army", "sa", "militia", 5, "c3", -42, 0], ["spawn", "sj", "sunjian", "c3", -10, 0], ["spawn", "hd", "handang", "c3", -26, 10],
            ["prop", "pole", "redbanner", "c3", -20, -14],
            N("Years later, to repay Liu Biao for blocking his road, Sun Jian besieges Xiangyang. One day a gale breaks the banner pole of his own camp.",
              "孙坚围攻襄阳。忽一日，狂风骤起，将中军帅字旗竿吹折。"),
            ["light", "storm", 700], ["fx", "dust", "c3", -20, -14], ["remove", "pole"],
            S("handang", "That is not a good omen. We should withdraw for now.", "此非吉兆，可暂班师。"),
            S("sunjian", "I have won every battle. Taking Xiangyang is a matter of a day. Shall I stop for a broken pole?", "吾屡战屡胜，取襄阳只在旦夕；岂可因风折旗竿，遽尔罢兵！"),
            ["problem"],
            N("That night Lü Gong breaks out of the city and rides for Mount Xian. Sun Jian, with thirty riders, goes after him alone.",
              "是夜，吕公引兵出城，望岘山而去。孙坚只引三十余骑赶来。"),
            ["run", "sj", "c3", 92, -6], ["fx", "flash", "c3", 80, -10], ["fx", "flash", "c3", 88, 0], ["fx", "flash", "c3", 84, 8], ["camera", "shake"],
            N("In the woods the stones and arrows fall together. Sun Jian dies on Mount Xian.", "吕公于山林丛杂去处，上下埋伏，矢石俱发。孙坚死于岘山之内。"),
            ["pose", "sj", "fall"],
            ["light", "day", 1500],
            N("His son Sun Ce, seventeen, carries the coffin home.", "孙策年十七，迎接灵柩，罢战回江东。"),
            ["remove", "sa"], ["remove", "hd"], ["remove", "sj"],
        ]},
    }


def _scenes_chain():
    return {
        "garden": {"title": T("The Peony Pavilion", "牡丹亭"), "kind": "side", "steps": [
            ["light", "night", 800], ["fx", "petals", "d1", 0, -20],
            ["spawn", "wy", "wangyun", "d1", 22, 0], ["spawn", "dc", "diaochan", "d1", -14, 6], ["prop", "sign", "table", "d1", 36, 10],
            N("The minister Wang Yun walks in his garden at night, weeping for the empire. A sigh comes from the peony pavilion: it is Diaochan, a singing girl he has brought up as his own.",
              "司徒王允夜深月明，策杖步入后园，仰天垂泪。忽闻牡丹亭畔有人长吁短叹，乃府中歌伎貂蝉也。"),
            N("On the pavilion table a weiqi board is set out, two stones on it, and no one at it.", "亭中石桌上摆着一盘棋，只有两枚棋子，不见人影。"),
            ["pose", "wy", "bow"],
            S("wangyun", "You must pity the people of the Han empire.", "汝可怜大汉天下生灵！"),
            S("diaochan", "Command me, and I will not shrink from death.", "但有使令，万死不辞。"),
            S("wangyun", "The people hang by their heels, and the court is a pile of eggs. Only you can help.", "百姓有倒悬之危，君臣有累卵之急，非汝不能救也。"),
            ["problem"],
            N("Diaochan agrees.", "貂蝉应允。"),
            ["remove", "wy"], ["remove", "dc"], ["remove", "sign"], ["light", "day", 1500],
        ]},
        "feasts": {"title": T("Two Feasts", "两席之宴"), "kind": "side", "steps": [
            ["prop", "tbl", "table", "d2", 10, 8],
            ["spawn", "wy", "wangyun", "d2", 30, 0], ["spawn", "lb", "lvbu", "d2", -18, 6], ["spawn", "dc", "diaochan", "d2", 16, 14],
            N("Wang Yun feasts Lü Bu, and has Diaochan pour his wine. Lü Bu cannot look away from her.", "王允宴请吕布，命貂蝉把盏。吕布频以目视貂蝉。"),
            S("wangyun", "I would send this girl to you as a concubine: will you take her?", "吾欲将此女送与将军为妾，还肯纳否？"),
            S("lvbu", "If I could have her, I would serve you like a dog or a horse.", "若得如此，布当效犬马之报。"),
            ["problem"],
            ["remove", "lb"], ["spawn", "dz", "dongzhuo", "d2", -18, 6],
            N("A few days later Wang Yun feasts Dong Zhuo, and has Diaochan dance behind a curtain. Dong Zhuo asks her age.",
              "过了数日，允请董卓赴宴，命貂蝉舞于帘外。卓问貂蝉青春几何。"),
            S("diaochan", "My humble self is sixteen.", "贱妾年方二八。"),
            S("dongzhuo", "A true immortal!", "真神仙中人也！"),
            S("wangyun", "I would present this girl to you, Chancellor: will you accept her?", "允欲将此女献上太师，未审肯容纳否？"),
            N("Dong Zhuo takes her away that night in a felt-covered cart.", "卓即命备毡车，先将貂蝉送到相府。"),
            ["remove", "wy"], ["remove", "dc"], ["remove", "dz"], ["remove", "tbl"],
        ]},
        "pavilion": {"title": T("The Fengyi Pavilion", "凤仪亭"), "kind": "side", "steps": [
            ["prop", "pond", "water", "d3", 24, 10],
            ["spawn", "lb", "lvbu", "d3", -10, 4], ["spawn", "dc", "diaochan", "d3", 8, 6],
            N("One day Lü Bu slips away from Dong Zhuo's side, and Diaochan tells him to wait for her at the Fengyi Pavilion.",
              "一日，布乘间提戟径来相府，寻见貂蝉。蝉曰：「汝可去后园中凤仪亭边等我。」"),
            S("diaochan", "I heard your name like thunder in my ears, and thought you the one man in the world, and now you are ruled by another.",
              "妾在深闺，闻将军之名，如雷灌耳，以为当世一人而已；谁想反受他人之制乎！"),
            N("Lü Bu is ashamed. He leans his halberd on the rail and holds her.", "吕布羞惭满面，重复倚戟，回身搂抱貂蝉，用好言安慰。"),
            ["problem"],
            ["spawn", "dz", "dongzhuo", "d3", 40, -6], ["spawn", "li", "liru", "d3", 74, 0],
            N("Dong Zhuo comes back early. He seizes the halberd and throws it at Lü Bu, who knocks it aside and runs. The fat man, chasing, runs into Li Ru and falls.",
              "卓抢了画戟，挺着赶来。吕布走得快，卓肥胖赶不上，掷戟刺布，布打戟落地。卓赶出园门，一人飞奔前来，与卓胸膛相撞，卓倒于地。"),
            ["run", "lb", "d3", -110, -10], ["pose", "dz", "fall"], ["remove", "lb"],
            ["remove", "dz"], ["remove", "li"], ["remove", "dc"], ["remove", "pond"],
        ]},
        "fall": {"title": T("The Carriage", "北掖门"), "kind": "side", "steps": [
            ["army", "g", "f_soldier", 8, "d4", 32, 0], ["prop", "gate", "gate", "d4", 74, -12], ["prop", "cart", "cart", "d4", -24, -6],
            ["spawn", "dz", "dongzhuo", "d4", -20, 0], ["spawn", "ls", "lisu", "d4", -8, 8],
            N("Wang Yun persuades Lü Bu to turn on Dong Zhuo. Li Su carries a forged edict to Dong Zhuo's fortress: the Emperor will yield him the throne.",
              "允说动吕布。李肃携诏至郿坞，对卓曰：「天子病体新痊，欲会文武于未央殿，议将禅位于太师。」"),
            ["spawn", "dm", "dongmu", "d4", -40, 6],
            S("dongzhuo", "I will take the throne, Mother, and you will be Empress Dowager.", "儿将往受汉禅，母亲早晚为太后也！"),
            S("dongmu", "My flesh trembles and my heart shakes. It is not a good sign.", "吾近日肉颤心惊，恐非吉兆。"),
            N("Diaochan, who has understood everything, pretends to be glad.", "貂蝉已明知就里，假作欢喜拜谢。"),
            ["remove", "dm"],
            N("On the road the cart loses a wheel, and the horse breaks its rein.", "行不到三十里，所乘之车，忽折一轮；又行不到十里，那马咆哮嘶喊，掣断辔头。"),
            S("dongzhuo", "The wheel breaks and the rein snaps: what does it mean?", "车折轮，马断辔，其兆若何？"),
            S("lisu", "That you take the throne: old for new, a jade carriage for a gold saddle.", "乃太师应受汉禅，弃旧换新，将乘玉辇金鞍之兆也。"),
            ["problem"],
            N("At the north gate the guards stop his men, and let only twenty carriage-bearers in. Spears strike him, but his armour turns them; one wounds his arm.",
              "到北掖门，军兵尽挡在门外，独有御车二十余人同入。王允大呼：「反贼至此，武士何在？」两旁百余人持戟挺槊刺之，卓裹甲不入，伤臂坠车。"),
            S("dongzhuo", "Where is my son Fengxian?", "吾儿奉先何在？"),
            ["spawn", "lb", "lvbu", "d4", 60, 0], ["move", "lb", "d4", -4, 0],
            S("lvbu", "I bring an edict to kill the traitor.", "有诏讨贼！"),
            ["pose", "lb", "strike"], ["fx", "flash", "d4", -10, 0], ["pose", "dz", "fall"], ["camera", "shake"],
            N("A halberd through the throat, and Li Su cuts off the head.", "一戟直刺咽喉，李肃早割头在手。"),
            N("The people of Chang'an dance in the streets. A soldier puts a wick in the dead man's navel, and it burns for days.",
              "长安士民，歌舞于道。看尸军士以火置其脐中为灯，膏油满地。"),
            ["remove", "g"], ["remove", "ls"], ["remove", "lb"], ["remove", "cart"], ["remove", "gate"],
        ]},
        "mourner": {"title": T("The One Who Wept", "伏尸而哭"), "kind": "side", "steps": [
            ["prop", "gate", "gate", "d5", 62, -12], ["army", "crowd", "f_villager", 6, "d5", 34, 10],
            ["spawn", "cy", "caiyong", "d5", 14, 0], ["spawn", "wy", "wangyun", "d5", -24, 0],
            N("Dong Zhuo's body lies in the market. Cai Yong, the scholar Dong Zhuo had honoured, throws himself on it and weeps.",
              "董卓暴尸于市。侍中蔡邕伏其尸而大哭。"),
            ["pose", "cy", "kneel"],
            S("wangyun", "The tyrant is dead, and all the people rejoice. You are a minister of Han, and you weep for him?",
              "董卓逆贼，今日伏诛，国之大幸。汝为汉臣，乃不为国庆，反为贼哭，何也？"),
            S("caiyong", "I am not talented, but I know what the empire means. I wept because he was kind to me. Let me be branded and lose my feet, if I may finish the history of Han.",
              "邕虽不才，亦知大义，岂肯背国而向卓？只因一时知遇之感，不觉为之一哭，自知罪大。愿公见原：倘得黥首刖足，使续成汉史，得以赎罪，邕之幸也。"),
            ["problem"],
            N("The officials plead for him. Wang Yun will not listen, and has him strangled in prison. Everyone who hears of it weeps.",
              "众官惜邕之才，皆力救之。允不听，命将蔡邕下狱中缢死。一时士大夫闻者，尽为流涕。"),
            ["remove", "cy"], ["remove", "wy"], ["remove", "crowd"], ["remove", "gate"],
        ]},
        "tower": {"title": T("Wang Yun on the Gate", "王允宣平门"), "kind": "side", "steps": [
            ["light", "dusk", 600], ["fx", "fire", "d6", -30, -10], ["fx", "fire", "d6", 50, 0],
            ["spawn", "lb", "lvbu", "d6", -10, 0], ["army", "rid", "horse", 4, "d6", -36, 10], ["spawn", "wy", "wangyun", "d6", 18, 0],
            ["prop", "gate", "gate", "d6", 50, -12], ["army", "west", "f_soldier", 8, "d6", 96, 0],
            ["spawn", "lj", "lijue", "d6", 82, 0], ["spawn", "gs", "guosi", "d6", 90, 10],
            N("Li Jue, Guo Si, Zhang Ji and Fan Chou raise a hundred thousand men in the west and take Chang'an. Lü Bu rides to the Qingsuo Gate and begs Wang Yun to ride out with him.",
              "李傕、郭汜、张济、樊稠起兵十余万，杀奔长安。吕布至青琐门外，呼王允曰：「势急矣！请司徒上马，同出关去，别图良策。」"),
            ["problem"],
            S("wangyun", "If the gods of the realm let me save the state, that is my wish. If not, I give my body. I will not run in danger.",
              "若蒙社稷之灵，得安国家，吾之愿也；若不获已，则允奉身以死。临难苟免，吾不为也。"),
            ["run", "lb", "d6", -140, 0], ["run", "rid", "d6", -150, 10], ["remove", "lb"], ["remove", "rid"],
            N("Lü Bu rides out with a hundred horsemen, leaving his family behind. The rebels take the palace. Wang Yun goes up on the gate tower beside the Emperor, and jumps down.",
              "吕布弃家小，引百余骑飞奔出关。贼兵围绕内庭至急。王允立于宣平门楼上，自楼上跳下。"),
            S("wangyun", "Wang Yun is here!", "王允在此！"),
            ["pose", "wy", "fall"],
            N("The rebels kill him, and every one of his house, old and young.", "众贼杀了王允，又差人将王允宗族老幼，尽行杀害。"),
            ["remove", "west"], ["remove", "lj"], ["remove", "gs"], ["remove", "gate"], ["light", "day", 1500],
        ]},
    }


def _dl(q, who, open_, win, slip, zq, zopen, zwin, zslip):
    """A decision board: caption, who weighs it, and the lines on opening, a solve and a slip."""
    ZH2[q], ZH2[open_], ZH2[win], ZH2[slip] = zq, zopen, zwin, zslip
    return {"q": q, "who": who, "open": open_, "win": win, "slip": slip}


def _node(key, x, y, role, place, step, scene, **extra):
    n = {"key": key, "x": x, "y": y, "role": role, "place": T(*place), "step": step, "scene": scene}
    n.update(extra)
    return n


_HULAO = ("Hulao Pass", "虎牢关")
ZH2["Lü Bu"] = "吕布"
ZH2["the Flying General"] = "飞将"
_OBJ_BOSS = T("Defeat Lü Bu at Hulao Pass.", "在虎牢关击败吕布。")


def _nodes():
    return [
        _node("m1", 30, 100, "main", ("Pingyuan", "平原"), 0.0, "pingyuan", trigger="arrive"),
        _node("m2", 160, 100, "main", ("The Lords' Camp", "诸侯大营"), 0.08, "alliance"),
        _node("m3", 205, 112, "main", ("Sishui Gate", "汜水关"), 0.22, "sishui"),
        _node("m3b", 217, 124, "main", ("Sishui Gate", "汜水关"), 0.28, "wine"),
        _node("m4a", 252, 140, "main", _HULAO, 0.5, "hulao1", board=False),
        _node("m4b", 266, 132, "main", _HULAO, 0.55, "shrine2", shrine=True, hint="One, then two, then three."),
        {"key": "boss", "x": 288, "y": 148, "role": "boss", "place": T(*_HULAO), "scene": "hulao",
         "boss": {"who": "lvbu", "title": T("Lü Bu, the Flying General", "吕布，飞将"),
                  "taunt": T("Four men or forty. None of you will leave this field.", "四个也好，四十个也好，没有一个能离开这里。")},
         # a gated battle: the brothers go in one by one, in the novel's order
         "gate": [
             {"needs": ["node:m4b"], "else": "hulaoearly", "objective": _OBJ_BOSS, "at": "Hulao Pass", "count": False},
             {"needs": ["mark:zhangfei_in", "mark:guanyu_in", "mark:liubei_in"], "else": "hulaoearly2",
              "objective": _OBJ_BOSS, "at": "Hulao Pass", "count": False}]},
        _node("m5", 340, 170, "main", ("Burned Luoyang", "焦土洛阳"), 0.95, "ruins"),
        # The Capital (ch3-4)
        _node("a1", 46, 64, "side", ("Beimang Hill", "北邙山"), 0.04, "fireflies"),
        _node("a2", 68, 44, "side", ("Wenming Garden", "温明园"), 0.08, "wenming"),
        _node("a3", 96, 34, "side", ("Lü Bu's Camp", "吕布营"), 0.12, "redhare",
              gate=[{"needs": ["item:gifts"], "else": "lisuwaits", "count": False}]),
        _node("a4", 124, 42, "side", ("Ding Yuan's Camp", "丁原营"), 0.16, "dingyuan", board=False),
        _node("a5", 146, 62, "side", ("Yong'an Palace", "永安宫"), 0.2, "poison", board=False),
        # Cao Cao's Knife (ch4-6)
        _node("b1", 46, 136, "side", ("Luoyang", "洛阳"), 0.1, "dagger"),
        _node("b2", 68, 162, "side", ("Zhongmou", "中牟"), 0.14, "zhongmou"),
        _node("b3", 98, 178, "side", ("Lü Boshe's Farm", "吕伯奢庄"), 0.18, "lvboshe"),
        _node("b4", 360, 214, "side", ("Xingyang", "荥阳"), 0.22, "xingyang"),
        # The Seal (ch5-7)
        _node("c1", 186, 76, "side", ("Sishui Gate", "汜水关"), 0.3, "zumao"),
        _node("c2", 388, 170, "side", ("Burned Luoyang", "焦土洛阳"), 0.6, "seal"),
        _node("c3", 410, 196, "side", ("Xianshan", "岘山"), 0.65, "xianshan"),
        # The Chain (ch8-9)
        _node("d1", 350, 140, "side", ("Wang Yun's Garden", "王允后园"), 0.7, "garden", dilemma=_dl("Will Diaochan give her life?", "diaochan", "Lord Wang has raised me as his own child. Now he asks for my life.", "I understand what I must do.", "Not yet. Let me think.", "貂蝉可愿以身许国？", "司徒待妾如亲生，今日却要妾的性命。", "妾明白了。", "且慢，容妾想想。")),
        _node("d2", 368, 118, "side", ("Wang Yun's Garden", "王允后园"), 0.74, "feasts"),
        _node("d3", 390, 100, "side", ("Fengyi Pavilion", "凤仪亭"), 0.78, "pavilion"),
        _node("d4", 412, 84, "side", ("Chang'an", "长安"), 0.82, "fall"),
        _node("d5", 434, 98, "side", ("Chang'an", "长安"), 0.86, "mourner"),
        _node("d6", 448, 122, "side", ("Chang'an", "长安"), 0.9, "tower", dilemma=_dl("Flee with Lü Bu, or hold the gate?", "wangyun", "Lü Bu waits with a horse. The Emperor is in the palace behind me.", "I know what I must do.", "Not yet. I cannot decide.", "随吕布出关，还是死守宫门？", "吕布备马在侧，天子却在宫中。", "吾意已决。", "且慢，吾尚难决。")),
    ]


_EDGES = [["m1", "m2"], ["m2", "m3"], ["m3", "m3b"], ["m3b", "m4a"], ["m4a", "m4b"], ["m4a", "boss"], ["m4b", "boss"], ["boss", "m5"],
          # before the alliance: the capital (ch3-4) and Cao Cao's flight (ch4), told as looks back
          ["m1", "a1"], ["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a4", "a5"], ["a5", "m2"],
          ["m1", "b1"], ["b1", "b2"], ["b2", "b3"], ["b3", "m2"],
          # the night raid at Sishui, before the gate
          ["m2", "c1"], ["c1", "m3"],
          # after the ruins: Xingyang, the seal and Sun Jian's death, and the chain (ch6-9)
          ["m5", "b4"], ["m5", "c2"], ["c2", "c3"], ["m5", "d1"], ["d1", "d2"], ["d2", "d3"], ["d3", "d4"], ["d4", "d5"], ["d5", "d6"]]


def _scene_table():
    scenes = {}
    for part in (_scenes_main(), _scenes_capital(), _scenes_knife(), _scenes_seal(), _scenes_chain()):
        scenes.update(part)
    return scenes


def _scroll(title, title_zh, paragraphs):
    """A storyteller scroll: paragraphs are (English, Chinese) pairs."""
    ZH2[title] = title_zh
    for en, zh in paragraphs:
        ZH2[en] = zh
    return ["scroll", title, [en for en, _ in paragraphs]]


def _opening():
    return [_scroll("Chapter 3", "第三回", [
        ("The Yellow Turbans were broken, and the court was not saved. The eunuchs fell to He Jin's soldiers in a night of fire, and the general who was meant to protect the throne, Dong Zhuo, rode into the capital at the head of twenty thousand men from the west.",
         "黄巾虽破，朝廷未安。十常侍亡于何进之兵，一夜火光。而那位本应护驾的将军董卓，却率西凉大军二十万，进入了洛阳。"),
        ("Ding Yuan's adopted son, Lü Bu, strongest of all the western riders, killed his father for a red horse and went over to him. Within the year Dong Zhuo had put one boy on the throne in place of another, and the first was dead.",
         "丁原的义子吕布，是西凉诸将中最勇猛的人，为了一匹赤兔马杀了义父，投了董卓。不出一年，董卓废了一位少年天子，立了另一位，而前一位已经死了。"),
        ("In the east, a young captain named Cao Cao drew a knife. Hear what happened.",
         "在东边，一个名叫曹操的年轻校尉，拔出了一把刀。且听下文。"),
    ])]


def _closing():
    return [_scroll("Chapter 9", "第九回", [
        ("Dong Zhuo was dead and his tyranny was over, but the men who had killed him had no strength to rule. Li Jue, Guo Si, Zhang Ji and Fan Chou, his four captains, came back on Chang'an with a hundred thousand men from the west.",
         "董卓已死，暴政已终，可除掉他的人并没有治国的力量。他的四员部将李傕、郭汜、张济、樊稠，率西凉兵十余万，反扑长安。"),
        ("Lü Bu fled to Yuan Shu. Wang Yun, who had made it all, refused to flee, and jumped from the gate tower.",
         "吕布投奔袁术。一手策划这一切的王允，不肯逃走，从门楼上跳了下去。"),
        ("The three brothers went home to Pingyuan. What would become of the Emperor? Hear the next chapter.",
         "三兄弟回到平原。天子将何去何从？且听下回分解。"),
    ])]


_ITEMS = {
    "gifts": {"name": T("Dong Zhuo's gifts for Lü Bu", "董卓赠吕布之礼"), "zh": "董卓赠吕布之礼", "kind": "supply"},
}


def _world():
    return {
        "n": 2,
        "name": "Hulao Pass",
        "zh": "虎牢关",
        "chapters": [3, 4, 5, 6, 7, 8, 9],
        "couplets": [
            ["议温明董卓叱丁原　馈金珠李肃说吕布",
             "At Wenming Garden Dong Zhuo reviles Ding Yuan; with gold and pearls Li Su wins over Lü Bu"],
            ["废汉帝陈留为皇　谋董贼孟德献刀",
             "The Emperor is deposed and the Prince of Chenliu made king; Cao Cao offers a knife to kill the traitor"],
            ["发矫诏诸镇应曹公　破关兵三英战吕布",
             "A forged edict, and the lords answer Cao Cao; at the pass, three heroes fight Lü Bu"],
            ["焚金阙董卓行凶　匿玉玺孙坚背约",
             "Dong Zhuo burns the palace in his fury; Sun Jian hides the Imperial Seal and breaks his word"],
            ["袁绍磐河战公孙　孙坚跨江击刘表",
             "Yuan Shao fights Gongsun Zan at Panhe; Sun Jian crosses the river to strike Liu Biao"],
            ["王司徒巧使连环计　董太师大闹凤仪亭",
             "Wang Yun sets the chain of stratagems; Dong Zhuo storms into the Fengyi Pavilion"],
            ["除暴凶吕布助司徒　犯长安李傕听贾诩",
             "Lü Bu helps the minister kill the tyrant; Li Jue takes the advice of Jia Xu and attacks Chang'an"],
        ],
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["liubei", "guanyu", "zhangfei"],
        "items": _ITEMS,
        "nodes": _nodes(),
        "edges": _EDGES,
        "opening": _opening(),
        "scenes": _scene_table(),
        "closing": _closing(),
    }


WORLD2 = _world()


# ---- the places (read by tk_places.py as PLACES[2]) ----
def _P(archetype, landmarks, npcs, objectives, **extra):
    d = {"archetype": archetype, "landmarks": landmarks, "npcs": npcs, "objectives": objectives}
    d.update(extra)
    return d


def _talk(kind, line_en, line_zh, **extra):
    ZH2["\u201c" + line_en + "\u201d"] = "\u201c" + line_zh + "\u201d"
    d = {"kind": kind, "say": "\u201c" + line_en + "\u201d"}
    d.update(extra)
    return d


def _q(en, zh):
    """A quoted line for an NPC's give/given/lines (with the curly quotes the game uses)."""
    ZH2["\u201c" + en + "\u201d"] = "\u201c" + zh + "\u201d"
    return "\u201c" + en + "\u201d"


def _w(who, en, zh):
    """A [who, text] line for a landmark."""
    ZH2[en] = zh
    return [who, en]


PLACES2 = {
    "Pingyuan": _P("town", [{"kind": "building.gate", "id": "gate", "node": "2-m1", "trigger": "arrive", "label": T("Pingyuan's gate", "平原城门")}],
                   [_talk("folk.villager", "The magistrate is a kind man. They say he sells sandals no more.", "县令是个好人。听说他不卖草鞋了。")],
                   {"2-m1": T("Meet Gongsun Zan on the road to the lords.", "在路上迎接公孙瓒，同往诸侯营。")}),
    "The Lords' Camp": _P("camp", [{"kind": "building.tent", "id": "council", "node": "2-m2", "label": T("Yuan Shao's tent", "袁绍大帐")}],
                          [_talk("folk.soldier", "Eighteen lords and not one who will move first.", "十八路诸侯，没有一个肯先动。")],
                          {"2-m2": T("Go to Yuan Shao's tent, where the lords are gathering.", "到袁绍大帐，诸侯正在聚集。")}, banners="red"),
    "Sishui Gate": _P("mountain", [{"kind": "building.gate", "id": "gate", "node": "2-m3", "label": T("Sishui Gate", "汜水关")},
                                   {"kind": "building.tent", "id": "table", "node": "2-m3b", "label": T("The council table", "军议之席")},
                                   {"kind": "rock.big", "id": "night", "node": "2-c1", "label": T("Sun Jian's night camp", "孙坚夜营")}],
                      [_talk("folk.soldier", "Hua Xiong cut down two champions before breakfast.", "华雄还没吃早饭，就斩了两员上将。")],
                      {"2-m3": T("Go to Sishui Gate; there is news from the front.", "到汜水关去，前线有消息。"),
                       "2-m3b": T("Return to the council table.", "回到军议之席。"),
                       "2-c1": T("Side story: Sun Jian's camp, at night.", "支线：孙坚的夜营。")}, banners="red"),
    "Hulao Pass": _P("mountain", [
        {"kind": "building.gate", "id": "gate", "node": "2-m4a", "label": T("Hulao Pass", "虎牢关")},
        {"kind": "landmark.shrine", "id": "shrine", "node": "2-m4b", "near": "gate", "label": T("The shrine at the camp", "营中神龛"),
         "intro": [T("The old shrine at the camp, dark until now, begins to glow.", "营中那座暗了的旧神龛，忽然发出微光。")],
         "outro": [T("The glow settles. Only the board remains, and a thread of incense.", "微光渐息，只剩棋盘，和一缕香烟。")]},
        {"kind": "building.gate", "id": "fortress", "node": "2-boss", "label": T("Lü Bu's gate", "吕布的关门")},
        # the brothers go in one by one: Zhang Fei, then Guan Yu, then Liu Bei
        {"kind": "rock.crag", "id": "zhangfei_post", "label": T("Zhang Fei's post", "张飞的阵位"),
         "needs": ["node:m4b"], "delivers": "zhangfei_in", "when": "node:m4b",
         "empty": [T("No one is here yet. Read the shrine by the camp first.", "这里还没有人。先去营中神龛。")],
         "call": [_w("zhangfei", "Elder Brother, over here! Let me at him first!", "大哥，这边！让我先上！")],
         "deliver": [_w("zhangfei", "Leave Lü Bu to me!", "把吕布交给我！")]},
        {"kind": "rock.crag", "id": "guanyu_post", "label": T("Guan Yu's post", "关羽的阵位"),
         "needs": ["mark:zhangfei_in"], "delivers": "guanyu_in", "when": "node:m4b",
         "empty": [T("No one is here yet. Read the shrine by the camp first.", "这里还没有人。先去营中神龛。")],
         "waiting": [_w("guanyu", "Yide first. He has been begging for it.", "翼德先去。他早就等不及了。")],
         "call": [_w("guanyu", "Brother, Yide has him. Now it is my turn.", "兄长，翼德已缠住他。轮到我了。")],
         "deliver": [_w("guanyu", "Then I go in, brother.", "那我便上了，兄长。")]},
        {"kind": "rock.crag", "id": "liubei_flank", "label": T("The flank", "侧翼"),
         "needs": ["mark:guanyu_in"], "delivers": "liubei_in", "when": "node:m4b",
         "empty": [T("No one is here yet. Read the shrine by the camp first.", "这里还没有人。先去营中神龛。")],
         "waiting": [_w("liubei", "Not yet. Let them hold him first.", "还不是时候。先让他们缠住他。")],
         "deliver": [_w("liubei", "Now. Together.", "现在。一起上。")]},
    ], [_talk("folk.soldier", "Lü Bu on Red Hare: they say he can go through a whole army.", "吕布骑着赤兔马，听说能单骑冲过一支大军。")],
        {"2-m4a": T("Go to Hulao Pass, where the lords are gathering.", "到虎牢关，诸侯正在聚集。"),
         "2-m4b": T("Go to the old shrine by the camp.", "到营中的旧神龛去。"), "2-boss": _OBJ_BOSS}, banners="red"),
    "Burned Luoyang": _P("ruins", [{"kind": "building.hall", "id": "court", "node": "2-m5", "label": T("The burned palace", "焚毁的宫殿")},
                                  {"kind": "rock.big", "id": "well", "node": "2-c2", "label": T("The well in the ruins", "废墟中的井")}],
                         [_talk("folk.elder", "The palace burned for three days. I watched it from the hills.", "宫殿烧了三天三夜。我在山上看着的。")],
                         {"2-m5": T("Ride into the ruins of Luoyang.", "进入洛阳废墟。"), "2-c2": T("Side story: the well in the ruined palace.", "支线：废宫中的井。")}),
    "Beimang Hill": _P("hills", [{"kind": "rock.big", "id": "reeds", "node": "2-a1", "label": T("The river reeds", "河边芦苇")}],
                       [_talk("folk.hunter", "Fires over the capital all night. Nobody is going down there.", "都城的火烧了一整夜。没人敢下去。")],
                       {"2-a1": T("Side story: the two boys in the reeds.", "支线：芦苇中的两个少年。")}),
    "Wenming Garden": _P("garden", [{"kind": "building.hall", "id": "hall", "node": "2-a2", "label": T("The feast hall", "宴会堂")}],
                         [_talk("folk.official", "Dong Zhuo's gifts for Lü Bu are not ready yet.", "董相国赠吕布的礼物还没备好。",
                                near="hall", gives="gifts", gives_when="node:a2",
                                give=[_q("Dong Zhuo's gifts for Lü Bu: Red Hare, a thousand taels of gold, pearls, a jade belt. Take them to his camp.", "董相国赠吕布之礼：赤兔马、黄金一千两、明珠、玉带。送去他营中。")],
                                given=[_q("You have the gifts. Go, before Dong Zhuo changes his mind.", "礼物你已拿了。快去，免得董相国变卦。")])],
                         {"2-a2": T("Side story: the feast at Wenming Garden.", "支线：温明园之宴。")}),
    "Lü Bu's Camp": _P("camp", [{"kind": "building.tent", "id": "tent", "node": "2-a3", "label": T("Lü Bu's tent", "吕布大帐")}],
                       [_talk("folk.soldier", "The general likes fine horses. Everyone knows that.", "将军最爱良马。人人都知道。")],
                       {"2-a3": T("Side story: take Dong Zhuo's gifts to Lü Bu's camp.", "支线：把董卓的礼物送到吕布营中。")}),
    "Ding Yuan's Camp": _P("camp", [{"kind": "building.tent", "id": "tent", "node": "2-a4", "label": T("Ding Yuan's tent", "丁原大帐")}],
                           [_talk("folk.soldier", "The governor reads late. He says it keeps the mind clear.", "刺史大人总读书到很晚，说这样头脑清醒。")],
                           {"2-a4": T("Side story: Ding Yuan's tent, at night.", "支线：丁原帐中，夜里。")}),
    "Yong'an Palace": _P("town", [{"kind": "building.hall", "id": "upper", "node": "2-a5", "label": T("The upper room", "楼上的屋子")}],
                         [_talk("folk.woman", "They send in rice, and not much of it.", "送进来的米，并不多。")],
                         {"2-a5": T("Side story: the upper room in the Yong'an Palace.", "支线：永安宫楼上。")}),
    "Luoyang": _P("city", [{"kind": "building.hall", "id": "hall", "node": "2-b1", "label": T("Wang Yun's hall", "王允的堂")}],
                  [_talk("folk.official", "The Minister's birthday dinner. Half the court will be there.", "司徒的寿宴。半个朝廷的人都会去。")],
                  {"2-b1": T("Side story: Wang Yun's birthday dinner.", "支线：王允的寿宴。")}),
    "Zhongmou": _P("town", [{"kind": "building.hall", "id": "office", "node": "2-b2", "label": T("The magistrate's office", "县令衙门")}],
                   [_talk("folk.villager", "They stopped a man at the pass today. Said he was a merchant.", "今天关上拦了个人，自称是商人。")],
                   {"2-b2": T("Side story: the magistrate's back room.", "支线：县令的后院。")}),
    "Lü Boshe's Farm": _P("village", [{"kind": "building.hut", "id": "farm", "node": "2-b3", "label": T("Lü Boshe's house", "吕伯奢的屋子")}],
                          [_talk("folk.woman", "We keep a pig for guests. We always have.", "家里养着一头猪待客。一向如此。")],
                          {"2-b3": T("Side story: the farm of Lü Boshe.", "支线：吕伯奢庄。")}),
    "Xingyang": _P("mountain", [{"kind": "rock.big", "id": "pass", "node": "2-b4", "label": T("The pass at Xingyang", "荥阳关口")}],
                   [_talk("folk.soldier", "Xu Rong has men in every gully. Nobody comes through here.", "徐荣的人马埋伏在每条沟里。没人过得去。")],
                   {"2-b4": T("Side story: the pass at Xingyang.", "支线：荥阳关口。")}),
    "Xianshan": _P("mountain", [{"kind": "rock.big", "id": "ridge", "node": "2-c3", "label": T("Mount Xian", "岘山")}],
                   [_talk("folk.hunter", "Stones roll down this ridge in the dark. Don't come here at night.", "夜里这山岭上石头乱滚。别在夜里来。")],
                   {"2-c3": T("Side story: Mount Xian.", "支线：岘山。")}),
    "Wang Yun's Garden": _P("garden", [{"kind": "building.hall", "id": "pavilion", "node": "2-d1", "label": T("The peony pavilion", "牡丹亭")},
                                       {"kind": "building.hall", "id": "hall", "node": "2-d2", "label": T("The banquet hall", "宴客堂")}],
                            [_talk("folk.maiden", "The singing girl never goes out. She only walks here at night.", "那位歌伎从不出门，只在夜里到这里走走。")],
                            {"2-d1": T("Side story: the peony pavilion, at night.", "支线：夜里的牡丹亭。"), "2-d2": T("Side story: the banquet hall.", "支线：宴客堂。")}),
    "Fengyi Pavilion": _P("garden", [{"kind": "building.hall", "id": "pavilion", "node": "2-d3", "label": T("The Fengyi Pavilion", "凤仪亭")}],
                          [_talk("folk.maiden", "The lotus pond is lovely this year. Pity about the master's temper.", "今年荷塘开得好。只可惜主人脾气不好。")],
                          {"2-d3": T("Side story: the Fengyi Pavilion.", "支线：凤仪亭。")}),
    "Chang'an": _P("city", [{"kind": "building.gate", "id": "gate", "node": "2-d4", "label": T("The Beiye Gate", "北掖门")},
                            {"kind": "building.shop", "id": "market", "node": "2-d5", "label": T("The market square", "市集广场")},
                            {"kind": "building.gate", "id": "tower", "node": "2-d6", "label": T("The gate tower", "宣平门楼")}],
                   [_talk("folk.villager", "They say the Chancellor is dead. They say it, but quietly.", "听说丞相死了。大家只敢小声说。")],
                   {"2-d4": T("Side story: the Beiye Gate.", "支线：北掖门。"), "2-d5": T("Side story: the market.", "支线：市集。"),
                    "2-d6": T("Side story: the gate tower.", "支线：宣平门楼。")}),
}


# ---- stills: (scene, a word from the line it comes before, still id, move) ----
# The must-show line for each id is in docs/stills-must-show-w2.md. A still comes up under the lines
# that follow and goes at the next staging step; unpainted stills are skipped.
STILLS_W2 = [
    ("alliance", "Liu Bei is given the lowest seat", "alliance_b", "slow pull back"),
    ("wine", "Keep the wine", "wine_a", "slow zoom in"),
    ("wine", "Guan Yu rides back in", "wine_b", "slow zoom in"),
    ("hulao", "Three-surnamed slave", "hulao_a", "slow pan across"),
    ("hulao", "The three ring him", "hulao_b", "slow zoom in"),
    ("ruins", "Dong Zhuo has fled to Chang'an", "ruins_a", "slow pull back"),
    ("fireflies", "Heaven is helping us", "fireflies_a", "slow zoom in"),
    ("dingyuan", "I am a grown man", "dingyuan_a", "slow zoom in"),
    ("lvboshe", "On the road they meet", "lvboshe_a", "slow pan across"),
    ("lvboshe", "I would rather betray the world", "lvboshe_b", "slow zoom in"),
    ("xingyang", "My lord, get up", "xingyang_a", "slow zoom in"),
    ("zumao", "Zumao hangs the cap", "zumao_a", "slow pan across"),
    ("seal", "They bring up the body", "seal_a", "slow zoom in"),
    ("seal", "If I have this seal", "seal_b", "slow zoom in"),
    ("xianshan", "In the woods the stones", "xianshan_a", "slow zoom in"),
    ("garden", "Command me", "garden_a", "slow zoom in"),
    ("pavilion", "I heard your name", "pavilion_a", "slow zoom in"),
    ("fall", "I bring an edict", "fall_a", "slow zoom in"),
    ("tower", "Wang Yun is here", "tower_a", "slow pull back"),
]


def _place_stills():
    for scene, anchor, sid, move in STILLS_W2:
        steps = WORLD2["scenes"][scene]["steps"]
        for i, st in enumerate(steps):
            if st[0] in ("n", "say") and anchor in st[-1]:
                steps.insert(i, ["still", sid, move])
                break
        else:
            raise ValueError(f"still {sid}: no line with {anchor!r} in scene {scene}")


_place_stills()
