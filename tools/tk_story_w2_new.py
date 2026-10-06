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
    "wangyun": "zm_010", "diaochan": "zf_023", "lvbu": "zm_097", "liru": "zm_012", "lisu": "zm_015",
    "zhangwen": "zm_020", "shisunrui": "zm_031", "huangwan": "zm_035", "dongmu": "zf_022",
    "caiyong": "zm_091", "mamidi": "zm_037", "lijue": "zm_058", "guosi": "zm_061", "jiaxu": "zm_050",
    "xiandi": "zf_002", "niufu": "zm_054", "huchier": "zm_056", "daoren": "zm_080",
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
            ["spawn", "dc", "diaochan", "a2", 14, -4],
            N("Late at night, under a bright moon, Wang Yun walks into the rear garden leaning on his staff. "
              "He stands by the rose trellis, looks up at the sky, and weeps.",
              "至夜深月明，王允策杖步入后园，立于荼蘼架侧，仰天垂泪。"),
            N("Then he hears someone sighing by the peony pavilion. He steps softly closer to look. "
              "It is Diaochan, the singing girl of his household.",
              "忽闻有人在牡丹亭畔，长吁短叹。允潜步窥之，乃府中歌伎貂蝉也。"),
            ["still", "dc_garden", "slow zoom in"],
            N("She was chosen as a small girl and brought up in his house, and taught to sing and dance. "
              "She is sixteen, as gifted as she is beautiful, and Wang Yun treats her as his own daughter.",
              "其女自幼选入府中，教以歌舞，年方二八，色伎俱佳，允以亲女待之。"),
            ["move", "wangyun", "a2", 8, -2],
            ["emote", "dc", "!"],
            S("wangyun", "Shameless girl! Are you meeting a lover?", "贱人将有私情耶？"),
            ["pose", "dc", "kneel"],
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
            ["prop", "car", "cart", "a5", -12, 8],
            ["board", "diaochan", "car"],
            N("Wang Yun has a felt-covered carriage made ready, and sends Diaochan ahead to the Chancellor's residence.",
              "允即命备毡车，先将貂蝉送到相府。"),
            ["move", "car", "a5", -40, 8],
            ["remove", "car"],
            ["party", ["wangyun"]],
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
            ["party", ["diaochan"]],
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
            ["spawn", "dz", "dongzhuo", "a7", 24, 0],
            ["move", "lb", "a7", 20, 4],
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
            ["prop", "car", "cart", "a10", 0, 10],
            ["board", "diaochan", "car"],
            ["army", "crowd", "f_official", 6, "a10", -20, 14],
            ["spawn", "lb", "lvbu", "a10", -26, 10],
            ["still", "dc_carriage", "slow zoom in"],
            N("From the carriage, Diaochan sees Lü Bu far off in the crowd, gazing at it. She covers her face, as if weeping bitterly.",
              "貂蝉在车上，遥见吕布于稠人之内，眼望车中。貂蝉虚掩其面，如痛哭之状。"),
            ["move", "car", "a10", 50, 10],
            ["remove", "car"], ["remove", "crowd"], ["remove", "lb"],
            ["party", ["wangyun"]],
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
            ["prop", "car", "cart", "a13a", 16, 0],
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
            ["party", ["wangyun"]],
        ]},

        # A14 · The North Side Gate. The boss: three boards on the way to "There is an edict to kill a traitor!"
        "a14": {"title": T("There Is an Edict to Kill a Traitor", "有诏讨贼"), "kind": "main", "steps": [
            ["music", "boss"],
            ["army", "officials", "f_official", 6, "a14", 18, -10],
            ["spawn", "dz", "dongzhuo", "a14", 40, 0],
            ["prop", "car", "cart", "a14", 40, 0], ["board", "dz", "car"],
            ["spawn", "ls", "lisu", "a14", 36, 6],
            ["spawn", "lb", "lvbu", "a14", 48, 0],
            N("The officials, in court dress, line the road to greet him. Li Su walks beside the carriage with a drawn sword in his hand. "
              "At the North Side Gate the guards are all stopped outside. Only the twenty-odd men drawing the carriage go in with it.",
              "卓进朝，群臣各具朝服，迎谒于道。李肃手执宝剑扶车而行。到北掖门，军兵尽挡在门外，独有御车二十余人同入。"),
            ["move", "car", "a14", 20, 0], ["move", "ls", "a14", 18, 6], ["move", "lb", "a14", 28, 0],
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
            ["pose", "lb", "strike"], ["fx", "flash", "a14", 12, 0], ["pose", "dz", "fall"],
            N("One thrust of his halberd goes through Dong Zhuo's throat, and Li Su takes the head.", "一戟直刺咽喉，李肃早割头在手。"),
            ["still", "dz_gate", "slow pull back"],
            N("Lü Bu holds his halberd in his left hand, draws the edict from his breast with his right, and cries out:",
              "吕布左手持戟，右手怀中取诏，大呼曰："),
            S("lvbu", "By the Emperor's edict, the traitor Dong Zhuo is slain! No one else will be punished!", "奉诏讨贼臣董卓，其余不问！"),
            N("Officers and officials all cry: Long live the Emperor!", "将吏皆呼万岁。"),
            ["victory"],
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
            ["party", ["lvbu"]],
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
            ["party", ["wangyun"]],
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
            ["party", ["jiaxu"]],
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
        ]},
        "a16b": {"title": T("Fear", "众皆惊惶"), "kind": "main", "steps": [
            ["problem"],
            ["army", "villagers", "f_villager", 6, "a16b", 14, 0],
            N("By the second village it has run ahead of them. The people are terrified.", "众皆惊惶。"),
            ["emote", "villagers", "sweat"],
        ]},
        "a16c": {"title": T("Will You Follow Me?", "能从我反乎"), "kind": "main", "steps": [
            ["problem"],
            ["army", "villagers", "f_villager", 6, "a16c", 14, 0],
            N("In the third, they put the question plainly: Why die for nothing? Will you rise with us? And every man will.",
              "乃复扬言曰：“徒死无益，能从我反乎？”众皆愿从。"),
            ["pose", "villagers", "cheer"],
        ]},
        "a16m": {"title": T("The March on Chang'an", "杀奔长安"), "kind": "main", "steps": [
            ["army", "host", "rebel", 9, "a16m", 20, 0],
            N("They gather more than a hundred thousand men, split them into four columns, and march on Chang'an. "
              "On the road they meet Dong Zhuo's son-in-law, Niu Fu, coming with five thousand men to avenge him. Li Jue joins forces with him, "
              "and sends him on ahead.",
              "于是聚众十余万，分作四路，杀奔长安来。路逢董卓女婿中郎将牛辅，引军五千人，欲去与丈人报仇，李傕便与合兵，使为前驱。"),
            ["move", "host", "a16m", 60, 0],
            ["party", ["lijue"]],
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
            ["party", ["wangyun"]],
        ]},

        # A18 · Xuanping Gate. No board: Wang Yun's choice, which the novel has already made.
        "a18": {"title": T("Wang Yun Is Here", "王允在此"), "kind": "main", "steps": [
            ["light", "dusk"],
            N("A few days later, Li Meng and Wang Fang, Dong Zhuo's men still inside the city, secretly open the gates, and the rebel armies pour in from all four sides.",
              "数日之后，董卓余党李蒙、王方在城中为贼内应，偷开城门，四路贼军一齐拥入。"),
            ["spawn", "lb", "lvbu", "a18", 20, 0], ["run", "lb", "a18", 8, 0],
            S("lvbu", "It's hopeless! Mount up, Minister, and come out through the pass with me. We'll find another way.", "势急矣！请司徒上马，同出关去，别图良策。"),
            S("wangyun", "If the spirits of the dynasty help me bring the realm to peace, that is all I wish. If not, I give my life. "
              "To save myself by running in a crisis: that I will not do. Thank the lords east of the pass for me, and tell them to keep the realm in their hearts!",
              "若蒙社稷之灵，得安国家，吾之愿也；若不获已，则允奉身以死。临难苟免，吾不为也。为吾谢关东诸公，努力以国家为念！"),
            N("Lü Bu begs him again and again, but Wang Yun will not go. Soon flames rise from every gate to the sky. "
              "Lü Bu has to leave his own family behind, and flees through the pass with a hundred riders, to join Yuan Shu.",
              "吕布再三相劝，王允只是不肯去。不一时，各门火焰竟天，吕布只得弃却家小，引百余骑飞奔出关，投袁术去了。"),
            ["run", "lb", "a18", -50, 0], ["remove", "lb"],
            ["fx", "fire", "a18", 30, -10], ["fx", "fire", "a18", -20, -8],
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
            N("What became of Emperor Xian? Hear the next chapter.", "未知献帝性命如何，且听下文分解。"),
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
        node("a2", 60, 190, "a2", room="wy-garden", dilemma=D(
            "wangyun", "Stake the whole house on a sixteen-year-old girl?", "以一门性命，托付二八少女？",
            "If it leaks, every one of us dies. But no one else can do it.", "事若泄漏，我灭门矣。可满朝文武，无计可施。",
            "Then let it be her.", "既如此，便是她了。",
            "Not yet. Let me think it through.", "且慢，容我再想。")),
        node("a3", 80, 180, "a3", gate=[{"needs": ["item:crown"], "else": "a3_wait",
                                          "objective": T("Have the family pearls set into a gold crown.", "取家藏明珠，令良匠嵌造金冠。"),
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
        node("a8", 180, 130, "a8", room="xf-bedroom", dilemma=D(
            "diaochan", "Tell him, without waking the man between us.", "隔着他，告诉吕布。",
            "One sign, and not a sound.", "只一个手势，不出一声。",
            "His heart is breaking. Good.", "他心如碎。好。",
            "Not yet. He's stirring.", "还不行，他在动。")),
        node("a9", 200, 120, "a9", room="xf-garden", dilemma=D(
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
        node("a12p", 270, 80, "a12p", room="wy-secret", board=False),
        node("a12c", 280, 74, "a12c", dilemma=D(
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
        node("a13d", 340, 36, "a13d", place="Meiwu Road", board=False),
        node("a14", 350, 30, "a14", role="boss",
             boss={"who": "dongzhuo", "title": T("Dong Zhuo", "董卓") + ", " + T("Grand Preceptor", "太师"),
                   "taunt": T("What are the swords for?", "持剑是何意？")},
             dilemma=D("wangyun", "Kill the traitor at the palace gate.", "诛贼于北掖门。",
                       "His guards are shut outside. It has to be now.", "卫兵尽挡在门外。只在此刻。",
                       "There is an edict to kill a traitor!", "有诏讨贼！",
                       "Not yet. Hold.", "且慢，稳住。")),
        node("a15", 360, 24, "a15", board=False),
        node("a15m", 366, 22, "a15m", place="Meiwu", room="treasury", board=False),
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
        node("a18", 430, 6, "a18", board=False),
    ]


_EDGES_CHAIN = [["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a4", "a5"], ["a5", "a6"], ["a6", "a7"], ["a7", "a8"], ["a8", "a9"],
                ["a9", "a10"], ["a10", "a11"], ["a11", "a12a"], ["a12a", "a12b"], ["a12b", "a12p"], ["a12p", "a12c"], ["a12c", "a12"],
                ["a12", "a13"], ["a13", "a13a"], ["a13a", "a13b"], ["a13b", "a13c"], ["a13c", "a13d"], ["a13d", "a14"], ["a14", "a15"],
                ["a15", "a15m"], ["a15m", "a15c"], ["a15c", "a16"], ["a16", "a16a"], ["a16a", "a16b"], ["a16b", "a16c"], ["a16c", "a16m"], ["a16m", "a17"],
                ["a17", "a18"]]

_ITEMS = {
    "pearls": {"name": "Family pearls", "zh": "家藏明珠", "kind": "treasure"},
    "crown": {"name": "Gold crown set with pearls", "zh": "嵌珠金冠", "kind": "treasure"},
    "edict": {"name": "The Emperor's secret edict", "zh": "天子密诏", "kind": "treasure"},
}


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
        "party": ["wangyun"],
        "items": _ITEMS,
        "nodes": _nodes_chain(),
        "edges": _EDGES_CHAIN,
        "scenes": scenes,
        "opening": [],
        "closing": [],
    }


WORLD2 = _world()
