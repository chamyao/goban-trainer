// Misaeng's rating stakes line (tk.js TKElo.stakesEl), as a player meets it, on desktop and a phone: a rated board (a
// decision beat, a passer-by on the street) shows "Rating +x / −y" in English (no 等级分), on screen; answered first try
// it turns into "Rating +x → r (label)", the change it promised and the rating the save now holds; answered after a hint
// it shows the −y it promised; a record board (Cho Hunhyun's game) shows no stakes at all.
// PLAYTEST_URL for the live site; PLAYTEST_DEVICES (default desktop, iPhone 13). Screenshots: out/misaeng-stakes-*.png.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const BASE = process.env.PLAYTEST_URL || 'http://localhost:8765';
const DEVS = (process.env.PLAYTEST_DEVICES || 'desktop,iPhone 13').split(',').map(s => s.trim());
let fails = 0;
const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); };
const CJK = /[㐀-鿿]/;
const BOARDS = [
  { key: '21-m2', what: 'decision m2', rated: true, win: true },
  { key: '21-jongno-c-regular-1', what: 'passer-by (Jongno regular)', rated: true, win: true, foe: { id: 'regular-1', who: 'ms_passerby' } },
  { key: '21-jongno-c-courier', what: 'passer-by (Jongno courier), after a hint', rated: true, win: false, foe: { id: 'courier', who: 'ms_passerby2' } },
  { key: '21-m14', what: 'record board m14', rated: false },
];

async function run(b, dev) {
  const opts = dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] }, touch = !!opts.hasTouch;
  const ctx = await b.newContext(opts), p = await ctx.newPage(), tag = dev.replace(/\s+/g, '').toLowerCase();
  p.on('pageerror', e => { fails++; console.log('ERR', e.message); });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route('**/script.google.com/**', r => r.fulfill({ status: 404, body: '' }));   // no sync with a real account
  await p.goto(BASE + '/index.html#/tk/21'); await p.waitForTimeout(800);
  await p.evaluate(async () => { await TK.load(); const w = TK.world(21);
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
    TK.migrate21(); localStorage.setItem('tk-guide', 'off'); TK.markSeen('21:opening');
    for (const nd of w.nodes) TK.markCleared(nd.key);
    localStorage.setItem('tk-world-21', JSON.stringify({ place: 'one-international', party: ['ms_jang'], pos: { place: 'one-international', x: 296, y: 200, f: 'down' } })); });
  await p.reload();
  for (let i = 0; i < 60 && !(await p.evaluate(() => !!(window.__w && window.__w.player))); i++) { const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(250); }
  for (let i = 0; i < 20 && await p.evaluate(() => window.__w.ui.busy()); i++) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(200); }
  await p.waitForTimeout(3000);
  console.log(`--- ${dev}`);
  for (const B of BOARDS) {
    await p.evaluate(k => { const pr = loadProgress(); TK.undoCleared(pr, k); TK.saveProg(pr); localStorage.removeItem('tk-rest'); }, B.key);
    await p.evaluate(([k, foe]) => { TKOverlay.open(21, k, { host: document.querySelector('.tk-map'), ...(foe ? { foe } : {}) }); }, [B.key, B.foe || null]);   // not awaited: it settles when the board closes
    for (let i = 0; i < 40 && !(await p.evaluate(() => !!(window.__trainer && window.__trainer.alive && document.querySelector('.tk-duel')))); i++) await p.waitForTimeout(150);
    await p.waitForTimeout(600);
    const before = await p.evaluate(() => { const e = document.querySelector('.tk-duel .tk-stakes'), t = window.__trainer;
      let vis = false, R = null;
      if (e) { R = e.getBoundingClientRect(); const top = document.elementFromPoint(R.left + Math.min(R.width / 2, 20), R.top + R.height / 2); vis = R.width > 0 && R.bottom <= innerHeight && R.right <= innerWidth && R.top >= 0 && !!top && (top === e || e.contains(top)); }
      return { text: e ? e.textContent : null, vis, R: R && [R.left | 0, R.top | 0, R.width | 0, R.height | 0], rec: !!(t && t.p.record), id: t && t.p.id, r: TKElo.state().r, src: (document.querySelector('.tk-duel-src') || {}).textContent || '' }; });
    await p.screenshot({ path: path.join(__dirname, `out/misaeng-stakes-${tag}-${B.key}.png`) });
    if (!B.rated) {
      check(before.rec && before.text === null, `${B.what}: a record board, no stakes line (src "${before.src.slice(0, 70)}")`);
    } else {
      const m = before.text && before.text.match(/^Rating \+(\d+) \/ −(\d+)$/);
      check(!!m && !CJK.test(before.text), `${B.what} (#${before.id}): "${before.text}", in English`);
      check(before.vis, `${B.what}: the line is on screen, nothing over it (${before.R})`);
      // answer: first try (the line's moves), or after a hint (counted wrong)
      if (!B.win) { const hk = p.locator('.tk-duel-key', { hasText: 'Hint' }); if (await hk.count()) await hk.first().click(); else await p.evaluate(() => window.__trainer.hint()); await p.waitForTimeout(800); }
      for (let i = 0; i < 40; i++) {
        const s = await p.evaluate(() => { const t = window.__trainer;
          if (!t || t.done || !t.alive) return { done: true };
          if (t.engineBusy) return {};
          const n = t.played.length; if (n % 2) return {};
          const open = L => L.length - 1 > n && t.played.every((m, k) => m === L[k + 1]);
          const mv = (t.p.lines.find(L => L[0] === 1 && open(L)) || t.p.lines.find(L => L[0] === 2 && open(L)) || [])[n + 1];   // a main line, or a correct variation White's reply has gone into if (!mv) return {};
          const c = mv.charCodeAt(0) - 97, r = mv.charCodeAt(1) - 97;
          const el = [...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e => +e.getAttribute('cx') === t.goban.px(c) && +e.getAttribute('cy') === t.goban.py(r));
          if (!el) return { miss: mv }; const R = el.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 }; });
        if (s.done || s.miss) break;
        if (s.x) { if (touch) await p.touchscreen.tap(s.x, s.y); else await p.mouse.click(s.x, s.y); await p.waitForTimeout(250);
          if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) { if (touch) await p.touchscreen.tap(s.x, s.y); else await p.mouse.click(s.x, s.y); } }
        await p.waitForTimeout(700);
        if (await p.evaluate(t0 => { const e = document.querySelector('.tk-duel .tk-stakes'); return e && e.textContent !== t0; }, before.text)) break;
      }
      await p.waitForTimeout(500);
      const after = await p.evaluate(() => ({ text: (document.querySelector('.tk-duel .tk-stakes') || {}).textContent || null, r: TKElo.state().r, label: TKElo.label() }));
      const want = B.win ? `+${m && m[1]}` : `−${m && m[2]}`;
      check(after.text === `Rating ${want} → ${after.r} (${after.label})` && after.r - before.r === (B.win ? +m[1] : -m[2]) && !CJK.test(after.text),
        `${B.what}: answered ${B.win ? 'first try' : 'after a hint'}, "${after.text}" (rating ${before.r} → ${after.r})`);
      await p.screenshot({ path: path.join(__dirname, `out/misaeng-stakes-${tag}-${B.key}-after.png`) });
    }
    await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    for (let i = 0; i < 20 && await p.evaluate(() => !!document.querySelector('.tk-duel') || (window.__w && window.__w.ui.busy())); i++) { await p.evaluate(() => window.__w && window.__w.ui.busy() && window.__w.ui.advance()); await p.waitForTimeout(250); }
  }
  await ctx.close();
}
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  for (const d of DEVS) await run(b, d);
  await b.close();
  console.log(fails ? `misaeng-stakes: ${fails} failed` : 'misaeng-stakes: all ok');
})();
