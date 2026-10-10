"""Red Chamber, Book 1: 侯门深似海 Deep as the Sea (红楼梦, chapters 1-6), as a story world for the existing engine.

The design is redchamber/book1/design.md; the readable script is generated from this file
(python3 redchamber/tools/script_md.py). Check it with:  python3 redchamber/book1/check.py

Same format as the Three Kingdoms story files (nodes, edges, scenes of steps, dilemmas, items), so the engine can
play it once Integration registers it as a world. Nothing here is wired in yet.

Written from the Chinese original (120-chapter text, zh.wikisource 紅樓夢). Chinese lines are the novel's own
vernacular in simplified characters; the English is plain and our own. Every moment of the novel's that is a
social test is posed as a go board: a wrong move is a smile behind a sleeve.
"""

ZH = {}


def N(en, zh):
    """A line of narration, with its Chinese."""
    ZH[en] = zh
    return ["n", en]


def S(who, en, zh):
    """A spoken line, with its Chinese."""
    ZH[en] = zh
    return ["say", who, en]


def T(en, zh):
    """A title, objective, caption or other label, with its Chinese."""
    ZH[en] = zh
    return en


def D(who, q, q_zh, open_, open_zh, win, win_zh, slip, slip_zh):
    """A decision board: the caption over the problem, and the decider's own lines on it."""
    return {"q": T(q, q_zh), "who": who, "open": T(open_, open_zh), "win": T(win, win_zh), "slip": T(slip, slip_zh)}


# Voices (Kokoro Mandarin ids already used in the repo).
CAST = {
    # Part 1
    "daiyu": "zf_027", "jiamu": "zf_022", "xingfuren": "zf_017", "wangfuren": "zf_023", "liwan": "zf_017",
    "xifeng": "zf_044", "yingchun": "zf_002", "tanchun": "zf_002", "xichun": "zf_002", "baoyu": "zm_009",
    "xiren": "zf_023", "yingge": "zf_017", "jmmaid": "zf_017", "laomama": "zf_022", "xingservant": "zm_029",
    # Part 2
    "grannyliu": "zf_022", "baner": "zf_002", "gouer": "zm_014", "liushi": "zf_017", "zhouruijia": "zf_023",
    "pinger": "zf_027", "jiarong": "zm_016", "gateman": "zm_053", "oldservant": "zm_100", "backchild": "zf_002",
}

# Display names (English, Chinese), for the script and the lead portrait.
NAMES = {
    "daiyu": ("Lin Daiyu", "林黛玉"), "jiamu": ("Grandmother Jia", "贾母"), "xingfuren": ("Lady Xing", "邢夫人"),
    "wangfuren": ("Lady Wang", "王夫人"), "liwan": ("Li Wan", "李纨"), "xifeng": ("Wang Xifeng", "王熙凤"),
    "yingchun": ("Yingchun", "迎春"), "tanchun": ("Tanchun", "探春"), "xichun": ("Xichun", "惜春"),
    "baoyu": ("Jia Baoyu", "贾宝玉"), "xiren": ("Xiren", "袭人"), "yingge": ("Yingge", "鹦哥"),
    "jmmaid": ("a maid", "丫鬟"), "laomama": ("an old nurse", "老嬷嬷"), "xingservant": ("a servant", "家人"),
    "grannyliu": ("Granny Liu", "刘姥姥"), "baner": ("Ban'er", "板儿"), "gouer": ("Gou'er", "狗儿"),
    "liushi": ("Liu-shi", "刘氏"), "zhouruijia": ("Zhou Rui's wife", "周瑞家的"), "pinger": ("Ping'er", "平儿"),
    "jiarong": ("Jia Rong", "贾蓉"), "gateman": ("a gate servant", "门上的人"), "oldservant": ("an old servant", "老年人"),
    "backchild": ("a child", "小孩子"),
}


# ---------------------------------------------------------------- Part 1: 步步留心 Step by Step (chapter 3)

def _scenes_daiyu():
    return {
        # D1 · The side gate. The tone: the house shows its rules before anyone speaks. Ends at Grandmother Jia's door.
        "d1": {"title": T("The Side Gate", "角门"), "kind": "main", "steps": [
            ["light", "day"],
            N("Her father said: you are often ill, you are very young, you have no mother to raise you and no sisters to stand by you. Go to your grandmother.",
              "林如海说：「汝父年将半百，再无续室之意，且汝多病，年又极小，上无亲母教养，下无姊妹兄弟扶持，今依傍外祖母及舅氏姊妹去，正好减我顾盼之忧，何反云不往？」黛玉听了，方洒泪拜别。"),
            N("Her mother always said that her grandmother's house was not like other houses. Even the serving women sent to fetch her eat and dress like no one she has seen.",
              "这林黛玉常听得母亲说过，他外祖母家与别家不同。他近日所见的这几个三等仆妇，吃穿用度，已是不凡了，何况今至其家。"),
            N("So she watches every step and minds every moment. She will not say one word more than she must, or take one step more, for fear of being laughed at.",
              "因此步步留心，时时在意，不肯轻易多说一句话，多行一步路，惟恐被人耻笑了他去。"),
            ["still", "hl_sedan", "slow pan across"],
            N("On the north side of the street, two great stone lions, and three great doors. The main door is shut. A dozen richly dressed men sit before it. The plaque reads: Ning Guo Mansion, Built by Imperial Command.",
              "街北蹲着两个大石狮子，三间兽头大门，门前列坐着十来个华冠丽服之人。正门却不开，只有东西两角门有人出入。正门之上有一匾，匾上大书「敕造宁国府」五个大字。"),
            N("She thinks: this must be my grandfather's elder brother's house.", "黛玉想道：这必是外祖之长房了。"),
            N("A little further west, three more great doors: the Rong mansion. The chair does not go in by the main door. It goes in by the side gate on the west.",
              "又往西行，不多远，照样也是三间大门，方是荣国府了。却不进正门，只进了西边角门。"),
            N("A bowshot inside, the bearers set the chair down and leave. Pages take it up. At a festooned gate they set it down, and the women help her out.",
              "那轿夫抬进去，走了一射之地，将转弯时，便歇下退出去了。另换了三四个衣帽周全十七八岁的小厮上来，复抬起轿子。众婆子步下围随至一垂花门前落下。众小厮退出，众婆子上来打起轿帘，扶黛玉下轿。"),
            ["spawn", "mm", "laomama", "d1", 4, 0],
            S("laomama", "This way, miss. The old lady's rooms are through the courtyard, past the screen.", "姑娘这边走。转过插屏，就是老太太的正房大院了。"),
        ]},

        # D2 · Grandmother. One board: whom to bow to first.
        "d2": {"title": T("Grandmother", "外祖母"), "kind": "main", "steps": [
            ["spawn", "mm", "jmmaid", "d2", 6, 2],
            S("jmmaid", "The old lady was just asking for you, and here you are!", "刚才老太太还念呢，可巧就来了。"),
            N("Three or four of them race to lift the door curtain. Someone inside calls: Miss Lin is here.", "于是三四人争着打起帘笼，一面听得人回话：「林姑娘到了。」"),
            ["spawn", "jm", "jiamu", "d2", 0, -6], ["spawn", "xfr", "xingfuren", "d2", -6, -4], ["spawn", "wfr", "wangfuren", "d2", 6, -4],
            ["spawn", "lw", "liwan", "d2", 10, -2],
            N("A room full of women. Two of them are supporting an old lady with silver hair, and everyone else stands back from her.",
              "满屋子的人。只见两个人搀着一位鬓发如银的老母迎上来，余人都垂手侍立。"),
            ["problem"],
            ["still", "hl_embrace", "slow zoom in"],
            N("She knows her grandmother at once. Before she can bow, her grandmother pulls her into her arms, my heart, my flesh, and weeps aloud. Everyone in the room weeps.",
              "黛玉便知是他外祖母。方欲拜见时，早被他外祖母一把搂入怀中，心肝儿肉叫着大哭起来。当下地下侍立之人，无不掩面涕泣，黛玉也哭个不住。"),
            S("jiamu", "This is your elder uncle's wife. This is your second uncle's wife. This is your cousin Zhu's widow.",
              "这是你大舅母，这是你二舅母，这是你先珠大哥的媳妇珠大嫂子。"),
            S("jiamu", "Call the girls. A guest has come from far away. They needn't go to their lessons today.", "请姑娘们来。今日远客才来，可以不必上学去了。"),
            ["spawn", "yc", "yingchun", "d2", 14, 4], ["spawn", "tc", "tanchun", "d2", 16, 2], ["spawn", "xc", "xichun", "d2", 18, 4],
            N("Three girls come. The first is a little plump, gentle and quiet. The second is slim, with quick eyes and fine brows. The third is still small. All three are dressed exactly alike.",
              "第一个肌肤微丰，合中身材，温柔沉默，观之可亲。第二个削肩细腰，长挑身材，俊眼修眉，顾盼神飞，见之忘俗。第三个身量未足，形容尚小。其钗环裙袄，三人皆是一样的妆饰。"),
            S("jiamu", "Of all my children, she was the one I loved. And she's gone before me, and I never saw her face again. Now I see you, how can I not grieve?",
              "我这些儿女，所疼者独有你母，今日一旦先舍我而去，连面也不能一见，今见了你，我怎不伤心！"),
            N("They see she is frail, and ask what medicine she takes.", "众人见黛玉身体面庞虽怯弱不胜，便知他有不足之症。因问：「常服何药，如何不急为疗治？」"),
            S("daiyu", "I've always been like this. When I was three, a scabby-headed monk said I'd never be well unless I never heard anyone weep, and never saw any family but my parents. It was mad talk. I still take ginseng pills.",
              "我自来是如此，从会吃饮食时便吃药……那一年我三岁时，听得说来了一个癞头和尚……若要好时，除非从此以后总不许见哭声，除父母之外，凡有外姓亲友之人，一概不见……疯疯癫癫，说了这些不经之谈，也没人理他。如今还是吃人参养荣丸。"),
            S("jiamu", "Good, I'm having pills made up now. They'll make a batch more.", "正好，我这里正配丸药呢。叫他们多配一料就是了。"),
        ]},

        # D3 · "I'm late." Xifeng's entrance. One board: what to call her.
        "d3": {"title": T("I'm Late", "我来迟了"), "kind": "main", "steps": [
            N("Laughter from the back courtyard.", "一语未了，只听后院中有人笑声，说："),
            S("xifeng", "I'm late! I wasn't here to welcome our guest!", "我来迟了，不曾迎接远客！"),
            N("She thinks: everyone here holds their breath, so solemn and correct. Who is this, so loud and careless?", "黛玉纳罕道：这些人个个皆敛声屏气，恭肃严整如此，这来者系谁，这样放诞无礼？"),
            ["spawn", "xf", "xifeng", "d3", 12, -6], ["move", "xf", "d3", 4, -2],
            ["still", "hl_xifeng", "pull back"],
            N("A crowd of maids sweeps in around one young woman in gold and red, phoenix eyes, willow-leaf brows. Her red lips laugh before they part.",
              "只见一群媳妇丫鬟围拥着一个人从后房门进来。这个人打扮与众姑娘不同，彩绣辉煌，恍若神妃仙子……一双丹凤三角眼，两弯柳叶吊梢眉……粉面含春威不露，丹唇未起笑先开。"),
            S("jiamu", "You don't know her. She's the famous hellion of this house. In the south they'd call her a hot pepper. Just call her Pepper Feng.",
              "你不认得他，他是我们这里有名的一个泼皮破落户儿，南省俗谓作「辣子」，你只叫他「凤辣子」就是了。"),
            N("Daiyu doesn't know what to call her. The three cousins lean in and whisper: this is Cousin Lian's wife.", "黛玉正不知以何称呼，只见众姊妹都忙告诉他道：「这是琏嫂子。」"),
            ["problem"],
            N("She smiles, and greets her as cousin.", "黛玉忙陪笑见礼，以「嫂」呼之。"),
            S("xifeng", "Is there really anyone this lovely under heaven? She's not like the old ancestress's granddaughter by a daughter at all, she's like her own son's girl. Only, my poor sister, what a hard fate. Why did my aunt have to die!",
              "天下真有这样标致的人物，我今儿才算见了！况且这通身的气派，竟不象老祖宗的外孙女儿，竟是个嫡亲的孙女……只可怜我这妹妹这样命苦，怎么姑妈偏就去世了！"),
            ["emote", "xf", "..."],
            S("jiamu", "I've only just stopped crying, and you start me off again. Don't bring it up.", "我才好了，你倒来招我。你妹妹远路才来，身子又弱，也才劝住了，快再休提前话。"),
            N("At the word, her grief turns to joy in one breath.", "这熙凤听了，忙转悲为喜道："),
            S("xifeng", "So I did! The moment I saw her my heart went out to her, and I forgot the old ancestress. I deserve a slap! How old are you, sister? Anything you want, just tell me. If a maid isn't good to you, tell me.",
              "正是呢！我一见了妹妹，一心都在他身上了，又是喜欢，又是伤心，竟忘记了老祖宗。该打，该打！……妹妹几岁了？……想要什么吃的，什么玩的，只管告诉我，丫头老婆们不好了，也只管告诉我。"),
            S("wangfuren", "You ought to take out a couple of lengths of satin for your sister's clothes. Don't forget.", "该随手拿出两个来给你这妹妹去裁衣裳的，等晚上想着叫人再去拿罢，可别忘了。"),
            S("xifeng", "I'd thought of that already. I knew she'd come any day, so I've had them ready.", "这倒是我先料着了，知道妹妹不过这两日到的，我已预备下了，等太太回去过了目好送来。"),
            N("Lady Wang smiles and nods, and says nothing.", "王夫人一笑，点头不语。"),
            S("xingfuren", "I'll take my niece over to see her uncles. It's on my way.", "我带了外甥女过去，倒也便宜。"),
            ["party", ["daiyu"], {"to": {"place": "Lady Xing's Court", "from": "The Rong Mansion"}}],   # by covered carriage, out of the west side gate
        ]},

        # D4 · The elder uncle's house. One board: decline the dinner.
        "d4": {"title": T("The Elder Uncle's House", "大舅"), "kind": "main", "steps": [
            ["spawn", "xfr", "xingfuren", "d4", 4, -4],
            N("The courtyards here are smaller and prettier, cut off from a garden. Lady Xing sends to the study for her husband. The servant comes back alone.",
              "黛玉度其房屋院宇，必是荣府中花园隔断过来的……邢夫人让黛玉坐了，一面命人到外面书房去请贾赦。一时人来回话说："),
            ["spawn", "sv", "xingservant", "d4", 10, 2],
            S("xingservant", "The master says: seeing the young lady would only grieve us both, and he can't bear it yet. Tell her not to be homesick. If anything's wrong, she must say so.",
              "老爷说了：「连日身上不好，见了姑娘彼此倒伤心，暂且不忍相见。劝姑娘不要伤心想家，跟着老太太和舅母，即同家里一样……或有委屈之处，只管说得，不要外道才是。」"),
            ["remove", "sv"],
            S("xingfuren", "Stay and have dinner with me before you go.", "吃过晚饭再去罢。"),
            N("The light is going. Her grandmother's order was to call on both uncles.", "天色渐晚。外祖母吩咐的，是两个母舅都要拜见。"),
            ["problem"],
            S("daiyu", "You're kind to offer me dinner, aunt, and I oughtn't to refuse. But I still have to call on my second uncle, and it would be disrespectful to keep him waiting. Another day, if you'll allow me.",
              "舅母爱惜赐饭，原不应辞，只是还要过去拜见二舅舅，恐领了赐去不恭，异日再领，未为不可。望舅母容谅。"),
            S("xingfuren", "That's right.", "这倒是了。"),
            ["party", ["daiyu"], {"to": {"place": "The Rong Mansion", "from": "Lady Xing's Court"}}],
        ]},

        # D5 · The kang. Three boards: the two cushions, Jia Zheng's seat, the warning.
        "d5": {"title": T("The Kang", "度其位次"), "kind": "main", "steps": [
            N("Over the great hall, a gold plaque: Hall of Glorious Felicity. But Lady Wang lives in three side rooms to its east. On the kang, two brocade cushions are laid facing each other.",
              "进入堂屋中，抬头迎面先看见一个赤金九龙青地大匾，匾上写着斗大的三个大字，是「荣禧堂」……王夫人时常居坐宴息，亦不在这正室，只在这正室东边的三间耳房内……炕沿上却有两个锦褥对设。"),
            ["spawn", "mm", "laomama", "d5", 4, 2],
            S("laomama", "Sit up on the kang, miss.", "姑娘炕上坐。"),
            ["problem"],
            ["still", "hl_kang", "slow zoom in"],
            N("She reads the order of the seats, and doesn't go up. She sits on a chair on the east side, and studies the maids as she drinks her tea.",
              "黛玉度其位次，便不上炕，只向东边椅子上坐了。本房内的丫鬟忙捧上茶来。黛玉一面吃茶，一面打谅这些丫鬟们，妆饰衣裙，举止行动，果亦与别家不同。"),
            ["spawn", "wfr", "wangfuren", "d5", 10, -6],
            N("In the small rooms on the east corridor, Lady Wang sits on the lower, west side of the kang. When Daiyu comes in, she moves over to make room on the east, where a worn back-rest stands.",
              "到了东廊三间小正房内……靠东壁面西设着半旧的青缎靠背引枕。王夫人却坐在西边下首……见黛玉来了，便往东让。"),
            ["problem"],
            N("She is sure that is her uncle's place, and sits on a chair below. Lady Wang draws her up four times before she sits on the kang, beside her.",
              "黛玉心中料定这是贾政之位。因见挨炕一溜三张椅子上，也搭着半旧的弹墨椅袱，黛玉便向椅上坐了。王夫人再四携他上炕，他方挨王夫人坐了。"),
            S("wangfuren", "Your uncle is fasting today. But there's one thing I can't rest easy about. I have a root of all evil, the demon king of this house. He's at the temple today. From now on, just ignore him.",
              "你舅舅今日斋戒去了，再见罢……但我不放心的最是一件：我有一个孽根祸胎，是家里的「混世魔王」，今日因庙里还愿去了，尚未回来，晚间你看见便知了。你只以后不要睬他，你这些姊妹都不敢沾惹他的。"),
            N("She remembers what her mother said of him: born with a jade in his mouth, wild beyond words, hates his books, and his grandmother dotes on him so nobody dares correct him.",
              "黛玉亦常听得母亲说过，二舅母生的有个表兄，乃衔玉而诞，顽劣异常，极恶读书，最喜在内帏厮混，外祖母又极溺爱，无人敢管。"),
            ["problem"],
            S("daiyu", "You mean the cousin born with the jade, aunt? My mother said he's very wild, but very good to his sisters. And of course I'll be with the girls. The boys live in other courts. How would I come to provoke him?",
              "舅母说的，可是衔玉所生的这位哥哥？在家时亦曾听见母亲常说，这位哥哥比我大一岁，小名就唤宝玉，虽极憨顽，说在姊妹情中极好的。况我来了，自然只和姊妹同处，兄弟们自是别院另室的，岂得去沾惹之理？"),
            S("wangfuren", "You don't know how it is. If the girls say one word more to him than usual, he makes no end of trouble. One moment he's all honey, the next he's raving. Just don't believe him.",
              "你不知道原故……若这一日姊妹们和他多说一句话，他心里一乐，便生出多少事来。所以嘱咐你别睬他。他嘴里一时甜言蜜语，一时有天无日，一时又疯疯傻傻，只休信他。"),
            N("Daiyu agrees to everything. A maid comes: dinner is served at the old lady's.", "黛玉一一的都答应着。只见一个丫鬟来回：「老太太那里传晚饭了。」"),
        ]},

        # D6a · Sister Feng's door. On the passage, at the screen wall: the gate Granny Liu will go through in g5. No board.
        "d6a": {"title": T("Sister Feng's Door", "凤姐姐的屋子"), "kind": "main", "steps": [
            ["light", "dusk"],
            ["spawn", "wfr", "wangfuren", "d6a", -2, 0],
            N("Lady Wang takes her by the back way: a wide passage. To the north, a whitewashed screen wall, and behind it a half-size gate to a small courtyard. Four or five little boys stand at the gate with their hands at their sides.",
              "王夫人忙携黛玉从后房门由后廊往西，出了角门，是一条南北宽夹道。南边是倒座三间小小的抱厦厅，北边立着一个粉油大影壁，后有一半大门，小小一所房室……这院门上也有四五个才总角的小厮，都垂手侍立。"),
            S("wangfuren", "That's your sister Feng's rooms. Come and find her there. If there's anything you need, just tell her.",
              "这是你凤姐姐的屋子，回来你好往这里找他来，少什么东西，你只管和他说就是了。"),
            S("wangfuren", "Come. The old lady's waiting dinner.", "走罢，老太太那里传晚饭了。"),
        ]},

        # D6 · After the meal. Three boards: the chair, the first tea, what she has read.
        "d6": {"title": T("After the Meal", "饭后茶"), "kind": "main", "steps": [
            ["spawn", "wfr", "wangfuren", "d6", -4, 0],
            ["spawn", "jm", "jiamu", "d6", 0, -6], ["spawn", "xf", "xifeng", "d6", 4, -4], ["spawn", "lw", "liwan", "d6", 6, -4],
            N("Li Wan brings the rice, Xifeng lays the chopsticks, Lady Wang serves the soup. Her grandmother sits alone on the couch. Four empty chairs. Xifeng pulls Daiyu to the first chair on the left.",
              "贾珠之妻李氏捧饭，熙凤安箸，王夫人进羹。贾母正面榻上独坐，两边四张空椅，熙凤忙拉了黛玉在左边第一张椅上坐了。"),
            ["problem"],
            N("She declines, firmly, until her grandmother tells her why she may.", "黛玉十分推让。"),
            S("jiamu", "Your aunts and your sister-in-law don't eat here. You're a guest. That's the right seat for you.", "你舅母你嫂子们不在这里吃饭。你是客，原应如此坐的。"),
            ["spawn", "yc", "yingchun", "d6", 8, -2], ["spawn", "tc", "tanchun", "d6", -8, -2], ["spawn", "xc", "xichun", "d6", 8, 0],
            N("The room is full of women and maids, and not one cough is heard. The meal ends in silence. A maid brings each of them tea. Her father taught her to wait until the rice has gone down. A second maid is already coming with a spittoon.",
              "外间伺候之媳妇丫鬟虽多，却连一声咳嗽不闻。寂然饭毕，各有丫鬟用小茶盘捧上茶来。当日林如海教女以惜福养身，云饭后务待饭粒咽尽，过一时再吃茶，方不伤脾胃。"),
            ["problem"],
            ["still", "hl_tea", "slow pan across"],
            N("Many things here are not done as at home, and she changes to fit. She takes the cup, rinses her mouth as they do, washes her hands. Then tea comes again: this is the tea for drinking.",
              "今黛玉见了这里许多事情不合家中之式，不得不随的，少不得一一改过来，因而接了茶。早见人又捧过漱盂来，黛玉也照样漱了口。盥手毕，又捧上茶来，这方是吃的茶。"),
            S("jiamu", "Off you go, all of you. Let us talk in peace.", "你们去罢，让我们自在说话儿。"),
            ["remove", "wfr"], ["remove", "xf"], ["remove", "lw"],
            S("jiamu", "What have you been reading?", "你念何书？"),
            ["problem"],
            S("daiyu", "I've only just read the Four Books. And what do my cousins read?", "只刚念了《四书》。姊妹们读何书？"),
            S("jiamu", "Read? They know a few characters, that's all, so they aren't blind with their eyes open!", "读的是什么书，不过是认得两个字，不是睁眼的瞎子罢了！"),
        ]},

        # D7 · The jade. Two boards; the second is solved and goes wrong anyway (it was never hers to win).
        "d7": {"title": T("The Jade", "摔玉"), "kind": "main", "steps": [
            N("Footsteps outside. Baoyu's here!", "只听外面一阵脚步响，丫鬟进来笑道：「宝玉来了！」"),
            N("She thinks: I wonder what sort of lout this Baoyu is. I'd rather not see the fool at all.", "黛玉心中正疑惑着：这个宝玉，不知是怎生个惫懒人物，懵懂顽童？倒不见那蠢物也罢了。"),
            ["spawn", "by", "baoyu", "d7", 14, 4], ["move", "by", "d7", 4, 2],
            ["still", "hl_baoyu", "slow zoom in"],
            N("A young man in a jewelled gold cap and a red coat, a jade on a cord at his neck. A face like the mid-autumn moon. Even angry, he seems to smile.",
              "已进来了一位年轻的公子……面若中秋之月，色如春晓之花……虽怒时而若笑，即瞋视而有情。项上金螭璎珞，又有一根五色丝绦，系着一块美玉。"),
            N("She thinks: how strange. As if I'd seen him somewhere before. Why does he look so familiar?", "黛玉一见，便吃一大惊，心下想道：好生奇怪，倒象在那里见过一般，何等眼熟到如此！"),
            S("baoyu", "I've seen this sister before.", "这个妹妹我曾见过的。"),
            S("jiamu", "More nonsense. When could you have seen her?", "可又是胡说，你又何曾见过他？"),
            S("baoyu", "Well, I haven't. But her face is so familiar, in my heart she's an old friend. Let's call it meeting again after a long parting.",
              "虽然未曾见过他，然我看着面善，心里就算是旧相识，今日只作远别重逢，亦未为不可。"),
            S("baoyu", "Have you studied, sister?", "妹妹可曾读书？"),
            ["problem"],
            S("daiyu", "Not really. I only went to school for a year. I know a few characters.", "不曾读，只上了一年学，些须认得几个字。"),
            S("baoyu", "Then I'll give you a name: Pinpin, Frowner. In the west there's a stone called dai that paints the brows, and her brows are always a little knit.",
              "我送妹妹一妙字，莫若「颦颦」二字极妙……《古今人物通考》上说：「西方有石名黛，可代画眉之墨。」况这林妹妹眉尖若蹙，用取这两个字，岂不两妙！"),
            S("tanchun", "You've made it up again, I expect.", "只恐又是你的杜撰。"),
            S("baoyu", "Apart from the Four Books, most things are made up. Have you a jade?", "除《四书》外，杜撰的太多，偏只我是杜撰不成？……可也有玉没有？"),
            N("Nobody in the room understands the question. She reasons: he asks because he has one.", "众人不解其语，黛玉便忖度着因他有玉，故问我有也无。"),
            ["problem"],
            S("daiyu", "I haven't. I suppose a jade like that is a rare thing. Not everyone could have one.", "我没有那个。想来那玉是一件罕物，岂能人人有的。"),
            ["emote", "by", "anger"],
            S("baoyu", "Rare thing! It can't even tell who's better than who. And they call it magic! I don't want the wretched thing any more!",
              "什么罕物，连人之高低不择，还说「通灵」不「通灵」呢！我也不要这劳什子了！"),
            ["fx", "flash", "d7", 2, 2],
            ["still", "hl_jade", "slow zoom in"],
            N("He hurls the jade down. Everyone dives for it.", "摘下那玉，就狠命摔去……吓的众人一拥争去拾玉。"),
            S("jiamu", "You wicked child! Lose your temper, hit someone, but why throw away your life's root?", "孽障！你生气，要打骂人容易，何苦摔那命根子！"),
            S("baoyu", "None of my sisters has one, only me. And now this sister comes, like a fairy, and she hasn't one either. So it can't be any good.",
              "家里姐姐妹妹都没有，单我有，我说没趣，如今来了这们一个神仙似的妹妹也没有，可知这不是个好东西。"),
            S("jiamu", "Your sister had one too. When your aunt died, she took it with her into the grave, so her spirit could see her daughter in it. That's why your sister says she has none. Put it on, before your mother hears.",
              "你这妹妹原有这个来的，因你姑妈去世时，舍不得你妹妹，无法处，遂将他的玉带了去了……因此他只说没有这个，不便自己夸张之意。你如今怎比得他？还不好生慎重带上，仔细你娘知道了。"),
            N("She puts it on him herself. He thinks about it, finds it reasonable, and says no more.", "说着，便向丫鬟手中接来，亲与他带上。宝玉听如此说，想一想大有情理，也就不生别论了。"),
            N("Daiyu is to sleep in the green gauze closet, and Baoyu just outside it.", "把林姑娘暂安置碧纱橱里……宝玉道：「好祖宗，我就在碧纱橱外的床上很妥当。」"),
        ]},

        # D8 · The first tears. Night. Then the scroll (chapters 4-5), and the cut to Granny Liu.
        "d8": {"title": T("The First Tears", "还泪"), "kind": "main", "steps": [
            ["light", "night", 1200],
            ["spawn", "yg", "yingge", "d8", 3, 0],
            ["spawn", "xr", "xiren", "d8", 10, 2], ["move", "xr", "d8", 4, 1],
            S("xiren", "Why aren't you asleep, miss?", "姑娘怎么还不安息？"),
            ["still", "hl_gauze", "drift down"],
            S("yingge", "Miss Lin's been crying all by herself. She says: I've only just come, and I've set off your young master's fit. If he'd broken the jade, it would have been my fault.",
              "林姑娘正在这里伤心，自己淌眼抹泪的说：「今儿才来，就惹出你家哥儿的狂病，倘或摔坏了那玉，岂不是因我之过！」因此便伤心，我好容易劝好了。"),
            S("xiren", "Don't, miss. There'll be stranger and funnier things than this to come! If you grieve over everything he does, you'll never stop grieving.",
              "姑娘快休如此，将来只怕比这个更奇怪的笑话儿还有呢！若为他这种行止，你多心伤感，只怕你伤感不了呢。快别多心！"),
            S("daiyu", "I'll remember. But where did that jade come from?", "姐姐们说的，我记着就是了。究竟那玉不知是怎么个来历？"),
            S("xiren", "No one in the family knows. They say it came out of his mouth when he was born.", "连一家子也不知来历……听得说，落草时是从他口里掏出来的。"),
            N("Her first night in the house, and her first tears in it, for the stone.", "进府头一夜，头一回落泪，为的是那块玉。"),
            ["scroll", T("Chapters 4 and 5", "第四回、第五回"), [
                T("Jia Yucun, the tutor who came to the capital behind her boat, has a judgeship from her uncle. His first case: a lordling of the Xue family has had a man beaten to death over a bought maid. Yucun is shown the list of families no official may cross, and lets the killer go.",
                  "贾雨村补授了应天府，一下马就有一件人命官司：薛家公子为争买一婢，打死人命。门子献上「护官符」，雨村徇情枉法，胡乱判断了此案。"),
                T("The Xues settle in the Rong mansion. Their daughter Baochai is easy with everyone, and even the little maids would rather play with her. Daiyu feels it, and Baochai never notices.",
                  "薛家住进荣府梨香院。宝钗行为豁达，随分从时……便是那些小丫头子们，亦多喜与宝钗去顽。因此黛玉心中便有些悒郁不忿之意，宝钗却浑然不觉。"),
                T("This house has three or four hundred souls, and a dozen affairs a day. Where to begin? Just then, from a thousand li away, a family as small as a mustard seed was on its way to the Rong mansion.",
                  "按荣府中一宅人合算起来……从上至下也有三四百丁……正寻思从那一件事自那一个人写起方妙，恰好忽从千里之外，芥豆之微，小小一个人家……这日正往荣府中来。"),
            ]],
            ["party", ["grannyliu", "baner"], {"to": {"place": "The Village", "spot": "gouer-house"}}],   # a cut, not a meeting: the novel turns away
        ]},
    }


# ---------------------------------------------------------------- Part 2: 侯门深似海 Deep as the Sea (chapter 6)

def _scenes_granny():
    return {
        # G1 · A hair thicker than a waist. The village; the plan. No board.
        "g1": {"title": T("A Hair Thicker than a Waist", "拔一根寒毛"), "kind": "main", "steps": [
            ["light", "dusk"],
            ["spawn", "ge", "gouer", "g1", 4, -2], ["spawn", "ls", "liushi", "g1", 8, 0],
            N("A small farming family outside the city. Autumn is ending, it's getting cold, and nothing is ready for winter. Gou'er has had a few cups and is picking quarrels at home.",
              "因这年秋尽冬初，天气冷将上来，家中冬事未办，狗儿未免心中烦虑，吃了几杯闷酒，在家闲寻气恼，刘氏也不敢顶撞。"),
            ["pose", "ge", "drunk"],
            S("grannyliu", "Son-in-law, don't be cross with me for speaking. We're country folk. We eat out of the bowl we've got. We may live outside the walls, but we're at the Emperor's feet. This city's paved with money. Nobody knows how to pick it up.",
              "姑爷，你别嗔着我多嘴。咱们村庄人，那一个不是老老诚诚的，守多大碗儿吃多大的饭……如今咱们虽离城住着，终是天子脚下。这长安城中，遍地都是钱，只可惜没人会去拿去罢了。"),
            S("gouer", "All you can do is talk from the kang. Do you want me to rob somebody? I've no relations collecting taxes, no friends in office.",
              "你老只会炕头儿上混说，难道叫我打劫偷去不成？……我又没有收税的亲戚，作官的朋友，有什么法子可想的？"),
            S("grannyliu", "You were kin to the Jinling Wangs once. Their second daughter is married into the Rong mansion now, and they say she pities the poor. If she takes pity, why, one hair pulled from her would be thicker than our waists.",
              "当日你们原是和金陵王家连过宗的……如今现是荣国府贾二老爷的夫人。听得说，如今上了年纪，越发怜贫恤老……要是他发一点好心，拔一根寒毛比咱们的腰还粗呢。"),
            S("liushi", "With faces like ours, how could we go to her door? Her gatekeepers wouldn't even take our name in.", "但只你我这样个嘴脸，怎样好到他门上去的。先不先，他们那些门上的人也未必肯去通信。没的去打嘴现世。"),
            S("gouer", "You've met the lady once, Granny. Why don't you go tomorrow and test the wind?", "姥姥既如此说，况且当年你又见过这姑太太一次，何不你老人家明日就走一趟，先试试风头再说。"),
            S("grannyliu", "Oh my! The noble gate is deep as the sea. What am I? Her people don't know me.", "嗳哟哟！可是说的，「侯门深似海」，我是个什么东西，他家人又不认得我，我去了也是白去的。"),
            S("gouer", "Take Ban'er, and ask first for Zhou Rui, who came over with the lady when she married. Find him, and you're halfway there.",
              "不妨，我教你老人家一个法子：你竟带了外孙子板儿，先去找陪房周瑞，若见了他，就有些意思了。"),
            S("grannyliu", "Well, it'll have to be this old face of mine. If there's no silver, at least I'll have seen a noble house before I die.",
              "倒还是舍着我这付老脸去碰一碰。果然有些好处，大家都有益，便是没银子来，我也到那公府侯门见一见世面，也不枉我一生。"),
            N("They all laugh. Before dawn she is up, and takes Ban'er into the city.", "说毕，大家笑了一回。次日天未明，刘姥姥便起来梳洗了，又将板儿教训了几句……于是刘姥姥带他进城。"),
            ["party", ["grannyliu", "baner"], {"to": {"place": "Ning-Rong Street", "from": "The Village"}}],
        ]},

        # G2 · The stone lions. One board: get past the men on the bench.
        "g2": {"title": T("The Stone Lions", "石狮子"), "kind": "main", "steps": [
            ["light", "day"],
            ["still", "hl_lions", "slow pan up"],
            N("At the great gate, sedan chairs and horses crowd thick. She doesn't dare go near. She brushes down her clothes and edges toward the side gate.",
              "来至荣府大门石狮子前，只见簇簇轿马，刘姥姥便不敢过去，且掸了掸衣服，又教了板儿几句话，然后蹭到角门前。"),
            ["spawn", "gm", "gateman", "g2", 6, -2], ["spawn", "os", "oldservant", "g2", 10, -2],
            N("On a long bench sit men with their chests out and bellies forward, waving their hands.", "只见几个挺胸叠肚指手画脚的人，坐在大板凳上，说东谈西呢。"),
            S("grannyliu", "Blessings on you, sirs. I'm looking for Master Zhou, who came over with the lady.", "太爷们纳福。……我找太太的陪房周大爷的，烦那位太爷替我请他老出来。"),
            S("gateman", "Go and wait over by the corner of the wall. Somebody'll be out in a while.", "你远远的在那墙角下等着，一会子他们家有人就出来的。"),
            ["emote", "gm", "..."],
            ["problem"],
            S("oldservant", "Don't hold up her business. Why play tricks on her? Master Zhou's gone south, but his wife's at home. Go round to the back street and ask at the back gate.",
              "不要误他的事，何苦耍他。……那周大爷已往南边去了。他在后一带住着，他娘子却在家。你要找时，从这边绕到后街上后门上去问就是了。"),
            N("She thanks him, and takes Ban'er round to the back.", "刘姥姥听了谢过，遂携了板儿，绕到后门上。"),
        ]},

        # G3 · Three Zhou Da-niangs. One board: which one.
        "g3": {"title": T("Three Zhou Da-niangs", "三个周大娘"), "kind": "main", "steps": [
            N("Outside the back gate, hawkers have set down their loads, and twenty or thirty children are making a racket.", "只见门前歇着些生意担子，也有卖吃的，也有卖顽耍物件的，闹吵吵三二十个小孩子在那里厮闹。"),
            ["spawn", "ch", "backchild", "g3", 4, 0],
            S("grannyliu", "May I ask you, young sir: is there a Zhou Da-niang at home?", "我问哥儿一声，有个周大娘可在家么？"),
            S("backchild", "Which Zhou Da-niang? There are three Zhou Da-niangs here, and two Zhou Nainais. Which line of work?", "那个周大娘？我们这里周大娘有三个呢，还有两个周奶奶，不知是那一行当的？"),
            ["problem"],
            S("grannyliu", "The lady's dowry man, Zhou Rui's.", "是太太的陪房周瑞。"),
            S("backchild", "That's easy. Come with me! Zhou Da-niang! There's an old granny looking for you!", "这个容易，你跟我来。……周大娘，有个老奶奶来找你呢，我带了来了。"),
        ]},

        # G4 · A real Buddha. One board: say why you came, without saying it.
        "g4": {"title": T("A Real Buddha", "真佛"), "kind": "main", "steps": [
            ["spawn", "zr", "zhouruijia", "g4", 4, -2],
            S("zhouruijia", "Granny Liu! Is it really so many years? Come in and sit down. Are you passing by today, or did you come on purpose?",
              "刘姥姥，你好呀！你说说，能几年，我就忘了。请家里来坐罢。……今日还是路过，还是特来的？"),
            ["problem"],
            S("grannyliu", "I came on purpose to see you, sister, and to pay my respects to the lady. If you could take me to see her, so much the better.",
              "原是特来瞧瞧嫂子你，二则也请请姑太太的安。若可以领我见一见更好，若不能，便借重嫂子转致意罢了。"),
            S("zhouruijia", "Don't you worry. You've come all this way in good faith. Of course I'll get you in to see a real Buddha! But the lady hardly runs anything now. It's all the second mistress, the lady's niece. Feng-ge, they called her.",
              "姥姥你放心。大远的诚心诚意来了，岂有个不教你见个真佛去的呢……如今太太竟不大管事，都是琏二奶奶管家了……就是太太的内侄女，当日大舅老爷的女儿，小名凤哥的。"),
            S("grannyliu", "So it's her! I always said she'd turn out well. Amitabha! It all depends on you, sister.", "原来是他！怪道呢，我当日就说他不错呢……阿弥陀佛！全仗嫂子方便了。"),
            S("zhouruijia", "She's young, but she has ten thousand tricks in her head, and ten clever men couldn't out-talk her. Quick! While she's coming down to eat, there's a gap. If we're late there'll be people queuing to report.",
              "这位凤姑娘年纪虽小，行事却比世人都大呢……少说些有一万个心眼子。再要赌口齿，十个会说话的男人也说他不过……快走，快走。这一下来他吃饭是个空子，咱们先赶着去。若迟一步，回事的人也多了，难说话。"),
        ]},

        # G5 · The clock. One board: how to greet Ping'er.
        "g5": {"title": T("The Clock", "自鸣钟"), "kind": "main", "steps": [
            N("Up the steps, through a scarlet curtain. A breath of perfume, and everything in the room dazzles. Her head swims. She can only nod, smack her lips, and call on the Buddha.",
              "小丫头打起猩红毡帘，才入堂屋，只闻一阵香扑了脸来……满屋中之物都耀眼争光的，使人头悬目眩。刘姥姥此时惟点头咂嘴念佛而已。"),
            ["spawn", "pe", "pinger", "g5", 4, -2], ["spawn", "zr", "zhouruijia", "g5", -2, 0],
            N("A young woman stands by the kang in silks, with gold in her hair, lovely as a flower. This must be the mistress.", "平儿站在炕沿边……刘姥姥见平儿遍身绫罗，插金带银，花容玉貌的，便当是凤姐儿了。"),
            ["problem"],
            N("She is about to say Madam, when she hears Zhou Rui's wife call her Miss Ping. Only a maid of some standing.", "才要称姑奶奶，忽见周瑞家的称他是平姑娘，又见平儿赶着周瑞家的称周大娘，方知不过是个有些体面的丫头了。"),
            N("Clack, clack, clack, like someone sifting flour. On a pillar hangs a box with a weight swinging under it, never still.", "刘姥姥只听见咯当咯当的响声，大有似乎打箩柜筛面的一般……忽见堂屋中柱子上挂着一个匣子，底下又坠着一个秤砣般一物，却不住的乱幌。"),
            S("grannyliu", "What's that pretty thing? What's it for?", "这是什么爱物儿？有甚用呢？"),
            ["still", "hl_clock", "slow zoom in"],
            N("Dang! like a golden bell. She starts. Then eight or nine more. The little maids scatter: the mistress is coming down!", "只听得当的一声，又若金钟铜磬一般，不防倒唬的一展眼。接着又是一连八九下……只见小丫头子们齐乱跑，说：「奶奶下来了。」"),
            ["remove", "pe"], ["remove", "zr"],
            N("She holds her breath and listens. Skirts rustling, laughter, then the silence of a house where not a sparrow chirps. A table goes past, still full of fish and meat. Ban'er clamours for it, and she slaps him quiet.",
              "刘姥姥屏声侧耳默候……半日鸦雀不闻之后，忽见二人抬了一张炕桌来……仍是满满的鱼肉在内，不过略动了几样。板儿一见了，便吵着要肉吃，刘姥姥一巴掌打了他去。"),
            ["spawn", "zr", "zhouruijia", "g5", 6, 2],
            N("Zhou Rui's wife appears, all smiles, and beckons.", "忽见周瑞家的笑嘻嘻走过来，招手儿叫他。"),
        ]},

        # G6 · "Your nephew." Boss: Wang Xifeng. Three boards: say it; nowhere to hide; the ask.
        "g6": {"title": T("Your Nephew", "你侄儿"), "kind": "main", "steps": [
            ["spawn", "xf", "xifeng", "g6", 0, -6], ["spawn", "pe", "pinger", "g6", 4, -6], ["spawn", "zr", "zhouruijia", "g6", 6, 0],
            ["still", "hl_ash", "slow zoom in"],
            N("Xifeng sits very upright in her sable cap, stirring the ashes in her hand-warmer. She doesn't take the tea, and doesn't look up.", "那凤姐儿……端端正正坐在那里，手内拿着小铜火箸儿拨手炉内的灰……凤姐也不接茶，也不抬头，只管拨手炉内的灰，慢慢的问道："),
            ["boss", "xifeng"],
            S("xifeng", "Why haven't you brought them in?", "怎么还不请进来？"),
            N("She looks up, sees them already standing there, and before she is up her face is all spring wind.", "一面说，一面抬身要茶时，只见周瑞家的已带了两个人在地下站着呢。这才忙欲起身，犹未起身时，满面春风的问好。"),
            S("xifeng", "Relations don't visit, and we drift apart. The small-minded sort think we look down on everyone.", "亲戚们不大走动，都疏远了。知道的呢，说你们弃厌我们，不肯常来，不知道的那起小人，还只当我们眼里没人似的。"),
            S("grannyliu", "We're poor, we can't afford to visit. We'd only shame you.", "我们家道艰难，走不起，来了这里，没的给姑奶奶打嘴，就是管家爷们看着也不象。"),
            S("xifeng", "That kind of talk makes me sick. We live on our grandfathers' names. It's only an old empty frame.", "这话没的叫人恶心。不过借赖着祖父虚名，作了穷官儿，谁家有什么，不过是个旧日的空架子。"),
            S("zhouruijia", "If there's anything to say, just tell the second mistress. It's the same as the lady.", "没甚说的便罢，若有话，只管回二奶奶，是和太太一样的。"),
            ["emote", "zr", "!"],
            N("Zhou Rui's wife is making eyes at her. Her face goes red before she speaks. If she doesn't say it, why did she come?", "一面说，一面递眼色与刘姥姥。刘姥姥会意，未语先飞红的脸，欲待不说，今日又所为何来？"),
            ["problem"],
            S("grannyliu", "By rights I shouldn't say it, the first time I've met you. But I've come all this way.", "论理今儿初次见姑奶奶，却不该说，只是大远的奔了你老这里来，也少不的说了。"),
            N("A page calls from the inner gate: the young master from the East Mansion is here.", "刚说到这里，只听二门上小厮们回说：「东府里的小大爷进来了。」"),
            ["spawn", "jr", "jiarong", "g6", 14, 4], ["move", "jr", "g6", 4, 2],
            N("A handsome young lord in light furs. She can't sit, can't stand, and has nowhere to hide.", "进来了一个十七八岁的少年，面目清秀，身材俊俏，轻裘宝带，美服华冠。刘姥姥此时坐不是，立不是，藏没处藏。"),
            ["problem"],
            S("xifeng", "Sit down, sit down. This is my nephew.", "你只管坐着，这是我侄儿。"),
            S("jiarong", "My father begs to borrow the glass screen for the kang, aunt, for an important guest tomorrow.", "我父亲打发我来求婶子，说上回老舅太太给婶子的那架玻璃炕屏，明日请一个要紧的客，借了略摆一摆就送过来。"),
            S("xifeng", "You're a day too late. I gave it to someone yesterday.", "说迟了一日，昨儿已经给了人了。"),
            S("jiarong", "If you don't lend it, I'll get a good beating. Take pity on your nephew.", "婶子若不借，又说我不会说话了，又挨一顿好打呢。婶子只当可怜侄儿罢。"),
            S("xifeng", "If it gets one knock, mind your skin!", "若碰一点儿，你可仔细你的皮！"),
            N("She sends Ping'er for the key. He goes. Then she calls him back, gazes into nothing a long while, and sends him off again with nothing said.",
              "因命平儿拿了楼房的钥匙，传几个妥当人抬去……「蓉哥回来。」……那凤姐只管慢慢的吃茶，出了半日的神，又笑道：「罢了，你且去罢。晚饭后你来再说罢。」"),
            ["remove", "jr"],
            ["problem"],
            S("grannyliu", "Today I've brought your nephew here, because his father and mother haven't even enough to eat, and it's turned cold. What did your father tell you to say? All you do is eat fruit!",
              "今日我带了你侄儿来，也不为别的，只因他老子娘在家里，连吃的都没有。如今天又冷了，越想没个派头儿，只得带了你侄儿奔了你老来。……你那爹在家怎么教你来？打发咱们作煞事来？只顾吃果子咧。"),
            S("xifeng", "Say no more, I understand. Has the granny had her breakfast?", "不必说了，我知道了。……这姥姥不知可用了早饭没有？"),
            S("xifeng", "From outside, this house looks grand and blazing, but a big house has big troubles. Still, it's the first time you've asked me. Yesterday the lady gave me twenty taels for my maids' clothes. Take it, if it's not too little.",
              "外头看着虽是烈烈轰轰的，殊不知大有大的艰难去处，说与人也未必信罢。今儿你既老远的来了，又是头一次见我张口，怎好叫你空回去呢。可巧昨儿太太给我的丫头们做衣裳的二十两银子，我还没动呢，你若不嫌少，就暂且先拿了去罢。"),
            S("grannyliu", "A starved camel is still bigger than a horse. One hair pulled from you is thicker than our waists!", "但俗语说的：「瘦死的骆驼比马大」，凭他怎样，你老拔根寒毛比我们的腰还粗呢！"),
            N("Zhou Rui's wife winks at her to stop. Xifeng sees, laughs, and takes no notice.", "周瑞家的见他说的粗鄙，只管使眼色止他。凤姐看见，笑而不睬。"),
            ["give", "pe", "grannyliu", "silver"],
            ["still", "hl_silver", "slow zoom in"],
            S("xifeng", "Twenty taels, for the child's winter clothes, and cash for a cart. Come and visit whenever you're free, as relations should.", "这是二十两银子，暂且给这孩子做件冬衣罢……这钱雇车坐罢。改日无事，只管来逛逛，方是亲戚们的意思。"),
        ]},

        # G7 · The back gate. No board. The book's last line.
        "g7": {"title": T("The Back Gate", "后门"), "kind": "main", "steps": [
            ["light", "dusk"],
            ["spawn", "zr", "zhouruijia", "g7", 4, -2],
            S("zhouruijia", "Mother of mine! What happened to you in there? Your nephew, first thing! Master Rong's her proper nephew. Where did she suddenly get another one?",
              "我的娘啊！你见了他怎么倒不会说了？开口就是「你侄儿」……蓉大爷才是他的正经侄儿呢，他怎么又跑出这么一个侄儿来了。"),
            S("grannyliu", "Oh, sister. When I saw her, my heart was so full of loving her, how could I get a word out right?", "我的嫂子，我见了他，心眼儿里爱还爱不过来，那里还说的上话来呢。"),
            N("She wants to leave a piece of silver for the Zhou children. Zhou Rui's wife won't take it. Granny Liu thanks her endlessly, and goes out the way she came, by the back gate.",
              "刘姥姥便要留下一块银子与周瑞家孩子们买果子吃，周瑞家的如何放在眼里，执意不肯。刘姥姥感谢不尽，仍从后门去了。"),
            N("When fortune smiles, help comes easily; a kindness deeply felt is more than kin.", "得意浓时易接济，受恩深处胜亲朋。"),
        ]},
    }


# ---------------------------------------------------------------- nodes, dilemmas, world

def _dilemmas():
    """One dilemma per board, in order (a list where a scene poses several)."""
    return {
        "d2": D("daiyu", "Find your grandmother among them.", "在众人中认出外祖母。",
                "A room full of women, and I mustn't bow to the wrong one.", "满屋子的人，可不能拜错了。",
                "She knows me.", "外祖母认得我了。", "A maid by the door hides a smile.", "门边一个丫头掩口笑了。"),
        "d3": D("daiyu", "What do I call her?", "该怎么称呼她？",
                "Grandmother says Pepper Feng. That's a joke I'm not allowed to make.", "外祖母说叫凤辣子。这玩笑我可开不得。",
                "Cousin.", "嫂子。", "The maids laugh outright, and she laughs loudest.", "丫头们都笑出声来，她笑得最响。"),
        "d4": D("daiyu", "Decline the dinner, kindly.", "婉辞舅母的晚饭。",
                "Refuse plainly and I'm rude. Stay, and I keep my second uncle waiting.", "直说不吃，失礼；留下来，又怠慢了二舅舅。",
                "That's right, she says.", "舅母说：这倒是了。", "The women along the wall exchange a look.", "两边的姬妾丫鬟互相使了个眼色。"),
        "d5": [
            D("daiyu", "Read the seats.", "看清座次。",
              "Two cushions, facing. Two places, for two people who aren't here.", "两个锦褥对设。两个位子，是给不在这里的两个人的。",
              "A chair, on the east side.", "东边的椅子上。", "A maid with the tea stops, and smiles.", "端茶的丫头停住了，笑了一笑。"),
            D("daiyu", "Not my uncle's place.", "不坐舅舅的位子。",
              "She's moved over to make room. Whose room is it?", "舅母往东让。让的是谁的位子？",
              "A chair below, until she draws me up beside her.", "先坐椅上，等舅母拉我，才挨着她坐。", "A maid looks at the floor.", "一个丫头低头看地。"),
            D("daiyu", "Answer her warning.", "回舅母的嘱咐。",
              "She's warning me off her own son. Agree too fast, and I insult him; ask, and I pry.", "她嘱咐我别理她的儿子。答应太快是轻慢，追问又是多事。",
              "She's satisfied.", "舅母放心了。", "Her smile goes thin.", "舅母的笑淡了。"),
        ],
        "d6": [
            D("daiyu", "The seat of honour?", "首座坐不坐？",
              "My aunts are standing to serve. And I'm to sit first?", "舅母嫂子们都站着伺候，我倒先坐？",
              "Grandmother says a guest sits there.", "外祖母说：你是客，原应如此坐的。", "A nurse by the wall catches a maid's eye.", "墙边一个嬷嬷对丫头递了个眼色。"),
            D("daiyu", "When to drink the tea.", "这茶什么时候喝。",
              "Father said wait. Here a spittoon is coming already.", "父亲说饭后要等。这里漱盂已经捧过来了。",
              "Rinse, wash, then drink.", "漱口，盥手，再吃茶。", "The maid with the spittoon bites her lip.", "捧漱盂的丫头抿嘴忍着笑。"),
            D("daiyu", "Tell her what you've read.", "告诉外祖母读过什么书。",
              "The first time anyone here has asked me.", "这里头一回有人问我。",
              "The Four Books.", "《四书》。", "Grandmother's brows lift.", "外祖母的眉头一挑。"),
        ],
        "d7": [
            D("daiyu", "Have you studied?", "妹妹可曾读书？",
              "The same question. But I've heard what she thinks of girls' reading.", "同样一句话。可外祖母说姑娘们读书是怎么说的，我听见了。",
              "A year of school. A few characters.", "上了一年学，认得几个字。", "Grandmother's brows lift, and a maid smiles.", "外祖母眉头一挑，丫头笑了。"),
            D("daiyu", "Have you a jade?", "可也有玉没有？",
              "Nobody understands him. There's nothing to read in their faces.", "众人都不解其语。脸上什么也看不出来。",
              "I answer as well as anyone could.", "我答得再妥当不过。", "Think again: why would he ask?", "再想想：他为什么问？"),
        ],
        "g2": D("grannyliu", "Get past the men on the bench.", "过了门上这些人。",
                "They're having fun with me. Somebody here has to be kind.", "他们拿我取笑呢。总有一个心善的。",
                "The old one sends me round the back.", "那个老的叫我绕到后门去。", "Waiting by the wall. Nobody comes.", "在墙角下等着，没人来。"),
        "g3": D("grannyliu", "Which Zhou Da-niang?", "哪一个周大娘？",
                "Three of them, and two Zhou Nainais. Which line of work?", "三个周大娘，还有两个周奶奶。是那一行当的？",
                "Come with me, he says.", "孩子说：你跟我来。", "The children shriek and point five ways.", "孩子们哄笑，往五个方向乱指。"),
        "g4": D("grannyliu", "Say why you came, without saying it.", "说明来意，又不明说。",
                "She's pleased to see me, and pleased to know the great house. Don't beg yet.", "她见了我高兴，又爱显自己的体面。先别开口求。",
                "She guesses, and she'll help.", "她猜着了，愿意帮。", "She starts on the weather.", "她说起天气来了。"),
        "g5": D("grannyliu", "Greet her.", "见礼。",
                "Silks and gold. My head's swimming. Is this the mistress?", "遍身绫罗，插金带银。我头都晕了。这就是奶奶？",
                "Miss Ping, just in time.", "平姑娘，幸亏没叫错。", "Madam! Ping'er laughs, and Zhou Rui's wife hurries to put it right.", "叫了声姑奶奶！平儿笑了，周瑞家的忙打圆场。"),
        "g6": [
            D("grannyliu", "Say it.", "说出口。",
                "My face is burning. If I don't say it, why did I come?", "脸都红了。不说，今日又所为何来？",
                "I begin.", "说出来了。", "I say nothing. She gives me fruit.", "我没说出口。她给了我一把果子。"),
            D("grannyliu", "Nowhere to hide.", "藏没处藏。",
                "A young lord, in the room where I've just started to beg.", "我刚开口求人，就进来一位公子。",
                "Sit down, she says. He's my nephew.", "她说：你只管坐着，这是我侄儿。", "Behind the curtain. He sees me anyway.", "躲到帘子后头，他还是看见了。"),
            D("grannyliu", "Ask her.", "求她。",
                "She calls him her nephew. Well, Ban'er's her nephew too, in a way.", "她管他叫侄儿。板儿也算是她侄儿吧。",
                "She understands.", "她明白了。", "The words come out all wrong.", "话说得颠三倒四。"),
        ],
    }


def _nodes():
    dl = _dilemmas()

    def node(key, x, y, place, room=None, role="main", **extra):
        n = {"key": key, "x": x, "y": y, "role": role, "place": place, "scene": key}
        if room:
            n["room"] = room
        if key in dl:
            n["dilemma"] = dl[key]
        n.update(extra)
        return n

    rong = "The Rong Mansion"
    return [
        node("d1", 20, 200, rong, board=False),                       # the festooned gate, from the west side gate
        node("d2", 40, 190, rong, room="jm-rooms"),                   # Grandmother Jia's rooms
        node("d3", 55, 185, rong, room="jm-rooms"),
        node("d4", 75, 175, "Lady Xing's Court", room="xing-hall"),   # the black-lacquered gate, east of the main gate
        node("d5", 95, 170, rong, room="wf-rooms"),                   # Rongxi Hall's east side rooms, then the east corridor
        node("d6a", 103, 165, rong, board=False),                      # on the N-S passage, before Xifeng's screen wall and gate
        node("d6", 110, 160, rong, room="jm-rooms"),                  # Grandmother Jia's rear rooms, dinner
        node("d7", 125, 155, rong, room="jm-rooms"),
        node("d8", 140, 150, rong, room="gauze-closet", board=False),
        node("g1", 160, 140, "The Village", room="gouer-house", board=False),
        node("g2", 180, 130, "Ning-Rong Street"),                     # the Rong mansion's side gate and its bench
        node("g3", 195, 125, "Ning-Rong Street"),                     # the back gate, on the back street
        node("g4", 210, 120, rong, room="zhou-house"),                # Zhou Rui's house, inside the back gate
        node("g5", 225, 112, rong, room="xf-eastroom"),               # Xifeng's courtyard: the east room with the clock
        node("g6", 240, 105, rong, room="xf-rooms", role="boss",
             boss={"who": "xifeng", "title": T("Wang Xifeng", "王熙凤") + ", " + T("Pepper Feng", "凤辣子"),
                   "taunt": T("Why haven't you brought them in?", "怎么还不请进来？")}),
        node("g7", 255, 100, "Ning-Rong Street", board=False),        # out by the back gate, at dusk
    ]


_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6a", "d6", "d7", "d8", "g1", "g2", "g3", "g4", "g5", "g6", "g7"]
_EDGES = [[a, b] for a, b in zip(_KEYS, _KEYS[1:])]

_ITEMS = {
    "silver": {"name": "Twenty taels of silver, and a string of cash", "zh": "二十两银子、一吊钱", "kind": "treasure"},
}

_OPENING = [
    ["scroll", T("Chapters 1 and 2", "第一回、第二回"), [
        T("When the goddess Nüwa mended the sky, she used every stone she had made but one. The last was left at the foot of a mountain. It had learned to feel, and it grieved that it alone was not good enough.",
          "女娲氏炼石补天之时……只单单剩了一块未用，便弃在此山青埂峰下。谁知此石自经煅炼之后，灵性已通，因见众石俱得补天，独自己无材不堪入选，遂自怨自叹，日夜悲号惭愧。"),
        T("In heaven a crimson pearl flower was watered with sweet dew every day. When the one who watered it went down to be born, the flower went too: I have no water to repay him, so I will give him all the tears of a lifetime.",
          "绛珠草受神瑛侍者甘露灌溉。神瑛下世为人，绛珠道：「他是甘露之惠，我并无此水可还。他既下世为人，我也去下世为人，但把我一生所有的眼泪还他，也偿还得过他了。」"),
        T("In Yangzhou, the salt commissioner's wife has died. Their only child is a daughter, Daiyu, sickly and clever. Her grandmother in the capital, old Lady Jia of the Rong mansion, has sent for her.",
          "扬州巡盐御史林如海之妻贾氏病故，只有一女，名唤黛玉。京中外祖母荣国府贾母，遣了船只来接。"),
        T("Of the Rong mansion, an antique dealer once said: the frame still stands outside, but the purse inside is nearly empty.",
          "古董商冷子兴说那荣国府：「如今外面的架子虽未甚倒，内囊却也尽上来了。」"),
        T("You are Lin Daiyu. Give no one a reason to laugh.", "你是林黛玉。不叫人耻笑了去。"),
    ]],
]


def _world():
    return {
        "n": 1,
        "name": T("Deep as the Sea", "侯门深似海"),
        "zh": "侯门深似海",
        "novel": "hongloumeng",
        "chapters": [1, 2, 3, 4, 5, 6],
        "couplets": [
            ["金陵城起复贾雨村　荣国府收养林黛玉", "Jia Yucun is restored in Jinling; the Rong mansion takes in Lin Daiyu"],
            ["贾宝玉初试云雨情　刘姥姥一进荣国府", "Jia Baoyu first learns of love; Granny Liu enters the Rong mansion for the first time"],
        ],
        "grades": ["15K", "15K+"],
        "party": ["daiyu"],
        "lead_portrait": True,
        "items": _ITEMS,
        "nodes": _nodes(),
        "edges": _EDGES,
        "scenes": {**_scenes_daiyu(), **_scenes_granny()},
        "opening": _OPENING,
        "closing": [],
    }


# Road challengers (5, none blocking), for Places: what they say when they stop you, after you beat them, and after that.
CHALLENGERS = {
    "steps-maid": {"walk": "d1-d3", "who": "f_maiden", "lead": "daiyu",
        "intro": T("So you're the new cousin from Yangzhou. They say the south plays a careful game. Show me.", "你就是扬州来的林姑娘？听说南边的人下棋最仔细。下一局我瞧瞧。"),
        "win": T("Careful, and quick too. I'll tell the others.", "又仔细，又快。我去告诉她们。"),
        "done": T("The old lady's waiting, miss.", "老太太等着呢，姑娘。")},
    "walk-nurse": {"walk": "d5-d6", "who": "laomama", "lead": "daiyu",
        "intro": T("I play a game here while the mistresses talk. Sit a moment, miss. Nobody will see.", "太太们说话的工夫，我在这里摆一局。姑娘坐一坐，没人瞧见。"),
        "win": T("Your mother played like that. She never let a stone go to waste.", "你母亲当年也是这样下的，一个子儿也不肯白丢。"),
        "done": T("Go on, miss. Don't keep them waiting.", "去罢，姑娘，别叫她们等着。")},
    "lion-groom": {"walk": "g2", "who": "f_villager", "lead": "grannyliu",
        "intro": T("Hey, granny, this gate's for sedan chairs. Beat me at a game and I'll tell you which door's for you.", "老人家，这是走轿子的大门。赢我一局，我告诉你该走哪个门。"),
        "win": T("Not bad for a country granny! The side gate, to the west. Mind the men on the bench.", "乡下老奶奶，倒有两下子！西边角门。小心板凳上那几位。"),
        "done": T("West, granny. The side gate.", "往西，角门。")},
    "toy-hawker": {"walk": "g3", "who": "f_villager", "lead": "grannyliu",
        "intro": T("A toy for the little one? Win a game and he can have one for nothing.", "给小哥儿买个玩意儿？赢我一局，白送一个。"),
        "win": T("A deal's a deal. Here, little one.", "说话算话。拿去罢，小哥儿。"),
        "done": T("The back gate's just there.", "后门就在那儿。")},
    "back-child": {"walk": "g3", "who": "f_child", "lead": "grannyliu",
        "intro": T("Granny! Granny! Play me! I always win!", "老奶奶！老奶奶！跟我下！我回回赢！"),
        "win": T("You cheated! No you didn't. Again tomorrow!", "你耍赖！……没有就没有。明儿再来！"),
        "done": T("Which Zhou Da-niang do you want?", "你找哪个周大娘？")},
}


# Place and room labels (English, Chinese), for Places.
PLACE_NAMES = {
    "The Rong Mansion": "荣国府", "Lady Xing's Court": "邢夫人院", "The Village": "城外村庄", "Ning-Rong Street": "宁荣街",
}
ROOM_NAMES = {
    "jm-rooms": ("Grandmother Jia's rooms", "贾母正房"), "wf-rooms": ("Lady Wang's rooms", "王夫人房"),
    "gauze-closet": ("The green gauze closet", "碧纱橱"), "zhou-house": ("Zhou Rui's house", "周瑞家"),
    "xf-eastroom": ("The east room", "东边屋内"), "xf-rooms": ("Xifeng's rooms", "凤姐屋里"),
    "xing-hall": ("Lady Xing's hall", "邢夫人正室"), "gouer-house": ("Gou'er's house", "狗儿家"),
}


# Room people who give a cue before a board (for Places: room NPCs standing near the node's spot, one `say` each).
# Keyed by node. "who" is a cast id (or a folk kind as f_*). A cue quoting the novel says so in its comment;
# the rest are staging that shows what the text says she noticed or knew.
ROOM_CUES = {
    "d2": [
        {"who": "jmmaid", "say": T("Everyone stands back for the old lady. The two holding her up never let go.", "众人都给老太太让着。搀着她的两个人一直不撒手。")},
        {"who": "laomama", "say": T("The silver-haired one is the old lady herself, miss.", "那位银发的，就是老太太。")},
    ],
    "d3": [   # the sisters' whisper is the novel's: 众姊妹都忙告诉他道「这是琏嫂子」
        {"who": "tanchun", "say": T("This is Cousin Lian's wife.", "这是琏嫂子。")},
        {"who": "jmmaid", "say": T("Nobody calls her Pepper Feng but the old lady.", "除了老太太，谁敢叫她凤辣子。")},
    ],
    "d4": [
        {"who": "laomama", "say": T("The old lady said both uncles, miss, and the light's going.", "老太太吩咐两个舅舅都要见的，姑娘，天也晚了。")},
    ],
    "d5": [   # the cushions are the novel's: 炕沿上却有两个锦褥对设; Lady Wang moving east too: 便往东让
        {"who": "laomama", "say": T("Two cushions on the kang, facing each other. Somebody's places.", "炕沿上两个锦褥对设着，是有人的位子。")},
        {"who": "jmmaid", "say": T("The mistress always sits on the lower side. The east place is the master's.", "太太总坐在下首。东边那是老爷的位子。")},
        {"who": "jmmaid", "say": T("The mistress smiles when she talks about him. Everyone does.", "太太说起他来是笑着的。人人都这样。")},
    ],
    "d6": [   # the spittoon is the novel's: 早见人又捧过漱盂来
        {"who": "liwan", "say": T("We don't sit. We serve the old lady.", "我们不坐，伺候老太太。")},
        {"who": "jmmaid", "say": T("The spittoon comes before the tea you drink.", "先捧漱盂，后面那盅才是吃的茶。")},
        {"who": "tanchun", "say": T("Grandmother thinks girls only need a few characters.", "老太太说，姑娘们认得几个字就够了。")},
    ],
    "d7": [   # the blank faces are the novel's: 众人不解其语
        {"who": "jmmaid", "say": T("A jade? What does he mean? Nobody knows.", "玉？他问这个做什么？谁也不明白。")},
    ],
    "g2": [
        {"who": "oldservant", "say": T("Those idlers are having their fun. Don't wait by that wall.", "那几个闲人拿你取笑呢。别去墙角下傻等。")},
    ],
    "g3": [   # the novel's: 我们这里周大娘有三个呢
        {"who": "backchild", "say": T("There are three Zhou Da-niangs here. Which one?", "我们这里周大娘有三个呢。你找哪一个？")},
    ],
    "g4": [
        {"who": "zhouruijia", "say": T("I do like to be asked. It's not my job, mind, but I know everyone.", "回话原不与我相干，可这府里，谁我不认得。")},
    ],
    "g5": [   # the novel's: 周瑞家的称他是平姑娘
        {"who": "zhouruijia", "say": T("Miss Ping, this is the granny I told you of.", "平姑娘，这就是我才说的那姥姥。")},
    ],
    "g6": [   # the wink is the novel's: 递眼色与刘姥姥
        {"who": "zhouruijia", "say": T("Go on. Say it now, while there's no one else here.", "快说。趁这会子没别人。")},
    ],
}


# Granny Liu indoors (design: her watching is dazzled): the first look at the room gives her only this; the cues come on
# the second look. Keyed by node. The novel's: 满屋中之物都耀眼争光的，使人头悬目眩
DAZZLED = {
    k: N("Everything in the room glitters and shines. Her head swims.", "满屋中之物都耀眼争光的，使人头悬目眩。")
    for k in ("g5", "g6")
}

# The tally of smiles (design: Daiyu ends the day with none). Every Part 1 board counts but the jade (d7's second, which
# no one could read); a wrong move on one is a smile behind a sleeve. Shown at d8, the day's end. "{n}" is the count.
TALLY = {
    "boards": ["d2", "d3", "d4", "d5~1", "d5~2", "d5~3", "d6~1", "d6~2", "d6~3", "d7~1"],
    "at": "d8",
    "title": ["The Day's End", "一日已尽"],
    "none": ["All day long, no one smiled behind a sleeve at her.", "这一日，竟没有一个人掩口笑她。"],
    "some": ["{n} times today, someone smiled behind a sleeve.", "这一日，有{n}回，有人掩口笑她。"],
}

WORLD_HLM1 = _world()
