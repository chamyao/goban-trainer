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
| `["prop", id, kind, at, dx, dy]` | put a thing on stage: `cagecart`, `forge`, `anvil`, `winejars`, `table`, `rack` (weapons), `fire`, `tent`, `gate` (a city gate), `desk`, `hall` (a hostel or office hall). It moves with `move`/`run` and leaves with `remove`; walkers go round it |
| `["board", who, prop]` / `["unboard", who]` | ride inside a prop (a prisoner in the cage cart); it carries them when it moves, and `remove` takes them with it. Boarded before the first line, they are inside from the start |
| `["pose", id, P]` | `drink`, `cheer`, `raise` (holds up what they were last given) play once; `bow`, `kneel`, `sit`, `sleep`, `drunk` (sways) last until `stand` or a walk (drunk men keep swaying). `id` may be a group or `party` |
| `["emote", id, E]` | a bubble overhead: `!`, `?`, `...`, `music`, `anger`, `sweat`, `zzz`, `heart` |
| `["give", from, to, item]` | `from` walks over and hands `item` (a key of the world's `items`) to `to`, who holds it up; it is gained as with `["gain", item]` |
| `["surround", group, target, r]` | the group runs to a ring of radius `r` px round a prop or a person and faces in |
| `["close", group, target, r]` | the same at a walk: tighten the ring |
| `["camera", "zoom", z, ms]` | zoom to `z` (1–2); `["camera", "zoom", 1, ms]` goes back. `["camera", "shake"]` shakes |
| `["mood", "dark"]` / `["mood", "clear"]` | darken the edges of the screen for a tense moment, and lift it |
| `["light", L, ms]` | tint the scene for the time of day: `night` (fires, lamps and forges glow), `dusk`, `dawn`, `storm`, any `"#rrggbb"`, or `day` to clear it, fading over `ms` (default 1500). Before the first line, the scene opens in that light |
| `["music", cue]` | change the score: `boss` (taiko drums), `battle`, `victory`, `calm` (the place's own piece) or `none`. Before the first line, the scene opens with it |
| `["boss", who]` | the boss's entrance: a wider letterbox, the camera closes on him, a gong, and his name card (Chinese, English and title) |
| `["victory"]` | the gong, a 大捷 Victory banner, the party cheering, triumphant music |
| `["wait", ms]` | a pause |

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
- **Props** take their whole footprint of open ground; a boarded rider
  sits inside and goes where the prop goes. A ring places each man on the
  nearest free tile of the circle, then turns them all to face the middle.
- **Gifts:** the giver walks next to the receiver first, and they face.
- **The end:** anyone left on stage who isn't in the party fades; the
  player stands where Liu Bei ended up.

A **boss scene** (the quest's role is `boss`) becomes a set piece without
any extra steps: it opens to the taiko drums, the boss makes his entrance
just before the board (his name and title come from the quest's `boss`),
the drums carry on under the board, and the scene ends in a victory. Place
your own `music`, `boss` or `victory` steps to time any of these yourself.

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

Props are cast members `{"prop": "cagecart", "side": "prop"}` placed with
`appear`. The newer beats: `{"do": "board", "actor", "prop", "at"}`,
`{"do": "unboard", "actor", "to"}`, `{"do": "pose", "actors", "pose"}`,
`{"do": "emote", "actors", "icon"}`, `{"do": "give", "from", "to", "item",
"face", "camera"}`, `{"do": "face", "turns": [{"actor", "dir"}]}`,
`{"do": "zoom", "z", "ms"}`, `{"do": "shake"}`, `{"do": "mood", "dark"}`,
`{"do": "light", "tint", "ms"}`, `{"do": "music", "cue"}`,
`{"do": "bossintro", "actor", "name", "zh", "title", "title_zh", "camera"}`,
`{"do": "victory", "party", "camera"}`; a scene that opens in a light or to
a cue has `"light"` or `"music"` on its `cut` beat.
The 2D player draws props from `assets/tk/props.png` (built from Ninja
Adventure pieces by `tools/build_props.py`) or from the kit's own sprites
(tables, jars, racks, fires, tents, gates).

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
party is applied either way. Fast-forwarding lands every beat in its end
state (props placed, riders aboard, lasting poses, gifts, zoom and mood);
emotes and shakes are skipped.
