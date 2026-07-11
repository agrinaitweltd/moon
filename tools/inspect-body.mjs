// Lists the direct children of <body> with tag + class + a short signature.
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";

const file = process.argv[2];
const root = parse(readFileSync(file, "utf8"), {
  comment: true,
  blockTextElements: { script: true, style: true, noscript: true },
});
const body = root.querySelector("body");
for (const c of body.childNodes) {
  if (c.nodeType === 1) {
    const cls = c.getAttribute("class") || "";
    console.log(`<${c.rawTagName}> class="${cls.slice(0, 70)}" (${c.outerHTML.length}b)`);
  } else if (c.nodeType === 3) {
    const t = c.text.trim();
    if (t) console.log(`#text "${t.slice(0, 40)}"`);
  } else if (c.nodeType === 8) {
    console.log(`<!--${c.text.slice(0, 50)}-->`);
  }
}
