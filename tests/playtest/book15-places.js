// Book 15 (Lady Sun's marriage): the three map mechanics Places built, walked in the engine.
//   1. the loud town (Nanxu, s3 -> s4): tell Qiao Guolao's steward, and the news runs house to house by itself (relays
//      hanging out red) to Lady Wu's gatekeeper within 25 s; then s4 plays in her hall.
//   2. the axemen (Sweet Dew Temple, before s5): each of the three axemen's side rooms delivers its mark when the man by
//      the door is talked to; a monk's room delivers nothing; with all three, s5's gate is open.
//   3. the face-downs (the road to Chaisang, s11 -> s12 and s12 -> s13): standing still before the first rank, facing it,
//      its men step aside; running at the next rank is a catch, back to where that block began.
// Run with the site served on :8765 (tests/playtest/run.sh book15-places). The layouts are proved in
// tools/proofs/ladysun_ls.py; this checks the engine plays them that way.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = process.env.PLAYTEST_URL || 'http://localhost:8765';
let fails = 0;
const check = (ok, what) => { fails += !ok; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); };

async function open(b, upto, place, party) {   // the story cleared up to (not including) `upto`, standing in `place`
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: require('path').join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.goto(`${URL}/index.html?test=1#/tk/15`); await p.waitForTimeout(800);
  await p.evaluate(async ([upto, place, party]) => {
    localStorage.setItem('tk-guide', 'off'); await TK.load();
    for (const n of TK.world(15).nodes) { if (n.key === upto) break; TK.markCleared(n.key); }
    localStorage.setItem('tk-world-15', JSON.stringify({ place, party }));
  }, [upto, place, party]);
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

async function loudTown(b) {
  const p = await open(b, '15-s4', 'nanxu', ['zhaoyun', 'liubei']);
  await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.id === 'g-qiao'); w.player.body.reset(n.spr.x, n.spr.y + 20); WorldFeats.tell(w, n); });
  await advance(p);
  let at = null, shown = 0;
  for (let t = 1; t <= 40; t++) {
    await p.waitForTimeout(1000); await advance(p);
    const s = await p.evaluate(() => ({ told: (window.__w.st.told || []).slice(), shown: (window.__w.toldProps || []).filter(t => t.img && t.img.visible).length, place: window.__w.placeId }));
    shown = Math.max(shown, s.shown);
    if (s.told.includes('wu-gatekeeper') && at === null) at = t;
    if (s.place !== 'nanxu') break;
  }
  check(at !== null && at <= 25, `loud town: the news reaches Lady Wu's gatekeeper by itself (${at} s)`);
  check(shown >= 3, `loud town: red hangings go up as it goes (${shown} seen)`);
  for (let t = 0; t < 20; t++) { if (await p.evaluate(() => window.__w.placeId === 'nanxu--wu-hall')) break; await p.waitForTimeout(500); await advance(p); }
  check(await p.evaluate(() => window.__w.placeId === 'nanxu--wu-hall'), 'loud town: s4 plays in Lady Wu\'s hall');
  await p.context().close();
}

async function axemen(b) {
  const rooms = [['side-w1', 1], ['side-w2', 0], ['side-w3', 2], ['side-e2', 3]];   // [room, the mark it delivers (0: none)]
  const p = await open(b, '15-s5', 'sweet-dew-temple', ['zhaoyun', 'liubei', 'sunqian']);
  for (const [room, mark] of rooms) {   // one save: the marks found so far are kept from room to room
    await p.evaluate(r => { const st = JSON.parse(localStorage.getItem('tk-world-15') || '{}'); st.place = `sweet-dew-temple--${r}`; st.pos = null; localStorage.setItem('tk-world-15', JSON.stringify(st)); }, room);
    await p.reload();
    for (let i = 0; i < 80; i++) { if (await p.evaluate(r => !!(window.__w && window.__w.npcs && window.__w.placeId === `sweet-dew-temple--${r}` && !window.__w.leaving), room)) break; await p.waitForTimeout(200); }
    await advance(p);
    const before = await p.evaluate(() => [1, 2, 3].map(i => window.__w.cond(`mark:axemen_${i}`)));
    await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.spr.visible); w.player.body.reset(n.spr.x, n.spr.y + 18); w.player.facing = 'up'; w.act({ kind: 'npc', n }); });
    await p.waitForTimeout(300); await advance(p);
    const after = await p.evaluate(() => [1, 2, 3].map(i => window.__w.cond(`mark:axemen_${i}`)));
    const gained = after.map((v, i) => v && !before[i] ? i + 1 : 0).filter(Boolean);
    check(mark ? gained.join() === String(mark) : gained.length === 0, `axemen: ${room} delivers ${mark ? 'axemen_' + mark : 'nothing'} (got ${gained.join() || 'nothing'})`);
  }
  check(await p.evaluate(() => { const q = window.__w.region.quests.find(q => q.node === '15-s5'); return !window.__w.gateFor(q); }), 'axemen: with all three found, s5\'s gate is open');
  await p.context().close();
}

async function faceDown(b, upto, first, second, backTo) {
  const p = await open(b, upto, 'the-road-to-chaisang', ['ladysun', 'zhaoyun']);
  const men = await p.evaluate(() => window.__w.npcs.filter(n => n.yield && n.spr.visible).map(n => ({ id: n.id, g: n.yield.group, x: n.spr.x, y: n.spr.y })));
  const r1 = men.filter(m => m.g === first), rx = Math.min(...r1.map(m => m.x)), ry = r1.reduce((a, m) => a + m.y, 0) / r1.length;
  await p.evaluate(([x, y]) => { const w = window.__w; w.player.body.reset(x, y); w.player.facing = 'right'; }, [rx - 48, ry]);
  for (let t = 0; t < 14; t++) { await p.waitForTimeout(700); await advance(p); await p.evaluate(() => { window.__w.player.facing = 'right'; }); }
  const aside = await p.evaluate(g => window.__w.npcs.filter(n => n.yield && n.yield.group === g && n.stoodAside).length, first);
  check(aside >= 2, `face-down ${first}: facing the rank, its men step aside (${aside} of ${r1.length})`);
  await p.keyboard.down('ArrowRight');
  let caught = false;
  for (let i = 0; i < 80 && !caught; i++) { await p.waitForTimeout(100); caught = await p.evaluate(() => !!window.__w.caught || window.__w.ui.busy()); }
  await p.keyboard.up('ArrowRight'); await advance(p); await p.waitForTimeout(1200);
  const back = await p.evaluate(s => { const w = window.__w, sp = w.spots[s]; return sp ? Math.hypot(w.player.x - sp.x, w.player.y - sp.y) : 1e9; }, backTo);
  check(caught && back < 48, `face-down ${second}: running at the rank is a catch, back to ${backTo} (${Math.round(back)} px off)`);
  await p.context().close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  await loudTown(b);
  await axemen(b);
  await faceDown(b, '15-s12', 'xusheng', 'dingfeng', 'block1-start');
  await faceDown(b, '15-s13', 'chenwu', 'panzhang', 'block2-start');
  await b.close();
  console.log(fails ? `FAIL ${fails}` : 'all ok');
  process.exit(fails ? 1 : 0);
})();
