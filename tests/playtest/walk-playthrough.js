// A book played the way a player plays it (BOOK, default 12; DIFF easy|hard, default the game's own). From a
// fresh save, beat after beat: follow the game's own goal (its pointer: the next spot, a giver, a delivery
// place, or the way out toward them) by tapping it through the game's tap handler, so every exit, door and
// road is really walked through; tap through every line and scene; win each board with the test-mode Skip.
// Nothing is teleported, marked cleared or handed over: items, marks and party changes come from playing.
// A stealth beat is crossed by timing (the patrols simulated ahead), still walked a cell at a time.
// A chase (Book 13, c17) is ridden like any walk, straight for the goal: an ambusher's hit opens a one-try board, solved
// with Skip and logged, and the wave overrunning him is logged; CHASE_FAIL=1 fails the first board and checks the restart.
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
  // which cutscene step is running (window.__csAt), for the stuck report: a scene that hangs names the step it waits on
  await p.addInitScript(() => { const hook = () => { if (typeof WorldCutscene === 'undefined' || WorldCutscene.__hooked) return !!(typeof WorldCutscene !== 'undefined');
      const play = WorldCutscene.play.bind(WorldCutscene); WorldCutscene.__hooked = true;
      WorldCutscene.play = (scene, cs, ...a) => { const beats = cs.beats; let n = 0;
        cs.beats = new Proxy(beats, { get(t, k) { if (typeof k === 'string' && /^\d+$/.test(k)) window.__csAt = { id: cs.id || cs.key || cs.title || '?', i: +k, of: t.length, beat: JSON.stringify(t[k]).slice(0, 160), at: Date.now() }; return t[k]; } });
        window.__csStarted = (window.__csStarted || []).concat([{ id: cs.id || cs.key || cs.title || '?', beats: beats.length, at: Date.now() }]).slice(-6);
        return play(scene, cs, ...a); }; return true; };
    const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 200); });
  const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('ERR', e.message); });
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  // UNHIDE=15: a book not yet published (hidden: test mode only) opened in player mode all the same, as it will be once it's live
  if (process.env.UNHIDE) { const un = process.env.UNHIDE.split(',').map(Number);
    await p.route(/\/data\/tk\.json/, async r => { const res = await r.fetch(), j = await res.json(); for (const w of j.worlds || []) if (un.includes(w.n)) { delete w.hidden; delete w.draft; } r.fulfill({ response: res, body: JSON.stringify(j), contentType: 'application/json' }); }); }
  const LIVE = !!process.env.PLAYTEST_LIVE;   // player mode: no ?test=1, no Skip key; boards solved as a solve is reported
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html' + (LIVE ? '' : '?test=1');
  await p.goto(BASE + '#/');
  await p.evaluate(([B, D, K]) => {
    for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
    TK.migrate21();   // a fresh save: Book 1's one-time start-over (tk.js) is already behind it
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
      const city = id => { const x = w.region.places.find(q => q.id === id); return x && (x.parent || x.id); }, me = Q[i];
      const pl = prev && !(me && me.place && city(me.place) !== city(prev.place)) ? prev.place : (me && me.place) || w.region.start, top = w.region.places.find(x => x.id === pl);   /* the beat in another city than the one before it (a scene took them there): start in its own place */ for (const id of [top && top.parent, pl]) if (id && !w.st.visited.includes(id)) w.st.visited.push(id);
      w.save(); w.leaving = false; w.cine = null; if (w.placeId !== pl) w.go(pl); }, [BOOK, FROM]); await p.waitForTimeout(1500); }
  // which board is up: the key the game opened it with
  for (let i = 0; i < 40 && !(await p.evaluate(() => typeof TKOverlay !== 'undefined')); i++) await p.waitForTimeout(250);
  const hook = () => p.evaluate(() => { if (typeof TKOverlay === 'undefined' || TKOverlay.__hooked) return; const o = TKOverlay.open.bind(TKOverlay); TKOverlay.open = (n, key, at) => { window.__boardKey = key; return o(n, key, at); }; TKOverlay.__hooked = true; }).catch(() => {});
  await hook();
  if (process.env.STEALTHDBG) await p.addInitScript(() => {}).then(() => p.evaluate(() => { const wrap = () => { const w = window.__w; if (!w || w.__wrapped) return; const o = w.walkTo.bind(w); w.walkTo = (x, y, opt) => { (window.__walks = window.__walks || []).push({ t: Math.round(performance.now()), x: Math.round(x), y: Math.round(y), from: (new Error().stack || '').split('\n')[2].trim().slice(0, 70) }); return o(x, y, opt); }; const oc = w.caughtBy.bind(w); w.caughtBy = n => { const P = w.player; const fr = Math.floor((window.__execT || 0) / 50), pr = (window.__trk || []).find(t => t.id === n.id), po = pr && pr.out[fr]; window.__catch = { long: (window.__long || []).slice(-4), pred: po && [Math.round(po.x), Math.round(po.y), po.dir, fr], ring: (window.__ring || []).slice(-25).map(r => r.join(' ')).join(' | '), P: [Math.round(P.x), Math.round(P.y)], hidden: w.hidden, walk: !!w.walk, auto: w.auto, speed: Math.round(P.body.speed), cover: !!(w.covers.length && w.inCover(P)), by: `${n.id}@${Math.round(n.spr.x)},${Math.round(n.spr.y)} ${n.watch.dir}`, gt: Math.round(window.__execT || 0), plan: window.__pts && window.__pts.slice(Math.floor((window.__execT || 0) / window.__ms) - 1, Math.floor((window.__execT || 0) / window.__ms) + 2).map(q => [q.x, q.y]) }; return oc(n); }; w.__wrapped = true; }; setInterval(wrap, 200); }));
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
      hidden: !!w.hidden, inCover: !!(w.inCover && w.covers && w.covers.length && w.inCover()),
      wet: !!(w.onWater && w.onWater()), wades: !!(w.wades && w.wades()), carry: w.st && w.st.carry ? w.st.carry.whom : '', mstate: ((w.mapState && w.mapState()) || {}).ids ? w.mapState().ids.join('+') : '',
      lvnv: w.children.list.some(o => o.visible && o.alpha > .1 && o.texture && /^(h|ride)-lvnv/.test(o.texture.key)), redhare: typeof WorldItems !== 'undefined' && WorldItems.has(w.w, 'redhare'),
      mounts: (w.cine ? [...new Set(w.children.list.filter(o => o.visible && o.alpha > .1 && o.texture && /^ride-/.test(o.texture.key)).map(o => o.texture.key.split('-')[1]))].map(x => x + ':?')   // in a scene: who is drawn in the saddle
        : (w.mounts || []).filter(m => m.horse && m.horse.visible).map(m => `${m.who}:${m.coat}`)).sort().join(',') || 'on foot', indoors: typeof WorldItems !== 'undefined' && WorldItems.indoors(w),
      horses: (w.followers || []).filter(F => F.coat && F.spr && F.spr.visible).map(F => `${F.coat}@${Math.round(Math.hypot(F.spr.x - w.player.x, F.spr.y - w.player.y))}`).join(','),
      pouch: (() => { const c = d.querySelector('.tk-pouch'); return c && c.getClientRects().length ? c.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : ''; })(), crouch: !!w.cine && w.children.list.some(o => o.visible && o.texture && /^h-/.test(o.texture.key) && o.scaleY > .69 && o.scaleY < .78), banner: ((d.querySelector('.town-ui .town-place') || {}).textContent || '').trim(), chip: ((d.querySelector('.town-goal .town-lead') || {}).textContent || '').trim(), leadName: typeof tkName === 'function' ? tkName(w.lead) : w.lead, line, who: dlg && !dlg.hidden ? ((dlg.querySelector('.town-who') || {}).textContent || '').trim() : '', scroll: vis('.tk-scroll-go'), duel: !!d.querySelector('.tk-duel svg'), cont: vis('.tk-duel-go'),
      skip: !!d.querySelector('.tk-duel-keys button') && [...d.querySelectorAll('.tk-duel-keys button')].some(b => /Skip/.test(b.textContent)),
      cleared: TK.world(w.w.n).nodes.filter(n => TK.cleared(n.key)).length, items: JSON.stringify((typeof WorldItems !== 'undefined' && WorldItems.list && WorldItems.list(w.w)) || []),
      cancel: [...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Cancel' && b.offsetParent),
      watchers: w.npcs.filter(n => n.watch && ((n.watch.seen || []).length || n.watch.back_to) && w.watching(n)).length,
    };
  });
  const tapEl = async sel => { const e = p.locator(sel).first(); if (await e.count()) await e[TAPM]({ timeout: 2000 }).catch(() => e[TAPM]({ timeout: 1000, force: true }).catch(() => {})); };   // (a button still moving: a real tap where it is)
  // a tap on a point of the world: on screen, a real tap there; off screen, the game's own tap handler
  let worldTaps = 0;   // taps on the world (walking), to tell a beat that starts by itself from one walked to
  const tapWorld = async (x, y) => { worldTaps++;
    const s = await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width, v = w.view ? w.view(x, y) : { x, y };
      const sx = r.left + (v.x - cam.worldView.x) * cam.zoom * k, sy = r.top + (v.y - cam.worldView.y) * cam.zoom * k;
      const goalLine = d => { const g = d.querySelector('.town-goal'); return g && g.getBoundingClientRect(); };
      const g = goalLine(document), hud = g ? g.bottom + 6 : r.top + 60;
      return { sx, sy, on: sx > r.left + 8 && sx < r.right - 8 && sy > hud && sy < r.bottom - 8 }; }, [x, y]);
    if (s.on) await (VIEW === 'desktop' ? p.mouse.click(s.sx, s.sy) : p.touchscreen.tap(s.sx, s.sy));   // a click on a desktop
    else await p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, v = w.view ? w.view(x, y) : { x, y }; w.tapAt(x, y, (v.x - cam.worldView.x) * cam.zoom, (v.y - cam.worldView.y) * cam.zoom); }, [x, y]);
  };
  // the patrols ahead, and a way to the goal none of them sees: cells, one per 150 ms (stealth-12's planner)
  const plan = (STEP, TGT = null) => p.evaluate(([STEP, TGT]) => {   // STEP frames of 50 ms a cell: 3 is his running pace, 4 the pace a walk a cell at a time surely keeps, 2 mounted
    const w = window.__w, T = w.tw || 16, C = 16, DT = 50, F = 1600, goal = w.goalAt; if (!goal) return null;
    w.scene.pause(); try { return planIn(w, STEP, TGT); } finally { setTimeout(() => w.scene.resume(), 80); }   /* resumed after the planning (a long task) and a few paused frames: the long frame lands on the paused scene, not on the patrols */
    function planIn(w, STEP, TGT) {
    const T = w.tw || 16, C = 16, DT = 50, F = 800, goal = w.goalAt; if (!goal) return null;   /* 40 s of the patrols (plans go 30 s at most; a long sight map was a long task, a long frame) */ // the game held while he plans, and past the long frame after it (else the patrols jump ahead by the time the plan took)
    const G = w.walkGrid(), cols = Math.ceil(G.cols * G.C / C), rows = Math.ceil(G.rows * G.C / C), P = w.player, ox = ((Math.round(P.x) % C) + C) % C, oy = ((Math.round(P.y) % C) + C) % C, solid = w.solids.getChildren().filter(z => z.body && z.body.enable && !(z.visibleWith && !z.visibleWith.visible)).map(z => z.body), fb = { x: P.body.x - P.x, y: P.body.y - P.y, w: P.body.width, h: P.body.height }, wb = w.physics.world.bounds,
      feetFree = (x, y) => { const L = x + fb.x + .5, T0 = y + fb.y + .5, R = L + fb.w - 1, B = T0 + fb.h - 1; if (L < wb.x || T0 < wb.y || R > wb.right || B > wb.bottom) return false; return !solid.some(b => L < b.right && R > b.x && T0 < b.bottom && B > b.y); },
      free = (cx, cy) => feetFree(cx * C + ox, cy * C + oy), passes = (x, y, X, Y) => feetFree((x + X) / 2 * C + ox, (y + Y) / 2 * C + oy);   /* her feet (the physics body) clear of every solid, on the cell and half way there */   /* the grid laid from where she stands (no first shuffle onto a cell centre)) */
    const cat = w.npcs.filter(n => n.watch && ((n.watch.seen || []).length || n.watch.back_to) && w.watching(n));
    const tracks = cat.map(n => { const W = n.watch, st = { x: n.spr.x, y: n.spr.y, leg: W.leg, wait: W.wait, dir: W.dir, t: W.t, turn: W.turn }, out = [];
      for (let f = 0; f < F; f++) { out.push({ x: st.x, y: st.y, dir: st.dir });
        if (W.pts.length > 1) { if (st.wait > 0) st.wait -= DT; else { const tg = W.pts[st.leg], dx = tg.x - st.x, dy = tg.y - st.y, d = Math.hypot(dx, dy), v = 30 * DT / 1000;
          if (d <= v) { st.x = tg.x; st.y = tg.y; const c = (W.beat || [])[st.leg], pz = W.pause; if (pz && c && c[0] === pz[0] && c[1] === pz[1]) st.wait = (pz[2] || 2) * 1000; st.leg = (st.leg + 1) % W.pts.length; }
          else { st.x += dx / d * v; st.y += dy / d * v; st.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); } } }
        else if (W.turns.length) { st.t += DT; if (st.t > 2600) { st.t = 0; st.turn = (st.turn + 1) % W.turns.length; st.dir = W.turns[st.turn]; } } }
      return { n, out }; }); const trk = tracks.map(t => ({ id: t.n.id, out: t.out }));
    const at = (cx, cy) => ({ x: cx * C + ox, y: cy * C + oy }), seen = new Uint8Array(cols * rows * F), wasHidden = w.hidden; w.hidden = false;   // (sees() answers for her as she is now: hidden, nobody sees anything; the map of sight is for her out in the open)
    for (const { n, out } of tracks) { const R = (n.watch.cone || 4) * T + C; for (let f = 0; f < F; f++) { const o = out[f], stub = { watch: { cone: n.watch.cone, dir: o.dir }, spr: { x: o.x, y: o.y } };
      for (let cy = Math.max(0, Math.floor((o.y - R) / C)); cy <= Math.min(rows - 1, Math.floor((o.y + R) / C)); cy++) for (let cx = Math.max(0, Math.floor((o.x - R) / C)); cx <= Math.min(cols - 1, Math.floor((o.x + R) / C)); cx++)
        if (w.sees(stub, at(cx, cy))) seen[(f * rows + cy) * cols + cx] = 1; } }
    const covs = (w.covers || []).length && cat.some(n => n.watch.hide || n.watch.hide !== false) ? w.covers : [], inCov = (cx, cy) => { const q = at(cx, cy); return covs.some(r => Phaser.Geom.Rectangle.Contains(r, q.x, q.y - 3)); };
    w.hidden = wasHidden;
    const safe = (cx, cy, f) => { for (let k = Math.max(0, f - 2); k <= Math.min(F - 1, f + STEP + 2); k++) if (seen[(k * rows + cy) * cols + cx]) return false; return true; };
    const sx = Math.round((Math.round(P.x) - ox) / C), sy = Math.round((Math.round(P.y) - oy) / C), gx = Math.round((goal.x - ox) / C), gy = Math.round((goal.y - oy) / C);
    const HOLD = Math.ceil(700 / (STEP * DT));   /* still for the first 0.7 s: the frame after a plan can be long (the patrols jump on, she hasn't moved) */
    let cur = new Map([[sx + sy * cols, null]]); const hist = [cur]; let found = -1;
    for (let k = 0; (k + 1) * STEP < F; k++) { const nx = new Map(); for (const c of cur.keys()) { const x = c % cols, y = (c - x) / cols; for (const [a, b] of k < HOLD ? [[0, 0]] : [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + b, id = X + Y * cols;
        if (X < 0 || Y < 0 || X >= cols || Y >= rows || nx.has(id)) continue; if (!free(X, Y) && !(X === gx && Y === gy) && !(X === sx && Y === sy)) continue;   /* (the cell she stands on is hers to stay on, a scene may have set her down against a wall) */ if ((a || b) && !passes(x, y, X, Y) && !(X === gx && Y === gy)) continue; if (!(a === 0 && b === 0 && inCov(X, Y)) && !safe(X, Y, (k + 1) * STEP)) continue; if ((a || b) && inCov(x, y) && !safe(x, y, k * STEP)) continue; nx.set(id, c); } }   /* keeping still in cover: hidden (the looters pass her by); stepping out of it she's seen where she was, moving there */
      hist.push(nx); cur = nx; if (nx.has(gx + gy * cols)) { found = k + 1; break; } if (!nx.size) break; }
    let end = gx + gy * cols, hold = false;
    const NEAR = Math.floor(30000 / (STEP * DT));   /* the patrols' simulation holds for some seconds, not a minute: a whole way only if it's within 30 s */
    if ((found < 0 || found > NEAR) && covs.length) {   /* else to the cover nearest the goal she can reach unseen within that (and wait there; a fresh plan goes on from it) */
      const dist = new Int32Array(cols * rows).fill(-1), q = [gx + gy * cols]; dist[q[0]] = 0;
      for (let i = 0; i < q.length; i++) { const c = q[i], x = c % cols, y = (c - x) / cols; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + a, Y = y + b, id = X + Y * cols;
        if (X < 0 || Y < 0 || X >= cols || Y >= rows || dist[id] >= 0 || !free(X, Y) || !passes(x, y, X, Y)) continue; dist[id] = dist[c] + 1; q.push(id); } }
      const d0 = dist[sx + sy * cols]; let best = null;
      for (let k = 0; k < Math.min(hist.length, NEAR + 1); k++) for (const c of hist[k].keys()) { const x = c % cols; if (dist[c] < 0 || !inCov(x, (c - x) / cols)) continue; if (d0 >= 0 && dist[c] >= d0) continue;
        const keep = TGT && Math.hypot(at(x, (c - x) / cols).x - TGT.x, at(x, (c - x) / cols).y - TGT.y) < 9;   /* the cover she's on her way to, while it's still reachable: kept (a target changed every plan, she never got anywhere) */
        if (!best || (keep && !best.keep) || (keep === !!best.keep && dist[c] < best.d)) best = { d: dist[c], k, c, keep }; }
      if (best) { found = best.k; end = best.c; hold = true; } }
    if (found < 0) { window.__planDbg = { sizes: hist.slice(0, 8).map(m => m.size).join(','), startFree: free(sx, sy), nb: [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => `${free(sx + a, sy + b) ? 'f' : 'x'}${passes(sx, sy, sx + a, sy + b) ? 'p' : 'x'}${safe(sx + a, sy + b, HOLD * STEP) ? 's' : 'u'}`).join(' '), startSafe: [0, 4, 8, 16].map(f => safe(sx, sy, f) ? 1 : 0).join(''), covs: covs.length, ox, oy }; return null; }
    const cells = []; let c = end; for (let k = found; k >= 0; k--) { cells.unshift(c); c = hist[k].get(c); }
    const pts = cells.map(c => { const x = c % cols; return at(x, (c - x) / cols); }); if (hold) pts[pts.length - 1].hold = true;
    // follow it here, on the same clock as the game's resume (a start from the test's side would come late)
    /* followed in the page on the game's own clock: the time the patrols move by (the scene's update, held while the
       scene is paused or the game calm), each frame a step to the planned cell, or still where the plan stays */
    clearInterval(window.__execI); if (window.__execF) w.events.off('update', window.__execF); w.auto = null;
    let gt = 0; window.__trk = trk; window.__execT = 0; window.__ring = []; window.__pts = pts; window.__ms = STEP * 50; const ms = STEP * 50;
    window.__execF = (t, d) => { const w = window.__w; if (!w || !w.player || w.caught || w.ui.busy() || w.cine || w.leaving || w.engaged) return;
      gt += d; window.__execT = gt; if (d > 100) (window.__long = window.__long || []).push([Math.round(d), Math.round(performance.now() - (window.__planAt || 0))]);
      const k = Math.max(0, Math.min(pts.length - 1, Math.floor(gt / ms))), c = pts[k], P = w.player;
      /* the plan's steps are a cell up, down, left or right on a grid laid from where she stood: steered straight
         there (the game's own direction input), and still on the cell (no walk, no steer: hidden in cover) */
      const dx = c.x - P.x, dy = c.y - P.y; w.walk = null;
      const go = Math.abs(dx) > 3 ? (dx < 0 ? 'left' : 'right') : Math.abs(dy) > 3 ? (dy < 0 ? 'up' : 'down') : null;
      if (go !== w.auto) { w.auto = go; if (!go) P.setVelocity(0); }
      const R = window.__ring = window.__ring || []; R.push([Math.round(gt), k, Math.round(P.x), Math.round(P.y), go, Math.round(P.body.speed), Math.round(d)]); if (R.length > 40) R.shift(); };
    w.events.on('update', window.__execF); window.__execI = 0;
    window.__planAt = performance.now(); return pts;
  } }, [STEP, TGT]);

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
  { const tm = await p.evaluate(() => typeof TK_TEST !== 'undefined' && TK_TEST === true); console.log(`     mode: ${LIVE ? 'player' : 'test'} (the game's test mode ${tm ? 'on' : 'off'})`); if (LIVE && tm) { console.log('FAIL player mode asked for, but the game is in test mode'); process.exitCode = 1; } }
  const report = [], t0 = Date.now(); let beat = null, beatT = 0, lastProgress = Date.now(), progressKey = '', lastLine = '', refused = '', boards = [], chaseLog = [], chaseTries = 0; let liveSolved = ''; const beatStart = {}, placeShots = {};
  const leadFor = await p.evaluate(B => { const w = TK.world(B), out = {}; let party = null;   // the lead the story gives each beat: its last party step before it
    for (const n of w.nodes) { out[n.key] = party && party[0]; const sc = w.scenes && w.scenes[n.scene]; for (const s of (sc && sc.steps) || []) if (s[0] === 'party') party = s[1]; } return out; }, BOOK).catch(() => ({}));
  let beatLead = '';
  const close = (status, why, s) => { if (!beat) return; if (leadFor[beat] && beatLead && leadFor[beat] !== beatLead) console.log(`     note ${beat}: played by ${beatLead}, but the story's last handoff gave ${leadFor[beat]}`); const r = { beat, status, secs: Math.max(0, Math.round((Date.now() - beatT) / 1000)), place: s && s.place, at: s && s.P, lead: s && s.lead, why: why || '', line: lastLine.slice(0, 120) };
    report.push(r); console.log(`${status === 'pass' ? 'ok  ' : 'FAIL'} ${beat}  ${r.secs}s  ${r.lead || ''} in ${r.place || '?'}${status === 'pass' ? '' : `  at ${r.at}: ${why}${r.line ? ` ("${r.line}")` : ''}`}`); };
  const cutWait = {}, pouches = [], told = [], faced = [], gated = [], markSpots = {}; let yErr = 0;
  let noWaySince = 0, plannedSteps = null, planT = 0, pace = 3, stealthTries = 0, lastTap = 0, skipped = false, reloads = 0, catches = 0, wasCaught = false; const held = [], recovered = [];
  const featureFails = [], facts = {}, banners = [], chipBad = new Set(), chipSeen = [], shotWho = new Set(), shots = []; let lastPlace = '', arrivedAt = null; const OPTIONAL = !!process.env.OPTIONAL, visited = new Set(), errands = []; let errand = null;
  for (;;) {
    if ((Date.now() - t0) / 60000 > MAXMIN) { const s = await look(); close('fail', `out of time (${MAXMIN} min)`, s); break; }
    const s = await look();
    if (s.boot) { if (s.cancel) await p.getByText('Cancel', { exact: true }).first()[TAPM]().catch(() => {}); if (s.scroll) await tapEl('.tk-scroll-go'); await p.waitForTimeout(250); continue; }
    if (s.book !== BOOK || !s.next) { if (beat) close('pass', '', s); break; }   // the book is done (or handed on to the next)
    if (s.next !== beat) {   // a new beat
      if (beat) close('pass', '', s);
      if (UNTIL && beat === UNTIL) break;
      beat = s.next; beatStart[beat] = { taps: worldTaps, P: s.P, scene: null }; beatT = Date.now(); lastProgress = Date.now(); refused = ''; stealthTries = 0; plannedSteps = null; noWaySince = 0; await p.evaluate(() => (clearInterval(window.__execI), window.__execF && window.__w && window.__w.events.off('update', window.__execF), window.__execF = null, window.__w && (window.__w.auto = null))).catch(() => {}); skipped = false; reloads = 0; catches = 0;
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
      const ui = await p.evaluate(() => ({ csAt: window.__csAt && { ...window.__csAt, ago: Date.now() - window.__csAt.at }, csStarted: window.__csStarted, engaged: !!window.__w.engaged, lead: window.__w.lead, party: window.__w.st.party, line: (document.querySelector('.town-ui .town-dlg')||{}).textContent, dlgHidden: (document.querySelector('.town-ui .town-dlg')||{}).hidden, busy: window.__w.ui.busy(), cine: !!window.__w.cine, leaving: !!window.__w.leaving, html: [...document.querySelectorAll('.town-ui button, .town-ui .town-dlg')].filter(e => e.offsetParent).map(e => e.className + ':' + e.textContent.trim().slice(0, 40)).slice(0, 6) })).catch(() => ({}));
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
    // the audit board (Misaeng, tk-modern.js): tap the two clues that answer the question showing, as a player who reads them does;
    // when every link is made (or the board has nothing to link yet), close it
    const audit = await p.evaluate(() => { const el = document.querySelector('.tk-audit'); if (!el || !el.getClientRects().length) return null;
      const w = window.__w && window.__w.w, A = w && w.audit, q = (el.querySelector('.tk-audit-q') || {}).textContent || '';
      const L = A && A.links.find(l => l.q === q); const d = (w && WorldItems.defs(w)) || {};
      const cards = [...el.querySelectorAll('.tk-audit-card')].map((c, i) => ({ i, name: (c.querySelector('b') || {}).textContent || '', on: !c.disabled }));
      const want = L ? L.pair.map(k => (d[k] || {}).name || k) : [];
      return { q, done: /Every link is made/.test(q), pick: want.map(n => (cards.find(c => c.name === n && c.on) || {}).i).filter(i => i != null), want }; });
    if (audit) { if (audit.done || audit.pick.length < 2) { if (!audit.done) console.log(`     ${beat}: the audit board asks "${audit.q}", but the clues ${audit.want.join(' + ')} aren't both held; closing it`); await tapEl('.tk-audit-close'); await p.waitForTimeout(500); continue; }
      console.log(`     ${beat}: the audit board: "${audit.q}" -> ${audit.want.join(' + ')}`);
      for (const i of audit.pick) { await p.locator('.tk-audit-card').nth(i)[TAPM]().catch(() => {}); await p.waitForTimeout(300); }
      await p.waitForTimeout(600); continue; }
    // a lift's floor menu (Misaeng, tk-modern.js): the floor the goal is on is marked ◆; take it, as a player following the goal does
    const lift = await p.evaluate(() => { const m = document.querySelector('.tk-lift'); if (!m || !m.getClientRects().length) return null; const b = [...m.querySelectorAll('button')].find(x => /^\s*◆/.test(x.textContent)); return { floor: b ? b.textContent.trim() : null }; });
    if (lift) { if (lift.floor) { console.log(`     ${beat}: the lift, to ${lift.floor}`); await p.locator('.tk-lift button', { hasText: '◆' }).first()[TAPM]().catch(() => {}); } else { console.log(`FAIL ${beat}: the lift's menu has no floor marked ◆`); await tapEl('.tk-lift-close'); } await p.waitForTimeout(600); continue; }
    if (s.pouch) { pouches.push(s.pouch); await tapEl('.tk-pouch button'); await p.waitForTimeout(300); continue; }   // a sealed pouch opened (Book 15): its card read, then on
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
    if (beat && beatStart[beat] && !beatStart[beat].scene && (s.cine || s.busy)) beatStart[beat].scene = { taps: worldTaps - beatStart[beat].taps, moved: Math.round(Math.hypot(s.P[0] - beatStart[beat].P[0], s.P[1] - beatStart[beat].P[1])) };   // how the beat's scene began
    // PLACESHOTS=place,place (with SHOTS): the place as he's free to walk it, and its first scene 2 s and 7 s in
    if (SHOTS && process.env.PLACESHOTS && process.env.PLACESHOTS.split(',').includes(s.place)) {
      const ps = placeShots[s.place] || (placeShots[s.place] = { walk: false, scene: 0, t: 0 });
      const snap = async tag => { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: `${SHOTS}/place-${s.place}-${tag}.png` }); console.log(`     shot: ${s.place} ${tag} (${beat})`); };
      if (!ps.walk && !s.busy && !s.cine && !s.leaving && !s.walking) { ps.walk = true; await snap('walk'); }
      if (s.cine && ps.scene < 2) { if (!ps.t) ps.t = Date.now(); const due = [2000, 7000][ps.scene]; if (Date.now() - ps.t >= due) { await snap(`scene-${due / 1000}s`); ps.scene++; } }
    }
    prevS = s;
    // where each beat's lead is first free to walk: after a handoff (a new lead) he starts some way off, not on the beat's spot
    if (beat && s.next === beat && !s.busy && !s.cine && !s.leaving && !s.caught && !(facts[beat] && facts[beat].firstFree)) {
      const ff = await p.evaluate(() => { const w = window.__w, q = w && w.nextMain(), sp = q && w.placeId === q.place && w.spots[q.spot];
        return w && w.player ? { lead: w.lead, place: w.placeId, P: [Math.round(w.player.x), Math.round(w.player.y)], spot: q && q.spot, tiles: sp ? Math.hypot(sp.x - w.player.x, sp.y - w.player.y) / (w.tw || 16) : null, spotPlace: q && q.place } : null; }).catch(() => null);
      if (ff) { (facts[beat] || (facts[beat] = { light: new Set(), route: new Set(), horses: new Set(), crouch: false, place: new Set(), mount: new Set(), wetRide: false, carry: new Set(), lvnv: false, mstate: new Set(), redhare: new Set(), walker: new Set(), lastRed: null, hid: 0, caughtAt: [] })).firstFree = ff; } }
    if (beat) { const f = facts[beat] || (facts[beat] = { light: new Set(), route: new Set(), horses: new Set(), crouch: false, place: new Set(), mount: new Set(), wetRide: false, carry: new Set(), lvnv: false, mstate: new Set(), redhare: new Set(), walker: new Set(), lastRed: null, hid: 0, caughtAt: [] });   // what each beat showed
      if (s.light) f.light.add(s.light); if (s.route) f.route.add(`${s.route}@${s.place}`); if (s.horses) f.horses.add(s.horses.split('@')[0]); if (s.crouch) f.crouch = true; f.place.add(s.place); if (s.wet && s.wades && !s.cine) f.wetRide = true; if (s.carry) f.carry.add(s.carry + (s.cine ? ' (scene)' : ' (map)')); if (s.lvnv && s.cine) f.lvnv = true; if (s.mstate) f.mstate.add(`${s.place}:${s.mstate}`); f.redhare.add(s.redhare); f.lastRed = s.redhare; if (s.hidden && !f.wasHidden) f.hid++; f.wasHidden = s.hidden; if (s.caught && !f.wasCaught) f.caughtAt.push(s.P.join(',')); f.wasCaught = s.caught; if (!s.busy && !s.cine && !s.leaving && s.lead) f.walker.add(s.lead); if (!s.leaving && s.place && (s.cine || !s.busy)) f.mount.add(`${s.place}${s.indoors ? ' (indoors)' : ''}${s.cine ? ' in a scene' : ''}: ${s.mounts}`); }
    if (/Now playing/.test(s.banner || '') && banners[banners.length - 1] !== s.banner) banners.push(s.banner);
    if (pushWait && !s.busy && !s.cine && !s.duel && !s.leaving && !s.walking) { pushWait = false; await p.waitForTimeout(4000); continue; }   // SYNC_PUSH: a still moment after the scene, as a player reading would
    if (s.duel) {   // a board: win it with Skip, note what it drew, then Continue
      if (s.cont) { await tapEl('.tk-duel-go'); await p.waitForTimeout(400); continue; }
      if (s.skip) {
        const drawn = await p.evaluate(() => { const a = document.querySelector('.tk-duel-src a'), m = a && a.href.match(/\/q\/(\d+)/); return { id: m ? +m[1] : null, key: window.__boardKey }; });
        if (!boards.some(x => x.key === drawn.key && x.id === drawn.id)) boards.push({ beat, key: drawn.key, id: drawn.id });
        // a chase's catch (its own one-try board, key~n): logged; CHASE_FAIL=1 fails the first, and the chase must restart
        const ch = /~\d+$/.test(drawn.key || '') && await p.evaluate(() => { const w = window.__w, C = w.chase; return C && w.chaseNow() ? { by: w.engaged && w.engaged.id, tries: C.tries, from: C.map ? 'the start' : C.spec.from } : null; });
        if (ch && !chaseLog.some(x => x.key === drawn.key)) {
          const fail = process.env.CHASE_FAIL && !chaseLog.some(x => x.failed);
          chaseLog.push({ beat, key: drawn.key, by: ch.by, failed: !!fail }); console.log(`     ${beat}: caught by ${ch.by} (${drawn.key}); ${fail ? 'failing it' : 'solving it'}`);
          if (fail) {
            await p.evaluate(() => { if (window.__trainer) window.__trainer.flawed = null; dispatchEvent(new CustomEvent('tczw:result', { detail: 'fail' })); }); await p.waitForTimeout(600);
            await tapEl('.tk-duel-go'); let r = null;
            for (let i = 0; i < 120 && !r; i++) { await p.waitForTimeout(50); r = await p.evaluate(t => { const w = window.__w, C = w.chase, sp = C && w.chaseFrom(C.spec); if (!C || C.tries <= t || !sp || Math.hypot(w.player.x - sp.x, w.player.y - sp.y - (sp.map ? 0 : 18)) > 4) { if (w.ui.busy()) w.ui.advance(); return null; }
              return { home: (C.amb || []).every(a => a.st === 'wait' && !a.spr.visible) && (!C.trail || C.trail[C.trail.length - 1].d - C.wd < 8), at: [Math.round(w.player.x), Math.round(w.player.y)] }; }, ch.tries); }   // (the wave and every ambush set back too)
            const ok = !!r && r.home; chaseLog[chaseLog.length - 1].restart = ok; chaseTries = await p.evaluate(() => window.__w.chase ? window.__w.chase.tries : 0);
            console.log(`${ok ? 'ok  ' : 'FAIL'} ${beat}: failing the catch restarts the chase at ${ch.from}${r ? ` (${r.at}), wave and ambushes reset: ${r.home}` : ': no restart seen in 6 s'}`);
            continue; } }
        await p.locator('.tk-duel-keys button', { hasText: 'Skip' }).first()[TAPM]().catch(() => {}); await p.waitForTimeout(600); continue; }
      if (LIVE && !s.cont) {   // player mode: no Skip key; once the board is up, solve it (the result a solve sends)
        const drawn = await p.evaluate(() => { const a = document.querySelector('.tk-duel-src a'), m = a && a.href.match(/\/q\/(\d+)/); return { id: m ? +m[1] : null, key: window.__boardKey }; });
        if (drawn.key && liveSolved !== drawn.key + '|' + drawn.id) { await p.waitForTimeout(900); liveSolved = drawn.key + '|' + drawn.id;
          if (!boards.some(x => x.key === drawn.key && x.id === drawn.id)) boards.push({ beat, key: drawn.key, id: drawn.id });
          await p.evaluate(() => { if (window.__trainer) window.__trainer.flawed = null; dispatchEvent(new CustomEvent('tczw:result', { detail: 'ok' })); }); continue; } }
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
    if (s.caught && process.env.STEALTHDBG) console.log('     dbg at the catch', await p.evaluate(() => JSON.stringify(window.__catch)), 'walks', await p.evaluate(() => JSON.stringify((window.__walks || []).slice(-2).map(o => [o.t, o.x, o.y]))));
    if (s.caught && process.env.STEALTHDBG) await p.evaluate(() => { window.__walks = []; });
    if (s.caught && plannedSteps && process.env.STEALTHDBG) { const k = Math.floor((Date.now() - planT) / (pace * 50)); console.log('     dbg by', await p.evaluate(() => window.__w.npcs.filter(n => n.watch && n.sees).map(n => `${n.id}@${Math.round(n.spr.x)},${Math.round(n.spr.y)} ${n.watch.dir} leg ${n.watch.leg} wait ${Math.round(n.watch.wait || 0)}`).join('; ')), 'planned', ((Date.now() - planT) / 1000).toFixed(1), 's ago'); console.log(`     dbg caught at ${s.P} hidden ${s.hidden} inCover ${s.inCover}; plan step ${k}/${plannedSteps.length} at ${plannedSteps[Math.min(k, plannedSteps.length - 1)].x},${plannedSteps[Math.min(k, plannedSteps.length - 1)].y}; next ${JSON.stringify(plannedSteps.slice(k, k + 4).map(c => [c.x, c.y]))}`); }
    if (s.caught) { if (plannedSteps) await p.evaluate(() => (clearInterval(window.__execI), window.__execF && window.__w && window.__w.events.off('update', window.__execF), window.__execF = null, window.__w && (window.__w.auto = null))); plannedSteps = null; await p.waitForTimeout(200); continue; }   // sent back (the game walks her there): plan again once she's there
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
    { const ct = await p.evaluate(() => { const w = window.__w; return w && w.chase && w.chaseNow() ? w.chase.tries : null; });   // the wave got him: taken, no board, the chase again
      if (ct !== null && ct > chaseTries && !s.duel) { chaseLog.push({ beat, overrun: true }); console.log(`     ${beat}: overrun by the wave at ${s.P}; the chase starts again`); }
      if (ct !== null) chaseTries = ct; }
    if (!s.goal) {   // a cutaway (Book 15) plays by itself once open, with nowhere to walk: wait for it (up to 30 s with nothing happening)
      const cut = await p.evaluate(k => { const w = window.__w, n = k && TK.world(w.w.n).nodes.find(x => x.key === k); return n ? (n.cutaway === true ? 'yes' : n.cutaway ? String(n.cutaway) : '') : ''; }, s.next).catch(() => '');
      if (cut && Date.now() - lastProgress < 30000) { if (!cutWait[s.next]) { cutWait[s.next] = Date.now(); console.log(`     ${s.next}: a cutaway (${cut}), waiting for it to play by itself`); } await p.waitForTimeout(400); continue; }
      close('fail', cut ? `the cutaway (${cut}) never started in 30 s` : 'no goal to go to', s); break; }
    // a stealth beat here: time the way past the cones, then walk it a cell at a time
    if (s.watchers && !plannedSteps) {   // a steady pace first; the running one if only it has a way
      pace = 4; plannedSteps = await plan(4); if (!plannedSteps) { pace = 3; plannedSteps = await plan(3); }   /* a cell in 200 ms first: 80 px/s, slack on her 110 px/s run for the turns (150 ms is 107 px/s, barely in hand) */
      if (!plannedSteps && await p.evaluate(() => !!(window.__w.mounts && window.__w.mounts.length))) { pace = 2; plannedSteps = await plan(2); if (plannedSteps) console.log(`     ${beat}: a way past the watchers at his mounted pace (a cell every 100 ms)`); }   // on horseback he's quicker
      if (process.env.STEALTHDBG) { const P0 = await p.evaluate(() => [Math.round(window.__w.player.x), Math.round(window.__w.player.y)]); console.log(`     dbg plan from ${P0}: ${!plannedSteps ? JSON.stringify(await p.evaluate(() => window.__planDbg)) + ' ' : ''}${plannedSteps ? `${plannedSteps.length} steps at pace ${pace} to ${[plannedSteps[plannedSteps.length - 1].x, plannedSteps[plannedSteps.length - 1].y]}${plannedSteps[plannedSteps.length - 1].hold ? ' (a cover on the way)' : ''}` : 'none'}`); }
      planT = Date.now() + 80; stealthTries++; await p.evaluate(() => { const w = window.__w; w.walk = null; });
      if (!plannedSteps && stealthTries <= 3 && arrivedAt && Math.hypot(s.P[0] - arrivedAt[0], s.P[1] - arrivedAt[1]) > 12) {   // no way from here (an errand left him there): back to where he came in, and plan again
        await p.evaluate(a => window.__w.walkTo(a[0], a[1], { ring: false }), arrivedAt);
        for (let i = 0; i < 60 && await p.evaluate(() => !!window.__w.walk && !window.__w.caught); i++) await p.waitForTimeout(250);
        continue; }
      if (!plannedSteps && (Date.now() - (noWaySince || (noWaySince = Date.now()))) < 90000) { await p.waitForTimeout(500); continue; }   // no way just now: wait (the patrols move on, a catch puts him back) and plan again
      if (!plannedSteps) { const why = await p.evaluate(() => { const w = window.__w, P = w.player, g = w.goalAt, f = g && w.findPath(P.x, P.y, g.x, g.y);
          const cat = w.npcs.filter(n => n.watch && w.watching(n)); const G = w.walkGrid(), pts = f && f.length ? [{ x: P.x, y: P.y }, ...f] : [], dense = []; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8); for (let k = 0; k <= n; k++) dense.push({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }); }
          const blocked = dense.filter(q => !G.free(Math.floor(q.x / G.C), Math.floor(q.y / G.C))).length, wet = dense.filter(q => (w.waters || []).some(x => x.on && x.layer.getTileAtWorldXY(q.x, q.y))).length;
          return `a way there ignoring them: ${f && f.length ? f.length + ' steps' : 'none'} (${dense.length} points: ${wet} in water, ${blocked} blocked in the walk grid the planner uses); goal ${g && [Math.round(g.x), Math.round(g.y)]}; wading ${w.wades()}; watchers ${cat.map(n => `${n.id}@${Math.round(n.spr.x)},${Math.round(n.spr.y)} cone ${n.watch.cone} ${n.watch.dir}${w.sees ? (w.sees(n, P) ? ' SEES HIM' : '') : ''}`).join('; ')}`; });
        close('fail', `no unseen way past the watchers (${why})`, s); break; } }
    if (plannedSteps) {
      if (s.hidden) lastProgress = Date.now();   // waiting in cover, on a plan, for the patrols to open a way: not stuck
      // the plan is followed in the page, on the game's clock (every 30 ms: a step to the planned cell, or still where
      // the plan stays); here only its end, a catch, and a fresh plan every 1.2 s in the open
      // (the plan is followed in the page from the moment it was made: see plan())
      const k = Math.floor((await p.evaluate(() => window.__execT || 0)) / (pace * 50));
      const nextMove = (() => { const ps = plannedSteps; for (let j = Math.max(0, k); j < ps.length - 1; j++) if (ps[j + 1].x !== ps[j].x || ps[j + 1].y !== ps[j].y) return (j + 1 - k) * pace * 50; return Infinity; })();
      if (Date.now() - planT > 1200 && nextMove > 2000 && !(await p.evaluate(() => !!window.__w.auto))) {   /* not just before she sets off: a fresh plan starts with a hold and would miss the gap */   /* a fresh plan every 1.2 s, from a cell she's on (the patrols' simulation drifts over a long plan); none just now: the one she's on goes on */
        const tgt = plannedSteps[plannedSteps.length - 1].hold ? plannedSteps[plannedSteps.length - 1] : null, here = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
        const aim = tgt && Math.hypot(here[0] - tgt.x, here[1] - tgt.y) > 9 ? { x: tgt.x, y: tgt.y } : null;   /* not there yet: on to it */
        let np = await plan(4, aim), npP = 4; if (!np) { np = await plan(3, aim); npP = 3; }
        if (np) { plannedSteps = np; pace = npP; planT = Date.now() + 80; await p.evaluate(() => { window.__w.walk = null; }); if (process.env.STEALTHDBG) console.log(`     dbg replan: ${np.length} steps to ${[np[np.length - 1].x, np[np.length - 1].y]}${np[np.length - 1].hold ? ' (a cover on the way)' : ''}`); }
        else { planT = Date.now(); if (process.env.STEALTHDBG) console.log('     dbg replan: none, keeping the plan she is on'); }
        continue; }
      if (k >= plannedSteps.length - 1 && !plannedSteps[plannedSteps.length - 1].hold) { await p.evaluate(() => (clearInterval(window.__execI), window.__execF && window.__w && window.__w.events.off('update', window.__execF), window.__execF = null, window.__w && (window.__w.auto = null))); plannedSteps = null; await tapWorld(s.goal[0], s.goal[1]); }   // there: tap it (a spot that starts on a tap)
      await p.waitForTimeout(100); continue;
    }
    // face them down (Book 15): soldiers set to "yield" stand aside one by one for her standing still within reach, facing
    // them (from the carriage, curtain up); pushing on into one is a catch. Walk up to within reach, stop, face, wait
    const yd = await p.evaluate(() => { const w = window.__w, P = w.player, T = w.tw || 16, live = w.npcs.filter(n => n.yield && n.spr.visible && !n.stoodAside);
      if (!live.length) return null; const near = live.map(n => ({ n, d: Math.hypot(n.spr.x - P.x, n.spr.y - P.y) })).sort((a, b) => a.d - b.d)[0];
      const reach = (near.n.yield.reach || 4) * T; if (near.d > reach + 10 * T) return null;
      const dx = near.n.spr.x - P.x, dy = near.n.spr.y - P.y, way = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      const curtain = typeof WorldFeats !== 'undefined' && WorldFeats.inCarriage && WorldFeats.inCarriage(w) && !WorldFeats.curtainUp(w);
      return { id: near.n.id, d: near.d, reach, way, curtain, x: near.n.spr.x, y: near.n.spr.y, P: [P.x, P.y], left: live.length }; }).catch(e => { if (!yErr) { yErr = 1; console.log('     face-down check:', e.message.split('\n')[0]); } return null; });
    if (yd && !s.busy) {
      if (!faced.includes(yd.id)) { faced.push(yd.id); console.log(`     ${s.next}: facing down ${yd.id} (${yd.left} still in the way${yd.curtain ? ', the curtain to raise' : ''})`); }
      if (yd.d > yd.reach - 6) {   // walk up to two-thirds of his reach, straight at him, and stop there
        const k = (yd.d - yd.reach * 2 / 3) / yd.d, tx = yd.P[0] + (yd.x - yd.P[0]) * k, ty = yd.P[1] + (yd.y - yd.P[1]) * k;
        if (!s.walking && Date.now() - lastTap > 1200) { lastTap = Date.now(); await tapWorld(tx, ty); }
        await p.waitForTimeout(300); continue; }
      await p.evaluate(way => { const w = window.__w, P = w.player; w.walk = null; w.auto = null; P.setVelocity(0); P.facing = way; }, yd.way);   /* a turn on the spot, as an arrow key tapped */
      if (yd.curtain) { await p.keyboard.press('c'); await p.waitForTimeout(300); }
      lastProgress = Date.now(); await p.waitForTimeout(400); continue; }
    if (s.walking) { await p.waitForTimeout(250); continue; }
    if (Date.now() - lastTap < 1200) { await p.waitForTimeout(200); continue; }
    // a gate of marks (Book 4's s5: mark:axemen_1-3, one in each of three side rooms): to each room in turn, through the
    // doors, and to the spot that gives the mark. (Straight to the rooms that have one: a player searches six; this is
    // the beat's flow, not its search.) The spots come from the book's maps
    const gm = await p.evaluate(() => { const w = window.__w, q = w.nextMain(), g = q && w.gateFor && w.gateFor(q);
      if (!g) return null; const need = [].concat(g.needs || []).find(c => /^mark:/.test(c) && !w.cond(c)); if (!need) return null;
      return { mark: need.slice(5), place: w.placeId, parent: (w.region.places.find(x => x.id === w.placeId) || {}).parent || null, exits: w.exits.map(e => ({ to: e.to, x: e.rect.centerX, y: e.rect.centerY })), T: w.tw || 16 }; }).catch(() => null);
    if (gm) {
      if (!markSpots[BOOK]) { markSpots[BOOK] = []; const dir = path.join(__dirname, `../../data/tk_maps/w${BOOK}`); for (const f of require('fs').readdirSync(dir).filter(f => f.endsWith('.map.json'))) { try { const d = JSON.parse(require('fs').readFileSync(path.join(dir, f), 'utf8')); for (const sp of d.spots || []) if (sp.delivers) markSpots[BOOK].push({ place: d.id || f.replace('.map.json', ''), id: sp.id, delivers: sp.delivers, needs: [].concat(sp.needs || []), x: sp.x, y: sp.y }); } catch (e) {} } }
      const sp0 = markSpots[BOOK].find(x => x.delivers === gm.mark);
      // a delivery that takes something not yet held (Misaeng m4's errands: fetch the copies first): not there yet; the game's own goal leads to the giver
      let sp = sp0 && (await p.evaluate(n => n.every(c => !/^item:/.test(c) || window.__w.cond(c)), sp0.needs || []).catch(() => true)) ? sp0 : null;
      // a room no door here leads to (Misaeng's floors: only the lift goes there): the game's own goal leads, by the lift
      const sib0 = sp && sp.place.replace(/--[^-]+(?:-[^-]+)*$/, '');
      if (sp && gm.place !== sp.place && !gm.exits.some(e => e.to === sp.place || e.to === sib0) && !(gm.parent && gm.exits.some(e => e.to === gm.parent))) sp = null;
      if (sp) {
        if (!gated.includes(gm.mark)) { gated.push(gm.mark); console.log(`     ${s.next} is gated on mark:${gm.mark}: to ${sp.place} (${sp.id})`); }
        if (!s.walking && Date.now() - lastTap > 1200 && !s.busy) { lastTap = Date.now();
          if (gm.place === sp.place) await tapWorld(sp.x * gm.T, sp.y * gm.T);
          else { const sib = sp.place.replace(/--[^-]+(?:-[^-]+)*$/, ''), e = gm.exits.find(e => e.to === sp.place) || gm.exits.find(e => e.to === sib) || (gm.parent && gm.exits.find(e => e.to === gm.parent)) || gm.exits[0];
            if (e) await tapWorld(e.x, e.y); } }
        await p.waitForTimeout(400); continue; } }
    // the loud town (Book 15): the next beat waits on news reaching someone ("cutaway": "told:<id>"); as a player would,
    // talk to the townsfolk who haven't heard yet, the nearest first, until it holds (the news then walks on by itself)
    const gossip = await p.evaluate(k => { const w = window.__w, nd = k && (w.w.nodes || []).find(n => n.key === k), c = nd && typeof nd.cutaway === 'string' ? nd.cutaway : '';
      if (!/^told:/.test(c) || w.cond(c) || typeof WorldFeats === 'undefined') return null; const P = w.player;
      const n = w.npcs.filter(n => n.gossip && !n.gossip.relay && n.spr.visible && WorldFeats.gossipActive(w, n) && !WorldFeats.told(w, n.id))   /* (a relay hears it only from a neighbour) */.sort((a, b) => Math.hypot(a.spr.x - P.x, a.spr.y - P.y) - Math.hypot(b.spr.x - P.x, b.spr.y - P.y))[0];
      return n ? { id: n.id, x: n.spr.x, y: n.spr.y, cond: c } : { wait: c }; }, s.next).catch(() => null);
    if (gossip && gossip.id) { if (!told.includes(gossip.id)) { told.push(gossip.id); console.log(`     ${s.next} waits on ${gossip.cond}: telling ${gossip.id}`); } lastTap = Date.now(); await tapWorld(gossip.x, gossip.y); await p.waitForTimeout(600); continue; }
    if (gossip && gossip.wait) { await p.waitForTimeout(500); continue; }   // everyone told: the news on its way
    lastTap = Date.now(); await tapWorld(s.goal[0], s.goal[1]); await p.waitForTimeout(500);
  }
  // handoffs: a beat whose lead differs from the beat before's starts him at least 6 tiles from the beat's spot (another place
  // counts as far); he walks to it, he isn't set down on it. Kept as cuts: Book 14's x14 (yan-start) and x18 (stables-door), Book 13's c19
  { const KEEP = new Set(['14-x14', '14-x18', '13-c19']), seq = report.map(r => r.beat).filter(k => facts[k] && facts[k].firstFree), near = [], far = [];
    for (let i = 1; i < seq.length; i++) { const a = facts[seq[i - 1]].firstFree, b = facts[seq[i]].firstFree; if (a.lead === b.lead) continue;
      const d = b.tiles == null ? `in ${b.place}, the spot in ${b.spotPlace}` : `${b.tiles.toFixed(1)} tiles from ${b.spot}`, line = `${seq[i].replace(/^\d+-/, '')} ${a.lead}>${b.lead} ${d}`;
      if (KEEP.has(seq[i])) { far.push(line + ' (kept as a cut)'); continue; }
      (b.tiles != null && b.tiles < 6 ? near : far).push(line); }
    if (near.length || far.length) { console.log(`${near.length ? 'FAIL' : 'ok  '} after each handoff the new lead starts 6+ tiles from the beat's spot (${near.length ? 'too near: ' + near.join('; ') + ' | ' : ''}${far.join('; ')})`); if (near.length) featureFails.push('handoff starts on the spot'); } }
  // Book 14 (Lü Bu's fall): who leads each beat, Red Hare (x1 to x19), the flood rides, the daughter on his back, the states
  if (BOOK === 14) { const bad = [], say = (ok, w) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${w}`); if (!ok) bad.push(w); };
    const LEAD = { 0: 'yanshi', 8: 'zhangliao', 10: 'chengong', 12: 'chendeng', 15: 'yanshi', 19: 'houcheng', 20: 'caocao' };   // 0: the prologue, x0a and x0b
    const leads = report.map(r => [r.beat, [...((facts[r.beat] || {}).walker || [])].join('/') || r.lead]).filter(([k]) => /^14-x\d+[ab]?$/.test(k));   // who walked the beat (free to move)
    const exp = n => LEAD[n] || 'lvbu', selfStart = [];
    const wrong = leads.filter(([k, l]) => { const n = parseInt(k.slice(4), 10), set = l.split('/'); if (set.includes(exp(n))) return false;
      if (set.length === 1 && set[0] === exp(/[ab]$/.test(k) ? 1 : n + 1)) { selfStart.push(k.slice(3)); return false; } return true; });   // never free in its own beat: it starts by itself (only the next lead, after the handoff)
    if (selfStart.length) console.log(`note ${selfStart.join(', ')}: started by itself (the lead never free to walk it before the handoff)`);
    say(leads.length && !wrong.length, `each beat led by the right one (${wrong.length ? 'wrong: ' + wrong.map(([k, l]) => `${k} ${l}, not ${LEAD[+k.slice(4)] || 'lvbu'}`).join('; ') : leads.map(([k, l]) => k.slice(3) + ' ' + l).filter((x, i, a) => i === 0 || x.split(' ')[1] !== a[i - 1].split(' ')[1]).join(' > ')})`);
    // the prologue (x0b): the looters, the covers; she hides (keeps still in cover) at least once
    if (facts['14-x0b']) { const f = facts['14-x0b']; if (!f.hid) console.log(`note x0b in burning Chang'an: she didn't hide on the way${f.caughtAt.length ? `, and was caught at ${f.caughtAt.join(' | ')} (the walker's last steps to the door are untimed); a catch costs time, not the beat` : ': the way never came into a looter\'s sight'} (prologue.js hides her for real)`); else say(f.hid > 0, `x0b in burning Chang'an: she hid in cover ${f.hid} time${f.hid === 1 ? '' : 's'}${f.caughtAt.length ? `; caught at ${f.caughtAt.join(' | ')}` : ', never caught'}`); }
    const F = k => facts[k] || { redhare: new Set(), mount: new Set(), mstate: new Set(), carry: new Set() };
    const rh = k => [...F(k).redhare];
    if (facts['14-x2']) say(rh('14-x2').includes(true), `Red Hare is his from x1 (x2: ${rh('14-x2')})`);
    const redRides = Object.keys(facts).filter(k => /^14-x([2-9]|1[0-8])$/.test(k)).filter(k => [...F(k).mount].some(m => /lvbu:red/.test(m))).map(k => k.slice(3));
    if (['14-x2', '14-x3', '14-x4', '14-x5', '14-x6'].every(k => facts[k])) say(redRides.length > 0, `Lü Bu rides Red Hare outdoors (${redRides.join(', ') || 'never seen mounted'}; coats seen: ${[...new Set(Object.values(facts).flatMap(f => [...f.mount]).map(m => m.split(': ')[1]).filter(x => x && x !== 'on foot'))].join(' | ')})`);
    const wet = ['14-x16', '14-x17', '14-x18'].filter(k => facts[k] && F(k).wetRide).map(k => k.slice(3));
    console.log(`${wet.length ? 'ok  ' : 'note'} the flood: he rode through the water in ${wet.join(', ') || 'none of x16-x18 (the way to the goal stayed dry)'}`);
    if (facts['14-x20']) { const after = facts['14-x20'].lastRed, feet = [...F('14-x20').mount].filter(m => !/in a scene/.test(m)).every(m => !/red|\?/.test(m.split(': ')[1])); say(after === false && feet, `x19 takes Red Hare: in x20 he's gone (owned: ${after}) and nobody rides him (${[...F('14-x20').mount].join(' | ')})`); }
    if (facts['14-x16']) say(F('14-x16').lvnv && [...F('14-x16').carry].some(c => /lvnv \(map\)/.test(c)), `x16: the daughter is on Lü Bu's back on the open map (from x15's end) and in its scene (lvnv drawn: ${F('14-x16').lvnv}; carry: ${[...F('14-x16').carry].join(', ') || 'none on the map'})`);
    const ST = { '14-x16': /xiapi:siege/, '14-x17': /xiapi:flood1/, '14-x18': /xiapi:flood2/, '14-x19': /xiapi:flood2\+night|xiapi:night\+flood2/, '14-x20': /xiapi:taken/, '14-x4': /xuzhou:[^ ]*moon/, '14-x14': /xuzhou:[^ ]*locked/ };
    for (const [k, re] of Object.entries(ST)) if (facts[k]) { const seen = [...F(k).mstate].filter(x => re.source.startsWith('xiapi') ? x.startsWith('xiapi') : x.startsWith('xuzhou')); if (seen.length) say(seen.some(x => re.test(x)), `${k.slice(3)}: ${re.source.split(':')[0]} is in ${re.source.split(':')[1].replace(/\\|\[\^ \]\*/g, '')} (${seen.join(', ')})`); }
    if (bad.length) featureFails.push('book 14'); }
  // Book 13's new engine bits, seen on the walk: fireflies for the route at night at Beimang (c4), Red Hare walking as a red horse behind Li Su (c9), the crouch at c20
  if (BOOK === 13) { const F = k => facts[k] || { light: new Set(), route: new Set(), horses: new Set(), crouch: false, place: new Set() };
    const c4 = F('13-c4'), c9 = F('13-c9'), c20 = F('13-c20');
    const ff = [...c4.route].some(r => r.startsWith('fireflies@beimang')), band = [...c4.route].some(r => r.startsWith('band@beimang'));
    if (facts['13-c4']) console.log(`${band ? 'FAIL' : ff ? 'ok  ' : 'note'} c4: the way at night at Beimang is shown by fireflies, never the day's band (light ${[...c4.light].join('/') || '?'}; route ${[...c4.route].join(', ') || 'not drawn while watched: the goal in sight at once'})`);
    if (facts['13-c9']) console.log(`${c9.horses.has('red') ? 'ok  ' : 'FAIL'} c9: Red Hare walks behind Li Su as a red horse (followers on horses: ${[...c9.horses].join(', ') || 'none'})`);
    if (facts['13-c20']) console.log(`${c20.crouch ? 'ok  ' : 'FAIL'} c20: someone crouches in the scene (a figure drawn low, 0.72-0.76 of its height)`);
    // the Chancellor's horse (end of c16): Cao Cao rides it outdoors, Chen Gong beside him from c19, each in the coat the book gives; indoors both walk
    const coats = await p.evaluate(() => { const h = (TK.world(13).items || {}).horse; return (h && h.coats) || {}; });   // the horse's coats as the book gives them (Cao Cao's white, Chen Gong's brown)
    // c19 follows c18 by a fade into the jail court: its scene starts with no walk
    if (facts['13-c19'] && beatStart['13-c19']) { const st = beatStart['13-c19'].scene, ok = !!st && st.taps === 0 && st.moved < 16;
      console.log(`${ok ? 'ok  ' : 'FAIL'} c19: starts by itself after c18, no walk (${st ? `${st.taps} taps on the way, moved ${st.moved} px` : 'its scene never seen'})`); if (!ok) featureFails.push('c19 starts by itself'); }
    let mountBad = false;
    for (const k of Object.keys(facts).filter(k => /^13-c(1[7-9]|2\d)$/.test(k))) for (const m of facts[k].mount) {
      const [place, who] = m.split(': '), inside = / \(indoors\)/.test(place), inScene = / in a scene$/.test(place);
      if (inScene && !inside) continue;   // outdoors in a scene: who rides is the scene's to say
      const ok = inside ? who === 'on foot' : who.split(',').includes(`caocao:${coats.caocao}`) && (!/chengong/.test(who) || who.includes(`chengong:${coats.chengong}`));
      if (!ok) mountBad = true; console.log(`${ok ? 'ok  ' : 'FAIL'} ${k} ${place}: ${who}${inside ? ' (indoors: on foot)' : ''}`); }
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
    for (const { beat, key, id } of bs) { const base = String(key || beat).split('~')[0], n = TK.node(w, base) || (typeof WorldData !== 'undefined' && WorldData.node(w, base)); if (!n || id == null) continue; if ([].concat(n.dilemma || []).some(d => d && d.problem && String(Array.isArray(d.problem) ? d.problem[1] : String(d.problem).split('/').pop()) === String(id))) { ok++; continue; }   // a board its scene names ("problem": "book/id", Misaeng m1, m8): fixed, not drawn
      if (adaptive) { if (rated.has(+id)) ok++; else off.push(`${key || beat}:${id}`); continue; }   // Adaptive: every board from the rated pool
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
  if (chaseLog.length || process.env.CHASE_FAIL) console.log(`the chase: ${chaseLog.length ? chaseLog.map(x => x.overrun ? `${x.beat} overrun by the wave` : `${x.beat} caught by ${x.by}, ${x.failed ? `failed (restart ${x.restart ? 'ok' : 'NOT seen'})` : 'solved'}`).join('; ') : 'never caught'}${process.env.CHASE_FAIL && !chaseLog.some(x => x.failed) ? ' (CHASE_FAIL: no catch to fail)' : ''}`);
  const chaseBad = chaseLog.some(x => x.failed && !x.restart) || (process.env.CHASE_FAIL && !chaseLog.some(x => x.failed));
  await b.close(); process.exit(chaseBad || featureFails.length || chipBad.size || errands.some(e => e.status === 'fail') || fails || held.length || recovered.length || (diffCheck.off && diffCheck.off.length) ? 1 : 0);
})();
