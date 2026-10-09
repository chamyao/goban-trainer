// A cutaway ("cutaway": true on a node, the Lady Sun book): the other side's scene plays by itself as soon as it's
// open, with the party off stage, then the player is put back where the lead stood. On Book 13 with c12 (Jia De hall,
// another place) and c13 (Luoyang, where he stands) made cutaways: c12 plays at its own place, c13 follows in
// Luoyang with him off stage, and he's back in Luoyang where he stood, seen again.
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
  await p.route('**/data/tk.json*', async r => { const res = await r.fetch(); const d = await res.json();
    for (const n of d.worlds.find(w => w.n === 13).nodes) if (n.key === '13-c12' || n.key === '13-c13') n.cutaway = true;
    r.fulfill({ response: res, json: d }); });
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  await p.goto(BASE + '#/');
  await p.evaluate(async () => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
    localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '13'); localStorage.setItem('gt-username', 'cut');
    await TK.load(); const w = TK.world(13); let party = null;
    for (const n of w.nodes) { if (n.key === '13-c12') break; TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene]; for (const st of (sc && sc.steps) || []) if (st[0] === 'party') party = st[1]; }
    TK.markSeen('13:opening'); if (party) TK.setParty(w, party);
    localStorage.setItem('tk-world-13', JSON.stringify({ place: 'luoyang' })); });
  await p.goto(BASE + '#/tk/13'); await p.reload();
  // log what happens: places visited, the player hidden while a cutaway plays, scenes done
  const log = []; let hiddenDuring = null, startPos = null;
  for (let i = 0; i < 240; i++) {
    const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 800 }).catch(() => {});
    const s = await p.evaluate(() => { const w = window.__w; if (!w || !w.player) return null;
      const duel = !!document.querySelector('.tk-duel');
      if (w.ui.busy()) w.ui.advance();
      return { place: w.placeId, cut: !!w.cutawayMode, vis: w.player.visible, x: Math.round(w.player.x), y: Math.round(w.player.y), c18: TK.cleared('13-c12'), c19: TK.cleared('13-c13'), duel, leaving: !!w.leaving, ret: w.st.cutReturn }; });
    if (s && s.duel) { const go = p.locator('.tk-duel .tk-duel-go'), k = p.locator('.tk-duel-keys button', { hasText: 'Skip' }); if (await go.count() && await go.first().isVisible()) await go.first().click({ timeout: 800 }).catch(() => {}); else if (await k.count()) await k.first().click({ timeout: 800 }).catch(() => {}); }
    if (s && !log.length || s && log[log.length - 1] !== s.place) log.push(s && s.place);
    if (s && s.ret && !startPos) startPos = s.ret.pos;
    if (s && s.cut && s.vis) hiddenDuring = false; else if (s && s.cut && hiddenDuring === null) hiddenDuring = true;
    if (s && s.c19 && s.place === 'luoyang' && !s.leaving && !s.cut) { await p.waitForTimeout(800); break; }
    await p.waitForTimeout(250);
  }
  const end = await p.evaluate(() => { const w = window.__w; return { place: w.placeId, vis: w.player.visible, x: Math.round(w.player.x), y: Math.round(w.player.y), c18: TK.cleared('13-c12'), c19: TK.cleared('13-c13'), ret: w.st.cutReturn, fol: (w.followers || []).every(F => F.spr.visible) }; });
  console.log('places', JSON.stringify(log), 'start', JSON.stringify(startPos), 'end', JSON.stringify(end));
  check(end.c18 && end.c19, 'both cutaways played by themselves, one after the other');
  check(log.includes('luoyang--jiade-hall'), 'the second was staged at its own place');
  check(hiddenDuring === true, 'the party was off stage while they played');
  check(end.place === 'luoyang' && end.vis && end.fol && !end.ret, 'then back in Luoyang, seen again');
  check(startPos && Math.hypot(end.x - startPos.x, end.y - startPos.y) < 40, `where he stood (he began on the gate, so the engine steps him 2 tiles in off it) (${JSON.stringify(startPos)} -> ${end.x},${end.y})`);
  await b.close(); console.log(fails ? `cutaway: ${fails} failed` : 'cutaway: all ok');
})();
