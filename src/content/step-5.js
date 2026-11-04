/* ============================================================================
   step-5.js — 05 Set Dressing & Scene Composition
   Source: Final Project Process Book §05 Set Dressing

   No prompt library on purpose. Every decision in this stage is a placement
   call made by hand at the camera — the props themselves were generated back in
   step 03, and nothing here asks a model for anything new.
   ========================================================================== */
(function (W) {
  W.steps.push({
    id: "step-5",
    n: "05",
    title: "Set Dressing & Scene Composition",
    short: "Dressing",
    en: "Largest-first · Still-life depth · Shop fitting · Signs of use",
    stage: "SET DRESSING",
    purpose: "Turn an assembled street into a place someone could walk through. Nothing here is generated — the work is deciding <strong>what goes where, and in what order</strong>. The order is the one a still-life drawing uses: the dominant mass first, then the medium form that supports it, then the small thing further away. That hierarchy is what the eye reads as depth, and it is why this stage sorts by size instead of by prop type.",
    duration: "1–2 weeks (schedule slot: weeks 6–7)",
    difficulty: "Medium — no technical risk, but every call is a composition decision",
    inputs: ["Assembled building Blueprints placed in the blockout", "Prop and fixture library from the asset stage", "Camera sheet from step 04"],
    outputs: ["Dressed street with a readable size hierarchy", "Fitted-out shops for both mid-block and corner conditions", "Signs of use that make the block feel inhabited"],
    tools: ["Unreal Engine 5 (placement, decals)", "Prop library from the asset stage", "The camera sheet as the review position"],
    pipe: { out: "An inhabited, layered street", tool: "UE5 placement" },

    intro: [
      "By the end of step 04 the street is architecturally correct and completely uninhabited: every storey height is right, every column is where it should be, and nothing on the street suggests a person has ever stood on it. This stage closes that gap, and it does so by hand, one prop at a time.",
      "The method is borrowed from <strong>still-life drawing</strong>, and it is worth taking literally. A still life is rarely a random arrangement: there is a dominant large form — a vase, a basket — a medium form beside it such as an apple or a cup, and a smaller form further back, a spoon. That hierarchy is what produces the sense of depth, not the amount of detail. The same hierarchy works on a street, which is why the placement order below is <strong>by size, not by category</strong>."
    ],

    substeps: [
      {
        id: "5.1",
        title: "Place from largest to smallest — never by category",
        detail: "Work through the block one size band at a time: large volumes first, then medium furniture, then small clutter. Two things happen at once. The spatial hierarchy is fixed before detail can blur it, and every later object already has a larger neighbour to relate to, which makes positioning faster and more consistent. Dressing by category — all the signage, then all the crates, then all the bins — loses that reference and usually ends with everything at the same visual weight.",
        tasks: [
          "Sort the prop list into three size bands: large volumes, medium furniture, small clutter",
          "Place the entire large band before touching anything smaller",
          "Check the large band alone from the camera sheet — it should already read as a composition",
          "Add the medium band only where it supports a large form, not evenly across the street",
          "Finish with the small band, and stop when every camera view has something for the eye to land on"
        ]
      },
      {
        id: "5.2",
        title: "Fit out the shops — two types, one order",
        detail: "A shop interior follows the same sequence at room scale: the volume is defined by walls, floor and ceiling, then the large fixtures go in (shelving), then the medium items (tables, cartons), then the small ones (baskets). Two shop types cover most of a street. <strong>Mid-block</strong> units sit between the building's load-bearing columns, so their frontage — and therefore their width — is set by the column spacing; that is a measurement, not a design choice. <strong>Corner</strong> units face the street on two sides and carry a larger floor area.",
        tasks: [
          "Measure the column spacing first — the mid-block shop's width is not a free parameter",
          "Build the mid-block type and the corner type as separate Blueprints",
          "Dress every interior large-first: shelving → tables and cartons → baskets",
          "Vary how full the shops are; a street where every unit is equally stocked reads as a showroom",
          "Check each shop from the walking route, not only from the front elevation"
        ]
      },
      {
        id: "5.3",
        title: "Place the distant blocks by height",
        detail: "Background buildings follow the same rule at a different scale: the tallest and largest go in first, and the shorter ones are arranged around them. This is also how real cities form — high-rise buildings cluster, and the tallest in the cluster becomes the landmark that defines the area. Once the tallest silhouette is fixed, the character of the whole background is decided; everything after that is supporting it.",
        tasks: [
          "Place the tallest background block first and judge the skyline from the main camera position",
          "Cluster the shorter blocks around it instead of spreading them evenly",
          "Keep gaps between distant blocks readable — a solid wall of buildings kills the depth the foreground just earned",
          "Re-check the skyline from the camera sheet rather than from the editor viewport"
        ]
      },
      {
        id: "5.4",
        title: "Add the signs of use",
        detail: "The last pass is made of small things and decides most of the character. Rotate props a few degrees off-axis, leave a chair pulled out, wear the step where feet would land, let a sign fade unevenly. None of these are large objects and none of them are random: each one is a <strong>trace of a specific action</strong>. The rule that keeps this from turning into clutter is that every sign of use should answer one question — who did this, and why.",
        tasks: [
          "Rotate a handful of props off-axis — perfectly aligned rows read as a render, not a street",
          "Add wear only where a body would actually touch: thresholds, counters, handrails",
          "Place one or two props that imply an interrupted action — a stool moved aside, a crate left open",
          "Stop before the street becomes a story; the goal is evidence of use, not a narrative"
        ]
      }
    ],

    // Nothing in this stage is generated — see noPromptNote below.
    prompts: [],
    noPromptNote: "This stage has no prompt library, and that is deliberate. The props and fixtures were generated in step 03; everything from here on is placed by hand and judged at the camera. A prompt would only be able to guess at what the block needs.",

    media: [
      {
        type: "image",
        title: "The size hierarchy, applied to a shop and to a still life",
        caption: "Left: the fitted-out shop, with the three size bands outlined — the shelving as the large volume, the stacked cartons as the medium form, the baskets as the small one. Right: the two still-life studies the method comes from, marked the same way. The point of the comparison is that the bands are not a styling choice; they are the same three-role structure read at room scale and at drawing scale.",
        src: "assets/images/step5-store-set-dressing.jpg",
        file: "assets/images/step5-store-set-dressing.jpg"
      },
      {
        type: "image",
        title: "Placing the distant blocks by height",
        caption: "Two passes over the same background. The tallest silhouette goes in first and defines the character of the cluster; the shorter blocks are then arranged around it rather than spread evenly across the horizon. An even row of towers at one distance reads as a fence — clustering is what the eye reads as a skyline.",
        src: "assets/images/step5-distant-blocks.jpg",
        file: "assets/images/step5-distant-blocks.jpg"
      }
    ],

    tips: [
      { title: "Order by size, not by category", text: "The placement order <em>is</em> the method. Sorting props by type feels tidier in the outliner and produces a flat street, because nothing was ever placed against something larger." },
      { title: "Still life is the actual reference", text: "Large form, a medium form supporting it, a small form further away. If a view feels flat, check whether it has that hierarchy before adding another prop." },
      { title: "Two shop types cover a street", text: "Mid-block and corner. The mid-block width is dictated by column spacing — measure it before you model anything, or the whole type has to be rebuilt." },
      { title: "Wear goes where hands go", text: "Wear on surfaces nobody touches reads as dirt. Put it on thresholds, counters and handrails, and leave the rest clean." }
    ],

    pitfalls: [
      { title: "Dressing by category", text: "All the signage, then all the crates, and everything ends up at the same visual weight because nothing was ever measured against a larger neighbour." },
      { title: "Every shop stocked the same", text: "It reads as a showroom rather than a street. Deliberately under-fill a couple of units so the eye has somewhere to rest." },
      { title: "Evenly distributed background blocks", text: "Real skylines cluster. An even row of towers at the same distance reads as a fence, not a city." },
      { title: "Confusing clutter with detail", text: "More props is not more depth. Depth comes from the size hierarchy; clutter only raises the noise floor and makes the composition harder to read." }
    ],

    checkpoint: "The street is dressed large-to-small: the large band reads as a composition on its own from every camera in the sheet, the medium band supports it rather than spreading evenly, and the small band gives the eye a landing point in each view. Shops are fitted out in both mid-block and corner types, with at least a couple deliberately under-filled. Distant blocks cluster around a tallest silhouette with readable gaps between them. Signs of use sit only where a body would touch, the scene reads as inhabited from the walking route, and the composition is frozen for step 06."
  });
})(window.WIKI);
