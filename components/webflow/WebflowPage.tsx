import { SiteShell } from "@/components/layout/SiteShell";
import { WebflowBlocks } from "@/components/webflow/WebflowBlocks";
import { JsonLd } from "@/components/webflow/JsonLd";
import type { WebflowBlock, PageHead } from "@/lib/webflow/types";

export interface PageContent {
  navVariant: "base" | "dark";
  head: Partial<PageHead> & { jsonLd: readonly string[] };
  blocks: WebflowBlock[];
}

/**
 * Shared renderer for every converted Webflow page: wraps the page's content
 * blocks in the site chrome and injects its preserved JSON-LD. Keeps each
 * route file down to a couple of lines (metadata + this call).
 */
export function WebflowPage({ content }: { content: PageContent }) {
  return (
    <SiteShell navVariant={content.navVariant}>
      <JsonLd blocks={content.head.jsonLd} />
      <WebflowBlocks blocks={content.blocks} />
    </SiteShell>
  );
}
