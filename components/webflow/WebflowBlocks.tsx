import { createElement, Fragment } from "react";
import type { WebflowBlock } from "@/lib/webflow/types";

/**
 * Renders an array of {@link WebflowBlock}s as real React elements. Each block
 * becomes its own element with the exact tag + attributes from the Webflow
 * export; its inner markup is injected raw (preserving inline SVG, comments,
 * embeds, etc.). No extra wrapper nodes are introduced.
 *
 * This is a Server Component — the content is rendered into the initial HTML,
 * preserving SEO and letting the Webflow JS runtime enhance it on load exactly
 * as it did on the static site.
 */
export function WebflowBlocks({ blocks }: { blocks: WebflowBlock[] }) {
  return (
    <Fragment>
      {blocks.map((block, i) =>
        createElement(block.tag, {
          key: i,
          ...block.attrs,
          suppressHydrationWarning: true,
          dangerouslySetInnerHTML: { __html: block.html },
        })
      )}
    </Fragment>
  );
}

/** Convenience renderer for a single block (navbar, footer, overlay). */
export function WebflowBlockEl({ block }: { block: WebflowBlock }) {
  return createElement(block.tag, {
    ...block.attrs,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: block.html },
  });
}
