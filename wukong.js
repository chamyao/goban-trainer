/* Sun Wukong: a chibi pixel-art Monkey King who runs around the page,
   jumping and climbing onto its boxes (panels, book cards, the board,
   buttons). He lives on a fixed canvas that ignores the pointer, so he
   never gets in the way; the 🐒 button in the header hides him. */
// Chibi Monkey King, assembled per frame from parts so the whole body moves:
// head bob/lean, torso squash, legs, a swinging staff and a tail that
// follows. Everything is drawn at 1 px = 1 sprite pixel on a 44×44 canvas
// (feet at x=22, y=42), then scaled up without smoothing.
const WK = (() => {
  const PAL = {
    k: "#2a1c14", y: "#f7c51f", o: "#d9930b", g: "#86d0b8", G: "#4b9f88",
    w: "#ffffff", r: "#e2461d", e: "#2f9e43", b: "#161616", n: "#b0602e",
    p: "#f08a78", c: "#e8604c", L: "#d9461a", s: "#c8351a", h: "#f3d2a2",
  };
  const HEAD = [
    "...............gg.....",
    "..............gGg.....",
    ".......kkkkkkkGgk.....",
    ".....kkyyyyyyyyyykk...",
    "....kyyyyyyyyyyyyyyk..",
    "...kyyyyyyyyyyyyyyyyk.",
    "...kggggggggggggggggk.",
    "..kyGGGGGGGGGGGGGGGGk.",
    "..knyyeewwwwwwweewwyk.",
    ".knnyeerrwwwwwrreerwk.",
    ".knnyrrrrwwwwwrrrrrrk.",
    ".knnyrrbbrwwwrrbbrrrk.",
    "..kyyrrbwrwwwrrbwrrwk.",
    "..kyywrrrwwwwwrrrwwwk.",
    "...kywwwwwwwwwwwwwwk..",
    "...kyywwwwwppwwwwwk...",
    "....kkywwwwwwwwwkk....",
    "......kkkkkkkkkk......",
  ];
  // Eyes shut (blink): rows 11–12 replaced.
  const HEAD_BLINK = HEAD.map((r, i) => i === 11 ? ".knnyrrrrrwwwrrrrrrrk." : i === 12 ? "..kyyrkkkrwwwrkkkrrwk." : r);
  // Knocked out: X eyes.
  const HEAD_X = HEAD.map(r => r.split(""));
  for (const [cx, cy] of [[7, 11], [15, 11]]) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = cx + dx, y = cy + dy;
      if (HEAD_X[y][x] === "b" || HEAD_X[y][x] === "w") HEAD_X[y][x] = "r";
      if (Math.abs(dx) === Math.abs(dy)) HEAD_X[y][x] = "k";
    }
  }
  for (let i = 0; i < HEAD_X.length; i++) HEAD_X[i] = HEAD_X[i].join("");
  // Back of the head, for climbing.
  const HEAD_BACK = HEAD.map((r, i) => i < 8 ? r : i < 16 ? r.replace(/[wrebp]/g, "y").replace(/n/g, "n") : r);
  const TORSO = [
    "..kGgggggGk..",
    ".kyyyyyyyyyk.",
    "knyyyyoyyyyyn",
    ".kcwcbcwcbck.",
    "kwcbcwcbcwcbk",
    ".wkwkwkwkwkw.",
  ];
  const TORSO_SQUASH = [
    "..kGgggggGk..",
    "knyyyyoyyyyyn",
    "kwcbcwcbcwcbk",
    "wkwkwkwkwkwkw",
  ];
  // Legs: [x, y] offsets of each leg's hip→knee→foot from the hip line,
  // drawn as 2-px-wide red limbs with a black boot.
  const LEGS = {
    stand:  [[[-2, 0], [-2, 2], [-2, 4]], [[2, 0], [2, 2], [2, 4]]],
    contact:[[[-1, 0], [-3, 2], [-5, 3]], [[2, 0], [4, 2], [6, 4]]],    // front leg reaching
    down:   [[[-1, 0], [-2, 2], [-3, 3]], [[1, 0], [2, 2], [2, 3]]],    // weight on front, knees bent
    pass:   [[[0, 0], [1, 2], [-1, 3]], [[1, 0], [0, 2], [1, 4]]],      // legs crossing
    up:     [[[1, 0], [-1, 1], [-4, 0]], [[1, 0], [3, 2], [3, 4]]],     // back leg kicked up
    tuck:   [[[-1, 0], [1, 1], [-1, 2]], [[1, 0], [4, 1], [2, 2]]],
    stretch:[[[-1, 0], [-3, 2], [-4, 5]], [[2, 0], [3, 3], [3, 5]]],
    crouch: [[[-2, 0], [-5, 1], [-4, 2]], [[2, 0], [5, 1], [4, 2]]],
    climbA: [[[-2, 0], [-4, -1], [-4, 1]], [[2, 0], [2, 2], [2, 4]]],
    climbB: [[[-2, 0], [-2, 2], [-2, 4]], [[2, 0], [4, -1], [4, 1]]],
  };
  // Frames: head (which, dx, dy), torso (which, dy), legs, staff (angle in
  // degrees from horizontal, grip offset), tail wave phase.
  const F = (o) => Object.assign({ head: "HEAD", hx: 0, hy: 0, torso: "TORSO", ty: 0, legs: "stand", staff: { a: 80, gx: 6, gy: -7 }, tail: 0 }, o);
  const FRAMES = {
    idle: [
      F({}), F({ hy: 0, ty: 0 }), F({ hy: 1, ty: 0 }), F({ hy: 1 }),
      F({ head: "HEAD_BLINK", hy: 1 }), F({}),
    ],
    twirl: [0, 45, 90, 135, 180, 225, 270, 315, 0, 45, 90, 135, 180, 225, 270, 315].map((a, i) =>
      F({ staff: { a: a, gx: 6, gy: -8, mid: true }, hy: i % 2, hx: i % 4 < 2 ? 0 : 1 })),
    run: [
      F({ legs: "contact", hx: 1, hy: 0, ty: 0, staff: { a: 35, gx: 7, gy: -7 }, tail: 0 }),
      F({ legs: "down", hx: 1, hy: 2, ty: 1, torso: "TORSO", staff: { a: 25, gx: 7, gy: -6 }, tail: 1 }),
      F({ legs: "pass", hx: 2, hy: 1, ty: 0, staff: { a: 30, gx: 7, gy: -7 }, tail: 2 }),
      F({ legs: "up", hx: 2, hy: -1, ty: -2, staff: { a: 45, gx: 7, gy: -9 }, tail: 3 }),
      F({ legs: "contact", hx: 1, hy: -1, ty: -1, staff: { a: 40, gx: 7, gy: -8 }, tail: 4 }),
      F({ legs: "down", hx: 1, hy: 2, ty: 1, staff: { a: 28, gx: 7, gy: -6 }, tail: 5 }),
    ],
    crouch: [F({ legs: "crouch", torso: "TORSO_SQUASH", hy: 2, hx: 1, staff: { a: 20, gx: 7, gy: -5 } })],
    rise: [F({ legs: "tuck", ty: -2, hy: -2, staff: { a: 0, gx: 0, gy: -26, mid: true }, tail: 6 })],
    fall: [F({ legs: "stretch", ty: 0, hy: -1, hx: 1, staff: { a: 60, gx: 7, gy: -10 }, tail: 7 })],
    land: [F({ legs: "crouch", torso: "TORSO_SQUASH", hy: 3, hx: 1, staff: { a: 12, gx: 7, gy: -5 } })],
    dead: [F({ head: "HEAD_X", legs: "stretch", staff: null, tail: 0 })],
    // Wind up over the shoulder, lunge, swing flat through, follow through.
    point: [F({ legs: "stand", hx: 1, staff: { a: -28, gx: 4, gy: -6 }, tail: 1 })],
    whack: [
      F({ legs: "stand", hx: -1, staff: { a: 110, gx: 3, gy: -11, behind: true }, tail: 2 }),
      F({ legs: "pass", hx: -2, hy: 1, ty: 0, staff: { a: 150, gx: 1, gy: -13, behind: true }, tail: 3 }),
      F({ legs: "contact", hx: 3, hy: 1, staff: { a: 8, gx: 9, gy: -6 }, tail: 5, swoosh: true }),
      F({ legs: "contact", hx: 3, hy: 2, staff: { a: -18, gx: 9, gy: -4 }, tail: 6 }),
      F({ legs: "down", hx: 2, hy: 1, staff: { a: -10, gx: 8, gy: -5 }, tail: 7 }),
      F({ legs: "stand", hx: 1, staff: { a: 30, gx: 7, gy: -7 }, tail: 0 }),
    ],
    climb: [
      F({ head: "HEAD_BACK", legs: "climbA", ty: 0, hy: 0, staff: null, arms: "AL" }),
      F({ head: "HEAD_BACK", legs: "climbA", ty: -1, hy: -1, staff: null, arms: "AL" }),
      F({ head: "HEAD_BACK", legs: "climbB", ty: 0, hy: 0, staff: null, arms: "AR" }),
      F({ head: "HEAD_BACK", legs: "climbB", ty: -1, hy: -1, staff: null, arms: "AR" }),
    ],
  };
  const PARTS = { HEAD, HEAD_BLINK, HEAD_BACK, HEAD_X, TORSO, TORSO_SQUASH };

  function blit(g, rows, x0, y0) {
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === "." || !PAL[ch]) return;
      g.fillStyle = PAL[ch]; g.fillRect(x0 + x, y0 + y, 1, 1);
    }));
  }
  function line(g, x0, y0, x1, y1, col) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
      g.fillStyle = typeof col === "function" ? col(i, n) : col; g.fillRect(x, y, 1, 1);
    }
  }
  function limb(g, hipX, hipY, pts, col) {
    let px = hipX + pts[0][0], py = hipY + pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const x = hipX + pts[i][0], y = hipY + pts[i][1];
      line(g, px, py, x, y, PAL.k); line(g, px + 1, py, x + 1, y, col);
      px = x; py = y;
    }
    g.fillStyle = PAL.b; g.fillRect(px - 1, py, 3, 2);  // boot
  }
  // Draw one frame onto a 44×44 context, facing right.
  function render(g, frame, t) {
    const FX = 22, FY = 42;
    const torso = PARTS[frame.torso], head = PARTS[frame.head];
    const legs = LEGS[frame.legs];
    // Feet on the ground: the lowest boot ends at FY. In the air (rise/fall)
    // the whole figure just shifts with ty.
    const lowest = Math.max(...legs.flat().map(p => p[1]));
    const hipY = FY - 2 - lowest + Math.min(0, frame.ty);
    const torsoY = hipY - torso.length + 1;
    // Tail behind everything: a pixel curve that waves with the stride.
    const ph = frame.tail * 1.05 + t / 220;
    let tx = FX - 5, ty = torsoY + 4;
    for (let i = 0; i < 9; i++) {
      const nx = FX - 6 - i, ny = torsoY + 4 - Math.round(i * 0.9) + Math.round(Math.sin(ph + i * 0.6) * 1.5);
      line(g, tx, ty, nx, ny, PAL.n); tx = nx; ty = ny;
    }
    if (frame.staff && frame.staff.behind) drawStaff(g, frame, FX, torsoY);
    if (frame.legs.startsWith("climb")) {
      limb(g, FX, hipY, legs[0], PAL.L); limb(g, FX, hipY, legs[1], PAL.L);
    } else {
      limb(g, FX - 1, hipY, legs[0], "#a8341a");  // far leg, darker
      limb(g, FX + 1, hipY, legs[1], PAL.L);
    }
    blit(g, torso, FX - 6, torsoY);
    const headY = torsoY - head.length + 1 + frame.hy;
    blit(g, head, FX - 11 + frame.hx, headY);
    if (frame.arms) {  // climbing: one arm up, one lower, brown hands
      const up = frame.arms === "AL" ? -1 : 1;
      g.fillStyle = PAL.y;
      line(g, FX - 6, torsoY + 1, FX - 8, torsoY - (up < 0 ? 9 : 4), PAL.y);
      line(g, FX + 6, torsoY + 1, FX + 8, torsoY - (up > 0 ? 9 : 4), PAL.y);
      g.fillStyle = PAL.n;
      g.fillRect(FX - 9, torsoY - (up < 0 ? 11 : 6), 2, 2);
      g.fillRect(FX + 8, torsoY - (up > 0 ? 11 : 6), 2, 2);
    }
    if (frame.staff && !frame.staff.behind) drawStaff(g, frame, FX, torsoY);
    if (frame.swoosh) {  // motion arc in front of the strike
      g.fillStyle = "rgba(255,247,214,0.9)";
      for (let i = 0; i < 9; i++) {
        const ang = -1.2 + i * 0.3;
        g.fillRect(Math.round(FX + 10 + Math.cos(ang) * 12), Math.round(torsoY + 3 + Math.sin(ang) * 12), 1, 1);
        if (i % 2) g.fillRect(Math.round(FX + 10 + Math.cos(ang) * 10), Math.round(torsoY + 3 + Math.sin(ang) * 10), 1, 1);
      }
    }
  }
  function drawStaff(g, frame, FX, torsoY) {
    {
      const s = frame.staff, gx = FX + s.gx, gy = torsoY + 2 + (s.gy + 7);
      const a = s.a * Math.PI / 180, L = 22;
      const back = s.mid ? L / 2 : 4;  // grip near the end, or the middle when twirling/overhead
      const x0 = gx - Math.cos(a) * back, y0 = gy + Math.sin(a) * back;
      const x1 = gx + Math.cos(a) * (L - back), y1 = gy - Math.sin(a) * (L - back);
      line(g, x0, y0, x1, y1, (i, n) => i < 2 || i > n - 2 ? PAL.y : PAL.s);
      g.fillStyle = PAL.n; g.fillRect(Math.round(gx) - 1, Math.round(gy) - 1, 2, 2);  // hand
    }
  }
  const drawHead = (g, x = 0, y = 0) => blit(g, HEAD, x, y);
  return { PAL, FRAMES, render, drawHead, SIZE: 44 };
})();

(() => {
  const KEY = "gt-wukong";
  const scale = () => (innerWidth < 700 ? 2 : 3);
  const GRAV = 0.9, RUN = 2.8, CLIMB_SPEED = 1.6;
  let cv, g, buf, bg, raf = 0, last = 0;
  const m = { x: 80, y: 0, vx: RUN, vy: 0, on: null, state: "fall", left: false, t: 0, anim: "fall", animT: 0,
              until: 0, plan: null, climbTo: null, jumpTo: null };
  const set = (anim, state) => { if (m.anim !== anim) { m.anim = anim; m.animT = 0; } if (state) m.state = state; };

  // Platforms: the top edges of visible boxes, in viewport coordinates.
  const SEL = ".panel, .book, .board-card, .prob-grid .cell, .book-head h2, .controls button, .nav-row button, .rv-actions button, .cat-title";
  let plats = [], platsAt = 0;
  function platforms() {
    const now = performance.now();
    if (now - platsAt < 400) return plats;
    platsAt = now;
    plats = [];
    for (const el of document.querySelectorAll(SEL)) {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 14 || r.top < 60 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      plats.push({ el });
    }
    return plats;
  }
  const rectOf = p => (p && p !== "floor" ? p.el.getBoundingClientRect() : null);
  const floorY = () => innerHeight - 2;

  function chooseTarget() {
    const cur = m.on && m.on.el;
    const cands = platforms().filter(p => {
      if (p.el === cur) return false;
      const r = p.el.getBoundingClientRect();
      return Math.abs((r.left + r.right) / 2 - m.x) < 420 && m.y - r.top < 240 && r.top < m.y + 300;
    });
    return cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
  }
  function launch(p) {
    const r = rectOf(p);
    if (!r) return;
    const right = (r.left + r.right) / 2 > m.x;
    const tx = right ? Math.min(r.right - 10, r.left + 30) : Math.max(r.left + 10, r.right - 30);
    const above = m.y - r.top, rise = Math.max(above + 36, 44);
    m.vy = -Math.sqrt(2 * GRAV * rise);
    const tUp = -m.vy / GRAV, tDown = Math.sqrt(2 * Math.max(rise - above, 8) / GRAV);
    m.vx = (tx - m.x) / (tUp + tDown);
    m.left = m.vx < 0; m.on = null;
    set("rise", "air");
  }
  function die() {
    m.dieOnLand = false; m.plan = m.jumpTo = null; m.vx = 0;
    set("dead", "dead"); m.until = performance.now() + 2800;
  }
  addEventListener("tczw:result", e => {
    if (!cv || e.detail !== "bad") return;
    if (m.hint) { m.hint.done(); m.hint = null; m.vy = 0; set("fall", "air"); m.dieOnLand = true; return; }
    if (m.bd) { m.bd.prog = Math.round(m.bd.prog); if (m.bd.prog) { m.bd.i = m.bd.ti; m.bd.j = m.bd.tj; } m.bd.prog = 0; m.bd.ti = m.bd.i; m.bd.tj = m.bd.j; return die(); }
    if (m.state === "air" || m.state === "climb") {
      m.dieOnLand = true;
      if (m.state === "climb") { m.climbTo = null; m.vy = 0; set("fall", "air"); }
    } else die();
  });
  function land(p, y) {
    m.y = y; m.on = p; m.vy = 0; m.grab = null;
    if (m.tumble) {
      m.tumble = false; m.vx = 0;
      set("dead", "dead"); m.until = performance.now() + 1500;
      return;
    }
    if (m.dieOnLand) return die();
    m.vx = (m.left ? -1 : 1) * RUN;
    set("land", "landing"); m.until = performance.now() + 140;
  }

  const boardScale = cellPx => Math.max(1, Math.min(scale(), Math.round(cellPx * 2.2 / 30)));
  // ---- the go board: an SVG with a wood background; he walks its grid.
  function findBoard() {
    for (const svg of document.querySelectorAll("svg")) {
      if (!svg.querySelector('rect[fill="url(#wood)"]')) continue;
      const r = svg.getBoundingClientRect();
      if (r.width < 120 || r.bottom < 80 || r.top > innerHeight - 40) continue;
      const xs = new Set(), ys = new Set();
      for (const l of svg.querySelectorAll("line")) {
        const x1 = +l.getAttribute("x1"), x2 = +l.getAttribute("x2"), y1 = +l.getAttribute("y1"), y2 = +l.getAttribute("y2");
        if (y1 === y2) ys.add(y1); else if (x1 === x2) xs.add(x1);
      }
      if (xs.size < 3 || ys.size < 3) continue;
      return { svg, xs: [...xs].sort((a, b) => a - b), ys: [...ys].sort((a, b) => a - b) };
    }
    return null;
  }
  function boardStones(b) {
    const set = new Set();
    for (const c of b.svg.querySelectorAll('circle[fill="url(#bs)"], circle[fill="url(#ws)"]'))
      set.add(`${+c.getAttribute("cx")},${+c.getAttribute("cy")}`);
    return set;
  }
  function toScreen(svg, x, y) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return { x: ctm.a * x + ctm.c * y + ctm.e, y: ctm.b * x + ctm.d * y + ctm.f, cell: ctm.a };
  }
  // Where he stands on the board: between intersections (i,j) → (ti,tj).
  function boardPos() {
    const B = m.bd, f = B.prog;
    const x = B.b.xs[B.i] + (B.b.xs[B.ti] - B.b.xs[B.i]) * f, y = B.b.ys[B.j] + (B.b.ys[B.tj] - B.b.ys[B.j]) * f;
    const p = toScreen(B.b.svg, x, y);
    if (!p) return null;
    const cellPx = (B.b.xs[1] - B.b.xs[0]) * p.cell;
    // Standing on a stone: up on top of it.
    return { x: p.x, y: p.y + cellPx * 0.12 - (B.onStone ? cellPx * 0.42 : 0), cellPx };
  }
  function hasStone(B, i, j) { return B.stones.has(`${B.b.xs[i]},${B.b.ys[j]}`); }
  function boardChoose(now) {
    const B = m.bd;
    B.i = B.ti; B.j = B.tj; B.prog = 0;
    B.onStone = hasStone(B, B.i, B.j);
    const H = m.hint;
    if (H && H.svg === B.b.svg) {
      if (B.i === H.si && B.j === H.sj) {
        // Beside the point: a small step into reach, then point.
        m.bd = null; set("run", "hintrun");
        return;
      }
      const di = Math.sign(H.si - B.i), dj = Math.sign(H.sj - B.j);
      const horiz = di && (!dj || Math.random() < 0.5);
      B.di = horiz ? di : 0; B.dj = horiz ? 0 : dj;
      B.ti = B.i + B.di; B.tj = B.j + B.dj;
      if (B.di) m.left = B.di < 0;
      B.hop = hasStone(B, B.ti, B.tj) !== B.onStone;
      set(B.hop ? "rise" : B.dj ? "climb" : "run", "board");
      return;
    }
    if (now > B.leaveAt) return boardLeave();
    // Every so often: whack a neighbouring stone off the board.
    if (!B.onStone && now - (m.lastWhack || 0) > 15000 && Math.random() < 0.45) {
      const side = [[1, 0], [-1, 0]].filter(([di]) => B.i + di >= 0 && B.i + di < B.b.xs.length && hasStone(B, B.i + di, B.j));
      if (side.length) {
        const [di] = side[Math.floor(Math.random() * side.length)];
        m.left = di < 0; B.whack = [B.i + di, B.j]; B.whacked = false; m.lastWhack = now;
        set("whack", "boardwhack");
        return;
      }
    }
    const r = Math.random();
    if (B.onStone && r < 0.5) { set("idle", "boardidle"); m.until = now + 1500 + Math.random() * 2500; return; }
    if (r < 0.15) { set("idle", "boardidle"); m.until = now + 800 + Math.random() * 1600; return; }
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([di, dj]) =>
      B.i + di >= 0 && B.i + di < B.b.xs.length && B.j + dj >= 0 && B.j + dj < B.b.ys.length);
    // Keep going mostly straight; stones get hopped onto.
    const keep = dirs.find(([di, dj]) => di === B.di && dj === B.dj);
    const [di, dj] = keep && Math.random() < 0.6 ? keep : dirs[Math.floor(Math.random() * dirs.length)];
    B.di = di; B.dj = dj; B.ti = B.i + di; B.tj = B.j + dj;
    if (di) m.left = di < 0;
    B.hop = hasStone(B, B.ti, B.tj) !== B.onStone;  // up onto / down off a stone
    // Up and down the board he climbs along the line, side to side he runs.
    set(B.hop ? "rise" : dj ? "climb" : "run", "board");
  }
  function boardEnter(b, i, j) {
    m.bd = { b, stones: boardStones(b), i, j, ti: i, tj: j, prog: 0, di: 0, dj: 1, onStone: false,
             leaveAt: performance.now() + 9000 + Math.random() * 14000 };
    m.on = null; m.vy = 0;
    set("land", "boardland"); m.until = performance.now() + 160;
  }
  function boardLeave() {
    const B = m.bd; m.bd = null;
    // Jump off toward the nearer side.
    const right = B.i > B.b.xs.length / 2;
    m.vx = (right ? 1 : -1) * RUN * 1.4; m.vy = -9; m.left = !right;
    set("rise", "air");
  }
  // Send the stone at (i, j) flying. Only its picture: the circle is hidden
  // for a moment and fades back, the game itself is untouched.
  const flying = [], flashes = [];
  function knock(B, i, j) {
    const x = B.b.xs[i], y = B.b.ys[j];
    let color = null;
    for (const c of B.b.svg.querySelectorAll("circle")) {
      if (+c.getAttribute("cx") !== x || +c.getAttribute("cy") !== y) continue;
      const fill = c.getAttribute("fill");
      if (fill === "transparent" || +c.getAttribute("r") < 6) continue;  // click target, star point
      if (fill === "url(#bs)") color = "b"; else if (fill === "url(#ws)") color = "w";
      c.style.transition = "none"; c.style.opacity = "0";
      setTimeout(() => { c.style.transition = "opacity .6s"; c.style.opacity = ""; }, 2200);
    }
    if (!color) return;
    const p = toScreen(B.b.svg, x, y), cellPx = (B.b.xs[1] - B.b.xs[0]) * p.cell;
    const dir = i > B.i ? 1 : -1;
    flying.push({ x: p.x, y: p.y, vx: dir * (7 + Math.random() * 4), vy: -(9 + Math.random() * 5),
                  r: cellPx * 0.47, color, rot: 0, spin: dir * (0.25 + Math.random() * 0.2) });
    flashes.push({ x: p.x, y: p.y, t: 0 });
  }
  function stepFlying(k) {
    for (let n = flying.length - 1; n >= 0; n--) {
      const f = flying[n];
      f.vy += GRAV * 0.55 * k; f.x += f.vx * k; f.y += f.vy * k; f.rot += f.spin * k;
      if (f.y > innerHeight + 60 || f.x < -60 || f.x > innerWidth + 60) flying.splice(n, 1);
    }
    for (let n = flashes.length - 1; n >= 0; n--) if ((flashes[n].t += 16 * k) > 220) flashes.splice(n, 1);
  }
  function drawFlying() {
    for (const f of flying) {
      g.save(); g.translate(f.x, f.y); g.rotate(f.rot);
      const grad = g.createRadialGradient(-f.r * 0.3, -f.r * 0.35, f.r * 0.1, 0, 0, f.r);
      if (f.color === "b") { grad.addColorStop(0, "#5a5a5a"); grad.addColorStop(1, "#111"); }
      else { grad.addColorStop(0, "#ffffff"); grad.addColorStop(1, "#cfcfc7"); }
      g.fillStyle = grad; g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 0.8;
      g.beginPath(); g.arc(0, 0, f.r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.restore();
    }
    for (const fl of flashes) {  // impact: a quick pixel burst
      const k = fl.t / 220, R = 6 + k * 22;
      g.fillStyle = `rgba(255,236,150,${1 - k})`;
      for (let a = 0; a < 8; a++) {
        const ang = a * Math.PI / 4;
        g.fillRect(Math.round(fl.x + Math.cos(ang) * R) - 2, Math.round(fl.y + Math.sin(ang) * R) - 2, 4, 4);
      }
    }
  }
  // A jump that ends on a board intersection near (x, y).
  function jumpToBoard() {
    const b = findBoard();
    if (!b) return false;
    // Any intersection within jumping reach (not under a stone).
    const stones = boardStones(b), reach = [];
    b.xs.forEach((x, i) => b.ys.forEach((y, j) => {
      if (stones.has(`${x},${y}`)) return;
      const q = toScreen(b.svg, x, y);
      if (q && Math.abs(q.x - m.x) < 380 && m.y - q.y < 230 && q.y > 70 && q.y < innerHeight - 10) reach.push([i, j]);
    }));
    if (!reach.length) return false;
    const H = m.hint && m.hint.svg === b.svg ? m.hint : null;
    const [i, j] = H ? reach.reduce((best, c) => Math.abs(c[0] - H.si) + Math.abs(c[1] - H.sj) < Math.abs(best[0] - H.si) + Math.abs(best[1] - H.sj) ? c : best)
                     : reach[Math.floor(Math.random() * reach.length)];
    const p = toScreen(b.svg, b.xs[i], b.ys[j]);
    const above = m.y - p.y, rise = Math.max(above + 40, 50);
    m.vy = -Math.sqrt(2 * GRAV * rise);
    const tUp = -m.vy / GRAV, tDown = Math.sqrt(2 * Math.max(rise - above, 8) / GRAV);
    m.vx = (p.x - m.x) / (tUp + tDown); m.left = m.vx < 0; m.on = null;
    m.boardJump = { b, i, j };
    set("rise", "air");
    return true;
  }

  // ---- hints: go stand beside the point and touch it with the staff tip.
  const TIP = 20;  // staff tip, in sprite px ahead of his feet in the point pose
  function hintSpot(H) {
    const p = toScreen(H.svg, H.x, H.y);
    if (!p) return null;
    const S = boardScale(p.cell * cellOf(H.svg));
    return { x: p.x - H.dir * TIP * S, y: p.y, S };
  }
  function cellOf(svg) {
    const b = findBoard();
    return b && b.svg === svg ? b.xs[1] - b.xs[0] : 44;
  }
  function pointAt(svg, x, y, done) {
    if (!cv || m.state === "dead") return done();
    const b = findBoard();
    if (!b || b.svg !== svg) return done();
    const near = (arr, v) => arr.reduce((bi, a, n) => Math.abs(a - v) < Math.abs(arr[bi] - v) ? n : bi, 0);
    const gi = near(b.xs, x), gj = near(b.ys, y);
    // Stand at the intersection beside it (left if there is one), facing it.
    const dir = gi > 0 ? 1 : -1;
    m.hint = { svg, x, y, dir, done, at: performance.now(), si: gi - dir, sj: gj };
    if (m.bd && (m.state === "boardidle" || m.state === "boardland")) m.until = 0;  // stop dawdling
  }
  function stepHint(now, k) {
    const H = m.hint, spot = H.svg.isConnected ? hintSpot(H) : null;
    if (!spot) { H.done(); m.hint = null; set("fall", "air"); return; }
    if (m.state === "hintrun") {
      const dx = spot.x - m.x, dy = spot.y - m.y, d = Math.hypot(dx, dy), v = RUN * 1.3 * k;
      m.left = dx < 0;
      if (Math.abs(dy) > Math.abs(dx)) set("climb"); else set("run");
      if (d <= v) { m.x = spot.x; m.y = spot.y; arrive(now); } else { m.x += dx / d * v; m.y += dy / d * v; }
    } else if (m.state === "hintpoint") {
      m.x = spot.x; m.y = spot.y;  // stay put if the page scrolls
      if (!H.shown && m.animT > 220) { H.shown = true; H.done(); }
      if (m.animT > 2200) {
        if (!H.shown) H.done();
        m.hint = null;
        // Back to roaming the board from the nearest intersection.
        const b = findBoard();
        if (b && b.svg === H.svg) {
          const i = b.xs.reduce((bi, x, n) => Math.abs(x - H.x) < Math.abs(b.xs[bi] - H.x) ? n : bi, 0);
          const j = b.ys.reduce((bj, y, n) => Math.abs(y - H.y) < Math.abs(b.ys[bj] - H.y) ? n : bj, 0);
          boardEnter(b, Math.max(0, Math.min(b.xs.length - 1, i - H.dir)), j);
        } else set("fall", "air");
      }
    }
  }
  function arrive(now) { m.vx = m.vy = 0; m.left = m.hint.dir < 0; set("point", "hintpoint"); }
  // ---- shake the page (scroll back and forth fast) to knock him loose.
  let lastScroll = scrollY, lastDir = 0, flips = [];
  function shakeInput(dy) {
    if (!cv || Math.abs(dy) < 3) return;
    const now = performance.now(), dir = Math.sign(dy);
    if (lastDir && dir !== lastDir) flips.push(now);
    lastDir = dir;
    flips = flips.filter(t => now - t < 1000);
    if (flips.length >= 3) { flips = []; shakeOff(); }
  }
  addEventListener("scroll", () => { const y = scrollY; shakeInput(y - lastScroll); lastScroll = y; }, { passive: true });
  addEventListener("wheel", e => shakeInput(e.deltaY), { passive: true });  // also at the top/bottom of the page
  function shakeOff() {
    if (m.tumble || m.state === "dead") return;
    if (m.hint) { if (!m.hint.shown) m.hint.done(); m.hint = null; }
    m.bd = m.on = m.plan = m.jumpTo = m.climbTo = m.grab = m.boardJump = null;
    m.vx = (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 5);
    m.vy = -(10 + Math.random() * 6);
    m.left = m.vx < 0; m.tumble = true; m.spin = (m.vx < 0 ? -1 : 1) * (0.25 + Math.random() * 0.15); m.rot = 0;
    set("fall", "air");
  }
  window.Wukong = { active: () => !!cv, pointAt: (svg, x, y, done) => pointAt(svg, x, y, done) };

  function step(dt) {
    const now = performance.now(), k = dt / 16;
    m.t += dt; m.animT += dt;
    stepFlying(k);
    // A hint he hasn't reached in 10 s: show the marker anyway.
    if (m.hint && !m.hint.shown && now - m.hint.at > 10000) { m.hint.shown = true; m.hint.done(); }
    if (m.hint && (m.state === "hintrun" || m.state === "hintpoint")) return stepHint(now, k);
    if (m.bd) {
      if (!m.bd.b.svg.isConnected) { m.bd = null; set("fall", "air"); return; }
      const B = m.bd;
      if (m.state === "board") {
        const len = Math.hypot(B.b.xs[B.ti] - B.b.xs[B.i], B.b.ys[B.tj] - B.b.ys[B.j]) || 1;
        const speed = (B.dj && !B.hop ? CLIMB_SPEED * 0.6 : RUN * 0.55) * (m.hint ? 1.7 : 1);
        B.prog = Math.min(1, B.prog + (speed * k) / (len * (toScreen(B.b.svg, 0, 0)?.cell || 1)));
        if (B.hop) set(B.prog < 0.5 ? "rise" : "fall");
        if (B.prog >= 1) boardChoose(now);
      } else if (m.state === "boardwhack") {
        if (!B.whacked && m.animT >= 2 * SPEED.whack) { B.whacked = true; knock(B, B.whack[0], B.whack[1]); }
        if (m.animT >= WK.FRAMES.whack.length * SPEED.whack) { set("idle", "boardidle"); m.until = now + 700; }
      } else if ((m.state === "boardidle" || m.state === "boardland") && now > m.until) {
        boardChoose(now);
      } else if (m.state === "boardidle") {
        if (m.anim === "idle" && Math.random() < 0.004) set("twirl");
        if (m.anim === "twirl" && m.animT > 16 * 55) set("idle");
      }
      if (!m.bd) return;
      const p = boardPos();
      if (!p || p.y < 50 || p.y > innerHeight + 20) { m.bd = null; set("fall", "air"); return; }
      m.x = p.x; m.y = p.y;
      if (m.state === "dead" && now > m.until) { set("land", "boardland"); m.until = now + 220; }
      return;
    }
    if (m.state === "climb") {
      const r = rectOf(m.climbTo);
      if (!r || r.top < 60) { m.climbTo = null; set("fall", "air"); return; }
      m.x = m.left ? r.right + 7 * scale() : r.left - 7 * scale();
      m.y -= CLIMB_SPEED * k;
      if (m.y <= r.top) { m.x += (m.left ? -16 : 16); land(m.climbTo, r.top); m.climbTo = null; }
      return;
    }
    if (m.state === "air") {
      const prevY = m.y;
      m.vy = Math.min(m.vy + GRAV * k, 18);
      m.x += m.vx * k; m.y += m.vy * k;
      if (m.x < 12 || m.x > innerWidth - 12) { m.vx = -m.vx * 0.4; m.x = Math.max(12, Math.min(innerWidth - 12, m.x)); }
      if (m.grab) {
        const G = m.grab, r = rectOf(G.p);
        if (!r) m.grab = null;
        else if (G.right ? m.x >= r.left - 7 * scale() : m.x <= r.right + 7 * scale()) {
          m.grab = null;
          if (m.y > r.top + 10 && m.y < r.bottom + 40) {
            m.vx = m.vy = 0; m.climbTo = G.p;
            if (m.dieOnLand) { m.climbTo = null; set("fall", "air"); } else { set("climb", "climb"); return; }
          }
        }
      }
      if (m.tumble) m.rot += m.spin * k;
      if (m.vy > 0) set("fall");
      if (m.vy > 0 && m.boardJump) {
        const J = m.boardJump, p = toScreen(J.b.svg, J.b.xs[J.i], J.b.ys[J.j]);
        if (!p || !J.b.svg.isConnected) m.boardJump = null;
        else if (m.y >= p.y) {
          m.boardJump = null;
          boardEnter(J.b, J.i, J.j);
          if (m.dieOnLand) die();
          return;
        }
      }
      if (m.vy > 0 && !m.boardJump) {
        for (const p of platforms()) {
          const r = p.el.getBoundingClientRect();
          if (m.x >= r.left && m.x <= r.right && prevY <= r.top + 1 && m.y >= r.top) return land(p, r.top);
        }
        if (m.y >= floorY()) land("floor", floorY());
      }
      return;
    }
    // On something: stay glued to it as the page scrolls.
    const r = m.on === "floor" ? null : rectOf(m.on);
    if (m.on !== "floor" && (!r || r.top < 60 || r.top > innerHeight)) { m.on = null; m.vy = 0; set("fall", "air"); return; }
    m.y = r ? r.top : floorY();
    const lo = r ? r.left + 4 : 14, hi = r ? r.right - 4 : innerWidth - 14;
    if (m.state === "dead") {
      if (now > m.until) { m.vx = (m.left ? -1 : 1) * RUN; set("land", "landing"); m.until = now + 220; }
      return;
    }
    if (m.state === "landing" || m.state === "crouch") {
      if (now < m.until) return;
      if (m.state === "crouch") {
        if (m.grab) { m.on = null; set("rise", "air"); return; }
        return launch(m.jumpTo);
      }
      set("run", "run");
    }
    if (m.state === "idle") {
      if (m.hint) { set("run", "run"); return; }
      if (m.anim === "idle" && Math.random() < 0.003) set("twirl");
      if (m.anim === "twirl" && m.animT > 16 * 55) set("idle");
      if (now > m.until) set("run", "run");
      return;
    }
    // Running.
    m.x += m.vx * k; m.left = m.vx < 0;
    if (m.x < lo || m.x > hi) {
      if (r && Math.random() < 0.5) { m.vy = -3; m.on = null; set("rise", "air"); return; }  // hop off
      m.x = Math.max(lo, Math.min(hi, m.x)); m.vx = -m.vx;
    }
    if (m.hint) {
      if (!m.plan && jumpToBoard()) return;
      if (!m.plan) {
        // Board out of reach: make for the box nearest to it.
        const b = findBoard(), br = b && b.svg.getBoundingClientRect();
        if (br) {
          const cands = platforms().filter(p => p.el !== (m.on && m.on.el)).map(p => ({ p, r: p.el.getBoundingClientRect() }))
            .filter(({ r }) => Math.abs((r.left + r.right) / 2 - m.x) < 420 && m.y - r.top < 240);
          const dist = r => Math.hypot((r.left + r.right) / 2 - (br.left + br.right) / 2, r.top - (br.top + br.bottom) / 2);
          const here = m.on && m.on !== "floor" ? dist(m.on.el.getBoundingClientRect()) : Math.hypot(m.x - (br.left + br.right) / 2, m.y - br.bottom);
          const best = cands.sort((a, c) => dist(a.r) - dist(c.r))[0];
          if (best && dist(best.r) < here) m.plan = best.p;
        }
      }
    } else if (Math.random() < 0.0035) { set("idle", "idle"); m.until = now + 1500 + Math.random() * 2500; return; }
    if (!m.plan && Math.random() < 0.008 && jumpToBoard()) return;
    if (!m.plan && Math.random() < 0.014) m.plan = chooseTarget();
    if (!m.plan) return;
    const p = rectOf(m.plan);
    if (!p) { m.plan = null; return; }
    const right = (p.left + p.right) / 2 > m.x;
    m.vx = (right ? 1 : -1) * RUN; m.left = !right;
    const side = right ? p.left : p.right, dist = Math.abs(side - m.x), above = m.y - p.top;
    if (above > 30 && dist < 26 && m.y >= p.bottom - 6 && Math.random() < 0.85) {
      // A box rising from where he stands: up its side.
      m.climbTo = m.plan; m.plan = null; set("climb", "climb");
    } else if (above > 60 && dist > 20 && dist < 170 && !(m.x > p.left && m.x < p.right) && Math.random() < 0.65) {
      // Leap at the box's side, grab it partway up and climb the rest.
      const gx = right ? p.left : p.right;
      const gy = p.top + Math.min(Math.max(30, (Math.min(p.bottom, m.y) - p.top) * 0.45), 110);
      const rise = Math.max(m.y - gy + 12, 30);
      m.vy = -Math.sqrt(2 * GRAV * rise);
      m.vx = (gx - m.x) / (-m.vy / GRAV) * 1.05; m.left = !right;
      m.grab = { p: m.plan, gx, right }; m.plan = null; m.on = null;
      set("crouch", "crouch"); m.until = now + 110; m.jumpTo = null;
    } else if (dist < 150 || (m.x > p.left && m.x < p.right)) {
      m.jumpTo = m.plan; m.plan = null; set("crouch", "crouch"); m.until = now + 130;
    }
  }

  const SPEED = { idle: 220, twirl: 55, run: 85, climb: 150, crouch: 999, rise: 999, fall: 999, land: 999, dead: 999, whack: 110, point: 999 };
  function draw() {
    const dpr = devicePixelRatio || 1;
    let S = scale();
    if (m.bd) { const p = boardPos(); if (p) S = boardScale(p.cellPx); }
    else if (m.hint) { const sp = hintSpot(m.hint); if (sp) S = sp.S; }
    if (cv.width !== Math.round(innerWidth * dpr) || cv.height !== Math.round(innerHeight * dpr)) {
      cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    drawFlying();
    const frames = WK.FRAMES[m.anim];
    const fr = frames[Math.floor(m.animT / SPEED[m.anim]) % frames.length];
    bg.clearRect(0, 0, WK.SIZE, WK.SIZE);
    WK.render(bg, fr, m.t);
    g.imageSmoothingEnabled = false;
    g.save();
    g.translate(Math.round(m.x), Math.round(m.y));
    if (m.left) g.scale(-1, 1);
    if (m.anim === "dead") {
      // Topple over backwards onto his back, then lie there seeing stars.
      const k = Math.min(1, m.animT / 380), ease = k * k;
      g.translate(0, -11 * S * ease + (k === 1 ? 0 : -Math.sin(k * Math.PI) * 6 * S));
      g.rotate(-Math.PI / 2 * ease);
      g.drawImage(buf, -22 * S, -43 * S, WK.SIZE * S, WK.SIZE * S);
      g.rotate(Math.PI / 2 * ease);
      if (k === 1) {
        g.fillStyle = WK.PAL.y;
        for (let i = 0; i < 3; i++) {
          const a = m.animT / 260 + i * 2.1;
          const sx = -33 * S + Math.cos(a) * 9 * S, sy = -14 * S + Math.sin(a) * 3 * S;
          g.fillRect(Math.round(sx), Math.round(sy) - S, S, 3 * S);
          g.fillRect(Math.round(sx) - S, Math.round(sy), 3 * S, S);
        }
      }
    } else if (m.tumble) {
      g.translate(0, -18 * S); g.rotate(m.rot); g.translate(0, 18 * S);
      g.drawImage(buf, -22 * S, -43 * S, WK.SIZE * S, WK.SIZE * S);
    } else {
      g.drawImage(buf, -22 * S, -43 * S, WK.SIZE * S, WK.SIZE * S);
    }
    g.restore();
  }
  function loop(t) {
    const dt = Math.min(48, t - (last || t));
    last = t;
    step(dt); draw();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (cv) return;
    cv = document.createElement("canvas");
    cv.id = "wukong";
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:150";
    document.body.append(cv);
    g = cv.getContext("2d");
    buf = document.createElement("canvas"); buf.width = buf.height = WK.SIZE;
    bg = buf.getContext("2d");
    // Always drop in fresh from the top-left: forget any board, jump or climb
    // he was in the middle of when he was hidden.
    Object.assign(m, { x: 60, y: 80, vx: RUN, vy: 0, state: "air", on: null, plan: null, climbTo: null,
                       bd: null, boardJump: null, grab: null, jumpTo: null, dieOnLand: false, left: false, hint: null, tumble: false });
    flying.length = 0; flashes.length = 0;
    set("fall");
    last = 0; raf = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(raf); if (cv) cv.remove(); cv = null;
    if (m.hint) { m.hint.done(); m.hint = null; }
  }
  function enabled() {
    try { const v = localStorage.getItem(KEY); if (v != null) return v === "1"; } catch {}
    return !matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  const btn = document.createElement("button");
  btn.className = "wukong-toggle";
  // Icon: his head from the standing frame, pixel for pixel.
  const ico = document.createElement("canvas");
  ico.className = "wukong-icon";
  ico.width = 22; ico.height = 18;
  WK.drawHead(ico.getContext("2d"));
  btn.append(ico);
  btn.setAttribute("aria-label", "Show or hide Sun Wukong");
  function setOn(on) {
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
    on ? start() : stop();
    btn.classList.toggle("off", !on);
    btn.title = on ? "Hide Sun Wukong" : "Bring back Sun Wukong";
  }
  btn.addEventListener("click", () => setOn(!cv));
  const header = document.querySelector("header");
  if (header) header.append(btn);
  window.__wukong = m;
  setOn(enabled());
})();
