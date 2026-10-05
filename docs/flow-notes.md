# Flow notes: what a first-time player knows, and when

These are design notes from a player's point of view: whether each objective and scene makes sense to someone who has never read the novel, and who plays only what the game shows them, in the order the map allows. They are written against `main` (World 1) and Plot's branch (Book 2, `claude/eager-ride-f6gkz0`). Fixing the scripts is Plot's job; these notes only point at the gaps.

## Rules of thumb

1. **An objective only names what the characters know at that moment.** If it names a person, a danger or a place, the player must already have heard of it. The last line of the previous scene, or someone on the map, sets it up.
2. **A cause comes before its effect on every route.** If a side road shows how something happened, it must be reachable before the main scene that shows the result. Otherwise frame it plainly as a look back ("Months before…").
3. **The main line stands alone.** A player who skips every side road must still meet each person the main line depends on (above all the Book's boss) before they matter.
4. **Each Book starts where the last one ended.** If time has passed or the situation changed, one line says so.
5. **Map labels don't spoil.** A place named after what will happen there ("Dong Zhuo's Camp") gives the scene away before it plays.

## World 1 (on main)

| Where | What a first-time player sees | Why it jars | Suggested fix |
|---|---|---|---|
| `n6` office | After the cage cart ("they march north. Again the road divides."), the objective says "Rescue Dong Zhuo, then report at his tent", at a place called "Dong Zhuo's Camp". | Dong Zhuo has been named once, in passing. Nothing says he is in danger. The objective knows the future and spoils the scene's surprise (in the novel the brothers stumble on the rout on the way home). | Objective: "Head home to Zhuo." Give the place a neutral name (the road or hills north of Guangzong). The rout happens when they arrive. |
| `n4` Qingzhou | "Lift the siege of Qingzhou" before Gong Jing's letter arrives, and the letter is what tells the player about the siege. | Same pattern: the objective comes before the news. | End Daxing with the letter arriving (one line), or make the objective "Go to Qingzhou" until the letter is read. |
| `n3` Daxing | "Meet the Yellow Turbans at Daxing Mountain" before the player hears that Cheng Yuanzhi is marching on Zhuo. | Mild version of the same pattern. | End the horses scene with the news of the march, or make the objective "Report to the governor with your five hundred." |
| `e1` Yingchuan vs `f1`/`b3` | The main Yingchuan scene opens with "the rebels have been routed by fire". The fire plan (`f1`) and Cao Cao's red banners (`b3`) are only reachable afterwards, from the cage cart. | The player sees the result before the plan. | Branch the fire side road off before Yingchuan (from Lu Zhi's tent), or open `f1` with "Days before Liu Bei arrived…". |
| `e1` place name | The objective says "Go to Yingchuan…", but the map spot is labelled "Changshe". | The player is told one name and finds another. | Use one name, or say "Yingchuan (Changshe)". |
| `c1` council | The second objective sends Liu Bei, a sandal-seller, to the governor's council. | There's no reason given for why he would go there. | Have the council play as a scene the player overhears or is shown, or make the objective "Go into town" and let the council play on the way to the notice. |

## Book 2 (Plot's draft, in the game data)

| Where | What a first-time player sees | Why it jars | Suggested fix |
|---|---|---|---|
| `m1` Pingyuan | Book 1 ended with Liu Bei hanging up his seal and leaving office at Anxi. Book 2 opens with "Liu Bei has been made magistrate of Pingyuan." | Nothing bridges resigning in disgrace and being a magistrate again. | One line: they went to Gongsun Zan, his old schoolmate, who recommended him (the novel's route). |
| `m4a` Hulao, Lü Bu | The main line first mentions Lü Bu as "Lü Bu, whom no one has yet withstood", and he is the Book's boss. Who he is (Ding Yuan's son who killed him for Red Hare) is only on side road A. | A player who skips side road A meets the boss with no setup. | Give the main line one beat with Lü Bu before Hulao: at the lords' council, or in the opening scroll ("…and Ding Yuan's adopted son, Lü Bu, killed him for a red horse and went over to Dong Zhuo"). |
| `m3` Sishui objective | "Go to the gate, where Hua Xiong is waiting" before the player has heard of Hua Xiong. | The same objective pattern as World 1. | "Go to the gate; news is coming from the front." The scene then introduces Hua Xiong. |
| `c1` Zu Mao vs `m3` | `m3` opens with Hua Xiong's men carrying Sun Jian's captured red cap. The night raid where that happens (`c1`, Zu Mao) is only reachable after Hua Xiong is dead. | Effect before cause, and the side scene then shows a man who is already dead. | Branch `c1` off before `m3` (from the alliance), or frame it as "The night before…". |
| Thread B (Cao Cao) | Branches after the alliance and rejoins before Sishui. It ends at Xingyang (ch. 6), after Hulao and the burning of Luoyang, yet the player then plays Sishui and Hulao (ch. 5). | The order runs backwards. Cao Cao is also at the alliance in `m2`, then the side road shows him fleeing the capital. | Split it: the dagger, Zhongmou and Lü Boshe (ch. 4) before the alliance, framed as "Before the alliance…"; Xingyang after Hulao. |
| Thread C (Sun Jian) | Rejoins before Hulao. It includes the seal found in burned Luoyang (ch. 6) and Sun Jian's death at Mount Xian (ch. 7, "Years later"). | The player sees Luoyang burned and Sun Jian dead before Hulao (ch. 5) and before the main line rides into the ruins (`m5`). | Move `c2`/`c3` after `m5`, or make them branch from `m5`. |
| Thread D (Diaochan) | Branches after the boss and rejoins at `m5` "Burned Luoyang". It ends with Dong Zhuo dead (ch. 9) and Wang Yun killed. | `m5` then says "Dong Zhuo has fled to Chang'an", after the player has watched him die. | Let thread D branch from `m5` and end the Book, or rejoin after `m5`. |

## How to check a new Book

Before a Book's data goes in, read its main line alone, with no side roads, and for each objective ask: does the player already know every name in it? Then walk each side road in the order the edges allow, and check that nothing shows a result before its cause, or a person after their death.
