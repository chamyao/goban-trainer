/* ================= avatars: the story's protagonists, collected by playing as them ================= */
// The user: "board avatars as a site feature like in the stories", "a way to gain collectibles from the playthroughs
// such as the avatars", "mainly I just care about protagonists", "everyone you play as", "when you first complete a
// problem as them", Jang Geu-rae "just use the main one". A protagonist is anyone a book hands you the lead as (its
// party's first: w.party, and each ["party", [...]] in its scenes); one joins the collection the first time a story
// board is completed while playing as them (TK.markCleared). The one picked sits beside the site's boards (problems,
// the Stream, Turning points), with a word when a problem is solved or missed.
// Kept in the progress row (progress.av: own {who: 1}, pick), merged by union.
const Avatars = (() => {
  const SAME = { ms_jang_child: "ms_jang", ms_jang_young: "ms_jang" };   // one Jang Geu-rae: the main one, the intern (ms_jang)
  const norm = who => SAME[who] || who;
  const NOT = new Set(["redhare"]);   // (a horse led a scene once)
  const L = () => { const p = loadProgress(); return p.av || { own: {}, pick: "" }; };
  const store = f => { const p = loadProgress(); p.av = p.av || {}; p.av.own = p.av.own || {}; f(p.av); TK.saveProg(p); };
  const owns = who => !!(L().own || {})[norm(who)];
  const picked = () => { const w = L().pick; return w && owns(w) ? w : ""; };
  const name = who => (typeof tkName === "function" ? tkName(who) : who);
  let portraits = null;
  const loadPortraits = () => portraits || (portraits = fetch("assets/tk/portraits/portraits.json?v=18").then(r => r.json()).catch(() => ({})));
  const img = (file) => `assets/tk/portraits/${file}?v=18`;

  // every protagonist, by book, from the story's data
  let leadsP = null;
  function leads() {
    return leadsP || (leadsP = (async () => {
      if (!TK.data) await TK.load();
      const out = [];
      for (const w of TK.data.worlds) {
        const seq = [(w.party || [])[0]];
        const s = JSON.stringify(w.scenes || {});
        for (const m of s.matchAll(/\["party",\s*\["([^"]+)"/g)) seq.push(m[1]);
        const novel = w.novel ? (TK_NOVELS[w.novel] || {}).title : "Romance of the Three Kingdoms";
        for (const who of seq.map(norm)) {   // (one who leads in several books: every one of them)
          if (!who || NOT.has(who)) continue;
          const x = out.find(y => y.who === who);
          if (x) { if (!x.books.includes(w.n)) x.books.push(w.n); } else out.push({ who, books: [w.n], novel });
        }
      }
      return out;
    })());
  }
  // who the story has you play as in a book right now
  const leadOf = n => { const w = TK.world(n); return w ? norm((TK.party(w) || [])[0] || "") : ""; };

  function unlock(who, quiet) {
    who = norm(who);
    if (!who || NOT.has(who) || owns(who)) return false;
    store(A => { A.own[who] = 1; if (!A.pick) A.pick = who; });
    if (!quiet) toast(`🎭 ${name(who)} joins your avatars`);
    return true;
  }
  // a story board completed: whoever you're playing as joins (TK.markCleared calls this)
  function cleared(key) {
    const n = parseInt(key, 10);
    if (n) unlock(leadOf(n));
  }
  // boards won before avatars existed: who led then isn't known, so each book's first lead for a book begun, and all
  // of its leads for a book finished
  async function catchUp() {
    const p = loadProgress(), done = Object.keys(p.tk || {}).filter(k => TK.cleared(k));
    if (!done.length) return;
    const all = await leads();
    for (const w of TK.data.worlds) {
      const mine = done.filter(k => parseInt(k, 10) === w.n);
      if (!mine.length) continue;
      if (TK.cleared(`${w.n}-boss`)) for (const x of all.filter(x => x.books.includes(w.n))) unlock(x.who, true);
      else unlock((w.party || [])[0], true);
    }
  }

  function toast(text) {
    const t = h("div", { class: "event-toast" }, text);
    document.body.append(t);
    setTimeout(() => t.remove(), 2800);
  }
  // the card beside a board: the portrait, the name, and a word on a result
  const LINES = { ok: [["妙！", "Brilliant!"], ["好棋。", "A fine move."], ["正是此处。", "Exactly there."]],
                  bad: [["可惜。", "A pity."], ["再想想。", "Think again."], ["不是这里。", "Not there."]] };
  function card() {
    const who = picked();
    if (!who) return null;
    const pic = h("img", { class: "avatar-pic", alt: "" }), say = h("div", { class: "avatar-say", hidden: "" });
    loadPortraits().then(m => { if (m[who]) pic.src = img(m[who]); });
    return h("div", { class: "avatar-card", "data-who": who }, [pic, h("div", { class: "avatar-txt" }, [h("div", { class: "avatar-name" }, name(who)), say])]);
  }
  addEventListener("tczw:result", e => {
    const c = document.querySelector("#root .avatar-card .avatar-say");
    if (!c) return;
    const set = LINES[e.detail === "ok" ? "ok" : "bad"], [zh, en] = set[Math.floor(Math.random() * set.length)];
    c.textContent = `${zh} ${en}`; c.hidden = false;
  });
  // after a page is drawn: the card at the top of its side panel (a page with a board and an aside)
  function mount() {
    const aside = document.querySelector("#root .player > aside");
    if (!aside || aside.querySelector(".avatar-card")) return;
    const c = card();
    if (c) aside.prepend(c);
  }

  // the collection (#/avatars): everyone, the ones yet to come as silhouettes
  async function view() {
    crumbs.innerHTML = "";
    crumbs.append(h("a", { href: "#/" }, "Library"), " / Avatars");
    root.innerHTML = `<div class="loading">Loading…</div>`;
    const [all, m] = await Promise.all([leads(), loadPortraits()]);
    await catchUp();
    if (!location.hash.startsWith("#/avatars")) return;
    root.innerHTML = "";
    const have = all.filter(x => owns(x.who)).length, pick = picked();
    root.append(h("div", { class: "cat-title" }, `Avatars · ${have} of ${all.length}`));
    root.append(h("p", { class: "meta-sub" }, "Everyone the stories have you play as. One joins the first time you complete a story board as them; the one you pick sits beside your boards."));
    root.append(h("div", { class: "avatar-grid" }, all.map(x => {
      const mine = owns(x.who), on = pick === x.who;
      return h("button", { class: "avatar-tile" + (mine ? "" : " locked") + (on ? " on" : ""), type: "button", title: mine ? (on ? "Your avatar" : "Pick") : `Play as them in ${x.novel}`,
        onclick: () => { if (!mine) return; store(A => { A.pick = on ? "" : x.who; }); view(); } }, [
        m[x.who] ? h("img", { src: img(m[x.who]), alt: "" }) : h("div", { class: "avatar-none" }, "?"),
        h("div", { class: "avatar-name" }, mine ? name(x.who) : "？"),
        h("div", { class: "meta-sub" }, mine ? (on ? "✓ yours" : x.novel) : x.novel),
      ]);
    })));
  }
  // two copies: what's owned by union; the pick, this browser's unless it has none
  function merge(l, r) {
    if (!r) return l;
    if (!l) return r;
    return { own: { ...(r.own || {}), ...(l.own || {}) }, pick: l.pick || r.pick || "" };
  }
  const count = () => Object.keys(L().own || {}).length;
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { if (Object.keys(loadProgress().tk || {}).length) catchUp().catch(e => console.error("[avatars]", e)); }, 3000);
    // a page drawn (by the router, or a page redrawing itself): the card goes in
    const r = document.getElementById("root");
    if (r) new MutationObserver(() => mount()).observe(r, { childList: true });
  });
  return { unlock, cleared, owns, picked, leads, catchUp, card, mount, view, merge, count, norm };
})();
