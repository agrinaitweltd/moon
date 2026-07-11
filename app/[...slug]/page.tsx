import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebflowPage } from "@/components/webflow/WebflowPage";
import { buildMetadata } from "@/lib/metadata";
import { loadPage, getAllRoutes } from "@/lib/webflow/loadPage";

/**
 * Catch-all route that renders every converted Webflow page. Each clean route
 * maps to a source file in the mirror; the page is converted at build time and
 * statically prerendered (generateStaticParams enumerates all routes).
 */
type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  return getAllRoutes().map((route) => ({ slug: route.replace(/^\//, "").split("/") }));
}

// Only prerendered routes are valid; unknown paths 404.
export const dynamicParams = false;

function routeFrom(slug: string[]): string {
  return "/" + slug.map((s) => decodeURIComponent(s)).join("/");
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const route = routeFrom(slug);
  const content = loadPage(route);
  if (!content) return {};
  return buildMetadata(content.head, route);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const content = loadPage(routeFrom(slug));
  if (!content) notFound();
  return <WebflowPage content={content} />;
}
