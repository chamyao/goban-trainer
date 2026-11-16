/* Postflop Trainer UI. The solves are precomputed (solver/build.py); this only plays them back and grades the line. */
(() => {
  "use strict";
  const E = window.PokerEngine;
  const $ = id => document.getElementById(id);
  const SUIT_SYM = { c: "♣", d: "♦", h: "♥", s: "♠" };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const bb = x => `${E.fmt(x)} bb`;

  const store = {
    get(k, d) { try { const v = localStorage.getItem("pkr." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("pkr." + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  let manifest, settings, stats;
  const cache = new Map();
  let hand = null, spot = null, board = null, busy = false, token = 0, lastDeal = null;

  /* ---------- data ---------- */
  async function loadSolve(file) {
    if (cache.has(file)) return cache.get(file);
    const p = (async () => {
      const res = await fetch("data/" + file);
      if (!res.ok) throw new Error(`${file}: ${res.status}`);
      let buf = await res.arrayBuffer();
      const b = new Uint8Array(buf);
      if (b[0] === 0x1f && b[1] === 0x8b) {   // still gzipped (most static servers send .gz as is)
        buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      }
      return E.parseSolve(buf);
    })();
    cache.set(file, p);
    p.catch(() => cache.delete(file));
    return p;
  }

  /* ---------- rendering ---------- */
  function cardEl(c, opts = {}) {
    const d = document.createElement("div");
    if (c == null) { d.className = "card back" + (opts.small ? " small" : ""); return d; }
    const n = E.cardName(c), s = n[1];
    d.className = `card s-${s}` + (opts.small ? " small" : "") + (opts.fresh ? " fresh" : "");
    d.innerHTML = `<span class="r">${n[0] === "T" ? "10" : n[0]}</span><span class="u">${SUIT_SYM[s]}</span>`;
    d.setAttribute("aria-label", n);
    return d;
  }
  const cardsText = cs => cs.map(c => { const n = E.cardName(c); return `<span class="ct s-${n[1]}">${n[0]}${SUIT_SYM[n[1]]}</span>`; }).join("");

  function posName(p) { return spot.pos[p]; }

  function renderTable(fresh = -1) {
    const h = hand, hero = h.hero, vill = 1 - hero;
    $("heroPos").textContent = posName(hero) + (hero === 1 ? " · IP" : " · OOP");
    $("villPos").textContent = posName(vill) + (vill === 1 ? " · IP" : " · OOP");
    $("heroStack").textContent = bb(h.stackOf(hero));
    $("villStack").textContent = bb(h.stackOf(vill));
    const hc = $("heroCards"); hc.replaceChildren(cardEl(h.heroCombo.c1), cardEl(h.heroCombo.c2));
    const vc = $("villCards");
    const reveal = h.cur.type === E.SHOW;
    vc.replaceChildren(cardEl(reveal ? h.villCombo.c1 : null), cardEl(reveal ? h.villCombo.c2 : null));
    const bd = $("board"); bd.replaceChildren();
    for (let i = 0; i < 5; i++) {
      if (i < h.board.length) bd.appendChild(cardEl(h.board[i], { fresh: i === fresh }));
      else { const e = document.createElement("div"); e.className = "card slot"; bd.appendChild(e); }
    }
    const n = h.cur, inStreet = n.cs ? n.cs[0] + n.cs[1] : 0;
    $("pot").innerHTML = `Pot <b>${bb(h.pot)}</b>` + (inStreet > 0 && n.type === E.DEC ? ` <span class="sub">(${bb(h.pot - inStreet)} + bets)</span>` : "");
    $("heroMade").textContent = E.handName([...h.board, h.heroCombo.c1, h.heroCombo.c2]);
    $("spotLabel").innerHTML = `<b>${spot.title}</b> <span class="kind">${spot.kind} · ${E.fmt(spot.pot)} bb pot · ${E.fmt(spot.stack)} bb behind</span>`;
  }

  function bubble(p, text) {
    const el = p === hand.hero ? $("heroBubble") : $("villBubble");
    el.textContent = text; el.classList.remove("show"); void el.offsetWidth; if (text) el.classList.add("show");
  }
  const clearBubbles = () => { $("heroBubble").textContent = ""; $("villBubble").textContent = ""; $("heroBubble").classList.remove("show"); $("villBubble").classList.remove("show"); };

  function verb(e) {
    switch (e.kind) {
      case "fold": return "folds";
      case "check": return "checks";
      case "call": return `calls ${E.fmt(e.put)}`;
      case "bet": return `bets ${E.fmt(e.put)}`;
      case "raise": return `raises to ${E.fmt(e.to)}`;
      default: return `all-in ${E.fmt(e.to)}`;
    }
  }
  const STREETS = ["Flop", "Turn", "River"];

  function logLine(html, cls = "") { const li = document.createElement("li"); li.className = cls; li.innerHTML = html; $("log").appendChild(li); li.scrollIntoView({ block: "nearest" }); }

  function renderActions() {
    const box = $("actions"); box.replaceChildren();
    const acts = hand.actions();
    acts.forEach((a, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = `act k-${a.kind}`;
      b.innerHTML = `<span class="key">${i + 1}</span>${a.label}${a.sizing ? `<small>${a.sizing}</small>` : ""}`;
      b.addEventListener("click", () => heroAct(a.a));
      box.appendChild(b);
    });
  }
  const clearActions = (msg = "") => { $("actions").innerHTML = msg ? `<div class="wait">${msg}</div>` : ""; };

  /* ---------- the hand ---------- */
  function chooseDeal() {
    const enabled = manifest.spots.filter(s => settings.spots.includes(s.id));
    const pool = enabled.length ? enabled : manifest.spots;
    const sp = pool[Math.floor(Math.random() * pool.length)];
    const bd = sp.boards[Math.floor(Math.random() * sp.boards.length)];
    const side = settings.side === "any" ? (Math.random() < 0.5 ? 0 : 1) : +settings.side;
    return { sp, bd, side };
  }

  async function newHand(deal) {
    const my = ++token;
    deal = deal || chooseDeal();
    $("review").hidden = true; $("review").replaceChildren();
    document.body.classList.remove("reviewing");
    clearActions("Shuffling…"); clearBubbles();
    let solve;
    try { solve = await loadSolve(deal.bd.file); } catch (e) { clearActions(`Couldn't load ${deal.bd.file}: ${e.message}`); return; }
    if (my !== token) return;
    spot = deal.sp; board = deal.bd;
    let seed = deal.seed ?? Math.floor(Math.random() * 2 ** 31);
    lastDeal = { ...deal, seed };
    hand = new E.Hand(solve, deal.side, mulberry(seed));
    hand.rnd = Math.random;   // the cards are the same on a replay; the runout and the opponent's mixing aren't
    $("log").replaceChildren();
    logLine(`<span class="st">Flop</span> ${cardsText(hand.board)} · pot ${bb(hand.pot)}`, "street");
    renderTable();
    run(my);
  }

  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  async function run(my) {
    while (my === token) {
      const n = hand.cur;
      if (n.type === E.DEC) {
        if (n.player === hand.hero) { busy = false; renderActions(); return; }
        clearActions(`${posName(n.player)} is thinking…`);
        await sleep(settings.speed);
        if (my !== token) return;
        const a = hand.villainAction();
        const e = applyAct(a);
        bubble(e.who, verb(e));
      } else if (n.type === E.CHANCE) {
        await sleep(Math.max(250, settings.speed * 0.7));
        if (my !== token) return;
        const c = hand.deal();
        clearBubbles();
        logLine(`<span class="st">${STREETS[hand.street]}</span> ${cardsText([c])} · pot ${bb(hand.pot)}`, "street");
        renderTable(hand.board.length - 1);
        // all-in runout: keep dealing
      } else { finish(); return; }
    }
  }

  function applyAct(a) {
    hand.act(a);
    const e = hand.log[hand.log.length - 1];
    logLine(`<b>${posName(e.who)}</b> ${verb(e)}`, e.who === hand.hero ? "me" : "them");
    renderTable();
    return e;
  }

  function heroAct(a) {
    if (busy || !hand || hand.cur.type !== E.DEC || hand.cur.player !== hand.hero) return;
    busy = true;
    const e = applyAct(a);
    bubble(e.who, verb(e));
    run(token);
  }

  /* ---------- the review ---------- */
  function finish() {
    clearActions();
    const res = hand.result(), rv = E.review(hand);
    renderTable();
    if (res.showdown) {
      $("villCards").replaceChildren(cardEl(hand.villCombo.c1), cardEl(hand.villCombo.c2));
    }
    const hero = hand.hero, vill = 1 - hero;
    let outcome;
    if (res.fold) outcome = res.winner === hero ? `${posName(vill)} folded. You win the pot.` : `You folded.`;
    else outcome = res.winner === -1 ? "Split pot." : res.winner === hero ? `You win with ${res.heroHand.toLowerCase()}.` : `${posName(vill)} wins with ${res.villHand.toLowerCase()}.`;
    logLine(outcome, "end");

    // stats
    const st = stats; st.hands++; st.score += rv.score; st.lostBB += rv.totalBB; st.netBB += res.net;
    st.bySpot[spot.id] = st.bySpot[spot.id] || { hands: 0, score: 0 };
    st.bySpot[spot.id].hands++; st.bySpot[spot.id].score += rv.score;
    store.set("stats", st); renderStats();

    const el = $("review");
    const villShown = `${posName(vill)} had ${cardsText([hand.villCombo.c1, hand.villCombo.c2])}` + (res.showdown ? ` (${res.villHand.toLowerCase()})` : "");
    const net = res.net - 0; // relative to the flop
    el.innerHTML = `
      <div class="rv-head">
        <div class="grade g-${rv.letter[0]}">${rv.letter}</div>
        <div class="rv-sum">
          <div class="rv-title">Line score <b>${rv.score}</b>/100</div>
          <div>EV given up: <b>${bb(rv.totalBB)}</b> <span class="sub">(${(rv.totalBB / hand.s.pot * 100).toFixed(0)}% of the flop pot)</span></div>
          <div class="sub">${outcome} ${villShown}. Result this hand: <b class="${net >= 0 ? "pos" : "neg"}">${net >= 0 ? "+" : ""}${bb(net)}</b> — the grade ignores the cards that came, only the EV of each choice counts.</div>
        </div>
        <div class="rv-btns">
          <button type="button" class="primary" id="nextBtn">Next hand <kbd>Enter</kbd></button>
          <button type="button" class="ghost" id="replayBtn">Replay these cards <kbd>R</kbd></button>
        </div>
      </div>
      <div class="rv-rows">${rv.rows.length ? rv.rows.map(rowHTML).join("") : `<p class="sub">You had no decisions this hand.</p>`}</div>
      <p class="note">Frequencies are the GTO strategy for <i>your exact hand</i> at that spot; "range" is how often your whole range takes each action there.
      EV loss is measured against the best action, versus the opponent's GTO range at that point (not the cards they actually held).</p>`;
    el.hidden = false; document.body.classList.add("reviewing");
    $("nextBtn").addEventListener("click", () => newHand());
    $("replayBtn").addEventListener("click", () => newHand(lastDeal));
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function rowHTML(r) {
    const n = hand.s.nodes[r.node];
    const before = r.history.filter(e => e.street === r.street).map(e => `${posName(e.who)} ${verb(e)}`).join(", ");
    const lines = r.actions.map((a, i) => {
      const f = r.freq[i], g = r.agg[i], lossBB = r.loss[i] * r.pot, chosen = i === r.chosen;
      const best = r.loss[i] === 0;
      return `<tr class="${chosen ? "chosen" : ""}">
        <td class="an">${chosen ? "▶ " : ""}${a.label}${a.sizing ? ` <small>${a.sizing}</small>` : ""}</td>
        <td class="bar"><div class="b"><i style="width:${(f * 100).toFixed(1)}%"></i></div><span>${(f * 100).toFixed(0)}%</span></td>
        <td class="ev ${best ? "best" : ""}">${best ? "best" : "−" + E.fmt(lossBB) + " bb"}</td>
        <td class="rg">${(g * 100).toFixed(0)}%</td></tr>`;
    }).join("");
    return `<div class="rv-row">
      <div class="rv-ctx">
        <span class="st">${STREETS[r.street]}</span> ${cardsText(r.board)}
        <span class="sub">pot ${bb(r.pot)}${before ? " · " + before : ""}</span>
        <span class="tag ${r.grade.cls}">${r.grade.tag}${r.lossBB > 0.005 ? ` −${E.fmt(r.lossBB)} bb` : ""}</span>
      </div>
      <table><thead><tr><th>Action</th><th>GTO, your hand</th><th>EV loss</th><th>Range</th></tr></thead><tbody>${lines}</tbody></table>
    </div>`;
  }

  /* ---------- stats & settings ---------- */
  function renderStats() {
    const s = stats;
    $("stats").innerHTML = s.hands ? `<span><b>${s.hands}</b> hands</span><span>avg score <b>${Math.round(s.score / s.hands)}</b></span><span>EV lost <b>${E.fmt(s.lostBB / s.hands)}</b> bb/hand</span>` : `<span class="sub">No hands yet</span>`;
  }
  const freshStats = () => ({ hands: 0, score: 0, lostBB: 0, netBB: 0, bySpot: {} });

  function setupSettings() {
    const box = $("spotChecks");
    box.innerHTML = manifest.spots.map(s => `<label><input type="checkbox" value="${s.id}" ${settings.spots.includes(s.id) ? "checked" : ""}> ${s.title} <span class="sub">${s.kind}, ${s.boards.length} flops</span></label>`).join("");
    const dlg = $("settings");
    $("settingsBtn").addEventListener("click", () => {
      dlg.querySelectorAll('input[name="side"]').forEach(i => i.checked = i.value === String(settings.side));
      dlg.querySelectorAll('input[name="speed"]').forEach(i => i.checked = +i.value === settings.speed);
      const ex = manifest.spots.flatMap(s => s.boards.map(b => b.exploitability));
      $("aboutSolve").textContent = `${ex.length} precomputed flops; each solve is within ${Math.max(...ex).toFixed(2)}% of the pot of a Nash equilibrium (average ${(ex.reduce((a, b) => a + b, 0) / ex.length).toFixed(2)}%). Turns and rivers come from a sampled set of cards per flop.`;
      dlg.showModal();
    });
    dlg.addEventListener("close", () => {
      settings.spots = [...box.querySelectorAll("input:checked")].map(i => i.value);
      const side = dlg.querySelector('input[name="side"]:checked'); if (side) settings.side = side.value;
      const sp = dlg.querySelector('input[name="speed"]:checked'); if (sp) settings.speed = +sp.value;
      store.set("settings", settings);
    });
    $("resetStats").addEventListener("click", () => { stats = freshStats(); store.set("stats", stats); renderStats(); });
  }

  document.addEventListener("keydown", e => {
    if (e.target.closest("dialog") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!$("review").hidden) {
      if (e.key === "Enter" || e.key === "n" || e.key === " ") { e.preventDefault(); newHand(); }
      else if (e.key === "r") newHand(lastDeal);
      return;
    }
    const k = parseInt(e.key, 10);
    if (k >= 1 && hand && hand.cur.type === E.DEC && hand.cur.player === hand.hero && k <= hand.cur.nA) heroAct(k - 1);
  });

  async function init() {
    try { manifest = await (await fetch("data/manifest.json")).json(); }
    catch (e) { clearActions("Couldn't load data/manifest.json"); return; }
    settings = Object.assign({ spots: manifest.spots.map(s => s.id), side: "any", speed: 650 }, store.get("settings", {}));
    stats = Object.assign(freshStats(), store.get("stats", {}));
    renderStats(); setupSettings();
    newHand();
  }
  init();
})();
