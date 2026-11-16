/* Poker trainer engine: reads a precomputed solve (solver/solver.c writes it) and plays a hand on its tree.
   Works in the browser (window.PokerEngine) and in node (module.exports) for tests. */
(function (root) {
  "use strict";
  const RANKS = "23456789TJQKA", SUITS = "cdhs";
  const DEC = 0, CHANCE = 1, FOLD = 2, SHOW = 3;
  const KIND = ["fold", "check", "call", "bet", "raise", "allin"];

  const cardName = c => RANKS[c >> 2] + SUITS[c & 3];
  const parseCard = s => RANKS.indexOf(s[0]) * 4 + SUITS.indexOf(s[1]);

  /* ---------- the solve file ---------- */
  function parseSolve(buf) {
    const dv = new DataView(buf); let o = 0;
    const u8 = () => dv.getUint8(o++), u16 = () => { const v = dv.getUint16(o, true); o += 2; return v; };
    const u32 = () => { const v = dv.getUint32(o, true); o += 4; return v; }, f32 = () => { const v = dv.getFloat32(o, true); o += 4; return v; };
    const magic = String.fromCharCode(u8(), u8(), u8(), u8());
    if (magic !== "PKR1") throw new Error("not a solve file");
    const s = { pot: f32(), stack: f32(), expl: f32(), iters: u32(), flop: [u8(), u8(), u8()] };
    const n = u32(); s.nodes = new Array(n);
    const decCount = [0, 0]; let aggTot = 0;
    for (let i = 0; i < n; i++) {
      const t = u8(), node = { type: t };
      if (t === DEC) {
        node.player = u8(); node.nA = u8(); node.kind = []; node.put = []; node.child = [];
        for (let a = 0; a < node.nA; a++) { node.kind.push(u8()); node.put.push(f32()); node.child.push(u32()); }
        node.dOff = decCount[node.player]; decCount[node.player] += node.nA;
        node.aggOff = aggTot; aggTot += node.nA;
      } else if (t === CHANCE) {
        node.nC = u8(); node.card = []; node.child = [];
        for (let k = 0; k < node.nC; k++) { node.card.push(u8()); node.child.push(u32()); }
      }
      s.nodes[i] = node;
    }
    s.agg = new Uint8Array(buf, o, aggTot); o += aggTot;
    s.players = [];
    for (let p = 0; p < 2; p++) {
      const k = u16(), combos = [];
      for (let e = 0; e < k; e++) combos.push({ c1: u8(), c2: u8(), w: f32() });
      const decTot = u32();
      if (decTot !== decCount[p]) throw new Error("decision count mismatch");
      for (const c of combos) { c.freq = new Uint8Array(buf, o, decTot); o += decTot; c.loss = new Uint8Array(buf, o, decTot); o += decTot; }
      s.players.push({ combos, decTot });
    }
    // annotate street/pot for every node by walking the tree
    const walk = (id, street, c, cs) => {
      const nd = s.nodes[id]; nd.street = street; nd.c = c; nd.cs = cs;
      if (nd.type === DEC) {
        for (let a = 0; a < nd.nA; a++) {
          const ch = nd.child[a], t = s.nodes[ch].type, ncs = cs.slice(); ncs[nd.player] += nd.put[a];
          if (nd.kind[a] === 0) walk(ch, street, c, cs);
          else if (t === DEC) walk(ch, street, c, ncs);
          else walk(ch, street, c + ncs[nd.player], [0, 0]);   // the street is over: chips level
        }
      } else if (nd.type === CHANCE) for (const ch of nd.child) walk(ch, street + 1, c, [0, 0]);
    };
    walk(0, 0, 0, [0, 0]);
    return s;
  }

  /* ---------- hand evaluation (for showdown text) ---------- */
  const CAT = ["High card", "Pair", "Two pair", "Three of a kind", "Straight", "Flush", "Full house", "Four of a kind", "Straight flush"];
  function eval7(cards) {
    const rc = new Array(13).fill(0), sc = [0, 0, 0, 0], smask = [0, 0, 0, 0]; let rmask = 0;
    for (const c of cards) { const r = c >> 2, s = c & 3; rc[r]++; sc[s]++; smask[s] |= 1 << r; rmask |= 1 << r; }
    const straight = m => { for (let hi = 12; hi >= 4; hi--) { const need = 0x1F << (hi - 4); if ((m & need) === need) return hi; } return (m & 0x100F) === 0x100F ? 3 : -1; };
    const top = (m, k, skip = []) => { const out = []; for (let r = 12; r >= 0 && out.length < k; r--) if ((m >> r & 1) && !skip.includes(r)) out.push(r); return out; };
    const val = (cat, ks) => ks.reduce((v, r) => v * 16 + r, cat) * Math.pow(16, 5 - ks.length);
    for (let s = 0; s < 4; s++) if (sc[s] >= 5) {
      const st = straight(smask[s]);
      if (st >= 0) return { cat: 8, value: val(8, [st]) };
      return { cat: 5, value: val(5, top(smask[s], 5)) };
    }
    const byCount = n => { const out = []; for (let r = 12; r >= 0; r--) if (rc[r] === n) out.push(r); return out; };
    const q = byCount(4), t = byCount(3), p = byCount(2);
    if (q.length) return { cat: 7, value: val(7, [q[0], ...top(rmask, 1, q)]) };
    if (t.length && (t.length > 1 || p.length)) { const pr = Math.max(t[1] ?? -1, p[0] ?? -1); return { cat: 6, value: val(6, [t[0], pr]) }; }
    const st = straight(rmask); if (st >= 0) return { cat: 4, value: val(4, [st]) };
    if (t.length) return { cat: 3, value: val(3, [t[0], ...top(rmask, 2, t)]) };
    if (p.length >= 2) return { cat: 2, value: val(2, [p[0], p[1], ...top(rmask, 1, [p[0], p[1]])]) };
    if (p.length) return { cat: 1, value: val(1, [p[0], ...top(rmask, 3, p)]) };
    return { cat: 0, value: val(0, top(rmask, 5)) };
  }
  const handName = cards => CAT[eval7(cards).cat];

  /* ---------- playing a hand ---------- */
  function pick(weights, rnd) {
    let tot = 0; for (const w of weights) tot += w;
    if (tot <= 0) return Math.floor(rnd() * weights.length);
    let x = rnd() * tot;
    for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x <= 0) return i; }
    return weights.length - 1;
  }

  class Hand {
    /* heroSide: 0 = out of position, 1 = in position */
    constructor(solve, heroSide, rnd = Math.random) {
      this.s = solve; this.hero = heroSide; this.rnd = rnd;
      const hp = solve.players[heroSide].combos, vp = solve.players[1 - heroSide].combos;
      this.heroCombo = hp[pick(hp.map(c => c.w), rnd)];
      const hc = [this.heroCombo.c1, this.heroCombo.c2];
      const ok = vp.filter(c => !hc.includes(c.c1) && !hc.includes(c.c2));
      this.villCombo = ok[pick(ok.map(c => c.w), rnd)];
      this.board = solve.flop.slice();
      this.node = 0; this.street = 0;
      this.contrib = [0, 0];       // postflop chips put in by each player
      this.log = [];               // {who, kind, put, to, street}
      this.decisions = [];         // hero's decisions, for the review
    }
    get cur() { return this.s.nodes[this.node]; }
    get pot() { return this.s.pot + this.contrib[0] + this.contrib[1]; }
    stackOf(p) { return this.s.stack - this.contrib[p]; }
    combo(p) { return p === this.hero ? this.heroCombo : this.villCombo; }
    dead() { const a = this.heroCombo, b = this.villCombo; return [a.c1, a.c2, b.c1, b.c2]; }

    /* the actions at the current decision node, labelled */
    actions() {
      const n = this.cur, p = n.player;
      return n.kind.map((k, a) => {
        const put = n.put[a], to = n.cs[p] + put;
        const potBefore = this.pot;
        let label;
        if (k === 0) label = "Fold";
        else if (k === 1) label = "Check";
        else if (k === 2) label = `Call ${fmt(put)}`;
        else if (k === 3) label = `Bet ${fmt(put)}`;
        else if (k === 4) label = `Raise to ${fmt(to)}`;
        else label = `All-in ${fmt(to)}`;
        const sizing = k === 3 ? `${Math.round(put / potBefore * 100)}% pot` : k === 4 || (k === 5 && n.cs[1 - p] > 0) ? `${(to / n.cs[1 - p]).toFixed(1)}x` : k === 5 ? `${Math.round(put / potBefore * 100)}% pot` : "";
        return { a, kind: KIND[k], k, put, to, label, sizing };
      });
    }

    /* GTO frequencies (0..1) and EV losses (fraction of pot) at the current node for player p's actual combo */
    info(p = this.cur.player) {
      const n = this.cur, c = this.combo(p);
      const freq = [], loss = [], agg = [];
      for (let a = 0; a < n.nA; a++) {
        freq.push(c.freq[n.dOff + a] / 255); loss.push(c.loss[n.dOff + a] / 200); agg.push(this.s.agg[n.aggOff + a] / 255);
      }
      return { freq, loss, agg };
    }

    villainAction() {
      const { freq, agg } = this.info(1 - this.hero);
      return pick(freq.some(f => f > 0) ? freq : agg, this.rnd);
    }

    act(a) {
      const n = this.cur, p = n.player;
      if (p === this.hero) {
        const inf = this.info(p);
        this.decisions.push({ node: this.node, street: this.street, board: this.board.slice(), pot: this.pot, actions: this.actions(), chosen: a, ...inf, history: this.log.slice() });
      }
      const k = n.kind[a], put = n.put[a];
      this.log.push({ who: p, kind: KIND[k], put, to: n.cs[p] + put, street: this.street });
      this.contrib[p] += put;
      this.node = n.child[a];
      return this.cur;
    }

    /* deal the next card from the sampled runouts (never one of the players' cards) */
    deal() {
      const n = this.cur, dead = this.dead();
      const ok = []; for (let k = 0; k < n.nC; k++) if (!dead.includes(n.card[k])) ok.push(k);
      const k = ok[Math.floor(this.rnd() * ok.length)];
      this.board.push(n.card[k]); this.node = n.child[k]; this.street++;
      return n.card[k];
    }

    /* at a terminal node: hero's net result from the start of the flop, in bb */
    result() {
      const n = this.cur, h = this.hero, v = 1 - h;
      if (n.type === FOLD) {
        const folder = this.log[this.log.length - 1].who;
        return folder === h ? { net: -this.contrib[h], winner: v, fold: true } : { net: this.s.pot + this.contrib[v], winner: h, fold: true };
      }
      const hv = eval7([...this.board, this.heroCombo.c1, this.heroCombo.c2]), vv = eval7([...this.board, this.villCombo.c1, this.villCombo.c2]);
      const r = { heroHand: CAT[hv.cat], villHand: CAT[vv.cat], showdown: true };
      if (hv.value > vv.value) return { ...r, net: this.s.pot + this.contrib[v], winner: h };
      if (hv.value < vv.value) return { ...r, net: -this.contrib[h], winner: v };
      return { ...r, net: this.s.pot / 2, winner: -1 };
    }
  }

  const fmt = x => (Math.round(x * 10) / 10).toString();

  /* the review: grade each decision and the whole line */
  function grade(loss, freq) {
    if (loss <= 0.015 && freq >= 0.2) return { tag: "GTO", cls: "best" };
    if (loss <= 0.02) return { tag: "Fine", cls: "good" };
    if (loss <= 0.06) return { tag: "Inaccuracy", cls: "inacc" };
    if (loss <= 0.15) return { tag: "Mistake", cls: "mistake" };
    return { tag: "Blunder", cls: "blunder" };
  }
  function review(hand) {
    const rows = hand.decisions.map(d => {
      const lossFrac = d.loss[d.chosen], lossBB = lossFrac * d.pot;
      return { ...d, lossFrac, lossBB, grade: grade(lossFrac, d.freq[d.chosen]) };
    });
    const totalBB = rows.reduce((s, r) => s + r.lossBB, 0);
    const score = Math.round(100 * Math.exp(-3 * totalBB / hand.s.pot));
    const letter = score >= 95 ? "A+" : score >= 88 ? "A" : score >= 78 ? "B" : score >= 65 ? "C" : score >= 50 ? "D" : "F";
    return { rows, totalBB, score, letter };
  }

  const api = { parseSolve, Hand, review, grade, eval7, handName, cardName, parseCard, fmt, DEC, CHANCE, FOLD, SHOW, KIND, RANKS, SUITS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PokerEngine = api;
})(typeof self !== "undefined" ? self : this);
