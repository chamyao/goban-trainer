// A survey, not a pass/fail test (apo110: "isometric door entry is not usable, rendering around buildings is not
// great"): close-up interactions with buildings, in the isometric kit (KIT=genshin, default) or the flat one (KIT=jade)
// for comparison; Book 12 at a14 (as reported); DEV desktop (1920x1080, mouse) | phone (iPhone 13, taps) | both.
// PLACES (default changan,liangzhou,meiwu): every door in Chang'an, the first SAMPLE (3) elsewhere.
//  1 Doors: for each open building door (whichever way it faces), from the door's side and the building's other
//    sides: a click or tap on the doorway as drawn, on the building as drawn, on the ground before the door; and
//    the arrow key toward it (the map's north is Up) from the door's side. In, or what happened instead.
//  2 Drawing: the player stood on a ring of free spots around each building, and everyone else where they stand:
//    where a figure's painted pixels and the building's overlap, is it drawn on the right side? (in front of the
//    footprint: over it; behind it: under it)
//  3 Close by: a click or tap on each person standing within 64 px of a building (do they talk?); story spots whose
//    marker lies under a building drawn over it; the walk target of each spot and door inside a building.
// Writes out/iso-close-<kit>-<dev>.json and crops of each case in out/iso-close/.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const PLACES = (process.env.PLACES || 'changan,liangzhou,meiwu').split(','), DEVS = (process.env.DEV || 'both') === 'both' ? ['desktop', 'phone'] : [process.env.DEV];
const KIT = process.env.KIT || 'genshin', SAMPLE = +(process.env.SAMPLE || 3), PARTS = (process.env.PARTS || 'doors,drawing,close').split(',');
const AT = process.env.AT || '12-a14', OUT = path.join(__dirname, 'out', 'iso-close'); fs.mkdirSync(OUT, { recursive: true });
const slug = s => String(s).replace(/^.*--/, '').replace(/[^\w]+/g, '_');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  for (const dev of DEVS) {
    const ctx = await b.newContext(dev === 'desktop' ? { viewport: { width: 1920, height: 1080 } } : { ...devices['iPhone 13'] });
    const p = await ctx.newPage();
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
    await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
    await p.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"data":null}' }));   // the save sync: nothing to pull
    await p.goto(BASE + '#/');
    await p.evaluate(K => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
      localStorage.setItem('gt-username', 'playtest-survey');   // (no username: a sign-in box over the page)
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '12'); localStorage.setItem('tk-kit', K); localStorage.setItem('tk-kit-main', 'jade'); }, KIT);
    await p.evaluate(F => TK.load().then(() => { const w = TK.world(12), ks = w.nodes.map(n => n.key), i = ks.indexOf(F);   // the story as far as the report (setup only)
      for (const [j, n] of w.nodes.entries()) if (j < i && !['side', 'short'].includes(n.role)) TK.markCleared(n.key); TK.markSeen('12:opening'); }), AT);
    await p.goto(BASE + '#/tk/12'); await p.reload();
    for (let i = 0; i < 120 && !(await p.evaluate(() => !!(window.__w && window.__w.player))); i++) {
      const c = p.getByText('Cancel', { exact: true }); if (await c.count() && await c.first().isVisible()) await c.first().click().catch(() => {});
      const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click().catch(() => {});
      await p.waitForTimeout(250); }
    const quiet = async () => { for (let i = 0; i < 40; i++) { const s = await p.evaluate(() => { const w = window.__w; return w && w.player && { busy: w.ui.busy(), cine: !!w.cine, leaving: !!w.leaving }; }); if (s && !s.busy && !s.cine && !s.leaving) return; if (s && s.busy) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); } };
    // where things are drawn: captured each frame after the view has placed them
    const hook = () => p.evaluate(() => { const w = window.__w; if (w.__isoHook) return; w.__isoHook = true;
      const rec = o => ({ x: o.x, y: o.y, d: o._depth, w: o.displayWidth, h: o.displayHeight, ox: o.originX, oy: o.originY, sx: o.scaleX, sy: o.scaleY, key: o.texture.key, fr: o.frame.name, fx: o.flipX, vis: o.visible });
      w.events.on('prerender', () => { w.__drawn = { p: rec(w.player), n: w.npcs.map(n => rec(n.spr)), b: (w.buildings || []).map(b => rec(b.img)) }; }); });
    const goPlace = async id => { if (await p.evaluate(id => window.__w.placeId === id, id)) return; await p.evaluate(id => { const w = window.__w; w.leaving = false; w.cine = null; w.go(id); }, id); await p.waitForTimeout(1800); await quiet(); await hook(); };
    const back = async place => { await quiet(); if (await p.evaluate(pl => window.__w.placeId !== pl, place)) await goPlace(place); };
    const screenOf = (x, y) => p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width, v = w.view(x, y);
      const sx = r.left + (v.x - cam.worldView.x) * cam.zoom * k, sy = r.top + (v.y - cam.worldView.y) * cam.zoom * k; return { sx, sy, on: sx > r.left + 4 && sx < r.right - 4 && sy > r.top + 60 && sy < r.bottom - 4 }; }, [x, y]);
    const drawnOf = (which, i, fy = .55) => p.evaluate(([which, i, fy]) => { const w = window.__w, D = w.__drawn, B = D && (which === 'p' ? D.p : D[which][i]); if (!B) return null; const cv = w.game.canvas, r = cv.getBoundingClientRect(), cam = w.cameras.main, k = cv.clientWidth / w.scale.width;
      const X = B.x + (0.5 - B.ox) * B.w, Y = B.y + (fy - B.oy) * B.h; const sx = r.left + (X - cam.worldView.x) * cam.zoom * k, sy = r.top + (Y - cam.worldView.y) * cam.zoom * k; return { sx, sy, on: sx > r.left + 4 && sx < r.right - 4 && sy > r.top + 60 && sy < r.bottom - 4 }; }, [which, i, fy]);
    const click = async (sx, sy) => dev === 'desktop' ? p.mouse.click(sx, sy) : p.touchscreen.tap(sx, sy);
    const stand = (x, y) => p.evaluate(([x, y]) => { const w = window.__w, P = w.player; w.walk = null; for (const s of Object.values(w.spots)) s.armed = false; P.body.reset(x, y); P.setVelocity(0); w.trail = Array(60).fill({ x, y, f: 'down' }); const v = w.view(x, y); w.cameras.main.centerOn(v.x, v.y); }, [x, y]);
    const shot = (name, s, wd = 360, ht = 300) => s && s.on ? p.screenshot({ path: path.join(OUT, `${KIT}-${dev}-${name}.png`), clip: { x: Math.max(0, s.sx - wd / 2), y: Math.max(0, s.sy - ht * .6), width: wd, height: ht } }).catch(() => {}) : null;
    // what a click or tap did, within 6 s: in (a place), a line, a walk that stopped short, or nothing
    const outcome = async (place, to, p0, door) => { let out = null, line = '';
      for (let i = 0; i < 24 && !out; i++) { await p.waitForTimeout(250);
        const s = await p.evaluate(() => { const w = window.__w, dl = document.querySelector('.town-ui .town-dlg'); return { pl: w.placeId, walk: !!w.walk, line: dl && !dl.hidden ? ((dl.querySelector('.town-en') || dl).textContent || '').trim() : '', P: [w.player.x, w.player.y] }; });
        if (to && s.pl === to) out = 'in'; else if (s.pl !== place) out = `went to ${s.pl}`;
        else if (s.line) { line = s.line; out = 'a line'; }
        else if (!s.walk && i > 3) { const moved = Math.hypot(s.P[0] - p0[0], s.P[1] - p0[1]); out = moved < 2 ? 'nothing happened' : door ? `walked ${Math.round(moved)} px, stopped ${Math.round(Math.hypot(s.P[0] - door[0], s.P[1] - door[1]))} px from the door` : `walked ${Math.round(moved)} px, no line`; } }
      return { out: out || 'still walking after 6 s', line: line.slice(0, 90) }; };
    const report = { kit: KIT, dev, at: AT, places: {} };

    for (const place of PLACES) {
      await goPlace(place); await hook();
      const info = await p.evaluate(() => { const w = window.__w, G = w.walkGrid(), C = G.C, ms = w.mapState();
        const free = (x, y) => G.free(Math.floor(x / C), Math.floor((y - 3) / C));
        const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx * C, Y = y + dy * C; if (free(X, Y + 3)) return [Math.floor(X / C) * C + C / 2, Math.floor(Y / C) * C + C / 2 + 3]; } return null; };
        const zones = w.solids.getChildren().map(z => z.body).filter(Boolean);
        const foot = b => { const a = b.img.isoAt, cx = a ? a[0] : b.x, cy = a ? a[1] : b.bottom - 8; const z = zones.find(z => cx > z.x && cx < z.right && cy > z.y && cy < z.bottom); return z ? [z.x, z.y, z.right, z.bottom] : null; };
        const blds = w.buildings.map((b, i) => ({ i, x: b.x, bottom: b.bottom, foot: foot(b), frame: b.img.frame.name }));
        const OUTV = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] };   // from the doorway, the way out (where he stands before going in)
        const dist = (f, x, y) => f ? Math.hypot(Math.max(f[0] - x, 0, x - f[2]), Math.max(f[1] - y, 0, y - f[3])) : 1e9;
        const doors = w.exits.filter(e => e.rect.width < 16 && e.rect.height < 16 && e.to && w.placeOpen(e.to) && !(ms && (ms.exits_closed || []).includes(e.to)) && !(e.openTo && !e.openTo.some(c => c.includes(':') ? w.cond(c) : c === w.lead)))
          .map(e => { const cx = e.rect.centerX, cy = e.rect.centerY, v = OUTV[e.side] || [0, 1];
            const bi = blds.map(b => b.i).sort((a, c) => dist(blds[a].foot, cx, cy) - dist(blds[c].foot, cx, cy))[0], f = blds[bi] && dist(blds[bi].foot, cx, cy) < 16 ? blds[bi].foot : [cx - 24, cy - 24, cx + 24, cy + 24];
            const mx = (f[0] + f[2]) / 2, my = (f[1] + f[3]) / 2, sides = { E: near(f[2] + 22, my), W: near(f[0] - 22, my), S: near(mx, f[3] + 22), N: near(mx, f[1] - 22) };
            const own = v[0] > 0 ? 'E' : v[0] < 0 ? 'W' : v[1] > 0 ? 'S' : 'N';
            const starts = { 'door side': near(cx + v[0] * 30, cy + v[1] * 30) }; for (const k of ['N', 'E', 'S', 'W']) if (k !== own) starts[`${k} side`] = sides[k];
            const tx = cx + v[0] * (e.rect.width / 2 + 10), ty = cy + v[1] * (e.rect.height / 2 + 8) + 3;   // where a tap on it walks him first (tapAt)
            return { to: e.to, side: e.side, cx, cy, gx: cx + v[0] * 12, gy: cy + v[1] * 12 + 3, key: { N: 'ArrowUp', S: 'ArrowDown', E: 'ArrowRight', W: 'ArrowLeft' }[e.side], bi, starts, approach: [tx, ty], approachFree: free(tx, ty) }; });
        const npcs = w.npcs.map((n, i) => ({ i, id: n.id || n.who, x: n.spr.x, y: n.spr.y, vis: n.spr.visible, near: blds.filter(b => dist(b.foot, n.spr.x, n.spr.y) < 64).map(b => b.i), stand: near(n.spr.x + 40, n.spr.y + 30) || near(n.spr.x - 40, n.spr.y + 30) }));
        const spots = Object.entries(w.spots).map(([k, s]) => ({ k, x: s.x, y: s.y, inside: blds.filter(b => dist(b.foot, s.x, s.y + 12) === 0).map(b => b.frame), targetFree: free(s.x, s.y + 12) }));
        return { blds, doors, npcs, spots };
      });
      const R = report.places[place] = {};
      console.log(`   (${info.blds.length} buildings, ${info.blds.filter(b => b.foot).length} with a footprint; ${info.npcs.filter(n => n.vis).length} people about, ${info.npcs.filter(n => n.vis && n.near.length).length} within 64 px of a building)`);

      // ---- 1 doors ----
      if (PARTS.includes('doors')) {
        const rows = R.doors = [], doors = place === 'changan' ? info.doors : info.doors.slice(0, SAMPLE);
        for (const d of doors) {
          for (const [from, st] of Object.entries(d.starts)) {
            if (!st) { rows.push({ to: d.to, side: d.side, from, how: '-', out: 'no free ground on that side' }); continue; }
            for (const how of ['doorway', 'building', 'ground before']) {
              await back(place); await stand(st[0], st[1]); await p.waitForTimeout(600);
              const tgt = how === 'doorway' ? await screenOf(d.cx, d.cy) : how === 'ground before' ? await screenOf(d.gx, d.gy) : await drawnOf('b', d.bi);
              if (!tgt || !tgt.on) { rows.push({ to: d.to, side: d.side, from, how, out: 'off screen' }); continue; }
              const p0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
              await click(tgt.sx, tgt.sy);
              const o = await outcome(place, d.to, p0, [d.cx, d.cy]);
              rows.push({ to: d.to, side: d.side, from, how, ...o, start: st });
              if (o.out !== 'in') await shot(`${place}-door-${slug(d.to)}-${from.replace(/ /g, '')}-${how.replace(/ /g, '')}`, tgt);
            }
          }
          if (d.starts['door side']) {   // the key toward the door, from its side
            await back(place); const st = d.starts['door side']; await stand(st[0], st[1]); await p.waitForTimeout(500);
            await p.evaluate(() => window.__w.game.canvas.focus && window.__w.game.canvas.focus());
            const a = await screenOf(st[0], st[1]); await p.keyboard.down(d.key); let inn = false;
            for (let i = 0; i < 14 && !inn; i++) { await p.waitForTimeout(200); inn = await p.evaluate(to => window.__w.placeId === to, d.to); }
            await p.keyboard.up(d.key);
            const z = inn ? null : await screenOf(...(await p.evaluate(() => [window.__w.player.x, window.__w.player.y])));
            rows.push({ to: d.to, side: d.side, from: 'door side', how: 'key', key: d.key, out: inn ? 'in' : 'not in after 3 s', screen: z ? [Math.round(z.sx - a.sx), Math.round(a.sy - z.sy)] : null });
            if (!inn) await shot(`${place}-door-${slug(d.to)}-key`, z);
          }
          rows.push({ to: d.to, side: d.side, how: 'approach point', out: d.approachFree ? 'free' : 'inside a wall or footprint', at: d.approach });
        }
        const by = k => rows.filter(r => r.how === k && r.out !== 'off screen'), ok = rs => rs.filter(r => r.out === 'in').length;
        console.log(`-- ${KIT} ${dev} ${place}: ${doors.length} open building doors (of ${info.doors.length}), facing ${[...new Set(doors.map(d => d.side))].join(' ')}`);
        for (const k of ['doorway', 'building', 'ground before', 'key']) console.log(`   ${k.padEnd(14)} in ${ok(by(k))}/${by(k).length}${rows.some(r => r.how === k && r.out === 'off screen') ? ` (${rows.filter(r => r.how === k && r.out === 'off screen').length} off screen)` : ''}`);
        for (const f of ['door side', 'N side', 'E side', 'S side', 'W side']) { const rs = rows.filter(r => r.from === f && !['key', 'approach point'].includes(r.how) && r.out !== 'off screen' && r.how !== '-'); if (rs.length) console.log(`   from ${f.padEnd(9)} in ${ok(rs)}/${rs.length}`); }
        for (const s of ['N', 'S', 'E', 'W']) { const rs = rows.filter(r => r.side === s && !['key', 'approach point'].includes(r.how) && r.out !== 'off screen' && r.how !== '-'); if (rs.length) console.log(`   doors facing ${s}: in ${ok(rs)}/${rs.length}`); }
        const tally = {}; for (const r of rows) if (r.out !== 'in' && r.how !== 'approach point') { const k = `${r.how}: ${r.out.replace(/\d+ px/g, 'N px')}`; tally[k] = (tally[k] || 0) + 1; }
        console.log('   not in:', JSON.stringify(tally));
        const bad = rows.filter(r => r.how === 'approach point' && r.out !== 'free'); if (bad.length) console.log(`   approach point inside a wall: ${bad.map(r => slug(r.to)).join(', ')}`);
      }

      // ---- 2 drawing ----
      if (PARTS.includes('drawing')) {
        await back(place);
        const overlap = (fig, bi, x0, y0, x1, y1, fx, fy) => p.evaluate(([fig, bi, x0, y0, x1, y1, fx, fy]) => {
          const w = window.__w, D = w.__drawn; if (!D) return null; const B = D.b[bi], Q = fig === 'p' ? D.p : D.n[fig], tm = w.textures;
          if (!B || !B.vis || !Q || !Q.vis) return null;
          const front = fx >= x1 || fy >= y1, behind = fx <= x0 || fy <= y0; if (front === behind) return { skip: true };
          let both = 0; const qf = tm.getFrame(Q.key, Q.fr), bf = tm.getFrame(B.key, B.fr);
          for (let i = 1; i < 8; i++) for (let j = 1; j < 12; j++) {
            const sx = Q.x - Q.ox * Q.w + Q.w * i / 8, sy = Q.y - Q.oy * Q.h + Q.h * j / 12;
            let lx = (sx - (Q.x - Q.ox * Q.w)) / Math.abs(Q.sx), ly = (sy - (Q.y - Q.oy * Q.h)) / Math.abs(Q.sy); if (Q.fx) lx = qf.width - 1 - lx;
            if ((tm.getPixelAlpha(Math.floor(lx), Math.floor(ly), Q.key, Q.fr) || 0) < 128) continue;
            let bx = (sx - (B.x - B.ox * B.w)) / Math.abs(B.sx), by = (sy - (B.y - B.oy * B.h)) / Math.abs(B.sy);
            if (bx < 0 || by < 0 || bx >= bf.width || by >= bf.height) continue; if (B.fx) bx = bf.width - 1 - bx;
            if ((tm.getPixelAlpha(Math.floor(bx), Math.floor(by), B.key, B.fr) || 0) >= 128) both++;
          }
          return { front, onTop: Q.d > B.d, both };
        }, [fig, bi, x0, y0, x1, y1, fx, fy]);
        const rows = R.drawing = [];
        for (const bd of info.blds) {
          if (!bd.foot) continue;
          const [x0, y0, x1, y1] = bd.foot, ring = [];
          for (const off of [6, 14]) {
            for (let x = x0 - off; x <= x1 + off; x += 8) ring.push([x, y0 - off], [x, y1 + off]);
            for (let y = y0 - off + 8; y <= y1 + off - 8; y += 8) ring.push([x0 - off, y], [x1 + off, y]);
          }
          const free = await p.evaluate(pts => { const w = window.__w, G = w.walkGrid(), C = G.C; return pts.filter(([x, y]) => G.free(Math.floor(x / C), Math.floor((y - 3) / C))); }, ring);
          let n = 0, over = 0, wrongFront = 0, wrongBehind = 0; const worst = [];
          for (const [x, y] of free) {
            if (await p.evaluate(() => { const w = window.__w; return w.ui.busy() || !!w.cine || !!w.leaving; })) await back(place);
            await stand(x, y); await p.waitForTimeout(80);
            const r = await overlap('p', bd.i, x0, y0, x1, y1, x, y);
            if (!r || r.skip) continue; n++; if (!r.both) continue; over++;
            if (r.front ? !r.onTop : r.onTop) { if (r.front) wrongFront++; else wrongBehind++; worst.push({ at: [x, y], front: r.front, both: r.both }); }
          }
          worst.sort((a, c) => c.both - a.both);
          for (const [k, wr] of worst.slice(0, 2).entries()) { await stand(...wr.at); await p.waitForTimeout(150); await shot(`${place}-draw-${slug(bd.frame)}-${bd.i}-${wr.front ? 'hidden' : 'over'}-${k}`, await screenOf(...wr.at), 300, 260); }
          rows.push({ building: bd.frame, i: bd.i, at: [bd.x, bd.bottom], foot: bd.foot, spots: n, overlapping: over, hiddenInFront: wrongFront, overBehind: wrongBehind, worst: worst.slice(0, 4) });
        }
        // everyone else, where they stand
        const npcRows = R.npcDrawing = [];
        for (const n of info.npcs) { if (!n.vis) continue;
          for (const bd of info.blds) { if (!bd.foot) continue; const [x0, y0, x1, y1] = bd.foot;
            const r = await overlap(n.i, bd.i, x0, y0, x1, y1, n.x, n.y);
            if (r && !r.skip && r.both && (r.front ? !r.onTop : r.onTop)) { npcRows.push({ npc: n.id, at: [Math.round(n.x), Math.round(n.y)], building: bd.frame, bi: bd.i, front: r.front, both: r.both }); await stand(n.x + 30, n.y + 30); await p.waitForTimeout(150); await shot(`${place}-draw-npc-${slug(n.id)}-${slug(bd.frame)}`, await screenOf(n.x, n.y), 300, 260); } } }
        const sum = k => rows.reduce((a, r) => a + r[k], 0);
        console.log(`   drawing: ${rows.length} buildings, ${sum('spots')} spots around them, ${sum('overlapping')} where he and a building overlap: ${sum('hiddenInFront')} hidden by a building he stands in front of, ${sum('overBehind')} drawn over a building he stands behind; people: ${npcRows.length} drawn on the wrong side${npcRows.length ? ` (${npcRows.map(r => `${r.npc}@${r.at}`).join(', ')})` : ''}`);
        for (const r of rows.filter(r => r.hiddenInFront + r.overBehind).sort((a, c) => (c.hiddenInFront + c.overBehind) - (a.hiddenInFront + a.overBehind)).slice(0, 8))
          console.log(`     ${r.building} at ${r.at}: ${r.hiddenInFront} hidden in front, ${r.overBehind} over behind, of ${r.overlapping} overlapping`);
      }

      // ---- 3 close by ----
      if (PARTS.includes('close')) {
        const rows = R.close = [];
        for (const n of info.npcs.filter(n => n.vis && n.near.length && n.stand)) {
          await back(place); await stand(...n.stand); await p.waitForTimeout(600);
          const live = await p.evaluate(i => { const s = window.__w.npcs[i].spr; return s.visible ? [s.x, s.y] : null; }, n.i); if (!live) continue;
          const tgt = await drawnOf('n', n.i, .5); if (!tgt || !tgt.on) { rows.push({ what: 'talk', npc: n.id, out: 'off screen' }); continue; }
          const p0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
          await click(tgt.sx, tgt.sy); const o = await outcome(place, null, p0, null);
          rows.push({ what: 'talk', npc: n.id, at: [Math.round(n.x), Math.round(n.y)], by: n.near.map(i => info.blds[i].frame), ...o });
          if (o.out !== 'a line') await shot(`${place}-talk-${slug(n.id)}`, tgt);
        }
        // story spots: the marker under a building drawn over it; the walk target inside a building
        for (const s of info.spots) {
          const under = await p.evaluate(([x, y]) => { const w = window.__w, D = w.__drawn, tm = w.textures, v = w.view(x, y), dep = v.y; if (!D) return null;
            for (const [i, B] of D.b.entries()) { if (!B.vis || B.d <= dep) continue; const bf = tm.getFrame(B.key, B.fr); let bx = (v.x - (B.x - B.ox * B.w)) / Math.abs(B.sx), by = (v.y - (B.y - B.oy * B.h)) / Math.abs(B.sy);
              if (bx < 0 || by < 0 || bx >= bf.width || by >= bf.height) continue; if (B.fx) bx = bf.width - 1 - bx; if ((tm.getPixelAlpha(Math.floor(bx), Math.floor(by), B.key, B.fr) || 0) >= 128) return B.fr; } return null; }, [s.x, s.y]);
          if (under || s.inside.length || !s.targetFree) { rows.push({ what: 'spot', spot: s.k, at: [s.x, s.y], under, walkTargetInside: s.inside, targetFree: s.targetFree });
            await stand(s.x + 24, s.y + 40); await p.waitForTimeout(200); await shot(`${place}-spot-${slug(s.k)}`, await screenOf(s.x, s.y), 300, 260); }
        }
        const talks = rows.filter(r => r.what === 'talk' && r.out !== 'off screen');
        console.log(`   close by: ${talks.filter(r => r.out === 'a line').length}/${talks.length} people beside buildings talk on a ${dev === 'desktop' ? 'click' : 'tap'}${talks.some(r => r.out !== 'a line') ? `; not: ${talks.filter(r => r.out !== 'a line').map(r => `${r.npc} (${r.out})`).join(', ')}` : ''}`);
        const sp = rows.filter(r => r.what === 'spot'); if (sp.length) console.log(`   spots: ${sp.map(r => `${r.spot}${r.under ? ' under ' + r.under : ''}${r.walkTargetInside.length ? ' target inside ' + r.walkTargetInside[0] : ''}${r.targetFree ? '' : ' target not walkable'}`).join('; ')}`);
      }
    }
    fs.writeFileSync(path.join(__dirname, 'out', `iso-close-${KIT}-${dev}.json`), JSON.stringify(report, null, 1));
    await ctx.close();
  }
  await b.close();
})();
