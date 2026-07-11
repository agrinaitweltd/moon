import type { Config } from "tailwindcss";

/**
 * Tailwind is available for NEW / glue markup only. The existing Webflow design
 * ships its own CSS reset (public/css/webflow-shared.css), so Tailwind's
 * Preflight is DISABLED here to guarantee we never override the ported styling
 * and the site stays 100% visually identical.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
