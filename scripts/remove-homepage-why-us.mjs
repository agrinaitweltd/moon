import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

// Undo the earlier homepage insertion — /why-choose-us already ships a
// fully-written, better version of this same section (real original copy,
// real images), and the user wants "Why choose us" to live as its own page
// rather than being duplicated inline on the homepage.
const startMarker = '<section fade="trigger" class="section_why-us">';
const endMarker = '<section fade="trigger" class="section_manifesto">';

const startIdx = block.html.indexOf(startMarker);
const endIdx = block.html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error("markers not found or out of order", { startIdx, endIdx });
  process.exit(1);
}

block.html = block.html.slice(0, startIdx) + block.html.slice(endIdx);

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("removed homepage why-us timeline section");
