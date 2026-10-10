// Misaeng's mechanics as a player sees them (tk-modern.js), on desktop and a phone, by clicks and taps, with screenshots.
// Same stage as misaeng-mechanics.js (Book 13's East Road with the world's keys and people injected), but the world is
// English-only throughout ("lang": "en", as world 21 is), and this looks rather than asserts the logic:
//   the strip (in the HUD, not on the goal box or Menu; tap opens it large; Escape and the backdrop close it),
//   a record board (on screen, the asked move named, no Chinese, points far enough apart to tap or the preview tap),
//   the bag and the audit board (cards big enough to tap, Escape closes, no overlap), the shop and buyers (chip clear of
//   the goal box, the strip and the dialogue), the seat's line, and no Chinese anywhere on screen in an English world.
// Screenshots: out/misaeng-look-<device>-<step>.png. PLAYTEST_DEVICES="desktop,iPhone 13" picks devices.
const { chromium, devices } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
const BASE = process.env.PLAYTEST_URL || 'http://localhost:8765';
const DEVS = (process.env.PLAYTEST_DEVICES || 'desktop,iPhone 13,iPhone SE').split(',');
let fails = 0, notes = 0;
const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); };
const note = w => { notes++; console.log('NOTE ' + w); };
const CJK = /[㐀-鿿가-힯]/;

async function run(b, dev) {
  const opts = dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] };
  const ctx = await b.newContext(opts), p = await ctx.newPage(), touch = !!opts.hasTouch;
  const tag = dev.replace(/\s+/g, '').toLowerCase();
  const shot = async n => { await p.waitForTimeout(250); await p.screenshot({ path: path.join(__dirname, `out/misaeng-look-${tag}-${n}.png`) }); };
  const tap = async sel => { const l = p.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await p.waitForTimeout(250); };
  const box = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom } : null; }, sel);
  const hit = (a, c) => a && c && a.x < c.r && c.x < a.r && a.y < c.b && c.y < a.b;
  const onScreen = (a, vw, vh) => a && a.x >= 0 && a.y >= 0 && a.r <= vw + 1 && a.b <= vh + 1;
  // the Chinese in what's on screen (an English-only world should show none)
  const zh = () => p.evaluate(re => { const out = [], R = new RegExp(re);
    const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3 && R.test(c.textContent)) { const e = c.parentElement, r = e.getBoundingClientRect(), s = getComputedStyle(e);
        const data = /town-goal-main|town-who|name-zh/.test(e.className || '') || (!e.className && /曹操|告诉他/.test(c.textContent));   // Book 13's own text (the stage), not the engine's
        const inGame = e.closest('.tk-map, .tk-bag, .tk-duel, .tk-duel-full, .town-dlg');
        if (inGame && !data && r.width && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0) out.push(`${e.className || e.tagName}: ${c.textContent.trim().slice(0, 40)}`); } else if (c.nodeType === 1) walk(c); } };
    walk(document.body); return [...new Set(out)]; }, CJK.source);
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.goto(BASE + '/index.html#/tk/13'); await p.waitForTimeout(800);
  const setup = () => p.evaluate(async () => { await TK.load();
    const sgf = await (await fetch('docs/book2/misaeng-ing-cup-g5.sgf')).text();
    const moves = [...sgf.matchAll(/;\s*([BW])\[([a-s]{2})\]/g)].map(m => [m[1], m[2]]);
    for (const w of [TK.world(13), window.__w && window.__w.w].filter(Boolean)) {
      w.lang = 'en'; w.record = { title: '1st Ing Cup final, game 5', black: 'Cho Hunhyun', white: 'Nie Weiping', moves }; delete w.__recordBook;
      const nd = w.nodes.find(n => n.key === '13-c19'); nd.move = 28; nd.record = 29;
      Object.assign(w.items = w.items || {}, {
        statements: { kind: 'clue', name: "Baekjin's statements", text: 'Used cars to Jordan, through Baekjin Trading. The margin is far above anything in the trade.' },
        coached: { kind: 'clue', name: "Baekjin's staff", text: 'Every answer the same, in the same words. Park Jong-sik was there before us.' },
        icb_listing: { kind: 'clue', name: "ICB's registration", text: 'ICB Company, Amman. Every officer listed is Jordanian. Signatory: Muhammad Indira.' },
        icb_call: { kind: 'clue', name: 'My call to ICB', text: 'When I called ICB about the paperwork, someone in the room behind was speaking Korean.' },
        water: { kind: 'prop', name: 'Still water' },
        seating_notes: { kind: 'note', name: 'Seating notes', text: 'President: still water, no ice. Executive vice president: green tea. Division head: coffee, black.' } });
      w.audit = { title: 'The audit board', clues: ['statements', 'coached', 'icb_listing', 'icb_call'], done: 'audit', links: [
        { q: "Why is Baekjin's margin so high?", pair: ['statements', 'coached'], a: 'Someone taught Baekjin what to say. The margin is the money.' },
        { q: 'Who is ICB, really?', pair: ['icb_listing', 'icb_call'], a: 'Every officer is Jordanian on paper. So who was speaking Korean on their line?' }] };
      w.trade = { cash: 100000, unit: '₩', goods: { socks: { name: 'Socks (10 pairs)', cost: 20000 } }, done: 'trade', ends: { offers: 5 } };
    } });
  await p.evaluate(async () => { localStorage.clear(); localStorage.setItem('tk-guide', 'off'); await TK.load(); const w = TK.world(13);
    for (const n of w.nodes) { if (n.key === '13-c19') break; TK.markCleared(n.key); } TK.markCleared('13-start');
    TK.lsSet('tk-items', { 13: ['statements', 'coached', 'seating_notes'] }); TK.setParty(w, ['caocao']);
    localStorage.setItem('tk-world-13', JSON.stringify({ place: 'the-east-road', party: ['caocao'] })); });
  await p.reload(); await setup(); await p.waitForTimeout(3000);
  for (let i = 0; i < 10; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {}); await p.waitForTimeout(200); }
  const at = await p.evaluate(() => { const s = window.__w; s.st.pos = { place: s.placeId, x: s.player.x, y: s.player.y, f: 'right' }; s.save(); return { x: s.player.x, y: s.player.y, T: s.tw }; });
  await p.route('**/the-east-road.tmj*', async r => { const res = await r.fetch(); const m = await res.json(); const L = m.layers.find(l => l.name === 'objects'); const T = at.T;
    const npc = (id, dx, dy, extra) => ({ id: 90000 + L.objects.length, name: id, type: 'npc', x: at.x + dx * T, y: at.y + dy * T, width: 0, height: 0, properties: [
      { name: 'kind', type: 'string', value: 'folk.villager' }, { name: 'sprite', type: 'string', value: 'f_villager' }, { name: 'wander', type: 'bool', value: false }, { name: 'drawn', type: 'bool', value: true },
      { name: 'say', type: 'string', value: JSON.stringify([['n', 'Socks, ten pairs a pack. Twenty thousand.', '']]) }, ...extra] });
    L.objects.push(npc('shopkeep', 2, -2, [{ name: 'shop', type: 'string', value: '["socks"]' }, { name: 'label', type: 'string', value: 'The market stall' }]));
    L.objects.push(npc('buyer-yes', -2, -2, [{ name: 'buyer', type: 'string', value: JSON.stringify({ wants: ['socks'], pays: 30000, yes: [['say', 'f_villager', '', 'Socks? Fine, I need some. My feet are always cold at the market.']] }) }]));
    L.objects.push(npc('buyer-no', -4, -2, [{ name: 'buyer', type: 'string', value: JSON.stringify({ wants: ['socks'], no: [['n', '"No thanks."', '']] }) }]));
    L.objects.push({ id: 99901, name: 'seat-a', type: 'spot', x: at.x - 2 * T, y: at.y + 2 * T, width: 0, height: 0, properties: [
      { name: 'needs', type: 'string', value: '["item:water"]' }, { name: 'delivers', type: 'string', value: 'seat_a' }, { name: 'takes', type: 'bool', value: true },
      { name: 'deliver', type: 'string', value: JSON.stringify([['n', "You set the president's water at the head of the table.", '']]) },
      { name: 'waiting', type: 'string', value: JSON.stringify([['n', "The notes say the president's water goes here.", '']]) }] });
    L.objects.push({ id: 99902, name: 'audit-table', type: 'spot', x: at.x + 2 * T, y: at.y + 2 * T, width: 0, height: 0, properties: [{ name: 'opens', type: 'string', value: 'audit' }] });
    r.fulfill({ response: res, json: m }); });
  await p.reload(); await setup(); await p.waitForFunction(() => window.__w && window.__w.player && window.__w.npcs.some(n => n.shop), null, { timeout: 30000 }); await p.waitForTimeout(1500);
  for (let i = 0; i < 10; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {}); await p.waitForTimeout(200); }
  const clear = async () => { for (let i = 0; i < 12 && await p.evaluate(() => window.__w.ui.busy()); i++) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); } };
  await clear(); await setup();
  await p.evaluate(() => window.__w.setGoal()); await p.waitForTimeout(300);
  const vw = await p.evaluate(() => innerWidth), vh = await p.evaluate(() => innerHeight);
  console.log(`--- ${dev} (${vw}x${vh}${touch ? ', touch' : ''})`);

  // 1. the HUD: the strip beside the goal box and the Menu
  await shot('1-hud');
  const strip = await box('.tk-strip'), goal = await box('.town-goal'), menu = await box('.tk-menu-row');
  check(onScreen(strip, vw, vh), `strip on screen (${JSON.stringify(strip)})`);
  check(!hit(strip, goal), `strip clear of the goal box (strip ${JSON.stringify(strip)}, goal ${JSON.stringify(goal)})`);
  check(!hit(strip, menu), `strip clear of the menu row (menu ${JSON.stringify(menu)})`);
  if (touch && strip && (strip.w < 44 || strip.h < 44)) note(`strip is ${strip.w}x${strip.h}, under 44 px to tap`);
  let cjk = await zh(); check(!cjk.length, `no Chinese on screen in an English world: HUD (${cjk.join(' | ')})`);
  // tap the strip: the record large
  await tap('.tk-strip'); await shot('2-record-large');
  const big = await box('.tk-record .tk-bag-box');
  check(onScreen(big, vw, vh), `the record opened large fits the screen (${JSON.stringify(big)})`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const escRec = await p.locator('.tk-record').count();
  if (!touch) check(escRec === 0, `Escape closes the record opened large (still open: ${escRec})`);
  if (escRec) await tap('.tk-record button');
  if (touch) { await tap('.tk-strip'); const bx = await box('.tk-record .tk-bag-box'); if (bx) { await p.touchscreen.tap(Math.max(4, bx.x / 2), Math.max(4, bx.y / 2)); await p.waitForTimeout(250); }
    check(await p.locator('.tk-record').count() === 0, 'a tap outside the record opened large closes it'); await p.evaluate(() => document.querySelectorAll('.tk-record').forEach(e => e.remove())); }

  // 2. a record board, opened as the beat's board
  await p.evaluate(async () => { TKOverlay.open(13, '13-c19', { host: document.querySelector('.tk-map') }); for (let i = 0; i < 40 && !(window.__trainer && window.__trainer.alive); i++) await new Promise(r => setTimeout(r, 100)); });
  await p.waitForTimeout(800); await shot('3-record-board');
  const rb = await p.evaluate(() => { const t = window.__trainer, svg = document.querySelector('.tk-duel svg, .tk-duel-full svg'); const r = svg && svg.getBoundingClientRect();
    const crop = t && t.view ? t.view : null; return { src: (document.querySelector('.tk-duel-src') || {}).textContent || '', svg: r && { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }, crop, cap: (document.querySelector('.tk-duel .town-en') || {}).textContent || '' }; });
  check(/Black 29/.test(rb.src), `record board names the move asked (${rb.src})`);
  check(onScreen(rb.svg, vw, vh), `record board's board on screen (${JSON.stringify(rb.svg)})`);
  if (rb.svg) { const pitch = Math.min(rb.svg.w, rb.svg.h) / 19.5; if (pitch < 28) note(`record board: points about ${pitch.toFixed(1)} px apart (whole 19x19 shown); taps rely on the preview tap`); }
  cjk = await zh(); check(!cjk.length, `no Chinese on screen in an English world: record board (${cjk.join(' | ')})`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  check(!(await p.evaluate(() => !!document.querySelector('.tk-duel'))), 'Escape leaves the record board');

  // 3. the bag, then the audit board from it
  await p.evaluate(() => [...document.querySelectorAll('button')].find(x => /Bag/.test(x.textContent) && !x.closest('.tk-bag'))?.click()); await p.waitForTimeout(300);
  await shot('4-bag');
  cjk = await zh(); check(!cjk.length, `no Chinese on screen in an English world: bag (${cjk.join(' | ')})`);
  const bagBox = await box('.tk-bag .tk-bag-box'); check(onScreen(bagBox, vw, vh), `bag fits the screen (${JSON.stringify(bagBox)})`);
  await tap('.tk-bag-audit'); await shot('5-audit');
  const ab = await box('.tk-audit .tk-bag-box'); check(onScreen(ab, vw, vh), `audit board fits the screen (${JSON.stringify(ab)})`);
  const cards = await p.evaluate(() => [...document.querySelectorAll('.tk-audit-card:not(.missing)')].map(c => { const r = c.getBoundingClientRect(); return { w: r.width, h: r.height, b: r.bottom }; }));
  if (touch) check(cards.every(c => c.h >= 44 && c.w >= 44), `audit cards big enough to tap (${cards.map(c => `${c.w | 0}x${c.h | 0}`).join(', ')})`);
  check(cards.every(c => c.b <= vh), `every audit card on screen without scrolling (bottoms ${cards.map(c => c.b | 0).join(', ')}; screen ${vh})`);
  const bagUnder = await p.locator('.tk-bag:not(.tk-audit)').count();
  if (bagUnder) note('the bag stays open under the audit board');
  await tap('.tk-audit-card >> nth=0'); await tap('.tk-audit-card >> nth=1'); await shot('6-audit-linked');
  const say1 = await p.evaluate(() => document.querySelector('.tk-audit-say').textContent);
  check(/taught Baekjin/.test(say1), `tapping the right two links them (${say1})`);
  cjk = await zh(); check(!cjk.length, `no Chinese on screen in an English world: audit (${cjk.join(' | ')})`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  check(await p.locator('.tk-audit').count() === 0, 'Escape closes the audit board');
  const bagLeft = await p.locator('.tk-bag').count();
  if (bagLeft) { note(`after the audit board closes, ${bagLeft} bag layer(s) still open`); await shot('7-after-audit'); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    if (await p.locator('.tk-bag').count()) { await p.evaluate(() => document.querySelectorAll('.tk-bag').forEach(e => e.remove())); note('Escape did not close the bag; removed it to go on'); } }

  // 4. the trade: the shop, the chip, a buyer, the dialogue
  await p.evaluate(() => { const w = TK.world(13); WorldMarks.add(w, 'tradeon'); for (const x of [w, window.__w.w]) x.trade.when = 'mark:tradeon'; window.__w.setGoal(); }); await p.waitForTimeout(300);
  await shot('8-chip');
  const chip = await box('.tk-trade-chip'), strip2 = await box('.tk-strip'), goal2 = await box('.town-goal');
  check(onScreen(chip, vw, vh), `cash chip on screen (${JSON.stringify(chip)})`);
  check(!hit(chip, goal2), `cash chip clear of the goal box (goal ${JSON.stringify(goal2)})`);
  check(!hit(chip, strip2), `cash chip clear of the strip (strip ${JSON.stringify(strip2)})`);
  // walk up and talk to the shopkeeper by tapping them on the canvas
  const tapNpc = async id => { const xy = await p.evaluate(id => { const s = window.__w, n = s.npcs.find(n => n.id === id), cam = s.cameras.main, cv = s.game.canvas.getBoundingClientRect(), k = cv.width / s.scale.width;
      return { x: cv.x + (n.spr.x - cam.worldView.x) * cam.zoom * k, y: cv.y + (n.spr.y - 6 - cam.worldView.y) * cam.zoom * k }; }, id);
    if (touch) await p.touchscreen.tap(xy.x, xy.y); else await p.mouse.click(xy.x, xy.y);
    for (let i = 0; i < 30; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('.tk-shop') || window.__w.ui.busy())) return true; }
    return false; };
  const reached = await tapNpc('shopkeep');
  check(reached, 'tapping the shopkeeper walks up and opens the shop');
  if (!reached) await p.evaluate(() => { const s = window.__w; s.act({ kind: 'npc', n: s.npcs.find(n => n.id === 'shopkeep') }); });
  await p.waitForTimeout(400); await shot('9-shop');
  const shopBox = await box('.tk-shop .tk-bag-box'); check(onScreen(shopBox, vw, vh), `shop fits the screen (${JSON.stringify(shopBox)})`);
  const buy = await box('.tk-shop li button'); if (touch) check(buy && buy.h >= 32, `"Buy one" is big enough to tap (${JSON.stringify(buy)})`);
  await tap('.tk-shop li button'); await tap('.tk-shop li button');
  const sc = await p.evaluate(() => document.querySelector('.tk-shop-cash').textContent);
  check(/₩60,000/.test(sc), `two bought by taps (${sc})`);
  cjk = await zh(); check(!cjk.length, `no Chinese on screen in an English world: shop (${cjk.join(' | ')})`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  check(await p.locator('.tk-shop').count() === 0, 'Escape closes the shop');
  if (await p.locator('.tk-shop').count()) await tap('.tk-shop-close');
  const okBuyer = await tapNpc('buyer-yes');
  check(okBuyer, 'tapping a buyer walks up and makes the offer');
  if (!okBuyer) await p.evaluate(() => { const s = window.__w; s.act({ kind: 'npc', n: s.npcs.find(n => n.id === 'buyer-yes') }); });
  await p.waitForTimeout(2500); await shot('10-buyer');
  const dlg = await box('.town-dlg'), chip3 = await box('.tk-trade-chip'), strip3 = await box('.tk-strip');
  check(!hit(dlg, chip3), `the dialogue box doesn't cover the chip (dlg ${JSON.stringify(dlg)}, chip ${JSON.stringify(chip3)})`);
  check(!hit(dlg, strip3), `the dialogue box doesn't cover the strip (strip ${JSON.stringify(strip3)})`);
  cjk = await zh(); check(!cjk.length, `no Chinese on screen in an English world: dialogue (${cjk.join(' | ')})`);
  // Enter moves the talk on (desktop), taps on a phone
  for (let i = 0; i < 8 && await p.evaluate(() => window.__w.ui.busy()); i++) { if (touch) await p.touchscreen.tap(vw / 2, vh - 60); else await p.keyboard.press('Enter'); await p.waitForTimeout(700); }
  check(!(await p.evaluate(() => window.__w.ui.busy())), `${touch ? 'taps' : 'Enter'} take the buyer's talk to its end`);
  const chipT = await p.evaluate(() => (document.querySelector('.tk-trade-chip') || {}).textContent || '');
  check(/₩90,000/.test(chipT), `sold: the chip shows the cash (${chipT})`);
  await shot('11-sold');

  // 5. the seat in the board room: what it says without the thing
  await p.evaluate(() => { const s = window.__w; s.act({ kind: 'spot', k: 'seat-a' }); }); await p.waitForTimeout(2600); await shot('12-seat');
  const seat = await p.evaluate(() => (document.querySelector('.town-dlg .town-en') || {}).textContent || '');
  check(/water goes here/.test(seat), `the seat says what goes there (${seat})`);
  await clear();
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  require('fs').mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  for (const d of DEVS) { try { await run(b, d.trim()); } catch (e) { fails++; console.log(`FAIL ${d}: ${e.message.split('\n')[0]}`); } }
  await b.close();
  console.log(fails ? `misaeng-look: ${fails} failed, ${notes} notes` : `misaeng-look: all ok, ${notes} notes`);
})();
