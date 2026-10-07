# Isometric close-up survey (Book 12)

apo110's feedback (Chang'an @ 347,735, Genshin kit, desktop): door entry in the isometric view is not usable, and buildings
are drawn badly around the player. This survey covers Book 12 with the story at beat a14, as reported.

How it was measured: `tests/playtest/iso-close.js`.
- Kits: Genshin (isometric); Jade (flat) for comparison.
- Screens: desktop 1920x1080 with the mouse; iPhone 13 with taps.
- Doors:
  - Every open building door in Chang'an and Meiwu; Liangzhou has no open building door at a14.
  - The player was stood on the door's own side and on each other side of the building.
  - Tried there: a click/tap on the doorway as drawn, on the building as drawn, and on the ground just before the door.
  - Also tried: the arrow key toward the door, from in line with it.
- Drawing:
  - The player was stood at every free spot within 6 and 14 px of each building's footprint.
  - Wherever his painted pixels overlap the building's, the test checks he is drawn on the correct side.
  - Everyone else on the map was checked where they stand.
- People: a click/tap on everyone standing within 64 px of a building.

Places' door fix (a708c3b, Book 12's doors given the walking direction) is merged. Numbers are after it unless marked.

## Ranked by how much it hurts play

### 1. The player disappears behind buildings he stands in front of (engine, iso drawing). High.
| place | spots around buildings | where he overlaps a building | hidden though in front | drawn over though behind |
|---|---|---|---|---|
| Chang'an | 1142 | 365 | **149** (41%) | 0 |
| Liangzhou | 594 | 242 | **87** (36%) | 0 |
| Meiwu | 854 | 306 | **182** (59%) | 0 |

- In most of the crops he is not partly covered but gone. See `01-hidden-in-front-sheet.png`; each crop is centred on his feet.
  - `01a`: Wang Yun's hall, Chang'an.
  - `01b`: a tent, Liangzhou.
  - `01c`: a lodge, Meiwu.
- Two Meiwu villagers stand in front of a lodge and are drawn under it (`05`): npc-3 @216,366 and npc-4 @216,238.
- Cause: tk-iso.js gives each building one depth, the screen y of its footprint's front corner ((x1+y1)/2). A figure gets (x+y)/2.
  - Anyone beside the east or south face whose (x+y)/2 is less than that corner is drawn underneath it, though he stands in front of the face.
  - That covers most of each front face except near the corner.
- A fix that matches the data: per frame, for each figure near a building, compare the figure with the footprint box instead of the corner.
  - In front if x ≥ x1 or y ≥ y1: draw over the building.
  - Behind if x ≤ x0 or y ≤ y0: draw under it.

### 2. Door triggers drawn away from their building (placement / iso anchoring). High for the doors affected.
`02-door-triggers-sheet.png`: a red dot at each door's trigger, Genshin.
- Well away from the building, out on open ground:
  - The three walled compounds' doors: Wang Yun's, the Chancellor's (xiangfu) and Lü Bu's (`02a`). The dot is about 80 screen px left of the hall as drawn.
  - Meiwu: Diaochan's lodge (`02b`) and the mother's lodge.
- A player taps the drawn door and doesn't hit the trigger.
- The compounds' doors sit on their compound's edge, while iso draws only the hall at the compound's centre.
- Close enough (the dot on the building's front corner or doorstep): jeweller, teahouse, Cai Yong's house, Meiwu hall, palace gate.
- Slightly off: the Xuanping tower gate.

### 3. He walks up to the doorway and stops a few px short, without going in (engine, the walk's last step). High.
- Seen with doorway and building taps from a building's side or back. Each stopped 4–6 px from the door centre:
  - jeweller from N and W;
  - teahouse from W;
  - Wang Yun's from E;
  - Lü Bu's from N;
  - Meiwu hall from N, E and W.
- Also with Jade on phone.
- Repro: Meiwu, Genshin, stand west of the hall (its door at 448,241), click the hall. He arrives at the doorway and stays outside. With `iso-close.js` and PLACES=meiwu it is the row "hall, W side, building".

### 4. A tap on the ground right before a door doesn't go in (engine, pick()). Medium.
- Since the fix, Book 12's doors are side N.
  - pick() then counts only a tap on the building itself (onBuilding), as in Book 1.
  - The doorstep in front is a plain walk.
  - In the iso view the doorstep is where a player taps.
- Ground-before taps going in: Chang'an Genshin desktop 2/19 (18/22 before the fix), phone 2/16, Jade 1/15.
- Suggest counting a tap within ~12 px in front of a doorway as the door (`03`, Cai Yong's house).

### 5. Tapping a building whose door faces E or W never goes in (engine, pick()). Medium.
- doorway() accepts a tap on the building only for side N.
- The Meiwu lodges (E/W doors) and the Xuanping tower (E) need a tap within 20 px of the doorway rect.
- Meiwu building taps going in: Genshin 1/12, Jade 3/11.

### 6. The palace's North Side Gate: a tap on the gate sends him ~150 px the wrong way (engine/placement). Medium.
- From the gate's E and S sides, a click on the gate building walked him 130–150 px and left him 275–286 px from its door (Genshin desktop).

### 7. Arrow keys follow the map, not the screen, in iso (design). Low to medium.
- Up moves him up and to the right on screen.
- Walking into a door with the keys works when he is in line with it: 6/6 in Chang'an, 3/3 in Meiwu, both kits.
- The doorways are about 13 px wide, so a key walk needs that alignment.

### 8. Story spots partly under a roof (placement). Low.
- Shisun's spot (Chang'an 200,699, on his doorstep, `04a`) and the Meiwu gate spot (472,667, `04b`) are covered by the building drawn over them.

## Fine
- People beside buildings talk on a click or tap: Chang'an 7/7, Liangzhou 1/1, Meiwu 3/3, desktop and phone.
- Never drawn over a building he stands behind (0 cases).
- The keys into a door, from in line: 6/6 and 3/3 in both kits. Before the door fix this was 0: the outside was on the other side.
- Building taps in Chang'an after the door fix:
  - Genshin desktop 15/22 (4/21 before);
  - Genshin phone 14/18 (3/18 before);
  - Jade desktop 13/19 (4/20 before).

## Door numbers (after the fix), "in" per attempt
| | doorway | building | ground before | key |
|---|---|---|---|---|
| Chang'an Genshin desktop | 11/19 | 15/22 | 2/19 | 6/6 |
| Chang'an Genshin phone | 11/18 | 14/18 | 2/16 | 6/6 |
| Chang'an Jade desktop | 18/19 | 13/19 | 1/15 | 6/6 |
| Chang'an Jade phone | 20/24 | 18/23 | 1/23 | 5/6 |
| Meiwu Genshin desktop | 8/12 | 1/12 | 3/12 | 3/3 |
| Meiwu Genshin phone | 5/6 | 3/12 | 3/6 | 3/3 |
| Meiwu Jade desktop | 8/11 | 3/11 | 6/11 | 3/3 |

Off-screen attempts are left out. Meiwu on Jade phone is left out: the a14 boss board opened during that run.
Every attempt, with what happened instead, is in `tests/playtest/out/iso-close-<kit>-<dev>.json` after a run:
`KIT=genshin DEV=desktop node tests/playtest/iso-close.js`.
