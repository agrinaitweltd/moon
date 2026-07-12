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
 *   - self-contained site search (hero bar + navbar icon overlay)
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

// ---------------------------------------------------------- cookie consent ---
const COOKIE_CONSENT_KEY = "moonstone-cookie-consent";

function initCookieConsent(): () => void {
  if (localStorage.getItem(COOKIE_CONSENT_KEY)) return () => {};

  const banner = document.createElement("div");
  banner.className = "cookie-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML =
    '<div class="cookie-consent_panel">' +
    '<p class="cookie-consent_text">We use cookies to improve your experience on our site and to show you relevant content. By clicking &ldquo;Accept&rdquo; you agree to our use of cookies. See our <a href="/cookie-policy" class="cookie-consent_link">Cookie Policy</a> for details.</p>' +
    '<div class="cookie-consent_actions">' +
    '<button type="button" class="cookie-consent_btn is-decline">Decline</button>' +
    '<button type="button" class="cookie-consent_btn is-accept">Accept</button>' +
    "</div></div>";
  document.body.appendChild(banner);

  requestAnimationFrame(() => banner.classList.add("is-visible"));

  const dismiss = (value: "accepted" | "declined") => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    banner.classList.remove("is-visible");
    setTimeout(() => banner.remove(), 400);
  };

  const onAccept = () => dismiss("accepted");
  const onDecline = () => dismiss("declined");
  banner.querySelector(".is-accept")?.addEventListener("click", onAccept);
  banner.querySelector(".is-decline")?.addEventListener("click", onDecline);

  return () => {
    banner.querySelector(".is-accept")?.removeEventListener("click", onAccept);
    banner.querySelector(".is-decline")?.removeEventListener("click", onDecline);
    banner.remove();
  };
}

// ---------------------------------------------------------- scroll progress --
function initScrollProgress(): () => void {
  const bar = document.querySelector<HTMLElement>(".progress-bar");
  if (!bar) return () => {};
  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    bar.style.width = `${pct}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

// ------------------------------------------------------------ scroll theme ---
/**
 * The manifesto and newsletter sections already ship their own solid dark
 * inner panels (.dark_background / .wrapper_wide-screen), so the page already
 * transitions white → dark → white as you scroll through them. An earlier
 * version painted an extra full-viewport fixed backdrop on top of that, but
 * because the footer is transparent (it relies on the white body background),
 * that dark backdrop bled through and turned the footer black. This cleanup
 * removes any such leftover backdrop; the natural section darkness is kept.
 */
function initScrollTheme(): () => void {
  document.querySelectorAll(".scroll-theme-backdrop").forEach((el) => el.remove());
  document.documentElement.removeAttribute("data-scroll-theme");
  return () => {};
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
    // The exported markup carries data-parallax-layer="" (no numeric value)
    // on every layer, so matching by ["1".."4"] never found anything and
    // just logged GSAP warnings. Layer speed by DOM order instead — this is
    // what actually produces the intended stacked-image parallax depth.
    const LAYER_SPEEDS = [70, 55, 40, 10];
    document.querySelectorAll<HTMLElement>("[data-parallax-layers]").forEach((triggerElement) => {
      const layerEls = Array.from(triggerElement.querySelectorAll<HTMLElement>("[data-parallax-layer]"));
      if (!layerEls.length) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: triggerElement, start: "0% 0%", end: "100% 0%", scrub: 0 },
      });
      layerEls.forEach((el, idx) => {
        tl.to(el, { yPercent: LAYER_SPEEDS[idx] ?? LAYER_SPEEDS[LAYER_SPEEDS.length - 1], ease: "none" }, idx === 0 ? undefined : "<");
      });
    });
  });

  return () => {
    gsap.ticker.remove(onRaf);
    ctx.revert();
    lenis.destroy();
  };
}

// ----------------------------------------------------------- lite search -----
/**
 * Self-contained replacement for the original Algolia widget, which pointed
 * at a third-party crawl of the previous firm's site (wrong content, and not
 * ours to keep using). Filters a small local /search-index.json built at
 * build time from every real route (see tools/build-search-index.mjs).
 */
interface SearchEntry {
  url: string;
  title: string;
  description: string;
}

let searchIndexPromise: Promise<SearchEntry[]> | null = null;
function getSearchIndex(): Promise<SearchEntry[]> {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch("/search-index.json")
      .then((r) => r.json())
      .catch(() => []);
  }
  return searchIndexPromise;
}

function scoreEntry(entry: SearchEntry, query: string): number {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  const desc = entry.description.toLowerCase();
  if (title.startsWith(q)) return 3;
  if (title.includes(q)) return 2;
  if (desc.includes(q)) return 1;
  return 0;
}

function renderResults(container: HTMLElement, entries: SearchEntry[], query: string) {
  if (!query) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  const matches = entries
    .map((e) => ({ e, score: scoreEntry(e, query) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((m) => m.e);

  container.innerHTML = matches.length
    ? matches
        .map(
          (m) =>
            `<a href="${m.url}" class="moon-search_result" data-no-page-wipe>` +
            `<div class="moon-search_result-title">${escapeHtml(m.title)}</div>` +
            (m.description ? `<div class="moon-search_result-desc">${escapeHtml(m.description)}</div>` : "") +
            `</a>`
        )
        .join("")
    : `<div class="moon-search_empty">No pages found for "${escapeHtml(query)}"</div>`;
  container.hidden = false;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function wireSearchField(input: HTMLInputElement, results: HTMLElement) {
  if (input.dataset.liteSearchWired) return;
  input.dataset.liteSearchWired = "1";
  input.addEventListener("input", async () => {
    const entries = await getSearchIndex();
    renderResults(results, entries, input.value.trim());
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      results.hidden = true;
      input.blur();
    }
  });
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Node)) return;
    if (input.contains(e.target) || results.contains(e.target)) return;
    results.hidden = true;
  });
}

function wireAllInlineSearchFields() {
  document.querySelectorAll<HTMLInputElement>('[data-lite-search="input"]').forEach((input) => {
    const results = input.parentElement?.querySelector<HTMLElement>('[data-lite-search="results"]');
    if (results) wireSearchField(input, results);
  });
}

function getOrCreateOverlay(): { input: HTMLInputElement; overlay: HTMLElement } {
  let overlay = document.querySelector<HTMLElement>(".moon-search_overlay");
  if (overlay) {
    return { overlay, input: overlay.querySelector<HTMLInputElement>('[data-lite-search="input"]')! };
  }
  overlay = document.createElement("div");
  overlay.className = "moon-search_overlay";
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="moon-search_overlay-panel">' +
    '<input type="text" class="moon-search_input" placeholder="Search for a service..." autocomplete="off" data-lite-search="input">' +
    '<button type="button" class="moon-search_button" aria-label="Search"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M10 18C11.775 17.9996 13.4988 17.4054 14.897 16.312L19.293 20.708L20.707 19.294L16.311 14.898C17.405 13.4997 17.9996 11.7754 18 10C18 5.589 14.411 2 10 2C5.589 2 2 5.589 2 10C2 14.411 5.589 18 10 18ZM10 4C13.309 4 16 6.691 16 10C16 13.309 13.309 16 10 16C6.691 16 4 13.309 4 10C4 6.691 6.691 4 10 4Z" fill="currentColor"></path></svg></button>' +
    '<div class="moon-search_results" data-lite-search="results" hidden></div>' +
    "</div>";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay!.hidden = true;
  });
  document.body.appendChild(overlay);
  const input = overlay.querySelector<HTMLInputElement>('[data-lite-search="input"]')!;
  const results = overlay.querySelector<HTMLElement>('[data-lite-search="results"]')!;
  wireSearchField(input, results);
  return { overlay, input };
}

function initLiteSearch(): () => void {
  wireAllInlineSearchFields();

  const onClick = (e: MouseEvent) => {
    const trigger = (e.target as HTMLElement).closest(".search-icon");
    if (!trigger) return;
    e.preventDefault();
    const { overlay, input } = getOrCreateOverlay();
    overlay.hidden = false;
    setTimeout(() => input.focus(), 30);
  };
  document.body.addEventListener("click", onClick);

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    const overlay = document.querySelector<HTMLElement>(".moon-search_overlay");
    if (overlay && !overlay.hidden) overlay.hidden = true;
  };
  document.addEventListener("keydown", onKeydown);

  return () => {
    document.body.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
  };
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
    cleanups.push(initCookieConsent());
    cleanups.push(initScrollProgress());
    cleanups.push(initScrollTheme());
    cleanups.push(initSmoothScrollAndParallax());
    cleanups.push(initLiteSearch());

    initWebflow().catch(() => document.documentElement.classList.add("w-mod-ix3"));

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
