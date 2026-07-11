import type { Metadata } from "next";
import { WebflowPage } from "@/components/webflow/WebflowPage";
import { buildMetadata } from "@/lib/metadata";
import { loadPageByFile } from "@/lib/webflow/loadPage";

const content = loadPageByFile("index.html");

export const metadata: Metadata = buildMetadata(content.head, "/");

export default function HomePage() {
  return <WebflowPage content={content} />;
}
