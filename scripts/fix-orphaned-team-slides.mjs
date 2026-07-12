import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

// An earlier pass that swapped the "How we can help today" team carousel for
// service cards only replaced the opening portion of the w-dyn-items list;
// three original team-member slides (Edwin, Jonathan, Norah) were left
// trailing after the 4 new service cards, each still pointing at
// /assets/team/placeholder.svg. Remove exactly those 3 leftover slides.
const startMarker =
  '<div fs-slider-element="slide" role="listitem" class="fs-4-card-slider_slide w-dyn-item"><div hover-zoom="trigger" class="team-member_item">';
const endMarker = '</div></div></div></div><div class="fs-4-card-slider_navigation-wrapper">';

const startIdx = block.html.indexOf(startMarker);
const endIdx = block.html.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error("markers not found", { startIdx, endIdx });
  process.exit(1);
}

const removed = block.html.slice(startIdx, endIdx);
const removedCount = (removed.match(/team-member_item w-inline-block/g) || []).length;
console.log(`removing ${removedCount} orphaned team-member slides (${removed.length} chars)`);

block.html = block.html.slice(0, startIdx) + block.html.slice(endIdx + "</div></div></div></div>".length);

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("fixed: How we can help today carousel now only contains the 4 service cards");
