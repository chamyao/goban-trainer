// The Goban sheet's Apps Script (Extensions > Apps Script on the "Goban" sheet), deployed as the web app
// at Sync.API_URL. Progress, review games and feedback, as before; new feedback is also posted as a comment
// on the Feedback inbox PR (chamyao/goban-trainer#3), which wakes the Integration session at once.
// The campaign's chat with Claude goes the same way: "**Chat** from <name>" comments out, Claude's
// "**Reply** to <name>" comments read back (kind=chat).
// Script property (Project Settings > Script properties): GITHUB_TOKEN, a fine-grained token for
// goban-trainer with Pull requests and Issues: read and write. Without it feedback and chat are only logged.

// Run this from the editor to check the setup: it posts a test comment and logs GitHub's reply (201 = posted).
function testFire() {
  const r = postFeedbackComment_("TEST from the Apps Script editor", "#/tk · test", "");
  Logger.log(r ? r.getResponseCode() + " " + r.getContentText().slice(0, 300) : "GITHUB_TOKEN is not set");
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}
function progressSheet_() { return getSheet_("Progress", ["username", "data", "updated_at"]); }
function reviewSheet_() { return getSheet_("ReviewGames", ["username", "game_id", "data", "updated_at"]); }
function feedbackSheet_() { return getSheet_("Feedback", ["timestamp", "username", "message", "context"]); }

function findRow_(sheet, username) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) if (values[i][0] === username) return i + 1;
  return -1;
}
function findGameRow_(sheet, username, gameId) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) if (values[i][0] === username && values[i][1] === gameId) return i + 1;
  return -1;
}

function doGet(e) {
  const username = e.parameter.username;
  if (!username) return jsonOut_({ error: "username required" });

  if (e.parameter.kind === "chat") return jsonOut_({ username, data: { messages: chatThread_(username) } });

  if (e.parameter.kind === "review") {
    const sheet = reviewSheet_();
    const values = sheet.getDataRange().getValues();
    const games = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] !== username) continue;
      try { games.push(JSON.parse(values[i][2] || "{}")); } catch (err) {}
    }
    return jsonOut_({ username, data: { games } });
  }

  const sheet = progressSheet_();
  const row = findRow_(sheet, username);
  if (row === -1) return jsonOut_({ username, data: {} });
  let data = {};
  try { data = JSON.parse(sheet.getRange(row, 2).getValue() || "{}"); } catch (err) {}
  return jsonOut_({ username, data });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return jsonOut_({ error: "bad json" }); }
  const now = new Date().toISOString();

  // Append-only feedback log — no username required, nothing to look up.
  if (body.kind === "feedback") {
    const msg = body.data && body.data.message;
    if (!msg) return jsonOut_({ error: "message required" });
    const context = (body.data && body.data.context) || "";
    feedbackSheet_().appendRow([now, body.username || "", msg, context]);
    const posted = postFeedbackComment_(msg, context, body.username || "");   // after the row is saved: a failed post loses nothing
    return jsonOut_({ ok: true, posted: posted ? posted.getResponseCode() : "no token" });
  }

  // The chat with Claude: logged, then posted to the inbox PR as "**Chat** from <username>".
  if (body.kind === "chat") {
    const msg = body.data && body.data.message;
    if (!msg || !body.username) return jsonOut_({ error: "message and username required" });
    const context = (body.data && body.data.context) || "";
    getSheet_("Chat", ["timestamp", "username", "message", "context"]).appendRow([now, body.username, msg, context]);
    const posted = postComment_("**Chat** from " + body.username + "\n\n> " + String(msg).replace(/\n/g, "\n> ") +
      "\n\n`" + String(context).replace(/`/g, "'") + "`");
    CacheService.getScriptCache().remove("chat:" + body.username);
    return jsonOut_({ ok: true, posted: posted ? posted.getResponseCode() : "no token" });
  }

  if (!body.username) return jsonOut_({ error: "username required" });

  if (body.kind === "review") {
    if (!body.id) return jsonOut_({ error: "id required" });
    const sheet = reviewSheet_();
    const row = findGameRow_(sheet, body.username, body.id);
    if (body.delete) {
      if (row !== -1) sheet.deleteRow(row);
      return jsonOut_({ ok: true });
    }
    if (typeof body.data !== "object") return jsonOut_({ error: "data required" });
    const json = JSON.stringify(body.data);
    if (row === -1) sheet.appendRow([body.username, body.id, json, now]);
    else sheet.getRange(row, 3, 1, 2).setValues([[json, now]]);
    return jsonOut_({ ok: true });
  }

  if (typeof body.data !== "object") return jsonOut_({ error: "data required" });
  const sheet = progressSheet_();
  const row = findRow_(sheet, body.username);
  const json = JSON.stringify(body.data);
  if (row === -1) sheet.appendRow([body.username, json, now]);
  else sheet.getRange(row, 2, 1, 2).setValues([[json, now]]);
  return jsonOut_({ ok: true });
}

// Post a comment on the Feedback inbox PR (chamyao/goban-trainer#3), which the Integration session watches.
function postComment_(body) {
  const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!token) return null;
  try {
    return UrlFetchApp.fetch("https://api.github.com/repos/chamyao/goban-trainer/issues/3/comments", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" },
      payload: JSON.stringify({ body: body }),
      muteHttpExceptions: true,
    });
  } catch (err) { console.error(err); return null; }
}

function postFeedbackComment_(message, context, username) {
  return postComment_("**In-game feedback**" + (username ? " from " + username : "") + "\n\n> " +
    String(message).replace(/\n/g, "\n> ") + "\n\n`" + String(context).replace(/`/g, "'") + "`");
}

// One player's chat thread from the inbox PR: their "**Chat** from <name>" messages and Claude's
// "**Reply** to <name>" answers, oldest first (the last 100), cached for a few seconds.
function chatThread_(username) {
  const cache = CacheService.getScriptCache(), key = "chat:" + username, hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!token) return [];
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const r = UrlFetchApp.fetch("https://api.github.com/repos/chamyao/goban-trainer/issues/3/comments?per_page=100&page=" + page, {
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" }, muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) break;
    const list = JSON.parse(r.getContentText());
    for (const c of list) {
      const b = String(c.body || "").replace(/\r/g, ""), head = b.split("\n")[0].trim();
      if (head === "**Chat** from " + username)
        out.push({ who: "you", text: (b.split("\n\n")[1] || "").replace(/^> ?/gm, ""), at: c.created_at });
      else if (head === "**Reply** to " + username)
        out.push({ who: "claude", text: b.slice(b.indexOf("\n") + 1).replace(/\n+---\n+_Generated by[\s\S]*$/, "").trim(), at: c.created_at });
    }
    if (list.length < 100) break;
  }
  const last = out.slice(-100);
  cache.put(key, JSON.stringify(last), 5);
  return last;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
