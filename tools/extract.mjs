// Usage: node tools/extract.mjs <htmlFile> <cssSelector> [--index N]
// Prints the outerHTML of the matched element from a Webflow export page.
// Used to lift shared chrome (navbar/footer) and per-page <main> content.
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";

const [, , file, selector, ...rest] = process.argv;
const idxFlag = rest.indexOf("--index");
const index = idxFlag >= 0 ? Number(rest[idxFlag + 1]) : 0;

const html = readFileSync(file, "utf8");
const root = parse(html, {
  comment: true,
  blockTextElements: { script: true, style: true, noscript: true },
});

const matches = root.querySelectorAll(selector);
if (!matches.length) {
  console.error(`No match for selector "${selector}" in ${file}`);
  process.exit(1);
}
const el = matches[index];
if (!el) {
  console.error(`Index ${index} out of range (found ${matches.length}) for "${selector}"`);
  process.exit(1);
}
process.stdout.write(el.outerHTML);
