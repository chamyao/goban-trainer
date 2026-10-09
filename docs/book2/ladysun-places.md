# Lady Sun's marriage: places

These are the maps for `docs/book2/ladysun-arc.md` (novel chapters 54–55). They are written as plan grids in
`tools/tk_plans_ls.py`, in the format of `docs/book2/plan-grid.md`. Previews are in `docs/book2/plans-ls/`. Every Chinese
line (labels, goals, townsfolk) is plain modern Mandarin in simplified characters, as the user asked for this book.

    python3 tools/check_plans_w2.py --arc ls --png        # 13 plans, 0 errors; every beat s1–s15 has its spot
    python3 tools/mapfactory build --world 15 --plans ls  # with Plot's WORLD2_LS (claude/plot ddbfd87c)
    python3 tools/proofs/ladysun_ls.py                    # the temple corridors, the face-down, the loud town

The arc is Book 15 (`ARCS[15] = "ls"`, beat keys `4-s1` … `4-s15`). Built with Plot's story, all 14 maps compile in all
three kits and pass the door checks, and all 15 scenes are staged.

## Chaisang (s1)
Zhou Yu's seat on the river. Only the cutaway s1 is played here, in his hall (`zy-hall`). The town isn't walked.

## Jingzhou (s2)
Liu Bei's walled city. Zhao Yun starts on the steps of the government hall (spot `hall-steps`, the map's entry). In the
hall (`jz-hall`) there is room for the scene: Zhuge Liang behind the folding screen (13 tiles east, 7 north of the spot),
and Lü Fan coming in from the door (24 east).

## Nanxu (s3, s4, s9; rooms for s4, s7, s8, s10, s11, s12)
Sun Quan's walled city on the south bank. Its west gate opens onto the road to Chaisang, and its east gate onto the riding
ground and the road up to Sweet Dew Temple.
- **The dock** (spot `dock`, where s2's handoff lands) is outside the river gate, with a jetty and two boats from
  Jingzhou. s3 is by it.
- **The loud town (s3 → s4).**
  - 12 houses, the wine shop and the notice board at the crossroads carry `"news": true`: red hangings go up at a house
    once the news reaches it.
  - 12 townsfolk carry `"tell": true` and a `"home"`. Each has a line before and a line once told (`"told"`).
  - The news has to reach **Lady Wu's gate** (spot `wu-gate`). Her palace door is `open_to: mark:news_wu`, and before
    that it refuses with Plot's line: "Lady Wu's gate is quiet. The news hasn't reached her yet."
  - Proved: going house to house, each step no more than 20 tiles of walking, the news gets from the dock to her gate
    (dock → h1 → h2 → h3 → the wine shop → the notice board → h4 → h5 → the gate).
  - For the errand: spots `lamb` (the mutton seller in the market), `wine` (the wine shop's door) and `qiao-gate`
    (Qiao Guolao's gate).
- **Rooms:**
  - Lady Wu's hall (`wu-hall`: s4, s11). Sun Quan comes in from the door 20 tiles east of s4.
  - Sun Quan's hall (`sq-hall`: s8, s12).
  - The east palace (`east-palace`: s10), a walled court with the bridal room (`bridal-room`: s7) on its west side and
    the maids' quarters on its east.
- **The riding ground** (s9) is outside the east gate, with archery targets.
- **States:**
  - `arrival` (until s3);
  - `news` (s3 → s4), when the townsfolk who can be told are out;
  - `wedding` (s4 → s8);
  - `winter` (s8 → s11): weather `snow`, which needs the engine;
  - `newyear` (from s11, morning).

## Sweet Dew Temple (s5, s6)
A walled temple on a hill above the river.
- **The way in:** the way up from Nanxu comes in at the south gate, into the front court. The front court holds s6: the
  scene sets the great rock 4 tiles east and 2 north of the spot, and the court is open there.
- **The abbot's hall** (`gl-abbot`: s5) stands at the back. It can be reached only down the two side corridors, which
  are walled off from its court and open into it only at their far ends. An axeman stands in each
  (「雲於廊下巡視，見房內有刀斧手埋伏」), in state `feast` (until s5).
  - Proved: there is no way to the abbot's door without passing within 3 tiles of an axeman.
- **Rein-In Slope:** the north gate opens onto the slope down to the river (spot `slope-top`), where the horses are.

## The road to Chaisang (s13, s14)
The road under the hills from Nanxu (west) to Liulangpu (east).
- **s13:** Xu Sheng and Ding Feng block the mouth of a defile, ahead (east) of s13's spot.
- **The face-down (s13 → s14):** past the block, the road narrows between the hills. Two ranks of three men (Chen Wu's,
  then Pan Zhang's) stand across it with `"yield": true`, `"in_beats": ["4-s14"]`, a line each (`"yield_say"`), and
  `"back_to": "block-start"` (the spot where the block stood).
  - Proved: no way gets past either rank without coming within 3 tiles of one of its men.
- **s14:** open road beyond the ranks, with room ahead (east) for the four generals.

Note for Plot:
- At s13, the block is staged ahead of the spot (+16, +22): the way she's going.
- At s14, the four generals are staged ahead too (+12, +18), though in the text Chen Wu and Pan Zhang come up from
  behind. On this map, behind is west (−x). If you want them behind her, flip s14's offsets.

## Liulangpu (s15)
A riverbank with no ferry. The river starts 6 tiles below the spot, so the scene's boats (−10, +6) are on the water,
and Zhuge Liang (−10, +4) is on the bank's edge. Zhou Yu's fleet comes along the river (+20, +6). Guan Yu comes out of
a valley in the hills to the north-east (+14, −6).

## For Integration
1. **The loud town:** houses `"news": true`. Townsfolk `"tell": true`, `"home": <house id>` and `"told": [lines]`.
   Spot `wu-gate` sets `mark:news_wu`. The palace door is `open_to: mark:news_wu`. Spots for the errand: `lamb`, `wine`,
   `qiao-gate`.
2. **The face-down:** npcs with `"yield": true`, `"yield_say"` and `"back_to": "block-start"`, active in s14. The proof
   assumes a catch within 3 tiles of a man not yet faced down.
3. **Snow:** state weather `"snow"` (Nanxu's `winter`).

## New kinds
These are in `NEW_KINDS` and `vocab.py`, each with a stand-in and a brief (`ART`):
- `prop.boat`: a river boat at a jetty (Nanxu's dock);
- `prop.target`: an archery butt (the riding ground);
- `landmark.incense`: the temple's bronze incense burner.
