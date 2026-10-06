# Map format (tk-map/1)

Maps are stored in a form that doesn't depend on any art pack, so the same
world can be drawn with today's 16px packs, a different pack later, or a 3D
engine. Three layers, each a plain JSON file:

```
plot (data/tk.json)  ──map factory──▶  abstract maps (data/tk_maps/w<N>/*.map.json, region.json)
                                              │
                         kit (assets/tk/kits/<kit>.json)  ──compiler──▶  data/tk_maps/w<N>/<kit>/*.tmj
                                                                           (Tiled maps the game loads)
```

- **Abstract maps** are the source of truth. They say *what* is where:
  "grass here, a road there, an inn with its door at (12, 9), a peach tree".
- **Kits** say *how a pack draws it*: which tiles make a road edge, which
  sprite is an inn. One kit per pack.
- **Compiled maps** are build output for one kit, in Tiled's format (they
  open in the Tiled editor for viewing). Never edit them; change the plot,
  the brief or the factory and rebuild.

Switching packs means writing a kit and rebuilding. A future renderer (a
larger 2D world, low-poly 3D) reads the abstract maps directly and maps the
same kinds to its own models.

The word list (materials, kinds, footprints, which kinds block walking, and
fallbacks) is in `tools/mapfactory/vocab.py`.

## Abstract map: `<place>.map.json`

All positions are in **tiles**. Fractions are allowed for objects.

```jsonc
{
  "format": "tk-map/1",
  "id": "zhuo-county",            // unique within the world; file name
  "world": 1,
  "name": "Zhuo County",
  "archetype": "town",            // the template the factory used
  "size": [40, 30],               // width, height in tiles
  "seed": 1817,                   // the factory's seed, so a rebuild is identical
  "terrain": {
    "legend": {".": "grass", "=": "dirt", "~": "water", ":": "sand"},
    "rows": ["....==....", "..."]   // one string per row, one char per tile
  },
  "objects": [                    // things that stand on the ground
    {"kind": "building.inn", "x": 12, "y": 7, "w": 4, "h": 2, "id": "inn"},
    {"kind": "tree.peach", "x": 30, "y": 11, "w": 1, "h": 1}
  ],
  "spots": [                      // where story beats happen; the player walks up and presses Space
    {"id": "notice", "x": 20.5, "y": 15, "node": "1-n1", "label": "The notice board",
     "intro": ["Lines before the problem opens"], "outro": [["stargrey", "Lines after the win, before the scene"]]}
  ],
  "npcs": [                       // people; hero.<id> are story characters, folk.* townsfolk
    {"id": "folk-1", "kind": "folk.villager", "x": 18, "y": 16, "wander": true,
     "say": ["“They say the Yellow Turbans wear scarves the colour of the earth.”"]},
    {"id": "npc-6", "kind": "folk.elder", "x": 21, "y": 16, "challenge": "elder", "face": "down",   // sets a Go problem
     "intro": ["…"], "win": ["…"], "done": ["…"]},
    {"id": "npc-1", "kind": "hero.stargrey", "x": 30, "y": 9, "until": "1-n2"}   // gone once 1-n2 is cleared
  ],
  "exits": [                      // walk off the map here to reach another place
    {"to": "peach-garden", "side": "E", "x": 39, "y": 14, "w": 1, "h": 2}
  ],
  "entries": {"peach-garden": [37, 15], "": [3, 15]}   // where you arrive from each place ("" = first arrival)
}
```

- An object's `x, y, w, h` is its **footprint**, the ground it stands on.
  The pack's sprite is drawn with its bottom-centre at the footprint's
  bottom-centre, so roofs and treetops rise above it. Solid kinds block
  walking over their footprint, whatever the pack draws.
- A building's door is the middle of the footprint's bottom edge.
- Lines (`intro`, `outro`, `win`, `done`) are strings (narration) or
  `[who, text]` (a character speaks, with their portrait).
- A challenger's problem is the campaign level `<world>-<place>-c-<challenge>`,
  drawn from the world's problem pools; clearing it is saved like any level.
- Water blocks walking.

## Region: `region.json`

One per world: the places, how they link, and the quests in story order.

```jsonc
{
  "format": "tk-region/1",
  "world": 1, "name": "The Peach Garden Oath",
  "start": "lousang-village",
  "places": [{"id": "zhuo-county", "name": "Zhuo County", "map": "zhuo-county.map.json", "links": ["lousang-village", "peach-garden"]}],
  "quests": [{
    "node": "1-n1", "role": "main",          // main, side, short (a hard shortcut), boss
    "place": "zhuo-county", "spot": "notice",
    "scene": "notice", "title": "The Notice at Zhuo",
    "objective": "Read the notice in the town square.",
    "after": ["1-start"],                    // available once any of these is done
    "grade": "12K", "pool": [["collection-slug", 123]]
  }]
}
```

A place is open once one of its quests is available (or it is the start),
and exits to closed places stay shut. Side quests are optional; main quests
come in the novel's order.

## Kit: `assets/tk/kits/<kit>.json`

```jsonc
{
  "kit": "ninja", "tile": 16,
  "sheets": {"floor": "assets/tk/ninja/floor.png"},
  "materials": {
    "grass": {"tiles": [["floor", 0, 12, 8], ["floor", 1, 12, 1]]},   // [sheet, col, row, weight]: random fill
    "dirt":  {"blob": ["floor", 0, 7, 10, 5], "inside": [1, 8], "outside": ["floor", 0, 12]},
    "sand":  {"same": "dirt"},
    "water": {"color": "#4f86b8"}                                    // last resort: a flat colour
  },
  "kinds": {"building.inn": [["house", 304, 0, 64, 48]]},            // [sheet, x, y, w, h] in pixels; several = variants
  "folk": {
    "frame": [16, 16],
    "dirs": {"down": [0, 0], "up": [1, 0], "left": [2, 0], "right": [3, 0]},  // frame offset of each facing
    "step": [0, 1], "walk": [0, 1, 2, 3], "still": 0,                 // walk frames go along `step`
    "sheets": {"villager": "assets/tk/ninja/folk/villager.png"},
    "kinds": {"folk.villager": [{"sheet": "villager", "origin": [0, 0]}]}
  }
}
```

- **blob** is an autotile block: the compiler reads each tile's border
  pixels (comparing them with the `inside` tile and the `outside` tile) to
  learn which neighbours it expects, so any pack laid out as a blob/47-tile
  set works without hand-mapping.
- A kind the kit doesn't draw falls back along `FALLBACK` in `vocab.py`;
  if nothing matches, the object is still solid but invisible, and the
  compiler lists it.

## The overworld

`tools/mapfactory/overworld.py` builds one more map, `overworld.map.json`
(place id `overworld`, archetype `overworld`): the whole world on one
walkable map. Each outdoor place stands where it sat on the story's node
map (spread out a little), drawn as a cluster that says what it is (huts,
a hall and houses, tents, crags, peach trees); roads follow the places'
links; forest, rocks and lakes fill the country. Each place has an
entrance, an ordinary exit with `"to"` its id, so the story's locks hold,
and an entry in front of it keyed by its id, where you stand when you come
out of it. The Map button (tk-travel.js) takes you there.

## Interiors

Every building with a door gets a room (`tools/mapfactory/interiors.py`): a
walled room on a dark surround, furnished from a template for its kind (an
inn's counter, shelves and tables; a hall's screen, desk, rug and banners; a
hut's mat and hearth…), with the people from `ROOMS` in `tools/tk_places.py`.
Rooms are maps in the same format, with materials `wood`, `stone`, `mat`,
`earth`, `wall` and `void`, and `furn.*` kinds. They are places in
`region.json` with a `"parent"`; a room is open whenever its place is. The
outdoor map gets an exit at the building's door (`"door": true`: press
against the door to go in) and an entry in front of it for coming back out.

A story beat can be played inside a building: give its node in
`tools/tk_story.py` a `"room"` naming the building's landmark `"id"` from
`tools/tk_places.py` (e.g. `"room": "inn"` at Zhuo County). The quest's
place becomes the room (`"zhuo-county--inn"`), its spot goes on open floor
in the middle of the room, and its cutscene is staged there. The room's
place still clears with its parent on the travel map. The node may also
carry `"trigger"` (`near`, `arrive` or `talk`), as a landmark does.

A kit draws walls either as one tile (`"tiles"`) or as a frame of edge and
corner pieces: `"wall": {"edge": {"sheet": …, "tl": [c, r], "t": …, "tr": …,
"l": …, "r": …, "bl": …, "b": …, "br": …}, "under": "void"}`.

## Cutscenes

Story scenes are staged in these maps by the scene generator; see
`docs/cutscene-format.md`.

## Building

```
python3 tools/mapfactory build --world 1              # plot → abstract maps + region
python3 tools/mapfactory compile --world 1 --kit jade --preview    # the default look; --kit ninja for the other
```

`--preview` writes PNGs of every map and an overview to `docs/maps/`.

## Book 2 additions (runtime)

These are read by the factory (tools/mapfactory) and played by the engine (tk-world.js).

### Map states
A brief's `"states"`: `[{"id", "when", "until", "light", "visibility", "sound", "procession", "exits_open", "exits_closed"}]`.
Every state whose `when` holds and whose `until` doesn't is active; they merge in order, so a later one's light, fog or sound wins.
- `light`: `day` (none), `morning`, `dusk`, `night`, `storm`, `smoke`.
- People and landmarks with `"in": [state ids]` are there only while one of those states is active.
- `exits_open` / `exits_closed`: place ids whose exits are opened or barred while the state lasts.
- `visibility`: N tiles. A fog closes round the player.
- `sound`: `{"bells" | "children" | "drum": source}`. A synthesised pattern grows louder as you near the source: `"carriage"` (the procession's), a spot id, a landmark id or a person's id. If none is given, the source is the next beat's spot. It plays only while the music is on.
- `procession`: `{"column": [...], "from": [x, y], "to": [x, y], "leash": tiles, "leash_line": "…", "stops": [spot ids]}`.
  - The column walks the road at walking pace. `outriders` and `rearguard` are two soldiers each, `carriage:…` is a carriage, and `player` is your place in it.
  - It halts when the carriage reaches a stop whose beat hasn't played, and goes on once it has.
  - Stray farther than `leash` tiles from the carriage and you're brought back with `leash_line` (voiced).

### Challengers
An npc with `"challenge"` may also have:
- `"view"`: N tiles. With `"face"` it's a 110° cone that way, otherwise a circle. Inside it, he spots you: "!" pops, he walks over, then intro and problem.
- `"blocks"`: a node (`"a3"`), a landmark or room id, or `{"exit": "Meiwu"}`. Come within 2.5 tiles of it unbeaten and he stops you.
- Lose: you're stepped back, and he waits until you've left and come again. Win: he stands aside and is no longer in the way.

### Doors and rooms
- A building's `"open_to"` is a list of protagonist ids or conditions (`"item:edict"`). Anyone else is turned back with `"refuse"` lines (voiced).
- A building's `"rooms"`: `[id | {"id", "label", "kind"}]` puts rooms in a row behind one street door, each with a back door to the next.
- An npc with `"inside": True` and `"near": <building or room id>` stands in that room.
- A brief's `"room_folk": False` keeps the stock room people out.

### Story steps
`["crowd", n]` (or `"+3"`): townsfolk fall in behind the party.
`["party", [...], {"to": node | {"place", "from"}}]`: where the new lead begins.
New poses: `dance` and `throat` (lasting); `cutarm` and `leap` (once).
