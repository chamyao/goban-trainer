/* ================= the travellers' go table: live games in the world =================
   A go table in Lousang Village where Liu Bei can sit and play real people on
   online-go.com. Everything is preset (9×9, ranked, OGS's rapid automatch);
   the player only sits, plays and stands. When a match is found, the
   opponent walks in as a townsperson (dressed by their rank) and sits across,
   and the live game comes up on an in-game board. Uses OGSPlay and LiveGame
   from app.js for the login, the socket, the clocks and the moves.

   The board is the engine's 19×19 grid with every point past the 9×9 corner
   walled off (value 3: neither empty nor a stone of either side), so its
   capture rules work unchanged. */
const TKTable = {
  S: 9, WALL: 3,
  scene: null, key: "", state: "idle",   // idle | ask | waiting | arriving | playing | over
  ui: null, foe: null, tick: 0, since: 0, resignAsk: false,

  // The opponent's look, by rank: village folk, then soldiers and officials, then masters.
  LOOKS: [["f_farmer", "f_farmer2", "f_youth", "f_porter", "f_woman", "f_hunter"],
          ["f_soldier", "f_official", "f_maiden", "f_geisha", "f_elder"],
          ["f_daoist", "f_noble", "f_elder2", "f_geisha2"]],
  rankText(r) {
    if (typeof r !== "number") return "";
    return r >= 30 ? `${Math.floor(r - 29)}段 ${Math.floor(r - 29)}d` : `${Math.ceil(30 - r)}级 ${Math.ceil(30 - r)}k`;
  },
  lookFor(p) {
    const r = typeof p.ranking === "number" ? p.ranking : typeof p.rank === "number" ? p.rank : 15;
    const tier = this.LOOKS[r >= 30 ? 2 : r >= 21 ? 1 : 0];
    let hsh = 0;
    for (const ch of String(p.username || p.id || "")) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
    return tier[hsh % tier.length];
  },

  /* ---------- sitting down and standing up ---------- */
  sit(scene, key) {
    if (this.scene === scene && this.state !== "idle") {   // already here: bring the board back up
      if (this.ui && this.ui.hidden) this.ui.hidden = false;
      return;
    }
    this.reset();
    this.scene = scene; this.key = key;
    const s = scene.spots[key], P = scene.player;
    scene.walk = null; scene.seated = true;
    P.setVelocity(0); P.setPosition(s.x, s.y + 4); P.facing = "up"; P.setTexture("h-liubei-up-0");
    scene.events.once("shutdown", () => { if (this.scene === scene) this.reset(); });
    this.panel();
    if (!OGSPlay.loggedIn()) return this.ask();
    this.wait();
  },
  stand() {
    const scene = this.scene;
    this.reset();
    if (scene && scene.sys && scene.sys.isActive()) { scene.seated = false; scene.opts.host.focus(); }
  },
  // Clears the table (the world's scene is gone, or the game is over and everyone has left).
  reset() {
    if (OGSPlay.search && OGSPlay.search.inWorld) OGSPlay.cancelSearch();   // nobody left at the table to play a match
    clearInterval(this.tick);
    OGSPlay.listeners.delete(this.onEmit);
    if (this.ui) this.ui.remove();
    if (this.foe && this.foe.spr && this.foe.spr.scene) this.foe.spr.destroy();
    if (this.scene && this.scene.sys && this.scene.sys.isActive()) this.scene.seated = false;
    this.ui = this.foe = this.scene = null; this.state = "idle"; this.resignAsk = false;
  },
  // Back in the village after signing in on OGS: sit straight down again.
  arrived(scene) {
    let flag = null;
    try { flag = sessionStorage.getItem("tk-table-resume"); sessionStorage.removeItem("tk-table-resume"); } catch {}
    if (!flag) return;
    const key = Object.keys(scene.spots).find(k => scene.spots[k].use === "ogs");
    if (key && OGSPlay.loggedIn()) this.sit(scene, key);
  },

  /* ---------- the panel over the world: asking, waiting ---------- */
  panel() {
    const host = this.scene.opts.host;
    this.ui = h("div", { class: "tk-table-panel" });
    host.append(this.ui);
  },
  say(zh, en, ...btns) {
    if (!this.ui) return;
    this.ui.className = "tk-table-panel";
    this.ui.replaceChildren(h("div", { class: "tk-table-say" }, [
      h("div", { class: "town-zh", lang: "zh-CN" }, zh), h("div", { class: "town-en" }, en),
      h("div", { class: "tk-table-btns" }, btns)]));
  },
  btn(label, fn, cls = "") { return h("button", { type: "button", class: `tk-duel-go ${cls}`, onclick: e => { e.stopPropagation(); fn(); } }, label); },
  ask() {
    this.state = "ask";
    this.say("这张棋桌供过往的棋客对弈。要与天下棋手过招，请先在棋会名册上签名。",
      "Travellers play at this table. To take on players from all over the realm, first sign the Go Society's register.",
      this.btn("签名 Sign in", () => this.signIn()), this.btn("起身 Not now", () => this.stand(), "quiet"));
  },
  signIn() {
    const scene = this.scene, P = scene.player;
    scene.st.pos = { place: scene.placeId, x: Math.round(P.x), y: Math.round(P.y), f: "up" };
    scene.save();
    try { sessionStorage.setItem("tk-table-resume", "1"); } catch {}
    OGSPlay.login(location.hash).catch(e => this.say("签名没能完成。", e.message, this.btn("起身 Stand up", () => this.stand())));
  },
  async wait() {
    this.state = "waiting"; this.since = Date.now();
    const line = () => {
      const s = Math.floor((Date.now() - this.since) / 1000);
      return `Waiting for someone to sit across from you · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    };
    this.say("刘备坐下，摆好棋盒，等人来对弈……", line(), this.btn("起身 Stand up", () => this.stand(), "quiet"));
    this.tick = setInterval(() => {
      if (this.state === "waiting" && this.ui) { const en = this.ui.querySelector(".town-en"); if (en) en.textContent = line(); }
      if (this.state === "playing" || this.state === "over") this.renderClocks();
    }, 500);
    // a game left open elsewhere (the Play tab) isn't this table's
    if (OGSPlay.game && OGSPlay.sock) OGSPlay.sock.send("game/disconnect", { game_id: OGSPlay.game.id });
    OGSPlay.game = null;
    OGSPlay.listeners.add(this.onEmit);
    try {
      await OGSPlay.connect();
      if (this.state !== "waiting") return;
      // a game already under way at this table (the page was reloaded): sit back down to it
      const live = (await OGSPlay.ongoing().catch(() => [])).find(g => g.width === this.S && g.height === this.S && !g.corr);
      if (this.state !== "waiting") return;
      if (live) OGSPlay.openGame(live.id);
      else OGSPlay.findGame({ size: this.S, inWorld: true });
    } catch (e) {
      if (this.state !== "waiting") return;
      this.say("棋会那边没有回音。", e.message || "Couldn't reach the Go Society.", this.btn("起身 Stand up", () => this.stand()));
    }
  },

  /* ---------- the match ---------- */
  onEmit: () => TKTable.update(),
  update() {
    const g = OGSPlay.game;
    if (!this.scene || !g || !g.data || g.data.width !== this.S) return;
    if (this.state === "waiting") {
      this.state = "arriving";
      const opp = g.player(3 - (g.myColor || BLACK));
      this.say(`${opp.username || "一位棋客"}来了。`, `${opp.username || "Someone"} is coming over to the table.`);
      this.arrive(opp, () => { this.state = g.phase === "finished" ? "over" : "playing"; this.board(); });
      return;
    }
    if (this.state === "playing" || this.state === "over") {
      if (g.phase === "finished" && this.state === "playing") this.state = "over";
      this.render();
    }
  },
  // The opponent walks in from a little way off and sits across the table.
  arrive(opp, then) {
    const scene = this.scene, s = scene.spots[this.key], who = this.lookFor(opp);
    scene.hero(who);
    const seat = { x: s.x, y: s.y - 19 };   // right behind the table, which hides their legs
    const from = Object.values(scene.entries)[0] || { x: seat.x + 80, y: seat.y + 40 };
    let path = scene.findPath(from.x, from.y - 3, seat.x, seat.y - 3) || [{ x: seat.x, y: seat.y }];
    // only the last stretch (about five tiles): a game clock is already running
    // the walk grid stops short of the table; the last step goes right up to the seat
    const pts = [{ x: from.x, y: from.y }, ...path.map(p => ({ x: p.x, y: p.y + 3 })), seat];
    let left = 80, i = pts.length - 1;
    while (i > 0 && left > 0) { left -= Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); i--; }
    const walk = pts.slice(i);
    const spr = scene.add.sprite(walk[0].x, walk[0].y, `h-${who}-down-0`).setOrigin(.5, 1).setAlpha(0);
    this.foe = { spr, who, name: opp.username || "?", rank: opp.ranking ?? opp.rank };
    scene.tweens.add({ targets: spr, alpha: 1, duration: 250 });
    const step = k => {
      if (!spr.scene) return;
      if (k >= walk.length) { spr.anims.stop(); spr.setTexture(`h-${who}-down-0`); spr.setDepth(spr.y); return then(); }
      const a = { x: spr.x, y: spr.y }, b = walk[k], d = Math.hypot(b.x - a.x, b.y - a.y);
      const dir = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? (b.x > a.x ? "right" : "left") : (b.y > a.y ? "down" : "up");
      if (d > .5) spr.anims.play(`h-${who}-${dir}`, true);
      scene.tweens.add({ targets: spr, x: b.x, y: b.y, duration: d / 70 * 1000, onUpdate: () => spr.setDepth(spr.y), onComplete: () => step(k + 1) });
    };
    step(1);
  },
  leave() {
    const f = this.foe, scene = this.scene;
    if (OGSPlay.game && OGSPlay.sock) { OGSPlay.sock.send("game/disconnect", { game_id: OGSPlay.game.id }); OGSPlay.game = null; }
    if (this.ui) { this.ui.remove(); this.ui = null; }
    clearInterval(this.tick);
    OGSPlay.listeners.delete(this.onEmit);
    this.state = "idle";
    if (scene && scene.sys && scene.sys.isActive()) { scene.seated = false; scene.opts.host.focus(); }
    this.scene = null; this.foe = null;
    if (!f || !f.spr.scene) return;
    // a bow (a hop), then away
    f.spr.scene.tweens.add({ targets: f.spr, y: f.spr.y - 2, duration: 120, yoyo: true, onComplete: () => {
      if (!f.spr.scene) return;
      f.spr.anims.play(`h-${f.who}-right`, true);
      f.spr.scene.tweens.add({ targets: f.spr, x: f.spr.x + 70, alpha: 0, duration: 1400, onComplete: () => f.spr.destroy() });
    } });
  },

  /* ---------- the board ---------- */
  board() {
    const scene = this.scene, host = scene.opts.host, g = OGSPlay.game;
    if (this.ui) this.ui.remove();
    const narrow = host.clientWidth < 640;
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 400 400");
    this.svg = svg;
    const face = scene.faceOf({ who: this.foe.who });
    face.className = "town-face";
    const row = (cls, name, rank) => h("div", { class: `tk-table-player ${cls}` }, [
      h("span", { class: "tk-table-stone" }), h("span", { class: "tk-table-name" }, [name, rank ? h("small", {}, ` ${rank}`) : ""]),
      h("span", { class: "tk-table-clock" })]);
    this.rows = { foe: row("foe", this.foe.name, this.rankText(this.foe.rank)), me: row("me", "刘备 You", "") };
    this.zh = h("div", { class: "town-zh", lang: "zh-CN" }); this.en = h("div", { class: "town-en" });
    this.btns = h("div", { class: "tk-duel-next" });
    const dlg = h("div", { class: "town-dlg tk-duel-dlg chat" }, [
      h("div", { class: "town-tab" }, "对弈 · Live game"), face,
      h("div", { class: "town-txt" }, [this.rows.foe, this.rows.me, this.zh, this.en, this.btns])]);
    const stage = h("div", { class: "tk-duel-stage" }, [h("div", { class: "tk-duel-board tk-table-board" }, [svg]), h("div", { class: "tk-duel-side" }, [dlg])]);
    this.ui = h("div", { class: "tk-duel tk-table" + (narrow ? " tk-duel-full" : ""), role: "dialog", "aria-label": "Live game 对弈" }, [stage]);
    (narrow ? document.body : host).append(this.ui);
    svg.addEventListener("click", e => this.click(e));
    this.render();
  },
  // The 19×19 engine grid for a 9×9 game: everything past the corner is wall.
  grid() {
    const g = OGSPlay.game, S = this.S;
    let grid = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r < S && c < S ? EMPTY : this.WALL)), last = null;
    const init = (g.data && g.data.initial_state) || {};
    for (const [c, r] of stonesOf(init.black || "")) grid[r][c] = BLACK;
    for (const [c, r] of stonesOf(init.white || "")) grid[r][c] = WHITE;
    g.moves.forEach(([c, r], i) => {
      last = null;
      if (c < 0) return;
      grid = applyMove(grid, c, r, g.colorOf(i)) || grid;
      last = [c, r];
    });
    return { grid, last };
  },
  render() {
    const g = OGSPlay.game, svg = this.svg;
    if (!g || !svg || !svg.isConnected) return;
    const { grid, last } = this.grid(), S = this.S, cell = 40, pad = 40, P = i => pad + i * cell;
    const removed = g.phase === "stone removal" ? g.removed : new Set();
    let out = `<defs><radialGradient id="tbs" cx="35%" cy="30%"><stop offset="0%" stop-color="#5a5a5a"/><stop offset="100%" stop-color="#111"/></radialGradient>
      <radialGradient id="tws" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#cfcfc7"/></radialGradient></defs>
      <rect x="0" y="0" width="400" height="400" rx="10" fill="#dcb35c"/>`;
    for (let i = 0; i < S; i++) {
      const w = i === 0 || i === S - 1 ? 2.2 : 1.1;
      out += `<line x1="${P(0)}" y1="${P(i)}" x2="${P(S - 1)}" y2="${P(i)}" stroke="#3b2a12" stroke-width="${w}"/>`;
      out += `<line x1="${P(i)}" y1="${P(0)}" x2="${P(i)}" y2="${P(S - 1)}" stroke="#3b2a12" stroke-width="${w}"/>`;
    }
    for (const [c, r] of [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]]) out += `<circle cx="${P(c)}" cy="${P(r)}" r="3.5" fill="#3b2a12"/>`;
    for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
      const v = grid[r][c];
      if (v !== BLACK && v !== WHITE) continue;
      const dead = removed.has(r * N + c);
      out += `<circle cx="${P(c)}" cy="${P(r)}" r="${cell * .47}" fill="url(#${v === BLACK ? "tbs" : "tws"})" stroke="rgba(0,0,0,.35)" stroke-width=".8"${dead ? ' opacity=".35"' : ""}/>`;
      if (last && last[0] === c && last[1] === r) out += `<circle cx="${P(c)}" cy="${P(r)}" r="${cell * .2}" fill="none" stroke="${v === BLACK ? "#fff" : "#333"}" stroke-width="2"/>`;
    }
    svg.innerHTML = out;
    this.cells = { pad, cell };
    // the words and buttons for where the game stands
    const me = g.myColor, mine = me === BLACK ? "黑 Black" : "白 White";
    this.rows.me.querySelector(".tk-table-stone").className = `tk-table-stone ${me === WHITE ? "w" : "b"}`;
    this.rows.foe.querySelector(".tk-table-stone").className = `tk-table-stone ${me === WHITE ? "b" : "w"}`;
    const set = (zh, en, ...b) => { this.zh.textContent = zh; this.en.textContent = en; this.btns.replaceChildren(...b); };
    if (g.phase === "finished") {
      const won = g.data && g.data.winner === g.myId, how = g.data && g.data.outcome ? ` (${g.data.outcome})` : "";
      set(won ? `${this.foe.name}拱手：“好棋，在下佩服。”` : `${this.foe.name}拱手：“承让了。”`,
        (won ? "You win" : "You lose") + how + (won ? ". “Well played. I bow to you.”" : ". “Thank you for the game.”"),
        this.btn("离席 Leave the table", () => this.leave()));
    } else if (g.phase === "stone removal") {
      set("点目：点死子标记，双方确认后结束。", "Counting: tap dead stones to mark them, then accept.",
        this.btn("确认 Accept", () => OGSPlay.acceptScore()), this.btn("继续下 Resume", () => OGSPlay.resumePlay(), "quiet"));
    } else {
      const myTurn = g.myTurn;
      const resign = this.btn(this.resignAsk ? "确定认输？ Really resign?" : "认输 Resign", () => {
        if (this.resignAsk) { this.resignAsk = false; OGSPlay.resign(); } else { this.resignAsk = true; this.render(); setTimeout(() => { this.resignAsk = false; this.render(); }, 4000); }
      }, "quiet");
      set(myTurn ? `你执${mine.slice(0, 1)}。请落子。` : "对手思考中……",
        g.error ? g.error : myTurn ? `You play ${mine.slice(2)}. Your move.` : `You play ${mine.slice(2)}. ${this.foe.name} is thinking…`,
        ...(myTurn ? [this.btn("停一手 Pass", () => OGSPlay.move(-1, -1), "quiet")] : []), resign);
    }
    this.renderClocks();
  },
  renderClocks() {
    const g = OGSPlay.game;
    if (!g || !this.rows) return;
    const fmt = t => {
      if (!t) return "";
      const s = Math.ceil(t.byo ? t.period : t.main), m = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      return t.byo ? `${m} ×${t.periods}` : t.periods ? `${m} +${t.periods}×${Math.round(t.period)}s` : m;
    };
    const me = g.myColor || BLACK, live = g.phase === "play";
    for (const [k, color] of [["me", me], ["foe", 3 - me]]) {
      const el = this.rows[k].querySelector(".tk-table-clock");
      el.textContent = fmt(g.timeLeft(color));
      this.rows[k].classList.toggle("on", live && g.toMove() === color);
    }
  },
  click(e) {
    const g = OGSPlay.game, svg = this.svg;
    if (!g || !this.cells) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse()), { pad, cell } = this.cells;
    const c = Math.round((p.x - pad) / cell), r = Math.round((p.y - pad) / cell);
    if (c < 0 || r < 0 || c >= this.S || r >= this.S) return;
    const { grid } = this.grid();
    if (g.phase === "stone removal") {
      if (grid[r][c] !== BLACK && grid[r][c] !== WHITE) return;
      const { stones } = groupAndLiberties(grid, c, r);
      const pts = [...stones].map(k => [Math.floor(k / N), k % N]);   // keys are x*N + y
      OGSPlay.setRemoved(pts, !g.removed.has(r * N + c));
      return;
    }
    if (!g.myTurn || grid[r][c] !== EMPTY) return;
    if (!applyMove(grid, c, r, g.myColor)) return;   // no suicide; the server checks ko
    g.error = "";
    OGSPlay.move(c, r);
  },
};
