# World 1 staging draft

Silent staging for the scenes that are narration-only today. The steps use the new step names the Graphics and Mechanics session is adding (`prop`, `board`, `unboard`, `pose`, `emote`, `give`, `surround`, `close`, `camera`, `mood`). **They are not in the player or on `main` yet**, so none of this is in `tools/tk_story.py`; an unknown step would break the build. When the steps land, these lines go in as written. None of them carries spoken text, so none needs Chinese or voice.

Staging stays in the "plain" register: poses, props and pauses, no extra speech. Positions are node key plus dx/dy in node-map pixels (+dx toward the enemy).

## oath (n2, outdoor)

After the vow, and before the "Three hundred village braves join them" line:

```python
["prop", "wine", "winejars", "n2", 14, 8], ["prop", "tbl", "table", "n2", 0, 10],
["army", "braves", "militia", 8, "n2", -40, 0],
["move", "braves", "n2", -16, 0],        # plays while the braves-join line is read
["pose", "party", "drink"],
["wait", 1200],
["pose", "zhangfei", "drunk"], ["emote", "zhangfei", "zzz"],
```

Novel: ox and horse for sacrifice, 300 or more village braves, drinking "until one is drunk" (痛飲一醉).

## horses (as, outdoor)

Replaces the bare `["gain", ...]` lines:

```python
["prop", "forge", "forge", "as", -20, -10], ["prop", "anvil", "anvil", "as", -12, -6],
["spawn", "smith", "f_porter", "as", -14, -6],
["fx", "sparkle", "as", -14, -10], ["wait", 800],
["give", "smith", "liubei", "twin_swords"],
["give", "smith", "guanyu", "green_dragon"],
["give", "smith", "zhangfei", "serpent_spear"],
["remove", "smith"], ["remove", "forge"], ["remove", "anvil"],
```

Novel: Liu Bei has twin swords forged; Guan Yu's Green Dragon Crescent Blade (82 jin, "Cold Beauty"); Zhang Fei's eighteen-foot serpent spear; armour for each.

## cart (n5, outdoor)

```python
["prop", "cart", "cagecart", "n5", 30, -6], ["board", "lz", "cart"],
["army", "guards", "f_soldier", 4, "n5", 36, 0],
["mood", "dark"], ["camera", "zoom", 1.4, 800],
# ... Lu Zhi's explanation and Zhang Fei's threat play here ...
["emote", "zhangfei", "anger"],
# ["problem"] goes here (see tk_story.py)
# ... Liu Bei's "The court will judge him fairly" ...
["move", "cart", "n5", 70, -10], ["move", "guards", "n5", 70, -6],
["camera", "zoom", 1, 600], ["mood", "clear"],
["remove", "cart"], ["remove", "guards"],
```

This replaces the invented Lu Zhi line that the first port added; the novel has Liu Bei, not Lu Zhi, restrain Zhang Fei.

## qingzhou (n4, outdoor)

```python
["prop", "gate", "gate", "n4", 60, 0],
["surround", "yt", "gate", 40],         # at "Rebels besiege Qingzhou"
["emote", "liubei", "sweat"],
```

## bosswin (boss, outdoor)

```python
["prop", "gate", "gate", "boss", 70, 0],
["surround", "han", "gate", 48],        # Zhu Jun's army around Yangcheng
["close", "han", "gate", 30],
["mood", "dark"],
# ... then Yan Zheng's stab with strike/fall, as in tk_story.py ...
["mood", "clear"],
```

## Not staged (and why)

- **Mulberry-tree opening:** needs a quest at the start village and two sprites (`liubei_child`, `liuyuanqi`). See `docs/world1-script-draft.md`.
- **Anxi interlude and the inspector:** the existing script plays these as narration and dialogue. When the steps land, the hostel hall could use `["prop", "tbl", "table", ...]` for the inspector's seat, and `["pose", "inspector", "stand"]` / `["pose", "liubei", "stand"]` below the steps, but that is a bigger staging pass and needs a decision on interiors.
