// Replay from a beat across two devices on one username, against a mocked Apps Script (as sync-devices): A replays
// Book 13 from c17; B, a tab still holding the old save with c17-c22 cleared, plays on and saves. The undone beats must
// stay undone: in the server's copy, on A when it pulls B's save, on B when it comes back to its tab, and on a reload.
// Then clearing c17 again (on B) counts everywhere.
const { chromium } = require(require('child_process').execSync('npm root -g', { env: { ...process.env, NODE_OPTIONS: '' } }).toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  const store = {}; let fails = 0, checked = 0; const check = (ok, w) => { checked++; if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); return ok; };
  const BASE = (process.env.PLAYTEST_URL || 'http://localhost:8765') + '/index.html';
  const dev = async name => { const ctx = await b.newContext({ viewport: { width: 1200, height: 800 } }); const p = await ctx.newPage(); p.on('pageerror', e => console.log(`ERR ${name}`, e.message));
    await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
    await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
    await p.route('https://script.google.com/**', async r => { const req = r.request(), u = new URL(req.url());
      if (req.method() === 'POST') { const j = JSON.parse(req.postData()); if (j.kind === 'progress') store[j.username] = j.data; return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: store[u.searchParams.get('username')] || {} }) }); });
    await p.goto(BASE + '#/tk/13'); await p.waitForTimeout(500);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('gt-username', 'replaysync'); localStorage.setItem('tk-guide', 'off'); localStorage.setItem('tk-book', '13'); });
    return p; };
  const ready = async p => { for (let i = 0; i < 60; i++) { const g = p.locator('.tk-scroll-go'); if (await g.count() && await g.first().isVisible()) await g.first().click({ timeout: 1000 }).catch(() => {});
      if (await p.evaluate(() => !!(window.__w && window.__w.player && !window.__w.leaving))) break; await p.waitForTimeout(250); } await p.waitForTimeout(500); };
  const back = p => p.evaluate(() => { for (const v of ['hidden', 'visible']) { Object.defineProperty(document, 'visibilityState', { value: v, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); } });   // the tab hidden and shown: it pulls
  const beats = p => p.evaluate(() => ({ c16: TK.cleared('13-c16'), c17: TK.cleared('13-c17'), c20: TK.cleared('13-c20'), c22: TK.cleared('13-c22') }));
  const server = () => { const d = store.replaysync, P = d && d.progress || {}, at = P.tkAt || {}, un = P.tkUndo || {}; const on = k => !!(P.tk || {})[k] && !((un[k] || 0) > (at[k] || 0)); return { c16: on('13-c16'), c17: on('13-c17'), c20: on('13-c20'), c22: on('13-c22') }; };

  const A = await dev('A'), B = await dev('B');
  // A has played up to c23 and saved
  await A.evaluate(async () => { await TK.load(); const w = TK.world(13); for (const n of w.nodes) { if (n.key === '13-c23') break; TK.markCleared(n.key); } TK.markCleared('13-start'); TK.markSeen('13:opening');
    TK.lsSet(WorldItems.KEY, { 13: ['horse', 'redhare', 'gold', 'sevenstar', 'weihong'] }); TK.setParty(w, ['caocao', 'chengong']); });
  await A.reload(); await ready(A); await A.waitForTimeout(4500);
  check(server().c22, `A's play is on the server (c22 cleared: ${server().c22})`);
  // B opens: it has the lot; it stays open (a stale tab from here on)
  await B.reload(); await ready(B);
  let bb = await beats(B); check(bb.c17 && bb.c22, `B on load has A's play (${JSON.stringify(bb)})`);
  // A replays from c17
  await A.evaluate(() => WorldTravel.replayPick(TK.world(13))); await A.waitForTimeout(300);
  await A.selectOption('.tk-replay-sel', '13-c17'); await A.locator('.tk-replay button', { hasText: 'Replay' }).last().click(); await A.waitForTimeout(3000); await ready(A);
  let aa = await beats(A); check(aa.c16 && !aa.c17 && !aa.c20 && !aa.c22, `A replays from c17: c17 on undone, c16 kept (${JSON.stringify(aa)})`);
  const partyNow = p => p.evaluate(() => TK.party(TK.world(13)).join(',') + ' / ' + WorldItems.owned(TK.world(13)).sort().join(','));   // the party / the things he has
  const pa0 = await partyNow(A);
  await A.waitForTimeout(4500);
  let sv = server(); check(sv.c16 && !sv.c17 && !sv.c22, `the server's copy has the undo (${JSON.stringify(sv)})`);
  // B, stale, plays something and saves its old copy
  await B.evaluate(() => { TK.markCleared('12-start'); }); await B.waitForTimeout(4500);
  sv = server(); check(sv.c16 && !sv.c17 && !sv.c20 && !sv.c22 && store.replaysync.progress.tk['12-start'], `B's stale save doesn't bring them back on the server (${JSON.stringify(sv)}; B's own play kept: ${!!store.replaysync.progress.tk['12-start']})`);
  const pB = await partyNow(B);
  // A pulls B's save
  await back(A); await A.waitForTimeout(3000); aa = await beats(A);
  const pa1 = await partyNow(A);
  check(pa0 === pa1 && /^caocao \//.test(pa1) && !/weihong/.test(pa1), `the party and possessions at c17 (Cao Cao alone; no Wei Hong's fortune, c23's) stay as the replay left them through B's stale save (A after the replay: ${pa0}; B's stale tab: ${pB}; A after pulling B's save: ${pa1})`);
  check(!aa.c17 && !aa.c20 && aa.c16 && await A.evaluate(() => TK.cleared('12-start')), `A pulls B's save: B's play arrives, the replayed beats stay undone (${JSON.stringify(aa)})`);
  // B comes back to its tab: it takes the undo
  await back(B); await B.waitForTimeout(3000); bb = await beats(B);
  check(!bb.c17 && !bb.c20 && bb.c16, `B, back on its tab, takes the undo (${JSON.stringify(bb)})`);
  await B.reload(); await ready(B); bb = await beats(B);
  check(!bb.c17 && !bb.c22 && bb.c16, `and on a reload too (${JSON.stringify(bb)})`);
  // and both stand at c17 the same: in Luoyang, the party and the crowd as the story has them there
  const where = p => p.evaluate(() => { const w = window.__w; return { place: w && w.placeId, party: TK.party(TK.world(13)).join(','), crowd: w && w.st ? w.st.crowd || 0 : null, followers: w ? w.followers.length : null, next: w && w.nextMain() && w.nextMain().node }; });
  await A.reload(); await ready(A);
  const wa = await where(A), wb = await where(B);
  check(JSON.stringify(wa) === JSON.stringify(wb) && wa.place === 'luoyang' && wa.party === 'caocao' && wa.next === '13-c17', `A and B both stand at c17 alike (A ${JSON.stringify(wa)}; B ${JSON.stringify(wb)})`);
  // clearing c17 again (on B) counts, there and on A
  await B.evaluate(() => TK.markCleared('13-c17')); await B.waitForTimeout(4500); await back(A); await A.waitForTimeout(3000);
  check(await B.evaluate(() => TK.cleared('13-c17')) && server().c17 && await A.evaluate(() => TK.cleared('13-c17')) && !(await A.evaluate(() => TK.cleared('13-c20'))), 'c17 cleared again on B counts on the server and on A (c20 still undone)');
  console.log(`replay-devices: ${checked - fails}/${checked}`); await b.close(); process.exit(fails ? 1 : 0);
})();
