// Every door in Books 12-14 by a plain walk: in each place, each way out that isn't the map's edge (a doorway, a gate),
// she stands a little outside it on its open side and walks straight in with the arrow key (no tap, no spot, no path):
// it must take her through. The story's locks are set aside for the look (each door open to all, no state shutting it):
// this is about the door's shape against the walls, not when the story opens it. (apo110: the White Gate tower's door
// was inside the tower's solid; the walker had gone in by a tap.) Run with the site served on :8765.
// BOOKS=12,13,14 (default); ONLY=place-id to look at one place.
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
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  const BOOKS = (process.env.BOOKS || '12,13,14').split(',').map(Number), ONLY = process.env.ONLY || '';
  const ready = async () => { for (let i = 0; i < 80; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 800 }).catch(() => {});
      const s = await p.evaluate(() => { const w = window.__w; if (!w || !w.player || w.leaving || w.cine) return 0; if (w.ui.busy()) { w.ui.advance(); return 0; } return 1; }); if (s) break; await p.waitForTimeout(200); } await p.waitForTimeout(300); };
  const goTo = async pl => { await p.evaluate(pl => { const w = window.__w; w.leaving = false; w.cine = null; if (w.placeId !== pl) w.go(pl); }, pl);
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(200); if (await p.evaluate(pl => { const w = window.__w; return w && w.placeId === pl && w.player && !w.leaving; }, pl)) break; }
    await ready();
    // the locks set aside: every way open, to anyone, no map state shutting one; nobody watching or riding at her
    return p.evaluate(() => { const w = window.__w; if (!w.__open) { w.__open = true; w.placeOpen = () => true; const ms = w.mapState.bind(w); w.mapState = () => { const m = ms(); return m ? { ...m, exits_closed: [] } : m; }; }
      w.wades = () => true; for (const e of w.exits) e.openTo = null; for (const g of w.shutGates || []) g.on = false; for (const n of w.npcs) if (n.watch) n.watch.cone = 0.01;
      const B = w.physics.world.bounds; return { states: (w.states || []).map(st => [st.id, st.when || '']), ids: ((w.mapState() || {}).ids || []).join('+'), doors: w.exits.map((e, i) => ({ i, to: e.to, side: e.side, r: [e.rect.x, e.rect.y, e.rect.width, e.rect.height] }))
        .filter(d => d.r[0] > B.x + 2 && d.r[1] > B.y + 2 && d.r[0] + d.r[2] < B.right - 2 && d.r[1] + d.r[3] < B.bottom - 2) }; });   // not the map's edge
  };
  const seen = new Set();
  const pass = async (book, ride, K, only) => {   /* K: the story played up to and through node K (a map state's start); only: the places to look at then */
    await p.goto(BASE + '#/'); await p.evaluate(async ([n, ride, K]) => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test' && k !== 'tk-harness') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', String(n)); localStorage.setItem('gt-username', 'doorwalk'); await TK.load(); TK.markSeen(n + ':opening'); if (K) { for (const nd of TK.world(n).nodes) { TK.markCleared(nd.key); if (nd.key === K) break; } }
      if (ride) { const w = TK.world(n), items = new Set(); for (const sc of Object.values(w.scenes || {})) for (const st of sc.steps || []) if (st[0] === 'gain' || st[0] === 'item') items.add(st[1]);   /* every thing the book gives: its horses ridden */
        const a = TK.ls(WorldItems.KEY); a[n] = [...items]; TK.lsSet(WorldItems.KEY, a); } }, [book, ride, K]);
    await p.goto(BASE + '#/tk/' + book); await p.reload(); await ready();
    const places = await p.evaluate(() => window.__w.region.places.map(x => x.id));
    let n = 0, bad = 0; const how = (ride ? 'riding' : 'on foot'), whens = {};
    for (const pl of places) {
      if ((ONLY && pl !== ONLY) || (only && !only.includes(pl))) continue;
      const { doors, states, ids } = await goTo(pl); for (const [id, wh] of states) if (/^node:/.test(wh)) (whens[wh] = whens[wh] || new Set()).add(pl);
      if (seen.has(`${pl}|${ids}|${ride}`)) continue; seen.add(`${pl}|${ids}|${ride}`);   /* each place once per map state */ if (!(await p.evaluate(pl => window.__w.placeId === pl, pl))) { console.log(`note book ${book}: ${pl} didn't open`); continue; }
      const mounted = await p.evaluate(() => { const w = window.__w; return !!(typeof WorldItems !== 'undefined' && WorldItems.mountedHere && WorldItems.mountedHere(w, w.lead)); });
      if (ride && !mounted) continue;   /* the riding pass: only where he rides (outdoors, with a horse) */
      const arrive = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);   /* where she comes into the place: the door's front must be reachable from here */
      for (const d of doors) {
        // from open ground just outside it (her feet clear of every solid), each way that has some, straight at it
        const starts = await p.evaluate(([d, arrive]) => { const w = window.__w, P = w.player, fb = { x: P.body.x - P.x, y: P.body.y - P.y, w: P.body.width, h: P.body.height };
          const solid = w.solids.getChildren().filter(z => z.body && z.body.enable && !(z.visibleWith && !z.visibleWith.visible)).map(z => z.body);
          const feetFree = (x, y) => { const L = x + fb.x, T0 = y + fb.y, R = L + fb.w, B = T0 + fb.h; return !solid.some(o => L < o.right && R > o.x && T0 < o.bottom && B > o.y); };
          const [rx, ry, rw, rh] = d.r, cx = rx + rw / 2, cy = ry + rh / 2 + 3, out = [];
          for (const [key, dx, dy] of [['up', 0, -1], ['down', 0, 1], ['right', 1, 0], ['left', -1, 0]])   /* walking `key`: she starts on the far side from it */
            for (const back of [24, 32, 44]) for (const off of [0, -3, 3]) {
              const sx = cx - dx * (rw / 2 + back) + (dy ? off : 0), sy = cy - dy * (rh / 2 + back) + (dx ? off : 0);
              if (Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(rx, ry, rw, rh), sx, sy - 3) || !feetFree(sx, sy)) continue;
              if (!w.findPath(arrive[0], arrive[1] - 3, sx, sy - 3)) continue;   /* ground she can walk to from where she came in */
              out.push([key, sx, sy]); break; }
          return [...new Map(out.map(o => [o[0], o])).values()]; }, [d, arrive]);
        let res = starts.length ? null : { in: false, why: 'no open ground before it on any side that she can walk to from where she comes in' };
        for (const [key, sx, sy] of starts) {
          const r = await p.evaluate(async ([sx, sy, key, pl]) => { const w = window.__w, P = w.player; w.walk = null; w.auto = null; P.body.reset(sx, sy); P.setVelocity(0);
            await new Promise(r => setTimeout(r, 250)); const at = [Math.round(P.x), Math.round(P.y)];
            w.auto = key; const t0 = performance.now(); let line = '';
            while (performance.now() - t0 < 2000 && w.placeId === pl && !w.leaving) { await new Promise(r => setTimeout(r, 50)); if (w.ui.busy()) { line = ((document.querySelector('.town-ui .town-dlg:not([hidden])') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80); break; } }
            w.auto = null; const went = w.leaving || w.placeId !== pl;
            return { in: went, from: at, stop: [Math.round(P.x), Math.round(P.y)], line }; }, [sx, sy, key, pl]);
          res = { ...r, key }; if (r.in) break;
          if (await p.evaluate(() => window.__w.ui.busy())) await ready();
        }
        const wet = !res.in && /walk to from where/.test(res.why || '') && await p.evaluate(() => (window.__w.waters || []).some(x => x.on));
        if (wet) { console.log(`note book ${book} ${pl}${ids ? ` (${ids})` : ''}, ${how}: the door to ${d.to} is cut off by the water in this state (as the story has it: the flood)`); continue; }
        n++; if (!res.in) bad++;
        check(res.in, `book ${book} ${pl}${ids ? ` (${ids})` : ''}, ${how}: walking ${res.key || '?'} into the door to ${d.to} (${d.r.map(Math.round).join(',')})${res.in ? '' : `: ${res.why || `stopped at ${res.stop} from ${res.from}${res.line ? `, "${res.line}"` : ''}`}`}`);
        if (res.in) { for (let i = 0; i < 30 && await p.evaluate(() => !window.__w.player || window.__w.leaving); i++) await p.waitForTimeout(150); await goTo(pl); }
      }
    }
    console.log(`book ${book} ${how}${K ? ` at ${K}` : ''}: ${n - bad}/${n} doors walked into`); return whens;
  };
  for (const book of BOOKS) for (const ride of [false, true]) {
    const whens = await pass(book, ride, null, null);   /* the book as it opens; then each map state as the story turns it on */
    for (const [wh, pls] of Object.entries(whens)) await pass(book, ride, `${book}-${wh.slice(5)}`, [...pls]);
  }
  console.log(`door-walk: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
