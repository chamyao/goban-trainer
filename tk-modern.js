/* ---- Misaeng (world 21): a modern book's ways of playing (tk.js and tk-world.js call these) ----

   Only a world that declares them uses any of this (docs/book2/misaeng-engine.md):

   The record ("record": {moves: [["B", "pd"], …], title, black, white}, from the book's SGF). A beat with "move": n
   opens on the game played up to move n: a small board in the corner of the world (the strip), with "Move n".
   A beat with "record": n (or a list, one per board, null for an ordinary problem) asks for Black's move n from the
   position before it: one right point, a wrong one rests as any board does.

   The audit board ("audit": {clues: [items], links: [{q, pair: [a, b], a}], done: mark}). Opened from the bag, or
   a spot with "opens": "audit". It asks each question in turn; tap the two clues that answer it. Each link made is
   the mark "audit-<i>"; all of them, the "done" mark.

   The trade loop ("trade": {cash, unit, goods: {key: {name, cost}}, done: mark, ends: {offers}, when}). While it's
   on, a chip shows cash and stock. A townsperson with "shop" sells the goods, one with "buyer" ({wants, pays, yes,
   no}) is offered to, one with "rival" ({say}) out-sells you. It ends after "ends.offers" offers, or with no cash
   and no stock: the "done" mark. */

const WorldModern = {
  /* ---------- the record ---------- */
  // the board after the first n moves of the record (captures taken)
  position(w, n) {
    let g = Array.from({ length: N }, () => new Array(N).fill(EMPTY));
    for (const [c, m] of (w.record.moves || []).slice(0, n)) {
      const [x, y] = cIdx(m), g2 = applyMove(g, x, y, c === "B" ? BLACK : WHITE);
      if (g2) g = g2;
    }
    return g;
  },
  // which record move a beat's board asks for (idx: the scene's board, from 0), or null
  move(w, node, idx = 0) {
    if (!w || !w.record || !node || node.record == null) return null;
    const r = Array.isArray(node.record) ? node.record[idx] : idx === 0 ? node.record : null;
    return Number.isInteger(r) ? r : null;
  },
  // the record's boards as a problem book the trainer plays: the position before move n, its one right answer
  book(w) {
    if (w.__recordBook) return w.__recordBook;
    const R = w.record, asked = new Set();
    for (const nd of w.nodes || []) for (const m of [].concat(nd.record == null ? [] : nd.record)) if (Number.isInteger(m)) asked.add(m);
    const name = (x, y) => String.fromCharCode(97 + x) + String.fromCharCode(97 + y);
    const problems = [...asked].sort((a, b) => a - b).map(n => {
      const g = this.position(w, n - 1), b = [], wh = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (g[y][x] === BLACK) b.push(name(x, y)); else if (g[y][x] === WHITE) wh.push(name(x, y));
      return { id: n, b, w: wh, lines: [[1, R.moves[n - 1][1]]], lv: "", qt: "", record: n, last: n > 1 ? R.moves[n - 2][1] : null,
               credit: `${R.title || "The record"} · Black ${n}, ${R.black || "Black"}'s move` };
    });
    return (w.__recordBook = { id: `record-${w.n}`, title: R.title || "The record", problems });
  },
  // A record board as multiple choice (the user: "change the move guessing game to be multiple choice between a couple of
  // reasonable moves … label a, b, c, d on the board", the alternatives "all a little bit worse than cho's move", by how
  // much "scale it by rank"): the node's "choices" {move: [[point, points lost], …]} give the candidates; three are
  // drawn from the band for the player's rank (TKElo), shuffled in with Cho's move, and kept for that board (a slip
  // brings back the same four). Without candidates the board is open, as before.
  BANDS: [[15, 1.5, 3], [10, 0.7, 1.5], [5, 0.3, 0.8], [-99, 0, 0.5]],   // [weakest kyu in the band, least loss, most]
  choices(w, node, move, key) {
    const list = node && node.choices && (node.choices[move] || node.choices[String(move)]);
    if (!list || list.length < 3) return null;
    const all = TK.ls("tk-choices");
    if (all[key]) return all[key];
    const label = typeof TKElo !== "undefined" ? TKElo.label() : "15K", kyu = /K/.test(label) ? parseInt(label) : -parseInt(label);
    const [, lo, hi] = this.BANDS.find(b => kyu >= b[0]);
    const off = x => x < lo ? lo - x : x > hi ? x - hi : 0;
    let seed = 0; for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
    const right = w.record.moves[move - 1][1];
    const pool = list.filter(([p]) => p !== right).map(([p, l]) => ({ p, d: off(l) + rnd() * 0.05 })).sort((a, b) => a.d - b.d);
    const pts = [right, ...pool.slice(0, 3).map(x => x.p)];
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    all[key] = pts; TK.lsSet("tk-choices", all);
    return pts;
  },
  // the letters on the board, redrawn with it; the four points the only ones that play (Trainer.click honours p.only)
  labels(trainer, pts) {
    const g = trainer.goban, svg = g.svg, NS = "http://www.w3.org/2000/svg";
    const draw = () => {
      svg.querySelectorAll(".tk-choice").forEach(e => e.remove());
      if (trainer.done === "ok") return;
      pts.forEach((p, i) => {
        const [c, r] = cIdx(p);
        if (trainer.grid[r][c]) return;
        const el = document.createElementNS(NS, "g"); el.setAttribute("class", "tk-choice"); el.setAttribute("pointer-events", "none");
        const ci = document.createElementNS(NS, "circle"); ci.setAttribute("cx", g.px(c)); ci.setAttribute("cy", g.py(r)); ci.setAttribute("r", g.cell * .5);
        const t = document.createElementNS(NS, "text"); t.setAttribute("x", g.px(c)); t.setAttribute("y", g.py(r)); t.textContent = "ABCD"[i];
        t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "central"); t.setAttribute("font-size", g.cell * .72);
        el.append(ci, t); svg.append(el);
      });
    };
    g.only = new Set(pts);   // the board takes taps on these four only (app.js Goban): no ghost stone off the letters
    const render = trainer.render.bind(trainer);
    trainer.render = (...a) => { const r = render(...a); draw(); return r; };
    trainer.render();   // redrawn with only the four points taking taps, and the letters
    return draw;
  },
  boardSvg(w, n, px = 92) {
    const g = this.position(w, n), s = px / 20, at = i => (s * (i + 1)).toFixed(1);
    let o = `<svg viewBox="0 0 ${px} ${px}" width="${px}" height="${px}" aria-hidden="true"><rect width="${px}" height="${px}" rx="3" fill="#dcb46a"/>`;
    for (let i = 0; i < N; i++) o += `<path d="M${at(0)} ${at(i)}H${at(18)}M${at(i)} ${at(0)}V${at(18)}" stroke="#6b4f22" stroke-width=".5"/>`;
    for (const [x, y] of [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]]) o += `<circle cx="${at(x)}" cy="${at(y)}" r="${(s * .14).toFixed(1)}" fill="#6b4f22"/>`;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (g[y][x])
      o += `<circle cx="${at(x)}" cy="${at(y)}" r="${(s * .47).toFixed(1)}" fill="${g[y][x] === BLACK ? "#161616" : "#f4f1ea"}" stroke="#222" stroke-width=".4"/>`;
    const last = n > 0 && w.record.moves[n - 1];
    if (last) { const [x, y] = cIdx(last[1]); o += `<circle cx="${at(x)}" cy="${at(y)}" r="${(s * .22).toFixed(1)}" fill="none" stroke="${last[0] === "B" ? "#fff" : "#000"}" stroke-width=".9"/>`; }
    return o + "</svg>";
  },
  // the strip: the next beat's move, in the corner of the world; tap to see it large
  strip(scene) {
    const w = scene.w, host = scene.ui && document.querySelector(".town-ui");
    if (!host) return;
    let el = host.querySelector(".tk-strip");
    const q = scene.nextMain && scene.nextMain(), nd = q && (w.nodes || []).find(x => x.key === q.node);
    const n = w.record && nd && Number.isInteger(nd.move) ? nd.move : null;
    if (n == null) { if (el) el.remove(); return; }
    if (el && +el.dataset.move === n) return;
    if (!el) { el = document.createElement("button"); el.type = "button"; el.className = "tk-strip"; host.append(el); }
    el.dataset.move = n;
    el.title = `${w.record.title || "The record"}: the game after move ${n}`;
    el.innerHTML = `${this.boardSvg(w, n, 76)}<span>${n ? `Move ${n}` : "The empty board"}</span><span class="tk-strip-short">${n ? `Move ${n}` : "Move 0"}</span>`;
    el.onclick = e => { e.stopPropagation(); this.showBoard(w, n); };
  },
  showBoard(w, n) {
    const R = w.record, el = document.createElement("div");
    el.className = "tk-bag tk-record";
    el.innerHTML = `<div class="tk-bag-box"><h3></h3>${this.boardSvg(w, n, 300)}<p class="tk-record-sub"></p><button type="button">Close</button></div>`;
    el.querySelector("h3").textContent = R.title || "The record";
    el.querySelector(".tk-record-sub").textContent = `${R.black || "Black"} (Black) · ${R.white || "White"} (White) · ${n ? `after move ${n}` : "before the first move"}`;
    const close = () => { el.remove(); removeEventListener("keydown", key, true); };
    const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } };
    addEventListener("keydown", key, true);
    el.querySelector("button").onclick = close;
    el.onclick = e => { if (e.target === el) close(); };
    document.body.append(el);
  },

  /* ---------- the audit board ---------- */
  auditHeld(w) { const a = w.audit; return a ? a.clues.filter(c => WorldItems.has(w, c)) : []; },
  auditLinked(w) { const a = w.audit; return a ? a.links.map((_, i) => WorldMarks.has(w, `audit-${i + 1}`)) : []; },
  auditOpen(w) { return !!(w.audit && this.auditHeld(w).length >= 2); },
  audit(scene) {
    const w = scene.w, A = w.audit;
    if (!A) return false;
    document.querySelector(".tk-audit")?.remove();
    const d = WorldItems.defs(w), el = document.createElement("div");
    el.className = "tk-bag tk-audit";
    el.innerHTML = `<div class="tk-bag-box"><h3></h3><p class="tk-audit-q"></p><div class="tk-audit-cards"></div><ol class="tk-audit-done"></ol><p class="tk-audit-say" aria-live="polite"></p><button type="button" class="tk-audit-close">Close</button></div>`;
    el.querySelector("h3").textContent = A.title || "The audit board";
    const $ = s => el.querySelector(s);
    let pick = [];
    const render = () => {
      const linked = this.auditLinked(w), i = linked.indexOf(false), held = this.auditHeld(w);
      $(".tk-audit-q").textContent = i < 0 ? "Every link is made." : `${A.links[i].q}`;
      const ol = $(".tk-audit-done"); ol.textContent = "";
      A.links.forEach((L, k) => { if (!linked[k]) return;
        const li = document.createElement("li"); li.innerHTML = "<b></b> <span></span>";
        li.querySelector("b").textContent = L.pair.map(c => (d[c] || {}).name || c).join(" + ");
        li.querySelector("span").textContent = L.a; ol.append(li); });
      const box = $(".tk-audit-cards"); box.textContent = "";
      for (const c of A.clues) {
        const it = d[c] || {}, has = held.includes(c), b = document.createElement("button");
        b.type = "button"; b.className = "tk-audit-card" + (pick.includes(c) ? " on" : "") + (has ? "" : " missing");
        b.disabled = !has || i < 0;
        b.innerHTML = "<b></b><span></span>";
        b.querySelector("b").textContent = has ? it.name || c : "Not found yet";
        b.querySelector("span").textContent = has ? it.text || "" : "";
        b.onclick = () => { pick = pick.includes(c) ? pick.filter(x => x !== c) : [...pick, c]; if (pick.length === 2) try2(i); else render(); };
        box.append(b);
      }
    };
    const try2 = i => {
      const L = A.links[i], ok = L && pick.every(c => L.pair.includes(c));
      pick = [];
      $(".tk-audit-say").textContent = ok ? L.a : "Those two don't connect.";
      if (ok) {
        WorldMarks.add(w, `audit-${i + 1}`);
        if (this.auditLinked(w).every(Boolean)) WorldMarks.add(w, A.done);
        scene.refreshStory(); scene.setGoal();
      }
      render();
    };
    const close = () => { el.remove(); removeEventListener("keydown", key, true); };
    const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } };
    addEventListener("keydown", key, true);
    $(".tk-audit-close").onclick = close;
    el.onclick = e => { if (e.target === el) close(); };
    render();
    ((scene.game.worldOpts && scene.game.worldOpts.host) || document.body).append(el);
    return true;
  },

  /* ---------- the trade loop ---------- */
  KEY: "tk-trade",
  tstate(w) { const a = TK.ls(this.KEY)[w.n]; return a || { cash: w.trade.cash || 0, stock: {}, offers: 0, met: [] }; },
  tsave(w, s) { const a = TK.ls(this.KEY); a[w.n] = s; TK.lsSet(this.KEY, a); },
  tradeOn(scene) {
    const T = scene.w.trade;
    return !!T && scene.cond(T.when || "") && !WorldMarks.has(scene.w, T.done);
  },
  money(w, v) { const u = (w.trade && w.trade.unit) || "₩"; return `${u}${Number(v).toLocaleString("en-US")}`; },
  stockText(w, s) {
    const G = w.trade.goods || {};
    const parts = Object.entries(s.stock).filter(([, k]) => k > 0).map(([g, k]) => `${k} × ${(G[g] || {}).name || g}`);
    return parts.length ? parts.join(", ") : "nothing";
  },
  chip(scene) {
    const host = document.querySelector(".town-ui");
    if (!host) return;
    let el = host.querySelector(".tk-trade-chip");
    if (!this.tradeOn(scene)) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.className = "tk-trade-chip"; host.append(el); }
    const s = this.tstate(scene.w);
    el.innerHTML = "<b></b><span></span>";
    el.querySelector("b").textContent = this.money(scene.w, s.cash);
    el.querySelector("span").textContent = `Stock: ${this.stockText(scene.w, s)}`;
  },
  // a townsperson's part in the trade: true if handled
  talk(scene, n) {
    const w = scene.w, T = w.trade;
    if (!T || !(n.shop || n.buyer || n.rival)) return false;
    if (!this.tradeOn(scene)) return false;   // before or after the mission: their usual lines
    const s = this.tstate(w), line = t => ["n", t, ""];
    const done = () => { this.tsave(w, s); this.endCheck(scene, s); this.chip(scene); };
    if (n.shop) return this.shopMenu(scene, n), true;
    if (n.rival) {
      if (!s.met.includes(n.id)) { s.met.push(n.id); s.offers++; }
      scene.talk(worldLines(n.rival.say || []), done);
      return true;
    }
    const B = n.buyer, wants = (B.wants || []).filter(g => (s.stock[g] || 0) > 0);
    if (s.met.includes(n.id)) { scene.talk(n.say.length ? worldLines(n.say) : [line("They've already given you their answer.")]); return true; }
    if (!wants.length) { scene.talk([...(n.say.length ? worldLines(n.say) : []), line(`You have nothing they'd buy. (Stock: ${this.stockText(w, s)})`)]); return true; }
    const g = wants[0], name = ((T.goods || {})[g] || {}).name || g;
    s.met.push(n.id); s.offers++;
    if (B.pays > 0) {
      s.stock[g]--; s.cash += B.pays;
      scene.talk([line(`You offer the ${name.toLowerCase()}.`), ...worldLines(B.yes || []), line(`Sold, for ${this.money(w, B.pays)}.`)], done);
    } else scene.talk([line(`You offer the ${name.toLowerCase()}.`), ...worldLines(B.no || [])], done);
    return true;
  },
  shopMenu(scene, n) {
    const w = scene.w, T = w.trade, G = T.goods || {};
    document.querySelector(".tk-shop")?.remove();
    const el = document.createElement("div");
    el.className = "tk-bag tk-shop";
    el.innerHTML = `<div class="tk-bag-box"><h3></h3><p class="tk-shop-say"></p><ul></ul><p class="tk-shop-cash"></p><button type="button" class="tk-shop-close">Done</button></div>`;
    el.querySelector("h3").textContent = (n.shopName) || "The shop";
    const say = n.say && n.say[0] ? n.say[0] : null;
    el.querySelector(".tk-shop-say").textContent = say ? (say[0] === "say" ? say[2] : say[1]) : "";
    const render = () => {
      const s = this.tstate(w), ul = el.querySelector("ul");
      ul.textContent = "";
      for (const g of n.shop) {
        const it = G[g]; if (!it) continue;
        const li = document.createElement("li"), b = document.createElement("button");
        li.innerHTML = "<b></b> <span class=\"n\"></span> ";
        li.querySelector("b").textContent = it.name;
        li.querySelector(".n").textContent = this.money(w, it.cost);
        b.type = "button"; b.textContent = "Buy one"; b.disabled = s.cash < it.cost;
        b.onclick = () => { const s2 = this.tstate(w); if (s2.cash < it.cost) return; s2.cash -= it.cost; s2.stock[g] = (s2.stock[g] || 0) + 1; this.tsave(w, s2); this.chip(scene); render(); };
        li.append(b); ul.append(li);
      }
      el.querySelector(".tk-shop-cash").textContent = `Cash: ${this.money(w, s.cash)} · Stock: ${this.stockText(w, s)}`;
    };
    const close = () => { el.remove(); removeEventListener("keydown", key, true); this.endCheck(scene, this.tstate(w)); };
    const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } };
    addEventListener("keydown", key, true);
    el.querySelector(".tk-shop-close").onclick = close;
    el.onclick = e => { if (e.target === el) close(); };
    render();
    ((scene.game.worldOpts && scene.game.worldOpts.host) || document.body).append(el);
  },
  endCheck(scene, s) {
    const w = scene.w, T = w.trade;
    if (!T || WorldMarks.has(w, T.done)) return;
    const cheapest = Math.min(...Object.values(T.goods || {}).map(g => g.cost));
    const stock = Object.values(s.stock).reduce((a, b) => a + b, 0);
    if (s.offers >= ((T.ends || {}).offers || Infinity) || (s.cash < cheapest && !stock)) {
      WorldMarks.add(w, T.done);
      scene.refreshStory(); scene.setGoal();
    }
    this.chip(scene);
  },

  /* ---------- a lift: a spot with "use": "lift" and "floors": [{label, to}] (to: a place id); pick a floor, go ---------- */
  lift(scene, spot) {
    const floors = (spot.floors || []).filter(f => f && f.to);
    if (!floors.length) return false;
    document.querySelector(".tk-lift")?.remove();
    const el = document.createElement("div");
    el.className = "tk-bag tk-lift";
    el.innerHTML = `<div class="tk-bag-box"><h3></h3><ul></ul><button type="button" class="tk-lift-close">Stay here</button></div>`;
    el.querySelector("h3").textContent = spot.label || "The lift";
    const ul = el.querySelector("ul");
    const close = () => { el.remove(); removeEventListener("keydown", key, true); };
    const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } };
    for (const f of floors) {
      const li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.textContent = f.label || scene.placeName(f.to);
      const here = f.to === scene.placeId, open = here || scene.placeOpen(f.to);
      b.disabled = here || !open;
      if (!here && f.to === scene.goalFloor && scene.goalPoint && scene.goalPoint()) b.textContent = `◆ ${b.textContent}`;   // where the story goes next
      if (here) b.textContent += " (you're here)";
      else if (!open) b.textContent += " (no reason to go yet)";
      b.onclick = () => { close(); scene.go(f.to); };
      li.append(b); ul.append(li);
    }
    addEventListener("keydown", key, true);
    el.querySelector(".tk-lift-close").onclick = close;
    el.onclick = e => { if (e.target === el) close(); };
    ((scene.game.worldOpts && scene.game.worldOpts.host) || document.body).append(el);
    return true;
  },

  /* ---------- the world's HUD: called whenever the goal is set ---------- */
  hud(scene) {
    const w = scene.w;
    if (!w || !(w.record || w.trade)) return;
    if (w.record) this.strip(scene);
    if (w.trade) this.chip(scene);
    this.place();
    if (!this.onResize) addEventListener("resize", this.onResize = () => this.place());
  },
  // the strip and the chip stack down the right, below whatever of the HUD is above them there (the menu button;
  // the goal box when it runs that wide, as on a phone)
  place() {
    const ui = document.querySelector(".town-ui");
    if (!ui) return;
    const R = ui.getBoundingClientRect(), col = R.right - 110;
    let y = 10;
    for (const el of document.querySelectorAll(".tk-map .town-goal, .tk-map .tk-menu-btn, .tk-map .town-skip")) {
      const b = el.getBoundingClientRect();
      if (b.height && b.right > col && b.top < R.top + R.height / 2) y = Math.max(y, b.bottom - R.top + 6);
    }
    const strip = ui.querySelector(".tk-strip"), chip = ui.querySelector(".tk-trade-chip");
    // a narrow screen (a phone): the strip is a small chip in the menu button's row, so the map below it takes taps
    const narrow = R.width < 560, menu = document.querySelector(".tk-map .tk-menu-btn, .tk-map .town-skip");
    if (strip) {
      strip.classList.toggle("compact", narrow);
      const mb = menu && menu.getBoundingClientRect();
      if (narrow && mb && mb.height) {
        strip.style.top = `${Math.round(mb.top - R.top)}px`; strip.style.right = `${Math.round(R.right - mb.left + 6)}px`;
      } else {
        strip.style.right = ""; strip.style.top = `${Math.round(y)}px`;
        y += strip.getBoundingClientRect().height + 6;
      }
    }
    if (chip) chip.style.top = `${Math.round(y)}px`;
    if (window.__w && window.__w.fitCamera && window.__w.mapW && !window.__w.cine) window.__w.fitCamera();   // (never under a scene's camera)   // the camera keeps the room clear of them (hudTop)
  },
};

/* ---------- an English-only book's screen: no Chinese anywhere ----------
   The game's own labels are bilingual ("菜单 Menu", "主线 · Story", "悔棋 Undo", "得到 · …"). While an English-only
   book ("lang": "en") is open, the page carries body.tk-en: Chinese-only elements are hidden (style.css), and the
   Chinese part of any mixed label in the game's boxes is taken out as it's drawn. Korean (the book's own 미생) stays. */
const TKEnglish = {
  CJK: /[⺀-⿿　-〿㐀-鿿豈-﫿＀-￯]+[\s·:：]*/g,
  ROOTS: ".tk-map, .tk-duel, .tk-bag, .tk-pouch, .town-ui, .tk-head, .tk-info",
  obs: null,
  set(on) {
    document.body.classList.toggle("tk-en", !!on);
    if (!on) { if (this.obs) { this.obs.disconnect(); this.obs = null; } return; }
    if (this.obs) return;
    this.obs = new MutationObserver(ms => { for (const m of ms) this.clean(m.type === "characterData" ? m.target : m.target); });
    this.obs.observe(document.body, { subtree: true, childList: true, characterData: true });
    this.clean(document.body);
  },
  clean(node) {
    if (!node) return;
    const el = node.nodeType === 3 ? node.parentElement : node;
    if (!el || !(el.closest && (el.closest(this.ROOTS) || el.querySelector && el.querySelector(this.ROOTS)))) return;
    const fix = t => {
      if (!this.CJK.test(t.nodeValue)) return;
      this.CJK.lastIndex = 0;
      const v = t.nodeValue.replace(this.CJK, "").replace(/(\s*·\s*)+/g, " · ").replace(/^\s*·\s*|\s*·\s*$/g, "");
      if (v !== t.nodeValue) t.nodeValue = v;
    };
    if (node.nodeType === 3) return fix(node);
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let t; (t = w.nextNode());) if (t.parentElement && t.parentElement.closest(this.ROOTS)) { this.CJK.lastIndex = 0; fix(t); }
  },
};
