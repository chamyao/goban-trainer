# Book 14 (Lü Bu's fall, 白门楼): final play-through report

On main 29ee30dd, with my fixes on claude/tk-playtest.

## The walk
- **Player mode** (`PLAYTEST_LIVE=1 BOOK=14`, the game's test mode off, each board solved as a solve is reported): 20/20 beats, 18 boards, 6.6 min.
- **Jade on iPhone 13 and desktop** (test mode): 20/20 each.
- **Leads** (who is free to walk each beat): x1 lvbu > x8 zhangliao > x9 lvbu > x10 chengong > x11 lvbu > x12 chendeng > x13 lvbu > x15 yanshi > x16 lvbu > x19 houcheng > x20 caocao. x18 starts by itself.
- **Red Hare:** his from x1. Ridden outdoors in x2-x7, x13, x14, x16 and x17, and through the flood in x17. Taken in x19; nobody rides him in x20.
- **The daughter (lvnv)** is on Lü Bu's back on the open map from x15's end, and in x16's scene.
- **States:** x4 xuzhou moon; x14 locked; x16 xiapi siege; x17 flood1; x19 flood2 and night; x20 taken.
- **Stealth:** Xiao Pass (x12) 12 s; Xiapi (x19) 13 s, after Places' fix (38bdfdb1).

## book14-world.js (18/18, in run.sh)
- **Xuzhou's gates:** none shut at x2. At x4 the west gate alone is shut and the east gate is open. From x14 all four are shut. Each is drawn shut, stops him and says its line.
- **Xiapi's night gates (x19):** the south and west gates are shut, with the same checks.
- **Flood water by state:** off and hidden under siege; flood1; flood2; gone once the city is taken. In flood2 the stables and the residence can be reached on Red Hare but not on foot.

## Fixed on the way (tk-world.js)
- **easeRoute:** a crash on points that lie exactly in line when the straight way is blocked. It stopped Book 14 loading at x14.
- **Book 2 hands on to Book 3:** a handoff to a beat already done no longer restarts the scene. a18's own `{"to": "a18"}` had skipped the end of the book. `book-handoff-12.js` covers it: Book 2 says "On to Book 3…", the page moves on to #/tk/14, and Book 14's opening scroll and world come up.

## Screenshots (Jade)
- **Portraits** (`portraits-phone.png`, `portraits-desktop.png`): 17 speakers, 15 painted, among them Lü Bu, Liu Bei, Chen Gong, Zhang Fei, Ji Ling, Lady Yan, Chen Gui, Chen Deng, Mi Zhu, Diaochan, Hou Cheng, Song Xian, Wei Xu, Cao Cao and Zhang Liao.
  - On the phone each stands on the box's top edge with head and shoulders clear. On desktop each is at the box's left end. No text is covered.
  - The Farmer and the Soldier keep the pixel bust, as in the other books.
- **Places** (`places-phone.png`, `places-desktop.png`): the 15 places, each as he's first free to walk it.
- **Note:** `xiao-pass-night-phone.png`. Xiao Pass at night (x12) is near black on the phone; the place name shows, but the road and the goal hardly do.

## The prologue (x0a "Left Behind", x0b "Hidden": Lady Yan in burning Chang'an)
- **prologue.js** (player mode, 9/9):
  - a new player's Book 3 opens with the Chapter 9 briefing;
  - x0b has 3 covers and 2 looters;
  - keeping still in each cover she is hidden, and stays hidden while looter-east looks right at her;
  - out of cover into his sight she's caught ("There! A woman and a girl!…") and returned exactly to that cover.
- **Full player-mode walk from x0a:** 22/22. The walker's planner now counts keeping still in cover as safe. Its last steps to Pang Shu's door are untimed and can be seen: a catch costs time, not the beat.
- **Screenshots** (`prologue-phone.png`, `prologue-desktop.png`): Chang'an under the sack (night, smoke), Lü Bu's house with yan_left, and Pang Shu's house with yan_hidden.
  - The prologue is all narration, so there are no speaker portraits; Pang Shu appears as his sprite.

## The burning ward (changan--burning-ward, after Places' visible-covers fix)
`ward-phone.png`, `ward-desktop.png`, left to right: the way in, hidden in a cover while a looter looks at her, caught.
- **prologue.js:** 16/16 in player mode. There are 10 covers (6 in the lanes, 1 at each way in) and 6 looters. She's hidden in every cover, and stays hidden while a looter looks right at her. Stepping out, she's caught and returned to that cover.
- **Covers are drawn now.** Each one is a pale ring on the paving, and every way in has one, so she's no longer caught standing at the way in.
- **The walker:** x0b still fails. Its prediction of what the looters see is accurate, but it doesn't follow its own plan well: she drifts from the planned cells and overshoots by up to about 40 px. This is a test-tool problem, not a game bug.
