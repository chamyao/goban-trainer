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
            ["spawn", "dc", "diaochan", "a5", -6, 0],
            ["pose", "dc", "dance"],
            ["still", "dc_dance", "slow pan across"],
            N("The bead curtain is let down. To the sound of reed pipes, Diaochan dances on the far side of it.",
              "允教放下帘栊，笙簧缭绕，簇捧貂蝉舞于帘外。"),
            ["problem"],  # Diaochan: make him take me
            ["pose", "dc", "stand"],
            N("When the dance is over, Dong Zhuo calls her closer. She comes in through the curtain and bows deeply.",
              "舞罢，卓命近前。貂蝉转入帘内，深深再拜。"),
            ["move", "dc", "a5", 8, 0], ["pose", "dc", "bow"],
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
            ["board", "dc", "car"],
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
    }


def _nodes_chain():
    def node(key, x, y, scene, room=None, **extra):
        n = {"key": key, "x": x, "y": y, "role": "main", "place": "Chang'an", "scene": scene}
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
    ]


_EDGES_CHAIN = [["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a4", "a5"], ["a5", "a6"]]

_ITEMS = {
    "pearls": {"name": "Family pearls", "zh": "家藏明珠", "kind": "treasure"},
    "crown": {"name": "Gold crown set with pearls", "zh": "嵌珠金冠", "kind": "treasure"},
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
