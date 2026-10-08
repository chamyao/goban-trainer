// The chase out of Luoyang (Book 13, c16 → c17), on the real data: Places' four riders (rider-market, rider-lane,
// rider-west, rider-gate: beats and pauses), the chase's start spot xf-gate, Plot's lines on 13-c17. Desktop, test mode.
//  1. Up the east lane at a gallop: rider-lane catches him and a one-try board opens; failing it fades and restarts
//     the chase at xf-gate with every rider back home (and c17 still to play).
//  2. The east lane again: caught again, a board again; solving it drops rider-lane for the run.
//  3. A fresh run by the market cut (Places' slip route: up the market's east edge while the market rider's back is
//     turned, then along the main street while the gate rider is away west): to the East Gate without a catch.
//  4. The East Gate's own beat (c17) still plays: its board, and c17 cleared.
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ viewport: { width: 1200, height: 800 } })).newPage();
  let fails = 0, checked = 0; const check = (ok, w) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  const T = 16, tile = (x, y) => ({ x: x * T, y: y * T }), cell = (cx, cy) => tile(cx * 4 + 1.5, cy * 4 + 1.5);   // Places' plan cells (4 tiles) to pixels
  // the story at c17 (all before it done), in Luoyang
  const fresh = async () => {
    await p.goto(BASE + '#/'); await p.evaluate(async () => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '13'); localStorage.setItem('gt-username', 'chase');
      await TK.load(); const w = TK.world(13); let party = null;   // what the beats before c17 leave: cleared, the party (Cao Cao), the items (the Chancellor's horse, from c16's end)
      for (const n of w.nodes) { if (n.key === '13-c17') break; TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene];
        for (const st of (sc && sc.steps) || []) { if (st[0] === 'party') party = st[1]; if (st[0] === 'item' || st[0] === 'gain') WorldItems.add(w, st[1]); } }
      TK.markSeen('13:opening'); if (party) TK.setParty(w, party); });
    await p.goto(BASE + '#/tk/13'); await p.reload();
    for (let i = 0; i < 120; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click().catch(() => {});
      if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break; await p.waitForTimeout(250); }
    await quiet();
    await p.evaluate(() => { const w = window.__w; w.leaving = false; w.cine = null; if (w.placeId !== 'luoyang') w.go('luoyang'); }); await p.waitForTimeout(2500); await quiet();
    // start where the chase starts (xf-gate), as a restart puts him
    await p.evaluate(() => { const w = window.__w, s = w.spots['xf-gate']; w.walk = null; w.player.body.reset(s.x, s.y + 18); });
    await p.waitForTimeout(300);
  };
  const quiet = async () => { for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => { const w = window.__w; return w && { busy: w.ui.busy(), cine: !!w.cine, duel: !!document.querySelector('.tk-duel svg') }; }); if (s && !s.busy && !s.cine && !s.duel) return; if (s && s.busy && !s.duel) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(200); } };
  const state = () => p.evaluate(() => { const w = window.__w, C = w.chase; return { P: [Math.round(w.player.x), Math.round(w.player.y)], place: w.placeId, on: !!w.chaseNow(), tries: C ? C.tries : null,
    dropped: C ? [...C.dropped] : [], engaged: !!w.engaged, busy: w.ui.busy(), duel: !!document.querySelector('.tk-duel svg'), key: window.__boardKey || null, c17: TK.cleared('13-c17'),
    riders: w.npcs.filter(n => n.rider).map(n => ({ id: n.id, x: Math.round(n.spr.x), y: Math.round(n.spr.y), hx: Math.round(n.home.x), hy: Math.round(n.home.y), vis: n.spr.visible, hunting: !!n.rider.hunting, dir: n.dir, v: Math.round(n.spr.body.velocity.length()) })) }; });
  await p.evaluate(() => {}).catch(() => {});
  const hookBoard = () => p.evaluate(() => { if (TKOverlay.__hooked) return; const o = TKOverlay.open.bind(TKOverlay); TKOverlay.open = (n, key, at) => { window.__boardKey = key; (window.__boards = window.__boards || []).push(key); window.__boardOnce = !!(at && at.once); return o(n, key, at); }; TKOverlay.__hooked = true; });
  // ride a route (pixel waypoints) at a gallop; stop on a catch (a board) or at the end. spotted lines are tapped through
  let huntV = 0;   // the fastest a hunting rider was seen riding
  const ride = async (pts, opts = {}) => {
    for (const q of pts) {
      if (opts.before) await opts.before(q);
      await p.evaluate(q => window.__w.walkTo(q.x, q.y, { ring: false }), q);
      for (let i = 0; i < 80; i++) { await p.waitForTimeout(150);
        const s = await state(); for (const x of s.riders) if (x.hunting) huntV = Math.max(huntV, x.v);
        if (s.duel && /~/.test(s.key || '')) return { caught: true, s };
        if (s.duel) return { caught: false, board: s.key, s };   // the gate's own board: he got there
        if (s.busy && !s.engaged) await p.evaluate(() => window.__w.ui.advance());   // the "spotted" line, tapped through as he rides
        if (s.engaged && s.busy) await p.evaluate(() => window.__w.ui.advance());     // the "caught" line: on to the board
        const at = await p.evaluate(q => { const w = window.__w; return !w.walk && Math.hypot(w.player.x - q.x, w.player.y - q.y) < 10; }, q);
        if (at) break; }
    }
    for (let i = 0; i < 20; i++) { const s = await state(); if (s.duel) return { caught: /~/.test(s.key || ''), board: s.key, s }; await p.waitForTimeout(150); }
    return { caught: false, s: await state() };
  };
  const result = async ok => { await p.waitForTimeout(800); await p.evaluate(ok => { if (window.__trainer) window.__trainer.flawed = null; dispatchEvent(new CustomEvent('tczw:result', { detail: ok ? 'ok' : 'fail' })); }, ok);
    await p.waitForTimeout(600); await p.locator('.tk-duel .tk-duel-go').first().click().catch(() => {}); await p.waitForTimeout(1800); await quiet(); };
  const eastLane = [cell(19, 12), cell(19, 8)];

  // 1-2. the east lane: caught; fail → restart; caught again; solve → that rider drops out
  await fresh(); await hookBoard();
  let s0 = await state();
  const mounted = await p.evaluate(() => (window.__w.mounts || []).map(m => `${m.who}:${m.coat}`));
  check(mounted.includes('caocao:black'), `outdoors in Luoyang he rides the Chancellor's horse (${mounted.join(', ') || 'on foot'})`);
  check(s0.on && s0.riders.length === 4, `the chase is on in Luoyang after c16, with Places' four riders (${s0.riders.map(r => r.id).join(', ')})`);
  let r = await ride(eastLane);
  check(r.caught && /^13-c17~2\d$/.test(r.s.key || '') && await p.evaluate(() => window.__boardOnce), `up the east lane at a gallop: caught, and a one-try board opens (${r.s.key}; once ${await p.evaluate(() => window.__boardOnce)})`);
  check(huntV >= 125 && huntV <= 140, `a hunting rider keeps four-fifths of his mounted pace: ${huntV} px/s (132 against 165)`);
  const by = (r.s.riders.find(x => x.hunting) || {}).id;
  // fail it, and look the moment the restart lands (the riders set off again at once)
  let s1 = null; const xf0 = await p.evaluate(() => { const s = window.__w.spots['xf-gate']; return [s.x, s.y]; });
  if (r.caught) { await p.waitForTimeout(800); await p.evaluate(() => { if (window.__trainer) window.__trainer.flawed = null; dispatchEvent(new CustomEvent('tczw:result', { detail: 'fail' })); });
    await p.waitForTimeout(600); await p.locator('.tk-duel .tk-duel-go').first().click().catch(() => {});
    for (let i = 0; i < 100; i++) { const s = await state(); if (s.tries === 1 && Math.hypot(s.P[0] - xf0[0], s.P[1] - xf0[1] - 18) < 4) { s1 = s; break; } await p.waitForTimeout(50); }   // (the riders stand still while the restart line shows)
    await quiet(); }
  s1 = s1 || await state(); const xf = await p.evaluate(() => { const s = window.__w.spots['xf-gate']; return [Math.round(s.x), Math.round(s.y)]; });
  const home = s1.riders.every(x => Math.hypot(x.x - x.hx, x.y - x.hy) < 3 && !x.hunting && x.vis);
  check(s1.tries === 1 && Math.abs(s1.P[0] - xf[0]) < 4 && Math.abs(s1.P[1] - (xf[1] + 18)) < 4 && home && !s1.c17, `failing it restarts the chase at xf-gate ${xf} (he's at ${s1.P}), every rider back home (${home}), c17 still to play`);
  await p.evaluate(() => { window.__boardKey = null; });
  r = await ride(eastLane);
  const by2 = (r.s.riders.find(x => x.hunting) || {}).id;
  check(r.caught, `the east lane again: caught again (${by2 || by}), a board again (${r.s.key})`);
  if (r.caught) await result(true);
  let s2 = await state(); const gone = s2.riders.find(x => x.id === (by2 || 'rider-lane'));
  check(s2.dropped.includes(by2 || 'rider-lane') && gone && !gone.vis && !s2.c17, `solving it drops ${by2 || 'rider-lane'} for the run (dropped: ${s2.dropped.join(', ')}; visible: ${gone && gone.vis}); c17 still to play`);

  // 3. a fresh run by the market cut, timed against the market rider and the gate rider
  await fresh(); await hookBoard();
  const rider = (s, id) => s.riders.find(x => x.id === id);
  const waitFor = async (why, ok, ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await state(); if (ok(s)) return true; await p.waitForTimeout(100); } const s = await state(); console.log(`     (waited ${ms / 1000} s for ${why}; he's at ${s.P}, busy ${s.busy}, engaged ${s.engaged}; ${s.riders.map(r => `${r.id} ${r.x},${r.y} ${r.dir}${r.hunting ? ' hunting' : ''}`).join('; ')})`); return false; };
  const market = [cell(17, 12), cell(17, 9), cell(18, 9), cell(18, 8), cell(19, 8)];
  // a careful rider: set off on a stretch only when, by the riders' beats as the engine rides them (42 px/s, their pauses,
  // a 55° cone of their cone's tiles or the 2-tile ring; walls ignored, so on the safe side), nobody will see him on it,
  // nor while he waits at its end for the next 3 s. Places' checker proves such timings exist; this finds one live.
  const installSafe = () => p.evaluate(() => { window.__safe = (from, pts, hold) => {
    const w = window.__w, T = 16, cos = Math.cos(Math.PI * 55 / 180), dt = 50, V = 110 * (w.mounts && w.mounts.length ? WorldItems.SPEED : 1);   // his pace, mounted or not
    let path = [from]; for (const q of pts) { const a = path[path.length - 1], f = w.findPath(a.x, a.y, q.x, q.y) || [a, q]; path.push(...f.slice(1), q); }
    const me = [];   // where he is, every 50 ms: galloping the path, then holding at its end
    let cur = { ...path[0] }, i = 1; while (i < path.length) { let left = V * dt / 1000; while (left > 0 && i < path.length) { const q = path[i], d = Math.hypot(q.x - cur.x, q.y - cur.y); if (d <= left) { cur = { ...q }; left -= d; i++; } else { cur.x += (q.x - cur.x) / d * left; cur.y += (q.y - cur.y) / d * left; left = 0; } } me.push({ ...cur }); }
    for (let k = 0; k < (hold || 0) / dt; k++) me.push({ ...cur });
    for (const n of w.npcs) { if (!n.rider || !n.spr.visible) continue; const R = n.rider; if (R.hunting) return false;
      const r = { x: n.spr.x, y: n.spr.y, leg: R.leg, wait: R.wait || 0, dir: n.dir };
      for (const P of me) {
        if (r.wait > 0) r.wait -= dt; else { const tg = R.pts[r.leg % R.pts.length], dx = tg.x - r.x, dy = tg.y - r.y, d = Math.hypot(dx, dy), v = 42 * dt / 1000;
          if (d < 3) { const c = (R.beat || [])[r.leg % R.pts.length], pz = R.pause; if (pz && c && c[0] === pz[0] && c[1] === pz[1]) r.wait = (pz[2] || 2) * 1000; r.leg++; }
          else { const m = Math.min(v, d); r.x += dx / d * m; r.y += dy / d * m; r.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); } }
        const look = R.pts.length > 1 ? r.dir : R.dir, [fx, fy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[look] || [0, 1];
        const dx = P.x - r.x, dy = P.y - r.y, d = Math.hypot(dx, dy);
        if (d < R.cone * T + 10 && ((dx * fx + dy * fy) / (d || 1) > cos - .08 || d < 2 * T + 10)) return false; } }
    return true; }; });
  await installSafe();
  const safe = (pts, hold) => p.evaluate(([pts, hold]) => { const w = window.__w; return window.__safe({ x: w.player.x, y: w.player.y }, pts, hold); }, [pts, hold]);
  let tries = 0, cut = null, waited = 0;
  for (; tries < 3 && !(cut && !cut.caught); tries++) {
    if (tries) { await fresh(); await hookBoard(); await installSafe(); }
    let k = 0; cut = null; const r0 = (await state()).riders;
    while (k < market.length && !cut) {
      // the whole rest of the way if it's clear, else the next stretch with a safe wait at its end
      const t0 = Date.now(); let go = 0;
      while (!go && Date.now() - t0 < 60000) { if (await safe(market.slice(k), 0)) go = market.length - k; else if (await safe([market[k]], 3000)) go = 1; else await p.waitForTimeout(100); }
      waited += Date.now() - t0;
      if (!go) { const s = await state(); console.log(`     no clear stretch from ${s.P} in 60 s; going anyway`); go = 1; }
      const r = await ride(market.slice(k, k + go)); k += go;
      if (r.caught) cut = r; else if (k >= market.length) cut = r;
    }
    if (!cut.caught) { const r1 = cut.s.riders, moved = r1.filter(x => { const o = r0.find(y => y.id === x.id); return o && Math.hypot(x.x - o.x, x.y - o.y) > 8; }).length;
      cut.live = moved >= 2; cut.spotted = await p.evaluate(() => !!(window.__w.chase && window.__w.chase.spotTalked)); cut.moved = moved; }
    if (cut.caught) { console.log(`     try ${tries + 1}: caught at ${cut.s.P} (${(cut.s.riders.find(x => x.hunting) || {}).id})`); await result(true); }
  }
  console.log(`     (waited ${(waited / 1000).toFixed(1)} s in all for clear stretches)`);
  check(cut && !cut.caught && cut.live && !cut.spotted, `by the market cut, timed: to the East Gate unseen (not spotted: ${cut && !cut.spotted}; ${cut && cut.moved} riders riding meanwhile; ${tries} ${tries === 1 ? 'try' : 'tries'}; at ${cut && cut.s.P})`);

  // 4. the gate's own beat still plays: its board (Skip in test mode), c17 cleared
  let c17board = false, c17 = false;
  const boards = () => p.evaluate(() => window.__boards || []);
  for (let i = 0; i < 120 && !c17; i++) { await p.waitForTimeout(250);
    const s = await state(); if (s.duel && s.key === '13-c17') { c17board = true; await p.locator('.tk-duel-keys button', { hasText: 'Skip' }).first().click().catch(() => {}); await p.waitForTimeout(600); await p.locator('.tk-duel .tk-duel-go').first().click().catch(() => {}); }
    else if (s.busy) await p.evaluate(() => window.__w.ui.advance());
    else if (!s.duel && !s.busy && i % 8 === 0) await p.evaluate(() => { const w = window.__w, sp = Object.values(w.spots).find(x => x.node === '13-c17'); if (sp) w.walkTo(sp.x, sp.y + 12, { ring: false }); });
    c17 = s.c17; }
  c17board = c17board || (await boards()).includes('13-c17');
  check(c17board && c17, `at the East Gate the c17 beat plays: its board (${c17board}), and c17 is cleared (${c17})`);
  console.log(`chase: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
