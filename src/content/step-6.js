/* ============================================================================
   step-6.js — 06 Visual Unification & Atmosphere Development
   Source: Final Project Process Book §06 Atmosphere Development (pages 26–29)
   Order follows the document: fundamentals → atmosphere → overall adjustment.
   Sub-steps 6.5 and 6.6 are marked as the deeper passes the document does not
   cover yet.
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-6",
    n: "06",
    title: "Visual Unification & Atmosphere Development",
    short: "Unify",
    en: "Exposure · Sun & sky · Fog · Overall adjustment",
    stage: "LOOK DEV",
    purpose: "Make the street look like one place at one hour. The Process Book runs this chapter in a fixed direction: fix the <strong>fundamentals</strong> first — lock exposure, then set the sun and the sky that stands in for it — and only then add fog, because fog is what turns a lit greybox into a space with distance in it. The last pass is an <strong>overall adjustment</strong>: saturation, contrast and exposure, judged in black and white so the value structure is visible. Material-level convergence and a reusable LUT sit beyond the document's scope and are marked as such.",
    duration: "3–6 days",
    difficulty: "High — controlled by numbers, not by feel",
    inputs: ["Frozen level (dressing included)", "Reference photography for the time of day being built", "Material library", "Post Process Volume, Exponential Height Fog, fog cards"],
    outputs: ["Exposure locked at a fixed EV100, with a sun and sky that read as one time of day", "Exponential height fog with volumetric scattering, tuned for depth", "Fog cards for the background that is not actually distant", "An overall grade checked in black and white", "2–3 reproducible atmosphere variants"],
    tools: ["UE5 — Post Process Volume (exposure, colour grading)", "UE5 — Directional Light, Sky Light, Exponential Height Fog, fog cards", "Substance Painter (material instances)"],
    pipe: { out: "Unified look + atmosphere set", tool: "UE5 Look Dev" },

    intro: [
      "By the end of step 05 the street is dressed and nothing about it is lit. This stage is the look-dev pass, and the Process Book runs it in a strict order — <strong>fundamentals, then atmosphere, then the overall adjustment</strong> — because each step is judged against the one before it. Sub-steps 6.1 to 6.4 follow that chapter page for page. 6.5 and 6.6 are the deeper material and grade passes the document does not cover yet, and they are labelled that way rather than presented as procedure.",
      "The order is not a stylistic choice. Exposure and the sun/sky pair decide whether the frame is readable at all; fog adds depth on top of a frame that already works; the final post pass unifies lightness across everything. Reverse the order and you end up grading a scene whose exposure is still drifting, which is why almost every “the light is off” problem in a student scene turns out to be an auto-exposure problem."
    ],

    substeps: [
      {
        id: "6.1",
        title: "Basic parameters: exposure, sun and sky",
        detail: "Three fundamentals, in this order: <strong>exposure, directional light, sky light</strong>. In the Post Process Volume, set both <code>Min EV100</code> and <code>Max EV100</code> to <strong>1</strong> — equal min and max is what disables auto exposure, so the image stops breathing as the camera moves. The <strong>Directional Light is the sun</strong>: intensity, colour and source angle all follow the time of day. Early morning and dusk are warmer with softer shadows, because the source angle is larger; midday is cooler, close to white, with sharper shadows from a smaller angle. The <strong>Sky Light stands in for ambient, diffuse light</strong> and is what sets the value of the shadowed areas. In a game the shadows generally need to stay readable rather than go pitch black, so sky intensity is often pushed <strong>above</strong> the physically realistic figure. The reliable trick for volume is a warm sun against a cool ambient — that temperature split is what reads as three-dimensional.",
        tasks: [
          "Lock exposure: set both Min and Max EV100 to 1 in the Post Process Volume, then confirm the image no longer shifts as the camera moves",
          "Set the Directional Light as the sun for one specific time of day: intensity, colour temperature, source angle",
          "Match the source angle to the hour — larger for the soft shadows of early morning and dusk, smaller for the sharp shadows of midday",
          "Set the Sky Light intensity for the shadow value you want, and accept that it will sit above the physically realistic figure",
          "Hold a warm sun against a cool ambient, and check the split still reads from the walking route"
        ]
      },
      {
        id: "6.2",
        title: "Exponential height fog — depth and scale",
        detail: "Fog comes after the fundamentals, never before: once the base values are set the scene already reads as an hour of the day, and fog is what gives it distance. In the Exponential Height Fog actor, enable <strong>Volumetric Fog</strong> first — without it the density and colour settings do very little — then tune density, colour and start distance. The physical job of fog is to separate foreground from background and to give the street a scale; its colour sets the mood. Blue or cyan reads as fresh and open, a warmer tint as weight and gravity. The failure to avoid is fog strong enough to flatten the contrast you built in 6.1.",
        tasks: [
          "Enable Volumetric Fog before touching anything else — density and colour do almost nothing without it",
          "Set density and start distance so the far end of the street reads as far away rather than as small",
          "Pick the fog colour for the mood the frame is meant to carry — cool for open, warm for heavy",
          "Judge the fog from the hero camera; a value that looks right in the viewport often disappears at eye level",
          "Back the density off if the shadow structure from 6.1 has gone flat"
        ]
      },
      {
        id: "6.3",
        title: "Fog planes for distance that isn't there",
        detail: "Height fog assumes things get further away as they rise and recede. A background block that sits only thirty metres behind the foreground will not gain distance from it. That is what <strong>fog cards</strong> are for: hand-placed planes that add aerial perspective where the geometry does not provide it. The colour rule is a distance rule — <strong>the closer the card, the lower its saturation</strong>, tending toward white; <strong>the further away, the higher the saturation</strong>, tending toward the sky colour. Get it backwards and the background reads as a painted backdrop instead of as air.",
        tasks: [
          "Find the background objects that still fail to read as distant after 6.2",
          "Place a fog card in front of each one, not around it",
          "Set saturation by distance — near cards washed toward white, distant cards toward the sky colour",
          "Keep the card's own edge invisible; if you can see the plane, the opacity map is too hard",
          "Re-check the silhouette separation from the hero camera"
        ]
      },
      {
        id: "6.4",
        title: "Visual unification: the overall adjustment",
        detail: "The last documented pass is the one the Process Book calls <strong>visual unification</strong>, and it happens entirely in the Post Process Volume: saturation, contrast and exposure, set to move the whole frame toward the intended aesthetic rather than to repair individual assets. Stylised scenes sit higher in saturation, realistic ones lower — that number is a decision, not a default. The second half is a value check, and the most effective way to run it is to <strong>switch the scene to black and white</strong>, where you can see at a glance whether objects of the same type sit in a similar lightness range. The hierarchy that should survive that check: <strong>environment darkest, characters next, effects brightest</strong>. This street has no characters yet, so read it as environment → hero props and lit signage → emissives. Road and surface decals are the one family still free to move, because their lightness is not fixed by a photographic reference.",
        tasks: [
          "Switch the scene to black and white and read the value structure before touching colour",
          "Check the hierarchy: environment < hero props and signage < emissive effects",
          "Pull same-type objects into one lightness range — the b/w view is what exposes the outliers",
          "Set saturation for the intended aesthetic, then contrast, then exposure, in that order",
          "Adjust the road and surface decals last, since they are the one family not locked to a reference"
        ]
      },
      {
        id: "6.5",
        title: "Material consistency audit — beyond the document",
        detail: "The Process Book does not cover material-level convergence. This is the deeper pass, and it is the one that decides whether assets from AI generation, marketplace packs and outsourcing can sit in the same frame. Check four values per material — hue, saturation, roughness, value — and fix anything outside the ranges. Once the ranges exist, a new asset can be judged against them in seconds instead of argued about.",
        tasks: [
          "Fix the visual baseline: hue band (e.g. {{180–220°}}), saturation ceiling (e.g. {{45%}}), value range (e.g. {{20–70%}})",
          "Route every parameter change through material instances; never scatter edits across the master material",
          "Audit and correct material by material, recording values before and after",
          "Check texture colour spaces: albedo as sRGB, roughness / normal as Linear, to avoid colour shifts"
        ]
      },
      {
        id: "6.6",
        title: "Authoring a reusable grade (LUT) — beyond the document",
        detail: "6.4 sets a grade for this scene; this is about making that grade reproducible. If the look has to survive a new camera, a new atmosphere or a second scene, it cannot live in a dozen scattered Post Process Volume values — it needs to be one LUT. Author it outside the engine (DaVinci Resolve or Photoshop), export it as <code>.cube</code> or a strip, and put it back on the volume so every camera and every variant starts from the same colour base. Also the cheapest unification tool there is: one LUT, one white balance, one contrast compression pulls mismatched assets into the same colour space.",
        tasks: [
          "Configure the Post Process Volume: white balance, contrast, tone curve (S-curve), highlight rolloff",
          "Author a project LUT and export it as .cube or a 256×16 strip",
          "Unify bloom / lens flare / sharpening so the look does not jump between cameras",
          "Check that shadows are not crushed and highlights are not clipped — leave grading headroom"
        ]
      }
    ],

    prompts: [
      {
        id: "s6p1",
        title: "Material consistency audit",
        icon: "layers",
        note: "Supports 6.5. Drop in several asset renders or material spheres at once and have the model find whatever falls outside the colour range.",
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
        id: "s6p2",
        title: "Lighting and post-processing plan",
        icon: "flame",
        note: "Supports 6.1 and 6.6. Define a reusable primary light rig and post-processing parameters so every camera reads the same.",
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
        type: "image",
        title: "The three fundamentals, and where they live",
        caption: "Post Process Volume on the left — Min and Max EV100 both at 1, which is what actually turns auto exposure off. Directional Light in the middle: intensity, colour and source angle are the sun. Sky Light on the right: Real Time Capture on, intensity scaled up so the shadows stay readable. These three panels are the whole of 6.1.",
        src: "assets/images/step6-basic-parameters.jpg",
        file: "assets/images/step6-basic-parameters.jpg"
      },
      {
        type: "image",
        title: "Exponential height fog: volumetric on, then density, then distance",
        caption: "Volumetric Fog has to be enabled first or the density values barely register. Then scattering distribution, albedo, density and start distance — and the frame on the right is what those numbers buy: the far end of the street reads as far away rather than as small.",
        src: "assets/images/step6-height-fog.jpg",
        file: "assets/images/step6-height-fog.jpg"
      },
      {
        type: "image",
        title: "A fog card, for distance the geometry does not have",
        caption: "BP_EasyFog is a plane with an opacity map and a tint, placed in front of the background block rather than around it. The colour rule is a distance rule: near cards washed toward white, distant cards toward the sky colour. If the card's own edge is visible, the opacity map is too hard.",
        src: "assets/images/step6-fog-planes.jpg",
        file: "assets/images/step6-fog-planes.jpg"
      },
      {
        type: "image",
        title: "The black-and-white check",
        caption: "Left: the overall adjustment — temperature, saturation, contrast. Right: the same frame with saturation off, which is the only view in which the value structure is actually legible. Same-type objects should land in one lightness range, and the hierarchy environment → props and signage → emissives should survive the check.",
        src: "assets/images/step6-visual-unification.jpg",
        file: "assets/images/step6-visual-unification.jpg"
      },
      {
        type: "youtube",
        title: "Step 06 walkthrough · look dev, fog and the overall adjustment",
        caption: "The recorded pass for this stage: locking exposure, setting the sun and the sky, bringing in the height fog and the fog cards, then the overall adjustment judged in black and white. Streams from YouTube.",
        yt: "https://youtu.be/bRKF-4obHOo",
        wide: true
      }
    ],

    tips: [
      { title: "Exposure before anything else", text: "Set Min and Max EV100 to the same value and the image stops breathing. Almost every “the light keeps changing” complaint is auto exposure still running." },
      { title: "Sun warm, ambient cool", text: "The temperature split between the directional light and the sky light is what gives the frame volume. Same temperature on both reads flat however carefully the rest is tuned." },
      { title: "Fog is depth, not atmosphere dressing", text: "Fog's physical job is to separate foreground from background and give the street a scale. Its colour is the mood layer, and it comes second." },
      { title: "Judge values in black and white", text: "Switching saturation off is the cheapest check in look dev. It shows every object that is the wrong lightness, which colour hides almost perfectly." },
      { title: "One benchmark image", text: "Pick a single “visual benchmark frame” and compare every new asset and every new atmosphere against it. Much easier to execute than an abstract standard." },
      { title: "Leave grading headroom", text: "Do not max out contrast in engine. Keep shadows above 5% and highlights unclipped so the LUT has room to work." }
    ],

    pitfalls: [
      { title: "Auto exposure left on", text: "The single most common cause of a look that will not hold: the image re-exposes itself every time the camera turns, so nothing you set afterwards stays set." },
      { title: "Fog used to hide a weak light setup", text: "Heavy fog over bad lighting looks atmospheric for one screenshot and falls apart the moment the camera or the time of day changes." },
      { title: "Grading in colour", text: "Saturation hides value errors. Grade the black-and-white frame first, or the same wrong-lightness object survives every pass." },
      { title: "Fog cards that read as cards", text: "A hard-edged plane in the background announces itself as a plane. Soften the opacity map and place it in front of the object, never around it." },
      { title: "Wrong texture colour space", text: "Reading roughness as sRGB washes everything out and greys it down. Most people read that as a taste problem when it is a settings problem." },
      { title: "Atmosphere variants from different cameras", text: "Comparing atmospheres across different cameras is not a comparison. Fix the camera and the values, change only the light and the fog." }
    ],

    checkpoint: "Exposure is locked at a fixed EV100 with min and max equal, and the image no longer shifts as the camera moves. The directional light reads as one specific time of day, with its source angle matched to that hour, and the sky light is set high enough that shadowed areas stay readable. Volumetric fog is enabled with density, colour and start distance tuned for depth rather than for mood alone, and any background that still fails to read as distant has its own fog card, saturated by distance. The overall adjustment has been judged in black and white: same-type objects sit in one lightness range and the environment → props → emissives hierarchy survives. Materials sit inside the fixed numeric ranges where that pass was run, a LUT makes the grade reproducible, and 2–3 atmosphere variants exist from the same cameras."
  });
})(window.WIKI);
