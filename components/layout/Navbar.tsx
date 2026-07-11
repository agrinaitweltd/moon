import { WebflowBlockEl } from "@/components/webflow/WebflowBlocks";
import { navbarBaseBlock } from "@/components/webflow/generated/navbar.base";
import { navbarDarkBlock } from "@/components/webflow/generated/navbar.dark";

/**
 * Site navbar (Webflow `navbar5_component`, incl. the services mega-menu,
 * responsive menu and search trigger). Two visual variants exist:
 *  - "dark"  transparent-over-hero styling used on the home page
 *  - "base"  solid styling used on every interior page
 *
 * Interactions (dropdowns, mobile menu, tabs) are driven by the Webflow JS
 * runtime loaded in SiteRuntime, so the markup is rendered verbatim.
 */
export function Navbar({ variant = "base" }: { variant?: "base" | "dark" }) {
  return <WebflowBlockEl block={variant === "dark" ? navbarDarkBlock : navbarBaseBlock} />;
}
