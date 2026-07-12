import { readFileSync, writeFileSync } from "fs";

const PATH = "components/webflow/generated/footer.ts";
let content = readFileSync(PATH, "utf8");

// 1. Fix the footer logo — it linked to /contact# instead of home.
const oldLogoLink = '<a href=\\"/contact#\\" class=\\"footer3_logo-link w-nav-brand\\">';
const newLogoLink = '<a href=\\"/\\" class=\\"footer3_logo-link w-nav-brand\\">';
if (!content.includes(oldLogoLink)) {
  console.error("logo link marker not found");
  process.exit(1);
}
content = content.replace(oldLogoLink, newLogoLink);

// 2. The footer only ever had legal/policy links (Complaints, Cookie policy,
// Terms, Sitemap, etc.) — no way to reach About us, Our people, Careers or
// Contact from the footer at all. Add a "Company" quick-links list above the
// existing "Legal" list, both inside the same column so no grid CSS changes
// are needed.
const quickLinks = [
  ["/about-us", "About us"],
  ["/why-choose-us", "Why choose us"],
  ["/our-people", "Our people"],
  ["/careers", "Careers"],
  ["/contact", "Contact us"],
];

const quickLinksHtml = quickLinks
  .map(
    ([href, label]) =>
      `<div role=\\"listitem\\" class=\\"w-dyn-item\\"><a href=\\"${href}\\" class=\\"footer3_link\\">${label}</a></div>`
  )
  .join("");

const quickLinksBlock =
  '<div class=\\"footer3_link-list w-dyn-list\\"><div class=\\"text-size-tiny text-weight-semibold\\" style=\\"opacity:.5;letter-spacing:.05em;text-transform:uppercase;margin-bottom:.25rem;\\">Company</div><div role=\\"list\\" class=\\"footer3_collection-list w-dyn-items\\">' +
  quickLinksHtml +
  "</div></div>";

const legalListMarker = '<div class=\\"footer3_link-list w-dyn-list\\">';
if (!content.includes(legalListMarker)) {
  console.error("legal list marker not found");
  process.exit(1);
}
content = content.replace(
  legalListMarker,
  quickLinksBlock +
    '<div class=\\"text-size-tiny text-weight-semibold\\" style=\\"opacity:.5;letter-spacing:.05em;text-transform:uppercase;margin-top:1.5rem;margin-bottom:.25rem;\\">Legal</div>' +
    legalListMarker
);

// 3. Add the firm's email address next to the phone number in the office
// details dropdown — currently only the phone is shown.
const oldPhone =
  '<div class=\\"telephone\\"><div class=\\"text-size-regular\\">tel.</div><a href=\\"tel:+256778616565\\" class=\\"text-size-regular\\">+256 (0) 778 616565</a></div>';
const newPhone =
  oldPhone +
  '<div class=\\"telephone\\" style=\\"margin-top:.5rem;\\"><div class=\\"text-size-regular\\">email.</div><a href=\\"mailto:hello@moonstone.co.ug\\" class=\\"text-size-regular\\">hello@moonstone.co.ug</a></div>';
if (!content.includes(oldPhone)) {
  console.error("phone block marker not found");
  process.exit(1);
}
content = content.replace(oldPhone, newPhone);

writeFileSync(PATH, content);
console.log("footer improved: fixed logo link, added Company quick-links, added email");
