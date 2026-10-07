/* ---- Three Kingdoms: things the story gives the party ----
   A scene step ["gain", key] gives the party something from its world's
   "items" (tools/tk_story.py): horses, weapons, treasure. They are kept per
   world in localStorage "tk-items", like the party.

   A mount puts the heroes on horseback in the explorable world and in
   cutscenes: each rider gets a horse under him (coat by rider), sits up on
   its back, and travels faster. Horses: "[LPC] Horses" by bluecarrot16
   (OGA-BY 3.0), scaled by tools/fetch_horses.py. */

const WorldItems = {
  KEY: "tk-items",
  COATS: ["brown", "black", "white", "gray", "golden", "red"],   // red: Red Hare (TK_CHARS.redhare.horse)
  FRAME: [38, 38],
  ROWS: ["down", "left", "right", "up"],
  // Where a rider sits, per facing: the frame row of the hooves (the horse's
  // anchor), the seat's x offset from the horse's middle (behind the withers),
  // and the seat's height above the hooves.
  SEAT: { right: { hoof: 31, dx: 0, up: 20 }, left: { hoof: 31, dx: -1, up: 20 },
          down: { hoof: 33, dx: 0, up: 26 }, up: { hoof: 38, dx: 0, up: 25 } },
  HEAD: 13,       // facing us, the top rows of the horse (head and neck) are in front of the rider
  HIP: 13.5,      // the row of a seated rider's hips
  SPEED: 1.5,     // mounted, the party travels this much faster

  owned(w) { return (TK.ls(this.KEY)[w.n] || []).slice(); },
  has(w, key) { return this.owned(w).includes(key); },
  defs(w) { return w.items || {}; },
  // The rider's coat if the party has a mount, else null.
  coat(w, who) {
    const d = this.defs(w), m = this.owned(w).map(k => d[k]).find(x => x && x.kind === "mount");
    return m ? (m.coats && m.coats[who]) || "brown" : null;
  },
  // Riding is a choice (R, or the header button), remembered per world; indoors everyone walks.
  riding(w) { return TK.ls("tk-ride")[w.n] !== false; },
  setRiding(w, on) { const a = TK.ls("tk-ride"); a[w.n] = !!on; TK.lsSet("tk-ride", a); },
  hasMount(w) { const d = this.defs(w); return this.owned(w).some(k => d[k] && d[k].kind === "mount"); },
  indoors(scene) { const p = scene.region && scene.region.places.find(x => x.id === scene.placeId); return !!(p && p.parent); },
  mountedHere(scene, who) { return this.riding(scene.w) && !this.indoors(scene) ? this.coat(scene.w, who) : null; },
  toggle(scene) {
    const w = scene.w;
    if (!this.hasMount(w)) return;
    if (this.indoors(scene)) return this.say(scene, "屋里不能骑马", "No riding indoors");
    this.setRiding(w, !this.riding(w));
    scene.mountSig = null;
    this.say(scene, this.riding(w) ? "上马" : "下马", this.riding(w) ? "Mounted" : "On foot");
    if (this.onChange) this.onChange();
  },
  say(scene, zh, en) { this.notice(scene, { zh, name: en }, true); },
  add(w, key) {
    const all = TK.ls(this.KEY), list = all[w.n] || [];
    if (list.includes(key) || !this.defs(w)[key]) return false;
    list.push(key); all[w.n] = list; TK.lsSet(this.KEY, all);
    return true;
  },

  remove(w, key) {
    const all = TK.ls(this.KEY), list = all[w.n] || [], i = list.indexOf(key);
    if (i < 0) return false;
    list.splice(i, 1); all[w.n] = list; TK.lsSet(this.KEY, all);
    return true;
  },

  /* ---------- Phaser: horse sheets and walk cycles ---------- */
  preload(scene) {
    for (const c of this.COATS) scene.load.spritesheet(`horse-${c}`, `assets/tk/horses/${c}.png?v=2`, { frameWidth: this.FRAME[0], frameHeight: this.FRAME[1] });
  },
  anims(scene) {
    for (const c of this.COATS) this.ROWS.forEach((dir, r) => {
      const key = `horse-${c}-${dir}`;
      if (!scene.anims.exists(key) && scene.textures.exists(`horse-${c}`))
        scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(`horse-${c}`, { frames: [0, 1, 2, 3].map(k => r * 4 + k) }), frameRate: 9, repeat: -1 });
    });
  },
  horse(scene, coat, x, y) {
    this.anims(scene);
    return scene.add.sprite(x, y, `horse-${coat}`, this.ROWS.indexOf("down") * 4).setOrigin(.5, 1);
  },
  // Point a horse the way its rider faces; walk it if moving.
  pose(h, coat, dir, moving) {
    if (moving) h.anims.play(`horse-${coat}-${dir}`, true);
    else { h.anims.stop(); h.setFrame(this.ROWS.indexOf(dir) * 4); }
  },
  // A hero seated on a horse, made from his own front, back or profile frame:
  // the upper body as drawn, then a saddle cloth and legs astride (front and
  // back) or bent down the flank (profile), outlined like the rest.
  rider(who, dir) {
    const A = TKArt, d = TK_CHARS[who];
    const src = dir === "down" ? A.get(who, "sprite", 0) : dir === "up" ? TownArt.back(who, 0) : TownArt.side(who, 0);
    const W = src.width, H = src.height + 3, cut = 14;
    const px = src.getContext("2d").getImageData(0, 0, src.width, src.height).data;
    const g = A.grid(W, H), hex = i => "#" + [0, 1, 2].map(k => px[i + k].toString(16).padStart(2, "0")).join("");
    for (let y = 0; y < cut; y++) for (let x = 0; x < W; x++) { const i = (y * src.width + x) * 4; if (px[i + 3] > 0) g.c[y][x] = hex(i); }
    // the old outline under the waist goes; the new parts get their own
    for (let x = 0; x < W; x++) if (g.c[cut - 1][x] === "#1c1418" && !(g.c[cut - 2][x] && g.c[cut - 2][x] !== "#1c1418")) g.c[cut - 1][x] = null;
    const pants = A.shade(d.robe, -.32), boot = "#2a2228", cloth = "#8a2a1a", trim = "#d4ad42";
    const put = (x, y, c) => { if (!g.c[y][x] || g.c[y][x] === "#1c1418") g.c[y][x] = c; };
    if (dir === "right") {
      for (let x = 2; x <= 9; x++) { put(x, cut - 1, cloth); put(x, cut, cloth); put(x, cut + 1, trim); }   // saddle cloth
      for (let x = 6; x <= 9; x++) { g.c[cut - 1][x] = pants; g.c[cut][x] = pants; }                      // thigh, forward
      for (let y = cut + 1; y <= cut + 3; y++) { g.c[y][8] = pants; g.c[y][9] = pants; }                 // shin, down the flank
      g.c[cut + 4][8] = boot; g.c[cut + 4][9] = boot; g.c[cut + 4][10] = boot;                           // boot, toe forward
    } else {
      for (let x = 3; x <= 12; x++) { put(x, cut - 1, cloth); put(x, cut, trim); }
      for (const lx of [2, 12]) {                                                                         // legs astride
        for (let y = cut - 1; y <= cut + 2; y++) { g.c[y][lx] = pants; g.c[y][lx + (lx < 8 ? 1 : -1)] = y < cut + 1 ? pants : g.c[y][lx + (lx < 8 ? 1 : -1)]; }
        g.c[cut + 3][lx] = boot;
      }
    }
    return A.canvas(A.outline(g));
  },
  riderTexture(scene, who, dir) {
    const key = `ride-${who}-${dir}`;
    if (!scene.textures.exists(key)) {
      const gen = scene.textures.exists(`hx-${who}`) && scene.textures.exists(`h-${who}-${dir}-0`);
      const cv = gen ? this.genRider(scene.textures.get(`h-${who}-${dir}-0`).getSourceImage())
        : dir === "left" ? TKArt.flip(this.rider(who, "right")) : this.rider(who, dir);
      scene.textures.addCanvas(key, cv);
    }
    return key;
  },
  // A generated (kit-drawn) hero in the saddle: his frame above the waist, set so the waist
  // falls on the hip row the seat is placed by, over a band of saddle cloth.
  genRider(frame) {
    const w = frame.width, top = this.bodyTop(frame), waist = top + Math.round((frame.height - top) * .55);
    const hip = Math.floor(this.HIP), cv = document.createElement("canvas");
    cv.width = w; cv.height = hip + 4;
    const g = cv.getContext("2d");
    g.drawImage(frame, 0, 0, w, waist, 0, hip - waist, w, waist);
    g.fillStyle = "#8a2a1a"; g.fillRect(Math.round(w * .2), hip, Math.round(w * .6), 2);
    g.fillStyle = "#d4ad42"; g.fillRect(Math.round(w * .2), hip + 2, Math.round(w * .6), 1);
    return cv;
  },
  bodyTop(frame) {   // the first row with paint on it
    const d = frame.getContext ? frame.getContext("2d").getImageData(0, 0, frame.width, frame.height).data : null;
    if (!d) return 0;
    for (let y = 0; y < frame.height; y++) for (let x = 0; x < frame.width; x++) if (d[(y * frame.width + x) * 4 + 3] > 0) return y;
    return 0;
  },
  // Put a seated rider and his horse at a place on the ground, facing dir.
  // head: a copy of the horse showing only its head and neck, drawn over the
  // rider when the horse faces us.
  place(horse, seat, head, x, y, dir) {
    const S = this.SEAT[dir];
    x = Math.round(x); y = Math.round(y);
    horse.setOrigin(.5, S.hoof / this.FRAME[1]).setPosition(x, y).setDepth(y);
    seat.setOrigin(.5, this.HIP / seat.height).setPosition(x + S.dx, y - S.up).setDepth(y + .5);
    seat.isoBase = [x, y];   // the isometric view keeps him upright on the saddle (tk-iso.js)
    if (head) {
      head.setVisible(horse.visible && dir === "down").setAlpha(horse.alpha);
      if (dir === "down") head.setTexture(horse.texture.key, horse.frame.name).setCrop(0, 0, this.FRAME[0], this.HEAD)
        .setOrigin(horse.originX, horse.originY).setPosition(x, y).setDepth(y + .7);
    }
  },
  head(scene, horse) { return scene.add.image(horse.x, horse.y, horse.texture.key, horse.frame.name).setOrigin(.5, 1).setVisible(false); },
  dirOf(spr) { const m = /-(down|up|left|right)-\d+$/.exec(spr.texture.key); return m ? m[1] : "down"; },

  /* ---------- the explorable world ---------- */
  // Called once a place is built. Riders are drawn by stand-ins, so the
  // physics bodies of the heroes stay on the ground where they walk.
  attach(scene) {
    const w = scene.w;
    scene.mounts = [];
    const sync = () => {
      const riders = [{ who: "liubei", spr: scene.player, moving: scene.player.body.velocity.lengthSq() > 1 },
        ...scene.followers.map(f => ({ who: f.who, spr: f.spr, moving: !!(f.spr.anims && f.spr.anims.isPlaying) }))];
      // rebuild when the party changes
      const sig = riders.map(r => r.who + ":" + (this.mountedHere(scene, r.who) || "")).join(",");
      if (sig !== scene.mountSig) {
        for (const m of scene.mounts) { m.horse.destroy(); m.seat.destroy(); m.head.destroy(); m.spr.setAlpha(1); }
        scene.mounts = riders.filter(r => this.mountedHere(scene, r.who)).map(r => {
          const coat = this.mountedHere(scene, r.who), horse = this.horse(scene, coat, r.spr.x, r.spr.y);
          return { who: r.who, spr: r.spr, coat, horse, head: this.head(scene, horse), seat: scene.add.image(r.spr.x, r.spr.y, this.riderTexture(scene, r.who, "down")) };
        });
        scene.mountSig = sig;
      }
      const busyScene = !!scene.cine;
      for (const m of scene.mounts) {
        const r = riders.find(x => x.spr === m.spr);
        const show = m.spr.visible && !busyScene;
        m.horse.setVisible(show); m.seat.setVisible(show);
        if (!show) { m.head.setVisible(false); continue; }
        m.spr.setAlpha(0);
        const dir = this.dirOf(m.spr);
        this.pose(m.horse, m.coat, dir, r && r.moving);
        m.seat.setTexture(this.riderTexture(scene, m.who, dir));
        this.place(m.horse, m.seat, m.head, m.spr.x, m.spr.y, dir);
      }
      // mounted, the party travels faster (the world sets the walking speed each frame)
      if (scene.mounts.length && !scene.leaving && !busyScene) scene.player.body.velocity.scale(this.SPEED);
    };
    scene.mountSig = null;
    // R gets on or off the horse
    const key = () => { if (!scene.ui.busy() && !scene.cine && !scene.leaving) this.toggle(scene); };
    scene.input.keyboard.on("keydown-R", key);
    const keys = (scene.game.worldOpts && scene.game.worldOpts.host || document).querySelector(".town-keys");
    if (keys && this.hasMount(w) && !keys.querySelector(".town-ride")) keys.insertAdjacentHTML("beforeend", ' · <span class="town-ride"><b>R</b> 上马/下马 ride</span>');
    scene.events.on("postupdate", sync);
    scene.events.once("shutdown", () => scene.events.off("postupdate", sync));
  },

  // After a scene: whatever it gave, with a notice for each new thing.
  gainFrom(scene, steps) {
    for (const s of steps) {
      if (s[0] === "gain") this.gain(scene, s[1]);
      else if (s[0] === "give") this.gain(scene, s[3]);   // ["give", from, to, item]
    }
  },
  gain(scene, key) {
    const w = scene.w;
    if (!this.add(w, key)) return;
    const d = this.defs(w)[key];
    this.notice(scene, d);
    scene.mountSig = null;   // re-seat the party
  },
  notice(scene, d, brief) {
    const host = (scene.game.worldOpts && scene.game.worldOpts.host) || document.body;
    const ui = host.querySelector(".town-ui") || host;
    let root = ui.querySelector(".town-gains");
    if (!root) { root = document.createElement("div"); root.className = "town-gains"; ui.append(root); }
    const el = document.createElement("div");
    el.className = "town-gain";
    el.innerHTML = `<b lang="zh-CN"></b><span></span>`;
    el.querySelector("b").textContent = brief ? d.zh : `得到 · ${d.zh || ""}`;
    el.querySelector("span").textContent = brief ? d.name : `Gained: ${d.name}`;
    if (brief) el.classList.add("brief");
    root.append(el);
    setTimeout(() => el.remove(), 3600);
  },
};
