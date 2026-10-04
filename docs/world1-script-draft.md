# World 1 · The Peach Garden Oath: emotional script draft

Draft revision of World 1 (ch. 1–2) for the emotion-first plan. Spine: **strangers become brothers**, and the first test of the oath.

The emphasis is on staging, not speech: pauses, poses, effects and who stands where. Dialogue stays plain and short, and deaths play on screen.

Scenes use the step format from `tools/tk_story.py`, plus a `"setting"` field (`"outdoor"`, `"indoor"`, or a list when a scene moves). This is a draft: nothing here is wired into `tk_story.py`, `tk_story_zh.py` or the voice build yet. Lines marked **[new]** are invented for the game and are not in the novel. Everything else was checked against ch. 1–2 of the Chinese text (Luo Guanzhong, Project Gutenberg #23950); see "Source check" at the end for what that turned up.

New cast needed: `oldman_n` (Northern Dipper, in dark robes) and `oldman_s` (Southern Dipper, in red). Both stay unnamed in World 1. They speak once per appearance. The mulberry-tree scene also needs `liubei_child` and `liuyuanqi`.

## Settings

`docs/map-format.md` describes only building exteriors (a door at the bottom edge of a footprint), with no interior maps. Until interiors exist, "indoor" scenes are staged at the door or porch of the building.

| Scene | Setting |
|---|---|
| tree | outdoor (Louzang Village, under the mulberry tree) |
| notice | outdoor (the wall) → **indoor** (village inn; porch if no interiors) |
| oath | outdoor (peach garden) |
| daxing | outdoor |
| qingzhou | **indoor** (teahouse corner; porch if no interiors) → outdoor (ridge) |
| cart | outdoor (road) |
| office | outdoor (Dong Zhuo's camp gate) |
| blackwind | outdoor (hills, roadside shrine) |
| bosswin | outdoor (Yangcheng gate) |
| closing: inspector | outdoor (lodge gate and courtyard at Anxi) |

## Changes against the current World 1

| Current | Draft |
|---|---|
| Daxing Mountain is a full fight scene | Shortened; the deaths of Deng Mao and Cheng Yuanzhi stay on screen |
| Qingzhou is a tactics scene | The Star Lords' first counsel is where the ambush comes from |
| "What office do you hold?" is a short quarrel | Slower, with pauses; the weight is in the staging |
| Zhang Bao's death is a single narration line | Played on screen: Yan Zheng kills him at the gate |
| The inspector scene is a quick flogging | Rebuilt around the weeping villagers; Liu Bei hanging his seal on the inspector is the quiet climax |
| World 1 opens at the notice | Opens at the mulberry tree at Louzang, where the child Liu Bei says he will ride the carriage canopy; sets up Lu Zhi as his old teacher |
| No Star Lords in World 1 | Three appearances (tree, teahouse, shrine), one plain line each |

## Main scenes

```python
"tree": {"title": "The Mulberry Tree at Louzang", "kind": "main", "setting": "outdoor", "steps": [
    # attach to the `start` node (Lousang Village); plot.py only makes quests of nodes that have a scene
    ["n", "Louzang Village, Zhuo County. South-east of one house stands a mulberry tree more than fifty feet tall. From far off, it looks like the canopy of a carriage."],
    ["n", "A passing fortune-teller looks at it and says: this family will produce a great man."],
    ["spawn", "kid", "liubei_child", "start", 10, 4],
    ["spawn", "unc", "liuyuanqi", "start", 30, 6],
    ["n", "Liu Bei's father died early. As a boy he plays under the tree with the village children."],
    ["say", "liubei_child", "I will be the Son of Heaven, and I will ride this carriage canopy."],
    ["wait", 1200],
    ["say", "liuyuanqi", "This is no ordinary child!"],
    ["n", "The family is poor. His uncle Liu Yuanqi helps them from then on."],
    ["remove", "kid"], ["remove", "unc"],
    ["n", "At fifteen, his mother sends him to study under Zheng Xuan and Lu Zhi, and he befriends Gongsun Zan."],
    ["n", "Now he is twenty-eight. He is a devoted son to his mother, and he supports her by selling sandals and weaving mats."],
]},

"notice": {"title": "The Notice at Zhuo", "kind": "main", "setting": ["outdoor", "indoor"], "steps": [
    ["n", "Zhuo County. A crowd gathers at a notice on the wall: the Han is raising troops against the Yellow Turbans."],
    ["n", "Liu Bei, twenty-eight, descends from Prince Jing of Zhongshan, yet he sells sandals and weaves mats. His ears reach his shoulders; his arms hang past his knees."],
    ["n", "He reads the notice, and sighs."],
    ["spawn", "zf", "zhangfei", "n1", 30, 4],
    ["move", "zf", "n1", 12, 2],
    ["say", "zhangfei", "A real man should serve his country! What are you sighing for?"],
    ["say", "liubei", "I am of the Han imperial house. I long to crush these rebels and bring peace, but I lack the strength."],
    ["say", "zhangfei", "I've got money and land. Let's raise men together! But first, wine."],
    ["n", "At the village inn, a giant pushing a cart strides in: nine feet tall, a beard two feet long, a face like a ripe red date."],
    ["spawn", "gy", "guanyu", "n1", -40, -10],
    ["move", "gy", "n1", -12, 0],
    ["say", "guanyu", "Wine, quickly! I'm off to the city to join the army."],
    ["say", "liubei", "Then sit with us, friend. We have the same purpose."],
    ["say", "guanyu", "Guan Yu, of Hedong. I killed a bully who preyed on my village, and I've been on the run five years."],
    ["remove", "zf"], ["remove", "gy"],
    ["party", ["liubei", "guanyu", "zhangfei"]],
]},

"oath": {"title": "The Peach Garden Oath", "kind": "peak", "setting": "outdoor", "steps": [
    ["say", "zhangfei", "Behind my farm is a peach garden in full bloom. Tomorrow, let's swear brotherhood there before Heaven and Earth!"],
    ["fx", "petals", "n2", 0, -20],
    ["n", "A black ox and a white horse for sacrifice. The three burn incense and bow."],
    ["fx", "incense", "n2", -14, -4],
    ["say", "liubei", "Though we were not born on the same day of the same month of the same year..."],
    ["say", "guanyu", "...we wish to die on the same day of the same month of the same year."],
    ["say", "zhangfei", "Heaven and Earth, witness it! If we betray this oath, may Heaven and men strike us down!"],
    ["wait", 1500],
    ["n", "Liu Bei is eldest, Guan Yu second, Zhang Fei youngest. Three hundred village braves join them, and they drink in the garden until they can drink no more."],
    ["n", "Their road forks here. The long road passes through the rebels' heartland; the mountain trail is shorter, and steeper."],
]},

"daxing": {"title": "Five Hundred Against Fifty Thousand", "kind": "main", "setting": "outdoor", "steps": [
    ["n", "The Yellow Turban general Cheng Yuanzhi marches on Zhuo with fifty thousand men. Liu Bei has five hundred."],
    ["spawn", "oldmanN", "oldman_n", "n3", -40, 6],
    ["spawn", "oldmanS", "oldman_s", "n3", -34, 10],
    ["n", "Under an old tree beside the road, two white-haired men sit over a Go board. They do not look up."],   # [new]
    ["say", "oldman_n", "Solve this first."],   # [new]
    ["n", "(A Go problem opens.)"],
    ["remove", "oldmanN"], ["remove", "oldmanS"],
    ["spawn", "r1", "rebel", "n3", 34, -8], ["spawn", "r2", "rebel", "n3", 40, 6],
    ["say", "liubei", "Traitors to the realm! Why not surrender now?"],
    ["say", "chengyuanzhi", "Deng Mao, bring me his head!"],
    ["move", "r1", "n3", 14, -4],
    ["pose", "zhangfei", "strike"], ["fx", "flash", "n3", 14, -4], ["pose", "r1", "fall"],
    ["n", "Zhang Fei's spear takes Deng Mao through the heart."],
    ["move", "r2", "n3", 14, 4],
    ["pose", "guanyu", "strike"], ["fx", "flash", "n3", 14, 4], ["pose", "r2", "fall"],
    ["n", "Guan Yu's great blade cuts Cheng Yuanzhi in two. The rebels throw down their spears and run."],
    ["remove", "r1"], ["remove", "r2"],
]},

"qingzhou": {"title": "The Ambush at Qingzhou", "kind": "main", "setting": ["indoor", "outdoor"], "steps": [
    ["n", "Rebels besiege Qingzhou. The relief force is outnumbered and falls back thirty li. In a teahouse corner, the two old men are playing Go again."],   # [new]
    ["spawn", "oldmanN", "oldman_n", "n4", -30, 8],
    ["spawn", "oldmanS", "oldman_s", "n4", -24, 12],
    ["say", "oldman_s", "Don't hold the strong point. Give ground, and make them follow."],   # [new]
    ["n", "(A Go problem opens.)"],
    ["remove", "oldmanN"], ["remove", "oldmanS"],
    ["say", "liubei", "They are many and we are few. Only surprise will win this. Yunchang, hide your men left of the ridge. Yide, to the right. When the gongs sound, strike."],
    ["n", "Next morning Liu Bei attacks, then turns and flees. The rebels chase him over the ridge."],
    ["fx", "dust", "n4", -20, 0],
    ["n", "Gongs crash. Guan Yu and Zhang Fei burst from both flanks as Liu Bei wheels around. The siege of Qingzhou is lifted."],
]},

"cart": {"title": "The Cage Cart", "kind": "main", "setting": "outdoor", "steps": [
    ["n", "Liu Bei sets out to help his old teacher Lu Zhi, who has Zhang Jiao trapped at Guangzong. On the road they meet soldiers guarding a prison cart."],
    ["spawn", "lz", "luzhi", "n5", 22, -6],
    ["say", "luzhi", "Xuande! I had Zhang Jiao surrounded. But the court's envoy demanded a bribe, and I refused him. Now I go to the capital in chains, and Dong Zhuo takes my army."],
    ["say", "zhangfei", "I'll cut down these guards and set him free!"],
    ["say", "liubei", "The court will judge him fairly. Don't be rash, Yide!"],
    ["wait", 1200],
    ["move", "lz", "n5", 70, -10], ["remove", "lz"],
    ["n", "The cart rolls away toward Luoyang. Again the road divides."],
]},

"office": {"title": "“What Office Do You Hold?”", "kind": "peak", "setting": "outdoor", "steps": [
    ["n", "Heading home, the brothers hear a roar behind the hills: Han troops in rout, and banners reading GENERAL OF HEAVEN."],
    ["say", "liubei", "That is Zhang Jiao! Charge!"],
    ["fx", "dust", "n6", 20, -10],
    ["n", "The three ride into his flank and drive him back fifty li. They escort the defeated commander, Dong Zhuo, safely to his camp."],
    ["spawn", "dz", "dongzhuo", "n6", 18, -6],
    ["say", "dongzhuo", "And what office do you hold?"],
    ["say", "liubei", "None, my lord. We are commoners."],
    ["n", "Dong Zhuo turns his back without a word of thanks."],
    ["remove", "dz"],
    ["wait", 1000],
    ["say", "zhangfei", "We bled to save that wretch and he treats us like dirt! I'll kill him!"],
    ["say", "liubei", "He is an officer of the court! You cannot."],
    ["say", "guanyu", "A court officer. You cannot kill him on your own."],
    ["say", "zhangfei", "If I don't kill him I'll have to take his orders, and I won't. Stay here if you like. I'm going elsewhere."],
    ["say", "liubei", "We three are bound in life and death. How could we part? We will all go elsewhere."],
    ["say", "zhangfei", "That eases my anger a little."],
    ["wait", 1000],
    ["n", "That night they leave to join the general Zhu Jun instead."],
]},

"blackwind": {"title": "Black Wind, Paper Soldiers", "kind": "main", "setting": "outdoor", "steps": [
    ["n", "Zhu Jun's army faces Zhang Bao, the General of Earth. Zhang Fei spears his officer Gao Sheng from the saddle, and then Zhang Bao lets down his hair, raises his sword, and chants."],
    ["fx", "blackwind", "n7", 14, -12],
    ["n", "Wind howls and thunder rolls. Out of a black cloud pours a numberless host of horsemen. Liu Bei's army breaks and flees."],
    ["spawn", "oldmanN", "oldman_n", "n7", -30, 10],
    ["spawn", "oldmanS", "oldman_s", "n7", -24, 14],
    ["n", "At a roadside shrine the old men sit over their board, as if nothing is happening."],   # [new]
    ["say", "oldman_s", "Pigs, sheep, dogs. Blood."],   # [new]
    ["n", "(A Go problem opens.)"],
    ["remove", "oldmanN"], ["remove", "oldmanS"],
    ["say", "zhujun", "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them. The spell will break."],
    ["n", "Guan Yu and Zhang Fei each take a thousand men up the ridge behind the hill, with buckets of blood and filth."],
]},

"bosswin": {"title": "The General of Earth Falls", "kind": "main", "setting": "outdoor", "steps": [
    ["n", "Again Zhang Bao calls the wind; again Liu Bei flees, and the rebels chase him to the hill. A signal gun, and blood and filth rain down from the ridge."],
    ["fx", "paper", "boss", 0, 10],
    ["n", "Paper men and straw horses flutter to the ground. The wind dies. Liu Bei's arrow strikes Zhang Bao in the arm, and he flees into Yangcheng."],
    ["spawn", "zb", "zhangbao", "boss", 0, 20],
    ["spawn", "yz", "yanzheng", "boss", 24, 20],
    ["n", "Zhu Jun's army surrounds Yangcheng. Zhang Bao holds the walls and will not come out. His own officer, Yan Zheng, is behind him."],
    ["wait", 800],
    ["move", "yz", "boss", 6, 20],
    ["pose", "yz", "strike"], ["fx", "flash", "boss", 0, 20], ["pose", "zb", "fall"],
    ["n", "Yan Zheng stabs him and carries his head out to surrender."],
    ["remove", "zb"], ["remove", "yz"],
]},
```

## Closing sequence: the inspector

```python
"closing": [
    ["scroll", "The Yellow Turbans Fall", [
        "By the time Huangfu Song took over, Zhang Jiao was already dead. Huangfu Song beat Zhang Liang in seven battles and broke open the Great Teacher's coffin. The rebellion was over.",
        "At Wancheng, Liu Bei gave Zhu Jun some advice: “Surround them completely and every man fights to the death. Leave them one way out, and they will run.” It worked. There too, a young officer named Sun Jian was first over the wall, a name to remember.",
        "But the eunuchs gave rewards only to those who paid. For all his battles, Liu Bei was made a mere county sheriff, at Anxi.",
    ]],
    # setting: outdoor (county office, road) → indoor (hostel hall) → outdoor (lodge gate and hitching post)
    ["n", "At Anxi, Liu Bei governs for a month and wrongs no one. The three eat at one table and sleep in one bed. When Liu Bei sits among crowds, Guan Yu and Zhang Fei stand at his side all day without tiring."],
    ["wait", 1000],
    ["n", "Less than four months after he took office, an edict orders officers with military merit to be culled. Liu Bei fears he is among them. An inspector arrives."],
    ["spawn", "ins", "inspector", "boss", -30, 40],
    ["n", "Liu Bei goes out of the city to greet him. The inspector stays on his horse and answers with a small flick of his whip. Guan Yu and Zhang Fei are furious."],
    ["n", "At the hostel the inspector sits facing south; Liu Bei stands below the steps."],   # indoor: the hostel hall
    ["say", "inspector", "What is your origin, Sheriff Liu?"],
    ["say", "liubei", "I descend from Prince Jing of Zhongshan. I fought the Yellow Turbans from Zhuo County in over thirty battles."],
    ["say", "inspector", "You claim imperial blood and invent your merits! The court is purging frauds like you."],
    ["wait", 1000],
    ["n", "Liu Bei goes home and consults his clerks. They tell him the inspector only wants a bribe. \u201cI have wronged the people of this county in nothing. Where would I find money?\u201d The inspector arrests the county clerks, and Liu Bei is turned away at the gate each time he comes to plead."],
    ["n", "Zhang Fei, a few cups of gloomy wine in, rides past the hostel and finds fifty or sixty old villagers weeping at the gate."],
    ["spawn", "v1", "villager", "boss", -40, 50], ["spawn", "v2", "villager", "boss", -34, 54], ["spawn", "v3", "villager", "boss", -28, 50],   # [new] crowd, no lines
    ["wait", 1200],
    ["n", "They say the inspector is pressing the clerks to ruin Liu Bei, and the gatekeepers have beaten them back."],
    ["move", "zhangfei", "boss", -20, 40],
    ["say", "zhangfei", "Plunderer of the people! Do you know who I am?"],
    ["n", "He drags the inspector out by the hair, to the hitching post before the county office, and ties him."],
    ["fx", "whip", "boss", -30, 34], ["fx", "whip", "boss", -30, 34], ["fx", "whip", "boss", -30, 34],
    ["n", "Zhang Fei breaks ten or more willow switches on his legs."],
    ["say", "inspector", "Lord Xuande! Save my life!"],
    ["n", "Liu Bei, who is a gentle man at heart, orders Zhang Fei to stop."],
    ["say", "guanyu", "Brother, you won great merit and have only a sheriff's post, and now an inspector insults you. A phoenix does not roost among thorns. Let us kill him, give up the office, and make our plans elsewhere."],
    ["wait", 1200],
    ["say", "liubei", "For what you have done to the people you deserve to die. I spare your life. I return my seal of office, and I am gone."],
    ["n", "He hangs the seal around the inspector's neck."],
    ["remove", "ins"], ["remove", "v1"], ["remove", "v2"], ["remove", "v3"],
    ["scroll", "Chapter 2", [
        "Emperor Ling died. In the capital, his brother-in-law, General He Jin, resolved to destroy the eunuchs at last, and sent for the warlords of the provinces to march on Luoyang and force the Empress's hand.",
        "“A mistake,” warned his secretary Chen Lin. “You hand the spear to others, point first.”",
        "A man beside them clapped and laughed. “This is as easy as turning over a hand. Why so much talk?” It was Cao Cao.",
        "What did Cao Cao propose? Hear the next chapter.",
    ]],
]
```

## Side stories

Unchanged from `tools/tk_story.py` for now. Settings, from the text:

| Scene | Setting |
|---|---|
| peace1 (the cave) | indoor |
| peace2 | outdoor |
| peace3 (the court intrigue) | indoor |
| caocao1 (the family home) | outdoor (yard) |
| caocao2 (Xu Shao's house, then the city gates) | indoor → outdoor |
| caocao3 | outdoor |
| horses | outdoor |
| bribe (Lu Zhi's tent) | indoor |

## Source check

Compared against ch. 1–2 of the Chinese text. Matches and corrections:

- **Matches:** Liu Bei's age and description; Zhang Fei meeting him at the notice (Zhang sells wine and slaughters pigs); Guan Yu at the inn; the oath wording, the ox and horse, and the 300 braves; Zhang Shiping and Su Shuang's horses, silver and iron; Daxing, Cheng Yuanzhi's 50,000 against 500, the deaths of Deng Mao and Cheng Yuanzhi; the Qingzhou retreat of 30 li, Guan Yu left, Zhang Fei right, gongs as signal; Lu Zhi's cage cart and Zhang Fei's wish to cut down the guards; Dong Zhuo's "commoner" exchange; Zhu Jun's pig, sheep and dog blood; Liu Bei's arrow in Zhang Bao's arm; Yan Zheng.
- **Corrected in this draft:**
  - Yan Zheng stabs Zhang Bao and brings his head to surrender; he does not "open the gates".
  - The Dong Zhuo quarrel: Guan Yu also restrains Zhang Fei, and Zhang Fei answers Liu Bei with "that eases my anger".
  - Zhang Jiao was already dead when Huangfu Song took over, so the scroll no longer says he "died of illness at Guangzong".
  - Cut Guan Yu's "Then let him chase us up the hill", which isn't in the novel (it was in the existing `tk_story.py`).
  - Cut "most of them farmers" from the five hundred.
- **Added from the novel:** the Anxi interlude (three at one table, Guan Yu and Zhang Fei standing attendance), Liu Bei standing below the steps while the inspector sits, the inspector's whip-flick, Zhang Fei dragging him to the hitching post, and the willow switches.
- **Added:** the mulberry-tree opening (tree, fortune-teller, the child's "I will be the Son of Heaven", Uncle Liu Yuanqi's reply, the mother, and his study under Zheng Xuan and Lu Zhi). Every line in it is from ch. 1, so there is no `[new]` dialogue. Naming Lu Zhi here sets up the cage-cart scene as his old teacher.
- **Existing `tk_story.py` details to check:** "half a million" for the Yellow Turbans; the novel says 400–500 thousand (四五十萬).

## To do before this goes in

- Add `oldman_n`, `oldman_s`, `yanzheng` and `villager` to the cast, and write the Chinese for every changed line in `tools/tk_story_zh.py`.
- Decide how `"setting"` and `kind: "peak"` are read by `build_tk.py` and `tk-world.js`, and whether interiors are drawn or staged at the door.
- Regenerate voice clips with `tools/build_tk_voice.py` after porting.
- Check each **[new]** line, and the rest, against the novel.
