import { WebflowBlockEl } from "@/components/webflow/WebflowBlocks";
import { footerBlock } from "@/components/webflow/generated/footer";

/** Site footer (Webflow `footer_component`) — identical across every page. */
export function Footer() {
  return <WebflowBlockEl block={footerBlock} />;
}
