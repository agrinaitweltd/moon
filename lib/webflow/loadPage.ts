import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
// Plain JS conversion core, imported for build-time use only.
import { pageContentBlocks, extractHead } from "./convert.mjs";
import type { WebflowBlock, PageHead } from "./types";

/** Absolute path to the original Webflow mirror (sibling of the Next project). */
const MIRROR = resolve(process.cwd(), "..", "www.lawblacks.com");

export interface LoadedPage {
  navVariant: "base" | "dark";
  head: PageHead;
  blocks: WebflowBlock[];
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

/** route -> best source file (deduped across pagination/duplicate exports). */
export function getRouteMap(): Map<string, string> {
  if (routeMapCache) return routeMapCache;
  const map = new Map<string, string>();
  const priority = new Map<string, number>();
  for (const rel of walk(MIRROR)) {
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
  const html = readFileSync(join(MIRROR, rel), "utf8");
  const opts = { localized: getLocalizedAssets() };
  return {
    navVariant: rel === "index.html" ? "dark" : "base",
    head: extractHead(html) as unknown as PageHead,
    blocks: pageContentBlocks(html, opts) as unknown as WebflowBlock[],
  };
}

/** Load a page by clean route (e.g. "/for-businesses/commercial"). */
export function loadPage(route: string): LoadedPage | null {
  const rel = getRouteMap().get(route);
  if (!rel) return null;
  return loadPageByFile(rel);
}
