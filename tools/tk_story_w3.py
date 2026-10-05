"""World 3 (Book 3): White Gate Tower, chapters 10-19. The plan is in docs/world3-plan.md.

Kept in its own file, like tk_story_w2.py. tk_story.py appends WORLD3 to WORLDS;
tk_story_zh.py merges ZH3 and CAST3; tk_places.py takes PLACES3.
The helpers N and S write a line and register its Chinese in one go.
"""

ZH3 = {}


def N(en, zh):
    """A line of narration, with its Chinese."""
    ZH3[en] = zh
    return ["n", en]


def S(who, en, zh):
    """A spoken line, with its Chinese."""
    ZH3[en] = zh
    return ["say", who, en]


def T(en, zh):
    """A title, objective, place or other label, with its Chinese."""
    ZH3[en] = zh
    return en


# Voices for the people World 3 adds (Kokoro Mandarin ids, as in tk_story_zh.CAST).
CAST3 = {
    "taishici": "zm_038", "kongrong": "zm_070", "guanhai": "zm_016", "taoqian": "zm_083", "mizhu": "zm_039",
    "chendeng": "zm_040", "zhaoyun": "zm_042", "jiling": "zm_043", "zhangliao": "zm_044", "gaoshun": "zm_046",
    "haomeng": "zm_047", "xunyu": "zm_048", "guojia": "zm_049", "sunqian": "zm_071",
    "zhangkai": "zm_072", "yanshi": "zf_019", "houcheng": "zm_073", "sunce": "zm_074", "wanghou": "zm_075",
    "xiahoudun": "zm_076",
}


def _scenes_main():
    return {
        "beihai1": {"title": T("A Rider from Beihai", "北海来使"), "kind": "main", "steps": [
            ["army", "men", "militia", 3, "m1", -34, 6],
            N("Liu Bei is chancellor of Pingyuan, a small city in the north. One morning a lone rider comes in at the gate, his quiver empty and his horse in a lather.",
              "玄德做着平原相，守着北方一座小城。一日清早，一骑单马奔到城门，箭壶已空，马汗淋漓。"),
            ["spawn", "tsc", "taishici", "m1", 40, 2], ["move", "tsc", "m1", 14, 2],
            ["still", "beihai3_a", "slow pan across"],
            N("He is Taishi Ci of Donglai. He has fought his way out of besieged Beihai alone, shooting down every rider who came after him.",
              "此人乃东莱太史慈。他单骑杀出北海重围，追来的贼骑，被他一一射倒。"),
            S("taishici", "Kong Rong of Beihai is besieged by the Yellow Turban Guan Hai. He says only Liu Xuande can save him.",
              "北海孔融被黄巾管亥围住。孔府君说，只有刘玄德能救他。"),
            S("taishici", "I am not his kin, nor his countryman. He was kind to my mother, and she sent me.",
              "某与孔融亲非骨肉，比非乡党。只因他屡次照看家母，家母命我来救。"),
            S("liubei", "Kong of Beihai knows that there is a Liu Bei in this world?", "孔北海知世间有刘备耶？"),
            ["spawn", "sg", "stargrey", "m1", -40, 20], ["spawn", "sr", "starred", "m1", -32, 24],
            N("Under a great pine by the gate, the two white-haired men from the peach garden sit at their flat rock, a game half played.",
              "城门边一棵大松树下，桃园中那两位白发老人坐在盘石旁，一局棋下到一半。"),
            S("starred", "A promise is a stone on the board. Once it is played, it stays.", "承诺好比落子。一子落下，便收不回了。"),
            ["problem", "stargrey"],  # the board comes up here; the rest plays once it is solved
            ["remove", "sg"], ["remove", "sr"],
            N("Liu Bei calls out Guan Yu, Zhang Fei and three thousand men, and marches for Beihai.", "玄德点起关、张，精兵三千，往北海进发。"),
            ["remove", "tsc"], ["remove", "men"],
        ]},
        "beihai2": {"title": T("The Siege of Beihai", "北海解围"), "kind": "main", "steps": [
            ["prop", "gate", "gate", "m2", 74, -14],
            ["army", "men", "militia", 5, "m2", -30, 0],
            ["army", "yt", "rebel", 14, "m2", 84, 0], ["spawn", "gh", "guanhai", "m2", 50, 0],
            ["spawn", "tsc", "taishici", "m2", -10, 10],
            N("Outside Beihai the Yellow Turban Guan Hai sees how few they are, and laughs.", "北海城外，管亥望见救军来少，不以为意。"),
            S("guanhai", "Beihai has grain. Lend me ten thousand piculs and I go. Otherwise, young and old, no one in that city lives!",
              "吾知北海粮广，可借一万石，即便退兵；不然，打破城池，老幼不留！"),
            N("Before Taishi Ci can spur forward, Guan Yu is already riding out.", "太史慈正要出马，云长早已飞马而出。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["run", "guanyu", "m2", 44, 0], ["pose", "guanyu", "strike"], ["fx", "flash", "m2", 48, 0], ["pose", "gh", "fall"], ["camera", "shake"],
            N("After a few dozen bouts the Green Dragon blade cuts Guan Hai from his horse. Taishi Ci and Zhang Fei charge in side by side, like tigers among sheep.",
              "数十合，青龙刀起，劈管亥于马下。太史慈、张飞两骑齐出，如虎入羊群。"),
            ["run", "yt", "m2", 180, 0], ["remove", "yt"], ["remove", "gh"],
            ["prop", "tbl", "table", "m2", 10, 10],
            ["spawn", "kr", "kongrong", "m2", 24, -4], ["spawn", "mz", "mizhu", "m2", 34, 8],
            N("At the feast Kong Rong brings out Mi Zhu, an officer of Tao Qian of Xuzhou. Mi Zhu tells how Cao Song died, and how Cao Cao's army is killing its way across Xuzhou.",
              "席间，孔融引徐州陶谦的部下糜竺来见。糜竺备言曹嵩被害、曹操纵兵屠戮徐州之事。"),
            S("liubei", "Tao Gongzu is a good man. I never thought he would suffer such a wrong.", "陶恭祖乃仁人君子，不意受此无辜之冤。"),
            S("kongrong", "I help him from old friendship, but also because it is right. Have you alone no heart for what is right?",
              "融之欲救陶恭祖，虽因旧谊，亦为大义。公岂独无仗义之心耶？"),
            S("liubei", "My men are few. I will borrow more from Gongsun Zan, and come after you.", "备兵微将寡，且去公孙瓒处借兵，随后便来。"),
            S("kongrong", "Do not break your word.", "公切勿失信。"),
            S("liubei", "What kind of man do you take me for? Every man dies, but without trust a man cannot stand. Troops or no troops, I will come myself.",
              "公以备为何如人也？圣人云：自古皆有死，人无信不立。刘备借得军，或借不得军，必然亲至。"),
            N("Taishi Ci takes no reward, and rides south to serve Liu Yao in Yangzhou. Liu Bei rides north, to Gongsun Zan.",
              "太史慈不受赏赐，辞别南下，往扬州投刘繇去了。玄德则往公孙瓒处借兵。"),
            ["remove", "kr"], ["remove", "mz"], ["remove", "tsc"], ["remove", "tbl"], ["remove", "men"],
        ]},
        "breakthrough": {"title": T("The Red Banner", "红旗白字"), "kind": "main", "steps": [
            ["army", "men", "militia", 5, "m3", -36, 0],
            ["spawn", "zy", "zhaoyun", "m3", -14, 12],
            ["army", "cao", "f_soldier", 14, "m3", 76, 0],
            N("Gongsun Zan lends two thousand men, and, at Liu Bei's asking, one officer more: Zhao Yun of Changshan, called Zilong, the young man who once saved his life at the Pan River.",
              "公孙瓒借马步军二千，玄德又请借赵子龙同行。赵云，常山人，字子龙，当年在磐河救过公孙瓒的性命。"),
            S("zhaoyun", "Zhao Yun of Changshan. I will ride with you, my lord.", "常山赵云，愿随使君同往。"),
            ["still", "xuzhou3_a", "slow pull back"],
            N("At Xuzhou, Cao Cao's army lies around the city like frost and snow. On every banner, in white: AVENGE THE WRONG.",
              "到得徐州，只见曹兵如铺霜涌雪，白旗上大书“报雠雪恨”四字。"),
            N("Kong Rong and Tian Kai, afraid of Cao Cao, camp far off against the hills.", "孔融、田楷畏惧曹操，远远依山下寨。"),
            S("liubei", "I fear the city has no grain and cannot hold out long. Yunchang, Zilong, stay here in support. Yide and I will cut our way in.",
              "但恐城中无粮，难以久持。云长、子龙在此接应，我与翼德杀入城中。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["prop", "rb", "redbanner", "m3", 0, -14],
            ["run", "zhangfei", "m3", 50, 0], ["run", "liubei", "m3", 40, 6], ["move", "rb", "m3", 40, -8],
            ["fx", "dust", "m3", 50, 0], ["pose", "cao", "fall", 4],
            N("Zhang Fei drives off Cao Cao's general Yu Jin without a word. Liu Bei follows with his twin swords, under a red banner in white letters: LIU XUANDE OF PINGYUAN.",
              "张飞更不打话，杀退曹将于禁。玄德挥双股剑随后，红旗白字，大书“平原刘玄德”。"),
            ["remove", "cao"], ["remove", "rb"], ["remove", "zy"], ["remove", "men"],
            ["spawn", "tq", "taoqian", "m3", 60, -4], ["spawn", "mz", "mizhu", "m3", 72, 6],
            ["move", "tq", "m3", 52, 0],
            N("Old Tao Qian brings them into the city, and is struck by Liu Bei's bearing. He has Mi Zhu bring out the seal of Xuzhou.",
              "陶谦接入城中，见玄德仪表轩昂，语言豁达，心中大喜，便命糜竺取徐州牌印，让与玄德。"),
            ["prop", "seal", "seal", "m3", 48, 2],
            S("taoqian", "The realm is in chaos. You are of the Han house. I am old and useless. I would yield Xuzhou to you.",
              "今天下扰乱，王纲不振；公乃汉室宗亲，正宜力扶社稷。老夫年迈无能，情愿将徐州相让。"),
            S("liubei", "I came because it was right. Do you think I came to swallow your province? If I had such a thought, may Heaven forsake me!",
              "今为大义，故来相助。公出此言，莫非疑刘备有吞并之心耶？若举此念，皇天不佑！"),
            S("mizhu", "The enemy is at the walls. Let us drive him off first, and speak of this when it is over.", "今兵临城下，且当商议退敌之策。待事平之日，再当相让可也。"),
            ["remove", "seal"], ["remove", "tq"], ["remove", "mz"],
        ]},
        "second": {"title": T("The Second Offer", "再让徐州"), "kind": "main", "steps": [
            ["prop", "tbl", "table", "m4", 10, 10], ["prop", "wine", "winejars", "m4", 26, 10],
            ["spawn", "tq", "taoqian", "m4", 24, -6], ["spawn", "mz", "mizhu", "m4", 38, 6], ["spawn", "kr", "kongrong", "m4", 40, -10],
            ["spawn", "zy", "zhaoyun", "m4", -16, 10],
            N("Liu Bei writes to Cao Cao, asking him to put the court's danger before his own feud. Cao Cao rages at the letter, and then, all at once, he marches away.",
              "玄德修书劝曹操以朝廷之急为先，私仇为后。曹操看罢大怒，却忽然撤兵而去。"),
            N("Lü Bu, wandering since he fled Chang'an, has taken Cao Cao's home province of Yanzhou behind his back. Cao Cao has no home to go back to.",
              "原来自长安逃出、四处飘零的吕布，趁虚袭了曹操的根本兖州。曹操无家可归，只得急回。"),
            N("At the victory feast, Tao Qian seats Liu Bei in the place of honour, and offers him Xuzhou again.", "庆功宴上，陶谦请玄德上坐，再以徐州相让。"),
            S("taoqian", "I am old, and my two sons have no talent. You are of imperial blood, broad in virtue. Take Xuzhou.",
              "老夫年迈，二子不才，不堪国家重任。刘公乃帝室之胄，德广才高，可领徐州。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            S("liubei", "Kong Wenju sent me to save Xuzhou because it was right. If I take it now, the world will call me a man without honour.",
              "孔文举令备来救徐州，为义也。今无端据而有之，天下将以备为无义人矣。"),
            S("kongrong", "When Heaven gives and you do not take, you will regret it for ever.", "今日之事，天与不取，悔不可追。"),
            S("guanyu", "Since Lord Tao offers it, brother, govern the province for now.", "既承陶公相让，兄且权领州事。"),
            S("zhangfei", "We're not grabbing it. He's offering it kindly. Why keep saying no?", "又不是我强要他的州郡；他好意相让，何必苦苦推辞？"),
            S("liubei", "Do you want to plunge me into dishonour?", "汝等欲陷我于不义耶？"),
            S("taoqian", "If you leave me, I will die with my eyes open!", "君若舍我而去，我死不瞑目矣！"),
            N("At last Liu Bei agrees only to camp at Xiaopei, close by, and guard Xuzhou from there.", "玄德只肯屯兵于近邑小沛，以保徐州。"),
            ["remove", "tq"], ["remove", "mz"], ["remove", "kr"],
            ["move", "zy", "m4", -4, 6],
            ["still", "zilong3_a", "slow zoom in"],
            N("Zhao Yun must go back to Gongsun Zan. Liu Bei holds his hand, and they part in tears.", "赵云辞去，玄德执手挥泪而别。"),
            ["remove", "zy"],
        ]},
        "deathbed": {"title": T("The Third Offer", "三让徐州"), "kind": "main", "steps": [
            ["spawn", "tq", "taoqian", "m5", 18, -4], ["pose", "tq", "sleep"],
            ["spawn", "mz", "mizhu", "m5", 32, 6], ["spawn", "cd", "chendeng", "m5", 30, -12],
            N("A year of locusts and famine. Then word comes to Xiaopei: Tao Qian is dying, and asks for Liu Bei.", "一年蝗灾饥荒。忽一日，小沛得报：陶谦病重，请玄德去议事。"),
            N("Mi Zhu and Chen Deng, the sharpest of Tao Qian's officers, are at his bed.", "陶谦帐下的糜竺、陈登守在榻前。"),
            ["prop", "seal", "seal", "m5", 12, 2],
            ["still", "deathbed3_a", "slow zoom in"],
            S("taoqian", "For the sake of Han's cities, take the seal of Xuzhou, and let me close my eyes.", "万望明公可怜汉家城池为重，受取徐州牌印，老夫死亦瞑目矣！"),
            S("liubei", "You have two sons. Why not give it to them?", "君有二子，何不传之？"),
            S("taoqian", "Neither is fit for it. Sun Qian of Beihai can serve you as an aide.", "二子之才，皆不堪任。北海孙乾，可使为从事。"),
            ["problem"],  # the board is Liu Bei weighing it; solving it is the choice
            N("Tao Qian points to his heart, and dies.", "陶谦以手指心而死。"),
            ["remove", "tq"],
            ["army", "ppl", "f_villager", 6, "m5", -26, 10],
            N("Next day the people of Xuzhou crowd the gate, weeping: “If Lord Liu will not govern us, none of us can live in peace!” Guan Yu and Zhang Fei plead with him again and again.",
              "次日，徐州百姓拥挤府前哭拜：“刘使君若不领此郡，我等皆不能安生矣！”关、张二公亦再三相劝。"),
            S("liubei", "Then I will hold it, for now.", "既如此，备权领徐州事。"),
            N("Liu Bei governs Xuzhou, with Sun Qian and Mi Zhu at his side and Chen Deng on his staff, and buries Tao Qian with every honour.",
              "玄德乃权领徐州事，以孙乾、糜竺为辅，陈登为幕官，厚葬陶谦。"),
            ["remove", "ppl"], ["remove", "mz"], ["remove", "cd"], ["remove", "seal"],
        ]},
        "guest": {"title": T("A Tiger at the Gate", "虎狼入门"), "kind": "main", "steps": [
            ["spawn", "mz", "mizhu", "m6", -18, 10],
            N("Not long after, Lü Bu, beaten by Cao Cao and turned away by every lord, comes to Xuzhou with Chen Gong, asking for shelter.",
              "不久，吕布被曹操杀败，诸侯都不肯收留，同陈宫来投徐州。"),
            S("mizhu", "Lü Bu is a tiger and a wolf. Do not take him in. If you do, he will maul someone.", "吕布乃虎狼之徒，不可收留；收则伤人矣。"),
            S("liubei", "If he had not raided Yanzhou, how would Xuzhou have been saved? He comes to me in need. What harm could he mean?",
              "前者非布袭兖州，怎解此郡之祸？今彼穷而投我，岂有他心？"),
            S("zhangfei", "Brother, your heart is too kind. Even so, we must be ready.", "哥哥心肠忒好。虽然如此，也要准备。"),
            ["remove", "mz"],
            ["spawn", "lb", "lvbu", "m6", 50, 0], ["spawn", "cg", "chengong", "m6", 60, 10], ["move", "lb", "m6", 18, 0],
            ["prop", "seal", "seal", "m6", 10, 2],
            N("Liu Bei rides out thirty li to meet him, and offers him the seal of Xuzhou.", "玄德出城三十里迎接，并取牌印让与吕布。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["emote", "guanyu", "anger"], ["emote", "zhangfei", "anger"],
            N("Lü Bu reaches for it, sees Guan Yu's and Zhang Fei's faces, and laughs instead.", "吕布正要接时，只见关、张二公各有怒色，布乃佯笑。"),
            S("lvbu", "I am a fighting man. How could I govern a province?", "量吕布一勇夫，何能作州牧乎？"),
            S("chengong", "A strong guest does not override his host. Have no doubts, my lord.", "强宾不压主，请使君勿疑。"),
            ["remove", "seal"], ["prop", "tbl", "table", "m6", 14, 10],
            N("At his own feast, Lü Bu has his wife and daughter come out and bow, and calls Liu Bei his worthy younger brother.", "次日吕布回席，令妻女出拜，口称玄德为“贤弟”。"),
            ["emote", "zhangfei", "anger"],
            S("zhangfei", "My brother is a golden branch and a jade leaf! What are you, to call him little brother? Come out here! Three hundred bouts!",
              "我哥哥是金枝玉叶，你是何等人，敢称我哥哥为贤弟！你来！我和你斗三百合！"),
            S("liubei", "My brother talks wildly in drink. Do not hold it against him.", "劣弟酒后狂言，兄勿见责。"),
            N("Next day Liu Bei lodges Lü Bu at Xiaopei, his own old camp, and sends him grain.", "次日，玄德请吕布往小沛屯扎，并送粮草。"),
            ["remove", "lb"], ["remove", "cg"], ["remove", "tbl"],
        ]},
        "tigers": {"title": T("Two Tigers", "二虎竞食"), "kind": "main", "steps": [
            ["spawn", "env", "f_official", "m7", 30, -4], ["prop", "lt", "letter", "m7", 18, 2],
            N("Cao Cao now holds the Emperor at Xu, and speaks with the Emperor's voice. An envoy brings Liu Bei a title, Governor of Xuzhou, and with it a secret letter from Cao Cao: kill Lü Bu.",
              "此时曹操已迎天子都许，挟天子以令诸侯。使者到徐州，封玄德为徐州牧，又附曹操密书一封，令其杀吕布。"),
            ["remove", "env"],
            S("zhangfei", "Lü Bu has no honour. What's wrong with killing him?", "吕布本无义之人，杀之何碍？"),
            S("liubei", "He came to me with nowhere else to go. If I kill him, I am without honour too.", "他势穷而来投我，我若杀之，亦是不义。"),
            S("zhangfei", "It's hard being a good man!", "好人难做！"),
            ["problem"],  # the board is Liu Bei weighing it; solving it is the choice
            ["spawn", "lb", "lvbu", "m7", 50, 0], ["move", "lb", "m7", 20, 0],
            N("Next day Lü Bu comes to congratulate him. Zhang Fei draws his sword in the hall, and Liu Bei throws himself between them.",
              "次日吕布来贺，张飞扯剑上厅，要杀吕布，玄德慌忙拦住。"),
            S("lvbu", "Why does Yide keep wanting to kill me?", "翼德何故只要杀我？"),
            S("zhangfei", "Cao Cao says you have no honour, and told my brother to kill you!", "曹操道你是无义之人，教我哥哥杀你！"),
            N("Liu Bei gives Lü Bu the letter. Lü Bu reads it, and weeps.", "玄德取密书与吕布看。吕布看毕，泣下。"),
            S("lvbu", "That bandit Cao wants to set us against each other!", "此乃曹贼欲令二人不和耳！"),
            S("liubei", "Don't worry, brother. I swear I will never do such a thing.", "兄勿忧：刘备誓不为此不义之事。"),
            ["remove", "lb"], ["remove", "lt"],
            S("liubei", "Cao Cao fears Lü Bu and I will join against him. He wants two tigers to fight over one meal, while he takes the meat. Why be his tool?",
              "此曹孟德恐我与吕布同谋伐之，故用此计，使我两人自相吞并，彼却于中取利。奈何为所使乎？"),
        ]},
        "vow": {"title": T("Zhang Fei's Vow", "张飞立誓"), "kind": "main", "steps": [
            ["spawn", "mz", "mizhu", "m8", 24, 8], ["spawn", "cd", "chendeng", "m8", 34, -6],
            N("Then an edict orders Liu Bei to march on Yuan Shu at Huainan, and Yuan Shu has already been told that Liu Bei means to attack him.",
              "不久又有诏到，令玄德讨伐淮南袁术，而曹操早已暗中告知袁术，说玄德要去攻他。"),
            S("mizhu", "This is another of Cao Cao's tricks.", "此又是曹操之计。"),
            S("liubei", "Trick or not, the Emperor's command cannot be disobeyed. Which of my brothers will hold the city?", "虽是计，王命不可违也。二弟之中，谁人可守？"),
            S("guanyu", "I will hold it.", "弟愿守此城。"),
            S("liubei", "I need you beside me day and night. How can we part?", "吾早晚欲与尔议事，岂可相离？"),
            S("zhangfei", "Then I'll hold it!", "小弟愿守此城。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            S("liubei", "You cannot. When you drink, you turn violent and flog the soldiers. And you act rashly, and take no one's advice.",
              "你守不得此城。你一者酒后刚强，鞭挞士卒；二者作事轻易，不从人谏。"),
            S("zhangfei", "From today I drink no wine, beat no soldier, and listen to everyone!", "弟自今以后，不饮酒，不打军士，诸般听人劝谏便了。"),
            S("mizhu", "I fear his mouth does not match his heart.", "只恐口不应心。"),
            S("zhangfei", "I've followed my brother for years and never broken my word! How dare you belittle me!", "吾跟哥哥多年，未尝失信，你如何轻料我！"),
            S("liubei", "Even so, I am uneasy. Chen Deng, stay with him, and keep his cup small.", "弟言虽如此，吾终不放心。还请陈元龙辅之，早晚令其少饮酒，勿致失事。"),
            N("Liu Bei marches south with Guan Yu and thirty thousand men. Zhang Fei stays behind with the city.", "玄德自与关公引军三万，望南进发，留张飞守徐州。"),
            ["remove", "mz"], ["remove", "cd"], ["party", ["liubei", "guanyu"]],
        ]},
        "handsfeet": {"title": T("Hands and Feet", "兄弟如手足"), "kind": "main", "steps": [
            ["army", "men", "militia", 5, "m9", -34, 0],
            ["spawn", "jl", "jiling", "m9", 60, 0], ["army", "ys", "f_soldier", 8, "m9", 80, 0],
            N("At Xuyi, Yuan Shu's general Ji Ling, with his three-pointed blade, fights Guan Yu thirty bouts, and neither gives way.",
              "盱眙城外，袁术大将纪灵使一口三尖刀，与关公战三十合，不分胜负。"),
            ["remove", "jl"], ["remove", "ys"],
            ["spawn", "zhangfei", "zhangfei", "m9", -70, 6], ["run", "zhangfei", "m9", -12, 4],
            N("Then a handful of riders come in from the north. It is Zhang Fei, and he has no city.", "忽然北边数骑奔来，正是张飞，却不见了城池。"),
            S("zhangfei", "Brother… I gave one last feast, so we could all swear off wine together after. Cao Bao wouldn't drink, so I had him flogged. He was Lü Bu's father-in-law. That night he opened the gate to Lü Bu.",
              "哥哥……我想众人尽此一醉，明日都戒酒。曹豹不肯吃，我打了他。他是吕布的丈人，当夜便开城门，放吕布进来了。"),
            N("Everyone goes pale.", "众皆失色。"),
            S("liubei", "Gaining it was nothing to rejoice over. Losing it is nothing to grieve.", "得何足喜，失何足忧！"),
            S("guanyu", "Where are our sisters-in-law?", "嫂嫂安在？"),
            S("zhangfei", "Still in the city.", "皆陷于城中矣。"),
            N("Liu Bei says nothing.", "玄德默然无语。"),
            ["emote", "guanyu", "anger"],
            S("guanyu", "What did you say when you asked to hold the city? What did our brother tell you? Now the city is lost, and our sisters-in-law with it!",
              "你当初要守城时，说甚来？兄长吩咐你甚来？今日城池又失了，嫂嫂又陷了，如何是好！"),
            N("Zhang Fei, ashamed beyond bearing, draws his sword to cut his own throat.", "张飞闻言，惶恐无地，掣剑欲自刎。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["still", "handsfeet3_a", "slow zoom in"],
            N("Liu Bei throws his arms around him, takes the sword, and throws it to the ground.", "玄德向前抱住，夺剑掷地。"),
            S("liubei", "The ancients said: brothers are hands and feet; wives and children are clothing. Torn clothes can be mended. A hand cut off cannot be joined again.",
              "古人云：兄弟如手足，妻子如衣服。衣服破，尚可缝；手足断，安可续？"),
            S("liubei", "We three swore in the Peach Garden: we did not ask to be born on the same day, only to die on the same day. The city was never truly mine, and Lü Bu will not harm my family.",
              "吾三人桃园结义，不求同生，但愿同死。况城池本非吾有；家眷虽被陷，吕布必不谋害，尚可设计救之。"),
            N("Guan Yu and Zhang Fei weep.", "关、张俱感泣。"),
            ["party", ["liubei", "guanyu", "zhangfei"]], ["remove", "men"],
        ]},
        "halberd": {"title": T("The Halberd at the Gate", "辕门射戟"), "kind": "main", "steps": [
            N("Lü Bu now holds Xuzhou. Yuan Shu had promised him grain and horses to strike Liu Bei from behind, and then does not pay. So Lü Bu sends Liu Bei's family back unharmed, and asks him to come back to Xiaopei. Guan Yu and Zhang Fei do not like it.",
              "吕布如今占了徐州。袁术曾许他粮草马匹，叫他从背后袭击玄德，事后却不兑现。吕布便送还玄德家小，请玄德回屯小沛。关、张心中不平。"),
            S("liubei", "Bend, keep to our place, and wait for Heaven's time. One cannot fight fate.", "屈身守分，以待天时，不可与命争也。"),
            N("Then Yuan Shu's general Ji Ling marches on Xiaopei with a hundred thousand men, and Liu Bei writes to Lü Bu for help.",
              "不久，袁术令纪灵起兵十万，来攻小沛。玄德只得写信向吕布求救。"),
            ["prop", "gate", "gate", "m10", 60, -14], ["prop", "tbl", "table", "m10", 8, 10],
            ["spawn", "lb", "lvbu", "m10", 14, -4], ["spawn", "jl", "jiling", "m10", 30, 6],
            N("Lü Bu calls both commanders to a feast and sits between them. Ji Ling sees Liu Bei there and turns to run; Lü Bu pulls him back like a child.",
              "吕布请二人赴宴，自坐于中。纪灵见玄德在座，大惊，抽身便走，被吕布如提童稚般拉回。"),
            S("jiling", "Do you mean to kill me, general?", "将军欲杀纪灵耶？"),
            S("lvbu", "No.", "非也。"),
            S("jiling", "Then to kill Big Ears?", "莫非杀大耳儿乎？"),
            S("lvbu", "Not that either. Xuande and I are brothers. All my life I have disliked fighting, and liked to stop fights.", "亦非也。玄德与布乃兄弟也。布平生不好斗，惟好解斗。"),
            S("jiling", "My lord sent me with a hundred thousand men to catch Liu Bei. How can I stop?", "吾奉主公之命，提十万之兵，专捉刘备，如何罢得？"),
            ["emote", "zhangfei", "anger"],
            S("zhangfei", "Few men or not, you lot are child's play to me! You dare harm my brother?", "吾虽兵少，觑汝辈如儿戏耳！你敢伤我哥哥！"),
            S("lvbu", "Bring me my halberd!", "左右！取我戟来！"),
            ["prop", "hb", "halberd", "m10", 70, 0],
            S("lvbu", "The gate is a hundred and fifty paces away. If my arrow hits the small blade of the halberd, you both go home. If I miss, go back and fight. Whoever defies me fights me.",
              "辕门离中军一百五十步，吾若一箭射中戟上小枝，你两家罢兵；如射不中时，各自回营，安排厮杀。有不从吾言者，并力拒之。"),
            ["still", "halberd3_a", "slow zoom in"],
            N("Ji Ling thinks: at a hundred and fifty paces, how can he hit it? Liu Bei prays in silence.", "纪灵暗想：戟在一百五十步之外，安能便中？玄德只是暗暗祷告。"),
            S("liubei", "If only he hits it!", "只愿他射得中便好！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            S("lvbu", "Hit!", "着！"),
            ["pose", "lb", "strike"], ["fx", "flash", "m10", 70, -4], ["camera", "shake"],
            N("The arrow strikes the small blade. Everyone in the tent cheers.", "一箭正中画戟小枝。帐上帐下将校，齐声喝采。"),
            S("lvbu", "Heaven orders you both to go home!", "此天令你两家罢兵也！"),
            S("lvbu", "Without me, Xuande, you would have been in danger.", "非我则公危矣。"),
            N("Liu Bei thanks him, and is secretly ashamed. Next day all three armies go home.", "玄德称谢，暗称惭愧。次日，三处军马都散。"),
            ["remove", "lb"], ["remove", "jl"], ["remove", "hb"], ["remove", "tbl"], ["remove", "gate"],
        ]},
        "horses": {"title": T("The Stolen Horses", "张飞夺马"), "kind": "main", "steps": [
            N("Liu Bei, short of horses, buys them where he can. Then Lü Bu's men come back from Shandong: half of their three hundred horses were taken by a bandit on the road, and the bandit was Zhang Fei.",
              "玄德缺马，四下收买。吕布部将宋宪、魏续从山东买马回来，半路被一伙强人劫去一半，打听得乃是张飞诈装山贼所为。"),
            ["army", "lbm", "f_soldier", 8, "m11", 80, 0], ["spawn", "lb", "lvbu", "m11", 60, 0], ["move", "lb", "m11", 24, 0],
            S("lvbu", "I shot the halberd at the gate and saved you, and you steal my horses?", "我辕门射戟，救你大难，你何故夺我马匹？"),
            S("liubei", "I was short of horses and bought them where I could. How would I dare steal yours, brother?", "备因缺马，令人四下收买。安敢夺兄马匹？"),
            S("zhangfei", "Yes, I took your good horses! What are you going to do about it?", "是我夺了你好马！你今待怎么？"),
            S("lvbu", "Ring-eyed bandit! You have scorned me again and again!", "环眼贼！你累次藐视我！"),
            S("zhangfei", "I take your horses and you're angry. You took my brother's Xuzhou and said nothing about that!", "我夺你马你便恼，你夺我哥哥的徐州便不说了！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["pose", "zhangfei", "strike"], ["fx", "flash", "m11", 20, 0],
            N("They fight a hundred bouts. Chen Gong tells Lü Bu to kill Liu Bei while he can, and the siege of Xiaopei tightens.",
              "二人战一百余合，未分胜负。陈宫劝吕布趁势杀了刘备，吕布遂围城愈急。"),
            ["remove", "lb"], ["remove", "lbm"],
            ["light", "night", 1200],
            N("At the third watch, under the moon, the brothers break out by the north gate, Zhang Fei in front, Guan Yu behind, and Liu Bei in the middle with the families. They ride for Cao Cao, at Xu.",
              "当夜三更，乘着月明，玄德弃城出北门而走：张飞当先，关公断后，玄德居中，保护老小，投许都曹操去了。"),
            ["light", "day", 1500],
            ["spawn", "cc", "caocao", "m11", 30, -4],
            N("At Xu, Cao Cao receives Liu Bei as an honoured guest.", "到得许都，曹操待以上宾之礼。"),
            S("caocao", "Xuande is a brother to me.", "玄德与吾兄弟也。"),
            N("His adviser Xun Yu tells him to kill Liu Bei now, before he grows. Guo Jia says no: kill one hero, and lose the hearts of the whole realm. Cao Cao listens to Guo Jia.",
              "谋士荀彧劝曹操早除刘备，郭嘉却说：除一人之患，以阻四海之望，不可。曹操从郭嘉之言。"),
            S("caocao", "Go back to Xiaopei. I send you there as a pit is dug for a tiger. Watch Lü Bu, and I will help you from outside.",
              "吾令汝屯兵小沛，是“掘坑待虎”之计也。公但与陈珪父子商议，某当为公外援。"),
            ["remove", "cc"],
        ]},
        "scattered": {"title": T("Scattered", "兄弟失散"), "kind": "main", "steps": [
            ["prop", "gate", "gate", "m12", 40, -14],
            N("Lü Bu catches Liu Bei's letter to Cao Cao, and sends his generals Gao Shun and Zhang Liao against Xiaopei.", "吕布截获玄德致曹操的书信，大怒，令高顺、张辽攻打小沛。"),
            ["army", "zlm", "f_soldier", 8, "m12", 86, 0], ["spawn", "zl", "zhangliao", "m12", 66, 0],
            N("At the west gate Zhang Liao rides up to the wall, and Guan Yu calls down to him.", "张辽引兵攻西门，关公在城上叫道："),
            S("guanyu", "You carry yourself like no common man. Why give yourself to a bandit?", "公仪表非俗，何故失身于贼？"),
            N("Zhang Liao lowers his head, says nothing, and draws off his men.", "张辽低头不语，引军退去。"),
            ["run", "zl", "m12", 140, 0], ["run", "zlm", "m12", 150, 0], ["remove", "zl"], ["remove", "zlm"],
            S("zhangfei", "He's afraid. Why not chase him?", "彼惧而退，何不追之？"),
            S("guanyu", "He fights as well as you or I. My words shamed him; he half regrets his choice. That is why he will not fight us.",
              "此人武艺不在你我之下。因我以正言感之，颇有自悔之心，故不与我等战耳。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["army", "lbm", "f_soldier", 12, "m12", 90, 0], ["spawn", "lb", "lvbu", "m12", 70, 0],
            ["mood", "dark"],
            N("But Lü Bu comes himself. Guan Yu's and Zhang Fei's camps break, and Lü Bu rides into the city on Liu Bei's heels. Liu Bei escapes alone by the west gate, leaving his family behind once more.",
              "吕布亲自来攻，关、张两寨俱破。吕布紧随玄德杀入城中，玄德只得弃了家小，独自出西门逃走。"),
            N("Mi Zhu begs Lü Bu for the family, and Lü Bu sends them to Xuzhou unharmed. Guan Yu and Zhang Fei, cut off, hide in the hills.",
              "糜竺向吕布求情，吕布遣人送玄德家小往徐州安置。关、张各收得些人马，往山中去了。"),
            ["remove", "lb"], ["remove", "lbm"], ["mood", "clear"],
            N("Liu Bei reaches Cao Cao, and they march back east together. On the road beyond Xiaopei, Lü Bu, beaten, turns to run—",
              "玄德投了曹操，同领大兵杀回。小沛以东，吕布兵败而走——"),
            ["spawn", "lb", "lvbu", "m12", 40, 0], ["run", "lb", "m12", 10, 0],
            S("guanyu", "Lü Bu, don't run! Guan Yunchang is here!", "吕布休走！关云长在此！"),
            ["run", "lb", "m12", 160, 20], ["remove", "lb"],
            S("zhangfei", "I've been up on Mount Mangdang all this time. Brother, we've found each other!", "弟在芒砀山住了这几时，今日幸得相遇。"),
            N("The three brothers weep, and tell each other everything that has happened.", "三人相见，各哭诉别后之事。"),
            ["remove", "gate"],
        ]},
        "xiapi": {"title": T("The Huainan Road", "淮南要路"), "kind": "main", "steps": [
            # no board: the road is held with gaps in it, and the envoys slip through
            ["army", "men", "militia", 4, "m13", -30, 0],
            N("Chen Deng and his father, who have been working for Cao Cao all along, shut Lü Bu out of Xuzhou, and Mi Zhu holds it for Liu Bei. Lü Bu shuts himself in Xiapi. Cao Cao surrounds the city, and sends Liu Bei to hold the road south, to Huainan, so Lü Bu cannot reach Yuan Shu.",
              "陈登父子早已暗中归附曹操，设计把吕布关在徐州城外，糜竺替玄德守住了徐州。吕布只得退守下邳。曹操围城，令玄德截住淮南要路，不放吕布与袁术相通。"),
            S("liubei", "How would I dare disobey Lord Cao's orders?", "曹公将令，安敢有违？"),
            ["light", "night", 1200],
            ["spawn", "env", "f_soldier", "m13", 60, -10], ["run", "env", "m13", -120, -10],
            N("That night two of Lü Bu's envoys slip past in the dark, riding for Yuan Shu.", "当夜，吕布遣许汜、王楷趁黑冲过玄德营寨，往淮南求救去了。"),
            ["remove", "env"], ["light", "day", 1500],
            S("liubei", "They are through. We are holding a road with holes in it.", "让他们过去了。这条路，我们守得处处是空隙。"),
            N("By the camp, under an old pine, a game has been laid out on a little stone shrine.", "营边一棵老松树下，一座小石祠的供桌上摆开了一局棋。"),
            ["remove", "men"],
        ]},
        "rock3": {"title": T("The Shrine under the Pine", "松下星君祠"), "kind": "main", "steps": [
            # the rock lights after the envoys slip through; the hint is the posts
            N("At the shrine under the pine sit the two white-haired men from the peach garden, wine cups beside the board, as if nothing had happened.", "松树下的星君祠前，桃园中那两位白发老人对坐，酒杯放在棋盘旁，仿佛什么也没发生。"),
            ["spawn", "sg", "stargrey", "m13b", -34, 20], ["spawn", "sr", "starred", "m13b", -26, 24],
            S("stargrey", "The tiger is in its cage.", "虎已入笼。"),
            S("starred", "A caged tiger paces, looking for the door. Shut every door, and wait.", "笼中之虎，来回踱步，只寻门户。把门都关上，然后等。"),
            ["problem", "stargrey"],  # the board comes up here; the Star Lords are gone by the time it closes
            ["remove", "sg"], ["remove", "sr"],
            S("liubei", "Yunchang, hold the west side of the road. Yide, the east. Let nothing through, and break none of Lord Cao's orders.",
              "云长守路西，翼德守路东。休放一人过去，切勿犯曹公军令。"),
        ]},
        "roadearly": {"title": T("Holes in the Road", "处处空隙"), "kind": "main", "steps": [
            # no board: the posts are not yet given out, or the rock not yet read
            N("Liu Bei waits on the road, but in the dark he cannot see where the gaps are. Another rider slips past.", "玄德守在路上，黑暗之中，看不清哪里有空隙。又有一骑偷偷过去了。"),
            S("liubei", "Not like this. Someone has laid out a game at the shrine under the pine; I should go and see.", "这样不行。松树下的星君祠前有人摆开了棋局，我该去看看。"),
        ]},
        "roadearly2": {"title": T("Holes in the Road", "处处空隙"), "kind": "main", "steps": [
            # no board: one or both brothers are not yet at their posts
            N("A rider slips past where no one is standing.", "一骑从无人把守的地方溜了过去。"),
            S("liubei", "Shut every door. Yunchang on the west side of the road, Yide on the east, before anything else.", "把门都关上。先让云长守路西，翼德守路东。"),
        ]},
        "breakout": {"title": T("The Daughter on His Back", "负女突围"), "kind": "main", "steps": [
            ["army", "men", "militia", 5, "m13c", -30, 0],
            ["spawn", "guanyu", "guanyu", "m13c", 10, -30], ["spawn", "zhangfei", "zhangfei", "m13c", 10, 30],
            N("Lü Bu's envoys come back from Yuan Shu with his answer: he will send troops only when Lü Bu's daughter is sent to him first. On the road back, Zhang Fei is waiting.",
              "许汜、王楷回报：袁术要先送女，然后发兵。回来路上，张飞早已等着。"),
            ["spawn", "hm", "haomeng", "m13c", 50, 30], ["run", "zhangfei", "m13c", 40, 28],
            ["pose", "zhangfei", "strike"], ["fx", "flash", "m13c", 46, 30], ["pose", "hm", "kneel"],
            N("Zhang Fei takes their escort, Hao Meng, in a single bout.", "张飞只一合，便活捉了护送的郝萌。"),
            ["remove", "hm"], ["move", "zhangfei", "m13c", 10, 30],
            ["light", "night", 1200],
            ["spawn", "lb", "lvbu", "m13c", 80, 0], ["move", "lb", "m13c", 30, 0],
            N("At the second watch Lü Bu himself rides out, his daughter wrapped in cotton and armour and tied to his back.", "二更时分，吕布将女以绵缠身，用甲包裹，负于背上，提戟上马，冲出城来。"),
            S("guanyu", "Don't run!", "休走！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["run", "guanyu", "m13c", 22, -8], ["run", "zhangfei", "m13c", 22, 8], ["fx", "flash", "m13c", 28, 0],
            N("Arrows fly from every side. Afraid for his daughter, Lü Bu turns back into the city, and after that he only drinks.",
              "四下箭如雨发。吕布恐伤其女，只得退回城中。自此只是饮酒。"),
            ["run", "lb", "m13c", 110, 0], ["remove", "lb"],
            ["light", "dawn", 1500],
            ["still", "flood3_a", "slow pull back"],
            N("Then Cao Cao breaks the dykes of the Yi and the Si. The rivers pour over the plain around Xiapi, until only the east gate stands dry.",
              "曹操决沂、泗二水，水淹下邳，城中只剩东门无水。"),
            ["light", "day", 1500], ["remove", "men"],
        ]},
        "whitegate": {"title": T("The White Gate Tower", "白门楼"), "kind": "main", "steps": [
            # a reckoning, not a fight: Lü Bu bound, Cao Cao asks Liu Bei, and the board is the answer
            ["prop", "gate", "gate", "boss", 50, -14],
            ["spawn", "cc", "caocao", "boss", 14, -8],
            N("Xiapi falls. Lü Bu's own officers steal Red Hare, bind him while he sleeps on the gate tower, and open the gates.",
              "下邳城破。吕布部将侯成盗了赤兔马，宋宪、魏续趁吕布在门楼上睡着，把他绑了，开门投降。"),
            N("Cao Cao and Liu Bei sit side by side on the White Gate Tower. Guan Yu and Zhang Fei stand beside them.", "曹操与玄德同坐白门楼上，关、张侍立于侧。"),
            ["spawn", "lb", "lvbu", "boss", 30, 8], ["pose", "lb", "kneel"],
            ["still", "whitegate3_a", "slow zoom in"],
            S("lvbu", "The ropes are too tight. Loosen them!", "缚太急，乞缓之！"),
            S("caocao", "A tiger must be tied tight.", "缚虎不得不急。"),
            ["spawn", "cg", "chengong", "boss", 42, 0],
            S("caocao", "Gongtai, have you been well since we parted?", "公台别来无恙？"),
            S("chengong", "Your heart was crooked. That is why I left you.", "汝心术不正，吾故弃汝！"),
            S("caocao", "If my heart is crooked, why serve Lü Bu?", "吾心不正，公又奈何独事吕布？"),
            S("chengong", "Lü Bu has no plans, but he is not false and scheming like you.", "布虽无谋，不似你诡诈奸险。"),
            S("chengong", "If only this man had listened to me, we would not be here. Today there is only death.", "恨此人不从吾言！若从吾言，未必被擒也。今日有死而已！"),
            S("caocao", "And your old mother? Your wife and children?", "公如是，奈公之老母妻子何？"),
            S("chengong", "I have heard that one who rules by filial piety does not harm another man's parents. Their lives are in your hands. Kill me now. I have nothing more to ask.",
              "吾闻以孝治天下者，不害人之亲。老母妻子之存亡，亦在于明公耳。吾身既被擒，请即就戮，并无挂念。"),
            ["still", "whitegate3_b", "slow pull back"],
            N("Chen Gong walks down the stairs by himself, and does not look back. Cao Cao rises and weeps as he goes, and orders his mother and family cared for at Xu for the rest of their lives.",
              "陈宫径步下楼，左右牵之不住。曹操起身泣而送之，宫并不回顾。操令将公台老母妻子送回许都养老，怠慢者斩。"),
            ["move", "cg", "boss", 90, 20], ["remove", "cg"],
            S("lvbu", "You are the guest on the dais, and I the prisoner below the steps. Will you not say one word for me?", "公为坐上客，布为阶下囚，何不发一言而相宽乎？"),
            N("Liu Bei nods.", "玄德点头。"),
            S("lvbu", "Your only fear was me, Lord Cao, and I submit. You lead, I follow, and the realm is yours.", "明公所患，不过于布。布今已服矣。公为大将，布副之，天下不难定也。"),
            S("caocao", "What do you say?", "何如？"),
            ["problem"],  # the board is Liu Bei's answer
            S("liubei", "Have you not seen what happened to Ding Jianyang, and to Dong Zhuo?", "公不见丁建阳、董卓之事乎？"),
            S("lvbu", "This man is the least trustworthy of all!", "是儿最无信者！"),
            ["move", "lb", "boss", 80, 20],
            S("lvbu", "Big Ears! Have you forgotten the halberd at the camp gate?", "大耳儿！不记辕门射戟时耶？"),
            ["remove", "lb"],
            N("Lü Bu is taken down and strangled.", "吕布被拖下楼去，缢死。"),
            ["spawn", "zl", "zhangliao", "boss", 34, 8],
            S("zhangliao", "Lü Bu, you lout! If you die, you die. What is there to fear?", "吕布匹夫！死则死耳，何惧之有！"),
            S("zhangliao", "Pity the fire at Puyang wasn't bigger, Cao Cao. It didn't burn you to death, you traitor!", "可惜当日火不大，不曾烧死你这国贼！"),
            N("Cao Cao draws his sword to kill him himself. Zhang Liao stretches out his neck. Then Liu Bei catches Cao Cao's arm, and Guan Yu kneels before him.",
              "曹操大怒，拔剑亲自来杀张辽。辽全无惧色，引颈待杀。玄德攀住臂膊，云长跪于面前。"),
            S("guanyu", "I know Wenyuan to be loyal and true. I will answer for him with my life.", "关某素知文远忠义之士，愿以性命保之。"),
            N("Cao Cao throws down his sword and laughs: he only meant to test him. Zhang Liao serves Cao Cao from that day.", "操掷剑笑曰：“我亦知文远忠义，故戏之耳。”张辽遂降曹操。"),
            ["remove", "zl"], ["remove", "cc"], ["remove", "gate"],
        ]},
    }


def _scenes_chengong():
    return {
        "temple": {"title": T("The Temple in the Rain", "古寺夜雨"), "kind": "side", "steps": [
            ["light", "storm", 800],
            ["spawn", "cs", "caosong", "a1", 10, -4], ["army", "zkm", "f_soldier", 5, "a1", -30, 6], ["spawn", "zk", "zhangkai", "a1", -16, 0],
            ["prop", "cart", "cart", "a1", 30, 6],
            N("Before Cao Cao marched on Xuzhou: an old temple between Hua and Fei, on a night of rain.", "曹操兵临徐州之前：华、费之间一座古寺，大雨之夜。"),
            N("Cao Song, Cao Cao's father, has stopped here with his family and a hundred carts. Tao Qian's officer Zhang Kai and five hundred men keep watch outside in the rain.",
              "曹操之父曹嵩带着家小和百余辆车，在此避雨。陶谦部下都尉张闿领五百兵，在雨中守在寺外。"),
            S("zhangkai", "We were Yellow Turbans once, and Tao Qian has given us nothing. These carts are full. Riches are easy tonight.",
              "我们本是黄巾余党，勉强降顺陶谦，未有好处；如今曹嵩辎重车辆无数，你们欲得富贵不难。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["fx", "fire", "a1", 10, -8], ["pose", "cs", "fall"],
            N("That night they kill the whole family, take the carts, burn the temple, and run for Huainan.", "当夜杀了曹嵩全家，取了财物，放火烧寺，投淮南去了。"),
            N("The storyteller says: Cao Cao once killed Lü Boshe's whole house. Now his own house is killed. Heaven's justice comes round.",
              "后人有诗曰：曹操奸雄世所夸，曾将吕氏杀全家。如今阖户逢人杀，天理循环报不差。"),
            ["remove", "cs"], ["remove", "zk"], ["remove", "zkm"], ["remove", "cart"], ["light", "day", 1500],
        ]},
        "plea": {"title": T("Chen Gong Pleads", "陈宫进谏"), "kind": "side", "steps": [
            ["army", "cao", "f_soldier", 8, "a2", 40, 0], ["spawn", "cc", "caocao", "a2", 18, -4],
            N("Cao Cao's whole army goes into white mourning, and every city it takes is put to the sword.", "曹操全军挂孝，凡得城池，将城中百姓尽行屠戮。"),
            S("caocao", "Tao Qian let his men kill my father. We cannot live under the same sky! I will wash Xuzhou clean.", "陶谦纵兵杀吾父，此雠不共戴天！吾今悉起大军，洗荡徐州，方雪吾恨！"),
            ["spawn", "cg", "chengong", "a2", -30, 6], ["move", "cg", "a2", 0, 4],
            N("Chen Gong, who left Cao Cao after Lü Boshe's farm, is an officer at Dongjun now, and a friend of Tao Qian. He comes to plead for Xuzhou.",
              "陈宫自吕伯奢庄上离了曹操，此时在东郡为从事，与陶谦交厚，闻讯特来求见。"),
            S("chengong", "Tao Qian is a good man. Your father's death was Zhang Kai's crime, not his. And what feud have the common people with you?",
              "陶谦乃仁人君子，非好利忘义之辈；尊父遇害，乃张闿之恶，非谦罪也。且州县之民，与明公何雠？杀之不祥。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            S("caocao", "You left me once. Now you come back to speak for him? Tao Qian killed my family. I will tear out his heart!",
              "公昔弃我而去，今有何面目复来相见？陶谦杀吾一家，誓当摘胆剜心，以雪吾恨！"),
            N("Chen Gong goes out, and sighs.", "陈宫辞出，叹曰："),
            S("chengong", "Now I cannot face Tao Qian either!", "吾亦无面目见陶谦也！"),
            N("He rides to Zhang Miao at Chenliu. Soon he will bring Lü Bu to take Cao Cao's home province behind his back.", "遂驰马投陈留太守张邈去了。不久，他便要引吕布去袭曹操的兖州。"),
            ["remove", "cg"], ["remove", "cc"], ["remove", "cao"],
        ]},
        "puyang": {"title": T("The Fire at Puyang", "濮阳火"), "kind": "side", "steps": [
            ["light", "night", 800], ["prop", "gate", "gate", "a3", 40, -14],
            ["spawn", "cc", "caocao", "a3", -10, 0], ["army", "cao", "f_soldier", 5, "a3", -34, 6],
            N("Lü Bu holds Puyang. Chen Gong has the rich Tian family write to Cao Cao: they will open the gate, and a white banner marked RIGHTEOUSNESS will be the sign.",
              "吕布据了濮阳。陈宫令城中富户田氏密书曹操，愿为内应，城上插白旗，大书“义”字为号。"),
            S("caocao", "Heaven gives me Puyang!", "天使吾得濮阳也！"),
            N("Cao Cao rides in himself. The streets are empty. Then fire breaks out at all four gates.", "曹操亲自入城，街上不见一人。忽然四门烈火齐起。"),
            ["fx", "fire", "a3", 40, -10], ["fx", "fire", "a3", 0, 14], ["mood", "dark"],
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["spawn", "lb", "lvbu", "a3", 50, 0], ["move", "lb", "a3", 6, 0],
            N("In the smoke Lü Bu rides up, taps Cao Cao's helmet with his halberd, and does not know him.", "火光里吕布挺戟而来，用戟在曹操盔上一击，却不认得他。"),
            S("lvbu", "Where is Cao Cao?", "曹操何在？"),
            S("caocao", "Ahead, on the yellow horse!", "前面骑黄马者是他。"),
            ["run", "lb", "a3", 140, -10], ["remove", "lb"],
            N("Lü Bu gallops off after the yellow horse. A burning beam falls on Cao Cao, and his men drag him out singed but alive. Among Lü Bu's officers that night is Zhang Liao.",
              "吕布便纵马向前追去。一条火梁倒下，打着曹操，众将救出，须发尽被烧坏。是夜吕布军中，便有张辽。"),
            S("caocao", "I fell for that oaf's trick. I will pay him back!", "误中匹夫之计，吾必当报之！"),
            ["mood", "clear"], ["remove", "cc"], ["remove", "cao"], ["remove", "gate"], ["light", "day", 1500],
        ]},
        "threeplans": {"title": T("Three Plans", "陈宫三计"), "kind": "side", "steps": [
            ["prop", "tbl", "table", "a4", 10, 10],
            ["spawn", "lb", "lvbu", "a4", 14, -4], ["spawn", "cg", "chengong", "a4", -14, 4],
            N("In Xiapi, before the flood. Chen Gong comes to Lü Bu with a plan.", "下邳城中，水淹之前。陈宫来见吕布献计。"),
            S("chengong", "Cao Cao has only just come. Strike before his camps are set, rested men against tired ones, and we cannot lose.", "今操兵方来，可乘其寨栅未定，以逸击劳，无不胜者。"),
            S("lvbu", "I have lost too often to go out rashly. Let them come, and I will drive them all into the Si.", "吾方屡败，不可轻出。待其来攻而后击之，皆落泗水矣。"),
            N("Then a second plan: Lü Bu camps outside the walls and Chen Gong holds the city, and each relieves the other. Lü Bu agrees, until his wife, Lady Yan, weeps.",
              "陈宫又献掎角之计：吕布引兵屯于城外，陈宫守城，互为救应。吕布然之。其妻严氏却哭道："),
            ["spawn", "ys", "yanshi", "a4", 26, 8],
            S("yanshi", "You would leave the city and your wife, and go out alone. If anything goes wrong, will I still be your wife?", "君委全城，捐妻子，孤军远出，倘一旦有变，妾岂得为将军之妻乎？"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            N("A third plan, to cut Cao Cao's grain. Lady Yan weeps again, and Diaochan begs him too.", "陈宫又劝断曹操粮道。严氏又泣，貂蝉也来劝。"),
            ["spawn", "dc", "diaochan", "a4", 34, -2],
            S("diaochan", "Be my protector, general. Do not ride out alone.", "将军与妾作主，勿轻骑自出。"),
            S("lvbu", "Don't worry. With my halberd and Red Hare, who dares come near me?", "汝无忧虑。吾有画戟、赤兔马，谁敢近我？"),
            N("Lü Bu stays in, and drinks with Lady Yan and Diaochan day after day.", "吕布遂不出，终日与严氏、貂蝉饮酒解闷。"),
            S("chengong", "We will die with no ground to be buried in!", "吾等死无葬身之地矣！"),
            ["remove", "lb"], ["remove", "cg"], ["remove", "ys"], ["remove", "dc"], ["remove", "tbl"],
        ]},
        "winejars": {"title": T("The Wine Jars", "侯成盗马"), "kind": "side", "steps": [
            ["spawn", "lb", "lvbu", "a5", 14, -4],
            N("With the water around the walls, Lü Bu sees in a mirror how wine has wasted him, and forbids wine in the city.", "水围城下，吕布照镜，见形容憔悴，乃下令城中禁酒。"),
            S("lvbu", "Wine and women have wrecked me. From today, no more.", "吾被酒色伤矣！自今日始，当戒之。"),
            ["spawn", "hc", "houcheng", "a5", -26, 6], ["prop", "jars", "winejars", "a5", -14, 10], ["move", "hc", "a5", 0, 4],
            N("His officer Hou Cheng gets back fifteen stolen horses, and his friends want to celebrate. Afraid of the ban, he first brings five jars of the new wine to Lü Bu.",
              "部将侯成追回被盗的十五匹马，众将要来作贺。侯成怕违禁，先送五瓶酒给吕布。"),
            S("lvbu", "I have just forbidden wine, and you brew it for a party? Are you all plotting against me?", "吾方禁酒，汝却酿酒会饮，莫非同谋伐我乎？"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            N("He orders Hou Cheng beheaded. The officers beg, and he has him beaten fifty strokes instead.", "喝令推出斩之。众将告免，打了五十背花。"),
            ["remove", "lb"], ["remove", "jars"],
            N("That night Song Xian and Wei Xu come to see him.", "当夜，宋宪、魏续来看侯成。"),
            S("houcheng", "What Lü Bu trusts is Red Hare. You two open the gate and seize him, and I will steal the horse first and take it to Lord Cao.",
              "布所倚恃者，赤兔马也。汝二人果能献门擒布，吾当先盗马去见曹公。"),
            N("Before dawn, Hou Cheng leads Red Hare out of the east gate.", "天未明，侯成盗了赤兔马，出东门而去。"),
            ["run", "hc", "a5", 140, 0], ["remove", "hc"],
        ]},
    }


def _scenes_emperor():
    return {
        "dogs": {"title": T("Two Dogs and a Bone", "二犬争骨"), "kind": "side", "steps": [
            ["spawn", "xd", "xiandi", "b1", 0, -4], ["spawn", "lj", "lijue", "b1", 26, 4], ["spawn", "gs", "guosi", "b1", 60, 0],
            N("Meanwhile, in Chang'an, Li Jue and Guo Si fall out. Guo Si's jealous wife has made him believe Li Jue means to poison him.", "此时长安城中，李傕、郭汜反目。郭汜之妻多疑，硬说李傕要毒死丈夫。"),
            N("Li Jue carries the Emperor off to his camp. Guo Si seizes the ministers who come to make peace. They fight in the streets for fifty days.",
              "李傕劫天子入营，郭汜扣下前来讲和的公卿。两人在城中厮杀五十余日。"),
            S("guosi", "Li Jue can kidnap the Son of Heaven, and I can't kidnap ministers?", "李傕劫天子，偏我劫不得公卿！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            N("The Emperor asks for rice and meat for his attendants. Li Jue sends rotten meat.", "天子令人求米五斛、牛骨五具，以赐左右。李傕却送去腐肉朽粮。"),
            S("lijue", "You get your meals. What more do you want?", "朝夕上饭，何又他求？"),
            S("xiandi", "Traitor, to insult me so!", "逆贼直如此相欺！"),
            N("At last the two make peace, and let the Emperor go east, to the old capital.", "后来两人讲和，放天子东归旧都。"),
            ["remove", "xd"], ["remove", "lj"], ["remove", "gs"],
        ]},
        "river": {"title": T("The River at Night", "夜渡黄河"), "kind": "side", "steps": [
            ["light", "night", 800],
            ["spawn", "xd", "xiandi", "b2", 0, -4], ["army", "court", "f_official", 5, "b2", -20, 8],
            N("On the road east, Li Jue and Guo Si change their minds and come after him. At the Yellow River the bank is high, and there is one small boat.",
              "东归路上，李傕、郭汜又反悔追来。到了黄河边，岸高水急，只有一条小船。"),
            S("xiandi", "I cannot leave my officials behind.", "朕不可舍百官而去。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            N("They let the Emperor and the Empress down the bank wrapped in silk. Men crowd the boat and cling to its sides, and are cut away.",
              "众人以绢包了天子与皇后，从岸上放下，扶上小船。争上船的人扒住船舷不放，都被砍落水中。"),
            ["move", "xd", "b2", 60, 0], ["remove", "court"],
            N("On the far bank the Emperor has a dozen people left, and eats coarse millet in a thatched hut.", "到得对岸，天子身边只剩十余人，在茅屋中吃粗粮。"),
            ["remove", "xd"], ["light", "day", 1500],
        ]},
        "thorns": {"title": T("Among the Thorns", "荆棘中的朝廷"), "kind": "side", "steps": [
            ["spawn", "xd", "xiandi", "b3", 0, -4], ["army", "court", "f_official", 5, "b3", -24, 8],
            N("The Emperor reaches Luoyang. The palaces are ash, and weeds grow through the walls. The court stands among thorns, and officials go out to gather firewood, and some starve.",
              "天子到了洛阳，宫室烧尽，街市荒芜，满目蒿草。百官立于荆棘之中朝见，尚书郎以下自出城外采樵，多有饿死于颓墙坏壁之间者。"),
            ["army", "cao", "f_soldier", 6, "b3", 70, 0], ["spawn", "cc", "caocao", "b3", 50, 0], ["move", "cc", "b3", 18, 0],
            N("Then Cao Cao comes, with an army and with grain.", "此时曹操引大军到来。"),
            S("xiandi", "General Cao is truly a pillar of the state!", "曹将军真社稷臣也！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            N("Cao Cao moves the Emperor to his own city, Xu. From then on all power is Cao Cao's: the court's business goes to him first, and to the Emperor after.",
              "曹操移驾许都。自此大权皆归于曹操，朝廷大务，先禀曹操，然后方奏天子。"),
            ["remove", "xd"], ["remove", "court"], ["remove", "cc"], ["remove", "cao"],
        ]},
    }


def _scenes_sunce():
    return {
        "pawn": {"title": T("The Seal in Pawn", "典玺借兵"), "kind": "side", "steps": [
            ["spawn", "ys", "yuanshu", "c1", 20, -4], ["spawn", "sc", "sunce", "c1", -6, 4],
            N("At Shouchun, Sun Jian's son Sun Ce serves Yuan Shu, and is given no army of his own. One night he weeps for his father.", "寿春城中，孙坚之子孙策寄身袁术帐下，不得兵权。一夜，他想起父亲，放声大哭。"),
            N("He brings Yuan Shu the Imperial Seal his father found in the well, and asks for men in exchange.", "孙策取出父亲当年从井中得来的传国玉玺，向袁术借兵。"),
            ["prop", "seal", "seal", "c1", 8, 2],
            S("sunce", "Take the seal as my pledge, and lend me three thousand men.", "策愿以玉玺为质，借兵三千。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            S("yuanshu", "It is not that I want your seal. I will just keep it here for now.", "吾非要你玉玺，今且权留在此。"),
            N("Sun Ce gets three thousand men and five hundred horses, and crosses the river to the south.", "孙策得兵三千、马五百匹，渡江南下。"),
            ["remove", "ys"], ["remove", "sc"], ["remove", "seal"],
        ]},
        "shenting": {"title": T("Shenting Ridge", "神亭酣斗"), "kind": "side", "steps": [
            ["spawn", "sc", "sunce", "c2", -10, 0], ["army", "riders", "f_soldier", 4, "c2", -34, 6],
            N("In the south, Sun Ce rides up Shenting Ridge with thirteen riders. Taishi Ci, who left Beihai to serve Liu Yao, charges out alone.",
              "江东神亭岭上，孙策只带十三骑上山。当年离了北海、投了刘繇的太史慈，独自挺枪而出。"),
            ["spawn", "tsc", "taishici", "c2", 60, 0], ["run", "tsc", "c2", 14, 0],
            S("taishici", "I am Taishi Ci of Donglai, come to capture Sun Ce!", "我便是东莱太史慈也，特来捉孙策！"),
            S("sunce", "Come at me two at a time, I'm not afraid. If I feared you, I would not be Sun Bofu!", "你两个一齐来并我一个，我不惧你！我若怕你，非孙伯符也！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["pose", "sc", "strike"], ["pose", "tsc", "strike"], ["fx", "dust", "c2", 4, 0],
            N("They fight a hundred bouts, until both are dragged from their horses. Sun Ce comes away with Taishi Ci's short halberd, and Taishi Ci with Sun Ce's helmet.",
              "两人斗了一百余合，都滚下马来。孙策夺了太史慈背上短戟，太史慈掣了孙策头上的兜鍪。"),
            N("Next day each holds up his prize before the other's army.", "次日，两边阵前各自挑出所得之物示众。"),
            ["remove", "sc"], ["remove", "tsc"], ["remove", "riders"],
        ]},
        "noon": {"title": T("By Noon Tomorrow", "如约而归"), "kind": "side", "steps": [
            ["spawn", "sc", "sunce", "c3", 10, -4], ["spawn", "tsc", "taishici", "c3", -10, 4], ["pose", "tsc", "kneel"],
            N("Liu Yao is beaten, and Taishi Ci is caught in tripping ropes. Sun Ce unties him himself, and puts his own robe on him.", "刘繇兵败，太史慈被绊马索擒住。孙策亲自为他解缚，脱下自己的锦袍给他穿上。"),
            ["pose", "tsc", "stand"],
            S("sunce", "At Shenting, if you had caught me, would you have killed me?", "神亭相战之时，若公获我，还相害否？"),
            S("taishici", "Hard to say.", "未可知也。"),
            N("Taishi Ci asks leave to gather Liu Yao's scattered men, and promises to be back by noon tomorrow. Sun Ce's officers say he will never come back.",
              "太史慈请求去招抚刘繇的散兵，约定明日中午回来。众将都说：此去必不回矣。"),
            ["run", "tsc", "c3", -120, 0], ["remove", "tsc"],
            S("sunce", "Ziyi is a man of his word. He will not betray me.", "子义乃信义之士，必不背我。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["army", "men", "militia", 6, "c3", -80, 0], ["spawn", "tsc", "taishici", "c3", -60, 0],
            ["move", "men", "c3", -30, 0], ["move", "tsc", "c3", -8, 0],
            N("At noon the next day, Taishi Ci rides in with more than a thousand men.", "次日日中，太史慈果然引一千余人回寨。"),
            ["remove", "sc"], ["remove", "tsc"], ["remove", "men"],
        ]},
    }


def _scenes_caoman():
    return {
        "wancheng": {"title": T("The Gate at Wancheng", "典韦死守"), "kind": "side", "steps": [
            ["light", "night", 800], ["prop", "gate", "gate", "d1", 30, -14],
            ["spawn", "dw", "dianwei", "d1", 24, 0],
            N("At Wancheng, Zhang Xiu surrenders to Cao Cao, and then Cao Cao takes Zhang Xiu's widowed aunt into his tent. Zhang Xiu decides to strike that night.",
              "宛城张绣降了曹操，曹操却把张绣的婶娘邹氏纳入帐中。张绣大怒，决意夜袭。"),
            N("First his man gets Cao Cao's bodyguard, Dian Wei, drunk, and steals his twin iron halberds.", "张绣部下胡车儿先把曹操的护卫典韦灌醉，偷走了他的双铁戟。"),
            ["fx", "fire", "d1", 50, -8], ["army", "zx", "f_soldier", 10, "d1", 80, 0],
            N("Fire. Dian Wei wakes without his halberds, takes a soldier's sword, and holds the camp gate alone.", "火起，典韦惊醒，不见双戟，夺了一口步卒的腰刀，独守寨门。"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["run", "zx", "d1", 36, 0], ["pose", "dw", "strike"], ["pose", "zx", "fall", 3],
            N("When the sword is notched, he fights with two dead men for clubs. He dies on his feet at the gate, covered in wounds, and for a long time no one dares go past him.",
              "刀砍缺了，他便提两个军人迎敌。身上数十处伤，大叫数声，血流满地而死。死了半晌，还无一人敢从前门而入。"),
            ["pose", "dw", "fall"], ["remove", "zx"], ["light", "dawn", 1500],
            ["spawn", "cc", "caocao", "d1", -20, 4],
            S("caocao", "I lost my eldest son and my nephew, and I do not grieve so. I weep only for Dian Wei.", "吾折长子、爱侄，俱无深痛；独号泣典韦也。"),
            ["remove", "dw"], ["remove", "cc"], ["remove", "gate"], ["light", "day", 1500],
        ]},
        "granary": {"title": T("The Granary Officer", "借头"), "kind": "side", "steps": [
            ["spawn", "cc", "caocao", "d2", 14, -4], ["spawn", "wh", "wanghou", "d2", -10, 6],
            N("Cao Cao besieges Yuan Shu's city of Shouchun, and his grain runs low. He tells the granary officer, Wang Hou, to hand it out in a smaller measure. The soldiers grumble that they are being cheated.",
              "曹操围攻袁术的寿春，军粮将尽。他令管粮官王垕用小斛散粮。军中嗟怨，都说曹公欺众。"),
            S("caocao", "I want to borrow something of yours, to calm the army: your head.", "吾欲问汝借一物，以压众心：欲借汝头以示众耳。"),
            S("wanghou", "But I have done nothing wrong!", "某实无罪！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            S("caocao", "I know you have done nothing wrong. But if I do not kill you, the army will turn.", "吾亦知汝无罪；但不杀汝，军心变矣。"),
            ["remove", "wh"],
            N("Wang Hou's head goes up on a pole: he cheated the army with a small measure. The grumbling stops. Cao Cao carries earth to the moat himself, and Shouchun falls.",
              "王垕之头悬于竿上，榜曰：王垕故行小斛，盗窃官粮。众怨始解。曹操亲自负土填堑，寿春遂破。"),
            ["remove", "cc"],
        ]},
        "eye": {"title": T("Father's Essence", "拔矢啖睛"), "kind": "side", "steps": [
            ["spawn", "xhd", "xiahoudun", "d3", -6, 0], ["army", "cao", "f_soldier", 6, "d3", -34, 6], ["army", "lbm", "f_soldier", 6, "d3", 70, 0],
            N("Cao Cao sends Xiahou Dun to help Liu Bei at Xiaopei. On the road, Lü Bu's officer Cao Xing shoots him in the left eye.", "曹操遣夏侯惇往救小沛。路上，吕布部将曹性一箭射中夏侯惇左目。"),
            ["fx", "flash", "d3", -6, -4],
            N("Xiahou Dun pulls out the arrow, and the eye comes with it.", "夏侯惇急用手拔箭，不想连眼珠拔出。"),
            S("xiahoudun", "Father's essence, mother's blood. I will not throw it away!", "父精母血，不可弃也！"),
            ["problem"],  # the board comes up here; the rest plays once it is solved
            ["run", "xhd", "d3", 50, 0], ["pose", "xhd", "strike"], ["pose", "lbm", "fall", 1],
            N("He swallows the eye, spurs at Cao Xing, and puts his spear through his face.", "遂纳于口内啖之，挺枪纵马，直取曹性，一枪搠透面门。"),
            N("But Cao Cao's army is still beaten back, and Xiaopei is left to stand alone.", "但曹军终被杀败，小沛孤立无援。"),
            ["remove", "xhd"], ["remove", "cao"], ["remove", "lbm"],
        ]},
    }


def _dl(q, who, open_, win, slip, zq, zopen, zwin, zslip):
    """A decision board: caption, who weighs it, and the lines on opening, a solve and a slip."""
    ZH3[q], ZH3[open_], ZH3[win], ZH3[slip] = zq, zopen, zwin, zslip
    return {"q": q, "who": who, "open": open_, "win": win, "slip": slip}


def _node(key, x, y, role, place, step, scene, **extra):
    n = {"key": key, "x": x, "y": y, "role": role, "place": T(*place), "step": step, "scene": scene}
    n.update(extra)
    return n


_XUZHOU = ("Xuzhou", "徐州")
_XIAOPEI = ("Xiaopei", "小沛")
_XIAPI = ("Xiapi", "下邳")
ZH3["Lü Bu, bound at the White Gate"] = "白门楼上的吕布"
ZH3["bound at the White Gate"] = "白门楼上的阶下囚"
_OBJ_ROAD = T("Hold the Huainan road.", "守住淮南要路。")


def _nodes():
    return [
        _node("m1", 30, 220, "main", ("Pingyuan", "平原"), 0.0, "beihai1", trigger="arrive"),
        _node("m2", 64, 196, "main", ("Beihai", "北海"), 0.06, "beihai2"),
        _node("m3", 104, 176, "main", _XUZHOU, 0.12, "breakthrough"),
        _node("m4", 120, 164, "main", _XUZHOU, 0.18, "second"),
        _node("m5", 136, 152, "main", _XUZHOU, 0.24, "deathbed",
              dilemma=_dl("Take Xuzhou from a dying man's hand?", "liubei",
                          "He has two sons, and he asks me. If I take it, they will say I wanted it. If I refuse, I refuse a dying man.",
                          "I will hold it, for now.", "Not yet. I cannot take it.",
                          "从垂死之人手中接过徐州？", "他有两个儿子，却托付于我。接了，人说我早有此心；不接，便是拒绝一个将死之人。",
                          "那就暂且代领。", "且慢，我接不得。")),
        _node("m6", 152, 140, "main", _XUZHOU, 0.32, "guest"),
        _node("m7", 168, 128, "main", _XUZHOU, 0.4, "tigers",
              dilemma=_dl("Kill Lü Bu, as the letter says?", "liubei",
                          "The letter comes in the Emperor's name. But Lü Bu came to me with nowhere else to go.",
                          "I know what is right.", "Not yet. Let me think it through.",
                          "依密书杀吕布？", "这封书信打着天子的名义。可吕布是走投无路才来投我的。",
                          "我知道该怎么做了。", "且慢，容我再想想。")),
        _node("m8", 184, 120, "main", _XUZHOU, 0.46, "vow"),
        _node("m9", 220, 150, "main", ("Xuyi", "盱眙"), 0.52, "handsfeet"),
        _node("m10", 254, 140, "main", _XIAOPEI, 0.6, "halberd"),
        _node("m11", 286, 126, "main", _XIAOPEI, 0.68, "horses"),
        _node("m12", 318, 140, "main", _XIAOPEI, 0.76, "scattered"),
        _node("m13", 352, 120, "main", _XIAPI, 0.82, "xiapi", board=False),
        _node("m13b", 368, 104, "main", _XIAPI, 0.86, "rock3", shrine=True, hint=T("Shut every door, and wait.", "把门都关上，然后等。")),
        _node("m13c", 390, 114, "main", _XIAPI, 0.9, "breakout",
              # the brothers must be at their posts on the road before Lü Bu tries it
              gate=[{"needs": ["node:m13b"], "else": "roadearly", "objective": _OBJ_ROAD, "at": "Xiapi", "count": False},
                    {"needs": ["mark:road_west", "mark:road_east"], "else": "roadearly2",
                     "objective": T("Post Guan Yu on the west side of the road and Zhang Fei on the east.", "让关羽守路西，张飞守路东。"), "at": "Xiapi"}]),
        {"key": "boss", "x": 430, "y": 90, "role": "boss", "place": T(*_XIAPI), "scene": "whitegate",
         "boss": {"who": "lvbu", "title": "Lü Bu, bound at the White Gate",
                  "taunt": T("You are the guest on the dais, and I the prisoner below the steps.", "公为坐上客，布为阶下囚。")}},
        # A. Chen Gong's Counsel: Cao Song's murder, the plea, Puyang (off m3); Xiapi before the fall (off m13c)
        _node("a1", 96, 214, "side", ("An Old Temple", "古寺"), 0.14, "temple"),
        _node("a2", 112, 226, "side", ("Cao Cao's Camp", "曹营"), 0.16, "plea"),
        _node("a3", 126, 210, "side", ("Puyang", "濮阳"), 0.18, "puyang"),
        _node("a4", 404, 140, "side", _XIAPI, 0.92, "threeplans"),
        _node("a5", 420, 124, "side", _XIAPI, 0.94, "winejars"),
        # B. The Emperor's Road (off m6)
        _node("b1", 150, 100, "side", ("Chang'an", "长安"), 0.34, "dogs"),
        _node("b2", 164, 86, "side", ("The Yellow River", "黄河渡口"), 0.36, "river"),
        _node("b3", 180, 96, "side", ("Burned Luoyang", "焦土洛阳"), 0.38, "thorns"),
        # C. The Little Conqueror (off m9)
        _node("c1", 222, 184, "side", ("Shouchun", "寿春"), 0.54, "pawn"),
        _node("c2", 238, 198, "side", ("Shenting Ridge", "神亭岭"), 0.56, "shenting"),
        _node("c3", 252, 180, "side", ("Jingxian", "泾县"), 0.58, "noon"),
        # D. Cao Cao's Men (off m11)
        _node("d1", 286, 160, "side", ("Wancheng", "宛城"), 0.7, "wancheng"),
        _node("d2", 300, 176, "side", ("Shouchun", "寿春"), 0.72, "granary"),
        _node("d3", 316, 164, "side", ("The Road to Xiaopei", "小沛道上"), 0.74, "eye"),
    ]


_EDGES = [["m1", "m2"], ["m2", "m3"], ["m3", "m4"], ["m4", "m5"], ["m5", "m6"], ["m6", "m7"], ["m7", "m8"], ["m8", "m9"],
          ["m9", "m10"], ["m10", "m11"], ["m11", "m12"], ["m12", "m13"], ["m13", "m13b"], ["m13", "m13c"], ["m13b", "m13c"],
          ["m13c", "boss"],
          ["m3", "a1"], ["a1", "a2"], ["a2", "a3"], ["a3", "m4"], ["m13c", "a4"], ["a4", "a5"], ["a5", "boss"],
          ["m6", "b1"], ["b1", "b2"], ["b2", "b3"], ["b3", "m7"],
          ["m9", "c1"], ["c1", "c2"], ["c2", "c3"], ["c3", "m10"],
          ["m11", "d1"], ["d1", "d2"], ["d2", "d3"], ["d3", "m12"]]


def _scene_table():
    scenes = {}
    for part in (_scenes_main(), _scenes_chengong(), _scenes_emperor(), _scenes_sunce(), _scenes_caoman()):
        scenes.update(part)
    return scenes


def _scroll(title, title_zh, paragraphs):
    """A storyteller scroll: paragraphs are (English, Chinese) pairs."""
    ZH3[title] = title_zh
    for en, zh in paragraphs:
        ZH3[en] = zh
    return ["scroll", title, [en for en, _ in paragraphs]]


def _opening():
    # picks up Book 2's last line: "What would become of the Emperor?"
    return [_scroll("Chapter 10", "第十回", [
        ("The Emperor stayed a prisoner in Chang'an. Li Jue and Guo Si, who had killed Wang Yun, wrote down the titles they wanted, and he had to grant them.",
         "天子仍困于长安。杀了王允的李傕、郭汜，写下想要的官爵，逼天子一一封赏。"),
        ("In the east, Cao Cao had grown strong, and he sent for his old father, Cao Song. Tao Qian, governor of Xuzhou, feasted the old man on the way and gave him an escort. The escort's captain, Zhang Kai, had once been a Yellow Turban. In a temple, in the rain, he killed the whole family for their carts.",
         "东边的曹操兵势日盛，遣人去接老父曹嵩。途经徐州，太守陶谦设宴款待，又派都尉张闿护送。张闿本是黄巾余党，夜宿古寺，趁雨杀了曹嵩全家，劫了财物而去。"),
        ("Cao Cao put on white mourning and swore to wash Xuzhou clean. Old Tao Qian, who had done no wrong, sent for help in every direction. One letter went to Kong Rong of Beihai. But Beihai, too, was besieged…",
         "曹操挂孝兴兵，誓要洗荡徐州。陶谦本无罪过，只得四处求救，其中一封送到了北海孔融那里。可北海自己也被围住了……"),
    ])]


def _closing():
    # plays straight after the boss: Chapter 20's hook, into Book 4 (the hunt at Xu)
    return [_scroll("After the White Gate", "白门楼之后", [
        ("Liu Bei went back to Xu with Cao Cao. The Emperor had the family records read, found that Liu Bei was his uncle, and from then on men called him the Imperial Uncle.",
         "玄德随曹操回到许都。天子命人查宗族世谱，原来玄德是自己的皇叔，从此人皆称玄德为“刘皇叔”。"),
        ("Cao Cao's advisers whispered that a man the Emperor called uncle was a danger. Cao Cao only smiled, and asked the Emperor to come hunting.",
         "曹操的谋士暗暗进言：天子认了皇叔，恐为后患。曹操只是一笑，请天子出城打围。"),
        ("What happened at the hunt? Hear the next chapter.", "许田打围，又出了什么事？且听下回分解。"),
    ])]


def _world():
    return {
        "n": 3,
        "name": "White Gate Tower",
        "zh": "白门楼",
        "chapters": list(range(10, 20)),
        "couplets": [
            ["勤王室马腾举义　报父雠曹操兴师",
             "Ma Teng rises to aid the throne; Cao Cao marches to avenge his father"],
            ["刘皇叔北海救孔融　吕温侯濮阳破曹操",
             "Imperial Uncle Liu rescues Kong Rong at Beihai; Lü Bu defeats Cao Cao at Puyang"],
            ["陶恭祖三让徐州　曹孟德大战吕布",
             "Tao Qian offers Xuzhou three times; Cao Cao battles Lü Bu"],
            ["李傕郭汜大交兵　杨奉董承双救驾",
             "Li Jue and Guo Si clash; Yang Feng and Dong Cheng rescue the Emperor"],
            ["曹孟德移驾幸许都　吕奉先乘夜袭徐郡",
             "Cao Cao moves the Emperor to Xu; Lü Bu takes Xuzhou by night"],
            ["太史慈酣斗小霸王　孙伯符大战严白虎",
             "Taishi Ci fights the Little Conqueror; Sun Ce battles Yan Baihu"],
            ["吕奉先射戟辕门　曹孟德败师淯水",
             "Lü Bu shoots the halberd at the camp gate; Cao Cao is beaten at the Yu River"],
            ["袁公路大起七军　曹孟德会合三将",
             "Yuan Shu raises seven armies; Cao Cao joins three generals"],
            ["贾文和料敌决胜　夏侯惇拔矢啖睛",
             "Jia Xu foresees the enemy and wins; Xiahou Dun pulls out the arrow and eats his eye"],
            ["下邳城曹操鏖兵　白门楼吕布殒命",
             "Cao Cao fights at Xiapi; Lü Bu dies at the White Gate Tower"],
        ],
        "grades": ["10K", "9K"],
        "boss": "redmond",
        "party": ["liubei", "guanyu", "zhangfei"],
        "items": {},
        "nodes": _nodes(),
        "edges": _EDGES,
        "opening": _opening(),
        "scenes": _scene_table(),
        "closing": _closing(),
    }


WORLD3 = _world()


# ---- the places (read by tk_places.py as PLACES[3]) ----
def _P(archetype, landmarks, npcs, objectives, **extra):
    d = {"archetype": archetype, "landmarks": landmarks, "npcs": npcs, "objectives": objectives}
    d.update(extra)
    return d


def _talk(kind, line_en, line_zh, **extra):
    ZH3["“" + line_en + "”"] = "“" + line_zh + "”"
    d = {"kind": kind, "say": "“" + line_en + "”"}
    d.update(extra)
    return d


def _w(who, en, zh):
    """A [who, text] line for a landmark."""
    ZH3[en] = zh
    return [who, en]


PLACES3 = {
    "Pingyuan": _P("town", [{"kind": "building.gate", "id": "gate", "node": "3-m1", "trigger": "arrive", "label": T("Pingyuan's gate", "平原城门")}],
                   [_talk("folk.villager", "The chancellor keeps his gate open. Anyone in trouble comes here.", "国相从不闭门。谁有难处，都往这里来。")],
                   {"3-m1": T("Meet the rider at Pingyuan's gate.", "到平原城门，见那位来使。")}),
    "Beihai": _P("city", [{"kind": "building.gate", "id": "gate", "node": "3-m2", "label": T("The gate of Beihai", "北海城门")}],
                 [_talk("folk.soldier", "Guan Hai wants our grain. The governor would sooner starve.", "管亥要我们的粮。孔府君宁可饿死也不给。")],
                 {"3-m2": T("Go to Beihai and lift the siege.", "前往北海解围。")}, banners="red"),
    "Xuzhou": _P("city", [
        {"kind": "rock.big", "id": "lines", "node": "3-m3", "label": T("Cao Cao's lines", "曹军营垒")},
        {"kind": "building.hall", "id": "hall", "node": "3-m4", "label": T("The governor's hall", "州衙")},
        {"kind": "building.house", "id": "sickroom", "node": "3-m5", "label": T("Tao Qian's room", "陶谦的卧房")},
        {"kind": "building.gate", "id": "gate", "node": "3-m6", "label": T("The road gate", "城门")},
        {"kind": "building.hall", "id": "guesthall", "node": "3-m7", "label": T("The guest hall", "客厅")},
        {"kind": "building.tent", "id": "muster", "node": "3-m8", "label": T("The muster ground", "校场")},
    ], [_talk("folk.elder", "Cao Cao's men dug up the graves along the road. Old Tao Qian wept when he heard.", "曹兵把路边的坟都掘了。陶公听说，哭了一场。"),
        _talk("folk.woman", "Lord Liu came through Cao Cao's lines with a red banner. I saw it from the wall.", "刘使君打着红旗，从曹营里杀进来，我在城上亲眼看见的。")],
        {"3-m3": T("Go to Xuzhou, where Cao Cao's army surrounds the city.", "前往徐州，曹军正围着城。"),
         "3-m4": T("Go to the governor's hall for the victory feast.", "到州衙赴庆功宴。"),
         "3-m5": T("Go to Tao Qian. He is dying, and has asked for you.", "去见陶谦。他病重，请你去。"),
         "3-m6": T("Go out to the road gate. Lü Bu is coming, asking for shelter.", "到城门外去。吕布前来投奔。"),
         "3-m7": T("Go to the guest hall. An envoy has come from Xu.", "到客厅去。许都来了使者。"),
         "3-m8": T("Go to the muster ground. An order has come to march.", "到校场去。出兵的诏令到了。")}, banners="red"),
    "Xuyi": _P("camp", [{"kind": "building.tent", "id": "camp", "node": "3-m9", "label": T("The camp at Xuyi", "盱眙营寨")}],
               [_talk("folk.soldier", "Ji Ling's blade has three points. Lord Guan says it is heavy for nothing.", "纪灵那口刀有三个尖。关将军说，重是重，没什么用。")],
               {"3-m9": T("March to Xuyi, against Yuan Shu's general Ji Ling.", "进兵盱眙，迎战袁术大将纪灵。")}, banners="red"),
    "Xiaopei": _P("town", [
        {"kind": "building.tent", "id": "lvbucamp", "node": "3-m10", "label": T("Lü Bu's camp", "吕布营寨")},
        {"kind": "building.gate", "id": "northgate", "node": "3-m11", "label": T("The north gate", "北门")},
        {"kind": "building.gate", "id": "westgate", "node": "3-m12", "label": T("The west gate", "西门")},
    ], [_talk("folk.villager", "We had Lü Bu here, then Lord Liu, then Lü Bu's men again. We just keep our heads down.", "先是吕布，又是刘使君，又是吕布的人。我们只管低着头过日子。")],
        {"3-m10": T("Go to Lü Bu's camp. He has called both sides to a feast.", "到吕布营中。他请两家赴宴。"),
         "3-m11": T("Go to the north gate. Lü Bu has come in a rage.", "到北门去。吕布怒气冲冲地来了。"),
         "3-m12": T("Go to the west gate. Lü Bu's generals are attacking.", "到西门去。吕布的部将正在攻城。")}),
    "Xiapi": _P("city", [
        {"kind": "building.tent", "id": "camp", "node": "3-m13", "label": T("Liu Bei's camp on the road", "玄德路口营寨")},
        {"kind": "landmark.shrine", "id": "rock", "node": "3-m13b", "near": "camp", "label": T("The shrine under the pine", "松下星君祠"),
         "intro": [T("Under the old pine by the camp, a game has been laid out on the little shrine's offering table, with wine cups and dried meat beside it.", "营边老松树下，小祠的供桌上摆开了一局棋，旁边放着酒杯和肉脯。")],
         "outro": [T("The old men are gone. Only the game remains.", "两位老人已经不见了，只剩下那盘棋。")]},
        {"kind": "rock.big", "id": "road", "node": "3-m13c", "label": T("The Huainan road", "淮南要路")},
        {"kind": "building.gate", "id": "whitegate", "node": "3-boss", "label": T("The White Gate Tower", "白门楼")},
        {"kind": "building.hall", "id": "lvbuhall", "node": "3-a4", "label": T("Lü Bu's hall", "吕布府中")},
        {"kind": "building.house", "id": "houcheng", "node": "3-a5", "label": T("Hou Cheng's quarters", "侯成住处")},
        # the brothers take a side of the road each (Guan Yu west, Zhang Fei east)
        {"kind": "rock.crag", "id": "road_west", "label": T("The west side of the road", "路西"),
         "needs": ["node:m13b"], "delivers": "road_west", "when": "node:m13b",
         "empty": [T("No one is posted here yet. Go to the shrine under the pine first.", "这里还没有人把守。先去松树下的星君祠。")],
         "call": [_w("guanyu", "Brother, give me the west side. Nothing will pass me.", "兄长，路西交给我。什么也过不去。")],
         "deliver": [_w("guanyu", "The west is shut. Let him look for another door.", "路西已关。让他另寻门户吧。")]},
        {"kind": "rock.crag", "id": "road_east", "label": T("The east side of the road", "路东"),
         "needs": ["node:m13b"], "delivers": "road_east", "when": "node:m13b",
         "empty": [T("No one is posted here yet. Go to the shrine under the pine first.", "这里还没有人把守。先去松树下的星君祠。")],
         "call": [_w("zhangfei", "Brother! Put me on the east side. I'll catch whatever comes.", "哥哥！让我守路东。来什么捉什么。")],
         "deliver": [_w("zhangfei", "The east is mine. Not even a rabbit gets through.", "路东归我。连只兔子也别想过去。")]},
    ], [_talk("folk.soldier", "Lord Cao says any camp that lets Lü Bu through answers for it by martial law.", "曹公有令：哪个营寨放走了吕布，军法从事。")],
        {"3-m13": T("Go to Xiapi, where Cao Cao has Lü Bu surrounded.", "前往下邳，曹操已把吕布围住。"),
         "3-m13b": T("Go to the shrine under the pine by the camp.", "到营边松树下的星君祠去。"),
         "3-m13c": _OBJ_ROAD,
         "3-boss": T("Go up to the White Gate Tower.", "登上白门楼。"),
         "3-a4": T("Side story: Chen Gong's plans in Lü Bu's hall.", "支线：吕布府中，陈宫献计。"),
         "3-a5": T("Side story: Hou Cheng's wine jars.", "支线：侯成的酒。")}),
    # ---- side threads ----
    "An Old Temple": _P("hills", [{"kind": "building.hall", "id": "temple", "node": "3-a1", "label": T("The old temple", "古寺")}],
                        [_talk("folk.monk", "Travellers shelter here when it rains. We ask no names.", "下雨天，过路人都来这里避雨。我们从不问姓名。")],
                        {"3-a1": T("Side story: the old temple, on a night of rain.", "支线：雨夜古寺。")}),
    "Cao Cao's Camp": _P("camp", [{"kind": "building.tent", "id": "tent", "node": "3-a2", "label": T("Cao Cao's tent", "曹操大帐")}],
                         [_talk("folk.soldier", "White cloth on every man. The general is in mourning, and so are we.", "人人挂孝。主公在服丧，我们也一样。")],
                         {"3-a2": T("Side story: Cao Cao's tent, before Xuzhou.", "支线：徐州城外，曹操大帐。")}, banners="red"),
    "Puyang": _P("city", [{"kind": "building.gate", "id": "gate", "node": "3-a3", "label": T("The gate of Puyang", "濮阳城门")}],
                 [_talk("folk.villager", "The Tian family say they will open the gate for Cao Cao. The Tians say a lot of things.", "田家说要给曹操开城门。田家的话，多着呢。")],
                 {"3-a3": T("Side story: the gate of Puyang, at night.", "支线：夜里的濮阳城门。")}),
    "Chang'an": _P("city", [{"kind": "building.hall", "id": "camp", "node": "3-b1", "label": T("Li Jue's camp", "李傕营中")}],
                   [_talk("folk.woman", "Two of them fighting over the Emperor, like dogs over a bone.", "两个人争天子，像两条狗抢一根骨头。")],
                   {"3-b1": T("Side story: the Emperor in Li Jue's camp.", "支线：李傕营中的天子。")}),
    "The Yellow River": _P("road", [{"kind": "rock.big", "id": "bank", "node": "3-b2", "label": T("The high bank", "高岸")}],
                           [_talk("folk.hunter", "One boat on this whole stretch of river, and it leaks.", "这一段河上只有一条船，还漏水。")],
                           {"3-b2": T("Side story: the river crossing, at night.", "支线：夜渡黄河。")}),
    "Burned Luoyang": _P("ruins", [{"kind": "building.hall", "id": "court", "node": "3-b3", "label": T("The court among the thorns", "荆棘中的朝堂")}],
                         [_talk("folk.official", "We hold court standing up. There is nothing left to sit on.", "我们站着上朝。连坐的地方都没有了。")],
                         {"3-b3": T("Side story: the court in burned Luoyang.", "支线：焦土洛阳的朝廷。")}),
    "Shouchun": _P("city", [{"kind": "building.hall", "id": "hall", "node": "3-c1", "label": T("Yuan Shu's hall", "袁术府中")},
                            {"kind": "building.tent", "id": "granary", "node": "3-d2", "label": T("The granary tent", "粮帐")}],
                   [_talk("folk.villager", "Yuan Shu eats well. The rest of us eat what's left.", "袁术吃得好。我们吃剩下的。")],
                   {"3-c1": T("Side story: Sun Ce in Yuan Shu's hall.", "支线：袁术府中的孙策。"),
                    "3-d2": T("Side story: the granary officer at the siege of Shouchun.", "支线：寿春城下的管粮官。")}),
    "Shenting Ridge": _P("mountain", [{"kind": "rock.crag", "id": "ridge", "node": "3-c2", "label": T("Shenting Ridge", "神亭岭")}],
                         [_talk("folk.monk", "There is a shrine to the Emperor Guangwu up there. Soldiers come to pray before a fight.", "岭上有光武帝庙。打仗前常有军人来拜。")],
                         {"3-c2": T("Side story: Shenting Ridge.", "支线：神亭岭。")}),
    "Jingxian": _P("camp", [{"kind": "building.tent", "id": "tent", "node": "3-c3", "label": T("Sun Ce's camp", "孙策营寨")}],
                   [_talk("folk.soldier", "He let the prisoner go to fetch his men. We'll never see him again.", "他把俘虏放走去招兵。这人再也不会回来了。")],
                   {"3-c3": T("Side story: Sun Ce's camp at Jingxian.", "支线：泾县孙策营。")}),
    "Wancheng": _P("camp", [{"kind": "building.gate", "id": "gate", "node": "3-d1", "label": T("The camp gate", "寨门")}],
                   [_talk("folk.soldier", "Dian Wei stands at the gate every night. Nobody gets past Dian Wei.", "典韦每夜都守在寨门。谁也过不了典韦。")],
                   {"3-d1": T("Side story: Cao Cao's camp gate at Wancheng.", "支线：宛城曹营寨门。")}, banners="red"),
    "The Road to Xiaopei": _P("road", [{"kind": "rock.big", "id": "road", "node": "3-d3", "label": T("The road to Xiaopei", "小沛道上")}],
                              [_talk("folk.villager", "Lord Cao's relief army came through this morning. Xiahou Dun leads it.", "曹公的援兵今早从这里过去了，是夏侯惇领兵。")],
                              {"3-d3": T("Side story: Xiahou Dun on the road to Xiaopei.", "支线：小沛道上的夏侯惇。")}),
}
