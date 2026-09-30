/* ============================================================================
   step-6.js — 06 Workflow Documentation & Final Presentation
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-6",
    n: "06",
    title: "Workflow Documentation & Final Presentation",
    short: "Delivery",
    en: "Document · Storyboard · Render · Publish",
    stage: "DELIVERY",
    purpose: "<strong>Document the whole AI-assisted environment art pipeline</strong> from concept generation through to the finished scene, then <strong>present</strong> that final environment through cinematic rendering and camera work. Whether the work gets seen is half decided here.",
    duration: "2–4 days",
    difficulty: "Medium — completeness and delivery are what count",
    inputs: ["Raw process material (screenshots / recordings / parameters)", "The visually unified level", "Storyboard and camera design"],
    outputs: ["A complete workflow document (text + images + video)", "The finished film (Sequence render)", "Stills and animated GIF set", "Archived project and parameter pack"],
    tools: ["UE5 Sequencer / Movie Render Queue", "DaVinci Resolve / Premiere", "Photoshop", "This wiki system"],
    pipe: { out: "Film + full process document", tool: "MRQ · Resolve" },

    intro: [
      "The document and the film serve <strong>two different audiences</strong>: the document proves your method (to peers, to interviewers, to members) and the film proves your result (to players, to clients). You need both — but do not build them in the same sitting.",
      "The single most important discipline: <strong>collect process material while you work</strong>. Come back afterwards to gather screenshots and you cannot — the parameters are forgotten, the intermediate versions deleted, the failed attempts unrecorded. Get into the habit of saving one “key state screenshot + parameter line” at the end of every sub-step, and this step becomes ten times easier."
    ],

    substeps: [
      {
        id: "6.1",
        title: "Write the complete workflow document",
        detail: "The structure has to be followable: goal → inputs → steps → key parameters → common problems → acceptance criteria. Every step carries copyable prompts and the real parameter values.",
        tasks: [
          "Lay out the document across the six steps, four parts each: purpose / actions / parameters / acceptance",
          "Organise the prompt library: A–E variants per block with the situation each is for (exactly the structure of this wiki)",
          "Add the failure log: what you tried that did not work and why (this section is worth the most)",
          "Check reproducibility: could someone else reach your result from this document alone"
        ]
      },
      {
        id: "6.2",
        title: "Standardise the media specs",
        detail: "Screenshots, recordings and GIFs need consistent specs, or dozens of assets assembled together look cheap. Fix resolution, aspect, naming and annotation style here.",
        tasks: [
          "Stills: {{2560×1440}} / 16:9 / UI hidden / locked resolution and exposure",
          "Recordings: {{60fps}}, with click and keypress highlighting, each clip kept to 3–6 minutes",
          "GIFs: {{800px wide}}, {{≤8 seconds}}, {{≤3MB}} — keep only the single most important technical action",
          "Naming: {{step_content_version}} (e.g. 03_threeview_good_v2.gif), applied consistently"
        ]
      },
      {
        id: "6.3",
        title: "Cinematic rendering and camera work",
        detail: "Deliver the film with Sequencer plus Movie Render Queue. Camera movement is not showing off — it is <strong>introducing the space in order</strong>: establish wide → guide through mid → hold on detail.",
        tasks: [
          "Storyboard 6–10 shots, including one establishing shot, one detail close-up and one final held frame",
          "Output through Movie Render Queue: {{EXR/PNG sequence + high-sample anti-aliasing}}, with path tracing or high-quality Lumen settings",
          "Control the move speed: slow enough for the eye to finish reading the frame (roughly 2–4 seconds per piece of information)",
          "Composite in Resolve: unify the grade, add sound design and music, and keep the cut aligned to the pacing"
        ]
      },
      {
        id: "6.4",
        title: "Publish, archive and reuse",
        detail: "The point of archiving is that you can return to the exact state six months later: project, assets, parameters, prompts and dependency versions all packaged together.",
        tasks: [
          "Archive: the UE project (including .uproject / Content / plugin list), external asset source files, the prompt library, LUTs",
          "Record dependency versions: engine version, model versions, AI tool versions (all of which will have moved in six months)",
          "Publish: document + film + stills, re-sized per platform with the right lead image",
          "Retrospective: list the three things to change next time and put them into a “next steps” section of the document"
        ]
      }
    ],

    prompts: [
      {
        id: "s6p1",
        title: "Workflow document structure",
        icon: "book",
        note: "Have the model organise your process into something teachable, and find the steps and parameters you left out.",
        variants: [
          {
            key: "A",
            name: "Six-stage workflow outline",
            tag: "Primary",
            use: "When the document needs structure from scratch",
            out: "A teachable document outline",
            note: "Feed it your description of the process and let it produce a structure with acceptance points (this wiki came from exactly that)",
            text: `You are a technical documentation lead for game art. Turn my process description into a teachable, step-by-step workflow document.

My process: {{1) visual research + manual sketch + AI concept generation + manual selection; 2) UE5 blockout to fix AI perspective/scale errors; 3) style conversion, architectural component breakdown, three-view sheets, 3D generation (Tripo), manual retopo in Maya/ZBrush; 4) environment dressing; 5) material/lighting/post-process unification; 6) documentation and cinematic presentation.}}

For each of the 6 stages produce:
- GOAL in one sentence a beginner understands
- INPUTS (what must exist before starting)
- 4–6 numbered SUB-STEPS, each starting with a verb
- KEY PARAMETERS that must be recorded for reproducibility
- COMMON FAILURES with the symptom and the fix
- DEFINITION OF DONE (a checkable criterion, not a vibe)

Then add: a tool list with which tool is used where, a glossary of 12 terms I should define, and 8 questions a reader will ask that the document must answer.`
          },
          {
            key: "B",
            name: "Prompt library normalisation",
            tag: "Prompt",
            use: "When your prompts are scattered and need a system",
            out: "A structured prompt library",
            note: "Turns the whole prompt set into a maintainable asset in one pass",
            text: `Organize my scattered prompt collection for an AI-assisted environment art workflow into a maintainable library.

For each prompt I give you, return a normalized record:
- ID and NAME
- USE CASE (when to reach for it)
- STAGE (which of the 6 workflow stages)
- MODEL / TOOL ({{Midjourney / SD / ComfyUI / Tripo / vision model}})
- VARIABLE SLOTS — every {{placeholder}} with its expected format and an example value
- THE PROMPT, cleaned up
- EXPECTED OUTPUT
- FAILURE MODE and the negative list to add
- VARIANT FAMILY — what should be swapped to produce versions B, C, D, E

Then group them into families, flag duplicates and contradictions between prompts, and tell me which prompts are too vague to be reproducible.

My prompts: {{paste list}}`
          },
          {
            key: "C",
            name: "Tutorial video script",
            tag: "Video",
            use: "When the process becomes a tutorial video",
            out: "A recording script",
            note: "Writing the script before recording visibly cuts re-takes and filler",
            text: `Write a recording script for a {{10-minute}} tutorial video teaching {{step 3 of my workflow: converting concept art into 3D assets}}.

Structure:
- COLD OPEN (0:00–0:20): what the viewer will be able to do by the end, plus a 3-second result flash
- WHY IT MATTERS (0:20–1:00): the problem this step solves, stated with a concrete failure example
- DEMO (1:00–7:30): broken into 5–7 blocks, each with what is on screen, what I say (verbatim-friendly, short sentences), and the on-screen caption
- COMMON MISTAKES (7:30–9:00): 3 mistakes with the visible symptom on screen
- RECAP + NEXT (9:00–10:00)

Rules: no filler phrases, no "as you can see", every sentence must carry information. Mark where I should pause on screen for emphasis, and where a zoom-in is needed.`
          },
          {
            key: "D",
            name: "Reproducibility audit",
            tag: "QA",
            use: "Before delivery, to check someone else could follow it",
            out: "A gap list",
            note: "Simulates “another artist following the document” and surfaces every piece of hidden knowledge",
            text: `Act as a reviewer who must reproduce my workflow from the document alone, with no access to me.

Read the following documentation: {{paste doc summary}}. Then report:

1. MISSING ARTIFACTS — files, templates, LUTs, models, or presets the reader needs but that the document does not provide.
2. HIDDEN KNOWLEDGE — steps where I rely on unstated experience ("just fix the perspective") and a beginner would be stuck.
3. UNRECORDED PARAMETERS — every place where a number matters and no number is given.
4. VERSION DEPENDENCIES — anything that will break when {{the AI tool / engine version}} changes.
5. AMBIGUOUS LANGUAGE — sentences that can be read two ways, with a rewrite for each.
6. FIRST POINT OF FAILURE — where the reader will most likely give up, and what to add there.

Rank all findings by how badly they block reproduction. Be merciless — a document that needs me in the room is not a document.`
          }
        ]
      },
      {
        id: "s6p2",
        title: "Storyboard and camera design",
        icon: "film",
        note: "Shot design for the film. The job is to explain the space, not to show off.",
        variants: [
          {
            key: "A",
            name: "Establish → detail → hold (8 shots)",
            tag: "Primary",
            use: "For a 60–90 second portfolio film",
            out: "An 8-shot storyboard table",
            note: "The standard structure: information density climbs, then falls back, ending on a held frame",
            text: `Design an 8-shot cinematic sequence to present {{an abandoned alpine research station interior}} as a finished environment art piece. Target length {{75 seconds}}.

For each shot give: SHOT # | PURPOSE (establish / orient / guide / detail / emotion / resolve) | FRAMING (scale, height, angle) | CAMERA MOVE (static / slow push / lateral track / rise / handheld) | MOVE SPEED in approximate cm/s | LENS (mm) | DURATION | WHAT THE VIEWER LEARNS | TRANSITION TO NEXT

Constraints:
- Shot 1 must establish the whole space in a single readable frame.
- Include exactly one detail shot where the camera nearly stops (≤2 cm/s) so the viewer can read texture quality.
- Include one shot with foreground occlusion to prove depth.
- End on a static frame held for ≥3 s that could work as a portfolio thumbnail.
- No cuts on camera motion that reverses direction.

Then flag the two shots that are hardest to render and how to make them cheaper.`
          },
          {
            key: "B",
            name: "Single-take / long take design",
            tag: "Long take",
            use: "When you want a demanding continuous move",
            out: "A single-shot camera path",
            note: "A long take best demonstrates spatial coherence, but exposure and pacing are hardest to control",
            text: `Design a single unbroken camera move through {{a fishing village on stone terraces}}, {{40 seconds}}, no cuts.

Provide:
1. PATH — a step-by-step route with positions described relative to landmarks, and whether the camera height changes (walk height, rise, descend).
2. SPEED PROFILE — a table of time vs speed, marking where the camera slows down for information and where it accelerates through dead space.
3. FRAMING STOPS — 3 moments where the composition must land on a deliberate frame (name what sits where in the frame at that moment).
4. OCCLUSION EVENTS — where the camera passes behind geometry, and how to use it as a natural transition.
5. EXPOSURE RISK — where the dynamic range will blow out (passing from shadow into sky) and how to handle it (baking exposure, manual EV, local grade).
6. FALLBACK — how to split this into 3 shots with straight cuts if the single move proves too hard to render.`
          },
          {
            key: "C",
            name: "Cinematic render settings and QA",
            tag: "Render",
            use: "When you are about to render the final deliverable",
            out: "MRQ settings + QA sheet",
            note: "Wrong render settings mean a full re-run — run this list before you queue it",
            text: `Give me a Movie Render Queue configuration and a pre-render checklist for a {{cinematic environment showcase}} in Unreal Engine 5.

Configuration to specify:
- Output: {{EXR half-float sequence}} vs PNG — recommendation and why; also a delivery MP4 path
- Anti-aliasing: spatial/temporal sample counts, and how they trade against render time
- Rendering quality: Lumen / path tracer choice, GI samples, reflection quality, shadow settings
- Motion blur, depth of field, and whether to render them in-engine or in comp
- Console variables worth setting before a final render
- Thread and memory settings, plus a rough time estimate per frame for {{5 MP}} output

Pre-render checklist (each item with the failure it prevents): {{texture streaming at risk, Nanite fallback visibility, LOD transition popping on camera move, particle/foliage wind seeding inconsistency between render and viewport, exposure locking, camera clipping through geometry, UI/actors hidden, time-of-day consistency across shots}}.

End with: how to verify a single test frame before committing to the full render.`
          },
          {
            key: "D",
            name: "Portfolio presentation and copy",
            tag: "Publish",
            use: "When the work goes out into the world",
            out: "Publishing copy + layout advice",
            note: "The same work presented differently performs very differently",
            text: `Help me present this environment art piece ({{AI-assisted alpine station interior, 6-step workflow, real-time in UE5}}) for {{a portfolio page and an ArtStation post}}.

Deliver:
1. TITLE OPTIONS — 5 options, each under 8 words, none using "concept art" if it is a real-time render.
2. SHORT CAPTION — 2 sentences: what the space is and what the viewer is looking at.
3. PROCESS BLURB — 120 words describing the workflow honestly, including where AI was used and where manual work took over. Be specific and unapologetic about the tooling.
4. IMAGE SET — the 6 images to publish and in what order, with the text role of each (hero, scale, detail, process, lighting variant, comparison).
5. BREAKDOWN SECTION — a short list of technical facts worth stating (engine version, real-time status, tri count, texture budget, render settings).
6. WHAT NOT TO SAY — 5 phrases that weaken an environment art presentation and what to say instead.

Tone: professional, concrete, no hype, no inflated adjectives.`
          }
        ]
      }
    ],

    media: [
      {
        type: "video",
        title: "Final film · cinematic render (complete)",
        caption: "The 75-second piece out of Movie Render Queue, graded with sound design. This is the end product of the whole pipeline.",
        src: "assets/video/step6-final-cinematic.mp4",
        poster: "assets/video/step6-final-cinematic.jpg",
        dur: "01:15",
        file: "assets/video/step6-final-cinematic.mp4",
        wide: true
      },
      {
        type: "gif",
        title: "Storyboard pacing diagram",
        caption: "The 8-shot strip with its time allocation — the film's structure at a glance (6-second loop).",
        src: "assets/gifs/step6-storyboard-timing.gif",
        file: "assets/gifs/step6-storyboard-timing.gif"
      },
      {
        type: "image",
        title: "Document structure diagram",
        caption: "The information architecture of the document site (the page you are reading now).",
        src: "assets/images/step6-doc-structure.jpg",
        file: "assets/images/step6-doc-structure.jpg"
      },
      {
        type: "image",
        title: "Final still (hero shot)",
        caption: "The locked frame used for the portfolio cover and thumbnail.",
        src: "assets/images/step6-hero-shot.jpg",
        file: "assets/images/step6-hero-shot.jpg"
      }
    ],

    tips: [
      { title: "Collect process material as you go", text: "Save one key-state screenshot plus one line of parameters at the end of every sub-step. Come back later and you cannot reconstruct it." },
      { title: "Build document and film separately", text: "The document proves the method, the film proves the result. Build them together and both suffer." },
      { title: "Failure notes are worth the most", text: "“This does not work because…” is ten times more valuable to a reader than “this works well”. It also shows your depth." },
      { title: "Slow the camera down", text: "You are not bored by your own scene; your audience will be. Leave at least 2–4 seconds of readable information per shot." },
      { title: "Version everything on archive", text: "AI tools change every six months. Put model versions, parameters and dependencies into the archive or you will not be able to reproduce your own work." }
    ],
    pitfalls: [
      { title: "Remembering the material too late", text: "No capture along the way means re-running the entire pipeline to fill the gaps — an extremely high price." },
      { title: "A document that reads as a diary", text: "Without acceptance criteria and failure logs, readers give up halfway." },
      { title: "A film that is all showmanship", text: "Fast rotations and constant cuts leave the audience remembering nothing about the space." },
      { title: "No tool versions recorded", text: "Six months on you cannot reproduce your own work — the most common archiving failure there is." }
    ],
    checkpoint: "A complete workflow document someone else can follow (including the prompt library and the failure log); consistent media specs; the film rendered with a unified grade; an archive containing the project, parameters and version information; and publishing copy that states accurately where AI ended and manual work began."
  });
})(window.WIKI);
