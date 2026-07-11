// Dumps every <script> under <body> (src list + inline code) in document order.
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";
const file = process.argv[2];
const root = parse(readFileSync(file, "utf8"), {
  comment: true,
  blockTextElements: { script: true, style: true, noscript: true },
});
const body = root.querySelector("body");
let i = 0;
for (const s of body.querySelectorAll("script")) {
  i++;
  const src = s.getAttribute("src");
  if (src) {
    const attrs = Object.entries(s.attributes)
      .filter(([k]) => k !== "src")
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(" ");
    console.log(`\n===== [${i}] SRC ${attrs} =====\n${src}`);
  } else {
    console.log(`\n===== [${i}] INLINE (${s.text.length} chars) =====\n${s.text}`);
  }
}
