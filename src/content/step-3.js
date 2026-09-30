/* ============================================================================
   step-3.js — 03 Asset Generation & Refinement
   Source: Final Project Process Book §03; Sprint 2 POC §5.2.3–5.2.8, §6.1.3–6.1.8, §6.2
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-3",
    n: "03",
    title: "Asset Generation & Refinement",
    short: "Assets",
    en: "Style convert · Decompose · Reference sheets · Tripo",
    stage: "ASSET PIPELINE",
    purpose: "Convert the concept art into the target game's style, separate the street into individual buildings, break a building down into architectural components, group those components onto clean reference sheets, and let Tripo 3D generate the models — then inspect every one of them in Unreal Engine before it is accepted.",
    duration: "3–5 weeks (schedule slot: weeks 3–5) — the critical path",
    difficulty: "High — this step carries the most uncertainty and the most schedule risk of anything in the project",
    inputs: ["Locked concept frame + style references", "Component list and storey heights from blockout", "Target-game screenshots for the style anchor"],
    outputs: ["Style-converted concept art", "Individual building units", "Component breakdown sheets + grouped reference sheets", "Tripo-generated models, inspected and accepted in UE"],
    tools: ["TapNow — Banana 2, GPT Image2, Gemini 3.1 Flash Lite", "Tripo 3D (model, retopo, UV, texture)", "Unreal Engine 5 (inspection)"],
    pipe: { out: "Inspected Game Ready components", tool: "TapNow · Tripo 3D" },

    intro: [
      "This is the step the whole project depends on, and it is also the one that behaves least predictably. Generation quality and iteration time vary run to run, and the cost of a stage is really the cost of <em>finding the prompt</em>, not of rendering. The numbers logged here make that concrete: the style-transfer stage took <strong>14 iterations</strong> the first time and <strong>2</strong> the second. Nothing about the second run was easier except that the prompt already existed.",
      "The other thing the logging makes clear is <strong>where the pipeline is weak</strong>. Generation is not the weak part — Tripo handled modelling, retopology, UVs and texturing in a single pass on the first try, twice. The weak part is the <strong>middle</strong>: decomposing a building into components. Models cannot yet break a large architectural structure down faithfully, they invent parts that were never in the original building, and the two constraints that matter most — no overlap, exact part counts — are the ones they follow least reliably. Budget your iteration time there, not at the end."
    ],

    substeps: [
      {
        id: "3.1",
        title: "Convert the concept art into the target game's style",
        detail: "Two direct approaches were tried and both failed. <strong>Describing the style in words alone</strong> produced an image that still looked like the original concept art, holding on to its hand-drawn feel. <strong>Using target-game screenshots as reference</strong> came closer to the real style, but the model copied elements out of the screenshots that do not belong in the scene — it invented the plants from the reference. The fix was indirect: have a text model describe the buildings in game-art terminology, then <strong>throw that description away and keep only a handful of keywords</strong>, because long prompts measurably weaken image models. <strong>Logged: 42 min · 14 iterations · 275 tapies (≈ $2.75).</strong> Replicated later in <strong>5 min · 2 iterations · 38 tapies (≈ $0.38)</strong> once a single good reference image was found — even one that had game UI on it, as long as the style was right.",
        tasks: [
          "Run the words-only version first, and note that it keeps the concept art's drawn look",
          "Run the screenshot-reference version, then hunt for elements it copied that do not belong",
          "Have a text model describe the target style; discard the long description",
          "Compress it to ~12 keywords and write one natural sentence around them",
          "Keep the winning prompt — this stage is cheap to re-run and expensive to re-discover"
        ]
      },
      {
        id: "3.2",
        title: "Analyse the building for reusable components first",
        detail: "Before decomposing anything, read the architecture and work out which parts repeat. In an arcade street the same window, the same column and the same balustrade appear across many facades, so every reusable component you identify is a component you do not pay a 3D generation platform to produce again. Do this on paper, on the styled image, before the breakdown sheet exists — once you are looking at 24 components it is much harder to see which ones are the same.",
        tasks: [
          "Mark every repeating component on the styled building image",
          "Group them into types (window, wall panel, column, balustrade, plaque)",
          "Count how many unique types are actually needed — this is the 3D budget",
          "Note which types are close enough to share one reference sheet"
        ]
      },
      {
        id: "3.3",
        title: "Separate the buildings into individual units",
        detail: "The styled street image is split into individual arcade building units, which become the things you generate 3D assets from. Not every image model understands the brief <em>“3D asset showcase image for a AAA game”</em> — <strong>GPT Image2</strong> handled it best. The instruction has to protect the colonnade: the covered walkway along the ground floor must stay unobstructed on both sides, or the extraction produces buildings you cannot place. <strong>Logged: 25 min · 8 iterations · 139 tapies (≈ $1.39).</strong> The evidence pass took longer — <strong>20 min · 5 iterations · 95 tapies (≈ $0.95)</strong> — because the standalone buildings kept drifting away from the original architecture's style, and prompt tweaking did not fix it. The image that finally worked was generated with the <strong>original</strong> prompt.",
        tasks: [
          "Ask for five distinct building types, no repetition, large-to-small, at a 45° angle",
          "State explicitly that the ground-floor covered walkway stays unobstructed on both sides",
          "Name the target style and exclude game UI and logos in the same prompt",
          "When style consistency drifts, revert to your first prompt before rewriting it again"
        ]
      },
      {
        id: "3.4",
        title: "Break a building into architectural components",
        detail: "One building is reduced to its components — walls, windows, pillars, floors, fences and plaques — arranged as a 3D asset sheet so each can be modelled separately. Almost every model understands this instruction; almost none of them executes it faithfully. <strong>Components will not match the original building exactly, and components that do not exist in the original building will appear.</strong> Component count is a real lever even though it is not a guarantee: asking for 24 parts on a large building returned components that were all oversized, and changing the request to <strong>32 parts</strong> fixed it. The model does not deliver exactly that many parts, but the number reliably shifts both the quantity and the size. <strong>Logged: 20 min · 6 iterations · 54 tapies (≈ $0.54)</strong> test, <strong>15 min · 4 iterations · 36 tapies (≈ $0.36)</strong> evidence.",
        tasks: [
          "List the component types you want named explicitly in the prompt",
          "Set a part count that matches the building's size — raise it if parts come back oversized",
          "Expect invented components; plan to delete them rather than prompt them away",
          "Compare the sheet against the source building and cross off every component that is not in it"
        ]
      },
      {
        id: "3.5",
        title: "Crop and group the reference sheets for Tripo",
        detail: "Everything on one component sheet means each individual component is low-resolution, and Tripo's accuracy is tied directly to the reference image. So each component is <strong>cropped out</strong> and similar parts are <strong>grouped onto one sheet per type</strong>, at a larger scale. The model understands “group objects from different images into one image” but its grasp of <strong>“no overlapping” is poor</strong> — components still come back overlapping, in both passes. A second, subtler failure: asking for four wall types returned eight wall sections, because numbers elsewhere in the prompt were being read as part of the instruction. Removing the <strong>“8” in “8K resolution”</strong> produced the right count. <strong>Logged: 25 min · 3 iterations · 42 tapies (≈ $0.42)</strong> test, <strong>30 min · 4 iterations · 56 tapies (≈ $0.56)</strong> evidence.",
        tasks: [
          "Crop every usable component out of the breakdown sheet at full resolution",
          "Group similar parts onto one sheet per type, sized consistently",
          "State the background, the angle and no-overlap — then check the overlap yourself",
          "Strip numbers from the prompt that could be misread as a part count (8K is the usual culprit)"
        ]
      },
      {
        id: "3.6",
        title: "Generate the 3D model in Tripo",
        detail: "The reference sheets go to Tripo 3D, which produces the model together with retopology, UV unwrapping and texturing in one pass. <strong>This was the smoothest stage in the entire pipeline</strong> — generation, retopo, UVs and texture all completed in one go, both times, with essentially no iteration. The only repeated action in the evidence pass was a second UV unwrap to see whether Tripo could do better. Tripo generates multi-view reference images from your upload automatically and can usually find the object even against a non-solid background, but it <strong>adheres strictly to the reference image</strong>: any “AI look” in the reference — blurred, over-generalised, not quite real — is carried straight into the geometry, and so is any perspective error in the generated multi-views. <strong>Logged: 10 min · 1 iteration · 135 tapies (≈ $1.35)</strong> test, <strong>11 min · 2 iterations · 135 tapies (≈ $1.35)</strong> evidence.",
        tasks: [
          "Upload the grouped sheet; let Tripo generate its own multi-views rather than supplying them",
          "Check the multi-views for perspective errors before generating — Tripo will reproduce them",
          "Run generation, retopo, UV unwrap and texture as one pass; only split them if the UVs fail",
          "Re-run the UV unwrap on a second version when you want a better layout to choose from"
        ]
      },
      {
        id: "3.7",
        title: "Inspect in Unreal Engine and accept or reject",
        detail: "Every generated model is imported into Unreal Engine and checked on four things before it enters the library: <strong>silhouette match, material match, polygon count, and UV quality</strong>. The accepted window component from the test pass matched the source silhouette well and its colours were consistent, with a high polygon count (<strong>9,458 faces / 9,198 vertices, quad topology</strong>) and some UV distortion — judged acceptable. The evidence-pass model came back better: strong silhouette and material resemblance with reasonably well-structured topology. Import is the last cheap place to say no.",
        tasks: [
          "Import the model and view it against the source reference side by side",
          "Check topology type, face count and vertex count in the static mesh editor",
          "Look for stretched or overlapping UVs; decide whether they matter at the intended texel density",
          "Accept, or send it back to Tripo with a corrected reference sheet — do not start manual cleanup on a bad accept"
        ]
      }
    ],

    prompts: [
      {
        id: "s3p1",
        title: "Style transfer to the target game's art style",
        icon: "sparkles",
        note: "Four variants, in the order they were tried. A and B are the real prompts from the test and evidence passes; C is the region-anchored version; D is the fix for the contamination problem. Long prompts measurably weaken image models — keep these short.",
        variants: [
          {
            key: "A",
            name: "Keyword style anchor (verified)",
            tag: "Verified",
            use: "When a verbal style description replaces reference images",
            out: "The scene re-rendered in the target style",
            note: "The real prompt from the test pass. 14 iterations — because the keywords themselves took 42 minutes of work to find",
            text: `Convert {{Image 1}} into a game scene. No game UI elements should be visible. The style is stylized PBR, featuring semi-realistic materials enhanced by normal maps and complemented by hand-painted wear-and-tear details, consistent with the art style of game {{Neverness to Everness}}. (GPT Image2)

[[hand-drawn look, sketch lines, cel shading, flat diffuse only, game UI, HUD, logo, watermark]]`
          },
          {
            key: "B",
            name: "Reference image carries the style",
            tag: "Recommended",
            use: "Once you have found one screenshot whose style is right",
            out: "The closest style match, in 2 iterations",
            note: "Game UI on the reference is fine — only the style is being borrowed. 5 min · 2 iterations · 38 tapies",
            text: `Convert {{Image 1}} into a game scene. Game UI must not appear. The materials for the generated scene should be based on {{Image 2}}. Use stylized PBR, primarily semi-realistic materials with normal map effects, supplemented by hand-drawn wear details, consistent with the art style of game {{Neverness to Everness}}. (GPT Image2)

[[copying architecture from the reference, plants or props imported from the reference, game UI, HUD, watermark]]`
          },
          {
            key: "C",
            name: "Region-anchored (in-game location)",
            tag: "Variant",
            use: "When you want the look of a specific region of a game, not the game overall",
            out: "A style match tied to one in-game area",
            note: "Anchoring to a named region was more consistent than anchoring to the game as a whole",
            text: `Separate the arcade buildings in {{Image 1}} into individual units based on colour and style, ensuring the covered walkways on both the left and right sides of the ground floor remain unobstructed. Use five distinct arcade building designs without repetition, arranging them in a sequence of large, medium and small sizes at a 45-degree angle. 8K resolution, top-tier photography-quality visuals, cinematic lighting, bloom. Stylized PBR — primarily semi-realistic textures with normal mapping — complemented by hand-painted wear-and-tear details. The style should reflect the {{"Honami" region from the game Wuthering Waves}}, with no game UI or logos present. (GPT Image2)

[[repeated building designs, blocked colonnade, flattened perspective, game UI, logo, watermark]]`
          },
          {
            key: "D",
            name: "Anti-contamination pass",
            tag: "Fix",
            use: "When the reference image's props keep leaking into your scene",
            out: "The style without the borrowed objects",
            note: "The specific failure this fixes: using game screenshots as reference imported vegetation that does not exist in the scene",
            text: `Convert {{Image 1}} into a game scene. Game UI must not appear.

Take from {{Image 2}} ONLY: material response, highlight behaviour, wear distribution, colour grade, and the balance between hand-painted and PBR detail.
Do NOT take from {{Image 2}}: any object, plant, prop, vehicle, figure or piece of architecture. Every object in the output must already exist in {{Image 1}}.

Style: stylized PBR, semi-realistic materials with normal map effects, hand-painted wear details, consistent with the art style of game {{Neverness to Everness}}. (GPT Image2)

[[vegetation added from the reference, props from the reference, extra buildings, game UI, HUD, logo, watermark]]`
          }
        ]
      },
      {
        id: "s3p2",
        title: "Separate the buildings into individual units",
        icon: "box",
        note: "Both variants are real prompts from the two passes. Use A for a street-scale extraction and B for a tighter, more controlled set. GPT Image2 understood “3D asset showcase image” better than the alternatives.",
        variants: [
          {
            key: "A",
            name: "Street scale, five types",
            tag: "Verified",
            use: "Turning the whole styled street into placeable building units",
            out: "Five distinct building units on one sheet",
            note: "The real test-pass prompt. 25 min · 8 iterations · 139 tapies (≈ $1.39)",
            text: `Separate the arcade buildings in {{Image 1}} into individual units based on colour and style, ensuring the covered walkways on the left and right sides of the ground floor remain unobstructed. Use five distinct arcade building types without repetition, arranging them in a sequence of large, medium and small sizes at a 45-degree angle. The output should feature 8K resolution, top-tier photography quality, cinematic lighting, and bloom effects. The visual style should be stylized PBR, combining semi-realistic materials and normal mapping with hand-painted wear-and-tear details, reflecting the style of game {{Neverness to Everness}}; exclude any game UI or logos. (GPT Image2)

[[repeating identical buildings, blocked walkway, flattened angle, orthographic front view, game UI, logos, watermark]]`
          },
          {
            key: "B",
            name: "Evidence pass, tighter control",
            tag: "Recommended",
            use: "Re-running the extraction when style consistency matters more than variety",
            out: "A second, more consistent set of units",
            note: "The real evidence-pass prompt. 20 min · 5 iterations · 95 tapies (≈ $0.95) — the extra time went to style drift, not to the extraction itself",
            text: `Separate the arcade buildings in {{Image 1}} into individual units based on colour and style, ensuring the covered walkways on both the left and right sides of the ground floor remain unobstructed. Use five distinct arcade building designs without repetition, arranging them in a sequence of large, medium and small sizes at a 45-degree angle. The output should feature 8K resolution, top-tier photography-quality visuals, cinematic lighting, and bloom effects. The aesthetic should utilize stylized PBR materials — primarily semi-realistic textures with normal mapping — complemented by hand-painted wear-and-tear details. The style should reflect the {{"Honami" region from the game Wuthering Waves}}, with no game UI or logos present. (GPT Image2)

[[style drifting from the source building, copied architecture, blocked colonnade, game UI, logos]]`
          }
        ]
      },
      {
        id: "s3p3",
        title: "Break the building into architectural components",
        icon: "layers",
        note: "The least reliable stage in the pipeline, and the one that absorbs the most iterations. The part count is the only lever that reliably changes the output — and expect invented components regardless of what the prompt says.",
        variants: [
          {
            key: "A",
            name: "24 components (test pass)",
            tag: "Verified",
            use: "A medium-sized building",
            out: "A component sheet, arranged for 3D reference",
            note: "Real prompt from the test pass. 20 min · 6 iterations · 54 tapies (≈ $0.54). The model will not produce exactly 24 unique parts",
            text: `Arrange the structural components of the building in {{Image 1}}, including walls, windows, pillars, floors, fences, and plaques, according to the 3D asset map. The 24 structural components must be unique, arranged in order of size (large, medium, small), at a 45-degree angle, and without overlap. Use 8K resolution, top-tier photographic quality, cinematic light, floodlight, stylized PBR, semi-realistic materials with normal effects, supplemented by hand-painted wear details, art style of game {{Neverness to Everness}}. No game UI or logos are allowed. (Banana 2)

[[duplicated components, overlapping parts, components not present in the source building, game UI, logos]]`
          },
          {
            key: "B",
            name: "32 components (large building)",
            tag: "Fix",
            use: "When the building is large and the parts come back oversized",
            out: "A finer component sheet at a usable scale",
            note: "Real prompt from the evidence pass. Raising 24 → 32 was the fix for components arriving too large. 15 min · 4 iterations · 36 tapies (≈ $0.36)",
            text: `Arrange the architectural components from {{Image 1}} according to the 3D asset layout: use all 32 unique components without repetition, organized by size (large to small) and positioned at a 45-degree angle with no overlapping. Features include 8K resolution, top-tier photography, cinematic lighting, bloom effects, and stylized PBR; the visual style relies primarily on semi-realistic materials with normal mapping, complemented by hand-painted wear-and-tear details, art style of game {{Neverness to Everness}}. No game UI or logos are allowed. (Banana 2)

[[oversized components, duplicated parts, parts not in the source building, overlapping, game UI, logos]]`
          }
        ]
      },
      {
        id: "s3p4",
        title: "Crop and group the reference sheets for Tripo",
        icon: "layers",
        note: "Tripo's accuracy tracks the reference image directly, so this stage is about clarity and spacing, not art direction. Two known failures to design around: components that overlap anyway, and part counts corrupted by numbers elsewhere in the prompt.",
        variants: [
          {
            key: "A",
            name: "Group windows onto one sheet",
            tag: "Verified",
            use: "Any component type you have cropped into several files",
            out: "One clean reference sheet per component type",
            note: "Real prompt from the test pass. 25 min (5 min cropping + 20 min generation) · 3 iterations · 42 tapies (≈ $0.42)",
            text: `{{Image 1}}, {{Image 2}}, {{Image 3}} and {{Image 4}} are 3D assets representing windows extracted from the Guangzhou arcade buildings in {{Image 5}}. The windows from Images 1, 2, 3 and 4 should be placed on a single image without repetition, maintaining their original style and placement according to the 3D asset design. They should be similar in size, placed perpendicular to the ground at a 45-degree angle, and without overlap. 8K resolution, top-tier photographic quality, cinematic light, stylized PBR, and primarily semi-realistic materials with normal effects, complemented by hand-drawn wear details. The art style of game {{Neverness to Everness}}, and game UI and logos should not appear. (Banana 2)

[[overlapping components, merged silhouettes, added components, game UI, logos, watermark]]`
          },
          {
            key: "B",
            name: "Wall sheets, prompt hygiene applied",
            tag: "Fix",
            use: "When the sheet comes back with more components than you supplied",
            out: "The correct number of components",
            note: "The real evidence-pass prompt, with the fix applied: no numerals that can be misread as a part count — the “8” in “8K resolution” was producing eight wall sections from four types. 30 min · 4 iterations · 56 tapies (≈ $0.56)",
            text: `{{Image 1}} {{Image 2}} {{Image 3}} {{Image 4}} represent the wall surfaces of Guangzhou qilou (veranda-style) buildings. Arrange these wall sections according to their 3D asset layouts onto a single image, maintaining their original aspect ratios. Position them upright and at a 45-degree angle, ensuring sufficient spacing between them with no overlapping, so that each wall section is fully visible. The result should look like a top-tier photograph against a pure black background. Feature a stylized PBR look, primarily semi-realistic materials with normal map effects, complemented by hand-painted wear-and-tear details, the art style of game {{Neverness to Everness}}, and game UI and logos should not appear. (Banana 2)

[[duplicated wall sections beyond the four supplied, overlapping panels, cropped-off edges, game UI, logos]]`
          }
        ]
      },
      {
        id: "s3p5",
        title: "Pre-flight the reference sheet before spending Tripo credits",
        icon: "eye",
        note: "Tripo adheres strictly to the reference image, which means every flaw in the reference is paid for twice: once in generation, once in cleanup. Audit the sheet first — it is the cheapest check in the step.",
        variants: [
          {
            key: "A",
            name: "Reference sheet audit",
            tag: "Recommended",
            use: "Between the grouping stage and the Tripo upload",
            out: "A go / fix decision before you spend credits",
            note: "The failure mode this catches: a reference that looks like AI output produces a model that looks like AI output",
            text: `You are preparing a reference image for an AI 3D generation tool that reproduces the reference very literally. Review {{Image 1}} and answer:

1. CLARITY — is the subject clearly defined, or ambiguous enough that the tool will guess?
2. BACKGROUND — is it clean enough? Anything that could be mistaken for part of the subject?
3. OVERLAP — do any components touch, intersect or occlude each other? List them.
4. PERSPECTIVE — are any components drawn in a perspective that would be wrong in 3D? Be specific about which.
5. AI ARTEFACTS — any blurred, over-generalised or physically impossible surfaces that would be carried into the geometry.
6. COUNT — how many components are actually visible, and does that match what I supplied?

For each problem give the fix at the sheet level (re-crop, re-space, re-generate). If the sheet is usable, say so plainly. (Gemini 3.1 Flash Lite / GPT)`
          },
          {
            key: "B",
            name: "Post-import acceptance check",
            tag: "QA",
            use: "In Unreal Engine, before the model enters the asset library",
            out: "An accept / reject decision with written reasons",
            note: "Matched against the source reference, so it grades silhouette and material rather than taste",
            text: `You are accepting or rejecting a generated 3D asset. {{Image 1}} is the source reference. {{Image 2}} is the imported model in Unreal Engine, same angle.

Give me a verdict of ACCEPT, ACCEPT WITH NOTES, or REJECT, then justify it on four axes only:

1. SILHOUETTE — does the outline match the source where it matters, and where does it not?
2. MATERIAL — are the colours and material response consistent with the source?
3. TOPOLOGY — read the reported topology and counts. Is this a sensible density for {{a background street facade component}} seen at {{player distance}}?
4. UV — is there visible stretching or overlap, and would it matter at the intended texel density?

State explicitly what would have to change in the reference sheet for a re-run to do better. Do not comment on aesthetic preference.`
          }
        ]
      }
    ],

    media: [
      {
        type: "image",
        title: "Style transfer — the two methods that failed",
        caption: "Top: the words-only version, still carrying the concept art's hand-drawn feel. Bottom: the screenshot-reference version, closer to the target style but with plants imported from the reference that do not belong in the scene.",
        src: "assets/images/step3-style-variants.jpg",
        file: "assets/images/step3-style-variants.jpg"
      },
      {
        type: "image",
        title: "Asking the AI to describe the target style",
        caption: "Using the text-generation function to describe building materials in game-art terminology. The descriptions that come back are extremely long — which is exactly the problem, because long prompts weaken image models.",
        src: "assets/images/step3-style-description.jpg",
        file: "assets/images/step3-style-description.jpg"
      },
      {
        type: "image",
        title: "Style transfer result",
        caption: "The concept art re-rendered in the target game's style after the description was compressed to a keyword set. Replicated later in 5 min · 2 iterations · 38 tapies (≈ $0.38) — versus 42 min · 14 iterations · 275 tapies (≈ $2.75) to find it.",
        src: "assets/images/step3-style-transfer-result.jpg",
        file: "assets/images/step3-style-transfer-result.jpg"
      },
      {
        type: "image",
        title: "Concept art → stylized scene, side by side",
        caption: "The evidence pass reproduction: original concept art on the left, stylized game scene on the right. This pair is what the decomposition stages work from.",
        src: "assets/images/step3-style-before-after.jpg",
        file: "assets/images/step3-style-before-after.jpg"
      },
      {
        type: "image",
        title: "Buildings separated into individual units",
        caption: "Five distinct arcade building types, large to small at 45°, with the ground-floor covered walkway kept clear on both sides. GPT Image2 handled the “3D asset showcase” brief best. 25 min · 8 iterations · 139 tapies (≈ $1.39).",
        src: "assets/images/step3-building-separation.jpg",
        file: "assets/images/step3-building-separation.jpg"
      },
      {
        type: "image",
        title: "Decomposition — buildings and their components",
        caption: "Test-pass decomposition. Left: the styled buildings, each separated from the street. Right: a building reduced to walls, windows, pillars, floors, fences and plaques. Expect the model to invent components that were never in the original.",
        src: "assets/images/step3-decomposition-sheet.jpg",
        file: "assets/images/step3-decomposition-sheet.jpg"
      },
      {
        type: "image",
        title: "Component breakdown sheet",
        caption: "The building broken into structural components arranged as a 3D asset sheet. 24 parts requested on the test pass; the large building in the evidence pass needed 32 before the components came back at a usable size.",
        src: "assets/images/step3-component-breakdown.jpg",
        file: "assets/images/step3-component-breakdown.jpg"
      },
      {
        type: "image",
        title: "Cropping components out of the sheet",
        caption: "Individual components cropped from the breakdown sheet at full resolution. Everything on one sheet means every component on it is low-resolution, and Tripo's accuracy tracks the reference directly.",
        src: "assets/images/step3-component-extract.jpg",
        file: "assets/images/step3-component-extract.jpg"
      },
      {
        type: "image",
        title: "Cropped components with source filenames",
        caption: "Two crop passes over the same sheet, each component carried through as its own file. The naming is deliberate — it is what lets you trace a bad model back to the reference it came from.",
        src: "assets/images/step3-trimmed-components.jpg",
        file: "assets/images/step3-trimmed-components.jpg"
      },
      {
        type: "image",
        title: "Similar parts grouped onto one reference sheet",
        caption: "Cropped components re-grouped by type onto a single sheet at larger scale. The model understands “group objects onto one image” but its grasp of “no overlap” is poor — check the spacing yourself.",
        src: "assets/images/step3-reference-grouping.jpg",
        file: "assets/images/step3-reference-grouping.jpg"
      },
      {
        type: "image",
        title: "Wall sheets — the prompt-hygiene fix",
        caption: "Four wall types came back as eight sections, because the “8” in “8K resolution” was read as a part count. Removing numerals that can be misread fixed the count. 30 min · 4 iterations · 56 tapies (≈ $0.56).",
        src: "assets/images/step3-wall-sheets.jpg",
        file: "assets/images/step3-wall-sheets.jpg"
      },
      {
        type: "image",
        title: "Tripo — window model generated in one pass",
        caption: "Modelling, retopology, UV unwrapping and texturing all completed in a single run. This was the smoothest stage of the whole pipeline: 10 min · 1 iteration · 135 tapies (≈ $1.35).",
        src: "assets/images/step3-tripo-window.jpg",
        file: "assets/images/step3-tripo-window.jpg"
      },
      {
        type: "image",
        title: "Tripo's automatic multi-view generation",
        caption: "Tripo builds multi-view reference images from the upload and usually identifies the object even against a non-solid background. It adheres strictly to the reference — including any perspective error in those multi-views.",
        src: "assets/images/step3-tripo-multiview.jpg",
        file: "assets/images/step3-tripo-multiview.jpg"
      },
      {
        type: "image",
        title: "Generated components and their references",
        caption: "Tripo output beside the reference it was generated from. Where the reference looks over-generalised or blurred, the geometry carries that same look — the AI aesthetic transfers straight through.",
        src: "assets/images/step3-tripo-components.jpg",
        file: "assets/images/step3-tripo-components.jpg"
      },
      {
        type: "image",
        title: "Test-pass model from four angles",
        caption: "The window model after a single Tripo run, shown from four angles: textured, wireframe, and material-only views. No manual retopology was needed at this stage.",
        src: "assets/images/step3-tripo-four-angles.jpg",
        file: "assets/images/step3-tripo-four-angles.jpg"
      },
      {
        type: "image",
        title: "Evidence-pass model from four angles",
        caption: "The reproduced model — a carved facade panel — from a single Tripo run. The only stage repeated was the UV unwrap, on a second version to compare layouts.",
        src: "assets/images/step3-tripo-banner.jpg",
        file: "assets/images/step3-tripo-banner.jpg"
      },
      {
        type: "image",
        title: "Inspection in Unreal Engine",
        caption: "The imported model checked in UE against the source reference: silhouette largely matches, material colours are consistent. Accepted with notes — high polygon count and some UV distortion, both within an acceptable range.",
        src: "assets/images/step3-ue-inspection.jpg",
        file: "assets/images/step3-ue-inspection.jpg"
      },
      {
        type: "image",
        title: "Accepted topology: 9,458 faces, quad-based",
        caption: "Quad topology, 9,458 faces, 9,198 vertices, read straight out of the UE static mesh statistics. Over 9k faces is heavy for a background facade component — accept it now, but this is the number to watch when the library grows.",
        src: "assets/images/step3-topology-stats.jpg",
        file: "assets/images/step3-topology-stats.jpg"
      },
      {
        type: "video",
        title: "Step 03 decomposition workflow (to be recorded)",
        caption: "Screen recording slot: style conversion → building separation → component breakdown → cropping and grouping → Tripo upload. Include the click path; this is the step members will follow most closely.",
        src: "assets/video/step3-decompose-workflow.mp4",
        poster: "assets/video/step3-decompose-workflow.jpg",
        dur: "—",
        file: "assets/video/step3-decompose-workflow.mp4",
        wide: true
      }
    ],

    tips: [
      { title: "Budget for finding the prompt, not for rendering", text: "Style transfer cost 275 tapies and 14 iterations the first time and 38 tapies and 2 the second. Rendering is not the expense; discovering the prompt is. Keep every winning prompt." },
      { title: "Compress style descriptions to ~12 keywords", text: "Have a text model describe the target style, then throw the long version away. Long prompts measurably hurt image models — the compression step is what made style transfer work." },
      { title: "Analyse reuse before you decompose", text: "Every repeated window, column and balustrade you identify up front is one you do not pay a 3D platform to generate again. Do this on the styled image, before the component sheet exists." },
      { title: "Part count is a real lever, not a promise", text: "The model will not deliver exactly 24 or 32 unique parts — but the number reliably shifts both the quantity and the size of what comes back. Raise it when parts arrive oversized." },
      { title: "Strip stray numerals from prompts", text: "The “8” in “8K resolution” was read as a part count and produced eight wall sections from four types. Remove any number that could be mistaken for a quantity." },
      { title: "Audit the reference before spending credits", text: "Tripo reproduces the reference literally, including its flaws. A blurred, over-generalised reference becomes blurred, over-generalised geometry. Check the sheet first — it is the cheapest QA in the step." },
      { title: "Reject at import, not after cleanup", text: "UE import is the last cheap place to say no. If the silhouette is wrong or the UVs are unusable, fix the reference and re-run rather than starting manual cleanup on a model you will replace anyway." }
    ],
    pitfalls: [
      { title: "Expecting the model to respect 'no overlap'", text: "It does not, in either pass. Both batches came back with components overlapping each other despite the constraint being stated explicitly. Verify spacing by eye every time." },
      { title: "Believing the component sheet matches the building", text: "Almost every model understands “break the building into components” and almost none executes it faithfully — the parts will not match the original, and parts that never existed will appear." },
      { title: "Letting reference images bring their own props", text: "The screenshot-reference approach for style transfer imported plants from the reference into a scene that has none. Name what may be borrowed and what may not." },
      { title: "Asking AI for three-view projections too early", text: "AI struggles to interpret irregular objects in 3D space, so three-views introduce errors and invented elements. It is not required before decomposition — skip it and crop components instead." },
      { title: "Treating generation as the risk", text: "Generation was the most reliable stage, twice, with one iteration. Decomposition is the unreliable one and it absorbed the most iterations. Put your buffer where the risk actually is." }
    ],
    checkpoint: "The asset library holds Tripo-generated components that have each been inspected in Unreal Engine against their source reference and explicitly accepted on silhouette, material, topology and UV. You have the style-transfer prompt that reproduces the target look, the grouped reference sheets that produced the models, and a written record of which components were rejected and why."
  });
})(window.WIKI);
