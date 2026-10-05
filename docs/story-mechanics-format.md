# Story mechanics: the data format

How Plot writes shrines, gifts, deliveries, gated battles and scenes with no
board (the building blocks of `docs/mechanics-spec.md`). The engine reads
these from `tools/tk_story.py` (nodes) and `tools/tk_places.py` (people and
landmarks); `python3 -m tools.mapfactory all …` carries them into the game.

## Conditions

Everything that waits on the story uses one condition, or a list of them
(all must hold):

| Condition | Holds when |
|---|---|
| `"node:n7b"` | that story node is cleared (a short key is this world's) |
| `"item:pigblood"` | the party holds that item (an entry in the world's `items`) |
| `"mark:ridge_left"` | that place has been marked done (a delivery) |

## Nodes (`tk_story.py`, the world's `nodes`)

| Field | Meaning |
|---|---|
| `"board": False` | the node's scene has no problem. Reaching its spot plays the scene, and that clears the node (a defeat that moves the story on). |
| `"shrine": True` | this node is its place's shrine. The shrine is **dark** until the node is open, **lit** while it is open, **settled** once cleared. Touching a dark shrine says "The board is quiet."; a settled one repeats `"hint"` and the current objective. |
| `"hint": "Pigs, sheep, dogs. Blood."` | what a settled shrine repeats (Chinese from `ZH`). |
| `"gate": [ … ]` | a gated battle. Reaching the node's spot checks the entries in order; the first whose `needs` don't all hold plays its `else` scene instead of the board (no board, no cooldown, he stays there). When every entry holds, the node plays as normal. |

A gate entry: `{"needs": [conditions], "else": "scene id", "objective": "…", "at": "Place Name"}`.
`objective` (optional) replaces the objective line while this entry is the
first unmet one, with a count of the needs met, e.g. "Gather blood …
(1/3)". `"count": False` leaves the count off (when the objective shouldn't give the way away). `at` is where its targets are, so the guide points there. Supply
items (`"kind": "supply"`) named in a gate are removed when the battle is won.

Scenes named by `else` are staged at the node's own spot, like the node's
scene. They need no problem. `check_story.py` knows both cases.

Black Wind, for example:

```python
{"key": "n7",  …, "scene": "blackwind", "board": False},
{"key": "n7b", …, "scene": "shrine", "shrine": True, "hint": "Pigs, sheep, dogs. Blood."},
{"key": "boss", …, "gate": [
    {"needs": ["node:n7b"], "else": "bossearly"},
    {"needs": ["item:pigblood", "item:sheepblood", "item:dogblood"], "else": "bossearly2",
     "objective": "Defeat the Black Wind.", "count": False, "at": "Hills of Black Wind"},
    {"needs": ["mark:ridge_left", "mark:ridge_right"], "else": "bossearly2",
     "objective": "Defeat the Black Wind.", "count": False, "at": "Hills of Black Wind"}]},
```

with edges `n7 → n7b` and `n7 → boss`, so the boss spot can be reached
(and lose) before the shrine is solved.

## People (`tk_places.py`, a place's `npcs`)

| Field | Meaning |
|---|---|
| `"when": "node:n7b"` | only there once the condition holds (Guan Yu and his men on the ridge) |
| `"gives": "pigblood"` | gives this item, once |
| `"gives_when": "node:n7b"` | …but only once this holds; before it, they say their `say` |
| `"give": [lines]` | said as they give it (then "Gained: Pig's blood") |
| `"given": [lines]` | said if talked to again afterwards |

## Landmarks (`tk_places.py`, a place's `landmarks`): a place to deliver to

| Field | Meaning |
|---|---|
| `"needs": [conditions]` | what must be held to deliver here (items are not used up) |
| `"delivers": "ridge_left"` | the mark set when delivered (defaults to the landmark's id) |
| `"when": "node:n7b"` | empty until this holds |
| `"empty": [lines]` | said before `when` holds (default "There's no one here.") |
| `"waiting": [lines]` | said while not everything is held |
| `"deliver": [lines]` | the handover; then the place is marked done |
| `"delivered": [lines]` | said if visited again (defaults to `deliver`) |

Lines are as elsewhere: a string (narration) or `[who, text]`.

## Saves

Items and marks are kept per world (`tk-items`, `tk-marks`) and cleared by
Start over. Shrine looks are worked out from progress, never stored.
