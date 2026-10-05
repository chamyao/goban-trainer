# Mechanics spec: shrines, hints, gathering, delivery, gated battles

Player-facing rules for the mechanics agreed in `docs/game-design.md`, written so Integration can build them without guessing and Testing can check them. How they are built is Integration's call. The story content is Plot's (`docs/world1-blackwind-gated.md`); this file only says how it behaves.

**Pilot:** World 1, Black Wind. **What already exists on `main` (c60889f):** the shrine landmark in every town, its three looks, Black Wind's roadside shrine and node `1-n7b`, and its objective text. **What is missing:** the logic that picks a shrine's look (`TK.shrineState` is called but not defined, so every shrine shows dark), items given by talking, delivery, and gating a node.

## Four building blocks

Every mechanic in the toolbox is made of these four. Build them once; Plot combines them per Book.

| Block | What the player sees | Used by |
|---|---|---|
| **Shrine state** | A shrine is dark, lit or settled, and says something different in each | Every Star Lord hint |
| **Give** | Talking to someone gives an item, but only once a condition holds | Black Wind (blood), later errands |
| **Deliver** | Talking to someone or standing at a place while holding items marks it done | Black Wind (ridges), Qingzhou (the flanks), Lu Zhi's errand (reach Changshe) |
| **Gate** | A story spot plays a short defeat scene instead of its board until conditions hold | Black Wind (Yangcheng), the other fail-then-prepare battles |

A condition is always one of: a story node cleared, an item held, or a place marked done.

## 1. Shrines

| State | When | Look | Touching it |
|---|---|---|---|
| Dark | Default; and always in towns where no hint is due | Cold stone | One line: "The board is quiet." (棋盘寂静。) |
| Lit | Its node is open (for Black Wind: after the first try at `n7`) and not yet solved | Glow, incense | Plays its scene: the Star Lords, their hint, then the board |
| Settled | Its node's board was solved | Soft glow, no smoke | **Hint log:** repeats the Star Lords' hint and shows the current objective |

- A shrine with no node of its own is always dark.
- The state is derived from progress, not stored separately, so it can never disagree with the save.
- A slip at a lit shrine follows the settled rule: same problem, 30 s cooldown.

## 2. The hint

- The hint is the Star Lords' last line before the board (Black Wind: "Pigs, sheep, dogs. Blood.").
- After the board is solved, the objective line shows the next step in plain words (Plot's objective text), and the settled shrine repeats the hint itself.
- No separate missions bar for now. The single objective line at the top is enough while a Book has one open task at a time. Add the bar only when a Book has parallel tasks.

## 3. Give (gathering)

| Before the condition | After, first talk | After, talking again |
|---|---|---|
| Plain line, no item (Plot's "before" line) | Gift line, the item is gained, a short notice "Gained: Pig's blood (猪血)" | A short "already given" line |

- Black Wind's condition: the roadside shrine is settled.
- Any order. The objective line counts: "Gather blood from the village: 1/3".
- Items are kept when the player leaves the map.

## 4. Deliver (the ridges)

| Ridge state | Shows |
|---|---|
| Before the shrine is settled | Empty: no one there |
| After, player holds fewer than all three | Guan Yu or Zhang Fei with a thousand men, the "still to come" line |
| After, player holds all three | The handover line; the ridge is marked supplied |

- Delivering does not use up the items, so one set supplies both ridges. Either ridge first.
- The objective line counts: "Take the blood to the ridges: 1/2".
- After Yangcheng is won, the three supply items are removed (they have done their job and shouldn't clutter the possessions).

## 5. Gate (Yangcheng)

| Player arrives at the boss spot | Plays | Board? | Cooldown? |
|---|---|---|---|
| Shrine not yet settled | `bossearly` (Liu Bei: "No man can fight a wind.") | No | No |
| Shrine settled, ridges not both supplied | `bossearly2` (Guan Yu names what is missing) | No | No |
| Both ridges supplied | `bosswin`, as now | Yes | Usual rule on a slip |

- The defeat scene can play any number of times. It is skippable from the second time.
- After a defeat the player stays near the boss spot (no teleport), and the objective line points to what is missing.
- Nothing about the boss problem changes: same problem pool, same difficulty.

## 6. Pointer and objective

- The objective line always names the next missing thing: the shrine, then the village, then the ridges, then Yangcheng.
- Wukong's pointer (when the guide is on) points to the nearest unfinished target: the lit shrine, the nearest giver who hasn't given, the nearest ridge not supplied.

## 7. Save, restart, Chronicle

- Items, supplied ridges and shrine states survive leaving the page.
- Start over clears all of them for that world.
- The Chronicle lists the shrine scene. The defeat scenes are not listed; the first try at `n7` already tells that story.

## 8. Checks for Testing

1. Fresh save to `n7`: the first try plays with no board; the roadside shrine turns from dark to lit.
2. The village people give nothing before the shrine is solved; the ridges are empty.
3. Going to Yangcheng early plays `bossearly`, no board, no cooldown chip.
4. Shrine board solved: it settles; touching it again repeats the hint.
5. Each giver gives once; the count reaches 3/3; leaving the map keeps the items.
6. Yangcheng before both ridges plays `bossearly2`.
7. Both ridges in either order, then Yangcheng opens the board; a slip keeps the problem with the 30 s cooldown.
8. After the win, the supply items are gone; Start over resets everything.
9. A dark shrine in another town answers "The board is quiet."
10. Timing: the whole Black Wind stretch, from the first try to the boss board, on a phone. If it runs well over five minutes, tell Plot (their fallback: one ridge visit instead of two).

## Next uses of the same blocks

- **Qingzhou flanks:** Deliver with no item; the "items" are Guan Yu and Zhang Fei, placed by talking at the left and right ridge spots. Swapping them gets a correction line, not a failure.
- **Lu Zhi's errand:** Deliver with no item: reach Changshe (a place marked done), then return to the tent. The twist (arriving late) is Plot's scene.
