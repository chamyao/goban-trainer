// Android-only glue, loaded after app.js in the Capacitor build.
(() => {
  const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (!App) return;
  // Back steps through the app's hash routes; on the first screen it closes the app.
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) history.back();
    else App.exitApp();
  });
})();
