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
  COATS: ["brown", "black", "white", "gray", "golden"],
  FRAME: [31, 30],
  ROWS: ["down", "left", "right", "up"],
  RISE: 9,        // how far a rider sits above the ground
  LEGS: 5,        // a seated rider's legs are hidden by the horse's flank
  SPEED: 1.5,     // mounted, the party travels this much faster

  owned(w) { return (TK.ls(this.KEY)[w.n] || []).slice(); },
  has(w, key) { return this.owned(w).includes(key); },
  defs(w) { return w.items || {}; },
  // The rider's coat if the party has a mount, else null.
  coat(w, who) {
    const d = this.defs(w), m = this.owned(w).map(k => d[k]).find(x => x && x.kind === "mount");
    return m ? (m.coats && m.coats[who]) || "brown" : null;
  },
  add(w, key) {
    const all = TK.ls(this.KEY), list = all[w.n] || [];
    if (list.includes(key) || !this.defs(w)[key]) return false;
    list.push(key); all[w.n] = list; TK.lsSet(this.KEY, all);
    return true;
  },

  /* ---------- Phaser: horse sheets and walk cycles ---------- */
  preload(scene) {
    for (const c of this.COATS) scene.load.spritesheet(`horse-${c}`, `assets/tk/horses/${c}.png?v=1`, { frameWidth: this.FRAME[0], frameHeight: this.FRAME[1] });
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
  // A hero frame as a seated rider: the standing pose, legs cropped away.
  seat(img, key) {
    if (img.texture.key !== key) img.setTexture(key);
    img.setCrop(0, 0, img.width, img.height - this.LEGS);
    return img;
  },
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
      const sig = riders.map(r => r.who + ":" + (this.coat(w, r.who) || "")).join(",");
      if (sig !== scene.mountSig) {
        for (const m of scene.mounts) { m.horse.destroy(); m.seat.destroy(); m.spr.setAlpha(1); }
        scene.mounts = riders.filter(r => this.coat(w, r.who)).map(r => {
          const coat = this.coat(w, r.who);
          return { who: r.who, spr: r.spr, coat, horse: this.horse(scene, coat, r.spr.x, r.spr.y), seat: scene.add.image(r.spr.x, r.spr.y, r.spr.texture.key).setOrigin(.5, 1) };
        });
        scene.mountSig = sig;
      }
      const busyScene = !!scene.cine;
      for (const m of scene.mounts) {
        const r = riders.find(x => x.spr === m.spr);
        const show = m.spr.visible && !busyScene;
        m.horse.setVisible(show); m.seat.setVisible(show);
        if (!show) continue;
        m.spr.setAlpha(0);
        const dir = this.dirOf(m.spr);
        this.pose(m.horse, m.coat, dir, r && r.moving);
        m.horse.setPosition(Math.round(m.spr.x), Math.round(m.spr.y)).setDepth(m.spr.y);
        this.seat(m.seat, m.spr.texture.key.replace(/-\d+$/, "-0"));   // sits still: the horse does the walking
        m.seat.setPosition(Math.round(m.spr.x), Math.round(m.spr.y - this.RISE)).setDepth(m.spr.y + .5);
      }
      // mounted, the party travels faster (the world sets the walking speed each frame)
      if (scene.mounts.length && !scene.leaving && !busyScene) scene.player.body.velocity.scale(this.SPEED);
    };
    scene.mountSig = null;
    scene.events.on("postupdate", sync);
    scene.events.once("shutdown", () => scene.events.off("postupdate", sync));
  },

  // After a scene: whatever it gave, with a notice for each new thing.
  gainFrom(scene, steps) {
    for (const s of steps) if (s[0] === "gain") this.gain(scene, s[1]);
  },
  gain(scene, key) {
    const w = scene.w;
    if (!this.add(w, key)) return;
    const d = this.defs(w)[key];
    this.notice(scene, d);
    scene.mountSig = null;   // re-seat the party
  },
  notice(scene, d) {
    const host = (scene.game.worldOpts && scene.game.worldOpts.host) || document.body;
    const ui = host.querySelector(".town-ui") || host;
    let root = ui.querySelector(".town-gains");
    if (!root) { root = document.createElement("div"); root.className = "town-gains"; ui.append(root); }
    const el = document.createElement("div");
    el.className = "town-gain";
    el.innerHTML = `<b lang="zh-CN"></b><span></span>`;
    el.querySelector("b").textContent = `得到 · ${d.zh || ""}`;
    el.querySelector("span").textContent = `Gained: ${d.name}`;
    root.append(el);
    setTimeout(() => el.remove(), 3600);
  },
};
