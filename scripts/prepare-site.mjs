import { copyFileSync, cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const cleanedSource = path.join(root, 'prepared-site');
const target = path.join(root, process.argv[2] || 'public');
const userImages = path.join(root, 'public/images');
const source = path.resolve(target) === path.resolve(cleanedSource)
  ? path.join(root, 'www.briffa.com')
  : existsSync(cleanedSource)
    ? cleanedSource
    : path.join(root, 'www.briffa.com');

if (!existsSync(source)) {
  throw new Error(`Missing wget source folder: ${source}`);
}

let imageBackup = '';
if (existsSync(userImages)) {
  imageBackup = mkdtempSync(path.join(os.tmpdir(), 'moonstone-images-'));
  cpSync(userImages, path.join(imageBackup, 'images'), { recursive: true });
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
if (imageBackup) {
  cpSync(path.join(imageBackup, 'images'), path.join(target, 'images'), { recursive: true });
  rmSync(imageBackup, { recursive: true, force: true });
}

const originalHero = path.join(target, 'wp-content/uploads/2023/07/Briffa-Vector-1-1.svg');
const moonstoneHero = path.join(target, 'wp-content/uploads/2023/07/moonstone-advocates-hero.svg');
if (existsSync(originalHero)) copyFileSync(originalHero, moonstoneHero);
for (const size of ['32x32', '180x180', '192x192', '270x270']) {
  const oldIcon = path.join(target, `wp-content/uploads/2023/05/cropped-briffa-favicon-${size}.png`);
  const newIcon = path.join(target, `wp-content/uploads/2023/05/cropped-moonstone-favicon-${size}.png`);
  if (existsSync(oldIcon)) copyFileSync(oldIcon, newIcon);
}

for (const oldSection of ['blog', 'author', 'category', 'briffa-case-study', 'portfolio', 'industry-insights-legal-videos-library', 'case-studies', 'meet-team']) {
  rmSync(path.join(target, oldSection), { recursive: true, force: true });
}
for (const oldProfile of ['joshua-schuermann', 'samuel-otoole']) {
  rmSync(path.join(target, 'team', oldProfile), { recursive: true, force: true });
}

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const allFiles = walk(target);
const htmlFiles = allFiles.filter((file) => file.toLowerCase().endsWith('.html'));

const moonstoneSeoTitle = 'Moonstone Advocates | Lawyers in Kampala, Uganda';
const moonstoneDescription =
  'Moonstone Advocates is a Kampala-based law firm providing practical legal solutions to businesses, organisations and individuals in Uganda.';
const themeCssPath = path.join(target, 'wp-content/themes/briffa/dist/styles.css');
const themeCss = existsSync(themeCssPath)
  ? readFileSync(themeCssPath, 'utf8').replace(/\.\.\/assets\/fonts\//g, '/wp-content/themes/briffa/assets/fonts/')
  : '';
const slugify = (value) =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cleanServicePath = (title) => `services/${slugify(title)}/index.html`;
const cleanSectorPath = (title) => `sectors/${slugify(title)}/index.html`;

const serviceAreas = [
  {
    title: 'Corporate & Commercial Advisory',
    path: cleanServicePath('Corporate & Commercial Advisory'),
    items: [
      'Company incorporation and business structuring',
      'Corporate governance and regulatory compliance',
      'Shareholder agreements and corporate documentation',
      'Commercial agreements and contract drafting',
      'Legal due diligence',
      'Business restructuring and reorganisations',
      'Mergers, acquisitions and investment transactions',
      'Corporate advisory and general business support'
    ]
  },
  {
    title: 'Tax & Regulatory Advisory',
    path: cleanServicePath('Tax & Regulatory Advisory'),
    items: [
      'Tax advisory',
      'Tax compliance support',
      'Regulatory compliance reviews',
      'Business licensing and approvals',
      'Advisory on statutory obligations',
      'Tax dispute support'
    ]
  },
  {
    title: 'Dispute Resolution',
    path: cleanServicePath('Dispute Resolution'),
    items: [
      'Commercial disputes',
      'Civil disputes',
      'Debt recovery',
      'Contractual disputes',
      'Employment disputes',
      'Land and property disputes',
      'Arbitration and alternative dispute resolution',
      'Enforcement of judgments and court orders'
    ]
  },
  {
    title: 'Real Estate, Land & Property',
    path: cleanServicePath('Real Estate, Land & Property'),
    items: [
      'Land transactions',
      'Property acquisitions and disposals',
      'Conveyancing',
      'Lease agreements',
      'Real estate due diligence',
      'Property development advisory',
      'Land dispute resolution',
      'Security documentation involving property'
    ]
  },
  {
    title: 'Employment, Labour & Immigration',
    path: cleanServicePath('Employment, Labour & Immigration'),
    items: [
      'Employment contracts',
      'Human resource policies and manuals',
      'Labour law compliance',
      'Disciplinary and termination processes',
      'Workplace disputes',
      'Employee benefits advisory',
      'Immigration and work permit support'
    ]
  },
  {
    title: 'Family Law',
    path: cleanServicePath('Family Law'),
    items: [
      'Marriage and matrimonial advisory',
      'Divorce and separation matters',
      'Child custody and maintenance disputes',
      'Family mediation',
      'Succession and inheritance planning',
      'Wills and estate planning',
      'Probate and administration of estates',
      'Family property arrangements'
    ]
  },
  {
    title: 'Banking, Finance & Securities',
    path: cleanServicePath('Banking, Finance & Securities'),
    items: [
      'Loan and facility documentation',
      'Security creation and perfection',
      'Mortgages, charges and guarantees',
      'Banking regulatory advisory',
      'Debt recovery and enforcement',
      'Financial services agreements',
      'Lending and financing transactions',
      'Restructuring and insolvency advisory'
    ]
  },
  {
    title: 'Public Sector & Regulatory Advisory',
    path: cleanServicePath('Public Sector & Regulatory Advisory'),
    items: [
      'Regulatory advisory',
      'Public procurement support',
      'Government contracting',
      'Policy and compliance advisory',
      'Administrative law matters'
    ]
  },
  {
    title: 'Energy & Infrastructure',
    path: cleanServicePath('Energy & Infrastructure'),
    items: [
      'Oil and gas law',
      'Energy regulatory compliance',
      'Infrastructure development and financing',
      'Project development agreements',
      'Power Purchase Agreements (PPAs)',
      'Environmental and social impact advisory',
      'Construction and engineering contracts',
      'Public-private partnerships (PPPs)',
      'Renewable energy and sustainability advisory'
    ]
  },
  {
    title: 'Criminal Law',
    path: cleanServicePath('Criminal Law'),
    items: [
      'Criminal defence',
      'Bail and bond applications',
      'Police station representation',
      'Criminal appeals',
      'Legal representation during investigations',
      'Extradition matters',
      'Regulatory and compliance offences',
      'Human rights and constitutional petitions in criminal matters'
    ]
  }
];

const sectorAreas = [
  { title: 'Corporate & Commercial Clients', path: cleanSectorPath('Corporate & Commercial Clients') },
  { title: 'Financial Institutions', path: cleanSectorPath('Financial Institutions') },
  { title: 'Real Estate & Construction', path: cleanSectorPath('Real Estate & Construction') },
  { title: 'Energy & Infrastructure', path: cleanSectorPath('Energy & Infrastructure') },
  { title: 'Public Sector & Government', path: cleanSectorPath('Public Sector & Government') },
  { title: 'Family & Private Clients', path: cleanSectorPath('Family & Private Clients') },
  { title: 'Employment & Immigration', path: cleanSectorPath('Employment & Immigration') },
  { title: 'Tax & Regulatory', path: cleanSectorPath('Tax & Regulatory') },
  { title: 'Disputes & Investigations', path: cleanSectorPath('Disputes & Investigations') },
  { title: 'Criminal Defence', path: cleanSectorPath('Criminal Defence') }
];

const navListItems = (areas) =>
  areas.map((area) => `                        <li class="my-2">
              <a class="text-base-light font-heading text-base hover:underline" href="/${area.path}"
                title="${area.title}">
                ${area.title}              </a>
            </li>
            <li style="flex-basis: 100%;" class="h-0"></li>`).join('\n');

const skipUrl = /^(?:\/|#|[a-z][a-z0-9+.-]*:|data:|\{\{\{)/i;
const normalizeInternalUrl = (value, file) => {
  if (skipUrl.test(value)) return value;
  if (value.startsWith('?')) return value;

  const hashIndex = value.indexOf('#');
  const queryIndex = value.indexOf('?');
  const splitIndex = [hashIndex, queryIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? -1;
  const pathname = splitIndex >= 0 ? value.slice(0, splitIndex) : value;
  const suffix = splitIndex >= 0 ? value.slice(splitIndex) : '';
  if (!pathname || pathname.startsWith('//')) return value;

  const currentDir = path.relative(target, path.dirname(file)).replace(/\\/g, '/');
  const absolute = path.posix.normalize(`/${path.posix.join(currentDir, pathname)}`);
  return `${absolute}${suffix}`;
};

const servicesMenu = (areas) =>
  areas.map((area) => `                        <li class="moonstone-service-menu-item my-2">
              <details>
                <summary>
                  <a class="text-base-light font-heading text-base hover:underline" href="/${area.path}"
                    title="${area.title}">
                    ${area.title}
                  </a>
                </summary>
                <ul>
                  ${area.items.map((item) => `<li><a href="/${area.path}#${slugify(item)}">${item}</a></li>`).join('\n                  ')}
                </ul>
              </details>
            </li>`).join('\n');

const overviewCards = (areas) =>
  areas.map((area) => `<article class="moonstone-practice-card">
  <h3><a href="/${area.path}">${area.title}</a></h3>
  <ul>${area.items.map((item) => `<li><a href="/${area.path}#${slugify(item)}">${item}</a></li>`).join('')}</ul>
</article>`).join('\n');

const moonstoneEnquiryForm = `<form class="moonstone-contact-form" action="/contact/" method="post">
  <div class="moonstone-form-grid"><label>Full name <input required name="name" autocomplete="name" type="text" /></label><label>Email address <input required name="email" autocomplete="email" type="email" /></label></div>
  <div class="moonstone-form-grid"><label>Telephone <input name="phone" autocomplete="tel" type="tel" /></label><label>Organisation <input name="organisation" autocomplete="organization" type="text" /></label></div>
  <label>Area of assistance <select required name="matter"><option value="">Select a legal service</option>${serviceAreas.map((area) => `<option>${area.title}</option>`).join('')}</select></label>
  <label>How can we help? <textarea required name="message" rows="6" placeholder="Please provide a short overview. Do not include highly confidential information at this stage."></textarea></label>
  <fieldset class="moonstone-contact-method"><legend>Preferred response</legend><label><input checked name="contact_method" value="Email" type="radio" /> Email</label><label><input name="contact_method" value="Telephone" type="radio" /> Telephone</label></fieldset>
  <label class="moonstone-form-consent"><input required name="consent" type="checkbox" /> I agree that Moonstone Advocates may use these details to respond to my enquiry.</label>
  <button class="btn btn-primary" type="submit">Prepare email enquiry</button>
  <p class="moonstone-form-note">Submitting opens your email application with these details. Sending an enquiry does not create an advocate-client relationship.</p>
</form>`;

const moonstoneContactBlock = `<h2>Contact Moonstone Advocates</h2>
<p>Moonstone Advocates welcomes enquiries from individuals, businesses and institutions seeking clear, practical legal support in Uganda.</p>
<p><strong>Address:</strong><br />Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala, Uganda</p>
<p><strong>Telephone:</strong> <a href="tel:+256778616565">+256 (0) 778 616565</a><br /><strong>Email:</strong> <a href="mailto:info@moonstoneadvocates.com">info@moonstoneadvocates.com</a><br /><strong>Website:</strong> www.moonstoneadvocates.com</p>
<p><strong>Senior partner contacts:</strong><br />Edward Labeja, Managing Partner: <a href="tel:+256778616565">+256 778 616 565</a>, <a href="mailto:leo@moonstoneadvocates.com">leo@moonstoneadvocates.com</a><br />Norah Amanya, Partner: <a href="tel:+256772986509">+256 772 986 509</a>, <a href="mailto:naa@moonstoneadvocates.com">naa@moonstoneadvocates.com</a></p>`;

const moonstoneCookieUi = `<div class="moonstone-cookie-layer" hidden>
  <div class="moonstone-cookie-backdrop"></div>
  <section class="moonstone-cookie-panel" role="dialog" aria-modal="true" aria-labelledby="moonstone-cookie-title">
    <button class="moonstone-cookie-close" type="button" aria-label="Close cookie settings">&times;</button>
    <span class="moonstone-cookie-kicker">Your privacy choices</span>
    <h2 id="moonstone-cookie-title">Choose your cookies</h2>
    <p>We use essential cookies to operate this website. With your permission, optional cookies can help us remember preferences and understand how the site is used.</p>
    <a class="moonstone-cookie-policy" href="/privacy-cookie-policy/">Read our privacy and cookie policy</a>
    <div class="moonstone-cookie-options" hidden>
      <label><span><strong>Essential</strong><small>Required for security, navigation and saved privacy choices.</small></span><input type="checkbox" checked disabled /></label>
      <label><span><strong>Preferences</strong><small>Remember choices that make your next visit easier.</small></span><input name="preferences" type="checkbox" /></label>
      <label><span><strong>Analytics</strong><small>Help us understand website performance without identifying you.</small></span><input name="analytics" type="checkbox" /></label>
      <label><span><strong>Marketing</strong><small>Allow relevant campaign measurement if introduced in future.</small></span><input name="marketing" type="checkbox" /></label>
    </div>
    <div class="moonstone-cookie-actions"><button class="moonstone-cookie-accept" type="button">Accept all</button><button class="moonstone-cookie-reject" type="button">Reject non-essential</button><button class="moonstone-cookie-manage" type="button">Manage choices</button><button class="moonstone-cookie-save" type="button" hidden>Save preferences</button></div>
  </section>
</div><button class="moonstone-cookie-tab" type="button" hidden aria-label="Open cookie settings">Cookie settings</button>`;

const moonstoneFooter = `<footer class="moonstone-footer overflow-hidden">
  <div class="moonstone-footer-main">
    <div class="moonstone-footer-intro">
      <a class="moonstone-footer-logo" href="/" aria-label="Moonstone Advocates home"><img src="/images/logo.png" alt="Moonstone Advocates" /></a>
      <h2>Moonstone Advocates</h2>
      <p>Clear, practical and partner-led legal counsel for businesses, institutions and individuals in Uganda.</p>
      <a class="btn btn-primary_alt" href="/contact/">Start a conversation</a>
    </div>
    <nav class="moonstone-footer-links" aria-label="Footer navigation">
      <div><h3>Explore</h3><a href="/services/">Services</a><a href="/sectors/">Sectors</a><a href="/about/">About us</a><a href="/#team">Our team</a></div>
      <div><h3>Information</h3><a href="/content-hub/">Legal insights</a><a href="/how-we-work-uk-office/">How we work</a><a href="/complaints-procedure/">Client care</a><a href="/privacy-cookie-policy/">Privacy policy</a></div>
      <div><h3>Contact</h3><a href="tel:+256778616565">+256 778 616 565</a><a href="mailto:info@moonstoneadvocates.com">info@moonstoneadvocates.com</a><a href="/contact/">Plot 134 Semwata Road, Ntinda, Kampala</a><a href="https://www.instagram.com/moonstoneadvocates/" target="_blank" rel="noopener">Instagram</a></div>
    </nav>
  </div>
  <div class="moonstone-footer-bottom"><span>&copy; Moonstone Advocates</span><a href="/contact/">Kampala, Uganda</a></div>
</footer>`;

const contactPageMain = `<section class="banner relative bg-navy z-[1] moonstone-contact-hero">
    <div class="relative pt-32 pb-24 overflow-hidden">
        <div class="relative container z-[1]">
            <div class="px-6 mb-12 md:w-8/12 text-base-light">
                <div class="max-w-3xl ">
                    <h1>Contact Moonstone Advocates</h1>
                    <p><strong>Speak directly with our team about your legal matter.</strong></p>
                    <p>We provide practical, partner-led legal and advisory support from Kampala, Uganda. Tell us what you need and the appropriate member of our team will respond.</p>
                </div>
            </div>
            <a class="btn btn-primary lg:mr-4 " href="#consultation" target="_self">CONTACT US</a>
        </div>
        <aside class="absolute z-0 w-5/6 h-full lg:w-1/2 -right-24 -top-12 lg:-right-36 lg:-top-20 xl:-right-48 xl:-top-24"></aside>
    </div>
    <div class="bg"></div>
</section>
<section class="py-16 bg-base-light moonstone-contact-section" id="consultation">
  <div class="relative z-[1] px-4 | md:container">
    <div class="moonstone-contact-layout">
      <div class="content moonstone-contact-details" data-aos="fade-up">${moonstoneContactBlock}
        <div class="moonstone-contact-cards"><a href="tel:+256778616565"><strong>Call our office</strong><span>+256 778 616 565</span></a><a href="mailto:info@moonstoneadvocates.com"><strong>Email the team</strong><span>info@moonstoneadvocates.com</span></a><a href="#visit"><strong>Visit in Kampala</strong><span>Plot 134 Semwata Road, Ntinda</span></a></div>
      </div>
      <div class="moonstone-contact-form-panel"><h2>Send an enquiry</h2><p>Complete the form and your email application will prepare a message for our team.</p>${moonstoneEnquiryForm}</div>
    </div>
  </div>
</section>
<section class="py-16 bg-yellow" id="visit">
  <div class="relative z-[1] px-4 | md:container">
    <div class="moonstone-visit-grid content" data-aos="fade-up">
      <div><h2>Visit Us</h2><p>Our office is located at Plot 134 Semwata Road, Ntinda, Kampala. Meetings are available by appointment so our team can prepare properly.</p><p><strong>Office hours</strong><br />Monday to Friday<br />8:30 am to 5:30 pm</p></div>
      <div><h2>What happens next?</h2><ol><li>We review the nature of your enquiry.</li><li>The appropriate lawyer contacts you to discuss the next step.</li><li>Before work begins, we confirm scope, timing and professional fees.</li></ol><p>For court deadlines, arrests or other urgent matters, please telephone the office directly.</p></div>
    </div>
  </div>
</section>`;

const firmAbout = [
  'Moonstone Advocates is a modern full-service law firm providing reliable, strategic and practical legal solutions to individuals, businesses and institutions.',
  "Our approach is built around personal attention, technical excellence and partner-led service delivery. Every client matter receives direct involvement, ensuring solutions are thoughtful, timely and aligned with the client's objectives."
];

const firmValues = ['Integrity', 'Excellence', 'Commitment', 'Innovation', 'Trust', 'Accountability', 'Client Focus', 'Professionalism'];
const firmExpertise = [
  'Commercial Transactions & Advisory',
  'Company Secretarial & Trustee Services',
  'Banking & Finance',
  'Tax and Revenue',
  'Employment',
  'Civil Litigation & Dispute Resolution',
  'Family Law Practice',
  'Energy & Infrastructure',
  'Business Support'
];

const teamMembers = [
  {
    name: 'OCHORA EDWARD LABEJA',
    role: 'Managing Partner',
    path: '/team/ochora-edward-labeja/index.html',
    sourcePath: '/meet-team/william-miles/index.html',
    image: '/images/team-edward.png',
    profile: [
      'Ochora Edward Labeja is an Advocate of the High Court of Uganda and the Managing Partner at Moonstone Advocates.',
      'He is a commercially minded dispute resolution lawyer with over a decade of progressive legal experience advising businesses, investors, financial institutions, entrepreneurs, families and public-sector entities.',
      'His experience covers corporate and commercial law, energy, water and infrastructure law, real estate and property, employment and labour law, litigation, alternative dispute resolution, family law and succession matters.',
      "Before founding Moonstone Advocates, he developed his legal career at Ochora Barristers & Co. Advocates, where he joined as an intern in 2014 and progressed to Senior Associate within the firm's Litigation Department.",
      'His litigation experience includes contractual disputes, debt recovery, enforcement proceedings, employment-related matters, commercial disputes, real estate and property disputes, and family and succession matters.'
    ],
    practice: ['Commercial & Corporate Law', 'Energy, Water & Infrastructure Law', 'Real Estate & Property Law', 'Employment & Labour Law', 'Litigation & Alternative Dispute Resolution', 'Family & Succession Law'],
    credentials: ['Bachelor of Laws (LL.B Hons), Uganda Christian University', 'Postgraduate Diploma in Legal Practice (Dip. LP), Law Development Centre', 'Member, East African Law Society'],
    quote: 'Clients deserve more than legal opinions; they deserve committed legal partners.'
  },
  {
    name: 'NORAH AMANYA',
    role: 'Partner',
    path: '/team/norah-amanya/index.html',
    sourcePath: '/meet-team/eamon-chawke/index.html',
    image: '/images/team-norah.png',
    profile: [
      'Norah Amanya is an Advocate of the High Court of Uganda and a Partner at Moonstone Advocates.',
      "She advises multinational and local clients on complex commercial transactions, corporate governance, and matters across Uganda's commercial, extractives, energy and infrastructure sectors.",
      'She has 11 years of experience spanning private practice and in-house leadership. She previously served as General Counsel at CITI Global, where she led the legal function and advised on corporate governance, commercial transactions and legal risk management.',
      'Before that, she served as Senior Associate at Cristal Advocates and ABMAK Associates. Her experience includes oil and gas, energy law, immigration law, family law, estate management, corporate governance, banking and finance, and land conveyance.',
      'She is also a published author on corporate governance and dispute resolution in the oil and gas sector.'
    ],
    practice: ['Commercial Law', 'Oil and Gas Law', 'Immigration Law', 'Family Law and Estate Management', 'Corporate Structuring and Governance', 'Infrastructure and Project Financing', 'Banking Law', 'Land Conveyance'],
    credentials: ['Postgraduate Diploma in Tax and Revenue Administration (PODITRA), Kampala', 'Master of Laws (LLM) in Oil and Gas Law, University of Aberdeen', 'Postgraduate Diploma in Legal Practice, Law Development Centre', 'Bachelor of Laws (LLB Hons), Uganda Christian University', 'Member, Uganda Law Society', 'Member, East African Law Society', 'Member, Association of International Energy Negotiators', 'Member, Institute for African Women in Law'],
    quote: 'Clear legal advice should protect the client today and position them well for tomorrow.'
  },
  {
    name: 'SANDE HAPPY',
    role: 'Senior Associate',
    path: '/team/sande-happy/index.html',
    sourcePath: '/meet-team/daniel-crate/index.html',
    image: '/images/team-sande.png',
    profile: [
      "Sande Happy is a Senior Associate and a member of the firm's Dispute Resolution, Corporate and Commercial departments.",
      'He is an Advocate of the High Court of Uganda and all subordinate courts, with over six years of experience in legal practice.',
      'He represents clients in commercial disputes before the Commercial Court of Uganda and is involved in arbitration and other alternative dispute resolution mechanisms.',
      'He has represented clients in land disputes, employment disputes and domestic disputes. He has also handled labour disputes for financial institutions, local companies and international companies, as well as debt collection for financial institutions.',
      'His corporate and transactional work includes company registration, trademarks, patents, legal due diligence, acquisitions and mergers.'
    ],
    practice: ['Litigation', 'Banking and Finance', 'Energy and Infrastructure', 'Debt Recovery', 'Intellectual Property', 'Employment and Labour'],
    credentials: ['Diploma in Legal Practice (Dip. Law), Law Development Centre', 'Bachelor of Laws (LLB), Uganda Christian University', 'Member, Uganda Law Society', 'Member, East African Law Society'],
    quote: 'Disputes are best handled with preparation, clarity and a steady focus on results.'
  },
  {
    name: 'AKELLO SHIRLEY MARYLIN',
    role: 'Associate',
    path: '/team/akello-shirley-marylin/index.html',
    sourcePath: '/meet-team/charlotte-owens/index.html',
    image: '/images/team-akello.png',
    profile: [
      "Akello Shirley Marylin is an Associate in the firm's Litigation Department.",
      'She joined Moonstone Advocates as an intern and was retained upon completion of her Postgraduate Diploma in Legal Practice.',
      'She supports corporate clients across contract review and drafting, loan documentation, perfection of securities and employment advisory services.',
      'Her practice also extends to corporate governance, compliance, quality assurance, banking and finance, and employment law advisory. She maintains a keen interest in litigation, artificial intelligence and technology governance within the corporate space.',
      'She is known for a resilient, results-oriented approach and is committed to delivering a high standard of client service.'
    ],
    practice: ['Litigation', 'Debt Recovery', 'Intellectual Property', 'Employment and Labour'],
    credentials: ['Diploma in Legal Practice (Dip. Law), Law Development Centre', 'Bachelor of Laws (LLB), Cavendish University', 'Member, Uganda Law Society', 'Member, East African Law Society'],
    quote: 'Resilient legal support means staying precise, responsive and client-focused.'
  },
  {
    name: 'MWAKA JAMES TOLIT',
    role: 'Associate',
    path: '/team/mwaka-james-tolit/index.html',
    sourcePath: '/meet-team/mark-eiffe/index.html',
    image: '/images/team-mwaka.png',
    profile: [
      'Mwaka James Tolit is an Associate at Moonstone Advocates and a member of the Litigation and Commercial Departments.',
      'His practice covers corporate and commercial advisory, corporate governance, regulatory compliance, dispute resolution and litigation.',
      'He has advised clients across banking, insurance, communications, e-commerce, oil and gas, agribusiness, hospitality, energy and transport.',
      'His work also includes mergers and acquisitions, employment matters, new business ventures, market entry, commercial contracts, immigration, licensing and alternative dispute resolution.',
      'James also acts as a Company Secretary to corporates, multinationals and NGOs, supporting corporate governance frameworks, board operations and statutory compliance. He represents clients before courts, tribunals and other forums.'
    ],
    practice: ['Litigation', 'Banking and Finance', 'Debt Recovery', 'Intellectual Property', 'Real Estate', 'Employment and Labour'],
    credentials: ['Diploma in Legal Practice (Dip. Law), Institute of Legal Practice and Development, Kigali', 'Bachelor of Laws (LLB), Uganda Christian University', 'Member, East African Law Society'],
    quote: 'Strong advisory work connects commercial reality with dependable legal structure.'
  },
  {
    name: 'ECHIBA EDWIN MICHEAL',
    role: 'Consultant',
    path: '/team/echiba-edwin-micheal/index.html',
    sourcePath: '/meet-team/mohammad-khan/index.html',
    image: '/images/team-echiba.png',
    profile: [
      "Echiba Edwin Micheal is a Consultant at Moonstone Advocates and serves as an External Consultant in the firm's Tax Department.",
      'He provides strategic tax advisory, dispute resolution and regulatory compliance services.',
      'He is an Advocate of the High Court of Uganda, a tax consultant and a governance professional with nine years of professional experience. He is also a licensed tax agent.',
      'His tax experience covers tax advisory, tax compliance, tax dispute resolution, transfer pricing and international tax.',
      'He has worked with KPMG Uganda and with leading Ugandan tax lawyers and accountants.'
    ],
    practice: ['Taxation', 'Litigation', 'Banking and Finance', 'Debt Recovery', 'Employment and Labour'],
    credentials: ['Advanced Diploma in International Taxation (ADIT), ongoing', 'Chartered Institute of Taxation, UK', 'Chartered Secretary and Chartered Governance Course (ICSA), ongoing', 'Postgraduate Diploma in Tax and Revenue Administration (PODITRA)', 'Master of Laws in Oil and Gas Law', 'Postgraduate Diploma in Legal Practice, Law Development Centre', 'Bachelor of Laws (LLB), Uganda Christian University', 'Member, Uganda Law Society', 'Member, East African Law Society', 'Member, Uganda Tax Agents Association', 'Member, Uganda Christian Lawyers Fraternity'],
    quote: 'Tax and regulatory advice should be technically sound, practical and timely.'
  }
];

const keyContacts = teamMembers.slice(0, 2);
const listMarkup = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const paragraphs = (items) => items.map((item) => `<p>${item}</p>`).join('\n');
const teamCard = (member) => `<div class="w-3/4 text-center flex flex-col mb-8 px-4 | sm:w-1/2 | md:w-1/4">
                <a href="${member.path}">
                    <img width="192" height="192" loading="lazy"
                        class="mx-auto h-48 flex-1 mb-6 rounded-full object-cover" src="${member.image}" />
                    <p class="font-heading mb-0 font-bold text-lg | lg:text-2xl">${member.name}</p>
                    <p class="font-heading mt-0 font-bold text-purple text-sm | lg:text-md">${member.role}</p>
                </a>
            </div>`;
const teamGrid = (members) => members.map(teamCard).join('\n                                    ');
const profileBody = (member) => `${paragraphs(member.profile)}
<p><strong>Practice Areas</strong></p>
${listMarkup(member.practice)}
<p><strong>Education, Qualifications and Memberships</strong></p>
${listMarkup(member.credentials)}`;
const fullTeamSection = `<section id="team" class="py-16 relative overflow-hidden bg-base-light">

    <div class="w-48 h-48 rounded-full bg-base-shade absolute top-2 left-2 z-[-1]"></div>
    <div class="w-96 h-96 rounded-full bg-base-shade absolute top-1/2 left-1/2 z-[-1]"></div>


    <div class="relative z-[1] px-4 | md:container | lg:py-24 p-limit  overflow-hidden">
                <div class="mb-12 mx-auto w-10/12 text-center content">
            <h2 style="text-align: center;">Meet The <strong>Team</strong></h2>
<p style="text-align: center;">Moonstone Advocates brings together advocates and consultants with experience across commercial advisory, disputes, tax, employment, property, energy, infrastructure and family law.</p>
        </div>
        
        <div class="flex flex-wrap align-top justify-center mx-auto">
                                    ${teamGrid(teamMembers)}
                    </div>
        <div class="container flex flex-wrap justify-center">
            <a class="btn btn-primary_alt lg:mr-4 m-4" href="/contact/index.html">Contact the team</a>
        </div>
    </div>
</section>`;

const replacements = [
  [/Briffa Legal Limited/g, 'Moonstone Advocates'],
  [/Briffa Legal Ltd/g, 'Moonstone Advocates'],
  [/Briffa Legal/g, 'Moonstone Advocates'],
  [/Briffa IP Solicitors/g, 'Moonstone Advocates'],
  [/Margaret Briffa/g, 'Moonstone Advocates'],
  [/\bBriffa\b/g, 'Moonstone Advocates'],
  [/Intellectual Property Lawyers UK \| Moonstone Advocates/g, moonstoneSeoTitle],
  [/Specialist Intellectual Property Lawyers/g, 'Practical Legal Counsel in Uganda'],
  [/specialist intellectual property law firm/gi, 'Kampala-based full service law firm'],
  [/intellectual property law firm/gi, 'law firm'],
  [/intellectual property lawyers/gi, 'lawyers'],
  [/intellectual property \(IP\)/gi, 'legal matters'],
  [/intellectual property/gi, 'commercial and private legal'],
  [/IP rights/g, 'legal rights'],
  [/\bIP\b/g, 'law'],
  [/Trade Marks/g, 'Corporate Law'],
  [/Trade marks/g, 'Corporate law'],
  [/trade marks/g, 'corporate law'],
  [/Trade mark/g, 'Corporate'],
  [/trade mark/g, 'corporate'],
  [/Copyright/g, 'Dispute Resolution'],
  [/copyright/g, 'dispute resolution'],
  [/Patents/g, 'Real Estate'],
  [/patents/g, 'real estate'],
  [/Design Rights/g, 'Employment Law'],
  [/design rights/g, 'employment law'],
  [/Brand Protection/g, 'Regulatory Compliance'],
  [/brand protection/g, 'regulatory compliance'],
  [/Confidential Information/g, 'Contracts'],
  [/Data Protection/g, 'Tax Advisory'],
  [/Licensing Agreements/g, 'Investment Advisory'],
  [/Image Rights/g, 'Family Law'],
  [/London Office/g, 'Kampala Office'],
  [/Ireland \(EU\) Office/g, 'Kampala Office'],
  [/UK Office/g, 'Kampala Office'],
  [/London/g, 'Kampala'],
  [/United Kingdom/g, 'Uganda'],
  [/\bUK\b/g, 'Uganda'],
  [/Republic of Ireland/g, 'Uganda'],
  [/Ireland/g, 'Uganda'],
  [/Cork/g, 'Kampala'],
  [/Business Design Centre, 52 Upper Street/g, 'P.O. Box 189860'],
  [/Business Design Centre, 52 Upper St/g, 'P.O. Box 189860'],
  [/52 Upper St, Kampala N1 0QH, Uganda/g, 'P.O. Box 189860, Kampala, Uganda'],
  [/N1 0QH/g, ''],
  [/T23 PPT8/g, ''],
  [/\+44 \(0\)20 70962779/g, ''],
  [/\+44 020 70962779/g, ''],
  [/\+442070962779/g, ''],
  [/\+3530212379722/g, ''],
  [/\+353\s?021\s?237\s?9722/g, ''],
  [/\+353[\s()0-9-]{6,20}/g, ''],
  [/\\u002b353[\s()0-9-]{6,20}/g, ''],
  [/\+44\s?020\s?7096\s?2779/g, ''],
  [/\+44\s?\(0\)20\s?7096\s?2779/g, ''],
  [/\+44[\s()0-9-]{6,20}/g, ''],
  [/\\u002b44[\s()0-9-]{6,20}/g, ''],
  [/020\s?7096\s?2779/g, ''],
  [/tel:\+4402070962779/g, '#contact'],
  [/tel:\+3530212379722/g, '#contact'],
  [/briffalegal/g, 'moonstoneadvocates'],
  [/Briffa-Awards/g, 'Legal-Services'],
  [/BRIFFA/g, 'MOONSTONE ADVOCATES'],
  [/Briffa/g, 'Moonstone Advocates'],
  [/https:\/\/www\.moonstone-advocates\.com/g, ''],
  [/https:\\\/\\\/www\.moonstone-advocates\.com/g, ''],
  [/https:\/\/www\.briffa\.com/g, ''],
  [/http:\/\/www\.briffa\.com/g, ''],
  [/https:\\\/\\\/www\.briffa\.com/g, ''],
  [/http:\\\/\\\/www\.briffa\.com/g, ''],
  [/www\.briffa\.com/g, ''],
  [/briffa\.com/g, '']
];

for (const file of htmlFiles) {
  let html = readFileSync(file, 'utf8');

  html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g, '');
  html = html.replace(/<noscript><iframe src="https:\/\/www\.googletagmanager\.com[\s\S]*?<\/noscript>/g, '');
  html = html.replace(/<script\b[^>]*>[\s\S]*?(?:bat\.bing\.com|uetq|187242548)[\s\S]*?<\/script>/g, '');
  html = html.replace(/<script[^>]+src="\/(?:wp-content|wp-includes)\/[^"]*"[^>]*><\/script>/g, '');
  html = html.replace(/<script[^>]+src="(?:wp-content|wp-includes)\/[^"]*"[^>]*><\/script>/g, '');
  html = html.replace(/<script>\s*var\s+(?:formDisplay|nfi18n|nfFrontEnd)[\s\S]*?<\/script>/g, '');
  html = html.replace(/<script>\(function\(\)\{function c\(\)[\s\S]*?<\/script><\/body>/g, '</body>');

  for (const [pattern, value] of replacements) html = html.replace(pattern, value);

  html = html.replace(/\b(src|href)="([^"]*)Moonstone Advocates([^"]*)"/g, '$1="$2Briffa$3"');
  html = html.replace(/\b(src|href)="(wp-(?:content|includes)\/[^"]*)"/g, '$1="/$2"');
  html = html.replace(/cropped-briffa-favicon/g, 'cropped-moonstone-favicon');
  if (themeCss) {
    html = html.replace(
      /<link rel="stylesheet" href="(?:\/|(?:\.\.\/)*|)wp-content\/themes\/briffa\/dist\/styles\.css"[^>]*>/g,
      `<style id="moonstone-theme-css">\n${themeCss}\n</style>`
    );
    if (!html.includes('id="moonstone-theme-css"')) {
      html = html.replace('</head>', `<style id="moonstone-theme-css">\n${themeCss}\n</style>\n</head>`);
    }
  }

  html = html.replace(/<html lang="en-GB"/g, '<html lang="en-UG"');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${moonstoneSeoTitle}</title>`);
  if (!/<title>[\s\S]*?<\/title>/.test(html)) {
    html = html.replace('</head>', `  <title>${moonstoneSeoTitle}</title>\n</head>`);
  }
  if (!html.includes('.moonstone-wordmark{')) {
    html = html.replace(
      '</head>',
      `<style>
.moonstone-wordmark{display:inline-grid;grid-template-columns:auto 24px;grid-template-rows:1fr 1fr;column-gap:14px;align-items:center;color:#181a34;font-family:Mulish,Arial,sans-serif;font-weight:800;line-height:1.05;font-size:22px;letter-spacing:0}
.moonstone-wordmark span{display:block}
.moonstone-wordmark i{grid-column:2;grid-row:1 / span 2;position:relative;width:24px;height:28px;display:block}
.moonstone-wordmark i:before,.moonstone-wordmark i:after{content:"";position:absolute;border-radius:999px;background:#f5bb20}
.moonstone-wordmark i:before{width:9px;height:9px;left:2px;top:3px;box-shadow:12px 0 0 #f5bb20}
.moonstone-wordmark i:after{width:6px;height:6px;left:13px;top:16px}
@media (max-width:480px){.moonstone-wordmark{font-size:16px;grid-template-columns:auto}.moonstone-wordmark i{display:none}}
.moonstone-practice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem;margin:2rem auto;max-width:1100px;padding:0 1rem}
.moonstone-practice-card{background:#fff;border-radius:.5rem;padding:1.25rem;color:#181a34}
.moonstone-practice-card h3{font-family:Jost,sans-serif;font-size:1.2rem;margin:0 0 .75rem}
.moonstone-practice-card ul{margin:0;padding-left:1.1rem}
.moonstone-practice-card li{margin:.25rem 0}
.moonstone-practice-card a{color:inherit;text-decoration:none}
.moonstone-practice-card li a:hover{text-decoration:underline}
@media (max-width:767px){.moonstone-practice-grid{grid-template-columns:1fr}}
.moonstone-contact-form{display:grid;gap:1rem;max-width:560px;margin:1.5rem auto 0;text-align:left}
.moonstone-contact-form label{display:grid;gap:.35rem;font-weight:700}
.moonstone-contact-form input,.moonstone-contact-form textarea,.moonstone-contact-form select{width:100%;border:1px solid rgba(24,26,52,.2);border-radius:.25rem;padding:.85rem 1rem;color:#181a34;background:#fff}
.moonstone-contact-form textarea{resize:vertical}
.moonstone-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.moonstone-contact-method{border:0;padding:0;margin:0;display:flex;align-items:center;flex-wrap:wrap;gap:.75rem 1.5rem}.moonstone-contact-method legend{font-weight:700;margin-bottom:.5rem;width:100%}.moonstone-contact-method label,.moonstone-form-consent{display:flex!important;grid-template-columns:none!important;align-items:flex-start;gap:.55rem;font-weight:400!important}.moonstone-contact-method input,.moonstone-form-consent input{width:auto;margin-top:.22rem}.moonstone-form-note{font-size:.85rem;line-height:1.5;opacity:.75;margin:0}
.moonstone-contact-layout{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:4rem;align-items:start}.moonstone-contact-details{padding-top:1rem}.moonstone-contact-form-panel{background:#fff;padding:2rem;border-top:4px solid #eab736;box-shadow:0 22px 60px rgba(24,26,52,.1)}.moonstone-contact-form-panel h2{margin-top:0}.moonstone-contact-cards{display:grid;gap:.75rem;margin-top:2rem}.moonstone-contact-cards a{display:flex;flex-direction:column;gap:.2rem;padding:1rem 1.1rem;background:#fff;border-left:3px solid #6481b9;color:#181a34;text-decoration:none;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}.moonstone-contact-cards a:hover{transform:translateX(8px);border-color:#eab736;box-shadow:0 12px 28px rgba(24,26,52,.1)}.moonstone-contact-cards span{font-size:.92rem}.moonstone-visit-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:5rem}.moonstone-visit-grid ol{padding-left:1.25rem}.moonstone-visit-grid li{margin:.75rem 0}
html,.custom-css{overflow-x:hidden}
body:not(.moonstone-aos-ready) [data-aos]{opacity:1!important;transform:none!important}
.custom-css img{max-width:100%;height:auto}
.custom-css header img[src="/images/logo.png"]{max-width:118px;max-height:34px;width:auto;height:auto;object-fit:contain;transition:transform .35s ease,opacity .35s ease}
.custom-css header a:hover img[src="/images/logo.png"]{transform:translateY(-1px) scale(1.02)}
.custom-css section>.relative,.custom-css section>.container,.custom-css .content,.custom-css footer .container{box-sizing:border-box}
.custom-css .btn,.custom-css .moonstone-practice-card,.custom-css #team .flex.flex-col,.custom-css .content a,.custom-css article,.custom-css form input,.custom-css form textarea{transition:transform .28s ease,box-shadow .28s ease,opacity .28s ease,background-color .28s ease,border-color .28s ease}
.custom-css .btn:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(24,26,51,.18)}
.custom-css .moonstone-practice-card:hover,.custom-css #team .flex.flex-col:hover,.custom-css article:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(24,26,51,.12)}
.custom-css form input:focus,.custom-css form textarea:focus{outline:none;border-color:#6481b9;box-shadow:0 0 0 4px rgba(100,129,185,.16)}
.custom-css .banner img,.custom-css section img[src="/images/image.png"]{animation:moonstone-soft-float 7s ease-in-out infinite alternate}
.custom-css .bg-yellow.rounded-full,.custom-css .bg-purple.rounded-full{animation:moonstone-pulse 5.5s ease-in-out infinite alternate}
.custom-css nav a{transition:opacity .25s ease,color .25s ease,transform .25s ease}
.custom-css nav a:hover{transform:translateY(-1px)}
.moonstone-clickable{cursor:pointer;position:relative}
.moonstone-clickable:focus-visible{outline:3px solid #eab736;outline-offset:5px}
.moonstone-reveal{opacity:1;transform:none}
.moonstone-reveal.is-visible{animation:moonstone-reveal-up .75s cubic-bezier(.2,.7,.2,1) var(--moonstone-delay,0ms) both}
.moonstone-reveal.moonstone-reveal-left.is-visible{animation-name:moonstone-reveal-left}
.moonstone-reveal.moonstone-reveal-right.is-visible{animation-name:moonstone-reveal-right}
.moonstone-reveal.moonstone-reveal-scale.is-visible{animation-name:moonstone-reveal-scale}
.moonstone-section-heading{max-width:760px;margin:0 auto 3rem;text-align:center}.moonstone-section-heading>span,.moonstone-eyebrow{display:inline-block;font-family:Jost,sans-serif;font-size:.78rem;text-transform:uppercase;color:#6f3e78;margin-bottom:.6rem}.moonstone-insight-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem}.moonstone-insight-card{position:relative;background:#fff;padding:1.75rem;border-top:4px solid #6481b9;box-shadow:0 12px 35px rgba(24,26,52,.08);transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease}.moonstone-insight-card:hover{transform:translateY(-8px);box-shadow:0 24px 50px rgba(24,26,52,.14);border-color:#eab736}.moonstone-insight-card>span{display:inline-block;font-family:Jost,sans-serif;color:#6f3e78;font-size:.82rem}.moonstone-insight-card time{float:right;font-size:.82rem;opacity:.7}.moonstone-insight-card h2{font-size:1.45rem!important;line-height:1.2!important;margin:1.2rem 0 .75rem}.moonstone-insight-card h2 a{color:#181a34;text-decoration:none}.moonstone-text-link{display:inline-block;font-family:Jost,sans-serif;font-weight:700;color:#181a34;text-underline-offset:4px;transition:transform .25s ease,color .25s ease}.moonstone-text-link:hover{transform:translateX(6px);color:#6f3e78}.moonstone-standard-grid{max-width:1100px;margin:3rem auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}.moonstone-standard-grid article{background:#fff;padding:1.5rem;border-bottom:4px solid #eab736;transition:transform .35s ease,box-shadow .35s ease}.moonstone-standard-grid article:hover{transform:translateY(-7px);box-shadow:0 20px 40px rgba(24,26,52,.12)}.moonstone-standard-grid strong{font-family:Jost,sans-serif;font-size:1.15rem}.moonstone-article-meta{display:flex;justify-content:space-between;gap:1rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid rgba(24,26,52,.15);font-family:Jost,sans-serif}.moonstone-article aside{margin:2rem 0;padding:1.25rem 1.5rem;background:#eef0ff;border-left:4px solid #6f3e78}.moonstone-article aside p{margin-bottom:0}.moonstone-cookie-open{overflow:hidden}.moonstone-profile-layout{max-width:1160px;margin:0 auto;padding:0 2rem;display:grid;grid-template-columns:minmax(280px,.78fr) minmax(0,1.22fr);gap:4rem;align-items:start}.moonstone-profile-image{position:sticky;top:9rem;min-height:540px;background:#181a34;overflow:hidden}.moonstone-profile-image img{display:block;width:100%;height:100%;min-height:540px;object-fit:contain;object-position:center bottom;transition:transform .7s cubic-bezier(.2,.8,.2,1),filter .5s ease}.moonstone-profile-image:hover img{transform:scale(1.035);filter:saturate(1.06)}.moonstone-profile article h2{font-size:2.35rem!important;margin-top:.25rem}.moonstone-profile article ul{columns:2;column-gap:2rem}.moonstone-profile article li{break-inside:avoid;margin-bottom:.45rem}.moonstone-profile blockquote{margin:2rem 0;padding:1.25rem 1.5rem;border-left:4px solid #eab736;background:#fff;font-family:Jost,sans-serif;font-size:1.15rem}
.moonstone-page-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#fcf7fb;transition:opacity .65s ease,visibility .65s ease}
.moonstone-loader-inner{display:flex;flex-direction:column;align-items:center;gap:1.25rem}.moonstone-loader-inner img{width:auto;height:auto;max-width:180px;max-height:58px;object-fit:contain;animation:moonstone-loader-logo 1.2s ease-in-out infinite alternate}.moonstone-loader-line{width:170px;height:3px;overflow:hidden;background:rgba(24,26,52,.12)}.moonstone-loader-line:after{content:"";display:block;width:55%;height:100%;background:#eab736;animation:moonstone-loader-line 1.1s ease-in-out infinite}.moonstone-loader-inner span{font-family:Jost,sans-serif;font-size:.8rem;text-transform:uppercase;letter-spacing:0;color:#181a34}
.moonstone-page-loader.is-hidden{opacity:0;visibility:hidden;pointer-events:none}
.moonstone-page-ready main{animation:moonstone-page-in .7s ease both}
@keyframes moonstone-soft-float{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(0,-10px,0) scale(1.015)}}
@keyframes moonstone-pulse{from{transform:scale(1);opacity:.92}to{transform:scale(1.06);opacity:1}}
@keyframes moonstone-spin{to{transform:rotate(360deg)}}
@keyframes moonstone-page-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes moonstone-reveal-up{from{opacity:0;transform:translate3d(0,34px,0)}to{opacity:1;transform:none}}
@keyframes moonstone-reveal-left{from{opacity:0;transform:translate3d(-38px,0,0)}to{opacity:1;transform:none}}
@keyframes moonstone-reveal-right{from{opacity:0;transform:translate3d(38px,0,0)}to{opacity:1;transform:none}}
@keyframes moonstone-reveal-scale{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
@keyframes moonstone-loader-logo{from{opacity:.68;transform:translateY(3px)}to{opacity:1;transform:translateY(-3px)}}
@keyframes moonstone-loader-line{from{transform:translateX(-110%)}to{transform:translateX(210%)}}
.moonstone-cookie-layer{position:fixed;inset:0;z-index:9998;display:grid;place-items:center;padding:1.25rem}.moonstone-cookie-layer[hidden]{display:none}.moonstone-cookie-backdrop{position:absolute;inset:0;background:rgba(24,26,52,.72);backdrop-filter:blur(7px);animation:moonstone-cookie-fade .45s ease both}.moonstone-cookie-panel{position:relative;width:min(520px,100%);max-height:calc(100vh - 2.5rem);overflow-y:auto;background:#fff;color:#181a34;padding:2.25rem;border-top:5px solid #eab736;box-shadow:0 28px 90px rgba(0,0,0,.28);animation:moonstone-cookie-in .6s cubic-bezier(.2,.8,.2,1) both}.moonstone-cookie-panel h2{font-family:Jost,sans-serif;font-size:2rem;line-height:1.08;margin:.35rem 0 1rem}.moonstone-cookie-panel p{line-height:1.65;margin:0 0 .65rem}.moonstone-cookie-kicker{font-family:Jost,sans-serif;text-transform:uppercase;font-size:.75rem;color:#6f3e78}.moonstone-cookie-policy{color:#181a34;text-underline-offset:4px}.moonstone-cookie-close{position:absolute;right:1rem;top:.75rem;border:0;background:transparent;font-size:1.8rem;line-height:1;color:#181a34;cursor:pointer}.moonstone-cookie-options{margin:1.4rem 0;border-top:1px solid rgba(24,26,52,.14)}.moonstone-cookie-options[hidden]{display:none}.moonstone-cookie-options label{display:flex;justify-content:space-between;gap:1rem;padding:1rem 0;border-bottom:1px solid rgba(24,26,52,.14);cursor:pointer}.moonstone-cookie-options span{display:flex;flex-direction:column;gap:.2rem}.moonstone-cookie-options small{line-height:1.4;opacity:.72}.moonstone-cookie-options input{width:42px;height:22px;accent-color:#6f3e78;flex:0 0 auto}.moonstone-cookie-actions{display:grid;gap:.7rem;margin-top:1.75rem}.moonstone-cookie-actions button{min-height:52px;border:2px solid #181a34;padding:.75rem 1rem;font-family:Jost,sans-serif;font-weight:700;cursor:pointer;transition:transform .25s ease,box-shadow .25s ease,background .25s ease,color .25s ease}.moonstone-cookie-actions button:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(24,26,52,.16)}.moonstone-cookie-accept{background:#181a34;color:#fff}.moonstone-cookie-reject,.moonstone-cookie-save{background:#eef0ff;color:#181a34}.moonstone-cookie-manage{border-color:transparent!important;background:transparent;color:#181a34;text-decoration:underline;text-underline-offset:4px}.moonstone-cookie-tab{position:fixed;z-index:90;left:1rem;bottom:1rem;border:0;background:#181a34;color:#fff;padding:.7rem 1rem;font-family:Jost,sans-serif;font-weight:700;box-shadow:0 8px 24px rgba(24,26,52,.25);cursor:pointer;animation:moonstone-cookie-tab .5s ease both}.moonstone-cookie-tab[hidden]{display:none}
@keyframes moonstone-cookie-fade{from{opacity:0}to{opacity:1}}@keyframes moonstone-cookie-in{from{opacity:0;transform:translateY(30px) scale(.96)}to{opacity:1;transform:none}}@keyframes moonstone-cookie-tab{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.moonstone-footer{background:#f8f4f7;color:#181a34;border-top:1px solid rgba(24,26,52,.1)}
.moonstone-footer-main{max-width:1280px;margin:0 auto;padding:4.5rem 2rem 3.5rem;display:grid;grid-template-columns:minmax(240px,.85fr) minmax(0,1.65fr);gap:4rem}
.moonstone-footer-intro{max-width:360px}.moonstone-footer-intro h2{font-family:Jost,sans-serif;font-size:2rem;line-height:1.1;margin:0 0 1rem}.moonstone-footer-intro p{margin:0 0 1.5rem;line-height:1.7}
.moonstone-footer-logo{display:inline-block;margin-bottom:1.35rem}.moonstone-footer-logo img{display:block;width:auto;height:auto;max-width:150px;max-height:44px;object-fit:contain;transition:transform .4s ease}.moonstone-footer-logo:hover img{transform:translateY(-3px) scale(1.025)}
.moonstone-footer-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2rem}.moonstone-footer-links div{display:flex;flex-direction:column;align-items:flex-start;gap:.65rem}.moonstone-footer-links h3{font-family:Jost,sans-serif;font-size:1.05rem;margin:0 0 .4rem}.moonstone-footer-links a{color:#181a34;text-decoration:none;line-height:1.45;transition:color .25s ease,transform .25s ease}.moonstone-footer-links a:hover{color:#6f3e78;transform:translateX(4px)}
.moonstone-footer-bottom{background:#181a34;color:#fff;display:flex;justify-content:space-between;gap:1rem;padding:1rem max(2rem,calc((100vw - 1216px)/2));font-size:.9rem}.moonstone-footer-bottom a{color:#fff;text-decoration:none}
@media (prefers-reduced-motion:reduce){.custom-css *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@media (max-width:767px){.custom-css header img[src="/images/logo.png"]{max-width:92px;max-height:28px}.custom-css section>.relative,.custom-css section>.container,.custom-css .content{padding-left:1rem!important;padding-right:1rem!important}.custom-css .banner{margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important}.custom-css .banner .px-6,.custom-css .banner .px-8,.custom-css .banner .px-4{padding-left:1rem!important;padding-right:1rem!important}.custom-css h1{font-size:2.25rem!important;line-height:1.05!important;overflow-wrap:anywhere}.custom-css h2{font-size:1.85rem!important;line-height:1.12!important;overflow-wrap:anywhere}.custom-css p,.custom-css li,.custom-css a{overflow-wrap:anywhere}.custom-css .btn{white-space:normal;text-align:center}.custom-css #team .flex.flex-wrap{margin-left:0!important;margin-right:0!important}.custom-css #team .flex.flex-col{width:100%!important;max-width:320px}.moonstone-contact-form{max-width:100%}.moonstone-form-grid,.moonstone-contact-layout,.moonstone-visit-grid{grid-template-columns:1fr}.moonstone-contact-layout,.moonstone-visit-grid{gap:2rem}.moonstone-contact-form-panel{padding:1.25rem}.moonstone-reveal{transform:translate3d(0,24px,0)}.moonstone-footer-main{padding:3.25rem 1.25rem 2.5rem;grid-template-columns:1fr;gap:2.75rem}.moonstone-footer-links{grid-template-columns:1fr 1fr;gap:2.25rem 1.25rem}.moonstone-footer-links div:last-child{grid-column:1/-1}.moonstone-footer-bottom{padding:1rem 1.25rem;flex-direction:column}.moonstone-footer-intro h2{font-size:1.75rem!important}.moonstone-cookie-layer{padding:.75rem;align-items:end}.moonstone-cookie-panel{padding:1.5rem;max-height:calc(100vh - 1.5rem)}.moonstone-cookie-panel h2{font-size:1.7rem!important}.moonstone-cookie-actions button{min-height:48px}.moonstone-loader-inner img{max-width:130px;max-height:44px}}
.moonstone-services-menu{width:min(92vw,760px)!important;gap:1rem}
.moonstone-services-menu .moonstone-service-menu-item{flex:1 1 320px}
.moonstone-service-menu-item details{border-bottom:1px solid rgba(255,255,255,.18);padding:.15rem 0 .5rem}
.moonstone-service-menu-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.moonstone-service-menu-item summary::-webkit-details-marker{display:none}
.moonstone-service-menu-item summary:after{content:"+";font-family:Jost,sans-serif;font-weight:700}
.moonstone-service-menu-item details[open] summary:after{content:"-"}
.moonstone-service-menu-item details ul{margin:.5rem 0 0;padding:0 0 0 .85rem}
.moonstone-service-menu-item details li{font-size:.875rem;line-height:1.35;margin:.35rem 0;color:#fff}
.moonstone-service-menu-item details li a{color:#fff;text-decoration:none;opacity:.9}
.moonstone-service-menu-item details li a:hover{text-decoration:underline;opacity:1}
@media (min-width:1024px){li.group:hover>.moonstone-services-menu{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.moonstone-service-menu-item details[open] ul{display:block}}
@media (max-width:1023px){body.moonstone-menu-active{overflow:hidden}.custom-css header.menu nav#menu{left:0!important;right:0!important;width:100vw!important;max-width:100vw!important;padding:1rem 1rem 3rem!important;opacity:0;transform:translateY(-14px);transition:opacity .3s ease,transform .3s ease}.custom-css header.menu nav#menu.moonstone-mobile-open{opacity:1;transform:none}.custom-css header.menu nav#menu>ul>li{border-bottom:1px solid rgba(255,255,255,.16);padding:.7rem 0}.custom-css header.menu nav#menu>ul>li>a{display:inline-flex;padding:.65rem .75rem}.custom-css header.menu nav#menu>ul>li>span{float:right;margin:.3rem .25rem 0 0;padding:.75rem;transition:transform .3s ease}.custom-css header.menu nav#menu>ul>li.moonstone-submenu-open>span{transform:rotate(180deg)}.custom-css header.menu nav#menu>ul>li>ul{display:none!important;position:static!important;width:100%!important;margin:.35rem 0 .5rem!important;padding:.65rem .75rem!important;box-shadow:none!important;border-radius:.35rem!important}.custom-css header.menu nav#menu>ul>li.moonstone-submenu-open>ul{display:block!important;animation:moonstone-menu-drop .35s ease both}.moonstone-services-menu{width:100%!important}.moonstone-menu-toggle{width:42px;height:42px;display:inline-grid;place-items:center;border-radius:50%;transition:background .25s ease,transform .25s ease}.moonstone-menu-toggle:hover{background:rgba(24,26,52,.08)}.moonstone-menu-toggle span,.moonstone-menu-toggle:before,.moonstone-menu-toggle:after{content:"";display:block;width:20px;height:2px;background:#181a34;transition:transform .3s ease,opacity .3s ease;position:absolute}.moonstone-menu-toggle:before{transform:translateY(-6px)}.moonstone-menu-toggle:after{transform:translateY(6px)}.moonstone-menu-toggle[aria-expanded="true"] span{opacity:0}.moonstone-menu-toggle[aria-expanded="true"]:before{transform:rotate(45deg)}.moonstone-menu-toggle[aria-expanded="true"]:after{transform:rotate(-45deg)}}
@keyframes moonstone-menu-drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.custom-css section .content a:not(.btn){position:relative;text-decoration-thickness:1px;text-underline-offset:4px;transition:color .25s ease,text-decoration-color .25s ease}
.custom-css section .content a:not(.btn):hover{color:#6f3e78;text-decoration-color:#eab736}
.custom-css .btn{position:relative;isolation:isolate;overflow:hidden}
.custom-css .btn:after{content:"";position:absolute;z-index:-1;inset:-2px;transform:translateX(-115%) skewX(-18deg);background:rgba(255,255,255,.22);transition:transform .55s ease}
.custom-css .btn:hover:after{transform:translateX(115%) skewX(-18deg)}
.custom-css section h2:after{content:"";display:block;width:0;height:3px;margin-top:.65rem;background:#eab736;transition:width .8s cubic-bezier(.2,.7,.2,1)}
.custom-css section h2.is-visible:after,.custom-css .is-visible h2:after{width:min(72px,35%)}
.custom-css #team .flex.flex-col img{transition:transform .5s cubic-bezier(.2,.8,.2,1),filter .4s ease}.custom-css #team .flex.flex-col:hover img{transform:scale(1.045) translateY(-5px);filter:saturate(1.08)}.custom-css #team .flex.flex-col p{transition:color .3s ease,transform .3s ease}.custom-css #team .flex.flex-col:hover p{transform:translateY(-2px)}.custom-css section li{transition:transform .25s ease,color .25s ease}.custom-css section li:hover{transform:translateX(4px)}
@media (max-width:767px){.moonstone-insight-grid,.moonstone-standard-grid,.moonstone-profile-layout{grid-template-columns:1fr}.moonstone-insight-card time{float:none;display:block;margin-top:.25rem}.moonstone-article-meta{flex-direction:column}.moonstone-profile-layout{padding:0 1rem;gap:2rem}.moonstone-profile-image{position:relative;top:auto;min-height:380px}.moonstone-profile-image img{min-height:380px}.moonstone-profile article ul{columns:1}}
</style>
</head>`
    );
  }
  if (!html.includes('id="moonstone-final-header-fix"')) {
    html = html.replace(
      '</head>',
      `<style id="moonstone-final-header-fix">
.custom-css header.menu img[src="/images/logo.png"]{max-width:118px!important;max-height:34px!important;width:auto!important;height:auto!important;object-fit:contain!important}
@media (max-width:767px){.custom-css header.menu img[src="/images/logo.png"]{max-width:92px!important;max-height:28px!important;width:auto!important;height:auto!important}}
</style>
</head>`
    );
  }
  html = html.replace(/<meta name="description" content="[^"]*" \/>/g, `<meta name="description" content="${moonstoneDescription}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/g, `<meta property="og:title" content="${moonstoneSeoTitle}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/g, `<meta property="og:description" content="${moonstoneDescription}" />`);
  html = html.replace(/<meta property="og:site_name" content="[^"]*" \/>/g, '<meta property="og:site_name" content="Moonstone Advocates" />');
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/g, '<meta property="og:url" content="/" />');
  html = html.replace(/<meta name="twitter:site" content="[^"]*" \/>/g, '');
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/g, '<link rel="canonical" href="/" />');
  html = html.replace(/"image":\s*"\/wp-content\/themes\/briffa\/assets\/images\/briffa-logo\.svg"/g, '"image": "/images/logo.png"');
  html = html.replace(/<link rel="icon" href="[^"]*cropped-[^"]*-32x32\.png" sizes="32x32" \/>/g, '<link rel="icon" href="/images/favicon-32x32.png" sizes="32x32" />');
  html = html.replace(/<link rel="icon" href="[^"]*cropped-[^"]*-192x192\.png" sizes="192x192" \/>/g, '<link rel="icon" href="/images/favicon-192x192.png" sizes="192x192" />');
  html = html.replace(/<link rel="apple-touch-icon" href="[^"]*cropped-[^"]*-180x180\.png" \/>/g, '<link rel="apple-touch-icon" href="/images/favicon-180x180.png" />');
  html = html.replace(/<meta name="msapplication-TileImage" content="[^"]*cropped-[^"]*-270x270\.png" \/>/g, '<meta name="msapplication-TileImage" content="/images/favicon-270x270.png" />');
  html = html.replace(/alt="logo"/g, 'alt="Moonstone Advocates"');
  html = html.replace(
    /<img src="\/wp-content\/themes\/briffa\/assets\/images\/briffa-logo\.svg" alt="Moonstone Advocates" \/>/g,
    '<img src="/images/logo.png" alt="Moonstone Advocates" />'
  );
  html = html.replace(/<img src="\/wp-content\/themes\/briffa\/assets\/images\/b-logo\.svg">/g, '<img src="/images/logo.png" alt="Moonstone Advocates">');
  html = html.replace(
    /<img loading="lazy" width="1400" height="950" src="\/wp-content\/uploads\/2023\/07\/Briffa-Vector-1-1\.svg"/g,
    '<img loading="eager" width="1400" height="950" src="/wp-content/uploads/2023/07/moonstone-advocates-hero.svg"'
  );
  html = html.replace(/href="\/?blog\/[^"]*"/g, 'href="/content-hub/"');
  html = html.replace(/href="\/?team\/(?:joshua-schuermann|samuel-otoole)\/?"/g, 'href="/#team"');
  html = html.replace(/href="author\/[^"]*"/g, 'href="about/index.html"');
  html = html.replace(/href="category\/[^"]*"/g, 'href="content-hub/index.html"');
  html = html.replace(/href="briffa-case-study\/[^"]*"/g, 'href="content-hub/index.html"');
  html = html.replace(/href="\/?key-practice-area\/index\.html"/g, 'href="/services/"');
  html = html.replace(/href="\/?key-industry-sector\/index\.html"/g, 'href="/sectors/"');
  html = html.replace(/href="contact\/london-office\/index.html"/g, 'href="contact/index.html"');
  html = html.replace(/href="contact\/ireland-office\/index.html"/g, 'href="contact/index.html"');
  html = html.replace(/>Blog\s+</g, '>Legal Insights <');
  html = html.replace(/>Content Hub\s+</g, '>Legal Insights <');
  html = html.replace(/>Case Studies\s*</g, '>Uganda Law News<');
  html = html.replace(/title="Case Studies"/g, 'title="Uganda Law News"');
  html = html.replace(/>Reviews\s*</g, '>Client Care<');
  html = html.replace(/title="Reviews"/g, 'title="Client Care"');
  html = html.replace(/Read our case studies/gi, 'Read our legal insights');
  html = html.replace(/href="\/?case-studies\/"/g, 'href="/content-hub/"');
  html = html.replace(/href="\/?industry-insights-legal-videos-library\/"/g, 'href="/content-hub/"');
  html = html.replace(/href="\/?portfolio\/[^"]*"/g, 'href="/content-hub/"');
  html = html.replace(/Key industry sectors/g, 'Additional practice areas');
  html = html.replace(/Moonstone Advocates content hub/g, 'Legal resources');
  if (!html.includes('<div class="moonstone-practice-grid">')) {
    html = html.replace(
      /(<div class="container flex flex-wrap justify-center">\s*<a class="btn btn-primary_alt lg:mr-4 m-4" href="key-practice-area\/index\.html")/,
      `<div class="moonstone-practice-grid">\n${overviewCards(serviceAreas)}\n</div>\n$1`
    );
  }
  html = html.replace(
    /(<a[^>]+href="(?:\/services\/|key-practice-area\/index\.html)"[^>]*>\s*Services\s*<\/a>[\s\S]*?<ul[^>]*>)[\s\S]*?(<\/ul>\s*<\/li>\s*<li\s+class="py-2 lg:py-4 relative px-1 text-base-light lg:text-navy group[^>]*>\s*<a[^>]+href="(?:\/sectors\/|key-industry-sector\/index\.html)")/,
    `$1\n${servicesMenu(serviceAreas)}\n          $2`
  );
  html = html.replace(
    /(<a[^>]+title="Services"[^>]*>\s*Services\s*<\/a>[\s\S]*?<ul[^>]*>)[\s\S]*?(<\/ul>\s*<\/li>\s*<li[\s\S]*?<a[^>]+title="Sectors")/,
    `$1\n${servicesMenu(serviceAreas)}\n          $2`
  );
  html = html.replace(/(<a[^>]+href="(?:\/services\/|key-practice-area\/index\.html)"[^>]*>\s*Services\s*<\/a>[\s\S]*?<ul)([^>]*>)/, '$1 class="moonstone-services-menu"$2');
  html = html.replace(/<ul class="moonstone-services-menu"\s+class="([^"]*)">/, '<ul class="$1 moonstone-services-menu">');
  html = html.replace(/moonstone-services-menu(?:\s+moonstone-services-menu)+/g, 'moonstone-services-menu');
  html = html.replace(
    /(<a[^>]+href="(?:\/sectors\/|key-industry-sector\/index\.html)"[^>]*>\s*Sectors\s*<\/a>[\s\S]*?<ul[^>]*>)[\s\S]*?(<\/ul>\s*<\/li>\s*<li\s+class="py-2 lg:py-4 relative px-1 text-base-light lg:text-navy group[^>]*>\s*<a[^>]+href="(?:about|meet-team)[^"]*")/,
    `$1\n${navListItems(sectorAreas)}\n          $2`
  );
  html = html.replace(
    /(<a[^>]+title="Sectors"[^>]*>\s*Sectors\s*<\/a>[\s\S]*?<ul[^>]*>)[\s\S]*?(<\/ul>\s*<\/li>\s*<li[\s\S]*?<a[^>]+href="\/?(?:about|meet-team)[^"]*")/,
    `$1\n${navListItems(sectorAreas)}\n          $2`
  );
  html = html.replace(/Corporate law vs dispute resolution, what&#8217;s the difference/g, 'Corporate & Commercial Advisory for Ugandan Businesses');
  html = html.replace(/Wondering about corporate law versus dispute resolution protection and which is right for your business assets\? Both are essential commercial and private legal tools, but they protect different things and work in different…/g, 'Practical support for company formation, governance, contracts, transactions, due diligence and everyday commercial legal needs.');
  html = html.replace(/Dispute Resolution and AI/g, 'Dispute Resolution and Litigation Support');
  html = html.replace(/In an attempt to better handle the emergence of artificial intelligence and the impact this is having on dispute resolution and content creators, in December 2024, the government published proposals to…/g, 'Support for commercial disputes, civil claims, debt recovery, property disputes, arbitration and enforcement of judgments and court orders.');
  html = html.replace(/>Corporate Law<\/span>/g, '>Corporate & Commercial Advisory</span>');
  html = html.replace(/>Dispute Resolution<\/span>/g, '>Dispute Resolution</span>');
  html = html.replace(
    /<p><strong>We love what we do, but why choose us\?<\/strong><\/p>\s*<p>Well, we(?:&#8217;|’|')re consistently listed[\s\S]*?<p>We also have nice coffee\.<\/p>/g,
    '<p><strong>Illuminating the Path to Justice</strong></p>\n<p>Moonstone Advocates is founded on a simple principle: clients deserve more than legal opinions — they deserve committed legal partners.</p>\n<p>We combine legal expertise with commercial awareness, ensuring our advice is practical, responsive and designed to achieve results.</p>'
  );
  html = html.replace(
    /<h2>Creative Lawyers for Creative Businesses<\/h2>\s*<p><strong>Moonstone Advocates is a Kampala-based full service law firm\.[\s\S]*?<p>And since the beginning, that(?:&#8217;|’|')s exactly what we(?:&#8217;|’|')ve done\.[\s\S]*?<\/p>/g,
    `<h2>Illuminating the Path to Justice</h2>\n<p><strong>${firmAbout[0]}</strong></p>\n<p>${firmAbout[1]}</p>\n<p><strong>Vision:</strong> To become a distinguished legal lighthouse in Africa — recognised for integrity, excellence and the ability to transform complex legal challenges into clear opportunities.</p>\n<p><strong>Mission:</strong> To provide exceptional legal and advisory services through committed advocates, innovative thinking and hands-on partnership, delivering solutions that protect our clients, advance their interests and create lasting value.</p>`
  );
  html = html.replace(/<h2 style="text-align: center;">Learn More About law<\/h2>/g, '<h2 style="text-align: center;">Learn More About Moonstone Advocates</h2>');
  html = html.replace(
    /<h2 style="text-align: center;">Key Contacts<\/h2>\s*<p style="text-align: center;">Our lovely team[\s\S]*?<\/p>\s*<\/div>\s*<div class="flex flex-wrap align-top justify-center mx-auto">[\s\S]*?<\/div>\s*<div class="container flex flex-wrap justify-center">/g,
    `<h2 style="text-align: center;">Key Contacts</h2>\n<p style="text-align: center;">Our senior partners provide direct, hands-on guidance for clients seeking practical legal and advisory support.</p>\n        </div>\n        \n        <div class="flex flex-wrap align-top justify-center mx-auto">\n                                    ${teamGrid(keyContacts)}\n                    </div>\n        <div class="container flex flex-wrap justify-center">`
  );
  html = html.replace(
    /<h2 style="text-align: center;">Meet The <strong>Team<\/strong><\/h2>\s*<p style="text-align: center;">We have specialised[\s\S]*?<\/p>\s*<\/div>\s*<div class="flex flex-wrap align-top justify-center mx-auto">[\s\S]*?<\/div>\s*<div class="container flex flex-wrap justify-center">/g,
    `<h2 style="text-align: center;">Meet The <strong>Team</strong></h2>\n<p style="text-align: center;">Moonstone Advocates brings together advocates and consultants with experience across commercial advisory, disputes, tax, employment, property, energy, infrastructure and family law.</p>\n        </div>\n        \n        <div class="flex flex-wrap align-top justify-center mx-auto">\n                                    ${teamGrid(teamMembers)}\n                    </div>\n        <div class="container flex flex-wrap justify-center">`
  );
  html = html.replace(
    /<h1>About Us<\/h1>\s*<p><strong>We(?:â€™|’|&#8217;)re a creative[\s\S]*?<\/p>\s*<p>Our skilled team[\s\S]*?<\/p>/g,
    `<h1>About Us</h1>\n<p><strong>${firmAbout[0]}</strong></p>\n<p>${firmAbout[1]}</p>`
  );
  html = html.replace(
    /<h2>Who Are We\?<\/h2>\s*<p><strong>Established in 1995[\s\S]*?<\/p>\s*<p>Whether you(?:&#8217;|’|')re involved[\s\S]*?<\/p>\s*<p>Plus, with offices[\s\S]*?<\/p>\s*<p>Why not arrange[\s\S]*?<\/p>/g,
    `<h2>Who Are We?</h2>\n<p><strong>${firmAbout[0]}</strong></p>\n<p>${firmAbout[1]}</p>\n<p><strong>Vision:</strong> To become a distinguished legal lighthouse in Africa — recognised for integrity, excellence and the ability to transform complex legal challenges into clear opportunities.</p>\n<p><strong>Mission:</strong> To provide exceptional legal and advisory services through committed advocates, innovative thinking and hands-on partnership, delivering solutions that protect our clients, advance their interests and create lasting value.</p>`
  );
  html = html.replace(
    /(<h2 style="text-align: center;">Meet The <strong>Team<\/strong><\/h2>\s*)<p style="text-align: center;">We have specialised[\s\S]*?<\/p>(\s*<\/div>\s*<div class="flex flex-wrap align-top justify-center mx-auto">)[\s\S]*?(\s*<\/div>\s*<div class="container flex flex-wrap justify-center">)/g,
    `$1<p style="text-align: center;">Moonstone Advocates brings together advocates and consultants with experience across commercial advisory, disputes, tax, employment, property, energy, infrastructure and family law.</p>$2\n                                    ${teamGrid(teamMembers)}$3`
  );
  html = html.replace(/<section id="team" class="py-16 relative overflow-hidden bg-base-light">[\s\S]*?<\/section>/g, fullTeamSection);
  const normalizedFile = file.replace(/\\/g, '/');
  if (/\/contact\/(?:index\.html|london-office\/index\.html|ireland-office\/index\.html)$/.test(normalizedFile)) {
    html = html.replace(/<\/header>[\s\S]*?(?=<footer\b)/, `</header>${contactPageMain}`);
  }
  html = html.replace(
    /<h2 style="text-align: center;">Expertise<\/h2>\s*<\/div>/g,
    `<h2 style="text-align: center;">Expertise</h2>\n<p style="text-align: center;">${firmExpertise.join(' • ')}</p>\n        </div>`
  );
  html = html.replace(
    /<h2 style="text-align: center;">Values<\/h2>\s*<\/div>/g,
    `<h2 style="text-align: center;">Values</h2>\n<p style="text-align: center;">${firmValues.join(' • ')}</p>\n        </div>`
  );
  for (const member of teamMembers) {
    const memberPath = member.sourcePath.replace(/^\//, '');
    if (file.replace(/\\/g, '/').endsWith(memberPath)) {
      html = html.replace(/<p class="px-4 py-2 m-0 absolute bottom-0 left-0 inline-block font-bold bg-base-light font-heading">\s*[\s\S]*?\s*<\/p>/, `<p class="px-4 py-2 m-0 absolute bottom-0 left-0 inline-block font-bold bg-base-light font-heading">\n                    ${member.role}                </p>`);
      html = html.replace(/<h1 class="mt-12 mb-4">[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>(?:\s*<p>[\s\S]*?<\/p>)*/m, `<h1 class="mt-12 mb-4">${member.name}</h1>\n                ${profileBody(member)}`);
      html = html.replace(/<h1 class="mt-12 mb-4">[\s\S]*?<\/h1>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<aside class="h-full transform/g, `<h1 class="mt-12 mb-4">${member.name}</h1>\n                ${profileBody(member)}\n\n            </div>\n        </div>\n    </div>\n\n    <aside class="h-full transform`);
      html = html.replace(/<p style="text-align: center;"><strong>Contact us now<\/strong><\/p>/g, `<p style="text-align: center;"><strong>Contact ${member.name}</strong></p>`);
      html = html.replace(/<p><strong>[\s\S]*?<\/strong><\/p>\s*<p>law lawyers[\s\S]*?<p>[\s\S]*?<\/p>\s*<p>– [\s\S]*?<\/p>/g, `<p><strong>${member.quote}</strong></p>\n<p>Moonstone Advocates provides practical, partner-led legal support from Kampala, Uganda.</p>\n<p>For assistance, contact info@moonstoneadvocates.com or +256 (0) 778 616565.</p>\n<p>– ${member.name}</p>`);
    }
  }
  for (const member of teamMembers) {
    const oldProfileUrl = member.sourcePath.replace(/index\.html$/, '');
    const cleanProfileUrl = member.path.replace(/index\.html$/, '');
    html = html.replaceAll(oldProfileUrl, cleanProfileUrl);
    html = html.replaceAll(oldProfileUrl.replace(/^\//, ''), cleanProfileUrl);
  }
  html = html.replace(/href="\/?meet-team\/[^"]*"/g, 'href="/#team"');
  html = html.replace(/Office required/g, 'Office');
  html = html.replace(/commercial and private legal law/g, 'commercial and private legal services');
  html = html.replace(/commercial and private legal lawyer/g, 'Moonstone Advocates lawyer');
  html = html.replace(/commercial and private legal servicesyer/g, 'Moonstone Advocates lawyer');
  html = html.replace(/commercial and private legal solicitors/g, 'legal professionals');
  html = html.replace(/commercial and private legal content/g, 'legal resources');
  html = html.replace(/commercial and private legal assets/g, 'legal interests');
  html = html.replace(/law law/g, 'law');
  html = html.replace(/Business Design Centre, Upper Street, Kampala/g, 'Plot 134 Semwata Road, Ntinda, Kampala');
  html = html.replace(/Business Design Centre/g, 'Plot 134 Semwata Road, Ntinda');
  html = html.replace(/The Academy/g, 'Plot 134 Semwata Road, Ntinda');
  html = html.replace(/52 Upper Street, Islington<br \/>\s*Kampala<br \/>\s*Uganda<br \/>/g, 'P.O. Box 189860<br />Kampala<br />Uganda<br />');
  html = html.replace(/52 Upper Street<br \/>\s*Islington<br \/>/g, 'P.O. Box 189860<br />Kampala<br />');
  html = html.replace(/Dublin, D02 HV59<br \/>\s*Uganda/g, 'Kampala, Uganda');
  html = html.replace(/Dublin<br \/>\s*D02 HV59<br \/>\s*Uganda/g, 'Kampala<br />Uganda');
  html = html.replace(/<p>52 Upper Street<\/p>\s*<p>Islington, Kampala<\/p>/g, '<p>Plot 134 Semwata Road, Ntinda</p><p>Kampala, Uganda</p>');
  html = html.replace(/Our office is based in Islington, Kampala\.[\s\S]*?<\/p>/g, '<p>Our office is based at Plot 134 Semwata Road, Ntinda, Kampala. Meetings are available by appointment so our team can prepare for your enquiry.</p>');
  html = html.replace(/The closest Underground station[\s\S]*?<\/p>/g, '<p>For directions or to arrange a meeting, contact info@moonstoneadvocates.com or call +256 (0) 778 616565.</p>');
  html = html.replace(/There are several bus stops[\s\S]*?<\/p>/g, '<p>Clients are encouraged to book appointments in advance for efficient service.</p>');
  html = html.replace(/A paid car park is attached[\s\S]*?<\/p>/g, '<p>Our team can confirm meeting arrangements when your appointment is scheduled.</p>');
  html = html.replace(/Our lawyers provide full support[\s\S]*?commercial and private legal rights worldwide\.<\/p>/g, '<p>Our lawyers provide practical legal support for businesses, institutions and individuals across Uganda, with advice tailored to each client matter.</p>');
  html = html.replace(/Our Irish office is based[\s\S]*?Meetings are available by appointment\.<\/p>/g, '<p>Moonstone Advocates is based at Plot 134 Semwata Road, Ntinda, Kampala. Meetings are available by appointment.</p>');
  html = html.replace(/Located in the iconic Academy[\s\S]*?<\/p>/g, '<p>Our Kampala office supports clients with corporate, regulatory, dispute resolution, property, employment, family, finance, energy and criminal law matters.</p>');
  html = html.replace(/law Lawyers Uganda/g, 'Moonstone Advocates Uganda');
  html = html.replace(/<p>Moonstone Advocates LLP<br \/>\s*Plot 134 Semwata Road, Ntinda<br \/>\s*42 Pearse Street<br \/>\s*Dublin<br \/>\s*D02 HV59<\/p>/g, '<p>Moonstone Advocates<br />Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala, Uganda</p>');
  html = html.replace(/William Miles/g, 'Edward Labeja');
  html = html.replace(/Éamon Chawke/g, 'Norah Amanya');
  html = html.replace(/Eamon Chawke/g, 'Norah Amanya');
  html = html.replace(/Daniel Crate/g, 'Sande Happy');
  html = html.replace(/Cassine Bering/g, 'Akello Shirley Marylin');
  html = html.replace(/Book a consultation\./g, 'Book a consultation in Kampala.');
  html = html.replace(/P\.O\. Box 189860,\s*Kampala,\s*Uganda,\s*Uganda/g, 'P.O. Box 189860, Kampala, Uganda');
  html = html.replace(/href="mailto:info@"/g, 'href="mailto:info@moonstoneadvocates.com"');
  html = html.replace(/href="mailto:info@\?([^"]*)"/g, 'href="mailto:info@moonstoneadvocates.com?$1"');
  html = html.replace(/>info@</g, '>info@moonstoneadvocates.com<');
  html = html.replace(/<a href="tel:"><\/a>(?:\s*\([^)]+\))?/g, '<a href="/contact/index.html">Contact Moonstone Advocates</a>');
  html = html.replace(/<a href="tel:"\s*><\/a>/g, '<a href="/contact/index.html">Contact Moonstone Advocates</a>');
  html = html.replace(/<p><a href="\/contact\/index\.html">Contact Moonstone Advocates<\/a><br \/>/g, '<p><a href="/contact/index.html">Contact Moonstone Advocates</a><br />');
  html = html.replace(/<p>&nbsp;<\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<a href="([^"]+)"><span style="font-weight: 400;"><\/span><\/a>/g, '<a href="$1"><span style="font-weight: 400;">Moonstone Advocates privacy policy</span></a>');
  html = html.replace(/Business Design Centre<br \/>\s*52 Upper Street, Islington<br \/>\s*Kampala<br \/>\s*Uganda<br \/>\s*<\/p>/g, 'Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala, Uganda</p>');
  html = html.replace(/Business Design Centre<br \/>\s*52 Upper Street<br \/>\s*Islington<br \/>\s*Kampala\s*/g, 'Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala<br />Uganda');
  html = html.replace(/The Academy<br \/>\s*42 Pearse Street<br \/>\s*Dublin<br \/>\s*D02 HV59<br \/>\s*Uganda<\/p>/g, 'Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala, Uganda</p>');
  html = html.replace(/The Academy<br \/>\s*42 Pearse Street<br \/>\s*Dublin, D02 HV59<br \/>\s*Uganda/g, 'Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala, Uganda');
  html = html.replace(/<p><strong>Irish Office<\/strong><\/p>/g, '<p><strong>Senior Partner Contacts</strong></p>');
  html = html.replace(/<p><a href="\/contact\/index\.html">Contact Moonstone Advocates<\/a><br \/>\s*<a href="mailto:info@moonstoneadvocates\.com\?subject=Enquiry Uganda">info@moonstoneadvocates\.com<\/a><\/p>/g, '<p><a href="/contact/index.html">Contact Moonstone Advocates</a><br /><a href="mailto:info@moonstoneadvocates.com">info@moonstoneadvocates.com</a><br /><a href="tel:+256778616565">+256 (0) 778 616565</a><br />www.moonstoneadvocates.com</p>');
  html = html.replace(/<p><a href="https:\/\/www\.lawsociety\.ie\/whyuseasolicitor">[\s\S]*?<\/a><\/p>/g, '<p>Edward Labeja, Managing Partner<br /><a href="tel:+256778616565">+256 778 616 565</a><br /><a href="mailto:leo@moonstoneadvocates.com">leo@moonstoneadvocates.com</a></p><p>Norah Amanya, Partner<br /><a href="tel:+256772986509">+256 772 986 509</a><br /><a href="mailto:naa@moonstoneadvocates.com">naa@moonstoneadvocates.com</a></p>');
  html = html.replace(
    /<div class="mt-4 md:ml-4 md:mt-0">\s*Moonstone Advocates is a trading name of Moonstone Advocates \(BLL\)[\s\S]*?<\/div>/g,
    '<div class="mt-4 md:ml-4 md:mt-0">Moonstone Advocates is a modern full-service law firm based in Kampala, Uganda. We provide reliable, strategic and practical legal solutions to individuals, businesses and institutions. For enquiries, contact info@moonstoneadvocates.com or +256 (0) 778 616565.</div>'
  );
  html = html.replace(
    /<p>Moonstone Advocates is a trading name of Moonstone Advocates \(BLL\)[\s\S]*?<\/p>/g,
    '<p>Moonstone Advocates is a modern full-service law firm based in Kampala, Uganda. For enquiries, contact info@moonstoneadvocates.com or +256 (0) 778 616565.</p>'
  );
  html = html.replace(/<p><a href="ireland-office\/index\.html"><em>More information about our Irish office<\/em><\/a><\/p>/g, '<p><a href="/contact/index.html"><em>Contact the Moonstone Advocates team</em></a></p>');
  html = html.replace(/<noscript class="ninja-forms-noscript-message">[\s\S]*?<\/noscript>\s*<div id="nf-form-[^"]+" class="nf-form-cont"[\s\S]*?<\/div>\s*<\/div>/g, moonstoneEnquiryForm);
  html = html.replace(/<noscript class="ninja-forms-noscript-message">[\s\S]*?<\/noscript>\s*<div id="nf-form-[^"]+" class="nf-form-cont"[\s\S]*?<\/div>/g, moonstoneEnquiryForm);
  html = html.replace(/<div id="nf-form-[^"]+" class="nf-form-cont"[\s\S]*?<\/div>/g, moonstoneEnquiryForm);
  html = html.replace(/<a href="tel:441212453050" rel="noopener noreferrer"><\/a>/g, '<a href="tel:441212453050" rel="noopener noreferrer">+44 121 245 3050</a>');
  html = html.replace(/<a class="underline" href="\/key-industry-sector\/music\/index\.html"><\/a>/g, '<a class="underline" href="/about/index.html">Moonstone Advocates</a>');
  html = html.replace(/"adminAjax":"[^"]*"/g, '"adminAjax":""');
  html = html.replace(/"requireBaseUrl":"[^"]*"/g, '"requireBaseUrl":""');
  html = html.replace(/"value":"https:\\\/\\\/www\.[^"]*"/g, '"value":""');
  html = html.replace(/<span class="review-more-placeholder">… More<\/span><span class="review-full-text">\s*<\/span>/g, '');
  html = html.replace(/<span class="review-more-placeholder">\.\.\. More<\/span><span class="review-full-text">\s*<\/span>/g, '');
  html = html.replace(/<span class="review-full-text">\s*<\/span>/g, '');
  html = html.replace(/<aside class="flex justify-center[^>]*>[\s\S]*?<\/aside>/gi, '');
  html = html.replace(/<section\b(?:(?!<section\b)[\s\S])*?(?:Legal\s*500|legal500\.com|google-business-reviews-rating)(?:(?!<section\b)[\s\S])*?<\/section>/gi, '');
  html = html.replace(/<section\b(?:(?!<section\b)[\s\S])*?href="\/?portfolio\/(?:(?!<section\b)[\s\S])*?<\/section>/gi, '');
  html = html.replace(/<a\b[^>]*href="[^"]*legal500\.com[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<p><strong>Legal\s*500<\/strong><\/p>/gi, '');
  html = html.replace(/<p[^>]*>[\s\S]*?Praised as [\s\S]*?<\/p>/gi, '');
  html = html.replace(/<div id="google-business-reviews-rating-[^"]*"[\s\S]*?<\/ul>\s*<\/div>/gi, '');
  html = html.replace(/<!-- Consultation form popup -->[\s\S]*?<!-- That data is being printed as a workaround to page builders reordering the order of the scripts loaded-->[\s\S]*?<\/aside>/gi, '');
  html = html.replace(/<script\b[^>]*type=["']text\/template["'][^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(
    /<section class="pt-20 pb-10 md:pt-24 md:pb-16 relative overflow-x-hidden\s+bg-base-light ">\s*<div class="relative z-\[1\] px-4 \| md:container">\s*<div class="mb-12 mx-auto max-w-3xl content "\s*data-aos="fade-up">\s*<\/div>\s*<div class="mt-4 flex justify-center flex-wrap">\s*<\/div>\s*<\/div>\s*<\/section>/g,
    '<section class="pt-20 pb-10 md:pt-24 md:pb-16 relative overflow-x-hidden  bg-base-light "><div class="relative z-[1] px-4 | md:container"><div class="mb-12 mx-auto max-w-3xl content " data-aos="fade-up"><h2 style="text-align: center;">Legal Updates and Client Briefings</h2><p style="text-align: center;">Moonstone Advocates shares practical updates and briefings on legal developments affecting businesses, institutions and individuals in Uganda.</p></div><div class="mt-4 flex justify-center flex-wrap"><a class="btn btn-primary_alt lg:mr-4 m-4" href="/contact/index.html">Request a briefing</a></div></div></section>'
  );
  html = html.replace(
    /<section\s+class="pt-24 pb-10 md:pt-32 md:pb-16 relative overflow-x-hidden">\s*<div class="relative z-\[1\] px-4 \| md:container">\s*<div class="mb-12 mx-auto max-w-3xl content" data-aos="fade-up">\s*<\/div>\s*<\/div>\s*<\/section>/g,
    '<section class="pt-24 pb-10 md:pt-32 md:pb-16 relative overflow-x-hidden"><div class="relative z-[1] px-4 | md:container"><div class="mb-12 mx-auto max-w-3xl content" data-aos="fade-up"><h2 style="text-align: center;">Arrange a Session With Our Team</h2><p style="text-align: center;">For tailored training, board briefings or legal awareness sessions, contact Moonstone Advocates and we will help shape the right format for your organisation.</p></div></div></section>'
  );
  html = html.replace(/<section([^>]*)>\s*<\/section>/g, '<section$1><div class="container py-12 content"><p>Moonstone Advocates provides clear, practical legal support for clients across Uganda.</p></div></section>');
  html = html.replace(/<section([^>]*)>\s*<div class="container"><\/div>\s*<\/section>/g, '<section$1><div class="container py-12 content"><p>Our team is available to advise on corporate, regulatory, dispute resolution, property, employment, family, finance, energy and criminal law matters.</p></div></section>');
  html = html.replace(/<p>\s*<iframe[\s\S]*?Briffa[\s\S]*?<\/iframe>\s*<\/p>/g, '<p>Visit Moonstone Advocates at Plot 134 Semwata Road, Ntinda, Kampala. Meetings are available by appointment.</p>');
  html = html.replace(/<footer\b[\s\S]*?<\/footer>/i, moonstoneFooter);
  html = html.replace(/(<header class="[^"]*\bmenu\b[^"]*">[\s\S]*?<aside[^>]*>\s*<a) href="[^"]*"/, '$1 href="/"');
  html = html.replace(/(<a class="btn btn-secondary [^"]*" href=")[^"]*("[\s\S]*?>\s*Contact us<\/a>)/i, '$1/contact/$2');
  html = html.replace(/<button\s+onclick="document\.getElementById\('menu'\)\.classList\.toggle\('hidden'\); document\.body\.classList\.toggle\('noscroll'\)"\s+type="button" class="lg:hidden ml-4 align-middle">[\s\S]*?<\/button>/g, '<button type="button" class="moonstone-menu-toggle lg:hidden ml-4 align-middle" aria-controls="menu" aria-expanded="false" aria-label="Open menu"><span></span></button>');
  html = html.replace(/wp-admin/g, '');
  html = html.replace(/\b(href|src)="([^"]+)"/g, (match, attr, value) => `${attr}="${normalizeInternalUrl(value, file)}"`);
  html = html.replace(/\b(src|href)="([^"]*\/wp-content\/uploads\/[^"]*)"/g, (match, attr, value) => {
    const asset = value
      .replace(/Dispute Resolution/g, 'Copyright')
      .replace(/dispute resolution/g, 'copyright')
      .replace(/The-Uganda-Trade-Mark/g, 'The-UK-Trade-Mark')
      .replace(/AGA-Uganda-Innovations/g, 'AGA-UK-Innovations')
      .replace(/Oatlyv-Dairy-Uganda/g, 'Oatlyv-Dairy-UK')
      .replace(/\/wp-content\/uploads\/2019\/10\/Music-–-What-Is-A-Distribution-Deal-And-Do-I-Need-One\.svg/g, '/wp-content/uploads/2023/07/moonstone-advocates-hero.svg');
    return `${attr}="${asset}"`;
  });
  html = html.replace(/\b(href|action)="([^"]*?)index\.html(#[^"]*)?"/g, (match, attr, prefix, hash = '') => {
    const clean = prefix.endsWith('/') ? prefix : `${prefix}/`;
    return `${attr}="${clean}${hash}"`;
  });
  html = html.replace(/href="\/industry-insights-legal-videos-library\/index\.html@vp_filter=[^"#]*(#[^"]*)?"/g, 'href="/industry-insights-legal-videos-library/"');
  html = html.replace(/<a class="underline" href="\/key-industry-sector\/music\/"><\/a>/g, '<a class="underline" href="/key-industry-sector/music/">music sector legal support</a>');
  html = html.replace(/href="\/key-practice-area\/[^"]*"/g, 'href="/services/"');
  html = html.replace(/href="\/key-industry-sector\/[^"]*"/g, 'href="/sectors/"');
  html = html.replace(/href="\/contact\/(?:london-office|ireland-office)\/[^"]*"/g, 'href="/contact/"');

  if (!html.includes('/moonstone-local.js')) {
    html = html.replace(
      '</body>',
      `<script src="/moonstone-local.js"></script>\n</body>`
    );
  }
  if (!html.includes('class="moonstone-page-loader"')) {
    html = html.replace(/<body([^>]*)>/, `<body$1><div class="moonstone-page-loader" aria-hidden="true"><div class="moonstone-loader-inner"><img src="/images/logo.png" alt="" /><div class="moonstone-loader-line"></div><span>Illuminating the path to justice</span></div></div>${moonstoneCookieUi}`);
  }

  html = html.replace(/[ \t]+$/gm, '');

  writeFileSync(file, html);
}

for (const file of allFiles) {
  const ext = path.extname(file).toLowerCase();
  if (!['.svg', '.css', '.js', '.json', '.xml', '.txt'].includes(ext)) continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  let next = text;
  for (const [pattern, value] of replacements) next = next.replace(pattern, value);
  next = next.replace(/wp-admin/g, '');
  next = next.replace(/admin-ajax/g, '');
  if (next !== text) writeFileSync(file, next);
}

const helper = `(() => {
  let firstSessionVisit = false;
  try {
    firstSessionVisit = !sessionStorage.getItem('moonstone_session_seen');
    sessionStorage.setItem('moonstone_session_seen', '1');
  } catch {}
  const loaderDelay = firstSessionVisit ? 2000 : 160;
  const hideLoader = () => {
    document.body.classList.add('moonstone-page-ready');
    document.querySelector('.moonstone-page-loader')?.classList.add('is-hidden');
  };
  window.setTimeout(hideLoader, loaderDelay);

  const cookieLayer = document.querySelector('.moonstone-cookie-layer');
  const cookieTab = document.querySelector('.moonstone-cookie-tab');
  const cookieOptions = document.querySelector('.moonstone-cookie-options');
  const cookieSave = document.querySelector('.moonstone-cookie-save');
  const cookieManage = document.querySelector('.moonstone-cookie-manage');
  const openCookies = () => {
    if (!cookieLayer) return;
    cookieLayer.hidden = false;
    cookieTab && (cookieTab.hidden = true);
    document.body.classList.add('moonstone-cookie-open');
  };
  const closeCookies = () => {
    if (!cookieLayer) return;
    cookieLayer.hidden = true;
    cookieTab && (cookieTab.hidden = false);
    document.body.classList.remove('moonstone-cookie-open');
  };
  const saveCookies = (settings) => {
    try { localStorage.setItem('moonstone_cookie_preferences', JSON.stringify(settings)); } catch {}
    closeCookies();
  };
  let storedCookies = null;
  try { storedCookies = JSON.parse(localStorage.getItem('moonstone_cookie_preferences')); } catch {}
  if (storedCookies) {
    cookieOptions?.querySelectorAll('input[name]').forEach((input) => { input.checked = Boolean(storedCookies[input.name]); });
    cookieTab && (cookieTab.hidden = false);
  } else {
    window.setTimeout(openCookies, loaderDelay + 280);
  }
  cookieTab?.addEventListener('click', openCookies);
  document.querySelector('.moonstone-cookie-close')?.addEventListener('click', closeCookies);
  document.querySelector('.moonstone-cookie-accept')?.addEventListener('click', () => saveCookies({ preferences: true, analytics: true, marketing: true }));
  document.querySelector('.moonstone-cookie-reject')?.addEventListener('click', () => saveCookies({ preferences: false, analytics: false, marketing: false }));
  cookieManage?.addEventListener('click', () => {
    if (cookieOptions) cookieOptions.hidden = false;
    cookieManage.hidden = true;
    if (cookieSave) cookieSave.hidden = false;
  });
  cookieSave?.addEventListener('click', () => {
    const settings = {};
    cookieOptions?.querySelectorAll('input[name]').forEach((input) => { settings[input.name] = input.checked; });
    saveCookies(settings);
  });

  const animatedSelectors = [
    ['section:not(.banner)', 'fade-up'],
    ['.banner h1, .banner p', 'fade-up'],
    ['.content h1, .content h2, .content h3, .content p', 'fade-up'],
    ['.content li', 'fade-up'],
    ['.moonstone-practice-card', 'zoom-in'],
    ['.grid > div, .grid > article', 'fade-up'],
    ['article, .content blockquote, form label', 'fade-up'],
    ['section img', 'zoom-in'],
    ['#team .flex.flex-col', 'fade-up'],
    ['.moonstone-footer-intro, .moonstone-footer-links > div, .moonstone-footer-bottom > *', 'fade-up']
  ];

  document.querySelectorAll('[data-aos]').forEach((element) => {
    element.removeAttribute('data-aos');
    element.removeAttribute('data-aos-delay');
    element.removeAttribute('data-aos-duration');
  });

  animatedSelectors.forEach(([selector, animation]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.matches('a, button') || element.closest('header')) return;
      element.classList.add('moonstone-reveal');
      if (animation === 'zoom-in') element.classList.add('moonstone-reveal-scale');
      if (animation === 'fade-left') element.classList.add('moonstone-reveal-left');
      if (animation === 'fade-right') element.classList.add('moonstone-reveal-right');
      if (animation === 'fade-up' && index % 5 === 1) element.classList.add('moonstone-reveal-left');
      if (animation === 'fade-up' && index % 5 === 3) element.classList.add('moonstone-reveal-right');
      element.style.setProperty('--moonstone-delay', Math.min((index % 7) * 55, 330) + 'ms');
    });
  });

  const reveals = document.querySelectorAll('.moonstone-reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px' });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('article, .moonstone-practice-card, #team .flex.flex-col, .gmbrr .listing > div').forEach((item) => {
    const link = item.querySelector('a[href]');
    if (!link) return;
    item.classList.add('moonstone-clickable');
    item.tabIndex = 0;
    item.setAttribute('role', 'link');
    const visit = (event) => {
      if (event.target.closest('a, button, input, textarea, select, summary')) return;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      if (event.type === 'keydown') event.preventDefault();
      link.click();
    };
    item.addEventListener('click', visit);
    item.addEventListener('keydown', visit);
  });

  const menu = document.getElementById('menu');
  const menuToggle = document.querySelector('.moonstone-menu-toggle');
  if (menu && menuToggle) {
    const closeMenu = () => {
      menu.classList.remove('moonstone-mobile-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('moonstone-menu-active', 'noscroll');
      window.setTimeout(() => {
        if (menuToggle.getAttribute('aria-expanded') === 'false') menu.classList.add('hidden');
      }, 300);
    };
    menuToggle.removeAttribute('onclick');
    menuToggle.addEventListener('click', () => {
      const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
      if (!opening) return closeMenu();
      menu.classList.remove('hidden');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('moonstone-menu-active');
      requestAnimationFrame(() => menu.classList.add('moonstone-mobile-open'));
    });
    menu.querySelectorAll(':scope > ul > li > span').forEach((toggle) => {
      const parent = toggle.parentElement;
      const submenu = parent?.querySelector(':scope > ul');
      if (!parent || !submenu) return;
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-expanded', 'false');
      const expand = (event) => {
        if (window.innerWidth >= 1024) return;
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        const open = !parent.classList.contains('moonstone-submenu-open');
        parent.classList.toggle('moonstone-submenu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      };
      toggle.addEventListener('click', expand);
      toggle.addEventListener('keydown', expand);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeMenu();
    }));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        menu.classList.remove('hidden', 'moonstone-mobile-open');
        document.body.classList.remove('moonstone-menu-active', 'noscroll');
        menuToggle.setAttribute('aria-expanded', 'false');
      } else if (menuToggle.getAttribute('aria-expanded') !== 'true') {
        menu.classList.add('hidden');
      }
    });
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('moonstone-contact-form')) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const subject = 'Website enquiry: ' + (values.get('matter') || 'Legal assistance');
    const body = ['Name: ' + values.get('name'), 'Email: ' + values.get('email'), 'Telephone: ' + (values.get('phone') || 'Not provided'), 'Organisation: ' + (values.get('organisation') || 'Not provided'), 'Preferred response: ' + values.get('contact_method'), '', 'Enquiry:', values.get('message')].join('\\n');
    window.location.href = 'mailto:info@moonstoneadvocates.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }, true);
})();`;

writeFileSync(path.join(target, 'moonstone-local.js'), helper);
writeFileSync(
  path.join(target, 'wp-content/themes/briffa/assets/images/briffa-logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="246.371" height="47.074" viewBox="0 0 246.371 47.074" role="img" aria-label="Moonstone Advocates">
  <text x="0" y="20" fill="#181a34" font-family="Mulish, Arial, sans-serif" font-size="20" font-weight="800">MOONSTONE</text>
  <text x="0" y="43" fill="#181a34" font-family="Mulish, Arial, sans-serif" font-size="18" font-weight="800">ADVOCATES</text>
  <circle cx="230" cy="12" r="5" fill="#f5bb20"/>
  <circle cx="242" cy="12" r="3.5" fill="#f5bb20"/>
  <circle cx="236" cy="25" r="3.5" fill="#f5bb20"/>
</svg>
`
);
writeFileSync(
  path.join(target, 'robots.txt'),
  'User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n'
);

const cleanUrl = (url) => url.replace(/index\.html(#.*)?$/, (match, hash = '') => hash || '');
const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const templateCacheDir = path.join(target, '.moonstone-templates');
mkdirSync(templateCacheDir, { recursive: true });
for (const [templateSource, templateName] of [
  [path.join(target, 'key-practice-area/ip-disputes/index.html'), 'service.html'],
  [path.join(target, 'key-industry-sector/technology/index.html'), 'sector.html']
]) {
  if (existsSync(templateSource)) copyFileSync(templateSource, path.join(templateCacheDir, templateName));
}
const pageTemplate = (templatePath, fallbackTemplatePath) => {
  const template = readFileSync(existsSync(templatePath) ? templatePath : fallbackTemplatePath, 'utf8');
  const bannerStart = template.indexOf('<section class="banner');
  const bannerEnd = template.indexOf('</section>', bannerStart) + '</section>'.length;
  const footerStart = template.indexOf('<footer');
  return {
    beforeBanner: template.slice(0, bannerStart),
    banner: template.slice(bannerStart, bannerEnd),
    footerAndAfter: template.slice(footerStart)
  };
};
const serviceTemplate = pageTemplate(
  path.join(templateCacheDir, 'service.html'),
  existsSync(path.join(target, 'services/corporate-and-commercial-advisory/index.html'))
    ? path.join(target, 'services/corporate-and-commercial-advisory/index.html')
    : path.join(root, 'www.briffa.com/key-practice-area/ip-disputes/index.html')
);
const sectorTemplate = pageTemplate(
  path.join(templateCacheDir, 'sector.html'),
  existsSync(path.join(target, 'sectors/corporate-and-commercial-clients/index.html'))
    ? path.join(target, 'sectors/corporate-and-commercial-clients/index.html')
    : path.join(root, 'www.briffa.com/key-industry-sector/technology/index.html')
);
const relatedLinks = (areas, currentTitle) =>
  areas
    .filter((area) => area.title !== currentTitle)
    .slice(0, 6)
    .map((area) => `<a class="btn btn-primary_alt lg:mr-4 m-4" href="${cleanUrl(`/${area.path}`)}">${escapeHtml(area.title)}</a>`)
    .join('\n');
const styledPage = ({ title, intro, items, type }) => {
  const template = type === 'sector' ? sectorTemplate : serviceTemplate;
  const relatedAreas = type === 'sector' ? sectorAreas : serviceAreas;
  const banner = template.banner
    .replace(/<h1[\s\S]*?<\/h1>/, `<h1 class="vc_custom_heading us_custom_6df4bc3a">${escapeHtml(title)}</h1>`)
    .replace(/<p class="vc_custom_heading us_custom_6df4bc3a">[\s\S]*?<\/p>/, `<p class="vc_custom_heading us_custom_6df4bc3a">${escapeHtml(intro)}</p>`);
  const isLandingPage = title === 'Services' || title === 'Sectors';
  const itemList = items.map((item) => {
    if (typeof item === 'string') return `<li>${escapeHtml(item)}</li>`;
    return `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
  }).join('\n');
  const middle = `
<section class="relative grid grid-cols-1 overflow-hidden md:grid-cols-2 bg-base-light">
  <div class="lg:flex lg:pr-32 py-28">
    <div class="content px-4 md:pl-12 lg:pl-24 xl:pl-24 4k:pl-64" data-aos="fade-up">
      <h2>${type === 'sector' ? 'Legal Support for This Sector' : `${escapeHtml(title)} Lawyers`}</h2>
      <p>${escapeHtml(intro)}</p>
      <p>Moonstone Advocates works with clients in Uganda through clear advice, carefully prepared documentation and practical representation. We focus on the legal details that affect the commercial, regulatory and personal outcome of each matter.</p>
    </div>
  </div>
  <div class="relative min-h-[300px] bg-navy">
    <img src="/images/image.png" alt="Moonstone Advocates" class="absolute inset-0 object-cover w-full h-full opacity-80" />
  </div>
</section>
<section class="pt-32 bg-base-light">
  <div class="relative z-[1] px-4 | md:container">
    <div class="mb-12 mx-auto max-w-3xl content" data-aos="fade-up">
      <h2 style="text-align: center;">How can we help?</h2>
      <p style="text-align: center;">Our team supports clients with the following matters:</p>
      <ul>${itemList}</ul>
    </div>
  </div>
</section>
<section id="team" class="py-16 relative overflow-hidden bg-base-light">
  <div class="relative z-[1] px-4 | md:container">
    <div class="mb-12 mx-auto max-w-3xl content" data-aos="fade-up">
      <h2>${type === 'sector' ? 'Key Contacts' : `Key Contacts for ${escapeHtml(title)}`}</h2>
      <p>Speak with Moonstone Advocates for partner-led guidance and responsive support. We will review the issue, explain the available options and help you move forward with confidence.</p>
    </div>
  </div>
</section>
<section class="py-8 md:py-16 relative z-[1] bg-purple">
  <div class="hidden md:block w-48 h-48 z-[1] rounded-full bg-yellow absolute -top-24 right-8"></div>
  <div class="relative container z-[1]">
    <div class="text-base-light text-center max-w-3xl mx-auto content" data-aos="fade-up">
      <h2 class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Contact Moonstone Advocates.</h2>
      <p class="text-lg font-bold">For advice on ${escapeHtml(title.toLowerCase())}, contact our Kampala team and we will guide you on the next steps.</p>
      <a class="btn btn-primary" href="/contact/">Make an enquiry</a>
    </div>
  </div>
</section>
${isLandingPage ? '' : `<section class="py-20 relative overflow-hidden bg-base-light">
  <div class="relative z-[1] px-4 | md:container">
    <div class="mb-8 mx-auto max-w-3xl content" data-aos="fade-up">
      <h2 style="text-align: center;">${type === 'sector' ? 'Other sectors' : 'Similar services'}</h2>
    </div>
    <div class="container flex flex-wrap justify-center">${relatedLinks(relatedAreas, title)}</div>
  </div>
</section>`}`;
  const beforeBanner = template.beforeBanner
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)} | Moonstone Advocates</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(intro)}"`);
  return `${beforeBanner}${banner}${middle}${template.footerAndAfter}`;
};

const insightArticles = [
  {
    slug: 'copyright-data-protection-and-online-publishing',
    date: '29 July 2026',
    category: 'Technology & Media',
    title: 'Copyright, Data Protection and Online Publishing in Uganda',
    summary: 'A recent Commercial Court decision highlights the legal risk of republishing social-media content without accurate attribution, verification or a proper basis for processing personal data.',
    points: ['Treat original social-media posts as potentially protected literary works.', 'Check attribution, accuracy and consent before republishing personal content.', 'Build copyright, privacy and editorial review into digital publishing workflows.'],
    source: 'https://www.ulii.org/en/judgments/UGCommC/'
  },
  {
    slug: 'when-can-a-director-be-personally-liable-for-company-debt',
    date: '25 July 2026',
    category: 'Corporate & Commercial',
    title: 'When Can a Director Be Personally Liable for Company Debt?',
    summary: 'The Commercial Court has reaffirmed that a company\'s separate legal personality is not displaced without clear evidence that it was used as a facade to evade obligations or commit fraud.',
    points: ['Document whether obligations are corporate, personal or guaranteed.', 'A director is not automatically liable simply because the company cannot pay.', 'Creditors should secure appropriate guarantees and enforcement rights at the contracting stage.'],
    source: 'https://www.ulii.org/en/judgments/UGCommC/'
  },
  {
    slug: 'loan-repayment-and-the-limits-of-frustration',
    date: '10 July 2026',
    category: 'Banking & Finance',
    title: 'Loan Repayment and the Limits of Frustration',
    summary: 'A July Commercial Court ruling reinforces that a borrower seeking leave to defend must identify a genuine triable issue, and that frustration does not ordinarily erase an obligation to repay money already received.',
    points: ['Review repayment, default and force-majeure language before signing.', 'Keep evidence supporting any event said to prevent contractual performance.', 'Respond promptly to summary proceedings and identify a bona fide defence.'],
    source: 'https://www.ulii.org/en/judgments/UGCommC/'
  },
  {
    slug: 'withholding-tax-exemptions-july-to-december-2026',
    date: '18 July 2026',
    category: 'Tax & Regulatory',
    title: 'Withholding Tax Exemptions for July to December 2026',
    summary: 'URA\'s current exemption period runs from 1 July to 31 December 2026. Exemption status remains linked to tax compliance and may be revoked where a taxpayer or associate becomes non-compliant.',
    points: ['Confirm exemption status on the URA web portal before relying on it.', 'Continue monitoring filing, payment and wider tax compliance obligations.', 'Keep supplier and customer records aligned with the current exemption period.'],
    source: 'https://ura.go.ug/en/withholding-tax-exemption-applications-for-the-period-july-to-december-2026/'
  }
];

const editorialPage = ({ title, intro, content }) => {
  const banner = sectorTemplate.banner
    .replace(/<h1[\s\S]*?<\/h1>/, `<h1 class="vc_custom_heading us_custom_6df4bc3a">${escapeHtml(title)}</h1>`)
    .replace(/<p class="vc_custom_heading us_custom_6df4bc3a">[\s\S]*?<\/p>/, `<p class="vc_custom_heading us_custom_6df4bc3a">${escapeHtml(intro)}</p>`)
    .replace(/<p>Perhaps your business[\s\S]*?<\/p>/g, '');
  const beforeBanner = sectorTemplate.beforeBanner
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)} | Moonstone Advocates</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(intro)}"`);
  return `${beforeBanner}${banner}${content}${sectorTemplate.footerAndAfter}`;
};

const insightCards = insightArticles.map((article) => `<article class="moonstone-insight-card"><span>${article.category}</span><time datetime="2026-07">${article.date}</time><h2><a href="/insights/${article.slug}/">${article.title}</a></h2><p>${article.summary}</p><a class="moonstone-text-link" href="/insights/${article.slug}/">Read briefing</a></article>`).join('\n');
const insightsLanding = editorialPage({
  title: 'Uganda Legal Insights',
  intro: 'Recent, practical briefings on Ugandan law for businesses, institutions and individuals.',
  content: `<section class="py-20 bg-base-light"><div class="relative z-[1] px-4 | md:container"><div class="moonstone-section-heading content"><span>Published July 2026</span><h2>Recent legal developments</h2><p>Our briefings explain current decisions and regulatory updates in clear language. They provide general information and are not a substitute for advice on a specific matter.</p></div><div class="moonstone-insight-grid">${insightCards}</div></div></section><section class="py-16 bg-yellow"><div class="mx-auto max-w-3xl px-4 content"><h2>Need advice on an update?</h2><p>Speak with our Kampala team about how a legal development may affect your organisation, transaction or dispute.</p><a class="btn btn-primary" href="/contact/">Contact Moonstone Advocates</a></div></section>`
});

const clientCarePage = editorialPage({
  title: 'Client Care',
  intro: 'A new firm with clear standards for responsiveness, integrity and practical legal service.',
  content: `<section class="py-20 bg-base-light"><div class="relative z-[1] px-4 | md:container"><div class="mx-auto max-w-3xl content"><span class="moonstone-eyebrow">Established June 2026</span><h2>Our first two months</h2><p>Moonstone Advocates is at the beginning of its journey. We do not publish inherited rankings or reviews from another practice. Instead, we are building our reputation through careful work, direct partner involvement and honest communication.</p><p>As the firm grows, any client feedback shown here will be current, permission-based and attributable to work undertaken by Moonstone Advocates.</p></div><div class="moonstone-standard-grid"><article><strong>Clear communication</strong><p>We explain scope, timing, likely next steps and professional fees before substantive work begins.</p></article><article><strong>Partner-led attention</strong><p>Clients receive accountable guidance from lawyers who understand the legal and practical context.</p></article><article><strong>Confidentiality and care</strong><p>We handle enquiries discreetly and assess conflicts before confidential instructions are accepted.</p></article></div></div></section><section class="py-16 bg-purple text-base-light"><div class="mx-auto max-w-3xl px-4 content"><h2>Help us improve</h2><p>Current clients may share service feedback directly with the Managing Partner. Concerns are handled under our client-care and complaints process.</p><a class="btn btn-primary" href="/contact/">Share feedback</a></div></section>`
});

const internationalSupportPage = editorialPage({
  title: 'International Legal Support',
  intro: 'Uganda-focused advice for cross-border transactions, investments, disputes and regulatory matters.',
  content: `<section class="py-20 bg-base-light"><div class="relative z-[1] px-4 | md:container"><div class="mx-auto max-w-3xl content"><span class="moonstone-eyebrow">Uganda and cross-border matters</span><h2>One clear point of contact</h2><p>Moonstone Advocates helps international businesses, investors and individuals understand the Ugandan legal requirements affecting their plans. We also support Ugandan clients whose transactions or disputes involve parties, assets or documents in other jurisdictions.</p><p>Where a matter requires advice in another country, we can work alongside appropriately qualified foreign counsel while keeping the Ugandan workstream coordinated and practical.</p></div><div class="moonstone-standard-grid"><article><strong>Market entry</strong><p>Company establishment, licensing, investment structures, contracts and ongoing compliance in Uganda.</p></article><article><strong>Cross-border transactions</strong><p>Ugandan due diligence, transaction documents, security arrangements and regulatory approvals.</p></article><article><strong>Disputes and enforcement</strong><p>Local proceedings, arbitration support and advice on recognition or enforcement issues.</p></article></div></div></section><section class="py-16 bg-yellow"><div class="mx-auto max-w-3xl px-4 content"><h2>Planning a matter involving Uganda?</h2><p>Tell us the jurisdictions, parties and intended outcome, and our team will identify the Ugandan legal steps.</p><a class="btn btn-primary" href="/contact/">Contact our Kampala team</a></div></section>`
});

const professionalNetworksPage = editorialPage({
  title: 'Professional Relationships',
  intro: 'Collaborative legal support built around the needs of each client and matter.',
  content: `<section class="py-20 bg-base-light"><div class="relative z-[1] px-4 | md:container"><div class="mx-auto max-w-3xl content"><span class="moonstone-eyebrow">A new Ugandan firm</span><h2>Relationships with purpose</h2><p>Moonstone Advocates was established in June 2026. We do not claim inherited rankings, awards or association memberships from another practice. Our professional relationships are developed transparently and used only where they add value for the client.</p><p>Depending on the matter, we may coordinate with accountants, tax advisers, company secretaries, technical experts, valuers or independently qualified lawyers in other jurisdictions. Any external role, scope and cost is discussed with the client first.</p></div><div class="moonstone-standard-grid"><article><strong>Clear responsibility</strong><p>Clients know who is leading the matter and which adviser is responsible for each workstream.</p></article><article><strong>Independent judgment</strong><p>External collaboration does not replace our duty to provide careful, confidential and conflict-checked advice.</p></article><article><strong>Practical coordination</strong><p>We keep communication focused so multidisciplinary matters can move forward efficiently.</p></article></div></div></section><section class="py-16 bg-purple text-base-light"><div class="mx-auto max-w-3xl px-4 content"><h2>Work with Moonstone Advocates</h2><p>Professionals seeking to coordinate on a client matter may contact our Kampala office.</p><a class="btn btn-primary" href="/contact/">Start a conversation</a></div></section>`
});

const writeCleanPage = (area, type) => {
  const dir = path.join(target, area.path.replace(/\/?index\.html$/, ''));
  mkdirSync(dir, { recursive: true });
  const intro = type === 'service'
    ? `${area.title} support for clients seeking reliable, strategic and practical legal solutions in Uganda.`
    : `Focused legal support for ${area.title.toLowerCase()} in Uganda.`;
  const items = area.items || serviceAreas.find((service) => service.title.includes(area.title.split(' ')[0]))?.items || [
    'Legal advisory and documentation',
    'Regulatory and compliance support',
    'Dispute prevention and resolution',
    'Practical client support'
  ];
  writeFileSync(path.join(dir, 'index.html'), styledPage({ title: area.title, intro, items, type }));
};

mkdirSync(path.join(target, 'services'), { recursive: true });
writeFileSync(path.join(target, 'services/index.html'), styledPage({
  title: 'Services',
  intro: 'Explore Moonstone Advocates services across corporate advisory, tax, disputes, property, employment, family, finance, public sector, energy and criminal law.',
  items: serviceAreas.map((area) => ({ href: cleanUrl(`/${area.path}`), label: area.title })),
  type: 'service'
}));
mkdirSync(path.join(target, 'sectors'), { recursive: true });
writeFileSync(path.join(target, 'sectors/index.html'), styledPage({
  title: 'Sectors',
  intro: 'Moonstone Advocates supports clients across commercial, financial, property, energy, public sector, family, employment, tax, disputes and criminal defence sectors.',
  items: sectorAreas.map((area) => ({ href: cleanUrl(`/${area.path}`), label: area.title })),
  type: 'sector'
}));
for (const area of serviceAreas) writeCleanPage(area, 'service');
for (const area of sectorAreas) writeCleanPage(area, 'sector');
mkdirSync(path.join(target, 'content-hub'), { recursive: true });
writeFileSync(path.join(target, 'content-hub/index.html'), insightsLanding);
mkdirSync(path.join(target, 'reviews'), { recursive: true });
writeFileSync(path.join(target, 'reviews/index.html'), clientCarePage);
mkdirSync(path.join(target, 'international'), { recursive: true });
writeFileSync(path.join(target, 'international/index.html'), internationalSupportPage);
mkdirSync(path.join(target, 'partners'), { recursive: true });
writeFileSync(path.join(target, 'partners/index.html'), professionalNetworksPage);
for (const article of insightArticles) {
  const articleDir = path.join(target, 'insights', article.slug);
  mkdirSync(articleDir, { recursive: true });
  const articleContent = `<article class="moonstone-article py-20 bg-base-light"><div class="mx-auto max-w-3xl px-4 content"><div class="moonstone-article-meta"><span>${article.category}</span><time>${article.date}</time></div><h2>What changed?</h2><p>${article.summary}</p><h2>Practical points</h2><ul>${article.points.map((point) => `<li>${point}</li>`).join('')}</ul><h2>Why it matters</h2><p>Legal outcomes depend on the facts, documents and procedure in each matter. Early review can help identify risk, preserve evidence and clarify the available commercial or legal response.</p><p><a class="moonstone-text-link" href="${article.source}" target="_blank" rel="noopener">View the official source</a></p><aside><strong>General information only</strong><p>This briefing is not legal or tax advice. Contact Moonstone Advocates for guidance on your circumstances.</p></aside><a class="btn btn-primary" href="/contact/">Discuss this update</a></div></article>`;
  writeFileSync(path.join(articleDir, 'index.html'), editorialPage({ title: article.title, intro: article.summary, content: articleContent }));
}
for (const member of teamMembers) {
  const cleanProfile = path.join(target, member.path.replace(/^\//, ''));
  mkdirSync(path.dirname(cleanProfile), { recursive: true });
  const profileContent = `<section class="moonstone-profile py-20 bg-base-light"><div class="moonstone-profile-layout"><div class="moonstone-profile-image"><img src="${member.image}" alt="${member.name}, ${member.role}" /></div><article class="content"><span class="moonstone-eyebrow">${member.role}</span><h2>${member.name}</h2>${profileBody(member)}<blockquote>${member.quote}</blockquote><a class="btn btn-primary" href="/contact/">Contact the team</a></article></div></section>`;
  writeFileSync(cleanProfile, editorialPage({ title: member.name, intro: `${member.role} at Moonstone Advocates`, content: profileContent }));
}
for (const oldGeneratedFolder of [
  'key-practice-area',
  'key-industry-sector',
  'contact/london-office',
  'contact/ireland-office'
]) {
  rmSync(path.join(target, oldGeneratedFolder), { recursive: true, force: true });
}
rmSync(templateCacheDir, { recursive: true, force: true });

console.log(`Prepared ${htmlFiles.length} HTML files in ${path.relative(root, target)}`);
