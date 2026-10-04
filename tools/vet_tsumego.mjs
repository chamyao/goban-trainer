#!/usr/bin/env node
/* Vet the campaign's life-and-death problems with KataGo.

   A problem is clean when a strong player can never fall off its answer
   tree. At every position on a correct line where Black is to play, KataGo
   (inside the same tsumego frame the site builds) must agree that:
     1. the tree's correct moves are as good as its best move;
     2. every move it rates as strong is a correct move in the tree (a strong
        move missing from the tree would leave the player off the path; one
        the tree marks wrong means the problem is mis-keyed).
   Moves are compared by score, not winrate: the frame leaves the whole board
   lopsided, so winrates sit near 0 or 1 whatever happens in the corner,
   while living or dying there swings the score by tens of points. "Strong"
   means within STRONG points of KataGo's best move.

   Results go to data/tk_vetted.json, keyed "book/id", and are reused: only
   problems not yet vetted are analysed. tools/build_tk.py draws campaign
   pools only from problems that passed.

     node tools/vet_tsumego.mjs --katago <katago> --model <net.bin.gz> [--visits 600] [--pools | ids…]

   --pools vets every problem in the pools of data/tk.json (run build_tk.py
   again afterwards; pools that lost problems draw new ones, which a second
   run then vets).  Needs a native KataGo (cpp/ build, any backend). */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data/tk_vetted.json");
const COLS = "ABCDEFGHJKLMNOPQRST";
const STRONG = 3;  // points: a move this close to KataGo's best counts as strong

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const KATAGO = opt("--katago"), MODEL = opt("--model"), VISITS = +opt("--visits", 600);
const POOLS = args.includes("--pools") && args.splice(args.indexOf("--pools"), 1);
if (!KATAGO || !MODEL) { console.error("need --katago and --model"); process.exit(1); }

// The site's own tsumego frame, so KataGo sees what the trainer would show it.
const ctx = { globalThis: {} };
ctx.globalThis = ctx;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "engine/engine-utils.js"), "utf8"), ctx);
const frameOf = board => ctx.GTEngineUtils.buildTsumegoFrame(board, { komi: 6.5, blackToPlay: true, koAllowed: true, margin: 4 });

const gtp = mv => { const c = mv.charCodeAt(0) - 97, r = mv.charCodeAt(1) - 97; return COLS[c] + (19 - r); };
const fromGtp = s => s === "pass" ? "pass" : String.fromCharCode(97 + COLS.indexOf(s[0])) + String.fromCharCode(97 + 19 - +s.slice(1));

// Positions to ask about: Black to play on a correct line (types 1, 2 are correct, 3 wrong).
function nodes(p) {
  const out = new Map();
  for (const L of p.lines) {
    if (L[0] > 2) continue;
    for (let k = 0; k + 1 < L.length; k += 2) {
      const pre = L.slice(1, k + 1), key = pre.join(",");
      if (out.has(key)) continue;
      const here = p.lines.filter(M => M.length > k + 1 && pre.every((m, i) => M[i + 1] === m));
      out.set(key, {
        pre,
        correct: new Set(here.filter(M => M[0] <= 2).map(M => M[k + 1])),
        wrong: new Set(here.filter(M => M[0] > 2).map(M => M[k + 1])),
      });
    }
  }
  return [...out.values()];
}

function query(p, id) {
  const board = Array.from({ length: 19 }, () => new Array(19).fill(null));
  for (const s of p.b) board[s.charCodeAt(1) - 97][s.charCodeAt(0) - 97] = "black";
  for (const s of p.w) board[s.charCodeAt(1) - 97][s.charCodeAt(0) - 97] = "white";
  const fr = frameOf(board);
  const stones = [...p.b.map(s => ["B", gtp(s)]), ...p.w.map(s => ["W", gtp(s)])];
  for (const q of fr.black) if (!board[q.y][q.x]) stones.push(["B", COLS[q.x] + (19 - q.y)]);
  for (const q of fr.white) if (!board[q.y][q.x]) stones.push(["W", COLS[q.x] + (19 - q.y)]);
  const R = fr.region || { xMin: 0, xMax: 18, yMin: 0, yMax: 18 }, region = [];
  for (let y = R.yMin; y <= R.yMax; y++) for (let x = R.xMin; x <= R.xMax; x++) region.push(COLS[x] + (19 - y));
  return { stones, region, id };
}

class KataGo {
  constructor() {
    this.cfg = path.join(ROOT, "tools/vet_katago.cfg");
    this.proc = spawn(KATAGO, ["analysis", "-config", this.cfg, "-model", MODEL], { stdio: ["pipe", "pipe", "inherit"] });
    this.wait = new Map(); this.buf = "";
    this.proc.stdout.on("data", d => {
      this.buf += d;
      let i;
      while ((i = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, i); this.buf = this.buf.slice(i + 1);
        if (!line.trim()) continue;
        const r = JSON.parse(line), w = this.wait.get(r.id);
        if (w) { this.wait.delete(r.id); r.error ? w.reject(new Error(r.error)) : w.resolve(r); }
      }
    });
  }
  ask(q) { return new Promise((resolve, reject) => { this.wait.set(q.id, { resolve, reject }); this.proc.stdin.write(JSON.stringify(q) + "\n"); }); }
  close() { this.proc.stdin.end(); }
}

let seq = 0;
async function vet(kg, p) {
  const base = query(p, "");
  for (const n of nodes(p)) {
    const moves = n.pre.map((m, i) => [i % 2 ? "W" : "B", gtp(m)]);
    const ask = (extra = {}) => kg.ask({
      id: `q${++seq}`, initialStones: base.stones, moves, rules: "japanese", komi: 6.5, boardXSize: 19, boardYSize: 19,
      initialPlayer: "B", maxVisits: VISITS, includePolicy: false,
      allowMoves: [{ player: moves.length % 2 ? "W" : "B", moves: extra.only || base.region, untilDepth: 1 }],
    });
    const r = await ask();
    const infos = r.moveInfos || [], best = infos[0], root = r.rootInfo.visits;
    if (process.env.VET_DEBUG) console.log(JSON.stringify({ pre: n.pre, correct: [...n.correct], wrong: [...n.wrong], root: { wr: r.rootInfo.winrate, lead: r.rootInfo.scoreLead },
      top: infos.slice(0, 6).map(m => [fromGtp(m.move), m.visits, +m.winrate.toFixed(3), +m.scoreLead.toFixed(1)]) }));
    const where = n.pre.length ? `after ${n.pre.join(" ")}` : "at the start";
    if (!best) return { ok: false, why: `KataGo found no move ${where}` };
    const strong = infos.filter(m => m.visits >= Math.max(20, root * 0.03) && m.scoreLead >= best.scoreLead - STRONG).map(m => fromGtp(m.move));
    for (const m of strong) {
      if (n.wrong.has(m) && !n.correct.has(m)) return { ok: false, why: `the tree marks ${m} wrong ${where}, but it works` };
      if (!n.correct.has(m)) return { ok: false, why: `${m} also works ${where} but isn't in the tree` };
    }
    for (const m of n.correct) {
      const seen = infos.find(x => fromGtp(x.move) === m && x.visits >= 20);
      const lead = seen ? seen.scoreLead : ((await ask({ only: [gtp(m)] })).moveInfos || [])[0]?.scoreLead;
      if (lead === undefined || lead < best.scoreLead - STRONG)
        return { ok: false, why: `the tree accepts ${m} ${where}, but KataGo's ${fromGtp(best.move)} is ${(best.scoreLead - lead).toFixed(0)} points better` };
    }
  }
  return { ok: true };
}

const vetted = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
let todo = args.map(a => a.split("/"));
if (POOLS) {
  const tk = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tk.json"), "utf8"));
  for (const w of tk.worlds) for (const n of w.nodes) if (n.role !== "boss") for (const ref of n.pool || []) todo.push(ref);
}
todo = [...new Map(todo.map(r => [r.join("/"), r])).values()].filter(r => !(r.join("/") in vetted));
console.log(`${todo.length} problems to vet at ${VISITS} visits`);
const books = {};
const problem = ([b, id]) => (books[b] ||= Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, `data/books/${b}.json`), "utf8")).problems.map(p => [String(p.id), p])))[String(id)];

const kg = new KataGo();
const net = path.basename(MODEL).replace(/\.bin\.gz$/, "");
let done = 0, bad = 0;
const save = () => fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(Object.entries(vetted).sort()), null, 0).replace(/},"/g, '},\n"'));
const queue = todo.slice();
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const ref = queue.shift(), p = problem(ref);
    let res;
    try { res = p ? await vet(kg, p) : { ok: false, why: "problem not found" }; } catch (e) { res = { ok: false, why: `error: ${e.message}` }; }
    vetted[ref.join("/")] = { ...res, net, visits: VISITS };
    done++; if (!res.ok) bad++;
    console.log(`${done}/${todo.length} ${res.ok ? "ok  " : "FAIL"} ${ref.join("/")}${res.ok ? "" : " — " + res.why}`);
    if (done % 10 === 0) save();
  }
}));
save();
kg.close();
console.log(`vetted ${done}: ${done - bad} clean, ${bad} rejected → ${path.relative(ROOT, OUT)}`);
