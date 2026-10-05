# Gameplay tests (Three Kingdoms campaign)

Headless browser tests that play the campaign the way a person does: mostly on an
emulated iPhone 13 by taps (tap and click are the main controls), some on a desktop
window. They need Node with Playwright installed globally and a Chromium
(`PLAYWRIGHT_BROWSERS_PATH` already set in the cloud containers).

    tests/playtest/run.sh                    # everything (the playthrough takes ~10 min)
    tests/playtest/run.sh playthrough        # one or more by name
    PLAYTEST_URL=http://localhost:8766 tests/playtest/run.sh tap-duel   # another local copy

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
| tap-move-talk | tap the ground → walks there; tap a person → walks up and talks; taps advance and end the dialogue |
| tap-duel | phone: tap a challenger, the duel opens full-screen, a tap places a stone, Leave by tap |
| doors-and-exits | walk out of Lousang by taps; tap a building to go in; tap the doorway to leave; tap the road off the map edge |
| tap-after-talk | (arg: place) talk to every villager, then tap the ground around Liu Bei in four directions: he must move every time |
| scene-arming | a scene doesn't start as you arrive; it starts after walking in (room and outdoor map) |
| spot-reach | every story spot can be reached on foot to within its trigger radius (36 px) |
| spot-tap-once | tap a story spot: its scene plays once; after it he doesn't walk on and set the spot off again |
| door-taps | phone: a tap on the road in front of or beside a building's door walks there; a tap on the building goes in (Lousang, Zhuo County) |
| framing | phone portrait and landscape: a room or map smaller than the screen sits centred, no empty band; the brothers stand beside Liu Bei on arrival, not on him |
| challengers | phone: every challenger in book 1 by taps: talk, duel, solve on the board, Continue; then cleared, "!" gone, talking again gives their after-words |
| side-stories | phone: each side story and the shortcut (a1-a3, b1, b2, b2g, f1, b3, bs): tap its spot, tap through, solve by tapping the board, cleared |
| menu | phone: every menu button on screen; voice zh/en/off and music toggle and are remembered; the art switch cycles every kit keeping place and progress; Chronicle opens, closes, replays the Prologue; Map goes to the overworld; Start over asks (Cancel keeps, OK forgets); taps still move him after. NOTE lines are feel notes, not failures |
| old-saves | phone: saves an older version could leave (beats added since, a place renamed, a position in a wall or off the map, an unknown kit or hero, corrupt JSON, a finished book) all load into a real place, on open ground, with a sensible goal, and he moves |
| rotate-leave | phone: turn sideways and back mid-scene and mid-problem (dialogue, board and taps stay usable); Leave a story problem halfway: not cleared, goal still on it, the spot plays again. (Fails until the problem re-lays out on rotation: tk.js picks the stacked full-screen layout once, at open.) |
| star-lords | peach garden: the two immortals stay through the problem, vanish the moment it is won, the narration follows |
| go-table-ogs | the 9×9 go table with a stand-in OGS socket: sit, search sent, opponent walks in, live board, move, resign, leave |
| drag-and-hover | desktop: hand cursor over people; hold-and-drag steers |
| full-window | the game fills the screen (phone portrait/landscape, desktop) and resizes |
| rest-after-slip | a wrong move resets the problem and holds the board 30 s without covering it |
| duel-desktop | desktop duel overlay; Escape leaves; you can move again |
| wukong-guide | the menu has no guide switch; Wukong appears only after standing still a while |
| play-tab | the site's Play tab still loads |

Known gaps: no test for a real OGS game, real audio, or the Android app (APK).
