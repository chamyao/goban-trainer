/* ---- Three Kingdoms: the explorable world, built by the map factory ----
   Plays a whole world from data/tk_maps/w<N>/: region.json (places, links,
   quests in story order) and one compiled Tiled map per place for the chosen
   art kit (assets/tk/kits/<kit>.json). Nothing here is specific to a place or
   a pack: walk to a story spot to play its quest, walk off an exit to go to
   the next place. See docs/map-format.md.

   It runs inside the campaign page's map box (viewTK). A quest or a
   challenger opens the real level page (viewTKLevel); winning brings you back
   to where you stood, and the scene plays there. Quest progress is the
   campaign save (TK.cleared / TK.seen); this file only remembers where you
   are. Hero sprites and the dialogue box come from tk-town.js. */

const WORLD_CLUTTER = /^(plant\.|rock\.small|furn\.rug|furn\.mat)/;  // drawn underfoot (a rug is a floor, not a sheet hung in front of people)
const WORLD_KIT = "jade";  // the default look (the user: Jade is the main look for now); the campaign page's art button switches (localStorage tk-kit)
const WORLD_KITS = { jade: { zh: "玉", en: "Jade" }, xianxia: { zh: "仙侠", en: "Xianxia (generated)" },
  genshin: { zh: "原神", en: "Genshin (isometric)", iso: true } };   // iso: drawn for the isometric view (tk-iso.js)

/* ---------- where you are in a world: place, position, party, places seen ---------- */
// Places renamed since a save was made: the old id (and its rooms, "old--room") to the new one
const WORLD_RENAMED = { "dong-zhuos-camp": "the-hills-north-of-guangzong" };
const worldRenamed = id => { for (const [a, b] of Object.entries(WORLD_RENAMED)) if (id === a || String(id).startsWith(a + "--")) return b + id.slice(a.length); return id; };
const WorldState = {
  key: n => `tk-world-${n}`,
  load(n, region) {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(this.key(n)) || "{}"); } catch { s = {}; }
    return { visited: (s.visited || [region.start]).map(worldRenamed), party: s.party || TK.party(TK.world(n)) || region.party, place: s.place, pos: s.pos || null, light: s.light || null, crowd: s.crowd || 0 };   // light: a scene's last light, kept onto the next map
  },
  save(n, st) { try { localStorage.setItem(this.key(n), JSON.stringify(st)); } catch { /* private mode */ } },
};

/* ---------- regions, and challengers as campaign levels ---------- */
const WorldData = {
  regions: {},
  async region(n) {
    if (!(n in this.regions)) {
      const r = await fetch(`data/tk_maps/w${n}/region.json?v=50`);
      this.regions[n] = r.ok ? await r.json() : null;
    }
    return this.regions[n];
  },
  has(n) { return (n >= 1 && n <= 3) || n === 12; },  // worlds whose places have been built (12: the Book 2 draft, test mode)
  // "1-zhuo-county-c-elder": a challenger in a place, drawing from the world's problems.
  node(w, key) {
    const region = this.regions[w.n];
    const m = region && key.match(/^(\d+)-(.+)-c-(\w+)$/);
    if (!m) return null;
    const place = region.places.find(p => p.id === m[2]);
    if (!place) return null;
    const all = [], seen = new Set();
    for (const q of region.quests) if (q.pool && q.role !== "boss") for (const p of q.pool) { const k = p.join(":"); if (!seen.has(k)) { seen.add(k); all.push(p); } }
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const i = all.length ? h % all.length : 0;
    return { key, town: true, place: place.name, place_zh: place.zh, role: "challenge", grade: w.grades.split("–")[0], pool: all.slice(i).concat(all.slice(0, i)) };
  },
};

// Lines from the place briefs arrive as voiced steps (["n", en, zh, vid] or
// ["say", who, en, zh, vid], see build_tk.place_step); bare strings and
// [who, text] still work for maps compiled before that.
// Places marked done by the story (a ridge supplied, a flank held…), per world, in localStorage
// "tk-marks". Conditions ("node:…", "item:…", "mark:…") are read by WorldScene.cond.
const WorldMarks = {
  KEY: "tk-marks",
  all(w) { return (TK.ls(this.KEY)[w.n] || []).slice(); },
  has(w, m) { return this.all(w).includes(m); },
  add(w, m) { const a = TK.ls(this.KEY), l = a[w.n] || []; if (!l.includes(m)) { l.push(m); a[w.n] = l; TK.lsSet(this.KEY, a); } },
};
// The shrine's look for a place (tk-world's shrine prop asks as it is drawn).
TK.shrineState = (n, placeId) => { const w = window.__w; return w && w.region && w.shrineState ? w.shrineState(placeId) : "dark"; };

// Wukong the guide: he appears when the player has been stuck a while.
const WorldGuide = {
  // Always adaptive: he comes only when the player hasn't made headway for a while (no setting).
  get mode() { return "stuck"; },
  get on() { return this.mode !== "off"; },
  STUCK: 40000,   // ms without progress before he comes
  prog: null,     // { key, best, idle }: kept across maps
  W: 60, H: 60,   // his canvas, in sprite pixels: Wukong (44x44) above a nimbus cloud
  cloud: null,
  // A golden-white nimbus with a curl at the back, drawn once.
  nimbus() {
    if (this.cloud) return this.cloud;
    const cv = document.createElement("canvas"); cv.width = 34; cv.height = 12;
    const g = cv.getContext("2d");
    const blob = (x, y, r, c) => { g.fillStyle = c; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r) g.fillRect(x + i, y + j, 1, 1); };
    for (const [x, y, r] of [[7, 7, 4], [13, 5, 5], [20, 5, 5], [26, 7, 4], [16, 8, 4]]) blob(x, y, r + 1, "#c8902a");   // outline
    for (const [x, y, r] of [[7, 7, 4], [13, 5, 5], [20, 5, 5], [26, 7, 4], [16, 8, 4]]) blob(x, y, r, "#fff3c4");
    for (const [x, y, r] of [[13, 4, 3], [20, 4, 3]]) blob(x, y, r, "#ffffff");
    g.fillStyle = "#e8b64a"; for (const [x, y] of [[4, 9], [5, 10], [7, 10], [26, 10], [28, 9], [29, 8]]) g.fillRect(x, y, 1, 1);
    g.fillStyle = "#c8902a"; g.fillRect(0, 6, 3, 1); g.fillRect(1, 5, 1, 1); g.fillRect(31, 6, 3, 1); g.fillRect(32, 5, 1, 1);   // curls
    return (this.cloud = cv);
  },
  mount(root) {
    if (!root || typeof WK === "undefined") return null;
    const el = document.createElement("canvas");
    el.className = "town-guide"; el.width = this.W; el.height = this.H; el.hidden = true;
    const say = document.createElement("div");
    say.className = "town-guide-say"; say.hidden = true; say.innerHTML = '<span lang="zh-CN">这边！</span> This way!';
    root.append(el, say);
    el.say = say;
    return el;
  },
  // His own riding pose (the site's frames are left as they are): knees tucked on the
  // cloud, staff held out toward the goal at angle a (degrees above horizontal).
  frame(a, t) {
    const base = WK.FRAMES.point[0];
    return Object.assign({}, base, { legs: "crouch", torso: "TORSO_SQUASH", hy: 1 + Math.round(Math.sin(t / 400)), hx: 1,
      head: t % 3600 < 140 ? "HEAD_BLINK" : "HEAD", staff: { a: Math.max(-55, Math.min(70, a)), gx: 6, gy: -7 }, tail: 2 });
  },
  // Draw him with the cloud's centre at game pixel (gx, gy).
  place(el, canvas, gameW, gx, gy, left, a, t, zoom = 1) {
    const k = canvas.clientWidth / gameW, s = .5 * k * zoom, root = el.parentNode.getBoundingClientRect(), r = canvas.getBoundingClientRect();
    const c = el.getContext("2d");
    c.clearRect(0, 0, this.W, this.H);
    c.drawImage(this.nimbus(), 13, 45 + Math.round(Math.sin(t / 260)));   // the cloud first: he sits on it
    c.save(); c.translate(8, 4); WK.render(c, this.frame(a, t), t); c.restore();
    for (let i = 0; i < 3; i++) {   // fairy sparkles circling him, twinkling
      const q = t / 700 + i * 2.1, tw = Math.sin(t / 160 + i * 1.7);
      if (tw < -.2) continue;
      const x = Math.round(30 + Math.cos(q) * 22), y = Math.round(30 + Math.sin(q) * 14);
      c.fillStyle = tw > .6 ? "#ffffff" : "#ffe36a";
      c.fillRect(x, y, 1, 1);
      if (tw > .5) { c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
    }
    const x = r.left - root.left + gx * k - this.W * s / 2, y = r.top - root.top + gy * k - 51 * s;
    Object.assign(el.style, { width: `${this.W * s}px`, height: `${this.H * s}px`, left: `${x}px`, top: `${y}px`, transform: left ? "scaleX(-1)" : "none" });
    Object.assign(el.say.style, { left: `${x + this.W * s / 2}px`, top: `${y}px` });
  },
};
// Small touches that make the world feel lived in: a soft shadow under everyone,
// and something in the air that suits the place.
/* ---------- sound on the map: a source you walk toward (carriage bells in the fog, a children's song) ----------
   Played with Web Audio (no files): a short pattern repeats, louder as you near its source. Only with the music on. */
const WorldSound = {
  ctx: null, gain: null, kind: null, next: 0, step: 0,
  PATTERNS: {
    bells: { notes: [1318, 1568, 1760, 1568, 1318], dur: .42, rest: 1.8, type: "sine", decay: 1.4, vol: .16 },
    children: { notes: [523, 587, 659, 784, 659, 587, 523, 587, 659, 659, 587], dur: .34, rest: 1.4, type: "triangle", decay: .3, vol: .12 },
    drum: { notes: [98, 98, 82], dur: .5, rest: 1.2, type: "sine", decay: .35, vol: .3 },
  },
  set(kind) {
    if (kind === this.kind) return;
    if (this.gain) { try { this.gain.disconnect(); } catch { /* gone */ } }
    this.gain = null; this.kind = kind || null;
    if (!kind) return;
    try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    this.gain = this.ctx.createGain(); this.gain.gain.value = 0; this.gain.connect(this.ctx.destination);
    this.next = this.ctx.currentTime + .2; this.step = 0;
  },
  level(v) { if (this.gain) this.gain.gain.setTargetAtTime(v, this.ctx.currentTime, .25); },
  tick() {
    if (!this.gain) return;
    const ac = this.ctx, P = this.PATTERNS[this.kind] || this.PATTERNS.bells;
    if (ac.state === "suspended") ac.resume().catch(() => {});
    while (this.next < ac.currentTime + .6) {
      const t = this.next, o = ac.createOscillator(), g = ac.createGain();
      o.type = P.type; o.frequency.value = P.notes[this.step % P.notes.length];
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(P.vol, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + P.decay);
      o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + P.decay + .05);
      this.step++;
      this.next = t + P.dur + (this.step % P.notes.length === 0 ? P.rest : 0);
    }
  },
};

const WorldFX = {
  textures(scene) {
    const add = (key, w, h, draw) => {
      if (scene.textures.exists(key)) return;
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"));
      scene.textures.addCanvas(key, cv);
    };
    add("@shadow", 14, 5, g => { g.fillStyle = "rgba(20,12,6,.28)"; g.beginPath(); g.ellipse(7, 2.5, 7, 2.5, 0, 0, Math.PI * 2); g.fill(); });
    add("@petal", 3, 2, g => { g.fillStyle = "#f6a8bc"; g.fillRect(0, 0, 3, 2); g.fillStyle = "#fbd6e0"; g.fillRect(0, 0, 1, 1); });
    add("@leaf", 3, 2, g => { g.fillStyle = "#8aa83a"; g.fillRect(0, 0, 3, 2); g.fillStyle = "#c8b04a"; g.fillRect(2, 1, 1, 1); });
    add("@ember", 2, 2, g => { g.fillStyle = "#ffb03a"; g.fillRect(0, 0, 2, 2); g.fillStyle = "#fff0a0"; g.fillRect(0, 0, 1, 1); });
    add("@mote", 1, 1, g => { g.fillStyle = "#fff4d8"; g.fillRect(0, 0, 1, 1); });
    add("@glint", 5, 5, g => { g.fillStyle = "#ffffff"; g.fillRect(2, 0, 1, 5); g.fillRect(0, 2, 5, 1); g.fillStyle = "#d8f0ff"; g.fillRect(1, 1, 3, 3); g.fillStyle = "#ffffff"; g.fillRect(2, 2, 1, 1); });
    // lamplight for rooms: warm in the middle, falling off to the corners
    add("@lamp", 320, 180, g => {
      const r = g.createRadialGradient(160, 96, 10, 160, 96, 210);
      r.addColorStop(0, "rgba(255,196,110,0.10)"); r.addColorStop(.55, "rgba(120,60,20,0.05)"); r.addColorStop(1, "rgba(16,6,0,0.55)");
      g.fillStyle = r; g.fillRect(0, 0, 320, 180);
    });
  },
  // Shadows follow whoever is standing in the world: you, your party, the townsfolk.
  shadows(scene) {
    const people = [scene.player, ...scene.followers.map(f => f.spr), ...scene.npcs.map(n => n.spr)];
    for (const spr of people) {
      if (!spr || !spr.scene) continue;
      const sh = spr.__shadow || (spr.__shadow = scene.add.image(0, 0, "@shadow").setDepth(-999));
      sh.setPosition(Math.round(spr.x), Math.round(spr.y) - 1).setVisible(spr.visible && spr.alpha > .3).setScale(Math.max(1, spr.displayWidth / 14), 1);
    }
  },
  // Glints on water in view, now and then.
  water(scene, time) {
    const L = scene.water;
    if (!L) return;
    if (!scene.waterTiles) {
      scene.waterTiles = [];
      L.forEachTile(t => { if (t.index !== -1) scene.waterTiles.push([t.pixelX + t.width / 2, t.pixelY + t.height / 2]); });
    }
    if (!scene.waterTiles.length || time < (scene.nextGlint || 0)) return;
    scene.nextGlint = time + 90 + Math.random() * 160;
    const v = scene.cameras.main.worldView, seen = scene.waterTiles.filter(([x, y]) => v.contains(x, y));
    if (!seen.length) return;
    const [x, y] = seen[Math.floor(Math.random() * seen.length)];
    const g = scene.add.image(x + (Math.random() - .5) * 12, y + (Math.random() - .5) * 12, "@glint").setDepth(-998).setAlpha(0).setScale(Math.random() < .5 ? .6 : 1);
    scene.tweens.add({ targets: g, alpha: { from: 0, to: .9 }, duration: 260, yoyo: true, hold: 120, onComplete: () => g.destroy() });
  },
  ambient(scene, kind) {
    const W = scene.scale.width, H = scene.scale.height;
    if (scene.lampFx) scene.lampFx.destroy();
    if (scene.ambientFx) scene.ambientFx.destroy();
    scene.lampFx = scene.ambientFx = null;
    // the ruins are drained of colour: ash-grey light over everything (WebGL only)
    const fx = scene.cameras.main.postFX;
    if (scene.ashFx) { fx && fx.remove(scene.ashFx); scene.ashFx = null; }
    if (kind === "ruins" && fx) { scene.ashFx = fx.addColorMatrix(); scene.ashFx.saturate(-.65); scene.ashFx.brightness(.92, true); }
    if (kind === "interior") scene.lampFx = scene.add.image(0, 0, "@lamp").setOrigin(0).setScrollFactor(0).setDepth(9e4).setDisplaySize(W, H);
    const C = {
      garden: { tex: "@petal", frequency: 260, y: -6, speedY: { min: 10, max: 18 }, speedX: { min: -8, max: 6 }, lifespan: 12000 },
      village: { tex: "@leaf", frequency: 1600, y: -6, speedY: { min: 9, max: 15 }, speedX: { min: -4, max: 8 }, lifespan: 12000 },
      town: { tex: "@leaf", frequency: 2200, y: -6, speedY: { min: 9, max: 15 }, speedX: { min: -4, max: 8 }, lifespan: 12000 },
      road: { tex: "@leaf", frequency: 900, x: -6, y: { min: 0, max: 180 }, speedX: { min: 14, max: 26 }, speedY: { min: -2, max: 6 }, lifespan: 14000 },
      hills: { tex: "@leaf", frequency: 800, x: -6, y: { min: 0, max: 180 }, speedX: { min: 16, max: 30 }, speedY: { min: -3, max: 5 }, lifespan: 14000 },
      mountain: { tex: "@leaf", frequency: 800, x: -6, y: { min: 0, max: 180 }, speedX: { min: 16, max: 30 }, speedY: { min: -3, max: 5 }, lifespan: 14000 },
      camp: { tex: "@ember", frequency: 450, y: 186, speedY: { min: -18, max: -9 }, speedX: { min: -5, max: 5 }, lifespan: 9000, alpha: { start: 1, end: 0 } },
      ruins: { tex: "@mote", frequency: 120, y: -6, speedY: { min: 6, max: 14 }, speedX: { min: -6, max: 4 }, lifespan: 16000, tint: 0x9a948e, scale: { min: 1, max: 2 } },   // falling ash
      interior: { tex: "@mote", frequency: 500, y: { min: 0, max: 180 }, speedY: { min: -2, max: 2 }, speedX: { min: -2, max: 2 }, lifespan: 6000, alpha: { start: 0, end: .8, ease: "Sine.easeInOut", yoyo: true } },
    }[kind];
    if (!C || !scene.add.particles) return;
    const { tex, ...cfg } = C;
    scene.ambientFx = scene.add.particles(0, 0, tex, Object.assign({
      x: { min: 0, max: W }, rotate: { min: 0, max: 360 }, quantity: 1, alpha: { start: .95, end: .7 },
    }, cfg)).setScrollFactor(0).setDepth(1e5);
    scene.ambientFx.fastForward && scene.ambientFx.fastForward(8000);   // the air is already full when you arrive
  },
};
const WORLD_NEAR = 36;  // px: how close walking up to a story spot starts its scene
const worldLines = list => (list || []).map(l => typeof l === "string" ? ["n", l]
  : l[0] === "n" || l[0] === "say" ? l : ["say", l[0], l[1]]);

/* ---------- the scenes (made once Phaser has loaded) ---------- */
function worldScenes() {
  class WorldBoot extends Phaser.Scene {
    constructor() { super("world-boot"); }
    preload() {
      this.opts = this.game.worldOpts;
      const { w, kit } = this.opts;
      this.load.json("region", `data/tk_maps/w${w.n}/region.json?v=58`);
      this.load.json("kit", `assets/tk/kits/${kit}.json?v=38`);
      this.load.json("cutscenes", `data/tk_maps/w${w.n}/cutscenes.json?v=58`);
    }
    create() {
      const { w, kit: kitName } = this.opts, region = this.cache.json.get("region"), kit = this.cache.json.get("kit");
      for (const [s, path] of Object.entries(kit.sheets)) this.load.image(`kit-${s}`, path);
      const [fw, fh] = kit.folk.frame;
      for (const [s, path] of Object.entries(kit.folk.sheets)) this.load.spritesheet(`folk-${s}`, path, { frameWidth: fw, frameHeight: fh });
      // story people the kit draws itself (generated walking sheets: rows down, up, left, right x 4 steps)
      for (const [who, h] of Object.entries(kit.heroes || {})) this.load.image(`hx-${who}`, h.sheet);
      for (const p of region.places) this.load.tilemapTiledJSON(`map-${p.id}`, `data/tk_maps/w${w.n}/${kitName}/${p.id}.tmj?v=65`);
      this.load.image("kit-_swatch", `data/tk_maps/w${w.n}/${kitName}/swatch.png`);
      if (typeof WorldItems !== "undefined") WorldItems.preload(this);   // horses (tk-items.js)
      this.load.on("loaderror", f => { if (f.key !== "kit-_swatch") console.warn("missing", f.src); });
      this.load.once("complete", () => {
        for (const [kind, list] of Object.entries(kit.kinds)) list.forEach(([s, x, y, wd, ht], i) => this.textures.get(`kit-${s}`).add(`${kind}#${i}`, 0, x, y, wd, ht));
        if (!this.textures.exists("@bang")) this.textures.addCanvas("@bang", TownArt.bang());
        WorldFX.textures(this);
        const st = WorldState.load(w.n, region);
        this.scene.start("world", { place: st.place || region.start, from: null, resume: true });
      });
      this.load.start();
    }
  }

  class WorldScene extends Phaser.Scene {
    constructor() { super("world"); }
    init(d) { this.placeId = d.place; this.from = d.from; this.resume = d.resume; this.toNode = d.toNode || null; }

    create() {
      const region = this.region = this.cache.json.get("region"), kit = this.kit = this.cache.json.get("kit");
      const opts = this.opts = this.game.worldOpts, w = this.w = opts.w;
      this.grid = this.walk = this.lampFx = this.ambientFx = this.cine = this.auto = this.player = this.engaged = this.carried = null; this.glows = []; this.seated = this.caught = false;   // the scene object outlives a change of place: no old map's walk grid or tap-walk
      this.story = w.scenes;
      // a save from an older map: a renamed place is found under its new name (arriving as if walking in);
      // a removed one sends him back to the start
      if (worldRenamed(this.placeId) !== this.placeId) { this.placeId = worldRenamed(this.placeId); this.resume = false; if (this.placeId.includes("--")) this.from = this.placeId.split("--")[0]; }
      if (!region.places.some(p => p.id === this.placeId)) { this.placeId = region.start; this.resume = false; }
      this.st = WorldState.load(w.n, region);
      if (!this.st.visited.includes(this.placeId)) this.st.visited.push(this.placeId);
      this.st.place = this.placeId;
      this.place = region.places.find(p => p.id === this.placeId);

      // ground and terrain layers, then objects
      const map = this.make.tilemap({ key: `map-${this.placeId}` });
      this.tw = map.tileWidth || 16;
      // one map, several looks (Places' "states"): the last whose "when" holds and "until" doesn't
      try { this.states = JSON.parse((map.properties || []).find(x => x.name === "states")?.value || "null"); } catch { this.states = null; }
      this.stated = []; this.refs = {}; this.lights = []; this.sightZones = []; this.sgrid = null; if (this.coneG) { this.coneG.destroy(); this.coneG = null; } if (this.fog) { this.fog.destroy(); this.fog = null; } this.procession = null;
      const sets = map.tilesets.map(ts => map.addTilesetImage(ts.name, `kit-${ts.name}`));
      this.water = null;
      const layers = [];
      for (const l of map.layers) {
        const layer = map.createLayer(l.name, sets, 0, 0).setDepth(-1000);
        layers.push(layer);
        if (l.name === "water") { layer.setCollisionByExclusion([-1]); this.water = layer; }
      }
      // an isometric kit: the same flat map, drawn as a diamond world (tk-iso.js)
      this.iso = typeof WorldIso !== "undefined" && WorldIso.on(kit) ? WorldIso.mount(this, map, layers) : null;
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.solids = this.physics.add.staticGroup(); this.buildings = [];
      for (const who of new Set([this.lead, ...this.st.party])) this.hero(who);

      const P = o => Object.fromEntries((o.properties || []).map(p => [p.name, p.value]));
      const J = v => { try { return JSON.parse(v || "[]"); } catch { return []; } };
      this.spots = {}; this.npcs = []; this.actMarks = new Map(); this.exits = []; this.propBoxes = []; this.entries = {}; this.shrine = null;
      for (const o of map.getObjectLayer("objects").objects) {
        const p = P(o);
        if (o.type === "prop") this.addProp(o, p);
        else if (o.type === "spot") this.spots[o.name] = { x: o.x, y: o.y, node: p.node, label: p.label, labelZh: p.label_zh || "", intro: J(p.intro), outro: J(p.outro), trigger: p.trigger || "near", use: p.use || "",
          // a place to deliver to (a ridge): mark, condition, what it needs, and its lines
          ...(p.needs ? { needs: J(p.needs), delivers: p.delivers || o.name, when: p.when || "", empty: J(p.empty), waiting: J(p.waiting), call: J(p.call),
                          deliver: J(p.deliver), delivered: J(p.delivered) } : {}),
          sight: p.sight ? JSON.parse(p.sight) : null };   // a sight puzzle: it plays once one watcher sees you and another doesn't
        else if (o.type === "npc") this.addNpc(o, p, J);
        else if (o.type === "exit") this.exits.push({ to: p.to, side: p.side, rect: new Phaser.Geom.Rectangle(o.x, o.y, o.width, o.height),
          openTo: p.open_to ? JSON.parse(p.open_to) : null, refuse: J(p.refuse) });
        else if (o.type === "entry") this.entries[p.from || ""] = { x: o.x, y: o.y };
      }
      // a town's shrine with no story spot of its own: touching it still answers (dark, or its hint)
      if (this.shrine && !Object.values(this.spots).some(s => Math.hypot(s.x - this.shrine.x, s.y - this.shrine.y) < 30))
        this.spots.shrine_ = { x: this.shrine.x, y: this.shrine.y + 12, node: "", label: "The shrine under the pine", labelZh: "松下星君祠", intro: [], outro: [], trigger: "talk", use: "shrine" };
      this.refreshStory();
      for (const s of Object.values(this.spots)) {   // a story waiting here: a slow glow on the ground, gold for the main story, cooler for side stories
        const q = s.node && this.region.quests.find(x => x.node === s.node);
        if (!q || q.shrine || s.use === "shrine") continue;   // shrines have their own looks
        s.glow = this.add.ellipse(s.x, s.y + 2, 30, 11, q.role === "side" || q.role === "short" ? 0x9fd8ff : 0xffd27a, .5).setDepth(-995).setVisible(false);
        this.tweens.add({ targets: s.glow, scaleX: 1.25, scaleY: 1.25, alpha: .2, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      this.focusMark = this.add.ellipse(0, 0, 20, 8).setStrokeStyle(1.5, 0xfff3c4, .85).setDepth(-994).setVisible(false);
      this.tweens.add({ targets: this.focusMark, alpha: .35, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

      // back from a problem (or a reload): stand where you were
      // (only where he can stand: an older map may have put a wall there, or ended short of it)
      // (open ground, or within two cells of it: a doorway's entry point is squeezed against the wall)
      const standable = q => {
        const G = this.walkGrid(), cx = Math.floor(q.x / G.C), cy = Math.floor((q.y - 3) / G.C);
        let ok = false;
        for (let dy = -2; dy <= 2 && !ok; dy++) for (let dx = -2; dx <= 2 && !ok; dx++) ok = G.free(cx + dx, cy + dy);
        this.grid = null;
        return ok && q.x >= 0 && q.y >= 0 && q.x <= this.physics.world.bounds.width && q.y <= this.physics.world.bounds.height;
      };
      const pos = this.resume && this.st.pos && this.st.pos.place === this.placeId && standable(this.st.pos) ? this.st.pos : null;
      // a handoff (["party", [...], {to}]): the new lead starts just in front of that beat's spot
      const hs = this.toNode && Object.values(this.spots).find(s => s.node === this.toNode);
      const hand = hs && standable({ x: hs.x, y: hs.y + 26 }) ? { x: hs.x, y: hs.y + 26 } : null;
      const at = hand || pos || this.entries[this.from || ""] || this.entries[""];
      this.player = this.physics.add.sprite(at.x, at.y, `h-${this.lead}-down-0`).setOrigin(.5, 1);
      this.footBody(this.player);
      this.player.setCollideWorldBounds(true);
      this.player.facing = pos ? pos.f : "down";
      this.physics.add.collider(this.player, this.solids);
      if (this.water) this.physics.add.collider(this.player, this.water);
      this.physics.add.collider(this.player, this.npcs.map(n => n.spr));
      this.followers = [];
      this.trail = [];
      this.setParty(this.st.party);
      this.save();

      const cam = this.cameras.main;
      cam.startFollow(this.player, true, .15, .15);
      if (this.place.archetype === "overworld") cam.setZoom(.5);   // the realm from on high: a wide stretch of country, the party small
      // the isometric diamond is only half as tall as it is wide: on an upright phone come in closer so it fills the screen
      else if (this.iso && this.scale.height > this.scale.width) cam.setZoom(1.3);
      this.mapW = this.iso ? this.iso.width : map.widthInPixels; this.mapH = this.iso ? this.iso.height : map.heightInPixels;
      this.fitCamera();
      cam.setRoundPixels(true);
      cam.fadeIn(350);

      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER");
      // tap (or click) to walk there, tap someone to talk, a building to go in; hold and drag to steer
      this.input.on("pointerdown", p => { const q = this.flat(p.worldX, p.worldY); this.tapAt(q.x, q.y, p.worldX, p.worldY); });
      this.input.on("pointermove", p => { this.steer(p); this.hover(p); });
      // After a talk closes, a key starts another only after a pause in pressing (or once he's taken a
      // step): mashing Enter through a talk doesn't loop it. Taps still talk at once.
      for (const k of ["ENTER", "E"]) this.keys[k].on("down", () => {
        const now = this.time.now, last = this.lastKey || 0, P = this.player, at = this.talkAt;
        this.lastKey = now;
        const moved = at && Math.hypot(P.x - at.x, P.y - at.y) > 8;
        if (this.ui.busy() || moved || (now - (this.talkOver || 0) > 600 && now - last > 600)) this.act();
      });
      this.ui = TownUI.mount(this, opts.host);
      if (this.place.archetype === "overworld") this.overworldLabels(opts.host.querySelector(".town-ui"));
      // Wukong shows the way to the next objective: beside its spot when it's on screen,
      // else at the edge of the screen, pointing toward it (adaptive: only when the player is stuck)
      // He's drawn over the game at screen resolution, so his pixel art keeps its detail.
      this.guide = WorldGuide.mount(opts.host.querySelector(".town-ui"));
      this.setGoal();
      if (!pos) this.ui.place(this.place.name, this.place.zh);
      this.blocked = 0;
      this.leaving = false;
      if (typeof WorldItems !== "undefined") WorldItems.attach(this);   // mounts (tk-items.js)
      WorldFX.ambient(this, this.place.archetype);   // petals, leaves, embers, dust
      this.worldShade = null; this.applyWorldLight();   // night, dusk or dawn left by the last scene
      // the window changed shape (full window, a phone turned): the screen-sized effects follow
      const onResize = () => { WorldFX.ambient(this, this.place.archetype); this.fitCamera(); };
      this.scale.on("resize", onResize);
      this.events.once("shutdown", () => { this.scale.off("resize", onResize); WorldSound.set(null); });
      window.__w = this;  // for tests and the console
      if (this.resume && opts.ret) { const r = opts.ret; opts.ret = null; this.time.delayedCall(400, () => this.returned(r)); }
      // story scenes that start by themselves: on arriving here, or on walking into their area
      // A story spot doesn't go off under your feet as you come in: outside its reach it waits for you
      // to walk up; arriving inside it (a map's default arrival point can be on it), it waits until
      // you've walked a little way into the place. Back where you were (a problem left, a reload),
      // you must step clear of it first.
      for (const s of Object.values(this.spots)) {
        s.armed = Math.hypot(this.player.x - s.x, this.player.y - s.y) > WORLD_NEAR;
        s.armAt = !s.armed && !pos ? { x: this.player.x, y: this.player.y } : null;
      }
      this.time.delayedCall(900, () => {
        // indoors a story starts as you come in (the room is the scene); outdoors only spots marked
        // "arrive" do, the rest wait for you to walk up. Not when you're put back where you were.
        // (a compound, a whole residence with courts and a garden, is walked like outdoors: to the pavilion past the maids)
        const indoor = this.place.archetype !== "compound" && !!(this.place.parent || this.place.archetype === "interior");
        const s = Object.values(this.spots).find(s => (s.trigger === "arrive" || (indoor && !pos && s.trigger !== "talk")) && this.openQuest(s));
        if (s && !this.ui.busy() && !this.leaving && !this.cine) this.playQuest(this.openQuest(s), s);
        else if (typeof TKTable !== "undefined") TKTable.arrived(this);   // back from signing in at the go table
      });
    }

    // Where a point of the flat map is drawn (the isometric view moves it), and back.
    view(x, y) { return this.iso ? this.iso.P(x, y) : { x, y }; }
    flat(x, y) { return this.iso ? this.iso.inv(x, y) : { x, y }; }

    // The camera's bounds: the map, or, where the map is smaller than the view (a room on a
    // phone held upright), a frame around it so it sits in the middle instead of the top corner.
    fitCamera() {
      const cam = this.cameras.main, vw = cam.width / cam.zoom, vh = cam.height / cam.zoom, mw = this.mapW, mh = this.mapH;
      const bx = mw < vw ? -Math.round((vw - mw) / 2) : 0, by = mh < vh ? -Math.round((vh - mh) / 2) : 0;
      // the buttons and goal line along the top cover the map's top edge (a road out there): let the
      // view go that much higher, so whatever is at the edge can be brought out from under them
      const top = Math.min(by, -this.hudTop());
      // isometric: the map is a diamond, so its box's corners are empty; keep the view a little
      // inside the box (never so far the player could leave it) so less of the screen is beyond the map
      // (none at the top: the HUD already covers that edge)
      const ix = this.iso ? Math.max(0, Math.min(vw * .16, (mw - vw) / 2)) : 0, iy = this.iso ? Math.max(0, Math.min(vh * .1, (mh - vh) / 2)) : 0;
      this.camBox = { x: bx, y: top, w: Math.max(mw, vw), h: Math.max(mh, vh) + (by - top), ix, iy };
      cam.setBounds(bx + ix, top, Math.max(mw, vw) - 2 * ix, Math.max(mh, vh) + (by - top) - iy);
    }
    // isometric: the inset gives way where the player is near it, so he is always drawn at least
    // 24 px inside the view
    keepPlayerInView() {
      const b = this.camBox, P = this.player;
      if (!this.iso || !b || !P || !(b.ix || b.iy)) return;
      const cam = this.cameras.main, m = 24 / cam.zoom, p = this.view(P.x, P.y);
      const e = 40 / cam.zoom;   // the box's own edge may give way a little too (the apron is drawn there)
      const L = Math.max(b.x - e, Math.min(b.x + b.ix, p.x - m)), R = Math.min(b.x + b.w + e, Math.max(b.x + b.w - b.ix, p.x + m));
      const B = Math.min(b.y + b.h + e, Math.max(b.y + b.h - b.iy, p.y + m));
      const cur = cam.getBounds();
      if (cur.x !== L || cur.right !== R || cur.bottom !== B) cam.setBounds(L, b.y, R - L, B - b.y);
    }
    // How far down the screen the HUD reaches, in world pixels.
    hudTop() {
      const cv = this.game.canvas, host = cv && cv.closest(".tk-map");
      if (!host || !cv.clientWidth) return 0;
      const r = cv.getBoundingClientRect(), k = cv.clientWidth / this.scale.width * this.cameras.main.zoom;
      let low = r.top;
      for (const el of host.querySelectorAll(".town-goal, .tk-menu-row")) {
        const b = el.getBoundingClientRect();
        if (b.height && b.top < r.top + r.height / 3) low = Math.max(low, b.bottom);
      }
      return Math.ceil((low - r.top + 4) / k);
    }

    // The story quest a spot holds, if it can be played now.
    // (a scene played inside a building starts only in there: on the street its door is just where to go)
    openQuest(s) { const q = this.region.quests.find(x => x.node === s.node); return q && this.available(q) && !(q.room && q.place !== this.placeId) ? q : null; }

    // Coming up to a story spot: he stops and turns to it, a short beat, then its scene (not a cut).
    approach(q, s) {
      const P = this.player;
      P.setVelocity(0); this.walk = null; this.approaching = true;
      const dx = s.x - P.x, dy = s.y - P.y;
      P.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      P.anims.stop(); P.setTexture(`h-${this.lead}-${P.facing}-0`);
      this.time.delayedCall(320, () => { this.approaching = false; if (!this.ui.busy() && !this.leaving && !this.cine) this.playQuest(q, s); });
    }
    // Walking into a story spot's area starts its scene; it re-arms once you walk away.
    nearSpots() {
      if (this.ui.busy() || this.leaving || this.cine || this.approaching) return;
      const P = this.player;
      for (const s of Object.values(this.spots)) {
        if (s.trigger === "talk") continue;
        if (s.sight) {   // seen by one and not by the other, for a moment: wherever she stands
          const by = id => this.npcs.find(n => n.watch && (n.watch.id === id || n.id === id));
          const a = by(s.sight.seen_by), b = by(s.sight.unseen_by), ok = a && a.sees && !(b && b.sees);
          s.held = ok ? (s.held || 0) + this.game.loop.delta : 0;
          if (s.held > 700) { s.held = 0; const q = this.openQuest(s); if (q) return this.approach(q, s); }
          continue;
        }
        const d = Math.hypot(P.x - s.x, P.y - s.y);
        if (d > WORLD_NEAR + 16) s.armed = true;
        else if (s.armAt && Math.hypot(P.x - s.armAt.x, P.y - s.armAt.y) > 28) { s.armed = true; s.armAt = null; }
        else if (d < WORLD_NEAR && s.armed) {
          s.armed = false;
          const q = this.openQuest(s);
          if (q) return this.approach(q, s);   // a tap on the spot ends its walk here
        }
      }
    }

    /* ---------- building the place ---------- */
    hero(who) {   // textures outlive the scene
      if (this.textures.exists(`h-${who}-down-0`)) return;
      const h = (this.kit.heroes || {})[who];
      if (h && this.textures.exists(`hx-${who}`)) WorldHeroes.fromSheet(this, who, h);
      else TownArt.hero(this, who);
    }

    addProp(o, p) {
      let img = null;
      if (o.name) {
        const sheet = this.kit.kinds[o.name.split("#")[0]][+o.name.split("#")[1]][0];
        img = this.add.image(Math.round(o.x), Math.round(o.y), `kit-${sheet}`, o.name).setOrigin(.5, 1);
        img.setDepth(WORLD_CLUTTER.test(p.kind) ? o.y - 400 : o.y);
        if (this.iso && (!WORLD_CLUTTER.test(p.kind) || /^furn\./.test(p.kind))) {
          WorldIso.anchor(this, img, o.x, o.y - p.fh / 2, p.fw, p.fh);   // stands on its footprint
          if (WORLD_CLUTTER.test(p.kind)) img.setDepth(img.depth - 400);   // a rug still lies underfoot
        }
        if (this.iso && (this.kit.isoFlip || []).includes(o.name)) img.setFlipX(true);   // its entrance on the door's face
        if (p.flip) img.setFlipX(!img.flipX);   // a side view facing W (the map compiler mirrors an E-facing sprite)
        if (p.kind === "landmark.shrine") {   // the Star Lords' shrine: its look follows the story (setShrine)
          this.shrine = { img, x: o.x, y: o.y, state: "dark", fx: [] };
          this.setShrine(TK.shrineState?.(this.w.n, this.placeId) || "dark");
        }
      }
      if (img && !/^(building\.|tree\.|ground\.|deco\.)/.test(p.kind || "") && img.width <= 64)
        (this.propBoxes = this.propBoxes || []).push({ cx: o.x, x0: o.x - img.width / 2, x1: o.x + img.width / 2, y0: o.y - img.height, y1: o.y, img });
      if (img && /^building\./.test(p.kind || "")) this.buildings.push({ x: o.x, bottom: o.y, w: img.width, h: img.height, img });
      // a building's wall follows its art, which is often wider or narrower than its footprint:
      // cl and cr either side of its centre (worked out with its neighbours by the map tools)
      const l = p.cl || p.fw / 2, r = p.cr || p.fw / 2;
      const zone = p.solid ? this.add.zone(o.x + (r - l) / 2, o.y - p.fh / 2, l + r - 2, p.fh - 2) : null;
      if (zone) this.solids.add(zone);
      if (zone && p.kind !== "wall.lattice") (this.sightZones = this.sightZones || []).push(zone);   // what blocks a watcher's sight (a lattice doesn't)
      if (p.in) this.stated.push({ img, zone, in: JSON.parse(p.in) });
      if (p.ref) (this.refs = this.refs || {})[p.ref] = { x: o.x, y: o.y - (p.fh || 0) / 2 };
      if (/^(lamp\.|prop\.lantern|camp\.(firepit|cookfire)|furn\.(lamp|hearth))/.test(p.kind || "")) (this.lights = this.lights || []).push({ x: o.x, y: o.y - (p.fh || 16) / 2, kind: p.kind, img });   // shown only in some of the map's states
    }

    // The shrine's three looks (the rock under the pine): "dark" (an empty board), "lit" (a game in
    // progress: a hint is waiting) and "settled" (the finished game). A soft glow, no smoke. Who decides which is the story's (TK.shrineState).
    setShrine(state) {
      const s = this.shrine;
      if (!s || !["dark", "lit", "settled"].includes(state)) return;
      s.state = state;
      s.img.setFrame(state === "dark" ? "landmark.shrine#0" : `landmark.shrine.${state}#0`);
      s.fx.forEach(f => f.remove ? f.remove() : f.destroy()); s.fx = [];   // tweens and timers are removed, the glow destroyed
      if (state === "dark") return;
      const glow = this.add.ellipse(s.x, s.y - 6, 26, 14, state === "lit" ? 0x8ae8ff : 0xf4d27a, state === "lit" ? .35 : .18)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(s.y + 1);
      glow.isoFollow = s.img;   // in the isometric view it stays on the shrine
      s.fx.push(glow, this.tweens.add({ targets: glow, alpha: state === "lit" ? .12 : .08, duration: state === "lit" ? 900 : 2200, yoyo: true, repeat: -1, ease: "Sine.InOut" }));
    }

    folkAnims(sprite) {
      const [kind, i] = sprite.split("#"), F = this.kit.folk, f = F.kinds[kind][+i];
      const cols = this.textures.get(`folk-${f.sheet}`).getSourceImage().width / F.frame[0];
      const frame = (dir, step) => (f.origin[1] + F.dirs[dir][1] + F.step[1] * step) * cols + f.origin[0] + F.dirs[dir][0] + F.step[0] * step;
      for (const dir of ["down", "up", "left", "right"]) {
        const key = `fk-${sprite}-${dir}`;
        if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers(`folk-${f.sheet}`, { frames: F.walk.map(s => frame(dir, s)) }), frameRate: 6, repeat: -1 });
      }
      return { sheet: `folk-${f.sheet}`, still: dir => frame(dir, F.still) };
    }

    addNpc(o, p, J) {
      if (p.until && TK.cleared(p.until)) return;  // their part of the story is over
      let spr, folk = null, who = null;
      const face = p.face || "down";
      if (p.kind.startsWith("hero.") || p.drawn) {   // story people, and townsfolk drawn like them (kit folk.drawn)
        who = p.sprite;
        this.hero(who);
        spr = this.physics.add.sprite(o.x, o.y, `h-${who}-${face}-0`);
      } else {
        folk = this.folkAnims(p.sprite);
        spr = this.physics.add.sprite(o.x, o.y, folk.sheet, folk.still(face));
      }
      spr.setOrigin(.5, 1).setDepth(o.y).setImmovable(true);
      spr.body.setSize(10, 6).setOffset((spr.width - 10) / 2, spr.height - 6);
      // townsfolk drawn like the heroes speak with their own portrait and name
      const own = p.drawn ? L => L.map(l => l[0] === "n" ? ["say", who, ...l.slice(1)] : l) : L => L;
      const n = { id: o.name, spr, who, folk, sprite: p.sprite, say: own(J(p.say)), wander: p.wander, home: { x: o.x, y: o.y }, t: 0, dir: face, until: p.until,
        when: p.when || "", in: p.in ? JSON.parse(p.in) : null };   // only here once the story's condition holds (Guan Yu on his ridge)
      if (p.gives) Object.assign(n, { gives: p.gives, givesWhen: p.gives_when || "", give: own(J(p.give)), given: own(J(p.given)) });
      n.call = own(J(p.call));
      if (p.challenge) {
        n.challenge = `${this.w.n}-${this.placeId}-c-${p.challenge}`;
        n.intro = own(J(p.intro)); n.win = own(J(p.win)); n.done = own(J(p.done));
        // sight: "view" tiles all round, or a cone the way he faces; "guard": the point he keeps you from
        n.view = p.view ? JSON.parse(p.view) : 0; n.cone = !!(n.view && p.face); n.face0 = face;
        n.guard = p.guard_x != null ? { x: p.guard_x, y: p.guard_y } : null;
        n.mark = this.add.image(o.x, o.y - spr.height - 2, "@bang").setOrigin(.5, 1).setDepth(9999).setVisible(!TK.cleared(n.challenge) && (!n.when || this.cond(n.when)));
      }
      if (p.watch) {   // a stealth watcher: a cone, a beat to walk or ways to turn, what he says and where he sends you
        try { n.watch = JSON.parse(p.watch); } catch { n.watch = null; }
        if (n.watch) {
          const T = this.tw || 16, D = { N: "up", S: "down", W: "left", E: "right" }, dir = d => D[d] || d;
          Object.assign(n.watch, { pts: (n.watch.beat || []).map(([x, y]) => ({ x: (x + .5) * T, y: (y + .9) * T })), leg: 0, wait: 0, turn: 0, t: 0,
            dir: dir(n.watch.face || face), turns: (n.watch.turns || []).map(dir) });
          n.wander = false;
        }
      }
      this.physics.add.collider(spr, this.solids);
      if (this.water) this.physics.add.collider(spr, this.water);
      this.npcs.push(n);
    }

    // A portrait for the duel board: a hero's bust, or a townsperson's sprite, enlarged.
    faceOf(n) {
      const c = document.createElement("canvas"), g = c.getContext("2d");
      c.width = c.height = 34;
      g.imageSmoothingEnabled = false;
      if (n.who) { g.drawImage(TKArt.get(n.who, "bust"), 0, 0); return c; }
      const fr = n.folk && this.textures.getFrame(n.folk.sheet, n.folk.still("down"));
      if (!fr) return c;
      // Trim the frame to the figure, then show its top (head and shoulders) as large as fits.
      const t = document.createElement("canvas"), tg = t.getContext("2d");
      t.width = fr.cutWidth; t.height = fr.cutHeight;
      tg.drawImage(fr.source.image, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, 0, 0, fr.cutWidth, fr.cutHeight);
      const px = tg.getImageData(0, 0, t.width, t.height).data;
      let x0 = t.width, x1 = -1, y0 = t.height, y1 = -1;
      for (let y = 0; y < t.height; y++) for (let x = 0; x < t.width; x++)
        if (px[(y * t.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (x1 < 0) return c;
      const w = x1 - x0 + 1, h = Math.ceil((y1 - y0 + 1) * .7), k = Math.max(1, Math.floor(Math.min(30 / w, 32 / h)));
      g.drawImage(t, x0, y0, w, h, Math.round((34 - w * k) / 2), 34 - h * k, w * k, h * k);
      return c;
    }

    // The one the player walks as: the party's first (Liu Bei, unless the story hands the lead to someone
    // else, e.g. ["party", ["diaochan"]] in Book 2). The rest follow.
    get lead() { const p = this.st && this.st.party; return (p && p[0]) || "liubei"; }

    setParty(list) {
      for (const F of this.followers) F.spr.destroy();
      const lead = (list && list[0]) || "liubei";
      this.hero(lead);
      if (this.player) { this.player.anims.stop(); this.player.setTexture(`h-${lead}-${this.player.facing || "down"}-0`); }
      this.followers = (list || []).filter(x => x !== lead).map(who => {
        this.hero(who);
        return { who, spr: this.add.sprite(this.player.x, this.player.y, `h-${who}-down-0`).setOrigin(.5, 1) };
      });
      // a crowd that has fallen in behind (["crowd", n]: Jia Xu's Liangzhou men, more with each village)
      const folk = ["f_farmer", "f_youth", "f_soldier", "f_farmer2", "f_elder", "f_hunter", "f_porter"];
      for (let k = 0; k < (this.st.crowd || 0); k++) {
        const who = folk[k % folk.length];
        this.hero(who);
        this.followers.push({ who, crowd: true, spr: this.add.sprite(this.player.x, this.player.y, `h-${who}-down-0`).setOrigin(.5, 1) });
      }
      if (this.npcs) this.refreshStory();
      this.trailLen = Math.max(60, (this.followers.length + 1) * 14 + 1);
      this.trail = Array(this.trailLen).fill({ x: this.player.x, y: this.player.y, f: this.player.facing });
    }

    /* ---------- quests: progress is the campaign save ---------- */
    save() { WorldState.save(this.w.n, this.st); }
    // The light a scene left the world in (tk-cutscene.js): kept on the map, and on the next map, until
    // a scene sets another. Day is none.
    // Every state that holds now, merged in order (a later one's light, fog or sound wins); ids: all of them.
    mapState() {
      if (!this.states) return null;
      const on = this.states.filter(st => this.cond(st.when) && !(st.until && this.cond(st.until)));
      return on.length ? Object.assign({}, ...on, { ids: on.map(st => st.id) }) : null;
    }
    setWorldLight(tint) { this.st.light = tint || null; this.save(); this.applyWorldLight(); }
    applyWorldLight() {
      if (this.worldShade) { this.worldShade.destroy(); this.worldShade = null; }
      for (const g of this.glows || []) g.destroy();
      this.glows = [];
      const c = { night: 0x46559c, dusk: 0xf0c0a0, dawn: 0xd8c8e8, storm: 0x80868e, smoke: 0xb39c8a, dust: 0xe9d6ac }[this.st.light];
      if (!c) return;
      const W = this.scale.width, H = this.scale.height;
      this.worldShade = this.add.rectangle(W / 2, H / 2, W * 3, H * 3, c).setScrollFactor(0).setDepth(9e4).setBlendMode(Phaser.BlendModes.MULTIPLY);
      // at night the lamps, lanterns and fires light the ground round them (and you carry a little light yourself)
      if (this.st.light === "night" || this.st.light === "dusk") {
        if (!this.textures.exists("@glow")) {
          const S = 128, cv = document.createElement("canvas"); cv.width = cv.height = S;
          const g = cv.getContext("2d"), r = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
          r.addColorStop(0, "rgba(255,214,140,0.9)"); r.addColorStop(.45, "rgba(255,190,110,0.35)"); r.addColorStop(1, "rgba(255,170,90,0)");
          g.fillStyle = r; g.fillRect(0, 0, S, S);
          this.textures.addCanvas("@glow", cv);
        }
        const night = this.st.light === "night";
        for (const L of this.lights || []) {
          if (L.img && !L.img.visible) continue;
          const big = /firepit|cookfire|hearth/.test(L.kind) ? 1.1 : /lantern/.test(L.kind) ? .9 : .75;
          const g = this.add.image(L.x, L.y, "@glow").setBlendMode(Phaser.BlendModes.ADD).setDepth(9e4 + 1).setScale(big).setAlpha(night ? .75 : .4);
          this.tweens.add({ targets: g, alpha: g.alpha * .8, duration: 700 + Math.random() * 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          this.glows.push(g);
        }
        if (night && this.player) { this.carried = this.add.image(this.player.x, this.player.y - 8, "@glow").setBlendMode(Phaser.BlendModes.ADD).setDepth(9e4 + 1).setScale(.55).setAlpha(.35); this.glows.push(this.carried); }
      }
    }
    // A beat counts as done once anything after it is: saves from before a beat was
    // added (the mulberry tree, the indoor scenes) aren't sent back to it.
    done(key, seen = new Set()) {
      if (TK.cleared(key)) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return this.region.quests.some(q => q.after.includes(key) && this.done(q.node, seen));
    }
    // A story condition: "node:<key>" cleared (a short key is this world's), "item:<key>" held,
    // "mark:<id>" done; a list holds when all of it does.
    cond(c) {
      if (!c) return true;
      if (Array.isArray(c)) return c.every(x => this.cond(x));
      const i = String(c).indexOf(":"), kind = String(c).slice(0, i), v = String(c).slice(i + 1);
      if (kind === "node") return this.done(/^\d+-/.test(v) ? v : `${this.w.n}-${v}`);
      if (kind === "item") return WorldItems.has(this.w, v);
      if (kind === "mark") return WorldMarks.has(this.w, v);
      return false;
    }
    // A gated battle's first unmet condition: its defeat scene plays instead of the board.
    gateFor(q) { return q && q.gate ? q.gate.find(g => !this.cond(g.needs)) || null : null; }
    // The shrine of a place: dark (nothing yet), lit (its scene is open), settled (its board solved).
    shrineQuest(placeId = this.placeId) { return this.region.quests.find(q => q.shrine && this.placeIn(q.place, placeId)) || null; }
    shrineState(placeId = this.placeId) {
      const q = this.shrineQuest(placeId);
      return !q ? "dark" : this.done(q.node) ? "settled" : this.available(q) ? "lit" : "dark";
    }
    // Who is here and how the shrine looks follow the story; redone whenever it moves on.
    refreshStory() {
      const st = this.mapState();
      for (const n of this.npcs) if (n.when || n.in) {
        const on = this.cond(n.when) && (!n.in || !!(st && n.in.some(i => st.ids.includes(i))));
        n.spr.setVisible(on); n.spr.body.enable = on;
        if (n.mark) n.mark.setVisible(on && !TK.cleared(n.challenge));   // a challenger not here yet has no "!" either
      }
      for (const o of this.stated || []) {
        const on = !!(st && o.in.some(i => st.ids.includes(i)));
        if (o.img) o.img.setVisible(on);
        if (o.zone && o.zone.body) o.zone.body.enable = on;
      }
      if (st && "light" in st) {   // the state's light (day clears a scene's night)
        const L = { day: st.weather === "dust" ? "dust" : null, morning: "dawn", dawn: "dawn", dusk: "dusk", night: "night", lantern: "night", storm: "storm", smoke: "smoke" }[st.light];
        if ((this.st.light || null) !== (L || null)) { this.st.light = L || null; if (this.player) this.applyWorldLight(); }   // (on arrival the scene applies it once built)
      }
      // one of each person at a time: a brother standing here in his own right (Guan Yu on his
      // ridge) isn't also following Liu Bei
      const here = new Set(this.npcs.filter(n => n.who && n.spr.visible).map(n => n.who));
      for (const F of this.followers || []) F.spr.setVisible(!here.has(F.who));
      if (this.shrine && this.setShrine) this.setShrine(this.shrineState());
    }

    isDone(key) { return this.done(key) || !this.region.quests.some(q => q.node === key); }
    available(q) { return !this.done(q.node) && (q.after.length === 0 || q.after.some(a => this.isDone(a))); }
    placeOpen(id) {
      const room = this.region.places.find(p => p.id === id);
      if (room && room.parent) return this.placeOpen(room.parent);   // a building is open when its place is
      return id === this.region.start || this.st.visited.includes(id) ||
        this.region.quests.some(q => this.placeIn(q.place, id) && (this.available(q) || this.done(q.node)));
    }
    // a place, or a building in it (the county office is in Zhuo County)
    placeIn(place, id) {
      if (place === id) return true;
      const room = this.region.places.find(p => p.id === place);
      return !!(room && room.parent === id);
    }
    // the next main story point, and if it isn't open yet, the open quests on the roads that lead to it
    nextMain() { return this.region.quests.find(q => (q.role === "main" || q.role === "boss") && !this.done(q.node)); }
    leadsTo(q) {
      const Q = this.region.quests, seen = new Set(), out = [], stack = [...q.after];
      while (stack.length) {
        const k = stack.pop();
        if (seen.has(k)) continue;
        seen.add(k);
        const p = Q.find(x => x.node === k);
        if (!p) continue;
        if (this.available(p)) out.push(p); else if (!this.done(k)) stack.push(...p.after);
      }
      return out;
    }
    placeName(id) { return this.region.places.find(p => p.id === id).name; }
    placeZh(id) { return this.region.places.find(p => p.id === id).zh || this.placeName(id); }

    setGoal() {
      this.goalAt = this.goalPoint();
      if (this.fairy) this.fairy.wp = null;
      const q = this.nextMain();
      if (!q) return TK.world(this.w.n + 1)
        ? this.goal(`This book is complete. Book ${this.w.n + 1} is open: Menu → Book ${this.w.n + 1}.`, `这一卷已经完成。第${this.w.n + 1}卷已开启：菜单 → 第${this.w.n + 1}卷。`)
        : this.goal("This book is complete. The road goes on…", "这一卷已经完成。路还在前方……");
      const g = this.available(q) && this.gateFor(q);
      if (g && g.objective) {   // what the battle still needs, with a count
        const need = [].concat(g.needs || []), k = need.filter(c => this.cond(c)).length, n = need.length > 1 && g.count !== false ? ` (${k}/${need.length})` : "";
        const away = g.place && g.place !== this.placeId && !this.placeIn(this.placeId, g.place);
        return this.goal(`${g.objective}${n}${away ? ` (${this.placeName(g.place)})` : ""}`,
          g.objective_zh ? `${g.objective_zh}${n ? `（${k}/${need.length}）` : ""}${away ? `（${this.placeZh(g.place)}）` : ""}` : "");
      }
      if (this.available(q)) return q.place === this.placeId ? this.goal(q.objective, q.objective_zh)
        : this.goal(`${q.objective} (${this.placeName(q.place)})`, q.objective_zh ? `${q.objective_zh}（${this.placeZh(q.place)}）` : "");
      const lead = this.leadsTo(q);
      const ways = [...new Set(lead.map(p => p.role === "short" ? `the shortcut at ${this.placeName(p.place)}` : this.placeName(p.place)))];
      const waysZh = [...new Set(lead.map(p => p.role === "short" ? `${this.placeZh(p.place)}的捷径` : this.placeZh(p.place)))];
      this.goal(`On to ${this.placeName(q.place)}, by way of ${ways.join(" or ")}.`, `前往${this.placeZh(q.place)}，可经${waysZh.join("或")}。`);
    }
    goal(en, zh) {
      this.goalText = [en, zh];
      const h = this.activeHint();
      this.ui.goal(en, zh, h && [h.hint, h.hint_zh || ""]);
      if (this.mapW) this.fitCamera();   // the goal line's height moves the HUD's edge
      this.markActors();
    }
    // Counsel that stays present (Game Design, "Keeping hints present"): a cleared step's "hint" is
    // kept under the goal line while the next main step still needs it, i.e. that step follows it or
    // its gate names it, and until that gate is cleared.
    activeHint() {
      const q = this.nextMain();
      if (!q || (q.gate && !this.gateFor(q))) return null;
      // a gate may name a step short ("node:n7b"): the same as "node:1-n7b"
      const named = [].concat(...(q.gate || []).map(g => [].concat(g.needs || []))).map(c => String(c).replace(/^node:(?!\d+-)/, `node:${this.w.n}-`));
      return this.region.quests.filter(h => h.hint && h.node !== q.node && this.done(h.node) &&
        (q.after.includes(h.node) || named.includes(`node:${h.node}`))).pop() || null;
    }
    // A ring at the feet of whoever can act now: someone ready to give, or a place waiting for what
    // you now hold. It clears once their part is done; nobody who can't act yet is marked.
    markActors() {
      if (!this.npcs) return;
      this.actMarks = this.actMarks || new Map();
      const want = new Map();
      for (const n of this.npcs)
        if (n.gives && n.spr.visible && this.cond(n.givesWhen) && !WorldItems.has(this.w, n.gives)) want.set(n.spr, n.spr), n.spr.tkCall = n.call;
      for (const s of Object.values(this.spots || {}))
        if (s.needs && this.cond(s.when) && this.cond(s.needs) && !WorldMarks.has(this.w, s.delivers)) want.set(s, s), s.tkCall = s.call;
      for (const [k, m] of this.actMarks) if (!want.has(k)) { m.ev.remove(); this.actMarks.delete(k); }
      for (const [k, t] of want) {
        if (this.actMarks.has(k)) continue;
        // read at a glance on a phone: a bright gold ring at their feet, and a gold diamond bobbing over
        // their head (feet are often hidden behind other sprites). Made at the flat map's x, y like everyone
        // else; the isometric view moves them to where they're drawn (the diamond held above, isoBase).
        const ring = this.add.ellipse(k.x, k.y, 20, 9).setStrokeStyle(2.5, 0xffd34d, 1).setDepth(k.y - 1);
        const top = k.y - (k.displayHeight || 24) - 7;
        const gem = this.add.polygon(k.x, top, [0, -5, 4, 0, 0, 5, -4, 0], 0xffd34d).setStrokeStyle(1, 0x6a4a10).setDepth(9999);
        gem.isoBase = [k.x, k.y];
        const tw = this.tweens.add({ targets: ring, scale: 1.3, alpha: .6, duration: 800, yoyo: true, repeat: -1, ease: "Sine.InOut" });
        const tw2 = this.tweens.add({ targets: gem, y: top - 4, duration: 600, yoyo: true, repeat: -1, ease: "Sine.InOut" });
        const ev = { remove: () => { tw.remove(); tw2.remove(); ring.destroy(); gem.destroy(); } };
        this.actMarks.set(k, { ev, t, called: false });
      }
    }
    // A marked target with a "call" line speaks it once when the player comes near (a bubble over them,
    // not a dialogue): "You have the blood? Bring it here!"
    callOut() {
      if (!this.actMarks || !this.actMarks.size || !this.player || this.ui.busy()) return;
      const P = this.player;
      for (const m of this.actMarks.values()) {
        const L = m.t.tkCall;
        if (m.called || !L || !L.length || Math.hypot(m.t.x - P.x, m.t.y - P.y) > 56) continue;
        m.called = true;
        const l = worldLines(L)[0], v = this.view(m.t.x, m.t.y), y = v.y - (m.t.displayHeight || 22) - 10;
        const txt = this.add.text(v.x, y, (l[0] === "say" ? [l[3], l[2]] : [l[2], l[1]]).filter(Boolean).join("\n"), {
          fontFamily: "sans-serif", fontSize: "11px", color: "#3a2410", backgroundColor: "#f4e6c4", padding: { x: 5, y: 3 },
          wordWrap: { width: 160 } }).setOrigin(.5, 1).setDepth(10000).setResolution(2);
        this.tweens.add({ targets: txt, alpha: 0, delay: 3200, duration: 600, onComplete: () => txt.destroy() });
        const vid = l[l.length - 1];
        if (typeof TKVoice !== "undefined" && TKVoice.has(vid)) TKVoice.play(vid);   // voiced, like any line
      }
    }   // the goal line's height moves the HUD's edge

    // A tap on the goal line: walk toward it (its story spot here, or the way out toward it).
    walkToGoal() {
      if (!this.canMove()) return;
      const g = this.goalPoint();
      if (!g) return;
      const e = this.exits.find(e => Math.abs(e.rect.centerX - g.x) < 1 && Math.abs(e.rect.centerY - g.y) < 1);
      if (e) return this.tapAt(e.rect.centerX, e.rect.centerY);
      const k = Object.keys(this.spots).find(k => Math.hypot(this.spots[k].x - g.x, this.spots[k].y - g.y) < 8);
      this.walkTo(g.x, g.y + (k ? 12 : 8), k ? { then: "up", aim: { kind: "spot", k } } : {});
    }
    // Where the next objective is from here: its story spot on this map, or
    // the exit that starts the shortest way to its place (rooms included).
    goalPoint() {
      const q = this.nextMain();
      if (!q) return null;
      const g = this.available(q) && this.gateFor(q);
      if (g && g.place && g.objective) {   // the nearest giver or delivery place still to visit
        if (this.placeIn(this.placeId, g.place)) {   // in the place, or in one of its rooms
          const P = this.player, need = [].concat(g.needs || []).filter(c => !this.cond(c)), d = t => Math.hypot(t.x - P.x, t.y - P.y);
          const items = need.filter(c => c.startsWith("item:")).map(c => c.slice(5)), marks = need.filter(c => c.startsWith("mark:")).map(c => c.slice(5));
          const ts = [...this.npcs.filter(n => n.gives && items.includes(n.gives) && n.spr.visible).map(n => ({ x: n.spr.x, y: n.spr.y - 8 })),
                      ...Object.values(this.spots).filter(s => s.needs && marks.includes(s.delivers)).map(s => ({ x: s.x, y: s.y - 4 }))];
          this.goalHops = 0;
          if (ts.length) return ts.sort((a, b) => d(a) - d(b))[0];
          // a giver seated indoors: the door of their room, or out of this room first
          const room = this.region.places.find(p => p.parent === g.place && (p.gives || []).some(x => items.includes(x)));
          if (room && room.id !== this.placeId) return this.routeTo([{ place: room.id }]);
          if (this.placeId !== g.place) return this.routeTo([{ place: g.place }]);
        } else return this.routeTo([{ place: g.place }]);
      }
      return this.routeTo(this.available(q) ? [q] : this.leadsTo(q));
    }
    routeTo(quests) {
      const here = quests.find(x => x.place === this.placeId);
      this.goalHops = 0;
      if (this.place.archetype === "overworld") {   // the entrance of the place the goal is in (a room's own place)
        const top = id => { const p = this.region.places.find(x => x.id === id); return p && p.parent ? p.parent : id; };
        for (const q of quests) { const e = this.exits.find(e => e.to === top(q.place)); if (e) { this.goalHops = 1; return { x: e.rect.centerX, y: e.rect.centerY }; } }
        return null;
      }
      if (here) { const s = Object.values(this.spots).find(s => s.node === here.node); return s ? { x: s.x, y: s.y - 4 } : null; }
      const goals = new Set(quests.map(x => x.place)), near = {};
      for (const p of this.region.places) for (const l of p.links || []) { (near[p.id] ||= new Set()).add(l); (near[l] ||= new Set()).add(p.id); }
      const prev = { [this.placeId]: null }, queue = [this.placeId];
      while (queue.length) {
        const id = queue.shift();
        if (goals.has(id)) {
          let hop = id;
          for (let n = id; n !== this.placeId; n = prev[n]) this.goalHops++;
          while (prev[hop] !== this.placeId) hop = prev[hop];
          const e = this.exits.find(e => e.to === hop);
          return e ? { x: e.rect.centerX, y: e.rect.centerY } : null;
        }
        for (const n of near[id] || []) if (!(n in prev)) { prev[n] = id; queue.push(n); }
      }
      return null;
    }

    // Wukong leads the way like a guiding spirit: he flies on ahead toward the goal,
    // waits there drifting in lazy loops, and darts on once you catch up. Near the
    // goal he settles over it. He moves on his own, gliding, never pinned to you.
    // Overworld: each place's name over its entrance; locked ones dimmed, the goal's marked.
    overworldLabels(root) {
      if (!root) return;
      const goalPlace = (() => { const q = this.nextMain(); if (!q) return null; const qs = this.available(q) ? [q] : this.leadsTo(q);
        const p = this.region.places.find(x => x.id === (qs[0] && qs[0].place)); return p ? (p.parent || p.id) : null; })();
      this.labels = this.exits.filter(e => e.to && this.region.places.some(p => p.id === e.to)).map(e => {
        const el = document.createElement("div"), open = this.placeOpen(e.to), goal = e.to === goalPlace;
        el.className = "town-label" + (open ? "" : " locked") + (goal ? " goal" : "");
        el.innerHTML = `<b lang="zh-CN">${goal ? "◆ " : ""}${this.placeZh(e.to)}</b><span>${this.placeName(e.to)}${open ? "" : " · 未开放 locked"}</span>`;
        root.append(el);
        return { el, x: e.rect.centerX, y: e.rect.y };
      });
    }
    placeLabels() {
      if (!this.labels) return;
      const cam = this.cameras.main, v = cam.worldView, cv = this.game.canvas, k = cv.clientWidth / this.scale.width;
      const r = cv.getBoundingClientRect(), rr = this.labels[0] && this.labels[0].el.parentNode.getBoundingClientRect();
      const hide = this.ui.busy() || !!this.cine;
      for (const L of this.labels) {
        const at = this.view(L.x, L.y), sx = (at.x - v.x) * cam.zoom, sy = (at.y - v.y) * cam.zoom;
        const on = !hide && sx > -40 && sx < this.scale.width + 40 && sy > -10 && sy < this.scale.height + 20;
        L.el.hidden = !on;
        if (on) { L.el.style.left = `${r.left - rr.left + sx * k}px`; L.el.style.top = `${r.top - rr.top + sy * k}px`; }
      }
    }

    goalGuide(time) {
      const el = this.guide, t = this.goalAt;
      if (!el) return;
      const P = this.player, dt = Math.min(50, this.game.loop.delta || 16) / 1000;
      // (not while a story scroll is up or a story is playing: reading isn't being stuck)
      const free = !!t && !this.ui.busy() && !this.leaving && !this.cine && !this.seated &&
        !(typeof TKStory !== "undefined" && TKStory.busy) && !document.querySelector(".tk-scroll-wrap");
      // progress: maps still to cross, then distance on this one; getting closer resets the clock
      const q = this.nextMain(), key = q ? q.node : "", score = (this.goalHops || 0) * 1000 + (t ? Math.hypot(t.x - P.x, t.y - P.y) : 0);
      const G = WorldGuide.prog || (WorldGuide.prog = { key, best: score, idle: 0 });
      if (G.key !== key || score < G.best - 40) Object.assign(G, { key, best: Math.min(score, G.key === key ? G.best : score), idle: 0 });
      else if (free) G.idle += dt * 1000;
      const mode = WorldGuide.mode, show = free && (mode === "always" || (mode === "stuck" && G.idle > WorldGuide.STUCK));
      el.hidden = !show; el.say.hidden = true;
      if (!show) { this.fairy = null; return; }   // he leaves, and flies in fresh next time
      const f = this.fairy || (this.fairy = { x: P.x - (t.x > P.x ? 60 : -60), y: P.y - 70, vx: 0, vy: 0, wp: null, still: 0 });
      const toX = t.x - P.x, toY = t.y - P.y, dist = Math.hypot(toX, toY) || 1;
      // where he waits: over the goal when you're close to it, else a stretch ahead on the way
      const ahead = () => {
        if (dist < 120) return { x: t.x, y: t.y - 22 };
        const side = (Math.random() - .5) * 40;
        return { x: P.x + toX / dist * 95 - toY / dist * side, y: P.y - 18 + toY / dist * 95 + toX / dist * side * .6 };
      };
      if (!f.wp) f.wp = ahead();
      const caught = Math.hypot(P.x - f.wp.x, P.y + 18 - f.wp.y) < 48;            // you've reached him
      const strayed = Math.hypot(f.wp.x - t.x, f.wp.y - t.y) > dist + 70;         // you went another way
      const settle = dist < 120 && Math.hypot(f.wp.x - t.x, f.wp.y - t.y + 22) > 4;
      const lost = Math.hypot(P.x - f.wp.x, P.y - f.wp.y) > 200;                    // you're far behind: he comes back for you
      if (caught || strayed || settle || lost) f.wp = ahead();
      // a slow drift around the waiting point
      const wx = f.wp.x + Math.sin(time / 900) * 9 + Math.sin(time / 1730) * 5, wy = f.wp.y + Math.cos(time / 1150) * 5;
      // glide there: ease the velocity toward the way, with a top speed
      let dvx = (wx - f.x) * 2.2, dvy = (wy - f.y) * 2.2;
      const sp = Math.hypot(dvx, dvy), max = 120;
      if (sp > max) { dvx *= max / sp; dvy *= max / sp; }
      const k = 1 - Math.pow(.02, dt);
      f.vx += (dvx - f.vx) * k; f.vy += (dvy - f.vy) * k;
      f.x += f.vx * dt; f.y += f.vy * dt;
      // standing still far from the goal: a nudge
      f.still = P.body && P.body.speed > 1 ? 0 : f.still + dt * 1000;
      const nudge = dist > 120 && f.still > 2500 && (f.still - 2500) % 6000 < 1800;
      // onto the screen (he stays in view at the edge if he's flown on beyond it)
      const cam = this.cameras.main, v = cam.worldView, W = this.scale.width, H = this.scale.height;
      const fv = this.view(f.x, f.y), tv = this.view(t.x, t.y);
      const gx = Math.max(14, Math.min(W - 14, (fv.x - v.x) * cam.zoom)), gy = Math.max(26, Math.min(H - 6, (fv.y - v.y) * cam.zoom)) + Math.sin(time / 330) * 1.5;
      const sx = (tv.x - v.x) * cam.zoom, sy = (tv.y - v.y) * cam.zoom;
      const left = Math.abs(f.vx) > 12 ? f.vx < 0 : sx < gx;   // face where he's flying, else toward the goal
      const a = Math.atan2(-(sy - (gy - 12)), Math.abs(sx - gx)) * 180 / Math.PI;
      WorldGuide.place(el, this.game.canvas, W, gx, gy, left, a, time, cam.zoom);
      el.say.hidden = !nudge;
    }

    // Walk up to a story spot. A scene with a ["problem"] step builds up to
    // the board and plays its payoff once the problem is solved; leave or slip
    // and the next try picks up at the last line before it. A scene without
    // one plays after the problem, as before.
    playQuest(q, spot) {
      // a gated battle before it's ready: its defeat scene, no board, no cooldown; he stays here
      const gate = this.gateFor(q);
      if (gate) return this.playScene(gate.else, () => {
        // back by the spot (the scene may have marched him off), and it waits until he steps away
        if (spot) {
          const G = this.walkGrid(), C = G.C;
          let best = null;
          for (let r = 1; r < 8 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
            const x = Math.floor(spot.x / C) + dx, y = Math.floor((spot.y + 28) / C) + dy;
            if (G.free(x, y) && (!best || Math.hypot(dx, dy) < best.d)) best = { x: x * C + C / 2, y: y * C + C / 2 + 3, d: Math.hypot(dx, dy) };
          }
          if (best) { this.player.setPosition(best.x, best.y); this.trail = Array(60).fill({ x: best.x, y: best.y, f: "down" }); }
          spot.armed = false; spot.armAt = { x: this.player.x, y: this.player.y };
        }
        this.setGoal();
      });
      const steps = (this.story[q.scene] || {}).steps || [], at = steps.findIndex(s => s[0] === "problem");
      if (q.board === false) {   // a scene with no board (a defeat): playing it is the beat
        const fin = () => { TK.markCleared(q.node); this.finishQuest(q, steps); };
        const play = () => this.playScene(q.scene, fin);
        return spot.intro.length ? this.talk(worldLines(spot.intro), play, "story") : play();
      }
      const setter = q.boss ? q.boss.who : at >= 0 && steps[at][1];   // ["problem", who]: who sets it
      const foe = setter ? { who: setter, face: this.faceOf({ who: setter }) } : null;
      const intro = spot.intro.length ? worldLines(spot.intro)
        : q.boss ? [["say", q.boss.who, q.boss.taunt, q.boss.taunt_zh, q.boss.taunt_vid]] : [["n", `${q.title}.`, q.title_zh ? `${q.title_zh}。` : ""]];
      if (at < 0) return this.talk(intro, () => this.puzzle(q.node, foe), "story");
      const seen = `${this.w.n}:${q.scene}:lead`, again = TK.seen(seen);
      const say = lines => new Promise(r => lines.some(l => l[0] === "n" || l[0] === "say") ? this.talk(lines, r, "story") : r());
      // the problem's own framing, the board, and on a win the spot's farewell
      // A scene can pose several problems, with lines between them ("NODE~1", "NODE~2", … each kept and
      // rested on its own); coming back resumes at the first one not yet solved.
      const nProb = steps.filter(s => s[0] === "problem").length;
      const keyOf = i => nProb > 1 ? `${q.node}~${i + 1}` : q.node;
      const problemDone = i => nProb > 1 && TK.cleared(keyOf(i));
      const solve = async (i = 0) => {
        TK.markSeen(seen);
        if (!i && (spot.intro.length || q.boss)) await say(intro);   // a bare title would only break the tension here
        const won = await this.duel(keyOf(i), foe);
        if (won && i === nProb - 1) await this.parting(q.node, spot.outro, say);   // their parting word, they go, then the empty board
        return won;
      };
      const finish = () => { if (nProb > 1) TK.markCleared(q.node); this.finishQuest(q, steps); };
      const cs = this.cutscene(q);
      if (cs && cs.beats.some(b => b.do === "problem"))
        // whoever is here only until this beat (the Star Lords at the oath) stays on stage to set the problem
        return WorldCutscene.play(this, cs, finish, { onProblem: solve, problemDone, onLeave: () => {}, ffToProblem: again,
          keep: this.npcs.filter(n => n.until === q.node && n.spr.visible).map(n => n.spr) });
      // no staged scene: the lines, each problem in turn (solved ones passed by), then the rest
      const segs = [[]];
      for (const s of steps) s[0] === "problem" ? segs.push([]) : segs[segs.length - 1].push(s);
      const spoken = L => L.filter(s => s[0] === "n" || s[0] === "say");
      (async () => {
        for (let i = 0; i < nProb; i++) {
          if (problemDone(i)) continue;
          const L = spoken(segs[i]);
          await say(again && i === 0 ? L.slice(-1) : L);
          if (!(await solve(i))) return;
        }
        this.talk(segs[nProb], finish, "story");
      })();
    }

    // A scene by id, staged here if the generator made one, else its lines.
    playScene(id, done) {
      const all = (this.cache.json.get("cutscenes") || {}).scenes || {}, cs = all[id];
      this.walk = null;
      if (cs && cs.place === this.placeId && typeof WorldCutscene !== "undefined") return WorldCutscene.play(this, cs, done);
      return this.talk((this.story[id] || {}).steps || [], done, "story");
    }

    cutscene(q) {
      const cs = ((this.cache.json.get("cutscenes") || {}).scenes || {})[q.scene];
      return cs && cs.place === this.placeId && typeof WorldCutscene !== "undefined" ? cs : null;
    }

    // A won spot's farewell. Those here only until this node (the Star Lords) are already gone
    // (they vanish when the board is won); any words of theirs left in the outro come first, then
    // the rest (the narration that they are gone).
    async parting(node, outro, say) {
      const lines = worldLines(outro), going = this.npcs.filter(n => n.until === node && n.spr.visible);
      const ids = new Set([...going, ...this.npcs.filter(n => n.until === node)].map(n => n.who).filter(Boolean));
      const cut = lines.reduce((k, l, i) => l[0] === "say" && ids.has(l[1]) ? i + 1 : k, 0);
      await say(lines.slice(0, cut));
      this.vanish(node);
      await say(lines.slice(cut));
    }

    // People who are only here until a beat is won (the Star Lords at the oath).
    // fade: a moment's fade (they were seen to go), not a blink
    vanish(node, fade = false) {
      const gone = this.npcs.filter(n => n.until === node);
      for (const n of gone) { n.spr.body.enable = false; if (n.mark) n.mark.setVisible(false); }
      if (!fade || !gone.some(n => n.spr.visible)) { gone.forEach(n => n.spr.setVisible(false)); return Promise.resolve(); }
      return new Promise(r => this.tweens.add({ targets: gone.map(n => n.spr), alpha: 0, duration: 700,
        onComplete: () => { gone.forEach(n => n.spr.setVisible(false).setAlpha(1)); r(); } }));
    }

    // What a won story beat leaves behind: who joined, what was given, the next goal.
    async finishQuest(q, steps) {
      for (const s of steps) if (s[0] === "crowd") this.st.crowd = Math.max(0, typeof s[1] === "string" ? (this.st.crowd || 0) + +s[1] : +s[1] || 0);
      for (const s of steps) if (s[0] === "party") { this.st.party = s[1]; TK.setParty(this.w, s[1]); }
      if (steps.some(s => s[0] === "party" || s[0] === "crowd")) this.setParty(this.st.party);
      if (typeof WorldItems !== "undefined") WorldItems.gainFrom(this, steps);   // what the scene gave
      if (q.scene) TK.markSeen(`${this.w.n}:${q.scene}`);
      // a gated battle won: the supplies it needed have done their job
      for (const g of q.gate || []) for (const c of [].concat(g.needs || [])) {
        const [k, v] = String(c).split(":");
        if (k === "item" && (WorldItems.defs(this.w)[v] || {}).kind === "supply") WorldItems.remove(this.w, v);
      }
      this.refreshStory();
      this.save();
      this.setGoal();
      // a handoff to a new lead who is somewhere else: a fade, and they begin by the next beat
      // ({"to": node}: by that beat's spot; {"to": {"place", "from"}}: arriving in that place as if from that one)
      const hand = steps.find(s => s[0] === "party" && s[2] && s[2].to), to = hand && hand[2].to;
      const placeOf = name => name && this.region.places.find(p => p.id === name || p.name === name);
      const toQ = typeof to === "string" && this.region.quests.find(x => x.node === `${this.w.n}-${to}`);
      const toP = to && typeof to === "object" && placeOf(to.place);
      if (toQ || toP) {
        this.leaving = true; this.st.pos = null; this.save();
        this.cameras.main.fadeOut(500);
        this.cameras.main.once("camerafadeoutcomplete", () => this.scene.restart(toQ ? { place: toQ.place, from: null, toNode: toQ.node }
          : { place: toP.id, from: (placeOf(to.from) || {}).id || null }));
        return;
      }
      if (q.role === "boss" && this.opts.onBoss) await this.opts.onBoss();
      // the book's main story is over: on into the next book (a moment, a fade). But if side stories are
      // still open here (Book 2's Diaochan chain opens with its last beat), stay: say so once, and go on
      // when the last of them is done, or whenever the player picks the next book from the menu.
      if (!this.nextMain() && this.opts.onBookDone && TK.world(this.w.n + 1)) {
        const open = this.region.quests.filter(x => (x.role === "side" || x.role === "short") && this.available(x));
        const n = this.w.n + 1;
        if (!open.length) {
          this.goal(`Book ${this.w.n} is complete. On to Book ${n}…`, `第${this.w.n}卷完。前往第${n}卷……`);
          this.leaving = true;
          this.time.delayedCall(1800, () => { this.cameras.main.fadeOut(600); this.time.delayedCall(650, () => this.opts.onBookDone()); });
        } else if (q.role !== "side" && q.role !== "short") {
          this.talk([["n", `The main story of Book ${this.w.n} is done, but ${open.length === 1 ? "one story is" : `${open.length} stories are`} still untold on these roads. Book ${n} is open whenever you're ready: Menu → Book ${n}.`,
            `第${this.w.n}卷正篇已完，但这一路上还有${open.length}段故事未曾讲述。第${n}卷已开启，随时可从菜单前往。`]]);
        }
      }
    }

    // Bring up the problem over the map; resolves true on a flawless solve.
    // The world waits behind it.
    async duel(key, foe) {
      const P = this.player;
      this.st.pos = { place: this.placeId, x: Math.round(P.x), y: Math.round(P.y), f: P.facing };
      this.save();
      this.leaving = true;
      P.setVelocity(0); P.anims.stop();
      this.ui.hint(null);
      // solved: whoever was here only until this beat (the Star Lords) is gone at once, behind the board
      const win = await this.opts.onPuzzle(key, { host: this.opts.host, foe, onWin: () => this.vanish(key.split("~")[0]) });
      if (!this.sys.isActive()) return false;  // the page moved on meanwhile
      this.leaving = false;
      this.opts.host.focus();
      return win;
    }

    // A problem with its scene after it (challengers, and scenes with no ["problem"] step).
    async puzzle(key, foe) {
      if (await this.duel(key, foe)) this.returned({ key, win: true });
    }

    // Back from a won problem: play what it unlocked (the whole scene; a
    // direct-link win comes back here too, so a mid-scene problem is passed by).
    returned(ret) {
      if (!ret.win) return;
      const q = this.region.quests.find(x => x.node === String(ret.key).split("~")[0]);
      if (q) {
        const spot = Object.values(this.spots).find(s => s.node === q.node);
        const steps = [...worldLines(spot && spot.outro), ...((this.story[q.scene] || {}).steps || [])];
        const finish = () => this.finishQuest(q, steps);
        // a staged cutscene (tk-cutscene.js) when the scene generator made one for this place, else the lines alone
        const cs = this.cutscene(q), rest = ((this.story[q.scene] || {}).steps || []);
        const say = lines => new Promise(r => lines.length ? this.talk(lines, r, "story") : r());
        return this.parting(q.node, spot && spot.outro, say).then(() =>
          cs ? WorldCutscene.play(this, cs, finish) : this.talk(rest, finish, "story"));
      }
      const n = this.npcs.find(m => m.challenge === ret.key);
      if (n) { n.mark.setVisible(false); this.talk(worldLines(n.win)); }
    }

    /* ---------- tap to move, tap to talk ---------- */
    // A walk grid for this place (8 px cells): blocked where a building, tree or prop
    // stands, or on water. Built once per place, on the first tap.
    walkGrid() {
      if (this.grid) return this.grid;
      const C = 8, b = this.physics.world.bounds, cols = Math.ceil(b.width / C), rows = Math.ceil(b.height / C);
      const block = new Uint8Array(cols * rows), pad = 5;
      for (const z of this.solids.getChildren()) {
        const bd = z.body, x0 = Math.floor((bd.x - pad) / C), x1 = Math.floor((bd.right + pad) / C), y0 = Math.floor((bd.y - 3) / C), y1 = Math.floor((bd.bottom + 3) / C);
        for (let y = Math.max(0, y0); y <= Math.min(rows - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(cols - 1, x1); x++) block[y * cols + x] = 1;
      }
      if (this.water) this.water.forEachTile(t => {
        if (t.index === -1) return;
        for (let y = Math.floor(t.pixelY / C); y < Math.ceil((t.pixelY + t.height) / C); y++) for (let x = Math.floor(t.pixelX / C); x < Math.ceil((t.pixelX + t.width) / C); x++) if (x < cols && y < rows) block[y * cols + x] = 1;
      });
      return (this.grid = { C, cols, rows, block, free: (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && !block[y * cols + x] });
    }
    // A* over the grid (8 directions, no corner-cutting), then the path pulled straight.
    // People standing about count as in the way (all but `skip`, the one being walked up to).
    findPath(fx, fy, tx, ty, skip = null) {
      const G0 = this.walkGrid(), C = G0.C, key = (x, y) => y * G0.cols + x;
      const people = new Set();
      for (const n of this.npcs) {
        if (n === skip || !n.spr.visible) continue;
        for (let y = Math.floor((n.spr.y - 7) / C); y <= Math.floor((n.spr.y + 1) / C); y++)
          for (let x = Math.floor((n.spr.x - 6) / C); x <= Math.floor((n.spr.x + 6) / C); x++) people.add(key(x, y));
      }
      const G = { ...G0, free: (x, y) => G0.free(x, y) && !people.has(key(x, y)) };
      const near = (x, y) => {   // the nearest open cell to one that isn't
        if (G.free(x, y)) return [x, y];
        let best = null;
        for (let r = 1; r < 6 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
          if (G.free(x + dx, y + dy) && (!best || Math.hypot(dx, dy) < best[2])) best = [x + dx, y + dy, Math.hypot(dx, dy)];
        return best && [best[0], best[1]];
      };
      // from where he stands (squeezed against a wall or someone, the nearest open cell), to the tap
      const s0 = near(Math.floor(fx / C), Math.floor(fy / C)), g0 = near(Math.floor(tx / C), Math.floor(ty / C));
      if (!s0 || !g0) return null;
      let [sx, sy] = s0, [gx, gy] = g0;
      const open = [[0, sx, sy]], g = new Map([[key(sx, sy), 0]]), from = new Map(), h = (x, y) => Math.hypot(x - gx, y - gy);
      let n = 0;
      while (open.length && n++ < 20000) {
        let bi = 0;
        for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
        const [, x, y] = open.splice(bi, 1)[0];
        if (x === gx && y === gy) break;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (!G.free(nx, ny) || (dx && dy && (!G.free(x + dx, y) || !G.free(x, y + dy)))) continue;
          const c = g.get(key(x, y)) + (dx && dy ? 1.414 : 1);
          if (c < (g.get(key(nx, ny)) ?? Infinity)) { g.set(key(nx, ny), c); from.set(key(nx, ny), [x, y]); open.push([c + h(nx, ny), nx, ny]); }
        }
      }
      // the tap snapped into a pocket he can't get into (behind a table, say): go as close as he can
      if (!g.has(key(gx, gy))) {
        let best = null;
        for (const k of g.keys()) { const x = k % G0.cols, y = (k - x) / G0.cols, d = h(x, y); if (!best || d < best[2]) best = [x, y, d]; }
        if (!best || best[2] > 6) return null;
        [gx, gy] = best;
      }
      const cells = [];
      for (let c = [gx, gy]; c; c = from.get(key(c[0], c[1]))) cells.unshift(c);
      // keep only the turning points that can't be seen past
      const clear = (a, b) => { const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2);
        for (let i = 1; i < steps; i++) { const x = Math.round(a[0] + (b[0] - a[0]) * i / steps), y = Math.round(a[1] + (b[1] - a[1]) * i / steps); if (!G.free(x, y)) return false; } return true; };
      const pts = [cells[0]];
      for (let i = 1; i < cells.length; i++) if (!clear(pts[pts.length - 1], cells[i])) pts.push(cells[i - 1]);
      pts.push(cells[cells.length - 1]);
      return pts.slice(1).map(([x, y]) => ({ x: x * C + C / 2, y: y * C + C / 2 }));
    }
    // What's under a point of the world: someone (their figure, not the ground beside them),
    // a story spot, or a building's door; null for open ground.
    // sx, sy: the tap as drawn (the isometric view); each thing is then tested against the tap as it
    // falls on that thing's own picture, which stands up from its feet, not lies on the ground
    pick(x, y, sx, sy) {
      const at = this.tapOn(x, y, sx, sy);
      // forgiving: a fingertip (about 44 screen px) anywhere near someone's figure, or on the thing a
      // story spot is (its notice board, its table), counts; the nearest wins
      const cv = this.game.canvas, k = cv.clientWidth ? cv.clientWidth / this.scale.width : 1, r = Math.max(9, 22 / (this.cameras.main.zoom * k));
      const toBox = (b, x, y) => Math.hypot(Math.max(b.x0 - x, 0, x - b.x1), Math.max(b.y0 - y, 0, y - b.y1));
      const who = this.npcs.filter(n => n.spr.visible).map(n => { const t = at(n.spr.x, n.spr.y);
        return { n, d: toBox({ x0: n.spr.x - n.spr.width / 2 + 2, x1: n.spr.x + n.spr.width / 2 - 2, y0: n.spr.y - n.spr.height, y1: n.spr.y + 3 }, t.x, t.y) }; })
        .filter(o => o.d <= r).sort((a, b) => a.d - b.d)[0];
      const spot = Object.entries(this.spots).map(([key, s]) => {
        const t = at(s.x, s.y);
        const own = Math.hypot(s.x - t.x, s.y - t.y);
        let d = own;
        for (const b of this.propBoxes || []) if (Math.hypot(b.cx - s.x, b.y1 - s.y) < 28) { const u = at(b.cx, b.y1, b.img); d = Math.min(d, toBox(b, u.x, u.y)); }
        return { key, s, d, mine: own <= 18 };
      // a tap on a spot's own place beats a neighbour's picture reaching over it (the Black Wind altar over the shrine)
      }).filter(o => o.d <= Math.max(18, r)).sort((a, b) => (b.mine - a.mine) || a.d - b.d)[0];
      if (who && (!spot || who.d <= spot.d)) return { kind: "npc", n: who.n };
      if (spot) return { kind: "spot", k: spot.key, s: spot.s };
      // a way out: a building's door (tap the building or its doorway), or any other exit
      // (a room's door out, a road off the edge of the map), tapped on or near
      const doorway = e => e.side === "N" && e.rect.width < 16;
      const door = this.exits.filter(e => doorway(e)
          // the building itself (its face, from the door up), not the road in front of it
          ? this.onBuilding(e, x, y, at, sx, sy) && this.placeOpen(e.to)
          : x > e.rect.x - 20 && x < e.rect.right + 20 && y > e.rect.y - 20 && y < e.rect.bottom + 20)
        .sort((a, b) => Math.hypot(a.rect.centerX - x, a.rect.centerY - y) - Math.hypot(b.rect.centerX - x, b.rect.centerY - y))[0];
      if (door) return { kind: "door", e: door };
      return null;
    }
    // The tap as it falls on a thing standing at (ox, oy): flat, the tap itself; isometric, the point the
    // same distance from (ox, oy) as the tap is from where the thing is drawn (img.isoAt: a building's footprint).
    tapOn(x, y, sx, sy) {
      if (!this.iso || sx == null) return () => ({ x, y });
      return (ox, oy, img) => {
        const a = img && img.isoAt, q = a ? this.iso.P(a[0], a[1]) : this.iso.P(ox, oy);
        return { x: ox + sx - q.x, y: oy + sy - q.y - (a ? a[2] : 0) };
      };
    }
    // A tap on the building a door belongs to (as drawn), or just above its door.
    onBuilding(e, x, y, at = () => ({ x, y }), sx, sy) {
      const b = (this.buildings || []).find(b => Math.abs(b.x - e.rect.centerX) < b.w / 2 && Math.abs(b.bottom - e.rect.bottom) < 20);
      // isometric: the building as drawn, its painted pixels only (not the empty corners or the road before it)
      if (b && this.iso && b.img && sx != null) {
        // where the view draws it (between frames img.x, img.y are back on the flat map), and a mirrored building's pixels
        const img = b.img, a = img.isoAt, q = a ? this.iso.P(a[0], a[1]) : this.iso.P(img.x, img.y), X = q.x, Y = q.y + (a ? a[2] : 0);
        let lx = (sx - (X - img.displayWidth * img.originX)) / Math.abs(img.scaleX); const ly = (sy - (Y - img.displayHeight * img.originY)) / Math.abs(img.scaleY);
        if (lx < 0 || ly < 0 || lx >= img.width || ly >= img.height) return false;
        if (img.flipX) lx = img.width - 1 - lx;
        return (this.textures.getPixelAlpha(Math.floor(lx), Math.floor(ly), img.texture.key, img.frame.name) || 0) > 40;
      }
      if (b && this.iso) { const t = at(b.x, b.bottom, b.img); return Math.abs(t.x - b.x) < b.w / 2 && t.y > b.bottom - b.h && t.y < b.bottom; }
      if (b) return Math.abs(x - b.x) < b.w / 2 && y > b.bottom - b.h && y < e.rect.bottom;
      return Math.abs(x - e.rect.centerX) < 22 && y > e.rect.centerY - 48 && y < e.rect.bottom;
    }
    // The feet-sized body, centred under the sprite whatever its size (drawn, generated or
    // mounted sprites differ); redone in update whenever the frame size changes.
    footBody(spr) {
      spr.body.setSize(10, 6).setOffset((spr.width - 10) / 2, spr.height - 6);
      spr._fw = spr.width; spr._fh = spr.height;
    }
    canMove() { return !this.ui.busy() && !this.seated && !this.leaving && !this.cine && !this.approaching; }
    tapAt(x, y, sx, sy) {
      if (this.ui.busy()) return this.act();   // tap on through dialogue
      if (!this.canMove()) return;              // (at the go table, its own panel has the buttons)
      const P = this.player, t = this.pick(x, y, sx, sy);
      let tx = x, ty = y + 4, then = null, aim = null, door = null;
      if (t && t.kind === "npc") {   // walk up to them, face them, talk
        const who = t.n, sides = [[0, 14, "up"], [0, -12, "down"], [-14, 2, "right"], [14, 2, "left"]].map(([dx, dy, f]) => ({ x: who.spr.x + dx, y: who.spr.y + dy, f }));
        const G = this.walkGrid(), ok = sides.filter(s => G.free(Math.floor(s.x / G.C), Math.floor(s.y / G.C)));
        const side = (ok.length ? ok : sides).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
        tx = side.x; ty = side.y; then = side.f; aim = t;
      } else if (t && t.kind === "spot") { tx = t.s.x; ty = t.s.y + 12; then = "up"; aim = { kind: "spot", k: t.k }; }
      else if (t && t.kind === "door") {   // walk up to it from inside the map, then on through
        door = t.e;
        const r = door.rect, v = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] }[door.side] || [0, 0];
        tx = r.centerX + v[0] * (r.width / 2 + 10); ty = r.centerY + v[1] * (r.height / 2 + 8) + 3;
      }
      this.walkTo(tx, ty, { then, aim, door });
    }
    // Head for a point by the walk grid; ring marks where.
    walkTo(tx, ty, { then = null, aim = null, door = null, ring = true } = {}) {
      const P = this.player, path = this.findPath(P.x, P.y - 3, tx, ty - 3, aim && aim.kind === "npc" ? aim.n : null);
      if (!path) return false;
      if (door) path.push({ x: door.rect.centerX, y: door.rect.centerY - (door.side === "N" ? 2 : 0) });
      this.walk = { path, then, aim, door: !!door, last: { x: P.x, y: P.y }, stuck: 0, retries: 0 };
      if (ring) {
        const r = this.add.circle(tx, ty, 5).setStrokeStyle(1, 0xfff3c4, .9).setDepth(-997);
        this.tweens.add({ targets: r, scale: 1.8, alpha: 0, duration: 450, onComplete: () => r.destroy() });
      }
      return true;
    }
    // Pointer held down and dragged: keep steering toward the finger (open ground only).
    steer(p) {
      if (!p.isDown || !this.canMove() || p.getDuration() < 220) return;
      const now = this.time.now;
      if (now - (this.steerAt || 0) < 160) return;
      this.steerAt = now;
      const q = this.flat(p.worldX, p.worldY);
      this.walkTo(q.x, q.y + 4, { ring: false });
    }
    // Over something you can tap: the hand cursor (a mouse; touch has none).
    hover(p) {
      const q = this.flat(p.worldX, p.worldY), c = this.game.canvas, t = this.canMove() && this.pick(q.x, q.y, p.worldX, p.worldY);
      c.style.cursor = t || this.ui.busy() ? "pointer" : "";
    }
    // The direction to the next point on the walk; at the end, turn to face and talk if a tap asked for it.
    followWalk(dt) {
      const W = this.walk, P = this.player, p = W.path[0];
      if (!p) return [0, 0];
      const dx = p.x - P.x, dy = p.y - (P.y - 3), d = Math.hypot(dx, dy);
      if (d < 4) {
        W.path.shift();
        if (!W.path.length) { this.arrive(W); return [0, 0]; }
        return this.followWalk(dt);
      }
      // blocked by someone walking by: give up after a moment rather than push forever
      W.stuck = Math.hypot(P.x - W.last.x, P.y - W.last.y) < .5 ? W.stuck + dt : 0;
      W.last = { x: P.x, y: P.y };
      if (W.stuck > 350) {
        // someone stepped into the way: go round them; if there's no way round just now (a villager
        // in the doorway), wait a moment for them to move on; stop only after a few tries
        const end = W.path[W.path.length - 1], again = W.retries < 6 && this.findPath(P.x, P.y - 3, end.x, end.y, W.aim && W.aim.kind === "npc" ? W.aim.n : null);
        if (!again) {
          if (W.retries < 6) { W.retries++; W.stuck = 0; return [0, 0]; }
          this.arrive(W); return [0, 0];
        }
        if (W.door) again.push(end);   // the step in through the door is off the grid
        W.path = again; W.retries++; W.stuck = 0;
        return this.followWalk(dt);
      }
      return [dx / d, dy / d];
    }
    // End of a tap-walk: if it was headed for someone (or a spot) and got close enough
    // (the person may have stepped into the way), face them and talk.
    arrive(W) {
      const P = this.player, a = W.aim;
      this.walk = null;
      if (!a) return;
      const at = a.kind === "npc" ? { x: a.n.spr.x, y: a.n.spr.y - 3 } : this.spots[a.k];
      const dx = at.x - P.x, dy = at.y - (P.y - 3);
      if (Math.hypot(dx, dy) > 30) return;
      P.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      P.setTexture(`h-${this.lead}-${P.facing}-0`);
      this.act(a);
    }

    /* ---------- talking and walking ---------- */
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
        if (d < 22 && d < bd) { bd = d; best = { kind: "spot", k }; }
      }
      return best;
    }

    act(aim) {
      if (this.ui.busy()) { this.ui.advance(); return; }
      if (this.leaving) return;
      const t = aim || this.target();
      if (!t) return;
      if (t.kind === "npc") {
        const n = t.n;
        n.dir = { up: "down", down: "up", left: "right", right: "left" }[this.player.facing];
        this.faceNpc(n);
        if (n.gives) return this.giveFrom(n);
        // someone standing at a place to deliver to (Guan Yu at his ridge) takes the delivery
        const at = Object.values(this.spots).find(s => s.needs && Math.hypot(s.x - n.spr.x, s.y - n.spr.y) < 64);
        if (at) return this.deliverAt(at);
        if (n.challenge) return this.done(n.challenge) ? this.talk(worldLines(n.done)) : this.talk(worldLines(n.intro), () => this.puzzle(n.challenge, { id: n.challenge.split("-c-")[1], who: n.who, face: this.faceOf(n) }));
        this.talk(n.say.length ? worldLines(n.say) : [["n", "…"]]);
        return;
      }
      const spot = this.spots[t.k];
      if (spot.use === "ogs") return TKTable.sit(this, t.k);   // the travellers' go table (tk-table.js)
      if (spot.needs) return this.deliverAt(spot);
      if (spot.use === "shrine") return this.shrineTalk();
      const q = this.region.quests.find(x => x.node === spot.node);
      if (q && q.shrine && !this.available(q)) return this.shrineTalk();
      if (q && this.available(q)) this.approach(q, spot);   // the same face-and-beat start as walking in
      else if (q && this.done(q.node)) this.talk([["n", `${spot.label || q.title}. (${q.title}: done.)`,
        q.title_zh ? `${spot.labelZh || q.title_zh}。（${q.title_zh}：已完成）` : ""]]);
      else {   // not yet: say where the story is now, so a locked place points the way
        const lines = [["n", `${spot.label || "Nothing here"}. Nothing to do here yet.`, `${spot.labelZh || "这里"}。这里还没有要做的事。`]];
        if (this.goalText) lines.push(["n", `For now: ${this.goalText[0]}`, this.goalText[1] ? `眼下：${this.goalText[1]}` : ""]);
        this.talk(lines);
      }
    }

    // Someone with something to give: a plain line until the story's condition holds, then the
    // gift (once), then an "already given" line.
    giveFrom(n) {
      const lines = L => worldLines(L && L.length ? L : n.say.length ? n.say : [["n", "…"]]);
      if (!this.cond(n.givesWhen)) return this.talk(lines(n.say));
      if (WorldItems.has(this.w, n.gives)) return this.talk(lines(n.given));
      this.talk(lines(n.give), () => { WorldItems.gain(this, n.gives); this.refreshStory(); this.setGoal(); });
    }
    // A place to deliver to: empty until its condition, waiting until everything it needs is held,
    // then the handover (marks it done), then its after-line.
    deliverAt(s) {
      const lines = (L, fb) => worldLines(L && L.length ? L : fb);
      if (!this.cond(s.when)) return this.talk(lines(s.empty, [["n", `${s.label || "Here"}. There's no one here.`, `${s.labelZh || "这里"}。这里没有人。`]]));
      if (WorldMarks.has(this.w, s.delivers)) return this.talk(lines(s.delivered, s.deliver));
      if (!this.cond(s.needs)) return this.talk(lines(s.waiting, [["n", "Not yet.", "还不到时候。"]]));
      this.talk(lines(s.deliver, [["n", "Delivered.", "已送到。"]]), () => { WorldMarks.add(this.w, s.delivers); this.refreshStory(); this.setGoal(); });
    }
    // Touching a shrine: dark, "the board is quiet"; settled, the Star Lords' hint again and where to go now.
    shrineTalk() {
      const q = this.shrineQuest();
      if (!q || this.shrineState() === "dark") return this.talk([["n", "An empty offering table, a board cut into the stone. No one is playing.", "供桌上空无一物，石上刻着一副棋盘，无人对弈。"]]);
      const lines = [];
      if (q.hint) lines.push(["n", q.hint, q.hint_zh || ""]);
      if (this.goalText) lines.push(["n", this.goalText[0], this.goalText[1]]);
      this.talk(lines.length ? lines : [["n", "An empty offering table, a board cut into the stone. No one is playing.", "供桌上空无一物，石上刻着一副棋盘，无人对弈。"]]);
    }

    // style: "story" for the plot (quest lead-ins and scenes), "chat" for everything else
    talk(steps, done, style = "chat") { this.walk = null; this.player.setVelocity(0); this.ui.dialog(steps, done, style); }

    faceNpc(n) {
      if (n.who) n.spr.setTexture(`h-${n.who}-${n.dir}-0`);
      else { n.spr.anims.stop(); n.spr.setFrame(n.folk.still(n.dir)); }
    }

    go(to) {
      if (this.leaving) return;
      this.leaving = true;
      this.st.pos = null; this.save();
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.restart({ place: to, from: this.placeId }));
    }

    // Road challengers: one who sees you (in range, and in his cone if he faces one way) or catches you
    // near what he guards calls out, walks over and sets his problem. Lose and you're walked back a
    // step, and he waits till you've gone and come again; beat him and he stands aside.
    watchChallengers() {
      if (this.engaged || this.ui.busy() || this.leaving || this.seated || this.cine) return;
      const P = this.player, T = this.tw || 16;
      for (const n of this.npcs) {
        if (!n.challenge || !n.spr.visible || !(n.view || n.guard) || TK.cleared(n.challenge)) continue;
        const d = Math.hypot(n.spr.x - P.x, n.spr.y - P.y), dg = n.guard ? Math.hypot(n.guard.x - P.x, n.guard.y - P.y) : Infinity;
        if (n.cool) { if (d > (n.view || 2) * T + 2 * T && dg > 4 * T) n.cool = false; continue; }
        const seen = n.view && d <= n.view * T + T / 2 && (!n.cone || this.inCone(n, P)) || dg < 2.5 * T;
        if (seen) { this.engage(n); return; }
      }
    }
    inCone(n, P) {
      const [fx, fy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.face0] || [0, 1];
      const dx = P.x - n.spr.x, dy = P.y - n.spr.y, d = Math.hypot(dx, dy) || 1;
      return (dx * fx + dy * fy) / d > Math.cos(Math.PI * 55 / 180);
    }
    async engage(n) {
      this.engaged = n;
      const P = this.player, T = this.tw || 16, wait = ms => new Promise(r => this.time.delayedCall(ms, r));
      this.walk = null; this.auto = null; P.setVelocity(0); P.anims.stop();
      const wander = n.wander; n.wander = false; n.spr.setVelocity(0);
      if (n.mark) this.tweens.add({ targets: n.mark, scale: { from: 2, to: 1 }, duration: 320, ease: "Back.easeOut" });
      await wait(420);
      // he walks up to stand a step from you
      const dx = P.x - n.spr.x, dy = P.y - n.spr.y, d = Math.hypot(dx, dy) || 1, go = Math.max(0, d - T * 1.2);
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      if (go > 2) {
        n.spr.anims.play(n.who ? `h-${n.who}-${n.dir}` : `fk-${n.sprite}-${n.dir}`, true);
        await new Promise(r => this.tweens.add({ targets: n.spr, x: n.spr.x + dx / d * go, y: n.spr.y + dy / d * go, duration: go / 60 * 1000,
          onUpdate: () => n.spr.setDepth(n.spr.y), onComplete: r }));
      }
      this.faceNpc(n);
      P.facing = { up: "down", down: "up", left: "right", right: "left" }[n.dir]; P.setTexture(`h-${this.lead}-${P.facing}-0`);
      await new Promise(r => this.talk(worldLines(n.intro), r));
      const won = await this.duel(n.challenge, { id: n.challenge.split("-c-")[1], who: n.who, face: this.faceOf(n) });
      if (won) {
        this.returned({ key: n.challenge, win: true });
        // a blocker stands aside: off your way, and no longer in it
        n.spr.body.enable = false;
        const side = Math.abs(dx) > Math.abs(dy) ? { x: 0, y: T } : { x: T, y: 0 };
        this.tweens.add({ targets: n.spr, x: n.spr.x + side.x, y: n.spr.y + side.y, duration: 400, onUpdate: () => n.spr.setDepth(n.spr.y) });
      } else {
        // walked back a step; he goes back to his post and waits till you come again
        P.setPosition(P.x - dx / d * T * 1.5, P.y - dy / d * T * 1.5);
        n.cool = true;
        this.tweens.add({ targets: n.spr, x: n.home.x, y: n.home.y, duration: Math.max(200, go / 60 * 1000), onUpdate: () => n.spr.setDepth(n.spr.y),
          onComplete: () => { n.dir = n.face0; this.faceNpc(n); } });
      }
      n.wander = wander;
      this.engaged = null;
    }

    // A procession (a map state's "procession"): its column walks the road from "from" to "to" at a walk;
    // the player is free inside it on a soft leash to the carriage; it halts at each stop whose beat is
    // still to play, and goes on once it has. On coming back it starts from the last stop passed.
    procession_() {
      const st = this.mapState(), pr = st && st.procession;
      if (!pr) { if (this.procession) { this.procession.members.forEach(m => m.spr.destroy()); this.procession = null; } return; }
      if (this.procession && this.procession.pr === pr) return;
      const T = this.tw || 16, at = c => ({ x: (c[0] + .5) * T, y: (c[1] + .9) * T });
      const a = at(pr.from || [0, 0]), b = at(pr.to || [0, 0]);
      const path = [a, ...(this.findPath(a.x, a.y, b.x, b.y) || [b])];
      const cum = [0];
      for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
      const pos = d => {
        d = Math.max(0, Math.min(cum[cum.length - 1], d));
        let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
        const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1), p0 = path[i - 1], p1 = path[i];
        return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t, dir: Math.abs(p1.x - p0.x) > Math.abs(p1.y - p0.y) ? (p1.x > p0.x ? "right" : "left") : (p1.y > p0.y ? "down" : "up") };
      };
      const near = (pt, d0) => { let best = 0, bd = 1e9; for (let d = 0; d <= cum[cum.length - 1]; d += 4) { const q = pos(d), e = Math.hypot(q.x - pt.x, q.y - pt.y); if (e < bd) { bd = e; best = d; } } return best; };
      const stops = (pr.stops || []).map(id => this.spots[id]).filter(Boolean).map(sp => ({ sp, d: near(sp) }));
      // the column, head first; the player keeps his own feet
      const members = [];
      let gap = 0, carriage = null;
      for (const c of pr.column || []) {
        const [what] = String(c).split(":");
        if (what === "player") { gap += 1.5 * T; continue; }
        const n = what === "outriders" || what === "rearguard" ? 2 : 1;
        for (let k = 0; k < n; k++) {
          let spr;
          if (what.startsWith("carriage") && this.textures.get("tk-props").has("carriage")) spr = this.add.image(0, 0, "tk-props", "carriage").setOrigin(.5, 1);
          else { this.hero("f_soldier"); spr = this.add.sprite(0, 0, "h-f_soldier-down-0").setOrigin(.5, 1); spr.walker = "f_soldier"; }
          const m = { spr, back: gap + (k ? T * .2 : 0), side: n > 1 ? (k ? 7 : -7) : 0 };
          members.push(m);
          if (what === "carriage" && !carriage) carriage = m;
          gap += (what.startsWith("carriage") ? 2.2 : n > 1 && k === 0 ? 0 : 1.4) * T;
        }
      }
      // starts from the last stop already played
      const passed = stops.filter(x => x.sp.node && this.done(x.sp.node)), cb = carriage ? carriage.back : 0;
      const d0 = passed.length ? passed[passed.length - 1].d + T : 0;
      this.procession = { id: st.id, pr, pos, len: cum[cum.length - 1], head: d0 + cb, stops, members, total: gap, cb,
        get carriage() { return carriage && carriage.spr; }, pulled: 0 };
    }
    processionStep(dt) {
      const R = this.procession;
      if (!R) return;
      const T = this.tw || 16, P = this.player;
      const stop = R.stops.find(x => x.sp.node && !this.done(x.sp.node) && R.head - R.cb >= x.d - T);   // the carriage has reached it
      const moving = !stop && !this.ui.busy() && !this.cine && R.head < R.len + R.total;
      if (moving) R.head += 26 * dt / 1000;
      for (const m of R.members) {
        const q = R.pos(R.head - m.back);
        const dx = q.dir === "up" || q.dir === "down" ? m.side : 0, dy = q.dir === "left" || q.dir === "right" ? m.side * .5 : 0;
        m.spr.setPosition(q.x + dx, q.y + dy).setDepth(q.y + dy);
        if (m.spr.walker) { if (moving) m.spr.anims.play(`h-${m.spr.walker}-${q.dir}`, true); else { m.spr.anims.stop(); m.spr.setTexture(`h-${m.spr.walker}-${q.dir}-0`); } }
        else m.spr.setFlipX(q.dir === "left");
      }
      // the soft leash: wander too far from the carriage and you're brought back beside it
      const c = R.carriage, L = (R.pr.leash || 6) * T;
      R.pulled = Math.max(0, R.pulled - dt);
      if (c && !this.ui.busy() && !this.cine && Math.hypot(P.x - c.x, P.y - c.y) > L && !R.pulled) {
        R.pulled = 4000;
        const d = Math.hypot(P.x - c.x, P.y - c.y), k = (L - T) / d;
        P.setPosition(c.x + (P.x - c.x) * k, c.y + (P.y - c.y) * k);
        this.walk = null;
        const line = R.pr.leash_line;
        this.talk(line ? [line] : [["n", "Keep with the procession.", "跟紧车队。"]]);
      }
    }

    // ---------- stealth: watchers with sight cones ----------
    sightGrid() {
      if (this.sgrid) return this.sgrid;
      const C = 8, b = this.physics.world.bounds, cols = Math.ceil(b.width / C), rows = Math.ceil(b.height / C), block = new Uint8Array(cols * rows);
      for (const z of this.sightZones || []) {
        const bd = z.body || z.getBounds(), x0 = Math.floor(bd.x / C), x1 = Math.floor((bd.right || bd.x + bd.width) / C), y0 = Math.floor(bd.y / C), y1 = Math.floor((bd.bottom || bd.y + bd.height) / C);
        for (let y = Math.max(0, y0); y <= Math.min(rows - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(cols - 1, x1); x++) block[y * cols + x] = 1;
      }
      return (this.sgrid = { C, cols, rows, block });
    }
    // how far a watcher sees along a ray before something solid stops it
    ray(x, y, ang, len) {
      const G = this.sightGrid(), dx = Math.cos(ang), dy = Math.sin(ang);
      for (let d = 6; d < len; d += 4) {
        const cx = Math.floor((x + dx * d) / G.C), cy = Math.floor((y + dy * d) / G.C);
        if (cx < 0 || cy < 0 || cx >= G.cols || cy >= G.rows || G.block[cy * G.cols + cx]) return d;
      }
      return len;
    }
    watching(n) {
      const w = n.watch;
      if (!w || !n.spr.visible) return false;
      return !w.in_beats || w.in_beats.some(k => { const q = this.region.quests.find(x => x.node === k); return q && this.available(q); });
    }
    sees(n, P) {
      const w = n.watch, T = this.tw || 16, R = (w.cone || 4) * T, ex = n.spr.x, ey = n.spr.y - 6;
      const dx = P.x - ex, dy = P.y - 6 - ey, d = Math.hypot(dx, dy);
      if (d > R) return false;
      const [fx, fy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[w.dir] || [0, 1];
      if ((dx * fx + dy * fy) / (d || 1) < Math.cos(Math.PI * 55 / 180)) return false;
      return this.ray(ex, ey, Math.atan2(dy, dx), d) >= d - 2;
    }
    watchStep(dt) {
      const P = this.player, T = this.tw || 16, calm = this.ui.busy() || this.cine || this.leaving || this.engaged;
      if (!this.coneG) this.coneG = this.add.graphics().setDepth(-990);
      this.coneG.clear();
      for (const n of this.npcs) {
        const w = n.watch;
        if (!w) continue;
        n.sees = false;
        if (!this.watching(n)) continue;
        // his beat: walk it, stopping where it says to; or turn between the ways he faces
        if (!calm && w.pts.length > 1) {   // one point is a post: he stands there, facing his way or turning
          if (w.wait > 0) w.wait -= dt;
          else {
            const tg = w.pts[w.leg], dx = tg.x - n.spr.x, dy = tg.y - n.spr.y, d = Math.hypot(dx, dy), v = 30 * dt / 1000;
            if (d <= v) {
              n.spr.setPosition(tg.x, tg.y);
              const c = (w.beat || [])[w.leg], pz = w.pause;
              if (pz && c && c[0] === pz[0] && c[1] === pz[1]) w.wait = (pz[2] || 2) * 1000;
              w.leg = (w.leg + 1) % w.pts.length;
            } else {
              n.spr.setPosition(n.spr.x + dx / d * v, n.spr.y + dy / d * v);
              w.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
            }
            n.dir = w.dir;
            n.spr.anims.play(n.who ? `h-${n.who}-${w.dir}` : `fk-${n.sprite}-${w.dir}`, true);
          }
          if (w.wait > 0) { n.dir = w.dir; this.faceNpc(n); }
          n.spr.setDepth(n.spr.y);
        } else if (!calm && w.turns.length) {
          w.t += dt;
          if (w.t > 2600) { w.t = 0; w.turn = (w.turn + 1) % w.turns.length; w.dir = n.dir = w.turns[w.turn]; this.faceNpc(n); }
        }
        // his cone, drawn on the ground and stopped by walls, trees and screens
        const ex = n.spr.x, ey = n.spr.y - 6, R = (w.cone || 4) * T, a0 = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[w.dir] || 0;
        n.sees = this.sees(n, P);
        const pts = [{ x: ex, y: ey }];
        for (let k = 0; k <= 14; k++) { const a = a0 - Math.PI * 55 / 180 + k * (Math.PI * 110 / 180) / 14, r = this.ray(ex, ey, a, R); pts.push({ x: ex + Math.cos(a) * r, y: ey + Math.sin(a) * r }); }
        this.coneG.fillStyle(n.sees ? 0xff5a4a : 0xffe08a, n.sees ? .3 : .18).fillPoints(pts, true);
        // he catches you if he has something to say or somewhere to send you; not the one a sight puzzle wants you seen by
        const wanted = Object.values(this.spots).some(s => s.sight && s.sight.seen_by === (w.id || n.id));
        if (n.sees && !calm && !this.caught && !wanted && ((w.seen && w.seen.length) || w.back_to)) this.caughtBy(n);
      }
    }
    // Seen: he says so, and you're walked back to where he sends you (no game over)
    async caughtBy(n) {
      this.caught = true;
      const w = n.watch, P = this.player;
      this.walk = null; this.auto = null; P.setVelocity(0); P.anims.stop();
      if (n.mark) n.mark.setVisible(true);
      await new Promise(r => this.talk(w.seen && w.seen.length ? w.seen : [["n", "You've been seen.", "被人发现了。"]], r));
      const id = w.back_to;
      const here = id && (this.spots[id] || this.refs[id] || (this.entries[id] && this.entries[id]));
      const away = !here && id && this.region.places.find(p => p.id === id || p.id.endsWith("--" + id));
      this.cameras.main.fadeOut(300);
      await new Promise(r => this.cameras.main.once("camerafadeoutcomplete", r));
      if (away && away.id !== this.placeId) { this.st.pos = null; this.save(); this.scene.restart({ place: away.id, from: null }); return; }
      const to = here || this.entries[""];
      P.setPosition(to.x, to.y + (this.spots[id] ? 18 : 0));
      this.trail = Array(this.trailLen || 60).fill({ x: P.x, y: P.y, f: P.facing });
      if (n.mark && !n.challenge) n.mark.setVisible(false);
      this.cameras.main.fadeIn(300);
      this.time.delayedCall(800, () => { this.caught = false; });
    }

    // Where a sound comes from: the procession's carriage, a spot, a landmark or a person by id; else the next beat.
    soundAt(id) {
      if (id === "carriage" && this.procession && this.procession.carriage) return this.procession.carriage;
      const sp = this.spots[id] || this.refs[id] || (this.npcs.find(n => n.id === id) || {}).spr;
      if (sp) return sp;
      const q = this.nextMain(), s2 = q && Object.values(this.spots).find(s => s.node === q.node);
      return s2 || null;
    }
    // The map state's fog (seeing only "visibility" tiles round you) and sound (louder as you near it).
    atmosphere() {
      const st = this.mapState(), P = this.player, T = this.tw || 16;
      const vis = st && st.visibility;
      if (vis && !this.fog) {
        if (!this.textures.exists("@fog")) {
          const S = 1024, c = document.createElement("canvas"); c.width = c.height = S;
          const g = c.getContext("2d");
          g.fillStyle = "rgba(205,211,216,0.97)"; g.fillRect(0, 0, S, S);
          g.globalCompositeOperation = "destination-out";
          const r = g.createRadialGradient(S / 2, S / 2, 36, S / 2, S / 2, 72);
          r.addColorStop(0, "rgba(0,0,0,1)"); r.addColorStop(1, "rgba(0,0,0,0)");
          g.fillStyle = r; g.fillRect(0, 0, S, S);
          this.textures.addCanvas("@fog", c);
        }
        this.fog = this.add.image(P.x, P.y, "@fog").setDepth(9e4 - 1);
      }
      if (this.fog) {
        if (!vis) { this.fog.destroy(); this.fog = null; }
        else this.fog.setScale(vis * T / 54).setPosition(P.x, P.y - 8);
      }
      const snd = st && st.sound && Object.entries(st.sound)[0];
      const on = snd && typeof TKMusic !== "undefined" && TKMusic.on && TKMusic.unlocked;
      WorldSound.set(on ? snd[0] : null);
      if (on) {
        const at = this.soundAt(snd[1]), d = at ? Math.hypot(at.x - P.x, at.y - P.y) : 1e9;
        WorldSound.level(Math.max(.04, 1 - d / (20 * T)) * (this.ui.busy() ? .4 : 1));
        WorldSound.tick();
      }
    }

    update(time, dt) {
      if (this.carried && this.carried.active) this.carried.setPosition(this.player.x, this.player.y - 8);
      this.watchStep(dt);
      this.procession_();
      this.processionStep(dt);
      this.atmosphere();
      this.watchChallengers();
      this.keepPlayerInView();
      this.callOut();
      WorldFX.shadows(this);
      WorldFX.water(this, time);
      this.goalGuide(time);
      this.placeLabels();
      this.nearSpots();
      const P = this.player, K = this.keys;
      if (P.width !== P._fw || P.height !== P._fh) this.footBody(P);   // on or off a horse, another kit's sprite
      let vx = 0, vy = 0;
      if (!this.ui.busy() && !this.leaving && !this.seated) {
        if (K.LEFT.isDown || K.A.isDown || this.auto === "left") vx -= 1;
        if (K.RIGHT.isDown || K.D.isDown || this.auto === "right") vx += 1;
        if (K.UP.isDown || K.W.isDown || this.auto === "up") vy -= 1;
        if (K.DOWN.isDown || K.S.isDown || this.auto === "down") vy += 1;
      }
      if (vx || vy) this.walk = null;   // keys take over from a tap
      else if (this.walk && !this.ui.busy() && !this.leaving) [vx, vy] = this.followWalk(dt);
      const speed = 110, len = Math.hypot(vx, vy) || 1;  // always at a run
      P.setVelocity(vx / len * speed, vy / len * speed);
      if (vx || vy) {
        P.facing = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? "left" : "right") : (vy < 0 ? "up" : "down");
        P.anims.play(`h-${this.lead}-${P.facing}`, true);
        P.anims.msPerFrame = 85;
      } else { P.anims.stop(); P.setTexture(`h-${this.lead}-${P.facing}-0`); }
      P.setDepth(P.y);

      // exits: walk off the edge to the next place, if the story has opened it
      this.blocked = Math.max(0, this.blocked - dt);
      for (const e of this.exits) {
        if (!Phaser.Geom.Rectangle.Contains(e.rect, P.x, P.y - 3)) continue;
        // a door only some may pass: the protagonist named, or a condition ("item:edict") that holds
        const ms = this.mapState(), shut = ms && (ms.exits_closed || []).includes(e.to), opened = ms && (ms.exits_open || []).includes(e.to);
        const barred = shut || e.openTo && !e.openTo.some(w => w.includes(":") ? this.cond(w) : w === this.lead);
        if (barred) {
          if (!this.blocked) {
            this.blocked = 1500;
            const back = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] }[e.side];
            P.setPosition(P.x + back[0] * 10, P.y + back[1] * 10);
            const said = shut && ms.exits_closed_say && ms.exits_closed_say[e.to];
            this.talk(said ? said : e.refuse.length ? worldLines(e.refuse) : [["n", "The door is barred to you.", "此门不为你开。"]]);
          }
        } else if (opened || this.placeOpen(e.to)) this.go(e.to);
        else if (!this.blocked) {
          this.blocked = 1500;
          const back = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] }[e.side];
          P.setPosition(P.x + back[0] * 10, P.y + back[1] * 10);
          this.talk([["n", `The way to ${this.placeName(e.to)} isn't open yet.`, `通往${this.placeZh(e.to)}的路还没有开通。`]]);
        }
      }

      if (vx || vy) { this.trail.unshift({ x: P.x, y: P.y, f: P.facing }); this.trail.length = this.trailLen || 60; }
      this.followers.forEach((F, i) => {
        // the party in single file; a crowd behind them closer together, two abreast
        const nParty = this.followers.filter(f => !f.crowd).length, k = i - nParty;
        let p = this.trail[Math.min(this.trail.length - 1, F.crowd ? (nParty + 1) * 14 + (k >> 1) * 9 : (i + 1) * 14)] || { x: P.x, y: P.y, f: P.facing };
        if (F.crowd) p = { ...p, x: p.x + (p.f === "up" || p.f === "down" ? (k % 2 ? 6 : -6) : 0), y: p.y + (p.f === "left" || p.f === "right" ? (k % 2 ? 4 : -4) : 0) };
        // no trail yet (just arrived, or a scene put him here): beside him, not on top of him
        if (Math.hypot(p.x - P.x, p.y - P.y) < 6) p = { x: P.x + (i % 2 ? 11 : -11) * (1 + (i >> 1)), y: P.y - 2, f: p.f };
        const moving = Math.hypot(F.spr.x - p.x, F.spr.y - p.y) > .5;
        F.spr.setPosition(p.x, p.y).setDepth(p.y - .5);   // Liu Bei in front where they meet
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
          n.moving = Math.random() < .5 || away;
        }
        // keep out of doorways and roads out (a villager standing there blocks the way in), and step
        // aside for Liu Bei when he's walking somewhere and comes close
        const door = this.exits.find(e => n.spr.x > e.rect.x - 28 && n.spr.x < e.rect.right + 28 && n.spr.y > e.rect.y - 24 && n.spr.y < e.rect.bottom + 30);
        const P = this.player, close = this.walk && Math.hypot(n.spr.x - P.x, n.spr.y - P.y) < 28;
        const from = door ? { x: door.rect.centerX, y: door.rect.centerY } : close ? P : null;
        if (from) {
          const dx = n.spr.x - from.x, dy = n.spr.y - from.y;
          // from Liu Bei, step to the side of his way rather than ahead of him
          n.dir = (close && !door ? Math.abs(dx) < Math.abs(dy) : Math.abs(dx) > Math.abs(dy)) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
          n.moving = true; n.t = Math.max(n.t, 600);
        }
        const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.dir];
        if (n.moving) { n.spr.setVelocity(v[0] * 28, v[1] * 28); n.spr.anims.play(n.who ? `h-${n.who}-${n.dir}` : `fk-${n.sprite}-${n.dir}`, true); }
        else { n.spr.setVelocity(0); this.faceNpc(n); }
        n.spr.setDepth(n.spr.y);
      }

      if (this.ui.busy()) { this.talkOver = time; this.talkAt = { x: this.player.x, y: this.player.y }; }
      const t = !this.ui.busy() && !this.leaving && !this.seated && !this.cine && this.target();
      const at = t ? (t.kind === "npc" ? t.n.spr : this.spots[t.k]) : null;
      if (this.focusMark) this.focusMark.setVisible(!!at).setPosition(at ? at.x : 0, at ? at.y + 1 : 0);
      const quiet = this.ui.busy() || this.cine;
      for (const s of Object.values(this.spots)) if (s.glow) s.glow.setVisible(!quiet && !!(s.node && this.openQuest(s)));
    }
  }
  return [WorldBoot, WorldScene];
}

/* ---------- story people from a kit's generated sheet ---------- */
const WorldHeroes = {
  DIRS: ["down", "up", "left", "right"],
  // the same textures and walk animations TownArt.hero makes, cut from the kit's sheet
  fromSheet(scene, who, h) {
    const [fw, fh] = h.frame, src = scene.textures.get(`hx-${who}`).getSourceImage();
    this.DIRS.forEach((dir, r) => {
      for (let k = 0; k < 4; k++) {
        const cv = document.createElement("canvas");
        cv.width = fw; cv.height = fh;
        cv.getContext("2d").drawImage(src, k * fw, r * fh, fw, fh, 0, 0, fw, fh);
        scene.textures.addCanvas(`h-${who}-${dir}-${k}`, cv);
      }
      if (!scene.anims.exists(`h-${who}-${dir}`))
        scene.anims.create({ key: `h-${who}-${dir}`, frames: [0, 1, 2, 3].map(k => ({ key: `h-${who}-${dir}-${k}` })), frameRate: 8, repeat: -1 });
    });
  },
};

/* ---------- mounting a world in the campaign page ---------- */
const WorldView = {
  game: null,
  kit() {
    let k = new URLSearchParams(location.search).get("kit");
    try {
      // once: everyone starts on the main look (Jade); switching afterwards is kept
      if (localStorage.getItem("tk-kit-main") !== WORLD_KIT) { localStorage.setItem("tk-kit", WORLD_KIT); localStorage.setItem("tk-kit-main", WORLD_KIT); }
      k = k || localStorage.getItem("tk-kit");
    } catch {}
    return k in WORLD_KITS ? k : WORLD_KIT;
  },
  setKit(k) { try { localStorage.setItem("tk-kit", k); } catch {} },
  // opts: { w, host, ret, onPuzzle(key), onBoss() }
  async mount(opts) {
    this.destroy();
    await TownLoad.ready();
    const host = opts.host;
    host.classList.add("tk-town");
    host.tabIndex = 0;
    host.addEventListener("mousedown", () => host.focus());
    const [gw, gh] = this.size(host);
    this.game = new Phaser.Game({
      loader: { crossOrigin: "anonymous" },   // in the Android app the files come from the live site
      type: Phaser.AUTO, parent: host, width: gw, height: gh, pixelArt: true, roundPixels: true, backgroundColor: "#1b2418",
      // Move by real elapsed time, so walking keeps its speed when the browser drops
      // frames (laptops on battery often do): no fixed 60 Hz physics step to fall
      // behind, and no delta smoothing to under-move after a slow patch.
      physics: { default: "arcade", arcade: { debug: false, fixedStep: false } },
      fps: { smoothStep: false },
      input: { keyboard: { target: host } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: worldScenes(),
      callbacks: { preBoot: g => { g.worldOpts = { ...opts, kit: this.kit() }; } },
    });
    // keep the view's shape matched to its box as that changes
    let t = 0;
    this.watch = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => this.fit(host), 120); });
    this.watch.observe(host);
    host.focus();
    if (window.Wukong && Wukong.suspend) Wukong.suspend(true);  // he stays out of the way while exploring
  },
  // The game's size in world pixels for a box: the same pixel scale always, the shape of
  // the box. A tall box (a phone held upright) is 240 wide; a wide one is 180 high.
  size(host) {
    const ar = host.clientWidth / Math.max(1, host.clientHeight);
    if (!isFinite(ar) || !ar) return [320, 180];
    return ar < 1.4 ? [240, Math.min(440, Math.round(240 / ar))] : [Math.min(480, Math.round(180 * ar)), 180];
  },
  fit(host) {
    const g = this.game;
    if (!g || !g.scale || !host.isConnected || !host.clientWidth) return;
    const [w, h] = this.size(host);
    if (w !== g.scale.width || h !== g.scale.height) g.scale.setGameSize(w, h);
    else g.scale.refresh();
  },
  destroy() {
    if (this.watch) { this.watch.disconnect(); this.watch = null; }
    if (typeof TKVoice !== "undefined") TKVoice.stop();
    if (this.game) { this.game.destroy(true); this.game = null; }
    window.__w = null;
  },
};
// Leaving the campaign page tears the game down (and frees the keyboard).
addEventListener("hashchange", () => {
  if (/^#\/tk\/?\d*$/.test(location.hash)) return;
  if (WorldView.game) WorldView.destroy();
  document.documentElement.classList.remove("tk-fullwin-on");   // full window ends with the game
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
});
