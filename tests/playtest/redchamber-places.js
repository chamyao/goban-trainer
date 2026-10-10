// Red Chamber, Book 1 (world RC_WORLD, default 20): the places' mechanics, walked in the engine.
//   1. Part 1 keeps Daiyu inside: walking into the back gate or the west side gate, she stays in the house.
//   2. Rooms wait to be read: in Grandmother Jia's rooms with d2 open, coming in doesn't start the scene; the cue people
//      are there and say their lines; a tap on the spot starts d2.
//   3. Sister Feng's door: with d6a open, walking up the passage to the screen wall starts d6a.
//   4. Part 2 has one way in: before g3 the street's back gate keeps her out; after it, walking into it takes her
//      inside the back gate, and on through the half-size gate to Xifeng's door.
//   5. The carriage: d3's handoff to Lady Xing's lands her inside her gate; d4's back lands her inside the west side gate.
//   6. The road challengers stand in their windows: the maid on the steps (d2 open), the nurse in the covered walk (d5).
// The layouts are proved in redchamber/book1/proofs.py; this checks the engine plays them that way. Run it with the
// world registered (redchamber/tools/build_places.sh --playtest does that, then puts everything back).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = process.env.PLAYTEST_URL || 'http://localhost:8765';
const N = process.env.RC_WORLD || '20';
let fails = 0;
const check = (ok, what) => { fails += !ok; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); };

async function open(b, upto, place, party, from) {   // the story cleared up to (not including) `upto`, standing in `place`
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: require('path').join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  // until Integration lists the world as built (tk-world.js WorldData.has), say so for this page
  await p.route('**/tk-world.js*', async r => {
    const res = await r.fetch(), js = await res.text();
    r.fulfill({ response: res, body: js.includes(`n === ${N}`) ? js : js.replace('|| n === 90;', `|| n === 90 || n === ${N};`) });
  });
  await p.goto(`${URL}/index.html?test=1#/tk/${N}`); await p.waitForTimeout(800);
  await p.evaluate(async ([N, upto, place, party]) => {
    localStorage.setItem('tk-guide', 'off'); await TK.load();
    for (const n of TK.world(+N).nodes) { if (n.key === `${N}-${upto}`) break; TK.markCleared(n.key); }
    localStorage.setItem(`tk-world-${N}`, JSON.stringify({ place, party }));
  }, [N, upto, place, party]);
  await p.reload();
  await ready(p, place);
  if (from !== undefined) {   // arrive as if from that place (a handoff's "from", or a door)
    await p.evaluate(([place, from]) => window.__w.scene.restart({ place, from }), [place, from]);
    await p.waitForTimeout(600); await ready(p, place);
  }
  return p;
}
async function ready(p, place) {
  for (let i = 0; i < 80; i++) {
    const g = p.locator('.tk-scroll-go'); if (await g.count()) await g.first().click().catch(() => {});
    if (await p.evaluate(pl => !!(window.__w && window.__w.player && !window.__w.leaving && window.__w.npcs && window.__w.placeId === pl), place)) break;
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1200); await advance(p);
}
async function advance(p) {   // through whatever is being said
  for (let i = 0; i < 30; i++) {
    if (!await p.evaluate(() => window.__w && window.__w.ui.busy())) break;
    await p.evaluate(() => window.__w.ui.advance()); await p.waitForTimeout(150);
  }
}
// walk her into an exit: stand a tile inside it and hold the key toward it
async function walkInto(p, to, key, ms = 1600) {
  const e = await p.evaluate(to => { const w = window.__w, e = w.exits.find(e => e.to === to); return e && { x: e.rect.x, y: e.rect.y, w: e.rect.width, h: e.rect.height }; }, to);
  if (!e) return null;
  const dy = { ArrowUp: 1, ArrowDown: -1 }[key] || 0, dx = { ArrowLeft: 1, ArrowRight: -1 }[key] || 0;
  const [x, y] = [e.x + e.w / 2 + dx * 20, e.y + e.h / 2 + dy * 24];
  await p.evaluate(([x, y]) => window.__w.player.body.reset(x, y), [x, y]);
  const put = await p.evaluate(() => [window.__w.player.x, window.__w.player.y]);
  if (!(Math.abs(put[0] - x) < 2 && Math.abs(put[1] - y) < 2)) return 'not put at the exit';
  await p.keyboard.down(key); await p.waitForTimeout(ms); await p.keyboard.up(key);
  await p.waitForTimeout(900); await advance(p);
  return await p.evaluate(() => window.__w.placeId);
}
const near = (p, sid) => p.evaluate(s => { const w = window.__w, sp = w.spots[s] || Object.values(w.spots).find(x => x.node && x.node.endsWith('-' + s)); return sp ? Math.round(Math.hypot(w.player.x - sp.x, w.player.y - sp.y)) : 1e9; }, sid);

async function part1Inside(b) {
  const p = await open(b, 'd2', 'the-rong-mansion', ['daiyu']);
  check(await p.evaluate(() => window.__w.exits.some(e => e.to === 'ning-rong-street')), 'Part 1: the house has its back gate to the street');
  const at = await walkInto(p, 'ning-rong-street', 'ArrowUp');
  check(at === 'the-rong-mansion', `Part 1: walking into the back gate, she stays in the house (${at})`);
  await p.context().close();
}

async function roomsWait(b) {
  const p = await open(b, 'd2', 'the-rong-mansion--jm-rooms', ['daiyu']);
  await p.waitForTimeout(1500);
  const s = await p.evaluate(N => ({ cine: !!(window.__w.cine || window.__w.ui.busy()), done: TK.cleared(`${N}-d2`),
                                     cues: window.__w.npcs.filter(n => n.spr.visible && /^hero\./.test(n.kind || '') || n.who && n.spr.visible).map(n => n.who) }), N);
  check(!s.cine, 'rooms wait: coming into Grandmother Jia\'s rooms with d2 open doesn\'t start the scene');
  check(s.cues.includes('jmmaid') && s.cues.includes('laomama'), `rooms wait: the cue people are there (${s.cues.join(', ')})`);
  const line = await p.evaluate(() => { const w = window.__w, n = w.npcs.find(n => n.who === 'laomama' && n.spr.visible); w.player.body.reset(n.spr.x, n.spr.y + 18); w.player.facing = 'up'; w.act({ kind: 'npc', n }); return true; });
  await p.waitForTimeout(2500);
  const said = await p.evaluate(() => { const d = document.querySelector('.town-dlg'); return d && !d.hidden ? d.querySelector('.town-en').textContent : ''; });
  check(line && /silver-haired one is the old lady/.test(said), `rooms wait: the old nurse gives her cue ("${said.slice(0, 60)}")`);
  await advance(p);
  await p.evaluate(() => { const w = window.__w, k = Object.keys(w.spots).find(k => (w.spots[k].node || '').endsWith('-d2')), s = w.spots[k]; w.player.body.reset(s.x, s.y + 12); w.player.facing = 'up'; w.act({ kind: 'spot', k }); });
  let started = false;
  for (let i = 0; i < 20 && !started; i++) { await p.waitForTimeout(250); started = await p.evaluate(() => !!(window.__w.cine || window.__w.approaching || document.querySelector('.tk-cine, .tk-letterbox'))); }
  check(started, 'rooms wait: a tap on the spot starts d2');
  await p.context().close();
}

async function fengDoor(b) {
  const p = await open(b, 'd6a', 'the-rong-mansion', ['daiyu'], 'the-rong-mansion--wf-rooms');
  const sp = await p.evaluate(() => { const w = window.__w, s = Object.values(w.spots).find(s => (s.node || '').endsWith('-d6a')); return s && { x: s.x, y: s.y }; });
  check(!!sp, 'd6a: the passage has its spot');
  await p.evaluate(([x, y]) => window.__w.player.body.reset(x, y + 60), [sp.x, sp.y]);
  await p.keyboard.down('ArrowUp');
  let started = false;
  for (let i = 0; i < 30 && !started; i++) { await p.waitForTimeout(150); started = await p.evaluate(() => !!(window.__w.cine || window.__w.approaching || window.__w.ui.busy())); }
  await p.keyboard.up('ArrowUp');
  check(started, 'd6a: walking up the passage to the screen wall starts Sister Feng\'s Door');
  await p.context().close();
}

async function part2OneWay(b) {
  let p = await open(b, 'g3', 'ning-rong-street', ['grannyliu', 'baner']);
  let at = await walkInto(p, 'the-rong-mansion', 'ArrowDown');
  check(at === 'ning-rong-street', `Part 2 (before g3): the back gate keeps her out (${at})`);
  await p.context().close();
  p = await open(b, 'g4', 'ning-rong-street', ['grannyliu', 'baner']);
  at = await walkInto(p, 'the-rong-mansion', 'ArrowDown');
  check(at === 'the-rong-mansion', `Part 2 (after g3): through the back gate, into the house (${at})`);
  if (at === 'the-rong-mansion') {
    const d = await p.evaluate(() => { const w = window.__w, e = w.exits.find(e => e.to === 'ning-rong-street').rect; return Math.round(Math.hypot(w.player.x - e.centerX, w.player.y - e.centerY)); });
    check(d < 48, `Part 2: she comes in just inside the back gate (${d} px from it)`);
    at = await walkInto(p, 'ning-rong-street', 'ArrowUp');
    check(at === 'ning-rong-street', `Part 2: and the back gate lets her out again (${at})`);
  }
  await p.context().close();
  p = await open(b, 'g5', 'the-rong-mansion', ['grannyliu', 'baner'], 'ning-rong-street');
  at = await walkInto(p, 'the-rong-mansion--xf-eastroom', 'ArrowUp', 900);
  check(at === 'the-rong-mansion--xf-eastroom', `g5: Xifeng's door, behind the half-size gate, takes her in (${at})`);
  await p.context().close();
}

async function carriage(b) {
  let p = await open(b, 'd4', 'lady-xings-court', ['daiyu'], 'the-rong-mansion');
  let d = await p.evaluate(() => { const w = window.__w, e = w.exits.find(e => e.to === 'ning-rong-street').rect; return Math.round(Math.hypot(w.player.x - e.centerX, w.player.y - e.centerY)); });
  check(d < 64, `d3's handoff: she gets down inside Lady Xing's black gate (${d} px from it)`);
  let at = await walkInto(p, 'ning-rong-street', 'ArrowDown');
  check(at === 'lady-xings-court', `Lady Xing's: the black gate keeps her in (${at})`);
  await p.context().close();
  p = await open(b, 'd5', 'the-rong-mansion', ['daiyu'], 'lady-xings-court');
  d = await near(p, 'd1');
  check(d < 120, `d4's handoff: back by the west side gate, by the festooned gate (${d} px from it)`);
  await p.context().close();
}

async function challengers(b) {
  let p = await open(b, 'd2', 'the-rong-mansion', ['daiyu']);
  let ids = await p.evaluate(() => window.__w.npcs.filter(n => n.challenge && n.spr.visible).map(n => n.challenge.split('-c-').pop()));
  check(ids.some(i => /steps-maid/.test(i)) && !ids.some(i => /walk-nurse/.test(i)), `d2 open: the maid on the steps is there, the nurse not yet (${ids.join(', ')})`);
  await p.context().close();
  p = await open(b, 'd5', 'the-rong-mansion', ['daiyu'], 'lady-xings-court');
  ids = await p.evaluate(() => window.__w.npcs.filter(n => n.challenge && n.spr.visible).map(n => n.challenge.split('-c-').pop()));
  check(ids.some(i => /walk-nurse/.test(i)) && !ids.some(i => /steps-maid/.test(i)), `d5 open: the nurse in the covered walk is there, the maid gone (${ids.join(', ')})`);
  await p.context().close();
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] });
  await part1Inside(b);
  await roomsWait(b);
  await fengDoor(b);
  await part2OneWay(b);
  await carriage(b);
  await challengers(b);
  await b.close();
  console.log(fails ? `FAIL ${fails}` : 'all ok');
  process.exit(fails ? 1 : 0);
})();
