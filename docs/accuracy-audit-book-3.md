# Accuracy audit: Book 3 (White Gate Tower) against the novel, chapters 10-19 and the start of 20

Source: Chinese text of Romance of the Three Kingdoms, Gutenberg #23950; line numbers refer to that file. The script checked is `tools/tk_story_w3.py` on `claude/plot-pass`. Drafted by a research helper; the historian re-checked against the text: Taishi Ci's reason to Liu Bei (氣誼相投), Tao Qian recommending Sun Qian and telling Mi Zhu to serve Liu Bei, Ji Ling's 數萬 versus the 十萬 boast, Cao Cao's 3,000 men at Xu and 掘坑待虎 at the end of ch.17, and Zhang Liao's rescue (Liu Bei seizes his arm, Guan Yu kneels). Advice only; no story files changed.

---

# Audit of Book 3 ("White Gate Tower") against the novel, ch.10-20

Script: `tk_story_w3.py`, with script line numbers in parentheses. Novel: `sanguo.txt`, cited as "L" plus line number. I read ch.10-19 and the start of ch.20 in full.

## 1. Counts (approximate tally of about 220 script items: narration, speech, titles, node/place/dilemma text)

| Class | Count |
|---|---|
| FAITHFUL | about 165 |
| ADAPTED | about 32 |
| INVENTED | about 18 |
| WRONG | 5 (all minor; none touches a main-line outcome) |

The main line is very close to the novel. Almost every Chinese speech line that claims to quote the novel matches it character for character, apart from the simplified/traditional swap (讎/雠, 舊/旧, and so on) and some trimming of long sentences. No Chinese quote was changed so as to contradict the novel. The one mismatch between the English and the Chinese is in WRONG #1.

## 2. WRONG findings

| # | Scene / script line | Script says | Novel says | Suggested fix |
|---|---|---|---|---|
| 1 | `horses`, the final Cao Cao speech (L320-321). English: "Go back to Xiaopei. I send you there as a pit is dug for a tiger. Watch Lü Bu, and I will help you from outside." Chinese: 吾令汝屯兵小沛，是"掘坑待虎"之计也。公但与陈珪父子商议，某当为公外援。 | Cao Cao says it at Xu, straight after receiving Liu Bei in flight. The English says "watch Lü Bu", but the Chinese says "consult Chen Gui and his son". | The words are Cao Cao's parting remark at the end of ch.17 (L3150-3153), after the Shouchun campaign: 操密謂玄德曰：「吾令汝屯兵小沛，是『掘坑待虎』之計也。公但與陳珪父子商議，勿致有失。某當為公外援。」 At the first meeting in ch.16 (L2937-2940) Cao Cao does something different: he has Liu Bei appointed 豫州牧 and gives him 兵三千，糧萬斛 to go to Yuzhou and "進兵屯小沛". | Either move the line to after the Huainan campaign, or replace it at Xu with the ch.16 appointment: "I name you Governor of Yuzhou: three thousand men and ten thousand hu, and back to Xiaopei." Make the English match the Chinese ("consult Chen Gui and his son"). |
| 2 | `m7` dilemma open line (L491-496): "The letter comes in the Emperor's name. But Lü Bu came to me with nowhere else to go." | The secret letter is called imperial. | The title came by imperial edict (L2432-2433 奏請詔命…封劉備為…領徐州牧；並附密書一封). The letter is Cao Cao's private letter (L2437 私書). The scene itself (L2441-2445) has Lü Bu read it and say "此乃曹賊欲令二人不和耳". | "The letter is Cao Cao's own, not the Emperor's." (Chinese: 这封密书是曹操私下写的。) |
| 3 | `beihai1`, Taishi Ci's second line (L49-50): 某与孔融亲非骨肉，比非乡党。只因他屡次照看家母，家母命我来救。 | The first half is the novel's own wording; the second half gives "he was kind to my mother" as the reason Taishi Ci gives to Liu Bei. | To Liu Bei he gives a different reason (L1776-1778): 「某太史慈，東海之鄙人也。與孔融親非骨肉，比非鄉黨，特以氣誼相投，有分憂共患之意。…聞君仁義素著，能救人危急」. The mother's kindness is the narrator's account of why he first went to Kong Rong (L1761-1764, 1797-1799). | Keep the first half, then use the novel's own reason: "I came because we share a sense of duty, and because you are known for rescuing men in danger." (只因气谊相投，闻君仁义素著，能救人危急。) Put the mother's story in the narration. |
| 4 | `halberd`, narration (L268-269): "Ji Ling marches on Xiaopei with a hundred thousand men." | The narrator states 100,000 as fact. | The narrator says Ji Ling led 數萬 (L2794 統兵數萬). "十萬" is Ji Ling's own boast at the feast (L2826 提十萬之兵). The defenders had 五千餘 (L2806). | "with tens of thousands of men". Keep "a hundred thousand" only in Ji Ling's line, which is faithful. |
| 5 | `Xuyi` place talk (L643-645): "Ji Ling's blade has three points. Lord Guan says it is heavy for nothing." | Attributes a judgment to Guan Yu. | The novel gives only the blade (L2476 一口三尖刀，重五十斤) and a 30-bout draw (L2478-2479). Guan Yu says nothing about the blade. | Drop "Lord Guan says...". "It has three points, and weighs fifty jin" is enough. (This is closer to INVENTED; listed here because it puts words in a named character's mouth.) |

Smaller points checked and left as ADAPTED (see section 3): the order Zhang Fei and Guan Yu appear in at Xiaopei; Chen Gong, not Lü Bu, catching Liu Bei's letter; Chen Deng at Tao Qian's bedside.

## 3. Notable ADAPTED changes

- **Opening, `beihai1`.**
  - The script says Kong Rong says "only Liu Xuande can save him". In the novel Kong Rong says "if Liu Xuande could be asked, the siege would lift itself" (L1769-1770).
  - Liu Bei's reply 孔北海知世间有刘备耶 is exact (L1779).
  - The "two white-haired men" and their board are an invention of the game.
- **Taishi Ci's exit, `beihai2` (L86-87).** The novel has him go home to his mother, who sends him to Liu Yao (L1797-1800). The script goes straight to "rides south to serve Liu Yao". It is the same event, compressed.
- **`breakthrough`, banners (L98-99).** The white banners 報讎雪恨 are the central army's banners, seen by Tao Qian in ch.10 (L1709), before Liu Bei arrives. Putting them in the scene Liu Bei sees is fine.
- **`breakthrough`, staging.** The novel has Kong Rong tell Liu Bei to hold back, and Liu Bei then splits the force. The script keeps this ("Yunchang, Zilong stay here; Yide and I cut our way in") and has Zhao Yun volunteer a line.
- **`second`.** The novel has Mi Zhu and Chen Deng urge Liu Bei too, and Liu Bei suggest Yuan Shu (L1857-1860); the script omits both. Cao Cao first wants the messenger beheaded and Guo Jia talks him round (L1836-1838). The script compresses this to "rages, then marches away". Lü Bu's raid on Yanzhou arrives by courier mid-meeting (L1840), which the script handles fine.
- **`deathbed`.**
  - "Mi Zhu and Chen Deng, the sharpest of Tao Qian's officers, are at his bed" is ADAPTED. The novel has Tao Qian summon Mi Zhu and Chen Deng to discuss the matter (L1984), and Mi Zhu is the only one named at the bedside (L1994). Chen Deng is not at the bedside, and "sharpest" is the script's own.
  - The novel also has Tao Qian tell Mi Zhu 劉公當世人傑，汝當善事之 (L1994-1995); the script omits it.
  - The Chinese for Liu Bei's "I will hold it, for now" is narrator speech turned into dialogue: 玄德乃許權領徐州事 (L1998-1999).
- **`vow` (L218-219).** "Yuan Shu has already been told that Liu Bei means to attack him" is the novel's 驅虎吞狼 trick. Cao Cao tells Yuan Shu that Liu Bei has sent a secret memorial to seize Nanjun (L2454-2456). Sun Qian's prompt "first decide who holds the city" (L2462) is omitted.
- **`handsfeet`, Zhang Fei's compressed confession (L243-244).** Faithful in its facts, but it differs from the novel in form:
  - In the novel it is narration, not speech (L2521-2522 具說曹豹與呂布裏應外合).
  - Zhang Fei never says he was drunk. The novel's drunkenness (L2491 不覺大醉) is only implied by "one last feast".
  - It omits that he killed Cao Bao, Chen Deng's protest, and that he left the sisters-in-law inside.
  - The details he does give are all in the novel: the feast to swear off wine (L2486-2487), Cao Bao refusing (L2488-2493), the flogging of fifty (L2498), Cao Bao as Lü Bu's father-in-law (L2496-2497), and the gate opened that night (L2508-2509).
- **`halberd`, the framing.** The novel has Lü Bu reply to Liu Bei's letter and pretend to give up Xuzhou again. The script goes straight to "Bend, keep to our place" (L2557 屈身守分，以待天時，不可與命爭也).
- **`scattered`.**
  - Chen Gong, hunting, catches Liu Bei's messenger with the reply to Cao Cao (L3279-3283). The script says "Lü Bu catches the letter".
  - Guan Yu's speech to Zhang Liao is at the west gate (L3300-3302), and the "he is afraid, why not chase him" exchange is at the east gate (L3304-3307). The script merges the two.
  - The reunion order is swapped. In the novel Zhang Fei appears behind Lü Bu at Xiaopei first (L3398-3400); then Guan Yu blocks him on the road (L3402-3405), and Zhang Fei's Mount Mangdang line comes after that (L3405-3406). The script reverses this.
  - Liu An and the wife (L3349-3360) is skipped.
- **`xiapi`.** The script says Chen Deng and his father "shut Lü Bu out of Xuzhou", with Mi Zhu holding it for Liu Bei (L355-356). In the novel Chen Deng tricks Lü Bu at Xiaoguan (L3378-3388), and Mi Zhu, on the wall, refuses him and claims to have killed Chen Gui (L3389-3391). Lü Bu then goes to Xiaopei and is driven east, meeting Guan Yu and Zhang Fei (L3394-3406). The script's summary is acceptable.
- **`breakout`.** "Arrows fly from every side" (L402) is the script's. The novel has the troops blocking and shouting: 眾軍皆大叫曰：「不要走了呂布！」(L3484). Lü Bu retreats because he fears for his daughter (L3482-3483), which the script keeps.
- **Place talk, Xiaopei (L650).** "We had Lü Bu here, then Lord Liu, then Lü Bu's men again." This leaves out Liu Bei's first stay (ch.11) before Lü Bu came (ch.13).
- **Closing scroll (L552-553).**
  - Xun Yu and others raised the matter openly (L3604 荀彧等一班謀士入見曰), not in whispers.
  - Cao Cao did not "only smile". He gave reasons (L3605-3607), then removed Yang Biao and killed Zhao Yan (L3607-3611). Cheng Yu then urged him to move, and he proposed the hunt (L3612-3613).
  - Fix: "Cao Cao answered that a man the Emperor called uncle could be commanded in the Emperor's name, and then he asked the Emperor to go hunting."
- **Zhang Liao's rescue, `whitegate` (L449-452).** Faithful, except that the novel gives Liu Bei a spoken line, 此等赤心之人，正當留用 (L3579), which the script omits. The script's `玄德攀住臂膊，云长跪于面前` and Guan Yu's line 关某素知文远忠义之士，愿以性命保之 are verbatim (L3578-3580).

## 4. INVENTED items (nearly all game devices; none conflicts with the novel)

- The Star Lords (the two white-haired men), their dialogue and the boards: L53-57, L368-373. All of `rock3`, `roadearly` and `roadearly2`.
- Posting Guan Yu on the west and Zhang Fei on the east of the road (L374-375, L385; places L662-671). The novel only has Liu Bei warn them: 我等正當淮南衝要之處。二弟切宜小心在意，勿犯曹公軍令 (L3470-3472). The "road with holes in it" line (L362) is the script's.
- Zhao Yun's line 常山赵云，愿随使君同往 (L96). In the novel he is lent by Gongsun Zan (L1804).
- The Pingyuan villager line (L622-624).
- "Lord Guan says it is heavy for nothing" (see WRONG #5).
- "Cao Cao only smiled" (see section 3). Chen Deng's role at Tao Qian's bed (see section 3).
- The hint and objective text for the shrine and road nodes (L503, L506-508, L673-676), the card `taunt` (L511), and the `dilemma` wording in general. All of it is gameplay text.

## 5. Novel events skipped that matter

- Chen Gong's plea to Cao Cao for Tao Qian (L1697-1703). It sets up his later break with Cao Cao and the line 汝心术不正 at the White Gate. The script does not mention it, so a first-time reader has no idea why Chen Gong left.
- The Puyang fire (L1963-1971), which Zhang Liao's insult 可惜当日火不大 refers to (L448). The script has no scene, so the line has no setup.
- Chen Gui and Chen Deng's betrayal at Xiaoguan and Xuzhou (L3378-3391), reduced to a summary line.
- Liu Bei as 豫州牧 with 3,000 men and 10,000 hu (L2937-2940), the Yuan Shu "emperor" campaign, and Liu Bei's killing of Han Xian and Yang Feng (L3108-3112).
- Liu An killing his wife to feed Liu Bei (L3349-3360), skipped.
- Gao Shun silent at the White Gate and executed (L3539-3540).
- Lü Bu's wine ban, the flogging of Hou Cheng, and the real cause of the betrayal (L3499-3516). The script says only "his own officers" bound him.
- Chen Gong's last words, with their reference to 以孝治天下 (L3544-3545). The script keeps the line but trims it.
- Cao Cao's 割髮代首, Dian Wei's death, Xiahou Dun eating his eye, and Taishi Ci's duel with Sun Ce. These are in the couplets but have no scenes.

## 6. Direct answers

**(a) Tao Qian's deathbed and who he recommends.** The script is faithful. Tao Qian recommends Sun Qian of Beihai, courtesy name Gongyou, as 從事 (L1993-1994). He does not recommend Mi Zhu. Mi Zhu is his existing aide, and the novel only has Tao tell Mi Zhu to serve Liu Bei (L1994-1995, omitted in the script). He says his sons Shang and Ying are unfit (L1992). He dies pointing at his heart (L1997), and the people of Xuzhou then press Liu Bei to take it (L1998-2000). Script L155-166 matches. The one adaptation is Chen Deng at the bedside (section 3).

**(b) The vow scenes and the Xuyi scenes.** The scenes are faithful (script L218-233 and L236-262; novel L2459-2535).
- Vow: the Chinese lines are close to verbatim.
- Xuyi: Ji Ling (three-pointed blade, thirty bouts, L2476-2479) is correct. Zhang Fei's arrival, "得何足喜，失何足忧" (L2522), Guan Yu's rebuke (L2523-2524), the attempted suicide (L2524-2525) and Liu Bei's "hands and feet" speech (L2531-2534) are verbatim.
- Ji Ling's "hundred thousand" is the narrator's number in the script only (WRONG #4).

**(c) Zhang Fei's compressed confession.** The cause is told correctly (see section 3). It is ADAPTED, not WRONG. What is missing is his own drunkenness, which he never states, and the killing of Cao Bao.

**(d) The order of events at the White Gate Tower.** The script's order matches the novel (L3533-3569): Cao Cao and Liu Bei sit side by side with Guan Yu and Zhang Fei standing; Lü Bu says 缚太急; Cao Cao says 缚虎不得不急; Chen Gong is brought in and questioned; as Chen Gong walks down, Cao Cao orders his family cared for; Lü Bu pleads with Liu Bei; Lü Bu offers service to Cao Cao; Liu Bei makes his remark; Lü Bu curses him and is strangled; Zhang Liao is brought in and reviled Cao Cao; Cao Cao draws his sword; Liu Bei and Guan Yu plead; Cao Cao laughs and Zhang Liao yields (L3579-3582). The script omits Gao Shun (executed after Lü Bu's officers, before Chen Gong, L3539-3540).

**(e) Zhang Liao's rescue.** Cao Cao draws his sword to kill him himself (L3571-3572). Liu Bei seizes his arm from behind and Guan Yu kneels before him (L3572-3573, L3579). Liu Bei says 此等赤心之人，正當留用 and Guan Yu says 關某素知文遠忠義之士，願以性命保之 (L3579-3580). Cao Cao throws the sword down and says 我亦知文遠忠義，故戲之耳 (L3580-3581), frees him and gives him a robe, and Zhang Liao yields. The script shows both pleaders. It omits Liu Bei's line and Cao Cao's gift of a robe.

**(f) Does Book 3 open correctly at Pingyuan?** Yes.
- Guan Hai, a Yellow Turban chief, besieged Kong Rong at Beihai (L1751-1756).
- Taishi Ci was from Huang County, Donglai (東萊黃縣人, L1761). Kong Rong had sent grain to his mother. He fought through the besiegers (L1771-1773) and "星夜投平原來見劉玄德" (L1775).
- Liu Bei's title at that point is 平原相 (L1825: 為平原相猶恐不稱職). His banner reads 平原劉玄德 (L1819).
- He took 3,000 men and Guan Yu and Zhang Fei, as the script has it (L1779).
- The script's "Liu Bei is chancellor of Pingyuan" is correct. WRONG #3 concerns only the reason Taishi Ci gives to Liu Bei.

**(g) Chen Gong's loyalty, Lü Bu begging, Liu Bei's remark, and the offers.**
- Chen Gong stays loyal to Lü Bu to the end. He refuses Cao Cao's offer, walks down to his death, and Cao Cao spares his family (L3540-3548). The script keeps this.
- Lü Bu begs twice. First he asks Liu Bei for one word (公為坐上客，布為階下囚，何不發一言而相寬乎, L3555). Then he offers to serve Cao Cao (L3556-3557). Both are in the script.
- Liu Bei's remark is 公不見丁建陽、董卓之事乎 (L3557-3558). Ding Jianyang is Ding Yuan, Lü Bu's first master. The script's wording is faithful.
- Tao Qian offers Xuzhou three times in ch.11-12.
  1. At first meeting, with the seal (L1822-1827).
  2. At the victory feast after Cao Cao withdraws (L1854-1858).
  3. At his deathbed (L1989-1998).
  The novel itself counts them: 府君兩番欲讓位 (L1985), and the ch.12 title is 陶恭祖三讓徐州. The script's three scenes (`breakthrough`, `second`, `deathbed`) match.
- Liu Bei's own offers to Lü Bu (ch.13, L2105; ch.15, L2556) are separate from the three.
