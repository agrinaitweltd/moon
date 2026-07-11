/**
 * Renders the page's preserved JSON-LD structured data blocks (LegalService,
 * WebPage, BlogPosting, BreadcrumbList, …) exactly as authored in the Webflow
 * export, so SEO / rich-result metadata is retained.
 */
export function JsonLd({ blocks }: { blocks: readonly string[] }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
    </>
  );
}
