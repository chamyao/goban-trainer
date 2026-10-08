# Lü Bu's fall: places

These are the maps for `docs/book2/lvbu-arc.md` (novel chapters 13–19). They are written as plan grids in
`tools/tk_plans_lb.py`, in the format of `docs/book2/plan-grid.md`. Previews are in `docs/book2/plans-lb/`.

    python3 tools/check_plans_w2.py --arc lb --png     # 15 plans, 0 errors; 8 road challengers, 2 blocking

The arc is registered as Book 14 (`ARCS[14] = "lb"`; beat keys `3-x1` … `3-x20`). Its story isn't in yet:
`mapfactory build --world 14 --plans lb` waits for Plot's `WORLD2_LB` in `tools/tk_story_w2_new.py`. Built with Plot's story
(claude/plot 75d1b473):
- all 15 maps build, and every beat x1–x20 lands on its spot;
- the two blockers' guard points are proven;
- the flood is proven state by state;
- `verify` finds no problems.

Every beat key has a spot or room, named as in the design's table. The lines for Chinese are in
`docs/book2/lvbu-places-lines.md` (110 lines).

## Xuzhou (x1–x4, x6, x7, x9, x11, x13)

A walled city with four gates and a crossroads at its centre.
- **North of the main street:**
  - the prefecture hall (`xz-hall`: x1, x3, x7, x9, x11);
  - Lü Bu's lodging (`lb-lodging`), a walled court. Inside are the rear hall (`lb-reartang`, x2) and Lady Yan's rooms
    (`yan-room`, x6).
- **South of the main street:**
  - Liu Bei's residence, not enterable. From x4 a soldier keeps its gate.
  - the wine shop where Zhang Fei drinks;
  - the market.

**Outside the west gate:**
- x4, the night gate. In state `moon` (x3 → x4: night, clear) the west gate is **shut** until it's opened.
- x13, under the wall where Mi Zhu shouts down. In `locked` (from x13) all four gates are shut, and Cao Cao's blue
  banners fly.

**Roads:** west to Xiaopei, east to the Xiapi Road, south to the Shouchun Road, north to Xiao Pass.

**Challengers:** one of Zhang Fei's drinking companions, and a Danyang soldier of Cao Bao's. Neither blocks.

## Xiaopei (x5, x10)

- **Lü Bu's camp**, inside a palisade west of the little walled town:
  - his tent (`lb-camp`, x5), its door facing east;
  - the **halberd** planted by the camp gate, about 24 tiles off. The shot goes out of the tent door to it.
- **The hunting ground**, south of the road. Its side path cuts through to the courier's road; x10 is where they meet.
- From x13 the town flies Cao Ren's blue banners.
- **Challenger:** a falconer in the hunting ground.

## The Shouchun Road (x8)

Thirty li south from Xuzhou.
- The road narrows through a defile between two spurs. One of Ji Ling's outriders holds it. He **blocks** x8: his guard
  is on the defile, and the hills leave no way round.
- The bridal party has halted beyond it, with the red bridal carriage and the drums.

## Xiao Pass (x12)

At night.
- The pass road climbs from the Xuzhou side through a valley and a narrow bend to the top of the pass.
- **On the top:** Chen Gong's men's tents and a watch fire, with two sentries as watchers. The checker proves a covered
  route to the cliff's edge, and that you have to wait for it.
- **x12** is the cliff's edge above Cao Cao's camp, which lies below to the west.
- **Challengers:**
  - a Taishan bandit on the bend, who **blocks** x12;
  - one of Chen Gong's sentries in the valley.

## The Xiapi Road

From Xuzhou to Xiapi, past an inn and a marsh, over the Si. No beat is played here: x11 (Chen Deng's advice) is a scene
in Xuzhou's prefecture hall, and Lü Bu rides for Xiao Pass, not with his family. From x11 to x13 (state `move`) the
household's carriages and the grain carts stand on the road to Xiapi as scenery.

## Xiapi (x14–x20): the flood

A walled city with the Si along its west and the Yi along its north.
- **Inside:**
  - **Lü Bu's residence** (`lb-residence`), a walled court. In it are his hall (`lb-fu`) and Lady Yan's rooms
    (`yan-room`).
    - The hall holds x14 (Chen Gong's plan), x15 (where he is packing), x17 (the mirror) and x18 (the lashes).
    - x15 starts in Lady Yan's rooms (spot `yan-start`). She crosses the court to his hall.
  - the granary;
  - the stables by the east gate (x19: Hou Cheng starts at `stables-door`);
  - the White Gate tower over the south gate (`white-gate`, x20).
- **Outside:**
  - Cao Cao's siege camp, east;
  - Liu Bei's camp on the Huainan road, south. x16 is its line, where Lü Bu turns back.

| State | Beats | Water |
|---|---|---|
| `siege` | until x16 | none |
| `flood1` | x16 → x17 | the low ground: the south and west bands, with the south and west gates; the east gate dry |
| `flood2` | x17 → x19 (`night` x18 → x19) | all but the causeway, the main street from the middle out through the east gate (「只剩得東門無水」) |
| `taken` | from x19 | none: the water drains, so x20 is on foot |

**Challengers** (siege, x14–x16): an officer of Hou Cheng's, and a sentry at the foot of the wall. Neither blocks.

**x19:** two of Lü Bu's men watch the causeway and the gate (watchers). Hou Cheng, on Red Hare, goes round them by the
water.

## For Integration (engine)

1. **The flood** uses tk-world's per-state water layers. `plans.py` works out which states each tile is under water in.
   `compile.py` writes one tile layer for each set of states:
   - `water:flood1,flood2,night`: the low ground.
   - `water:flood2,night`: the rest, all but the causeway.

   `plans.py` also proves each flood state from the entry on the causeway, and the build fails if a proof fails:
   - On Red Hare, every spot and door can be reached.
   - On foot, x19 can be reached, but the stables (flood2) and the residence can't. These are the plan's `flood_afoot`
     rules.
2. **`"shut": [{"gate": id, "rect": [x, y, w, h], "say": [lines]}]`** in a state is a wall's gate shut in that state.
   Block its tiles, and say the lines when the player walks into it. It's used for Xuzhou's west gate in `moon` (x4),
   and all four gates in `locked` (from x13).

## New kinds

These are in `NEW_KINDS` and `vocab.py`, each with a stand-in and a brief (`ART`):
- `prop.halberd`: the halberd at the camp gate (x5).
- `prop.carriage`: the red bridal carriage (x8).
