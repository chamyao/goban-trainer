# Places notes: requests for Book 2's maps

What the design in `places-design.md` needs that the map format and the engine don't support today. Plot forwards these to Integration. They are listed most important first. Each one says what it is for, where it's used, and what it should look like. The data shapes are suggestions, not specs.

## Format requests (how a place is described)

1. **One map, several states.** A place has named states, each picked by a condition (`node:`/`item:`/`mark:`). A state can change:
   - light (day, dusk, night, storm, smoke)
   - who's there and what they say
   - props (red lanterns, the horse at the hitching post, the body under a lamp, a broken wheel)
   - banners
   - damage (smoke, forced gates)
   - which exits are open

   *Used by:*
   - Chang'an: six states.
   - Meiwu: the raid.
   - The Meiwu Road: four journeys.

   ```python
   "states": [{"id": "capital", "when": None, "light": "day"},
              {"id": "night", "when": "node:a1", "until": "node:a2", "light": "night"}, …]
   ```
   People and props then take `"in": ["capital", "after"]`.
2. **Compounds: a building with several named rooms and courts, generated.** A compound template (for example a siheyuan: gate, front court, halls on one axis, a rear garden) is filled from a brief listing its rooms and what each must contain. The brief uses the relations in request 6: the pavilion *in* the pond, the window *overlooking* a small pond court, the secret room *behind* a screen in the rear hall.
   - Today a building has one generated room. A beat needs `place` + building + **room** (`wy-garden`, `xf-hall`…).
   - *Used by:* Wang Yun's residence (5 rooms), the Chancellor's residence (4 rooms plus gallery and courts), Meiwu (hall, mother's rooms, Diaochan's rooms, courts).
3. **Doors open by protagonist.** A door or gate open only to certain protagonists, with a refusal line from someone in the story.
   - *Used by:* the Chancellor's gate (Wang Yun is turned away), Meiwu's gate (opens for Li Su with the edict).
4. **Roads as one long, ordered route with milestones.** A route map with markers along it (post-pavilions), stops in a fixed order, and its two ends named by place.
   - *Used by:* the Meiwu Road.
5. **Places that sit beyond another place, in one line.** Liangzhou is reached through Meiwu (the long road west), and its exit east opens after A17.
6. **Generated, but steerable: a coarse plan grid, relations and checks in the brief.** The plan grid is specified in `plan-grid.md` (cells, claims, no overlaps, roads with their own widths). On top of it: Nothing is hand-placed; every map stays generated so the approach scales to every book. The brief gains two things the generator must honour:
   - **Spatial relations** between landmarks: `south of`, `at the end of` (a road), `facing` (across a road), `inside`, `in` (water), `behind`, `beside`, `on the axis` (a straight avenue between two landmarks), `raised`, `outside the wall`. Each one becomes a placement rule or a score term, in the same place-and-score loop the factory already uses.
   - **Play checks**, run after layout like today's walkability check. A failed check re-rolls the seed.
     - *Visible:* the landmark can be seen from most of the walkable map.
     - *Route under cover:* a path exists from A to B that avoids every watcher's cone at some timing (the A9 garden).
     - *Sight-puzzle spot:* at least one tile is inside one watcher's cone and outside another's (the A7 curtain).
     - *Safe spot:* each stealth room has a tile no cone ever reaches.
     - *Distance:* a building is within N steps of the hub (keeps Chang'an tight).

   The design in `places-design.md` reads as a list of these relations and checks, not a drawing.
7. **New kinds:**
   - Buildings: `building.compound`, `building.gatetower` (climbable), `building.pavilion` (open-sided, on water), `building.granary`, `building.storehouse`, `building.stable`, `building.posthouse` (亭).
   - Landmarks: `landmark.hitchingpost`, `landmark.ridge` (raised earth you stand on), `landmark.heights` (two heights over a valley).
   - Props: `prop.lanterns` (rows of red lanterns), `prop.carriage` and `prop.carriage_covered`, `prop.cart`.
   - Garden pieces: `water.lotus`, `bridge.zigzag`, `tree.willow`, `plant.peony`, `garden.trellis`, `garden.rockery`.
   - Walls: `wall.lattice` (blocks walking, not sight), `wall.city` with gates.
   - Indoor: `furn.curtain`, `furn.swordwall`, `furn.window`.
   - Fields: `field.wheat`, `tree.poplar`.
   - Camp: `camp.gong`, `camp.drum`.

## Engine requests (how it plays)

8. **The player walks as the current protagonist** (Wang Yun, Diaochan, Li Su, Jia Xu, Li Jue). *Already the arc's top request; the maps depend on it.*
9. **Stealth:**
   - **Watchers:** guards and maids show visible sight cones. They walk L- or U-shaped beats, with pauses where they visibly stop (gossip).
   - **Cover:** willows, rockeries, carts and screens block sight. A lattice wall blocks walking but not sight.
   - **Seen:** the watcher says a line, and the player is walked back to a named spot. There is no game-over screen.
   - **Per room:** each room has at least one spot that is always safe.

   *Used by:* A3 (one guard), A9 (gallery and garden).
10. **A sight puzzle:** a target spot that must be **inside one cone and outside another**, and that moves as a watcher turns. *Used by:* A7, the curtain: Lü Bu must see her and Dong Zhuo must not.
11. **Story people who spot you and walk over** (the Pokémon trainer move), and blocking challengers in narrow lanes. *Used by:* A6 (Lü Bu between the red lanterns), the Liangzhou officer at night, the constable at v3.
12. **A procession:**
    - The column moves along the route at walking pace, and the player is free inside it on a soft leash.
    - It stops at each encounter, and the time of day moves on along it.
    - *Used by:* the Meiwu Road (A13).
13. **Fog:** visibility shrinks to a circle round the player, and a sound (carriage bells) leads the way. *Used by:* the `fog` stop.
14. **Sound on the map:** a source gets louder as you walk toward it. *Used by:* the children's song in the night fields, and the bells in the fog.
15. **Night lighting:** the map is dark except lit paths, lanterns and the moon. *Used by:* A2 (the garden path), A6 (the red lanterns), the night fields.
16. **Followers:** a crowd that falls in behind the player and grows with each village. *Used by:* Liangzhou (A16).
17. **Heights:** a raised plateau (the palace), a gate tower you climb (Xuanping), a ridge you stand on. These should read as raised: shadow, steps.
18. **Seats that fill:** chairs in a room that fill as legwork is done. *Used by:* the secret room in A12. Today's `when` on people may already cover it.

## New kinds the plans use
Listed with their footprints in `NEW_KINDS` at the top of `tools/tk_plans_w2.py`; line and zone kinds are in `LINE_KINDS` and `ZONE_KINDS` there. They include:
- Buildings: compound, palace, grand hall, wing, pavilion (and painted pavilion), gate tower, granary, storehouse, post-house, gatehouse, small tent.
- Landmarks and features: ridge, heights, hitching post, stalls, rockery, trellis, spirit screen, willow, corral.
- Furniture: dais, curtain, sword on the wall, window, lamp, seat.
- Lines: gallery (with lattice sides), bridge, stream, curtain.
- Zones: court, passage, garden, stage, plain, loess, cliff, wheat.

## Playtest (stopgap) requests

19. **Gardens with ground of their own.** A landmark can carry `"garden": {...}`: a walled plot of `size` tiles behind the building named in `behind`, entered by its moon gate. Inside: a `pond` (size, where, lotus), `pavilions` (label, where: west/east/pond; one has the beat's `spot`; a pond pavilion gets a zig-zag `bridge`), a winding `path` from the gate to the spot pavilion, and `plants` (counts by kind) scattered off the path. Today the garden is only a moon gate squeezed behind the house. *Used by:* Wang Yun's rear garden (A2) and the Chancellor's rear garden (A9), in `tools/tk_places_w2.py`. The full design is the gardens in the compound maps of `tools/tk_plans_w2.py`.
20. **A place's size from its brief** (`"size": [w, h]`), so Chang'an can hold its residences and two gardens without crowding. Today a city is always 40×30.
