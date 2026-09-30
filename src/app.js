/* ============================================================================
   AI-Assisted Environment Art Workflow · single-page app logic
   Renders everything from window.WIKI (see content.js) — no page navigation.
   ========================================================================== */
(function () {
  "use strict";

  var W = window.WIKI || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------- utilities */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function rich(s) {
    // escapes, then highlights {{editable placeholders}}, [[negatives]] and --cli-flags
    return esc(s)
      .replace(/\{\{([^}]+)\}\}/g, '<span class="ph">{{$1}}</span>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="neg">[[$1]]</span>')
      .replace(/(--[a-z][\w-]*)/g, '<span class="flag">$1</span>');
  }
  // for authored prose fields: keeps a small set of inline tags (<strong>, <code>, <em>) working
  function prose(s) {
    return String(s == null ? "" : s)
      .replace(/\{\{([^}]+)\}\}/g, '<span class="ph">{{$1}}</span>')
      .replace(/(--[a-z][\w-]*)/g, '<span class="flag">$1</span>');
  }
  function slug(s) { return String(s).replace(/[^\w-]+/g, "-").toLowerCase(); }
  function topbarOffset() {
    var tb = document.querySelector(".topbar");
    return (tb ? tb.offsetHeight : 60) + 20;
  }
  /* Deterministic page scroll.
     NOT element.scrollIntoView(): it scrolls every scrollable ancestor, and any
     other programmatic scroll started while it animates cancels it — which is
     exactly what made "click a top TOC chip" stop dead at the next section
     boundary (click Step 02, land 6k px short of it). */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - topbarOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  /* ----------------------------------------------------------------- icons */
  var I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5.5 5.5L20 6.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6c0-.9 1-1.5 1.8-1L19 11c.7.5.7 1.5 0 2l-9.2 6.4c-.8.5-1.8-.1-1.8-1z"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.2"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a6.5 6.5 0 0 0-3.9 11.7V16h7.8v-2.3A6.5 6.5 0 0 0 12 2Z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8.5v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
    skull: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-5 14.3V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2.7A8 8 0 0 0 12 2Z"/><path d="M9 15h.01M15 15h.01"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 5h11l-2 3.5L16 12H5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 13.5 15.5 10"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 5.2 5.2L21 12l-9 9-3-3 9-9z"/><path d="M6.5 15.5 3 19l2 2 3.5-3.5"/></svg>',
    frame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9.5h18M7 5v4.5M14 5v4.5"/></svg>',
    gif: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M8 14v-4h-1.5M11 10v4M14 14v-4h3M14 12h2"/></svg>',
    img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 4.5-4.5L13 17l3-2.5 4 3.5"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4M12 21V11"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.8 12.2 8.7-8.7M16 6l2.5 2.5M13.5 8.5 16 11"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 6.5-2.6 6.5-6.2 0-4.4-4-6.3-4-10.3 0 0-3 1.6-3 5 0 1.4-1.2 1.3-1.2-.6C9.2 6.5 8 5.5 8 5.5c-1.7 2-2.5 4-2.5 6.3C5.5 18.4 8.3 22 12 22Z"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M18 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>'
  };

  /* ------------------------------------------------------ state & storage */
  var LS_KEY = "ai-env-wiki:progress:v1";
  var done = {};
  try { done = JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch (e) { done = {}; }
  function saveDone() { try { localStorage.setItem(LS_KEY, JSON.stringify(done)); } catch (e) {} }

  var allTaskIds = [];

  /* --------------------------------------------------------------- toasts */
  function toast(html, ms) {
    var host = $("#toasts");
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = html;
    host.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 260);
    }, ms || 2000);
  }

  /* ------------------------------------------------------------ clipboard */
  function copyText(text) {
    return new Promise(function (resolve) {
      var fallback = function () {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.cssText = "position:fixed;top:-2000px;opacity:0";
          document.body.appendChild(ta);
          ta.select();
          ta.setSelectionRange(0, text.length);
          var ok = document.execCommand("copy");
          ta.remove();
          resolve(ok);
        } catch (e) { resolve(false); }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { resolve(true); }, fallback);
      } else { fallback(); }
    });
  }

  /* ------------------------------------------------------------- renderers */
  function renderHero() {
    var m = W.meta || {};
    $("#hero").innerHTML =
      '<div class="hero-inner">' +
        '<div class="badges">' + (m.badges || []).map(function (b) {
          return '<span class="badge ' + (b.tone || "") + '">' + (b.tone === "live" ? "<i></i>" : "") + esc(b.text) + "</span>";
        }).join("") + "</div>" +
        "<h1>" + esc(m.title) + "</h1>" +
        (m.titleEn ? '<div class="en">' + esc(m.titleEn) + "</div>" : "") +
        '<p class="lede">' + (m.lede || "") + "</p>" +
        (m.lede2 ? '<p class="lede dim" style="font-size:14px">' + m.lede2 + "</p>" : "") +
        '<div class="stats">' + (m.stats || []).map(function (s, i) {
          return '<div class="stat' + (i === 0 ? " accent" : "") + '"><b>' + esc(s.v) + "</b><span>" + esc(s.l) + "</span></div>";
        }).join("") + "</div>" +
        '<div class="scroll-hint">' + I.down + "<span>Scroll on — the pipeline rail stays pinned to the left</span></div>" +
      "</div>";
  }

  function renderQuickstart() {
    var q = W.quickstart || {};
    var html =
      '<div class="block" id="quickstart">' +
        '<div class="block-head"><span class="kicker">HOW TO USE</span><h2>' + esc(q.title) + "</h2><span class=\"rule\"></span></div>" +
        '<div class="card"><p class="muted" style="font-size:13.5px;margin-bottom:16px">' + q.lead + "</p>" +
        '<div class="qs-grid">' + (q.items || []).map(function (it) {
          return '<div class="qs"><div class="ic">' + (I[it.icon] || I.info) + "</div><h4>" + esc(it.title) + "</h4><p>" + esc(it.text) + "</p></div>";
        }).join("") + "</div></div>" +
      "</div>";
    return html;
  }

  function pipelineItems() {
    // pipeline cards are derived from the steps themselves; override per step
    // with step.pipe = { out: "...", tool: "..." } when the default is not ideal.
    if (W.pipeline && W.pipeline.items && W.pipeline.items.length) return W.pipeline.items;
    return (W.steps || []).map(function (s) {
      var p = s.pipe || {};
      return {
        n: s.n,
        title: s.title,
        en: s.en,
        out: p.out || (s.outputs && s.outputs[0]) || "",
        tool: p.tool || (s.tools && s.tools[0]) || "",
        target: s.id
      };
    });
  }

  function renderPipeline() {
    var p = W.pipeline || {};
    return '<div class="block" id="overview">' +
      '<div class="block-head"><span class="kicker">PIPELINE OVERVIEW</span><h2>' + esc(p.title) + "</h2><span class=\"rule\"></span></div>" +
      '<div class="card"><p class="muted" style="font-size:13.5px;margin-bottom:16px">' + p.lead + "</p>" +
      '<div class="pipe">' + pipelineItems().map(function (it) {
        return '<button class="pipe-card" data-jump="' + it.target + '">' +
          '<span class="n">' + esc(it.n) + "</span>" +
          "<b>" + esc(it.title) + "</b>" +
          "<span>" + esc(it.en) + "</span>" +
          "<em>" + esc(it.out) + "</em>" +
          '<span class="badge">' + esc(it.tool) + "</span>" +
        "</button>";
      }).join("") + "</div></div></div>";
  }

  function renderIO(step) {
    function col(cls, label, items, icon) {
      if (!items || !items.length) return "";
      return '<div class="io-col ' + cls + '"><h5><i></i>' + label + "</h5><ul>" +
        items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
    }
    return '<div class="io">' +
      col("in", "Inputs", step.inputs, I.file) +
      col("out", "Outputs", step.outputs, I.flag) +
      col("tool", "Tool Stack", step.tools, I.tool) +
    "</div>";
  }

  function renderSubsteps(step) {
    if (!step.substeps || !step.substeps.length) return "";
    return '<h3 class="sec"><span class="tagn">' + (step.substeps.length) + ' STEPS</span>Sub-steps</h3>' +
      '<div class="substeps">' + step.substeps.map(function (s) {
        var tasks = (s.tasks || []).map(function (t, i) {
          var id = step.id + "-" + s.id + "-" + i;
          allTaskIds.push(id);
          var on = done[id] ? " checked" : "";
          return '<label class="task" data-task="' + id + '">' +
            '<input type="checkbox"' + on + '>' +
            '<span class="box">' + I.check + "</span>" +
            "<span>" + rich(t) + "</span>" +
          "</label>";
        }).join("");
        return '<div class="substep" id="' + slug(step.id + "-" + s.id) + '" data-substep="' + step.id + "-" + s.id + '">' +
          '<div class="num">' + esc(s.id) + "</div>" +
          "<div><h4>" + esc(s.title) + "</h4>" +
          (s.detail ? '<p class="detail">' + prose(s.detail) + "</p>" : "") +
          '<div class="tasks">' + tasks + "</div></div>" +
        "</div>";
      }).join("") + "</div>";
  }

  function renderPrompts(step) {
    if (!step.prompts || !step.prompts.length) return "";
    return '<h3 class="sec"><span class="tagn">' + step.prompts.length + ' BLOCKS</span>Prompt library · click A–E to copy</h3>' +
      step.prompts.map(function (p) {
        var first = p.variants[0];
        var tabs = p.variants.map(function (v, i) {
          return '<button class="vbtn' + (i === 0 ? " active" : "") + '" data-prompt="' + p.id + '" data-key="' + v.key + '">' +
            '<span class="key">' + esc(v.key) + '</span><span>' + esc(v.name) + '</span>' +
            '<span class="vtag">' + (v.tag || "") + "</span></button>";
        }).join("");
        return '<div class="prompt" data-block="' + p.id + '">' +
          '<div class="prompt-head">' +
            '<div class="ic">' + (I[p.icon] || I.spark) + "</div>" +
            "<div><h4>" + esc(p.title) + "</h4><p>" + prose(p.note || "") + "</p></div>" +
            '<span class="count">' + p.variants.length + " variants</span>" +
          "</div>" +
          '<div class="variants"><span class="lbl">Variant</span>' + tabs + "</div>" +
          '<div class="prompt-body">' +
            '<div class="prompt-meta" data-meta></div>' +
            "<pre class=\"code\" data-code>" + rich(first.text) + "</pre>" +
          "</div>" +
          '<div class="prompt-actions">' +
            '<span class="hint">' + I.info + " Pick an A–E option and it is copied straight to your clipboard</span>" +
            '<button class="btn sm" data-toggle-expand>Expand all</button>' +
            '<button class="btn sm" data-copy-all>' + I.copy + "Copy current</button>" +
          "</div>" +
          '<template data-variants>' + JSON.stringify(p.variants) + "</template>" +
        "</div>";
      }).join("");
  }

  function renderMedia(step) {
    if (!step.media || !step.media.length) return "";
    return '<h3 class="sec"><span class="tagn">' + step.media.length + ' ASSETS</span>Video · Animated GIF · Stills</h3>' +
      '<div class="media-grid">' + step.media.map(function (m, i) {
        return mediaCard(m, step.id + "-m" + i);
      }).join("") + "</div>";
  }

  function mediaCard(m, uid) {
    var isVideo = m.type === "video";
    var badgeTxt = isVideo ? "VIDEO" : (m.type === "gif" ? "GIF · LOOP" : "IMAGE");
    var bIcon = isVideo ? I.film : (m.type === "gif" ? I.gif : I.img);
    var frame;
    if (isVideo) {
      frame = '<video data-media playsinline preload="metadata"' +
        (m.poster ? ' poster="' + esc(m.poster) + '"' : "") + ">" +
        '<source src="' + esc(m.src) + '" type="video/mp4">' +
      "</video>";
    } else {
      frame = '<img class="thumb" data-media alt="' + esc(m.title) + '" src="' + esc(m.src) + '">';
    }
    return '<button class="media' + (m.wide ? " wide" : "") + '" data-open="' + uid + '" data-title="' + esc(m.title) +
      '" data-cap="' + esc(m.caption || "") + '" data-src="' + esc(m.src) + '" data-poster="' + esc(m.poster || "") +
      '" data-type="' + esc(m.type) + '" data-file="' + esc(m.file || m.src) + '">' +
      '<div class="frame" data-frame>' + frame +
        '<span class="badge-tl ' + (isVideo ? "video" : m.type === "gif" ? "gif" : "") + '">' + badgeTxt + "</span>" +
        (m.dur ? '<span class="dur">' + esc(m.dur) + "</span>" : "") +
        '<span class="expand"><span>' + I.expand + "Open larger</span></span>" +
      "</div>" +
      '<div class="cap"><h5>' + esc(m.title) + "</h5>" +
        (m.caption ? "<p>" + esc(m.caption) + "</p>" : "") +
        '<span class="file">' + esc(m.file || m.src) + "</span>" +
      "</div></button>";
  }

  function placeholderHTML(m, file) {
    var isVideo = m === "video";
    var label = isVideo ? "Video slot" : (m === "gif" ? "Animated GIF slot" : "Image slot");
    return '<div class="slot"><div class="in">' + (isVideo ? I.play : m === "gif" ? I.gif : I.img) +
      "<b>" + label + "</b><code>" + esc(file) + "</code>" +
      "<span>Drop the real file at this path and it renders here</span></div></div>";
  }

  function renderStep(step, idx, total) {
    var prev = W.steps[idx - 1], next = W.steps[idx + 1];
    var html = '<section class="step" id="' + step.id + '" data-step="' + step.id + '">' +
      '<div class="step-head" data-ghost="' + esc(step.n) + '">' +
        '<div class="step-eyebrow">STEP ' + esc(step.n) + (step.stage ? " · " + esc(step.stage) : "") + "</div>" +
        "<h2>" + esc(step.title) + "</h2>" +
        '<div class="en">' + esc(step.en) + "</div>" +
        '<div class="step-purpose"><b>Purpose ·</b> ' + prose(step.purpose) + "</div>" +
        '<div class="meta-row">' +
          '<span class="meta">' + I.clock + "Est. <b>" + esc(step.duration) + "</b></span>" +
          '<span class="meta">' + I.gauge + "Difficulty <b>" + esc(step.difficulty) + "</b></span>" +
          '<span class="meta">' + I.layers + "Sub-steps <b>" + (step.substeps || []).length + "</b></span>" +
          '<span class="meta">' + I.key + "Prompts <b>" + (step.prompts || []).length + "</b></span>" +
        "</div>" +
        renderIO(step) +
      "</div>" +
      '<div class="step-body">' +
        (step.intro || []).map(function (p) { return "<p>" + prose(p) + "</p>"; }).join("") +
        renderSubsteps(step) +
        renderPrompts(step) +
        renderMedia(step) +
        renderNotes(step) +
        (step.checkpoint ? '<div class="callout-stack"><div class="callout check">' + I.flag +
          "<div><h5>Definition of Done</h5><p>" + prose(step.checkpoint) + "</p></div></div></div>" : "") +
        '<div class="step-foot">' +
          '<span class="who">STEP ' + esc(step.n) + " / " + String(total).padStart(2, "0") + " · " + esc(step.en) + "</span>" +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            (prev ? '<a class="btn" href="#' + prev.id + '" data-jump="' + prev.id + '">' + I.left + "Previous</a>" : "") +
            (next ? '<a class="btn primary" href="#' + next.id + '" data-jump="' + next.id + '">Next: ' + esc(next.title) + " " + I.right + "</a>"
                  : '<a class="btn primary" href="#faq" data-jump="faq">' + I.up + "Back to overview</a>") +
          "</div>" +
        "</div>" +
      "</div></section>";
    return html;
  }

  function renderNotes(step) {
    var out = "";
    var tips = (step.tips || []), pits = (step.pitfalls || []);
    if (tips.length) {
      out += '<h3 class="sec"><span class="tagn">TIPS</span>Field notes</h3><div class="callout-stack">' +
        tips.map(function (t) {
          return '<div class="callout tip">' + I.bulb + "<div><h5>" + esc(t.title || "Tip") + "</h5><p>" + prose(t.text) + "</p></div></div>";
        }).join("") + "</div>";
    }
    if (pits.length) {
      out += '<h3 class="sec"><span class="tagn">PITFALLS</span>Common pitfalls &amp; how to avoid them</h3><div class="callout-stack">' +
        pits.map(function (t) {
          return '<div class="callout warn">' + I.alert + "<div><h5>" + esc(t.title || "Watch out") + "</h5><p>" + prose(t.text) + "</p></div></div>";
        }).join("") + "</div>";
    }
    return out;
  }

  function renderAppendix() {
    var a = W.appendix || {};
    if (!a || !a.title) return "";
    var html = '<div class="block" id="appendix">' +
      '<div class="block-head"><span class="kicker">APPENDIX</span><h2>' + esc(a.title) + "</h2><span class=\"rule\"></span></div>";

    if (a.tools) {
      html += '<h3 class="sec"><span class="tagn">TOOLCHAIN</span>' + esc(a.tools.title) + "</h3>" +
        '<div class="tool-grid">' + a.tools.items.map(function (t) {
          return '<div class="tool"><div class="top"><b>' + esc(t.name) + '</b><span class="stage">' + esc(t.stage) + "</span></div><p>" + esc(t.use) + "</p></div>";
        }).join("") + "</div>";
    }
    if (a.poc) {
      var p = a.poc;
      var kvBlock = function (rows) {
        return '<div class="card pad-s" style="margin-bottom:14px">' + rows.map(function (r) {
          return '<p class="poc-kv"><span class="k">' + esc(r.k) + "</span><span>" + prose(r.v) + "</span></p>";
        }).join("") + "</div>";
      };
      var keyTable = function (cols, rows) {
        return '<div class="tbl-wrap" style="margin-bottom:14px"><table class="tbl-key"><thead><tr>' +
          cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") +
          "</tr></thead><tbody>" + rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table></div>";
      };
      html += '<h3 class="sec" id="poc"><span class="tagn">POC EVIDENCE</span>' + esc(p.title) + "</h3>" +
        '<div class="card pad-s" style="margin-bottom:14px"><p class="muted" style="font-size:12.5px">' + p.lead + "</p></div>";
      if (p.question) html += kvBlock(p.question);
      if (p.boundary) html += kvBlock(p.boundary);
      if (p.criteriaRows) html += keyTable(p.criteriaCols, p.criteriaRows);
      if (p.logRows) {
        html += '<h4 class="poc-sub">' + esc(p.logTitle) + "</h4>" + keyTable(p.logCols, p.logRows);
        if (p.logTotal) html += '<p class="poc-note">' + p.logTotal + "</p>";
      }
      if (p.interpretation) {
        html += '<h4 class="poc-sub">What the evidence shows</h4><div class="poc-list">' +
          p.interpretation.map(function (t) { return "<p>" + prose(t) + "</p>"; }).join("") + "</div>";
      }
      if (p.decision) {
        html += '<h4 class="poc-sub">' + esc(p.decisionTitle) + "</h4>" +
          '<div class="poc-list" style="margin-bottom:14px"><p>' + prose(p.decision) + "</p>" +
          (p.decision2 ? "<p>" + prose(p.decision2) + "</p>" : "") + "</div>";
      }
      if (p.scopeRows) html += keyTable([p.scopeTitle, "What it means"], p.scopeRows);
    }
    if (a.manifest) {
      html += '<h3 class="sec" id="manifest"><span class="tagn">MEDIA MANIFEST</span>' + esc(a.manifest.title) + "</h3>" +
        '<div class="card pad-s" style="margin-bottom:14px"><p class="muted" style="font-size:12.5px">' + a.manifest.lead + "</p></div>" +
        '<div class="tbl-wrap"><table><thead><tr>' +
        a.manifest.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + a.manifest.rows.map(function (r) {
          return "<tr>" + r.map(function (c, i) {
            return "<td>" + (i === 1 ? "<code>" + esc(c) + "</code>" : esc(c)) + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
    }
    if (a.faq) {
      html += '<h3 class="sec" id="faq"><span class="tagn">FAQ</span>' + esc(a.faq.title) + "</h3>" +
        '<div class="acc">' + a.faq.items.map(function (f, i) {
          return '<div class="acc-item"><button class="acc-q"><span class="qn">Q' + (i + 1) + "</span><span>" + esc(f.q) + '</span><span class="pl">' + I.chev + "</span></button>" +
            '<div class="acc-a"><div class="pad">' + f.a + "</div></div></div>";
        }).join("") + "</div>";
    }
    if (a.changelog) {
      html += '<h3 class="sec"><span class="tagn">CHANGELOG</span>' + esc(a.changelog.title) + "</h3>" +
        '<div class="card pad-s"><div class="log">' + a.changelog.rows.map(function (r) {
          return '<div class="log-row"><span class="d">' + esc(r.d) + '</span><div class="c"><b>' + esc(r.t) + "</b><span>" + esc(r.c) + "</span></div></div>";
        }).join("") + "</div></div>";
    }
    html += '<div class="end-note">' + a.note + "</div></div>";
    return html;
  }

  function renderFooter() {
    var m = W.meta || {};
    $("#foot").innerHTML =
      "<span>AI-ASSISTED ENVIRONMENT ART WORKFLOW</span><span>·</span>" +
      "<span>" + esc(m.version) + "</span><span>·</span>" +
      "<span>UPDATED " + esc(m.updated) + "</span>" +
      '<span class="sp"></span>' +
      '<span>SINGLE PAGE · NO OUTBOUND LINKS · ' + allTaskIds.length + " CHECKABLE TASKS</span>";
  }

  /* ------------------------------------------------------------- side nav */
  function renderNav() {
    var g1 = '<div class="side-group"><div class="side-label">Start</div>' +
      '<a class="side-link" data-target="quickstart"><span class="n">•</span>How to use</a>' +
      '<a class="side-link" data-target="overview"><span class="n">•</span>Pipeline overview</a></div>';

    var g2 = '<div class="side-group"><div class="side-label">Workflow · 6 steps</div>' +
      (W.steps || []).map(function (s) {
        var subs = (s.substeps || []).map(function (x) {
          return '<a class="side-link sub hidden" data-target="' + slug(s.id + "-" + x.id) + '">' + esc(x.id) + " " + esc(x.title) + "</a>";
        }).join("");
        return '<a class="side-link" data-target="' + s.id + '" data-step="' + s.id + '"><span class="n">' + esc(s.n) + "</span>" + esc(s.title) + "</a>" + subs;
      }).join("") + "</div>";

    var g3 = '<div class="side-group"><div class="side-label">Appendix</div>' +
      '<a class="side-link" data-target="appendix">Toolchain &amp; media manifest</a>' +
      '<a class="side-link" data-target="poc"><span class="n">A</span>POC evidence</a>' +
      '<a class="side-link" data-target="faq">FAQ</a></div>';

    $("#sidenav-body").innerHTML = g1 + g2 + g3;

    // top rail
    $("#toc-rail").innerHTML =
      '<button class="toc-chip ghost active" data-target="quickstart"><span class="n">•</span>Start</button>' +
      '<button class="toc-chip ghost" data-target="overview"><span class="n">•</span>Overview</button>' +
      '<span class="toc-sep"></span>' +
      (W.steps || []).map(function (s) {
        return '<button class="toc-chip" data-target="' + s.id + '" title="' + esc(s.title) + '"><span class="n">' + esc(s.n) + '</span><span class="txt">' + esc(s.short || s.title) + "</span></button>";
      }).join("") +
      '<span class="toc-sep"></span>' +
      '<button class="toc-chip ghost" data-target="appendix"><span class="n">A</span>Appendix</button>' +
      '<button class="toc-chip ghost" data-target="faq"><span class="n">Q</span>FAQ</button>';
  }

  /* --------------------------------------------------------------- spying */
  function spyTargets() {
    return $$("#quickstart, #overview, .step, #appendix, #faq");
  }

  /* Scroll ONLY the given container — never the window.
     element.scrollIntoView() would also scroll every scrollable ancestor, i.e.
     the page itself, cancelling the smooth scroll that is already in flight. */
  function centerIn(box, el) {
    if (!box || !el || !box.getBoundingClientRect) return;
    var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
    var opts = {};
    if (box.scrollWidth > box.clientWidth + 2 && (er.left < br.left + 4 || er.right > br.right - 4)) {
      opts.left = Math.max(0, box.scrollLeft + (er.left - br.left) - (br.width - er.width) / 2);
    }
    if (box.scrollHeight > box.clientHeight + 2 && (er.top < br.top + 4 || er.bottom > br.bottom - 4)) {
      opts.top = Math.max(0, box.scrollTop + (er.top - br.top) - (br.height - er.height) / 2);
    }
    if (opts.left === undefined && opts.top === undefined) return;
    opts.behavior = "smooth";
    box.scrollTo(opts);
  }

  var lastActive = "";
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
    $("#bar").style.width = (pct * 100).toFixed(2) + "%";

    // current section
    var line = y + 140;
    var cur = "";
    spyTargets().forEach(function (el) {
      if (el.offsetTop <= line) cur = el.id;
    });
    if (cur !== lastActive) {
      lastActive = cur;
      $$(".side-link").forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("data-target") === cur);
      });
      $$(".toc-chip").forEach(function (c) {
        var on = c.getAttribute("data-target") === cur;
        c.classList.toggle("active", on);
        if (on) centerIn(c.parentNode, c);
      });
      var activeStep = $('.side-link.active[data-step]');
      $$(".side-link.sub").forEach(function (a) {
        var parent = a.getAttribute("data-target").split("-").slice(0, 2).join("-");
        var show = activeStep && a.getAttribute("data-target").indexOf(activeStep.getAttribute("data-step")) === 0;
        a.classList.toggle("hidden", !show);
      });
      var railActive = $(".side-link.active");
      if (railActive) centerIn(document.querySelector(".side-nav"), railActive);
    }
    updateRing();
  }

  function updateRing() {
    var total = allTaskIds.length || 1;
    var n = allTaskIds.filter(function (id) { return done[id]; }).length;
    var pct = Math.round((n / total) * 100);
    var C = 2 * Math.PI * 13;
    $$(".ring .fg").forEach(function (c) {
      c.setAttribute("stroke-dasharray", C.toFixed(1));
      c.setAttribute("stroke-dashoffset", (C * (1 - n / total)).toFixed(1));
    });
    $("#ring-txt-num").textContent = pct + "%";
    $("#ring-txt-sub").textContent = n + " / " + allTaskIds.length + " tasks done";
    var db = $("#drawer-pct");
    if (db) db.textContent = pct + "%";
    $$(".substep").forEach(function (s) {
      var boxes = $$("input[type=checkbox]", s);
      var all = boxes.length > 0 && boxes.every(function (b) { return b.checked; });
      s.classList.toggle("done", all);
    });
  }

  /* ------------------------------------------------------------- lightbox */
  var lbStack = [];
  function openLightbox(card) {
    var type = card.getAttribute("data-type");
    var src = card.getAttribute("data-src");
    var poster = card.getAttribute("data-poster");
    var lb = $("#lightbox");
    var stage;
    if (type === "video") {
      stage = '<video controls autoplay playsinline' + (poster ? ' poster="' + esc(poster) + '"' : "") + '><source src="' + esc(src) + '" type="video/mp4"></video>';
    } else {
      stage = '<img src="' + esc(src) + '" alt="">';
    }
    $("#lb-stage").innerHTML = stage;
    $("#lb-title").textContent = card.getAttribute("data-title") || "";
    $("#lb-cap").textContent = card.getAttribute("data-cap") || "";
    $("#lb-file").textContent = card.getAttribute("data-file") || src;
    $("#lb-meta").innerHTML = '<span class="badge">' + (type === "video" ? "VIDEO" : type === "gif" ? "ANIMATED GIF" : "IMAGE") + "</span>" +
      '<span class="badge">' + esc(wSizeLabel(src)) + "</span>";
    lb.classList.add("on");
    document.body.style.overflow = "hidden";
  }
  function wSizeLabel(src) {
    var ext = (src.split(".").pop() || "").toUpperCase();
    if (ext === "GIF") return "ANIMATED · LOOP";
    if (ext === "MP4") return "H.264 · MP4";
    return ext + " · still";
  }
  function closeLightbox() {
    var v = $("#lb-stage video");
    if (v) { try { v.pause(); } catch (e) {} }
    $("#lb-stage").innerHTML = "";
    $("#lightbox").classList.remove("on");
    document.body.style.overflow = "";
  }

  /* --------------------------------------------------------------- render */
  function build() {
    renderHero();
    renderNav();

    // steps are rendered first so allTaskIds is complete before the ring runs
    var html = renderQuickstart() + renderPipeline();
    (W.steps || []).forEach(function (s, i) { html += renderStep(s, i, W.steps.length); });
    html += renderAppendix();
    $("#content").innerHTML = html;
    renderFooter();

    wireMediaFallbacks();
    wirePrompts();
    wireTasks();
    wireNav();
    wireMisc();
    restoreChecks();
    onScroll();
  }

  /* --------------------------------------------------------- wire: prompts */
  function wirePrompts() {
    $$(".prompt").forEach(function (block) {
      var variants = [];
      try { variants = JSON.parse($("[data-variants]", block).innerHTML); } catch (e) { variants = []; }
      block._variants = variants;
      var cur = variants[0];

      function paint(v) {
        cur = v;
        $("[data-code]", block).innerHTML = rich(v.text);
        var meta = $("[data-meta]", block);
        meta.innerHTML =
          "<b>" + esc(v.name) + "</b><span class=\"dot\"></span>" +
          "<span>Use · " + esc(v.use || "General") + "</span><span class=\"dot\"></span>" +
          "<span>Output · " + esc(v.out || "—") + "</span>" +
          (v.note ? "<span class=\"dot\"></span><span>" + esc(v.note) + "</span>" : "");
        $$(".vbtn", block).forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-key") === v.key);
        });
      }
      block._paint = paint;
      paint(cur);

      $$(".vbtn", block).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var v = variants.filter(function (x) { return x.key === btn.getAttribute("data-key"); })[0];
          if (!v) return;
          paint(v);
          copyText(v.text).then(function (ok) {
            if (!ok) { toast("<b>Copy failed</b> · select the code block manually", 2400); return; }
            btn.classList.add("copied");
            setTimeout(function () { btn.classList.remove("copied"); }, 900);
            toast(I.check + " <span>Copied to clipboard ·</span><span class=\"k\">" + esc(v.key) + "</span><span>" + esc(v.name) + "</span>", 2000);
          });
        });
      });

      $("[data-copy-all]", block).addEventListener("click", function () {
        var btn = this;
        copyText(cur.text).then(function (ok) {
          if (!ok) { toast("<b>Copy failed</b> · select the code block manually", 2400); return; }
          btn.classList.add("ok");
          setTimeout(function () { btn.classList.remove("ok"); }, 1100);
          toast(I.check + " <span>Copied ·</span><span class=\"k\">" + esc(cur.key) + "</span><span>" + esc(cur.name) + "</span>");
        });
      });

      var ex = $("[data-toggle-expand]", block);
      ex.addEventListener("click", function () {
        var pre = $("[data-code]", block);
        var open = pre.classList.toggle("expanded");
        ex.textContent = open ? "Collapse" : "Expand all";
      });
    });
  }

  /* ----------------------------------------------------------- wire: tasks */
  function wireTasks() {
    $$(".task").forEach(function (lab) {
      lab.addEventListener("change", function () {
        var id = lab.getAttribute("data-task");
        var cb = $("input", lab);
        if (cb.checked) done[id] = 1; else delete done[id];
        saveDone();
        updateRing();
      });
    });
  }
  function restoreChecks() {
    $$(".task").forEach(function (lab) {
      var id = lab.getAttribute("data-task");
      $("input", lab).checked = !!done[id];
    });
    updateRing();
  }

  /* ------------------------------------------------------------- wire: nav */
  function wireNav() {
    document.addEventListener("click", function (e) {
      var jump = e.target.closest("[data-jump]");
      if (jump) {
        e.preventDefault();
        var t = jump.getAttribute("data-jump");
        scrollToId(t);
        document.body.classList.remove("drawer-open");
        return;
      }
      var link = e.target.closest(".side-link, .toc-chip");
      if (link) {
        e.preventDefault();
        scrollToId(link.getAttribute("data-target"));
        document.body.classList.remove("drawer-open");
      }
    });

    $("#drawer-btn").addEventListener("click", function () {
      document.body.classList.toggle("drawer-open");
    });
    $("#lightbox").addEventListener("click", function (e) {
      if (e.target === this || e.target.closest(".close")) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeLightbox();
        document.body.classList.remove("drawer-open");
      }
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        var s = $("#search-input");
        if (s) s.focus();
      }
    });

    // media cards
    document.addEventListener("click", function (e) {
      var card = e.target.closest(".media");
      if (!card) return;
      if (card.getAttribute("data-missing") === "1") {
        toast(I.alert + " <span>Nothing at this slot yet · add <b class=\"mono\">" + esc(card.getAttribute("data-file")) + "</b></span>", 3200);
        return;
      }
      openLightbox(card);
    });

    // accordion
    $$(".acc-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.parentNode;
        var body = $(".acc-a", item);
        var open = item.classList.contains("open");
        if (open) { body.style.maxHeight = "0"; item.classList.remove("open"); }
        else {
          body.style.maxHeight = body.scrollHeight + 40 + "px";
          item.classList.add("open");
        }
      });
    });

    // search
    var input = $("#search-input");
    if (input) {
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        var hit = 0;
        $$(".side-link").forEach(function (a) {
          if (a.classList.contains("sub")) return;
          var m = !q || a.textContent.toLowerCase().indexOf(q) > -1;
          a.classList.toggle("hidden", !m);
          if (m && q) hit++;
        });
        $$(".toc-chip").forEach(function (c) {
          c.style.display = !q || c.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
        });
        $$(".side-label").forEach(function () {});
        $("#search-hint").textContent = q ? (hit ? hit + (hit === 1 ? " match · Enter to jump" : " matches · Enter to jump") : "No match") : "";
      });
      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        var first = $$(".side-link").filter(function (a) {
          return !a.classList.contains("hidden") && a.textContent.toLowerCase().indexOf(input.value.trim().toLowerCase()) > -1;
        })[0];
        if (first) {
          scrollToId(first.getAttribute("data-target"));
          document.body.classList.remove("drawer-open");
        } else toast(I.alert + " <span>No matching section</span>");
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function wireMisc() {
    $("#to-top").addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------- wire: media watchers */
  function wireMediaFallbacks() {
    $$(".media").forEach(function (card) {
      var frame = $("[data-frame]", card);
      var type = card.getAttribute("data-type");
      var src = card.getAttribute("data-src");
      var el = $("[data-media]", frame);

      function fail() {
        if (card.getAttribute("data-missing") === "1") return;
        card.setAttribute("data-missing", "1");
        var poster = card.getAttribute("data-poster");
        var file = card.getAttribute("data-file") || src;
        if (poster) {
          // with a poster: show the poster plus a hint strip — closer to the real thing than a bare slot
          frame.innerHTML = '<img class="thumb" src="' + esc(poster) + '" alt="">' +
            '<span class="ph-tag">Video file pending · ' + esc(file) + "</span>";
          var pimg = frame.querySelector("img.thumb");
          // if even the poster is missing, fall back to a clean slot so nothing renders as a broken image
          pimg.addEventListener("error", function () {
            frame.innerHTML = placeholderHTML(type, file);
          });
        } else {
          frame.innerHTML = placeholderHTML(type, file);
        }
      }

      if (!el) { fail(); return; }
      if (type === "video") {
        var settled = false;
        el.addEventListener("loadedmetadata", function () { settled = true; });
        el.addEventListener("error", function () { if (!settled) fail(); });
        setTimeout(function () { if (!settled) fail(); }, 2600);
      } else {
        el.addEventListener("error", fail);
        if (el.complete && el.naturalWidth === 0) fail();
      }
    });
  }

  /* ------------------------------------------------------------------ boot */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
