/* ============================================================================
   step-1.js — 01 Visual Research & Concept Development
   Source: Final Project Process Book §01; Sprint 2 POC §5.2.1–5.2.2, §6.1.1–6.1.2
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-1",
    n: "01",
    title: "Visual Research & Concept Development",
    short: "Concept",
    en: "Sketch · Reference · AI concept · Lock",
    stage: "PRE-PRODUCTION",
    purpose: "Fix the design intent <strong>by hand</strong> before any model touches it. Draw the street in Procreate, collect the two reference sets it needs — what the place really looks like, and what the target style looks like — then let AI turn the sketch into a concept frame. Treat that frame as a guide, never as a blueprint.",
    duration: "1–2 days",
    difficulty: "Low effort, high leverage — the sketch is what keeps every later stage honest",
    inputs: ["Guangzhou qilou street references (Beijing Road Pedestrian Street)", "Real photographs of arcade streets", "Target-game screenshots for the visual style", "iPad + Procreate"],
    outputs: ["Hand-drawn street sketch (composition locked)", "AI scene concept art", "A written note on which parts of the concept frame cannot be trusted"],
    tools: ["Procreate (iPad)", "TapNow — Banana 2, GPT Image2, Gemini 3.1 Flash Lite", "Running Hub (compared, then dropped)"],
    pipe: { out: "Hand sketch + AI concept art", tool: "Procreate · TapNow" },

    intro: [
      "The order in this step is not a preference, it is the whole point: <strong>draw first, generate second</strong>. The sketch locks the road layout, the number of buildings along the street and where the eye travels — decisions that belong to a designer, not to an image model. Hand that frame to AI as an input and you get a rendering of your own composition. Skip it and you get an attractive image you did not design, which you will then have to reverse-engineer back into a layout during blockout.",
      "The second thing this step produces is not an image at all: it is <strong>a list of what the concept frame got wrong</strong>. AI concept art of a street is unreliable about perspective and about real-world dimensions. Recorded here, those errors are cheap. Discovered in step 02, they cost you a rebuild — so this step ends by annotating the frame with exactly what blockout must not trust."
    ],

    substeps: [
      {
        id: "1.1",
        title: "Hand-draw the street in Procreate",
        detail: "Manual work: <strong>40 minutes, no iterations, no generation cost</strong>. Drawn on an iPad over Guangzhou's arcade (<code>qilou</code>) streets, specifically Beijing Road Pedestrian Street. The sketch fixes the road layout and the number of buildings along the street — the two things every later stage has to respect. A larger building was fixed at the centre of the street for the evidence pass, so the same sketch could be pushed through the pipeline twice under different conditions.",
        tasks: [
          "Draw the road layout and building count to scale enough that blockout can measure off it",
          "Mark the view the hero shot will use, and where the street opens up",
          "Sketch 2–3 views of the same street rather than one — one view hides composition errors",
          "Export at high resolution; this sheet is the input to every generation in this step"
        ]
      },
      {
        id: "1.2",
        title: "Collect the two reference sets — and keep them apart",
        detail: "Concept generation needs two different kinds of image, and mixing them is a real failure mode. Set one is <strong>real photographs of qilou streets</strong>: what the buildings actually are — the covered walkway along the ground floor, the shop signage, the balcony depth. Set two is <strong>target-game screenshots</strong>: what the finished render should feel like. Screenshots are the wrong source for architecture; trust them for material and light only.",
        tasks: [
          "Collect real photographs of qilou streets as architectural reference",
          "Collect target-game screenshots separately as style reference",
          "Tag each image with which set it belongs to — the prompt tells the model which is which",
          "Write down the target style in a few words before generating anything (see 3.1 for why)"
        ]
      },
      {
        id: "1.3",
        title: "Choose the generation tool by how it fails",
        detail: "Running Hub was tried first: it can run many generation tasks at once, which looks like an advantage. It is not, because <strong>images produced within the same batch share a style</strong>. When the model's reading of the style drifts, every image in that batch fails together. TapNow replaced it because it accepts <strong>reference images directly inside the prompt</strong>, which makes the specification both more precise and more natural to write. Its cost is that it cannot queue multiple jobs. On models, GPT Image2 and Banana 2 were compared side by side; <strong>Banana 2 produced better results</strong> and was used throughout.",
        tasks: [
          "Test both tools on the same sketch with the same prompt before committing",
          "Judge batch tools by their worst image, not their best — one style drift invalidates the run",
          "Run GPT Image2 and Banana 2 on identical inputs and keep the comparison",
          "Keep every raw output with its parameters; you will need to reproduce the winning run"
        ]
      },
      {
        id: "1.4",
        title: "Generate the concept art from the sketch",
        detail: "The sketch goes in as the composition source, and the model is asked to <strong>correct perspective without altering the composition or the road layout</strong> — that constraint is what keeps the output usable. Most image models return a result in about two minutes; the <strong>16 minutes</strong> logged in the test pass went to prompt tuning and switching between models, not to rendering. <strong>Logged: 16 min · 4 iterations · 36 tapies (≈ $0.36) · Banana 2.</strong> The evidence pass reproduced it in <strong>5 min · 2 iterations · 18 tapies (≈ $0.18)</strong> once the prompt was settled — which is the number to budget from.",
        tasks: [
          "Feed sketch + both reference sets in one prompt, with the sketch explicitly first",
          "State the road layout as unchangeable, in words, in the prompt",
          "Change one variable per run (perspective handling only, then style only)",
          "Export and archive all candidates, not just the one you pick"
        ]
      },
      {
        id: "1.5",
        title: "Select the frame and mark what not to trust",
        detail: "Selection is a hand decision, judged on four things: is the space readable, are the proportions plausible, is the qilou material used correctly, and will it survive production. Then annotate the chosen frame with its <strong>must-fix list</strong> — perspective errors, implausible massing, floating structure, detail that cannot be built. This list is the deliverable that step 02 actually uses.",
        tasks: [
          "Pick one primary locked frame plus one alternate direction",
          "Annotate it: every perspective error and every dimension that cannot be trusted",
          "Flag anything the model invented that is not in the sketch or the references",
          "Hand off: locked frame + sketch + reference sets + must-fix list → step 02"
        ]
      }
    ],

    prompts: [
      {
        id: "s1p1",
        title: "Sketch → scene concept art (Banana 2)",
        icon: "sparkles",
        note: "The two prompts below are the ones actually run for the test and evidence passes — variant A and variant B. Variants C and D are the same structure rewritten for other settings, so the block stays reusable. Anything in {{}} is a variable; replace it with your own image slots or subject.",
        variants: [
          {
            key: "A",
            name: "Test pass — perspective correction",
            tag: "Verified",
            use: "First pass on a new scene; the sketch defines the composition",
            out: "One concept frame that keeps your road layout",
            note: "This is the prompt that produced the test-pass frame shown in this step. 4 iterations, 36 tapies",
            text: `I need you to generate a concept reference image for a game scene. {{Image 5}} is a sketch of the scene, depicting a street lined with Guangzhou-style arcade buildings (qilou). {{Image 2}}, {{Image 3}}, and {{Image 4}} show what these streets look like in reality and serve as style references for the image to be generated. Based on the content of {{Image 5}}, please generate the concept reference image while correcting perspective issues — without altering the original composition or the layout of the roads. The generated image must not contain content that is an exact replica of the reference images. Please ensure the road layout from the original sketch remains unchanged. (Banana 2)

[[redesigned road layout, mirrored composition, different building count, exact copy of a reference photo, game UI, watermark, text]]`
          },
          {
            key: "B",
            name: "Evidence pass — style reference made explicit",
            tag: "Recommended",
            use: "Second pass, or any pass where style matters more than the buildings",
            out: "A concept frame closer to the target style",
            note: "Image 5 is named as the style source rather than a look-alike reference. Reproduced in 5 min / 2 iterations / 18 tapies",
            text: `I need you to generate a concept reference image for a game scene. {{Image 1}} is a sketch of the scene, depicting the arcade streets of Guangzhou. {{Image 2}}, {{Image 3}}, and {{Image 4}} are what the arcade streets of Guangzhou look like in reality. {{Image 5}} is the style reference for the concept reference image you are generating. Now, based on the content of {{Image 5}}, without changing the original composition and road direction, correct the perspective issues and generate the concept reference image for the game scene according to my requirements. The generated image must not contain any content exactly the same as {{Image 1}}. Note that you cannot modify the road direction in {{Image 5}}. (Banana 2)

[[changed road direction, recomposed camera, anime cel shading, game UI, logo, watermark]]`
          },
          {
            key: "C",
            name: "Reusable template — any site",
            tag: "Template",
            use: "Strip the Guangzhou specifics and run the same logic on another setting",
            out: "A concept frame for your own location",
            note: "Same five-part structure as A and B: sketch role → reference roles → style role → hard constraints → output",
            text: `I need you to generate a concept reference image for a game scene. {{Image 1}} is my hand-drawn sketch of the scene: {{street layout, building count, where the road bends}}. {{Image 2}} and {{Image 3}} are photographs of the real location and define what the architecture actually is. {{Image 4}} is a screenshot from {{target game}} and defines the material and lighting style only — do not copy its architecture.

Keeping the composition and the road direction of {{Image 1}} exactly as drawn, correct the perspective and render the scene in the style of {{Image 4}}. The generated image must not reproduce any reference image exactly. (Banana 2)

[[altered composition, bent road, extra buildings, architecture copied from the style screenshot, game UI, watermark, text]]`
          },
          {
            key: "D",
            name: "Large central landmark variant",
            tag: "Variant",
            use: "When the street needs one dominant building to anchor the view",
            out: "A frame with a single hero building",
            note: "The evidence pass fixed a larger building in the middle of the street — this is how to ask for that deliberately",
            text: `I need you to generate a concept reference image for a game scene based on {{Image 1}}, my hand-drawn sketch of {{a Guangzhou qilou arcade street}}.

Keep the road layout and the direction of travel exactly as drawn. Fix one {{larger four-storey arcade building}} at the centre of the street so it anchors the composition, with {{smaller three-storey units}} receding on both sides. The covered walkway along the ground floor must stay unobstructed and continuous on both sides.

{{Image 2}} and {{Image 3}} are real photographs of the location; {{Image 4}} is the style reference. Correct perspective only — do not redesign the street. (Banana 2)

[[two competing focal buildings, blocked colonnade, altered road width, game UI, watermark]]`
          }
        ]
      },
      {
        id: "s1p2",
        title: "Harvest the target style as keywords (Gemini)",
        icon: "eye",
        note: "This block exists because writing the style by hand failed twice. Its job is to turn the target game into <em>words short enough for an image model to obey</em> — and then to audit your chosen frame for errors before blockout inherits them.",
        variants: [
          {
            key: "A",
            name: "Describe the material style in game-art terms",
            tag: "Verified",
            use: "You have target-game screenshots and need them described, not copied",
            out: "A short, usable description of the target look",
            note: "The real prompt run in the test pass. Warning: the raw output is extremely long — that is why variant B exists",
            text: `Describe the material styles of the buildings in {{Image 1}}, {{Image 2}}, {{Image 3}}, and {{Image 4}} using game environment modeling terminology; keep the descriptions concise and accurate, and use natural, conversational language. (Gemini 3.1 Flash Lite)`
          },
          {
            key: "B",
            name: "Compress that description into a keyword set",
            tag: "Recommended",
            use: "Immediately after variant A, before you touch the image model",
            out: "A keyword line you can paste into an image prompt",
            note: "Long prompts measurably hurt image models. This is the compression step that fixed the style-transfer stage in step 03",
            text: `From the description above, extract the style as a keyword set I can paste into an image generation prompt.

Rules:
- Maximum {{12}} keywords, comma-separated
- Cover: material model ({{stylized PBR / semi-realistic}}), surface behaviour ({{normal map detail}}), handwork ({{hand-painted wear}})
- Name the reference game if it is the style anchor
- Delete every adjective that does not change what gets rendered

Then output one sentence that combines the keywords in natural, conversational language. (Gemini 3.1 Flash Lite)`
          },
          {
            key: "C",
            name: "Audit the frame for unbuildable geometry",
            tag: "QA",
            use: "Before you hand the locked frame to blockout",
            out: "The must-fix list that step 02 works from",
            note: "Run this on the selected frame, not on the whole batch",
            text: `You are an environment artist reviewing a concept frame before blockout. Look at {{Image 1}} and report, as a checklist:

1. PERSPECTIVE — where the vanishing points disagree or the horizon is inconsistent
2. BUILDABILITY — structure that cannot exist: floating elements, impossible spans, thickness that is not there
3. DIMENSIONS — anything with a real-world size that the image has drawn wrongly (road width, lane count, storey height, walkway clearance)
4. INVENTED DETAIL — features that appear in the render but not in the sketch or the references
5. WHAT TO KEEP — composition and massing decisions worth building exactly as drawn

For each item, state what blockout should do instead. Be blunt; this list exists to prevent a rebuild.`
          }
        ]
      }
    ],

    media: [
      {
        type: "image",
        title: "Hand-drawn concept sketch (Procreate, iPad)",
        caption: "Three views of the same qilou street, drawn over Beijing Road Pedestrian Street. The road layout and the building count along the street are fixed here — every later stage measures off this sheet. 40 min, manual, no generation cost.",
        src: "assets/images/step1-sketch-sheet.jpg",
        file: "assets/images/step1-sketch-sheet.jpg"
      },
      {
        type: "image",
        title: "Concept art generated from the sketch",
        caption: "Banana 2 output from the test pass. Perspective corrected, composition and road layout untouched. 16 min · 4 iterations · 36 tapies (≈ $0.36).",
        src: "assets/images/step1-concept-banana2.jpg",
        file: "assets/images/step1-concept-banana2.jpg"
      },
      {
        type: "image",
        title: "Running Hub — the batch-consistency trap",
        caption: "Many jobs at once, but one style interpretation per batch: when it drifts, the whole run fails together. This is why the tool was dropped in favour of TapNow.",
        src: "assets/images/step1-runninghub-batch.jpg",
        file: "assets/images/step1-runninghub-batch.jpg"
      },
      {
        type: "image",
        title: "Evidence pass — sketch and concept reproduced",
        caption: "The same two stages re-run on a larger central building with a tighter reference set, to check the result was repeatable rather than a one-off. Concept art: 5 min · 2 iterations · 18 tapies (≈ $0.18).",
        src: "assets/images/step1-concept-evidence.jpg",
        file: "assets/images/step1-concept-evidence.jpg"
      },
      {
        type: "image",
        title: "Evidence pass — hand-drawn sketch",
        caption: "Drawn for the evidence pass with a larger building fixed at the centre of the street. 40 min, manual. Drawing the same street twice is what makes the two passes comparable.",
        src: "assets/images/step1-sketch-evidence.jpg",
        file: "assets/images/step1-sketch-evidence.jpg"
      },
      {
        type: "video",
        title: "Step 01 walkthrough (to be recorded)",
        caption: "Screen recording slot: Procreate sketch → reference set-up in TapNow → generation and selection. Drop the file at this path and the placeholder swaps out automatically.",
        src: "assets/video/step1-full-walkthrough.mp4",
        poster: "assets/video/step1-full-walkthrough.jpg",
        dur: "—",
        file: "assets/video/step1-full-walkthrough.mp4",
        wide: true
      }
    ],

    tips: [
      { title: "Sketch before you prompt", text: "Everything in this step is downstream of one decision: does the layout come from you or from the model? Draw it first and the answer is you." },
      { title: "Keep the two reference sets apart", text: "Real photographs define the architecture; target-game screenshots define the style. Tell the model which is which inside the prompt, or it will build the screenshot's buildings." },
      { title: "Budget from the second pass, not the first", text: "The test pass cost 36 tapies and 4 iterations; the evidence pass, with the prompt settled, cost 18 and 2. The first run on a new scene is always the expensive one — plan for it." },
      { title: "Judge a batch tool by its worst output", text: "Tools that queue many jobs share a style across the batch. One style drift and every image in the run is a write-off, however good the best one looks." },
      { title: "End on a written must-fix list", text: "The selected frame is half the deliverable. The other half is the list of what it got wrong — that list is what stops step 02 inheriting AI's perspective errors." }
    ],
    pitfalls: [
      { title: "Generating without a sketch", text: "You get a good-looking image you did not design, and you will spend blockout reverse-engineering a layout out of it. This is the single most expensive shortcut in the pipeline." },
      { title: "Trusting the concept art's dimensions", text: "AI concept art of a street is not dimensionally reliable. Road width, lane count and storey height drawn in the render are wrong often enough that blockout must check them against real construction standards." },
      { title: "Long prompts for style", text: "Asking a text model to describe the target style returns something extremely verbose, and long prompts demonstrably weaken image models. Compress to ~12 keywords before you generate (s1p2 variant B)." },
      { title: "Using one view", text: "A single sketch view hides composition and massing errors. Draw two or three; the errors that survive all of them are the ones worth building on." }
    ],
    checkpoint: "You are holding a design pack: the hand-drawn sketch (high-res) + both reference sets, tagged by role + one locked AI concept frame + a written must-fix list naming every perspective and dimension error blockout should not trust. The step is done when you can point at the locked frame and say which three things in it are wrong."
  });
})(window.WIKI);
