// Blockers hold their roads (apo110: declined every battle on the escape ride and rode straight through). Book 13's
// four guards (gate-guard at the palace, the pickets at the camps, the post-guard and the ferryman on the east road),
// each at the beat that has him there, mounted where the story is: from where the game puts him on arriving, ride for
// the far side of the guard point (the entry farthest away) and decline the board (Leave), three times over, the last
// straight back at it with no pause. Each time he must be stopped again, set down out of the guard's reach on the side
// he came from, never inside a wall, and free to ride on. Then a win: the blocker stands aside and the way is open.
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
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1', T = 16;
  const BLOCKERS = [['luoyang--palace', 'gate-guard', '13-c3'], ['the-camps', 'pickets', '13-c9'], ['the-east-road', 'post-guard', '13-c18'], ['the-east-road', 'ferryman', '13-c18']]
    .filter(([, id]) => !process.env.ONLY || process.env.ONLY.split(',').includes(id));
  const quiet = async () => { for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => { const w = window.__w; return w && { busy: w.ui.busy(), cine: !!w.cine, duel: !!document.querySelector('.tk-duel svg') }; }); if (s && !s.busy && !s.cine && !s.duel) return; if (s && s.busy && !s.duel) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(200); } };
  // the story at node K (all before it played: cleared, its party, its items), in the place
  const setup = async (K, place) => {
    await p.goto(BASE + '#/'); await p.evaluate(async K => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '13'); localStorage.setItem('gt-username', 'blockers');
      await TK.load(); const w = TK.world(13); let party = null;
      for (const n of w.nodes) { if (n.key === K) break; if (!['side', 'short'].includes(n.role)) TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene];
        for (const st of (sc && sc.steps) || []) { if (st[0] === 'party') party = st[1]; if (st[0] === 'item' || st[0] === 'gain') WorldItems.add(w, st[1]); } }
      TK.markSeen('13:opening'); if (party) TK.setParty(w, party); }, K);
    await p.goto(BASE + '#/tk/13'); await p.reload();
    for (let i = 0; i < 120; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 1000 }).catch(() => {});
      if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break; await p.waitForTimeout(250); }
    await quiet();
    await p.evaluate(place => { const w = window.__w; w.leaving = false; w.cine = null; if (w.placeId !== place) w.go(place); }, place);
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (await p.evaluate(place => { const w = window.__w; return w && w.placeId === place && w.player && !w.leaving; }, place)) break; }
    await p.waitForTimeout(800); await quiet();
    await p.evaluate(() => { const o = TKOverlay.open.bind(TKOverlay); TKOverlay.open = (n, key, at) => { window.__boardKey = key; return o(n, key, at); }; });
  };
  const at = () => p.evaluate(() => { const w = window.__w, G = w.walkGrid(), P = w.player;
    return { x: Math.round(P.x), y: Math.round(P.y), free: G.free(Math.floor(P.x / G.C), Math.floor(P.y / G.C)), engaged: !!w.engaged, busy: w.ui.busy(), duel: !!document.querySelector('.tk-duel svg'),
      mounted: (w.mounts || []).filter(m => m.horse && m.horse.visible).map(m => m.who).join(','), key: window.__boardKey || null }; });
  // ride for a point; stop when a board opens (stopped) or when he's there or stuck
  const rideFor = async q => {
    await p.evaluate(q => window.__w.walkTo(q.x, q.y, { ring: false }), q); let last = null, still = 0;
    for (let i = 0; i < 200; i++) { await p.waitForTimeout(100);
      const s = await at(); if (s.duel) return { stopped: true, s };
      if (s.busy) await p.evaluate(() => window.__w.ui.advance());   // his call, tapped through on the way to his board
      if (Math.hypot(s.x - q.x, s.y - q.y) < 12) return { stopped: false, there: true, s };
      if (last && Math.hypot(s.x - last.x, s.y - last.y) < 1 && !s.busy && !s.engaged) { if (++still > 15) return { stopped: false, s }; } else still = 0; last = s; }
    return { stopped: false, s: await at() };
  };
  const leave = async () => { await p.waitForTimeout(500); await p.locator('.tk-duel-keys button', { hasText: 'Leave' }).first().click().catch(() => {});
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); const s = await at(); if (!s.duel && !s.engaged) break; if (s.busy && !s.duel) await p.evaluate(() => window.__w.ui.advance()); }
    await quiet(); };

  let prev = null;
  for (const [place, id, K] of BLOCKERS) {
    if (!(prev && prev.place === place && prev.K === K && prev.beaten)) await setup(K, place);   // the ferryman is past the post-guard: on from where that left him
    prev = { place, K, beaten: false };
    const g = await p.evaluate(id => { const w = window.__w, n = w.npcs.find(n => n.id === id); return n && n.guard && { gx: n.guard.x, gy: n.guard.y, vis: n.spr.visible, key: n.challenge,
      entries: Object.entries(w.entries).map(([k, e]) => ({ k, x: e.x, y: e.y })) }; }, id);
    if (!check(g && g.vis, `${id} (${place}, at ${K}): on his post with a guard point (${g ? `${g.gx},${g.gy}` : 'none'})`)) continue;
    const s0 = await at();
    // the far side: the entry farthest from where he came in, if the road there runs past the guard point
    const far = g.entries.sort((a, b) => Math.hypot(b.x - s0.x, b.y - s0.y) - Math.hypot(a.x - s0.x, a.y - s0.y))[0];
    // and the point on that road 4 tiles past the guard: where riding past him means getting to
    const beyond = await p.evaluate(([s, f, g]) => { const w = window.__w, raw = w.findPath(s.x, s.y, f.x, f.y) || [], d = q => Math.hypot(q.x - g.gx, q.y - g.gy), path = [];   // the road, every 8 px (findPath gives its corners)
      raw.forEach((q, j) => { const o = raw[j - 1]; if (!o) return path.push(q); const L = Math.hypot(q.x - o.x, q.y - o.y), n = Math.max(1, Math.ceil(L / 8)); for (let k = 1; k <= n; k++) path.push({ x: o.x + (q.x - o.x) * k / n, y: o.y + (q.y - o.y) * k / n }); });
      let i = 0; path.forEach((q, j) => { if (d(q) < d(path[i])) i = j; }); if (!path.length || d(path[i]) > 2.5 * 16) return null;
      for (let j = i; j < path.length; j++) if (d(path[j]) >= 4 * 16) return { x: Math.round(path[j].x), y: Math.round(path[j].y), k: '4 tiles past him' }; return null; }, [s0, far, g]);
    // (findPath steers round the blocker's body, so a road straight through him can miss the point: then 4 tiles straight past it)
    const straight = beyond ? null : await p.evaluate(([s, g]) => { const w = window.__w, G = w.walkGrid(), dx = g.gx - s.x, dy = g.gy - s.y, d = Math.hypot(dx, dy) || 1, q = { x: Math.round(g.gx + dx / d * 64), y: Math.round(g.gy + dy / d * 64), k: '4 tiles past him' };
      return G.free(Math.floor(q.x / G.C), Math.floor(q.y / G.C)) ? q : null; }, [s0, g]);
    const past = !!(beyond || straight); const goal = beyond || straight || far;
    const side0 = [s0.x - g.gx, s0.y - g.gy];
    console.log(`     ${id}: he comes in at ${s0.x},${s0.y}${s0.mounted ? ` (mounted: ${s0.mounted})` : ' (on foot)'}; riding for ${far.k || 'the way in'} ${far.x},${far.y}; the road there passes the guard point: ${past}${past ? ` (aiming at ${goal.x},${goal.y}, 4 tiles past him)` : ''}`);
    let held = 0;
    for (let k = 0; k < 3; k++) {
      if (k < 2) await p.waitForTimeout(600);   // the third straight back at him
      await p.evaluate(() => { window.__boardKey = null; });
      const r = await rideFor(goal);
      const mine = r.stopped && r.s.key === g.key;
      if (!check(mine, `${id}, try ${k + 1}: riding past, he's stopped and set a board (${r.s.key || (r.there ? 'rode through to ' + goal.k : 'no board; at ' + r.s.x + ',' + r.s.y)})`)) break;
      await leave();
      const s = await at(), dg = Math.hypot(s.x - g.gx, s.y - g.gy), same = (s.x - g.gx) * side0[0] + (s.y - g.gy) * side0[1] > 0;
      const free = s.free && await p.evaluate(([s, f]) => !!window.__w.findPath(s.x, s.y, f.x, f.y), [s, s0]);
      if (check(dg >= 2.5 * T && same && free && !s.engaged, `${id}, declined: set down at ${s.x},${s.y}, ${(dg / T).toFixed(1)} tiles from the guard point, on the side he came from (${same}), on open ground he can ride from (${free})`)) held++;
    }
    // a win: he stands aside, and the far side is reached
    await p.evaluate(() => { window.__boardKey = null; });
    const r = await rideFor(goal);
    if (r.stopped) { await p.waitForTimeout(500); await p.locator('.tk-duel-keys button', { hasText: 'Skip' }).first().click().catch(() => {}); await p.waitForTimeout(800);
      for (let i = 0; i < 60; i++) { const s = await at(); if (!s.engaged && !s.duel && !(await p.locator('.tk-duel').count())) break;   // on through his win lines until the board is gone
        if (await p.locator('.tk-duel .tk-duel-go').count()) await p.locator('.tk-duel .tk-duel-go').first().click({ timeout: 1000 }).catch(() => {}); else if (s.busy) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); }
      await quiet(); }
    const won = await p.evaluate(k => TK.cleared(k), g.key), r2 = await rideFor(goal);
    if (process.env.DBG) console.log('     dbg', JSON.stringify(await p.evaluate(([g, q, id]) => { const w = window.__w, P = w.player, n = w.npcs.find(n => n.id === id), path = w.findPath(P.x, P.y, q.x, q.y);
      return { walk: w.walk && { n: (w.walk.path || w.walk).length }, path: path && path.length, v: [Math.round(P.body.velocity.x), Math.round(P.body.velocity.y)], busy: w.ui.busy(), engaged: !!w.engaged, cine: !!w.cine, n: n && { x: Math.round(n.spr.x), y: Math.round(n.spr.y), body: n.spr.body.enable, cool: n.cool, vis: n.spr.visible },
        dlg: (document.querySelector('.town-ui .town-dlg:not([hidden])') || {}).textContent, overlay: !!document.querySelector('.tk-duel') }; }, [g, goal, id])));
    prev.beaten = check(won && !r2.stopped && Math.hypot(r2.s.x - goal.x, r2.s.y - goal.y) < 16, `${id}: beaten (${won}), he stands aside and he rides past to ${r2.s.x},${r2.s.y} (aiming at ${goal.x},${goal.y})`);
  }
  console.log(`blockers: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
