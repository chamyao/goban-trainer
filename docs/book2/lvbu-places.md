# Lü Bu's fall: places

These are the maps for `docs/book2/lvbu-arc.md` (novel chapters 13–19, with the Chang'an prologue). They are written as
plan grids in `tools/tk_plans_lb.py`, in the format of `docs/book2/plan-grid.md`. Previews are in `docs/book2/plans-lb/`.

    python3 tools/check_plans_w2.py --arc lb --png     # 15 plans, 0 errors; 10 road challengers, 3 blocking

The arc is registered as Book 14 (`ARCS[14] = "lb"`; beat keys `3-x1` … `3-x20`). Its story isn't in yet:
`mapfactory build --world 14 --plans lb` waits for Plot's `WORLD3_LB` in `tools/tk_story_w2_new.py`. Built with a
stand-in story made from the design's beat table, all 15 maps build. The three blockers' guard points are proven, and
`verify` finds no problems.

Every beat key has a spot, and every room is named as in the design's table. The lines for Chinese are in
`docs/book2/lvbu-places-lines.md` (122 lines).

## Chang'an, after its fall (x1)

This is the Diaochan arc's city, kept as its streets. Its rooms, beats and people are left out, and so is the farewell
banquet outside the Heng Gate. It is dusk, with smoke over the city and Li Jue's black banners.
- **Pang Shu's house** (`pangshu`) is the house on the palace lane where Lady Yan and her daughter hide. The walk starts
  at its door.
- **The west gate** is cut in the west wall at the end of the ward street. That is x1.
- **Three of Li Jue's patrols** (watchers) ride the avenue, the ward street and the palace lane. If one sees her, she's
  taken back to Pang Shu's door.
  - The checker proves a covered route: there is a way past them, and none that avoids waiting for them.
- **Challengers:**
  - a Liangzhou looter at the west lane's mouth, by the gate. He blocks x1, with his guard point on the gate.
  - a soldier dicing by a fire on the market street.

## Xuzhou (x2–x5, x7, x8, x10, x14)

A walled city with four gates and a crossroads at its centre.
- **North of the main street:**
  - the prefecture hall (`xz-hall`: x2, x4, x8 and x10);
  - Lü Bu's lodging, a walled court. Inside are the rear hall (`lb-reartang`, x3) and Lady Yan's rooms (`yan-room`, x7).
- **South of the main street:**
  - Liu Bei's residence, not enterable. From x5 a soldier keeps its gate: "No one troubles the Lord Liu's ladies."
  - the wine shop where Zhang Fei drinks;
  - the market.

**Outside the west gate:**
- x5, the night gate. In state `moon` (x4 → x5: night, clear) the west gate is **shut**, until the gate is opened.
- x14, under the wall where Mi Zhu shouts down. In state `locked` (from x14) all four gates are shut, and Cao Cao's blue
  banners fly.

**Roads:**
- west to Xiaopei;
- east to the Xiapi Road;
- south to the Shouchun Road;
- north to Xiao Pass.

**Challengers:** one of Zhang Fei's drinking companions, and a Danyang soldier of Cao Bao's. Neither blocks.

## Xiaopei (x6, x11)

- **Lü Bu's camp**, inside a palisade west of the little walled town:
  - his tent (`lb-camp`, x6), its door facing east down the camp;
  - the **halberd** planted by the camp gate, about 24 tiles off, so the shot goes out of the tent door to it.
- **The hunting ground** lies south of the road, wooded. Its **side path** cuts through to the courier's road. x11 is
  where the path meets the road.
- From x14 Xiaopei flies Cao Ren's blue banners.
- **Challenger:** a falconer in the hunting ground.

## The Shouchun Road (x9)

Thirty li south from Xuzhou, with a milestone every three cells.
- The road narrows through a defile between two spurs. One of Ji Ling's outriders holds it. He **blocks** x9: his guard
  is on the defile, and the hills leave no way round.
- The bridal party has halted beyond the defile: the red bridal carriage (new kind `prop.carriage`) and the drums.

## Xiao Pass (x13)

At night. The pass road climbs from the Xuzhou side, through a valley, then a narrow bend, to the top of the pass.
- **On the top:** Chen Gong's men's tents and a watch fire. Two sentries are watchers.
  - The checker proves a covered route from the head of the road to the cliff's edge, and that you have to wait for it.
- **x13** is the cliff's edge above Cao Cao's camp, which lies below to the west: seen, never reached.
- **Challengers:**
  - a Taishan bandit on the narrow bend. He **blocks** x13, with his guard there.
  - one of Chen Gong's sentries in the valley.

## The Xiapi Road (x12)

From Xuzhou to Xiapi, past a roadside inn and a marsh, over the Si by a bridge.
- In state `move` (x11 → x12) it is a **procession**, as on the Diaochan arc's Meiwu Road. The column runs: outriders,
  Lady Yan's carriage, Diaochan's carriage, the player, two grain carts (`carriage:grain`), the rearguard.
- The column halts at x12, with Xiapi in sight.

## Xiapi (x15–x20): the flood

A walled city with the Si along its west and the Yi along its north.
- **Inside:**
  - Lü Bu's residence (`lb-fu`: x15 the counsel, x17 the mirror, x18 the lashes);
  - the granary;
  - the stables by the east gate, where Red Hare is (x19);
  - the White Gate tower over the south gate (`white-gate`, x20).
- **Outside:**
  - Cao Cao's siege camp, east;
  - Liu Bei's camp on the road to Huainan, south. x16 is its line, where Lü Bu turns back.

**The flood** (`plan["floods"]`, cells; a state's `"water"` names one):

| State | Beats | Water |
|---|---|---|
| `siege` | until x16 | none |
| `flood1` | x16 → x17 | the low ground: the whole south band and the west band. The south and west gates are under; the east gate stays dry. |
| `flood2` | x17 → x19 (night x18 → x19) | everything but the causeway: the main street from the middle of the city out through the east gate (「只剩得東門無水」) |
| `taken` | from x19 | back to `flood1`'s water; Cao Cao's banners |

What it gives:
- **x17:** Lü Bu's residence is under water from flood1 onward. On foot, there's no dry way from its door to the east
  gate. Only Red Hare gets him round the city and home.
- **x19:** In flood2 the stables are cut off on foot from the causeway, but on Red Hare there is a way to the east gate.
  Two of Lü Bu's men watch the causeway and the gate (watchers), so Hou Cheng goes round them by the water.

**Challengers** (siege, x15–x16): an officer of Hou Cheng's, grumbling, and a sentry at the foot of the wall. Neither
blocks.

## For Integration (engine)

Two state keys are new. `plans.py` writes both in tiles.
1. **`"water": [[x, y, w, h], …]`.** Tile rects under water in that state. No one crosses them except on a mount with
   `crosses_water` (Red Hare, in Plot's items). Draw them as water. Rivers are already water; these rects are added to
   them.
2. **`"shut": [{"gate": id, "rect": [x, y, w, h], "say": [lines]}]`.** A wall's gate shut in that state: block its
   tiles, and say the lines when the player walks into it. Xuzhou uses it for the night gate (x5) and the lockout (x14).

## New kinds

These are in `NEW_KINDS` and `vocab.py`, each with a stand-in and a brief (`ART`):
- `prop.halberd`: the halberd at the camp gate (x6). Its stand-in is the weapon rack.
- `prop.carriage`: the red bridal carriage (x9).
