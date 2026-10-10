# Misaeng (world 21): the engine's syntax for the book's new mechanics

Integration alt2 wrote this for Plot alt2 (the story file) and Places (the maps). Misaeng is **world 21**: its beat keys
are `21-m1` … `21-m24` in the built data, `m1` … `m24` in the story file. The design is `docs/book2/misaeng-arc.md`.
The user's call on the six engine requests: "go with whatever the plot session asked for". So all four mechanics
are built, plus the English-only flag, as one book (m1–m24).

Everything below is gated on the world. A book without these keys plays exactly as before.

## 1. English only: `"lang": "en"`

The story file is `tools/tk_story_w21.py` and exports `WORLD21`. Lines are English only:

```python
N(en)                 # narration                      -> ["n", en]
S(who, en)            # a spoken line                  -> ["say", who, en]
T(en)                 # a title, objective, caption    -> en
D(who, q, open, win, slip)   # a board's caption and the decider's lines (as Book 15's D, without the Chinese)
```

- World keys: `"lang": "en"`, `"name"`, no `"zh"` (or `""`). Items carry `"name"` and no `"zh"`.
- `build_tk.py` gives every line `""` for its Chinese. Its voice clip id is taken from the English, so English voices
  are the only ones. `check_story.py` doesn't ask for Chinese in this world. In either voice setting, the game plays
  the English clip.
- Voices: `CAST21 = {cast id: Kokoro English voice}` (e.g. `"jang": "am_adam"`, `"ahn": "af_nicole"`). Townsfolk
  kinds speak in `FOLK_VOICE_EN`. Integration renders the clips.
- Places' map lines for world 21 need no Chinese either.

## 2. The record and the frame strip

World keys:

```python
"record": {"sgf": "docs/book2/misaeng-ing-cup-g5.sgf",
           "title": "1st Ing Cup final, game 5", "black": "Cho Hunhyun", "white": "Nie Weiping"},
```

`build_tk.py` reads the SGF into the 145 moves and checks that every asked move is Black's move in the game.

Node keys:
- `"move": 28`: the beat opens on the game played up to move 28. A small board (the strip) shows the position, the last
  move marked, with "Move 28" under it. It shows at the scene's start and stays in the goal box while the beat is
  open. `"move": 0` is the empty board.
- `"record": 29`: the beat's board asks for Black 29. The position before it is shown on the full board. One point
  is correct. A wrong point gets the usual rest, then the same position again. The board's caption is the beat's
  dilemma `q` ("Find Cho Hunhyun's move."). The decider's lines work as they do on any board.
- A scene that poses a record board and then a tsumego (m6, m17, m22): `"record": [29, None]`, one entry per
  `["problem"]` step in order (`None` is an ordinary problem). The dilemma can be a list in the same order.
- A record board doesn't count toward the adaptive rating.

## 3. The audit board (m12–m13)

World key:

```python
"audit": {
    "title": "The audit board",
    "clues": ["statements", "coached", "icb_number", "board_list", "james_park"],   # item keys, all kind "clue"
    "links": [   # in order: the board asks each question in turn; the right two clues answer it
        {"q": "Why is Baekjin's margin so high?", "pair": ["statements", "coached"],
         "a": "Someone taught Baekjin what to say. The numbers are dressed."},
        ...
    ],
    "done": "audit",     # the mark set once every link is made: a gate's "mark:audit"
},
```

- Clue items: `"statements": {"name": "Baekjin's statements", "kind": "clue", "text": "…what it says"}`. They are got as
  any item is (a scene's `["gain", key]`, a person's `gives`, a spot).
- The audit board opens from the bag (the header's Bag → "Audit board") once two clues are held, and from a spot with
  `"opens": "audit"` (Places: the `audit` room's table, `sales3`'s whiteboard).
- On the board: the current question at the top, the held clues as cards. Tap two. If they're the question's `pair`,
  its answer `a` shows and the next question comes up. If not: "Those two don't connect." Linked pairs stay drawn.
- Gate m13 on it: `"gate": [{"needs": ["mark:audit"], "else": "m13_wait", "objective": T("…"), "at": "One International"}]`.

## 4. The trade loop (m18, ₩100,000)

World key:

```python
"trade": {
    "cash": 100000, "unit": "₩",
    "goods": {"socks": {"name": "Socks (10 pairs)", "cost": 20000}, ...},   # what the shop sells
    "done": "trade",            # the mark set when the mission ends
    "ends": {"offers": 5},      # it ends after this many offers (made or refused), or when cash and stock are both gone
    "when": "node:m17",         # the mission is on from here (m17 cleared) until its beat is cleared
},
```

Townsfolk (Places' `npcs`, or a scene's spawned people):
- `"shop": ["socks", "squid"]`: a seller. Talk to them and you buy, one unit at a time, while you have the cash.
- `"buyer": {"wants": ["socks"], "pays": 30000, "yes": [lines], "no": [lines]}`: a passer-by you can offer to. With
  `"pays": 0` (or no `pays`), the offer is always refused (`no`).
- `"rival": {"say": [lines]}`: the corner-shop owner. When you talk to them during the mission they out-sell you; it
  counts as an offer.
- A HUD chip shows cash and stock while the mission is on.
- Gate m18 on `"mark:trade"`. The mission fails as written: the scene after the gate plays the failure.

## 5. Setting the room (m17)

This uses what the engine has, plus two small keys.
- Props are items (`"tray"`, `"pens"`, `"water_dir"`, …, `"kind": "prop"`). They are given by a person (`gives`) or
  a scene (`["gain", …]`).
- The notes: an item with `"text"`. The bag shows the text, so the player can read which seat gets what.
- Each place at the table is a Places spot with `needs: ["item:tea"]`, `delivers: "seat_president"`,
  `deliver`/`waiting`/`delivered` lines, and the new `"takes": true`: delivering takes the item out of the bag.
  `waiting` is what's said at a seat when you don't hold the right thing ("The notes say the president's water goes
  here.").
- A prop with `"when": "mark:seat_president"` shows the thing on the table once it's placed.
- Gate the rehearsal on all the seats: `"needs": ["mark:seat_president", "mark:seat_md", …]`.

## 6. What else the beats use (existing, unchanged)

The node keys `role`, `place`, `room`, `scene`, `board: False`, `cutaway`, `gate`, `dilemma`, `hint`, and scene steps
(`n`, `say`, `spawn`, `move`, `pose`, `gain`, `lose`, `still`, `problem`, `party` with `{"to": …}` handoffs,
`victory`) are as in Book 15 (`tools/tk_story_w2_new.py`, `_nodes_ladysun` and `_scenes_ladysun`).
