// Misaeng Book 1 (world 21, "Not Yet Alive"): what Places built, walked in the engine.
//   1. The commute (m2): from home in Susaek-dong, the subway, Jongno and the tower are open (open_ways).
//   2. Jongno's carriageway is solid: walking south off the pavement stops at the kerb; at a crosswalk she crosses.
//      Doors into other places ("to"): the tower's door into the lobby; the lift's menu up to Sales Team 3 and on to the
//      textile floor, whose door (the stairs) comes back down; out onto Jongno, down the subway stairs, up in Susaek-dong.
//   3. m4's three errands: the copier, the filing cabinets and the pantry give the copies, Oh's file and the coffee;
//      each senior's desk takes its own (and only its own) and sets its mark; with all three, m4's gate is met.
//   4. m8: the lobby's recycling bins give the waybill scrap (a spot with "gives").
//   5. m18: section head Oh, at his desk in Sales 3 in his socks, lends his slippers (m18's gate).
//   6. m20: west along Jongno to Daehanmun, and through its gate (the wall either side holds).
// (Book 4's board room and ₩100,000 mission get their own checks when Book 4's maps are built.)
// Run with the site served on :8765 (tests/playtest/run.sh misaeng-places).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = process.env.PLAYTEST_URL || 'http://localhost:8765';
let fails = 0;
const check = (ok, what) => { fails += !ok; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); };

async function open(b, upto, place, items = [], visited = null) {   // the story cleared up to (not including) `upto`, standing in `place`
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: require('path').join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/tk-world\.js/, async r => {
    const res = await r.fetch(); let js = await res.text();
    if (!/n === 21/.test(js)) js = js.replace('|| n === 90; }', '|| n === 90 || n === 21; }');
    r.fulfill({ response: res, body: js, contentType: 'application/javascript' });
  });
  await p.goto(`${URL}/index.html?test=1#/tk/21`); await p.waitForTimeout(800);
  await p.evaluate(async ([upto, place, items, visited]) => {
    localStorage.setItem('tk-guide', 'off'); await TK.load();
    for (const n of TK.world(21).nodes) { if (n.key === upto) break; TK.markCleared(n.key); }
    TK.lsSet('tk-items', { 21: items }); TK.lsSet('tk-marks', {}); TK.lsSet('tk-trade', {});
    localStorage.setItem('tk-world-21', JSON.stringify({ place, party: ['ms_jang'], ...(visited ? { visited } : {}) }));
  }, [upto, place, items, visited]);
  await p.reload();
  for (let i = 0; i < 80; i++) {
    const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {});
    if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving && window.__w.npcs))) break;
    await p.waitForTimeout(200);
  }
  await advance(p);
  return p;
}
async function advance(p) {   // through whatever is being said
  for (let i = 0; i < 30; i++) {
    if (!await p.evaluate(() => window.__w && window.__w.ui.busy())) break;
    await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150);
  }
}
async function settle(p, place) {   // wait until the scene has restarted in `place`
  for (let t = 0; t < 40; t++) {
    if (await p.evaluate(pl => !!(window.__w && window.__w.placeId === pl && window.__w.player && !window.__w.leaving), place)) return true;
    await p.waitForTimeout(250);
  }
  return false;
}
// walk her (by velocity, through the engine's physics) for ms, and say where she ended up. Into a wall, keep it slow
// (50 px/s): under the software renderer a long frame at 80 px/s can carry her through a 16-px wall (a flake, once)
const walk = (p, vx, vy, ms) => p.evaluate(([vx, vy, ms]) => new Promise(res => {
  const w = window.__w, t0 = performance.now();
  const step = () => { w.player.setVelocity(vx, vy); if (performance.now() - t0 < ms) requestAnimationFrame(step); else { w.player.setVelocity(0, 0); res({ x: w.player.x, y: w.player.y }); } };
  step();
}), [vx, vy, ms]);
// through an exit: stand her a little way in front of it and walk her in (the way the exit's side says)
async function through(p, to) {
  const dir = await p.evaluate(to => {
    const w = window.__w, e = w.exits.find(e => e.to === to || new RegExp(`--${to}$`).test(e.to));
    if (!e) return null;
    const [dx, dy] = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[e.side] || [0, 1];
    w.player.body.reset(e.rect.centerX - dx * 20, e.rect.centerY + 3 - dy * 20); return [dx, dy, e.to];
  }, to);
  if (!dir) return false;
  walk(p, dir[0] * 70, dir[1] * 70, 1500).catch(() => {});
  return settle(p, dir[2]);
}

// m2, the first morning: home in Susaek-dong, and the way to the tower (the subway, Jongno) must be open
async function commute(b) {
  const p = await open(b, '21-m2', 'susaek-dong', [], ['susaek-dong']);
  const open_ = await p.evaluate(() => ['the-subway', 'jongno', 'one-international'].map(x => [x, window.__w.placeOpen(x)]));
  for (const [x, o] of open_) check(o, `m2: from home, ${x} is open (the way to the front desk)`);
  await p.context().close();
}

// the lift (tk-modern.js "use": "lift"): its spot opens the floor menu; pick a floor, and arrive by that floor's lift
async function lift(p, label, to) {
  await p.evaluate(() => { const w = window.__w, s = w.spots.lift; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: 'lift' }); });
  const b = p.locator('.tk-lift button', { hasText: label });
  if (!await b.count()) return false;
  await b.first().click();
  if (!await settle(p, to)) return false;
  return p.evaluate(() => { const w = window.__w, s = w.spots.lift; return !!s && Math.hypot(w.player.x - s.x, w.player.y - s.y) < 48; });   // she steps out by the lift
}

async function street(b) {
  // (every place on the way visited, so the doors are tested on their own; the commute checks what's open)
  const p = await open(b, '21-m4', 'jongno', [], ['susaek-dong', 'the-subway', 'jongno', 'one-international', 'one-international--sales3', 'one-international--textile']);
  const T = 16;
  // the carriageway: tile rows 32-39; the north pavement is rows 28-31; a crosswalk at tiles 20-23 (cross-w) and 72-75
  await p.evaluate(T => window.__w.player.body.reset(10.5 * T, 30 * T), T);
  const kerb = await walk(p, 0, 50, 4000);
  check(kerb.y < 32.5 * T, `Jongno: walking south off the pavement stops at the carriageway (y ${(kerb.y / T).toFixed(1)} tiles)`);
  await p.evaluate(T => window.__w.player.body.reset(21.5 * T, 30 * T), T);
  const crossed = await walk(p, 0, 50, 4000);
  check(crossed.y > 40 * T, `Jongno: at the crosswalk she crosses to the south pavement (y ${(crossed.y / T).toFixed(1)} tiles)`);
  // the tower's door: into One International's lobby; the lift to Sales Team 3, and back down
  check(await through(p, 'one-international'), 'the tower\'s door goes into One International (the lobby)');
  check(await lift(p, '14F · Sales Team 3', 'one-international--sales3'), 'the lobby\'s lift goes up to Sales Team 3 (its floor menu)');
  check(await lift(p, '8F · The textile team', 'one-international--textile'), 'and from there to the textile team\'s floor');
  check(await through(p, 'one-international'), 'the textile floor\'s door (the stairs) comes back down to the lobby');
  check(await through(p, 'jongno'), 'the lobby\'s doors go out onto Jongno');
  check(await through(p, 'the-subway'), 'Jongno 3-ga Station\'s stairs go down into the subway');
  check(await through(p, 'susaek-dong'), 'the subway\'s far end comes up in Susaek-dong');
  await p.context().close();
}

async function errands(b) {
  const p = await open(b, '21-m4', 'one-international--sales3');
  const at = async (id) => { await p.evaluate(id => { const w = window.__w, s = w.spots[id]; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: id }); }, id); await advance(p); };
  const st = () => p.evaluate(() => ({ items: WorldItems.owned(window.__w.w), marks: WorldMarks.all(window.__w.w) }));
  await at('copier'); await at('filing');
  let s = await st();
  check(s.items.includes('copy') && s.items.includes('file'), 'm4: the copier gives the copies, the filing cabinets Oh\'s file');
  await at('errand-coffee');   // the deputy's desk, with no coffee yet: it waits, and takes nothing
  s = await st();
  check(!s.marks.includes('errand_coffee') && s.items.includes('copy') && s.items.includes('file'), 'm4: the deputy\'s desk waits for its coffee and takes nothing else');
  await at('pantry'); await at('errand-copy'); await at('errand-file'); await at('errand-coffee');
  s = await st();
  check(['errand_copy', 'errand_file', 'errand_coffee'].every(m => s.marks.includes(m)) && !['copy', 'file', 'coffee'].some(i => s.items.includes(i)),
        `m4: each senior's desk takes its own errand and sets its mark (${s.marks.join(', ')})`);
  check(await p.evaluate(() => ['errand_copy', 'errand_file', 'errand_coffee'].every(m => window.__w.cond('mark:' + m))), 'm4: its gate (the three errands) is met');
  await p.context().close();
}

async function bins(b) {
  const p = await open(b, '21-m8', 'one-international');
  await p.evaluate(() => { const w = window.__w, s = w.spots.bins; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: 'bins' }); });
  await advance(p);
  check(await p.evaluate(() => WorldItems.has(window.__w.w, 'waybill_scrap')), 'm8: the lobby\'s bins give the waybill scrap (m8\'s gate)');
  await p.context().close();
}

async function slippers(b) {
  const p = await open(b, '21-m18', 'one-international--sales3');
  const ok = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.id === 'oh-slippers'); if (!n || !n.spr.visible) return false;
    w.player.body.reset(n.spr.x - 16, n.spr.y + 4); w.act({ kind: 'npc', n }); return true; });
  await advance(p);
  check(ok && await p.evaluate(() => WorldItems.has(window.__w.w, 'slippers')), 'm18: section head Oh, at his desk, lends his slippers (m18\'s gate)');
  await p.context().close();
}

async function daehanmun(b) {
  const p = await open(b, '21-m20', 'jongno');
  check(await p.evaluate(() => window.__w.placeOpen('daehanmun')), 'm20: Daehanmun is open from Jongno');
  check(await through(p, 'daehanmun'), 'm20: west along Jongno\'s back lane to Daehanmun');
  // through the gate (building.palace_gate stands in the wall's gap, walked through) into the palace grounds, and the wall
  // either side of it holds
  await p.evaluate(() => window.__w.player.body.reset(34 * 16, 17 * 16));
  const inside = await walk(p, 0, -50, 4000);
  check(inside.y < 12 * 16, `m20: through Daehanmun's gate into the palace grounds (y ${(inside.y / 16).toFixed(1)} tiles)`);
  await p.evaluate(() => window.__w.player.body.reset(24 * 16, 17 * 16));
  const wall = await walk(p, 0, -50, 4000);
  check(wall.y > 14 * 16, `m20: the palace wall beside the gate holds (y ${(wall.y / 16).toFixed(1)} tiles)`);
  await p.context().close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  for (const t of [commute, street, errands, bins, slippers, daehanmun]) {
    try { await t(b); } catch (e) { fails++; console.log('FAIL', t.name, e.message); }
  }
  await b.close();
  console.log(fails ? `${fails} failed` : 'all passed');
  process.exit(fails ? 1 : 0);
})();
