// Red Chamber (world 31), the whole book on a phone by taps, from a fresh save, as a player does (after book-run.js):
// read the goal, tap toward it, tap people and spots, tap through scenes and scrolls, solve each board by tapping the
// key's moves. Checks: every beat d1 … g7 clears in story order; Daiyu leads Part 1 and Granny Liu (with Ban'er) Part 2,
// the hand-off at d8 → g1 across the "Chapters 4 and 5" scroll; the d8 day's-end scroll of smiles (none, played
// cleanly); at d7 the jade board is solved and the story still goes wrong (he hurls the jade down, after the board);
// g6 poses its three boards with Wang Xifeng and Granny Liu's own captions; the book completes. Fails on a page
// error, a slip (a board the key solves shouldn't see one), being stuck, a goal line with a count, or not finishing.
// Prints each beat's time and the places walked through; NOTE lines are feel notes, not failures.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path'); const SP = path.join(__dirname, 'out'); require('fs').mkdirSync(SP, { recursive: true });
const MAXMIN = +(process.env.MAXMIN || 35);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ ...devices[process.env.PLAYTEST_DEVICE || 'iPhone 13'] })).newPage();
  const T0 = Date.now(); const ts = () => ((Date.now() - T0) / 1000).toFixed(0).padStart(4) + 's'; const log = (...a) => console.log(ts(), ...a);
  let fails = 0; const fail = w => { fails++; log('FAIL', w); }; const ok = w => log('ok  ', w);
  const check = (c, w) => (c ? ok(w) : fail(w), c);
  p.on('pageerror', e => log('ERR', e.message, '@', (String(e.stack).split('\n')[1] || '').trim()));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));
  const URL = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html' + (process.env.PLAYTEST_KIT ? '?kit=' + process.env.PLAYTEST_KIT : '') + '#/tk/31';
  await p.goto(URL); await p.waitForTimeout(1000);
  await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k); localStorage.setItem('tk-guide', 'off'); localStorage.setItem('gt-username', 'hlm'); });
  await p.reload(); await p.waitForTimeout(2000);
  let shotN = 0; const shot = async n => p.screenshot({ path: `${SP}/hlm-walk-${String(++shotN).padStart(3, '0')}-${n.replace(/[^a-z0-9-]+/gi, '_').slice(0, 40)}.png` });
  const st = () => p.evaluate(() => {
    const w = window.__w; const q = s => document.querySelector(s); const r = {};
    r.cancel = [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Cancel' && !b.hidden && b.offsetParent !== null);
    r.scroll = !!q('.tk-scroll-go'); r.scrollT = q('.tk-scroll h3') && q('.tk-scroll h3').textContent; r.scrollBody = r.scroll && (q('.tk-scroll-wrap') || q('.tk-scroll')).innerText;
    r.duel = !!q('.tk-duel svg'); r.duelGo = !!q('.tk-duel-go'); r.duelLine = q('.tk-duel-dlg .town-en') && q('.tk-duel-dlg .town-en').textContent; r.rest = !!q('.tk-rest');
    r.cap = q('.tk-duel-dilemma') && q('.tk-duel-dilemma').textContent; r.tab = q('.tk-duel-dlg .town-tab') && q('.tk-duel-dlg .town-tab').textContent;
    r.party = TK.party(TK.world(31)).join(',');
    r.cleared = TK.world(31).nodes.filter(n => TK.cleared(n.key)).map(n => n.key.replace('31-', ''));
    if (!w || !w.player || !w.ui || !w.sys.isActive()) return r; r.ready = true; r.place = w.placeId; r.busy = w.ui.busy(); r.cine = !!w.cine; r.leaving = !!w.leaving;
    const d = q('.town-ui .town-dlg'); if (d && !d.hidden) r.line = (q('.town-ui .town-who').textContent || '') + ': ' + q('.town-ui .town-en').textContent;
    const g = q('.town-goal'); r.goal = g && g.textContent;
    const cam = w.cameras.main, cv = w.game.canvas, cr = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width;
    const toS = (x, y) => [cr.left + ((w.view ? w.view(x, y).x : x) - cam.worldView.x) * cam.zoom * k, cr.top + ((w.view ? w.view(x, y).y : y) - cam.worldView.y) * cam.zoom * k];
    r.pS = toS(w.player.x, w.player.y); r.pW = [Math.round(w.player.x), Math.round(w.player.y)]; r.cv = [cr.left, cr.top, cr.width, cr.height];
    const hud = [...document.querySelectorAll('.town-goal,.tk-menu-btn')].filter(e => e.offsetParent !== null && !e.hidden).map(e => e.getBoundingClientRect().bottom); r.top = Math.max(cr.top + 40, ...hud) + 16;
    if (w.goalAt) { r.gW = [w.goalAt.x, w.goalAt.y]; r.gS = toS(w.goalAt.x, w.goalAt.y); }
    const nm = w.nextMain(); r.next = nm && nm.node; r.walking = !!w.walk; return r;
  });
  const bestMove = () => p.evaluate(() => {
    const t = window.__trainer; if (!t || t.done || t.engineBusy || t.explore) return null;
    const n = t.played.length; if (n % 2) return null; const memo = new Map(); const open = L => L.length - 1 > n && t.played.every((m, i) => m === L[i + 1]);
    const moves = [...new Set([...t.p.lines.filter(L => L[0] === 1 && open(L)), ...t.p.lines.filter(L => L[0] === 2 && open(L))].map(L => L[n + 1]))]; if (!moves.length) return null;
    const best = moves.find(m => t.outcome([...t.played, m], memo) === 'ok') || moves[0]; const c = best.charCodeAt(0) - 97, r = best.charCodeAt(1) - 97;
    const el = [...t.goban.svg.querySelectorAll('circle[fill="transparent"]')].find(e => +e.getAttribute('cx') === t.goban.px(c) && +e.getAttribute('cy') === t.goban.py(r));
    if (!el) return { miss: best }; const R = el.getBoundingClientRect(); return { m: best, x: R.left + R.width / 2, y: R.top + R.height / 2 };
  });
  let last = {}, stuck = 0, lastP = null, taps = 0, wasted = 0, beatAt = Date.now(), beat = null;
  const beats = [], places = [], scrolls = [], boards = [], lines = [], leadAt = {};
  let clearedOrder = [], jadeBoardWonAt = -1, jadeSmashAt = -1;
  while ((Date.now() - T0) / 60000 < MAXMIN) {
    const s = await st();
    for (const k of s.cleared || []) if (!clearedOrder.includes(k)) { clearedOrder.push(k); log('** cleared', k, '(lead:', s.party + ')'); }
    if (s.cancel) { await p.getByText('Cancel', { exact: true }).first().tap(); await p.waitForTimeout(400); continue; }
    if (s.scroll) {
      if (s.scrollT !== last.scrollT) { log('[scroll]', (s.scrollT || '').replace(/\s+/g, ' ')); scrolls.push({ t: s.scrollT || '', body: s.scrollBody || '', at: [...clearedOrder], party: s.party }); await shot('scroll'); }
      await p.locator('.tk-scroll-go').first().tap(); await p.waitForTimeout(600); last = s; continue;
    }
    if (s.duel) {
      if (!last.duel) { log('[board]', (s.cap || '(no caption)').replace(/\s+/g, ' '), '|', (s.duelLine || '').slice(0, 70)); boards.push({ cap: s.cap || '', tab: s.tab || '', open: s.duelLine || '', next: last.next, at: [...clearedOrder] }); await p.waitForTimeout(600); }
      if (s.duelGo) {
        if (!last.duelGo) log('   won:', (s.duelLine || '').slice(0, 80));
        if (/可也有玉没有|Have you a jade/.test(s.cap || '')) jadeBoardWonAt = lines.length;
        await p.waitForTimeout(300); await p.locator('.tk-duel-go').first().tap(); await p.waitForTimeout(800); last = s; continue;
      }
      if (s.rest) { fail('a slip on a board solved by its key: ' + (s.duelLine || '')); await p.evaluate(() => { const d = TK.ls('tk-rest'); for (const k in d) d[k] = Date.now() - 1; TK.lsSet('tk-rest', d); }); await p.waitForTimeout(1500); last = s; continue; }
      const m = await bestMove(); if (m && m.x) { await p.touchscreen.tap(m.x, m.y); if (await p.evaluate(() => !!(window.__trainer && window.__trainer.goban.ghost))) await p.touchscreen.tap(m.x, m.y); await p.waitForTimeout(900); }
      else if (m && m.miss) { fail('the key\'s move ' + m.miss + ' is not on the board as shown'); await p.waitForTimeout(1000); } else await p.waitForTimeout(400);
      last = s; continue;
    }
    if (!s.ready) { await p.waitForTimeout(400); last = s; continue; }
    if (s.place !== last.place) { log('== ' + s.place); if (!places.includes(s.place)) { places.push(s.place); await p.waitForTimeout(500); await shot(s.place); } }
    if (s.goal && s.goal !== last.goal) { log('-- goal:', s.goal.slice(0, 110)); if (/[（(]\s*\d+\s*\/\s*\d+\s*[)）]/.test(s.goal)) fail('the goal line has a count: ' + s.goal); }
    if (s.next !== beat) { if (beat) beats.push([beat, (Date.now() - beatAt) / 1000]); beat = s.next; beatAt = Date.now(); if (beat && !leadAt[beat]) leadAt[beat] = s.party; }
    if (!s.next && !s.busy && !s.cine) { log('book complete'); await shot('complete'); break; }
    if (s.busy || s.cine) {
      if (s.line && s.line !== last.line) { log('  >', s.line.slice(0, 120)); lines.push(s.line); if (/hurls the jade down/.test(s.line) && jadeSmashAt < 0) jadeSmashAt = lines.length; }
      const box = await p.evaluate(() => { const d = document.querySelector('.town-ui .town-dlg'); if (d && !d.hidden) { const r = d.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; } return null; });
      await p.touchscreen.tap(...(box || [s.cv[0] + s.cv[2] / 2, s.cv[1] + s.cv[3] * .85])); await p.waitForTimeout(350); last = s; stuck = 0; continue;
    }
    if (s.leaving || s.walking) { await p.waitForTimeout(300); last = s; continue; }
    if (!s.gS) { await p.waitForTimeout(800); stuck++; if (stuck > 8) { fail('no goal point at ' + s.place + ' (next ' + s.next + ')'); await shot('nogoal'); break; } last = s; continue; }
    const moved = lastP && Math.hypot(s.pW[0] - lastP[0], s.pW[1] - lastP[1]) > 3; if (lastP && !moved) { stuck++; wasted++; } else stuck = 0;
    if (stuck === 6) { log('stuck: taps not moving her at', s.place, s.pW, 'goal', s.gW); await shot('stuck-' + s.place); }
    if (stuck > 20) { fail('stuck at ' + s.place + ' ' + s.pW + ' going to ' + s.gW); break; }
    const [L, Tp, W, H] = s.cv, m = 40, top = Math.max(Tp + m, s.top); let [gx, gy] = s.gS; const on = gx > L + m && gx < L + W - m && gy > top && gy < Tp + H - m;
    let tx, ty; if (on) { tx = gx; ty = gy; } else {
      const cx = s.pS[0], cy = s.pS[1], dx = gx - cx, dy = gy - cy; let f = 1;
      for (const [lim, d, c0] of [[L + m, dx, cx], [L + W - m, dx, cx], [top, dy, cy], [Tp + H - m, dy, cy]]) if (d) { const ff = (lim - c0) / d; if (ff > 0) f = Math.min(f, ff); } tx = cx + dx * f; ty = cy + dy * f;
    }
    if (stuck >= 2) { tx += (Math.random() - .5) * 160; ty += (Math.random() - .5) * 160; }
    await p.touchscreen.tap(tx, ty); taps++; lastP = s.pW; await p.waitForTimeout(700); last = s;
  }
  const done = await p.evaluate(() => !!window.__w && !window.__w.nextMain());
  if (beat && done) beats.push([beat, (Date.now() - beatAt) / 1000]);
  const s = await st(); for (const k of s.cleared || []) if (!clearedOrder.includes(k)) clearedOrder.push(k);
  console.log('\n--- checks');
  check(done, `the book is finished${done ? '' : ' (next ' + (await p.evaluate(() => window.__w && window.__w.nextMain() && window.__w.nextMain().node)) + ' after ' + MAXMIN + ' min)'}`);
  const KEYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6a', 'd6', 'd7', 'd8', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
  check(JSON.stringify(clearedOrder) === JSON.stringify(KEYS), `beats cleared in story order: ${clearedOrder.join(' ')}`);
  const daiyuLed = KEYS.slice(0, 9).every(k => !leadAt['31-' + k] || /^daiyu/.test(leadAt['31-' + k]));
  const grannyLed = KEYS.slice(9).every(k => !leadAt['31-' + k] || /^grannyliu/.test(leadAt['31-' + k]));
  check(daiyuLed && grannyLed, `Daiyu leads d1–d8, Granny Liu g1–g7 (${Object.entries(leadAt).map(([k, v]) => k.replace('31-', '') + ':' + v).join(' ')})`);
  const c45 = scrolls.find(x => /第四回|Chapters 4 and 5/.test(x.t));
  check(!!c45 && c45.at.includes('d7') && !c45.at.includes('g1'), `the "Chapters 4 and 5" scroll between d8 and g1${c45 ? ' (after ' + c45.at.slice(-1) + ')' : ': not seen'}`);
  const tally = scrolls.find(x => /一日已尽/.test(x.body));
  check(!!tally && !/有\d+回|\d+ times today/.test(tally.body), `the d8 day's-end scroll, with no smiles (played cleanly)${tally ? ': ' + tally.body.replace(/\s+/g, ' ').slice(0, 120) : ': not seen'}`);
  check(jadeBoardWonAt >= 0 && jadeSmashAt > jadeBoardWonAt, `d7: the jade board solved, and after it he hurls the jade down (board at line ${jadeBoardWonAt}, smash at ${jadeSmashAt})`);
  const g6 = boards.filter(x => /首领|Boss/.test(x.tab));
  check(g6.length === 3 && /说出口/.test(g6[0].cap) && /藏没处藏/.test(g6[1].cap) && /求她/.test(g6[2].cap), `g6, the boss: three boards (${g6.map(x => x.cap.replace(/\s+/g, ' ')).join(' / ')})`);
  check(g6.every(x => !/Defeated|brought them in/.test(x.open)), 'g6: Granny Liu speaks her own lines on the boss boards');
  const story = boards.filter(x => x.cap), roadside = boards.length - story.length;
  check(story.length === 18, `18 story boards met on the walk (${story.length}${roadside ? `, and ${roadside} road challenger${roadside > 1 ? 's' : ''} the walk ran into` : ''})`);
  console.log('\nbeats (time from the goal appearing to the next one):'); for (const [k, v] of beats) console.log(`   ${k.padEnd(8)} ${v.toFixed(0)} s${v > 240 ? '   NOTE long' : ''}`);
  console.log(`places: ${places.join(' → ')}`);
  if (wasted > taps * 0.25) console.log(`NOTE ${wasted} of ${taps} walking taps didn't move her`);
  console.log(`hlm-walk: ${((Date.now() - T0) / 60000).toFixed(1)} min, ${taps} walking taps (${wasted} didn't move her), ${boards.filter(x => x.cap).length} story boards and ${boards.filter(x => !x.cap).length} challengers, ${places.length} places; ${fails} failed`);
  await b.close(); process.exit(fails ? 1 : 0);
})();
