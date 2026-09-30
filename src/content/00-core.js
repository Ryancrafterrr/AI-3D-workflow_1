/* ============================================================================
   00-core.js — site meta + how to use + pipeline overview
   Content model is documented in README.md. Every step-N.js pushes one record
   into WIKI.steps, so adding a step = adding a file.

   Copy for steps 01–04 and for the appendix is written up from the two Canva
   source documents (Final Project Process Book, Sprint 2 – Proof of Concept
   A4 v3). Figures in assets/images/ are cropped out of those same documents by
   tools/extract_canva_images.py — see README §8.
   ========================================================================== */
window.WIKI = {
  meta: {
    title: "AI-Assisted Environment Art Workflow",
    titleEn: "Lingnan Arcade Street · Unreal Engine 5",
    lede: "A working record of the <strong>AI-assisted environment art pipeline</strong> used to build a Guangzhou Lingnan arcade (<code>qilou</code>) street in Unreal Engine 5 — visual research and concept development, UE5 blockout, asset generation and refinement, environment dressing, visual unification, and final delivery. Every stage carries the timings, iteration counts and generation costs that were actually logged while it ran.",
    lede2: "The pipeline was validated in <strong>Sprint 2</strong> with a focused proof of concept: one representative building component carried end to end through Procreate, TapNow, Tripo 3D and Unreal Engine 5. Steps 01–04 below are written up from that evidence, with the source figures included. Steps 05–06 still carry placeholder content.",
    version: "v0.2 · REAL CONTENT",
    updated: "2026-09-30",
    badges: [
      { text: "Built from production logs", tone: "live" },
      { text: "6-step pipeline", tone: "" },
      { text: "Single page · no page loads", tone: "" },
      { text: "Prompts copy in one click", tone: "" }
    ],
    stats: [
      { v: "06", l: "Workflow steps" },
      { v: "28", l: "Source figures" },
      { v: "55", l: "Logged iterations" },
      { v: "$10.6", l: "Generation cost logged" }
    ]
  },

  quickstart: {
    title: "How to use this wiki",
    lead: "Everything lives on this single page — nothing will send you somewhere else. Four interactions carry the whole experience; spend 30 seconds here before you start.",
    items: [
      {
        icon: "menu",
        title: "Pinned rail + top jump bar",
        text: "The chip bar at the top jumps straight to any of the 6 steps. The rail on the left stays pinned to the screen for the entire scroll, highlights the section you are reading, and expands the sub-steps of the current step."
      },
      {
        icon: "copy",
        title: "One-click prompts",
        text: "Every prompt block offers A–E variants. Click one and that variant lands in your clipboard immediately — switch to TapNow, Tripo or your model of choice and hit Ctrl+V. The prompts are the ones that were actually run, not tidy rewrites of them."
      },
      {
        icon: "check",
        title: "Task tracking",
        text: "Tasks inside each sub-step can be checked off one by one. Progress is stored in your local browser, and the ring in the left rail shows how far through the pipeline you are."
      },
      {
        icon: "clock",
        title: "Logged cost and time",
        text: "Steps 01–04 carry the real numbers from the Sprint 2 test and evidence passes — minutes, iterations and generation cost per stage — so you can budget your own run instead of guessing at it."
      }
    ]
  },

  pipeline: {
    title: "Pipeline overview",
    lead: "Six steps take you from reference to finished film. Click any card to jump to that section. The muted tag is the one thing that must exist when the step is done.",
    items: [
      /* injected by each step-N.js */
    ]
  },

  steps: [
    /* injected by step-1.js … step-6.js */
  ],

  appendix: {}
};
