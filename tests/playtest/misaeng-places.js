// Misaeng Book 1 (world 21, "The First Move", episodes 0-16): what Places built, walked in the engine.
//   1. The commute (m8): from home in Susaek-dong, the subway and Jongno are open (open_ways), and the subway's
//      commuter (a blocking challenger) stands on the way while m8 is open.
//   2. Jongno's carriageway is solid: walking south off the pavement stops at the kerb; at a crosswalk she crosses.
//      Doors into other places ("to"): the tower's door into the lobby; the lift's menu up to General Affairs (2F),
//      Sales Team 3 (14F) and the textile team (8F), whose door (the stairs) comes back down; out onto Jongno, down the
//      subway stairs, up in Susaek-dong.
//   3. m11's gate: Kim's requisition, handed to the clerk at General Affairs' counter.
//   4. m14's three errands: the copier gives the copies, handed to Kim Dong-sik at his desk; the forwarder call at the
//      team phone; the cleaning cupboard's mop taken to the spill ("wipe this floor"); with all three, m14's gate is met.
//   5. Storefronts are entered at their drawn (south) doors: the baduk class, the KBA café, the hof.
//      m19c-m22c's walks: the meeting room down to Jongno at night (the team dinner, m19d, in the hof); the street by
//      the hof at night after drinks (m21b); Sales 3 down to the lobby and up the lift to the textile floor (m22c).
//   6. m5: episode 1's evening on Jongno: its townsfolk are out in the evening, gone by day.
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
async function commute(b) {
  const p = await open(b, '21-m8', 'susaek-dong', [], ['susaek-dong']);
  const open_ = await p.evaluate(() => ['the-subway', 'jongno'].map(x => [x, window.__w.placeOpen(x)]));
  for (const [x, o] of open_) check(o, `m8: from home, ${x} is open (the way to the café)`);
  check(await through(p, 'the-subway'), 'm8: Susaek-dong\'s station stairs go down into the subway');
  check(await shown(p, 'commuter'), 'm8: the commuter stands in the subway on the way to Jongno');
  await p.context().close();
}

async function street(b) {
  // (every place on the way visited, so the doors are tested on their own; the commute checks what's open)
  const p = await open(b, '21-m11', 'jongno', [], ['susaek-dong', 'the-subway', 'jongno', 'one-international', 'one-international--general-affairs',
    'one-international--sales3', 'one-international--textile']);
  const T = 16;
  // the carriageway: tile rows 32-39; the north pavement is rows 28-31; a crosswalk at tiles 20-23 (cross-w) and 72-75
  await p.evaluate(T => window.__w.player.body.reset(10.5 * T, 30 * T), T);
  const kerb = await walk(p, 0, 50, 4000);
  check(kerb.y < 32.5 * T, `Jongno: walking south off the pavement stops at the carriageway (y ${(kerb.y / T).toFixed(1)} tiles)`);
  await p.evaluate(T => window.__w.player.body.reset(21.5 * T, 30 * T), T);
  const crossed = await walk(p, 0, 50, 4000);
  check(crossed.y > 40 * T, `Jongno: at the crosswalk she crosses to the south pavement (y ${(crossed.y / T).toFixed(1)} tiles)`);
  check(await through(p, 'one-international'), 'the tower\'s door goes into One International (the lobby)');
  check(await lift(p, '2F · General Affairs', 'one-international--general-affairs'), 'the lobby\'s lift goes up to General Affairs (its floor menu)');
  check(await lift(p, '14F · Sales Team 3', 'one-international--sales3'), 'and from there to Sales Team 3');
  check(await lift(p, '8F · The textile team', 'one-international--textile'), 'and to the textile team\'s floor');
  check(await through(p, 'one-international'), 'the textile floor\'s door (the stairs) comes back down to the lobby');
  check(await through(p, 'jongno'), 'the lobby\'s doors go out onto Jongno');
  check(await through(p, 'the-subway'), 'Jongno 3-ga Station\'s stairs go down into the subway');
  check(await through(p, 'susaek-dong'), 'the subway\'s far end comes up in Susaek-dong');
  await p.context().close();
}

async function requisition(b) {
  const p = await open(b, '21-m11', 'one-international--general-affairs', ['requisition']);
  check(await to(p, 'ga-clerk'), 'm11: the clerk stands at General Affairs\' counter');
  const s = await st(p);
  check(s.marks.includes('requisition') && !s.items.includes('requisition'), 'm11: the clerk takes Kim\'s requisition from you, by hand');
  check(await p.evaluate(() => window.__w.cond('mark:requisition')), 'm11: its gate (the requisition) is met');
  await p.context().close();
}

async function errands(b) {
  const p = await open(b, '21-m14', 'one-international--sales3');
  check(await shown(p, 'kim-errand'), 'm14: Kim Dong-sik is at his desk while the errands are open');
  await to(p, 'kim-errand');   // nothing to give him yet: he waits, and nothing is marked
  check(!(await st(p)).marks.includes('errand_copy'), 'm14: Kim waits for the copies');
  await at(p, 'copier');
  check((await st(p)).items.includes('copy'), 'm14: the copier gives the copies');
  await at(p, 'errand-floor');   // no mop yet: the spill waits
  check(!(await st(p)).marks.includes('errand_floor'), 'm14: the spill needs the mop');
  await at(p, 'mop-cupboard');
  check((await st(p)).items.includes('mop'), 'm14: the cleaning cupboard gives the mop');
  await to(p, 'kim-errand'); await at(p, 'errand-bl'); await at(p, 'errand-floor');
  const s = await st(p);
  check(['errand_copy', 'errand_bl', 'errand_floor'].every(m => s.marks.includes(m)) && !s.items.includes('copy') && !s.items.includes('mop'),
        `m14: the copies handed to Kim, the phone call made, the floor mopped (${s.marks.join(', ')})`);
  check(await p.evaluate(() => ['errand_copy', 'errand_bl', 'errand_floor'].every(m => window.__w.cond('mark:' + m))), 'm14: its gate (the three errands) is met');
  await p.context().close();
}

async function walks(b) {
  // a storefront's door is drawn on its south face, and it's entered there (the baduk class, m1; the KBA café, m3)
  for (const [upto, place, door] of [['21-m1', 'susaek-dong', 'baduk-class'], ['21-m3', 'korea-baduk-association', 'kba-cafe']]) {
    const q = await open(b, upto, place, [], [place]);
    check(await through(q, door), `${upto.slice(3)}: into ${door} by its drawn door`);
    await q.context().close();
  }
  const light = p => p.evaluate(() => { const st = window.__w.mapState(); return st ? st.light : 'day'; });
  // m19d: from the meeting room (m19c) to the team dinner: the tower, Jongno and the hof are open, Jongno at night
  let p = await open(b, '21-m19d', 'one-international--meeting', [], ['one-international', 'one-international--meeting', 'jongno']);
  check(await p.evaluate(() => ['one-international', 'jongno'].every(x => window.__w.placeOpen(x))), 'm19d: from the meeting room, the lobby and Jongno are open');
  check(await through(p, 'one-international'), 'm19d: the meeting room\'s stairs go down to the lobby');
  check(await through(p, 'jongno'), 'm19d: out onto Jongno');
  check(await light(p) === 'night', `m19d: Jongno at night for the team dinner (${await light(p)})`);
  check(!await shown(p, 'hof-door'), 'm19d: no one keeps the hof\'s door now');
  check(await through(p, 'hof'), 'm19d: into the hof');
  check(await p.evaluate(() => !!window.__w.spots.m19d), 'm19d: the team dinner\'s spot is in the hof');
  await p.context().close();
  // m21b: from Oh's desk (m21) out to the street by the hof, at night
  p = await open(b, '21-m21b', 'jongno', [], ['jongno']);
  check(await light(p) === 'night' && await p.evaluate(() => !!window.__w.spots.m21b), 'm21b: the street by the hof, at night');
  await p.context().close();
  // m22c: after Sales 3's table (m22b), down to the lobby and up to the textile floor
  p = await open(b, '21-m22c', 'one-international', [], ['one-international', 'one-international--sales3', 'one-international--textile']);
  check(await lift(p, '8F · The textile team', 'one-international--textile'), 'm22c: the lobby\'s lift goes up to the textile floor');
  check(await p.evaluate(() => !!window.__w.spots.m22c), 'm22c: behind the partition, on the textile floor');
  await p.context().close();
}

async function evening(b) {
  const count = async (upto) => { const p = await open(b, upto, 'jongno', [], ['jongno']);
    const c = await p.evaluate(() => ['npc-6', 'npc-7', 'npc-8', 'npc-9', 'npc-10'].filter(id => { const n = window.__w.npcs.find(n => n.id === id); return n && n.spr.visible; }).length);
    await p.context().close(); return c; };
  const eve = await count('21-m5'), day = await count('21-m9');
  check(eve === 5, `m5: Jongno's evening townsfolk are out (${eve} of 5)`);
  check(day === 0, `m9: by day they're gone (${day})`);
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  for (const t of [commute, street, requisition, errands, walks, evening]) {
    try { await t(b); } catch (e) { fails++; console.log('FAIL', t.name, e.message); }
  }
  await b.close();
  console.log(fails ? `${fails} failed` : 'all passed');
  process.exit(fails ? 1 : 0);
})();
