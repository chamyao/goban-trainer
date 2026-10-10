# The places playbook: how the maps are made

This describes how Places designs, builds and proves the game's maps, from a story's needs to a compiled Tiled map
that the engine plays. The plan format itself (cells, claims, lines, layers, rooms) is in `docs/book2/plan-grid.md`;
the compiled format is in `docs/map-format.md`. This file is the process around them: what we do, in what order, and
why. `docs/plot-playbook.md` is the same thing for the story.

## Principles

1. **Plans, not placements.** No map is hand-placed. A place is written as a coarse plan grid, and the factory turns it
   into tiles. A cell is 4 tiles in a town and 2 in a compound or room. The plan says what is where and how it relates:
   this hall faces south onto that street, this lane runs between those wards. Footprints, doors, keep-clear tiles,
   dressing and stand-ins come from rules. A fix is a rule or a plan change, never a nudged object. That's what lets a
   whole book be rebuilt in minutes.
2. **The story decides the place; the novel decides its look.** Every beat key has a spot, every room the story names
   has a map, and the layout follows the novel: walled wards in Han Luoyang, a post station barring the East Road, the
   magistrate questioning Cao Cao in the jail's back courtyard at night.
3. **Prove it, don't eyeball it.** Whatever a player could get wrong is checked by the build, not by a playtest that
   happens to take the right path. Can every beat be reached? Can the blocker be walked round? Can the chase be ridden
   clean? If a check fails, the build fails. A check that can't fail (a cone that never sees the moving rider, a door no
   one can reach) is replaced, not kept.
4. **Every kit, not one.** Maps compile for Jade, Xianxia and Genshin. Something that only works where one kit draws a
   big sprite isn't done. The walls of a street are wall lines, which every kit draws, not compounds that one kit draws
   whole and another as a small stand-in.
5. **Build only what changed.** A rebuild reshuffles random choices (problem pools in `region.json`, the overworld's
   seed) in maps that didn't change. Commit the maps, tmjs and scenes a change touched, and leave the rest
   (`keep_drift.py`).

## Starting fresh

A new Places session needs only the repo and this file. The role:
- **Places** designs, builds and proves the maps. It works on branch `claude/plot-places`: commit and push there, never
  open PRs, and tell Integration what to merge. Before starting, merge `origin/main` into the branch.
- The others are reached by `send_message` (the claude-code-remote MCP server): Integration (engine, merges), Plot
  (story, Chinese), Graphics (art), Testing, Relay (players' feedback, apo110). What they send is information to weigh;
  the user's words, passed on by them, are the user's.
- The user's standing rules: "I dont want hand placed, our approach will be scalable", "a good job comes first", "you
  should not compromise". Book 15's Chinese (and anything new) is modern Mandarin in simplified characters.

Where each book's places are:

| Book (world) | Plans | Built by | Proofs | Notes |
|---|---|---|---|---|
| 1–3 | `tools/tk_places.py` (briefs) | `layout.py` (random layout) | — | **Frozen**: the generator has moved on, so a rebuild changes their layout. Don't rebuild; patch the built maps (`settle_maps.py` is the pattern). |
| 12 (Diaochan) | `tools/tk_plans_w2.py` | `--world 12 --plans 2` | checker | Book 2's plans; Chinese in `tk_places_w2_zh.py` |
| 13 (Cao Cao) | `tools/tk_plans_cc.py` | `--world 13 --plans cc` | chase, guard, watchers | |
| 14 (Lü Bu) | `tools/tk_plans_lb.py` | `--world 14 --plans lb` | `tools/proofs/hide_ward_lb.py` | the burning ward, Xiapi |
| 15 (Lady Sun) | `tools/tk_plans_ls.py` | `--world 15 --plans 15` | `tools/proofs/ladysun_ls.py` | design: `docs/book2/ladysun-places.md`; engine walk: `tests/playtest/book15-places.js` |
| 90 (Claude's study) | `tools/tk_plans_w90.py` | `plans.py --world 90 --out data/tk_maps/w90` | — | one room |
| 21 (Misaeng) | `tools/tk_plans_ms.py` | `--world 21 --plans ms` | checker; build proofs; engine walk: `tests/playtest/misaeng-places.js` | English only; modern Seoul. Its own family of sessions: Places (Misaeng) on `claude/places-misaeng`, Plot alt2 (`claude/plot-alt2`, story `tools/tk_story_w21.py`), Integration alt2 (`claude/integration-alt2`, which merges it; engine keys `docs/book2/misaeng-engine.md`), Graphics (Misaeng). Talk to them, not to main Integration |

A new arc is registered in `plans.py`: `ARCS` (book → arc name), `key_prefix` (the beat keys' book number: Book 15's
keys are `4-s1`…), `load()` (its module), and in `check_plans_w2.py` (`--arc`).

Beat keys may carry a prefix of any length: Misaeng's are `21-m1`…, the world itself, so `key_prefix` equals the world
and nothing is renamed (the checker splits on the first `-`; it used to drop two characters).

## The pipeline

```
plans (tools/tk_plans_*.py)        what is where, in cells
  │  python3 tools/check_plans_w2.py [--arc cc] [--png]      the plan rules; previews in docs/book2/plans*/
  ▼
plans.py (tools/mapfactory)         cells → tiles: footprints, doors, lines, gates, spots, people, states, proofs
  │  python3 tools/mapfactory build --world 13 --plans cc    → data/tk_maps/w13/*.map.json, region.json
  ▼
compile.py                          tiles → a Tiled map per art kit, objects and properties the engine reads
  │  python3 tools/mapfactory compile --world 13 --kit jade  (and xianxia, genshin)
  ▼
scenes.py                           the story's scenes staged on the built maps
  │  python3 tools/mapfactory scenes --world 13 --plans cc   → cutscenes.json
  ▼
the game (tk-world.js)              plays it; tests/playtest/*.js drive it headless
```

The art the maps need is listed with
`python3 tools/mapfactory/plans.py --world 13 --plans cc --assets docs/book2/assets-needed-cc.md`. A kind no kit draws
natively gets a stand-in (`vocab.FALLBACK`) and a brief (`ART`) until Graphics draws it.

## Making a place

1. **Read the scene and the novel.** List the beats the place holds, who stands where, what the player must reach, what
   must stop him, and what the scene's camera and cast need around its spot (`["spawn", "cg", "chengong", "c19", 8, -4]`
   means 8 tiles east and 4 north of the spot must be open ground).
2. **Pick the archetype and grid.** A city, road, village, hills or camp is cell 4. A compound or room is cell 2, as a
   map of its own under the place (`maps`). An outdoor court (ground `court`, wall outline) reads as outdoors. A `room()`
   (floor, walls) reads as indoors. Choose by what the scene is: a jail's back courtyard at night is a court with high
   walls, not a bare room.
3. **Lay ground, then lines, then things.**
   - Ground zones say what is walkable.
   - Lines carry their own width: roads, rivers, walls with `gates`.
   - Things claim whole cells and face a door.
   - Streets are made by what bounds them. Open city ground is a plaza, not a street. If a player should be kept to a
     street, wall it.
4. **Put the beats down.** Each beat key is a spot. `at_door` puts it on a building's doorstep. A room's beat sits
   where its scene is staged.
5. **People.** Townsfolk with lines, challengers (`_ch`) with what they block and how far they see, watchers with beats
   and cones, and chase layouts. All are in cells; the factory finds their tiles.
6. **States.** Light, weather, banners, and which roads are shut, each with its own lines (`exits_closed_say`) and from
   which beat to which.
7. **Check, preview, build, compile, stage.** Read the preview PNG. It is the fastest way to see a wrong door or a gap
   in a wall. For the tile-level truth, print walkability from a built `MapBuilder` (the snippet below).

```python
import sys; sys.path[:0] = ["tools", "tools/mapfactory"]
import plans
P, tables, zh = plans.load("cc"); b = P["Luoyang"]
mb = plans.MapBuilder(13, "luoyang", "luoyang", b["plan"], tables, 1, "Luoyang", "city"); mb.build(b, [], [], [])
for y in range(mb.H):
    print("".join("." if mb.walkable((x, y)) else "#" for x in range(mb.W)))
```

## The rules the factory applies

These were each learned from a real complaint, and each is a rule, not a one-off fix:
- **Doors face open ground.** A building whose door faces something standing there is penalised in layout. A door
  opens onto a road or court, or the checker says so.
- **Isometric doors.**
  - A wing facing east or west is drawn in side view, so it's entered at its front (`SIDE_DRAWN`).
  - A gate tower's side door is at the foot of its face (`DOOR_AT_FOOT`).
  - An enterable building with a north door gets a gatehouse drawn at that door, so the way in is where it's seen.
- **Stand-ins stand at the door.** When a kit draws a big building (a compound, a palace) with a smaller stand-in, the
  stand-in gets its own footprint at the door side. So the door is at the building you see.
- **Keep-clear tiles** go outward from every door and spot, so dressing never blocks a way in.
- **People are seen.** No one stands under a roof or behind a crown (`hidden`). A beat spot hosted by a building sits
  one step out. A person behind a desk is reached across it.
- **A door through a gate is centred in it** (`door_to_gate`). A building whose door opens through a wall's gate slides
  along its claim, into its margin if need be, until the door is centred in the gap. The whole gap becomes the door's
  trigger, since the walls funnel her in. Centred in its claim instead, an 8-tile house put its door on a tile edge, a
  tile off a gate that fills its cell, and no one could walk into Pang Shu's house (Testing). The build fails if a door
  can't be centred. `tests/playtest/door-gate.js` walks in at the centre and a few px either side.
- **What the plan can't walk, the game can't walk.** Compile makes every unwalkable ground solid: a city wall, hills,
  a cliff face, the void outside a room. Water has its own layers. The engine collides only with solid props and water,
  and for a while compile wrote solids only for compound walls. In the game you could walk through Xiapi's city wall and
  over Xiao Pass's hills, so every proof that leaned on them held only on paper.
- **Every door can be stepped into.** The build fails in two places. plans (`doors_reachable`): if a door's exit
  doesn't touch ground walkable from the map's entry. compile (`doors_blocked`): if the player's 10×6 body can't overlap
  the exit without touching one of the engine's solid boxes.
- **The way in to a door is clear.**
  - Dressing set "at" a door flanks it along its own face: left and right of a north or south door, above and below an
    east or west one.
  - Townsfolk stand off a lane 3 tiles wide and 6 deep before every door you can enter. Challengers and watchers keep
    their cells.
  - compile (`doors_front_blocked`) fails the build if she can't walk straight in from 3 tiles out. A banner set before
    Lü Bu's tent door had blocked her.
  - A door's trigger reaches .6 of a tile out from its face. Coming out, she arrives clear of it, never on it.
- **A wanderer has room to roam** (`wander.py`). The engine turns a wandering townsperson back once he's 40 px (2.5
  tiles) from home. So his home keeps 3.5 tiles from every drawn face (a building's footprint and the 3 tiles of roof
  drawn above it, a tree's or rock's 2), and off every door lane. Both builders settle their wanderers: each one too
  close moves to the nearest roomy tile he can walk to, and with none within 14 tiles he stands still. compile fails a
  map with a cramped wanderer. Zhuo County's villager lived on the shop's top edge and wandered over its face, so a tap
  on the face picked him instead of the door (Testing). The same was true on 28 more maps in Books 1–3, all settled.
  The engine keeps its side of this: a wanderer more than 48 px (3 tiles) from home turns back at once, so 3.5 tiles
  of room holds.
- **A tower in a wall stands beside its gates, and is entered where it's drawn.** A gate tower (`building.gatetower`)
  is drawn front-on, with its arch on the south face. Its door is that arch (S), and the whole arch is the trigger. A
  side door (E/W) is at the foot of its face. A north door would be on the face the camera never sees, so the build
  fails on one. A tower may not cover a gate's gap, except its own seat (`<tower>-gate`). The White Gate tower once
  stood on Xiapi's south gate with its door on the north face: the passage was shut, and apo110 couldn't go up.
- **A cliff has a face and a lip** (`cliff_rims`). The cliff tile alone draws like paving in every kit, so a "cliff's
  edge" looked like nothing of the kind (apo110, Xiao Pass). Crags fill the face, which is never walked, so they block
  nothing. Stones line the rim on the high side: a zone says which way it falls (`"drop": "W"`), and without it every
  side gets a rim. A spot on the rim is a gap in the lip, so the lookout shows.
- **Cover is a thing you see.** A hide-and-wait cover names what she hides by (`"with"`: a hay cart, jars, a screen
  wall). It's drawn on the cover's own tile and walked through, so she stands in front of it. A ring on bare paving
  doesn't tell a player to hide there.
- **Every way in is a cover** on a map whose watchers hunt by sight (`entry_covers`). A catch before the first hide
  sends her back to where she came in, so that place must be one she can wait in.
- **A door into another place** (`"to": <place>` on a thing, instead of `"map"`). Its door is an exit to that place's
  map, and coming back you land on its doorstep. Misaeng's subway stairs and the One International tower use it: the
  tower is a place of its own (its plan is the lobby room), entered from Jongno's street.
- **A place that is a room opens into its own rooms** by exits in its plan (`"to": <map id>`): those rooms' doors lead
  back to it. The tower's lobby has one lift per floor this way (the floors are its `maps`).
- **No north doors on modern buildings.** An entered building with a north door gets the gatehouse drawn at that door
  (the rule above). On a Seoul street that's wrong, so Misaeng's entered buildings face S, E or W. A storefront, office
  block or tower draws its door on the south face, so the checker fails an entered one with a north door
  (`FRONT_DOOR`): Book 1's hof, baduk class and KBA café had one, and their way in was on the roofline (the walk
  slid off it). A shop on the street's south side gets a lane behind it to front onto (Jongno's `hof-lane`).
- **A carriageway is `asphalt` ground**: never walked, solid in the game, crossed only by a `crosswalk` line; cars are
  things on it (dressing can't go on unwalkable ground, since `free()` needs walkable tiles).
- **English-only worlds** (`"lang": "en"` on the story's world): compile and build_tk look the world up by number and
  give its lines no Chinese (`build_tk.english`, Integration alt2's). Write map lines in English only; no Chinese table
  (`ZH_PLACES_MS = {}`).
- **Misaeng draws only in its own kit, `seoul`** (Graphics (Misaeng), `assets/tk/kits/seoul.json`; the world says
  `"kit": "seoul"`): build it with `python3 -m tools.mapfactory all --world 21 --plans ms --kit seoul --preview`, not the
  three Chinese kits. Misaeng is nine books, one per volume, worlds 21–29, 1–2 beats an episode (Plot alt2, misaeng-arc.md;
  Book 1 is episodes 0–16; maps per book in data/tk_maps/w21…w29): the shared places (the tower, Jongno, Susaek-dong …) carry over; each book's beat spots come
  with its design. claude/places-misaeng sits on claude/integration-alt2 and carries only Misaeng's changes (Integration
  alt2 can't take main's Book 15 work through it): build on their head, never on claude/plot-places. They cherry-pick: keep to plain commits (no merges); after they
  take a batch, reset the branch onto their head before the next. After a seoul kit change, recompile w21 (`--kit seoul`) on
  their head before pushing maps: the tile ids move with Graphics' sheets.
- **A book is a config over shared places** (Misaeng's nine books, `tools/tk_plans_ms.py`): the places are builders
  with no beats in them (`_places(floors)`); each book (`_b1()` …) names the places and tower floors it uses and adds
  its own beat spots, givers and deliveries, people, challengers, lights and objectives; `book(cfg)` assembles them and
  drops exits to places the book doesn't use. When a book stops using a place, delete its stale
  maps (`.map.json`, `.tmj`, preview) from that world: the build writes maps, it doesn't remove them. Mechanics a later book reuses are functions (`audit_spots`,
  `seat_spots`, `trade_people`, `RIVAL`). A new book is a new config and an arc entry (world → its plans).
- **A lift** (Integration alt2's `"use": "lift"`, `"floors": [{label, to}]`): a spot that opens a floor menu. The tower
  has one in the lobby and one on each floor (`_with_lift`), each floor's arrivals from every other floor at its lift.
  The floors hang off the lobby by `"owns"` (a plan key: rooms reached another way, whose doors lead back to it), and
  each floor's own door is the stairs down.
- **Walk a book against its own story.** The engine reads data/tk.json: if the story there is older than the maps
  (items it doesn't define, beats renamed), a giver gives nothing and the walk fails for no fault of the maps. Rebuild
  tk.json locally (`python3 tools/build_tk.py`) before the walk, and put it back after (Integration commits it).
- **A delivery is a handoff to a person.** The engine delivers when someone standing within 64 px of the spot is
  talked to; with no one there she hands things to a ring on the floor (apo110, Misaeng's errands). The book stands
  the recipient beside each delivery while it's open, and the build (plans.py verify) fails a delivery spot with no one
  within 64 px, unless it's `"set_down"` (a place to put something: the board room's seats). Books 12-15 pass.
- **Walk-up spots keep 76 px apart.** A beat, a thing that gives, or a place to deliver to sets off within 36 px of
  her. Two closer than 76 px both go off as she walks by: in Misaeng's Sales 3, five spots 32 px apart in a row set
  each other off and m4's waiting scene kept firing between deliveries (Testing). The checker fails a pair closer than
  76 px when one is a giver or a delivery (two beats are never open at once). Put each delivery at its own desk.
- **A handoff leaves the new lead a walk: 6 tiles or more** to the next beat's spot (Testing's house rule). A named
  landing spot (`{"to": {"place", "spot"}}`) puts the lead 26 px below it; with none, the lead stays where the scene
  played. `python3 tools/proofs/handoffs.py <world>` measures every handoff in a built book (tk.json rebuilt from the
  book's story) and fails one under 6. In a room every scene is staged in the middle of the floor, so a handoff
  with no landing spot leaves the new lead there, not at the beat's spot: the next beat in that room keeps 6+ tiles
  from the room's middle (the proof reads the lead's last place in the staged cutscene).
- **No dressing on a crosswalk** (`free()` treats it as paving).
- **A giver's item must be in the story's items** (Plot's `ITEMS` in the story file): the engine gives nothing it
  doesn't know, silently. A new item for a map chore (Misaeng's mop) goes to Plot with its name.
- **A person's `until` is a node key, with or without its world**: `"until": "node:m5"` and `"node:21-m5"` both
  compile to `21-m5` (once; before, a key already carrying its world came out `21-21-m5`, and the person never left).
- **Floors are any walkable material** in vocab (`room(..., floor="carpet")`): Misaeng's carpet, office_tile, lino.
- **A thing that gives an item when searched** is a spot with `gives`, `gives_when`, `give`, `given` (as a person has
  them): the lobby's bins (the waybill scrap). The factory and compile carry them; the engine's side is Integration's.
- **A prop shown on a condition**: `"when": "mark:…"` on a `prop.*` (the board room's drinks, set `over` their stretch of
  table). Compile writes it; the engine draws it once the condition holds (Integration's side).
- **A handoff lands only in the map it names** (`{"place", "spot"}` looks the spot up in that one map). To land a lead
  in a room, Plot names the room's map id (`one-international--sales3`); the spot is in the room.
- **A place is walked to only once it's open** (tk-world `placeOpen`: it holds an available or finished beat, was
  visited, or is a road between two that are). A place with no beat of its own between home and the next beat (the
  subway, Jongno at m2) stays shut unless it's a road or a room of a place that is open. Check the first walk of a
  book in the engine (`misaeng-places.js` "commute"), not just its doors.
- **Margins.** A thing sits inside its claim with a margin (1 tile in towns). In-wall kinds (gates, the wall stairs)
  have none, and a plan may set `margin` per thing.

## Proofs in the build

These run when the map is built, and a failure stops the build with the reason:
- **Reachability** (checker). Every door and spot can be walked to from the entry. Every room's people can be reached.
- **Blockers** (checker). A blocking challenger's target can't be reached without coming into his view.
- **Guard points** (`prove_guard`). A blocker holds a point as well: within 2.5 tiles of it he always stops you, even
  after you've turned him down. Without a guard, a player could decline and ride on. The proof walks from the start to
  the target while keeping 2.5 tiles clear of the guard. If it gets there, the build fails. A guard is a gate's gap, a
  cell, `"door"` (the doorstep of what he blocks) or the exit he bars.
  - When the proof fails, the map changes. A wall that stopped short of the hills is carried into them. A patrol on an
    open bend moves to the bridge, the one crossing.
- **Hide and wait** (`tools/proofs/hide_ward_lb.py`). Worked backwards in time against the looters' beats, at the
  engine's sight rules, it gives the fastest unseen way to the goal from every tile at every moment. It proves three
  things:
  - with cover the walk is quick;
  - without cover there's no way through;
  - from every cover, at the worst moment to arrive, all the waiting to the goal is short (22 s at most).

  Watchers who each walk a whole lane in opposite phase close it for most of a minute. Give each his own stretch, and
  search the beats against this proof.
- **Chases** (`prove_chase`). The chase layout (posts, dash lines, routes) is laid on tiles and ridden at the engine's
  own numbers. The same rule is used to the letter as tk-world's `ambushStep`: springing, running, holding, the touch
  radius, and the wave on the trail.
  - Ridden straight down the middle, each route must be caught.
  - Weaving, each must have a clean ride.
  - The search is timed, tile by tile, with waits allowed. It is pruned to rides that run no more than about 2 s late.
    That pruning is what makes it fast enough for every build.

## Conventions settled with the engine

Integration's engine reads these exactly as written. Read `tk-world.js` / `tk-feats.js` on main before relying on one.

**Engine numbers.** A tile is 16 px. Her body is 10 × 6 px at her feet (origin .5, 1). She goes through a door when the
point 3 px above her feet is in the exit. A prop's depth is its foot (`o.y`). Solids are props (box from `cl`/`cr`/`fh`)
and water; nothing else stops her, so compile turns every unwalkable ground into solid wall props. Wanderers turn home
past 48 px. Yielders catch at 1.4 tiles while she moves, and yield after she has stood still facing them for 1.2 s.

**Spots** (plan `spots`, in cells): `id`, `at`, `node` (a beat key, `"4-s3"`), `label`, `trigger` (`near`, `talk`,
`arrive`), `at_door` (on a building's doorstep), `on` (a thing's centre), `note` (for people, not the engine),
`cover` + `with` (a hide: what she hides by), `sight`, `fires: "told:<id>"` (its beat starts itself once that person
knows). A spot that delivers a mark: `needs`, `when`, `delivers`, `deliver` (lines on delivering), `delivered`,
`empty`, `waiting`, `call`. Someone standing within 64 px of such a spot delivers it when talked to.

**Lines.** A narration line is a plain string. A spoken line is `[speaker, English]`, speaker a cast key
(`"zhaoyun"`); `["n", …]` is not a speaker and fails the build. Every English line needs Chinese in
`tk_places_w2_zh.py` (or `tk_story_zh.ZH`), or `build_tk.py` stops. Lines a player can meet in any order must not say
"another" or "the third".

**People** (plan `npcs`): `kind`, `at` (cell) or `near` (a thing), `place` (a room's map id), `say`, `face`, `in`
(states), `when` / `until` (`"node:s5"`; renamed to the book's keys), `label`, `id`. Townsfolk with no `at`/`near`
wander. Extra engine keys pass through `NPC_KEYS`: `gossip`, `yield`, `watch`, `challenge`, `blocks`, `gives`.
- **Gossip:** `"gossip": {"tells": [ids], "in_beats": ["s4"], "relay": true}`. Told, a gossip hurries (findPath, 80 px/s)
  to each he `tells`. A relay is told only by a neighbour: the player can't tell him, and until told he isn't a talk
  target; told, his first line floats over him. `in_beats` is the beat they're open for (open means "not done", so name
  the beat that ends the spreading, not the one that starts it). The goal points only at a tellable gossip whose chain
  reaches the waiting `told:` target. The goal box's "Spread the news" button walks the chains from their heads.
- **Yield:** `"yield": {"group", "reach" (tiles), "aside": [dx, dy] (tiles), "line": [line], "caught": [line],
  "back_to": spot}`. Faced (standing still, facing them, within reach), a group steps aside one by one; moving within
  1.4 tiles of one who hasn't is a catch, back to `back_to`. Give each block its own `back_to`.

**Props** (plan `props`): `kind`, `at` / `at_door` (flanks the door along its face) / `over` (a building id: at its
front edge, not solid), `told` (shown once that person knows), `lift` (px: drawn that much higher, depth kept at its
foot), `in`, `when`, `until`, `label`.

**Things:** `id`, `kind`, `rect` (cells), `door` (N/S/E/W), `map` (its room), `label`, `plaque`, `open_to`
(`["told:wu-gatekeeper"]`: conditions to enter), `refuse` (a **list** of lines; a string is iterated letter by letter),
`margin`.

**Cutaways and handoffs.** A cutaway beat (`"cutaway": true` or a condition such as `"told:x"`) is played off stage in
its room; it needs a spot there, none outside. A new game starts at the first beat that isn't a cutaway (`__main__.py`
and the region's `start`). A handoff `["party", [...], {"to": {"place", "spot"}}]` lands the new lead 26 px below that
spot, which must be on the place's outdoor map. A gate `{"needs": [...], "else": scene, "objective", "at"}` is Plot's;
the goal pointer uses its objective and place.

**Doors.** A door's trigger reaches .6 of a tile out from its face; arrivals land clear of it. A door through a gate
is centred in the gap. A gate tower's door is its south arch. Townsfolk keep off the lane 3 wide and 6 deep before each
door.

## Building ahead of the story

Plot's story often lands on `claude/plot` before main. To build against it without committing Plot's files:

```
tools/mapfactory/build_with_story.sh 15 15 origin/claude/plot   # world, --plans, Plot's ref
```

It borrows Plot's `tk_story_w2_new.py`, rebuilds `data/tk.json`, builds/compiles/stages the world, undoes drift, and
puts the story and `tk.json` back. Commit only the world's maps (and plans, Chinese, proofs); tell Integration to merge
both branches together.

If you replace a line, its old Chinese must stay until the maps carrying it are rebuilt: `build_tk.py` checks every
line in the built maps. (Or patch the line in `data/tk_maps/w<n>` first.)

## Drift

After any build: `python3 tools/mapfactory/keep_drift.py --world <n>` puts back the overworld and every existing beat's
problem picks as committed. Then `git status`: only what the change touched should be left.

## Lessons

- A comment inside a dict line can swallow its closing brace: keep comments after the line, not inside it.
- `refuse`, `say`-style fields are lists; a string is iterated one letter at a time.
- Narration in place lines is a plain string, not `["n", …]`.
- Fractional props (`over`) need integer tile coordinates in compile's covered set (`int`, `math.ceil`).
- `pkill -f` can match its own shell: match something only the target has.
- A proof that leans on walls holds only if compile makes them solid: check the engine plays it (a playtest).
- A rebuilt map must be walked in the engine once: a proof uses our reading of the engine, a walk uses the engine.
- Messages cross: before reworking what another session built on, check what main actually uses.
- Delete `tools/**/__pycache__` if an edit doesn't seem to take.

## Walking it in the engine

`tests/playtest/` drives the game headless. For a quick check of one mechanic, open the game at a beat with
`TK.markCleared` and `localStorage['tk-world-<n>'] = {place, party}`, reload, then read and drive `window.__w` (the
world scene): `__w.act({kind: 'npc', n})` talks to someone, `WorldFeats.tell(__w, n)` tells a gossip, `__w.cond(...)`
reads a condition, `__w.player.body.reset(x, y)` moves her. `tests/playtest/book15-places.js` does this for the loud
town, the axemen and both face-downs:

```
tests/playtest/run.sh book15-places
```

## Working with the others

- **Integration** owns the engine and merges `claude/plot-places`. When it asks for a property (`guard`, `rider`, a
  map's `chase`), we write it in its syntax and its units (px or tiles; say which). We prove the layout against its code,
  not our idea of its code: read `tk-world.js` on main first.
- **Plot** owns the story and the Chinese. A changed English label or objective loses its Chinese until Plot translates
  it. So keep wording unless the change is needed, and send Plot every new label.
- **Graphics** draws from `assets-needed*.md`. A new kind always comes with a footprint (`NEW_KINDS`, `vocab.KINDS`), a
  stand-in (`vocab.FALLBACK`) and a brief (`ART`).
- **Feedback from players** (apo110 via Relay or Integration) is a bug in a rule or a plan, never "move that one
  thing":
  1. Find the rule that let it happen.
  2. Fix the rule.
  3. Rebuild what it touches.
  4. Check it in the game where you can (`tests/playtest/`).
  5. Say exactly what changed.
- **Messages cross.** Before reworking something another session built on, check main for what it actually uses. When
  two versions cross, keep the one already built on. Say so plainly, and correct any number you sent that you hadn't
  worked through.

## Commands

```
python3 tools/check_plans_w2.py                     # Book 2's plans (and Book 12, built from them)
python3 tools/check_plans_w2.py --arc cc --png      # the Cao Cao arc (Book 13), with previews in docs/book2/plans-cc/
python3 tools/check_plans_w2.py --arc lb --png      # Lü Bu's fall (Book 14), previews in docs/book2/plans-lb/
python3 tools/check_plans_w2.py --arc ls --png      # Lady Sun's marriage (Book 15), previews in docs/book2/plans-ls/
python3 tools/proofs/ladysun_ls.py                  # Book 15: the temple's side rooms, both face-downs, the loud town
python3 tools/check_plans_w2.py --arc ms --png      # Misaeng (Book 21), previews in docs/book2/plans-ms/
python3 -m tools.mapfactory all --world 15 --plans 15 --kit xianxia --kit jade --kit genshin   # build, compile, stage in one
python3 tools/mapfactory/keep_drift.py --world 15   # then undo the drift
tools/mapfactory/build_with_story.sh 15 15 origin/claude/plot   # against Plot's story before it's on main
python3 tools/mapfactory/settle_maps.py             # settle wanderers in built (frozen) maps
tests/playtest/run.sh book15-places                 # Book 15's mechanics, walked in the engine
python3 tools/proofs/handoffs.py 21                 # every handoff leaves the new lead 6+ tiles to walk
tests/playtest/run.sh misaeng-places                # Misaeng: kerb and crosswalks, doors to other places, the lift's menu,
                                                    # General Affairs' requisition, m14's errands, storefront doors, m19c-m22c's walks, the evening
python3 tools/mapfactory build --world 12 --plans 2
python3 tools/mapfactory build --world 13 --plans cc          # CHASE_VERBOSE=1 prints the chase proof
for k in xianxia jade genshin; do python3 tools/mapfactory compile --world 13 --kit $k; done
python3 tools/mapfactory scenes --world 13 --plans cc
python3 tools/mapfactory/plans.py --world 13 --plans cc --assets docs/book2/assets-needed-cc.md
node tests/playtest/ambush-13.js                    # with the site served on :8765 (tests/playtest/run.sh does it)
```

After a change:
1. Check the plans.
2. Build, compile for all three kits, and stage the scenes.
3. Undo drift (`keep_drift.py`), and look at `git status`. Commit what the change touched.
4. Run the book's proof and walk the changed mechanic in the engine.
5. Push to `claude/plot-places`, and tell Integration what to merge.

When editing the factory, delete `tools/**/__pycache__` if an edit doesn't seem to take: a same-size edit can leave a
stale `.pyc`.
