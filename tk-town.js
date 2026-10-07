/* ---- Three Kingdoms: shared pieces for the explorable world ----
   The heroes in four directions (TownArt, from TKArt's front sprites), the
   dialogue box with portraits and voice (TownUI), and the lazy loader for
   Phaser (TownLoad). The world itself is tk-world.js. */

// The two nameless old men who set Go problems: the Star Lords of the plan
// (docs/three-kingdoms-plan.md), unnamed until World 11.
Object.assign(TK_CHARS, {  // drawn by TKArt like everyone else
  stargrey: { name: "Old man in grey", skin: "#ecc9a4", hair: "#e4e4e4", hat: "topknot", hatC: "#e4e4e4", pin: "#7a7a7a", robe: "#7c8088", trim: "#d8d2c0", beard: "long", beardC: "#f0f0f0", eyes: "kind" },
  starred: { name: "Old man in red", skin: "#ecc9a4", hair: "#e4e4e4", hat: "scholar", hatC: "#5a2a22", robe: "#a83a2c", trim: "#e6c14a", beard: "long", beardC: "#f0f0f0", eyes: "kind" },
});

// Chinese names, shown first in the dialogue box.
const TK_NAMES_ZH = {
  liubei: "刘备", guanyu: "关羽", zhangfei: "张飞", caocao: "曹操", dongzhuo: "董卓", zhangbao: "张宝", zhangjiao: "张角",
  luzhi: "卢植", zhujun: "朱儁", huangfusong: "皇甫嵩", chengyuanzhi: "程远志", rebel: "黄巾兵", inspector: "督邮",
  xushao: "许劭", uncle: "曹操的叔父", zuofeng: "左丰", merchant: "张世平", immortal: "南华老仙",
  stargrey: "灰衣老人", starred: "红衣老人", yanzheng: "严政", liubei_child: "少年刘备", liuyuanqi: "刘元起",
  f_farmer: "农夫", f_farmer2: "农夫", f_porter: "脚夫", f_youth: "后生", f_woman: "妇人", f_woman2: "妇人", f_elder: "老者", f_elder2: "老汉",
  f_child: "孩童", f_daoist: "道士", f_noble: "士人", f_soldier: "兵士", f_hunter: "猎户", f_official: "书吏",
  f_geisha: "仕女", f_geisha2: "仕女", f_geisha3: "仕女", f_maiden: "少女", f_maiden2: "少女", f_girl: "小姑娘",
  // Book 2
  caiyong: "蔡邕", caohong: "曹洪", chengong: "陈宫", chengpu: "程普", diaochan: "貂蝉", dingyuan: "丁原", dongmu: "董卓之母",
  gongsunzan: "公孙瓒", handang: "韩当", hetaihou: "何太后", liru: "李儒", lisu: "李肃", lvbu: "吕布", shaodi: "少帝",
  sunjian: "孙坚", tangfei: "唐妃", wangyun: "王允", xiandi: "献帝", yuanshao: "袁绍", yuanshu: "袁术", zumao: "祖茂",
  // Book 3
  taishici: "太史慈", kongrong: "孔融", guanhai: "管亥", taoqian: "陶谦", mizhu: "糜竺", chendeng: "陈登", zhaoyun: "赵云", jiling: "纪灵",
  zhangliao: "张辽", haomeng: "郝萌", gaoshun: "高顺", xunyu: "荀彧", guojia: "郭嘉", sunqian: "孙乾", sunce: "孙策", dianwei: "典韦",
  xiahoudun: "夏侯惇", wanghou: "王垕", houcheng: "侯成", yanshi: "严氏", zhangkai: "张闿", caosong: "曹嵩",
  // Book 2 draft (world 12)
  zhangwen: "张温", shisunrui: "士孙瑞", huangwan: "黄琬", mamidi: "马日磾", lijue: "李傕", guosi: "郭汜", jiaxu: "贾诩",
  niufu: "牛辅", huchier: "胡赤儿", daoren: "道人",
};
// English names where an id doesn't spell them (TK_CHARS names the heroes and villains it draws)
const TK_NAMES_EN = {
  caiyong: "Cai Yong", caohong: "Cao Hong", chengong: "Chen Gong", chengpu: "Cheng Pu", diaochan: "Diaochan", dingyuan: "Ding Yuan",
  dongmu: "Dong Zhuo's mother", gongsunzan: "Gongsun Zan", handang: "Han Dang", hetaihou: "Empress He", liru: "Li Ru", lisu: "Li Su",
  lvbu: "Lü Bu", shaodi: "Emperor Shao", sunjian: "Sun Jian", tangfei: "Consort Tang", wangyun: "Wang Yun", xiandi: "Emperor Xian",
  yuanshao: "Yuan Shao", yuanshu: "Yuan Shu", zumao: "Zu Mao",
  // Book 3
  taishici: "Taishi Ci", kongrong: "Kong Rong", guanhai: "Guan Hai", taoqian: "Tao Qian", mizhu: "Mi Zhu", chendeng: "Chen Deng", zhaoyun: "Zhao Yun", jiling: "Ji Ling",
  zhangliao: "Zhang Liao", haomeng: "Hao Meng", gaoshun: "Gao Shun", xunyu: "Xun Yu", guojia: "Guo Jia", sunqian: "Sun Qian", sunce: "Sun Ce", dianwei: "Dian Wei",
  xiahoudun: "Xiahou Dun", wanghou: "Wang Hou", houcheng: "Hou Cheng", yanshi: "Lady Yan", zhangkai: "Zhang Kai", caosong: "Cao Song",
  // Book 2 draft (world 12)
  zhangwen: "Zhang Wen", shisunrui: "Shisun Rui", huangwan: "Huang Wan", mamidi: "Ma Midi", lijue: "Li Jue", guosi: "Guo Si", jiaxu: "Jia Xu",
  niufu: "Niu Fu", huchier: "Hu Chi'er", daoren: "The Taoist",
};
const tkName = who => [TK_NAMES_ZH[who], TK_CHARS[who] ? TK_CHARS[who].name : TK_NAMES_EN[who] ? TK_NAMES_EN[who]
  : !TK_NAMES_ZH[who] && String(who || "").replace(/^f_/, "").split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")].filter(Boolean).join(" ");

/* ---------- the heroes in four directions, from TKArt's front sprites ---------- */
const TownArt = {
  // Recolour a front sprite into a back view: face becomes hair, beard becomes robe.
  back(who, frame) {
    const d = tkLook(who), src = TKArt.get(who, "sprite", frame);
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext("2d"); c.drawImage(src, 0, 0);
    const img = c.getImageData(0, 0, cv.width, cv.height), p = img.data;
    const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const same = (i, col) => p[i] === col[0] && p[i + 1] === col[1] && p[i + 2] === col[2];
    const put = (i, col) => { p[i] = col[0]; p[i + 1] = col[1]; p[i + 2] = col[2]; };
    const hair = hex(d.hair || "#2a2228"), robe = hex(d.robe), beard = hex(d.beardC || d.hair || "#2a2228");
    const face = [d.skin, TKArt.shade(d.skin, -.18), "#2a2228", "#ffffff", "#c8283c", "#f4a0aa"].map(hex).concat([beard]);  // makeup too
    for (let y = 3; y <= 9; y++) for (let x = 3; x <= 10; x++) {
      const i = (y * cv.width + x) * 4;
      if (p[i + 3] && face.some(f => same(i, f))) put(i, hair);
    }
    for (let y = 10; y <= 14; y++) for (let x = 4; x <= 9; x++) {
      const i = (y * cv.width + x) * 4;
      if (p[i + 3] && same(i, beard) && !same(i, hair)) put(i, robe);
    }
    c.putImageData(img, 0, 0);
    return cv;
  },
  // Side view facing right, drawn as a true profile on the same 16x20 grid as
  // TKArt's front sprite. step: 0 stand, 1 stride with the arm forward,
  // 2 stand, 3 stride with the arm back.
  side(who, step) {
    const d = tkLook(who), A = TKArt, g = A.grid(16, 20), O = 2;
    const s = (x, y, c) => A.set(g, x + O, y + 1, c), R = (x, y, w, h, c) => A.rect(g, x + O, y + 1, w, h, c);
    const skinS = A.shade(d.skin, -.18), robeS = A.shade(d.robe, -.22), arm = A.shade(d.robe, -.1), dark = "#2a2228";
    const hr = d.hair || dark, H = d.hatC, stride = step % 2 === 1, pole = d.weapon === "spear" || d.weapon === "glaive";
    // a pole weapon is held upright in the front hand
    if (pole) {
      for (let y = 1; y < 16; y++) s(9, y, d.weapon === "glaive" ? "#6a4a2a" : "#7a5a3a");
      if (d.weapon === "spear") { s(9, 0, "#d0d4d8"); s(9, -1, "#d0d4d8"); s(10, 0, "#d0d4d8"); }
      else { R(9, -2, 2, 3, "#d0d4d8"); s(11, -1, "#d0d4d8"); s(9, 1, "#3f9a5a"); }
    }
    // legs
    if (stride) { R(6, 13, 2, 2, robeS); R(1, 13, 2, 2, robeS); R(6, 15, 3, 1, dark); R(0, 15, 2, 1, dark); }
    else { R(3, 13, 2, 2, robeS); R(5, 13, 2, 2, robeS); R(3, 15, 2, 1, dark); R(5, 15, 3, 1, dark); }
    // body
    const w = d.fat ? 8 : 7, x0 = d.fat ? 0 : 1;
    R(2, 9, 6, 1, d.robe); R(x0, 10, w, 3, d.robe); R(x0, 12, w, 1, robeS); R(x0, 11, w, 1, d.trim);
    s(6, 9, d.trim); s(7, 10, d.trim);
    if (d.weapon === "swords" || d.weapon === "sword") R(0, 11, 2, 1, "#d0d4d8");  // scabbard at the hip, pointing back
    // the near arm swings opposite the front leg
    if (pole) { R(5, 10, 3, 1, arm); s(8, 10, d.skin); }
    else if (step === 1) { R(5, 10, 2, 2, arm); s(7, 11, d.skin); }
    else if (step === 3) { R(2, 10, 2, 2, arm); s(1, 11, d.skin); }
    else { R(4, 10, 2, 2, arm); s(4, 12, d.skin); }
    // head in profile, facing right
    R(2, 2, 7, 7, d.skin); R(2, 8, 7, 1, skinS); s(9, 5, d.skin); s(9, 6, skinS);  // nose
    if (d.fat) { R(2, 7, 8, 2, d.skin); }
    R(2, 2, 2, 5, hr); s(4, 2, hr); R(2, 1, 6, 1, hr);                              // hair at the back of the head
    if (d.ears) R(4, 4, 2, 4, skinS); else R(4, 4, 1, 2, skinS);
    const ey = 5;
    if (d.eyes === "round") { s(6, ey, "#fff"); s(7, ey, dark); R(6, ey - 2, 2, 1, dark); }
    else if (d.eyes === "phoenix") { s(7, ey, dark); s(6, ey - 1, dark); R(6, ey - 2, 3, 1, dark); }
    else if (d.eyes === "narrow") { R(6, ey, 2, 1, dark); s(7, ey - 2, dark); }
    else if (d.eyes === "wild") { s(7, ey, dark); s(6, ey, "#fff"); R(6, ey - 2, 2, 1, dark); s(8, ey - 3, dark); }
    else s(7, ey, dark);
    s(8, 7, d.makeup ? "#c8283c" : A.shade(d.skin, -.4));  // mouth
    if (d.makeup) s(6, 7, "#f4a0aa");
    // beard
    const bc = d.beardC || hr;
    if (d.beard === "long") { R(6, 7, 3, 1, bc); R(5, 8, 4, 3, bc); R(6, 11, 2, 1, bc); }
    else if (d.beard === "bristle") { R(5, 7, 5, 2, bc); s(10, 7, bc); s(9, 9, bc); s(5, 9, bc); s(7, 9, bc); }
    else if (d.beard === "short") { R(5, 7, 4, 2, bc); }
    else if (d.beard === "goatee") { R(7, 8, 2, 2, bc); }
    else if (d.beard === "thin") { s(8, 8, bc); }
    // hats, in profile
    if (d.hat === "topknot") { R(2, 1, 6, 2, hr); R(4, -1, 2, 2, hr); s(3, 0, d.pin || "#e6c14a"); s(6, 0, d.pin || "#e6c14a"); }
    else if (d.hat === "bun") { R(2, 1, 6, 2, hr); R(1, -1, 4, 3, hr); s(5, -1, d.pin || "#c8392c"); R(2, 3, 2, 4, hr); }
    else if (d.hat === "lady") {
      R(2, 1, 6, 2, hr); R(1, -1, 6, 2, hr); R(0, 2, 2, 5, hr); R(2, 3, 2, 3, hr);
      R(3, 0, 3, 1, d.pin || "#c8283c"); s(0, -1, d.pin2 || "#e6c14a"); s(7, -1, d.pin2 || "#e6c14a"); s(7, 1, d.flower || "#f08ab0"); s(8, 0, d.flower || "#f08ab0");
    }
    else if (d.hat === "twinloops") { R(2, 1, 6, 2, hr); R(2, -1, 3, 1, hr); s(2, 0, hr); s(4, 0, hr); R(5, -1, 2, 1, hr); s(6, 0, hr); s(5, 0, d.pin || "#e6c14a"); R(2, 3, 2, 4, hr); }
    else if (d.hat === "sidebuns") { R(2, 1, 6, 2, hr); R(0, 1, 2, 2, hr); s(1, 3, d.pin || "#c8392c"); R(2, 3, 2, 3, hr); }
    else if (d.hat === "scarf") { R(2, 0, 7, 3, H); R(3, -1, 4, 1, H); R(1, 1, 1, 6, H); s(0, 6, H); }
    else if (d.hat === "band") { R(2, 0, 6, 2, hr); s(3, -1, hr); s(6, -1, hr); R(2, 2, 7, 1, H); s(1, 3, H); s(0, 4, H); }
    else if (d.hat === "guan") { R(3, -1, 5, 2, H); R(2, 1, 7, 2, H); s(1, 2, H); }
    else if (d.hat === "yellowband") { R(2, 1, 6, 1, hr); R(2, 2, 7, 1, H); R(1, 3, 1, 2, H); }
    else if (d.hat === "wild") { R(2, 0, 6, 2, hr); s(1, -1, hr); s(4, -2, hr); s(7, -1, hr); R(2, 2, 7, 1, H); R(1, 3, 2, 7, hr); }
    else if (d.hat === "helmet") { R(2, 0, 7, 3, H); R(3, -1, 5, 1, H); s(5, -2, "#c8392c"); R(1, 3, 2, 4, H); }
    else if (d.hat === "scholar") { R(2, 0, 7, 3, H); R(3, -1, 4, 1, H); s(1, 2, H); s(0, 3, H); }
    else if (d.hat === "straw") { R(0, 2, 11, 1, H); R(3, 0, 5, 2, H); R(4, -1, 3, 1, H); }
    return A.canvas(A.outline(g));
  },
  // Lift one foot of a front or back sprite by a pixel: the step frames of the walk.
  step(src, leftFoot) {
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext("2d", { willReadFrequently: true }); c.drawImage(src, 0, 0);
    const img = c.getImageData(0, 0, cv.width, cv.height), p = img.data, W = cv.width;
    const [x0, x1] = leftFoot ? [3, 6] : [7, 10];
    for (let y = 13; y < cv.height; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4, j = ((y + 1) * W + x) * 4;
      for (let k = 0; k < 4; k++) p[i + k] = y + 1 < cv.height ? p[j + k] : 0;
    }
    c.putImageData(img, 0, 0);
    return cv;
  },

  // The "!" over someone who will set you a problem.
  bang() {
    const A = TKArt, g = A.grid(7, 12);
    A.rect(g, 2, 1, 3, 6, "#ffe066"); A.rect(g, 2, 8, 3, 2, "#ffe066"); A.rect(g, 4, 1, 1, 6, "#e6b422");
    return A.canvas(A.outline(g, "#3a2416"));
  },

  // Register textures hero-<who>-<dir>-<frame> and walk animations.
  hero(scene, who) {
    if (tkLook(who).clawd) {   // Clawd walks on four legs, drawn whole for every view
      const f = { down: [0, 1, 2, 3].map(k => TKArt.clawd("down", k)), up: [0, 1, 2, 3].map(k => TKArt.clawd("up", k)), right: [0, 1, 2, 3].map(k => TKArt.clawd("side", k)) };
      f.left = f.right.map(cv => TKArt.flip(cv));
      for (const [dir, list] of Object.entries(f)) {
        list.forEach((cv, k) => scene.textures.addCanvas(`h-${who}-${dir}-${k}`, cv));
        if (!scene.anims.exists(`h-${who}-${dir}`)) scene.anims.create({ key: `h-${who}-${dir}`, frames: list.map((_, k) => ({ key: `h-${who}-${dir}-${k}` })), frameRate: 8, repeat: -1 });
      }
      return;
    }
    const front = TKArt.get(who, "sprite", 0), back = this.back(who, 0);
    const frames = {
      down: [front, this.step(front, true), front, this.step(front, false)],
      up: [back, this.step(back, false), back, this.step(back, true)],
      right: [0, 1, 2, 3].map(k => this.side(who, k)),
    };
    frames.left = frames.right.map(cv => TKArt.flip(cv));
    for (const [dir, list] of Object.entries(frames)) {
      list.forEach((cv, k) => scene.textures.addCanvas(`h-${who}-${dir}-${k}`, cv));
      scene.anims.create({ key: `h-${who}-${dir}`, frames: list.map((_, k) => ({ key: `h-${who}-${dir}-${k}` })), frameRate: 8, repeat: -1 });
    }
  },

};

/* ---------- DOM overlay: goal, dialogue with portraits and voice ---------- */
const TownUI = {
  // who -> portrait file (assets/tk/portraits/portraits.json, tools/build_portraits.py), fetched once
  portraits: {}, PORTRAIT_V: 2,
  loadPortraits() {
    if (!this._pp) this._pp = fetch(`assets/tk/portraits/portraits.json?v=${this.PORTRAIT_V}`).then(r => r.ok ? r.json() : {})
      .catch(() => ({})).then(m => { this.portraits = m; for (const f of Object.values(m)) new Image().src = `assets/tk/portraits/${f}?v=${this.PORTRAIT_V}`; });
    return this._pp;
  },
  mount(scene, host) {
    const painted = !!scene.kit && (scene.kit.dialogue === "genshin" || !!scene.kit.portraits);   // kits/<kit>.json "portraits": the painted cut-outs in the kit's own box
    if (painted) this.loadPortraits();
    host.querySelectorAll(":scope > .town-ui").forEach(el => el.remove());  // a new place replaces the old overlay
    const root = document.createElement("div");
    // the dialogue look follows the art kit ("dialogue" in kits/<kit>.json): "genshin" is the big cut-out
    // portrait in a dark gradient box (style.css); the other kits keep the original box and pixel bust
    const look = (scene.kit && scene.kit.dialogue) || "";
    root.className = "town-ui" + (look ? " " + look : "") + (painted ? " painted" : "");
    const TOUCH = typeof TK_TOUCH !== "undefined" && TK_TOUCH;
    root.innerHTML = `<div class="town-goal"></div><div class="town-keys"><b>点击</b>移动 click to move · <b>点击人物</b>对话 click someone to talk</div>
      <div class="town-place"></div><div class="town-hint" hidden>${TOUCH ? "点击 Tap" : "点击 Click"}</div><div class="town-focus" hidden>${TOUCH ? "Tap the map to play" : "Click the map to play"}</div>
      <div class="town-dim" hidden></div><img class="town-portrait" alt="" hidden><div class="town-dlg" hidden><div class="town-tab">主线 · Story</div><canvas class="town-face" width="34" height="34"></canvas><div class="town-txt"><div class="town-who"></div><div class="town-zh" lang="zh-CN"></div><div class="town-en"></div></div><div class="town-more">▼</div></div>`;
    host.append(root);
    const $ = s => root.querySelector(s);
    let queue = [], done = null, open = false, typing = null, finishTyping = null;
    const show = () => {
      const st = queue.shift();
      if (!st) { $(".town-dlg").hidden = true; $(".town-dim").hidden = true; $(".town-portrait").hidden = true; open = false; TKVoice.stop(); const d = done; done = null; d && d(); return; }
      const said = st[0] === "say", who = said ? st[1] : null;
      const [en, zh, vid] = said ? [st[2], st[3], st[4]] : [st[1], st[2], st[3]];
      $(".town-who").textContent = who ? tkName(who) : "";
      // the words type themselves out; Enter shows the rest at once
      const Z = typeof zh === "string" ? zh : "", E = en || "", dur = Math.min(2600, Math.max(Z.length / 32, E.length / 75) * 1000), t0 = performance.now();
      clearInterval(typing);
      const type = () => {
        const k = dur ? Math.min(1, (performance.now() - t0) / dur) : 1;
        $(".town-zh").textContent = Z.slice(0, Math.ceil(Z.length * k));
        $(".town-en").textContent = E.slice(0, Math.ceil(E.length * k));
        $(".town-more").style.visibility = k < 1 ? "hidden" : "";
        if (k >= 1) { clearInterval(typing); typing = null; }
      };
      typing = setInterval(type, 30); type();
      finishTyping = () => { clearInterval(typing); typing = null; $(".town-zh").textContent = Z; $(".town-en").textContent = E; $(".town-more").style.visibility = ""; };
      const face = $(".town-face"), fc = face.getContext("2d");
      fc.clearRect(0, 0, 34, 34);
      // a painted portrait when there is one (assets/tk/portraits), else the pixel bust
      const pic = $(".town-portrait"), file = painted && who && TownUI.portraits[who];
      if (file) {
        const src = `assets/tk/portraits/${file}?v=${TownUI.PORTRAIT_V}`;
        if (pic.dataset.who !== who) { pic.dataset.who = who; pic.src = src; pic.classList.remove("in"); void pic.offsetWidth; pic.classList.add("in"); }
        pic.hidden = false;
      } else { pic.hidden = true; pic.dataset.who = ""; }
      $(".town-dlg").classList.toggle("has-portrait", !!file);
      face.hidden = !who || !!file;
      if (who && !file) fc.drawImage(TKArt.get(who, "bust"), 0, 0);
      if (vid) TKVoice.play(vid); else TKVoice.stop();
    };
    const focus = () => { const f = host.querySelector(".town-focus"); if (f) f.hidden = TOUCH || document.activeElement === host; };   // on a phone a tap works either way
    if (!host.dataset.townFocus) { host.dataset.townFocus = "1"; host.addEventListener("focus", focus); host.addEventListener("blur", focus); }
    setTimeout(focus, 0);
    return {
      busy: () => open,
      // Chinese leads, English follows.
      // hint: [en, zh] of counsel still to act on, kept quieter under the goal
      goal(t, zh, hint) {
        const g = $(".town-goal"); g.textContent = "";
        g.append(Object.assign(document.createElement("span"), { className: "town-lead" }));   // who you're playing (apo110: the party leader changes in Book 2)
        this.lead();
        g.append(Object.assign(document.createElement("span"), { className: "town-goal-main", textContent: zh || t }));
        g.onclick = e => { e.stopPropagation(); if (scene.walkToGoal) scene.walkToGoal(); };   // tap the goal: head for it
        if (zh) g.append(Object.assign(document.createElement("span"), { className: "town-goal-en", textContent: t }));
        if (hint && hint[0]) {
          const h = Object.assign(document.createElement("span"), { className: "town-goal-hint" });
          h.append(Object.assign(document.createElement("span"), { lang: "zh-CN", textContent: `“${hint[1] || hint[0]}”` }));
          if (hint[1]) h.append(Object.assign(document.createElement("span"), { className: "town-goal-en", textContent: `“${hint[0]}”` }));
          g.append(h);
        }
      },
      // the chip at the top of the goal box: the walker's pixel bust and name
      lead() {
        const el = $(".town-lead"), who = scene.lead;
        if (!el || !who) return;
        if (el.dataset.who === who) return;
        el.dataset.who = who; el.textContent = "";
        const c = Object.assign(document.createElement("canvas"), { width: 34, height: 34, className: "town-lead-face" });
        try { c.getContext("2d").drawImage(TKArt.get(who, "bust"), 0, 0); } catch {}
        el.append(c, Object.assign(document.createElement("span"), { textContent: tkName(who) }));
        el.title = `你在扮演 ${tkName(who)} · You are playing`;
      },
      place(name, zh) {
        const el = $(".town-place"); el.textContent = zh || name; el.lang = zh ? "zh-CN" : "en";
        if (zh) el.append(Object.assign(document.createElement("span"), { className: "town-place-en", lang: "en", textContent: name }));
        el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
      },
      // style "story": the plot, framed and with the map dimmed; "chat": townsfolk and asides, small and plain
      dialog(steps, cb, style = "chat") {
        queue = steps.filter(s => s[0] === "n" || s[0] === "say").slice(); done = cb || null; open = true;
        const dlg = $(".town-dlg");
        dlg.classList.toggle("story", style === "story"); dlg.classList.toggle("chat", style !== "story");
        $(".town-dim").hidden = style !== "story";
        dlg.hidden = false; show();
      },
      advance() { if (!open) return; if (typing) finishTyping(); else show(); },
      hint(target) {   // (no floating "Tap" label any more: a ring on the ground marks what he'd act on)
        const h = $(".town-hint");
        if (!target || h) { if (h) h.hidden = true; return; }
        const cam = scene.cameras.main, cv = scene.game.canvas, k = cv.clientWidth / scene.scale.width;
        const r = cv.getBoundingClientRect(), rr = root.getBoundingClientRect();
        h.hidden = false;
        h.style.left = (r.left - rr.left + (target.x - cam.worldView.x) * cam.zoom * k) + "px";
        h.style.top = (r.top - rr.top + (target.y - 30 - cam.worldView.y) * cam.zoom * k) + "px";
      },
    };
  },
};

/* ---------- Phaser, loaded only when a world opens ---------- */
const TownLoad = {
  phaser: null,
  ready() {
    if (window.Phaser) return Promise.resolve();
    return this.phaser || (this.phaser = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js";
      s.onload = res; s.onerror = () => { this.phaser = null; rej(new Error("Couldn't load the game engine. Check your connection and reload.")); };
      document.head.append(s);
    }));
  },
};
