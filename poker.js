/* Poker: postflop puzzles, in the spirit of the go problems (the user: "a poker solver puzzle that starts in a post
   flop situation, similar to our go thing"). Each puzzle is a spot from a heads-up 100bb game: the board, your hand,
   the action so far; you choose. The answers are a game-theory solver's (postflop-solver, run ahead of time by
   tools/poker/: data/poker.json), for that exact hand: how often it takes each action and what each is worth.
   A choice the solver makes at least a quarter of the time, or one that costs almost nothing, counts as right.
   Progress is a book like the others (markResult "poker"), so it syncs with the sheet. */
const Poker = (() => {
  let data = null;
  const load = async () => data || (data = await (await fetch("data/poker.json?v=1")).json());
  const SUIT = { s: "♠", h: "♥", d: "♦", c: "♣" };
  const card = c => h("span", { class: `pk-card pk-${c[1]}` }, [h("b", {}, c[0] === "T" ? "10" : c[0]), h("i", {}, SUIT[c[1]])]);
  const back = () => h("span", { class: "pk-card pk-back" });
  const bb = x => (Math.round(x * 10) / 10).toString().replace(/\.0$/, "") + " bb";
  const pct = x => Math.round(x * 100) + "%";
  // right: the solver plays it at least 25% of the time with this hand, or it gives up almost nothing
  const judge = (p, i) => {
    const a = p.actions[i], best = Math.max(...p.actions.map(x => x.ev));
    const loss = best - a.ev;
    return { ok: a.f >= 0.25 || loss <= Math.max(0.05, p.pot * 0.01), loss };
  };
  const order = () => { const prog = (loadProgress().poker || {}); return data.puzzles.map((p, i) => [p, i]).sort((a, b) => (prog[a[0].id] === 1) - (prog[b[0].id] === 1) || a[1] - b[1]).map(x => x[0]); };

  async function view(id) {
    crumbs.innerHTML = "";
    crumbs.append(h("a", { href: "#/" }, "Library"), " / ", h("a", { href: "#/poker" }, "Poker"));
    root.innerHTML = `<div class="loading">Loading…</div>`;
    const nav = routeSeq;
    try { await load(); } catch (e) { root.innerHTML = `<div class="loading">Couldn't load the puzzles.</div>`; return; }
    if (nav !== routeSeq) return;
    const list = order();
    const p = (id && data.puzzles.find(x => x.id === id)) || list[0];
    const prog = loadProgress().poker || {};
    const done = data.puzzles.filter(x => prog[x.id] === 1).length;
    root.innerHTML = "";
    const verdict = h("div", { class: "pk-verdict" });
    const buttons = p.actions.map((a, i) => h("button", { class: "pk-act", onclick: () => choose(i) }, [h("kbd", {}, String(i + 1)), " " + a.label]));
    const acts = h("div", { class: "pk-acts" }, buttons);
    const table = h("div", { class: "pk-table" }, [
      h("div", { class: "pk-seat pk-villain" }, [h("div", { class: "pk-hand" }, [back(), back()]), h("div", { class: "pk-who" }, [h("b", {}, p.villain), " · " + bb(p.villainStack)]), p.facing ? h("div", { class: "pk-bet" }, `${p.facingLabel}`) : ""]),
      h("div", { class: "pk-mid" }, [h("div", { class: "pk-board" }, p.board.map(card)), h("div", { class: "pk-pot" }, `Pot ${bb(p.pot)}`)]),
      h("div", { class: "pk-seat pk-hero" }, [h("div", { class: "pk-hand" }, [card(p.hand.slice(0, 2)), card(p.hand.slice(2, 4))]), h("div", { class: "pk-who" }, [h("b", {}, p.hero + " (you)"), " · " + bb(p.heroStack)])]),
    ]);
    root.append(h("div", { class: "pk-wrap" }, [
      h("div", { class: "pk-head" }, [h("span", { class: "pk-street" }, p.street), h("span", { class: "pk-count" }, `${done} / ${data.puzzles.length} solved`)]),
      table,
      h("div", { class: "sgf-loader pk-panel" }, [
        h("ol", { class: "pk-history" }, p.history.map(t => h("li", {}, t))),
        h("p", { class: "pk-q" }, "What do you do?"),
        acts, verdict,
      ]),
    ]));
    let answered = false;
    function choose(i) {
      if (answered) return; answered = true;
      const j = judge(p, i);
      markResult("poker", p.id, j.ok);
      buttons.forEach((b, k) => { b.disabled = true; b.classList.toggle("picked", k === i); });
      const bestEv = Math.max(...p.actions.map(x => x.ev));
      verdict.className = "pk-verdict " + (j.ok ? "win" : "slip");
      verdict.append(
        h("b", {}, j.ok ? (p.actions[i].f >= 0.6 ? "✓ The solver's play." : "✓ Good: the solver mixes this.") : `✗ Not the solver's play (−${bb(j.loss)}).`),
        h("div", { class: "pk-bars" }, p.actions.map((a, k) => h("div", { class: "pk-bar" + (k === i ? " picked" : "") }, [
          h("span", { class: "pk-bl" }, a.label),
          h("span", { class: "pk-track" }, [h("span", { class: "pk-fill", style: `width:${Math.round(a.f * 100)}%` })]),
          h("span", { class: "pk-bf" }, pct(a.f)),
          h("span", { class: "pk-bev" }, a.ev >= bestEv - 0.05 ? "best" : `−${bb(bestEv - a.ev)}`),
        ]))),
        h("p", { class: "pk-note" }, [`With ${p.hand.replace(/(..)(..)/, "$1 $2")}: how often the solver takes each action, and what each costs against its best. `,
          `Its whole range here: ${p.mix.map((m, k) => `${p.actions[k].label.toLowerCase()} ${pct(m)}`).join(", ")}.`]),
        h("div", { class: "row" }, [h("button", { class: "primary", onclick: next }, "Next ▸"), h("button", { onclick: () => view(p.id) }, "Again")]),
      );
    }
    function next() { const l = order().filter(x => x.id !== p.id); location.hash = "#/poker/" + (l[0] || p).id; }
    window.__poker = { choose, next, get answered() { return answered; }, actions: p.actions.length };
  }
  // keys: 1–9 choose, Enter next
  addEventListener("keydown", e => {
    if (!location.hash.startsWith("#/poker") || !window.__poker || e.target.closest && e.target.closest("input,textarea")) return;
    const n = +e.key;
    if (n >= 1 && n <= window.__poker.actions && !window.__poker.answered) { e.preventDefault(); window.__poker.choose(n - 1); }
    else if (e.key === "Enter" && window.__poker.answered) { e.preventDefault(); window.__poker.next(); }
  });
  return { load, view, count: () => data ? data.puzzles.length : 0 };
})();
