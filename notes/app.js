/* Notes: a month of days, a blank page for each, notes that aren't tied to a day, and photos.
   Everything is kept on this device first (localStorage for text, IndexedDB for photos) and synced through the
   signed-in person's Google Drive (its hidden app folder) when GOOGLE_CLIENT_ID is set.
   Keys: "d:YYYY-MM-DD" a day, "n:<id>" a note. An entry: {t: text, u: last change (ms), p: [photo ids]}. */
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const app = $("#app"), menu = $("#menu"), jump = $("#jump"), file = $("#file");
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DAYNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const pad = n => String(n).padStart(2, "0");
  const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const today = () => { const d = new Date(); return iso(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
  const longDate = s => { const [y, m, d] = s.split("-").map(Number); const w = new Date(y, m - 1, d).getDay(); return `${DAYNAMES[w]}, ${MONTHS[m - 1]} ${d}, ${y}`; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- the store ---------- */
  const KEY = "notes-v1";
  let db = {}; try { db = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  const get = k => db[k] || { t: "", u: 0, p: [] };
  const put = (k, patch) => { db[k] = { ...get(k), ...patch, u: Date.now() }; persist(); Sync.soon(); };
  // a note's name: one given with *name, else its first line
  const noteName = e => (e.n || e.t.split("\n").find(l => l.trim()) || "untitled").trim();
  const notes = () => Object.keys(db).filter(k => k.startsWith("n:")).map(k => ({ k, name: noteName(db[k]), u: db[k].u }));

  // photos: blobs in IndexedDB, by id
  const idb = new Promise((ok, no) => {
    const r = indexedDB.open("notes-photos", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("p");
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  });
  const tx = async (mode, f) => { const d = await idb; return new Promise((ok, no) => { const t = d.transaction("p", mode); const r = f(t.objectStore("p")); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error); }); };
  const Photos = {
    get: id => tx("readonly", s => s.get(id)),
    put: (id, blob) => tx("readwrite", s => s.put(blob, id)),
    has: async id => !!(await Photos.get(id)),
    del: id => tx("readwrite", s => s.delete(id)),
  };
  // a phone photo is large: keep it at most 2400px on its long side, as JPEG
  async function shrink(f) {
    try {
      const bmp = await createImageBitmap(f);
      const s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      if (s === 1 && f.size < 1.5e6) return f;
      const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      return await new Promise(ok => c.toBlob(b => ok(b || f), "image/jpeg", 0.86));
    } catch { return f; }
  }

  /* ---------- routes: #/2026-11  #/d/2026-11-02  #/d/2026-11-02/photos  #/n/<id>  #/n/<id>/photos ---------- */
  function route() {
    closePops();
    const h = location.hash.slice(2).split("/");
    if (h[0] === "d" && /^\d{4}-\d{2}-\d{2}$/.test(h[1])) return page("d:" + h[1], h[2] === "photos");
    if (h[0] === "n" && h[1]) return page("n:" + h[1], h[2] === "photos");
    if (h[0] === "feedback") return feedback();
    const m = /^(\d{4})-(\d{2})$/.exec(h[0] || "");
    const t = today().split("-").map(Number);
    month(m ? +m[1] : t[0], m ? +m[2] : t[1]);
  }
  addEventListener("hashchange", () => { sessionStorage.setItem("notes-nav", "1"); route(); });
  const go = h => { location.hash = h; };
  const monthOf = k => k.startsWith("d:") ? "#/" + k.slice(2, 9) : "#/";

  /* ---------- the month ---------- */
  function month(y, m) {
    sessionStorage.setItem("notes-month", "#/" + iso(y, m, 1).slice(0, 7));
    document.title = `${MONTHS[m - 1]} ${y} · Notes`;
    const first = new Date(y, m - 1, 1).getDay(), days = new Date(y, m, 0).getDate(), t = today();
    const cells = Math.ceil((first + days) / 7) * 7;
    let grid = "";
    for (let i = 0; i < cells; i++) {
      const d = i - first + 1;
      if (d < 1 || d > days) { grid += `<div class="blank"></div>`; continue; }
      const s = iso(y, m, d), e = db["d:" + s], has = e && (e.t.trim() || (e.p && e.p.length));
      grid += `<a href="#/d/${s}" class="${s === t ? "today" : ""} ${has ? "has" : ""}" aria-label="${longDate(s)}${has ? ", written" : ""}"><span class="n">${d}</span></a>`;
    }
    const prev = m === 1 ? iso(y - 1, 12, 1).slice(0, 7) : iso(y, m - 1, 1).slice(0, 7);
    const next = m === 12 ? iso(y + 1, 1, 1).slice(0, 7) : iso(y, m + 1, 1).slice(0, 7);
    app.innerHTML = `<section class="month">
      <header><h1>${MONTHS[m - 1]} ${y}</h1>
        <div class="nav"><a class="sync" href="#/feedback">Feedback</a>${Sync.button()}
          <button type="button" aria-label="Previous month" data-go="#/${prev}">‹</button>
          <button type="button" aria-label="Next month" data-go="#/${next}">›</button></div></header>
      <div class="names" aria-hidden="true">${DAYS.map(n => `<div>${n}</div>`).join("")}</div>
      <nav class="grid" aria-label="${MONTHS[m - 1]} ${y}">${grid}</nav></section>`;
    app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
    const sb = app.querySelector(".sync"); if (sb) sb.onclick = () => Sync.connect();
  }

  /* ---------- a page (a day or a note) ---------- */
  let current = null; // {k, ta}
  // ← from a day or a note: the calendar (a day's own month; a note, the month last looked at)
  const lastMonth = () => sessionStorage.getItem("notes-month") || "#/";
  const back = k => go(k.startsWith("d:") ? monthOf(k) : lastMonth());
  const camera = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5L5 20"/></svg>`;

  function page(k, photos) {
    const e = get(k), label = k.startsWith("d:") ? longDate(k.slice(2)) : noteName(e);
    document.title = `${label} · Notes`;
    const n = (e.p || []).length;
    const path = k.startsWith("d:") ? `#/d/${k.slice(2)}` : `#/n/${k.slice(2)}`;
    app.innerHTML = `<section class="page">
      <div class="bar"><button type="button" class="icon back" aria-label="Back">←</button>
        ${photos ? "" : `<a class="icon" href="${path}/photos" aria-label="Photos${n ? ` (${n})` : ""}">${camera}${n ? `<span class="count">${n}</span>` : ""}</a>`}</div>
      ${photos ? `<div class="photos" aria-label="Photos for ${label}"></div>` : `<label for="ta" class="mirror">Notes for ${label}</label><textarea id="ta" spellcheck="true"></textarea>`}</section>`;
    app.querySelector(".back").onclick = () => photos ? go(path) : back(k);
    if (photos) { current = null; return drawPhotos(k); }
    const ta = $("#ta"); ta.value = e.t; current = { k, ta };
    ta.addEventListener("input", () => { put(k, { t: ta.value }); jumpCheck(); });
    ta.addEventListener("keydown", jumpKeys);
    ta.addEventListener("click", jumpCheck);
    ta.addEventListener("blur", () => setTimeout(() => { if (!jump.matches(":hover")) hide(jump); }, 150));
    ta.addEventListener("contextmenu", openMenu);
    const at = +sessionStorage.getItem("notes-caret-" + k);
    ta.focus(); const c = Number.isFinite(at) && at > 0 ? Math.min(at, ta.value.length) : (k.startsWith("n:") ? 0 : ta.value.length);
    ta.setSelectionRange(c, c);
    ta.addEventListener("keyup", () => sessionStorage.setItem("notes-caret-" + k, ta.selectionStart));
  }

  async function drawPhotos(k) {
    const box = app.querySelector(".photos"), ids = get(k).p || [];
    box.innerHTML = ids.map(id => `<button type="button" class="ph" data-id="${id}" aria-label="Open photo"></button>`).join("") +
      `<button type="button" class="add" aria-label="Add photos"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Add</button>`;
    box.querySelector(".add").onclick = () => { file.dataset.k = k; file.click(); };
    for (const b of box.querySelectorAll(".ph")) {
      const blob = await Photos.get(b.dataset.id) || await Sync.photo(b.dataset.id);
      if (!blob || !b.isConnected) continue;
      const url = URL.createObjectURL(blob);
      b.innerHTML = `<img alt="" src="${url}">`;
      b.onclick = () => view(k, b.dataset.id, url);
    }
  }
  // a photo, full screen: × closes it, the bin deletes it (a second tap to be sure)
  function view(k, id, url) {
    const v = document.createElement("div"); v.className = "view"; v.setAttribute("role", "dialog"); v.setAttribute("aria-label", "Photo");
    v.innerHTML = `<img alt="Photo" src="${url}"><div class="vbar">
      <button type="button" class="vbtn close" aria-label="Close">×</button>
      <button type="button" class="vbtn del" aria-label="Delete photo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg><span></span></button></div>`;
    const close = () => { v.remove(); removeEventListener("keydown", esc); };
    const esc = ev => { if (ev.key === "Escape") close(); };
    addEventListener("keydown", esc);
    v.onclick = ev => { if (ev.target === v || ev.target.tagName === "IMG") close(); };
    v.querySelector(".close").onclick = close;
    const del = v.querySelector(".del");
    del.onclick = async () => {
      if (!del.classList.contains("sure")) { del.classList.add("sure"); del.querySelector("span").textContent = "Delete?"; return; }
      close();
      put(k, { p: (get(k).p || []).filter(x => x !== id) });
      await Photos.del(id); Sync.forget(id); route();
    };
    document.body.append(v);
  }
  file.addEventListener("change", async () => {
    const k = file.dataset.k, ids = [...(get(k).p || [])];
    for (const f of file.files) { const id = uid(); await Photos.put(id, await shrink(f)); ids.push(id); }
    file.value = ""; put(k, { p: ids }); Sync.soon(0); route();
  });

  /* ---------- right-click on highlighted text: export to a new note (the day stays as it was) ---------- */
  function openMenu(ev) {
    const ta = ev.target; if (ta.selectionStart === ta.selectionEnd) return; // nothing highlighted: the usual menu
    ev.preventDefault(); show(menu, ev.clientX, ev.clientY);
  }
  menu.addEventListener("click", async ev => {
    const b = ev.target.closest("button"); if (!b || !current) return;
    const { ta } = current, text = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    hide(menu);
    if (b.dataset.act === "copy") { try { await navigator.clipboard.writeText(text); } catch { document.execCommand("copy"); } ta.focus(); return; }
    // the new note: a blank first line for its name, the cursor on it, the text below
    const id = uid(); put("n:" + id, { t: "\n" + text }); sessionStorage.setItem("notes-caret-n:" + id, "0");
    go("#/n/" + id);
  });

  /* ---------- *name / *11/2 / *11/2/26: jump; the *command is erased when you go ---------- */
  let opts = [], on = 0, tok = null, armed = false;
  function parseDate(q) {
    const m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/.exec(q); if (!m) return null;
    const mo = +m[1], d = +m[2]; let y = m[3] ? +m[3] : +today().slice(0, 4); if (y < 100) y += 2000;
    if (mo < 1 || mo > 12 || d < 1 || d > new Date(y, mo, 0).getDate()) return null;
    return iso(y, mo, d);
  }
  function jumpCheck() {
    armed = false;
    if (!current) return;
    const { ta } = current, before = ta.value.slice(0, ta.selectionStart);
    // *name <a name>: names the note (notes only; a day has its date)
    const nm = current.k.startsWith("n:") && ta.selectionStart === ta.selectionEnd && /(^|\s)\*name[ \t]+([^\n*]*\S)[ \t]*$/.exec(before);
    if (nm) {
      tok = { start: ta.selectionStart - nm[0].length + nm[1].length, end: ta.selectionStart };
      opts = [{ label: `Name this note “${nm[2].trim()}”`, name: nm[2].trim() }]; on = 0;
      return drawJump(ta, tok.start);
    }
    const m = ta.selectionStart === ta.selectionEnd && /(^|\s)\*([^\s*]*)$/.exec(before);
    if (!m) { hide(jump); tok = null; return; }
    const q = m[2], start = ta.selectionStart - q.length - 1;
    tok = { start, end: ta.selectionStart };
    const date = parseDate(q);
    if (date) opts = [{ label: longDate(date), h: `#/d/${date}` }];
    else {
      const ql = q.toLowerCase();
      opts = notes().filter(n => n.k !== current.k && !db[n.k].a && (!ql || n.name.toLowerCase().includes(ql)))
        .sort((a, b) => (b.name.toLowerCase().startsWith(ql) - a.name.toLowerCase().startsWith(ql)) || b.u - a.u)
        .slice(0, 6).map(n => ({ label: n.name, h: `#/n/${n.k.slice(2)}` }));
      // *list and *page need no menu: Enter just does it
      if (ql === "list" || ql === "page") { opts = [ql === "list" ? { list: true } : { page: true }]; on = 0; armed = true; hide(jump); return; }
    }
    if (!opts.length) { hide(jump); return; }
    drawJump(ta, start);
  }
  function drawJump(ta, start) {
    on = Math.min(on, opts.length - 1);
    jump.innerHTML = opts.map((o, i) => `<div class="opt${i === on ? " on" : ""}" role="option" aria-selected="${i === on}" data-i="${i}"><span></span>${i === on ? "<small>Enter</small>" : ""}</div>`).join("");
    jump.querySelectorAll(".opt span").forEach((s, i) => s.textContent = opts[i].label);
    const p = caretXY(ta, start); show(jump, p.x, p.y + 6);
  }
  function jumpKeys(ev) {
    if (armed && ev.key === "Enter") { ev.preventDefault(); return take(0); }
    if (jump.hidden) return;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); on = (on + (ev.key === "ArrowDown" ? 1 : opts.length - 1)) % opts.length; jumpCheck(); }
    else if (ev.key === "Enter" || ev.key === "Tab") { ev.preventDefault(); take(on); }
    else if (ev.key === "Escape") { ev.preventDefault(); hide(jump); }
  }
  jump.addEventListener("mousedown", ev => { const o = ev.target.closest(".opt"); if (o) { ev.preventDefault(); take(+o.dataset.i); } });
  function take(i) {
    const o = opts[i]; if (!o || !current || !tok) return;
    const { k, ta } = current, tok0 = tok.start;
    ta.value = ta.value.slice(0, tok.start) + ta.value.slice(tok.end); // the command leaves no trace
    put(k, { t: ta.value }); sessionStorage.setItem("notes-caret-" + k, tok.start);
    hide(jump); on = 0; tok = null; armed = false;
    if (o.list) { ta.setSelectionRange(tok0, tok0); return openList(); }
    if (o.name) { db[k] = { ...db[k], n: o.name }; put(k, {}); document.title = `${o.name} · Notes`; ta.setSelectionRange(tok0, tok0); return; }
    if (o.page) { const id = uid(); put("n:" + id, { t: "" }); return go("#/n/" + id); }
    go(o.h);
  }

  /* ---------- *list: a floating, scrolling list of the notes (not the days); a note can be archived from it ---------- */
  const listEl = document.createElement("div");
  listEl.className = "pop listp"; listEl.hidden = true; listEl.tabIndex = -1; listEl.setAttribute("role", "dialog"); listEl.setAttribute("aria-label", "All notes");
  listEl.innerHTML = `<div class="rows" role="listbox" aria-label="Notes"></div><button type="button" class="lmore"></button>`;
  document.body.append(listEl);
  const rows = listEl.querySelector(".rows"), more = listEl.querySelector(".lmore");
  const boxIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></svg>`;
  let lopts = [], lon = 0, lfrom = null, showArchived = false;
  function drawList() {
    const all = notes(), live = all.filter(n => !db[n.k].a), arch = all.filter(n => db[n.k].a);
    lopts = (showArchived ? arch : live).sort((a, b) => b.u - a.u);
    lon = Math.min(lon, Math.max(0, lopts.length - 1));
    rows.innerHTML = lopts.length ? "" : `<div class="lempty">${showArchived ? "Nothing archived" : "No notes yet"}</div>`;
    lopts.forEach((n, i) => {
      const r = document.createElement("div"); r.className = "lrow" + (i === lon ? " on" : ""); r.setAttribute("role", "option"); r.setAttribute("aria-selected", i === lon); r.dataset.i = i;
      const body = db[n.k].t.split("\n").map(l => l.trim()).filter(Boolean); if (!db[n.k].n) body.shift();
      const txt = document.createElement("div"); txt.className = "ltxt";
      const nm = document.createElement("b"); nm.textContent = n.name;
      const sn = document.createElement("span"); sn.textContent = body.join(" · ").slice(0, 120);
      txt.append(nm, sn);
      const ar = document.createElement("button"); ar.type = "button"; ar.className = "larch";
      ar.setAttribute("aria-label", (showArchived ? "Unarchive " : "Archive ") + n.name);
      ar.innerHTML = showArchived ? `<small>Unarchive</small>` : boxIcon;
      r.append(txt, ar); rows.append(r);
    });
    more.textContent = showArchived ? "← Notes" : (arch.length ? `Archived (${arch.length})` : "");
    more.hidden = !showArchived && !arch.length;
    const on_ = rows.querySelector(".on"); if (on_) on_.scrollIntoView({ block: "nearest" });
  }
  function openList() { lfrom = current; lon = 0; showArchived = false; drawList(); listEl.hidden = false; listEl.focus(); }
  function closeList(refocus = true) { listEl.hidden = true; if (refocus && lfrom && lfrom.ta.isConnected) lfrom.ta.focus(); }
  const openNote = i => { if (!lopts[i]) return; closeList(false); go(`#/n/${lopts[i].k.slice(2)}`); };
  const archive = (i, yes) => { const n = lopts[i]; if (!n) return; db[n.k] = { ...db[n.k], a: yes, u: Date.now() }; persist(); Sync.soon(); drawList(); listEl.focus(); };
  listEl.addEventListener("keydown", ev => {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); if (lopts.length) { lon = (lon + (ev.key === "ArrowDown" ? 1 : lopts.length - 1)) % lopts.length; drawList(); } }
    else if (ev.key === "Enter" && ev.target === listEl) { ev.preventDefault(); openNote(lon); }
    else if (ev.key === "Escape") { ev.preventDefault(); closeList(); }
  });
  rows.addEventListener("click", ev => {
    const r = ev.target.closest(".lrow"); if (!r) return;
    if (ev.target.closest(".larch")) return archive(+r.dataset.i, !showArchived);
    openNote(+r.dataset.i);
  });
  more.addEventListener("click", () => { showArchived = !showArchived; lon = 0; drawList(); listEl.focus(); });
  addEventListener("mousedown", ev => { if (!listEl.hidden && !listEl.contains(ev.target)) closeList(); });
  // where in the window a character of the textarea is drawn
  function caretXY(ta, at) {
    const m = document.createElement("div"), cs = getComputedStyle(ta);
    m.className = "mirror";
    for (const p of ["font", "lineHeight", "letterSpacing", "paddingTop", "paddingLeft", "paddingRight", "borderWidth", "boxSizing"]) m.style[p] = cs[p];
    m.style.width = ta.clientWidth + "px";
    m.textContent = ta.value.slice(0, at); const s = document.createElement("span"); s.textContent = "​"; m.append(s);
    document.body.append(m);
    const r = ta.getBoundingClientRect(), x = r.left + s.offsetLeft, y = r.top + s.offsetTop - ta.scrollTop + parseFloat(cs.lineHeight);
    m.remove(); return { x, y };
  }

  /* ---------- menus ---------- */
  function show(el, x, y) {
    el.hidden = false; const w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.max(16, Math.min(x, innerWidth - w - 16)) + "px";
    el.style.top = (y + h > innerHeight - 8 ? Math.max(8, y - h - 36) : y) + "px";
  }
  const hide = el => { el.hidden = true; };
  const closePops = () => { hide(menu); hide(jump); if (!listEl.hidden) closeList(false); };
  addEventListener("mousedown", ev => { if (!menu.contains(ev.target)) hide(menu); });
  addEventListener("keydown", ev => { if (ev.key === "Escape") hide(menu); });
  addEventListener("resize", closePops);

  /* ---------- Google Drive sync (the hidden app folder of the signed-in account) ---------- */
  const Sync = (() => {
    const ID = window.GOOGLE_CLIENT_ID, API = "https://www.googleapis.com/drive/v3/files", UP = "https://www.googleapis.com/upload/drive/v3/files";
    let token = null, expires = 0, client = null, timer = 0, busy = false, again = false, state = "", files = null;
    const wanted = () => { try { return localStorage.getItem("notes-drive") === "1"; } catch { return false; } };
    const setState = s => { state = s; const b = document.querySelector(".sync"); if (b) b.textContent = label(); };
    const label = () => !ID ? "" : !wanted() ? "Sync with Google Drive" : state || "Synced";
    const button = () => ID ? `<button type="button" class="sync">${label()}</button>` : "";

    function auth(prompt) {
      return new Promise((ok, no) => {
        if (!window.google || !google.accounts) return no(new Error("Google sign-in didn't load"));
        client = client || google.accounts.oauth2.initTokenClient({ client_id: ID, scope: "https://www.googleapis.com/auth/drive.appdata", callback: () => {} });
        client.callback = r => { if (r.error) return no(new Error(r.error)); token = r.access_token; expires = Date.now() + (r.expires_in - 60) * 1000; ok(); };
        client.error_callback = e => no(new Error(e.type || "sign-in closed"));
        client.requestAccessToken({ prompt });
      });
    }
    async function call(url, opt = {}, retry = true) {
      if (!token || Date.now() > expires) await auth("");
      const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: "Bearer " + token } });
      if (r.status === 401 && retry) { token = null; return call(url, opt, false); }
      if (!r.ok) throw new Error(`Drive ${r.status}`);
      return r;
    }
    async function list() {
      const out = {}; let page = "";
      do {
        const r = await (await call(`${API}?spaces=appDataFolder&pageSize=1000&fields=nextPageToken,files(id,name)${page ? "&pageToken=" + page : ""}`)).json();
        for (const f of r.files) out[f.name] = f.id; page = r.nextPageToken || "";
      } while (page);
      return out;
    }
    async function upload(name, body, type) {
      if (files[name]) return call(`${UP}/${files[name]}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": type }, body });
      const fd = new FormData();
      fd.append("meta", new Blob([JSON.stringify({ name, parents: ["appDataFolder"] })], { type: "application/json" }));
      fd.append("file", new Blob([body], { type }));
      const r = await (await call(`${UP}?uploadType=multipart&fields=id`, { method: "POST", body: fd })).json();
      files[name] = r.id;
    }

    async function run() {
      if (!ID || !wanted() || !navigator.onLine) return;
      if (busy) { again = true; return; }
      busy = true; setState("Syncing…");
      try {
        files = await list();
        // text: each entry, the newer copy wins
        let remote = {};
        if (files["notes.json"]) remote = await (await call(`${API}/${files["notes.json"]}?alt=media`)).json();
        let pull = false, push = false;
        for (const [k, e] of Object.entries(remote)) if (!db[k] || e.u > db[k].u) { db[k] = e; pull = true; }
        for (const [k, e] of Object.entries(db)) if (!remote[k] || e.u > remote[k].u) push = true;
        if (pull) { persist(); refresh(); }
        if (push) await upload("notes.json", JSON.stringify(db), "application/json");
        // photos: this device's that Drive hasn't got
        for (const id of gone()) { if (files["p-" + id]) { await call(`${API}/${files["p-" + id]}`, { method: "DELETE" }); delete files["p-" + id]; } setGone(gone().filter(x => x !== id)); }
        for (const e of Object.values(db)) for (const id of e.p || []) {
          if (files["p-" + id]) continue;
          const b = await Photos.get(id); if (b) await upload("p-" + id, b, b.type || "image/jpeg");
        }
        setState("Synced");
      } catch (e) { console.warn("[sync]", e); setState(navigator.onLine ? "Sync paused, tap to retry" : "Offline, will sync"); }
      busy = false; if (again) { again = false; soon(0); }
    }
    // what came in from another device: redraw, unless it's the page being typed on
    function refresh() {
      if (current && document.activeElement === current.ta) {
        const e = get(current.k); if (e.t !== current.ta.value) { const c = current.ta.selectionStart; current.ta.value = e.t; current.ta.setSelectionRange(c, c); }
        return;
      }
      route();
    }
    const gone = () => { try { return JSON.parse(localStorage.getItem("notes-gone") || "[]"); } catch { return []; } };
    const setGone = l => { try { localStorage.setItem("notes-gone", JSON.stringify(l)); } catch {} };
    const forget = id => { setGone([...gone(), id]); soon(0); };
    const soon = (ms = 2500) => { clearTimeout(timer); timer = setTimeout(run, ms); };
    async function photo(id) {
      if (!ID || !wanted()) return null;
      try {
        files = files || await list(); if (!files["p-" + id]) return null;
        const b = await (await call(`${API}/${files["p-" + id]}?alt=media`)).blob();
        await Photos.put(id, b); return b;
      } catch { return null; }
    }
    async function connect() {
      try { localStorage.setItem("notes-drive", "1"); } catch {}
      try { await auth(token ? "" : "consent"); } catch (e) { setState("Sign-in didn't finish, tap to retry"); return; }
      run();
    }
    addEventListener("online", () => soon(0));
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") soon(500); else if (timer) { clearTimeout(timer); run(); } });
    // sign in quietly when the page opens (an account that already said yes gets no prompt)
    addEventListener("load", () => { if (ID && wanted()) setTimeout(() => run(), 600); });
    return { button, connect, soon, photo, forget };
  })();

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  /* ---------- feedback: the same inbox as the go site (its Apps Script: the Feedback sheet, and a ping that wakes
     Claude); offline it waits here and goes when the connection is back ---------- */
  const FEEDBACK_URL = "https://script.google.com/macros/s/AKfycbxClc9eoQ4jhxT2hwGK-y_JZef-7N9S27XJqPejKic8mO47qtbI5WNMYofN7hpMb_fGdw/exec";
  const OUT = "notes-feedback-out";
  const outbox = () => { try { return JSON.parse(localStorage.getItem(OUT) || "[]"); } catch { return []; } };
  const setOutbox = l => { try { localStorage.setItem(OUT, JSON.stringify(l)); } catch {} };
  const who = () => { try { return localStorage.getItem("gt-username") || ""; } catch { return ""; } };
  const post = payload => fetch(FEEDBACK_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
    .then(r => { if (!r.ok) throw new Error("feedback " + r.status); });
  async function sendFeedback(message) {
    const payload = { username: who(), kind: "feedback", data: { message, context: "notes · " + (sessionStorage.getItem("notes-from") || "#/") } };
    try { if (!navigator.onLine) throw new Error("offline"); await post(payload); return "sent"; }
    catch { setOutbox([...outbox(), payload]); return "queued"; }
  }
  async function flushFeedback() {
    for (const p of outbox()) { try { await post(p); setOutbox(outbox().filter(x => JSON.stringify(x) !== JSON.stringify(p))); } catch { return; } }
  }
  addEventListener("online", flushFeedback); if (navigator.onLine) setTimeout(flushFeedback, 1500);
  function feedback() {
    current = null; document.title = "Feedback · Notes";
    app.innerHTML = `<section class="page">
      <div class="bar"><button type="button" class="icon back" aria-label="Back">←</button></div>
      <div class="fb"><h1>Feedback</h1>
        <label for="fbta" class="mirror">Feedback</label>
        <textarea id="fbta"></textarea>
        <div class="fbrow"><button type="button" class="send">Send</button><span class="fbmsg" role="status"></span></div></div></section>`;
    app.querySelector(".back").onclick = () => go(lastMonth());
    const ta = $("#fbta"), btn = app.querySelector(".send"), msg = app.querySelector(".fbmsg");
    ta.focus();
    btn.onclick = async () => {
      const text = ta.value.trim();
      if (!text) { msg.textContent = "Write something first."; return; }
      btn.disabled = true; msg.textContent = "";
      const how = await sendFeedback(text);
      ta.value = ""; btn.disabled = false;
      msg.textContent = how === "queued" ? "Saved. It'll send when you're back online. Thanks!" : "Sent. Thanks!";
    };
  }
  addEventListener("hashchange", ev => { const o = new URL(ev.oldURL).hash; if (!o.startsWith("#/feedback")) sessionStorage.setItem("notes-from", o || "#/"); });

  window.__notes = { db: () => db, parseDate, outbox };
  route();
})();
