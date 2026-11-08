/**
 * tools/qa_embed_referer.mjs — prove that a YouTube embed actually sends a Referer.
 *
 * YouTube blocks embedded playback outright when the request arrives without an
 * HTTP Referer, and it reports that to the viewer as
 * "Error 153 · video player configuration error". So the property worth testing
 * is not "does the video play" — that needs a reachable YouTube and is not
 * something a headless run can assert — but "does the request carry a Referer",
 * which is exactly what the iframe's `referrerpolicy` attribute controls.
 *
 * It checks both directions, because the second one is what confuses people:
 *
 *   over http(s)  the embed must send a Referer  → the player can start
 *   over file://  it must send none              → YouTube always answers 153,
 *                                                  no matter what the markup says
 *
 * Usage:  node tools/qa_embed_referer.mjs          (starts its own static server)
 *         SITE_URL=https://user.github.io/repo/ node tools/qa_embed_referer.mjs
 * Exit:   0 when both halves behave, non-zero otherwise.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PAGE = join(ROOT, "index.html");
const SITE = (process.env.SITE_URL || "").replace(/\/+$/, "");
const PORT = 9454;
const HTTP_PORT = Number(process.env.HTTP_PORT || 8791);

if (!existsSync(PAGE)) {
  console.error("index.html not found — run `python build.py` first.");
  process.exit(1);
}

const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean).find((p) => existsSync(p));
if (!CHROME) { console.error("No Chrome found. Set CHROME=..."); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".jpg": "image/jpeg", ".png": "image/png", ".gif": "image/gif",
  ".mp4": "video/mp4", ".svg": "image/svg+xml",
};

/* ------------------------------------------------------------------ server */
// Only needed for the http half; a file:// document cannot send a Referer at all.
let server;
if (!SITE) {
  server = createServer(async (req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p === "/") p = "/index.html";
    const file = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ""));
    try {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404); res.end("not found");
    }
  });
  await new Promise((ok) => server.listen(HTTP_PORT, "127.0.0.1", ok));
}

/* --------------------------------------------------------------------- cdp */
const profile = mkdtempSync(join(tmpdir(), "referer-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--remote-debugging-port=" + PORT, "--user-data-dir=" + profile,
  "--window-size=1680,1000", "about:blank",
], { stdio: "ignore" });

let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = (list.find((t) => t.type === "page") || {}).webSocketDebuggerUrl || null;
  } catch {}
  if (!wsUrl) await sleep(250);
}
if (!wsUrl) { console.error("no devtools target"); process.exit(1); }

const ws = new WebSocket(wsUrl);
await new Promise((ok, no) => {
  ws.addEventListener("open", ok, { once: true });
  ws.addEventListener("error", no, { once: true });
});

let msgId = 0;
const pending = new Map();
let seen = [];          // Network.requestWillBeSent payloads for the current pass

ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) rej(new Error(m.error.message)); else res(m.result);
    return;
  }
  if (m.method === "Network.requestWillBeSent") seen.push(m.params.request);
});

const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++msgId;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});

async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || "evaluate failed");
  return r.result.value;
}

/* -------------------------------------------------------------------- probe */
async function probe(url, label) {
  seen = [];
  await send("Network.enable");
  await send("Page.enable");
  await send("Page.navigate", { url });
  await sleep(2600);

  const clicked = await evaluate(`(function () {
    var f = document.querySelector('.media.is-yt .yt[data-yt]');
    if (!f) return false;
    f.click();
    return true;
  })()`);
  await sleep(2600);

  const embeds = seen.filter((r) => /youtube(-nocookie)?\.com\/embed|youtube\.com\/embed/.test(r.url));
  const thumbs = seen.filter((r) => /ytimg\.com/.test(r.url));
  const iframeSrc = await evaluate(
    `(function(){var f=document.querySelector('.media.is-yt iframe');return f?f.getAttribute('src'):null;})()`);

  console.log(`\n--- ${label} ---`);
  console.log(`  url          : ${url}`);
  console.log(`  facade click : ${clicked ? "clicked" : "NO FACADE FOUND"}`);
  console.log(`  iframe src   : ${iframeSrc || "(none injected)"}`);
  console.log(`  embed reqs   : ${embeds.length}   thumbnail reqs: ${thumbs.length}`);

  for (const r of embeds) {
    const h = r.headers || {};
    const ref = h.Referer || h.referer || "(none)";
    const org = h.Origin || h.origin || "(none)";
    console.log(`    Referer: ${ref}`);
    console.log(`    Origin : ${org}`);
  }
  return { embeds, referers: embeds.map((r) => (r.headers || {}).Referer || (r.headers || {}).referer || "") };
}

/* --------------------------------------------------------------------- run */
const viaHttp = await probe(SITE ? SITE + "/" : `http://127.0.0.1:${HTTP_PORT}/index.html`,
  SITE ? "deployed site" : "served over http");
const viaFile = SITE ? null : await probe(pathToFileURL(PAGE).href, "opened from file://");

let bad = 0;
const check = (ok, label, detail) => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
  if (!ok) bad++;
};

console.log("\n--- assertions ---");
check(viaHttp.embeds.length > 0, "http: the click injects a YouTube embed request",
  `(${viaHttp.embeds.length} request(s))`);
check(viaHttp.referers.some((r) => r && r.length), "http: the embed request carries a Referer",
  viaHttp.referers.some((r) => r) ? "-> YouTube can start the player" : "-> this is what error 153 means");

if (viaFile) {
  const fileRefs = viaFile.referers.filter(Boolean);
  check(viaFile.embeds.length === 0 || fileRefs.length === 0,
    "file://: the embed sends no Referer",
    fileRefs.length ? `unexpected: ${fileRefs[0]}` : "-> why a local file always shows 153");
}

console.log(bad ? `\n${bad} check(s) FAILED` : "\nall checks passed");
try { chrome.kill(); } catch {}
if (server) server.close();
process.exit(bad ? 1 : 0);
