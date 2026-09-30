/* ============================================================================
   99-appendix.js — toolchain / media manifest / POC evidence / FAQ / changelog
   Source: Final Project Process Book; Sprint 2 – Proof of Concept (A4 v3)
   ========================================================================== */
(function (W) {
  W.appendix = {
    title: "Appendix · toolchain, media manifest and evidence",
    tools: {
      title: "Toolchain at a glance",
      items: [
        { name: "Procreate (iPad)", stage: "STEP 01", use: "Hand-drawn concept sketches. These are the composition source for every generation downstream — the road layout and the building count are fixed here, by hand." },
        { name: "TapNow", stage: "STEP 01 · 03", use: "The prompt platform. Its advantage is accepting reference images directly inside the prompt, which makes the specification precise and lets you write in natural language. It cannot queue multiple jobs, which was an acceptable trade." },
        { name: "Banana 2", stage: "STEP 01 · 03", use: "Image model. Won the head-to-head against GPT Image2 for concept art from a sketch and for component decomposition sheets. The default for both." },
        { name: "GPT Image2", stage: "STEP 03", use: "Image model. Best at briefs phrased as “3D asset showcase image for a AAA game”, so it handles building separation and the reference-image style transfer." },
        { name: "Gemini 3.1 Flash Lite", stage: "STEP 01 · 03", use: "Text model, used for describing target-game material style in game-art terminology and for auditing reference sheets before they are uploaded to a 3D platform." },
        { name: "Running Hub", stage: "STEP 01 (dropped)", use: "Batch image generation. Tried first and rejected: images in the same batch share a style, so one style drift fails the entire run however good the best output looks." },
        { name: "Tripo 3D", stage: "STEP 03", use: "Model generation, retopology, UV unwrapping and texturing in a single pass. Auto-generates multi-view references from the upload. Logged as the cheapest, most reliable stage in the pipeline." },
        { name: "Unreal Engine 5", stage: "STEP 02 · 03 · 04 · 05 · 06", use: "Reference planes with a parameterised master material, blockout, import and inspection of generated models, Blueprint assembly, lighting and delivery." },
        { name: "Reference-plane master material", stage: "STEP 02", use: "A project-side asset rather than a product: base colour and opacity exposed as parameters, colour texture multiplied by a scalar for brightness, one instance per reference plane." }
      ]
    },

    poc: {
      title: "Sprint 2 · Proof of Concept — the evidence behind steps 01–04",
      lead: "The proof of concept was a focused feasibility test, not an early version of the final environment. It targeted the single uncertainty that would have been most expensive to discover later, once the environment was already in production. Everything in steps 01–04 was written up from it.",
      question: [
        { k: "Risk", v: "The AI-assisted 3D asset pipeline may not be able to produce building components at a quality that can actually be used in the environment." },
        { k: "Question", v: "For the Lingnan arcade street scene, can AI generate one or two representative building components within a reasonable amount of time and cost, at a quality that allows them to be used directly in Unreal Engine?" },
        { k: "Why this one", v: "The asset pipeline carries the most uncertainty and the most schedule risk of anything in the project. If it holds, the rest of the production plan can proceed as written. If it does not, the plan has to change before Alpha begins." }
      ],
      boundary: [
        { k: "Inside the test", v: "A single representative component — an arcade column, a window or a wall panel — carried through the complete pipeline: hand-drawn sketch, AI concept art, AI style transfer, component decomposition, reference cropping and grouping, Tripo generation, and import into Unreal Engine. Each stage judged on silhouette accuracy, topology, UV layout, polygon count and consistency with the target art style." },
        { k: "Outside the test", v: "Full buildings, the complete street, material authoring, lighting, performance optimisation and the full set of building variants. These belong to Alpha and Beta and were deliberately excluded — testing them now would not have changed the decision this POC had to support." },
        { k: "Why it was run twice", v: "The first pass established whether the pipeline could work at all. The second reproduced it under closer to production conditions — a larger building, a more precise reference set — to check the results were repeatable rather than a one-off." }
      ],
      criteriaTitle: "Decision criteria (fixed before the results were read)",
      criteriaCols: ["Outcome", "Definition"],
      criteriaRows: [
        ["Validated", "The model imports cleanly, its topology and UVs are usable, the silhouette matches the source, the style is consistent with the target, and cleanup stays within roughly thirty minutes per component."],
        ["Partially validated", "The model is usable, but only under specific conditions such as better reference cropping or prompt tuning — or the result needs a second focused test before it can be trusted."],
        ["Invalidated", "The model needs a major rebuild, the AI misreads the structure, or cleanup takes longer than modelling the component by hand."],
        ["Inconclusive", "The results are mixed and do not provide enough trustworthy evidence for a decision, so the remaining work has to be defined and the test repeated."]
      ],
      logTitle: "Logged results — every stage is timed, counted and costed",
      logCols: ["#", "Stage", "Test pass", "Evidence pass", "Model"],
      logRows: [
        ["1", "Prepare hand-drawn sketches", "40 min · manual", "40 min · manual", "Procreate"],
        ["2", "Sketch → concept art", "16 min · 4 iter · 36 tapies", "5 min · 2 iter · 18 tapies", "Banana 2"],
        ["3", "Style transfer with keywords", "42 min · 14 iter · 275 tapies", "5 min · 2 iter · 38 tapies", "GPT Image2 · Gemini 3.1"],
        ["4", "Separate buildings into units", "25 min · 8 iter · 139 tapies", "20 min · 5 iter · 95 tapies", "GPT Image2"],
        ["5", "Break building into components", "20 min · 6 iter · 54 tapies", "15 min · 4 iter · 36 tapies", "Banana 2"],
        ["6", "Crop and group reference sheets", "25 min · 3 iter · 42 tapies", "30 min · 4 iter · 56 tapies", "Banana 2"],
        ["7", "Generate 3D models in Tripo", "10 min · 1 iter · 135 tapies", "11 min · 2 iter · 135 tapies", "Tripo 3D"],
        ["8", "Inspection in Unreal Engine", "not logged", "not logged", "UE5"]
      ],
      logTotal: "Both passes together: ~5 h 4 m of logged work · 55 iterations · 1,059 tapies (≈ $10.59) in generation cost. Costs are the platform's own units; the tapie figures are the platform's stated US dollar equivalent.",
      interpretation: [
        "<strong>The workflow is fundamentally viable.</strong> Concept art generation and AI-driven 3D asset creation both proceed smoothly: in Tripo, modelling, retopology, UV unwrapping and texturing complete in a single pass, and the resulting models hold their silhouette and materials well enough to be used.",
        "<strong>The weakness sits in the middle of the pipeline.</strong> Decomposition is the least reliable stage: the models still struggle to break a large architectural structure into components faithfully, and they consistently produce components that were not in the original building. The constraints that matter most — non-overlap and exact part counts — are the ones the AI models follow least reliably, and the workaround is prompt hygiene rather than a structural fix. This stage also absorbed the most iterations in both passes.",
        "Overall the issues identified are acceptable and have clear paths for improvement, which confirms the hypothesis behind the proof of concept."
      ],
      decisionTitle: "Decision",
      decision: "Result: <strong>validated, with a scope adjustment.</strong> The visual direction holds, the pipeline produces usable assets, and the strongest part of the workflow — 3D generation in Tripo — is also the cheapest and the most reliable. The project continues into Alpha as planned.",
      decision2: "The proof of concept also confirmed the risks identified in the proposal, and that part of the result matters as much as the validation. AI generation quality and iteration time are unpredictable, and decomposition in particular may cost more time and money than the schedule allows for. Because of that, the project proceeds with one deliberate scope adjustment.",
      scopeTitle: "What changed",
      scopeRows: [
        ["Unchanged", "Environment size: a medium-scale arcade street around a central intersection, with three to four main storefront units."],
        ["Reduced", "The variety of building types to be generated. Repetition is managed through editing rather than through new assets — varying the placement angle of modules and adjusting texture colours — so the reduced variety is not visually obvious. Reasonable for a city block, where not every facade of a building is visible at once."],
        ["Backlog", "Add a variation pass covering module placement angles and texture colours, and consolidate the reusable component library."],
        ["Milestones", "Alpha and Beta unchanged. The asset generation milestone now carries an explicit iteration buffer for the decomposition stage."],
        ["Risk", "Schedule risk remains active, now bounded by the variation-reduction trigger. No further contingency required at this stage."],
        ["Next step", "Enter Alpha with the reduced building variety, and re-check iteration cost at the midpoint of asset generation before the environment dressing phase begins."]
      ]
    },

    manifest: {
      title: "Media manifest (drop the file at the path and it appears)",
      lead: "Every still below is a real figure extracted from the two source documents by <code>tools/extract_canva_images.py</code>. The video slots are still open — they are the recordings still to be made. Put a file at the matching path under <code>assets/</code> (or edit <code>src</code> in <code>content/*.js</code>) and the page swaps out its placeholder state automatically, with no CSS or logic changes.",
      cols: ["Step", "File path", "Type", "Source / purpose"],
      rows: [
        ["STEP 01", "assets/images/step1-sketch-sheet.jpg", "Still", "Process Book §01 — three hand-drawn concept sketches (Procreate)"],
        ["STEP 01", "assets/images/step1-concept-banana2.jpg", "Still", "POC 5.2.2 — concept art generated from the sketch (Banana 2)"],
        ["STEP 01", "assets/images/step1-runninghub-batch.jpg", "Still", "Process Book §01 — Running Hub batch view, the tool that was dropped"],
        ["STEP 01", "assets/images/step1-concept-evidence.jpg", "Still", "POC 6.1.2 — evidence-pass concept art and its references"],
        ["STEP 01", "assets/images/step1-sketch-evidence.jpg", "Still", "POC 6.1.1 — evidence-pass hand-drawn sketch"],
        ["STEP 01", "assets/video/step1-full-walkthrough.mp4", "Video", "Open slot · Procreate → TapNow → selection · suggest 1080p60 / ≤15 min"],
        ["STEP 02", "assets/images/step2-reference-plane-ue.jpg", "Still", "Process Book §02 — concept art as a reference plane in UE"],
        ["STEP 02", "assets/images/step2-refplane-material.jpg", "Still", "Process Book §02 — reference-plane master material graph"],
        ["STEP 02", "assets/images/step2-blockout-pass.jpg", "Still", "Process Book §02 — blockout pass and adjustments, four stages"],
        ["STEP 02", "assets/video/step2-blockout-timelapse.mp4", "Video", "Open slot · reference plane → massing → scale correction · silent is fine"],
        ["STEP 03", "assets/images/step3-style-variants.jpg", "Still", "Process Book §03 — the two style-transfer methods that failed"],
        ["STEP 03", "assets/images/step3-style-description.jpg", "Still", "Process Book §03 — asking the AI to describe the target style"],
        ["STEP 03", "assets/images/step3-style-transfer-result.jpg", "Still", "Process Book §03 — style transfer after keyword compression"],
        ["STEP 03", "assets/images/step3-style-before-after.jpg", "Still", "POC 6.1.3 — concept art and stylized scene side by side"],
        ["STEP 03", "assets/images/step3-building-separation.jpg", "Still", "POC 5.2.4 — buildings separated into five individual units"],
        ["STEP 03", "assets/images/step3-decomposition-sheet.jpg", "Still", "Process Book §03 — buildings and their component breakdown"],
        ["STEP 03", "assets/images/step3-component-breakdown.jpg", "Still", "POC 5.2.5 — the building reduced to structural components"],
        ["STEP 03", "assets/images/step3-component-extract.jpg", "Still", "Process Book §03 — components cropped at full resolution"],
        ["STEP 03", "assets/images/step3-trimmed-components.jpg", "Still", "POC 5.2.6 — cropped components with their source filenames"],
        ["STEP 03", "assets/images/step3-reference-grouping.jpg", "Still", "POC 5.2.6 — similar parts grouped onto one reference sheet"],
        ["STEP 03", "assets/images/step3-wall-sheets.jpg", "Still", "POC 6.1.6 — wall sheets after the prompt-hygiene fix"],
        ["STEP 03", "assets/images/step3-tripo-window.jpg", "Still", "Process Book §03 — Tripo generating the window model in one pass"],
        ["STEP 03", "assets/images/step3-tripo-multiview.jpg", "Still", "Process Book §03 — Tripo's automatic multi-view generation"],
        ["STEP 03", "assets/images/step3-tripo-components.jpg", "Still", "Process Book §03 — generated components beside their reference"],
        ["STEP 03", "assets/images/step3-tripo-four-angles.jpg", "Still", "POC 5.2.7 — test-pass model from four angles after one run"],
        ["STEP 03", "assets/images/step3-tripo-banner.jpg", "Still", "POC 6.1.7 — evidence-pass model from four angles"],
        ["STEP 03", "assets/images/step3-ue-inspection.jpg", "Still", "POC 5.2.8 — the model inspected in Unreal Engine"],
        ["STEP 03", "assets/images/step3-topology-stats.jpg", "Still", "POC 5.2.8 — accepted topology: 9,458 faces / 9,198 vertices"],
        ["STEP 03", "assets/video/step3-decompose-workflow.mp4", "Video", "Open slot · the 6-stage asset pipeline, with the click path"],
        ["STEP 04", "assets/images/step4-building-blockout.jpg", "Still", "Process Book §04 — the building blocked out inside the assembly"],
        ["STEP 04", "assets/images/step4-components-assembly.jpg", "Still", "Process Book §04 — components assembled onto the building"],
        ["STEP 04", "assets/video/step4-dressing-walkthrough.mp4", "Video", "Open slot · Blueprint assembly, placement, repetition edit · narrated"],
        ["STEP 05", "assets/images/step5-atmosphere-variants.jpg", "Still", "Placeholder — waiting on the look-dev pass"],
        ["STEP 05", "assets/video/step5-lookdev.mp4", "Video", "Placeholder — look-dev walkthrough"],
        ["STEP 06", "assets/images/step6-hero-shot.jpg", "Still", "Placeholder — final hero shot"],
        ["STEP 06", "assets/images/step6-doc-structure.jpg", "Still", "Placeholder — document structure"],
        ["STEP 06", "assets/video/step6-final-cinematic.mp4", "Video", "Placeholder — final walkthrough film"]
      ]
    },

    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Where did the content in steps 01–04 come from?",
          a: "From two working documents: the <strong>Final Project Process Book</strong> (sections 01–04) and <strong>Sprint 2 – Proof of Concept (A4 v3)</strong>, which logs all eight pipeline stages across a test pass and an evidence pass. The text is a write-up of what those documents record; the figures are cropped out of them by <code>tools/extract_canva_images.py</code> so they can be re-extracted whenever the source documents change."
        },
        {
          q: "Why are steps 05 and 06 still placeholders?",
          a: "Because the source documents do not cover them yet — the proof of concept stopped at asset generation, and look dev and delivery are Alpha and Beta work. They are left in their placeholder state deliberately rather than filled with invented content, so it stays obvious which parts of this wiki are backed by evidence and which are not."
        },
        {
          q: "The tabular data shows costs in 'tapies'. What are those?",
          a: "The generation platform's own credit unit. The documents record both the tapie figure and its US dollar equivalent, so both are kept here — the tapies are the primary record, the dollars are the platform's own conversion. All eight logged stages together come to about $10.59 across both passes."
        },
        {
          q: "How do the A–E prompt variants work? Does clicking really copy?",
          a: "Yes. <strong>Clicking any A–E option copies that variant into your clipboard immediately</strong>, switches the code block and fires a confirmation toast. Copying has two layers: the Clipboard API first, and if the browser disables it (local <code>file://</code> contexts, for example) it falls back to <code>execCommand</code> — so opening the HTML locally still copies. Most variants in steps 01–03 are the prompts that were actually run, not tidy rewrites — several carry their iteration count and cost in the note."
        },
        {
          q: "How do I add a step or a section?",
          a: "Content and code are fully separated. Copy <code>src/content/step-6.js</code> to <code>step-7.js</code>, change <code>id / n / title</code> and the content, then rebuild.<strong>The top jump bar, the left rail, the pipeline cards and the progress ring all pick up the new step automatically</strong> — because the pipeline cards are derived from each step's <code>pipe</code> field."
        },
        {
          q: "Where is progress stored? Does it sync across devices?",
          a: "In <strong>the browser's localStorage on this machine</strong> — it does not sync. Syncing progress across a team or a membership needs a thin backend (a simple account plus a progress endpoint). This build deliberately stays backend-free so it can sit on static hosting, or run by double-clicking the HTML."
        },
        {
          q: "Does it work on mobile?",
          a: "Yes. On narrow screens the pinned left rail becomes a floating button in the bottom-right corner that opens a drawer, and the top jump bar scrolls horizontally. Tabular content (the manifest and the POC log) scrolls sideways rather than squashing."
        },
        {
          q: "How do I publish it?",
          a: "The build output is a single <code>index.html</code> (styles and logic inlined). Upload it together with the <code>assets/</code> directory to any static host: object storage, Nginx, Netlify, Vercel or GitHub Pages.<strong>Make sure the relative <code>assets/</code> path goes up with it</strong>, or the media slots will show their placeholder state."
        }
      ]
    },

    changelog: {
      title: "Changelog",
      rows: [
        { d: "2026-09-23", t: "v0.1 · placeholder content build", c: "Single-page app shell: top jump bar, pinned left rail, A–E prompt selector with auto-copy, media gallery and lightbox, checkable task progress. Six steps plus appendix filled with sample content; media slots in placeholder state." },
        { d: "2026-09-23", t: "v0.1.1 · full English pass", c: "All interface copy and step content converted to English. The left rail changed from a sticky element that faded in after the hero to a permanently fixed rail that stays pinned for the whole scroll." },
        { d: "2026-09-23", t: "v0.1.2 · navigation and scroll fixes", c: "Three real-input defects fixed: TOC jumps stopping at section boundaries, the left rail swallowing wheel events, and the search box dragging the page upward on every keystroke. Regression suite added as tools/qa_nav.mjs." },
        { d: "2026-09-30", t: "v0.2 · real content for steps 01–04", c: "Steps 01–04 rewritten from the Final Project Process Book and the Sprint 2 proof of concept, with the real prompt variants, the logged timings, iteration counts and generation costs, and 28 source figures extracted into assets/images/. Appendix gains a POC evidence block: the feasibility question, the four decision criteria, the full eight-stage log for both passes, and the resulting scope adjustment." },
        { d: "—", t: "v0.3 · look dev and delivery (todo)", c: "Steps 05–06 are still placeholder content. They need the Alpha and Beta look-dev and delivery passes before they can be written up the same way." },
        { d: "—", t: "v0.4 · membership layer (todo)", c: "For tiered access, add a lightweight password gate or a real account layer; a bilingual build is also a straightforward addition from the separated content files." }
      ]
    },
    note: "<b>About this page</b>: steps 01–04 and the POC block are written up from the project's own working documents, and the figures are extracted from them — nothing in those sections is invented. Steps 05–06 remain <strong>placeholder examples</strong> used to validate the information hierarchy and the interactions. Every media slot shows a placeholder state until a real file is present, and nothing errors. See the manifest above and <code>README.md</code> for the extraction workflow."
  };
})(window.WIKI);
