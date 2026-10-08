// Book 14's prologue in burning Chang'an (x0b, "Hidden"): Lady Yan and her daughter among the looters, on Places' map
// with its three cover spots (cover-door, cover-cart, cover-well). Player mode (no test mode).
//  1. In each cover, keeping still, she is hidden.
//  2. Hidden in cover while a looter looks right at her (his cone over her, by the engine's own sight, the hiding set
//     aside for the look): not caught.
//  3. Out of cover and into a looter's sight: caught, his line, and back to the cover she last hid in.
//  4. The book's opening scroll is the Chapter 9 briefing.
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ viewport: { width: 1200, height: 800 } })).newPage();
  let fails = 0, checked = 0; const check = (ok, w) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  // a new player opening Book 14: the opening scroll first
  await p.goto(BASE + '#/'); await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k)) localStorage.removeItem(k); localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '14'); localStorage.setItem('gt-username', 'prologue'); });
  await p.goto(BASE + '#/tk/14'); await p.reload();
  let scroll = ''; for (let i = 0; i < 40 && !scroll; i++) { await p.waitForTimeout(250); scroll = await p.evaluate(() => { const s = document.querySelector('.tk-scroll'); return s && s.offsetParent ? s.textContent.replace(/\s+/g, ' ').trim() : ''; }); }
  check(await p.evaluate(() => !(typeof TK_TEST !== 'undefined' && TK_TEST)), 'player mode: the game\'s test mode is off');
  check(/Chapter 9/.test(scroll) && /Lady Yan/.test(scroll) && /Chang'an/.test(scroll), `a new player's Book 3 opens with the Chapter 9 briefing: "${scroll.slice(0, 160)}…"`);
  // x0a played: x0b next, in Chang'an
  await p.evaluate(async () => { await TK.load(); TK.markCleared('14-x0a'); TK.markSeen('14:opening'); });
  await p.reload();
  const ready = async () => { for (let i = 0; i < 80; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.last().click({ timeout: 800, force: true }).catch(() => {});
      const s = await p.evaluate(() => { const w = window.__w; if (!w || !w.player || w.leaving || w.cine) return 0; if (w.ui.busy()) { w.ui.advance(); return 0; } return 1; }); if (s) break; await p.waitForTimeout(250); } await p.waitForTimeout(500); };
  await ready();
  await p.evaluate(() => { const w = window.__w; w.leaving = false; if (w.placeId !== 'changan') w.go('changan'); });
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => { const w = window.__w; return w && w.placeId === 'changan' && w.player && !w.leaving; })) break; }
  await ready();
  const st = await p.evaluate(() => { const w = window.__w; return { next: w.nextMain() && w.nextMain().node, state: (w.mapState() || {}).ids, covers: w.covers.length, spots: Object.keys(w.spots).filter(k => /^cover-/.test(k)), looters: w.npcs.filter(n => n.watch && w.watching(n)).map(n => n.id), lead: w.lead, party: w.st.party }; });
  check(st.next === '14-x0b' && st.covers === 3 && st.looters.length >= 2, `x0b in Chang'an (${(st.state || []).join('+')}): ${st.covers} covers (${st.spots.join(', ')}), looters ${st.looters.join(', ')}; ${st.lead} leads (${(st.party || []).join(', ')})`);

  const at = (q, dy = 0) => p.evaluate(([q, dy]) => { const w = window.__w; w.walk = null; w.auto = null; w.player.body.reset(q.x, q.y + dy); w.player.setVelocity(0); }, [q, dy]);
  const look = () => p.evaluate(() => { const w = window.__w, P = w.player, h = w.hidden; w.hidden = false;   // who would see her, the hiding set aside for the look
    const by = w.npcs.filter(n => n.watch && w.watching(n) && w.sees(n, P)).map(n => n.id); w.hidden = h;
    return { hidden: !!w.hidden, caught: !!w.caught, busy: w.ui.busy(), by, P: [Math.round(P.x), Math.round(P.y)], last: w.lastCover && [Math.round(w.lastCover.centerX), Math.round(w.lastCover.centerY)] }; });
  const spots = await p.evaluate(() => Object.fromEntries(Object.entries(window.__w.spots).filter(([k]) => /^cover-/.test(k)).map(([k, s]) => [k, { x: s.x, y: s.y }])));

  // 1-2. each cover: still there, hidden; and wait for a looter to look right at her
  let watched = null;
  for (const [name, q] of Object.entries(spots)) {
    await at(q); await p.waitForTimeout(700); let s = await look();
    check(s.hidden && !s.caught, `${name}: keeping still in it, she's hidden (${JSON.stringify(s)})`);
    if (!watched) for (let i = 0; i < 60; i++) { s = await look(); if (s.caught) break; if (s.by.length && s.hidden) { watched = { name, s }; break; } await p.waitForTimeout(250); }
  }
  if (watched) { await p.waitForTimeout(1200); const s = await look();
    check(!s.caught && !s.busy, `hidden in ${watched.name} while ${watched.s.by.join(', ')} looks right at her: not caught (a second later: ${JSON.stringify({ caught: s.caught, hidden: s.hidden })})`); }
  else check(false, 'no looter looked at a cover in 15 s per cover (nothing to show her hidden from)');

  // 3. out of cover into a looter's sight: caught, and back to the cover she last hid in
  const [cname, cq] = Object.entries(spots)[0]; await at(cq); await p.waitForTimeout(700);
  const out = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.watch && w.watching(n)), T = 16, D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.watch.dir] || [0, 1];
    return { id: n.id, x: n.spr.x + D[0] * 3 * T, y: n.spr.y + D[1] * 3 * T + 6 }; });   // 3 tiles before him, the way he looks
  let caught = null; const t0 = Date.now();
  while (Date.now() - t0 < 20000 && !caught) {
    await p.evaluate(o => { const w = window.__w; if (!w.caught && !w.ui.busy()) w.walkTo(o.x, o.y, { ring: false }); }, out); await p.waitForTimeout(200);
    const s = await look(); if (s.caught) caught = { s, line: await p.evaluate(() => ((document.querySelector('.town-ui .town-dlg:not([hidden])') || {}).textContent || '').replace(/\s+/g, ' ').trim()) };
    const o2 = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.watch && w.watching(n)), T = 16, D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.watch.dir] || [0, 1]; return { x: n.spr.x + D[0] * 3 * T, y: n.spr.y + D[1] * 3 * T + 6 }; }); out.x = o2.x; out.y = o2.y; }
  for (let i = 0; i < 20 && await p.evaluate(() => window.__w.ui.busy()); i++) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); }
  await p.waitForTimeout(800); const back = await look();
  const home = Math.hypot(back.P[0] - cq.x, back.P[1] - cq.y) < 20;
  check(!!caught && /Who's there|There!|woman/i.test(caught.line), `out of ${cname} into a looter's sight: caught, and his line: "${caught ? caught.line.slice(0, 90) : 'never caught in 20 s'}"`);
  check(caught && home && !back.caught, `and she's back at ${cname}, the cover she last hid in (${back.P}; the cover at ${Math.round(cq.x)},${Math.round(cq.y)})`);
  console.log(`prologue: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
