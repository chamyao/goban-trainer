/* ================= the event calendar: seasons, their currencies and cosmetic shops ================= */
// The user: "I like an event calendar" (after the collectibles research: DragonVale's limited seasonal events with a
// yearly comeback, Mahjong Soul's event shops, Neopets' albums), with "calendar + seasons + rewards" and Western
// holidays, Chinese festivals and Go events. Each event has its own currency, earned by solving: a problem never
// solved before, first try (no hint, no wrong move), pays once ever, so there's nothing to grind; a turning point or
// key move found pays 3; the first solve of a day 2 more. It's spent in the event's shop on looks only (never a rating
// or a problem): a board, a title by the player's name, a hat for Sun Wukong. A shop opens with its event and comes
// back the next year. Two events at once: the shorter is featured (its look, its currency).
// The ledger rides the progress row (progress.ev: earn {event: {source: n}}, own {item: 1}, eq {title, hat}), merged
// by union, so two devices never lose a coin or an item.
const Events = (() => {
  // the lunar festivals' days (Chinese calendar), by year: Spring Festival, Dragon Boat (5/5), Qixi (7/7), Mid-Autumn (8/15)
  const LUNAR = {
    2026: { cny: [2, 17], db: [6, 19], qx: [8, 19], ma: [9, 25] },
    2027: { cny: [2, 6], db: [6, 9], qx: [8, 8], ma: [9, 15] },
    2028: { cny: [1, 26], db: [5, 28], qx: [8, 26], ma: [10, 3] },
    2029: { cny: [2, 13], db: [6, 16], qx: [8, 16], ma: [9, 22] },
    2030: { cny: [2, 3], db: [6, 5], qx: [8, 5], ma: [9, 12] },
  };
  // Western Easter (the computus) and US Thanksgiving (the fourth Thursday of November)
  const easter = y => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 114); return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1); };
  const thanksgiving = y => { const d = new Date(y, 10, 1); return new Date(y, 10, 1 + ((4 - d.getDay() + 7) % 7) + 21); };
  const D = (y, m, d) => new Date(y, m - 1, d);
  const around = (day, before, after) => [new Date(+day - before * 864e5), new Date(+day + after * 864e5)];
  const lunar = (y, k) => LUNAR[y] && D(y, ...LUNAR[y][k]);

  // kind: west | china | go. when(y): [start, end] in year y (end inclusive), or null (no date known)
  const LIST = [
    { id: "kisei", name: "Kisei Season", native: "棋聖戦", kind: "go", icon: "⭐", cur: ["star", "stars"],
      blurb: "Japan's biggest title, decided each winter.", when: y => [D(y, 1, 6), D(y, 1, 28)] },
    { id: "spring-festival", name: "Spring Festival", native: "春节", kind: "china", icon: "🧧", cur: ["red envelope", "red envelopes"],
      blurb: "The Lunar New Year, to the Lantern Festival.", when: y => lunar(y, "cny") && around(lunar(y, "cny"), 7, 14) },
    { id: "valentines", name: "Valentine's", native: "情人节", kind: "west", icon: "💝", cur: ["heart", "hearts"],
      blurb: "", when: y => [D(y, 2, 10), D(y, 2, 15)] },
    { id: "alphago", name: "AlphaGo Week", native: "人机大战", kind: "go", icon: "💠", cur: ["chip", "chips"],
      blurb: "The anniversary of AlphaGo against Lee Sedol, March 2016: move 37, and Lee's move 78.", when: y => [D(y, 3, 9), D(y, 3, 15)] },
    { id: "spring", name: "Spring", native: "春", kind: "west", icon: "🥚", cur: ["egg", "eggs"],
      blurb: "Easter and the spring.", when: y => around(easter(y), 10, 7) },
    { id: "honinbo", name: "Honinbo Season", native: "本因坊", kind: "go", icon: "🪭", cur: ["fan", "fans"],
      blurb: "The oldest title, ending on Honinbo Shusaku's birthday (June 6).", when: y => [D(y, 5, 20), D(y, 6, 6)] },
    { id: "go-seigen", name: "Go Seigen Week", native: "吴清源", kind: "go", icon: "🏯", cur: ["seal", "seals"],
      blurb: "For Go Seigen's birthday, June 12, 1914.", when: y => [D(y, 6, 9), D(y, 6, 15)] },
    { id: "dragon-boat", name: "Dragon Boat", native: "端午", kind: "china", icon: "🐉", ci: "🍙", cur: ["zongzi", "zongzi"],
      blurb: "", when: y => lunar(y, "db") && around(lunar(y, "db"), 4, 3) },
    { id: "summer", name: "Summer", native: "夏", kind: "west", icon: "🐚", cur: ["shell", "shells"],
      blurb: "", when: y => [D(y, 7, 1), D(y, 8, 3)] },
    { id: "qixi", name: "Qixi", native: "七夕", kind: "china", icon: "🪶", cur: ["magpie feather", "magpie feathers"],
      blurb: "The weaver and the cowherd meet on the magpie bridge.", when: y => lunar(y, "qx") && around(lunar(y, "qx"), 3, 2) },
    { id: "kyu-to-dan", name: "Kyu to Dan", native: "升段", kind: "go", icon: "📜", cur: ["scroll", "scrolls"],
      blurb: "A push for the next rank.", when: y => [D(y, 8, 15), D(y, 9, 5)] },
    { id: "mid-autumn", name: "Mid-Autumn", native: "中秋", kind: "china", icon: "🥮", cur: ["mooncake", "mooncakes"],
      blurb: "", when: y => lunar(y, "ma") && around(lunar(y, "ma"), 5, 3) },
    { id: "halloween", name: "Halloween", native: "万圣节", kind: "west", icon: "🎃", ci: "🍬", cur: ["candy", "candy"],
      blurb: "The haunted go hall, and the stones are candy.", when: y => [D(y, 10, 1), D(y, 11, 2)] },
    { id: "harvest", name: "Harvest", native: "感恩节", kind: "west", icon: "🌰", cur: ["acorn", "acorns"],
      blurb: "Thanksgiving.", when: y => around(thanksgiving(y), 10, 4) },
    { id: "winter", name: "Winter", native: "冬", kind: "west", icon: "❄️", cur: ["snowflake", "snowflakes"],
      blurb: "", when: y => [D(y, 12, 1), D(y + 1, 1, 5)] },
  ];
  for (const e of LIST) e.ci = e.ci || e.icon;   // (the currency's icon: the event's, unless it has its own)
  const KINDS = { west: "Holiday", china: "Chinese festival", go: "Go event" };
  // the seasons with a look of their own (theme-seasonal.css: body.season-<id>); the others show Classic until painted
  const RESKINS = ["halloween", "harvest"];

  // the shops: looks only. board: a board look (BoardTheme), title: by the player's name, hat: on Sun Wukong
  const ITEMS = [
    { id: "board-haunted", rar: "SR", ev: "halloween", type: "board", name: "Haunted board", price: 15,
      board: { id: "haunted", name: "Haunted", wood: ["#8a78a6", "#7d6b99", "#705e8c"], tex: "assets/boards/haunted.webp?v=2", line: "#1c1228", label: "#f0e6ff", stone: "rgba(0,0,0,.45)" } },
    { id: "stones-candy", rar: "SSR", ev: "halloween", type: "stones", name: "Candy stones", icon: "🍬", price: 20 },
    { id: "title-pumpkin-king", rar: "R", ev: "halloween", type: "title", name: "Pumpkin King", icon: "🎃", price: 10 },
    { id: "hat-witch", rar: "SR", ev: "halloween", type: "hat", name: "Witch hat for Sun Wukong", price: 25 },
    // not for sale: the sign-in calendar's prizes (slot) and the event goals' (goals)
    { id: "hat-pumpkin", rar: "SR", ev: "halloween", type: "hat", name: "Pumpkin hat for Sun Wukong", price: 0, gift: true, slot: 5 },
    { id: "board-moonlit", rar: "SSR", ev: "halloween", type: "board", name: "Moonlit board", price: 0, gift: true, slot: 10,
      board: { id: "moonlit", name: "Moonlit", wood: ["#3d5584", "#344a75", "#2c4067"], tex: "assets/boards/moonlit.webp", line: "#e6eeff", label: "#d4e0fa", stone: "rgba(255,255,255,.45)" } },
    { id: "title-trick-or-treater", rar: "SR", ev: "halloween", type: "title", name: "Trick-or-Treater", icon: "🍭", price: 0, gift: true, goals: true },
    // the avatars' skins (Graphics, assets/tk/portraits/skins; the user: "give Ahn Young-ji, Diaochan, Cao Cao skins, not all
    // Halloween"), one worn per character; priced for a player who earns 15–20 a day (the user: "I earned enough to buy out
    // the whole store in 1–2 days, price the new stuff to make it more challenging"): the three, 220, about the rest of
    // the event played daily
    { id: "skin-diaochan-fox", rar: "SSR", ev: "halloween", type: "skin", who: "diaochan", file: "skins/diaochan-fox.webp", name: "Diaochan · Fox spirit", price: 90 },
    { id: "skin-caocao-armor", rar: "SR", ev: "halloween", type: "skin", who: "caocao", file: "skins/caocao-armor.webp", name: "Cao Cao · Battle armour", price: 70 },
    { id: "skin-ahn-weekend", rar: "SR", ev: "halloween", type: "skin", who: "ms_ahn", file: "skins/ahn-weekend.webp", name: "Ahn Young-ji · Autumn weekend", price: 60 },
  ];
  // what an item is worn in: one of each type, but a skin per character
  const slot = it => it.type === "skin" ? `skin:${it.who}` : it.type;

  // The sign-in calendar, DragonVale's (the user: "a calendar by event with sign-in bonus and special event, similar to
  // DragonVale"): a day the site is opened in an event fills its calendar's next slot, so a missed day only waits;
  // ten slots, the fifth and tenth the event's own prizes (or more of its currency, for an event without)
  const CAL = [3, 3, 5, 3, "prize", 3, 3, 5, 3, "prize"];
  const CAL_FINAL_BONUS = 10;
  // the special event's goals, the same in every event; all three done: the event's goal prize
  const GOALS = [
    { id: "solve10", need: 10, of: "solved", pay: 10, text: "Solve 10 problems you've never solved, first try" },
    { id: "turn3", need: 3, of: "turning", pay: 10, text: "Find 3 turning points or key moves, first try" },
    { id: "signin5", need: 5, of: "signins", pay: 5, text: "Sign in on 5 days" },
  ];

  // the event windows of the years around d
  const windows = d => {
    const out = [];
    for (const y of [d.getFullYear() - 1, d.getFullYear(), d.getFullYear() + 1]) for (const e of LIST) {
      const w = e.when(y);
      if (w) out.push({ ev: e, start: w[0], end: new Date(+w[1] + 864e5 - 1) });   // (to the end of the last day)
    }
    return out;
  };
  const now = () => { try { const f = localStorage.getItem("gt-event-date"); if (f) return new Date(f); } catch {} return new Date(); };   // (tests)
  const active = (d = now()) => windows(d).filter(w => w.start <= d && d <= w.end).sort((a, b) => (a.end - a.start) - (b.end - b.start));
  const featured = (d = now()) => active(d)[0] || null;
  const upcoming = (d = now(), days = 366) => windows(d).filter(w => w.start > d && +w.start - d < days * 864e5).sort((a, b) => a.start - b.start);

  // the ledger
  const ledger = () => { const p = loadProgress(); return p.ev || { earn: {}, own: {}, eq: {}, days: {} }; };
  const store = f => { const p = loadProgress(); p.ev = p.ev || {}; for (const k of ["earn", "own", "eq", "days"]) p.ev[k] = p.ev[k] || {}; f(p.ev); TK.saveProg(p); eqAt = 0; };
  const earned = (L, ev) => Object.values((L.earn || {})[ev] || {}).reduce((a, b) => a + b, 0);
  const spent = (L, ev) => ITEMS.filter(it => it.ev === ev && (L.own || {})[it.id]).reduce((a, it) => a + it.price, 0);
  const balance = (ev, L = ledger()) => Math.max(0, earned(L, ev) - spent(L, ev));
  const owns = id => !!(ledger().own || {})[id];
  const today = () => { const d = now(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  // pays the featured event's currency for a source (a problem, a turning point), once ever per source
  function earn(source, n) {
    const f = featured();
    if (!f) return 0;
    const ev = f.ev.id;
    let got = 0;
    store(E => {
      const book = E.earn[ev] = E.earn[ev] || {};
      if (book[source]) return;
      book[source] = n; got = n;
      const day = `day:${today()}`;   // the day's first solve: 2 more
      if (!book[day]) { book[day] = 2; got += 2; }
    });
    if (got) { toast(f.ev, `+${got} ${f.ev.cur[got === 1 ? 0 : 1]}`); chip(); }
    return got;
  }
  // what the event's goals count, from the ledger
  function counts(ev, L = ledger()) {
    const keys = Object.keys((L.earn || {})[ev] || {});
    return { solved: keys.filter(k => !/^(tp|day|cal|goal):/.test(k)).length, turning: keys.filter(k => k.startsWith("tp:")).length,
             signins: Object.keys((L.days || {})[ev] || {}).length };
  }
  const prizes = ev => ITEMS.filter(it => it.ev === ev && it.gift && it.slot).sort((a, b) => a.slot - b.slot);
  // a slot's reward: [currency, prize item or null]
  function slotReward(ev, i) {
    const r = CAL[i - 1];
    if (r !== "prize") return [r, null];
    const it = prizes(ev).find(x => x.slot === i);
    return it ? [i === CAL.length ? CAL_FINAL_BONUS : 0, it] : [10, null];
  }
  // today's sign-in, and any slot the days signed in have reached and not yet paid (two devices: each day once)
  function checkIn() {
    const f = featured();
    if (!f) return;
    const ev = f.ev.id, got = [];
    store(E => {
      const days = E.days[ev] = E.days[ev] || {}, book = E.earn[ev] = E.earn[ev] || {};
      days[today()] = 1;
      const n = Math.min(CAL.length, Object.keys(days).length);
      for (let i = 1; i <= n; i++) {
        if (book[`cal:${i}`] != null) continue;
        const [coins, it] = slotReward(ev, i);
        book[`cal:${i}`] = coins;
        if (it) E.own[it.id] = 1;
        got.push([i, coins, it]);
      }
    });
    if (!got.length) return;
    chip();
    // the sign-in's rewards shown off where it's no interruption (the Library, the Events page); elsewhere a note
    const coins = got.reduce((a, x) => a + x[1], 0), items = got.map(x => x[2]).filter(Boolean);
    if (/^(#\/?)?$|^#\/events/.test(location.hash)) {
      reward(`Day ${got[got.length - 1][0]} sign-in`, [...(coins ? [coinTile(f.ev, coins)] : []), ...items.map(itemTile)]);
      if (location.hash === "#/events") view();
    } else toast(f.ev, `Day ${got[got.length - 1][0]} sign-in: +${coins}${items.length ? ` and ${items.map(x => x.name).join(", ")}` : ""}`);
  }
  function claimGoal(id, quiet) {
    const f = featured(), g = GOALS.find(x => x.id === id);
    if (!f || !g) return false;
    const ev = f.ev.id, c = counts(ev);
    if (c[g.of] < g.need) return false;
    let ok = false;
    store(E => { const book = E.earn[ev] = E.earn[ev] || {}; if (book[`goal:${id}`] == null) { book[`goal:${id}`] = g.pay; ok = true; }
      // all of them: the goal prize
      if (GOALS.every(x => book[`goal:${x.id}`] != null)) for (const it of ITEMS.filter(x => x.ev === ev && x.goals)) E.own[it.id] = 1; });
    if (ok) { if (!quiet) toast(f.ev, `+${g.pay} ${f.ev.cur[1]}`); chip(); }
    return ok;
  }
  function buy(id) {
    const it = ITEMS.find(x => x.id === id);
    if (!it || it.gift || owns(id) || balance(it.ev) < it.price) return false;
    const f = featured();
    if (!f || f.ev.id !== it.ev) return false;   // (a shop is open only in its event)
    store(E => { E.own[id] = 1; });
    equip(id, true);
    return true;
  }
  function equip(id, on) {
    const it = ITEMS.find(x => x.id === id);
    if (!it || !owns(id)) return;
    if (it.type === "board") { try { on ? localStorage.setItem(BoardTheme.KEY, it.board.id) : localStorage.removeItem(BoardTheme.KEY); } catch {} BoardTheme.paintAll(); BoardTheme.label(); return; }
    store(E => { const k = slot(it); if (on) E.eq[k] = id; else if (E.eq[k] === id) E.eq[k] = ""; });
    if (it.type === "skin" && typeof Avatars !== "undefined") Avatars.mount();   // (the figure by the board in its new clothes)
    if (it.type === "title" && typeof Sync !== "undefined") Sync.renderChip();
    if (it.type === "stones") { if (on) Candy.load(); route(); }
  }
  // (asked by Sun Wukong every frame: the ledger is read at most once a second)
  let eqAt = 0, eqL = null;
  const equipped = type => {
    if (Date.now() - eqAt > 1000) { eqL = ledger(); eqAt = Date.now(); }
    const id = (eqL.eq || {})[type]; return id && (eqL.own || {})[id] ? ITEMS.find(x => x.id === id) : null;
  };
  const isOn = it => it.type === "board" ? BoardTheme.current.id === it.board.id : !!(equipped(slot(it)) && equipped(slot(it)).id === it.id);
  // two copies of the ledger: earnings and items by union; what's worn, this browser's unless it has nothing
  function merge(l, r) {
    if (!r) return l;
    if (!l) return r;
    const o = { earn: {}, days: {}, own: { ...(r.own || {}), ...(l.own || {}) }, eq: { ...(r.eq || {}), ...(l.eq || {}) } };
    for (const src of [r.earn || {}, l.earn || {}]) for (const ev in src) o.earn[ev] = { ...(o.earn[ev] || {}), ...src[ev] };
    o.days = {};
    for (const src of [r.days || {}, l.days || {}]) for (const ev in src) o.days[ev] = { ...(o.days[ev] || {}), ...src[ev] };
    return o;
  }

  // what a prize looks like, in the shop (the user: "show off what the prizes look like in the shop")
  function preview(it, small) {
    const box = h("div", { class: `event-preview event-preview-${it.type}${small ? " small" : ""}` });
    if (it.type === "board" || it.type === "stones") {
      const t = it.type === "board" ? it.board : BoardTheme.LIST[0], n = 5, cell = 22, pad = 14, W = pad * 2 + cell * (n - 1);
      const stones = [[1, 1, 1], [2, 1, 2], [3, 2, 1], [1, 3, 2], [2, 2, 2], [3, 3, 1]];
      let svg = `<svg viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><rect width="${W}" height="${W}" rx="6" fill="${t.wood[1]}"/>`;
      if (t.tex) svg += `<clipPath id="pv-${t.id}"><rect width="${W}" height="${W}" rx="6"/></clipPath><image href="${t.tex}" width="${W}" height="${W}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pv-${t.id})"/>`;
      for (let i = 0; i < n; i++) svg += `<line x1="${pad}" y1="${pad + i * cell}" x2="${W - pad}" y2="${pad + i * cell}" stroke="${t.line}"/><line x1="${pad + i * cell}" y1="${pad}" x2="${pad + i * cell}" y2="${W - pad}" stroke="${t.line}"/>`;
      for (const [c, r, col] of stones) {
        const x = pad + c * cell, y = pad + r * cell;
        svg += it.type === "stones" ? `<image href="${Candy.sprite(col, c, r) || ""}" x="${x - cell / 2}" y="${y - cell / 2}" width="${cell}" height="${cell}"/>`
          : `<circle cx="${x}" cy="${y}" r="${cell * .46}" fill="${col === 1 ? "#1b1b1b" : "#f4f4ee"}" stroke="${t.stone}"/>`;
      }
      box.innerHTML = svg + "</svg>";
      if (it.type === "stones") Candy.load();
    } else if (it.type === "title") {
      box.append(small ? h("span", { class: "auth-chip event-title-chip" }, it.name)   // (a small tile: the title alone)
        : h("span", { class: "auth-chip event-title-chip" }, [h("span", {}, `Playing as ${(typeof Sync !== "undefined" && Sync.username) || "you"}`),
          h("span", { class: "player-title" }, ` · ${it.name}`)]));
    } else if (it.type === "skin") {   // the character in it
      box.append(h("img", { class: "event-skin", src: `assets/tk/portraits/${it.file}?v=${(typeof TownUI !== "undefined" && TownUI.PORTRAIT_V) || 0}`, alt: it.name }));
    } else if (it.type === "hat" && typeof WK !== "undefined") {
      const rows = WK.HAT_ROWS(it.id), cv = document.createElement("canvas");
      cv.width = 22; cv.height = rows + 15; cv.className = "event-hat";
      WK.drawHatted(cv.getContext("2d"), it.id);
      box.append(cv);
    }
    return box;
  }

  // the page's art (tools/gen_event_art.py): each event's banner and currency, the tabs' icons; no emoji on the page
  // (the user: "avoid relying on emojis")
  const ART = "assets/events/", AV = 1;
  const art = name => `${ART}${name}?v=${AV}`;
  const curImg = (ev, cls = "") => h("img", { class: `ev-cur ${cls}`, src: art(`cur-${ev.id}.png`), alt: ev.cur[1], draggable: "false" });
  const icon = (name, cls = "") => h("img", { class: `ev-icon ${cls}`, src: art(`${name}.png`), alt: "", draggable: "false" });
  const evOf = it => LIST.find(e => e.id === it.ev);
  const RAR = { R: "Rare", SR: "Super rare", SSR: "Legendary" };
  const TYPE = { board: "Board", title: "Title by your name", hat: "Sun Wukong's hat", stones: "Stones", skin: "Avatar skin" };
  const DESC = { board: "A board to play on, in the board cycle.", title: "Shown by your name, everywhere.", hat: "Sun Wukong wears it in the story.",
                 stones: "Candy corn and chocolate truffles for stones.", skin: "Your avatar wears it beside your boards, when you play as them." };

  // a passing note (a coin earned): the currency's own picture, not an emoji
  function toast(ev, text) {
    const t = h("div", { class: "event-toast" }, [ev ? curImg(ev) : null, h("span", {}, text)].filter(Boolean));
    document.body.append(t);
    setTimeout(() => t.remove(), 2400);
  }
  // rewards got: shown off, one tile after another, over a turning burst of light (a sign-in, a goal, a purchase)
  function reward(title, tiles) {
    document.querySelectorAll(".ev-reward").forEach(x => x.remove());
    const close = () => { o.classList.add("out"); setTimeout(() => o.remove(), 220); };
    const o = h("div", { class: "ev-reward", onclick: close }, [
      h("div", { class: "ev-reward-rays" }),
      h("div", { class: "ev-reward-box" }, [
        h("div", { class: "ev-reward-title" }, title),
        h("div", { class: "ev-reward-tiles" }, tiles.map(([pic, label, rar], i) =>
          h("div", { class: `ev-tile ev-rar-${rar || "N"}`, style: `animation-delay:${.12 + i * .12}s` }, [h("div", { class: "ev-tile-pic" }, [pic]), h("div", { class: "ev-tile-label" }, label)]))),
        h("div", { class: "ev-reward-hint" }, "Tap to continue"),
      ]),
    ]);
    document.body.append(o);
    return o;
  }
  const coinTile = (ev, n) => [curImg(ev, "big"), `${ev.cur[n === 1 ? 0 : 1]} ×${n}`];
  const itemTile = it => [preview(it, true), it.name, it.rar];

  // the header chip: the featured event's currency and balance, or the calendar between events
  function chip() {
    let c = document.getElementById("eventChip");
    const f = featured();
    if (!c) {
      const after = document.getElementById("boardChip");
      if (!after) return;
      c = h("a", { id: "eventChip", class: "theme-chip event-chip", href: "#/events", title: "Events" });
      after.before(c);
    }
    c.replaceChildren(...(f ? [curImg(f.ev), h("span", {}, String(balance(f.ev.id)))] : [icon("calendar"), h("span", {}, "Events")]));
  }

  const fmt = d => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const left = end => { const days = Math.ceil((end - now()) / 864e5); return days <= 1 ? "ends today" : `${days} days left`; };
  const countdown = end => {
    const ms = Math.max(0, end - now()), d = Math.floor(ms / 864e5), hr = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
    return d ? `${d}d ${hr}h ${m}m` : `${hr}h ${m}m`;
  };
  // the host's word: the picked avatar, standing on the banner
  const HOST = [
    ev => `${ev.name} is here! Every problem you solve first try earns ${ev.cur[1]}.`,
    ev => `Sign in each day: the fifth and tenth days hold something special.`,
    ev => `The shop closes when ${ev.name} ends. Spend your ${ev.cur[1]} before then.`,
    ev => `A turning point found is worth three ${ev.cur[1]}. Shall we look at your games?`,
  ];
  // what's waiting to be claimed (a red dot on its tab)
  const claimable = ev => { const book = (ledger().earn || {})[ev.id] || {}, c = counts(ev.id);
    return GOALS.filter(g => c[g.of] >= g.need && book[`goal:${g.id}`] == null).length; };
  let tab = (() => { try { return localStorage.getItem("gt-event-tab") || "signin"; } catch { return "signin"; } })();

  function view(to) {
    if (to) tab = to;
    try { localStorage.setItem("gt-event-tab", tab); } catch {}
    Candy.load();   // (the candy stones' picture in the shop)
    crumbs.innerHTML = "";
    crumbs.append(h("a", { href: "#/" }, "Library"), " / Events");
    root.innerHTML = "";
    const f = featured(), d = now();
    if (!f) {
      root.append(h("div", { class: "ev-page ev-none" }, [
        h("div", { class: "ev-banner event-hero ev-banner-none" }, [h("div", { class: "ev-banner-text" }, [
          h("div", { class: "ev-kicker" }, "Events"), h("h1", { class: "ev-title" }, "Between events"),
          h("div", { class: "ev-sub" }, "No event is on right now. The next one opens its own sign-in, tasks and shop."),
        ])]),
        collection(null),
      ]));
      return;
    }
    const ev = f.ev, bal = balance(ev.id), others = active(d).slice(1);
    const clock = h("span", { class: "ev-clock" }, countdown(f.end));
    const tick = setInterval(() => { if (!clock.isConnected) return clearInterval(tick); clock.textContent = countdown(f.end); }, 20000);
    const hostBox = h("div", { class: "ev-host" });
    if (typeof Avatars !== "undefined") Avatars.host().then(a => { if (!a) return;
      hostBox.append(h("img", { class: "ev-host-img", src: a.src, alt: a.name }),
        h("div", { class: "ev-host-say" }, [h("div", { class: "ev-host-name" }, a.name), h("div", {}, HOST[Math.floor(Math.random() * HOST.length)](ev))])); });
    const banner = h("div", { class: "ev-banner event-hero", style: `background-image:url('${art(`banner-${ev.id}.webp`)}')` }, [
      h("div", { class: "ev-banner-text" }, [
        h("div", { class: "ev-kicker" }, `Limited event · ${KINDS[ev.kind]}`),
        h("h1", { class: "ev-title event-name" }, ev.name),
        h("div", { class: "ev-native" }, ev.native),
        ev.blurb ? h("div", { class: "ev-sub" }, ev.blurb) : null,
        h("div", { class: "ev-when" }, [h("span", {}, `${fmt(f.start)} – ${fmt(f.end)}`), h("span", { class: "ev-ends" }, ["Ends in ", clock])]),
        others.length ? h("div", { class: "ev-also" }, `Also on: ${others.map(o => o.ev.name).join(", ")}`) : null,
      ].filter(Boolean)),
      hostBox,
      h("div", { class: "ev-wallet event-balance", title: `Your ${ev.cur[1]}` }, [curImg(ev), h("b", {}, String(bal))]),
    ]);
    const dots = { tasks: claimable(ev) };
    const TABS = [["signin", "Sign-in", "tab-signin"], ["tasks", "Tasks", "tab-tasks"], ["shop", "Shop", "tab-shop"], ["collection", "Collection", "tab-collection"]];
    const nav = h("nav", { class: "ev-tabs" }, TABS.map(([id, label, ic]) => h("button", { class: "ev-tab" + (tab === id ? " on" : ""), onclick: () => view(id) },
      [icon(ic), h("span", {}, label), dots[id] ? h("i", { class: "ev-dot" }, String(dots[id])) : null].filter(Boolean))));
    const panel = h("section", { class: "ev-panel" }, [{ signin, tasks, shop, collection }[tab] ? { signin, tasks, shop, collection }[tab](ev) : signin(ev)]);
    root.append(h("div", { class: `ev-page ev-${ev.id}` }, [banner, h("div", { class: "ev-body" }, [nav, panel])]));
  }

  // the sign-in calendar: ten days, the fifth and tenth the event's prizes
  function signin(ev) {
    const L = ledger(), book = (L.earn || {})[ev.id] || {}, signed = Object.keys((L.days || {})[ev.id] || {}).length;
    return h("div", {}, [
      h("div", { class: "ev-head" }, [h("h2", {}, "Daily sign-in"), h("span", { class: "ev-count" }, `${Math.min(signed, CAL.length)} / ${CAL.length}`)]),
      h("p", { class: "ev-note" }, `Open the site on a day of ${ev.name} to sign in for the next day. A missed day just waits.`),
      h("div", { class: "cal-grid" }, CAL.map((_, j) => {
        const i = j + 1, [coins, it] = slotReward(ev.id, i), done = book[`cal:${i}`] != null;
        return h("div", { class: "cal-day" + (done ? " done" : "") + (i === signed + 1 ? " next" : "") + (it ? ` prize ev-rar-${it.rar || "SR"}` : "") }, [
          h("div", { class: "cal-n" }, `Day ${i}`),
          h("div", { class: "cal-pic" }, [it ? preview(it, true) : curImg(ev, "big")]),
          h("div", { class: "cal-what" }, it ? it.name : `×${coins}`),
          it && coins ? h("div", { class: "cal-plus" }, [curImg(ev), `×${coins}`]) : null,
          done ? h("div", { class: "cal-check ev-stamp" }, "Claimed") : null,
        ].filter(Boolean));
      })),
    ]);
  }
  // the event's tasks (goals), and the prize for all three
  function tasks(ev) {
    const book = (ledger().earn || {})[ev.id] || {}, c = counts(ev.id), goalPrize = ITEMS.find(x => x.ev === ev.id && x.goals);
    const go = { solved: "#/stream", turning: "#/turning", signins: null };
    const claim = ids => { const got = ids.filter(id => claimGoal(id, true));
      if (!got.length) return;
      const pay = got.reduce((a, id) => a + GOALS.find(g => g.id === id).pay, 0);
      const tiles = [coinTile(ev, pay)];
      if (goalPrize && GOALS.every(g => book[`goal:${g.id}`] != null || got.includes(g.id))) tiles.push(itemTile(goalPrize));
      reward("Rewards", tiles); view(); };
    const ready = GOALS.filter(g => c[g.of] >= g.need && book[`goal:${g.id}`] == null).map(g => g.id);
    const allDone = GOALS.every(g => book[`goal:${g.id}`] != null);
    return h("div", {}, [
      h("div", { class: "ev-head" }, [h("h2", {}, "Event tasks"),
        ready.length > 1 ? h("button", { class: "ev-btn gold", onclick: () => claim(ready) }, "Claim all") : null].filter(Boolean)),
      h("div", { class: "event-list" }, [...GOALS.map(g => {
        const have = Math.min(g.need, c[g.of]), claimed = book[`goal:${g.id}`] != null, can = have >= g.need && !claimed;
        return h("div", { class: "event-row goal-row ev-task" + (claimed ? " claimed" : can ? " ready" : "") }, [
          h("div", { class: "ev-task-main" }, [h("b", {}, g.text),
            h("div", { class: "ev-bar" }, [h("div", { style: `width:${100 * have / g.need}%` })]), h("span", { class: "ev-prog" }, `${have} / ${g.need}`)]),
          h("div", { class: "ev-task-pay" }, [curImg(ev, "mid"), h("span", {}, `×${g.pay}`)]),
          claimed ? h("div", { class: "ev-stamp small" }, "Claimed")
            : can ? h("button", { class: "ev-btn gold", onclick: () => claim([g.id]) }, "Claim")
            : go[g.of] ? h("a", { class: "ev-btn", href: go[g.of] }, "Go") : h("span", { class: "ev-btn off" }, "Tomorrow"),
        ]);
      }), goalPrize ? h("div", { class: `event-row goal-row ev-task ev-grand ev-rar-${goalPrize.rar || "SR"}` + (allDone ? " claimed" : "") }, [
        h("div", { class: "ev-grand-pic" }, [preview(goalPrize, true)]),
        h("div", { class: "ev-task-main" }, [h("div", { class: "ev-kicker" }, "Complete all three"), h("b", {}, goalPrize.name),
          h("span", { class: "ev-note" }, `${TYPE[goalPrize.type]} · not in the shop`)]),
        allDone ? h("div", { class: "ev-stamp small" }, "Yours") : h("span", { class: "ev-prog" }, `${GOALS.filter(g => book[`goal:${g.id}`] != null).length} / ${GOALS.length}`),
      ]) : null].filter(Boolean)),
      h("p", { class: "ev-note" }, `Earn ${ev.cur[1]} by solving: 1 for a problem you've never solved, first try (no hint, no wrong move); 3 for a turning point or key move you find; 2 more for the day's first. Each problem pays once.`),
    ]);
  }
  // the exchange shop: a card per item; a tap opens it, to look at and exchange
  function shop(ev) {
    const items = ITEMS.filter(it => it.ev === ev.id && !it.gift), bal = balance(ev.id);
    if (!items.length) return h("div", {}, [h("div", { class: "ev-head" }, [h("h2", {}, "Exchange shop")]), h("p", { class: "ev-note" }, "This event's shop is still being stocked.")]);
    return h("div", {}, [
      h("div", { class: "ev-head" }, [h("h2", {}, "Exchange shop"), h("span", { class: "ev-count" }, [curImg(ev), String(bal)])]),
      h("div", { class: "ev-shop" }, items.map(it => {
        const own = owns(it.id);
        return h("button", { class: `ev-card event-item ev-rar-${it.rar || "R"}` + (own ? " owned" : ""), onclick: () => details(it) }, [
          h("div", { class: "ev-card-rar" }, it.rar || "R"),
          h("div", { class: "ev-card-pic" }, [preview(it, it.type === "title")]),
          h("div", { class: "t ev-card-name" }, it.name),
          h("div", { class: "ev-card-type" }, `${TYPE[it.type]} · limit 1`),
          own ? h("div", { class: "ev-card-price owned" }, isOn(it) ? "Wearing" : "Owned")
            : h("div", { class: "ev-card-price" + (bal < it.price ? " short" : "") }, [curImg(ev), String(it.price)]),
        ]);
      })),
    ]);
  }
  // an item, up close: exchange it, or wear it
  function details(it) {
    const ev = evOf(it), own = owns(it.id), bal = balance(ev.id), open = !!featured() && featured().ev.id === ev.id;
    const close = () => o.remove();
    const act = own ? h("button", { class: "ev-btn gold", onclick: () => { equip(it.id, !isOn(it)); close(); view(); } }, isOn(it) ? "Take off" : "Wear")
      : Object.assign(h("button", { class: "ev-btn gold", onclick: () => { if (buy(it.id)) { close(); chip(); view(); reward("Exchanged", [itemTile(it)]); } } },
          [h("span", {}, "Exchange"), curImg(ev), String(it.price)]), { disabled: !open || bal < it.price });
    const o = h("div", { class: "ev-modal", onclick: e => { if (e.target === o) close(); } }, [h("div", { class: `ev-modal-box ev-rar-${it.rar || "R"}` }, [
      h("div", { class: "ev-modal-pic" }, [preview(it)]),
      h("div", { class: "ev-card-rar" }, `${it.rar || "R"} · ${RAR[it.rar || "R"]}`),
      h("h2", {}, it.name), h("p", { class: "ev-note" }, `${TYPE[it.type]}. ${DESC[it.type]}`),
      !own && bal < it.price ? h("p", { class: "ev-note" }, [`${it.price - bal} more `, curImg(ev), ` ${ev.cur[1]} to go.`]) : null,
      h("div", { class: "ev-modal-act" }, [h("button", { class: "ev-btn", onclick: close }, "Close"), act]),
    ].filter(Boolean))]);
    document.body.append(o);
  }
  // what's been collected, by event (the album)
  function collection(ev) {
    const mine = ITEMS.filter(it => owns(it.id));
    return h("div", {}, [
      h("div", { class: "ev-head" }, [h("h2", {}, "Your collection"), h("span", { class: "ev-count" }, `${mine.length} / ${ITEMS.length}`)]),
      mine.length ? h("div", { class: "ev-shop" }, mine.map(it => h("button", { class: `ev-card ev-rar-${it.rar || "R"} owned`, onclick: () => details(it) }, [
        h("div", { class: "ev-card-rar" }, it.rar || "R"),
        h("div", { class: "ev-card-pic" }, [preview(it, it.type === "title")]),
        h("div", { class: "ev-card-name" }, it.name),
        h("div", { class: "ev-card-type" }, evOf(it).name),
        h("div", { class: "ev-card-price owned" }, isOn(it) ? "Wearing" : "Tap to wear"),
      ]))) : h("p", { class: "ev-note" }, "Nothing yet. Sign in, finish tasks and visit the shop."),
    ]);
  }

  document.addEventListener("DOMContentLoaded", () => { setTimeout(chip, 0); setTimeout(checkIn, 1500); });   // (the day's sign-in, once the page is up)
  return { slot, reward, details, preview, isOn, CAL, GOALS, checkIn, claimGoal, counts, LIST, ITEMS, RESKINS, featured, active, upcoming, balance, earn, buy, equip, equipped, owns, merge, chip, view, ledger, windows };
})();
