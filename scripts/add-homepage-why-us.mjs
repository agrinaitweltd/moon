import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

const marker = '<section fade="trigger" class="section_manifesto">';
const idx = block.html.indexOf(marker);
if (idx === -1) {
  console.error("marker not found");
  process.exit(1);
}

// Same sticky-timeline component ("timeline4") used on /careers' "Why work
// with us" section, reused here with client-facing copy instead of employee
// benefits. All classes already ship fully styled in webflow-shared.css.
const rows = [
  {
    title: "Practical advice, clearly explained.",
    body: "We cut through legal complexity and tell you plainly what matters, what your options are, and what we recommend. No jargon, no hedging — just advice you can actually act on.",
  },
  {
    title: "Depth across every sector we serve.",
    body: "From corporate and commercial work to real estate, employment, and family law, our specialists bring years of focused experience to your matter, not a generalist's best guess.",
  },
  {
    title: "A team invested in your outcome.",
    body: "We take the time to understand what you're trying to achieve, then stay with you through every stage — responsive, accountable, and genuinely on your side.",
  },
];

const rowsHtml = rows
  .map(
    (r) =>
      `<div fade="details" class="timeline4_row"><div class="timeline4_circle-wrapper"><div class="timeline4_circle"></div></div><div class="timeline4_item"><div class="max-width-small"><h3 class="heading-style-h3">${r.title}</h3></div><p>${r.body}</p></div></div>`
  )
  .join("");

const section =
  `<section fade="trigger" class="section_why-us"><div class="padding-global"><div class="container-large"><div class="padding-section-large"><div class="why-us_component"><div class="margin-bottom margin-xlarge"><h2 data-scroll="" class="heading-style-h1">Why choose us</h2></div><div class="w-layout-grid timeline4_content"><div class="timeline4_progress"><div class="timeline4_fade-overlay-top"></div><div class="timeline4_progress-line"></div><div class="timeline4_line"></div><div class="timeline4_fade-overlay-bottom"></div><div fade="details" class="timeline4_progress-line-cover"></div></div><div class="timeline4_content-right">${rowsHtml}</div></div></div><div class="why-us_image_component"><div class="why-us_image-wrapper"><img src="/assets/10.png" loading="lazy" data-scroll="" data-scroll-speed="-0.1" alt="" class="image is-parallax"></div><div class="why-us_image-wrapper"><img src="/assets/11.png" loading="lazy" data-scroll="" data-scroll-speed="-0.1" alt="" class="image is-parallax"></div></div></div></div></div><div data-hidden="live" class="dark_background"></div></section>`;

block.html = block.html.slice(0, idx) + section + block.html.slice(idx);

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out); // validate round-trip
writeFileSync(PATH, out);
console.log("inserted why-us timeline section before manifesto");
