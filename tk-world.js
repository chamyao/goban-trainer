/* ---- Three Kingdoms: the explorable world, built by the map factory ----
   Plays a whole world from data/tk_maps/w<N>/: region.json (places, links,
   quests in story order) and one compiled Tiled map per place for the chosen
   art kit (assets/tk/kits/<kit>.json). Nothing here is specific to a place or
   a pack: walk to a story spot to play its quest, walk off an exit to go to
   the next place. See docs/map-format.md. Reuses TownArt (hero sprites) and
   TownUI (goal, dialogue, puzzle stand-in) from tk-town.js. */

const WORLD_CLUTTER = /^(plant\.|rock\.small)/;  // drawn underfoot

class WorldBoot extends Phaser.Scene {
  constructor() { super("world-boot"); }
  preload() {
    this.opts = this.game.worldOpts;
    const { world, kit } = this.opts;
    this.load.json("region", `data/tk_maps/w${world}/region.json`);
    this.load.json("kit", `assets/tk/kits/${kit}.json`);
    this.load.json("tk", "data/tk.json");
  }
  create() {
    const { world, kit: kitName } = this.opts, region = this.cache.json.get("region"), kit = this.cache.json.get("kit");
    for (const [s, path] of Object.entries(kit.sheets)) this.load.image(`kit-${s}`, path);
    const [fw, fh] = kit.folk.frame;
    for (const [s, path] of Object.entries(kit.folk.sheets)) this.load.spritesheet(`folk-${s}`, path, { frameWidth: fw, frameHeight: fh });
    for (const p of region.places) this.load.tilemapTiledJSON(`map-${p.id}`, `data/tk_maps/w${world}/${kitName}/${p.id}.tmj`);
    this.load.image("kit-_swatch", `data/tk_maps/w${world}/${kitName}/swatch.png`);
    this.load.on("loaderror", f => { if (f.key !== "kit-_swatch") console.warn("missing", f.src); });
    this.load.once("complete", () => {
      for (const [kind, list] of Object.entries(kit.kinds)) list.forEach(([s, x, y, w, h], i) => this.textures.get(`kit-${s}`).add(`${kind}#${i}`, 0, x, y, w, h));
      this.scene.start("world", { place: WorldState.load(world, region).place || region.start, from: null });
    });
    this.load.start();
  }
}

/* ---------- quest state: which story nodes are done, kept per world ---------- */
const WorldState = {
  key: n => `tk-world-${n}`,
  load(n, region) {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(this.key(n)) || "{}"); } catch (e) { s = {}; }
    return { done: s.done || [], visited: s.visited || [region.start], party: s.party || region.party, place: s.place };
  },
  save(n, st) { try { localStorage.setItem(this.key(n), JSON.stringify(st)); } catch (e) { /* private mode */ } },
};

class WorldScene extends Phaser.Scene {
  constructor() { super("world"); }
  init(d) { this.placeId = d.place; this.from = d.from; }

  create() {
    const region = this.region = this.cache.json.get("region"), kit = this.kit = this.cache.json.get("kit");
    const opts = this.game.worldOpts;
    this.story = this.cache.json.get("tk").worlds.find(w => w.n === region.world).scenes;
    this.st = WorldState.load(region.world, region);
    if (!this.st.visited.includes(this.placeId)) this.st.visited.push(this.placeId);
    this.st.place = this.placeId;
    this.save();
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
    this.spots = {}; this.npcs = []; this.exits = []; this.entries = {};
    for (const o of map.getObjectLayer("objects").objects) {
      const p = P(o);
      if (o.type === "prop") this.addProp(o, p);
      else if (o.type === "spot") this.spots[o.name] = { x: o.x, y: o.y, node: p.node, label: p.label };
      else if (o.type === "npc") this.addNpc(o, p);
      else if (o.type === "exit") this.exits.push({ to: p.to, side: p.side, rect: new Phaser.Geom.Rectangle(o.x, o.y, o.width, o.height) });
      else if (o.type === "entry") this.entries[p.from || ""] = { x: o.x, y: o.y };
    }

    const at = this.entries[this.from || ""] || this.entries[""];
    this.player = this.physics.add.sprite(at.x, at.y, "h-liubei-down-0").setOrigin(.5, 1);
    this.player.body.setSize(10, 6).setOffset(4, 14);
    this.player.setCollideWorldBounds(true);
    this.player.facing = "down";
    this.physics.add.collider(this.player, this.solids);
    if (this.water) this.physics.add.collider(this.player, this.water);
    this.physics.add.collider(this.player, this.npcs.map(n => n.spr));
    this.followers = [];
    this.trail = [];
    this.setParty(this.st.party);

    const cam = this.cameras.main;
    cam.startFollow(this.player, true, .15, .15);
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cam.setRoundPixels(true);
    cam.fadeIn(350);

    this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,SPACE,E,ENTER,Z");
    for (const k of ["SPACE", "E", "ENTER", "Z"]) this.keys[k].on("down", () => this.act());
    this.ui = TownUI.mount(this);
    this.setGoal();
    WorldUI.place(this.place.name);
    this.blocked = 0;
    this.leaving = false;
    window.__w = this;  // for tests and the console
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

  addNpc(o, p) {
    let spr, folk = null, who = null;
    if (p.kind.startsWith("hero.")) {
      who = p.sprite;
      this.hero(who);
      spr = this.physics.add.sprite(o.x, o.y, `h-${who}-down-0`);
    } else {
      folk = this.folkAnims(p.sprite);
      spr = this.physics.add.sprite(o.x, o.y, folk.sheet, folk.still("down"));
    }
    spr.setOrigin(.5, 1).setDepth(o.y).setImmovable(true);
    spr.body.setSize(10, 6).setOffset((spr.width - 10) / 2, spr.height - 6);
    const n = { id: o.name, spr, who, folk, sprite: p.sprite, say: JSON.parse(p.say || "[]"), wander: p.wander, home: { x: o.x, y: o.y }, t: 0, dir: "down" };
    this.physics.add.collider(spr, this.solids);
    if (this.water) this.physics.add.collider(spr, this.water);
    this.npcs.push(n);
  }

  setParty(list) {
    for (const F of this.followers) F.spr.destroy();
    this.followers = list.filter(w => w !== "liubei").map(who => {
      this.hero(who);
      return { who, spr: this.add.sprite(this.player.x, this.player.y, `h-${who}-down-0`).setOrigin(.5, 1) };
    });
    this.trail = Array(60).fill({ x: this.player.x, y: this.player.y, f: this.player.facing });
  }

  /* ---------- quests ---------- */
  save() { WorldState.save(this.region.world, this.st); }
  isDone(key) { return this.st.done.includes(key) || !this.region.quests.some(q => q.node === key); }
  available(q) { return !this.st.done.includes(q.node) && (q.after.length === 0 || q.after.some(a => this.isDone(a))); }
  placeOpen(id) {
    return id === this.region.start || this.st.visited.includes(id) ||
      this.region.quests.some(q => q.place === id && (this.available(q) || this.st.done.includes(q.node)));
  }
  // the next main story point, and if it isn't open yet, the open quests on the roads that lead to it
  nextMain() { return this.region.quests.find(q => (q.role === "main" || q.role === "boss") && !this.st.done.includes(q.node)); }
  leadsTo(q) {
    const Q = this.region.quests, seen = new Set(), out = [], stack = [...q.after];
    while (stack.length) {
      const k = stack.pop();
      if (seen.has(k)) continue;
      seen.add(k);
      const p = Q.find(x => x.node === k);
      if (!p) continue;
      if (this.available(p)) out.push(p); else if (!this.st.done.includes(k)) stack.push(...p.after);
    }
    return out;
  }
  placeName(id) { return this.region.places.find(p => p.id === id).name; }

  setGoal() {
    const q = this.nextMain();
    if (!q) return this.ui.goal("The world is complete. The road goes on…");
    if (this.available(q)) return this.ui.goal(q.place === this.placeId ? q.objective : `${q.objective} (${this.placeName(q.place)})`);
    const ways = this.leadsTo(q).map(p => p.role === "short" ? `the shortcut at ${this.placeName(p.place)}` : this.placeName(p.place));
    this.ui.goal(`On to ${this.placeName(q.place)}, by way of ${[...new Set(ways)].join(" or ")}.`);
  }

  playQuest(q) {
    const steps = this.story[q.scene].steps;
    const title = q.boss ? q.boss.title : q.title;
    this.ui.puzzle(title, () => this.talk(steps, () => {
      for (const s of steps) if (s[0] === "party") { this.st.party = s[1]; this.setParty(s[1]); }
      this.st.done.push(q.node);
      this.save();
      this.setGoal();
    }));
  }

  /* ---------- talking and walking ---------- */
  target() {
    const P = this.player, v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[P.facing];
    const fx = P.x + v[0] * 12, fy = P.y - 3 + v[1] * 12;
    let best = null, bd = 20;
    for (const n of this.npcs) {
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
    const t = this.target();
    if (!t) return;
    if (t.kind === "npc") {
      const n = t.n;
      n.dir = { up: "down", down: "up", left: "right", right: "left" }[this.player.facing];
      this.faceNpc(n);
      const who = n.who;
      this.talk(n.say.length ? n.say.map(l => who ? ["say", who, l] : ["n", l]) : [["n", "…"]]);
      return;
    }
    const spot = this.spots[t.k], q = this.region.quests.find(q => q.node === spot.node);
    if (q && this.available(q)) this.playQuest(q);
    else if (q && this.st.done.includes(q.node)) this.talk([["n", `${spot.label || q.title}. (${q.title}: done.)`]]);
    else this.talk([["n", `${spot.label || "Nothing here"}. It isn't time yet.`]]);
  }

  talk(steps, done) { this.player.setVelocity(0); this.ui.dialog(steps, done); }

  faceNpc(n) {
    if (n.who) n.spr.setTexture(`h-${n.who}-${n.dir}-0`);
    else { n.spr.anims.stop(); n.spr.setFrame(n.folk.still(n.dir)); }
  }

  go(to) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.restart({ place: to, from: this.placeId }));
  }

  update(time, dt) {
    const P = this.player, K = this.keys;
    let vx = 0, vy = 0;
    if (!this.ui.busy() && !this.leaving) {
      if (K.LEFT.isDown || K.A.isDown || this.auto === "left") vx -= 1;
      if (K.RIGHT.isDown || K.D.isDown || this.auto === "right") vx += 1;
      if (K.UP.isDown || K.W.isDown || this.auto === "up") vy -= 1;
      if (K.DOWN.isDown || K.S.isDown || this.auto === "down") vy += 1;
    }
    const speed = K.SHIFT.isDown ? 110 : 64, len = Math.hypot(vx, vy) || 1;
    P.setVelocity(vx / len * speed, vy / len * speed);
    if (vx || vy) {
      P.facing = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? "left" : "right") : (vy < 0 ? "up" : "down");
      P.anims.play(`h-liubei-${P.facing}`, true);
      P.anims.msPerFrame = K.SHIFT.isDown ? 85 : 135;
    } else { P.anims.stop(); P.setTexture(`h-liubei-${P.facing}-0`); }
    P.setDepth(P.y);

    // exits: walk off the edge to the next place, if the story has opened it
    this.blocked = Math.max(0, this.blocked - dt);
    for (const e of this.exits) {
      if (!Phaser.Geom.Rectangle.Contains(e.rect, P.x, P.y - 3)) continue;
      if (this.placeOpen(e.to)) this.go(e.to);
      else if (!this.blocked) {
        this.blocked = 1500;
        const name = this.region.places.find(p => p.id === e.to).name;
        const back = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] }[e.side];
        P.setPosition(P.x + back[0] * 10, P.y + back[1] * 10);
        this.talk([["n", `The way to ${name} isn't open yet.`]]);
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
      if (n.moving) { n.spr.setVelocity(v[0] * 28, v[1] * 28); n.spr.anims.play(`fk-${n.sprite}-${n.dir}`, true); }
      else { n.spr.setVelocity(0); this.faceNpc(n); }
      n.spr.setDepth(n.spr.y);
    }

    const t = !this.ui.busy() && this.target();
    this.ui.hint(t ? (t.kind === "npc" ? t.n.spr : this.spots[t.k]) : null);
  }
}

/* ---------- the place name, shown on arrival ---------- */
const WorldUI = {
  place(name) {
    const el = document.getElementById("world-place");
    if (!el) return;
    el.textContent = name;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  },
};

function startWorld(parent, opts = {}) {
  const q = new URLSearchParams(location.search);
  const o = { world: +(q.get("world") || opts.world || 1), kit: q.get("kit") || opts.kit || "ninja" };
  if (q.has("reset")) localStorage.removeItem(WorldState.key(o.world));
  const game = new Phaser.Game({
    type: Phaser.AUTO, parent, width: 320, height: 180, pixelArt: true, roundPixels: true, backgroundColor: "#1b2418",
    physics: { default: "arcade", arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [WorldBoot, WorldScene],
    callbacks: { preBoot: g => { g.worldOpts = o; } },
  });
  return game;
}
