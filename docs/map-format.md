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
    {"id": "notice", "x": 20.5, "y": 15, "node": "1-n1", "label": "The notice board"}
  ],
  "npcs": [                       // people; hero.<id> are story characters, folk.* townsfolk
    {"id": "folk-1", "kind": "folk.villager", "x": 18, "y": 16, "wander": true,
     "say": ["“They say the Yellow Turbans wear scarves the colour of the earth.”"]}
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

## Building

```
python3 tools/mapfactory build --world 1              # plot → abstract maps + region
python3 tools/mapfactory compile --world 1 --kit ninja --preview
```

`--preview` writes PNGs of every map and an overview to `docs/maps/`.
