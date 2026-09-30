/**
 * tools/qa_nav.mjs — real-input regression suite for navigation & scrolling.
 *
 * Why this exists: every bug fixed on 2026-09-23 was invisible to "does the page
 * render" checks and to headless screenshots. They only show up with genuine
 * mouse-wheel / click / keystroke input in a real browser:
 *
 *   1. TOC chip clicks stopped the page dead at the next section boundary
 *      (a second programmatic smooth scroll cancelled the first one).
 *   2. Wheeling over the pinned left rail froze the page completely
 *      (the rail was a scroll container with `overscroll-behavior: contain`).
 *   3. Typing in the top search box dragged the page upward on every keystroke
 *      (a focused <input> inside a `position: sticky` bar makes Chrome re-run
 *      "reveal the focused element" against the bar's static position).
 *
 * Usage:  node tools/qa_nav.mjs            (auto-detects Chrome)
 *         CHROME=/path/to/chrome node tools/qa_nav.mjs
 * Exit code 0 = all checks pass.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(HERE, "..", "index.html");
const PORT = 9451;
const VIEW = "1680,1000";          // desktop width: the pinned rail is active here

const CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chromePath = CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("No Chrome/Edge found. Set CHROME=/path/to/chrome and retry.");
  process.exit(1);
}
if (!existsSync(PAGE)) {
  console.error("index.html not found — run `python build.py` first.");
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "qa-nav-"));
const chrome = spawn(chromePath, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--remote-debugging-port=" + PORT, "--user-data-dir=" + profile,
  "--window-size=" + VIEW, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(300);
  }
  throw new Error("Chrome debug port never became reachable");
}

/* ---------------------------------------------------------------- CDP client */
let msgId = 0;
const pending = new Map();
function connect(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    };
    ws.onerror = () => rej(new Error("websocket error"));
    ws.onopen = () => res(ws);
  });
}
function send(ws, method, params = {}) {
  return new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(ws, expr) {
  const r = await send(ws, "Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
}

/* ------------------------------------------------------------------ input */
const wheelAt = async (ws, x, y, deltaY, times) => {
  await send(ws, "Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  for (let i = 0; i < times; i++) {
    await send(ws, "Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY, pointerType: "mouse" });
    await sleep(80);
  }
};
const clickAt = async (ws, x, y) => {
  await send(ws, "Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  await send(ws, "Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send(ws, "Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
};
const typeChar = async (ws, ch) => {
  await send(ws, "Input.dispatchKeyEvent", { type: "keyDown", text: ch, unmodifiedText: ch, key: ch });
  await send(ws, "Input.dispatchKeyEvent", { type: "char", text: ch, unmodifiedText: ch, key: ch });
  await send(ws, "Input.dispatchKeyEvent", { type: "keyUp", key: ch });
};

/* ------------------------------------------------------------------- suite */
const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

async function run(ws) {
  const Y = () => evaluate(ws, "Math.round(window.pageYOffset)");

  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");
  await send(ws, "Page.navigate", { url: pathToFileURL(PAGE).href });
  await sleep(2600);
  await evaluate(ws, "window.__err=[];window.addEventListener('error',function(e){window.__err.push(String(e.message));});");

  // 1. structure survived the change
  //
  // This is a content-integrity baseline, not a design constraint: it catches a
  // content file being dropped, truncated or silently swallowed by the build
  // (for example a stray `</script` in a string literal). When content is
  // replaced on purpose, refresh the numbers — and confirm them against the
  // source with `node tools/count_content.mjs` rather than copying whatever the
  // page happens to render, or the check stops meaning anything.
  //
  // v0.2 · 2026-09-30 — steps 01–04 rewritten with real content from the
  // Process Book and the Sprint 2 POC: 96 → 122 tasks, 27 → 41 media slots,
  // 55 → 43 prompt variants (fewer, but real ones).
  const BASE = { steps: 6, tasks: 122, media: 41, variants: 43, chips: 10 };
  const st = await evaluate(ws, `
    'steps=' + document.querySelectorAll('section.step').length +
    ' tasks=' + document.querySelectorAll('.task').length +
    ' media=' + document.querySelectorAll('.media').length +
    ' variants=' + document.querySelectorAll('.vbtn').length +
    ' chips=' + document.querySelectorAll('.toc-chip').length`);
  check(
    "structure intact",
    Object.keys(BASE).every(function (k) { return new RegExp(k + "=" + BASE[k] + "\\b").test(st); }),
    st + "  (baseline: " + JSON.stringify(BASE) + ")"
  );

  const topbarH = await evaluate(ws, "(function(){var t=document.querySelector('.topbar');return t?t.offsetHeight:0;})()");
  const OFF = topbarH + 20;

  // 2. every top TOC chip actually lands on its section
  for (const t of ["overview", "step-2", "step-4", "step-6", "appendix", "faq"]) {
    await evaluate(ws, "window.scrollTo(0,0)");
    await sleep(700);
    const box = await evaluate(ws, `
      (function(){var c=document.querySelector('.toc-chip[data-target="${t}"]');if(!c)return null;
       var r=c.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
    if (!box) { check(`jump ${t}`, false, "chip missing"); continue; }
    const want = await evaluate(ws, `
      (function(){var e=document.getElementById('${t}');return e?Math.round(e.getBoundingClientRect().top+window.pageYOffset-${OFF}):-1;})()`);
    await clickAt(ws, box.x, box.y);
    await sleep(1900);
    const got = await Y();
    check(`jump ${t}`, Math.abs(got - want) <= 45, `want ${want}, got ${got}`);
  }

  // 3. left rail link jumps too
  await evaluate(ws, "window.scrollTo(0,0)");
  await sleep(800);
  const railBox = await evaluate(ws, `
    (function(){var a=document.querySelector('.side-link[data-target="step-3"]');if(!a)return null;
     var r=a.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
  if (railBox) {
    const want = await evaluate(ws, `
      (function(){var e=document.getElementById('step-3');return Math.round(e.getBoundingClientRect().top+window.pageYOffset-${OFF});})()`);
    await clickAt(ws, railBox.x, railBox.y);
    await sleep(1900);
    check("jump via left rail", Math.abs((await Y()) - want) <= 45, `want ${want}, got ${await Y()}`);
  } else {
    check("jump via left rail", false, "rail link missing (viewport narrower than 1181px?)");
  }

  // 4. the wheel must move the page no matter which column it is over
  for (const [x, label] of [[250, "over pinned rail"], [900, "over content"]]) {
    await evaluate(ws, "window.scrollTo(0,0)");
    await sleep(900);
    await wheelAt(ws, x, 500, 400, 8);
    const y = await Y();
    check(`wheel ${label}`, y > 1200, "y=" + y);
  }

  // 5. typing in the search box must not move the page
  await evaluate(ws, "window.scrollTo(0, 4000)");
  await sleep(900);
  const inp = await evaluate(ws, `
    (function(){var i=document.getElementById('search-input');if(!i)return null;var r=i.getBoundingClientRect();
     return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
  if (inp) {
    await clickAt(ws, inp.x, inp.y);
    await sleep(500);
    const before = await Y();
    for (const ch of "step") { await typeChar(ws, ch); await sleep(400); }
    const after = await Y();
    check("search typing does not scroll the page", Math.abs(after - before) <= 2, `${before} -> ${after}`);
  } else {
    check("search typing does not scroll the page", false, "search input missing");
  }

  // 6. the whole top jump menu fits on one row at desktop width
  const rail = await evaluate(ws, `
    (function(){var r=document.getElementById('toc-rail');
     return {overflow:r.scrollWidth-r.clientWidth, chips:r.querySelectorAll('.toc-chip').length};})()`);
  check("top jump menu fits", rail.overflow <= 40, `overflow=${rail.overflow}px, chips=${rail.chips}`);

  // 7. no runtime errors
  const errs = await evaluate(ws, "JSON.stringify(window.__err||[])");
  check("no runtime JS errors", errs === "[]", errs);
}

/* --------------------------------------------------------------------- main */
let code = 1;
try {
  const wsUrl = await findTarget();
  const ws = await connect(wsUrl);
  await run(ws);
  let pass = 0;
  for (const r of results) {
    if (r.ok) pass++;
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(38)} ${r.detail}`);
  }
  console.log(`\n${pass}/${results.length} checks passed`);
  code = pass === results.length ? 0 : 2;
} catch (e) {
  console.error("QA harness error: " + e.message);
} finally {
  chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  process.exit(code);
}
