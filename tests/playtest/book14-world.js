// Book 14's world states (Lü Bu's fall), each at the beat that has it, played up to there (cleared, party, items):
//  Xuzhou: no gate shut as a guest (x2); the west gate shut on the moonlit night (x4, "moon"); all four shut and barred
//  from x14 ("locked"): each drawn shut (prop.gateshut / gateshut_ns), stopping him and saying its line.
//  Xiapi: the flood water by state: none under siege (x16), the first flood (x17, flood1), the second (x18, flood2), gone
//  when the city is taken (x20). In flood2 the stables and the residence can't be reached on foot; on Red Hare they can.
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
  const ready = async () => { for (let i = 0; i < 80; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 800 }).catch(() => {});
      const s = await p.evaluate(() => { const w = window.__w; if (!w || !w.player || w.leaving || w.cine) return 0; if (w.ui.busy()) { w.ui.advance(); return 0; } return 1; }); if (s) break; await p.waitForTimeout(250); } await p.waitForTimeout(600); };
  // the story at node K (all before it played), in a place
  const setup = async (K, place) => {
    await p.goto(BASE + '#/'); await p.evaluate(async K => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '14'); localStorage.setItem('gt-username', 'b14');
      await TK.load(); const w = TK.world(14); let party = null; const items = new Set();
      for (const n of w.nodes) { if (n.key === K) break; TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene];
        for (const st of (sc && sc.steps) || []) { if (st[0] === 'party') party = st[1]; if (st[0] === 'gain' || st[0] === 'item') items.add(st[1]); if (st[0] === 'lose') items.delete(st[1]); } }
      const a = TK.ls(WorldItems.KEY); a[14] = [...items]; TK.lsSet(WorldItems.KEY, a); TK.markSeen('14:opening'); if (party) TK.setParty(w, party); }, K);
    await p.goto(BASE + '#/tk/14'); await p.reload(); await ready();
    await p.evaluate(pl => { const w = window.__w; w.leaving = false; if (w.placeId !== pl) w.go(pl); }, place);
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (await p.evaluate(pl => { const w = window.__w; return w && w.placeId === pl && w.player && !w.leaving; }, place)) break; }
    await ready();
  };
  const T = 16;
  // the shut gates as drawn and as they stand
  const gates = () => p.evaluate(() => { const w = window.__w, drawn = w.children.list.filter(o => o.visible && o.frame && /gateshut/.test(String(o.frame.name))).length; /* prop.gateshut / gateshut_ns frames */
    return { state: (w.mapState() || {}).ids || [], on: w.shutGates.filter(g => g.on).map(g => { const R = g.rect, T = w.tw || 16; return [Math.round(R.centerX / T), Math.round(R.centerY / T)].join(','); }), drawn }; /* each shut gate by its middle, in tiles */ });
  // from 3 tiles inside a gate, ride out through it: stopped short, and its line said
  // anything holding him first: a line, or a road challenger's board (won with Skip)
  const clearUp = async () => { for (let i = 0; i < 40; i++) {
      const s = await p.evaluate(() => { const w = window.__w; return { busy: w.ui.busy(), engaged: !!w.engaged, duel: !!document.querySelector('.tk-duel') }; });
      if (!s.busy && !s.engaged && !s.duel) return;
      if (s.duel) { const go = p.locator('.tk-duel .tk-duel-go'), k = p.locator('.tk-duel-keys button', { hasText: 'Skip' }); if (await go.count() && await go.first().isVisible()) await go.first().click({ timeout: 800 }).catch(() => {}); else if (await k.count()) await k.first().click({ timeout: 800 }).catch(() => {}); }
      else if (s.busy) await p.evaluate(() => window.__w.ui.advance());
      await p.waitForTimeout(250); } };
  // the story done placing him: lines cleared, any handoff it starts played (x19's walk-in puts Hou Cheng at the stables door), and still
  const settle = async () => { let still = 0, last = ''; for (let i = 0; i < 60 && still < 4; i++) { await clearUp();
      const now = await p.evaluate(() => { const w = window.__w; return w.cine || w.leaving || w.ui.busy() || w.walk || w.approaching ? 'busy' : `${Math.round(w.player.x)},${Math.round(w.player.y)}`; });
      still = now !== 'busy' && now === last ? still + 1 : 0; last = now; await p.waitForTimeout(250); } };
  const tryGate = async (rect, dir) => { const [x, y, gw, gh] = rect, cx = (x + gw / 2) * T, cy = (y + gh / 2) * T;
    const [dx, dy] = { left: [1, 0], right: [-1, 0], up: [0, 1], down: [0, -1] }[dir], start = { x: cx + dx * 4 * T, y: cy + dy * 4 * T + 8 };
    await settle();
    // a start on open ground, 4 tiles in (further if that's solid)
    const st = await p.evaluate(([cx, cy, dx, dy]) => { const w = window.__w, G = w.walkGrid(), T = 16; for (let k = 4; k < 9; k++) { const x = cx + dx * k * T, y = cy + dy * k * T + 8; if (G.free(Math.floor(x / G.C), Math.floor(y / G.C))) return { x, y }; } return { x: cx + dx * 4 * T, y: cy + dy * 4 * T + 8 }; }, [cx, cy, dx, dy]);
    start.x = st.x; start.y = st.y;
    await p.evaluate(s => { const w = window.__w; w.walk = null; w.auto = null; w.approaching = null; w.blocked = 0; w.player.body.reset(s.x, s.y); }, start); await p.waitForTimeout(300);   /* nothing left to walk him elsewhere */
    let line = ''; await p.evaluate(d => { window.__w.auto = d; }, dir); for (let i = 0; i < 16 && !line; i++) {   /* held that way (the engine's own auto-move) */ await p.waitForTimeout(120); line = await p.evaluate(() => { const d = document.querySelector('.town-ui .town-dlg:not([hidden])'); return d ? d.textContent.replace(/\s+/g, ' ').trim() : ''; }); }
    for (let i = 0; i < 8 && line && !/gate/i.test(line); i++) { await p.waitForTimeout(150); line = await p.evaluate(() => { const d = document.querySelector('.town-ui .town-dlg:not([hidden])'); return d ? d.textContent.replace(/\s+/g, ' ').trim() : ''; }); }   // (it types out) await p.evaluate(() => { window.__w.auto = null; });
    const P = await p.evaluate(() => ({ x: Math.round(window.__w.player.x), y: Math.round(window.__w.player.y) }));
    const inGate = P.x >= x * T - 2 && P.x <= (x + gw) * T + 2 && P.y >= y * T && P.y <= (y + gh) * T + 8, past = dx ? (P.x - cx) * dx < -gw * T / 2 : (P.y - cy) * dy < -gh * T / 2;
    for (let i = 0; i < 10 && await p.evaluate(() => window.__w.ui.busy()); i++) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150); }
    return { stopped: !past, gateLine: /The gate|城门/.test(line), line: line.slice(0, 70), P }; void inGate; };
  const mid = ([x, y, w, h]) => [x + w / 2, y + h / 2].join(',');
  const GATES = { 'west-gate': [[6, 28, 2, 4], 'left'], 'east-gate': [[72, 28, 2, 4], 'right'], 'south-gate': [[36, 52, 4, 2], 'down'], 'north-gate': [[36, 6, 4, 2], 'up'] };

  // Xuzhou as a guest: no gate shut
  await setup('14-x2', 'xuzhou'); let g = await gates();
  check(!g.on.length && !g.drawn, `Xuzhou at x2 (${g.state.join('+')}): no gate shut or drawn shut (${g.on.length} shut, ${g.drawn} drawn)`);
  // the moonlit night: the west gate shut
  await setup('14-x4', 'xuzhou'); g = await gates();
  check(g.state.includes('moon') && g.on.length === 1 && g.on[0] === mid(GATES['west-gate'][0]) && g.drawn === 1, `Xuzhou at x4 (${g.state.join('+')}): the west gate alone is shut, and drawn shut (${g.on.join(' | ')}; ${g.drawn} drawn)`);
  let r = await tryGate(...GATES['west-gate']); check(r.stopped && r.gateLine, `riding out by the west gate: stopped at ${r.P.x},${r.P.y}, and its line: "${r.line}"`);
  r = await tryGate(...GATES['east-gate']); check(!r.stopped, `the east gate stands open that night: he rides out through it (${r.P.x},${r.P.y})`);
  // locked from x14: all four
  await setup('14-x14', 'xuzhou'); g = await gates();
  check(g.state.includes('locked') && g.on.length === 4 && g.drawn === 4, `Xuzhou at x14 (${g.state.join('+')}): all four gates shut and drawn shut (${g.on.length} shut, ${g.drawn} drawn)`);
  for (const [name, [rect, dir]] of Object.entries(GATES)) { r = await tryGate(rect, dir); check(r.stopped && r.gateLine, `${name}: stopped at ${r.P.x},${r.P.y}, and its line: "${r.line}"`); }

  // Xiapi's flood water, by state
  const water = () => p.evaluate(() => { const w = window.__w; return { state: (w.mapState() || {}).ids || [], w: w.waters.map(x => `${(x.ids || []).join(',') || 'always'}:${x.on ? 'on' : 'off'}${x.layer.visible ? '' : '(hidden)'}`) }; });
  const flood = s => s.w.filter(x => !x.startsWith('always'));
  const W = [['14-x16', 'siege', s => flood(s).every(x => /off\(hidden\)$/.test(x))], ['14-x17', 'flood1', s => flood(s).some(x => /flood1.*:on$/.test(x)) && flood(s).every(x => /flood1/.test(x) || /off/.test(x))],
    ['14-x18', 'flood2', s => flood(s).every(x => /:on$/.test(x))], ['14-x20', 'taken', s => flood(s).every(x => /off\(hidden\)$/.test(x))]];
  for (const [K, st, ok] of W) { await setup(K, 'xiapi'); const s = await water(); check(s.state.includes(st) && ok(s), `Xiapi at ${K.slice(3)} (${s.state.join('+')}): the flood water as the state has it (${s.w.join(' | ')})`);
    if (st === 'flood2') {
      // the stables and the residence: on Red Hare a way there; on foot none
      const reach = () => p.evaluate(() => { const w = window.__w, P = w.player, ex = w.exits.find(e => e.to === 'xiapi--lb-residence'), sd = w.spots['stables-door'];
        const way = q => { const f = w.findPath(P.x, P.y, q.x, q.y); return !!(f && f.length); }; return { stables: way(sd), residence: way({ x: ex.rect.centerX, y: ex.rect.bottom + 4 }), wades: w.wades() }; });
      const rid = await reach();
      await p.evaluate(() => { const w = window.__w; WorldItems.setRiding(w.w, false); w.mountSig = null; }); await p.waitForTimeout(400);
      const foot = await reach();
      check(rid.wades && rid.stables && rid.residence, `in flood2 on Red Hare he can ride to the stables and the residence (${JSON.stringify(rid)})`);
      check(!foot.wades && !foot.stables && !foot.residence, `on foot neither can be reached (${JSON.stringify(foot)})`);
      await p.evaluate(() => { const w = window.__w; WorldItems.setRiding(w.w, true); w.mountSig = null; });
    } }
  // Xiapi at night (x19): the south and west gates shut (the watchers taken off for this, so only the gates are tried)
  await setup('14-x19', 'xiapi'); await p.evaluate(() => { for (const n of window.__w.npcs) if (n.watch) n.spr.setVisible(false); });
  g = await gates();
  check(g.state.includes('night') && g.on.length === 2 && g.drawn >= 2, `Xiapi at x19 (${g.state.join('+')}): the south and west gates are shut and drawn shut (${g.on.join(' | ')}; ${g.drawn} drawn)`);
  for (const [name, [rect, dir]] of Object.entries({ 'south-gate': [[48, 64, 4, 2], 'down'], 'west-gate': [[18, 36, 2, 4], 'left'] })) { r = await tryGate(rect, dir); check(r.stopped && r.gateLine, `Xiapi's ${name} at night: stopped at ${r.P.x},${r.P.y}, and its line: "${r.line}"`); }
  console.log(`book14-world: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
