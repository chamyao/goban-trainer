// Red Chamber's street (world 31), two engine pieces Places asked for:
//   1. a spot reached the long way round (g3's "via": the west lane's mouth, then its top): the goal marker leads to
//      each via point in turn, moving on as she reaches it, and then to the spot itself.
//   2. people here only until a beat (the groom by the sedan chairs, until g2) are gone once it's won, and stay gone
//      when the story moves on (tk-world.js refreshStory).
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
const URL = process.env.PLAYTEST_URL || 'http://localhost:8765';
let fails = 0; const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
async function open(b, upto, place, party) {
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  await p.goto(`${URL}/index.html?test=1#/`);
  await p.evaluate(async ([upto, place, party]) => {
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
    localStorage.setItem('tk-guide', 'off'); localStorage.setItem('gt-username', 'hlm'); await TK.load();
    for (const n of TK.world(31).nodes) { if (n.key === `31-${upto}`) break; TK.markCleared(n.key); }
    TK.markSeen('31:opening'); localStorage.setItem('tk-world-31', JSON.stringify({ place, party }));
  }, [upto, place, party]);
  await p.goto(`${URL}/index.html?test=1#/tk/31`); await p.reload();
  for (let i = 0; i < 80; i++) {
    const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {});
    if (await p.evaluate(pl => !!(window.__w && window.__w.player && !window.__w.leaving && window.__w.npcs && window.__w.placeId === pl), place)) break;
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1200);
  for (let i = 0; i < 30; i++) { if (!await p.evaluate(() => window.__w.ui.busy())) break; await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150); }
  return p;
}
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  // 1. g3's via points
  let p = await open(b, 'g3', 'ning-rong-street', ['grannyliu', 'baner']);
  const s = await p.evaluate(() => { const w = window.__w, sp = Object.values(w.spots).find(s => s.node === '31-g3'); return { via: sp.via, spot: { x: sp.x, y: sp.y } }; });
  check(s.via && s.via.length === 2, `g3's spot has two via points (${JSON.stringify(s.via)})`);
  const goal = () => p.evaluate(() => { const g = window.__w.goalAt; return g && { x: Math.round(g.x), y: Math.round(g.y), via: g.via || null }; });
  let g = await goal();
  check(g && g.via && Math.abs(g.x - s.via[0].x) < 2 && Math.abs(g.y - s.via[0].y) < 2, `on arrival the goal is the lane's mouth (${JSON.stringify(g)})`);
  await p.evaluate(v => window.__w.player.body.reset(v.x + 10, v.y), s.via[0]); await p.waitForTimeout(400);
  g = await goal();
  check(g && g.via && Math.abs(g.x - s.via[1].x) < 2 && Math.abs(g.y - s.via[1].y) < 2, `reached, it moves on to the top of the lane (${JSON.stringify(g)})`);
  await p.evaluate(v => window.__w.player.body.reset(v.x, v.y + 10), s.via[1]); await p.waitForTimeout(400);
  g = await goal();
  check(g && !g.via && Math.abs(g.x - s.spot.x) < 2, `then the spot itself (${JSON.stringify(g)})`);
  await p.context().close();
  // 2. the groom, until g2
  p = await open(b, 'g2', 'ning-rong-street', ['grannyliu', 'baner']);
  const groom = () => p.evaluate(() => window.__w.npcs.filter(n => n.until === '31-g2' && n.spr.visible).length);
  const before = await groom();
  check(before > 0, `before g2 is won, those here until it are here (${before})`);
  await p.evaluate(() => { const w = window.__w; TK.markCleared('31-g2'); if (w.vanish) w.vanish('31-g2'); w.refreshStory(); });
  await p.waitForTimeout(1500);
  check(await groom() === 0, 'once g2 is won they are gone, and the story moving on does not bring them back');
  await p.context().close();
  console.log(fails ? `${fails} FAIL` : 'all ok'); await b.close(); process.exit(fails ? 1 : 0);
})();
