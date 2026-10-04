# 三国演义 · Romance of the Three Kingdoms — campaign plan

A story campaign that plays through the whole novel on an overworld map,
one Go problem per level. This is the agreed plan; World 1 is built and live
(`tk.js`, `data/tk.json`, `tools/tk_story.py`).

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

## The map

- **The story runs in order, separate from the map.** Problems are never
  tied one-to-one to story beats.
- **Main story points sit on the fixed nodes**: the ones every route passes
  through, i.e. the node before each fork and the node after each merge. So
  no route can skip the main story.
- **Forks are difficulty shortcuts.** At a fork, both roads lead to the same
  next main story point:
  - the **long road**: 2–3 levels at the world's grade;
  - the **shortcut**: one level about 4 grades harder (two 12K levels or one 8K).
  You can walk back and take the other road, or replay it later.
- **Side roads carry side stories.** The long road tells one side story in
  2–3 parts; the shortcut tells a different one in a single scene, usually
  from another angle (the enemy's side, a minor character). Side stories
  fall between their fork and merge in the timeline and nothing in the main
  story depends on them.
- **Map size follows the plot**: a world gets as many fixed nodes as it has
  main story points (about one per chapter on average), so busy worlds like
  Red Cliffs are bigger. Roughly 100 fixed nodes and 70 side-road nodes across
  the campaign.
- **The party** walks the map and changes with the story: Liu Bei alone,
  then the three brothers, Zhao Yun joins, Zhuge Liang joins and leads from
  World 6, heroes leave the line when they die (Guan Yu after World 12, Zhang
  Fei and Liu Bei in World 13), Zhuge Liang walks alone through World 16, and
  Jiang Wei walks the epilogue.
- **Wukong stays the site mascot**: he's hidden on the overworld map and can
  roam level boards, controlled by the usual header toggle.

## Levels

- **One problem per level, flawless only.** A wrong move, hint, undo or
  Explore is a slip; a level settles on its first result, and a reset can't
  undo a slip.
- **A slip draws a new problem** of the same grade from the level's pool
  (about 30 problems), so the story never stalls.
- **Bosses** are the world's antagonist, played on a Michael Redmond problem
  in the early worlds and a Maeda problem later. The boss level shows the
  boss's portrait and taunt; it doesn't name the problem's source.
- **Entering a level zooms in** from the map node; finishing zooms back out,
  and the story point for that node plays on the map.

## Story delivery

A mix, sized to importance:

| Moment | Delivery |
|---|---|
| World opening and ending | Storyteller scroll: the novel's chapter titles, and its cliffhanger line ("hear the next chapter") |
| Main story points | Short map cutscene (sprites move, effects) plus portrait dialogue |
| Side stories | Dialogue only, short |
| Boss | Portrait and taunt before the problem, a defeat scene after |

Scenes are 20–40 seconds with a Skip button, play only on the map (never on
the problem page), and can be replayed from the **Chronicle**, which lists
every main and side story in order and hides the ones not yet seen.

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

- **Jade Tileset** (Willibab, CC-BY) for terrain, buildings and walls, and
  **GameTorch Eastern Fantasy Mountains** (CC0) for key visuals and props;
  anything missing is drawn in code. Credits live on the Feedback tab.
- Characters stay historically grounded: ordinary skin tones for everyone
  (Zhang Fei's black face is opera face paint, not skin colour); Guan Yu's red
  face is kept because the novel describes it.
- Planned: a scrolling map at Jade's natural tile size that follows the
  party, with a zoom-out to see the whole world.

## Adding a world

1. Read the world's chapters in full.
2. Write its map, main story points, side stories, scrolls and boss in
   `tools/tk_story.py`, and the Chinese for every line in `tools/tk_story_zh.py`
   (cast any new characters).
3. Add its art in `tk.js` (`TK_ART`) and any new character sprites (`TK_CHARS`).
4. Run `tools/build_tk_voice.py`, then `tools/build_tk.py`.

## Open questions

- Side-road nodes beyond World 1: keep every side road a side story, or
  allow plain problems on some.
- Possible three-way forks for the biggest moments (Red Cliffs).
- Rewards such as relics for beating bosses (the Imperial Seal, the feather fan).
- The book's final name and Library card.
