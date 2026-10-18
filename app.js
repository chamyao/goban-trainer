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
  API_URL: "https://script.google.com/macros/s/AKfycbxClc9eoQ4jhxT2hwGK-y_JZef-7N9S27XJqPejKic8mO47qtbI5WNMYofN7hpMb_fGdw/exec",
  USERNAME_KEY: "gt-username",
  username: null,
  saveTimer: null,

  async init() {
    this.username = localStorage.getItem(this.USERNAME_KEY);
    this.renderChip();
    this.onStale = () => whenIdle(route);   // a rollback from another device came in while saving: redraw from it
    if (this.username) this.pullAndMerge().then(route).catch(e => console.error("[sync]", e));
    else if (!/^#\/tk/.test(location.hash)) this.promptUsername();   // not over the game's opening scroll: there the header chip offers it
    document.addEventListener("visibilitychange", () => {
      // back to this tab: pick up what another device did meanwhile (and redraw if anything came in)
      if (document.visibilityState === "visible") {
        if (this.username && !this.saveTimer) this.pullAndMerge().then(changed => { if (changed) whenIdle(route); }).catch(e => console.error("[sync]", e));
        return;
      }
      if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveProgress(); }
      if (Review.saveTimer) { clearTimeout(Review.saveTimer); Review.saveState(); }
    });
  },

  // kind selects which Sheet the Apps Script reads/writes ("progress" or
  // "review") — separate rows, so a large review blob can never break
  // solved-problem sync, and vice versa.
  async fetchRemote(kind = "progress") {
    if (!this.username) return {};
    const res = await fetch(`${this.API_URL}?username=${encodeURIComponent(this.username)}&kind=${kind}`);
    if (!res.ok) {
      console.error("[sync] fetch failed", kind, res.status);
      if (kind === "progress") throw new Error(`fetch failed (${res.status})`);   // never merge (and then write) against a row we couldn't read
      return {};
    }
    const body = await res.json();
    return kind === "progress" ? this.unpack(body.data) : body.data || {};
  },
  // the progress row goes up gzipped (base64): a Sheet cell holds 50,000 characters, and apo110's row grew past
  // the 48,000 we send, so every save after Oct 11 was skipped and the sheet kept an old rating (the user: "6k, now 9k+")
  async pack(data) {
    try {
      const gz = new Uint8Array(await new Response(new Blob([JSON.stringify(data)]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
      let s = "";
      for (let i = 0; i < gz.length; i += 0x8000) s += String.fromCharCode.apply(null, gz.subarray(i, i + 0x8000));
      return { gz: btoa(s) };
    } catch { return data; }
  },
  async unpack(data) {
    if (!data || typeof data.gz !== "string") return data || {};
    const gz = Uint8Array.from(atob(data.gz), c => c.charCodeAt(0));
    return JSON.parse(await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
  },

  // Pull this username's row, merge into local (solved sticks, favorites
  // union), so a fresh browser/device picks up prior progress + favorites.
  // The campaign's own place in each book (TK_SYNC: where you stand, the party, the beat) follows the
  // device that played last: the row's stamp against this browser's. Returns whether anything changed.
  async pullAndMerge(remote) {
    remote = remote || await this.fetchRemote("progress");
    const local = loadProgress(), before = JSON.stringify(local);
    this.mergeInto(local, remote.progress || {});
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(local));
    const favs = loadFavorites(), nf = favs.size;
    for (const bookId of remote.favorites || []) favs.add(bookId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
    let moved = false;
    if (remote.tkLocal && (remote.stamp || 0) > this.stamp()) {
      // a world this device rolled back (or took a rollback of) after the other copy was made: keep ours of it
      const mine = this.tkLocal(), seenL = this.seen(mine), seenR = this.seen(remote.tkLocal);
      const keep = Object.keys(seenL).filter(n => (seenL[n] || 0) > (seenR[n] || 0));
      for (const k of Object.keys(localStorage)) if (this.tkKey(k) && !(k in remote.tkLocal)) localStorage.removeItem(k);
      for (const [k, v] of Object.entries(remote.tkLocal)) if (this.tkKey(k)) localStorage.setItem(k, v);
      for (const n of keep) this.takeWorld(mine, n);
      this.setStamp(remote.stamp); moved = true;
    }
    if (this.catchUp(local, remote.tkLocal)) moved = true;
    return moved || JSON.stringify(local) !== before || favs.size !== nf;
  },
  // solved sticks (1 beats anything); the adaptive rating follows the latest rated answer (mergeElo)
  mergeInto(local, remote) {
    for (const bookId in remote) {
      if (bookId === "tkAt" || bookId === "tkUndo" || bookId === "tkReplay" || bookId === "tkSeen") {   // dated: the later date wins (TK.cleared, TK.seen)
        const b = local[bookId] || (local[bookId] = {});
        for (const k in remote[bookId]) b[k] = Math.max(b[k] || 0, remote[bookId][k] || 0);
        continue;
      }
      if (bookId === "tkMig") {   // a book's one-time migrations: the higher version is the one done (an older copy taking
        // over set it back, and the next load ran that start-over again: apo110's Book 1, wiped)
        const b = local.tkMig || (local.tkMig = {});
        for (const k in remote.tkMig) b[k] = Math.max(+b[k] || 0, +remote.tkMig[k] || 0);
        continue;
      }
      if (bookId === "tkElo") { local.tkElo = this.mergeElo(local.tkElo, remote.tkElo); continue; }
      const b = local[bookId] || (local[bookId] = {});
      for (const pid in remote[bookId]) if (b[pid] !== 1) b[pid] = remote[bookId][pid];
    }
  },
  // the rating: the copy with the latest rated answer (at, stamped by TKElo.result) wins, the sheet's on a tie, so a
  // fresh browser or a stale tab never sets it back (before: the copy with more boards won, whatever its age);
  // copies from before the stamps go by boards played. What was dealt (used, slots) and the Stream's place join.
  mergeElo(l, r) {
    if (!r) return l;
    if (!l) return r;
    const ta = l.at || 0, tb = r.at || 0, win = tb > ta || (tb === ta && (r.n || 0) >= (l.n || 0)) ? r : l;
    const o = { ...l, r: win.r, n: win.n };
    if (win.at) o.at = win.at;
    o.used = [...new Set([...(r.used || []), ...(l.used || [])])];
    o.slots = { ...(r.slots || {}), ...(l.slots || {}) };   // a board this browser has dealt stays
    const st = (r.stream || 0) > (l.stream || 0) ? r : l;
    for (const k of ["stream", "streamRated", "streamX"]) if (st[k] !== undefined) o[k] = st[k]; else delete o[k];
    const log = new Map([...(r.log || []), ...(l.log || [])].map(e => [e[2], e]));
    if (log.size) o.log = [...log.values()].sort((a, b) => a[2] - b[2]).slice(-TKElo.LOG);
    return TKElo.trim(o);
  },
  tkKey: k => /^tk-world-\d+$/.test(k) || k === "tk-at" || k === "tk-party" || k === "tk-draw" || k === "tk-book" || k === "tk-items" || k === "tk-seen",
  // per world, the newest rollback a copy of the campaign was made after
  seen(tkLocal) { try { return JSON.parse((tkLocal || {})["tk-seen"] || "{}") || {}; } catch { return {}; } },
  // put one world's place, party, things and beat from a copy (tkLocal) into this browser, the rest as is
  takeWorld(copy, n) {
    const wk = `tk-world-${n}`;
    if (copy[wk] != null) localStorage.setItem(wk, copy[wk]); else localStorage.removeItem(wk);
    for (const k of ["tk-at", "tk-party", "tk-items", "tk-seen"]) {
      let from = {}, to = {};
      try { from = JSON.parse(copy[k] || "{}") || {}; } catch {}
      try { to = JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch {}
      if (n in from) to[n] = from[n]; else delete to[n];
      localStorage.setItem(k, JSON.stringify(to));
    }
  },
  // a world rolled back elsewhere (progress.tkReplay newer than what this browser's copy was made after):
  // this browser's place, party and things there are from before it, so take the other copy's
  catchUp(progress, remoteTk) {
    const rb = (progress && progress.tkReplay) || {}, seenL = this.seen(this.tkLocal()), seenR = this.seen(remoteTk);
    let moved = false;
    for (const n of Object.keys(rb)) if ((seenL[n] || 0) < rb[n] && remoteTk && (seenR[n] || 0) >= rb[n]) { this.takeWorld(remoteTk, n); moved = true; }
    return moved;
  },
  tkLocal() { const o = {}; for (const k of Object.keys(localStorage)) if (this.tkKey(k)) o[k] = localStorage.getItem(k); return o; },
  stamp() { try { return +localStorage.getItem("gt-sync-stamp") || 0; } catch { return 0; } },
  setStamp(t) { try { localStorage.setItem("gt-sync-stamp", String(t)); } catch {} },

  scheduleSave() {
    if (!this.username) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveProgress(), 3000);
  },
  // read, merge, write: the row is replaced whole, so another device's newer solves are folded in first
  // (a tab left open elsewhere would otherwise write its older state over them)
  async saveProgress() {
    this.saveTimer = null;
    if (!this.username) return;
    try {
      const remote = await this.fetchRemote("progress"), local = loadProgress();
      this.mergeInto(local, remote.progress || {});
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(local));
      // a world rolled back on another device since this one's copy: take that copy of it before writing ours over it
      if (this.catchUp(local, remote.tkLocal) && this.onStale) this.onStale();
    } catch (e) { console.error("[sync] merge before save, not saving", e); return; }   // the sheet is the record: never write over a row we couldn't read
    const stamp = Date.now(); this.setStamp(stamp);
    return this.save("progress", await this.pack({ progress: loadProgress(), favorites: [...loadFavorites()], tkLocal: this.tkLocal(), stamp }));
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
  async sendFeedback(message, context = location.hash) {
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        username: this.username || "",
        kind: "feedback",
        data: { message, context },
      }),
    });
    if (!res.ok) throw new Error(`feedback failed (${res.status})`);
  },

  // The campaign's chat with Claude (tk.js viewTKChat): the thread lives in the private Chat sheet behind the
  // Apps Script; a message also pings the Feedback inbox PR (no content), which wakes Claude to answer.
  // the chat's password (the script's CHAT_KEY), kept in this browser once entered
  chatKey() { try { return localStorage.getItem("tk-chat-key") || ""; } catch { return ""; } },
  setChatKey(k) { try { k ? localStorage.setItem("tk-chat-key", k) : localStorage.removeItem("tk-chat-key"); } catch {} },
  async sendChat(message, context = location.hash) {
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ username: this.username || "", kind: "chat", key: this.chatKey(), data: { message, context } }),
    });
    if (!res.ok) throw new Error(`chat failed (${res.status})`);
    const body = await res.json().catch(() => ({}));
    if (body.error === "locked") throw Object.assign(new Error("locked"), { locked: true });
  },
  async fetchChat() {
    const res = await fetch(`${this.API_URL}?username=${encodeURIComponent(this.username || "")}&kind=chat&key=${encodeURIComponent(this.chatKey())}`);
    if (!res.ok) throw new Error(`chat fetch failed (${res.status})`);
    const body = await res.json();
    if (body.error === "locked") throw Object.assign(new Error("locked"), { locked: true });
    return (body.data && body.data.messages) || [];
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
  // in the Android app the worker and model are the app's own files (APP_LOCAL), even when the page is the live site
  // (the APK ships the model unzipped, under the .bin name: see android-app/prepare-web.mjs)
  // the network: Lionffen's b6c64 (the user, 2026-10-16: "lets do lionffen 6 b"; 2025, KataGo's extra networks; 1.7 MB
  // against kata1-b10c128's 11). At equal time it solved as many kyu problems and more dan ones (31/40 against 25/40),
  // so the searches below take the visits they did before the 10-block net. It was trimmed of its score and ownership
  // heads (they read 0): the review goes by win rate, and dead stones are marked by hand. Converted from KataGo's text
  // format by tools/katago_txt2bin.py; ?v= so a browser fetches the new file under the old name
  modelUrl: new URL(window.APP_LOCAL ? "engine/katago-small.bin" : "engine/katago-small.bin.gz?v=lionffen-b6c64", window.APP_LOCAL || location.href).href,

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
      this.worker = new Worker((window.APP_LOCAL || "") + "engine/katago-worker.js");
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

// a win rate (Black's, 0..1) the way the site shows it: the side ahead and its chance, "B 63%"
function winText(w) { if (w == null || isNaN(w)) return ""; return w >= 0.5 ? `B ${Math.round(w * 100)}%` : `W ${Math.round((1 - w) * 100)}%`; }

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
// past a smaller board's edge (a 13x13 problem on our 19x19 grid): no liberty, never a group, never taken; an edge
const WALL = 3;
const cIdx = s => [s.charCodeAt(0) - 97, s.charCodeAt(1) - 97];
const COLS = "ABCDEFGHJKLMNOPQRST";
const coordLabel = (m, sz = N) => { const [c, r] = cIdx(m); return COLS[c] + (sz - r); };

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
  const E = (problem.sz || 19) - 1;   // the last line: a smaller board's far edge
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
  if (c1 >= E - 1) c1 = E;
  if (r0 <= 1) r0 = 0;
  if (r1 >= E - 1) r1 = E;
  return { c0: Math.max(0, c0), c1: Math.min(E, c1), r0: Math.max(0, r0), r1: Math.min(E, r1), sz: E + 1 };
}

/* ================= board themes ================= */
// The user: "can you add board theme options". The header's ▦ chip cycles them, kept per device (a look, not
// progress, like the Tavern chip). The gradient keeps the id "wood" whatever the colors: Wukong finds the board by it.
// Switching repaints the boards on the page in place, so a problem in progress isn't reloaded.
const BoardTheme = {
  KEY: "goban-board",
  LIST: [
    { id: "kaya",   name: "Kaya",   wood: ["#e3bd6a", "#dcb35c", "#d2a850"], line: "#4a3f28", label: "#7a6535", stone: "rgba(0,0,0,.35)" },
    { id: "light",  name: "Light",  wood: ["#f6e3b4", "#f0d79f", "#e8ca88"], line: "#5a4a2c", label: "#8a7444", stone: "rgba(0,0,0,.35)" },
    { id: "walnut", name: "Walnut", wood: ["#b07a4c", "#a26e43", "#93623a"], line: "#2e1d10", label: "#f3e2c7", stone: "rgba(0,0,0,.45)" },
    { id: "slate",  name: "Slate",  wood: ["#66707a", "#5b646d", "#515962"], line: "#161a1e", label: "#dde2e6", stone: "rgba(255,255,255,.4)" },
    { id: "green",  name: "Green",  wood: ["#55935f", "#4b8755", "#417a4b"], line: "#15301a", label: "#e1f0e2", stone: "rgba(0,0,0,.45)" },
    { id: "paper",  name: "Paper",  wood: ["#fcfbf7", "#f8f7f2", "#f2f0e9"], line: "#2b2b2b", label: "#666",    stone: "rgba(0,0,0,.55)" },
  ],
  get current() {
    let id; try { id = localStorage.getItem(this.KEY); } catch {}
    return this.LIST.find(t => t.id === id) || this.LIST[0];
  },
  next() {
    const i = this.LIST.indexOf(this.current), t = this.LIST[(i + 1) % this.LIST.length];
    try { t.id === "kaya" ? localStorage.removeItem(this.KEY) : localStorage.setItem(this.KEY, t.id); } catch {}
    this.paintAll(); this.label();
  },
  // recolor a board already drawn by Goban.render
  paint(svg, t = this.current) {
    const stops = svg.querySelectorAll("#wood stop");
    stops.forEach((s, i) => s.setAttribute("stop-color", t.wood[i] || t.wood[1]));
    for (const e of svg.querySelectorAll(".bt-line")) e.setAttribute(e.tagName === "line" ? "stroke" : "fill", t.line);
    for (const e of svg.querySelectorAll(".bt-label")) e.setAttribute("fill", t.label);
    for (const e of svg.querySelectorAll(".bt-stone")) e.setAttribute("stroke", t.stone);
    for (const e of svg.querySelectorAll(".bt-wood")) e.setAttribute("fill", t.wood[1]);
  },
  paintAll() { for (const svg of document.querySelectorAll("svg")) if (svg.querySelector("#wood")) this.paint(svg); },
  label() {
    const chip = document.getElementById("boardChip");
    if (chip) { chip.textContent = "▦ " + this.current.name; chip.title = "Board: " + this.current.name + " (click for the next look)"; }
  },
};
document.addEventListener("DOMContentLoaded", () => {
  const chip = document.getElementById("boardChip");
  if (chip) { BoardTheme.label(); chip.addEventListener("click", () => BoardTheme.next()); }
});

class Goban {
  static TOUCH = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
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
    const { c0, c1, r0, r1 } = this.crop, E = (this.crop.sz || 19) - 1;   // E: the board's last line
    this.svg.innerHTML = ""; this.ghost = null;
    const t = BoardTheme.current;
    const defs = this.el("defs", {});
    defs.innerHTML = `
      <radialGradient id="bs" cx="35%" cy="30%"><stop offset="0%" stop-color="#5a5a5a"/><stop offset="100%" stop-color="#111"/></radialGradient>
      <radialGradient id="ws" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cfcfc7"/></radialGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${t.wood[0]}"/><stop offset="55%" stop-color="${t.wood[1]}"/><stop offset="100%" stop-color="${t.wood[2]}"/>
      </linearGradient>`;
    this.el("rect", { x: 0, y: 0, width: this.W, height: this.H, rx: 10, fill: "url(#wood)" });

    const ext = this.pad * 0.55;
    for (let r = r0; r <= r1; r++)
      this.el("line", {
        x1: this.px(c0) - (c0 > 0 ? ext : 0), y1: this.py(r),
        x2: this.px(c1) + (c1 < E ? ext : 0), y2: this.py(r),
        class: "bt-line", stroke: t.line, "stroke-width": (r === 0 || r === E) ? 2.2 : 1.1,
      });
    for (let c = c0; c <= c1; c++)
      this.el("line", {
        x1: this.px(c), y1: this.py(r0) - (r0 > 0 ? ext : 0),
        x2: this.px(c), y2: this.py(r1) + (r1 < E ? ext : 0),
        class: "bt-line", stroke: t.line, "stroke-width": (c === 0 || c === E) ? 2.2 : 1.1,
      });

    // fade the cut edges so the board reads as continuing
    const f = this.pad * 0.8;
    if (c0 > 0) this.el("rect", { x: 0, y: 0, width: f, height: this.H, fill: "url(#wood)", opacity: .75 });
    if (c1 < E) this.el("rect", { x: this.W - f, y: 0, width: f, height: this.H, fill: "url(#wood)", opacity: .75 });
    if (r0 > 0) this.el("rect", { x: 0, y: 0, width: this.W, height: f, fill: "url(#wood)", opacity: .75 });
    if (r1 < E) this.el("rect", { x: 0, y: this.H - f, width: this.W, height: f, fill: "url(#wood)", opacity: .75 });

    const stars = { 19: [3, 9, 15], 13: [3, 6, 9], 9: [2, 4, 6] }[E + 1] || [];
    for (const c of stars) for (const r of stars)
      if (c >= c0 && c <= c1 && r >= r0 && r <= r1)
        this.el("circle", { class: "bt-line", cx: this.px(c), cy: this.py(r), r: 4, fill: t.line });

    // in the margin, clear of a stone on the edge line (radius ~.47 cell)
    const labelRow = r0 === 0 ? { y: this.py(r0) - 27, edge: true } : { y: this.py(r1) + 34, edge: false };
    for (let c = c0; c <= c1; c++)
      this.el("text", { x: this.px(c), y: labelRow.y, "text-anchor": "middle", "font-size": 12.5,
                        class: "bt-label", fill: t.label, "font-weight": 600 }).textContent = COLS[c];
    const labelCol = c1 === E ? this.px(c1) + 29 : this.px(c0) - 29;
    for (let r = r0; r <= r1; r++)
      this.el("text", { x: labelCol, y: this.py(r) + 4.5, "text-anchor": "middle", "font-size": 12.5,
                        class: "bt-label", fill: t.label, "font-weight": 600 }).textContent = E + 1 - r;

    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++)
        if (grid[r][c] === BLACK || grid[r][c] === WHITE) {
          this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .47,
                              fill: grid[r][c] === BLACK ? "url(#bs)" : "url(#ws)",
                              class: "bt-stone", stroke: t.stone, "stroke-width": .8 });
          if (lastMove && lastMove[0] === c && lastMove[1] === r)
            this.el("circle", { class: "last-move", cx: this.px(c), cy: this.py(r), r: this.cell * .2, fill: "none",
                                stroke: grid[r][c] === BLACK ? "#fff" : "#333", "stroke-width": 2 });
        }

    if (!interactive) return;
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        if (this.only && !this.only.has(String.fromCharCode(97 + c) + String.fromCharCode(97 + r))) continue;   // a multiple-choice board: only its letters take a tap
        const t = this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .48,
                                      fill: "transparent", cursor: "pointer" });
        if (!Goban.TOUCH) t.addEventListener("mouseenter", () => {   // (no hover on a phone: a hover that changes the board can make a phone's browser hold the tap back)
          if (grid[r][c] === EMPTY)
            t.setAttribute("fill", this.hoverColor === BLACK ? "rgba(20,20,20,.3)" : "rgba(255,255,255,.5)");
        });
        if (!Goban.TOUCH) t.addEventListener("mouseleave", () => t.setAttribute("fill", "transparent"));
        t.addEventListener("click", () => this.tap(c, r, grid));
      }
  }

  // On a touch screen where the points are closer than a fingertip (a wide crop on a small phone),
  // the first tap only shows a ghost stone; a second tap on the same point plays it, a tap on
  // another point moves the ghost. A slip costs a rest, so a fingertip miss mustn't count.
  needsConfirm() {
    if (!Goban.TOUCH || Goban.confirmMode() === "never") return false;
    const w = this.svg.getBoundingClientRect().width;
    return w > 0 && w / this.W * this.cell < 28;
  }
  tap(c, r, grid) {
    // (a multiple-choice board takes taps only on its letters; on a phone with tiny points they still confirm, so a near-miss
    // shows the pick instead of costing a guess: Testing, m22 on an iPhone)
    if (grid[r][c] !== EMPTY || !this.needsConfirm()) { this.clearGhost(); return this.onClick(c, r); }
    if (this.ghost && this.ghost.c === c && this.ghost.r === r) { this.clearGhost(); return this.onClick(c, r); }
    this.clearGhost();
    const g = this.el("circle", { cx: this.px(c), cy: this.py(r), r: this.cell * .47, "pointer-events": "none",
                                  fill: this.hoverColor === BLACK ? "rgba(20,20,20,.45)" : "rgba(255,255,255,.65)",
                                  stroke: "var(--accent)", "stroke-width": 2, "stroke-dasharray": "4 3" });
    this.ghost = { c, r, el: g };
  }
  // "Confirm taps": never (the default since the user's "get rid of the double tap to confirm stone": one tap plays at
  // any spacing) or auto (as above; the story menu's "Confirm taps" turns it back on)
  static confirmMode() { try { return localStorage.getItem("goban-confirm") === "auto" ? "auto" : "never"; } catch { return "never"; } }
  static setConfirmMode(m) { try { localStorage.setItem("goban-confirm", m); } catch {} }
  clearGhost() { if (this.ghost) { this.ghost.el.remove(); this.ghost = null; } }

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
    this.flawed = null;  // why a solve wasn't flawless (wrong move, hint, undo, explore)
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
    if (this.p.sz) return null;   // a smaller board: KataGo plays 19x19 only
    if (this.frameStones === undefined) {
      const utils = globalThis.GTEngineUtils;
      this.frameStones = utils
        ? utils.buildTsumegoFrame(gridToBoardState(this.freshGrid()), { komi: 6.5, blackToPlay: true, koAllowed: true, margin: 4 })
        : null;
    }
    return this.frameStones;
  }

  freshGrid() {
    const S = this.p.sz || N, g = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r < S && c < S ? EMPTY : WALL));
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
    this.variation = 1;       // which of White's defences is being played
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
    if (this.p.only && !this.p.only.includes(mv)) return;   // a multiple-choice board (Misaeng's record boards): only its lettered points

    const treeMove = this.p.lines.some(L =>
      this.played.length < L.length - 1 &&
      this.played.every((m, i) => m === L[i + 1]) &&
      L[this.played.length + 1] === mv);

    // an illegal move isn't played at all, on the answer tree or off it, and costs nothing: suicide, or retaking a
    // ko at once (apo110: the puzzles let an illegal ko retake through, then called it wrong)
    const legal = applyMove(this.grid, c, r, BLACK);
    if (!legal) return;
    if (this.koViolation(legal)) return this.setStatus("off", "◌", this.els.noEngine ? "劫：不能马上提回 Ko: you can't retake yet" : "Ko: you can't retake yet");

    if (!treeMove && (this.els.noEngine || this.els.strict || this.p.sz)) {   // (KataGo plays 19x19 only)
      // Strict problems (the Three Kingdoms campaign, the Stream): a move off the answer
      // tree is simply wrong; there is no engine play to fall back on.
      const g2 = legal;
      this.push();
      this.grid = g2;
      this.played = [...this.played, mv];
      this.lastMove = [c, r];
      this.posHistory.push(this.serialize(this.grid));
      this.flawed = this.flawed || "a move off the solution";
      return this.finish("bad");
    }
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
    this.grid = legal;
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
      const score = winText(analysis.rootWinRate);
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
    this.flawed = this.flawed || "claimed";
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
        this.done = "next"; // locks the board until the rewind
        this.variation = (this.variation || 1) + 1;
        this.setStatus("ok", "✓", `Variation ${this.variation}`);
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
    if (kind === "bad") this.flawed = this.flawed || "a wrong move";  // a reset doesn't wipe it
    markResult(this.book.id, this.p.id, kind === "ok");
    const zh = this.els.noEngine;  // the Three Kingdoms campaign leads with Chinese
    this.setStatus(kind, kind === "ok" ? "✓" : "✗", kind === "ok" ? (zh ? "正确 Correct" : "Correct") : (zh ? "错误 Wrong" : "Wrong"));
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
    if (!this.explore) this.flawed = this.flawed || "used undo";
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
    this.flawed = this.flawed || "used a hint";
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
    // With Sun Wukong around, he walks over and points at it with his staff;
    // the marker appears once he points (or after 10 s if he can't get there).
    if (window.Wukong && Wukong.active()) {
      let shown = false;
      const show = () => { if (!shown) { shown = true; this.goban.pulse(c, r); } };
      setTimeout(show, 11000);
      Wukong.pointAt(this.goban.svg, this.goban.px(c), this.goban.py(r), show);
    } else this.goban.pulse(c, r);
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
      this.flawed = this.flawed || "used explore";
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
      : this.done ? "—" : this.engineBusy ? "White thinking…" : this.els.noEngine ? "黑先 Black to play" : "Black to play";
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
      tip.textContent = n.move ? `${n.ply}. ${coordLabel(n.move, this.p.sz)}${n.ok ? "" : " (fails)"}${note ? " — " + note : ""}` : "Start";
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
    this.losses = new Array(this.game.n);   // win rate (percentage points) lost by move k, from a search of the position before it
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
      losses: this.losses, lossUnit: "wr",
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
      if (Array.isArray(raw.analyses)) this.analyses = raw.analyses.map(a => a && a.v === 2 ? a : null);   // unsearched ones: again
      if (Array.isArray(raw.losses) && raw.lossUnit === "wr") this.losses = raw.losses;   // (points, from the old network: judged again)
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
      if (loss != null && loss >= 10) out.push({ k, loss });
    }
    out.sort((x, y) => y.loss - x.loss);
    return out.slice(0, 6).sort((x, y) => x.k - y.k);
  },

  // Win rate the mover gave up with move k (percentage points): the best move's minus the played move's, both
  // taken from one search of the position *before* the move. Comparing two moves' after-positions this way cancels
  // the side-to-move effect that makes comparing consecutive positions reward whoever just moved (the network can't
  // see a tactic until it's played). (Win rate, not points: the network has no score head.) Win rates are Black's.
  async movePointsLost(k) {
    const g = this.game, m = g.moves[k];
    if (m.pass) return 0;
    const sign = m.color === BLACK ? 1 : -1;
    const a = await this.searchAt(k);
    const best = (a.moves || [])[0];
    if (!best) return 0;
    const played = a.moves.find(c => c.x === m.c && c.y === m.r);
    const mine = w => 100 * (sign > 0 ? w : 1 - w);
    if (played) return Math.max(0, mine(best.winRate) - mine(played.winRate));
    // Not among the searched candidates: the search of the position it leads to instead.
    const child = await this.searchAt(k + 1);
    return Math.max(0, mine(best.winRate) - mine(child.rootWinRate));
  },

  // a search of position k (100 visits), kept for this session: its win rate is the chart's (the user: "winrate
  // swings in favor of whoever just moved": the network's look at a position without a search leans to the side to
  // play, ~10 points either way); movePointsLost reads its moves
  async searchAt(k) {
    const g = this.game;
    if (!this.searches || this.searches.game !== g) this.searches = { game: g, at: [] };
    if (this.searches.at[k]) return this.searches.at[k];
    const hist = [];
    for (let j = Math.max(0, k - 6); j < k; j++) {
      const q = g.moves[j];
      if (!q.pass) hist.push({ x: q.c, y: q.r, player: q.color === BLACK ? "black" : "white" });
    }
    const a = await this.enqueue(() => Engine.analyze({
      board: gridToBoardState(g.grids[k]), currentPlayer: this.toMoveAt(k) === BLACK ? "black" : "white", moveHistory: hist,
      komi: g.meta.engineKomi, visits: 100, ownershipMode: "none", topK: 10, analysisPvLen: 1, reuseTree: false,
    }));
    this.searches.at[k] = a;
    return a;
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
          const a = await this.searchAt(k);
          if (this.runId !== run) break;
          this.analyses[k] = { w: a.rootWinRate, v: 2 };   // v 2: searched (before: the network's unsearched look)
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
        visits: 75, ownershipMode: "root",
      }));
      this.ownership = null;   // (the network has no ownership head: Judge gives the win rate)
      if (this.node.main !== undefined) {
        const k = this.node.main, g = this.game;
        this.analyses[k] = { w: a.rootWinRate, v: 2 };
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
      evalTxt = `  ·  ${winText(a.rootWinRate ?? a.w)}`;
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
    return { W: 560, H: 150, L: 44, R: 10, T: 10, B: 22, M: 50 };   // Black's win rate, as -50..50 around even
  },
  chartV(a) { return (a.w - 0.5) * 100; },
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
    for (const [s, label] of [[geo.M, "B 100%"], [0, "50%"], [-geo.M, "W 100%"]])
      el("text", { x: geo.L - 6, y: this.chartY(s, geo) + 3.5, "text-anchor": "end",
                   "font-size": 10, fill: "#8a8578" }).textContent = label;
    el("text", { x: geo.L, y: geo.H - 6, "font-size": 10, fill: "#8a8578" }).textContent = "move";

    // two-tone advantage fields: white's field on top, black's area below the curve
    const pts = [];
    for (let k = 0; k <= this.game.n; k++)
      if (this.analyses[k]) pts.push([this.chartX(k, geo), this.chartY(this.chartV(this.analyses[k]), geo), k]);
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
      el("circle", { cx: this.chartX(m.k + 1, geo), cy: this.chartY(this.chartV(a), geo), r: 4.5,
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
        (a ? ` — ${winText(a.w)}` : "");
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
        h("span", { class: "loss" + (m.loss < 20 ? " minor" : "") }, `−${Math.round(m.loss)}%`),
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

// game records (data/games, tools/build_games.py): [id, title, native, games, line]
const GAME_SHELVES = [["go-seigen", "Go Seigen", "吴清源", 883, "his games, 1926–1992"],
                      ["huang-longshi", "Huang Longshi", "黄龙士", 121, "his games, the Qing dynasty's 17th century"],
                      ["takemiya", "Takemiya Masaki", "武宫正树", 1740, "his games, 1965–2026"],
                      ["dosaku", "Honinbo Dosaku", "本因坊道策", 163, "his games, 1660–1697"],
                      ["doteki", "Honinbo Doteki", "本因坊道的", 12, "his games, 1682–1690"]];

async function viewLibrary() {
  const nav = routeSeq;
  crumbs.textContent = "";
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const index = await getIndex();
  if (nav !== routeSeq) return; // navigated elsewhere while loading
  const prog = loadProgress();
  const favs = loadFavorites();
  root.innerHTML = "";
  root.append(h("div", { class: "tavern-hero" }, [h("div", {}, [h("b", {}, "棋馆"), h("span", {}, "The Go Tavern")]),
    h("small", {}, "Pull up a stool. Pick a book, or a story.")]));   // shown only in the Tavern look
  const cats = { tsumego: "Tsumego", tesuji: "Tesuji", endgame: "Endgame" };
  // The Three Kingdoms campaign sits above everything.
  const tkDone = Object.values(prog.tk || {}).filter(v => v === 1).length;
  root.append(h("a", { class: "tk-card", href: "#/tk" }, [
    h("img", { class: "tk-card-icon", src: "assets/tk/fan.png", alt: "" }),
    h("span", {}, [h("b", {}, "三国演义 · Romance of the Three Kingdoms"),
      h("small", {}, tkDone ? `${tkDone} levels cleared` : "A story campaign through the novel, 12K to 7D")]),
    h("span", { class: "tk-card-go" }, "→"),
  ]));
  // Other novels' books (tk.js TK_NOVELS), each its own card; one not live yet shows in test mode only
  for (const [id, nv] of Object.entries(typeof TK_NOVELS !== "undefined" ? TK_NOVELS : {})) {
    if (!nv.live && !(typeof TK_TEST !== "undefined" && TK_TEST)) continue;
    root.append(h("a", { class: "tk-card tk-card-" + id, href: `#/tk/${nv.first}` }, [
      ...(nv.icon ? [h("img", { class: "tk-card-icon", src: nv.icon, alt: "" })] : []),
      h("span", {}, [h("b", {}, `${nv.native} · ${nv.title}`), h("small", {}, nv.live ? "A story campaign through the novel" : "测试模式 Test mode only")]),
      h("span", { class: "tk-card-go" }, "→"),
    ]));
  }
  // game records (data/games, tools/build_games.py): a shelf of their own; a game opens in the Review tab
  const gameShelf = h("div", { class: "book-list" });
  for (const [id, title, native, count, years] of GAME_SHELVES)
    gameShelf.append(h("div", { class: "book book-games", onclick: () => location.hash = `#/games/${id}` }, [
      h("div", { class: "t" }, title), h("div", { class: "n" }, `${native} · ${years}`),
      h("div", { class: "row" }, [h("span", { class: "badge dan" }, "pro"), h("span", { class: "cnt" }, `${count} games`)]),
    ]));
  // Favorited books from every category come first; they stay in their category too.
  const sections = [["Favorites", index.filter(b => favs.has(b.id))],
                    ...Object.entries(cats).map(([cat, title]) => [title, index.filter(b => b.category === cat)])];
  for (const [title, books] of sections) {
    if (!books.length) continue;
    root.append(h("div", { class: "cat-title" }, title));
    const list = h("div", { class: "book-list" });
    // the Stream heads the Tsumego shelf: a book with no end, dealt by the story mode's own rating (viewStream)
    if (title === "Tsumego") list.append(h("div", { class: "book book-stream", onclick: () => location.hash = "#/stream" }, [
      h("div", { class: "t" }, "Stream"),
      h("div", { class: "n" }, "练习 · problems at your level, one after another"),
      h("div", { class: "row" }, [h("span", { class: "badge" }, "15k–3d"), h("span", { class: "cnt" }, "∞")]),
    ]));
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
  root.append(h("div", { class: "cat-title" }, "Game records"), gameShelf);
}

// A shelf of game records (data/games/<id>.json): the games by date, a search, and each opens in the Review tab
// (replay, the move list, KataGo) as a pasted SGF would.
async function viewGames(id) {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const d = await (await fetch(`data/games/${id}.json`)).json();
  if (nav !== routeSeq) return;
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), ` / ${d.title}`);
  root.innerHTML = "";
  const err = h("div", { class: "err" });
  const open = async g => {
    try {
      const text = await (await fetch(`data/games/${id}/${encodeURIComponent(g[0])}`)).text();
      Review.load(text);
      Review.currentId = Review.newId();
      Review.saveState();
      location.hash = "#/review";
    } catch (e) { err.textContent = `Couldn't open that game: ${e.message}`; }
  };
  const side = (name, rank) => name + (rank ? ` ${rank}` : "");
  const list = h("div", { class: "games-list" });
  const show = q => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);   // every word must match: "Kitani 1939"
    list.innerHTML = "";
    const rows = d.games.filter(g => { const t = [g[1], g[2], g[4], g[6], g[7]].join(" ").toLowerCase(); return words.every(w => t.includes(w)); });
    for (const g of rows.slice(0, 400))
      list.append(h("div", { class: "games-row", onclick: () => open(g) }, [
        h("span", { class: "games-date" }, g[1]),
        h("span", { class: "games-players" }, [h("b", {}, "● "), side(g[2], g[3]), "  vs  ", h("b", { class: "w" }, "○ "), side(g[4], g[5])]),
        h("span", { class: "games-result" }, g[6]),
        h("span", { class: "games-event" }, g[7]),
      ]));
    count.textContent = rows.length > 400 ? `${rows.length} games (the first 400 shown: search to narrow)` : `${rows.length} games`;
  };
  const count = h("div", { class: "meta-sub" });
  const search = h("input", { type: "search", class: "games-search", placeholder: "Search: an opponent, a year, an event…" });
  search.addEventListener("input", () => show(search.value));
  root.append(h("div", { class: "games-head" }, [h("h2", {}, `${d.title} ${d.native}`), search, count, err]), list);
  show("");
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
    h("div", { class: "panel keys" },
      [["←/→", "prev / next"], ["U", "undo"], ["R", "reset"], ["H", "hint"], ["E", "explore"]]
        .map(([k, v]) => h("div", {}, [h("b", {}, k), v]))),
  ]);

  const player = h("div", { class: "player" });
  player.append(boardCard, aside);
  root.append(player);

  trainer = new Trainer(book, idx, { svg, boardCard, status, turnBadge, btnExplore, treePanel, treeBox, note });
  btnExplore.addEventListener("click", () => trainer.toggleExplore());
  window.__trainer = trainer;
  window.__engine = Engine;
}

/* ---- Stream: problems dealt one after another by the game's rating (tk.js TKElo, the same rating and the
   same seen list as the campaign's adaptive boards; data/stream.json, tools/build_stream.py) ---- */
let streamPool = null;
async function viewStream() {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  if (!streamPool) streamPool = { rated: await (await fetch("data/stream.json?v=1")).json() };
  const [bookId, pid] = TKElo.pick(streamPool, `stream~${TKElo.state().stream || 0}`);
  const book = await getBook(bookId);
  if (nav !== routeSeq) return;
  const idx = Math.max(0, book.problems.findIndex(x => String(x.id) === String(pid)));
  const p = book.problems[idx], x = streamPool.rated.find(y => y[0] === bookId && String(y[1]) === String(pid));
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / Stream");
  root.innerHTML = "";

  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" }, [svg]);
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
  // the high roller (the user): this problem's stakes ×5, chosen with the button that dealt it; kept with the
  // progress so a reload can't shed it
  const st0 = TKElo.state(), mult = st0.streamX && st0.streamX.n === (st0.stream || 0) ? st0.streamX.x : 1;
  const rating = h("div", { class: "stream-rating" }), stakes = (st0.streamRated !== `${bookId}:${pid}` && TKElo.stakesEl(streamPool, [bookId, pid], false, true, mult)) || "";
  const showRating = () => { const t = TKElo.state(); rating.textContent = `${TKElo.label(t.r)} · ${t.r}`; };
  showRating();
  // the problem's source and grade wait until it's answered, so they don't hint at it
  const source = h("div", { class: "meta-sub", style: "visibility:hidden" }, [
    p.url ? h("a", { href: p.url, target: "_blank" }, p.credit || "source")
          : h("a", { href: `https://www.101weiqi.com/q/${p.id}/`, target: "_blank" }, `${book.title} · 101weiqi #${p.id}`),
    x ? ` · ${GRADE_NAMES[x[2]]}` : "", x && x[4] ? " · KataGo-checked" : "",
  ]);
  const next = (x = 1) => { const q = loadProgress(), st = TKElo.state(q); st.stream = (st.stream || 0) + 1;
    st.streamX = x > 1 ? { n: st.stream, x } : null; TK.saveProg(q); viewStream(); };

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [
      h("h2", {}, "Stream"),
      rating, h("div", {}, [stakes]), source,
      h("div", { class: "badges" }, [turnBadge]),
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
        h("button", { class: "primary", onclick: () => next() }, "Next problem →"),
        h("button", { class: "high-roller", title: "The next problem counts five times over: five times the gain if you solve it first try, five times the loss if not",
                      onclick: () => next(5) }, "High roller ×5 →"),
      ]),
    ]),
    h("div", { class: "panel keys" },
      [["N / →", "next problem"], ["U", "undo"], ["R", "reset"], ["H", "hint"], ["E", "explore"]]
        .map(([k, v]) => h("div", {}, [h("b", {}, k), v]))),
  ]);
  root.append(h("div", { class: "player" }, [boardCard, aside]));

  // strict, as the story mode's boards: a move off the answer key is a miss (else KataGo took over and it was never rated)
  const t = trainer = new Trainer(book, idx, { svg, boardCard, status, turnBadge, btnExplore, treePanel, treeBox, note, strict: true });
  btnExplore.addEventListener("click", () => trainer.toggleExplore());
  t.streamNext = next;
  window.__trainer = trainer;
  // the first answer rates it (a problem shown again after a reload has had its say already)
  const key = `${bookId}:${pid}`;
  const onResult = e => {
    if (trainer !== t) return window.removeEventListener("tczw:result", onResult);
    window.removeEventListener("tczw:result", onResult);
    source.style.visibility = "";
    const q = loadProgress(), st = TKElo.state(q);
    if (st.streamRated === key) return;
    st.streamRated = key; TK.saveProg(q);
    if (t.flawed !== "claimed") { const d = TKElo.result(streamPool, {}, [bookId, pid], e.detail === "ok" && !t.flawed, mult); if (stakes) stakes.settle(d); }
    showRating();
  };
  window.addEventListener("tczw:result", onResult);
}
const GRADE_NAMES = Array.from({ length: 44 }, (_, i) => i < 30 ? `${15 - Math.floor(i / 2)}K${i % 2 ? "+" : ""}` : `${1 + Math.floor((i - 30) / 2)}D${(i - 30) % 2 ? "+" : ""}`);

/* ---- Spotify: a small player in the header ---- */
// PKCE login (public client, no secret) and the Web API's playback control:
// the music plays in the Spotify app on a phone or computer (Premium), and
// the ♪ button opens a widget to search, pick and control what plays.
const Music = {
  CLIENT_ID: "45e01bcb404941c1ab00da020e741a46",
  SCOPES: "user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative streaming user-read-email user-read-private",
  AUTH_KEY: "gt-spotify-auth", FLOW_KEY: "gt-spotify-flow",
  message: "", listeners: new Set(), now: null,

  load(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  store(key, v) { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(v)); } catch {} },
  loggedIn() { return !!this.load(this.AUTH_KEY); },
  redirectUri() { return OGSPlay.redirectUri(); },
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
    setTimeout(() => this.startWebPlayer(), 0);
    return flow.back || "#/";
  },
  async tokenRequest(fields) {
    const { scope, ...form } = fields;
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(form),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw new Error(`Spotify login failed (${d.error_description || d.error || r.status})`);
    return { access: d.access_token, refresh: d.refresh_token || fields.refresh_token, expires: Date.now() + (d.expires_in || 3600) * 1000,
             scope: d.scope || fields.scope || "" };
  },
  async token() {
    const a = this.load(this.AUTH_KEY);
    if (!a) throw new Error("Spotify isn't connected");
    if (Date.now() < a.expires - 60000) return a.access;
    try {
      const t = await this.tokenRequest({ grant_type: "refresh_token", refresh_token: a.refresh, client_id: this.CLIENT_ID, scope: a.scope });
      this.store(this.AUTH_KEY, t);
      return t.access;
    } catch (e) { this.logout(); throw e; }
  },
  logout() { this.store(this.AUTH_KEY, null); this.now = null; this.emit(); },
  async api(method, path, body) {
    const r = await fetch("https://api.spotify.com/v1" + path, {
      method, headers: { Authorization: `Bearer ${await this.token()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 401) { this.logout(); throw new Error("Spotify login expired — connect again."); }
    if (r.status === 204 || r.status === 202) return null;
    const d = await r.json().catch(() => null);
    if (!r.ok) { const e = new Error((d && d.error && d.error.message) || `Spotify returned ${r.status}`); e.status = r.status; throw e; }
    return d;
  },
  // Music plays only in this browser, through Spotify's Web Playback SDK
  // (Premium, and a login that granted "streaming").
  hasStreaming() { const a = this.load(this.AUTH_KEY); return !!(a && /\bstreaming\b/.test(a.scope || "")); },
  startWebPlayer() {
    if (this.player || this.sdkLoading || !this.loggedIn() || !this.hasStreaming()) return;
    this.sdkLoading = true;
    this.webState = "connecting";
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Tian Cai Zhi Wang", volume: this.load("gt-spotify-volume") ?? 0.7,
        getOAuthToken: cb => this.token().then(cb).catch(() => {}),
      });
      player.addListener("ready", ({ device_id }) => { this.webDevice = device_id; this.webState = "ready"; this.emit(); });
      player.addListener("not_ready", () => { this.webDevice = null; this.webState = "connecting"; this.emit(); });
      player.addListener("player_state_changed", st => {
        if (!st) return;
        const t = st.track_window && st.track_window.current_track;
        this.now = t ? { name: t.name, by: (t.artists || []).map(a => a.name).join(", "),
                         art: ((t.album && t.album.images) || []).slice(-1)[0]?.url, playing: !st.paused } : null;
        this.emit();
      });
      const fail = msg => { this.webState = "failed"; this.say(msg); };
      player.addListener("initialization_error", () => fail(/Android|iPhone|Mobile/i.test(navigator.userAgent)
        ? "Spotify doesn't support playing inside phone browsers. Try it on a computer." : "This browser can't play Spotify (it needs DRM/Widevine enabled)."));
      player.addListener("authentication_error", () => fail("Spotify needs you to reconnect."));
      player.addListener("account_error", () => fail("Playing in the browser needs Spotify Premium."));
      player.connect();
      this.player = player;
      setTimeout(() => { if (this.webState === "connecting") fail("Couldn't start the Spotify player in this browser."); }, 15000);
    };
    const sc = document.createElement("script");
    sc.src = "https://sdk.scdn.co/spotify-player.js";
    document.head.append(sc);
  },
  // Every command goes to this browser's player.
  async command(method, path, body) {
    if (!this.hasStreaming()) throw new Error("Tap Reconnect below so music can play in this browser.");
    if (!this.webDevice) throw new Error(this.webState === "failed" ? this.message || "This browser can't play Spotify." : "Still connecting this browser to Spotify — try again in a moment.");
    if (this.player && this.player.activateElement) await this.player.activateElement().catch?.(() => {});
    await this.api(method, path + (path.includes("?") ? "&" : "?") + `device_id=${encodeURIComponent(this.webDevice)}`, body);
    this.message = "";
    setTimeout(() => this.refresh(), 600);
  },
  playItem(it) {
    return it.type === "track" ? this.command("PUT", "/me/player/play", { uris: [it.uri] })
                               : this.command("PUT", "/me/player/play", { context_uri: it.uri });
  },
  async refresh() {
    if (this.player) {
      const st = await this.player.getCurrentState().catch(() => null);
      if (st) {
        const t = st.track_window && st.track_window.current_track;
        this.now = t ? { name: t.name, by: (t.artists || []).map(a => a.name).join(", "),
                         art: ((t.album && t.album.images) || []).slice(-1)[0]?.url, playing: !st.paused } : null;
      }
    }
    this.emit();
  },
  item(x, type) {
    const imgs = x.images || (x.album && x.album.images) || [];
    const sub = type === "track" ? (x.artists || []).map(a => a.name).join(", ")
              : type === "album" ? (x.artists || []).map(a => a.name).join(", ")
              : type === "playlist" ? `by ${x.owner && x.owner.display_name || "Spotify"}` : "Artist";
    return { type, uri: x.uri, name: x.name, sub, art: (imgs.slice(-1)[0] || {}).url };
  },
  async search(q) {
    const r = await this.api("GET", `/search?q=${encodeURIComponent(q)}&type=track,playlist,album,artist&limit=5`);
    const pick = (key, type) => ((r && r[key] && r[key].items) || []).filter(Boolean).map(x => this.item(x, type));
    return [["Songs", pick("tracks", "track")], ["Playlists", pick("playlists", "playlist")],
            ["Albums", pick("albums", "album")], ["Artists", pick("artists", "artist")]];
  },
  async myPlaylists() {
    const r = await this.api("GET", "/me/playlists?limit=30");
    return [["Your playlists", ((r && r.items) || []).filter(Boolean).map(x => this.item(x, "playlist"))]];
  },

  // The widget: a ♪ button in the header and a panel under it.
  mount() {
    const header = document.querySelector("header");
    if (!header || this.btn) return;
    this.btn = h("button", { class: "music-toggle", title: "Music", "aria-label": "Music" }, "♪");
    this.box = h("div", { class: "music-widget", hidden: "" });
    this.btn.addEventListener("click", () => this.toggle());
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !this.box.hidden) this.toggle(false); });
    document.addEventListener("click", e => {
      if (!this.box.hidden && !this.box.contains(e.target) && e.target !== this.btn) this.toggle(false);
    });
    header.append(this.btn);
    document.body.append(this.box);
    this.onChange(() => this.draw());
    this.startWebPlayer();
  },
  toggle(open = this.box.hidden) {
    this.box.hidden = !open;
    if (open) this.box.style.top = Math.round(this.btn.getBoundingClientRect().bottom + 8) + "px";
    clearInterval(this.poll);
    if (open) {
      this.draw(true);
      if (this.loggedIn()) { this.startWebPlayer(); this.refresh(); this.poll = setInterval(() => this.refresh(), 3000); }
    }
  },
  draw(fresh) {
    if (!this.box || this.box.hidden) return;
    if (!this.loggedIn()) {
      this.box.innerHTML = "";
      this.box.append(h("div", { class: "mw-title" }, "Music"),
        h("div", { class: "mw-sub" }, "Control Spotify from here (Premium). Music plays in the Spotify app on your phone or computer."),
        h("button", { class: "mw-connect", onclick: () => this.login().catch(e => this.say(e.message)) }, "Connect Spotify"));
      if (this.message) this.box.append(h("div", { class: "mw-msg" }, this.message));
      return;
    }
    if (fresh || !this.box.querySelector(".mw-search")) {
      this.box.innerHTML = "";
      const now = h("div", { class: "mw-now" });
      const input = h("input", { class: "mw-search", type: "search", placeholder: "Search songs, playlists, albums, artists" });
      const results = h("div", { class: "mw-results" });
      const msg = h("div", { class: "mw-msg" });
      this.box.append(now, input, results, msg,
        h("button", { class: "mw-logout", onclick: () => this.logout() }, "Disconnect Spotify"));
      let timer = 0, seq = 0;
      const show = async () => {
        const q = input.value.trim(), my = ++seq;
        try {
          const groups = q ? await this.search(q) : await this.myPlaylists();
          if (my !== seq) return;
          results.innerHTML = "";
          for (const [title, items] of groups) {
            if (!items.length) continue;
            results.append(h("div", { class: "mw-group" }, title));
            for (const it of items) results.append(h("button", { class: "mw-item", onclick: () => this.playItem(it).catch(e => this.say(e.message)) }, [
              it.art ? h("img", { src: it.art, alt: "" }) : h("span", { class: "mw-noart" }, "♪"),
              h("span", { class: "mw-text" }, [h("b", {}, it.name), h("small", {}, it.sub)]),
            ]));
          }
          if (!results.children.length) results.append(h("div", { class: "mw-sub" }, q ? "No results." : "No playlists yet — search above."));
        } catch (e) { this.say(e.message); }
      };
      input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(show, 300); });
      show();
      setTimeout(() => input.focus(), 0);
    }
    const now = this.box.querySelector(".mw-now");
    now.innerHTML = "";
    const n = this.now;
    const ctl = (label, title, fn) => h("button", { class: "mw-ctl", title, onclick: () => fn().catch(e => this.say(e.message)) }, label);
    now.append(
      n && n.art ? h("img", { src: n.art, alt: "" }) : h("span", { class: "mw-noart" }, "♪"),
      h("span", { class: "mw-text" }, n ? [h("b", {}, n.name), h("small", {}, n.by)] : [h("b", {}, "Nothing playing"), h("small", {}, "Pick something below")]),
      h("span", { class: "mw-ctls" }, [
        ctl("⏮", "Previous", () => this.command("POST", "/me/player/previous")),
        n && n.playing ? ctl("⏸", "Pause", () => this.command("PUT", "/me/player/pause"))
                       : ctl("▶", "Play", () => this.command("PUT", "/me/player/play")),
        ctl("⏭", "Next", () => this.command("POST", "/me/player/next")),
      ]));
    let dev = this.box.querySelector(".mw-devices");
    if (!dev) { dev = h("div", { class: "mw-devices" }); now.after(dev); }
    dev.innerHTML = "";
    if (!this.hasStreaming()) {
      dev.append(h("span", {}, "Music plays right here in the browser."),
                 h("button", { class: "mw-logout", onclick: () => this.login() }, "Reconnect Spotify to enable it"));
    } else if (this.webState === "ready") {
      const vol = h("input", { type: "range", min: "0", max: "1", step: "0.05", class: "mw-volume", "aria-label": "Volume" });
      vol.value = this.load("gt-spotify-volume") ?? 0.7;
      vol.addEventListener("input", () => { this.store("gt-spotify-volume", +vol.value); this.player && this.player.setVolume(+vol.value); });
      dev.append(vol);
    } else if (this.webState !== "failed") {
      dev.append(h("span", {}, "Connecting this browser to Spotify…"));
    }
    this.box.querySelector(".mw-msg").textContent = this.message || "";
  },
};
Music.mount();

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

/* ---- explore a board: set up stones, play out lines, then send to Review ---- */
// The user: "in addition to record game add a board explore with board editing". Unlike the Recorder (a game as
// played), this is a scratch board: setup stones go anywhere with no captures, moves follow the rules, and every
// action is undoable. Kept as a draft per device, like the Recorder's.

const Explorer = {
  KEY: "goban.exploreDraft",
  d: null, // { acts: [{set:color|0,c,r} | {color,c,r} | {color,pass}], redo: [...], next, tool: "play"|"black"|"white"|"erase" }

  load() {
    try { this.d = JSON.parse(localStorage.getItem(this.KEY)); } catch { this.d = null; }
    if (!this.d || !Array.isArray(this.d.acts)) this.d = { acts: [], redo: [], next: BLACK, tool: "play" };
    if (!Array.isArray(this.d.redo)) this.d.redo = [];
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch {} },
  clear() { this.d = { acts: [], redo: [], next: BLACK, tool: this.d ? this.d.tool : "play" }; this.save(); },

  // Replays the actions; returns { grid, last, keys } (keys = positions after each move, for ko).
  replay() {
    let g = Array.from({ length: N }, () => new Array(N).fill(EMPTY)), last = null;
    const keys = [g.flat().join("")];
    for (const a of this.d.acts) {
      if ("set" in a) { g = g.map(row => row.slice()); g[a.r][a.c] = a.set; last = null; keys.push(g.flat().join("")); continue; }
      last = null;
      if (!a.pass) { g = applyMove(g, a.c, a.r, a.color) || g; last = [a.c, a.r]; }
      keys.push(g.flat().join(""));
    }
    return { grid: g, last, keys };
  },
  push(a) { this.d.acts.push(a); this.d.redo = []; this.save(); },

  // a tap with the current tool; false when nothing changes
  tap(c, r) {
    const { grid, keys } = this.replay(), t = this.d.tool;
    if (t === "erase") { if (grid[r][c] === EMPTY) return false; this.push({ set: EMPTY, c, r }); return true; }
    if (t === "black" || t === "white") {
      const col = t === "black" ? BLACK : WHITE;
      this.push({ set: grid[r][c] === col ? EMPTY : col, c, r });   // tapping your own color again takes it off
      return true;
    }
    if (grid[r][c] !== EMPTY) return false;
    const g2 = applyMove(grid, c, r, this.d.next);
    if (!g2 || keys[keys.length - 2] === g2.flat().join("")) return false; // suicide / simple ko
    this.push({ color: this.d.next, c, r });
    this.d.next = 3 - this.d.next; this.save();
    return true;
  },
  pass() { this.push({ color: this.d.next, pass: true }); this.d.next = 3 - this.d.next; this.save(); },
  undo() {
    const a = this.d.acts.pop(); if (!a) return;
    this.d.redo.push(a);
    if (!("set" in a)) this.d.next = a.color;
    this.save();
  },
  redo() {
    const a = this.d.redo.pop(); if (!a) return;
    this.d.acts.push(a);
    if (!("set" in a)) this.d.next = 3 - a.color;
    this.save();
  },

  // Setup stones before the first move become AB/AW and the moves follow. If stones were edited after a move,
  // the line can't be told as one game, so it sends the position as it stands with the side to move.
  toSgf() {
    const pt = (c, r) => String.fromCharCode(97 + c) + String.fromCharCode(97 + r);
    const first = this.d.acts.findIndex(a => !("set" in a));
    const editsAfter = first >= 0 && this.d.acts.slice(first).some(a => "set" in a);
    let setupGrid, moves;
    if (editsAfter || first < 0) {
      setupGrid = this.replay().grid; moves = [];
    } else {
      const keep = this.d.acts; this.d.acts = keep.slice(0, first);
      setupGrid = this.replay().grid; this.d.acts = keep;
      moves = keep.slice(first);
    }
    const ab = [], aw = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
      if (setupGrid[r][c] === BLACK) ab.push(pt(c, r)); else if (setupGrid[r][c] === WHITE) aw.push(pt(c, r));
    const toPlay = moves.length ? moves[0].color : this.d.next;
    let head = `;GM[1]FF[4]SZ[19]KM[6.5]DT[${new Date().toISOString().slice(0, 10)}]GN[Explored position]`;
    if (ab.length) head += "AB" + ab.map(p => `[${p}]`).join("");
    if (aw.length) head += "AW" + aw.map(p => `[${p}]`).join("");
    head += `PL[${toPlay === BLACK ? "B" : "W"}]`;
    return `(${head}${moves.map(m => `;${m.color === BLACK ? "B" : "W"}[${m.pass ? "" : pt(m.c, m.r)}]`).join("")})`;
  },
};

function viewExplore() {
  crumbs.innerHTML = "";
  root.innerHTML = "";
  if (!Explorer.d) Explorer.load();
  const d = Explorer.d;

  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);
  const goban = new Goban(svg, { c0: 0, c1: 18, r0: 0, r1: 18 }, (c, r) => { if (Explorer.tap(c, r)) refresh(); });
  const status = h("div", { class: "meta-sub" });
  const err = h("div", { class: "err" });
  const btnUndo = h("button", { onclick: () => { Explorer.undo(); refresh(); } }, "Undo");
  const btnRedo = h("button", { onclick: () => { Explorer.redo(); refresh(); } }, "Redo");
  const btnSend = h("button", { class: "primary" }, "Send to Review");

  const TOOLS = [["play", "Play"], ["black", "● Black"], ["white", "○ White"], ["erase", "Erase"]];
  const toolBtns = TOOLS.map(([id, label]) =>
    h("button", { onclick: () => { d.tool = id; Explorer.save(); refresh(); } }, label));

  function refresh() {
    const { grid, last } = Explorer.replay();
    goban.hoverColor = d.tool === "black" ? BLACK : d.tool === "white" ? WHITE : d.next;
    goban.render(grid, last, true);
    const moves = d.acts.filter(a => !("set" in a)).length;
    let stones = 0; for (const row of grid) for (const v of row) if (v !== EMPTY) stones++;
    const doing = { play: `${d.next === BLACK ? "Black" : "White"} to play`, black: "Placing black stones",
                    white: "Placing white stones", erase: "Tap a stone to remove it" }[d.tool];
    status.textContent = `${stones} stones · ${moves} moves · ${doing}`;
    TOOLS.forEach(([id], i) => toolBtns[i].classList.toggle("primary", d.tool === id));
    btnUndo.disabled = !d.acts.length;
    btnRedo.disabled = !d.redo.length;
    btnSend.disabled = !stones && !moves;
    err.textContent = "";
  }

  btnSend.addEventListener("click", () => {
    try {
      Review.load(Explorer.toSgf());
      Review.currentId = Review.newId();
      Review.saveState();
      viewReview();
    } catch (e) { err.textContent = e.message; }
  });

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [
      h("h2", {}, "Explore a board"),
      h("div", { class: "meta-sub" }, "Set up any position with the stone tools, then switch to Play to try out lines. Setup stones don't capture; played moves do. Send to Review for the engine's view."),
      status,
    ]),
    h("div", { class: "panel" }, [h("div", { class: "rv-actions" }, toolBtns)]),
    h("div", { class: "panel" }, [
      h("div", { class: "rv-actions" }, [
        btnUndo, btnRedo,
        h("button", { onclick: () => { Explorer.pass(); refresh(); } }, "Pass"),
        h("button", { onclick: () => { d.next = 3 - d.next; Explorer.save(); refresh(); } }, "Swap color"),
      ]),
    ]),
    h("div", { class: "panel" }, [
      h("div", { class: "rv-actions" }, [
        btnSend,
        h("button", { onclick: () => {
          if (d.acts.length && !confirm("Clear the board?")) return;
          Explorer.clear(); viewExplore();
        } }, "Clear board"),
        h("button", { onclick: () => viewReview() }, "Back"),
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
        h("button", { onclick: () => viewExplore() }, "Explore a board"),
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
  TIME_LABEL: "19×19 · 20 min + 5×30 s byoyomi",

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

  // back: where to land after OGS sends the browser home (default: the Play tab)
  async login(back) {
    const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const verifier = b64(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = b64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    const state = b64(crypto.getRandomValues(new Uint8Array(12)));
    localStorage.setItem(this.FLOW_KEY, JSON.stringify({ verifier, state, server: this.serverKey(), redirect: this.redirectUri(), back: back || "" }));
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
    return flow.back || "";
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

  // opts: { size: 9 } for a 9×9 game; { inWorld: true } keeps a match from leaving the page it was found on
  findGame(opts = {}) {
    this.search = { uuid: crypto.randomUUID(), since: Date.now(), ...opts };
    this.sendSearch();
    this.emit();
  },
  sendSearch() {
    if (!this.search) return;
    if (this.search.size === 9) {   // the go table in the campaign: OGS's 9×9 rapid automatch, ranked
      this.sock.send("automatch/find_match", {
        uuid: this.search.uuid,
        size_speed_options: [{ size: "9x9", speed: "rapid", system: "byoyomi" }],
        lower_rank_diff: 3, upper_rank_diff: 3,
        rules: { condition: "preferred", value: "japanese" },
        handicap: { condition: "preferred", value: "disabled" },
      });
      return;
    }
    // OGS's 19×19 "live" automatch: 20 min + 5×30 s byoyomi (the user: 20 minutes, not 5; OGS's speeds are fixed
    // presets, online-go.com src/views/Play/SPEED_OPTIONS.ts: rapid is 5 min + 5×30 s, live 20 min + 5×30 s)
    this.sock.send("automatch/find_match", {
      uuid: this.search.uuid,
      size_speed_options: [{ size: "19x19", speed: "live", system: "byoyomi" }],
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
      const inWorld = this.search.inWorld;
      this.search = null;
      this.openGame(d.game_id);
      if (!inWorld) location.hash = `#/play/${d.game_id}`;
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
    wrap.append(...(gameId ? [] : [friendLobby()]), ...playBody(gameId));
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

// Korean byoyomi, read aloud on your turn (the user: "the korean byoyomi count with a voice ... they count up,
// reference fox"): the timekeeper's call, "열" at 10 seconds used and "스물" at 20, then the last ten counted up,
// 하나 … 아홉, one a second; "네 번 남았습니다" as a period goes, "마지막 초읽기입니다" for the last. The voice is the
// browser's own Korean one (speechSynthesis: every phone has one; no files: Fox's and OGS's recordings are their own).
const ByoVoice = {
  KEY: "gt-byo-voice",
  get on() { try { return localStorage.getItem(this.KEY) !== "off"; } catch { return true; } },
  set on(v) { try { localStorage.setItem(this.KEY, v ? "on" : "off"); } catch {} },
  COUNT: ["하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉"],
  LEFT: ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"],
  say(text) {
    if (!this.on || typeof speechSynthesis === "undefined") return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 1.15;
    const v = speechSynthesis.getVoices().find(x => /^ko/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.cancel();   // a count is only worth hearing on time
    speechSynthesis.speak(u);
  },
  // called a few times a second from the game's ticker: what to say now, once
  tick(g) {
    const st = g.byoVoice || (g.byoVoice = { periods: null, said: "" });
    const t = g.phase === "play" && g.myColor ? g.timeLeft(g.myColor) : null;
    if (!t || !t.byo) { st.periods = null; st.said = ""; return; }
    if (st.periods !== null && t.periods < st.periods)   // a period gone
      this.say(t.periods === 1 ? "마지막 초읽기입니다" : `${this.LEFT[t.periods] || t.periods} 번 남았습니다`);
    else if (st.periods === null && g.myTurn)            // into byoyomi
      this.say(t.periods === 1 ? "마지막 초읽기입니다" : `초읽기 ${this.LEFT[t.periods] || t.periods} 번`);
    st.periods = t.periods;
    if (!g.myTurn) { st.said = ""; return; }
    const c = g.clock || {}, mine = g.myColor === BLACK ? c.black_time : c.white_time;
    const len = (mine && mine.period_time) || 30, used = len - t.period, left = Math.ceil(t.period);
    let key = "", text = "";
    if (left <= 9 && left >= 1) { key = "c" + left; text = this.COUNT[9 - left]; }
    else if (used >= 20 && len >= 30 && left >= 10) { key = "20"; text = "스물"; }   // (a 30 s period: 스물 at 10 left, then 하나)
    else if (used >= 10 && len >= 20 && left >= 10) { key = "10"; text = "열"; }
    if (key && key !== st.said) { st.said = key; this.say(text); }
  },
};

// g: an OGS LiveGame, or a friend's game (FriendGame); P: what plays its moves (OGSPlay, or the FriendPlay link)
function playGame(g, P = OGSPlay) {
  const sz = g.size || 19;
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" }, [svg]);
  const { grid, last } = g.replay();
  const removed = g.removed;
  const scoring = g.phase === "stone removal";

  const goban = new Goban(svg, { c0: 0, c1: sz - 1, r0: 0, r1: sz - 1, sz }, (c, r) => {
    if (scoring) {
      if (grid[r][c] === EMPTY || grid[r][c] === WALL) return;
      const pts = [...groupAndLiberties(grid, c, r).stones].map(k => [(k - k % N) / N, k % N]);
      P.setRemoved(pts, !removed.has(r * N + c));
    } else if (g.myTurn && grid[r][c] === EMPTY && applyMove(grid, c, r, g.myColor)) {
      // (on a phone with tiny points the board itself asks for a second tap: Goban.tap; a confirm here as well made
      // it four taps a move)
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
    goban.el("circle", { class: "bt-wood", cx: x, cy: y, r: goban.cell * .47, fill: BoardTheme.current.wood[1], opacity: .55, "pointer-events": "none" });
    goban.el("path", { d: `M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}`,
                       stroke: "var(--danger)", "stroke-width": 3, "pointer-events": "none" });
  }

  // your turn in byoyomi, the period's last 10 seconds: they count down on the opponent's last stone (as OGS does)
  const countdown = last && g.phase === "play" && g.myColor
    ? goban.el("text", { x: goban.px(last[0]), y: goban.py(last[1]) + goban.cell * .17, "text-anchor": "middle",
                         "font-size": goban.cell * .5, "font-weight": 700, "pointer-events": "none", class: "pl-countdown",
                         fill: grid[last[1]][last[0]] === BLACK ? "#fff" : "#111" }) : null;
  const showCountdown = () => {
    if (!countdown) return;
    const t = g.myTurn && g.timeLeft(g.myColor), n = t && t.byo && t.periods && t.period <= 10 ? Math.ceil(t.period) : 0;
    countdown.textContent = n ? String(n) : "";
    countdown.parentNode.classList.toggle("pl-counting", !!n);
  };
  showCountdown();
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
    showCountdown();
    ByoVoice.tick(g);
  }, 250);

  const status = h("div", { class: "meta-sub" },
    g.phase === "loading" ? "Loading game…"
    : g.phase === "finished" ? g.resultText()
    : scoring ? (g.scoreText ? g.scoreText() + " " : "") + "Game over by passes — tap groups to mark them dead, then accept the score."
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
  } else if (g.phase === "finished") {
    buttons.push(h("button", { class: "primary", onclick: () => P.review ? P.review(g, err) : reviewOgsGame(g.id, err) }, "Review this game"));
    buttons.push(h("button", { onclick: () => { P.game = null; location.hash = "#/play"; } }, "Back to lobby"));
    if (P.finishedButtons) buttons.unshift(...P.finishedButtons(g));
  }

  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [h("h2", {}, g.title || `OGS game ${g.id}`), ...rows, status, err, g.extra ? g.extra() : "",
      g.myColor ? h("label", { class: "byo-voice" }, [h("input", { type: "checkbox", ...(ByoVoice.on ? { checked: "" } : {}),
        onchange: e => { ByoVoice.on = e.target.checked; if (e.target.checked) ByoVoice.say("초읽기"); } }), " 초읽기 Korean byoyomi voice"]) : ""]),
    buttons.length ? h("div", { class: "panel" }, [h("div", { class: "rv-actions" }, buttons)]) : "",
  ]);
  return [h("div", { class: "review" }, [boardCard, aside])];
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

/* ================= play a friend (no login): two browsers, joined by a link ================= */

// The user: "host a game on the website without having to log in" (OGS has no guest play: an account is needed to
// sit at a board there). The host's page opens a game under a short code; the link #/friend/<code> joins it. The two
// browsers talk directly (WebRTC, PeerJS: its free public server only introduces them), each keeping the whole game;
// every change goes across as the whole state with a count (seq), the higher count winning (the host's on a tie).
// Chinese rules (area), komi 7.5; two passes in a row end it: mark the dead, both accept the same marks.
const FRIEND_TIMES = {
  "20m": { main: 1200, periods: 5, period: 30, label: "20 min + 5×30 s byoyomi" },
  "10m": { main: 600, periods: 3, period: 30, label: "10 min + 3×30 s byoyomi" },
  "3m": { main: 180, periods: 3, period: 20, label: "3 min + 3×20 s byoyomi" },
  "none": null,
};

class FriendGame {
  constructor(S, me) { this.S = S; this.me = me; this.turnAt = Date.now(); this.error = ""; this.pending = null; }
  get size() { return this.S.size; }
  get phase() { return this.S.phase; }
  get myColor() { return this.me.color || 0; }
  get title() { return `Friendly game · ${this.S.code}`; }
  get data() { return { komi: this.S.komi }; }
  get clock() { const t = this.S.time; return t ? { black_time: { period_time: t.period }, white_time: { period_time: t.period } } : {}; }
  player(color) { return { username: this.S.names[color] || (color === this.S.hostColor ? "Host" : "Friend") }; }
  toMove() { return this.S.moves.length % 2 === 0 ? BLACK : WHITE; }
  get myTurn() { return this.phase === "play" && this.myColor && this.toMove() === this.myColor; }
  get removed() { return new Set(this.S.removed); }
  get removedStr() { return this.S.removed.map(k => sgfPt(k % N, (k - k % N) / N)).join(""); }
  blank() {
    const sz = this.S.size;
    return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r < sz && c < sz ? EMPTY : WALL));
  }
  replay() {
    let g = this.blank(), last = null;
    for (let i = 0; i < this.S.moves.length; i++) {
      const [c, r] = this.S.moves[i];
      last = null;
      if (c < 0) continue;
      g = applyMove(g, c, r, i % 2 ? WHITE : BLACK) || g;
      last = [c, r];
    }
    return { grid: g, last };
  }
  // a move's legality: an empty point, not suicide, not retaking a ko at once (the position before the last move)
  legal(c, r) {
    if (c < 0) return true;
    const { grid } = this.replay();
    if (c >= this.S.size || r >= this.S.size || grid[r][c] !== EMPTY) return false;
    const g2 = applyMove(grid, c, r, this.toMove());
    if (!g2) return false;
    const prev = this.S.moves.length ? this.replayTo(this.S.moves.length - 1) : null;
    return !prev || JSON.stringify(prev) !== JSON.stringify(g2);
  }
  replayTo(n) { const keep = this.S.moves; this.S.moves = keep.slice(0, n); const g = this.replay().grid; this.S.moves = keep; return g; }

  // time left for color now, as LiveGame.timeLeft gives it ({ main, periods, period, byo }): Japanese byoyomi
  timeLeft(color) {
    const T = this.S.time;
    if (!T) return null;
    const t = this.S.clocks[color], running = this.phase === "play" && this.toMove() === color;
    const main = t.main - (running ? (Date.now() - this.turnAt) / 1000 : 0);
    if (main > 0) return { main, periods: t.periods, period: T.period, byo: false };
    const over = -main, used = Math.floor(over / T.period), periods = Math.max(0, t.periods - used);
    return { main: 0, periods, period: periods ? T.period - (over - used * T.period) : 0, byo: true };
  }
  outOfTime(color) { const t = this.timeLeft(color); return !!t && t.byo && !t.periods; }

  // area: stones on the board (the marked dead lifted) and the empty points only one color reaches
  score() {
    const sz = this.S.size, g = this.replay().grid, dead = this.removed;
    for (const k of dead) g[(k - k % N) / N][k % N] = EMPTY;
    const pts = { [BLACK]: 0, [WHITE]: 0 }, seen = new Set();
    for (let r = 0; r < sz; r++) for (let c = 0; c < sz; c++) {
      if (g[r][c] !== EMPTY) { pts[g[r][c]]++; continue; }
      if (seen.has(r * N + c)) continue;
      const stack = [[c, r]], touch = new Set();
      let n = 0;
      seen.add(r * N + c);
      while (stack.length) {
        const [x, y] = stack.pop(); n++;
        for (const [nx, ny] of neighbors(x, y)) {
          const v = g[ny][nx];
          if (v === EMPTY && !seen.has(ny * N + nx)) { seen.add(ny * N + nx); stack.push([nx, ny]); }
          else if (v === BLACK || v === WHITE) touch.add(v);
        }
      }
      if (touch.size === 1) pts[[...touch][0]] += n;
    }
    const b = pts[BLACK], w = pts[WHITE] + this.S.komi, d = b - w;
    return { b, w, winner: d > 0 ? BLACK : WHITE, text: `${d > 0 ? "B" : "W"}+${Math.abs(d)}` };
  }
  scoreText() { const s = this.score(); return `Black ${s.b}, White ${s.w - this.S.komi} + ${this.S.komi} komi: ${s.text}.`; }
  resultText() {
    const R = this.S.result, ask = this.S.rematch || {};
    if (!R) return "";
    const note = this.S.next ? " · Rematch: starting…" : this.myColor && ask[3 - this.myColor] && !ask[this.myColor] ? " · Your friend wants a rematch." : "";
    return this.outcome(R) + note;
  }
  outcome(R) {
    const who = R.winner === BLACK ? "Black" : "White", mine = this.myColor && R.winner === this.myColor;
    return R.how === "score" ? `${mine ? "You won" : this.myColor ? "You lost" : `${who} won`}: ${R.text}`
      : `${mine ? "You won" : this.myColor ? "You lost" : `${who} won`} by ${R.how}`;
  }
  sgf() {
    const S = this.S, names = c => (this.player(c).username || "").replace(/[\]\\]/g, "");
    const re = S.result ? (S.result.how === "score" ? S.result.text : `${S.result.winner === BLACK ? "B" : "W"}+${S.result.how === "time" ? "T" : "R"}`) : "";
    const mv = S.moves.map(([c, r], i) => `;${i % 2 ? "W" : "B"}[${c < 0 ? "" : sgfPt(c, r)}]`).join("");
    return `(;GM[1]FF[4]CA[UTF-8]SZ[${S.size}]KM[${S.komi}]RU[Chinese]PB[${names(BLACK)}]PW[${names(WHITE)}]RE[${re}]DT[${new Date(S.created).toISOString().slice(0, 10)}]${mv})`;
  }
}

// A link between two pages, for friend games and the Open games list. Straight between the browsers (WebRTC) when the
// networks allow; when that hasn't opened in 8 s, by way of the PeerJS server instead (the user: "stuck on
// connecting": two phones on mobile data can't reach each other directly, and the relay servers PeerJS names,
// eu-0/us-0.turn.peerjs.com, are gone). The server passes on candidate messages to a page by its name, which is how
// the browsers meet anyway; a game's messages are as small. A relayed link pings, and closes after 45 s of silence.
class WireLink {
  constructor(peer, dst) { this.peer = peer; this.dst = dst; this.open = false; this.h = {}; this.seen = Date.now(); }
  on(e, f) { (this.h[e] || (this.h[e] = [])).push(f); return this; }
  fire(e, x) { for (const f of this.h[e] || []) try { f(x); } catch (err) { console.error("[wire]", err); } }
  // shaped as a connection candidate (PeerJS's public server drops a page that sends anything else), ours riding along
  raw(m) {
    try { this.peer.socket.send({ type: "CANDIDATE", dst: this.dst, payload: { ...Wire.SHAPE, tczw: m } }); } catch {}
  }
  send(d) { if (this.relay) this.raw({ k: "d", d }); else if (this.c && this.c.open) this.c.send(d); }
  opened() {
    if (this.open || this.shut) return;
    this.open = true;
    if (this.relay) this.ping = setInterval(() => {
      if (Date.now() - this.seen > 45000) return this.end();
      this.raw({ k: "ping" });
    }, 15000);
    this.fire("open");
  }
  end() { if (this.shut) return; this.shut = true; this.open = false; clearInterval(this.ping); clearInterval(this.hi); clearTimeout(this.wait); Wire.links(this.peer).delete(this.dst); this.fire("close"); }
  close() { if (this.relay) this.raw({ k: "bye" }); else if (this.c) try { this.c.close(); } catch {} this.end(); }
  direct(c) {
    this.c = c;
    c.on("open", () => { if (!this.relay) this.opened(); });
    c.on("data", d => { if (!this.relay) this.fire("data", d); });
    c.on("close", () => { if (!this.relay) this.end(); });
  }
  toRelay() {   // the dialer's way round: say hello until the other page answers
    if (this.relay || this.shut) return;
    this.relay = true;
    if (this.c) try { this.c.close(); } catch {}
    const old = Wire.links(this.peer).get(this.dst);
    if (old && old !== this) old.end();
    Wire.links(this.peer).set(this.dst, this);
    this.raw({ k: "hi" });
    this.hi = setInterval(() => { if (this.open) clearInterval(this.hi); else this.raw({ k: "hi" }); }, 3000);
  }
}
const Wire = {
  WAIT: 8000,
  SHAPE: { type: "data", connectionId: "tczw", candidate: { candidate: "candidate:0 1 udp 1 0.0.0.0 9 typ host", sdpMid: "0", sdpMLineIndex: 0 } },
  links(peer) { return peer._tczwLinks || (peer._tczwLinks = new Map()); },
  hook(peer) {
    if (peer._tczwHooked) return;
    peer._tczwHooked = true;
    peer.socket.on("message", m => {
      const t = m && m.type === "CANDIDATE" && m.payload && m.payload.tczw;
      if (!t || !m.src) return;
      setTimeout(() => { if (peer._lostMessages) peer._lostMessages.delete("tczw"); }, 0);   // (PeerJS keeps it for a connection that never comes)
      let l = this.links(peer).get(m.src);
      if (!l && t.k === "hi" && peer._tczwListen) {   // a page reaching us the long way round
        l = new WireLink(peer, m.src); l.relay = true;
        this.links(peer).set(m.src, l);
        peer._tczwListen(l);
      }
      if (!l) return;
      l.seen = Date.now();
      if (t.k === "hi") { l.raw({ k: "ack" }); setTimeout(() => l.opened(), 0); }
      else if (t.k === "ack") l.opened();
      else if (t.k === "bye") l.end();
      else if (t.k === "d") { l.opened(); l.fire("data", t.d); }
    });
  },
  dial(peer, dst) {
    this.hook(peer);
    const l = new WireLink(peer, dst);
    if (window.FRIEND_FORCE_RELAY) { setTimeout(() => l.toRelay(), 0); return l; }   // (a test's way to try it)
    l.direct(peer.connect(dst, { reliable: true }));
    l.wait = setTimeout(() => { if (!l.open) l.toRelay(); }, this.WAIT);
    return l;
  },
  listen(peer, onLink) {
    this.hook(peer);
    peer._tczwListen = onLink;
    peer.on("connection", c => { const l = new WireLink(peer, c.peer); l.direct(c); onLink(l); });
  },
};

const FriendPlay = {
  PREFIX: "tczw-", KEY: "gt-friend-",
  game: null, peer: null, conn: null, watchers: new Set(), listeners: new Set(), status: "", retry: null,
  // loaded only when a friend's game opens
  lib() {
    if (window.Peer) return Promise.resolve();
    return this._lib || (this._lib = new Promise((ok, no) => {
      const sc = document.createElement("script");
      sc.src = "peerjs/peerjs-1.5.4.min.js"; sc.onload = ok; sc.onerror = () => { this._lib = null; no(new Error("Couldn't load the connection library.")); };
      document.head.append(sc);
    }));
  },
  opts() { return window.FRIEND_PEER_OPTS || {}; },   // (a test points this at its own PeerJS server)
  saved(code) { try { return JSON.parse(localStorage.getItem(this.KEY + code)); } catch { return null; } },
  list() {
    const out = [];
    try { for (const k of Object.keys(localStorage)) if (k.startsWith(this.KEY)) { const v = this.saved(k.slice(this.KEY.length)); if (v && v.S) out.push(v); } } catch {}
    return out.sort((a, b) => b.S.created - a.S.created);
  },
  // a waiting game of ours, listed: in the lobby's open games until someone sits down (or it's cancelled)
  advertise() {
    const g = this.game;
    if (!g || g.me.role !== "host") return;
    const S = g.S;
    if (S.phase === "waiting" && S.listed !== false)
      FriendLobby.offer({ code: S.code, size: S.size, time: S.time ? S.time.label : "no clock", name: S.names[S.hostColor] || "",
                          hostColor: S.hostColor, at: S.created });
    else FriendLobby.withdraw(S.code);
  },
  persist() {
    const g = this.game;
    if (!g) return;
    this.advertise();
    try {
      localStorage.setItem(this.KEY + g.S.code, JSON.stringify({ S: g.S, me: g.me, elapsed: (Date.now() - g.turnAt) / 1000 }));
      // finished games go after a week; at most the last ten kept
      const all = this.list();
      for (const v of all.slice(10)) localStorage.removeItem(this.KEY + v.S.code);
      for (const v of all) if (v.S.phase === "finished" && Date.now() - v.S.created > 7 * 864e5) localStorage.removeItem(this.KEY + v.S.code);
    } catch {}
  },
  emit() { for (const f of this.listeners) f(); },
  link(code) { return `${location.origin}${location.pathname}#/friend/${code}`; },

  host({ size, time, color, name, listed = true }) {
    const hostColor = color === "black" ? BLACK : color === "white" ? WHITE : (Math.random() < .5 ? BLACK : WHITE);
    this.start(this.fresh({ size, T: FRIEND_TIMES[time] || null, hostColor, names: { [hostColor]: name || "" }, listed }));
  },
  fresh({ size, T, hostColor, names, listed, guest = null }) {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");
    return {
      v: 1, code, size, komi: 7.5, time: T && { main: T.main, periods: T.periods, period: T.period, label: T.label },
      hostColor, names, moves: [], removed: [], accepted: {},
      clocks: T ? { [BLACK]: { main: T.main, periods: T.periods }, [WHITE]: { main: T.main, periods: T.periods } } : {},
      phase: "waiting", result: null, seq: 0, created: Date.now(), guest, listed,
    };
  },
  start(S) {
    this.close();
    this.game = new FriendGame(S, { role: "host", color: S.hostColor, token: null });
    this.persist();
    location.hash = `#/friend/${S.code}`;
  },
  // a rematch (the user): asked by one, accepted by the other; the host then opens the next game, same board and
  // clock, colors swapped, its seat kept for the same friend, and both pages go to it (the code rides in the state)
  rematch() { const c = this.game.myColor; this.change(S => { S.rematch = { ...(S.rematch || {}), [c]: true }; }); },
  nextGame() {
    const g = this.game, S = g.S;
    if (g.me.role !== "host" || S.phase !== "finished" || S.next || !(S.rematch && S.rematch[BLACK] && S.rematch[WHITE])) return;
    const N2 = this.fresh({ size: S.size, T: S.time, hostColor: 3 - S.hostColor, names: { [BLACK]: S.names[WHITE], [WHITE]: S.names[BLACK] },
                            listed: false, guest: S.guest });
    try { localStorage.setItem(this.KEY + N2.code, JSON.stringify({ S: N2, me: { role: "host", color: N2.hostColor, token: null }, elapsed: 0 })); } catch {}
    this.change(s => { s.next = N2.code; });
    setTimeout(() => { if (this.game === g) location.hash = `#/friend/${N2.code}`; }, 400);   // the word gone across first
  },
  finishedButtons(g) {
    if (!g.myColor || g.S.next) return [];
    const R = g.S.rematch || {}, mine = R[g.myColor], theirs = R[3 - g.myColor];
    const b = h("button", { class: theirs ? "primary rematch" : "rematch", onclick: () => this.rematch() },
                mine ? "Rematch asked…" : theirs ? "Accept rematch" : "Rematch");
    b.disabled = !!mine;
    return [b];
  },

  // open the game under this code: ours (the host's, or one we joined), or join it
  open(code) {
    if (this.game && this.game.S.code === code && (this.peer && !this.peer.destroyed)) return;
    this.close();
    const v = this.saved(code);
    if (v) { this.game = new FriendGame(v.S, v.me); this.game.turnAt = Date.now() - (v.elapsed || 0) * 1000; this.advertise(); }
    else {
      let token = ""; try { token = localStorage.getItem("gt-friend-token") || ""; if (!token) localStorage.setItem("gt-friend-token", token = crypto.randomUUID()); } catch { token = crypto.randomUUID(); }
      this.game = new FriendGame({ code, phase: "joining", moves: [], removed: [], names: {}, clocks: {}, accepted: {}, seq: -1, size: 19, komi: 7.5 }, { role: "guest", color: 0, token });
    }
    this.status = "Connecting…";
    this.lib().then(() => this.game && this.game.S.code === code && this.connect()).catch(e => { this.status = e.message; this.emit(); });
  },
  connect() {
    const g = this.game, P = window.Peer;
    if (g.me.role === "host") {
      const peer = this.peer = new P(this.PREFIX + g.S.code, this.opts());
      peer.on("open", () => { this.status = g.S.phase === "waiting" ? "" : "Waiting for your friend to come back…"; this.emit(); });
      Wire.listen(peer, c => this.attach(c));
      peer.on("error", e => {
        // the code still held from a moment ago (a reload): try again shortly
        if (e.type === "unavailable-id") { this.status = "Reopening the game…"; this.emit(); this.again(); }
        else { this.status = `Connection trouble (${e.type || e.message}); retrying…`; this.emit(); if (peer.destroyed || peer.disconnected) this.again(); }
      });
      peer.on("disconnected", () => { if (!peer.destroyed) peer.reconnect(); });
    } else {
      const peer = this.peer = new P(undefined, this.opts());
      peer.on("open", () => this.dial());
      peer.on("error", e => {
        this.status = e.type === "peer-unavailable" ? "The host's page isn't open. Retrying…" : `Connection trouble (${e.type || e.message}); retrying…`;
        this.emit();
        clearTimeout(this.retry); this.retry = setTimeout(() => this.peer === peer && !peer.destroyed && this.dial(), 3000);
      });
      peer.on("disconnected", () => { if (!peer.destroyed) peer.reconnect(); });
    }
  },
  again() {
    clearTimeout(this.retry);
    const code = this.game && this.game.S.code;
    this.retry = setTimeout(() => { if (!this.game || this.game.S.code !== code) return; if (this.peer) this.peer.destroy(); this.connect(); }, 3000);
  },
  dial() {
    const g = this.game;
    if (!g || !this.peer || this.peer.destroyed) return;
    if (this.dialing && !this.dialing.open) this.dialing.close();   // an attempt still hanging: only the newest
    this.status = "Reaching the host…"; this.emit();
    this.attach(this.dialing = Wire.dial(this.peer, this.PREFIX + g.S.code));
  },
  // the host keeps every link open (a third browser on the link watches); this.conn is the friend's (the host's, for a guest)
  attach(c) {
    const g = this.game;
    c.on("open", () => {
      if (g.me.role === "host") this.watchers.add(c);
      else { if (this.conn && this.conn !== c) this.conn.close(); this.conn = c; }
      this.status = "";
      if (g.me.role === "guest") c.send({ t: "join", token: g.me.token, name: friendName() });
      this.emit();
    });
    c.on("data", d => this.receive(c, d));
    c.on("close", () => {
      this.watchers.delete(c);
      if (this.conn !== c) return;
      this.conn = null;
      if (!this.game || this.game !== g || g.S.phase === "finished") return this.emit();
      this.status = g.me.role === "host" ? "Your friend left. The game is kept: they come back by the same link." : "Lost the host. Reconnecting…";
      this.emit();
      if (g.me.role === "guest") { clearTimeout(this.retry); this.retry = setTimeout(() => this.dial(), 2000); }
    });
  },
  receive(c, d) {
    const g = this.game;
    if (!g || !d) return;
    if (d.t === "join" && g.me.role === "host") {
      const S = g.S, guestColor = 3 - S.hostColor;
      if (!S.guest || S.guest === d.token) {
        if (S.phase === "waiting") { S.guest = d.token; S.names[guestColor] = S.names[guestColor] || d.name || ""; S.phase = "play"; S.seq++; g.turnAt = Date.now(); }
        if (this.conn && this.conn !== c) this.conn.close();
        this.conn = c; this.status = "";
        c.send({ t: "seat", color: guestColor });
      }
      c.send(this.packet());
      this.persist(); this.emit();
    } else if (d.t === "seat" && g.me.role === "guest") { g.me.color = d.color; this.persist(); this.emit(); }
    else if (d.t === "state" && c === this.conn) this.take(d);
  },
  packet() { return { t: "state", S: this.game.S, elapsed: (Date.now() - this.game.turnAt) / 1000 }; },
  take(d) {
    const g = this.game, S2 = d.S;
    if (!S2 || S2.code !== g.S.code) return;
    if (!(S2.seq > g.S.seq || (S2.seq === g.S.seq && g.me.role === "guest"))) {   // ours is newer: send it back
      if (S2.seq < g.S.seq) this.send();
      return;
    }
    g.S = S2; g.turnAt = Date.now() - (d.elapsed || 0) * 1000; g.pending = null;
    this.persist(); this.emit();
    if (S2.next && g.me.role === "guest") { const code = S2.next; setTimeout(() => { if (this.game === g) location.hash = `#/friend/${code}`; }, 200); }
    this.nextGame();
  },
  send() {
    const p = this.packet();
    for (const c of new Set([this.conn, ...this.watchers])) if (c && c.open) c.send(p);
  },
  change(fn) {   // a change of ours: apply, count it, keep it, send it
    const g = this.game;
    fn(g.S); g.S.seq++;
    this.persist(); this.send(); this.emit();
    this.nextGame();
  },

  // what playGame calls (as OGSPlay)
  move(c, r) {
    const g = this.game;
    if (!g.myTurn || !g.legal(c, r)) { g.error = c >= 0 && g.myTurn ? "Not there (a ko must wait a move)." : ""; return this.emit(); }
    const t = g.timeLeft(g.myColor);
    if (t && t.byo && !t.periods) return this.lose(g.myColor, "time");
    g.error = "";
    this.change(S => {
      if (t) S.clocks[g.myColor] = t.byo ? { main: 0, periods: t.periods } : { main: t.main, periods: S.clocks[g.myColor].periods };
      S.moves.push([c, r]);
      const n = S.moves.length;
      if (n >= 2 && S.moves[n - 1][0] < 0 && S.moves[n - 2][0] < 0) { S.phase = "stone removal"; S.removed = []; S.accepted = {}; }
    });
    g.turnAt = Date.now();
  },
  lose(color, how) { this.change(S => { S.phase = "finished"; S.result = { winner: 3 - color, how }; }); },
  resign() { this.lose(this.game.myColor, "resignation"); },
  setRemoved(points, removed) {
    this.change(S => {
      const set = new Set(S.removed);
      for (const [c, r] of points) removed ? set.add(r * N + c) : set.delete(r * N + c);
      S.removed = [...set].sort((a, b) => a - b); S.accepted = {};
    });
  },
  acceptScore() {
    const g = this.game, key = g.S.removed.join(",");
    this.change(S => {
      S.accepted[g.myColor] = key;
      if (S.accepted[BLACK] === key && S.accepted[WHITE] === key) {
        const sc = g.score();
        S.phase = "finished"; S.result = { winner: sc.winner, how: "score", text: sc.text };
      }
    });
  },
  resumePlay() { this.change(S => { S.phase = "play"; S.removed = []; S.accepted = {}; }); this.game.turnAt = Date.now(); },
  review(g, err) {
    try { Review.load(g.sgf()); Review.currentId = Review.newId(); Review.saveState(); location.hash = "#/review"; }
    catch (e) { err.textContent = e.message; }
  },
  // the ticker: a clock that has run out ends the game (the other side's, after a grace for the wire)
  tick() {
    const g = this.game;
    if (!g || g.phase !== "play" || !g.myColor) return;
    const tm = g.toMove(), t = g.timeLeft(tm);
    if (!t || !t.byo || t.periods) return;
    if (tm === g.myColor) this.lose(tm, "time");
    else if (Date.now() - g.turnAt > 1000 * (g.S.clocks[tm].main + g.S.clocks[tm].periods * g.S.time.period + 3)) this.lose(tm, "time");
  },
  close() {
    clearTimeout(this.retry);
    if (this.conn) try { this.conn.close(); } catch {}
    if (this.peer) try { this.peer.destroy(); } catch {}
    this.conn = this.peer = null; this.watchers.clear(); this.game = null; this.status = "";
  },
};
// leaving the page: let the other side know at once (and free the code for a reload)
addEventListener("pagehide", () => { for (const x of [FriendPlay.peer, FriendLobby.peer]) if (x) try { x.destroy(); } catch {} });
// a phone puts a page in the background (switching apps to send the link, the screen locking) and its links drop:
// coming back, pick them up at once rather than at the next retry
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const P = FriendPlay, L = FriendLobby;
  for (const x of [P.peer, L.peer]) if (x && x.disconnected && !x.destroyed) try { x.reconnect(); } catch {}
  if (P.game && P.peer && !P.peer.destroyed && P.game.me.role === "guest" && !(P.conn && P.conn.open)) P.dial();
  if (L.peer && !L.hub && !(L.up && L.up.open) && !L.timer) L.again(200);
});
// back from the browser's page cache (Back after leaving): the links were closed on the way out, so start afresh
addEventListener("pageshow", e => { if (e.persisted && (FriendPlay.peer || FriendLobby.peer)) location.reload(); });


// Open games for anyone on the Play tab, no link needed (the user: "show the host to everyone"). There's no server of
// ours to keep a list, and PeerJS's public one won't list its peers, so the browsers keep it: the first page to claim
// the lobby's name holds the list, every other page links to it, hosts post their waiting games there; when the holder
// leaves, the others race to claim the name again (and the hosts post again).
const FriendLobby = {
  ID: "tczw-lobby-v1", MAX_AGE: 3 * 3600e3,
  peer: null, hub: false, up: null, conns: new Set(), offers: new Map(), mine: new Map(), games: [], listeners: new Set(), timer: null,
  start() { if (!this.peer && !this.timer) FriendPlay.lib().then(() => this.claim()).catch(() => {}); },
  emit() { for (const f of this.listeners) f(); },
  again(ms = 300 + Math.random() * 1500) {
    if (this.peer) try { this.peer.destroy(); } catch {}
    this.peer = null; this.hub = false; this.up = null; this.conns.clear(); this.offers.clear();
    clearTimeout(this.timer); this.timer = setTimeout(() => { this.timer = null; this.claim(); }, ms);
  },
  claim() {
    const p = this.peer = new window.Peer(this.ID, FriendPlay.opts());
    p.on("open", () => { this.hub = true; this.publish(); });
    Wire.listen(p, c => {
      this.conns.add(c);
      c.on("open", () => c.send(this.list()));
      c.on("data", d => this.hubReceive(c, d));
      c.on("close", () => { this.conns.delete(c); for (const [k, o] of this.offers) if (o.c === c) this.offers.delete(k); this.publish(); });
    });
    p.on("error", e => {
      if (this.peer !== p) return;
      if (e.type === "unavailable-id") { try { p.destroy(); } catch {} this.client(); }
      else if (!this.hub || p.destroyed) this.again(4000);
    });
    p.on("disconnected", () => { if (this.peer === p && !p.destroyed) p.reconnect(); });
  },
  client() {
    const p = this.peer = new window.Peer(undefined, FriendPlay.opts());
    p.on("open", () => {
      const c = Wire.dial(p, this.ID);
      c.on("open", () => { this.up = c; for (const g of this.mine.values()) c.send({ t: "offer", g }); });
      c.on("data", d => { if (d && d.t === "list") { this.games = d.games || []; this.emit(); } });
      c.on("close", () => { if (this.peer === p) this.again(); });
    });
    p.on("error", e => { if (this.peer === p && (e.type === "peer-unavailable" || p.destroyed)) this.again(); });
    p.on("disconnected", () => { if (this.peer === p && !p.destroyed) p.reconnect(); });
  },
  hubReceive(c, d) {
    if (!d) return;
    if (d.t === "offer" && d.g && /^[a-z0-9]{6}$/.test(d.g.code)) this.offers.set(d.g.code, { g: d.g, c });
    else if (d.t === "withdraw") { const o = this.offers.get(d.code); if (o && o.c === c) this.offers.delete(d.code); }
    else return;
    this.publish();
  },
  list() {
    const now = Date.now(), all = [...this.offers.values()].map(o => o.g).concat([...this.mine.values()]);
    return { t: "list", games: all.filter(g => now - (g.at || 0) < this.MAX_AGE).sort((a, b) => b.at - a.at).slice(0, 30) };
  },
  publish() {
    if (!this.hub) return;
    const L = this.list();
    this.games = L.games;
    for (const c of this.conns) if (c.open) c.send(L);
    this.emit();
  },
  offer(g) {
    if (this.mine.has(g.code)) return;
    this.mine.set(g.code, g);
    this.start();
    if (this.hub) this.publish(); else if (this.up && this.up.open) this.up.send({ t: "offer", g });
  },
  withdraw(code) {
    if (!this.mine.delete(code)) return;
    if (this.hub) this.publish(); else if (this.up && this.up.open) this.up.send({ t: "withdraw", code });
  },
};

function friendName() { try { return localStorage.getItem("gt-friend-name") || Sync.username || ""; } catch { return ""; } }

// the Play tab's first panel: host a game, or go back to one
function friendLobby() {
  const sel = (name, opts, val) => h("select", { class: "rec-field", name }, opts.map(([v, t]) => h("option", { value: v, ...(v === val ? { selected: "" } : {}) }, t)));
  const size = sel("size", [["19", "19×19"], ["13", "13×13"], ["9", "9×9"]], "19");
  const time = sel("time", [["20m", FRIEND_TIMES["20m"].label], ["10m", FRIEND_TIMES["10m"].label], ["3m", FRIEND_TIMES["3m"].label], ["none", "No clock"]], "20m");
  const color = sel("color", [["random", "Colors: random"], ["black", "I take Black"], ["white", "I take White"]], "random");
  const name = h("input", { class: "rec-field", placeholder: "Your name (optional)", value: friendName(), maxlength: "24" });
  const listed = h("input", { type: "checkbox", class: "friend-listed", checked: "" });
  const go = () => {
    try { localStorage.setItem("gt-friend-name", name.value.trim()); } catch {}
    FriendPlay.host({ size: +size.value, time: time.value, color: color.value, name: name.value.trim(), listed: listed.checked });
  };
  // the open games, kept current as the lobby's list changes
  const open = h("div", { class: "review-history friend-open", style: "margin:0" });
  const fill = () => {
    if (!open.isConnected && open.dataset.drawn) { FriendLobby.listeners.delete(fill); return; }
    open.dataset.drawn = "1";
    open.textContent = "";
    const mine = new Set(FriendPlay.list().map(v => v.S.code)), games = FriendLobby.games;
    if (!games.length) return open.append(h("div", { class: "meta-sub" }, FriendLobby.peer ? "No open games right now. Host one and it shows here for anyone on the Play tab." : "Looking for open games…"));
    for (const g of games) {
      const own = mine.has(g.code);
      const row = h("div", { class: "history-item friend-game" }, [h("div", { class: "hi-open" }, [
        h("div", { class: "t" }, `${own ? "Your game" : (g.name || "Someone")} · ${g.size}×${g.size}`),
        h("div", { class: "n" }, `${g.time} · ${own ? "waiting for someone to join" : `you'd play ${g.hostColor === BLACK ? "White" : "Black"}`}`),
      ])]);
      row.addEventListener("click", () => { location.hash = `#/friend/${g.code}`; });
      open.append(row);
    }
  };
  FriendLobby.listeners.add(fill);
  FriendLobby.start();
  fill();
  const mine = FriendPlay.list().filter(v => v.S.phase !== "finished").slice(0, 5).map(v => {
    const row = h("div", { class: "history-item" }, [h("div", { class: "hi-open" }, [
      h("div", { class: "t" }, `${v.S.phase === "waiting" ? "Waiting for a friend" : "Resume game"} · ${v.S.code}`),
      h("div", { class: "n" }, `${v.S.size}×${v.S.size} · ${v.S.moves.length} moves · ${v.me.role === "host" ? "you host" : "you joined"}`),
    ])]);
    row.addEventListener("click", () => { location.hash = `#/friend/${v.S.code}`; });
    return row;
  });
  return h("div", { class: "sgf-loader friend-lobby" }, [
    h("div", { class: "cat-title" }, "Play a friend"),
    h("div", {}, "No login: join an open game below, or host one. Anyone on this page sees it, or send the link. Chinese rules, komi 7.5."),
    h("div", { class: "meta-sub" }, "Open games"), open,
    h("div", { class: "row" }, [size, time, color]),
    h("div", { class: "row" }, [name, h("button", { class: "primary host-friend", onclick: go }, "Host a game")]),
    h("label", { class: "meta-sub" }, [listed, " Show it in Open games (otherwise only the link joins)"]),
    mine.length ? h("div", { class: "review-history", style: "margin:0" }, mine) : "",
  ]);
}

function viewFriend(code) {
  crumbs.textContent = "";
  root.textContent = "";
  const P = FriendPlay, wrap = h("div", { class: "play" });
  root.append(wrap);
  P.listeners.clear();
  const rerender = () => {
    if (!wrap.isConnected) { P.listeners.delete(rerender); return; }
    wrap.textContent = "";
    wrap.append(...friendBody());
  };
  P.listeners.add(rerender);
  P.open(code);
  rerender();
}

function friendBody() {
  const P = FriendPlay, g = P.game;
  if (!g) return [];
  const st = h("div", { class: "meta-sub friend-status" }, P.status);
  if (g.phase === "waiting" || g.phase === "joining") {
    clearInterval(playTicker);
    const url = P.link(g.S.code), field = h("input", { class: "rec-field friend-link", readonly: "", value: url });
    const copy = h("button", { class: "primary", onclick: async () => {
      try { await navigator.clipboard.writeText(url); copy.textContent = "Copied"; } catch { field.select(); }
    } }, "Copy link");
    const share = navigator.share ? h("button", { onclick: () => navigator.share({ title: "A game of Go", url }).catch(() => {}) }, "Share…") : "";
    return [h("div", { class: "sgf-loader" }, g.phase === "joining"
      ? [h("div", { class: "cat-title" }, "Joining a friend's game"), h("div", {}, `Game ${g.S.code}.`), st]
      : [h("div", { class: "cat-title" }, "Waiting for your friend"),
         h("div", {}, `${g.S.listed !== false ? "It's in Open games on the Play tab, or send" : "Send"} this link. Keep this page open: the game runs between your two browsers. ${g.S.size}×${g.S.size}, ${g.S.time ? g.S.time.label : "no clock"}, you play ${g.myColor === BLACK ? "Black" : "White"}.`),
         h("div", { class: "row" }, [field, copy, share]), st,
         h("div", { class: "row" }, [h("button", { onclick: () => { FriendLobby.withdraw(g.S.code); try { localStorage.removeItem(P.KEY + g.S.code); } catch {} P.close(); location.hash = "#/play"; } }, "Cancel")])])];
  }
  g.extra = () => P.status ? st : "";
  const out = playGame(g, P);
  const tick = playTicker;   // playGame's ticker, plus the clocks running out
  const t2 = setInterval(() => { if (playTicker !== tick || !document.body.contains(out[0])) return clearInterval(t2); P.tick(); }, 500);
  return out;
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
  const link = (href, text) => h("a", { href, target: "_blank" }, text);
  root.append(h("div", { class: "credits" }, [
    h("b", {}, "Credits"),
    h("p", {}, ["Michael Redmond's Life and Death problems are transcribed from his ", link("https://www.youtube.com/playlist?list=PLW5_cMTm0wvaAfrTyLtU_HDjeTlK4VFRj", "YouTube videos"), "; each problem links to its video."]),
    h("p", {}, ["Three Kingdoms art: trees and props from the ", link("https://willibab.itch.io/free-jade-tileset-pack", "Jade Tileset"), " by Willibab (CC-BY) and ",
      link("https://gametorch.app/collections/21", "GameTorch"), " (CC0); an alternative look for the explorable world from the ",
      link("https://pixel-boy.itch.io/ninja-adventure-asset-pack", "Ninja Adventure"), " pack by Pixel-boy and AAA (CC0); the world engine is ", link("https://phaser.io", "Phaser"), " (MIT); everything else is drawn in code."]),
    h("p", {}, ["Three Kingdoms music: ", link("https://bitemegames.itch.io/chinese-game-music", "Lotus Pond and Dragon Dance"), " by BiteMe Games (CC0); ",
      link("https://www.silvermansound.com/free-music/all-the-tea-in-china", "All The Tea In China"), " and ",
      link("https://www.silvermansound.com/free-music/imperial-china-cinematic", "Imperial China Cinematic"), " by Shane Ivers, silvermansound.com (CC BY 4.0); boss fights: ",
      link("https://opengameart.org/content/taiko-drums-seamless-loop", "Taiko drums"), " by jobro (CC BY 3.0), and a gong from ",
      link("https://opengameart.org/content/100-cc0-sfx", "100 CC0 SFX"), " by rubberduck (CC0). Horses: ",
      link("https://opengameart.org/content/lpc-horses", "[LPC] Horses"), " by bluecarrot16 (OGA-BY 3.0)."]),
  ]));
}

/* ================= the Tavern look (a pilot) ================= */
// The user: "pilot a whole site revamp ... like the Hearthstone experience; don't touch the story playthroughs".
// Opt-in from the header's chip, kept per device (a look, not progress); theme-tavern.css does the rest. Never on a
// story page (#/tk/...): those keep their own look.
const Theme = {
  KEY: "gt-theme",
  get on() { try { return localStorage.getItem(this.KEY) === "tavern"; } catch { return false; } },
  set on(v) { try { v ? localStorage.setItem(this.KEY, "tavern") : localStorage.removeItem(this.KEY); } catch {} },
  apply(story) {
    document.body.classList.toggle("theme-tavern", this.on && !story);
    const chip = document.getElementById("themeChip");
    if (chip) { chip.textContent = this.on ? "✦ Tavern: on" : "✦ Tavern"; chip.hidden = !!story; }
  },
};
document.addEventListener("DOMContentLoaded", () => {
  const chip = document.getElementById("themeChip");
  if (chip) chip.addEventListener("click", () => { Theme.on = !Theme.on; route(); });
});

/* ================= router & keys ================= */

// Bumped on every navigation so async views can tell they've gone stale.
let routeSeq = 0;

async function route() {
  routeSeq++;
  if (typeof TKEnglish !== "undefined") TKEnglish.set(false);   // an English-only book's page sets it again (tk-modern.js)
  if (typeof TKVoice !== "undefined") { TKVoice.enOnly = false; TKVoice.native = null; }
  if (trainer) trainer.alive = false;
  trainer = null;
  Review.els = null;
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  Theme.apply(parts[0] === "tk");
  // a story's opening scroll left open when you leave the story (the Library tab, Back) stayed over the page and
  // took its clicks: it goes with the story
  if (parts[0] !== "tk") for (const w of document.querySelectorAll("body > .tk-scroll-wrap")) w.remove();
  clearInterval(playTicker);
  const tab = ["review", "play", "feedback"].includes(parts[0]) ? parts[0] : parts[0] === "friend" ? "play" : "library";   // (the Stream is a card in the Library)
  if (window.Wukong && Wukong.suspend) Wukong.suspend(parts[0] === "tk" && !parts[2]);  // the map has its own party
  for (const a of document.querySelectorAll("#tabs a"))
    a.classList.toggle("active", a.dataset.tab === tab);
  if (parts[0] === "stream") await viewStream();
  else if (parts[0] === "review") viewReview();
  else if (parts[0] === "play") viewPlay(parts[1]);
  else if (parts[0] === "friend" && parts[1]) viewFriend(parts[1]);
  else if (parts[0] === "feedback") viewFeedback();
  else if (parts[0] === "tk" && parts[1] === "chat") await viewTKChat(true);   // the plain chat window (Claude himself now sits in the Chang'an teahouse)
  else if (parts[0] === "tk" && parts[1] && parts[2]) await viewTKLevel(parseInt(parts[1], 10), parts[2]);
  else if (parts[0] === "tk") await viewTK(parseInt(parts[1], 10) || 0);
  else if (parts[0] === "games" && parts[1]) await viewGames(parts[1]);
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
  if (parts[0] === "stream" && (e.key === "n" || e.key === "ArrowRight")) return trainer.streamNext && trainer.streamNext();
  const book = parts[0] === "book";  // campaign levels have no next or previous problem
  if (e.key === "ArrowLeft" && book && parts[2] > 1) location.hash = `#/book/${parts[1]}/${+parts[2] - 1}`;
  else if (e.key === "ArrowRight" && book) location.hash = `#/book/${parts[1]}/${+parts[2] + 1}`;
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

// Run fn once the campaign isn't in the middle of something (a scene's lines or camera, a board, a walk out, a
// scripted move), so a redraw from sync or a new build never cuts a scene off; idle for 2 s running.
function whenIdle(fn) {
  let calm = 0;
  const busy = () => { const w = window.__w;
    return !!(document.querySelector(".tk-duel") || (w && ((w.ui && w.ui.busy()) || w.cine || w.leaving || w.auto))); };
  const tick = () => { calm = busy() ? 0 : calm + 1; if (calm >= 4) fn(); else setTimeout(tick, 500); };
  tick();
}

// A device still running an older build (a cached index.html keeps loading the old scripts, whatever their keys):
// on load and on coming back to the tab, a fresh index.html is compared with the running one's file versions,
// and if they differ the cache is refreshed and the page reloaded, once per new build.
const Fresh = {
  vers: html => (html.match(/\.(?:js|css)\?v=\d+/g) || []).sort().join(" "),
  async check() {
    if (location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname)) return;   // tests, the app shell
    try {
      const url = location.pathname.replace(/[^/]*$/, "") + "index.html";
      const html = await (await fetch(url, { cache: "no-store" })).text(), now = this.vers(html);
      const running = this.vers([...document.querySelectorAll("script[src], link[rel=stylesheet]")].map(e => e.getAttribute("src") || e.getAttribute("href")).join(" "));
      if (!now || now === running) return;
      if (sessionStorage.getItem("gt-fresh") === now) return;   // reloaded for this build already: don't loop
      sessionStorage.setItem("gt-fresh", now);
      await fetch(url, { cache: "reload" });   // put the new page in the HTTP cache, then load it
      whenIdle(() => location.reload());
    } catch (e) { console.warn("[fresh]", e); }
  },
};
Fresh.check();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") Fresh.check(); });
// Back from OGS's login page with ?code=&state=: finish the login, then
// drop the query string and land on the Play tab.
const loginParams = new URLSearchParams(location.search);
if (loginParams.get("state") && (loginParams.get("code") || loginParams.get("error")) && Music.isReturn(loginParams)) {
  Music.finishLogin(loginParams)
    .then(back => history.replaceState(null, "", location.pathname + back))
    .catch(e => { Music.message = e.message; history.replaceState(null, "", location.pathname + "#/"); })
    .finally(route);
} else if (loginParams.get("state") && (loginParams.get("code") || loginParams.get("error"))) {
  let back = "";
  OGSPlay.finishLogin(loginParams)
    .then(b => { back = b; })
    .catch(e => { OGSPlay.loginError = e.message; })
    .finally(() => { history.replaceState(null, "", location.pathname + (back || "#/play")); route(); });
} else route();
