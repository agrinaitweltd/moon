import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const PAGE_PATH = join(ROOT, "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json");

const data = JSON.parse(readFileSync(PAGE_PATH, "utf8"));

const block = data.blocks[0];
let html = block.html;

// Find the "How we can help today" section and replace team cards with service cards
const serviceCards = [
  { title: "Corporate & Commercial Advisory", image: "6" },
  { title: "Tax & Regulatory Advisory", image: "7" },
  { title: "Dispute Resolution", image: "8" },
  { title: "Real Estate, Land & Property", image: "9" },
];

// Build replacement HTML for service cards
const serviceSlides = serviceCards
  .map((service) => {
    return `<div fs-slider-element="slide" role="listitem" class="fs-4-card-slider_slide w-dyn-item"><div hover-zoom="trigger" class="service-card_item" style="position: relative; height: 300px; border-radius: 12px; overflow: hidden; background-size: cover; background-position: center; background-image: url('/assets/${service.image}.png');"><a href="/our-sectors" class="service-card_link w-inline-block" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: flex-end; padding: 24px; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); text-decoration: none;"><div class="service-card_text-wrapper"><div class="text-size-large text-weight-semibold text-color-white">${service.title}</div></div></a></div></div>`;
  })
  .join("");

// Find and replace the slider list content
const sliderListStart = html.indexOf('fs-slider-element="list" role="list" class="fs-4-card-slider_list w-dyn-items"');
const sliderListEnd = html.indexOf("</div>", sliderListStart) + 6; // Find the closing div of the slider list

if (sliderListStart !== -1 && sliderListEnd > sliderListStart) {
  const beforeSlider = html.slice(0, sliderListStart + 'fs-slider-element="list" role="list" class="fs-4-card-slider_list w-dyn-items">'.length);

  // Find the actual end of the list (all slides closed)
  let depth = 0;
  let searchStart = beforeSlider.length;
  let actualEnd = searchStart;

  for (let i = searchStart; i < html.length; i++) {
    if (html[i] === "<" && html.slice(i, i + 4) === "<div") {
      depth++;
    }
    if (html[i] === "<" && html.slice(i, i + 6) === "</div>") {
      depth--;
      if (depth === 0) {
        actualEnd = i + 6;
        break;
      }
    }
  }

  const newHtml =
    beforeSlider +
    serviceSlides +
    html.slice(actualEnd);

  block.html = newHtml;

  const out = `${JSON.stringify(data)}\n`;
  JSON.parse(out); // Validate JSON
  writeFileSync(PAGE_PATH, out);
  console.log("✓ Updated homepage with service cards");
  console.log(`  Replaced team carousel with ${serviceCards.length} service cards`);
} else {
  console.error("✗ Could not find slider list in homepage");
  process.exit(1);
}
