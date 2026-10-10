# Book 1 · 侯门深似海 *Deep as the Sea*: design

*Dream of the Red Chamber*, chapters 1–6. Played: chapter 3 (Lin Daiyu enters the Rong mansion) and chapter 6 (Granny Liu
enters it). Told on scrolls: chapters 1–2 and 4–5. Every beat happens in the novel unless marked **(staging)**. The
script is `script.md`.

**How it was chosen.** The user: "lets write a book one of dream of the red chamber". Plot offered this book and Wang
Xifeng's funeral-and-bribe arc (ch. 13–16) as the alternative; the user: "ill go with your rec", and "dont be tied down
by the precedents, you are free to take this somewhere new ... put it into a new area rather than tk".

## The book in one paragraph

Two outsiders walk into the same great house, one week apart in the novel's telling, and from opposite ends of the
world. Lin Daiyu, a child (the novel gives her five when her tutoring began, and no age on arrival) and newly motherless, comes in by the side gate in a sedan
chair, and is determined not to give anyone a reason to laugh at her: 「步步留心，时时在意，不肯轻易多说一句话，多行一步路，
惟恐被人耻笑了他去」. She reads every room, and is perfect, until the one person in the house who follows no rules smashes
his jade over her. Granny Liu, an old peasant widow, comes in by the back gate on foot, with a grandson and nothing to
eat at home for the winter, and is laughed at from the moment she reaches the stone lions. She reads nothing right, calls
the maid "Madam", tells Wang Xifeng that one of her hairs is thicker than a peasant's waist, and walks home with twenty
taels. Between them stands Wang Xifeng, who reads everyone, and who lies as easily as she laughs.

## What the book is about (Part 0)

- **A centre with stakes.** The house itself, and what it costs to belong in it. For Daiyu the stake is her place and
  her pride; for Granny Liu it is food for the winter.
- **A shape.** Arrival, the long day of tests, the one test no one could pass (the jade), tears at night. Then the
  mirror: the same house from below, a hard way in, the shameful ask, the silver, the walk home.
- **Its own world.** One house. Daiyu is shown Xifeng's door by Lady Wang in the afternoon (「这是你凤姐姐的屋子」);
  Granny Liu goes through that same door in Part 2.
- **Thread figure (C4): Wang Xifeng.** She is on stage in both halves and drives both: her loud entrance on Daiyu, her
  tears and laughter on cue, the silk she claims to have foreseen, and later the glass screen she lies about to Jia Rong
  and the silver she gives Granny Liu. Both leads have to read her, and the player watches a master at the skill the
  book is about.
- **A woman leads every playable beat.** Not forced: the novel's ch. 3 is told through Daiyu's eyes and ch. 6 through
  Granny Liu's.

## The new mechanic: read the room (察言观色)

**This is a go trainer, and go stays at the centre** (the user: "this should be a go trainer as well"). Every moment
the novel makes a social test is posed as a **go board**: the caption names the choice, and a wrong move is the
smile behind a sleeve. Reading the room is reading the board. The novel's standard for Daiyu (never laughed at) is the
game's own: solve it without a slip. **18 boards** across 15 beats.

The story file is in the engine's own format (`story.py`: nodes, scenes of steps, dilemmas), so the existing engine
can play it once Integration registers it. Below is how the mechanic plays on boards today, then the watching layer
that would sit on top of the boards with a little engine and map work.

**Daiyu: watch, then act.**
- A **moment** is a social choice the novel gives her: where to sit, what to call someone, whether to stay for dinner,
  when to drink the tea, what to say she has read. Each is a board, its dilemma caption the choice (「看清座次」 "Read
  the seats"), its slip line the smile (「端茶的丫头停住了，笑了一笑」).
- **The watching layer (for Places and Integration, not yet built):** before she steps to the board's spot, the player
  can **watch**: look at the people in the room, one at a time (room people with a line each, as Places already
  places them). Each one who has something
  to show gives a **cue**. The cues stand for what the text says she noticed or knew; where the text gives the cue
  itself, it is used as written. The sisters whisper 「这是琏嫂子」. Two brocade cushions face
  each other on the kang. Lady Wang moves to the east side to make room. The others rinse their mouths before the tea.
  Grandmother Jia scoffs at girls' reading.
- Some cues come only if she waits (Lady Wang moves east only after Daiyu comes in).
- Solve the board and the moment passes, unremarked, which is the point. A wrong move is someone **smiling behind a
  sleeve** (耻笑), with the usual wait before trying again. **Engine ask (optional):** a tally of smiles shown at the
  day's end (d8): the novel's Daiyu ends the day with none.
- **The cues teach.** At dinner Grandmother Jia scoffs that the girls only "know a few characters". When Baoyu asks the
  same question an hour later, the right answer has changed, and only a player who watched dinner knows it: 「不曾读，只上了
  一年学，些须认得几个字。」
- **The mechanic fails on purpose, once.** Baoyu asks if she has a jade. No one in the room understands the question
  (「众人不解其语」), so there is no cue to watch. She can only reason (「黛玉便忖度着」) and answer as well as anyone could.
  The board is solved, and he smashes the jade anyway (solved, but the story fails, as in the Three Kingdoms books). The one person in the house who can't be read is the one who
  matters. The tally takes no smile for it; that night she weeps for it.
- **Her inner voice.** The novel gives Daiyu's private thoughts, and they are sharp: 「这来者系谁，这样放诞无礼？」,
  「倒不见那蠢物也罢了」. The player hears them as asides, then watches her act perfectly. The gap between what she thinks
  and what she shows is the secret the player keeps with her.

**Granny Liu: the same rooms, played the other way.**
- She **can't** read a room. Indoors her watching is dazzled (「满屋中之物都耀眼争光的，使人头悬目眩」), and she gets the
  cues late or not at all. She mistakes Ping'er for Xifeng and only learns from how Zhou Rui's wife addresses her.
- Being laughed at **costs her nothing**. The gate servants toy with her, the children shout her business across the
  street, and she bows and asks again.
- What costs her is **being sent away**. Her moments are about nerve: whom to ask, asking again, waiting for the gap
  after the meal, and saying the shameful thing out loud (「未语先飞红的脸，欲待不说，今日又所为何来？只得忍耻说道」).
  Her boards are about nerve, not manners, and their slip lines are laughter that costs her only the retry.
- **Ban'er** (五六岁, her grandson) is a small weight: he won't bow, hides behind her, and grabs at the meat on the
  passing table. She has to keep him in hand (one slap, as in the text).
- Her slips are the novel's, and they play as comedy, not failure: "your nephew" (「开口就是『你侄儿』」), the hair and
  the waist. (Plot's reading: "your nephew" is her copying Xifeng's 「这是我侄儿」 of a moment before. She does watch;
  she just reads it wrong.) **Xifeng reads her anyway**, and the silver comes. That is the book's answer to Part 1: the house was
  never really won by manners.

## Whom we follow

| Part | Lead | Why |
|---|---|---|
| 1 · 步步留心 *Step by Step* (ch. 3) | **Lin Daiyu** | The chapter is seen through her eyes; every test is hers |
| 2 · 侯门深似海 *Deep as the Sea* (ch. 6) | **Granny Liu** | The novel picks her as its way into the house: 「恰好忽从千里之外，芥豆之微，小小一个人家」 |

One switch, across a scroll. Granny Liu has no meeting with Daiyu (she never meets her in ch. 6), so this is a cut, and
the scroll says so plainly.

## The beats

Keys `d1`–`d8` and `d6a` (Daiyu) and `g1`–`g7` (Granny Liu). Each ◆ is a go board, in order within the scene.

| Key | Beat | Place · room | Boards |
|---|---|---|---|
| d1 | **The Side Gate** (角门): the sedan chair; the Ning mansion's gate, then the Rong mansion's west side gate; the bearers change at a bowshot | Rong mansion · the west side gate → the festooned gate (垂花门) | — (the tone: watch through the gauze window) |
| d2 | **Grandmother** (外祖母): the embrace; the introductions; the three sisters; her medicine and the monk's prophecy | Grandmother Jia's rooms | ◆ whom to bow to first |
| d3 | **"I'm Late"** (我来迟了): Xifeng's entrance; what to call her; her tears and laughter on cue; the silk she "foresaw" | Grandmother Jia's rooms | ◆ what to call her |
| d4 | **The Elder Uncle's House** (大舅): by covered carriage to Lady Xing's compound; Jia She won't see her; Lady Xing presses her to stay to dinner | Lady Xing's compound | ◆ stay to dinner? |
| d5 | **The Kang** (度其位次): Rongxi Hall; the two cushions; Lady Wang's side room; Jia Zheng's seat; the warning about the "demon king" | Rongxi Hall · Lady Wang's rooms | ◆ where to sit (twice) · ◆ answer the warning |
| d6a | **Sister Feng's Door** (凤姐姐的屋子): on the passage, at the screen wall, Lady Wang points out Xifeng's gate (the gate Granny Liu uses in g5) | Rong mansion · the N-S passage | — |
| d6 | **After the Meal** (饭后茶): dinner at Grandmother Jia's, not a cough heard; the tea that isn't for drinking; "what have you read?" | Grandmother Jia's rooms | ◆ which chair · ◆ the first tea · ◆ what have you read |
| d7 | **The Jade** (摔玉): Baoyu comes; "I've seen this sister before"; "have you read?"; the name 颦颦; "have you a jade?" | Grandmother Jia's rooms | ◆ have you read (again) · ◆ have you a jade (no cue; solved, and he smashes it anyway) |
| d8 | **The First Tears** (还泪): the green gauze closet; Xiren at the bedside | the green gauze closet (碧纱橱) | — |
| (scroll) | Chapters 4–5: the Xue family; Baochai; the dream, in two lines | | |
| g1 | **A Hair Thicker than a Waist** (拔一根寒毛): the village; Gou'er's sulk; Granny's plan; "the noble gate is deep as the sea" | the village · Gou'er's house | — |
| g2 | **The Stone Lions** (石狮子): the main gate's sedan chairs; the side gate's bench of servants; "wait by the wall corner"; the old man | Ning-Rong Street · the Rong mansion's side gate | ◆ get past the men on the bench |
| g3 | **Three Zhou Da-niangs** (三个周大娘): the back street; the children | the back gate | ◆ which Zhou Da-niang |
| g4 | **A Real Buddha** (真佛): Zhou Rui's wife; Xifeng runs the house now; the gap after the meal | Zhou Rui's house | ◆ say why you came |
| g5 | **The Clock** (自鸣钟): the perfume; Ping'er taken for the mistress; the clock; the silence; the meal going past (Ban'er slapped quiet, in narration) | Xifeng's courtyard · the east room | ◆ how to greet Ping'er |
| g6 | **"Your Nephew"** (你侄儿) · **boss, Wang Xifeng** ("Pepper Feng"): Xifeng at the hand-warmer; Jia Rong and the glass screen; the ask; the twenty taels | Xifeng's rooms | ◆ say it · ◆ nowhere to hide · ◆ ask her (solved; the words still come out as "your nephew") |
| g7 | **The Back Gate** (后门): Zhou Rui's wife scolds her; the silver she tries to leave; home | Zhou Rui's house · the back gate | — |

**18 boards** in fifteen beats; d1, d8, g1 and g7 have none. The boss is Wang Xifeng at g6, the thread figure, with
three boards, the last the hardest. Danger where the novel has it (R17): for Daiyu, being
laughed at, which the novel names as her fear on her first line; for Granny Liu, going home empty-handed to a winter
with nothing stored (「冬事未办」).

## Road challengers (exact, for Places): 5, of which 0 blocking

| Walk | Lead | Total | Blocking | Who |
|---|---|---|---|---|
| Grandmother Jia's courtyard (d1–d3) | Daiyu | 1 | 0 | a maid on the steps, in red and green, who wants to see what the new cousin can do |
| The covered walks and the passage (d5–d6) | Daiyu | 1 | 0 | an old nurse at a go board in the covered walk |
| Ning-Rong Street (g2) | Granny Liu | 1 | 0 | a groom by the sedan chairs at the main gate |
| The back street (g3) | Granny Liu | 2 | 0 | a hawker with a toy load; one of the back-street children |

The gate bench is not a challenger: it is g2's own board. Lady Xing's court and the village have none.

## Plants and payoffs (C6)

- **Tears.** Scroll: the Crimson Pearl Flower will repay the stone with all the tears of a lifetime
  (「把我一生所有的眼泪还他」). d2: the monk said she must never hear weeping (「总不许见哭声」). d2: everyone weeps when she
  arrives. d8: she weeps on her first night, over the stone's jade.
- **The empty frame.** Scroll (ch. 2): Leng Zixing, 「如今外面的架子虽未甚倒，内囊却也尽上来了」. g6: Xifeng to Granny Liu,
  「不过是个旧日的空架子」 and 「外头看着虽是烈烈轰轰的，殊不知大有大的艰难去处」. Played second, it explains; played
  first, it plants.
- **Xifeng's door.** d6: Lady Wang points it out to Daiyu. g5: Granny Liu goes in.
- **Xifeng lies.** d3: the silk (「这倒是我先料着了」, said after Lady Wang has just told her to fetch it). g6: the glass
  screen (「说迟了一日，昨儿已经给了人了」), which she then lends. The player who watched her in Part 1 sees it coming.
- **What to call people.** d3: Daiyu doesn't know what to call Xifeng and waits for the sisters. g5: Granny Liu nearly
  calls Ping'er 姑奶奶. g6: she calls her own grandson Xifeng's nephew.
- **Reading.** d6: "only the Four Books". d7: "I haven't studied". Planted for later books: Daiyu's poetry.

## Places (for whoever builds the map)

One house, two ways in.
- **The Rong mansion** (荣国府): the main gate (three doors, stone lions; closed), the west side gate (角门), the
  festooned gate (垂花门) and its covered walks, Grandmother Jia's courtyard (birds in cages along the walks) and rooms,
  Rongxi Hall (荣禧堂, the plaque and the couplet), Lady Wang's side rooms east of it and the small rooms on the east
  corridor, the north-south passage with Xifeng's courtyard (the screen wall, the inverted hall 倒厅), the back gate and
  the back street, Zhou Rui's house inside the back gate.
- **Lady Xing's compound** (东院, through a black-lacquered gate east of the main gate, cut off from the garden): reached
  by covered carriage.
- **The Ning mansion's gate** (宁国府), seen from the sedan chair only.
- **The village** outside the city, Gou'er's house.

**Light:** d1–d7 afternoon into evening; d8 night. g1 evening; g2–g6 one morning; g7 dusk (「天也晚了」).

## Cast

Part 1: Lin Daiyu; Grandmother Jia (贾母); Lady Xing (邢夫人); Lady Wang (王夫人); Li Wan (李纨); Wang Xifeng (王熙凤);
Yingchun, Tanchun, Xichun; Jia Baoyu; Xiren (袭人); Yingge (鹦哥); Nurse Wang (王嬷嬷); Xueyan (雪雁); old nurses,
maids, bearers, pages. Jia She speaks only through a messenger; Jia Zheng is away fasting.
Part 2: Granny Liu (刘姥姥); Ban'er (板儿); Gou'er (狗儿); Liu-shi (刘氏); the gate servants and the old man among them;
the back-street children; Zhou Rui's wife (周瑞家的); Ping'er (平儿); Wang Xifeng; Jia Rong (贾蓉).

## Stills

| Id | Beat | What it shows |
|---|---|---|
| `hl_sedan` | d1 | The great gate seen through a sedan chair's gauze window, stone lions, the main door shut |
| `hl_embrace` | d2 | Grandmother Jia, silver-haired, pulling the girl into her arms; the room in tears |
| `hl_xifeng` | d3 | Xifeng sweeping in from the back door among maids, gold and red, laughing |
| `hl_kang` | d5 | Two brocade cushions facing on an empty kang; the girl on a chair to the side |
| `hl_tea` | d6 | A silent table; maids with spittoons and towels; the girl watching before she lifts her cup |
| `hl_baoyu` | d7 | The boy in red with the jade at his neck, looking at her as if he knows her |
| `hl_jade` | d7 | The jade on the floor, everyone diving for it, the girl still in her chair |
| `hl_gauze` | d8 | Night in the green gauze closet; Xiren on the bed's edge; the girl's tears |
| `hl_lions` | g2 | An old woman and a small boy at the foot of the stone lions, sedan chairs crowding past |
| `hl_clock` | g5 | The wall clock's swinging weight, the old woman staring up at it, startled |
| `hl_ash` | g6 | Xifeng in sable, not looking up, stirring the ashes in her hand-warmer |
| `hl_silver` | g6 | The packet of silver and a string of cash set before the old woman |

## What's new against the Three Kingdoms books

| There | Here |
|---|---|
| Boards at contests of war and nerve | Boards at tests of manners: a wrong move is a smile behind a sleeve |
| Many leads, many handoffs | Two leads, one switch |
| Danger is death | Danger is a smile behind a sleeve, and an empty winter |
| Narration tells you what people think | The lead's private thoughts, as asides, against her perfect manners |
| Mechanics serve the plot | The mechanic breaks on purpose at the plot's turn (the jade) |

## Decisions (Plot's; the user can overrule any of them)

1. **Span:** ch. 1–6, playing 3 and 6. Ch. 6's opening scene (Baoyu and Xiren after the dream) is left out entirely, and
   ch. 5's dream is told in two lines without its 云雨 lesson.
2. **Language:** the novel's own vernacular in simplified characters (the user took Plot's recommendation).
3. **Granny Liu is playable** (the user took Plot's recommendation).
4. **Lady Xing's dinner** (d4) is a moment: the text gives Daiyu a careful refusal (「舅母爱惜赐饭，原不应辞……」).
5. **Jia Rong's scene** (g6) stays whole, including Xifeng calling him back and then sending him off with nothing said.
   It is a gap the novel leaves (C1); the game leaves it too.
6. **Go at the centre** (the user's word). A slip is the usual retry; the tally of smiles is an optional engine ask.
7. **The boss is Wang Xifeng** (g6), not Baoyu: she is the thread figure, and g6 is the book's climax. Baoyu's jade
   (d7) is the turn of Part 1, played as a board that is solved and still goes wrong.
8. **Inner voice** is narration ("She thinks: …"), so nothing she thinks is ever said aloud in the room.

## For the other sessions (not sent; the user decides when)

- **Integration:** register `WORLD_HLM1` (`redchamber/book1/story.py`) as a world. It has its own `ZH` and `CAST` (voices
  are ids already in the repo) and `NAMES`. New places: `The Rong Mansion`, `Lady Xing's Court`, `The Village`,
  `Ning-Rong Street`. Optional asks: the tally of smiles at d8; watching people in a room before a board.
- **Places:** the four places above, with rooms `jm-rooms`, `wf-rooms` (Rongxi Hall's east side rooms and the east
  corridor), `gauze-closet`, `zhou-house`, `xf-eastroom`, `xf-rooms`, `xing-hall`, `gouer-house`; spots for the beats;
  the road challengers above. Xifeng's gate on the passage (d6) is the same gate Granny Liu goes through (g5).
- **Graphics:** the stills in the table above; characters for the whole cast.

Checked with `python3 redchamber/book1/check.py` (the Three Kingdoms checker's per-world rules). The script is generated:
`python3 redchamber/tools/script_md.py`.

## Open

- Ban'er stays in narration for now (one slap in g5).
