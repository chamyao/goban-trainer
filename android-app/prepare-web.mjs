// Copies the static web app from the repo root into www/ for Capacitor,
// and adds a small Android-only script (hardware back button).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const www = join(here, "www");

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const f of ["app.js", "style.css", "engine/engine-utils.js", "engine/katago-worker.js",
                 "engine/katago-small.bin.gz", "tfjs", "data"])
  cpSync(join(repo, f), join(www, f), { recursive: true });

cpSync(join(here, "native.js"), join(www, "native.js"));
const html = readFileSync(join(repo, "index.html"), "utf8");
if (!html.includes("</body>")) throw new Error("index.html has no </body>");
writeFileSync(join(www, "index.html"), html.replace("</body>", '<script src="native.js"></script>\n</body>'));
console.log("www/ ready");
