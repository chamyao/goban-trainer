// End-to-end engine test: init the bundled KataGo worker in Chrome and analyze
// a real problem position (seedling-project #10310, white to move after B S19).
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan"],
});
const page = await browser.newPage();
page.on("console", m => console.log("[page]", m.text()));
await page.goto("http://localhost:8321/", { waitUntil: "domcontentloaded" });

const result = await page.evaluate(async () => {
  const black = ["oa","na","qb","nb","sc","nc","sd","rd","qd","pd","od","nd","ra"];
  const white = ["pa","sb","rb","ob","rc","qc","pc","oc"];
  const grid = Array.from({ length: 19 }, () => new Array(19).fill(0));
  const put = (list, v) => list.forEach(s => {
    grid[s.charCodeAt(1) - 97][s.charCodeAt(0) - 97] = v;
  });
  put(black, 1); put(white, 2);

  const board = grid.map(row => row.map(v => v === 1 ? "black" : v === 2 ? "white" : null));
  const frame = globalThis.GTEngineUtils.buildTsumegoFrame(board, {
    komi: 6.5, blackToPlay: true, koAllowed: true, margin: 4,
  });
  for (const p of frame.black) if (!board[p.y][p.x]) board[p.y][p.x] = "black";
  for (const p of frame.white) if (!board[p.y][p.x]) board[p.y][p.x] = "white";

  const worker = new Worker("engine/katago-worker.js");
  const modelUrl = new URL("engine/katago-small.bin.gz", location.href).href;
  const t0 = performance.now();

  const send = msg => worker.postMessage(msg);
  const initResult = await new Promise((res, rej) => {
    worker.onmessage = e => {
      if (e.data.type === "katago:init_result") res(e.data);
      if (e.data.type === "katago:notice") console.log("notice:", e.data.message);
    };
    worker.onerror = e => rej(new Error(e.message));
    send({ type: "katago:init", modelUrl, backend: "auto" });
  });
  const tInit = performance.now() - t0;
  if (!initResult.ok) return { error: initResult.error };

  const t1 = performance.now();
  const analysis = await new Promise((res, rej) => {
    worker.onmessage = e => {
      if (e.data.type === "katago:analyze_result")
        e.data.ok ? res(e.data.analysis) : rej(new Error(e.data.error));
    };
    send({
      type: "katago:analyze", id: 1, modelUrl, backend: "auto",
      board, currentPlayer: "white", moveHistory: [{ x: 17, y: 0, player: "black" }],
      komi: 6.5, rules: "japanese", regionOfInterest: frame.region,
      visits: 96, maxTimeMs: 30000, topK: 8, analysisPvLen: 4, ownershipMode: "root",
    });
  });
  const tAnalyze = performance.now() - t1;

  const cols = "ABCDEFGHJKLMNOPQRST";
  return {
    backend: initResult.backend, modelName: initResult.modelName,
    initMs: Math.round(tInit), analyzeMs: Math.round(tAnalyze),
    rootVisits: analysis.rootVisits,
    winRate: analysis.rootWinRate, scoreLead: analysis.rootScoreLead,
    top: (analysis.moves || []).slice(0, 3).map(m =>
      `${cols[m.x]}${19 - m.y} v=${m.visits} wr=${m.winRate.toFixed(2)}`),
    region: frame.region,
    frameStones: frame.black.length + frame.white.length,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
