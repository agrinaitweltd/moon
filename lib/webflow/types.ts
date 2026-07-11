import type { CSSProperties } from "react";

/**
 * A serialisable representation of one top-level Webflow element:
 *  - `tag`   the element's tag name (div, main, section, footer, …)
 *  - `attrs` React-safe attributes (className, data-*, style object, …)
 *  - `html`  the element's raw inner HTML, injected verbatim
 *
 * Rendering each Webflow node as its own React element (rather than wrapping a
 * blob of HTML in an extra <div>) keeps the DOM structure byte-for-byte with
 * the original export, so the Webflow CSS and JS runtime bind identically.
 */
export interface WebflowBlock {
  tag: string;
  attrs: Record<string, string | boolean | number | CSSProperties>;
  html: string;
}

export interface PageHead {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  canonical?: string;
  jsonLd: readonly string[];
}
