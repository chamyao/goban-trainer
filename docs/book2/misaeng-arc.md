# Misaeng (미생, Season 1): design

Adapted from Yoon Tae-ho's webtoon 『미생』 Season 1 (Daum, 2012–2013, 145 episodes), following `docs/plot-playbook.md`.
The webtoon is the source, not the 2014 drama. Every beat happens in the webtoon unless it is marked **(staging)** or
**(invented)**. The research, with sources and how sure each detail is, is in `docs/book2/misaeng-research.md`. The game
record of the frame is in `docs/book2/misaeng-ing-cup-g5.sgf`.

**How it was chosen.** The user: "I wanna make another book off of a more modern story, can you research interesting
webtoons that we could use as a skeleton". Plot offered Misaeng, Ya Boy Kongming!, Weak Hero, Itaewon Class, Omniscient
Reader's Viewpoint and court-intrigue webtoons. The user: "lets go with misaeng". On how close to stay: "faithful, this is
for personal use". On publishing: "Im fine with pushing it to the public".

**How faithful (Plot's line, told to the user).** The webtoon's plot, characters, order and each scene's meaning are kept.
The dialogue is Plot's own close paraphrase. Only the famous short lines are quoted (미생이네요, 모두에겐 자신만의 바둑이 있다,
밖은 지옥이다 …), each with its Korean in this doc. No scene's dialogue is copied out whole.

## The narrative (Part 0)

**A group that is not yet alive.** Jang Geu-rae gave his childhood to baduk. He became a Korea Baduk Association
trainee at eleven and failed to turn pro after seven years. He has a high-school equivalency certificate and nothing else.
A sponsor gets him into One International, a trading company, as an intern. Over two years he survives the intern test,
learns trade from nothing, exposes a corrupt manager, revives the deal that manager poisoned, and with one phone call
brings down an executive's nine-year China business. None of it makes him a regular employee. On the day his contract
ends, his team head Oh Sang-sik has already left to start a small company of his own, and hires him.

**The frame is the shape.** Every episode opens on one move of a real game: the 1st Ing Cup final, game 5 (1989-09-05; the venue
is unverified), Nie Weiping (White) against Cho Hunhyun (Black). The game is 145 moves, so Season 1 is 145
episodes. Cho's group in the centre is 미생 (not yet alive) for most of the game. At move 145 White's five centre stones
can no longer escape and Nie resigns, and Cho becomes the first Korean world champion. Jang's season ends on the same move.

**Why it plays:**
- **Stakes in a centre:** an outsider who must survive a place built for people with degrees. Every scene asks whether
  he will live.
- **Go is the story's own language.** The title, the frame, Jang's way of seeing (「모두에겐 자신만의 바둑이 있다」) and the
  title scene (four stones, one eye: 「미생이네요」) are all baduk. Nothing has to be grafted on.
- **Danger where the source has it:** the audit about to close on a fraud it can't see; the phone call that blows up an
  executive's business; HR's 「아마 어려울 것 같습니다」.
- **Women who act:** Ahn Young-yi (top of the intern class, fighting her own department and her father) and Sun
  Ji-young (a working mother who confronts a harasser and refuses to quit) have their own stretches in the text.

**Thread figure (C4): the contract.** Not a villain: the two-year contract Jang signs at m7 and loses at m23. Every lead's
stretch bears on it. Oh's choices (Park's audit, the China business, resigning) are all, in part, about getting Jang made
regular. Kim Bu-ryeon and the executive are the obstacles in front of it.

## The new mechanics (asks)

1. **The game record as the book's spine** (engine; Integration). The book carries the 145-move record. The beat's frame
   strip shows the game played up to the beat's episode number (see "Move" in the beats table), so the player watches the
   game advance across the book.
   - At five beats, a **record board** asks the player to find Cho's actual move from the position before it: Black 29
     (m6), Black 47 (m9), Black 85 (m17), Black 137 (m22) and Black 145 (m24). These are the moves readers tied to the
     story (research §1).
   - A record board is "find the pro's move", not a tsumego. One correct point; a wrong point gets the usual wait. It is
     **not** a problem chosen by another session: the move is fixed by the record.
   - This is the webtoon's own pairing of moves and scenes, so it does not break R5 (we are not inventing tactic-story
     matches).
2. **The audit board** (engine + data; Integration). m12–m13. The player as Jang gathers clues on the map and in the
   office and links them on a board: the abnormal margin in Baekjin Trading's statements; Park coaching Baekjin's staff;
   the Korean voice answering ICB's Jordan line; ICB's board list full of Parks; "James Park". Two linked clues unlock the
   next question. When all are linked, the boss scene plays. This is the webtoon's own investigation (research §2.3).
3. **The ₩100,000 mission** (engine; Integration). m18. Jang gets ₩100,000 to buy goods and sell them. A small trade
   loop on the street map: buy stock, walk, offer to passers-by. It is framed as the attempt (R7): the player can sell,
   but the corner-shop owner always out-sells him and the Korea Baduk Association visit is a rebuke, as written. The
   mission fails.
4. **Setting the room** (data; staging from the webtoon's vol 6). m17. Before the Jordan briefing, the team prepares
   everything down to each executive's drink, the order of trays and the pens. The player places them in the meeting
   room from the notes they were given. Then, at the last rehearsal, the team "shakes the board" (판을 흔들다).
5. **Cutaways** (exist). Sun Ji-young's marriage (m20) is played as a cutaway: her stretch, without Jang in it.

## Whom we follow

| Stretch | Lead | Why |
|---|---|---|
| The trainee years, the internship, the PT | **Jang** | It is his test |
| The waybill | **Oh Sang-sik** (m3, short) | He finds the scrap with Kim Seok-ho's name on it |
| Daycare | **Jang**, with Ahn Young-yi | They are sent together |
| Finance | **Ahn Young-yi** | She goes to finance head Kim Seon-ju herself |
| Park's harassment | **Sun Ji-young** (m11) | She confronts it and goes to Oh |
| The audit | **Jang** | His clue, his "one more move" |
| The pizza shop | **Oh Sang-sik** | Kim Dong-su comes to him |
| The Jordan briefing, ₩100,000 | **Jang** | His proposal, his mission |
| The HQ proposal, her father | **Ahn Young-yi** | Her proposal, her withdrawal, her night |
| Sun Ji-young's marriage | — (cutaway) | Hers; staged fully |
| The phone call | **Jang** | He takes it |
| The executive, the audit, resigning | **Oh Sang-sik** | His confrontation and his decision |
| The last day, move 145 | **Jang** | |

Five leads (Jang, Oh, Ahn, Sun, and Jang again), about 9 handoffs. Each is at a meeting in the office or a parting at its
door (R3).

## The beats (keys `m1` … `m24`)

"Move" is the last move shown in the frame strip when the beat opens (the episode number). Board kinds follow R4.

| Key | Beat | Lead | Place · room | Move | Board |
|---|---|---|---|---|---|
| m1 | **Not Hard Enough** (착수): the last trainee exam game; the monologue (「열심히 안 해서인 걸로 생각하겠다」); home to his mother | Jang | KBA · `kba-trainees`; Susaek-dong · `home` | 0 | Contest, **fails**: Jang, "Win the game that decides your career." |
| m2 | **The Light I'm Allowed** (2수): the sponsor's parachute; first day; Sales Team 3: Oh and Kim Dong-sik | Jang | One International · `lobby`, `sales3` | 2 | Legwork: Jang, "Get through the front desk." (no pass yet) |
| m3 | **The Waybill** (13수): Kim Seok-ho's glue stick; the waybill on the lobby floor; the director explodes; Jang blamed. Oh searches the lobby bins and finds the scrap | Jang → Oh | `lobby`, `sales3` | 13 | — |
| m4 | **Everyone Has Their Own Game** (17–20수): Park Jong-gi on the roof; the client; the note 「무책임해지세요」; he confesses instead | Jang | `roof`; Jongno · `client`; `meeting` | 20 | Contest: Park Jong-gi, "Stand up to the client." |
| m5 | **Daycare** (21–22수): Sun Ji-young asks; Jang and Ahn collect Somi | Jang | daycare | 22 | — |
| m6 | **The Pair** (23–30수): Jang's materials, Han Seok-yul's delivery; Han chokes; Ahn's flawless PT | Jang | `pt-room` | 28 | **Record board: Black 29**; then contest, Han Seok-yul: "Finish the presentation." |
| m7 | **Office Slippers** (31–33수): the individual test (「사지 않겠습니다」); the results: Ahn first, Baek-gi and Han regular, Jang a 2-year contract | Jang | `pt-room`; `hr` | 33 | Contest: Jang, "Sell to someone who won't buy." |
| m8 | **Finance** (39–43수): Ahn takes her team's rejected plan to Kim Seon-ju | **Ahn** | `finance` | 43 | Contest, **fails**: Ahn, "Get the plan past finance." |
| m9 | **미생이네요** (45–47수): Kim Dong-sik knows his past; four stones, one eye. Ends with Oh's nosebleed and Kim Bu-ryeon's dried eel (50–55수, told) | Jang | `sales3`; `roof` | 46 | **Record board: Black 47** |
| m10 | **Laminated** (56–59수): the jargon; Kim Dong-sik's daily homework; the Middle East shipping report | Jang | `sales3` | 59 | Legwork: Jang, "Write the shipping report." |
| m11 | **Park Jong-sik** (60–61수): he arrives; harasses Shin Da-in; Sun Ji-young goes to Oh; 「같이 일 못 하겠습니다」 | **Sun** | `sales3`, `sun-desk` | 61 | — |
| (map) | **The audit board**: the margin, Baekjin's coached staff, the ICB phone, the board list, James Park | Jang | `sales3`; Baekjin Trading; `audit` | — | — |
| m12 | **Baekjin Trading** (62–63수): Kim Dong-sik and Jang find Park already there | Jang | Baekjin Trading | 63 | — |
| m13 | **One More Move** (boss, 64–65수): the audit is packing up; 「아무리 지는 판이라도 꼭 두고 싶은 수가 있다」; the call; James Park | Jang | `audit` | 65 | **Boss**, three boards at the dialogue's turns: Jang, "Keep the audit open." |
| m14 | **No Fun** (66–68수): Park's grievance (「재미없네」); he leaves; Kim Bu-ryeon transferred; Oh promoted | Jang | `exec-floor` | 68 | Settled |
| m15 | **Mother's Pride** (70수): Chuseok; the relatives; 「잊지 말자. 나는 어머니의 자부심이다」 | Jang | Susaek-dong · relatives' flat | 70 | — |
| m16 | **Outside Is Hell** (80–83수): Kim Dong-su's pizza shop; the envelope; 「밖은 지옥이다」 | **Oh** | pizza shop | 83 | Contest: Oh, "Turn down an old friend." |
| m17 | **Shake the Board** (84–88수): setting the room; the rehearsal; the president asks what the youngest did | Jang | `board-room` | 84 | Room setup; **Record board: Black 85**; contest: Jang, "Brief the president." |
| m18 | **₩100,000** (103–106수): the mission; the KBA rebuke; the dried squid | Jang | Jongno street; KBA | 106 | Mission (fails) |
| m19 | **Step on Me** (114–116수): the HQ meeting; the roof; she withdraws; drinks; her father; the necklace | **Ahn** | HQ; `roof`; pojangmacha | 116 | Contest, **fails**: Ahn, "Keep your proposal." |
| m20 | **Somi's Mother** (121–123수): her husband says quit; she refuses | cutaway | Sun's flat | 123 | — |
| m21 | **The Phone Call** (127–133수): the executive's China business; the call from the China office; Jang talks | Jang | `sales3` | 133 | Contest: Jang, "Answer the China office." |
| m22 | **Only Today** (134–139수): Oh at the executive; the audit; 「오늘만 후회해」; the executive demoted; HR: 「아마 어려울 것 같습니다」 | **Oh** | `exec-floor`; `audit`; `hr` | 136 | **Record board: Black 137**; contest: Oh, "Face the executive." |
| m23 | **Infrastructure** (140–144수): Kim Dong-su's offer; Oh resigns; the contract ends; 「인프라는 나 자신이었다」 | Oh → Jang | `sales3`; the street outside | 144 | Settled |
| m24 | **Move 145**: three weeks later; the new company; the next applicant is Kim Dong-sik; Jordan; Cheon Gwan-ung, 「무채색」 | Jang | the new office; Amman | 144 | **Record board: Black 145** |

Ahn leads 2 beats, Sun 1 and a cutaway, Oh 4 (with m3 and m23 shared). Boards: 5 record boards, 11 contests or legwork,
1 boss with 3 boards, 1 mission, 1 room setup. Five beats have no board.


**Written** (`tools/tk_story_w21.py`, `WORLD21`). Five beats are split in two where the scene moves place, so the
story has 29 nodes: `m3b` (Oh's search, lobby, gated on `item:waybill_scrap`), `m4b` (the client's president at One
International, `meeting`), `m5b` (the daycare), `m19b` (the pojangmacha, her father), `m23b` (the forecourt, the
contract ends). The record boards are on m6 (B29), m9 (B47), m17 (B85), m22 (B137) and m24 (B145). The audit board
holds four clues (`statements`, `coached`, `icb_listing`, `icb_call`) and two links; m13's boss plays the call, the
board list and James Park as its three boards.

Spots and people the scenes ask Places for: the lobby bins (give `waybill_scrap`), `lobby-lift`, a `resources` spot or
room (Ahn's team), the audit room's table (gives `icb_listing`, opens the audit board), Jang's desk in `sales3` (gives
`icb_call`), the board room's three seats (`seat_president` water, `seat_exec` green tea, `seat_division` coffee, each
`takes`), m18's shop (socks), buyers, the corner-shop rival and the KBA staff member as a buyer who always refuses
(his refusal is the rebuke), `client`, `meeting`, `daycare`, `sun-flat`, `pojangmacha`, `forecourt`.

## Decisions (Plot's recommendations; the user can overrule any of them)

1. **Span:** all of Season 1, one book, because the frame only lands at move 145. If it runs too long, split after m14
   (Park's fall, Oh promoted): Book A "Not Yet Alive" (m1–m14), Book B "Move 145" (m15–m24).
2. **Language: English only.** The user: "we dont need chinese lines for this". No Chinese lines, titles, goals or item
   names. The source's Korean stays in this doc. The game's checker and engine expect Chinese for every line today, so
   this needs an engine change (engine request 5), not a workaround in data.
3. **What's left out:** Steve Han and the dog-meat lunch (15–16수), Baek-gi's steel-team stretch (35–36, 75–76),
   Han's 시말서 (100–102), Park Jong-gi's second turn (124–126). Each is a side story with its own lead; each can come
   back as a townsperson's line (C2).
4. **Told, not played:** Oh's collapse and the dried eel (end of m9); Cheon Gwan-ung's arrival (inside m15's opening).
5. **Invented or staging:** Oh searching the bins in m3 (the webtoon has him find the scrap; how is not in our sources);
   Jang's last trainee exam game in m1 (the webtoon tells his failure, not one game); the room setup's exact layout
   (from the vol 6 blurb's list).

## Places (shared keys for Places; agreed with Places (Misaeng) on `claude/places-misaeng`)

World 21 (set by Integration; 16–20 stay free for Three Kingdoms), arc `ms`, beat keys `21-m1` … `21-m24`. The story is its own
module, `tools/tk_story_misaeng.py` (`WORLD_MS`).

1. **Susaek-dong**: a hillside alley of low villas; rooms `home` (his mother's room), `relatives` (the Chuseok flat); the
   subway entrance at the bottom.
2. **The subway**: Line 6 to Jongno, a road map (platform, carriage). m2's commuter with a pocket board blocks here.
3. **Jongno**: the tower's door and forecourt (m23), the corner shop (m18), market stalls, **Tapgol Park** (stone go
   tables, old men), a pojangmacha that is up only at night (m19), the `client` office (a door into one room, m4's 19수
   half) and the group `hq` building (a door into one meeting room, m19).
4. **One International** (the tower; floors linked only by the lift): `lobby` (front desk, ID gates, bins, lift bank),
   `sales3` (the team's island, Oh's desk at its head, spot `sun-desk`, a copier, a pantry), `finance`, `hr`, `audit`,
   `meeting` (m4's 20수 half), `board-room`, `exec-floor`, `pt-room`, `roof`.
5. **The Korea Baduk Association** (Hongik-dong, its own place): `kba-front` (m18's rebuke), `kba-trainees` (m1).
6. **Baekjin Trading**: a lane of small industrial offices; room `baekjin`.
7. **Sun's neighbourhood**: the daycare (m5) and Sun's flat (m20). **The pizza shop** (m16) on its own small street.
8. **The new office** (m24): a narrow street, the office upstairs.
9. **Amman** (m24): one street.

## Road challengers (exact, for Places): 10, of which 3 blocking

| Walk | Total | Blocking | Who |
|---|---|---|---|
| Susaek-dong to Jongno (m2) | 2 | 1 | a commuter with a pocket board on the subway (blocking); a Tapgol Park regular |
| Jongno, office to client (m4) | 2 | 0 | Tapgol Park regulars |
| To Baekjin Trading (m12) | 2 | 1 | Baekjin's coached clerk (blocking), a courier |
| Jongno street, the mission (m18) | 3 | 1 | the corner-shop owner (blocking), two passers-by who play |
| Amman (m24) | 1 | 0 | a café player |

## Items

`pass` (temporary pass, m2; ID card at m7, **contract** marked on it), `glue_stick`, `waybill_scrap` (Kim Seok-ho's
name on it), `note` ("무책임해지세요"), `slippers`, `hand_mirror` (Baek-gi's), `homework` (Kim Dong-sik's daily
sheets), `report` (laminated), `statements` (Baekjin's), `icb_number`, `board_list`, `envelope` (Kim Dong-su's; refused),
`seating_notes` (drinks, trays, pens), `cash_100k`, `dried_squid`, `necklace`, `resignation` (Oh's), `contract`.

## Cast (as the scenes call for them, R9)

Jang Geu-rae; his mother; Oh Sang-sik; Kim Dong-sik; Cheon Gwan-ung; Park Jong-sik; Ahn Young-yi; Jang Baek-gi;
Han Seok-yul; Kim Seok-ho; Sun Ji-young; Somi; Sun's husband; Kim Seon-ju; Shin Da-in; Kim Bu-ryeon; the executive
(전무, unnamed); the president; the director (국장); Park Jong-gi; the client's president; Ahn's department head (마 부장)
and 과장; Ahn's father (flashback); Kim Dong-su; the auditors; HR; the China office representative (voice); the
Jordanian ambassador; the corner-shop owner; the KBA staff member; trainee children.

All modern dress. **New art for everyone** (Graphics): office wear, the KBA trainee room, Jongno.

## Stills (briefs in `assets/tk/stills/scene_prompts.json`, book 21)

Ten: `ms_lastgame` (m1, Jang at eighteen alone at the board), `ms_onelight` (m2, the ID gates), `ms_oneeye` (m9, four
stones, one eye), `ms_phone` (m13, the Korean voice on the ICB line), `ms_jamespark` (m13, the board list, one name
circled), `ms_chuseok` (m15, his mother in tears behind the kitchen door), `ms_hell` (m16, Kim Dong-su's empty pizza
shop), `ms_roof_ahn` (m19, Ahn alone on the roof), `ms_infra` (m23b, the tower in grey, the people in colour), `ms_145`
(m24, the last move; Nie's hand resigning). Cast ids are Graphics' `ms_*` walker keys.

## Engine requests (to Integration)

1. **Record boards and the frame strip** (mechanic 1): a world-level `record` (the SGF), a per-beat `move`, and a board
   kind `{"record": n}` asking for move n.
2. **The audit board** (mechanic 2): clue items that link in pairs on a board, with a beat gated on all links.
3. **The trade loop** (mechanic 3): money, stock, buying from a shop, offering to townsfolk; a scripted rival seller.
4. **Room setup** (mechanic 4): place props on marked spots from notes; a beat gated on all placed correctly.
5. **An English-only world** (decision 2): a world flag (e.g. `"lang": "en"`) under which `check_story` doesn't ask for
   Chinese, items need no `zh`, the game shows the English in either language setting, and voices are the English ones.
6. **A modern world**: a new world (n to be set by Integration), its scroll titles in the webtoon's volume names (착수,
   도전, 기풍, 정수, 요석, 봉수, 난국, 사활, 종국).
