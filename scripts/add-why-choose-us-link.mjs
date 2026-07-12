import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

const arrowSvg =
  '<div btn-arrow="right" class="arrow is-button"><div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41l-6.58-6.6a.996.996 0 1 0-1.41 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"></path></svg></div></div>';

const aboutBtn =
  '<a arrow-rotate="trigger" data-btn-hover="" data-theme="primary" href="/about-us" class="btn is-icon w-inline-block"><div class="btn__bg"></div><div class="btn__circle-wrap"><div class="btn__circle"><div class="before__100"></div></div></div><div class="btn__text"><p class="btn-text-p">Learn more about us</p></div>' +
  arrowSvg +
  "</a>";

const whyChooseBtn =
  '<a arrow-rotate="trigger" data-btn-hover="" data-theme="light" href="/why-choose-us" class="btn is-icon w-inline-block"><div class="btn__bg"></div><div class="btn__circle-wrap"><div class="btn__circle"><div class="before__100"></div></div></div><div class="btn__text"><p class="btn-text-p">Why choose us</p></div>' +
  arrowSvg +
  "</a>";

if (!block.html.includes(aboutBtn)) {
  console.error("about button marker not found");
  process.exit(1);
}

block.html = block.html.replace(aboutBtn, aboutBtn + whyChooseBtn);

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("added Why choose us link next to Learn more about us");
