# World 1: Black Wind as a gated battle (pilot)

The first try fails, the player gathers what the Star Lords' hint asks for, and the second try wins. This draft is the story side only. Nothing here is in `tools/tk_story.py` yet, because the player has no way to carry an item or to gate a node. The mechanics ask is at the bottom. Lines marked **[new]** are not in the novel (ch. 2); everything else is.

## The beats, in order

1. **The first try (scene `blackwind`, node n7, already staged).** Zhu Jun makes Liu Bei his vanguard. Zhang Fei spears Gao Sheng. Zhang Bao lets down his hair, chants, and the black wind pours out of a cloud. The army breaks and flees. This is the defeat scene: no board, no cooldown.
2. **The hint (same scene, the roadside shrine).** The Star Lords sit at their board. Their lines stay as they are: stargrey "Read this, before you run." (the problem), starred "Pigs, sheep, dogs. Blood." Zhu Jun then explains it as sorcery (novel: pigs', sheep's and dogs' blood, hidden men on the hill). The scene now ends with one new line of narration instead of sending Guan Yu and Zhang Fei up the ridge.
3. **Gathering (on the map).** Three people in the village at the foot of the hills each give one kind of blood. The objective counts them.
4. **Delivery (on the map).** Guan Yu waits on the left ridge, Zhang Fei on the right, a thousand men each (novel). Bringing the blood to each plays a short exchange.
5. **The early attempt (new scene `bossearly`, node boss).** If the player goes to Yangcheng before both ridges are supplied, the storm routs the army again and Guan Yu says what is missing. No board, no cooldown.
6. **The second try (scene `bosswin`, node boss, already staged).** With the ridges supplied, the board opens as normal and the ambush plays.

## Objectives

| Node | Objective (English) | Chinese |
|---|---|---|
| 1-n7 | Break Zhang Bao's sorcery in the hills. (unchanged) | 破张宝的妖术。 |
| after n7 | Gather blood from the village below the hills: pigs, sheep, dogs. | 到山下村中取猪、羊、狗血。 |
| after the three | Take the blood up to Guan Yu on the left ridge and Zhang Fei on the right. | 把血送上山去：关羽在左，张飞在右。 |
| 1-boss | Defeat Zhang Bao at Yangcheng. (unchanged) | 在阳城击败张宝。 |

## The scene `blackwind`, changed ending

Keep everything up to and including `["say", "zhujun", "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them. The spell will break."]`. Remove the steps after it (the two `army` groups on the ridge, the buckets, "Guan Yu and Zhang Fei each take a thousand men up the ridge…", and the two `move` steps); they move to the delivery. End the scene with:

```python
["n", "Zhu Jun's own men have no blood to spare. In the village below the hills there are pens, flocks and hounds. Liu Bei goes down to ask."],   # [new]
["light", "day", 1500],
["remove", "yt"], ["remove", "zb"], ["remove", "zj"],
```

Chinese:
```python
"Zhu Jun's own men have no blood to spare. In the village below the hills there are pens, flocks and hounds. Liu Bei goes down to ask.": "朱儁军中无血可用。山下村中有猪圈、羊群和猎犬，玄德下山去问。",   # [new]
```

## The village people (folk kinds the map already draws)

Each is a plain talk. The `say` line is what they say; the item is what the party gets.

| Who | Line | Item |
|---|---|---|
| A farmer at the pens (`folk.villager`) | "The black wind took my roof. Take the pigs' blood, if it ends this." | Pig's blood (猪血) |
| An old shepherd (`folk.elder`) | "My flock hasn't grazed since the storm. Take a sheep, general. Take what you need." | Sheep's blood (羊血) |
| A hunter (`folk.hunter`) | "My hounds won't go near that hill. If their blood breaks the spell, take it." | Dog's blood (狗血) |

All three lines are **[new]**; they are only there to give the items.

Chinese:
```python
"“The black wind took my roof. Take the pigs' blood, if it ends this.”": "“黑风掀了我的屋顶。若能破了妖风，猪血你们尽管拿去。”",   # [new]
"“My flock hasn't grazed since the storm. Take a sheep, general. Take what you need.”": "“羊群自风起后便没吃过草。将军要多少，只管取去。”",   # [new]
"“My hounds won't go near that hill. If their blood breaks the spell, take it.”": "“我的猎犬不肯近那座山。若用狗血能破法，你们拿去。”",   # [new]
```

Items for the world's `items` list:

```python
"pigblood":   {"name": "Pig's blood",   "zh": "猪血", "kind": "supply"},
"sheepblood": {"name": "Sheep's blood", "zh": "羊血", "kind": "supply"},
"dogblood":   {"name": "Dog's blood",   "zh": "狗血", "kind": "supply"},
```

## The two ridges

Each is a landmark the player walks up to and talks to.

| Ridge | Who is there | If the player has all three | If not |
|---|---|---|---|
| Left | Guan Yu with a thousand men | Guan Yu: "Blood and filth for every paper horse. We wait for the gun." | Guan Yu: "We hold the ridge. The blood is still to come." |
| Right | Zhang Fei with a thousand men | Zhang Fei: "Let his spirits come. I'll soak every one." | Zhang Fei: "A thousand men, and nothing to throw. Hurry, brother." |

All four lines are **[new]**; the thousand men and the left and right placement are the novel's.

Chinese:
```python
"“Blood and filth for every paper horse. We wait for the gun.”": "“纸人纸马，一个也不放过。只等炮响。”",   # [new]
"“We hold the ridge. The blood is still to come.”": "“山岭我们守着。血还没送到。”",   # [new]
"“Let his spirits come. I'll soak every one.”": "“叫他的鬼兵来吧，我一个个泼透。”",   # [new]
"“A thousand men, and nothing to throw. Hurry, brother.”": "“一千人在此，手里没东西可泼。哥哥快些。”",   # [new]
```

## The early attempt: scene `bossearly` (node boss, plays instead of `bosswin` if the ridges are not supplied)

No board. Defeat, then the clue.

```python
"bossearly": {"title": "The Wind Again", "kind": "main", "steps": [
    ["army", "han", "militia", 5, "boss", -26, 0],
    ["spawn", "zb", "zhangbao", "boss", 60, 0],
    ["army", "yt", "rebel", 12, "boss", 76, 0],
    ["n", "Liu Bei marches on Yangcheng with nothing to break the sorcery. Again Zhang Bao lets down his hair and chants."],
    ["light", "storm", 800], ["fx", "blackwind", "boss", 40, -4],
    ["n", "Again the black wind pours out of the cloud. The army breaks."],
    ["run", "han", "boss", -120, 0], ["run", "liubei", "boss", -60, 0],
    ["light", "day", 1500],
    ["say", "guanyu", "The old men said blood. Pigs, sheep, dogs. We have none."],   # [new]
    ["remove", "han"], ["remove", "yt"], ["remove", "zb"],
]},
```

Chinese:
```python
"Liu Bei marches on Yangcheng with nothing to break the sorcery. Again Zhang Bao lets down his hair and chants.": "玄德引军至阳城，无破妖术之物。张宝又披发仗剑作法。",   # [new]
"Again the black wind pours out of the cloud. The army breaks.": "黑气再起，风雷大作，军马溃走。",
"The old men said blood. Pigs, sheep, dogs. We have none.": "老人说过：血，猪、羊、狗血。我们一样也没有。",   # [new]
```

The existing `bosswin` stays as it is; its Chinese is already in place.

## Where the Star Lords sit in World 1 (decided with the user)

In person: oath, Daxing, Qingzhou, Black Wind. A sign of them at three more: **the mulberry tree** (the fortune-teller, already in the script), **the inn** (a weiqi board left on a table, empty, as Guan Yu comes in), and **the horses** (the merchants' string of horses led by a grey-haired old man in the background, no lines). None at the cage cart, Dong Zhuo's camp, the hitching post or the notice, where the problem is a decision the character must get right. Other people may give hints: Zhu Jun here, Lu Zhi in the tent.

## What the player and map need (for Primary Integration and Graphics)

In story terms; they decide how.

1. **A village at the foot of the Black Wind hills**, with a pen or hut, and three people to talk to (a farmer, an old shepherd, a hunter).
2. **Two ridge spots** on the same map, one on the left of the hills and one on the right, each with a place for a thousand-man group (the generator already draws `army` groups).
3. **Gathering:** talking to each village person gives the party one item (pig's, sheep's, dog's blood) and ticks the objective.
4. **Delivery:** talking to each ridge with all three items plays the exchange above and marks that ridge supplied.
5. **Gating:** the boss node plays `bossearly` (no board, no cooldown) until both ridges are supplied, then the normal boss scene. The player may attempt it at any time.
6. **Objectives:** the three above, in order, with the player's progress shown at the top of the screen as now.
