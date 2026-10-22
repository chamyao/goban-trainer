/* Offline, and a connection that comes and goes (the user: "optimize for offline use / periodic connection: I take
   the subway"). Loaded first, before the rest of the site.
   - The website: a service worker (sw.js) keeps what's been opened; Offline.prefetch keeps the problems, the Stream
     and KataGo ahead of a trip.
   - The Android app (window.APP_LOCAL, android-app/boot.html): it runs the live site's files, and the APK carries its
     own copy of them. With no network the page's links point at that copy (the <base>), and a file the network fails
     on mid-ride comes from it.
   - Both: what's written to the sheet while offline (progress, Turning points' rows, feedback) waits in an outbox
     (Sync.flush, app.js) and goes when the connection is back; the header's pill says it's waiting. */
const Offline = (() => {
  const LOCAL = window.APP_LOCAL;
  const listeners = new Set();
  const changed = () => { for (const f of listeners) try { f(); } catch {} };
  addEventListener("online", changed); addEventListener("offline", changed);

  if (!LOCAL) {
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      let off = false; try { off = !!localStorage.getItem("gt-no-sw"); } catch {}
      if (!off) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.info("[offline] no service worker:", e.message)));
    }
  } else {
    const base = document.querySelector("base"), LIVE = base && base.href;
    if (LIVE) {
      const local = u => LOCAL + u.slice(LIVE.length);
      const setBase = () => { base.href = navigator.onLine ? LIVE : LOCAL; };
      addEventListener("online", setBase); addEventListener("offline", setBase); setBase();
      // a file of the site's that the network fails on (or stalls on, a dead platform connection): the APK's copy
      const net = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = new URL(typeof input === "string" || input instanceof URL ? String(input) : input.url, document.baseURI).href;
        if (!url.startsWith(LIVE) || (init && init.method && init.method !== "GET")) return net(input, init);
        const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 8000);
        if (init && init.signal) init.signal.addEventListener("abort", () => ctrl.abort());
        return net(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t))
          .catch(e => { if (init && init.signal && init.signal.aborted) throw e; return net(local(url), init); });
      };
      // a picture or a sound that didn't load: the APK's copy
      addEventListener("error", e => {
        const el = e.target;
        if (!el || !/^(IMG|AUDIO|VIDEO)$/.test(el.tagName) || !el.src || !el.src.startsWith(LIVE) || el.dataset.local) return;
        el.dataset.local = "1"; el.src = local(el.src);
      }, true);
    }
  }

  // the outbox: writes to the sheet that couldn't go, sent when the connection is back (Sync.flush)
  const KEY = "gt-outbox";
  const box = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
  const put = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} changed(); };
  // key: a later write under the same key replaces the waiting one (a row's newer copy); none: each one goes
  const queue = (payload, key) => { const l = box().filter(x => !key || x.key !== key); l.push({ key: key || null, payload, at: Date.now() }); put(l); };
  const take = at => put(box().filter(x => x.at !== at));

  // ahead of a trip (the website; the app carries it all): every problem book, the Stream's pool and KataGo
  async function prefetch(onStep) {
    const books = await (await fetch("data/index.json")).json();
    const files = ["data/stream.json", "data/tk_vetted.json", "engine/katago-worker.js", "engine/engine-utils.js",
      typeof Engine !== "undefined" && Engine.modelUrl, ...books.map(b => `data/books/${b.id}.json`)].filter(Boolean);
    let done = 0, failed = 0;
    for (let i = 0; i < files.length; i += 6) {
      await Promise.all(files.slice(i, i + 6).map(f => fetch(f).then(r => { if (!r.ok) failed++; return r.arrayBuffer(); }).catch(() => failed++)));
      done = Math.min(files.length, i + 6); onStep && onStep(done, files.length);
    }
    try { localStorage.setItem("gt-offline-at", String(Date.now())); } catch {}
    return { files: files.length, failed };
  }

  return { app: !!LOCAL, online: () => navigator.onLine, on: f => listeners.add(f), changed, box, queue, take, prefetch,
           kept: () => { try { return +localStorage.getItem("gt-offline-at") || 0; } catch { return 0; } } };
})();
