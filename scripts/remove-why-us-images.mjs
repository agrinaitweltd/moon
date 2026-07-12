import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

const target =
  '<div class="why-us_image_component"><div class="why-us_image-wrapper"><img src="/assets/10.png" loading="lazy" data-scroll="" data-scroll-speed="-0.1" alt="" class="image is-parallax"></div><div class="why-us_image-wrapper"><img src="/assets/11.png" loading="lazy" data-scroll="" data-scroll-speed="-0.1" alt="" class="image is-parallax"></div></div>';

if (!block.html.includes(target)) {
  console.error("target not found");
  process.exit(1);
}

block.html = block.html.replace(target, "");

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("removed why-us image component");
