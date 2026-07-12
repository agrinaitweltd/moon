import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteRuntime } from "@/components/layout/SiteRuntime";
import { SITE_URL } from "@/lib/metadata";

/*
 * Typography for a legal/litigation audience: Merriweather is a screen-
 * optimised serif built for long-form reading (used widely by law firms,
 * journals, and publishers) — it carries the authority and tradition the
 * subject calls for without tipping into decorative. Source Sans 3 is
 * Adobe's own general-purpose companion sans, chosen for UI text/body copy
 * because it stays highly legible at small sizes and pairs cleanly with
 * Merriweather's weight. Both self-hosted via next/font (no runtime request
 * to fonts.googleapis.com, no layout shift).
 */
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Moonstone Advocates | Distinguished Legal Services in Kampala, Uganda",
    template: "%s",
  },
  icons: {
    icon: "/assets/favicon_32x32.png",
    apple: "/assets/webclip_256x256.png",
  },
  generator: "Next.js",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-wf-domain="www.moonstone.co.ug"
      className={`${merriweather.variable} ${sourceSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://cdn.prod.website-files.com" crossOrigin="anonymous" />
        {/* The Webflow design system, self-hosted and served verbatim. */}
        <link rel="stylesheet" href="/css/webflow-shared.css" />
        {/* Webflow's visibility gate: hide reveal-animated elements until the
            interactions engine (w-mod-ix3) is ready. */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html.w-mod-js:not(.w-mod-ix3) :is([grow-scroll="reverse"], [grow-scroll="shrink"], [dropdown="target"], [fade="details"], [element-reveal="target"], [hover-wipe="text"], [progress-bar], .heading-style-hero, .navbar_component, .home-header_search-form, [shape-grow="target"], .shape_circle) {visibility: hidden !important;}',
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }",
          }}
        />
      </head>
      <body data-scrolling-started="false" data-scrolling-direction="up" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WTRPN42S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}

        <SiteRuntime />

        {/* Mark JS/touch capability before paint (Webflow visibility gate). */}
        <Script id="wf-mod-js" strategy="beforeInteractive">
          {`!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}
        </Script>

        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WTRPN42S');`}
        </Script>
      </body>
    </html>
  );
}
