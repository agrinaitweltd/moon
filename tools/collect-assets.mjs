// Runs the converter in collect mode over every mirror page to build the full
// asset manifest (tools/asset-manifest.json). Run tools/fetch-assets.mjs after
// to download them into public/assets.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pageContentBlocks, fragmentBlock, assetManifest } from "../lib/webflow/convert.mjs";

const HERE = resolve(fileURLToPath(import.meta.url), "..");
const PROJECT = resolve(HERE, "..");
const MIRROR = resolve(PROJECT, "..", "www.lawblacks.com");
const EXCLUDED = /^primary-navbar\//;

function walk(dir, base = "") {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(join(dir, e.name), rel));
    else if (e.name.endsWith(".html") && !EXCLUDED.test(rel)) out.push(rel);
  }
  return out;
}

const files = walk(MIRROR);
for (const rel of files) {
  const html = readFileSync(join(MIRROR, rel), "utf8");
  try {
    pageContentBlocks(html); // collect mode (no opts) -> records assets
    fragmentBlock(html, ".navbar5_component");
    fragmentBlock(html, ".footer_component");
  } catch {
    /* skip pages without expected structure */
  }
}

const manifestFile = resolve(PROJECT, "tools/asset-manifest.json");
const existing = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : {};
for (const [local, url] of assetManifest) existing[local] = url;
writeFileSync(manifestFile, JSON.stringify(existing, null, 2));
console.log(`Pages scanned: ${files.length}`);
console.log(`Total unique assets in manifest: ${Object.keys(existing).length}`);
