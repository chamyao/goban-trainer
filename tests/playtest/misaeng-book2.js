// Misaeng Book 2 (world 22, "Sente", episodes 17-33): what Places built, walked in the engine.
//   1. b17: the world opens on Jongno; into the bakery by its drawn door, where b17 is.
//   2. The supplier: in by its door to the corridor (b18), and on to the president's office (b19).
//   3. The daycare at going-home time (b21b): dusk; its glass door, the playroom; the lanes to Jongno and Sun's.
//   4. The tower's new floors by the lift: the executive meeting room (b20), the reference room (b23), the PT hall.
//   5. b27's gate: at night in Sales 3, the team gone home, Oh's slippers from under his desk.
//   6. The team at their own desks by day (b21), Oh in his slippers.
//   7. The PT hall: the podium (b29) and the evaluators' table (b30).
// Run with the site served on :8765 (tests/playtest/run.sh misaeng-book2).
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
    if (!/n === 22/.test(js)) js = js.replace('n === 90;', 'n === 90 || n === 22;');
    r.fulfill({ response: res, body: js, contentType: 'application/javascript' });
  });
  await p.goto(`${URL}/index.html?test=1#/tk/22`); await p.waitForTimeout(800);
  await p.evaluate(async ([upto, place, items, visited]) => {
    localStorage.setItem('tk-guide', 'off'); await TK.load();
    for (const n of TK.world(22).nodes) { if (n.key === upto) break; TK.markCleared(n.key); }
    TK.lsSet('tk-items', { 22: items }); TK.lsSet('tk-marks', {}); TK.lsSet('tk-trade', {});
    localStorage.setItem('tk-world-22', JSON.stringify({ place, party: ['ms_jang'], ...(visited ? { visited } : {}) }));
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

// the lift (tk-modern.js "use": "lift"): its spot opens the floor menu; pick a floor, and arrive by that floor's lift
async function lift(p, label, to) {
  await p.evaluate(() => { const w = window.__w, s = w.spots.lift; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: 'lift' }); });
  const b = p.locator('.tk-lift button', { hasText: label });
  if (!await b.count()) return false;
  await b.first().click();
  if (!await settle(p, to)) return false;
  return p.evaluate(() => { const w = window.__w, s = w.spots.lift; return !!s && Math.hypot(w.player.x - s.x, w.player.y - s.y) < 48; });   // she steps out by the lift
}

const at = async (p, id) => { await p.evaluate(id => { const w = window.__w, s = w.spots[id]; w.player.body.reset(s.x, s.y + 10); w.act({ kind: 'spot', k: id }); }, id); await advance(p); };
const st = p => p.evaluate(() => ({ items: WorldItems.owned(window.__w.w), marks: WorldMarks.all(window.__w.w) }));
// hand something to a person (apo110: "I was handing off things to circles not people"): talk to them
const to = async (p, id) => { const ok = await p.evaluate(id => { const w = window.__w, n = w.npcs.find(n => n.id === id);
  if (!n || !n.spr.visible) return false; w.player.body.reset(n.spr.x, n.spr.y + 14); w.act({ kind: 'npc', n }); return true; }, id); await advance(p); return ok; };
const shown = (p, id) => p.evaluate(id => { const n = window.__w.npcs.find(n => n.id === id); return !!(n && n.spr.visible); }, id);

// m8, the first commute: home in Susaek-dong, and the way to Jongno (the subway) must be open
const spot = (p, id) => p.evaluate(id => !!window.__w.spots[id], id);
const light = p => p.evaluate(() => { const st = window.__w.mapState(); return st ? st.light : 'day'; });

async function bakery(b) {
  const p = await open(b, '22-b17', 'jongno', [], ['jongno']);
  check(await through(p, 'bakery') && await spot(p, 'b17'), 'b17: into the bakery on Jongno by its drawn door, where b17 is');
  await p.context().close();
}

async function supplier(b) {
  const p = await open(b, '22-b18', 'supplier', [], ['supplier', 'jongno']);
  check(await through(p, 'corridor') && await spot(p, 'b18'), 'b18: into the supplier\'s building, its corridor (b18)');
  check(await through(p, 'president'), 'b19: down the corridor to the president\'s office');
  check(await spot(p, 'b19'), 'b19: the president\'s office has b19');
  await p.context().close();
}

async function daycare(b) {
  const p = await open(b, '22-b21b', 'daycare', [], ['daycare', 'jongno', 'suns-neighbourhood']);
  check(await light(p) === 'dusk', `b21b: going-home time at the daycare (${await light(p)})`);
  check(await spot(p, 'b21b'), 'b21b: at the daycare\'s glass door');
  check(await through(p, 'playroom'), 'b21b: the glass door goes in to the playroom');
  check(await through(p, 'daycare'), 'and back out');
  check(await through(p, 'suns-neighbourhood'), 'the lane goes on to Sun\'s neighbourhood');
  await p.context().close();
}

async function floors(b) {
  const p = await open(b, '22-b20', 'one-international', [], ['one-international', 'one-international--meeting3', 'one-international--reference',
    'one-international--pt-hall', 'one-international--sales3']);
  check(await lift(p, '17F · The executive meeting room', 'one-international--meeting3') && await spot(p, 'b20'), 'b20: the lift up to the executive meeting room');
  check(await lift(p, '12F · The reference room', 'one-international--reference') && await spot(p, 'b23'), 'b23: and to the reference room');
  check(await lift(p, '4F · The PT hall', 'one-international--pt-hall') && await spot(p, 'b29') && await spot(p, 'b30'),
        'the PT hall: its podium (b29) and the evaluators\' table (b30)');
  await p.context().close();
}

async function slippers(b) {
  const p = await open(b, '22-b27', 'one-international--sales3', [], ['one-international--sales3']);
  check(await light(p) === 'night', `b27's gate: Sales 3 at night (${await light(p)})`);
  check(!await p.evaluate(() => window.__w.npcs.some(n => /^(kim|deputy|oh)-/.test(n.id) && n.spr.visible)), 'b27\'s gate: the team has gone home');
  await at(p, 'oh-desk-search');
  check(await p.evaluate(() => window.__w.cond('item:oh_slippers')), 'b27\'s gate: under Oh\'s desk, his slippers');
  await p.context().close();
}

async function team(b) {
  const p = await open(b, '22-b21', 'one-international--sales3', [], ['one-international--sales3']);
  const v = await p.evaluate(() => { const w = window.__w, r = w.refs || {}, vis = id => w.npcs.filter(n => n.id.startsWith(id) && n.spr.visible);
    const on = (id, c) => vis(id).some(n => r[c] && Math.abs(n.spr.x - r[c].x) < 4 && n.spr.y > r[c].y && n.spr.y - r[c].y < 16);
    const oh = w.npcs.find(n => n.id === 'oh-a');
    return { kim: on('kim-', 'desk-kim'), deputy: on('deputy-', 'desk-deputy'), oh: on('oh-', 'oh-desk'), slippers: !!oh && /slippers/.test(JSON.stringify(oh.say)) }; });
  check(v.kim && v.deputy && v.oh, `b21: Kim, the deputy and Oh at their own desks (${JSON.stringify(v)})`);
  check(v.slippers, 'b21: Oh in his office slippers (planted for the PT)');
  await p.context().close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  for (const t of [bakery, supplier, daycare, floors, slippers, team]) {
    try { await t(b); } catch (e) { fails++; console.log('FAIL', t.name, e.message); }
  }
  await b.close();
  console.log(fails ? `${fails} failed` : 'all passed');
  process.exit(fails ? 1 : 0);
})();
