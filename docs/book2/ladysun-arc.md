# Lady Sun's marriage (novel chapters 54–55): design

Written from the Chinese original (第五十四回 吳國太佛寺看新郎 劉皇叔洞房續佳偶, 第五十五回 玄德智激孫夫人 孔明二氣周公瑾),
following `docs/plot-playbook.md`. Every beat happens in the novel unless it is marked **(staging)** or **(invented)**.

**How it was chosen.** The user asked, instead of the chapters after Lü Bu's fall: "are there any books that are
particularly interesting". Plot offered Lady Sun's marriage, Red Cliffs, Guan Yu's thousand-li ride and Lady Xu. The user:
"ok lets do lady suns marriage". It stands on its own (R16) and is registered as the book after White Gate Tower.

**The user's note for this book** (via Integration): emphasize novelty in storytelling, "as in novelty from itself". Don't
reuse the devices the earlier books leaned on: lead handoffs as the main shape, a single headline map mechanic, narrated
interludes, stealth or chase set pieces, multi-board decisions. Mechanics needn't involve go.

## The narrative (Part 0)

**A trap that becomes a marriage.** Zhou Yu baits a trap with Sun Quan's sister: invite the widowed Liu Bei to Wu to marry
her, then hold him until Jingzhou is handed back (「是以夫人為香餌而釣備也」). Zhuge Liang sees it, and sends Liu Bei anyway,
with Zhao Yun and three sealed silk pouches. The trap turns real: Lady Wu, the bride's mother, finds out, rages at her son,
inspects the groom at Sweet Dew Temple, and declares 「真吾婿也」. Then Lady Sun, who keeps a hundred armed maids and a
room hung with blades, chooses her husband over her brother. She plans the escape herself, talks her mother into letting
them go, and on the road faces down four of Wu's generals with nothing but her voice. Zhou Yu loses the bride and the
battle, and his own soldiers' mockery follows him to the boats: 「周郎妙計安天下，陪了夫人又折兵」.

**Why it plays:** it is the closest thing to Diaochan later in the novel. A woman has the initiative at every turn of
the last act, in the text: 「妾當相隨」, 「推稱江邊祭祖，不告而去，若何？」, 「今日之危，我當自解」, 「夫君先行，我與子龍當後」.
Its register is new for us too: it is a comedy, a scheme that keeps backfiring.

## What is new in the telling (against our own books)

| Earlier books leaned on | This book does instead |
|---|---|
| Lead handoffs as the shape (Lü Bu's fall: 8 leads) | **Two leads and one switch.** Zhao Yun, the man who carries the pouches, then Lady Sun from the moment she takes the plan out of the men's hands (「你休瞞我。我已聽知了也」). Liu Bei, the prize everyone schemes over, is never played: he follows. |
| A single headline map mechanic (the flood) | **The three silk pouches as the book's spine.** Sealed orders the player carries from the start, each marked with when it may be opened (「一到南徐，開第一個；住到年終，開第二個；臨到危急無路之時，開第三個」). They cannot be opened early. Each one, opened, *is* the next act's plan. The player never knows the plan before the characters do. |
| Narrated interludes (scrolls between stretches) | **Cutaways to the other side**, played out, not narrated: Zhou Yu and Lu Su laying the trap; Lady Wu beating her chest at Sun Quan; Sun Quan smashing the jade inkstone. The player sees the trap being built while the characters on the screen don't. |
| Stealth (be unseen) | **The loud town.** Pouch one's plan is to be as public as possible: five hundred men in red buy pigs and sheep and tell everyone (「傳說玄德入贅東吳，城中人盡知其事」). The news spreads house to house until it reaches the one person who doesn't know: the bride's mother. |
| The chase (run from pursuers) | **Being seen is her power.** On the road, Lady Sun doesn't run or fight: she raises the carriage curtain and the generals dismount (「捲起車簾，親喝徐盛、丁奉」). Blockers yield when they see her face, not when they don't. |
| Multi-board decisions (three boards in one scene) | **One board per scene, at most,** and several scenes with none. |
| Tragedy (Diaochan, Lü Bu) | **Comedy.** The book ends on the soldiers' chant at Zhou Yu. |
| (nothing like it) | **Two secret prayers at once.** At the temple stone, Liu Bei and Sun Quan each pray aloud for one thing and secretly for another (「卻暗暗祝告曰」). The player sees both secret prayers; neither man does. |

## The new mechanics (asks)

1. **Sealed pouches** (engine; Integration). An item kind, `"sealed"`: carried from the start, listed with when it may be
   opened ("Open on reaching Nanxu", "Open at year's end", "Open when there is no way out"). Tapping it early says so and
   does nothing. A scene step `["open", "pouch1"]` opens it: a card in Zhuge Liang's hand, then the plan. Each opened pouch
   stays, opened, in the bag.
2. **The loud town** (Places + Integration). In Nanxu, telling a townsperson the news (talking to them) marks them; a marked
   townsperson walks to a neighbour and tells them, and red hangings go up on each house that knows. The beat fires when
   the news reaches Lady Wu's palace gate (enough houses told on the way, or one chain that reaches it). The pouch-one
   errand, Liu Bei's visit to Qiao Guolao with lamb and wine, is part of it.
3. **Face them down** (engine; Integration). Blockers on the road with `"yield": true`: when the lead stands still facing
   them within a few cells (her face seen, the curtain up), they stop, dismount and step aside, one by one, with a line each.
   Pushing past without stopping is a catch: back to where the road block started. It is the reverse of the hide-and-wait
   from the Lü Bu prologue: there she had to stay still unseen; here she has to stand still and be seen.
4. **Cutaways** (engine; Integration). A node with `"cutaway": true` plays by itself as soon as the beat before it is
   done, staged in its own place and room with the party off stage, then returns the player to the lead. s1 plays at
   the start of the book.
5. **The carriage** (Graphics + Integration): Lady Sun rides in a pushed carriage (「乘車」, 「叱從人推車直出」). A mount kind
   `"carriage"`, curtain up or down.

## Whom we follow

| Stretch | Lead | Why |
|---|---|---|
| The trap is laid (Chaisang) | — (cutaway) | Zhou Yu and Lu Su; the player watches |
| Jingzhou: the matchmaker, the pouches | **Zhao Yun** | He receives the three pouches 「貼肉收藏」 and carries them to the end |
| Nanxu: pouch one, the loud town | **Zhao Yun** | He opens the first pouch and gives the orders 「一一分付如此如此」 |
| Lady Wu finds out | — (cutaway) | Lady Wu and Sun Quan |
| Sweet Dew Temple | **Zhao Yun** | He finds the axemen in the corridors (「雲於廊下巡視，見房內有刀斧手埋伏」) |
| The wedding night, the east palace | **Zhao Yun** | Outside, all winter, shooting and riding (「終日無事，只去城外射箭走馬」); opens pouch two |
| "Don't lie to me" to the river | **Lady Sun** | From 「你休瞞我。我已聽知了也」 on, every move is hers: the plan, her mother, the road |

## The beats (keys `s1` … `s16`), rebuilt around Zhou Yu's schemes

**Why rebuilt.** After the rework the user asked "did liu bei end up getting jailed? that was the whole premise", and on
Plot's answer: "yeah I think you got messed up by the lady sun thing". The arc is Zhou Yu's trap and how it keeps failing.
The rework had moved the lead to Lady Sun and pushed the trap off screen. Now the spine is **three schemes, three
pouches**, each scheme shown on screen and each pouch's reveal saying which scheme it answers:

| Zhou Yu's scheme | Shown in | Answered by |
|---|---|---|
| The jail: lure him to Nanxu and lock him up (幽囚在獄中) | s1 | Pouch 1 (s3): a wedding the whole city hears of; Lady Wu makes it real (s4–s5) |
| The gilded cage: palaces and pleasures until he forgets Jingzhou (軟困) | s8 | Pouch 2 (s9): the false alarm (s10) |
| The road block: soldiers on the road home | s13 | Pouch 3 (s13): tell Lady Sun the truth; she opens the road (s14–s15) |

Leads follow who acts on the spine: Zhao Yun carries and plays the pouches (s2–s10); Lady Sun leads from "Don't lie to me"
(end of s10), where the novel gives her the initiative, to the end. The wedding night is a short cutaway again. Kept from
the rework: the axemen search, the two face-downs, Liu Bei out of her party until New Year's Day.

| Key | Beat | Lead | Place · room | Board |
|---|---|---|---|---|
| s1 | **The Bait**: Zhou Yu's first scheme, the jail | cutaway | Chaisang · `zy-hall` | — |
| s2 | **Three Silk Pouches**. Ends landing at Nanxu (spot `dock`) | Zhao Yun | Jingzhou · `jz-hall` | — |
| s3 | **The First Pouch**; then the loud town | Zhao Yun | Nanxu, by the dock | — |
| s4 | **Whose Daughter?** `"cutaway": "told:wu-gatekeeper"` | cutaway | Nanxu · `wu-hall` | — |
| (map) | **The axemen** (`axemen_1`–`3`) | Zhao Yun | Sweet Dew Temple | — |
| s5 | **Sweet Dew Temple** (gated; else `s5_wait`) | Zhao Yun | Sweet Dew Temple · `gl-abbot` | Lady Wu |
| s6 | **The Stone**; the horses. Ends: back to Nanxu from Sweet Dew Temple | Zhao Yun | Sweet Dew Temple | Liu Bei |
| s7 | **Blades in the Bridal Room** (seen from outside) | cutaway | Nanxu · `bridal-room` | — |
| s8 | **The Gilded Cage**: Zhou Yu's second scheme | cutaway | Nanxu · `sq-hall` | — |
| s9 | **Year's End**: pouch two | Zhao Yun | Nanxu, the riding ground outside the walls | — |
| s10 | **Don't Lie to Me**: the false alarm; her plan; **the lead passes to Lady Sun** | Zhao Yun → Lady Sun | Nanxu · `east-palace` (through the cage: musicians, gold) | Lady Sun: "Find a way out of Wu." |
| s11 | **New Year's Day** | Lady Sun | Nanxu · `wu-hall` | Lady Sun: "Ask your mother for leave." |
| s12 | **The Jade Inkstone** | cutaway | Nanxu · `sq-hall` | — |
| s13 | **The Road Block**: Zhou Yu's third scheme; pouch three; the truth | Lady Sun | The road to Chaisang | — |
| (map) | **Face-down 1**: Xu Sheng and Ding Feng, ahead | Lady Sun | The road | — |
| s14 | **Are You in Revolt?** | Lady Sun | The road | **boss** |
| (map) | **Face-down 2**: Chen Wu and Pan Zhang, behind | Lady Sun | The road | — |
| s15 | **The Rearguard** | Lady Sun | The road | — |
| s16 | **Liulangpu**: the chant | Lady Sun | Liulangpu | — |

Reworked → rebuilt keys: s1–s6 same; s7 same key, a cutaway again; s8 (gilded cage) and s9 (year's end) are new; s8 → s10;
s9 → s11; s10 → s12; s11 → s13; s12 → s14; s13 → s15; s14 → s16. The `ls-rooms` spot is no longer used.

## Decisions (Plot's recommendations; the user can overrule any of them)
0. **Modern Chinese.** The user: "can you write this books language in modern chinese thats easier to undrestand?" Every Chinese line the player sees or hears (narration, speech, goals, captions, board lines) is written in modern Mandarin, in simplified characters, translated from the original for meaning, not quoted from it. The classical text stays in this design doc only, as the source each line is checked against. The novel's chapter titles and couplets stay as they are, since they are titles.
1. **Span:** chapters 54–55. Lady Sun's later recall to Wu and the river at chapter 61 is another story, not this one.
2. **The bride is introduced by her enemy first.** The player hears Zhou Yu describe her (s1) before meeting her (s7).
3. **Liu Bei's confession** (s11) is the third pouch's plan. From her side, it is the moment she learns what the player
   has known since s1. Nothing is invented: the pouch, his words and her answer are the text.
4. **No go problems in the loud town or the road block**: the town and the face-down are the tasks. Boards stay where a
   person decides (Lady Wu, Liu Bei at the stone, Lady Sun before her mother, Lady Sun on the road).
5. **The road block is the boss**, played as Lady Sun.

## Stills (approved spending; to Graphics)
`zy_pouches` (Zhuge Liang hands Zhao Yun three silk pouches), `nx_red` (Nanxu hung with red, the men in red buying sheep),
`wu_rage` (Lady Wu beating her chest at Sun Quan), `gl_wu` (Lady Wu looks at Liu Bei: 「真吾婿也」), `gl_stone` (two swords,
one stone), `gl_horses` (two riders on the slope above the river), `ls_blades` (the bridal room hung with blades, the maids
with swords), `ls_curtain` (Lady Sun raises the carriage curtain before the generals), `llp_boats` (Zhuge Liang laughing in
the boat), `zy_chant` (Zhou Yu on the shore, the soldiers' chant).
