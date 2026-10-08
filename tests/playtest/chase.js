// The chase out of Luoyang (Book 13, c16 -> c17), on Places' map layout (luoyang.tmj "chase"): a wave of the guard out
// of the Chancellor's gate on his trail (8, 1 s behind, 150 px/s against the horse's 165) and twelve ambushes that dash
// across the street when they can just meet him. Desktop, test mode, mounted, from the chase's start.
//  1. The chase comes up: the wave and the twelve ambushes, mounted on the black horse.
//  2. He stops: the wave overruns him. Taken, no board; the chase starts again at the map's start.
//  3. Straight for the gate at a gallop: an ambusher springs and hits him, a one-try board. Failed: restart at the
//     map's start, wave and ambushes reset. Again, solved: that one is knocked aside for the run.
//  4. Places' three routes (main street, south street, market), each ridden fresh by a careful rider who looks a few
//     seconds ahead by the engine's own rules (the wave on his trail, each ambush's spring, dash and hold) and waits
//     only as long as he must: each reaches the East Gate unhit and never overrun.
//  5. The gate's own beat (c17) then plays: its board, and c17 cleared.
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
  const quiet = async () => { for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => { const w = window.__w; return w && { busy: w.ui.busy(), cine: !!w.cine, duel: !!document.querySelector('.tk-duel svg') }; }); if (s && !s.busy && !s.cine && !s.duel) return; if (s && s.busy && !s.duel) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150); } };
  // the story at c17: every beat before it played (cleared, its party, its items: the horse), in Luoyang, the chase just begun
  const fresh = async () => {
    await p.goto(BASE + '#/'); await p.evaluate(async () => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '13'); localStorage.setItem('gt-username', 'chase');
      await TK.load(); const w = TK.world(13); let party = null;
      for (const n of w.nodes) { if (n.key === '13-c17') break; TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene];
        for (const st of (sc && sc.steps) || []) { if (st[0] === 'party') party = st[1]; if (st[0] === 'item' || st[0] === 'gain') WorldItems.add(w, st[1]); } }
      TK.markSeen('13:opening'); if (party) TK.setParty(w, party); });
    await p.goto(BASE + '#/tk/13'); await p.reload();
    for (let i = 0; i < 120; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 1000 }).catch(() => {});
      if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break; await p.waitForTimeout(250); }
    await quiet();
    await p.evaluate(() => { const w = window.__w; w.leaving = false; w.cine = null; if (w.placeId !== 'luoyang') w.go('luoyang'); });
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => { const w = window.__w; return w && w.placeId === 'luoyang' && w.player && !w.leaving; })) break; }
    await quiet();
    // from the chase's start, as a restart puts him, with a fresh wave and fresh ambushes
    await p.evaluate(() => { const w = window.__w, C = w.chaseNow(), s = w.chaseFrom(C.spec); w.walk = null; w.player.body.reset(s.x, s.y); C.tries = 0; C.dropped.clear(); w.waveClear(); w.waveStart(C); w.ambushStart(C);
      if (!TKOverlay.__hooked) { const o = TKOverlay.open.bind(TKOverlay); TKOverlay.open = (n, key, at) => { window.__boardKey = key; window.__boardOnce = !!(at && at.once); (window.__boards = window.__boards || []).push(key); return o(n, key, at); }; TKOverlay.__hooked = true; } });
    await p.waitForTimeout(200);
  };
  const state = () => p.evaluate(() => { const w = window.__w, C = w.chase, T = w.tw || 16;
    return { P: [Math.round(w.player.x), Math.round(w.player.y)], on: !!w.chaseNow(), tries: C ? C.tries : null, dropped: C ? [...C.dropped] : [], engaged: !!w.engaged, busy: w.ui.busy(),
      duel: !!document.querySelector('.tk-duel svg'), key: window.__boardKey || null, c17: TK.cleared('13-c17'), eng: w.engaged && (w.engaged.id || (w.engaged.overrun ? 'overrun' : '?')),
      wave: C && C.wave ? C.wave.length : 0, amb: C && C.amb ? C.amb.map(a => ({ id: a.id, st: a.st, vis: a.spr.visible })) : [], gap: C && C.trail ? Math.round(C.trail[C.trail.length - 1].d - C.wd) : null,
      from: C && C.map ? [C.map.from[0] * T, C.map.from[1] * T] : null, mounted: (w.mounts || []).map(m => `${m.who}:${m.coat}`).join(',') }; });
  const result = async ok => { await p.waitForTimeout(700); await p.evaluate(ok => { if (window.__trainer) window.__trainer.flawed = null; dispatchEvent(new CustomEvent('tczw:result', { detail: ok ? 'ok' : 'fail' })); }, ok);
    await p.waitForTimeout(500); for (let i = 0; i < 40; i++) { const s = await state(); if (!s.duel && !(await p.locator('.tk-duel').count())) break;
      if (await p.locator('.tk-duel .tk-duel-go').count()) await p.locator('.tk-duel .tk-duel-go').first().click({ timeout: 1000 }).catch(() => {}); await p.waitForTimeout(250); } };
  const settle = async () => { for (let i = 0; i < 60; i++) { const x = await state(); if (!x.engaged && !x.busy && !x.duel) break; if (x.busy && !x.duel) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150); } await p.waitForTimeout(100); };   // the restart's fade and lines over
  const atStart = s => s.from && Math.hypot(s.P[0] - s.from[0], s.P[1] - s.from[1]) < 6;
  const fresh0 = s => s.amb.every(a => a.st === 'wait' && !a.vis) && s.gap !== null && s.gap < 8;

  // 1. the chase as the map lays it out
  await fresh(); let s = await state();
  check(s.on && s.wave === 8 && s.amb.length === 12 && /caocao:black/.test(s.mounted), `the chase comes up: a wave of ${s.wave}, ${s.amb.length} ambushes, he rides the black horse (${s.mounted || 'on foot'})`);

  // 2. a stop: the wave overruns him; no board, back to the start
  // (the wave runs along his trail: he rides a few lengths out of the gate, then pulls up)
  await p.evaluate(() => { const w = window.__w, P = w.player; w.walkTo(P.x + 72, P.y, { ring: false }); }); await p.waitForTimeout(700);
  await p.evaluate(() => { const w = window.__w; w.walk = null; w.player.setVelocity(0); });
  let over = null; const t0 = Date.now();
  for (let i = 0; i < 100 && !over; i++) { await p.waitForTimeout(100); const x = await state(); if (x.busy && !x.duel) await p.evaluate(() => window.__w.ui.advance()); if (x.tries >= 1) over = { x, ms: Date.now() - t0 }; if (x.duel) break; }
  await settle(); s = await state();
  check(!!over && !(await p.evaluate(() => (window.__boards || []).length)) && atStart(s) && fresh0(s), `he stops: the wave overruns him in ${over ? (over.ms / 1000).toFixed(1) : '-'} s; taken, no board, the chase starts again at the start (${s.P}; tries ${s.tries}; wave and ambushes reset: ${fresh0(s)})`);

  // 3. straight for the gate: an ambusher gets him; fail it, then solve it
  const straight = async () => { await p.evaluate(() => { window.__boardKey = null; });
    for (let i = 0; i < 150; i++) {   // (a line stops him: on again once it's tapped away)
      await p.evaluate(() => { const w = window.__w, T = w.tw || 16, to = w.chase.map.to; if (!w.walk && !w.ui.busy() && !w.engaged) w.walkTo(to[0] * T, to[1] * T, { ring: false }); });
      await p.waitForTimeout(100); const x = await state(); if (x.duel) return x; if (x.busy) await p.evaluate(() => window.__w.ui.advance()); if (x.c17) return x; } return state(); };
  let r = await straight();
  check(r.duel && /^13-c17~\d+$/.test(r.key || '') && await p.evaluate(() => window.__boardOnce) && r.amb.some(a => a.id === r.eng), `straight for the gate at a gallop: ambusher ${r.eng} springs and hits him; a one-try board (${r.key})`);
  await result(false); await settle(); s = await state();
  check(s.tries >= 2 && atStart(s) && fresh0(s) && !s.c17, `failed: the chase starts again at the start (${s.P}), the wave and every ambush reset (${fresh0(s)}), c17 still to play`);
  r = await straight(); const by2 = r.eng;
  check(r.duel && r.amb.some(a => a.id === by2), `straight again: ${by2} hits him, a board (${r.key})`);
  // while the board is up the chase holds still: the wave, the ambushes
  const held = async () => p.evaluate(() => { const C = window.__w.chase; return { wd: Math.round(C.wd), wt: Math.round(C.wt), amb: C.amb.map(a => Math.round(a.spr.x) + ',' + Math.round(a.spr.y) + a.st).join(' ') }; });
  const h0 = await held(); await p.waitForTimeout(1500); const h1 = await held();
  check(h0.wd === h1.wd && h0.wt === h1.wt && h0.amb === h1.amb, `while the board is up the chase holds still: the wave (${h0.wd} -> ${h1.wd} px along his trail) and the ambushes don't move`);
  const tries2 = (await state()).tries;
  await result(true); await settle(); s = await state();
  const gone = await p.evaluate(id => { const a = window.__w.chase.amb.find(a => a.id === id); return a && !a.spr.visible; }, by2);
  check(s.dropped.includes(by2) && gone && s.tries === tries2 && !s.c17, `solved: ${by2} is knocked aside for the run (dropped ${s.dropped.join(', ')}; hidden ${gone}), no restart, c17 still to play`);

  // 4. Places' routes, ridden carefully: a search over ride or stop every 100 ms, by the engine's own rules (the wave on
  // his trail; each ambush's spring, dash and hold), from the live state; replanned as he goes
  const install = () => p.evaluate(() => {
    window.__search = (path, beam) => {
      const w = window.__w, C = w.chase, T = w.tw || 16, pc = C.map.pace || {}, dt = 50;
      const mounted = w.mounts && w.mounts.length, V = (pc.horse || 165) * (mounted ? 1 : 110 / 165), run = pc.ambusher || 140, hit = (pc.hit || .8) * T + 2, ws = C.waveSpec.speed || 150;
      const amb0 = C.amb.filter(a => !C.dropped.has(a.id) && a.st !== 'gone').map(a => ({ id: a.id, dash: a.dash, post: a.post, to: a.to, st: a.st, t: a.t, x: a.spr.x, y: a.spr.y }));
      // one 100 ms step, riding or standing: the new state, or null if the wave or an ambusher gets him
      const step = (s, ride) => {
        let P = { ...s.P }, i = s.i, D = s.D, wd = s.wd, wt = s.wt; const amb = s.amb.map(a => ({ ...a }));
        for (let k = 0; k < 2; k++) {
          const o = { ...P };
          if (ride) { let left = V * dt / 1000; while (left > 0 && i < path.length) { const q = path[i], d = Math.hypot(q.x - P.x, q.y - P.y); if (d <= left) { P = { x: q.x, y: q.y }; left -= d; i++; } else { P.x += (q.x - P.x) / d * left; P.y += (q.y - P.y) / d * left; left = 0; } } }
          const vx = P.x - o.x, vy = P.y - o.y; D += Math.hypot(vx, vy);
          wt += dt; if (wt >= 0) { wd = Math.min(D, wd + ws * dt / 1000); if (wd > 0 && D - wd < 14 + 4) return null; }
          for (const a of amb) {
            if (a.st === 'gone') continue;
            const vert = a.dash === 'N' || a.dash === 'S';
            if (a.st === 'wait') {
              const dC = vert ? Math.abs(P.x - a.post.x) : Math.abs(P.y - a.post.y), toward = vert ? (a.post.x - P.x) * vx > 0 : (a.post.y - P.y) * vy > 0;
              const span = Math.hypot(a.to.x - a.post.x, a.to.y - a.post.y), rn = Math.min(span, vert ? Math.abs(P.y - a.post.y) : Math.abs(P.x - a.post.x));
              if (toward && Math.hypot(P.x - a.post.x, P.y - a.post.y) < (pc.reach || 9) * T && dC / V <= rn / run + (pc.lead || .1)) { a.st = 'dash'; a.x = a.post.x; a.y = a.post.y; }
              continue; }
            if (Math.hypot(P.x - a.x, P.y - (a.y - 4)) < hit) return null;
            if (a.st === 'dash') { const dx = a.to.x - a.x, dy = a.to.y - a.y, d = Math.hypot(dx, dy), st = run * dt / 1000; if (d <= st) { a.x = a.to.x; a.y = a.to.y; a.st = 'hold'; a.t = (pc.hold || 1) * 1000; } else { a.x += dx / d * st; a.y += dy / d * st; } }
            else if (a.st === 'hold') { a.t -= dt; if (a.t <= 0) a.st = 'gone'; }
          }
        }
        return { P, i, D, wd, wt, amb, first: s.first };
      };
      let layer = [{ P: { x: w.player.x, y: w.player.y }, i: 0, D: C.trail[C.trail.length - 1].d, wd: C.wd, wt: C.wt, amb: amb0, first: null }];
      for (let n = 0; n < 200 && layer.length; n++) {
        const next = new Map();
        for (const s of layer) for (const ride of [true, false]) {
          const u = step(s, ride); if (!u) continue; if (s.first === null) u.first = ride ? 'ride' : 'stop';
          if (u.i >= path.length) return { first: u.first, steps: n + 1 };
          const key = u.i + '|' + Math.round((u.D - u.wd) / 6) + '|' + u.amb.map(a => a.st[0] + (a.st === 'dash' || a.st === 'hold' ? Math.round(a.x / 3) + ',' + Math.round(a.y / 3) + ',' + Math.round(a.t / 100) : '')).join(';');
          if (!next.has(key)) next.set(key, u);
        }
        layer = [...next.values()].sort((a, b) => b.i - a.i || (b.D - b.wd) - (a.D - a.wd)).slice(0, beam);   // the furthest on, the furthest ahead of the wave
      }
      return null; };
    // the same, tile by tile over the route's band (its cells and one either side, as Places' checker rides it): a step a
    // tile at the horse's pace, any way or standing; the first step of the quickest clean ride (a tile), or null
    window.__tiles = (cells, beam) => {
      const w = window.__w, C = w.chase, T = w.tw || 16, pc = C.map.pace || {}, G = w.walkGrid();
      const mounted = w.mounts && w.mounts.length, V = (pc.horse || 165) * (mounted ? 1 : 110 / 165), run = pc.ambusher || 140, hit = (pc.hit || .8) * T + 2, ws = C.waveSpec.speed || 150, dt = T / V * 1000;
      if (!w.__band) { const band = new Set(); for (let k = 1; k < cells.length; k++) { const [ax, ay] = cells[k - 1], [bx, by] = cells[k];
          for (let x = Math.min(ax, bx) - 1; x <= Math.max(ax, bx) + 1; x++) for (let y = Math.min(ay, by) - 1; y <= Math.max(ay, by) + 1; y++) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const tx = x * 4 + i, ty = y * 4 + j;
            if (G.free(Math.floor((tx + .5) * T / G.C), Math.floor((ty + .5) * T / G.C))) band.add(tx + ',' + ty); } }
        const gx = Math.floor(C.map.to[0]), gy = Math.floor(C.map.to[1]), dist = new Map(), q = [];
        for (const k of band) { const [x, y] = k.split(',').map(Number); if (Math.hypot(x + .5 - C.map.to[0], y + .5 - C.map.to[1]) <= 2) { dist.set(k, 0); q.push(k); } }
        while (q.length) { const k = q.shift(), [x, y] = k.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = (x + dx) + ',' + (y + dy); if (band.has(u) && !dist.has(u)) { dist.set(u, dist.get(k) + 1); q.push(u); } } }
        w.__band = { band, dist }; void gx; void gy; }
      const { dist } = w.__band, ctr = k => { const [x, y] = k.split(',').map(Number); return { x: (x + .5) * T, y: (y + .5) * T }; };
      const amb0 = C.amb.filter(a => !C.dropped.has(a.id) && a.st !== 'gone').map(a => ({ dash: a.dash, post: a.post, to: a.to, st: a.st, t: a.t, x: a.spr.x, y: a.spr.y }));
      const here = Math.floor(w.player.x / T) + ',' + Math.floor(w.player.y / T);
      if (!dist.has(here)) return { off: true };
      const step = (s, k2) => {   // to tile k2 (or the same: standing) in one step; null if caught
        const A = ctr(s.k), B = ctr(k2); let D = s.D, wd = s.wd, wt = s.wt; const amb = s.amb.map(a => ({ ...a }));
        for (let h = 1; h <= 2; h++) {
          const P = { x: A.x + (B.x - A.x) * h / 2, y: A.y + (B.y - A.y) * h / 2 }, vx = B.x - A.x, vy = B.y - A.y, sub = dt / 2;
          D += Math.hypot(vx, vy) / 2; wt += sub; if (wt >= 0) { wd = Math.min(D, wd + ws * sub / 1000); if (wd > 0 && D - wd < 14 + 4) return null; }
          for (const a of amb) {
            if (a.st === 'gone') continue;
            const vert = a.dash === 'N' || a.dash === 'S';
            if (a.st === 'wait') {
              const dC = vert ? Math.abs(P.x - a.post.x) : Math.abs(P.y - a.post.y), toward = vert ? (a.post.x - P.x) * vx > 0 : (a.post.y - P.y) * vy > 0;
              const span = Math.hypot(a.to.x - a.post.x, a.to.y - a.post.y), rn = Math.min(span, vert ? Math.abs(P.y - a.post.y) : Math.abs(P.x - a.post.x));
              if (toward && Math.hypot(P.x - a.post.x, P.y - a.post.y) < (pc.reach || 9) * T && dC / V <= rn / run + (pc.lead || .1)) { a.st = 'dash'; a.x = a.post.x; a.y = a.post.y; }
              continue; }
            if (Math.hypot(P.x - a.x, P.y - (a.y - 4)) < hit) return null;
            if (a.st === 'dash') { const dx = a.to.x - a.x, dy = a.to.y - a.y, d = Math.hypot(dx, dy), st = run * sub / 1000; if (d <= st) { a.x = a.to.x; a.y = a.to.y; a.st = 'hold'; a.t = (pc.hold || 1) * 1000; } else { a.x += dx / d * st; a.y += dy / d * st; } }
            else if (a.st === 'hold') { a.t -= sub; if (a.t <= 0) a.st = 'gone'; }
          } }
        return { k: k2, D, wd, wt, amb, first: s.first };
      };
      let layer = [{ k: here, D: C.trail[C.trail.length - 1].d, wd: C.wd, wt: C.wt, amb: amb0, first: null }];
      for (let n = 0; n < 220 && layer.length; n++) {
        const next = new Map();
        for (const s of layer) { const [x, y] = s.k.split(',').map(Number);
          for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const k2 = (x + dx) + ',' + (y + dy); if (!dist.has(k2)) continue;
            const u = step(s, k2); if (!u) continue; if (s.first === null) u.first = k2; u.prev = s;
            if (dist.get(k2) === 0) { const seq = []; for (let z = u; z && z.prev; z = z.prev) seq.unshift(z.k); return { first: u.first, steps: n + 1, seq }; }
            const key = k2 + '|' + Math.round((u.D - u.wd) / 8) + '|' + u.amb.map(a => a.st[0] + (a.st === 'dash' || a.st === 'hold' ? Math.round(a.x / 4) + ',' + Math.round(a.y / 4) + ',' + Math.round(a.t / 150) : '')).join(';');
            if (!next.has(key)) next.set(key, u); } }
        layer = [...next.values()].sort((a, b) => dist.get(a.k) - dist.get(b.k) || (b.D - b.wd) - (a.D - a.wd)).slice(0, beam);
      }
      return null; };
  });
  // a route's cells (Places' plan: 4-tile cells) to the gate, as pixels along the streets, every 8 px
  const route = cells => p.evaluate(cells => { const w = window.__w, T = w.tw || 16, C = w.chase, to = { x: C.map.to[0] * T, y: C.map.to[1] * T };
    const pts = cells.slice(1).map(([cx, cy]) => ({ x: (cx * 4 + 2) * T, y: (cy * 4 + 2) * T })); pts[pts.length - 1] = to;
    const G = w.walkGrid(), free = (x, y) => G.free(Math.floor(x / G.C), Math.floor(y / G.C));
    const snap = q => { if (free(q.x, q.y)) return q; for (let r = G.C; r <= 4 * T; r += G.C / 2) for (let k = 0; k < 16; k++) { const x = q.x + Math.cos(k * Math.PI / 8) * r, y = q.y + Math.sin(k * Math.PI / 8) * r; if (free(x, y)) return { x, y }; } return q; };   // a cell's middle can be a wall: the open ground nearest it
    let a = { x: w.player.x, y: w.player.y }; const out = [];
    for (const q0 of pts) { const q = snap(q0), f0 = w.findPath(a.x, a.y, q.x, q.y), f = f0 && f0.length ? [a, ...f0] : (out.missing = (out.missing || 0) + 1, [a, q]); /* findPath leaves out where it starts */ for (let j = 1; j < f.length; j++) { const o = f[j - 1], n = f[j], L = Math.hypot(n.x - o.x, n.y - o.y), k = Math.max(1, Math.ceil(L / 8)); for (let m = 1; m <= k; m++) out.push({ x: o.x + (n.x - o.x) * m / k, y: o.y + (n.y - o.y) * m / k }); } a = q; }
    return { pts: out, missing: out.missing || 0 }; }, cells);
  const ROUTES = { 'main street': [[5, 14], [8, 14], [8, 8], [19, 8]], 'south street': [[5, 14], [19, 14], [19, 8]], 'market': [[5, 14], [16, 14], [16, 8], [19, 8]] };
  const rideCareful = async name => {
    await fresh(); await install(); await p.evaluate(() => { window.__boards = []; });
    const rt = await route(ROUTES[name]), full = rt.pts;
    await p.evaluate(() => { const w = window.__w, C = w.chase, s = w.chaseFrom(C.spec); w.walk = null; w.player.body.reset(s.x, s.y); w.waveClear(); w.waveStart(C); w.ambushStart(C); }); /* the chase from its start now, the way laid out */ console.log(`     ${name}: ${full.length} points along the way${rt.missing ? `; ${rt.missing} legs with no path` : ''}`); if (!full.length) return { hits: 0, overs: 0, waited: 0, done: false, at: (await state()).P, secs: '0' }; let k = 0, waited = 0, hits = 0, overs = 0, noPlan = 0, lastSteps = null, tiled = 0; await p.evaluate(() => { window.__w.__band = null; }); const s0 = await state(), t0 = Date.now();
    while (Date.now() - t0 < 90000) {
      const x = await state();
      if (x.duel && x.key === '13-c17') break;   // the gate's own board: he's there
      if (x.duel) { hits++; console.log(`     ${name}: hit by ${x.eng} at ${x.P} (${noPlan} moments with no clean way left; a clean way was ${lastSteps === null ? 'never found' : 'found up to then'})`); break; }
      if (x.tries > s0.tries) { overs++; console.log(`     ${name}: overrun at ${x.P}`); break; }
      if (x.busy) { await p.evaluate(() => window.__w.ui.advance()); continue; }
      if (x.c17 || !x.on) break;   // at the gate: the chase is over
      // how far along the route he is: the nearest point ahead
      k = await p.evaluate(([full, k]) => { const w = window.__w; let best = k, bd = 1e9; for (let j = k; j < Math.min(full.length, k + 40); j++) { const d = Math.hypot(full[j].x - w.player.x, full[j].y - w.player.y); if (d < bd) { bd = d; best = j; } } return best; }, [full, k]);
      const rest = full.slice(k + 1);
      if (!rest.length) { await p.evaluate(q => window.__w.walkTo(q.x, q.y, { ring: false }), full[full.length - 1]); await p.waitForTimeout(150); continue; }
      // the search's first move: ride on, or stand (replanned every step)
      let plan = await p.evaluate(rest => window.__search(rest, 1500), rest);
      if (!plan) {   // none down the middle: across the street's width, tile by tile (the game held while he thinks), three steps, then think again
        const tp = await p.evaluate(cells => { const w = window.__w; w.scene.pause(); try { return window.__tiles(cells, 300); } finally { w.scene.resume(); } }, ROUTES[name]);
        if (tp && tp.seq) { tiled++; lastSteps = tp.steps;
          for (const k2 of tp.seq.slice(0, 3)) { const [tx, ty] = k2.split(',').map(Number);
            const t1 = Date.now(); await p.evaluate(([tx, ty]) => { const w = window.__w, T = 16, x = (tx + .5) * T, y = (ty + .5) * T;
              if (Math.hypot(w.player.x - x, w.player.y - y) < 3) { w.walk = null; w.player.setVelocity(0); } else w.walkTo(x, y, { ring: false }); }, [tx, ty]);
            for (let z = 0; z < 8; z++) { await p.waitForTimeout(20); if (Date.now() - t1 > 90) break; } }
          continue; } }
      if (!plan) noPlan++; else lastSteps = plan.steps;
      if (!plan || plan.first === 'ride') { const q = rest[Math.min(rest.length - 1, 12)]; await p.evaluate(q => window.__w.walkTo(q.x, q.y, { ring: false }), q); await p.waitForTimeout(60); }
      else { await p.evaluate(() => { const w = window.__w; w.walk = null; w.player.setVelocity(0); }); await p.waitForTimeout(60); waited += 100; }
    }
    const e = await state();
    return { hits, overs, waited, tiled, done: e.c17 || !e.on || (await p.evaluate(() => (window.__boards || []).includes('13-c17'))), at: e.P, secs: ((Date.now() - t0) / 1000).toFixed(1) };
  };
  let lastClean = null;
  for (const name of Object.keys(ROUTES)) {
    const r = await rideCareful(name);
    if (check(r.done && !r.hits && !r.overs, `${name}, ridden carefully: at the East Gate unhit and never overrun (${r.secs} s, ${(r.waited / 1000).toFixed(1)} s of it waiting${r.tiled ? `, across the street's width tile by tile` : ''}; at ${r.at})`)) lastClean = name;
  }

  // 5. the gate's own beat: its board (Skip in test mode), c17 cleared
  let c17board = false, c17 = false;
  for (let i = 0; i < 160 && !c17; i++) { await p.waitForTimeout(250);
    const x = await state(); if (x.duel && x.key === '13-c17') { c17board = true; await p.locator('.tk-duel-keys button', { hasText: 'Skip' }).first().click().catch(() => {}); await p.waitForTimeout(600);
      for (let j = 0; j < 20 && (await p.locator('.tk-duel .tk-duel-go').count()); j++) { await p.locator('.tk-duel .tk-duel-go').first().click({ timeout: 1000 }).catch(() => {}); await p.waitForTimeout(250); } }
    else if (x.busy) await p.evaluate(() => window.__w.ui.advance());
    else if (!x.duel && i % 8 === 0) await p.evaluate(() => { const w = window.__w, sp = Object.values(w.spots).find(x => x.node === '13-c17'); if (sp) w.walkTo(sp.x, sp.y + 12, { ring: false }); });
    c17 = x.c17; }
  c17board = c17board || (await p.evaluate(() => (window.__boards || []).includes('13-c17')));
  check(c17board && c17, `at the East Gate (after ${lastClean || 'no clean route'}) the c17 beat plays: its board (${c17board}), and c17 is cleared (${c17})`);
  console.log(`chase: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
