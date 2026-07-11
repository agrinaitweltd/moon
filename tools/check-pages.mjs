// Verifies every mirror HTML page converts without throwing.
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pageContentBlocks, extractHead } from "../lib/webflow/convert.mjs";

const MIRROR = resolve(dirname(), "..", "..", "www.lawblacks.com");
function dirname() {
  return resolve(fileURLToPath(import.meta.url), "..");
}
function walk(dir, base = "") {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(join(dir, e.name), rel));
    else if (e.name.endsWith(".html")) out.push(rel);
  }
  return out;
}

const files = walk(MIRROR);
let ok = 0;
const fails = [];
for (const rel of files) {
  try {
    const html = readFileSync(join(MIRROR, rel), "utf8");
    const blocks = pageContentBlocks(html);
    extractHead(html);
    if (!blocks.length) throw new Error("0 content blocks");
    ok++;
  } catch (e) {
    fails.push(`${rel}: ${e.message}`);
  }
}
console.log(`OK: ${ok}/${files.length}`);
if (fails.length) {
  console.log(`FAILURES (${fails.length}):`);
  for (const f of fails.slice(0, 40)) console.log("  " + f);
}
