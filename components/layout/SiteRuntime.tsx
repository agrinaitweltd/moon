"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * SiteRuntime ports the original site's runtime behaviour to React.
 *
 * It loads the Webflow JS runtime (jQuery + webflow.js) so all native Webflow
 * interactions keep working (nav dropdowns, mobile menu, tabs, IX2 scroll
 * reveals), then reproduces every custom inline script from the export:
 *   - page-wipe navigation transition
 *   - Lenis smooth scroll (Locomotive config) + GSAP ScrollTrigger parallax
 *   - magnetic button hover
 *   - navbar chevron + tab fixes
 *   - cookie-modal body-state observer
 *   - scroll-direction data-attributes on <body>
 *   - Algolia search modal
 *
 * The original scripts hung off DOMContentLoaded / load; here everything runs
 * from a mount effect (DOM already parsed), which is the correct React
 * equivalent. Guards make it idempotent under React Strict Mode.
 */

const WF = "https://cdn.prod.website-files.com/68b448d2e0ae8eda7aa370e3/js";
const JQUERY =
  "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68b448d2e0ae8eda7aa370e3";

function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-rt-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false; // preserve execution order
    s.dataset.rtSrc = src;
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(s);
  });
}

// ---------------------------------------------------------------- page wipe --
function initPageWipe(): () => void {
  const TRANSITION_DURATION = 900;
  const getWipe = () => document.querySelector<HTMLElement>(".page-wipe");

  function isHashOnlyLink(link: HTMLAnchorElement) {
    const href = link.getAttribute("href");
    if (!href) return false;
    if (href.startsWith("#")) return true;
    try {
      const url = new URL(link.href, window.location.origin);
      return (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        !!url.hash
      );
    } catch {
      return false;
    }
  }

  function shouldSkip(link: HTMLAnchorElement, e: MouseEvent) {
    const href = link.getAttribute("href");
    if (!href) return true;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === "_blank" || link.hasAttribute("download"))
      return true;
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:"))
      return true;
    if (link.hostname && link.hostname !== window.location.hostname) return true;
    if (isHashOnlyLink(link)) return true;
    if (link.closest("[data-no-page-wipe]") || link.classList.contains("no-page-wipe")) return true;
    if (
      link.closest('[fs-list-element="load-more"]') ||
      link.closest('[fs-list-element="filters"]') ||
      link.closest("[fs-list-sort-element]") ||
      link.closest(".w-pagination-wrapper")
    )
      return true;
    return false;
  }

  const wipe = getWipe();
  if (wipe) {
    wipe.getBoundingClientRect();
    setTimeout(() => {
      const onEnd = (e: TransitionEvent) => {
        if (e.target !== wipe) return;
        wipe.removeEventListener("transitionend", onEnd);
        const old = wipe.style.transition;
        wipe.style.transition = "none";
        wipe.classList.remove("page-wipe--reveal");
        wipe.classList.add("page-wipe--hidden");
        wipe.getBoundingClientRect();
        wipe.style.transition = old;
      };
      wipe.addEventListener("transitionend", onEnd);
      wipe.classList.add("page-wipe--reveal");
    }, 200);
  }

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a") as HTMLAnchorElement | null;
    if (!link) return;
    if (shouldSkip(link, e)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const w = getWipe();
    if (!w) return;
    e.preventDefault();
    const destination = link.href;
    w.classList.remove("page-wipe--hidden");
    setTimeout(() => {
      window.location.href = destination;
    }, TRANSITION_DURATION);
  };

  const onPageShow = () => {
    const w = getWipe();
    if (!w) return;
    w.classList.remove("page-wipe--reveal");
    w.classList.add("page-wipe--hidden");
  };

  document.addEventListener("click", onClick);
  window.addEventListener("pageshow", onPageShow);
  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("pageshow", onPageShow);
  };
}

// ------------------------------------------------------- scroll direction ----
function initScrollDirection(): () => void {
  const body = document.body;
  if (!body.hasAttribute("data-scrolling-started")) body.setAttribute("data-scrolling-started", "false");
  if (!body.hasAttribute("data-scrolling-direction")) body.setAttribute("data-scrolling-direction", "up");
  let lastScrollTop = window.scrollY;
  const threshold = 10;
  const thresholdTop = 50;
  const onScroll = () => {
    const now = window.scrollY;
    body.setAttribute("data-scrolling-started", now > thresholdTop ? "true" : "false");
    if (Math.abs(now - lastScrollTop) >= threshold) {
      body.setAttribute("data-scrolling-direction", now > lastScrollTop ? "down" : "up");
      lastScrollTop = now;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

// --------------------------------------------------------- magnetic buttons --
function initMagneticButtons(): () => void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-btn-hover]"));
  const handleHover = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const circle = button.querySelector<HTMLElement>(".btn__circle");
    if (!circle) return;
    const { width, height, left, top } = button.getBoundingClientRect();
    const offsetXFromLeft = ((event.clientX - left) / width) * 100;
    const offsetYFromTop = ((event.clientY - top) / height) * 100;
    const centerX = left + width / 2;
    const offsetXFromCenter = Math.abs(((event.clientX - centerX) / (width / 2)) * 50);
    circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
    circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
    circle.style.width = `${115 + Number(offsetXFromCenter.toFixed(1)) * 2}%`;
  };
  buttons.forEach((b) => {
    b.addEventListener("mouseenter", handleHover);
    b.addEventListener("mouseleave", handleHover);
  });
  return () => {
    buttons.forEach((b) => {
      b.removeEventListener("mouseenter", handleHover);
      b.removeEventListener("mouseleave", handleHover);
    });
  };
}

// ----------------------------------------------------------- navbar fixes ----
function initNavbarFixes(): () => void {
  const cleanups: Array<() => void> = [];

  // Stop tab clicks inside dropdowns from bubbling and closing the menu.
  document.querySelectorAll<HTMLElement>(".navbar5_menu-dropdown .w-tab-link").forEach((tab) => {
    const stop = (e: Event) => e.stopPropagation();
    tab.addEventListener("click", stop);
    cleanups.push(() => tab.removeEventListener("click", stop));
  });

  // Chevron rotation on hover / open.
  document.querySelectorAll<HTMLElement>(".navbar5_menu-dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector<HTMLElement>(".navbar5_dropdown-toggle");
    const chevron = dropdown.querySelector<HTMLElement>(".dropdown-chevron");
    if (!toggle || !chevron) return;
    const close = () => (chevron.style.transform = "rotate(0deg)");
    const open = () => (chevron.style.transform = "rotate(180deg)");
    close();
    setTimeout(close, 100);
    setTimeout(close, 500);
    const onEnter = () => open();
    const onLeave = () => close();
    const onToggle = () => setTimeout(() => (toggle.classList.contains("w--open") ? open() : close()), 50);
    dropdown.addEventListener("mouseenter", onEnter);
    dropdown.addEventListener("mouseleave", onLeave);
    toggle.addEventListener("click", onToggle);
    cleanups.push(() => {
      dropdown.removeEventListener("mouseenter", onEnter);
      dropdown.removeEventListener("mouseleave", onLeave);
      toggle.removeEventListener("click", onToggle);
    });
  });

  return () => cleanups.forEach((c) => c());
}

// --------------------------------------------------------- cookie observer ---
function initCookieObserver(): () => void {
  const update = () => {
    const modal = document.querySelector(".cky-preference-wrapper");
    const isVisible = modal && window.getComputedStyle(modal).display !== "none";
    document.body.classList.toggle("cky-modal-open", Boolean(isVisible));
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  update();
  return () => observer.disconnect();
}

// ------------------------------------------------------ smooth scroll + gsap --
function initSmoothScrollAndParallax(): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.1,
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on("scroll", ScrollTrigger.update);
  const onRaf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(onRaf);
  gsap.ticker.lagSmoothing(0);

  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>("[data-parallax-layers]").forEach((triggerElement) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: triggerElement, start: "0% 0%", end: "100% 0%", scrub: 0 },
      });
      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 },
      ];
      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          { yPercent: layerObj.yPercent, ease: "none" },
          idx === 0 ? undefined : "<"
        );
      });
    });
  });

  return () => {
    gsap.ticker.remove(onRaf);
    ctx.revert();
    lenis.destroy();
  };
}

// ------------------------------------------------------------- Algolia -------
async function initAlgolia() {
  await loadScript("https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.umd.js");
  await loadScript("https://cdn.jsdelivr.net/npm/@algolia/autocomplete-js@1/dist/umd/index.production.js");

  const w = window as unknown as Record<string, any>;
  const aa = w["@algolia/autocomplete-js"];
  const algoliasearch = w["algoliasearch"];
  if (!aa || !algoliasearch) return;
  const { autocomplete, getAlgoliaResults } = aa;
  const searchClient = algoliasearch("2EGQWWPTN8", "d5f1636cba6adb5307494da777dd6b86");
  let searchInstance: any = null;

  function getOrCreateContainer() {
    let container = document.getElementById("search-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "search-container";
      container.style.display = "none";
      document.body.appendChild(container);
    }
    return container;
  }

  function initSearch() {
    if (searchInstance) return searchInstance;
    getOrCreateContainer();
    searchInstance = autocomplete({
      container: "#search-container",
      placeholder: "Search for a service...",
      detachedMediaQuery: "(max-width: 6800px)",
      detached: true,
      openOnFocus: true,
      renderDetachedInto({ container }: any) {
        return container;
      },
      getSources({ query }: any) {
        return [
          {
            sourceId: "pages",
            getItems() {
              if (!query) return [];
              return getAlgoliaResults({
                searchClient,
                queries: [
                  {
                    indexName: "algolia_crawler_lawblacks_com_production_pages",
                    query,
                    params: { hitsPerPage: 6 },
                  },
                ],
              });
            },
            templates: {
              empty({ html }: any) {
                return html`<div style="padding: 20px; color: #64748b; font-size: 14px; text-align: center;">Start typing to search...</div>`;
              },
              item({ item, html }: any) {
                const smartCut = (str: string, limit: number) => {
                  const words = str.split(" ");
                  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : str;
                };
                const title = item.title || "View Page";
                const snippet = smartCut(item.description || item.content || "", 10);
                return html`
                  <a href="/${item.url}" style="display: block; padding: 15px; border-bottom: 1px solid #f1f5f9; text-decoration: none; color: inherit;">
                    <p style="font-weight: 600; color: #1e293b; font-size: 14px;">${title}</p>
                    <p style="font-size: 13px; color: #64748b; margin-top: 4px; line-height: 1.5;">${snippet}</p>
                  </a>`;
              },
            },
          },
        ];
      },
    });
    return searchInstance;
  }

  if (document.getElementById("search-container")) initSearch();

  document.body.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest(".search-icon");
    if (!trigger) return;
    e.preventDefault();
    const search = initSearch();
    if (!search) return;
    search.setIsOpen(true);
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(".aa-DetachedFormContainer .aa-Input, .aa-Input");
      if (input) {
        input.focus();
        input.click();
      }
    }, 50);
  });

  document.body.addEventListener(
    "mousedown",
    (event) => {
      const clearBtn = (event.target as HTMLElement).closest(".aa-ClearButton");
      if (!clearBtn) return;
      event.preventDefault();
      event.stopPropagation();
      if (searchInstance) {
        searchInstance.setQuery("");
        searchInstance.refresh();
      }
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(".aa-DetachedFormContainer .aa-Input, .aa-Input");
        if (input) input.focus();
      }, 10);
    },
    true
  );
}

// ----------------------------------------------------------- Webflow load ----
async function initWebflow() {
  await loadScript(JQUERY);
  await loadScript(`${WF}/webflow.schunk.f2efb3c5440a81cf.js`);
  await loadScript(`${WF}/webflow.schunk.c1981b8275481f5f.js`);
  await loadScript(`${WF}/webflow.f7c66d3c.0a21ef9cb4fe77f8.js`);

  // Reveal safety net: the CSS visibility gate (html.w-mod-js:not(.w-mod-ix3))
  // hides hero/nav until Webflow's interactions engine marks itself ready. If
  // that hasn't happened shortly after load, reveal manually so nothing stays
  // hidden.
  setTimeout(() => {
    document.documentElement.classList.add("w-mod-ix3");
  }, 1500);
}

export function SiteRuntime() {
  useEffect(() => {
    const w = window as unknown as { __lbRuntime?: boolean };
    if (w.__lbRuntime) return;
    w.__lbRuntime = true;

    // Mark JS + touch capability exactly like the original head script.
    const html = document.documentElement;
    html.classList.add("w-mod-js");
    if ("ontouchstart" in window || (window as any).DocumentTouch) html.classList.add("w-mod-touch");

    const cleanups: Array<() => void> = [];
    cleanups.push(initPageWipe());
    cleanups.push(initScrollDirection());
    cleanups.push(initMagneticButtons());
    cleanups.push(initNavbarFixes());
    cleanups.push(initCookieObserver());
    cleanups.push(initSmoothScrollAndParallax());

    initWebflow().catch(() => document.documentElement.classList.add("w-mod-ix3"));
    initAlgolia().catch(() => {});

    // Finsweet Attributes (CMS lists, social share, copy-to-clipboard).
    loadScript("https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js", {
      type: "module",
    }).catch(() => {});

    return () => {
      cleanups.forEach((c) => c());
      w.__lbRuntime = false;
    };
  }, []);

  return null;
}
