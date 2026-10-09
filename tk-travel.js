/* ---- Three Kingdoms: the world map (travel) and starting a world over ----
   Two buttons in the campaign header (tk.js viewTK):

   - 地图 Map: out onto the overworld, a walkable map of the whole world
     (tools/mapfactory/overworld.py), standing at the gate of the place you
     were in. Walk the roads to any place; step onto its entrance to go in.
     Places the story hasn't opened stay shut. (A world without an overworld
     falls back to the old picker below: cleared places, travelled to at once.)
   - 重新开始 Start over: forgets this world's progress (problems cleared,
     scenes seen, party, possessions, where you stood) after a confirm. */

const WorldTravel = {
  addButtons(bar, w) {
    if (!bar || !WorldData.has(w.n)) return;
    const btn = (label, title, onclick) => h("button", { class: "tk-chron-btn", type: "button", title, onclick }, label);
    // on and off the horse, once the party has one (also the R key)
    if (typeof WorldItems !== "undefined") {
      const ride = btn("", "Get on or off your horse (R)", () => { const s = this.scene(); if (s && s.sys.isActive()) WorldItems.toggle(s); });
      // the bag (sealed pouches and what the story gave) and a carriage's curtain (tk-feats.js)
      const F = typeof WorldFeats !== "undefined" ? WorldFeats : null;
      const bag = btn("行囊 Bag", "What you carry (sealed orders show when they may be opened)", () => F && F.bag(w));
      const curtain = btn("", "Raise or lower the carriage curtain (C)", () => { const s = this.scene(); if (F && s && s.sys.isActive()) F.curtain(s); });
      const show = () => {
        ride.hidden = !WorldItems.hasMount(w); ride.textContent = WorldItems.riding(w) ? "下马 Dismount" : "上马 Ride";
        const sealed = WorldItems.owned(w).some(k => ["sealed", "carriage"].includes((WorldItems.defs(w)[k] || {}).kind));
        bag.hidden = !(F && sealed);
        const s = this.scene(), car = F && F.carriage(w);
        curtain.hidden = !car; curtain.textContent = s && s.st && s.st.curtain ? "放帘 Curtain down" : "卷帘 Curtain up";
      };
      WorldItems.onChange = show;
      show();
      setInterval(() => { if (ride.isConnected) show(); }, 1500);   // a gift can arrive mid-scene
      bar.append(ride, bag, curtain);
    }
    if (typeof TKMusic !== "undefined") bar.append(TKMusic.button(btn("", "Music on or off", null)));   // tk-music.js
    bar.append(
      btn("地图 Map", "Out onto the world map", () => this.overworld(w)),
      btn("重玩一段 Replay from…", "Go back to an earlier story beat and play on from there", () => this.replayPick(w)),
      btn("重新开始 Start over", "Forget this world's progress and start again", () => this.reset(w)));
  },

  // Replay from a beat: choose one of the story beats already played; it and everything after it are undone (with
  // their boards), you stand where it starts, with the party and possessions you had then.
  replayPick(w) {
    // beats played: cleared now, or played once and undone by an earlier replay (picking one of those puts back what came before it)
    const undone = loadProgress().tkUndo || {};
    const beats = w.nodes.filter(n => (n.role === "main" || n.role === "boss") && (TK.cleared(n.key) || undone[n.key]));
    if (!beats.length) return alert("还没有可以重玩的段落。No story beat played yet.");
    document.querySelectorAll(".tk-replay").forEach(el => el.remove());
    const label = n => { const sc = n.scene && w.scenes[n.scene]; return `${n.key.split("-").pop()} · ${sc ? sc.title : n.place || n.key}`; };
    const sel = h("select", { class: "tk-replay-sel" }, beats.map(n => h("option", { value: n.key }, label(n))));
    sel.value = beats[beats.length - 1].key;
    const box = h("div", { class: "tk-replay", role: "dialog", "aria-modal": "true" }, [h("div", { class: "tk-replay-card" }, [
      h("b", {}, "重玩一段 Replay from a beat"), h("p", {}, "这一段及其后的进度将被撤回。This beat and everything after it are undone."), sel,
      h("div", { class: "tk-replay-btns" }, [
        h("button", { type: "button", class: "tk-chron-btn", onclick: () => box.remove() }, "取消 Cancel"),
        h("button", { type: "button", class: "tk-chron-btn", onclick: () => { box.remove(); this.replay(w, sel.value); } }, "重玩 Replay")])])]);
    document.body.append(box);
  },
  async replay(w, key) {
    const idx = w.nodes.findIndex(n => n.key === key);
    if (idx < 0) return;
    // everything before it played (put back what an earlier replay undid), it and everything after not
    const later = new Set(w.nodes.slice(idx).map(n => n.key)), before = w.nodes.slice(0, idx);
    for (const n of before) if (!TK.cleared(n.key)) TK.markCleared(n.key);
    const p = loadProgress();
    for (const k of Object.keys(p.tk || {})) if (later.has(k.split("~")[0])) TK.undoCleared(p, k);
    TK.rolledBack(p, w.n);
    TK.saveProg(p);
    // the party and possessions as the beats before left them
    let party = w.party, crowd = 0, carry = null; const items = [];
    for (const n of before) for (const s of ((n.scene && w.scenes[n.scene]) || {}).steps || []) {
      if (s[0] === "party") party = s[1];
      if (s[0] === "carry") carry = s[2] ? { who: s[1], whom: s[2] } : null;
      if (s[0] === "gain" && !items.includes(s[1])) items.push(s[1]);
      if (s[0] === "lose" && items.includes(s[1])) items.splice(items.indexOf(s[1]), 1);
      if (s[0] === "crowd") crowd = Math.max(0, typeof s[1] === "string" ? crowd + +s[1] : +s[1] || 0);   // the men who've fallen in behind, as then
    }
    const pa = TK.ls("tk-party"); pa[w.n] = party; TK.lsSet("tk-party", pa);
    if (typeof WorldItems !== "undefined") { const it = TK.ls(WorldItems.KEY); it[w.n] = items; TK.lsSet(WorldItems.KEY, it); }
    const at = TK.ls("tk-at"); at[w.n] = key; TK.lsSet("tk-at", at);
    const region = await WorldData.region(w.n), q = region && region.quests.find(x => x.node === key);
    const st = (() => { try { return JSON.parse(localStorage.getItem(WorldState.key(w.n)) || "{}"); } catch { return {}; } })();
    Object.assign(st, { party, crowd, carry, place: q ? q.place : st.place, pos: null });
    if (typeof WorldFeats !== "undefined") WorldFeats.rewind(st, later);
    WorldState.save(w.n, st);
    WorldView.destroy();
    viewTK(w.n);
  },

  scene() { return WorldView.game && WorldView.game.scene.getScene("world"); },

  // A place is cleared once every story point there (and in its rooms) is done; one with none, once visited.
  cleared(region, st, id) {
    const parent = Object.fromEntries(region.places.map(p => [p.id, p.parent]));
    const qs = region.quests.filter(q => q.place === id || parent[q.place] === id);
    return qs.length ? qs.every(q => TK.cleared(q.node)) : (st.visited || []).includes(id);
  },

  async open(w) {
    const region = await WorldData.region(w.n);
    if (!region) return;
    const st = WorldState.load(w.n, region), here = st.place || region.start;
    // where each place sat on the node map
    const at = {};
    for (const p of region.places) {
      const ns = w.nodes.filter(n => n.place === p.name);
      if (ns.length) at[p.id] = [ns.reduce((s, n) => s + n.x, 0) / ns.length, ns.reduce((s, n) => s + n.y, 0) / ns.length];
    }
    const xs = Object.values(at).map(a => a[0]), ys = Object.values(at).map(a => a[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const W = 640, H = 360, pad = 46;
    const P = id => [pad + (at[id][0] - x0) / (x1 - x0 || 1) * (W - 2 * pad), pad + (at[id][1] - y0) / (y1 - y0 || 1) * (H - 2 * pad)];
    const svg = ["<svg viewBox='0 0 " + W + " " + H + "' class='tkt-map' role='img' aria-label='Map of the realm'>"];
    const drawn = new Set();
    for (const p of region.places) for (const to of p.links) {
      const k = [p.id, to].sort().join("|");
      if (drawn.has(k) || !at[p.id] || !at[to]) continue;
      drawn.add(k);
      const [a, b] = [P(p.id), P(to)];
      svg.push(`<line x1='${a[0]}' y1='${a[1]}' x2='${b[0]}' y2='${b[1]}' class='tkt-road'/>`);
    }
    svg.push("</svg>");
    const wrap = h("div", { class: "tkt-wrap" });
    wrap.innerHTML = svg.join("");
    const pins = h("div", { class: "tkt-pins" });
    for (const p of region.places) {
      if (!at[p.id]) continue;
      const [x, y] = P(p.id), ok = this.cleared(region, st, p.id) || p.id === here;
      const name = [h("b", { lang: "zh-CN" }, p.zh || ""), h("span", {}, p.name)];
      const pin = ok && p.id !== here
        ? h("button", { class: "tkt-pin open", type: "button", title: `Travel to ${p.name}`, onclick: () => { close(); this.go(p.id); } }, name)
        : h("div", { class: "tkt-pin" + (p.id === here ? " here" : " lock"), title: p.id === here ? "You are here" : "Clear this place's story first" },
          [...name, h("i", {}, p.id === here ? "◆ 你在这里 here" : "🔒")]);
      pin.style.left = (x / W * 100) + "%";
      pin.style.top = (y / H * 100) + "%";
      pins.append(pin);
    }
    wrap.append(pins);
    const box = h("div", { class: "tkt-box" }, [
      h("div", { class: "tkt-head" }, [h("b", {}, `${w.zh} ${w.name} · 地图 Map`),
        h("button", { class: "tkt-x", type: "button", title: "Close", onclick: () => close() }, "×")]),
      wrap,
      h("p", { class: "tkt-note" }, "去过并完成的地方可以直接前往；其余的还锁着。Places you have cleared are open to travel; the rest stay locked until the story reaches them."),
    ]);
    const veil = h("div", { class: "tkt-veil", onclick: e => { if (e.target === veil) close(); } }, [box]);
    const close = () => { veil.remove(); removeEventListener("keydown", esc, true); };
    const esc = e => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
    addEventListener("keydown", esc, true);
    document.body.append(veil);
  },

  // Out onto the overworld, at the entrance of the place you're in (or its building's place).
  async overworld(w) {
    const s = this.scene(), region = await WorldData.region(w.n);
    if (!region || !region.places.some(p => p.id === "overworld")) return this.open(w);
    if (!s || !s.sys.isActive() || s.cine || s.leaving || s.ui.busy() || s.placeId === "overworld") return;
    const here = region.places.find(p => p.id === s.placeId), from = (here && here.parent) || s.placeId;
    s.leaving = true;
    s.st.pos = null; s.save();
    s.cameras.main.fadeOut(250);
    s.cameras.main.once("camerafadeoutcomplete", () => s.scene.restart({ place: "overworld", from }));
  },

  go(id) {
    const s = this.scene();
    if (!s || !s.sys.isActive() || s.cine) return;
    if (s.placeId === id) return;
    s.leaving = true;
    s.st.pos = null; s.save();
    s.cameras.main.fadeOut(250);
    s.cameras.main.once("camerafadeoutcomplete", () => s.scene.restart({ place: id, from: null }));
  },

  reset(w) {
    if (!confirm(`Start ${w.name} over? This forgets every problem cleared, scene seen, companion, possession and place visited in this world.`)) return;
    const p = loadProgress(), pre = `${w.n}-`;
    for (const k of Object.keys(p.tk || {})) if (k.startsWith(pre)) TK.undoCleared(p, k);
    for (const k of Object.keys(p.tkSeen || {})) if (k.startsWith(`${w.n}:`)) delete p.tkSeen[k];
    TK.rolledBack(p, w.n);
    TK.saveProg(p);
    for (const key of ["tk-party", "tk-items", "tk-at", "tk-ride", "tk-marks"]) { const a = TK.ls(key); delete a[w.n]; TK.lsSet(key, a); }
    try { localStorage.removeItem(WorldState.key(w.n)); } catch {}
    WorldView.destroy();
    viewTK(w.n);
  },
};
