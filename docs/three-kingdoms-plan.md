# 三国演义 · Romance of the Three Kingdoms — campaign plan

A story campaign that plays through the whole novel as an explorable world,
where the objectives are cleared by solving Go problems. Think of how
Pokémon went from simple 2D to open 3D with the same core logic: the story,
quests and puzzle rules here are data, separate from the graphics, so the
same campaign can be shown first as a simple top-down 2D world (GBA
Pokémon style) and later as something larger and more open (Genshin
Impact style), without rewriting the story.

World 1 opens in explorable Zhuo County (`tk-town.js`, mounted in the
campaign page's map box), where the notice and the Peach Garden oath are
played on foot; the original node map (`tk.js`) stays as the overview and
carries the rest of the world until those places are built. The explorable
world is the direction from here on.

## Scope

The whole novel, all 120 chapters: 16 campaign worlds covering chapters
1–104, ending at Zhuge Liang's death at Wuzhang Plains, plus one short
epilogue world for chapters 105–120, so the story is complete without the
novel's slow final stretch dragging on.

## Worlds

| # | World | Ch. | Boss | Story hooks |
|---|---|---|---|---|
| 1 | The Peach Garden Oath | 1–2 | Zhang Bao, General of Earth | The oath; the first battles against the Yellow Turbans; Zhang Fei whips the inspector |
| 2 | Hulao Pass | 3–9 | **Lü Bu** (escapes, returns later) | Cao Cao's gifted-sword plot; the three brothers against Lü Bu; Diaochan and the chain scheme |
| 3 | White Gate Tower | 10–19 | **Lü Bu**, final fight at flooded Xiapi | Lü Bu's shot at the halberd; Xu Province handed over three times |
| 4 | The Thousand-Li Ride | 20–28 | Cai Yang at the Old City | Guan Yu's five passes and six generals; the brothers reunited |
| 5 | Guandu | 29–33 | Yuan Shao | The brothers are scattered; **played as Cao Cao**; burning the grain at Wuchao |
| 6 | The Three Visits | 34–38 | **Zhuge Liang's test**: persuading him is the boss | Dilu leaps the Tan stream; three trips to the thatched cottage |
| 7 | Changban | 39–42 | Cao Cao's cavalry | Fire at Bowang and Xinye; Zhao Yun saves the baby heir; Zhang Fei holds the bridge |
| 8 | Red Cliffs | 43–50 | Cao Cao's chained fleet | Debating Wu's scholars; borrowing arrows; Huang Gai's ruse; the east wind |
| 9 | Three Provocations of Zhou Yu | 51–57 | Zhou Yu | The marriage trap; Zhou Yu angered three times |
| 10 | Into Shu | 58–65 | Ma Chao (then joins) | Cao Cao cuts his beard to escape; Pang Tong falls at Fallen Phoenix Slope |
| 11 | Hanzhong | 66–73 | Xiahou Yuan at Dingjun Mountain | Guan Yu's feast with only his sword; old Huang Zhong's charge |
| 12 | The Fall of Guan Yu | 74–77 | Lü Meng | Flooding the seven armies; the Go game during the bone-scraping; Maicheng |
| 13 | Yiling | 78–86 | Lu Xun | 700 li of camps burned; the Stone Sentinel Maze; Liu Bei entrusts his son |
| 14 | The Southern Campaign | 87–91 | Meng Huo | The seven captures; elephant beasts; rattan armour |
| 15 | Jieting and the Empty Fort | 91–98 | **Sima Yi** (returns) | Ma Su loses Jieting; the Empty Fort; the tearful execution |
| 16 | Wuzhang Plains | 99–104 | **Sima Yi**, the final boss | Wooden oxen; Shangfang Valley; Zhuge Liang's death and the wooden statue |
| E | The Three Return to One | 105–120 | Deng Ai | Jiang Wei carries on; Deng Ai through Yinping; Jin unites the realm |

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
- **Bosses** are the world's antagonist on a Michael Redmond problem (early
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
3. Write its scenes, scrolls and boss in `tools/tk_story.py`, and the Chinese
   for every line in `tools/tk_story_zh.py` (cast any new characters).
4. Lay out its locations (a builder script drafts them; fine-tune by hand)
   and add any new character descriptions.
5. Run `tools/build_tk_voice.py`, then the build scripts.

## Open questions

- How many encounters each objective needs (one problem, or a short series).
- Three-way choices for the biggest moments (Red Cliffs).
- Rewards such as relics for beating bosses (the Imperial Seal, the feather fan).
- The book's final name and Library card.
