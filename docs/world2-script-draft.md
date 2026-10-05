# World 2 (Book 2): Hulao Pass, chapters 3-9: draft

**Spine: ambition has a price.** Chapters 3-9 of the novel, read in full (the Chinese text, Gutenberg #23950). This is the scene list and the lines, in the style of `docs/world1-script-draft.md`: sparse, quoted from the novel where it has the line, `[new]` where I invented one. It is a draft: nothing is in `tools/tk_story.py` yet. Staging steps (`prop`, `army`, `pose`, `fx`...) follow after approval, as they did in Book 1.

Chinese below is the novel's, simplified. Where I trimmed it, the English is the sense.

## The shape of the Book

Liu Bei is only present for a small part of chapters 3-9: the coalition and Hulao (ch5) and the break-up that follows. The rest of the chapters belong to Dong Zhuo, Cao Cao, Sun Jian, Lü Bu and Wang Yun. As in Book 1, the Liu Bei line carries the main story and the other angles are **side stories**, told from the road, optional but where the weight is.

- **Main line (Liu Bei):** 8 scenes. Pingyuan → the coalition camp → Sishui Gate → Hulao Pass (boss) → the ruins of Luoyang → back to Pingyuan.
- **Four side threads** (each a short road branching off the main one): **The Capital** (ch3-4), **Cao Cao's Knife** (ch4-6), **The Seal** (ch5-7), **The Chain** (ch8-9). 18 scenes in all.
- **26 scenes** in all, a little more than Book 1's 24. Ten of them end in a death on screen. Dong Zhuo, Ding Yuan, Wang Yun and Sun Jian are the ones the player watches fall.

**What the Book is about.** Nearly everyone in these chapters reaches for something and pays for it. Lü Bu sells his father for a horse. Cao Cao kills the family that fed him. Sun Jian hides the seal and swears to die by arrows if he did. Wang Yun uses a girl to bring the tyrant down, and is destroyed by the men who survive. The three brothers are the exception: they take no prize at Hulao and are seated last at the table, and they go home. That is the spine, and it needs no line to say it. Echoes from Book 1: "What office do you hold?" returns as Yuan Shao's "I honour you for your blood, not your rank"; the cold laughter of the brothers; Guan Yu, who in Book 1 was a man on the run, now cuts down the enemy's champion with the wine still warm.

## Opening scroll (before the first scene)

```python
["scroll", "Chapter 3", [
    "The Yellow Turbans were broken, and the court was not saved. The eunuchs fell to He Jin's soldiers in a night of fire, and the man who was supposed to save the throne, General Dong Zhuo, rode into the capital with twenty thousand of the western army.",
    "He took the child Emperor in the road. Before the year was out he had put another boy on the throne, and the first one was dead.",
    "In the east, a young captain named Cao Cao drew a knife. Hear what happened.",
]],
```
(Same register as Book 1's; all invented summary, from ch3-4.)

## The nodes

| Key | Place | Role | Scene | Thread |
|---|---|---|---|---|
| m1 | Pingyuan | main | `pingyuan` | main |
| m2 | The coalition camp | main | `alliance` | main |
| m3 | Sishui Gate | main | `sishui` | main |
| m3b | Sishui Gate (the wine) | main | `wine` | main |
| m4a | Hulao Pass, below the gate | main | `hulao1` | main |
| m4b | Roadside shrine | main | `shrine2` | main |
| boss | Hulao Pass | boss | `hulao` (the boss scene) | main |
| m5 | Luoyang, in ruins | main | `ruins` | main |
| a1-a5 | Beimang Hill, Wenming Garden, Lü Bu's camp, the camp at night, Yong'an Palace | side | `fireflies`, `wenming`, `redhare`, `dingyuan`, `poison` | The Capital |
| b1-b4 | Wang Yun's house, Zhongmou, Lü Boshe's farm, Xingyang | side | `dagger`, `zhongmou`, `lvboshe`, `xingyang` | Cao Cao's Knife |
| c1-c3 | Sishui at night, Luoyang's well, Xianshan | side | `zumao`, `seal`, `xianshan` | The Seal |
| d1-d6 | Wang Yun's garden, his hall, the Fengyi Pavilion, Beiye Gate, the market, the gate tower | side | `garden`, `feasts`, `pavilion`, `fall`, `mourner`, `tower` | The Chain |

(Eight main scenes including the boss, and 18 side scenes, 26 in all.)

---

# The main line

### 1. `pingyuan` (main, outdoor): the road to the coalition

Liu Bei has been made magistrate of Pingyuan by Gongsun Zan. Gongsun Zan's army marches past on its way to join the lords, and Liu Bei comes out to the road to meet it. Zhang Fei and Guan Yu stand behind him. Gongsun Zan points at them.

- Gongsun Zan: "Are these the two who broke the Yellow Turbans with you?" / 「乃同破黄巾者乎？」
- Liu Bei: "It was all their doing." / 「皆此二人之力。」
- Staging: Liu Bei on the road at the head, the two brothers a step behind, Gongsun Zan on his white horse with a column of riders; Zhang Fei, arms folded. A few of Liu Bei's own men (militia) behind. No Star Lords.
- Problem: a short one; Pingyuan's gate or the roadside (the "decision": the road to the lords).
- Novel: ch5.

### 2. `alliance` (main, outdoor): seated last

The lords have gathered at Yuan Shao's camp, with Cao Cao presiding over the feast. Yuan Shao is named head of the alliance. Gongsun Zan presents Liu Bei, who is placed at the bottom of the table. The brothers stand behind him and "laugh coldly" (the novel's words).

- Yuan Shao: "I do not honour your rank. I honour you for being of the imperial house." / 「吾非敬汝名爵，吾敬汝是帝室之胄耳。」
- Liu Bei bows and sits in the lowest seat. Guan Yu and Zhang Fei stand behind him, expressionless.
- Staging: a long table with ranks of lords at their places, Yuan Shao in the middle, Cao Cao at the side with a cup; Liu Bei seated at the foot with the two brothers standing behind. A banner reading **盟** (alliance). (Graphics: a big tent, `table`, `winejars`, seven or eight lord stand-ins as `f_noble`/`f_official`.)
- Echo of Book 1: the brothers are again ranked low, and again do not show it.
- Problem: Cao Cao's toast, or the "seating" decision. No Star Lords.
- Novel: ch5.

### 3. `sishui` (main, outdoor): the gate nobody can take

Sun Jian's army has been broken at Sishui Gate by Hua Xiong. The lords gather in the camp and Hua Xiong's men carry Sun Jian's red cap on a pole to the camp, daring them. Yu She goes out and is cut down in three rounds. Pan Feng goes out with an axe and is cut down. The lords go pale.

- Staging: the pole with the red cap (a `redbanner` or a new `cap`); two riders go out the gate and come back riderless horses (`pose fall`); the lords turn to Yuan Shao. Hua Xiong himself on a horse in front of the gate, small.
- Yuan Shao: "A pity my generals Yan Liang and Wen Chou are not here." / 「可惜吾上将颜良、文丑未至！」 (He says it at the end of the scene: the lord with no one to send.)
- Problem: here: "the roll of the gate": the first of the Book's boards. No Star Lords.
- Novel: ch5.

### 4. `wine` (main, outdoor): the warm cup

Guan Yu steps out from behind Liu Bei and volunteers. Yuan Shu shouts him down ("a mere bowman"). Cao Cao pours a cup of hot wine for him. Guan Yu sets it down and rides out. The gong and drums roar outside the gate. When he returns he throws Hua Xiong's head on the ground, and the wine is still warm.

- Guan Yu: "Let me go and bring back Hua Xiong's head." / 「小将愿往斩华雄头，献于帐下。」
- Yuan Shu: "We great lords hold back, and a magistrate's bowman dares to boast? Throw him out of the tent." / 「俺大臣尚自谦让，量一县令手下小卒，安敢在此耀武扬威！都与赶出帐去！」 (Zhang Fei shouts to storm the gate at that moment.)
- Cao Cao: "A man who wins is rewarded. Who cares about rank?" / 「得功者赏，何计贵贱乎？」
- Guan Yu: "Keep the wine. I will be back." / 「酒且斟下，某去便来。」
- (The cup, the head, the steam.) The novel says only: 「其酒尚温」, the wine was still warm.
- Staging: Cao Cao with the wine on a table; Guan Yu mounts and rides out (`run`, off the map); a long wait with the drums and shouts; he returns, throws the head (a `pose` and a prop); a close on the cup, with steam (`fx sparkle`). In the evening Cao Cao quietly sends meat and wine to the three brothers (novel: 「曹操暗使人赍牛酒，犒劳三人」), which we play as a closing beat: three cups at a small fire.
- Problem: before the ride: Cao Cao's table (a board about reading the gate); a **shrine of the Star Lords is not here**: the quiet scene.
- Novel: ch5. This is the Book's first emotional peak.

### 5. `hulao1` (main, outdoor): the eight lords at Hulao

Dong Zhuo has fortified Hulao Pass, 50 li from Luoyang, with Lü Bu in front of it. Eight lords go out one after another and are broken: Wang Kuang's champion Fang Yue falls to a single thrust; Mu Shun falls; Wu Anguo's wrist is cut off. Gongsun Zan fights Lü Bu, flees, and Lü Bu on Red Hare is about to run him through when a voice cries out.

- Zhang Fei: "Three-surnamed slave, do not run! Zhang Fei of Yan is here!" / 「三姓家奴休走！燕人张飞在此！」
- Staging: Lü Bu's halberd and the tall red horse (a new `redhare` kind, or the generator's `horse` with a red coat; Graphics); lords' men falling (`pose fall` in groups); Gongsun Zan on a white horse running; Zhang Fei spearing in from the side.
- This is the first try: the lords break. It is the "failure" that lights the shrine.
- Problem: none; this scene has **no board** (it is a defeat scene, as Black Wind's was): the lords' failure.
- Novel: ch5.

### 6. `shrine2` (main, outdoor): the roadside shrine

The shrine at the camp, dark until now, glows after the lords' defeat. The Star Lords are at the board. Their hint is short and has no object to fetch: the player carries it out on the field.

- Starred (before the board): "One cannot match him. Not one." **[new]** / 「一人不能敌他。一人不行。」
- Stargrey: "Then who?" **[new]**: (the problem opens here)
- After the board is solved, the shrine settles: the hint log says: "One, then two, then three." **[new]** / 「一个，两个，三个。」
- Mechanic: the **formation**: the player places the three brothers around Lü Bu: Zhang Fei first (he fights fifty rounds), then Guan Yu from the side, then Liu Bei with his two swords. Three spots (marks), any order the player likes; the cutscene plays them in the novel's order regardless.
- Novel: the placing is the game; the three-against-one is the novel's.

### 7. `hulao` (boss): three against one

Lü Bu challenges again. The three brothers fight him in a T: Zhang Fei in front, Guan Yu joining at the side, Liu Bei coming in from the flank. The lords stand and watch. Lü Bu cannot guard against all three, thrusts at Liu Bei and misses, and wheels his horse and rides for the gate.

- Boss card: **Lü Bu, "the Flying General"** (the plan's Michael Redmond problem). He taunts first: "Four men or forty. None of you will leave this field." **[new]** / 「四个人也好，四十个也好，没有一个能离开这里。」 The Star Lords give no hint. The player solves the problem.
- Staging: the T formation (`army` of three, `pose strike`), the lords' armies lined up on the hill (`army`), Red Hare's rearing, Lü Bu's wheeling away with the halberd trailing, then the brothers pursuing to the gate under rocks and arrows (`fx flash`, `camera shake`).
- The novel: ch5: the best set-piece of the Book and the title of the chapter.
- After: `victory` is skipped; the brothers are praised but the camp's mood is thin, because Yuan Shu has withheld Sun Jian's grain and the coalition is about to fall apart.

### 8. `ruins` (main, outdoor): the burned capital

Dong Zhuo has fled to Chang'an with the Emperor, burning Luoyang behind him and digging up the imperial tombs. The lords ride in. Sun Jian puts out the fires; Cao Cao begs Yuan Shao to chase the tyrant ("one battle will settle the empire"), but the lords will not move. Cao Cao calls them "boys not worth planning with" and leaves. Gongsun Zan tells Liu Bei: "Yuan Shao can do nothing. Let us go home."

- Liu Bei stands in the burned court. A line of narration: "For two hundred li there was not a dog or a chicken." / 「二三百里，并无鸡犬人烟。」
- Cao Cao: "This is the hour Heaven gives. One battle settles it. Why do you hesitate?" / 「此天亡之时也，一战而天下定矣。诸侯何疑而不进？」
- Cao Cao, leaving: "Boys. Not worth planning with." / 「竖子不足与谋！」
- Gongsun Zan: "Yuan Shao is useless. He will change. Let us go back." / 「袁绍无能为也，久必有变。吾等且归。」
- Staging: ash-grey light (`light`), fire `fx`, tall columns, the party standing in a gate hall, a long camera drift (`camera zoom`). The coalition breaking up, shown with banners going away (`run` groups off the map).
- Liu Bei returns to Pingyuan: Gongsun Zan has him made chancellor. A closing scroll (below).
- Problem: here: Liu Bei decides to go home.
- Star Lords: none.

### Closing scroll

```python
["scroll", "Chapter 9", [
    "Dong Zhuo's army was gone and his tyranny was over, but the men who had killed him did not have the strength to rule. Li Jue, Guo Si, Zhang Ji and Fan Chou, his four captains, turned on Chang'an with a hundred thousand men from the west.",
    "Lü Bu fled to Yuan Shu. Wang Yun, who had made it all, refused to flee, and jumped from the gate tower.",
    "And in the east, the three brothers went home to Pingyuan. What happened to the Emperor? Hear the next chapter.",
]],
```

---

# Side thread A: The Capital (ch3-4)

Told on the road: a tavern storyteller in Luoyang, as in Book 1. The child Emperor and the first murders. All five are optional.

### A1. `fireflies` (side, outdoor): the boy Emperor

He Jin is dead, the eunuchs have fled the burning palace with the Emperor and his brother, and Zhang Rang throws himself into the river. The two boys lie in the reeds in the dark, afraid to make a sound. Fireflies rise and lead them.

- Prince of Chenliu (nine years old): "Heaven is helping us, brother." / 「此天助我兄弟也！」
- Staging: two small figures (`f_child`) in tall grass at night (`light night`); points of light moving (`fx sparkle`, or a new `fireflies`); the Prince leads and the Emperor follows, hand in hand.
- Problem: a quiet board by the river: "which way?" No Star Lords (the novel's own omen).
- Novel: ch3.

### A2. `wenming` (side, indoor): "Do not do it!"

Dong Zhuo, in command of the city, calls the officials to a feast at Wenming Garden and announces he will depose the Emperor. Ding Yuan, Governor of Jingzhou, pushes back the table and objects. Behind him stands Lü Bu, halberd in hand, glaring. Li Ru, seeing this, ends the feast.

- Ding Yuan: "The Emperor is the late Emperor's own heir and has done no wrong. Why do you speak of deposing him? Do you mean to usurp?" / 「天子乃先帝嫡子，初无过失，何得妄议废立？汝欲为篡逆耶？」
- Staging: a long table, a hall of officials standing, Dong Zhuo seated at the head with a drawn sword on the table; Ding Yuan, and behind him Lü Bu, tall, armoured, a long halberd (the first time the player sees him). Li Ru at Dong Zhuo's elbow.
- Problem: here: the question is whether to speak. No Star Lords.
- Novel: ch3.

### A3. `redhare` (side, outdoor): the horse, the gold, the jade belt (optional delivery)

After Lü Bu routs him in the field, Dong Zhuo admires Lü Bu. Li Su, Lü Bu's countryman, offers to win him. Dong Zhuo gives him Red Hare, a thousand taels of gold, dozens of pearls and a jade belt. Li Su rides to Lü Bu's camp.

- Li Su: "A horse that goes a thousand li a day: Red Hare. I bring it to you, brother." / 「有良马一匹，日行千里，渡水登山，如履平地，名曰『赤兔』：特献与贤弟，以助虎威。」
- Li Su: "A good bird chooses its tree, a good minister chooses his lord. If you see it too late, you will regret it." / 「良禽择木而栖，贤臣择主而佐。见机不早，悔之晚矣。」
- Lü Bu: "I regret that I never met my master." / 「恨不逢其主耳。」
- Mechanic: the **delivery** (optional): the player carries the horse and the gold from Dong Zhuo's camp to Lü Bu's, as Li Su's follower, and the twist is the carry is the harm. The outcome is fixed: it arrives and Lü Bu is bought.
- Staging: the horse (the red coat), a chest of gold and a jade belt as props (`chest`, `gift`), Li Su's walk across the camp to Lü Bu.
- Novel: ch3.

### A4. `dingyuan` (side, indoor): the night tent

Lü Bu agrees to come over. That night he goes into Ding Yuan's tent, where the governor sits reading by a candle.

- Ding Yuan: "My son, what brings you here?" / 「吾儿来有何事故？」
- Lü Bu: "I am a grown man. Why should I be your son?" / 「吾堂堂丈夫，安肯为汝子乎！」
- (He cuts off his head.) Lü Bu: "Ding Yuan was not kind. I have killed him. Follow me, or leave." / 「丁原不仁，吾已杀之。肯从吾者在此，不从者自去！」
- Dong Zhuo, the next day: "Today I have you, as parched seedlings have rain." / 「卓今得将军，如旱苗之得甘雨也。」 Lü Bu kneels: "Father."
- Staging: a small tent room (`tent`), a candle (`fx fire`), Ding Yuan seated and calm, Lü Bu entering; the stroke (`pose strike`, `pose fall`); the head on a pole; Lü Bu kneeling to Dong Zhuo.
- No problem on the death itself: a **board-less** scene.
- Novel: ch3. First on-screen death of the Book.

### A5. `poison` (side, indoor): the cup of long life

After the deposition, Dong Zhuo's man Li Ru comes to the Emperor in the Yong'an Palace with a cup of wine, "a gift for the spring". The Dowager says: "If it is long-life wine, you drink first." Li Ru has three things: the wine, a knife and a white silk. The Consort Tang kneels and offers to drink in his place.

- Dowager He: "If this is wine for long life, you drink first." / 「既云寿酒，汝可先饮。」
- Consort Tang: "Let me drink for the Emperor. Spare his mother." / 「妾身代帝饮酒，愿公存母子性命。」
- Li Ru: "Who are you, to die in a prince's place?" / 「汝何人，可代王死？」
- The Emperor sings; the first line is enough: "The sky and sun and moon turn over." / 「天地易兮日月翻」
- Staging: three people in a small room on an upper floor (`hall` room), Li Ru and ten guards, a tray with the three things; the cup is poured; the screen goes dark (`mood dark`) before the end, and we hear the voices. **Open question for the user:** show the deaths, or leave the deed offscreen as in the "gifted cup" tradition? I'd recommend leaving it just short: a child is killed.
- Problem: none; a **board-less** scene. No Star Lords.
- Novel: ch4.

---

# Side thread B: Cao Cao's Knife (ch4-6)

### B1. `dagger` (side, indoor): "Will weeping kill Dong Zhuo?"

Wang Yun gives a birthday dinner for the officials and weeps in front of them for the Emperor. Cao Cao laughs. Next day, he goes to Dong Zhuo's hall with the seven-star knife under his robe. Dong Zhuo, tired, lies down with his face turned to the wall. Cao Cao draws the knife; Dong Zhuo's eye catches his reflection in the mirror; Cao Cao, quick, kneels and offers the knife as a gift. He takes a horse and runs.

- Cao Cao, laughing, at Wang Yun's table: "A whole court of ministers crying from night to morning, from morning to night: can that kill Dong Zhuo?" / 「满朝公卿，夜哭到明，明哭到夜，还能哭死董卓否？」
- Dong Zhuo, afterwards: "What are you doing?" Cao Cao (kneeling): "I have a precious knife, and I offer it to you, my lord." / 「操有宝刀一口，献上恩相。」
- Staging: first the dinner (low table, lanterns, tearful officials, Cao Cao laughing). Then Dong Zhuo's inner chamber: a couch, Dong Zhuo's back, Lü Bu out of the room; the knife; the mirror (a prop `mirror`, bronze); the kneel; the gift; Cao Cao on a borrowed horse leaving through the east gate.
- Problem: the moment before he draws the knife (a board: "Now?").
- Novel: ch4.

### B2. `zhongmou` (side, indoor): the magistrate

Cao Cao is caught at the Zhongmou pass and brought before the magistrate, Chen Gong, who recognizes him. That night Chen Gong brings him out alone.

- Chen Gong: "I heard the Chancellor treated you well. Why do this to yourself?" / 「我闻丞相待汝不薄，何故自取其祸？」
- Cao Cao: "What do swallows know of the swan's will?" / 「燕雀安知鸿鹄志哉！」
- Chen Gong unties him, bows: "You are truly loyal to the empire." / 「公真天下忠义之士也！」 and leaves his post to follow.
- Staging: a magistrate's back room, a candle, the rope cut (`pose`), two men riding out at night.
- Problem: here: Chen Gong's decision.
- Novel: ch4.

### B3. `lvboshe` (side, outdoor): "Rather I betray the world"

At the farm of Lü Boshe, his father's sworn brother, Cao Cao and Chen Gong are welcomed and fed. Hearing a knife being sharpened behind the house, Cao Cao overhears "tie him up and kill him" and rushes in with his sword. Eight people die. In the kitchen they find a pig tied for the table. They ride off in horror and meet Lü Boshe coming back with wine. Cao Cao kills him too.

- Overheard: "Tie him up and kill him: how about that?" / 「缚而杀之，何如？」 (about the pig)
- Chen Gong: "Mengde, you are too suspicious. You have killed good people." / 「孟德心多，误杀好人矣！」
- Cao Cao, after killing Lü Boshe: "If he went home and saw what I did, he would not let it go." / 「伯奢到家，见杀死多人，安肯干休？」
- Chen Gong: "To kill a man knowing he is innocent: that is the greatest wrong." / 「知而故杀，大不义也！」
- Cao Cao: "I would rather betray the world than let the world betray me." / 「宁教我负天下人，休教天下人负我。」 Chen Gong says nothing.
- Staging: the farm (`hut`, `table`, an animal pen with a tied pig), a wine flask; the house door, the killing (offscreen or at a distance); the road, Lü Boshe on a donkey with two wine jars, the sword; two riders on the road; that night, an inn: Chen Gong with a half-drawn sword, then he sheathes it, and leaves at dawn. **Open question:** show the killing at the door or only the donkey scene? I'd show the donkey scene, which is the line.
- Problem: here, after the farm and before the road: "What did you hear?" The Star Lords are not here.
- Novel: ch4. This is the Book's moral centre.

### B4. `xingyang` (side, outdoor): the horse

Cao Cao chases Dong Zhuo alone after the alliance does nothing, and is ambushed at Xingyang by Xu Rong. Shot in the shoulder, his horse killed, captured by two soldiers. Cao Hong kills the guards, lifts him onto his own horse and goes on foot.

- Cao Hong: "My lord, get up! I will go on foot." / 「公急上马！洪愿步行。」
- Cao Hong: "The world can do without Hong. It cannot do without you." / 「天下可无洪，不可无公。」
- Cao Cao: "If I live again, it is by your strength." / 「吾若再生，汝之力也。」
- Staging: a mountain pass at dusk, ambushers, Cao Cao on his horse; the arrow, the horse falls; a lone figure (Cao Hong) running through, stripping off his armour to wade the river; Cao Cao mounted, Cao Hong on foot beside him. Xiahou Dun arrives at the end and kills Xu Rong.
- Problem: a board at the river crossing.
- Novel: ch6.

---

# Side thread C: The Seal (ch5-7)

### C1. `zumao` (side, outdoor): the red cap

Sun Jian's night camp at Sishui is hit by Hua Xiong. Sun Jian's bow breaks. His officer Zu Mao says: "Lord, your red cap is the mark they chase. Give it to me." They swap, and Zu Mao draws the pursuers off. He hangs the cap on a post and when Hua Xiong's men surround it, Zu Mao charges out and is cut down.

- Zu Mao: "Lord, your red headcloth is what they see. Give it to me, and I will draw them away." / 「主公头上赤帻射目，为贼所识。可脱帻与我戴之。」
- Staging: night (`light night`), a scattered camp, Sun Jian's horse, Hua Xiong's cavalry; the swap of caps (`give`); the post and the cap (a new `cap` prop); Zu Mao's last charge: `pose strike`, `pose fall`.
- Problem: a board at the post.
- Novel: ch5.

### C2. `seal` (side, outdoor): the well

When the lords enter Luoyang, Sun Jian puts out the fires and camps in the ruins of Jianzhang Hall. That night he looks at the stars, the Emperor's star dim. A soldier points to five-coloured light in a well. They pull up a woman's body, with a brocade bag at her neck. Inside, a gold-locked box; inside, the Imperial Seal. Cheng Pu tells him the seal's story. Sun Jian decides to keep it.

- Cheng Pu: "This is the seal handed down by the emperors: the sky's mandate, a long life and lasting prosperity." / 「此传国玺也。…『受命于天，既寿永昌』。」
- Cheng Pu: "Heaven gives it to you. Keep it, and go home."
- Sun Jian, later to Yuan Shao, who demands it: "If I have this seal and hide it, may I not die a natural death, but die by knife and arrow." / 「吾若果得此宝，私自藏匿，异日不得善终，死于刀箭之下！」
- Staging: night in the ruins (`light night`, fires `fx fire`), a well (`well` prop, or use `gate`), a torch party, the body drawn up (`pose` lying), the bag and box (`chest`), the seal (`seal`, which exists), Sun Jian holding it up in torchlight. The oath is the second beat: Sun Jian before Yuan Shao's table (`table`, lords' stand-ins), hand raised.
- Problem: at the well: "What do you do with it?" **[new]**
- Novel: ch6.

### C3. `xianshan` (side, outdoor): arrows and stones

Years later Sun Jian attacks Liu Biao at Xiangyang, to avenge Liu Biao's blocking his road. A gale snaps his banner pole at the siege (Han Dang: "an ill omen, withdraw"). He does not. One night Lü Gong, a Jingzhou officer, leads him by decoy up Mount Xian, into a ridge ambush of stones and arrows. He dies there, thirty-seven years old, at a ridge named Xian.

- Han Dang: "That is not a good omen. We should withdraw for now." / 「此非吉兆，可暂班师。」
- Sun Jian: "I have won every battle. Taking Xiangyang is a matter of a day. Shall I stop for a broken pole?" / 「吾屡战屡胜，取襄阳只在旦夕；岂可因风折旗竿，遽尔罢兵！」
- (He rides up the hill alone.) 
- Staging: the siege camp in a gale (`light storm`), the pole breaking (`pose fall` on a prop), Sun Jian leaving with thirty riders; the ridge, then stones and arrows falling (`fx flash` many, `camera shake`); he falls; at dawn his son Sun Ce takes the body (a short coda): **Sun Ce is seventeen**.
- Problem: here: the omen (a board: "do you go?"). The Star Lords are **not** here: a player in the audience cannot stop him.
- Novel: ch6-7. **Open question:** the player cannot save him: the board decides only the order of the beats. Is that right? (Game Design: "the great deaths".)

---

# Side thread D: The Chain (ch8-9)

### D1. `garden` (side, outdoor): the night in the peony garden

Wang Yun, the Minister, walks in his garden at night, weeping. He hears a sigh from the peony pavilion: Diaochan, a singing girl he brought up as his own. She says she has long wished to repay him. He kneels and bows to her.

- Wang Yun: "You must pity the people of the Han empire." / 「汝可怜大汉天下生灵！」
- Diaochan: "Command me, and I will not shrink from death." / 「但有使令，万死不辞。」
- Wang Yun: "The people hang by their heels, the court is a pile of eggs. Only you can help." / 「百姓有倒悬之危，君臣有累卵之急，非汝不能救也。」
- Staging: night, peonies (`petals`), a pavilion, the girl in a pale robe on her knees, Wang Yun's grey hair bowing to the ground (`pose bow`).
- Problem: here: "Will she?" No Star Lords.
- Novel: ch8. **Emotional peak** of the thread.

### D2. `feasts` (side, indoor): two feasts

Wang Yun feasts Lü Bu and introduces Diaochan; Lü Bu is dazzled. A few days later Wang Yun feasts Dong Zhuo and has Diaochan dance behind a curtain, then gives her to him. Wang Yun then tells Lü Bu that Dong Zhuo took her.

- Diaochan to Lü Bu: she offers wine, eyes meeting: no words.
- Diaochan, to Dong Zhuo: "My humble self is sixteen." / 「贱妾年方二八。」 Dong Zhuo: "A real immortal!" / 「真神仙中人也！」
- Wang Yun: "I will present this girl to you, Chancellor: is that acceptable?" / 「允欲将此女献上太师，未审肯容纳否？」
- Staging: two rooms, one table: the golden crown (a prop `crown`) given to Lü Bu; the curtain dance (`pose dance`, a new pose or `cheer`); Dong Zhuo's carriage taking her away (`cagecart`-like `cart`, a felt-covered cart); Lü Bu's face (`emote anger`).
- Problem: one board between the two feasts.
- Novel: ch8.

### D3. `pavilion` (side, outdoor): Fengyi Pavilion

Lü Bu sees Diaochan in Dong Zhuo's garden. She weeps, says she would drown herself in the lotus pond. Dong Zhuo comes back early, catches them, seizes Lü Bu's halberd and hurls it. Lü Bu flees. Dong Zhuo, running, collides with Li Ru and falls.

- Diaochan: "I am not Wang Yun's real daughter, but he treated me as one. When I saw you, he promised me to you… I have been defiled by the old thief, and I would rather die." / 「我虽非王司徒亲女，然待之如己出。…」
- Diaochan, to Lü Bu: "I heard your name as thunder in my ears, and thought you the one man in the world, and now you are ruled by another." / 「妾在深闺，闻将军之名，如雷灌耳，以为当世一人而已；谁想反受他人之制乎！」
- Staging: a lotus pond (`water`), a pavilion (`hall`), Diaochan's veil; Lü Bu's halberd leaning on the rail; Dong Zhuo's shout; the halberd thrown (`pose strike` + a prop moving); the fat man falling.
- Problem: here: a quiet board ("will you?"). No Star Lords.
- Novel: ch8. The Book's title scene in the novel.

### D4. `fall` (side, outdoor): the carriage

Wang Yun persuades Lü Bu to act: Li Su is sent to Meiwu with a forged edict: "the Emperor will give you the throne". Dong Zhuo, overjoyed, says goodbye to his ninety-year-old mother and Diaochan. The omens: a wheel breaks, the horse snaps its rein, a gale, a priest with a banner of two mouths. Li Su explains each. At the Beiye Gate the guards stop his men. Lü Bu strikes him in the throat.

- Dong Zhuo, to his mother: "I will take the throne, Mother, and you will be Empress Dowager." / 「儿将往受汉禅，母亲早晚为太后也！」 She: "My flesh trembles and my heart shakes. It is not a good sign." / 「吾近日肉颤心惊，恐非吉兆。」
- Dong Zhuo, to Li Su, of the broken wheel: "What does it mean?" Li Su: "That you take the throne: old for new, a jade carriage for a gold saddle." / 「乃太师应受汉禅，弃旧换新，将乘玉辇金鞍之兆也。」
- At the Beiye Gate, struck: "Where is my son Fengxian?" Lü Bu, from behind the carriage: "I bring an edict to kill the traitor." / 「吾儿奉先何在？」「有诏讨贼！」
- Staging: Meiwu (the fortress), the long carriage procession (`army` of guards, `prop` carriage), the wheel breaking (`pose fall`); the gate; the carriage in the middle; Li Su's hand on the sword; the thrust; the head. After: narration: soldiers put a wick in his navel and the fat burned for days; the crowd. Diaochan: "already knowing everything, pretending joy" (the novel's words), seen in the carriage.
- Problem: here, before the thrust: the player is Wang Yun's side. Star Lords: none.
- Novel: ch9. **On-screen death.** The Book's climax.

### D5. `mourner` (side, outdoor): the one who wept

Dong Zhuo's body lies in the market. Cai Yong, the scholar Dong Zhuo had honoured, throws himself on it and weeps. Wang Yun has him dragged to the hall: "Why do you mourn the traitor?"

- Wang Yun: "The tyrant is dead; all the people rejoice. You are a minister of Han and you weep for him?" / 「董卓逆贼，今日伏诛，国之大幸。汝为汉臣，乃不为国庆，反为贼哭，何也？」
- Cai Yong: "I am not talented, but I know what the empire means. I wept because he was good to me. Let me be marked and have my feet cut off, so that I may finish the history." / 「…只因一时知遇之感，不觉为之一哭，自知罪大。愿公见原：倘得黥首刖足，使续成汉史…」 Wang Yun refuses: he has him strangled in prison.
- Staging: the market at dusk (`gate`, a crowd `f_villager`), the body (`pose` lying), the scholar (Cai Yong, a stand-in `f_elder`), the hall; officials pleading; Wang Yun's face (`emote ...`); the cord.
- Problem: a board: the sentence. 
- Novel: ch9. The price of being right.

### D6. `tower` (side, outdoor): Wang Yun on the gate

Li Jue, Guo Si, Zhang Ji and Fan Chou raise a hundred thousand men in the west and take Chang'an in eight days. Lü Bu, at the Qingsuo Gate, begs Wang Yun to come away. Wang Yun refuses. Lü Bu rides out with a hundred horsemen, abandoning his family. The rebels take the palace. Wang Yun goes up on the gate tower beside the Emperor and jumps down.

- Wang Yun, to Lü Bu: "If the gods of the realm let me save the state, that is my wish; if not, I give my body. I will not run in danger." / 「若蒙社稷之灵，得安国家，吾之愿也；若不获已，则允奉身以死。临难苟免，吾不为也。」
- Wang Yun, to Li Jue and Guo Si: "Wang Yun is here!" / 「王允在此！」
- Staging: a city wall in flames (`fx fire`), Lü Bu on a horse at the gate with a hundred riders (`army`), Wang Yun in court robes shaking his head, the gate tower (`gate`), the Emperor standing small beside him (`f_child`), the leap (`pose fall` from a prop height or `vanish` + `fx dust`), Li Jue and Guo Si's men.
- Problem: here, before the leap: the last board of the Book.
- Novel: ch9. The Book's last on-screen death.

---

## Mechanics and shrines for Book 2 (defaults)

| | |
|---|---|
| Required mechanic | **Formation** at Hulao (the three brothers placed round Lü Bu), preceded by a failure: the eight lords' defeat lights the shrine. I would rather not repeat Black Wind's gathering. |
| Optional | **Delivery**: the horse and the gold to Lü Bu (`redhare`), carried as Li Su's follower; the twist is that the carry is the harm. |
| Star Lords in person | One: the roadside shrine at Hulao (after the lords' defeat). |
| A sign of them | none |
| Silent (no board hint) | everything else, especially the deaths (A4, A5, C1, C3, D4, D5, D6) |
| Boss | Lü Bu at Hulao, a hard problem with no hint, a taunt first |
| Relics | The Imperial Seal as the Book's trophy for the player? **Open question for Game Design:** a "relic that does something". In the novel the seal causes Sun Jian's death. |

## What is left out

Dong Zhuo's own atrocities (the massacre at Yangcheng, the boiling of prisoners, Zhang Wen's execution) are told in one narration line each; Yuan Shao's seizure of Jizhou and the Panhe war with Gongsun Zan (ch7), with Zhao Yun's entrance (ch7: he saves Gongsun Zan; Liu Bei is not there); Sun Jian's first war against Liu Biao; and the long roll of the coalition lords' names.

## Open questions for the user

1. **The deaths of children and the old** (A5, the Emperor and the Consort; D6, Wang Yun): on screen, or just short of the deed? My recommendation: A5 stops just short; the rest are on screen.
2. **The Seal** as a relic the player holds, even though in the novel it ruins Sun Jian. Is it kept as the Book's trophy, or left in the story only?
3. **Six scenes** (A1, A2, B1-B3, D1-D3) carry the Book's best material in the side threads. Are they right as side stories, or should some of them be on the main road?
4. **Scale.** 26 scenes, a little more than Book 1. Cut any of the four threads? I would cut D5 (the mourner) first.

I have not written any steps. With your approval I'd (a) add the Book to `tools/tk_story.py` (nodes, edges, scenes, Chinese), (b) ask Graphics for the map (places listed above), the Hulao shrine, new props (`redhare`, `mirror`, `well`, `cap`, `crown`), new cast (Lü Bu, Dong Zhuo, Wang Yun, Diaochan, Li Ru, Li Su, Hua Xiong, Yuan Shao, Yuan Shu, Sun Jian, Chen Gong, Cao Hong, Zu Mao, Cheng Pu, Cai Yong, Ding Yuan), and (c) send each still's "must show" line.
