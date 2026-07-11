// Reclaims disk by keeping only the "core" self-hosted assets: those referenced
// by the home page + shared chrome (navbar/footer/overlay), plus favicons and
// CSS-referenced SVGs. All other content images fall back to the Webflow CDN
// via the converter's conditional localisation.
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pageContentBlocks, fragmentBlock, assetManifest, assetSlug } from "../lib/webflow/convert.mjs";

const HERE = resolve(fileURLToPath(import.meta.url), "..");
const PROJECT = resolve(HERE, "..");
const MIRROR = resolve(PROJECT, "..", "www.lawblacks.com");
const ASSETS = resolve(PROJECT, "public", "assets");

// Collect assets referenced by home + shared chrome.
const home = readFileSync(resolve(MIRROR, "index.html"), "utf8");
pageContentBlocks(home);
fragmentBlock(home, ".navbar5_component");
const contact = readFileSync(resolve(MIRROR, "contact.html"), "utf8");
fragmentBlock(contact, ".footer_component");
fragmentBlock(contact, ".navbar5_component");
fragmentBlock(home, ".page-wrapper > div:first-child");

const keep = new Set([...assetManifest.keys()].map((p) => p.replace("/assets/", "")));
// Always keep favicons + CSS-referenced SVGs (not present in HTML manifest).
for (const f of readdirSync(ASSETS)) {
  if (/favicon|webclip|chevron-down|IcRoundSearch|engage-logo|quote-2/.test(f)) keep.add(f);
}

let removed = 0;
for (const f of readdirSync(ASSETS)) {
  if (!keep.has(f)) {
    rmSync(resolve(ASSETS, f));
    removed++;
  }
}
// Reset asset-manifest.json to the core set so re-running fetch-assets is safe
// and reproduces exactly the shipped assets (rather than re-downloading all).
const coreManifest = {};
for (const [local, url] of assetManifest) coreManifest[local] = url;
writeFileSync(resolve(PROJECT, "tools/asset-manifest.json"), JSON.stringify(coreManifest, null, 2));

console.log(`Kept ${keep.size} core assets, removed ${removed}.`);
