# The plan grid: how a place's layout is written

This is a proposed format (request 6 in `places-notes.md`). Every place is written as a **coarse plan on a grid of cells**. The plan fixes where the big things go and how much room each takes. The generator fills in everything inside the cells: exact footprints, filler buildings, trees, decoration, and the three art styles.

## 1. Cells

- A place has a grid `[cols, rows]` and a `cell` size in tiles. The default cell is **4×4 tiles**, and a place can choose another size.
- Coordinates are cells, counted from the top-left `[0, 0]`, with north up.
- Cells are a **coordinate system, not a size limit.** Nothing has to fit inside one cell.

## 2. Everything claims the cells it covers

Every item in a plan has a **rect** in cells: `[x, y, w, h]`. A building that needs 8×8 tiles is `w: 2, h: 2` with 4-tile cells. It **claims all four cells**, and nothing else may be placed in them.

```
  0   1   2   3   4          the Chancellor's residence: "rect": [1, 1, 3, 2]
0 .   .   .   .   .          claims cells (1..3, 1..2): six cells
1 .   X   X   X   .
2 .   X   X   X   .          a house at [4, 1, 1, 1] claims one cell: allowed
3 .   .   .   .   .          a house at [3, 2, 1, 1] would overlap X: REJECTED
```

**The rule: no two items may claim the same cell.** The only exceptions are the layers in §4.

The claim is the **room an item needs, not just its walls.** The footprint plus a margin all round: space for its door path and a tile of ground between it and its neighbours. So a building whose walls are 7×7 tiles still claims 2×2 cells (8×8 tiles), and the spare tile is its margin. The generator places the actual footprint inside the claim and never outside it.

**How big a claim must be:** each kind has a footprint in tiles (`vocab.py`). Its claim is that footprint plus a 1-tile margin, rounded **up** to whole cells. The checker computes this, so a plan that gives a building too few cells is an error, not a squeeze:

> `xiangfu: building.compound needs 11×7 tiles (+1 margin) = 3×2 cells; the plan gives 2×2`

A plan may give **more** cells than needed (a hall set in a wide court). The generator centres the footprint, or aligns it with `"align": "N" | "S" | …`.

## 3. Roads, rivers and walls: lines with their own width

Roads don't fit cells. A road is a **path through cell centres** plus a **width in tiles**:

```python
{"id": "avenue", "kind": "road", "path": [[5, 1], [5, 7]], "width": 5}       # 5 tiles: three lanes
{"id": "lane",   "kind": "road", "path": [[5, 4], [8, 4], [8, 6]], "width": 2}   # a bend at [8, 4]
{"id": "wei",    "kind": "river", "path": [[0, 0.5], [12, 0.5]], "width": 3}    # half-cell coordinates are allowed for lines
```

- **What a line claims:** every cell its band of tiles passes through. A 5-tile avenue down column 5 claims column 5, plus its neighbours wherever the band spills over. The checker works this out from the width; you don't list the cells.
- **Odd widths and bends:** any width in tiles is allowed. Bends happen at the path's points.
- **Lines meeting:** two roads may cross or join (a crossroads). Where they meet is the only place a cell may be claimed twice. A road may also end at a gate or a door; that's how buildings connect.
- **Walls** are lines too, usually 1 tile wide, with `gates` at points along them. A gate is where a road may cross the wall.

## 4. Layers: what may share cells

Some things are meant to sit on top of others. A plan has three layers, and **the no-overlap rule applies within a layer, not across layers**:

| Layer | What's in it | May overlap |
|---|---|---|
| `ground` | zones: a market, a garden, a plateau, water, fields, a walled ward | only zones that say they contain the other (`"in": "ward"`) |
| `lines` | roads, rivers, walls | only at crossings, joins and gates |
| `things` | buildings, landmarks, story spots, big props | nothing; one thing per cell |

Rules across layers:
- A thing may sit on a zone. The house stands in the market, and the pavilion stands **in** the water if the plan says `"on": "water"`; otherwise water is off limits.
- **A thing may not sit on a line.** A building on a road is an error. A thing whose door faces a road must touch the road's claimed cells on that side.

## 5. Shapes that aren't rectangles

Most zones are rectangles. For the rest (a curved pond, an L-shaped ward, a valley mouth), a zone can be a **cell mask**: rows of characters, where `#` is in and `.` is out.

```python
{"id": "pond", "kind": "water", "at": [6, 2], "mask": [
    ".##.",
    "####",
    ".##."]}
```

The generator rounds the edges, so it reads as a pond, not a block.

## 6. Compounds and rooms: maps of their own

A compound (Wang Yun's residence, the Chancellor's residence, the palace) is a walled block in the place's plan, and **walking through its gate opens a map of its own**. That map has its own plan grid at a finer cell, by default **2×2 tiles**, with margin 0. Its courts, halls and garden are laid out by the same rules. A hall inside it opens onto a **room**, a small map again (`room()` in `tools/tk_places_w2.py`: walls round the edge, a door, furniture). So the levels are city → compound → room, like Pokémon's town → house.

Stealth spaces carry **watchers** (a position or a beat, a facing, a cone length) and **play checks**:
- **covered route:** a path from A to B that no watcher sees at every point of its beat, so there is always a moment to move.
- **safe spot:** a cell in a zone that no cone ever reaches.
- **sight puzzle:** for each way one watcher faces, there's a cell that a second watcher sees and the first doesn't (the A7 curtain).

## Small rules learned from the first plans
- **A footprint may be turned:** a wing 6×4 tiles fits a claim of 4×6.
- **Gates and gate towers stand in a wall** and take no margin.
- **Doors open onto a road or an open court:** in a town, never onto bare grass. Inside a compound, onto any walkable ground.

## 7. What the checker reports

The checker is `tools/check_places_w2.py` (`--png` draws every plan into `docs/book2/plans/`). It runs **before** generation, on the plan alone. Errors stop the build:
- **Overlap:** two things claim the same cell, or a thing sits on a line. Named, with the cells.
- **Too small:** a claim smaller than the kind's footprint plus margin. Shows the size needed.
- **Off the grid:** a rect or path outside `[cols, rows]`.
- **Unconnected:** a door that touches no road, or a road that leads nowhere.
- **Unwalkable or unreachable:** a spot, door, exit or watcher that can't be walked to from the entry.
- **Keys and kinds:** a node that isn't a Shared key, or a kind that's neither in `vocab.py` nor in `NEW_KINDS`.
- **Play checks:** covered route, safe spot, sight puzzle.

Then the generator runs, and its play checks (walkable, visible, covered route, sight puzzle, safe spot) re-roll the details, never the plan.

## Example: Chang'an (first pass)

```python
"Chang'an": {"grid": [14, 11], "cell": 4,
  "ground": [
    {"id": "wei",      "kind": "water",   "rect": [0, 0, 14, 1]},
    {"id": "farewell", "kind": "field",   "rect": [6, 1, 4, 1]},          # outside the north wall
    {"id": "markets",  "kind": "market",  "rect": [4, 3, 6, 2], "in": "city"},
    {"id": "ward",     "kind": "ward",    "rect": [1, 5, 12, 3], "in": "city"},
    {"id": "plateau",  "kind": "plateau", "rect": [1, 8, 12, 3], "in": "city", "raised": True},
    {"id": "city",     "kind": "city",    "rect": [1, 2, 12, 9]}],
  "lines": [
    {"id": "wall",   "kind": "wall.city", "rect_outline": [1, 2, 12, 9],
     "gates": {"hengmen": [6, 2], "xuanping": [13, 4]}},
    {"id": "avenue", "kind": "road", "path": [[6, 1], [6, 8]], "width": 5},
    {"id": "east",   "kind": "road", "path": [[6, 4], [13, 4]], "width": 3},
    {"id": "west",   "kind": "road", "path": [[6, 1], [0, 1]], "width": 2}],   # to the Meiwu Road
  "things": [
    {"id": "palace",   "kind": "building.palace",    "rect": [4, 9, 5, 2], "door": "N"},
    {"id": "north-gate","kind": "building.gate",     "rect": [6, 8, 1, 1]},
    {"id": "wangyun",  "kind": "building.compound",  "rect": [2, 5, 3, 3], "door": "E"},
    {"id": "xiangfu",  "kind": "building.compound",  "rect": [8, 5, 4, 3], "door": "W"},
    {"id": "lubu",     "kind": "building.compound",  "rect": [8, 3, 2, 1], "door": "W"},
    {"id": "jeweller", "kind": "building.shop",      "rect": [4, 3, 1, 1], "door": "E"},
    {"id": "xuanping", "kind": "building.gatetower", "rect": [13, 3, 1, 2]},
    {"id": "ridge",    "kind": "landmark.ridge",     "rect": [0, 2, 1, 2]}],
  "spots": [                                                                   # markers on lines: claim no cell
    {"id": "market",   "at": [6, 4]},                                          # the crossroads
    {"id": "lanterns", "at": [6, 6]}]}                                         # a6, on the avenue
```

*(Coordinates are a first pass. A throwaway prototype of the checker's overlap, on-line, on-water and door-touches-road rules passes on this example. Its first run caught two real mistakes: the avenue's band spilling onto the palace, and the ridge sitting in the river.)*

**Open point:** story spots sit **on** roads (the crossroads, the red lanterns on the avenue). The proposal is that `spot` is a marker on the `lines` layer, not a thing, so it never claims a cell.
