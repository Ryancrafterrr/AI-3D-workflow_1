/**
 * tools/shots.mjs — render screenshots of the built page for visual review.
 *
 * Headless --screenshot cannot scroll, and this site is one very long page, so
 * this drives Chrome over the DevTools protocol instead: scroll to an anchor,
 * wait for images to settle, then capture the viewport.
 *
 * Usage:  node tools/shots.mjs                       (auto-detects Chrome)
 *         node tools/shots.mjs "#step-3 .media-grid"  (zoom one element)
 *         PAGE_FILE=_variant.html node tools/shots.mjs
 *         SITE_URL=https://user.github.io/repo/ node tools/shots.mjs
 *                                                     (verify the deployed site,
 *                                                      not the local build)
 * Output: tools/_shots/*.png
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
// PAGE_FILE lets you point the same walkthrough at a variant build (e.g. a copy
// with one media path rewritten) without disturbing index.html.
const PAGE = join(ROOT, process.env.PAGE_FILE || "index.html");
// SITE_URL lets the same walkthrough verify the deployed site instead of the local build.
const SITE = (process.env.SITE_URL || "").replace(/\/+$/, "");
const OUT = join(HERE, process.env.OUT_DIR || "_shots");
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
if (!SITE && !existsSync(PAGE)) { console.error("index.html not found — run `python build.py` first."); process.exit(1); }

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), "shots-"));
spawn(chromePath, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  ...(process.env.PLAY_TEST === "1" ? ["--autoplay-policy=no-user-gesture-required"] : []),
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
  const pageUrl = SITE ? SITE + "/" : pathToFileURL(PAGE).href;
  console.log("target:", pageUrl);
  await send("Page.navigate", { url: pageUrl });
  await sleep(SITE ? 5000 : 3000);

  // report any asset that failed to load — the fastest way to catch a bad path
  const broken = await evaluate(`
    Array.from(document.images)
      .filter(function (i) { return i.complete && i.naturalWidth === 0; })
      .map(function (i) { return i.getAttribute('src'); })`);
  console.log("broken images:", broken.length ? broken : "none");

  // Video and YouTube cards must be real players: a <div> shell (never a
  // <button>, which would swallow clicks aimed at the transport controls), with
  // data-open moved onto a separate button. Stills and GIFs keep the <button>
  // shell, because for those the whole card should stay clickable.
  const shells = await evaluate(`
    (function () {
      var players = 0, pBad = 0, rest = 0, restBad = 0;
      document.querySelectorAll('.media').forEach(function (c) {
        var t = c.getAttribute('data-type');
        var isP = (t === 'video' || t === 'youtube');
        if (isP) { players++; if (c.tagName !== 'DIV' || c.hasAttribute('data-open')) pBad++; }
        else { rest++; if (c.tagName !== 'BUTTON' || !c.hasAttribute('data-open')) restBad++; }
      });
      return { players: players, playersWrongShell: pBad, others: rest, othersWrongShell: restBad };
    })()`);
  console.log("card shells:", JSON.stringify(shells));

  const vids = await evaluate(`
    Array.from(document.querySelectorAll('video')).map(function (v) {
      var s = v.currentSrc || (v.querySelector('source') || {}).src || '';
      return {
        file: s.split('/').pop() || '(none)',
        controls: v.hasAttribute('controls'),
        readyState: v.readyState,
        duration: isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : null,
        w: v.videoWidth, h: v.videoHeight,
        error: v.error ? v.error.code : null,
      };
    })`);
  console.log("videos:", vids.length);
  for (const v of vids) {
    console.log("  " + (v.controls ? "controls" : "NO-CONTROLS").padEnd(12) +
      "ready=" + v.readyState +
      "  dur=" + (v.duration === null ? "?" : v.duration + "s").padEnd(7) +
      "  " + (v.w ? v.w + "x" + v.h : "-").padEnd(10) +
      "  err=" + (v.error === null ? "-" : v.error) + "  " + v.file);
  }

  // YouTube cards are click-to-load facades: the id must parse, and there must be
  // NO iframe in the DOM yet — building every player up front is exactly what this
  // design exists to avoid. YT_TEST=1 additionally clicks one and inspects the
  // iframe that the click is supposed to inject.
  const yts = await evaluate(`
    Array.from(document.querySelectorAll('.media.is-yt')).map(function (c) {
      var f = c.querySelector('.yt');
      return {
        title: (c.getAttribute('data-title') || '').slice(0, 34),
        id: c.getAttribute('data-yt') || '',
        facade: !!f,
        pending: !!(f && f.classList.contains('is-off')),
        thumb: !!(f && f.querySelector('img.yt-thumb')),
        thumbBroken: !!(f && f.querySelector('img.yt-thumb[data-broken="1"]')),
        iframes: c.querySelectorAll('iframe').length,
      };
    })`);
  console.log("youtube cards:", yts.length);
  for (const y of yts) {
    console.log("  " + (y.pending ? "PENDING" : y.facade ? "facade" : "NO-FACADE").padEnd(10) +
      " id=" + (y.id || "-").padEnd(14) +
      " thumb=" + (y.thumb ? "yes" : "no ") +
      (y.thumbBroken ? " (fell back)" : "             ") +
      " iframes=" + y.iframes + "  " + y.title);
  }

  if (process.env.YT_TEST === "1") {
    const yt = await evaluate(`
      (function () {
        var f = document.querySelector('.media.is-yt .yt[data-yt]');
        if (!f) return { skipped: 'no facade carrying an id' };
        f.click();
        var ifr = f.querySelector('iframe');
        return { iframe: !!ifr, src: ifr ? ifr.getAttribute('src') : '', live: f.getAttribute('data-live') };
      })()`);
    console.log("youtube click-test:", JSON.stringify(yt));

    // The thumbnail has two fallbacks before it gives up: maxresdefault → hqdefault
    // → hidden, letting the gradient backdrop show through. Both steps are driven
    // by the error event, so they can be exercised without a broken file on disk.
    const fb = await evaluate(`
      (function () {
        var img = document.querySelector('.media.is-yt img.yt-thumb');
        if (!img) return { skipped: 'no thumbnail' };
        var tail = function (e) { return (e.getAttribute('src') || '').split('/').pop(); };
        var first = tail(img);
        img.dispatchEvent(new Event('error'));
        var afterOne = tail(img);
        img.dispatchEvent(new Event('error'));
        return { first: first, afterOneError: afterOne, afterTwoErrors: tail(img),
                 broken: img.getAttribute('data-broken'),
                 display: getComputedStyle(img).display };
      })()`);
    console.log("youtube thumb-fallback:", JSON.stringify(fb));

    const lb = await evaluate(`
      (function () {
        var btn = document.querySelector('.media.is-yt .cap .open-lg');
        if (!btn) return { skipped: 'no open-lg button on a youtube card' };
        btn.click();
        var lbx = document.getElementById('lightbox');
        var fr = document.querySelector('#lb-stage iframe');
        var out = { open: lbx.classList.contains('on'), iframe: !!fr,
                    src: fr ? fr.getAttribute('src') : '',
                    badge: (document.getElementById('lb-meta') || {}).textContent };
        lbx.classList.remove('on');
        return out;
      })()`);
    console.log("youtube lightbox:", JSON.stringify(lb));
  }

  const errs = await evaluate(
    "window.__e=[];window.addEventListener('error',function(e){window.__e.push(String(e.message));});0");
  void errs;

  // PLAY_TEST=1 actually decodes: calls play() on every video and reports whether
  // currentTime advanced. Chrome is launched with the autoplay policy relaxed for
  // this, because without a user gesture an unmuted play() is rejected by policy
  // — which would look like a broken file.
  if (process.env.PLAY_TEST === "1") {
    const played = await evaluate(`
      (async function () {
        var out = [];
        for (const v of document.querySelectorAll('video')) {
          var name = (v.currentSrc || '').split('/').pop();
          try { await v.play(); } catch (e) { out.push({ file: name, playRejected: e.name }); continue; }
          await new Promise(function (r) { setTimeout(r, 1500); });
          out.push({ file: name, advanced: Math.round(v.currentTime * 100) / 100, paused: v.paused });
          v.pause();
        }
        return out;
      })()`);
    for (const p of played) console.log("  play-test:", JSON.stringify(p));
  }

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
