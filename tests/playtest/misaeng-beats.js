// Misaeng's beats as built (TK.world(N).nodes, N = BOOK, default 21; read from the game, not hard-coded, so it carries
// over when the book is split into five): every record board's one answer is Cho Hunhyun's move in the SGF (read here,
// on its own), the position shown is the game before it; the strip's move only goes forward; a record board asks for a
// Black move after the strip's; every gate's objective names a place (where) and every gated beat has an else-scene
// that says why; no line, title, objective or item carries Chinese (an English-only book); every speaker has a voice.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.PLAYTEST_URL || 'http://localhost:8765', BOOK = +(process.env.BOOK || 21);
let fails = 0;
const check = (ok, w) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + w); };
const sgf = fs.readFileSync(path.join(__dirname, '../../docs/book2/misaeng-ing-cup-g5.sgf'), 'utf8');
const MOVES = [...sgf.matchAll(/;\s*([BW])\[([a-s]{2})\]/g)].map(m => [m[1], m[2]]);
// the board after n moves, captures taken (independent of the engine)
function board(n) {
  const g = new Map(), key = (x, y) => x + ',' + y, nb = (x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < 19 && b < 19);
  const group = (x, y) => { const c = g.get(key(x, y)), seen = new Set([key(x, y)]), st = [[x, y]]; let libs = 0;
    while (st.length) { const [a, b] = st.pop(); for (const [u, v] of nb(a, b)) { const k = key(u, v); if (!g.has(k)) libs++; else if (g.get(k) === c && !seen.has(k)) { seen.add(k); st.push([u, v]); } } }
    return { seen, libs }; };
  for (const [c, m] of MOVES.slice(0, n)) { const x = m.charCodeAt(0) - 97, y = m.charCodeAt(1) - 97; g.set(key(x, y), c);
    for (const [u, v] of nb(x, y)) if (g.has(key(u, v)) && g.get(key(u, v)) !== c) { const r = group(u, v); if (!r.libs) for (const k of r.seen) g.delete(k); } }
  const out = { B: [], W: [] }; for (const [k, c] of g) { const [x, y] = k.split(',').map(Number); out[c].push(String.fromCharCode(97 + x) + String.fromCharCode(97 + y)); }
  return out;
}
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext()).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/phaser.min.js', r => r.fulfill({ path: path.join(__dirname, 'vendor/phaser.min.js'), contentType: 'application/javascript' }));
  await p.route('**/*.mp3', r => r.fulfill({ status: 404, body: '' }));
  await p.goto(BASE + '/index.html#/tk'); await p.waitForTimeout(800);
  const W = await p.evaluate(async n => { await TK.load(); const w = TK.world(n);
    for (const nd of w.nodes) TK.markCleared(nd.key);   // every board open to read
    const boards = [];
    for (const nd of w.nodes) for (const r of [].concat(nd.record == null ? [] : nd.record).map((r, i) => [r, i])) if (Number.isInteger(r[0])) {
      const d = await tkLevelData(n, r[1] ? `${nd.key}~${r[1] + 1}` : nd.key);
      boards.push({ key: nd.key, idx: r[1], asked: r[0], got: d && { rec: d.p.record, lines: d.p.lines, b: d.p.b.slice().sort(), w: d.p.w.slice().sort(), credit: d.p.credit } });
    }
    return { name: w.name, lang: w.lang, nodes: w.nodes, scenes: w.scenes, items: w.items, opening: w.opening, closing: w.closing, boards, cast: w.cast || null };
  }, BOOK);
  console.log(`book ${BOOK}: ${W.name}, ${W.nodes.length} beats, lang ${W.lang}`);
  check(W.lang === 'en', 'the book is English-only');
  // 1. record boards
  for (const bd of W.boards) {
    const [c, mv] = MOVES[bd.asked - 1], pos = board(bd.asked - 1), g = bd.got;
    check(g && c === 'B' && g.rec === bd.asked && g.lines.length === 1 && g.lines[0][1] === mv,
      `${bd.key}${bd.idx ? ' (board ' + (bd.idx + 1) + ')' : ''}: asks Black ${bd.asked}; its one answer is Cho Hunhyun's ${mv} (got ${g && JSON.stringify(g.lines)})`);
    check(g && JSON.stringify(g.b) === JSON.stringify(pos.B.sort()) && JSON.stringify(g.w) === JSON.stringify(pos.W.sort()),
      `${bd.key}: the board is the game after ${bd.asked - 1} moves (${g && g.b.length}+${g && g.w.length} stones; the record has ${pos.B.length}+${pos.W.length})`);
  }
  // 2. the strip: forward only; a record board asks past it
  let last = -1;
  for (const nd of W.nodes) {
    if (!Number.isInteger(nd.move)) { check(false, `${nd.key}: no "move" for the strip`); continue; }
    check(nd.move >= last && nd.move <= 145, `${nd.key}: the strip shows move ${nd.move} (after ${last})`); last = nd.move;
    for (const r of [].concat(nd.record == null ? [] : nd.record)) if (Number.isInteger(r)) check(r > nd.move, `${nd.key}: the record board asks Black ${r}, after the strip's move ${nd.move}`);
  }
  // 3. gates: an objective with a place in it, and an else-scene that says why
  const PLACE = /\b(at|in|on|from|to|by|into|outside|inside|behind|beside|near|down|up)\b .*[A-Z]|lobby|desk|room|table|street|floor|stall|office|roof|lift|station|park/i;
  for (const nd of W.nodes) for (const g of nd.gate || []) {
    const obj = g.objective || '';
    check(!!obj && PLACE.test(obj), `${nd.key}: the gate's objective says where ("${obj}")`);
    const els = g.else && W.scenes[g.else];
    const said = els ? els.steps.filter(s => s[0] === 'say' || s[0] === 'n').map(s => s[0] === 'say' ? s[2] : s[1]).join(' ') : '';
    check(!!said, `${nd.key}: walking in too early plays "${g.else}", which says why ("${said.slice(0, 90)}")`);
  }
  // 4. English only: every line, title, objective, item
  const zh = [], walk = (x, where) => { if (typeof x === 'string') { if (/[㐀-鿿]/.test(x)) zh.push(`${where}: ${x.slice(0, 40)}`); } else if (Array.isArray(x)) x.forEach((y, i) => walk(y, where)); else if (x && typeof x === 'object') for (const k in x) walk(x[k], where + '.' + k); };
  for (const [k, s] of Object.entries(W.scenes)) walk(s, 'scene ' + k);
  walk(W.nodes, 'nodes'); walk(W.items, 'items'); walk(W.opening, 'opening'); walk(W.closing, 'closing');
  check(!zh.length, `no Chinese in the book's text (${zh.length}: ${zh.slice(0, 4).join(' | ')})`);
  // 5. every scene a beat names exists, and every beat with a board has a dilemma for it
  for (const nd of W.nodes) {
    check(!!W.scenes[nd.scene], `${nd.key}: its scene "${nd.scene}" exists`);
    const n = (W.scenes[nd.scene] ? W.scenes[nd.scene].steps : []).filter(s => s[0] === 'problem').length, dl = [].concat(nd.dilemma || []);
    if (n) check(dl.length >= n, `${nd.key}: ${n} board(s), ${dl.length} caption(s)`);
  }
  await b.close();
  console.log(fails ? `misaeng-beats: ${fails} failed` : 'misaeng-beats: all ok');
})();
