"""Chinese for every line of the Three Kingdoms story, keyed by the English.

The voice-over reads these (tools/build_tk_voice.py). Lines that come
straight from the novel keep its wording; the rest is plain modern
Mandarin. build_tk.py refuses to build if an English line has no entry
here, so editing the story can't silently drop its voice-over.
"""

ZH = {
    # ---- inside buildings (tk_places.ROOMS) ----
    "“Wine, pork, a bed for the night — we have it all.”": "“酒、肉、过夜的床铺，小店样样都有。”",
    "“They say the governor is raising volunteers. I've half a mind to join.”": "“听说太守在招募义兵，我倒有心去投军。”",
    "“Sit, have some tea. The storyteller starts soon.”": "“坐，喝杯茶。说书的马上就开讲了。”",
    "“Another pot, and another tale of the old days.”": "“再来一壶，再听一段古。”",
    "“This is the county office. State your business.”": "“这里是县衙，有何贵干？”",
    "“Mind the floor — I've only just swept it.”": "“当心脚下，我刚扫过地。”",
    "“It isn't much, but the roof keeps the rain off.”": "“屋子虽简陋，好歹能遮风挡雨。”",
    "“The harvest is in, if the rebels don't take it.”": "“庄稼收了，只盼别被贼人抢去。”",
    "“Orders come at dawn. Keep your weapon close.”": "“军令天亮就到，兵器别离身。”",
    # interior names
    "Inn": "客栈", "Teahouse": "茶馆", "Hall": "厅堂", "House": "民居", "Hut": "茅屋", "Farmhouse": "农舍", "Tent": "营帐",
    # ---- World 1: opening ----
    "臨江仙 · The Immortal by the River": "临江仙",
    "On and on the Yangtze rolls east, its waves washing the heroes away.": "滚滚长江东逝水，浪花淘尽英雄。",
    "Right and wrong, triumph and ruin — turn your head, and all is empty.": "是非成败转头空。",
    "Yet the green hills remain, through how many crimson sunsets.": "青山依旧在，几度夕阳红。",
    "— Yang Shen": "——杨慎",
    "Chapter 1": "第一回",
    "The empire, long divided, must unite; long united, must divide.": "话说天下大势，分久必合，合久必分。",
    "The Han has ruled for four hundred years. Now Emperor Ling trusts only his eunuchs, the Ten Attendants, who sell offices and silence honest men. Omens fill the sky: a serpent coils on the throne, hens turn into cocks, black vapour drifts into the palace.":
        "汉朝传国四百年，到了灵帝，只信宦官。十常侍卖官鬻爵，陷害忠良。天下异象频生：青蛇盘踞御座，母鸡化为公鸡，黑气飞入宫殿。",
    "In Julu, a healer named Zhang Jiao preaches the Way of Great Peace. In the year 184 half a million rise behind him, yellow scarves on their heads, chanting: “The Blue Heaven is dead! The Yellow Heaven shall rise!”":
        "巨鹿人张角，传太平道，施符治病。中平元年，四五十万百姓头裹黄巾，随他造反，齐声高呼：“苍天已死，黄天当立！”",
    "The governor of You Province posts a call for volunteers. The notice reaches Zhuo County…": "幽州太守刘焉出榜招募义兵。榜文传到了涿县……",
    # ---- the notice ----
    "The Notice at Zhuo": "涿县榜文",
    "Liu Bei, twenty-eight, descends from Prince Jing of Zhongshan — yet he sells sandals and weaves mats for a living. His ears reach his shoulders; his arms hang past his knees.":
        "刘备，字玄德，中山靖王之后，年二十八，家贫，以贩屦织席为业。他两耳垂肩，双手过膝。",
    "He reads the notice, and sighs.": "他看了榜文，长叹一声。",
    "A real man should serve his country! What are you sighing for?": "大丈夫不与国家出力，何故长叹？",
    "I am of the Han imperial house. I long to crush these rebels and bring peace — but I lack the strength.": "我本汉室宗亲，有志破贼安民，只恨力不能及，所以长叹。",
    "I've got money and land. Let's raise men together! But first — wine.": "我颇有些钱财，正好招募乡勇，与你同举大事！走，先喝一杯！",
    "At the village inn, a giant pushing a cart strides in: nine feet tall, a beard two feet long, a face like a ripe red date.": "村店里，一条大汉推着车子进来：身长九尺，髯长二尺，面如重枣。",
    "Wine, quickly! I'm off to the city to join the army.": "快斟酒来！我要赶进城去投军。",
    "Then sit with us, friend. We have the same purpose.": "壮士请同坐，我们志向相同。",
    "Guan Yu, of Hedong. I killed a bully who preyed on my village, and I've been on the run five years.": "我姓关，名羽，河东解良人。因本处豪强欺压百姓，被我杀了，逃难江湖已有五六年。",
    # ---- the oath ----
    "The Peach Garden Oath": "桃园结义",
    "Behind my farm is a peach garden in full bloom. Tomorrow, let's swear brotherhood there before Heaven and Earth!": "我庄后有一桃园，花开正盛。明日就在园中祭告天地，我们三人结为兄弟！",
    "With a black ox and a white horse for sacrifice, the three burn incense and bow.": "次日，三人备下乌牛白马，在桃园中焚香再拜。",
    "Though we were not born on the same day of the same month of the same year…": "不求同年同月同日生……",
    "…we wish to die on the same day of the same month of the same year.": "……只愿同年同月同日死。",
    "Heaven and Earth, witness it! If we betray this oath, may Heaven and men strike us down!": "皇天后土，实鉴此心！背义忘恩，天人共戮！",
    "Liu Bei becomes eldest brother, Guan Yu second, Zhang Fei youngest. Three hundred village braves join them, and they drink in the garden until they can drink no more.":
        "刘备为兄，关羽次之，张飞为弟。乡中勇士三百余人前来投奔，众人在桃园中痛饮一醉。",
    "Their road forks here. The long road passes through the rebels' heartland; the mountain trail is shorter, and steeper.": "前路在此分岔：大路穿过黄巾腹地；山路更近，却也更险。",
    # ---- Daxing Mountain ----
    "First Blood at Daxing Mountain": "大兴山初战",
    "Traitors to the realm! Why not surrender now?": "反国逆贼，何不早降！",
    "Deng Mao — bring me his head!": "邓茂，去取他首级！",
    "Zhang Fei's spear takes Deng Mao through the heart.": "张飞挺丈八蛇矛，一枪刺中邓茂心窝。",
    "Cheng Yuanzhi charges — and Guan Yu's great blade cuts him in two. The rebels throw down their spears and run.": "程远志拍马来战，被关羽一刀挥为两段。贼众纷纷倒戈而逃。",
    # ---- Qingzhou ----
    "The Ambush at Qingzhou": "青州伏兵",
    "Rebels besiege Qingzhou. The relief force is outnumbered and falls back thirty li.": "黄巾围困青州。救兵寡不敌众，退兵三十里下寨。",
    "They are many and we are few. Only surprise will win this. Yunchang, hide your men left of the ridge. Yide, to the right. When the gongs sound, strike.":
        "贼众我寡，必出奇兵，方可取胜。云长引兵伏于山左，翼德伏于山右，鸣金为号，一齐杀出。",
    "Next morning Liu Bei attacks — then turns and flees. The rebels chase him over the ridge.": "次日，刘备引军鼓噪而进，交战片刻便退。贼众乘势追赶，越过山岭。",
    "Gongs crash. Guan Yu and Zhang Fei burst from both flanks as Liu Bei wheels around. Caught from three sides, the rebels break, and the siege of Qingzhou is lifted.":
        "金声大作，关张两军左右齐出，刘备回军复杀。三路夹攻，贼众大溃，青州之围遂解。",
    # ---- the cage cart ----
    "The Cage Cart": "槛车",
    "Xuande! I had Zhang Jiao surrounded. But the court's envoy demanded a bribe, and I refused him. Now I go to the capital in chains, and Dong Zhuo takes my army.":
        "玄德！我围张角，眼看就要破贼。朝廷派来的使者向我索贿，我不肯给。如今我被押解进京，兵马交给了董卓。",
    "I'll cut down these guards and set him free!": "我去杀了这些押送的军士，救出卢中郎！",
    "The court will judge him fairly. Don't be rash, Yide!": "朝廷自有公论，翼德不可造次！",
    # ---- Dong Zhuo ----
    "“What Office Do You Hold?”": "现居何职",
    "Heading home, the brothers hear a roar behind the hills: Han troops in rout, and behind them banners reading GENERAL OF HEAVEN.": "三人北归途中，忽闻山后喊声大震：汉军大败，后面黄巾漫山遍野，旗上大书“天公将军”。",
    "That is Zhang Jiao! Charge!": "这是张角！快杀过去！",
    "The three ride into his flank and drive him back fifty li. They escort the defeated commander, Dong Zhuo, safely to his camp.": "三人飞马冲杀，张角大乱，败走五十余里。他们救下董卓，护送回寨。",
    "And what office do you hold?": "你们现居何职？",
    "None, my lord. We are commoners.": "白身。",
    "Dong Zhuo turns his back without a word of thanks.": "董卓甚是轻视，连谢也不谢。",
    "We bled to save that wretch and he treats us like dirt! I'll kill him!": "我们亲赴血战救了这厮，他却如此无礼！不杀他，难消我气！",
    "He is an officer of the court! You cannot.": "他是朝廷命官，岂可擅杀！",
    "That night they leave to join the general Zhu Jun instead.": "三人连夜引军，投奔朱儁去了。",
    # ---- black wind ----
    "Black Wind, Paper Soldiers": "黑风纸兵",
    "Zhu Jun's army faces Zhang Bao, the General of Earth. Zhang Fei spears his officer Gao Sheng from the saddle — and then Zhang Bao lets down his hair, raises his sword, and chants.":
        "朱儁进讨地公将军张宝。张飞出马，刺高升于马下。张宝随即披发仗剑，作起妖法。",
    "Wind howls and thunder rolls. Out of a black cloud pours a numberless host of horsemen. Liu Bei's army breaks and flees.": "只见风雷大作，一股黑气从天而降，黑气中似有无数人马杀来。刘备军中大乱，败阵而归。",
    "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them. The spell will break.": "他用的是妖术。明日宰杀猪羊狗，取血伏于山头，等贼赶来，从高坡上泼下，其法可解。",
    # ---- boss ----
    "The General of Earth Falls": "地公将军之死",
    "Again Zhang Bao calls the wind; again Liu Bei flees, and the rebels chase him to the hill.": "次日，张宝又作妖法，刘备拨马便走，张宝驱兵赶来。",
    "A signal gun — and blood and filth rain down from the ridge.": "将过山头，号炮一响，秽物齐泼。",
    "Paper men and straw horses flutter to the ground. The wind dies. Liu Bei's arrow strikes Zhang Bao in the arm, and he flees into Yangcheng.": "但见空中纸人草马纷纷坠地，风雷顿息。刘备一箭射中张宝左臂，张宝逃入阳城。",
    "Wind and thunder answer to me! Your little band will be swept away like dust.": "风雷听我号令！你们这点人马，一阵风便扫个干净！",
    # ---- side: the Way of Great Peace ----
    "The Way of Great Peace · I: The Old Man in the Cave": "太平道·一：洞中老人",
    "Meanwhile — or rather, years before — a failed scholar named Zhang Jiao went into the hills to gather herbs.": "早在多年以前，有个不第秀才名叫张角，入山采药。",
    "There he met an old man with green eyes and a child's face, leaning on a staff, who led him into a cave.": "他遇见一位老人，碧眼童颜，手执藜杖，唤他进了一个山洞。",
    "These three books are the Essentials of Great Peace. Take them, spread Heaven's teaching, and save the world. But harbour one rebellious thought, and you will be punished.":
        "此三卷天书，名为《太平要术》。你得了它，当代天宣化，普救世人。若萌异心，必获恶报。",
    "Master, what is your name?": "敢问老仙尊姓大名？",
    "I am the Old Immortal of Southern Florescence.": "吾乃南华老仙也。",
    "And he vanished in a breath of wind.": "说完，化作一阵清风而去。",
    "The Way of Great Peace · II: The Blue Heaven Is Dead": "太平道·二：苍天已死",
    "Zhang Jiao studied the books day and night until he could summon wind and rain. When plague swept the land, he went about giving out charmed water, and the sick recovered.": "张角日夜苦学，能呼风唤雨。瘟疫流行之时，他散施符水，为人治病。",
    "They called him the Great and Virtuous Teacher. His disciples numbered in the hundreds of thousands, organised in thirty-six divisions.": "人们称他为大贤良师。他的徒众日多，立三十六方。",
    "The Blue Heaven is dead! The Yellow Heaven shall rise! In the year jiazi, great fortune for all under Heaven!": "苍天已死，黄天当立；岁在甲子，天下大吉！",
    "Across eight provinces, families chalked the word jiazi on their doors.": "八州百姓，家家在大门上用白土写上“甲子”二字。",
    "The Way of Great Peace · III: Betrayed": "太平道·三：事泄",
    "The hardest thing in the world to win is the people's hearts — and now they are ours. To let this moment pass would be a crime.": "至难得者，民心也。今民心已顺，若不乘势取天下，诚为可惜。",
    "He bribed a eunuch in the palace to open the gates from within. But his disciple Tang Zhou carried the plan straight to the court. In Luoyang, his agent Ma Yuanyi was beheaded.":
        "他暗中结交宫中宦官作为内应。不料弟子唐周赴朝廷告变，党羽马元义在洛阳被斩。",
    "Then we rise now. I am the General of Heaven. Zhang Bao, you are General of Earth. Zhang Liang, General of Man.": "那就即刻起兵！我为天公将军，张宝为地公将军，张梁为人公将军！",
    "Half a million rose in yellow scarves, and the imperial armies scattered before them like leaves.": "四五十万百姓裹黄巾相从，官军望风而靡。",
    # ---- side: Cao Cao ----
    "The Hero of Chaos · I: The Feigned Stroke": "奸雄·一：诈中风",
    "Far to the south, in Qiao, a boy named Cao Cao loved hunting, music and mischief — and his uncle kept telling his father so.": "沛国谯郡有个少年，名叫曹操，好游猎，喜歌舞。他的叔父屡次向他父亲告状。",
    "So one day, seeing his uncle coming, Cao Cao dropped to the ground, twitching.": "一天，曹操见叔父走来，便诈倒在地，装作中风的样子。",
    "Brother! Your son has had a stroke!": "兄长！你儿子中风了！",
    "A stroke? I've never had one in my life. Uncle just dislikes me, so he tells tales about me.": "儿子自来没有这病。只因叔父不喜欢我，所以冤枉我罢了。",
    "From then on, whatever the uncle reported, Cao Cao's father never believed a word.": "从此以后，叔父再说曹操的不是，父亲一概不听。",
    "The Hero of Chaos · II: A Villain in Chaos": "奸雄·二：乱世奸雄",
    "Xu Shao of Runan was famous for judging men. Cao Cao went to see him.": "汝南许劭以善于识人闻名，曹操前去拜见。",
    "What kind of man am I?": "我是怎样的人？",
    "Xu Shao would not answer. Cao Cao asked again.": "许劭不答。曹操又问。",
    "In an age of order, an able minister. In an age of chaos — a cunning villain.": "子治世之能臣，乱世之奸雄也。",
    "Cao Cao laughed with delight. Later, as a captain in Luoyang, he hung coloured staves at the city gates and flogged anyone caught breaking curfew — even the uncle of the eunuch Jian Shuo. After that, nobody dared.":
        "曹操听了大喜。后来他任洛阳北都尉，在城门设五色棒，犯禁者不避豪强，连宦官蹇硕的叔父也照打不误。从此再无人敢犯。",
    "The Hero of Chaos · III: Red Banners at Changshe": "奸雄·三：长社红旗",
    "At Changshe, the Yellow Turbans pitched their camp in tall grass.": "长社一带，黄巾依草结营。",
    "They camp in grass. Fire will take them. Every man, bring a bundle of straw.": "贼依草结营，当用火攻。每人束草一把，暗地埋伏！",
    "That night a great wind rose. The camp went up in flames; the rebels fled without saddles or armour.": "当夜大风忽起，一齐纵火，火焰张天。贼众马不及鞍，人不及甲，四散奔逃。",
    "At dawn, as Zhang Bao and Zhang Liang ran, a column under red banners barred the road.": "天明时分，张梁、张宝夺路而走，忽见一彪军马，尽打红旗，截住去路。",
    "Cao Cao, Commandant of Cavalry. You go no further.": "骑都尉曹操在此，休想过去！",
    "Ten thousand heads were taken. The two brothers barely escaped with their lives.": "曹操斩首万余级，张梁、张宝死战得脱。",
    # ---- side: shortcuts ----
    "Horses from the North": "北来骏马",
    "The brothers had men, but no horses. Then two travelling merchants, Zhang Shiping and Su Shuang, came down the trail driving a herd.": "兄弟三人有了人马，却苦无马匹。正在发愁，中山大商张世平、苏双赶着一群马来到庄上。",
    "Bandits have closed the road north. If you mean to crush them, take fifty horses — and five hundred taels of silver, and a thousand jin of steel for your weapons.":
        "贼寇阻断了北去的路。诸位既要讨贼，我们愿送良马五十匹，金银五百两，镔铁一千斤，以资器用。",
    "Liu Bei had twin swords forged. Guan Yu's blade was the Green Dragon Crescent, eighty-two jin, called Cold Beauty. Zhang Fei's was an eighteen-foot serpent spear of steel.":
        "刘备打造双股剑；关羽造青龙偃月刀，又名冷艳锯，重八十二斤；张飞造丈八点钢矛。",
    "A Bribe Refused": "拒贿",
    "At Guangzong, Lu Zhi had Zhang Jiao penned in, though the rebel's sorcery kept him from the final blow. Then the court's envoy arrived.": "卢植在广宗围住张角，只因张角会妖术，一时未能取胜。这时，朝廷的使者到了。",
    "Your victories are splendid, general. And where is the gift for the Emperor's envoy?": "将军连战连捷，可喜可贺。那么，孝敬天使的礼物在哪里？",
    "My army lacks grain. Where would I find money to flatter an envoy?": "军粮尚缺，安有余钱奉承天使？",
    "Zuo Feng rode back to Luoyang and reported that Lu Zhi skulked behind his walls and would not fight.": "左丰怀恨，回京奏报：卢植高垒不战，惰慢军心。",
    # ---- closing ----
    "The Yellow Turbans Fall": "黄巾覆灭",
    "But the eunuchs gave rewards only to those who paid. For all his battles, Liu Bei was made a mere county sheriff, at Anxi.": "可是宦官只赏送礼之人。刘备大小三十余战，只得了个安喜县尉。",
    "You claim imperial blood and invent your merits! The court is purging frauds like you.": "你诈称皇亲，虚报功绩！朝廷正要沙汰你这等滥官！",
    "Tormentor of the people! Do you know who I am?": "害民贼！认得我么？",
    "Lord Xuande! Save my life!": "玄德公，救我性命！",
    "Chapter 2": "第二回",
    "Emperor Ling died. In the capital, his brother-in-law, General He Jin, resolved to destroy the eunuchs at last — and sent for the warlords of the provinces to march on Luoyang and force the Empress's hand.":
        "灵帝驾崩。大将军何进决意诛杀宦官，发檄文召四方诸侯领兵进京。",
    "“A mistake,” warned his secretary Chen Lin. “You hand the spear to others, point first.”": "主簿陈琳劝道：“不可！这是倒持干戈，授人以柄。”",
    "A man beside them clapped and laughed. “This is as easy as turning over a hand. Why so much talk?” It was Cao Cao.": "旁边一人鼓掌大笑：“此事易如反掌，何必多议！”此人正是曹操。",
    "What did Cao Cao propose? Hear the next chapter.": "不知曹操说出甚话来，且听下文分解。",
    # ---- World 1: transitions (ch. 1-2) ----
    "Liu Bei and his five hundred report to the governor, Liu Yan. Learning that Liu Bei is of the same imperial house, Liu Yan is delighted and takes him as a nephew.": "刘备引兵五百来见太守刘焉。玄德说起宗派，刘焉大喜，遂认玄德为侄。",
    "Not many days later, the Yellow Turban general Cheng Yuanzhi marches on Zhuo with fifty thousand men. Liu Bei meets him with five hundred.": "不数日，黄巾贼将程远志统兵五万来犯涿郡。刘焉令邹靖引玄德等三人，统兵五百，前去破敌。",
    "A letter comes from Gong Jing, governor of Qingzhou: the Yellow Turbans have his city surrounded, and it is about to fall. He begs for help.": "接得青州太守龚景牒文，言黄巾贼围城将陷，乞赐救援。",
    "I will go and rescue it.": "备愿往救之。",
    "Qingzhou is relieved. Liu Bei hears that his old teacher Lu Zhi is fighting Zhang Jiao himself at Guangzong, and goes to help him.": "青州之围已解。玄德闻中郎将卢植与贼首张角战于广宗，备昔曾师事卢植，欲往助之。",
    "Lu Zhi is glad to see him, and keeps him at his tent. Then he sends him with a thousand more men to Yingchuan, to learn how Huangfu Song and Zhu Jun are doing against Zhang Jiao's brothers.": "卢植大喜，留在帐前听调，又添一千官军，令玄德往颍川打探皇甫嵩、朱儁与张角二弟交战的消息。",
    "By the time Liu Bei arrives, the rebels have been routed by fire. Huangfu Song tells him the brothers will run to Zhang Jiao at Guangzong, and he turns back through the night.": "玄德赶到颍川，贼已败散。皇甫嵩曰：“张梁、张宝势穷力乏，必投广宗去依张角。玄德可即星夜往助。”玄德领命，遂引兵复回。",
    "Halfway there, they meet soldiers guarding a prison cart.": "到得半路，只见一簇军马，护送一辆槛车。",
    "The cart rolls away toward Luoyang.": "槛车往洛阳去了。",
    "Lu Zhi is under arrest, and another man will lead his army. We have no one left to turn to here. Let us go back to Zhuo.": "卢中郎已被逮，别人领兵，我等去无所依，不如且回涿郡。",
    "Liu Bei agrees, and they march north. Again the road divides.": "玄德从其言，遂引军北行。前路又一次分岔。",
    "Zhu Jun receives them warmly. The two armies join, and Zhu Jun makes Liu Bei his vanguard against Zhang Bao.": "朱儁待之甚厚，合兵一处，进讨张宝，令玄德为其先锋，与贼对敌。",
    # ---- World 1 plot pass (from docs/world1-script-draft.md) ----
    "Zhuo County. A crowd gathers at a notice on the wall: the governor is raising volunteers against the Yellow Turbans.": "涿县城中，众人围看墙上榜文：幽州太守刘焉出榜招募义兵，共破黄巾。",
    "Under an old tree by the road, two white-haired men sit over a weiqi board, as if no army were coming.": "路旁老树下，两位白发老人对坐弈棋，仿佛大军压境与他们无关。",
    "Read this first.": "先看这一局。",
    "To catch the bandits, first catch their king.": "擒贼先擒王。",
    "That night, at the edge of the camp, the two old men are at their board again.": "当夜营边，两位老人又在对弈。",
    "Another.": "再看这一局。",
    "Don't hold the strong point. Give ground, and make them follow.": "莫守坚城。且退一步，引他来追。",
    "If I don't kill him, I'll have to take his orders, and I won't. Stay here if you like, brothers. I'm going elsewhere.": "若不杀这厮，反要在他部下听令，其实不甘！二兄要便住在此，我自投别处去也！",
    "We three are bound in life and death. How could we part? Then we will all go elsewhere.": "我三人义同生死，岂可相离？不若都投别处去便了。",
    "If so, that eases my anger a little.": "若如此，稍解吾恨。",
    "At a roadside shrine the two old men sit over their board, as if nothing were happening.": "路旁小庙前，两位老人依旧对坐弈棋，若无其事。",
    "Read this, before you run.": "先看此局，再跑不迟。",
    "Pigs, sheep, dogs. Blood.": "猪、羊、狗。血。",
    "Guan Yu and Zhang Fei each take a thousand men up the ridge behind the hill, with the blood and filth.": "关、张二人各引军一千，伏于山后高冈之上，备下猪羊狗血并秽物。",
    "Zhu Jun's army surrounds Yangcheng. Zhang Bao holds the walls and will not come out. Behind him stands his own officer, Yan Zheng.": "朱儁引兵围住阳城。张宝紧守城池，不敢出战。他身后，立着部将严政。",
    "Yan Zheng stabs him, and carries his head out to surrender.": "严政刺杀张宝，献首投降。",
    "By the time Huangfu Song took over, Zhang Jiao was already dead. Huangfu Song beat Zhang Liang in seven battles and broke open the Great Teacher's coffin. The rebellion was over.": "皇甫嵩到时，张角已死。皇甫嵩与张梁交战，连胜七阵，斩张梁，发张角之棺，戮尸枭首。黄巾之乱就此平定。",
    "At Wancheng, Liu Bei gave Zhu Jun some advice: “Surround them completely and every man fights to the death. Leave them one way out, and they will run.” It worked. There too, a young officer named Sun Jian was first over the wall: a name to remember.": "在宛城，刘备向朱儁进言：“今四面围如铁桶，贼必死战；不若撤去东南，独攻西北，贼必弃城而走。”果然奏效。也是在宛城，一位名叫孙坚的年轻将领首先登城，这个名字，日后还要记住。",
    "At Anxi, Liu Bei governs for a month and wrongs no one. The three eat at one table and sleep in one bed. When Liu Bei sits among crowds, Guan Yu and Zhang Fei stand at his side all day without tiring.": "玄德到安喜县，署县事一月，与民秋毫无犯。与关、张食则同桌，寝则同床。如玄德在稠人广坐，关、张侍立，终日不倦。",
    "Less than four months after he took office, an edict orders officers with military merit to be culled. Liu Bei fears he is among them. An inspector arrives.": "到县未及四月，朝廷降诏，凡有军功为长吏者当沙汰。玄德疑在遣中。适督邮行部至县。",
    "Liu Bei goes out of the city to greet him. The inspector stays on his horse and answers with a small flick of his whip. Guan Yu and Zhang Fei are furious.": "玄德出郭迎接，见督邮施礼。督邮坐于马上，惟微以鞭指回答。关、张二公俱怒。",
    "At the hostel the inspector sits facing south; Liu Bei stands below the steps.": "及到馆驿，督邮南面高坐，玄德侍立阶下。",
    "What is your origin, Sheriff Liu?": "刘县尉是何出身？",
    "I descend from Prince Jing of Zhongshan. I fought the Yellow Turbans from Zhuo County in over thirty battles.": "备乃中山靖王之后；自涿郡剿戮黄巾，大小三十余战，颇有微功，因得除今职。",
    "Liu Bei asks his clerks what to do. The inspector only wants a bribe, they say. But Liu Bei has taken nothing from the people, and has nothing to give. The inspector seizes the clerks, and each time Liu Bei comes to plead, he is turned away at the gate.": "玄德与县吏商议。吏曰：督邮作威，无非要贿赂耳。玄德与民秋毫无犯，那得财物与他？督邮便提县吏去；玄德几番自往求免，俱被门役阻住。",
    "Zhang Fei, a few cups of gloomy wine in, rides past the hostel and finds fifty or sixty old villagers weeping at the gate.": "张飞饮了数杯闷酒，乘马从馆驿前过，见五六十个老人，皆在门前痛哭。",
    "The inspector is forcing the clerks to accuse Liu Bei, they tell him, and the gatekeepers beat them away when they come to plead for him.": "老人说：督邮逼勒县吏，欲害刘公；我等皆来苦告，不得放入，反遭把门人赶打！",
    "He drags the inspector out by the hair, to the hitching post before the county office, and ties him there.": "张飞揪住督邮头发，扯出馆驿，直到县前马桩上缚住。",
    "Zhang Fei breaks ten or more willow switches across his legs.": "攀下柳条，去督邮两腿上着力鞭打，一连打折柳条十数枝。",
    "Liu Bei, a gentle man at heart, orders Zhang Fei to stop.": "玄德终是仁慈的人，急喝张飞住手。",
    "Brother, you won great merit and were given only a sheriff's post, and now an inspector insults you. A phoenix does not roost among thorns. Let us kill him, give up the office, and make greater plans elsewhere.": "兄长建许多大功，仅得县尉，今反被督邮侮辱。吾思枳棘丛中，非栖鸾凤之所；不如杀督邮，弃官归乡，别图远大之计。",
    "For what you have done to the people you deserve to die. I spare your life. I return my seal of office, and I am gone.": "据汝害民，本当杀却；今姑饶汝命。吾缴还印绶，从此去矣。",
    "He hangs the seal around the inspector's neck.": "玄德取印绶，挂于督邮之颈。",
    # ---- World 1 places: townsfolk, challengers and story spots (tools/tk_places.py) ----
    "“Off to sell your sandals in town, Xuande? Mind the road.”": "“玄德，又进城卖草鞋？路上小心。”",
    "“That mulberry looks like a carriage canopy! Mother says someone from this house will ride under one.”": "“那棵桑树长得像车盖！娘说，这家将来要出贵人。”",
    "“The Yellow Turbans are burning villages in the south. Strange times.”": "“黄巾贼在南边烧村子，真是乱世啊。”",
    "Your neighbour has scratched a weiqi board into the dirt under the mulberry. “Before you go to town, Xuande, one game.”": "邻居在桑树下的泥地上画了一张棋盘。“玄德，进城之前，先下一局。”",
    "“Ha! Sharper than your sandals. Go on, then.”": "“哈！你的棋比你的草鞋还精。去吧。”",
    "“Bring me back a story from town.”": "“从城里带个新鲜事回来给我听。”",
    "The governor of You Province calls for volunteers against the Yellow Turbans. At the bottom, a weiqi problem: “Let any man who would lead volunteers show he can read a battle.”": "幽州太守招募义兵，讨伐黄巾。榜文末尾附着一道围棋题：“欲率义兵者，先请看清此局。”",
    "An old storyteller taps his clapper-board. “Sit, sit! Tales of the Yellow Heaven…”": "一位说书老人敲了敲醒木。“坐，坐！且听黄天的故事……”",
    "“They say the Yellow Turbans wear scarves the colour of the earth.”": "“听说黄巾贼头上裹的巾，是土黄色的。”",
    "“Liu Bei? The sandal-seller? Kind man. Ears down to his shoulders, you know.”": "“刘备？那个卖草鞋的？是个好人。耳朵都垂到肩膀了。”",
    "“Zhang Fei sells wine and pork. Loud as thunder, but his heart is good.”": "“张飞卖酒杀猪，嗓门像打雷，心肠却好。”",
    "“The governor wants volunteers. Read the notice.”": "“太守在招义兵，你去看看榜文吧。”",
    "An old man sits over a weiqi board in the square. “You have the look of a thinker. Sit, play me one.”": "广场上，一位老人守着一张棋盘。“看你像个有心思的人。坐，陪我下一局。”",
    "“Ha! Quick eyes. The governor could use a man like you.”": "“哈！好眼力。太守正需要你这样的人。”",
    "“Come back when you've grown sharper.”": "“等你棋艺再长进些，再来找我。”",
    "“Wine's on the house if you can solve the one my regulars can't.”": "“我这儿的老主顾都解不出这道题。你要是解得出，酒钱全免。”",
    "“Well I never. Drink up, then!”": "“真没想到！那就喝吧！”",
    "“Still the only one who's cracked it.”": "“到现在还只有你一个人解出来。”",
    "“Weiqi's like farming: you claim the land, then you have to hold it. Try this.”": "“下棋跟种地一样：先占地，还得守得住。试试这道。”",
    "“Held it, and well.”": "“守住了，守得好。”",
    "“Fine soil this year.”": "“今年的地真肥。”",
    "A clerk from the county office looks up. “The magistrate set this one. Nobody here has solved it.”": "县衙的一位书吏抬起头。“这道题是县令出的，这里还没人解得出。”",
    "“Remarkable. I'll tell the magistrate a sandal-seller did it.”": "“了不起。我要告诉县令，是个卖草鞋的解出来的。”",
    "“The magistrate still doesn't believe me.”": "“县令到现在还不信我。”",
    "Under the great peach tree two old men sit over a weiqi board, one in grey, one in red.": "大桃树下，两位老人对坐下棋，一位穿灰衣，一位穿红衣。",
    "Three young men, come to swear before Heaven? Heaven is listening. But first, show us how you read the stones.": "三位年轻人，要来对天盟誓吗？上天在听着。不过，先让我们看看你们怎么看这盘棋。",
    "Good. The road ahead forks, and fortune favours the one who reads it.": "好。前路分岔，福气只眷顾看得清路的人。",
    "When the brothers look up, the two old men are gone. Only the board remains, and a drift of petals.": "兄弟三人抬起头时，两位老人已不见踪影，只剩下一盘棋和满地落花。",
    "The old man in grey studies the board and says nothing.": "灰衣老人凝视着棋盘，一言不发。",
    "“Patience. Heaven is in no hurry.”": "别急。上天从不着急。",
    "“An old man lives up in the hills. Gathers herbs. Some say he's an immortal.”": "“山里住着一位采药的老人，有人说他是神仙。”",
    "“The Way of Great Peace heals the sick. Drink the charm-water, brother.”": "“太平道能治百病。兄弟，喝一碗符水吧。”",
    "“Half the county wears yellow now.”": "“现在半个县的人都裹上黄巾了。”",
    "“Fine northern horses, but the roads are full of bandits.”": "“北方的好马是有，可路上全是强盗。”",
    "“The rebels have us surrounded. If only someone could draw them off…”": "“贼兵把我们围住了。要是有人能把他们引开就好了……”",
    "“The new commandant of the north gate beats curfew-breakers to death. Even the eunuchs' uncles.”": "“北门新来的都尉，犯夜禁的一律打死，连宦官的叔父也不放过。”",
    "“The general is in his tent. He doesn't like visitors without rank.”": "“将军在帐里。他不喜欢没官职的人来见他。”",
    "“Wind and thunder answer to me!”": "风雷听我号令！",

    # ---- World 1 places, objectives and story spots (map factory, tk-world.js) ----
    "Lousang Village": "楼桑村", "Zhuo County": "涿县", "The Peach Garden": "桃园", "Road to Julu": "巨鹿道上",
    "Julu": "巨鹿", "Yellow Hills": "黄冈", "Horse Trail": "马道", "Daxing Mountain": "大兴山", "Qingzhou": "青州",
    "Guangzong Road": "广宗道上", "Qiao": "谯郡", "Luoyang Gates": "洛阳城门", "Changshe": "长社",
    "Envoy's Road": "使者路上", "Dong Zhuo's Camp": "董卓营", "Hills of Black Wind": "黑风岭", "Yangcheng": "阳城",
    "Read the notice in the town square.": "去城中广场看榜文。",
    "Swear brotherhood under the great peach tree.": "在大桃树下结为兄弟。",
    "Side story: find the old man in the hills.": "支线：去山中寻找那位老人。",
    "Side story: hear Zhang Jiao's sermon in Julu.": "支线：到巨鹿听张角传道。",
    "Side story: the betrayal in the Yellow Hills.": "支线：黄冈的背叛。",
    "Shortcut: the horse dealers on the northern trail.": "捷径：北方马道上的马商。",
    "Meet the Yellow Turbans at Daxing Mountain.": "在大兴山迎战黄巾军。",
    "Lift the siege of Qingzhou.": "解青州之围。",
    "Go to Guangzong, where Lu Zhi besieges Zhang Jiao.": "前往广宗，卢植正在那里围攻张角。",
    "Side story: the boyhood of Cao Cao.": "支线：曹操的少年时代。",
    "Side story: Cao Cao at the gates of Luoyang.": "支线：洛阳城门的曹操。",
    "Side story: red banners at Changshe.": "支线：长社红旗。",
    "Shortcut: the envoy on the road.": "捷径：路上的使者。",
    "Rescue Dong Zhuo, then report at his tent.": "救出董卓，再到他帐前复命。",
    "Break Zhang Bao's sorcery in the hills.": "在山中破张宝的妖术。",
    "Defeat Zhang Bao at Yangcheng.": "在阳城击败张宝。",
    "A Yellow Turban tent": "黄巾军的帐篷", "A hermit's shelter": "隐士的草庐", "A prisoner's cart": "囚车",
    "Dong Zhuo's tent": "董卓的大帐", "Liu Bei's home": "刘备的家", "The Cao family house": "曹家宅院",
    "The Han camp": "汉军营地", "The Yellow Turban line": "黄巾军阵", "The besieged city": "被围的城",
    "The county office": "县衙", "The envoy's rest": "使者歇脚处", "The great mulberry tree": "大桑树",
    "The great peach tree": "大桃树", "The horse dealers' camp": "马商的营地", "The north gate of Luoyang": "洛阳北门",
    "The notice board": "榜文", "The teahouse": "茶馆", "The village inn": "村店", "Where Zhang Jiao preaches": "张角传道之处",
    "Zhang Bao's sorcery": "张宝的妖术", "Zhang Bao's stronghold": "张宝的城寨", "Zhang Fei's farm": "张飞的庄园",

}

# Pronunciation fixes for the voice only (the text shown keeps the real
# characters). The speech model guesses some characters with two readings
# wrong; each fix swaps in a homophone with the right reading.
PRON = {
    "长社": "常社", "髯长": "髯常",          # 长 cháng, not zhǎng
    "早降": "早祥",                          # 降 xiáng (surrender), not jiàng
    "缴还": "缴环",                          # 还 huán, not hái
    "刘备为兄": "刘备维兄", "张飞为弟": "张飞维弟", "织席为业": "织席维业", "结为兄弟": "结维兄弟",
    "化为公鸡": "化维公鸡", "挥为两段": "挥维两段", "鸣金为号": "鸣金维号", "诚为可惜": "诚维可惜",
    "称他为": "称他维", "我为天公": "我维天公", "张宝为地公": "张宝维地公", "张梁为人公": "张梁维人公",  # 为 wéi
    "将军": "酱军", "贼将": "贼酱",          # 将 jiàng (general), not jiāng
    "只得了": "只德了", "你得了": "你德了", "得脱": "德脱", "难得者": "难德者",  # 得 dé
    "诈倒": "诈岛", "倒持": "到持",          # 倒 dǎo (fall), dào (upside down)
    "在地": "在弟", "讨地公": "讨弟公",      # 地 dì, not the particle de
}


def spoken(text):
    for a, b in PRON.items():
        text = text.replace(a, b)
    return text

# Who reads what. The narrator (a woman, Kokoro zf_027) reads narration and
# the storyteller's scrolls; every speaking character has his own voice,
# matched by gender and by measured pitch and pace (deep and fast for Zhang
# Fei, slow for Lu Zhi, light for the eunuch Zuo Feng). Recasting a
# character regenerates only his lines.
NARRATOR = "zf_027"
CAST = {
    "liubei": "zm_053", "guanyu": "zm_034", "zhangfei": "zm_029", "caocao": "zm_013",
    "dongzhuo": "zm_098", "zhangbao": "zm_041", "zhangjiao": "zm_068", "luzhi": "zm_081",
    "zhujun": "zm_033", "huangfusong": "zm_055", "chengyuanzhi": "zm_011", "inspector": "zm_096",
    "xushao": "zm_091", "uncle": "zm_014", "zuofeng": "zm_063", "merchant": "zm_025", "immortal": "zm_080",
    "stargrey": "zm_082", "starred": "zm_089",  # the two old men at the weiqi board (the Star Lords)
}
# Townsfolk speak in a voice for their kind (tools/tk_places.py "kind").
FOLK_VOICE = {
    "folk.villager": "zm_052", "folk.woman": "zf_022", "folk.elder": "zm_100", "folk.child": "zf_002",
    "folk.monk": "zm_069", "folk.noble": "zm_057", "folk.soldier": "zm_045", "folk.rebel": "zm_016",
    "folk.hunter": "zm_030", "folk.official": "zm_064",
}
