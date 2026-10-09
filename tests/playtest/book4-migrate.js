// Book 4 (world 15) was reworked: 15 beats became 14 (old s8-s9 gone into s7, s13 split). A save from the old book is moved
// to the new keys once on load (TK.migrate): old s1-s7 stay, s10->s8, s11->s9, s12->s10, s13->s11+s12, s14->s13, s15->s14.
// Each case: an old save (cleared up to and including a beat, no migration mark), a load, then what's cleared now; and a
// second load doesn't move it again (a new s9 cleared after the move stays, s10 doesn't appear).
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const p = await (await b.newContext()).newPage();
  let fails = 0, checked = 0; const check = (ok, w) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  const OLD = n => Array.from({ length: n }, (_, i) => `15-s${i + 1}`);
  const load = async (seed) => {
    await p.goto(BASE + '#/'); await p.evaluate(seed => { localStorage.clear(); localStorage.setItem('gt-username', 'mig'); localStorage.setItem('tk-guide', 'off');
      if (seed) { const tk = {}, at = {}, t = Date.now() - 86400000; for (const k of seed) { tk[k] = 1; at[k] = t; } localStorage.setItem('gt-progress', JSON.stringify({ tk, tkAt: at })); } }, seed);
    await p.reload(); await p.evaluate(async () => { await TK.load(); });
    return p.evaluate(() => ({ cleared: Array.from({ length: 15 }, (_, i) => `15-s${i + 1}`).filter(k => TK.cleared(k)).map(k => k.slice(3)), mig: (JSON.parse(localStorage.getItem('gt-progress') || '{}').tkMig || {})[15] }));
  };
  const range = (a, z) => Array.from({ length: z - a + 1 }, (_, i) => `s${a + i}`);
  for (const [upto, want] of [[0, []], [5, range(1, 5)], [7, range(1, 7)], [10, range(1, 8)], [11, range(1, 9)], [12, range(1, 10)], [13, range(1, 12)], [14, range(1, 13)], [15, range(1, 14)]]) {
    const r = await load(OLD(upto));
    check(JSON.stringify(r.cleared) === JSON.stringify(want) && r.mig === 2, `an old save cleared up to s${upto}: now ${r.cleared.join(',') || 'none'} (want ${want.join(',') || 'none'}), migrated mark ${r.mig}`);
  }
  // once only: after the move, the new s9 cleared, and loaded again: nothing moves
  await load(OLD(10));
  await p.evaluate(() => TK.markCleared('15-s9')); await p.reload(); await p.evaluate(async () => { await TK.load(); });
  const again = await p.evaluate(() => Array.from({ length: 15 }, (_, i) => `15-s${i + 1}`).filter(k => TK.cleared(k)).map(k => k.slice(3)));
  check(JSON.stringify(again) === JSON.stringify(range(1, 9)), `moved once only: new s9 cleared after the move, loaded again: ${again.join(',')} (want s1-s9)`);
  console.log(`book4-migrate: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
