# Game design review

Written by the Game Design session. It rests on reading `docs/three-kingdoms-plan.md`, `docs/cutscene-format.md`, `docs/world1-script-draft.md`, `tools/tk_story.py`, `tools/tk_places.py` and the playtest README, plus battle and delivery checks from Plot/Story. I have not played the live game, so "feel" claims below are inferred from the script and need a playtest to confirm.

## Decisions so far (from the user)

- **Go stays the most frequent mechanic.** Other mechanics are supporting and occasional; one main extra mechanic per Book is the default.
- **The Star Lords are the source of counsel and hints**: they offer counsel in exchange for a solved problem (see the per-scene decision below for where they appear).
- **Counsel becomes a hint the player acts on in the world** (go to a place, find a person, collect a thing), instead of a cutscene in which the characters do it. The cutscene then shows the result of what the player did.
- **Bosses stay hard problems.** Relics should do something, not just appear in a scene.
- **A slip keeps the same problem and starts a fixed 30 s cooldown** (as the game already does). The user considers this mechanic done: no variation by Book or boss.
- **Gated battles show a defeat, not a problem.** If the player attempts a fail-then-prepare battle or boss before its conditions are met (for example the blood at Black Wind), the board never opens: a short defeat scene plays and a clue points to what is missing. No problem is spent and no slip is counted. Once the conditions are met, the problem opens as normal.
- **"Fail until prepared" and deliveries are tools in a toolbox**, used where the novel supports them and varied from Book to Book.
- **Three Kingdoms with a light xianxia layer** (the plan as written); not a full xianxia game.
- **Challengers keep setting problems of their own.** Villagers and officials stay as optional trainers; they do not need to be the Star Lords' proxies.
- **Star Lords per scene follow Plot's proposal:** in person at four World 1 problems (oath, Daxing, Qingzhou, Black Wind), a sign of them at about three more (e.g. the mulberry-tree fortune-teller, a board left on a table at the inn), and none at the quiet scenes (cage cart, Dong Zhuo, the inspector, the notice), where the board's silence is the point and the problem is framed as a decision the character must get right. Other characters (Zhu Jun, Lu Zhi, later Xu Shu) may give hints.
- **Star Lords' shrines (revised by the user via Plot):** every town has a small weiqi shrine in three looks (dark, lit while a hint is waiting, settled once solved), in the manner of the Keeper's Shrines in Black Myth: Wukong. It replaces the "sign" scenes. Solving the shrine's board visibly changes the world (people and places have different lines before and after). Design recommendation: a settled shrine is also a **hint log** (touching it repeats the Star Lords' hint and the current objective); it is **not** a rest point, because the 30 s cooldown is settled and there is nothing to heal. Open for Plot: the rule "the Star Lords appear only after a failure" fits gated battles but not the peach-garden oath or Daxing, so define the trigger as "a moment of need".
- **Objectives state the goal; the Star Lords' hint says what to do** (user decision). No item names or counts in the objective line (Black Wind: "Defeat the Black Wind."; Book 2: "Defeat Lü Bu at Hulao Pass.").
- **Pilots: Black Wind**, then Qingzhou's flanks, then Lu Zhi's errand (status in "Build status" below).

## What the game is today

- **Genre and feel:** a top-down explorable story world in the style of GBA Pokémon, where each objective is cleared by solving a Go problem. A storyteller scroll opens and closes each Book. Cutscenes are acted out on the maps with portrait dialogue, voice-over and a Chronicle to replay them.
- **The loop, minute to minute:** walk to a marked story spot, a scene plays, the board opens, you solve it flawlessly, the rest of the scene plays, the next objective appears. A top-of-screen objective line and Wukong's pointer say where to go.
- **Rules:** a wrong move, hint, undo or Explore is a slip, a slip keeps the same problem: it resets, stays in full view for study, and is held for a 30 s "Think" cooldown (saved, so leaving and coming back doesn't skip it); the Star Lords answer a slip with "Not yet. Look again." Bosses are the hardest problems of the Book. (The plan and the header comment in `tk.js` still say a slip draws a new problem; the code does not, and they should be updated.)
- **Rewards:** only story items (horses, weapons, silver). The horses change travel and looks; the rest are shown in a scene.
- **World 1:** 24 scenes (15 main, 9 side), each with exactly one problem placed mid-scene. The Star Lords sit at the board in 4 of them (oath, Daxing, Qingzhou, Black Wind). Villagers and officials also set challenger problems.

## What is flat or repetitive

1. **Every scene has the same shape.** Cutscene, one problem, cutscene. Across 16 Books this will feel uniform without variation in what the player *does*.
2. **The player never acts on the story.** The Star Lords give a plan, then the characters carry it out in a cinematic (Qingzhou's ambush, Black Wind's blood). The player's only input is the problem.
3. **Problems often have no stated reason.** About 20 of 24 World 1 scenes open a board with no in-world reason, and challengers have their own reasons. The Star Lords' role is clear only in four.
4. **Rewards do not do anything.** Apart from the horses, items are decoration, so there is little to look forward to between bosses.
5. **Retry feel is untested.** Same problem plus a 30 s cooldown is a good rule: it stops trial and error and gives time to think. Settled by the user: a fixed 30 s everywhere.
6. **Replay hooks are thin.** Optional harder routes and the Chronicle exist, but nothing invites a second run.

## Proposals (priority order)

Implementer key: **Plot** = Plot/Story, **Integ** = Primary Integration, **Gfx** = Graphics and Mechanics, **Test** = Gameplay and Testing.

| # | Proposal | What the player sees | Who |
|---|---|---|---|
| 1 | **Counsel becomes a hint the player acts on** | A solved problem earns a short, cryptic tip ("pigs, sheep, dogs, blood"). The player carries it out on the map; doing it triggers the scene. Pilot: Black Wind (find the butcher, bring the blood to the ridges). Then Qingzhou (place the two flanks) | Plot writes hints and actions; Integ builds "act on a hint"; Gfx adds the places and props |
| 2 | **A missions bar** | One Main objective (as today) and up to three open hints or optional tasks, each saying who, where and what. Wukong's guide can point to the next one | Integ; Plot writes the wording |
| 3 | **The Star Lords justify every problem** | They sit at the board, or leave a sign (a board in the dirt, a stone set out) where they cannot be present. Challengers become the Star Lords' proxies or are marked optional trainers. Silence at the great deaths then lands harder | Plot decides each scene; Gfx draws signs; Integ updates challenger text |
| 4 | **A toolbox of supporting mechanics, one per Book** | See the toolbox below. Rule: at most one required extra action per problem, and Go is always the most frequent activity | Plot picks per Book; Integ builds each tool once |
| 5 | **Relics that do something** | A relic opens a path or gate, speeds travel like the horses, makes a hint more precise, changes how the party looks, or unlocks a scene or Chronicle entry. Boss wins give the Book's trophy and a callback later | Integ (effects), Plot (which relic, where), Gfx (icons) |
| 6 | **Boss framing** | Keep the hard problem. Mark it clearly as harder, and the Star Lords give no hint ("This one is yours"). Earlier hint actions pay off in the cutscene around it, not on the board. A slip keeps the same problem with the cooldown, as for every problem | Plot, Integ |
| 7 | **Vary where the problem sits** | Not always mid-scene: some scenes open with the problem, some have none, a few have two. Matches the plan's "some battles, some none" | Plot |
| 8 | **Replay hooks** | Hidden Star Lord encounters, the Wang Zhi legend area, and Chronicle completion. (Book-end choices were considered and dropped by the user.) | Plot, Gfx, Integ |

## The toolbox (supporting mechanics)

| Tool | Fits well | Does not fit | Notes |
|---|---|---|---|
| **Hint action** (go, find, collect) | Everywhere the Star Lords sit at the board | The great deaths | The baseline; Proposal 1 |
| **Fail, then prepare** | Black Wind (B1), Hulao (B2), Guandu (B5), Red Cliffs (B8), Nanjun (B9), poisoned springs (B14), Chencang (B15) | Daxing (the novel prepares first), the five passes, Dingjun, any real defeat | A first attempt before the conditions are met shows a defeat scene and no problem; a clue sends the player to gather strength. Plot's rule: use it only where the novel has a setback then a win |
| **Delivery** | Lu Zhi's errand to Yingchuan (B1), the ladies' escort (B4), the letter left for Zhuge Liang (B6), Kan Ze's letter (B8), the blotted letter (B10), Guan Yu's failed plea (B12), the sealed bag (B16) | Lady Mi and A Dou, the heads, wills, Xu Shu's forged letter (must deceive the player too) | Almost all outcomes are fixed by the novel, so the value is the journey and the twist. At most one required delivery per Book plus one optional. Twists: arrive too late, forged or altered letter, a trap, recipient gone, the carry is the harm |
| **Formation or flank placement** | The short battles (Qingzhou, Wuchao) | Where the novel needs the characters to act | Small and forgiving |
| **Collecting** | Relics, forge and pills, Star Lord counsel collection | | The xianxia flavour, if wanted |
| **Discovery** | Hidden shrines, Star Lord encounters | | Replay value |

**Per-Book guidance:** one required extra mechanic at most, one optional; never two in a row of the same kind; the unwinnable stories (Changban, Maicheng, Yiling, Jieting, Wuzhang, Yinping) should let the player try and lose on purpose, with the Star Lords' hint saying it cannot be won.

## Difficulty and pacing notes

- The grade climb (12K to 7D) is already a progression ladder. If a xianxia flavour is wanted, grades can be named as realms and a breakthrough is a harder problem.
- A quiet Book should still end on a peak problem (the plan's reckoning bosses); a battle Book can end on a fail-then-prepare payoff.
- Fail and retry: keep "flawless only" for Go and add no failure state to the other mechanics. A wrong guess on a hint costs only a flavour line.

## Open questions for the user

None at present. Settled: a slip keeps the same problem with a fixed 30 s cooldown in every Book and for bosses; a gated battle shows a defeat scene and no board. Dropped by the user: Book-end choices and keepsakes.

## Suggested first pilot

World 1, Black Wind: the first attempt is routed by the storm (already staged); the Star Lords' hint is "pigs, sheep, dogs, blood"; the player finds the butcher or pen, carries the blood to the two ridges, and the Yangcheng scene shows the ambush working. This tests the hint action, the missions bar, a relic or item that does something, and fail-then-prepare in one place, using a scene that already exists.

## Book 2 (Hulao Pass, ch. 3-9): design decisions

Agreed with Plot/Story; the script draft is Plot's (`docs/world2-script-draft.md`).

- **Required mechanic: formation at Hulao**, as the novel's order. The eight lords' defeat is a no-board scene that lights the shrine; the Star Lords' hint is "One, then two, then three". Zhang Fei goes in first, Guan Yu joins when he tires, then Liu Bei. The player sends each brother in by talking to him; a wrong order gets a correction line, never a failure. Built from the existing blocks (marks, each conditional on the previous one). Then the Lü Bu boss board (hard, no hint, taunt first), and Lü Bu retreats. This is not fail-then-prepare, so the same kind is not used twice in a row (Book 1 ended on Black Wind), and it differs from Book 1's left-and-right flanks at Qingzhou.
- **Optional delivery: Red Hare**, with gold and a jade belt, carried to Lü Bu (ch. 3). The carry is the harm: it leads to Ding Yuan's death. (Chosen over the Seven-Star Dagger.)
- **The Imperial Seal is a story object, not a relic.** Liu Bei never holds it and it ruins whoever does. The Chronicle may note whose hands it is in, Book by Book. No Book 2 trophy unless one falls naturally from the novel.
- **Scale:** 26 scenes; the Cai Yong scene is the first cut if needed.
- **Hua Xiong:** no extra mechanic. His problem is framed as the wine cooling: Cao Cao's cup steams beside the board, and on the solve Guan Yu returns with the wine still warm. No timer.
- **Star Lords:** in person at Hulao (danger); only a sign at the Diaochan plot; none at the quiet scenes (Lü Boshe's house, the wine, Dong Zhuo's fall).
- **Perspective:** Liu Bei is absent in ch. 3-4, so Cao Cao's scenes are side stories, as in Book 1.

## Build status

- **Black Wind (World 1, fail-then-prepare):** built and passed. Testing ran 9 of 10 spec checks on a phone, all passing, and the tenth's one defect (Liu Bei's fall-back spot) is with Integration and Plot. The stretch takes about 4 minutes and didn't feel like chores.
- **Qingzhou's flanks (World 1, formation):** written (Plot 8ef656f). The brothers go to their hills (marks `flank_left`, `flank_right`) before the ambush. Awaiting Testing.
- **Lu Zhi's errand (World 1, delivery):** written (Plot 8ef656f). The errand to Yingchuan arrives too late. Awaiting Testing.
- **Book 2 (Hulao Pass):** in the game data (Plot's branch). The ordered formation uses the existing blocks; a wrong brother gives a correction line (`empty`/`waiting`). Awaiting Testing.
- **Tap to preview** (rules for problems): decided and live (Primary Integration). A ghost stone is never a slip, and there is a "Confirm taps: Auto / Never" setting.

## Who decides what

Per the user: Game Design reports **only to Plot/Story**. Plot approves story-tied design (Book mechanics tied to scenes, hints, objectives, which scenes use which block). Anything outside Plot's scope, such as interface and engine decisions (taps, thresholds, settings, how triggers feel), Plot forwards to Primary Integration. Game Design does not go to Integration directly.
