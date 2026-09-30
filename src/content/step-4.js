/* ============================================================================
   step-4.js — 04 Environment Dressing & Scene Composition
   Source: Final Project Process Book §04; Sprint 2 POC §7.1–7.2 (scope adjustment)
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-4",
    n: "04",
    title: "Environment Dressing & Scene Composition",
    short: "Dressing",
    en: "Blueprint · Assembly order · Facade variation · Freeze",
    stage: "SET DRESSING",
    purpose: "Assemble the inspected components into buildings inside a Blueprint, place those buildings into the blockout level, and manage variety deliberately — because buildings are the most-reused assets in an urban scene, and the cheapest way to look rich is <strong>editing what you already have</strong> rather than generating more.",
    duration: "2–4 weeks (schedule slot: weeks 5–7)",
    difficulty: "Medium-high — judgement about variety and repetition dominates",
    inputs: ["Walkable UE5 greybox with frozen massing", "Inspected Tripo components in the asset library", "Component list and storey heights from step 02"],
    outputs: ["Reusable building Blueprints", "Dressed street with the repetition edited out", "Camera sheet and a frozen composition"],
    tools: ["Unreal Engine 5 (Blueprints, placement)", "Material instances (colour variation)", "PureRef for composition reference"],
    pipe: { out: "Assembled buildings + dressed street", tool: "UE5 Blueprint" },

    intro: [
      "Buildings are the highest-reuse assets in almost any urban environment: a town or city scene gets built from a <strong>small number of building designs placed many times</strong>. That is not a shortcut, it is how these scenes are actually authored — and it is why the work in this step happens in a Blueprint rather than by hand in the level. A Blueprint lets you change every instance of a building at once, which is what makes the editing decisions below affordable.",
      "The process of assembling a building mirrors the process of blocking out the environment, and both start the same way: block out first, to fix the building's <strong>approximate floor heights</strong> and the general placement of its components — columns, windows, railings — before any detail goes in. The second half of this step is the part that decides whether the street looks designed or looks stamped: <strong>deciding where variety actually matters, and editing repetition out everywhere else</strong>."
    ],

    substeps: [
      {
        id: "4.1",
        title: "Block out the building before you assemble it",
        detail: "The building gets the same treatment the street got in step 02: a rough pass to establish <strong>approximate floor heights</strong> and the general placement of columns, windows and railings, with no detail yet. Working at this level first is what stops you from hand-placing decorative components into a building whose proportions are still moving. The massing may only move slightly, but it will move — and moving it after assembly means redoing the assembly.",
        tasks: [
          "Block the building inside the Blueprint at the storey heights published by step 02",
          "Place a placeholder for every component position: columns, window openings, railings, signage band",
          "Check the block against the street blockout — the building has to sit the way the greybox said it would",
          "Only then swap placeholders for the real inspected components"
        ]
      },
      {
        id: "4.2",
        title: "Assemble components in the order that avoids rework",
        detail: "Assembly follows the same logic as dressing a scene: <strong>large-scale elements first, then smaller items, then decoration</strong>. In a building that means <strong>walls and columns first, windows and doors after, and decorative features last</strong>. The reason is practical, not aesthetic — decorative pieces placed early get destroyed by every later adjustment to walls or openings, and hand-placed trim is the most expensive thing to redo.",
        tasks: [
          "Place walls and columns first; check spacing and alignment against the block",
          "Add windows and doors, checking that openings line up with the structural grid",
          "Add decorative features last — plaques, balustrades, signage, trim",
          "Build the Blueprint so the whole assembly can be re-placed with different parameters"
        ]
      },
      {
        id: "4.3",
        title: "Differentiate facades instead of adding building types",
        detail: "In a city block, <strong>not every facade of a building is seen at once</strong> — so facades can carry different treatments without the viewer ever noticing they belong to the same volume. This is the main lever for keeping performance under control: rather than generating a new building type whenever a street starts to look samey, vary the facade treatment of the buildings you already have. Fewer unique buildings means fewer unique materials and draw calls, and the difference is invisible from any single viewpoint.",
        tasks: [
          "Work out which facades are visible from the walkthrough and hero cameras and which are never seen",
          "Vary the treatment across facades rather than adding a new building type",
          "Give visible facades the detailed components; let hidden ones carry cheaper treatments",
          "Keep the count of unique materials under control — check it as you go, not at the end"
        ]
      },
      {
        id: "4.4",
        title: "Edit repetition out — with angles and texture colour",
        detail: "This is the scope decision the proof of concept forced, and it is worth understanding rather than just following. The environment's size did not change: a medium-scale arcade street around a central intersection, with three to four main storefront units. What changed is the <strong>variety of building types, which was deliberately reduced</strong>. Repetition is then managed by editing rather than by generating new assets — <strong>varying the placement angle of modules and adjusting texture colours</strong> — so the reduced variety is not visually obvious. For a city block this is entirely reasonable: not every facade of a building is visible at once, so a repeated building read from a different angle is largely a different image.",
        tasks: [
          "Reduce the number of unique building types to what the schedule can actually produce",
          "Break repetition with module placement angle before reaching for a new asset",
          "Vary texture colour between instances of the same design via material instances",
          "Walk the route and mark every place where repetition reads as repetition"
        ]
      },
      {
        id: "4.5",
        title: "Compose the block, then freeze the composition",
        detail: "With the buildings assembled, the street is composed: the central intersection, the storefront units around it, the sightlines down each arm. Then it is frozen, for the same reason blockout was frozen — everything from here on changes lighting and material, and both are cheaper to tune against geometry that has stopped moving.",
        tasks: [
          "Compose the intersection and the three-to-four storefront units as the focus of the block",
          "Check the hero view and the walkthrough route against the step 01 concept frame",
          "Capture a camera sheet: hero view, walking views, and the compositions worth defending",
          "Freeze the layout and the Blueprint parameters; hand off to step 05 for unification"
        ]
      }
    ],

    prompts: [
      {
        id: "s4p1",
        title: "Blueprint assembly order plan",
        icon: "layers",
        note: "Turns the component library into a buildable assembly sequence with a Blueprint structure — so the order of placement is decided on paper, not discovered by redoing it in engine.",
        variants: [
          {
            key: "A",
            name: "From the component library",
            tag: "Recommended",
            use: "Before you start placing anything in the Blueprint",
            out: "An ordered assembly plan plus a parameter list",
            note: "Feed it your inspected component list; it returns the order and suggests what should be exposed as a Blueprint parameter",
            text: `You are an environment artist assembling {{a Guangzhou qilou arcade building}} in Unreal Engine from a fixed set of AI-generated components.

My component library: {{wall panels, windows, columns, doors, balustrades, floor slabs, plaques, roof pieces}}.

Produce:
1. ASSEMBLY ORDER — the exact sequence to place components in, justified by what has to be final before something else can be placed. Walls and columns, then openings, then decoration — confirm or correct that order for this building.
2. BLUEPRINT PARAMETERS — which properties should be exposed (storey count, column spacing, facade variant, material colour, signage presence) so one Blueprint can produce several buildings.
3. VARIANT STRATEGY — how many visual variants one Blueprint should produce before it is worth a second Blueprint, given that a city block rarely shows more than two facades at once.
4. FAILURE POINTS — what will break if the massing changes after assembly, and what to do about it now.

Be specific about order. Vague answers here cost rework in engine.`
          },
          {
            key: "B",
            name: "Reverse-engineer a reference facade",
            tag: "Variant",
            use: "When you have a facade you want to reproduce and need its build order",
            out: "A component-by-component plan read off the image",
            note: "Useful when the concept frame's facade is the target and your library does not obviously cover it",
            text: `Look at {{Image 1}}, {{the facade of a Guangzhou qilou building}}. Break it into the components an environment artist would assemble it from, in the order they would place them.

For each component give:
- name in game-production language (not architectural catalogue language)
- where it sits in the placement order and why
- whether it is structural (defines the building) or decorative (can be swapped per variant)

Then flag:
- any component in the image that my library {{wall panels, windows, columns, doors, balustrades, floors, plaques, roof pieces}} does not cover
- any component that would need to be unique to this facade rather than reusable
- the cheapest three components to vary if this facade is reused down the street`
          }
        ]
      },
      {
        id: "s4p2",
        title: "Repetition audit and facade variation plan",
        icon: "eye",
        note: "Repeat is the thing that makes an assembled block look cheap, and it is hard to see while you are building. This block is for judging it from a screenshot, after the fact.",
        variants: [
          {
            key: "A",
            name: "Screenshot repetition audit",
            tag: "Recommended",
            use: "After the first full dressing pass, before look dev",
            out: "A ranked list of where repetition reads",
            note: "Run it on a wide shot from the walking route, not on a hero render — repetition shows up in ordinary views first",
            text: `This is {{a dressed arcade street}} in Unreal Engine. {{Image 1}} and {{Image 2}} are taken from the walkthrough route, not from a posed hero angle.

Find the repetition. Report as a numbered list, worst first:
1. WHERE — point at the specific buildings or facades that read as copies of each other
2. WHY IT READS — identical silhouette, identical material, identical signage placement, identical spacing between buildings
3. CHEAPEST EDIT — what fixes it without a new asset: rotating the module, changing the placement angle, shifting a texture colour, moving an adjacent mass to change the silhouette
4. LEAVE IT — where repetition is genuinely invisible and not worth spending effort on

Then answer: does this street read as one designed block, or as the same building stamped several times? Be direct.`
          },
          {
            key: "B",
            name: "Facade vs variety budget decision",
            tag: "Planning",
            use: "When you are deciding whether to generate one more building type",
            out: "A reasoned yes / no on new asset generation",
            note: "Written for the situation where generation spend is the constraint rather than model quality",
            text: `I am dressing {{a medium-scale arcade street around a central intersection with three to four main storefront units}}. I have {{N}} unique building designs and a limited generation budget.

The proof of concept behind this project concluded that repetition is better managed by editing than by generating new assets: vary module placement angles and texture colours, and accept the reduced variety because a city block never shows every facade at once.

Given that:
1. How many unique building designs does a block of this size actually need before further generation stops paying for itself?
2. Which specific edits give the largest visible return for the least work — rank them.
3. Where in this block is repetition genuinely visible and would need a new asset rather than an edit?
4. What is the risk of reducing variety this far, and what would make it read as laziness rather than editing?

Answer in concrete numbers and named edits.`
          }
        ]
      }
    ],

    media: [
      {
        type: "image",
        title: "Building Blueprint — blockout inside the assembly",
        caption: "Floor heights and the general placement of components fixed before any detail goes in. The building is blocked out in the same way the street was — approximate volumes first, components positioned, decoration last.",
        src: "assets/images/step4-building-blockout.jpg",
        file: "assets/images/step4-building-blockout.jpg"
      },
      {
        type: "image",
        title: "Components assembled onto the building",
        caption: "The same building after assembly: walls and columns first, then windows and doors, decorative features last. Buildings are assembled in a Blueprint so one design can be placed many times and still be edited everywhere at once.",
        src: "assets/images/step4-components-assembly.jpg",
        file: "assets/images/step4-components-assembly.jpg"
      },
      {
        type: "video",
        title: "Step 04 dressing walkthrough (to be recorded)",
        caption: "Screen recording slot: Blueprint assembly, placement into the blockout, the repetition-edit pass and the camera sheet. Narrated if possible — the editing decisions are the part worth hearing explained.",
        src: "assets/video/step4-dressing-walkthrough.mp4",
        poster: "assets/video/step4-dressing-walkthrough.jpg",
        dur: "—",
        file: "assets/video/step4-dressing-walkthrough.mp4",
        wide: true
      }
    ],

    tips: [
      { title: "Block out the building first", text: "The building's assembly mirrors the environment's: approximate floor heights and component placement first, detail last. Assembling before the block is fixed means assembling twice." },
      { title: "Walls and columns, then openings, then decoration", text: "Decorative components placed early are destroyed by every later adjustment to walls and openings. Place them last and they survive." },
      { title: "Vary facades, not building types", text: "A city block never shows every facade at once, so facades can differ without the viewer ever knowing they are the same volume. This is the cheapest performance win in the step." },
      { title: "Edit repetition before generating more assets", text: "Reduced building variety is only a problem if it is visible. Rotate module placement angles and shift texture colours first — that is the documented response to this project's scope adjustment, not a compromise invented later." },
      { title: "Judge repetition from the walking route", text: "Repetition is invisible in a posed hero shot and obvious in an ordinary view four buildings down. Audit from the route the player actually takes." },
      { title: "Build it as a Blueprint, not as level geometry", text: "The Blueprint is what makes the editing decisions affordable — change the design once and every instance follows. Hand-placed level geometry makes every variation pass expensive." }
    ],
    pitfalls: [
      { title: "Generating a new building type too early", text: "The instinct when a street looks samey is to generate more assets. Rotation and texture variation are cheaper and, per the proof of concept, sufficient — reach for generation only where repetition is genuinely visible." },
      { title: "Assembling detail onto unfrozen massing", text: "If the storey heights or column spacing still move after assembly, the assembly has to be redone. Freeze the block first; this is the same rule step 02 ends on." },
      { title: "Treating every facade as visible", text: "Spending detail on facades that are never seen from the walkthrough or hero cameras is the most common waste in dressing. Work out which facades are visible first, then allocate." },
      { title: "Letting the unique-material count creep", text: "Every unique building type tends to bring its own materials. Track the count while you dress — the performance cost of excess variety is real and it arrives quietly." }
    ],
    checkpoint: "The street is assembled from inspected components inside reusable Blueprints, blocked out before assembly and built in the order walls → openings → decoration. Repetition has been edited out using module angle and texture colour rather than new assets, facades are differentiated only where they are actually visible, unique-material count is known, and the composition is frozen with a camera sheet handed to step 05."
  });
})(window.WIKI);
