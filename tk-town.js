/* ---- Three Kingdoms: explorable towns (Phaser 3) ----
   Structure follows Michael Hadley's "Modular Game Worlds in Phaser 3":
   a Tiled map for the ground, an object layer for props and people, an
   arcade-physics player the camera follows, and depth sorted by feet so
   you can walk behind houses and trees. Story beats are spots and people
   you walk up to; Space / E talks. Art: Jade pack (assets/tk/jade, CC-BY
   Willibab) for the town; the heroes and portraits come from TKArt (tk.js). */

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
};

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
  // Side view facing right: one eye, near the front of the face.
  side(who, frame) {
    const d = TK_CHARS[who], src = TKArt.get(who, "sprite", frame);
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext("2d"); c.drawImage(src, 0, 0);
    const img = c.getImageData(0, 0, cv.width, cv.height), p = img.data;
    const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const skin = hex(d.skin), dark = hex("#2a2228"), white = [255, 255, 255];
    const eq = (i, col) => p[i] === col[0] && p[i + 1] === col[1] && p[i + 2] === col[2];
    for (let y = 4; y <= 7; y++) for (let x = 3; x <= 10; x++) {
      const i = (y * cv.width + x) * 4;
      if (p[i + 3] && (eq(i, dark) || eq(i, white))) { p[i] = skin[0]; p[i + 1] = skin[1]; p[i + 2] = skin[2]; }
    }
    const i = (6 * cv.width + 9) * 4; p[i] = dark[0]; p[i + 1] = dark[1]; p[i + 2] = dark[2];
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
  // Register textures hero-<who>-<dir>-<frame> and walk animations.
  hero(scene, who) {
    for (const f of [0, 1]) {
      scene.textures.addCanvas(`h-${who}-down-${f}`, TKArt.get(who, "sprite", f));
      scene.textures.addCanvas(`h-${who}-up-${f}`, this.back(who, f));
      const s = this.side(who, f);
      scene.textures.addCanvas(`h-${who}-right-${f}`, s);
      scene.textures.addCanvas(`h-${who}-left-${f}`, TKArt.flip(s));
    }
    for (const dir of ["down", "up", "left", "right"]) {
      scene.anims.create({ key: `h-${who}-${dir}`, frames: [0, 1].map(f => ({ key: `h-${who}-${dir}-${f}` })), frameRate: 6, repeat: -1 });
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

/* ---------- lines that aren't from the story file ---------- */
const TOWN_LINES = {
  storyteller: [["n", "An old storyteller taps his clapper-board. “Sit, sit! Tales of the Yellow Heaven, and of a boy named Cao Cao…”"],
    ["n", "(The storyteller's side stories will play here.)"]],
  "zhangfei-wait": [["say", "zhangfei", "Hm? Go read the notice, friend, then we'll talk."]],
  "guanyu-wait": [["n", "A giant of a man sits by his cart, stroking a beard two feet long."]],
  folk1: [["n", "“They say the Yellow Turbans wear scarves the colour of the earth.”"]],
  folk2: [["n", "“Liu Bei? The sandal-seller? Kind man. Ears down to his shoulders, you know.”"]],
  folk3: [["n", "“Zhang Fei sells wine and pork. Loud as thunder, but his heart is good.”"]],
  folk4: [["n", "“Fine soil this year. Pity half the young men will go off to war.”"]],
  folk5: [["n", "“The governor wants volunteers. My son says he'll go.”"]],
  "exit-south": [["n", "The road south leads to Daxing Mountain. (The next area isn't built yet.)"]],
  "exit-west": [["n", "Back to Lousang Village. (Not built yet.)"]],
};

/* ---------- the scene ---------- */
class TownScene extends Phaser.Scene {
  constructor() { super("town"); }

  preload() {
    const A = "assets/tk/jade/";
    for (const s of ["buildings", "town", "nature"]) this.load.image(s, A + s + ".png");
    this.load.image("tiles", A + "tiles.png");
    this.load.spritesheet("folk1", A + "folk1.png", { frameWidth: 16, frameHeight: 21 });
    this.load.spritesheet("folk2", A + "folk2.png", { frameWidth: 16, frameHeight: 21 });
    this.load.tilemapTiledJSON("zhuo", "data/tk_town_zhuo.json");
    this.load.json("tk", "data/tk.json");
  }

  create() {
    this.story = this.cache.json.get("tk").worlds[0].scenes;
    this.stage = 0;  // 0 read the notice, 1 go to the inn, 2 go to the peach garden, 3 done
    const map = this.make.tilemap({ key: "zhuo" });
    map.createLayer("ground", map.addTilesetImage("ground", "tiles"), 0, 0);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.solids = this.physics.add.staticGroup();

    this.textures.addCanvas("@noticeboard", TownArt.noticeBoard());
    for (const [name, [sheet, x, y, w, h]] of Object.entries(TOWN_PROPS)) if (sheet[0] !== "@") this.textures.get(sheet).add(name, 0, x, y, w, h);
    for (const who of ["liubei", "guanyu", "zhangfei"]) TownArt.hero(this, who);

    const props = o => Object.fromEntries((o.properties || []).map(p => [p.name, p.value]));
    this.spots = {}; this.npcs = [];
    for (const o of map.getObjectLayer("objects").objects) {
      if (o.type === "prop") this.addProp(o.name, o.x, o.y);
      else if (o.type === "spot") this.spots[o.name] = { x: o.x, y: o.y };
      else if (o.type === "spawn") this.spawn = { x: o.x, y: o.y };
      else if (o.type === "npc") this.addNpc(o.name, o.x, o.y, props(o));
    }

    // the player: Liu Bei, with a small body at the feet
    this.player = this.physics.add.sprite(this.spawn.x, this.spawn.y, "h-liubei-down-0").setOrigin(.5, 1);
    this.player.body.setSize(10, 6).setOffset(4, 14);
    this.player.setCollideWorldBounds(true);
    this.player.facing = "right";
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.npcs.map(n => n.spr));
    this.followers = [];

    const cam = this.cameras.main;
    cam.startFollow(this.player, true, .15, .15);
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cam.setRoundPixels(true);

    this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,SPACE,E,ENTER,Z");
    for (const k of ["SPACE", "E", "ENTER", "Z"]) this.keys[k].on("down", () => this.act());
    this.trail = [];
    this.ui = TownUI.mount(this);
    this.setGoal();
    this.cameras.main.fadeIn(400);
  }

  addProp(name, x, y) {
    const def = TOWN_PROPS[name];
    if (!def) return;
    const s = (def[0][0] === "@" ? this.add.image(Math.round(x), Math.round(y), def[0]) : this.add.image(Math.round(x), Math.round(y), def[0], name)).setOrigin(.5, 1).setDepth(y);
    if (["flowers", "tuft", "lotus"].includes(name)) s.setDepth(y - 40);  // ground clutter stays underfoot
    const solid = def[5];
    if (solid) {
      const b = this.add.zone(Math.round(x), Math.round(y - solid[1] / 2), solid[0], solid[1]);
      this.solids.add(b);
    }
    return s;
  }

  addNpc(id, x, y, p) {
    let spr, folk = null;
    if (p.who) { spr = this.physics.add.sprite(x, y, `h-${p.who}-down-0`); }
    else { folk = TownArt.folk(this, p.folk); spr = this.physics.add.sprite(x, y, folk.sheet, folk.still("down")); }
    spr.setOrigin(.5, 1).setDepth(y).setImmovable(true);
    spr.body.setSize(10, 6).setOffset(3, spr.height - 6);
    const n = { id, spr, who: p.who, folk, folkN: p.folk, line: p.line, wander: !!p.wander, home: { x, y }, t: 0, dir: "down" };
    this.npcs.push(n);
    this.physics.add.collider(spr, this.solids);
    if (id === "guanyu") spr.setVisible(false).body.enable = false;  // arrives with the inn scene
    return n;
  }

  setGoal() {
    const goals = ["Read the notice in the town square.", "Find Zhang Fei's wine at the village inn, north of the square.",
      "Go to the Peach Garden behind Zhang Fei's farm (east).", "The brothers are sworn. The road south leads to war."];
    this.ui.goal(goals[this.stage]);
  }

  // What is the player facing? A story spot or a person within reach.
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
      if (d < (k.startsWith("exit") ? 24 : 26) && d < bd) { bd = d; best = { kind: "spot", k }; }
    }
    return best;
  }

  act() {
    if (this.ui.busy()) { this.ui.advance(); return; }
    const t = this.target();
    if (!t) return;
    if (t.kind === "npc") {
      const n = t.n;
      n.dir = { up: "down", down: "up", left: "right", right: "left" }[this.player.facing];
      this.faceNpc(n);
      if (n.id === "zhangfei" && this.stage === 1) return this.talk(this.story.notice.steps.slice(2, 5));
      this.talk(TOWN_LINES[n.line] || [["n", "…"]]);
    } else this.spot(t.k);
  }

  spot(k) {
    const notice = this.story.notice.steps, inn = notice.findIndex(s => s[0] === "n" && s[1].startsWith("At the village inn"));
    if (k === "notice" && this.stage === 0) {
      this.ui.puzzle("The Notice at Zhuo", () => this.talk(notice.slice(0, inn), () => { this.stage = 1; this.setGoal(); }));
    } else if (k === "notice") this.talk([["n", "The governor of You Province calls for volunteers against the Yellow Turbans."]]);
    else if (k === "inn" && this.stage === 1) {
      const g = this.npcs.find(n => n.id === "guanyu");
      g.spr.setVisible(true); g.spr.body.enable = true;
      this.talk(notice.slice(inn).filter(s => s[0] !== "party"), () => {
        this.stage = 2; this.setGoal(); this.joinParty(["guanyu", "zhangfei"]);
      });
    } else if (k === "inn") this.talk([["n", "The inn smells of wine and roast pork."]]);
    else if (k === "garden" && this.stage === 2) {
      this.ui.puzzle("The Peach Garden Oath", () => this.talk(this.story.oath.steps.filter(s => s[0] === "n" || s[0] === "say"),
        () => { this.stage = 3; this.setGoal(); }));
    } else if (k === "garden") this.talk([["n", stageMsg(this.stage)]]);
    else this.talk(TOWN_LINES[k] || [["n", "…"]]);
    function stageMsg(s) { return s < 2 ? "A peach garden in full bloom, behind Zhang Fei's farm." : "Petals drift over the place where you swore."; }
  }

  // Party members leave their posts and follow in single file.
  joinParty(ids) {
    for (const id of ids) {
      const n = this.npcs.find(m => m.id === id);
      n.spr.body.enable = false;
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
      P.anims.msPerFrame = K.SHIFT.isDown ? 110 : 170;
    } else { P.anims.stop(); P.setTexture(`h-liubei-${P.facing}-0`); }
    P.setDepth(P.y);

    // followers walk the player's trail
    if (vx || vy) { this.trail.unshift({ x: P.x, y: P.y, f: P.facing }); this.trail.length = 60; }
    this.followers.forEach((F, i) => {
      const p = this.trail[Math.min(this.trail.length - 1, (i + 1) * 14)] || { x: P.x, y: P.y, f: P.facing };
      const moving = Math.hypot(F.spr.x - p.x, F.spr.y - p.y) > .5;
      F.spr.setPosition(p.x, p.y).setDepth(p.y);
      if (moving) F.spr.anims.play(`h-${F.who}-${p.f}`, true); else { F.spr.anims.stop(); F.spr.setTexture(`h-${F.who}-${p.f}-0`); }
    });

    // townsfolk amble about near home
    for (const n of this.npcs) {
      if (!n.wander || this.ui.busy()) { n.spr.setVelocity(0); continue; }
      n.t -= dt;
      if (n.t <= 0) {
        n.t = 900 + Math.random() * 2200;
        const go = Math.random() < .5, away = Math.hypot(n.spr.x - n.home.x, n.spr.y - n.home.y) > 40;
        n.dir = away ? (Math.abs(n.spr.x - n.home.x) > Math.abs(n.spr.y - n.home.y) ? (n.spr.x > n.home.x ? "left" : "right") : (n.spr.y > n.home.y ? "up" : "down"))
          : ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
        n.moving = go || away;
      }
      const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.dir];
      if (n.moving) { n.spr.setVelocity(v[0] * 28, v[1] * 28); n.spr.anims.play(`f-${n.folkN}-${n.dir}`, true); }
      else { n.spr.setVelocity(0); this.faceNpc(n); }
      n.spr.setDepth(n.spr.y);
    }

    // a hint over whatever you could talk to
    const t = !this.ui.busy() && this.target();
    this.ui.hint(t ? (t.kind === "npc" ? t.n.spr : this.spots[t.k]) : null);
  }
}

/* ---------- DOM overlay: goal, dialogue with portraits, puzzle stand-in ---------- */
const TownUI = {
  mount(scene) {
    const root = document.getElementById("town-ui");
    root.innerHTML = `<div class="town-goal"></div><div class="town-hint" hidden>Space</div>
      <div class="town-dlg" hidden><canvas class="town-face" width="34" height="34"></canvas><div class="town-txt"><div class="town-who"></div><div class="town-en"></div><div class="town-zh"></div></div><div class="town-more">▼</div></div>
      <div class="town-puz" hidden><div class="town-puz-box"><div class="town-puz-t"></div><p>In the full game a go problem starts here, and solving it plays the story.</p><button>Solve (prototype)</button></div></div>`;
    const $ = s => root.querySelector(s);
    let queue = [], done = null, open = false, puz = false;
    const show = () => {
      const st = queue.shift();
      if (!st) { $(".town-dlg").hidden = true; open = false; const d = done; done = null; d && d(); return; }
      const [kind, a, b, c] = st, said = kind === "say";
      const who = said ? a : null, en = said ? b : a, zh = said ? c : b;
      $(".town-who").textContent = who ? TK_CHARS[who].name : "";
      $(".town-en").textContent = en;
      $(".town-zh").textContent = typeof zh === "string" ? zh : "";
      const face = $(".town-face"), fc = face.getContext("2d");
      fc.clearRect(0, 0, 34, 34);
      face.hidden = !who;
      if (who) fc.drawImage(TKArt.get(who, "bust"), 0, 0);
    };
    return {
      busy: () => open || puz,
      goal: t => { $(".town-goal").textContent = t; },
      dialog(steps, cb) { queue = steps.filter(s => s[0] === "n" || s[0] === "say").slice(); done = cb || null; open = true; $(".town-dlg").hidden = false; show(); },
      advance() { if (open) show(); },
      puzzle(title, cb) {
        puz = true; $(".town-puz").hidden = false; $(".town-puz-t").textContent = title;
        $(".town-puz button").onclick = () => { $(".town-puz").hidden = true; setTimeout(() => { puz = false; cb(); }, 50); };
      },
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

function startTown(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO, parent, width: 320, height: 180, pixelArt: true, roundPixels: true, backgroundColor: "#2a3a2a",
    physics: { default: "arcade", arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: TownScene,
  });
}
