/* ============================================================================
   step-5.js — 05 Set Dressing & Scene Composition
   Source: Final Project Process Book §05 Set Dressing (7 pages)

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
    en: "Largest-first · Prop order · Decals · Signs of use",
    stage: "SET DRESSING",
    purpose: "Turn an assembled street into a place someone could walk through. Nothing here is generated — the work is deciding <strong>what goes where, and in what order</strong>. The order is the one a still-life drawing uses: the dominant mass first, then the medium form that supports it, then the small thing further away. That hierarchy is what the eye reads as depth, and it is why this stage sorts by size instead of by prop type — then by type inside each size band, and finally at decal scale, where markings, patches, cracks and water stains follow the same logic.",
    duration: "1–2 weeks (schedule slot: weeks 6–7)",
    difficulty: "Medium — no technical risk, but every call is a composition decision",
    inputs: ["Assembled building Blueprints placed in the blockout", "Prop and fixture library from the asset stage", "Decal library: road markings, patches, cracks, water stains", "Camera sheet from step 04"],
    outputs: ["Dressed street with a readable size hierarchy", "Props ordered by type inside each size band", "Fitted-out shops for both mid-block and corner conditions", "A road that reads as used: markings, patched asphalt, water staining", "Signs of use that make the block feel inhabited"],
    tools: ["Unreal Engine 5 (placement, decals, decal projection)", "Prop library from the asset stage", "The camera sheet as the review position"],
    pipe: { out: "An inhabited, layered street", tool: "UE5 placement" },

    intro: [
      "By the end of step 04 the street is architecturally correct and completely uninhabited: every storey height is right, every column is where it should be, and nothing on the street suggests a person has ever stood on it. This stage closes that gap, and it does so by hand, one prop at a time.",
      "The method is borrowed from <strong>still-life drawing</strong>, and it is worth taking literally. A still life is rarely a random arrangement: there is a dominant large form — a vase, a basket — a medium form beside it such as an apple or a cup, and a smaller form further back, a spoon. That hierarchy is what produces the sense of depth, not the amount of detail. The same hierarchy works on a street, which is why the placement order below is <strong>by size, not by category</strong>.",
      "It also works <strong>below prop scale</strong>. Road markings, patched asphalt, cracks and water staining are all decals, and they are placed in the same order and judged the same way — a big patch with a smaller one beside it, cracks that explain the patch, staining spaced unevenly on purpose. A street dressed down to props but left with a clean, evenly marked road still reads as a render."
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
        title: "Order props by type inside each band",
        detail: "Size gets you the bands; <strong>type</strong> gets you the order within them, and that order is largely fixed by scale. For an urban street the working sequence is <strong>vehicles, trees, bicycles and motorcycles, small props such as bins and flower pots, shrubs, then climbing plants</strong>. For a natural environment it is <strong>rock formations, then vegetation, then everything else</strong> — the same principle of largest to smallest, primary to secondary, applied inside a band. Reality overrides taste in a few places: traffic lights and utility lines have to exist where they have to exist. A game environment is a distilled, aestheticised version of a street rather than a fantasy one, so keep the required elements and compose everything else around them.",
        tasks: [
          "Write the type order for this block before placing anything: vehicles → trees → bikes → small props → shrubs → vines",
          "Place the vehicles first — they set the scale the rest of the street is read against",
          "Keep the real-world necessities (traffic lights, utility poles, lines) where reality puts them, and compose around them",
          "Add planting last, and treat it as composition rather than decoration — see 5.7 for the spacing rule",
          "Re-check the order from the camera sheet: if a bin reads as loudly as a bus, the bands have collapsed"
        ]
      },
      {
        id: "5.3",
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
        id: "5.4",
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
        id: "5.5",
        title: "Lay the road markings before anything else",
        detail: "A large share of what makes an urban scene feel real is decal work, and the road is where it starts. Lane dividers, crosswalks, stop lines and directional arrows are all decals and all carry an enormous amount of realism for very little cost, so they go down <strong>first</strong> — before patches, cracks, staining or grime. Getting the markings in early also fixes the geometry everything else reacts to: a patch sits inside a lane, a stain runs along a gutter, a crack follows the edge of a repair. Put them in last and every later decal has to be forced into a road that has no structure yet.",
        tasks: [
          "Lay the marking pass first: lane dividers, crosswalks, stop lines, arrows",
          "Keep the markings consistent with the block's traffic logic — a one-way street does not get two-way arrows",
          "Check the markings at eye level from the walking route, not only from a top view",
          "Only then start the damage pass in 5.6"
        ]
      },
      {
        id: "5.6",
        title: "Patches and cracks: give every decal a cause",
        detail: "Damage decals follow the still-life rule too: a <strong>large patch is accompanied by a smaller one</strong>, then a medium utility cover, then the smallest cracks — a descending chain of scale rather than a uniform sprinkle. The second half of the rule matters more: <strong>the placement has to obey real-world cause</strong>. A patch on asphalt exists because the asphalt cracked, so the crack goes next to the patch — that is what tells the story of a surface that failed and was filled. A patch with no crack around it, or a crack that runs nowhere, reads as a texture rather than as wear, and the eye rejects it even when it cannot say why.",
        tasks: [
          "Place patches as a chain: large patch → smaller patch → utility cover → smallest cracks",
          "Put the crack next to the patch it came from — causality is what sells the decal",
          "Keep utility covers on the road's real service lines, not scattered for visual interest",
          "Check the damage pass at 100% from the camera sheet; decals that read well in the editor often vanish at eye level",
          "Stop before the road becomes a ruin — a functioning street is patched, not destroyed"
        ]
      },
      {
        id: "5.7",
        title: "Break the rhythm — water stains, gaps and interruption",
        detail: "The last decal pass is where the scene stops looking procedural, and it comes straight out of still-life drawing's two ideas of <strong>rhythm</strong> and <strong>interruption</strong>. When a drawn edge is too uniform, you introduce folds to interrupt it; when the intervals between folds are too even, you stretch some gaps and tighten others to create rhythm. Cloth that is too smooth, or folded at perfectly regular intervals, looks stiff. The same correction applies to a street: an evenly spaced tree line reads as a fence, a wall of identical shopfronts reads as a texture, and water staining applied at regular intervals reads as a pattern. So vary the spacing deliberately, extend some gaps and tighten others, and let the staining interrupt an edge rather than cover it evenly.",
        tasks: [
          "Place water staining where water would actually run and pool: gutters, column bases, the shaded side",
          "Vary the interval between stains instead of the amount — an even rhythm is what reads as fake",
          "Interrupt long straight edges (kerbs, facades, tree lines) with a deliberate break",
          "Apply the same test to planting: space trees unevenly, and leave one gap where the eye can rest",
          "Compare two camera views side by side — if both look equally regular, the pass is not finished"
        ]
      },
      {
        id: "5.8",
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
        title: "Prop order: vehicles first, planting last",
        caption: "Three passes over the same block. Vehicles go in first and set the scale the street is read against, then trees, then the small stuff — bins, pots, bikes, shrubs, vines. The type order inside a size band is as fixed as the size order between bands.",
        src: "assets/images/step5-prop-hierarchy.jpg",
        file: "assets/images/step5-prop-hierarchy.jpg"
      },
      {
        type: "image",
        title: "Still-life logic applied to a dressed street",
        caption: "The hierarchy holds at prop scale: the bus is the dominant mass, the bicycle the medium form beside it, the traffic light and the utility lines the required real-world elements. The composition is built around those necessities rather than against them.",
        src: "assets/images/step5-prop-stilllife.jpg",
        file: "assets/images/step5-prop-stilllife.jpg"
      },
      {
        type: "image",
        title: "The size hierarchy, applied to a shop and to a still life",
        caption: "Left: the fitted-out shop, with the three size bands outlined — the shelving as the large volume, the stacked cartons as the medium form, the baskets as the small one. Right: the two still-life studies the method comes from, marked the same way. The bands are not a styling choice; they are the same three-role structure read at room scale and at drawing scale.",
        src: "assets/images/step5-store-set-dressing.jpg",
        file: "assets/images/step5-store-set-dressing.jpg"
      },
      {
        type: "image",
        title: "Placing the distant blocks by height",
        caption: "Two passes over the same background. The tallest silhouette goes in first and defines the character of the cluster; the shorter blocks are then arranged around it rather than spread evenly across the horizon. An even row of towers at one distance reads as a fence — clustering is what the eye reads as a skyline.",
        src: "assets/images/step5-distant-blocks.jpg",
        file: "assets/images/step5-distant-blocks.jpg"
      },
      {
        type: "image",
        title: "Markings first: the same frame before and after the road pass",
        caption: "Crosswalk, lane dividers, stop lines and arrows are all decals, and they carry more realism per unit of work than anything else on the road. They go down before any damage decal, because a patch sits inside a lane and a crack follows a repair — the markings are the structure the damage reacts to.",
        src: "assets/images/step5-road-markings.jpg",
        file: "assets/images/step5-road-markings.jpg"
      },
      {
        type: "image",
        title: "Patches, covers and cracks as one descending chain",
        caption: "Top-down, with the chain marked: a large patch, a smaller patch beside it, a utility cover, then the smallest cracks. Note where the cracks sit — next to the patches, because the patch exists because the surface cracked. Damage placed without that causality reads as texture, not as wear.",
        src: "assets/images/step5-decal-patches.jpg",
        file: "assets/images/step5-decal-patches.jpg"
      },
      {
        type: "image",
        title: "Rhythm and interruption — from drawn cloth to water staining",
        caption: "The drawn folds in the middle and right panels show the two corrections: introduce folds to interrupt an edge that is too uniform, and vary the intervals when the spacing is too even. The street on the left is the same principle at scene scale — staining that interrupts an edge, and spacing that is deliberately uneven, is what stops a dressed block from reading as procedural.",
        src: "assets/images/step5-rhythm-interruption.jpg",
        file: "assets/images/step5-rhythm-interruption.jpg"
      },
      {
        type: "youtube",
        title: "Step 05 walkthrough · dressing the block",
        caption: "The recorded pass for this stage: props placed largest-first, shops fitted out, distant blocks set by height, the decal passes over the road, and the small signs of use that close it. No AI in this one — it is all placement and judgement. Streams from YouTube.",
        yt: "https://youtu.be/vky-T_UJrZM",
        wide: true
      }
    ],

    tips: [
      { title: "Order by size, not by category", text: "The placement order <em>is</em> the method. Sorting props by type feels tidier in the outliner and produces a flat street, because nothing was ever placed against something larger." },
      { title: "Still life is the actual reference", text: "Large form, a medium form supporting it, a small form further away. If a view feels flat, check whether it has that hierarchy before adding another prop." },
      { title: "Vehicles set the scale", text: "A bus or a truck is the first thing the eye measures the street against. Place them before anything else in the band and the rest of the block inherits the scale for free." },
      { title: "Two shop types cover a street", text: "Mid-block and corner. The mid-block width is dictated by column spacing — measure it before you model anything, or the whole type has to be rebuilt." },
      { title: "A decal with no cause reads as dirt", text: "Patches come from cracks; stains come from water running somewhere. If you cannot say why a mark is there, it reads as a texture rather than as wear — and viewers notice even when they cannot name it." },
      { title: "Vary the interval, not the amount", text: "Ten stains at even spacing look more artificial than four at uneven spacing. Rhythm is a property of the gaps, not of the quantity." },
      { title: "Wear goes where hands go", text: "Wear on surfaces nobody touches reads as dirt. Put it on thresholds, counters and handrails, and leave the rest clean." }
    ],

    pitfalls: [
      { title: "Dressing by category", text: "All the signage, then all the crates, and everything ends up at the same visual weight because nothing was ever measured against a larger neighbour." },
      { title: "Every shop stocked the same", text: "It reads as a showroom rather than a street. Deliberately under-fill a couple of units so the eye has somewhere to rest." },
      { title: "Evenly distributed background blocks", text: "Real skylines cluster. An even row of towers at the same distance reads as a fence, not a city." },
      { title: "Confusing clutter with detail", text: "More props is not more depth. Depth comes from the size hierarchy; clutter only raises the noise floor and makes the composition harder to read." },
      { title: "A clean, perfectly marked road", text: "Markings with no damage underneath leave the road looking freshly painted. The damage pass is not optional decoration — it is what makes the markings believable." },
      { title: "Damage scattered for visual interest", text: "Cracks that run nowhere and patches with no cause are the fastest way to make a road look like a decal test. Every mark should have a physical reason to be exactly where it is." },
      { title: "A tree line at even intervals", text: "Uniform spacing reads as a fence. Break the interval, extend one gap, tighten the next, and leave one gap empty." }
    ],

    checkpoint: "The street is dressed large-to-small: the large band reads as a composition on its own from every camera in the sheet, the medium band supports it rather than spreading evenly, and the small band gives the eye a landing point in each view. Inside each band the props follow the type order — vehicles, trees, bikes, small props, shrubs, vines — and the required real-world elements such as traffic lights and utility lines are present where reality puts them. Shops are fitted out in both mid-block and corner types, with at least a couple deliberately under-filled. Distant blocks cluster around a tallest silhouette with readable gaps between them. The road carries its markings first, then a patch chain that obeys cause — large patch, smaller patch, utility cover, cracks beside the patch they came from — and water staining whose intervals are deliberately uneven. Signs of use sit only where a body would touch, the scene reads as inhabited from the walking route, and the composition is frozen for step 06."
  });
})(window.WIKI);
