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

// Back to unattempted. 0 rather than deleting, so the next sync sends the
// change instead of the old result coming back from the Sheet.
function clearResult(bookId, pid) {
  const prog = loadProgress();
  if (!prog[bookId] || !prog[bookId][pid]) return;
  prog[bookId][pid] = 0;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  Sync.scheduleSave();
}

function clearBook(bookId) {
  const prog = loadProgress();
  for (const pid in prog[bookId] || {}) prog[bookId][pid] = 0;
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
  modelUrl: new URL("engine/katago-small.bin.gz", location.href).href,

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
      this.setStatus("loading");
      this.worker = new Worker("engine/katago-worker.js");
      this.worker.onmessage = e => this.onMessage(e.data);
      this.worker.onerror = e => { this.setStatus("error", "worker failed"); console.error(e); };
      this.initPromise = new Promise((resolve, reject) => { this.initSettle = { resolve, reject }; });
      this.worker.postMessage({ type: "katago:init", modelUrl: this.modelUrl, backend: "auto" });
    }
    return this.initPromise;
  },

  onMessage(msg) {
    if (msg.type === "katago:init_result") {
      if (msg.ok) {
        this.backend = msg.backend || "?";
        this.setStatus("ready");
        this.initSettle.resolve();
      } else {
        this.setStatus("error", msg.error);
        this.initSettle.reject(new Error(msg.error));
        this.initPromise = null;
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

// Sabaki-style left-to-right layout for any {children: []} tree: sets each
// node's tx (ply) and ty (row); first children continue the row.
function layoutMoveTree(root) {
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
  place(root, 0, 0);
  return { maxX, maxRow };
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
    this.posHistory = [this.serialize(this.grid)]; // for the ko rule
    this.ownership = null;    // ownership overlay from Judge
    this.engineBusy = false;
    this.covered = new Set(); // White replies already faced this attempt ("ab,cd,…" prefixes)
    this.viewing = null;      // solution-tree node shown on the board after solving
    this.render();
    this.setStatus("", "", "");
  }

  onTree() { return this.consistentLines().length > 0; }

  /* simple ko (Japanese rules, as tsumego assume): a move may not recreate the
     position from before the opponent's last move. Superko would wrongly forbid
     e.g. retaking one stone after two were captured ("send two, return one"). */
  koViolation(g2) {
    const h = this.posHistory;
    return h.length >= 2 && h[h.length - 2] === this.serialize(g2);
  }

  /* --- variation tree --- */
  consistentLines() {
    return this.p.lines.filter(L =>
      this.played.length <= L.length - 1 &&
      this.played.every((m, i) => m === L[i + 1]));
  }
  /* A problem is solved once every White reply along the correct lines has
     been answered: White picks replies not faced yet (in line order), and finishing a line
     rewinds to the nearest White choice with replies left. Black only has to
     cover White's answers to the moves Black actually chose. */
  linesFrom(played) {
    return this.p.lines.filter(L => played.length <= L.length - 1 && played.every((m, i) => m === L[i + 1]));
  }
  // White replies at `played` still to face: lead to a correct line, not covered yet.
  openReplies(played) {
    const key = played.join(",");
    const moves = new Set(this.linesFrom(played)
      .filter(L => L[0] <= 2 && L.length - 1 > played.length).map(L => L[played.length + 1]));
    return [...moves].filter(m => !this.covered.has(key + "," + m));
  }
  engineReply() {
    // Lines are stored in the order the source presents them (Redmond's video
    // order), so White takes the earliest reply not faced yet.
    const open = this.openReplies(this.played);
    if (open.length) return open[0];
    const ls = this.consistentLines().filter(L => L.length - 1 > this.played.length);
    if (!ls.length) return null;
    ls.sort((a, b) => a[0] - b[0] || b.length - a.length);
    return ls[0][this.played.length + 1];
  }
  // Nearest earlier White turn on this path that still has open replies.
  nextBranch() {
    for (let k = this.played.length - 1; k >= 1; k--) {
      if (k % 2 === 0) continue; // index k is a White move when k is odd
      const prefix = this.played.slice(0, k);
      const open = this.openReplies(prefix);
      if (open.length) return { prefix, open };
    }
    return null;
  }
  remainingBranches() {
    let n = 0;
    for (let k = 1; k < this.played.length; k += 2) n += this.openReplies(this.played.slice(0, k)).length;
    return n;
  }
  playWhite(mv) {
    const [rc, rr] = cIdx(mv);
    this.covered.add([...this.played, mv].join(","));
    this.grid = applyMove(this.grid, rc, rr, WHITE);
    this.played = [...this.played, mv];
    this.lastMove = [rc, rr];
    this.posHistory.push(this.serialize(this.grid));
    this.render();
  }
  // Rewind to `prefix` (White to move) and play the next open reply there.
  rewindTo(prefix, mv) {
    this.grid = this.freshGrid();
    this.posHistory = [this.serialize(this.grid)];
    this.played = [];
    this.lastMove = null;
    prefix.forEach((m, i) => {
      const [c, r] = cIdx(m);
      this.grid = applyMove(this.grid, c, r, i % 2 === 0 ? BLACK : WHITE);
      this.played.push(m);
      this.lastMove = [c, r];
      this.posHistory.push(this.serialize(this.grid));
    });
    this.history = [];
    this.render();
    this.replyTimer = setTimeout(() => {
      this.playWhite(mv);
      const t = this.terminal();
      if (t) this.finish(t);
    }, 700);
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
      this.playWhite(reply);
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

  // For when the answer key is wrong or misses an alternate solution.
  claimSolved() {
    if (this.explore || this.done === "ok" || this.engineBusy) return;
    clearTimeout(this.replyTimer);
    this.done = "ok";
    markResult(this.book.id, this.p.id, true);
    this.setStatus("ok", "✓", "Claimed solved");
    this.render();
  }

  markUnsolved() {
    clearResult(this.book.id, this.p.id);
    this.reset();
    this.setStatus("", "↺", "Marked unsolved — try it again");
  }

  finish(kind) {
    if (kind === "ok") {
      const next = this.nextBranch();
      if (next) {
        const left = this.remainingBranches();
        this.done = "next"; // locks the board until the rewind
        this.setStatus("ok", "✓", `Correct — White has ${left} other ${left === 1 ? "answer" : "answers"} to try`);
        this.render();
        this.replyTimer = setTimeout(() => {
          if (!this.alive || this.explore) return;
          this.done = null;
          this.setStatus("", "", "");
          const mv = next.open[0];
          this.rewindTo(next.prefix, mv);
        }, 1400);
        return;
      }
    }
    this.done = kind;
    markResult(this.book.id, this.p.id, kind === "ok");
    this.setStatus(kind, kind === "ok" ? "✓" : "✗", kind === "ok" ? "Correct" : "Wrong");
    this.render();
    window.dispatchEvent(new CustomEvent("tczw:result", { detail: kind }));  // Sun Wukong reacts
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

  /* How the trainer would end from `played` if Black plays well: "ok", "bad" or
     null (off the key). White answers as engineReply does: every correct-line
     reply (they all get faced eventually), else its fallback line. Used by the
     hint only: some keys have a correct line that a failure line extends
     (e.g. [1,"sc"] with [3,"sc","qd"]), and White does play that refutation. */
  outcome(played, memo = new Map()) {
    const key = played.join(",");
    if (memo.has(key)) return memo.get(key);
    memo.set(key, "bad"); // guards against cycles in odd keys
    const ls = this.linesFrom(played), n = played.length;
    const cont = ls.filter(L => L.length - 1 > n);
    let v;
    if (!cont.length) {
      const done = ls.filter(L => L.length - 1 === n);
      v = done.some(L => L[0] <= 2) ? "ok" : done.some(L => L[0] === 3) ? "bad" : null;
    } else if (n % 2 === 0) { // Black to move: some tree move must work
      const moves = [...new Set(cont.map(L => L[n + 1]))];
      v = moves.some(m => this.outcome([...played, m], memo) === "ok") ? "ok" : "bad";
    } else { // White to move
      let replies = [...new Set(cont.filter(L => L[0] <= 2).map(L => L[n + 1]))];
      if (!replies.length) replies = [[...cont].sort((a, b) => a[0] - b[0] || b.length - a.length)[0][n + 1]];
      v = replies.every(m => this.outcome([...played, m], memo) === "ok") ? "ok" : "bad";
    }
    memo.set(key, v);
    return v;
  }

  hint() {
    if (this.explore || this.done) return;
    // Next moves of the main solutions (1), then of correct variations (2):
    // after some White replies only a variation continues. Prefer a move the
    // key can't refute; failing that, the first one as before.
    const n = this.played.length, memo = new Map();
    const open = L => L.length - 1 > n && this.played.every((m, i) => m === L[i + 1]);
    const moves = [...new Set([...this.p.lines.filter(L => L[0] === 1 && open(L)),
                               ...this.p.lines.filter(L => L[0] === 2 && open(L))].map(L => L[n + 1]))];
    if (!moves.length) return;
    const best = moves.find(m => this.outcome([...this.played, m], memo) === "ok") || moves[0];
    const [c, r] = cIdx(best);
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
    this.renderNote();
    this.renderSolutionTree();
  }

  // The source's comment on the position on the board ("Dead", "see the
  // snap-back?"), keyed by the moves from the start.
  noteFor(moves) {
    const n = this.p.notes && this.p.notes[moves.join(",")];
    return n ? n.join(" · ") : "";
  }
  renderNote() {
    const el = this.els.note;
    if (!el) return;
    const moves = this.viewing ? this.pathMoves(this.viewing) : this.explore ? [] : this.played;
    const text = this.explore ? "" : this.noteFor(moves);
    el.textContent = text ? `“${text}”` : "";
    el.style.display = text ? "" : "none";
  }
  pathMoves(node) {
    const out = [];
    for (let n = node; n.parent; n = n.parent) out.unshift(n.move);
    return out;
  }

  /* --- solution tree: every line of the problem, shown once it's solved --- */
  solutionTree() {
    if (this.tree) return this.tree;
    const root = { move: null, children: [], parent: null, ok: true };
    // Correct lines first, so the top row of the tree is a solution.
    for (const L of [...this.p.lines].sort((a, b) => (a[0] <= 2 ? 0 : 1) - (b[0] <= 2 ? 0 : 1))) {
      let n = root;
      L.slice(1).forEach((m, i) => {
        let ch = n.children.find(c => c.move === m);
        if (!ch) {
          ch = { move: m, color: i % 2 === 0 ? BLACK : WHITE, children: [], parent: n, ok: false, ply: i + 1 };
          n.children.push(ch);
        }
        if (L[0] <= 2) ch.ok = true;
        n = ch;
      });
    }
    return (this.tree = root);
  }

  showNode(node) {
    const path = [];
    for (let n = node; n.parent; n = n.parent) path.unshift(n);
    this.grid = this.freshGrid();
    this.lastMove = null;
    for (const n of path) {
      const [c, r] = cIdx(n.move);
      this.grid = applyMove(this.grid, c, r, n.color) || this.grid;
      this.lastMove = [c, r];
    }
    this.viewing = node;
    this.render();
  }

  renderSolutionTree() {
    const { treePanel, treeBox } = this.els;
    if (!treePanel) return;
    const show = this.done === "ok" && !this.explore;
    treePanel.style.display = show ? "" : "none";
    if (!show) return;
    const root = this.solutionTree();
    const { maxX, maxRow } = layoutMoveTree(root);
    const CELL = 28, PAD = 14, R = 10;
    treeBox.innerHTML = "";
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("width", maxX * CELL + PAD * 2);
    svg.setAttribute("height", maxRow * CELL + PAD * 2);
    treeBox.append(svg);
    const px = n => PAD + n.tx * CELL, py = n => PAD + n.ty * CELL;
    const el = (name, attrs) => {
      const e = document.createElementNS(SVGNS, name);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      svg.appendChild(e);
      return e;
    };
    const edges = n => n.children.forEach(ch => {
      el("line", { x1: px(n), y1: py(n), x2: px(ch), y2: py(ch),
                   stroke: ch.ok ? "#9cc2ad" : "#e0b4b2", "stroke-width": 2 });
      edges(ch);
    });
    edges(root);
    const nodes = n => {
      if (n === this.viewing)
        el("circle", { cx: px(n), cy: py(n), r: R + 3.5, fill: "none", stroke: "#3566b0", "stroke-width": 2.5 });
      const c = el("circle", {
        cx: px(n), cy: py(n), r: n.move ? R : R - 2.5,
        fill: !n.move ? "#8a8578" : n.color === BLACK ? "#2b2a26" : "#fff",
        stroke: !n.move ? "#5c554a" : n.ok ? "var(--accent)" : "var(--danger)",
        "stroke-width": n.move ? 2 : 1, cursor: "pointer",
      });
      if (n.move && this.noteFor(this.pathMoves(n)))
        el("circle", { cx: px(n) + R - 1, cy: py(n) - R + 1, r: 3.5, fill: "#d98a1f",
                       stroke: "#fff", "stroke-width": 1, "pointer-events": "none" });
      if (n.move) {
        const t = el("text", { x: px(n), y: py(n) + 3.2, "text-anchor": "middle", "font-size": 10,
                               "font-weight": 600, "pointer-events": "none",
                               fill: n.color === BLACK ? "#fff" : "#2b2a26" });
        t.textContent = n.ply;
      }
      const tip = document.createElementNS(SVGNS, "title");
      const note = n.move ? this.noteFor(this.pathMoves(n)) : "";
      tip.textContent = n.move ? `${n.ply}. ${coordLabel(n.move)}${n.ok ? "" : " (fails)"}${note ? " — " + note : ""}` : "Start";
      c.appendChild(tip);
      c.addEventListener("click", () => this.showNode(n));
      n.children.forEach(nodes);
    };
    nodes(root);
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

  // Returns to the loader/history list. Non-destructive: flushes any pending
  // save, and the game stays in history.
  close() {
    if (this.game) { clearTimeout(this.saveTimer); this.saveState(); }
    this.game = null; this.currentId = null; this.runId++;
  },

  // Async, runs once per session: merge this username's synced history into
  // local (by id, newer savedAt wins). Returns true if the history list changed.
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
    if (this.node.parent && this.node.parent.key === key) return; // ko (simple ko, as in Japanese rules)
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

  layoutTree() { return layoutMoveTree(this.mainNodes[0]); },

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
  const nav = routeSeq;
  crumbs.textContent = "";
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const index = await getIndex();
  if (nav !== routeSeq) return; // navigated elsewhere while loading
  const prog = loadProgress();
  const favs = loadFavorites();
  root.innerHTML = "";
  const cats = { tsumego: "Tsumego", tesuji: "Tesuji", endgame: "Endgame" };
  // Favorited books from every category come first; they stay in their category too.
  const sections = [["Favorites", index.filter(b => favs.has(b.id))],
                    ...Object.entries(cats).map(([cat, title]) => [title, index.filter(b => b.category === cat)])];
  for (const [title, books] of sections) {
    if (!books.length) continue;
    root.append(h("div", { class: "cat-title" }, title));
    const list = h("div", { class: "book-list" });
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
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const book = await getBook(id);
  if (nav !== routeSeq) return;
  const prog = loadProgress()[id] || {};
  crumbs.innerHTML = "";
  crumbs.append(book.title);
  root.innerHTML = "";
  root.append(h("div", { class: "book-head" }, [
    h("h2", {}, book.title),
    h("div", { class: "sub" }, [book.native, book.level, `${book.problems.length} problems`, ""].filter((x, i, a) => x || i === a.length - 1).join("  ·  ")),
  ]));
  root.querySelector(".sub").append(h("a", { href: book.source, target: "_blank" }, "source"));
  const marked = Object.values(prog).filter(v => v === 1 || v === -1).length;
  if (marked) root.querySelector(".book-head").append(h("button", {
    class: "reset-book",
    onclick: () => {
      if (!confirm(`Reset progress for ${book.title}? This clears ${marked} solved/failed mark${marked === 1 ? "" : "s"}.`)) return;
      clearBook(id);
      viewBook(id);
    },
  }, "Reset progress"));
  const grid = h("div", { class: "prob-grid" });
  book.problems.forEach((p, i) => {
    const st = prog[p.id] === 1 ? " ok" : prog[p.id] === -1 ? " bad" : "";
    grid.append(h("div", { class: "cell" + st, onclick: () => location.hash = `#/book/${id}/${i + 1}` }, String(book.numbered ? p.id : i + 1)));
  });
  root.append(grid);
}

async function viewPlayer(id, num) {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const book = await getBook(id);
  if (nav !== routeSeq) return;
  const idx = Math.min(Math.max(1, num), book.problems.length) - 1;
  const p = book.problems[idx];
  crumbs.innerHTML = "";
  const label = book.numbered ? p.id : idx + 1; // numbered books show their own problem numbers
  crumbs.append(h("a", { href: `#/book/${id}` }, book.title), ` / ${label}`);

  root.innerHTML = "";
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);

  const status = h("div", { id: "status" });
  const turnBadge = h("span", { class: "badge turn" }, "Black to play");
  const btnExplore = h("button", {}, "Explore");
  const treeBox = h("div", { class: "movetree", style: "height:auto; max-height:320px" });
  const note = h("div", { class: "source-note", style: "display:none" });
  const treePanel = h("div", { class: "panel", style: "display:none" }, [
    h("h2", {}, "Solution tree"),
    h("div", { class: "meta-sub" }, "Tap a move to see the position. Green: correct lines · red: failures · dot: his comment."),
    treeBox,
  ]);

  const go = d => location.hash = `#/book/${id}/${idx + 1 + d}`;
  const btnPrev = h("button", { onclick: () => go(-1) }, "← Prev");
  const btnNext = h("button", { onclick: () => go(1) }, "Next →");
  btnPrev.disabled = idx === 0;
  btnNext.disabled = idx === book.problems.length - 1;

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [
      h("h2", {}, "Problem"),
      h("div", { class: "meta-title" }, `${book.title} · ${label}`),
      (() => { const d = h("div", { class: "meta-sub" });
               // Problems from other sources carry their own link and credit.
               if (p.url) d.append(h("a", { href: p.url, target: "_blank" }, p.credit || "source"));
               else d.append(h("a", { href: `https://www.101weiqi.com/q/${p.id}/`, target: "_blank" }, `101weiqi #${p.id}`));
               return d; })(),
      h("div", { class: "badges" }, [
        (p.lv || book.level) ? h("span", { class: "badge" }, p.lv || book.level) : "",
        ...(p.qt ? [h("span", { class: "badge" }, p.qt)] : []),
        turnBadge,
      ]),
    ]),
    h("div", { class: "panel" }, [h("h2", {}, "Status"), status, note]),
    treePanel,
    h("div", { class: "panel" }, [
      h("h2", {}, "Controls"),
      h("div", { class: "controls" }, [
        h("button", { onclick: () => trainer.undo() }, "Undo"),
        h("button", { onclick: () => trainer.hint() }, "Hint"),
        h("button", { onclick: () => trainer.reset() }, "Reset"),
        btnExplore,
        h("button", { class: "wide", title: "Answer key wrong, or you found another solution? Count it as solved.",
                      onclick: () => trainer.claimSolved() }, "Claim solved"),
        h("button", { class: "wide", title: "Clear this problem's solved or failed mark.",
                      onclick: () => trainer.markUnsolved() }, "Mark unsolved"),
      ]),
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "nav-row" }, [btnPrev, h("span", { class: "pos" }, `${idx + 1} / ${book.problems.length}`), btnNext]),
    ]),
    Spotify.panel(book, p),
    h("div", { class: "panel keys" },
      [["←/→", "prev / next"], ["U", "undo"], ["R", "reset"], ["H", "hint"], ["E", "explore"]]
        .map(([k, v]) => h("div", {}, [h("b", {}, k), v]))),
  ]);

  const player = h("div", { class: "player" });
  player.append(boardCard, aside);
  root.append(player);

  trainer = new Trainer(book, idx, { svg, boardCard, status, turnBadge, btnExplore, treePanel, treeBox, note });
  btnExplore.addEventListener("click", () => trainer.toggleExplore());
  Spotify.problemOpened(book.id, p.id);
  window.__trainer = trainer;
  window.__engine = Engine;
}

/* ---- Spotify: each problem plays its own song from a playlist ---- */
// PKCE login (public client, no secret) and the Web API's playback control:
// the music plays in the Spotify app on a phone or computer (Premium only),
// TCZW just tells it which song. A problem's song is picked from the chosen
// playlist by a hash of the problem, so it's the same song every time;
// "Use current song" pins whatever is playing to the problem instead.
const Spotify = {
  CLIENT_ID: "45e01bcb404941c1ab00da020e741a46",
  SCOPES: "user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative",
  AUTH_KEY: "gt-spotify-auth", FLOW_KEY: "gt-spotify-flow", LIST_KEY: "gt-spotify-playlist",
  PINS_KEY: "gt-spotify-pins", ON_KEY: "gt-spotify-on",
  current: null, lastUri: null, playTimer: null, message: "", listeners: new Set(),

  configured() { return !!this.CLIENT_ID; },
  redirectUri() { return OGSPlay.redirectUri(); },
  load(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  store(key, v) { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(v)); } catch {} },
  loggedIn() { return !!this.load(this.AUTH_KEY); },
  enabled() { return this.load(this.ON_KEY) !== false; },
  setEnabled(on) { this.store(this.ON_KEY, on); if (!on) this.lastUri = null; this.emit(); },
  playlist() { return this.load(this.LIST_KEY); },
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { for (const fn of this.listeners) fn(); },
  say(msg) { this.message = msg; this.emit(); },

  async login() {
    const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const verifier = b64(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = b64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    // "sp." tells the shared login return (site and app) this one is Spotify's.
    const state = "sp." + b64(crypto.getRandomValues(new Uint8Array(12)));
    this.store(this.FLOW_KEY, { verifier, state, redirect: this.redirectUri(), back: location.hash });
    const q = new URLSearchParams({
      response_type: "code", client_id: this.CLIENT_ID, redirect_uri: this.redirectUri(),
      code_challenge: challenge, code_challenge_method: "S256", state, scope: this.SCOPES,
    });
    location.href = `https://accounts.spotify.com/authorize?${q}`;
  },
  isReturn(params) { return (params.get("state") || "").startsWith("sp."); },
  // Back from Spotify with ?code=&state=; returns the hash to go back to.
  async finishLogin(params) {
    const flow = this.load(this.FLOW_KEY);
    this.store(this.FLOW_KEY, null);
    if (params.get("error")) throw new Error(`Spotify login failed: ${params.get("error")}`);
    if (!flow || flow.state !== params.get("state")) throw new Error("That Spotify login link expired — connect again.");
    const tok = await this.tokenRequest({
      grant_type: "authorization_code", code: params.get("code"), redirect_uri: flow.redirect,
      client_id: this.CLIENT_ID, code_verifier: flow.verifier,
    });
    this.store(this.AUTH_KEY, tok);
    return flow.back || "#/";
  },
  async tokenRequest(fields) {
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fields),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw new Error(`Spotify login failed (${d.error_description || d.error || r.status})`);
    return { access: d.access_token, refresh: d.refresh_token || fields.refresh_token, expires: Date.now() + (d.expires_in || 3600) * 1000 };
  },
  async token() {
    const a = this.load(this.AUTH_KEY);
    if (!a) throw new Error("Spotify isn't connected");
    if (Date.now() < a.expires - 60000) return a.access;
    try {
      const t = await this.tokenRequest({ grant_type: "refresh_token", refresh_token: a.refresh, client_id: this.CLIENT_ID });
      this.store(this.AUTH_KEY, t);
      return t.access;
    } catch (e) { this.logout(); throw e; }
  },
  logout() { this.store(this.AUTH_KEY, null); this.current = this.lastUri = null; this.emit(); },

  async api(method, path, body) {
    const r = await fetch("https://api.spotify.com/v1" + path, {
      method, headers: { Authorization: `Bearer ${await this.token()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 401) { this.logout(); throw new Error("Spotify login expired — connect again."); }
    if (r.status === 204) return null;
    const d = await r.json().catch(() => null);
    if (!r.ok) { const e = new Error((d && d.error && d.error.message) || `Spotify returned ${r.status}`); e.status = r.status; e.reason = d && d.error && d.error.reason; throw e; }
    return d;
  },

  // Accepts a playlist link, spotify:playlist:… URI or bare id.
  async setPlaylist(link) {
    const m = /playlist[/:]([A-Za-z0-9]{10,})/.exec(link) || /^([A-Za-z0-9]{10,})$/.exec(link.trim());
    if (!m) throw new Error("That doesn't look like a Spotify playlist link.");
    const id = m[1];
    const meta = await this.api("GET", `/playlists/${id}?fields=name`);
    const tracks = [];
    let next = `/playlists/${id}/tracks?limit=100&fields=next,items(track(uri,name,is_local,artists(name)))`;
    while (next) {
      const page = await this.api("GET", next);
      for (const it of page.items || []) {
        const t = it.track || it.item;
        if (t && t.uri && !t.is_local && t.uri.startsWith("spotify:track:")) tracks.push([t.uri, t.name, (t.artists || []).map(a => a.name).join(", ")]);
      }
      next = page.next ? page.next.replace("https://api.spotify.com/v1", "") : null;
    }
    if (!tracks.length) throw new Error("That playlist has no playable songs.");
    this.store(this.LIST_KEY, { id, name: meta.name, tracks });
    this.lastUri = null;
    this.emit();
  },

  pinKey(bookId, pid) { return `${bookId}/${pid}`; },
  // The problem's song: its pin, else a stable pick from the playlist.
  songFor(bookId, pid) {
    const pin = (this.load(this.PINS_KEY) || {})[this.pinKey(bookId, pid)];
    if (pin) return pin;
    const pl = this.playlist();
    if (!pl || !pl.tracks.length) return null;
    let h = 2166136261;  // FNV-1a
    for (const c of `${bookId}/${pid}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    return pl.tracks[h % pl.tracks.length];
  },
  async pinCurrent(bookId, pid) {
    const now = await this.api("GET", "/me/player/currently-playing");
    const t = now && now.item;
    if (!t || !t.uri || !t.uri.startsWith("spotify:track:")) throw new Error("Nothing is playing in Spotify right now.");
    const pins = this.load(this.PINS_KEY) || {};
    pins[this.pinKey(bookId, pid)] = [t.uri, t.name, (t.artists || []).map(a => a.name).join(", ")];
    this.store(this.PINS_KEY, pins);
    this.current = pins[this.pinKey(bookId, pid)];
    this.lastUri = t.uri;
    this.say("");
  },
  unpin(bookId, pid) {
    const pins = this.load(this.PINS_KEY) || {};
    delete pins[this.pinKey(bookId, pid)];
    this.store(this.PINS_KEY, pins);
    this.lastUri = null;
    this.emit();
  },
  pinned(bookId, pid) { return !!(this.load(this.PINS_KEY) || {})[this.pinKey(bookId, pid)]; },

  // Opening a problem switches to its song; a short delay so flicking
  // through problems doesn't fire a request per step.
  problemOpened(bookId, pid) {
    clearTimeout(this.playTimer);
    if (!this.configured() || !this.loggedIn() || !this.enabled()) return;
    const song = this.songFor(bookId, pid);
    if (!song) return;
    this.current = song;
    this.emit();
    if (song[0] === this.lastUri) return;
    this.playTimer = setTimeout(() => this.play(song).catch(e => this.say(e.message)), 700);
  },
  RADIO_KEY: "gt-spotify-radio", radioCache: new Map(), recsBlocked: false,
  radioOn() { return this.load(this.RADIO_KEY) !== false; },
  setRadio(on) { this.store(this.RADIO_KEY, on); this.lastUri = null; this.emit(); },
  // Song radio: what plays after the problem's song. Spotify's
  // recommendations seeded with it where the app may still use them (it was
  // closed to apps made after late 2024); otherwise the artist's top tracks
  // mixed with the rest of the playlist.
  async radioFor(uri) {
    if (this.radioCache.has(uri)) return this.radioCache.get(uri);
    const id = uri.split(":").pop(), out = [];
    if (!this.recsBlocked) {
      try {
        const r = await this.api("GET", `/recommendations?seed_tracks=${id}&limit=25`);
        for (const t of (r && r.tracks) || []) if (t.uri && t.uri !== uri) out.push(t.uri);
      } catch (e) { if (e.status === 403 || e.status === 404) this.recsBlocked = true; }
    }
    if (out.length < 5) {
      try {
        const t = await this.api("GET", `/tracks/${id}`);
        const artist = t && t.artists && t.artists[0];
        if (artist) {
          const top = await this.api("GET", `/artists/${artist.id}/top-tracks?market=US`);
          for (const x of (top && top.tracks) || []) if (x.uri !== uri && !out.includes(x.uri)) out.push(x.uri);
        }
      } catch {}
      const pl = this.playlist();
      if (pl) {
        const rest = pl.tracks.map(t => t[0]).filter(u => u !== uri && !out.includes(u));
        for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
        // Interleave: artist songs and playlist songs take turns.
        const mixed = [];
        while (out.length || rest.length) { if (out.length) mixed.push(out.shift()); if (rest.length) mixed.push(rest.shift()); }
        out.push(...mixed.slice(0, 30));
      }
    }
    this.radioCache.set(uri, out);
    return out;
  },
  async play(song) {
    const uris = [song[0], ...(this.radioOn() ? await this.radioFor(song[0]).catch(() => []) : [])];
    try {
      await this.api("PUT", "/me/player/play", { uris });
    } catch (e) {
      if (e.status !== 404) throw e;
      // No active player: wake the first available device.
      const { devices = [] } = await this.api("GET", "/me/player/devices") || {};
      const dev = devices.find(d => !d.is_restricted);
      if (!dev) throw new Error("Open Spotify on your phone or computer, then tap Play.");
      await this.api("PUT", `/me/player/play?device_id=${encodeURIComponent(dev.id)}`, { uris });
    }
    this.lastUri = song[0];
    this.say("");
  },
  async pause() { await this.api("PUT", "/me/player/pause"); this.lastUri = null; },

  // The Music panel on a problem page.
  panel(book, p) {
    const box = h("div", { class: "panel music" });
    const draw = () => {
      box.innerHTML = "";
      box.append(h("h2", {}, "Music"));
      if (!this.configured()) { box.style.display = "none"; return; }
      if (!this.loggedIn()) {
        box.append(h("div", { class: "meta-sub" }, "Each problem plays its own song from a playlist of yours (Spotify Premium)."),
                   h("div", { class: "controls" }, [h("button", { class: "wide", onclick: () => this.login().catch(e => this.say(e.message)) }, "Connect Spotify")]));
      } else if (!this.playlist()) {
        const input = h("input", { type: "text", placeholder: "Paste a Spotify playlist link", class: "music-input" });
        const save = h("button", { class: "wide", onclick: async () => {
          save.disabled = true; this.say("Loading playlist…");
          try { await this.setPlaylist(input.value); this.problemOpened(book.id, p.id); }
          catch (e) { this.say(e.message); }
          finally { save.disabled = false; }
        } }, "Use this playlist");
        box.append(h("div", { class: "meta-sub" }, "Pick the playlist the problems' songs come from."), input, h("div", { class: "controls" }, [save]));
      } else {
        const song = this.songFor(book.id, p.id), pl = this.playlist(), on = this.enabled();
        box.append(h("div", { class: "music-now" }, song ? [h("b", {}, song[1]), ` — ${song[2]}`] : "No song"),
                   h("div", { class: "meta-sub" }, this.pinned(book.id, p.id) ? "Pinned to this problem" : `From “${pl.name}”`));
        const act = fn => async () => { try { await fn(); } catch (e) { this.say(e.message); } };
        box.append(h("div", { class: "controls" }, [
          h("button", { onclick: act(() => song && this.play(song)) }, "▶ Play"),
          h("button", { onclick: act(() => this.pause()) }, "❚❚ Pause"),
          this.pinned(book.id, p.id)
            ? h("button", { onclick: () => this.unpin(book.id, p.id) }, "Unpin")
            : h("button", { title: "Tie the song playing in Spotify now to this problem", onclick: act(() => this.pinCurrent(book.id, p.id)) }, "Use current song"),
          h("button", { onclick: () => { this.setEnabled(!on); if (!on) this.problemOpened(book.id, p.id); } }, on ? "Auto-play: on" : "Auto-play: off"),
          h("button", { title: "After the problem's song, keep playing similar songs",
                        onclick: () => this.setRadio(!this.radioOn()) }, this.radioOn() ? "Song radio: on" : "Song radio: off"),
          h("button", { onclick: () => { this.store(this.LIST_KEY, null); this.emit(); } }, "Change playlist"),
        ]));
      }
      if (this.message) box.append(h("div", { class: "meta-sub music-msg" }, this.message));
    };
    draw();
    const off = this.onChange(() => { if (!box.isConnected) return off(); draw(); });
    return box;
  },
};

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

  // Replays the moves; returns { grid, last, keys } (keys = positions in order, for ko).
  replay(upTo = this.d.moves.length) {
    let g = Array.from({ length: N }, () => new Array(N).fill(EMPTY)), last = null;
    const keys = [g.flat().join("")];
    for (const m of this.d.moves.slice(0, upTo)) {
      last = null;
      if (!m.pass) {
        g = applyMove(g, m.c, m.r, m.color) || g;
        last = [m.c, m.r];
      }
      keys.push(g.flat().join(""));
    }
    return { grid: g, last, keys };
  },

  play(c, r) {
    const { grid, keys } = this.replay();
    if (grid[r][c] !== EMPTY) return false;
    const g2 = applyMove(grid, c, r, this.d.next);
    if (!g2 || keys[keys.length - 2] === g2.flat().join("")) return false; // suicide / simple ko
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
    Review.pullRemoteFallback().then(changed => { if (changed && location.hash.startsWith("#/review")) viewReview(); });
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
        h("button", { onclick: () => { Review.close(); viewReview(); } }, "Close game"),
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

/* ================= play on OGS (OAuth login + realtime games) ================= */

// Live games on online-go.com straight from this static site: OAuth2 with
// PKCE (a public client, no secret) for login, then OGS's realtime WebSocket
// for matchmaking and play. Message formats follow OGS's own client and
// WeiqiHub's (github.com/ale64bit/WeiqiHub, lib/game_client/ogs).

const stonesOf = s => { const out = []; for (let i = 0; i + 1 < s.length; i += 2) out.push(cIdx(s.slice(i, i + 2))); return out; };
const sgfPt = (c, r) => String.fromCharCode(97 + c) + String.fromCharCode(97 + r);

class OGSSocket {
  constructor(base, jwt, onMessage, onOpen) {
    this.url = base.replace("https://", "wss://") + "/";
    Object.assign(this, { jwt, onMessage, onOpen });
    this.seq = 0; this.pending = new Map(); this.drift = 0; this.latency = 0; this.tries = 0; this.closed = false;
    try {
      this.deviceId = localStorage.getItem("goban.ogsDevice");
      if (!this.deviceId) localStorage.setItem("goban.ogsDevice", this.deviceId = crypto.randomUUID());
    } catch { this.deviceId = crypto.randomUUID(); }
    this.open();
  }
  open() {
    const ws = this.ws = new WebSocket(this.url);
    ws.onopen = () => {
      this.tries = 0;
      this.send("authenticate", { jwt: this.jwt(), device_id: this.deviceId, user_agent: navigator.userAgent,
                                  language: "en", language_version: "1.0", client_version: "goban-trainer" });
      this.ping();
      clearInterval(this.pinger);
      this.pinger = setInterval(() => this.ping(), 10000);
      this.onOpen();
    };
    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (typeof m[0] === "number") { // reply to a request: [id, result, error]
        const p = this.pending.get(m[0]);
        if (!p) return;
        this.pending.delete(m[0]);
        if (m[2]) p.reject(new Error(m[2].message || m[2].code || JSON.stringify(m[2])));
        else p.resolve(m[1]);
      } else if (m[0] === "net/pong") {
        const now = Date.now();
        this.latency = now - m[1].client;
        this.drift = now - this.latency / 2 - m[1].server;
      } else this.onMessage(m[0], m[1]);
    };
    ws.onclose = () => {
      clearInterval(this.pinger);
      for (const p of this.pending.values()) p.reject(new Error("Connection to OGS lost"));
      this.pending.clear();
      if (!this.closed) setTimeout(() => this.open(), Math.min(30000, 1000 * 2 ** this.tries++));
    };
  }
  get ready() { return this.ws && this.ws.readyState === 1; }
  ping() { this.send("net/ping", { client: Date.now(), drift: this.drift, latency: this.latency }); }
  send(cmd, data) { if (this.ready) this.ws.send(JSON.stringify(data === undefined ? [cmd] : [cmd, data])); }
  request(cmd, data) {
    return new Promise((resolve, reject) => {
      if (!this.ready) return reject(new Error("Not connected to OGS"));
      const id = ++this.seq;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify([cmd, data, id]));
      setTimeout(() => { if (this.pending.delete(id)) reject(new Error("OGS didn't answer")); }, 10000);
    });
  }
  close() { this.closed = true; clearInterval(this.pinger); if (this.ws) this.ws.close(); }
}

// One live game, fed by game/<id>/* socket events.
class LiveGame {
  constructor(id, myId) {
    this.id = id; this.myId = myId;
    this.data = null; this.moves = []; this.clock = null; this.clockAt = 0;
    this.phase = "loading"; this.removedStr = ""; this.error = ""; this.resync = false;
  }
  handle(kind, d) {
    if (kind === "gamedata") {
      this.data = d; this.phase = d.phase;
      this.moves = (d.moves || []).map(m => [m[0], m[1]]);
      this.removedStr = typeof d.removed === "string" ? d.removed : "";
      if (d.clock) this.setClock(d.clock);
    } else if (kind === "move") {
      this.pending = null;
      if (d.move_number === this.moves.length + 1) this.moves.push([d.move[0], d.move[1]]);
      else this.resync = true; // missed something; fetch the full state again
    } else if (kind === "clock") this.setClock(d);
    else if (kind === "phase") {
      this.phase = d;
      if (d === "finished") this.resync = true; // fetch the winner and outcome
    }
    else if (kind === "removed_stones") this.removedStr = d.all_removed || "";
    else if (kind === "undo_accepted" || kind === "reset") this.resync = true;
    else if (kind === "error") this.error = typeof d === "string" ? d : JSON.stringify(d);
  }
  setClock(c) { this.clock = c; this.clockAt = Date.now(); }

  player(color) { return this.data && this.data.players && this.data.players[color === BLACK ? "black" : "white"] || {}; }
  get myColor() { return this.player(BLACK).id === this.myId ? BLACK : this.player(WHITE).id === this.myId ? WHITE : 0; }
  get removed() { return new Set(stonesOf(this.removedStr).map(([c, r]) => r * N + c)); }

  // Who played move i (0-based), the way OGS assigns colors.
  colorOf(i) {
    const d = this.data || {}, hc = d.handicap || 0;
    let first = d.initial_player === "white" ? WHITE : BLACK;
    if (hc > 1 && d.free_handicap_placement) {
      if (i < hc) return BLACK;
      i -= hc; first = WHITE;
    }
    return i % 2 === 0 ? first : 3 - first;
  }
  toMove() {
    if (this.clock && this.clock.current_player) return this.clock.current_player === this.player(BLACK).id ? BLACK : WHITE;
    return this.colorOf(this.moves.length);
  }
  get myTurn() { return this.phase === "play" && this.myColor && this.toMove() === this.myColor; }

  replay() {
    let g = Array.from({ length: N }, () => new Array(N).fill(EMPTY)), last = null;
    const init = (this.data && this.data.initial_state) || {};
    for (const [c, r] of stonesOf(init.black || "")) g[r][c] = BLACK;
    for (const [c, r] of stonesOf(init.white || "")) g[r][c] = WHITE;
    this.moves.forEach(([c, r], i) => {
      last = null;
      if (c < 0) return; // pass
      g = applyMove(g, c, r, this.colorOf(i)) || g;
      last = [c, r];
    });
    return { grid: g, last };
  }

  // Time left for `color` right now: { main, periods, period, byo } in seconds.
  timeLeft(color) {
    const c = this.clock, t = c && (color === BLACK ? c.black_time : c.white_time);
    if (t == null || (typeof t !== "object" && typeof t !== "number")) return null;
    let elapsed = 0;
    if (this.phase === "play" && !c.paused_since && c.current_player === this.player(color).id) {
      // c.now is the server's clock when it sent this; avoids trusting the phone's clock.
      elapsed = (Date.now() - this.clockAt) / 1000 + (c.now && c.last_move ? (c.now - c.last_move) / 1000 : 0);
    }
    if (typeof t === "number") return { main: Math.max(0, t - elapsed), periods: 0, period: 0, byo: false }; // simple
    const main = (t.thinking_time || 0) - elapsed, period = t.period_time || 0;
    if (main > 0) return { main, periods: t.periods || 0, period, byo: false };
    if (!t.periods && t.block_time != null) { // canadian: block_time for moves_left moves
      return { main: Math.max(0, t.block_time + main), periods: 0, period: 0, byo: false, moves: t.moves_left };
    }
    if (!t.periods) return { main: 0, periods: 0, period: 0, byo: false }; // fischer / absolute: out of time
    const over = -main, used = period > 0 ? Math.floor(over / period) : Infinity;
    const periods = Math.max(0, (t.periods || 0) - used);
    return { main: 0, periods, period: periods ? period - (over - used * period) : 0, byo: true };
  }

  resultText() {
    const d = this.data || {};
    if (this.phase !== "finished") return "";
    const won = d.winner === this.myId, lost = d.winner && !won && this.myColor;
    const who = d.winner === this.player(BLACK).id ? "Black" : d.winner === this.player(WHITE).id ? "White" : "";
    const how = d.outcome ? ` by ${d.outcome}` : "";
    return won ? `You won${how}` : lost ? `You lost${how}` : who ? `${who} won${how}` : `Game over${how}`;
  }
}

const OGSPlay = {
  // Play always uses online-go.com; the beta entries are kept only for reference.
  SERVERS: { prod: "https://online-go.com", beta: "https://beta.online-go.com" },
  // Public OAuth client IDs from <server>/oauth2/applications/ (not secrets).
  CLIENT_IDS: { prod: "IJg6la0wpumEIw4dQkqql7POhxgbkpDSG40bj1eK", beta: "AXZY8pTJw2qGjXCRsYc7912QVGvSqdfGgA7abEM9" },
  // The Android app can't receive an https redirect itself; this page on the
  // site hands the login back to the app.
  APP_REDIRECT: "https://chamyao.github.io/goban-trainer/oauth-app.html",
  AUTH_KEY: "goban.ogsAuth", FLOW_KEY: "goban.ogsFlow", SERVER_KEY: "goban.ogsServer",
  TIME_LABEL: "19×19 · 5 min + 5×30 s byoyomi",

  me: null, jwt: null, sock: null, game: null, search: null, loginError: "", listeners: new Set(),

  // Always online-go.com: an old stored "beta" choice is ignored (and cleared).
  serverKey() {
    try { if (localStorage.getItem(this.SERVER_KEY)) localStorage.removeItem(this.SERVER_KEY); } catch {}
    return "prod";
  },
  base() { return this.SERVERS[this.serverKey()]; },
  clientId() { return this.CLIENT_IDS[this.serverKey()]; },
  isApp() { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); },
  redirectUri() { return this.isApp() ? this.APP_REDIRECT : location.origin + location.pathname; },

  loadAuth() {
    try { const a = JSON.parse(localStorage.getItem(this.AUTH_KEY)); return a && a.server === this.serverKey() ? a : null; }
    catch { return null; }
  },
  saveAuth(a) { try { if (a) localStorage.setItem(this.AUTH_KEY, JSON.stringify(a)); else localStorage.removeItem(this.AUTH_KEY); } catch {} },
  loggedIn() { return !!this.loadAuth(); },

  async login() {
    const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const verifier = b64(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = b64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    const state = b64(crypto.getRandomValues(new Uint8Array(12)));
    localStorage.setItem(this.FLOW_KEY, JSON.stringify({ verifier, state, server: this.serverKey(), redirect: this.redirectUri() }));
    const q = new URLSearchParams({
      response_type: "code", client_id: this.clientId(), redirect_uri: this.redirectUri(),
      code_challenge: challenge, code_challenge_method: "S256", state, scope: "read write",
    });
    location.href = `${this.base()}/oauth2/authorize/?${q}`; // the app hands this to Chrome
  },

  // OGS sends the browser back with ?code=&state= (the app gets them via oauth-app.html).
  async finishLogin(params) {
    let flow = null;
    try { flow = JSON.parse(localStorage.getItem(this.FLOW_KEY)); localStorage.removeItem(this.FLOW_KEY); } catch {}
    if (params.get("error")) throw new Error(`OGS login failed: ${params.get("error_description") || params.get("error")}`);
    if (!flow || flow.state !== params.get("state")) throw new Error("That login link expired — log in again.");
    if (flow.server !== this.serverKey()) throw new Error("That login link expired — log in again.");
    const tok = await this.tokenRequest(this.base(), {
      grant_type: "authorization_code", code: params.get("code"), redirect_uri: flow.redirect,
      client_id: this.clientId(), code_verifier: flow.verifier,
    });
    this.saveAuth({ server: this.serverKey(), ...tok });
  },
  async tokenRequest(base, fields) {
    const r = await fetch(`${base}/oauth2/token/`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fields),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw new Error(`OGS login failed (${d.error_description || d.error || r.status})`);
    return { access: d.access_token, refresh: d.refresh_token, expires: Date.now() + (d.expires_in || 3600) * 1000 };
  },
  async token() {
    const a = this.loadAuth();
    if (!a) throw new Error("Not logged in to OGS");
    if (Date.now() < a.expires - 60000) return a.access;
    try {
      if (!a.refresh) throw new Error("OGS login expired — log in again.");
      const t = await this.tokenRequest(this.base(), { grant_type: "refresh_token", refresh_token: a.refresh, client_id: this.clientId() });
      this.saveAuth({ server: a.server, ...t });
      return t.access;
    } catch (e) { this.logout(); throw e; }
  },
  async api(path) {
    const r = await fetch(this.base() + path, { headers: { Authorization: `Bearer ${await this.token()}` } });
    if (r.status === 401) { this.logout(); throw new Error("OGS login expired — log in again."); }
    if (!r.ok) throw new Error(`OGS returned ${r.status}`);
    return r.json();
  },
  logout() {
    this.saveAuth(null);
    if (this.sock) this.sock.close();
    this.sock = this.me = this.jwt = this.game = this.search = null;
    this.emit();
  },

  // Fetches the account and its realtime token, then opens the socket.
  async connect() {
    if (this.sock) return;
    const cfg = await this.api("/api/v1/ui/config");
    if (!cfg.user || cfg.user.anonymous) { this.logout(); throw new Error("OGS didn't accept the login — log in again."); }
    if (!cfg.user_jwt) throw new Error("OGS didn't return a realtime token for this login.");
    this.me = cfg.user; this.jwt = cfg.user_jwt;
    this.sock = new OGSSocket(this.base(), () => this.jwt, (c, d) => this.onMessage(c, d), () => this.onOpen());
    this.emit();
  },
  onOpen() {
    this.sendSearch();
    if (this.game) this.sock.send("game/connect", { game_id: this.game.id, chat: false });
  },

  findGame() {
    this.search = { uuid: crypto.randomUUID(), since: Date.now() };
    this.sendSearch();
    this.emit();
  },
  sendSearch() {
    if (!this.search) return;
    // OGS's standard 19×19 "rapid" automatch: 5 min + 5×30 s byoyomi.
    this.sock.send("automatch/find_match", {
      uuid: this.search.uuid,
      size_speed_options: [{ size: "19x19", speed: "rapid", system: "byoyomi" }],
      lower_rank_diff: 3, upper_rank_diff: 3,
      rules: { condition: "required", value: "japanese" },
      handicap: { condition: "preferred", value: "enabled" },
    });
  },
  cancelSearch() {
    if (this.search && this.sock) this.sock.send("automatch/cancel", { uuid: this.search.uuid });
    this.search = null;
    this.emit();
  },

  openGame(id) {
    id = +id;
    if (this.game && this.game.id === id) return;
    if (this.game) this.sock.send("game/disconnect", { game_id: this.game.id });
    this.game = new LiveGame(id, this.me.id);
    this.sock.send("game/connect", { game_id: id, chat: false });
    this.emit();
  },

  onMessage(cmd, d) {
    if (cmd === "user/jwt") { this.jwt = d; return; }
    if (cmd === "automatch/start" && this.search && d && d.uuid === this.search.uuid) {
      this.search = null;
      this.openGame(d.game_id);
      location.hash = `#/play/${d.game_id}`;
      return;
    }
    if (cmd === "automatch/cancel" && this.search && d && d.uuid === this.search.uuid) { this.search = null; this.emit(); return; }
    const m = /^game\/(\d+)\/(.+)$/.exec(cmd);
    if (m && this.game && +m[1] === this.game.id) {
      this.game.handle(m[2], d);
      if (this.game.resync) { this.game.resync = false; this.sock.send("game/connect", { game_id: this.game.id, chat: false }); }
      this.emit();
    }
  },

  async move(c, r) {
    const g = this.game;
    try { await this.sock.request("game/move", { game_id: g.id, move: c < 0 ? ".." : sgfPt(c, r) }); }
    catch (e) { g.error = e.message; this.emit(); }
  },
  resign() { this.sock.send("game/resign", { game_id: this.game.id }); },
  // Stone removal: mark or unmark a set of stones as dead.
  setRemoved(points, removed) {
    this.sock.send("game/removed_stones/set", { game_id: this.game.id, removed, stones: points.map(([c, r]) => sgfPt(c, r)).join("") });
  },
  acceptScore() {
    this.sock.send("game/removed_stones/accept", { game_id: this.game.id, stones: this.game.removedStr, strict_seki_mode: false });
  },
  resumePlay() { this.sock.send("game/removed_stones/reject", { game_id: this.game.id }); },

  // Your unfinished games (live and correspondence), as
  // { id, width, height, opp, corr, myMove } — myMove is null when unknown.
  // /ui/overview carries each game's clock (whose turn it is); the plain
  // games list is the fallback.
  async ongoing() {
    const me = this.me.id, out = [];
    const isCorr = g => {
      let tcp = g.time_control_parameters;
      if (typeof tcp === "string") { try { tcp = JSON.parse(tcp); } catch { tcp = null; } }
      if (tcp && tcp.speed) return tcp.speed === "correspondence";
      return (g.time_per_move || 0) >= 3600;
    };
    const row = (g, black, white, toMove) => ({
      id: g.id, width: g.width, height: g.height,
      opp: ((black && black.id === me ? white : black) || {}).username || "?",
      corr: isCorr(g), myMove: toMove == null ? null : toMove === me,
    });
    try {
      const d = await this.api("/api/v1/ui/overview");
      if (!Array.isArray(d.active_games)) throw new Error("no active_games");
      for (const g of d.active_games) {
        const j = g.json || {}, p = j.players || {};
        const toMove = (j.clock && j.clock.current_player) ?? g.player_to_move ?? null;
        out.push(row({ ...j, ...g, time_control_parameters: g.time_control_parameters || j.time_control },
                     g.black || p.black, g.white || p.white, toMove));
      }
      return out;
    } catch (e) { if (!this.loggedIn()) throw e; }
    const d = await this.api(`/api/v1/players/${me}/games/?ended__isnull=true&source=play&ordering=-id&page_size=20`);
    for (const g of d.results || []) out.push(row(g, g.players && g.players.black, g.players && g.players.white, g.player_to_move ?? null));
    return out;
  },

  emit() { for (const f of this.listeners) f(); },
};

let playTicker = null;

// m:ss under an hour, then "3h 05m", then "2d 4h" (correspondence clocks).
function fmtDuration(s) {
  s = Math.max(0, s);
  if (s >= 86400) return `${Math.floor(s / 86400)}d ${Math.floor(s % 86400 / 3600)}h`;
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}m`;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function fmtClock(t) {
  if (!t) return "–";
  if (!t.byo) {
    const extra = t.periods ? ` + ${t.periods}×${t.period >= 60 ? fmtDuration(t.period) : t.period + "s"}`
                : t.moves ? ` / ${t.moves} moves` : "";
    return fmtDuration(t.main) + extra;
  }
  if (t.period >= 3600) return t.periods ? `${fmtDuration(t.period)} · ${t.periods} left` : "0s";
  return t.periods ? `${Math.ceil(t.period)}s · ${t.periods} left` : "0s";
}

function viewPlay(gameId) {
  crumbs.textContent = "";
  root.textContent = "";
  OGSPlay.listeners.clear();
  const wrap = h("div", { class: "play" });
  root.append(wrap);
  const rerender = () => {
    if (!wrap.isConnected) { OGSPlay.listeners.delete(rerender); return; }
    wrap.textContent = "";
    wrap.append(...playBody(gameId));
  };
  OGSPlay.listeners.add(rerender);
  rerender();
}

function playBody(gameId) {
  const P = OGSPlay, server = P.serverKey();

  if (!P.clientId()) {
    return [h("div", { class: "sgf-loader" }, [
      h("div", { class: "cat-title" }, "Play on OGS"),
      h("div", {}, `OGS login isn't set up yet for ${P.SERVERS[server].replace("https://", "")}: the app needs to be registered with OGS first.`),
    ])];
  }

  if (!P.loggedIn()) {
    const err = h("div", { class: "err" }, P.loginError);
    return [h("div", { class: "sgf-loader" }, [
      h("div", { class: "cat-title" }, "Play on OGS"),
      h("div", {}, `Play ${P.TIME_LABEL} games on online-go.com, and continue your correspondence games. You log in on OGS's own page — your password never reaches this app.`),
      h("div", { class: "row" }, [h("button", { class: "primary", onclick: () => P.login().catch(e => { err.textContent = e.message; }) }, "Log in with OGS")]),
      err,
    ])];
  }

  if (!P.sock) {
    const msg = h("div", { class: "meta-sub" }, "Connecting to OGS…");
    P.connect().catch(e => { msg.textContent = e.message; msg.className = "err"; });
    return [h("div", { class: "sgf-loader" }, [h("div", { class: "cat-title" }, "Play on OGS"), msg])];
  }

  if (gameId) {
    if (!P.game || P.game.id !== +gameId) P.openGame(gameId);
    return playGame(P.game);
  }
  return playLobby();
}

function playLobby() {
  const P = OGSPlay;
  clearInterval(playTicker);
  const status = h("div", { class: "meta-sub" });
  const games = h("div", { class: "review-history", style: "margin:0" });
  let action;
  if (P.search) {
    const since = h("span", {});
    const tick = () => { since.textContent = `${Math.floor((Date.now() - P.search.since) / 1000)}s`; };
    tick();
    playTicker = setInterval(() => { if (!P.search || !since.isConnected) return clearInterval(playTicker); tick(); }, 1000);
    action = h("div", { class: "row" }, [
      h("div", { class: "meta-sub" }, ["Looking for an opponent… ", since]),
      h("button", { onclick: () => P.cancelSearch() }, "Cancel"),
    ]);
  } else {
    action = h("div", { class: "row" }, [h("button", { class: "primary", onclick: () => P.findGame() }, "Find a game")]);
  }
  P.ongoing().then(list => {
    // Games waiting for your move first.
    list.sort((a, b) => (b.myMove === true) - (a.myMove === true));
    for (const g of list) {
      const kind = (g.corr ? "Correspondence" : "Live") + (g.myMove === true ? " · your move" : g.myMove === false ? " · waiting" : "");
      const row = h("div", { class: "history-item" }, [h("div", { class: "hi-open" }, [
        h("div", { class: "t" }, `${g.corr ? "Open" : "Resume"} game vs ${g.opp}`),
        h("div", { class: "n" }, `${kind} · ${g.width}×${g.height} · game ${g.id}`),
      ])]);
      row.addEventListener("click", () => { location.hash = `#/play/${g.id}`; });
      games.append(row);
    }
  }).catch(e => { status.textContent = e.message; });

  return [h("div", { class: "sgf-loader" }, [
    h("div", { class: "cat-title" }, "Play on OGS"),
    h("div", {}, [`Logged in as `, h("b", {}, P.me.username), ` on ${P.base().replace("https://", "")}. `,
                  h("a", { href: "#/play", onclick: e => { e.preventDefault(); P.logout(); } }, "Log out")]),
    h("div", { class: "meta-sub" }, `Ranked ${P.TIME_LABEL}, Japanese rules, opponents within 3 ranks.`),
    action, status, games,
  ])];
}

function playGame(g) {
  const P = OGSPlay;
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" }, [svg]);
  const { grid, last } = g.replay();
  const removed = g.removed;
  const scoring = g.phase === "stone removal";

  const goban = new Goban(svg, { c0: 0, c1: 18, r0: 0, r1: 18 }, (c, r) => {
    if (scoring) {
      if (grid[r][c] === EMPTY) return;
      const pts = [...groupAndLiberties(grid, c, r).stones].map(k => [(k - k % N) / N, k % N]);
      P.setRemoved(pts, !removed.has(r * N + c));
    } else if (g.myTurn && grid[r][c] === EMPTY && applyMove(grid, c, r, g.myColor)) {
      // On touch screens the points are tiny: first tap previews, second tap plays.
      const same = g.pending && g.pending[0] === c && g.pending[1] === r;
      if (matchMedia("(pointer: coarse)").matches && !same) { g.pending = [c, r]; P.emit(); return; }
      g.pending = null; g.error = "";
      P.move(c, r);
    }
  });
  goban.hoverColor = g.myColor || BLACK;
  goban.render(grid, last, g.myTurn || scoring);
  if (g.pending && g.myTurn)
    goban.el("circle", { cx: goban.px(g.pending[0]), cy: goban.py(g.pending[1]), r: goban.cell * .47, opacity: .55,
                         fill: g.myColor === BLACK ? "url(#bs)" : "url(#ws)", "pointer-events": "none" });
  for (const k of removed) { // dead stones: fade and cross out
    const c = k % N, r = (k - c) / N, x = goban.px(c), y = goban.py(r), s = goban.cell * .22;
    goban.el("circle", { cx: x, cy: y, r: goban.cell * .47, fill: "#dcb35c", opacity: .55, "pointer-events": "none" });
    goban.el("path", { d: `M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}`,
                       stroke: "var(--danger)", "stroke-width": 3, "pointer-events": "none" });
  }

  const clockEl = color => h("div", { class: "pl-clock" }, fmtClock(g.timeLeft(color)));
  const playerRow = color => {
    const p = g.player(color), toMove = g.phase === "play" && g.toMove() === color;
    const el = h("div", { class: `pl-row${toMove ? " to-move" : ""}` }, [
      h("span", { class: `pl-stone ${color === BLACK ? "b" : "w"}` }),
      h("span", { class: "pl-name" }, `${p.username || "…"}${color === g.myColor ? " (you)" : ""}`),
      clockEl(color),
    ]);
    el.color = color;
    return el;
  };
  const rows = [playerRow(BLACK), playerRow(WHITE)];

  clearInterval(playTicker);
  playTicker = setInterval(() => {
    if (!svg.isConnected) return clearInterval(playTicker);
    for (const row of rows) {
      const t = g.timeLeft(row.color), el = row.lastChild;
      el.textContent = fmtClock(t);
      el.classList.toggle("low", !!t && t.byo && t.period < 10);
    }
  }, 250);

  const status = h("div", { class: "meta-sub" },
    g.phase === "loading" ? "Loading game…"
    : g.phase === "finished" ? g.resultText()
    : scoring ? "Game over by passes — tap groups to mark them dead, then accept the score."
    : g.myTurn ? (g.pending ? "Tap the stone again to play it." : "Your move.")
    : g.myColor ? "Opponent's move." : "Watching.");
  const err = h("div", { class: "err" }, g.error);

  const buttons = [];
  if (g.phase === "play" && g.myColor) {
    const pass = h("button", { onclick: () => { if (confirm("Pass?")) P.move(-1, -1); } }, "Pass");
    pass.disabled = !g.myTurn;
    buttons.push(pass);
    buttons.push(h("button", { onclick: () => { if (confirm("Resign this game?")) P.resign(); } }, "Resign"));
  } else if (scoring && g.myColor) {
    buttons.push(h("button", { class: "primary", onclick: () => P.acceptScore() }, "Accept score"));
    buttons.push(h("button", { onclick: () => P.resumePlay() }, "Resume play"));
    buttons.push(h("button", { class: "wide", onclick: () => markDeadWithKataGo(g, grid, err) }, "Mark dead stones with KataGo"));
  } else if (g.phase === "finished") {
    buttons.push(h("button", { class: "primary", onclick: () => reviewOgsGame(g.id, err) }, "Review this game"));
    buttons.push(h("button", { onclick: () => { P.game = null; location.hash = "#/play"; } }, "Back to lobby"));
  }

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [h("h2", {}, `OGS game ${g.id}`), ...rows, status, err]),
    buttons.length ? h("div", { class: "panel" }, [h("div", { class: "rv-actions" }, buttons)]) : "",
  ]);
  return [h("div", { class: "review" }, [boardCard, aside])];
}

// Proposes dead stones from KataGo's ownership map (stones in the
// opponent's territory with high confidence).
async function markDeadWithKataGo(g, grid, err) {
  try {
    err.textContent = "KataGo is reading the position…";
    const a = await Engine.analyze({
      board: gridToBoardState(grid), currentPlayer: g.toMove() === WHITE ? "white" : "black",
      moveHistory: [], komi: (g.data && g.data.komi) || 6.5, visits: 150, ownershipMode: "root",
    });
    const dead = [];
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const own = a.ownership[r * N + c]; // + = Black's
        if ((grid[r][c] === BLACK && own < -0.6) || (grid[r][c] === WHITE && own > 0.6)) dead.push([c, r]);
      }
    const before = stonesOf(g.removedStr);
    if (before.length) OGSPlay.setRemoved(before, false);
    if (dead.length) OGSPlay.setRemoved(dead, true);
    err.textContent = dead.length ? `Marked ${dead.length} dead stones — check them, then accept.` : "KataGo found no dead stones.";
  } catch (e) { err.textContent = `KataGo couldn't score this: ${e.message}`; }
}

async function reviewOgsGame(id, err) {
  try {
    const r = await fetch(`${OGSPlay.base()}/api/v1/games/${id}/sgf`);
    if (!r.ok) throw new Error(`Couldn't download the game (${r.status})`);
    Review.load(await r.text());
    Review.currentId = Review.newId();
    Review.saveState();
    location.hash = "#/review";
  } catch (e) { err.textContent = e.message; }
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

// Bumped on every navigation so async views can tell they've gone stale.
let routeSeq = 0;

async function route() {
  routeSeq++;
  if (trainer) trainer.alive = false;
  trainer = null;
  Review.els = null;
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  clearInterval(playTicker);
  const tab = ["review", "play", "feedback"].includes(parts[0]) ? parts[0] : "library";
  for (const a of document.querySelectorAll("#tabs a"))
    a.classList.toggle("active", a.dataset.tab === tab);
  if (parts[0] === "review") viewReview();
  else if (parts[0] === "play") viewPlay(parts[1]);
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
// The Review tab always lands on the game list, even with a game open.
document.querySelector('#tabs a[data-tab="review"]').addEventListener("click", () => {
  Review.close();
  if (location.hash.startsWith("#/review")) viewReview();
});
window.__engine = Engine;
window.__review = Review;
Sync.init();
// Back from OGS's login page with ?code=&state=: finish the login, then
// drop the query string and land on the Play tab.
const loginParams = new URLSearchParams(location.search);
if (loginParams.get("state") && (loginParams.get("code") || loginParams.get("error")) && Spotify.isReturn(loginParams)) {
  Spotify.finishLogin(loginParams)
    .then(back => history.replaceState(null, "", location.pathname + back))
    .catch(e => { Spotify.message = e.message; history.replaceState(null, "", location.pathname + "#/"); })
    .finally(route);
} else if (loginParams.get("state") && (loginParams.get("code") || loginParams.get("error"))) {
  OGSPlay.finishLogin(loginParams)
    .catch(e => { OGSPlay.loginError = e.message; })
    .finally(() => { history.replaceState(null, "", location.pathname + "#/play"); route(); });
} else route();
