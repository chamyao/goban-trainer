// Red Chamber's watching (tk-world.js watchRoom) and tally (tk.js TKTally), in the world (world 31):
//   1. d2 open in Grandmother Jia's rooms: the goal box offers 察看 Watch the room; a tap gives each cue in turn, the
//      camera on its giver (a cast member standing in the room); the scene hasn't started.
//   2. d5 (Lady Wang's rooms): the first look ends with "nothing more, yet" and not the wait cue; the second look has it.
//   3. g5 (the east room): Granny Liu's first look is her dazzle alone; the second gives the cue.
//   4. Not offered where the open beat isn't (d2 open, standing in the courtyard), nor in a Three Kingdoms book.
//   5. d8: playing the gauze-closet scene brings the day's-end scroll with the smiles counted (2 set beforehand).
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
const URL = process.env.PLAYTEST_URL || 'http://localhost:8765';
let fails = 0; const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };

async function open(b, N, upto, place, party) {
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  await p.goto(`${URL}/index.html?test=1#/`);
  await p.evaluate(async ([N, upto, place, party]) => {
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
    localStorage.setItem('tk-guide', 'off'); localStorage.setItem('gt-username', 'hlm'); await TK.load();
    for (const n of TK.world(N).nodes) { if (n.key === `${N}-${upto}`) break; TK.markCleared(n.key); }
    TK.markSeen(`${N}:opening`);
    localStorage.setItem(`tk-world-${N}`, JSON.stringify({ place, party }));
  }, [N, upto, place, party]);
  await p.goto(`${URL}/index.html?test=1#/tk/${N}`); await p.reload();
  for (let i = 0; i < 80; i++) {
    const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {});
    if (await p.evaluate(pl => !!(window.__w && window.__w.player && !window.__w.leaving && window.__w.npcs && window.__w.placeId === pl), place)) break;
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1200); await advance(p);
  return p;
}
async function advance(p) { for (let i = 0; i < 30; i++) { if (!await p.evaluate(() => window.__w && window.__w.ui.busy())) break; await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150); } }
const watchBtn = p => p.locator('.town-goal-watch');
// one look: tap Watch, read each line shown (and where the camera went) until the box closes
async function look(p) {
  await watchBtn(p).click();
  const seen = [];
  for (let i = 0; i < 20; i++) {
    await p.waitForTimeout(500);
    const s = await p.evaluate(() => { const w = window.__w, d = document.querySelector('.town-dlg'); if (!w.ui.busy()) return null;
      w.ui.advance();   // the whole line, not the typewriter's part of it
      const v = w.cameras.main.worldView; return { zh: d.querySelector('.town-zh').textContent, en: d.querySelector('.town-en').textContent, view: [v.x, v.y, v.right, v.bottom] }; });
    if (!s) break;
    seen.push(s); await p.evaluate(() => window.__w.ui.advance());
  }
  await p.waitForTimeout(600);
  return seen;
}
const giver = (p, who) => p.evaluate(who => { const w = window.__w, n = w.npcs.find(n => n.who === who && n.spr.visible); if (!n) return null; const v = w.view(n.spr.x, n.spr.y); return { x: Math.round(v.x), y: Math.round(v.y) }; }, who);

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const data = await (async () => { const p = await b.newPage(); await p.goto(`${URL}/data/tk.json`); const d = JSON.parse(await p.evaluate(() => document.body.innerText)); await p.close(); return d.worlds.find(w => w.n === 31); })();
  const cues = k => data.watch[`31-${k}`].cues;

  // 1. d2
  let p = await open(b, 31, 'd2', 'the-rong-mansion--jm-rooms', ['daiyu']);
  check(await watchBtn(p).count() === 1, 'd2 open in Grandmother Jia\'s rooms: the goal box offers Watch the room');
  const g0 = await giver(p, cues('d2')[0].line[1]);
  check(!!g0, `the first cue-giver (${cues('d2')[0].line[1]}) stands in the room`);
  let seen = await look(p);
  check(seen.length === cues('d2').length && seen.every((s, i) => s.en.includes(cues('d2')[i].line[2])), `a look gives each cue in turn: ${JSON.stringify(seen.map(s => s.en))}`);
  const onScreen = (s, g) => s && g && g.x > s.view[0] && g.x < s.view[2] && g.y > s.view[1] && g.y < s.view[3];
  check(cues('d2').every((c, i) => true) && onScreen(seen[0], g0), `the cue-giver is on screen for their line (${seen[0] && seen[0].view.map(Math.round)} vs ${g0 && [g0.x, g0.y]})`);
  check(!(await p.evaluate(() => TK.cleared('31-d2'))) && !(await p.evaluate(() => !!window.__w.cine)), 'watching doesn\'t start or clear the beat');
  check(await p.evaluate(() => window.__w.canMove()), 'after a look she can move again');
  await p.context().close();

  // 4. not where the beat isn't
  p = await open(b, 31, 'd2', 'the-rong-mansion', ['daiyu']);
  check(await watchBtn(p).count() === 0, 'd2 open, but in the courtyard: no Watch');
  await p.context().close();

  // 2. d5's wait cue
  p = await open(b, 31, 'd5', 'the-rong-mansion--wf-rooms', ['daiyu']);
  const wait = cues('d5').find(c => c.wait);
  seen = await look(p);
  check(!seen.some(s => s.en.includes(wait.line[2])) && seen.length === cues('d5').filter(c => !c.wait).length + 1, `d5 first look: not the wait cue, and "nothing more, yet" (${seen.length} lines)`);
  seen = await look(p);
  check(seen.some(s => s.en.includes(wait.line[2])), `d5 second look: the wait cue (${wait.line[2]})`);
  await p.context().close();

  // 3. g5 dazzled
  p = await open(b, 31, 'g5', 'the-rong-mansion--xf-eastroom', ['grannyliu']);
  seen = await look(p);
  check(seen.length === 1 && seen[0].en.includes(data.watch['31-g5'].dazzled[1]), `g5 first look: only her dazzle (${JSON.stringify(seen.map(s => s.en))})`);
  seen = await look(p);
  check(seen.length === cues('g5').length && seen[0].en.includes(cues('g5')[0].line[2]), 'g5 second look: the cue');
  await p.context().close();

  // 4b. a Three Kingdoms book
  p = await open(b, 15, 's2', null, null).catch(() => null);
  if (p) { check(await watchBtn(p).count() === 0, 'a Three Kingdoms book: no Watch'); await p.context().close(); }

  // 5. d8's tally scroll
  p = await open(b, 31, 'd8', 'the-rong-mansion--gauze-closet', ['daiyu']);
  await p.evaluate(() => { const a = TK.ls('tk-tally'); a[31] = 2; TK.lsSet('tk-tally', a); });
  await p.evaluate(() => { const w = window.__w, q = w.region.quests.find(q => q.node === '31-d8'), s = Object.values(w.spots).find(s => s.node === '31-d8' || (s.q && s.q.node === '31-d8')); w.playQuest(q, s || { intro: [] }); });
  let txt = '';
  for (let i = 0; i < 200 && !txt; i++) {
    const t = await p.evaluate(() => { const s = document.querySelector('.tk-scroll-wrap'); return s && /一日已尽/.test(s.innerText) ? s.innerText : ''; });
    if (t) { txt = t; break; }
    await p.evaluate(() => { const w = window.__w; if (w.ui.busy()) w.ui.advance(); });
    const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {});
    await p.waitForTimeout(250);
  }
  check(/有2回/.test(txt) && /2 times today/.test(txt), `d8: the day's-end scroll counts the smiles (${JSON.stringify(txt.slice(0, 80))})`);
  await p.context().close();

  console.log(fails ? `${fails} FAIL` : 'all ok'); await b.close(); process.exit(fails ? 1 : 0);
})();
