import { existsSync, readFileSync, readdirSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractHead, pageContentBlocks } from "../lib/webflow/convert.mjs";

const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIRROR_CANDIDATES = [
  resolve(PROJECT, "..", "www.lawblacks.com"),
  resolve(PROJECT, "www.lawblacks.com"),
];
const MIRROR = MIRROR_CANDIDATES.find((dir) => existsSync(dir));
const PAGES_DIR = resolve(PROJECT, "lib", "webflow", "pages");
const MANIFEST_OUT = resolve(PROJECT, "lib", "webflow", "route-manifest.json");
const ROUTES_OUT = resolve(PROJECT, "lib", "webflow", "routes.json");
const ASSETS = resolve(PROJECT, "public", "assets");
const EXCLUDED = /^primary-navbar\//;

if (!MIRROR) {
  throw new Error(`Webflow mirror not found. Tried: ${MIRROR_CANDIDATES.join(", ")}`);
}

function fileToRoute(rel) {
  let p = rel.replace(/\\/g, "/");
  p = p.replace(/index\.html$/, "");
  p = p.replace(/\.html$/, "");
  p = p.replace(/@[0-9a-f]+_page=\d+$/i, "");
  p = p.replace(/\.1$/, "");
  p = "/" + p.replace(/^\/+/, "").replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

function filePriority(rel) {
  if (/@[0-9a-f]+_page=1\.html$/i.test(rel)) return 2;
  if (/@[0-9a-f]+_page=\d+\.html$/i.test(rel)) return 3;
  if (/\.1\.html$/i.test(rel)) return 1;
  return 0;
}

function walk(dir, base = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(join(dir, entry.name), rel));
    else if (entry.name.endsWith(".html") && !EXCLUDED.test(rel)) out.push(rel);
  }
  return out;
}

const localized = new Set(existsSync(ASSETS) ? readdirSync(ASSETS) : []);
const routeMap = new Map();
const priorities = new Map();

for (const rel of walk(MIRROR)) {
  const route = fileToRoute(rel);
  const priority = filePriority(rel);
  if (!routeMap.has(route) || priority < (priorities.get(route) ?? 99)) {
    routeMap.set(route, rel);
    priorities.set(route, priority);
  }
}

const routes = {};
rmSync(PAGES_DIR, { force: true, recursive: true });
mkdirSync(PAGES_DIR, { recursive: true });

for (const [route, rel] of [...routeMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const html = readFileSync(join(MIRROR, rel), "utf8");
  const content = {
    navVariant: rel === "index.html" ? "dark" : "base",
    head: extractHead(html),
    blocks: pageContentBlocks(html, { localized }),
  };
  const name = `${createHash("sha1").update(route).digest("hex")}.json`;
  const data = `lib/webflow/pages/${name}`;
  writeFileSync(resolve(PROJECT, data), `${JSON.stringify(content)}\n`);
  routes[route] = { file: rel, data };
}

writeFileSync(
  MANIFEST_OUT,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: MIRROR,
    routes,
  })}\n`
);

writeFileSync(ROUTES_OUT, `${JSON.stringify([...routeMap.keys()].sort())}\n`);

console.log(`Wrote ${Object.keys(routes).length} pages to ${PAGES_DIR}`);
console.log(`Wrote route manifest to ${MANIFEST_OUT}`);
console.log(`Wrote ${routeMap.size} routes to ${ROUTES_OUT}`);
