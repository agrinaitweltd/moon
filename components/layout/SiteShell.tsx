import type { ReactNode } from "react";
import { GlobalOverlay } from "./GlobalOverlay";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * Reproduces the shared page structure of every original page:
 *   body > .page-wrapper > [ overlay, navbar, <page content>, footer ]
 *
 * Pages render their unique content as `children` (the Webflow `main-wrapper`
 * plus any trailing sections) and choose the navbar variant.
 */
export function SiteShell({
  children,
  navVariant = "base",
}: {
  children: ReactNode;
  navVariant?: "base" | "dark";
}) {
  return (
    <div className="page-wrapper">
      <GlobalOverlay />
      <Navbar variant={navVariant} />
      {children}
      <Footer />
    </div>
  );
}
