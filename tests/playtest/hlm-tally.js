// Red Chamber's tally of smiles (tk.js TKTally, world 31 "tally"): a wrong move on a counted board adds one, the jade
// board (d7~2) and Part 2's boards don't, another book's slips don't; the d8 scroll says none, then the count; a Three
// Kingdoms book has no tally. (The watch step, tk-world.js watchRoom, is tested once world 31's maps are in.)
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ viewport: { width: 1200, height: 800 } })).newPage();
  let fails = 0; const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); };
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const URL = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1#/';
  await p.goto(URL); await p.evaluate(() => localStorage.setItem('gt-username', 'hlm')); await p.reload();
  const r = await p.evaluate(async () => {
    localStorage.removeItem('tk-tally'); await TK.load(); const w = TK.world(31), out = {};
    out.zero = TKTally.count(w);
    TKTally.slip(w, '31-d2'); TKTally.slip(w, '31-d5~2'); out.two = TKTally.count(w);
    TKTally.slip(w, '31-d7~2'); TKTally.slip(w, '31-g6~3'); TKTally.slip(TK.world(14), '14-x3'); out.still = TKTally.count(w);
    out.tk = !TK.world(14).tally && !TK.world(15).tally;
    return out;
  });
  check(r.zero === 0, 'no smiles to start');
  check(r.two === 2, 'two slips on counted boards: 2');
  check(r.still === 2, 'the jade board, Part 2 and another book add none');
  check(r.tk, 'the Three Kingdoms books have no tally');
  const scroll = async () => { const sh = p.evaluate(() => TKTally.show(TK.world(31))); await p.waitForSelector('.tk-scroll-wrap'); const t = await p.locator('.tk-scroll-wrap').innerText(); await p.click('.tk-scroll-go'); await sh; return t; };
  const t2 = await scroll();
  check(/一日已尽/.test(t2) && /有2回/.test(t2) && /2 times today/.test(t2), `the d8 scroll gives the count: ${JSON.stringify(t2)}`);
  await p.evaluate(() => localStorage.removeItem('tk-tally'));
  const t0 = await scroll();
  check(/没有一个人掩口笑她/.test(t0) && /no one smiled/.test(t0), 'with none: the novel\'s Daiyu, never laughed at');
  console.log(fails ? `${fails} FAIL` : 'all ok'); await b.close(); process.exit(fails ? 1 : 0);
})();
