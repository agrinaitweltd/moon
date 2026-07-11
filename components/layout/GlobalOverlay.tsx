import { WebflowBlockEl } from "@/components/webflow/WebflowBlocks";
import { overlayBlock } from "@/components/webflow/generated/overlay";

/**
 * The leading overlay block inside `.page-wrapper`: the page-wipe transition
 * layer, the scroll progress bar and hidden custom-code holders. Behaviour is
 * wired up by SiteRuntime.
 */
export function GlobalOverlay() {
  return <WebflowBlockEl block={overlayBlock} />;
}
