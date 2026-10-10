# Gameplay tests (Three Kingdoms campaign)

Headless browser tests that play the campaign the way a person does: mostly on an
emulated iPhone 13 by taps (tap and click are the main controls), some on a desktop
window. They need Node with Playwright installed globally and a Chromium
(`PLAYWRIGHT_BROWSERS_PATH` already set in the cloud containers).

    tests/playtest/run.sh                    # everything (the playthrough takes ~10 min)
    tests/playtest/run.sh playthrough        # one or more by name
    PLAYTEST_URL=http://localhost:8766 tests/playtest/run.sh tap-duel   # another local copy
    PLAYTEST_KIT=jade tests/playtest/run.sh door-taps side-stories     # another art kit (jade, ninja, xianxia; default: the game's)

`run.sh` serves the repo on :8765 if nothing is there, writes each test's output to
`out/<name>.log` (screenshots to `out/*.png`), and prints `ok` or `FAIL` per test.
A test fails when it exits non-zero or its log has a page error (`ERR …`), an
exception, a timeout or a `FAIL` line.

Phaser is served from `vendor/phaser.min.js` (the page normally loads it from a CDN
the container may not reach). Audio is stubbed out.

Tests drive the game through what a player can do (taps on the canvas, the menu,
the board) and read state from `window.__w` (the world scene), `window.__trainer`
(the board) and `TK` (progress). Some set progress directly (`TK.markCleared`) or
move Liu Bei (`__w.player.setPosition`) to reach a beat quickly; the playthrough
starts from a fresh save.

| test | what it checks |
| --- | --- |
| playthrough | fresh save, phone: all 15 main story beats by taps (scene, mid-scene problem, scene after), the book completes |
| ending | the last stretch: boss, the "Yellow Turbans Fall" scroll, Anxi hostel (ax1), the post (ax2), book complete |
| book15-places | Book 15's maps in the engine: the loud town spreads by itself from Qiao Guolao's steward to Lady Wu's gate and s4 plays; the three axemen rooms each deliver their mark and open s5's gate (a monk's room doesn't); both face-downs yield when faced and catch back to their own start (Places) |
| hlm-library | Red Chamber (world 31) has its own Library card in test mode (none outside it); the card opens its book list, Red Chamber books only; the Three Kingdoms card and list never show or open a Red Chamber book |
| hlm-opening | Red Chamber, phone, fresh save, from the Library card by taps: the book's line names chapters 1–6; the opening scroll "Chapters 1 and 2" (the stone, the tears, Daiyu sent for, the empty frame, "You are Lin Daiyu"), Chinese above English, turned by a tap, once; then the book starts at d1 with no page error (in the walkable world once data/tk_maps/w31 is in, else the book page) |
| hlm-boards | Red Chamber, phone: its 18 boards (d2–d7, g2–g6, where the design puts them; none at d1, d6a, d8, g1, g7) opened as the world opens them: the caption in both languages, the decider's own opening line, g6 the boss board without its taunt taking Granny Liu's lines; solved by taps, her win line and Continue; the jade (d7~2) solvable; one slip (d3) gives its smile and the 30 s rest and adds one to the tally of smiles; a slip on the jade board or in Part 2 adds none. `ONLY=d3,g6` for some |
| hlm-walk | Red Chamber, the whole book on a phone by taps from a fresh save (~10 min): every beat d1 … g7 in order, Daiyu leads Part 1 and Granny Liu (with Ban'er) Part 2 across the "Chapters 4 and 5" scroll, the d8 day's-end scroll with no smiles, the jade board solved and the jade hurled down after it, g6's three boss boards in Granny Liu's own lines, 18 story boards, the book complete; prints each beat's time |
| hlm-tally | Red Chamber's tally of smiles: a wrong move on a counted Part 1 board adds one (not the jade board, Part 2, or another book); the d8 scroll says none, or the count; the Three Kingdoms books have none |
| hlm-watch | Red Chamber in its world (31): Watch the room offered where the open beat is (not elsewhere, not in a Three Kingdoms book); a look gives each cue in turn with its giver on screen; d5's wait cue only on the second look; Granny Liu's first look at g5 is her dazzle; d8's scene brings the day's-end tally scroll |
| hlm-street | Red Chamber's street (world 31): g3's goal marker leads by its via points (the west lane's mouth, its top) and then to the spot; people here until g2 are gone once it is won and refreshStory doesn't bring them back |
| tap-move-talk | tap the ground → walks there; tap a person → walks up and talks; taps advance and end the dialogue |
| tap-duel | phone: tap a challenger, the duel opens full-screen; tap to preview where points are under 28 px apart (first tap a ghost and no move, a tap elsewhere moves it, a second tap plays), else one tap plays; ghosts on wrong points are never a slip; the menu's Confirm taps: Never plays on one tap; Leave by tap. PLAYTEST_DEVICE picks the device |
| doors-and-exits | walk out of Lousang by taps; tap a building to go in; tap the doorway to leave; tap the road off the map edge |
| tap-after-talk | (arg: place) talk to every villager, then tap the ground around Liu Bei in four directions: he must move every time |
| scene-arming | a scene doesn't start as you arrive; it starts after walking in (room and outdoor map) |
| spot-reach | every story spot can be reached on foot to within its trigger radius (36 px) |
| spot-tap-once | tap a story spot: its scene plays once; after it he doesn't walk on and set the spot off again |
| door-taps | phone: a tap on the road in front of or beside a building's door walks there; a tap on the building goes in (Lousang, Zhuo County), with the villagers left to wander |
| framing | phone portrait and landscape: a room or map smaller than the screen sits centred, no empty band; the brothers stand beside Liu Bei on arrival, not on him |
| challengers | phone: every challenger in book 1 by taps: talk, duel, solve on the board, Continue; then cleared, "!" gone, talking again gives their after-words |
| side-stories | phone: each side story and the shortcut (a1-a3, b1, b2, b2g, f1, b3, bs): tap its spot, tap through, solve by tapping the board, cleared |
| menu | phone: every menu button on screen; voice zh/en/off and music toggle and are remembered; the art switch cycles every kit keeping place and progress; Chronicle opens, closes, replays the Prologue; Map goes to the overworld; Start over asks (Cancel keeps, OK forgets); taps still move him after. NOTE lines are feel notes, not failures |
| old-saves | phone: saves an older version could leave (beats added since, a place renamed, a position in a wall or off the map, an unknown kit or hero, corrupt JSON, a finished book) all load into a real place, on open ground, with a sensible goal, and he moves |
| rotate-leave | phone: turn sideways and back mid-scene and mid-problem (dialogue, board and taps stay usable); Leave a story problem halfway: not cleared, goal still on it, the spot plays again. (Fails until the problem re-lays out on rotation: tk.js picks the stacked full-screen layout once, at open.) |
| blackwind | phone, taps, no teleports inside the stretch: the 10 checks of docs/mechanics-spec.md §8 (on claude/game-design): first try at n7 with no board, shrine dark/lit/settled, givers once, ridges in either order, delivering by talking to Zhang Fei and Guan Yu (one blood isn't enough), Yangcheng gated (bossearly, bossearly2, then the board; a slip holds it 30 s), supplies gone after the win, Start over, a dark shrine elsewhere; no hero shown twice (follower and NPC); and the time for each leg |
| test-mode | ?test=1 (kept in localStorage tk-test) gives problems a Skip (test) key that wins them; none without it; ?test=0 turns it off |
| room-cast | phone: through each room's story scene (Zhuo inn and office, Julu house, Lu Zhi's tent, Anxi hostel) every hero stays on screen and on the floor (not inside furniture or a wall), and the cutscene's Skip button can be tapped (nothing on top of it). arg: one room |
| keyboard | desktop by keys: Enter turns the opening scrolls and moves scenes and talks on; WASD and arrows walk; E talks; in a problem U undoes, R resets, H hints, Escape leaves, Enter continues after a win; a road the story hasn't opened stops him; walking off an open edge goes on |
| window-sizes | iPhone SE both ways, a folded phone (280x653), a tablet both ways, a short (1280x500) and a wide (1920x600) desktop: the game fills a phone and fits a desktop window; goal line, Menu and every menu button on screen; a talk's box and a problem's board and keys on screen. NOTEs: letterboxing, board points closer than 28 px |
| hud-exits | phone upright: with Liu Bei walked up to each way off the edge of every map, part of it is on screen with a finger's room from the screen edge, the goal line and every button |
| scene-scrolls | every story scroll inside a scene (Books 1 and 2) is shown when the scene plays (fails while Book 1's Chapter 2, after the inspector is spared, is dropped) |
| tap-reach | iPhone 13 and SE: taps up to about 18 px off a person or 20-30 px off a story spot's object pick it; no Tap label; open story spots glow (gold main, blue side, never shrines); a tap on the goal line walks him there; a beat before a scene starts |
| star-lords | peach garden: the two immortals stay through the problem, vanish the moment it is won, the narration follows |
| go-table-ogs | the 9×9 go table with a stand-in OGS socket: sit, search sent, opponent walks in, live board, move, resign, leave |
| drag-and-hover | desktop: hand cursor over people; hold-and-drag steers |
| full-window | the game fills the screen (phone portrait/landscape, desktop) and resizes |
| rest-after-slip | a wrong move resets the problem and holds the board 30 s without covering it |
| duel-desktop | desktop duel overlay; Escape leaves; you can move again |
| wukong-guide | the menu has no guide switch; Wukong appears only after standing still a while; nothing of his is drawn over a story scroll |
| play-tab | the site's Play tab still loads |

Tools, not in the default run: `node tests/playtest/spacing.js "iPhone SE"` measures board point spacing for every pool problem of Books 1 and 2 as the problem overlay shows it (share under 28 px and 24 px); `node tests/playtest/book-run.js 2` plays a whole book on the phone by taps and times each beat.

Red Chamber quick check (after each Integration push on claude/integration-redchamber), with the Three Kingdoms books unchanged:
`tests/playtest/run.sh live-books test-mode fresh-build problem-counts map-entries room-spots kit-default tap-move-talk doors-12 hlm-library hlm-opening hlm-boards hlm-watch hlm-tally redchamber-places`, and `hlm-walk` when the maps or story change.

Known gaps: no test for a real OGS game, real audio, or the Android app (APK).
