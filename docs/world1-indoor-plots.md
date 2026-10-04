# World 1: indoor side plots

The map factory builds a room behind every building's door (47 of them in World 1), but today scenes play on the outdoor map and the rooms are only visited for a one-line chat. This draft gives the rooms something to do, using events the novel (ch. 1–2) already has. Lines are quoted from the novel where it has them; nothing here is invented dialogue.

Two parts: (1) existing scenes that should move inside a named building, and (2) three new indoor scenes. Neither is wired in. Part 1 needs the engine to play a scene at a building's room instead of at the outdoor quest spot; Part 2 also needs new nodes (and, for the council, new cast).

## 1. Existing scenes that belong indoors

No new story text. The scene plays in the named room; the setting is what changes. Room ids are the ones in `data/tk_maps/w1/region.json`.

| Scene | Room | Why it belongs there |
|---|---|---|
| `notice`, second half (Guan Yu arrives) | `zhuo-county--inn` | The novel has the three drinking in the village inn when Guan Yu walks in |
| `office` ("What office do you hold?") | `dong-zhuos-camp--command` | Dong Zhuo's tent; Zhang Fei's rage is easier to stage in a small room |
| `peace1` (the old man in the cave) | `road-to-julu--cave` | The old man "led him into a cave" (引至一洞中) |
| `peace2` (charmed water) | `julu--house-1` | Zhang Jiao heals the sick of the plague; a sickroom, not a road |
| `peace3` (Zhang Jiao's plan, Tang Zhou's betrayal) | `yellow-hills--tent` | The Yellow Turban tent landmark already exists |
| `caocao1` (the feigned stroke) | `qiao--caohome` | The Cao family house: the uncle, the father, the boy |
| `caocao2` (Xu Shao's verdict) | `luoyang-gates--hall-1` | Xu Shao receives him in his hall; label it "Xu Shao's hall" |
| `bribe` (Zuo Feng asks for a bribe) | needs a tent at Envoy's Road (see 2b) | Lu Zhi's camp |
| `bosswin` (Yan Zheng's stab) | `yangcheng--keep` (optional) | Zhang Bao's stronghold; the novel doesn't say where |

## 2. New indoor scenes

### 2a. The Governor's Council (Zhuo County, `zhuo-county--office`)

Setting: **indoor** (county office, a hall room). A **side** scene before `notice`, answering "where did the notice come from?" Needs cast `liuyan` and `zoujing` (or the folk kind `official` as stand-ins). Needs a node at Zhuo County's office landmark.

```python
"council": {"title": "The Governor's Council", "kind": "side", "setting": "indoor", "steps": [
    ["n", "The Yellow Turbans have crossed into You Province. Governor Liu Yan summons his officer Zou Jing."],
    ["spawn", "ly", "liuyan", "n1", 10, -6], ["spawn", "zj", "zoujing", "n1", 22, -6],
    ["say", "zoujing", "The rebels are many and our soldiers are few. My lord, you should raise troops at once, and meet them."],
    ["problem"],  # the board comes up here; the rest plays once it is solved
    ["say", "liuyan", "You are right."],
    ["n", "Liu Yan orders the notice posted, calling for volunteers. It goes up on the wall at Zhuo County, and it draws out a hero."],
    ["remove", "ly"], ["remove", "zj"],
]},
```

Chinese:

```python
"The Yellow Turbans have crossed into You Province. Governor Liu Yan summons his officer Zou Jing.": "黄巾前犯幽州界分。太守刘焉闻得贼兵将至，召校尉邹靖计议。",
"The rebels are many and our soldiers are few. My lord, you should raise troops at once, and meet them.": "贼兵众，我兵寡，明公宜作速招军应敌。",
"You are right.": "刘焉然其说。",
"Liu Yan orders the notice posted, calling for volunteers. It goes up on the wall at Zhuo County, and it draws out a hero.": "随即出榜招募义兵。榜文行到涿县，乃引出涿县中一个英雄。",
```

(The novel has Liu Yan agree in narration, "刘焉然其说"; here he says it as a short line. Make it narration if you want it strictly faithful.)

### 2b. Lu Zhi's Tent (Guangzong Road)

Setting: **indoor** (a tent). A **main-line** beat between Qingzhou and the cage cart, replacing the narration I added at the start of `cart` about Lu Zhi's camp and the Yingchuan errand. It needs a **tent landmark** on Guangzong Road, and a node before `n5`. It also gives the `bribe` side story a tent to move into.

```python
"tent": {"title": "Lu Zhi's Tent", "kind": "main", "setting": "indoor", "steps": [
    ["n", "Liu Bei, who once studied under Lu Zhi, comes to help him at Guangzong. Lu Zhi is glad to see him, and keeps him in the tent."],
    ["spawn", "lz", "luzhi", "n5", 12, -4],
    ["say", "luzhi", "I have Zhang Jiao penned in here. His brothers Zhang Liang and Zhang Bao are at Yingchuan, facing Huangfu Song and Zhu Jun."],
    ["problem"],  # the board comes up here; the rest plays once it is solved
    ["say", "luzhi", "Take your own men, and I will give you a thousand more. Go to Yingchuan, learn how they stand, and we will fix a day to destroy them."],
    ["n", "Liu Bei takes his orders, and marches through the night."],
    ["remove", "lz"],
]},
```

Chinese:

```python
"Liu Bei, who once studied under Lu Zhi, comes to help him at Guangzong. Lu Zhi is glad to see him, and keeps him in the tent.": "玄德昔曾师事卢植，来到广宗，入帐施礼，具道来意。卢植大喜，留在帐前听调。",
"I have Zhang Jiao penned in here. His brothers Zhang Liang and Zhang Bao are at Yingchuan, facing Huangfu Song and Zhu Jun.": "我今围贼在此。贼弟张梁、张宝在颍川，与皇甫嵩、朱儁对垒。",
"Take your own men, and I will give you a thousand more. Go to Yingchuan, learn how they stand, and we will fix a day to destroy them.": "汝可引本部人马，我更助汝一千官军，前去颍川打探消息，约期剿捕。",
"Liu Bei takes his orders, and marches through the night.": "玄德领命，引军星夜投颍川来。",
```

If this lands, the first three narration lines of `cart` ("Qingzhou is relieved…", "Lu Zhi is glad…", "By the time Liu Bei arrives…") can be trimmed to a single line about Huangfu Song's answer and the road back.

### 2c. The Fire Plan (Changshe, `changshe--camp`)

Setting: **indoor** (the Han camp's command tent). The first half of `caocao3` split out: the novel has Huangfu Song and Zhu Jun plan the fire in council before the battle, and Cao Cao's red banners come later, outdoors. Needs cast `huangfusong` (exists) and `zhujun` (exists). No new node: this is the first half of `caocao3`, played in the tent.

```python
"fireplan": {"title": "The Fire Plan", "kind": "side", "setting": "indoor", "steps": [
    ["n", "At Changshe, the Yellow Turbans have pitched their camp in tall grass."],
    ["spawn", "hs", "huangfusong", "b3", 8, -4], ["spawn", "zj", "zhujun", "b3", 18, -4],
    ["say", "huangfusong", "They have made camp in the grass. We can burn them."],
    ["problem"],  # the board comes up here; the rest plays once it is solved
    ["say", "zhujun", "Every man is to carry a bundle of straw, and hide it."],
    ["n", "That night a great wind rises."],
    ["remove", "hs"], ["remove", "zj"],
]},
```

and the existing `caocao3` keeps only the outdoor half (the fire, the flight, and Cao Cao's red banners at dawn), with its own problem moved to the standoff with Zhang Liang and Zhang Bao.

Chinese:

```python
"At Changshe, the Yellow Turbans have pitched their camp in tall grass.": "黄巾贼退入长社，依草结营。",
"They have made camp in the grass. We can burn them.": "贼依草结营，当用火攻之。",
"Every man is to carry a bundle of straw, and hide it.": "遂令军士，每人束草一把，暗地埋伏。",
"That night a great wind rises.": "其夜大风忽起。",
```

## What needs to happen next

1. **Engine / map-factory:** play a named scene in a named room (Part 1), add a tent landmark at Envoy's Road and Guangzong Road, and allow new nodes for 2a and 2b. Cast `liuyan` and `zoujing` need sprites, or stand-ins from the folk kinds.
2. **This session:** once the engine confirms the format, I port the approved scenes into `tools/tk_story.py` and `tools/tk_story_zh.py`, drop the narration in `cart` that 2b replaces, and re-run the scenes generator to check it.
3. **Decisions for the user:** which of Part 1 to do first; whether 2a and 2b are worth new nodes; and whether Liu Yan's "You are right" should be narration (as in the novel) or a spoken line.

## Left out

- **The teahouse storyteller:** the novel has no such scene. His lines in `tk_places.py` stay as flavour.
- **Liu Bei's home:** the novel gives only narration (he serves his mother devotedly, selling sandals and weaving mats), covered by the mulberry-tree opening, so there is nothing to act out indoors.
- **Zhang Fei's farm:** the invitation now plays at the end of `notice`; staging it indoors is possible but adds no new story.
- **The Anxi hostel:** not a World 1 map, as noted for the inspector scene.
