// Red Chamber (world 31), phone, fresh save, from the Library by taps: the 红楼梦 card, the book, then the opening
// scroll "Chapters 1 and 2" (the stone, the crimson pearl flower and its tears, Daiyu sent for, the empty frame, "You
// are Lin Daiyu"), Chinese over English, read and turned by taps; it plays once. After it the book starts at d1 (the
// side gate, the Rong mansion) with no page error: in the walkable world once its maps are in (data/tk_maps/w31), else
// on the book page. The book's line names chapters 1–6, the crumbs the novel.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ ...devices[process.env.PLAYTEST_DEVICE || 'iPhone 13'] })).newPage();
  let fails = 0; const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
  const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('ERR', e.message, '@', (String(e.stack).split('\n')[1] || '').trim()); });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const URL = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  await p.goto(URL + '#/'); await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k); localStorage.setItem('tk-guide', 'off'); localStorage.setItem('gt-username', 'hlm'); });
  await p.reload(); await p.waitForSelector('.tk-card');
  await p.locator('a.tk-card-hongloumeng').tap(); await p.waitForSelector('.tk-worlds', { timeout: 20000 });
  const book = p.locator('.tk-worlds .tk-world').filter({ hasText: '侯门深似海' });
  check(await book.count() === 1, 'the card lists Deep as the Sea');
  // the book's own line: chapters 1–6 (the Three Kingdoms books give first and last: "chapters 3–5")
  const sub = await p.locator('.tk-head .sub').first().innerText().catch(() => '');
  check(/chapters 1–6\b/.test(sub), `the book's line names chapters 1–6 (${sub})`);
  // the opening scroll (the book page plays it on first open; tap the book if it hasn't come)
  if (!(await p.locator('.tk-scroll h3').count())) { await book.first().tap(); await p.waitForTimeout(1500); }
  for (let i = 0; i < 30 && !(await p.locator('.tk-scroll h3').count()); i++) await p.waitForTimeout(200);
  const head = await p.locator('.tk-scroll h3').innerText().catch(() => '');
  check(/第一回、第二回/.test(head) && /Chapters 1 and 2/.test(head), `the opening scroll: ${head.replace(/\s+/g, ' ')}`);
  const body = await p.locator('.tk-scroll').innerText().catch(() => '');
  for (const [zh, en] of [['女娲氏炼石补天', 'Nüwa mended the sky'], ['眼泪还他', 'all the tears of a lifetime'], ['名唤黛玉', 'Daiyu, sickly and clever'],
    ['内囊却也尽上来了', 'the purse inside is nearly empty'], ['你是林黛玉', 'You are Lin Daiyu. Give no one a reason to laugh.']])
    check(body.includes(zh) && body.includes(en), `the scroll has 「${zh}」 / ${en}`);
  const order = await p.evaluate(() => { const s = document.querySelector('.tk-scroll'); if (!s) return null; const t = s.innerText; return t.indexOf('女娲') < t.indexOf('Nüwa') && t.indexOf('你是林黛玉') < t.indexOf('You are Lin Daiyu'); });
  check(order === true, 'Chinese above English');
  await p.screenshot({ path: path.join(__dirname, 'out/hlm-opening-scroll.png') });
  // read it by taps: scroll the text with a finger, then the turn button
  const go = p.locator('.tk-scroll-go').first();
  check(await go.count() === 1, 'a button to go on');
  let turns = 0;
  while (await p.locator('.tk-scroll-go').count() && turns < 6) { await p.locator('.tk-scroll-go').first().tap(); turns++; await p.waitForTimeout(1200); }
  check(!(await p.locator('.tk-scroll h3').count()), `the scroll closes on a tap (${turns} tap${turns === 1 ? '' : 's'})`);
  await p.waitForTimeout(3000);
  const st = await p.evaluate(() => {
    const w = window.__w, info = document.querySelector('.tk-info');
    return { world: !!(w && w.player), place: w && w.placeId, next: w && w.nextMain && (w.nextMain() || {}).node, goal: (document.querySelector('.town-goal') || {}).textContent,
      at: TK.at(31), info: info && info.innerText, seen: TK.seen('31:opening'), crumbs: (document.querySelector('#crumbs') || {}).textContent };
  });
  if (st.world) check(st.next === '31-d1', `the walkable world: d1 is next (${st.next}, at ${st.place}; goal: ${st.goal})`);
  else {
    console.log('NOTE no walkable world yet (data/tk_maps/w31 not in): the book page');
    check(/Rong Mansion/.test(st.info || ''), `the book page points at d1, the Rong Mansion (${(st.info || 'nothing').replace(/\s+/g, ' ').slice(0, 80)})`);
  }
  check(/Red Chamber/.test(st.crumbs || '') && !/Three Kingdoms/.test(st.crumbs || ''), `crumbs: ${st.crumbs}`);
  check(st.seen, 'the opening is marked as seen');
  check(!errs.length, `no page error (${errs.length})`);
  // it plays once
  await p.reload(); await p.waitForTimeout(3000);
  check(!(await p.locator('.tk-scroll h3').count()), 'the opening does not play again on the next visit');
  console.log(fails ? `${fails} FAIL` : 'all ok'); await b.close(); process.exit(fails ? 1 : 0);
})();
