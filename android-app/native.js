// Android-only glue, loaded after app.js in the Capacitor build.
(() => {
  const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (!App) return;
  // Back steps through the app's hash routes; on the first screen it closes the app.
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) history.back();
    else App.exitApp();
  });
  // OGS login: oauth-app.html on the site sends the code back through the
  // app's link scheme (a warm start fires appUrlOpen, a cold start has it as
  // the launch URL).
  const finishOgsLogin = url => {
    if (!url || !url.startsWith("io.github.chamyao.gobantrainer://oauth")) return;
    const params = new URLSearchParams(url.split("?")[1] || "");
    if (Music.isReturn(params)) {  // Spotify's login comes back the same way
      Music.finishLogin(params)
        .then(back => { if (location.hash === back) route(); else location.hash = back; })
        .catch(e => Music.say(e.message));
      return;
    }
    OGSPlay.finishLogin(params)
      .catch(e => { OGSPlay.loginError = e.message; })
      .finally(() => { if (location.hash === "#/play") route(); else location.hash = "#/play"; });
  };
  App.addListener("appUrlOpen", ({ url }) => finishOgsLogin(url));
  App.getLaunchUrl().then(r => finishOgsLogin(r && r.url)).catch(() => {});
  checkForUpdate(App);
})();

// On launch, ask GitHub whether a newer APK has been published. CI titles the
// android-latest release "Android app (build N)", where N is the APK's
// versionCode. Offline, or on any error, this gives up silently and the app
// keeps working from its bundled files.
async function checkForUpdate(App) {
  const RELEASE_API = "https://api.github.com/repos/chamyao/goban-trainer/releases/tags/android-latest";
  const APK_URL = "https://github.com/chamyao/goban-trainer/releases/download/android-latest/goban-trainer.apk";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const [info, res] = await Promise.all([
      App.getInfo(),
      fetch(RELEASE_API, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } }),
    ]);
    clearTimeout(timer);
    if (!res.ok) return;
    const m = /build (\d+)/.exec((await res.json()).name || "");
    const latest = m ? +m[1] : 0, installed = +info.build || 0;
    if (latest > installed) showUpdateBar(APK_URL, latest);
  } catch (e) {
    console.info("[update] check skipped:", e && e.message);
  }
}

function showUpdateBar(apkUrl, build) {
  const bar = document.createElement("div");
  bar.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:200;display:flex;" +
    "align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:#2f6f4f;color:#fff;" +
    "font:14px/1.4 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25)";
  const link = document.createElement("a");
  link.href = apkUrl;  // external URL: Capacitor hands it to Chrome, which downloads the APK
  link.textContent = `Update available (build ${build}) — tap to download`;
  link.style.cssText = "flex:1;color:#fff;font-weight:600;text-decoration:none";
  const close = document.createElement("button");
  close.textContent = "✕";
  close.setAttribute("aria-label", "Dismiss");
  close.style.cssText = "background:none;border:none;color:#fff;font-size:18px;padding:0 4px;cursor:pointer";
  close.onclick = () => bar.remove();
  bar.append(link, close);
  document.body.append(bar);
}
