/* ---- Three Kingdoms: cutscenes in the explorable world ----
   Plays the staged scenes the scene generator writes
   (tools/mapfactory/scenes.py → data/tk_maps/w<N>/cutscenes.json): actors
   walk real paths around the map, armies move in formation, blows land and
   men fall, effects play, and the camera frames whoever is speaking. Beats
   are in tiles, so any art kit plays them; see docs/cutscene-format.md.

   WorldCutscene.play(scene, cutscene, done, opts) runs inside the world's
   Phaser scene (tk-world.js). Dialogue goes through the world's dialogue box
   (TownUI). Skip ends the scene at once; its lasting effects (who joins the
   party) are applied by the world's own callback.

   A "problem" beat is the scene's Go problem: the scene waits on
   opts.onProblem() (a promise of a win). Losing or leaving ends the scene
   and calls opts.onLeave instead of done. Before the problem, Skip jumps to
   it, placing everyone where they would be; opts.ffToProblem starts that
   way (a retry), and replays the last line before the problem.

   Props (a cage cart, a forge, wine jars, a city gate) are cast members with
   "prop": kind. They are drawn from the prop atlas (assets/tk/props.png,
   tools/build_props.py) or from the kit's own sprites, move like actors and
   carry whoever boards them. Poses, emote bubbles, gifts handed over, camera
   zoom, a dark mood and the light (night, dusk, dawn, storm) are drawn here too. */

const WorldCutscene = {
  async play(scene, cs, done, opts = {}) {
    const T = 16, ui = scene.ui, cam = scene.cameras.main;
    await WorldCutscene.load(scene);
    const realBusy = ui.busy, zoom0 = cam.zoom;
    ui.busy = () => true;                       // the world stops walking and wandering while the scene plays
    scene.cine = cs;
    const actors = {}, fx = [], timers = [];
    const hasProblem = cs.beats.some(b => b.do === "problem");
    let skip = !!(opts.ffToProblem && hasProblem), solved = !hasProblem, left = false, lastLine = null;
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

    // Horses: "horse" in the cast is a riderless horse; the party rides once it owns a mount (tk-items.js).
    const Items = typeof WorldItems !== "undefined" ? WorldItems : null;
    const party = new Set(cs.party || []);
    const coatFor = who => Items && party.has(who) ? Items.coat(scene.w, who) : null;
    const herdCoat = id => Items ? Items.COATS[[...id].reduce((h, c) => h + c.charCodeAt(0), 0) % 3] : null;
    // A mounted actor: a.spr stays the invisible anchor that moves and fades;
    // the horse, the seated rider and (facing us) the horse's head follow it.
    const mount = a => {
      const coat = a.who === "horse" ? null : coatFor(a.who);
      if (coat && !a.horse) {
        a.coat = coat; a.horse = Items.horse(scene, coat, a.spr.x, a.spr.y); a.head = Items.head(scene, a.horse);
        a.seat = scene.add.image(a.spr.x, a.spr.y, Items.riderTexture(scene, a.who, a.dir || "down"));
        a.spr.setScale(0);
      }
      sync(a);
    };
    const sync = a => {
      if (a.prop) {
        a.spr.setDepth(a.spr.y);
        if (a.glow && a.glow.active) a.glow.setPosition(a.spr.x, a.spr.y - 6).setVisible(a.spr.visible);
        for (const id of a.riders) {        // inside: just behind the front bars, sitting on the bed
          const r = actors[id];
          if (!r) continue;
          r.spr.setPosition(a.spr.x, a.spr.y - (a.prop === "cagecart" ? 8 : 4)).setAlpha(a.spr.alpha).setVisible(a.spr.visible);
          sync(r);
          r.spr.setDepth(a.spr.y - .5);
          if (r.seat) r.seat.setDepth(a.spr.y - .5);
        }
        return;
      }
      if (a.horse) {
        const dir = a.dir || "down";
        a.seat.setTexture(Items.riderTexture(scene, a.who, dir));
        for (const o of [a.horse, a.seat]) o.setVisible(a.spr.visible).setAlpha(a.spr.alpha);
        Items.place(a.horse, a.seat, a.head, a.spr.x, a.spr.y, dir);
      }
      a.spr.setDepth(a.spr.y);
    };
    const actor = (id, at, face) => {
      let a = actors[id];
      const who = cs.cast[id].who;
      if (!a && cs.cast[id].prop) {
        a = actors[id] = { id, prop: cs.cast[id].prop, riders: [], spr: propSprite(cs.cast[id].prop) };
      }
      if (a && a.prop) {
        const [x, y] = px(at);
        a.spr.setPosition(x, y).setVisible(true).setAlpha(1);
        if (night && FIRES.includes(a.prop) && !(a.glow && a.glow.active)) a.glow = glow(a.spr);
        sync(a);
        return a;
      }
      if (!a) {
        if (who === "horse" && Items) {
          const coat = herdCoat(id);
          a = actors[id] = { id, who, coat, beast: true, spr: Items.horse(scene, coat, 0, 0) };
        } else {
          scene.hero(who);
          a = actors[id] = { id, who, spr: scene.add.sprite(0, 0, `h-${who}-down-0`).setOrigin(.5, 1) };
        }
      }
      const [x, y] = px(at);
      a.spr.setPosition(x, y).setVisible(true).setAlpha(1).setAngle(0).clearTint();
      mount(a);
      if (face) look(a, face);
      return a;
    };
    const look = (a, dir) => {
      if (a.prop) return;
      a.dir = dir;
      if (a.beast) return Items.pose(a.spr, a.coat, dir, false);
      a.spr.anims.stop(); a.spr.setTexture(`h-${a.who}-${dir}-0`);
      if (a.horse) { Items.pose(a.horse, a.coat, dir, false); sync(a); }
    };
    const stride = (a, dir, fast) => {
      if (a.prop) return;
      if (a.beast) return Items.pose(a.spr, a.coat, dir, true);
      if (a.horse) { Items.pose(a.horse, a.coat, dir, true); return sync(a); }   // the horse walks, the rider sits
      a.spr.anims.play(`h-${a.who}-${dir}`, true);
      a.spr.anims.msPerFrame = fast ? 85 : 135;
      if (a.horse) Items.pose(a.horse, a.coat, dir, true);
    };
    const walk = async (b) => {
      const a = actors[b.actor];
      if (!a) return;
      const pts = b.path.map(px), speed = b.speed * T;
      if (a.posed && a.posed !== "drunk") unpose(a);   // up off the knees before walking
      for (let i = 1; i < pts.length && !skip; i++) {
        const [x0, y0] = [a.spr.x, a.spr.y], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0);
        if (d < .5) continue;
        const dir = Math.abs(x1 - x0) > Math.abs(y1 - y0) ? (x1 > x0 ? "right" : "left") : (y1 > y0 ? "down" : "up");
        a.dir = dir;
        stride(a, dir, b.speed > 5);
        await tween({ targets: a.spr, x: x1, y: y1, duration: d / speed * 1000 / (a.horse ? 1.3 : 1), onUpdate: () => sync(a) });
      }
      const last = pts[pts.length - 1];
      a.spr.setPosition(last[0], last[1]);
      sync(a);
      look(a, a.dir || "down");
    };
    const fade = ids => Promise.all(ids.filter(id => actors[id]).map(id =>
      tween({ targets: actors[id].spr, alpha: 0, duration: 350, onUpdate: () => sync(actors[id]) }).then(() => { actors[id].spr.setVisible(false); sync(actors[id]); })));
    const pan = (to, ms = 350) => {
      if (!to) return Promise.resolve();
      const [x, y] = px(to);
      return new Promise(r => { if (skip) return r(); cam.pan(x, y - 8, ms, "Sine.easeInOut", true, (c, p) => { if (p === 1) r(); }); });
    };

    // ---- props, poses, emotes, gifts, mood ----
    const KIT_PROPS = { table: ["furn.table", "camp.table"], winejars: ["furn.jar", "furn.barrel"], rack: ["furn.rack"],
      fire: ["camp.firepit", "camp.cookfire"], tent: ["building.tent", "building.hut", "building.house"],
      gate: ["building.gate", "building.moongate"], desk: ["furn.desk", "furn.table", "camp.table"],
      hall: ["building.hall", "building.inn", "building.house"] };
    const propSprite = kind => {
      const box = scene.add.container(0, 0), P = scene.textures.get("tk-props");
      const put = (tex, frame, dx = 0, dy = 0) => box.add(scene.add.image(dx, dy, tex, frame).setOrigin(.5, 1));
      if (P.has(kind)) put("tk-props", kind);
      else {
        const k = (KIT_PROPS[kind] || []).find(k => scene.kit && scene.kit.kinds[k]);
        if (k) {
          const tex = `kit-${scene.kit.kinds[k][0][0]}`, fr = `${k}#0`;
          if (kind === "winejars") { put(tex, fr, -6, 0); put(tex, fr, 6, 0); if (P.has("gourd")) put("tk-props", "gourd", 0, 2); }
          else put(tex, fr);
        } else box.add(scene.add.rectangle(0, 0, 16, 10, 0x8a5a3a).setOrigin(.5, 1));
      }
      return box;
    };
    const body = a => a.horse ? a.seat : a.spr;                  // what poses bend: the rider on a horse
    const top = a => body(a).getBounds().top;
    const unpose = a => {
      if (a.poseTw) { a.poseTw.stop(); a.poseTw = null; }
      const t = body(a);
      if (!a.fallen) { t.setAngle(0); if (!a.horse) t.setScale(1); t.clearTint(); }
      a.posed = null;
    };
    const hold = (a, frame, ms) => {                             // an icon held overhead, rising with a glint
      if (!scene.textures.get("tk-props").has(frame)) return Promise.resolve();
      const i = scene.add.image(body(a).x, top(a) - 1, "tk-props", frame).setOrigin(.5, 1).setDepth(1e5);
      fx.push(i);
      return tween({ targets: i, y: i.y - 4, duration: 220, ease: "Back.easeOut" }).then(() => wait(ms)).then(() => i.destroy());
    };
    const hop = a => tween({ targets: a.spr, y: a.spr.y - 5, duration: 130, yoyo: true, repeat: 1, ease: "Quad.easeOut", onUpdate: () => sync(a) });
    const lasting = (a, pose) => {                               // the end state of a pose that lasts
      const t = body(a), right = a.dir !== "left";
      unpose(a);
      a.posed = pose;
      if (pose === "bow") t.setAngle(a.dir === "down" || a.dir === "up" ? 0 : right ? 14 : -14).setScale(1, a.dir === "down" ? .9 : 1);
      else if (pose === "kneel") t.setScale(1, .8);
      else if (pose === "sit") t.setScale(1, .86);
      else if (pose === "sleep") t.setAngle(right ? 90 : -90);
      else if (pose === "drunk") {
        t.setTint(0xffd0c4);
        a.poseTw = scene.tweens.add({ targets: t, angle: { from: -8, to: 8 }, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      } else a.posed = null;                                     // stand
    };
    const pose = async (a, p, i) => {
      if (a.prop || a.beast) return;
      await wait(i * 70);
      if (p === "drink") {
        const t = body(a), side = a.dir === "left" ? -1 : 1;
        if (!scene.textures.get("tk-props").has("gourd")) return;
        const g = scene.add.image(t.x + side * 5, t.y - 8, "tk-props", "gourd").setScale(.6).setDepth(1e5);
        fx.push(g);
        await tween({ targets: g, y: top(a) + 6, angle: -side * 60, duration: 260, yoyo: true, hold: 260, repeat: 1 });
        g.destroy();
      } else if (p === "cheer") await hop(a);
      else if (p === "raise") await Promise.all([hop(a), hold(a, a.item ? `item.${a.item}` : "", 500)]);
      else lasting(a, p);
    };
    const emote = (a, icon) => {
      const f = `emote.${icon}`;
      if (!scene.textures.get("tk-props").has(f)) return;
      const e = scene.add.image(body(a).x + 4, top(a) - 1, "tk-props", f).setOrigin(.5, 1).setDepth(1e5).setScale(0);
      fx.push(e);
      if (icon === "zzz") scene.tweens.add({ targets: e, y: e.y - 3, duration: 600, yoyo: true, repeat: 1 });
      scene.tweens.add({ targets: e, scale: 1, duration: 140, ease: "Back.easeOut" });
      scene.tweens.add({ targets: e, alpha: 0, delay: 1700, duration: 250, onComplete: () => e.destroy() });
    };
    const give = async b => {
      const g = actors[b.from], r = actors[b.to];
      for (const t of b.face || []) if (actors[t.actor]) look(actors[t.actor], t.dir);
      await pan(b.camera, 300);
      if (r) r.item = b.item;
      const f = `item.${b.item}`;
      if (g && r && scene.textures.get("tk-props").has(f)) {
        const i = scene.add.image(body(g).x, top(g), "tk-props", f).setOrigin(.5, 1).setDepth(1e5);
        fx.push(i);
        await tween({ targets: i, y: i.y - 5, duration: 200, ease: "Back.easeOut" });
        await tween({ targets: i, x: body(r).x, y: top(r) - 3, duration: 380, ease: "Sine.easeInOut" });
        i.destroy();
        WorldFx.play(scene, "sparkle", [body(r).x, body(r).y], fx);
        await Promise.all([hop(r), hold(r, f, 600)]);
      }
      if (Items) { Items.gain(scene, b.item); Object.values(actors).forEach(mount); }
    };
    let dark = null;
    const mood = (on, ms) => {
      if (on && !dark) {
        if (!scene.textures.exists("tk-vignette")) {
          const c = scene.textures.createCanvas("tk-vignette", 2 * W, 2 * H), g = c.context;
          const grd = g.createRadialGradient(W, H, H * .2, W, H, W * .6);
          grd.addColorStop(0, "rgba(10,6,24,0.18)"); grd.addColorStop(.6, "rgba(10,6,24,0.6)"); grd.addColorStop(1, "rgba(10,6,24,0.92)");
          g.fillStyle = grd; g.fillRect(0, 0, 2 * W, 2 * H); c.refresh();
        }
        // fixed to the screen; the camera's zoom would scale it, so it is scaled back
        dark = scene.add.image(W / 2, H / 2, "tk-vignette").setScrollFactor(0).setDepth(9e5).setAlpha(0).setScale(zoom0 / cam.zoom);
        fx.push(dark);
        if (ms) scene.tweens.add({ targets: dark, alpha: 1, duration: ms }); else dark.setAlpha(1);
      } else if (!on && dark) {
        const d = dark; dark = null;
        if (ms) scene.tweens.add({ targets: d, alpha: 0, duration: ms, onComplete: () => d.setVisible(false) }); else d.setVisible(false);
      }
    };
    // light: the whole scene tinted for the time of day; at night fires and lamps glow
    const LIGHT = { night: 0x46559c, dusk: 0xf0c0a0, dawn: 0xd8c8e8, storm: 0x80868e };
    let shade = null, glows = [], night = false;
    const glow = o => {                                          // warm light round a fire or a lamp
      if (!scene.textures.exists("tk-glow")) {
        const c = scene.textures.createCanvas("tk-glow", 64, 64), g = c.context, grd = g.createRadialGradient(32, 32, 2, 32, 32, 32);
        grd.addColorStop(0, "rgba(255,190,90,0.9)"); grd.addColorStop(.4, "rgba(255,150,60,0.4)"); grd.addColorStop(1, "rgba(255,120,40,0)");
        g.fillStyle = grd; g.fillRect(0, 0, 64, 64); c.refresh();
      }
      const g = scene.add.image(o.x, o.y - 6, "tk-glow").setDepth(9.1e4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.8);
      scene.tweens.add({ targets: g, scale: 1.12, alpha: .65, duration: 700 + Math.random() * 300, yoyo: true, repeat: -1 });
      fx.push(g); glows.push(g);
      return g;
    };
    const FIRES = ["fire", "forge"];
    const light = (tint, ms) => {
      const c = LIGHT[tint] || (/^#[0-9a-f]{6}$/i.test(tint || "") ? parseInt(tint.slice(1), 16) : null);
      const old = shade, oldGlows = glows;
      shade = null; glows = [];
      const out = o => ms ? scene.tweens.add({ targets: o, alpha: 0, duration: ms, onComplete: () => o.destroy() }) : o.destroy();
      if (old) out(old);
      oldGlows.forEach(out);
      night = tint === "night";
      if (c == null) return;
      // fixed to the screen and big enough to cover it at any zoom; multiplied over the map and the cast, under bubbles
      shade = scene.add.rectangle(W / 2, H / 2, W * 3, H * 3, c).setScrollFactor(0).setDepth(9e4).setBlendMode(Phaser.BlendModes.MULTIPLY);
      fx.push(shade);
      if (night) {
        scene.children.list.filter(o => o.type === "Image" && o.frame && /^(camp\.firepit|camp\.cookfire|lamp\.post|furn\.hearth)#/.test(o.frame.name)).forEach(glow);
        Object.values(actors).filter(a => a.prop && FIRES.includes(a.prop)).forEach(a => { a.glow = glow(a.spr); });
      }
      const all = [shade, ...glows];
      if (ms) all.forEach(o => { const a = o.alpha; o.setAlpha(0); scene.tweens.add({ targets: o, alpha: a, duration: ms }); });
    };
    const board = (b, ms) => {
      const r = actors[b.actor] || actor(b.actor, b.at), p = actors[b.prop];
      if (!p) return Promise.resolve();
      if (!p.riders.includes(b.actor)) p.riders.push(b.actor);
      look(r, "down");
      if (!ms) return sync(p), Promise.resolve();
      const [x, y] = [p.spr.x, p.spr.y - (p.prop === "cagecart" ? 8 : 4)];
      return tween({ targets: r.spr, x, y, duration: ms, onUpdate: () => sync(r) }).then(() => sync(p));
    };
    const unboard = (b, ms) => {
      const r = actors[b.actor];
      if (!r) return Promise.resolve();
      for (const p of Object.values(actors)) if (p.prop) p.riders = p.riders.filter(id => id !== b.actor);
      const [x, y] = px(b.to);
      if (!ms) { r.spr.setPosition(x, y); sync(r); return Promise.resolve(); }
      return tween({ targets: r.spr, x, y, duration: ms, onUpdate: () => sync(r) }).then(() => { r.spr.setDepth(r.spr.y); sync(r); });
    };

    const run = async b => {
      if (skip) return;
      switch (b.do) {
        case "cut": {
          cam.fadeOut(180); await wait(190);
          for (const p of b.place) actor(p.actor, p.at, p.face);
          if (b.light) light(b.light, 0);
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
          lastLine = b;
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
          await tween({ targets: a.spr, x: a.spr.x + dx * 7, duration: 90, yoyo: true, ease: "Quad.easeOut", onUpdate: () => sync(a) });
          cam.shake(120, .006);
          break;
        }
        case "fall":
          await Promise.all(b.actors.filter(id => actors[id]).map((id, i) => {
            const s = actors[id].spr;
            unpose(actors[id]); actors[id].fallen = true;
            return wait(i * 60).then(() => { s.setTint(0xb0a090); return tween({ targets: s, angle: (i % 2 ? -1 : 1) * 90, y: s.y - 2, duration: 260, ease: "Quad.easeIn" }); });
          }));
          await wait(200);
          break;
        case "fade": await fade(b.actors); break;
        case "pose": await Promise.all(b.actors.filter(id => actors[id]).map((id, i) => pose(actors[id], b.pose, i))); break;
        case "emote": b.actors.filter(id => actors[id]).forEach(id => emote(actors[id], b.icon)); await wait(700); break;
        case "give": await give(b); break;
        case "face": for (const t of b.turns) if (actors[t.actor]) look(actors[t.actor], t.dir); break;
        case "board": await board(b, 260); break;
        case "unboard": await unboard(b, 260); break;
        case "zoom":
          cam.zoomTo(zoom0 * b.z, b.ms, "Sine.easeInOut");
          if (dark) scene.tweens.add({ targets: dark, scale: 1 / b.z, duration: b.ms, ease: "Sine.easeInOut" });
          await wait(b.ms);
          break;
        case "shake": cam.shake(350, .01); await wait(350); break;
        case "mood": mood(b.dark, 600); await wait(300); break;
        case "light": light(b.tint, b.ms); await wait(Math.min(b.ms, 600)); break;
        case "fx": await WorldFx.play(scene, b.name, px(b.at), fx); break;
        case "wait": await wait(b.ms); break;
        case "party": break;                       // applied by the world when the scene ends
        case "gain":                                  // a gift: saved now, and a mount seats the party at once
          if (Items) { Items.gain(scene, b.item); Object.values(actors).forEach(mount); }
          break;
      }
    };

    // a beat's end state at once, for fast-forwarding to the problem
    const instant = b => {
      switch (b.do) {
        case "cut": case "appear": for (const p of b.place) actor(p.actor, p.at, p.face); if (b.light) light(b.light, 0); break;
        case "light": light(b.tint, 0); break;
        case "together": b.beats.forEach(instant); break;
        case "walk": { const a = actors[b.actor]; if (a) { const [x, y] = px(b.path[b.path.length - 1]); a.spr.setPosition(x, y); sync(a); } break; }
        case "line": lastLine = b; for (const t of b.face || []) if (actors[t.actor]) look(actors[t.actor], t.dir); break;
        case "fall": b.actors.filter(id => actors[id]).forEach((id, i) => { unpose(actors[id]); actors[id].fallen = true; actors[id].spr.setTint(0xb0a090).setAngle((i % 2 ? -1 : 1) * 90); }); break;
        case "pose": if (!["drink", "cheer", "raise"].includes(b.pose)) b.actors.filter(id => actors[id] && !actors[id].prop).forEach(id => lasting(actors[id], b.pose)); break;
        case "face": for (const t of b.turns) if (actors[t.actor]) look(actors[t.actor], t.dir); break;
        case "board": board(b, 0); break;
        case "unboard": unboard(b, 0); break;
        case "give":
          for (const t of b.face || []) if (actors[t.actor]) look(actors[t.actor], t.dir);
          if (actors[b.to]) actors[b.to].item = b.item;
          if (Items) { Items.gain(scene, b.item); Object.values(actors).forEach(mount); }
          break;
        case "zoom": cam.setZoom(zoom0 * b.z); if (dark) dark.setScale(1 / b.z); break;
        case "mood": mood(b.dark, 0); break;
        case "fade": b.actors.filter(id => actors[id]).forEach(id => { actors[id].spr.setVisible(false); sync(actors[id]); }); break;
        case "gain": if (Items) { Items.gain(scene, b.item); Object.values(actors).forEach(mount); } break;
      }
    };

    for (const b of cs.beats) {
      if (b.do === "problem") {
        if (skip) {                               // fast-forwarded here: frame the scene, and say the last line again on a retry
          const ff = opts.ffToProblem;
          skip = false;
          const to = lastLine && lastLine.camera;
          if (to) { const [x, y] = px(to); cam.centerOn(x, y - 8); }
          if (ff && lastLine) await run(lastLine);
        }
        if (opts.onProblem && !(await opts.onProblem())) { left = true; break; }
        solved = true;
        continue;
      }
      if (skip) { if (solved) break; instant(b); continue; }
      await run(b);
    }

    // back to the world: the leader stands where the scene left him
    for (const t of timers) t.remove(false);
    scene.tweens.killTweensOf(Object.values(actors).map(a => a.spr));
    for (const a of Object.values(actors)) { if (a.poseTw) a.poseTw.stop(); a.spr.destroy(); if (a.horse) { a.horse.destroy(); a.seat.destroy(); a.head.destroy(); } }
    for (const o of fx) o.destroy();
    skipBtn.remove();
    bars.forEach(b => b.destroy());
    cam.resetFX();
    cam.setZoom(zoom0);
    if (!left && cs.end && cs.end.leader) { const [x, y] = px(cs.end.leader); scene.player.setPosition(x, y); }
    scene.player.facing = "down";
    hidden.forEach(s => s.setVisible(true));
    for (const n of scene.npcs) if (n.until && !n.spr.body.enable) n.spr.setVisible(false);
    scene.trail = Array(60).fill({ x: scene.player.x, y: scene.player.y, f: "down" });
    cam.startFollow(scene.player, true, .15, .15);
    ui.busy = realBusy;
    scene.cine = null;
    const next = left ? opts.onLeave : done;
    next && next();
  },

  // the prop atlas (props, emote bubbles, gift icons), loaded once per game
  load(scene) {
    if (scene.textures.exists("tk-props")) return Promise.resolve();
    return new Promise(res => {
      scene.load.json("tk-props-json", "assets/tk/props.json?v=1");
      scene.load.image("tk-props", "assets/tk/props.png?v=1");
      scene.load.once("complete", () => {
        const t = scene.textures.get("tk-props"), j = scene.cache.json.get("tk-props-json");
        if (t && j) for (const [n, [x, y, w, h]] of Object.entries(j.frames)) t.add(n, 0, x, y, w, h);
        res();
      });
      scene.load.start();
    });
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
