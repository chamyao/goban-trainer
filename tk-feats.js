/* ---- Three Kingdoms: the Lady Sun book's ways of playing (tk-world.js calls these) ----

   Sealed pouches: an item of kind "sealed" ({name, zh, opens, opens_zh, plan, plan_zh}) is carried shut. The bag
   (the header's 行囊 Bag) shows when it may be opened; a scene step ["open", key] opens it: a card with the plan,
   and from then on (once that beat is cleared) the bag shows the plan.

   The loud town: a townsperson with "gossip" ({"tells": [ids], "in_beats": [keys]}) is told the news when you talk
   to them; told, they walk to each neighbour they "tells" and tell them in turn. Props with "told": id show only once
   that person knows (red hangings on a house). A spot with "fires": "told:<id>" starts its beat by itself once that
   holds (the news reaches Lady Wu's gate). Who knows is kept in the world state ("told").

   Face them down: blockers with "yield" ({"group", "reach" cells, "line": [lines], "aside": [dx, dy] cells,
   "back_to": spot, "caught": [lines]}). Standing still within reach, facing them (and from a carriage, with the
   curtain up), they step aside one by one, each with his line. Coming at one of them while moving is a catch:
   back to "back_to", the group back in place. Who has stepped aside is kept ("yielded").

   The carriage: an item of kind "carriage" ({name, zh, rider}) carries its rider outdoors in the props' carriage,
   at a walk; C (or the header's 卷帘 Curtain) raises and lowers the curtain. Curtain down, she is hidden; up, her
   face shows at the window. */

const WorldFeats = {
  /* ---------- the bag and the sealed pouches ---------- */
  // opened once a beat whose scene opens it is cleared
  opened(w, key) {
    return (w.nodes || []).some(n => TK.cleared(n.key) && (((n.scene && w.scenes && w.scenes[n.scene]) || {}).steps || []).some(s => s[0] === "open" && s[1] === key));
  },
  hasBag(w) { return typeof WorldItems !== "undefined" && WorldItems.owned(w).length > 0; },
  bag(w) {
    if (typeof WorldItems === "undefined") return;
    document.querySelector(".tk-bag")?.remove();
    const d = WorldItems.defs(w), keys = WorldItems.owned(w);
    const el = document.createElement("div");
    el.className = "tk-bag";
    el.innerHTML = `<div class="tk-bag-box"><h3><span lang="zh-CN">行囊</span> Bag</h3><ul></ul><button type="button">关闭 Close</button></div>`;
    const ul = el.querySelector("ul");
    for (const k of keys) {
      const it = d[k] || {}, li = document.createElement("li");
      const sealed = it.kind === "sealed", open = sealed && this.opened(w, k);
      li.innerHTML = `<b lang="zh-CN"></b> <span class="n"></span><div class="tk-bag-note"></div>`;
      li.querySelector("b").textContent = it.zh || "";
      li.querySelector(".n").textContent = it.name || k;
      const note = li.querySelector(".tk-bag-note");
      if (sealed && !open) {
        note.textContent = `封着。${it.opens_zh || ""} Sealed. ${it.opens || ""}`;
        li.classList.add("sealed");
        li.onclick = () => { note.classList.remove("flash"); void note.offsetWidth; note.classList.add("flash"); };   // tapped early: it stays shut
      } else if (sealed) {
        note.textContent = `${it.plan_zh || ""} ${it.plan || ""}`;
        li.classList.add("opened");
      } else if (it.kind === "carriage") note.textContent = "按 C 卷帘/放帘 · C raises or lowers the curtain";
      ul.append(li);
    }
    if (!keys.length) ul.innerHTML = `<li><span lang="zh-CN">空空如也</span> Nothing yet.</li>`;
    const back = this.focusBack(), shut = () => { el.remove(); back(); };
    el.querySelector("button").onclick = shut;
    el.onclick = e => { if (e.target === el) shut(); };
    document.body.append(el);
  },
  // keys go to the game's frame (Phaser's keyboard target): after a card or the bag, give it the focus back
  focusBack() {
    const host = document.querySelector(".town-ui")?.parentElement || null;
    return () => { if (host) { if (!host.hasAttribute("tabindex")) host.setAttribute("tabindex", "-1"); host.focus({ preventScroll: true }); } };
  },
  // the scene step ["open", key]: the pouch's card, read before the scene goes on
  openCard(w, key) {
    const it = (typeof WorldItems !== "undefined" && WorldItems.defs(w)[key]) || {};
    return new Promise(done => {
      const el = document.createElement("div");
      el.className = "tk-pouch";
      el.innerHTML = `<div class="tk-pouch-card"><div class="t"><b lang="zh-CN"></b> <span></span></div><p class="zh" lang="zh-CN"></p><p class="en"></p><button type="button">▸</button></div>`;
      el.querySelector(".t b").textContent = `拆开${it.zh || "锦囊"}`;
      el.querySelector(".t span").textContent = `Opening ${it.name || "the pouch"}`;
      el.querySelector(".zh").textContent = it.plan_zh || "";
      el.querySelector(".en").textContent = it.plan || "";
      const back = this.focusBack(), close = () => { el.remove(); back(); done(); };
      el.querySelector("button").onclick = close;
      el.onclick = e => { if (e.target === el) close(); };
      document.body.append(el);   // over everything, the canvas included
    });
  },

  /* ---------- the world: set up, each frame ---------- */
  init(scene) {
    scene.st.told = scene.st.told || [];
    scene.st.yielded = scene.st.yielded || [];
    scene.gossipWalks = [];
    scene.carriageImg = scene.curtainImg = null; scene.propsAsked = false;   // (the scene object outlives a change of place; its images do not)
    this.applyTold(scene);
    for (const n of scene.npcs) if (n.yield && scene.st.yielded.includes(n.id)) this.asideNow(scene, n);
    const key = () => { if (!scene.ui.busy() && !scene.cine && !scene.leaving) this.curtain(scene); };
    scene.input.keyboard.on("keydown-C", key);
  },
  // the beat that was open when this happened (replay forgets what happened at or after the beat replayed from)
  at(scene, id) { const q = scene.nextMain(); (scene.st.featAt || (scene.st.featAt = {}))[id] = q ? q.node : null; },
  // replay from key: what happened in it or after is undone (st.told, st.yielded); the curtain down, no cutaway pending
  rewind(st, later) {
    const at = st.featAt || {}, keep = id => !(id in at) || !later.has(at[id]);
    st.told = (st.told || []).filter(keep); st.yielded = (st.yielded || []).filter(keep);
    st.curtain = false; st.cutReturn = null;
  },
  // an untold relay while the news is going round: not someone to talk to
  silent(scene, n) { return !!(n.gossip && n.gossip.relay && !this.told(scene, n.id) && this.gossipActive(scene, n)); },
  // who the news reaches from n, along the tells
  reaches(scene, n, target) {
    const seen = new Set(), q = [n.id];
    while (q.length) { const id = q.shift(); if (id === target) return true; if (seen.has(id)) continue; seen.add(id);
      const m = scene.npcs.find(x => x.id === id); for (const t of (m && m.gossip && m.gossip.tells) || []) q.push(t); }
    return false;
  },
  told(scene, id) { return !!(scene.st.told || []).includes(id); },
  applyTold(scene) {
    for (const p of scene.toldProps || []) if (p.img) p.img.setVisible(this.told(scene, p.id));
  },
  gossipActive(scene, n) {
    const g = n.gossip;
    return !!g && (!g.in_beats || g.in_beats.some(k => { const q = scene.region.quests.find(x => x.node === (/^\d+-/.test(k) ? k : `${scene.w.n}-${k}`)); return q && scene.available(q); }));
  },
  // talking to a townsperson with the news to tell: they know now, and pass it on
  tell(scene, n) {
    if (!this.gossipActive(scene, n) || this.told(scene, n.id)) return false;
    if (n.gossip.relay) return true;   // a relay hears it only from a neighbour (and isn't a talk target till then: tk-world pick)
    const lines = n.say.length ? worldLines(n.say) : [["n", "“A wedding? Liu Bei of Jingzhou, to the Marquis's sister? I must tell the neighbours!”", "“刘皇叔要娶吴侯的妹妹？我得告诉街坊去！”"]];
    scene.talk(lines, () => this.mark(scene, n));
    return true;
  },
  // "传开消息 Spread the news" (the goal box, apo110): the whole town hears it at once instead of person by person:
  // house after house the hangings go up along the chains, then whoever the beat waits on (told:<id>) hears it last
  spreadAll(scene, target) {
    if (scene.spreading) return;
    const gs = scene.npcs.filter(n => n.gossip && this.gossipActive(scene, n));
    const tellsOf = new Set(gs.flatMap(n => (n.gossip.tells || [])));
    const order = [], seen = new Set(), queue = gs.filter(n => !tellsOf.has(n.id));   // the chains' heads first, then down each
    while (queue.length) { const n = queue.shift(); if (seen.has(n.id)) continue; seen.add(n.id); order.push(n.id);
      for (const id of n.gossip.tells || []) { const m = scene.npcs.find(x => x.id === id); if (m && m.gossip) queue.push(m); else if (!seen.has(id)) { seen.add(id); order.push(id); } } }
    for (const n of gs) if (!seen.has(n.id)) order.push(n.id);
    if (target && !order.includes(target)) order.push(target);
    const todo = order.filter(id => !this.told(scene, id));
    scene.spreading = true;
    scene.talk([["n", "Zhao Yun's men spread the word through Nanxu: Liu Bei of Jingzhou is to marry the Marquis's sister. Red hangings go up, house after house.",
      "赵云的人在南徐城里四处传话：荆州刘皇叔要娶吴侯的妹妹。家家户户挂起了红绸。"]], () => {
      todo.forEach((id, i) => scene.time.delayedCall(260 * i, () => {
        if (!this.told(scene, id)) { scene.st.told.push(id); this.at(scene, id); this.applyTold(scene); }
        if (i === todo.length - 1) { scene.spreading = false; scene.save(); this.fires(scene); scene.setGoal(); }
      }));
      if (!todo.length) { scene.spreading = false; scene.setGoal(); }
    });
  },
  mark(scene, n) {
    if (this.told(scene, n.id)) return;
    scene.st.told.push(n.id); this.at(scene, n.id); scene.save();
    this.applyTold(scene);
    for (const id of (n.gossip && n.gossip.tells) || []) {
      const m = scene.npcs.find(x => x.id === id);
      if (m && !this.told(scene, m.id)) scene.gossipWalks.push({ n, to: m, t: 900 + Math.random() * 600 });
    }
    this.fires(scene);
  },
  // a spot that starts its own beat once the news has reached someone ("fires": "told:<id>")
  fires(scene) {
    for (const s of Object.values(scene.spots)) {
      if (!s.fires || s.fired || !scene.cond(s.fires)) continue;
      const q = scene.region.quests.find(x => x.node === s.node);
      if (!q || !scene.available(q) || scene.ui.busy() || scene.cine || scene.cutawayNode(q.node)) continue;   // (a cutaway waits on its own "cutaway" condition)
      s.fired = true;
      scene.approach(q, s);
    }
  },
  step(scene, dt) {
    if (scene.ui.busy() || scene.cine || scene.leaving) return;
    // the news on its way: the teller walks over, tells, and walks home
    for (const g of scene.gossipWalks.slice()) {
      if ((g.t -= dt) > 0) continue;
      scene.gossipWalks.splice(scene.gossipWalks.indexOf(g), 1);
      const { n, to } = g, at = { x: to.spr.x + (n.spr.x < to.spr.x ? -14 : 14), y: to.spr.y }, was = n.wander;
      n.wander = false; n.spr.setVelocity && n.spr.setVelocity(0);
      // by the streets (findPath), not through a house, and in a hurry (Places: about 80 px/s)
      const there = this.pathFor(scene, n.spr, at, to), back = () => this.walkAlong(scene, n.spr, this.pathFor(scene, n.spr, n.home, null), 60, () => { n.wander = was; });
      this.walkAlong(scene, n.spr, there, 80, () => {
        this.bubble(scene, n.spr, "!");
        this.mark(scene, to);
        this.caption(scene, to);   // the one told says it aloud, over his head, without stopping play
        scene.time.delayedCall(700, back);
      });
    }
    this.fires(scene);
    this.yieldStep(scene, dt);
    this.carriageStep(scene);
  },
  pathFor(scene, spr, to, skip) {
    const p = scene.findPath ? scene.findPath(spr.x, spr.y - 3, to.x, to.y - 3, skip) : null;
    return (p || [{ x: to.x, y: to.y - 3 }]).map(q => ({ x: q.x, y: q.y + 3 }));
  },
  walkAlong(scene, spr, pts, speed, done) {
    const next = () => {
      const q = pts.shift();
      if (!q) return done && done();
      const d = Math.hypot(q.x - spr.x, q.y - spr.y);
      scene.tweens.add({ targets: spr, x: q.x, y: q.y, duration: Math.max(40, d / speed * 1000), onUpdate: () => spr.setDepth(spr.y), onComplete: next });
    };
    next();
  },
  // a floating line over someone (a relay told by his neighbour): his first say line, Chinese over English, gone in a few seconds
  caption(scene, n) {
    const l = worldLines(n.say || [])[0];
    if (!l) return;
    const en = l[0] === "say" ? l[2] : l[1], zh = l[0] === "say" ? l[3] : l[2];
    const txt = [zh, en].filter(Boolean).join("\n");
    if (!txt) return;
    const t = scene.add.text(n.spr.x, n.spr.y - n.spr.height - 6, txt, { fontFamily: '"Noto Serif SC", serif', fontSize: "18px", color: "#fff6dc", align: "center",
      backgroundColor: "rgba(40,24,16,.82)", padding: { x: 6, y: 3 }, wordWrap: { width: 360 } }).setOrigin(.5, 1).setScale(.4).setResolution(2).setDepth(9e4 + 4);
    scene.tweens.add({ targets: t, y: t.y - 6, delay: 2600, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  },
  bubble(scene, spr, text) {
    const t = scene.add.text(spr.x, spr.y - spr.height - 4, text, { fontFamily: "sans-serif", fontSize: "10px", color: "#c0392b", fontStyle: "bold" }).setOrigin(.5, 1).setDepth(9e4 + 3);
    scene.tweens.add({ targets: t, y: t.y - 8, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  },

  /* ---------- face them down ---------- */
  asideNow(scene, n) {
    const T = scene.tw || 16, a = n.yield.aside || [1.5, 0];
    n.spr.setPosition(n.home.x + a[0] * T, n.home.y + a[1] * T).setDepth(n.home.y + a[1] * T);
    if (n.spr.body) n.spr.body.enable = false;
    n.wander = false; n.stoodAside = true;
  },
  yieldStep(scene, dt) {
    const P = scene.player, T = scene.tw || 16;
    if (!P || scene.caught) return;
    const still = !P.body || P.body.speed < 4;
    const live = scene.npcs.filter(n => n.yield && n.spr.visible && !n.stoodAside);
    if (!live.length) return;
    const near = live.map(n => ({ n, d: Math.hypot(n.spr.x - P.x, n.spr.y - P.y) })).sort((a, b) => a.d - b.d)[0];
    const reach = (near.n.yield.reach || 4) * T;
    // pushing on at them: a catch
    if (!still && near.d < 1.4 * T) return this.caughtAt(scene, near.n);
    if (near.d > reach || !still) { scene.faceT = 0; return; }
    // facing them, and seen: from a carriage only with the curtain up
    const dx = near.n.spr.x - P.x, dy = near.n.spr.y - P.y, way = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    if (P.facing !== way) { scene.faceT = 0; return; }
    if (typeof WorldItems !== "undefined" && this.inCarriage(scene) && !this.curtainUp(scene)) {
      if (!scene.curtainHinted) { scene.curtainHinted = true; WorldItems.notice(scene, { zh: "卷起车帘，让他们看见你（C）", name: "Raise the curtain so they see you (C)" }, true); }
      return;
    }
    scene.faceT = (scene.faceT || 0) + dt;
    if (scene.faceT < 1200) return;
    scene.faceT = 0;
    // the nearest of the group steps aside, with his line
    const group = live.filter(n => n.yield.group === near.n.yield.group).sort((a, b) => Math.hypot(a.spr.x - P.x, a.spr.y - P.y) - Math.hypot(b.spr.x - P.x, b.spr.y - P.y));
    const n = group[0], a = n.yield.aside || [1.5, 0];
    n.stoodAside = true;
    if (n.spr.body) n.spr.body.enable = false;
    n.wander = false;
    scene.st.yielded.push(n.id); this.at(scene, n.id); scene.save(); scene.grid = null;
    scene.tweens.add({ targets: n.spr, x: n.home.x + a[0] * T, y: n.home.y + a[1] * T, duration: 600, onUpdate: () => n.spr.setDepth(n.spr.y) });
    if (n.yield.line && n.yield.line.length) scene.talk(worldLines(n.yield.line));
    if (live.length === 1) { scene.refreshStory(); scene.setGoal && scene.setGoal(); }
  },
  async caughtAt(scene, n) {
    scene.caught = true; scene.faceT = 0;
    const P = scene.player, y = n.yield;
    P.setVelocity(0); scene.walk = null; scene.auto = null;
    await new Promise(r => scene.talk(y.caught && y.caught.length ? worldLines(y.caught) : [["n", "They close ranks. “No one passes!” You fall back.", "将士们并排挡住：“谁也不许过！”你只好退回。"]], r));
    scene.cameras.main.fadeOut(300);
    await new Promise(r => scene.cameras.main.once("camerafadeoutcomplete", r));
    // the group back in place
    for (const m of scene.npcs) if (m.yield && m.yield.group === y.group) {
      m.stoodAside = false; if (m.spr.body) m.spr.body.enable = true;
      m.spr.setPosition(m.home.x, m.home.y).setDepth(m.home.y);
      scene.st.yielded = scene.st.yielded.filter(id => id !== m.id);
    }
    scene.save(); scene.grid = null;
    const to = (y.back_to && (scene.spots[y.back_to] || scene.refs[y.back_to] || scene.entries[y.back_to])) || scene.entries[scene.from || ""] || scene.entries[""];
    P.setPosition(to.x, to.y);
    scene.trail = Array(scene.trailLen || 60).fill({ x: P.x, y: P.y, f: P.facing });
    scene.cameras.main.fadeIn(300);
    scene.time.delayedCall(800, () => { scene.caught = false; });
  },

  /* ---------- the carriage ---------- */
  carriage(w) {
    if (typeof WorldItems === "undefined") return null;
    const d = WorldItems.defs(w), k = WorldItems.owned(w).find(k => d[k] && d[k].kind === "carriage");
    return k ? Object.assign({ key: k }, d[k]) : null;
  },
  inCarriage(scene) {
    const c = this.carriage(scene.w);
    return !!c && (!c.rider || c.rider === scene.lead) && !WorldItems.indoors(scene);
  },
  curtainUp(scene) { return !!(scene.st && scene.st.curtain); },
  curtain(scene) {
    if (!this.inCarriage(scene)) return;
    scene.st.curtain = !scene.st.curtain; scene.save();
    WorldItems.notice(scene, scene.st.curtain ? { zh: "卷起车帘", name: "Curtain up" } : { zh: "放下车帘", name: "Curtain down" }, true);
    if (WorldItems.onChange) WorldItems.onChange();
  },
  carriageStep(scene) {
    const P = scene.player, on = this.inCarriage(scene) && !scene.cine;
    if (!on) {
      if (scene.carriageImg) { scene.carriageImg.destroy(); scene.carriageImg = null; scene.curtainImg && scene.curtainImg.destroy(); scene.curtainImg = null; if (P.alpha === 0 || P.carriageHidden) { P.setAlpha(1); P.carriageHidden = false; } }
      return;
    }
    const up = this.curtainUp(scene), dir = { left: "left", right: "right", up: "up", down: "down" }[P.facing] || "down";
    const props = scene.textures.exists("tk-props") && scene.textures.get("tk-props");
    const frame = props && props.has(`carriage.${dir}.shut`) ? `carriage.${dir}.${up ? "open" : "shut"}` : null;   // Graphics' four views, curtain shut or rolled up with her at the window
    if (!props && !scene.propsAsked && typeof WorldCutscene !== "undefined") { scene.propsAsked = true; WorldCutscene.load(scene); }   // the props sheet (else first loaded by a scene)
    if (frame && scene.carriageImg && scene.carriageImg.type !== "Image") {   // drawn as a stand-in until the sheet came
      scene.carriageImg.destroy(); scene.carriageImg = null; if (scene.curtainImg) { scene.curtainImg.destroy(); scene.curtainImg = null; }
    }
    if (!scene.carriageImg) {
      scene.carriageImg = frame ? scene.add.image(P.x, P.y, "tk-props", frame).setOrigin(.5, 1)
        : props && props.has("carriage") ? scene.add.image(P.x, P.y, "tk-props", "carriage").setOrigin(.5, 1) : scene.add.rectangle(P.x, P.y, 30, 22, 0x8a2a1a).setOrigin(.5, 1);
      if (!frame) scene.curtainImg = scene.add.rectangle(P.x, P.y, 10, 8, 0xb03a2e).setOrigin(.5, 1).setStrokeStyle(1, 0x5a1a12);
    }
    const C = scene.carriageImg, h = C.displayHeight || 22;
    C.setPosition(Math.round(P.x), Math.round(P.y) + 2).setDepth(P.y + .2);
    P.carriageHidden = !up;
    if (frame) {   // she's drawn in the carriage itself: the walker is never shown
      if (C.frame && C.frame.name !== frame) C.setFrame(frame);
      P.setAlpha(0);
    } else {
      if (C.setFlipX) C.setFlipX(P.facing === "left");
      // she sits at the window: curtain up, her head and shoulders show; down, the curtain hangs over it
      P.setAlpha(up ? 1 : 0);
      P.setDepth(P.y + .4);
      scene.curtainImg.setPosition(Math.round(P.x), Math.round(P.y) - h * .35).setDepth(P.y + .5).setVisible(!up);
    }
    // a carriage goes at a walk
    if (P.body && scene.mounts && !scene.mounts.length) P.body.velocity.scale(.9);
  },
};
