# Misaeng: working notes for the next Plot (alternate 2)

Context that lives outside the briefing. Read it with `misaeng-arc.md` and Integration's `misaeng-engine.md`
(branch `claude/integration-alt2`).

## 1. Building beats in `tools/tk_story_w21.py`

- Helpers: `N(en)` narration, `S(who, en)` speech, `T(en)` titles, objectives and labels, `D(who, q, open, win, slip)`
  a decision board (the caption, then the decider's lines when it opens, on a win and on a slip). English only.
- Scene steps: `spawn`, `move`, `remove`, `prop`, `n`, `say`, `problem`, `gain`, `lose`, `still`, `emote`, `party`
  (`{"to": {"place", "spot" | "from"}}`), `victory`. Each `["problem"]` in a scene takes the next board in the node's
  `dilemma` (a single `D(...)` or a list).
- Nodes: `key`, `x`/`y`, `role`, `place`, `room`, `scene`, `move` (the frame game is shown up to this move), plus
  `record`, `choices`, `dilemma`, `gate`, `cutaway`, `board`.
- **Handoffs into a room name the room map**: `one-international--sales3`, `korea-baduk-association--kba-trainees`,
  `jongno--pojangmacha`, `one-international--textile`, `one-international--roof` (Places).
- Gates: `{"needs": ["mark:..." | "item:..."], "else": scene, "objective": T(...), "at": place}`. A gate with several
  needs shows a count such as "(0/3)". That is intended for parallel errands (m14's three errands).
- Every objective says **where** (the testing session's finding).
- New spoken lines need a `KO21` entry (English line to Korean line). That includes Places' map lines (folk, props),
  which live in KO21 too. Remove KO21 entries for lines you cut.
- Mark staging or invented beats in comments, `(staging)` or `(invented)`.

## 2. Record boards (multiple choice)

- `"record": n` or a list such as `[11, None]` (one board per `["problem"]`; `None` is a decision board).
- `"choices": {n: [[sgf, points_lost], ...]}`. Cho's move comes from the SGF and is not listed.
- The engine picks three alternatives by the player's rank: ≤15K 1.5–3 points, 10–14K 0.7–1.5, 5–9K 0.3–0.8,
  stronger ≤0.5. The user: "most reasonable moves are within 1".
- Every candidate must score **below** Cho's move. In 1989 Cho's move is often not KataGo's first choice, so
  only list moves that score worse than his.
- Scoring: `tools/ms_score_choices.mjs` (run it against a local `http.server` on port 8321, with Playwright's Chromium).
- Open check: B11's list (m19b) is 3.1–6.15 points, above every rank band. Rescore around cp with nearer
  candidates.
- Frame-game facts checked: B11 is cp, solidly connected to B9 (cq). B145 captures nothing; White's five stones
  can't escape.

## 3. Decisions to keep

- One book per printed volume, worlds 21–29. 1–2 beats per episode, whichever fits; the user: "the variance doesnt
  necessariily have to be 50 50 between 1 and 2 beats, go with what makes sense".
- English only on screen ("we dont need chinese lines for this"). The Korean voice-over is through Integration.
- Still briefs (`assets/tk/stills/scene_prompts.json`, `ms_*`): name a person only when their CAST look fits the
  scene; otherwise describe them ("in a red-brown coat").
- m14's floor errand is the mop (`item:mop`, Places).
- Every other session (Integration, Places, Graphics, testing) works in its own daughter session.

## 4. Where Book 1 stands

- m1–m22c are written from the comic: eps 0–10 (`misaeng-read-ep0-10.md`, Kakao), ep 11 (`misaeng-read-ep11.md`,
  Kakao), eps 11–16 (`misaeng-read-ep11-16.md`, the Toomics English edition in the user's repo `chamyao/misaeng`).
- "My heroes are fading away" is a dream in ep 12 (m19c), not a clippings memory.
- There is no lobby-bin search: the scrap is glued to the waybill (ep 13). Places' bins spot and its line
  ("You go through the bins by the gates…") are now unused.
- Open: rescore B11's choices (above).
