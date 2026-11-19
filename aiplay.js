/* ================= play KataGo (the user: "in play can you give the option to play vs ai") =================
   A game against the site's own KataGo (Engine, the network Review uses), in the browser, no login: 19×19 (the small
   network plays nonsense on 9×9 and 13×13: on an empty 9×9 it rates the 1-1 points best), Chinese rules, komi 7.5,
   no clock. It runs on the friend game's board and rules (FriendGame, playGame): two
   passes end it, you mark the dead stones and KataGo accepts your marks. Three strengths: Easy (a few visits, and it
   picks among moves that don't lose much), Medium, Strong (as Review reads). The game is kept in this browser
   (gt-ai-game), so a reload carries on. Loaded before app.js. */
const AI_LEVELS = {
  easy: { name: "Easy", visits: 12, slack: 0.12 },     // any move within 12% win rate of its best, at random
  medium: { name: "Medium", visits: 60, slack: 0.04 },
  strong: { name: "Strong", visits: 400, slack: 0 },
};

// the friend game's board and rules, with KataGo's name (made on first use: this file loads before app.js, which has
// FriendGame, so the Play tab can show its panel on the first page)
let AIGameClass = null;
const aiGame = (S, me) => new (AIGameClass || (AIGameClass = class extends FriendGame {
  get title() { return `vs KataGo · ${AI_LEVELS[this.S.level].name} · ${this.S.size}×${this.S.size}`; }
  player(color) { return { username: color === this.S.hostColor ? (this.S.names[color] || "You") : `KataGo (${AI_LEVELS[this.S.level].name})` }; }
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
  start({ size, level, color }) {
    const hostColor = color === "black" ? BLACK : color === "white" ? WHITE : (Math.random() < .5 ? BLACK : WHITE);
    const S = FriendPlay.fresh({ size, T: null, hostColor, names: { [hostColor]: Sync.username || "You" }, listed: false });
    S.phase = "play"; S.level = level;
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

  // KataGo's turn: its search, then a move among those near its best (by the level), or a pass
  async maybeAI() {
    const g = this.game;
    if (!g || g.phase !== "play" || g.toMove() === g.myColor || this.thinking) return;
    this.thinking = true; this.status = "KataGo is thinking…"; this.emit();
    const L = AI_LEVELS[g.S.level], sz = g.S.size, me = g.toMove();
    try {
      const grid = g.replay().grid;
      const board = gridToBoardState(grid).slice(0, sz).map(row => row.slice(0, sz));
      const hist = [];
      g.S.moves.slice(-6).forEach(([c, r], i, arr) => { const k = g.S.moves.length - arr.length + i; if (c >= 0) hist.push({ x: c, y: r, player: k % 2 ? "white" : "black" }); });
      const a = await Engine.analyze({ board, currentPlayer: me === BLACK ? "black" : "white", moveHistory: hist, komi: g.S.komi, rules: "chinese",
        visits: L.visits, topK: 8, ownershipMode: "none", analysisPvLen: 1, reuseTree: false });
      if (this.game !== g || g.phase !== "play") return;
      const mine = w => me === BLACK ? w : 1 - w;   // a win rate from KataGo's side (the engine gives Black's)
      const moves = (a.moves || []).filter(m => m && m.x != null);
      const passBest = !moves.length || moves[0].x < 0 || moves[0].move === "pass";
      const lastPass = g.S.moves.length && g.S.moves[g.S.moves.length - 1][0] < 0;
      // after your pass, KataGo passes too unless a move still matters (a win rate it can gain); else it plays on
      const legal = moves.filter(m => m.x >= 0 && m.y >= 0 && m.x < sz && m.y < sz && g.legal(m.x, m.y));
      let pick = null;
      if (!passBest && legal.length) {
        const best = mine(legal[0].winRate ?? a.rootWinRate ?? 0.5);
        const near = legal.filter(m => best - mine(m.winRate ?? 0) <= L.slack);
        pick = near[Math.floor(Math.random() * near.length)] || legal[0];
        if (lastPass && Math.abs(mine(pick.winRate ?? best) - mine(a.rootWinRate ?? best)) < 0.01 && mine(a.rootWinRate ?? 0.5) > 0.5) pick = null;   // nothing left to gain: it passes
      }
      this.status = pick ? "" : "KataGo passes.";
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
  const level = sel(Object.entries(AI_LEVELS).map(([k, v]) => [k, v.name]), localStorage.getItem("gt-ai-level") || "medium");
  const color = sel([["black", "Black (you start)"], ["white", "White"], ["random", "Random"]], "black");
  const start = () => {
    try { localStorage.setItem("gt-ai-level", level.value); } catch {}
    AIPlay.start({ size: +size.value, level: level.value, color: color.value });
  };
  return h("div", { class: "sgf-loader ai-lobby" }, [
    h("div", { class: "cat-title" }, "Play KataGo"),
    h("div", {}, "A 19×19 game against the site's own AI, right here: no login, no clock. Chinese rules, komi 7.5."),
    h("div", { class: "row ai-opts" }, [h("label", {}, ["Strength ", level]), h("label", {}, ["You play ", color])]),
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
    g.extra = () => h("div", {}, [st, retry]);
    wrap.append(...playGame(g, P));
  };
  P.listeners.add(rerender);
  rerender();
  P.maybeAI();   // its move, if it was KataGo's turn when the page closed
}
