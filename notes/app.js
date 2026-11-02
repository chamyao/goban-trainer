/* Notes: a month of days, a blank page for each, notes that aren't tied to a day, and photos.
   Locked with one password (no username). Everything is scrambled with it (AES-GCM, the key derived from the
   password with PBKDF2), kept on this device first (localStorage for text, IndexedDB for photos) and synced through
   the person's Google Drive (a "Notes" folder that holds only scrambled files).
   A new browser signs in to Google, then asks for the password; the very first one creates it.
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
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const CLIENT_ID = "630442006940-t4g267fvkb2djt0v8d9oqib2ijkriijr.apps.googleusercontent.com";
  let ready = false; // unlocked and loaded

  /* ---------- the scrambling: AES-GCM, the key from the password (PBKDF2-SHA256, 310000 rounds) ---------- */
  const te = new TextEncoder(), td = new TextDecoder();
  const b64 = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  let K = null; // {key: CryptoKey, salt: base64}
  async function derive(pass, salt) {
    const base = await crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveBits"]);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unb64(salt), iterations: 310000 }, base, 512));
    return { key: await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-GCM", false, ["encrypt", "decrypt"]), salt };
  }
  async function seal(bytes) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, K.key, bytes)); const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return out; }
  async function unseal(u8) { return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u8.slice(0, 12) }, K.key, u8.slice(12))); }
  const sealText = async str => b64(await seal(te.encode(str)));
  const openText = async s => td.decode(await unseal(unb64(s)));

  // IndexedDB: "p" photos (scrambled), "k" this browser's key (so a known browser doesn't ask again)
  // (a tab still open on an older version holds the old database: say so instead of waiting forever)
  const idb = new Promise((ok, no) => {
    const r = indexedDB.open("notes-photos", 2);
    r.onupgradeneeded = () => { for (const n of ["p", "k"]) if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n); };
    r.onsuccess = () => { const d = r.result; d.onversionchange = () => d.close(); ok(d); };
    r.onerror = () => no(r.error);
    r.onblocked = () => { app.innerHTML = `<section class="gate"><form><h1>One moment</h1><p class="gmsg">Notes is open in another tab. Close the other tab and this one will open.</p></form></section>`; };
  });
  const tx = async (store, mode, f) => { const d = await idb; return new Promise((ok, no) => { const t = d.transaction(store, mode); const r = f(t.objectStore(store)); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error); }); };
  const Keys = {
    load: () => tx("k", "readonly", s => s.get("me")).catch(() => null),
    save: k => tx("k", "readwrite", s => s.put(k, "me")),
  };

  /* ---------- the store: scrambled in localStorage ---------- */
  const KEY = "notes-enc";
  let db = {};
  let writing = Promise.resolve();
  const persist = () => { const snap = JSON.stringify(db); writing = writing.then(async () => { try { localStorage.setItem(KEY, await sealText(snap)); } catch (e) { console.warn("[store]", e); } }); return writing; };
  async function loadDb() {
    db = {};
    try { const s = localStorage.getItem(KEY); if (s) db = JSON.parse(await openText(s)); } catch (e) { console.warn("[store] couldn't open", e); }
    // notes kept unscrambled (the weeks without a password, or before it): taken in, scrambled, the plain copy removed
    for (const old of ["notes-v2", "notes-v1"]) try { const o = JSON.parse(localStorage.getItem(old) || "null"); if (o) { mergeIn(o); await persist(); localStorage.removeItem(old); } } catch {}
    const ids = await tx("p", "readonly", s => s.getAllKeys()).catch(() => []);
    for (const id of ids) { const r = await tx("p", "readonly", s => s.get(id)); if (r && r.b) await Photos.put(id, r.b); }
  }
  // each entry: the newer copy wins
  function mergeIn(other) { let changed = false; for (const [k, e] of Object.entries(other || {})) if (!db[k] || e.u > db[k].u) { db[k] = e; changed = true; } return changed; }
  const get = k => db[k] || { t: "", u: 0, p: [] };
  const put = (k, patch) => { db[k] = { ...get(k), ...patch, u: Date.now() }; persist(); Sync.soon(); };
  // a note's name: one given with *name, else its first line
  const noteName = e => (e.n || e.t.split("\n").find(l => l.trim()) || "untitled").trim();
  const notes = () => Object.keys(db).filter(k => k.startsWith("n:")).map(k => ({ k, name: noteName(db[k]), u: db[k].u }));

  // photos: scrambled in IndexedDB, by id ({t: type, d: scrambled bytes}; {b: blob} is an unscrambled leftover)
  const Photos = {
    get: async id => { const r = await tx("p", "readonly", s => s.get(id)); if (!r) return null; if (r.b) return r.b; if (!r.d) return null; try { return new Blob([await unseal(r.d)], { type: r.t }); } catch { return null; } },
    put: async (id, blob) => { const d = await seal(new Uint8Array(await blob.arrayBuffer())); return tx("p", "readwrite", s => s.put({ t: blob.type || "image/jpeg", d }, id)); },
    raw: id => tx("p", "readonly", s => s.get(id)),
    putRaw: (id, r) => tx("p", "readwrite", s => s.put(r, id)),
    del: id => tx("p", "readwrite", s => s.delete(id)),
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
    if (!ready) return;
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
      // ~like this~ in a day's writing shows on the calendar
      const tags = e ? [...e.t.matchAll(/~([^~\n]+)~/g)].map(m => m[1].trim()).filter(Boolean) : [];
      grid += `<a href="#/d/${s}" class="${s === t ? "today" : ""} ${has ? "has" : ""} ${tags.length ? "tagged" : ""}" aria-label="${longDate(s)}${tags.length ? ": " + esc(tags.join(", ")) : has ? ", written" : ""}"><span class="n">${d}</span>${tags.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</a>`;
    }
    const prev = m === 1 ? iso(y - 1, 12, 1).slice(0, 7) : iso(y, m - 1, 1).slice(0, 7);
    const next = m === 12 ? iso(y + 1, 1, 1).slice(0, 7) : iso(y, m + 1, 1).slice(0, 7);
    app.innerHTML = `<section class="month">
      <label class="cmdrow"><input id="cmd" class="cmd" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Go to: type * and a date, a note's name, list or page"></label>
      <header><h1>${MONTHS[m - 1]} ${y}</h1>
        <div class="nav"><a class="sync" href="#/feedback">Feedback</a>${Sync.button()}
          <button type="button" aria-label="Previous month" data-go="#/${prev}">‹</button>
          <button type="button" aria-label="Next month" data-go="#/${next}">›</button></div></header>
      <div class="names" aria-hidden="true">${DAYS.map(n => `<div>${n}</div>`).join("")}</div>
      <nav class="grid" aria-label="${MONTHS[m - 1]} ${y}">${grid}</nav></section>`;
    app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
    // the typing space: the same * commands as a page, so the site works without a mouse
    const cmd = $("#cmd"); current = { k: "home", ta: cmd };
    cmd.addEventListener("input", jumpCheck); cmd.addEventListener("keydown", ev => { jumpKeys(ev); if (ev.key === "Escape" && jump.hidden) cmd.value = ""; });
    cmd.addEventListener("blur", () => setTimeout(() => { if (!jump.matches(":hover")) hide(jump); }, 150));
    if (matchMedia("(pointer: fine)").matches) cmd.focus(); // not on a phone: the keyboard would cover the calendar
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
    const { ta } = current;
    let before = ta.value.slice(0, ta.selectionStart);
    // the calendar's cursor: the * is implied (typing it still works)
    if (current.k === "home" && before && !before.includes("*") && !/^\s/.test(before)) before = "*" + before;
    // *name <a name>: names the note (notes only; a day has its date)
    const nm = current.k.startsWith("n:") && ta.selectionStart === ta.selectionEnd && /(^|\s)\*name[ \t]+([^\n*]*\S)[ \t]*$/.exec(before);
    if (nm) {
      tok = { start: ta.selectionStart - nm[0].length + nm[1].length, end: ta.selectionStart };
      opts = [{ label: `Name this note “${nm[2].trim()}”`, name: nm[2].trim() }]; on = 0;
      return drawJump(ta, tok.start);
    }
    const m = ta.selectionStart === ta.selectionEnd && /(^|\s)\*([^\s*]*)$/.exec(before);
    if (!m) { hide(jump); tok = null; return; }
    const q = m[2], start = Math.max(0, ta.selectionStart - q.length - 1);
    tok = { start, end: ta.selectionStart };
    const date = parseDate(q);
    if (date) opts = [{ label: longDate(date), h: `#/d/${date}` }];
    else {
      const ql = q.toLowerCase();
      opts = notes().filter(n => n.k !== current.k && !db[n.k].a && (!ql || n.name.toLowerCase().includes(ql)))
        .sort((a, b) => (b.name.toLowerCase().startsWith(ql) - a.name.toLowerCase().startsWith(ql)) || b.u - a.u)
        .slice(0, 6).map(n => ({ label: n.name, h: `#/n/${n.k.slice(2)}` }));
      // *list and *page need no menu: Enter just does it
      // *list opens as soon as it's typed; *page and *archive need no menu: Enter does it
      if (ql === "list") { opts = [{ list: true }]; on = 0; hide(jump); return take(0); }
      if (ql === "page") { opts = [{ page: true }]; on = 0; armed = true; hide(jump); return; }
      if (ql === "backup") { opts = [{ backup: true }]; on = 0; armed = true; hide(jump); return; }
      if (ql === "today") { opts = [{ h: `#/d/${today()}` }]; on = 0; armed = true; hide(jump); return; }
      if (ql === "calendar" && current.k !== "home") { opts = [{ calendar: true }]; on = 0; armed = true; hide(jump); return; }
      if (ql === "archive" && current.k.startsWith("n:")) { opts = [{ archive: true }]; on = 0; armed = true; hide(jump); return; }
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
    if (k !== "home") { put(k, { t: ta.value }); sessionStorage.setItem("notes-caret-" + k, tok.start); }
    hide(jump); on = 0; tok = null; armed = false;
    if (o.list) { ta.setSelectionRange(tok0, tok0); return openList(); }
    if (o.name) { db[k] = { ...db[k], n: o.name }; put(k, {}); document.title = `${o.name} · Notes`; ta.setSelectionRange(tok0, tok0); return; }
    if (o.page) { const id = uid(); put("n:" + id, { t: "" }); return go("#/n/" + id); }
    // *archive: this note goes to the archive (bring it back from *list → Archived), and back to the calendar
    if (o.archive) { put(k, { a: true }); return go(lastMonth()); }
    if (o.calendar) return go(lastMonth());
    if (o.backup) { if (k !== "home") ta.setSelectionRange(tok0, tok0); return backup(); }
    go(o.h);
  }

  /* ---------- *backup: one file with everything, still scrambled (the password opens it), saved to this device ---------- */
  async function backup() {
    const photos = {};
    for (const e of Object.values(db)) for (const id of e.p || []) {
      let r = await Photos.raw(id); if (r && r.b) { await Photos.put(id, r.b); r = await Photos.raw(id); }
      if (r && r.d) photos[id] = { t: r.t, d: b64(r.d) };
    }
    const lock = JSON.parse(await lockFor(K));
    const file = { what: "Notes backup: scrambled with your notes password", made: new Date().toISOString(), salt: lock.salt, check: lock.check, notes: await sealText(JSON.stringify(db)), photos };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(file)], { type: "application/json" }));
    a.download = `notes-backup-${today()}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
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

  /* ---------- Google Drive: a "Notes" folder (drive.file: the site sees only what it made); every file is scrambled ---------- */
  const Drive = (() => {
    const API = "https://www.googleapis.com/drive/v3/files", UP = "https://www.googleapis.com/upload/drive/v3/files";
    const SCOPE = "https://www.googleapis.com/auth/drive.file", TOK = "notes-gtoken-file";
    let client = null, files = null, folder = null;
    const saved = () => { try { const t = JSON.parse(localStorage.getItem(TOK) || "null"); return t && t.exp > Date.now() ? t : null; } catch { return null; } };
    let tok = saved();
    const signedIn = () => { try { return localStorage.getItem("notes-google") === "1"; } catch { return false; } };
    const gsi = () => new Promise((ok, no) => { let n = 0; const t = setInterval(() => { if (window.google && google.accounts && google.accounts.oauth2) { clearInterval(t); ok(); } else if (++n > 100) { clearInterval(t); no(new Error("Google sign-in didn't load")); } }, 100); });
    // prompt "": no screen for an account that already said yes (it may still need a tap: see Sync's button)
    async function auth(prompt = "") {
      await gsi();
      return new Promise((ok, no) => {
        client = client || google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPE, callback: () => {} });
        client.callback = r => {
          if (r.error) return no(new Error(r.error));
          tok = { t: r.access_token, exp: Date.now() + (r.expires_in - 120) * 1000 };
          try { localStorage.setItem(TOK, JSON.stringify(tok)); localStorage.setItem("notes-google", "1"); } catch {}
          ok();
        };
        client.error_callback = e => no(Object.assign(new Error(e.type || "sign-in closed"), { needTap: true }));
        client.requestAccessToken({ prompt });
      });
    }
    async function call(url, opt = {}, retry = true) {
      if (!tok || tok.exp < Date.now()) await auth("");
      const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: "Bearer " + tok.t } });
      if (r.status === 401 && retry) { tok = null; return call(url, opt, false); }
      if (!r.ok) {
        let why = ""; try { const j = await r.json(); why = (j.error && ((j.error.errors && j.error.errors[0] && j.error.errors[0].reason) || j.error.status || j.error.message)) || ""; } catch {}
        if (/accessNotConfigured|SERVICE_DISABLED/i.test(why)) throw new Error("the Google Drive API isn't turned on in your Google Cloud project");
        if (/insufficient|SCOPE/i.test(why)) { tok = null; try { localStorage.removeItem(TOK); } catch {} throw Object.assign(new Error("Drive access wasn't allowed: tick the Drive box when signing in"), { needTap: true }); }
        throw new Error("Drive " + r.status + (why ? " " + why : ""));
      }
      return r;
    }
    // the folder: found (the site only ever sees the one it made) or made
    async function dir() {
      if (folder) return folder;
      const q = encodeURIComponent("name='Notes' and mimeType='application/vnd.google-apps.folder' and trashed=false");
      const r = await (await call(`${API}?q=${q}&fields=files(id)&pageSize=10`)).json();
      if (r.files && r.files.length) return (folder = r.files[0].id);
      const c = await (await call(`${API}?fields=id`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Notes", mimeType: "application/vnd.google-apps.folder" }) })).json();
      return (folder = c.id);
    }
    async function list() {
      const out = {}; let page = ""; const q = encodeURIComponent(`'${await dir()}' in parents and trashed=false`);
      do {
        const r = await (await call(`${API}?q=${q}&pageSize=1000&fields=nextPageToken,files(id,name)${page ? "&pageToken=" + page : ""}`)).json();
        for (const f of r.files) out[f.name] = f.id; page = r.nextPageToken || "";
      } while (page);
      return (files = out);
    }
    async function write(name, body, type) {
      if (!files) await list();
      if (!files[name]) {
        const r = await (await call(`${API}?fields=id`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, parents: [await dir()] }) })).json();
        files[name] = r.id;
      }
      await call(`${UP}/${files[name]}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": type }, body });
    }
    async function read(name, as = "text") {
      if (!files) await list();
      if (!files[name]) return null;
      const r = await call(`${API}/${files[name]}?alt=media`);
      return as === "bytes" ? new Uint8Array(await r.arrayBuffer()) : as === "blob" ? r.blob() : r.text();
    }
    async function del(name) { if (!files) await list(); if (files[name]) { await call(`${API}/${files[name]}`, { method: "DELETE" }); delete files[name]; } }
    return { auth, list, write, read, del, signedIn, has: n => !!(files && files[n]), names: () => Object.keys(files || {}), ready: () => !!tok && tok.exp > Date.now() };
  })();
  // lock.json: the salt, and a known word scrambled with the key (a wrong password can't unscramble it)
  const CHECK = "notes-ok";
  const lockFor = async k => { const was = K; K = k; try { return JSON.stringify({ salt: k.salt, check: await sealText(CHECK) }); } finally { K = was; } };
  const fits = async (k, lock) => { const was = K; K = k; try { return (await openText(lock.check)) === CHECK; } catch { return false; } finally { K = was; } };

  /* ---------- sync ---------- */
  const Sync = (() => {
    let timer = 0, busy = false, again = false, state = "", tap = false, relock = null;
    const setState = (s, needTap = false) => { state = s; tap = needTap; const b = document.querySelector(".sync.state"); if (b) { b.textContent = state; b.classList.toggle("tap", tap); } };
    const button = () => `<button type="button" class="sync state${tap ? " tap" : ""}" aria-live="polite">${state}</button>`;
    document.addEventListener("click", async ev => {
      if (!ev.target.closest(".sync.state") || !tap) return;
      if (relock) return askPassword(relock);
      try { await Drive.auth("consent"); soon(0); } catch { setState("Sign in to sync", true); }
    });
    async function run() {
      if (!ready) return;
      if (!navigator.onLine) return setState("Offline, will sync");
      if (busy) { again = true; return; }
      busy = true; setState("Syncing…");
      try {
        await Drive.list();
        // the lock: this browser's password is the one (the first to sync puts it there)
        const lock = JSON.parse(await Drive.read("lock.json") || "null");
        if (!lock) await Drive.write("lock.json", await lockFor(K), "application/json");
        else if (lock.salt !== K.salt && !(await fits(K, lock))) throw Object.assign(new Error("differs"), { differs: true, lock });
        // unscrambled files left from the weeks without a password: taken in, then removed
        const plain = Drive.names().filter(n => n === "notes.json" || n === "Notes.txt" || n === "Notes.md" || /^photo-/.test(n));
        let changed = false;
        if (Drive.has("notes.json")) { try { changed = mergeIn(JSON.parse(await Drive.read("notes.json"))) || changed; } catch {} }
        for (const n of plain) { const m = /^photo-(.+)\.jpg$/.exec(n); if (m && !(await Photos.raw(m[1]))) { const bl = await Drive.read(n, "blob"); if (bl) await Photos.put(m[1], bl); } }
        // the notes: each entry, the newer copy wins
        const enc = await Drive.read("notes.enc");
        const remote = enc ? JSON.parse(await openText(enc)) : {};
        changed = mergeIn(remote) || changed;
        if (changed) { await persist(); refresh(); }
        if (plain.length || Object.entries(db).some(([k, e]) => !remote[k] || e.u > remote[k].u)) await Drive.write("notes.enc", await sealText(JSON.stringify(db)), "text/plain");
        // photos: deletions, then this browser's that Drive hasn't got (scrambled as kept here)
        for (const id of gone()) { await Drive.del("p-" + id); setGone(gone().filter(x => x !== id)); }
        for (const e of Object.values(db)) for (const id of e.p || []) {
          if (Drive.has("p-" + id)) continue;
          let r = await Photos.raw(id); if (r && r.b) { await Photos.put(id, r.b); r = await Photos.raw(id); }
          if (r && r.d) await Drive.write("p-" + id, packPhoto(r), "application/octet-stream");
        }
        for (const n of plain) await Drive.del(n);
        setState("Synced");
      } catch (e) {
        console.warn("[sync]", e);
        if (e.differs) { relock = e.lock; setState("Enter your password to sync", true); }
        else if (e.needTap || /sign-in|popup/i.test(e.message)) setState(/tick the Drive box/.test(e.message) ? "Allow Drive access to sync" : "Sign in to sync", true);
        else setState(navigator.onLine ? "Sync paused: " + (e.message || e) : "Offline, will sync");
      }
      busy = false; if (again) { again = false; soon(0); }
    }
    // this browser holds an older key than the one in Drive (an earlier password): the current password, once,
    // and this browser's copy is re-scrambled with it
    function askPassword(lock) {
      const box = document.createElement("div"); box.className = "pop listp relock"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Password");
      box.innerHTML = `<form><p class="gmsg">Your notes in Drive use your current password. Enter it to sync this browser.</p>
        <label for="rpw" class="mirror">Password</label><input id="rpw" type="password" autocomplete="current-password">
        <button type="submit" class="gbtn">Sync</button><p class="gmsg err" role="alert"></p></form>`;
      document.body.append(box); const pw = box.querySelector("#rpw"); pw.focus();
      const close = () => box.remove();
      box.addEventListener("keydown", ev => { if (ev.key === "Escape") close(); });
      box.querySelector("form").onsubmit = async ev => {
        ev.preventDefault(); const b = box.querySelector(".gbtn"); b.disabled = true; b.textContent = "Checking…";
        const k = await derive(pw.value, lock.salt);
        if (!(await fits(k, lock))) { b.disabled = false; b.textContent = "Sync"; box.querySelector(".err").textContent = "Wrong password."; return; }
        await rekey(k); relock = null; close(); soon(0);
      };
    }
    async function rekey(k) {
      const ids = await tx("p", "readonly", s => s.getAllKeys()).catch(() => []);
      const plain = [];
      for (const id of ids) { const r = await tx("p", "readonly", s => s.get(id)); if (r && r.d) try { plain.push([id, new Blob([await unseal(r.d)], { type: r.t })]); } catch {} }
      K = k; await Keys.save(k).catch(() => {});
      for (const [id, bl] of plain) await Photos.put(id, bl);
      await persist();
    }
    // a photo as stored in Drive: its type (32 bytes), then the scrambled bytes
    const packPhoto = r => { const t = te.encode(r.t.padEnd(32, " ").slice(0, 32)); const out = new Uint8Array(32 + r.d.length); out.set(t); out.set(r.d, 32); return out; };
    const unpackPhoto = u8 => ({ t: td.decode(u8.slice(0, 32)).trim(), d: u8.slice(32) });
    // what came in from another device: redraw, unless it's the page being typed on
    function refresh() {
      if (current && current.k === "home") { if (document.activeElement !== current.ta) route(); return; } // never under the cursor
      if (current && document.activeElement === current.ta) {
        const e = get(current.k); if (e.t !== current.ta.value) { const c = current.ta.selectionStart; current.ta.value = e.t; current.ta.setSelectionRange(c, c); }
        return;
      }
      if (!document.querySelector(".gate")) route();
    }
    const gone = () => { try { return JSON.parse(localStorage.getItem("notes-gone") || "[]"); } catch { return []; } };
    const setGone = l => { try { localStorage.setItem("notes-gone", JSON.stringify(l)); } catch {} };
    const forget = id => { setGone([...gone(), id]); soon(0); };
    const soon = (ms = 2500) => { clearTimeout(timer); timer = setTimeout(run, ms); };
    async function photo(id) {
      if (!ready || !navigator.onLine) return null;
      try { const u8 = await Drive.read("p-" + id, "bytes"); if (!u8) return null; await Photos.putRaw(id, unpackPhoto(u8)); return Photos.get(id); }
      catch { return null; }
    }
    addEventListener("online", () => soon(0));
    addEventListener("offline", () => ready && setState("Offline, will sync"));
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") soon(500); else if (timer) { clearTimeout(timer); run(); } });
    setInterval(() => { if (document.visibilityState === "visible" && !tap) soon(0); }, 60000);
    return { button, soon, photo, forget, run };
  })();

  /* ---------- a browser without the key: sign in to Google, then the password (or create it, the very first time) ---------- */
  async function gate() {
    document.title = "Notes";
    let mode = "signin", lock = null;
    const H1 = { signin: "Notes", create: "Create a password", enter: "Password", wait: "Notes" };
    const draw = (msg = "") => {
      app.innerHTML = `<section class="gate"><form autocomplete="on">
        <h1>${H1[mode]}</h1>
        ${mode === "wait" ? `<p class="gmsg">Connecting…</p>` : mode === "signin" ? `<p class="gmsg">${navigator.onLine ? "Sign in with the Google account your notes are kept in." : "Connect to the internet to open your notes on this browser."}</p><button type="button" class="gbtn google">Sign in with Google</button>` : `
        <input type="text" name="username" autocomplete="username" value="notes" hidden>
        <label for="pw" class="mirror">Password</label>
        <input id="pw" type="password" autocomplete="${mode === "create" ? "new-password" : "current-password"}">
        ${mode === "create" ? `<label for="pw2" class="gsub">Again</label><input id="pw2" type="password" autocomplete="new-password">
        <p class="gnote">Your notes are scrambled with it. There's no way to get them back without it: a long one, like a few random words, is best.</p>` : ""}
        <button type="submit" class="gbtn">${mode === "create" ? "Create" : "Open"}</button>`}
        <p class="gmsg err" role="alert">${msg}</p></form></section>`;
      const pw = $("#pw"); if (pw) pw.focus();
      const g = app.querySelector(".google"); if (g) g.onclick = () => signin("consent");
      app.querySelector("form").onsubmit = ev => { ev.preventDefault(); if (mode === "create") create(); else if (mode === "enter") enter(); };
    };
    const busy = t => { const b = app.querySelector(".gbtn"); if (b) { b.disabled = !!t; if (t) b.textContent = t; } };
    async function signin(prompt) {
      busy("Signing in…");
      try { if (prompt) await Drive.auth(prompt); await Drive.list(); lock = JSON.parse(await Drive.read("lock.json") || "null"); }
      catch (e) { console.warn(e); mode = "signin"; return draw(prompt ? "Couldn't sign in: " + (e.message || e) : ""); }
      mode = lock ? "enter" : "create"; draw();
    }
    async function create() {
      const a = $("#pw").value, b = $("#pw2").value;
      if (a.length < 8) return draw("At least 8 characters.");
      if (a !== b) return draw("Those two don't match.");
      busy("Creating…");
      const k = await derive(a, b64(crypto.getRandomValues(new Uint8Array(16))));
      try { await Drive.write("lock.json", await lockFor(k), "application/json"); } catch (e) { return draw("Couldn't save to Drive: " + (e.message || e)); }
      await unlocked(k);
    }
    async function enter() {
      busy("Opening…");
      const k = await derive($("#pw").value, lock.salt);
      if (!(await fits(k, lock))) return draw("Wrong password.");
      await unlocked(k);
    }
    // signed in already (a browser from the weeks without a password): straight to the password
    if (Drive.ready() && navigator.onLine) { mode = "wait"; draw(); await signin(""); } else draw();
  }
  async function unlocked(k) {
    K = k; await Keys.save(k).catch(() => {});
    await loadDb(); await persist();
    ready = true; start(); Sync.soon(0);
  }

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
  let started = false;
  function start() { if (started) return route(); started = true; route(); }
  app.innerHTML = `<section class="gate"><form><h1>Notes</h1><p class="gmsg">Opening…</p></form></section>`;
  (async () => {
    const saved = await Keys.load();
    if (saved && saved.key) { K = saved; await loadDb(); ready = true; start(); Sync.soon(300); }
    else gate();
  })();
})();
