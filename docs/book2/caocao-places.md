# The Cao Cao arc: places

The maps for `docs/book2/caocao-arc.md` (novel chapters 3–4 and the start of 5), written as plan grids in
`tools/tk_plans_cc.py` (the format of `docs/book2/plan-grid.md`). Previews are in `docs/book2/plans-cc/`.

    python3 tools/check_plans_w2.py --arc cc --png     # 20 plans, 0 errors; 12 road challengers, 4 blocking

All 20 maps also build with the map factory (`plans.build_world`) with 0 problems. The arc's story doesn't exist yet, so
nothing here is wired into a book: `plans.py` will load these plans once Plot's scenes land.

**Places, walked in the novel's order:** Luoyang (Beimang to its north, the camps outside its west gate) → the East
Road (Zhongmou) → Chenggao → Chenliu. Every beat key `2-c1` … `2-c23` has a spot, and every room is named as in the
design's Shared keys table.

## Luoyang

The capital in one map (22×15 cells), walled, with three gates:
- **North gate:** to Beimang.
- **West gate:** to the camps.
- **East Gate:** to the East Road.

The main street runs from the west gate to the East Gate. North of it, all facing south:
- the Wenming Garden, with its banquet (c6) and its gate (where Lü Bu rides past);
- He Jin's residence (`hj-hall`, c1);
- Wang Yun's house (`wyl-rearhall`, c15);
- Changle Palace behind the Jiade Gate, with a forecourt (c2);
- the tower of Yong'an Palace, which you see from the street in c13;
- Cao Cao's lodging.

South of it:
- the Chancellor's residence (相府), a compound with its hall, the small pavilion (`xf-pavilion`, c16) and the stables;
- the market, with a go table.

| State | When | Light | Roads shut |
|---|---|---|---|
| `court` | before the coup | day | all three gates (the council is sitting) |
| `burning` | c2 → c3 | night, smoke | all three |
| `dong` | c5 → c16 | day, black banners | north and east (the west gate stays open for the camps) |
| `sword` | c16 → c17 | day | north and west; the East Gate is the way |
| `wanted` | from c17 | day | north and west |

**The palace** (a compound map behind the Jiade Gate):
- The outer court holds a storehouse.
- The Qingsuo Gate is the one way through the inner wall.
- The inner court has the gallery (c14, 阁下).
- The north side holds Cuihua Tower (c3), the Jiade Hall (`jiade-hall`, c12) and the Secretariat (`sheng-hall`, c11).

**The burning walk (c3)** goes in at the Jiade Gate and through the Qingsuo Gate to Cuihua Tower.

## Beimang (c4, c5)

- The river is along the north, with the reeds on its bank where the brothers hide (`reeds-hide`, the start).
- The firefly path climbs through the thorny slope to Cui Yi's farm, haystack and barn (c4).
- The road back to the capital runs south from the farm (c5).
- It is night until c4, then morning. The way back is shut until then.

## The camps (c7–c10)

- **Ding Yuan's camp:** palisaded, with one gate on the road. It holds Ding Yuan's tent (`dy-tent`, c10) and Lü Bu's tent (`lb-tent`, c9).
- **The field between the camps:** Lü Bu's charge.
- **Dong Zhuo's camp:** his tent (`dz-tent`, c7), the stables (c8 spot, the stable master gives `redhare`) and the paymaster's tent (gives `gold`).
- The second watch (c9 → c10) is night.

## The East Road (c17–c19)

- The road runs down a valley between hills.
- A post station bars the road with a barrier, and a wanted portrait hangs on its wall.
- The river can only be crossed at the ferry.
- A second post station has the same portrait nailed up again.
- The wall of Zhongmou's pass comes next (c18 before it).
- Zhongmou town has the county jail (`jail-court`, its back courtyard, c19).
- Luoyang is shut behind you. Chenggao opens after c19. c18 → c19 is night.

## Chenggao (c20, c21)

- **The deep wood** is in the west, with a path in.
- **Lü Boshe's walled farm:**
  - the front hall (`lbs-hall`, c20);
  - the thatched rear hall, with the `overhear` spot beside it (where Cao Cao creeps and listens, visible, not under a roof);
  - the kitchen.
- **The road towards the west village** (`boshe-road`, where Lü Boshe comes back with the wine).
- **A roadside inn** (`inn-room`, c21).
- Light: dusk until c20, night until c21, then morning.

## Chenliu (c22, c23)

- The Cao family house (曹府, Cao Song by the door).
- Wei Hong's mansion (`wh-hall`, c22).
- The market with its grain stalls.
- The village drilling ground south of the road (c23), where the white banner 忠义 goes up and volunteers gather after c22.

## Road challengers: 12, 4 blocking (the design's counts)

| Walk | Who | Where | Blocks |
|---|---|---|---|
| The burning palace (c3) | `gate-guard`, a eunuch's guardsman | the Qingsuo Gate | **c3** (the only way through the inner wall) |
| | `looter` | the outer court, by the storehouse | |
| Li Su's ride (c9) | `pickets`, the ambush pickets 伏路军人 | on the road at Ding Yuan's camp gate | **Lü Bu's tent** (the palisade's one gate) |
| | `scout`, one of Ding Yuan's scouts | the field | |
| Luoyang under Dong Zhuo (c13–c15) | `cavalryman`, a Xiliang horseman | the main street | |
| | `resigned`, an official who resigned with Lu Zhi | the market go table | |
| The east road (c17–c18) | `post-guard` | the post station's barrier | **c18** |
| | `ferryman` | the ferry landing | **c18** (the only crossing) |
| | `bounty`, a bounty hunter | between the river and the pass | |
| Zhongmou to Chenggao (c19–c20) | `woodcutter` | the deep wood | |
| Chenliu (c22–c23) | `swordsman`, a volunteer | the drilling ground | |
| | `merchant`, a grain merchant | the market | |

The checker proves each blocker: the place can't be reached from the walk's start without coming into his view.

## New kinds

These are in `NEW_KINDS` and `vocab.py`, each with a stand-in until Graphics draws it. The briefs are in `ART` and in
`docs/book2/assets-needed-cc.md`.
- `building.tower`: Cuihua Tower and the tower of Yong'an Palace.
- `building.stable`
- `furn.mirror`: the dressing mirror in c16.
- `banner.white`: 忠义.

## For Integration (engine), from the design

1. **Fireflies as the route light at Beimang (c4).**
   - The `firefly-path` line runs from the reeds to Cui Yi's farm, and the map's street graph follows it.
   - So the route light already goes the right way. It only needs drawing as fireflies, at night, on this map.
2. **Red Hare on a halter behind Li Su (c8–c9):** a one-member follower.
3. **Overhearing at Lü Boshe's (c20).** `overhear` is a plain `near` spot behind the thatched hall. The story can play its line there, with a crouch pose.

## Lines for Chinese

`docs/book2/caocao-places-lines.md` lists every line a player reads on these maps, for Plot.

## The chase out of Luoyang (state `sword`, c16 → c17)

A draft for the new mechanic (caocao-arc.md, "New mechanic"), in `PLANS_CC["Luoyang"]["chase"]`.
- Cells are as in the plan. Cones and speeds are in tiles.
- Integration chooses the field names.

**The run:**
- It starts at the Chancellor's gate (the compound's `xf-gate`), coming out onto the south street at [10,12].
- It ends at the East Gate (the c17 spot, [19,8]).
- The north and west gates are shut in this state, so the East Gate is the only way out.

**Ground:**
- Open, where the horse outruns a rider: the main street and the south street (3 tiles wide, long and straight).
- Narrow, where a rider can corner him: the west lane, the east lane and the garden lane (2 tiles), and the market, between the stalls.

**Three routes.** Each has a rider on it, so the choice is which risk to take, and when:

| Route | Length | Risk |
|---|---|---|
| **Market cut**: south street east, through the market, onto the main street by the gate | 18 cells | the market rider among the stalls (narrow); then the gate rider on the open street, which is a race, not a trap |
| **East lane**: the open south street to its east end, then up the east lane to the gate | 15 cells | one rider, riding up and down the lane; meet him in it and there is nowhere to go |
| **Long way**: west along the south street, up the west lane, then the whole main street east | 32 cells | the west-lane rider, whom you can see coming; then the gate rider on the open street |

**Riders (4):**

| Rider | Post | Beat | Pause | Cone |
|---|---|---|---|---|
| `rider-market` | [13,11] | U along the market's south row, [13,11] ↔ [17,11] | 2 s at the east end | 4 |
| `rider-lane` | [19,12] | U up and down the east lane, [19,12] ↔ [19,9] | 1 s at the top | 5 |
| `rider-west` | [2,10] | U along the west lane, [2,9] ↔ [2,12] | — | 5 |
| `rider-gate` | [16,8] | U along the main street, [9,8] ↔ [17,8] | 2 s by the gate | 6 |

**Speeds (relative):** walk 1.0, rider 1.5, gallop 2.0. A rider gains in the lanes, where he turns tighter. In the open he
loses ground.

**Checked:** every post and beat cell is walkable street the player can reach. Each route is walkable and crosses
exactly the riders listed.
