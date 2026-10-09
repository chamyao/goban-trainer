# Lady Sun's marriage: places

These are the maps for `docs/book2/ladysun-arc.md` (novel chapters 54–55). They are written as plan grids in
`tools/tk_plans_ls.py`, in the format of `docs/book2/plan-grid.md`. Previews are in `docs/book2/plans-ls/`. Every Chinese
line (labels, goals, townsfolk) is plain modern Mandarin in simplified characters, as the user asked for this book.

    python3 tools/check_plans_w2.py --arc ls --png        # 13 plans, 0 errors; every beat s1–s15 has its spot
    python3 tools/mapfactory build --world 15 --plans ls  # with Plot's WORLD2_LS (claude/plot ddbfd87c)
    python3 tools/proofs/ladysun_ls.py                    # the temple corridors, the face-down, the loud town (engine syntax)

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
- **The loud town (s3 → s4)**, in the engine's syntax (`tk-feats.js`). The user found telling many people one by one
  repetitive, so the player tells only three, and watches the news spread by itself:
  - The three are all on Liu Bei's errand: the mutton seller (`g-lamb`) and the wine seller (`g-wine`) in the market,
    and Qiao Guolao's steward at his gate (`g-qiao`).
  - Each person told hurries to the next house and tells them, and that house tells the next, hanging out red as it
    goes. Everyone after the first three is a relay (`"relay": true`): told only by a neighbour, never by the player.
    Each says a line of their own.
  - Gossips carry `"gossip": {"tells": [...], "in_beats": ["s4"]}`. They're open while s4 is: `available()` is "not
    done", so `["s3"]` would shut them the moment the pouch is opened.
  - Only the steward's chain goes to Lady Wu's gate: g-qiao → h6 → h7 → Lady Wu's gatekeeper, with branches lighting
    the back streets (h6 → h9 → h8; h7 → h10 → h11 → h12). Qiao Guolao's household takes the news to her, as in the
    novel. The market's chains light their own streets (g-lamb → h3 → h2 → h1; g-wine → h4 → h5) and are optional.
  - The gatekeeper (`wu-gatekeeper`) has no gossip of his own, so he can't be told directly; he hears it from h7.
  - s4 is a cutaway in Lady Wu's hall (`wu-hall`) that plays once the gatekeeper is told (`"cutaway":
    "told:wu-gatekeeper"`, Plot's). Her palace door is `open_to: told:wu-gatekeeper`, and before that it refuses with
    Plot's line. The spot `wu-gate` marks her gate.
  - Each of the 12 houses has red hangings over its door (Graphics' `deco.redhang`, placed by `"over": "h<n>"` at the
    house's front edge, `"told": "g-h<n>"`, `"lift": 6`), shown once its resident knows. `lift` is in px: the image is
    drawn that much higher, and its depth stays at its foot. The engine supports it (main ba88bcae).
  - The goal box has a "传开消息 Spread the news" button while s4 waits (main 62f91bf1, the user's request). It walks
    these chains from their heads to the `told:` target, puts the hangings up house by house and plays s4. So keep the
    chains as `tells` lists with the three tellable heads, and the target as the palace door's `told:`.
  - Proved (`tools/proofs/ladysun_ls.py`): the player tells at most three; every relay is reached by one of their
    chains; only the steward's reaches the gatekeeper, in about 13 s (a teller walking the way at 80 px/s, waiting up
    to 1.5 s; at most 25 s allowed); every hanging lights.
  - Spots for the errand: `lamb` (the mutton seller), `wine` (the wine shop's door), `qiao-gate`.
  - Townsfolk who aren't gossips stand in between, for flavour; nothing depends on them.
- **Rooms:**
  - Lady Wu's hall (`wu-hall`: s4, a cutaway, and s11). Sun Quan comes in from the door 20 tiles east of s4.
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
- **The face-down (s13 → s14):** past the block, the road narrows to one cell between the hills.
  - Two ranks stand across it, with `"yield": {"group", "reach": 4, "aside", "line", "caught", "back_to": "block-start"}`,
    from s13 until s14: Chen Wu and two men, then Pan Zhang and two men.
  - Each man steps aside into a pocket just beyond his rank, which can only be reached past the rank.
  - Proved, at the engine's catch (moving within 1.4 tiles of a man who hasn't yielded): no way past either rank
    without coming that close, and every man's step aside lands on open ground off the road.
- **s14** is on the open road beyond the narrows. The generals come up behind her (west), as Plot now stages them.

## Liulangpu (s15)
A riverbank with no ferry. The river starts 6 tiles below the spot, so the scene's boats (−10, +6) are on the water,
and Zhuge Liang (−10, +4) is on the bank's edge. Zhou Yu's fleet comes along the river (+20, +6). Guan Yu comes out of
a valley in the hills to the north-east (+14, −6).

## For Integration
- The data is in your `tk-feats.js` syntax: `gossip`, `told` props, the s4 spot's `fires`, and `yield`.
- `gossip.relay` needs the engine: a relay can't be told by the player, isn't a talk target until told, and the goal
  pointer skips him. The pointer should go only to tellable people whose chain reaches the cutaway's `told:` target.
- `in_beats` is `["s4"]`, the window between s3 (done at the dock) and s4.
- The yielders' `line` and `caught` lines are written like `say` lines (`["n", en, zh, id]`). `build_tk.py` doesn't
  collect them for voicing yet.

## New kinds
These are in `NEW_KINDS` and `vocab.py`, each with a stand-in and a brief (`ART`):
- `prop.boat`: a river boat at a jetty (Nanxu's dock);
- `prop.target`: an archery butt (the riding ground);
- `landmark.incense`: the temple's bronze incense burner.
