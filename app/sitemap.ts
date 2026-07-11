import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { getAllRoutes } from "@/lib/webflow/loadPage";

/** Enumerates every converted route (home + all catch-all pages). */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", ...getAllRoutes()];
  return routes.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
