// Red Chamber (world 31), phone, taps: the book's 18 boards, each opened as the world opens them (TKOverlay, the
// overlay over the game), with what comes before it cleared. Each: the board is drawn, its caption (Chinese above
// English) is the one the design gives, the decider's own opening line plays (Daiyu for d2-d7, Granny Liu for g2-g6),
// g6 is the boss board, and its taunt doesn't take Granny Liu's own lines; solving by tapping the key's moves gives the decider's win line and a Continue.
// d7's second board (the jade) is solvable like any other: the story goes wrong after it, not on it. One slip (d3)
// gives its slip line, the smile behind a sleeve, and the 30 s rest, and the tally of smiles counts it; a slip on the
// jade board (d7~2) or in Part 2 (g2) is not counted. d1, d6a, d8, g1, g7 have no board.
// Runs without the world's maps (data/tk_maps/w31): the boards open from the book page.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
// the 18 captions of design.md, in order (the English; the Chinese is checked against the story data)
const CAPTIONS = [
  ['31-d2', 'Find your grandmother among them.'], ['31-d3', 'What do I call her?'], ['31-d4', 'Decline the dinner, kindly.'],
  ['31-d5', 'Read the seats.'], ['31-d5~2', 'Not my uncle\'s place.'], ['31-d5~3', 'Answer her warning.'],
  ['31-d6', 'The seat of honour?'], ['31-d6~2', 'When to drink the tea.'], ['31-d6~3', 'Tell her what you\'ve read.'],
  ['31-d7', 'Have you studied?'], ['31-d7~2', 'Have you a jade?'],
  ['31-g2', 'Get past the men on the bench.'], ['31-g3', 'Which Zhou Da-niang?'], ['31-g4', 'Say why you came, without saying it.'],
  ['31-g5', 'Greet her.'], ['31-g6', 'Say it.'], ['31-g6~2', 'Nowhere to hide.'], ['31-g6~3', 'Ask her.'],
];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ ...devices[process.env.PLAYTEST_DEVICE || 'iPhone 13'] })).newPage();
  let fails = 0; const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
  p.on('pageerror', e => console.log('ERR', e.message, '@', (String(e.stack).split('\n')[1] || '').trim()));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const URL = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  // a plain page of the site (the Library), so nothing of the book's own page is in the way
  await p.goto(URL + '#/'); await p.waitForTimeout(1500);
  await p.evaluate(async () => { await TK.load(); localStorage.setItem('tk-guide', 'off'); localStorage.removeItem('tk-tally'); });
  // the boards the story data has: one per ["problem"] step
  const data = await p.evaluate(() => {
    const w = TK.world(31); if (!w) return null;
    return w.nodes.map(n => {
      const steps = (w.scenes[n.scene] || {}).steps || [], k = steps.filter(s => s[0] === 'problem').length;
      const dils = [].concat(n.dilemma || []);
      return { key: n.key, role: n.role, boards: k, dils };
    });
  });
  if (!check(!!data, 'world 31 is in the story data')) { await b.close(); process.exit(1); }
  const boards = [];
  for (const n of data) for (let i = 1; i <= n.boards; i++) boards.push({ key: i === 1 ? n.key : `${n.key}~${i}`, base: n.key, role: n.role, dil: n.dils[Math.min(i - 1, n.dils.length - 1)] });
  check(boards.length === 18, `18 boards in the story (${boards.length}: ${boards.map(x => x.key.replace('31-', '')).join(' ')})`);
  const none = data.filter(n => !n.boards).map(n => n.key.replace('31-', ''));
  check(JSON.stringify(none) === JSON.stringify(['d1', 'd6a', 'd8', 'g1', 'g7']), `d1, d6a, d8, g1, g7 have no board (${none.join(' ')})`);
  check(JSON.stringify(boards.map(x => x.key)) === JSON.stringify(CAPTIONS.map(c => c[0])), 'the boards are where the design puts them');
  for (const x of boards) check(x.dil && x.dil.q_zh && x.dil.open && x.dil.win && x.dil.slip, `${x.key}: a caption in both languages and the decider's open, win and slip lines`);

  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const bestMove = () => p.evaluate(() => {
    const t = window.__trainer; if (!t || t.done || t.engineBusy || t.explore) return null;
    const n = t.played.length; if (n % 2) return null; const memo = new Map(); const open = L => L.length - 1 > n && t.played.every((m, i) => m === L[i + 1]);
    const moves = [...new Set([...t.p.lines.filter(L => L[0] === 1 && open(L)), ...t.p.lines.filter(L => L[0] === 2 && open(L))].map(L => L[n + 1]))]; if (!moves.length) return null;
    const best = moves.find(m => t.outcome([...t.played, m], memo) === 'ok') || moves[0]; const c = best.charCodeAt(0) - 97, r = best.charCodeAt(1) - 97;
    const el = [...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e => +e.getAttribute('cx') === t.goban.px(c) && +e.getAttribute('cy') === t.goban.py(r));
    if (!el) return { miss: best }; const R = el.getBoundingClientRect(); return { m: best, x: R.left + R.width / 2, y: R.top + R.height / 2 };
  });
  // a point that is no first move of any line: a slip
  const wrongMove = () => p.evaluate(() => {
    const t = window.__trainer; if (!t) return null; const firsts = new Set(t.p.lines.map(L => L[1]));
    for (const el of t.goban.svg.querySelectorAll('circle[fill="transparent"]')) {
      const c = Math.round((+el.getAttribute('cx') - t.goban.px(0)) / (t.goban.px(1) - t.goban.px(0))), r = Math.round((+el.getAttribute('cy') - t.goban.py(0)) / (t.goban.py(1) - t.goban.py(0)));
      const m = String.fromCharCode(97 + c) + String.fromCharCode(97 + r);
      if (firsts.has(m) || (t.stones && t.stones[m])) continue;
      const R = el.getBoundingClientRect(); if (R.width) return { m, x: R.left + R.width / 2, y: R.top + R.height / 2 };
    }
    return null;
  });
  const txt = sel => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const tapAt = async m => { await p.touchscreen.tap(m.x, m.y); if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) await p.touchscreen.tap(m.x, m.y); };

  for (const x of boards.filter(x => !only || only.some(o => x.key.endsWith(o)))) {
    const name = x.key.replace('31-', '');
    await p.evaluate(k => {
      for (const s of Object.keys(localStorage)) if (/^tk-(progress|seen|rest|at)/.test(s)) localStorage.removeItem(s);
      const w = TK.world(31), seen = new Set(), st = w.edges.filter(e => e[1] === k).map(e => e[0]);
      while (st.length) { const q = st.pop(); if (seen.has(q)) continue; seen.add(q); TK.markCleared(q); st.push(...w.edges.filter(e => e[1] === q).map(e => e[0])); }
    }, x.base);
    p.evaluate(k => { window.__ov = TKOverlay.open(31, k).then(w => (window.__ovWon = w)); window.__ovWon = undefined; }, x.key);
    let up = false;
    for (let i = 0; i < 60 && !up; i++) { await p.waitForTimeout(200); up = await p.evaluate(() => !!(document.querySelector('.tk-duel svg') && window.__trainer && window.__trainer.goban)); }
    if (!check(up, `${name}: the board opens`)) { await p.keyboard.press('Escape'); await p.waitForTimeout(500); continue; }
    await p.waitForTimeout(400);
    const cap = await txt('.tk-duel-dilemma'), want = CAPTIONS.find(c => c[0] === x.key)[1];
    check(cap.includes(want) && cap.includes(x.dil.q_zh), `${name}: caption 「${x.dil.q_zh}」 ${want} (shown: ${cap || 'none'})`);
    const vis = await p.evaluate(() => { const e = document.querySelector('.tk-duel-dilemma'); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight; });
    check(vis, `${name}: the caption is on screen`);
    const en = await txt('.tk-duel-dlg .town-en'), who = await txt('.tk-duel-dlg .town-who');
    check(en === x.dil.open, `${name}: ${x.dil.who === 'daiyu' ? 'Daiyu' : 'Granny Liu'}'s opening line (${en})`);
    if (x.role === 'boss') {
      const tab = await txt('.tk-duel-dlg .town-tab');
      // (the speaker's name comes from the world's foe, which the world passes and this test doesn't)
      check(/首领|Boss/.test(tab), `${name}: the boss board (${tab})`);
    }
    if (['d3', 'd7~2', 'g2'].includes(name)) {   // one slip: the smile behind a sleeve, and the rest
      const t0 = await p.evaluate(() => TKTally.count(TK.world(31)));
      const w = await wrongMove();
      if (check(!!w, `${name}: a wrong point to tap`)) {
        await tapAt(w); await p.waitForTimeout(1200);
        const s = await txt('.tk-duel-dlg .town-en');
        check(s === x.dil.slip, `${name}: a slip gives its smile: "${s}"`);
        await p.waitForTimeout(2500);
        const rest = await p.evaluate(k => TK.restLeft(k), x.key);
        check(rest > 20000, `${name}: then the 30 s rest (${Math.round(rest / 1000)} s left)`);
        const t1 = await p.evaluate(() => TKTally.count(TK.world(31))), counted = name === 'd3';
        check(t1 - t0 === (counted ? 1 : 0), `${name}: the tally of smiles ${counted ? 'counts the slip' : 'does not count it'} (${t0} → ${t1})`);
        await p.evaluate(() => { const d = TK.ls('tk-rest'); for (const k in d) d[k] = Date.now() - 1; TK.lsSet('tk-rest', d); });
        await p.keyboard.press('Escape'); await p.waitForTimeout(600);
        p.evaluate(k => { window.__ov = TKOverlay.open(31, k).then(w => (window.__ovWon = w)); window.__ovWon = undefined; }, x.key);
        for (let i = 0; i < 40 && !(await p.evaluate(() => !!(document.querySelector('.tk-duel svg') && window.__trainer))); i++) await p.waitForTimeout(200);
        await p.waitForTimeout(400);
        check((await txt('.tk-duel-dilemma')).includes(want), `${name}: the caption is back on the board after the slip`);
      }
    }
    // solve by taps
    let won = false;
    for (let i = 0; i < 40 && !won; i++) {
      won = await p.evaluate(() => !!document.querySelector('.tk-duel-go'));
      if (won) break;
      const m = await bestMove();
      if (m && m.x) { await tapAt(m); await p.waitForTimeout(900); }
      else if (m && m.miss) { check(false, `${name}: the key's move ${m.miss} is not on the board as shown`); break; }
      else await p.waitForTimeout(500);
    }
    const wl = await txt('.tk-duel-dlg .town-en');
    check(won && wl.startsWith(x.dil.win), `${name}: solved by taps, the win line: "${wl}"`);
    if (won) {
      await p.locator('.tk-duel-go').first().tap(); await p.waitForTimeout(800);
      check(await p.evaluate(() => window.__ovWon === true && !document.querySelector('.tk-duel')), `${name}: Continue closes the board, counted as won`);
    } else { await p.keyboard.press('Escape'); await p.waitForTimeout(600); }
    if (name === 'd7~2') check(x.dil.win === 'I answer as well as anyone could.', 'd7~2, the jade: solvable, and her answer is right (the story goes wrong after it)');
  }
  console.log(fails ? `${fails} FAIL` : 'all ok'); await b.close(); process.exit(fails ? 1 : 0);
})();
