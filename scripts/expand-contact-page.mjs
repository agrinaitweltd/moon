import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/eda4eb3e3530a7991e1e58c0e9b115dd35bc8547.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];
let html = block.html;

// 1. Add office hours as a fourth quick-fact, alongside Call/Email/Visit.
const oldGrid =
  '<div class="contact-grid_item"><h3 class="heading-style-h6 margin-bottom margin-0">Visit us</h3><p>moonstone.co.ug</p></div></div>';
const newGrid =
  '<div class="contact-grid_item"><h3 class="heading-style-h6 margin-bottom margin-0">Visit us</h3><p>moonstone.co.ug</p></div><div class="contact-grid_item"><h3 class="heading-style-h6 margin-bottom margin-0">Office hours</h3><p>Mon &ndash; Fri, 8:30am &ndash; 5:30pm</p></div></div>';
if (!html.includes(oldGrid)) {
  console.error("quick-facts grid marker not found");
  process.exit(1);
}
html = html.replace(oldGrid, newGrid);

// 2. Add a "what happens next" section after the location/map section, so
// first-time enquirers know what to expect rather than sending a message
// into a void.
const steps = [
  {
    n: "1",
    title: "You send your enquiry",
    body: "Tell us briefly what it's about using the form above, or call or email us directly.",
  },
  {
    n: "2",
    title: "We review and route it",
    body: "Your message is read and passed to the right person on our team for your type of matter.",
  },
  {
    n: "3",
    title: "We get back to you",
    body: "We aim to respond promptly, usually within one working day, to arrange next steps.",
  },
];

const stepsHtml = steps
  .map(
    (s) =>
      `<div fade="details" style="flex:1;min-width:220px;"><div class="text-style-tagline" style="margin-bottom:0.75rem;">${s.n}</div><h3 class="heading-style-h5" style="margin-bottom:0.5rem;">${s.title}</h3><p class="text-size-small">${s.body}</p></div>`
  )
  .join("");

const nextStepsSection =
  '<section fade="trigger" class="section_text"><div class="padding-global"><div class="container-large"><div class="padding-section-large"><div class="margin-bottom margin-large"><h2 data-scroll="" class="heading-style-h2">What happens next</h2></div><div style="display:flex;flex-wrap:wrap;gap:2.5rem;">' +
  stepsHtml +
  "</div></div></div></div></section>";

// Insert right after the closing </section> of the office/map section.
const insertAfter = "</section>";
const lastSectionEnd = html.lastIndexOf(insertAfter);
if (lastSectionEnd === -1) {
  console.error("no closing </section> found to insert after");
  process.exit(1);
}
html =
  html.slice(0, lastSectionEnd + insertAfter.length) +
  nextStepsSection +
  html.slice(lastSectionEnd + insertAfter.length);

block.html = html;

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("expanded contact page: office hours + what-happens-next section");
