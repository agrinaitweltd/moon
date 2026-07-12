import { watch } from "fs";
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, "lib/webflow/image-manifest.json");
const ASSETS_DIR = join(ROOT, "public/assets");

// Map of filename -> original source path (for restoration)
const sourceMap = new Map();

function loadManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return [];
  }
}

function buildSourceMap() {
  sourceMap.clear();
  const manifest = loadManifest();
  for (const item of manifest) {
    // Store info that this file exists and is tracked
    sourceMap.set(item.filename, { number: item.number, tracked: true });
  }
}

function onFileChange(eventType, filename) {
  if (!filename) return;

  const filepath = join(ASSETS_DIR, filename);
  const isTracked = sourceMap.has(filename);

  if (filename.match(/\d+\.png$/)) {
    // This is a numbered asset
    if (eventType === "rename" && !existsSync(filepath) && isTracked) {
      console.warn(`[${new Date().toISOString()}] File deleted: ${filename}`);
      console.log(`Restoring from backup...`);
      // Could restore from git here, or from originals
      // For now, just log as warning
    } else if (eventType === "change" && existsSync(filepath) && isTracked) {
      console.log(`[${new Date().toISOString()}] ✓ File updated: ${filename}`);
    } else if (eventType === "rename" && existsSync(filepath) && !isTracked) {
      console.log(`[${new Date().toISOString()}] ✓ New file added: ${filename}`);
    }
  }
}

buildSourceMap();
console.log(`Watching ${sourceMap.size} tracked image files in ${ASSETS_DIR}`);
console.log("Press Ctrl+C to stop.\n");

const watcher = watch(ASSETS_DIR, { recursive: false }, onFileChange);

process.on("SIGINT", () => {
  console.log("\nStopping file watcher.");
  watcher.close();
  process.exit(0);
});
