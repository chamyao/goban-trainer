// Paste into the Goban Apps Script project (the one behind Sync.API_URL). In doPost, right after the
// feedback row is appended (kind === "feedback"), call:  fireFeedbackRoutine(data.message, data.context);
// Script Properties (Project Settings > Script properties):
//   ROUTINE_URL   = the API trigger URL of "Game feedback (fired by the feedback box)", ending in /fire
//   ROUTINE_TOKEN = the token from that trigger's "Generate token"
function fireFeedbackRoutine(message, context) {
  const p = PropertiesService.getScriptProperties();
  const url = p.getProperty("ROUTINE_URL"), token = p.getProperty("ROUTINE_TOKEN");
  if (!url || !token) return;
  try {
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + token,
        "anthropic-beta": "experimental-cc-routine-2026-04-01",
        "anthropic-version": "2023-06-01",
      },
      payload: JSON.stringify({ text: String(message || "") + "\n\n" + String(context || "") }),
      muteHttpExceptions: true,   // a failed fire never loses the feedback row
    });
  } catch (e) { console.error(e); }
}
