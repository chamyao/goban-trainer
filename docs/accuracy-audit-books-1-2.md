# Accuracy audit: Books 1 and 2 against the novel

Source: Chinese text of Romance of the Three Kingdoms, Gutenberg #23950. The two reports below were drafted by research helpers reading chapters 1-2 (Book 1) and 3-9 (Book 2) against `tools/tk_story.py`, `tools/tk_story_w2.py`, `tools/tk_places.py` and `tools/tk_story_zh.py`. The historian re-checked against the text the WRONG items marked "verified" in the summary at the end. Counts are approximate. This is advice for the plot writer: no story files were changed.

---

# Book 1 (chapters 1-2)

# Book 1 (World 1, Peach Garden Oath) vs Romance of the Three Kingdoms ch. 1-2

Source: sanguo.txt (Gutenberg #23950, traditional), lines 36-404. Script: tools/tk_story.py World 1, tools/tk_places.py PLACES[1], tools/tk_story_zh.py. No repo files were edited.
Citations are chapter + original characters. "ZH" = tk_story_zh.py (simplified; I quote the novel in its traditional form).

## 1. Summary

About 198 narration/spoken/scroll lines in the scenes, opening and closing (plus the dilemma texts and NPC lines in tk_places.py). Counts are approximate, one class per line.

| Class | Approx. lines | Note |
|---|---|---|
| FAITHFUL | ~105 | Most of the main line (notice, inn, oath, Daxing, Qingzhou, cart, Dong Zhuo, Anxi inspector, Cao Cao anecdotes, Xu Shao) follows the novel closely, often nearly word for word. |
| ADAPTED | ~55 | Condensed speeches, two-person splits of group speeches, narrator facts moved into characters' mouths, reordered flashbacks. |
| INVENTED | ~30 | Star Lords (all scenes), shrine, blood errand and villagers, bossearly/bossearly2/qingzhouwait, a few Zhang Fei/Zhu Jun/Zuo Feng lines, dilemma monologues. |
| WRONG | 6 lines in 4 findings plus 1 spelling issue | See section 2. |

Overall the script is accurate. There are no wrong persons, courtesy names or numbers in the main line. The real errors are two invented/misplaced facts in the Black Wind setup, a timeline error in the Changshe fire side stories, a violence exaggeration in a Luoyang NPC line, and an inconsistent romanization.

## 2. WRONG findings

| # | Scene / file | Script line | What the novel says | Suggested fix |
|---|---|---|---|---|
| W1 | blackwind (n7) | "Zhu Jun's men have been broken against him once already." (ZH: 朱儁的人马已被他杀败过一回) | Ch. 2: Zhu Jun had not fought Zhang Bao before Liu Bei joined. The first clash is the one where Zhang Fei kills Gao Sheng and Zhang Bao works his sorcery against Liu Bei, who is the vanguard: 「雋令玄德為其先鋒，與賊對敵。張寶遣副將高昇出馬搦戰……玄德連忙回軍，軍中大亂，敗陣而歸，與朱雋計議。」 No earlier Han defeat is recorded. | Cut the sentence, or say "Zhang Bao has eighty or ninety thousand men camped behind the hills" (ch. 2 「張寶引賊眾八九萬，屯於山後」). |
| W2 | blackwind (n7) | "If he is not stopped, the Han line at Yangcheng will fall." (ZH: 阳城一线的官军便守不住了) | Ch. 2: Yangcheng is where Zhang Bao flees AFTER his sorcery is broken, and Zhu Jun is then the besieger: 「張寶帶箭逃脫，走入陽城，堅守不出。朱雋引兵圍住陽城攻打」. At this point Zhang Bao is camped 「山後」 and there is no Han line at Yangcheng. | Replace with "If he is not stopped, Zhu Jun's army cannot advance." (the Yangcheng node can remain as the map location of the final scene). |
| W3 | fireplan; caocao3 | "Some days before Liu Bei reaches Yingchuan, in the Han camp at Changshe…" (fireplan); "Days before Liu Bei reached Yingchuan, the rebels fled the flames at Changshe." (caocao3) | Ch. 1: Liu Bei arrives while the battle is still going on and the fire is still lit; there is no gap of days: 「卻說玄德引關、張來潁川，聽得喊殺之聲，又望見火光燭天，急引兵來時，賊已敗散。」 Huangfu Song and Zhu Jun also camped outside Changshe, where the rebels sat: 「賊戰不利，退入長社，依草結營。」 | "On the very night Liu Bei nears Yingchuan, outside Changshe…" (fireplan) and "That same night, as Liu Bei hurries toward Yingchuan, the rebels fled the flames at Changshe." (caocao3). Also "outside the rebel camp at Changshe", not "in the Han camp at Changshe". |
| W4 | tk_places.py, "Luoyang Gates" NPC | "The new commandant of the north gate beats curfew-breakers to death. Even the eunuchs' uncles." | Ch. 1: the offender is beaten, not killed, and only one uncle (Jian Shuo's) is named: 「有犯禁者，不避豪貴，皆責之。中常侍蹇碩之叔，提刀夜行，操巡夜拏住，就棒責之。」 (The staves scene itself says "beaten", which is right.) | "…beats curfew-breakers with his staves. Even the uncle of a palace eunuch." |
| W5 | tree scene title/narration vs node name | "Louzang Village" (scene title and narration) while the node says "Lousang Village" | Ch. 1: 「家住本縣樓桑村」, 樓桑 = Lousang (ZH 楼桑 is right). | Use "Lousang" everywhere (scene title "The Mulberry Tree at Lousang"). |
| W6 (minor, agent) | peace2 | "They called him the Great and Virtuous Teacher." | Ch. 1: he styled himself so: 「自稱大賢良師」. | "He styled himself the Great and Virtuous Teacher." Optional. |

Minor accuracy points that are not contradictions but should be checked by the owner:
- peace3: "He bribed a eunuch in the palace to open the gates from within." The novel gives this to Zhang Jiao's agent: 「角遣其黨馬元義，暗齎金帛，結交中涓封諝，以為內應」, and the eunuch is Feng Xu. "Open the gates" is the script's gloss on 內應. ADAPTED, but "his agent Ma Yuanyi bribed the eunuch Feng Xu" would be exact.
- peace2: "disciples numbered in the hundreds of thousands, organised in thirty-six divisions". Novel: first 「徒弟五百餘人」, then 「立三十六方，大方萬餘人，小方六七千」 (roughly 220-360 thousand in total). OK as written.

## 3. Notable ADAPTED changes (owner may want to look)

| Scene | Script | Novel (ch. + characters) | Comment |
|---|---|---|---|
| Opening | "— Yang Shen" attributed under the 臨江仙 | Ch. 1 gives only 「詞曰」, no author. | Historically right (Yang Shen, Ming), but not in the novel text; fine. |
| Opening | "half a million rise", "In the year 184" | 「中平元年」 (= 184), 「四五十萬」 | Fine. |
| tree | Placed first, before the notice/council | The novel introduces Liu Bei after the notice reaches Zhuo, then flashes back (「榜文行到涿縣，乃引出涿縣中一個英雄」). | Reordered as a prologue; harmless. |
| council | Held at Zhuo County office | Liu Yan 「召校尉鄒靖計議」 in You Province; no place named. Liu Yan is also shown at Daxing Mountain at "daxing" though he stays in the capital of the province. | Staging only. |
| notice | Zhang Fei's offer: "I've got money and land. Let's raise men together! But first — wine." | 「吾頗有資財，當招募鄉勇，與公同舉大事，如何？」 then they drink 「遂與同入村店中飲酒」 | ZH paraphrases; can use the original. |
| inn | Liu Bei: "Then sit with us, friend. We have the same purpose." | 「玄德就邀他同坐，叩其姓名」; Liu Bei states his aim only after Guan Yu speaks. | Order of revelation slightly changed. |
| inn | Guan Yu's name card omits 字壽長，後改雲長 | 「吾姓關，名羽，字壽長，後改雲長，河東解良人也」 | Optional extra. |
| oath | Oath split: Liu Bei "Though we were not born…", Guan Yu "…we wish to die…", Zhang Fei the last lines | All three speak together: 「不求同年同月同日生，但願同年同月同日死。皇天后土，實鑒此心。背義忘恩，天人共戮。」 | "Though we were not born" turns 不求 ("we do not ask to be born on the same day") into a concession; ZH correctly says 不求同年同月同日生. Opening 「念劉備、關羽、張飛，雖然異姓，既結為兄弟，則同心協力，救困扶危；上報國家，下安黎庶」 is omitted and could be added. |
| daxing | Liu Bei "meets him with five hundred" | 「劉焉令鄒靖引玄德等三人，統兵五百」 (under Zou Jing) | Zou Jing's role is dropped here and at Qingzhou (see section 5). |
| daxing | "Deng Mao — bring me his head!" | 「程遠志大怒，遣副將鄧茂出戰」 | Narration turned into speech. |
| qingzhou | "Qingzhou must not fall. We go at once." | 「玄德曰：『備願往救之。』」 | Fine. |
| qingzhou | Ambush order | 「分關公引一千軍伏山左，張飛引一千軍伏山右，鳴金為號」 | Right and left correct. The "thousand" each is dropped; ZH uses 「伏于山左／山右，鸣金为号」. Gong Jing's sally out of the city is dropped. |
| tent, yingchuan | Huangfu Song says "Zhu Jun and I have burned their camp… their army is broken"; Zhu Jun says "lost thousands in the fire" | The fire is told by the narrator; Huangfu Song speaks only 「張梁、張寶勢窮力乏，必投廣宗去依張角。玄德可即星夜往助」. | Narration moved into speech; "lost thousands" is not in the novel (a count of dead is not given). |
| cart | Lu Zhi calls Liu Bei "Xuande" and speaks the full account | Lu Zhi tells it to the dismounted Liu Bei in similar words: 「我圍張角，將次可破；因角用妖術，未能即勝。朝廷差黃門左豐……問我索取賄賂」 | Faithful in content; ZH is a paraphrase and could use the original. "Four guards" is staging (novel: 「一簇軍馬」). |
| office | "Dong Zhuo turns his back without a word of thanks" | 「卓甚輕之，不為禮」 | Staging. |
| office | Liu Bei says "We are commoners" | 「玄德曰：『白身。』」 | Fine. ZH 白身 is the original. |
| blackwind | Narrator says riders are paper and straw before the blood plan | The novel shows only 「黑氣中似有無限人馬」; paper men appear when the spell is broken (「空中紙人草馬，紛紛墜地」). "Armies out of thin air / 撒豆成兵" is not in the text. | Foreshadowing; fine. |
| blackwind/shrine | Zhu Jun says only "Sorcery… fall back", the blood remedy comes later | Zhu Jun gives the remedy at once: 「彼用妖術，我來日可宰豬羊狗血，令軍士伏於山頭；候賊趕來，從高坡上潑之，其法可解」. In the game the remedy line is delayed behind the Star Lords. | The later Zhu Jun line in the shrine scene is the novel's. In the novel it is Liu Bei who then 「撥關公、張飛各引軍一千，伏於山後高岡之上，盛豬羊狗血並穢物準備」. |
| bosswin | Omits Zhang Bao's rout details | 「左關公，右張飛，兩軍都出，背後玄德、朱雋一齊趕上，賊兵大敗」 | Fine. |
| bosswin | Yan Zheng stabs Zhang Bao | 「賊勢危急，賊將嚴政，刺殺張寶，獻首投降」 | Faithful. In the novel this comes after the report of Huangfu Song's victory (the closing scroll puts that first). |
| peace1 | "years before" Zhang Jiao met the old man | No date. | Fine. |
| peace3 | "…To let this moment pass would be a crime" | 「誠為可惜」 ("it would be a pity") | Slightly stronger. |
| caocao1 | "Brother! Your son has had a stroke!" | The novel only has 「叔父驚告嵩」 and Cao Song's reply 「叔言汝中風，今己愈乎？」 | Speech created from narration; fine. |
| caocao3 | Cao Cao: "Cao Cao, Commandant of Cavalry. You go no further." | The novel narrates it: 「為首閃出一將……官拜騎都尉……姓曹，名操」; his 5000 men are not shown. | Fine. |
| bribe | Zuo Feng: "Your victories are splendid, general. And where is the gift…?" | 「問我索取賄賂」 | Invented wording for the demand. |
| hostel | "he is turned away at the gate" | 「玄德幾番自往求免，俱被門役阻住，不肯放參」 | Faithful. |
| closing | Liu Bei's Wancheng advice: "Leave them one way out" | 「不若撤去東南，獨攻西北。賊必棄城而走」 (and the earlier 「今四面圍如鐵桶……必然死戰」) | English paraphrase inside quote marks; ZH uses the novel's wording. Zhu Jun's counter-argument is dropped. |
| closing | "the eunuchs gave rewards only to those who paid" | Ch. 2: Sun Jian 「有人情」 got a post; Liu Bei waited; only after Zhang Jun's protest do the eunuchs give a minor post 「權且教省家銓注微名」; extortion of generals comes later (「問破黃巾將士索金帛」). | Summary is slightly compressed; the reason is right in spirit. |
| post (Chapter 2 scroll) | "his brother-in-law, General He Jin… sent for the warlords of the provinces… force the Empress's hand" | 「召四方英雄人士，勒兵來京，盡誅閹豎。此時事急，不容太后不從」; 「發檄至各鎮」 | OK. "Warlords" is a modern label. The scroll skips about four years (see section 5). |
| places.py Anxi | Liu Bei "sheriff", inspector "posting station/hostel" | 「館驛」 | Fine. |

## 4. INVENTED items

Known game inventions (confirmed absent from ch. 1-2):
- The Star Lords (stargrey, starred): all appearances (oath intro/outro, Daxing, Qingzhou night, shrine). The shrine itself, its glow, and the "Fortune favours the one who reads the stones" lines.
- The Black Wind blood errand: Liu Bei asking villagers for pigs', sheep's and dogs' blood; the village pens; the three villagers who give blood; the hint "Pigs, sheep, dogs. Blood."; the ridges needing delivered blood before the ambush.
- The Lu Zhi errand to Changshe as a separate "learn how they stand" mission is in the novel (「前去潁川打探消息，約期剿捕」), but the "Too Late" framing is the game's. The "Lu Zhi errand" in the brief refers to Yingchuan, which is in the novel.
- Mulberry-tree problem placement (game mechanics).

Further small inventions I found:
- inn: Zhang Fei's "Who is this red-faced giant? He walks in like he owns the road." and "A man who kills a bully is no stranger at this table." (novel has Liu Bei do the inviting; Zhang Fei is silent).
- inn: the innkeeper emote and props.
- oath: the drunk animations and "zzz"; Zhang Fei speaking the final oath lines.
- daxing: Liu Bei shouting "Traitors to the realm!" is in the novel (「反國逆賊，何不早降」), but the Star Lords' intervention is not.
- qingzhou: the night scene at the edge of the camp (two old men and the second problem); a messenger "runs in" (novel 「接得青州太守龔景牒文」, a document, not a runner).
- qingzhouwait ("Not Yet") and bossearly / bossearly2 ("The Wind Again"): gating scenes; Guan Yu's "The old men said blood."
- bosswin: the signal gun and the tilt are in the novel; the bucket-per-man detail is not.
- blackwind: "Zhu Jun's men have been broken once already" and "Han line at Yangcheng" (these are the WRONG items W1-W2).
- yingchuan: Zhu Jun's "Their army lost thousands in the fire."
- cart: the four guards; Zhang Fei's hand on the sword; the dilemma monologues ("If I free him, I am a rebel…"). The dilemma text for the inspector ("He deserves to die. But I am a sheriff, and he is the court's own man.") is likewise the game's.
- bribe: Zuo Feng's spoken demand.
- peace3: the dialogue is built from narration but follows the novel; no invention beyond the staging.
- tk_places.py NPC chatter (Zhuo County, Julu, Anxi, etc.) is invented flavour. Check these two: "They say the volunteers march next month." (the novel has no such delay), and the Zhuo notice-board weiqi problem text.
- tk_places "Hills North of Guangzong" NPC: "He doesn't like visitors without rank." (flavour for Dong Zhuo).

## 5. Novel events skipped that matter

1. Zou Jing leads the 5000 men sent to Qingzhou with Liu Bei and goes home afterwards (ch. 1: 「劉焉令鄒靖將兵五千，同玄德，關，張，投青州來」, 「於是鄒靖引軍自回」). The game leaves Liu Bei alone, which explains why he has only 500 men at Guangzong.
2. Lu Zhi's strength (Zhang Jiao 150,000 against his 50,000) and Liu Bei's earlier teacher-student link (the script does mention Zheng Xuan and Lu Zhi in the tree scene).
3. Cao Cao's background: adoptive grandfather Cao Teng, father Cao Song's Xiahou origin, nicknames A-man and Jili, Qiao Xuan and He Yong's praise (「天下將亂，非命世之才，不能濟」), his post at 20, and his later rank. The anecdotes are told without it.
4. Liu Yan's lineage (Prince Gong of Lu) and Liu Bei's description (eight points: 7 chi 5 cun, ears, hands, eyes, face, lips) are mostly cut; Zhang Fei's and Guan Yu's physical descriptions are partial.
5. Huangfu Song, Zhu Jun and Lu Zhi each get the three-armed campaign (「分三路討之」) only in the opening scroll.
6. After the Dong Zhuo insult in ch. 2, Liu Bei joins Zhu Jun: the pursuit of Zhang Liang at Quyang, the death of Zhang Jiao (before Huangfu Song arrives), Dong Zhuo's replacement, Lu Zhi's rehabilitation (「又表奏盧植有功無罪，朝廷復盧植原官」). The script's closing scroll covers only some.
7. The Wancheng campaign: Zhao Hong, Han Zhong, Sun Zhong; Liu Bei kills Sun Zhong with an arrow; Sun Jian's background (father at Qiantang, pirates, Xu Chang); the triumph and rewards (Zhu Jun made General of Chariots and Cavalry).
8. Zhang Jun's remonstrance against the Ten Attendants (「宜斬十常侍，懸首南郊」), which causes the eunuchs to give Liu Bei the Anxi post; without it, the Anxi posting looks arbitrary.
9. After the flogging: the inspector reports to the governor of Dingzhou; Liu Bei, Guan Yu, Zhang Fei flee to Liu Hui in Dai; the eunuchs seize power (Zhao Zhong and Zhang Rang become marquises and generals); Ou Xing, Zhang Ju and Zhang Chun rebel; Liu Tao and Chen Dan are imprisoned and murdered; Sun Jian is made governor of Changsha; Liu Yu is made governor of You; Liu Bei is pardoned and made magistrate of Pingyuan under Gongsun Zan. The Chapter 2 scroll jumps straight to Emperor Ling's death in the fourth month of 中平六年 (189), about four years later.
10. The reasons for He Jin's power (his sister He, the empress, her son Bian; the poisoning of Lady Wang; Prince Xie raised by Empress Dong), Jian Shuo's plot against He Jin, Cao Cao's advice to "first set the sovereign" and Yuan Shao's offer of 5000 men. The scroll lets Cao Cao's laugh stand without this context.
11. The death of the Dong empress, the rivalry between the two empresses, and Yuan Shao's advice "斬草除根" (ch. 2), all lead to the next book.

## 6. ZH (tk_story_zh.py) quotation checks

Lines where the ZH already uses the novel's wording (good): Zhang Fei "大丈夫不与国家出力，何故长叹？", Liu Bei's oath "皇天后土，实鉴此心！背义忘恩，天人共戮！", "反国逆贼，何不早降！", Lu Zhi's "军粮尚缺，安有余钱奉承天使？", Dong Zhuo scenes "你们现居何职／白身／他是朝廷命官，岂可擅杀", Zhang Fei's "若不杀这厮，反要在他部下听令…", Guan Yu's "兄长建许多大功…", Liu Bei's "据汝害民，本当杀却；今姑饶汝命。吾缴还印绶，从此去矣", Xu Shao's "子治世之能臣，乱世之奸雄也", Zhang Jiao's "至难得者，民心也…", "苍天已死，黄天当立；岁在甲子，天下大吉", Chen Lin/Cao Cao ch. 2 quotes, tree quotes (我为天子，当乘此车盖／此儿非常人也).

Places where the ZH paraphrases and the original wording could replace it:

| English line (scene) | ZH now | Original (ch.) |
|---|---|---|
| Zhang Fei: "I've got money and land. Let's raise men together!" (notice) | 我颇有些钱财，正好招募乡勇，与你同举大事！走，先喝一杯！ | 「吾頗有資財，當招募鄉勇，與公同舉大事，如何？」 (ch. 1) |
| Liu Bei: "I am of the Han imperial house…" (notice) | 我本汉室宗亲，有志破贼安民，只恨力不能及，所以长叹。 | 「我本漢室宗親，姓劉，名備。今聞黃巾倡亂，有志欲破賊安民；恨力不能，故長歎耳。」 (ch. 1) |
| Guan Yu: "Wine, quickly! …" (inn) | 快斟酒来！我要赶进城去投军。 | 「快斟酒來吃，我待趕入城去投軍。」 (ch. 1) |
| Guan Yu: "Guan Yu, of Hedong…" (inn) | 我姓关，名羽，河东解良人。因本处豪强欺压百姓，被我杀了… | 「吾姓關，名羽，字壽長，後改雲長，河東解良人也。因本處勢豪，倚勢凌人，被吾殺了；逃難江湖，五六年矣。」 (ch. 1) |
| Oath, Liu Bei/Guan Yu (EN "Though we were not born…") | 不求同年同月同日生……／……只愿同年同月同日死 (ZH is right; the EN "Though we were not born…" changes the meaning) | 「不求同年同月同日生，但願同年同月同日死。」 (ch. 1) |
| Liu Bei's Qingzhou plan (qingzhou) | 贼众我寡，必出奇兵，方可取胜。云长引兵伏于山左，翼德伏于山右，鸣金为号，一齐杀出。 | 「賊眾我寡，必出奇兵，方可取勝。」＋「分關公引一千軍伏山左，張飛引一千軍伏山右，鳴金為號，齊出接應」 (ch. 1) |
| Lu Zhi in the cart (cart) | 我围张角，眼看就要破贼。朝廷派来的使者向我索贿，我不肯给。如今我被押解进京，兵马交给了董卓。 | 「我圍張角，將次可破；因角用妖術，未能即勝。朝廷差黃門左豐前來體探，問我索取賄賂。我答曰：『軍糧尚缺，安有餘錢奉承天使？』……遣中郎將董卓來代將我兵，取我回京問罪。」 (ch. 1) |
| Zhang Fei in the cart scene (cart) | 我去杀了这些押送的军士，救出卢中郎！ | narration: 「張飛聽罷，大怒，要斬護送軍人，以救盧植」 (ch. 1) |
| Dong Zhuo's slight (office) | 董卓甚是轻视，连谢也不谢。 | 「卓甚輕之，不為禮」 (ch. 1) |
| Cao Cao to his father (caocao1) | 儿子自来没有这病。只因叔父不喜欢我，所以冤枉我罢了。 | 「兒自來無此病；因失愛於叔父，故見罔耳」 (ch. 1) |
| Liu Bei's reply to Zhang Fei (office) | (original already) | 「我三人義同生死，豈可相離？不若都投別處去便了。」 (ch. 2) |
| Peace2 "They called him…" | 人们称他为大贤良师 | 「自稱大賢良師」 |
| Closing, Wancheng advice | ZH quotes 「今四面围如铁桶，贼必死战；不若撤去东南，独攻西北，贼必弃城而走」 (the novel's wording; the English is the paraphrase "Leave them one way out") | 「今四面圍如鐵桶，賊乞降不得，必然死戰……不若撤去東南，獨攻西北。賊必棄城而走」 (ch. 2) |

Other ZH housekeeping:
- ZH has several stale keys for English lines that no longer exist in the script (for example the old merged Cao Cao/staves narration, "Lu Zhi is glad to see him, and keeps him at his tent. Then he sends him with a thousand more men…", "Liu Bei and his five hundred report…" variants, "Zhu Jun's own men have no blood… Liu Bei goes down to ask."). They do no harm but can be deleted.
- ZH for the staves scene uses 洛阳北部尉; this Gutenberg text has 洛陽北都尉. Either is fine.
- ZH for the first-chapter scroll: "汉朝传国四百年，到了灵帝，只信宦官" is plain modern Mandarin, not a quote, as the file header says.
- Every English line in World 1 has a ZH entry (checked programmatically: 0 missing).

---

# Book 2 (chapters 3-9)

# Audit of World 2 ("Hulao Pass") against Romance of the Three Kingdoms, chapters 3-9

Script: `/home/user/goban-trainer/tools/tk_story_w2.py`
Source: `sanguo.txt` lines 405-1577 (ch.3 L405, ch.4 L578, ch.5 L729, ch.6 L920, ch.7 L1064, ch.8 L1229, ch.9 L1383).
Method: every N/S line, staged event, opening/closing scroll, couplet, node place, item and landmark/NPC line was read against the Chinese text. Line numbers cited are the sanguo.txt line numbers.

## 1. Summary counts

Counted per narration or speech unit (scenes, opening and closing scroll paragraphs, couplets). Counts are approximate (+/- 3).

| Class | Count |
|---|---|
| FAITHFUL | ~120 |
| ADAPTED | ~45 |
| WRONG | 13 (4 are translation or label slips, 3 are failure-branch or timing slips) |
| INVENTED | ~14 (mostly flavour NPC lines and the known game devices) |

The script is very close to the novel overall. Most spoken lines are near-verbatim quotes with the original characters preserved. The WRONG items are mostly small.

## 2. WRONG findings

| # | Scene / location | Script line | What the novel says | Suggested fix |
|---|---|---|---|---|
| 1 | `_opening` para 1 (English) | "Dong Zhuo ... rode into the capital at the head of **twenty thousand** men from the west." (zh says 二十万) | Ch.3 L413: 統西州大軍二十萬. That is 200,000 (er shi wan). The Chinese is right and the English is wrong. | "two hundred thousand" (or "a vast army from the west"). |
| 2 | `_opening` para 2 | "Lü Bu, strongest of all the **western riders** ..." / zh 西凉诸将中最勇猛 | Lü Bu is Ding Yuan's man, not one of Dong Zhuo's Xiliang officers. Li Su is "與呂布同鄉" (L528) and Dong Zhuo's own western generals are Li Jue, Guo Si, Zhang Ji, Fan Chou (L414). Lü Bu is called "丁原義兄/義子" and serves "丁建陽" (L519, L522). | "the strongest rider in the capital, Ding Yuan's adopted son". |
| 3 | `_opening` para 3 | "In **the east**, a young captain named Cao Cao drew a knife." | Ch.4 L653-666: Cao Cao draws it in Dong Zhuo's own residence at Luoyang. He flees east afterwards (L675). | "In Luoyang itself, a young captain ..." |
| 4 | `lvboshe` | `S("caocao", "Tie him up and kill him: how about that?", "缚而杀之，何如？")` | Ch.4 L713-714: the line "縛而殺之，何如？" is **overheard from the household** behind the house ("但聞人語曰"). Cao Cao does not say it, he reacts to it ("是矣！今若不先下手..."). | Make it narration or a voice from offstage: N("From behind the house a voice: 'Tie him up and kill him, how about that?'"), then Cao Cao: "是矣！今若不先下手，必遭擒获。" |
| 5 | `feasts` (zh narration) | 卓即命备毡车，先将貂蝉送到相府 / "Dong Zhuo takes her away that night in a felt-covered cart" | Ch.8 L1323-1324: **Wang Yun** gives the order: "允即命備氈車，先將貂蟬送到相府". The script's Chinese is the novel's sentence with the subject changed from 允 to 卓. | "Wang Yun at once has a felt-covered cart made ready and sends Diaochan ahead to the Chancellor's mansion." |
| 6 | `fall` last two N lines | "The people of Chang'an dance in the streets. A soldier puts a wick in the dead man's navel, and **it burns for days**." zh 长安士民，歌舞于道。看尸军士以火置其脐中为灯，膏油满地。 | Ch.9 L1484-1486: "卓屍肥胖，看屍軍士以火置其臍中為燈，膏油滿地。百姓過者，莫不手擲其頭，足踐其屍。" There is no 歌舞於道 anywhere in ch.3-9 (grep confirms), and "burns for days" is not stated. The people throw things at the head and trample the corpse. | Replace with the novel: "Passers-by hurl things at his head and trample his body. A soldier sets a flame in his navel as a lamp, and the fat runs over the ground." zh 百姓过者，莫不手掷其头，足践其尸。 |
| 7 | `xianshan` N1 | "**Years later**, to repay Liu Biao for blocking his road, Sun Jian besieges Xiangyang." | Ch.6 L1031-1032 to ch.7 L1157-1171: Yuan Shu's letter comes soon after the Panhe war and Sun Jian sets out at once. It is a matter of months, not "years later" in the story's telling. (The seal was found in 190 and Sun Jian died in 191 in history.) | "Not long after, ..." |
| 8 | `hulaoearly2` (failure branch) | "Zhang Fei charges Lü Bu alone, and is **hard pressed**. Guan Yu pulls him back." | Ch.5 L900-902: Zhang Fei "酣戰呂布，連鬥五十餘合，不分勝負". He is not hard pressed, and Guan Yu does not pull him back. He joins the fight. It is a game failure state, but it contradicts the novel's outcome. | "Zhang Fei fights him alone, and the fight will not be settled. Guan Yu holds back: not yet. One, then two, then three." (keeps the order hint without the false outcome). |
| 9 | `redhare` S2 (zh) | 良禽择木而栖，贤臣择主而**佐**。 | Ch.3 L549: 「良禽擇木而棲，賢臣擇主而**事**。」 The script says it is quoting. | 良禽择木而栖，贤臣择主而事。 (English "serves" not "supports"). |
| 10 | `ruins` S1 (English) | "This is the hour **Heaven gives**." | Ch.6 L971: 此天亡之時也 means "this is the time Heaven is destroying him", Dong Zhuo's fall (天亡 = Heaven ruins). The English reverses the sense. The zh is the correct quote. | "This is the hour Heaven is bringing him down. One battle settles it." |
| 11 | `_world` couplet 2 (English) | "the Prince of Chenliu made **king**" | Ch.4 title and L605-606: 陳留為皇, Prince Xie is made **Emperor** (Xian Di). | "Chenliu is made Emperor". |
| 12 | Wenming gift chain: `PLACES2["Wenming Garden"]` NPC, `lisuwaits` S, item `gifts` (all zh) | 董相国赠吕布之礼 / 去园中向董相国的人取来 / 董相国的礼物 | Anachronism of title. In ch.3 Dong Zhuo is still 前將軍/西涼刺史 (L412, L568: 自領前將軍事). He becomes 相國 only in ch.4 after the deposition (L606: 董卓為相國). Li Su says "董公" (L553). | Use 董公 / 董将军 in these ch.3 lines. (English avoids the title.) |
| 13 | `hulao1` N2 (staging) | "The lords draw back thirty li. They agree among themselves: no one can match Lü Bu." (after Wu Anguo) | Ch.5 L884-886: the retreat of thirty li follows **Fang Yue's death** (Wang Kuang, Qiao Mao, Yuan Yi, three routes). "言呂布英雄，無人可敵" is said then. After Mu Shun and Wu Anguo (L888-893) they merely return to camp and Cao Cao proposes a council of all eighteen lords. | Low-priority. Either reorder or soften: "The lords fall back. Thirty li from the gate they agree..." The sentence is fine as a compression, but strictly the order is off. |

Notes: #4, #5, #6 and #9 are cases where the Chinese claims or implies the novel's wording and does not match, as the brief asked. #10 and #11 are English mistranslations only.

## 3. Notable ADAPTED changes

| Scene | Change | Comment |
|---|---|---|
| `_opening` para 1 | "The eunuchs fell to He Jin's soldiers." | In ch.3 L446-451 He Jin is murdered first. The eunuchs fall to Yuan Shao, Yuan Shu and He Jin's officer Wu Kuang. Acceptable shorthand. |
| `pingyuan` | Liu Bei is "magistrate"; later "chancellor" of Pingyuan | Both right: 平原縣令 (L329, L772) and later 平原相 (L1043, L1148). Chinese "After Anxi" is loose: the novel goes Anxi, Gaotang, then Gongsun Zan recommends him (L328-329). |
| `pingyuan` | Skips Zhang Fei's regret ("當時若容我殺了此賊", L777) and Gongsun Zan's "埋沒英雄" (L775) | Guan Yu = 馬弓手, Zhang Fei = 步弓手 (L774) is the setup for Yuan Shu's later insult. The script gets the "mounted archer" from the wine scene alone. |
| `alliance` | The seating and introduction (L835-839) happens at the council **after Sun Jian's defeat**, not at the oath ceremony | Merged. The "冷笑" (L836) belongs to the three standing behind Gongsun Zan before Liu Bei is named, not after he is seated. Chronologically harmless. |
| `wine` | Lords "think little of a mounted archer" replaces Yuan Shu's first outburst "與我打出" (L849) and Yuan Shao's "必被華雄所笑" (L851) | The Yuan Shu insult is moved entirely to after the kill. Guan Yu's pledge "如不勝，請斬某頭" (L852) is dropped. |
| `wine` | "That night Cao Cao quietly sends beef and wine" | The novel does it straight after the argument (L863), not specified as night. |
| `hulao1` | Fang Yue's death is Wang Kuang's own champion (L882), not one of the eight champions sent in order | Compression. |
| `hulao` | Zhang Fei's intervention is staged as defiance only | Dropped: Lü Bu's halberd aimed at Gongsun Zan's back (L896); Zhang Fei yelling to go up the pass for Dong Zhuo (L916); the 30 rounds before Liu Bei joins (L902); Liu Bei's "yellow-maned horse". The order Zhang Fei, then Guan Yu, then Liu Bei **is** the novel's (L898-902). |
| `ruins` | Order of events: Gongsun Zan's "Let us go home" and Liu Bei's appointment sit directly after Cao Cao's departure | In the novel they come after Xingyang, the seal, the Liu Biao ambush, and Cao Cao's gloom banquet (L1035-1044). The side nodes (b4, c2) are reachable after m5, so this is acceptable as a main-line compression. The speech was addressed to Liu Bei, Guan Yu, Zhang Fei (L1042-1043). |
| `ruins` | "Dong Zhuo has **fled** to Chang'an" | The novel is a deliberate forced move of the capital with a mass march of the people (L934-963). Pop-up wording only. Lü Bu digs the tombs on Dong Zhuo's order (L962); script says Dong Zhuo did it. |
| `ruins` | Cao Cao's speech is directed at "the lords" | In the novel he addresses Yuan Shao (L969-971); the lords then refuse. |
| `redhare` | Red Hare delivered via Dong Zhuo's gifts item | Known invention (Li Su carries them himself, L534-536). |
| `dingyuan` | Lü Bu brings the head "to Dong Zhuo" and kneels as father | Novel: he brings it to Li Su, who leads him to Dong Zhuo, and Dong Zhuo bows first (L565-567). |
| `poison` | The murder is covered by darkness and "the room is quiet" | The novel (L626-634) has the Empress Dowager hurled from the tower, Consort Tang strangled and the Emperor poisoned. Shaodi's song is only the first stanza. Tang Fei's own song is omitted. |
| `poison` | "Li Ru comes with ... a short knife and a white silk" | Faithful. Note he comes "帶武士十人", as the zh says. |
| `fireflies` | Voice id `xiandi` speaks the Prince of Chenliu's line | In the novel it is the Prince of Chenliu, not yet Emperor. Fine. |
| `dagger` | "Birthday dinner" | In the novel it is a **pretext**: Wang Yun says it is not his birthday (L654-656). The English is unqualified, the zh is fine. Lü Bu is absent from the scene and Dong Zhuo is "tired" in English. The novel says Dong Zhuo is fat and cannot sit long (胖大不耐久坐, L669). |
| `dagger` | Cao Cao "borrows" the knife and Wang Yun "gives" it | OK. Wang Yun's response at L662. |
| `zhongmou` | Merged: the alias "Huangfu merchant", the night in jail, and Chen Gong's self-introduction (L688-701) are skipped | Chen Gong's decision is explained in the novel by Cao Cao's "屈身事卓" speech and "發矯詔" plan, which is key to why Chen follows him. |
| `lvboshe` | Cao Cao's justification ("If he goes home...") is placed **before** the killing | In the novel (L720-723) the killing comes first, then Chen Gong asks "今何為也？", then the justification, then "知而故殺", then "寧教我負天下人". The key beat that Lü Boshe **says he has already had a pig killed for them** (L717-718) and Cao Cao kills him anyway is dropped, though it is the sharpest part of the story. |
| `lvboshe` | "Chen Gong lies awake with hand on his sword" | The novel has them lodging at an inn (L725) and Chen Gong deciding not to kill him (L731). The English implies sleeplessness, the zh matches. |
| `xingyang` | "Chases Dong Zhuo alone" | Cao Cao leads over 10,000 men with the Xiahous, Cao Ren, Cao Hong, Li Dian and Yue Jin (L972-973). "Alone" means the lords will not follow. Lü Bu's counter-attack and Li Jue/Guo Si flank (L977-982) are skipped. |
| `xingyang` | Cao Hong "My lord, get up!" | Novel: 公急上馬 ("mount quickly"). Cao Cao's "吾死於此矣，賢弟可速去" (L988-989) precedes. Cao Hong also carries him across the river (L992). |
| `zumao` | Sun Jian "slips away into the wood" | Novel: they take separate roads and Sun Jian leaves by a small path (L824). Zu Mao then hides in the wood. |
| `seal` | Cheng Pu's long provenance of the seal (L1012-1018) is compressed to one line | Also adds "必有登九五之分". Faithful. |
| `xianshan` | Yuan Shu's letter (L1154-1157), the Huang Zu exchange (L1233-1234), Sun Jian's age 37 (L1213) all skipped | Sun Ce "seventeen" is from Dong Zhuo's question (L1240). Sun Jian's oath at the seal scene is fulfilled here ("死於刀箭" / "矢石") but nothing in the script ties them. |
| `garden` | Diaochan's "萬死不辭" is spoken in the novel **before** Wang Yun bows (L1263-1264), then repeated. The scene reproduces the order flexibly | The plan itself (the chain: betrothed to Lü Bu, given to Dong Zhuo, L1270-1273) is skipped, so the "chain" title is unexplained. |
| `feasts` | "Chancellor" for 太师 | The novel's Chinese here is 太師/董太師 (Grand Preceptor). English "Chancellor" (相國) is used throughout. Fine. Wang Yun's gold crown gift and "非敬將軍之職，敬將軍之才" (L1277-1280) are skipped. |
| `pavilion` | Diaochan's pretence of leaping into the lotus pond (L1362-1363) is skipped | It is the emotional centre of the pavilion scene. |
| `fall` | "Forged edict" | The novel never calls it forged. The plan was a "密詔" (L1436) Wang Yun gave to Lü Bu, and Li Su's announcement is the lie of abdication. Okay in spirit. |
| `fall` | Wang Yun "persuades" Lü Bu | The novel's persuasion is long (L1415-1433: the surnames "將軍自姓呂，太師自姓董", the oath with blood), then Li Su is recruited (L1437-1444). Skipped. |
| `mourner` | Wang Yun speaks in the street | In the novel the capture is at a banquet at the 都堂 (L1492-1496). Ma Midi's plea and Wang Yun's Sima Qian reply (L1503-1507) are skipped. |
| `tower` | Compresses Li Meng and Wang Fang opening the gate and the Emperor's own appearance | See skipped list. |
| `_closing` | "The three brothers went home to Pingyuan" | They had gone home in ch.6 and came back for Panhe in ch.7. Fine as the world's ending. Lü Bu flees to Yuan Shu (L1556). OK. |
| Nick-name "the Flying General" (飞将) | Boss title and ZH2 | This is a historical epithet (Records), not the novel's text (the only 飛將 hits are L50, L5032, L10035 and mean something else). Harmless, but not from the book. |

## 4. INVENTED items

Known (per the brief):
- The Star Lords (stargrey / starred) at the board in `shrine2`, and the "One, then two, then three" hint they speak.
- The shrine at the camp (`m4b`), its glow lines in `PLACES2["Hulao Pass"]` and the landmark intro/outro.
- Diaochan's "sign": the weiqi board with two stones on the pavilion table in `garden`.
- The formation order tied to a deliberately gated Hulao fight (posts for Zhang Fei, Guan Yu, Liu Bei; their post lines). Note the order itself matches the novel (L898-902).
- Red Hare delivery via Dong Zhuo's gifts (`gifts` item, the Wenming Garden official NPC, `lisuwaits`).

Others found:
- `hulaoearly`: Liu Bei rides out against Lü Bu alone and "cannot stand against him". In the novel Liu Bei is the last to join and only after thirty rounds (L902). Also the line "Not alone. We must find out how to meet him." is invented.
- `hulaoearly2`: Guan Yu's line about posts ("Send Yide to his post first, then me, then yourself").
- `lisuwaits`: Li Su's line "I have nothing to show him. Bring what Dong Zhuo sent".
- Boss taunt: "Four men or forty. None of you will leave this field."
- `alliance`: the emote "anger" on Zhang Fei (novel gives them a cold smile, L836).
- Flavour NPC lines (all invented, none contradict): Pingyuan ("sells sandals no more"), Lords' Camp ("Eighteen lords and not one who will move first." The count of eighteen is the novel's, L892), Sishui ("Hua Xiong cut down two champions before breakfast", the "before breakfast" is invented), Hulao soldier, Burned Luoyang ("burned for three days", the novel gives no duration), Beimang, Ding Yuan's camp ("reads late" has a basis in L560), Yong'an, Luoyang, Zhongmou, Lü Boshe's farm ("a pig for guests"), Xingyang, Xianshan, Wang Yun's garden, Fengyi, Chang'an.
- Dilemma lines: Diaochan: "Lord Wang has raised me as his own child. Now he asks for my life." (cf. L1262 and L1259, loose). Wang Yun: "Lü Bu waits with a horse. The Emperor is in the palace behind me." The "horse" is not mentioned in the novel (Lü Bu comes with "數百騎", L1551). All "I know what I must do / Not yet" lines are game voice.
- `seal`: "decides to keep the seal" (意欲私藏) is the script's phrasing. The novel says only "密諭軍士勿得洩漏" (L1019-1020) and Sun Jian's plan to "託疾辭歸".
- `fall`: "burns for days" (see WRONG #6).
- Fireflies title card "Before the lords rose, in the capital, on a night of fire..." frames events of ch.3 that precede it, fine.

## 5. Skipped events that matter

1. **Ch.3**: Ding Yuan routs Dong Zhuo before Lü Bu is turned (L521-527); Lu Zhi's protest at Wenming (L512-516); Cui Yi's farm, Min Gong and Dong Zhuo's meeting with the Prince of Chenliu (L473-491). Lü Bu's "I would kill Ding Yuan" is his own idea (L557).
2. **Ch.4**: The deposition at Jiade Hall and Ding Guan's protest (L589-603); Yuan Shao's walkout and Yuan Wei (L571-587), which is why Yuan Shao is at Bohai and alliance head; Cai Yong's recruitment (L607-609), needed to understand why he weeps; Wu Fu's earlier assassination attempt (L639-646); Yuan Shao's secret letter to Wang Yun (L647-650); the Yangcheng massacre (L635-637).
3. **Ch.5**: Cao Cao's forged summons, Wei Hong's money, the seven-banner muster and the oath altar (L731-790). The seventeen/eighteen lords list. Yuan Shu in charge of provisions. Sun Jian as vanguard. Bao Xin's brother Bao Zhong killed first (L801-804), Hu Zhen killed (L812-813). **Yuan Shu withholds grain**, the direct cause of Sun Jian's defeat (L813-816). Dong Zhuo's slaughter of Yuan Wei's family (L868). The Hulao deployment (L869-872).
4. **Ch.6**: Li Jue offers Sun Jian a marriage alliance and is refused (L929-932); Li Ru's migration plan and the children's rhyme (L934-940); the forced evacuation, deaths of Zhou Bi and Wu Qiong (L950-959); Yuan Shao's ambush by Liu Biao (L1032-1062); Cao Cao's strategic speech at the banquet (L1035-1040); Cao Cao's departure to Yangzhou (L1042).
5. **Ch.7** (whole chapter largely absent): Yuan Shao seizes Jizhou from Han Fu (L1069-1086); Panhe, **Zhao Yun's first meeting with Gongsun Zan and Liu Bei** (L1106-1109, L1141-1150); Liu Bei, Guan, Zhang's rescue at the bridge (L1137-1140); Yuan Shu's letter urging Sun Jian against Liu Biao (L1154-1157); the Huang Zu body swap (L1224-1234).
6. **Ch.8**: Dong Zhuo's rise (尚父, Meiwu, the cruelty at the Hengmen feast L1240-1250); **Zhang Wen's execution** (L1251-1255), which directly triggers Wang Yun's night walk; the full chain stratagem (L1270-1273), the gold crown, the felt cart lie to Lü Bu on the road (L1325-1335); Diaochan's false leap (L1362); Li Ru's "絕纓" advice (L1388-1391); Diaochan's lie to Dong Zhuo (L1393-1401).
7. **Ch.9**: Lü Bu and Wang Yun's talk and blood oath (L1415-1433); Shisun Rui, Huang Wan and Li Su's recruitment (L1435-1444); the omens on the road (wind, the children's song 千里草 / 十日卜, the Taoist with the cloth of two 口, L1463-1471) which are Li Su's cover story; the slaughter at Meiwu, including Dong Zhuo's mother (L1486-1491); Wang Yun's refusal to pardon the four (L1514-1516); **Jia Xu's counsel** (L1516-1518); Li Su's death at Lü Bu's hands (L1528); Niu Fu's death; the final loss of Chang'an through traitors Li Meng and Wang Fang (L1550); Wang Yun's last words "為吾謝關東諸公" (L1553).
8. **Irony worth keeping**: Li Su cuts off Dong Zhuo's head (L1478) and was the man who made Lü Bu a parricide (L557); Sun Jian's oath "死於刀箭之下" (L1028) is fulfilled at Mount Xian (L1213); Chen Gong follows Cao Cao and leaves him (L731). None is linked in the script.

---

# Historian's verification

Re-read in the novel text and confirmed: Book 1 findings 1-6 (Zhu Jun's earlier "defeat", Yangcheng, "days before" Yingchuan, the curfew beating, Lousang, the self-styled title). Book 2: the opening's 200,000 men (二十萬), 良禽擇木而棲，賢臣擇主而事 (事, not 佐), 相國 appearing only in ch.4, the overheard 縛而殺之 in ch.4, the retreat after Fang Yue not Wu Anguo, Zhang Fei's fifty rounds without result with Guan Yu then joining, 此天亡之時也, Wang Yun (允) ordering the felt cart, and Dong Zhuo's corpse (膏油滿地, no dancing in the streets). Not re-checked individually: the Lü Bu "western riders" line, the Cao Cao opening line, "Years later" at Xianshan, and the couplet's 陳留為皇.
