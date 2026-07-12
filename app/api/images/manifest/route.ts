import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, "lib/webflow/image-manifest.json");
const PAGE_NAMES_PATH = join(ROOT, "lib/webflow/page-names.json");
const ASSETS_DIR = join(ROOT, "public/assets");

export async function GET() {
  try {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
    const pageNames = JSON.parse(readFileSync(PAGE_NAMES_PATH, "utf8"));

    const enriched = manifest.map((item: any) => {
      const fileExists = existsSync(join(ASSETS_DIR, item.filename));
      const friendlyPages = item.pages.map((route: string) => ({
        route,
        name: pageNames[route]?.name || route,
      }));

      return {
        ...item,
        fileExists,
        friendlyPages,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load manifest" },
      { status: 500 }
    );
  }
}
