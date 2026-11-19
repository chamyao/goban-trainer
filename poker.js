/* Poker: postflop hands, in the spirit of the go problems and the Stream (the user: "a poker solver puzzle that
   starts in a post flop situation, similar to our go thing"; "I wanted it to go to turn and river"; "a rating system
   like the stream"; "a visual indicator of the preflop aggressor, reading is too slow").
   A hand is a heads-up 100bb spot played along one line from the flop to the river: at each of your decisions you
   choose, and see the solver's answer for your exact hand (how often it takes each action and what each costs); the
   hand then goes on along its line. The answers are postflop-solver's, worked out ahead of time (tools/poker,
   data/poker.json). A choice the solver makes at least a quarter of the time, or one that costs almost nothing, is
   right; a hand is won when every decision in it is.
   The rating (prog.pokerElo, synced like the rest of the progress): each hand has a difficulty rating; a hand's first
   play moves yours (Elo, faster for the first hands), and hands are dealt near your level, aimed at a 3-in-4 win. */
const Poker = (() => {
  let data = null;
  const load = async () => data || (data = await (await fetch("data/poker.json?v=2")).json());
  const SUIT = { s: "♠", h: "♥", d: "♦", c: "♣" };
  const card = c => h("span", { class: `pk-card pk-${c[1]}` }, [h("b", {}, c[0] === "T" ? "10" : c[0]), h("i", {}, SUIT[c[1]])]);
  const back = () => h("span", { class: "pk-card pk-back" });
  const bb = x => (Math.round(x * 10) / 10).toString().replace(/\.0$/, "") + " bb";
  const pct = x => Math.round(x * 100) + "%";
  const NEXT = { flop: "Turn", turn: "River" };

  /* ---- the rating ---- */
  const START = 1000, AIM = -Math.round(400 * Math.log10(3));   // a hand 191 below your rating: a 3-in-4 win
  const elo = (p = loadProgress()) => p.pokerElo || (p.pokerElo = { r: START, n: 0 });
  const expect = (r, d) => 1 / (1 + Math.pow(10, (d - r) / 400));
  const kOf = n => n < 10 ? 96 : n < 30 ? 64 : 32;
  const stakes = (e, d) => { const E = expect(e.r, d), k = kOf(e.n || 0); return [Math.round(k * (1 - E)), Math.round(k * E)]; };
  function rate(handRating, win) {
    const p = loadProgress(), e = elo(p), r0 = e.r;
    e.r = Math.round(Math.max(300, Math.min(2800, e.r + kOf(e.n || 0) * ((win ? 1 : 0) - expect(e.r, handRating)))));
    e.n = (e.n || 0) + 1; e.at = Date.now();
    e.log = (e.log || []).concat([[e.r, e.n, e.at]]).slice(-30);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); Sync.scheduleSave();
    return e.r - r0;
  }
  // across devices: the copy with the latest rated hand wins
  const merge = (l, r) => !r ? l : !l ? r : ((r.at || 0) > (l.at || 0) ? r : l);
  // the next hand: one not played yet, near your level (a few nearest, one at random); then the ones lost; then any
  function deal(skip) {
    const prog = loadProgress(), res = prog.poker || {}, e = elo(prog), aim = e.r + AIM;
    const pool = data.hands.filter(x => x.id !== skip);
    const fresh = pool.filter(x => !res[x.id]), lost = pool.filter(x => res[x.id] === -1);
    const from = fresh.length ? fresh : lost.length ? lost : pool;
    const near = from.slice().sort((a, b) => Math.abs(a.rating - aim) - Math.abs(b.rating - aim)).slice(0, 4);
    return near[Math.floor(Math.random() * near.length)] || data.hands[0];
  }
  // right: the solver plays it at least 25% of the time with this hand, or it gives up almost nothing
  const judge = (s, i) => {
    const a = s.actions[i], best = Math.max(...s.actions.map(x => x.ev)), loss = best - a.ev;
    return { ok: a.f >= 0.25 || loss <= Math.max(0.05, s.pot * 0.01), loss };
  };

  async function view(id) {
    crumbs.innerHTML = "";
    crumbs.append(h("a", { href: "#/" }, "Library"), " / ", h("a", { href: "#/poker" }, "Poker"));
    root.innerHTML = `<div class="loading">Loading…</div>`;
    const nav = routeSeq;
    try { await load(); } catch (e) { root.innerHTML = `<div class="loading">Couldn't load the hands.</div>`; return; }
    if (nav !== routeSeq) return;
    const hand = (id && data.hands.find(x => x.id === id)) || deal();
    if (!id) { history.replaceState(null, "", "#/poker/" + hand.id); }
    const prog = loadProgress(), e0 = elo(prog), first = !(prog.poker || {})[hand.id];
    const [win, lose] = stakes(e0, hand.rating);
    let at = 0, answered = false, allOk = true;
    const asked = hand.steps.filter(s => !s.auto).length;
    root.innerHTML = "";
    const wrap = h("div", { class: "pk-wrap" });
    root.append(wrap);

    function draw() {
      // played for you: a check the solver makes almost always
      while (hand.steps[at].auto && at < hand.steps.length - 1) at++;
      const s = hand.steps[at], last = at === hand.steps.length - 1;
      const e = elo();
      answered = false;
      const seat = (who, cards, stack, me) => {
        const raiser = who === hand.raiser;
        return h("div", { class: "pk-seat " + (me ? "pk-hero" : "pk-villain") + (raiser ? " pk-raiser" : "") }, [
          h("div", { class: "pk-hand" }, cards),
          h("div", { class: "pk-who" }, [
            who === "BTN" ? h("span", { class: "pk-dealer", title: "Dealer button" }, "D") : "",
            h("b", {}, who + (me ? " (you)" : "")), " · " + bb(stack),
            raiser ? h("span", { class: "pk-pfr", title: "The preflop " + (hand.raiseLabel === "3-bet" ? "3-bettor" : "raiser") }, hand.raiseLabel) : "",
          ]),
          !me && s.facingLabel ? h("div", { class: "pk-bet" }, s.facingLabel) : "",
        ]);
      };
      const verdict = h("div", { class: "pk-verdict" });
      const buttons = s.actions.map((a, i) => h("button", { class: "pk-act", onclick: () => choose(i) }, [h("kbd", {}, String(i + 1)), " " + a.label]));
      const autos = hand.steps.slice(0, at).filter(x => x.auto).length;
      wrap.replaceChildren(
        h("div", { class: "pk-head" }, [
          h("span", { class: "pk-street" }, `${s.street} · decision ${hand.steps.slice(0, at + 1).filter(x => !x.auto).length} of ${asked}`),
          h("span", { class: "pk-count" }, [h("b", {}, `Rating ${e.r}`), first ? h("span", { class: "pk-stakes" }, ` +${win} / −${lose}`) : " · replay"]),
        ]),
        h("div", { class: "pk-table" }, [
          seat(hand.villain, [back(), back()], s.villainStack, false),
          h("div", { class: "pk-mid" }, [h("div", { class: "pk-board" }, s.board.map(card)), h("div", { class: "pk-pot" }, `Pot ${bb(s.pot)}`)]),
          seat(hand.hero, [card(hand.hand.slice(0, 2)), card(hand.hand.slice(2, 4))], s.heroStack, true),
        ]),
        h("div", { class: "sgf-loader pk-panel" }, [
          h("ol", { class: "pk-history" }, s.history.map(t => h("li", {}, t))),
          autos && at > 0 && hand.steps[at - 1].auto ? h("p", { class: "pk-note" }, "(Checks the solver makes almost every time are played for you.)") : "",
          h("p", { class: "pk-q" }, "What do you do?"),
          h("div", { class: "pk-acts" }, buttons), verdict,
        ]),
      );
      function choose(i) {
        if (answered) return; answered = true;
        const j = judge(s, i); if (!j.ok) allOk = false;
        buttons.forEach((b, k) => { b.disabled = true; b.classList.toggle("picked", k === i); });
        const bestEv = Math.max(...s.actions.map(x => x.ev));
        verdict.className = "pk-verdict " + (j.ok ? "win" : "slip");
        verdict.append(
          h("b", {}, j.ok ? (s.actions[i].f >= 0.6 ? "✓ The solver's play." : "✓ Good: the solver mixes this.") : `✗ Not the solver's play (−${bb(j.loss)}).`),
          h("div", { class: "pk-bars" }, s.actions.map((a, k) => h("div", { class: "pk-bar" + (k === i ? " picked" : "") }, [
            h("span", { class: "pk-bl" }, a.label),
            h("span", { class: "pk-track" }, [h("span", { class: "pk-fill", style: `width:${Math.round(a.f * 100)}%` })]),
            h("span", { class: "pk-bf" }, pct(a.f)),
            h("span", { class: "pk-bev" }, a.ev >= bestEv - 0.05 ? "best" : `−${bb(bestEv - a.ev)}`),
          ]))),
          h("p", { class: "pk-note" }, [`With ${hand.hand.replace(/(..)(..)/, "$1 $2")}: how often the solver takes each action, and what each costs against its best. `,
            `Its whole range here: ${s.mix.map((m, k) => `${s.actions[k].label.toLowerCase()} ${pct(m)}`).join(", ")}.`]),
        );
        if (!last) {
          if (s.line != null && s.line !== i) verdict.append(h("p", { class: "pk-note" }, `The hand goes on as if you'd chosen ${s.actions[s.line].label.toLowerCase()} (its line).`));
          const nxt = hand.steps[at + 1];
          verdict.append(h("div", { class: "row" }, [h("button", { class: "primary", onclick: go }, (nxt.street !== s.street ? NEXT[s.street] : "Continue") + " ▸")]));
        } else finish(verdict);
      }
      window.__poker = { choose, next: () => { if (!answered) return; last ? nextHand() : go(); }, get answered() { return answered; }, actions: s.actions.length };
    }
    function go() { at++; draw(); }
    function finish(verdict) {
      if (first) markResult("poker", hand.id, allOk);
      const delta = first ? rate(hand.rating, allOk) : 0;
      verdict.append(
        h("div", { class: "pk-result " + (allOk ? "win" : "slip") }, [
          h("b", {}, allOk ? "Hand won: every decision was the solver's." : "Hand lost: not every decision was the solver's."),
          first ? ` Rating ${elo().r} (${delta >= 0 ? "+" : ""}${delta}).` : " (A replay: the rating stays.)",
          h("span", { class: "pk-hr" }, ` This hand: ${hand.rating}.`),
        ]),
        h("div", { class: "row" }, [h("button", { class: "primary", onclick: nextHand }, "Next hand ▸"), h("button", { onclick: () => view(hand.id) }, "Play again")]),
      );
    }
    function nextHand() { location.hash = "#/poker/" + deal(hand.id).id; }
    draw();
  }
  // keys: 1–9 choose, Enter continue / next hand
  addEventListener("keydown", e => {
    if (!location.hash.startsWith("#/poker") || !window.__poker || (e.target.closest && e.target.closest("input,textarea"))) return;
    const n = +e.key;
    if (n >= 1 && n <= window.__poker.actions && !window.__poker.answered) { e.preventDefault(); window.__poker.choose(n - 1); }
    else if (e.key === "Enter" && window.__poker.answered) { e.preventDefault(); window.__poker.next(); }
  });
  return { load, view, merge, rating: () => elo().r };
})();
