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
    // the ground: every layer drawn flat into one texture, shown turned 45 degrees and squashed
    const key = `iso-ground-${scene.placeId}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const rt = scene.make.renderTexture({ x: 0, y: 0, width: W, height: H }, false);
    for (const l of layers) rt.draw(l, 0, 0);
    rt.saveTexture(key);
    for (const l of layers) l.setVisible(false);
    const floor = scene.add.container(H, 0).setScale(1, .5).setDepth(-2e5);
    floor.add(scene.add.image(0, 0, key).setOrigin(0, 0).setRotation(Math.PI / 4).setScale(Math.SQRT2));
    floor.isoFixed = true;
    const iso = scene.iso = { P, inv, W, H, floor, width: W + H, height: (W + H) / 2 };
    // beyond the map's diamond: outdoors more country (the kit's "isoVoid" colour); indoors the void the
    // room is drawn on, so the unused part of the map doesn't show as a slab under the room
    const kit = scene.kit || {}, indoor = String(scene.placeId).includes("--");
    const back = indoor ? kit.materials && kit.materials.void && kit.materials.void.color : kit.isoVoid;
    if (back) scene.cameras.main.setBackgroundColor(back);

    // the view's depth: how far down the screen an object's feet are. Objects drawn above everything
    // (marks, emotes, flashes: depth >= 9000) and behind everything (<= -9000) keep theirs; the rest
    // keep their offset from the flat depth (a tree's clutter below, a rider above his horse).
    const saved = [];
    const project = () => {
      saved.length = 0;
      for (const o of scene.children.list) {
        if (o.isoFixed || o.scrollFactorX === 0 || !o.visible) continue;
        const a = o.isoAt;   // a building or prop: its footprint's centre, and the drop to its front corner
        const b = o.isoBase;  // a rider, an emote: the ground point it is held above (its offset stays upright)
        const lx = a ? a[0] : b ? b[0] : o.x, ly = a ? a[1] : b ? b[1] : o.y, q = P(lx, ly);
        saved.push(o, o.x, o.y, o._depth);
        o.x = q.x + (b ? o.x - b[0] : 0); o.y = q.y + (a ? a[2] : b ? o.y - b[1] : 0);
        const d = o._depth;
        if (d > -9000 && d < 9000) o._depth = q.y + (a ? a[2] : 0) + (a ? 0 : d - ly);
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

  // A static building or prop: anchored by its footprint (tiles x, y, w, h) instead of its feet.
  anchor(scene, obj, cx, cy, wPx, hPx) {
    if (!scene.iso) return;
    obj.isoAt = [cx, cy, (wPx + hPx) / 4];
  },
};
