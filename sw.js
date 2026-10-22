/* The site offline (the user: "optimize for offline use / periodic connection: I take the subway"). A service worker
   keeps what the site has opened, so it goes on working without a connection:
   - the page itself: from the network when it answers within a few seconds (so updates arrive), else the copy kept;
   - a file named with a version (app.js?v=153, art?v=2): kept as is, it never changes under that name;
   - anything else of the site's own (books, maps, art): the network's, as before, kept as it comes; the copy kept when
     the network fails, or (when there is one) when it hasn't answered in a few seconds: a dead platform connection.
   Only the site's own files: OGS, the progress sheet, Spotify and the rest go to the network untouched (and so do a
   test's mocks of them). offline.js registers it, and Offline.prefetch fills it ahead of a trip. */
const SHELL = "tczw-shell-1", RUN = "tczw-run-1";

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL), html = await (await fetch("index.html", { cache: "no-store" })).text();
    const files = [...html.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css)(?:\?[^"]*)?)"/g)].map(m => m[1]);
    await c.put("index.html", new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
    await Promise.all([...files, "data/index.json", "data/stream.json"].map(f => c.add(f).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("tczw-shell-") && k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});

const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("slow")), ms))]);
const keep = async (req, res) => { if (res && res.ok && res.type === "basic") (await caches.open(RUN)).put(req, res.clone()).catch(() => {}); return res; };

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || req.headers.has("range")) return;
  const page = req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname);
  if (page) {
    e.respondWith((async () => {
      try {
        const res = await timeout(fetch(req, { cache: "no-store" }), 4000);
        if (res.ok) (await caches.open(SHELL)).put("index.html", res.clone());
        return res;
      } catch { return (await caches.match("index.html")) || Response.error(); }
    })());
    return;
  }
  if (/[?&]v=/.test(url.search)) {   // versioned: never changes under its name
    e.respondWith((async () => (await caches.match(req)) || keep(req, await fetch(req)))());
    return;
  }
  e.respondWith((async () => {   // the network's (fixes show at once), the copy kept when it fails or stalls
    const hit = await caches.match(req), net = fetch(req).then(r => keep(req, r));
    if (!hit) return net;
    try { return await timeout(net, 3500); } catch { return hit; }
  })());
});
