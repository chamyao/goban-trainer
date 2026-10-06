# Story scripts: the format Plot writes and the Converter turns into game data

**Plot** (story and sequencing) makes every creative decision: beats, order, lines, staging intent, stills, objectives, hints and mechanics. It writes them in this format, one file per book, `docs/scripts/bookN.md`.

The **Converter** turns the script into game data mechanically:
- `tools/tk_story*.py`, `tools/tk_places.py` and `tools/tk_story_zh.py`
- `assets/tk/stills/scene_prompts.json`

It makes no creative calls. Where the engine can't do what a script asks, it writes the problem under **Open** at the end of the script file and tells Plot. It does not improvise.

## A scene

````
## <scene id> — <Title> / <中文标题>
node: <key> · place: <Place> / <地名> · role: main|side|short|boss · after: <node key(s) it follows>
landmark: <kind> "<label / 中文>"   (the spot the player walks to; trigger: near|talk|arrive)
board: yes|no · problem: after line <n>   (or "dilemma", see below)
light: day|night|dusk|dawn|storm · music: <cue, optional>

On stage at the start: <who, where in plain words> ("Liu Bei at the gate; Zhang Fei a step behind; a crowd by the wall")

1. N: <narration> / <中文>
2. <speaker>: <line> / <中文>
3. [stage] <what happens, in plain words> ("Zhang Fei walks in from the road and stops behind Liu Bei")
4. [still <id>] over lines 4–6 — shows: <what the picture shows>
5. ...
   [problem]            (where the board comes up; everything after plays once it's solved)
...

Objective after: <text> / <中文>
Hint (optional): <counsel that stays under the goal line> / <中文>
````

Rules the script follows (Plot's side):
- Every person is named and explained before they act or speak.
- A still always comes after the line that explains it, and the script lists the lines it should cover.
- The first line follows from where the last scene ended.

Rules the conversion guarantees (the Converter's side, which needs engine knowledge):
- A still plays over exactly the lines the script lists. Any non-line step (spawn, move, prop, give, pose, light, remove, problem) hides it at once, so staging that the script puts before a still goes before it, and staging after it goes after its last line.
- An action the script places after a still's lines must not animate under the still.
- Steps before the first line are entrances, and a light there opens the scene in that light.
- Every English string has Chinese, and every speaker has a valid Kokoro voice.
- `python3 tools/check_story.py` and `python3 tools/build_tk.py` pass.

## Mechanics (as the script writes them)

- `dilemma: q=<question> · who=<id> · open=<line> · win=<line> · slip=<line>` (each with Chinese)
- `gate: needs <conditions> else <scene id> · objective <text> · count yes|no`
- `deliver: landmark <id> "<label>" · needs … · delivers <mark> · empty/waiting/call/deliver lines`
- `gives: npc <kind> near <landmark> · item <key> · when <condition> · give/given lines`
- `shrine: hint <text>`, the shrine under the pine, with the board

These map one to one onto `docs/story-mechanics-format.md`.

## A still request

`[still <id>] over lines a–b — shows: <one or two plain sentences>; category: everyday|bond|intrigue|battle|omen|peace|plan|aftermath`

The Converter writes the prompt in `scene_prompts.json`, in the existing style: simple, with no lists of things to avoid. It never asks for an existing still to be redone.
