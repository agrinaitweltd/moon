import { readFileSync, writeFileSync } from "fs";

const PATH = "lib/webflow/pages/0af561420591d14d8f459e5c505aa610aeb43e83.json";
const data = JSON.parse(readFileSync(PATH, "utf8"));

// The head metadata was still the "Why choose us" page's — this file had
// ended up byte-identical to /why-choose-us (traced to an earlier revert
// that lost a manual edit snapshot-pages.mjs doesn't preserve). Fix the
// metadata to actually describe this page before replacing the body.
data.head.title = "About us | Moonstone Advocates";
data.head.description =
  "Moonstone Advocates is a Kampala-based law firm advising individuals and businesses across Uganda. Learn about our story, our approach, and the practice areas we cover.";
data.head.canonical = "about-us.html";
if (Array.isArray(data.head.jsonLd)) {
  data.head.jsonLd = data.head.jsonLd.map((s) =>
    typeof s === "string" ? s.replace(/"name":\s*"Why choose us[^"]*"/, '"name": "About Moonstone Advocates"') : s
  );
}

const arrow =
  '<div btn-arrow="right" class="arrow is-button"><div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41l-6.58-6.6a.996.996 0 1 0-1.41 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"></path></svg></div></div>';

const services = [
  {
    title: "Corporate & Commercial Advisory",
    body: "Formation, governance, contracts and transactions for businesses at every stage.",
    href: "/for-businesses/commercial",
    img: "12",
  },
  {
    title: "Tax & Regulatory Advisory",
    body: "Practical guidance through Uganda's tax and regulatory requirements.",
    href: "/for-businesses/regulatory",
    img: "13",
  },
  {
    title: "Dispute Resolution",
    body: "Clear-headed representation in commercial, civil and contractual disputes.",
    href: "/for-businesses/commercial-dispute-resolution",
    img: "14",
  },
  {
    title: "Real Estate, Land & Property",
    body: "Acquisitions, leases, land titling and property disputes handled end to end.",
    href: "/for-businesses/real-estate",
    img: "15",
  },
  {
    title: "Employment, Labour & Immigration",
    body: "Contracts, workplace policy, disputes and work-permit support for employers and individuals.",
    href: "/for-businesses/employment-hr",
    img: "16",
  },
  {
    title: "Family Law",
    body: "Considerate, practical support through relationship and family matters.",
    href: "/for-individuals/family",
    img: "17",
  },
  {
    title: "Banking, Finance & Securities",
    body: "Advice on financing arrangements, securities and institutional transactions.",
    href: "/for-businesses/banking-finance-institutions",
    img: "18",
  },
  {
    title: "Public Sector & Regulatory Advisory",
    body: "Supporting public bodies and regulated entities with compliant, sound advice.",
    href: "/for-businesses/regulatory",
    img: "19",
  },
  {
    title: "Energy & Infrastructure",
    body: "Legal support for energy, construction and infrastructure projects across Uganda.",
    href: "/for-businesses/real-estate",
    img: "20",
  },
];

const serviceCards = services
  .map(
    (s) =>
      `<a fade="details" href="${s.href}" class="w-inline-block" style="display:block;position:relative;height:280px;border-radius:12px;overflow:hidden;background-size:cover;background-position:center;background-image:url('/assets/${s.img}.png');text-decoration:none;"><div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:20px;background:linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 65%, transparent 100%);"><div class="text-size-large text-weight-semibold text-color-white" style="margin-bottom:6px;">${s.title}</div><div class="text-size-small" style="color:rgba(255,255,255,0.85);">${s.body}</div></div></a>`
  )
  .join("");

const html =
  // Hero
  '<header data-wf--01-impact-header--variant="base" class="section_impact-header"><div class="padding-global is-page-top"><div class="padding-section-large"><div class="container-large"><div class="impact-header_component"><div class="margin-bottom margin-huge"><div class="impact-header_grid"><div class="impact-header_grid-left"><h1 data-scroll-speed="0.025" data-scroll="" class="text-style-tagline">About us</h1><h2 data-scroll-speed="0.025" data-scroll="" class="heading-style-h1">A Kampala firm built on clear, practical advice</h2></div><div class="impact-header_grid-right"><p class="text-size-medium">Moonstone Advocates is an independent law firm based in Kampala, advising individuals, families and businesses across Uganda. We work across corporate, commercial, property, employment, family and dispute matters &mdash; bringing the same clarity and care to every client, whatever the size of the matter.</p><div class="margin-top margin-medium"><div class="button-group"><a arrow-rotate="trigger" data-btn-hover="" data-theme="primary" href="/our-people" class="btn is-icon w-inline-block"><div class="btn__bg"></div><div class="btn__circle-wrap"><div class="btn__circle"><div class="before__100"></div></div></div><div class="btn__text"><p class="btn-text-p">Meet our people</p></div>' +
  arrow +
  '</a><a data-theme="light" data-btn-hover="" href="/why-choose-us" class="btn w-inline-block"><div class="btn__bg light"></div><div class="btn__circle-wrap"><div class="btn__circle light"><div class="before__100"></div></div></div><div class="btn__text light"><p class="btn-text-p">Why choose us</p></div></a></div></div></div></div></div><div class="divider-horizontal"></div><div class="impact-header_component"><div class="breadcrumb_component"><div class="padding-section-xsmall"><div data-wf--breadcrumb-original--variant="base" class="breadcrumb_component"><div class="breadcrumb_div"><a href="/" class="breadcrumb_link w-inline-block"><div class="breadcrumb_page">Home</div></a><div class="breadcrumb_icon w-embed"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41l-6.58-6.6a.996.996 0 1 0-1.41 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"></path></svg></div></div><div class="breadcrumb_div"><div class="breadcrumb_current-page">About us</div></div></div></div></div><div grow-scroll="reverse" class="impact-header_image-wrapper is-radius"><img data-scroll="" data-scroll-speed="-0.05" alt="Modern lounge with central tree seating, yellow floor, circular staircase, and scattered tables and chairs." loading="eager" src="/assets/3.png" class="impact-header_image"></div></div></div></div></div></header>' +
  // Our story
  '<section data-wf--text-image--variant="left-aligned" class="section_text"><div class="padding-global"><div class="container-large"><div class="padding-section-large"><div class="text-image_component"><div class="w-layout-grid text-image_content"><div fade="details" class="text-image_content-left"><div class="margin-bottom margin-small"><h2 data-scroll="" class="heading-style-h2">Our story</h2></div><p class="text-size-medium">Moonstone Advocates was founded to offer something straightforward: legal advice that is expert, honest and genuinely helpful. Led by Managing Partner Chris Allen since 2008, the firm has grown around that same principle &mdash; that good advice should be clear enough to act on, not just technically correct.</p><p class="text-size-medium" style="margin-top:1rem;">Today our team works across corporate, property, employment, family and dispute matters for clients throughout Kampala and beyond, combining deep sector knowledge with a genuinely personal approach to every case we take on.</p></div><div data-scroll-speed="-0.05" data-scroll="" class="text-image_image-wrapper"><img data-scroll="" data-scroll-speed="-0.05" alt="Modern office reception desk with Moonstone logo and plants behind glass partition." src="/assets/4.png" loading="lazy" class="image is-parallax"></div></div></div></div></div></section>' +
  // Services grid
  '<section fade="trigger" class="section_text"><div class="padding-global"><div class="container-large"><div class="padding-section-large"><div class="margin-bottom margin-large"><h2 data-scroll="" class="heading-style-h2">What we do</h2><p class="text-size-medium" style="margin-top:0.5rem;max-width:40rem;">Nine practice areas, one consistent standard of advice.</p></div><div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:1.5rem;">' +
  serviceCards +
  '</div></div></div></div></section>' +
  // CTA
  '<section class="section_cta17"><div class="padding-global"><div class="padding-section-large"><div class="wrapper_wide-screen"><div class="container-large"><div class="cta17_component"><div class="w-layout-grid cta17_content"><div class="newsletter_content-left"><h2 data-scroll-speed="0.025" data-scroll="" class="heading-style-h3">Ready to talk through your matter?</h2><p data-scroll-speed="0.025" data-scroll="" class="text-size-medium">Get in touch and we will point you to the right person on our team.</p></div><div class="cta17_content-right"><div class="button-group"><a data-theme="primary" data-btn-hover="" href="/contact" class="btn is-icon w-inline-block"><div class="btn__bg"></div><div class="btn__circle-wrap"><div class="btn__circle"><div class="before__100"></div></div></div><div class="btn__text"><p class="btn-text-p">Get in touch</p></div>' +
  arrow +
  "</a></div></div></div></div></div></div></div></div></section>";

data.blocks[0].html = html;

const out = `${JSON.stringify(data)}\n`;
JSON.parse(out);
writeFileSync(PATH, out);
console.log("rebuilt /about-us with distinct content (story + 9 services grid + CTA)");
