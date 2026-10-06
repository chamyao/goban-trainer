# Book 2 rewrite: what the draft needs

Kept by Plot, updated with each batch of `tools/tk_story_w2_new.py`. Plot writes the
dialogue (English and Chinese) and marks where each go problem is posed; the problems
themselves, the voices, the art and the engine are other sessions' work.

## Where go problems are posed (the whole chain, A1–A18)

| Beat | When the board comes | Decider | How many |
|---|---|---|---|
| A2 Peony pavilion | after "If this ever leaks, my whole family will be wiped out." | Wang Yun | 1 |
| A3 Gold crown | before the scene (legwork: slipping it to Lü Bu's door) | Wang Yun | 1 |
| A4 First banquet | as Diaochan pours Lü Bu's wine | Diaochan | 1 |
| A5 Second banquet | during the dance behind the curtain | Diaochan | 1 |
| A6 Red lanterns | before the lie, with Lü Bu's hand on his collar | Wang Yun | 1 |
| A7 The window | when she sees his reflection in the pond | Diaochan | 1 |
| A8 The sickbed | before her signal behind the bed | Diaochan | 1 |
| A9 Phoenix Pavilion | before her story; when he says he must go; before the taunt | Diaochan | **3** |
| A10 Sword on the wall | before the lie; before the sword; before turning it on Li Ru | Diaochan | **3** |
| A11 The ridge | before the provocation; before "you are a Lü"; before "loyal minister or traitor" | Wang Yun | **3** |
| A12a / A12b | before the scene (legwork: sounding out each minister) | Wang Yun | 1 each |
| A12y Cai Yong (**not in the novel**) | before the talk: a game with Cai Yong (setter `caiyong`) | Wang Yun | 1 |
| A12c Secret edict | before the scene (legwork: reaching the Emperor unseen) | Wang Yun | 1 |
| A12 Broken arrow | before Li Su's answer | Li Su | 1 |
| A13 Meiwu | before Li Su's lie about the abdication | Li Su | 1 |
| A13a Broken wheel | after "What does it mean?" | Li Su | 1 |
| A13b Wind and fog | after "What sign is this?" | Li Su | 1 |
| A13c Children's song | after "What does this children's song foretell?" | Li Su | 1 |
| A14 North Side Gate (**boss**, Dong Zhuo) | before he sees the swords; before "Where are the soldiers?"; before "Where is my son Fengxian?" | Wang Yun | **3** |
| A16 No pardon | before Jia Xu's advice | Jia Xu | 1 |
| A16a / A16b / A16c | before each village scene (legwork: the rumour) | Jia Xu | 1 each |
| A17 Ren Valley | as Lü Bu charges the valley mouth | Li Jue | 1 |
| A1, A7c (sight puzzle), A12p, A13d, A15, A15m, A15c, A16m, A18p, A18 | no board | | |

Difficulty within a three-problem scene should rise, the third hardest.

## Road challengers (map, not story: built by Places)

14 in the Diaochan arc: 6 blocking (you can't reach the next beat without passing them), 8 optional.
Each is one problem, flawless, with the 30-second wait after a wrong move.

| Walk | Protagonist | Total | Blocking | Who |
|---|---|---|---|---|
| Crown errand (before A3) | Wang Yun | 2 | 1 | a Chancellor's runner past the Chancellor's gate (blocking); a Flying Bear soldier at a corner |
| Conspirators' errands (before A12a/A12b) | Wang Yun | 2 | 1 | a Flying Bear patrol in Huang Wan's lane (blocking); an informer by Shisun Rui's gate |
| Chang'an optionals | Wang Yun | 2 | 0 | the old scholar at the market go table; the Liangzhou officer in the night lane |
| Li Su's ride out (before A13) | Li Su | 3 | 2 | a road patrol (blocking); the Meiwu gate guard checking the edict (blocking); the post-pavilion keeper |
| Procession back (A13a–c) | Li Su | 0 | 0 | the omen stops are the problems |
| Meiwu raid (A15 walk) | Lü Bu (pending) | 2 | 1 | a straggler at the treasure house door (blocking); a Flying Bear officer in a side court |
| Liangzhou (A16a–c) | Jia Xu | 2 | 1 | the v3 constable (blocking); a headman between v1 and v2 |
| Ren Valley approach (before A17) | Li Jue | 1 | 0 | a scout's hill post |

Cai Yong is not a road challenger: on the user's call he is a main beat (A12y).

## Items
| Key | Name | Chinese | How it is gained |
|---|---|---|---|
| `pearls` | Family pearls | 家藏明珠 | Wang Yun's chest in his rear hall (Places) |
| `crown` | Gold crown set with pearls | 嵌珠金冠 | the jeweller, once the pearls are brought (Places: `gives_when: item:pearls`) |
| `edict` | The Emperor's secret edict | 天子密诏 | A12c (`gain`), then given to Lü Bu in A12 |

## Props
| Kind | Exists today? | Used in |
|---|---|---|
| `table`, `winejars`, `cart` | yes | A1, A4, A5, A10 |
| `curtain` (a bead curtain across a room) | **no** (the only new prop; `halberd` and `mirror` already exist) | A5 |
| covered carriage (the `cart` with a canopy and curtains, someone boarded) | `cart` only | A5, A10 |

## Poses (new)
| Pose | Used in |
|---|---|
| `dance` | A5 |
| `leap` (jumping down from a gate tower) | A18 |
| `throat` (a sword held to one's own neck) | A10 |
| `cutarm` (cutting one's own arm for a blood oath) | A11 |

## Cast
Already drawn (TK_CHARS): 王允 wangyun, 貂蝉 diaochan, 吕布 lvbu, 李儒 liru, 李肃 lisu, 董卓之母 dongmu, 蔡邕 caiyong,
李傕 lijue, 郭汜 guosi, 汉献帝 xiandi, and Book 1's 董卓 dongzhuo and 皇甫嵩 huangfusong.

**New looks needed (8):** 贾诩 jiaxu (priority: leads the villains' turn); 士孙瑞 shisunrui, 黄琬 huangwan, 马日磾 mamidi,
the Taoist daoren (on screen, with lines); 张温 zhangwen (no lines), 牛辅 niufu and 胡赤儿 huchier (narrated only), for whom a folk stand-in is fine.
Voices for all are in `CAST2`.

## Stills written so far (briefs in `assets/tk/stills/scene_prompts.json`)
`dz_roadside`, `dz_redtray`, `dc_garden`, `dc_wangkneels`, `dc_wine`, `dc_dance`, `dc_lanterns`, `dc_window`,
`dc_sickbed`, `dc_pavilion`, `dc_halberd`, `dc_sword`, `dc_carriage`, `lb_ridge`, `lb_blood`, `ls_arrow`,
`dz_mother`, `omen_wheel`, `omen_fog`, `omen_song`, `omen_taoist`, `dz_gate`, `dz_lamp`, `dc_meiwu`, `cy_weeps`,
`ren_valley`, `wy_tower`, `cy_study`. (28 in all.)

## Engine requests
1. **The player walks as the current protagonist.** `["party", ["diaochan"]]` makes Diaochan the one the player
   walks as, not Liu Bei. The most important request. *(Live.)*
1b. **A handoff says where the new protagonist begins** (found in the playtest: Diaochan appeared where Wang Yun
   stood). Proposed `["party", ["diaochan"], {"to": "a7"}]`, with a short fade. Every handoff in the arc needs it.
2. **Several `["problem"]` steps in one scene**, with dialogue between them; failing a later one resumes at that one.
3. Challengers who spot the player and walk over; challengers who block a path.
4. Stealth: guards with sight lines; being seen sends you back to the door (Dong Zhuo's residence, the crown delivery).
5. A procession ride along a route (the Meiwu road).
6. The poses and props above.
