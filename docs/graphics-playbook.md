# The graphics playbook: how the art is made

This describes how Graphics makes and fixes the game's art, so that a fresh session with only this repo can carry on.
It covers the painted stills, the dialogue portraits, the walking sprites, the cutscene props, and the map kits' pieces
and tiles. `docs/places-playbook.md` covers the maps and `docs/plot-playbook.md` the story; this file is the art around
them.

## Principles

1. **Jade is the main look.** Every kit piece is made for Jade first, and must also exist in Xianxia and Genshin (the
   drawing tools write all three). Check new art in Jade before anything else.
2. **Never regenerate an existing still.** A still the user has seen is theirs. A fault in one is fixed by an image
   edit of that same still (`tools/edit_still.py`), never by painting a new one. `install_stills.py` refuses an
   existing id unless given `--replace`, and that is only for when the user asked for a new picture.
3. **One try each.** A new still or portrait is generated once. Look at it, and retry only if it is wrong (a refusal,
   a timeout, a misread brief). A batch of two or three tries to choose from is something the user asks for.
4. **Draw in code what code can draw.** Walkers, props, kit pieces and ground tiles are pixel art drawn by Python or
   JS and cost nothing. Paid image generation is for the painted stills and the portraits.
5. **Look before it goes in.** Every piece is checked on a contact sheet (`tools/art_sheet.py`) before the commit: kit
   pieces on day grass and on the night tint, portraits on dark, stills as a grid. A layout change is checked in a
   headless browser at the user's window size.
6. **Say what it cost.** Each push names what it spent and the running total, so Integration can report it.

## Who owns what

| Area | Owner | Notes |
|---|---|---|
| Portraits, stills, walkers (`TK_CHARS` looks), props, kit sprites and tiles | **Graphics** | this file |
| Engine and HUD: `tk-world.js` effects, `tk-town.js` dialogue, `style.css`, kit `?v` keys | Integration | ask them; don't edit unless they hand it over or the user asks you directly |
| Plans, vocab (`tools/mapfactory/vocab.py`), map compiles | Places | they add a new kind to vocab with a stand-in; you draw it |
| Story, still briefs (`assets/tk/stills/scene_prompts.json`), cast lists | Plot | |

In-game feedback arrives through Relay, which sends Graphics only painted art (portraits, stills, sprites, kit tiles).
If an engine or HUD item reaches you anyway, forward it to Integration rather than fixing it yourself (a glow fix was
once done twice). When the user asks you directly, do it and tell Integration.

## Credentials and services

- **`REPLICATE_API_TOKEN`** comes from the environment (set in the cloud environment's settings). It is used for all
  generation and for the background remover. Never print, echo, log or commit its value. Never ask the user to paste a
  key into chat.
- **Seedream 5 Pro** (`bytedance/seedream-5-pro` on Replicate) does all painting. Stills are 16:9 and portraits 3:4, at
  `size: "1K"` (2K costs twice as much). One image costs about **$0.045**. An **edit** is the same model with the
  existing image in `image_input` and an instruction; it costs the same and keeps everything the instruction doesn't
  touch.
- **851-labs/background-remover** on Replicate makes the portrait cut-outs. Fetch its `latest_version`, then send
  `{image: data URI, format: "png", background_type: "rgba"}`. It replaced the old white-flood cut, which left a white
  fringe.
- **Retro Diffusion `rd-plus`** made the generated pixel buildings (`tools/gen_pixel.py`). Any side under 64 px comes
  back as 64.

## Stills

The briefs live in `assets/tk/stills/scene_prompts.json`, keyed by still id: `{book, category, beat, scene, notes}`.
Plot writes them and Graphics paints them.

`tools/tk_stills.py` builds each prompt from:
- the `scene` text;
- the cast descriptions it names (`CAST`, which keeps each person looking the same in every still);
- the style line, which is `STYLES["final"]` for everything now.

The game reads `assets/tk/stills/stills.json`: `{file, scene, prompt, provider, model, look, made, ...}`.

```
# 1. if Plot's briefs are on their branch, copy those ids into main's scene_prompts.json (never overwrite other ids)
# 2. paint, one try each, in the final style
python3 tools/gen_stills.py --review ID ... --tries 1 --look final --jobs 6     # -> stills/samples/review/<id>--final-1.jpg
# 3. look
python3 tools/art_sheet.py stills /tmp/sheet.jpg ID ...
# 4. put them in the game (new ids only)
python3 tools/install_stills.py assets/tk/stills/samples/review final ID ...
python3 tools/bump_cache.py stills
```

- **Fixing a still** (an extra blade, a cross cut that doesn't read):
  `python3 tools/edit_still.py ID "Remove only the third, unheld blade..."`, look at it, then
  `python3 tools/edit_still.py ID --install <file> "what changed"`, then `bump_cache.py stills`. Install stamps `edit`
  and a new `made` date. The still's URL key is `made`+`look`, so the browser fetches it again.
- **Reusing a still the user picked** for another id: copy the image over, copy its `prompt`, and set
  `look: "final-kept"` with a `note`. dc_garden uses garden_a this way, and fireflies uses fireflies_a.
- **The model's content filter** sometimes refuses a brief (E005: "flagged as sensitive"), for example a pig "ready to
  be killed" with a knife. Reword the brief in `scene_prompts.json` so it shows the moment without the violence, add a
  line to its `notes` saying Graphics reworded it, and tell Plot.
- **Text is allowed.** The user said there is no "no text" rule, so banners and plaques with characters are fine. Keep
  prompts plain and short; the user doesn't want them over-engineered.
- **The modern book (Misaeng).** Ids that start `ms_` (and `face_ms_*`) get `STYLE_MODERN` ("2D Korean webtoon, hard
  cel shading" and modern-day Seoul) and `FACE_STYLE_MODERN` instead of the Han lines; the cast's wording is in the
  `CAST.update` block under `ms_*` keys. Nothing else changes for the Han books.
- **No face references.** `REF_LENSES` is empty because the user found that reference images throw off the feel.
  Consistency comes from the `CAST` wording.

## Dialogue portraits

These are waist-up cut-outs in a Genshin-style cel-shaded look, used in the Genshin dialogue box, in Jade (kit flag
`"portraits": true`) and as the lead portrait beside the go board.

- Each prompt is `STILLS["face_<who>"]`, built from `CAST` or `FACE_LOOKS` in `tools/tk_stills.py` plus `FACE_STYLE`:
  a plain white background, half-body, three-quarter view.
- For a new speaker, add `"who": ("Name", "a short look: age, build, beard, clothes, what they hold")` to `FACE_LOOKS`.

```
python3 tools/gen_stills.py --review face_WHO ... --tries 1          # -> samples/review/face_<who>--1.png (3:4, white)
python3 tools/build_portraits.py assets/tk/stills/samples/review --remover 851 --only WHO ...
python3 tools/art_sheet.py edges WHO ...                              # only the bottom edge may be touched
python3 tools/art_sheet.py portraits /tmp/faces.jpg WHO ...
python3 tools/bump_cache.py portraits
```

- `build_portraits.py` writes `assets/tk/portraits/<who>.webp` (720 px tall at most) and the `portraits.json`
  manifest. Always pass `--only`: without it, it reprocesses every `face_*` in the folder. `PICK` maps a person to a
  try other than the first; Liu Bei keeps his original.
- **Framing (the cropped-portraits lesson).** The figure must fit inside the frame from the top of the head to the
  waist, with headroom and a margin on both sides. A cut-out touching the top, left or right reads as cut off in game
  (apo110 flagged eleven). The cause is the generated art itself, not the display, which shows the whole image.
  `art_sheet.py edges` reports any edge that is touched. Fix a bad one with
  `python3 tools/outpaint_portrait.py WHO`, which outpaints the same art on a wider canvas, then run `build_portraits`
  on `assets/tk/stills/samples/review/outpaint`. When the user is choosing, redo only the worst ones; they said so.
- **Leftover background.** The remover sometimes keeps a patch of the white background glow, as on Li Jue's cape.
  Clear the near-white pixels connected to the image edge (alpha 0, feathered 1 px). Don't regenerate.
- **Timeouts.** A Replicate `ReadTimeout` fails one image. Retry that one once.

## Walking sprites (the cast's looks)

Story people are drawn in code by `TKArt` (`tk.js`) from their look in `TK_CHARS`. That gives the walk frames and the
pixel bust used when a speaker has no painted portrait. `tools/check_story.py` reports `needs art: character 'x'` for
anyone without one.

- **Fields:**
  - `name`, `skin`, `hair`, `robe`, `trim`.
  - `hat`: topknot, guan, scholar, helmet, band, straw, yellowband, lady, bun or twinloops. `hatC` sets its colour.
  - `pin`, `pin2` and `flower` for the women's hair.
  - `beard`: none, thin, short, long, goatee or bristle. `beardC` sets its colour.
  - `eyes`: kind, round, narrow, phoenix, wild or normal.
  - `weapon`: sword, swords, spear or glaive.
  - flags: `fat`, `patch`, `makeup`, `ears`.
  - modern dress (Misaeng): `shirt` (a jacket's shirt; without it, shirtsleeves with a belt in `trim`), `tie`, `legs`
    (trousers, or the skirt with `skirt: true`), `glasses` (the frame colour). With `legs` and no shirt or tie, the
    collar is a plain neckline. Modern hair in `hat`: short, fringe, parted, slick, messy, curly, perm, balding, buzz,
    bob, long, ponytail, cap. `beard: "stubble"`.
- **Fit the person to the story.** Old characters get grey or white hair and a long beard, officers a helmet and a
  spear, and Lady Sun a sword. A user once caught an old man's bust reused for a young man; it was a look copied
  without care.
- **Special looks:**
  - `clawd: true` draws Claude as the Claude Code mascot.
  - `horse: "red"` makes the person a horse in that coat. The coat is `assets/tk/horses/<coat>.png`, a recolour of
    brown.png, and the coat must also be listed in `WorldItems.COATS` (tk-items.js).
- **Preview** the sprites and busts in headless Chromium: load `tk.js` in a page and draw `TKArt.get(who, 'sprite')`
  and `TKArt.get(who, 'bust')` on a canvas. Then bump the script key: `python3 tools/bump_cache.py script tk.js`.
- There is no child size. A 9-year-old uses the same sprite height.

## Cutscene props (`assets/tk/props.png`)

`tools/build_props.py` draws every frame and registers each kind in `PROPS`: its footprint and its art.

```
python3 tools/build_props.py               # -> assets/tk/props.png + props.json (frames, kinds)
python3 tools/art_sheet.py props /tmp/p.png FRAME ...
python3 tools/bump_cache.py props
```

Name frames the way the engine asks: for example `carriage.<left|right|down|up>.<shut|open>` (Lady Sun's carriage) and
`item.<name>` for Bag icons (`item.pouch1`–`item.pouch3`). Tell Integration the frame names.

## Kit pieces and ground tiles

- **Map kinds** (`furn.jailcell`, `ruin.burning`, `deco.redhang`, `prop.gateshut`, ...) are drawn in code in
  `tools/draw_b2_extras.py`. There is one function per piece, using the `Grid` helper from `draw_tk_extras.py`, and it
  is registered in `PIECES`.
- **Ground materials** go in `TILES`, with aliases in `SAME`.
- Running the script packs everything into `assets/tk/drawn_b2.png` and `drawn_b2_tiles.png` and writes the kinds and
  materials into all three kit jsons.

```
python3 tools/draw_b2_extras.py
python3 tools/art_sheet.py kinds /tmp/k.png jade KIND ...
```

- Kit sprites are `[sheet, x, y, w, h]`. The runtime reads the sprite from the kit, so a redrawn sprite needs no map
  recompile. A changed footprint does, and that's Places' job.
- The kit and sheet cache keys (`kits ?v` in `tk-world.js`, which the sheets follow) are Integration's: ask them to
  bump them. Any change to a sheet image needs that bump.
- **Building on the kit's own art** keeps a piece in the same view and scale. `ruin.burning` is Jade's own
  `building.house` set alight, and `banner.white` and `banner.black` are its red banner recoloured.
- **Generated buildings:** `tools/gen_pixel.py --set <set>` (Retro Diffusion), then pick tries in
  `tools/build_b2_buildings.py` `PICKS`. Rockeries and ridges came back as whole scenes, so they were drawn in code.
- **The shrine** (`tools/pine_rock.py`) is a stone monkey statue in three states, in each kit's own rock colours.

## Handing work to Integration

1. Work on `claude/tk-plot-w1`, rebased on `origin/main`, with small commits that can each be reverted. Push to
   `claude/tk-plot-w1` and mirror it to the session's own branch.
2. **Before any `git reset --hard origin/main`, check `git log origin/main..HEAD`.** A reset over unmerged commits,
   followed by a force-push, once erased five finished map pieces from the branch. If commits are unmerged, stack on
   top of them, or rebase.
3. Send Integration a message with:
   - the commit hashes;
   - what changed;
   - the cache keys you bumped and the ones they need to bump (kits);
   - frame or kind names that are new;
   - the cost and the running total.
4. If main moved, resolve conflicts in `index.html` by taking main's file and bumping your scripts once more. Merge
   `scene_prompts.json` as a union of keys, never one side.

## Lessons a newcomer would get wrong

- **Half sprites.** A kit sprite that crops one tile of a two-tile drawing shows as half a bush. Check every new crop
  with its 8 neighbours on the sheet. The kit's ground `detail` list had the same fault.
- **Repeating gradients make stripes.** A tile darkened top to bottom repeats every row and reads as a bookshelf. A
  cliff became shapes lit from the upper left that wrap at the tile's edges.
- **A layered tile reads as paving from above.** Cliffs need rock shapes, not bands.
- **Check at night.** Smoke, fire, torches and dark cells must read on the night tint as well as on day grass.
- **Ids in `scene_prompts.json` may have no `_`.** `fireflies` once broke `tk_stills` at import.
- **`pkill -f "http.server 8799"` also matches its own shell and kills it.** Use a bracket, as in `"http.server 879[9]"`.
- **The board-scene portrait** (`.tk-duel-lead`) stands in the frame's bottom-left corner and tucks behind the board.
  `tests/playtest/board-layout.js` allows that overlap only when the portrait's z-index is lower.
- **Testing the game headless:**
  - Run `python3 -m http.server` in the repo.
  - Use Playwright with `tests/playtest/vendor/phaser.min.js` routed in.
  - Clear the username prompt ("Cancel").
  - Mark nodes cleared with `TK.markCleared`.
  - Reach the world through `window.__w` (`act`, `talk`, `duel`).
- **Ask before wide-scale generation.** Standing approval covers new stills and portraits for the book in hand. A
  sweep over existing art, a batch of tries or a new look is the user's call.
