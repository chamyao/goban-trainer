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
5. **Build only what changed.** A rebuild reshuffles random choices (problem pools in `region.json`) in maps that
   didn't change. Commit the maps, tmjs and scenes a change touched, and leave the rest.

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
3. Look at `git status`. Commit what the change touched. Revert unrelated drift: problem pools in `region.json`, and
   maps you didn't change.
4. Push to `claude/plot-places`, and tell Integration what to merge.

When editing the factory, delete `tools/**/__pycache__` if an edit doesn't seem to take: a same-size edit can leave a
stale `.pyc`.
