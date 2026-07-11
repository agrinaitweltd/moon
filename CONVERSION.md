# Conversion pipeline

How the Webflow export (`../www.lawblacks.com`) becomes this Next.js app, and
how to re-run the process when the export changes.

## Overview

Conversion is **automatic at build time** — there is no per-page hand-written
file. A single catch-all route (`app/[...slug]/page.tsx`) enumerates every page
via `generateStaticParams()` and converts each one through the shared core in
`lib/webflow/convert.mjs`. Only the **shared chrome** (navbar/footer/overlay) is
pre-generated into static modules, because it is identical across pages.

```
../www.lawblacks.com/*.html
        │
        ├─ lib/webflow/convert.mjs      parse → blocks + head (links & assets rewritten)
        │        ▲
        │        └─ tools/lib.mjs (re-export for offline tooling)
        │
        ├─ lib/webflow/loadPage.ts      route ⇄ file map, build-time loading
        │
        └─ app/[...slug]/page.tsx       prerender every route  ─►  components/webflow/WebflowBlocks
```

## What the converter does

For each page it takes everything inside `.page-wrapper` between the navbar and
footer and, for every top-level element:

1. Converts the **root element's** attributes to React props (`class`→
   `className`, `style` string → object, etc.). Inner HTML is injected verbatim
   via `dangerouslySetInnerHTML`, so inline SVG / embeds / comments are
   preserved exactly and there are **no extra wrapper elements**.
2. Rewrites internal `.html` links to clean routes
   (`about-us/index.html` → `/about-us`, `for-businesses.1.html` →
   `/for-businesses`, pagination snapshots → their base listing).
3. Rewrites Webflow-CDN asset URLs (`src`, `srcset`) to `/assets/…` **when a
   local copy exists**, otherwise leaves the CDN URL.
4. Extracts `<head>` metadata + JSON-LD for the Metadata API.

Navbar variant: the home page uses the `dark` (transparent-over-hero) navbar;
every other page uses `base`.

## Route ⇄ file mapping

`lib/webflow/loadPage.ts` scans the mirror and maps each file to a clean route,
de-duplicating Webflow's pagination snapshots (`*@hash_page=N.html`) and
duplicate exports (`*.1.html`). `primary-navbar/*.html` are Webflow CMS nav
fragments (not pages) and are excluded; their menu links are redirected to
`/careers` and `/insight-hub`.

## Regenerating

```bash
# 1. Shared chrome (after a navbar/footer change in the export)
node tools/gen.mjs chrome

# 2. Verify every page still converts cleanly
node tools/check-pages.mjs          # expect "OK: 579/579" (excludes nav fragments)

# 3. Assets
node tools/collect-assets.mjs       # full manifest (every page)   — OR skip for core-only
node tools/fetch-assets.mjs         # download manifest → public/assets
node tools/prune-assets.mjs         # trim back to the core (chrome + home) set

# 4. Build
npm run build
```

Legacy `.html` URLs are 308-redirected to clean paths via `next.config.ts`.

## Tooling reference (`tools/`)

| Script | Purpose |
| --- | --- |
| `gen.mjs chrome` | Generate `components/webflow/generated/{navbar.base,navbar.dark,footer,overlay}.ts` |
| `gen.mjs page <src> <out> [--nav base\|dark]` | Generate a single page's content module (not normally needed — the catch-all converts at build time) |
| `check-pages.mjs` | Assert every page converts without error |
| `collect-assets.mjs` | Build the full asset manifest across all pages |
| `fetch-assets.mjs` | Download manifest assets into `public/assets` |
| `prune-assets.mjs` | Reduce `public/assets` to the core (chrome + home) set and reset the manifest |
| `inspect-body.mjs`, `inspect-el.mjs`, `dump-scripts.mjs`, `dump-head.mjs`, `extract.mjs` | Inspection helpers used while building the pipeline |
