"use strict";

/* ================= data & progress ================= */

const cache = { index: null, books: new Map() };

async function getIndex() {
  if (!cache.index) cache.index = await (await fetch("data/index.json")).json();
  return cache.index;
}
async function getBook(id) {
  if (!cache.books.has(id))
    cache.books.set(id, await (await fetch(`data/books/${id}.json`)).json());
  return cache.books.get(id);
}

const PROGRESS_KEY = "gt-progress";
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}
function markResult(bookId, pid, ok) {
  const prog = loadProgress();
  const b = prog[bookId] || (prog[bookId] = {});
  if (ok) b[pid] = 1;                    // solved sticks
  else if (b[pid] !== 1) b[pid] = -1;    // failed only if never solved
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  Sync.scheduleSave();
}

const FAVORITES_KEY = "gt-favorites";
function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []); }
  catch { return new Set(); }
}
function toggleFavorite(bookId) {
  const favs = loadFavorites();
  favs.has(bookId) ? favs.delete(bookId) : favs.add(bookId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  Sync.scheduleSave();
}

/* ================= account sync (Google Sheet via Apps Script, username only) ================= */

const Sync = {
  // Public by design: this URL only lets a caller read/write one row keyed
  // by a username they supply, in a Sheet with nothing else in it. It's a
  // Google Apps Script Web App, not a credential — nothing here can be
  // "revoked" the way a leaked API token would be.
  API_URL: "https://script.google.com/macros/s/AKfycbwpMBFBjrgcHdX-xiAwIepUg4a06uLPrBlGWBAPuPkUOc30gzzsCHRy6odjI6qYLV8AKA/exec",
  USERNAME_KEY: "gt-username",
  username: null,
  saveTimer: null,

  async init() {
    this.username = localStorage.getItem(this.USERNAME_KEY);
    this.renderChip();
    if (this.username) this.pullAndMerge().then(route).catch(e => console.error("[sync]", e));
    else this.promptUsername();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden") return;
      if (this.saveTimer) { clearTimeout(this.saveTimer); this.save("progress", { progress: loadProgress(), favorites: [...loadFavorites()] }); }
      if (Review.saveTimer) { clearTimeout(Review.saveTimer); Review.saveState(); }
    });
  },

  // kind selects which Sheet the Apps Script reads/writes ("progress" or
  // "review") — separate rows, so a large review blob can never break
  // solved-problem sync, and vice versa.
  async fetchRemote(kind = "progress") {
    if (!this.username) return {};
    const res = await fetch(`${this.API_URL}?username=${encodeURIComponent(this.username)}&kind=${kind}`);
    if (!res.ok) { console.error("[sync] fetch failed", kind, res.status); return {}; }
    const body = await res.json();
    return body.data || {};
  },

  // Pull this username's row, merge into local (solved sticks, favorites
  // union), so a fresh browser/device picks up prior progress + favorites.
  async pullAndMerge() {
    const remote = await this.fetchRemote("progress");
    const local = loadProgress();
    for (const bookId in remote.progress || {}) {
      const b = local[bookId] || (local[bookId] = {});
      for (const pid in remote.progress[bookId]) if (b[pid] !== 1) b[pid] = remote.progress[bookId][pid];
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(local));
    const favs = loadFavorites();
    for (const bookId of remote.favorites || []) favs.add(bookId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  },

  scheduleSave() {
    if (!this.username) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save("progress", { progress: loadProgress(), favorites: [...loadFavorites()] }), 3000);
  },

  // Google Sheets caps a cell at 50,000 characters — stay well clear of it
  // rather than send a doomed request. extra merges in e.g. {id} for
  // per-row "review" games, or {id, delete:true} to remove one.
  async save(kind, data, extra) {
    if (!this.username) return;
    const payload = JSON.stringify({ username: this.username, kind, data, ...extra });
    if (payload.length > 48000) { console.error("[sync] save skipped, too large", kind, payload.length); return; }
    // text/plain avoids a CORS preflight that Apps Script web apps don't handle.
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
    });
    if (!res.ok) console.error("[sync] save failed", kind, res.status, await res.text());
  },

  // Anonymous is fine — feedback doesn't require a username.
  async sendFeedback(message) {
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        username: this.username || "",
        kind: "feedback",
        data: { message, context: location.hash },
      }),
    });
    if (!res.ok) throw new Error(`feedback failed (${res.status})`);
  },

  renderChip() {
    const chip = document.getElementById("authChip");
    if (!chip) return;
    chip.innerHTML = "";
    if (this.username) {
      chip.append(
        h("span", { class: "email" }, `Playing as ${this.username}`),
        h("span", { class: "signout", onclick: e => { e.stopPropagation(); this.promptUsername(); } }, "Switch")
      );
    } else {
      chip.textContent = "Choose a username to sync progress";
    }
    chip.onclick = () => this.promptUsername();
  },

  promptUsername() {
    const backdrop = document.getElementById("authModalBackdrop");
    const modal = document.getElementById("authModal");
    const close = () => { backdrop.hidden = true; };
    backdrop.onclick = e => { if (e.target === backdrop) close(); };

    modal.innerHTML = "";
    const name = h("input", { type: "text", autocomplete: "off",
                              placeholder: this.username || "Username" });
    const msg = h("div", { class: "msg" }, "No password — anyone who types this name loads its progress.");
    const saveBtn = h("button", {
      onclick: () => {
        const val = name.value.trim();
        if (!val) { msg.textContent = "Enter a username."; msg.className = "msg err"; return; }
        localStorage.setItem(this.USERNAME_KEY, val);
        this.username = val;
        name.value = "";
        this.renderChip();
        close();
        route();
        this.pullAndMerge().then(route).catch(e => console.error("[sync]", e));
      },
    }, "Save");
    modal.append(
      h("h3", {}, "Username"),
      name, msg,
      h("div", { class: "row" }, [
        h("button", { class: "ghost", onclick: close }, "Cancel"),
        saveBtn,
      ])
    );
    backdrop.hidden = false;
    name.focus();
  },
};

/* ================= engine (KataGo via bundled web-katrain worker) ================= */

const Engine = {
  worker: null, status: "off", backend: null, initPromise: null,
  pending: new Map(), seq: 0,
  // Tried in order. The b18 net is ~98 MB but handles unusual komi and
  // handicap games; the small net is the fallback when b18 can't load
  // (e.g. not enough GPU memory on older phones).
  MODELS: ["engine/katago-b18.bin.gz", "engine/katago-small.bin.gz"],
  modelIndex: 0, modelUrl: null,

  setStatus(status, detail) {
    this.status = status; this.detail = detail || "";
    const chip = document.getElementById("engineChip");
    const text = document.getElementById("engineChipText");
    if (!chip) return;
    const dot = chip.querySelector(".dot");
    const msgs = {
      off: "KataGo: click to load",
      loading: "KataGo: loading…",
      ready: `KataGo: ready · ${this.backend || ""}`,
      busy: "KataGo: thinking…",
      error: `KataGo: error${this.detail ? " · " + this.detail : ""}`,
    };
    text.textContent = msgs[status] || status;
    dot.style.background = { ready: "#3f8f63", busy: "#c9a227", loading: "#c9a227", error: "#b0413e" }[status] || "#c9c2b2";
  },

  ensure() {
    if (!this.initPromise) {
      this.initPromise = new Promise((resolve, reject) => { this.initSettle = { resolve, reject }; });
      this.startWorker();
    }
    return this.initPromise;
  },

  startWorker() {
    this.setStatus("loading");
    this.modelUrl = new URL(this.MODELS[this.modelIndex], location.href).href;
    this.worker = new Worker("engine/katago-worker.js");
    this.worker.onmessage = e => this.onMessage(e.data);
    this.worker.onerror = e => { console.error(e); this.initFailed("worker failed"); };
    this.worker.postMessage({ type: "katago:init", modelUrl: this.modelUrl, backend: "auto" });
  },

  initFailed(error) {
    if (this.status !== "loading") { this.setStatus("error", error); return; }
    this.worker.terminate();
    if (this.modelIndex + 1 < this.MODELS.length) {
      console.warn(`[katago] ${this.MODELS[this.modelIndex]} failed (${error}); falling back`);
      this.modelIndex++;
      this.startWorker();
      return;
    }
    this.modelIndex = 0;
    this.setStatus("error", error);
    this.initSettle.reject(new Error(error));
    this.initPromise = null;
  },

  onMessage(msg) {
    if (msg.type === "katago:init_result") {
      if (msg.ok) {
        this.backend = msg.backend || "?";
        this.setStatus("ready");
        this.initSettle.resolve();
      } else {
        this.initFailed(msg.error);
      }
    } else if (msg.type === "katago:analyze_result") {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (this.pending.size === 0 && this.status === "busy") this.setStatus("ready");
      if (msg.ok) p.resolve(msg.analysis);
      else p.reject(new Error(msg.error || "analysis failed"));
    } else if (msg.type === "katago:eval_result") {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.eval);
      else p.reject(new Error(msg.error || "eval failed"));
    } else if (msg.type === "katago:notice") {
      console.info("[katago]", msg.message);
    }
  },

  // Single forward pass of the network, no search. Scores are Black-perspective.
  // Unlike analyze(), the result isn't averaged over search children, so it
  // doesn't drift toward the side that just moved.
  async evaluate(fields) {
    await this.ensure();
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({
        type: "katago:eval", id, modelUrl: this.modelUrl, backend: "auto",
        rules: "japanese", moveHistory: [], ...fields,
      });
    });
  },

  async analyze(fields) {
    await this.ensure();
    this.setStatus("busy");
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({
        type: "katago:analyze", id, modelUrl: this.modelUrl, backend: "auto",
        komi: 6.5, rules: "japanese", topK: 8, analysisPvLen: 4,
        reuseTree: true, ownershipMode: "root",
        visits: 400, maxTimeMs: 20000,
        ...fields,
      });
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Engine.setStatus("off");
  document.getElementById("engineChip").addEventListener("click", () => Engine.ensure().catch(() => {}));
});

function gridToBoardState(grid, frameStones) {
  const board = grid.map(row => row.map(v => v === 1 ? "black" : v === 2 ? "white" : null));
  if (frameStones) {
    for (const p of frameStones.black) if (!board[p.y][p.x]) board[p.y][p.x] = "black";
    for (const p of frameStones.white) if (!board[p.y][p.x]) board[p.y][p.x] = "white";
  }
  return board;
}

/* ================= board model ================= */

const N = 19, EMPTY = 0, BLACK = 1, WHITE = 2;
const cIdx = s => [s.charCodeAt(0) - 97, s.charCodeAt(1) - 97];
const COLS = "ABCDEFGHJKLMNOPQRST";
const coordLabel = m => { const [c, r] = cIdx(m); return COLS[c] + (N - r); };

function neighbors(c, r) {
  const out = [];
  if (c > 0) out.push([c - 1, r]);
  if (c < N - 1) out.push([c + 1, r]);
  if (r > 0) out.push([c, r - 1]);
  if (r < N - 1) out.push([c, r + 1]);
  return out;
}

function groupAndLiberties(g, c, r) {
  const color = g[r][c], seen = new Set(), libs = new Set(), stack = [[c, r]];
  while (stack.length) {
    const [x, y] = stack.pop(), key = x * N + y;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const [nx, ny] of neighbors(x, y)) {
      if (g[ny][nx] === EMPTY) libs.add(nx * N + ny);
      else if (g[ny][nx] === color) stack.push([nx, ny]);
    }
  }
  return { stones: seen, libs };
}

function applyMove(g, c, r, color) {
  const g2 = g.map(row => row.slice());
  g2[r][c] = color;
  for (const [nx, ny] of neighbors(c, r)) {
    if (g2[ny][nx] === 3 - color) {
      const { stones, libs } = groupAndLiberties(g2, nx, ny);
      if (libs.size === 0) for (const k of stones) g2[k % N][(k - k % N) / N] = EMPTY;
    }
  }
  if (groupAndLiberties(g2, c, r).libs.size === 0) return null;
  return g2;
}

/* ================= goban rendering ================= */

const SVGNS = "http://www.w3.org/2000/svg";

function cropFor(problem) {
  const pts = [...problem.b, ...problem.w];
  for (const line of problem.lines) for (const m of line.slice(1)) pts.push(m);
  let c0 = 18, c1 = 0, r0 = 18, r1 = 0;
  for (const p of pts) {
    const [c, r] = cIdx(p);
    c0 = Math.min(c0, c); c1 = Math.max(c1, c);
    r0 = Math.min(r0, r); r1 = Math.max(r1, r);
  }
  c0 -= 2; c1 += 2; r0 -= 2; r1 += 2;
  while (c1 - c0 < 8) { c0--; c1++; }
  while (r1 - r0 < 8) { r0--; r1++; }
  if (c0 <= 1) c0 = 0;
  if (c1 >= 17) c1 = 18;
  if (r0 <= 1) r0 = 0;
  if (r1 >= 17) r1 = 18;
  return { c0: Math.max(0, c0), c1: Math.min(18, c1), r0: Math.max(0, r0), r1: Math.min(18, r1) };
}

class Goban {
  constructor(svg, crop, onClick) {
    this.svg = svg; this.crop = crop; this.onClick = onClick;
    this.cell = 44; this.pad = 38;
    this.W = (crop.c1 - crop.c0) * this.cell + this.pad * 2;
    this.H = (crop.r1 - crop.r0) * this.cell + this.pad * 2;
    svg.setAttribute("viewBox", `0 0 ${this.W} ${this.H}`);
    svg.setAttribute("width", Math.min(600, this.W));
    this.hoverColor = BLACK;
  }
  px(c) { return this.pad + (c - this.crop.c0) * this.cell; }
  py(r) { return this.pad + (r - this.crop.r0) * this.cell; }

  el(name, attrs, parent) {
    const e = document.createElementNS(SVGNS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || this.svg).appendChild(e);
    return e;
  }

  render(grid, lastMove, interactive) {
    const { c0, c1, r0, r1 } = this.crop;
    this.svg.innerHTML = "";
    const defs = this.el("defs", {});
    defs.innerHTML = `
      <radialGradient id="bs" cx="35%" cy="30%"><stop offset="0%" stop-color="#5a5a5a"/><stop offset="100%" stop-color="#111"/></radialGradient>
      <radialGradient id="ws" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cfcfc7"/></radialGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e3bd6a"/><stop offset="55%" stop-color="#dcb35c"/><stop offset="100%" stop-color="#d2a850"/>
      </linearGradient>`;
    this.el("rect", { x: 0, y: 0, width: this.W, height: this.H, rx: 10, fill: "url(#wood)" });

    const ext = this.pad * 0.55;
    for (let r = r0; r <= r1; r++)
      this.el("line", {
        x1: this.px(c0) - (c0 > 0 ? ext : 0), y1: this.py(r),
        x2: this.px(c1) + (c1 < 18 ? ext : 0), y2: this.py(r),
        stroke: "var(--line)", "stroke-width": (r === 0 || r === 18) ? 2.2 : 1.1,
      });
    for (let c = c0; c <= c1; c++)
      this.el("line", {
        x1: this.px(c), y1: this.py(r0) - (r0 > 0 ? ext : 0),
        x2: this.px(c), y2: this.py(r1) + (r1 < 18 ? ext : 0),
        stroke: "var(--line)", "stroke-width": (c === 0 || c === 18) ? 2.2 : 1.1,
      });

    // fade the cut edges so the board reads as continuing
    const f = this.pad * 0.8;
    if (c0 > 0) this.el("rect", { x: 0, y: 0, width: f, height: this.H, fill: "url(#wood)", opacity: .75 });
    if (c1 < 18) this.el("rect", { x: this.W - f, y: 0, width: f, height: this.H, fill: "url(#wood)", opacity: .75 });
    if (r0 > 0) this.el("rect", { x: 0, y: 0, width: this.W, height: f, fill: "url(#wood)", opacity: .75 });
    if (r1 < 18) this.el("rect", { x: 0, y: this.H - f, width: this.W, height: f, fill: "url(#wood)", opacity: .75 });

    for (const c of [3, 9, 15]) for (const r of [3, 9, 15])
      if (c >= c0 && c <= c1 && r >= r0 && r <= r1)
        this.el("circle", { cx: this.px(c), cy: this.py(r), r: 4, fill: "var(--line)" });

    const labelRow = r0 === 0 ? { y: this.py(r0) - 17, edge: true } : { y: this.py(r1) + 26, edge: false };
    for (let c = c0; c <= c1; c++)
      this.el("text", { x: this.px(c), y: labelRow.y, "text-anchor": "middle", "font-size": 12.5,
                        fill: "#7a6535", "font-weight": 600 }).textContent = COLS[c];
    const labelCol = c1 === 18 ? this.px(c1) + 21 : this.px(c0) - 21;
    for (let r = r0; r <= r1; r++)
      this.el("text", { x: labelCol, y: this.py(r) + 4.5, "text-anchor": "middle", "font-size": 12.5,
                        fill: "#7a6535", "font-weight": 600 }).textContent = N - r;

    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++)
        if (grid[r][c] !== EMPTY) {
          this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .47,
                              fill: grid[r][c] === BLACK ? "url(#bs)" : "url(#ws)",
                              stroke: "rgba(0,0,0,.35)", "stroke-width": .8 });
          if (lastMove && lastMove[0] === c && lastMove[1] === r)
            this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .2, fill: "none",
                                stroke: grid[r][c] === BLACK ? "#fff" : "#333", "stroke-width": 2 });
        }

    if (!interactive) return;
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        const t = this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .48,
                                      fill: "transparent", cursor: "pointer" });
        t.addEventListener("mouseenter", () => {
          if (grid[r][c] === EMPTY)
            t.setAttribute("fill", this.hoverColor === BLACK ? "rgba(20,20,20,.3)" : "rgba(255,255,255,.5)");
        });
        t.addEventListener("mouseleave", () => t.setAttribute("fill", "transparent"));
        t.addEventListener("click", () => this.onClick(c, r));
      }
  }

  pulse(c, r) {
    const p = this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .3, fill: "none",
                                  stroke: "var(--accent)", "stroke-width": 3 });
    p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, iterations: 3 });
    setTimeout(() => p.remove(), 2500);
  }

  renderOwnership(ownership) {
    const { c0, c1, r0, r1 } = this.crop;
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        const v = ownership[r * N + c];
        if (Math.abs(v) < 0.15) continue;
        const s = this.cell * 0.34 * Math.min(1, Math.abs(v));
        this.el("rect", {
          x: this.px(c) - s, y: this.py(r) - s, width: 2 * s, height: 2 * s, rx: 2,
          fill: v > 0 ? "#111" : "#fff", opacity: 0.55, "pointer-events": "none",
        });
      }
  }
}

/* ================= trainer (player view logic) ================= */

class Trainer {
  constructor(book, idx, els) {
    this.book = book;
    this.idx = idx;
    this.p = book.problems[idx];
    this.els = els; // { svg, boardCard, status, turnBadge, buttons... }
    this.goban = new Goban(els.svg, cropFor(this.p), (c, r) => this.click(c, r));
    this.replyTimer = null;
    this.alive = true;
    this.frameStones = undefined; // computed lazily for engine analysis
    this.reset();
  }

  serialize(g) { let s = ""; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) s += g[r][c]; return s; }

  frame() {
    if (this.frameStones === undefined) {
      const utils = globalThis.GTEngineUtils;
      this.frameStones = utils
        ? utils.buildTsumegoFrame(gridToBoardState(this.freshGrid()), { komi: 6.5, blackToPlay: true, koAllowed: true, margin: 4 })
        : null;
    }
    return this.frameStones;
  }

  freshGrid() {
    const g = Array.from({ length: N }, () => new Array(N).fill(EMPTY));
    for (const s of this.p.b) { const [c, r] = cIdx(s); g[r][c] = BLACK; }
    for (const s of this.p.w) { const [c, r] = cIdx(s); g[r][c] = WHITE; }
    return g;
  }

  reset() {
    clearTimeout(this.replyTimer);
    this.grid = this.freshGrid();
    this.history = [];
    this.played = [];
    this.lastMove = null;
    this.done = null;         // null | "ok" | "bad"
    this.explore = null;      // null | snapshot taken when entering explore
    this.posHistory = [this.serialize(this.grid)]; // for the ko/superko rule
    this.ownership = null;    // ownership overlay from Judge
    this.engineBusy = false;
    this.render();
    this.setStatus("", "", "");
  }

  onTree() { return this.consistentLines().length > 0; }

  /* positional superko: a move may not recreate any earlier position */
  koViolation(g2) { return this.posHistory.includes(this.serialize(g2)); }

  /* --- variation tree --- */
  consistentLines() {
    return this.p.lines.filter(L =>
      this.played.length <= L.length - 1 &&
      this.played.every((m, i) => m === L[i + 1]));
  }
  engineReply() {
    const ls = this.consistentLines().filter(L => L.length - 1 > this.played.length);
    if (!ls.length) return null;
    ls.sort((a, b) => a[0] - b[0] || b.length - a.length);
    return ls[0][this.played.length + 1];
  }
  terminal() {
    const ls = this.consistentLines();
    if (ls.some(L => L.length - 1 > this.played.length)) return null;
    const done = ls.filter(L => L.length - 1 === this.played.length);
    if (done.some(L => L[0] <= 2)) return "ok";
    if (done.some(L => L[0] === 3)) return "bad";
    return null;
  }

  /* --- interaction --- */
  turnColor() { return this.played.length % 2 === 0 ? BLACK : WHITE; }

  click(c, r) {
    if (this.explore) return this.exploreClick(c, r);
    if (this.done || this.engineBusy || this.turnColor() !== BLACK) return;
    if (this.grid[r][c] !== EMPTY) return;
    const mv = String.fromCharCode(97 + c) + String.fromCharCode(97 + r);

    const treeMove = this.p.lines.some(L =>
      this.played.length < L.length - 1 &&
      this.played.every((m, i) => m === L[i + 1]) &&
      L[this.played.length + 1] === mv);

    if (!treeMove) {
      if (Engine.status !== "ready") {
        if (Engine.status === "off" || Engine.status === "error") {
          this.setStatus("off", "◌", "Off tree · loading KataGo…");
          Engine.ensure().then(() => { if (this.alive) this.setStatus("off", "◌", "Engine ready — play your move"); })
            .catch(() => { if (this.alive) this.setStatus("off", "◌", "Engine failed to load"); });
        } else {
          this.setStatus("off", "◌", "Off tree · engine still loading…");
        }
        return;
      }
      const g2 = applyMove(this.grid, c, r, BLACK);
      if (!g2) return;
      if (this.koViolation(g2)) { this.setStatus("off", "◌", "Ko"); return; }
      this.push();
      this.grid = g2;
      this.played = [...this.played, mv];
      this.lastMove = [c, r];
      this.posHistory.push(this.serialize(this.grid));
      this.ownership = null;
      this.setStatus("", "◈", "Engine play");
      this.render();
      this.engineTurn();
      return;
    }

    this.push();
    this.grid = applyMove(this.grid, c, r, BLACK);
    this.played = [...this.played, mv];
    this.lastMove = [c, r];
    this.posHistory.push(this.serialize(this.grid));
    this.ownership = null;
    this.setStatus("", "", "");
    this.render();

    const t = this.terminal();
    if (t) return this.finish(t);

    const reply = this.engineReply();
    if (reply) this.replyTimer = setTimeout(() => {
      const [rc, rr] = cIdx(reply);
      this.grid = applyMove(this.grid, rc, rr, WHITE);
      this.played = [...this.played, reply];
      this.lastMove = [rc, rr];
      this.posHistory.push(this.serialize(this.grid));
      this.render();
      const t2 = this.terminal();
      if (t2) this.finish(t2);
    }, 350);
  }

  moveHistoryForEngine() {
    return this.played.slice(-8).map((m, i, arr) => {
      const [x, y] = cIdx(m);
      const idxFromStart = this.played.length - arr.length + i;
      return { x, y, player: idxFromStart % 2 === 0 ? "black" : "white" };
    });
  }

  async engineTurn() {
    this.engineBusy = true;
    this.render();
    const myGrid = this.grid;
    try {
      const frame = this.frame();
      const analysis = await Engine.analyze({
        board: gridToBoardState(this.grid, frame),
        currentPlayer: "white",
        moveHistory: this.moveHistoryForEngine(),
        regionOfInterest: frame && frame.region ? frame.region : null,
      });
      if (!this.alive || this.grid !== myGrid || this.explore) return;
      const candidates = (analysis.moves || []).filter(m =>
        m.x >= 0 && m.x < N && m.y >= 0 && m.y < N && this.grid[m.y][m.x] === EMPTY);
      let placed = false;
      for (const m of candidates) {
        const g2 = applyMove(this.grid, m.x, m.y, WHITE);
        if (!g2 || this.koViolation(g2)) continue;
        const mv = String.fromCharCode(97 + m.x) + String.fromCharCode(97 + m.y);
        this.grid = g2;
        this.played = [...this.played, mv];
        this.lastMove = [m.x, m.y];
        this.posHistory.push(this.serialize(this.grid));
        placed = true;
        break;
      }
      const lead = analysis.rootScoreLead ?? 0;
      const score = `${lead >= 0 ? "B" : "W"}+${Math.abs(lead).toFixed(1)}`;
      this.setStatus("", "◈", placed ? `Engine play · ${score}` : `Engine passes · ${score}`);
    } catch (err) {
      if (this.alive) this.setStatus("off", "◌", "Engine error");
      console.error(err);
    } finally {
      if (this.alive) { this.engineBusy = false; this.render(); }
    }
  }

  finish(kind) {
    this.done = kind;
    markResult(this.book.id, this.p.id, kind === "ok");
    this.setStatus(kind, kind === "ok" ? "✓" : "✗", kind === "ok" ? "Correct" : "Wrong");
    this.render();
  }

  push() {
    this.history.push({ grid: this.grid, played: this.played.slice(), lastMove: this.lastMove,
                        done: this.done, posLen: this.posHistory.length });
  }

  undo() {
    clearTimeout(this.replyTimer);
    if (this.engineBusy) return;
    const s = this.history.pop();
    if (!s) return;
    this.grid = s.grid; this.lastMove = s.lastMove;
    this.posHistory.length = s.posLen;
    if (this.explore) {
      this.exploreTurn = s.turn;
    } else {
      this.played = s.played;
      this.done = null;
    }
    this.ownership = null;
    this.setStatus("", "", "");
    this.render();
  }

  hint() {
    if (this.explore || this.done) return;
    const best = this.p.lines.find(L => L[0] === 1 &&
      this.played.every((m, i) => m === L[i + 1]) && L.length - 1 > this.played.length);
    if (!best) return;
    const [c, r] = cIdx(best[this.played.length + 1]);
    this.goban.pulse(c, r);
  }

  /* --- explore mode: play both colors freely, then restore the attempt --- */
  toggleExplore() {
    clearTimeout(this.replyTimer);
    if (this.engineBusy) return;
    if (this.explore) {
      const s = this.explore;
      this.grid = s.grid; this.played = s.played; this.lastMove = s.lastMove;
      this.done = s.done; this.history = s.history;
      this.posHistory.length = s.posLen;
      this.explore = null;
    } else {
      this.explore = { grid: this.grid, played: this.played.slice(), lastMove: this.lastMove,
                       done: this.done, history: this.history, posLen: this.posHistory.length };
      this.history = [];
      this.exploreTurn = this.turnColor();
    }
    this.ownership = null;
    this.setStatus("", "", "");
    this.render();
  }

  exploreClick(c, r) {
    if (this.grid[r][c] !== EMPTY) return;
    const g2 = applyMove(this.grid, c, r, this.exploreTurn);
    if (!g2) return;
    if (this.koViolation(g2)) { this.setStatus("off", "◌", "Ko"); return; }
    this.history.push({ grid: this.grid, lastMove: this.lastMove, turn: this.exploreTurn,
                        posLen: this.posHistory.length });
    this.grid = g2;
    this.lastMove = [c, r];
    this.posHistory.push(this.serialize(this.grid));
    this.exploreTurn = 3 - this.exploreTurn;
    this.ownership = null;
    this.setStatus("", "", "");
    this.render();
  }

  /* --- rendering --- */
  setStatus(cls, icon, text) {
    this.els.status.className = cls;
    this.els.status.innerHTML = icon ? `<span class="icon">${icon}</span><span>${text}</span>` : "";
  }

  render() {
    this.goban.hoverColor = this.explore ? this.exploreTurn : BLACK;
    const interactive = this.explore
      ? !this.engineBusy
      : (!this.done && !this.engineBusy && this.turnColor() === BLACK);
    this.goban.render(this.grid, this.lastMove, interactive);
    if (this.ownership) this.goban.renderOwnership(this.ownership);
    this.els.boardCard.classList.toggle("explore", !!this.explore);
    this.els.btnExplore.classList.toggle("active", !!this.explore);
    this.els.btnExplore.textContent = this.explore ? "Resume" : "Explore";
    this.els.turnBadge.textContent = this.explore
      ? (this.exploreTurn === BLACK ? "Explore · Black" : "Explore · White")
      : this.done ? "—" : this.engineBusy ? "White thinking…" : "Black to play";
  }
}

/* ================= SGF game parsing (main line) ================= */

function parseSgf(text) {
  let i = 0;
  const err = m => { throw new Error(m); };
  function skipWs() { while (i < text.length && /\s/.test(text[i])) i++; }
  function parseTree() {
    skipWs();
    if (text[i] !== "(") err("expected (");
    i++;
    const nodes = [], subtrees = [];
    skipWs();
    while (i < text.length) {
      skipWs();
      if (text[i] === ";") { i++; nodes.push(parseNode()); }
      else if (text[i] === "(") subtrees.push(parseTree());
      else if (text[i] === ")") { i++; return { nodes, subtrees }; }
      else err("unexpected char " + text[i]);
    }
    err("unterminated tree");
  }
  function parseNode() {
    const props = {};
    for (;;) {
      skipWs();
      const m = /^[A-Za-z]+/.exec(text.slice(i));
      if (!m || text[i] === ";" || text[i] === "(" || text[i] === ")") return props;
      const ident = m[0].toUpperCase();
      i += m[0].length;
      const vals = [];
      skipWs();
      while (text[i] === "[") {
        i++;
        let v = "";
        while (i < text.length && text[i] !== "]") {
          if (text[i] === "\\") i++;
          v += text[i++];
        }
        i++; // ]
        vals.push(v);
        skipWs();
      }
      props[ident] = vals;
    }
  }
  const root = parseTree();
  const nodes = [];
  let t = root;
  for (;;) {
    nodes.push(...t.nodes);
    if (!t.subtrees.length) break;
    t = t.subtrees[0]; // main line
  }
  return nodes;
}

function gameFromSgf(text) {
  const nodes = parseSgf(text);
  if (!nodes.length) throw new Error("empty SGF");
  const head = nodes[0];
  const size = head.SZ ? parseInt(head.SZ[0], 10) : 19;
  if (size !== 19) throw new Error(`only 19×19 supported (got ${size})`);
  const meta = {
    black: (head.PB || [""])[0], white: (head.PW || [""])[0],
    result: (head.RE || [""])[0],
    komi: head.KM ? parseFloat(head.KM[0]) : 6.5,
  };
  const setup = { black: [], white: [] };
  const moves = [];
  for (const node of nodes) {
    for (const [prop, list] of [["AB", setup.black], ["AW", setup.white]])
      if (node[prop]) for (const v of node[prop]) if (v.length === 2) list.push(v);
    for (const [prop, color] of [["B", BLACK], ["W", WHITE]])
      if (node[prop]) {
        const v = node[prop][0] || "";
        const pass = v.length !== 2 || v === "tt";
        moves.push(pass ? { color, pass: true } : { color, c: v.charCodeAt(0) - 97, r: v.charCodeAt(1) - 97 });
      }
  }
  if (!moves.length) throw new Error("no moves found");

  // What KataGo's komi input actually is under territory scoring (Japanese, the
  // rules we always evaluate with): komi plus (black minus white) stones on the
  // *starting* board -- BoardHistory::whiteBonusScore. Without it a handicap game
  // reads several points too good for Black.
  meta.engineKomi = meta.komi + (setup.black.length - setup.white.length);

  // precompute the position after every move
  const grids = [];
  let g = Array.from({ length: N }, () => new Array(N).fill(EMPTY));
  for (const s of setup.black) g[cIdx(s)[1]][cIdx(s)[0]] = BLACK;
  for (const s of setup.white) g[cIdx(s)[1]][cIdx(s)[0]] = WHITE;
  grids.push(g);
  for (const m of moves) {
    if (!m.pass) {
      const g2 = applyMove(g, m.c, m.r, m.color);
      if (g2) g = g2;
      else { g = g.map(row => row.slice()); g[m.r][m.c] = m.color; } // tolerate odd records
    }
    grids.push(g);
  }
  return { meta, moves, grids, n: moves.length };
}

/* ================= game review ================= */

const CHART_SERIES = "#3566b0";   // validated vs #fff (dataviz palette check)
const CHART_STATUS = "#b0413e";

const Review = {
  game: null,
  node: null,         // current tree node
  mainNodes: [],      // main-line nodes by position index 0..n
  analyses: [],       // per main position 0..n: {w, s} | undefined
  analyzing: false, runId: 0,
  ownership: null,
  els: null, goban: null,
  showHints: true,
  movesOpen: true,
  details: new Map(), // serialized board+turn -> full analysis (with .moves)
  quick: new Map(),   // same key -> raw network eval (no search), for the readout when hints are off
  detailSeq: 0,
  _q: Promise.resolve(),

  // persistence: a history of loaded games (SGF + explored tree + analysis),
  // local to this browser and synced separately from progress/favorites.
  HISTORY_KEY: "gt-review-history",
  MAX_LOCAL: 50,   // history entries kept in this browser
  sgfText: null,
  currentId: null,
  saveTimer: null,
  restoredOnce: false,

  // the worker cancels an in-flight analysis when a new one arrives, so all
  // review engine calls go through one queue
  enqueue(fn) {
    const run = this._q.then(fn, fn);
    this._q = run.catch(() => {});
    return run;
  },

  load(text) {
    this.game = gameFromSgf(text);
    this.sgfText = text;
    this.analyses = new Array(this.game.n + 1);
    this.losses = new Array(this.game.n);   // points lost by move k, from a search of the position before it
    this.analyzing = false;
    this.runId++;
    this.ownership = null;
    this.details.clear();
    this.quick.clear();
    // move tree: the game is the main line, played branches persist as children
    const root = { move: null, parent: null, children: [], main: 0,
                   grid: this.game.grids[0], key: this.game.grids[0].flat().join("") };
    this.mainNodes = [root];
    let prev = root;
    this.game.moves.forEach((m, i) => {
      const grid = this.game.grids[i + 1];
      const node = { move: m, parent: prev, children: [], main: i + 1,
                     grid, key: grid.flat().join("") };
      prev.children.push(node);
      prev = node;
    });
    this.mainNodes = [root, ...(function walk(n, acc) {
      while (n.children.length) { n = n.children[0]; acc.push(n); }
      return acc;
    })(root, [])];
    this.node = root;
  },

  /* ---- persistence (local to this browser) ---- */
  serializeTree(node) {
    return { move: node.move, main: node.main, note: node.note || undefined, children: node.children.map(c => this.serializeTree(c)) };
  },
  rebuildNode(obj, parent) {
    const grid = !obj.move ? parent.grid
      : obj.move.pass ? parent.grid
      : (applyMove(parent.grid, obj.move.c, obj.move.r, obj.move.color) || parent.grid.map(row => row.slice()));
    const node = { move: obj.move, parent, children: [], main: obj.main, grid, key: grid.flat().join("") };
    if (obj.note) node.note = obj.note;
    node.children = (obj.children || []).map(c => this.rebuildNode(c, node));
    return node;
  },
  collectMainLine(root) {
    const acc = [];
    let n = root;
    for (let next; (next = n.children.find(c => c.main !== undefined));) { acc.push(next); n = next; }
    return acc;
  },
  nodePath(node) {
    const path = [];
    for (let n = node; n.parent; n = n.parent) path.unshift(n.parent.children.indexOf(n));
    return path;
  },
  nodeAtPath(path) {
    let n = this.mainNodes[0];
    for (const i of path) { if (!n.children[i]) break; n = n.children[i]; }
    return n;
  },

  newId() { return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  titleFor() {
    const m = this.game.meta;
    const who = `${m.black || "Black"} vs ${m.white || "White"}`;
    return m.result ? `${who} · ${m.result}` : `${who} · ${this.game.n} moves`;
  },

  loadHistory() {
    try { return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || []; }
    catch { return []; }
  },
  saveHistoryLocal(hist) {
    try { localStorage.setItem(this.HISTORY_KEY, JSON.stringify(hist)); }
    catch (e) { console.error("[review] save failed", e); }
  },

  buildEntry() {
    const existing = this.loadHistory().find(g => g.id === this.currentId);
    return {
      id: this.currentId, savedAt: Date.now(),
      name: existing ? existing.name : null,   // user-given, overrides title in the list
      title: this.titleFor(),                  // auto-derived fallback
      sgf: this.sgfText,
      tree: this.serializeTree(this.mainNodes[0]),
      path: this.nodePath(this.node),
      analyses: this.analyses,
      losses: this.losses,
      showHints: this.showHints,
      movesOpen: this.movesOpen,
    };
  },

  // Upserts the current game into local history (most-recent first) and
  // pushes just this one game to its own synced row — no shared-cell size
  // limit to worry about, since each game is its own row.
  saveState() {
    if (!this.game) return;
    if (!this.currentId) this.currentId = this.newId();
    const entry = this.buildEntry();
    const hist = [entry, ...this.loadHistory().filter(g => g.id !== entry.id)].slice(0, this.MAX_LOCAL);
    this.saveHistoryLocal(hist);
    if (Sync.username) Sync.save("review", entry, { id: entry.id });
  },
  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveState(), 800);
  },

  openFromHistory(id) {
    const entry = this.loadHistory().find(g => g.id === id);
    return entry ? this.applyState(entry) : false;
  },
  renameHistory(id, name) {
    const hist = this.loadHistory();
    const entry = hist.find(g => g.id === id);
    if (!entry) return;
    entry.name = name && name.trim() ? name.trim() : null;
    this.saveHistoryLocal(hist);
    if (Sync.username) Sync.save("review", entry, { id });
  },
  deleteFromHistory(id) {
    const hist = this.loadHistory().filter(g => g.id !== id);
    this.saveHistoryLocal(hist);
    if (Sync.username) Sync.save("review", {}, { id, delete: true });
    if (this.currentId === id) { this.game = null; this.currentId = null; }
  },

  // Rebuilds this.game/this.node/etc. from a saved entry (local or remote).
  // Returns true on success.
  applyState(raw) {
    if (!raw || !raw.sgf) return false;
    try {
      this.load(raw.sgf);
      this.currentId = raw.id || this.newId();
      if (raw.tree) {
        const root = this.mainNodes[0];
        if (raw.tree.note) root.note = raw.tree.note;
        root.children = (raw.tree.children || []).map(c => this.rebuildNode(c, root));
        this.mainNodes = [root, ...this.collectMainLine(root)];
      }
      if (Array.isArray(raw.analyses)) this.analyses = raw.analyses;
      if (Array.isArray(raw.losses)) this.losses = raw.losses;
      if (typeof raw.showHints === "boolean") this.showHints = raw.showHints;
      if (typeof raw.movesOpen === "boolean") this.movesOpen = raw.movesOpen;
      this.node = (raw.path && this.nodeAtPath(raw.path)) || this.mainNodes[0];
      return true;
    } catch (e) {
      console.error("[review] restore failed", e);
      this.game = null;
      this.currentId = null;
      return false;
    }
  },

  // Local-only, synchronous — the fast path for a returning visit on this
  // device: reopen whatever was saved most recently.
  restoreState() {
    const hist = this.loadHistory();
    return hist.length ? this.applyState(hist[0]) : false;
  },

  // Async, runs once per session: merge this username's synced history into
  // local (by id, newer savedAt wins), and if this device has nothing open
  // yet, open the most recently saved entry. Returns true if a re-render is
  // warranted (history list changed, or a game got opened).
  async pullRemoteFallback() {
    if (!Sync.username) return false;
    const remote = await Sync.fetchRemote("review");
    const remoteGames = Array.isArray(remote.games) ? remote.games : [];
    if (!remoteGames.length) return false;
    const byId = new Map(this.loadHistory().map(g => [g.id, g]));
    let changed = false;
    for (const g of remoteGames) {
      const existing = byId.get(g.id);
      if (!existing || (g.savedAt || 0) > (existing.savedAt || 0)) { byId.set(g.id, g); changed = true; }
    }
    if (changed) {
      const merged = [...byId.values()].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)).slice(0, this.MAX_LOCAL);
      this.saveHistoryLocal(merged);
    }
    if (!this.game) {
      const hist = this.loadHistory();
      if (hist.length) return this.applyState(hist[0]);
    }
    return changed;
  },

  get cur() { return this.mainAncestor().main; },
  mainAncestor() { let n = this.node; while (n.main === undefined) n = n.parent; return n; },
  varDepth() { let d = 0, n = this.node; while (n.main === undefined) { d++; n = n.parent; } return d; },

  curGrid() { return this.node.grid; },
  curTurn() {
    if (this.node.move) return 3 - this.node.move.color;
    return this.game.moves.length ? this.game.moves[0].color : BLACK;
  },
  curLastMove() {
    const m = this.node.move;
    return m && !m.pass ? [m.c, m.r] : null;
  },
  detailKey() { return this.curTurn() + ":" + this.node.key; },

  setNode(node) {
    this.node = node;
    this.ownership = null;
    this.renderBoard(); this.renderReadout(); this.renderChart();
    this.renderActions(); this.renderVariations(); this.renderNote();
    if (this.showHints) this.fetchDetail(); else this.quickEval();
    this.scheduleSave();
  },

  renderNote() {
    if (!this.els || !this.els.note) return;
    this.els.note.value = this.node.note || "";
  },

  onNoteInput(text) {
    const had = !!this.node.note;
    if (text) this.node.note = text; else delete this.node.note;
    if (had !== !!text) this.renderVariations();
    this.scheduleSave();
  },

  /* ---- tree editing ---- */
  click(c, r) {
    if (!this.game) return;
    if (this.curGrid()[r][c] !== EMPTY) return;
    const color = this.curTurn();
    const existing = this.node.children.find(ch =>
      ch.move && !ch.move.pass && ch.move.c === c && ch.move.r === r && ch.move.color === color);
    if (existing) return this.setNode(existing);
    const g2 = applyMove(this.curGrid(), c, r, color);
    if (!g2) return;
    const key = g2.flat().join("");
    for (let n = this.node; n; n = n.parent) if (n.key === key) return; // ko / superko
    const node = { move: { c, r, color }, parent: this.node, children: [], grid: g2, key };
    this.node.children.push(node);
    this.setNode(node);
  },

  deleteBranch() {
    const n = this.node;
    if (n.main !== undefined || !n.parent) return; // never delete the game itself
    n.parent.children.splice(n.parent.children.indexOf(n), 1);
    this.setNode(n.parent);
  },

  async engineMove() {
    if (!this.game || Engine.status === "off" || Engine.status === "error") { Engine.ensure().catch(() => {}); return; }
    const at = this.node;
    try {
      const a = await this.fetchDetail();
      if (!a || this.node !== at) return;
      for (const m of a.moves || []) {
        if (m.x < 0 || m.x >= N || m.y < 0 || m.y >= N) continue;
        if (this.curGrid()[m.y][m.x] !== EMPTY) continue;
        const g2 = applyMove(this.curGrid(), m.x, m.y, this.curTurn());
        if (!g2) continue;
        const key = g2.flat().join("");
        let seen = false;
        for (let n = this.node; n; n = n.parent) if (n.key === key) { seen = true; break; }
        if (seen) continue;
        this.click(m.x, m.y);
        return;
      }
    } catch (e) { console.error(e); }
  },

  // Score for the readout without a search: only needed for nodes the
  // whole-game analysis doesn't cover (branches), and only one forward pass.
  async quickEval() {
    if (!this.game || (Engine.status !== "ready" && Engine.status !== "busy")) return;
    if (this.node.main !== undefined && this.analyses[this.node.main]) return;
    const key = this.detailKey();
    if (this.quick.has(key)) { this.renderReadout(); return; }
    const par = this.node.parent, gp = par && par.parent;
    try {
      const e = await Engine.evaluate({
        board: gridToBoardState(this.curGrid()),
        previousBoard: par ? gridToBoardState(par.grid) : undefined,
        previousPreviousBoard: gp ? gridToBoardState(gp.grid) : undefined,
        currentPlayer: this.curTurn() === BLACK ? "black" : "white",
        komi: this.game.meta.engineKomi,
      });
      if (this.quick.size > 300) this.quick.clear();
      this.quick.set(key, e);
      if (this.els && key === this.detailKey()) this.renderReadout();
    } catch (err) { console.error(err); }
  },

  /* ---- best-move detail for the current position ---- */
  async fetchDetail(visits) {
    if (!this.game || Engine.status !== "ready") return null;
    const key = this.detailKey();
    if (this.details.has(key) && !visits) {
      this.renderBoard();
      return this.details.get(key);
    }
    const board = gridToBoardState(this.curGrid());
    const player = this.curTurn() === BLACK ? "black" : "white";
    const seq = ++this.detailSeq;
    try {
      const a = await this.enqueue(() => this.details.get(key) || Engine.analyze({
        board, currentPlayer: player,
        moveHistory: [], komi: this.game.meta.engineKomi,
        visits: visits || 200, ownershipMode: "none",
      }));
      if (this.details.size > 300) this.details.clear();
      this.details.set(key, a);
      if (seq === this.detailSeq && this.els) { this.renderBoard(); this.renderReadout(); }
      return a;
    } catch (e) { console.error(e); return null; }
  },

  toMoveAt(k) {
    const g = this.game;
    if (k < g.n) return g.moves[k].color;
    return g.n ? 3 - g.moves[g.n - 1].color : BLACK;
  },

  moveLabel(k) { // move k (0-based) as text
    const m = this.game.moves[k];
    const who = m.color === BLACK ? "B" : "W";
    return `${who} ${m.pass ? "pass" : COLS[m.c] + (N - m.r)}`;
  },

  jump(k) {
    this.setNode(this.mainNodes[Math.max(0, Math.min(this.game.n, k))]);
  },
  back() { if (this.node.parent) this.setNode(this.node.parent); },
  forward() { if (this.node.children.length) this.setNode(this.node.children[0]); },
  sibling(dir) {
    const p = this.node.parent;
    if (!p) return;
    const j = p.children.indexOf(this.node) + dir;
    if (j >= 0 && j < p.children.length) this.setNode(p.children[j]);
  },

  mistakes() {
    const out = [];
    for (let k = 0; k < this.game.n; k++) {
      const loss = this.losses[k];
      if (loss != null && loss >= 1.5) out.push({ k, loss });
    }
    out.sort((x, y) => y.loss - x.loss);
    return out.slice(0, 6).sort((x, y) => x.k - y.k);
  },

  // Points the mover gave up with move k: the best move's score minus the
  // played move's, both taken from one search of the position *before* the
  // move. Comparing two moves' after-positions this way cancels the
  // side-to-move effect that makes comparing consecutive position scores
  // reward whoever just moved (the network can't see a tactic until it's played).
  async movePointsLost(k) {
    const g = this.game, m = g.moves[k];
    if (m.pass) return 0;
    const player = m.color === BLACK ? "black" : "white";
    const sign = m.color === BLACK ? 1 : -1;
    const hist = [];
    for (let j = Math.max(0, k - 6); j < k; j++) {
      const q = g.moves[j];
      if (!q.pass) hist.push({ x: q.c, y: q.r, player: q.color === BLACK ? "black" : "white" });
    }
    const a = await this.enqueue(() => Engine.analyze({
      board: gridToBoardState(g.grids[k]), currentPlayer: player, moveHistory: hist,
      komi: g.meta.engineKomi, visits: 100, ownershipMode: "none", topK: 10, analysisPvLen: 1, reuseTree: false,
    }));
    const best = (a.moves || [])[0];
    if (!best) return 0;
    const played = a.moves.find(c => c.x === m.c && c.y === m.r);
    if (played) return Math.max(0, played.relativePointsLost);
    // Not among the searched candidates: search the position it leads to instead.
    const child = await this.enqueue(() => Engine.analyze({
      board: gridToBoardState(g.grids[k + 1]), currentPlayer: player === "black" ? "white" : "black",
      moveHistory: [...hist, { x: m.c, y: m.r, player }].slice(-6),
      komi: g.meta.engineKomi, visits: 100, ownershipMode: "none", topK: 1, analysisPvLen: 1, reuseTree: false,
    }));
    return Math.max(0, sign * (best.scoreLead - child.rootScoreLead));
  },

  async analyzeAll() {
    if (this.analyzing || !this.game) return;
    this.analyzing = true;
    const run = ++this.runId;
    const g = this.game;
    try {
      await Engine.ensure();
      for (let k = 0; k <= g.n; k++) {
        if (this.runId !== run || !location.hash.startsWith("#/review")) break;
        if (this.analyses[k]) continue;
        try {
          const a = await this.enqueue(() => Engine.evaluate({
            board: gridToBoardState(g.grids[k]),
            previousBoard: k > 0 ? gridToBoardState(g.grids[k - 1]) : undefined,
            previousPreviousBoard: k > 1 ? gridToBoardState(g.grids[k - 2]) : undefined,
            currentPlayer: this.toMoveAt(k) === BLACK ? "black" : "white",
            komi: g.meta.engineKomi,
          }));
          if (this.runId !== run) break;
          this.analyses[k] = { w: a.rootWinRate, s: a.rootScoreLead };
          this.scheduleSave();
        } catch (e) { console.error(e); continue; }
        this.renderChart(); this.renderMistakes(); this.renderProgress(); this.renderReadout();
      }
      for (let k = 0; k < g.n; k++) {
        if (this.runId !== run || !location.hash.startsWith("#/review")) break;
        if (this.losses[k] != null) continue;
        try {
          const loss = await this.movePointsLost(k);
          if (this.runId !== run) break;
          this.losses[k] = loss;
          this.scheduleSave();
        } catch (e) { console.error(e); continue; }
        this.renderChart(); this.renderMistakes(); this.renderProgress();
      }
    } finally {
      if (this.runId === run) { this.analyzing = false; this.renderProgress(); }
    }
  },

  async judge() {
    if (!this.game) return;
    if (Engine.status === "off" || Engine.status === "error") { Engine.ensure().catch(() => {}); return; }
    try {
      const board = gridToBoardState(this.curGrid());
      const player = this.curTurn() === BLACK ? "black" : "white";
      const a = await this.enqueue(() => Engine.analyze({
        board, currentPlayer: player,
        moveHistory: [], komi: this.game.meta.engineKomi,
        visits: 150, ownershipMode: "root",
      }));
      this.ownership = a.ownership || null;
      if (this.node.main !== undefined) {
        const k = this.node.main, g = this.game;
        const e = await Engine.evaluate({
          board, currentPlayer: player, komi: g.meta.engineKomi,
          previousBoard: k > 0 ? gridToBoardState(g.grids[k - 1]) : undefined,
          previousPreviousBoard: k > 1 ? gridToBoardState(g.grids[k - 2]) : undefined,
        });
        this.analyses[k] = { w: e.rootWinRate, s: e.rootScoreLead };
        this.scheduleSave();
      }
      this.renderBoard(); this.renderReadout(); this.renderChart();
    } catch (e) { console.error(e); }
  },

  /* ---- rendering ---- */
  renderBoard() {
    if (!this.els) return;
    this.goban.hoverColor = this.curTurn();
    this.goban.render(this.curGrid(), this.curLastMove(), true);
    if (this.ownership) this.goban.renderOwnership(this.ownership);
    if (this.showHints) {
      const detail = this.details.get(this.detailKey());
      if (detail) this.renderSuggestions(detail);
    }
  },

  renderSuggestions(detail) {
    const moves = (detail.moves || []).filter(m =>
      m.x >= 0 && m.x < N && m.y >= 0 && m.y < N &&
      this.curGrid()[m.y][m.x] === EMPTY).slice(0, 5);
    if (!moves.length) return;
    const maxV = Math.max(...moves.map(m => m.visits));
    const gb = this.goban, { c0, c1, r0, r1 } = gb.crop;
    moves.forEach((m, i) => {
      if (m.x < c0 || m.x > c1 || m.y < r0 || m.y > r1) return;
      gb.el("circle", {
        cx: gb.px(m.x), cy: gb.py(m.y), r: gb.cell * 0.4,
        fill: CHART_SERIES, opacity: 0.15 + 0.35 * Math.sqrt(m.visits / maxV),
        stroke: i === 0 ? CHART_SERIES : "none", "stroke-width": 2.5,
        "pointer-events": "none",
      });
    });
  },

  nodeLabel(node) {
    const m = node.move;
    if (!m) return "start";
    return `${m.color === BLACK ? "●" : "○"} ${m.pass ? "pass" : COLS[m.c] + (N - m.r)}`;
  },

  renderReadout() {
    if (!this.els) return;
    let evalTxt = "";
    const detail = this.details.get(this.detailKey()) || this.quick.get(this.detailKey());
    const a = this.node.main !== undefined ? (this.analyses[this.node.main] || detail) : detail;
    if (a) {
      const s = a.rootScoreLead ?? a.s;
      evalTxt = `  ·  ${s >= 0 ? "B" : "W"}+${Math.abs(s).toFixed(1)}`;
    }
    const onMain = this.node.main !== undefined;
    const at = onMain
      ? (this.node.main > 0 ? `${this.node.main} · ${this.nodeLabel(this.node)}` : "start") + ` / ${this.game.n}`
      : `${this.cur}+${this.varDepth()} · ${this.nodeLabel(this.node)}`;
    this.els.pos.textContent = `${at}${evalTxt}`;
  },

  renderActions() {
    if (!this.els || !this.els.btnDelete) return;
    this.els.btnDelete.disabled = this.node.main !== undefined;
    this.els.btnMain.disabled = this.node.main !== undefined;
    this.els.btnHints.classList.toggle("active", this.showHints);
  },

  /* ---- move tree graph (Sabaki-style, left to right) ---- */
  plyOf(node) { let k = 0; while (node.parent) { k++; node = node.parent; } return k; },

  layoutTree() {
    const rowEnd = []; // per row: last x occupied
    let maxX = 0, maxRow = 0;
    const place = (chainStart, x, minRow) => {
      let row = minRow;
      while ((rowEnd[row] ?? -Infinity) >= x - 1) row++;
      const branches = [];
      let n = chainStart, cx = x;
      while (n) {
        n.tx = cx; n.ty = row;
        rowEnd[row] = cx;
        maxX = Math.max(maxX, cx); maxRow = Math.max(maxRow, row);
        for (const alt of n.children.slice(1)) branches.push([alt, cx + 1, row + 1]);
        n = n.children[0];
        cx++;
      }
      for (const [alt, ax, ar] of branches) place(alt, ax, ar);
    };
    place(this.mainNodes[0], 0, 0);
    return { maxX, maxRow };
  },

  renderVariations() {
    if (!this.els || !this.els.moves) return;
    const box = this.els.moves;
    this.els.movesToggle.textContent = this.movesOpen ? "▾ Tree" : "▸ Tree";
    box.style.display = this.movesOpen ? "" : "none";
    box.innerHTML = "";
    if (!this.movesOpen) return;

    const { maxX, maxRow } = this.layoutTree();
    const CELL = 28, PAD = 14, R = 10;
    const W = maxX * CELL + PAD * 2, H = maxRow * CELL + PAD * 2;
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("width", W); svg.setAttribute("height", H);
    box.append(svg);
    const px = n => PAD + n.tx * CELL, py = n => PAD + n.ty * CELL;
    const el = (name, attrs, parent) => {
      const e = document.createElementNS(SVGNS, name);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(e);
      return e;
    };
    const walk = node => {
      for (const ch of node.children) {
        el("line", { x1: px(node), y1: py(node), x2: px(ch), y2: py(ch),
                     stroke: "#c9c2b2", "stroke-width": 1.5 });
        walk(ch);
      }
    };
    walk(this.mainNodes[0]);
    const drawNode = node => {
      const cur = node === this.node;
      if (cur)
        el("circle", { cx: px(node), cy: py(node), r: R + 3.5, fill: "none",
                       stroke: "#3566b0", "stroke-width": 2.5 });
      const c = el("circle", {
        cx: px(node), cy: py(node), r: node.move ? R : R - 2.5,
        fill: !node.move ? "#8a8578" : node.move.color === BLACK ? "#2b2a26" : "#fff",
        stroke: "#5c554a", "stroke-width": 1, cursor: "pointer",
      });
      if (cur) c.id = "mv-cur";
      const ply = this.plyOf(node);
      if (node.move && ply) {
        const num = el("text", { x: px(node), y: py(node) + 3.2, "text-anchor": "middle",
          "font-size": ply > 99 ? 8 : 10, "font-weight": 600, "pointer-events": "none",
          fill: node.move.color === BLACK ? "#fff" : "#2b2a26" });
        num.textContent = ply;
      }
      if (node.note)
        el("circle", { cx: px(node) + R - 1, cy: py(node) - R + 1, r: 3.5,
                       fill: "#d98a1f", stroke: "#fff", "stroke-width": 1, "pointer-events": "none" });
      const t = el("title", {}, c);
      t.textContent = `${ply || 0}. ${this.nodeLabel(node)}${node.note ? " — " + node.note : ""}`;
      c.addEventListener("click", () => this.setNode(node));
      for (const ch of node.children) drawNode(ch);
    };
    drawNode(this.mainNodes[0]);
    const cur = svg.querySelector("#mv-cur");
    if (cur) {
      box.scrollLeft = Math.max(0, +cur.getAttribute("cx") - box.clientWidth / 2);
      box.scrollTop = Math.max(0, +cur.getAttribute("cy") - box.clientHeight / 2);
    }
  },

  renderProgress() {
    if (!this.els) return;
    const done = this.analyses.filter(Boolean).length;
    const judged = this.losses.filter(x => x != null).length;
    this.els.progress.textContent = this.analyzing
      ? (done < this.game.n + 1 ? `Analyzing… ${done}/${this.game.n + 1}` : `Judging moves… ${judged}/${this.game.n}`)
      : done ? `Analyzed ${done}/${this.game.n + 1} positions` : "";
    this.els.btnAnalyze.disabled = this.analyzing;
  },

  chartGeom() {
    let m = 5;
    for (const a of this.analyses) if (a) m = Math.max(m, Math.abs(a.s));
    return { W: 560, H: 150, L: 34, R: 10, T: 10, B: 22, M: Math.ceil(m / 5) * 5 };
  },
  chartX(k, geo) { return geo.L + (geo.W - geo.L - geo.R) * (this.game.n ? k / this.game.n : 0); },
  chartY(s, geo) { return geo.T + (geo.H - geo.T - geo.B) * (1 - (s / geo.M + 1) / 2); },
  chartK(px, geo) { return Math.round((px - geo.L) / (geo.W - geo.L - geo.R) * this.game.n); },

  renderChart() {
    if (!this.els) return;
    const svg = this.els.chart, geo = this.chartGeom();
    svg.setAttribute("viewBox", `0 0 ${geo.W} ${geo.H}`);
    svg.innerHTML = "";
    const el = (name, attrs) => {
      const e = document.createElementNS(SVGNS, name);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      svg.appendChild(e);
      return e;
    };
    // y labels + move label
    for (const [s, label] of [[geo.M, `B+${geo.M}`], [0, "0"], [-geo.M, `W+${geo.M}`]])
      el("text", { x: geo.L - 6, y: this.chartY(s, geo) + 3.5, "text-anchor": "end",
                   "font-size": 10, fill: "#8a8578" }).textContent = label;
    el("text", { x: geo.L, y: geo.H - 6, "font-size": 10, fill: "#8a8578" }).textContent = "move";

    // two-tone advantage fields: white's field on top, black's area below the curve
    const pts = [];
    for (let k = 0; k <= this.game.n; k++)
      if (this.analyses[k]) pts.push([this.chartX(k, geo), this.chartY(this.analyses[k].s, geo), k]);
    const yTop = geo.T, yBot = geo.H - geo.B;
    if (pts.length > 1) {
      const x0 = pts[0][0], x1 = pts[pts.length - 1][0];
      el("rect", { x: x0, y: yTop, width: x1 - x0, height: yBot - yTop, fill: "#e9e5d9" });
      const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
      el("path", { d: `${d}L${x1},${yBot}L${x0},${yBot}Z`, fill: "#2b2a26" });
      el("path", { d, fill: "none", stroke: "#f4f1ea", "stroke-width": 1 });
    }
    // zero midline over the fields
    el("line", { x1: geo.L, y1: this.chartY(0, geo), x2: geo.W - geo.R, y2: this.chartY(0, geo),
                 stroke: "#8a8578", "stroke-width": 1, "stroke-dasharray": "4 3", opacity: 0.6 });
    // mistake markers
    for (const m of this.mistakes()) {
      const a = this.analyses[m.k + 1];
      el("circle", { cx: this.chartX(m.k + 1, geo), cy: this.chartY(a.s, geo), r: 4.5,
                     fill: CHART_STATUS, stroke: "#fff", "stroke-width": 1.5 });
    }
    // current-move cursor (two-tone so it reads on both fields)
    const curX = this.chartX(this.cur, geo);
    el("line", { x1: curX, y1: yTop, x2: curX, y2: yBot, stroke: "#2b2a26", "stroke-width": 3, opacity: 0.35 });
    el("line", { x1: curX, y1: yTop, x2: curX, y2: yBot, stroke: "#fff", "stroke-width": 1, opacity: 0.9 });
    // hover layer: crosshair + tooltip, click to jump
    const hoverDark = el("line", { y1: yTop, y2: yBot, stroke: "#2b2a26", "stroke-width": 3,
                                   opacity: 0, "pointer-events": "none" });
    const hover = el("line", { y1: yTop, y2: yBot, stroke: "#fff", "stroke-width": 1,
                               opacity: 0, "pointer-events": "none" });
    const hit = el("rect", { x: geo.L, y: 0, width: geo.W - geo.L - geo.R, height: geo.H,
                             fill: "transparent", cursor: "pointer" });
    const tip = this.els.tip;
    const toK = evt => {
      const box = svg.getBoundingClientRect();
      return Math.max(0, Math.min(this.game.n, this.chartK((evt.clientX - box.left) * geo.W / box.width, geo)));
    };
    hit.addEventListener("mousemove", evt => {
      const k = toK(evt), x = this.chartX(k, geo);
      for (const [line, op] of [[hoverDark, 0.3], [hover, 0.8]]) {
        line.setAttribute("x1", x); line.setAttribute("x2", x); line.setAttribute("opacity", op);
      }
      const a = this.analyses[k];
      const box = svg.getBoundingClientRect();
      tip.style.display = "block";
      tip.style.left = `${x * box.width / geo.W}px`;
      tip.style.top = `${geo.T * box.height / geo.H}px`;
      tip.textContent = `${k ? "move " + k + " · " + this.moveLabel(k - 1) : "start"}` +
        (a ? ` — ${a.s >= 0 ? "B" : "W"}+${Math.abs(a.s).toFixed(1)}` : "");
    });
    hit.addEventListener("mouseleave", () => {
      hover.setAttribute("opacity", 0); hoverDark.setAttribute("opacity", 0); tip.style.display = "none";
    });
    hit.addEventListener("click", evt => this.jump(toK(evt)));
  },

  renderMistakes() {
    if (!this.els) return;
    const box = this.els.mistakes;
    box.innerHTML = "";
    for (const m of this.mistakes()) {
      const who = this.game.moves[m.k].color === BLACK ? "Black" : "White";
      box.append(h("div", { class: "mistake", onclick: () => this.jump(m.k) }, [
        h("span", { class: "dot" }),
        h("span", { class: "who" }, `Move ${m.k + 1} · ${who}`),
        h("span", {}, this.moveLabel(m.k)),
        h("span", { class: "loss" + (m.loss < 4 ? " minor" : "") }, `−${m.loss.toFixed(1)}`),
      ]));
    }
    if (!box.children.length)
      box.append(h("div", { class: "chart-note" }, "—"));
  },
};

/* ================= views ================= */

const root = document.getElementById("root");
const crumbs = document.getElementById("crumbs");
let trainer = null;

function h(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === "class") e.className = attrs[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of [].concat(children))
    e.append(c instanceof Node ? c : document.createTextNode(c));
  return e;
}

async function viewLibrary() {
  crumbs.textContent = "";
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const index = await getIndex();
  const prog = loadProgress();
  const favs = loadFavorites();
  root.innerHTML = "";
  const cats = { tsumego: "Tsumego", tesuji: "Tesuji", endgame: "Endgame" };
  for (const cat in cats) {
    root.append(h("div", { class: "cat-title" }, cats[cat]));
    const list = h("div", { class: "book-list" });
    const books = index.filter(x => x.category === cat)
      .map((b, i) => ({ b, i }))
      .sort((x, y) => (favs.has(y.b.id) - favs.has(x.b.id)) || (x.i - y.i))
      .map(x => x.b);
    for (const b of books) {
      const solved = Object.values(prog[b.id] || {}).filter(v => v === 1).length;
      const isFav = favs.has(b.id);
      list.append(h("div", { class: "book", onclick: () => location.hash = `#/book/${b.id}` }, [
        h("span", {
          class: "star" + (isFav ? " on" : ""),
          title: isFav ? "Unfavorite" : "Favorite",
          onclick: e => { e.stopPropagation(); toggleFavorite(b.id); viewLibrary(); },
        }, isFav ? "★" : "☆"),
        h("div", { class: "t" }, b.title),
        h("div", { class: "n" }, b.native),
        h("div", { class: "row" }, [
          h("span", { class: "badge" + (b.level.includes("d") ? " dan" : "") }, b.level),
          h("div", { class: "bar" }, [h("div", { style: `width:${b.count ? 100 * solved / b.count : 0}%` })]),
          h("span", { class: "cnt" }, `${solved}/${b.count}`),
        ]),
      ]));
    }
    root.append(list);
  }
}

async function viewBook(id) {
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const book = await getBook(id);
  const prog = loadProgress()[id] || {};
  crumbs.innerHTML = "";
  crumbs.append(book.title);
  root.innerHTML = "";
  root.append(h("div", { class: "book-head" }, [
    h("h2", {}, book.title),
    h("div", { class: "sub" }, `${book.native}  ·  ${book.level}  ·  ${book.problems.length} problems  ·  `),
  ]));
  root.querySelector(".sub").append(h("a", { href: book.source, target: "_blank" }, "source"));
  const grid = h("div", { class: "prob-grid" });
  book.problems.forEach((p, i) => {
    const st = prog[p.id] === 1 ? " ok" : prog[p.id] === -1 ? " bad" : "";
    grid.append(h("div", { class: "cell" + st, onclick: () => location.hash = `#/book/${id}/${i + 1}` }, String(i + 1)));
  });
  root.append(grid);
}

async function viewPlayer(id, num) {
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const book = await getBook(id);
  const idx = Math.min(Math.max(1, num), book.problems.length) - 1;
  const p = book.problems[idx];
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: `#/book/${id}` }, book.title), ` / ${idx + 1}`);

  root.innerHTML = "";
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);

  const status = h("div", { id: "status" });
  const turnBadge = h("span", { class: "badge turn" }, "Black to play");
  const btnExplore = h("button", {}, "Explore");

  const go = d => location.hash = `#/book/${id}/${idx + 1 + d}`;
  const btnPrev = h("button", { onclick: () => go(-1) }, "← Prev");
  const btnNext = h("button", { onclick: () => go(1) }, "Next →");
  btnPrev.disabled = idx === 0;
  btnNext.disabled = idx === book.problems.length - 1;

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [
      h("h2", {}, "Problem"),
      h("div", { class: "meta-title" }, `${book.title} · ${idx + 1}`),
      (() => { const d = h("div", { class: "meta-sub" });
               d.append(h("a", { href: `https://www.101weiqi.com/q/${p.id}/`, target: "_blank" }, `101weiqi #${p.id}`));
               return d; })(),
      h("div", { class: "badges" }, [
        h("span", { class: "badge" }, p.lv || book.level),
        ...(p.qt ? [h("span", { class: "badge" }, p.qt)] : []),
        turnBadge,
      ]),
    ]),
    h("div", { class: "panel" }, [h("h2", {}, "Status"), status]),
    h("div", { class: "panel" }, [
      h("h2", {}, "Controls"),
      h("div", { class: "controls" }, [
        h("button", { onclick: () => trainer.undo() }, "Undo"),
        h("button", { onclick: () => trainer.hint() }, "Hint"),
        h("button", { onclick: () => trainer.reset() }, "Reset"),
        btnExplore,
      ]),
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "nav-row" }, [btnPrev, h("span", { class: "pos" }, `${idx + 1} / ${book.problems.length}`), btnNext]),
    ]),
    h("div", { class: "panel keys" },
      [["←/→", "prev / next"], ["U", "undo"], ["R", "reset"], ["H", "hint"], ["E", "explore"]]
        .map(([k, v]) => h("div", {}, [h("b", {}, k), v]))),
  ]);

  const player = h("div", { class: "player" });
  player.append(boardCard, aside);
  root.append(player);

  trainer = new Trainer(book, idx, { svg, boardCard, status, turnBadge, btnExplore });
  btnExplore.addEventListener("click", () => trainer.toggleExplore());
  window.__trainer = trainer;
  window.__engine = Engine;
}

/* ---- record an in-person game: tap moves onto a board, then send to Review ---- */

const Recorder = {
  KEY: "goban.recordDraft",
  d: null, // { moves: [{color,c,r}|{color,pass}], next, black, white, komi, result }

  load() {
    try { this.d = JSON.parse(localStorage.getItem(this.KEY)); } catch { this.d = null; }
    if (!this.d || !Array.isArray(this.d.moves)) this.d = { moves: [], next: BLACK, black: "", white: "", komi: "6.5", result: "" };
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch {} },
  clear() { try { localStorage.removeItem(this.KEY); } catch {} this.d = null; },

  // Replays the moves; returns { grid, last, keys } (keys = positions seen, for ko).
  replay(upTo = this.d.moves.length) {
    let g = Array.from({ length: N }, () => new Array(N).fill(EMPTY)), last = null;
    const keys = new Set([g.flat().join("")]);
    for (const m of this.d.moves.slice(0, upTo)) {
      last = null;
      if (!m.pass) {
        g = applyMove(g, m.c, m.r, m.color) || g;
        last = [m.c, m.r];
      }
      keys.add(g.flat().join(""));
    }
    return { grid: g, last, keys };
  },

  play(c, r) {
    const { grid, keys } = this.replay();
    if (grid[r][c] !== EMPTY) return false;
    const g2 = applyMove(grid, c, r, this.d.next);
    if (!g2 || keys.has(g2.flat().join(""))) return false; // suicide / ko
    this.d.moves.push({ color: this.d.next, c, r });
    this.d.next = 3 - this.d.next;
    this.save();
    return true;
  },
  pass() {
    this.d.moves.push({ color: this.d.next, pass: true });
    this.d.next = 3 - this.d.next;
    this.save();
  },
  undo() {
    const m = this.d.moves.pop();
    if (m) this.d.next = m.color;
    this.save();
  },

  toSgf() {
    const esc = t => t.replace(/[\]\\]/g, "\\$&");
    const pt = m => m.pass ? "" : String.fromCharCode(97 + m.c) + String.fromCharCode(97 + m.r);
    const km = parseFloat(this.d.komi);
    let head = `;GM[1]FF[4]SZ[19]KM[${Number.isFinite(km) ? km : 6.5}]DT[${new Date().toISOString().slice(0, 10)}]`;
    if (this.d.black) head += `PB[${esc(this.d.black)}]`;
    if (this.d.white) head += `PW[${esc(this.d.white)}]`;
    if (this.d.result) head += `RE[${esc(this.d.result)}]`;
    return `(${head}${this.d.moves.map(m => `;${m.color === BLACK ? "B" : "W"}[${pt(m)}]`).join("")})`;
  },
};

function viewRecord() {
  crumbs.innerHTML = "";
  root.innerHTML = "";
  if (!Recorder.d) Recorder.load();
  const d = Recorder.d;

  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);
  const goban = new Goban(svg, { c0: 0, c1: 18, r0: 0, r1: 18 }, (c, r) => { if (Recorder.play(c, r)) refresh(); });
  const status = h("div", { class: "meta-sub" });
  const err = h("div", { class: "err" });
  const btnUndo = h("button", { onclick: () => { Recorder.undo(); refresh(); } }, "Undo");
  const btnSend = h("button", { class: "primary" }, "Send to Review");

  function refresh() {
    const { grid, last } = Recorder.replay();
    goban.hoverColor = d.next;
    goban.render(grid, last, true);
    status.textContent = `${d.moves.length} moves · ${d.next === BLACK ? "Black" : "White"} to play`;
    btnUndo.disabled = !d.moves.length;
    btnSend.disabled = !d.moves.length;
    err.textContent = "";
  }

  const field = (label, key, placeholder) => {
    const input = h("input", { class: "rec-field", value: d[key] || "", placeholder });
    input.addEventListener("input", () => { d[key] = input.value; Recorder.save(); });
    return h("label", { class: "rec-label" }, [label, input]);
  };

  btnSend.addEventListener("click", () => {
    try {
      Review.load(Recorder.toSgf());
      Review.currentId = Review.newId();
      Review.saveState();
      Recorder.clear();
      viewReview();
    } catch (e) { err.textContent = e.message; }
  });

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [
      h("h2", {}, "Record a game"),
      h("div", { class: "meta-sub" }, "Tap the board to place each move as it's played. Use Swap color for handicap stones or a missed turn."),
      status,
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "rv-actions" }, [
        btnUndo,
        h("button", { onclick: () => { Recorder.pass(); refresh(); } }, "Pass"),
        h("button", { onclick: () => { d.next = 3 - d.next; Recorder.save(); refresh(); } }, "Swap color"),
      ]),
    ]),
    h("div", { class: "panel" }, [
      field("Black", "black", "Black player"),
      field("White", "white", "White player"),
      field("Komi", "komi", "6.5"),
      field("Result", "result", "e.g. B+3.5 (optional)"),
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "rv-actions" }, [
        btnSend,
        h("button", { onclick: () => {
          if (d.moves.length && !confirm("Discard this recording?")) return;
          Recorder.clear(); viewReview();
        } }, "Discard"),
      ]),
      err,
    ]),
  ]);
  root.append(h("div", { class: "review" }, [boardCard, aside]));
  refresh();
}

/* ---- import finished games from an OGS account (public API, CORS-open) ---- */

const OGS = {
  API: "https://online-go.com/api/v1",
  KEY: "goban.ogsUser",
  remembered() { try { return localStorage.getItem(this.KEY) || ""; } catch { return ""; } },
  remember(name) { try { localStorage.setItem(this.KEY, name); } catch {} },

  async json(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`OGS returned ${r.status}`);
    return r.json();
  },
  async findPlayer(name) {
    const d = await this.json(`${this.API}/players?username=${encodeURIComponent(name)}`);
    const hit = (d.results || []).find(p => p.username.toLowerCase() === name.toLowerCase());
    if (!hit) throw new Error(`No OGS player named "${name}"`);
    return hit;
  },
  // Finished 19×19 games only (the reviewer is 19×19-only; in-progress SGFs need a login).
  firstPageUrl(id) {
    return `${this.API}/players/${id}/games/?ended__isnull=false&width=19&height=19&ordering=-ended&page_size=15`;
  },
  async sgf(gameId) {
    const r = await fetch(`${this.API}/games/${gameId}/sgf`);
    if (!r.ok) throw new Error(`Couldn't download game ${gameId} (${r.status})`);
    return r.text();
  },
};

function ogsPanel(loadSgf) {
  const input = h("input", { class: "rec-field", placeholder: "OGS username", value: OGS.remembered() });
  const status = h("div", { class: "meta-sub" });
  const list = h("div", { class: "review-history", style: "margin:0" });
  const more = h("button", { style: "display:none" }, "Load more");
  let player = null, nextUrl = null, busy = false;

  const imported = () => new Set(Review.loadHistory().map(g => (/online-go\.com\/game\/(\d+)/.exec(g.sgf || "") || [])[1]).filter(Boolean));

  const addGames = games => {
    const have = imported();
    for (const g of games) {
      const me = g.players.black.id === player.id ? "B" : "W";
      const opp = (me === "B" ? g.players.white : g.players.black).username;
      const winner = g.black_lost === g.white_lost ? "" : g.black_lost ? "W" : "B";
      const res = winner ? `${winner} wins · ${g.outcome}` : g.outcome;
      const row = h("div", { class: "history-item" }, [
        h("div", { class: "hi-open" }, [
          h("div", { class: "t" }, `${me === "B" ? "Black" : "White"} vs ${opp}${have.has(String(g.id)) ? "  ✓ imported" : ""}`),
          h("div", { class: "n" }, `${new Date(g.ended).toLocaleDateString()} · ${res}${g.handicap ? ` · H${g.handicap}` : ""}`),
        ]),
      ]);
      row.addEventListener("click", async () => {
        if (busy) return;
        busy = true; status.textContent = "Downloading game…";
        try { await loadSgf(await OGS.sgf(g.id)); }
        catch (e) { status.textContent = e.message; }
        busy = false;
      });
      list.append(row);
    }
  };

  const fetchPage = async url => {
    const d = await OGS.json(url);
    addGames(d.results || []);
    nextUrl = d.next;
    more.style.display = nextUrl ? "" : "none";
    status.textContent = list.children.length ? "Tap a game to load it into Review." : "No finished 19×19 games found.";
  };

  const go = async () => {
    const name = input.value.trim();
    if (!name || busy) return;
    busy = true; list.innerHTML = ""; more.style.display = "none"; status.textContent = "Looking up…";
    try {
      player = await OGS.findPlayer(name);
      OGS.remember(player.username);
      await fetchPage(OGS.firstPageUrl(player.id));
    } catch (e) { status.textContent = e.message === "Failed to fetch" ? "Couldn't reach OGS." : e.message; }
    busy = false;
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  more.addEventListener("click", async () => {
    if (busy || !nextUrl) return;
    busy = true;
    try { await fetchPage(nextUrl); } catch (e) { status.textContent = e.message; }
    busy = false;
  });

  return h("div", { class: "sgf-loader", style: "margin-top:0" }, [
    h("div", { class: "cat-title" }, "Import from OGS"),
    h("div", { class: "row" }, [input, h("button", { class: "primary", onclick: go }, "Find games")]),
    status, list, more,
  ]);
}

function viewReview() {
  crumbs.innerHTML = "";
  root.innerHTML = "";

  if (!Review.restoredOnce) {
    Review.restoredOnce = true;
    Review.restoreState();
    Review.pullRemoteFallback().then(changed => { if (changed) viewReview(); });
  }

  if (!Review.game) {
    const err = h("div", { class: "err" });
    const ta = h("textarea", { placeholder: "Paste SGF here…" });
    const tryLoad = text => {
      try {
        Review.load(text);
        Review.currentId = Review.newId();
        Review.saveState();
        viewReview();
      } catch (e) { err.textContent = e.message; }
    };
    const file = h("input", { type: "file", accept: ".sgf,.txt", style: "display:none" });
    file.addEventListener("change", () => {
      const f = file.files[0];
      if (f) f.text().then(tryLoad);
    });
    const hist = Review.loadHistory();
    const histItem = g => {
      const titleEl = h("div", { class: "t" }, g.name || g.title);
      const startRename = e => {
        e.stopPropagation();
        const input = h("input", { class: "hi-rename", value: g.name || "", placeholder: g.title });
        const commit = () => { Review.renameHistory(g.id, input.value); viewReview(); };
        input.addEventListener("keydown", e2 => {
          if (e2.key === "Enter") input.blur();
          else if (e2.key === "Escape") { input.value = g.name || ""; viewReview(); }
        });
        input.addEventListener("blur", commit);
        titleEl.replaceWith(input);
        input.focus(); input.select();
      };
      return h("div", { class: "history-item" }, [
        h("div", { class: "hi-open", onclick: () => { Review.openFromHistory(g.id); viewReview(); } }, [
          titleEl,
          h("div", { class: "n" }, new Date(g.savedAt).toLocaleString()),
        ]),
        h("span", { class: "hi-rename-btn", title: "Rename", onclick: startRename }, "✎"),
        h("span", { class: "hi-del", title: "Delete", onclick: e => { e.stopPropagation(); Review.deleteFromHistory(g.id); viewReview(); } }, "✕"),
      ]);
    };
    const histList = hist.length ? h("div", { class: "review-history" }, [
      h("div", { class: "cat-title" }, "Recent games"),
      ...hist.map(histItem),
    ]) : null;
    root.append(h("div", { class: "sgf-loader" }, [
      h("div", { class: "cat-title" }, "Load a game"),
      ta,
      h("div", { class: "row" }, [
        h("button", { class: "primary", onclick: () => tryLoad(ta.value) }, "Load SGF"),
        h("button", { onclick: () => viewRecord() }, "Record a game"),
        (() => { const l = h("label", { class: "file" }, "Choose file…");
                 l.append(file); l.addEventListener("click", () => file.click()); return l; })(),
        err,
      ]),
    ]));
    root.append(ogsPanel(async text => tryLoad(text)));
    if (histList) root.append(histList);
    return;
  }

  const g = Review.game;
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);

  const chart = document.createElementNS(SVGNS, "svg");
  const tip = h("div", { class: "chart-tip" });
  const pos = h("span", { class: "pos" });
  const progress = h("div", { class: "rv-progress" });
  const mistakes = h("div", { class: "mistakes" });
  const movesEl = h("div", { class: "movetree" });
  const movesToggle = h("h2", { class: "mt-toggle" }, "▾ Moves");
  movesToggle.addEventListener("click", () => {
    Review.movesOpen = !Review.movesOpen;
    Review.renderVariations();
    Review.scheduleSave();
  });
  const note = h("textarea", { class: "move-note", placeholder: "Note on this move…", rows: 3 });
  note.addEventListener("input", () => Review.onNoteInput(note.value));
  const btnAnalyze = h("button", { class: "primary", onclick: () => Review.analyzeAll() }, "Analyze game");
  const btnMain = h("button", { onclick: () => Review.setNode(Review.mainAncestor()) }, "Main line");
  const btnDelete = h("button", { onclick: () => Review.deleteBranch() }, "Delete branch");
  const btnHints = h("button", { onclick: () => {
    Review.showHints = !Review.showHints;
    Review.renderBoard(); Review.renderActions();
    if (Review.showHints) Review.fetchDetail();
    Review.scheduleSave();
  } }, "Hints");

  const title = [g.meta.black || "Black", "vs", g.meta.white || "White",
                 g.meta.result ? `· ${g.meta.result}` : ""].join(" ");

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [
      h("h2", {}, "Game"),
      h("div", { class: "meta-title" }, title),
      h("div", { class: "meta-sub" }, `${g.n} moves · komi ${g.meta.komi}`),
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "rv-nav" }, [
        h("button", { onclick: () => Review.jump(0) }, "|◀"),
        h("button", { onclick: () => Review.back() }, "◀"),
        h("button", { onclick: () => Review.forward() }, "▶"),
        h("button", { onclick: () => Review.jump(g.n) }, "▶|"),
        pos,
      ]),
      movesToggle,
      movesEl,
      note,
    ]),
    h("div", { class: "panel" }, [
      h("h2", {}, "Score"),
      (() => { const w = h("div", { class: "chart-wrap" }); w.append(chart, tip); return w; })(),
    ]),
    h("div", { class: "panel" }, [
      h("h2", {}, "Biggest mistakes"),
      mistakes,
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "rv-actions" }, [
        btnAnalyze,
        h("button", { onclick: () => Review.judge() }, "Judge"),
        h("button", { onclick: () => Review.engineMove() }, "Engine move"),
        btnHints,
        btnMain,
        btnDelete,
        h("button", { onclick: () => {
          // Non-destructive: the game stays saved in history, this just
          // returns to the loader/history list.
          Review.game = null; Review.currentId = null; Review.runId++;
          viewReview();
        } }, "Close game"),
      ]),
      progress,
    ]),
  ]);

  const wrap = h("div", { class: "review" });
  wrap.append(boardCard, aside);
  root.append(wrap);

  Review.els = { chart, tip, pos, progress, mistakes, moves: movesEl, movesToggle, note,
                 btnAnalyze, btnMain, btnDelete, btnHints };
  Review.goban = new Goban(svg, { c0: 0, c1: 18, r0: 0, r1: 18 }, (c, r) => Review.click(c, r));
  Review.renderBoard(); Review.renderReadout(); Review.renderChart();
  Review.renderMistakes(); Review.renderProgress(); Review.renderActions(); Review.renderVariations(); Review.renderNote();
  if (Review.showHints) Review.fetchDetail(); else Review.quickEval();
}

/* ================= feedback ================= */

function viewFeedback() {
  crumbs.textContent = "";
  root.innerHTML = "";
  const ta = h("textarea", {});
  const msg = h("div", { class: "msg" });
  const submitBtn = h("button", {
    class: "primary",
    onclick: async () => {
      const text = ta.value.trim();
      if (!text) { msg.textContent = "Write something first."; msg.className = "msg err"; return; }
      submitBtn.disabled = true; msg.textContent = ""; msg.className = "msg";
      try {
        await Sync.sendFeedback(text);
        ta.value = "";
        msg.textContent = "Sent — thanks!";
        msg.className = "msg ok";
      } catch (e) {
        console.error(e);
        msg.textContent = "Couldn't send that, try again.";
        msg.className = "msg err";
      }
      submitBtn.disabled = false;
    },
  }, "Send feedback");
  root.append(h("div", { class: "sgf-loader" }, [
    h("div", { class: "cat-title" }, "Feedback"),
    ta,
    h("div", { class: "row" }, [submitBtn, msg]),
  ]));
}

/* ================= router & keys ================= */

async function route() {
  if (trainer) trainer.alive = false;
  trainer = null;
  Review.els = null;
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const tab = parts[0] === "review" ? "review" : parts[0] === "feedback" ? "feedback" : "library";
  for (const a of document.querySelectorAll("#tabs a"))
    a.classList.toggle("active", a.dataset.tab === tab);
  if (parts[0] === "review") viewReview();
  else if (parts[0] === "feedback") viewFeedback();
  else if (parts[0] === "book" && parts[1] && parts[2]) await viewPlayer(parts[1], parseInt(parts[2], 10) || 1);
  else if (parts[0] === "book" && parts[1]) await viewBook(parts[1]);
  else await viewLibrary();
}

document.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && /TEXTAREA|INPUT/.test(e.target.tagName)) return;
  if (Review.els && Review.game) {
    if (e.key === "ArrowLeft") Review.back();
    else if (e.key === "ArrowRight") Review.forward();
    else if (e.key === "ArrowUp") Review.sibling(-1);
    else if (e.key === "ArrowDown") Review.sibling(1);
    else if (e.key === "Home") Review.jump(0);
    else if (e.key === "End") Review.jump(Review.game.n);
    else if (e.key === "j") Review.judge();
    else if (e.key === "e") Review.setNode(Review.mainAncestor());
    else if (e.key === "m") Review.engineMove();
    else if (e.key === "Backspace" || e.key === "Delete") Review.deleteBranch();
    return;
  }
  if (!trainer) return;
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (e.key === "ArrowLeft" && parts[2] > 1) location.hash = `#/book/${parts[1]}/${+parts[2] - 1}`;
  else if (e.key === "ArrowRight") location.hash = `#/book/${parts[1]}/${+parts[2] + 1}`;
  else if (e.key === "u") trainer.undo();
  else if (e.key === "r") trainer.reset();
  else if (e.key === "h") trainer.hint();
  else if (e.key === "e") trainer.toggleExplore();
});

window.addEventListener("hashchange", route);
window.__engine = Engine;
window.__review = Review;
Sync.init();
route();
