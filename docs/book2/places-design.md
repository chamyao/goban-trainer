# Book 2 places: the Diaochan arc

This is the Places session's design for the four places of the Diaochan arc: **Chang'an, Meiwu, the Meiwu Road and Liangzhou**. It follows `diaochan-arc.md` and uses its Shared keys. The research behind it is in `map-research.md`.

It is written for the best game, not for what the map generator can say today. Every map stays generated: the layout sketches below are the relations a generated map must satisfy (what is south of what, what faces what, what sits in the pond), not drawings to copy. The stealth spaces come with play checks the generator must pass (a covered route exists, the curtain puzzle has a valid spot). See request 6 in `places-notes.md`. Wherever the design needs something new, the request is listed in `places-notes.md`. Once those are settled, the design will be turned into `PLACES[2]` data.

---

## The four places in one line

```
Liangzhou ── (the long road west) ── Meiwu ── Meiwu Road ── Chang'an
  A16–A17         (A16 march)         A13, A15   A13 omens     A1–A12, A14, A15, A18
```

- **Geography:** all four lie on one road. Meiwu is in Mei county, west of Chang'an, on the way to Liangzhou. The Heng Gate in Chang'an's north-west wall is where the novel sees Dong Zhuo off to Meiwu, so every journey west leaves by it.
- **One line:** the story walks the line out and back, never branching.
  - Chang'an.
  - Out to Meiwu as Li Su, and back as the procession.
  - Out to Meiwu again for the raid.
  - Further west to Liangzhou with the villains.
  - Back east with their army, past an emptied Meiwu, to the sack of Chang'an.
- **Payoff:** the player walks the same road four times, and each time it means something different.

## Design rules for this arc

These come from the research. They apply to every map below.

1. **One landmark you can always see.**
   - Chang'an: Weiyang Palace, raised on the Longshou plateau at the south end of the avenue.
   - Meiwu: its walls, as high as Chang'an's, rising as you come up the road.
   - The road: the procession's dust ahead of you.
   - Liangzhou: the mouth of Ren Valley, between two heights.
2. **One critical path per beat,** with townsfolk and optional challengers branching off it. Dead ends hold people and views, never something you must collect.
3. **Each place teaches one map idea in four steps, then drops it** (introduce, develop, twist, conclude):
   - **Chang'an: being seen.**
     1. Introduce: the crown delivery (A3), one watcher on a street.
     2. Develop: the curtain (A7), be seen by Lü Bu and not by Dong Zhuo.
     3. Twist: the Phoenix Pavilion (A9), reach Lü Bu unseen, and then the one man who mustn't see you does.
     4. Conclude: the North Side Gate (A14), where everything is done in the open, on the avenue everyone can see.
   - **The Meiwu Road: travelling.**
     1. Introduce: the empty road, ridden alone.
     2. Develop: the procession, walked along.
     3. Twist: the fog, where you lose the column.
     4. Conclude: the night fields, walking alone toward a children's song.
   - **Liangzhou: gathering.**
     1. Introduce: one village won.
     2. Develop: a crowd following you.
     3. Twist: the constable, the man Jia Xu warned could tie you up.
     4. Conclude: Ren Valley, where the crowd is an army on the heights.
4. **Chang'an is one map in six states.** The player learns its streets in the first beats; the celebration and the sack land because they know them.
5. **Stealth is gentle.**
   - Small rooms, one pattern each, under a minute each.
   - Sight is always drawn as a cone, and every room has a spot that is always safe.
   - Being seen walks you back to a named place, with a line that carries the menace. There is no game-over screen.
6. **Townsfolk follow the *Chinese Paladin* rulebook.**
   - About half their talk is everyday life under Dong Zhuo, and their lines change with each state.
   - The people who matter stand still at gates and crossroads, each with one habit you'd recognise.
   - Every line comes from the world of the novel.
7. **You walk as the current protagonist,** and the protagonist decides which doors open. Wang Yun cannot get into Dong Zhuo's residence, and only Diaochan can walk its inner rooms. The refusal is always a person in the story: a gatekeeper, a maid.

---

## 1. Chang'an (长安)

**What it is:** a compact walled capital, laid out like the real Han city: the palace raised in the south, the markets north, the Heng Gate in the north-west wall and the Xuanping Gate in the east wall. It is tight, because the novel is talk in rooms here: any two buildings are a few seconds' walk apart.

### Layout (north up)

```
            ~~~~~~~~~~~~ the Wei River (the north edge; the Heng Bridge) ~~~~~~~~~~~~
  to the Meiwu Road ◄── west road ──┬─────── FAREWELL GROUND (hengmen: A1) ──┐
                       RIDGE (A11) ▲│        tents, a long banquet table      │
  ═════════════════════════[ HENG GATE ]══════════ north wall ═══════════════╗
                                    │   THE MARKETS                         ║
                         JEWELLER ▪ │ ▪ wine shop    ▪ go table             ║
                                    │                                       ║
             ───────────────── MARKET CROSSROADS ───── east street ── [ XUANPING GATE ] (tower: A18)
                                    │  (market: A15)                        ║
     Shisun Rui ▪   Huang Wan ▪     │      ▪ LÜ BU'S QUARTERS (stable)       ║
     ┌─────────────────────┐        │  ┌───────────────────────────────┐    ║
     │ WANG YUN'S RESIDENCE│   THE  │  │ THE CHANCELLOR'S RESIDENCE     │    ║
     │      (wangyun)      │ AVENUE │  │ (xiangfu)  hitching post ▪     │    ║
     └─────────────────────┘ ║ ║ ║  │  └───────────────────────────────┘    ║
                         three lanes: the middle one is the emperor's  ║
  ══════════════ steps up to the Longshou plateau ══════════════════════════╣
                       [ NORTH SIDE GATE ] (north-gate: A14)                ║
                          WEIYANG PALACE (palace)        Changle roofs, east ║
```

- **The avenue is the spine.** It runs from the Heng Gate straight south to the North Side Gate of Weiyang Palace. Its middle lane is the emperor's and is always empty (a Liangzhou soldier tells you to keep to the side lanes). On the day of the gate, Dong Zhuo's carriage comes down that middle lane, and Wang Yun watches it come the whole length of the city.
- **The market crossroads is the hub.** The avenue meets the east street there, and the important townsfolk stand there. It's where Dong Zhuo's body lies in A15.
- **The officials' ward** sits between the crossroads and the palace steps.
  - Wang Yun's residence is west of the avenue.
  - The Chancellor's residence faces it from the east and is the biggest compound in the city, with the Chancellor's banners and halberd guards at the gate.
  - Lü Bu's quarters are a soldier's compound with a stable, next door to the Chancellor's residence. Red Hare is in the stable; the horse came back with Lü Bu from chapter 3.
  - Shisun Rui's and Huang Wan's houses are small, at the ward's west edge.
- **Outside the Heng Gate:**
  - The farewell ground (A1): open field, tents, a long table.
  - The earthen ridge (A11): beside the west road, looking down on it.
  - The west road (exit to the Meiwu Road).
- **The Xuanping Gate** is up the east street. Its tower is climbable, and the player only goes up in A18.
- **Exits:** one, the west road outside the Heng Gate. The Xuanping Gate stays shut until A18. That's a roadblock from the story: the city is Dong Zhuo's, and nobody leaves east.

### Buildings and rooms

**Wang Yun's residence (`wangyun`): a compound, walked court by court.**

```
   ┌───────────── rear garden (wy-garden) ──────────────┐
   │  荼蘼 trellis   PEONY PAVILION ▪    PAINTED PAVILION │ (wy-pavilion: a raised pavilion, steps up)
   │       rockery         moon-gate                    │
   ├──────────┬──────────── rear hall (wy-rearhall) ─────┤
   │ SECRET   │  banquet tables · the family chest ▪      │
   │ ROOM     │  (screen hides the secret room's door)    │
   │(wy-secret)├────────── side passage ─────────────────┤
   │          │  front hall (wy-hall): dais, curtain       │
   └──────────┴──── front court ── gate (old steward) ────┘
```

- **Front court and front hall (`wy-hall`):**
  - The steward stands at the gate.
  - In A5, Dong Zhuo's hundred halberdiers line the front court; the player walks the gauntlet to the hall.
  - The hall's curtain is where Diaochan dances.
- **Rear hall (`wy-rearhall`):**
  - The banquet for Lü Bu (A4).
  - The family chest, where Wang Yun takes the pearls (A3, step 1).
  - A painted screen hides the door to the secret room.
- **Secret room (`wy-secret`):**
  - Small, one lamp, no windows.
  - A11 (the blood oath) and A12 (the conspirators, then Li Su's broken arrow) happen here.
  - It fills up as the conspiracy grows: one chair, then three, then Lü Bu and Li Su.
- **Rear garden (`wy-garden`) and painted pavilion (`wy-pavilion`):**
  - The peony pavilion, the 荼蘼 trellis, a rockery and a moon gate.
  - Night only. The garden is drawn dark except the moonlit path, so A2's "walk out into the garden" leads the eye straight to the pavilion where Diaochan is sighing.

**The Chancellor's residence (`xiangfu`): Diaochan's dungeon, and the arc's stealth space.**

```
          ┌──────────────── rear garden (xf-garden) ─────────────────┐
 garden ▶ │  willows ≈≈   flower path   ROCKERY    PHOENIX PAVILION ▪ │
 gate (W) │  (A9's collision)  ≈≈≈ LOTUS POND ≈≈≈ zig-zag bridge      │
          ├──── covered gallery (lattice walls, maids' corridor) ─────┤
          │ BEDCHAMBER (xf-bedroom)  │  MIDDLE HALL (xf-hall)         │
          │ bed · window ▪ over a    │  dais · side CURTAIN ▪          │
          │ small pond court         │  SWORD ON THE WALL ▪ · halberds │
          ├──────────────────────────┴──── front court (guards) ──────┤
          └────────────────── GATE (gatekeeper) · hitching post ▪ ────┘
```

- **The gate.**
  - As Wang Yun, the gatekeeper turns you away: "The Grand Preceptor receives no one today."
  - As Diaochan, you are inside.
  - The hitching post outside is a prop that matters: in A9, Lü Bu's horse is tied there, and from the front court the player can see it through the gate. It's the clue that gives him away, shown before the novel uses it.
- **Bedchamber (`xf-bedroom`):**
  - A7: the window looks north onto a small court with a pond. Lü Bu's reflection appears in the pond; the still covers the moment itself.
  - A8: there's a gap behind the bed for the sickbed signal.
- **Middle hall (`xf-hall`):**
  - Dong Zhuo's dais, a side curtain into the inner rooms, a halberd rack, and the sword hanging on the wall (A10).
  - A7's curtain moment plays here (see Stealth).
- **Covered gallery:** a corridor of lattice walls between the inner rooms and the garden, where the maids pass. You can be seen through the lattice but cannot walk through it.
- **Rear garden (`xf-garden`):**
  - A flower path, willows, a rockery, the lotus pond with a zig-zag bridge, and the Phoenix Pavilion on a spit of land out in the pond.
  - The garden gate on the west side is where Dong Zhuo runs into Li Ru at the end of A9.
  - The novel brings Diaochan to the pavilion 「分花拂柳而来」 ("parting the flowers and brushing the willows"). That is literally the stealth route: the willows and flowers are the cover.

**The other buildings**

| Id | What it is | Used for |
|---|---|---|
| `lubu` | A soldier's compound: a stable with Red Hare, a yard with a weapon rack, and a side door | A3: deliver the crown through the side door. A6: Lü Bu brings Wang Yun "to his house" (the novel's 「到家」), and this is where the lie is told. |
| `jeweller` | A small shop with a workbench and lamps | A3: bring the pearls and get the gold crown (still `dc_crown`) |
| `shisun`, `huangwan` *(new ids)* | Two modest official houses | A12a, A12b: sounding out each minister (go problems) |
| `palace` | Weiyang Palace on the plateau. Only the North Side Gate court is walkable; the hall itself is a backdrop. | A12c: the secret edict, received at the gate court from a palace eunuch. A14: the boss. |
| `north-gate` | A gate in a wall, with a court inside it where the officials stand with swords | A14 |
| `market` | The crossroads, with stalls around it | A15: the body under a lamp (non-graphic: a dark mound, a small flame, and the crowd keeping its distance) |
| `xuanping` | A gate tower on the east wall, with stairs up | A18 |
| `hengmen` | The farewell ground outside the Heng Gate | A1 |
| `ridge` | An earthen ridge beside the west road | A11 |

### The six states of Chang'an

| State | Beats | Light | What's different |
|---|---|---|---|
| **1. Dong Zhuo's capital** | A1, A3–A5, A7–A10 (day) | day | Liangzhou soldiers at the crossroads and the Chancellor's gate. Officials walk fast with their eyes down. The emperor's lane is empty. |
| **2. Night** | A2, A6 | night, only the paths lit | A watchman and Liangzhou patrols with lanterns. In A6, **two rows of red lanterns** line the avenue where Diaochan's carriage passed, and Lü Bu waits mounted between them. |
| **3. Dong Zhuo away at Meiwu** | A11–A12 | day, then dusk | Fewer guards. The carriage dust is still on the west road. The ridge has Lü Bu on it. |
| **4. The day of the gate** | A14 | bright morning | Streets swept and emptied. Officials line the avenue near the North Side Gate. The procession enters at the Heng Gate and rolls down the emperor's lane. |
| **5. After** | A15 | day, then night for the lamp | Crowds at the crossroads. The novel: 「长安城中百姓，无论老幼，皆歌舞于道」 ("everyone in Chang'an, old and young, sang and danced in the streets"), and people sell their clothes to buy wine and meat. The body lies at the crossroads. |
| **6. The sack** | A18 | smoke-dark day | Gates forced, smoke over the north quarter, Liangzhou riders on the avenue, and townsfolk running east toward the Xuanping Gate. |

### The beats in Chang'an: where each spot is and how you reach it

| Key | Spot | Protagonist | How you get there |
|---|---|---|---|
| `a1` | `hengmen`: the long table | Wang Yun | Arrive outside the Heng Gate with the officials. The scene starts as you take your seat. |
| `a2` | `wy-garden`: the peony pavilion, then `wy-pavilion` | Wang Yun | Night. Walk out of the rear hall into the dark garden; only the path to the pavilion is lit. |
| `a3` | `wy-rearhall` chest → `jeweller` → `lubu` side door | Wang Yun | Legwork. The street between the jeweller and Lü Bu's quarters passes the Chancellor's gate, so it's the first stealth step (see below). |
| `a4` | `wy-rearhall` | Wang Yun → Diaochan | Lü Bu is seated. The handoff happens in the room: Diaochan enters from the inner door, and the camera takes her. |
| `a5` | `wy-hall` | Diaochan | The front court is lined with Dong Zhuo's halberdiers. The curtain is her stage. |
| `a6` | The avenue, between the red lanterns | Wang Yun | Night. Wang Yun rides home down the avenue. **Lü Bu spots him and comes over**, like a trainer who sees you (a story challenger). He drags Wang Yun to his house (`lubu`), where the contest plays. |
| `a7` | `xf-bedroom` window, then the `xf-hall` curtain | Diaochan | The morning. Maids in the gallery gossip. The curtain is a sight puzzle (see below). |
| `a8` | `xf-bedroom`, behind the bed | Diaochan | A month later. Dong Zhuo is in bed; Lü Bu comes in from the gallery. |
| `a9` | `xf-garden`: the Phoenix Pavilion | Diaochan | The full stealth route: gallery → garden → pavilion (see below). Lü Bu's horse is at the hitching post. |
| `a10` | `xf-hall`: the sword on the wall | Diaochan | Dong Zhuo calls her in. The carriage then leaves from the gate, and Lü Bu stands in the crowd outside. |
| `a11` | `ridge`, then `wy-secret` | Wang Yun | Walk out the Heng Gate. Lü Bu stands on the ridge watching the dust; come up behind him. |
| `a12a`, `a12b` | `shisun`, `huangwan` | Wang Yun | Legwork, in either order. Each minister comes back to the secret room once won (his chair fills). |
| `a12c` | `palace`: the North Side Gate court | Wang Yun | Legwork. A eunuch brings the secret edict to the gate. Gained: the secret edict. Deliver it to Lü Bu in the secret room. |
| `a12` | `wy-secret` | Wang Yun | Li Su is brought in. The broken arrow is the handoff to Li Su, who rides out of the Heng Gate. |
| `a14` | `north-gate` | Wang Yun | Stand with the officials. The procession comes down the avenue. Boss. |
| `a15` | `market` (the body, Cai Yong), then Meiwu | Wang Yun | Walk the celebrating city. Li Ru is brought in bound at the North Side Gate court. The victory feast and the report of Cai Yong happen at `wy-hall`. |
| `a18` | `xuanping` tower | Wang Yun | The sack. Through the burning streets to the east gate. **Outside the Qingsuo Gate** Lü Bu begs him to flee: that's a palace gate, so this moment plays at the palace steps on the way. Then climb the tower. |

### Being seen in Chang'an (the stealth steps)

1. **A3, the crown (introduce).**
   - Lü Bu's side door is just past the Chancellor's gate, and one gate guard walks a short L-shaped beat in front of it. His cone is drawn.
   - A water cart and a willow give cover; waiting behind the cart is always safe.
   - **Seen:** "Minister Wang? Out with a parcel? The Grand Preceptor likes to know what his ministers carry." He walks you back to the crossroads, and you try again.
   - The arc's go problem ("pass the crown in without being noticed") sits at the side door, with Lü Bu's doorman, once you're past the guard.
2. **A7, the curtain (develop, turned inside out).**
   - In the middle hall, Dong Zhuo eats on the dais and Lü Bu stands below. Both cones are drawn.
   - Diaochan has to stand behind the curtain **inside Lü Bu's cone and outside Dong Zhuo's**. There's one such place, and it moves when Dong Zhuo turns to his food.
   - Reaching it plays the novel's moment: 「露半面」 ("half her face shows").
   - **Stepping into Dong Zhuo's cone:** she lowers the curtain, and the try resets.
3. **A9, the garden (develop fully, then twist).**
   - **The gallery:** two maids walk U-shaped beats and stop to gossip at the middle (a readable pause). Lattice walls let their sight through.
   - **The garden:** the flower path, willows and rockery are cover. One steward walks an L-shaped beat by the pond.
   - **Seen:** "Mistress? You've lost your way. The Grand Preceptor likes to know where you are." She is walked back to the bedchamber.
   - **The twist:** after the contest at the pavilion, Dong Zhuo comes in through the front, and he is the one who sees. It's a scene, not a fail: the novel decides it.
4. **A14, the gate (conclude).** No hiding. The swords are out on the open avenue.

### Townsfolk in Chang'an

The people who matter stand still where you pass them. The rest wander. Lines are grouped by state.

**State 1, Dong Zhuo's capital (day)**
- *Liangzhou soldier, at the crossroads, a halberd across his shoulders (stands still):* "Keep to the side lanes. The middle of the avenue is the Son of Heaven's. And the Grand Preceptor's."
- *Labourer back from Meiwu, sitting on the crossroads steps, rubbing his shoulder:* "Two hundred and fifty thousand of us built it. Walls as high as these. Twenty years of grain inside, they say."
- *Market woman from Luoyang:* "They drove us west from Luoyang like geese. My house is ash, and here I sell turnips."
- *Old scholar at the market go table (optional challenger):* "Sit, Minister. In this city it's safer to talk about stones than people."
- *The official whose chopsticks fell, after A1, standing by the wine shop and not drinking:* "He laughed, and went on eating. I couldn't hold my chopsticks. I still can't, some days."
- *Child:* "Mother says don't look at the soldiers with the long halberds."
- *Jeweller, in his shop:* "Pearls like these, Minister? Set in gold, they'd crown a general." (After A3: "That crown was the best work of my life. I hope it went to someone worth it.")
- *Wang Yun's steward, at Wang Yun's gate:* "The master hasn't slept. He walks the garden and sighs." (After A5: "A covered carriage took the young lady tonight. The house is very quiet.")
- *The Chancellor's gatekeeper, as Wang Yun:* "The Grand Preceptor receives no one today."
- *Liangzhou rider by the stable:* "In Liangzhou we ride before we walk. These Chang'an streets are too narrow for a horse to stretch."

**State 2, night**
- *Watchman, with a clapper:* "Second watch, and all's well. Keep your lantern lit, sir. The Liangzhou patrols take a dark street for a guilty one."
- *A maid of Wang Yun's, after A5:* "They say Lady Diaochan went in the covered carriage, straight to the Grand Preceptor's."

**Inside the Chancellor's residence (Diaochan)**
- *Maid in the gallery (the novel's gossip):* 「夜来太师与新人共寝，至今未起。」 ("The Grand Preceptor spent the night with the new girl and hasn't got up.")
- *Older maid:* "Walk softly near the middle hall. He throws things when he's woken."
- *Gatekeeper, inside:* "The young mistress doesn't go out. The Grand Preceptor's orders."

**State 3, Dong Zhuo away**
- *Shopkeeper:* "The Grand Preceptor's at Meiwu. The streets breathe again."
- *Soldier at the Heng Gate:* "General Lü stood on that ridge till the dust was gone. Didn't say a word."

**State 4, the day of the gate**
- *Herald:* "The Son of Heaven is recovered from his illness! All officials to the Weiyang Hall!"
  The novel's pretext was 「天子有病新愈」 ("the emperor has just recovered from illness").
- *Old official in court robes, in line:* "Why are we all wearing swords to a celebration?"

**State 5, after**
- *Crowd at the crossroads:* "Sell the coat! Buy wine! The old traitor is dead!" (the novel's 卖衣买酒)
- *Passer-by at the body:* "That one's for my brother, who died on the road from Luoyang."
- *Children:* "Ten thousand years! Ten thousand years!"
- *The official who dropped his chopsticks:* "I held a cup today. My hand didn't shake once."

**State 6, the sack**
- *Running man:* "The Liangzhou men are inside! Li Meng and Wang Fang opened the gates!"
- *Old woman:* "East! Get to the Xuanping Gate, the Son of Heaven is there!"
- *The labourer from Meiwu:* "I built his walls. Now his men burn mine."

### Optional challengers in Chang'an
- **The old scholar at the market go table,** in states 1, 3 and 5.
- **A Liangzhou officer** who blocks a side lane at night (state 2) and spots you: "Out after the drum, Minister? Play me for your way home."
- **Question for Plot:** Cai Yong at the go table in state 1. He served Dong Zhuo, was famous for music and learning, and his execution in A15 lands harder if the player has met him. It is not an event in the novel, only his presence in the city.

---

## 2. The Meiwu Road (郿坞道)

**What it is:** a real route of 250 li along the Wei valley, with Meiwu at the west end and Chang'an's Heng Gate at the east. The Wei River runs along its north edge and the Qinling hills along its south. Wheat fields, poplar rows and Han post-pavilions (亭) mark the distance: "the 30-li post". The player always knows how far along they are.

**The four journeys, one road:**

| When | Who | What the road is like |
|---|---|---|
| **A12 → A13, the ride out** | Li Su, alone, with the false edict | Empty and quick. Labourers walking home, a post-pavilion keeper. **This introduces the road.** |
| **A13, the procession back** | Li Su, riding beside Dong Zhuo's carriage | The column moves at walking pace and you walk along it. It stops at each omen. **This develops it.** |
| **A15, the raid** | (protagonist to confirm) | Soldiers marching west, people coming east with news. |
| **A16–A17 → A18, the march** | The villains | A Liangzhou army marching east, past an emptied Meiwu. |

### The procession (A13)
- **The column,** front to back:
  - outriders
  - Dong Zhuo's great carriage
  - Diaochan's covered carriage (her curtain stays down; she doesn't speak on the road)
  - Li Su on horseback
  - a rearguard
- **The player is Li Su:**
  - free to ride up and down the column, talk to the guards, and look at the curtain
  - kept to the road by a soft leash: "Li Su must keep near the Grand Preceptor."
- **Roadside:** farmers kneel as the carriage passes.

### Stops, west to east in the novel's order (all on the way back to Chang'an)

1. **`wheel`, at about the 30-li post,** just after a small stone bridge, where the road is rutted.
   - The column jolts and stops. A wheel has broken on the great carriage.
   - Dong Zhuo calls Li Su to the carriage: go problem (A13a), 「弃旧换新」 ("discard the old for the new").
   - A spare carriage is brought up.
2. **`bridle`, about 10 li further,** a willow-lined stretch.
   - The horse snaps its bridle: go problem (A13b).
3. **`fog`, the next day,** on open plain.
   - Wind rises, and the light goes to storm. **The fog closes the view to a small circle around the player**, and the column ahead disappears.
   - Follow the sound of the carriage bells to Dong Zhuo: go problem (A13c), 「红光紫雾，以壮天威」 ("red light and purple mist, to add to Heaven's majesty").
   - **This is the twist:** for the first time the landmark (the procession's dust) is gone.
4. **`fields`, at night outside the walls.**
   - The camp: tents, fires, the two carriages. The Heng Gate's lanterns are visible far off.
   - Children's singing comes from the moonlit fields and gets louder as you walk toward it: 「千里草，何青青！十日上，不得生！」 ("Grass of a thousand li, so green! Ten days up, it will not live!")
   - When you find the children, they run. Walk back to the carriage: Dong Zhuo asks what it means. Last omen problem (A13d).
5. **Morning, at the Heng Bridge** (the road's east end, the Chang'an side).
   - The Taoist by the road with the cloth marked 口 at each end (scene, still `omen_taoist`). Li Su has him driven off.
   - The column enters Chang'an by the Heng Gate.

### Townsfolk on the road
- *Post-pavilion keeper (ride out):* "Thirty li to the next post, sir. Mind the ruts after the bridge."
- *Labourers going home east:* "We built it, and they sent us home with nothing but a sore back."
- *Kneeling farmer (procession), not looking up:* "Heads down, heads down. Don't let him see your face."
- *Guard, after the wheel:* "A new wheel by noon. The Grand Preceptor says it's a sign: the new for the old."
- *Outrider in the fog:* "I can't see the horse in front of me. Where's the carriage?"
- *Cook at the night camp:* "Children in the fields at this hour? Whose children?"

### Optional challenger
The **post-pavilion keeper**, on the ride out only. Pavilion keepers sat out long nights with a board.

---

## 3. Meiwu (郿坞)

**What it is:** Dong Zhuo's fortress. The novel: 「其城郭高下厚薄一如长安」 ("its walls as high and thick as Chang'an's"). Inside: 「仓库屯积二十年粮食」 ("storehouses with twenty years of grain"), and 「选民间少年美女八百人实其中」 ("eight hundred young beauties chosen from the people, kept inside"). Gold, silk and pearls are piled beyond counting.

Its saying is 「吾事成，雄踞天下；不成，守此足以终老」 ("If I succeed, I hold the empire; if not, I grow old here").

### Layout (north up)

```
   ┌──────────────────────── walls as high as Chang'an's ───────────────────────┐
   │   DIAOCHAN'S ROOMS ▪   ┌──────── DONG ZHUO'S HALL (hall) ────────┐  MOTHER'S │
   │   (west)               │  dais · screen · braziers ▪             │  ROOMS ▪  │
   │                        └─────────────────────────────────────────┘ (mother) │
   │   WOMEN'S QUARTERS (the eight hundred)      inner gate                      │
   │ ───────────────────────────── inner court ───────────────────────────────── │
   │   STOREHOUSES: gold · silk · pearls       GRANARIES in rows (20 years)      │
   │ ───────────────────────────── outer court (procession forms here) ───────── │
   └─────────────────────────────── GATE (gate) ────────────────────────────────┘
                                         │
                                  the Meiwu Road (east)
```

- **You see it coming:** the walls rise over the road for the last stretch of the ride out. It is the place's landmark.
- **Walking in:**
  - The gate opens for Li Su when he shows the edict (A13). The bar is lifted, with a line from the gate guard.
  - The outer court's granaries go in rows. It's the one place where the map's sheer repetition is the point: twenty years of grain. The rows are short, and the hall is always visible at the end.
- **The hall (`hall`):** the A13 contest, the lie about the throne.
- **The mother's rooms (`mother`):** quiet, with incense and two maids. A ninety-year-old woman clutches her son's sleeve (still `dz_mother`); shown as a scene.
- **Diaochan's rooms:** the A13 cameo, where she pretends joy at being promised the rank of consort.

### Meiwu raided (A15)
- The gate stands open. Huangfu Song's soldiers are in the outer court.
- The storehouses are open, with clerks counting: the novel lists gold by the tens of thousands of jin and silver by the millions.
- The women walk out of their quarters in a stream.
- The mother's rooms are empty: a fallen incense burner, and narration only.
- Lü Bu goes straight to Diaochan's rooms; the novel has him take her first.
- **Question for Plot:** whom do we play here (Wang Yun? Lü Bu? Huangfu Song?), and what does the player do: free the women, find Diaochan?

### Townsfolk in Meiwu
- *Gate guard:* "Walls as thick as Chang'an's. Nothing comes through this gate he doesn't want."
- *Granary keeper:* "Twenty years of grain. 'If I succeed I hold the empire,' he says, 'and if not, I grow old here.'"
- *A girl of the eight hundred:* "They took me from my mother's door in Chang'an. Eight hundred of us, picked like peaches."
- *The mother's maid:* "The old lady is ninety. She says her flesh trembles. She hasn't slept in days."
- *(raid) Freed woman:* "The gate is open. Which road goes home?"
- *(raid) Clerk:* "Gold, tens of thousands of jin. Silver, millions. I've stopped counting the silk."

---

## 4. Liangzhou (凉州)

**What it is:** the far west. Dry loess, a long valley road running east, and wind. The villains' turn (A16–A17). Jia Xu plays the rumour (A16), Li Jue the trick at Ren Valley (A17).

### Layout (west to east, one road)

```
 LI JUE'S CAMP ── v1 HERDERS' VILLAGE ── v2 WALLED FARM ── v3 POST TOWN ── REN VALLEY MOUTH ──► east, to Meiwu
 (camp: A16)      (corrals, horses)      (a little 坞)     (亭, a constable)  (rengu: A17)
                                                                         two heights: GONGS ▲   ▲ DRUMS
```

- **Li Jue's camp (`camp`):**
  - Four generals' tents (Li Jue, Guo Si, Zhang Ji, Fan Chou) and Jia Xu's small tent.
  - The envoy comes back refused: 「求赦不得，各自逃生可也。」 ("No pardon. Every man run for his life.")
  - The men are already packing to scatter, and the camp is half struck.
- **Three villages,** each different to look at and to win:
  - **v1, the herders' village:** corrals and horses. Its elder is suspicious of men from the east. Won by delivering the rumour, with no board.
  - **v2, the walled farm:** a little earth-walled 坞, Meiwu in miniature. The headman is a go problem.
  - **v3, the post town:** a 亭 with its 亭长, the constable. This is Jia Xu's own line come true: 「一亭长能缚君矣」 ("any village constable can tie you up"). He is the hardest problem.
    - **The twist:** he could arrest you, and what stops him is the crowd you've gathered behind you.
- **The crowd grows behind you.** After each village, men fall in behind Jia Xu. By v3 you lead a column, and by the camp's march (`a16`) it's an army. Niu Fu joins on the road; that's a scene.
- **Ren Valley mouth (`rengu`):** the road narrows between two heights. Li Jue's men hold the heights, gongs on one and drums on the other. Lü Bu's army comes up from the east. The map stages the reversed signals 「鸣金进兵，擂鼓收兵」 ("advance on the gong, withdraw on the drum") with the gong and drum posts in plain view. A17 contest.
- **The exit east** opens after A17. The march passes Meiwu (empty, gate open) and the Meiwu Road to Chang'an (A18).

### Townsfolk in Liangzhou
- *Camp soldier:* "No pardon. The envoy came back with nothing. I'm going home to my mother."
- *v1 elder, not looking up from a horse's hoof:* "Wang Yun? A man of the east. What does he know of Liangzhou?" After the rumour: "Then we're dead men either way. Better on horseback."
- *v2 woman on the wall:* "We have a wall. Walls kept out the Qiang. Will they keep out Chang'an?"
- *v3 constable (challenger), arms folded at the pavilion:* "A man without an army is just a man on a road. I've tied up better." (Won:) "...That's no road gang behind you. That's Liangzhou."
- *A man in the crowd behind you:* "Better die marching than in our beds."

---

## Light, by beat

| Beat | Light |
|---|---|
| A1 | day (two parts; light shifts to mark the second day) |
| A2 | night, moon |
| A3–A5 | day; A5's carriage leaves at dusk |
| A6 | night, red lanterns |
| A7 | morning |
| A8 | lamp-lit, a month later |
| A9–A10 | day; A10's carriage at noon |
| A11 | late afternoon (the dust on the road) |
| A12 | night (secret room), day (palace gate) |
| A13 | ride out (day); the procession: day, then storm (fog), then night (fields), then dawn (Taoist) |
| A14 | bright morning |
| A15 | day; night for the lamp |
| A16–A17 | harsh day; dust at Ren Valley |
| A18 | smoke-dark day |
