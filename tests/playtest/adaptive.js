// Adaptive difficulty (TKElo; apo110: an Elo rating from first-try results picks the boards). Phone, test mode, Book 12.
//  - Adaptive is the default (tk-diff unset); the menu's 难度 button cycles Adaptive → Easy → Hard; the rating starts at
//    700 (14K) and lives in the synced progress (gt-progress tkElo).
//  - A simulated player of a fixed strength, 200 boards: the rating settles near the strength, and the share solved
//    first try is near the user's target of 3/4 (picks ~190 below the rating).
//  - A board's problem is fixed once seen: the same slot asked again (after the rating moved) is the same problem.
//  - Only a board's first result counts, through the real result handler: a win (no slip, no hint) moves it up, a
//    flawed solve or a loss moves it down, a second result on the same board doesn't move it.
//  - The rating survives a reload and a trip to another book; Easy and Hard draw from their pools and leave it alone.
//  - Bosses: the user's target is 1/2 first try, picked by the rating (checked as asked).
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ ...devices['iPhone 13'] })).newPage();
  let fails = 0, checked = 0; const check = (ok, what) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + what); return ok; };
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  const ready = async () => { for (let i = 0; i < 100; i++) {
    const c = p.getByText('Cancel', { exact: true }); if (await c.count() && await c.first().isVisible()) await c.first().tap().catch(() => {});
    const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) { await g.first().tap().catch(() => {}); continue; }
    if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break; await p.waitForTimeout(200); }
    for (let i = 0; i < 30 && await p.evaluate(() => window.__w.ui.busy()); i++) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(120); } };
  // a fresh save at a beat of Book 12 (the main beats before it cleared), the difficulty left as given
  const fresh = async (stop, diff) => { await p.goto(BASE + '#/'); await p.evaluate(([stop, diff]) => {
      for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '12'); if (diff) localStorage.setItem('tk-diff', diff); }, [stop, diff]);
    await p.evaluate(stop => TK.load().then(() => { const w = TK.world(12), ks = w.nodes.map(n => n.key), i = ks.indexOf(stop);
      for (const [j, n] of w.nodes.entries()) if (j < i && !['side', 'short'].includes(n.role)) TK.markCleared(n.key); TK.markSeen('12:opening'); }), stop);
    await p.goto(BASE + '#/tk/12'); await p.reload(); await ready(); };
  const elo = () => p.evaluate(() => { const s = TKElo.state(); return { r: s.r, n: s.n, label: TKElo.label(), mode: TK.mode, stored: !!(JSON.parse(localStorage.getItem('gt-progress') || '{}').tkElo) }; });

  // 1. the default, the start, the menu
  await fresh('12-a9');
  let e = await elo();
  check(e.mode === 'adaptive' && e.r === 700 && /^14K/.test(e.label), `a new player is on Adaptive at 700 (${e.label}) (mode ${e.mode}, rating ${e.r})`);
  const btn = () => p.locator('.tk-menu-panel button', { hasText: '难度' });
  await p.locator('.tk-menu-btn', { hasText: 'Menu' }).tap(); await p.waitForTimeout(400);
  const seen = [];
  for (let i = 0; i < 4 && await btn().count(); i++) { seen.push((await btn().first().textContent()).replace(/\s+/g, ' ').trim()); await btn().first().tap(); await p.waitForTimeout(300); }
  check(seen.length === 4 && /Adaptive.*14K/.test(seen[0]) && /Easy/.test(seen[1]) && /Hard/.test(seen[2]) && /Adaptive/.test(seen[3]), `the menu's difficulty button cycles Adaptive → Easy → Hard → Adaptive (${seen.join(' | ')})`);
  await p.keyboard.press('Escape').catch(() => {}); await p.evaluate(() => localStorage.removeItem('tk-diff'));

  // 2. a simulated player: 200 boards at a fixed strength (the result as the game reports it, through TKElo.result)
  for (const T of [1100, 1600]) {
    const sim = await p.evaluate(T => { const w = TK.world(12), node = w.nodes.find(n => n.key === '12-a9'), p0 = loadProgress(); p0.tkElo = { r: 700, n: 0, used: [], slots: {} }; TK.saveProg(p0);
      let wins = 0, late = 0, lateN = 0, gaps = []; const trace = [];
      for (let i = 0; i < 200; i++) {
        const ref = TKElo.pick(w, `sim~${T}~${i}`), x = w.rated.find(y => y[0] === ref[0] && y[1] === ref[1]), R = TKElo.of(x[2]);
        const r0 = TKElo.rating, win = Math.random() < 1 / (1 + Math.pow(10, (R - T) / 400));
        TKElo.result(w, node, ref, win); if (win) wins++; if (i >= 100) { lateN++; if (win) late++; gaps.push(r0 - R); }
        if (i % 25 === 24) trace.push(TKElo.rating);
      }
      return { r: TKElo.rating, rate: late / lateN, gap: Math.round(gaps.reduce((a, c) => a + c, 0) / gaps.length), trace, maxR: TKElo.of(Math.max(...w.rated.map(x => x[2]))) };
    }, T);
    check(Math.abs(sim.r - T) <= 200, `a player of true strength ${T}: the rating settles near it (${sim.r} after 200 boards; every 25: ${sim.trace.join(' ')})`);
    check(sim.rate >= 0.68 && sim.rate <= 0.82, `…and solves about 3/4 first try, the user's target (boards 100-200: ${Math.round(sim.rate * 100)}%; picks average ${sim.gap} below the rating, the target ~190)`);
  }
  await p.evaluate(() => { const p0 = loadProgress(); p0.tkElo = { r: 700, n: 0, used: [], slots: {} }; TK.saveProg(p0); });

  // 3. through the real board: the problem fixed once seen; only the first result counts
  await fresh('12-a9');
  const openBoard = async key => { await p.evaluate(k => { window.__w.duel(k); }, key);   /* not awaited: it settles when the board ends */ let id = null;   // the problem's id, from its source link once the board is up
    for (let i = 0; i < 60 && id == null; i++) { await p.waitForTimeout(200); id = await p.evaluate(() => { const a = document.querySelector('.tk-duel svg') && document.querySelector('.tk-duel-src a'), m = a && a.href.match(/\/q\/(\d+)/); return m ? +m[1] : null; }); }
    return id; };
  const leave = async () => { await p.locator('.tk-duel-keys button', { hasText: 'Leave' }).first().tap().catch(() => {}); await p.waitForTimeout(800); await ready(); };
  const result = (ok, flaw) => p.evaluate(([ok, flaw]) => { const t = window.__trainer; if (t) t.flawed = flaw; dispatchEvent(new CustomEvent('tczw:result', { detail: ok ? 'ok' : 'fail' })); }, [ok, flaw]);
  const id1 = await openBoard('12-a9'); await leave();
  const id2 = await openBoard('12-a9');
  check(id1 && id1 === id2, `the beat's board, opened twice, is the same problem (${id1}, ${id2})`);
  const r0 = (await elo()).r; await result(true, null); await p.waitForTimeout(300); const r1 = (await elo()).r;
  await result(false, null); await p.waitForTimeout(300); const r2 = (await elo()).r;
  check(r1 > r0 && r2 === r1, `a first-try solve moves it up (${r0} → ${r1}); a second result on the same board doesn't (${r2})`);
  await p.locator('.tk-duel-go').first().tap().catch(() => {}); await p.waitForTimeout(800); await ready();
  // the rating has moved: the board seen keeps its problem
  await p.evaluate(() => { const p0 = loadProgress(); p0.tkElo.r = 1500; TK.saveProg(p0); });
  const id3 = await p.evaluate(() => { const w = TK.world(12), n = w.nodes.find(n => n.key === '12-a9'), d = TK.ls('tk-draw'); return TKElo.pick(w, `12-a9~0~${d['12-a9'] || 0}`)[1]; });
  check(id3 === id1, `after the rating moves (to 1500), the board already seen is still the same problem (${id1} → ${id3})`);
  // a flawed solve (a hint) is a loss
  await p.evaluate(() => { const p0 = loadProgress(); p0.tkElo.r = 900; TK.saveProg(p0); });
  const idB = await openBoard('12-a9~2'); const s0 = (await elo()).r; await result(true, 'a hint'); await p.waitForTimeout(300); const s1 = (await elo()).r;
  check(s1 < s0, `a solve with a hint counts as a miss: the rating goes down (${s0} → ${s1})`);
  await leave();

  // 4. it lasts: a reload, another book and back
  const before = (await elo()).r; await p.reload(); await ready(); const afterReload = (await elo()).r;
  await p.goto(BASE + '#/tk/1'); await p.waitForTimeout(1500); await p.goto(BASE + '#/tk/12'); await p.waitForTimeout(1500); await ready(); const afterBook = (await elo()).r;
  check(before === afterReload && before === afterBook && (await elo()).stored, `the rating survives a reload and a trip to Book 1 (${before}, ${afterReload}, ${afterBook}), kept in the synced progress`);

  // 5. Easy and Hard: their pools, the rating left alone
  for (const m of ['easy', 'hard']) {
    await p.evaluate(m => localStorage.setItem('tk-diff', m), m);
    const r = await p.evaluate(m => { const w = TK.world(12), n = TK.node(w, '12-a9'), ref = TK.problemRef(n), pool = (m === 'easy' && n.pool_easy && n.pool_easy.length ? n.pool_easy : n.pool).map(x => x[1]);
      const r0 = TKElo.rating; TKElo.result(w, n, ref, true); return { inPool: pool.includes(ref[1]), moved: TKElo.rating !== r0 }; }, m);
    check(r.inPool && !r.moved, `on ${m[0].toUpperCase() + m.slice(1)}, a beat's board comes from its ${m === 'easy' ? 'easy ' : ''}pool and a win doesn't move the rating`);
  }
  await p.evaluate(() => localStorage.removeItem('tk-diff'));

  // 6. bosses: as the user asked, picked by the rating for 1/2 first try (the boss board at two ratings)
  const boss = await p.evaluate(() => { const w = TK.world(12), n = w.nodes.find(n => n.role === 'boss'); const p0 = loadProgress(), d = TK.ls('tk-draw');
    const at = r => { p0.tkElo.r = r; p0.tkElo.slots = {}; TK.saveProg(p0); d[n.key] = (d[n.key] || 0) + 1; TK.lsSet('tk-draw', d); const ref = TK.problemRef(n), x = (w.rated || []).find(y => y[0] === ref[0] && y[1] === ref[1]); return x ? TKElo.of(x[2]) : null; };
    const lo = at(700), hi = at(1800); const r0 = TKElo.rating; TKElo.result(w, n, TK.problemRef(n), true); return { key: n.key, lo, hi, moved: TKElo.rating !== r0 }; });
  check(boss.lo != null && boss.hi != null && Math.abs(boss.lo - 700) <= 100 && Math.abs(boss.hi - 1800) <= 100, `the boss (${boss.key}) is picked at the player's rating, for 1/2 first try (at 700: ${boss.lo ?? 'its own pool'}; at 1800: ${boss.hi ?? 'its own pool'})`);
  check(boss.moved, `the boss's result moves the rating (moved: ${boss.moved})`);

  console.log(`adaptive: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
