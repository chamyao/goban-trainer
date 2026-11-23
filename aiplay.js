/* ================= play KataGo (the user: "in play can you give the option to play vs ai") =================
   A game against the site's own KataGo (Engine, the network Review uses), in the browser, no login: 19×19 (the small
   network plays nonsense on 9×9 and 13×13: on an empty 9×9 it rates the 1-1 points best), Chinese rules, komi 7.5,
   no clock. It runs on the friend game's board and rules (FriendGame, playGame): two
   passes end it, you mark the dead stones and KataGo accepts your marks. Three strengths: Easy (about 10k), Medium
   (about 6k), Strong (about 1d): see aiShare. The game is kept in this browser
   (gt-ai-game), so a reload carries on. Loaded before app.js. */
// Strength (the user: "I want the strength to range between 10k and 1d"). A search, even 2 visits, plays dan level
// with this network; so each move it draws a share of the legal points at random and plays the one the network's
// policy likes most (KaTrain's "pick" bot). The shares were calibrated on 19x19 against KataGo's human-SL model at set
// ranks (b18c384nbt-humanv0, humanSLProfile rank_Xk/Xd; staircases of 12 games): 30-40% ~13k, 50% ~8-9k, 60% ~6k,
// 70% ~3k, 78% ~1-2k, 85% ~1d. aiShare(kyu) interpolates them (kyu: 10 = 10k, 0 = 1d).
const AI_SHARE_PTS = [[10, 0.47], [8.5, 0.5], [6, 0.6], [3, 0.7], [1.5, 0.78], [0, 0.85]];
function aiShare(kyu) {
  const P = AI_SHARE_PTS;
  if (kyu >= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (kyu >= P[i][0]) { const [k0, s0] = P[i - 1], [k1, s1] = P[i]; return s0 + (s1 - s0) * (k0 - kyu) / (k0 - k1); }
  return P[P.length - 1][1];
}
const aiRankText = kyu => kyu > 0 ? `${kyu}k` : `${1 - kyu}d`;
const AI_LEVELS = {
  easy: { name: "Easy", kyu: 10 },
  medium: { name: "Medium", kyu: 6 },
  strong: { name: "Strong", kyu: 0 },
  // the site's own network, trained on KGS dan and professional games (tools/ownnet; the user: "upload the latest one
  // to the site so I can try playing it"): its policy's favourite legal move, no search. Still training: the
  // weights are a checkpoint, its rank a measured estimate.
  // (unrated: the benchmark said ~9-10k, but a 10k beat it easily, killing a big group; apo110: "Ive played 8k
  // before, that does not happen". A rank once real games calibrate it)
  // step 80,000 (the finished run): apo110 (~10k): "Its stonger than me I think"; ~50% against GnuGo (OGS ~10k), ~5k
  // on the human-SL benchmark, which runs ~4 ranks generous. (Step 12,500 felt 13-14k.)
  ours: { name: "Our AI · experimental", kyu: 9, own: true },
};
// the opponents (the user: "just choose one per and we only need 7 opponents ... collected only"): seven avatars,
// each the site's own network fine-tuned on one professional's games (tools/ownnet: run 2, ~OGS 6.5k, + 1,500 steps
// on that player's moves). Difficulty comes from handicap stones. An avatar not collected shows as a silhouette.
const AI_PRO = { lvbu: "kato", daiyu: "takemiya", ms_ahn: "otake", ms_jang: "kitani", dongzhuo: "chochikun", diaochan: "sakata", caocao: "goseigen" };
const AI_PRO_RANK = "7k";   // their measured strength, about OGS 6.5-7k
const aiProUrl = who => `engine/ownnet/pro/${AI_PRO[who]}.bin?v=1`;
// the own network, in a worker per weights file (engine/ownnet-worker.js): the weights load on its first move
const OwnPlay = {
  url: "engine/ownnet/latest.bin?v=3", ws: new Map(), seq: 0, wait: new Map(),
  call(msg, url = this.url) {
    let w = this.ws.get(url);
    if (!w) {
      w = new Worker("engine/ownnet-worker.js?v=1"); this.ws.set(url, w);
      w.onmessage = e => { const f = this.wait.get(e.data.id); if (f) { this.wait.delete(e.data.id); e.data.error ? f.no(new Error(e.data.error)) : f.ok(e.data); } };
      const id = ++this.seq; this.wait.set(id, { ok: () => {}, no: () => {} });
      w.postMessage({ type: "load", url: new URL(url, location.href).href, id });   // (the page's address: a worker resolves its own relative to engine/)
    }
    const id = ++this.seq;
    return new Promise((ok, no) => { this.wait.set(id, { ok, no }); w.postMessage({ ...msg, id }); });
  },
  // the game -> {policy}: sz*sz points then pass, -1 on occupied points (as the engine's)
  async analyze(g, grid, me, url) {
    const sz = g.S.size, board = new Array(sz * sz);
    for (let r = 0; r < sz; r++) for (let c = 0; c < sz; c++) board[r * sz + c] = grid[r][c] === BLACK ? 1 : grid[r][c] === WHITE ? -1 : 0;
    const last = g.S.moves.slice(-4).reverse().map(([c, r]) => c >= 0 ? r * sz + c : 361);
    const a = await this.call({ type: "eval", board, black: me === BLACK, ko: -1, last, komi: g.S.komi }, url);
    return { policy: a.policy.map((p, i) => i < sz * sz && board[i] ? -1 : p) };
  },
};

// the avatars as opponents (apo110: "play against the avatars themselves... at least 10k... vary their play styles by
// character"). KataGo can't change its style, so a style is a lean: among the best few of the points it drew (by
// the policy), the one that fits. Each avatar has its own strength, 10k to 1d (the user: "a wider skill range
// starting from 10k"): AI_RANK, in kyu (0 = 1d).
const AI_STYLES = {
  fighter: { name: "fighter", about: "goes for contact with your stones" },
  territory: { name: "territorial", about: "takes the corners and the third line" },
  influence: { name: "influence", about: "plays high, toward the centre" },
  solid: { name: "solid", about: "keeps its stones connected" },
  trickster: { name: "trickster", about: "prefers the move you didn't expect" },
  wild: { name: "wild", about: "roams, and doesn't mind a risk" },
  calm: { name: "calm", about: "plays the best move it sees" },
};
const AI_CAST = {
  caocao: "fighter", zhangliao: "fighter", ms_oh: "fighter", ms_oh_hike: "fighter", zhaoyun: "fighter", lijue: "fighter",
  dongzhuo: "territory", ms_ahn: "territory", grannyliu: "territory", houcheng: "territory",
  chengong: "influence", daiyu: "influence", chenliu: "influence", ladysun: "influence",
  liubei: "solid", ms_sun: "solid", chendeng: "solid", yanshi: "solid",
  diaochan: "trickster", wangyun: "trickster", ms_parkjg: "trickster", lisu: "trickster",
  lvbu: "wild", ms_han: "wild",
  jiaxu: "calm", ms_jang: "calm",
};
const AI_RANK = {
  grannyliu: 10, chenliu: 10, houcheng: 9, ms_han: 9, lijue: 8, ladysun: 8, ms_ahn: 7, chendeng: 7, yanshi: 6, lisu: 6,
  ms_oh: 5, ms_oh_hike: 5, dongzhuo: 5, diaochan: 4, daiyu: 4, zhangliao: 4, liubei: 3, ms_sun: 3, wangyun: 3,
  zhaoyun: 2, ms_parkjg: 2, chengong: 1, lvbu: 1, caocao: 0, jiaxu: 0, ms_jang: 0,
};
const aiRankOf = who => AI_RANK[who] ?? 5;
const aiStyleOf = who => AI_STYLES[AI_CAST[who] || "calm"];
// a candidate's fit for a style: the board (grid), KataGo's color (me), the point (x, y), its rank among KataGo's moves
function aiFit(style, grid, me, sz, x, y, rank) {
  const line = Math.min(x, y, sz - 1 - x, sz - 1 - y) + 1;
  let dOpp = 99, dOwn = 99;
  for (let r = Math.max(0, y - 3); r <= Math.min(sz - 1, y + 3); r++) for (let c = Math.max(0, x - 3); c <= Math.min(sz - 1, x + 3); c++) {
    const v = grid[r][c], d = Math.max(Math.abs(c - x), Math.abs(r - y));
    if (v === 3 - me) dOpp = Math.min(dOpp, d); else if (v === me) dOwn = Math.min(dOwn, d);
  }
  switch (style) {
    case "fighter": return dOpp === 1 ? 3 : dOpp === 2 ? 1.5 : dOpp === 3 ? 0.5 : 0;
    case "territory": return (line === 3 ? 2 : line === 2 ? 1.5 : line === 4 ? 0.5 : -1) + (Math.min(x, sz - 1 - x) < 6 && Math.min(y, sz - 1 - y) < 6 ? 0.5 : 0);
    case "influence": return line >= 5 ? 2 : line === 4 ? 1.5 : line === 3 ? 0 : -2;
    case "solid": return dOwn === 1 ? 2.5 : dOwn === 2 ? 1 : 0;
    case "trickster": return Math.min(rank, 3);
    case "wild": return Math.random() * 2;
    default: return -rank;
  }
}

// handicap stones on 19x19, Black's, as Go places them (the user: "I would like it to be able to play handicap games"):
// the star points, 2 to 9 (5, 7, 9 add the centre)
function AI_HANDICAP(n) {
  const L = 3, M = 9, H = 15, corners = [[H, L], [L, H], [H, H], [L, L]];
  const s = corners.slice(0, Math.min(n, 4));
  if (n >= 6) s.push([L, M], [H, M]);
  if (n >= 8) s.push([M, L], [M, H]);
  if (n % 2 && n >= 5) s.push([M, M]);
  return s;
}

// the friend game's board and rules, with KataGo's name (made on first use: this file loads before app.js, which has
// FriendGame, so the Play tab can show its panel on the first page)
let AIGameClass = null;
const aiGame = (S, me) => new (AIGameClass || (AIGameClass = class extends FriendGame {
  get title() { const L = AI_LEVELS[this.S.level] || {}; return this.S.foe ? `vs ${this.S.foe.name}` : L.own ? `vs ${L.name} · ${this.S.size}×${this.S.size}` : `vs KataGo · ${L.name} · ${this.S.size}×${this.S.size}`; }
  player(color) { const L = AI_LEVELS[this.S.level] || {}; return { username: color === this.S.hostColor ? (this.S.names[color] || "You") : this.S.foe ? this.S.foe.name : L.own ? "Our AI" : `KataGo (${L.name})` }; }
}))(S, me);

const AIPlay = {
  KEY: "gt-ai-game",
  game: null, listeners: new Set(), thinking: false, status: "",
  saved() { try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; } },
  load() {
    if (this.game) return this.game;
    const v = this.saved();
    if (v && v.S) this.game = aiGame(v.S, { role: "host", color: v.S.hostColor, token: null });
    return this.game;
  },
  persist() { try { localStorage.setItem(this.KEY, JSON.stringify({ S: this.game.S })); } catch {} },
  emit() { for (const f of this.listeners) f(); },
  start({ size, level, color, foe, handicap = 0 }) {
    const hostColor = color === "black" ? BLACK : color === "white" ? WHITE : (Math.random() < .5 ? BLACK : WHITE);
    const S = FriendPlay.fresh({ size, T: null, hostColor, names: { [hostColor]: Sync.username || "You" }, listed: false });
    if (handicap >= 2) { S.setup = AI_HANDICAP(handicap); S.komi = 0.5; }   // stones for Black, White moves first
    S.phase = "play"; S.level = foe ? "strong" : level; if (foe) S.foe = foe;   // foe: an avatar ({who, name, src})
    this.game = aiGame(S, { role: "host", color: hostColor, token: null });
    this.persist();
    location.hash = "#/ai";
    this.maybeAI();
  },
  change(fn) { fn(this.game.S); this.game.S.seq++; this.persist(); this.emit(); },
  play(c, r) {
    this.change(S => {
      S.moves.push([c, r]);
      const n = S.moves.length;
      if (n >= 2 && S.moves[n - 1][0] < 0 && S.moves[n - 2][0] < 0) { S.phase = "stone removal"; S.removed = []; S.accepted = {}; }
    });
  },

  // what playGame calls
  move(c, r) {
    const g = this.game;
    if (this.thinking || !g.myTurn || !g.legal(c, r)) { g.error = c >= 0 && g.myTurn && !this.thinking ? "Not there (a ko must wait a move)." : ""; return this.emit(); }
    g.error = "";
    this.play(c, r);
    this.maybeAI();
  },
  resign() { this.change(S => { S.phase = "finished"; S.result = { winner: 3 - this.game.myColor, how: "resignation" }; }); },
  setRemoved(points, removed) {
    this.change(S => {
      const set = new Set(S.removed);
      for (const [c, r] of points) removed ? set.add(r * N + c) : set.delete(r * N + c);
      S.removed = [...set].sort((a, b) => a - b);
    });
  },
  // KataGo takes your marks of the dead
  acceptScore() {
    const g = this.game, sc = g.score();
    this.change(S => { S.phase = "finished"; S.result = { winner: sc.winner, how: "score", text: sc.text }; });
  },
  resumePlay() { this.change(S => { S.phase = "play"; S.removed = []; S.accepted = {}; }); this.maybeAI(); },
  review(g, err) { FriendPlay.review(g, err); },
  finishedButtons() { return [h("button", { class: "primary", onclick: () => { location.hash = "#/play"; } }, "New game")]; },

  // KataGo's turn: the network's policy (one evaluation, no search), then the best of a random share of the legal
  // points (by the strength: aiShare), or a pass
  async maybeAI() {
    const g = this.game;
    if (!g || g.phase !== "play" || g.toMove() === g.myColor || this.thinking) return;
    this.thinking = true; this.status = `${g.S.foe ? g.S.foe.name : (AI_LEVELS[g.S.level] || {}).own ? "Our AI" : "KataGo"} is thinking…`; this.emit();
    const foe = g.S.foe, st = foe && AI_CAST[foe.who] || null;
    const lvl = foe ? null : (AI_LEVELS[g.S.level] || AI_LEVELS.medium), pro = !!(foe && AI_PRO[foe.who]), own = pro || !!(lvl && lvl.own);
    const kyu = foe ? aiRankOf(foe.who) : lvl.kyu, sz = g.S.size, me = g.toMove(), t0 = Date.now();
    // a moment before it plays, as a person would (apo110: "the instant play is kind of jarring"): 1-2.5 s, a little
    // longer in the middle game, the search's own time counted in
    const think = 1000 + Math.random() * 1500 + (g.S.moves.length > 20 && g.S.moves.length < 200 ? 500 : 0);
    try {
      const grid = g.replay().grid;
      const board = gridToBoardState(grid).slice(0, sz).map(row => row.slice(0, sz));
      const hist = [];
      // (passes too, as x -1: the network's pass sense needs them)
      g.S.moves.slice(-6).forEach(([c, r], i, arr) => { const k = g.S.moves.length - arr.length + i; hist.push({ x: c >= 0 ? c : -1, y: c >= 0 ? r : -1, player: g.colorOf(k) === WHITE ? "white" : "black" }); });
      const a = own ? await OwnPlay.analyze(g, grid, me, pro ? aiProUrl(foe.who) : undefined) : await Engine.analyze({ board, currentPlayer: me === BLACK ? "black" : "white", moveHistory: hist, komi: g.S.komi, rules: "chinese",
        visits: 1, topK: 1, ownershipMode: "none", analysisPvLen: 1, reuseTree: false });
      if (this.game !== g || g.phase !== "play") return;
      const pol = a.policy || [];   // sz*sz points (row by row from the top) then pass; -1 where illegal
      const lastPass = g.S.moves.length && g.S.moves[g.S.moves.length - 1][0] < 0;
      const legal = [];
      for (let i = 0; i < sz * sz; i++) if (pol[i] >= 0 && g.legal(i % sz, Math.floor(i / sz))) legal.push(i);
      const passP = pol[sz * sz] ?? 0, topP = legal.reduce((m, i) => Math.max(m, pol[i]), 0);
      let pick = null;
      if (legal.length && passP < topP) {   // (the network's own pass when it likes passing best, as calibrated)
        // draw the share at random (a partial shuffle), best first by the policy
        const n = own ? legal.length : Math.max(1, Math.min(legal.length, Math.round(aiShare(kyu) * legal.length)));   // (ours: its favourite, all of them drawn)
        for (let i = 0; i < n; i++) { const j = i + Math.floor(Math.random() * (legal.length - i)); [legal[i], legal[j]] = [legal[j], legal[i]]; }
        const drawn = legal.slice(0, n).sort((p, q) => pol[q] - pol[p]);
        let best = drawn[0];
        if (foe && !own) {   // a KataGo avatar (games from before the pro opponents): among the best few it drew (half the best's policy or more, up to 4), the one that fits its style
          const few = drawn.slice(0, 4).filter(i => pol[i] >= pol[drawn[0]] * 0.5);
          let top = -1e9;
          few.forEach((i, r) => { const f = aiFit(st || "calm", grid, me, sz, i % sz, Math.floor(i / sz), r) + Math.random() * 0.4; if (f > top) { top = f; best = i; } });
        }
        pick = { x: best % sz, y: Math.floor(best / sz) };
        // after your pass: a move the network barely considers while it rates passing above it isn't worth playing
        if (lastPass && pol[best] < 0.02 && passP > pol[best]) pick = null;
      }
      const wait = think - (Date.now() - t0);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      if (this.game !== g || g.phase !== "play") return;
      this.status = pick ? "" : `${foe ? foe.name : "KataGo"} passes.`;
      this.play(pick ? pick.x : -1, pick ? pick.y : -1);
    } catch (e) {
      console.error("[ai]", e);
      this.status = `${g.S.foe ? g.S.foe.name : (AI_LEVELS[g.S.level] || {}).own ? "Our AI" : "KataGo"} couldn't move: ` + (e.message || e) + " (tap Retry)";
      g.error = "";
    } finally { this.thinking = false; this.emit(); }
  },
};

// the panel in the Play tab: board size, strength, color; and the game in progress, if any
function aiLobby() {
  const g = AIPlay.load();
  const sel = (opts, cur) => { const s = h("select", {}, opts.map(([v, t]) => h("option", { value: v, ...(v === cur ? { selected: "" } : {}) }, t))); return s; };
  const color = sel([["black", "Black"], ["white", "White"], ["random", "Random"]], "black");
  const hcap = sel([["0", "None"], ...[2, 3, 4, 5, 6, 7, 8, 9].map(n => [String(n), `${n} stones for Black`])], "0");
  // the seven opponents: a collected one plays, the rest are silhouettes (apo110: "no note, just the avatar silhouettes")
  const cast = h("div", { class: "ai-foes" });
  let foe = null;
  const startBtn = h("button", { class: "primary", onclick: () => AIPlay.start({ size: 19, level: "strong", color: color.value, foe, handicap: +hcap.value }) }, "Start a game");
  startBtn.disabled = true;
  if (typeof Avatars !== "undefined") Promise.all(Object.keys(AI_PRO).map(who => Avatars.faceOf(who))).then(faces => {
    for (const f of faces) {
      const mine = Avatars.owns(f.who);
      const el = h("button", { class: `ai-foe${mine ? "" : " ai-foe-locked"}`, ...(mine ? { title: f.name } : {}) },
        [f.src ? h("img", { src: f.src, alt: "" }) : "", mine ? h("b", {}, f.name) : h("b", {}, "\u00a0"), mine ? h("small", { class: "ai-foe-rank" }, AI_PRO_RANK) : ""]);
      if (mine) el.onclick = () => { foe = foe && foe.who === f.who ? null : f; cast.querySelectorAll(".ai-foe").forEach(b => b.classList.toggle("on", b === el && !!foe)); startBtn.disabled = !foe; };
      else el.disabled = true;
      cast.append(el);
    }
  }).catch(() => {});
  return h("div", { class: "sgf-loader ai-lobby" }, [
    h("div", { class: "cat-title" }, "Play an avatar"),
    h("div", {}, "A 19×19 game against one of your avatars, right here: no login, no clock. Chinese rules, komi 7.5 (0.5 with a handicap)."),
    h("div", { class: "row ai-opts" }, [h("label", {}, ["You play ", color]), h("label", {}, ["Handicap ", hcap])]),
    cast,
    h("div", { class: "row" }, [startBtn, g && g.phase !== "finished" ? h("button", { onclick: () => { location.hash = "#/ai"; } }, "Resume your game") : ""]),
  ]);
}

function viewAI() {
  crumbs.textContent = "";
  root.textContent = "";
  const P = AIPlay, wrap = h("div", { class: "play" });
  root.append(wrap);
  P.listeners.clear();
  if (!P.load()) { location.hash = "#/play"; return; }
  const rerender = () => {
    if (!wrap.isConnected) { P.listeners.delete(rerender); return; }
    const g = P.game;
    wrap.textContent = "";
    const st = h("div", { class: "meta-sub ai-status" }, P.status);
    const retry = !P.thinking && g.phase === "play" && g.toMove() !== g.myColor ? h("button", { onclick: () => P.maybeAI() }, "Retry") : "";
    // (an avatar opponent: its portrait stands in the corner in place of yours, Avatars.mount; its name is the title)
    g.extra = () => h("div", {}, [st, retry]);
    wrap.append(...playGame(g, P));
  };
  P.listeners.add(rerender);
  rerender();
  P.maybeAI();   // its move, if it was KataGo's turn when the page closed
}
