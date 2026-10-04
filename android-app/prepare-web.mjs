// Copies the static web app from the repo root into www/ for Capacitor,
// and adds a small Android-only script (hardware back button).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const www = join(here, "www");

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const f of ["style.css", "wukong.js", "engine/engine-utils.js", "engine/katago-worker.js", "tfjs", "data", "assets"])
  cpSync(join(repo, f), join(www, f), { recursive: true });
// every other local script and stylesheet index.html loads (the campaign's tk-*.js, …), so a new
// file can't be left out of the app; app.js is written below
for (const [, f] of readFileSync(join(repo, "index.html"), "utf8").matchAll(/(?:src|href)="([^"#:?]+\.(?:js|css))(?:\?[^"]*)?"/g))
  if (f !== "app.js") cpSync(join(repo, f), join(www, f), { recursive: true });

// The Android build silently gunzips *.gz assets and drops the extension, so
// engine/katago-small.bin.gz would ship as katago-small.bin and the app's
// fetch of the .gz name would 404. Ship it unzipped under the .bin name and
// point app.js there (the worker accepts gzipped or raw models).
const MODEL = "engine/katago-small.bin";
writeFileSync(join(www, MODEL), gunzipSync(readFileSync(join(repo, MODEL + ".gz"))));
const app = readFileSync(join(repo, "app.js"), "utf8");
if (!app.includes(`"${MODEL}.gz"`)) throw new Error(`app.js no longer references ${MODEL}.gz`);
writeFileSync(join(www, "app.js"), app.replace(`"${MODEL}.gz"`, `"${MODEL}"`));

cpSync(join(here, "native.js"), join(www, "native.js"));
const html = readFileSync(join(repo, "index.html"), "utf8");
if (!html.includes("</body>")) throw new Error("index.html has no </body>");
writeFileSync(join(www, "index.html"), html.replace("</body>", '<script src="native.js"></script>\n</body>'));
console.log("www/ ready");
