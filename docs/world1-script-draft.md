# World 1 · The Peach Garden Oath: emotional script draft

Draft revision of World 1 (ch. 1–2) for the emotion-first plan. Spine: **strangers become brothers**, and the first test of the oath.

Scenes use the step format from `tools/tk_story.py`. This is a draft: nothing here is wired into `tk_story.py`, `tk_story_zh.py` or the voice build yet. Lines marked **[new]** are invented for the game and not from the novel; everything else follows ch. 1–2. Chinese lines and character casting come after the English is approved.

New cast needed: `oldman_n` (Northern Dipper, in dark robes, counts on his fingers), `oldman_s` (Southern Dipper, in red, laughs easily). Both stay unnamed in World 1.

## Changes against the current World 1

| Current | Draft |
|---|---|
| Daxing Mountain is a full fight scene | Shortened to a short crash of steel, with the weight on Liu Bei facing 50,000 with 500 |
| Qingzhou is a tactics scene | The Star Lords' first counsel is where the ambush comes from; Liu Bei feigns the retreat |
| "What office do you hold?" is a short quarrel | Extended into the first test of the oath: Zhang Fei's anger, Liu Bei's refusal to break with him |
| Black Wind and boss are sorcery and a fight | The sorcery is a fear scene; Liu Bei's arrow is the only blow; Zhang Bao dies off-screen at Yan Zheng's hand |
| The inspector scene is a quick flogging | Rebuilt around the fifty weeping villagers; Liu Bei's seal-throwing is the chapter's quiet climax |
| No Star Lords in World 1 | Three appearances: tree, teahouse, shrine |

## Main scenes

```python
"notice": {"title": "The Notice at Zhuo", "kind": "main", "steps": [
    ["n", "Zhuo County. A crowd gathers at a notice on the wall: the Han is raising troops against the Yellow Turbans."],
    ["n", "Liu Bei, twenty-eight, descends from Prince Jing of Zhongshan, yet he sells sandals and weaves mats. His ears reach his shoulders; his arms hang past his knees."],
    ["n", "He reads the notice, and sighs."],
    ["spawn", "zf", "zhangfei", "n1", 30, 4],
    ["move", "zf", "n1", 12, 2],
    ["say", "zhangfei", "A real man should serve his country! What are you sighing for?"],
    ["say", "liubei", "I am of the Han imperial house. I long to crush these rebels and bring peace, and I have nothing to do it with but my two hands."],   # [new] last clause
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

"oath": {"title": "The Peach Garden Oath", "kind": "peak", "steps": [
    ["say", "zhangfei", "Behind my farm is a peach garden in full bloom. Tomorrow, let's swear brotherhood there before Heaven and Earth!"],
    ["fx", "petals", "n2", 0, -20],
    ["n", "Three men who met a day ago stand under the peach trees. A black ox and a white horse for sacrifice; incense; the wind moving the petals."],
    ["fx", "incense", "n2", -14, -4],
    ["say", "liubei", "Though we were not born on the same day of the same month of the same year..."],
    ["say", "guanyu", "...we wish to die on the same day of the same month of the same year."],
    ["say", "zhangfei", "Heaven and Earth, witness it! If we betray this oath, may Heaven and men strike us down!"],
    ["wait", 1200],
    ["n", "Liu Bei is eldest, Guan Yu second, Zhang Fei youngest. Three hundred village braves join them, and they drink in the garden until the petals cover the wine."],
    ["n", "Nobody says it, but each of them knows what has just been promised."],   # [new]
    ["n", "Their road forks here. The long road passes through the rebels' heartland; the mountain trail is shorter, and steeper."],
]},

"daxing": {"title": "Five Hundred Against Fifty Thousand", "kind": "main", "steps": [
    ["n", "The Yellow Turban general Cheng Yuanzhi marches on Zhuo with fifty thousand men. Liu Bei has five hundred, most of them farmers."],
    ["spawn", "oldmanN", "oldman_n", "n3", -40, 6],
    ["spawn", "oldmanS", "oldman_s", "n3", -34, 10],
    ["n", "Under an old tree beside the road, two white-haired men sit over a Go board. They do not look up."],
    ["say", "oldman_s", "Young man, you look like you could use some luck."],   # [new]
    ["say", "oldman_n", "Luck is not the same as skill. Solve this, and we will see which you have."],   # [new]
    ["n", "(A Go problem opens.)"],
    ["say", "oldman_s", "Not bad. Go on, and don't lose your nerve when you see their banners."],   # [new]
    ["remove", "oldmanN"], ["remove", "oldmanS"],
    ["spawn", "r1", "rebel", "n3", 34, -8], ["spawn", "r2", "rebel", "n3", 40, 6],
    ["say", "liubei", "Traitors to the realm! Why not surrender now?"],
    ["say", "chengyuanzhi", "Deng Mao, bring me his head!"],
    ["fx", "flash", "n3", 14, -4], ["pose", "r1", "fall"],
    ["fx", "flash", "n3", 14, 4], ["pose", "r2", "fall"],
    ["n", "Zhang Fei's spear takes Deng Mao; Guan Yu's blade takes Cheng Yuanzhi. The rebels throw down their spears."],
    ["remove", "r1"], ["remove", "r2"],
    ["n", "Liu Bei does not cheer. He looks at his five hundred. All of them are alive."],   # [new]
]},

"qingzhou": {"title": "The Ambush at Qingzhou", "kind": "main", "steps": [
    ["n", "Rebels besiege Qingzhou. The relief force is outnumbered and falls back thirty li. In a teahouse corner, the two old men are playing Go again."],
    ["spawn", "oldmanN", "oldman_n", "n4", -30, 8],
    ["spawn", "oldmanS", "oldman_s", "n4", -24, 12],
    ["say", "oldman_n", "The man who cannot afford to lose should not stand where he is strongest."],   # [new]
    ["say", "oldman_s", "He should stand where they expect him to be weak."],   # [new]
    ["n", "(A Go problem opens.)"],
    ["say", "liubei", "They are many and we are few. Only surprise will win this. Yunchang, hide your men left of the ridge. Yide, to the right. When the gongs sound, strike."],
    ["n", "Liu Bei attacks at dawn, then turns and flees. The rebels chase him over the ridge."],
    ["fx", "dust", "n4", -20, 0],
    ["n", "Gongs crash. Guan Yu and Zhang Fei burst from both flanks as Liu Bei wheels around. The siege of Qingzhou is lifted."],
]},

"cart": {"title": "The Cage Cart", "kind": "peak", "steps": [
    ["n", "Liu Bei sets out to help his old teacher Lu Zhi, who has Zhang Jiao trapped at Guangzong. On the road they meet soldiers guarding a prison cart."],
    ["spawn", "lz", "luzhi", "n5", 22, -6],
    ["say", "luzhi", "Xuande! I had Zhang Jiao surrounded. But the court's envoy demanded a bribe, and I refused. Now I go to the capital in chains, and Dong Zhuo takes my army."],
    ["say", "zhangfei", "I'll cut down these guards and set him free!"],
    ["say", "liubei", "The court will judge him fairly. Don't be rash, Yide!"],
    ["say", "luzhi", "Do not fight for me, Xuande. Do not give them the reason."],   # [new]
    ["n", "Liu Bei bows to his teacher, and says nothing more. The cart rolls away toward Luoyang."],
    ["move", "lz", "n5", 70, -10], ["remove", "lz"],
    ["n", "It is the first time Liu Bei has watched a good man lose, and learned what it costs to obey."],   # [new]
    ["n", "Again the road divides."],
]},

"office": {"title": "“What Office Do You Hold?”", "kind": "peak", "steps": [
    ["n", "Heading home, the brothers hear a roar behind the hills: Han troops in rout, and banners reading GENERAL OF HEAVEN."],
    ["say", "liubei", "That is Zhang Jiao! Charge!"],
    ["fx", "dust", "n6", 20, -10],
    ["n", "The three ride into his flank and drive him back fifty li, and escort the defeated commander, Dong Zhuo, to his camp."],
    ["spawn", "dz", "dongzhuo", "n6", 18, -6],
    ["say", "dongzhuo", "And what office do you hold?"],
    ["say", "liubei", "None, my lord. We are commoners."],
    ["n", "Dong Zhuo turns his back without a word of thanks."],
    ["remove", "dz"],
    ["wait", 800],
    ["say", "zhangfei", "We bled to save that wretch and he treats us like dirt! I'll kill him!"],
    ["say", "liubei", "He is an officer of the court! You cannot."],
    ["say", "zhangfei", "Then I won't serve under him. Stay if you like. I'm leaving."],
    ["say", "liubei", "We swore to live and die together. If you go, we all go."],
    ["n", "Zhang Fei looks at his brother for a long time. Then he laughs once, short and rough, and picks up his spear."],   # [new]
    ["say", "zhangfei", "Fine. But when this world finally needs us, I'm saying I told you so."],   # [new]
    ["n", "That night they leave to join the general Zhu Jun instead."],
]},

"blackwind": {"title": "Black Wind, Paper Soldiers", "kind": "main", "steps": [
    ["n", "Zhu Jun's army faces Zhang Bao, the General of Earth. Zhang Fei spears his officer Gao Sheng from the saddle, and then Zhang Bao lets down his hair, raises his sword, and chants."],
    ["fx", "blackwind", "n7", 14, -12],
    ["n", "Wind howls. Out of a black cloud pours a numberless host of horsemen. Liu Bei's army breaks and flees, and for the first time the brothers run."],
    ["spawn", "oldmanN", "oldman_n", "n7", -30, 10],
    ["spawn", "oldmanS", "oldman_s", "n7", -24, 14],
    ["n", "At a roadside shrine, the old men have set up the board again, as if nothing is happening."],
    ["say", "oldman_s", "Spirits that come from paper do not like what pigs and dogs leave behind."],   # [new]
    ["say", "oldman_n", "Do not tell him that. Make him earn it."],   # [new]
    ["n", "(A Go problem opens.)"],
    ["say", "zhujun", "Sorcery. Tomorrow, hide men on the hilltop with the blood of pigs, sheep and dogs. When his spirits come, drench them."],
]},

"bosswin": {"title": "The General of Earth Falls", "kind": "main", "steps": [
    ["n", "Again Zhang Bao calls the wind; again Liu Bei flees, and the rebels chase him to the hill. A signal gun, and blood and filth rain down from the ridge."],
    ["fx", "paper", "boss", 0, 10],
    ["n", "Paper men and straw horses flutter to the ground. The wind dies. Liu Bei's arrow strikes Zhang Bao in the arm, and he flees into Yangcheng."],
    ["n", "Besieged, with no way out, Zhang Bao is killed by his own officer, Yan Zheng, who opens the gates."],
    ["n", "Liu Bei stands at the gate. A war has ended, and the sky is quiet."],   # [new]
]},
```

## Closing sequence: the inspector

```python
"closing": [
    ["scroll", "The Yellow Turbans Fall", [
        "Zhang Jiao died of illness at Guangzong. Huangfu Song beat Zhang Liang in seven battles and broke open the Great Teacher's coffin. The rebellion was over.",
        "At Wancheng, Liu Bei gave Zhu Jun some advice: “Surround them completely and every man fights to the death. Leave them one way out, and they will run.” It worked.",
        "But the eunuchs gave rewards only to those who paid. For all his battles, Liu Bei was made a mere county sheriff, at Anxi.",
    ]],
    ["n", "Four months later an inspector arrived at Anxi, sitting high on his horse and demanding a bribe."],
    ["spawn", "ins", "inspector", "boss", -30, 40],
    ["say", "inspector", "You claim imperial blood and invent your merits! The court is purging frauds like you."],
    ["n", "Zhang Fei, a few cups in, rode past the inspector's lodge and found fifty old villagers weeping at the gate."],
    ["wait", 800],
    ["say", "villager", "He says the sheriff is to be dismissed. Liu Bei has done nothing but good here. Please, great lord, please..."],   # [new]
    ["move", "zhangfei", "boss", -20, 40],
    ["say", "zhangfei", "Tormentor of the people! Do you know who I am?"],
    ["fx", "whip", "boss", -30, 34], ["fx", "whip", "boss", -30, 34], ["fx", "whip", "boss", -30, 34],
    ["say", "inspector", "Lord Xuande! Save my life!"],
    ["say", "guanyu", "Brother, a phoenix does not roost among thorns. Let us kill him and go."],
    ["wait", 1000],
    ["say", "liubei", "By your crimes you deserve to die. I spare you. Here is my seal of office. I am done with it."],
    ["n", "He hangs the seal around the inspector's neck, and the villagers do not know whether to cheer or weep."],   # [new]
    ["remove", "ins"],
    ["scroll", "Chapter 2", [
        "Emperor Ling died. In the capital, his brother-in-law, General He Jin, resolved to destroy the eunuchs at last, and sent for the warlords of the provinces to march on Luoyang.",
        "“A mistake,” warned his secretary Chen Lin. “You hand the spear to others, point first.”",
        "A man beside them clapped and laughed. “This is as easy as turning over a hand. Why so much talk?” It was Cao Cao.",
        "What did Cao Cao propose? Hear the next chapter.",
    ]],
]
```

## Unchanged

The side-story sets (**Way of Great Peace** I–III, **Hero of Chaos** I–III, **Horses from the North**, **A Bribe Refused**) stay as written in `tools/tk_story.py` for now. They are lore, not emotional beats, and a later pass can decide whether to trim them.

## To do before this goes in

- Cast `oldman_n`, `oldman_s` and `villager` in `tools/tk_story_zh.py`; write the Chinese for every new line.
- Decide whether `kind: "peak"` needs support in `build_tk.py` and `tk-world.js` (longer, non-skippable on first viewing).
- Regenerate voice clips with `tools/build_tk_voice.py` after the story is ported.
- Check each **[new]** line against the book; the others are close to the novel's wording.
