// Book 4 (world 15) was renumbered twice, and a save is moved to the new keys once on load (TK.migrate, tkMig[15] = 3):
//  v2, the rework (15 beats to 14): old s1-s7 stay, s10->s8, s11->s9, s12->s10, s13->s11+s12, s14->s13, s15->s14;
//  v3, the rebuild around Zhou Yu's schemes (14 to 16): s1-s7 stay, s8-s14 -> s10-s16, and the new s8 and s9 count as
//  played for a save already past them.
// Each case: a first-book save (no mark) or a rework save (mark 2), a load, then what's cleared now; and a second load
// doesn't move it again (a new s11 cleared after the move stays, s12 doesn't appear).
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
  const load = async (seed, mig) => {
    await p.goto(BASE + '#/'); await p.evaluate(([seed, mig]) => { localStorage.clear(); localStorage.setItem('gt-username', 'mig'); localStorage.setItem('tk-guide', 'off');
      if (seed) { const tk = {}, at = {}, t = Date.now() - 86400000; for (const k of seed) { tk[k] = 1; at[k] = t; } localStorage.setItem('gt-progress', JSON.stringify(Object.assign({ tk, tkAt: at }, mig ? { tkMig: { 15: mig } } : {}))); } }, [seed, mig || 0]);
    await p.reload(); await p.evaluate(async () => { await TK.load(); });
    return p.evaluate(() => ({ cleared: Array.from({ length: 16 }, (_, i) => `15-s${i + 1}`).filter(k => TK.cleared(k)).map(k => k.slice(3)), mig: (JSON.parse(localStorage.getItem('gt-progress') || '{}').tkMig || {})[15] }));
  };
  const range = (a, z) => Array.from({ length: z - a + 1 }, (_, i) => `s${a + i}`);
  // a first-book save (15 beats)
  for (const [upto, want] of [[0, []], [5, range(1, 5)], [7, range(1, 7)], [10, range(1, 10)], [11, range(1, 11)], [12, range(1, 12)], [13, range(1, 14)], [14, range(1, 15)], [15, range(1, 16)]]) {
    const r = await load(OLD(upto));
    check(JSON.stringify(r.cleared) === JSON.stringify(want) && r.mig === 3, `a first-book save cleared up to s${upto}: now ${r.cleared.join(',') || 'none'} (want ${want.join(',') || 'none'}), migrated mark ${r.mig}`);
  }
  // a rework save (14 beats, mark 2)
  for (const [upto, want] of [[7, range(1, 7)], [9, range(1, 11)], [14, range(1, 16)]]) {
    const r = await load(OLD(upto), 2);
    check(JSON.stringify(r.cleared) === JSON.stringify(want) && r.mig === 3, `a rework save cleared up to s${upto}: now ${r.cleared.join(',') || 'none'} (want ${want.join(',') || 'none'}), migrated mark ${r.mig}`);
  }
  // once only: after the move, the new s11 cleared, and loaded again: nothing moves
  await load(OLD(10));
  await p.evaluate(() => TK.markCleared('15-s11')); await p.reload(); await p.evaluate(async () => { await TK.load(); });
  const again = await p.evaluate(() => Array.from({ length: 16 }, (_, i) => `15-s${i + 1}`).filter(k => TK.cleared(k)).map(k => k.slice(3)));
  check(JSON.stringify(again) === JSON.stringify(range(1, 11)), `moved once only: new s11 cleared after the move, loaded again: ${again.join(',')} (want s1-s11)`);
  console.log(`book4-migrate: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
