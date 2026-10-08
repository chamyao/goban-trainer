"""World 2 (Book 2): Hulao Pass, chapters 3-9, rewritten from scratch.

The design is in docs/book2/ (research.md, diaochan-arc.md). This file is a
DRAFT, not yet wired in: tk_story.py, tk_story_zh.py and tk_places.py still
load the old tk_story_w2.py, so the shipped game keeps working. When the whole
book is ready, those three imports switch to this file (and to
tk_places_w2.py for the places) in one commit.

Check it on its own with:  python3 tools/check_story_w2_new.py

Written from the Chinese original (三国演义, 毛本), chapters 3-9. Lines follow
the novel's words wherever it has them; the English is plain and our own.
The helpers N, S and T write a line and register its Chinese in one go.
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
    """A title, objective, caption or other label, with its Chinese."""
    ZH2[en] = zh
    return en


def D(who, q, q_zh, open_, open_zh, win, win_zh, slip, slip_zh):
    """A decision board: the caption over the problem, and the decider's own lines on it."""
    return {"q": T(q, q_zh), "who": who, "open": T(open_, open_zh), "win": T(win, win_zh), "slip": T(slip, slip_zh)}


# Voices for the people Book 2 adds (Kokoro Mandarin ids). Book 1's cast
# (caocao, dongzhuo, luzhi, huangfusong, ...) keeps its voices from tk_story_zh.CAST.
CAST2 = {
    "wangyun": "zm_010", "diaochan": "zf_044", "lvbu": "zm_097", "liru": "zm_012", "lisu": "zm_015",
    "zhangwen": "zm_020", "shisunrui": "zm_031", "huangwan": "zm_035", "dongmu": "zf_022",
    "caiyong": "zm_091", "mamidi": "zm_037", "lijue": "zm_058", "guosi": "zm_061", "jiaxu": "zm_050",
    "xiandi": "zf_002", "chenliu": "zf_002", "niufu": "zm_054", "huchier": "zm_056", "daoren": "zm_080",
    # the Cao Cao arc (chapters 3-4)
    "hejin": "zm_066", "yuanshao": "zm_031", "chenlin": "zm_064", "cuiyi": "zm_100", "dingyuan": "zm_045",
    "dingguan": "zm_011", "wufu": "zm_041", "chengong": "zm_062", "lvboshe": "zm_014", "weihong": "zm_057",
    "xiahoudun": "zm_016",
}


# ---------------------------------------------------------------- Act III: the chain (chapters 8-9)
# Beat keys follow the Shared keys table in docs/book2/diaochan-arc.md.

def _scenes_chain():
    return {
        # A1 · Wang Yun watches. No board: there is nothing he can do yet.
        "a1": {"title": T("The Roadside Banquet", "横门设宴"), "kind": "main", "steps": [
            ["party", ["wangyun"]],
            ["army", "officials", "f_official", 6, "a1", -6, 10],
            ["spawn", "dz", "dongzhuo", "a1", 22, 0],
            ["prop", "tbl", "table", "a1", 16, 0], ["prop", "jars", "winejars", "a1", 26, 6],
            N("Dong Zhuo now calls himself Honoured Father, and comes and goes with an emperor's regalia. "
              "Whenever he leaves Chang'an by the Heng Gate, every minister must line the road to see him off.",
              "董卓自号为尚父，出入僭天子仪仗。卓往来长安，公卿皆候送于横门外。"),
            N("Today he has a tent pitched by the road, and keeps them all to drink.", "这一日，卓于路旁设帐，留百官聚饮。"),
            ["army", "prisoners", "f_soldier", 5, "a1", 34, 12],
            ["still", "dz_roadside", "slow pull back"],
            N("A few hundred surrendered soldiers arrive from the north. Dong Zhuo has them brought before the tables.",
              "适北地招安降卒数百人到。卓即命带至座前。"),
            ["mood", "dark"],
            N("What is done to them there, the ministers will never forget. The screams shake the sky.",
              "座前之事，百官终身难忘。哀号之声震天。"),
            ["remove", "prisoners"],
            ["emote", "officials", "sweat"],
            N("The ministers shake so that their chopsticks fall from their hands. "
              "Dong Zhuo eats and drinks, talks and laughs, as if nothing were happening.",
              "百官战栗失箸，卓饮食谈笑自若。"),
            ["mood", "clear"],
            ["wait", 900],
            N("On another day, Dong Zhuo gathers all the officials in the Secretariat. "
              "After a few rounds of wine, Lü Bu walks straight in and whispers a few words in his ear.",
              "又一日，卓于省台大会百官，列坐两行。酒至数巡，吕布径入，向卓耳边言不数句。"),
            ["spawn", "lb", "lvbu", "a1", 40, -4],
            ["run", "lb", "a1", 24, -2],
            S("dongzhuo", "So that's how it is.", "原来如此。"),
            ["spawn", "zw", "zhangwen", "a1", 2, 6],
            N("At his word, Lü Bu seizes the Minister of Works, Zhang Wen, at his table and drags him out of the hall.",
              "命吕布于筵上揪司空张温下堂。"),
            ["run", "lb", "a1", 4, 6],
            ["move", "zw", "a1", 44, 14], ["move", "lb", "a1", 44, 10],
            ["remove", "zw"],
            ["emote", "officials", "!"],
            ["still", "dz_redtray", "slow zoom in"],
            N("A little later an attendant carries in a red tray. On it is Zhang Wen's head. "
              "The officials' souls all but leave their bodies.",
              "不多时，侍从将一红盘，托张温头入献。百官魂不附体。"),
            S("dongzhuo", "Don't be alarmed, gentlemen. Zhang Wen was plotting with Yuan Shu to do away with me. "
              "The letter Yuan Shu sent him went by mistake to my son Fengxian, so I had him beheaded. "
              "You have done nothing. You have nothing to fear.",
              "诸公勿惊。张温结连袁术，欲图害我。因使人寄书来，错下在吾儿奉先处，故斩之。公等无故，不必惊畏。"),
            N("The officials murmur assent and scatter.", "众官唯唯而散。"),
            N("Wang Yun, Minister of the Interior, goes home turning the day over and over, and cannot sit still.",
              "司徒王允归到府中，寻思今日席间之事，坐不安席。"),
        ]},

        # A2 · The peony pavilion. The board is Wang Yun deciding to stake his house on her.
        "a2": {"title": T("The Peony Pavilion", "牡丹亭"), "kind": "main", "steps": [
            ["light", "night"],
            ["prop", "bench", "bench", "a2", 14, -4],
            ["spawn", "dc", "diaochan", "a2", 14, -4], ["pose", "dc", "sit"],
            N("Late at night, under a bright moon, Wang Yun walks into the rear garden leaning on his staff. "
              "He stands by the rose trellis, looks up at the sky, and weeps.",
              "至夜深月明，王允策杖步入后园，立于荼蘼架侧，仰天垂泪。"),
            N("Then he hears someone sighing by the peony pavilion. He steps softly closer to look. "
              "It is Diaochan, the singing girl of his household.",
              "忽闻有人在牡丹亭畔，长吁短叹。允潜步窥之，乃府中歌伎貂蝉也。"),
            ["emote", "dc", "..."],
            ["still", "dc_garden", "slow zoom in"],
            N("She was chosen as a small girl and brought up in his house, and taught to sing and dance. "
              "She is sixteen, as gifted as she is beautiful, and Wang Yun treats her as his own daughter.",
              "其女自幼选入府中，教以歌舞，年方二八，色伎俱佳，允以亲女待之。"),
            ["move", "wangyun", "a2", 8, -2],
            ["emote", "dc", "!"],
            S("wangyun", "Shameless girl! Are you meeting a lover?", "贱人将有私情耶？"),
            ["pose", "dc", "kneel"],
            N("Startled, she drops to her knees to answer.", "貂蝉惊跪答曰："),
            S("diaochan", "How would your servant dare have a lover!", "贱妾安敢有私！"),
            S("wangyun", "Then why are you sighing so late at night?", "无私，何夜深长叹？"),
            S("diaochan", "Let me tell you what is in my heart.", "容妾伸肺腑之言。"),
            S("wangyun", "Hide nothing. Tell me the truth.", "汝勿隐匿，当实告我。"),
            S("diaochan", "You raised me, had me taught to sing and dance, and treated me with kindness. "
              "If I were ground to dust I could not repay a ten-thousandth of it. "
              "Lately I have seen your brows knotted with worry. It must be some great matter of state, but I did not dare ask. "
              "Tonight I saw you could not sit still, and so I sighed. I never thought you would see me. "
              "If there is any use for me, I would not refuse ten thousand deaths.",
              "妾蒙大人恩养，训习歌舞，优礼相待，妾虽粉身碎骨，莫报万一。近见大人两眉愁锁，必有国家大事，又不敢问。"
              "今晚又见行坐不安，因此长叹；不想为大人窥见。倘有用妾之处，万死不辞。"),
            ["fx", "dust", "a2", 8, -2],
            N("Wang Yun strikes the ground with his staff.", "允以杖击地。"),
            S("wangyun", "Who would have thought the empire of the Han lies in your hands! Come with me to the painted pavilion.",
              "谁想汉天下却在汝手中耶！随我到画阁中来。"),
            ["pose", "dc", "stand"],
            ["move", "dc", "a2", -6, -10], ["move", "wangyun", "a2", -10, -10],
            N("In the pavilion he sends every maid away, seats Diaochan, and knocks his head on the floor before her.",
              "允尽叱出婢妾，纳貂蝉于坐，叩头便拜。"),
            ["pose", "wangyun", "kneel"],
            ["still", "dc_wangkneels", "slow pull back"],
            S("diaochan", "My lord, why are you doing this?", "大人何故如此？"),
            S("wangyun", "Have pity on the people of the Han!", "汝可怜大汉天下生灵！"),
            N("And his tears pour out like a spring.", "言讫，泪如泉涌。"),
            S("diaochan", "I said it a moment ago. Whatever you command, I would not refuse ten thousand deaths.",
              "适间贱妾曾言：但有使令，万死不辞。"),
            S("wangyun", "The people hang upside down, and the court is a stack of eggs about to fall. "
              "No one but you can save them. The traitor Dong Zhuo means to take the throne, "
              "and no one at court, soldier or scholar, has a plan. He has an adopted son named Lü Bu, brave beyond all others. "
              "I see that both of them are lovers of women. So I will use a chain of schemes. "
              "First I promise you to Lü Bu, then I give you to Dong Zhuo. You work between them and turn father against son, "
              "until Lü Bu kills Dong Zhuo and puts an end to this great evil. "
              "If the dynasty stands again, it will be your doing. What do you say?",
              "百姓有倒悬之危，君臣有累卵之急，非汝不能救也。贼臣董卓，将欲篡位；朝中文武，无计可施。"
              "董卓有一义儿，姓吕，名布，骁勇异常。我看二人皆好色之徒，今欲用连环计：先将汝许嫁吕布，后献与董卓；"
              "汝于中取便，谋间他父子反颜，令布杀卓，以绝大恶。重扶社稷，再立江山，皆汝之力也。不知汝意若何？"),
            S("diaochan", "I promised you I would not refuse ten thousand deaths. Give me to them at once. I know what to do.",
              "妾许大人万死不辞，望即献妾与彼。妾自有道理。"),
            S("wangyun", "If this ever leaks, my whole family will be wiped out.", "事若泄漏，我灭门矣。"),
            ["problem"],  # Wang Yun stakes his house on her
            S("diaochan", "Do not worry, my lord. If I fail this great cause, let me die under ten thousand blades.",
              "大人勿忧。妾若不报大义，死于万刃之下。"),
            N("Wang Yun bows to her and thanks her.", "王允拜谢。"),
            N("The first link of the chain is Lü Bu himself. He cannot simply be invited: a minister who sends for the Grand Preceptor's general "
              "will be watched, after Zhang Wen. But a gift he must come to give thanks for will bring him to the house of his own accord.",
              "连环第一环，便是吕布。不可径直相请：张温之事在前，司徒召见太师之将，必遭疑忌。唯有送一件他必亲来致谢的厚礼，方能教他自己登门。"),
            S("wangyun", "The family pearls. Set in gold, as a crown for a hero. He'll come to thank me himself, and then he will see her.",
              "家藏明珠，嵌成金冠，赠与英雄。他必亲来致谢，那时便教他见着她。"),
            ["light", "dawn", 2500],
            N("At first light, Wang Yun sends for his old steward.", "天色微明，王允唤来老管家。"),
        ]},

        # A3 · The gold crown. Legwork: the board comes first (slipping it past Dong Zhuo's men), then the scene.
        "a3": {"title": T("The Gold Crown", "金冠"), "kind": "main", "steps": [
            ["problem"],  # getting it to Lü Bu's door without the Chancellor's men seeing
            ["spawn", "lb", "lvbu", "a3", 18, 0],
            N("Wang Yun's man leaves the box at Lü Bu's door without a word. Inside is a gold crown, set with pearls from Wang Yun's own house.",
              "王允使人将金冠密送吕布。冠上所嵌，乃王家所藏明珠。"),
            ["pose", "lb", "raise"],
            N("Lü Bu is delighted, and comes in person to Wang Yun's house to thank him.", "布大喜，亲到王允宅致谢。"),
        ]},
        "a3_wait": {"title": T("Not Yet", "尚未齐备"), "kind": "main", "steps": [
            S("wangyun", "Not yet. The crown has to be made first.", "且慢。须先造成金冠。"),
        ]},

        # A4 · The first banquet. Diaochan walks in, and from here the player is Diaochan.
        "a4": {"title": T("The First Banquet", "初宴吕布"), "kind": "main", "steps": [
            ["spawn", "lb", "lvbu", "a4", 30, 0],
            ["prop", "tbl", "table", "a4", 14, 0],
            ["move", "lb", "a4", 18, 0],
            N("Wang Yun has laid out the finest food. He goes out to the gate to welcome Lü Bu, leads him to the rear hall, and seats him in the place of honour.",
              "允预备嘉肴美馔；候吕布至，允出门迎迓，接入后堂，延之上坐。"),
            S("lvbu", "I am only a general in the Chancellor's household, and you are a great minister of the court. Why do you honour me like this?",
              "吕布乃相府一将，司徒是朝廷大臣，何故错敬？"),
            S("wangyun", "In all the world today there is no hero but you, General. I honour not your rank, but your talent.",
              "方今天下别无英雄，惟有将军耳。允非敬将军之职，敬将军之才也。"),
            ["pose", "lb", "drink"],
            N("Lü Bu is delighted. Wang Yun pours for him again and again, praising the Grand Preceptor's virtue and Lü Bu's without end, "
              "and Lü Bu laughs and drinks deep.",
              "布大喜。允殷勤敬酒，口称董太师并布之德不绝。布大笑畅饮。"),
            N("Wang Yun sends the attendants out, keeping only a few serving girls to pour. When the wine is half drunk, he says:",
              "允叱退左右，只留侍妾数人劝酒。酒至半酣，允曰："),
            S("wangyun", "Call my daughter in.", "唤孩儿来。"),
            ["spawn", "dc", "diaochan", "a4", -14, -6],
            ["move", "dc", "a4", 8, -4],
            N("Two maids in blue lead Diaochan out, dressed in all her finery.", "少顷，二青衣引貂蝉艳妆而出。"),
            ["emote", "lb", "!"],
            S("lvbu", "Who is this?", "此是何人？"),
            S("wangyun", "My daughter, Diaochan. You honour me with your friendship, General, as if we were family, so I let her meet you.",
              "小女貂蝉也。允蒙将军错爱，不异至亲，故令其与将军相见。"),
            ["still", "dc_wine", "slow zoom in"],
            N("He tells Diaochan to pour for Lü Bu. As she hands him the cup, their eyes meet, and meet again.",
              "便命貂蝉与吕布把盏。貂蝉送酒与布，两下眉来眼去。"),
            ["problem"],  # Diaochan: win him
            N("Wang Yun pretends to be drunk.", "允佯醉。"),
            S("wangyun", "My child, beg the general to drink a few more cups. Our whole family depends on him.",
              "孩儿央及将军痛饮几杯。吾一家全靠着将军哩。"),
            N("Lü Bu asks Diaochan to sit. She makes as if to go back inside.", "布请貂蝉坐，貂蝉假意欲入。"),
            S("wangyun", "The general is my dearest friend. What harm in sitting, child?", "将军吾之至友，孩儿便坐何妨？"),
            ["pose", "dc", "sit"],
            N("Diaochan sits at Wang Yun's side. Lü Bu cannot take his eyes off her.", "貂蝉便坐于允侧。吕布目不转睛的看。"),
            S("wangyun", "I would give this girl to you as a concubine. Will you have her?", "吾欲将此女送与将军为妾，还肯纳否？"),
            ["pose", "lb", "bow"],
            S("lvbu", "If you do, I will serve you like a dog or a horse.", "若得如此，布当效犬马之报。"),
            S("wangyun", "I'll choose a lucky day soon, and send her to your house.", "早晚选一良辰，送至府中。"),
            N("Lü Bu is overjoyed, and keeps looking at Diaochan. And Diaochan answers him with glances like autumn water.",
              "布欣喜无限，频以目视貂蝉。貂蝉亦以秋波送情。"),
            S("wangyun", "I would ask you to stay the night, but the Grand Preceptor might suspect something.",
              "本欲留将军止宿，恐太师见疑。"),
            N("Lü Bu bows his thanks again and again, and goes.", "布再三拜谢而去。"),
            ["remove", "lb"],
            ["remove", "dc"],
            ["party", ["diaochan"]],
        ]},

        # A5 · The second banquet. Diaochan's dance; the board is her making Dong Zhuo take her.
        "a5": {"title": T("The Dance Behind the Curtain", "帘外之舞"), "kind": "main", "steps": [
            N("A few days later, at court, Wang Yun waits until Lü Bu is away from Dong Zhuo's side, "
              "then kneels and invites the Grand Preceptor to dine at his house.",
              "过了数日，王允在朝堂，见了董卓，趁吕布不在侧，伏地拜请太师到草舍赴宴。"),
            ["army", "guards", "f_soldier", 8, "a5", 30, 0],
            ["spawn", "dz", "dongzhuo", "a5", 34, 0],
            ["move", "guards", "a5", 18, 0], ["move", "dz", "a5", 14, 0],
            N("At noon the next day Dong Zhuo arrives. More than a hundred armoured men with halberds crowd into the hall around him and line both sides.",
              "次日晌午，董卓来到。左右持戟甲士百余，簇拥入堂，分列两旁。"),
            S("wangyun", "Your virtue towers over the world, Grand Preceptor. Not even Yi Yin or the Duke of Zhou could match you.",
              "太师盛德巍巍，伊、周不能及也。"),
            ["light", "dusk"],
            N("Toward evening, deep in wine, Wang Yun invites him into the rear hall, and Dong Zhuo sends his guards out.",
              "天晚酒酣，允请卓入后堂。卓叱退甲士。"),
            ["remove", "guards"],
            S("wangyun", "Since my youth I have studied the heavens. Watching the sky at night, I see that the Han's fortune is spent. "
              "Your merit shakes the world. As Shun received the throne from Yao, and Yu succeeded Shun, so it should be with you. "
              "That is the will of Heaven and of men.",
              "允自幼颇习天文，夜观乾象，汉家气数已尽。太师功德振于天下，若舜之受尧，禹之继舜，正合天心人意。"),
            S("dongzhuo", "How could I hope for that!", "安敢望此！"),
            S("wangyun", "Since ancient times, the righteous overthrow the unrighteous, and those without virtue yield to those with it. Would it be too much?",
              "自古“有道伐无道，无德让有德”，岂过分乎？"),
            S("dongzhuo", "If Heaven's mandate truly comes to me, you shall be first among my ministers.", "若果天命归我，司徒当为元勋。"),
            ["light", "night"],
            N("Painted candles are lit in the hall.", "堂中点上画烛。"),
            S("wangyun", "The court musicians are not fit to serve you. But I happen to have a singing girl of my own. Let her perform.",
              "教坊之乐，不足供奉；偶有家伎，敢使承应。"),
            S("dongzhuo", "Wonderful.", "甚妙。"),
            ["prop", "curtain", "curtain", "a5", 4, 0],
            ["pose", "diaochan", "dance"],
            ["still", "dc_dance", "slow pan across"],
            N("The bead curtain is let down. To the sound of reed pipes, Diaochan dances on the far side of it.",
              "允教放下帘栊，笙簧缭绕，簇捧貂蝉舞于帘外。"),
            ["problem"],  # Diaochan: make him take me
            ["pose", "diaochan", "stand"],
            N("When the dance is over, Dong Zhuo calls her closer. She comes in through the curtain and bows deeply.",
              "舞罢，卓命近前。貂蝉转入帘内，深深再拜。"),
            ["move", "diaochan", "a5", 8, 0], ["pose", "diaochan", "bow"],
            S("dongzhuo", "Who is this girl?", "此女何人？"),
            S("wangyun", "Diaochan, a singing girl.", "歌伎貂蝉也。"),
            S("dongzhuo", "Can she sing?", "能唱否？"),
            N("Wang Yun has her sing softly to the clappers. A later poet wrote of that song: "
              "Her cherry lips part; two rows of broken jade breathe out the spring. "
              "From her clove-sweet tongue a steel sword lies across, to cut down the traitor who wrecks the realm.",
              "允命貂蝉檀板低讴一曲。正是：一点樱桃启绛唇，两行碎玉喷阳春。丁香舌吐横钢剑，要斩奸邪乱国臣。"),
            S("dongzhuo", "How old are you?", "青春几何？"),
            S("diaochan", "Your servant is just sixteen.", "贱妾年方二八。"),
            S("dongzhuo", "Truly one of the immortals!", "真神仙中人也！"),
            S("wangyun", "I would give this girl to you, Grand Preceptor, if you will have her.", "允欲将此女献上太师，未审肯容纳否？"),
            S("dongzhuo", "Such a gift! How can I repay you?", "如此见惠，何以报德？"),
            S("wangyun", "To serve you is more good fortune than she deserves.", "此女得侍太师，其福太浅。"),
            ["prop", "car", "carriage", "a5", -12, 8],
            ["board", "diaochan", "car"],
            N("Wang Yun has a felt-covered carriage made ready, and sends Diaochan ahead to the Chancellor's residence.",
              "允即命备毡车，先将貂蝉送到相府。"),
            ["move", "car", "a5", -40, 8],
            ["remove", "car"],
            ["party", ["wangyun"], {"to": "a6"}],
        ]},

        # A6 · Red lanterns on the road. Wang Yun's lie under Lü Bu's hand.
        "a6": {"title": T("Red Lanterns", "红灯照道"), "kind": "main", "steps": [
            ["light", "night"],
            N("Wang Yun escorts Dong Zhuo all the way to the Chancellor's residence, then rides home. "
              "He is not halfway there when two rows of red lanterns light up the road. Lü Bu is riding toward him, halberd in hand.",
              "允亲送董卓直到相府，然后辞回。乘马而行，不到半路，只见两行红灯照道，吕布骑马执戟而来。"),
            ["spawn", "lb", "lvbu", "a6", 36, 0],
            ["run", "lb", "a6", 6, 0],
            ["emote", "lb", "anger"],
            ["still", "dc_lanterns", "slow zoom in"],
            N("He reins in, and seizes Wang Yun by the collar.", "便勒住马，一把揪住衣襟。"),
            S("lvbu", "You promised Diaochan to me, Minister, and now you send her to the Grand Preceptor. Are you making a fool of me?",
              "司徒既以貂蝉许我，今又送与太师，何相戏耶？"),
            S("wangyun", "This is no place to talk. Come to my house.", "此非说话处，且请到草舍去。"),
            ["wait", 700],
            N("At Wang Yun's house they go into the rear hall and exchange greetings.", "布同允到家，下马入后堂。叙礼毕。"),
            S("wangyun", "Why are you angry with me, General?", "将军何故怪老夫？"),
            S("lvbu", "Someone told me you sent Diaochan to the Chancellor's residence in a felt carriage. Why?",
              "有人报我，说你把毡车送貂蝉入相府，是何缘故？"),
            ["problem"],  # Wang Yun: the lie, with Lü Bu's hand still on him
            S("wangyun", "You didn't know? Yesterday at court the Grand Preceptor said to me: 'There's something I want to see you about at your house.' "
              "So I made ready and waited for him. Over the wine he said: 'I hear you have a daughter called Diaochan, promised to my son Fengxian. "
              "I was afraid you hadn't meant it, so I came to ask for her myself, and to see her.' "
              "I didn't dare refuse, and brought her out to bow to her father-in-law. Then he said: "
              "'Today is a lucky day. I'll take her home with me now, and give her to Fengxian.' "
              "Think about it, General. With the Grand Preceptor here in person, how could I have refused?",
              "将军原来不知！昨日太师在朝堂中，对老夫说：“我有一事，要到你家。”允因此准备，等候太师。饮酒中间说："
              "“我闻你有一女，名唤貂蝉，已许吾儿奉先。我恐你言未准，特来相求，并请一见。”老夫不敢有违，随引貂蝉出拜公公。"
              "太师曰：“今日良辰，吾即当取此女回去，配与奉先。”将军试思，太师亲临，老夫焉敢推阻？"),
            ["emote", "lb", "sweat"],
            S("lvbu", "Forgive me, Minister. I misjudged you. Tomorrow I'll come with thorns on my back to beg your pardon.",
              "司徒少罪。布一时错见，来日自当负荆。"),
            S("wangyun", "My daughter has a few things for her trousseau. When she goes to your house, I'll send them along.",
              "小女稍有妆奁，待过将军府下，便当送至。"),
            N("Lü Bu thanks him and goes.", "布谢去。"),
            ["remove", "lb"],
            ["party", ["diaochan"], {"to": "a7"}],
        ]},

        # A7 · The window. Diaochan acts grief for the face in the pond.
        "a7": {"title": T("The Face in the Pond", "池中人影"), "kind": "main", "steps": [
            N("The next day Lü Bu asks all through the Chancellor's residence, and hears nothing of her. "
              "He goes straight into the hall and questions the maids.",
              "次日，吕布在府中打听，绝不闻音耗。布径入堂中，寻问诸侍妾。"),
            N("Last night, they tell him, the Grand Preceptor slept with his new lady, and he isn't up yet.",
              "侍妾对曰：“夜来太师与新人共寝，至今未起。”"),
            N("Lü Bu is furious. He creeps round behind Dong Zhuo's bedroom to look in.", "布大怒，潜入卓卧房后窥探。"),
            ["spawn", "lb", "lvbu", "a7", 14, 10],
            ["still", "dc_window", "slow zoom in"],
            N("Diaochan has just risen, and is combing her hair at the window. Suddenly she sees a shadow in the pond outside: "
              "a very tall man in a hair-binding cap. She steals a glance. It is Lü Bu.",
              "时貂蝉起于窗下梳头；忽见窗外池中照一人影，极长大，头戴束发冠；偷眼视之，正是吕布。"),
            ["problem"],  # Diaochan: act grief, and make him believe it
            ["emote", "diaochan", "..."],
            N("She knits her brows on purpose and puts on a look of sorrow, and dabs her eyes again and again with a perfumed handkerchief.",
              "貂蝉故蹙双眉，做忧愁不乐之态，复以香罗频拭眼泪。"),
            N("Lü Bu watches a long while, and goes. A little later he comes back in.", "吕布窥视良久，乃出；少顷，又入。"),
        ]},
        # A7c · The curtain. No board: the map's sight puzzle is the play (stand where Lü Bu sees you and Dong Zhuo doesn't, 露半面).
        "a7c": {"title": T("Half a Face", "微露半面"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a7c", 24, 0],
            ["move", "lb", "a7c", 20, 4],
            S("dongzhuo", "All quiet outside?", "外面无事乎？"),
            S("lvbu", "All quiet.", "无事。"),
            N("He stands at Dong Zhuo's side while he eats, stealing glances. Behind the embroidered curtain a woman comes and goes, "
              "showing half her face, and sends him a look. Lü Bu knows it is Diaochan, and his soul drifts out of him.",
              "侍立卓侧。卓方食，布偷目窃望，见绣帘内一女子往来观觑，微露半面，以目送情。布知是貂蝉，神魂飘荡。"),
            ["emote", "dz", "..."],
            S("dongzhuo", "Fengxian, if there's nothing else, go.", "奉先无事且退。"),
            N("Lü Bu goes out, sullen.", "布怏怏而出。"),
            ["remove", "lb"],
        ]},

        # A8 · The sickbed. Her signal; he wakes anyway (the board is hers, the novel decides the rest).
        "a8": {"title": T("Behind the Sickbed", "床后指心"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a8", 10, 0], ["pose", "dz", "sleep"],
            N("From the day he takes Diaochan, Dong Zhuo is so bewitched that for a month and more he does not see to affairs of state.",
              "董卓自纳貂蝉后，为色所迷，月余不出理事。"),
            N("He falls a little ill. Diaochan nurses him without ever loosening her sash, and humours his every wish, and he loves her more and more.",
              "卓偶染小疾，貂蝉衣不解带，曲意逢迎，卓心愈喜。"),
            ["spawn", "lb", "lvbu", "a8", -14, 0], ["move", "lb", "a8", -2, 0],
            N("Lü Bu comes in to ask after him. Dong Zhuo is asleep.", "吕布入内问安，正值卓睡。"),
            ["problem"],  # Diaochan: reach him without waking the man between them
            ["still", "dc_sickbed", "slow zoom in"],
            N("From behind the bed, Diaochan leans out to look at Lü Bu. She points to her heart, then points at Dong Zhuo, "
              "and her tears will not stop. Lü Bu's heart breaks.",
              "貂蝉于床后探半身望布，以手指心，又以手指董卓，挥泪不止。布心如碎。"),
            ["pose", "dz", "stand"],
            N("Dong Zhuo, eyes half open, sees Lü Bu staring fixedly behind the bed. He turns, and sees Diaochan standing there.",
              "卓朦胧双目，见布注视床后，目不转睛；回身一看，见貂蝉立于床后。"),
            ["emote", "dz", "anger"],
            S("dongzhuo", "You dare toy with my favourite! Guards, throw him out. He is never to set foot in this hall again.",
              "汝敢戏吾爱姬耶！唤左右逐出，今后不许入堂。"),
            ["run", "lb", "a8", -40, 0], ["remove", "lb"],
            N("Lü Bu goes home in fury. On the road he meets Li Ru, and tells him why. Li Ru hurries in to Dong Zhuo.",
              "吕布怒恨而归，路遇李儒，告知其故。儒急入见卓。"),
            ["spawn", "lr", "liru", "a8", -12, 2], ["move", "lr", "a8", 2, 2],
            S("liru", "Grand Preceptor, you mean to take the empire. Why punish the Marquis for a small fault? If his heart turns, the great cause is lost.",
              "太师欲取天下，何故以小过见责温侯？倘彼心变，大事去矣。"),
            S("dongzhuo", "Then what should I do?", "奈何？"),
            S("liru", "Call him in tomorrow, give him gold and silk, and speak kindly to him. That will be the end of it.",
              "来朝唤入，赐以金帛，好言慰之，自然无事。"),
            ["remove", "lr"],
            N("Dong Zhuo does as he says. The next day he calls Lü Bu in.", "卓依言。次日，使人唤布入堂。"),
            S("dongzhuo", "I was ill the other day and not myself, and I said hurtful things. Don't take them to heart.",
              "吾前日病中，心神恍惚，误言伤汝，汝勿记心。"),
            N("He gives him ten jin of gold and twenty bolts of brocade. Lü Bu thanks him and goes. "
              "But though his body stays at Dong Zhuo's side, his heart is with Diaochan.",
              "随赐金十斤，锦二十疋。布谢归；然身虽在卓左右，心实系念貂蝉。"),
        ]},

        # A9 · The Phoenix Pavilion. Three boards, at the novel's three turns.
        "a9": {"title": T("The Phoenix Pavilion", "凤仪亭"), "kind": "main", "steps": [
            N("When Dong Zhuo is well, he goes to court, with Lü Bu behind him holding his halberd. "
              "Seeing Dong Zhuo deep in talk with the Emperor, Lü Bu slips out of the inner gate, mounts, and rides straight to the Chancellor's residence. "
              "He ties his horse at the gate and goes into the rear hall to find Diaochan.",
              "卓疾既愈，入朝议事。布执戟相随，见卓与献帝共谈，便乘间提戟出内门，上马径投相府来；系马府前，提戟入后堂，寻见貂蝉。"),
            ["spawn", "lb", "lvbu", "a9", 30, 0],
            S("diaochan", "Go and wait for me by the Phoenix Pavilion in the rear garden.", "汝可去后园中凤仪亭边等我。"),
            ["move", "lb", "a9", 14, -6],
            N("Lü Bu goes, and stands below the pavilion by the winding rail. After a long while Diaochan comes, "
              "parting the flowers and brushing aside the willows, like a fairy from the palace of the moon.",
              "布提戟径往，立于亭下曲栏之傍。良久，貂蝉分花拂柳而来，果然如月宫仙子。"),
            ["fx", "petals", "a9", 6, -4],
            ["move", "diaochan", "a9", 10, -6],
            ["problem"],  # 1: make him believe her
            S("diaochan", "I am not Minister Wang's own daughter, but he treats me as if I were. "
              "From the day I met you and was promised to you, I had all I ever wished for. "
              "Who would have thought the Grand Preceptor would turn his wicked heart on me, and defile me? "
              "I wanted to die at once. I only bore the shame and lived on because I had not said goodbye to you. "
              "Now I have seen you, and my wish is fulfilled. This body is soiled. It can never serve a hero now. "
              "Let me die before your eyes, to show you my heart!",
              "我虽非王司徒亲女，然待之如己出。自见将军，许侍箕帚，妾已生平愿足；谁想太师起不良之心，将妾淫污。"
              "妾恨不即死；止因未与将军一诀，故且忍辱偷生。今幸得见，妾愿毕矣。此身已污，不得复事英雄；愿死于君前，以明妾志！"),
            ["run", "diaochan", "a9", 6, 6],
            ["run", "lb", "a9", 8, 4],
            ["still", "dc_pavilion", "slow zoom in"],
            N("She grips the winding rail and makes to leap into the lotus pond. Lü Bu catches her in his arms.",
              "言讫，手攀曲栏，望荷花池便跳。吕布慌忙抱住。"),
            S("lvbu", "I've known your heart a long time! I only hated that we could never speak!", "我知汝心久矣！只恨不能共语！"),
            S("diaochan", "If I cannot be your wife in this life, let us meet in the next.", "妾今生不能与君为妻，愿相期于来世。"),
            S("lvbu", "If I can't make you my wife in this life, I am no hero!", "我今生不能以汝为妻，非英雄也！"),
            S("diaochan", "Every day is a year to me. Pity me, and save me.", "妾度日如年，愿君怜而救之。"),
            S("lvbu", "I stole away to come here. The old traitor will suspect me. I have to go.", "我今偷空而来，恐老贼见疑，必当速去。"),
            ["problem"],  # 2: keep him from leaving
            N("Diaochan holds him by the sleeve.", "貂蝉牵其衣。"),
            S("diaochan", "If you fear the old traitor so much, I will never see the light of day!", "君如此惧怕老贼，妾身无见天日之期矣！"),
            S("lvbu", "Let me take time, and think of a good plan.", "容我徐图良策。"),
            N("He takes up his halberd to go.", "语罢，提戟欲去。"),
            ["problem"],  # 3: the taunt that holds him
            S("diaochan", "In the inner rooms I heard your name like thunder in my ears, and thought you the one man of this age. "
              "Who would have thought you take orders from another man!",
              "妾在深闺，闻将军之名，如雷灌耳，以为当世一人而已；谁想反受他人之制乎！"),
            N("Her tears fall like rain. Lü Bu's face burns with shame. He leans his halberd on the rail again, turns, and holds her, "
              "comforting her with tender words. They cling together, and cannot bear to part.",
              "言讫，泪下如雨。布羞惭满面，重复倚戟，回身搂抱貂蝉，用好言安慰。两个偎偎倚倚，不忍相离。"),
            ["wait", 900],
            N("In the palace hall, Dong Zhuo turns his head and Lü Bu is gone. Uneasy, he takes leave of the Emperor and rides home. "
              "He sees Lü Bu's horse tied at the gate. The gatekeeper says the Marquis went into the rear hall.",
              "却说董卓在殿上，回头不见吕布，心中怀疑，连忙辞了献帝，登车回府；见布马系于府前；问门吏，吏答曰：“温侯入后堂去了。”"),
            ["spawn", "dz", "dongzhuo", "a9", -30, 0],
            N("He searches the rear hall and finds no one. He calls for Diaochan, and she is gone too. The maids say she is in the garden, looking at the flowers.",
              "卓叱退左右，径入后堂中，寻觅不见；唤貂蝉，蝉亦不见。急问侍妾，侍妾曰：“貂蝉在后园看花。”"),
            ["move", "dz", "a9", -8, 0],
            N("In the rear garden he finds them, talking under the Phoenix Pavilion, the painted halberd leaning to one side. Dong Zhuo gives a great roar.",
              "卓寻入后园，正见吕布和貂蝉在凤仪亭下共语，画戟倚在一边。卓怒，大喝一声。"),
            ["camera", "shake"], ["emote", "dz", "anger"],
            ["run", "lb", "a9", 40, -10],
            ["run", "dz", "a9", 14, -6],
            ["still", "dc_halberd", "pan across"],
            N("Lü Bu sees him and runs. Dong Zhuo snatches up the halberd and comes after him. Lü Bu is fast, and Dong Zhuo is too fat to catch him. "
              "He hurls the halberd. Lü Bu knocks it to the ground.",
              "布见卓至，大惊，回身便走。卓抢了画戟，挺着赶来。吕布走得快，卓肥胖赶不上，掷戟刺布。布打戟落地。"),
            ["remove", "lb"],
            ["fx", "flash", "a9", 30, -8],
            ["spawn", "lr", "liru", "a9", 40, 0],
            ["run", "dz", "a9", 30, 0], ["run", "lr", "a9", 32, 0],
            ["camera", "shake"],
            N("Dong Zhuo picks it up and runs on, but Lü Bu is far away. As he charges out of the garden gate, "
              "a man running the other way crashes into his chest, and Dong Zhuo goes down in a heap.",
              "卓拾戟再赶，布已走远。卓赶出园门，一人飞奔前来，与卓胸膛相撞，卓倒于地。"),
        ]},

        # A10 · The sword on the wall. Three boards: the lie, the blade, turning it on Li Ru.
        "a10": {"title": T("The Sword on the Wall", "壁间宝剑"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a10", 14, 0], ["spawn", "lr", "liru", "a10", 20, 2],
            N("The man was Li Ru. He helps Dong Zhuo up, and they sit down in the study.", "撞倒董卓的人，正是李儒。当下李儒扶起董卓，至书院中坐定。"),
            S("dongzhuo", "What are you doing here?", "汝为何来此？"),
            S("liru", "I had just reached the gate when I heard you'd gone raging into the garden after Lü Bu. I ran in and met him running out, "
              "crying, 'The Grand Preceptor is going to kill me!' I hurried into the garden to make peace, and knocked into you. I deserve death! I deserve death!",
              "儒适至府门，知太师怒入后园，寻问吕布。因急走来，正遇吕布奔出云：“太师杀我！”儒慌赶入园中劝解，不意误撞恩相。死罪！死罪！"),
            S("dongzhuo", "That treacherous wretch! Toying with my favourite! I swear I'll kill him!", "叵耐逆贼！戏吾爱姬，誓必杀之！"),
            S("liru", "You are wrong, my lord. Long ago, at the feast of the torn tassels, King Zhuang of Chu did not punish Jiang Xiong for toying with his favourite. "
              "Later, when the king was surrounded by the army of Qin, Jiang Xiong fought to the death to save him. "
              "Diaochan is only a woman, and Lü Bu is your most trusted general. If you take this chance and give her to him, "
              "he will be so grateful he will die for you. Please think it over.",
              "恩相差矣：昔楚庄王“绝缨”之会，不究戏爱姬之蒋雄，后为秦兵所困，得其死力相救。今貂蝉不过一女子，而吕布乃太师心腹猛将也。"
              "太师若就此机会，以蝉赐布，布感大恩，必以死报太师。太师请自三思。"),
            S("dongzhuo", "There's something in that. I'll think about it.", "汝言亦是，我当思之。"),
            N("Li Ru thanks him and goes. Dong Zhuo goes into the rear hall and calls for Diaochan.", "儒谢而出。卓入后堂，唤貂蝉。"),
            ["remove", "lr"],
            ["move", "diaochan", "a10", 6, 0],
            S("dongzhuo", "Why have you been carrying on with Lü Bu?", "汝何与吕布私通耶？"),
            ["problem"],  # 1: the lie
            N("Diaochan weeps.", "蝉泣曰："),
            S("diaochan", "I was looking at the flowers in the garden when Lü Bu came at me. I was frightened and tried to get away, and he said, "
              "'I'm the Grand Preceptor's son. Why hide from me?' He chased me with his halberd to the Phoenix Pavilion. "
              "I could see he meant me harm, and I was afraid he would force me, so I tried to drown myself in the lotus pond. "
              "But the brute caught hold of me. I was between life and death when you came and saved me.",
              "妾在后园看花，吕布突至。妾方惊避，布曰：“我乃太师之子，何必相避？”提戟赶妾至凤仪亭。妾见其心不良，恐为所逼，"
              "欲投荷池自尽，却被这厮抱住。正在生死之间，得太师来，救了性命。"),
            S("dongzhuo", "What if I give you to Lü Bu now?", "我今将汝赐与吕布，何如？"),
            ["emote", "diaochan", "!"],
            S("diaochan", "I already serve a great lord, and now you would hand me down to a household slave? I would rather die than be so shamed!",
              "妾身已事贵人，今忽欲下赐家奴，妾宁死不辱！"),
            ["problem"],  # 2: the blade at her own throat
            ["pose", "diaochan", "throat"],
            ["still", "dc_sword", "slow zoom in"],
            N("She snatches the sword from the wall and puts it to her own throat.", "遂掣壁间宝剑欲自刎。"),
            ["run", "dz", "a10", 8, 0],
            ["pose", "diaochan", "stand"],   # the blade is out of her hands
            N("Dong Zhuo wrenches the sword away and holds her.", "卓慌夺剑拥抱。"),
            S("dongzhuo", "I was only teasing you!", "吾戏汝！"),
            ["problem"],  # 3: turn it on Li Ru
            N("Diaochan falls into his arms, hides her face, and weeps aloud.", "貂蝉倒于卓怀，掩面大哭。"),
            S("diaochan", "This must be Li Ru's scheme! Li Ru and Lü Bu are close friends, so he thought this up, "
              "with no care for your honour or my life. I could eat his flesh raw!",
              "此必李儒之计也！儒与布交厚，故设此计；却不顾惜太师体面与贱妾性命。妾当生噬其肉！"),
            S("dongzhuo", "How could I bear to give you up?", "吾安忍舍汝耶？"),
            S("diaochan", "You love me, my lord. But I can't stay here long. Lü Bu will do me harm.", "虽蒙太师怜爱，但恐此处不宜久居，必被吕布所害。"),
            S("dongzhuo", "Tomorrow you and I go back to Meiwu, and enjoy ourselves there. Don't worry.", "吾明日和你归郿坞去，同受快乐，慎勿忧疑。"),
            N("Only then does Diaochan dry her tears and bow her thanks.", "蝉方收泪拜谢。"),
            ["wait", 700],
            ["spawn", "lr", "liru", "a10", 26, 2], ["move", "lr", "a10", 18, 2],
            S("liru", "Today is a lucky day. You can send Diaochan to Lü Bu.", "今日良辰，可将貂蝉送与吕布。"),
            S("dongzhuo", "Lü Bu and I are father and son. It wouldn't be fitting to give her to him. I won't punish him, that's all. "
              "Tell him so, and soothe him with kind words.",
              "布与我有父子之分，不便赐与。我只不究其罪。汝传我意，以好言慰之可也。"),
            S("liru", "Grand Preceptor, you must not let a woman bewitch you.", "太师不可为妇人所惑。"),
            ["emote", "dz", "anger"],
            S("dongzhuo", "Would you give your own wife to Lü Bu? Not another word about Diaochan, or I'll have your head!",
              "汝之妻肯与吕布否？貂蝉之事，再勿多言；言则必斩！"),
            ["move", "lr", "a10", 30, 6],
            N("Li Ru goes out, looks up at the sky, and sighs.", "李儒出，仰天叹曰："),
            S("liru", "We will all die at a woman's hand!", "吾等皆死于妇人之手矣！"),
            ["remove", "lr"],
            N("That same day Dong Zhuo orders the return to Meiwu, and all the officials bow him on his way.", "董卓即日下令还郿坞，百官俱拜送。"),
            ["prop", "car", "carriage", "a10", 0, 10],
            ["board", "diaochan", "car"],
            ["army", "crowd", "f_official", 6, "a10", -20, 14],
            ["spawn", "lb", "lvbu", "a10", -26, 10],
            ["still", "dc_carriage", "slow zoom in"],
            N("From the carriage, Diaochan sees Lü Bu far off in the crowd, gazing at it. She covers her face, as if weeping bitterly.",
              "貂蝉在车上，遥见吕布于稠人之内，眼望车中。貂蝉虚掩其面，如痛哭之状。"),
            ["move", "car", "a10", 50, 10],
            ["remove", "car"], ["remove", "crowd"], ["remove", "lb"],
            ["party", ["wangyun"], {"to": "a11"}],
        ]},

        # A11 · The ridge and the secret room. Three boards: the provocation, "you are a Lü", the choice.
        "a11": {"title": T("You Are a Lü, He Is a Dong", "将军自姓吕"), "kind": "main", "steps": [
            ["spawn", "lb", "lvbu", "a11", 10, -4],
            ["still", "lb_ridge", "slow pull back"],
            N("The carriage is far away. On an earthen ridge Lü Bu lets his horse walk, watching the dust of the carriage, sighing with grief and hatred.",
              "车已去远，布缓辔于土冈之上，眼望车尘，叹惜痛恨。"),
            N("Suddenly someone behind him speaks.", "忽闻背后一人问曰："),
            S("wangyun", "Marquis, why didn't you go with the Grand Preceptor? Why stand here gazing after him and sighing?",
              "温侯何不从太师去，乃在此遥望而发叹？"),
            S("wangyun", "I've been ill and kept to my house, so I haven't seen you in a long time. Today the Grand Preceptor goes back to Meiwu, "
              "so I dragged myself out to see him off, and how glad I am to meet you. But tell me, General, why do you sigh?",
              "老夫日来因染微恙，闭门不出，故久未得与将军一见。今日太师驾归郿坞，只得扶病出送，却喜得晤将军。请问将军，为何在此长叹？"),
            S("lvbu", "Because of your daughter.", "正为公女耳。"),
            N("Wang Yun pretends to be startled.", "允佯惊曰："),
            S("wangyun", "All this time, and he still hasn't given her to you?", "许多时尚未与将军耶？"),
            S("lvbu", "The old traitor has kept her for himself all this while!", "老贼自宠幸久矣！"),
            S("wangyun", "I can't believe it!", "不信有此事！"),
            N("Lü Bu tells him everything. Wang Yun looks up at the sky and stamps his foot, and for a long time says nothing.",
              "布将前事一一告允。允仰面跌足，半晌不语。"),
            S("wangyun", "I never thought the Grand Preceptor capable of such beastly conduct! Come to my house, and we'll talk.",
              "不意太师作此禽兽之行！且到寒舍商议。"),
            ["wait", 700],
            N("Wang Yun leads him into a secret room and sets out wine. Lü Bu tells him the whole story of the Phoenix Pavilion again.",
              "允延入密室，置酒款待。布又将凤仪亭相遇之事，细说一遍。"),
            ["problem"],  # 1: the provocation
            S("wangyun", "The Grand Preceptor has defiled my daughter and taken your wife. The whole world will laugh. Not at him: at you and me! "
              "But I'm old and useless, not worth speaking of. It's a pity that you, the greatest hero of the age, should suffer this shame too!",
              "太师淫吾之女，夺将军之妻，诚为天下耻笑——非笑太师，笑允与将军耳！然允老迈无能之辈，不足为道；可惜将军盖世英雄，亦受此污辱也！"),
            ["emote", "lb", "anger"], ["camera", "shake"],
            N("Lü Bu's rage rises to the sky. He slams the table and roars.", "布怒气冲天，拍案大叫。"),
            S("wangyun", "I spoke out of turn, General. Calm yourself.", "老夫失语，将军息怒。"),
            S("lvbu", "I swear I'll kill the old traitor, and wash away my shame!", "誓当杀此老贼，以雪吾耻！"),
            N("Wang Yun quickly covers his mouth.", "允急掩其口曰："),
            S("wangyun", "Don't say it, General! You'll bring ruin on me.", "将军勿言，恐累及老夫。"),
            S("lvbu", "A true man born between heaven and earth can't spend his life under another man's thumb!", "大丈夫生居天地间，岂能郁郁久居人下！"),
            S("wangyun", "A man of your gifts, General. Truly, the Grand Preceptor cannot hold you.", "以将军之才，诚非董太师所可限制。"),
            S("lvbu", "I want to kill the old traitor. But we are father and son, and I'm afraid of what people will say.",
              "吾欲杀此老贼，奈是父子之情，恐惹后人议论。"),
            ["problem"],  # 2: "you are a Lü"
            N("Wang Yun smiles.", "允微笑曰："),
            S("wangyun", "You are a Lü, General, and the Grand Preceptor is a Dong. When he threw that halberd at you, was there anything of a father in it?",
              "将军自姓吕，太师自姓董。掷戟之时，岂有父子情耶？"),
            S("lvbu", "If you hadn't said it, I'd have made a fool of myself!", "非司徒言，布几自误！"),
            ["problem"],  # 3: the choice
            N("Seeing that his mind is made up, Wang Yun presses on.", "允见其意已决，便说之曰："),
            S("wangyun", "If you uphold the house of Han, you are a loyal minister, and your name will be remembered in the histories for a hundred generations. "
              "If you help Dong Zhuo, you are a traitor, and the historians will write it down, and your name will stink for ten thousand years.",
              "将军若扶汉室，乃忠臣也，青史传名，流芳百世；将军若助董卓，乃反臣也，载之史笔，遗臭万年。"),
            ["pose", "lb", "bow"],
            S("lvbu", "My mind is made up. Do not doubt me.", "布意已决，司徒勿疑。"),
            S("wangyun", "I only fear that it may fail, and bring disaster on us.", "但恐事或不成，反招大祸。"),
            ["pose", "lb", "cutarm"],
            ["still", "lb_blood", "slow zoom in"],
            N("Lü Bu draws the knife at his belt, cuts his arm, and swears in blood.", "布拔带刀，刺臂出血为誓。"),
            ["pose", "wangyun", "kneel"],
            S("wangyun", "That the sacrifices of the Han are not cut off will be your gift, General. Let nothing leak! When the time comes, I'll send word.",
              "汉祀不斩，皆出将军之赐也。切勿泄漏！临期有计，自当相报。"),
            N("Lü Bu promises heartily, and goes.", "布慨诺而去。"),
            ["remove", "lb"],
        ]},

        # A12 · The conspirators. Legwork: two ministers sounded out, the plan, the Emperor's edict, then Li Su.
        "a12a": {"title": T("Shisun Rui", "士孙瑞"), "kind": "main", "steps": [
            ["problem"],  # sounding out a minister, after Zhang Wen's head on the red tray
            ["spawn", "sr", "shisunrui", "a12a", 10, 0],
            N("Wang Yun sounds out the Chief Archer of the Secretariat, Shisun Rui, behind closed doors. He will come.",
              "王允闭门密访仆射士孙瑞。瑞愿同谋。"),
        ]},
        "a12b": {"title": T("Huang Wan", "黄琬"), "kind": "main", "steps": [
            ["problem"],
            ["spawn", "hw", "huangwan", "a12b", 10, 0],
            N("Then the Colonel of the Capital, Huang Wan. He will come too.", "又密访司隶校尉黄琬。琬亦愿同谋。"),
        ]},
        # A12y · Cai Yong. NOT IN THE NOVEL (the user's call: it serves the plot). Wang Yun weighs the one scholar Dong Zhuo truly valued,
        # and decides he is Dong Zhuo's man. Plants what returns in A15c: the gratitude, the unfinished history, Wang Yun's judgment.
        "a12y": {"title": T("Stones, Not Men", "只谈棋子"), "kind": "main", "steps": [
            ["spawn", "cy", "caiyong", "a12y", 12, 0],
            ["prop", "slips", "book", "a12y", 18, -6],
            N("Cai Yong, the Palace Attendant, is the greatest scholar of the age. When Dong Zhuo took power he sent for him, and Cai Yong refused. "
              "Dong Zhuo sent word: come, or your whole clan dies. He came. Then Dong Zhuo promoted him three times in a single month.",
              "侍中蔡邕，当世大儒。董卓秉政，征之，邕不赴。卓使人谓邕曰：“如不来，当灭汝族。”邕惧，只得应命而至。卓见邕大喜，一月三迁其官。"),
            N("If any man in Chang'an could turn the Grand Preceptor's ear, it is Cai Yong. Wang Yun goes to his house.",
              "长安城中，若有一人能进言于太师，便是蔡邕。王允往其宅中。"),
            ["still", "cy_study", "slow zoom in"],
            S("caiyong", "Minister Wang. Sit down. Will you play a game? In this city it's safer to talk about stones than about men.",
              "王司徒，请坐。手谈一局如何？这长安城里，谈棋子比谈人安稳。"),
            ["problem", "caiyong"],  # Wang Yun plays the scholar, and reads him while he plays
            S("caiyong", "You play like a man with something on his mind.", "司徒落子，似有心事。"),
            S("wangyun", "And you, Bojie? They say the Grand Preceptor can't do enough for you.", "伯喈又如何？人言太师待君甚厚。"),
            S("caiyong", "He said he would kill my whole family if I didn't come. Then he promoted me three times in a month. "
              "I don't know what to make of a man like that. But he is the only one who ever asked me what I was writing.",
              "他说我若不来，便灭我满门。来了，一月之内三迁我官。这样的人，我实在看不透。可满朝之中，问我在写什么的，只有他一个。"),
            S("wangyun", "And what are you writing?", "君在写什么？"),
            S("caiyong", "The history of the Han. Someone has to finish it, while there's still a Han to write about.", "汉史。总得有人写完它，趁汉室还在。"),
            N("Wang Yun says nothing of what he came for. He thanks him for the game, and goes.", "王允对来意只字未提，谢过这一局，告辞而去。"),
            N("On the way home he thinks: a man who owes his life and his rank to Dong Zhuo will weep for him one day. Cai Yong cannot be told.",
              "归途之中，允自思：此人身家官爵，皆出董卓之手；他日必为卓而哭。此事断不可令蔡邕知道。"),
        ]},
        "a12p": {"title": T("The Plan", "定计"), "kind": "main", "steps": [
            ["spawn", "sr", "shisunrui", "a12p", 10, -4], ["spawn", "hw", "huangwan", "a12p", 12, 4],
            N("Wang Yun brings Shisun Rui and Huang Wan together in the secret room.", "允即请仆射士孙瑞、司隶校尉黄琬商议。"),
            S("shisunrui", "His Majesty has just risen from his sickbed. Send a good talker to Meiwu to invite Dong Zhuo to court to discuss affairs. "
              "Meanwhile give Lü Bu a secret edict from the Emperor, have him hide armed men inside the palace gate, and lead Dong Zhuo in to be killed. "
              "That is the best plan.",
              "方今主上有疾新愈，可遣一能言之人，往郿坞请卓议事；一面以天子密诏付吕布，使伏甲兵于朝门之内，引卓入诛之：此上策也。"),
            S("huangwan", "Who would dare go?", "何人敢去？"),
            S("shisunrui", "Li Su, Commander of Cavalry, from Lü Bu's own commandery. He's bitter that Dong Zhuo never promoted him. "
              "If we send him, Dong Zhuo won't suspect a thing.",
              "吕布同郡骑都尉李肃，以董卓不迁其官，甚是怀怨。若令此人去，卓必不疑。"),
            S("wangyun", "Good.", "善。"),
        ]},
        "a12c": {"title": T("The Secret Edict", "天子密诏"), "kind": "main", "steps": [
            ["problem"],  # getting in to the Emperor past the Chancellor's men
            ["spawn", "xd", "xiandi", "a12c", 12, 0],
            N("Wang Yun is admitted to the Emperor, newly risen from his sickbed, and comes out with an edict in the Emperor's own hand, hidden in his sleeve.",
              "允入见天子。天子病体新愈，亲书密诏，允藏于袖中而出。"),
            ["gain", "edict"],
            ["remove", "xd"],
        ]},
        "a12": {"title": T("The Broken Arrow", "折箭为誓"), "kind": "main", "steps": [
            ["spawn", "lb", "lvbu", "a12", 12, -4],
            N("Wang Yun calls Lü Bu in to plan with them, and gives him the Emperor's secret edict.", "允请吕布共议，以天子密诏付之。"),
            ["give", "wangyun", "lb", "edict"],
            S("lvbu", "Li Su? He's the one who talked me into killing Ding Jianyang. If he won't go now, I'll cut him down first.",
              "昔日劝吾杀丁建阳，亦此人也。今若不去，吾先斩之。"),
            N("They send for Li Su in secret.", "使人密请肃至。"),
            ["spawn", "ls", "lisu", "a12", 30, 2], ["move", "ls", "a12", 16, 4],
            S("lvbu", "Once you talked me into killing Ding Jianyang and going over to Dong Zhuo. Now Dong Zhuo cheats the Son of Heaven above "
              "and tortures the people below. His crimes are full to the brim, and men and gods hate him alike. "
              "Take the Emperor's summons to Meiwu, call Dong Zhuo to court, and we'll ambush and kill him. "
              "Help us restore the house of Han, and be loyal ministers together. What do you say?",
              "昔日公说布，使杀丁建阳而投董卓；今卓上欺天子，下虐生灵，罪恶贯盈，人神共愤。公可传天子诏往郿坞，宣卓入朝，伏兵诛之，"
              "力扶汉室，共作忠臣。尊意若何？"),
            ["problem"],  # Li Su's answer: from here the player is Li Su
            S("lisu", "I've wanted to be rid of this traitor for a long time, but I had no one of like mind. "
              "Now that you feel this way, General, it's a gift from Heaven. How could I be of two minds?",
              "我亦欲除此贼久矣，恨无同心者耳。今将军若此，是天赐也，肃岂敢有二心？"),
            ["still", "ls_arrow", "slow zoom in"],
            N("He snaps an arrow, as his oath.", "遂折箭为誓。"),
            S("wangyun", "If you can carry this off, how could you fail to rise high?", "公若能干此事，何患不得显官？"),
            ["remove", "ls"],
            ["party", ["lisu"]],
        ]},

        # A13 · Meiwu. Li Su's lie; Dong Zhuo's mother; Diaochan's last act for him.
        "a13": {"title": T("A Dragon in a Dream", "夜梦龙罩"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a13", 18, 0],
            N("The next day Li Su rides to Meiwu with a dozen horsemen. Word goes in that an edict has come from the Emperor, and Dong Zhuo calls him in.",
              "次日，李肃引十数骑，前到郿坞。人报天子有诏，卓叫唤入。"),
            ["pose", "lisu", "bow"],
            S("dongzhuo", "What does the Emperor's edict say?", "天子有何诏？"),
            ["problem"],  # Li Su: the lie, to Dong Zhuo's face
            S("lisu", "His Majesty has recovered from his illness, and wishes to gather all his officials in the Weiyang Hall, "
              "to discuss yielding the throne to you, Grand Preceptor. Hence this edict.",
              "天子病体新痊，欲会文武于未央殿，议将禅位于太师，故有此诏。"),
            S("dongzhuo", "And what does Wang Yun think?", "王允之意若何？"),
            S("lisu", "Minister Wang has already had a platform built for the abdication. It waits only for you, my lord.",
              "王司徒已命人筑“受禅台”，只等主公来。"),
            ["emote", "dz", "music"],
            S("dongzhuo", "Last night I dreamed a dragon wrapped itself around me, and now this news! The moment has come. I must not lose it!",
              "吾夜梦一龙罩身，今果得此喜信。时哉不可失！"),
            N("He orders his trusted generals Li Jue, Guo Si, Zhang Ji and Fan Chou to hold Meiwu with three thousand of the Flying Bear army, "
              "and makes ready to leave for the capital that same day.",
              "便命心腹将李傕、郭汜、张济、樊稠，四人领飞熊军三千守郿坞，自己即日排驾回京。"),
            S("dongzhuo", "When I am Emperor, you shall be Bearer of the Golden Mace.", "吾为帝，汝当为执金吾。"),
            N("Li Su bows, and calls himself his subject.", "肃拜谢称臣。"),
            ["spawn", "dm", "dongmu", "a13", 26, -8],
            ["move", "dz", "a13", 22, -6],
            ["still", "dz_mother", "slow zoom in"],
            N("Dong Zhuo goes in to take leave of his mother, who is over ninety.", "卓入辞其母。母时年九十余矣。"),
            S("dongmu", "Where are you going, my son?", "吾儿何往？"),
            S("dongzhuo", "I'm going to receive the Han's abdication, Mother. Soon you'll be the Empress Dowager!", "儿将往受汉禅，母亲早晚为太后也！"),
            S("dongmu", "My flesh has been trembling and my heart starting these past days. I'm afraid it's not a good sign.", "吾近日肉颤心惊，恐非吉兆。"),
            S("dongzhuo", "You're about to be the mother of the realm. Of course you'd have a few starts first!", "将为国母，岂不预有惊报！"),
            ["remove", "dm"],
            ["spawn", "dc", "diaochan", "a13", 30, 4],
            N("As he goes, he says to Diaochan:", "遂辞母而行。临行谓貂蝉曰："),
            S("dongzhuo", "When I am Son of Heaven, I'll make you my Precious Consort.", "吾为天子，当立汝为贵妃。"),
            ["pose", "dc", "bow"],
            N("Diaochan already knows what is coming. She pretends to be overjoyed, and bows her thanks.", "貂蝉已明知就里，假作欢喜拜谢。"),
            ["remove", "dc"],
        ]},

        # A13a-d · The road of omens. Each stop is Li Su explaining one away.
        "a13a": {"title": T("A Broken Wheel", "车折马嘶"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a13a", 10, 0],
            ["prop", "car", "carriage", "a13a", 16, 0],
            ["army", "escort", "f_soldier", 6, "a13a", 24, 6],
            N("Dong Zhuo leaves the fortress in his carriage, guards before and behind, and sets out for Chang'an.", "卓出坞上车，前遮后拥，望长安来。"),
            ["fx", "dust", "a13a", 16, 0], ["camera", "shake"],
            ["still", "omen_wheel", "slow pull back"],
            N("Before they have gone thirty li, a wheel of his carriage snaps. He gets down and mounts a horse. "
              "Before they have gone ten li more, the horse rears and screams, and snaps its bridle.",
              "行不到三十里，所乘之车，忽折一轮，卓下车乘马。又行不到十里，那马咆哮嘶喊，掣断辔头。"),
            S("dongzhuo", "The carriage breaks a wheel, the horse snaps its bridle. What does it mean?", "车折轮，马断辔，其兆若何？"),
            ["problem"],
            S("lisu", "It means you are to receive the Han's throne, Grand Preceptor. You cast off the old for the new, "
              "and will ride in a jade carriage with a golden saddle.",
              "乃太师应受汉禅，弃旧换新，将乘玉辇金鞍之兆也。"),
            N("Dong Zhuo is pleased, and believes him.", "卓喜而信其言。"),
            ["remove", "car"],
        ]},
        "a13b": {"title": T("Wind and Fog", "狂风昏雾"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a13b", 10, 0],
            ["army", "escort", "f_soldier", 6, "a13b", 24, 6],
            ["light", "storm", 1200],
            ["still", "omen_fog", "slow pan across"],
            N("The next day, as they ride on, a wild wind suddenly springs up, and dark fog blots out the sky.", "次日，正行间，忽然狂风骤起，昏雾蔽天。"),
            S("dongzhuo", "What sign is this?", "此何祥也？"),
            ["problem"],
            S("lisu", "When you ascend the dragon throne, my lord, there is bound to be red light and purple mist, to add to Heaven's majesty.",
              "主公登龙位，必有红光紫雾，以壮天威耳。"),
            N("Again Dong Zhuo is pleased, and has no doubt at all.", "卓又喜而不疑。"),
            ["light", "day", 1500],
        ]},
        "a13c": {"title": T("Grass of a Thousand Li", "千里草"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "a13c", 10, 0],
            ["spawn", "lb", "lvbu", "a13c", 24, 4],
            N("At the city, all the officials come out to meet him. Only Li Ru stays at home, ill. "
              "Dong Zhuo goes to the Chancellor's residence, and Lü Bu comes in to congratulate him.",
              "即至城外，百官俱出迎接。只有李儒抱病在家，不能出迎。卓进至相府，吕布入贺。"),
            ["move", "lb", "a13c", 14, 2],
            S("dongzhuo", "When I ascend the throne, you shall command all the armies of the realm.", "吾登九五，汝当总督天下兵马。"),
            ["pose", "lb", "bow"],
            N("Lü Bu bows his thanks, and sleeps outside Dong Zhuo's tent.", "布拜谢，就帐前歇宿。"),
            ["light", "night", 1500],
            ["army", "children", "f_child", 6, "a13c", -30, 12],
            ["still", "omen_song", "slow zoom in"],
            N("That night a dozen children sing in the fields outside the walls, and the wind carries the song into the tent:",
              "是夜有十数小儿于郊外作歌，风吹歌声入帐。歌曰："),
            N("Grass of a thousand li, so green, so green! Ten days up, and it will not live!", "千里草，何青青！十日上，不得生！"),
            N("The song is sad and piercing.", "歌声悲切。"),
            S("dongzhuo", "What does this children's song foretell?", "童谣主何吉凶？"),
            ["problem"],
            S("lisu", "It only means the house of Liu will fall, and the house of Dong will rise.", "亦只是言刘氏灭，董氏兴之意。"),
            N("Thousand, li and grass, written together, make the character Dong. Ten, sun and the stroke above it make Zhuo.",
              "千、里、草合为“董”字；十、日、卜合为“卓”字。"),
            ["remove", "children"],
        ]},
        "a13d": {"title": T("The Taoist's Cloth", "道人布竿"), "kind": "main", "steps": [
            ["light", "dawn"],
            ["spawn", "dz", "dongzhuo", "a13d", 10, 0],
            ["spawn", "dr", "daoren", "a13d", -18, 8],
            N("Early the next morning, Dong Zhuo sets out for court in full procession. Suddenly he sees a Taoist in a blue robe and white headcloth, "
              "holding a long pole. Tied to it is a strip of cloth ten feet long, with the character for 'mouth' written at each end.",
              "次日侵晨，董卓摆列仪从入朝，忽见一道人，青袍白巾，手执长竿，上缚布一丈，两头各书一“口”字。"),
            ["still", "omen_taoist", "slow zoom in"],
            S("dongzhuo", "What does this Taoist mean by it?", "此道人何意？"),
            S("lisu", "He's a madman.", "乃心恙之人也。"),
            N("Li Su calls the soldiers to drive him off. Two mouths, one above the other, make the character Lü.",
              "呼将士驱去。两“口”相叠，便是“吕”字。"),
            ["run", "dr", "a13d", -40, 10], ["remove", "dr"],
        ]},

        # A14 · The North Side Gate. The boss: three boards on the way to "There is an edict to kill a traitor!"
        "a14": {"title": T("There Is an Edict to Kill a Traitor", "有诏讨贼"), "kind": "main", "steps": [
            ["music", "boss"],
            ["army", "officials", "f_official", 6, "a14", 18, -10],
            ["spawn", "dz", "dongzhuo", "a14", 40, 0],
            ["prop", "car", "carriage", "a14", 40, 0], ["board", "dz", "car"],
            ["spawn", "wy", "wangyun", "a14", 8, -8],
            ["spawn", "lb", "lvbu", "a14", 48, 0],
            N("The officials, in court dress, line the road to greet him. Li Su walks beside the carriage with a drawn sword in his hand. "
              "At the North Side Gate the guards are all stopped outside. Only the twenty-odd men drawing the carriage go in with it.",
              "卓进朝，群臣各具朝服，迎谒于道。李肃手执宝剑扶车而行。到北掖门，军兵尽挡在门外，独有御车二十余人同入。"),
            ["move", "car", "a14", 20, 0], ["move", "lisu", "a14", 18, 6], ["move", "lb", "a14", 28, 0],
            ["boss", "dongzhuo"],
            ["problem"],  # 1
            N("Far off, Dong Zhuo sees Wang Yun and the others standing at the hall gate, each with a sword in his hand.",
              "董卓遥见王允等各执宝剑立于殿门。"),
            S("dongzhuo", "What are the swords for?", "持剑是何意？"),
            N("Li Su does not answer. He pushes the carriage straight in.", "肃不应，推车直入。"),
            ["move", "car", "a14", 10, 0],
            ["problem"],  # 2
            S("wangyun", "The traitor is here! Where are the soldiers?", "反贼至此，武士何在？"),
            ["army", "ambush", "f_soldier", 8, "a14", 10, 12],
            ["surround", "ambush", "car", 16],
            N("A hundred men spring out on either side and stab at him with halberds and spears. But Dong Zhuo wears armour under his robes, "
              "and the blades do not go in. Wounded in the arm, he tumbles from the carriage.",
              "两旁转出百余人，持戟挺槊刺之。卓裹甲不入，伤臂坠车。"),
            ["unboard", "dz"],
            ["problem"],  # 3
            S("dongzhuo", "Where is my son Fengxian?", "吾儿奉先何在？"),
            ["run", "lb", "a14", 14, 0],
            S("lvbu", "There is an edict to kill a traitor!", "有诏讨贼！"),
            ["pose", "lb", "strike", "dz"], ["fx", "flash", "a14", 12, 0], ["pose", "dz", "fall"],
            N("One thrust of his halberd goes through Dong Zhuo's throat, and Li Su takes the head.", "一戟直刺咽喉，李肃早割头在手。"),
            ["still", "dz_gate", "slow pull back"],
            N("Lü Bu holds his halberd in his left hand, draws the edict from his breast with his right, and cries out:",
              "吕布左手持戟，右手怀中取诏，大呼曰："),
            S("lvbu", "By the Emperor's edict, the traitor Dong Zhuo is slain! No one else will be punished!", "奉诏讨贼臣董卓，其余不问！"),
            N("Officers and officials all cry: Long live the Emperor!", "将吏皆呼万岁。"),
            ["victory"],
            ["party", ["wangyun"], {"to": "a15"}],
        ]},

        # A15 · The aftermath. No board.
        "a15": {"title": T("A Lamp in the Market", "脐中为灯"), "kind": "main", "steps": [
            ["spawn", "lb", "lvbu", "a15", 16, 0], ["spawn", "ls", "lisu", "a15", 20, 6],
            S("lvbu", "It was Li Ru who helped Dong Zhuo in all his cruelty! Who will take him?", "助卓为虐者，皆李儒也！谁可擒之？"),
            S("lisu", "I will!", "肃愿往！"),
            N("Then there is shouting outside the gate: Li Ru's own household slaves have tied him up and brought him in. "
              "Wang Yun has him taken to the market and beheaded, and Dong Zhuo's body put on show in the main street.",
              "忽听朝门外发喊，人报李儒家奴已将李儒绑缚来献。王允命缚赴市曹斩之；又将董卓尸首，号令通衢。"),
            ["light", "night", 1200],
            ["still", "dz_lamp", "slow pull back"],
            N("The body is so fat that the soldiers guarding it set a wick in its navel for a lamp, and the grease runs all over the ground. "
              "Every passer-by strikes the head or kicks the body.",
              "卓尸肥胖，看尸军士以火置其脐中为灯，膏油满地。百姓过者，莫不手掷其头，足践其尸。"),
            ["light", "day", 1200],
            N("Wang Yun sends Lü Bu, Huangfu Song and Li Su with fifty thousand men to Meiwu, to take Dong Zhuo's household and goods. "
              "Hearing that Dong Zhuo is dead and Lü Bu is coming, Li Jue, Guo Si, Zhang Ji and Fan Chou flee to Liangzhou that night with the Flying Bear army.",
              "王允又命吕布同皇甫嵩、李肃领兵五万，至郿坞抄籍董卓家产人口。李傕、郭汜、张济、樊稠闻董卓已死，吕布将至，便引了飞熊军连夜奔凉州去了。"),
            ["party", ["lvbu"], {"to": {"place": "Meiwu", "from": "Meiwu Road"}}],
        ]},
        # A15m · Meiwu raided. Played as Lü Bu: a walk through the opened fortress (road challengers on the way), then this scene, no board.
        "a15m": {"title": T("Meiwu", "郿坞"), "kind": "main", "steps": [
            ["spawn", "hs", "huangfusong", "a15m", -16, 6],
            ["army", "freed", "f_maiden", 5, "a15m", -24, 10],
            ["spawn", "dc", "diaochan", "a15m", 12, -4],
            ["still", "dc_meiwu", "slow zoom in"],
            N("At Meiwu, the first thing Lü Bu does is take Diaochan.", "吕布至郿坞，先取了貂蝉。"),
            ["move", "lvbu", "a15m", 8, -4],
            ["move", "freed", "a15m", -50, 12], ["remove", "freed"],
            N("Huangfu Song sets free all the girls of good family held in the fortress. Every relative of Dong Zhuo, old or young, is put to death, "
              "his mother among them. Gold by the hundred thousand, silks, pearls, vessels and grain beyond counting are listed and brought back to Wang Yun.",
              "皇甫嵩命将坞中所藏良家子女，尽行释放。但系董卓亲属，不分老幼，悉皆诛戮。卓母亦被杀。收籍坞中所蓄黄金数十万，绮罗、珠宝、器皿、粮食不计其数，回报王允。"),
            ["remove", "dc"],
            ["party", ["wangyun"], {"to": "a15c"}],
        ]},
        "a15c": {"title": T("Cai Yong Weeps", "蔡邕哭尸"), "kind": "main", "steps": [
            ["army", "officials", "f_official", 6, "a15c", 10, -10],
            N("Wang Yun feasts the army, and gathers the officials in the great hall to drink in celebration. "
              "In the middle of the feast a man reports that someone is lying across Dong Zhuo's body in the market, weeping aloud.",
              "允乃大犒军士，设宴于都堂，召集众官，酌酒称庆。正饮宴间，忽人报曰：“董卓暴尸于市，忽有一人伏其尸而大哭。”"),
            S("wangyun", "Dong Zhuo has been put to death, and every man rejoices. Who dares weep for him? Seize him and bring him here!",
              "董卓伏诛，士民莫不称贺；此何人，敢哭耶？与吾擒来！"),
            ["spawn", "cy", "caiyong", "a15c", 30, 4], ["move", "cy", "a15c", 14, 4], ["pose", "cy", "kneel"],
            ["still", "cy_weeps", "slow zoom in"],
            N("When he is brought in, the officials are aghast. It is the Palace Attendant, Cai Yong.", "须臾擒至。众官见之，无不惊骇：原来那人乃侍中蔡邕也。"),
            S("wangyun", "Dong Zhuo was a traitor, and today he has met his end. It is the nation's great good fortune. "
              "You are a minister of the Han. Instead of rejoicing for the realm, you weep for a traitor. Why?",
              "董卓逆贼，今日伏诛，国之大幸。汝为汉臣，乃不为国庆，反为贼哭，何也？"),
            S("caiyong", "Little as I am, I know where my duty lies. How could I turn against the realm and side with Dong Zhuo? "
              "I wept only because, for a moment, I remembered that he once valued me. I know my crime is great. I beg your mercy. "
              "Brand my face and cut off my feet, but let me finish the history of the Han to make amends. That would be my good fortune.",
              "邕虽不才，亦知大义，岂肯背国而向卓？只因一时知遇之感，不觉为之一哭，自知罪大。愿公见原：倘得黥首刖足，使续成汉史，以赎其辜，邕之幸也。"),
            ["spawn", "mm", "mamidi", "a15c", 4, -6],
            N("The officials all value his learning, and plead for him. The Grand Tutor, Ma Midi, speaks to Wang Yun privately.",
              "众官惜邕之才，皆力救之。太傅马日磾亦密谓允曰："),
            S("mamidi", "Bojie is a talent such as appears once in an age. If he were allowed to finish the history of the Han, it would be a great thing. "
              "And his filial conduct is well known. Kill him so suddenly, and I fear you will lose people's trust.",
              "伯喈旷世逸才，若使续成汉史，诚为盛事。且其孝行素著，若遽杀之，恐失人望。"),
            S("wangyun", "Long ago Emperor Wu spared Sima Qian and let him write his history, and slanders of the throne have come down to us ever since. "
              "The dynasty is weak now, and the court in disorder. We cannot let a flatterer hold the brush beside the young Emperor, and make us the butt of his gibes.",
              "昔孝武不杀司马迁，后使作史，遂致谤书流于后世。方今国运衰微，朝政错乱，不可令佞臣执笔于幼主左右，使吾等蒙其讪议也。"),
            N("Ma Midi has nothing to say, and withdraws. Privately, he tells the officials:", "日磾无言而退，私谓众官曰："),
            S("mamidi", "Wang Yun will leave no heirs! Good men are the bones of a nation, and its writings are its law. "
              "Destroy the bones and cast aside the law, and how long can it last?",
              "王允其无后乎！善人，国之纪也；制作，国之典也。灭纪废典，岂能久乎？"),
            ["remove", "cy"],
            N("Wang Yun does not listen. He has Cai Yong strangled in prison. When the scholars hear of it, they all weep.",
              "王允不听马日磾之言，命将蔡邕下狱中缢死。一时士大夫闻者，尽为流涕。"),
            ["party", ["jiaxu"], {"to": "a16"}],
        ]},

        # A16 · The villains' turn. Jia Xu's advice, his rumour through Liangzhou, the march.
        "a16": {"title": T("No Pardon", "求赦不得"), "kind": "main", "steps": [
            ["spawn", "lj", "lijue", "a16", 14, 0], ["spawn", "gs", "guosi", "a16", 18, 6],
            N("Li Jue, Guo Si, Zhang Ji and Fan Chou, hiding in Shaanxi, send a memorial to Chang'an begging for a pardon.",
              "李傕、郭汜、张济、樊稠逃居陕西，使人至长安上表求赦。"),
            N("Wang Yun answers: Dong Zhuo's tyranny was all the work of these four. The whole realm is pardoned, but not them.",
              "王允曰：“卓之跋扈，皆此四人助之；今虽大赦天下，独不赦此四人。”"),
            S("lijue", "No pardon. Then every man for himself.", "求赦不得，各自逃生可也。"),
            ["problem"],  # Jia Xu: stop them scattering
            S("jiaxu", "Leave your armies and go off alone, and any village constable can tie you up. "
              "Better to gather the men of Shaanxi, join them to your own troops, and fight your way into Chang'an to avenge Dong Zhuo. "
              "If it works, we hold the court and set the realm right. If not, there's still time to run.",
              "诸君若弃军单行，则一亭长能缚君矣。不若诱集陕人，并本部军马，杀入长安，与董卓报仇。事济，奉朝廷以正天下；若其不胜，走亦未迟。"),
            N("Li Jue and the others agree.", "傕等然其说。"),
        ]},
        "a16a": {"title": T("A Rumour in Liangzhou", "流言西凉"), "kind": "main", "steps": [
            ["problem"],
            ["army", "villagers", "f_villager", 6, "a16a", 14, 0],
            N("In the first village, the word goes round: Wang Yun means to wipe out every man of Liangzhou.", "遂流言于西凉州曰：“王允将欲洗荡此方之人矣。”"),
            ["emote", "villagers", "!"],
            ["crowd", 2],
        ]},
        "a16b": {"title": T("Fear", "众皆惊惶"), "kind": "main", "steps": [
            ["problem"],
            ["army", "villagers", "f_villager", 6, "a16b", 14, 0],
            N("By the second village it has run ahead of them. The people are terrified.", "众皆惊惶。"),
            ["emote", "villagers", "sweat"],
            ["crowd", "+3"],
        ]},
        "a16c": {"title": T("Will You Follow Me?", "能从我反乎"), "kind": "main", "steps": [
            ["problem"],
            ["army", "villagers", "f_villager", 6, "a16c", 14, 0],
            N("In the third, they put the question plainly: Why die for nothing? Will you rise with us? And every man will.",
              "乃复扬言曰：“徒死无益，能从我反乎？”众皆愿从。"),
            ["pose", "villagers", "cheer"],
            ["crowd", "+5"],
        ]},
        "a16m": {"title": T("The March on Chang'an", "杀奔长安"), "kind": "main", "steps": [
            ["army", "host", "rebel", 9, "a16m", 20, 0],
            N("They gather more than a hundred thousand men, split them into four columns, and march on Chang'an. "
              "On the road they meet Dong Zhuo's son-in-law, Niu Fu, coming with five thousand men to avenge him. Li Jue joins forces with him, "
              "and sends him on ahead.",
              "于是聚众十余万，分作四路，杀奔长安来。路逢董卓女婿中郎将牛辅，引军五千人，欲去与丈人报仇，李傕便与合兵，使为前驱。"),
            ["move", "host", "a16m", 60, 0],
            ["party", ["lijue"], {"to": "a16m"}],
        ]},

        "a16m_wait": {"title": T("Not Enough Men", "人马未齐"), "kind": "main", "steps": [
            S("jiaxu", "Not yet. There are villages still that haven't heard.", "还不可。尚有乡里未闻此言。"),
        ]},

        # A17 · Ren Valley. Li Su's end, Niu Fu's end, and the gong-and-drum trick.
        "a17": {"title": T("Gong to Advance, Drum to Withdraw", "鸣金进兵"), "kind": "main", "steps": [
            N("Lü Bu sends Li Su out against them. Li Su beats Niu Fu in the first fight, but that night, the second watch, Niu Fu raids his camp. "
              "Li Su loses half his army and flees thirty li. Lü Bu is furious, has him beheaded, and hangs his head at the camp gate.",
              "布遂引李肃将兵出敌。肃当先迎战，正与牛辅相遇，大杀一阵。不想是夜二更，牛辅乘肃不备，竟来劫寨。肃军乱窜，败走三十余里，折军大半。"
              "布大怒，遂斩李肃，悬头军门。"),
            N("The next day Lü Bu beats Niu Fu himself. That night Niu Fu slips away with his gold and a few men. At a river crossing his own man, "
              "Hu Chi'er, kills him for the gold and takes the head to Lü Bu. Niu Fu's men tell the truth, and Lü Bu has Hu Chi'er killed too.",
              "次日，吕布进兵与牛辅对敌，牛辅大败而走。是夜牛辅暗藏金珠，弃营而走。将渡一河，胡赤儿欲谋取金珠，竟杀死牛辅，将头来献吕布。"
              "从人出首，布怒，即将赤儿诛杀。"),
            ["spawn", "gs", "guosi", "a17", 10, 8],
            S("lijue", "Lü Bu is brave but has no strategy. Nothing to fear. I'll hold the mouth of Ren Valley and draw him out to fight every day. "
              "General Guo, you hit him from behind. We'll do what Peng Yue did to wear down Chu: sound the gong to advance, beat the drum to withdraw. "
              "Zhang and Fan split their forces and go straight for Chang'an. He can't save his head and his tail at once. He's sure to be beaten.",
              "吕布虽勇，然而无谋，不足为虑。我引军守任谷口，每日诱他厮杀。郭将军可领军抄击其后，效彭越挠楚之法，鸣金进兵，擂鼓收兵。"
              "张、樊二公，却分兵两路，径取长安。彼首尾不能救应，必然大败。"),
            ["army", "ours", "rebel", 6, "a17", 10, 0],
            ["spawn", "lb", "lvbu", "a17", 50, 0], ["army", "theirs", "militia", 6, "a17", 54, 6],
            ["music", "battle"],
            ["run", "lb", "a17", 26, 0],
            ["problem"],  # Li Jue: hold him at the valley mouth
            ["still", "ren_valley", "slow pan across"],
            N("Lü Bu charges up the hill, and stones and arrows rain down on him. Guo Si's men strike from behind. He turns, and the drums roll, "
              "and they are gone. He means to withdraw, and the gongs ring, and Li Jue is on him again. Day after day it goes on. "
              "He can neither fight nor stop.",
              "布忿怒冲杀过去，傕退走上山。山上矢石如雨，布军不能进。郭汜在阵后杀来，布急回战。只闻鼓声大震，汜军已退。布方欲收军，锣声响处，傕军又来。"
              "一连如此几日，欲战不得，欲止不得。"),
            N("Then a rider brings word: Zhang Ji and Fan Chou are at Chang'an. Lü Bu hurries back, and loses many men on the way.",
              "忽然飞马报来，说张济、樊稠两路军马，竟犯长安，京城危急。布急领军回，折了好些人马。"),
            ["run", "lb", "a17", 80, 0], ["remove", "lb"], ["remove", "theirs"],
            ["crowd", 0],
            ["party", ["wangyun"], {"to": "a18p"}],
        ]},

        # A18 · Xuanping Gate. No board: Wang Yun's choice, which the novel has already made.
        "a18p": {"title": T("To Save Myself by Running", "临难苟免"), "kind": "main", "steps": [
            ["light", "dusk"],
            N("A few days later, Li Meng and Wang Fang, Dong Zhuo's men still inside the city, secretly open the gates, and the rebel armies pour in from all four sides.",
              "数日之后，董卓余党李蒙、王方在城中为贼内应，偷开城门，四路贼军一齐拥入。"),
            ["spawn", "lb", "lvbu", "a18p", 20, 0], ["run", "lb", "a18p", 8, 0],
            S("lvbu", "It's hopeless! Mount up, Minister, and come out through the pass with me. We'll find another way.", "势急矣！请司徒上马，同出关去，别图良策。"),
            S("wangyun", "If the spirits of the dynasty help me bring the realm to peace, that is all I wish. If not, I give my life. "
              "To save myself by running in a crisis: that I will not do. Thank the lords east of the pass for me, and tell them to keep the realm in their hearts!",
              "若蒙社稷之灵，得安国家，吾之愿也；若不获已，则允奉身以死。临难苟免，吾不为也。为吾谢关东诸公，努力以国家为念！"),
            N("Lü Bu begs him again and again, but Wang Yun will not go. Soon flames rise from every gate to the sky. "
              "Lü Bu has to leave his own family behind, and flees through the pass with a hundred riders, to join Yuan Shu.",
              "吕布再三相劝，王允只是不肯去。不一时，各门火焰竟天，吕布只得弃却家小，引百余骑飞奔出关，投袁术去了。"),
            ["run", "lb", "a18p", -50, 0], ["remove", "lb"],
            ["fx", "fire", "a18p", 30, -10], ["fx", "fire", "a18p", -20, -8],
        ]},
        # A18 · The Xuanping Gate tower. No board: Wang Yun's choice, which the novel has already made.
        "a18": {"title": T("Wang Yun Is Here", "王允在此"), "kind": "main", "steps": [
            ["light", "dusk"],
            N("Li Jue and Guo Si let their men loot the city. Minister after minister dies for the dynasty. The rebels close round the inner palace, "
              "and the Emperor's attendants beg him to go up on the Xuanping Gate tower to stop the slaughter.",
              "李傕、郭汜纵兵大掠，众臣多死于国难。贼兵围绕内庭至急，侍臣请天子上宣平门止乱。"),
            ["spawn", "xd", "xiandi", "a18", 4, -6],
            ["army", "rebels", "rebel", 9, "a18", 30, 10],
            ["spawn", "lj", "lijue", "a18", 24, 6], ["spawn", "gs", "guosi", "a18", 26, 12],
            ["still", "wy_tower", "slow pull back"],
            N("Seeing the yellow canopy, Li Jue and Guo Si hold back their men, and cry: Long live the Emperor!", "李傕等望见黄盖，约住军士，口呼万岁。"),
            S("xiandi", "You came into Chang'an without waiting for my summons. What do you mean by it?", "卿不候奏请，辄入长安，意欲何为？"),
            S("lijue", "Grand Preceptor Dong was the pillar of Your Majesty's throne, and Wang Yun murdered him for nothing. "
              "We've come only to avenge him, not to rebel. Give us Wang Yun, and we'll withdraw.",
              "董太师乃陛下社稷之臣，无端被王允谋杀，臣等特来报仇，非敢造反。但见王允，臣便退兵。"),
            S("wangyun", "Everything I did was for the realm. Now it has come to this, Your Majesty must not spare me and ruin the nation. Let me go down to these two rebels.",
              "臣本为社稷计。事已至此，陛下不可惜臣，以误国家。臣请下见二贼。"),
            N("The Emperor hesitates, and cannot bear it. Wang Yun leaps down from the Xuanping Gate tower, crying out:", "帝徘徊不忍。允自宣平门楼上跳下楼去，大呼曰："),
            ["pose", "wangyun", "leap"],
            ["run", "wangyun", "a18", 18, 6],
            S("wangyun", "Wang Yun is here!", "王允在此！"),
            S("lijue", "What crime had the Grand Preceptor committed, that you killed him?", "董太师何罪而见杀？"),
            S("wangyun", "Dong Zhuo's crimes filled heaven and earth, more than words can tell. The day he died, everyone in Chang'an rejoiced. Have you alone not heard?",
              "董贼之罪，弥天亘地，不可胜言。受诛之日，长安士民，皆相庆贺，汝独不闻乎？"),
            S("guosi", "So the Grand Preceptor was guilty. What were we guilty of, that you wouldn't pardon us?", "太师有罪；我等何罪，不肯相赦？"),
            S("wangyun", "Traitors, why waste words? I, Wang Yun, have only death today!", "逆贼何必多言！我王允今日有死而已！"),
            ["mood", "dark"],
            ["pose", "wangyun", "fall"],
            N("The two rebels raise their swords, and Wang Yun is cut down below the tower.", "二贼手起，把王允杀于楼下。"),
            N("They send men to kill his whole clan, old and young. Scholars and common people alike weep for him.", "众贼杀了王允，一面又差人将王允宗族老幼，尽行杀害。士民无不下泪。"),
            N("Then Li Jue and Guo Si think: having come this far, why not kill the Son of Heaven and take the great prize? "
              "They draw their swords and storm into the palace, shouting.",
              "当下李傕、郭汜寻思曰：“既到这里，不杀天子谋大事，更待何时？”便持剑大呼，杀入内来。"),
            ["run", "lj", "a18", 6, -2], ["run", "gs", "a18", 8, 2],
            N("What became of Emperor Xian? Hear the next chapter.", "未知献帝性命如何，且听下文分解。"),
            ["remove", "lj"],
            ["party", ["lijue"], {"to": "a18"}],
        ]},
    }


def _nodes_chain():
    def node(key, x, y, scene, room=None, place="Chang'an", role="main", **extra):
        n = {"key": key, "x": x, "y": y, "role": role, "place": place, "scene": scene}
        if room:
            n["room"] = room
        n.update(extra)
        return n
    return [
        node("a1", 40, 200, "a1", board=False),
        node("a2", 60, 190, "a2", dilemma=D(
            "wangyun", "Stake the whole house on a sixteen-year-old girl?", "以一门性命，托付二八少女？",
            "If it leaks, every one of us dies. But no one else can do it.", "事若泄漏，我灭门矣。可满朝文武，无计可施。",
            "Then let it be her.", "既如此，便是她了。",
            "Not yet. Let me think it through.", "且慢，容我再想。")),
        node("a3", 80, 180, "a3", gate=[{"needs": ["item:pearls"], "else": "a3_wait",
                                          "objective": T("Fetch the family pearls from the old steward, in your rear hall.", "到自家后堂，向老管家取出家藏明珠。"),
                                          "count": False, "at": "Chang'an"},
                                         {"needs": ["item:crown"], "else": "a3_wait",
                                          "objective": T("Take the pearls to the jeweller's, at the west end of the market street, to be set into a gold crown.", "将明珠送到市街西头的珠宝铺，嵌造金冠。"),
                                          "count": False, "at": "Chang'an"}],
             dilemma=D("wangyun", "Get the crown to Lü Bu unseen.", "将金冠密送吕布，勿令人知。",
                       "The Chancellor's men are everywhere. After Zhang Wen, one wrong step is the end.", "相府耳目遍布。张温之事在前，一步差错，万事皆休。",
                       "It is done, and no one saw.", "事已办妥，无人察觉。",
                       "Too many eyes. Wait.", "耳目太多，再等等。")),
        node("a4", 100, 170, "a4", room="wy-rearhall", dilemma=D(
            "diaochan", "Win him.", "迷住他。",
            "Pour the wine, and let him look.", "且斟酒，任他看。",
            "He cannot take his eyes off me.", "他已目不转睛。",
            "Too soon. Slower.", "太急了，慢些。")),
        node("a5", 120, 160, "a5", room="wy-hall", dilemma=D(
            "diaochan", "Make the Grand Preceptor take me.", "教太师收我入府。",
            "Behind the curtain, he can only half see. Let that be enough.", "隔着帘栊，他只看得半分。半分足矣。",
            "Truly one of the immortals, he says.", "他说，真神仙中人也。",
            "Not yet. Again.", "还不够，再来。")),
        node("a6", 140, 150, "a6", dilemma=D(
            "wangyun", "Lie to Lü Bu's face.", "当面骗过吕布。",
            "His hand is on my collar. One wrong word and the plan dies, and I with it.", "他手揪我衣襟。一言有失，大计皆休，老夫亦死。",
            "He believes me.", "他信了。",
            "He'll see through that. Think again.", "这话他必识破。再想。")),
        node("a7", 160, 140, "a7", room="xf-bedroom", dilemma=D(
            "diaochan", "Make him believe the tears.", "教他信我之泪。",
            "He is watching from the pond. Let him see a woman in pain.", "他在池边窥看。便让他看一个受苦的女子。",
            "He has seen enough.", "他看够了。",
            "Too much. He'll see it's an act.", "太过了，他会看出是假。")),
        node("a7c", 170, 135, "a7c", room="xf-hall", board=False),
        node("a8", 180, 130, "a8", room="xf-bedroom", dilemma=D(
            "diaochan", "Tell him, without waking the man between us.", "隔着他，告诉吕布。",
            "One sign, and not a sound.", "只一个手势，不出一声。",
            "His heart is breaking. Good.", "他心如碎。好。",
            "Not yet. He's stirring.", "还不行，他在动。")),
        node("a9", 200, 120, "a9", dilemma=D(
            "diaochan", "Turn Lü Bu against his father.", "教吕布反其父。",
            "He came. Now he must not leave as he came.", "他来了。不可教他原样回去。",
            "He holds me, and will not let go.", "他抱住我，不肯放手。",
            "He's slipping away. Again.", "他要走了。再来。")),
        node("a10", 220, 110, "a10", room="xf-hall", dilemma=D(
            "diaochan", "Keep the Grand Preceptor, and undo Li Ru.", "稳住太师，破李儒之言。",
            "Li Ru has nearly undone everything. One lie, and then a blade.", "李儒之言，几乎坏了大事。先一句谎，再一把剑。",
            "He will not let me go.", "他舍不得我了。",
            "He doesn't believe it yet.", "他还不信。")),
        node("a11", 240, 100, "a11", dilemma=D(
            "wangyun", "Turn Lü Bu.", "说反吕布。",
            "He hates the old man. He has to hate him enough.", "他恨那老贼。要恨到足够才行。",
            "He has sworn in blood.", "他已刺臂为誓。",
            "Too fast. He'll balk.", "太急了，他会退缩。")),
        node("a12a", 250, 92, "a12a", dilemma=D(
            "wangyun", "Sound out Shisun Rui.", "密访士孙瑞。",
            "After Zhang Wen, every friend may be an informer.", "张温之后，故人亦未可信。",
            "He is with us.", "他愿同谋。",
            "Careful. Not like that.", "小心，不可如此说。")),
        node("a12b", 260, 86, "a12b", dilemma=D(
            "wangyun", "Sound out Huang Wan.", "密访黄琬。",
            "One more, and no more.", "再一人，便够了。",
            "He is with us.", "他愿同谋。",
            "Careful. Not like that.", "小心，不可如此说。")),
        node("a12y", 265, 83, "a12y", room="caiyong", dilemma=D(
            "wangyun", "Read Cai Yong.", "看清蔡邕。",
            "He is the one man Dong Zhuo listens to. Is he Dong Zhuo's, or the Han's?", "太师唯听此人之言。他是董卓的人，还是汉家的人？",
            "I know where he stands.", "我知道他站在哪边了。",
            "He's guarded. Watch him more closely.", "他有戒心，再看仔细。")),
        node("a12p", 270, 80, "a12p", room="wy-secret", board=False),
        node("a12c", 280, 74, "a12c", room="side-hall", dilemma=D(
            "wangyun", "Reach the Emperor unseen.", "避开耳目，面见天子。",
            "The Chancellor's men watch every door of the palace.", "宫中门门皆有相府耳目。",
            "The edict is in my sleeve.", "密诏已在袖中。",
            "Not that way. Someone's watching.", "不可走那边，有人在看。")),
        node("a12", 290, 68, "a12", room="wy-secret", dilemma=D(
            "lisu", "Turn on the Grand Preceptor?", "背太师乎？",
            "He never promoted me. And Lü Bu will kill me if I say no.", "他从不迁我官。况我若不从，吕布先斩我。",
            "I break the arrow.", "折箭为誓。",
            "Not yet. Think.", "且慢，再想。")),
        node("a13", 300, 60, "a13", place="Meiwu", room="hall", dilemma=D(
            "lisu", "Lie to the Grand Preceptor.", "骗过太师。",
            "He reads men for a living. One flicker and I'm dead.", "此人阅人无数。一丝破绽，我便死了。",
            "He dreamed of a dragon, he says.", "他说夜梦一龙罩身。",
            "He's looking at me. Steady.", "他在看我。稳住。")),
        node("a13a", 310, 54, "a13a", place="Meiwu Road", dilemma=D(
            "lisu", "Explain away the broken wheel.", "解说车折轮、马断辔。",
            "Heaven itself is warning him. Make it sound like good news.", "天在警他。要说成吉兆。",
            "He believes it.", "他信了。",
            "That won't hold.", "这说不通。")),
        node("a13b", 320, 48, "a13b", place="Meiwu Road", dilemma=D(
            "lisu", "Explain away the wind and the fog.", "解说狂风昏雾。",
            "Darkness at noon. Make it majesty.", "白日昏暗。要说成天威。",
            "He has no doubt at all.", "他毫不起疑。",
            "Too clever. Simpler.", "太巧了，说简单些。")),
        node("a13c", 330, 42, "a13c", place="Meiwu Road", dilemma=D(
            "lisu", "Explain away the children's song.", "解说童谣。",
            "The song says his name, and says he dies. Turn it round.", "童谣暗藏其名，又说他死。要反过来说。",
            "The house of Dong will rise.", "董氏当兴。",
            "He's listening hard. Again.", "他听得仔细。再来。")),
        node("a13d", 340, 36, "a13d", board=False),
        node("a14", 350, 30, "a14", role="boss",
             boss={"who": "dongzhuo", "title": T("Dong Zhuo", "董卓") + ", " + T("Grand Preceptor", "太师"),
                   "taunt": T("What are the swords for?", "持剑是何意？")},
             dilemma=D("wangyun", "Kill the traitor at the palace gate.", "诛贼于北掖门。",
                       "His guards are shut outside. It has to be now.", "卫兵尽挡在门外。只在此刻。",
                       "There is an edict to kill a traitor!", "有诏讨贼！",
                       "Not yet. Hold.", "且慢，稳住。")),
        node("a15", 360, 24, "a15", board=False),
        node("a15m", 366, 22, "a15m", place="Meiwu", room="diaochan", board=False),
        node("a15c", 370, 20, "a15c", room="dutang", board=False),
        node("a16", 380, 16, "a16", place="Liangzhou", dilemma=D(
            "jiaxu", "Keep them from scattering.", "劝住诸将，勿散。",
            "If they run alone, a village constable will take them. Together, they can take Chang'an.", "若各自逃生，一亭长能缚之。合兵，则长安可取。",
            "They agree.", "傕等然其说。",
            "They're not listening. Again.", "他们不听。再说。")),
        node("a16a", 388, 12, "a16a", place="Liangzhou", dilemma=D(
            "jiaxu", "Spread the rumour.", "散布流言。",
            "Fear will raise an army faster than gold.", "恐惧聚兵，快过金银。",
            "They believe it.", "众皆信之。",
            "They don't believe it yet.", "他们还不信。")),
        node("a16b", 396, 10, "a16b", place="Liangzhou", dilemma=D(
            "jiaxu", "Let the fear spread.", "使流言传开。",
            "It has run ahead of us. Keep it running.", "流言已先我而至。让它再传。",
            "The whole county is afraid.", "一州皆惧。",
            "Too loud. Quieter.", "太张扬了，低些。")),
        node("a16c", 404, 8, "a16c", place="Liangzhou", dilemma=D(
            "jiaxu", "Ask them to rise.", "问他们肯反否。",
            "Why die for nothing?", "徒死无益。",
            "Every man will follow.", "众皆愿从。",
            "Not yet. They're wavering.", "还未。他们在犹豫。")),
        node("a16m", 412, 6, "a16m", place="Liangzhou", board=False,
             gate=[{"needs": ["node:a16a", "node:a16b", "node:a16c"], "else": "a16m_wait",
                    "objective": T("Spread the rumour through the villages of Liangzhou.", "在西凉各乡散布流言。"), "at": "Liangzhou"}]),
        node("a17", 420, 6, "a17", place="Liangzhou", dilemma=D(
            "lijue", "Hold Lü Bu at the mouth of Ren Valley.", "在任谷口拖住吕布。",
            "He is brave, and nothing else. Never let him fight the battle he wants.", "他只有勇而已。决不教他打想打的仗。",
            "He can neither fight nor stop.", "他欲战不得，欲止不得。",
            "He's breaking through. Again.", "他要冲破了。再来。")),
        node("a18p", 426, 6, "a18p", board=False),
        node("a18", 430, 6, "a18", room="xuanping-top", board=False),
    ]


# One caption per board in the three-board scenes (a node's "dilemma" may be a list, in board order).
def _multi_dilemmas():
    return {
        "a9": [
            D("diaochan", "Make him believe me.", "教他信我。",
              "He came. Now every word has to ring true.", "他来了。如今句句都要像真的。",
              "He holds me.", "他抱住了我。", "He doubts it. Again.", "他起疑了。再来。"),
            D("diaochan", "Keep him from leaving.", "留住他。",
              "He fears the old man. Make him fear losing me more.", "他怕那老贼。要教他更怕失去我。",
              "He stays.", "他留下了。", "He's going. Stop him.", "他要走了。拦住他。"),
            D("diaochan", "Shame him into staying.", "激他留下。",
              "The greatest hero alive, taking orders. Let him hear how that sounds.", "当世英雄，竟受人制。让他听听这话。",
              "He will not let me go.", "他不肯放手了。", "Too sharp. He'll turn on me.", "太狠了，他会翻脸。"),
        ],
        "a10": [
            D("diaochan", "Lie about the pavilion.", "谎说凤仪亭之事。",
              "Lü Bu chased me, and I nearly drowned. Make him see it.", "是吕布追我，我险些投池。要他看得真切。",
              "He believes me.", "他信了。", "He's suspicious. Again.", "他起疑了。再来。"),
            D("diaochan", "Put the sword to my throat.", "引剑自刎。",
              "A real blade. He has to believe I'd rather die.", "真刀真剑。要他信我宁死不从。",
              "He snatches it away.", "他夺下了剑。", "Not convincing. Again.", "不够真。再来。"),
            D("diaochan", "Turn it on Li Ru.", "把罪推给李儒。",
              "Give him someone to blame who isn't me.", "给他一个可怪的人，不是我。",
              "He will never give me up.", "他再也舍不得我了。", "Careful. Not yet.", "小心，还不是时候。"),
        ],
        "a11": [
            D("wangyun", "Provoke him.", "激怒他。",
              "He is angry. Make the shame his own.", "他已动怒。要让这耻辱成了他自己的。",
              "He is roaring.", "他拍案大叫。", "Too fast. He'll balk.", "太急了，他会退缩。"),
            D("wangyun", "Answer 'but he is my father'.", "答“父子之情”。",
              "One sentence has to cut the tie.", "一句话，便要斩断这父子之情。",
              "He sees it.", "他想通了。", "He still calls him father.", "他还当他是父亲。"),
            D("wangyun", "Loyal minister, or traitor?", "忠臣，还是反臣？",
              "Give him a name in the histories to choose.", "让他自己选，青史留下什么名字。",
              "He has sworn in blood.", "他已刺臂为誓。", "He wavers. Again.", "他在犹豫。再来。"),
        ],
        "a14": [
            D("lisu", "Get the carriage through the gate.", "让车驾入门。",
              "His guards are shut outside. Only the carriage men come in.", "卫兵都挡在门外，只有车驾进来。",
              "The gate closes behind him.", "门已在他身后关上。", "Not yet. He's looking.", "还不行，他在看。"),
            D("lisu", "Push the carriage straight in.", "推车直入。",
              "He has seen the swords. Don't answer him, and don't stop.", "他已看见了剑。不要答话，不要停。",
              "He is inside. The soldiers are coming.", "车已入内，武士齐出。", "Too soon. Hold.", "太早了，稳住。"),
            D("lisu", "Finish it.", "了结此贼。",
              "The blades won't go in. Only one man can do this.", "刀枪不入。只有一人能了结他。",
              "There is an edict to kill a traitor!", "有诏讨贼！", "He's calling for his son. Hold.", "他在喊他的儿子。稳住。"),
        ],
    }


_EDGES_CHAIN = [["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a4", "a5"], ["a5", "a6"], ["a6", "a7"], ["a7", "a7c"], ["a7c", "a8"], ["a8", "a9"],
                ["a9", "a10"], ["a10", "a11"], ["a11", "a12a"], ["a12a", "a12b"], ["a12b", "a12y"], ["a12y", "a12p"], ["a12p", "a12c"], ["a12c", "a12"],
                ["a12", "a13"], ["a13", "a13a"], ["a13a", "a13b"], ["a13b", "a13c"], ["a13c", "a13d"], ["a13d", "a14"], ["a14", "a15"],
                ["a15", "a15m"], ["a15m", "a15c"], ["a15c", "a16"], ["a16", "a16a"], ["a16a", "a16b"], ["a16b", "a16c"], ["a16c", "a16m"], ["a16m", "a17"],
                ["a17", "a18p"], ["a18p", "a18"]]

_ITEMS = {
    "pearls": {"name": "Family pearls", "zh": "家藏明珠", "kind": "treasure"},
    "crown": {"name": "Gold crown set with pearls", "zh": "嵌珠金冠", "kind": "treasure"},
    "edict": {"name": "The Emperor's secret edict", "zh": "天子密诏", "kind": "treasure"},
}


# ---------------------------------------------------------------- Act I: Cao Cao (chapters 3-4, and the start of 5)
# Design: docs/book2/caocao-arc.md. Beat keys c1-c23 follow its Shared keys table.
# The arc stands on its own (there is no Book 1): people are named on their first line, and the opening scroll
# carries the little the first scene needs.

def _scenes_caocao():
    return {
        # C1 · He Jin's council. No board: it introduces Cao Cao and the danger. The council is already arguing.
        "c1": {"title": T("A Jailer Would Be Enough", "付一狱吏足矣"), "kind": "main", "steps": [
            ["party", ["caocao"]],
            ["army", "officials", "f_official", 5, "c1", -8, 8],
            ["spawn", "hj", "hejin", "c1", 14, -4],
            ["spawn", "ys", "yuanshao", "c1", 4, -6],
            N("The house of He Jin, General-in-Chief. The council has been arguing since morning. "
              "Yuan Shao has just urged him to call the frontier armies into the capital, to wipe out the eunuchs.",
              "大将军何进府中，众官议事已久。袁绍方才献计：召四方英雄之士，勒兵来京，尽诛阉竖。"),
            ["move", "caocao", "c1", 2, 4],
            S("caocao", "I am Cao Cao, Colonel of the Army. General, eunuchs have done harm in every age. "
              "But the fault lies with the rulers who gave them power. If you mean to punish them, punish the ringleaders. "
              "A jailer would be enough. Why call in armies from outside?",
              "典军校尉曹操在此。宦官之祸，古今皆有；但世主不当假之权宠，使至于此。若欲治罪，当除元恶，但付一狱吏足矣，何必纷纷召外兵乎？"),
            S("caocao", "Try to kill them all, and it will get out. I tell you this will fail.", "欲尽诛之，事必宣露。吾料其必败也。"),
            ["emote", "hj", "anger"],
            S("hejin", "Mengde, do you have some private motive of your own?", "孟德亦怀私意耶？"),
            ["move", "caocao", "c1", -6, 10],
            S("caocao", "The man who throws the realm into chaos will be He Jin.", "乱天下者，必进也。"),
            N("That night He Jin's messengers ride out with secret edicts to the frontier commanders.", "进乃暗差使命赍密诏，星夜往各镇去。"),
            ["still", "cc_council", "slow pull back"],
            N("In the west, Dong Zhuo, Governor of Xiliang, reads his edict with delight. He marches on Luoyang with two hundred thousand men.",
              "西凉刺史董卓得诏大喜，统西州大军二十万，提兵望洛阳进发。"),
            N("The censor Zheng Tai warns: Dong Zhuo is a wolf. Let him into the capital and he will eat men. Lu Zhi warns the same. "
              "He Jin will not listen, and they leave their posts. More than half the court goes with them.",
              "侍御史郑泰谏曰：“董卓乃豺狼也，引入京城，必食人矣。”卢植亦谏。进不听，郑泰、卢植皆弃官而去。朝廷大臣，去者大半。"),
        ]},

        # C2 · The Jiade Gate. Contest, fails: Cao Cao cannot keep He Jin out of the palace.
        "c2": {"title": T("The Jiade Gate", "嘉德门"), "kind": "main", "steps": [
            ["spawn", "hj", "hejin", "c2", 6, 4],
            ["spawn", "ys", "yuanshao", "c2", 2, 8],
            ["spawn", "cl", "chenlin", "c2", 10, 8],
            ["army", "guard", "f_soldier", 6, "c2", -10, 14],
            N("The eunuchs strike first. In the name of the Empress Dowager, He Jin is summoned into the palace.",
              "十常侍先下手，假太后之诏，宣大将军入宫。"),
            S("chenlin", "This edict is the eunuchs' work, General. Don't go. If you go, you won't come back.",
              "太后此诏，必是十常侍之谋，切不可去。去必有祸。"),
            S("hejin", "The Empress Dowager summons me. What harm can come of it?", "太后诏我，有何祸事？"),
            S("yuanshao", "The plot is out, General. And you still mean to go in?", "今谋已泄，事已露，将军尚欲入宫耶？"),
            S("caocao", "Have the eunuchs called out first. Then go in.", "先召十常侍出，然后可入。"),
            S("hejin", "A child's idea! I hold the power of the whole realm. What can the eunuchs do to me?",
              "此小儿之见也。吾掌天下之权，十常侍敢待如何？"),
            ["problem"],
            S("caocao", "General, wait—", "将军且慢——"),
            N("At the palace gate the herald calls: The Empress Dowager summons the General-in-Chief alone. No one else may enter. "
              "Yuan Shao and Cao Cao are stopped outside.",
              "黄门传懿旨云：“太后特宣大将军，余人不许辄入。”将袁绍、曹操等都阻住宫门外。"),
            ["move", "hj", "c2", 6, -16], ["remove", "hj"],
            ["wait", 1500],
            S("yuanshao", "General! Your carriage is waiting!", "请将军上车！"),
            ["fx", "flash", "c2", 6, -12],
            ["still", "hj_head", "slow zoom in"],
            N("Over the wall comes He Jin's head. A voice calls: He Jin plotted rebellion and has been executed. All who followed him are pardoned.",
              "让等将何进首级从墙上掷出，宣谕曰：“何进谋反，已伏诛矣。其余胁从，尽皆赦宥。”"),
            ["emote", "ys", "anger"],
            S("yuanshao", "The eunuchs have murdered a minister of state! Whoever will kill traitors, follow me!", "阉官谋杀大臣！诛恶党者前来助战！"),
            N("He Jin's officer Wu Kuang sets fire to the Qingsuo Gate. Yuan Shu breaks into the palace, and every eunuch they find, young or old, is cut down.",
              "何进部将吴匡，便于青琐门外放起火来。袁术引兵突入宫庭，但见阉官，不论大小，尽皆杀之。"),
            ["fx", "fire", "c2", 0, -10],
            ["run", "guard", "c2", 6, -14],
        ]},
        # C3 · The palace burns. Legwork: the board comes first.
        "c3": {"title": T("The Palace Burns", "宫中火起"), "kind": "main", "steps": [
            ["problem"],  # putting out the fire and sending out the search
            ["light", "night"],
            ["fx", "fire", "c3", 12, -8],
            ["spawn", "lz", "luzhi", "c3", 14, 4],
            ["spawn", "th", "taihou", "c3", 18, 2],
            ["still", "palace_fire", "slow pull back"],
            N("The palace burns into the sky. The eunuchs Zhang Rang and Duan Gui have seized the young Emperor and his brother, "
              "the Prince of Chenliu, and fled by the back ways.",
              "宫中火焰冲天。张让、段圭劫拥少帝及陈留王，从后道走北宫。"),
            S("luzhi", "I caught Duan Gui dragging the Empress Dowager past. She jumped from the window, and I have her safe.",
              "段圭逆贼劫太后过阁，太后从窗中跳出，植已救得。"),
            S("caocao", "Put out the fires. Ask the Empress Dowager to take charge of affairs for now. "
              "Send men after Zhang Rang, and find the Emperor.",
              "速救灭宫中之火。请何太后权摄大事。遣兵追袭张让等，寻觅少帝。"),
            N("The soldiers scatter in every direction. No one knows where the Emperor is.", "军马四散去赶，不知帝之所在。"),
            N("Meanwhile, at the foot of Mount Beimang, north of the city…", "且说城北北邙山下……"),
            ["party", ["chenliu"], {"to": "c4"}],
        ]},

        # C4 · The fireflies. Played as the Prince of Chenliu, nine years old. Legwork: the board first.
        "c4": {"title": T("The Fireflies", "流萤引路"), "kind": "main", "steps": [
            ["light", "night"],
            ["spawn", "sd", "shaodi", "c4", -4, 2],
            N("The fourth watch. The Emperor and the Prince of Chenliu lie in the reeds by the river, not daring to make a sound. "
              "The pursuers have gone by. The dew is falling, and they are hungry. They hold each other and cry, with their hands over their mouths.",
              "帝与陈留王伏于河边乱草之内，不敢高声。伏至四更，露水又下，腹中饥馁，相抱而哭；又怕人知觉，吞声草莽之中。"),
            S("chenliu", "We can't stay here. We have to find a way out.", "此间不可久恋，须别寻活路。"),
            N("They knot their robes together and climb the bank. The slope is all thorns, and in the dark they cannot see a path.",
              "于是二人以衣相结，爬上岸边。满地荆棘，黑暗之中，不见行路。"),
            ["problem"],
            ["fx", "sparkle", "c4", 6, -4],
            ["still", "fireflies", "slow pull back"],
            N("Then fireflies come, hundreds of them, a whole river of light, circling in front of the Emperor.",
              "忽有流萤千百成群，光芒照耀，只在帝前飞转。"),
            S("chenliu", "Heaven is helping us!", "此天助我兄弟也！"),
            ["move", "chenliu", "c4", 24, -8], ["move", "sd", "c4", 22, -6],
            ["prop", "hay", "straw", "c4", 28, -10],
            N("They follow the fireflies until they find the road. By the fifth watch their feet are too sore to go on, "
              "and they lie down beside a haystack below a farm.",
              "遂随萤火而行，渐渐见路。行至五更，足痛不能行。山冈边见一草堆，帝与王卧于草堆之畔。"),
            ["pose", "sd", "sleep"],
            ["spawn", "cy", "cuiyi", "c4", 34, -16],
            N("That night the farmer dreamed that two red suns fell behind his house. He wakes, and sees a red glow above the haystack.",
              "庄主是夜梦两红日坠于庄后，惊觉，披衣出户，见庄后草堆上红光冲天。"),
            ["move", "cy", "c4", 30, -12],
            S("cuiyi", "Whose sons are you, boys?", "二少年谁家之子？"),
            S("chenliu", "This is the Emperor. He fled here from the eunuchs' rising. I am his brother, the Prince of Chenliu.",
              "此是当今皇帝，遭十常侍之乱，逃难到此。吾乃皇弟陈留王也。"),
            ["pose", "cy", "kneel"],
            S("cuiyi", "Your servant is Cui Yi, brother of the late Minister Cui Lie. I saw the eunuchs selling offices, and came here to hide.",
              "臣先朝司徒崔烈之弟崔毅也。因见十常侍卖官嫉贤，故隐于此。"),
            N("He helps them into the farm, and kneels to bring them food and wine.", "遂扶帝入庄，跪进酒食。"),
        ]},

        # C5 · The road back. Contest: the prince faces Dong Zhuo.
        "c5": {"title": T("To Protect Us, or to Seize Us?", "保驾劫驾"), "kind": "main", "steps": [
            ["light", "day"],
            ["spawn", "sd", "shaodi", "c5", 0, 4],
            ["spawn", "mg", "mingong", "c5", 6, 2],
            ["spawn", "wy", "wangyun", "c5", 16, -2],
            ["army", "officials", "f_official", 5, "c5", 20, 2],
            N("Min Gong, an officer of Henan, has caught Duan Gui and hung his head from his saddle. He finds the farm, and the Emperor weeps to see him. "
              "On the road back they meet the ministers, Wang Yun among them, with a few hundred horsemen. Ministers and Emperor weep together.",
              "河南中部掾吏闵贡拿住段圭，悬头于马项下，寻至崔毅庄，君臣痛哭。离庄而行，不到三里，司徒王允等一行人众，数百人马，接着车驾，君臣皆哭。"),
            ["army", "xiliang", "horse", 9, "c5", 60, -4],
            ["fx", "dust", "c5", 50, -4],
            N("They have gone only a few li when banners blot out the sun and dust hides the sky. An army is coming. The ministers go pale.",
              "车驾行不到数里，忽见旌旗蔽日，尘土遮天，一枝人马到来。百官失色，帝亦大惊。"),
            ["spawn", "dz", "dongzhuo", "c5", 44, -2],
            ["run", "dz", "c5", 24, 0],
            S("dongzhuo", "Where is the Son of Heaven?", "天子何在？"),
            ["emote", "sd", "sweat"],
            N("The Emperor trembles and cannot speak.", "帝战栗不能言。"),
            ["problem"],
            ["move", "chenliu", "c5", 14, 2],
            S("chenliu", "Who are you?", "来者何人？"),
            S("dongzhuo", "Dong Zhuo, Governor of Xiliang.", "西凉刺史董卓也。"),
            S("chenliu", "Have you come to protect us, or to seize us?", "汝来保驾耶？汝来劫驾耶？"),
            S("dongzhuo", "I have come to protect you.", "特来保驾。"),
            S("chenliu", "If you have come to protect us, the Son of Heaven is here. Why are you still on your horse?",
              "既来保驾，天子在此，何不下马？"),
            ["emote", "dz", "!"],
            ["pose", "dz", "bow"],
            ["still", "prince_dz", "slow zoom in"],
            N("Dong Zhuo is startled, gets down quickly, and bows by the road. The prince speaks kindly to him, and from first to last says nothing wrong.",
              "卓大惊，慌忙下马，拜于道左。陈留王以言抚慰董卓，自初至终，并无失语。"),
            N("Dong Zhuo marvels at him in secret. Already he is thinking of putting this boy on the throne in his brother's place.",
              "卓暗奇之，已怀废立之意。"),
            N("Back in the palace, the Imperial Seal is found to be missing.", "是日还宫，检点宫中，不见了传国玉玺。"),
            ["party", ["dongzhuo"], {"to": "c6"}],
        ]},

        # C6 · The Wenming Garden. Played as Dong Zhuo. Contest, fails.
        "c6": {"title": T("The Wenming Garden", "温明园"), "kind": "main", "steps": [
            ["spawn", "lr", "liru", "c6", -6, 4],
            N("Dong Zhuo camps outside the city. Every day he rides in with his armoured horsemen, and the people are terrified. "
              "He takes over He Jin's soldiers.",
              "董卓屯兵城外，每日带铁甲马军入城，横行街市，百姓惶惶不安。卓招诱何进兄弟部下之兵，尽归掌握。"),
            S("dongzhuo", "I mean to depose the Emperor and put the Prince of Chenliu on the throne. What do you think?",
              "吾欲废帝立陈留王，何如？"),
            S("liru", "The court has no master. Do it now, or it will slip away. Tomorrow, gather the officials in the Wenming Garden and tell them. "
              "Behead any who refuse.",
              "今朝廷无主，不就此时行事，迟则有变矣。来日于温明园中，召集百官，谕以废立；有不从者斩之。"),
            ["army", "officials", "f_official", 8, "c6", 14, 6],
            ["prop", "tbl", "table", "c6", 14, 0],
            ["spawn", "dy", "dingyuan", "c6", 20, 2],
            ["spawn", "lb", "lvbu", "c6", 24, 8],
            ["spawn", "lz", "luzhi", "c6", 10, 4],
            ["spawn", "wy", "wangyun", "c6", 8, 8],
            N("The officials are all afraid of Dong Zhuo, and every one of them comes. He arrives last, gets down at the garden gate, and takes his seat with his sword on.",
              "公卿皆惧董卓，谁敢不到？卓待百官到了，然后徐徐到园门下马，带剑入席。"),
            ["move", "dongzhuo", "c6", 14, -2],
            N("After a few rounds of wine, he stops the wine and the music.", "酒行数巡，卓教停酒止乐。"),
            ["problem"],
            S("dongzhuo", "The Son of Heaven is master of all the people. Without majesty he cannot serve the ancestral temple. "
              "The present Emperor is weak. The Prince of Chenliu is clever and loves learning; he can take the throne. "
              "I mean to depose the Emperor and set up the Prince. What do you say, gentlemen?",
              "天子为万民之主，无威仪不可以奉宗庙社稷。今上懦弱，不若陈留王聪明好学，可承大位。吾欲废帝，立陈留王，诸大臣以为何如？"),
            N("No one dares make a sound. Then a man pushes back his table and stands up in front of the feast.", "诸官听罢，不敢出声。座上一人推案直出，立于筵前。"),
            ["move", "dy", "c6", 16, 2],
            S("dingyuan", "No! No! Who are you, to talk like this? The Emperor is the late Emperor's heir by his true wife, and has done no wrong. "
              "Do you mean to usurp the throne?",
              "不可！不可！汝是何人，敢发大语？天子乃先帝嫡子，初无过失，何得妄议废立？汝欲为篡逆耶？"),
            ["emote", "dongzhuo", "anger"],
            S("dongzhuo", "Those who follow me live. Those who oppose me die!", "顺我者生，逆我者死！"),
            ["pose", "dongzhuo", "strike", "dy"],
            ["move", "lb", "c6", 20, 4],
            ["still", "wm_lubu", "slow zoom in"],
            N("Dong Zhuo draws his sword. But Li Ru sees a man behind Ding Yuan: tall and splendid, a painted halberd in his hand, glaring.",
              "遂掣佩剑欲斩丁原。时李儒见丁原背后一人，生得器宇轩昂，威风凛凛，手执方天画戟，怒目而视。"),
            S("liru", "This is a banquet, not the place for affairs of state. Let it be argued in the council hall tomorrow.",
              "今日饮宴之处，不可谈国政；来日向都堂公论未迟。"),
            ["move", "dy", "c6", 40, 10], ["move", "lb", "c6", 42, 12], ["remove", "dy"], ["remove", "lb"],
            S("luzhi", "You are wrong, my lord. The Emperor is young, but he is clever and kind and has done nothing wrong. "
              "You are a governor from the provinces with no part in the government. How can you force a deposition?",
              "明公差矣。今上虽幼，聪明仁智，并无分毫过失。公乃外郡刺史，素未参与国政，何可强主废立之事？"),
            S("wangyun", "A deposition is not to be settled over wine. Let it be discussed another day.", "废立之事，不可酒后相商，另日再议。"),
            N("The officials leave. Dong Zhuo stands at the garden gate with his hand on his sword. Outside, a man gallops back and forth with a halberd.",
              "于是百官皆散。卓按剑立于园门，忽见一人跃马持戟，于园门外往来驰骤。"),
            ["spawn", "lb", "lvbu", "c6", 30, -10], ["run", "lb", "c6", 10, -12], ["run", "lb", "c6", 30, -12],
            S("dongzhuo", "Who is that?", "此何人也？"),
            S("liru", "Ding Yuan's adopted son, Lü Bu. My lord had better keep out of his way.", "此丁原义儿：姓吕，名布，字奉先者也。主公且须避之。"),
            ["remove", "lb"],
            N("Dong Zhuo goes back into the garden to hide.", "卓乃入园潜避。"),
        ]},

        # C7 · The rout. No board. Played as Dong Zhuo; hands to Li Su in the tent.
        "c7": {"title": T("Lü Bu at the Front", "吕布阵前"), "kind": "main", "steps": [
            ["spawn", "dy", "dingyuan", "c7", 30, 0],
            ["spawn", "lb", "lvbu", "c7", 34, 4],
            ["army", "dyarmy", "f_soldier", 8, "c7", 44, 2],
            ["army", "dzarmy", "f_soldier", 8, "c7", -8, 2],
            N("The next day Ding Yuan brings his army outside the city and challenges him to battle.", "次日，人报丁原引军城外搦战。卓怒，引军同李儒出迎。"),
            S("dingyuan", "The realm is unlucky. Eunuchs seized power, and the people were trampled into the mud. "
              "You have done nothing for this dynasty. How dare you talk of deposing the Emperor?",
              "国家不幸，阉官弄权，以致万民涂炭。尔无尺寸之功，焉敢妄言废立，欲乱朝廷？"),
            ["still", "lb_charge", "slow zoom in"],
            N("Before Dong Zhuo can answer, Lü Bu charges straight at him, in a gold hair-crown, a robe of a hundred flowers and lion-headed armour.",
              "董卓未及回言，吕布头束发金冠，披百花战袍，擐唐猊铠甲，纵马挺戟，直杀过来。"),
            ["run", "lb", "c7", 4, 0],
            ["run", "dongzhuo", "c7", -24, 6],
            ["run", "dzarmy", "c7", -30, 6],
            N("Dong Zhuo flees. His army is badly beaten, and falls back thirty li to camp.", "董卓慌走。卓兵大败，退三十余里下寨。"),
            ["remove", "dy"], ["remove", "lb"], ["remove", "dyarmy"], ["remove", "dzarmy"],
            ["spawn", "lr", "liru", "c7", -30, 2],
            ["spawn", "ls", "lisu", "c7", -22, 8],
            S("dongzhuo", "That Lü Bu is no ordinary man. If I had him, what would I have to fear in all the realm?",
              "吾观吕布非常人也。吾若得此人，何虑天下哉？"),
            ["move", "ls", "c7", -26, 4],
            S("lisu", "Don't worry, my lord. I am Li Su, a captain of your guard, and Lü Bu is from my home county. "
              "He is brave but has no judgment, and forgets loyalty at the sight of gain. "
              "With this tongue of mine I can talk him into coming over to you, hands folded.",
              "主公勿忧：某虎贲中郎将李肃，与吕布同乡，知其勇而无谋，见利忘义。某凭三寸不烂之舌，说吕布拱手来降，可乎？"),
            S("dongzhuo", "And how will you talk him round?", "汝将何以说之？"),
            S("lisu", "My lord has a famous horse called Red Hare, that goes a thousand li in a day. Give me the horse, and gold and pearls to win his heart. "
              "Then a few words from me, and Lü Bu will turn on Ding Yuan and come to you.",
              "某闻主公有名马一匹，号曰赤兔，日行千里。须得此马，再用金珠，以利结其心。某更进说词，吕布必反丁原，来投主公矣。"),
            S("dongzhuo", "Is that wise?", "此言可乎？"),
            S("liru", "My lord means to take the realm. Why grudge a horse?", "主公欲取天下，何惜一马？"),
            N("Dong Zhuo gladly agrees, and adds a thousand taels of gold, some dozens of bright pearls and a jade belt.",
              "卓欣然与之，更与黄金一千两、明珠数十颗、玉带一条。"),
            ["remove", "ls"],
            ["party", ["lisu"], {"to": "c7"}],
        ]},

        # C8 · The gifts. Played as Li Su. Delivery errand, no board: the gate on C9 needs both items.
        "c8": {"title": T("The Gifts", "金珠赤兔"), "kind": "main", "steps": [
            N("Li Su has Red Hare led out on a halter, and the gold, the pearls and the jade belt packed into a box.", "李肃牵了赤兔，赍了金珠玉带。"),
            S("lisu", "Lü Bu's camp is on the far side of the field. Ding Yuan will have men out on the road.", "吕布寨在原野那头。丁原必有伏路军人。"),
            ["party", ["lisu", "redhare"]],
        ]},
        "c8_wait": {"title": T("Not Yet", "尚未齐备"), "kind": "main", "steps": [
            S("lisu", "The horse first. The stable master has him.", "先牵马。赤兔在马夫那里。"),
        ]},
        "c9_wait": {"title": T("Not Yet", "尚未齐备"), "kind": "main", "steps": [
            S("lisu", "Not yet. I can't go to him with only a horse: I need the gold.", "且慢。只牵一匹马，岂能说他？须得金珠。"),
        ]},

        # C9 · An old friend. Contest, three boards: the same three-step persuasion Wang Yun uses on the ridge (A11).
        "c9": {"title": T("An Old Friend", "故人来见"), "kind": "main", "steps": [
            ["spawn", "lb", "lvbu", "c9", 10, -4],
            ["prop", "tbl", "table", "c9", 6, -2], ["prop", "jars", "winejars", "c9", 12, -2],
            N("Ambush pickets surround him on the road. Li Su says: tell General Lü an old friend has come. Lü Bu has him brought in.",
              "伏路军人围住。肃曰：“可速报吕将军，有故人来见。”军人报知，布命入见。"),
            S("lisu", "Brother! Are you well, since we parted?", "贤弟别来无恙！"),
            S("lvbu", "It's been a long time. Where are you now?", "久不相见，今居何处？"),
            S("lisu", "I'm a captain of the guard. I heard you were defending the dynasty, and I was delighted. "
              "I've brought you a horse that goes a thousand li a day, through water and up mountains as if on flat ground. Its name is Red Hare.",
              "见任虎贲中郎将之职。闻贤弟匡扶社稷，不胜之喜。有良马一匹，日行千里，渡水登山，如履平地，名曰赤兔：特献与贤弟，以助虎威。"),
            ["still", "red_hare", "slow pull back"],
            N("The horse is red as burning charcoal from head to tail, without one hair of another colour. A zhang long from head to tail, "
              "eight chi high at the shoulder. It neighs and rears as if it would leap into the sky or plunge into the sea.",
              "那马浑身上下，火炭般赤，无半根杂毛；从头至尾，长一丈；从蹄至项，高八尺；嘶喊咆哮，有腾空入海之状。"),
            N("A poem of later times on Red Hare: It gallops a thousand li, shaking off the dust; it crosses rivers, climbs mountains, and parts the purple mist. "
              "It snaps its silken rein and tosses its jade bit: a fire dragon flying down from the ninth heaven.",
              "后人有诗单道赤兔马曰：奔腾千里荡尘埃，渡水登山紫雾开。掣断丝缰摇玉辔，火龙飞下九天来。"),
            S("lvbu", "You give me such a horse, brother. How can I repay you?", "兄赐此良驹，将何以为报？"),
            S("lisu", "I came out of friendship. Who wants repaying?", "某为义气而来，岂望报乎？"),
            ["pose", "lb", "drink"],
            N("Lü Bu sets out wine. When they are well into it, Li Su speaks.", "布置酒相待。酒酣，肃曰："),
            ["problem"],  # 1
            S("lisu", "I see you so seldom, brother. But your father, I see often.", "肃与贤弟少得相见；令尊却常会来。"),
            S("lvbu", "You're drunk, brother. My father died years ago. How could you see him?", "兄醉矣！先父弃世多年，安得与兄相会？"),
            S("lisu", "No, no. I mean the Governor, Ding Yuan.", "非也；某说今日丁刺史耳。"),
            ["emote", "lb", "sweat"],
            S("lvbu", "I'm with Ding Yuan because I have no choice.", "某在丁建阳处，亦出于无奈。"),
            ["problem"],  # 2
            S("lisu", "You have the strength to hold up the sky. Who in the four seas doesn't admire you? Rank and riches are yours for the reaching. "
              "Why say you have no choice, and serve under another man?",
              "贤弟有擎天驾海之才，四海孰不钦敬？功名富贵，如探囊取物，何言无奈而在人之下乎？"),
            S("lvbu", "I just haven't found the right master.", "恨不逢其主耳。"),
            S("lisu", "A good bird chooses its tree. A good man chooses his master. Miss the moment, and you'll regret it.",
              "良禽择木而栖，贤臣择主而事。见机不早，悔之晚矣。"),
            S("lvbu", "You're at court, brother. Who do you see as the hero of the age?", "兄在朝廷，观何人为世之英雄？"),
            S("lisu", "I've looked at them all, and none of them comes near Dong Zhuo. He honours worthy men and rewards and punishes fairly. "
              "He will do great things.",
              "某遍观群臣，皆不如董卓。董卓为人敬贤礼士，赏罚分明，终成大业。"),
            S("lvbu", "I'd follow him, but I have no way in.", "某欲从之，恨无门路。"),
            ["problem"],  # 3
            ["prop", "gold", "chest", "c9", 8, -2],
            ["still", "lb_gold", "slow zoom in"],
            N("Li Su lays out the gold, the pearls and the jade belt in front of him.", "肃取金珠、玉带列于布前。"),
            S("lvbu", "What's this?", "何为有此？"),
            S("lisu", "Lord Dong has long admired your name, and sent me to give you these. Red Hare is his gift too.",
              "此是董公久慕大名，特令某将此奉献。赤兔马亦董公所赠也。"),
            S("lvbu", "Lord Dong thinks so well of me. What can I give him in return?", "董公如此见爱，某将何以报之？"),
            S("lisu", "Someone as useless as me is a captain of the guard. If you went to him, there'd be no end to your rank.",
              "如某之不才，尚为虎贲中郎将；公若到彼，贵不可言。"),
            S("lvbu", "I've done nothing to offer him when I come.", "恨无涓埃之功，以为进见之礼。"),
            S("lisu", "That could be done in the turn of a hand. You only have to be willing.", "功在翻手之间，公不肯为耳。"),
            ["wait", 1200],
            S("lvbu", "I'll kill Ding Yuan, and bring his army over to Dong Zhuo. How's that?", "吾欲杀丁原，引军归董卓，何如？"),
            S("lisu", "If you can do that, it's the greatest service of all! But don't wait. Decide quickly.", "贤弟若能如此，真莫大之功也！但事不宜迟，在于速决。"),
            N("Lü Bu promises to come over the next day, and Li Su takes his leave.", "布与肃约于明日来降，肃别去。"),
            ["party", ["lisu"]],
        ]},

        # C10 · The second watch. No board: the killing is Lü Bu's, and settled. Hands to Cao Cao.
        "c10": {"title": T("The Second Watch", "二更时分"), "kind": "main", "steps": [
            ["light", "night"],
            ["spawn", "dy", "dingyuan", "c10", 0, -4],
            ["prop", "desk", "desk", "c10", 0, -6], ["prop", "bk", "book", "c10", 2, -6],
            ["pose", "dy", "sit"],
            ["spawn", "lb", "lvbu", "c10", 20, 6],
            N("That night, at the second watch, Lü Bu walks into Ding Yuan's tent with a blade in his hand. Ding Yuan is reading by candlelight.",
              "是夜二更时分，布提刀径入丁原帐中。原正秉烛观书。"),
            ["move", "lb", "c10", 4, 0],
            ["still", "lb_candle", "slow zoom in"],
            S("dingyuan", "My son, what brings you here?", "吾儿来有何事故？"),
            S("lvbu", "I'm a man in my own right! Why would I be your son?", "吾堂堂丈夫，安肯为汝子乎！"),
            S("dingyuan", "Fengxian, why has your heart turned?", "奉先何故心变？"),
            ["mood", "dark"],
            ["pose", "lb", "strike", "dy"],
            N("The candle goes out.", "烛灭。"),
            ["remove", "dy"],
            ["mood", "clear"],
            S("lvbu", "Ding Yuan was no good, and I've killed him! Whoever will follow me, stay. Whoever won't, go!",
              "左右！丁原不仁，吾已杀之。肯从吾者在此，不从者自去！"),
            N("More than half the soldiers scatter.", "军士散其大半。"),
            ["light", "day"],
            N("The next day Lü Bu brings Ding Yuan's head to Li Su, and Li Su takes him to Dong Zhuo.", "次日，布持丁原首级，往见李肃。肃遂引布见卓。"),
            ["spawn", "dz", "dongzhuo", "c10", -16, -2],
            ["move", "lisu", "c10", -8, 2], ["move", "lb", "c10", -10, 0],
            ["pose", "dz", "bow"],
            S("dongzhuo", "Now that I have you, General, I'm like a parched seedling getting sweet rain.", "卓今得将军，如旱苗之得甘雨也。"),
            ["pose", "lb", "kneel"],
            ["still", "lb_kneels", "slow pull back"],
            S("lvbu", "If you will have me, my lord, let me bow to you as your adopted son.", "公若不弃，布请拜为义父。"),
            N("Dong Zhuo gives him golden armour and a brocade robe. From then on his power grows by the day. Li Ru urges him to settle the deposition at once.",
              "卓以金甲锦袍赐布。卓自是威势越大。李儒劝卓早定废立之计。"),
            N("Dong Zhuo holds a banquet in the Secretariat, and has Lü Bu stand guard with a thousand armoured men. Li Su leads them in. "
              "Among the officials sits Cao Cao.",
              "卓乃于省中设宴，会集公卿，令吕布将甲士千余，侍卫左右。座中百官，曹操亦在。"),
            ["party", ["caocao"], {"to": "c11"}],
        ]},

        # C11 · The Secretariat banquet. No board: Yuan Shao's sword, and his walk out of the East Gate (planted for C17).
        "c11": {"title": T("Your Sword Is Sharp, and So Is Mine", "汝剑利，吾剑未尝不利"), "kind": "main", "steps": [
            ["army", "officials", "f_official", 8, "c11", 10, 6],
            ["army", "guards", "f_soldier", 8, "c11", 0, -12],
            ["spawn", "dz", "dongzhuo", "c11", 14, -6],
            ["spawn", "lb", "lvbu", "c11", 20, -8],
            ["spawn", "ls", "lisu", "c11", 24, -6],
            ["spawn", "lr", "liru", "c11", 8, -6],
            ["spawn", "ys", "yuanshao", "c11", 20, 4],
            ["pose", "caocao", "sit"],
            N("After a few rounds of wine, Dong Zhuo draws his sword.", "酒行数巡，卓拔剑曰："),
            S("dongzhuo", "The Emperor is weak and foolish, and unfit to serve the ancestral temple. "
              "I shall follow the old precedents, depose him as Prince of Hongnong, and set up the Prince of Chenliu. Anyone who refuses, dies!",
              "今上闇弱，不可以奉宗庙；吾将依伊尹、霍光故事，废帝为弘农王，立陈留王为帝。有不从者斩！"),
            ["emote", "officials", "sweat"],
            ["move", "ys", "c11", 16, 0],
            S("yuanshao", "I am Yuan Shao, Colonel of the Centre. The Emperor has not been on the throne long, and has done nothing wrong. "
              "You would put down the true heir for a younger son. What is that but rebellion?",
              "中军校尉袁绍在此。今上即位未几，并无失德；汝欲废嫡立庶，非反而何？"),
            S("dongzhuo", "The realm is in my hands! When I act, who dares refuse? Do you think my sword isn't sharp?",
              "天下事在我！我今为之，谁敢不从？汝视我之剑不利否？"),
            ["pose", "ys", "strike", "dz"],
            ["still", "ys_sword", "slow zoom in"],
            S("yuanshao", "Your sword is sharp. And so is mine!", "汝剑利，吾剑未尝不利！"),
            S("liru", "Nothing is settled yet. You can't kill him now.", "事未可定，不可妄杀。"),
            N("Yuan Shao takes leave of the officials with his sword in his hand, hangs his seal of office on the East Gate, and rides for Jizhou.",
              "袁绍手提宝剑，辞别百官而出，悬节东门，奔冀州去了。"),
            ["move", "ys", "c11", 40, 10], ["remove", "ys"],
            S("caocao", "He drew a sword on Dong Zhuo, and walked out alive.", "拔剑向董卓，竟得生出东门。"),
            N("Dong Zhuo turns to the officials. Anyone who stands in the way of the great plan will be dealt with by military law. "
              "The ministers shake. We will do as you command, they all say.",
              "卓曰：“敢有阻大议者，以军法从事。”群臣震恐，皆云：“一听尊命。”"),
        ]},

        # C12 · The deposition. No board. Also plants Cai Yong (A12y and his death).
        "c12": {"title": T("The Jiade Hall", "嘉德殿"), "kind": "main", "steps": [
            ["army", "officials", "f_official", 8, "c12", 10, 8],
            ["spawn", "dz", "dongzhuo", "c12", 14, -8],
            ["spawn", "lr", "liru", "c12", 8, -6],
            ["spawn", "sd", "shaodi", "c12", 0, -10],
            ["spawn", "xd", "chenliu", "c12", -6, -4],
            ["spawn", "dg", "dingguan", "c12", 16, 6],
            N("On the first day of the ninth month the Emperor is brought to the Jiade Hall, and all the court is gathered. "
              "Dong Zhuo, sword in hand, has Li Ru read the decree: the Emperor is frivolous and unfit to rule, and is deposed as Prince of Hongnong.",
              "九月朔，请帝升嘉德殿，大会文武。卓拔剑在手，令李儒读策：帝天资轻佻，威仪不恪，废为弘农王；请奉陈留王为皇帝。"),
            ["move", "sd", "c12", 0, -2],
            ["pose", "sd", "kneel"],
            ["still", "deposition", "slow pull back"],
            N("They help the Emperor down from the throne and untie his seal ribbons. He kneels facing north, and calls himself a subject. "
              "He and the Empress Dowager weep aloud. Every minister grieves.",
              "卓叱左右扶帝下殿，解其玺绶，北面长跪，称臣听命。帝后皆号哭。群臣无不悲惨。"),
            ["move", "dg", "c12", 12, -4],
            S("dingguan", "Traitor Dong Zhuo! You dare deceive Heaven! I will spatter you with the blood of my own neck!",
              "贼臣董卓，敢为欺天之谋，吾当以颈血溅之！"),
            ["pose", "dg", "strike", "dz"],
            N("He strikes at Dong Zhuo with the ivory tablet in his hand. He is Ding Guan, of the Secretariat. Dong Zhuo has him dragged out and beheaded. "
              "He curses until he dies, and his face never changes.",
              "挥手中象简，直击董卓。乃尚书丁管也。卓命牵出斩之。管骂不绝口，至死神色不变。"),
            ["remove", "dg"],
            ["move", "xd", "c12", 0, -10],
            ["remove", "xd"], ["spawn", "xd", "xiandi", "c12", 0, -10],
            N("The Prince of Chenliu takes the throne. He is Emperor Xian, nine years old. Dong Zhuo makes himself Chancellor, "
              "and comes to court with his sword and shoes on.",
              "陈留王登殿，即献帝也，时年九岁。董卓为相国，赞拜不名，入朝不趋，剑履上殿。"),
            ["remove", "sd"],
            ["spawn", "cy", "caiyong", "c12", 30, 6],
            N("Li Ru tells him to raise famous men to office, to win people's hearts, and names the scholar Cai Yong. Cai Yong refuses to come.",
              "李儒劝卓擢用名流，以收人望，因荐蔡邕之才。卓命征之，邕不赴。"),
            S("dongzhuo", "Tell him: if he doesn't come, I'll wipe out his clan.", "如不来，当灭汝族。"),
            ["move", "cy", "c12", 18, -2], ["pose", "cy", "bow"],
            N("Cai Yong is afraid, and comes. Dong Zhuo is delighted with him, and promotes him three times in one month.",
              "邕惧，只得应命而至。卓见邕大喜，一月三迁其官，拜为侍中，甚见亲厚。"),
        ]},

        # C13 · Luoyang under Dong Zhuo. Walked; no board. The young Emperor's death is narrated over a still (user's call).
        "c13": {"title": T("The Swallows", "双燕"), "kind": "main", "steps": [
            N("The deposed Emperor, his mother and the Lady Tang are shut up in the Yong'an Palace, short of clothes and food. One day he sees two swallows in the courtyard, and makes a poem.",
              "少帝与何太后、唐妃困于永安宫中，衣服饮食，渐渐欠缺。一日，偶见双燕飞于庭中，遂吟诗一首。"),
            ["still", "swallows", "slow zoom in"],
            N("The young grass is green as mist; two swallows fly, light and free. The Luo flows blue below; people on the road look on with envy. "
              "Far off, deep in the blue clouds, stands my old palace. Who will act for loyalty, and lift the grief in my heart?",
              "嫩草绿凝烟，袅袅双飞燕。洛水一条青，陌上人称羡。远望碧云深，是吾旧宫殿。何人仗忠义，泄我心中怨！"),
            N("Dong Zhuo's spies bring him the poem. He sends Li Ru with poisoned wine. The Empress Dowager is thrown from the tower, "
              "the Lady Tang is strangled, and the young Emperor is made to drink.",
              "卓曰：“怨望作诗，杀之有名矣。”遂命李儒入宫弑帝：攛太后下楼，绞死唐妃，以鸩酒灌杀少帝。"),
            ["mood", "dark"],
            ["wait", 1200],
            ["mood", "clear"],
            ["prop", "cart1", "cart", "c13", 44, 0], ["prop", "cart2", "cart", "c13", 50, 2],
            ["move", "cart1", "c13", 24, 0], ["move", "cart2", "c13", 30, 2],
            ["fx", "fire", "c13", 30, -6],
            ["still", "heads_gate", "slow pull back"],
            N("Carts come in through the gate, with more than a thousand heads hung beneath them. Dong Zhuo's men say they have won a great victory over bandits. "
              "They were villagers at a spring festival in Yangcheng. The heads are burned under the city gate, and the women and goods shared out among the soldiers.",
              "卓尝引军出城，行到阳城地方，时当二月，村民社赛。卓命军士围住，尽皆杀之，悬头千余颗于车下，扬言杀贼大胜而回；于城门下焚烧人头，以妇女财物分散众军。"),
            ["remove", "cart1"], ["remove", "cart2"],
            S("caocao", "I will serve him, and wait. One day I'll be near enough.", "且屈身事之，乘间图之。"),
        ]},

        # C14 · Wu Fu. No board: a hidden-knife attempt fails, just before Cao Cao's own.
        "c14": {"title": T("Wu Fu", "伍孚"), "kind": "main", "steps": [
            ["spawn", "dz", "dongzhuo", "c14", 20, 0],
            ["spawn", "lb", "lvbu", "c14", 28, 2],
            ["spawn", "wf", "wufu", "c14", 8, 4],
            N("Wu Fu, a colonel of cavalry, cannot bear Dong Zhuo's cruelty. He wears light armour under his court robes, and hides a short knife.",
              "越骑校尉伍孚，见卓残暴，愤恨不平。尝于朝服内披小铠，藏短刀，欲伺便杀卓。"),
            ["move", "dz", "c14", 12, 0],
            ["run", "wf", "c14", 11, 1],
            ["pose", "wf", "strike", "dz"],
            ["fx", "flash", "c14", 12, 0],
            N("As Dong Zhuo comes into court, Wu Fu meets him below the gallery and stabs at him. Dong Zhuo is strong, and seizes his arms. "
              "Lü Bu comes in and throws him down.",
              "一日，卓入朝，孚迎至阁下，拔刀直刺卓。卓气力大，两手抠住；吕布便入，揪倒伍孚。"),
            ["run", "lb", "c14", 10, 2], ["pose", "wf", "fall"],
            S("dongzhuo", "Who told you to rebel?", "谁教汝反？"),
            S("wufu", "You are not my lord, and I am not your subject. How can it be rebellion? Your crimes fill the sky, and every man wants you dead!",
              "汝非吾君，吾非汝臣，何反之有？汝罪恶盈天，人人愿得而诛之！"),
            N("Dong Zhuo has him taken out and cut to pieces. He curses until he dies.", "卓大怒，命牵出剖剐之。孚至死骂不绝口。"),
            ["remove", "wf"],
            N("From then on, Dong Zhuo goes nowhere without armoured guards.", "董卓自此出入常带甲士护卫。"),
            S("caocao", "A knife in a sleeve is not enough. He has to trust you first.", "袖中藏刀，不足成事。须先教他信我。"),
        ]},

        # C15 · The false birthday. Contest: asking Wang Yun for the sword.
        "c15": {"title": T("The False Birthday", "司徒寿宴"), "kind": "main", "steps": [
            ["light", "dusk"],
            ["spawn", "wy", "wangyun", "c15", 8, -6],
            ["army", "officials", "f_official", 6, "c15", 10, 4],
            ["prop", "tbl", "table", "c15", 10, 0],
            N("Yuan Shao, in Bohai, sends Wang Yun a secret letter: Dong Zhuo has deposed the Emperor, and you sit and watch. If you have the heart, strike when you can. "
              "Wang Yun has no plan. He tells the old ministers it is his birthday, and asks them to his house that evening.",
              "时袁绍在渤海，差人赍密书来见王允：“卓贼欺天废主……公若有心，当乘间图之。”王允得书，寻思无计。谓旧臣曰：“今日老夫贱降，晚间敢屈众位到舍小酌。”"),
            ["pose", "caocao", "sit"],
            N("After a few rounds of wine, Wang Yun suddenly covers his face and weeps.", "酒行数巡，王允忽然掩面大哭。"),
            S("wangyun", "It isn't my birthday. I wanted you all here, and feared Dong Zhuo would suspect us. Dong Zhuo bullies the throne, "
              "and the dynasty may fall any day. The founder destroyed Qin and Chu and won the realm, and now it will be lost to Dong Zhuo. That is why I weep.",
              "今日并非贱降，因欲与众位一叙，恐董卓见疑，故托言耳。董卓欺主弄权，社稷旦夕难保。想高皇诛秦灭楚，奄有天下；谁想传至今日，乃丧于董卓之手：此吾所以哭也。"),
            ["emote", "officials", "..."],
            N("All the officials weep with him. Then one man claps his hands and laughs.", "于是众官皆哭。坐中一人抚掌大笑。"),
            ["still", "wy_birthday", "slow pull back"],
            S("caocao", "The whole court weeps from night till morning and from morning till night. Can you weep Dong Zhuo to death?",
              "满朝公卿，夜哭到明，明哭到夜，焉能哭死董卓耶？"),
            ["emote", "wy", "anger"],
            S("wangyun", "Your forefathers ate the Han's bread too. You don't think of serving the realm, and you laugh?",
              "汝祖宗亦食禄汉朝，今不思报国而反笑耶？"),
            ["problem"],
            S("caocao", "I'm not laughing at that. I'm laughing that not one of you has a plan to kill Dong Zhuo. I'm no great talent, "
              "but I'll cut off his head and hang it on the city gate.",
              "吾非笑别事，笑众位无一计杀董卓耳。操虽不才，愿即断董卓头，悬之都门，以谢天下。"),
            S("wangyun", "What do you have in mind, Mengde?", "孟德有何高见？"),
            S("caocao", "I've bent myself to serve him only to wait my chance. Now he trusts me, and I can get close. "
              "I hear you have a Seven-Star Sword. Lend it to me. I'll go into his residence and stab him. I don't mind dying for it.",
              "近日操屈身以事卓者，实欲乘间图之耳。今卓颇信操，操因得时近卓。闻司徒有七星宝刀一口，愿借与操入相府刺杀之，虽死不恨！"),
            S("wangyun", "If you truly mean it, Mengde, the realm is lucky.", "孟德果有是心，天下幸甚！"),
            ["pose", "caocao", "stand"],
            N("Wang Yun pours him wine with his own hands. Cao Cao pours it out on the ground as an oath. Wang Yun brings the sword.",
              "遂亲自酌酒奉操。操沥酒设誓，允随取宝刀与之。"),
            ["still", "seven_star", "slow zoom in"],
            N("Cao Cao hides the sword, finishes his wine and leaves.", "操藏刀，饮酒毕，即起身辞别众官而去。"),
            ["gain", "sevenstar"],
        ]},

        # C16 · The mirror. The boss: two boards. The first attempt fails; the second saves him.
        "c16": {"title": T("The Mirror", "衣镜"), "kind": "main", "steps": [
            ["music", "boss"],
            ["spawn", "dz", "dongzhuo", "c16", 10, -6],
            ["spawn", "lb", "lvbu", "c16", 16, -4],
            ["prop", "bed", "bench", "c16", 10, -8],
            ["prop", "mir", "mirror", "c16", 4, -10],
            ["pose", "dz", "sit"],
            ["boss", "dongzhuo"],
            N("The next day Cao Cao goes to the Chancellor's residence with the sword at his side. Dong Zhuo is in the small pavilion, sitting on his couch, with Lü Bu beside him.",
              "次日，曹操佩着宝刀，来至相府。董卓坐于床上，吕布侍立于侧。"),
            S("dongzhuo", "Why so late, Mengde?", "孟德来何迟？"),
            S("caocao", "My horse is weak, and slow.", "马羸行迟耳。"),
            S("dongzhuo", "Fengxian, some good horses have come in from Xiliang. Go and choose one yourself, and give it to Mengde.",
              "吾有西凉进来好马，奉先可亲去拣一骑赐与孟德。"),
            ["move", "lb", "c16", 40, 4], ["remove", "lb"],
            S("caocao", "The traitor's time has come.", "此贼合死！"),
            N("But Dong Zhuo is very strong, and Cao Cao does not dare move. Dong Zhuo is too fat to sit for long. He lies down, and turns his face to the wall.",
              "即欲拔刀刺之。惧卓力大，未敢轻动。卓胖大不耐久坐，遂倒身而卧，转面向内。"),
            ["pose", "dz", "sleep"],
            ["problem"],  # 1 — the attempt; it fails as written
            S("caocao", "Now he's finished.", "此贼当休矣！"),
            ["move", "caocao", "c16", 8, -4],
            ["pose", "caocao", "strike", "dz"],
            ["still", "the_mirror", "slow zoom in"],
            N("Cao Cao draws the sword. He is about to strike when Dong Zhuo looks up into the dressing mirror, and sees him behind his back with the blade drawn.",
              "急掣宝刀在手。恰待要刺，不想董卓仰面看衣镜中，照见曹操在背后拔刀。"),
            ["pose", "dz", "sit"],
            ["emote", "dz", "!"],
            S("dongzhuo", "Mengde, what are you doing?", "孟德何为？"),
            ["spawn", "lb", "lvbu", "c16", 40, 4], ["move", "lb", "c16", 22, 0],
            N("Lü Bu is already outside the pavilion with the horse.", "时吕布已牵马至阁外。"),
            ["problem"],  # 2 — turning the blade into a gift
            ["pose", "caocao", "kneel"],
            S("caocao", "I have a precious sword, and I wish to present it to Your Excellency.", "操有宝刀一口，献上恩相。"),
            N("Dong Zhuo takes it and looks at it. It is more than a chi long, set with seven jewels, and very sharp: a precious sword indeed. "
              "He hands it to Lü Bu, and Cao Cao gives him the sheath.",
              "卓接视之，见其刀长尺余，七宝嵌饰，极其锋利，果宝刀也；遂递与吕布收了。操解鞘付布。"),
            ["give", "caocao", "lb", "sevenstar"],
            ["pose", "caocao", "stand"],
            ["prop", "horse", "whitehorse", "c16", 26, 4],
            N("Dong Zhuo takes him out to look at the horse.", "卓引操出阁看马。"),
            S("caocao", "May I try him?", "借愿试一骑。"),
            N("Dong Zhuo has a saddle put on it. Cao Cao leads the horse out of the residence, whips it, and rides off to the south-east.",
              "卓就教与鞍辔。操牵马出相府，加鞭望东南而去。"),
            ["gain", "horse"],
            ["move", "caocao", "c16", 50, 10],
            ["victory"],
        ]},

        # C17 · The East Gate. Legwork: the board first. The jailers go to his lodging while he rides.
        "c17": {"title": T("The East Gate", "东门"), "kind": "main", "steps": [
            ["problem"],  # getting through the gate before the word does
            ["spawn", "gk", "f_soldier", "c17", 4, -2],
            N("The gate captain stops him, and asks where he is going.", "门吏问之。"),
            S("caocao", "The Chancellor has sent me on urgent business.", "丞相差我有紧急公事。"),
            ["run", "caocao", "c17", 30, -2],
            ["still", "east_gate", "slow pull back"],
            N("Behind him, at the residence, Lü Bu says: Cao Cao looked like he meant to stab you. When he was caught, he offered the sword. "
              "Li Ru says: send for him. If he comes, it was a gift. If he doesn't, it was murder.",
              "布对卓曰：“适来曹操似有行刺之状，及被喝破，故推献刀。”李儒曰：“今差人往召，如彼无疑而便来，则是献刀；如推托不来，则必是行刺。”"),
            N("Four jailers go to his lodging. They come back: he never went home. He rode out through the East Gate, saying the Chancellor had sent him on urgent business.",
              "即差狱卒四人往唤操。回报曰：“操不曾回寓，乘马飞出东门。门吏问之，操曰：丞相差我有紧急公事，纵马而去矣。”"),
            ["still", "wanted", "slow zoom in"],
            N("Dong Zhuo is furious. Orders go out everywhere, with Cao Cao's portrait: a thousand gold and a marquisate of ten thousand households for whoever takes him. "
              "Whoever hides him shares his crime.",
              "卓大怒，遂令遍行文书，画影图形，捉拿曹操。擒献者，赏千金，封万户侯；窝藏者同罪。"),
        ]},

        # C18 · Zhongmou. Contest, fails: the disguise does not hold.
        "c18": {"title": T("Zhongmou", "中牟"), "kind": "main", "steps": [
            ["army", "pass", "f_soldier", 4, "c18", 6, -4],
            ["spawn", "cg", "chengong", "c18", 14, -8],
            N("Cao Cao rides hard for his home in Qiao. At the pass of Zhongmou county the guards seize him, and take him to the magistrate.",
              "且说曹操逃出城外，飞奔谯郡。路经中牟县，为守关军士所获，擒见县令。"),
            S("caocao", "I'm a travelling merchant. My name is Huangfu.", "我是客商，复姓皇甫。"),
            N("The magistrate looks at him closely for a long time.", "县令熟视曹操，沉吟半晌。"),
            ["problem"],
            S("chengong", "When I was in Luoyang looking for office, I knew you. You are Cao Cao. Why hide it? "
              "Lock him up. Tomorrow he goes to the capital, for the reward.",
              "吾前在洛阳求官时，曾认得汝是曹操，如何隐讳？且把来监下，明日解去京师请赏。"),
            N("The guards at the pass are given wine and food, and go.", "把关军士赐以酒食而去。"),
        ]},

        # C19 · The back courtyard. Contest: Chen Gong frees him.
        "c19": {"title": T("The Back Courtyard", "后院审曹"), "kind": "main", "steps": [
            ["light", "night"],
            ["spawn", "cg", "chengong", "c19", 8, -4],
            N("At midnight the magistrate has his own man bring Cao Cao out in secret, into the back courtyard, to question him.",
              "至夜分，县令唤亲随人暗地取出曹操，直至后院中审究。"),
            S("chengong", "I hear the Chancellor treated you well. Why bring this on yourself?", "我闻丞相待汝不薄，何故自取其祸？"),
            S("caocao", "What do sparrows know of the swan's ambitions? You've caught me. Take me in for the reward.",
              "燕雀安知鸿鹄志哉！汝既拿住我，便当解去请赏。"),
            N("The magistrate sends everyone away.", "县令屏退左右。"),
            S("chengong", "Don't look down on me. I'm no ordinary official. I just haven't found the right master.", "汝休小觑我。我非俗吏，奈未遇其主耳。"),
            ["problem"],
            S("caocao", "My forefathers have eaten the Han's bread for generations. If I didn't think of repaying it, how would I be better than a beast? "
              "I bent myself to serve Dong Zhuo so I could get close and rid the realm of him. It failed. That is Heaven's will.",
              "吾祖宗世食汉禄，若不思报国，与禽兽何异？吾屈身事卓者，欲乘间图之，为国除害耳。今事不成，乃天意也！"),
            S("chengong", "And where will you go now, Mengde?", "孟德此行，将欲何往？"),
            S("caocao", "Home. I'll send out an edict in the Emperor's name and call every lord in the realm to raise troops and kill Dong Zhuo. That is all I want.",
              "吾将归乡里，发矫诏，召天下诸侯兴兵共诛董卓，吾之愿也。"),
            ["pose", "cg", "kneel"],
            ["still", "cg_unties", "slow zoom in"],
            N("The magistrate unties him with his own hands, seats him in the place of honour, and bows twice.", "县令闻言，乃亲释其缚，扶之上坐，再拜。"),
            S("chengong", "You truly are the most loyal man in the realm!", "公真天下忠义之士也！"),
            S("chengong", "My name is Chen Gong. My mother, my wife and my children are in Dongjun. Your loyalty has moved me. "
              "I'll give up my post and go with you.",
              "吾姓陈，名宫，字公台。老母妻子，皆在东郡。今感公忠义，愿弃一官，从公而逃。"),
            N("That night Chen Gong gathers money for the road. They change into plain clothes, each with a sword on his back, and ride for Cao Cao's home.",
              "是夜陈宫收拾盘费，与曹操更衣易服，各背剑一口，乘马投故乡来。"),
            ["remove", "cg"],
            ["party", ["caocao", "chengong"]],
        ]},

        # C20 · Lü Boshe. No board (user's call: overhear on foot; the killing as darkness and sound; the pig as a still; then the road).
        "c20": {"title": T("Lü Boshe", "吕伯奢"), "kind": "main", "steps": [
            ["light", "dusk"],
            ["spawn", "lbs", "lvboshe", "c20", 10, -4],
            N("Three days on, at Chenggao, as the light fails. Cao Cao points his whip into the deep wood.", "行了三日，至成皋地方，天色向晚。操以鞭指林深处。"),
            S("caocao", "A man named Lü Boshe lives there. He's my father's sworn brother. Let's ask for news of home, and a bed for the night.",
              "此间有一人姓吕，名伯奢，是吾父结义弟兄；就往问家中消息，觅一宿，如何？"),
            S("chengong", "Good.", "最好。"),
            S("lvboshe", "I hear the court has sent out warrants for you everywhere. Your father has fled to Chenliu. How did you get here?",
              "我闻朝廷遍行文书，捉汝甚急，汝父已避陈留去了。汝如何得至此？"),
            S("caocao", "If it weren't for Magistrate Chen here, I'd have been ground to powder.", "若非陈县令，已粉骨碎身矣。"),
            ["pose", "lbs", "bow"],
            S("lvboshe", "Sir, if not for you, the whole Cao family would have died. Rest easy. You'll sleep here tonight. "
              "I have no good wine in the house. Let me go to the west village and buy some.",
              "小侄若非使君，曹氏灭门矣。使君宽怀安坐，今晚便可下榻草舍。老夫家无好酒，容往西村沽一樽来相待。"),
            ["move", "lbs", "c20", 50, 6], ["remove", "lbs"],
            ["wait", 1500],
            N("They sit a long time. Then, from behind the house, comes the sound of a blade being sharpened.", "操与宫坐久，忽闻庄后有磨刀之声。"),
            S("caocao", "Lü Boshe is no close kin of mine, and he went off in a hurry. Let's listen.", "吕伯奢非吾至亲，此去可疑，当窃听之。"),
            ["move", "caocao", "c20", -8, -14], ["move", "chengong", "c20", -6, -12],
            ["pose", "caocao", "crouch"], ["pose", "chengong", "crouch"],
            N("They creep round behind the thatched hall. A voice says: Tie it up and kill it. How about that?", "二人潜步入草堂后，但闻人语曰：“缚而杀之，何如？”"),
            S("caocao", "So that's it. If we don't strike first, we'll be taken.", "是矣！今若不先下手，必遭擒获。"),
            ["mood", "dark"],
            N("They draw their swords and go in. They kill everyone, men and women, eight in all.", "遂与宫拔剑直入，不问男女，皆杀之，一连杀死八口。"),
            ["wait", 1500],
            ["mood", "clear"],
            ["prop", "pig", "pig", "c20", -14, -16],
            ["still", "boshe_pig", "slow zoom in"],
            N("In the kitchen they find a pig, tied up, ready to be killed.", "搜至厨下，却见缚一猪欲杀。"),
            S("chengong", "You were too suspicious, Mengde. We've killed good people!", "孟德心多，误杀好人矣！"),
            ["remove", "pig"],
            N("They mount in haste and ride. Less than two li on, they meet Lü Boshe, two jars of wine hanging from his saddle, fruit and greens in his hand.",
              "急出庄上马而行。行不到二里，只见伯奢驴鞍前鞒悬酒二瓶，手携果菜而来。"),
            ["spawn", "lbs", "lvboshe", "c20", 40, 4], ["move", "lbs", "c20", 24, 2],
            S("lvboshe", "Nephew, sir, why are you leaving?", "贤侄与使君何故便去？"),
            S("caocao", "A wanted man can't stay long anywhere.", "被罪之人，不可久住。"),
            S("lvboshe", "I've told the household to kill a pig for you. Why not stay the night? Turn back, quickly.",
              "吾已分付家人宰一猪相款，贤侄、使君何憎一宿？速请转骑。"),
            ["move", "caocao", "c20", 30, 6],
            N("Cao Cao rides on without a word. A few paces on, he draws his sword and turns back.", "操不顾，策马便行。行不数步，忽拔剑复回。"),
            S("caocao", "Who is that coming?", "此来者何人？"),
            ["still", "boshe_road", "slow zoom in"],
            N("Lü Boshe turns his head to look, and Cao Cao cuts him down from his donkey.", "伯奢回头看时，操挥剑砍伯奢于驴下。"),
            ["pose", "lbs", "fall"],
            S("chengong", "That was a mistake before. What is this?", "适才误耳，今何为也？"),
            S("caocao", "When Lü Boshe got home and saw so many dead, would he let it rest? He'd come after us with men, and that would be the end of us.",
              "伯奢到家，见杀死多人，安肯干休？若率众来追，必遭其祸矣。"),
            S("chengong", "To kill a man knowing he's innocent is a great wrong!", "知而故杀，大不义也！"),
            S("caocao", "I would rather wrong the whole world than let the world wrong me.", "宁教我负天下人，休教天下人负我。"),
            N("Chen Gong says nothing.", "陈宫默然。"),
            ["remove", "lbs"],
            ["party", ["chengong"], {"to": "c21"}],
        ]},

        # C21 · The inn. Played as Chen Gong; no board. Hands back to Cao Cao, who wakes alone.
        "c21": {"title": T("The Inn", "客店"), "kind": "main", "steps": [
            ["light", "night"],
            ["spawn", "cc", "caocao", "c21", 6, -6],
            ["pose", "cc", "sleep"],
            N("That night they ride a few li more, and knock up an inn by moonlight. They feed the horses. Cao Cao falls asleep first.",
              "当夜行数里，月明中敲开客店门投宿。喂饱了马，曹操先睡。"),
            S("chengong", "I thought Cao Cao was a good man, and I gave up my post to follow him. He's a man with a cruel heart. "
              "Leave him alive today, and there'll be trouble later.",
              "我将谓曹操是好人，弃官跟他；原来是个狠心之徒！今日留之，必为后患。"),
            ["move", "chengong", "c21", 4, -4],
            ["pose", "chengong", "strike", "cc"],
            ["still", "cg_inn", "slow zoom in"],
            N("He draws his sword to kill Cao Cao. Then he stops.", "便欲拔剑来杀曹操。忽转念曰："),
            S("chengong", "I followed him this far for the sake of the realm. To kill him would be a wrong too. Better to leave him, and go elsewhere.",
              "我为国家跟他到此，杀之不义。不若弃而他往。"),
            ["pose", "chengong", "stand"],
            N("He sheathes his sword, mounts, and rides for Dongjun before it is light.", "插剑上马，不等天明，自投东郡去了。"),
            N("A heart that cruel is no good man. Cao Cao and Dong Zhuo are of one kind.", "设心狠毒非良士，操卓原来一路人。"),
            ["move", "chengong", "c21", 40, 6],
            ["light", "dawn"],
            ["pose", "cc", "stand"],
            ["remove", "cc"],
            ["party", ["caocao"], {"to": "c21"}],
        ]},

        # C22 · Wei Hong. Legwork: the board first.
        "c22": {"title": T("Wei Hong", "卫弘"), "kind": "main", "steps": [
            ["problem"],  # winning over Wei Hong
            ["spawn", "wh", "weihong", "c22", 10, -4],
            ["prop", "tbl", "table", "c22", 8, 0],
            N("Cao Cao wakes to find Chen Gong gone. That man heard what I said, and thinks me cruel. I must move fast, and not stay. "
              "He rides through the night to Chenliu, finds his father, and tells him everything. He means to spend the family's money raising an army. "
              "His father tells him it is too little, and that there is a man here, Wei Hong, generous, upright, and very rich.",
              "操觉，不见陈宫，寻思：“此人见我说了这两句，疑我不仁，弃我而去；吾当急行，不可久留。”遂连夜到陈留，寻见父亲，备说前事；欲散家资，招募义兵。父言：“资少恐不成事。此间有孝廉卫弘，疏财仗义，其家巨富；若得相助，事可图矣。”"),
            N("Cao Cao sets out a feast and invites Wei Hong.", "操置酒张筵，拜请卫弘到家。"),
            S("caocao", "The Han has no master. Dong Zhuo holds all power, cheats the Emperor and harms the people, and the whole realm grinds its teeth. "
              "I want to hold up the dynasty, but I haven't the strength. You are a loyal man. I've come to ask your help.",
              "今汉室无主，董卓专权，欺君害民，天下切齿。操欲力扶社稷，恨力不足。公乃忠义之士，敢求相助。"),
            S("weihong", "I've had that wish a long time. I just never met a hero. If you have such ambitions, Mengde, my fortune is yours.",
              "吾有是心久矣，恨未遇英雄耳。既孟德有大志，愿将家资相助。"),
            ["gain", "weihong"],
        ]},

        # C23 · The white banner. No board: the officers come of their own will, as in the novel.
        "c23": {"title": T("The White Banner", "忠义白旗"), "kind": "main", "steps": [
            ["prop", "banner", "whitebanner", "c23", 0, -8],
            ["still", "white_banner", "slow pull back"],
            N("Cao Cao sends out a forged edict in the Emperor's name, and raises a white banner to call for volunteers. On it are two words: Loyalty and Right.",
              "于是先发矫诏，驰报各道，然后招集义兵，竖起招兵白旗一面，上书“忠义”二字。"),
            ["crowd", 3],
            N("Within days, volunteers pour in like rain.", "不数日间，应募之士，如雨骈集。"),
            ["spawn", "yj", "yuejin", "c23", 30, 6], ["move", "yj", "c23", 8, 4],
            ["spawn", "ld", "lidian", "c23", 32, 8], ["move", "ld", "c23", 10, 6],
            N("Yue Jin of Yangping comes, and Li Dian of Shanyang. Cao Cao keeps them both on his staff.", "阳平卫国人乐进、山阳巨鹿人李典，来投曹操。操皆留为帐前吏。"),
            ["spawn", "xhd", "xiahoudun", "c23", 34, -4], ["move", "xhd", "c23", 12, -2],
            ["spawn", "xhy", "xiahouyuan", "c23", 36, -2], ["move", "xhy", "c23", 14, 0],
            ["crowd", "+3"],
            N("Xiahou Dun comes with a thousand men, and his cousin Xiahou Yuan with another thousand. Xiahou Dun once killed a man for insulting his teacher, and had to flee.",
              "夏侯惇，自小习枪棒；有人辱骂其师，惇杀之，逃于外方；闻知曹操起兵，与其族弟夏侯渊两个，各引壮士千人来会。"),
            S("xiahoudun", "Brother, we heard you'd raised the banner. Here we are.", "闻兄起兵，特来相会。"),
            ["spawn", "cr", "caoren", "c23", 36, 8], ["move", "cr", "c23", 14, 8],
            ["spawn", "ch", "caohong", "c23", 38, 10], ["move", "ch", "c23", 16, 10],
            ["crowd", "+3"],
            N("Then his own clansmen, Cao Ren and Cao Hong, come with more than a thousand men each. Wei Hong spends his whole fortune on armour and banners. "
              "Grain comes in from every side.",
              "不数日，曹氏兄弟曹仁、曹洪，各引兵千余来助。卫弘尽出家财，置办衣甲旗幡。四方送粮者，不计其数。"),
            ["spawn", "ys", "yuanshao", "c23", 50, 0], ["move", "ys", "c23", 20, -4],
            N("Yuan Shao receives the edict, and comes from Bohai with thirty thousand men. Cao Cao writes the call to arms, and sends it to every commandery.",
              "时袁绍得操矫诏，乃聚麾下文武，引兵三万，离渤海来与曹操会盟。操作檄文以达诸郡。"),
            ["prop", "ltr", "letter", "c23", 4, -2],
            S("caocao", "We proclaim to the realm: Dong Zhuo deceives Heaven and Earth. He has destroyed the state and murdered the Emperor, "
              "defiled the palace and slaughtered the people. His crimes are piled high. "
              "We have gathered a righteous army, and sworn to sweep the land clean. Raise your armies! Uphold the house of Han! Save the people! "
              "When this reaches you, act at once!",
              "操等谨以大义布告天下：董卓欺天罔地，灭国弑君；秽乱宫禁，残害生灵；狼戾不仁，罪恶充积！今奉天子密诏，大集义兵，誓欲扫清华夏，剿戮群凶。望兴义师，共泄公愤；扶持王室，拯救黎民。檄文到日，可速奉行！"),
            N("The call goes out. Seventeen lords answer, and their armies march. In Pingyuan, a magistrate named Liu Bei hears the news…",
              "檄文发去，十七镇诸侯应之，各起兵来。平原县令刘备闻知……"),
        ]},
    }


def _nodes_caocao():
    def node(key, x, y, scene, room=None, place="Luoyang", role="main", **extra):
        n = {"key": key, "x": x, "y": y, "role": role, "place": place, "scene": scene}
        if room:
            n["room"] = room
        n.update(extra)
        return n
    return [
        node("c1", 40, 200, "c1", room="hj-hall", board=False),
        node("c2", 55, 192, "c2", dilemma=D(
            "caocao", "Keep He Jin out of the palace.", "劝何进勿入宫。",
            "He laughs at me. One more try, before he walks through that gate.", "他笑我是小儿之见。在他进门之前，再劝一次。",
            "I've said all I can.", "该说的，都说了。",
            "He isn't listening. Find other words.", "他听不进。换个说法。")),
        node("c3", 70, 184, "c3", dilemma=D(
            "caocao", "Get the fire under control, and find the Emperor.", "救灭宫火，寻觅天子。",
            "The palace is burning and the Emperor is gone. First things first.", "宫中火起，天子不知去向。先后要分清。",
            "The fires are out. The search is out.", "火已救灭，兵已四出。",
            "Not that way. The fire is spreading.", "不对，火势在蔓延。")),
        node("c4", 85, 176, "c4", place="Beimang", dilemma=D(
            "chenliu", "Find a way out of the dark.", "黑暗中寻一条活路。",
            "Thorns everywhere, and no path. My brother is crying.", "满地荆棘，不见行路。兄长在哭。",
            "There! A light.", "看！有光。",
            "Not that way. Thorns.", "那边不通，全是荆棘。")),
        node("c5", 100, 168, "c5", place="Beimang", dilemma=D(
            "chenliu", "Answer for your brother.", "替兄长答话。",
            "My brother can't speak. Someone has to.", "兄长说不出话。总得有人说。",
            "He is getting down from his horse.", "他下马了。",
            "Not like that. Stand straighter.", "不是这样。站直些。")),
        node("c6", 115, 160, "c6", dilemma=D(
            "dongzhuo", "Put the deposition to the court.", "当众议废立。",
            "Those who follow me live. Let them see who rules here.", "顺我者生。让他们看清，谁说了算。",
            "No one dares speak.", "无人敢出声。",
            "Not yet. Let them be more afraid.", "还不行。让他们再怕些。")),
        node("c7", 130, 152, "c7", place="The Camps", room="dz-tent", board=False),
        node("c8", 140, 146, "c8", place="The Camps", board=False,
             gate=[{"needs": ["item:redhare"], "else": "c8_wait",
                    "objective": T("Fetch Red Hare from the stable master, at the stables on the field side of the camp.", "到营寨临原野一侧的马厩，向马夫牵出赤兔马。"),
                    "count": False, "at": "The Camps"}]),
        node("c9", 155, 140, "c9", place="The Camps", room="lb-tent",
             gate=[{"needs": ["item:gold"], "else": "c9_wait",
                    "objective": T("Fetch the gold, the pearls and the jade belt from the paymaster's tent, just east of the Grand Preceptor's.", "到太师帐东边不远的支应帐，取黄金、明珠与玉带。"),
                    "count": False, "at": "The Camps"}]),
        node("c10", 170, 134, "c10", place="The Camps", room="dy-tent", board=False),
        node("c11", 185, 128, "c11", room="sheng-hall", board=False),
        node("c12", 200, 122, "c12", room="jiade-hall", board=False),
        node("c13", 212, 116, "c13", board=False),
        node("c14", 224, 110, "c14", board=False),
        node("c15", 236, 104, "c15", room="wyl-rearhall", dilemma=D(
            "caocao", "Ask for the Seven-Star Sword.", "借七星宝刀。",
            "They weep, and weeping kills no one. Make the old man trust me with it.", "众官只会哭，哭死不了董卓。要教老司徒信我。",
            "He pours for me himself.", "他亲自为我斟酒。",
            "He's still angry. Not like that.", "他还在恼。不是这样说。")),
        node("c16", 250, 98, "c16", room="xf-pavilion", role="boss"),
        node("c17", 262, 92, "c17", dilemma=D(
            "caocao", "Get through the East Gate.", "闯出东门。",
            "Before he wonders why I don't come back.", "趁他还没起疑。",
            "Through.", "出来了。",
            "The gate captain is looking. Steady.", "门吏在看。稳住。")),
        node("c18", 280, 84, "c18", place="The East Road", dilemma=D(
            "caocao", "Pass for a merchant named Huangfu.", "冒作客商皇甫。",
            "My face is on every wall from here to Luoyang.", "从这里到洛阳，处处都挂着我的画像。",
            "He's still looking at me.", "他还在看我。",
            "Too eager. A merchant wouldn't say that.", "太急了。客商不会这么说。")),
        node("c19", 292, 78, "c19", place="The East Road", room="jail-court", dilemma=D(
            "caocao", "Tell him why.", "告诉他，为什么。",
            "He sent the others away. He wants the truth.", "他屏退了左右。他要听真话。",
            "He's untying me.", "他亲手为我松绑。",
            "That isn't the truth. Again.", "那不是真话。再说。")),
        node("c20", 306, 72, "c20", place="Chenggao", room="lbs-hall", board=False),
        node("c21", 318, 66, "c21", place="Chenggao", room="inn-room", board=False),
        node("c22", 334, 60, "c22", place="Chenliu", room="wh-hall", dilemma=D(
            "caocao", "Win over Wei Hong.", "说动卫弘。",
            "My father's money won't raise an army. His will.", "家资不足以成事。卫弘的可以。",
            "His fortune is ours.", "家资尽付。",
            "Not that. He's a man of honour, not a merchant.", "不是这样。他是义士，不是商人。")),
        node("c23", 348, 54, "c23", place="Chenliu", board=False),
    ]


def _multi_dilemmas_cc():
    return {
        "c9": [
            D("lisu", "Make him ashamed of his master.", "教他耻于其主。",
              "He's drunk and pleased with his horse. Now remind him whose son he is.", "他喝得正酣，又得了好马。此时提一提，他是谁的儿子。",
              "He says he has no choice.", "他说，他是出于无奈。",
              "Too blunt. He'll take offence.", "太直了。他会恼。"),
            D("lisu", "Show him a better master.", "指给他一个明主。",
              "He says he has no master worth the name. Give him one.", "他说他未逢其主。那就给他一个。",
              "He wants a way in.", "他想要一条门路。",
              "Not yet. He isn't ready to hear the name.", "还不行。他还不愿听这个名字。"),
            D("lisu", "Lay out the gold.", "献上金珠。",
              "He wants it. Let him see what it's worth.", "他动心了。让他看看值多少。",
              "I'll kill Ding Yuan, he says.", "他说，要杀丁原。",
              "He's hesitating. Hold.", "他还在犹豫。稳住。"),
        ],
        "c16": [
            D("caocao", "Strike while his back is turned.", "趁他背身，下手。",
              "He's lying down with his face to the wall. Lü Bu is gone. Now.", "他转面向内而卧。吕布已去。就是此刻。",
              "The blade is out.", "刀已出鞘。",
              "He's stirring. Wait.", "他在动。再等等。"),
            D("caocao", "Turn the blade into a gift.", "将刀化作礼物。",
              "He saw me in the mirror. Lü Bu is at the door. One breath to think.", "他从镜中看见了我。吕布已到门外。只有一口气的工夫。",
              "He takes the sword, and admires it.", "他接过刀，赞不绝口。",
              "He's reaching for help. Think again.", "他要喊人了。再想。"),
        ],
    }


_EDGES_CAOCAO = [["c1", "c2"], ["c2", "c3"], ["c3", "c4"], ["c4", "c5"], ["c5", "c6"], ["c6", "c7"], ["c7", "c8"], ["c8", "c9"],
                 ["c9", "c10"], ["c10", "c11"], ["c11", "c12"], ["c12", "c13"], ["c13", "c14"], ["c14", "c15"], ["c15", "c16"],
                 ["c16", "c17"], ["c17", "c18"], ["c18", "c19"], ["c19", "c20"], ["c20", "c21"], ["c21", "c22"], ["c22", "c23"]]

_ITEMS_CAOCAO = {
    "redhare": {"name": "Red Hare", "zh": "赤兔马", "kind": "treasure"},
    "gold": {"name": "Gold, pearls and a jade belt", "zh": "黄金、明珠、玉带", "kind": "treasure"},
    "sevenstar": {"name": "The Seven-Star Sword", "zh": "七星宝刀", "kind": "treasure"},
    "weihong": {"name": "Wei Hong's fortune", "zh": "卫弘家资", "kind": "treasure"},
    # The Xiliang horse Dong Zhuo gives him in c16. He and Chen Gong ride from then on (「乘馬投故鄉來」).
    "horse": {"name": "A horse from the Chancellor's stable", "zh": "相府良马", "kind": "mount",
              "coats": {"caocao": "white", "chengong": "brown"}},
}

# Closes the Cao Cao arc and bridges to the Diaochan arc: chapters 5-7 in a few lines, in the novel's own order.
_CLOSING_CAOCAO = [
    ["scroll", T("The Coalition", "诸侯会盟"), [
        T("Eighteen lords answered Cao Cao's call, with Yuan Shao as their leader. Among those who came with Gongsun Zan were Liu Bei and his sworn brothers, Guan Yu and Zhang Fei.",
          "十八路诸侯应操之召，共推袁绍为盟主。随公孙瓒而来的，有刘备与他的结义兄弟关羽、张飞。"),
        T("At Sishui Pass, Guan Yu cut down Dong Zhuo's champion Hua Xiong before the wine Cao Cao had poured him was cold. At Hulao Pass the three brothers fought Lü Bu together, and drove him back.",
          "汜水关前，关羽温酒斩华雄。虎牢关下，三英战吕布。"),
        T("Dong Zhuo burned Luoyang and drove the Emperor and millions of people west to Chang'an. Cao Cao pursued him alone, and barely escaped with his life. In the ruins, Sun Jian found the Imperial Seal in a well.",
          "董卓火烧洛阳，驱天子与百姓数百万口西迁长安。曹操独自追击，几乎丧命。孙坚在废墟井中得了传国玉玺。"),
        T("Then the lords fell out, and went home to fight one another. Dong Zhuo was left master of Chang'an.",
          "诸侯各怀异心，散归本镇，自相攻伐。董卓独据长安。"),
    ]],
]

# Opens the Diaochan arc for a player who starts here (each book stands on its own).
_OPENING_CHAIN = [
    ["scroll", T("Chapter 8", "第八回"), [
        T("Minister Wang cleverly sets the chain of schemes; Grand Preceptor Dong storms the Phoenix Pavilion.",
          "王司徒巧使连环计，董太师大闹凤仪亭。"),
        T("Dong Zhuo has burned Luoyang and moved the court west to Chang'an. The lords who rose against him have fallen to fighting one another.",
          "董卓火烧洛阳，迁都长安。起兵讨董的诸侯，已自相攻伐。"),
        T("In Chang'an he does as he pleases, with Lü Bu, the strongest warrior alive, at his side as his adopted son. No minister dares to speak.",
          "长安城中，董卓为所欲为。天下第一猛将吕布，是他的义子，随侍左右。满朝公卿，无人敢言。"),
    ]],
]

_OPENING_CAOCAO = [
    ["scroll", T("Chapter 3", "第三回"), [
        T("At the Wenming council Dong Zhuo shouts down Ding Yuan; with gold and pearls Li Su wins over Lü Bu.",
          "议温明董卓叱丁原，馈金珠李肃说吕布。"),
        T("The Han has ruled for four hundred years. Emperor Ling is dead, and his young son is on the throne.",
          "汉室传四百年。灵帝崩，少帝即位。"),
        T("The palace belongs to the eunuchs, the Ten Attendants. The army belongs to He Jin, the Empress Dowager's brother, who began life as a butcher.",
          "宫中十常侍弄权；大将军何进，太后之兄，本屠户出身，掌天下兵马。"),
        T("He Jin means to destroy the eunuchs, and he has been advised to call the frontier armies into the capital to do it.",
          "何进欲诛宦官，有人献计：召外兵入京。"),
    ]],
]


def _world():
    scenes = {}
    scenes.update(_scenes_chain())
    return {
        "n": 2,
        "name": T("Hulao Pass", "虎牢关"),
        "zh": "虎牢关",
        "chapters": [3, 4, 5, 6, 7, 8, 9],
        "couplets": [
            ["王司徒巧使连环计　董太师大闹凤仪亭",
             "Minister Wang cleverly sets the chain of schemes; Grand Preceptor Dong storms the Phoenix Pavilion"],
            ["除暴凶吕布助司徒　犯长安李傕听贾诩",
             "Lü Bu helps the Minister rid the realm of a tyrant; Li Jue takes Jia Xu's advice and attacks Chang'an"],
        ],
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["wangyun"],
        "lead_portrait": True,   # the go board shows whoever leads the party (tk.js tkDuelBuild)
        "items": _ITEMS,
        "nodes": [dict(n, dilemma=_multi_dilemmas()[n["key"]]) if n["key"] in _multi_dilemmas() else n for n in _nodes_chain()],
        "edges": _EDGES_CHAIN,
        "scenes": scenes,
        "opening": _OPENING_CHAIN,
        "closing": [],
    }


WORLD2 = _world()


def _world_caocao():
    multi = _multi_dilemmas_cc()
    return {
        "n": 2,
        "name": T("Hulao Pass", "虎牢关"),
        "zh": "虎牢关",
        "chapters": [3, 4, 5],
        "couplets": [
            ["议温明董卓叱丁原　馈金珠李肃说吕布",
             "At the Wenming council Dong Zhuo shouts down Ding Yuan; with gold and pearls Li Su wins over Lü Bu"],
            ["废汉帝陈留为皇　谋董贼孟德献刀",
             "The Han Emperor is deposed and the Prince of Chenliu enthroned; plotting against Dong Zhuo, Mengde presents a sword"],
        ],
        "grades": ["11K", "11K+"],
        "boss": "redmond",
        "party": ["caocao"],
        "lead_portrait": True,
        "items": _ITEMS_CAOCAO,
        "nodes": [dict(n, dilemma=multi[n["key"]]) if n["key"] in multi else n for n in _nodes_caocao()],
        "edges": _EDGES_CAOCAO,
        "scenes": _scenes_caocao(),
        "opening": _OPENING_CAOCAO,
        "closing": _CLOSING_CAOCAO,
    }


# The Cao Cao arc as its own world, so it can be built as a separate test book without touching the Diaochan chain.
WORLD2_CC = _world_caocao()
