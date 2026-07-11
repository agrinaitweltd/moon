// Downloads every asset in tools/asset-manifest.json into public/assets/.
// Skips files that already exist. Safe to re-run as more pages are converted.
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(__dirname, "..");
const manifestFile = resolve(PROJECT, "tools/asset-manifest.json");
const outDir = resolve(PROJECT, "public/assets");
mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
const entries = Object.entries(manifest);
const CONCURRENCY = 12;
let ok = 0,
  skip = 0,
  fail = 0;

async function fetchOne([local, url]) {
  const dest = resolve(PROJECT, "public", local.replace(/^\//, ""));
  if (existsSync(dest) && statSync(dest).size > 0) {
    skip++;
    return;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    ok++;
  } catch (e) {
    fail++;
    console.error("FAIL", url, e.message);
  }
}

async function run() {
  console.log(`Fetching ${entries.length} assets -> public/assets/`);
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    await Promise.all(entries.slice(i, i + CONCURRENCY).map(fetchOne));
    process.stdout.write(`\r  ${ok} downloaded, ${skip} skipped, ${fail} failed  `);
  }
  console.log(`\nDone: ${ok} downloaded, ${skip} skipped, ${fail} failed.`);
}
run();
