// node inspect-el.mjs <file> <selector> — lists direct children of first match
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";
const [file, selector] = process.argv.slice(2);
const root = parse(readFileSync(file, "utf8"), {
  comment: true,
  blockTextElements: { script: true, style: true, noscript: true },
});
const el = root.querySelector(selector);
for (const c of el.childNodes) {
  if (c.nodeType === 1) {
    console.log(`<${c.rawTagName}> class="${(c.getAttribute("class") || "").slice(0, 80)}" data-w-id="${c.getAttribute("data-w-id") || ""}" (${c.outerHTML.length}b)`);
  } else if (c.nodeType === 8) {
    console.log(`<!--${c.text.slice(0, 60)}-->`);
  }
}
