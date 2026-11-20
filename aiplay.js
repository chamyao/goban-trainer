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

// the friend game's board and rules, with KataGo's name (made on first use: this file loads before app.js, which has
// FriendGame, so the Play tab can show its panel on the first page)
let AIGameClass = null;
const aiGame = (S, me) => new (AIGameClass || (AIGameClass = class extends FriendGame {
  get title() { return this.S.foe ? `vs ${this.S.foe.name}` : `vs KataGo · ${AI_LEVELS[this.S.level].name} · ${this.S.size}×${this.S.size}`; }
  player(color) { return { username: color === this.S.hostColor ? (this.S.names[color] || "You") : this.S.foe ? this.S.foe.name : `KataGo (${AI_LEVELS[this.S.level].name})` }; }
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
  start({ size, level, color, foe }) {
    const hostColor = color === "black" ? BLACK : color === "white" ? WHITE : (Math.random() < .5 ? BLACK : WHITE);
    const S = FriendPlay.fresh({ size, T: null, hostColor, names: { [hostColor]: Sync.username || "You" }, listed: false });
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
    this.thinking = true; this.status = `${g.S.foe ? g.S.foe.name : "KataGo"} is thinking…`; this.emit();
    const foe = g.S.foe, st = foe && AI_CAST[foe.who] || null;
    const kyu = foe ? aiRankOf(foe.who) : (AI_LEVELS[g.S.level] || AI_LEVELS.medium).kyu, sz = g.S.size, me = g.toMove(), t0 = Date.now();
    // a moment before it plays, as a person would (apo110: "the instant play is kind of jarring"): 1-2.5 s, a little
    // longer in the middle game, the search's own time counted in
    const think = 1000 + Math.random() * 1500 + (g.S.moves.length > 20 && g.S.moves.length < 200 ? 500 : 0);
    try {
      const grid = g.replay().grid;
      const board = gridToBoardState(grid).slice(0, sz).map(row => row.slice(0, sz));
      const hist = [];
      // (passes too, as x -1: the network's pass sense needs them)
      g.S.moves.slice(-6).forEach(([c, r], i, arr) => { const k = g.S.moves.length - arr.length + i; hist.push({ x: c >= 0 ? c : -1, y: c >= 0 ? r : -1, player: k % 2 ? "white" : "black" }); });
      const a = await Engine.analyze({ board, currentPlayer: me === BLACK ? "black" : "white", moveHistory: hist, komi: g.S.komi, rules: "chinese",
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
        const n = Math.max(1, Math.min(legal.length, Math.round(aiShare(kyu) * legal.length)));
        for (let i = 0; i < n; i++) { const j = i + Math.floor(Math.random() * (legal.length - i)); [legal[i], legal[j]] = [legal[j], legal[i]]; }
        const drawn = legal.slice(0, n).sort((p, q) => pol[q] - pol[p]);
        let best = drawn[0];
        if (foe) {   // an avatar: among the best few it drew (half the best's policy or more, up to 4), the one that fits its style
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
      this.status = "KataGo couldn't move: " + (e.message || e) + " (tap Retry)";
      g.error = "";
    } finally { this.thinking = false; this.emit(); }
  },
};

// the panel in the Play tab: board size, strength, color; and the game in progress, if any
function aiLobby() {
  const g = AIPlay.load();
  const sel = (opts, cur) => { const s = h("select", {}, opts.map(([v, t]) => h("option", { value: v, ...(v === cur ? { selected: "" } : {}) }, t))); return s; };
  const size = { value: "19" };   // (19×19 only: see the top)
  const level = sel(Object.entries(AI_LEVELS).map(([k, v]) => [k, `${v.name} (about ${aiRankText(v.kyu)})`]), localStorage.getItem("gt-ai-level") || "medium");
  const color = sel([["black", "Black (you start)"], ["white", "White"], ["random", "Random"]], "black");
  // the avatars you've collected, each with its style (apo110: "play against the avatars themselves")
  const cast = h("div", { class: "ai-cast" });
  let foe = null;
  if (typeof Avatars !== "undefined") Avatars.leads().then(async all => {
    const mine = all.filter(x => Avatars.owns(x.who)).sort((p, q) => aiRankOf(q.who) - aiRankOf(p.who));   // weakest first
    if (!mine.length) { cast.append(h("p", { class: "meta-sub" }, "Collect avatars in the stories to play them here.")); return; }
    const faces = await Promise.all(mine.map(x => Avatars.faceOf(x.who)));
    const pickBtn = (f, el) => () => { foe = foe && foe.who === f.who ? null : f; cast.querySelectorAll(".ai-foe").forEach(b => b.classList.toggle("on", b === el && !!foe)); level.disabled = !!foe; };
    // (just the opponents and their strength: no style names or explanations, apo110)
    cast.append(h("div", { class: "ai-cast-title" }, "Or play one of your avatars:"),
      h("div", { class: "ai-foes" }, faces.map(f => {
        const el = h("button", { class: "ai-foe", title: f.name }, [f.src ? h("img", { src: f.src, alt: "" }) : "", h("b", {}, f.name), h("small", { class: "ai-foe-rank" }, aiRankText(aiRankOf(f.who)))]);
        el.onclick = pickBtn(f, el); return el; })));
  }).catch(() => {});
  const start = () => {
    try { localStorage.setItem("gt-ai-level", level.value); } catch {}
    AIPlay.start({ size: +size.value, level: level.value, color: color.value, foe });
  };
  return h("div", { class: "sgf-loader ai-lobby" }, [
    h("div", { class: "cat-title" }, "Play KataGo"),
    h("div", {}, "A 19×19 game against the site's own AI, right here: no login, no clock. Chinese rules, komi 7.5."),
    h("div", { class: "row ai-opts" }, [h("label", {}, ["Strength ", level]), h("label", {}, ["You play ", color])]),
    cast,
    h("div", { class: "row" }, [
      h("button", { class: "primary", onclick: start }, "Start a game"),
      g && g.phase !== "finished" ? h("button", { onclick: () => { location.hash = "#/ai"; } }, "Resume your game") : "",
    ]),
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
