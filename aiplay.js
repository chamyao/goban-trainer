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
const AI_PRO = { lvbu: "kato", lisu: "sakata", ms_ahn: "otake", ms_jang: "kitani", dongzhuo: "chochikun", diaochan: "takemiya", caocao: "goseigen" };
// the versions of each opponent (tiers): their weights and each one's strength (OGS kyu, from the joint fit: reference
// games + head-to-head; twelve games each against its base, so about ±2 ranks apiece). "7k": run 2 (~6.6k) fine-tuned
// on the pro's games. "10k": the step-22,500 checkpoint (~12k) fine-tuned 6,000 steps the same way (24 games each
// against steps 22,500 and 35,000).
const AI_TIERS = {
  "7k": { url: pro => `engine/ownnet/pro/${pro}.bin?v=2`, rank: { lvbu: 4, ms_jang: 4, lisu: 5, ms_ahn: 6, dongzhuo: 6, caocao: 7, diaochan: 7 } },
  "10k": { url: pro => `engine/ownnet/pro10/${pro}.bin?v=1`, rank: { lvbu: 10, ms_jang: 9, lisu: 10, ms_ahn: 10, dongzhuo: 11, caocao: 10, diaochan: 10 } },
};
const aiProUrl = (who, tier = "7k") => (AI_TIERS[tier] || AI_TIERS["7k"]).url(AI_PRO[who]);

// Promotion (apo110: "a promotion system: I have to beat 6k at 3 stones 2/3 times in order to promote one rank", "no
// demotion"). You hold a rank (kyu; 0 = 1d, -1 = 2d); each game tests the next one up: against an opponent of
// strength O, a rank difference d = next - O is given as handicap (d stones from 2, Black with komi 0.5 at 1, an even
// game at 0; you never give stones). Each avatar has versions of several strengths (AI_TIERS): the one needing fewest.
// Two wins in any three games in a row promote you; no demotion. Two wins of a series of three promote you; two losses
// start a new series. Kept with the synced progress (progress.aiRank), the later copy wins.
const AIRank = {
  START: 10,
  get() { const r = loadProgress().aiRank; return r && typeof r.kyu === "number" ? r : { kyu: this.START, series: [], at: 0 }; },
  put(r) { const p = loadProgress(); r.at = Date.now(); p.aiRank = r; try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {} Sync.scheduleSave(); },
  merge(l, r) { return !r ? l : !l ? r : (r.at || 0) > (l.at || 0) ? r : l; },
  // once: apo110's loss to a misclick (2026-11-23, "can you clear the loss") comes off the series
  repair() {
    if (typeof Sync === "undefined" || Sync.username !== "apo110") return;
    const r = this.get(); if (r.fix1) return;
    const k = (r.series || []).lastIndexOf(false);
    if (k >= 0) r.series.splice(k, 1);
    r.fix1 = 1; this.put(r);
  },
  text: kyu => kyu > 0 ? `${kyu}k` : `${1 - kyu}d`,
  // the game for the next rank against an avatar (apo110: "make it so im never giving a handicap. at most I should play
  // even. otherwise play handicap at next level"): the version needing the fewest stones you take (or none); if every
  // version is weaker than the rank you're going for, an even game against the strongest
  setting(who, kyu = this.get().kyu) {
    const want = kyu - 1;
    const opts = Object.entries(AI_TIERS).map(([tier, t]) => ({ tier, d: Math.min(9, want - t.rank[who]) }));
    const take = opts.filter(o => o.d >= 0).sort((a, b) => a.d - b.d)[0] || { ...opts.sort((a, b) => b.d - a.d)[0], d: 0 };
    return { ...take, target: want };
  },
  // what the game looks like: "3 stones", "even", "you give 2"
  label({ d }) { const n = Math.abs(d); return d === 0 ? "even" : n === 1 ? (d > 0 ? "you take Black" : "you take White") : d > 0 ? `${n} stones` : `you give ${n}`; },
  // a finished game: counted once, if it tested the rank you're going for now; returns what happened
  count(S) {
    if (!S.promo || S.promo.counted || !S.result) return null;
    S.promo.counted = 1;
    const r = this.get();
    if (S.promo.target !== r.kyu - 1) return null;
    const won = S.result.winner === S.hostColor;
    // (apo110: "any 2 wins in a window of 3"): the last three games for this rank, two of them won promote you; the
    // two before the next game are kept for its window
    const win3 = [...(r.series || []), won].slice(-3);
    let out = won ? "win" : "loss";
    if (win3.filter(x => x).length >= 2) { r.kyu -= 1; r.series = []; out = "promoted"; }
    else r.series = win3.slice(-2);
    this.put(r);
    return out;
  },
};

// Teaching games (apo110: "these are meant to be teaching games, write some dialogues for the characters on good and bad
// moves"): the opponent speaks up when you find a strong move or give points away, in their own voice, with the points
// lost (not the better move: you find it yourself). Judged in points (apo110: "winrate is a bad measure here, since its handicap": with stones you're at
// 95-99% for most of the game), by the score network (ScoreEngine, kata1-b15c192) at one look, in the background:
// the lead before your move against the lead after it. A mistake: 6 points or more; a blunder: 15 or more; a strong
// move: the score network's own first choice where it wasn't obvious (under half its weight) and nothing was lost.
const AI_COACH = {
  lvbu: {
    great: [["好！竟能接我一戟！", "Ha! You parried my halberd!"], ["有点本事。", "So you've got some skill."], ["这一手，连我也要正眼看你。", "That move: now even I have to take you seriously."], ["不错！再来，让我看看你还有几招！", "Not bad! Come on, show me what else you've got!"]],
    bad: [["破绽！你的后背露出来了。", "An opening! You've left your back exposed."], ["急什么？先护住自己的阵脚。", "Why the hurry? Guard your own lines first."], ["这一手软了。战场上，软一步就是死。", "Soft. On the battlefield, one soft step is death."], ["看清我上一手在打什么主意！", "Look at what my last move was aiming at!"]],
    blunder: [["哈哈！送到我戟下来了！", "Ha! You walked right onto my halberd!"], ["这一手，够我杀个痛快！", "That move gives me a feast of a kill!"], ["下之前，先数数气！", "Count the liberties before you play!"], ["大将阵前，岂可儿戏？", "In front of the enemy's lines, no child's play!"]] },
  diaochan: {
    great: [["呀，这一手妾身倒没想到。", "Oh, I hadn't foreseen that one."], ["好手。妾身的计，被你看穿了。", "A good move. You saw through my scheme."], ["这一子落得轻巧，却最要紧。", "A light stone, yet the one that matters most."], ["您比看上去聪明得多呢。", "You're far cleverer than you look."]],
    bad: [["您被妾身引过去了。", "You followed where I led you."], ["这一手，正中妾身下怀。", "That move falls right into my plan."], ["别只看眼前的子，看全盘。", "Don't look only at the stones in front of you; see the whole board."], ["慢些。先问问自己：我刚才想要什么？", "Slowly. First ask yourself: what did I just want?"]],
    blunder: [["连环计，就差您这一环了。", "My chain of stratagems needed just this one link from you."], ["哎呀，这块棋，妾身就收下了。", "Oh my, I'll be taking that group, then."], ["美人计都不用使，您自己就送来了。", "I didn't even need my charms; you came on your own."], ["下之前，看看哪块棋还没活。", "Before you play, check which group isn't alive yet."]] },
  caocao: {
    great: [["好！天下英雄，你也算一个。", "Good! You too are one of the heroes under heaven."], ["此着深得兵法。", "That move understands the art of war."], ["孤正欲取此处，竟被你先得。", "I wanted that point myself, and you took it first."], ["有此一手，可为孤之谋士。", "With moves like that, you could be my strategist."]],
    bad: [["兵贵神速，这一手却慢了。", "Speed is the soul of war; that move was slow."], ["舍大取小，非将才也。", "Taking the small and leaving the large: not a general's move."], ["先察敌意，再落子。", "Read the enemy's intent before you place a stone."], ["此处不急，急处在别处。", "Nothing is urgent here; the urgent point is elsewhere."]],
    blunder: [["宁教我负天下人……这块棋，孤收下了。", "Better I wrong the world… I'll take this group."], ["赤壁之火，也不过如此。", "Even the fire at Red Cliffs was no worse."], ["一着失算，满盘皆输——记住了。", "One miscalculation loses the whole board. Remember it."], ["你的棋，气数已尽。", "Your stones have run out of breath."]] },
  lisu: {
    great: [["这一手，有理有据，在下佩服。", "That move stands on reason. I'm impressed."], ["连我都被说服了。", "Even I'm persuaded."], ["好棋，比我的说辞还动听。", "A fine move, better than my best speech."], ["一语中的。", "Straight to the point."]],
    bad: [["这一手，说不通啊。", "That move doesn't make its case."], ["在下劝你：先补自己的弱处。", "A word of advice: shore up your weak point first."], ["想清楚对方要什么，再开口——下棋也一样。", "Know what the other side wants before you speak. At the board too."], ["多走一步无用之棋，等于白送一城。", "A wasted move is a city given away."]],
    blunder: [["此子一出，在下不战而胜。", "With that stone, I win without a fight."], ["赤兔都没这么好送。", "Even Red Hare wasn't that easy to hand over."], ["下这一手之前，可曾问过自己的棋？", "Did you consult your own stones before playing that?"], ["一失言，满盘输。", "One slip of the tongue, and the whole board is lost."]] },
  dongzhuo: {
    great: [["哼，竟敢从咱家嘴边夺食！", "Hmph! You dare snatch food from my mouth!"], ["这一手……咱家记下了。", "That move… I'll remember it."], ["有点意思，赏你一杯酒。", "Interesting. Have a cup of wine on me."], ["好大胆子！", "What nerve!"]],
    bad: [["哈哈，咱家又多了一块肉。", "Ha! One more piece of meat for me."], ["贪多嚼不烂，这一手太贪了。", "Bite off too much and you can't chew. Too greedy."], ["你那块棋，饿着呢，先喂饱它。", "That group of yours is starving. Feed it first."], ["别急着抢，先看看谁的棋更弱。", "Don't rush to grab; see whose stones are weaker."]],
    blunder: [["顺我者昌，逆我者——这块棋就是下场！", "Cross me, and this group is how you end up!"], ["多谢多谢，咱家笑纳了。", "Many thanks. I'll gladly accept."], ["这么大一块，够咱家吃三天！", "A group this big feeds me for three days!"], ["下之前数数气，莫让咱家白捡便宜。", "Count the liberties first; don't hand me freebies."]] },
  ms_jang: {
    great: [["", "That's the move. I'd have played it too."], ["", "You read that one all the way out."], ["", "Good. That stone does two jobs."], ["", "In baduk, that's called finding the vital point."]],
    bad: [["", "My teacher used to say: before you play, look at what my last move wants."], ["", "That one's a little slow. Is there a bigger place?"], ["", "Hm. Your stones there are getting thin."], ["", "You answered where I wanted you to answer."]],
    blunder: [["", "Sorry, I have to take this."], ["", "Count the liberties. Then count them again."], ["", "That group wasn't alive yet."], ["", "One careless move undoes a lot of hard work. I know that feeling."]] },
  ms_ahn: {
    great: [["", "Good."], ["", "Correct. That's the number that works."], ["", "Efficient."], ["", "You did the homework."]],
    bad: [["", "Inefficient."], ["", "Check your weak group first."], ["", "That doesn't add up."], ["", "You're spending moves where they don't count."]],
    blunder: [["", "That's a costly error."], ["", "Read it before you play it."], ["", "I'll take it. Next time, count."], ["", "Unacceptable. Look again."]] },
};
const AICoach = {
  MISTAKE: 6, BLUNDER: 15, GAP: 3,   // (points; GAP: your moves between two remarks, but a blunder is always remarked)
  last: {}, since: 99, before: null,
  // the score network's look at the game as it stands: your lead (points) and its move weights; null if it can't
  look(g) {
    if (typeof ScoreEngine === "undefined") return null;
    const grid = g.replay().grid, sz = g.S.size, mine = g.myColor === BLACK ? 1 : -1, seq = g.S.seq;
    const board = gridToBoardState(grid).slice(0, sz).map(row => row.slice(0, sz));
    return ScoreEngine.analyze({ board, currentPlayer: g.toMove() === BLACK ? "black" : "white", moveHistory: [], komi: g.S.komi, rules: "chinese",
      visits: 1, maxTimeMs: 8000, ownershipMode: "none", topK: 1, analysisPvLen: 1, reuseTree: false }, { background: true })
      .then(a => ({ seq, lead: a.rootScoreLead * mine, policy: a.policy })).catch(() => null);
  },
  // your turn has come: read the position you're about to play in
  yourTurn(g) { if (g.S.foe && AI_COACH[g.S.foe.who] && g.S.phase === "play") this.before = this.look(g); },
  // you played (c, r) at seq: read what's left, and say something if it's worth saying
  async youPlayed(g, c, r) {
    const before = await this.before, who = g.S.foe && g.S.foe.who;
    if (!before || !who || !AI_COACH[who] || c < 0) return;
    const after = await this.look(g);
    if (!after || AIPlay.game !== g || after.seq !== before.seq + 1) return;   // (an Undo, or another game, meanwhile)
    const lost = before.lead - after.lead, sz = g.S.size, pol = before.policy || [];
    let top = -1, topP = 0;
    for (let i = 0; i < sz * sz; i++) if (pol[i] > topP) { topP = pol[i]; top = i; }
    const kind = lost >= this.BLUNDER ? "blunder" : lost >= this.MISTAKE ? "bad" : top === r * sz + c && topP < 0.5 && lost < 1 ? "great" : null;
    this.since++;
    if (!kind || (kind !== "blunder" && this.since < this.GAP)) return;
    const set = AI_COACH[who][kind]; let i = Math.floor(Math.random() * set.length);
    if (set.length > 1 && i === this.last[who + kind]) i = (i + 1) % set.length;
    this.last[who + kind] = i; this.since = 0;
    const [zh, en] = set[i];
    const note = kind === "great" ? "" : ` (about ${Math.round(lost)} points)`;   // (not where it should have gone: apo110, "dont have it give the best move after a bad one")
    if (location.hash === `#/ai/${who}` && typeof Avatars !== "undefined" && Avatars.say((zh ? `${zh} ` : "") + en + note)) this.saidAt = g.S.moves.length;
  },
  // a remark stays for the avatar's reply and goes with your next move (apo110: "make it so the dialogue just persists 1
  // or 2 moves")
  saidAt: null,
  moved(g) {
    if (this.saidAt != null && g.S.moves.length >= this.saidAt + 2) { this.saidAt = null; if (typeof Avatars !== "undefined") Avatars.say(""); }
  },
};

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
  // one game per avatar, kept with the synced progress (progress.aig: who -> {S, at}), so several go at once and each
  // follows you to another device (apo110: "the games get synced/saved too and per avatar"); at: the last change, the
  // later copy of a game wins (merge). The one game from before (gt-ai-game) moves in under its avatar.
  KEY: "gt-ai-game",
  game: null, cur: null, listeners: new Set(), thinking: false, status: "",
  all() {
    const prog = loadProgress(), aig = prog.aig || {};
    try {
      const old = JSON.parse(localStorage.getItem(this.KEY));
      if (old && old.S) {
        const k = old.S.foe ? old.S.foe.who : "_";
        if (!aig[k]) { aig[k] = { S: old.S, at: Date.now() }; prog.aig = aig; localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog)); Sync.scheduleSave(); }
        localStorage.removeItem(this.KEY);
      }
    } catch {}
    return aig;
  },
  saved(who) { const v = this.all()[who]; return v && v.S ? v : null; },
  // the games under way, newest first: [{who, S, at}]
  going() { return Object.entries(this.all()).filter(([, v]) => v && v.S && v.S.phase !== "finished").map(([who, v]) => ({ who, ...v })).sort((a, b) => b.at - a.at); },
  load(who = this.cur) {
    if (who == null) return this.game;
    const v = this.saved(who);
    // the stored copy when it's another game or newer (a sync brought another device's moves), else the one in hand
    if (!(this.game && this.cur === who && v && v.S.seq <= this.game.S.seq)) {
      this.game = v ? aiGame(v.S, { role: "host", color: v.S.hostColor, token: null }) : null;
      this.cur = who; this.status = "";
    }
    return this.game;
  },
  persist() {
    if (!this.game || this.cur == null) return;
    const prog = loadProgress(); (prog.aig || (prog.aig = {}))[this.cur] = { S: this.game.S, at: Date.now() };
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog)); } catch {}
    Sync.scheduleSave();
  },
  // two copies of the games (Sync.mergeInto): per avatar, the later change
  merge(l, r) {
    const o = { ...(l || {}) };
    for (const [k, v] of Object.entries(r || {})) if (v && (!o[k] || (v.at || 0) > (o[k].at || 0))) o[k] = v;
    return o;
  },
  emit() { for (const f of this.listeners) f(); },
  start({ size = 19, foe }) {
    const st = AIRank.setting(foe.who), n = Math.abs(st.d);
    // the weaker side takes Black: you when d > 0, the avatar when you give the stones; an even game, by lot
    const hostColor = st.d > 0 ? BLACK : st.d < 0 ? WHITE : (Math.random() < .5 ? BLACK : WHITE);
    const S = FriendPlay.fresh({ size, T: null, hostColor, names: { [hostColor]: Sync.username || "You" }, listed: false });
    if (n >= 2) { S.setup = AI_HANDICAP(n); S.komi = 0.5; }   // stones for Black, White moves first
    else if (n === 1) S.komi = 0.5;
    S.phase = "play"; S.level = "strong"; S.foe = foe; S.tier = st.tier;
    S.promo = { target: st.target, d: st.d };
    this.game = aiGame(S, { role: "host", color: hostColor, token: null }); this.cur = foe.who; this.status = "";
    this.persist();
    location.hash = `#/ai/${this.cur}`;
    this.maybeAI();
  },
  change(fn) {
    const S = this.game.S, was = S.phase;
    fn(S); S.seq++;
    if (was !== "finished" && S.phase === "finished") {
      const out = AIRank.count(S), r = AIRank.get();
      if (out) this.status = out === "promoted" ? `Promoted to ${AIRank.text(r.kyu)}!` :
        `${out === "win" ? "A win" : "A loss"} toward ${AIRank.text(r.kyu - 1)} (last games: ${(r.series || []).map(x => x ? "W" : "L").join(" ")}).`;
    }
    this.persist(); this.emit();
  },
  play(c, r) {
    this.change(S => {
      S.moves.push([c, r]);
      const n = S.moves.length;
      if (n >= 2 && S.moves[n - 1][0] < 0 && S.moves[n - 2][0] < 0) { S.phase = "stone removal"; S.removed = []; S.accepted = {}; }
    });
    AICoach.moved(this.game);
    if (this.game.S.phase === "stone removal") this.markDead();
  },
  // two passes: the score network (ScoreEngine, app.js) marks the dead stones; you can change its marks, then accept
  async markDead() {
    const g = this.game, seq = g.S.seq;
    this.status = "Marking dead stones…"; this.emit();
    try {
      const grid = g.replay().grid, sz = g.S.size;
      const board = gridToBoardState(grid).slice(0, sz).map(row => row.slice(0, sz));
      const a = await ScoreEngine.analyze({ board, currentPlayer: g.toMove() === BLACK ? "black" : "white", moveHistory: [], komi: g.S.komi,
        rules: "chinese", visits: 16, maxTimeMs: 8000, ownershipMode: "root", topK: 1, analysisPvLen: 1, reuseTree: false });   // (a settled position: a few visits do)
      if (this.game !== g || g.S.phase !== "stone removal" || g.S.seq !== seq) return;   // (you marked or went on meanwhile)
      const dead = ScoreEngine.dead(grid, a.ownership || []);
      this.status = dead.length ? "Dead stones marked: tap a group to change, then accept." : "No dead stones: accept the score, or tap to mark.";
      this.change(S => { S.removed = dead; });
    } catch (e) { console.error("[ai] marking", e); if (this.game === g) { this.status = "Mark the dead stones, then accept."; this.emit(); } }
  },

  // what playGame calls
  move(c, r) {
    const g = this.game;
    if (this.thinking || !g.myTurn || !g.legal(c, r)) { g.error = c >= 0 && g.myTurn && !this.thinking ? "Not there (a ko must wait a move)." : ""; return this.emit(); }
    g.error = "";
    this.play(c, r);
    AICoach.youPlayed(g, c, r);
    this.maybeAI();
  },
  // take back your last move, and the avatar's reply after it (apo110: "i lost a promotion match due to misclick ...
  // add an undo button"); while it thinks, its move is dropped (maybeAI checks seq)
  canUndo() { const g = this.game; return !!g && g.S.phase === "play" && g.S.moves.some((_, k) => g.colorOf(k) === g.myColor); },
  undo() {
    const g = this.game; if (!this.canUndo()) return;
    let k = g.S.moves.length - 1;
    while (k >= 0 && g.colorOf(k) !== g.myColor) k--;
    this.status = ""; this.change(S => { S.moves.splice(k); S.undo = null; });
    AICoach.yourTurn(g);
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
    const seq0 = g.S.seq;   // (the position it's answering: an Undo meanwhile drops its move)
    // a moment before it plays, as a person would (apo110: "the instant play is kind of jarring"): 1-2.5 s, a little
    // longer in the middle game, the search's own time counted in
    const think = 1000 + Math.random() * 1500 + (g.S.moves.length > 20 && g.S.moves.length < 200 ? 500 : 0);
    try {
      const grid = g.replay().grid;
      const board = gridToBoardState(grid).slice(0, sz).map(row => row.slice(0, sz));
      const hist = [];
      // (passes too, as x -1: the network's pass sense needs them)
      g.S.moves.slice(-6).forEach(([c, r], i, arr) => { const k = g.S.moves.length - arr.length + i; hist.push({ x: c >= 0 ? c : -1, y: c >= 0 ? r : -1, player: g.colorOf(k) === WHITE ? "white" : "black" }); });
      const a = own ? await OwnPlay.analyze(g, grid, me, pro ? aiProUrl(foe.who, g.S.tier) : undefined) : await Engine.analyze({ board, currentPlayer: me === BLACK ? "black" : "white", moveHistory: hist, komi: g.S.komi, rules: "chinese",
        visits: 1, topK: 1, ownershipMode: "none", analysisPvLen: 1, reuseTree: false });
      if (this.game !== g || g.phase !== "play" || g.S.seq !== seq0) return;   // (taken back meanwhile: Undo)
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
      if (this.game !== g || g.phase !== "play" || g.S.seq !== seq0) return;
      this.status = pick ? "" : `${foe ? foe.name : "KataGo"} passes.`;
      this.play(pick ? pick.x : -1, pick ? pick.y : -1);
      if (g.myTurn) AICoach.yourTurn(g);
    } catch (e) {
      console.error("[ai]", e);
      this.status = `${g.S.foe ? g.S.foe.name : (AI_LEVELS[g.S.level] || {}).own ? "Our AI" : "KataGo"} couldn't move: ` + (e.message || e) + " (tap Retry)";
      g.error = "";
    } finally {
      this.thinking = false; this.emit();
      if (this.game && (this.game !== g || g.S.seq !== seq0)) setTimeout(() => this.maybeAI());   // (another game meanwhile, or an Undo: its turn?)
    }
  },
};

// the panel in the Play tab: your rank and promotion series, and the seven opponents, each with its own game (one at a
// time per avatar, several at once). The handicap and colour come from your rank (AIRank.setting): pick an avatar.
function aiLobby() {
  AIRank.repair();
  const games = AIPlay.all(), r = AIRank.get(), next = AIRank.text(r.kyu - 1);
  const going = who => { const v = games[who]; return v && v.S && v.S.phase !== "finished" ? v.S : null; };
  const cast = h("div", { class: "ai-foes" });
  let foe = null;
  const startBtn = h("button", { class: "primary", onclick: () => {
    if (!foe) return;
    if (going(foe.who)) { location.hash = `#/ai/${foe.who}`; return; }
    AIPlay.start({ foe });
  } }, "Start a game");
  const overBtn = h("button", { onclick: () => {
    if (foe && confirm(`Drop your game against ${foe.name} and start a new one?`)) AIPlay.start({ foe });
  } }, "New game instead");
  const pick = () => {
    const S = foe && going(foe.who);
    startBtn.disabled = !foe;
    startBtn.textContent = S ? `Resume vs ${foe.name}` : foe ? `Play ${foe.name}: ${AIRank.label(AIRank.setting(foe.who))}` : "Start a game";
    overBtn.hidden = !S;
  };
  pick();
  if (typeof Avatars !== "undefined") Promise.all(Object.keys(AI_PRO).map(who => Avatars.faceOf(who))).then(faces => {
    for (const f of faces) {
      const mine = Avatars.owns(f.who), S = mine && going(f.who);
      const el = h("button", { class: `ai-foe${mine ? "" : " ai-foe-locked"}`, ...(mine ? { title: f.name } : {}) },
        [f.src ? h("img", { src: f.src, alt: "" }) : "", mine ? h("b", {}, f.name) : h("b", {}, "\u00a0"),
         mine ? h("small", { class: "ai-foe-rank" }, S ? `move ${S.moves.length + 1}` : AIRank.label(AIRank.setting(f.who))) : ""]);
      if (S) el.classList.add("ai-foe-going");
      if (mine) el.onclick = () => { foe = foe && foe.who === f.who ? null : f; cast.querySelectorAll(".ai-foe").forEach(b => b.classList.toggle("on", b === el && !!foe)); pick(); };
      else el.disabled = true;
      cast.append(el);
    }
  }).catch(() => {});
  const old = going("_");   // a game against a strength level, from before the avatars
  const marks = (r.series || []).map(x => h("span", { class: x ? "ai-w" : "ai-l" }, x ? "W" : "L"));
  return h("div", { class: "sgf-loader ai-lobby" }, [
    h("div", { class: "cat-title" }, "Play an avatar"),
    h("div", { class: "ai-rank" }, [h("b", {}, `Your rank: ${AIRank.text(r.kyu)}`), ` · promotion to ${next}: 2 wins in any 3 games `, ...marks]),
    cast,
    h("div", { class: "row" }, [startBtn, overBtn, old ? h("button", { onclick: () => { location.hash = "#/ai/_"; } }, "Resume your earlier game") : ""]),
  ]);
}

function viewAI() {
  crumbs.textContent = "";
  root.textContent = "";
  const P = AIPlay, wrap = h("div", { class: "play" });
  root.append(wrap);
  P.listeners.clear();
  const who = decodeURIComponent((location.hash.split("/")[2] || "")) || P.cur || (P.going()[0] || {}).who;
  if (!who || !P.load(who)) { location.hash = "#/play"; return; }
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
  if (P.game.myTurn && P.game.S.phase === "play") AICoach.yourTurn(P.game);   // (yours: the coach reads it)
}
