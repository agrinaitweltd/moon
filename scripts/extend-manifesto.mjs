import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/42099b4af021e53fd8fd4e056c2568d7c2e3ffa8.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));
const block = data.blocks[0];

// Also correct a leftover "and London" mention missed by the earlier
// London-office removal pass (the firm is Kampala-only now).
const target =
  '<p>With offices in Kampala and London, and led by Managing Partner, Chris Allen since 2008, we bring long standing leadership, consistency, and clear direction to every matter.</p>';

const replacement =
  '<p>With our office in Kampala, and led by Managing Partner, Chris Allen since 2008, we bring long standing leadership, consistency, and clear direction to every matter.</p>' +
  '<p>Every matter is handled with the same care, whether you are a first-time client or someone we have worked alongside for years. We invest in understanding your goals properly, so the advice we give fits your situation rather than a generic template.</p>';

if (!block.html.includes(target)) {
  console.error("target not found");
  process.exit(1);
}

block.html = block.html.replace(target, replacement);

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("extended manifesto section with a second paragraph");
