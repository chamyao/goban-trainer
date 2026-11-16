// node poker/tests/engine.test.mjs [file.bin.gz ...] — plays random hands through every solve and checks the bookkeeping
import fs from "fs"; import zlib from "zlib"; import path from "path"; import assert from "assert"; import { createRequire } from "module";
const E = createRequire(import.meta.url)("../engine.js");
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "data");
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter(f => f.endsWith(".bin.gz")).map(f => path.join(dir, f));
assert(files.length, "no solves found");
let hands = 0, decisions = 0;
for (const f of files) {
  let raw = fs.readFileSync(f); if (f.endsWith(".gz")) raw = zlib.gunzipSync(raw);
  const s = E.parseSolve(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
  for (let i = 0; i < 400; i++) {
    const h = new E.Hand(s, i % 2);
    const hc = [h.heroCombo.c1, h.heroCombo.c2, h.villCombo.c1, h.villCombo.c2];
    assert.equal(new Set(hc).size, 4, "players share a card");
    for (let guard = 0; guard < 40; guard++) {
      const n = h.cur;
      if (n.type === E.DEC) {
        const acts = h.actions();
        assert.equal(acts.length, n.nA);
        const inf = h.info(n.player);
        const fs_ = inf.freq.reduce((a, b) => a + b, 0);
        assert(Math.abs(fs_ - 1) < 0.02, `freqs sum ${fs_}`);
        assert(inf.loss.some(l => l === 0), "some action must be best");
        const a = n.player === h.hero ? Math.floor(Math.random() * n.nA) : h.villainAction();
        h.act(a);
        assert(h.contrib[0] <= s.stack + 1e-3 && h.contrib[1] <= s.stack + 1e-3, "over the stack");
      } else if (n.type === E.CHANCE) {
        const c = h.deal();
        assert(!hc.includes(c) && !s.flop.includes(c), "dealt a dead card");
        assert.equal(new Set(h.board).size, h.board.length);
      } else break;
    }
    const n = h.cur;
    assert(n.type === E.FOLD || n.type === E.SHOW, "hand did not finish");
    if (n.type === E.SHOW) { assert.equal(h.board.length, 5); assert(Math.abs(h.contrib[0] - h.contrib[1]) < 1e-3, "unequal at showdown"); }
    const r = h.result(), rv = E.review(h);
    assert(r.net >= -s.stack - 1e-3 && r.net <= s.pot + s.stack + 1e-3);
    assert(rv.score >= 0 && rv.score <= 100);
    hands++; decisions += h.decisions.length;
  }
}
// evaluator spot checks
const ev = cs => E.eval7(cs.split(" ").map(E.parseCard));
assert(ev("As Ks Qs Js Ts 2c 3d").cat === 8);
assert(ev("Ah 2c 3d 4s 5h Kc Kd").cat === 4 && ev("Ah 2c 3d 4s 5h Kc Kd").value < ev("2h 3c 4d 5s 6h Kc Kd").value);
assert(ev("Ah Ad Ac Kh Kd Qs Qc").cat === 6);
assert(ev("2h 2d 3c 3h 4d 4s As").cat === 2 && ev("2h 2d 3c 3h 4d 4s As").value > ev("2h 2d 3c 3h 4d 4s Ks").value);
console.log(`ok: ${files.length} solves, ${hands} hands, ${decisions} hero decisions`);
