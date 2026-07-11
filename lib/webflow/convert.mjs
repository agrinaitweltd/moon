// Shared Webflow-HTML -> React-block conversion core.
//
// Used in two contexts:
//   1. Next.js server components (lib/webflow/loadPage.ts) to convert pages at
//      build time into serialisable blocks rendered by <WebflowBlocks>.
//   2. Offline tooling (tools/*) to collect the asset manifest for download.
//
// Design goals: zero extra wrapper elements (each top-level Webflow node becomes
// its own React element), verbatim inner HTML, internal ".html" links rewritten
// to clean routes, and Webflow-CDN assets localised to /assets when a local copy
// exists (otherwise left on the CDN so pages still render).
import { parse } from "node-html-parser";

const PARSE_OPTS = {
  comment: true,
  blockTextElements: { script: true, style: true, noscript: true },
};

// ---- Asset localisation --------------------------------------------------
// `assetManifest` accumulates every localisable asset (collect mode).
export const assetManifest = new Map(); // localPath -> originalUrl
const ASSET_HOST = /website-files\.com/i;

export function assetSlug(url) {
  const u = new URL(url);
  let name = u.pathname.split("/").pop() || "asset";
  return decodeURIComponent(name).replace(/[^A-Za-z0-9._-]+/g, "-");
}

/**
 * Localise a Webflow CDN asset URL.
 *  - opts.localized == null  -> collect mode: localise all, record to manifest
 *  - opts.localized is a Set -> serve mode: localise only slugs already
 *    downloaded; leave everything else on the CDN so the page still renders.
 */
export function localiseAssetUrl(url, opts = {}) {
  if (!ASSET_HOST.test(url)) return url;
  const clean = url.split("?")[0];
  const slug = assetSlug(clean);
  const local = "/assets/" + slug;
  if (opts.localized == null) {
    assetManifest.set(local, clean);
    return local;
  }
  return opts.localized.has(slug) ? local : url;
}

export function rewriteAssetsInHtml(html, opts = {}) {
  return html
    .replace(/src="([^"]*website-files\.com[^"]*)"/gi, (_, u) => `src="${localiseAssetUrl(u, opts)}"`)
    .replace(/srcset="([^"]*)"/gi, (m, set) => {
      if (!ASSET_HOST.test(set)) return m;
      const rewritten = set
        .split(",")
        .map((part) => {
          const seg = part.trim();
          const sp = seg.indexOf(" ");
          const url = sp >= 0 ? seg.slice(0, sp) : seg;
          const descriptor = sp >= 0 ? seg.slice(sp) : "";
          return localiseAssetUrl(url, opts) + descriptor;
        })
        .join(", ");
      return `srcset="${rewritten}"`;
    });
}

// ---- Link rewriting: Webflow ".html" export paths -> clean routes ---------
export function rewriteHref(href) {
  if (href == null) return href;
  let hash = "";
  let query = "";
  if (/^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return href;

  const abs = href.match(/^https?:\/\/(?:www\.)?lawblacks\.com(\/[^\s]*)?$/i);
  if (/^https?:\/\//i.test(href)) {
    if (abs) href = abs[1] || "/";
    else return href;
  }

  const hashIdx = href.indexOf("#");
  if (hashIdx >= 0) {
    hash = href.slice(hashIdx);
    href = href.slice(0, hashIdx);
  }
  const qIdx = href.indexOf("?");
  if (qIdx >= 0) {
    query = href.slice(qIdx);
    href = href.slice(0, qIdx);
  }

  let p = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  p = p.replace(/index\.html$/, "");
  p = p.replace(/\.html$/, "");
  p = p.replace(/@[0-9a-f]+_page=\d+$/i, "");
  p = p.replace(/\.1$/, "");

  if (p === "" && href.indexOf("/") === -1 && !abs) return hash || query || "/";

  p = "/" + p.replace(/^\/+/, "");
  p = p.replace(/\/+$/, "");
  if (p === "") p = "/";
  // The two primary-navbar/* files are Webflow CMS nav fragments, not pages;
  // point their menu links at the real destinations.
  if (p === "/primary-navbar/careers") p = "/careers";
  else if (p === "/primary-navbar/insights") p = "/insight-hub";
  return p + query + hash;
}

export function rewriteLinksInHtml(html) {
  return html.replace(/href="([^"]*)"/g, (_, h) => `href="${rewriteHref(h)}"`);
}

// ---- Root-element attribute conversion (HTML attr names -> React props) ---
const ATTR_MAP = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  crossorigin: "crossOrigin",
  novalidate: "noValidate",
  enctype: "encType",
  contenteditable: "contentEditable",
  spellcheck: "spellCheck",
  "accept-charset": "acceptCharset",
};

function camel(prop) {
  if (prop.startsWith("--")) return prop;
  const p = prop.startsWith("-ms-") ? prop.slice(1) : prop;
  return p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function styleToObject(style) {
  const obj = {};
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim();
    if (!prop) continue;
    obj[camel(prop)] = decl.slice(idx + 1).trim().replace(/\s*!important\s*$/i, "");
  }
  return obj;
}

export function convertAttrs(rawAttrs, opts = {}) {
  const out = {};
  for (const [name, value] of Object.entries(rawAttrs)) {
    if (name === "style") out.style = styleToObject(value);
    else if (name === "href") out.href = rewriteHref(value);
    else if (name === "src") out.src = localiseAssetUrl(value, opts);
    else if (name === "srcset") out.srcSet = rewriteAssetsInHtml(`srcset="${value}"`, opts).slice(8, -1);
    else out[ATTR_MAP[name] || name] = value === "" ? true : value;
  }
  return out;
}

function elementToBlock(el, opts) {
  return {
    tag: el.rawTagName,
    attrs: convertAttrs(el.attributes, opts),
    html: rewriteAssetsInHtml(rewriteLinksInHtml(el.innerHTML), opts),
  };
}

export function fragmentBlock(html, selector, opts = {}) {
  const el = parse(html, PARSE_OPTS).querySelector(selector);
  if (!el) throw new Error(`selector not found: ${selector}`);
  return elementToBlock(el, opts);
}

export function pageContentBlocks(html, opts = {}) {
  const wrapper = parse(html, PARSE_OPTS).querySelector(".page-wrapper");
  if (!wrapper) throw new Error(".page-wrapper not found");
  const elementChildren = wrapper.childNodes.filter((n) => n.nodeType === 1);
  const first = elementChildren[0];
  const blocks = [];
  for (const child of elementChildren) {
    const cls = child.getAttribute("class") || "";
    if (child.rawTagName === "script") continue;
    if (cls.includes("navbar5_component") || cls.includes("footer_component")) continue;
    if (child === first && (cls.includes("global") || cls === "")) continue; // leading overlay
    blocks.push(elementToBlock(child, opts));
  }
  return blocks;
}

export function extractHead(html) {
  const head = parse(html, PARSE_OPTS).querySelector("head");
  const get = (sel, attr) => head.querySelector(sel)?.getAttribute(attr);
  return {
    title: head.querySelector("title")?.text?.trim(),
    description: get('meta[name="description"]', "content"),
    ogTitle: get('meta[property="og:title"]', "content"),
    ogDescription: get('meta[property="og:description"]', "content"),
    ogType: get('meta[property="og:type"]', "content"),
    ogImage: get('meta[property="og:image"]', "content"),
    twitterCard: get('meta[name="twitter:card"]', "content"),
    canonical: get('link[rel="canonical"]', "href"),
    jsonLd: head
      .querySelectorAll('script[type="application/ld+json"]')
      .map((s) => s.text.trim())
      .filter(Boolean),
  };
}

export { parse, PARSE_OPTS };
