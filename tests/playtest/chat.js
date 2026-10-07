// Talk with Claude (#/tk/chat, world 90, the study), the Apps Script stubbed: no request reaches the real sheet.
// Listed only for the user apo110; the study loads with Claude in it; walking up to him by a real tap opens the
// talk box; Enter sends (the stub sees it, with the password) and "……" shows; a reply replaces it; typing in the
// box doesn't move the player; Esc closes it and walking works again; "locked" goes back to the password prompt;
// and it all fits a phone (iPhone 13, and 360 px). Runs without test mode (run.sh: PLAYTEST_LIVE=1).
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  let fails = 0, checked = 0; const check = (ok, what) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + what); return ok; };
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  // the script, stubbed: the chat thread, what was sent, and whether it answers "locked"
  const stub = { messages: [], sent: [], locked: false, other: 0 };
  const page = async dev => {
    const ctx = await b.newContext(dev); const p = await ctx.newPage();
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.route('**/phaser.min.js', r => r.fulfill({ path: require('path').join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
    await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
    await p.route(/script\.google\.com/, async r => {
      const req = r.request(), url = new URL(req.url());
      const json = o => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
      if (req.method() === 'POST') { let body = {}; try { body = JSON.parse(req.postData() || '{}'); } catch {}
        if (body.kind !== 'chat') { stub.other++; return json({ ok: true }); }
        if (stub.locked) return json({ error: 'locked' });
        stub.sent.push({ key: body.key, message: body.data && body.data.message }); stub.messages.push({ who: 'you', text: body.data.message, at: Date.now() }); return json({ ok: true }); }
      if (url.searchParams.get('kind') === 'chat') return stub.locked ? json({ error: 'locked' }) : json({ data: { messages: stub.messages } });
      stub.other++; return json({ data: null });
    });
    return p;
  };
  const listed = p => p.evaluate(() => [...document.querySelectorAll('.tk-world')].some(a => /Talk with Claude/.test(a.textContent)));
  const setUser = (p, name, key) => p.evaluate(([n, k]) => { for (const x of Object.keys(localStorage)) if (/^tk-|gt-/.test(x)) localStorage.removeItem(x); if (n) localStorage.setItem('gt-username', n); if (k) localStorage.setItem('tk-chat-key', k); localStorage.setItem('tk-guide', 'off'); }, [name, key]);
  const settle = async p => { for (let i = 0; i < 60; i++) { const c = p.getByText('Cancel', { exact: true }); if (await c.count() && await c.first().isVisible()) await c.first().tap().catch(() => {}); if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break; await p.waitForTimeout(200); } await p.waitForTimeout(600); };

  for (const [label, dev] of [['iPhone 13', { ...devices['iPhone 13'] }], ['360 px phone', { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } }]]) {
    console.log(`-- ${label}`);
    const p = await page(dev);
    await p.goto(BASE + '#/'); await p.waitForTimeout(500);
    // 1. the list: a player, another name, apo110
    for (const [name, want] of [[null, false], ['someone', false], ['apo110', true]]) {
      await setUser(p, name); await p.goto(BASE + '#/tk'); await p.reload(); await p.waitForTimeout(1500);
      check(await listed(p) === want, `${name || 'no username'}: "Talk with Claude" ${want ? 'is' : 'is not'} on the book list`);
    }
    // 2. the study, with Claude in it
    await setUser(p, 'apo110', 'pw'); stub.messages = []; stub.sent = []; stub.locked = false;
    await p.goto(BASE + '#/tk/chat'); await p.reload(); await settle(p);
    const st = await p.evaluate(() => { const w = window.__w, n = w && w.npcs.find(n => n.who === 'claude'); return { n: w && w.w.n, claude: !!(n && n.spr.visible), goal: (document.querySelector('.town-goal') || {}).textContent || '' }; });
    check(st.n === 90 && st.claude, `#/tk/chat opens the study (world ${st.n}) with Claude in it`);
    check(/Talk to Claude/.test(st.goal), `the goal says so ("${st.goal.trim().slice(0, 60)}")`);
    // 3. walk up by a real tap on him; the box opens
    const from = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    const at = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.who === 'claude'), cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width;
      return [r.left + (n.spr.x - cam.worldView.x) * cam.zoom * k, r.top + (n.spr.y - 10 - cam.worldView.y) * cam.zoom * k]; });
    await p.touchscreen.tap(at[0], at[1]);
    for (let i = 0; i < 40 && !(await p.locator('.tk-talk').count()); i++) await p.waitForTimeout(200);
    const to = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    check(await p.locator('.tk-talk').count() === 1, `a tap on Claude walks the player up (${Math.round(Math.hypot(to[0] - from[0], to[1] - from[1]))} px) and opens the talk box`);
    // 4-5. Enter sends ("……" shows); a reply replaces it
    await p.locator('.tk-talk-in').fill('你好 hello'); await p.locator('.tk-talk-in').press('Enter'); await p.waitForTimeout(600);
    check(stub.sent.length === 1 && stub.sent[0].message === '你好 hello' && stub.sent[0].key === 'pw', `Enter sends it, with the password (${JSON.stringify(stub.sent)})`);
    check(await p.locator('.tk-talk-line.thinking').count() === 1, '"……" shows while waiting');
    stub.messages.push({ who: 'claude', text: 'Hello from the stub.', at: Date.now() });
    for (let i = 0; i < 50 && await p.locator('.tk-talk-line.thinking').count(); i++) await p.waitForTimeout(200);
    check(!(await p.locator('.tk-talk-line.thinking').count()) && await p.getByText('Hello from the stub.').count() === 1, 'the reply replaces "……"');
    // phone width: the box on screen, its line to type in and its send key visible
    const fit = await p.evaluate(() => { const r = e => e && e.getBoundingClientRect(), b = r(document.querySelector('.tk-talk')), ta = r(document.querySelector('.tk-talk-in')), s = r(document.querySelector('.tk-talk-send')), x = r(document.querySelector('.tk-talk-leave'));
      const inn = q => q && q.left >= -1 && q.right <= innerWidth + 1 && q.top >= -1 && q.bottom <= innerHeight + 1;
      return { box: inn(b), ta: inn(ta) && ta.width > 120, send: inn(s), leave: inn(x), w: innerWidth, bw: b && Math.round(b.width) }; });
    check(fit.box && fit.ta && fit.send && fit.leave, `on a ${fit.w} px screen the box (${fit.bw} px), its line, Say and ✕ are all on screen (${JSON.stringify(fit)})`);
    // 6. typing (wasd) doesn't walk
    const p0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    await p.locator('.tk-talk-in').focus(); for (const k of ['w', 'a', 's', 'd', 'ArrowLeft']) { await p.keyboard.down(k); await p.waitForTimeout(250); await p.keyboard.up(k); }
    const p1 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    check(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 1, `typing w, a, s, d and an arrow in the box doesn't move the player (${Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]))} px)`);
    // 7. Esc closes; walking works again (keys, and a tap)
    await p.locator('.tk-talk-in').press('Escape'); await p.waitForTimeout(400);
    check(!(await p.locator('.tk-talk').count()), 'Esc closes the box');
    await p.evaluate(() => window.__w.game.canvas.focus && window.__w.game.canvas.focus());
    const q0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    await p.keyboard.down('ArrowDown'); await p.waitForTimeout(500); await p.keyboard.up('ArrowDown'); await p.waitForTimeout(200);
    let q1 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    if (Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) < 4) { const c = await p.evaluate(() => { const r = window.__w.game.canvas.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .8]; }); await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(1200); q1 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]); }
    check(Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) >= 4 && await p.evaluate(() => !window.__w.seated), `walking works again after (${Math.round(Math.hypot(q1[0] - q0[0], q1[1] - q0[1]))} px)`);
    // 8. "locked": back to the password prompt, the kept password dropped
    await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.who === 'claude'); w.opts.onTalkTo(w, n); }); await p.waitForTimeout(500);
    stub.locked = true; await p.locator('.tk-talk-in').fill('again'); await p.locator('.tk-talk-in').press('Enter');
    for (let i = 0; i < 30 && !(await p.locator('input[type=password]').count()); i++) await p.waitForTimeout(200);
    check(await p.locator('input[type=password]').count() === 1 && await p.evaluate(() => !localStorage.getItem('tk-chat-key')), `"locked" goes back to the password prompt and forgets the password (${await p.evaluate(() => location.hash)})`);
    const pw = await p.evaluate(() => { const r = document.querySelector('input[type=password]').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.width > 100; });
    check(pw, 'the password prompt fits the screen');
    stub.locked = false;
    console.log(`     (every call to the script is answered by the stub: ${stub.other} besides the chat's)`);
    await p.context().close();
  }
  console.log(`chat: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
