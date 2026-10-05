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
const WorldIso = {
  on(kit) { return !!(kit && kit.iso) || /[?&]iso=1\b/.test(location.search); },

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
    // outdoors, the corners beyond the diamond are more country (the kit's "isoVoid" colour); rooms stay dark
    const kit = scene.kit || {};
    if (kit.isoVoid && !String(scene.placeId).includes("--")) scene.cameras.main.setBackgroundColor(kit.isoVoid);

    // the view's depth: how far down the screen an object's feet are. Objects drawn above everything
    // (marks, emotes, flashes: depth >= 9000) and behind everything (<= -9000) keep theirs; the rest
    // keep their offset from the flat depth (a tree's clutter below, a rider above his horse).
    const saved = [];
    const project = () => {
      saved.length = 0;
      for (const o of scene.children.list) {
        if (o.isoFixed || o.scrollFactorX === 0 || !o.visible) continue;
        const a = o.isoAt;   // a building or prop: its footprint's centre, and the drop to its front corner
        const lx = a ? a[0] : o.x, ly = a ? a[1] : o.y, q = P(lx, ly);
        saved.push(o, o.x, o.y, o._depth);
        o.x = q.x; o.y = q.y + (a ? a[2] : 0);
        const d = o._depth;
        if (d > -9000 && d < 9000) o._depth = q.y + (a ? a[2] : 0) + (a ? 0 : d - ly);
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
