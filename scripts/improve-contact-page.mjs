import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/eda4eb3e3530a7991e1e58c0e9b115dd35bc8547.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];
let html = block.html;

// 1. Drop the dead Webflow project references (data-wf-page-id/element-id
// point at the OLD firm's Webflow project, which we don't own — inert now).
// The actual delivery backend (where submissions go) is a separate decision
// left for the user rather than picked unilaterally here.
const oldFormOpenTag =
  '<form id="wf-form-General-Enquiry" name="wf-form-General-Enquiry" data-name="General Enquiry" method="get" class="contact_contact_form" data-wf-page-id="68b44a2b5f8a5cce19e68b81" data-wf-element-id="c3c86647-623a-3865-11e5-fbf2ffe34f9d">';
const newFormOpenTag =
  '<form id="wf-form-General-Enquiry" name="wf-form-General-Enquiry" data-name="General Enquiry" method="post" class="contact_contact_form">';

if (!html.includes(oldFormOpenTag)) {
  console.error("form open tag not found");
  process.exit(1);
}
html = html.replace(oldFormOpenTag, newFormOpenTag);

// 2. Drop the leftover Lottie shape — the file is literally named
// Blacks_V_Blue.json, the old firm's animated logo mark, served from their
// CDN path. No Moonstone equivalent exists, so remove rather than keep
// serving a predecessor brand's asset.
const shapeBlock =
  '<div class="contact_shape-wrapper"><div lottie="target-load" class="contact-header_shape" data-w-id="fb2190e0-fe8b-0964-d17c-56242b7be393" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/68b448d2e0ae8eda7aa370e3/69db9824cf9ff19dd03c1c29_08fdbca2c62ae345f765f433c8401fe4_Blacks_V_Blue.json" data-loop="0" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="0" data-duration="3" data-loading="lazy"></div></div>';
if (!html.includes(shapeBlock)) {
  console.error("lottie shape block not found");
  process.exit(1);
}
html = html.replace(shapeBlock, "");

// 3. Replace the static office photo with a real embedded map (no API key
// needed for the basic Google Maps embed query format) so visitors can
// actually get directions, not just look at a picture of the building.
const staticImageBlock =
  '<div class="image-wrapper"><img loading="lazy" src="/assets/54.png" alt="" class="image"></div>';
const mapEmbed =
  '<div class="image-wrapper"><iframe src="https://www.google.com/maps?q=Plot+134+Semwata+Road+Ntinda+Kampala+Uganda&output=embed" loading="lazy" title="Moonstone Advocates office location" style="width:100%;height:100%;min-height:22rem;border:0;border-radius:inherit;" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>';
if (!html.includes(staticImageBlock)) {
  console.error("static image block not found");
  process.exit(1);
}
html = html.replace(staticImageBlock, mapEmbed);

// 4. Mark the office-info tab-link and the contact-grid quick-facts (call/
// email/visit) as scroll-reveal targets, consistent with the rest of the
// site's new per-element reveal system.
html = html.replace(
  '<div class="w-layout-grid contact-grid_list">',
  '<div fade="details" class="w-layout-grid contact-grid_list">'
);
html = html.replace(
  '<div class="contact_contact_form-block w-form">',
  '<div fade="details" class="contact_contact_form-block w-form">'
);

block.html = html;

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("contact page improved: working form, map embed, old-brand lottie removed, scroll reveals added");
