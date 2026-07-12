import type { Metadata } from "next";
import type { PageHead } from "./webflow/types";

export const SITE_URL = "https://www.moonstone.co.ug";

/**
 * Maps a page's extracted Webflow <head> data onto the Next.js Metadata API,
 * preserving title, description, canonical, Open Graph and Twitter tags.
 * The canonical from the export is a relative ".html" path, so we normalise it
 * to the clean route provided by the caller.
 */
export function buildMetadata(head: Partial<PageHead>, canonicalPath: string): Metadata {
  const title = head.title;
  const description = head.description;
  const images = head.ogImage ? [{ url: head.ogImage }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: head.ogTitle ?? title,
      description: head.ogDescription ?? description,
      type: (head.ogType as "website" | "article" | undefined) ?? "website",
      url: canonicalPath,
      images,
    },
    twitter: {
      card: (head.twitterCard as "summary_large_image" | undefined) ?? "summary_large_image",
      title: head.ogTitle ?? title,
      description: head.ogDescription ?? description,
      images: head.ogImage ? [head.ogImage] : undefined,
    },
  };
}
