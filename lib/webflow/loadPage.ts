import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
// Plain JS conversion core, imported for build-time use only.
import { pageContentBlocks, extractHead } from "./convert.mjs";
import type { WebflowBlock, PageHead } from "./types";

/** Candidate locations for the original Webflow mirror during local tooling. */
const MIRROR_CANDIDATES = process.env.WEBFLOW_MIRROR
  ? [resolve(process.env.WEBFLOW_MIRROR)]
  : [resolve(process.cwd(), "..", "www.lawblacks.com"), resolve(process.cwd(), "www.lawblacks.com")];

const SNAPSHOT_MANIFEST = resolve(process.cwd(), "lib", "webflow", "route-manifest.json");

export interface LoadedPage {
  navVariant: "base" | "dark";
  head: PageHead;
  blocks: WebflowBlock[];
}

interface SnapshotPage {
  file: string;
  data: string;
}

interface PageSnapshot {
  routes: Record<string, SnapshotPage>;
}

// ---- Route <-> source-file mapping ----------------------------------------
/** Convert a mirror-relative HTML file path to its clean App Router route. */
function fileToRoute(rel: string): string {
  let p = rel.replace(/\\/g, "/");
  p = p.replace(/index\.html$/, "");
  p = p.replace(/\.html$/, "");
  p = p.replace(/@[0-9a-f]+_page=\d+$/i, "");
  p = p.replace(/\.1$/, "");
  p = "/" + p.replace(/^\/+/, "").replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/** Lower = more canonical when several files map to the same route. */
function filePriority(rel: string): number {
  if (/@[0-9a-f]+_page=1\.html$/i.test(rel)) return 2;
  if (/@[0-9a-f]+_page=\d+\.html$/i.test(rel)) return 3;
  if (/\.1\.html$/i.test(rel)) return 1;
  return 0;
}

/** Mirror paths that are Webflow CMS fragments, not real pages. */
const EXCLUDED = /^primary-navbar\//;

function walk(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(join(dir, entry.name), rel));
    else if (entry.name.endsWith(".html") && !EXCLUDED.test(rel)) out.push(rel);
  }
  return out;
}

let routeMapCache: Map<string, string> | null = null;
let snapshotCache: PageSnapshot | null = null;

function getMirror(): string | null {
  return MIRROR_CANDIDATES.find((dir) => existsSync(dir)) ?? null;
}

function getSnapshot(): PageSnapshot {
  if (snapshotCache) return snapshotCache;
  if (!existsSync(SNAPSHOT_MANIFEST)) {
    throw new Error(
      `Webflow source mirror not found and page snapshot is missing. Run "npm run snapshot:pages" locally to generate ${SNAPSHOT_MANIFEST}.`
    );
  }
  snapshotCache = JSON.parse(readFileSync(SNAPSHOT_MANIFEST, "utf8")) as PageSnapshot;
  return snapshotCache;
}

function loadSnapshotPage(page: SnapshotPage): LoadedPage {
  return JSON.parse(readFileSync(resolve(process.cwd(), page.data), "utf8")) as LoadedPage;
}

/** route -> best source file (deduped across pagination/duplicate exports). */
export function getRouteMap(): Map<string, string> {
  if (routeMapCache) return routeMapCache;
  const map = new Map<string, string>();
  const mirror = getMirror();
  if (!mirror) {
    for (const [route, page] of Object.entries(getSnapshot().routes)) {
      map.set(route, page.file);
    }
    routeMapCache = map;
    return map;
  }

  const priority = new Map<string, number>();
  for (const rel of walk(mirror)) {
    const route = fileToRoute(rel);
    const pr = filePriority(rel);
    if (!map.has(route) || pr < (priority.get(route) ?? 99)) {
      map.set(route, rel);
      priority.set(route, pr);
    }
  }
  routeMapCache = map;
  return map;
}

/** All non-home routes, for generateStaticParams on the catch-all route. */
export function getAllRoutes(): string[] {
  return [...getRouteMap().keys()].filter((r) => r !== "/");
}

// ---- Locally-downloaded assets (serve mode) -------------------------------
let localizedCache: Set<string> | null = null;
function getLocalizedAssets(): Set<string> {
  if (localizedCache) return localizedCache;
  const dir = resolve(process.cwd(), "public", "assets");
  localizedCache = new Set(existsSync(dir) ? readdirSync(dir) : []);
  return localizedCache;
}

// ---- Page loading ----------------------------------------------------------
export function loadPageByFile(rel: string): LoadedPage {
  const mirror = getMirror();
  if (!mirror) {
    const page = Object.values(getSnapshot().routes).find((entry) => entry.file === rel);
    if (!page) throw new Error(`Page snapshot does not include ${rel}`);
    return loadSnapshotPage(page);
  }

  const html = readFileSync(join(mirror, rel), "utf8");
  const opts = { localized: getLocalizedAssets() };
  return {
    navVariant: rel === "index.html" ? "dark" : "base",
    head: extractHead(html) as unknown as PageHead,
    blocks: pageContentBlocks(html, opts) as unknown as WebflowBlock[],
  };
}

/** Load a page by clean route (e.g. "/for-businesses/commercial"). */
export function loadPage(route: string): LoadedPage | null {
  if (!getMirror()) {
    const page = getSnapshot().routes[route];
    return page ? loadSnapshotPage(page) : null;
  }
  const rel = getRouteMap().get(route);
  if (!rel) return null;
  return loadPageByFile(rel);
}
