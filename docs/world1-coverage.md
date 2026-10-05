# World 1: how much of chapters 1-2 is in the game

I read the Chinese text of chapters 1 and 2 (the Gutenberg edition, #23950) and listed 59 events. For each, I checked `tools/tk_story.py` (24 scenes) on this branch. This is my own count of events, not a standard measure, and it depends on how I split them: someone else would get a different total.

**Shown** = a staged scene or side story with the event acted out. **Told** = only narration, a line or the scrolls. **Left out** = not in the game.

| | Events | Share |
|---|---|---|
| Shown | 36 | 61% |
| Told | 15 | 25% |
| Left out | 8 | 14% |

So roughly 61% of the events are played, another 25% are told, and 14% are not in the game. Of the 59, 10 shown events are side stories (optional on the map). All the main events of chapter 1 are shown: the notice, the three meeting, the oath, the horses, Daxing, Qingzhou, Lu Zhi, Black Wind. What is left out is almost all the court politics and the minor campaigns at the end of chapter 2 (the Ten Attendants, Liu Tao and Chen Dan, Sun Jian at Changsha, Liu Bei at Pingyuan, the succession struggle).

## Not in the novel

These are added by us, not events of chapters 1-2: the Star Lords at the board, the shrine, the mulberry-tree boy's problem and most problems' placement, the Black Wind blood-gathering errand (and its village people), and the stills' compositions. Individual lines are marked `[new]` where I invented them. The plan is to keep the novel's order and outcomes and never change who wins or dies.

## The events

| # | Ch | Event | Status | Where |
|---|---|---|---|---|
| 1 | 1 | The empire long divided must unite; long united, must divide | Told | opening scroll |
| 2 | 1 | Omens in Emperor Ling's court: the serpent, the hens, the black vapour | Told | opening scroll, abbreviated |
| 3 | 1 | Cai Yong's memorial; the Ten Attendants rise | Told | the Ten Attendants named in the scroll; Cai Yong left out |
| 4 | 1 | Zhang Jiao meets the old man in the cave and gets the three books | Shown | side: peace1 |
| 5 | 1 | Plague, charmed water, the Great and Virtuous Teacher | Shown | side: peace2 |
| 6 | 1 | Thirty-six divisions; "The Blue Heaven is dead"; jiazi on the doors | Shown | side: peace2 |
| 7 | 1 | Ma Yuanyi, Feng Xu, and Tang Zhou's betrayal | Shown | side: peace3 |
| 8 | 1 | Zhang Jiao rises, the three Zhang brothers, the court sends Lu Zhi, Huangfu Song, Zhu Jun | Told | scroll and Lu Zhi's briefing |
| 9 | 1 | Liu Yan and Zou Jing; the notice goes up | Shown | council |
| 10 | 1 | Liu Bei's lineage, the mulberry tree, the fortune-teller, the boyhood boast | Shown | tree |
| 11 | 1 | His uncle Liu Yuanqi; schooling under Zheng Xuan and Lu Zhi; Gongsun Zan | Told | narration in tree |
| 12 | 1 | The notice, Liu Bei's sigh, Zhang Fei | Shown | notice |
| 13 | 1 | Guan Yu at the inn | Shown | inn |
| 14 | 1 | The oath in the peach garden (ox, horse, the vow, who is eldest) | Shown | oath |
| 15 | 1 | The feast and the three hundred braves | Shown | oath |
| 16 | 1 | The merchants Zhang Shiping and Su Shuang: horses, silver, iron | Shown | horses |
| 17 | 1 | The weapons forged: twin swords, the Green Dragon blade, the serpent spear | Shown | horses |
| 18 | 1 | Meeting Zou Jing and Liu Yan; adopted as nephew | Shown | daxing |
| 19 | 1 | Daxing: Cheng Yuanzhi, Deng Mao | Shown | daxing |
| 20 | 1 | Gong Jing's letter; Qingzhou besieged | Shown | qingzhou |
| 21 | 1 | The retreat of thirty li; the flank ambush; the siege lifted | Shown | qingzhou |
| 22 | 1 | Liu Bei goes to his old teacher Lu Zhi at Guangzong | Shown | qingzhou, tent |
| 23 | 1 | Lu Zhi sends him to Yingchuan to learn how things stand | Shown | tent |
| 24 | 1 | The fire plan at Changshe | Shown | side: fireplan, caocao3 |
| 25 | 1 | Cao Cao's red banners bar the rebels' road | Shown | side: caocao3 |
| 26 | 1 | Cao Cao's boyhood trick on his uncle | Shown | side: caocao1 |
| 27 | 1 | Qiao Xuan and He Yong praise Cao Cao | Left out |  |
| 28 | 1 | Xu Shao's verdict: "a cunning villain in an age of chaos" | Shown | side: caocao2 |
| 29 | 1 | Cao Cao's five-coloured staves; Jian Shuo's uncle | Shown | side: staves |
| 30 | 1 | Huangfu Song and Zhu Jun send Liu Bei back to Guangzong | Told | narration in cart |
| 31 | 1 | Lu Zhi in the cage cart | Shown | cart |
| 32 | 1 | Zhang Fei wants to free him; Liu Bei stops him | Shown | cart |
| 33 | 1 | Zuo Feng's bribe and Lu Zhi's refusal | Shown | side: bribe |
| 34 | 1 | The rescue of Dong Zhuo from Zhang Jiao | Shown | office |
| 35 | 1 | Dong Zhuo's "What office do you hold?" and Zhang Fei's rage | Shown | office |
| 36 | 2 | The brothers leave Dong Zhuo to join Zhu Jun | Told | one line at the end of office |
| 37 | 2 | Gao Sheng killed; Zhang Bao's sorcery; the defeat | Shown | blackwind |
| 38 | 2 | Zhu Jun's plan: the blood of pigs, sheep and dogs | Shown | blackwind |
| 39 | 2 | The ridge ambush; the paper soldiers fall | Shown | bosswin |
| 40 | 2 | Liu Bei's arrow wounds Zhang Bao; he flees into Yangcheng | Shown | bosswin |
| 41 | 2 | Yan Zheng kills Zhang Bao | Shown | bosswin |
| 42 | 2 | News: Zhang Jiao dead, the coffin broken open, Huangfu Song rewarded | Told | closing scroll |
| 43 | 2 | Lu Zhi restored to office; Cao Cao posted to Jinan | Left out |  |
| 44 | 2 | Wancheng: Zhao Hong, Han Zhong, Sun Zhong | Told | one line in the closing scroll |
| 45 | 2 | Liu Bei's advice to leave the besieged a way out | Told | closing scroll |
| 46 | 2 | Sun Jian's introduction and first up the wall | Told | one line in the closing scroll |
| 47 | 2 | Zhang Jun's memorial and the Ten Attendants' refusal; Liu Bei made sheriff of Anxi | Told | scroll, Anxi only |
| 48 | 2 | Anxi: a month of good governing, the three at one table | Shown | hostel |
| 49 | 2 | The inspector, the bribe demanded, the clerks seized | Shown | hostel |
| 50 | 2 | Zhang Fei flogs the inspector; Liu Bei hangs up his seal | Shown | post |
| 51 | 2 | Refuge with Liu Hui at Daizhou | Left out |  |
| 52 | 2 | The Ten Attendants seize power; Huangfu Song and Zhu Jun dismissed; new rebellions | Left out |  |
| 53 | 2 | Liu Tao and Chen Dan remonstrate and die in prison | Left out |  |
| 54 | 2 | Sun Jian governs Changsha and defeats Qu Xing | Left out |  |
| 55 | 2 | Liu Bei under Liu Yu defeats Zhang Chun and Zhang Ju; pardoned; Pingyuan | Left out |  |
| 56 | 2 | Emperor Ling dies; He Jin, Empress He, the heir | Told | scroll |
| 57 | 2 | Cao Cao's and Yuan Shao's advice to He Jin | Told | scroll (Cao Cao only) |
| 58 | 2 | The succession struggle: Jian Shuo, Dowager Dong, Dong Zhong's death | Left out |  |
| 59 | 2 | He Jin summons the warlords; Chen Lin's warning; Cao Cao's laugh | Told | end of the chapter 2 scroll |
