// Misaeng (world 21): what Places built, walked in the engine.
//   1. Jongno's carriageway is solid: walking south off the pavement stops at the kerb; at a crosswalk she crosses.
//   2. Doors into other places ("to"): the tower's door goes into One International (the lobby); the subway stairs go
//      down into the subway; the lift's menu goes up to Sales Team 3 and on to the board room, whose door (the stairs)
//      comes back down to the lobby.
//   3. Setting the board room (m17): with the drinks in the bag, each seat takes its drink (the item leaves the bag),
//      sets its mark, and shows the drink on the table; the wrong seat says so and keeps it.
//   4. The ₩100,000 mission (m18): the stall sells socks, a passer-by buys, the rival out-sells you, the old man and the
//      KBA's staff member refuse; five offers end it (mark "trade").
//   5. Things that give an item when searched (the lobby's bins: waybill_scrap, m3b's gate).
// Run with the site served on :8765 (tests/playtest/run.sh misaeng-places). World 21 joins the on-foot list once its
// maps are merged (WorldData.has); until then this test serves tk-world.js with 21 added.
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
// walk her (by velocity, through the engine's physics) for ms, and say where she ended up
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
  const p = await open(b, '21-m4', 'jongno', [], ['susaek-dong', 'the-subway', 'jongno', 'one-international', 'one-international--sales3', 'one-international--board-room']);
  const T = 16;
  // the carriageway: tile rows 32-39; the north pavement is rows 28-31; a crosswalk at tiles 20-23 (cross-w) and 72-75
  await p.evaluate(T => window.__w.player.body.reset(10.5 * T, 30 * T), T);
  const kerb = await walk(p, 0, 80, 2500);
  check(kerb.y < 32.5 * T, `Jongno: walking south off the pavement stops at the carriageway (y ${(kerb.y / T).toFixed(1)} tiles)`);
  await p.evaluate(T => window.__w.player.body.reset(21.5 * T, 30 * T), T);
  const crossed = await walk(p, 0, 80, 2500);
  check(crossed.y > 40 * T, `Jongno: at the crosswalk she crosses to the south pavement (y ${(crossed.y / T).toFixed(1)} tiles)`);
  // the tower's door: into One International's lobby; the lift to Sales Team 3, and back down
  check(await through(p, 'one-international'), 'the tower\'s door goes into One International (the lobby)');
  check(await lift(p, '14F · Sales Team 3', 'one-international--sales3'), 'the lobby\'s lift goes up to Sales Team 3 (its floor menu)');
  check(await lift(p, '20F · The board room', 'one-international--board-room'), 'and from there up to the board room');
  check(await through(p, 'one-international'), 'the board room\'s door (the stairs) comes back down to the lobby');
  check(await through(p, 'jongno'), 'the lobby\'s doors go out onto Jongno');
  check(await through(p, 'the-subway'), 'Jongno 3-ga Station\'s stairs go down into the subway');
  check(await through(p, 'susaek-dong'), 'the subway\'s far end comes up in Susaek-dong');
  await p.context().close();
}

async function boardRoom(b) {
  const p = await open(b, '21-m17', 'one-international--board-room', ['seating_notes', 'water', 'green_tea', 'coffee']);
  const at = async (id) => { await p.evaluate(id => { const w = window.__w, s = w.spots[id]; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: id }); }, id); await advance(p); };
  // the wrong drink first: the president's seat with only the tea in hand keeps it
  await p.evaluate(() => TK.lsSet('tk-items', { 21: ['seating_notes', 'green_tea'] }));
  await at('seat_president');
  let s = await p.evaluate(() => ({ marks: WorldMarks.all(window.__w.w), items: WorldItems.owned(window.__w.w) }));
  check(!s.marks.includes('seat_president') && s.items.includes('green_tea'), 'board room: the president\'s seat refuses the tea (still in the bag)');
  await p.evaluate(() => TK.lsSet('tk-items', { 21: ['seating_notes', 'water', 'green_tea', 'coffee'] }));
  for (const [seat, item] of [['seat_president', 'water'], ['seat_exec', 'green_tea'], ['seat_division', 'coffee']]) {
    await at(seat);
    s = await p.evaluate(([seat, item]) => ({ mark: WorldMarks.has(window.__w.w, seat), held: WorldItems.has(window.__w.w, item) }), [seat, item]);
    check(s.mark && !s.held, `board room: ${seat} takes the ${item} out of the bag and sets its mark`);
  }
  // the drinks on the table, once set (tk-world's whenProps: a prop shown once its "when" holds)
  const shown = await p.evaluate(() => (window.__w.whenProps || []).filter(o => o.img && o.img.visible).length);
  const conds = await p.evaluate(() => window.__w.cond('mark:seat_president') && window.__w.cond('mark:seat_exec') && window.__w.cond('mark:seat_division'));
  check(conds, 'board room: m17\'s gate (all three seats) is met');
  check(shown === 3, `board room: the three drinks show on the table once set down (${shown})`);
  await p.context().close();
}

async function mission(b) {
  const p = await open(b, '21-m18', 'jongno');
  const talk = async (label) => {
    const ok = await p.evaluate(label => { const w = window.__w, n = w.npcs.find(n => n.id === label); if (!n) return false; w.player.body.reset(n.spr.x, n.spr.y + 14); w.act({ kind: 'npc', n }); return true; }, label);
    await advance(p); return ok;
  };
  check(await p.evaluate(() => WorldModern.tradeOn(window.__w)), 'm18: the mission is on once m17 is cleared');
  check(await talk('sock-stall') && await p.locator('.tk-shop').count() === 1, 'm18: the sock stall opens the shop');
  for (let i = 0; i < 3; i++) await p.locator('.tk-shop button:has-text("Buy one")').first().click();
  await p.locator('.tk-shop-close').click();
  let s = await p.evaluate(() => WorldModern.tstate(window.__w.w));
  check(s.cash === 40000 && s.stock.socks === 3, `m18: three lots of socks bought (cash ${s.cash}, stock ${s.stock.socks})`);
  await talk('buyer-bus');
  s = await p.evaluate(() => WorldModern.tstate(window.__w.w));
  check(s.cash === 70000 && s.stock.socks === 2, `m18: the man at the bus stop buys (cash ${s.cash})`);
  await talk('shop-owner');
  s = await p.evaluate(() => WorldModern.tstate(window.__w.w));
  check(s.offers === 2, `m18: the corner-shop owner out-sells you, and it counts as an offer (${s.offers})`);
  await talk('buyer-oldman');
  await talk('buyer-student');
  s = await p.evaluate(() => WorldModern.tstate(window.__w.w));
  check(s.offers === 4 && s.cash === 90000, `m18: the old man refuses, the student buys (offers ${s.offers}, cash ${s.cash})`);
  // the fifth: the KBA's staff member, who knew him (his refusal is the rebuke)
  check(await through(p, 'korea-baduk-association'), 'm18: west along Jongno to the Korea Baduk Association');
  check(await through(p, 'korea-baduk-association--kba-front'), 'm18: into its front office');
  await talk('kba-staff');
  s = await p.evaluate(() => ({ t: WorldModern.tstate(window.__w.w), done: WorldMarks.has(window.__w.w, 'trade') }));
  check(s.t.offers === 5 && s.done, `m18: the staff member refuses; five offers end the mission (mark "trade": ${s.done})`);
  await p.context().close();
}

async function bins(b) {
  const p = await open(b, '21-m3b', 'one-international');
  await p.evaluate(() => { const w = window.__w, s = w.spots.bins; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: 'bins' }); });
  await advance(p);
  const got = await p.evaluate(() => WorldItems.has(window.__w.w, 'waybill_scrap'));
  check(got, 'the lobby\'s bins give the waybill scrap (a spot with "gives": Integration\'s engine request)');
  await p.context().close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  for (const t of [commute, street, boardRoom, mission, bins]) {
    try { await t(b); } catch (e) { fails++; console.log('FAIL', t.name, e.message); }
  }
  await b.close();
  console.log(fails ? `${fails} failed` : 'all passed');
  process.exit(fails ? 1 : 0);
})();
