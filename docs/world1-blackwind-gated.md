# World 1: Black Wind as a gated battle (pilot), with the Star Lords' shrine

The point of all of this is that solving the Star Lords' board **changes the world**. Before it, nobody can help and the battle is lost. After it, the shrine settles, the people offer what is needed, and the second try can win. **Status: written into `tools/tk_story.py` and `tools/tk_places.py` in the format of `docs/story-mechanics-format.md`** (nodes n7, n7b and the boss gate; scenes `blackwind`, `shrine`, `bossearly`, `bossearly2`; the village people and ridges). The text below is the design record. Lines marked **[new]** are not in the novel (ch. 2); the rest are.

## The shrine

Every town has a small weiqi shrine: a stone board with a few stones on it and an incense burner, in the manner of the Keeper's Shrines in Black Myth: Wukong. It is the Star Lords' standing place in that town. The old men themselves appear only when the story calls for them, and only **after a failure**.

Three looks:

| State | Look | Meaning |
|---|---|---|
| Dark | cold stone, no incense | nothing to say here (the quiet scenes: the cage cart, Dong Zhuo's camp, the hitching post, the notice) or no failure has happened yet |
| Lit | the stones glow, incense burns | a hint is waiting; the Star Lords are about to appear |
| Settled | soft glow, no incense smoke | the hint was taken and the board solved |

In World 1 four shrines ever light (the peach garden board, Daxing, Qingzhou, Black Wind). The rest stay dark until later Books. The Peach Garden's board is already a landmark; it is its shrine.

## The beats at Black Wind, in order

1. **The first try (scene `blackwind`, node n7).** Zhu Jun makes Liu Bei his vanguard. Zhang Fei spears Gao Sheng. Zhang Bao lets down his hair and chants, the black wind pours out of a cloud, and the army breaks. This is the defeat: **no board and no Star Lords**. The shrine at the roadside is dark. The scene ends with Zhu Jun admitting he has no answer.
2. **The shrine lights (scene `shrine`, new node n7b).** The shrine, dark until now, begins to glow. The two old men are at the board. Their hint is spoken before the board opens (they are gone by the time it closes); solving the board is what the world answers: the shrine settles and everything below opens. Zhu Jun then gives the plan (novel) and the shrine settles.
3. **Gathering.** The people in the village below the hills, who until now only had plain lines, each give one kind of blood.
4. **Delivery.** The two ridges, empty until now, fill with Guan Yu and Zhang Fei and a thousand men each. Bringing the blood to each plays a short exchange.
5. **The early attempt (scenes `bossearly`, `bossearly2`, node boss).** If the player goes to Yangcheng before both ridges are supplied, the storm routs the army again. What Guan Yu says depends on whether the hint has been taken. No board, no cooldown.
6. **The second try (scene `bosswin`, node boss, already staged).** With both ridges supplied the board opens as normal and the ambush plays.

Nothing in 3 and 4 can be done before the shrine board is solved. The people give nothing and the ridges are empty until then.

## Before and after the hint

| Who | Before the hint (shrine unsolved) | After the hint |
|---|---|---|
| Zhu Jun | end of `blackwind`: "Sorcery. A man cannot fight a wind. Fall back to the road." **[new]** | in `shrine`: "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them. The spell will break." (novel, the line already in the script) |
| Farmer at the pens | "The black wind has been bad this month." **[new]** | "The black wind took my roof. Take the pigs' blood, if it ends this." **[new]** (gives pig's blood) |
| Old shepherd | "Keep off the hills, general." **[new]** | "My flock hasn't grazed since the storm. Take a sheep, general. Take what you need." **[new]** (gives sheep's blood) |
| Hunter | "My hounds won't go near that hill." **[new]** | "My hounds won't go near that hill. If their blood breaks the spell, take it." **[new]** (gives dog's blood) |
| Left ridge (Guan Yu) | empty; no one there | with no blood: "We hold the ridge. The blood is still to come." **[new]**; with blood: "Blood and filth for every paper horse. We wait for the gun." **[new]** |
| Right ridge (Zhang Fei) | empty; no one there | with no blood: "A thousand men, and nothing to throw. Hurry, brother." **[new]**; with blood: "Let his spirits come. I'll soak every one." **[new]** |
| Early attempt at Yangcheng | `bossearly`: Liu Bei, "No man can fight a wind. Fall back." **[new]** | `bossearly2`: Guan Yu, "The old men said blood. Pigs, sheep, dogs. We have none." **[new]** |

## Scene text

### `blackwind` (the first try): changed ending

Keep everything up to the rout, including `["n", "Wind howls and thunder rolls. Out of a black cloud pours a numberless host of horsemen. Liu Bei's army breaks and flees."]` and the `run` steps after it. **Remove** the Star Lords' `spawn`, `say` and `problem` steps and Zhu Jun's plan line, and the ridge army, bucket and Guan Yu / Zhang Fei steps after it. The scene ends with:

```python
["say", "zhujun", "Sorcery. A man cannot fight a wind. Fall back to the road."],   # [new]
["light", "day", 1500],
["remove", "yt"], ["remove", "zb"], ["remove", "zj"],
```

The node n7 keeps its place and no longer carries a problem. Today the generator needs one problem per scene, so this needs the engine's defeat scene format (see the asks).

### `shrine` (new, node n7b: the Star Lords after the failure)

```python
"shrine": {"title": "The Shrine at the Roadside", "kind": "main", "steps": [
    ["spawn", "zj", "zhujun", "n7b", -14, -10],
    ["n", "At the roadside, the old shrine that was dark begins to glow. Two white-haired men sit over its board, as if nothing had happened."],   # [new]
    ["spawn", "sg", "stargrey", "n7b", -34, 20], ["spawn", "sr", "starred", "n7b", -26, 24],
    ["say", "stargrey", "Read this, before you go back."],   # [new]
    ["say", "starred", "Pigs, sheep, dogs. Blood."],
    ["problem", "stargrey"],   # the board comes up here; the Star Lords are gone by the time it closes, so all their lines come before it
    ["say", "zhujun", "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them. The spell will break."],
    ["n", "Zhu Jun's own men have no blood to spare. In the village below the hills there are pens, flocks and hounds. Liu Bei goes down to ask."],   # [new]
    ["remove", "zj"],
]},
```

The shrine's `intro` and `outro` in `tk_places.py` are the usual place for the landmark text:

```python
"intro": ["The old shrine at the roadside, dark until now, begins to glow."],
"outro": ["The glow settles. Only the board remains, and a thread of incense."],
```

### `bossearly` and `bossearly2` (node boss; no board, no cooldown)

```python
"bossearly": {"title": "The Wind Again", "kind": "main", "steps": [
    ["army", "han", "militia", 5, "boss", -26, 0],
    ["spawn", "zb", "zhangbao", "boss", 60, 0],
    ["army", "yt", "rebel", 12, "boss", 76, 0],
    ["n", "Liu Bei marches on Yangcheng with nothing to break the sorcery. Again Zhang Bao lets down his hair and chants."],   # [new]
    ["light", "storm", 800], ["fx", "blackwind", "boss", 40, -4],
    ["n", "Again the black wind pours out of the cloud. The army breaks."],
    ["run", "han", "boss", -120, 0], ["run", "liubei", "boss", -60, 0],
    ["light", "day", 1500],
    ["say", "liubei", "No man can fight a wind. Fall back."],   # [new]
    ["remove", "han"], ["remove", "yt"], ["remove", "zb"],
]},
"bossearly2": {"title": "The Wind Again", "kind": "main", "steps": [
    # as bossearly, up to the last line, then:
    ["say", "guanyu", "The old men said blood. Pigs, sheep, dogs. We have none."],   # [new]
    ["remove", "han"], ["remove", "yt"], ["remove", "zb"],
]},
```

The existing `bosswin` stays as it is.

## Objectives

| Node | Objective | Chinese |
|---|---|---|
| 1-n7 | Break Zhang Bao's sorcery in the hills. (unchanged; the first try) | 破张宝的妖术。 |
| 1-n7b | Go to the roadside shrine where the glow has begun. | 去路旁那座发光的神龛。 |
| after the hint | Gather blood from the village below the hills: pigs, sheep, dogs. | 到山下村中取猪、羊、狗血。 |
| after the three | Take the blood up to Guan Yu on the left ridge and Zhang Fei on the right. | 把血送上山去：关羽在左，张飞在右。 |
| 1-boss | Defeat Zhang Bao at Yangcheng. (unchanged) | 在阳城击败张宝。 |

## Chinese for the new lines

```python
"Sorcery. A man cannot fight a wind. Fall back to the road.": "此乃妖术，人如何与风相战？退回大路。",   # [new]
"At the roadside, the old shrine that was dark begins to glow. Two white-haired men sit over its board, as if nothing had happened.": "路旁那座暗了的旧神龛忽然发出微光。两位白发老人坐在棋盘前，仿佛什么也没发生。",   # [new]
"Read this, before you go back.": "再去之前，先读这一局。",   # [new]
"Zhu Jun's own men have no blood to spare. In the village below the hills there are pens, flocks and hounds. Liu Bei goes down to ask.": "朱儁军中无血可用。山下村中有猪圈、羊群和猎犬，玄德下山去问。",   # [new]
"“The black wind has been bad this month.”": "“这个月黑风厉害。”",   # [new]
"“The black wind took my roof. Take the pigs' blood, if it ends this.”": "“黑风掀了我的屋顶。若能破了妖风，猪血你们尽管拿去。”",   # [new]
"“Keep off the hills, general.”": "“将军，别上那座山。”",   # [new]
"“My flock hasn't grazed since the storm. Take a sheep, general. Take what you need.”": "“羊群自风起后便没吃过草。将军要多少，只管取去。”",   # [new]
"“My hounds won't go near that hill.”": "“我的猎犬不肯近那座山。”",   # [new]
"“My hounds won't go near that hill. If their blood breaks the spell, take it.”": "“我的猎犬不肯近那座山。若用狗血能破法，你们拿去。”",   # [new]
"“Blood and filth for every paper horse. We wait for the gun.”": "“纸人纸马，一个也不放过。只等炮响。”",   # [new]
"“We hold the ridge. The blood is still to come.”": "“山岭我们守着。血还没送到。”",   # [new]
"“Let his spirits come. I'll soak every one.”": "“叫他的鬼兵来吧，我一个个泼透。”",   # [new]
"“A thousand men, and nothing to throw. Hurry, brother.”": "“一千人在此，手里没东西可泼。哥哥快些。”",   # [new]
"Liu Bei marches on Yangcheng with nothing to break the sorcery. Again Zhang Bao lets down his hair and chants.": "玄德引军至阳城，无破妖术之物。张宝又披发仗剑作法。",   # [new]
"Again the black wind pours out of the cloud. The army breaks.": "黑气再起，风雷大作，军马溃走。",
"No man can fight a wind. Fall back.": "人如何与风相战？退！",   # [new]
"The old men said blood. Pigs, sheep, dogs. We have none.": "老人说过：血，猪、羊、狗血。我们一样也没有。",   # [new]
"The old shrine at the roadside, dark until now, begins to glow.": "路旁这座暗了的旧神龛，忽然发出微光。",   # [new]
"The glow settles. Only the board remains, and a thread of incense.": "微光渐息，只剩棋盘，和一缕香烟。",   # [new]
```

Items for the world's `items` list:

```python
"pigblood":   {"name": "Pig's blood",   "zh": "猪血", "kind": "supply"},
"sheepblood": {"name": "Sheep's blood", "zh": "羊血", "kind": "supply"},
"dogblood":   {"name": "Dog's blood",   "zh": "狗血", "kind": "supply"},
```

## What is needed from Integration and Graphics (in story terms; they decide how)

1. **Graphics: the shrine.** One small prop, a stone weiqi board with an incense burner, with three looks (dark, lit, settled). One per town, placed by each place's centre.
2. **Graphics: the Black Wind map.** The village and the two ridges are done (99b9ab4). Add a roadside shrine spot and a node n7b for the `shrine` scene, between the altar and the road to Yangcheng.
3. **Integration: shrine state.** Dark until a failure has happened in that place, lit while the hint is waiting, settled once the board is solved.
4. **Integration: a defeat scene with no board.** `blackwind` and the two `bossearly` scenes have no problem. Today a scene needs exactly one.
5. **Integration: items by talking.** After the shrine board is solved, each village person gives one item; before it, they only say their plain line.
6. **Integration: the ridges.** Empty until the shrine is solved; delivering all three items to a ridge plays its exchange and marks it supplied.
7. **Integration: the boss gate.** The boss node plays `bossearly` if the shrine is unsolved, `bossearly2` if the hint was taken but the ridges are not both supplied, and the normal boss scene once they are. No cooldown, no problem spent.
8. **Edges.** n7 to n7b to boss.

## When the Star Lords appear: a moment of need

Not only after a failure. A shrine lights, and the Star Lords appear, at **a moment of need**: a failure (Black Wind, Qingzhou after its retreat) or a threshold or danger that cannot be passed alone. In World 1:

| Place | The moment of need |
|---|---|
| Peach Garden | a threshold: three strangers about to swear, and the vow needs a witness (no failure) |
| Daxing | danger: five hundred men against fifty thousand (no failure) |
| Qingzhou | a failure: the relief force falls back thirty li |
| Black Wind | a failure: the storm routs the army |

Everywhere else the shrine stays dark. The cage cart, Dong Zhuo's camp, the hitching post and the notice have no moment of need that a hint would answer; the person is on their own.

## What a shrine says when touched

| State | Line | Chinese |
|---|---|---|
| Dark | "The board is quiet." | “棋盘寂静。” |
| Lit (hint waiting) | the Star Lords appear (the scene above) | |
| Settled | the Star Lords' hint again, and the current objective | |

At Black Wind a settled shrine says: "Pigs, sheep, dogs. Blood." and shows the objective "Gather blood from the village below the hills: pigs, sheep, dogs", or, once that is done, "Take the blood up to Guan Yu on the left ridge and Zhang Fei on the right." Hint text for the other three shrines is each Star Lord's own line from that scene: Daxing "To catch the bandits, first catch their king.", Qingzhou "Don't hold the strong point. Give ground, and make them follow."

Dark shrines are in the towns that will never light in World 1 only as a quiet stone; later Books can light one for an optional hidden board.

## Length

The Black Wind route is now: the first try, the shrine board, one visit to the village (the three people stand together at the pens, three short talks), two ridge talks, then the boss. About seven short actions. If the playtest says it drags, the first thing to cut is the two ridge talks (one visit that supplies both), not the village.

## Second talks: "already given" lines (from Game Design's mechanics spec)

Each giver says one of these if the player talks to them again after taking the blood. The items are not used up when delivered, so one set of three supplies both ridges, and they are removed after Yangcheng is won.

| Who | Line | Chinese |
|---|---|---|
| Farmer | "You have my pigs' blood. Go, and stop this wind." **[new]** | “猪血你们已经拿走了。去吧，把这风止住。” |
| Old shepherd | "You've had the best of my flock, general. Go on." **[new]** | “我羊群里最好的已经给你了，将军，去吧。” |
| Hunter | "You have the dog's blood. May it do what it must." **[new]** | “狗血你们拿去了。但愿它能破了那法。” |

```python
"“You have my pigs' blood. Go, and stop this wind.”": "“猪血你们已经拿走了。去吧，把这风止住。”",   # [new]
"“You've had the best of my flock, general. Go on.”": "“我羊群里最好的已经给你了，将军，去吧。”",   # [new]
"“You have the dog's blood. May it do what it must.”": "“狗血你们拿去了。但愿它能破了那法。”",   # [new]
```

The objective line shows counts and names the next missing thing: "Gather blood from the village below the hills: pigs, sheep, dogs (1/3)", then "Take the blood up to Guan Yu on the left ridge and Zhang Fei on the right (1/2)". The two `bossearly` defeat scenes may repeat; they are skippable from the second time.
