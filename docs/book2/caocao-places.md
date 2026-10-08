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

The capital in one map (22×17 cells), walled, with three gates:
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

South of it, walled wards (see the chase, below):
- the Chancellor's residence (相府) in its own ward: a compound with its hall, the small pavilion (`xf-pavilion`, c16)
  and the stables;
- a ward of houses;
- the walled market, with a go table.

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
- `wall.stairs`: the steps up the inside of the city wall (马道), where the wall guards come down in the chase.

## For Integration (engine), from the design

1. **Fireflies as the route light at Beimang (c4).**
   - The `firefly-path` line runs from the reeds to Cui Yi's farm, and the map's street graph follows it.
   - So the route light already goes the right way. It only needs drawing as fireflies, at night, on this map.
2. **Red Hare on a halter behind Li Su (c8–c9):** a one-member follower.
3. **Overhearing at Lü Boshe's (c20).** `overhear` is a plain `near` spot behind the thatched hall. The story can play its line there, with a crouch pose.

## Lines for Chinese

`docs/book2/caocao-places-lines.md` lists every line a player reads on these maps, for Plot.

## The chase out of Luoyang (state `sword`, c16 → c17)

This is the user's redesign (`caocao-arc.md`, "Redesign"):
- A **wave** of Dong Zhuo's men pours out of the Chancellor's gate after Cao Cao. It follows his trail, a little slower
  than his horse.
- **Ambushers** spring out of gates, lane mouths and the wall stairs ahead of him, and dash across the street.

`PLANS_CC["Luoyang"]["chase"]` holds the posts and the routes. `plans.py` lays them on tiles (`lay_chase`) and proves
them (`prove_chase`). It writes the result as the map's `chase`: in `luoyang.map.json`, and as the tmj property `chase`.
tk-world reads that property as it stands (`ambushStart`/`ambushStep`), with these names and numbers.

**The city, for it:** Luoyang's south half is walled wards (坊), as Han Luoyang was. So its streets are real streets, 5–6
tiles between walls, in every kit. Along them:
- **The Chancellor's ward**, holding the residence. Its south gate is the Chancellor's gate, the start. It also has a side
  gate onto the ward lane.
- **A ward of houses**, with an alley through it.
- **The walled market**, with two gates in its north wall and two in its south wall. You ride through one, and an
  ambusher waits in the other. It also has an east gate.
- **Four lanes:** the west lane, the ward lane, the market lane and the east lane.
- **The wall stairs (马道, `wall.stairs`),** drawn in the city wall's band on the south street's side.

North of the main street, a ward wall runs from the palace (closing on it) to the East Gate. In it are the gate of Cao Cao's lodging and
the north road's mouth. The grid grew from 22×15 to 22×17 cells.

| Route | Cells | Ambushes on it, in order |
|---|---|---|
| **Main street:** up the ward lane, then east along the main street | the main street, wide | side gate · Jiade Gate guards (N) · market-lane mouth (S) · market's north-east gate (S) · the lodging's gate (N) |
| **South street:** under the wall, then up the east lane | the south street, narrow | ward-lane mouth (N) · west stairs (S) · market-lane mouth (N) · east stairs (S) · market's south-east gate (N) · market's east gate (across the east lane) |
| **Market:** in at the south gate, among the stalls, out at the north gate | crowded, with stalls to swerve round | ward-lane mouth · west stairs · market-lane mouth · east stairs · a soldier from behind the stalls · then the north-east gate and the lodging on the main street |

**Ambushers:** the sides alternate where the street allows, 2–3 cells apart. That is about a second at the gallop, so
one is barely past before the next springs.

**What the build proves** (at the numbers in `pace`, which are Integration's to change; rerun the build after):
- **Speeds:** the horse rides at 165 px/s (110 × 1.5 mounted), and the wave at 150. The wave leaves the gate 1 s behind
  him.
- **Ambushers:** each springs when he can just reach Cao Cao's line as Cao Cao reaches his (`lead` 0.1 s), while
  Cao Cao is within `reach` 9 tiles of him and heading for that line (tk-world's rule: never once past it). He dashes
  across at 140, stands 1 s at the far side, then fades out.
- **A touch:** a hit is within 0.8 tiles.
- **Ridden straight, at a gallop, down the middle,** each route is hit by every ambush on it.
- **A clean ride exists on every route.** It is found tile by tile, waiting where it helps, and nothing touches him.
  - It takes 7.7 s on the main street and 8.0 s on each of the others. Ridden straight, each takes about 7.6 s.
  - So dodging costs 0.1–0.4 s, and the wave reaches him after about 1.6 s lost. It is pressure, not a timer: a rider
    who brakes too long, or hits a dead end, is taken.
- The build fails if any route stops having a clean ride.

`tests/playtest/ambush-13.js` checks it in the game: twelve wait hidden in state `sword`, there are no riders, and
riding along the main street past the lodging's gate, its jailer springs out and catches him (a board).
