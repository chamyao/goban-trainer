// "Take me there" (the goal box's button; apo110): it walks you to the goal, place after place, and the beat starts.
// Book 13 at c12 (Jia De's hall, a room in Luoyang), standing in Luoyang: the button walks him into the hall and to the
// spot. A tap on the map takes back control.
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
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  const setup = async () => {
    await p.goto(BASE + '#/');
    await p.evaluate(async () => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '13');
      await TK.load(); const w = TK.world(13); let party = null;
      for (const n of w.nodes) { if (n.key === '13-c12') break; TK.markCleared(n.key); const sc = w.scenes[n.scene]; for (const st of (sc && sc.steps) || []) if (st[0] === 'party') party = st[1]; }
      TK.markSeen('13:opening'); if (party) TK.setParty(w, party);
      localStorage.setItem('tk-world-13', JSON.stringify({ place: 'luoyang' })); });
    await p.goto(BASE + '#/tk/13'); await p.reload();
    for (let i = 0; i < 60; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 800 }).catch(() => {});
      if (await p.evaluate(() => { const w = window.__w; if (!w || !w.player || w.leaving) return false; if (w.ui.busy()) { w.ui.advance(); return false; } return w.placeId === 'luoyang'; })) break; await p.waitForTimeout(250); }
    await p.waitForTimeout(800);
  };
  await setup();
  const btn = p.locator('.town-goal-go');
  check(await btn.count() === 1 && /Take me there/.test(await btn.textContent()), 'the goal box has a "带我去 Take me there" button');
  await btn.click();
  let res = null;
  for (let i = 0; i < 160; i++) {
    res = await p.evaluate(() => { const w = window.__w; return w && { place: w.placeId, busy: w.ui.busy(), cine: !!w.cine, appr: !!w.approaching, auto: w.game.registry.get('autoGo') }; });
    if (res && res.place === 'luoyang--jiade-hall' && (res.busy || res.cine || res.appr)) break;
    await p.waitForTimeout(250);
  }
  check(res && res.place === 'luoyang--jiade-hall' && (res.busy || res.cine || res.appr), `it walks him into Jia De's hall and the beat starts (${JSON.stringify(res)})`);
  check(res && !res.auto, 'and it stops there');
  // a tap takes back control
  await setup();
  await p.locator('.town-goal-go').click(); await p.waitForTimeout(600);
  const P = await p.evaluate(() => { const w = window.__w, c = w.cameras.main, cv = w.game.canvas.getBoundingClientRect(); return { x: cv.left + cv.width / 2, y: cv.top + cv.height / 2 + 60 }; });
  await p.mouse.click(P.x, P.y); await p.waitForTimeout(300);
  check(await p.evaluate(() => !window.__w.game.registry.get('autoGo')), 'a tap on the map takes back control');
  await b.close(); console.log(fails ? `take-me-there: ${fails} failed` : 'take-me-there: all ok');
})();
