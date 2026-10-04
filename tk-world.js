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

const WORLD_CLUTTER = /^(plant\.|rock\.small)/;  // drawn underfoot
const WORLD_KIT = "jade";  // the default look; the campaign page's art button switches (localStorage tk-kit)
const WORLD_KITS = { jade: { zh: "玉", en: "Jade" }, ninja: { zh: "忍者", en: "Ninja Adventure" } };

/* ---------- where you are in a world: place, position, party, places seen ---------- */
const WorldState = {
  key: n => `tk-world-${n}`,
  load(n, region) {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(this.key(n)) || "{}"); } catch { s = {}; }
    return { visited: s.visited || [region.start], party: s.party || TK.party(TK.world(n)) || region.party, place: s.place, pos: s.pos || null };
  },
  save(n, st) { try { localStorage.setItem(this.key(n), JSON.stringify(st)); } catch { /* private mode */ } },
};

/* ---------- regions, and challengers as campaign levels ---------- */
const WorldData = {
  regions: {},
  async region(n) {
    if (!(n in this.regions)) {
      const r = await fetch(`data/tk_maps/w${n}/region.json?v=11`);
      this.regions[n] = r.ok ? await r.json() : null;
    }
    return this.regions[n];
  },
  has(n) { return n === 1; },  // worlds whose places have been built
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
// Wukong the guide on or off, remembered (the menu has the switch).
const WorldGuide = {
  // "stuck": he comes only when you haven't made headway for a while (the default);
  // "always"; or "off". Remembered.
  get mode() { let v; try { v = localStorage.getItem("tk-guide"); } catch {} return v === "off" || v === "always" ? v : "stuck"; },
  set mode(v) { try { localStorage.setItem("tk-guide", v); } catch {} },
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
  place(el, canvas, gameW, gx, gy, left, a, t) {
    const k = canvas.clientWidth / gameW, s = .5 * k, root = el.parentNode.getBoundingClientRect(), r = canvas.getBoundingClientRect();
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
      this.load.json("region", `data/tk_maps/w${w.n}/region.json?v=11`);
      this.load.json("kit", `assets/tk/kits/${kit}.json?v=9`);
      this.load.json("cutscenes", `data/tk_maps/w${w.n}/cutscenes.json?v=9`);
    }
    create() {
      const { w, kit: kitName } = this.opts, region = this.cache.json.get("region"), kit = this.cache.json.get("kit");
      for (const [s, path] of Object.entries(kit.sheets)) this.load.image(`kit-${s}`, path);
      const [fw, fh] = kit.folk.frame;
      for (const [s, path] of Object.entries(kit.folk.sheets)) this.load.spritesheet(`folk-${s}`, path, { frameWidth: fw, frameHeight: fh });
      for (const p of region.places) this.load.tilemapTiledJSON(`map-${p.id}`, `data/tk_maps/w${w.n}/${kitName}/${p.id}.tmj?v=15`);
      this.load.image("kit-_swatch", `data/tk_maps/w${w.n}/${kitName}/swatch.png`);
      if (typeof WorldItems !== "undefined") WorldItems.preload(this);   // horses (tk-items.js)
      this.load.on("loaderror", f => { if (f.key !== "kit-_swatch") console.warn("missing", f.src); });
      this.load.once("complete", () => {
        for (const [kind, list] of Object.entries(kit.kinds)) list.forEach(([s, x, y, wd, ht], i) => this.textures.get(`kit-${s}`).add(`${kind}#${i}`, 0, x, y, wd, ht));
        if (!this.textures.exists("@bang")) this.textures.addCanvas("@bang", TownArt.bang());
        const st = WorldState.load(w.n, region);
        this.scene.start("world", { place: st.place || region.start, from: null, resume: true });
      });
      this.load.start();
    }
  }

  class WorldScene extends Phaser.Scene {
    constructor() { super("world"); }
    init(d) { this.placeId = d.place; this.from = d.from; this.resume = d.resume; }

    create() {
      const region = this.region = this.cache.json.get("region"), kit = this.kit = this.cache.json.get("kit");
      const opts = this.opts = this.game.worldOpts, w = this.w = opts.w;
      this.story = w.scenes;
      this.st = WorldState.load(w.n, region);
      if (!this.st.visited.includes(this.placeId)) this.st.visited.push(this.placeId);
      this.st.place = this.placeId;
      this.place = region.places.find(p => p.id === this.placeId);

      // ground and terrain layers, then objects
      const map = this.make.tilemap({ key: `map-${this.placeId}` });
      const sets = map.tilesets.map(ts => map.addTilesetImage(ts.name, `kit-${ts.name}`));
      this.water = null;
      for (const l of map.layers) {
        const layer = map.createLayer(l.name, sets, 0, 0).setDepth(-1000);
        if (l.name === "water") { layer.setCollisionByExclusion([-1]); this.water = layer; }
      }
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.solids = this.physics.add.staticGroup();
      for (const who of new Set(["liubei", ...this.st.party])) this.hero(who);

      const P = o => Object.fromEntries((o.properties || []).map(p => [p.name, p.value]));
      const J = v => { try { return JSON.parse(v || "[]"); } catch { return []; } };
      this.spots = {}; this.npcs = []; this.exits = []; this.entries = {};
      for (const o of map.getObjectLayer("objects").objects) {
        const p = P(o);
        if (o.type === "prop") this.addProp(o, p);
        else if (o.type === "spot") this.spots[o.name] = { x: o.x, y: o.y, node: p.node, label: p.label, labelZh: p.label_zh || "", intro: J(p.intro), outro: J(p.outro), trigger: p.trigger || "near" };
        else if (o.type === "npc") this.addNpc(o, p, J);
        else if (o.type === "exit") this.exits.push({ to: p.to, side: p.side, rect: new Phaser.Geom.Rectangle(o.x, o.y, o.width, o.height) });
        else if (o.type === "entry") this.entries[p.from || ""] = { x: o.x, y: o.y };
      }

      // back from a problem (or a reload): stand where you were
      const pos = this.resume && this.st.pos && this.st.pos.place === this.placeId ? this.st.pos : null;
      const at = pos || this.entries[this.from || ""] || this.entries[""];
      this.player = this.physics.add.sprite(at.x, at.y, "h-liubei-down-0").setOrigin(.5, 1);
      this.player.body.setSize(10, 6).setOffset(4, 14);
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
      cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      cam.setRoundPixels(true);
      cam.fadeIn(350);

      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER");
      for (const k of ["ENTER", "E"]) this.keys[k].on("down", () => this.act());
      this.ui = TownUI.mount(this, opts.host);
      // Wukong shows the way to the next objective: beside its spot when it's on screen,
      // else at the edge of the screen, pointing toward it (WorldGuide.on toggles him)
      // He's drawn over the game at screen resolution, so his pixel art keeps its detail.
      this.guide = WorldGuide.mount(opts.host.querySelector(".town-ui"));
      this.setGoal();
      if (!pos) this.ui.place(this.place.name, this.place.zh);
      this.blocked = 0;
      this.leaving = false;
      if (typeof WorldItems !== "undefined") WorldItems.attach(this);   // mounts (tk-items.js)
      window.__w = this;  // for tests and the console
      if (this.resume && opts.ret) { const r = opts.ret; opts.ret = null; this.time.delayedCall(400, () => this.returned(r)); }
      // story scenes that start by themselves: on arriving here, or on walking into their area
      for (const s of Object.values(this.spots)) s.armed = Math.hypot(this.player.x - s.x, this.player.y - s.y) > WORLD_NEAR;   // not under your feet when you come back
      this.time.delayedCall(900, () => {
        const s = Object.values(this.spots).find(s => s.trigger === "arrive" && this.openQuest(s));
        if (s && !this.ui.busy() && !this.leaving && !this.cine) this.playQuest(this.openQuest(s), s);
      });
    }

    // The story quest a spot holds, if it can be played now.
    openQuest(s) { const q = this.region.quests.find(x => x.node === s.node); return q && this.available(q) ? q : null; }

    // Walking into a story spot's area starts its scene; it re-arms once you walk away.
    nearSpots() {
      if (this.ui.busy() || this.leaving || this.cine) return;
      const P = this.player;
      for (const s of Object.values(this.spots)) {
        if (s.trigger === "talk") continue;
        const d = Math.hypot(P.x - s.x, P.y - s.y);
        if (d > WORLD_NEAR + 16) s.armed = true;
        else if (d < WORLD_NEAR && s.armed) {
          s.armed = false;
          const q = this.openQuest(s);
          if (q) { P.setVelocity(0); return this.playQuest(q, s); }
        }
      }
    }

    /* ---------- building the place ---------- */
    hero(who) { if (!this.textures.exists(`h-${who}-down-0`)) TownArt.hero(this, who); }  // textures outlive the scene

    addProp(o, p) {
      if (o.name) {
        const sheet = this.kit.kinds[o.name.split("#")[0]][+o.name.split("#")[1]][0];
        const img = this.add.image(Math.round(o.x), Math.round(o.y), `kit-${sheet}`, o.name).setOrigin(.5, 1);
        img.setDepth(WORLD_CLUTTER.test(p.kind) ? o.y - 400 : o.y);
      }
      if (p.solid) this.solids.add(this.add.zone(o.x, o.y - p.fh / 2, p.fw - 2, p.fh - 2));
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
      const n = { id: o.name, spr, who, folk, sprite: p.sprite, say: own(J(p.say)), wander: p.wander, home: { x: o.x, y: o.y }, t: 0, dir: face, until: p.until };
      if (p.challenge) {
        n.challenge = `${this.w.n}-${this.placeId}-c-${p.challenge}`;
        n.intro = own(J(p.intro)); n.win = own(J(p.win)); n.done = own(J(p.done));
        n.mark = this.add.image(o.x, o.y - spr.height - 2, "@bang").setOrigin(.5, 1).setDepth(9999).setVisible(!TK.cleared(n.challenge));
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

    setParty(list) {
      for (const F of this.followers) F.spr.destroy();
      this.followers = list.filter(x => x !== "liubei").map(who => {
        this.hero(who);
        return { who, spr: this.add.sprite(this.player.x, this.player.y, `h-${who}-down-0`).setOrigin(.5, 1) };
      });
      this.trail = Array(60).fill({ x: this.player.x, y: this.player.y, f: this.player.facing });
    }

    /* ---------- quests: progress is the campaign save ---------- */
    save() { WorldState.save(this.w.n, this.st); }
    // A beat counts as done once anything after it is: saves from before a beat was
    // added (the mulberry tree, the indoor scenes) aren't sent back to it.
    done(key, seen = new Set()) {
      if (TK.cleared(key)) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return this.region.quests.some(q => q.after.includes(key) && this.done(q.node, seen));
    }
    isDone(key) { return this.done(key) || !this.region.quests.some(q => q.node === key); }
    available(q) { return !this.done(q.node) && (q.after.length === 0 || q.after.some(a => this.isDone(a))); }
    placeOpen(id) {
      const room = this.region.places.find(p => p.id === id);
      if (room && room.parent) return this.placeOpen(room.parent);   // a building is open when its place is
      return id === this.region.start || this.st.visited.includes(id) ||
        this.region.quests.some(q => q.place === id && (this.available(q) || this.done(q.node)));
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
      if (!q) return this.ui.goal("The world is complete. The road goes on…", "这一卷已经完成。路还在前方……");
      if (this.available(q)) return q.place === this.placeId ? this.ui.goal(q.objective, q.objective_zh)
        : this.ui.goal(`${q.objective} (${this.placeName(q.place)})`, q.objective_zh ? `${q.objective_zh}（${this.placeZh(q.place)}）` : "");
      const lead = this.leadsTo(q);
      const ways = [...new Set(lead.map(p => p.role === "short" ? `the shortcut at ${this.placeName(p.place)}` : this.placeName(p.place)))];
      const waysZh = [...new Set(lead.map(p => p.role === "short" ? `${this.placeZh(p.place)}的捷径` : this.placeZh(p.place)))];
      this.ui.goal(`On to ${this.placeName(q.place)}, by way of ${ways.join(" or ")}.`, `前往${this.placeZh(q.place)}，可经${waysZh.join("或")}。`);
    }

    // Where the next objective is from here: its story spot on this map, or
    // the exit that starts the shortest way to its place (rooms included).
    goalPoint() {
      const q = this.nextMain();
      if (!q) return null;
      const quests = this.available(q) ? [q] : this.leadsTo(q);
      const here = quests.find(x => x.place === this.placeId);
      this.goalHops = 0;
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
    goalGuide(time) {
      const el = this.guide, t = this.goalAt;
      if (!el) return;
      const P = this.player, dt = Math.min(50, this.game.loop.delta || 16) / 1000;
      const free = !!t && !this.ui.busy() && !this.leaving && !this.cine;
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
      const gx = Math.max(14, Math.min(W - 14, (f.x - v.x) * cam.zoom)), gy = Math.max(26, Math.min(H - 6, (f.y - v.y) * cam.zoom)) + Math.sin(time / 330) * 1.5;
      const sx = (t.x - v.x) * cam.zoom, sy = (t.y - v.y) * cam.zoom;
      const left = Math.abs(f.vx) > 12 ? f.vx < 0 : sx < gx;   // face where he's flying, else toward the goal
      const a = Math.atan2(-(sy - (gy - 12)), Math.abs(sx - gx)) * 180 / Math.PI;
      WorldGuide.place(el, this.game.canvas, W, gx, gy, left, a, time);
      el.say.hidden = !nudge;
    }

    // Walk up to a story spot. A scene with a ["problem"] step builds up to
    // the board and plays its payoff once the problem is solved; leave or slip
    // and the next try picks up at the last line before it. A scene without
    // one plays after the problem, as before.
    playQuest(q, spot) {
      const steps = (this.story[q.scene] || {}).steps || [], at = steps.findIndex(s => s[0] === "problem");
      const setter = q.boss ? q.boss.who : at >= 0 && steps[at][1];   // ["problem", who]: who sets it
      const foe = setter ? { who: setter, face: this.faceOf({ who: setter }) } : null;
      const intro = spot.intro.length ? worldLines(spot.intro)
        : q.boss ? [["say", q.boss.who, q.boss.taunt, q.boss.taunt_zh, q.boss.taunt_vid]] : [["n", `${q.title}.`, q.title_zh ? `${q.title_zh}。` : ""]];
      if (at < 0) return this.talk(intro, () => this.puzzle(q.node, foe), "story");
      const seen = `${this.w.n}:${q.scene}:lead`, again = TK.seen(seen);
      const say = lines => new Promise(r => lines.some(l => l[0] === "n" || l[0] === "say") ? this.talk(lines, r, "story") : r());
      // the problem's own framing, the board, and on a win the spot's farewell
      const solve = async () => {
        TK.markSeen(seen);
        if (spot.intro.length || q.boss) await say(intro);   // a bare title would only break the tension here
        const won = await this.duel(q.node, foe);
        if (won) { this.vanish(q.node); await say(worldLines(spot.outro)); }
        return won;
      };
      const finish = () => this.finishQuest(q, steps);
      const cs = this.cutscene(q);
      if (cs && cs.beats.some(b => b.do === "problem"))
        return WorldCutscene.play(this, cs, finish, { onProblem: solve, onLeave: () => {}, ffToProblem: again });
      const lines = steps.slice(0, at).filter(s => s[0] === "n" || s[0] === "say");
      say(again ? lines.slice(-1) : lines).then(solve).then(won => won && this.talk(steps.slice(at + 1), finish, "story"));
    }

    cutscene(q) {
      const cs = ((this.cache.json.get("cutscenes") || {}).scenes || {})[q.scene];
      return cs && cs.place === this.placeId && typeof WorldCutscene !== "undefined" ? cs : null;
    }

    // People who are only here until a beat is won (the Star Lords at the oath).
    vanish(node) { for (const n of this.npcs) if (n.until === node) { n.spr.setVisible(false); n.spr.body.enable = false; } }

    // What a won story beat leaves behind: who joined, what was given, the next goal.
    async finishQuest(q, steps) {
      for (const s of steps) if (s[0] === "party") { this.st.party = s[1]; TK.setParty(this.w, s[1]); this.setParty(s[1]); }
      if (typeof WorldItems !== "undefined") WorldItems.gainFrom(this, steps);   // what the scene gave
      if (q.scene) TK.markSeen(`${this.w.n}:${q.scene}`);
      this.save();
      this.setGoal();
      if (q.role === "boss" && this.opts.onBoss) await this.opts.onBoss();
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
      const win = await this.opts.onPuzzle(key, { host: this.opts.host, foe });
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
      const q = this.region.quests.find(x => x.node === ret.key);
      if (q) {
        const spot = Object.values(this.spots).find(s => s.node === q.node);
        const steps = [...worldLines(spot && spot.outro), ...((this.story[q.scene] || {}).steps || [])];
        this.vanish(q.node);
        const finish = () => this.finishQuest(q, steps);
        // a staged cutscene (tk-cutscene.js) when the scene generator made one for this place, else the lines alone
        const cs = this.cutscene(q);
        if (cs) return this.talk(worldLines(spot && spot.outro), () => WorldCutscene.play(this, cs, finish), "story");
        return this.talk(steps, finish, "story");
      }
      const n = this.npcs.find(m => m.challenge === ret.key);
      if (n) { n.mark.setVisible(false); this.talk(worldLines(n.win)); }
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

    act() {
      if (this.ui.busy()) { this.ui.advance(); return; }
      if (this.leaving) return;
      const t = this.target();
      if (!t) return;
      if (t.kind === "npc") {
        const n = t.n;
        n.dir = { up: "down", down: "up", left: "right", right: "left" }[this.player.facing];
        this.faceNpc(n);
        if (n.challenge) return this.done(n.challenge) ? this.talk(worldLines(n.done)) : this.talk(worldLines(n.intro), () => this.puzzle(n.challenge, { id: n.challenge.split("-c-")[1], who: n.who, face: this.faceOf(n) }));
        this.talk(n.say.length ? worldLines(n.say) : [["n", "…"]]);
        return;
      }
      const spot = this.spots[t.k], q = this.region.quests.find(x => x.node === spot.node);
      if (q && this.available(q)) this.playQuest(q, spot);
      else if (q && this.done(q.node)) this.talk([["n", `${spot.label || q.title}. (${q.title}: done.)`,
        q.title_zh ? `${spot.labelZh || q.title_zh}。（${q.title_zh}：已完成）` : ""]]);
      else this.talk([["n", `${spot.label || "Nothing here"}. It isn't time yet.`, `${spot.labelZh || "这里"}。时候还没到。`]]);
    }

    // style: "story" for the plot (quest lead-ins and scenes), "chat" for everything else
    talk(steps, done, style = "chat") { this.player.setVelocity(0); this.ui.dialog(steps, done, style); }

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

    update(time, dt) {
      this.goalGuide(time);
      this.nearSpots();
      const P = this.player, K = this.keys;
      let vx = 0, vy = 0;
      if (!this.ui.busy() && !this.leaving) {
        if (K.LEFT.isDown || K.A.isDown || this.auto === "left") vx -= 1;
        if (K.RIGHT.isDown || K.D.isDown || this.auto === "right") vx += 1;
        if (K.UP.isDown || K.W.isDown || this.auto === "up") vy -= 1;
        if (K.DOWN.isDown || K.S.isDown || this.auto === "down") vy += 1;
      }
      const speed = 110, len = Math.hypot(vx, vy) || 1;  // always at a run
      P.setVelocity(vx / len * speed, vy / len * speed);
      if (vx || vy) {
        P.facing = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? "left" : "right") : (vy < 0 ? "up" : "down");
        P.anims.play(`h-liubei-${P.facing}`, true);
        P.anims.msPerFrame = 85;
      } else { P.anims.stop(); P.setTexture(`h-liubei-${P.facing}-0`); }
      P.setDepth(P.y);

      // exits: walk off the edge to the next place, if the story has opened it
      this.blocked = Math.max(0, this.blocked - dt);
      for (const e of this.exits) {
        if (!Phaser.Geom.Rectangle.Contains(e.rect, P.x, P.y - 3)) continue;
        if (this.placeOpen(e.to)) this.go(e.to);
        else if (!this.blocked) {
          this.blocked = 1500;
          const back = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] }[e.side];
          P.setPosition(P.x + back[0] * 10, P.y + back[1] * 10);
          this.talk([["n", `The way to ${this.placeName(e.to)} isn't open yet.`, `通往${this.placeZh(e.to)}的路还没有开通。`]]);
        }
      }

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
          n.moving = Math.random() < .5 || away;
        }
        const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[n.dir];
        if (n.moving) { n.spr.setVelocity(v[0] * 28, v[1] * 28); n.spr.anims.play(n.who ? `h-${n.who}-${n.dir}` : `fk-${n.sprite}-${n.dir}`, true); }
        else { n.spr.setVelocity(0); this.faceNpc(n); }
        n.spr.setDepth(n.spr.y);
      }

      const t = !this.ui.busy() && !this.leaving && this.target();
      this.ui.hint(t ? (t.kind === "npc" ? t.n.spr : this.spots[t.k]) : null);
    }
  }
  return [WorldBoot, WorldScene];
}

/* ---------- mounting a world in the campaign page ---------- */
const WorldView = {
  game: null,
  kit() {
    let k = new URLSearchParams(location.search).get("kit");
    try { k = k || localStorage.getItem("tk-kit"); } catch {}
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
    this.game = new Phaser.Game({
      type: Phaser.AUTO, parent: host, width: 320, height: 180, pixelArt: true, roundPixels: true, backgroundColor: "#1b2418",
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
    host.focus();
    if (window.Wukong && Wukong.suspend) Wukong.suspend(true);  // he stays out of the way while exploring
  },
  destroy() {
    if (typeof TKVoice !== "undefined") TKVoice.stop();
    if (this.game) { this.game.destroy(true); this.game = null; }
    window.__w = null;
  },
};
// Leaving the campaign page tears the game down (and frees the keyboard).
addEventListener("hashchange", () => { if (WorldView.game && !/^#\/tk\/?\d*$/.test(location.hash)) WorldView.destroy(); });
