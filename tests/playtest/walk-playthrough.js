// A book played the way a player plays it (BOOK, default 12; DIFF easy|hard, default the game's own). From a
// fresh save, beat after beat: follow the game's own goal (its pointer: the next spot, a giver, a delivery
// place, or the way out toward them) by tapping it through the game's tap handler, so every exit, door and
// road is really walked through; tap through every line and scene; win each board with the test-mode Skip.
// Nothing is teleported, marked cleared or handed over: items, marks and party changes come from playing.
// A stealth beat is crossed by timing (the patrols simulated ahead), still walked a cell at a time.
// Fails a beat, with the place, position and last line, when the player is refused a way (a closed road, a
// barred door), gets stuck (no progress for STUCK seconds) or has nowhere to go. Writes a per-beat report
// to out/walk-playthrough-<book>-<diff>.json. Slow (about half an hour): run before a release and after any
// change to maps, region links, map states or placeOpen.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const BOOK = +(process.env.BOOK || 12), DIFF = process.env.DIFF || '', STUCK = +(process.env.STUCK || 60), MAXMIN = +(process.env.MAXMIN || 55);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const p = await (await b.newContext({ ...devices['iPhone 13'] })).newPage();
  const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('ERR', e.message); });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  await p.goto(BASE + '#/');
  await p.evaluate(([B, D]) => {
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
    localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', String(B)); if (D) localStorage.setItem('tk-diff', D);
  }, [BOOK, DIFF]);
  const FROM = process.env.FROM || '', UNTIL = process.env.UNTIL || '';
  if (FROM) await p.evaluate(([B, F]) => {   // setup only: what the beats before FROM leave behind is taken as given (FROM= is for a quick check; a release runs the whole book)
    return TK.load().then(() => { const w = TK.world(B), ks = w.nodes.map(n => n.key), i = ks.indexOf(F); let party = null;
      for (const [j, n] of w.nodes.entries()) if (j < i) { if (!['side', 'short'].includes(n.role)) TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene]; for (const st of (sc && sc.steps) || []) { if (st[0] === 'party') party = st[1]; if (st[0] === 'item' && typeof WorldItems !== 'undefined') WorldItems.add(w, st[1]); } }
      TK.markSeen(B + ':opening'); if (party) TK.setParty(w, party); }); }, [BOOK, FROM]);
  await p.goto(BASE + '#/tk/' + BOOK); await p.reload();
  if (FROM) { for (let i = 0; i < 80 && !(await p.evaluate(() => !!(window.__w && window.__w.player))); i++) await p.waitForTimeout(250);
    await p.evaluate(([B, F]) => { const w = window.__w, Q = w.region.quests, i = Q.findIndex(q => q.node === F), prev = Q.slice(0, i).reverse().find(q => q.role === 'main' || q.role === 'boss');
      const pl = prev ? prev.place : w.region.start, top = w.region.places.find(x => x.id === pl); for (const id of [top && top.parent, pl]) if (id && !w.st.visited.includes(id)) w.st.visited.push(id);
      w.save(); w.leaving = false; w.cine = null; if (w.placeId !== pl) w.go(pl); }, [BOOK, FROM]); await p.waitForTimeout(1500); }
  // which board is up: the key the game opened it with
  for (let i = 0; i < 40 && !(await p.evaluate(() => typeof TKOverlay !== 'undefined')); i++) await p.waitForTimeout(250);
  const hook = () => p.evaluate(() => { if (typeof TKOverlay === 'undefined' || TKOverlay.__hooked) return; const o = TKOverlay.open.bind(TKOverlay); TKOverlay.open = (n, key, at) => { window.__boardKey = key; return o(n, key, at); }; TKOverlay.__hooked = true; }).catch(() => {});
  await hook();

  // the page, as the loop needs it each tick
  const look = () => p.evaluate(() => {
    const w = window.__w, d = document;
    const dlg = d.querySelector('.town-ui .town-dlg'), line = dlg && !dlg.hidden ? (dlg.querySelector('.town-en') || dlg).textContent.trim() : '';
    const vis = s => { const e = d.querySelector(s); return !!(e && e.offsetParent !== null); };
    if (!w || !w.player || !w.w) return { boot: true, scroll: vis('.tk-scroll-go'), cancel: [...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Cancel' && b.offsetParent) };
    const q = w.nextMain();
    return {
      book: w.w.n, place: w.placeId, lead: w.lead, party: (w.st.party || []).join(','), next: q && q.node, P: [Math.round(w.player.x), Math.round(w.player.y)],
      goal: w.goalAt && [Math.round(w.goalAt.x), Math.round(w.goalAt.y)], busy: w.ui.busy(), cine: !!w.cine, leaving: !!w.leaving, walking: !!w.walk,
      caught: !!w.caught, engaged: !!w.engaged, line, scroll: vis('.tk-scroll-go'), duel: !!d.querySelector('.tk-duel svg'), cont: vis('.tk-duel-go'),
      skip: !!d.querySelector('.tk-duel-keys button') && [...d.querySelectorAll('.tk-duel-keys button')].some(b => /Skip/.test(b.textContent)),
      cleared: TK.world(w.w.n).nodes.filter(n => TK.cleared(n.key)).length, items: JSON.stringify((typeof WorldItems !== 'undefined' && WorldItems.list && WorldItems.list(w.w)) || []),
      cancel: [...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Cancel' && b.offsetParent),
      watchers: w.npcs.filter(n => n.watch && ((n.watch.seen || []).length || n.watch.back_to) && w.watching(n)).length,
    };
  });
  const tapEl = async sel => { const e = p.locator(sel).first(); if (await e.count()) await e.tap({ timeout: 2000 }).catch(() => {}); };
  // a tap on a point of the world: on screen, a real tap there; off screen, the game's own tap handler
  const tapWorld = async (x, y) => {
    const s = await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width, v = w.view ? w.view(x, y) : { x, y };
      const sx = r.left + (v.x - cam.worldView.x) * cam.zoom * k, sy = r.top + (v.y - cam.worldView.y) * cam.zoom * k;
      const goalLine = d => { const g = d.querySelector('.town-goal'); return g && g.getBoundingClientRect(); };
      const g = goalLine(document), hud = g ? g.bottom + 6 : r.top + 60;
      return { sx, sy, on: sx > r.left + 8 && sx < r.right - 8 && sy > hud && sy < r.bottom - 8 }; }, [x, y]);
    if (s.on) await p.touchscreen.tap(s.sx, s.sy);
    else await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, v = w.view ? w.view(x, y) : { x, y }; w.tapAt(x, y, (v.x - cam.worldView.x) * cam.zoom, (v.y - cam.worldView.y) * cam.zoom); }, [x, y]);
  };
  // the patrols ahead, and a way to the goal none of them sees: cells, one per 150 ms (stealth-12's planner)
  const plan = () => p.evaluate(() => {
    const w = window.__w, T = w.tw || 16, C = 16, DT = 50, STEP = 3, F = 1200, goal = w.goalAt; if (!goal) return null;
    const G = w.walkGrid(), cols = Math.ceil(G.cols * G.C / C), rows = Math.ceil(G.rows * G.C / C), free = (cx, cy) => G.free(Math.floor((cx * C + 8) / G.C), Math.floor((cy * C + 10) / G.C));
    const cat = w.npcs.filter(n => n.watch && ((n.watch.seen || []).length || n.watch.back_to) && w.watching(n));
    const tracks = cat.map(n => { const W = n.watch, st = { x: n.spr.x, y: n.spr.y, leg: W.leg, wait: W.wait, dir: W.dir, t: W.t, turn: W.turn }, out = [];
      for (let f = 0; f < F; f++) { out.push({ x: st.x, y: st.y, dir: st.dir });
        if (W.pts.length > 1) { if (st.wait > 0) st.wait -= DT; else { const tg = W.pts[st.leg], dx = tg.x - st.x, dy = tg.y - st.y, d = Math.hypot(dx, dy), v = 30 * DT / 1000;
          if (d <= v) { st.x = tg.x; st.y = tg.y; const c = (W.beat || [])[st.leg], pz = W.pause; if (pz && c && c[0] === pz[0] && c[1] === pz[1]) st.wait = (pz[2] || 2) * 1000; st.leg = (st.leg + 1) % W.pts.length; }
          else { st.x += dx / d * v; st.y += dy / d * v; st.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); } } }
        else if (W.turns.length) { st.t += DT; if (st.t > 2600) { st.t = 0; st.turn = (st.turn + 1) % W.turns.length; st.dir = W.turns[st.turn]; } } }
      return { n, out }; });
    const at = (cx, cy) => ({ x: cx * C + 8, y: cy * C + 12 }), seen = new Uint8Array(cols * rows * F);
    for (const { n, out } of tracks) { const R = (n.watch.cone || 4) * T + C; for (let f = 0; f < F; f++) { const o = out[f], stub = { watch: { cone: n.watch.cone, dir: o.dir }, spr: { x: o.x, y: o.y } };
      for (let cy = Math.max(0, Math.floor((o.y - R) / C)); cy <= Math.min(rows - 1, Math.floor((o.y + R) / C)); cy++) for (let cx = Math.max(0, Math.floor((o.x - R) / C)); cx <= Math.min(cols - 1, Math.floor((o.x + R) / C)); cx++)
        if (w.sees(stub, at(cx, cy))) seen[(f * rows + cy) * cols + cx] = 1; } }
    const safe = (cx, cy, f) => { for (let k = Math.max(0, f - 2); k <= Math.min(F - 1, f + STEP + 2); k++) if (seen[(k * rows + cy) * cols + cx]) return false; return true; };
    const P = w.player, sx = Math.floor(P.x / C), sy = Math.floor((P.y - 4) / C), gx = Math.floor(goal.x / C), gy = Math.floor((goal.y - 4) / C);
    let cur = new Map([[sx + sy * cols, null]]); const hist = [cur]; let found = -1;
    for (let k = 0; (k + 1) * STEP < F; k++) { const nx = new Map(); for (const c of cur.keys()) { const x = c % cols, y = (c - x) / cols; for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + b, id = X + Y * cols;
        if (X < 0 || Y < 0 || X >= cols || Y >= rows || nx.has(id)) continue; if (!free(X, Y) && !(X === gx && Y === gy)) continue; if (!safe(X, Y, (k + 1) * STEP)) continue; nx.set(id, c); } }
      hist.push(nx); cur = nx; if (nx.has(gx + gy * cols)) { found = k + 1; break; } if (!nx.size) break; }
    if (found < 0) return null;
    const cells = []; let c = gx + gy * cols; for (let k = found; k >= 0; k--) { cells.unshift(c); c = hist[k].get(c); }
    return cells.map(c => { const x = c % cols; return at(x, (c - x) / cols); });
  });

  const report = [], t0 = Date.now(); let beat = null, beatT = 0, lastProgress = Date.now(), progressKey = '', lastLine = '', refused = '', boards = [];
  const leadFor = await p.evaluate(B => { const w = TK.world(B), out = {}; let party = null;   // the lead the story gives each beat: its last party step before it
    for (const n of w.nodes) { out[n.key] = party && party[0]; const sc = w.scenes && w.scenes[n.scene]; for (const s of (sc && sc.steps) || []) if (s[0] === 'party') party = s[1]; } return out; }, BOOK).catch(() => ({}));
  let beatLead = '';
  const close = (status, why, s) => { if (!beat) return; if (leadFor[beat] && beatLead && leadFor[beat] !== beatLead) console.log(`     note ${beat}: played by ${beatLead}, but the story's last handoff gave ${leadFor[beat]}`); const r = { beat, status, secs: Math.round((Date.now() - beatT) / 1000), place: s && s.place, at: s && s.P, lead: s && s.lead, why: why || '', line: lastLine.slice(0, 120) };
    report.push(r); console.log(`${status === 'pass' ? 'ok  ' : 'FAIL'} ${beat}  ${r.secs}s  ${r.lead || ''} in ${r.place || '?'}${status === 'pass' ? '' : `  at ${r.at}: ${why}${r.line ? ` ("${r.line}")` : ''}`}`); };
  let plannedSteps = null, planT = 0, stealthTries = 0, lastTap = 0, skipped = false, reloads = 0; const held = [], recovered = [];
  for (;;) {
    if ((Date.now() - t0) / 60000 > MAXMIN) { const s = await look(); close('fail', `out of time (${MAXMIN} min)`, s); break; }
    const s = await look();
    if (s.boot) { if (s.cancel) await p.getByText('Cancel', { exact: true }).first().tap().catch(() => {}); if (s.scroll) await tapEl('.tk-scroll-go'); await p.waitForTimeout(250); continue; }
    if (s.book !== BOOK || !s.next) { if (beat) close('pass', '', s); break; }   // the book is done (or handed on to the next)
    if (s.next !== beat) {   // a new beat
      if (beat) close('pass', '', s);
      if (UNTIL && beat === UNTIL) break;
      beat = s.next; beatT = Date.now(); lastProgress = Date.now(); refused = ''; stealthTries = 0; plannedSteps = null; skipped = false; reloads = 0;
    }
    if (process.env.TRACE === beat && (!globalThis.__tr || Date.now() - globalThis.__tr > 2000)) { globalThis.__tr = Date.now();
      console.log('     trace', JSON.stringify({ ...s, items: undefined, extra: await p.evaluate(() => { const w = window.__w, d = document;
        return { dlg: [...d.querySelectorAll('.town-dlg')].map(e => (e.hidden ? 'hidden:' : 'shown:') + e.className + ':' + e.textContent.trim().slice(0, 50)), skip: d.querySelectorAll('.town-skip').length, uis: d.querySelectorAll('.town-ui').length,
          scenes: w.scene.manager.getScenes(true).map(x => x.scene.key), canMove: w.canMove(), approaching: !!w.approaching, seated: !!w.seated }; }) })); }
    // progress: a new place, a beat or item gained, or getting nearer the goal
    const key = `${s.place}|${s.cleared}|${s.items}|${s.goal}|${s.line}|${s.cine}|${s.duel}|${Math.round(Math.hypot(s.P[0] - (s.goal ? s.goal[0] : 0), s.P[1] - (s.goal ? s.goal[1] : 0)) / 24)}`;
    if (key !== progressKey) { progressKey = key; lastProgress = Date.now(); }
    if (Date.now() - lastProgress > STUCK * 1000) {
      const why = await p.evaluate(() => { const w = window.__w, P = w.player, g = w.goalAt, path = g && w.findPath(P.x, P.y - 3, g.x, g.y - 3);
        return `canMove ${w.canMove()}, seated ${!!w.seated}, approaching ${!!w.approaching}, walk ${w.walk ? w.walk.path.length : 'none'}, a way ${path ? path.length + ' points' : 'none'}, near: ${w.npcs.filter(n => n.spr.visible && Math.hypot(n.spr.x - P.x, n.spr.y - P.y) < 40).map(n => n.id).join(' ') || 'nobody'}`; }).catch(e => String(e));
      await p.screenshot({ path: path.join(__dirname, 'out', `walk-stuck-${beat}.png`) }).catch(() => {});
      const ui = await p.evaluate(() => ({ lead: window.__w.lead, party: window.__w.st.party, line: (document.querySelector('.town-ui .town-dlg')||{}).textContent, dlgHidden: (document.querySelector('.town-ui .town-dlg')||{}).hidden, busy: window.__w.ui.busy(), cine: !!window.__w.cine, leaving: !!window.__w.leaving, html: [...document.querySelectorAll('.town-ui button, .town-ui .town-dlg')].filter(e => e.offsetParent).map(e => e.className + ':' + e.textContent.trim().slice(0, 40)).slice(0, 6) })).catch(() => ({}));
      console.log('     ui:', JSON.stringify(ui));
      const msg = refused || `stuck: no progress for ${STUCK}s (goal ${s.goal || 'none'}; ${why})`;
      if (reloads < 1 && !refused) {   // what a player would do: reload, and go on from the save
        reloads++; recovered.push({ beat, at: s.P, place: s.place, why: msg, line: lastLine.slice(0, 120) });
        console.log(`FAIL ${beat}  at ${s.P} in ${s.place}: ${msg}${lastLine ? ` ("${lastLine.slice(0, 90)}")` : ''}; reloading, as a player would, and playing on`);
        await p.reload(); lastProgress = Date.now(); plannedSteps = null; skipped = false; await p.waitForTimeout(1500); continue; }
      close('fail', msg, s); break; }
    if (s.line && s.line !== lastLine) { lastLine = s.line;
      if (/isn't open yet|还没有开通|barred|不为你开|not open|turns you away|No one goes|receives no one/i.test(s.line)) refused = `refused: "${s.line.slice(0, 90)}"`; }
    if (s.cancel) { await p.getByText('Cancel', { exact: true }).first().tap().catch(() => {}); continue; }
    if (s.scroll) { await tapEl('.tk-scroll-go'); await p.waitForTimeout(300); continue; }
    if (!s.duel) await hook();   // (again after a reload)
    if (s.duel) {   // a board: win it with Skip, note what it drew, then Continue
      if (s.cont) { await tapEl('.tk-duel-go'); await p.waitForTimeout(400); continue; }
      if (s.skip) {
        const drawn = await p.evaluate(() => { const a = document.querySelector('.tk-duel-src a'), m = a && a.href.match(/\/q\/(\d+)/); return { id: m ? +m[1] : null, key: window.__boardKey }; });
        if (!boards.some(x => x.key === drawn.key && x.id === drawn.id)) boards.push({ beat, key: drawn.key, id: drawn.id });
        await p.locator('.tk-duel-keys button', { hasText: 'Skip' }).first().tap().catch(() => {}); await p.waitForTimeout(600); continue; }
      await p.waitForTimeout(300); continue;
    }
    if (!s.busy && !s.cine && !s.leaving) beatLead = s.lead;   // who is walking the beat
    // a scene's Skip button up with no line showing, and nothing moving on: what a player would press
    if (s.busy && !s.cine && !s.line && !skipped && Date.now() - lastProgress > 8000 && await p.locator('.town-skip').count() && !(await p.locator('.tk-still').count())) { skipped = true;   // (not a scene picture showing, which has no line either)
      console.log(`FAIL ${beat}: held by a scene with no line showing (the game busy, only a Skip button up); a player has to press Skip`); held.push(`${beat} in ${s.place}`);
      await p.locator('.town-skip').first().tap().catch(() => {}); await p.waitForTimeout(800); continue; }
    if (s.busy) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); continue; }   // a line: on to the next
    if (s.cine || s.leaving || s.engaged || s.caught) { await p.waitForTimeout(300); continue; }
    if (!s.goal) { close('fail', 'no goal to go to', s); break; }
    // a stealth beat here: time the way past the cones, then walk it a cell at a time
    if (s.watchers && !plannedSteps && stealthTries < 4) { plannedSteps = await plan(); planT = Date.now(); stealthTries++; if (!plannedSteps) { close('fail', 'no unseen way past the watchers', s); break; } }
    if (plannedSteps) {
      const k = Math.min(plannedSteps.length - 1, Math.floor((Date.now() - planT) / 150)), c = plannedSteps[k];
      await p.evaluate(c => { const w = window.__w; if (!w.walk || Math.hypot(w.walk.path[w.walk.path.length - 1].x - c.x, w.walk.path[w.walk.path.length - 1].y - (c.y - 3)) > 2) w.walkTo(c.x, c.y, { ring: false }); }, c);
      if (k >= plannedSteps.length - 1) { plannedSteps = null; await tapWorld(s.goal[0], s.goal[1]); }   // there: tap it (a spot that starts on a tap)
      await p.waitForTimeout(60); continue;
    }
    if (s.walking) { await p.waitForTimeout(250); continue; }
    if (Date.now() - lastTap < 1200) { await p.waitForTimeout(200); continue; }
    lastTap = Date.now(); await tapWorld(s.goal[0], s.goal[1]); await p.waitForTimeout(500);
  }
  // the boards' draws against the difficulty asked for
  const diffCheck = await p.evaluate(([bs, B]) => { const w = TK.world(B), easy = TK.easy; let ok = 0, off = [];
    for (const { beat, key, id } of bs) { const base = String(key || beat).split('~')[0], n = TK.node(w, base) || (typeof WorldData !== 'undefined' && WorldData.node(w, base)); if (!n || id == null) continue; const pool = (easy && n.pool_easy && n.pool_easy.length ? n.pool_easy : n.pool).map(x => +x[1]);
      if (pool.includes(id)) ok++; else off.push(`${key || beat}:${id}`); } return { easy, ok, off }; }, [boards, BOOK]).catch(e => ({ err: String(e) }));
  const fails = report.filter(r => r.status !== 'pass').length;
  const out = { book: BOOK, diff: DIFF || 'default', held, recovered, minutes: +((Date.now() - t0) / 60000).toFixed(1), beats: report, boards: boards.length, draws: diffCheck, pageErrors: errs.slice(0, 5) };
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', `walk-playthrough-${BOOK}-${DIFF || 'default'}.json`), JSON.stringify(out, null, 1));
  if (diffCheck.off && diffCheck.off.length) console.log(`FAIL boards drawn from the wrong pool (${diffCheck.easy ? 'easy' : 'hard'}): ${diffCheck.off.join(', ')}`);
  console.log(`walk-playthrough Book ${BOOK} (${DIFF || 'default'}): ${report.length - fails}/${report.length} beats walked and played in ${out.minutes} min (${recovered.length} needed a reload, ${held.length} held by a scene); ${boards.length} boards (${diffCheck.ok} from the ${diffCheck.easy ? 'easy' : 'hard'} pool)`);
  await b.close(); process.exit(fails || held.length || recovered.length || (diffCheck.off && diffCheck.off.length) ? 1 : 0);
})();
