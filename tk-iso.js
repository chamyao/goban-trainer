/* Isometric view for the world (kits with "iso": true; Jade, Ninja and Xianxia stay flat).

   The game keeps working on its flat grid: walking, collisions, story spots, cutscene staging and
   tweens all use the map's own (x, y). Only the picture changes. Each frame, just before the scene
   draws, every object in the world is moved to where that (x, y) falls in the isometric view and
   given the depth that view needs; right after drawing it is put back. The ground (the tile layers)
   is drawn once into a texture and shown as a 2:1 diamond.

       screen x = x - y + H,   screen y = (x + y) / 2        (H: the map's height in pixels)

   A tile T wide becomes a diamond 2T wide and T tall. Upright things (people, buildings, props)
   are not slanted, only placed: their feet land on the diamond floor.
*/
try { localStorage.removeItem("tk-iso"); } catch {}
const SPREAD = 13;   // how far apart (screen px) two people in a scene keep, side to side

const WorldIso = {
  // Each art style keeps its own perspective: on only for a kit drawn for it ("iso": true, Genshin).
  // (There was a view switch; it's gone, and any choice it left behind is cleared.)
  on(kit) { return !!(kit && kit.iso); },

  // Set up the view for a scene whose tile layers are made. layers: the tilemap layers.
  mount(scene, map, layers) {
    const W = map.widthInPixels, H = map.heightInPixels;
    const P = (x, y) => ({ x: x - y + H, y: (x + y) / 2 });
    const inv = (sx, sy) => { const u = sx - H, v = 2 * sy; return { x: (u + v) / 2, y: (v - u) / 2 }; };
    // the ground: every layer drawn flat into one texture, shown turned 45 degrees and squashed. Outdoors
    // the texture runs on past the map (the apron): the screen is a rectangle and the map a diamond, so near
    // the map's edge the view reaches beyond it; out there the map's own edge ground carries on, and the
    // kit's trees and rocks stand on it (apron()), out of reach of the player
    const kit = scene.kit || {}, indoor = String(scene.placeId).includes("--");
    const T = map.tileWidth, pad = indoor ? 0 : Math.min(48, Math.ceil(Math.max(W, H) / 2 / T) + 4) * T;
    const key = `iso-ground-${scene.placeId}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const rt = scene.make.renderTexture({ x: 0, y: 0, width: W + 2 * pad, height: H + 2 * pad }, false);
    // with a backdrop for this kind of place (surround()), the map's own ground runs on only a few tiles and
    // the backdrop shows beyond; without one, it runs to the apron's end
    const backdrop = !indoor && (kit.isoBackdrop || {})[scene.place && scene.place.archetype];
    const near = backdrop && scene.textures.exists(`kit-bg_${backdrop}`) ? Math.min(pad, 6 * T) : pad;
    if (pad) WorldIso.extendGround(scene, map, layers[0], rt, pad, near);
    for (const l of layers) rt.draw(l, pad, pad);
    rt.saveTexture(key);
    for (const l of layers) l.setVisible(false);
    const floor = scene.add.container(H, -pad).setScale(1, .5).setDepth(-2e5);
    floor.add(scene.add.image(0, 0, key).setOrigin(0, 0).setRotation(Math.PI / 4).setScale(Math.SQRT2));
    floor.isoFixed = true;
    const iso = scene.iso = { P, inv, W, H, pad, floor, width: W + H, height: (W + H) / 2 };
    if (pad) WorldIso.apron(scene, map, iso, kit);
    // beyond the map's diamond: outdoors more country (the kit's "isoVoid" colour); indoors the void the
    // room is drawn on, so the unused part of the map doesn't show as a slab under the room
    const back = indoor ? kit.materials && kit.materials.void && kit.materials.void.color : kit.isoVoid;
    if (back) scene.cameras.main.setBackgroundColor(back);
    if (!indoor) WorldIso.surround(scene, iso, kit);

    // the view's depth: how far down the screen an object's feet are. Objects drawn above everything
    // (marks, emotes, flashes: depth >= 9000) and behind everything (<= -9000) keep theirs; the rest
    // keep their offset from the flat depth (a tree's clutter below, a rider above his horse).
    const saved = [];
    const project = () => {
      saved.length = 0;
      for (const o of scene.children.list) {
        if (o.isoFixed || o.isoFollow || o.scrollFactorX === 0 || !o.visible) continue;
        const a = o.isoAt;   // a building or prop: its footprint's centre, and the drop to its front corner
        const b = o.isoBase;  // a rider, an emote: the ground point it is held above (its offset stays upright)
        const lx = a ? a[0] : b ? b[0] : o.x, ly = a ? a[1] : b ? b[1] : o.y, q = P(lx, ly);
        saved.push(o, o.x, o.y, o._depth);
        o.x = q.x + (b ? o.x - b[0] : 0); o.y = q.y + (a ? a[2] : b ? o.y - b[1] : 0);
        const d = o._depth;
        if (d > -9000 && d < 9000) o._depth = q.y + (a ? a[2] : 0) + (a ? 0 : d - ly);
      }
      // a glow or smoke drawn on a building or prop (isoFollow): it keeps its flat offset from that thing's
      // anchor, so it stays where it was drawn on the art
      for (const o of scene.children.list) {
        const t = o.isoFollow;
        if (!t || !o.visible) continue;
        const i = saved.indexOf(t);
        saved.push(o, o.x, o.y, o._depth);
        if (i < 0) continue;   // the thing itself isn't drawn: leave it
        o.x = t.x + (o.x - saved[i + 1]); o.y = t.y + (o.y - saved[i + 2]);
        const d = o._depth;
        if (d > -9000 && d < 9000) o._depth = t._depth + (d - saved[i + 3]);
      }
      // people in a scene (isoSpread) who stood side by side on the map's diagonal now stand one above the
      // other: nudge such pairs apart sideways, as drawn only; their shadows (isoWith) go with them
      const crowd = scene.children.list.filter(o => o.isoSpread && o.visible).sort((m, n) => m.y - n.y), off = new Map();
      for (let i = 0; i < crowd.length; i++) for (let j = i + 1; j < crowd.length; j++) {
        const m = crowd[i], n = crowd[j], dx = (n.x + (off.get(n) || 0)) - (m.x + (off.get(m) || 0));
        if (Math.abs(dx) >= SPREAD || n.y - m.y >= 24) continue;
        const push = (SPREAD - Math.abs(dx)) / 2, s = dx > 0 ? 1 : dx < 0 ? -1 : (j % 2 ? 1 : -1);
        off.set(n, (off.get(n) || 0) + s * push); off.set(m, (off.get(m) || 0) - s * push);
      }
      if (off.size) for (const o of scene.children.list) {
        const k = off.get(o) ?? (o.isoWith && off.get(o.isoWith));
        if (k) o.x += k;
      }
      scene.children.sortChildrenFlag = true;
      scene.children.depthSort();
    };
    const restore = () => {
      for (let i = 0; i < saved.length; i += 4) { const o = saved[i]; o.x = saved[i + 1]; o.y = saved[i + 2]; o._depth = saved[i + 3]; }
      saved.length = 0;
      scene.children.sortChildrenFlag = true;   // the flat depths are back: sort by them before the next frame's logic
    };
    scene.events.on("prerender", project);
    scene.events.on("render", restore);
    scene.events.once("shutdown", () => { scene.events.off("prerender", project); scene.events.off("render", restore); });
    return iso;
  },

  // The apron's ground: each cell outside the map gets the ground tile of the nearest map cell at the edge.
  extendGround(scene, map, layer, rt, pad, near = pad) {
    if (!layer) return;
    const T = map.tileWidth, cols = map.width, rows = map.height, n = pad / T, frames = new Map();
    const frameOf = t => {   // a tile's picture as a frame of its tileset's texture
      const ts = t.tileset, k = `${ts.name}:${t.index}`;
      if (!frames.has(k)) {
        const tex = scene.textures.get(ts.image.key), c = ts.getTileTextureCoordinates(t.index), f = `iso-${t.index}`;
        if (c && !tex.has(f)) tex.add(f, 0, c.x, c.y, ts.tileWidth, ts.tileHeight);
        frames.set(k, c ? [ts.image.key, f] : null);
      }
      return frames.get(k);
    };
    // one batch: thousands of separate drawFrame calls each flush the GPU, which took many seconds on a phone
    rt.beginDraw();
    for (let y = -n; y < rows + n; y++) for (let x = -n; x < cols + n; x++) {
      if (x >= 0 && y >= 0 && x < cols && y < rows) continue;
      if (Math.max(-x, -y, x - cols + 1, y - rows + 1) * T > near) continue;   // past the ring: the backdrop
      const t = layer.getTileAt(Math.min(cols - 1, Math.max(0, x)), Math.min(rows - 1, Math.max(0, y)));
      const f = t && t.index >= 0 && frameOf(t);
      if (f) rt.batchDrawFrame(f[0], f[1], (x + n) * T, (y + n) * T);
    }
    rt.endDraw();
  },

  // The apron's growth: the kit's trees and rocks, thicker the further from the map, never on the map.
  apron(scene, map, iso, kit) {
    const wanted = (kit.isoApron || ["tree.big", "tree.pine", "tree.small", "tree.grove", "rock.big", "plant.bush"])
      .filter(k => kit.kinds[k]);
    const frames = wanted.flatMap(k => kit.kinds[k].map((f, i) => [`kit-${f[0]}`, `${k}#${i}`]));
    if (!frames.length) return;
    let seed = [...String(scene.placeId)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
    const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
    const { W, H, pad } = iso, step = map.tileWidth * 2;
    for (let y = -pad + step / 2; y < H + pad; y += step) for (let x = -pad + step / 2; x < W + pad; x += step) {
      const out = Math.max(-x, -y, x - W, y - H);   // how far outside the map
      if (out < map.tileWidth) continue;
      if (rnd() > Math.min(.75, .15 + out / pad)) continue;
      const [tex, f] = frames[Math.floor(rnd() * frames.length)];
      const img = scene.add.image(x + (rnd() - .5) * step, y + (rnd() - .5) * step, tex, f).setOrigin(.5, 1);
      img.setDepth(img.y).setFlipX(rnd() < .5);
    }
  },

  // Outdoors, the country around the map: a seamless backdrop under the diamond (kit "isoBackdrop": the place's
  // archetype -> a backdrop sheet bg_<kind>), and cut-out pieces (kit kinds fg.*) along the diamond's edges, drawn
  // over its rim so the map sits in its surroundings instead of on an empty field.
  surround(scene, iso, kit) {
    const kind = (kit.isoBackdrop || {})[scene.place && scene.place.archetype];
    if (!kind) return;
    const key = `kit-bg_${kind}`, M = 900;
    if (scene.textures.exists(key))
      Object.assign(scene.add.tileSprite(-M, -M, iso.width + 2 * M, iso.height + 2 * M, key).setOrigin(0, 0).setDepth(-3e5), { isoFixed: true });
    const pieces = (kit.isoForeground || {})[kind] || [];
    const frames = pieces.flatMap(k => (kit.kinds[k] || []).map((_, i) => `${k}#${i}`));
    if (!frames.length) return;
    let seed = [...String(scene.placeId)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
    // the diamond's corners, screen space: top (H, 0), right (W+H, W/2), bottom (W, (W+H)/2), left (0, H/2)
    const { W, H } = iso, C = [[H, 0], [W + H, W / 2], [W, (W + H) / 2], [0, H / 2]];
    for (let e = 0; e < 4; e++) {
      const [x0, y0] = C[e], [x1, y1] = C[(e + 1) % 4], len = Math.hypot(x1 - x0, y1 - y0);
      const nx = (y1 - y0) / len, ny = -(x1 - x0) / len;   // outward
      for (let t = 40 + rnd() * 60; t < len - 30; t += 70 + rnd() * 90) {
        const out = 10 + rnd() * 40, x = x0 + (x1 - x0) * t / len + nx * out, y = y0 + (y1 - y0) * t / len + ny * out;
        const f = frames[Math.floor(rnd() * frames.length)], [s] = f.split("#");
        const img = scene.add.image(x, y, `kit-${(kit.kinds[s][0] || [])[0]}`, f).setOrigin(.5, 1).setDepth(y < (W + H) / 4 ? -1e5 : 8500);
        img.setFlipX(rnd() < .5); img.isoFixed = true;
      }
    }
  },

  // A static building or prop: anchored by its footprint (tiles x, y, w, h) instead of its feet.
  anchor(scene, obj, cx, cy, wPx, hPx) {
    if (!scene.iso) return;
    obj.isoAt = [cx, cy, (wPx + hPx) / 4];
  },
};
