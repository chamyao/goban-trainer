// Talk with Claude, in Book 12 (Chang'an's teahouse, the back room), with the Apps Script stubbed: no request reaches
// the real sheet. For apo110: from Chang'an, by real taps, into the teahouse, through to the back room, and a tap on
// Claude opens the talk box; it asks the password in the box; then Enter sends (the stub sees it, with the password)
// and "……" shows; a reply replaces it; typing in the box doesn't move the player; Esc closes it and walking works
// again; "locked" asks the password again in the box and forgets the kept one. For anyone else, Claude is only a
// scholar ("The scholar is lost in his scrolls."), no box. It fits a phone (iPhone 13, and 360 px). #/tk/chat is the
// plain window. Runs without test mode (run.sh: PLAYTEST_LIVE=1), as a player.
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
  const setUser = (p, name, key) => p.evaluate(([n, k]) => { for (const x of Object.keys(localStorage)) if (/^tk-|gt-/.test(x)) localStorage.removeItem(x); if (n) localStorage.setItem('gt-username', n); if (k) localStorage.setItem('tk-chat-key', k); localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '12'); }, [name, key]);
  const look = p => p.evaluate(() => { const w = window.__w, d = document, dl = d.querySelector('.town-ui .town-dlg');
    return { ready: !!(w && w.player && w.w), place: w && w.placeId, busy: !!(w && w.ui && w.ui.busy()), cine: !!(w && w.cine), leaving: !!(w && w.leaving), walk: !!(w && w.walk),
      line: dl && !dl.hidden ? ((dl.querySelector('.town-en') || dl).textContent || '').trim() : '', talk: !!d.querySelector('.tk-talk') }; });
  // through whatever's up (a scroll, a line, a scene) until he can walk
  const settle = async p => { for (let i = 0; i < 160; i++) {
    const c = p.getByText('Cancel', { exact: true }); if (await c.count() && await c.first().isVisible()) await c.first().tap().catch(() => {});
    const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) { await g.first().tap().catch(() => {}); await p.waitForTimeout(300); continue; }
    const s = await look(p); if (s.ready && !s.busy && !s.cine && !s.leaving) return true;
    if (s.ready && s.busy && !s.talk) await p.evaluate(() => window.__w.ui.advance());
    await p.waitForTimeout(250); } return false; };
  // a real tap on a point of the world (on screen; else the game's own tap handler)
  const tapWorld = async (p, x, y) => {
    const s = await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width, v = w.view(x, y);
      const sx = r.left + (v.x - cam.worldView.x) * cam.zoom * k, sy = r.top + (v.y - cam.worldView.y) * cam.zoom * k; return { sx, sy, on: sx > r.left + 8 && sx < r.right - 8 && sy > r.top + 70 && sy < r.bottom - 8 }; }, [x, y]);
    if (s.on) await p.touchscreen.tap(s.sx, s.sy);
    else await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, v = w.view(x, y); w.tapAt(x, y, (v.x - cam.worldView.x) * cam.zoom, (v.y - cam.worldView.y) * cam.zoom); }, [x, y]);
  };
  // walk through the way to `to` by tapping it (a building's door: the building just above it), as a player does
  const through = async (p, to) => {
    for (let tries = 0; tries < 8; tries++) {
      await settle(p); if ((await look(p)).place === to) return true;
      const e = await p.evaluate(to => { const w = window.__w, e = w.exits.find(e => e.to === to); return e && { x: e.rect.centerX, y: e.side === 'N' && e.rect.width < 16 ? e.rect.y - 10 : e.rect.centerY }; }, to);
      if (!e) return false;
      await tapWorld(p, e.x, e.y - (tries > 2 ? (tries % 3) * 12 : 0));   // higher up the building on a retry
      for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); const s = await look(p); if (s.place === to) { await settle(p); return true; } if (!s.walk && !s.busy && !s.leaving && i > 4) break; }
    }
    return (await look(p)).place === to;
  };
  const tapClaude = async p => { const at = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.who === 'claude'); return n && [n.spr.x, n.spr.y - 10]; }); if (at) await tapWorld(p, at[0], at[1]); return !!at; };

  for (const [label, dev] of [['iPhone 13', { ...devices['iPhone 13'] }], ['360 px phone', { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } }]]) {
    console.log(`-- ${label}`);
    const p = await page(dev);
    await p.goto(BASE + '#/'); await p.waitForTimeout(400);
    // 1. apo110, no password kept yet: Chang'an → the teahouse → the back room, by taps
    await setUser(p, 'apo110'); stub.messages = []; stub.sent = []; stub.locked = false;
    await p.goto(BASE + '#/tk/12'); await p.reload(); await settle(p);
    const start = (await look(p)).place;
    if (start !== 'changan') await p.evaluate(() => { const w = window.__w; w.go('changan'); }), await p.waitForTimeout(1500), await settle(p);
    const inTea = await through(p, 'changan--teahouse');
    check(inTea, `from Chang'an, a tap on the teahouse takes him in (${(await look(p)).place})`);
    const inBack = inTea && await through(p, 'changan--claude-study');
    check(inBack, `in the teahouse, a tap on the way to the back room takes him through (${(await look(p)).place})`);
    const st = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.who === 'claude'); return { claude: !!(n && n.spr.visible) }; });
    check(st.claude, 'Claude sits in the back room');
    // 2. a tap on him: the box, asking the password in it
    const from = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    await tapClaude(p);
    for (let i = 0; i < 40 && !(await p.locator('.tk-talk').count()); i++) await p.waitForTimeout(200);
    const to = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    check(await p.locator('.tk-talk').count() === 1, `a tap on Claude walks him up (${Math.round(Math.hypot(to[0] - from[0], to[1] - from[1]))} px) and opens the talk box`);
    check(await p.locator('.tk-talk input[type=password]').count() === 1, 'the box asks the password first (in the box, not a page of its own)');
    await p.locator('.tk-talk input[type=password]').fill('pw'); await p.locator('.tk-talk input[type=password]').press('Enter'); await p.waitForTimeout(500);
    check(await p.evaluate(() => localStorage.getItem('tk-chat-key')) === 'pw' && await p.locator('.tk-talk textarea.tk-talk-in').count() === 1, 'Enter takes the password, keeps it, and gives the line to type in');
    // 3. Enter sends ("……" shows); a reply replaces it
    await p.locator('.tk-talk-in').fill('你好 hello'); await p.locator('.tk-talk-in').press('Enter'); await p.waitForTimeout(600);
    check(stub.sent.length === 1 && stub.sent[0].message === '你好 hello' && stub.sent[0].key === 'pw', `Enter sends it, with the password (${JSON.stringify(stub.sent)})`);
    check(await p.locator('.tk-talk-line.thinking').count() === 1, '"……" shows while waiting');
    stub.messages.push({ who: 'claude', text: 'Hello from the stub.', at: Date.now() });
    for (let i = 0; i < 50 && await p.locator('.tk-talk-line.thinking').count(); i++) await p.waitForTimeout(200);
    check(!(await p.locator('.tk-talk-line.thinking').count()) && await p.getByText('Hello from the stub.').count() === 1, 'the reply replaces "……"');
    const fit = await p.evaluate(() => { const r = e => e && e.getBoundingClientRect(), bx = r(document.querySelector('.tk-talk')), ta = r(document.querySelector('.tk-talk-in')), s = r(document.querySelector('.tk-talk-send')), x = r(document.querySelector('.tk-talk-leave'));
      const inn = q => q && q.left >= -1 && q.right <= innerWidth + 1 && q.top >= -1 && q.bottom <= innerHeight + 1;
      return { box: inn(bx), ta: inn(ta) && ta.width > 120, send: inn(s), leave: inn(x), w: innerWidth, bw: bx && Math.round(bx.width) }; });
    check(fit.box && fit.ta && fit.send && fit.leave, `on a ${fit.w} px screen the box (${fit.bw} px), its line, Say and ✕ are all on screen`);
    // 4. typing (wasd) doesn't walk; Esc closes; walking works again
    const p0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    await p.locator('.tk-talk-in').focus(); for (const k of ['w', 'a', 's', 'd', 'ArrowLeft']) { await p.keyboard.down(k); await p.waitForTimeout(250); await p.keyboard.up(k); }
    const p1 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    check(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 1, `typing w, a, s, d and an arrow in the box doesn't move the player (${Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]))} px)`);
    await p.locator('.tk-talk-in').press('Escape'); await p.waitForTimeout(400);
    check(!(await p.locator('.tk-talk').count()), 'Esc closes the box');
    const q0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    const away = await p.evaluate(() => { const w = window.__w, e = w.exits.find(e => e.to === 'changan--teahouse'); return e ? [e.rect.centerX, e.rect.centerY - 6] : [w.player.x, w.player.y + 30]; });
    await tapWorld(p, away[0], away[1]); await p.waitForTimeout(1500);
    const q1 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
    check(Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) >= 4 && await p.evaluate(() => !window.__w.seated), `a tap walks him again after (${Math.round(Math.hypot(q1[0] - q0[0], q1[1] - q0[1]))} px)`);
    // 5. "locked": the password again, in the box; the kept one forgotten
    await settle(p); if ((await look(p)).place !== 'changan--claude-study') await through(p, 'changan--claude-study');
    await tapClaude(p); for (let i = 0; i < 40 && !(await p.locator('.tk-talk').count()); i++) await p.waitForTimeout(200);
    stub.locked = true; await p.locator('.tk-talk-in').fill('again'); await p.locator('.tk-talk-in').press('Enter');
    for (let i = 0; i < 30 && !(await p.locator('.tk-talk input[type=password]').count()); i++) await p.waitForTimeout(200);
    check(await p.locator('.tk-talk input[type=password]').count() === 1 && await p.evaluate(() => !localStorage.getItem('tk-chat-key')), '"locked" asks the password again in the box and forgets the kept one');
    const pw = await p.evaluate(() => { const r = document.querySelector('.tk-talk input[type=password]').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.width > 100; });
    check(pw, 'the password line fits the screen');
    stub.locked = false; await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    // 6. anyone else: Claude is a scholar at his scrolls, no box
    await setUser(p, 'someone'); await p.goto(BASE + '#/tk/12'); await p.reload(); await settle(p);
    if ((await look(p)).place !== 'changan') await p.evaluate(() => window.__w.go('changan')), await p.waitForTimeout(1500), await settle(p);
    const ok2 = await through(p, 'changan--teahouse') && await through(p, 'changan--claude-study');
    let said = '';
    if (ok2) { await tapClaude(p); for (let i = 0; i < 40 && !/scrolls\./.test(said); i++) { await p.waitForTimeout(200); said = (await look(p)).line || said; } }   // (it types out)
    check(ok2 && /lost in his scrolls/.test(said) && !(await p.locator('.tk-talk').count()), `for another player, Claude only says "${said.slice(0, 50)}", no box`);
    // 7. #/tk/chat: the plain window
    await setUser(p, 'apo110', 'pw'); await p.goto(BASE + '#/tk/chat'); await p.reload(); await p.waitForTimeout(1500);
    check(await p.locator('.tk-chat').count() === 1 && !(await p.evaluate(() => !!(window.__w && window.__w.player && window.__w.w && window.__w.w.n === 90))), '#/tk/chat is the plain window (no study to walk)');
    console.log(`     (every call to the script is answered by the stub: ${stub.other} besides the chat's)`);
    await p.context().close();
  }
  console.log(`chat: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
