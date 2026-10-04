# 三国演义 · Romance of the Three Kingdoms — campaign plan

A story campaign that plays through the whole novel as an explorable world,
where the objectives are cleared by solving Go problems. Think of how
Pokémon went from simple 2D to open 3D with the same core logic: the story,
quests and puzzle rules here are data, separate from the graphics, so the
same campaign can be shown first as a simple top-down 2D world (GBA
Pokémon style) and later as something larger and more open (Genshin
Impact style), without rewriting the story.

World 1 is explored on foot inside the campaign page: the map factory
(`tools/mapfactory`, `docs/map-format.md`) builds its 17 places from the plot,
`tk-world.js` plays them, and each quest or challenger opens the real problem.
The original node map (`tk.js`) stays as the overview.

## Scope

The whole novel, all 120 chapters: 16 campaign worlds covering chapters
1–104, ending at Zhuge Liang's death at Wuzhang Plains, plus one short
epilogue world for chapters 105–120, so the story is complete without the
novel's slow final stretch dragging on.

## Emotional design

1. **One emotional spine per world.** A relationship, a loyalty, a loss or a choice. The battle serves it.
2. **Quiet scenes are the main quests.** Each world has 2–3 character scenes (a farewell, a reunion, a funeral, a refusal). Battles shrink to one short set piece, or none.
3. **Bosses become reckonings.** A boss is the person the world's tension is with, met across a board. A battle boss is the exception.
4. **Go carries the weight.** For peak moments the board is the scene: the problem is solved while the moment plays, and the Star Lords are present or deliberately absent.
5. **Callbacks.** Lines and images return across worlds (the oath, the peach blossom, Dilu, the chopsticks), so late deaths land on early scenes.
6. **Cut-scene length rule.** Peak scenes can run longer than 40 seconds; battles stay short.

## Worlds

Each world has one emotional spine. Battles are kept short and some worlds have none; chapter ranges are in the difficulty table's order (World 1: ch. 1–2, 2: 3–9, 3: 10–19, 4: 20–28, 5: 29–33, 6: 34–38, 7: 39–42, 8: 43–50, 9: 51–57, 10: 58–65, 11: 66–73, 12: 74–77, 13: 78–86, 14: 87–91, 15: 91–98, 16: 99–104, E: 105–120).

| # | Spine | Emotional beats (main) | Battle (kept short) |
|---|---|---|---|
| 1 Peach Garden | Strangers become brothers | The sigh at the notice; the oath; Zhang Fei's rage at the inspector, his loyalty shown as anger | Daxing Mountain |
| 2 Hulao Pass | Ambition has a price | Cao Cao at Lü Boshe's house, "rather I betray the world" (ch4); Guan Yu and the wine still warm (ch5); Diaochan's choice and Dong Zhuo's fall (ch8–9); Lü Bu kills Ding Yuan (ch3) | Three brothers vs Lü Bu |
| 3 White Gate Tower | Loyalty and its limits | Tao Qian offers Xu Province three times; Chen Gong's loyalty to the end; Lü Bu begs, and Liu Bei's quiet remark about Ding Yuan and Dong Zhuo (ch19) | none (Xiapi flood as backdrop) |
| 4 Thousand-Li Ride | Faith kept at a cost | Plum wine and the chopsticks dropped at the thunder (ch21); Cao Cao's gifts and Guan Yu's refusals; Zhang Fei doubts him at Gucheng; the reunion | Five passes, abbreviated |
| 5 Guandu (as Cao Cao) | The lonely ruler | Xu You's defection; Cao Cao burns the letters of his own officers who wrote to Yuan Shao (ch30), choosing not to know; Wuchao is the quiet climax | Wuchao fire |
| 6 Three Visits | Patience and parting | Liu Bei's lament over his thighs growing fat (ch34); Xu Shu leaves for his mother's forged letter (ch36–37); the snowy third visit | none |
| 7 Changban | What a leader will not abandon | Liu Bei refuses to leave the refugees (ch41); Lady Mi gives Zhao Yun the baby and drowns herself in a well (ch42); Liu Bei throws the child down ("to console a baby I'd lose a general") | Zhang Fei at the bridge |
| 8 Red Cliffs | Respect between enemies | Zhuge Liang and Zhou Yu's uneasy alliance; Lu Su's friendship; Huang Gai takes a beating for the plan; Cao Cao's poem before the battle; **Huarong Road: Guan Yu lets Cao Cao go** (ch50) | The fire |
| 9 Zhou Yu | Rivalry that was also recognition | Sun Shangxiang's courage and her marriage; "Since Yu was born, why Liang?" and Zhuge Liang weeping at the funeral (ch57) | none |
| 10 Into Shu | Taking what isn't yours | Liu Bei's reluctance toward his kinsman Liu Zhang; Ma Chao's revenge for his murdered family; Pang Tong's death at Fallen Phoenix Slope; Zhuge Liang's grief | Fallen Phoenix Slope, short |
| 11 Hanzhong | Who sets the board | Yang Xiu killed over "chicken ribs" (ch72), Cao Cao's paranoia; **Guan Lu and Zhao Yan: the Star Lords are named** (ch69); old Huang Zhong | Dingjun Mountain |
| 12 Fall of Guan Yu | Pride, and a hero alone | The bone-scraping Go game (ch75) as the centrepiece problem; Guan Yu's last stand at Maicheng; Cao Cao honours the head with a funeral and weeps; the Star Lords are silent | Flooding the seven armies, abbreviated |
| 13 Yiling | The oath comes due | Zhang Fei killed by his own men (ch81); Liu Bei's revenge and ruin; the White Emperor City, the son entrusted, "if he is no good, take the throne yourself" (ch85); callbacks to the Peach Garden | Burning the camps, abbreviated |
| 14 Southern Campaign | Mercy and its cost | Seven captures, one problem each; **Zhuge Liang burns the rattan-armoured soldiers and weeps: "I have shortened my life"** (ch90) | none |
| 15 Jieting | Duty over love | Jiang Wei's defection; Ma Su's mistake; the Empty Fort; the tearful execution (ch96); Zhuge Liang demotes himself | Empty Fort is a standoff, not a fight |
| 16 Wuzhang | Spending the last years | Letters and the wooden oxen; the star prayer as seven nights of problems (ch103), the lamp knocked out by Wei Yan; the Star Lords refuse; the wooden statue frightens Sima Yi | none |
| E Epilogue | Long united, must divide | Jiang Wei carries on; Liu Shan, "I am happy here" (ch119); Jin unites the realm and the ch. 120 line answers the opening scroll; the Star Lords keep playing | Deng Ai through Yinping, brief |

Each world's chapters are read in full before its story is written.

## Difficulty

Problems start at 12K (anything easier is skipped) and climb about one grade
per world to 7D:

| World | Grades | | World | Grades |
|---|---|---|---|---|
| 1 | 12K | | 10 | 2K |
| 2 | 11K | | 11 | 1K |
| 3 | 10K–9K | | 12 | 1D |
| 4 | 9K–8K | | 13 | 2D |
| 5 | 8K–7K | | 14 | 3D |
| 6 | 7K–6K | | 15 | 4D–5D |
| 7 | 6K–5K | | 16 | 5D–6D |
| 8 | 5K–4K | | E | 6D–7D |
| 9 | 4K–3K | | | |

Within a world, levels climb from the bottom of its range to the top.

## Why Go is in the game: the Star Lords

The one fantasy layer added to the novel, and it comes from the novel
itself. In chapter 69 the diviner Guan Lu tells the doomed youth Zhao Yan to
bring wine to two old men playing weiqi under a mulberry tree: the Star
Lords of the Northern Dipper, who records deaths, and the Southern Dipper,
who records lives. Pleased, they change his allotted years from 19 to 99.
Gods of fate, deciding lives over a Go board.

- **From World 1**, two nameless old men appear at shrines, under old trees,
  in teahouse corners. They watch Liu Bei's fate and set him Go problems.
- **Each solved problem earns their counsel**, and the counsel is the tactic
  that wins the next story beat (the ambush at Qingzhou, the pig's blood
  against Zhang Bao's sorcery), told in dialogue.
- **The link is loose**: the problem is any problem of the right grade, not
  one picked to mirror the tactic, so it scales across 120 chapters.
- **Their names stay a mystery until World 11.** Guan Lu appears where the
  novel puts him (chapter 69, around 219), tells the Zhao Yan story, and
  the player learns who has been setting the puzzles all along.
- **They change small fates, not the great ones.** They can rewrite a life,
  as they did for Zhao Yan, but the great fates are Heaven's mandate (天命)
  and they won't touch those. Solving never changes what happens in the
  novel: Guan Yu still falls at Maicheng.
- **This becomes an arc across the campaign:**
  - **Early worlds:** they help with counsel and nudge small things, never
    the big ones.
  - **World 11:** Guan Lu tells the Zhao Yan story; the player learns who
    they are, and that they *can* change a life.
  - **Worlds 12–13:** the obvious question, why they don't save Guan Yu,
    Zhang Fei and Liu Bei, gets their answer: those fates are Heaven's.
  - **World 16:** in chapter 103 (五丈原诸葛禳星) the dying Zhuge Liang
    prays to the Northern Dipper for twelve more years; if his main lamp
    burns for seven nights the prayer works. On the sixth night Wei Yan
    bursts in and knocks it out. "Life and death are fated; prayer cannot
    change them." The gods of the Go board refuse him, and this is the
    campaign's emotional peak.
- **They are silent at the great deaths.** At Guan Yu's, Zhang Fei's and Liu Bei's deaths the board is on screen and the Star Lords say nothing. One line from them closes ch. 120.
- **Why Zhuge Liang's prayer is refused:** he is the last pillar of the Han, so his life is part of the mandate, unlike Zhao Yan's small, personal change.
- Optional: the legend of Wang Zhi, the woodcutter who watched two immortals
  play Go until his axe handle rotted (烂柯, a poetic name for Go), as a
  hidden side area.

## The world

- **A world is a region of connected locations** (World 1: Zhuo County, the
  Peach Garden, the road to Daxing Mountain, Qingzhou, the camps, Yangcheng).
  Locations come from where the chapter's events happen; roughly 3–6 small
  maps per chapter range.
- **Main quests follow the novel's order.** Each main story point is an
  objective ("Find the man who sighed at the notice", "Lift the siege of
  Qingzhou"); finishing it opens the next. No route can skip the main story.
- **Each objective is cleared through Go problems** set by the Star Lords
  or by challengers (rebels, rival officers, a general testing you), the way
  Pokémon trainers challenge you. Chapter bosses are the gyms.
- **Optional routes keep the old difficulty shortcuts**: an easier road with
  more problems at the region's grade, or a single hard problem (about 4
  grades harder) that opens a gate or a mountain pass.
- **Side stories are side quests** from people you meet, often told from
  another angle (Cao Cao's youth from a teahouse storyteller, Zhang Jiao's
  rise from a Yellow Turban deserter). Nothing in the main story depends on
  them.
- **The party** follows you and changes with the story: Liu Bei alone, then
  the three brothers, Zhao Yun joins, Zhuge Liang joins and leads from World
  6, heroes leave when they die (Guan Yu after World 12, Zhang Fei and Liu
  Bei in World 13), Zhuge Liang walks alone through World 16, and Jiang Wei
  carries the epilogue.
- **Wukong stays the site mascot**: hidden while exploring, free to roam Go
  boards, under the usual header toggle.

## Problems

- **Flawless only.** A wrong move, hint, undo or Explore is a slip; a
  problem settles on its first result, and a reset can't undo a slip.
- **A slip draws a new problem** of the same grade from that encounter's
  pool (about 30), so the story never stalls.
- **Bosses** are either a reckoning or a battle. Where the tension is a person (Zhuge Liang's test in World 6, Zhou Yu in World 9, Meng Huo in World 14) the boss is a conversation across the board; where the antagonist is real (Lü Bu, Sima Yi) it is a rival. Each is the world's antagonist on a Michael Redmond problem (early
  worlds) or a Maeda problem (later). The boss shows a portrait and taunt and
  doesn't name the problem's source.
- **Talking to a challenger opens the board**; finishing returns you to the
  world, where the story continues.

## Story delivery

A mix, sized to importance:

| Moment | Delivery |
|---|---|
| World opening and ending | Storyteller scroll: the novel's chapter titles, and its cliffhanger line ("hear the next chapter") |
| Main story points | Cutscene in the location (characters walk and act, effects) plus portrait dialogue |
| Peak moments | Longer than 40 s, played with the board visible, not skippable on first viewing; the problem is solved while the moment plays |
| Side quests | Dialogue with the people involved, short |
| Boss | Portrait and taunt before the problem, a defeat scene after |

Scenes are 20–40 seconds with a Skip button, play in the world (never on
the problem page), and can be replayed from the **Chronicle**, which lists
every main and side story in order and hides the ones not yet seen.

Scenes are written as a list of steps (narrate, say, walk to a spot, play an
effect, change the party), placed at named spots in a location, so the
scenes written for the node map carry over.

## Voice-over

- Every line is voiced in Mandarin, with the Chinese shown under the English.
  Lines taken from the novel keep its wording; the rest is modern Mandarin.
- **Narrator**: a woman's voice (Kokoro `zf_027`, standard accent) reads
  narration and scrolls.
- **Characters** each have their own voice, matched by gender and by pitch
  and pace; the cast is in `tools/tk_story_zh.py`.
- Clips are rendered once by `tools/build_tk_voice.py` (Kokoro, open-source,
  Apache-2.0) and named after what is spoken, so editing a line regenerates
  only that clip. A pronunciation table fixes characters the model misreads
  (长社 cháng, 将军 jiàng, 为 wéi, …).
- A Voice on/off button sits beside the Chronicle.

## Art

- **Now: simple top-down 2D**, GBA Pokémon style. Later: a larger, more
  open look, possibly low-poly 3D, reading the same story and quest data.
- **Characters are drawn in code** from a short description (skin, hat,
  beard, robe, weapon), so any hero, general or townsperson can be made in
  one consistent style, for free.
- **Terrain and buildings from free packs**: the **Jade Tileset** (Willibab,
  CC-BY), **GameTorch Eastern Fantasy Mountains** (CC0) for key visuals and
  props, and CC0 packs such as Kenney's for generic terrain. Anything missing
  is drawn in code. Credits live on the Feedback tab.
- No AI-trained art packs: free packs plus code-drawn art is cheaper and
  more consistent.
- Characters stay historically grounded: ordinary skin tones for everyone
  (Zhang Fei's black face is opera face paint, not skin colour); Guan Yu's red
  face is kept because the novel describes it.

## Adding a world

1. Read the world's chapters in full.
2. List its locations, and for each main story point an objective, a place
   and the encounters that clear it; turn side episodes into side quests.
2b. **Check the seams.** Each scene must start where the last one ended: who the party is with, where they are, why they came. If the novel has a meeting, a summons or a journey between two scenes (World 1: Liu Yan adopting Liu Bei, the plea from Qingzhou, Lu Zhi's camp, arriving at Zhu Jun's camp), put it in as a line or two of narration at the start of the next scene. Check by reading each scene's first lines against the previous scene's last.
3. Write its scenes, scrolls and boss in `tools/tk_story.py`, and the Chinese
   for every line in `tools/tk_story_zh.py` (cast any new characters).
4. Lay out its locations (a builder script drafts them; fine-tune by hand)
   and add any new character descriptions.
5. Run `tools/build_tk_voice.py`, then the build scripts.

## Open questions

- How many encounters each objective needs (one problem, or a short series).
- Choices at the biggest moments: keep Red Cliffs linear; choices affect only dialogue or rewards, never the novel's events.
- Rewards such as relics for beating bosses (the Imperial Seal, the feather fan).
- The book's final name and Library card.
