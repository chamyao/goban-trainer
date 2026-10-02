// Probes whether OGS accepts browser requests from our origins (CORS and the
// realtime WebSocket's Origin check). Runs in CI because OGS isn't reachable
// from every dev environment. No account or login involved.
import WebSocket from "ws";

const SERVERS = ["https://beta.online-go.com", "https://online-go.com"];
const ORIGINS = ["https://chamyao.github.io", "https://localhost"]; // site, Android app

const pick = (h, ...names) => names.map(n => `${n}=${h.get(n) ?? "-"}`).join(" ");
const corsHeaders = h => pick(h, "access-control-allow-origin", "access-control-allow-credentials",
                              "access-control-allow-headers", "access-control-allow-methods");

async function http(label, url, init) {
  try {
    const r = await fetch(url, { redirect: "manual", ...init });
    console.log(`  ${label}: HTTP ${r.status} ${corsHeaders(r.headers)}`);
  } catch (e) {
    console.log(`  ${label}: ERROR ${e.message}`);
  }
}

function socket(base, origin) {
  return new Promise(resolve => {
    const ws = new WebSocket(base.replace("https://", "wss://") + "/", { headers: { Origin: origin } });
    const done = msg => { clearTimeout(t); try { ws.terminate(); } catch {} resolve(msg); };
    const t = setTimeout(() => done("TIMEOUT (opened but no pong in 8s)"), 8000);
    ws.on("open", () => ws.send(JSON.stringify(["net/ping", { client: Date.now(), drift: 0, latency: 0 }])));
    ws.on("message", d => { const m = String(d); if (m.includes("net/pong")) done(`OK pong: ${m.slice(0, 120)}`); });
    ws.on("unexpected-response", (_, res) => done(`REJECTED HTTP ${res.statusCode}`));
    ws.on("error", e => done(`ERROR ${e.message}`));
  });
}

for (const base of SERVERS) {
  for (const origin of ORIGINS) {
    console.log(`\n=== ${base}  Origin: ${origin}`);
    const O = { Origin: origin };
    await http("GET  /api/v1/ui/config (anon)", `${base}/api/v1/ui/config`, { headers: O });
    await http("OPTIONS /api/v1/ui/config (Bearer preflight)", `${base}/api/v1/ui/config`, { method: "OPTIONS",
      headers: { ...O, "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": "authorization" } });
    await http("GET  /api/v1/ui/config (bogus Bearer)", `${base}/api/v1/ui/config`, { headers: { ...O, Authorization: "Bearer invalid" } });
    await http("POST /oauth2/token/ (bogus code, form)", `${base}/oauth2/token/`, { method: "POST",
      headers: { ...O, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=authorization_code&code=bogus&client_id=bogus&redirect_uri=https%3A%2F%2Fchamyao.github.io%2Fgoban-trainer%2F&code_verifier=x" });
    await http("GET  /oauth2/authorize/ (bogus client)", `${base}/oauth2/authorize/?response_type=code&client_id=bogus`, { headers: O });
    await http("OPTIONS /api/v0/login (password login preflight)", `${base}/api/v0/login`, { method: "OPTIONS",
      headers: { ...O, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,x-csrftoken" } });
    await http("GET  /termination-api/automatch-stats", `${base}/termination-api/automatch-stats`, { headers: O });
    console.log(`  WebSocket: ${await socket(base, origin)}`);
  }
}

// Which server knows our OAuth client? A bogus code gets "invalid_grant"
// from a server that has the client registered, "invalid_client" otherwise.
const CLIENT_ID = process.env.OGS_CLIENT_ID;
if (CLIENT_ID) {
  console.log(`\n=== OAuth client ${CLIENT_ID.slice(0, 6)}… registration`);
  for (const base of SERVERS) {
    for (const redirect of ["https://chamyao.github.io/goban-trainer/", "https://chamyao.github.io/goban-trainer/oauth-app.html"]) {
      const r = await fetch(`${base}/oauth2/token/`, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: "https://chamyao.github.io" },
        body: new URLSearchParams({ grant_type: "authorization_code", code: "bogus", client_id: CLIENT_ID, redirect_uri: redirect, code_verifier: "x".repeat(43) }),
      });
      console.log(`  ${base} redirect=${redirect.split("/").pop() || "/"}: HTTP ${r.status} ${(await r.text()).slice(0, 160)}`);
    }
    // The authorize page validates client_id + redirect_uri before asking to log in.
    const q = new URLSearchParams({ response_type: "code", client_id: CLIENT_ID, redirect_uri: "https://chamyao.github.io/goban-trainer/",
                                    code_challenge: "x".repeat(43), code_challenge_method: "S256", scope: "read write", state: "s" });
    const a = await fetch(`${base}/oauth2/authorize/?${q}`, { redirect: "manual" });
    console.log(`  ${base} authorize: HTTP ${a.status} location=${(a.headers.get("location") || "-").slice(0, 120)}`);
  }
}

