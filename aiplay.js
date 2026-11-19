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

// the avatars as opponents (apo110: "play against the avatars themselves... at least 10k... vary their play styles by
// character"). KataGo can't change its style, so a style is a lean: among the moves within its slack of KataGo's best
// (a near-best move, so no one plays below about 10k: 80+ visits, a few % of win rate at most), the one that fits.
const AI_STYLES = {
  fighter: { name: "fighter", about: "goes for contact with your stones", slack: 0.04 },
  territory: { name: "territorial", about: "takes the corners and the third line", slack: 0.04 },
  influence: { name: "influence", about: "plays high, toward the centre", slack: 0.04 },
  solid: { name: "solid", about: "keeps its stones connected", slack: 0.035 },
  trickster: { name: "trickster", about: "prefers the move you didn't expect", slack: 0.04 },
  wild: { name: "wild", about: "roams, and doesn't mind a risk", slack: 0.07 },
  calm: { name: "calm", about: "plays the best move it sees", slack: 0.01 },
};
const AI_CAST = {
  caocao: "fighter", zhangliao: "fighter", ms_oh: "fighter", zhaoyun: "fighter", lijue: "fighter",
  dongzhuo: "territory", ms_ahn: "territory", grannyliu: "territory", houcheng: "territory",
  chengong: "influence", daiyu: "influence", chenliu: "influence", ladysun: "influence",
  liubei: "solid", ms_sun: "solid", chendeng: "solid", yanshi: "solid",
  diaochan: "trickster", wangyun: "trickster", ms_parkjg: "trickster", lisu: "trickster",
  lvbu: "wild", ms_han: "wild",
  jiaxu: "calm", ms_jang: "calm",
};
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
  get title() { return this.S.foe ? `vs ${this.S.foe.name} · ${aiStyleOf(this.S.foe.who).name}` : `vs KataGo · ${AI_LEVELS[this.S.level].name} · ${this.S.size}×${this.S.size}`; }
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

  // KataGo's turn: its search, then a move among those near its best (by the level), or a pass
  async maybeAI() {
    const g = this.game;
    if (!g || g.phase !== "play" || g.toMove() === g.myColor || this.thinking) return;
    this.thinking = true; this.status = `${g.S.foe ? g.S.foe.name : "KataGo"} is thinking…`; this.emit();
    const foe = g.S.foe, st = foe && AI_CAST[foe.who] || null;
    const L = foe ? { visits: 80, slack: aiStyleOf(foe.who).slack } : AI_LEVELS[g.S.level], sz = g.S.size, me = g.toMove(), t0 = Date.now();
    // a moment before it plays, as a person would (apo110: "the instant play is kind of jarring"): 1-2.5 s, a little
    // longer in the middle game, the search's own time counted in
    const think = 1000 + Math.random() * 1500 + (g.S.moves.length > 20 && g.S.moves.length < 200 ? 500 : 0);
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
        if (foe) {   // an avatar: the near-best move that fits its style (a little chance in it)
          const style = st || "calm";
          let top = -1e9;
          for (const m of near) { const f = aiFit(style, grid, me, sz, m.x, m.y, legal.indexOf(m)) + Math.random() * 0.4; if (f > top) { top = f; pick = m; } }
        }
        else pick = near[Math.floor(Math.random() * near.length)] || legal[0];
        pick = pick || legal[0];
        if (lastPass && Math.abs(mine(pick.winRate ?? best) - mine(a.rootWinRate ?? best)) < 0.01 && mine(a.rootWinRate ?? 0.5) > 0.5) pick = null;   // nothing left to gain: it passes
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
  const level = sel(Object.entries(AI_LEVELS).map(([k, v]) => [k, v.name]), localStorage.getItem("gt-ai-level") || "medium");
  const color = sel([["black", "Black (you start)"], ["white", "White"], ["random", "Random"]], "black");
  // the avatars you've collected, each with its style (apo110: "play against the avatars themselves")
  const cast = h("div", { class: "ai-cast" });
  let foe = null;
  if (typeof Avatars !== "undefined") Avatars.leads().then(async all => {
    const mine = all.filter(x => Avatars.owns(x.who));
    if (!mine.length) { cast.append(h("p", { class: "meta-sub" }, "Collect avatars in the stories to play them here.")); return; }
    const faces = await Promise.all(mine.map(x => Avatars.faceOf(x.who)));
    const pickBtn = (f, el) => () => { foe = foe && foe.who === f.who ? null : f; cast.querySelectorAll(".ai-foe").forEach(b => b.classList.toggle("on", b === el && !!foe)); level.disabled = !!foe; };
    cast.append(h("div", { class: "ai-cast-title" }, "Or play one of your avatars (10k or stronger, each in its own style):"),
      h("div", { class: "ai-foes" }, faces.map(f => { const st = aiStyleOf(f.who);
        const el = h("button", { class: "ai-foe", title: `${f.name}: ${st.about}` }, [f.src ? h("img", { src: f.src, alt: "" }) : "", h("b", {}, f.name), h("small", {}, st.name)]);
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
    const foe = g.S.foe;
    g.extra = () => h("div", {}, [foe ? h("div", { class: "ai-foe-card" }, [foe.src ? h("img", { src: foe.src, alt: "" }) : "", h("div", {}, [h("b", {}, foe.name), h("small", {}, `${aiStyleOf(foe.who).name}: ${aiStyleOf(foe.who).about}`)])]) : "", st, retry]);
    wrap.append(...playGame(g, P));
  };
  P.listeners.add(rerender);
  rerender();
  P.maybeAI();   // its move, if it was KataGo's turn when the page closed
}
