// Misaeng's boards keep the rating hidden (the user: the rating is a hidden feature of the story game), as a player meets
// them, on desktop and a phone: a rated board (a decision beat, a passer-by on the street) and a record board carry no
// stakes line, no "Rating"/等级分 text, no account rating or its label, before or after the answer; the save still rates:
// a first-try solve moves it by what TKElo.stakes says the board is worth, a solve after a hint by its loss.
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
    // what's on the board: a stakes line, any "Rating"/等级分 text, the account's rating or its label; and what the save
    // says the board is worth (TKElo.stakes, the same arithmetic the game rates by)
    const look = () => p.evaluate(() => { const t = window.__trainer, d = document.querySelector('.tk-duel'), txt = d ? d.innerText : '', r = TKElo.state().r, label = TKElo.label();
      const src = (document.querySelector('.tk-duel-src') || {}).textContent || '';
      const shown = document.querySelector('.tk-stakes') ? 'a .tk-stakes line' : /rating|等级分/i.test(txt) ? `"${(txt.match(/.{0,20}(rating|等级分).{0,20}/i) || [''])[0]}"`
        : new RegExp(`(^|\\D)${r}(\\D|$)`).test(txt) ? `the rating ${r}` : txt.includes(`(${label})`) ? `"(${label})"` : '';
      const w = TK.world(21), k = t && !t.p.record ? TKElo.stakes(w, [t.p.src || (w.rated.find(y => String(y[1]) === String(t.p.id)) || [])[0], t.p.id]) : null;
      return { rec: !!(t && t.p.record), id: t && t.p.id, r, src, shown, k }; });
    const before = await look();
    await p.screenshot({ path: path.join(__dirname, `out/misaeng-stakes-${tag}-${B.key}.png`) });
    check(!before.shown, `${B.what}${before.id ? ' (#' + before.id + ')' : ''}: no rating on the board (${before.shown || 'none'}; src "${before.src.slice(0, 60)}")`);
    if (!B.rated) check(before.rec, `${B.what}: a record board`);
    else {
      check(!!before.k, `${B.what}: the save still rates it (worth +${before.k && before.k.win} / ${before.k && before.k.loss})`);
      check(/^\d+[kd]\+? · \S.* · source$/i.test(before.src) && !CJK.test(before.src), `${B.what}: the source line reads in English with its separators ("${before.src}")`);
      // answer: first try (the line's moves), or after a hint (counted wrong)
      if (!B.win) { const hk = p.locator('.tk-duel-key', { hasText: 'Hint' }); if (await hk.count()) await hk.first().click(); else await p.evaluate(() => window.__trainer.hint()); await p.waitForTimeout(800); }
      for (let i = 0; i < 40; i++) {
        const s = await p.evaluate(() => { const t = window.__trainer;
          if (!t || t.done || !t.alive) return { done: true };
          if (t.engineBusy) return {};
          const n = t.played.length; if (n % 2) return {};
          const open = L => L.length - 1 > n && t.played.every((m, k) => m === L[k + 1]);
          const mv = (t.p.lines.find(L => L[0] === 1 && open(L)) || t.p.lines.find(L => L[0] === 2 && open(L)) || [])[n + 1];   // a main line, or a correct variation White's reply has gone into
          if (!mv) return {};
          const c = mv.charCodeAt(0) - 97, r = mv.charCodeAt(1) - 97;
          const el = [...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e => +e.getAttribute('cx') === t.goban.px(c) && +e.getAttribute('cy') === t.goban.py(r));
          if (!el) return { miss: mv }; const R = el.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 }; });
        if (s.done || s.miss) break;
        if (s.x) { if (touch) await p.touchscreen.tap(s.x, s.y); else await p.mouse.click(s.x, s.y); await p.waitForTimeout(250);
          if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) { if (touch) await p.touchscreen.tap(s.x, s.y); else await p.mouse.click(s.x, s.y); } }
        await p.waitForTimeout(700);
        if (await p.evaluate(r0 => TKElo.state().r !== r0, before.r)) break;
      }
      await p.waitForTimeout(500);
      const after = await look();
      const want = before.k ? (B.win ? before.k.win : before.k.loss) : NaN;
      check(after.r - before.r === want, `${B.what}: answered ${B.win ? 'first try' : 'after a hint'}, the save's rating moves ${before.r} → ${after.r} (${want >= 0 ? '+' : ''}${want} expected)`);
      check(!after.shown, `${B.what}: after the answer, still no rating on the board (${after.shown || 'none'})`);
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
