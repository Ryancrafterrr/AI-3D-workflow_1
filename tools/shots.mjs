/**
 * tools/shots.mjs — render screenshots of the built page for visual review.
 *
 * Headless --screenshot cannot scroll, and this site is one very long page, so
 * this drives Chrome over the DevTools protocol instead: scroll to an anchor,
 * wait for images to settle, then capture the viewport.
 *
 * Usage:  node tools/shots.mjs            (auto-detects Chrome)
 *         CHROME=/path/to/chrome node tools/shots.mjs
 * Output: tools/_shots/*.png
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PAGE = join(ROOT, "index.html");
const OUT = join(HERE, "_shots");
const PORT = 9453;
const VIEW = "1680,1000";

const CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const chromePath = CANDIDATES.find((p) => existsSync(p));
if (!chromePath) { console.error("No Chrome/Edge found. Set CHROME=..."); process.exit(1); }
if (!existsSync(PAGE)) { console.error("index.html not found — run `python build.py` first."); process.exit(1); }

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), "shots-"));
spawn(chromePath, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--remote-debugging-port=" + PORT, "--user-data-dir=" + profile,
  "--window-size=" + VIEW, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no devtools target");
}

let id = 0;
const pending = new Map();
let ws;
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}
async function evaluate(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || ""));
  return r.result.value;
}
async function shot(name) {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name + ".png"), Buffer.from(r.data, "base64"));
  console.log("  wrote", name + ".png");
}

const run = async () => {
  ws = new WebSocket(await target());
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: pathToFileURL(PAGE).href });
  await sleep(3000);

  // report any asset that failed to load — the fastest way to catch a bad path
  const broken = await evaluate(`
    Array.from(document.images)
      .filter(function (i) { return i.complete && i.naturalWidth === 0; })
      .map(function (i) { return i.getAttribute('src'); })`);
  console.log("broken images:", broken.length ? broken : "none");

  const errs = await evaluate(
    "window.__e=[];window.addEventListener('error',function(e){window.__e.push(String(e.message));});0");
  void errs;

  await shot("01-hero");

  // `node tools/shots.mjs "<css selector>"` — zoom in on one element instead of
  // running the whole walkthrough. Handy for checking a single card or table.
  const only = process.argv[2];
  if (only) {
    // Document coordinates + captureBeyondViewport, because the interesting
    // targets (a whole media grid, a long table) are taller than the viewport.
    const box = await evaluate(`(function(){
      var el = document.querySelector(${JSON.stringify(only)});
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return {x: r.left + window.pageXOffset, y: r.top + window.pageYOffset,
              width: r.width, height: r.height};
    })()`);
    if (!box) { console.log("no element matched", only); process.exit(1); }
    const r = await send("Page.captureScreenshot", {
      format: "png", captureBeyondViewport: true,
      clip: { x: Math.round(box.x), y: Math.round(box.y),
              width: Math.round(Math.min(box.width, 1500)),
              height: Math.round(Math.min(box.height, 1500)), scale: 1.6 },
    });
    writeFileSync(join(OUT, "element.png"), Buffer.from(r.data, "base64"));
    console.log("wrote element.png for", only,
      "(" + Math.round(box.width) + "x" + Math.round(box.height) + " element)");
    process.exit(0);
  }

  // [name, css selector, extra pixels, optional fraction of the element height to skip]
  const spots = [
    ["02-step1-media", "#step-1 .media-grid", 0, 0],
    ["03-step2-media", "#step-2 .media-grid", 0, 0],
    ["04-step3-prompt", "#step-3 .prompt", 0, 0],
    ["05-step3-media", "#step-3 .media-grid", 0, 0],
    ["06-step4-media", "#step-4 .media-grid", 0, 0],
    ["07-poc-top", "#poc", 0, 0],
    ["08-poc-log", "#poc", 1250, 0],
    ["09-poc-decision", "#poc", 2600, 0],
    ["10-manifest", "#manifest", 60, 0],
    ["11-faq", "#faq", 0, 0],
  ];
  for (const [name, sel, extra, frac] of spots) {
    const ok = await evaluate(`(function(){
      var el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return 'missing';
      var top = el.getBoundingClientRect().top + window.pageYOffset - 80 + ${extra}
        + Math.round(el.offsetHeight * ${frac});
      window.scrollTo(0, Math.max(0, top));
      return 'ok';
    })()`);
    if (ok === "missing") { console.log("  skip", name, "(no " + sel + ")"); continue; }
    await sleep(900);
    await shot(name);
  }

  const err = await evaluate("window.__e || []");
  console.log("runtime errors:", err.length ? err : "none");
  process.exit(0);
};

run().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
