// Code generator: turns Webflow-exported HTML into typed React data modules.
//
// Usage:
//   node tools/gen.mjs chrome
//       -> components/webflow/generated/navbar.base.ts, navbar.dark.ts, footer.ts
//   node tools/gen.mjs page <srcHtml> <outFile> [--nav base|dark]
//       -> <outFile> exporting `blocks` (WebflowBlock[]) and `head` metadata
//
// The Webflow source lives in ../www.lawblacks.com relative to this project.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fragmentBlock, pageContentBlocks, extractHead, assetManifest } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(__dirname, "..");
const SRC = resolve(PROJECT, "..", "www.lawblacks.com");

function banner(src) {
  return `// AUTO-GENERATED from ${src} by tools/gen.mjs — do not edit by hand.\n` +
    `import type { WebflowBlock } from "@/lib/webflow/types";\n\n`;
}

function writeTs(file, code) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, code);
  console.log("wrote", file.replace(PROJECT + "\\", "").replace(PROJECT + "/", ""));
}

function genChrome() {
  const genDir = resolve(PROJECT, "components/webflow/generated");
  // Footer + base navbar come from an interior page; dark navbar from home.
  const interior = readFileSync(resolve(SRC, "contact.html"), "utf8");
  const home = readFileSync(resolve(SRC, "index.html"), "utf8");

  const footer = fragmentBlock(interior, ".footer_component");
  writeTs(
    resolve(genDir, "footer.ts"),
    banner("contact.html .footer_component") +
      `export const footerBlock: WebflowBlock = ${JSON.stringify(footer, null, 2)};\n`
  );

  const navBase = fragmentBlock(interior, ".navbar5_component");
  writeTs(
    resolve(genDir, "navbar.base.ts"),
    banner("contact.html .navbar5_component") +
      `export const navbarBaseBlock: WebflowBlock = ${JSON.stringify(navBase, null, 2)};\n`
  );

  const navDark = fragmentBlock(home, ".navbar5_component");
  writeTs(
    resolve(genDir, "navbar.dark.ts"),
    banner("index.html .navbar5_component") +
      `export const navbarDarkBlock: WebflowBlock = ${JSON.stringify(navDark, null, 2)};\n`
  );

  // The leading global overlay (page-wipe + progress bar + hidden custom code).
  const overlay = fragmentBlock(home, ".page-wrapper > div:first-child");
  writeTs(
    resolve(genDir, "overlay.ts"),
    banner("index.html .page-wrapper > div:first-child") +
      `export const overlayBlock: WebflowBlock = ${JSON.stringify(overlay, null, 2)};\n`
  );
}

function genPage(srcRel, outFile, navVariant) {
  const html = readFileSync(resolve(SRC, srcRel), "utf8");
  const blocks = pageContentBlocks(html);
  const head = extractHead(html);
  const code =
    banner(srcRel) +
    `export const navVariant = ${JSON.stringify(navVariant || "base")} as const;\n\n` +
    `export const head = ${JSON.stringify(head, null, 2)} as const;\n\n` +
    `export const blocks: WebflowBlock[] = ${JSON.stringify(blocks, null, 2)};\n`;
  writeTs(resolve(PROJECT, outFile), code);
}

// Merge freshly-collected asset URLs into the persistent manifest so
// tools/fetch-assets.mjs can download everything referenced across all pages.
function persistManifest() {
  const file = resolve(PROJECT, "tools/asset-manifest.json");
  const existing = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  for (const [local, url] of assetManifest) existing[local] = url;
  writeFileSync(file, JSON.stringify(existing, null, 2));
  console.log(`asset-manifest.json: ${Object.keys(existing).length} assets (+${assetManifest.size} this run)`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "chrome") {
  genChrome();
  persistManifest();
} else if (cmd === "page") {
  const navIdx = args.indexOf("--nav");
  const navVariant = navIdx >= 0 ? args[navIdx + 1] : "base";
  const positional = args.filter((a, i) => a !== "--nav" && args[i - 1] !== "--nav");
  const [srcRel, outFile] = positional;
  if (!srcRel || !outFile) {
    console.error("usage: node tools/gen.mjs page <srcHtml> <outFile> [--nav base|dark]");
    process.exit(1);
  }
  genPage(srcRel, outFile, navVariant);
  persistManifest();
} else {
  console.error("usage: node tools/gen.mjs <chrome|page> ...");
  process.exit(1);
}
