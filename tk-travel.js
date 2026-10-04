/* ---- Three Kingdoms: the world map (travel) and starting a world over ----
   Two buttons in the campaign header (tk.js viewTK):

   - 地图 Map: the world's places on a map drawn from the old node map's
     layout. Places you have cleared (every story point there done; a place
     with none, once visited) can be travelled to at once; the rest are
     locked. You are shown where you stand.
   - 重新开始 Start over: forgets this world's progress (problems cleared,
     scenes seen, party, possessions, where you stood) after a confirm. */

const WorldTravel = {
  addButtons(bar, w) {
    if (!bar || !WorldData.has(w.n)) return;
    const btn = (label, title, onclick) => h("button", { class: "tk-chron-btn", type: "button", title, onclick }, label);
    // on and off the horse, once the party has one (also the R key)
    if (typeof WorldItems !== "undefined") {
      const ride = btn("", "Get on or off your horse (R)", () => { const s = this.scene(); if (s && s.sys.isActive()) WorldItems.toggle(s); });
      const show = () => { ride.hidden = !WorldItems.hasMount(w); ride.textContent = WorldItems.riding(w) ? "下马 Dismount" : "上马 Ride"; };
      WorldItems.onChange = show;
      show();
      setInterval(() => { if (ride.isConnected) show(); }, 1500);   // a gift can arrive mid-scene
      bar.append(ride);
    }
    if (typeof TKMusic !== "undefined") bar.append(TKMusic.button(btn("", "Music on or off", null)));   // tk-music.js
    bar.append(
      btn("地图 Map", "Travel to a place you have cleared", () => this.open(w)),
      btn("重新开始 Start over", "Forget this world's progress and start again", () => this.reset(w)));
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
    const svg = ["<svg viewBox='0 0 " + W + " " + H + "' class='tkt-map' role='img' aria-label='World map'>"];
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
      h("div", { class: "tkt-head" }, [h("b", {}, `${w.zh} ${w.name} · 地图 World map`),
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
    for (const k of Object.keys(p.tk || {})) if (k.startsWith(pre)) delete p.tk[k];
    for (const k of Object.keys(p.tkSeen || {})) if (k.startsWith(`${w.n}:`)) delete p.tkSeen[k];
    TK.saveProg(p);
    for (const key of ["tk-party", "tk-items", "tk-at", "tk-ride"]) { const a = TK.ls(key); delete a[w.n]; TK.lsSet(key, a); }
    try { localStorage.removeItem(WorldState.key(w.n)); } catch {}
    WorldView.destroy();
    viewTK(w.n);
  },
};
