# Game design review

Written by the Game Design session. It rests on reading `docs/three-kingdoms-plan.md`, `docs/cutscene-format.md`, `docs/world1-script-draft.md`, `tools/tk_story.py`, `tools/tk_places.py` and the playtest README, plus battle and delivery checks from Plot/Story. I have not played the live game, so "feel" claims below are inferred from the script and need a playtest to confirm.

## Decisions so far (from the user)

- **Go stays the most frequent mechanic.** Other mechanics are supporting and occasional; one main extra mechanic per Book is the default.
- **The Star Lords are the one justification for problems.** They offer counsel in exchange for a solved problem.
- **Counsel becomes a hint the player acts on in the world** (go to a place, find a person, collect a thing), instead of a cutscene in which the characters do it. The cutscene then shows the result of what the player did.
- **Bosses stay hard problems.** Relics should do something, not just appear in a scene.
- **Gated battles show a defeat, not a problem.** If the player attempts a fail-then-prepare battle or boss before its conditions are met (for example the blood at Black Wind), the board never opens: a short defeat scene plays and a clue points to what is missing. No problem is spent and no slip is counted. Once the conditions are met, the problem opens as normal.
- **"Fail until prepared" and deliveries are tools in a toolbox**, used where the novel supports them and varied from Book to Book.
- **Open:** whether the game is Three Kingdoms with a light xianxia layer (the plan today) or a full xianxia game. This review assumes the plan as written.

## What the game is today

- **Genre and feel:** a top-down explorable story world in the style of GBA Pokémon, where each objective is cleared by solving a Go problem. A storyteller scroll opens and closes each Book. Cutscenes are acted out on the maps with portrait dialogue, voice-over and a Chronicle to replay them.
- **The loop, minute to minute:** walk to a marked story spot, a scene plays, the board opens, you solve it flawlessly, the rest of the scene plays, the next objective appears. A top-of-screen objective line and Wukong's pointer say where to go.
- **Rules:** a wrong move, hint, undo or Explore is a slip, a slip draws a new problem of the same grade, and bosses are the hardest problems of the Book.
- **Rewards:** only story items (horses, weapons, silver). The horses change travel and looks; the rest are shown in a scene.
- **World 1:** 24 scenes (15 main, 9 side), each with exactly one problem placed mid-scene. The Star Lords sit at the board in 4 of them (oath, Daxing, Qingzhou, Black Wind). Villagers and officials also set challenger problems.

## What is flat or repetitive

1. **Every scene has the same shape.** Cutscene, one problem, cutscene. Across 16 Books this will feel uniform without variation in what the player *does*.
2. **The player never acts on the story.** The Star Lords give a plan, then the characters carry it out in a cinematic (Qingzhou's ambush, Black Wind's blood). The player's only input is the problem.
3. **Problems often have no stated reason.** About 20 of 24 World 1 scenes open a board with no in-world reason, and challengers have their own reasons. The Star Lords' role is clear only in four.
4. **Rewards do not do anything.** Apart from the horses, items are decoration, so there is little to look forward to between bosses.
5. **Retry feel is untested.** Flawless-only with a new problem on every slip is clean, but there is no in-fiction response to failing.
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
| 6 | **Boss framing** | Keep the hard problem. Mark it clearly as harder, and the Star Lords give no hint ("This one is yours"). Earlier hint actions pay off in the cutscene around it, not on the board. Open question: for a few peak bosses, keep the same problem on a retry | Plot, Integ |
| 7 | **Vary where the problem sits** | Not always mid-scene: some scenes open with the problem, some have none, a few have two. Matches the plan's "some battles, some none" | Plot |
| 8 | **Book-end choice and replay hooks** | A small choice at each Book's end changes dialogue or a reward, never the novel's events. Plus hidden Star Lord encounters, the Wang Zhi legend area, and Chronicle completion | Plot, Gfx, Integ |

## The toolbox (supporting mechanics)

| Tool | Fits well | Does not fit | Notes |
|---|---|---|---|
| **Hint action** (go, find, collect) | Everywhere the Star Lords sit at the board | The great deaths | The baseline; Proposal 1 |
| **Fail, then prepare** | Black Wind (B1), Hulao (B2), Guandu (B5), Red Cliffs (B8), Nanjun (B9), poisoned springs (B14), Chencang (B15) | Daxing (the novel prepares first), the five passes, Dingjun, any real defeat | A first attempt before the conditions are met shows a defeat scene and no problem; a clue sends the player to gather strength. Plot's rule: use it only where the novel has a setback then a win |
| **Delivery** | Lu Zhi's errand to Yingchuan (B1), the ladies' escort (B4), the letter left for Zhuge Liang (B6), Kan Ze's letter (B8), the blotted letter (B10), Guan Yu's failed plea (B12), the sealed bag (B16) | Lady Mi and A Dou, the heads, wills, Xu Shu's forged letter (must deceive the player too) | Almost all outcomes are fixed by the novel, so the value is the journey and the twist. At most one required delivery per Book plus one optional. Twists: arrive too late, forged or altered letter, a trap, recipient gone, the carry is the harm |
| **Formation or flank placement** | The short battles (Qingzhou, Wuchao) | Where the novel needs the characters to act | Small and forgiving |
| **Choice beat** | Book endings | Anything that changes events | Dialogue or reward only |
| **Collecting** | Relics, forge and pills, Star Lord counsel collection | | The xianxia flavour, if wanted |
| **Discovery** | Hidden shrines, Star Lord encounters | | Replay value |

**Per-Book guidance:** one required extra mechanic at most, one optional; never two in a row of the same kind; the unwinnable stories (Changban, Maicheng, Yiling, Jieting, Wuzhang, Yinping) should let the player try and lose on purpose, with the Star Lords' hint saying it cannot be won.

## Difficulty and pacing notes

- The grade climb (12K to 7D) is already a progression ladder. If a xianxia flavour is wanted, grades can be named as realms and a breakthrough is a harder problem.
- A quiet Book should still end on a peak problem (the plan's reckoning bosses); a battle Book can end on a fail-then-prepare payoff.
- Fail and retry: keep "flawless only" for Go and add no failure state to the other mechanics. A wrong guess on a hint costs only a flavour line.

## Open questions for the user

1. Three Kingdoms with a light xianxia layer, or a full xianxia game?
2. Once a boss's conditions are met and the board is open, should a slip draw a new problem (current rule) or keep the same one for a few peak bosses? (The gated-defeat case is settled: no board, just a defeat scene.)
3. How many Book-end choices, and should they carry into later Books?
4. Do challenger NPCs stay as optional trainers or become the Star Lords' proxies?

## Suggested first pilot

World 1, Black Wind: the first attempt is routed by the storm (already staged); the Star Lords' hint is "pigs, sheep, dogs, blood"; the player finds the butcher or pen, carries the blood to the two ridges, and the Yangcheng scene shows the ambush working. This tests the hint action, the missions bar, a relic or item that does something, and fail-then-prepare in one place, using a scene that already exists.
