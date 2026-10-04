# Cutscenes (tk-cutscene/1)

Story scenes are acted out in the generated maps: people walk real paths,
armies move in formation, blows land, men fall, effects play and the camera
frames whoever speaks. Like the maps, cutscenes are generated and stored in
tiles, independent of any art pack.

```
story steps (tools/tk_story.py → data/tk.json)  ┐
the place's map (data/tk_maps/w<N>/*.map.json)  ┴─ scene generator ─▶ data/tk_maps/w<N>/cutscenes.json ─▶ tk-cutscene.js
```

```
python3 tools/mapfactory scenes --world 1      # after the maps are built
```

## Writing scenes: the story steps

Scenes stay written the way they always were, as steps placed relative to a
node on the old node map (x right, y down, in node-map pixels; 8 px ≈ 1 tile):

| Step | Meaning |
|---|---|
| `["n", text]` | narration |
| `["say", who, text]` | a line; if `who` isn't on stage, they're brought on facing the party |
| `["spawn", id, who, at, dx, dy]` | someone appears (at the start of a scene, they walk in) |
| `["army", id, who, count, at, dx, dy]` | a body of soldiers in formation, three ranks deep; `id` names the group |
| `["move", id, at, dx, dy]` | walk there (a group keeps its formation) |
| `["run", id, at, dx, dy]` | the same, at a run |
| `["pose", id, "strike"]` | lunge at the nearest standing enemy |
| `["pose", id, "fall", n]` | fall; for a group, the `n` nearest the enemy (all if omitted). The fallen never move again |
| `["fx", name, at, dx, dy]` | flash, dust, petals, incense, paper, fire, whip, sparkle, blackwind |
| `["remove", id]` | fade out |
| `["party", [who, …]]` | who travels with Liu Bei from now on |

Positive `dx` is "toward the enemy". The party's members are addressed by
character id (`liubei`, `guanyu`, …). `militia` soldiers fight on the
party's side; anyone placed on the far side is an enemy.

## What the generator does

- **Stage:** the quest's story spot. The party lines up there; whichever
  side of the spot has more open ground becomes the far side.
- **Blocking:** offsets become tiles and snap to open ground the party can
  reach, one actor per tile.
- **Paths:** every walk goes around houses, trees and water (stored as
  corner points).
- **Entrances:** people and armies placed before the first line walk in
  from further out while the camera takes in the field.
- **Dialogue:** the speaker and the person they address turn to face each
  other, and the camera frames them both.
- **The end:** anyone left on stage who isn't in the party fades; the
  player stands where Liu Bei ended up.

## The file

```jsonc
{
  "format": "tk-cutscene/1", "world": 1,
  "scenes": {
    "daxing": {
      "place": "daxing-mountain", "spot": "pass", "node": "1-n3",
      "party": ["liubei", "guanyu", "zhangfei"],
      "cast": {"liubei": {"who": "liubei", "side": "us"},
               "yt.0": {"who": "rebel", "side": "them", "group": "yt"}},
      "beats": [
        {"do": "cut", "place": [{"actor": "liubei", "at": [20.5, 14.85], "face": "right"}]},
        {"do": "appear", "place": [{"actor": "yt.0", "at": [33.5, 14.85], "face": "left"}]},
        {"do": "together", "beats": [{"do": "walk", "actor": "yt.0", "path": [[33.5, 14.85], [28.5, 14.85]], "speed": 4}]},
        {"do": "camera", "to": [24.5, 15.5], "ms": 600},
        {"do": "line", "line": ["say", "liubei", "Traitors…", "反国逆贼…", "b1c2…"], "speaker": "liubei",
         "face": [{"actor": "liubei", "dir": "right"}, {"actor": "r2", "dir": "left"}], "camera": [24.5, 15.5]},
        {"do": "strike", "actor": "zhangfei", "target": "r1"},
        {"do": "fx", "name": "flash", "at": [22.5, 14.85]},
        {"do": "fall", "actors": ["r1"]},
        {"do": "fade", "actors": ["r1"]},
        {"do": "party", "list": ["liubei", "guanyu", "zhangfei"]}
      ],
      "end": {"leader": [20.5, 14.85]}
    }
  }
}
```

Positions are tiles (feet), speeds tiles per second. Beats run in order;
`together` runs its beats at once. `line` carries the story step unchanged
(English, Chinese, voice clip). A renderer may draw actors however it likes:
the 2D world uses the code-drawn heroes, and a 3D one would use models.

## Playing

`tk-cutscene.js` plays a scene inside the world (letterbox, Skip button).
A scene with a `{"do": "problem"}` beat (from a `["problem"]` story step)
holds the quest's Go problem: the world plays the scene up to it, brings up
the board, and plays the rest only once the problem is solved. Leaving or
failing ends the scene; trying again fast-forwards to the problem. Skipping
before the problem jumps to it; after it, skipping ends the scene. A scene
without one plays after a won problem, as before. When the place has no
cutscene the world plays the same steps as plain dialogue. Who joins the
party is applied either way.
