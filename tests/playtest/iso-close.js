// A survey, not a pass/fail test (apo110: "isometric door entry is not usable, rendering around buildings is not
// great"): close-up interactions with buildings in the isometric view (Genshin kit), Book 12 at a14 (as reported),
// on a desktop (1920x1080, mouse) and a phone (iPhone 13, taps). PLACES (default changan,meiwu), DEV (desktop|phone|both).
//  Doors: for every open building door (whichever way it faces), from the door's side and the building's other sides, a click or tap
//    on the doorway as drawn, on the middle of the building as drawn, and on the ground before the door; and
//    walking in with the arrow key toward it (the map's north is Up) from the door's side. Each: in, or what happened instead (a line, stopped short, nothing).
//  Drawing: the player stood on a ring of free spots around each building; where his sprite and the building's
//    painted pixels overlap, is he drawn on the right side of it? (in front of its footprint: over it; behind: under it)
// Writes out/iso-close-<dev>.json, crops of the worst cases in out/iso-close/, and a summary per place.
const { chromium, devices } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const PLACES = (process.env.PLACES || 'changan,meiwu').split(','), DEVS = (process.env.DEV || 'both') === 'both' ? ['desktop', 'phone'] : [process.env.DEV];
const AT = process.env.AT || '12-a14', OUT = path.join(__dirname, 'out', 'iso-close'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html?test=1';
  for (const dev of DEVS) {
    const ctx = await b.newContext(dev === 'desktop' ? { viewport: { width: 1920, height: 1080 } } : { ...devices['iPhone 13'] });
    const p = await ctx.newPage();
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
    await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
    await p.goto(BASE + '#/');
    await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/^tk-|gt-progress/.test(k) && k !== 'tk-test') localStorage.removeItem(k);
      localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '12'); localStorage.setItem('tk-kit', 'genshin'); localStorage.setItem('tk-kit-main', 'jade'); });
    await p.evaluate(F => TK.load().then(() => { const w = TK.world(12), ks = w.nodes.map(n => n.key), i = ks.indexOf(F);   // the story as far as the report (setup only)
      for (const [j, n] of w.nodes.entries()) if (j < i && !['side', 'short'].includes(n.role)) TK.markCleared(n.key); TK.markSeen('12:opening'); }), AT);
    await p.goto(BASE + '#/tk/12'); await p.reload();
    for (let i = 0; i < 120 && !(await p.evaluate(() => !!(window.__w && window.__w.player && window.__w.iso))); i++) {
      const c = p.getByText('Cancel', { exact: true }); if (await c.count() && await c.first().isVisible()) await c.first().tap().catch(() => {});
      const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click().catch(() => {});
      await p.waitForTimeout(250); }
    const quiet = async () => { for (let i = 0; i < 40; i++) { const s = await p.evaluate(() => { const w = window.__w; return w && w.player && { busy: w.ui.busy(), cine: !!w.cine, leaving: !!w.leaving }; }); if (s && !s.busy && !s.cine && !s.leaving) return; if (s && s.busy) await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(250); } };
    // where things are drawn: captured each frame after the view has placed them
    const hook = () => p.evaluate(() => { const w = window.__w; if (w.__isoHook) return; w.__isoHook = true;
      w.events.on('prerender', () => { const P = w.player; w.__drawn = { p: { x: P.x, y: P.y, d: P._depth, w: P.displayWidth, h: P.displayHeight, ox: P.originX, oy: P.originY, key: P.texture.key, fr: P.frame.name, fx: P.flipX },
        b: (w.buildings || []).map(b => { const i = b.img; return { x: i.x, y: i.y, d: i._depth, w: i.displayWidth, h: i.displayHeight, ox: i.originX, oy: i.originY, sx: i.scaleX, sy: i.scaleY, key: i.texture.key, fr: i.frame.name, fx: i.flipX, vis: i.visible }; }) }; }); });
    const goPlace = async id => { await p.evaluate(id => { const w = window.__w; w.leaving = false; w.cine = null; w.go(id); }, id); await p.waitForTimeout(1800); await quiet(); await hook(); };
    const screenOf = (x, y) => p.evaluate(([x, y]) => { const w = window.__w, cam = w.cameras.main, cv = w.game.canvas, r = cv.getBoundingClientRect(), k = cv.clientWidth / w.scale.width, v = w.view(x, y);
      const sx = r.left + (v.x - cam.worldView.x) * cam.zoom * k, sy = r.top + (v.y - cam.worldView.y) * cam.zoom * k; return { sx, sy, on: sx > r.left + 4 && sx < r.right - 4 && sy > r.top + 4 && sy < r.bottom - 4 }; }, [x, y]);
    const click = async (sx, sy) => dev === 'desktop' ? p.mouse.click(sx, sy) : p.touchscreen.tap(sx, sy);
    const stand = (x, y) => p.evaluate(([x, y]) => { const w = window.__w, P = w.player; w.walk = null; for (const s of Object.values(w.spots)) s.armed = false; P.body.reset(x, y); P.setVelocity(0); w.trail = Array(60).fill({ x, y, f: 'down' }); const v = w.view(x, y); w.cameras.main.centerOn(v.x, v.y); }, [x, y]);
    const report = { dev, at: AT, places: {} };

    for (const place of PLACES) {
      await goPlace(place);
      const info = await p.evaluate(() => { const w = window.__w, G = w.walkGrid(), C = G.C, ms = w.mapState();
        const free = (x, y) => G.free(Math.floor(x / C), Math.floor(y / C));
        const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx * C, Y = y + dy * C; if (free(X, Y)) return [Math.floor(X / C) * C + C / 2, Math.floor(Y / C) * C + C / 2 + 3]; } return null; };
        const zones = w.solids.getChildren().map(z => z.body).filter(Boolean);
        const foot = b => { const a = b.img.isoAt; if (!a) return null; const z = zones.find(z => a[0] > z.x && a[0] < z.right && a[1] > z.y && a[1] < z.bottom); return z ? [z.x, z.y, z.right, z.bottom] : null; };
        const blds = w.buildings.map((b, i) => ({ i, x: b.x, bottom: b.bottom, foot: foot(b), frame: b.img.frame.name }));
        const OUTV = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] };   // from the doorway, the way out (where he stands before going in)
        const doors = w.exits.filter(e => e.rect.width < 16 && e.rect.height < 16 && e.to && w.placeOpen(e.to) && !(ms && (ms.exits_closed || []).includes(e.to)) && !(e.openTo && !e.openTo.some(c => c.includes(':') ? w.cond(c) : c === w.lead)))
          .map(e => { const cx = e.rect.centerX, cy = e.rect.centerY, v = OUTV[e.side] || [0, 1];
            // its building: the footprint the doorway sits on (or nearest)
            const dist = f => f ? Math.hypot(Math.max(f[0] - cx, 0, cx - f[2]), Math.max(f[1] - cy, 0, cy - f[3])) : 1e9;
            const bi = blds.map(b => b.i).sort((a, c) => dist(blds[a].foot) - dist(blds[c].foot))[0], f = blds[bi] && dist(blds[bi].foot) < 16 ? blds[bi].foot : [cx - 24, cy - 24, cx + 24, cy + 24];
            const mx = (f[0] + f[2]) / 2, my = (f[1] + f[3]) / 2;
            // the four sides of the building: the door's own side first
            const sides = { E: near(f[2] + 22, my), W: near(f[0] - 22, my), S: near(mx, f[3] + 22), N: near(mx, f[1] - 22) };
            const own = v[0] > 0 ? 'E' : v[0] < 0 ? 'W' : v[1] > 0 ? 'S' : 'N';
            const starts = { 'door side': near(cx + v[0] * 30, cy + v[1] * 30) }; for (const k of ['N', 'E', 'S', 'W']) if (k !== own) starts[`${k} side`] = sides[k];
            return { to: e.to, side: e.side, cx, cy, gx: cx + v[0] * 12, gy: cy + v[1] * 12 + 3, key: { N: 'ArrowUp', S: 'ArrowDown', E: 'ArrowRight', W: 'ArrowLeft' }[e.side], bi, starts }; });
        return { blds, doors, C };
      });

      // ---- doors ----
      const doorRows = [];
      for (const d of info.doors) {
        for (const [from, st] of Object.entries(d.starts)) {
          if (!st) { doorRows.push({ to: d.to, from, how: '-', out: 'no free ground on that side' }); continue; }
          for (const how of ['doorway', 'building', 'ground before']) {
            await quiet(); if (await p.evaluate(pl => window.__w.placeId !== pl, place)) await goPlace(place);
            await stand(st[0], st[1]); await p.waitForTimeout(700);
            let tgt;
            if (how === 'doorway') tgt = await screenOf(d.cx, d.cy);
            else if (how === 'ground before') tgt = await screenOf(d.gx, d.gy);
            else tgt = await p.evaluate(([bi]) => { const D = window.__w.__drawn, B = D && D.b[bi]; if (!B) return null; const cv = window.__w.game.canvas, r = cv.getBoundingClientRect(), cam = window.__w.cameras.main, k = cv.clientWidth / window.__w.scale.width;
              const X = B.x + (0.5 - B.ox) * B.w, Y = B.y + (0.55 - B.oy) * B.h; const sx = r.left + (X - cam.worldView.x) * cam.zoom * k, sy = r.top + (Y - cam.worldView.y) * cam.zoom * k; return { sx, sy, on: sx > r.left + 4 && sx < r.right - 4 && sy > r.top + 4 && sy < r.bottom - 4 }; }, [d.bi]);
            if (!tgt || !tgt.on) { doorRows.push({ to: d.to, from, how, out: 'off screen' }); continue; }
            const p0 = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
            await click(tgt.sx, tgt.sy);
            let out = null, line = '', t0 = Date.now();
            for (let i = 0; i < 32 && !out; i++) { await p.waitForTimeout(250);
              const s = await p.evaluate(() => { const w = window.__w, dl = document.querySelector('.town-ui .town-dlg'); return { pl: w.placeId, walk: !!w.walk, busy: w.ui.busy(), line: dl && !dl.hidden ? ((dl.querySelector('.town-en') || dl).textContent || '').trim() : '', P: [w.player.x, w.player.y] }; });
              if (s.pl === d.to) out = 'in'; else if (s.pl !== place) out = `went to ${s.pl}`;
              else if (s.line) { line = s.line; out = 'a line'; }
              else if (!s.walk && i > 3) { const moved = Math.hypot(s.P[0] - p0[0], s.P[1] - p0[1]), left = Math.hypot(s.P[0] - d.cx, s.P[1] - d.cy); out = moved < 2 ? 'nothing happened' : `stopped ${Math.round(left)} px from the door`; } }
            doorRows.push({ to: d.to, side: d.side, from, how, out: out || 'still walking after 8 s', secs: +((Date.now() - t0) / 1000).toFixed(1), line: line.slice(0, 80) });
            if (out !== 'in') await p.screenshot({ path: path.join(OUT, `${dev}-${place}-door-${d.to.replace(/^.*--/, '')}-${from}-${how.replace(/ /g, '')}.png`), clip: { x: Math.max(0, tgt.sx - 200), y: Math.max(0, tgt.sy - 160), width: 400, height: 320 } }).catch(() => {});
            if (out === 'in' || (out && out.startsWith('went'))) await goPlace(place);
            if (out === 'a line') await quiet();
          }
        }
        // the keys, from the front: Up is north on the map; where does it go on the screen, and does it take him in?
        if (d.starts['door side']) {
          await quiet(); if (await p.evaluate(pl => window.__w.placeId !== pl, place)) await goPlace(place);
          await stand(d.starts['door side'][0], d.starts['door side'][1]); await p.waitForTimeout(500); await p.evaluate(() => window.__w.game.canvas.focus && window.__w.game.canvas.focus());
          const a = await screenOf(...(await p.evaluate(() => [window.__w.player.x, window.__w.player.y])));
          await p.keyboard.down(d.key); let inn = false;
          for (let i = 0; i < 16 && !inn; i++) { await p.waitForTimeout(200); inn = await p.evaluate(to => window.__w.placeId === to, d.to); }
          await p.keyboard.up(d.key);
          const z = inn ? null : await screenOf(...(await p.evaluate(() => [window.__w.player.x, window.__w.player.y])));
          doorRows.push({ to: d.to, from: 'door side', how: 'key', key: d.key, side: d.side, out: inn ? 'in' : `not in after 3 s (moved ${z ? Math.round(z.sx - a.sx) : '?'} px right, ${z ? Math.round(a.sy - z.sy) : '?'} px up on screen)` });
          if (inn) await goPlace(place);
        }
      }
      const by = k => doorRows.filter(r => r.how === k), ok = rs => rs.filter(r => r.out === 'in').length;
      console.log(`-- ${dev} ${place}: ${info.doors.length} open building doors`);
      for (const k of ['doorway', 'building', 'ground before', 'key']) console.log(`   ${k.padEnd(14)} in ${ok(by(k))}/${by(k).filter(r => r.out !== 'off screen').length}${by(k).some(r => r.out === 'off screen') ? ` (${by(k).filter(r => r.out === 'off screen').length} off screen)` : ''}`);
      for (const f of ['door side', 'N side', 'E side', 'S side', 'W side']) { const rs = doorRows.filter(r => r.from === f && r.how !== 'key' && r.out !== 'off screen'); console.log(`   from ${f.padEnd(7)} in ${ok(rs)}/${rs.length}`); }
      const tally = {}; for (const r of doorRows) if (r.out !== 'in') { const k = r.out.replace(/\d+ px/, 'N px').replace(/\(moved.*\)/, ''); tally[k] = (tally[k] || 0) + 1; }
      console.log('   not in:', JSON.stringify(tally));

      // ---- drawing order ----
      await quiet(); if (await p.evaluate(pl => window.__w.placeId !== pl, place)) await goPlace(place);
      const drawRows = [];
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
          if (await p.evaluate(() => { const w = window.__w; return w.ui.busy() || w.cine || w.leaving; })) { await quiet(); if (await p.evaluate(pl => window.__w.placeId !== pl, place)) await goPlace(place); }
          await stand(x, y); await p.waitForTimeout(90);
          const r = await p.evaluate(([bi, x0, y0, x1, y1]) => {
            const w = window.__w, D = w.__drawn, P = w.player; if (!D) return null; const B = D.b[bi], Q = D.p, tm = w.textures;
            if (!B || !B.vis) return null;
            const front = P.x >= x1 || P.y >= y1, behind = P.x <= x0 || P.y <= y0; if (front === behind) return { skip: true };
            // his painted pixels that land on the building's painted pixels
            let both = 0;
            for (let i = 1; i < 8; i++) for (let j = 1; j < 10; j++) {
              const sx = Q.x - Q.ox * Q.w + Q.w * i / 8, sy = Q.y - Q.oy * Q.h + Q.h * j / 10;
              let lx = (sx - (Q.x - Q.ox * Q.w)) / (Q.w / tm.getFrame(Q.key, Q.fr).width), ly = (sy - (Q.y - Q.oy * Q.h)) / (Q.h / tm.getFrame(Q.key, Q.fr).height); if (Q.fx) lx = tm.getFrame(Q.key, Q.fr).width - lx;
              if ((tm.getPixelAlpha(Math.floor(lx), Math.floor(ly), Q.key, Q.fr) || 0) < 128) continue;
              const bf = tm.getFrame(B.key, B.fr); let bx = (sx - (B.x - B.ox * B.w)) / Math.abs(B.sx), by = (sy - (B.y - B.oy * B.h)) / Math.abs(B.sy);
              if (bx < 0 || by < 0 || bx >= bf.width || by >= bf.height) continue; if (B.fx) bx = bf.width - 1 - bx;
              if ((tm.getPixelAlpha(Math.floor(bx), Math.floor(by), B.key, B.fr) || 0) >= 128) both++;
            }
            return { front, onTop: Q.d > B.d, both, pd: Math.round(Q.d), bd: Math.round(B.d) };
          }, [bd.i, x0, y0, x1, y1]);
          if (!r || r.skip) continue; n++;
          if (!r.both) continue; over++;
          const wrong = r.front ? !r.onTop : r.onTop;
          if (wrong) { if (r.front) wrongFront++; else wrongBehind++; if (worst.length < 2 || r.both > worst[0].both) { worst.push({ at: [x, y], ...r }); worst.sort((a, c) => c.both - a.both); worst.length = Math.min(worst.length, 2); } }
        }
        for (const [k, wr] of worst.entries()) {
          await stand(...wr.at); await p.waitForTimeout(150); const s = await screenOf(...wr.at);
          if (s.on) await p.screenshot({ path: path.join(OUT, `${dev}-${place}-draw-${bd.frame.replace(/[^\w]+/g, '_')}-${bd.i}-${k}.png`), clip: { x: Math.max(0, s.sx - 150), y: Math.max(0, s.sy - 200), width: 300, height: 260 } }).catch(() => {});
        }
        drawRows.push({ building: bd.frame, i: bd.i, at: [bd.x, bd.bottom], spots: n, overlapping: over, hiddenInFront: wrongFront, overBehind: wrongBehind, worst });
      }
      const sum = k => drawRows.reduce((a, r) => a + r[k], 0);
      console.log(`   drawing: ${drawRows.length} buildings, ${sum('spots')} spots around them, ${sum('overlapping')} where he and the building overlap: ${sum('hiddenInFront')} hidden behind a building he stands in front of, ${sum('overBehind')} drawn over a building he stands behind`);
      for (const r of drawRows.filter(r => r.hiddenInFront + r.overBehind).sort((a, c) => (c.hiddenInFront + c.overBehind) - (a.hiddenInFront + a.overBehind)).slice(0, 6))
        console.log(`     ${r.building} at ${r.at}: ${r.hiddenInFront} hidden in front, ${r.overBehind} over behind, of ${r.overlapping} overlapping`);
      report.places[place] = { doors: doorRows, drawing: drawRows };
    }
    fs.writeFileSync(path.join(__dirname, 'out', `iso-close-${dev}.json`), JSON.stringify(report, null, 1));
    await ctx.close();
  }
  await b.close();
})();
