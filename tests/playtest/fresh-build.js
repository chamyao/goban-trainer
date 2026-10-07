// A device still running an old build (apo110: some devices showed the old Books 1-3): app.js's Fresh.check fetches
// index.html with no-store on load and when the tab comes back, and reloads once when its ?v= keys differ from the
// running page's. Served under a hostname that isn't localhost (Fresh skips localhost), with index.html mocked:
//  - the same build: no reload;
//  - a new build on the server (every ?v= bumped): coming back to the tab reloads once, onto the new page;
//  - a server whose page never matches (a stale CDN copy, say): one reload for that build at most, no loop.
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path'), http = require('http');
(async () => {
  const PORT = new URL(process.env.PLAYTEST_URL || 'http://localhost:8765').port || '8765';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  let fails = 0, checked = 0; const check = (ok, what) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + what); return ok; };
  const BASE = `http://fresh.test:${PORT}/index.html`;
  const real = await new Promise((res, rej) => http.get(`http://127.0.0.1:${PORT}/index.html`, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej));
  const bump = (html, by) => html.replace(/(\.(?:js|css)\?v=)(\d+)/g, (m, a, n) => a + (+n + by));
  const ctx = await b.newContext({ viewport: { width: 1200, height: 800 } }); const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  let mode = 'same', navs = 0, freshFetches = 0;
  // everything under fresh.test fetched from the local server on the test's side (the browser blocks a public name that resolves to this machine)
  await p.route(/^http:\/\/fresh\.test/, async r => { try { const res = await r.fetch({ url: r.request().url().replace('fresh.test', '127.0.0.1') }); await r.fulfill({ response: res }); } catch { await r.abort(); } });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  // index.html: the page itself (a navigation) and Fresh's own fetch, served by mode
  await p.route(/\/index\.html(\?.*)?$/, r => { const nav = r.request().isNavigationRequest(); if (nav) navs++; else freshFetches++;
    const html = mode === 'same' ? real : mode === 'new' ? bump(real, 1000) : nav ? bump(real, 1000) : bump(real, 2000);   // 'never': a stale copy serves the page while the check sees a newer build, every time
    return r.fulfill({ status: 200, contentType: 'text/html', body: html }); });
  const flip = () => p.evaluate(async () => { for (const v of ['hidden', 'visible']) { Object.defineProperty(document, 'visibilityState', { value: v, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 200)); } }).catch(() => {});   // (a reload mid-flip is what's being tested)
  const ver = () => p.evaluate(() => (document.querySelector('script[src*="tk.js?v="]') || {}).getAttribute?.('src') || '');
  await p.goto(BASE + '#/'); await p.evaluate(() => { localStorage.setItem('gt-username', 'fresh'); sessionStorage.clear(); }); await p.reload(); await p.waitForTimeout(2500);
  // 1. same build: the check runs, nothing reloads
  navs = 0; const f0 = freshFetches; await flip(); await p.waitForTimeout(2500);
  check(freshFetches > f0 && navs === 0, `the same build: the check fetches index.html (${freshFetches - f0}) and doesn't reload (${navs} loads)`);
  // 2. a new build: back on the tab, one reload onto it
  const v0 = await ver(); mode = 'new'; navs = 0; await flip(); await p.waitForTimeout(5000);
  const v1 = await ver();
  check(navs === 1 && v1 !== v0 && /\?v=\d{4,}/.test(v1), `a new build on the server: coming back to the tab reloads once (${navs} loads) onto it (${v0} → ${v1})`);
  navs = 0; await flip(); await p.waitForTimeout(2500);
  check(navs === 0, `…and on the new build, coming back again doesn't reload (${navs} loads)`);
  // 3. a server that never agrees: at most one reload per build, no loop
  mode = 'never'; navs = 0; for (let i = 0; i < 3; i++) { await flip(); await p.waitForTimeout(2500); }
  check(navs <= 1, `a stale copy that never serves the new page: ${navs} reload over three returns to the tab, then it stops (no loop)`);
  check(await p.evaluate(() => !!sessionStorage.getItem('gt-fresh')), 'the guard (sessionStorage gt-fresh) is set');
  console.log(`fresh-build: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
