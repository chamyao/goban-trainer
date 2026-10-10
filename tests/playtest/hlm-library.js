// Red Chamber's own library entry: in test mode the Library has a 红楼梦 card (and the Three Kingdoms card); it opens
// world 31, whose page lists only Red Chamber books and no Three Kingdoms ones; the Three Kingdoms card never opens a
// Red Chamber book (even when it was the last played), and its list has no Red Chamber book. Outside test mode: no card.
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
  const URL = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  await p.goto(URL + '?test=1#/'); await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k); localStorage.setItem('tk-guide', 'off'); localStorage.setItem('gt-username', 'hlm'); });
  await p.goto(URL + '?test=1#/'); await p.reload(); await p.waitForSelector('.tk-card');
  const card = p.locator('a.tk-card-hongloumeng');
  check(await card.count() === 1 && /红楼梦/.test(await card.innerText()), 'test mode: the Library has a 红楼梦 card');
  await card.click(); await p.waitForSelector('.tk-worlds', { timeout: 20000 });
  const books = await p.locator('.tk-worlds .tk-world').allInnerTexts();
  check(/#\/tk\/31/.test(await p.evaluate(() => location.hash)), 'the card opens world 31');
  check(books.length >= 1 && books.every(t => /侯门深似海/.test(t)), `its book list is Red Chamber only: ${JSON.stringify(books)}`);
  check(/红楼梦/.test(await p.locator('.tk-head h2').innerText()) && /红楼梦|Red Chamber/.test(await p.locator('#crumbs, .crumbs').first().innerText().catch(() => '')), 'its heading and crumbs name the novel');
  await p.goto(URL + '?test=1#/'); await p.reload(); await p.waitForSelector('a.tk-card[href="#/tk"]'); await p.click('a.tk-card[href="#/tk"]');
  await p.waitForSelector('.tk-worlds', { timeout: 20000 }); await p.waitForTimeout(500);
  const tk = await p.locator('.tk-worlds .tk-world').allInnerTexts();
  check(!/#\/tk\/31/.test(await p.evaluate(() => location.hash)) && !(await p.locator('.tk-head h2').innerText()).includes('红楼梦'), 'the Three Kingdoms card opens a Three Kingdoms book');
  check(tk.length > 1 && !tk.some(t => /侯门深似海/.test(t)), 'the Three Kingdoms list has no Red Chamber book');
  check(await p.evaluate(() => localStorage.getItem('tk-book')) !== '31', 'playing Red Chamber does not become the Three Kingdoms last book');
  await p.goto(URL + '?test=0#/'); await p.reload(); await p.waitForSelector('.tk-card');
  check(await p.locator('a.tk-card-hongloumeng').count() === 0, 'outside test mode: no 红楼梦 card');
  console.log(fails ? `${fails} FAIL` : 'all ok'); await b.close(); process.exit(fails ? 1 : 0);
})();
