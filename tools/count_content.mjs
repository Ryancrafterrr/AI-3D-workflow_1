// Dev helper: count the structure the content files declare, without a browser.
// Used to confirm the qa_nav.mjs baseline numbers after a content change.
import fs from "node:fs";
import vm from "node:vm";

const ctx = { window: { WIKI: { steps: [] } } };
vm.createContext(ctx);
for (const f of fs.readdirSync("src/content").sort()) {
  vm.runInContext(fs.readFileSync("src/content/" + f, "utf8"), ctx, { filename: f });
}
const W = ctx.window.WIKI;

let tasks = 0, variants = 0, media = 0, subs = 0;
for (const s of W.steps) {
  const t = (s.substeps || []).reduce((a, x) => a + (x.tasks || []).length, 0);
  const v = (s.prompts || []).reduce((a, p) => a + p.variants.length, 0);
  subs += (s.substeps || []).length;
  console.log(
    s.n + " " + s.title.padEnd(42) +
    " substeps=" + (s.substeps || []).length +
    " tasks=" + String(t).padStart(2) +
    " prompts=" + (s.prompts || []).length +
    " variants=" + v +
    " media=" + (s.media || []).length
  );
  tasks += t; variants += v; media += (s.media || []).length;
}
console.log("\nTOTAL steps=" + W.steps.length + " substeps=" + subs +
  " tasks=" + tasks + " variants=" + variants + " media=" + media);
