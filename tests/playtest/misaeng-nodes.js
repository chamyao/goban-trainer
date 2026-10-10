// Misaeng (world 21) on the node map (the placeholder until Places' maps land): the beat chain m1 -> m24 as a player
// plays it: from a fresh save, the opening, then each beat's Play, its board (a record board's one answer checked
// against the book's SGF, read here on its own: Black's move n, Cho Hunhyun's), Continue, the scene after, and the
// next beat offered. Every line said is logged (out/misaeng-nodes.log) for checking against docs/book2/misaeng-arc.md,
// and none may carry Chinese (an English-only world). Gates that need the maps (m13 audit, m17 room, m18 trade) are
// reported, not failed: on the node map their spots and people don't exist yet.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.PLAYTEST_URL || 'http://localhost:8765';
let fails = 0;
const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); };
const CJK = /[㐀-鿿]/;
// the record, read from the SGF here (not through the engine)
const sgf = fs.readFileSync(path.join(__dirname, '../../docs/book2/misaeng-ing-cup-g5.sgf'), 'utf8');
const MOVES = [...sgf.matchAll(/;\s*([BW])\[([a-s]{2})\]/g)].map(m => [m[1], m[2]]);
const ASKED = { '21-m6': 29, '21-m9': 47, '21-m17': 85, '21-m22': 137, '21-m24': 145 };   // the arc's five record boards

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = [];
  p.on('pageerror', e => { errs.push(e.message); console.log('ERR', e.message); });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.goto(BASE + '/index.html#/play'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const t = localStorage.getItem('tk-test'), h = localStorage.getItem('tk-harness'); localStorage.clear(); localStorage.setItem('tk-test', t || '1'); localStorage.setItem('tk-harness', h || '1'); localStorage.setItem('tk-guide', 'off'); });
  const lines = [];
  // tap through whatever the node map is telling (scrolls, dialogue), keeping every line
  const tell = async () => { let idle = 0;
    for (let i = 0; i < 400 && idle < 6; i++) {
      const s = await p.evaluate(() => { const q = x => document.querySelector(x);
        const sc = q('.tk-scroll-wrap'), d = q('.tk-dlg');
        return { scroll: sc ? sc.innerText.replace(/\s+/g, ' ').trim() : null, dlg: d ? { who: (q('.tk-dlg-name') || {}).textContent || '', zh: (q('.tk-dlg-zh') || {}).textContent || '', t: (q('.tk-dlg-text') || {}).textContent || '', ready: d.classList.contains('ready') } : null }; });
      if (s.scroll) { lines.push('[scroll] ' + s.scroll); await p.locator('.tk-scroll-go').first().click().catch(() => {}); await p.waitForTimeout(500); idle = 0; continue; }
      if (s.dlg) { if (!s.dlg.ready) { await p.locator('.tk-dlg').click({ position: { x: 20, y: 20 } }).catch(() => {}); await p.waitForTimeout(150); continue; }
        lines.push(`${s.dlg.who ? s.dlg.who + ': ' : ''}${s.dlg.t}${s.dlg.zh ? '  [zh: ' + s.dlg.zh + ']' : ''}`);
        await p.locator('.tk-dlg').click({ position: { x: 20, y: 20 } }).catch(() => {}); await p.waitForTimeout(250); idle = 0; continue; }
      idle++; await p.waitForTimeout(400);
    } };
  await p.goto(BASE + '/index.html#/tk/21'); await p.waitForTimeout(2500);
  await tell(); await p.waitForTimeout(800);
  const startOk = !errs.length && await p.evaluate(() => !!document.querySelector('.tk-play'));
  check(startOk, `fresh save: after the opening, the node map offers the first beat (page errors: ${errs.join(' | ') || 'none'})`);
  if (!startOk) {   // engine: no 21-start node (reported); carry on from m1
    await p.evaluate(() => TK.lsSet('tk-at', { 21: '21-m1' })); await p.goto(BASE + '/index.html#/play'); await p.waitForTimeout(500);
    await p.goto(BASE + '/index.html#/tk/21'); await p.waitForTimeout(2500); await tell(); }
  const keys = await p.evaluate(() => TK.world(21).nodes.map(n => n.key));
  for (const key of keys) {
    const at = await p.evaluate(() => ({ at: TK.at(21), info: (document.querySelector('.tk-info') || {}).innerText || '' }));
    lines.push(`\n=== ${key}  (map offers: ${at.info.replace(/\s+/g, ' ').slice(0, 90)})`);
    const play = p.locator('.tk-play');
    if (!(await play.count()) || await play.isDisabled()) { check(false, `${key}: the map offers Play (at ${at.at})`); break; }
    await play.click(); await p.waitForTimeout(1500);
    for (let i = 0; i < 20 && !(await p.evaluate(() => !!(window.__trainer && window.__trainer.alive))); i++) await p.waitForTimeout(300);
    const bd = await p.evaluate(() => { const t = window.__trainer; return t && { rec: t.p.record || null, ans: t.p.lines.filter(L => L[0] === 1).map(L => L[1]), credit: t.p.credit || '', b: t.p.b.length, w: t.p.w.length,
      src: (document.querySelector('.meta-sub') || {}).textContent || '', zh: [...document.querySelectorAll('.tk-en, .meta-title, .meta-sub, h2')].map(e => e.textContent).filter(x => /[㐀-鿿]/.test(x)).slice(0, 3) }; });
    if (!bd) { check(false, `${key}: a board opens`); break; }
    if (ASKED[key]) {
      const n = ASKED[key], [c, mv] = MOVES[n - 1];
      check(bd.rec === n && c === 'B' && bd.ans.length === 1 && bd.ans[0] === mv, `${key}: record board asks Black ${n}, and its one answer is Cho's move ${mv} (board: rec ${bd.rec}, answers ${bd.ans})`);
      const caps = { 29: 0, 47: 0, 85: 0, 137: 3, 145: 3 }[n];   // stones taken before move n (Black 97 and 115 take one each, White 102 one)
      check(bd.b + bd.w === n - 1 - caps, `${key}: the position is the game after ${n - 1} moves (${bd.b} black + ${bd.w} white on the board; expected ${n - 1 - caps})`);
      lines.push(`[record board] ${bd.credit} -> ${mv}`);
    } else if (bd.rec) check(false, `${key}: a record board the arc doesn't ask for (Black ${bd.rec})`);
    else lines.push(`[board] ${bd.src.replace(/\s+/g, ' ').slice(0, 80)}`);
    // solve: the key's line, tapped on the board
    for (let i = 0; i < 40; i++) {
      const s = await p.evaluate(() => { const t = window.__trainer, v = document.querySelector('.tk-verdict');
        if (v && /win/.test(v.className)) return { win: true };
        if (!t || t.done || t.engineBusy) return {};
        const n = t.played.length; if (n % 2) return {};
        const open = L => L.length - 1 > n && t.played.every((m, k) => m === L[k + 1]);
        const mv = (t.p.lines.find(L => L[0] === 1 && open(L)) || [])[n + 1]; if (!mv) return {};
        const c = mv.charCodeAt(0) - 97, r = mv.charCodeAt(1) - 97;
        const el = [...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e => +e.getAttribute('cx') === t.goban.px(c) && +e.getAttribute('cy') === t.goban.py(r));
        if (!el) return { miss: mv }; const R = el.getBoundingClientRect(); return { x: R.left + R.width / 2, y: R.top + R.height / 2 }; });
      if (s.win) break;
      if (s.miss) { check(false, `${key}: the answer ${s.miss} isn't on the board as shown`); break; }
      if (s.x) { await p.mouse.click(s.x, s.y); if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) await p.mouse.click(s.x, s.y); }
      await p.waitForTimeout(700);
    }
    const won = await p.evaluate(() => /win/.test((document.querySelector('.tk-verdict') || {}).className || ''));
    check(won, `${key}: the board is won`);
    if (!won) break;
    await p.locator('.tk-verdict button').click(); await p.waitForTimeout(1500);
    await tell();
    const after = await p.evaluate(k => ({ cleared: TK.cleared(k), at: TK.at(21) }), key);
    check(after.cleared, `${key}: cleared, and the map moves on (now at ${after.at})`);
  }
  const zh = lines.filter(l => CJK.test(l));
  check(!zh.length, `no Chinese in any line said (${zh.length}: ${zh.slice(0, 3).join(' | ')})`);
  check(await p.evaluate(() => TK.world(21).nodes.every(n => TK.cleared(n.key))), 'every beat cleared, m1 to m24');
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out/misaeng-nodes-lines.txt'), lines.join('\n'));
  await p.screenshot({ path: path.join(__dirname, 'out/misaeng-nodes-end.png') });
  await b.close();
  console.log(fails ? `misaeng-nodes: ${fails} failed` : 'misaeng-nodes: all ok');
})();
