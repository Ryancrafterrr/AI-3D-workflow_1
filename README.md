# AI-Assisted Environment Art Workflow · Pipeline Wiki

A **zero-dependency, zero-backend** single-page application (SPA) documentation site for hosting training videos, screen recordings, animated GIFs and written documentation — plus a library of AI prompts that members can copy in one click, in up to five variants per step.

**Live site:** <https://ryancrafterrr.github.io/AI-3D-workflow_1/> — served by GitHub Pages from the root of this repository (see §9).

- **Output:** `index.html` (single file, styles and logic inlined — host it or just open it)
- **Content:** `src/content/*.js` (**content is fully separated from code** — editing copy never touches CSS/JS)
- **Media:** `assets/` (video, GIFs, stills — drop them at the right path and they appear automatically)

---

## 1. Quick start

```bash
# See it: open index.html from inside this folder
# (media uses relative paths, so it must be opened in-place)
index.html

# Rebuild after editing content
python build.py

# Regenerate the placeholder media (GIFs / stills / video posters)
python tools/make_placeholders.py     # requires Pillow

# Re-cut the source figures out of the exported Canva pages
python tools/extract_canva_images.py --sheet    # then LOOK at tools/_crop_sheet.jpg

# After touching styles.css or app.js: verify navigation and scrolling still behave
node tools/qa_nav.mjs                 # drives a real browser, 13 checks, exits non-zero on failure

# Prove the YouTube embeds send a Referer (this is what error 153 is about)
node tools/qa_embed_referer.mjs       # boots its own server; also shows file:// sending none

# Render screenshots of the built page for visual review
node tools/shots.mjs                  # whole-page walkthrough → tools/_shots/
node tools/shots.mjs "#step-3 .media-grid"      # or zoom in on one element

# Verify media actually loads: every video's controls / readyState / duration,
# and with PLAY_TEST=1 it calls play() and checks that currentTime advances
PLAY_TEST=1 node tools/shots.mjs

# Read a recording's duration / resolution / codec / audio track (no ffmpeg needed)
python tools/probe_mp4.py assets/video/step3-decompose-workflow.mp4

# Confirm the structure counts the content files declare (updates the qa_nav baseline)
node tools/count_content.mjs
```

> For production, serve it from a static host (Nginx / object storage / Netlify / Vercel / GitHub Pages)
> so everything under `assets/` loads normally. Opening via `file://` also works — some browsers restrict
> the Clipboard API there, but this project ships a fallback, so A–E copying still works locally.

---

## 2. Directory layout

```
ai-scene-workflow-wiki/
├── index.html                  ← build output (the only file you must deploy)
├── build.py                    ← merges src/ into index.html
├── README.md
├── src/
│   ├── index.template.html     page skeleton (containers and mount points only)
│   ├── styles.css              design system (dark theme, all component styles)
│   ├── app.js                  rendering and interaction logic (the only file needing code)
│   └── content/
│       ├── 00-core.js          site meta + how to use + pipeline overview (container)
│       ├── step-1.js … step-6.js   the six steps, one file each
│       └── 99-appendix.js      toolchain / media manifest / FAQ / changelog
├── demo-standalone.html        optional single-file demo (sample media inlined as data URIs)
├── tools/
│   ├── make_placeholders.py    generates the placeholder GIFs and stills
│   ├── make_standalone.py      builds demo-standalone.html
│   ├── qa_nav.mjs              real-input regression suite for nav & scrolling (see §7)
│   ├── shots.mjs               renders page screenshots over CDP for visual review
│   ├── count_content.mjs       prints the structure counts declared by content/*.js
│   ├── qa_embed_referer.mjs    verifies the YouTube embeds carry a Referer (error 153)
│   ├── probe_mp4.py            reads duration / resolution / codec from an MP4 header
│   ├── fetch_canva.py          downloads the exported Canva source pages (see §8)
│   ├── extract_canva_images.py cuts the figures out of those pages into assets/images/
│   └── _canva_src/             the exported source pages (input to the cutter) + _crop_sheet.jpg
└── assets/
    ├── video/                  video (.mp4) + a same-named poster (.jpg)
    ├── gifs/                   animated GIFs (.gif)
    └── images/                 stills (.jpg)
```

---

## 3. Interaction checklist (all implemented)

| Requirement | How it works |
|---|---|
| Everything on one page, no outbound navigation | SPA: content renders into `#content`, navigation only scrolls within the page |
| Top table-of-contents jump menu | Horizontal chip rail in the top bar (`#toc-rail`), auto-populated with every step and the appendix |
| Fixed left menu, permanently floating | `.side-nav` is `position: fixed` at a constant screen position for the entire scroll, including over the hero; it highlights the current section live and expands that step's sub-steps |
| A–E prompt variants with one-click copy | Each prompt block has 3–5 variant tabs; **click one and that variant is copied** (Clipboard API with an `execCommand` fallback) |
| Video / YouTube / GIF / still hosting | Media gallery (16:9 slots, type badges). A video card plays in place with the browser's own controls; a YouTube card shows a facade and builds its player only when clicked; stills and GIFs open in a lightbox without leaving the page |
| Task tracking and progress | 122 checkable tasks, progress in local `localStorage`, live progress ring in the left rail |
| Works on narrow screens | At ≤1180px the left rail becomes a drawer opened by a floating button in the bottom-right |

Keyboard: `/` focuses search, `Esc` closes the lightbox or drawer.

---

## 4. Editing content

### 4.1 Copy and prompts

Open `src/content/step-N.js`. The structure is below — every field is optional and missing fields never error:

```js
W.steps.push({
  id: "step-7",                    // anchor id, must be unique
  n: "07",                         // displayed number
  title: "Step title",
  short: "Label",                  // one word, used by the top jump menu (falls back to title)
  en: "Short tagline · shown in mono",
  stage: "STAGE LABEL",            // appears in the eyebrow
  purpose: "Purpose of this step. Supports <strong>inline tags</strong>.",
  duration: "1–2 days",
  difficulty: "Low / medium / high",
  pipe: { out: "Deliverable shown on the card", tool: "Tool badge on the card" },   // drives the overview card
  inputs: ["Input 1"], outputs: ["Output 1"], tools: ["Tool 1"],
  intro: ["First paragraph", "Second paragraph"],
  substeps: [
    { id: "1.1", title: "Sub-step name", detail: "Explanation", tasks: ["Task one", "Task two"] }
  ],
  prompts: [
    {
      id: "s7p1", title: "Prompt name", icon: "sparkles", note: "How to use it",
      variants: [
        { key: "A", name: "Variant name", tag: "Baseline", use: "When to use it", out: "What it produces",
          note: "Extra note", text: `Multi-line prompt. {{this}} is a variable, [[this]] is a negative` }
      ]
    }
  ],
  media: [
    { type: "video", title: "Title", caption: "Description", src: "assets/video/xx.mp4",
      poster: "assets/video/xx.jpg", dur: "12:40", file: "assets/video/xx.mp4", wide: true },
    { type: "gif",  title: "Title", caption: "Description", src: "assets/gifs/xx.gif" },
    { type: "image",title: "Title", caption: "Description", src: "assets/images/xx.jpg" }
  ],
  tips: [{ title: "Heading", text: "Body" }],
  pitfalls: [{ title: "Heading", text: "Body" }],
  checkpoint: "Definition of Done text"
});
```

**Text rules:** `{{variables}}` render as cyan chips; `[[negatives]]` render in red; `--flags` render in amber.
Prose fields (`purpose` / `intro` / `detail` / `tips` / `checkpoint`) accept inline tags such as `<strong>` and `<code>`.

### 4.2 Adding a step

1. Copy `src/content/step-6.js` → `src/content/step-7.js`
2. Change `id` / `n` / `title` / `short` and the content
3. Run `python build.py`

**The top jump rail, the left rail, the pipeline cards and the progress ring all pick up the new step automatically** — the pipeline cards are derived from each step's `pipe` field, so there is no table of contents to maintain.

### 4.3 Replacing media (placeholder → real)

Drop the real file into the matching path under `assets/`, keeping the same filename. **No code changes needed:**

```
assets/video/step1-full-walkthrough.mp4   ← video (H.264 / MP4)
assets/video/step1-full-walkthrough.jpg   ← same-named poster (optional; playback works without it)
assets/gifs/step3-asset-breakdown.gif     ← animated GIF (recommend 800px wide, ≤8 s, ≤3 MB)
assets/images/step1-shot-selection.jpg    ← still (recommend 2560×1440)
```

The full list is on the page under **Appendix → Media manifest**, or just look in `assets/`.

**Missing media never errors:** a missing image or GIF shows a clean placeholder slot; a missing video shows its poster plus a "video file pending" hint strip, or a clean slot if the poster is missing too.

**Stills are letterboxed in the grid, not cropped.** `.media .frame > img.thumb` uses `object-fit: contain` so a whole diagram is visible at thumbnail size; the frame background is near-black, so the bars are invisible. Video keeps `object-fit: cover`. Do not "fix" this back to `cover` — documentation figures have mixed aspect ratios and cropping them reads as a bug.

To change a path or filename, edit `src` / `poster` on that entry in `src/content/*.js` — full URLs (CDN, object storage) work too.

#### Video cards are players, not pictures

Steps 01–03 ship with real walkthrough recordings, and a video card renders a **native player
inline**: the browser's own progress bar, play/pause, volume and fullscreen controls. Five rules
keep that working, and each one was a bug before it became a rule:

| Rule | Why |
|---|---|
| A video card's shell is a `<div>`, **not** a `<button>` | Interactive content cannot nest, and a wrapping `<button>` swallowed every click aimed at the transport controls. `data-open` therefore moves onto its own "Open larger" button in the caption row instead of the whole card. |
| The `<video>` carries `src`, **not** a `<source>` child | A failed `<source>` reports its `error` on the `<source>` element and leaves the `<video>` at `NETWORK_NO_SOURCE`, so the missing-file fallback never fired. With `src`, a 404 errors on the element itself. |
| Missing-file detection is **event-based, with no timeout** | It used to be "no metadata within 2.6 s ⇒ treat as missing", which deleted the player from any walkthrough that was merely slow to start. These files reach 20 MB and `preload="metadata"` still has to fetch the `moov` atom first. |
| The duration badge sits **top-right** on video cards (`class="dur tr"`) | The bottom-right corner is where the native control bar lives; an overlay there steals clicks from it. |
| The lightbox does **not** `autoplay` | Browsers block autoplay with sound, so a video that has an audio track (step 02 does) would sit on its first frame anyway. Predictable beats sometimes-playing — the user presses play. |

Video cards also drop the hover lift (`.media.is-video:hover { transform: none }`): a card that
moves when you reach for the controls is a card you cannot use.

Recording spec, if you are adding more: 2–6 s for a loop or up to ~90 s for a walkthrough, 1080p or
720p, H.264 with `moov` at the front (faststart — so it streams), audio optional, and keep an eye on
size: `preload="metadata"` means the page only fetches the header, but full playback of a 20 MB file
still costs 20 MB of the Pages bandwidth budget.

#### YouTube cards (how the step 01–03 walkthroughs are delivered now)

The three walkthroughs stream from YouTube instead of being served out of `assets/`, so a recording is
no longer bounded by the repository. An entry looks like this:

```js
{
  type: "youtube",
  title: "Step 01 walkthrough · sketch to locked concept",
  caption: "…",
  yt: "https://youtu.be/dQw4w9WgXcQ",   // any watch / youtu.be / embed / shorts URL, or a bare id
  dur: "0:28",
  wide: true
}
```

`yt` accepts every URL shape YouTube hands out — `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`,
`/live/` — plus a bare id, because these links get pasted by hand. An entry with an empty `yt` renders
a "YouTube link pending" panel rather than an empty box.

**The iframe is not in the page until someone clicks.** Each embedded player is roughly a megabyte of
JS, so a card renders a facade — thumbnail plus play glyph — and the player is injected on click.
That is also what keeps the page offline-safe: nothing is requested from YouTube until a visitor
actually presses play.

| Behaviour | Why it is built this way |
|---|---|
| The facade is `<div class="yt">` and the card shell stays a `<div>` | Same reason as video cards: the frame is the click target, and a `<button>` wrapper would swallow the click. `data-open` lives on the separate "Open larger" button in the caption row. |
| `data-live="1"` guards the click handler | A second click must not stack another iframe on top of the first. |
| The thumbnail steps down `maxresdefault` → `hqdefault` → hidden | `maxresdefault` is absent on some uploads, and `i.ytimg.com` is unreachable from behind a block. In the last case the card's own gradient shows through — a broken-image glyph never appears. |
| The embed is `www.youtube.com/embed/` with `rel=0&modestbranding=1&playsinline=1` | Matches the snippet YouTube itself hands out, so the request is identical to a known-good one. `rel=0` keeps the "related videos" tail from pulling visitors off the site. |
| The iframe carries `referrerpolicy="strict-origin-when-cross-origin"` | **Load-bearing.** YouTube's terms require the embedding page to send a Referer; without one the player refuses to start and reports **error 153 — "video player configuration error"**. See the note below. |

#### Error 153 — and why this page cannot be tested from `file://`

If a YouTube card shows *"Error 153 · Video player configuration error"*, the player never received a
Referer. Google's own documentation says it plainly: **"Embedders must provide the HTTP Referer
header… If it is missing, playback is blocked and an error screen appears (Error 153)."** The same
page notes that loading an embed **directly, with no enclosing page** — a browser address bar, or a
`file://` document — produces no Referer at all, because the embedded player is only meant to be used
from inside an embedding context.

Two consequences, both easy to trip over:

- The iframe sets `referrerpolicy="strict-origin-when-cross-origin"` so the browser actually sends
  one. **Removing that attribute reintroduces error 153** on a properly served site.
- **Opening `index.html` straight off the disk will always show 153**, whatever the code says — a
  `file://` document sends no Referer and there is no way around that from inside the page. Test the
  player over `http://` or `https://`: the deployed Pages site, or locally with
  `python -m http.server 8080` and <http://127.0.0.1:8080/>. Stills, GIFs and local `video` cards are
  unaffected and still work from `file://`.

`node tools/qa_embed_referer.mjs` asserts both halves of this. It drives a real browser, clicks a card
and prints the `Referer` on the outgoing embed request: `http://127.0.0.1:8791/` when the page is served,
and nothing at all from `file://`.

**This is the one intentional external dependency.** Everything else in the wiki works from `file://`
or an offline copy; a YouTube card needs a network and a reachable YouTube. If part of the audience is
somewhere YouTube is blocked, keep the `assets/video/` files and use a `video` entry instead — both
card types coexist on the same page, and the manifest in the appendix lists which is which.

Once a step is switched to `type: "youtube"`, nothing in `src/content/` references its `.mp4` any
more, so the file can be deleted from the repository to shrink it.


---

## 5. Publishing

1. Run `python build.py` to produce `index.html`
2. Upload `index.html` **together with the whole `assets/` directory** (relative paths must be preserved)
3. Done. No runtime dependencies, no external fonts, libraries or CDN requests — it works offline

---

## 6. Known boundaries

- **Steps 01–05 carry real content, and step 06 carries the Process Book's atmosphere chapter.** Sub-steps 6.1–6.4 (exposure, sun and sky, height fog, fog cards, the overall adjustment) follow §06 page for page; 6.5 (material consistency) and 6.6 (LUT authoring) are labelled “beyond the document” on the page, because they are guidance rather than procedure. Workflow documentation and the final film used to be step 07; they were removed on 2026-11-06 because they are deliverables rather than part of the AI-assisted environment pipeline.
- Progress lives in browser `localStorage` and **does not sync across devices**. Syncing needs a thin account + progress endpoint (this build deliberately stays backend-free).
- GIFs get heavy when they run long — compress to under 8 seconds in AE/PS first. For smaller files, switch `src` to `.webp` (browser support is fine, but you supply the file).
- Use H.264 MP4 for video; HEVC does not play in some browsers.
- **The step 01–03 walkthroughs are embedded from YouTube**, which is the one intentional external dependency in this build — see §4.3. Everything else still works offline or from `file://`; a YouTube card needs a reachable YouTube at the moment someone presses play.
- Basic print/PDF handling is in place (navigation is hidden, code blocks switch to a light theme).

---

## 7. Navigation & scroll invariants (do not regress)

Bugs have lived in this site that **no renderer or screenshot check can catch** — they only
appear with a real mouse wheel, real clicks and real keystrokes. The fixes are load-bearing,
so keep these rules when editing `styles.css` / `app.js`:

| Rule | Why |
|---|---|
| Jump targets use `window.scrollTo()` with an explicitly computed offset — **never** `element.scrollIntoView()` | `scrollIntoView()` scrolls every scrollable ancestor and a second programmatic smooth scroll cancels the first one, which left "click a TOC chip" stopping dead at the next section boundary. `scrollToId()` in `app.js` is the single place doing this. |
| Auto-centering the active nav item scrolls **only its own container** (`centerIn(box, el)`, via `scrollLeft` / `scrollTop`) | Same reason: centering a chip with `scrollIntoView()` used to hijack and cancel the page's own scroll. |
| The pinned rail must **not** use `overscroll-behavior: contain` | Once a step's sub-steps make the rail taller than the viewport, the rail becomes a scroll container. `contain` then let it swallow every wheel event over the left column and refuse to chain to the page — the page looked frozen. |
| The top bar is `position: fixed`, **not** `sticky` (and `body` carries `padding-top: var(--topbar-h)`) | A focused `<input>` inside a `position: sticky` bar makes Chrome re-run "reveal the focused element" on **every keystroke** against the bar's static in-flow position (document y≈0), silently dragging the page upward while the user types in the search box. A fixed bar is genuinely viewport-anchored, so no reveal-scroll happens. |
| `.variants` (the A–E tab row) **wraps** instead of scrolling horizontally | It used to be `overflow-x: auto` with a hidden scrollbar, so with four or five variants the later ones were simply invisible at common widths. Wrapping shows them all, and it also removes another scroll container from the page — the same class of surface that caused defect 2. |

Verify with `node tools/qa_nav.mjs` — it launches headless Chrome itself, drives actual wheel /
click / keyboard input over the DevTools protocol and checks section jumps land within 45px of
their target, that the wheel scrolls the page from either column, and that typing in the search
field does not move the page at all.

Check 1 is a **content-integrity baseline**, not a design constraint: it catches a content file
being dropped, truncated, or swallowed by the build. When content changes on purpose, refresh the
numbers in `qa_nav.mjs` — and confirm them with `node tools/count_content.mjs` rather than copying
whatever the page renders, or the check stops meaning anything.

---

## 8. Source documents and figure extraction

Steps 01–05 and the appendix's POC block are written up from two working documents, and every
still in `assets/images/step1..step5-*.jpg` is cut out of them. Nothing in those sections is
invented.

| Document | Canva ID | Pages | Feeds |
|---|---|---|---|
| Final Project Process Book | `DAHV1mabePw` | 29 | Sections 01–05 → steps 01–05; §06 → step 06 (6.1–6.4) |
| Sprint 2 – Proof of Concept (A4 v3) | `DAHWU6gmpMY` | 23 | The eight logged stages → steps 01–03, and the appendix POC block |

```bash
# 1. export the pages (Canva MCP: export-design, format png, all pages)
# 2. paste the signed URLs into tools/fetch_canva.py, then:
python tools/fetch_canva.py                        # → tools/_canva_src/{pb,poc}/*.png
# 3. cut the figures out — coordinates are preview-space, 880px wide
python tools/extract_canva_images.py --sheet       # → assets/images/*.jpg + _crop_sheet.jpg
# 4. LOOK at tools/_crop_sheet.jpg. This is the only real verification.
```

**Export URLs are signed and expire**, so re-running means re-exporting from Canva first. The
exported pages are kept in `tools/_canva_src/` precisely so the figures can be re-cut without
another export.

**Verify by eye, with the contact sheet.** There is no reliable automatic check for "was this
figure cropped correctly" on these documents — two attempts at building one are documented in the
module docstring of `extract_canva_images.py`, and both failed in different directions. Two
concrete traps the contact sheet has already caught:

- A window set to `y2=344` on a figure that runs to `y=406` silently removed the bottom row of
  reference thumbnails.
- A window top above `y≈454` on the evidence-pass sketch pulled in the prose line
  *"The step is manual, so there are no iterations and no generation cost."* Compare against
  `tools/_canva_src/poc/poc14.png` to see where the gap is.

---

## 9. Deployment (GitHub Pages)

The site is live at **<https://ryancrafterrr.github.io/AI-3D-workflow_1/>**, published from
`Ryancrafterrr/AI-3D-workflow_1` with **Pages → Source: Deploy from a branch → `main` / `(root)`**.
Because `index.html` and `assets/` sit at the repository root, that is all the configuration the
site needs.

**To publish an update:**

```bash
python build.py                 # rebuild index.html from src/
git add -A && git commit -m "content: ..." && git push
```

Pages redeploys automatically, usually within a minute.

Two things worth knowing about this setup:

- **The site is served from a subpath** (`/AI-3D-workflow_1/`), so every media reference must stay
  relative. `index.html` currently contains **no** root-absolute `src="/..."` / `href="/..."`
  references — keep it that way, or the media will 404 once deployed. Verify with:
  `grep -oE '(src|href)="/[^"]*"' index.html` (should print nothing).
- **Do not add a `.nojekyll` file without thinking about it.** GitHub Pages runs Jekyll over the
  repo, and Jekyll excludes paths beginning with `_`. That is currently *useful*: `tools/_canva_src/`
  (25 MB of exported Canva pages) and `tools/_shots/` are stored in the repository but are **not**
  published, because their names begin with an underscore. Adding `.nojekyll` would strip Jekyll
  and expose those directories on the live site. If you ever do need `.nojekyll`, move that scratch
  out of the repo first.
- Everything else in the repository (source, tools, README) is public too — normal for a Pages site.
  Only the underscore-prefixed directories are hidden from the site.

**Verify a deployed copy** rather than assuming the push worked:

```bash
SITE_URL=https://ryancrafterrr.github.io/AI-3D-workflow_1 node tools/shots.mjs
# loads the live URL in a real browser, reports broken images and runtime errors,
# and writes screenshots to tools/_shots/
```
