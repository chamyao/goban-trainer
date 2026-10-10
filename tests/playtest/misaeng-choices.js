// Misaeng's record boards as multiple choice (tk-modern.js choices/labels), as a player meets them, on desktop and phones:
// for every record board in the book (TK.world(BOOK).nodes, read from the game): four letters A-D on four empty points,
// exactly one of them Cho Hunhyun's move (the SGF, read here); the letters big enough to read; a tap off the letters plays
// nothing; a wrong letter is a slip, and after the rest the same four points come back under the same letters; the right
// letter (a tap, or its key on a desktop) clears the board; the lead's portrait sits behind a full 19x19 board.
// Screenshots: out/misaeng-choices-<device>-<key>.png. PLAYTEST_DEVICES picks devices (default desktop, iPhone 13, iPhone SE).
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.PLAYTEST_URL || 'http://localhost:8765', BOOK = +(process.env.BOOK || 21);
const DEVS = (process.env.PLAYTEST_DEVICES || 'desktop,iPhone 13,iPhone SE').split(',').map(s => s.trim());
let fails = 0, notes = 0;
const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); };
const note = w => { notes++; console.log('NOTE ' + w); };
const sgf = fs.readFileSync(path.join(__dirname, '../../docs/book2/misaeng-ing-cup-g5.sgf'), 'utf8');
const MOVES = [...sgf.matchAll(/;\s*([BW])\[([a-s]{2})\]/g)].map(m => [m[1], m[2]]);

async function run(b, dev) {
  const opts = dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] }, touch = !!opts.hasTouch;
  const ctx = await b.newContext(opts), p = await ctx.newPage(), tag = dev.replace(/\s+/g, '').toLowerCase();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.goto(BASE + '/index.html#/tk/' + BOOK); await p.waitForTimeout(800);
  // the record boards in the book, and the story cleared up to the first of them, standing in the tower's lobby
  const recs = await p.evaluate(async n => { await TK.load(); const w = TK.world(n), out = [];
    for (const nd of w.nodes) [].concat(nd.record == null ? [] : nd.record).forEach((r, i) => { if (Number.isInteger(r)) out.push({ node: nd.key, idx: i, move: r, choices: !!(nd.choices && (nd.choices[r] || nd.choices[String(r)])) }); });
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
    localStorage.setItem('tk-guide', 'off'); localStorage.setItem('gt-username', 'playtest-choices'); TK.markSeen(n + ':opening');
    for (const nd of w.nodes) TK.markCleared(nd.key);   // every board open (a board is opened directly below)
    localStorage.setItem(`tk-world-${n}`, JSON.stringify({ place: 'one-international', party: ['ms_jang'] }));
    return out; }, BOOK);
  await p.reload();
  for (let i = 0; i < 60 && !(await p.evaluate(() => !!(window.__w && window.__w.player))); i++) { const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(250); }
  for (let i = 0; i < 20 && await p.evaluate(() => window.__w.ui.busy()); i++) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(200); }
  // a desktop page asks for a first click on the map ("Click the map to play"): give it, as a player does
  if (!touch) { const r = await p.evaluate(() => { const c = document.querySelector('.tk-map canvas').getBoundingClientRect(); return [c.left + c.width / 2, c.top + c.height - 40]; }); await p.mouse.click(r[0], r[1]); await p.waitForTimeout(400); }
  const vw = await p.evaluate(() => innerWidth), vh = await p.evaluate(() => innerHeight);
  console.log(`--- ${dev} (${vw}x${vh}${touch ? ', touch' : ''}): ${recs.length} record boards`);
  for (const r of recs) {
    const key = r.idx ? `${r.node}~${r.idx + 1}` : r.node, [col, right] = MOVES[r.move - 1], name = `${r.node}${r.idx ? ' board ' + (r.idx + 1) : ''} (Black ${r.move})`;
    if (!r.choices) { note(`${name}: no candidates, an open board`); continue; }
    const open = async () => { await p.evaluate(k => { const pr = loadProgress(); TK.undoCleared(pr, k); TK.saveProg(pr); localStorage.removeItem('tk-rest'); }, key);   // not cleared, no rest: as a player meets it
      await p.evaluate(([n, k]) => { TKOverlay.open(n, k, { host: document.querySelector('.tk-map') }); }, [BOOK, key]);   // (not awaited: it settles when the board closes)
      for (let i = 0; i < 40 && !(await p.evaluate(() => !!(window.__trainer && window.__trainer.alive && document.querySelector('.tk-choice')))); i++) await p.waitForTimeout(150);
      await p.waitForTimeout(400); };
    const letters = () => p.evaluate(() => { const t = window.__trainer, g = t.goban;
      return [...document.querySelectorAll('.tk-choice')].map(e => { const c = e.querySelector('circle'), tx = e.querySelector('text'), R = c.getBoundingClientRect(), T = tx.getBoundingClientRect();
        const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'); let pt = null;
        for (let x = 0; x < 19 && !pt; x++) for (let y = 0; y < 19 && !pt; y++) if (g.px(x) === cx && g.py(y) === cy) pt = String.fromCharCode(97 + x) + String.fromCharCode(97 + y);
        return { L: tx.textContent, pt, x: R.left + R.width / 2, y: R.top + R.height / 2, d: R.width, fh: T.height, empty: pt ? !t.grid[pt.charCodeAt(1) - 97][pt.charCodeAt(0) - 97] : false }; }).sort((a, b) => a.L.localeCompare(b.L)); });
    const dbg = async tag => { if (process.env.DBG) console.log('   dbg', tag, JSON.stringify(await p.evaluate(() => { const t = window.__trainer; return t && { played: t.played, ghost: t.goban.ghost, done: t.done, alive: t.alive, only: t.p.only, rest: !!document.querySelector('.tk-rest'), verdict: (document.querySelector('.tk-duel-dlg .town-en') || {}).textContent }; }))); };
    const tapAt = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await p.waitForTimeout(250); await dbg('after 1st click at ' + Math.round(x) + ',' + Math.round(y)); if (process.env.DBG) await p.screenshot({ path: path.join(__dirname, `out/dbg-${tag}-${key.replace("~","_")}-${Math.round(y)}.png`) });
      if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); } await p.waitForTimeout(700); };
    const state = () => p.evaluate(k => ({ cleared: TK.cleared(k), rest: TK.restLeft(k) > 0, played: window.__trainer ? window.__trainer.played.length : -1 }), key);
    await open();
    const L1 = await letters();
    await p.screenshot({ path: path.join(__dirname, `out/misaeng-choices-${tag}-${key.replace('~', '_')}.png`) });
    check(L1.length === 4 && L1.map(l => l.L).join('') === 'ABCD' && new Set(L1.map(l => l.pt)).size === 4 && L1.every(l => l.empty),
      `${name}: four letters A-D on four empty points (${L1.map(l => l.L + '=' + l.pt).join(' ')})`);
    check(L1.filter(l => l.pt === right).length === 1 && col === 'B', `${name}: exactly one letter is Cho's move ${right}`);
    const minFont = Math.min(...L1.map(l => l.fh)), minDisc = Math.min(...L1.map(l => l.d));
    if (minFont < 8) note(`${name}: letters are ${minFont.toFixed(1)} px tall on screen`); else check(true, `${name}: letters readable (${minFont.toFixed(1)} px, discs ${minDisc.toFixed(0)} px)`);
    // the portrait behind the full board: what's on top at a letter is the board, not a portrait
    const top = await p.evaluate(L => L.map(l => { const e = document.elementFromPoint(l.x, l.y); return e ? (e.closest('svg') ? 'board' : (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className) || e.tagName) : 'none'; }), L1);
    check(top.every(t => t === 'board'), `${name}: every letter can be tapped, nothing over the board (${top.join(', ')})`);
    // a tap off the letters plays nothing
    const off = await p.evaluate(L => { const t = window.__trainer, g = t.goban, used = new Set(L.map(l => l.pt));
      for (let y = 3; y < 16; y++) for (let x = 3; x < 16; x++) { const pt = String.fromCharCode(97 + x) + String.fromCharCode(97 + y); if (!used.has(pt) && !t.grid[y][x]) {
        const el = [...g.svg.querySelectorAll('circle[fill="transparent"]')].find(e => +e.getAttribute('cx') === g.px(x) && +e.getAttribute('cy') === g.py(y)); if (el) { const R = el.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2, pt }; } } } return null; }, L1);
    if (off && !process.env.SKIPOFF) { await tapAt(off.x, off.y); const s = await state(); check(s.played === 0 && !s.cleared && !s.rest, `${name}: a tap off the letters (${off.pt}) plays nothing`); }
    // a wrong letter: a slip; then the same four, under the same letters
    const wrong = L1.find(l => l.pt !== right);
    await tapAt(wrong.x, wrong.y);
    let s = await state(); check(!s.cleared && (s.rest || s.played > 0), `${name}: the wrong letter ${wrong.L} (${wrong.pt}) doesn't clear it (${JSON.stringify(s)})`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await open();
    const L2 = await letters();
    check(JSON.stringify(L2.map(l => l.L + l.pt)) === JSON.stringify(L1.map(l => l.L + l.pt)), `${name}: after a slip the same four come back (${L2.map(l => l.L + '=' + l.pt).join(' ')})`);
    // the right letter: by its key on a desktop, by a tap on a phone
    const good = L2.find(l => l.pt === right);
    if (!touch) { await p.keyboard.press(good.L.toLowerCase()); await p.waitForTimeout(250); if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) await p.keyboard.press(good.L.toLowerCase()); await p.waitForTimeout(800); }
    else await tapAt(good.x, good.y);
    s = await state(); check(s.cleared, `${name}: the right letter ${good.L} (${touch ? 'a tap' : 'its key'}) clears the board`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelectorAll('.tk-duel-full, .tk-duel').forEach(e => e.closest('.tk-duel-full') ? e.closest('.tk-duel-full').remove() : e.remove())).catch(() => {});
  }
  await ctx.close();
}
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  for (const d of DEVS) { try { await run(b, d); } catch (e) { fails++; console.log(`FAIL ${d}: ${e.message.split('\n')[0]}`); } }
  await b.close();
  console.log(fails ? `misaeng-choices: ${fails} failed, ${notes} notes` : `misaeng-choices: all ok, ${notes} notes`);
})();
