import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/0af561420591d14d8f459e5c505aa610aeb43e83.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));

// data.blocks[1] ("section_service-offerings") already has full per-service
// descriptions AND the #service-1..#service-9 anchors the navbar's "Our
// sectors" dropdown actually links to (/about-us#service-1 etc.) — it's
// better content than the summary grid just added, and load-bearing for
// nav. Drop the redundant grid + duplicate CTA from block[0]; block[1]'s own
// "Get in Touch" already closes the page.
const block0 = data.blocks[0];
let html = block0.html;

const arrow =
  '<div btn-arrow="right" class="arrow is-button"><div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41l-6.58-6.6a.996.996 0 1 0-1.41 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"></path></svg></div></div>';

const servicesGridStart = html.indexOf('<section fade="trigger" class="section_text">');
const ctaStart = html.indexOf('<section class="section_cta17">');
const ctaEnd = html.length;

if (servicesGridStart === -1 || ctaStart === -1) {
  console.error("expected sections not found", { servicesGridStart, ctaStart });
  process.exit(1);
}

// Keep everything up to (not including) the services grid section; drop the
// grid and the CTA (both redundant with block[1]'s content).
html = html.slice(0, servicesGridStart);

block0.html = html;

// Also fix an inconsistent email address in block[1] ("info@" vs "hello@"
// used everywhere else — footer, contact page, contact form).
data.blocks[1].html = data.blocks[1].html.replace("info@moonstone.co.ug", "hello@moonstone.co.ug");

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("removed redundant services grid + CTA from block[0]; fixed email in block[1]");
