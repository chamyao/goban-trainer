/* ---- Three Kingdoms: explorable towns (Phaser 3) ----
   Structure follows Michael Hadley's "Modular Game Worlds in Phaser 3":
   a Tiled map for the ground, an object layer for props and people, an
   arcade-physics player the camera follows, and depth sorted by feet so
   you can walk behind houses and trees. Story beats are spots and people
   you walk up to; Space / E talks. Talking to a challenger opens the real
   level page (viewTKLevel); winning returns you to where you stood and the
   scene plays here. Progress lives in the campaign save (TK.cleared/seen).
   Art: Jade pack (assets/tk/jade, CC-BY Willibab) for the town; the heroes
   and portraits come from TKArt (tk.js). Phaser loads only when a town opens. */

const TOWN_T = 16;

// Sprites cut from the Jade sheets: [sheet, x, y, w, h, solid]. solid is the
// blocking box at the feet: [width, height] centred on the bottom edge.
const TOWN_PROPS = {
  inn: ["buildings", 160, 3, 96, 71, [90, 44]],
  teahouse: ["buildings", 0, 80, 96, 64, [92, 40]],
  house: ["buildings", 16, 19, 48, 45, [46, 30]],
  home: ["buildings", 0, 144, 83, 48, [80, 32]],
  farmhouse: ["buildings", 0, 144, 83, 48, [80, 32]],
  office: ["buildings", 173, 89, 70, 87, [64, 46]],
  notice: ["@noticeboard", 0, 0, 40, 34, [36, 8]],
  planter: ["buildings", 192, 184, 48, 24, [46, 10]],
  lantern: ["town", 80, 224, 16, 32, [6, 4]],
  fence: ["town", 32, 195, 48, 13, [48, 6]],
  fenceV: ["town", 0, 144, 16, 16, [6, 16]],
  peach: ["nature", 172, 3, 36, 40, [10, 6]],
  cherry: ["nature", 224, 3, 32, 40, [10, 6]],
  oak: ["nature", 172, 51, 36, 41, [10, 6]],
  oak2: ["nature", 224, 51, 32, 41, [10, 6]],
  cypress: ["town", 193, 48, 14, 64, [8, 6]],
  cypress2: ["town", 209, 48, 14, 64, [8, 6]],
  bamboo: ["nature", 64, 0, 16, 32, [6, 4]],
  bush: ["nature", 0, 128, 16, 16, [10, 4]],
  rock: ["nature", 144, 128, 16, 16, [12, 6]],
  flowers: ["nature", 0, 208, 16, 16, null],
  tuft: ["nature", 96, 192, 16, 16, null],
  lotus: ["nature", 144, 0, 32, 32, null],
  gotable: ["@gotable", 0, 0, 22, 14, [20, 8]],
};

// The two nameless old men who set Go problems: the Star Lords of the plan
// (docs/three-kingdoms-plan.md), unnamed until World 11.
Object.assign(TK_CHARS, {
  stargrey: { name: "Old man in grey", skin: "#ecc9a4", hair: "#e4e4e4", hat: "topknot", hatC: "#e4e4e4", pin: "#7a7a7a", robe: "#7c8088", trim: "#d8d2c0", beard: "long", beardC: "#f0f0f0", eyes: "kind" },
  starred: { name: "Old man in red", skin: "#ecc9a4", hair: "#e4e4e4", hat: "scholar", hatC: "#5a2a22", robe: "#a83a2c", trim: "#e6c14a", beard: "long", beardC: "#f0f0f0", eyes: "kind" },
});

/* ---------- the heroes in four directions, from TKArt's front sprites ---------- */
const TownArt = {
  // Recolour a front sprite into a back view: face becomes hair, beard becomes robe.
  back(who, frame) {
    const d = TK_CHARS[who], src = TKArt.get(who, "sprite", frame);
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext("2d"); c.drawImage(src, 0, 0);
    const img = c.getImageData(0, 0, cv.width, cv.height), p = img.data;
    const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const same = (i, col) => p[i] === col[0] && p[i + 1] === col[1] && p[i + 2] === col[2];
    const put = (i, col) => { p[i] = col[0]; p[i + 1] = col[1]; p[i + 2] = col[2]; };
    const hair = hex(d.hair || "#2a2228"), robe = hex(d.robe), beard = hex(d.beardC || d.hair || "#2a2228");
    const face = [d.skin, TKArt.shade(d.skin, -.18), "#2a2228", "#ffffff"].map(hex).concat([beard]);
    for (let y = 3; y <= 9; y++) for (let x = 3; x <= 10; x++) {
      const i = (y * cv.width + x) * 4;
      if (p[i + 3] && face.some(f => same(i, f))) put(i, hair);
    }
    for (let y = 10; y <= 14; y++) for (let x = 4; x <= 9; x++) {
      const i = (y * cv.width + x) * 4;
      if (p[i + 3] && same(i, beard) && !same(i, hair)) put(i, robe);
    }
    c.putImageData(img, 0, 0);
    return cv;
  },
  // Side view facing right, drawn as a true profile on the same 16x20 grid as
  // TKArt's front sprite. step: 0 stand, 1 stride with the arm forward,
  // 2 stand, 3 stride with the arm back.
  side(who, step) {
    const d = TK_CHARS[who], A = TKArt, g = A.grid(16, 20), O = 2;
    const s = (x, y, c) => A.set(g, x + O, y + 1, c), R = (x, y, w, h, c) => A.rect(g, x + O, y + 1, w, h, c);
    const skinS = A.shade(d.skin, -.18), robeS = A.shade(d.robe, -.22), arm = A.shade(d.robe, -.1), dark = "#2a2228";
    const hr = d.hair || dark, H = d.hatC, stride = step % 2 === 1, pole = d.weapon === "spear" || d.weapon === "glaive";
    // a pole weapon is held upright in the front hand
    if (pole) {
      for (let y = 1; y < 16; y++) s(9, y, d.weapon === "glaive" ? "#6a4a2a" : "#7a5a3a");
      if (d.weapon === "spear") { s(9, 0, "#d0d4d8"); s(9, -1, "#d0d4d8"); s(10, 0, "#d0d4d8"); }
      else { R(9, -2, 2, 3, "#d0d4d8"); s(11, -1, "#d0d4d8"); s(9, 1, "#3f9a5a"); }
    }
    // legs
    if (stride) { R(6, 13, 2, 2, robeS); R(1, 13, 2, 2, robeS); R(6, 15, 3, 1, dark); R(0, 15, 2, 1, dark); }
    else { R(3, 13, 2, 2, robeS); R(5, 13, 2, 2, robeS); R(3, 15, 2, 1, dark); R(5, 15, 3, 1, dark); }
    // body
    const w = d.fat ? 8 : 7, x0 = d.fat ? 0 : 1;
    R(2, 9, 6, 1, d.robe); R(x0, 10, w, 3, d.robe); R(x0, 12, w, 1, robeS); R(x0, 11, w, 1, d.trim);
    s(6, 9, d.trim); s(7, 10, d.trim);
    if (d.weapon === "swords" || d.weapon === "sword") R(0, 11, 2, 1, "#d0d4d8");  // scabbard at the hip, pointing back
    // the near arm swings opposite the front leg
    if (pole) { R(5, 10, 3, 1, arm); s(8, 10, d.skin); }
    else if (step === 1) { R(5, 10, 2, 2, arm); s(7, 11, d.skin); }
    else if (step === 3) { R(2, 10, 2, 2, arm); s(1, 11, d.skin); }
    else { R(4, 10, 2, 2, arm); s(4, 12, d.skin); }
    // head in profile, facing right
    R(2, 2, 7, 7, d.skin); R(2, 8, 7, 1, skinS); s(9, 5, d.skin); s(9, 6, skinS);  // nose
    if (d.fat) { R(2, 7, 8, 2, d.skin); }
    R(2, 2, 2, 5, hr); s(4, 2, hr); R(2, 1, 6, 1, hr);                              // hair at the back of the head
    if (d.ears) R(4, 4, 2, 4, skinS); else R(4, 4, 1, 2, skinS);
    const ey = 5;
    if (d.eyes === "round") { s(6, ey, "#fff"); s(7, ey, dark); R(6, ey - 2, 2, 1, dark); }
    else if (d.eyes === "phoenix") { s(7, ey, dark); s(6, ey - 1, dark); R(6, ey - 2, 3, 1, dark); }
    else if (d.eyes === "narrow") { R(6, ey, 2, 1, dark); s(7, ey - 2, dark); }
    else if (d.eyes === "wild") { s(7, ey, dark); s(6, ey, "#fff"); R(6, ey - 2, 2, 1, dark); s(8, ey - 3, dark); }
    else s(7, ey, dark);
    s(8, 7, A.shade(d.skin, -.4));  // mouth
    // beard
    const bc = d.beardC || hr;
    if (d.beard === "long") { R(6, 7, 3, 1, bc); R(5, 8, 4, 3, bc); R(6, 11, 2, 1, bc); }
    else if (d.beard === "bristle") { R(5, 7, 5, 2, bc); s(10, 7, bc); s(9, 9, bc); s(5, 9, bc); s(7, 9, bc); }
    else if (d.beard === "short") { R(5, 7, 4, 2, bc); }
    else if (d.beard === "goatee") { R(7, 8, 2, 2, bc); }
    else if (d.beard === "thin") { s(8, 8, bc); }
    // hats, in profile
    if (d.hat === "topknot") { R(2, 1, 6, 2, hr); R(4, -1, 2, 2, hr); s(3, 0, d.pin || "#e6c14a"); s(6, 0, d.pin || "#e6c14a"); }
    else if (d.hat === "scarf") { R(2, 0, 7, 3, H); R(3, -1, 4, 1, H); R(1, 1, 1, 6, H); s(0, 6, H); }
    else if (d.hat === "band") { R(2, 0, 6, 2, hr); s(3, -1, hr); s(6, -1, hr); R(2, 2, 7, 1, H); s(1, 3, H); s(0, 4, H); }
    else if (d.hat === "guan") { R(3, -1, 5, 2, H); R(2, 1, 7, 2, H); s(1, 2, H); }
    else if (d.hat === "yellowband") { R(2, 1, 6, 1, hr); R(2, 2, 7, 1, H); R(1, 3, 1, 2, H); }
    else if (d.hat === "wild") { R(2, 0, 6, 2, hr); s(1, -1, hr); s(4, -2, hr); s(7, -1, hr); R(2, 2, 7, 1, H); R(1, 3, 2, 7, hr); }
    else if (d.hat === "helmet") { R(2, 0, 7, 3, H); R(3, -1, 5, 1, H); s(5, -2, "#c8392c"); R(1, 3, 2, 4, H); }
    else if (d.hat === "scholar") { R(2, 0, 7, 3, H); R(3, -1, 4, 1, H); s(1, 2, H); s(0, 3, H); }
    else if (d.hat === "straw") { R(0, 2, 11, 1, H); R(3, 0, 5, 2, H); R(4, -1, 3, 1, H); }
    return A.canvas(A.outline(g));
  },
  // Lift one foot of a front or back sprite by a pixel: the step frames of the walk.
  step(src, leftFoot) {
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext("2d", { willReadFrequently: true }); c.drawImage(src, 0, 0);
    const img = c.getImageData(0, 0, cv.width, cv.height), p = img.data, W = cv.width;
    const [x0, x1] = leftFoot ? [3, 6] : [7, 10];
    for (let y = 13; y < cv.height; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4, j = ((y + 1) * W + x) * 4;
      for (let k = 0; k < 4; k++) p[i + k] = y + 1 < cv.height ? p[j + k] : 0;
    }
    c.putImageData(img, 0, 0);
    return cv;
  },
  // A covered notice board with the governor's call for volunteers, in Jade's outlined style.
  noticeBoard() {
    const A = TKArt, g = A.grid(40, 34), wood = "#b8742c", woodD = "#8a5020", roof = "#c8392c", roofD = "#8a2418", paper = "#f4ead2";
    A.rect(g, 1, 3, 38, 3, roof); A.rect(g, 3, 1, 34, 2, roof); A.rect(g, 1, 5, 38, 1, roofD); A.rect(g, 0, 4, 1, 1, roof); A.rect(g, 39, 4, 1, 1, roof);
    A.rect(g, 4, 6, 3, 27, wood); A.rect(g, 33, 6, 3, 27, wood); A.rect(g, 6, 6, 1, 27, woodD); A.rect(g, 35, 6, 1, 27, woodD);
    A.rect(g, 7, 8, 26, 16, woodD); A.rect(g, 8, 9, 24, 14, wood);
    A.rect(g, 10, 10, 9, 12, paper); A.rect(g, 21, 11, 9, 10, paper);
    for (let y = 12; y < 21; y += 2) { A.rect(g, 12, y, 5, 1, "#3a2a22"); if (y < 19) A.rect(g, 23, y + 1, 5, 1, "#3a2a22"); }
    A.rect(g, 13, 20, 3, 1, "#c8392c");  // the governor's seal
    A.rect(g, 3, 32, 5, 1, woodD); A.rect(g, 32, 32, 5, 1, woodD);
    return A.canvas(A.outline(g));
  },
  // The "!" over someone who will set you a problem.
  bang() {
    const A = TKArt, g = A.grid(7, 12);
    A.rect(g, 2, 1, 3, 6, "#ffe066"); A.rect(g, 2, 8, 3, 2, "#ffe066"); A.rect(g, 4, 1, 1, 6, "#e6b422");
    return A.canvas(A.outline(g, "#3a2416"));
  },
  // A low weiqi table with a game in progress.
  goTable() {
    const A = TKArt, g = A.grid(22, 14), wood = "#c8903c", woodD = "#8a5a22";
    A.rect(g, 1, 1, 20, 9, "#e2b468"); A.rect(g, 1, 10, 20, 1, woodD);
    for (let i = 0; i < 5; i++) { A.rect(g, 3 + i * 4, 2, 1, 7, "#7a5228"); A.rect(g, 2, 2 + i * 1.6 | 0, 18, 1, "#7a5228"); }
    for (const [x, y, c] of [[3, 4, "#222"], [7, 3, "#fff"], [11, 5, "#222"], [15, 4, "#fff"], [7, 7, "#222"], [15, 7, "#fff"], [11, 3, "#fff"]]) A.rect(g, x, y, 2, 2, c);
    A.rect(g, 2, 11, 2, 2, wood); A.rect(g, 18, 11, 2, 2, wood);
    return A.canvas(A.outline(g));
  },
  // Register textures hero-<who>-<dir>-<frame> and walk animations.
  hero(scene, who) {
    const front = TKArt.get(who, "sprite", 0), back = this.back(who, 0);
    const frames = {
      down: [front, this.step(front, true), front, this.step(front, false)],
      up: [back, this.step(back, false), back, this.step(back, true)],
      right: [0, 1, 2, 3].map(k => this.side(who, k)),
    };
    frames.left = frames.right.map(cv => TKArt.flip(cv));
    for (const [dir, list] of Object.entries(frames)) {
      list.forEach((cv, k) => scene.textures.addCanvas(`h-${who}-${dir}-${k}`, cv));
      scene.anims.create({ key: `h-${who}-${dir}`, frames: list.map((_, k) => ({ key: `h-${who}-${dir}-${k}` })), frameRate: 8, repeat: -1 });
    }
  },
  // Jade townsfolk: 8 people per sheet, RPG Maker layout, 16x21 frames.
  folk(scene, n) {
    const sheet = n < 8 ? "folk1" : "folk2", c = n % 8, col0 = (c % 4) * 3, row0 = Math.floor(c / 4) * 4;
    const dirs = ["down", "left", "right", "up"];
    dirs.forEach((dir, r) => {
      const key = `f-${n}-${dir}`;
      if (scene.anims.exists(key)) return;
      const fr = [0, 1, 2, 1].map(k => (row0 + r) * 12 + col0 + k);
      scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(sheet, { frames: fr }), frameRate: 6, repeat: -1 });
    });
    return { sheet, still: dir => (row0 + dirs.indexOf(dir)) * 12 + col0 + 1 };
  },
};

/* ---------- what people say, and who challenges you ---------- */
const TOWN_LINES = {
  storyteller: [["n", "An old storyteller taps his clapper-board. “Sit, sit! Tales of the Yellow Heaven, and of a boy named Cao Cao…”"],
    ["n", "(His side stories will be told here.)"]],
  "zhangfei-wait": [["say", "zhangfei", "Hm? Go read the notice, friend, then we'll talk."]],
  folk2: [["n", "“Liu Bei? The sandal-seller? Kind man. Ears down to his shoulders, you know.”"]],
  folk5: [["n", "“The governor wants volunteers. My son says he'll go.”"]],
  "exit-west": [["n", "The road back to Lousang Village. (Not built yet.)"]],
};

// Optional challengers: each sets a problem of the world's grade, Pokémon-trainer style.
const TOWN_CHALLENGES = {
  elder: { intro: [["n", "An old man sits over a weiqi board in the square. “You have the look of a thinker. Sit, play me one.”"]],
    win: [["n", "“Ha! Quick eyes. The governor could use a man like you.”"]], done: [["n", "“Come back when you've grown sharper, and we'll play again.”"]] },
  innkeeper: { intro: [["n", "“Wine's on the house if you can solve the one my regulars can't.”"]],
    win: [["n", "“Well I never. Drink up, then!”"]], done: [["n", "“Still the only one who's cracked it.”"]] },
  farmer: { intro: [["n", "“Weiqi's like farming: you claim the land, then you have to hold it. Try this.”"]],
    win: [["n", "“Held it, and well. Zhang Fei's lucky to know you.”"]], done: [["n", "“Fine soil this year.”"]] },
  scholar: { intro: [["n", "A clerk from the county office looks up. “The magistrate set this one. Nobody here has solved it.”"]],
    win: [["n", "“Remarkable. I'll tell the magistrate a sandal-seller did it.”"]], done: [["n", "“The magistrate still doesn't believe me.”"]] },
};

const TownStory = {
  // Which part of the opening the player has reached, from the campaign save.
  stage(w) {
    if (!TK.cleared(`${w.n}-n1`)) return 0;
    if (!TK.seen(`${w.n}:inn`)) return 1;
    if (!TK.cleared(`${w.n}-n2`)) return 2;
    return 3;
  },
  goal: ["Read the notice in the town square.", "Find the wine at the village inn, north of the square.",
    "Go to the Peach Garden behind Zhang Fei's farm (east).", "The brothers are sworn. Take the south road to war."],
  // A town challenger as a campaign level: a pool drawn from the world's problems.
  node(w, key) {
    const m = key.match(/^(\d+)-zhuo-(\w+)$/);
    if (!m || !TOWN_CHALLENGES[m[2]]) return null;
    const all = [], seen = new Set();
    for (const n of w.nodes) if (n.pool && n.role !== "boss") for (const p of n.pool) { const k = p.join(":"); if (!seen.has(k)) { seen.add(k); all.push(p); } }
    const i = Object.keys(TOWN_CHALLENGES).indexOf(m[2]) * 11 % all.length;
    return { key, town: true, place: "Zhuo County", role: "challenge", grade: w.grades.split("–")[0], pool: all.slice(i).concat(all.slice(0, i)) };
  },
};

/* ---------- the scene (made once Phaser has loaded) ---------- */
function townSceneClass() {
  return class TownScene extends Phaser.Scene {
    constructor() { super("town"); }
    init(opts) { this.opts = opts; this.w = opts.w; }

    preload() {
      const A = "assets/tk/jade/";
      for (const s of ["buildings", "town", "nature"]) this.load.image(s, A + s + ".png");
      this.load.image("tiles", A + "tiles.png");
      this.load.spritesheet("folk1", A + "folk1.png", { frameWidth: 16, frameHeight: 21 });
      this.load.spritesheet("folk2", A + "folk2.png", { frameWidth: 16, frameHeight: 21 });
      this.load.tilemapTiledJSON("zhuo", "data/tk_town_zhuo.json?v=2");
    }

    create() {
      const w = this.w;
      this.story = w.scenes;
      const map = this.make.tilemap({ key: "zhuo" });
      map.createLayer("ground", map.addTilesetImage("ground", "tiles"), 0, 0);
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.solids = this.physics.add.staticGroup();

      this.textures.addCanvas("@noticeboard", TownArt.noticeBoard());
      this.textures.addCanvas("@gotable", TownArt.goTable());
      this.textures.addCanvas("@bang", TownArt.bang());
      for (const [name, [sheet, x, y, wd, ht]] of Object.entries(TOWN_PROPS)) if (sheet[0] !== "@") this.textures.get(sheet).add(name, 0, x, y, wd, ht);
      for (const who of ["liubei", "guanyu", "zhangfei", "stargrey", "starred"]) TownArt.hero(this, who);

      const props = o => Object.fromEntries((o.properties || []).map(p => [p.name, p.value]));
      this.spots = {}; this.npcs = [];
      for (const o of map.getObjectLayer("objects").objects) {
        if (o.type === "prop") this.addProp(o.name, o.x, o.y);
        else if (o.type === "spot") this.spots[o.name] = { x: o.x, y: o.y };
        else if (o.type === "spawn") this.spawn = { x: o.x, y: o.y };
        else if (o.type === "npc") this.addNpc(o.name, o.x, o.y, props(o));
      }

      // Back from a problem: stand where you left off.
      let at = this.spawn, face = "right";
      try { const s = JSON.parse(sessionStorage.getItem("tk-town-pos")); if (s && s.world === w.n) { at = s; face = s.f; } } catch {}
      this.player = this.physics.add.sprite(at.x, at.y, "h-liubei-down-0").setOrigin(.5, 1);
      this.player.body.setSize(10, 6).setOffset(4, 14);
      this.player.setCollideWorldBounds(true);
      this.player.facing = face;
      this.physics.add.collider(this.player, this.solids);
      this.physics.add.collider(this.player, this.npcs.map(n => n.spr));
      this.followers = [];
      this.trail = [];

      const cam = this.cameras.main;
      cam.startFollow(this.player, true, .15, .15);
      cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      cam.setRoundPixels(true);

      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,SPACE,E,ENTER,Z");
      for (const k of ["SPACE", "E", "ENTER", "Z"]) this.keys[k].on("down", () => this.act());
      this.ui = TownUI.mount(this, this.opts.host);
      this.sync();
      cam.fadeIn(300);
      if (this.opts.ret) this.time.delayedCall(350, () => this.returned(this.opts.ret));
    }

    // Bring people and the party in line with the story so far.
    sync() {
      const st = TownStory.stage(this.w);
      this.ui.goal(TownStory.goal[st]);
      const show = (id, on) => { const n = this.npcs.find(m => m.id === id); if (n) { n.spr.setVisible(on); n.spr.body.enable = on; } };
      show("guanyu", false);
      show("zhangfei", st < 2);
      show("stargrey", st < 3); show("starred", st < 3);
      if (st >= 2 && !this.followers.length) this.joinParty(["guanyu", "zhangfei"]);
      for (const n of this.npcs) if (n.mark) n.mark.setVisible(n.spr.visible && !TK.cleared(n.challenge));
    }

    addProp(name, x, y) {
      const def = TOWN_PROPS[name];
      if (!def) return;
      const img = def[0][0] === "@" ? this.add.image(Math.round(x), Math.round(y), def[0]) : this.add.image(Math.round(x), Math.round(y), def[0], name);
      img.setOrigin(.5, 1).setDepth(["flowers", "tuft", "lotus"].includes(name) ? y - 40 : y);
      const solid = def[5];
      if (solid) this.solids.add(this.add.zone(Math.round(x), Math.round(y - solid[1] / 2), solid[0], solid[1]));
      return img;
    }

    addNpc(id, x, y, p) {
      let spr, folk = null;
      if (p.who) spr = this.physics.add.sprite(x, y, `h-${p.who}-${p.face || "down"}-0`);
      else { folk = TownArt.folk(this, p.folk); spr = this.physics.add.sprite(x, y, folk.sheet, folk.still(p.face || "down")); }
      spr.setOrigin(.5, 1).setDepth(y).setImmovable(true);
      spr.body.setSize(10, 6).setOffset(3, spr.height - 6);
      const n = { id, spr, who: p.who, folk, folkN: p.folk, line: p.line, wander: !!p.wander, home: { x, y }, t: 0, dir: p.face || "down" };
      if (p.challenge) {
        n.challenge = `${this.w.n}-zhuo-${p.challenge}`; n.cid = p.challenge;
        n.mark = this.add.image(x, y - spr.height - 2, "@bang").setOrigin(.5, 1).setDepth(9999);
      }
      this.npcs.push(n);
      this.physics.add.collider(spr, this.solids);
      return n;
    }

    // What is the player facing? A person or a story spot within reach.
    target() {
      const P = this.player, v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[P.facing];
      const fx = P.x + v[0] * 12, fy = P.y - 3 + v[1] * 12;
      let best = null, bd = 20;
      for (const n of this.npcs) {
        if (!n.spr.visible) continue;
        const d = Math.hypot(n.spr.x - fx, n.spr.y - 3 - fy);
        if (d < bd) { bd = d; best = { kind: "npc", n }; }
      }
      for (const [k, s] of Object.entries(this.spots)) {
        const d = Math.hypot(s.x - fx, s.y - fy);
        if (d < 24 && d < bd) { bd = d; best = { kind: "spot", k }; }
      }
      return best;
    }

    act() {
      if (this.ui.busy()) { this.ui.advance(); return; }
      const t = this.target();
      if (!t) return;
      if (t.kind === "spot") return this.spot(t.k);
      const n = t.n, st = TownStory.stage(this.w);
      n.dir = { up: "down", down: "up", left: "right", right: "left" }[this.player.facing];
      this.faceNpc(n);
      if (n.id === "starred" || n.id === "stargrey") return this.spot("garden");
      if (n.id === "zhangfei" && st === 1) return this.talk(this.story.notice.steps.slice(2, 5).filter(s => s[0] === "say"));
      if (n.challenge) {
        const C = TOWN_CHALLENGES[n.cid];
        return TK.cleared(n.challenge) ? this.talk(C.done) : this.talk(C.intro, () => this.puzzle(n.challenge));
      }
      this.talk(TOWN_LINES[n.line] || [["n", "…"]]);
    }

    spot(k) {
      const st = TownStory.stage(this.w), notice = this.story.notice.steps;
      const inn = notice.findIndex(s => s[0] === "n" && s[1].startsWith("At the village inn"));
      if (k === "notice") {
        if (st === 0) return this.talk([["n", "The governor of You Province calls for volunteers against the Yellow Turbans. At the bottom, a weiqi problem: “Let any man who would lead volunteers show he can read a battle.”"]],
          () => this.puzzle(`${this.w.n}-n1`));
        return this.talk([["n", "The governor of You Province calls for volunteers against the Yellow Turbans."]]);
      }
      if (k === "inn") {
        if (st !== 1) return this.talk([["n", "The inn smells of wine and roast pork."]]);
        const g = this.npcs.find(n => n.id === "guanyu");
        g.spr.setVisible(true);
        return this.talk(notice.slice(inn), () => {
          TK.markSeen(`${this.w.n}:inn`); TK.setParty(this.w, ["liubei", "guanyu", "zhangfei"]);
          g.spr.setVisible(false); this.sync();
        });
      }
      if (k === "garden") {
        if (st < 2) return this.talk([["n", "Two old men sit over a weiqi board under the peach trees. They don't look up."]]);
        if (st === 2) return this.talk([
          ["n", "Under the peach trees two old men sit over a weiqi board, one in grey, one in red."],
          ["say", "starred", "Three young men, come to swear before Heaven? Heaven is listening. But first, show us how you read the stones."],
        ], () => this.puzzle(`${this.w.n}-n2`));
        return this.talk([["n", "Petals drift over the place where you swore. The weiqi board is still there."]]);
      }
      if (k === "exit-south") {
        if (st < 3) return this.talk([["n", "The road south leads to war. Finish your business in Zhuo County first."]]);
        return this.opts.onLeave && this.opts.onLeave("south");
      }
      this.talk(TOWN_LINES[k] || [["n", "…"]]);
    }

    // Open the problem on the level page; remember where we stood.
    puzzle(key) {
      const P = this.player;
      try { sessionStorage.setItem("tk-town-pos", JSON.stringify({ world: this.w.n, x: Math.round(P.x), y: Math.round(P.y), f: P.facing })); } catch {}
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(260, () => this.opts.onPuzzle(key));
    }

    // Back from a won problem: play what it unlocked.
    returned(ret) {
      if (!ret.win) return;
      const w = this.w, notice = this.story.notice.steps, inn = notice.findIndex(s => s[0] === "n" && s[1].startsWith("At the village inn"));
      const after = () => this.sync();
      if (ret.key === `${w.n}-n1`) {
        this.talk(notice.slice(0, inn), () => { TK.markSeen(`${w.n}:notice`); after(); });
        const zf = this.npcs.find(n => n.id === "zhangfei"); if (zf) { zf.spr.setPosition(this.player.x + 18, this.player.y); }
      } else if (ret.key === `${w.n}-n2`) {
        this.talk([["say", "stargrey", "Good. The road ahead forks, and fortune favours the one who reads it."],
          ["n", "When the brothers look up, the two old men are gone. Only the board remains, and a drift of petals."],
          ...this.story.oath.steps], () => { TK.markSeen(`${w.n}:oath`); after(); });
      } else {
        const id = (ret.key.match(/-zhuo-(\w+)$/) || [])[1];
        if (id && TOWN_CHALLENGES[id]) this.talk(TOWN_CHALLENGES[id].win, after); else after();
      }
    }

    joinParty(ids) {
      for (const id of ids) {
        const n = this.npcs.find(m => m.id === id);
        if (!n) continue;
        n.spr.setVisible(true); n.spr.body.enable = false;
        this.npcs = this.npcs.filter(m => m !== n);
        this.followers.push({ who: id, spr: n.spr });
      }
      this.trail = Array(60).fill({ x: this.player.x, y: this.player.y, f: this.player.facing });
    }

    talk(steps, done) { this.player.setVelocity(0); this.ui.dialog(steps, done); }

    faceNpc(n) {
      if (n.who) n.spr.setTexture(`h-${n.who}-${n.dir}-0`);
      else { n.spr.anims.stop(); n.spr.setFrame(n.folk.still(n.dir)); }
    }

    update(time, dt) {
      const P = this.player, K = this.keys;
      let vx = 0, vy = 0;
      if (!this.ui.busy()) {
        if (K.LEFT.isDown || K.A.isDown) vx -= 1;
        if (K.RIGHT.isDown || K.D.isDown) vx += 1;
        if (K.UP.isDown || K.W.isDown) vy -= 1;
        if (K.DOWN.isDown || K.S.isDown) vy += 1;
      }
      const speed = K.SHIFT.isDown ? 110 : 64, len = Math.hypot(vx, vy) || 1;
      P.setVelocity(vx / len * speed, vy / len * speed);
      if (vx || vy) {
        P.facing = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? "left" : "right") : (vy < 0 ? "up" : "down");
        P.anims.play(`h-liubei-${P.facing}`, true);
        P.anims.msPerFrame = K.SHIFT.isDown ? 85 : 135;
      } else { P.anims.stop(); P.setTexture(`h-liubei-${P.facing}-0`); }
      P.setDepth(P.y);

      if (vx || vy) { this.trail.unshift({ x: P.x, y: P.y, f: P.facing }); this.trail.length = 60; }
      this.followers.forEach((F, i) => {
        const p = this.trail[Math.min(this.trail.length - 1, (i + 1) * 14)] || { x: P.x, y: P.y, f: P.facing };
        const moving = Math.hypot(F.spr.x - p.x, F.spr.y - p.y) > .5;
        F.spr.setPosition(p.x, p.y).setDepth(p.y);
        if (moving) F.spr.anims.play(`h-${F.who}-${p.f}`, true); else { F.spr.anims.stop(); F.spr.setTexture(`h-${F.who}-${p.f}-0`); }
      });

      for (const n of this.npcs) {
        if (n.mark) n.mark.setPosition(n.spr.x, Math.round(n.spr.y - n.spr.height - 1 + Math.sin(time / 250) * 1.5));
        if (!n.wander || this.ui.busy()) { n.spr.setVelocity(0); continue; }
        n.t -= dt;
        if (n.t <= 0) {
          n.t = 900 + Math.random() * 2200;
          const away = Math.hypot(n.spr.x - n.home.x, n.spr.y - n.home.y) > 40;
          n.dir = away ? (Math.abs(n.spr.x - n.home.x) > Math.abs(n.spr.y - n.home.y) ? (n.spr.x > n.home.x ? "left" : "right") : (n.spr.y > n.home.y ? "up" : "down"))
            : ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
          n.moving = away || Math.random() < .5;
        }
        const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.dir];
        if (n.moving) { n.spr.setVelocity(v[0] * 28, v[1] * 28); n.spr.anims.play(`f-${n.folkN}-${n.dir}`, true); }
        else { n.spr.setVelocity(0); this.faceNpc(n); }
        n.spr.setDepth(n.spr.y);
      }

      const t = !this.ui.busy() && this.target();
      this.ui.hint(t ? (t.kind === "npc" ? t.n.spr : this.spots[t.k]) : null);
    }
  };
}

/* ---------- DOM overlay: goal, dialogue with portraits and voice ---------- */
const TownUI = {
  mount(scene, host) {
    const root = document.createElement("div");
    root.className = "town-ui";
    root.innerHTML = `<div class="town-goal"></div><div class="town-keys"><b>WASD</b>/<b>↑↓←→</b> walk · <b>Shift</b> run · <b>Space</b> talk</div>
      <div class="town-hint" hidden>Space</div><div class="town-focus" hidden>Click the map to play</div>
      <div class="town-dlg" hidden><canvas class="town-face" width="34" height="34"></canvas><div class="town-txt"><div class="town-who"></div><div class="town-en"></div><div class="town-zh" lang="zh-CN"></div></div><div class="town-more">▼</div></div>`;
    host.append(root);
    const $ = s => root.querySelector(s);
    let queue = [], done = null, open = false;
    const show = () => {
      const st = queue.shift();
      if (!st) { $(".town-dlg").hidden = true; open = false; TKVoice.stop(); const d = done; done = null; d && d(); return; }
      const said = st[0] === "say", who = said ? st[1] : null;
      const [en, zh, vid] = said ? [st[2], st[3], st[4]] : [st[1], st[2], st[3]];
      $(".town-who").textContent = who ? TK_CHARS[who].name : "";
      $(".town-en").textContent = en;
      $(".town-zh").textContent = typeof zh === "string" ? zh : "";
      const face = $(".town-face"), fc = face.getContext("2d");
      fc.clearRect(0, 0, 34, 34);
      face.hidden = !who;
      if (who) fc.drawImage(TKArt.get(who, "bust"), 0, 0);
      if (vid) TKVoice.play(vid); else TKVoice.stop();
    };
    const focus = () => { $(".town-focus").hidden = document.activeElement === host; };
    host.addEventListener("focus", focus); host.addEventListener("blur", focus);
    setTimeout(focus, 0);
    return {
      busy: () => open,
      goal: t => { $(".town-goal").textContent = t; },
      dialog(steps, cb) {
        queue = steps.filter(s => s[0] === "n" || s[0] === "say").slice(); done = cb || null; open = true; $(".town-dlg").hidden = false; show();
      },
      advance() { if (open) show(); },
      hint(target) {
        const h = $(".town-hint");
        if (!target) { h.hidden = true; return; }
        const cam = scene.cameras.main, cv = scene.game.canvas, k = cv.clientWidth / scene.scale.width;
        const r = cv.getBoundingClientRect(), rr = root.getBoundingClientRect();
        h.hidden = false;
        h.style.left = (r.left - rr.left + (target.x - cam.worldView.x) * k) + "px";
        h.style.top = (r.top - rr.top + (target.y - 30 - cam.worldView.y) * k) + "px";
      },
    };
  },
};

/* ---------- mounting a town in the campaign page ---------- */
const TownView = {
  game: null,
  phaser: null,
  load() {
    if (window.Phaser) return Promise.resolve();
    return this.phaser || (this.phaser = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js";
      s.onload = res; s.onerror = () => { this.phaser = null; rej(new Error("Couldn't load the game engine.")); };
      document.head.append(s);
    }));
  },
  // opts: { w, host, ret, onPuzzle(key), onLeave(dir) }
  async mount(opts) {
    this.destroy();
    await this.load();
    const host = opts.host;
    host.classList.add("tk-town");
    host.tabIndex = 0;
    host.addEventListener("mousedown", () => host.focus());
    this.game = new Phaser.Game({
      type: Phaser.AUTO, parent: host, width: 320, height: 180, pixelArt: true, roundPixels: true, backgroundColor: "#2a3a2a",
      physics: { default: "arcade", arcade: { debug: false } },
      input: { keyboard: { target: host } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [],
    });
    this.game.scene.add("town", townSceneClass(), true, opts);
    host.focus();
    if (window.Wukong && Wukong.suspend) Wukong.suspend(true);  // he stays out of the way while exploring
  },
  destroy() {
    TKVoice.stop();
    if (this.game) { this.game.destroy(true); this.game = null; }
  },
};
// Leaving the campaign page tears the game down (and frees the keyboard).
addEventListener("hashchange", () => { if (TownView.game && !/^#\/tk\/?\d*$/.test(location.hash)) TownView.destroy(); });
