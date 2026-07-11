import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Original internal links used ".html" suffixes and "/index.html" paths.
  // These redirects keep any old bookmarks / external inbound links working
  // against the new clean App Router paths.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about-us/index.html", destination: "/about-us", permanent: true },
      { source: "/for-businesses.1.html", destination: "/for-businesses", permanent: true },
      { source: "/for-individuals.1.html", destination: "/for-individuals", permanent: true },
      { source: "/:path*.html", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
