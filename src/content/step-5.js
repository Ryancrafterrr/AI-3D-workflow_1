/* ============================================================================
   step-5.js — 05 Visual Unification & Atmosphere Development
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-5",
    n: "05",
    title: "Visual Unification & Atmosphere Development",
    short: "Unify",
    en: "Materials · Light rig · LUT · Atmosphere",
    stage: "LOOK DEV",
    purpose: "Bring assets from many different sources into one visual standard: <strong>material consistency</strong> (hue / saturation / roughness held inside a shared range), <strong>unified lighting</strong>, and <strong>post-processing with colour grading</strong>. This step decides whether the frame looks like one team made it.",
    duration: "3–6 days",
    difficulty: "High — controlled by numbers, not by feel",
    inputs: ["Frozen level (dressing included)", "Material library", "Colour and lighting data from the references"],
    outputs: ["Unified material standard and instances", "Primary light rig (Lumen settings)", "Post-processing setup (LUT / grade)", "2–3 atmosphere variants"],
    tools: ["UE5 (Lumen / Post Process Volume)", "Substance Painter", "DaVinci Resolve / Photoshop (LUT authoring)"],
    pipe: { out: "Unified look + atmosphere set", tool: "UE5 Look Dev" },

    intro: [
      "Assets arrive from AI generation, marketplace packs and outsourcing, so their style is inconsistent by default. The way to unify is not “tweak it by feel” but to <strong>fix a set of numeric ranges</strong>: hue concentrated within {{N}} degrees, a saturation ceiling, a roughness distribution, a value range. Once the ranges exist, any new asset can be judged against them in seconds.",
      "Lighting and post-processing are the last resort for unification: even if materials differ slightly, one shared key direction, colour temperature and grade pulls them together. <strong>Fix materials first, then close the gap with light</strong> — reverse the order and you spend the rest of the project patching holes."
    ],

    substeps: [
      {
        id: "5.1",
        title: "Material consistency audit and convergence",
        detail: "Check four values per material: hue, saturation, roughness, value. Fix anything outside the ranges. Once this pass is done the frame suddenly looks like one set of things.",
        tasks: [
          "Fix the visual baseline: hue band (e.g. {{180–220°}}), saturation ceiling (e.g. {{45%}}), value range (e.g. {{20–70%}})",
          "Route every parameter change through material instances; never scatter edits across the master material",
          "Audit and correct material by material, recording values before and after",
          "Check texture colour spaces: albedo as sRGB, roughness / normal as Linear, to avoid colour shifts"
        ]
      },
      {
        id: "5.2",
        title: "Unified lighting",
        detail: "Decide one primary light rig and reuse it for every camera: key direction, colour temperature, sky light intensity, fog and volumetrics. Lighting is the last safety net for consistency.",
        tasks: [
          "Fix the key light direction and elevation (e.g. {{azimuth 315°, elevation 35°}}) and keep it identical scene-wide",
          "Define the colour-temperature relationships: sun / sky / practical, with a clear warm-cool division",
          "Configure Lumen and an exposure strategy (lock a manual EV so nothing jumps with auto exposure)",
          "Add fog and volumetrics to unify the sense of air and the depth read"
        ]
      },
      {
        id: "5.3",
        title: "Post-processing and colour grading",
        detail: "Post-processing is the cheapest unification tool there is: one LUT, one white balance, one contrast compression pulls mismatched assets into the same colour space.",
        tasks: [
          "Configure the Post Process Volume: white balance, contrast, tone curve (S-curve), highlight rolloff",
          "Author a project LUT (build it in DaVinci / Photoshop, export .cube or a 256×16 strip)",
          "Unify bloom / lens flare / sharpening so the look does not jump between cameras",
          "Check that shadows are not crushed and highlights are not clipped — leave grading headroom"
        ]
      },
      {
        id: "5.4",
        title: "Atmosphere variants and side-by-side comparison",
        detail: "Build 2–3 atmospheres for the same scene (early morning fog / harsh noon / warm dusk), compare them side by side, then pick the hero look — and keep the others as ammunition for promotional material.",
        tasks: [
          "Capture every atmosphere from the same fixed cameras so they are directly comparable",
          "List the emotional keywords and the best use case for each atmosphere",
          "Choose the hero look and record all of its parameters (reproducibly)",
          "Put the hero-look screenshots next to the step 01 locked concept for a final cross-check"
        ]
      }
    ],

    prompts: [
      {
        id: "s5p1",
        title: "Material consistency audit",
        icon: "layers",
        note: "Drop in several asset renders or material spheres at once and have the model find whatever falls outside the colour range.",
        variants: [
          {
            key: "A",
            name: "Colour-range consistency issue list",
            tag: "Primary",
            use: "When the palette clearly does not hold together",
            out: "Problem material list + corrected values",
            note: "Demand numeric suggestions, not “make it cooler”",
            text: `Attached are renders of {{8}} assets that will live in one scene. Audit them for visual consistency as a look-dev artist.

Target look: {{hue family 190–230°}}, saturation ≤ {{45%}}, value range {{20–70%}}, roughness mostly {{0.55–0.85}} with specular only on exposed metal and wet surfaces.

For each asset report: HUE | SATURATION | VALUE | ROUGHNESS (estimated) | VERDICT (in range / out of range / borderline) | CORRECTION (specific direction and amount, e.g. "-15 sat, +8 value, hue -12° toward cyan").

Then:
- Rank the assets by how much they damage the unified read.
- Name the asset that should become the visual benchmark (reference standard) and why.
- Give 3 global adjustments (a single change that improves everything at once), such as one shared LUT direction or a global albedo desaturation.`
          },
          {
            key: "B",
            name: "Material parameter standard sheet",
            tag: "Standard",
            use: "When you need an executable material standard",
            out: "A material spec sheet",
            note: "Use it directly as the team's material standard document",
            text: `Produce a PBR material standardization sheet for a {{stylized-realistic alpine environment}} project.

For each material family below give: Base Color range (in RGB values), Roughness range, Metallic policy, Normal strength policy, and the allowed variation between assets in the same family.
- {{stone: granite, slate, weathered concrete}}
- {{wood: raw timber, painted timber, lacquered}}
- {{metal: bare steel, galvanized, painted steel, rusted}}
- {{fabric: canvas, rope, leather}}
- {{glass and water}}
- {{snow and ice}}

Then state:
1. The THREE global rules that make a scene look unified regardless of asset source.
2. What must NEVER be varied between assets of the same family.
3. A short checklist a modeler/texture artist can run before submitting an asset.`
          },
          {
            key: "C",
            name: "Texture and colour space troubleshooting",
            tag: "Technical",
            use: "When you see colour shifts, washed-out greys or dead-looking materials",
            out: "A technical fault isolation list",
            note: "A lot of “inconsistency” is a settings error, not a taste problem",
            text: `Diagnose technical causes of visual inconsistency in a UE5 scene where assets were sourced from {{AI generation, a marketplace pack, and an external vendor}}.

Checklist to produce, with cause → symptom → fix:
1. Texture color space errors (albedo treated as linear, roughness treated as sRGB)
2. Normal map format and green-channel orientation mismatch
3. Inconsistent texel density causing blur/sharpness mismatch between assets
4. Auto-exposure and its effect on perceived material consistency across camera positions
5. Roughness maps authored at different scales (micro-detail amplitude mismatch)
6. AO baked at scene scale vs asset scale
7. Nanite vs non-Nanite assets and shading differences between them
8. Material domain / blend mode inconsistencies affecting reflections

For each, tell me how to DETECT it in 60 seconds and the exact setting to correct.`
          },
          {
            key: "D",
            name: "LUT and colour grade authoring brief",
            tag: "Grading",
            use: "When you want to unify the colour base itself",
            out: "LUT recipe + parameters",
            note: "Analyse the reference first, then produce reproducible LUT parameters",
            text: `Analyze the attached reference image and produce a color grading recipe I can build as a LUT in DaVinci Resolve.

Output:
1. EXPOSURE & CONTRAST — black point, white point, midpoint shift, and the S-curve shape (soft / medium / hard) in plain terms
2. COLOR BALANCE — shadows / midtones / highlights shift directions (e.g. "shadows +8 blue, midtones +4 warm amber, highlights neutral")
3. SATURATION MAP — which hue ranges are pushed and which are pulled, by how much
4. HUE VS HUE — any hue rotation needed to make {{foliage / stone / snow}} land in the palette
5. LUMINANCE VS SATURATION — whether highlights are desaturated (filmic) or saturated
6. THE 5 NUMBERS — the five most important numeric values to set first
7. FAILURE MODE — what this grade does badly, and the shot type where it will break

Then tell me how to verify the LUT is neutral enough to reuse across different times of day.`
          }
        ]
      },
      {
        id: "s5p2",
        title: "Lighting and post-processing plan",
        icon: "flame",
        note: "Define a reusable primary light rig and post-processing parameters so every camera reads the same.",
        variants: [
          {
            key: "A",
            name: "Primary light rig design",
            tag: "Primary",
            use: "When you need one unified lighting baseline",
            out: "A lighting parameter plan",
            note: "The output should map directly onto UE5 Directional Light / Sky Light / Lumen settings",
            text: `Design a unified lighting setup for {{an abandoned alpine research station — mixed interior/exterior, one broken roof section}} in Unreal Engine 5 with Lumen.

Give me:
1. KEY LIGHT — direction (azimuth / elevation), color temperature in Kelvin, intensity in lux, source angle (softness), and the reason for that angle given the architecture
2. SKY / AMBIENT — sky light intensity, ambient cubemap or HDRI choice, and the expected bounce color from {{snow ground, concrete walls}}
3. PRACTICALS — which interior lamps exist, their color temperature, intensity, and whether they should be the brightest thing in any frame
4. GLOBAL ILLUMINATION — Lumen settings worth changing from default, and the ones to leave alone
5. VOLUMETRICS — fog density, height falloff, and where to use local fog volumes so depth reads without washing out contrast
6. EXPOSURE — fixed EV, metering mode, and why auto-exposure must be off for a consistent look
7. FAILURE MODES — what will look wrong first (blown skylight, flat shadows, muddy midtones) and the check for each

Then state the one-sentence rule that keeps every future camera angle consistent.`
          },
          {
            key: "B",
            name: "Atmosphere variant design (3 sets)",
            tag: "Variant",
            use: "When you need several atmospheres to compare or to publish",
            out: "3 atmosphere sets",
            note: "Every set must come with quantifiable differences, not “a bit warmer”",
            text: `Design 3 distinct atmosphere variants for the same scene ({{scene}}), all keeping the same camera and layout so they can be compared directly.

For each variant give: NAME | MOOD IN 3 WORDS | SUN ANGLE & KELVIN | SKY STATE | FOG | PRACTICAL LIGHTS | CONTRAST RATIO | GRADE DIRECTION | WHAT IT COMMUNICATES ABOUT THE PLACE

The variants:
1. {{early morning low fog — quiet, cold, high contrast light shaft}}
2. {{flat overcast noon — honest, desaturated, detail-first}}
3. {{late afternoon warm interior glow — inviting, narrative, longest shadows}}

Then:
- Recommend which one to use as the hero look for a portfolio piece, and why in 3 sentences.
- List what would break in each variant (what would make it look cheap).
- Give the single parameter I should hold constant across all three so the comparison stays fair.`
          },
          {
            key: "C",
            name: "Lighting diagnosis (screenshot)",
            tag: "Review",
            use: "When the image looks grey, washed out or flat",
            out: "Lighting fault isolation + fixes",
            note: "Ask for symptom → cause → fix so you can act on it directly",
            text: `Attached is a screenshot of my UE5 scene. Diagnose the lighting and post-processing.

Report as symptom → likely cause → specific fix (with UE5 setting names):
1. Overall value range — where is the image compressed or blown?
2. Shadow quality — too open (flat) or too closed (crushed)? What is the current effective contrast ratio?
3. Light direction readability — can you tell where the key light comes from within 2 seconds? If not, what breaks it?
4. Ambient occlusion / contact shadows — are objects grounding properly, or do they look pasted on?
5. Color temperature logic — are warm and cool sources in a believable relationship?
6. Post-processing faults — bloom too strong, DOF on the wrong plane, sharpening halos, vignette too heavy, or crushed blacks from the grade.
7. Atmosphere — is there enough aerial perspective to separate foreground and background?

End with a 5-item fix list ordered by visual impact per minute of work.`
          },
          {
            key: "D",
            name: "Reverse-engineer lighting from a reference",
            tag: "Benchmark",
            use: "When you want to reproduce a reference's lighting",
            out: "Reverse-engineered light parameters",
            note: "Upload a reference render and get back parameters you can type straight into the engine",
            text: `Reverse-engineer the lighting of the attached reference render.

Deliver:
1. LIGHT INVENTORY — every visible light source: type, estimated direction, estimated intensity ratio relative to the key, color temperature in Kelvin, and whether it is visible in frame
2. SHADOW ANALYSIS — penumbra softness (which implies source size), shadow length relative to object height (which implies elevation angle), and shadow color
3. EXPOSURE — estimated middle grey placement, highlight rolloff character, and whether the image is exposed for the sky or the interior
4. ATMOSPHERE — is there fog, dust, or depth haze? Estimated density by distance
5. BOUNCE — where the fill light comes from and its color (assume the local surfaces are {{snow and grey stone}})
6. RECIPE — a UE5 setup card: Directional Light (rotation, lux, Kelvin), Sky Light, key practicals, fog settings, exposure EV

Then flag the two details in the reference that would be hardest to reproduce in real time, and a cheaper approximation for each.`
          }
        ]
      }
    ],

    media: [
      {
        type: "gif",
        title: "Material convergence before / after (loop)",
        caption: "Key GIF: how the frame changes as hue and saturation converge. Watch it go from looking assembled to looking unified.",
        src: "assets/gifs/step5-material-unify.gif",
        file: "assets/gifs/step5-material-unify.gif",
        wide: true
      },
      {
        type: "video",
        title: "Look dev end to end: material audit → lighting → grade",
        caption: "Narrated full recording, including how the parameter values were chosen and the failed attempts (with counter-examples).",
        src: "assets/video/step5-lookdev.mp4",
        poster: "assets/video/step5-lookdev.jpg",
        dur: "21:14",
        file: "assets/video/step5-lookdev.mp4"
      },
      {
        type: "gif",
        title: "LUT toggle",
        caption: "The same frame grading off / grading on, 4-second loop.",
        src: "assets/gifs/step5-lut-toggle.gif",
        file: "assets/gifs/step5-lut-toggle.gif"
      },
      {
        type: "image",
        title: "Three atmosphere variants side by side",
        caption: "Dawn fog / flat noon / warm dusk, same camera, compared directly.",
        src: "assets/images/step5-atmosphere-variants.jpg",
        file: "assets/images/step5-atmosphere-variants.jpg"
      },
      {
        type: "gif",
        title: "Light direction sweep",
        caption: "Continuous azimuth sweep from 180° to 45° to pick the best angle (6-second loop).",
        src: "assets/gifs/step5-light-sweep.gif",
        file: "assets/gifs/step5-light-sweep.gif"
      }
    ],

    tips: [
      { title: "Write the numeric ranges down", text: "Put the allowed ranges for hue / saturation / value / roughness into the standard document. With ranges, judgement becomes comparison instead of argument." },
      { title: "Materials before lighting", text: "Adjusting light before materials are aligned means forever patching holes. The order is: converge materials → unify lighting → close with the grade." },
      { title: "Manual exposure", text: "Turn auto exposure off. It makes the look jump between cameras and is the most overlooked killer of consistency." },
      { title: "One benchmark image", text: "Pick a single “visual benchmark frame” and compare every new asset against it. Much easier to execute than an abstract standard." },
      { title: "Leave grading headroom", text: "Do not max out contrast in engine. Keep shadows above 5% and highlights unclipped so the LUT has room to work." }
    ],
    pitfalls: [
      { title: "Grading by feel", text: "Without numeric ranges, twenty assets produce twenty styles, and none of it transfers to the next project." },
      { title: "Lighting used to hide problems", text: "Covering inconsistent materials with strong light and heavy fog looks fine briefly, then falls apart the moment you change camera or atmosphere." },
      { title: "Wrong texture colour space", text: "Reading roughness as sRGB washes everything out and greys it down. Most people read that as a taste problem when it is a settings problem." },
      { title: "Atmosphere variants from different cameras", text: "Comparing atmospheres across different cameras is not a comparison. Fix the camera and the parameters, change only the light." }
    ],
    checkpoint: "Every material sits inside the fixed numeric ranges; one reusable light rig is applied to all cameras; exposure is locked with no automatic jumping; a LUT is generated and applied; 2–3 reproducible atmosphere variants exist; and the hero-look screenshots match the step 01 locked concept in tone."
  });
})(window.WIKI);
