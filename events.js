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
    { id: "board-haunted", ev: "halloween", type: "board", name: "Haunted board", price: 15,
      board: { id: "haunted", name: "Haunted", wood: ["#8a78a6", "#7d6b99", "#705e8c"], tex: "assets/boards/haunted.webp", line: "#1c1228", label: "#f0e6ff", stone: "rgba(0,0,0,.45)" } },
    { id: "stones-candy", ev: "halloween", type: "stones", name: "Candy stones", icon: "🍬", price: 20 },
    { id: "title-pumpkin-king", ev: "halloween", type: "title", name: "Pumpkin King", icon: "🎃", price: 10 },
    { id: "hat-witch", ev: "halloween", type: "hat", name: "Witch hat for Sun Wukong", price: 25 },
    // not for sale: the sign-in calendar's prizes (slot) and the event goals' (goals)
    { id: "hat-pumpkin", ev: "halloween", type: "hat", name: "Pumpkin hat for Sun Wukong", price: 0, gift: true, slot: 5 },
    { id: "board-moonlit", ev: "halloween", type: "board", name: "Moonlit board", price: 0, gift: true, slot: 10,
      board: { id: "moonlit", name: "Moonlit", wood: ["#3d5584", "#344a75", "#2c4067"], tex: "assets/boards/moonlit.webp", line: "#e6eeff", label: "#d4e0fa", stone: "rgba(255,255,255,.45)" } },
    { id: "title-trick-or-treater", ev: "halloween", type: "title", name: "Trick-or-Treater", icon: "🍭", price: 0, gift: true, goals: true },
  ];

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
    if (got) { toast(`${f.ev.ci} +${got} ${f.ev.cur[got === 1 ? 0 : 1]}`); chip(); }
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
    for (const [i, coins, it] of got) toast(`📅 Day ${i}: ${coins ? `${f.ev.ci} +${coins}` : ""}${it ? ` ${it.icon || "🎁"} ${it.name}` : ""}`);
    if (got.length) { chip(); if (location.hash === "#/events") view(); }
  }
  function claimGoal(id) {
    const f = featured(), g = GOALS.find(x => x.id === id);
    if (!f || !g) return false;
    const ev = f.ev.id, c = counts(ev);
    if (c[g.of] < g.need) return false;
    let ok = false;
    store(E => { const book = E.earn[ev] = E.earn[ev] || {}; if (book[`goal:${id}`] == null) { book[`goal:${id}`] = g.pay; ok = true; }
      // all of them: the goal prize
      if (GOALS.every(x => book[`goal:${x.id}`] != null)) for (const it of ITEMS.filter(x => x.ev === ev && x.goals)) E.own[it.id] = 1; });
    if (ok) { toast(`${f.ev.ci} +${g.pay} ${f.ev.cur[1]}`); chip(); }
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
    store(E => { if (on) E.eq[it.type] = id; else if (E.eq[it.type] === id) E.eq[it.type] = ""; });
    if (it.type === "title" && typeof Sync !== "undefined") Sync.renderChip();
    if (it.type === "stones") { if (on) Candy.load(); route(); }
  }
  // (asked by Sun Wukong every frame: the ledger is read at most once a second)
  let eqAt = 0, eqL = null;
  const equipped = type => {
    if (Date.now() - eqAt > 1000) { eqL = ledger(); eqAt = Date.now(); }
    const id = (eqL.eq || {})[type]; return id && (eqL.own || {})[id] ? ITEMS.find(x => x.id === id) : null;
  };
  const isOn = it => it.type === "board" ? BoardTheme.current.id === it.board.id : !!(equipped(it.type) && equipped(it.type).id === it.id);
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
      box.append(h("span", { class: "auth-chip event-title-chip" }, [h("span", {}, `Playing as ${(typeof Sync !== "undefined" && Sync.username) || "you"}`),
        h("span", { class: "player-title" }, ` · ${it.icon || ""} ${it.name}`)]));
    } else if (it.type === "hat" && typeof WK !== "undefined") {
      const rows = WK.HAT_ROWS(it.id), cv = document.createElement("canvas");
      cv.width = 22; cv.height = rows + 15; cv.className = "event-hat";
      WK.drawHatted(cv.getContext("2d"), it.id);
      box.append(cv);
    }
    return box;
  }

  function toast(text) {
    const t = h("div", { class: "event-toast" }, text);
    document.body.append(t);
    setTimeout(() => t.remove(), 2400);
  }
  // the header chip: the featured event and its currency
  function chip() {
    let c = document.getElementById("eventChip");
    const f = featured();
    if (!c) {
      const after = document.getElementById("boardChip");
      if (!after) return;
      c = h("a", { id: "eventChip", class: "theme-chip event-chip", href: "#/events", title: "The event calendar" });
      after.before(c);
    }
    c.textContent = f ? `${f.ev.ci} ${balance(f.ev.id)}` : "📅 Events";
  }

  const fmt = d => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const left = end => { const days = Math.ceil((end - now()) / 864e5); return days <= 1 ? "ends today" : `${days} days left`; };
  function view() {
    Candy.load();   // (the candy stones' picture in the shop)
    crumbs.innerHTML = "";
    crumbs.append(h("a", { href: "#/" }, "Library"), " / Events");
    root.innerHTML = "";
    const f = featured(), d = now();
    const shopFor = ev => ITEMS.filter(it => it.ev === ev.id);
    if (f) {
      const ev = f.ev, bal = balance(ev.id);
      const others = active(d).slice(1);
      root.append(h("div", { class: "event-hero panel" }, [
        h("div", { class: "event-hero-icon" }, ev.icon),
        h("div", {}, [
          h("div", { class: "cat-title" }, "Now"),
          h("h2", { class: "event-name" }, `${ev.name} · ${ev.native}`),
          h("div", { class: "meta-sub" }, `${fmt(f.start)} – ${fmt(f.end)} · ${left(f.end)}${others.length ? ` · also on: ${others.map(o => o.ev.name).join(", ")}` : ""}`),
          ev.blurb ? h("p", { class: "meta-sub" }, ev.blurb) : null,
          h("div", { class: "event-balance" }, `${ev.ci} ${bal} ${ev.cur[bal === 1 ? 0 : 1]}`),
          h("p", { class: "meta-sub" }, `Earn ${ev.cur[1]} by solving: 1 for a problem you've never solved, first try (no hint, no wrong move); 3 for a turning point or key move you find; 2 more for the day's first. Each problem pays once.`),
        ].filter(Boolean)),
      ]));
      // the sign-in calendar
      const L = ledger(), book = (L.earn || {})[ev.id] || {}, signed = Object.keys((L.days || {})[ev.id] || {}).length;
      root.append(h("div", { class: "cat-title" }, "Daily sign-in"));
      root.append(h("p", { class: "meta-sub" }, `Open the site on a day of ${ev.name} to fill the next day. Missed days just wait. ${signed} of ${CAL.length} so far.`));
      root.append(h("div", { class: "cal-grid" }, CAL.map((_, j) => {
        const i = j + 1, [coins, it] = slotReward(ev.id, i), done = book[`cal:${i}`] != null;
        return h("div", { class: "cal-day" + (done ? " done" : "") + (i === signed + 1 ? " next" : "") + (it ? " prize" : "") }, [
          h("div", { class: "cal-n" }, `Day ${i}`),
          it ? preview(it, true) : h("div", { class: "cal-coins" }, `${ev.ci} ${coins}`),
          it ? h("div", { class: "cal-what" }, `${it.name}${coins ? ` + ${ev.ci} ${coins}` : ""}`) : null,
          done ? h("div", { class: "cal-check" }, "✓") : null,
        ].filter(Boolean));
      })));
      // the special event's goals
      const c = counts(ev.id), allDone = GOALS.every(g => book[`goal:${g.id}`] != null), goalPrize = ITEMS.find(x => x.ev === ev.id && x.goals);
      root.append(h("div", { class: "cat-title" }, `${ev.name} goals`));
      root.append(h("div", { class: "event-list" }, [...GOALS.map(g => {
        const have = Math.min(g.need, c[g.of]), claimed = book[`goal:${g.id}`] != null;
        return h("div", { class: "event-row goal-row" }, [
          h("span", { class: "event-what" }, [h("b", {}, g.text), h("div", { class: "bar goal-bar" }, [h("div", { style: `width:${100 * have / g.need}%` })])]),
          h("span", { class: "event-when" }, `${have} / ${g.need}`),
          claimed ? h("span", { class: "badge" }, "✓ claimed") : Object.assign(h("button", { class: have >= g.need ? "primary" : "",
            onclick: () => { if (claimGoal(g.id)) view(); } }, `${ev.ci} ${g.pay}`), { disabled: have < g.need }),
        ]);
      }), goalPrize ? h("div", { class: "event-row goal-row" }, [preview(goalPrize, true),
        h("span", { class: "event-what" }, [h("b", {}, `All three: ${goalPrize.icon || ""} ${goalPrize.name}`), h("span", { class: "meta-sub" }, " · not in the shop")]),
        allDone ? h("span", { class: "badge" }, "✓ yours") : null].filter(Boolean)) : null].filter(Boolean)));

      const items = shopFor(ev).filter(it => !it.gift);
      root.append(h("div", { class: "cat-title" }, `${ev.name} shop`));
      if (!items.length) root.append(h("p", { class: "meta-sub" }, "This event's shop is still being stocked."));
      else root.append(h("div", { class: "book-list" }, items.map(it => {
        const own = owns(it.id), on = own && isOn(it);
        const btn = own ? h("button", { onclick: () => { equip(it.id, !on); view(); } }, on ? "Take off" : "Wear")
          : h("button", { class: "primary", onclick: () => { if (buy(it.id)) { toast(`${it.icon || ev.icon} ${it.name}!`); chip(); view(); } } },
              `${ev.ci} ${it.price}`);
        if (!own && bal < it.price) { btn.disabled = true; btn.title = `${it.price - bal} more ${ev.cur[1]}`; }
        return h("div", { class: "book event-item" + (own ? " owned" : "") }, [
          preview(it),
          h("div", { class: "t" }, `${it.icon ? it.icon + " " : ""}${it.name}`),
          h("div", { class: "n" }, { board: "A board", title: "A title by your name", hat: "Sun Wukong wears it", stones: "Candy corn and chocolate truffles for stones" }[it.type] + (own ? " · yours" : "")),
          h("div", { class: "row" }, [btn]),
        ]);
      })));
    } else root.append(h("div", { class: "panel" }, [h("h2", {}, "Between events"), h("p", { class: "meta-sub" }, "No event is on right now.")]));

    // what's been collected, by event (the album)
    const mine = ITEMS.filter(it => owns(it.id));
    if (mine.length) {
      root.append(h("div", { class: "cat-title" }, "Your collection"));
      root.append(h("div", { class: "event-list" }, mine.map(it => { const ev = LIST.find(e => e.id === it.ev);
        return h("div", { class: "event-row" }, [h("span", { class: "event-icon" }, ev.icon), h("span", { class: "event-what" }, [h("b", {}, it.name), ` · ${ev.name}`]),
          h("button", { onclick: () => { equip(it.id, !isOn(it)); view(); } }, isOn(it) ? "Take off" : "Wear")]); })));
    }
  }

  document.addEventListener("DOMContentLoaded", () => { setTimeout(chip, 0); setTimeout(checkIn, 1500); });   // (the day's sign-in, once the page is up)
  return { CAL, GOALS, checkIn, claimGoal, counts, LIST, ITEMS, RESKINS, featured, active, upcoming, balance, earn, buy, equip, equipped, owns, merge, chip, view, ledger, windows };
})();
