/* ---- Three Kingdoms: cutscenes in the explorable world ----
   Plays the staged scenes the scene generator writes
   (tools/mapfactory/scenes.py → data/tk_maps/w<N>/cutscenes.json): actors
   walk real paths around the map, armies move in formation, blows land and
   men fall, effects play, and the camera frames whoever is speaking. Beats
   are in tiles, so any art kit plays them; see docs/cutscene-format.md.

   WorldCutscene.play(scene, cutscene, done) runs inside the world's Phaser
   scene (tk-world.js). Dialogue goes through the world's dialogue box
   (TownUI). Skip ends the scene at once; its lasting effects (who joins the
   party) are applied by the world's own callback. */

const WorldCutscene = {
  async play(scene, cs, done) {
    const T = 16, ui = scene.ui, cam = scene.cameras.main;
    const realBusy = ui.busy;
    ui.busy = () => true;                       // the world stops walking and wandering while the scene plays
    scene.cine = cs;
    const actors = {}, fx = [], timers = [];
    let skip = false;
    const px = ([x, y]) => [x * T, y * T];
    const wait = ms => new Promise(r => { if (skip) return r(); timers.push(scene.time.delayedCall(ms, r)); });
    const tween = cfg => new Promise(r => { if (skip) return r(); scene.tweens.add({ ...cfg, onComplete: r }); });

    // hide the player, the followers and the townsfolk; the cast stands in for them
    const hidden = [scene.player, ...scene.followers.map(f => f.spr), ...scene.npcs.map(n => n.spr), ...scene.npcs.map(n => n.mark).filter(Boolean)]
      .filter(s => s && s.visible);
    hidden.forEach(s => s.setVisible(false));
    scene.player.setVelocity(0);
    cam.stopFollow();

    // letterbox and a Skip button
    const W = scene.scale.width, H = scene.scale.height, bar = 16;
    const bars = [scene.add.rectangle(0, -bar, W, bar, 0x000000).setOrigin(0), scene.add.rectangle(0, H, W, bar, 0x000000).setOrigin(0)]
      .map(b => b.setScrollFactor(0).setDepth(1e6));
    scene.tweens.add({ targets: bars[0], y: 0, duration: 300 });
    scene.tweens.add({ targets: bars[1], y: H - bar, duration: 300 });
    const host = scene.game.worldOpts && scene.game.worldOpts.host || document.body;
    const skipBtn = document.createElement("button");
    skipBtn.className = "town-skip"; skipBtn.type = "button"; skipBtn.textContent = "Skip ▸▸";
    skipBtn.onclick = e => { e.stopPropagation(); skip = true; while (realBusy()) ui.advance(); };
    (host.querySelector(".town-ui") || host).append(skipBtn);

    const actor = (id, at, face) => {
      let a = actors[id];
      const who = cs.cast[id].who;
      if (!a) {
        scene.hero(who);
        a = actors[id] = { id, who, spr: scene.add.sprite(0, 0, `h-${who}-down-0`).setOrigin(.5, 1) };
      }
      const [x, y] = px(at);
      a.spr.setPosition(x, y).setDepth(y).setVisible(true).setAlpha(1).setAngle(0).clearTint();
      if (face) look(a, face);
      return a;
    };
    const look = (a, dir) => { a.dir = dir; a.spr.anims.stop(); a.spr.setTexture(`h-${a.who}-${dir}-0`); };
    const walk = async (b) => {
      const a = actors[b.actor];
      if (!a) return;
      const pts = b.path.map(px), speed = b.speed * T;
      for (let i = 1; i < pts.length && !skip; i++) {
        const [x0, y0] = [a.spr.x, a.spr.y], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0);
        if (d < .5) continue;
        const dir = Math.abs(x1 - x0) > Math.abs(y1 - y0) ? (x1 > x0 ? "right" : "left") : (y1 > y0 ? "down" : "up");
        a.dir = dir;
        a.spr.anims.play(`h-${a.who}-${dir}`, true);
        a.spr.anims.msPerFrame = b.speed > 5 ? 85 : 135;
        await tween({ targets: a.spr, x: x1, y: y1, duration: d / speed * 1000, onUpdate: () => a.spr.setDepth(a.spr.y) });
      }
      const last = pts[pts.length - 1];
      a.spr.setPosition(last[0], last[1]).setDepth(last[1]);
      look(a, a.dir || "down");
    };
    const fade = ids => Promise.all(ids.filter(id => actors[id]).map(id =>
      tween({ targets: actors[id].spr, alpha: 0, duration: 350 }).then(() => actors[id].spr.setVisible(false))));
    const pan = (to, ms = 350) => {
      if (!to) return Promise.resolve();
      const [x, y] = px(to);
      return new Promise(r => { if (skip) return r(); cam.pan(x, y - 8, ms, "Sine.easeInOut", true, (c, p) => { if (p === 1) r(); }); });
    };

    const run = async b => {
      if (skip) return;
      switch (b.do) {
        case "cut": {
          cam.fadeOut(180); await wait(190);
          for (const p of b.place) actor(p.actor, p.at, p.face);
          const lead = b.place[0];
          if (lead) { const [x, y] = px(lead.at); cam.centerOn(x, y - 8); }
          cam.fadeIn(220); await wait(230);
          break;
        }
        case "appear":
          for (const p of b.place) { const a = actor(p.actor, p.at, p.face); a.spr.setAlpha(0); scene.tweens.add({ targets: a.spr, alpha: 1, duration: 250 }); }
          await wait(120);
          break;
        case "together": await Promise.all(b.beats.map(run)); break;
        case "walk": await walk(b); break;
        case "camera": await pan(b.to, b.ms || 500); break;
        case "line": {
          for (const t of b.face || []) if (actors[t.actor]) look(actors[t.actor], t.dir);
          await pan(b.camera, 300);
          if (skip) break;
          await new Promise(r => {
            ui.dialog([b.line], r, "story");
            const dim = (host.querySelector(".town-ui") || host).querySelector(".town-dim");
            if (dim) dim.hidden = true;           // the scene is on the map: keep it visible
          });
          break;
        }
        case "strike": {
          const a = actors[b.actor], t = b.target && actors[b.target];
          if (!a) break;
          const dx = t ? Math.sign(t.spr.x - a.spr.x) || 1 : (a.dir === "left" ? -1 : 1);
          look(a, dx > 0 ? "right" : "left");
          await tween({ targets: a.spr, x: a.spr.x + dx * 7, duration: 90, yoyo: true, ease: "Quad.easeOut" });
          cam.shake(120, .006);
          break;
        }
        case "fall":
          await Promise.all(b.actors.filter(id => actors[id]).map((id, i) => {
            const s = actors[id].spr;
            return wait(i * 60).then(() => { s.setTint(0xb0a090); return tween({ targets: s, angle: (i % 2 ? -1 : 1) * 90, y: s.y - 2, duration: 260, ease: "Quad.easeIn" }); });
          }));
          await wait(200);
          break;
        case "fade": await fade(b.actors); break;
        case "pose": break;
        case "fx": await WorldFx.play(scene, b.name, px(b.at), fx); break;
        case "wait": await wait(b.ms); break;
        case "party": break;                       // applied by the world when the scene ends
      }
    };

    for (const b of cs.beats) { if (skip) break; await run(b); }

    // back to the world: the leader stands where the scene left him
    for (const t of timers) t.remove(false);
    scene.tweens.killTweensOf(Object.values(actors).map(a => a.spr));
    for (const a of Object.values(actors)) a.spr.destroy();
    for (const o of fx) o.destroy();
    skipBtn.remove();
    bars.forEach(b => b.destroy());
    cam.resetFX();
    if (cs.end && cs.end.leader) { const [x, y] = px(cs.end.leader); scene.player.setPosition(x, y); }
    scene.player.facing = "down";
    hidden.forEach(s => s.setVisible(true));
    for (const n of scene.npcs) if (n.until && !n.spr.body.enable) n.spr.setVisible(false);
    scene.trail = Array(60).fill({ x: scene.player.x, y: scene.player.y, f: "down" });
    cam.startFollow(scene.player, true, .15, .15);
    ui.busy = realBusy;
    scene.cine = null;
    done && done();
  },
};

/* ---------- effects, as small Phaser particles ---------- */
const WorldFx = {
  play(scene, name, [x, y], keep) {
    const R = Math.random, cam = scene.cameras.main;
    const dot = (c, sz = 2) => { const r = scene.add.rectangle(x, y, sz, sz, c).setDepth(1e5); keep.push(r); return r; };
    const fly = (o, cfg, delay = 0) => scene.tweens.add({ targets: o, delay, ...cfg, onComplete: () => o.destroy() });
    const ms = { petals: 1300, incense: 900, flash: 400, dust: 700, sparkle: 400, fire: 1500, paper: 1800, whip: 450, blackwind: 2400 }[name] || 300;
    if (name === "flash") {
      const ring = scene.add.circle(x, y - 8, 3, 0xfff6c8, .9).setDepth(1e5); keep.push(ring);
      fly(ring, { scale: 6, alpha: 0, duration: 350 });
      cam.flash(120, 255, 246, 200); cam.shake(160, .008);
      for (let i = 0; i < 12; i++) fly(dot(0xfff6c8), { x: x + (R() - .5) * 40, y: y - 8 - R() * 24, alpha: 0, duration: 450 });
    } else if (name === "dust") {
      for (let i = 0; i < 30; i++) fly(dot(R() < .5 ? 0xd8c39a : 0xb8a074, 3), { x: x + (R() - .5) * 60, y: y - R() * 20, alpha: 0, duration: 700 + R() * 400 }, R() * 200);
    } else if (name === "sparkle") {
      for (let i = 0; i < 18; i++) fly(dot(R() < .5 ? 0xffe36a : 0xffffff), { x: x + (R() - .5) * 30, y: y - 10 - R() * 30, alpha: 0, duration: 600 });
    } else if (name === "petals") {
      for (let i = 0; i < 50; i++) { const p = dot(R() < .5 ? 0xf6b8c8 : 0xfbd8e0, 2); p.setPosition(x + (R() - .5) * 120, y - 70 - R() * 30);
        fly(p, { x: p.x + (R() - .5) * 40, y: y + R() * 20, angle: 360, alpha: .2, duration: 1600 + R() * 800 }, R() * 900); }
    } else if (name === "incense") {
      for (let i = 0; i < 24; i++) fly(dot(0xd8d2c8, 2), { x: x + (R() - .5) * 10, y: y - 30 - R() * 20, alpha: 0, duration: 1400 }, i * 60);
    } else if (name === "paper") {
      for (let i = 0; i < 34; i++) { const p = dot(0xf4ead2, 3); p.setPosition(x + (R() - .5) * 120, y - 80 - R() * 30);
        fly(p, { x: p.x + (R() - .5) * 30, y: y + (R() - .5) * 20, angle: 540 * (R() - .5), duration: 1500 + R() * 600 }, R() * 600); }
    } else if (name === "fire") {
      for (let i = 0; i < 60; i++) fly(dot(R() < .5 ? 0xff7a2a : 0xffc84a, 3), { x: x + (R() - .5) * 50, y: y - 20 - R() * 30, alpha: 0, duration: 700 }, R() * 1200);
    } else if (name === "whip") {
      const t = scene.add.text(x, y - 26, "THWACK!", { fontFamily: "Georgia, serif", fontSize: "10px", color: "#fff", stroke: "#3a2416", strokeThickness: 3 }).setOrigin(.5).setDepth(1e5);
      keep.push(t); fly(t, { y: y - 36, alpha: 0, duration: 600 }); cam.shake(160, .006);
    } else if (name === "blackwind") {
      const W = scene.scale.width, H = scene.scale.height;
      const dark = scene.add.rectangle(0, 0, W, H, 0x0a0812, 0).setOrigin(0).setScrollFactor(0).setDepth(9e4); keep.push(dark);
      scene.tweens.add({ targets: dark, fillAlpha: .5, duration: 400, yoyo: true, hold: 1500, onComplete: () => dark.destroy() });
      for (let i = 0; i < 70; i++) {
        const p = dot(R() < .6 ? 0x1c1826 : 0x4a3f60, 3), a0 = R() * 6.3, r = 6 + R() * 40, sp = (R() < .5 ? -1 : 1) * (2 + R() * 3);
        p.setDepth(9.5e4);
        scene.tweens.addCounter({ from: 0, to: 1, duration: 2200, delay: R() * 300,
          onUpdate: tw => { const v = tw.getValue(); p.setPosition(x + Math.cos(a0 + v * sp) * r * (1 + v), y - 12 + Math.sin(a0 + v * sp) * r * .5 - v * 20).setAlpha(1 - v); },
          onComplete: () => p.destroy() });
      }
      for (let i = 0; i < 3; i++) scene.time.delayedCall(300 + i * 600, () => cam.flash(90, 220, 220, 255));
    }
    return new Promise(r => scene.time.delayedCall(ms, r));
  },
};
