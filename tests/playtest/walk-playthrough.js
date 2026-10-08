// A book played the way a player plays it (BOOK, default 12; DIFF easy|hard, default the game's own). From a
// fresh save, beat after beat: follow the game's own goal (its pointer: the next spot, a giver, a delivery
// place, or the way out toward them) by tapping it through the game's tap handler, so every exit, door and
// road is really walked through; tap through every line and scene; win each board with the test-mode Skip.
// Nothing is teleported, marked cleared or handed over: items, marks and party changes come from playing.
// A stealth beat is crossed by timing (the patrols simulated ahead), still walked a cell at a time.
// A chase (Book 13, c17) is ridden like any walk; a catch opens a one-try board, solved with Skip and logged. CHASE_LANE=n
// sends him into the east lane the first n times so a catch is met; CHASE_FAIL=1 fails the first catch and checks the restart.
// Fails a beat, with the place, position and last line, when the player is refused a way (a closed road, a
// barred door), gets stuck (no progress for STUCK seconds) or has nowhere to go. Writes a per-beat report
// to out/walk-playthrough-<book>-<diff>.json. Whenever he can walk, the goal box's chip must name the lead (it follows
// the party through the hand-offs). OPTIONAL=1 also walks, on each map as he comes to it, to every
// road challenger still there (he must open a board and lose his "!" once beaten), every conditional door in the
// state it's in (barred: its own line and he stays; open: through it) and every side room (in, and on again).
// Slow (about half an hour): run before a release and after any
// change to maps, region links, map states or placeOpen.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const BOOK = +(process.env.BOOK || 12), DIFF = process.env.DIFF || '', STUCK = +(process.env.STUCK || 60), MAXMIN = +(process.env.MAXMIN || 55), BEATMAX = +(process.env.BEATMAX || 300);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const VIEW = process.env.VIEW || 'phone', TAPM = VIEW === 'desktop' ? 'click' : 'tap', KIT = process.env.KIT || '', SHOTS = process.env.SHOTS || '';   // VIEW phone | landscape | 360 | desktop (apo110's 1390x745 window); SHOTS: a folder for each speaker's first line
  const p = await (await b.newContext(VIEW === 'desktop' ? { viewport: { width: 1390, height: 745 } } : VIEW === '360' ? { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } } : VIEW === 'landscape' ? { ...devices['iPhone 13 landscape'] } : { ...devices['iPhone 13'] })).newPage();
  // the save sync (Apps Script): SYNC=1 keeps what's saved and hands it back on a pull, as the real one does; else nothing to pull
  const SYNC = !!process.env.SYNC, store = {}; let syncPosts = 0;
  await p.route(/script\.google\.com/, r => { const req = r.request(), u = new URL(req.url());
    if (SYNC && req.method() === 'POST') { let j = {}; try { j = JSON.parse(req.postData() || '{}'); } catch {} if (j.kind === 'progress') { store[j.username] = j.data; syncPosts++; } return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); }
    if (SYNC && (u.searchParams.get('kind') || 'progress') === 'progress') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: store[u.searchParams.get('username')] || {} }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }); });
  const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('ERR', e.message); });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  await p.goto(BASE + '#/');
  await p.evaluate(([B, D, K]) => {
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
    localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', String(B)); if (D) localStorage.setItem('tk-diff', D);
    if (K) { localStorage.setItem('tk-kit', K); localStorage.setItem('tk-kit-main', 'jade'); } localStorage.setItem('gt-username', 'playtest-walk');
  }, [BOOK, DIFF, KIT]);
  const FROM = process.env.FROM || '', UNTIL = process.env.UNTIL || '';
  if (FROM) await p.evaluate(([B, F]) => {   // setup only: what the beats before FROM leave behind is taken as given (FROM= is for a quick check; a release runs the whole book)
    return TK.load().then(() => { const w = TK.world(B), ks = w.nodes.map(n => n.key), i = ks.indexOf(F); let party = null;
      for (const [j, n] of w.nodes.entries()) if (j < i) { if (!['side', 'short'].includes(n.role)) TK.markCleared(n.key); const sc = w.scenes && w.scenes[n.scene]; for (const st of (sc && sc.steps) || []) { if (st[0] === 'party') party = st[1]; if ((st[0] === 'item' || st[0] === 'gain') && typeof WorldItems !== 'undefined') WorldItems.add(w, st[1]); } }
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
  // SYNC: a reroute rebuilds the world (a new game); the game running before each hide/show flip is tagged, and a flip
  // after which the tag is gone was a reroute (app.js calls route() by its own reference, so a wrapper can't see it)
  let lastVis = Date.now(), visFlips = 0, flipAt = 0, prevS = null, pushWait = false; const reroutes = [];

  // the page, as the loop needs it each tick
  const look = () => p.evaluate(() => {
    const w = window.__w, d = document;
    const dlg = [...d.querySelectorAll('.town-ui .town-dlg')].find(x => !x.hidden && x.offsetParent) || d.querySelector('.town-ui .town-dlg'),   /* the box showing (a narrator's line can be a second one) */ line = dlg && !dlg.hidden ? (dlg.querySelector('.town-en') || dlg).textContent.trim() : '';
    const vis = s => { const e = d.querySelector(s); return !!(e && e.offsetParent !== null); };
    if (!w || !w.player || !w.w) return { boot: true, scroll: vis('.tk-scroll-go'), cancel: [...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Cancel' && b.offsetParent) };
    const q = w.nextMain();
    return {
      book: w.w.n, place: w.placeId, lead: w.lead, party: (w.st.party || []).join(','), next: q && q.node, P: [Math.round(w.player.x), Math.round(w.player.y)],
      goal: w.goalAt && [Math.round(w.goalAt.x), Math.round(w.goalAt.y)], busy: w.ui.busy(), cine: !!w.cine, leaving: !!w.leaving, walking: !!w.walk,
      caught: !!w.caught, engaged: !!w.engaged, gtag: w.game && w.game.__flip, light: w.st && w.st.light || '',
      route: w.routeFx && w.routeFx.all && w.routeFx.all[0] ? (w.routeFx.all.some(im => im.tintTopLeft === 0xd6ff8a) ? 'fireflies' : 'band') : '',
      mounts: (w.cine ? [...new Set(w.children.list.filter(o => o.visible && o.alpha > .1 && o.texture && /^ride-/.test(o.texture.key)).map(o => o.texture.key.split('-')[1]))].map(x => x + ':?')   // in a scene: who is drawn in the saddle
        : (w.mounts || []).filter(m => m.horse && m.horse.visible).map(m => `${m.who}:${m.coat}`)).sort().join(',') || 'on foot', indoors: typeof WorldItems !== 'undefined' && WorldItems.indoors(w),
      horses: (w.followers || []).filter(F => F.coat && F.spr && F.spr.visible).map(F => `${F.coat}@${Math.round(Math.hypot(F.spr.x - w.player.x, F.spr.y - w.player.y))}`).join(','),
      crouch: !!w.cine && w.children.list.some(o => o.visible && o.texture && /^h-/.test(o.texture.key) && o.scaleY > .69 && o.scaleY < .78), banner: ((d.querySelector('.town-ui .town-place') || {}).textContent || '').trim(), chip: ((d.querySelector('.town-goal .town-lead') || {}).textContent || '').trim(), leadName: typeof tkName === 'function' ? tkName(w.lead) : w.lead, line, who: dlg && !dlg.hidden ? ((dlg.querySelector('.town-who') || {}).textContent || '').trim() : '', scroll: vis('.tk-scroll-go'), duel: !!d.querySelector('.tk-duel svg'), cont: vis('.tk-duel-go'),
      skip: !!d.querySelector('.tk-duel-keys button') && [...d.querySelectorAll('.tk-duel-keys button')].some(b => /Skip/.test(b.textContent)),
      cleared: TK.world(w.w.n).nodes.filter(n => TK.cleared(n.key)).length, items: JSON.stringify((typeof WorldItems !== 'undefined' && WorldItems.list && WorldItems.list(w.w)) || []),
      cancel: [...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Cancel' && b.offsetParent),
      watchers: w.npcs.filter(n => n.watch && ((n.watch.seen || []).length || n.watch.back_to) && w.watching(n)).length,
    };
  });
  const tapEl = async sel => { const e = p.locator(sel).first(); if (await e.count()) await e[TAPM]({ timeout: 2000 }).catch(() => {}); };
  // a tap on a point of the world: on screen, a real tap there; off screen, the game's own tap handler
  const tapWorld = async (x, y) => {
    const s = await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width, v = w.view ? w.view(x, y) : { x, y };
      const sx = r.left + (v.x - cam.worldView.x) * cam.zoom * k, sy = r.top + (v.y - cam.worldView.y) * cam.zoom * k;
      const goalLine = d => { const g = d.querySelector('.town-goal'); return g && g.getBoundingClientRect(); };
      const g = goalLine(document), hud = g ? g.bottom + 6 : r.top + 60;
      return { sx, sy, on: sx > r.left + 8 && sx < r.right - 8 && sy > hud && sy < r.bottom - 8 }; }, [x, y]);
    if (s.on) await (VIEW === 'desktop' ? p.mouse.click(s.sx, s.sy) : p.touchscreen.tap(s.sx, s.sy));   // a click on a desktop
    else await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, v = w.view ? w.view(x, y) : { x, y }; w.tapAt(x, y, (v.x - cam.worldView.x) * cam.zoom, (v.y - cam.worldView.y) * cam.zoom); }, [x, y]);
  };
  // the patrols ahead, and a way to the goal none of them sees: cells, one per 150 ms (stealth-12's planner)
  const plan = (STEP) => p.evaluate(STEP => {   // STEP frames of 50 ms a cell: 3 is his running pace, 4 the pace a walk a cell at a time surely keeps
    const w = window.__w, T = w.tw || 16, C = 16, DT = 50, F = 1600, goal = w.goalAt; if (!goal) return null;
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
  }, STEP);

  // what's optional on this map, as a player sees it: challengers standing with their "!", doors only some may pass
  // or the story shuts (and in which state), rooms off this place
  const optional = () => p.evaluate(() => {
    const w = window.__w, out = [], ms = w.mapState(), top = id => { const x = w.region.places.find(q => q.id === id); return x && x.parent || id; };
    for (const n of w.npcs) if (n.challenge && n.spr.visible && !TK.cleared(n.challenge)) out.push({ id: `challenger ${n.challenge}`, kind: 'challenger', key: n.challenge, from: w.placeId, x: n.spr.x, y: n.spr.y });
    for (const e of w.exits) {
      if (!e.to) continue;
      const shut = ms && (ms.exits_closed || []).includes(e.to), opened = ms && (ms.exits_open || []).includes(e.to);
      const barred = shut || e.openTo && !e.openTo.some(c => c.includes(':') ? w.cond(c) : c === w.lead), open = !barred && (opened || w.placeOpen(e.to));
      const room = w.region.places.find(q => q.id === e.to && q.parent && q.parent === top(w.placeId));
      if (!(e.openTo || shut || opened || room)) continue;
      const say = barred ? (shut && ms.exits_closed_say && ms.exits_closed_say[e.to]) || (e.refuse.length ? e.refuse : null) : null;
      out.push({ id: `door ${w.placeId} > ${e.to} (${barred ? 'barred to ' + w.lead : open ? 'open' : 'not open yet'})`, kind: barred ? 'barred' : open ? 'open' : 'notyet', to: e.to,
        from: w.placeId, building: e.side === 'N' && e.rect.width < 16, x: e.rect.centerX, y: e.side === 'N' && e.rect.width < 16 ? e.rect.y - 10 : e.rect.centerY,   /* a building's door: a tap on the building just above it, as a player taps it */ say: say ? JSON.stringify(say) : barred ? 'The door is barred to you.' : `isn't open yet` });
    }
    return out;
  });
  const report = [], t0 = Date.now(); let beat = null, beatT = 0, lastProgress = Date.now(), progressKey = '', lastLine = '', refused = '', boards = [], chaseLog = []; let laneLeft = +(process.env.CHASE_LANE || 0);
  const leadFor = await p.evaluate(B => { const w = TK.world(B), out = {}; let party = null;   // the lead the story gives each beat: its last party step before it
    for (const n of w.nodes) { out[n.key] = party && party[0]; const sc = w.scenes && w.scenes[n.scene]; for (const s of (sc && sc.steps) || []) if (s[0] === 'party') party = s[1]; } return out; }, BOOK).catch(() => ({}));
  let beatLead = '';
  const close = (status, why, s) => { if (!beat) return; if (leadFor[beat] && beatLead && leadFor[beat] !== beatLead) console.log(`     note ${beat}: played by ${beatLead}, but the story's last handoff gave ${leadFor[beat]}`); const r = { beat, status, secs: Math.max(0, Math.round((Date.now() - beatT) / 1000)), place: s && s.place, at: s && s.P, lead: s && s.lead, why: why || '', line: lastLine.slice(0, 120) };
    report.push(r); console.log(`${status === 'pass' ? 'ok  ' : 'FAIL'} ${beat}  ${r.secs}s  ${r.lead || ''} in ${r.place || '?'}${status === 'pass' ? '' : `  at ${r.at}: ${why}${r.line ? ` ("${r.line}")` : ''}`}`); };
  let plannedSteps = null, planT = 0, pace = 3, stealthTries = 0, lastTap = 0, skipped = false, reloads = 0, catches = 0, wasCaught = false; const held = [], recovered = [];
  const featureFails = [], facts = {}, banners = [], chipBad = new Set(), chipSeen = [], shotWho = new Set(), shots = []; let lastPlace = '', arrivedAt = null; const OPTIONAL = !!process.env.OPTIONAL, visited = new Set(), errands = []; let errand = null;
  for (;;) {
    if ((Date.now() - t0) / 60000 > MAXMIN) { const s = await look(); close('fail', `out of time (${MAXMIN} min)`, s); break; }
    const s = await look();
    if (s.boot) { if (s.cancel) await p.getByText('Cancel', { exact: true }).first()[TAPM]().catch(() => {}); if (s.scroll) await tapEl('.tk-scroll-go'); await p.waitForTimeout(250); continue; }
    if (s.book !== BOOK || !s.next) { if (beat) close('pass', '', s); break; }   // the book is done (or handed on to the next)
    if (s.next !== beat) {   // a new beat
      if (beat) close('pass', '', s);
      if (UNTIL && beat === UNTIL) break;
      beat = s.next; beatT = Date.now(); lastProgress = Date.now(); refused = ''; stealthTries = 0; plannedSteps = null; skipped = false; reloads = 0; catches = 0;
    }
    if (process.env.TRACE === beat && (!globalThis.__tr || Date.now() - globalThis.__tr > 2000)) { globalThis.__tr = Date.now();
      console.log('     trace', JSON.stringify({ ...s, items: undefined, extra: await p.evaluate(() => { const w = window.__w, d = document;
        return { dlg: [...d.querySelectorAll('.town-dlg')].map(e => (e.hidden ? 'hidden:' : 'shown:') + e.className + ':' + e.textContent.trim().slice(0, 50)), skip: d.querySelectorAll('.town-skip').length, uis: d.querySelectorAll('.town-ui').length,
          scenes: w.scene.manager.getScenes(true).map(x => x.scene.key), canMove: w.canMove(), chase: !!w.chaseNow(), riders: w.npcs.filter(n => n.rider).map(n => `${n.id}@${Math.round(n.spr.x)},${Math.round(n.spr.y)}${n.spr.visible ? "" : " hidden"}${n.rider.hunting ? " hunting" : ""}`), approaching: !!w.approaching, seated: !!w.seated,
          marks: WorldMarks.all(w.w), spots: Object.entries(w.spots).map(([k, v]) => `${k}@${Math.round(v.x)},${Math.round(v.y)}${v.trigger && v.trigger !== 'near' ? '/' + v.trigger : ''}`) }; }) })); }
    // progress: a new place, a beat or item gained, or getting nearer the goal
    const key = `${s.place}|${s.cleared}|${s.items}|${s.goal}|${s.line}|${s.cine}|${s.duel}|${Math.round(Math.hypot(s.P[0] - (s.goal ? s.goal[0] : 0), s.P[1] - (s.goal ? s.goal[1] : 0)) / 24)}`;
    if (key !== progressKey) { progressKey = key; lastProgress = Date.now(); }
    if (s.place !== lastPlace && !s.leaving && !s.cine) { lastPlace = s.place; arrivedAt = s.P; }
    if (errand) {   // an optional thing on the way: done, or given up on
      const e = errand, secs = (Date.now() - e.t0) / 1000; let done = null;
      if (e.kind === 'challenger') {
        if (s.duel && await p.evaluate(() => window.__boardKey) === e.key) e.board = true;   // his board (not the beat's)
        const there = !e.board && await p.evaluate(k => { const n = window.__w.npcs.find(n => n.challenge === k); return !!(n && n.spr.visible); }, e.key);
        if (!s.duel && !s.busy && !s.cine && !s.leaving && (s.place !== e.from || (!e.board && !there))) done = 'gone: the story moved on before he got to him';
        if (!s.duel && !s.busy && await p.evaluate(k => TK.cleared(k), e.key)) { const mark = await p.evaluate(k => { const n = window.__w.npcs.find(n => n.challenge === k); return !!(n && n.mark && n.mark.visible); }, e.key);
          done = e.board && !mark ? 'pass' : `fail: ${e.board ? '' : 'no board opened; '}${mark ? 'his "!" still up after the win' : ''}`; }
      } else if (e.kind === 'barred' || e.kind === 'notyet') {
        if (s.place !== e.from) done = s.place === e.to ? `fail: went through to ${s.place}` : `gone: the story took him to ${s.place} first`;
        else if (s.line) {   // its own line, as it types out (a story scene's lines on the way are let go by)
          const own = e.say.includes(s.line.slice(0, 24)) || (e.kind === 'notyet' && /isn't open yet/.test(s.line));
          if (own && (s.line.length >= 12 || e.say.includes(JSON.stringify(s.line)))) { e.said = s.line; done = 'pass'; }   /* (a short line counts once it's whole: "East. Home.") */ else if (!own) e.other = s.line; }
      } else if (s.place === e.to) done = 'pass';
      else if (s.place !== e.from && !s.busy && !s.cine && !s.leaving) done = `gone: the story took him to ${s.place} first`;
      if (!done && secs > 90) await p.screenshot({ path: path.join(__dirname, 'out', `walk-errand-${e.id.replace(/[^\w]+/g, '_').slice(0, 60)}.png`) }).catch(() => {});
      if (!done && secs > 90) console.log('     on screen:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.town-ui *')].filter(x => x.offsetParent && x.children.length === 0 && (x.textContent || '').trim()).map(x => `${x.className}: ${x.textContent.trim().slice(0, 40)}`).slice(0, 12)).catch(() => [])));
      if (!done && secs > 90) done = `fail: not reached in 90s (at ${s.P} in ${s.place}${e.other ? `; last line "${e.other.slice(0, 60)}"` : ''})`;
      if (done) { errand = null; beatT += secs * 1000; lastProgress = Date.now();
        const st = done === 'pass' ? 'pass' : done.startsWith('gone') ? 'gone' : 'fail';
        errands.push({ beat, id: e.id, status: st, why: st === 'pass' ? '' : done.replace(/^\w+: /, ''), secs: Math.round(secs), line: (e.said || '').slice(0, 100) });
        console.log(`${st === 'pass' ? 'ok  ' : st === 'gone' ? 'note' : 'FAIL'}   optional: ${e.id}  ${Math.round(secs)}s${st === 'pass' ? '' : '  ' + done.replace(/^\w+: /, '')}${e.said ? `  ("${e.said.slice(0, 70)}")` : ''}`); }
      else lastProgress = Date.now();
    }
    if (s.caught && !wasCaught) catches++; wasCaught = s.caught;
    const overBeat = Date.now() - beatT > BEATMAX * 1000 * (reloads + 1);   // going round in circles: caught again and again, or walking back and forth
    if (Date.now() - lastProgress > STUCK * 1000 || overBeat) {
      if (overBeat) refused = refused || `over ${BEATMAX}s on this beat (caught ${catches} times)`;
      if (overBeat && reloads < 1) refused = '';
      const why = await p.evaluate(() => { const w = window.__w, P = w.player, g = w.goalAt, path = g && w.findPath(P.x, P.y - 3, g.x, g.y - 3);
        return `canMove ${w.canMove()}, seated ${!!w.seated}, approaching ${!!w.approaching}, walk ${w.walk ? w.walk.path.length : 'none'}, a way ${path ? path.length + ' points' : 'none'}, near: ${w.npcs.filter(n => n.spr.visible && Math.hypot(n.spr.x - P.x, n.spr.y - P.y) < 40).map(n => n.id).join(' ') || 'nobody'}`; }).catch(e => String(e));
      await p.screenshot({ path: path.join(__dirname, 'out', `walk-stuck-${beat}.png`) }).catch(() => {});
      const ui = await p.evaluate(() => ({ lead: window.__w.lead, party: window.__w.st.party, line: (document.querySelector('.town-ui .town-dlg')||{}).textContent, dlgHidden: (document.querySelector('.town-ui .town-dlg')||{}).hidden, busy: window.__w.ui.busy(), cine: !!window.__w.cine, leaving: !!window.__w.leaving, html: [...document.querySelectorAll('.town-ui button, .town-ui .town-dlg')].filter(e => e.offsetParent).map(e => e.className + ':' + e.textContent.trim().slice(0, 40)).slice(0, 6) })).catch(() => ({}));
      console.log('     ui:', JSON.stringify(ui));
      const msg = refused || (overBeat ? `over ${BEATMAX}s on this beat (caught ${catches} times; goal ${s.goal || 'none'})` : '') || `stuck: no progress for ${STUCK}s (goal ${s.goal || 'none'}; ${why})`;
      if (reloads < 1 && !refused) {   // what a player would do: reload, and go on from the save
        reloads++; recovered.push({ beat, at: s.P, place: s.place, why: msg, line: lastLine.slice(0, 120) });
        console.log(`FAIL ${beat}  at ${s.P} in ${s.place}: ${msg}${lastLine ? ` ("${lastLine.slice(0, 90)}")` : ''}; reloading, as a player would, and playing on`);
        await p.reload(); lastProgress = Date.now(); plannedSteps = null; skipped = false; await p.waitForTimeout(1500); continue; }
      close('fail', msg, s); break; }
    if (s.line && s.line !== lastLine) { lastLine = s.line;
      if (!errand && /isn't open yet|还没有开通|barred|不为你开|not open|turns you away|No one goes|receives no one/i.test(s.line)) refused = `refused: "${s.line.slice(0, 90)}"`; }
    if (s.cancel) { await p.getByText('Cancel', { exact: true }).first()[TAPM]().catch(() => {}); continue; }
    if (s.scroll) { await tapEl('.tk-scroll-go'); await p.waitForTimeout(300); continue; }
    if (!s.duel) await hook();   // (again after a reload)
    if (SYNC && Date.now() - lastVis > 45000) {   // the tab hidden and shown again (a phone app switch): the game pulls, and reroutes only if something changed
      lastVis = Date.now(); visFlips++;
      if (process.env.SYNC_PUSH && visFlips === 3) for (const u of Object.keys(store)) { const d = store[u]; d.progress = d.progress || {}; d.progress.tk = d.progress.tk || {}; d.progress.tk['12-from-elsewhere'] = 1; }   // another device's solve: this one should pull it and rebuild
      const before = await p.evaluate(n => { const w = window.__w; if (w && w.game) w.game.__flip = n; return { busy: !!(w && w.ui && w.ui.busy()), cine: !!(w && w.cine), duel: !!document.querySelector('.tk-duel svg'), place: w && w.placeId }; }, visFlips).catch(() => ({}));
      await p.evaluate(async () => { for (const v of ['hidden', 'visible']) { Object.defineProperty(document, 'visibilityState', { value: v, configurable: true }); Object.defineProperty(document, 'hidden', { value: v === 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 300)); } }).catch(() => {});
      flipAt = Date.now(); if (process.env.SYNC_PUSH && visFlips === 3) pushWait = true; continue; }   // (this tick's look came before the tag: judge from the next one)
    // a rebuilt world (route() makes a new game): the tag's gone; what was up the moment before, and how long after the flip
    if (SYNC && visFlips && s.gtag !== visFlips && !s.boot) {
      const b4 = prevS || {}; reroutes.push({ beat, place: b4.place, busy: !!b4.busy, cine: !!b4.cine, duel: !!b4.duel, secs: Math.round((Date.now() - flipAt) / 1000) });
      console.log(`     sync: the world was rebuilt at ${beat}, ${Math.round((Date.now() - flipAt) / 1000)} s after a hide/show (${b4.place}${b4.cine ? ', mid-scene' : ''}${b4.busy ? ', a line up' : ''}${b4.duel ? ', a board up' : ''})`);
      await p.evaluate(n => { const w = window.__w; if (w && w.game) w.game.__flip = n; }, visFlips).catch(() => {}); }
    prevS = s;
    if (beat) { const f = facts[beat] || (facts[beat] = { light: new Set(), route: new Set(), horses: new Set(), crouch: false, place: new Set(), mount: new Set() });   // what each beat showed
      if (s.light) f.light.add(s.light); if (s.route) f.route.add(`${s.route}@${s.place}`); if (s.horses) f.horses.add(s.horses.split('@')[0]); if (s.crouch) f.crouch = true; f.place.add(s.place); if (!s.leaving && s.place && (s.cine || !s.busy)) f.mount.add(`${s.place}${s.indoors ? ' (indoors)' : ''}${s.cine ? ' in a scene' : ''}: ${s.mounts}`); }
    if (/Now playing/.test(s.banner || '') && banners[banners.length - 1] !== s.banner) banners.push(s.banner);
    if (pushWait && !s.busy && !s.cine && !s.duel && !s.leaving && !s.walking) { pushWait = false; await p.waitForTimeout(4000); continue; }   // SYNC_PUSH: a still moment after the scene, as a player reading would
    if (s.duel) {   // a board: win it with Skip, note what it drew, then Continue
      if (s.cont) { await tapEl('.tk-duel-go'); await p.waitForTimeout(400); continue; }
      if (s.skip) {
        const drawn = await p.evaluate(() => { const a = document.querySelector('.tk-duel-src a'), m = a && a.href.match(/\/q\/(\d+)/); return { id: m ? +m[1] : null, key: window.__boardKey }; });
        if (!boards.some(x => x.key === drawn.key && x.id === drawn.id)) boards.push({ beat, key: drawn.key, id: drawn.id });
        // a chase's catch (its own one-try board, key~n): logged; CHASE_FAIL=1 fails the first, and the chase must restart
        const ch = /~\d+$/.test(drawn.key || '') && await p.evaluate(() => { const w = window.__w, C = w.chase; return C && w.chaseNow() ? { by: w.engaged && w.engaged.id, tries: C.tries, from: C.spec.from } : null; });
        if (ch && !chaseLog.some(x => x.key === drawn.key)) {
          const fail = process.env.CHASE_FAIL && !chaseLog.some(x => x.failed);
          chaseLog.push({ beat, key: drawn.key, by: ch.by, failed: !!fail }); console.log(`     ${beat}: caught by ${ch.by} (${drawn.key}); ${fail ? 'failing it' : 'solving it'}`);
          if (fail) {
            await p.evaluate(() => { if (window.__trainer) window.__trainer.flawed = null; dispatchEvent(new CustomEvent('tczw:result', { detail: 'fail' })); }); await p.waitForTimeout(600);
            await tapEl('.tk-duel-go'); let r = null;
            for (let i = 0; i < 120 && !r; i++) { await p.waitForTimeout(50); r = await p.evaluate(t => { const w = window.__w, C = w.chase, sp = C && w.spots[C.spec.from]; if (!C || C.tries <= t || !sp || Math.hypot(w.player.x - sp.x, w.player.y - sp.y - 18) > 4) return null;
              return { home: w.npcs.filter(n => n.rider).every(n => Math.hypot(n.spr.x - n.home.x, n.spr.y - n.home.y) < 3 && !n.rider.hunting), at: [Math.round(w.player.x), Math.round(w.player.y)] }; }, ch.tries); }
            const ok = !!r && r.home; chaseLog[chaseLog.length - 1].restart = ok;
            console.log(`${ok ? 'ok  ' : 'FAIL'} ${beat}: failing the catch restarts the chase at ${ch.from}${r ? ` (${r.at}), every rider home: ${r.home}` : ': no restart seen in 6 s'}`);
            continue; } }
        await p.locator('.tk-duel-keys button', { hasText: 'Skip' }).first()[TAPM]().catch(() => {}); await p.waitForTimeout(600); continue; }
      await p.waitForTimeout(300); continue;
    }
    if (!s.busy && !s.cine && !s.leaving) { beatLead = s.lead;   // who is walking the beat
      // the goal box's chip (apo110: who am I playing): the lead's name, as the party hands on
      if (!s.chip || !s.leadName || !s.chip.includes(s.leadName)) { if (!chipBad.has(beat)) { chipBad.add(beat); console.log(`FAIL ${beat}: the goal box's chip says "${s.chip}", but ${s.lead} (${s.leadName}) is walking`); } }
      else if (chipSeen[chipSeen.length - 1] !== s.chip) chipSeen.push(s.chip); }
    // a scene's Skip button up with no line showing, and nothing moving on: what a player would press
    if (s.busy && !s.cine && !s.line && !skipped && Date.now() - lastProgress > 8000 && await p.locator('.town-skip').count() && !(await p.locator('.tk-still').count())) { skipped = true;   // (not a scene picture showing, which has no line either)
      console.log(`FAIL ${beat}: held by a scene with no line showing (the game busy, only a Skip button up); a player has to press Skip`); held.push(`${beat} in ${s.place}`);
      await p.locator('.town-skip').first()[TAPM]().catch(() => {}); await p.waitForTimeout(800); continue; }
    if (SHOTS && s.line && s.who && !shotWho.has(s.who)) {   // a speaker's first line: once typed out, the box as it stands
      shotWho.add(s.who); await p.waitForTimeout(1400);
      const m = await p.evaluate(() => { const r = q => { const e = document.querySelector(q); if (!e || e.hidden || !e.offsetParent && getComputedStyle(e).position !== 'fixed') return null; const b = e.getBoundingClientRect(); return b.width ? [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] : null; };
        const box = r('.town-ui .town-dlg'), pic = r('.town-ui .town-portrait'), face = r('.town-ui .town-face'), text = r('.town-ui .town-en'), zh = r('.town-ui .town-zh');
        const over = (a, c) => a && c && a[0] < c[0] + c[2] && c[0] < a[0] + a[2] && a[1] < c[1] + c[3] && c[1] < a[1] + a[3];
        const inView = a => !a || (a[0] >= -1 && a[1] >= -1 && a[0] + a[2] <= innerWidth + 1 && a[1] + a[3] <= innerHeight + 1);
        return { box, pic, face, text, picOverText: over(pic, text) || over(pic, zh), boxInView: inView(box), picInView: inView(pic), w: innerWidth, h: innerHeight }; });
      const f = `${String(shotWho.size).padStart(2, '0')}-${s.who.replace(/[^\w\u4e00-\u9fff]+/g, '_').slice(0, 30)}.png`;
      fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: path.join(SHOTS, f) });
      shots.push({ beat, who: s.who, file: f, ...m });
      console.log(`     shot ${f}: ${m.pic ? 'portrait' : m.face ? 'pixel bust' : 'no face'}${m.picOverText ? ', PORTRAIT OVER THE TEXT' : ''}${m.boxInView ? '' : ', BOX OFF SCREEN'}${m.picInView ? '' : ', PORTRAIT OFF SCREEN'}`);
    }
    if (s.busy) { await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); continue; }   // a line: on to the next
    if (s.caught) plannedSteps = null;   // sent back: plan again from there
    if (s.cine || s.leaving || s.engaged || s.caught) { await p.waitForTimeout(300); continue; }
    if (OPTIONAL && !errand && !s.watchers && !s.walking && !plannedSteps) {
      const next = (await optional()).find(t => !visited.has(t.id));
      if (next) { visited.add(next.id); errand = { ...next, t0: Date.now() }; lastTap = 0; }
    }
    if (errand) {
      if (s.walking || Date.now() - lastTap < 1500) { await p.waitForTimeout(200); continue; }
      lastTap = Date.now(); errand.taps = (errand.taps || 0) + 1;   // a building's door: higher up its face on a retap (someone may stand before the door)
      await tapWorld(errand.x, errand.y - (errand.building ? [0, 14, 28][(errand.taps - 1) % 3] : 0)); await p.waitForTimeout(500); continue;
    }
    if (!s.goal) { close('fail', 'no goal to go to', s); break; }
    // CHASE_LANE=n: the first n times a chase is on, wait in the east lane on its rider's beat (Book 13's Luoyang chase:
    // a sure catch) before making for the goal, so a catch is met (CHASE_FAIL fails the first; the rest are solved)
    if (laneLeft > 0 && !s.busy && !s.cine && !s.walking && await p.evaluate(() => { const w = window.__w; return !!w.chaseNow() && !w.engaged && w.npcs.some(n => n.id === 'rider-lane' && n.spr.visible); })) {
      laneLeft--; console.log(`     ${beat}: into the east lane to meet the riders (CHASE_LANE)`);
      for (const q of [{ x: 1240, y: 700 }]) { await p.evaluate(q => window.__w.walkTo(q.x, q.y, { ring: false }), q);   // mid-lane, on its beat: he waits there for it to come down at him
        for (let i = 0; i < 160; i++) { await p.waitForTimeout(150); const t = await p.evaluate(q => { const w = window.__w; return { stop: !!w.engaged || w.ui.busy() || !!document.querySelector('.tk-duel svg'), at: !w.walk && Math.hypot(w.player.x - q.x, w.player.y - q.y) < 10 }; }, q); if (t.stop) break; }
        if (await p.evaluate(() => !!window.__w.engaged || window.__w.ui.busy())) break; }
      continue; }
    // a stealth beat here: time the way past the cones, then walk it a cell at a time
    if (s.watchers && !plannedSteps) {   // the running pace first; after a catch the slower one, if it has a way
      pace = catches ? 4 : 3; plannedSteps = await plan(pace); if (!plannedSteps && pace === 4) { pace = 3; plannedSteps = await plan(3); }
      planT = Date.now(); stealthTries++;
      if (!plannedSteps && stealthTries <= 3 && arrivedAt && Math.hypot(s.P[0] - arrivedAt[0], s.P[1] - arrivedAt[1]) > 12) {   // no way from here (an errand left him there): back to where he came in, and plan again
        await p.evaluate(a => window.__w.walkTo(a[0], a[1], { ring: false }), arrivedAt);
        for (let i = 0; i < 60 && await p.evaluate(() => !!window.__w.walk && !window.__w.caught); i++) await p.waitForTimeout(250);
        continue; }
      if (!plannedSteps) { close('fail', 'no unseen way past the watchers', s); break; } }
    if (plannedSteps) {
      const k = Math.min(plannedSteps.length - 1, Math.floor((Date.now() - planT) / (pace * 50))), c = plannedSteps[k];
      await p.evaluate(c => { const w = window.__w; if (!w.walk || Math.hypot(w.walk.path[w.walk.path.length - 1].x - c.x, w.walk.path[w.walk.path.length - 1].y - (c.y - 3)) > 2) w.walkTo(c.x, c.y, { ring: false }); }, c);
      if (k >= plannedSteps.length - 1) { plannedSteps = null; await tapWorld(s.goal[0], s.goal[1]); }   // there: tap it (a spot that starts on a tap)
      await p.waitForTimeout(60); continue;
    }
    if (s.walking) { await p.waitForTimeout(250); continue; }
    if (Date.now() - lastTap < 1200) { await p.waitForTimeout(200); continue; }
    lastTap = Date.now(); await tapWorld(s.goal[0], s.goal[1]); await p.waitForTimeout(500);
  }
  // Book 13's new engine bits, seen on the walk: fireflies for the route at night at Beimang (c4), Red Hare walking as a red horse behind Li Su (c9), the crouch at c20
  if (BOOK === 13) { const F = k => facts[k] || { light: new Set(), route: new Set(), horses: new Set(), crouch: false, place: new Set() };
    const c4 = F('13-c4'), c9 = F('13-c9'), c20 = F('13-c20');
    const ff = [...c4.route].some(r => r.startsWith('fireflies@beimang')), band = [...c4.route].some(r => r.startsWith('band@beimang'));
    if (facts['13-c4']) console.log(`${band ? 'FAIL' : ff ? 'ok  ' : 'note'} c4: the way at night at Beimang is shown by fireflies, never the day's band (light ${[...c4.light].join('/') || '?'}; route ${[...c4.route].join(', ') || 'not drawn while watched: the goal in sight at once'})`);
    if (facts['13-c9']) console.log(`${c9.horses.has('red') ? 'ok  ' : 'FAIL'} c9: Red Hare walks behind Li Su as a red horse (followers on horses: ${[...c9.horses].join(', ') || 'none'})`);
    if (facts['13-c20']) console.log(`${c20.crouch ? 'ok  ' : 'FAIL'} c20: someone crouches in the scene (a figure drawn low, 0.72-0.76 of its height)`);
    // the Chancellor's horse (end of c16): Cao Cao rides it outdoors (black), Chen Gong beside him from c19 (brown); indoors both walk
    let mountBad = false;
    for (const k of Object.keys(facts).filter(k => /^13-c(1[7-9]|2\d)$/.test(k))) for (const m of facts[k].mount) {
      const [place, who] = m.split(': '), inside = / \(indoors\)/.test(place), inScene = / in a scene$/.test(place), party = +k.slice(4) >= 20 || (k === '13-c19' && /chengong/.test(who)) ? ['caocao:black', 'chengong:brown'] : ['caocao:black'];
      if (inScene && !inside) continue;   // outdoors in a scene: who rides is the scene's to say
      const ok = inside ? who === 'on foot' : who.split(',').includes('caocao:black') && (!/chengong/.test(who) || who.includes('chengong:brown'));
      if (!ok) mountBad = true; console.log(`${ok ? 'ok  ' : 'FAIL'} ${k} ${place}: ${who}${inside ? ' (indoors: on foot)' : ''}`); void party; }
    if (mountBad) featureFails.push('book 13 mounts');
    if (band || (facts['13-c9'] && !c9.horses.has('red')) || (facts['13-c20'] && !c20.crouch)) featureFails.push('book 13 features'); }   // (each judged only when its beat was walked)
  // after the book: once things settle, who the walk plays as (END_LEAD: who it must be, e.g. lijue after Book 12's a18)
  let after = null;
  for (let i = 0; i < 60; i++) { const s = await look().catch(() => null); if (s && !s.boot && !s.busy && !s.cine && !s.leaving && !s.duel) { after = s; break; }
    if (s && s.busy) await p.evaluate(() => window.__w.ui.advance()).catch(() => {}); await p.waitForTimeout(500); }
  if (after) { const want = process.env.END_LEAD, ok = !want || (after.lead === want && after.chip.includes(after.leadName));
    console.log(`${ok ? 'ok  ' : 'FAIL'} after the book: playing as ${after.lead} in ${after.place}; the chip says "${after.chip}"${want ? ` (wanted ${want})` : ''}; "Now playing" banners: ${banners.join(' | ') || 'none'}`);
    if (!ok) featureFails.push('after the book: ' + after.lead); }
  // the boards' draws against the difficulty asked for
  const diffCheck = await p.evaluate(([bs, B]) => { const w = TK.world(B), easy = TK.easy, adaptive = TK.mode === 'adaptive' && w.rated && w.rated.length, rated = adaptive ? new Set(w.rated.map(x => +x[1])) : null; let ok = 0, off = [];
    for (const { beat, key, id } of bs) { const base = String(key || beat).split('~')[0], n = TK.node(w, base) || (typeof WorldData !== 'undefined' && WorldData.node(w, base)); if (!n || id == null) continue; if (adaptive) { if (rated.has(+id)) ok++; else off.push(`${key || beat}:${id}`); continue; }   // Adaptive: every board from the rated pool
      const pool = (easy && n.pool_easy && n.pool_easy.length ? n.pool_easy : n.pool).map(x => +x[1]);
      if (pool.includes(id)) ok++; else off.push(`${key || beat}:${id}`); } return { easy, adaptive: !!adaptive, ok, off }; }, [boards, BOOK]).catch(e => ({ err: String(e) }));
  const fails = report.filter(r => r.status !== 'pass').length;
  if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); fs.writeFileSync(path.join(SHOTS, 'shots.json'), JSON.stringify(shots, null, 1)); }
  const out = { book: BOOK, diff: DIFF || 'default', optional: errands, held, recovered, minutes: +((Date.now() - t0) / 60000).toFixed(1), beats: report, boards: boards.length, draws: diffCheck, pageErrors: errs.slice(0, 5) };
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', `walk-playthrough-${BOOK}-${DIFF || 'default'}.json`), JSON.stringify(out, null, 1));
  if (diffCheck.off && diffCheck.off.length) console.log(`FAIL boards drawn from the wrong pool (${diffCheck.adaptive ? 'rated' : diffCheck.easy ? 'easy' : 'hard'}): ${diffCheck.off.join(', ')}`);
  console.log(`walk-playthrough Book ${BOOK} (${DIFF || 'default'}): ${report.length - fails}/${report.length} beats walked and played in ${out.minutes} min (${recovered.length} needed a reload, ${held.length} held by a scene); ${boards.length} boards (${diffCheck.ok} from the ${diffCheck.adaptive ? 'rated' : diffCheck.easy ? 'easy' : 'hard'} pool)`);
  if (SYNC) { const mid = reroutes.filter(r => r.busy || r.cine || r.duel);
    if (process.env.SYNC_PUSH) { const got = await p.evaluate(() => TK.cleared('12-from-elsewhere')).catch(() => false);
      console.log(`${got && reroutes.length ? 'ok  ' : 'FAIL'} sync: the other device's solve ${got ? 'arrived' : 'never arrived'}${reroutes.length ? `, the world rebuilt ${reroutes.map(r => `${r.secs} s after the flip${r.busy || r.cine || r.duel ? ' MID-SCENE' : ' while idle'}`).join(', ')}` : ', no rebuild'}`); }
    console.log(`sync: ${syncPosts} saves to the mocked script, ${visFlips} hide/show flips (${visFlips - reroutes.length} with the world kept, ${reroutes.length} rebuilt)${mid.length ? `; FAIL ${mid.length} rebuilt mid-scene (${mid.map(r => `${r.beat} in ${r.place}`).join(', ')})` : ''}`);
    if (mid.length) held.push(`${mid.length} mid-scene reroutes`); }
  const audio = errs.filter(e => /AudioContext/.test(e)); if (audio.length) console.log(`     note: ${audio.length} AudioContext page errors (${audio[0].slice(0, 80)})`);
  console.log(`the goal box's chip followed the party: ${chipSeen.join(' → ') || 'never shown'}${chipBad.size ? ` (wrong at ${[...chipBad].join(', ')})` : ''}`);
  if (OPTIONAL) console.log(`optional: ${errands.filter(e => e.status === 'pass').length}/${errands.length} walked to, ${errands.filter(e => e.status === 'gone').length} gone before he got there (${errands.filter(e => e.id.startsWith('challenger')).length} challengers, ${errands.filter(e => e.id.startsWith('door')).length} doors and rooms)`);
  if (chaseLog.length || process.env.CHASE_FAIL) console.log(`the chase: ${chaseLog.length ? chaseLog.map(x => `${x.beat} caught by ${x.by}, ${x.failed ? `failed (restart ${x.restart ? 'ok' : 'NOT seen'})` : 'solved'}`).join('; ') : 'never caught'}${process.env.CHASE_FAIL && !chaseLog.some(x => x.failed) ? ' (CHASE_FAIL: no catch to fail)' : ''}`);
  const chaseBad = chaseLog.some(x => x.failed && !x.restart) || (process.env.CHASE_FAIL && !chaseLog.some(x => x.failed));
  await b.close(); process.exit(chaseBad || featureFails.length || chipBad.size || errands.some(e => e.status === 'fail') || fails || held.length || recovered.length || (diffCheck.off && diffCheck.off.length) ? 1 : 0);
})();
