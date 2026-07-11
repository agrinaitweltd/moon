import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";
const root = parse(readFileSync(process.argv[2], "utf8"), {
  comment: true, blockTextElements: { script: true, style: true, noscript: true },
});
const head = root.querySelector("head");
for (const c of head.childNodes) {
  if (c.nodeType !== 1) continue;
  const t = c.rawTagName;
  if (t === "script") {
    const src = c.getAttribute("src");
    console.log("SCRIPT", src ? "src=" + src : "INLINE(" + c.text.length + "): " + c.text.replace(/\s+/g, " ").slice(0, 200));
  } else if (t === "link") {
    console.log("LINK", c.getAttribute("rel"), (c.getAttribute("href") || "").slice(0, 90));
  } else if (t === "style") {
    console.log("STYLE(" + c.text.length + "): " + c.text.replace(/\s+/g, " ").slice(0, 160));
  } else if (t === "title") {
    console.log("TITLE:", c.text);
  } else if (t === "meta") {
    const n = c.getAttribute("name") || c.getAttribute("property") || c.getAttribute("charset") ? "charset" : "?";
  }
}
