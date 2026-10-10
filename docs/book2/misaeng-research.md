# 미생 (Misaeng) Season 1 webtoon research notes

Scope: Season 1 of Yoon Tae-ho's Daum webtoon (2012–2013), 145 "수" episodes, 9 volumes. The webtoon is the primary source. Where the 2014 tvN drama differs, that is noted.

## Sources and confidence key

**[V]** means verified in a source I actually read; the URL is given. **[V-wiki]** means it comes from namu.wiki text, read through the namu.moe mirror. That is fan-written, but detailed and usually accurate. **[V-cmt]** means I inferred it from the Daum best-comment archives: readers describe what happened in each episode, so the event is solid but the exact wording is not. **[?]** means uncertain or inferred.

Main sources:
- **S1. namu.wiki through the mirror namu.moe.** namu.wiki itself returns 403, but the mirror works with curl. Pages read:
  - https://namu.moe/w/미생(웹툰)
  - https://namu.moe/w/미생(웹툰)/시즌1
  - https://namu.moe/w/장그래
  - https://namu.moe/w/안영이
  - https://namu.moe/w/박종식(미생)
  - https://namu.moe/w/장백기(미생)
  - https://namu.moe/w/천관웅
  - https://namu.moe/w/김부련
  - https://namu.moe/w/김동수(미생)
  - These pages are missing on the mirror: 오상식, 한석율, 김동식(미생), 조아영(미생).
- **S2. Daum best-comment archive, episodes 0–80 (착수0–80수).** https://niceaji.github.io/misaeng/ , with the data in `javascripts/episodes.js` and `comment/NNN.txt`. File NNN corresponds to NNN수.
- **S3. Best-comment archive, 81수 to 후기 4.** Tumblr index https://gluebyte.tumblr.com/post/47760646383 links Dropbox zips (misaeng-120-txt.zip, misaeng-149-txt.zip). Files 081–145 are 81수–145수; 146–149 are the afterword (후기) episodes.
  - Both comment archives include the commenter **"허허허"**, who explained each move of the game and linked it to the episode. The namu page says he later declined to have his commentary printed in the books.
- **S4. Yes24 publisher blurbs per volume (original Wisdom House edition):**
  - Vol 1: https://www.yes24.com/Product/Goods/7437073
  - Vol 2: /7437078
  - Vol 3: /7952620
  - Vol 4: /8155936
  - Vol 5: /8463381
  - Vol 6: /8777462
  - Vol 7: /9108405
  - Vol 9: /11066639
  - Vol 8, partial blurb only: Aladin https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=30644808
- **S5. Korean Wikipedia, 미생 (만화).** Gives the volume titles and episode ranges, and a short character list. It has some errors; for example it calls 김부련 "차장" and puts 고 과장 in 영업1팀.
- **S6. Media Today column (2013).** https://www.mediatoday.co.kr/news/articleView.html?idxno=108068 . It quotes several opening-chapter lines and Park's lines verbatim.
- **S7. Korea Baduk Association press release (2015-06-04)** on 박치문's 『대국(對局)』. URL given in the brief: http://m.baduk.or.kr/news/B01_view.asp?news_no=1346
- **S8. English Wikipedia, "1st Ing Cup".** https://en.wikipedia.org/wiki/1st_Ing_Cup
- **S9. Game record (SGF) of the 1st Ing Cup final, game 5.** Saved locally as `scratchpad/sgf/21.sgf` by the earlier attempt. Its origin URL is not recorded; the move count and result were checked against S8 and S3.

---

## 1. The frame: the 1st Ing Cup final, game 5

**The device [V].** Every episode opens with one move of game 5 (the last game) of the best-of-five final of the 1st Ing Cup: **White Nie Weiping 9-dan (녜웨이핑 / 섭위평 聶衛平), Black Cho Hunhyun 9-dan (조훈현).**
- namu 미생(웹툰): "매 회마다 가장 첫 장면에서 제1회 응씨배 결승5번기 제5국 백 九단 녜 웨이핑(聶衛平) VS 흑 九단 조훈현의 대국을 한 수 한 수 묘사하고 있다." (S1)
- The Yes24 publisher text says the same thing (S4, vol 5).

**Result [V].** Black (Cho) won **by resignation (B+R) on 1989-09-05**, giving Cho the series 3–2. Per S8 the final scores were:

| Game | Result |
|---|---|
| G1 | Cho, W+3.5 |
| G2 | Nie, W+9.5 |
| G3 | Nie, B+2.5 |
| G4 | Cho, B+1.5 |
| G5 | Cho, B+R |

- Komi was 8 points under Ing rules (the SGF has KM[8]; 허허허 at 29수 mentions "덤 8집").
- This made Cho the first world champion in Korean baduk history (S4 blurb).
- [?] The venue was Singapore. I recall this but did not verify it.

**Move count [V].**
- The game is **145 moves**; the SGF has exactly 145 moves and RE[B+R].
- namu 시즌1: "조훈현 VS 녜웨이핑의 제1회 응씨배 대국이 145수로 끝나서 시즌 1도 145화로 마무리되었다."
- A reader pointed this out as early as 5수.
- The last move, Black 145, is a placement ("붙임") that captures five white stones in the centre. Nie resigned. (허허허, 145수 [V-cmt])

**Episode titles [V].** Taken from Daum's own episode list (niceaji episodes.js):

| Daum episode # | Title | Date |
|---|---|---|
| 1 | 예고편 (trailer) | 2012-01-17 |
| 2 | 착수 0 | 2012-01-20 |
| 3 | 착수 1 | 2012-01-24 |
| 4 | 2 수 | 2012-01-27 |
| … | N 수 | … |
| 121 | 119 수 | 2013-04-12 (last entry in that dataset) |

- After 145수 came four afterword episodes, 후기 1–4. They show the author's research trip to Jordan and the help he had from the Jordanian embassy (S3, files 146–149).
- Serialization: Tuesdays and Fridays.
- namu gives the run as 2012-01-20 to 2013-07-19. Korean Wikipedia gives 2012-01-17 to 2013-08-13 and "146화", which probably counts the trailer and afterwords.
- Daum's list uses "착수 0" and "착수 1" in place of "0수" and "1수", consistent with 착수 (the first move).

**Move-to-story links.**

박치문's book commentary [V-wiki, S7]:
- The printed volumes carry Joongang Ilbo baduk reporter 박치문's commentary on every move.
- namu says it was written independently of the comic's plot ("만화와는 상관없이 쓴 해설"). 박치문 covered the actual match and shared a room with Cho.
- In 2015 the commentary was republished as a separate book, 『대국(對局)』 (Wisdom House, 316 pages, with an English translation included). (S7)

Reader 허허허's per-move notes, linked to the story [V-cmt; S2 and S3]:

| Move | 허허허's reading | Episode content (my summary) |
|---|---|---|
| W18 | Nie presses hard, deliberately showing a weakness and inviting a fight | The 박 대리 episode: Jang's expectant look pushes timid IT-sales Park to act like a "hunter" |
| B19 | "당연해서 어려운 수": Cho accepts the fight on Nie's chosen ground | Jang's line "묘수/꼼수는 정수로 받는다" |
| B29 | "독한 수": Cho said he played it because of the 8-point komi; it breaks White's lower side at the cost of his own shape | The PT test: 한석율 nervous; Jang's materials and 한석율's delivery |
| W30–32 | White rebuilds a new plan and builds thickness | PT results: 한석율 admits his narrowness; Jang and 한석율 reconcile |
| B47 | Called a slack move (완착); Cho chose to stabilize his unsettled (미생) central group because he felt that living meant winning | The title scene: 김동식 makes one eye from four stones and Jang says "미생이네요" |
| W60 | Cho later criticized it as a bad move that made Black comfortable | 박 과장 joins the team |
| B77 | A move Cho regretted | Jang: "내가 바둑으로 성공했던가?" |
| B85 | The move that turned the flow | The run-up to the Jordan briefing |
| W92 | A "time bomb": the game is eventually decided at this spot | — |
| B93 | Cho regretted it as loose | — |
| W94 | The cut that starts the chase | Jang: "평소대로만 하면 정사원 되는 거죠?" |
| W118 | Later judged a problem move; Nie seems to have misread from here | — |
| W124 | An invasion (치중) "like a bomb"; Nie commits to killing the big group, which was not his usual style | — |
| B137 | Cho's way to live with the group | The audit of the 전무 |
| B145 | Placement; five centre stones captured; Nie resigns | Season 1 ends |

Other commenters made similar links. At 22수: White connects two weak stones into a wall, matching the episode about family. At 47수: "살면 이길 수 있다" is Cho's resolve, read as Jang's wish to settle into the company. At 55수: Black mends its weakness, read as 오과장's health crisis.

[?] I found no evidence that Yoon designed the story move by move. The links are reader readings. Namu notes only that the game's length set the episode count.

Other go anecdotes 허허허 tells: Nie had a weak heart, and his wife 공상명 waited at the venue with an oxygen apparatus; Nie came back from Cultural Revolution hardship (cleaning pigsties in Heilongjiang); Cho was taught by Segoe Kensaku and later taught Lee Chang-ho.

---

## 2. Season 1 plot, arc by arc

Volume titles and episode ranges [V, S5]:

| Vol | Title | Episodes |
|---|---|---|
| 1 | 착수 | 착수–16수 |
| 2 | 도전 | 17–33 |
| 3 | 기풍 | 34–49 |
| 4 | 정수 | 50–67 |
| 5 | 요석 | 68–83 |
| 6 | 봉수 | 84–99 |
| 7 | 난국 | 100–115 |
| 8 | 사활 | 116–130 |
| 9 | 종국 | 131–145 |

### 2.0 Backstory: 착수 0–1 and later flashbacks

**Baduk childhood [V-wiki, S4 vol 1].**
- Jang learned baduk from his uncle (삼촌). When the boy said the word "단수" while playing with the stones, the uncle sent him to a neighbourhood baduk class, then an academy, then a dojang.
- At **11** he entered the Korea Baduk Association as a 연구생 (trainee).
- Vol 1 blurb: he got up at dawn to replay game records alone, then lived "7년간 오직 바둑판 위의 세계에서만", and failed to turn pro ("입단에 실패했다").

**His opening monologue [V, S6 quotes verbatim].**
- In it he refuses every excuse: lack of talent, losing by half a point, combining baduk with part-time jobs, parents who could not give him pocket money, "아버지가 돌아가시고 어머니가 자리에 누우셔서가 아니다".
- He concludes he must simply "not have worked hard enough", because the real reasons hurt too much.
- So in the webtoon, too, **his father died and his mother was bedridden** during his trainee years, and he worked part-time jobs.
- [V-cmt] Comment on 착수0: "열심히 안 한 것은 아니지만 열심히 안 해서인 걸로 생각하겠다".
- [S6] His father's company had gone bankrupt and the father poured everything into him; his mother clipped Lee Chang-ho and Lee Sedol's rankings and prize money.

**Other details.**
- Education: **고졸 via 검정고시** (high-school equivalency exam). [V-wiki; S4]
- He dropped out of high school for baduk. This detail is in namu's drama section: a teacher came to the baduk centre to stop him. [?] I could not confirm it for the webtoon.
- Born 1987-10-22 per the namu infobox; 26 at the start. [V-wiki; the infobox may mix in drama data]

**First job and the army [V-wiki].**
- After quitting baduk, a **sponsor (후원자)** got him a job at a company the sponsor ran.
- When his baduk past became known, colleagues first asked about it and then used it to mock him ("바둑 하던 사람이라 일처리가 답답하다"). He quit.
- He did his military service. ("도망치듯 군대에 다녀온", S6.)

**Entering One International [V-wiki].**
- After discharge, the same sponsor introduced him to the president of **One International (원 인터내셔널)**, a general trading company of a larger group, set in Jongno and Seoul Station.
- He entered as an **intern**. Namu calls it a 낙하산 (parachute hire). He hides his trainee past this time.
- [V-cmt] A comment on 2수 notes he starts about eight months after discharge.
- Line from 2수 [V-cmt, S6]: "제가 밝혀야 할 불빛이 있다면 책임질 겁니다. 내게 허락된 불빛이 있다면요."

**Drama differences.**
- In the drama, his mother's acquaintance arranges the internship (S1 summary). In the webtoon it is the sponsor, who is a friend of the president.
- The Japanese remake also uses a mother's acquaintance.

### 2.1 Intern period, 착수–33수 (vols 1–2)

These are the major beats, mostly [V-cmt] with [V-wiki] where noted.

**Meeting the team.**
- Jang is attached to **영업 3팀** (Sales Team 3, nicknamed "돌격대"): **오상식 과장** (team head; bloodshot eyes; later 차장) and **김동식 대리** (Jang's direct senior, 사수).
- 7수: a senior who gives honest, careful guidance; "세상은 나보다 빠르다."
- 13수: the lost waybill (운송장) incident [V-wiki]. Fellow intern **김석호** borrowed Jang's glue stick, and 3팀's paperwork stuck to his papers. He tossed it aside and it ended up on the lobby floor, where a 국장 found it and exploded. The interns were punished and Jang was blamed. 오과장 later found the scrap with Kim Seok-ho's name on it and cleared Jang.
- 9–11수: the brash intern **한석율** ("개벽이"). He orders Jang around; Jang shuts him down with "너 몇 살이냐?" It later turns out 한석율 is a year older (23수: "알고 보니 형이었다").
- 12수: Jang's line "나의 영웅들이 사라져 간다".
- 14수: 오과장 working through a holiday, a family-man moment.

**Side stories (vol 2) [V-wiki; S4 vol 2].**
- **15–16수, 고 과장 / Steve Han.** 고 과장 takes American buyers of the textile team to a dog-meat restaurant. Textile head **스티브 한** (a US-raised career hire with 부장 status) is furious and holds up 고 과장's approvals. 김부련 and 고 과장 apologize, and all end up at a sauna.
- **17–20수, IT-sales 박 대리 (박종기).**
  - He is a pushover "farmer" type who carries a resignation letter. Jang's offhand praise on the roof inflates him, and he takes Jang along to a client.
  - Overhearing the client's staff mock him, he acts tough (19수). The client's president comes to One International (20수).
  - Jang slips him a note telling him to be "irresponsible" (무책임해지세요). Park instead confesses that the deception was his own ("기망을 한 건… 저입니다").
  - The company does not punish him. Jang reflects: "모두에겐 자신만의 바둑이 있다." Park thanks Jang.
- **21–22수, 선 차장.** Working-mother 선지영 cannot collect her daughter 소미 from daycare and reluctantly asks Jang and 안영이 to do it. This is a long scene of children waiting at daycare.

**The final PT test, 23–33수 [V-cmt; V-wiki].**
- Interns are paired for a group presentation.
  - **Jang is paired with 한석율.** Jang does the materials; 한석율, with his "현장 (the shop floor) comes first" philosophy, delivers. He chokes at one point (29수).
  - 29수: 한석율's motive is revealed. His father and uncles are factory workers, and he insists the shop floor is the foundation.
  - 30수: 안영이's presentation is flawless, and an interviewer asks whether she is the president's daughter or an undercover employee.
  - 장백기's pair presents safe, compiled data and is criticized as having "no vision".
- **Individual PT: "sell something to your partner / buy or refuse".**
  - 장백기 sells a hand mirror ("manage your face before business").
  - 한석율 and Jang: [V-cmt] Jang's item involves **office slippers (실내화)**, framed as "the office worker's combat boots", against 한석율's shop-floor boots. 한석율 repeats "사지 않겠습니다", and Jang in effect "buys 한석율". 한석율 then admits his narrowness (32수).
  - [?] The exact objects need checking against the book.
  - Namu's summary: Jang "프레젠테이션에서는 활약하지 못했으나 이후 있었던 개별 과제에서 신선한 아이디어를 보여 준 덕분에" he was hired.
- **Who is hired (33수) [V-wiki; V-cmt]:**
  - **안영이**: first overall (전체수석).
  - **장백기**: hired; steel team (철강팀).
  - **한석율**: hired.
  - **장그래**: hired only as a **2-year contract worker (2년 계약직)**, unlike the others.
  - 김석호: hired and posted to group headquarters (본사) [V-wiki].
- **First-day rite (33수) [V-cmt].** On the first morning 오과장 takes the new hires to a labour-protest memorial. Readers identified it as the Ssangyong Motor memorial at Daehanmun; one mentions the 재능교육 strike. [?] The exact site is unconfirmed.

### 2.2 New employee, 34–59수 (vols 3–4)

Vol 3 blurb [V, S4]: first day with a new ID card. 장백기 is given no work; 한석율 rebels against pointless overtime; 안영이 clashes with her seniors.

- **34수.** "어른인 척 하지 말고 어른답게 행동해라" [V-cmt].
- **35–36수.** 장백기 is idle at the steel team. Jang wonders whether a team's rationality is "the sum of everyone's yielded individuality" [V-cmt].
- **37–38수.** 한석율 is too familiar with female seniors (comments on their looks, offers to find them boyfriends). The next episode makes clear this is wrong; he learned his coarse talk following a factory foreman. A sexism lesson [V-cmt].
- **39–43수, the planning document.**
  - 안영이 (자원팀, the resources team) has her team's plan rejected by finance. She goes in person to the **finance head 김선주 부장**, a woman, which surprised readers at 42수, and is put in her place.
  - 3팀 builds its own plan. 43수: 안영이 drunk ("술취해서 말하는 거 무효!") [V-cmt; V-wiki].
- **44수.** 오과장: "게임이 끝나면 퇴근하죠" [V-cmt].
- **45수.** The team holds a small good-luck rite (고사) for their item. The Iran–Turkey crude item runs into the EU Iran embargo. [V-cmt; V-wiki: "이란-터키 사업"]
- **46–47수, the title scene [V-wiki; V-cmt].**
  - 김동식 has found out about Jang's baduk past. Jang is angry at being probed (46).
  - 김동식 says society is no different from baduk. He makes **one eye with four stones** for the four-person team: "우리가 뭉치면 이길 수 있어! 벌써 만들었잖아!"
  - Jang replies flatly: **"미생이네요."** Two eyes are needed to live.
- **48–49수.** Jang "opens the door" to the team. His mother: she irons his shirts at dawn while he massages her legs at night [V-cmt].
- **50–52수, credit grabbing [V-cmt; V-wiki].** 부장 **김부련** first distances himself from 3팀's China item ("leave my name off the report"), then claims it once it looks good. 3팀's rare-earth idea via North Korea, tied to July 2012 news, is taken by another team (52: "밥상째 들고 가버리네"). 고 과장 lobbies to push his own item.
- **53–55수, 오과장's collapse.** Nosebleed (53); he gets an IV drip on his own (54); 김부련 scolds him that a father who neglects his health is unfit, and hands him dried eel (55).
  - [V-wiki] 김부련 also quietly revives the Iran–Turkey item after hearing from 고 과장.
- **56–59수, jargon and homework.** Jang is lost in trade jargon (TEU, surcharges, Ramadan shipping). 김동식 quietly sets him daily study problems; he knew Jang's past and had been looking out for him (56). Jang's report on Middle East shipping is corrected and "laminated" (59). Line: "모르는 게 창피한 게 아니다…" (paraphrased by readers) [?].

### 2.3 박 과장's corruption, 60–67수 (vol 4)

All of this is [V-wiki: 박종식 page; S4 vol 5; V-cmt].

**Arrival (60–61수).**
- **박종식 과장** (42) joins 3팀. He is a former steel-team ace and "중동통" (Middle East hand), now a problem employee. He was sent by 김부련 on 정희석 과장's recommendation; 정 is 오상식's rival.
- He slacks off (billiards, sauna) and demeans Jang as a high-school-only parachute hire.
- He sexually harasses young contract worker **신다인**. After 선지영 차장 complains, 오과장 tells Park he cannot work with him.

**The Jordan scheme.**
- Left to "develop his own item", Park brings a **Jordan used-car export deal**.
- 오과장 notices the partner **백진무역**'s margin is abnormally high and reads kickbacks from the financial statements. He reports to 김부련. Knowing he signed it off himself, 김부련 still says "절차대로 하라" (follow procedure) and approves an audit.
- 김동식 and Jang visit 백진무역 and find Park already there, coaching the staff (62–63).

**The breakthrough (64–65수, "탐정 장그래").**
- The audit team finds nothing and is about to leave. Jang says he wants to play "one move" even in a lost game: the Jordanian partner **ICB Company** was supposedly all locals, so why was someone there speaking Korean on the phone?
- The auditors call; a Korean answers. The local signatory "무하마드 인디라" is really **박상준**.
- Jang checks the board list, which has many people named Park, and uses 장백기 to get Park's relatives. **"James Park" on ICB's board is 박종식**; 박상준 is the son of 백진무역's president; that president is Park's uncle.
- ICB is a paper company, and the whole contract is a ring of relatives' firms.

**Motive (66수).**
- Park once single-handedly won a ~US$100–120 million steel deal to Jordan in 2008. His only reward was a team dinner on the 상무's card.
- He then took a kickback, then demanded more, and was told to buy a shabby local firm and sit on its board.
- Lines: "재미없네", and "돈은 니들이 다 처먹고 난 월급이나 받아 가면 땡이냐" (quoted in S6).

**Fallout (67–68수).**
- Park leaves the company after a meeting with the 전무, and faces police and suspended-sentence consequences.
- Responsibility falls upward: **김부련 부장 is transferred to the affiliate 원알루미늄**; 상무 **김석만** resigns, and his past bosses 조원진 and 신재민 are disciplined.
- 김부련, leaving, comforts the guilt-ridden 오상식.
- **오상식 is promoted to 차장** by the president himself (68: "올 하반기 바로 올리도록"), and the team gets a special bonus. It also gets a reputation as internal whistleblowers (vol 5 blurb).

### 2.4 Chuseok, 천 과장, reviving Jordan, 68–99수 (vols 5–6)

**Chuseok (69–70수) [V-cmt; V-wiki].**
- 69: 김동식 meets a **daycare teacher** and they hit it off while talking past each other. We learn 오상식 has four sons.
- 70: At a family gathering, relatives belittle Jang. He overhears his mother defending him in tears, and says to himself: **"잊지 말자. 나는 어머니의 자부심이다. 모자라고 부족한 자식이 아니다."**

**천관웅 과장 (71–73수) [V-wiki; S4 vol 5].**
- Park's replacement is **천관웅** ("normal"; a heavy drinker in poor health). Wary of the whistleblower team, he needles 김대리.
- 오차장 shuts that down: **"회사에 왔으면 일을 해, 게임을 하지 말고"** (72). Here "game" means office politics.
- 천관웅 apologizes and has a last drink with Jang (73).

**Jordan reborn (74–99수) [V-wiki; S4 vol 5–6; V-cmt].**
- At an item meeting, **Jang proposes reviving the Jordan used-car export** that died with Park's fraud. His pitch: "the company was insulted by a corrupt employee; restore a good business; show the system's strength" (74).
- 75–76: side story. 장백기 feels his steel-team work is "dust-like" and envies Jang; his senior 대리 (강 대리) sets him straight.
- 77: Jang: "내가 바둑으로 성공했던가?"
- 78–80: the chaos of real work. The copying lesson, "복사하는 거 보면 신입들 태도 딱 나온다" (S6). 오차장: "열심히 일하는 흉내를 내고 싶은 것인가".
- **80–83: 김 선배 (김동수).** 오상식's former senior, who quit years ago, runs a pizza shop that is being crushed by a big-mart pizza. He tries to give 오상식 an envelope (촌지) to win back his old clients; 오 refuses and refers him to 한강무역, run by the ex-상무 김석만.
  - His lines: **"회사가 전쟁터라고? 밖은 지옥이다. 밀어낼 때까지 그만두지 마라."** [V-wiki; V-cmt 81]
  - 오차장 on drinking (82): "취해 있지 않더라고요".
  - 83: "일은 되게 해야 한다" (readers' paraphrase of the theme) [?].
- **84–88: the briefing to the executives and president.**
  - Vol 6 blurb: the team plans everything down to drink preferences and the order of trays and pens. At the last rehearsal they sense they must **shake up the board (판을 흔들다)**.
  - The president decides and asks what the most junior member did. 오차장 credits Jang. Success (87–88).
  - Meanwhile, 84–85: 안영이 is torn apart by her seniors, then makes peace with a coffee and a bow.
- **89–96: aftermath.**
  - A gift for the Jordanian ambassador (89).
  - 90: the closing caption reminds us he is a **contract worker**.
  - 91: other teams want to borrow the useful, disposable contract worker; 오차장 refuses ("짝꿍 뺏긴 적 없다").
  - 94: Jang feels empty after the project and asks, **"평소대로만 하면… 정사원 되는 거죠?"**
  - 95: traces of departed contract workers are erased.
  - 96: the Jordanian ambassador specifically invites Jang to an event. "지금의 회사만이 당신의 전부는 아니다" (reader's paraphrase) [?].
- **97–99.** 안영이 teases Jang (the first flag, 97, 2013-01-18 per namu). The team hunts for new business (98). 오차장 tells the incoming intern trainers: "잘 가르치겠습니다, 빈 손으로 내보내는 일 없게" (99).

### 2.5 Second year begins, 100–126수 (vols 7–8)

**Vol 7 blurb [V, S4].**
- 한석율's lazy senior steals his credit. He tries a trick, deleting a file to trip the senior up (101), and ends up writing a **시말서** (written apology; 102).
- Jang stays up writing a new-business proposal full of jargon and is called "헛똑똑이" (102).
- 안영이's proposal is picked at a group HQ meeting, which drops her into organizational absurdity.

**Jang's 10만 원 sales mission (103–106수) [V-cmt; V-wiki footnote].**
- 오상식 gives him **₩100,000 to buy goods and sell them**.
- Jang's first instinct is to sell at the **Korea Baduk Association**, which he had not gone near in years. He is rebuked there: "동정이든 격려든 응원이든 다 사줄 테니까… 그게 네 일을 했다고 말할 수 있겠니?" (105).
- He then sells on the street; a corner-shop owner out-sells him (dried squid). Namu: the mission "거하게 실패했다".
- 103: "기초가 없이는 계단을 오를 수 없다" / "도망치듯 장사를 해서는 안 된다" (readers' quotes).

**Other episodes, 107–113수 [V-cmt].**
- 107: Myanmar shrimp-farm item, with a supply-and-demand curve.
- 108: an overtime-culture episode. 안영이's team 과장 dawdles, drinks at dinner, and makes everyone stay late.
- 109–110: Korean-food-globalization and rice-export ideas, and a Chinese contact refusing because it is "귀찮아서" (too much hassle).
- 111–113: Jang's item is rejected. He emails everyone who helped him to report the result.

**안영이 arc (114–116수) [V-wiki].** See §3.

**117–120수 [V-cmt].**
- 117: we learn 김대리's first name is 동식.
- 118: 오차장 tells a superior "it was this kid's work".
- 119: Jang pities a supplier's 상무; 오차장 snaps: **"어디서 동정질이야"**. A hard-working breadwinner deserves respect, not pity.
- 120: dealing with the finance team; "귀는 친구를 만들고, 입은 적을 만든다" (reader-quoted) [?].

**선지영 arc (121–123수) [V-wiki; V-cmt].**
- Her husband, newly promoted, tells her to quit and stay home. She breaks down: she wants to be seen as a person, not only as 소미's mother.
- 123: the marital conflict is resolved, and housework becomes "something he must do", not "help". But rumours that she is quitting are already spreading, and colleagues sneer "여자들이란".

**박 대리 again (124–126수) [V-wiki].**
- 장백기, in a second-year slump, meets 박 대리 on the roof. Park poses as a "hunter".
- Park later actually turns on his own 과장 ("farmer becomes hunter"), wins at 과장 level, and gets crushed at 부장 level.
- His 과장: "같이 살자. 아니, 좀 살려주라."
- 125: "반복에 지치지 않는 자가 성취한다".

### 2.6 The 전무's China business and the end, 127–145수 (vols 8–9)

Sources: [V-wiki: 시즌1 page 전무 entry; 장그래 page]; [V, S4 vol 9]; [V-cmt].

**The offer (127–130수).**
- 127: After Jordan, 3팀 is pulled into the **전무**'s line. The 전무 is unnamed in the webtoon; the drama calls him 최영후.
- 오차장 sees that this patronage could get Jang made a regular employee, and hesitates over the "전용선" (fast track).
- 128: The 전무, a long-time China hand, hands 3팀 a long-running **China business** with lucrative terms (readers noted the auspicious "8").
- 129: 오차장 warns 천과장 and 김대리 not to think they have "caught the golden rope" (동아줄).
- 130: 오차장 quietly keeps a paper trail ("호의 아닌 거 맞다").

**The leak (131–133수).**
- The 전무 and 오차장 talk; the 전무 shoos away Jang, who was eavesdropping.
- 오차장 investigates whether the China partner's "인사" (gifts/kickbacks) to the 전무 over the years were strategic relationship-building or plain loss to the company. Vol 9 blurb: "큰 그림을 그리기 위한 윗선의 '인사'인지… 과도한 '절'인지".
- **133: While 오차장 and the others are away, Jang takes a call from the One International representative in China (중국 주재원). He "organizes" the situation and pointedly raises 꽌시 (guanxi) practices.**
- This alarms the China side. The Chinese company tips off One International's audit department, and the nine-year business unravels.
- Jang is scolded twice: once by his senior, once by 오차장. 오차장's point: the dispute between departments is the leader's game, so Jang should focus on his own.

**Confrontation and audit (134–139수).**
- 134: 오차장 is plied with drink by the 부장 and then goes straight at the 전무.
- 135–137: It emerges that the Chinese partner had been using the 전무's ambition; One International's real profit was being skimmed. Audit; 오차장 and the 전무 face the auditors (137).
- 138: 오차장 to the crying Jang: he made a mistake out of love for the team, and "그렇긴 한데, 그걸로 끝이다." 오차장: "오늘만 후회해".
- 139: The 전무 is demoted to president of the unlisted backwater affiliate **원 글로벌 서비스**. He leaves thanking the team for ending it without fuss.
- 139 also brings HR's answer on converting a high-school-only contract worker to regular: **"아마 어려울 것 같습니다."** HR says there is no precedent and does not even search. [V-wiki; V-cmt]

**Endgame (140–145수).**
- **140:** 3팀 is now isolated, and 오차장's position is untenable. **김동수** proposes going into business together.
- 141: 오차장 deliberates (his son, fried chicken versus eel).
- 142: His wife supports him: "직원가 다량구매, 보너스 때까지는 다니기". Jang lets news of the move slip, which readers flagged as a mistake. Line: **"사람이 전부입니다."**
- **143:** **오상식 resigns.** He recruits **김부련** (who took responsibility for Park and left the alumni company) as a balancing partner; 김부련 and 김동수 are setting up the corporation. **천관웅 takes over as de facto team lead** and feels the whole company pressing on him.
- **144: Jang's 2-year contract ends.** He leaves One International without becoming a regular employee. Looking back at the building: **"돌아보니 그것은 이미 내 것이 아니라는 듯 차가워져 있었다. 인프라는 나 자신이었다."** The buildings are drawn in grey and the people in colour. "Infrastructure" refers to 오차장's earlier remark that a new company cannot use the old company's infrastructure.
- **145:** Three weeks later, **오상식's new small trading company hires Jang as a regular employee**. Interviewing the next applicant, a curly-haired job seeker whose face is not shown, they find **김동식**, who has quit too. Readers: "장그래가 먼저 왔으니 김대리가 막내네."
  - Epilogue: Jang working in Jordan, reporting to 오 부장 by phone. The caption reads "2014년 가을", which readers thought should be 2013; [?] it may be intentional.
  - 천관웅 alone stays at One International. With the new team head, who is nothing like 오상식, he calls himself "무채색" (colourless): **"가장으로서, 아빠로서, 나는 무채색이다. 그것이 나의 색깔이다."**
- Season 2 (2015–2024) names the new company **온길 인터내셔널** (president 김부련, 전무 김동수, 부장 오상식, 과장 김동식, 사원 장그래, bookkeeper 조아영).

**Ending versus the drama [V, news and namu].** The drama keeps the ending: Jang fails to convert, 오차장's new company hires him, and 김대리 joins. The drama adds:
- 김부련 being founder of "이상 네트웍스"
- 김동수 renamed 김상협, made 상무
- a **서진상** chase through Jordan (stolen phone-case samples) that bookends the first episode's cold open
- 천관웅 promoted to team head (in the webtoon he does not get the promotion)

---

## 3. Characters

### One International: 영업 3팀 (Sales Team 3, the "돌격대")

**장그래 (Jang Geu-rae).**
- Former KBA 연구생 (age 11, about 7 years), failed to turn pro, 고졸 via 검정고시. Intern, then 2-year contract worker. Calm, observant, a gambler's (승부사) focus; weak office basics.
- Exposes 박 과장, inspires the Jordan revival, and triggers the China blow-up.
- Ends S1 hired as a regular employee by 오상식's new firm.
- The name came from "Yes" (Yoon's T-shirt said Yes, giving 장예스, then 장그래); an earlier idea was "장생" (a rare eternal-life position in go). [V-wiki]
- Non-smoker.

**오상식 과장, later 차장 (Oh Sang-sik).**
- Team head; red-eyed workaholic; principled ("절차대로"); four sons; dislikes politics.
- Promoted to 차장 after the Park case. Resigns at the end and founds a company with 김부련 and 김동수.
- His namu page was unavailable; this entry is assembled from other pages and comments.

**김동식 대리 (Kim Dong-sik).**
- Jang's 사수 (direct senior). Kind, perceptive, keeps the team balanced ("천칭의 한 점").
- Knew Jang's past early and quietly tutored him. Makes the one-eye "미생" scene.
- Romance with a daycare teacher (69). First name revealed only at 117. Quits and joins 오's company at the end.

**박종식 과장.** The villain of the Jordan arc (see §2.3). Returns in S2 as a fraudster.

**천관웅 과장.** Park's replacement; career hire (drama detail); heavy drinker in poor health; "normal". The only member who stays.

### One International: management

**김부련 부장.**
- Head of the sales division over 3팀; was 오상식's own 사수 when 오 joined (drama detail [?]).
- Political and self-protective, yet says "follow procedure" against his own interest. Transferred to 원알루미늄; joins 오's venture.
- A "기러기 아빠": his wife and children live in Canada.

**The 전무.** Unnamed in the webtoon; 최영후 in the drama. China expert brought down by the China business; sent to 원 글로벌 서비스.

**The president (사장).**
- Personally promotes 오상식 and asks about the junior member at the Jordan briefing. A friend of Jang's sponsor.
- [?] The sponsor himself is never named in my sources.

**김석만 상무.** Resigns after the Park case; founds 한강무역.

**조원진, 신재민 차장.** Park's former bosses, disciplined.

**정희석 과장.** Recommended Park to 3팀, partly to sink 오상식.

**국장.** Exploded over the dropped waybill.

### Other One International employees

**고 과장 (영업 2팀; called 1팀 early on).** Friendly rival to 오상식; caused the dog-meat incident; lobbied for promotion; later helped revive the Iran–Turkey item.

**스티브 한 (Steve Han).** US-raised head of the textile team, holding 부장 status; demands efficiency.

**박종기 대리 (IT sales).** The farmer-type pushover of 17–20 and 124–126.

**강해준 대리 (철강팀).** 장백기's strict senior. Full name per namu/drama; the webtoon S1 mostly says "강 대리" [?].

**김석호.** An intern who came from another company's internship; married young with a child; strong at translation. Caused the waybill incident; hired and posted to HQ.

**Interns who were cut.** Unnamed.

### Women (names verified on namu or in book blurbs)

**안영이 (Ahn Young-yi).**
- **Intern period.** Political science graduate; top of the PT ("전체수석"). So polished that interviewers suspected a plant ("사장 딸이나 암행직원 아니지?", 30수).
- She had worked at **two other companies** and quit because she disliked being put on an executive fast-track (told to the president after hiring).
- 26수 gag: an intern keeps calling "안영이씨!" to borrow her work; she leaves with "안녕히 잘 들어갑니다~".
- **Posting.** Assigned to the **resources team (자원팀)**. Clashes with seniors over her principles; is chewed out over high heels; visits finance head 김선주 and is put in her place (39–43); patches things up with a coffee (85).
- **Her team's problems.** The 과장 is inefficient: drinks at dinner, then forces late overtime (108). The team ran a project ignoring overseas staff's schedules, routed contact through the 과장, and had no clear line of responsibility.
- **The 114–116 crisis.**
  - At a group-HQ resources meeting her proposal is adopted. This scraps the plan of resources **3팀**, which her **부장** (named 마부장 in vol 8) was backing to build his faction.
  - At lunch on the roof he chews out her and her 과장. Her 과장, about to be promoted, begs her to drop it. She withdraws her proposal and backs 3팀's.
  - 114: she gets drunk with Jang and cries face-down at the table.
  - 115: flashback. Her father is a cold army officer who favoured sons and ignored her prizes, class presidencies and student-council presidency. When he learned she was on an executive track he cared only about her salary, schemed loans using her position, and slapped her when she refused. She cut ties to keep herself, quit, and joined One International.
  - Jang tells her she is allowed to act pretty, i.e. to love herself more (115 comment).
  - 116: the 부장 is turned on in return (역관광), because he blocked something HQ had liked. Jang buys her a **necklace** after the drinking night. She wears it and he does not notice ("꼬셔놓고 관리 안 한다", 116 comment).
- **Romance.** 97수 (2013-01-18) has a flirtatious prank ("flag"). Vol 8 dialogue with 선차장: "목걸이도 하고" / "사준 애는 못 알아본다." At 144 she reappears with longer hair.
  - Yoon said on 미생 라디오 0회 that the "그래" (yes) answers someone's "안녕" (goodbye/hello), and **these are parting greetings, so the two will not end up together.**
  - In S2 she tells 조아영 that Jang is "a person I really like", who has no interest in her.

**선지영 차장 (Sun Ji-young).**
- Senior to 오상식 despite being younger; strict separation of work and private life.
- 21–22: daycare. Confronts Park's harassment of 신다인. 121–123: husband pressure, quitting rumours.

**김선주 부장.** Finance head; formidable; stands for the capable woman executive under pressure. 상무 in S2.

**신다인.** Young contract employee sexually harassed by 박 과장 [V-wiki].

**Daycare teacher.** 김동식's love interest from 69수. [?] Name not found.

**장그래's mother.** Namu infobox: 정숙희 [?, possibly S2]. Lives alone with him in 수색동, Eunpyeong-gu; irons his shirts; defends him at Chuseok.

**소미.** 선지영's daughter.

**오상식's wife.** Supportive at 142. Unnamed in my sources.

**조아영.** S2 only, the bookkeeper and Jang's later girlfriend. Not in S1.

### Fellow hires: the "입사 동기"

**한석율 (Han Seok-yul).**
- Shop-floor zealot, glib, a year older than Jang. Paired with Jang in the PT.
- Family of factory workers. Sexist banter corrected at 37–38. Buys food and drink for factory workers (49).
- Second year: a credit-stealing senior and the sabotage that ends in a 시말서 (100–102).
- [?] His department in the webtoon: probably the textile team (the drama's 섬유팀, 성 대리). In S2 he works in a team whose senior sabotages him.
- His namu page was unavailable.

**장백기 (Jang Baek-gi).**
- Best credentials on paper (economics; international trade certificate).
- Steel team; his 대리 withholds real work until he learns the basics.
- Sentence-trimming episode (97: "너는 지금 사랑받고 싶어서…" — readers noted the sentence cutting). Helped Jang dig up Park's relatives.
- A mild helper in S1. The drama turns him into a jealous elite rival (and moves him from 자원2팀 to 철강).

### Outside the company

**김동수 ("김 선배").** 오상식's former senior; pizza shop failing; offers a 촌지; "밖은 지옥" (80–83). Partner in the new firm at 140–145. Called 김상협 in the drama.

**백진무역 / ICB / 박상준.** Park's relatives' companies.

**The Jordanian ambassador.** Jordan briefing gift; invites Jang.

**The China representative (중국 주재원).** The phone call at 133. Readers mention a "석대리" [?].

**Jang's sponsor (후원자).** Unnamed.

**Jang's uncle.** Taught him baduk.

---

## 4. Key lines (short quotes, Korean, meaning)

Quotes are verbatim where marked [V]. Others are as quoted by readers in best comments [V-cmt]; the wording is close but unchecked against the book.

### Baduk and the title

- **"미생이네요."** [V-wiki] Jang, of the four-stone one-eye shape: "It's still not alive." The title line.
- **"모두에겐 자신만의 바둑이 있다."** [V-wiki] "Everyone has their own game of baduk." Jang, after 박 대리 chooses his own way (20수).
- **"묘수(꼼수)는 정수로 받는다."** [V-cmt 19] "You answer a trick move with the proper move."
- **"아무리 지는 판이라도 꼭 두고 싶은 수가 있다."** [V-wiki paraphrase] "Even in a lost game there's a move I want to play." This sets up the ICB phone clue.
- **"내가 바둑으로 성공했던가?"** [V-cmt 77] "Did I ever succeed at baduk?" Said in fear of failing again.
- **"상대가 강할 때는 기다리는 것이 시작이다."** [V-cmt 100, paraphrase] Waiting as the opening move against a strong opponent.
- **"열심히 안 한 것은 아니지만 열심히 안 해서인 걸로 생각하겠다."** [V-cmt 0; S6] "It's not that I didn't try hard, but I'll tell myself I failed because I didn't."
- **"그래도 바둑이니까. 내 바둑이니까."** [V, S6] Cho Chikun's saying, recalled by Jang. He turns it into "내 일이니까, 나에게 허락된 세상이니까."
- **"제가 밝혀야 할 불빛이 있다면 책임질 겁니다."** [V, S6; V-cmt 2] "If there's a light I must keep lit, I'll take responsibility."
- **"세상은 나보다 빠르다."** [V-cmt 7; S6] "The world is faster than I am."

### Work and life

- **"회사가 전쟁터라고? 밖은 지옥이야. 밀어낼 때까지 그만두지 마라."** [V-wiki] 김 선배: "Work is a battlefield? Outside is hell. Don't quit until they push you out."
- **"회사에 왔으면 일을 해, 게임을 하지 말고."** [V-wiki; V-cmt 72] 오차장 to 천과장: do the work, not office politics.
- **"잊지 말자. 나는 어머니의 자부심이다. 모자라고 부족한 자식이 아니다."** [V-wiki] "Don't forget: I'm my mother's pride, not a lacking son."
- **"돌아보니 그것은 이미 내 것이 아니라는 듯 차가워져 있었다. 인프라는 나 자신이었다."** [V-wiki; S4 vol 9 has "내 인프라는 나 자신이었다!"] "I myself was the infrastructure."
- **"남들한테 보이는 건 상관없어. 화려하지 않은 일이라도 우린 '필요한' 일을 하고 있으니까."** [V, S4 vol 5] It doesn't matter how it looks; ours is necessary work.
- **"판단을 그르칠 때는 징후가 있다. 지키고 싶을 때, 갖고 싶을 때, 싫을 때, 미울 때, 좋을 때…"** [V, S4 vol 9] There are signs before a bad judgment.
- **"열심히 살았지만 뭘 했는지 모를 하루, 다들 잘 보내셨습니까?"** [V, S4 vol 3] "A day lived hard yet I can't say what I did — did you all fare well?"
- **"나 하나쯤 어찌 살아도 사회는, 회사는 아무렇지도 않겠지만, 그래도 이 일이 지금의 나야."** [V, S4 vol 4] However I live, nothing changes for the company — but this work is who I am now.
- **"누가 우리를 낭만적이라 하는가. 우리는 생존 자체를 원하는 사람들이다!"** [V, Aladin vol 8] We are people who want survival itself.
- **"재미없네… 돈은 니들이 다 처먹고 난 월급이나 받아 가면 땡이냐."** [V, S6] 박 과장's grievance.
- **"평소대로만 하면… 정사원 되는 거죠?"** [V, S4 vol 6] "If I just keep doing as usual, I'll become a regular, right?"
- **"어디서 동정질이야."** [V-cmt 119] 오차장: don't pity a hard-working person.
- **"그렇긴 한데, 그걸로 끝이다."** [V-cmt 138] 오차장: understood and forgiven, and that's the end of it.
- **"같이 살자. 아니, 좀 살려주라."** [V-wiki] 박 대리's 과장: "Let's live together — no, please let me live."
- **"가장으로서, 아빠로서, 나는 무채색이다."** [V-wiki] 천관웅's closing line.
- **"밟아 보세요, 선배님. 그래 봤자 발만 아프실 거예요."** [V-wiki header quote; could be from the drama] 안영이: "Go ahead and step on me — you'll only hurt your foot."
- **"모두를 만족시키는 선택은 없다. 그 선택에 책임을 져라."** [V-cmt 17] No choice satisfies everyone; own your choice.
- **"어른인 척 하지 말고 어른답게 행동해라."** [V-cmt 34]
- **"우연은 준비가 끝난 사람에게 오는 선물이다."** [V-cmt 29, paraphrase]
- **"복사하는 거 보면 신입들 태도 딱 나온다."** [V, S6] You can read a newbie's attitude from how he photocopies.
- **"열심히 일하는 흉내를 내고 싶은 것인가."** [V-cmt 80]
- **"한 칸 한 칸 성장하다 올라선 계단 끝에 절벽이 기다리게 할 수는 없어요."** [V, S6] Jang, on a contract job that ends in a cliff.
- **"반복에 지치지 않는 자가 성취한다."** [V-cmt 125]
- **"사람이 전부입니다."** [V-cmt 142]

---

## 5. Tasks (actor, goal, obstacle, outcome)

1. **Jang (backstory).** Goal: become a pro. Obstacles: talent and luck (half-point losses), poverty, part-time jobs, father's death, mother bedridden. Outcome: fails the pro exam; works for his sponsor; is mocked for his baduk past; quits and enlists. [V]
2. **Jang (intern).** Goal: survive the internship without revealing his past. Obstacles: no degree, no jargon, a 낙하산 stigma, 한석율's bossing. Outcome: earns 오과장's and 김대리's trust. [V-wiki; V-cmt]
3. **Jang and 김석호.** Goal: get rid of 3팀's waybill. Obstacle: 김석호's glue-stick mishap drops it in the lobby. Outcome: the interns are punished; 오과장 discovers the true culprit. [V-wiki]
4. **Jang (helping 박 대리).** Goal: help Park handle a client that walks all over him. Obstacle: Park is a farmer type who inflates under praise; the client's president storms in. Outcome: Park ignores Jang's note and confesses himself; no punishment; Jang learns "everyone has their own game". [V-wiki]
5. **Jang and 안영이.** Goal: collect 선 차장's daughter from daycare. Obstacle: they are rookies; the 차장 hates asking. Outcome: done. [V-wiki]
6. **Jang and 한석율 (pair PT).** Goal: pass the final PT. Obstacles: clashing philosophies (office versus shop floor); 한석율 chokes; 안영이 outshines them. Outcome: in the individual task Jang turns 한석율 around; Jang hired only on a 2-year contract. [V-cmt; V-wiki]
7. **장백기.** Goal: get real work in the steel team. Obstacle: his 대리 withholds tasks until he learns the basics. Outcome: humbled; later reliable. [V-wiki; S4 vol 3]
8. **안영이 (first months).** Goal: get her team's plan through finance. Obstacles: finance head 김선주; seniors' resentment. Outcome: rebuffed, then a gradual truce. [V-cmt; V-wiki]
9. **오상식 and 3팀 (first items).** Goal: land a big item (Iran–Turkey crude; China rare earth via North Korea). Obstacles: the EU embargo; 김부련's self-protection; another team taking the idea. Outcome: credit lost; 오 collapses with exhaustion; 김부련 relents with dried eel and the Iran–Turkey revival. [V-cmt; V-wiki]
10. **Jang (trade literacy).** Goal: understand trade jargon and reports. Obstacles: none of the basics, a sense of shame. Outcome: 김대리's daily homework; a laminated report. [V-cmt]
11. **오상식 and Jang (박 과장).** Goal: prove 박 과장's Jordan deal is corrupt. Obstacles: Park's preparation, coached witnesses, the audit finding nothing, the bosses' own exposure. Outcome: Jang's Korean-speaker clue and the relatives' board; Park out; 김부련 transferred; 오 promoted. [V-wiki]
12. **천관웅.** Goal: establish himself in a "whistleblower" team. Obstacle: suspicion and politics. Outcome: 오's rebuke; he joins the team properly. [V-wiki]
13. **Jang and 3팀 (Jordan revival).** Goal: revive the used-car export. Obstacles: its tainted origin; executive scepticism; the need to "shake the board" at the last rehearsal. Outcome: the president approves; Jang is credited, then reminded he is a contract worker. [V; S4 vol 5–6]
14. **김동수.** Goal: save his pizza shop or win back old clients. Obstacles: big-mart competition; 오's integrity (refuses the envelope). Outcome: referred to 한강무역. [V-wiki]
15. **Jang (₩100,000 mission).** Goal: buy goods and sell them at a profit. Obstacles: no sales skill; he goes to the KBA for sympathy sales. Outcome: rebuked; fails; learns to face the door. [V-cmt; V-wiki]
16. **한석율.** Goal: stop a credit-stealing senior. Obstacle: the senior's position. Outcome: his file-deletion trick backfires; 시말서. [V, S4 vol 7]
17. **Jang (new-business proposal).** Goal: write a professional proposal. Obstacle: hides behind jargon. Outcome: called "헛똑똑이"; rejected; reports back to everyone who helped. [V; V-cmt]
18. **안영이 (HQ proposal).** Goal: keep her winning proposal. Obstacles: her 부장's faction and his backing of resources 3팀, her 과장's promotion. Outcome: forced to withdraw; drinks and cries with Jang; the 부장 later falls. [V-wiki]
19. **선지영.** Goal: keep her career. Obstacle: her husband's wish that she quit, and office gossip. Outcome: stays; the household is renegotiated; the rumours persist. [V-wiki]
20. **박 대리 (second time).** Goal: assert himself. Obstacle: his 과장 and 부장. Outcome: wins one rung, loses at the next; plea for coexistence. [V-wiki]
21. **오상식 (China business).** Goal: run the 전무's China business without being made the scapegoat, while using the patronage to get Jang made regular. Obstacles: the opacity of the 전무's guanxi; pressure from the 부장 and 전무. Outcome: Jang's phone call triggers the Chinese side's tip-off; audit; the 전무 is demoted; 3팀 is shunned. [V-wiki; S4 vol 9]
22. **Jang (regular status).** Goal: convert to a regular employee. Obstacles: high-school-only education, no precedent, the 2-year contract law, 3팀's fall. Outcome: impossible; the contract ends. [V-wiki]
23. **오상식 and 김동수.** Goal: start a new company. Obstacles: family risk; losing the big-company infrastructure. Outcome: founded with 김부련; hires Jang and then 김동식. [V-wiki]
24. **천관웅.** Goal: stay and lead the remains of 3팀. Obstacle: a new team head unlike 오. Outcome: stays as "무채색". [V-wiki]

---

## 6. Open items

Things to verify in the books (vols 1–9) if you need them exact:
- the exact objects in the individual PT
- 한석율's department
- the identity of the daycare teacher
- the first-day memorial site
- the epilogue year caption
- whether the line "밟아 보세요, 선배님" is webtoon or drama
- the venue of the 1989 game
- the source URL of the SGF

The Daum originals are now paid on KakaoWebtoon/KakaoPage (content 47968772 for season 1).
