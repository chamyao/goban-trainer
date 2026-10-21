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
  const PV = () => (typeof TownUI !== "undefined" && TownUI.PORTRAIT_V) || 0;   // (the portraits' version, tk-town.js)
  const loadPortraits = () => portraits || (portraits = fetch(`assets/tk/portraits/portraits.json?v=${PV()}`).then(r => r.json()).catch(() => ({})));
  const img = (file) => `assets/tk/portraits/${file}?v=${PV()}`;

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
    // a board ever completed counts, a book since started over included (a rebuilt book's start-over keeps an undo on
    // every board: apo110's Book 12, beaten before it, read as unfinished, and Diaochan stayed locked)
    const p = loadProgress(), ever = k => (p.tk || {})[k] === 1, done = Object.keys(p.tk || {}).filter(ever);
    if (!done.length) return;
    const all = await leads();
    for (const w of TK.data.worlds) {
      const mine = done.filter(k => parseInt(k, 10) === w.n);
      if (!mine.length) continue;
      // finished: its last board cleared (a board nothing follows; only Books 1–3 call theirs N-boss)
      const finished = ever(`${w.n}-boss`) || w.nodes.some(n => !TK.isStart(n.key) && !w.edges.some(e => e[0] === n.key) && ever(n.key));
      if (finished) for (const x of all.filter(x => x.books.includes(w.n))) unlock(x.who, true);
      else unlock((w.party || [])[0], true);
    }
  }

  function toast(text) {
    const t = h("div", { class: "event-toast" }, text);
    document.body.append(t);
    setTimeout(() => t.remove(), 2800);
  }
  // the avatar on a board page, as the story's duel has its lead (Graphics: style.css .tk-duel-lead; the user: "on the
  // bottom left and bigger, similar to the stories"): on a wide screen a column left of the board, the painted cut-out
  // standing on the board's foot (its waist cut flush on that edge, nothing cropped above), in front of the board's
  // edge with taps passing through, and the word on a result in a dark box over its head (from 1280px, where a column
  // fits beside the board and its side panel); narrower, a small portrait beside the box under the board
  // each in their own voice (the user: "did you match the avatar dialogues to their personality"); the Misaeng cast in
  // English, as their book; anyone not here, the plain lines
  const LINES = { ok: [["妙！", "Brilliant!"], ["好棋。", "A fine move."], ["正是此处。", "Exactly there."]],
                  bad: [["可惜。", "A pity."], ["再想想。", "Think again."], ["不是这里。", "Not there."]] };
  const VOICE = {
    liubei: { ok: [["此乃众人之功。", "The credit belongs to all of us."], ["仁者无敌。", "The benevolent have no enemy."]],
              bad: [["备之过也。", "The fault is mine."], ["莫急，从长计议。", "No haste. We think it through."]] },
    diaochan: { ok: [["一着妙手，胜过千军。", "One fine move outweighs a thousand soldiers."], ["妾身早知如此。", "I knew it would come to this."], ["连环之计，便在此处。", "The chain of stratagems turns right here."]],
                bad: [["此计未成，再图之。", "This plan failed; then another."], ["妾身……一时大意了。", "I was careless, for a moment."]] },
    wangyun: { ok: [["汉室有望矣！", "There is hope for the Han!"], ["老夫此计，天衣无缝。", "This old man's plan has no seam."]],
               bad: [["老夫失算了。", "This old man miscalculated."], ["事不密则害成……", "A plan not kept close comes to harm…"]] },
    caocao: { ok: [["哈哈哈！此一手，天下谁能当之？", "Ha! Who under heaven could answer that?"], ["天下英雄，皆在吾算中。", "Every hero under heaven, in my reckoning."]],
              bad: [["胜败乃兵家常事。", "Victory and defeat are a soldier's daily fare."], ["吾自失之，非人之过。", "I lost it myself. No one else to blame."]] },
    lvbu: { ok: [["人中吕布！", "Among men, Lü Bu!"], ["谁敢与我争锋？", "Who dares cross blades with me?"]],
            bad: [["可恶！再来！", "Curse it! Again!"], ["吕布岂会败于此？", "Would Lü Bu lose to this?"]] },
    lisu: { ok: [["三寸之舌，胜于百万之师。", "Three inches of tongue beat a million troops."], ["说得通，下得也通。", "Well argued, well played."]],
            bad: [["此言……未能说动。", "That argument… didn't carry."], ["待我再想一番说辞。", "Let me find better words."]] },
    jiaxu: { ok: [["算无遗策。", "Nothing left uncalculated."], ["正合我算。", "Exactly as I reckoned."]],
             bad: [["嗯……此处，吾亦未算到。", "Hm. Even I didn't see that one."], ["不急。再算。", "No hurry. Reckon again."]] },
    lijue: { ok: [["痛快！", "Satisfying!"], ["哼，杀得好！", "Hah! A good kill!"]],
             bad: [["混账！", "Damn it all!"], ["老子不服！", "I don't accept it!"]] },
    chenliu: { ok: [["朕……下对了吗？", "Did I… get it right?"], ["朕明白了！", "I understand now!"]],
               bad: [["朕不明白……", "I don't understand…"], ["再教朕一次。", "Teach me once more."]] },
    dongzhuo: { ok: [["顺我者昌！", "Those who follow me prosper!"], ["天下都是我的！", "All under heaven is mine!"]],
                bad: [["谁敢笑我？！", "Who dares laugh?!"], ["哼！再来！", "Hmph! Again!"]] },
    chengong: { ok: [["此一着，可定大局。", "This move settles the whole game."], ["谋定而后动，正是如此。", "Plan first, then move. Just so."]],
                bad: [["公台失策了……", "Gongtai has erred…"], ["可惜，良策不用。", "A pity: the good plan went unused."]] },
    yanshi: { ok: [["夫君，你看。", "Look, husband."], ["原来如此，妾身也会。", "So that's it. I can do it too."]],
              bad: [["妾身不懂这些……", "I don't understand these things…"], ["还是小心些好。", "Better to be careful."]] },
    zhangliao: { ok: [["张辽在此！", "Zhang Liao is here!"], ["八百破十万，何况此局！", "Eight hundred broke a hundred thousand. This is nothing!"]],
                 bad: [["败而不馁。", "Beaten, not broken."], ["整军再战。", "Regroup and fight again."]] },
    chendeng: { ok: [["正中下怀。", "Just as I'd hoped."], ["一切尽在掌握。", "All in hand."]],
                bad: [["失算一着。", "One move miscounted."], ["且看下回。", "We'll see next time."]] },
    houcheng: { ok: [["这一手，我早看准了。", "I had my eye on that one."], ["好！", "Good!"]],
                bad: [["唉，又是这般……", "Ugh, this again…"], ["不该如此。", "It shouldn't go like this."]] },
    zhaoyun: { ok: [["吾乃常山赵子龙也！", "I am Zhao Zilong of Changshan!"], ["一身是胆。", "All courage."]],
               bad: [["子龙惭愧。", "Zilong is ashamed."], ["再闯一回！", "I'll charge through again!"]] },
    ladysun: { ok: [["哼，不过如此！", "Hmph, is that all?"], ["本小姐出手，岂有不胜？", "When I play, how could I lose?"]],
               bad: [["再来一局！", "One more game!"], ["哼，下次可不会了。", "Hmph. Not next time."]] },
    daiyu: { ok: [["这一手倒也有几分意思。", "There's something to that move."], ["原来如此，不过尔尔。", "So that's all it was."]],
             bad: [["花谢花飞……罢了。", "Petals fall and fly… never mind."], ["我原说不会下的。", "I did say I couldn't play."]] },
    grannyliu: { ok: [["哎哟，老婆子也下着了！", "Well I never! This old woman got one!"], ["阿弥陀佛，这可巧了！", "Bless me, what luck!"]],
                 bad: [["庄稼人，哪懂这个。", "A farm woman, what do I know of this?"], ["老婆子眼花了。", "My old eyes are going."]] },
    ms_jang: { ok: [["", "Baduk taught me this one."], ["", "One more stone that lives."]],
               bad: [["", "I'm not there yet. I'll get there."], ["", "I didn't read it out. Again."]] },
    ms_oh: { ok: [["", "Good. That's our guy."], ["", "See? Hard work pays."]],
             bad: [["", "Hey. Focus."], ["", "We're not finished yet."]] },
    ms_oh_hike: { ok: [["", "Good. Keep climbing."], ["", "That's the summit."]],
                  bad: [["", "Breathe. One step at a time."], ["", "Slipped. Get up."]] },
    ms_ahn: { ok: [["", "Done."], ["", "As expected."]],
              bad: [["", "I'll fix it."], ["", "Again. Properly this time."]] },
    ms_parkjg: { ok: [["", "See? Leave it to me."], ["", "That's how a pro handles it."]],
                 bad: [["", "That's… not on me."], ["", "Let's keep that between us."]] },
    ms_sun: { ok: [["", "Nicely done."], ["", "Good work. Go home on time."]],
              bad: [["", "Let's look again, calmly."], ["", "It happens. Next one."]] },
    ms_han: { ok: [["", "That's how it's done!"], ["", "Ha! Too easy."]],
              bad: [["", "Damn it."], ["", "Whatever. Next."]] },
  };
  function mount() {
    const player = document.querySelector("#root .player"), who = picked();
    if (!player || !who || player.querySelector(".avatar-stage")) return;
    const board = player.querySelector(":scope > .board-card");
    if (!board) return;
    const lead = h("img", { class: "avatar-lead", alt: "" }), small = h("img", { class: "avatar-small", alt: "" });
    loadPortraits().then(m => { if (m[who]) lead.src = small.src = img(m[who]); });
    const box = () => h("div", { class: "avatar-dlg", hidden: "" }, [h("div", { class: "avatar-name" }, name(who)), h("div", { class: "avatar-say" })]);
    // the lead held to the window's bottom-left corner, its word over its head (the user: "make the anchor the actual
    // window, not the board, so scrolling should not change her spot"); the column only keeps the board clear of it
    const stage = h("div", { class: "avatar-stage" }, [h("div", { class: "avatar-col" }), h("div", { class: "avatar-fixed" }, [box(), lead])]);
    player.insertBefore(stage, board);
    stage.insertBefore(board, stage.querySelector(".avatar-fixed"));
    stage.append(h("div", { class: "avatar-row" }, [small, box()]));   // (narrower: under the board, in its width)
  }
  addEventListener("tczw:result", e => {
    const boxes = document.querySelectorAll("#root .avatar-dlg");
    if (!boxes.length) return;
    const kind = e.detail === "ok" ? "ok" : "bad", set = (VOICE[picked()] || LINES)[kind] || LINES[kind], [zh, en] = set[Math.floor(Math.random() * set.length)];
    for (const b of boxes) { b.querySelector(".avatar-say").textContent = zh ? `${zh} ${en}` : en; b.hidden = false; }
  });

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
  return { VOICE, unlock, cleared, owns, picked, leads, catchUp, mount, view, merge, count, norm };
})();
