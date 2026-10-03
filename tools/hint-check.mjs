// Answer-key check: follows the hint through every problem of every book with
// the real Trainer code from app.js (White replies as in the app), and plays
// the first move of each failure-only line to check it still ends "Wrong".
// Where the app's hint would show nothing, it follows a type-2 line.
// Usage: node tools/hint-check.mjs [--detail] [--book <id>]
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";
const repo = process.env.REPO || path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const detail = process.argv.includes("--detail");
const onlyBook = process.argv.includes("--book") ? process.argv[process.argv.indexOf("--book") + 1] : null;
const src = fs.readFileSync(`${repo}/app.js`, "utf8");
const cut = (a, b) => src.slice(src.indexOf(a), src.indexOf(b));
const code = `
${cut("const N = 19, EMPTY", "const SVGNS")}
${cut("class Trainer {", "function parseSgf")}
this.Trainer = Trainer; this.cIdx = cIdx;`;
const queue = [];
const ctx = {
  setTimeout: fn => { queue.push(fn); return queue.length; }, clearTimeout: () => {},
  Goban: class { constructor() {} render() {} pulse(c, r) { ctx.lastPulse = [c, r]; } renderOwnership() {} },
  cropFor: () => null, markResult: () => {}, Engine: { status: "off" }, globalThis: {}, console,
  document: { createElementNS: () => ({}) },
};
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { Trainer } = ctx;
// Neutralize DOM-touching methods.
for (const m of ["render", "setStatus", "renderNote", "renderSolutionTree"]) Trainer.prototype[m] = function () {};
Trainer.prototype.setStatus = function (cls, icon, text) { this.statusText = text; };

const drain = t => { let n = 0; while (queue.length) { queue.shift()(); if (++n > 10000) throw new Error("loop"); } };

export let blankProblems = 0;
// Why did a run end where it did? Looks at the final move sequence.
function classify(t) {
  const P = t.played, lines = t.p.lines;
  const same = (L, k) => L.length - 1 >= k && P.slice(0, k).every((m, i) => m === L[i + 1]);
  // longest prefix of P that is exactly a complete correct line
  let k = -1;
  for (let j = P.length; j >= 1; j--) if (lines.some(L => L[0] <= 2 && L.length - 1 === j && same(L, j))) { k = j; break; }
  const lastCorrect = (() => { let j = 0; for (let i = 1; i <= P.length; i++) if (lines.some(L => L[0] <= 2 && same(L, i))) j = i; return j; })();
  if (t.done === "bad") {
    if (k > 0) return `ended-correct-line-then-continued(at ${k}, ${k % 2 ? "after Black" : "after White"})`;
    // where did we leave the correct lines?
    return `left-correct-lines-at-move-${lastCorrect + 1}-${lastCorrect % 2 ? "White" : "Black"}`;
  }
  if (t.done == null) {
    if (k === P.length) return `correct-line-ended-but-failure-continues(${k % 2 ? "after Black" : "after White"})`;
    return `left-correct-lines-at-move-${lastCorrect + 1}-${lastCorrect % 2 ? "White" : "Black"}`;
  }
  return "";
}
export function followHint(book, idx, opts = {}) {
  queue.length = 0;
  const t = new Trainer(book, idx, {});
  const path = [];
  let blank = false;
  for (let step = 0; step < 500; step++) {
    drain(t);
    if (t.done === "ok" || t.done === "bad") { if (blank) blankProblems++; return { result: t.done, path: path.join(" "), why: classify(t), played: t.played.join(" ") }; }
    if (t.done === "next") { continue; }
    ctx.lastPulse = null;
    t.hint();
    let c, r;
    if (ctx.lastPulse) [c, r] = ctx.lastPulse;
    else {
      // The app's hint shows nothing here (no type-1 line continues); follow a type-2 line like a user would.
      const L = t.consistentLines().find(L => L[0] === 2 && L.length - 1 > t.played.length);
      if (!L) return { result: "nohint", path: path.join(" "), why: classify(t), played: t.played.join(" ") };
      blank = true;
      [c, r] = ctx.cIdx(L[t.played.length + 1]);
    }
    const mv = String.fromCharCode(97 + c) + String.fromCharCode(97 + r);
    path.push(mv);
    const before = t.played.length;
    t.click(c, r);
    if (t.played.length === before) return { result: "stuck", path: path.join(" ") };
    drain(t);
    path.push(t.played.length > before + 1 ? "[" + t.played.slice(before + 1).join(" ") + "]" : "");
  }
  return { result: "loop", path: path.join(" ") };
}

// Plays the first move of each type-3 line whose first move starts no type-1/2 line,
// then lets the trainer continue: Black follows only failure lines (first one consistent).
export function playFailure(book, idx, first) {
  queue.length = 0;
  const t = new Trainer(book, idx, {});
  let mv = first;
  for (let step = 0; step < 200; step++) {
    const [c, r] = ctx.cIdx(mv);
    const before = t.played.length;
    t.click(c, r);
    if (t.played.length === before) return "stuck";
    drain(t);
    if (t.done === "ok" || t.done === "bad") return t.done;
    if (t.done === "next") return "next";
    const L = t.consistentLines().find(L => L.length - 1 > t.played.length);
    if (!L) return "open";
    mv = L[t.played.length + 1];
  }
  return "loop";
}

if (process.argv[1] && process.argv[1].endsWith("hint-check.mjs")) {
  const index = JSON.parse(fs.readFileSync(`${repo}/data/index.json`, "utf8"));
  const tot = { ok: 0, bad: 0, nohint: 0, stuck: 0, loop: 0 }, fail = { ok: 0, bad: 0, other: 0 };
  const perBook = [], bads = [], failOk = [], whys = {};
  let n = 0;
  for (const b of index) {
    if (onlyBook && b.id !== onlyBook) continue;
    const book = JSON.parse(fs.readFileSync(`${repo}/data/books/${b.id}.json`, "utf8"));
    let bb = 0;
    book.problems.forEach((p, i) => {
      n++;
      const r = followHint(book, i);
      tot[r.result]++;
      if (r.result !== "ok") { bb++; bads.push(`${b.id} #${i + 1} (${p.id}) ${r.result} {${r.why}}: ${r.path} => ${r.played}`); whys[r.result + " " + r.why] = (whys[r.result + " " + r.why] || 0) + 1; }
      const goodFirst = new Set(p.lines.filter(L => L[0] <= 2).map(L => L[1]));
      const firsts = new Set(p.lines.filter(L => L[0] === 3 && !goodFirst.has(L[1])).map(L => L[1]));
      for (const f of firsts) {
        const res = playFailure(book, i, f);
        if (res === "bad") fail.bad++; else { fail.other++; failOk.push(`${b.id} #${i + 1} ${f} -> ${res}`); }
      }
    });
    if (bb) perBook.push(`${b.id}: ${bb}/${book.problems.length}`);
  }
  console.log("problems where the app's hint went blank (type-2 only) at some point:", blankProblems);
  console.log("problems:", n, "hint-following:", JSON.stringify(tot));
  console.log("type-3-only first moves:", JSON.stringify(fail));
  console.log(whys);
  if (detail) { console.log(perBook.join("\n")); console.log(bads.join("\n")); console.log("FAIL-NOT-BAD\n" + failOk.join("\n")); }
}
