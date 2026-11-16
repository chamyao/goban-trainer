// node poker/solver/inspect.mjs file.bin[.gz] — prints root strategies and a sample of exported combos
import fs from "fs"; import zlib from "zlib"; import { createRequire } from "module";
const E = createRequire(import.meta.url)("../engine.js");
let raw = fs.readFileSync(process.argv[2]); if (process.argv[2].endsWith(".gz")) raw = zlib.gunzipSync(raw);
const s = E.parseSolve(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
const nm = c => E.cardName(c.c1) + E.cardName(c.c2);
console.log("pot", s.pot, "stack", s.stack, "flop", s.flop.map(E.cardName).join(""), "expl%", (s.expl * 100).toFixed(2), "iters", s.iters, "nodes", s.nodes.length);
const show = (id, label) => {
  const n = s.nodes[id];
  console.log(`\n${label}: P${n.player} actions`, n.kind.map((k, a) => `${E.KIND[k]}${n.put[a] ? " " + n.put[a].toFixed(2) : ""}`).join(" | "));
  console.log("  range:", Array.from(s.agg.subarray(n.aggOff, n.aggOff + n.nA)).map(x => (x / 2.55).toFixed(0) + "%").join(" "));
  for (const c of s.players[n.player].combos) {
    const f = [], l = [];
    for (let a = 0; a < n.nA; a++) { f.push((c.freq[n.dOff + a] / 2.55).toFixed(0).padStart(3)); l.push((c.loss[n.dOff + a] / 2).toFixed(1).padStart(5)); }
    console.log("  ", nm(c).padEnd(5), "freq%", f.join(" "), "  loss%pot", l.join(" "));
  }
};
show(0, "OOP root");
const r = s.nodes[0]; show(r.child[0], "IP after check");
show(s.nodes[r.child[0]].child[1], "OOP facing small bet");
