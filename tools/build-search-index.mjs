import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = resolve(PROJECT, "lib", "webflow", "route-manifest.json");
const OUT = resolve(PROJECT, "public", "search-index.json");

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const entries = [];

for (const [route, info] of Object.entries(manifest.routes)) {
  const page = JSON.parse(readFileSync(resolve(PROJECT, info.data), "utf8"));
  const title = (page.head && page.head.title) || route;
  const description = (page.head && page.head.description) || "";
  entries.push({ url: route, title, description });
}

entries.sort((a, b) => a.url.localeCompare(b.url));
writeFileSync(OUT, `${JSON.stringify(entries)}\n`);
console.log(`Wrote ${entries.length} entries to ${OUT}`);
