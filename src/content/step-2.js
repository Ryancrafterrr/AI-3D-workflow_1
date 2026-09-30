/* ============================================================================
   step-2.js — 02 Level Blockout in Unreal Engine 5
   Source: Final Project Process Book §02; Sprint 2 POC §1.3 timeline
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-2",
    n: "02",
    title: "Level Blockout in Unreal Engine 5",
    short: "Blockout",
    en: "Reference plane · True scale · Camera match",
    stage: "GRAYBOX",
    purpose: "Turn the locked concept frame into a walkable greybox. Import the concept art as a <strong>reference plane</strong> with an adjustable master material, build the massing against it — but read it only for what it is reliable about — and build everything with a real-world dimension to actual construction standards.",
    duration: "1–2 weeks (schedule slot: weeks 2–3)",
    difficulty: "Medium — the judgement call is which parts of the concept art to believe",
    inputs: ["Locked concept frame + must-fix list from step 01", "Hand-drawn sketch (road layout, building count)", "Real-world dimensional standards for street elements"],
    outputs: ["Walkable UE5 greybox of the street", "Reference-plane master material", "Component list carried forward to step 03"],
    tools: ["Unreal Engine 5", "Material Editor (master material + instances)", "Reference-plane workflow"],
    pipe: { out: "Walkable greybox + component list", tool: "UE5" },

    intro: [
      "Blockout is where the concept art stops being a picture and starts being a space — and that transition is where it stops being trustworthy. AI concept art of a street gets perspective and real-world proportion wrong often enough that it can only be used as a <strong>rough guide</strong>: it is good at telling you roughly how many buildings line the street, roughly where the road curves, roughly how the volume sits. It is not good at telling you how wide a traffic lane is.",
      "So this step runs two readings of the same image at once. The <strong>massing</strong> follows the reference plane — the composition, the count, the silhouette. The <strong>dimensions</strong> follow construction standards — lane widths, sidewalk depth, storey heights, walkway clearance. Keep those two authorities separate and blockout is fast. Blend them, and you will spend step 04 fixing a street that is the wrong size."
    ],

    substeps: [
      {
        id: "2.1",
        title: "Build the reference-plane master material",
        detail: "The concept art is imported into UE as a plane in the world, so you can build against it at any camera angle. It needs a master material first, and the two things that matter are that <strong>base colour and opacity are exposed as parameters</strong> — so each material instance can be adjusted without touching the master — and that the colour texture is <strong>multiplied by a second adjustable parameter</strong> so the plane's brightness can be dialled to match the lighting while you work. Getting this right once saves re-doing it for every reference plane you add later.",
        tasks: [
          "Create a master material with the concept texture in the Base Color and a matching Opacity input",
          "Convert the base colour texture and the opacity texture into parameters on the master material",
          "Add a scalar parameter and Multiply the colour texture by it for brightness control",
          "Create one material instance per reference plane; set opacity and brightness per instance",
          "Place the plane at the correct height and scale so the horizon sits where the camera will be"
        ]
      },
      {
        id: "2.2",
        title: "Block out the massing against the reference plane",
        detail: "Build the street's volumes with the reference plane visible behind them, matching composition and silhouette. Read the plane for three things only: the <strong>approximate number of buildings lining the street</strong>, <strong>where the road bends</strong>, and the overall massing rhythm (large / medium / small units). Everything else on that plane is decoration. For the sprint-2 scene the shape is fixed in advance: a medium-scale street around a <strong>central intersection with three to four main storefront units</strong> — deliberately bounded so the whole thing stays achievable inside the course timeline.",
        tasks: [
          "Block the road surface and the building rows as simple masses, plane visible behind",
          "Match the building count and the road curve to the plane; ignore its fine detail",
          "Block the three-to-four main storefront units at the intersection first, then the filler rows",
          "Keep every mass on the grid and axis-aligned wherever the design allows"
        ]
      },
      {
        id: "2.3",
        title: "Build dimensional elements to real-world standards",
        detail: "This is the part of blockout that must <strong>not</strong> follow the concept art. Anything with a specific real-world size — traffic lanes and their count, sidewalk and covered-walkway depth, storey height, column spacing, signage clearance heights — is built to actual construction standards, then compared against the plane. Where the two disagree, the standard wins and the plane is wrong. That disagreement is expected, not a mistake.",
        tasks: [
          "Set road width from lane count and real lane width, not from the image",
          "Set sidewalk and qilou covered-walkway depth from standards; check head clearance under the colonnade",
          "Set storey heights and column spacing to plausible figures for the building type",
          "Log every place the concept art and the standard disagree — those become the must-fix entries carried out of this step"
        ]
      },
      {
        id: "2.4",
        title: "Camera match and scale check",
        detail: "Walk the greybox at eye level and at the hero-shot camera. The test is simple: if the space feels wrong underfoot but looks right in the reference frame, the plane is lying about scale. Check the hero view against the concept frame side by side, then check the walk-through view — the one the player will actually see — against nothing but your own judgement.",
        tasks: [
          "Match a camera to the hero view in the concept frame; overlay and compare",
          "Walk the street at 1.7 m eye height and check that widths read correctly",
          "Verify the central intersection reads as a crossing, not as a widening",
          "Correct the master material's brightness so blocks and plane read at the same value"
        ]
      },
      {
        id: "2.5",
        title: "Freeze massing and publish the component list",
        detail: "Once the massing holds, stop rebuilding it and hand the geometry forward: the building masses define how many facade modules step 03 has to generate, and their storey heights define the scale those modules are modelled at. Publishing that list now is what keeps the asset pipeline from producing components that do not fit anything.",
        tasks: [
          "Lock the massing; no further changes without a written reason",
          "List the building types actually needed (this is the input to the variety decision in step 04)",
          "Note the storey heights and column spacings the assets must match",
          "Export the component list to step 03"
        ]
      }
    ],

    prompts: [
      {
        id: "s2p1",
        title: "Concept frame → blockout construction plan",
        icon: "sparkles",
        note: "The whole point of this block is to force the model to separate what the concept art is reliable about from what it is not — before you build anything off it.",
        variants: [
          {
            key: "A",
            name: "Reliable / unreliable split",
            tag: "Recommended",
            use: "Immediately after locking the concept frame, before opening UE",
            out: "A build plan split by trust level",
            note: "Run this on the locked frame. It produces the checklist that replaces guesswork in blockout",
            text: `You are an environment artist preparing a blockout. Analyse {{Image 1}}, a concept image of {{a Guangzhou qilou arcade street}}, and split everything in it into two lists.

LIST A — RELIABLE. Elements this image communicates well enough to build directly from:
- approximate number of buildings along the street
- where the road bends or intersects
- relative massing rhythm (large / medium / small units)
- silhouette and roofline character
- camera position and framing of the hero view

LIST B — UNRELIABLE. Everything with a specific real-world dimension that an AI-generated image typically gets wrong:
- road width and lane count
- sidewalk and covered-walkway depth
- storey height and total building height
- column spacing and colonnade clearance
- anything that must match real construction standards

For every item in LIST B, state the real-world standard that should be used instead, as a number or range. Be explicit and blunt. Then output a numbered blockout order: what to build first, second, third, given the two lists.`
          },
          {
            key: "B",
            name: "Same analysis, sketch as authority",
            tag: "Cross-check",
            use: "When you want the model to privilege your sketch over the AI render",
            out: "A layout read taken from the drawing, not the render",
            note: "Useful when the render drifted from the sketch — this reconciles the two before you build",
            text: `Attached: {{Image 1}} is my hand-drawn sketch of the street (this defines the layout), {{Image 2}} is the AI concept render of the same street (this defines the look).

1. From {{Image 1}} only, list the layout facts: road direction, number of buildings, where the intersection sits, the camera position of the hero view.
2. From {{Image 2}} only, list what changed: buildings added or merged, road bent or widened, camera moved.
3. Say which of those changes are acceptable staging improvements and which break the layout.
4. Output a blockout brief that builds the layout of {{Image 1}} with the staging of {{Image 2}}, and mark every dimension that must come from real-world standards rather than either image.`
          }
        ]
      },
      {
        id: "s2p2",
        title: "Blockout screenshot → scale diagnosis",
        icon: "eye",
        note: "Two screenshots — one of the reference plane, one of the greybox from the same camera — is enough for the model to find the scale errors while they are still cheap to fix.",
        variants: [
          {
            key: "A",
            name: "Greybox vs reference plane",
            tag: "Verified",
            use: "After the first full massing pass",
            out: "A ranked list of scale and proportion errors",
            note: "Compare like with like: same camera, same focal length, matched brightness",
            text: `You are reviewing an environment blockout against its reference.

{{Image 1}} is the AI concept frame used as a reference plane. {{Image 2}} is my UE5 greybox from a matched camera.

Report, as a checklist with the correction for each:
1. MASSING DRIFT — buildings that are too tall, too short, too wide or too narrow against the reference
2. ROAD — width and curve compared with {{road standard}}, and whether the lane count reads correctly
3. WALKWAY — whether the qilou covered colonnade depth and clearance match real construction standards
4. COMPOSITION — where the greybox no longer matches the reference framing, and whether that matters
5. READABILITY — what a player would see walking this street, and what would read as fake first

For each item give the specific correction, not a general direction. Then list what is already correct and should be left alone.`
          },
          {
            key: "B",
            name: "Walk-through review (no reference)",
            tag: "Player-eye",
            use: "Judging the space the player actually walks through, not the hero frame",
            out: "Notes on how the street reads on foot",
            note: "Deliberately drops the reference image so the composition cannot bias the judgement",
            text: `Look at {{Image 1}}, {{Image 2}} and {{Image 3}} — greybox screenshots of {{a Guangzhou qilou arcade street}} taken at 1.7 m eye height walking down the street. There is no reference image in this task on purpose.

Answer as a player and as an environment artist:
1. How wide does this street feel, and is that right for {{a busy pedestrian arcade street}}?
2. Where does the eye go first? Is that the intended focal point?
3. Which distances feel wrong underfoot — too tight to walk, or too open to believe?
4. Does the intersection read as a crossing, or just as the road getting wider?
5. What single change would most improve how the space reads on foot?

Be concrete about where in the frame you are looking when you say something.`
          }
        ]
      }
    ],

    media: [
      {
        type: "image",
        title: "Reference plane in UE with the master material applied",
        caption: "The concept art imported as a world-space plane, built against at an angle. Base colour, opacity and a brightness multiplier are all exposed as parameters so each instance can be tuned without editing the master.",
        src: "assets/images/step2-reference-plane-ue.jpg",
        file: "assets/images/step2-reference-plane-ue.jpg"
      },
      {
        type: "image",
        title: "Reference-plane master material graph",
        caption: "Base colour and opacity converted to parameters, colour texture multiplied by an adjustable scalar for brightness. Parameter Groups are organised so a material instance shows only the controls you actually need.",
        src: "assets/images/step2-refplane-material.jpg",
        file: "assets/images/step2-refplane-material.jpg"
      },
      {
        type: "image",
        title: "Blockout pass and adjustments",
        caption: "Four stages of the same street: masses roughed in against the plane, then road width and walkway depth corrected to real-world standards until the proportions hold from the walking camera.",
        src: "assets/images/step2-blockout-pass.jpg",
        file: "assets/images/step2-blockout-pass.jpg"
      },
      {
        type: "video",
        title: "Step 02 blockout time-lapse (to be recorded)",
        caption: "Screen recording slot: reference plane import, master material setup, massing pass and the scale correction. Silent time-lapse is fine for this one.",
        src: "assets/video/step2-blockout-timelapse.mp4",
        poster: "assets/video/step2-blockout-timelapse.jpg",
        dur: "—",
        file: "assets/video/step2-blockout-timelapse.mp4",
        wide: true
      }
    ],

    tips: [
      { title: "Expose the parameters on the master material", text: "Base colour and opacity converted to parameters, plus a scalar multiplied into the colour texture for brightness. Then every reference plane is an instance you can dial in seconds — and matching brightness matters more than it sounds, because you judge massing by value." },
      { title: "Two authorities, kept separate", text: "Composition and massing follow the reference plane. Anything with a real-world dimension follows construction standards. Write down every place they disagree — those are your must-fix entries." },
      { title: "Bound the scene on purpose", text: "A medium-scale street around a central intersection with three to four main storefront units is a decision, not a limitation. It is what keeps the asset count inside the schedule — see the scope adjustment in step 04." },
      { title: "Freeze before you generate assets", text: "Every massing change after step 03 starts is wasted generation spend. Lock the geometry, publish the component list, then generate." },
      { title: "Build the intersection first", text: "The intersection is where composition, scale and sightlines are all decided at once. Block it before the filler rows; if it does not read as a crossing, nothing downstream will fix it." }
    ],
    pitfalls: [
      { title: "Believing the concept art's dimensions", text: "The single most common blockout error. Road width, lane count, storey height and colonnade clearance drawn by an image model are wrong often enough that they must be rebuilt from standards, not measured off the plane." },
      { title: "Letting the reference plane drive the camera", text: "Matching the concept frame exactly feels productive, but the frame the player walks through is a different view. Check both, and let the walking view win when they conflict." },
      { title: "Changing massing after asset generation starts", text: "Generation spend is wasted the moment the masses move. This is why the step ends with a freeze, not with 'good enough for now'." },
      { title: "Skipping the master material shortcut", text: "Wiring the plane texture straight into the material works for one plane and becomes unmanageable at five. Expose the parameters the first time." }
    ],
    checkpoint: "You have a walkable UE5 greybox built against the reference plane, with road, walkway and storey dimensions taken from real-world standards rather than from the image. The massing is frozen, the reference-plane master material exposes base colour, opacity and brightness, and the component list — building types, storey heights, column spacings — has been published to step 03."
  });
})(window.WIKI);
