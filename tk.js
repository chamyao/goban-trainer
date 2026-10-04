/* ---- Romance of the Three Kingdoms: a story campaign on an overworld map ---- */
// The story runs in the novel's order: main story points sit on the fixed
// nodes every route passes through (before each fork, after each merge);
// side roads carry side stories. Levels are single problems, flawless only:
// a slip draws a new problem of the same grade. Data: data/tk.json, built by
// tools/build_tk.py from tools/tk_story.py. Art: terrain, characters and
// effects are drawn here; trees and props come from assets/tk (see CREDITS).

/* ---------- pixel art: characters ---------- */

const TK_CHARS = {
  liubei: { name: "Liu Bei", skin: "#f2c79c", hair: "#2b2226", hat: "topknot", hatC: "#2b2226", pin: "#e6c14a", robe: "#e9dcae", trim: "#3f7d4c", beard: "thin", ears: true, eyes: "kind", weapon: "swords" },
  guanyu: { name: "Guan Yu", skin: "#c0402f", hair: "#1d1517", hat: "scarf", hatC: "#2e7a42", robe: "#2e7a42", trim: "#d4ad42", beard: "long", eyes: "phoenix", weapon: "glaive" },
  zhangfei: { name: "Zhang Fei", skin: "#e9b98e", hair: "#1a1416", hat: "band", hatC: "#b8392c", robe: "#4a4a5c", trim: "#b8392c", beard: "bristle", eyes: "round", weapon: "spear" },
  caocao: { name: "Cao Cao", skin: "#efc59d", hair: "#241c1e", hat: "guan", hatC: "#1e1e24", robe: "#7b2a2a", trim: "#d4ad42", beard: "goatee", eyes: "narrow", weapon: "sword" },
  dongzhuo: { name: "Dong Zhuo", skin: "#e2b089", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#5b3b6e", trim: "#d4ad42", beard: "short", eyes: "narrow", fat: true },
  zhangbao: { name: "Zhang Bao", skin: "#e7c39b", hair: "#2a2024", hat: "wild", hatC: "#e8bc2a", robe: "#d8ab2a", trim: "#7a5216", beard: "none", eyes: "wild", weapon: "sword" },
  zhangjiao: { name: "Zhang Jiao", skin: "#e9c8a2", hair: "#d8d2c8", hat: "yellowband", hatC: "#e8bc2a", robe: "#d8ab2a", trim: "#7a5216", beard: "long", beardC: "#d8d2c8", eyes: "normal" },
  luzhi: { name: "Lu Zhi", skin: "#eec7a0", hair: "#9a9a9a", hat: "guan", hatC: "#1e1e24", robe: "#3e5f8a", trim: "#d6d2c4", beard: "long", beardC: "#a8a8a8", eyes: "kind" },
  zhujun: { name: "Zhu Jun", skin: "#e8c09a", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#8a3030", trim: "#c8c8c8", beard: "short", eyes: "normal", weapon: "sword" },
  huangfusong: { name: "Huangfu Song", skin: "#e8c09a", hair: "#2a2024", hat: "helmet", hatC: "#858a94", robe: "#2f4f7a", trim: "#c8c8c8", beard: "long", eyes: "normal", weapon: "sword" },
  chengyuanzhi: { name: "Cheng Yuanzhi", skin: "#e8b88c", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#8f6a3a", trim: "#e8bc2a", beard: "short", eyes: "wild", weapon: "glaive" },
  rebel: { name: "Yellow Turban", skin: "#e8b88c", hair: "#2a2024", hat: "yellowband", hatC: "#e8bc2a", robe: "#9a7a4a", trim: "#e8bc2a", beard: "none", eyes: "normal", weapon: "spear" },
  inspector: { name: "The Inspector", skin: "#f0cfac", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#6b6a35", trim: "#d4ad42", beard: "thin", eyes: "narrow" },
  xushao: { name: "Xu Shao", skin: "#eec7a0", hair: "#3a3236", hat: "scholar", hatC: "#2e3a5a", robe: "#ded6c0", trim: "#2e3a5a", beard: "thin", eyes: "kind" },
  uncle: { name: "Cao Cao's uncle", skin: "#eec7a0", hair: "#5a5256", hat: "topknot", hatC: "#5a5256", pin: "#8a8a8a", robe: "#7a6a5a", trim: "#3a3236", beard: "short", eyes: "normal" },
  zuofeng: { name: "Zuo Feng", skin: "#f5dcc4", hair: "#2a2024", hat: "guan", hatC: "#1e1e24", robe: "#3f6a5a", trim: "#d4ad42", beard: "none", eyes: "narrow" },
  merchant: { name: "Zhang Shiping", skin: "#ebbd92", hair: "#2a2024", hat: "straw", hatC: "#d8b867", robe: "#8a6a4a", trim: "#5a3a22", beard: "short", eyes: "kind" },
  immortal: { name: "Old Immortal of Southern Florescence", img: "assets/tk/p_immortal.png", skin: "#efe0c8", hair: "#e8e8e8", hat: "topknot", hatC: "#e8e8e8", pin: "#6a8a5a", robe: "#6a8a6a", trim: "#d8d2c0", beard: "long", beardC: "#eeeeee", eyes: "kind" },
};

const TKArt = {
  shade(hex, f) {  // f < 0 darkens, > 0 lightens
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
    return "#" + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  },
  // A grid of colours (null = empty), then an outline pass and a canvas.
  grid(w, h) { return { w, h, c: Array.from({ length: h }, () => new Array(w).fill(null)) }; },
  set(g, x, y, col) { if (x >= 0 && y >= 0 && x < g.w && y < g.h && col) g.c[y][x] = col; },
  rect(g, x, y, w, h, col) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(g, x + i, y + j, col); },
  ellipse(g, cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
      if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) this.set(g, x, y, col);
  },
  line(g, x0, y0, x1, y1, col) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) this.set(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), col);
  },
  outline(g, col = "#1c1418") {
    const add = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      if (g.c[y][x]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g.c[y + dy] && g.c[y + dy][x + dx] && g.c[y + dy][x + dx] !== col)) add.push([x, y]);
    }
    for (const [x, y] of add) g.c[y][x] = col;
    return g;
  },
  canvas(g) {
    const cv = document.createElement("canvas");
    cv.width = g.w; cv.height = g.h;
    const ctx = cv.getContext("2d");
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.c[y][x]) { ctx.fillStyle = g.c[y][x]; ctx.fillRect(x, y, 1, 1); }
    return cv;
  },

  // Map sprite, 14x18 including the outline. frame 0/1 = legs; pose: stand | kneel | strike.
  sprite(d, frame = 0, pose = "stand") {
    const g = this.grid(16, 20), O = 2;  // O: left margin for the outline and weapons
    const s = (x, y, c) => this.set(g, x + O, y + 1, c), R = (x, y, w, h, c) => this.rect(g, x + O, y + 1, w, h, c);
    const skinS = this.shade(d.skin, -.18), robeS = this.shade(d.robe, -.22), dark = "#2a2228";
    const kneel = pose === "kneel", dy = kneel ? 3 : 0;
    // weapon behind the body
    if (d.weapon === "spear" && pose !== "strike") { for (let y = 1; y < 17; y++) s(10, y + dy, "#7a5a3a"); s(10, 0 + dy, "#d0d4d8"); s(11, -1 + dy, "#d0d4d8"); s(10, -2 + dy, "#d0d4d8"); }
    if (d.weapon === "glaive" && pose !== "strike") { for (let y = 3; y < 17; y++) s(10, y + dy, "#6a4a2a"); R(10, -1 + dy, 2, 4, "#d0d4d8"); s(12, 0 + dy, "#d0d4d8"); s(10, 3 + dy, "#3f9a5a"); }
    // body
    R(2, 9 + dy, 6, 1, d.robe); R(1, 10 + dy, 8, kneel ? 3 : 3, d.robe); R(1, 12 + dy, 8, 1, robeS);
    s(4, 9 + dy, d.trim); s(5, 10 + dy, d.trim); R(1, 11 + dy, 8, 1, d.trim);  // collar and belt
    s(0, 10 + dy, d.robe); s(9, 10 + dy, d.robe); s(0, 11 + dy, d.skin); s(9, 11 + dy, d.skin);  // sleeves, hands
    if (kneel) R(0, 13 + dy, 10, 1, robeS);
    else {
      const L = frame ? [[2, 13], [6, 14], [1, 14]] : [[2, 13], [6, 13]];
      if (frame) { R(1, 13, 3, 2, robeS); R(6, 13, 3, 2, robeS); s(0, 15, dark); s(1, 15, dark); s(7, 15, dark); s(8, 15, dark); }
      else { R(2, 13, 2, 2, robeS); R(6, 13, 2, 2, robeS); R(2, 15, 2, 1, dark); R(6, 15, 2, 1, dark); }
      void L;
    }
    // head
    R(1, 2 + dy, 8, 7, d.skin); R(1, 8 + dy, 8, 1, skinS);
    if (d.fat) { s(0, 5 + dy, d.skin); s(9, 5 + dy, d.skin); s(0, 6 + dy, d.skin); s(9, 6 + dy, d.skin); }
    if (d.ears) { R(0, 4 + dy, 1, 4, d.skin); R(9, 4 + dy, 1, 4, d.skin); }
    // eyes
    const ey = 5 + dy;
    if (d.eyes === "round") { s(2, ey, "#fff"); s(3, ey, dark); s(6, ey, "#fff"); s(7, ey, dark); }
    else if (d.eyes === "phoenix") { s(2, ey, dark); s(3, ey - 1, dark); s(6, ey - 1, dark); s(7, ey, dark); R(2, ey - 2, 2, 1, dark); R(6, ey - 2, 2, 1, dark); }
    else if (d.eyes === "kind") { s(3, ey, dark); s(6, ey, dark); }
    else if (d.eyes === "wild") { s(2, ey, dark); s(3, ey, dark); s(6, ey, dark); s(7, ey, dark); }
    else { s(3, ey, dark); s(6, ey, dark); }
    // beard
    const bc = d.beardC || d.hair || dark;
    if (d.beard === "long") { R(3, 7 + dy, 4, 1, bc); R(3, 8 + dy, 4, 3, bc); R(4, 11 + dy, 2, 1, bc); }
    else if (d.beard === "bristle") { R(2, 8 + dy, 6, 1, bc); s(1, 7 + dy, bc); s(8, 7 + dy, bc); s(0, 8 + dy, bc); s(9, 8 + dy, bc); R(3, 9 + dy, 4, 1, bc); }
    else if (d.beard === "short") { R(3, 8 + dy, 4, 2, bc); }
    else if (d.beard === "goatee") { s(3, 7 + dy, bc); s(6, 7 + dy, bc); R(4, 8 + dy, 2, 2, bc); }
    else if (d.beard === "thin") { R(4, 8 + dy, 2, 1, bc); }
    // hair and hats
    const H = d.hatC, hr = d.hair || dark;
    if (d.hat === "topknot") { R(1, 1 + dy, 8, 2, hr); R(4, -1 + dy, 2, 2, hr); R(3, 0 + dy, 4, 1, d.pin || "#e6c14a"); s(1, 3 + dy, hr); s(8, 3 + dy, hr); }
    else if (d.hat === "scarf") { R(1, 0 + dy, 8, 3, H); R(3, -1 + dy, 4, 1, H); R(0, 2 + dy, 1, 4, H); s(1, 3 + dy, hr); s(8, 3 + dy, hr); }
    else if (d.hat === "band") { R(1, 0 + dy, 8, 2, hr); s(1, -1 + dy, hr); s(4, -1 + dy, hr); s(7, -1 + dy, hr); R(1, 2 + dy, 8, 1, H); s(0, 3 + dy, hr); s(9, 3 + dy, hr); }
    else if (d.hat === "guan") { R(1, 1 + dy, 8, 2, H); R(2, -1 + dy, 6, 2, H); s(0, 2 + dy, H); s(9, 2 + dy, H); }
    else if (d.hat === "yellowband") { R(1, 1 + dy, 8, 1, hr); R(1, 2 + dy, 8, 1, H); s(9, 3 + dy, H); s(9, 4 + dy, H); R(3, 0 + dy, 4, 1, hr); }
    else if (d.hat === "wild") { R(1, 0 + dy, 8, 2, hr); s(0, -1 + dy, hr); s(3, -2 + dy, hr); s(6, -2 + dy, hr); s(9, -1 + dy, hr); R(1, 2 + dy, 8, 1, H); R(0, 3 + dy, 1, 6, hr); R(9, 3 + dy, 1, 6, hr); }
    else if (d.hat === "helmet") { R(1, 0 + dy, 8, 3, H); R(2, -1 + dy, 6, 1, H); R(4, -2 + dy, 2, 1, "#c8392c"); s(0, 3 + dy, H); s(9, 3 + dy, H); }
    else if (d.hat === "scholar") { R(1, 0 + dy, 8, 3, H); R(3, -1 + dy, 4, 1, H); s(9, 1 + dy, H); s(10, 2 + dy, H); }
    else if (d.hat === "straw") { R(-1, 2 + dy, 12, 1, H); R(2, 0 + dy, 6, 2, H); R(3, -1 + dy, 4, 1, H); }
    // weapons in front
    if (d.weapon === "swords") { R(-1, 11 + dy, 1, 3, "#d0d4d8"); R(10, 11 + dy, 1, 3, "#d0d4d8"); }
    if (d.weapon === "sword") { R(10, 9 + dy, 1, 4, "#d0d4d8"); s(10, 13 + dy, "#7a5a3a"); }
    if (pose === "strike") {
      const pole = d.weapon === "glaive" ? "#6a4a2a" : "#7a5a3a";
      if (d.weapon === "spear" || d.weapon === "glaive") { for (let x = 6; x < 14; x++) s(x, 9 + dy, pole); R(13, 8 + dy, 2, 3, "#d0d4d8"); }
      else R(9, 8 + dy, 5, 1, "#d0d4d8");
    }
    return this.canvas(this.outline(g));
  },

  // Dialogue portrait, 32x32.
  bust(d) {
    const g = this.grid(34, 34), O = 1;
    const s = (x, y, c) => this.set(g, x + O, y + O, c), R = (x, y, w, h, c) => this.rect(g, x + O, y + O, w, h, c);
    const E = (cx, cy, rx, ry, c) => this.ellipse(g, cx + O, cy + O, rx, ry, c), Ln = (a, b, c2, e, col) => this.line(g, a + O, b + O, c2 + O, e + O, col);
    const skinS = this.shade(d.skin, -.16), robeS = this.shade(d.robe, -.2), robeL = this.shade(d.robe, .15), dark = "#2a2228", hr = d.hair || dark, H = d.hatC;
    // shoulders, cross collar
    E(16, 33, 15, 8, d.robe); R(3, 27, 26, 5, d.robe); R(3, 30, 26, 2, robeS);
    Ln(11, 25, 18, 31, d.trim); Ln(12, 25, 19, 31, d.trim); Ln(21, 25, 17, 29, d.trim); Ln(20, 25, 16, 29, d.trim);
    Ln(4, 28, 9, 26, robeL);
    R(13, 21, 6, 5, skinS);  // neck
    // head
    const rx = d.fat ? 10 : 8;
    E(16, 14, rx, 9.5, d.skin); E(16 + rx - 2, 15, 2, 7, skinS);
    if (d.ears) { R(6, 11, 2, 10, d.skin); R(24, 11, 2, 10, d.skin); s(6, 20, skinS); s(25, 20, skinS); }
    else { R(7, 12, 1, 4, d.skin); R(24, 12, 1, 4, d.skin); }
    // eyes and brows
    const ey = 14;
    if (d.eyes === "round") { E(12, ey, 2, 2, "#fff"); E(20, ey, 2, 2, "#fff"); R(12, ey - 1, 2, 2, dark); R(20, ey - 1, 2, 2, dark); R(9, ey - 4, 5, 1, dark); R(18, ey - 4, 5, 1, dark); }
    else if (d.eyes === "phoenix") { Ln(10, ey + 1, 14, ey - 1, dark); Ln(18, ey - 1, 22, ey + 1, dark); Ln(9, ey - 3, 14, ey - 4, dark); Ln(18, ey - 4, 23, ey - 3, dark); R(10, ey - 3, 4, 1, dark); R(18, ey - 3, 4, 1, dark); }
    else if (d.eyes === "narrow") { R(11, ey, 3, 1, dark); R(18, ey, 3, 1, dark); Ln(10, ey - 3, 13, ey - 2, dark); Ln(19, ey - 2, 22, ey - 3, dark); }
    else if (d.eyes === "kind") { s(11, ey, dark); R(12, ey - 1, 2, 1, dark); s(14, ey, dark); s(18, ey, dark); R(19, ey - 1, 2, 1, dark); s(21, ey, dark); R(10, ey - 4, 4, 1, hr); R(18, ey - 4, 4, 1, hr); }
    else if (d.eyes === "wild") { E(12, ey, 1.6, 1.6, "#fff"); E(20, ey, 1.6, 1.6, "#fff"); s(12, ey, "#a02020"); s(20, ey, "#a02020"); Ln(9, ey - 2, 14, ey - 4, dark); Ln(18, ey - 4, 23, ey - 2, dark); }
    else { R(11, ey, 2, 2, dark); R(19, ey, 2, 2, dark); R(10, ey - 3, 4, 1, hr); R(18, ey - 3, 4, 1, hr); }
    s(16, 17, skinS); s(15, 18, skinS);  // nose
    R(14, 20, 4, 1, this.shade(d.skin, -.4));  // mouth
    // beard
    const bc = d.beardC || hr, bl = this.shade(bc, .25);
    if (d.beard === "long") { Ln(12, 19, 14, 18, bc); Ln(20, 19, 18, 18, bc); E(16, 26, 5, 8, bc); R(13, 21, 7, 4, bc); Ln(15, 23, 15, 32, bl); Ln(17, 24, 17, 31, bl); R(14, 20, 4, 1, this.shade(d.skin, -.4)); }
    else if (d.beard === "bristle") {
      E(16, 21, 9, 4, bc); for (const [x, y] of [[6, 18], [5, 20], [7, 22], [26, 18], [27, 20], [25, 22], [10, 25], [14, 26], [18, 26], [22, 25]]) Ln(x, y, 16 + (x - 16) * .6, 21, bc);
      R(14, 20, 4, 1, "#7a3a30");
    }
    else if (d.beard === "short") { E(16, 22, 6, 3, bc); Ln(12, 19, 15, 18, bc); Ln(20, 19, 17, 18, bc); R(14, 20, 4, 1, this.shade(d.skin, -.4)); }
    else if (d.beard === "goatee") { Ln(10, 21, 14, 18, bc); Ln(22, 21, 18, 18, bc); R(15, 22, 2, 5, bc); }
    else if (d.beard === "thin") { Ln(12, 19, 14, 18, bc); Ln(20, 19, 18, 18, bc); R(15, 22, 2, 2, bc); }
    // hair and hats
    if (d.hat === "topknot") { E(16, 7, 8.5, 4, hr); R(8, 7, 2, 6, hr); R(23, 7, 2, 6, hr); E(16, 2, 3, 2.5, hr); R(12, 3, 8, 1, d.pin || "#e6c14a"); }
    else if (d.hat === "scarf") { E(16, 6, 9.5, 5, H); R(7, 6, 18, 4, H); R(6, 9, 2, 9, H); R(25, 9, 2, 6, H); Ln(9, 9, 23, 9, this.shade(H, -.25)); E(16, 2, 4, 2, H); }
    else if (d.hat === "band") { E(16, 7, 9, 4.5, hr); for (let x = 7; x <= 25; x += 3) Ln(x, 6, x - 1, 1, hr); R(7, 8, 18, 2, H); R(6, 9, 2, 8, hr); R(24, 9, 2, 8, hr); }
    else if (d.hat === "guan") { E(16, 7, 8.5, 3.5, hr); R(10, 0, 12, 7, H); R(11, 0, 10, 1, this.shade(H, .2)); R(6, 7, 20, 2, H); R(8, 8, 2, 4, hr); R(22, 8, 2, 4, hr); }
    else if (d.hat === "yellowband") { E(16, 7, 8.5, 4, hr); R(7, 8, 18, 2, H); R(25, 9, 3, 2, H); Ln(26, 10, 28, 15, H); R(8, 9, 2, 5, hr); R(22, 9, 2, 5, hr); }
    else if (d.hat === "wild") { E(16, 7, 9.5, 5, hr); for (const [x, y] of [[5, 4], [9, 0], [14, -1], [19, 0], [24, 1], [27, 5]]) Ln(x, y, 16, 7, hr); R(5, 9, 3, 18, hr); R(24, 9, 3, 18, hr); R(7, 8, 18, 2, H); }
    else if (d.hat === "helmet") { E(16, 7, 10, 6, H); R(6, 7, 20, 4, H); R(6, 10, 20, 1, this.shade(H, -.3)); R(15, -1, 2, 3, "#c8392c"); R(6, 10, 3, 9, H); R(23, 10, 3, 9, H); }
    else if (d.hat === "scholar") { E(16, 6, 9, 5, H); R(7, 6, 18, 4, H); Ln(24, 7, 28, 14, H); Ln(25, 7, 29, 13, H); }
    else if (d.hat === "straw") { E(16, 8, 15, 3, H); E(16, 5, 7, 4, H); Ln(2, 8, 30, 8, this.shade(H, -.25)); }
    return this.canvas(this.outline(g));
  },
  cache: {},
  get(who, kind, frame = 0, pose = "stand") {
    const k = `${who}|${kind}|${frame}|${pose}`;
    if (!this.cache[k]) this.cache[k] = kind === "bust" ? this.bust(TK_CHARS[who]) : this.sprite(TK_CHARS[who], frame, pose);
    return this.cache[k];
  },
  // Flipped copy for walking left.
  flip(cv) {
    const o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height;
    const c = o.getContext("2d"); c.translate(cv.width, 0); c.scale(-1, 1); c.drawImage(cv, 0, 0); return o;
  },
};

/* ---------- the overworld: terrain painted once, life drawn each frame ---------- */

const TK_W = 480, TK_H = 270;
function tkRng(seed) {  // mulberry32
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const TKImg = {
  cache: {},
  get(name) {
    if (!this.cache[name]) {
      const im = new Image();
      this.cache[name] = { im, ready: new Promise(r => { im.onload = r; im.onerror = r; }) };
      im.src = `assets/tk/${name}.png`;
    }
    return this.cache[name].im;
  },
  load(names) { return Promise.all(names.map(n => (this.get(n), this.cache[n].ready))); },
};

// Roads are gentle quadratic curves; the same curve is drawn and walked.
function tkCtrl(A, B) {
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
  const bend = (((A.x * 7 + B.y * 13) % 9) - 4) * 1.6;
  return { x: mx - dy / L * bend, y: my + dx / L * bend };
}
function tkPt(A, C, B, t) {
  const u = 1 - t;
  return { x: u * u * A.x + 2 * u * t * C.x + t * t * B.x, y: u * u * A.y + 2 * u * t * C.y + t * t * B.y };
}
function tkCurve(A, B, step = 1) {  // points about `step` px apart
  const C = tkCtrl(A, B), n = Math.max(2, Math.ceil(Math.hypot(B.x - A.x, B.y - A.y) / step)), out = [];
  for (let i = 0; i <= n; i++) out.push(tkPt(A, C, B, i / n));
  return out;
}
function tkSpline(pts, step = 1) {  // Catmull-Rom through the points
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  return out;
}

// Per-world scenery. Landmarks are placed by hand near their nodes;
// trees, rocks and flowers are scattered wherever there is no road.
const TK_ART = {
  1: {
    seed: 184,
    grass: ["#5f9642", "#6ea64b", "#7bb255", "#88bd60"],
    mountains: { x0: -10, x1: 372, base: 56, colors: ["#b9cfc9", "#8fb0a6", "#6a917f", "#4d7462"] },
    river: [[238, -6], [228, 28], [248, 60], [238, 96], [214, 130], [200, 166], [196, 204], [210, 238], [198, 276]],
    landmarks: [
      ["village", 34, 236], ["bigpeach", 90, 168], ["orchard", 108, 186], ["signpost", 78, 204],
      ["hills", 262, 156], ["city", 284, 226], ["fields", 438, 214, 36, 40], ["fields", 112, 246, 44, 20], ["fields", 300, 92, 40, 22],
      ["camp", 448, 168], ["darkhills", 392, 96], ["fortress", 432, 46], ["mulberry", 14, 210],
    ],
    forests: [[60, 110, 34, 9], [150, 96, 30, 7], [330, 252, 36, 8], [466, 120, 18, 6], [160, 262, 26, 5], [270, 116, 22, 5], [352, 60, 20, 5]],
    petals: [108, 180, 50],  // ambient blossom: x, y, radius
    cloud: [388, 104],       // Zhang Bao's black cloud, until the boss falls
  },
};

const TKPaint = {
  px(c, x, y, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); },
  grass(c, rng, cols) {
    c.fillStyle = cols[1]; c.fillRect(0, 0, TK_W, TK_H);
    // coarse value noise for patches
    const gw = Math.ceil(TK_W / 12) + 2, gh = Math.ceil(TK_H / 12) + 2, g = [];
    for (let i = 0; i < gw * gh; i++) g.push(rng());
    const v = (x, y) => {
      const gx = x / 12, gy = y / 12, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], d = g[(iy + 1) * gw + ix], e = g[(iy + 1) * gw + ix + 1];
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * sx + (d - a) * sy + (a - b - d + e) * sx * sy;
    };
    const img = c.getImageData(0, 0, TK_W, TK_H), D = img.data;
    const rgb = cols.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
    for (let y = 0; y < TK_H; y++) for (let x = 0; x < TK_W; x++) {
      let n = v(x, y) + (rng() - .5) * .18, k = n < .3 ? 0 : n < .5 ? 1 : n < .72 ? 2 : 3;
      if (((x + y) & 1) && Math.abs(n - .5) < .02) k = 1;
      const o = (y * TK_W + x) * 4; D[o] = rgb[k][0]; D[o + 1] = rgb[k][1]; D[o + 2] = rgb[k][2]; D[o + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    for (let i = 0; i < 260; i++) {  // grass tufts
      const x = rng() * TK_W, y = rng() * TK_H;
      this.px(c, x, y, cols[0]); this.px(c, x + 2, y, cols[0]); this.px(c, x + 1, y - 1, cols[0]);
    }
  },
  mountains(c, rng, m) {
    // Ridges from far (pale) to near (dark), each with lit left slopes.
    m.colors.forEach((col, i) => {
      const base = m.base - 26 + i * 9, amp = 30 - i * 5, lit = TKArt.shade(col, .18), dark = TKArt.shade(col, -.12);
      const peaks = [];
      for (let x = m.x0; x < m.x1 + 30; x += 14 + rng() * 22) peaks.push([x, base - amp * (.45 + rng() * .55)]);
      const H = [];
      for (let x = 0; x < TK_W; x++) {
        let h = TK_H;
        for (const [px, py] of peaks) { const d = Math.abs(x - px); h = Math.min(h, py + d * (.7 + ((px * 13) % 7) / 14)); }
        H.push(Math.min(h, base + 8));
      }
      for (let x = Math.max(0, m.x0); x < Math.min(TK_W, m.x1 + 40); x++) {
        const f = Math.max(0, Math.min(1, (m.x1 + 40 - x) / 90)), bottom = base + 12 + i * 2;
        const top = Math.round(bottom - (bottom - H[x]) * f);  // the range slopes down into the plain
        if (bottom - top < 1) continue;
        c.fillStyle = col; c.fillRect(x, top, 1, bottom - top);
        const slope = (H[x + 1] ?? top) - (H[x - 1] ?? top);
        if (slope < 0) { c.fillStyle = lit; c.fillRect(x, top, 1, Math.min(6, bottom - top)); }
        else if (slope > 0) { c.fillStyle = dark; c.fillRect(x, top + 1, 1, Math.min(5, bottom - top)); }
        if (i === 0 && top < base - 18) { c.fillStyle = "#eef3f1"; c.fillRect(x, top, 1, 2); }  // snow on the far peaks
      }
    });
    // little pines along the near ridge
    for (let i = 0; i < 40; i++) {
      const x = m.x0 + 10 + rng() * (m.x1 - m.x0 - 20), y = m.base + 2 + rng() * 10;
      this.pine(c, x, y, "#2f5a44");
    }
  },
  pine(c, x, y, col) {
    x = Math.round(x); y = Math.round(y);
    c.fillStyle = col; c.fillRect(x, y - 6, 1, 2); c.fillRect(x - 1, y - 4, 3, 2); c.fillRect(x - 2, y - 2, 5, 2);
    c.fillStyle = "#4a3324"; c.fillRect(x, y, 1, 1);
  },
  river(c, pts) {
    const S = tkSpline(pts, 1);
    const stamp = (w, col) => { c.fillStyle = col; for (const p of S) c.fillRect(Math.round(p.x - w / 2), Math.round(p.y - w / 2), w, w); };
    stamp(14, "#c9b98a"); stamp(12, "#2f6496"); stamp(10, "#3d7fbf"); stamp(4, "#4f93cf");
    return S;
  },
  road(c, A, B, kind) {
    const P = tkCurve(A, B, .5);
    const w = kind === "short" ? 3 : 5, edge = kind === "short" ? "#7d7a72" : "#a7814f", fill = kind === "short" ? "#b9b4a6" : "#d6b77f";
    c.fillStyle = edge; for (const p of P) c.fillRect(Math.round(p.x - (w + 2) / 2), Math.round(p.y - (w + 2) / 2), w + 2, w + 2);
    c.fillStyle = fill; for (const p of P) c.fillRect(Math.round(p.x - w / 2), Math.round(p.y - w / 2), w, w);
    if (kind !== "short") { c.fillStyle = "#c4a26a"; P.forEach((p, i) => { if (i % 9 === 0) c.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }); }
    else { c.fillStyle = "#8e8a80"; P.forEach((p, i) => { if (i % 6 === 0) c.fillRect(Math.round(p.x - 1), Math.round(p.y), 2, 1); }); }
    return P;
  },
  bridge(c, p, dir) {
    const [dx, dy] = dir, nx = -dy, ny = dx;
    for (let s = -9; s <= 9; s++) for (let o = -3; o <= 3; o++) {
      const x = p.x + dx * s + nx * o, y = p.y + dy * s + ny * o;
      this.px(c, x, y, Math.abs(o) === 3 ? "#5a3a22" : (s & 1) ? "#8a6038" : "#9c7044");
    }
  },
  sprite(build) { return TKArt.canvas(TKArt.outline(build)); },
  tree(kind, v = 0) {  // small overworld trees: round, pine, peach
    const key = kind + v;
    if ((this.trees || (this.trees = {}))[key]) return this.trees[key];
    const g = TKArt.grid(12, 14), E = (cx, cy, rx, ry, c) => TKArt.ellipse(g, cx, cy, rx, ry, c);
    const base = { round: ["#3f7a3a", "#5a9a48", "#82bf62"], round2: ["#356b36", "#4d8a40", "#6faa52"], peach: ["#d77a92", "#f0a2b6", "#fcd2dc"] }[kind === "round" && v ? "round2" : kind] || ["#2f5a44", "#3f7552", "#5a9468"];
    if (kind === "pine") {
      TKArt.rect(g, 5, 11, 2, 2, "#5a3a22");
      for (let i = 0; i < 4; i++) TKArt.rect(g, 5 - i - (i > 1 ? 0 : 0), 2 + i * 2, 2 + i * 2, 3, i % 2 ? base[1] : base[0]);
      TKArt.rect(g, 5, 1, 2, 1, base[2]); TKArt.set(g, 4, 4, base[2]); TKArt.set(g, 3, 6, base[2]);
    } else {
      TKArt.rect(g, 5, 9, 2, 4, "#6a4428");
      E(6, 6, 5, 4.6, base[0]); E(5.4, 5.4, 4.2, 3.8, base[1]); E(4.4, 4.2, 2, 1.6, base[2]);
      if (kind === "peach") for (const [x, y] of [[3, 7], [8, 4], [7, 8], [2, 5]]) TKArt.set(g, x, y, "#fff0f4");
    }
    return (this.trees[key] = this.sprite(g));
  },
  house(roof = "#5b6170") {
    const g = TKArt.grid(18, 15), R = (x, y, w, h, c) => TKArt.rect(g, x, y, w, h, c);
    R(3, 7, 12, 6, "#e8dcc0"); R(3, 12, 12, 1, "#cbbd9c"); R(8, 9, 2, 4, "#5a3a22"); R(4, 8, 2, 2, "#8a6038"); R(12, 8, 2, 2, "#8a6038");
    R(2, 3, 14, 4, roof); R(4, 2, 10, 1, roof); R(1, 6, 16, 1, TKArt.shade(roof, -.25)); TKArt.set(g, 0, 5, roof); TKArt.set(g, 17, 5, roof);
    R(4, 1, 10, 1, TKArt.shade(roof, .2));
    for (let x = 3; x < 15; x += 2) TKArt.set(g, x, 4, TKArt.shade(roof, .15));
    return this.sprite(g);
  },
  tent(col = "#e9e4d6") {
    const g = TKArt.grid(13, 11);
    for (let y = 0; y < 8; y++) TKArt.rect(g, 6 - y * .75, y + 2, 1 + y * 1.5, 1, y > 5 ? TKArt.shade(col, -.1) : col);
    TKArt.rect(g, 5, 7, 3, 3, "#5a4a3a"); TKArt.set(g, 6, 1, "#5a3a22"); TKArt.set(g, 6, 0, "#5a3a22");
    return this.sprite(g);
  },
  walls(w, h, col, roof) {  // a walled town or fort with a gate tower on the south side
    const g = TKArt.grid(w + 2, h + 10), R = (x, y, ww, hh, c) => TKArt.rect(g, x + 1, y + 4, ww, hh, c);
    const dark = TKArt.shade(col, -.25), lit = TKArt.shade(col, .15);
    R(0, 0, w, 4, col); R(0, h - 5, w, 5, col); R(0, 0, 4, h, col); R(w - 4, 0, 4, h, col);
    R(0, h - 1, w, 1, dark); R(0, 3, w, 1, dark);
    for (let x = 0; x < w; x += 3) R(x, -1, 2, 1, lit);
    for (let y = 0; y < h; y += 3) { R(-1, y, 1, 2, lit); R(w, y, 1, 2, lit); }
    const gx = Math.floor(w / 2) - 5;  // gate tower
    R(gx, h - 9, 10, 8, lit); R(gx - 2, h - 12, 14, 4, roof); R(gx - 3, h - 9, 16, 1, TKArt.shade(roof, -.3)); R(gx + 3, h - 4, 4, 4, "#3a2a1e");
    return { cv: this.sprite(g), gate: [gx + 6, h + 3] };
  },
  feature(c, rng, f, img) {
    const [kind, x, y] = f, draw = (cv, X, Y) => c.drawImage(cv, Math.round(X - cv.width / 2), Math.round(Y - cv.height));
    if (kind === "village") {
      for (const [dx, dy, r] of [[-26, -10, "#5b6170"], [-24, 14, "#6b5a50"], [16, 22, "#5b6170"], [-6, 26, "#4f5868"], [20, -8, "#6b5a50"]]) draw(this.house(r), x + dx, y + dy);
      img.smoke = [x - 22, y - 22];
    } else if (kind === "bigpeach") draw(img.g_peachtree, x, y + 4);
    else if (kind === "orchard") {
      for (const [dx, dy] of [[-30, 4], [-20, 16], [24, -12], [30, 2], [-6, -22], [14, -24], [-30, -12], [-18, -2], [36, -8], [-38, 10]]) draw(this.tree("peach"), x + dx, y + dy);
    } else if (kind === "signpost") draw(img.g_signpost, x, y);
    else if (kind === "mulberry") draw(img.j_pine2, x, y);
    else if (kind === "hills") {
      for (const [dx, dy, r] of [[-14, 2, 16], [10, -4, 20], [26, 6, 12]]) {
        for (let yy = -r; yy <= 0; yy++) for (let xx = -r * 1.6; xx <= r * 1.6; xx++) {
          if ((xx / (r * 1.6)) ** 2 + (yy / r) ** 2 > 1) continue;
          this.px(c, x + dx + xx, y + dy + yy, xx < -r * .3 ? "#7aa65c" : xx > r * .6 ? "#4f7a46" : "#64904f");
        }
      }
      for (const [dx, dy] of [[-18, -8], [2, -16], [14, -10], [26, -2], [-6, -2]]) this.pine(c, x + dx, y + dy, "#2f5a44");
    } else if (kind === "city") {
      const { cv } = this.walls(40, 26, "#b8a27a", "#5b6170");
      draw(cv, x, y + 6);
      for (const [dx, dy] of [[-9, -12], [9, -14]]) draw(this.house("#4f5868"), x + dx, y + dy);
      img.flags.push([x - 18, y - 22, "#c8392c"], [x + 18, y - 22, "#c8392c"]);
    } else if (kind === "fields") {
      const [, , , w, h] = f;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const strip = Math.floor(i / 9) % 2, furrow = j % 3 === 0;
        this.px(c, x - w / 2 + i, y - h / 2 + j, strip ? (furrow ? "#a99a48" : "#c9b85c") : (furrow ? "#6f9a43" : "#8cb655"));
      }
    } else if (kind === "camp") {
      for (const [dx, dy] of [[-10, -6], [6, -10], [14, 6], [-4, 10], [22, -4]]) draw(this.tent(), x + dx, y + dy);
      img.flags.push([x - 16, y - 18, "#222"], [x + 26, y - 18, "#222"]);
    } else if (kind === "darkhills") {
      for (const [dx, dy, r] of [[-20, 6, 14], [4, 0, 20], [26, 8, 13]]) {
        for (let yy = -r; yy <= 0; yy++) for (let xx = -r * 1.5; xx <= r * 1.5; xx++) {
          if ((xx / (r * 1.5)) ** 2 + (yy / r) ** 2 > 1) continue;
          this.px(c, x + dx + xx, y + dy + yy, xx < -r * .3 ? "#5f6e5a" : xx > r * .6 ? "#3e4a3e" : "#4f5c4c");
        }
      }
      for (const [dx, dy] of [[-16, -6], [10, -14], [24, -2]]) { c.fillStyle = "#2e2a26"; c.fillRect(x + dx, y + dy - 6, 1, 6); c.fillRect(x + dx - 2, y + dy - 5, 2, 1); c.fillRect(x + dx + 1, y + dy - 4, 2, 1); }
    } else if (kind === "fortress") {
      const { cv } = this.walls(56, 34, "#b58a4a", "#8a5a2a");
      draw(cv, x, y + 22);
      for (const [dx, dy] of [[-12, -2], [10, 0]]) draw(this.tent("#e3c46a"), x + dx, y + dy);
      img.flags.push([x - 26, y - 14, "#e8bc2a"], [x + 26, y - 14, "#e8bc2a"], [x - 8, y - 18, "#e8bc2a"], [x + 8, y - 18, "#e8bc2a"]);
    }
  },
};

/* ---------- campaign state ---------- */

const TK = {
  data: null,
  async load() {
    if (!this.data) this.data = await (await fetch("data/tk.json?v=5")).json();
    return this.data;
  },
  ls(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } },
  lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  saveProg(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); if (typeof Sync !== "undefined") Sync.scheduleSave(); },
  cleared(key) { return (loadProgress().tk || {})[key] === 1; },
  markCleared(key) { const p = loadProgress(); (p.tk || (p.tk = {}))[key] = 1; this.saveProg(p); },
  seen(id) { return !!(loadProgress().tkSeen || {})[id]; },
  markSeen(id) { const p = loadProgress(); (p.tkSeen || (p.tkSeen = {}))[id] = 1; this.saveProg(p); },
  world(n) { return this.data.worlds.find(w => w.n === n); },
  node(w, key) { return w.nodes.find(x => x.key === key); },
  preds(w, key) { return w.edges.filter(e => e[1] === key).map(e => e[0]); },
  succs(w, key) { return w.edges.filter(e => e[0] === key).map(e => e[1]); },
  isStart(key) { return key.endsWith("-start"); },
  open(w, key) { return this.isStart(key) || this.preds(w, key).some(k => this.isStart(k) || this.cleared(k)); },
  worldOpen(n) { return n === 1 || this.cleared(`${n - 1}-boss`); },
  at(n) { return this.ls("tk-at")[n] || `${n}-start`; },
  setAt(n, key) { const a = this.ls("tk-at"); a[n] = key; this.lsSet("tk-at", a); },
  party(w) { return this.ls("tk-party")[w.n] || w.party; },
  setParty(w, list) { const a = this.ls("tk-party"); a[w.n] = list; this.lsSet("tk-party", a); },
  problemRef(node) { const d = this.ls("tk-draw"); return node.pool[(d[node.key] || 0) % node.pool.length]; },
  slip(node) { const d = this.ls("tk-draw"); d[node.key] = (d[node.key] || 0) + 1; this.lsSet("tk-draw", d); },
  // Walkable path between two nodes over open or cleared ground.
  route(w, from, to) {
    const ok = k => this.open(w, k) || this.cleared(k);
    const prev = { [from]: null }, q = [from];
    while (q.length) {
      const k = q.shift();
      if (k === to) break;
      for (const [a, b] of w.edges) for (const [x, y] of [[a, b], [b, a]])
        if (x === k && !(y in prev) && (ok(y) || y === to)) { prev[y] = k; q.push(y); }
    }
    if (!(to in prev)) return [from, to];
    const path = [];
    for (let k = to; k !== null; k = prev[k]) path.unshift(k);
    return path;
  },
  roleLabel(node) {
    return { main: "Main story", side: "Side story · long road", short: "Side story · shortcut", boss: "Boss", challenge: "Challenge" }[node.role] || "";
  },
};

/* ---------- the live map ---------- */

class TKMap {
  constructor(w, host) {
    this.w = w; this.art = TK_ART[w.n] || TK_ART[1]; this.host = host;
    this.N = Object.fromEntries(w.nodes.map(n => [n.key, n]));
    this.cv = h("canvas", { class: "tk-canvas" });
    this.buf = document.createElement("canvas"); this.buf.width = TK_W; this.buf.height = TK_H;
    this.bg = document.createElement("canvas"); this.bg.width = TK_W; this.bg.height = TK_H;
    this.fx = []; this.actors = {}; this.texts = []; this.shake = 0; this.dim = 0;
    this.sel = null; this.onSelect = null; this.t = 0;
    const at = this.N[TK.at(w.n)] || w.nodes[0];
    this.party = TK.party(w).map((who, i) => ({ who, x: at.x - i * 7, y: at.y + i * 2, left: false, frame: 0, pose: "stand", trail: [] }));
    this.leader = this.party[0];
    host.append(this.cv);
    this.cv.addEventListener("click", e => this.click(e));
  }
  async init() {
    const names = ["j_peach", "j_peach2", "j_pine", "j_pine2", "j_bamboo", "j_rock", "j_rock2", "j_bush", "j_flower", "j_flower2", "g_peachtree", "g_crane", "g_signpost", "g_cloud", "g_bamboo", "g_barrels"];
    await TKImg.load(names);
    this.img = Object.fromEntries(names.map(n => [n, TKImg.get(n)]));
    this.img.flags = [];
    this.paint();
    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.host);
    const loop = ts => {
      if (!this.cv.isConnected) { this.ro.disconnect(); return; }
      const dt = Math.min(50, ts - (this.last || ts)); this.last = ts; this.t += dt;
      this.update(dt); this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  resize() {
    const r = this.host.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    const s = Math.max(1, Math.round(r.width * dpr / TK_W));
    if (this.cv.width !== TK_W * s) { this.cv.width = TK_W * s; this.cv.height = TK_H * s; }
    this.s = s;
  }
  paint() {
    const c = this.bg.getContext("2d"), rng = tkRng(this.art.seed), A = this.art, w = this.w;
    TKPaint.grass(c, rng, A.grass);
    for (const f of A.landmarks.filter(f => f[0] === "fields")) TKPaint.feature(c, rng, f, this.img);
    if (A.mountains) TKPaint.mountains(c, rng, A.mountains);
    this.river = A.river ? TKPaint.river(c, A.river) : [];
    this.roads = {};
    const roadPts = [];
    for (const [a, b] of w.edges) {
      const kind = [this.N[a].role, this.N[b].role].includes("short") ? "short" : "road";
      const P = TKPaint.road(c, this.N[a], this.N[b], kind);
      this.roads[a + ">" + b] = P; roadPts.push(...P);
      // a bridge wherever the road crosses the river
      let inside = false;
      P.forEach((p, i) => {
        const wet = this.river.some(q => Math.abs(q.x - p.x) < 5 && Math.abs(q.y - p.y) < 5);
        if (wet && !inside) {
          const q = P[Math.min(P.length - 1, i + 8)], d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
          this.bridges = (this.bridges || []).concat([[{ x: p.x + (q.x - p.x) / d * 6, y: p.y + (q.y - p.y) / d * 6 }, [(q.x - p.x) / d, (q.y - p.y) / d]]]);
        }
        inside = wet;
      });
    }
    for (const [p, dir] of this.bridges || []) TKPaint.bridge(c, p, dir);
    // scatter: forests, then rocks and flowers, away from roads, river and nodes
    const busy = (x, y, r) => roadPts.some(p => Math.abs(p.x - x) < r && Math.abs(p.y - y) < r) || this.river.some(p => Math.abs(p.x - x) < r && Math.abs(p.y - y) < r)
      || w.nodes.some(n => Math.abs(n.x - x) < r + 6 && Math.abs(n.y - y) < r + 6);
    const props = [];
    for (const [fx, fy, r, n] of A.forests || []) {
      let placed = 0;
      for (let i = 0; i < n * 8 && placed < n * 2.5; i++) {
        const x = fx + (rng() - .5) * 2 * r, y = fy + (rng() - .5) * 1.3 * r;
        if (((x - fx) / r) ** 2 + ((y - fy) / (r * .65)) ** 2 > 1 || busy(x, y, 7)) continue;
        const kind = rng() < .3 ? "pine" : "round";
        props.push([TKPaint.tree(kind, rng() < .5 ? 1 : 0), x, y]); placed++;
      }
    }
    for (let i = 0; i < 46; i++) {  // lone trees
      const x = rng() * TK_W, y = 66 + rng() * (TK_H - 66);
      if (!busy(x, y, 9)) props.push([TKPaint.tree(rng() < .25 ? "pine" : "round", i & 1), x, y]);
    }
    for (let i = 0; i < 160; i++) {  // flowers and pebbles, drawn flat
      const x = rng() * TK_W, y = 66 + rng() * (TK_H - 66);
      if (busy(x, y, 4)) continue;
      const k = rng();
      if (k < .7) { const col = ["#f4e27a", "#fbfbf3", "#f2a8c0", "#c9a0e8"][Math.floor(rng() * 4)]; TKPaint.px(c, x, y, col); TKPaint.px(c, x + 1, y + 1, "#3f7a3a"); }
      else { c.fillStyle = "#8f8e86"; c.fillRect(Math.round(x), Math.round(y), 3, 2); c.fillStyle = "#c4c2b8"; c.fillRect(Math.round(x), Math.round(y), 2, 1); }
    }
    const marks = A.landmarks.filter(f => f[0] !== "fields");
    const all = props.map(p => ({ y: p[2], f: () => c.drawImage(p[0], Math.round(p[1] - p[0].width / 2), Math.round(p[2] - p[0].height)) }))
      .concat(marks.map(f => ({ y: f[2], f: () => TKPaint.feature(c, rng, f, this.img) })));
    all.sort((a, b) => a.y - b.y).forEach(o => o.f());
    this.flags = this.img.flags;
  }
  // ---- animation ----
  update(dt) {
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter(f => f.t < f.life);
    this.texts = this.texts.filter(t => (t.t += dt) < t.life);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    const A = this.art;
    if (A.petals && Math.random() < dt / 260) this.fx.push(this.petal(A.petals[0] + (Math.random() - .5) * A.petals[2] * 2, A.petals[1] - A.petals[2] * .6));
    if (this.img.smoke && Math.random() < dt / 300) this.fx.push({ kind: "smoke", x: this.img.smoke[0], y: this.img.smoke[1], t: 0, life: 2600, vx: .004 + Math.random() * .004 });
    if (!this.crane && Math.random() < dt / 9000) this.crane = { x: -20, y: 16 + Math.random() * 40, t: 0 };
    if (this.crane) { this.crane.x += dt * .03; this.crane.t += dt; if (this.crane.x > TK_W + 20) this.crane = null; }
    // walkers
    for (const a of [...this.party, ...Object.values(this.actors)]) {
      if (a.path && a.path.length) {
        const p = a.path[0], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy), sp = (a.speed || .05) * dt;
        if (dx) a.left = dx < 0;
        if (d <= sp) { a.x = p.x; a.y = p.y; a.path.shift(); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
        a.walk = (a.walk || 0) + dt;
        a.frame = Math.floor(a.walk / 140) % 2;
        if (!a.path.length) { a.frame = 0; a.done && a.done(); a.done = null; }
      }
    }
    // followers trail the leader
    const L = this.leader;
    if (L.path && L.path.length || !L.trail.length || Math.hypot(L.x - L.trail[L.trail.length - 1].x, L.y - L.trail[L.trail.length - 1].y) > .9) L.trail.push({ x: L.x, y: L.y });
    if (L.trail.length > 400) L.trail.shift();
    this.party.slice(1).forEach((m, i) => {
      if (m.path && m.path.length) return;  // scripted
      const idx = L.trail.length - 1 - (i + 1) * 9;
      if (idx >= 0) { const p = L.trail[idx]; if (Math.abs(p.x - m.x) > .01) m.left = p.x < m.x; m.frame = L.frame; m.x = p.x; m.y = p.y; }
    });
  }
  petal(x, y) { return { kind: "petal", x, y, t: 0, life: 3000 + Math.random() * 1500, vx: .008 + Math.random() * .01, ph: Math.random() * 6, c: Math.random() < .5 ? "#f6b7c6" : "#fbd7df" }; }
  draw() {
    const c = this.buf.getContext("2d"), t = this.t;
    c.imageSmoothingEnabled = false;
    c.drawImage(this.bg, 0, 0);
    // river sparkle
    if (this.river.length) for (let i = 0; i < 26; i++) {
      const k = Math.floor((i * 37 + t * .02) % this.river.length), p = this.river[k];
      if (((i * 13 + Math.floor(t / 300)) % 5) === 0) TKPaint.px(c, p.x + ((i * 7) % 7) - 3, p.y + ((i * 3) % 5) - 2, "#bfe0f6");
    }
    // flags
    for (const [x, y, col] of this.flags || []) {
      c.fillStyle = "#4a3324"; c.fillRect(x, y, 1, 12);
      for (let i = 0; i < 6; i++) { c.fillStyle = col; c.fillRect(x + 1 + i, y + Math.round(Math.sin(t / 180 + i * .9) * 1), 1, 4); }
    }
    // mist over the mountains
    const M = this.art.mountains;
    if (M) for (let i = 0; i < 4; i++) {
      const x = ((t * .006 * (i + 1) + i * 140) % (TK_W + 160)) - 120;
      c.fillStyle = "rgba(255,255,255,.16)"; c.fillRect(Math.round(x), M.base + 2 + i * 4, 110 + i * 20, 3);
      c.fillStyle = "rgba(255,255,255,.1)"; c.fillRect(Math.round(x) + 14, M.base + 1 + i * 4, 70, 5);
    }
    // the black cloud over the hills, until the boss falls
    if (this.art.cloud && !TK.cleared(`${this.w.n}-boss`)) {
      const [cx, cy] = this.art.cloud;
      for (let i = 0; i < 40; i++) {
        const a = i * 2.4 + t / 900, r = 8 + (i % 6) * 3;
        c.fillStyle = i % 3 ? "rgba(30,26,40,.55)" : "rgba(70,60,90,.5)";
        c.fillRect(Math.round(cx + Math.cos(a) * r * 1.6), Math.round(cy - 8 + Math.sin(a) * r * .5), 3, 2);
      }
    }
    // crane
    if (this.crane) {
      const im = this.img.g_crane, bob = Math.round(Math.sin(this.crane.t / 200) * 2);
      c.save(); c.translate(Math.round(this.crane.x), this.crane.y + bob); c.scale(-1, 1); c.drawImage(im, -im.width / 2, -im.height / 2, im.width * .7, im.height * .7); c.restore();
    }
    this.drawNodes(c);
    // sprites, back to front
    const sprites = [...this.party.map(p => ({ ...p, ref: p })), ...Object.values(this.actors).map(a => ({ ...a, ref: a }))].filter(a => !a.hidden).sort((a, b) => a.y - b.y);
    for (const a of sprites) this.drawSprite(c, a);
    // effects
    for (const f of this.fx) this.drawFx(c, f);
    if (this.dim) { c.fillStyle = `rgba(10,8,20,${this.dim})`; c.fillRect(0, 0, TK_W, TK_H); for (const f of this.fx.filter(f => f.kind === "bolt")) this.drawFx(c, f); }
    // to screen
    const d = this.cv.getContext("2d"), s = this.s;
    d.imageSmoothingEnabled = false;
    const sx = this.shake ? Math.round((Math.random() - .5) * 4) * s : 0;
    d.fillStyle = "#000"; d.fillRect(0, 0, this.cv.width, this.cv.height);
    d.drawImage(this.buf, sx, 0, TK_W * s, TK_H * s);
    this.drawLabels(d, s);
  }
  drawNodes(c) {
    const w = this.w, pulse = (Math.sin(this.t / 260) + 1) / 2;
    for (const n of w.nodes) {
      if (TK.isStart(n.key)) continue;
      const done = TK.cleared(n.key), open = TK.open(w, n.key), x = Math.round(n.x), y = Math.round(n.y);
      const big = n.role === "main" || n.role === "boss";
      const fill = done ? "#f0c43a" : open ? "#fbf6e8" : "#9a978e", ring = done ? "#8a5a10" : open ? "#3a2a1e" : "#5a5850";
      if (n.role === "short") {
        for (let r = 0; r <= 5; r++) { c.fillStyle = r === 5 ? ring : (done ? fill : open ? "#e0503a" : fill); c.fillRect(x - (5 - r), y - r, (5 - r) * 2 + 1, 1); c.fillRect(x - (5 - r), y + r, (5 - r) * 2 + 1, 1); }
      } else {
        const r = big ? 5 : 4;
        for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
          const d = Math.hypot(xx, yy);
          if (d <= r + .3) TKPaint.px(c, x + xx, y + yy, d > r - .9 ? ring : (yy < -r / 3 && xx < 0 ? TKArt.shade(fill, .35) : fill));
        }
        if (n.role === "boss") { c.fillStyle = done ? "#8a5a10" : "#c8392c"; c.fillRect(x - 1, y - 2, 3, 3); }
      }
      if (open && !done) {  // pulsing ring on playable levels
        c.strokeStyle = `rgba(255,236,150,${.4 + pulse * .5})`; c.lineWidth = 1;
        c.beginPath(); c.arc(x + .5, y + .5, (big ? 7 : 6) + pulse * 1.5, 0, Math.PI * 2); c.stroke();
      }
      if (this.sel === n.key) { c.strokeStyle = "#c8392c"; c.lineWidth = 1; c.strokeRect(x - 8.5, y - 8.5, 17, 17); }
    }
  }
  drawSprite(c, a) {
    let cv = TKArt.get(a.who, "sprite", a.frame || 0, a.pose === "fall" ? "stand" : (a.pose || "stand"));
    if (a.left) cv = TKArt.flip(cv);
    const x = Math.round(a.x), y = Math.round(a.y);
    c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(x - 4, y, 9, 2);
    if (a.pose === "fall") {
      const k = Math.min(1, (performance.now() - (a.ref.fellAt || 0)) / 500);
      c.save(); c.globalAlpha = 1 - k * .6; c.translate(x, y); c.rotate((a.left ? -1 : 1) * k * Math.PI / 2); c.drawImage(cv, -cv.width / 2, -cv.height); c.restore();
    } else c.drawImage(cv, x - Math.floor(cv.width / 2), y - cv.height + 1);
  }
  drawFx(c, f) {
    const k = f.t / f.life;
    if (f.kind === "petal") {
      TKPaint.px(c, f.x + f.vx * f.t + Math.sin(f.t / 300 + f.ph) * 3, f.y + f.t * .012, f.c);
    } else if (f.kind === "smoke" || f.kind === "incense") {
      c.fillStyle = `rgba(230,230,235,${.55 * (1 - k)})`;
      c.fillRect(Math.round(f.x + Math.sin(f.t / 400) * 2 + f.vx * f.t * 2), Math.round(f.y - f.t * .008), 2, 2);
    } else if (f.kind === "spark") {
      c.fillStyle = f.c; c.fillRect(Math.round(f.x + f.vx * f.t), Math.round(f.y + f.vy * f.t + .00004 * f.t * f.t), f.sz || 1, f.sz || 1);
    } else if (f.kind === "ring") {
      c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = 2; c.beginPath(); c.arc(f.x, f.y, 2 + k * 14, 0, Math.PI * 2); c.stroke();
    } else if (f.kind === "swirl") {
      const a = f.a + f.t / 300, r = f.r * (1 - k * .3);
      c.fillStyle = f.c; c.fillRect(Math.round(f.x + Math.cos(a) * r * 1.5), Math.round(f.y + Math.sin(a) * r * .6 - k * 10), 3, 2);
    } else if (f.kind === "bolt") {
      if ((Math.floor(f.t / 90) % 3) !== 0) return;
      c.strokeStyle = "#fffbe0"; c.lineWidth = 1; c.beginPath(); let x = f.x, y = f.y - 40; c.moveTo(x, y);
      for (let i = 0; i < 6; i++) { x += (Math.random() - .5) * 10; y += 7; c.lineTo(x, y); } c.stroke();
    } else if (f.kind === "flame") {
      const col = k < .3 ? "#fff1a0" : k < .6 ? "#f6a23a" : "#d8452a";
      c.fillStyle = col; c.fillRect(Math.round(f.x + Math.sin(f.t / 90 + f.ph) * 1.5), Math.round(f.y - f.t * .02), 2, 2);
    } else if (f.kind === "paper") {
      const x = f.x + Math.sin(f.t / 250 + f.ph) * 6, y = f.y - 30 + f.t * .03;
      c.fillStyle = "#f4efe0"; c.fillRect(Math.round(x), Math.round(y), (Math.floor(f.t / 150 + f.ph) % 2) ? 3 : 1, 4);
    }
  }
  drawLabels(d, s) {
    const label = (n, txt, strong) => {
      d.font = `${strong ? "700 " : "600 "}${Math.max(10, 5.2 * s)}px system-ui, sans-serif`;
      const tw = d.measureText(txt).width, x = Math.min(Math.max(n.x * s, tw / 2 + 4), this.cv.width - tw / 2 - 4), y = (n.y - 11) * s;
      d.fillStyle = strong ? "rgba(40,24,16,.85)" : "rgba(40,24,16,.62)";
      d.beginPath(); d.roundRect(x - tw / 2 - 4 * s / 2, y - 6 * s, tw + 4 * s, 7.5 * s, 3 * s); d.fill();
      d.fillStyle = "#fff8e6"; d.textAlign = "center"; d.textBaseline = "middle"; d.fillText(txt, x, y - 2.2 * s);
    };
    const boss = this.w.nodes.find(n => n.role === "boss");
    if (boss && this.sel !== boss.key) label(boss, boss.place, false);
    if (this.sel) label(this.N[this.sel], this.N[this.sel].place, true);
    for (const t of this.texts) {
      d.font = `900 ${8 * s}px system-ui, sans-serif`; d.textAlign = "center";
      d.fillStyle = "#3a1a10"; d.fillText(t.text, t.x * s + s, (t.y - t.t * .02) * s + s);
      d.fillStyle = "#ffe36a"; d.fillText(t.text, t.x * s, (t.y - t.t * .02) * s);
    }
  }
  // ---- input ----
  click(e) {
    const r = this.cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * TK_W, y = (e.clientY - r.top) / r.height * TK_H;
    let best = null, bd = 18;
    for (const n of this.w.nodes) { if (TK.isStart(n.key)) continue; const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = n; } }
    if (best && this.onSelect) this.onSelect(best.key);
  }
  select(key) { this.sel = key; }
  // ---- movement ----
  walkTo(key) {
    return new Promise(res => {
      const from = TK.at(this.w.n), path = TK.route(this.w, from, key), pts = [];
      for (let i = 0; i < path.length - 1; i++) {
        const fw = this.roads[path[i] + ">" + path[i + 1]], bw = this.roads[path[i + 1] + ">" + path[i]];
        const seg = fw ? fw : bw ? [...bw].reverse() : [this.N[path[i + 1]]];
        pts.push(...seg.filter((_, j) => j % 3 === 0), this.N[path[i + 1]]);
      }
      if (!pts.length) { res(); return; }
      this.leader.path = pts.map(p => ({ x: p.x, y: p.y })); this.leader.speed = .055;
      this.leader.done = () => { TK.setAt(this.w.n, key); res(); };
    });
  }
  actor(id) { return this.actors[id] || this.party.find(p => p.who === id); }
  pos(at, dx = 0, dy = 0) { const n = this.N[at] || this.leader; return { x: n.x + dx, y: n.y + dy }; }
  moveActor(a, x, y) {
    return new Promise(res => { a.path = [{ x, y }]; a.speed = .05; a.done = res; });
  }
  addFx(name, x, y) {
    const R = Math.random, push = f => this.fx.push(Object.assign({ t: 0 }, f));
    if (name === "petals") for (let i = 0; i < 60; i++) push(Object.assign(this.petal(x + (R() - .5) * 60, y - R() * 20), { t: -R() * 1200 }));
    else if (name === "incense") for (let i = 0; i < 40; i++) push({ kind: "incense", x: x + (R() - .5) * 2, y, t: -i * 110, life: 1800, vx: .002 });
    else if (name === "flash") { push({ kind: "ring", x, y, life: 350 }); for (let i = 0; i < 12; i++) push({ kind: "spark", x, y, vx: (R() - .5) * .12, vy: -R() * .1, life: 500, c: "#fff6c8" }); this.shake = 250; }
    else if (name === "dust") for (let i = 0; i < 36; i++) push({ kind: "spark", x: x + (R() - .5) * 30, y: y + (R() - .5) * 10, vx: (R() - .5) * .06, vy: -R() * .04, life: 900, c: R() < .5 ? "#d8c39a" : "#b8a074", sz: 2 });
    else if (name === "sparkle") for (let i = 0; i < 18; i++) push({ kind: "spark", x, y, vx: (R() - .5) * .1, vy: -R() * .12, life: 800, c: R() < .5 ? "#ffe36a" : "#fff" });
    else if (name === "fire") for (let i = 0; i < 120; i++) push({ kind: "flame", x: x + (R() - .5) * 40, y: y + (R() - .5) * 14, ph: R() * 6, t: -R() * 1800, life: 900 });
    else if (name === "paper") for (let i = 0; i < 30; i++) push({ kind: "paper", x: x + (R() - .5) * 60, y, ph: R() * 6, t: -R() * 900, life: 2200 });
    else if (name === "whip") { this.texts.push({ text: "THWACK!", x: x + (R() - .5) * 10, y, t: 0, life: 700 }); this.shake = 200; for (let i = 0; i < 5; i++) push({ kind: "spark", x, y, vx: (R() - .5) * .1, vy: -R() * .08, life: 400, c: "#7aa65c" }); }
    else if (name === "blackwind") {
      for (let i = 0; i < 90; i++) push({ kind: "swirl", x, y, a: R() * 6.3, r: 6 + R() * 26, t: -R() * 600, life: 2600, c: R() < .6 ? "#1c1826" : "#4a3f60" });
      for (let i = 0; i < 4; i++) push({ kind: "bolt", x: x + (R() - .5) * 40, y, t: -i * 500, life: 400 });
      this.dimFor(.45, 2600);
    }
    return { petals: 1200, incense: 800, flash: 350, dust: 700, sparkle: 300, fire: 1600, paper: 1800, whip: 450, blackwind: 2400 }[name] || 300;
  }
  dimFor(v, ms) { this.dim = v; clearTimeout(this.dimT); this.dimT = setTimeout(() => { this.dim = 0; }, ms); }
}

/* ---------- voice-over: one Mandarin clip per line (tools/build_tk_voice.py) ---------- */

const TKVoice = {
  audio: null, queue: [],
  get on() { try { return localStorage.getItem("tk-voice") !== "off"; } catch { return true; } },
  set on(v) { try { localStorage.setItem("tk-voice", v ? "on" : "off"); } catch {} if (!v) this.stop(); },
  has(vid) { return !!vid && TK.data && TK.data.voices.includes(vid); },
  // Plays clips one after another; resolves when the last ends or is stopped.
  play(vids) {
    this.stop();
    if (!this.on) return Promise.resolve();
    this.queue = (Array.isArray(vids) ? vids : [vids]).filter(v => this.has(v));
    return new Promise(res => {
      const next = () => {
        const v = this.queue.shift();
        if (!v) { this.audio = null; res(); return; }
        const a = new Audio(`assets/tk/voice/${v}.mp3`);
        this.audio = a; a.onended = next; a.onerror = next; a.onpause = () => { if (this.audio === a && !a.ended) res(); };
        a.play().catch(next);
      };
      next();
    });
  },
  stop() { this.queue = []; if (this.audio) { const a = this.audio; this.audio = null; a.pause(); } },
};

/* ---------- story: dialogue box, storyteller scrolls, scene runner ---------- */

const TKStory = {
  skipping: false,
  dialog(who, text, zh, vid) {
    return new Promise(res => {
      let box = document.querySelector(".tk-dlg");
      if (!box) {
        box = h("div", { class: "tk-dlg" }, [
          h("div", { class: "tk-dlg-face" }), h("div", { class: "tk-dlg-body" }, [h("b", { class: "tk-dlg-name" }), h("p", { class: "tk-dlg-zh", lang: "zh-CN" }), h("p", { class: "tk-dlg-text" })]),
          h("button", { class: "tk-skip", type: "button" }, "Skip ▸▸"), h("span", { class: "tk-dlg-more" }, "▼"),
        ]);
        document.body.append(box);
      }
      const ch = who && TK_CHARS[who], face = box.querySelector(".tk-dlg-face");
      face.innerHTML = "";
      if (ch) face.append(ch.img ? h("img", { src: ch.img, alt: "" }) : TKArt.get(who, "bust"));
      box.classList.toggle("narr", !ch);
      box.querySelector(".tk-dlg-name").textContent = ch ? (typeof tkName === "function" ? tkName(who) : ch.name) : "";
      box.querySelector(".tk-dlg-zh").textContent = zh || "";
      TKVoice.play(vid);
      const p = box.querySelector(".tk-dlg-text");
      let i = 0, done = false;
      const tick = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(tick); done = true; box.classList.add("ready"); } }, 28);
      box.classList.remove("ready");
      const finish = () => { clearInterval(tick); TKVoice.stop(); box.onclick = null; skip.onclick = null; res(); };
      box.onclick = e => {
        if (e.target === skip) return;
        if (!done) { clearInterval(tick); p.textContent = text; done = true; box.classList.add("ready"); return; }
        finish();
      };
      const skip = box.querySelector(".tk-skip");
      skip.onclick = e => { e.stopPropagation(); this.skipping = true; finish(); };
    });
  },
  closeDialog() { TKVoice.stop(); const b = document.querySelector(".tk-dlg"); if (b) b.remove(); },
  scroll(title, paras, zhTitle, zhParas, vids) {
    return new Promise(res => {
      const wrap = h("div", { class: "tk-scroll-wrap" }, [
        h("div", { class: "tk-scroll" }, [
          h("h3", {}, zhTitle ? [h("span", { lang: "zh-CN" }, zhTitle), h("span", { class: "tk-scroll-en" }, title)] : title),
          ...paras.map((t, i) => h("div", { class: "tk-para" + (t.startsWith("—") ? " by" : "") }, [  // Chinese first, English after
            ...(zhParas && zhParas[i] ? [h("p", { class: "zh", lang: "zh-CN" }, zhParas[i])] : []), h("p", { class: "en" }, t)])),
          h("button", { class: "tk-scroll-go", type: "button" }, "Continue ▸"),
        ]),
      ]);
      document.body.append(wrap);
      TKVoice.play(vids || []);
      const go = () => { TKVoice.stop(); wrap.remove(); res(); };
      wrap.querySelector(".tk-scroll-go").onclick = go;
    });
  },
  // Plays a scene on the map. Skipping still applies the lasting effects
  // (who is in the party) so the story state stays right.
  async play(map, steps) {
    this.skipping = false;
    const w = map.w;
    for (const s of steps) {
      const [op] = s;
      if (op === "party") {
        const at = map.leader;
        map.party = s[1].map((who, i) => map.party.find(p => p.who === who) || { who, x: at.x - (i + 1) * 4, y: at.y + 1, frame: 0, pose: "stand", trail: [] });
        map.party.forEach(p => { p.trail = []; });
        map.leader = map.party[0]; map.leader.trail = [];
        TK.setParty(w, s[1]);
        continue;
      }
      if (op === "remove") { delete map.actors[s[1]]; continue; }
      if (this.skipping) { if (op === "spawn") continue; continue; }
      if (op === "n") await this.dialog(null, s[1], s[2], s[3]);
      else if (op === "say") await this.dialog(s[1], s[2], s[3], s[4]);
      else if (op === "scroll") { this.closeDialog(); await this.scroll(s[1], s[2], s[3], s[4], s[5]); }
      else if (op === "spawn") { const p = map.pos(s[3], s[4], s[5]); map.actors[s[1]] = { who: s[2], x: p.x, y: p.y, frame: 0, pose: "stand", left: p.x > map.leader.x }; }
      else if (op === "move") { const a = map.actor(s[1]); if (a) { const p = map.pos(s[2], s[3], s[4]); await map.moveActor(a, p.x, p.y); } }
      else if (op === "pose") {
        const a = map.actor(s[1]); if (!a) continue;
        a.pose = s[2]; if (s[2] === "fall") a.fellAt = performance.now();
        if (s[2] === "strike") { await new Promise(r => setTimeout(r, 380)); a.pose = "stand"; }
      }
      else if (op === "fx") { const p = map.pos(s[2], s[3], s[4]); await new Promise(r => setTimeout(r, map.addFx(s[1], p.x, p.y))); }
      else if (op === "wait") await new Promise(r => setTimeout(r, s[1]));
    }
    for (const k of Object.keys(map.actors)) delete map.actors[k];
    this.closeDialog();
  },
};

/* ---------- views ---------- */

const TKView = {
  map: null,
  // The level a finished problem came back from, for the zoom-out and story.
  takeReturn() { try { const r = JSON.parse(sessionStorage.getItem("tk-return")); sessionStorage.removeItem("tk-return"); return r; } catch { return null; } },
};

async function viewTK(worldN) {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const D = await TK.load();
  if (nav !== routeSeq) return;
  let n = worldN && TK.world(worldN) && TK.worldOpen(worldN) ? worldN : 1;
  const w = TK.world(n);
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / ", D.title);
  root.innerHTML = "";
  const levels = w.nodes.filter(x => !TK.isStart(x.key)), done = levels.filter(x => TK.cleared(x.key)).length;
  const chron = h("button", { class: "tk-chron-btn", type: "button" }, "📜 史册 Chronicle");
  const voiceBtn = h("button", { class: "tk-chron-btn", type: "button", "aria-pressed": String(TKVoice.on) });
  const voiceLabel = () => { voiceBtn.textContent = TKVoice.on ? "🔊 配音 Voice on" : "🔇 静音 Voice off"; voiceBtn.setAttribute("aria-pressed", String(TKVoice.on)); };
  voiceLabel();
  voiceBtn.onclick = () => { TKVoice.on = !TKVoice.on; voiceLabel(); };
  root.append(h("div", { class: "tk-head" }, [
    h("div", {}, [h("h2", {}, [h("span", { class: "zh" }, D.native), " ", D.title]),
      h("div", { class: "sub" }, `World ${w.n} · ${w.name} ${w.zh} · chapters ${w.chapters.join("–")} · ${w.grades} · ${done}/${levels.length} cleared`)]),
    h("div", { class: "tk-head-btns" }, [voiceBtn, chron]),
  ]));
  root.append(h("div", { class: "tk-worlds" }, [
    ...D.worlds.map(x => h("a", { class: "tk-world" + (x.n === n ? " on" : ""), href: `#/tk/${x.n}` }, `${x.n} · ${x.zh} ${x.name}`)),
    h("span", { class: "tk-world lock" }, "2 · 虎牢关 Hulao Pass — 敬请期待 coming soon"),
  ]));
  const host = h("div", { class: "tk-map" });
  root.append(host);
  const info = h("div", { class: "tk-info" });
  root.append(info);

  // Worlds whose places are built are explored on foot (tk-world.js); the node map
  // remains only for worlds that haven't been built yet.
  const world = typeof WorldData !== "undefined" && WorldData.has(w.n);
  if (world) {
    // Art style: the same maps drawn with either free pack (tk-world.js WORLD_KITS).
    const kit = WorldView.kit(), kits = Object.keys(WORLD_KITS), next = kits[(kits.indexOf(kit) + 1) % kits.length];
    root.querySelector(".tk-head-btns").prepend(h("button", { class: "tk-chron-btn", type: "button", title: `Switch to ${WORLD_KITS[next].en}`,
      onclick: () => { WorldView.setKit(next); viewTK(w.n); } }, `🎨 画风：${WORLD_KITS[kit].zh} ${WORLD_KITS[kit].en}`));
    // Scenes replayed outside the node map: words only, no walking or effects.
    const still = { w, actors: {}, leader: { x: 0, y: 0 }, party: [], pos: () => ({ x: 0, y: 0 }), actor: () => null, moveActor: async () => {}, addFx: () => 0 };
    const run = async steps => { TKStory.busy = true; try { await TKStory.play(still, steps); } finally { TKStory.busy = false; } };
    chron.onclick = () => tkChronicle(w, still);
    if (!TK.seen(`${w.n}:opening`)) { await run(w.opening); TK.markSeen(`${w.n}:opening`); if (nav !== routeSeq) return; }
    const ret = TKView.takeReturn();
    info.append(h("div", { class: "tk-info-text" }, [h("b", {}, `${w.zh} ${w.name}`),
      h("div", { class: "meta" }, "用方向键移动，按回车对话；头上有 ! 的人会给你出题。Move with WASD or the arrow keys, Enter to talk. People marked ! will set you a problem.")]));
    try {
      await WorldView.mount({
        w, host, ret: ret && ret.world === w.n ? ret : null,
        onPuzzle: key => TKOverlay.open(w.n, key),  // the board comes up over the map
        onBoss: async () => { if (!TK.seen(`${w.n}:closing`)) { await run(w.closing); TK.markSeen(`${w.n}:closing`); } },
      });
    } catch (e) { host.textContent = e.message; }
    return;
  }
  if (typeof WorldView !== "undefined") WorldView.destroy();
  const map = new TKMap(w, host);
  TKView.map = map;
  await map.init();
  if (nav !== routeSeq) return;

  const showInfo = key => {
    map.select(key);
    const node = map.N[key], open = TK.open(w, key), clr = TK.cleared(key), scene = node.scene && w.scenes[node.scene];
    info.innerHTML = "";
    const story = node.role === "main" || node.role === "boss"
      ? (clr && scene ? `Story: ${scene.title}` : "A main story point")
      : (clr && scene ? `Side story: ${scene.title}` : "Side story: ???");
    info.append(h("div", { class: "tk-info-text" }, [
      h("b", {}, node.place),
      h("div", { class: "meta" }, [TK.roleLabel(node), node.grade, clr ? "cleared ★" : open ? "" : "locked"].filter(Boolean).join(" · ")),
      h("div", { class: "meta" }, story),
    ]));
    const play = h("button", { class: "tk-play", type: "button" }, clr ? "Play again ▶" : "Play ▶");
    play.disabled = !open && !clr;
    play.onclick = () => enter(key);
    info.append(play);
  };
  // At a fork: offer both roads.
  const showFork = (from, nexts) => {
    info.innerHTML = "";
    info.append(h("div", { class: "tk-info-text" }, [h("b", {}, "The road forks"), h("div", { class: "meta" }, "Both roads rejoin ahead. Each tells a different side story.")]));
    const opts = h("div", { class: "tk-fork" });
    for (const k of nexts) {
      const node = map.N[k], long = node.role === "side";
      let len = 0, cur = k;
      while (cur && map.N[cur].role === node.role) { len++; cur = TK.succs(w, cur)[0]; }
      const b = h("button", { type: "button", class: long ? "" : "short" }, [
        h("b", {}, long ? "Long road" : "Mountain trail"),
        h("span", {}, `${len} level${len > 1 ? "s" : ""} · ${node.grade}`),
      ]);
      b.onclick = async () => { info.innerHTML = ""; await map.walkTo(k); showInfo(k); };
      opts.append(b);
    }
    info.append(opts);
  };
  const enter = async key => {
    if (TK.at(w.n) !== key) await map.walkTo(key);
    // zoom into the node, then open the level
    const n = map.N[key];
    host.style.transformOrigin = `${n.x / TK_W * 100}% ${n.y / TK_H * 100}%`;
    host.classList.add("tk-zoom-in");
    setTimeout(() => { location.hash = `#/tk/${w.n}/${key}`; }, 430);
  };
  // After a scene: walk on to the next level, or offer the fork.
  const advance = async from => {
    const nexts = TK.succs(w, from).filter(k => !TK.cleared(k));
    if (nexts.length === 1) { await map.walkTo(nexts[0]); showInfo(nexts[0]); }
    else if (nexts.length > 1) showFork(from, nexts);
    else showInfo(from);
  };
  map.onSelect = key => {
    if (TKStory.busy) return;
    if (map.sel === key && (TK.open(w, key) || TK.cleared(key))) { enter(key); return; }
    showInfo(key);
    if ((TK.open(w, key) || TK.cleared(key)) && TK.at(w.n) !== key) map.walkTo(key);
  };
  chron.onclick = () => tkChronicle(w, map);

  const ret = TKView.takeReturn();
  const run = async steps => { TKStory.busy = true; try { await TKStory.play(map, steps); } finally { TKStory.busy = false; } };
  if (ret && ret.world === w.n) {
    const n2 = map.N[ret.key];
    host.style.transformOrigin = `${n2.x / TK_W * 100}% ${n2.y / TK_H * 100}%`;
    host.classList.add("tk-zoom-out");
    setTimeout(() => host.classList.remove("tk-zoom-out"), 500);
    if (ret.win) {
      map.select(ret.key);
      await new Promise(r => setTimeout(r, 450));
      map.addFx("sparkle", n2.x, n2.y - 4);
      const sc = n2.scene && w.scenes[n2.scene], id = `${w.n}:${n2.scene}`;
      if (sc && !TK.seen(id)) { await run(sc.steps); TK.markSeen(id); }
      if (n2.role === "boss" && !TK.seen(`${w.n}:closing`)) { await run(w.closing); TK.markSeen(`${w.n}:closing`); }
      if (n2.role === "boss") showDone(); else await advance(ret.key);
      return;
    }
    showInfo(ret.key);
    return;
  }
  function showDone() {
    info.innerHTML = "";
    info.append(h("div", { class: "tk-info-text" }, [h("b", {}, `★ World ${w.n} complete`), h("div", { class: "meta" }, "World 2, Hulao Pass, is coming next.")]));
  }
  if (!TK.seen(`${w.n}:opening`)) {
    await run(w.opening); TK.markSeen(`${w.n}:opening`);
  }
  const here = TK.at(w.n);
  if (TK.cleared(`${w.n}-boss`)) { showDone(); return; }
  if (TK.isStart(here) || TK.cleared(here)) await advance(here);
  else showInfo(here);
}

const TK_ROLE_ZH = { main: "主线", side: "支线 · 远路", short: "支线 · 捷径", boss: "首领", challenge: "挑战" };
const TK_BOSS_ZH = { zhangbao: "地公将军张宝" };

// A campaign level's problem: the node (story beat or town challenger) and its
// current draw from the pool; null if it isn't open.
async function tkLevelData(worldN, key) {
  await TK.load();
  const w = TK.world(worldN);
  if (w && !TK.node(w, key) && typeof WorldData !== "undefined") await WorldData.region(w.n);  // a challenger in the world
  const node = w && (TK.node(w, key) || (typeof WorldData !== "undefined" && WorldData.node(w, key)));
  if (!node || !(node.town || TK.open(w, key) || TK.cleared(key))) return null;
  const [bookId, pid] = TK.problemRef(node);
  const src = await getBook(bookId);
  const p = src.problems.find(x => x.id === pid);
  return { w, node, src, p, book: Object.assign({}, src, { problems: [p] }) };
}

// The board and its panels, built into host. opts: back() leaves, again() deals
// a new problem after a slip, onWin() runs once a flawless solve is saved.
function tkLevelBuild(host, worldN, key, { w, node, src, p, book }, { back, again, onWin }) {
  const svg = document.createElementNS(SVGNS, "svg");
  const boardCard = h("div", { class: "board-card" });
  boardCard.append(svg);
  const status = h("div", { id: "status" });
  const turnBadge = h("span", { class: "badge turn" }, "黑先 Black to play");
  const btnExplore = h("button", {}, "Explore");
  const treeBox = h("div", { class: "movetree", style: "height:auto; max-height:320px" });
  const note = h("div", { class: "source-note", style: "display:none" });
  const treePanel = h("div", { class: "panel", style: "display:none" }, [h("h2", {}, "解答 Solution tree"), treeBox]);
  const verdict = h("div", { class: "tk-verdict" });
  const bossPanel = node.boss ? h("div", { class: "panel tk-boss" }, [
    TKArt.get(node.boss.who, "bust"),
    h("div", {}, [h("b", {}, [TK_BOSS_ZH[node.boss.who] ? `${TK_BOSS_ZH[node.boss.who]} · ` : "", node.boss.title]),
      h("p", { class: "zh", lang: "zh-CN" }, node.boss.taunt_zh ? `“${node.boss.taunt_zh}”` : ""), h("p", {}, `“${node.boss.taunt}”`),
      ...(TKVoice.has(node.boss.taunt_vid) ? [h("button", { class: "tk-say", type: "button", onclick: () => TKVoice.play(node.boss.taunt_vid) }, "🔊")] : [])]),
  ]) : null;
  if (node.boss) TKVoice.play(node.boss.taunt_vid);
  const aside = h("aside", {}, [
    ...(bossPanel ? [bossPanel] : []),
    h("div", { class: "panel" }, [
      h("h2", {}, `第${worldN}卷 ${w.zh} · World ${worldN} · ${w.name}`),
      h("div", { class: "meta-title" }, [`${node.place_zh || node.place} · ${TK_ROLE_ZH[node.role] || ""}`,
        h("span", { class: "tk-en" }, ` ${node.place} · ${TK.roleLabel(node)}`)]),
      h("div", { class: "meta-sub" }, [node.role === "boss" ? "" : `出自 from ${src.title} · `, p.url ? h("a", { href: p.url, target: "_blank" }, "来源 source")
                                                                 : h("a", { href: `https://www.101weiqi.com/q/${p.id}/`, target: "_blank" }, "来源 source")]),
      h("div", { class: "badges" }, [...(p.lv || node.grade ? [h("span", { class: "badge" }, p.lv || node.grade)] : []), ...(p.qt ? [h("span", { class: "badge" }, p.qt)] : []), turnBadge]),
    ]),
    h("div", { class: "panel" }, [h("h2", {}, "状态 Status"), status, note, verdict]),
    treePanel,
    h("div", { class: "panel" }, [
      h("h2", {}, "操作 Controls"),
      h("div", { class: "controls" }, [
        h("button", { onclick: () => trainer.undo() }, "悔棋 Undo"),
        h("button", { onclick: () => trainer.hint() }, "提示 Hint"),
        h("button", { onclick: () => trainer.reset() }, "重来 Reset"),
        h("button", { class: "wide", onclick: back }, "← 返回 Back"),
      ]),
    ]),
  ]);
  const player = h("div", { class: "player tk-level" });
  player.append(boardCard, aside);
  host.append(player);
  host.classList.add("tk-enter");
  setTimeout(() => host.classList.remove("tk-enter"), 500);
  trainer = new Trainer(book, 0, { svg, boardCard, status, turnBadge, btnExplore, treePanel, treeBox, note, noEngine: true });
  btnExplore.addEventListener("click", () => trainer.toggleExplore());
  window.__trainer = trainer;
  const t = trainer;
  let settled = false;  // the first result decides the level; a reset can't undo a slip
  const onResult = e => {
    if (!verdict.isConnected) return removeEventListener("tczw:result", onResult);
    if (trainer !== t || settled) return;
    settled = true;
    verdict.innerHTML = "";
    if (e.detail === "ok" && !t.flawed) {
      TK.markCleared(key);
      onWin();
      verdict.className = "tk-verdict win";
      verdict.append(h("b", {}, node.role === "boss" ? "★ 击败首领！Boss defeated!" : "★ 完美！Flawless!"), h("button", { onclick: back }, "继续 Continue ▸"));
    } else {
      TK.slip(node);
      verdict.className = "tk-verdict slip";
      verdict.append(h("b", {}, e.detail === "ok" ? `解出了，但不算完美。Solved, but not flawless (${t.flawed}).` : "敌人识破了！The enemy saw through it!"),
        h("span", {}, " 换个思路。Try another way."),
        h("button", { onclick: () => { host.classList.add("tk-flip"); setTimeout(() => { host.classList.remove("tk-flip"); again(); }, 260); } }, "换一题 New problem →"));
    }
  };
  addEventListener("tczw:result", onResult);
}

// A level as its own page (direct links, and worlds still on the node map).
async function viewTKLevel(worldN, key) {
  const nav = routeSeq;
  root.innerHTML = `<div class="loading">Loading…</div>`;
  const d = await tkLevelData(worldN, key);
  if (nav !== routeSeq) return;
  if (!d) { location.hash = `#/tk/${worldN || 1}`; return; }
  if (!d.node.town) TK.setAt(worldN, key);
  crumbs.innerHTML = "";
  crumbs.append(h("a", { href: "#/" }, "Library"), " / ", h("a", { href: `#/tk/${worldN}` }, `Three Kingdoms · World ${worldN}`), ` / ${d.node.place}`);
  root.innerHTML = "";
  tkLevelBuild(root, worldN, key, d, {
    back: () => { root.classList.add("tk-leave"); setTimeout(() => { root.classList.remove("tk-leave"); location.hash = `#/tk/${worldN}`; }, 320); },
    again: () => viewTKLevel(worldN, key),
    onWin: () => { try { sessionStorage.setItem("tk-return", JSON.stringify({ world: worldN, key, win: true })); } catch {} },
  });
}

// A level laid over the explorable world: the map stays behind, dimmed.
// Resolves true after a flawless solve, false if the player backs out.
const TKOverlay = {
  open(worldN, key) {
    return new Promise(async resolve => {
      document.querySelectorAll(".tk-overlay").forEach(el => el.remove());
      const box = h("div", { class: "tk-overlay-box", role: "dialog", "aria-modal": "true", "aria-label": "Go problem" });
      const wrap = h("div", { class: "tk-overlay" }, [box]);
      document.body.append(wrap);
      let won = false, closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        if (trainer) { trainer.alive = false; clearTimeout(trainer.replyTimer); trainer = null; }
        removeEventListener("keydown", onKey); removeEventListener("hashchange", onNav);
        wrap.classList.add("tk-leave");
        setTimeout(() => { wrap.remove(); resolve(won); }, 280);
      };
      const onKey = e => { if (e.key === "Escape") close(); };
      const onNav = () => close();
      addEventListener("keydown", onKey); addEventListener("hashchange", onNav);
      const show = async () => {
        box.innerHTML = `<div class="loading">Loading…</div>`;
        const d = await tkLevelData(worldN, key);
        if (closed) return;
        if (!d) return close();
        box.innerHTML = "";
        tkLevelBuild(box, worldN, key, d, { back: close, again: show, onWin: () => { won = true; } });
      };
      await show();
    });
  },
};

// Every story scene in the novel's order; the ones not yet seen stay hidden.
function tkChronicle(w, map) {
  const items = [["opening", "Prologue", null]];
  const order = ["n1", "n2", "a1", "a2", "a3", "as", "n3", "n4", "n5", "b1", "b2", "b3", "bs", "n6", "n7", "boss"];
  const nodes = w.nodes.filter(n => n.scene).sort((a, b) => order.indexOf(a.key.split("-")[1]) - order.indexOf(b.key.split("-")[1]));
  for (const n of nodes) items.push([n.scene, w.scenes[n.scene].title, n]);
  items.push(["closing", "Epilogue: the inspector, and what came next", null]);
  const wrap = h("div", { class: "tk-scroll-wrap" });
  const list = h("div", { class: "tk-chron" });
  for (const [id, title, n] of items) {
    const seen = TK.seen(`${w.n}:${id}`), side = n && (n.role === "side" || n.role === "short");
    const b = h("button", { type: "button", class: (seen ? "" : "unseen ") + (side ? "side" : "") }, [
      h("b", {}, seen ? title : side ? `??? — ${n.role === "short" ? "take the mountain trail" : "take the long road"}` : "???"),
      h("span", {}, n ? n.place : ""),
    ]);
    b.disabled = !seen;
    b.onclick = async () => {
      wrap.remove();
      const steps = id === "opening" ? w.opening : id === "closing" ? w.closing : w.scenes[id].steps;
      TKStory.busy = true;
      try { await TKStory.play(map, steps.filter(s => s[0] !== "party")); } finally { TKStory.busy = false; }
    };
    list.append(b);
  }
  wrap.append(h("div", { class: "tk-scroll" }, [h("h3", {}, `Chronicle · ${w.name}`), list,
    h("button", { class: "tk-scroll-go", type: "button", onclick: () => wrap.remove() }, "Close")]));
  document.body.append(wrap);
}
