/* ================= xiangqi (Chinese chess), with a friend (apo110: "for host a game can you also add a xiangqi option") =================
   A friend game like go's (FriendPlay: a link, two browsers, the same clocks, resign and rematch), its state marked
   S.kind = "xiangqi" and its moves [fromRow, fromCol, toRow, toCol]. Red moves first: the friend game's first player
   (BLACK in its numbering) is Red. The rules are checked: each piece's moves (the general and advisors in the palace,
   elephants not across the river and blocked at the eye, the horse blocked at its leg, the cannon capturing over one
   screen, soldiers sideways once across the river), the generals never facing on an open file, and no move that
   leaves your own general in check. A side with no legal move loses (checkmate or stalemate, as xiangqi has it).
   Not judged: perpetual check and chasing (the players agree). Loaded before app.js; used at run time only. */
const Xiangqi = (() => {
  const ROWS = 10, COLS = 9;
  // board[r][c]: "" or side + piece: side r (Red, rows 5-9, moving up) or b (Black, rows 0-4); pieces K A E H R C P
  function initial() {
    const back = ["R", "H", "E", "A", "K", "A", "E", "H", "R"];
    const b = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
    back.forEach((p, c) => { b[0][c] = "b" + p; b[9][c] = "r" + p; });
    b[2][1] = b[2][7] = "bC"; b[7][1] = b[7][7] = "rC";
    for (const c of [0, 2, 4, 6, 8]) { b[3][c] = "bP"; b[6][c] = "rP"; }
    return b;
  }
  const inside = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  const palace = (side, r, c) => c >= 3 && c <= 5 && (side === "r" ? r >= 7 : r <= 2);
  const ownHalf = (side, r) => side === "r" ? r >= 5 : r <= 4;
  const other = s => s === "r" ? "b" : "r";

  // the moves a piece could make, ignoring check
  function pseudo(b, r, c) {
    const p = b[r][c]; if (!p) return [];
    const side = p[0], kind = p[1], out = [];
    const add = (r2, c2) => { if (inside(r2, c2) && (!b[r2][c2] || b[r2][c2][0] !== side)) out.push([r, c, r2, c2]); };
    if (kind === "K") for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (palace(side, r + dr, c + dc)) add(r + dr, c + dc); }
    else if (kind === "A") for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { if (palace(side, r + dr, c + dc)) add(r + dr, c + dc); }
    else if (kind === "E") for (const [dr, dc] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
      const r2 = r + dr, c2 = c + dc;
      if (inside(r2, c2) && ownHalf(side, r2) && !b[r + dr / 2][c + dc / 2]) add(r2, c2);   // the eye must be empty
    }
    else if (kind === "H") for (const [dr, dc, lr, lc] of [[2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0], [1, 2, 0, 1], [-1, 2, 0, 1], [1, -2, 0, -1], [-1, -2, 0, -1]]) {
      if (inside(r + lr, c + lc) && !b[r + lr][c + lc]) add(r + dr, c + dc);   // the leg must be empty
    }
    else if (kind === "R" || kind === "C") for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let r2 = r + dr, c2 = c + dc, screened = false;
      while (inside(r2, c2)) {
        const q = b[r2][c2];
        if (kind === "R") { if (!q) out.push([r, c, r2, c2]); else { if (q[0] !== side) out.push([r, c, r2, c2]); break; } }
        else if (!screened) { if (!q) out.push([r, c, r2, c2]); else screened = true; }
        else if (q) { if (q[0] !== side) out.push([r, c, r2, c2]); break; }
        r2 += dr; c2 += dc;
      }
    }
    else if (kind === "P") {
      const fwd = side === "r" ? -1 : 1;
      add(r + fwd, c);
      if (!ownHalf(side, r)) { add(r, c - 1); add(r, c + 1); }   // across the river: sideways too
    }
    return out;
  }
  const apply = (b, m) => { const n = b.map(row => row.slice()); n[m[2]][m[3]] = n[m[0]][m[1]]; n[m[0]][m[1]] = ""; return n; };
  const find = (b, piece) => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (b[r][c] === piece) return [r, c]; return null; };
  // side's general attacked (or facing the other general on an open file)
  function inCheck(b, side) {
    const k = find(b, side + "K"), k2 = find(b, other(side) + "K");
    if (!k) return true;
    if (k2 && k[1] === k2[1]) {
      let open = true;
      for (let r = Math.min(k[0], k2[0]) + 1; r < Math.max(k[0], k2[0]); r++) if (b[r][k[1]]) { open = false; break; }
      if (open) return true;
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p || p[0] === side || p[1] === "K") continue;
      if (pseudo(b, r, c).some(m => m[2] === k[0] && m[3] === k[1])) return true;
    }
    return false;
  }
  function legal(b, side) {
    const out = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (!b[r][c] || b[r][c][0] !== side) continue;
      for (const m of pseudo(b, r, c)) if (!inCheck(apply(b, m), side)) out.push(m);
    }
    return out;
  }
  // the position after the moves; side to move: Red after an even count
  function replay(moves) { let b = initial(); for (const m of moves) b = apply(b, m); return b; }
  const sideToMove = moves => moves.length % 2 === 0 ? "r" : "b";
  const NAMES = { rK: "帥", rA: "仕", rE: "相", rH: "傌", rR: "俥", rC: "炮", rP: "兵", bK: "將", bA: "士", bE: "象", bH: "馬", bR: "車", bC: "砲", bP: "卒" };
  return { ROWS, COLS, initial, pseudo, apply, inCheck, legal, replay, sideToMove, NAMES };
})();

// the friend game's colors: its first player (BLACK) is Red
const xqSide = color => color === BLACK ? "r" : "b";

// the board and its panel, as playGame draws go's (P: FriendPlay)
let xqSel = null;   // the piece picked up: [r, c]
function xqGame(g, P) {
  const S = g.S, moves = S.moves, b = Xiangqi.replay(moves), toMove = Xiangqi.sideToMove(moves);
  const me = g.myColor ? xqSide(g.myColor) : null, flip = me === "b";
  const mine = g.phase === "play" && me === toMove;
  const legal = mine ? Xiangqi.legal(b, me) : [];
  if (xqSel && !(mine && b[xqSel[0]][xqSel[1]] && b[xqSel[0]][xqSel[1]][0] === me)) xqSel = null;
  const last = moves[moves.length - 1];
  const check = g.phase === "play" && Xiangqi.inCheck(b, toMove);
  // drawing: 9 x 10 points, 60 apart, a margin of 45; Black's side up (Red's, for Black)
  const D = 60, M = 45, W = M * 2 + D * 8, H = M * 2 + D * 9;
  const X = c => M + D * (flip ? 8 - c : c), Y = r => M + D * (flip ? 9 - r : r);
  const ns = "http://www.w3.org/2000/svg", el = (n, a, kids = []) => { const e = document.createElementNS(ns, n); for (const k in a) e.setAttribute(k, a[k]); kids.forEach(k => e.append(k)); return e; };
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "xq-board", role: "img", "aria-label": "Xiangqi board" });
  svg.append(el("rect", { x: 0, y: 0, width: W, height: H, rx: 12, class: "xq-wood" }));
  const lines = [];
  for (let r = 0; r < 10; r++) lines.push(`M${X(0)} ${Y(r)}H${X(8)}`);
  for (let c = 0; c < 9; c++) {
    if (c === 0 || c === 8) lines.push(`M${X(c)} ${Y(0)}V${Y(9)}`);
    else { lines.push(`M${X(c)} ${Y(0)}V${Y(4)}`, `M${X(c)} ${Y(5)}V${Y(9)}`); }   // the river breaks the files
  }
  lines.push(`M${X(3)} ${Y(0)}L${X(5)} ${Y(2)}M${X(5)} ${Y(0)}L${X(3)} ${Y(2)}`, `M${X(3)} ${Y(7)}L${X(5)} ${Y(9)}M${X(5)} ${Y(7)}L${X(3)} ${Y(9)}`);
  svg.append(el("path", { d: lines.join(""), class: "xq-lines" }));
  const riverY = (Y(4) + Y(5)) / 2 + 9;
  svg.append(el("text", { x: X(2), y: riverY, class: "xq-river", "text-anchor": "middle" }), el("text", { x: X(6), y: riverY, class: "xq-river", "text-anchor": "middle" }));
  svg.lastChild.previousSibling.textContent = flip ? "漢 界" : "楚 河"; svg.lastChild.textContent = flip ? "楚 河" : "漢 界";
  if (last) for (const [r, c] of [[last[0], last[1]], [last[2], last[3]]]) svg.append(el("rect", { x: X(c) - 28, y: Y(r) - 28, width: 56, height: 56, rx: 8, class: "xq-last" }));
  const targets = xqSel ? legal.filter(m => m[0] === xqSel[0] && m[1] === xqSel[1]) : [];
  const play = m => { xqSel = null; P.xqMove(m); };
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
    const p = b[r][c], t = targets.find(m => m[2] === r && m[3] === c);
    if (p) {
      const pick = mine && p[0] === me;
      const gp = el("g", { class: `xq-piece xq-${p[0]}${pick ? " xq-mine" : ""}${xqSel && xqSel[0] === r && xqSel[1] === c ? " xq-sel" : ""}${check && p === toMove + "K" ? " xq-check" : ""}${t ? " xq-take" : ""}`, transform: `translate(${X(c)} ${Y(r)})` }, [
        el("circle", { r: 26 }), el("circle", { r: 21, class: "xq-ring" }), el("text", { y: 9, "text-anchor": "middle" })]);
      gp.lastChild.textContent = Xiangqi.NAMES[p];
      gp.addEventListener("click", () => { if (t) return play(t); if (pick) { xqSel = xqSel && xqSel[0] === r && xqSel[1] === c ? null : [r, c]; P.emit(); } });
      svg.append(gp);
    } else if (t) {
      const dot = el("circle", { cx: X(c), cy: Y(r), r: 9, class: "xq-dot" });
      const hit = el("circle", { cx: X(c), cy: Y(r), r: 28, class: "xq-hit" });
      hit.addEventListener("click", () => play(t));
      svg.append(dot, hit);
    }
  }
  const boardCard = h("div", { class: "board-card xq-card" }, [svg]);

  const row = color => {
    const side = xqSide(color), p = g.player(color), on = g.phase === "play" && toMove === side;
    const el2 = h("div", { class: `pl-row${on ? " to-move" : ""}` }, [h("span", { class: `xq-dotside xq-${side}` }), h("span", { class: "pl-name" }, `${side === "r" ? "Red" : "Black"} · ${p.username || "…"}${color === g.myColor ? " (you)" : ""}`), h("div", { class: "pl-clock" }, fmtClock(g.timeLeft(color)))]);
    el2.color = color; return el2;
  };
  const rows = [row(BLACK), row(WHITE)];
  clearInterval(playTicker);
  playTicker = setInterval(() => {
    if (!svg.isConnected) return clearInterval(playTicker);
    for (const rw of rows) { const t = g.timeLeft(rw.color); rw.lastChild.textContent = fmtClock(t); rw.lastChild.classList.toggle("low", !!t && t.byo && t.period < 10); }
  }, 250);
  const status = h("div", { class: "meta-sub" },
    g.phase === "finished" ? g.resultText()
    : g.phase === "play" ? (mine ? (check ? "Check! Your move." : xqSel ? "Choose where it goes." : "Your move: tap a piece.") : g.myColor ? (check ? "You gave check. Their move." : "Their move.") : "Watching.")
    : "");
  const buttons = [];
  if (g.phase === "play" && g.myColor) buttons.push(h("button", { onclick: () => { if (confirm("Resign this game?")) P.resign(); } }, "Resign"));
  else if (g.phase === "finished") {
    buttons.push(h("button", { onclick: () => { P.game = null; location.hash = "#/play"; } }, "Back to lobby"));
    if (P.finishedButtons) buttons.unshift(...P.finishedButtons(g));
  }
  const aside = h("aside", {}, [
    h("div", { class: "panel" }, [h("h2", {}, `Xiangqi · ${S.code}`), ...rows, status, h("div", { class: "err" }, g.error || ""), g.extra ? g.extra() : ""]),
    buttons.length ? h("div", { class: "panel" }, [h("div", { class: "rv-actions" }, buttons)]) : "",
  ]);
  return [h("div", { class: "review xq" }, [boardCard, aside])];
}
