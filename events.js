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
      board: { id: "haunted", name: "Haunted", wood: ["#4a3763", "#3e2d55", "#332447"], line: "#e9dcff", label: "#d6c3f5", stone: "rgba(255,255,255,.35)" } },
    { id: "title-pumpkin-king", ev: "halloween", type: "title", name: "Pumpkin King", icon: "🎃", price: 10 },
    { id: "hat-witch", ev: "halloween", type: "hat", name: "Witch hat for Sun Wukong", price: 25 },
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
  const ledger = () => { const p = loadProgress(); return p.ev || { earn: {}, own: {}, eq: {} }; };
  const store = f => { const p = loadProgress(); p.ev = p.ev || { earn: {}, own: {}, eq: {} }; for (const k of ["earn", "own", "eq"]) p.ev[k] = p.ev[k] || {}; f(p.ev); TK.saveProg(p); eqAt = 0; };
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
  function buy(id) {
    const it = ITEMS.find(x => x.id === id);
    if (!it || owns(id) || balance(it.ev) < it.price) return false;
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
    const o = { earn: {}, own: { ...(r.own || {}), ...(l.own || {}) }, eq: { ...(r.eq || {}), ...(l.eq || {}) } };
    for (const src of [r.earn || {}, l.earn || {}]) for (const ev in src) o.earn[ev] = { ...(o.earn[ev] || {}), ...src[ev] };
    return o;
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
      const items = shopFor(ev);
      root.append(h("div", { class: "cat-title" }, `${ev.name} shop`));
      if (!items.length) root.append(h("p", { class: "meta-sub" }, "This event's shop is still being stocked."));
      else root.append(h("div", { class: "book-list" }, items.map(it => {
        const own = owns(it.id), on = own && isOn(it);
        const btn = own ? h("button", { onclick: () => { equip(it.id, !on); view(); } }, on ? "Take off" : "Wear")
          : h("button", { class: "primary", onclick: () => { if (buy(it.id)) { toast(`${it.icon || ev.icon} ${it.name}!`); chip(); view(); } } },
              `${ev.ci} ${it.price}`);
        if (!own && bal < it.price) { btn.disabled = true; btn.title = `${it.price - bal} more ${ev.cur[1]}`; }
        return h("div", { class: "book event-item" + (own ? " owned" : "") }, [
          h("div", { class: "t" }, `${it.icon ? it.icon + " " : ""}${it.name}`),
          h("div", { class: "n" }, { board: "A board", title: "A title by your name", hat: "Sun Wukong wears it" }[it.type] + (own ? " · yours" : "")),
          h("div", { class: "row" }, [btn]),
        ]);
      })));
    } else root.append(h("div", { class: "panel" }, [h("h2", {}, "Between events"), h("p", { class: "meta-sub" }, "No event is on right now; the next one is below.")]));

    // the year ahead
    root.append(h("div", { class: "cat-title" }, "Coming up"));
    const seen = new Set();
    root.append(h("div", { class: "event-list" }, upcoming(d).filter(w => !seen.has(w.ev.id) && seen.add(w.ev.id)).map(w => h("div", { class: "event-row" }, [
      h("span", { class: "event-icon" }, w.ev.icon),
      h("span", { class: "event-when" }, `${fmt(w.start)} – ${fmt(w.end)}`),
      h("span", { class: "event-what" }, [h("b", {}, w.ev.name), ` ${w.ev.native}`, w.ev.blurb ? h("span", { class: "meta-sub" }, ` · ${w.ev.blurb}`) : ""]),
      h("span", { class: `badge event-kind event-${w.ev.kind}` }, KINDS[w.ev.kind]),
    ]))));
    // what's been collected, by event (the album)
    const mine = ITEMS.filter(it => owns(it.id));
    if (mine.length) {
      root.append(h("div", { class: "cat-title" }, "Your collection"));
      root.append(h("div", { class: "event-list" }, mine.map(it => { const ev = LIST.find(e => e.id === it.ev);
        return h("div", { class: "event-row" }, [h("span", { class: "event-icon" }, ev.icon), h("span", { class: "event-what" }, [h("b", {}, it.name), ` · ${ev.name}`]),
          h("button", { onclick: () => { equip(it.id, !isOn(it)); view(); } }, isOn(it) ? "Take off" : "Wear")]); })));
    }
  }

  document.addEventListener("DOMContentLoaded", () => setTimeout(chip, 0));
  return { LIST, ITEMS, RESKINS, featured, active, upcoming, balance, earn, buy, equip, equipped, owns, merge, chip, view, ledger, windows };
})();
