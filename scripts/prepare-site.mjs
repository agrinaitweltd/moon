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

for (const oldSection of ['blog', 'author', 'category', 'briffa-case-study']) {
  rmSync(path.join(target, oldSection), { recursive: true, force: true });
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
  <h3>${area.title}</h3>
  <ul>${area.items.map((item) => `<li>${item}</li>`).join('')}</ul>
</article>`).join('\n');

const moonstoneEnquiryForm = `<form class="moonstone-contact-form" action="/contact/index.html" method="post">
  <label>Name <input required name="name" type="text" /></label>
  <label>Email <input required name="email" type="email" /></label>
  <label>How can we help? <textarea required name="message" rows="5"></textarea></label>
  <button class="btn btn-primary" type="submit">Send enquiry</button>
</form>`;

const moonstoneContactBlock = `<h2>Contact Moonstone Advocates</h2>
<p>Moonstone Advocates welcomes enquiries from individuals, businesses and institutions seeking clear, practical legal support in Uganda.</p>
<p><strong>Address:</strong><br />Plot 134 Semwata Road, Ntinda<br />P.O. Box 189860<br />Kampala, Uganda</p>
<p><strong>Telephone:</strong> <a href="tel:+256778616565">+256 (0) 778 616565</a><br /><strong>Email:</strong> <a href="mailto:info@moonstoneadvocates.com">info@moonstoneadvocates.com</a><br /><strong>Website:</strong> www.moonstoneadvocates.com</p>
<p><strong>Senior partner contacts:</strong><br />Edward Labeja, Managing Partner: <a href="tel:+256778616565">+256 778 616 565</a>, <a href="mailto:leo@moonstoneadvocates.com">leo@moonstoneadvocates.com</a><br />Norah Amanya, Partner: <a href="tel:+256772986509">+256 772 986 509</a>, <a href="mailto:naa@moonstoneadvocates.com">naa@moonstoneadvocates.com</a></p>`;

const contactPageMain = `<section class="banner relative bg-navy z-[1]">
    <div class="relative pt-32 pb-24 overflow-hidden">
        <div class="relative container z-[1]">
            <div class="px-6 mb-12 md:w-8/12 text-base-light">
                <div class="max-w-3xl ">
                    <h1>Contact Moonstone Advocates</h1>
                    <p><strong>Speak directly with our team about your legal matter.</strong></p>
                    <p>We provide practical, partner-led legal and advisory support from Kampala, Uganda.</p>
                </div>
            </div>
            <a class="btn btn-primary lg:mr-4 " href="#consultation" target="_self">CONTACT US</a>
        </div>
        <aside class="absolute z-0 w-5/6 h-full lg:w-1/2 -right-24 -top-12 lg:-right-36 lg:-top-20 xl:-right-48 xl:-top-24"></aside>
    </div>
    <div class="bg"></div>
</section>
<section class="py-16 bg-base-light" id="consultation">
  <div class="relative z-[1] px-4 | md:container">
    <div class="mx-auto max-w-3xl content" data-aos="fade-up">
      ${moonstoneContactBlock}
      ${moonstoneEnquiryForm}
    </div>
  </div>
</section>
<section class="py-16 bg-yellow">
  <div class="relative z-[1] px-4 | md:container">
    <div class="mx-auto max-w-3xl content" data-aos="fade-up">
      <h2>Visit Us</h2>
      <p>Our office is located at Plot 134 Semwata Road, Ntinda, Kampala. Meetings are available by appointment so our team can prepare properly for your enquiry.</p>
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
    path: '/meet-team/william-miles/index.html',
    image: '/images/team-edward.png',
    profile: [
      'Ochora Edward Labeja is the Managing Partner of Moonstone Advocates and an Advocate of the High Court of Uganda. He provides partner-led support to businesses, institutions and individuals on corporate, commercial, employment, property, dispute resolution and family matters.',
      'Edward is valued for practical legal judgment, direct client attention and commercially aware advice that helps clients move from uncertainty to clear legal action.'
    ],
    practice: ['Commercial & Corporate Law', 'Energy, Water & Infrastructure Law', 'Real Estate & Property Law', 'Employment & Labour Law', 'Litigation & Alternative Dispute Resolution', 'Family & Succession Law'],
    credentials: ['LL.B Hons, Uganda Christian University', 'Diploma in Legal Practice, Law Development Centre', 'Member, East African Law Society'],
    quote: 'Clients deserve more than legal opinions; they deserve committed legal partners.'
  },
  {
    name: 'NORAH AMANYA',
    role: 'Partner',
    path: '/meet-team/eamon-chawke/index.html',
    image: '/images/team-norah.png',
    profile: [
      'Norah Amanya is a Partner at Moonstone Advocates with experience in complex commercial transactions, governance, extractives, energy and infrastructure. She has over 11 years of legal experience, including service as General Counsel at CITI Global and as a Senior Associate at Cristal Advocates and ABMAK.',
      'Her work spans oil and gas, energy, immigration, family, estate management, corporate governance, banking and land conveyance. Norah is also a published author.'
    ],
    practice: ['Commercial Law', 'Oil and Gas Law', 'Immigration Law', 'Family Law and Estate Management', 'Corporate Structuring and Governance', 'Infrastructure and Project Financing', 'Banking Law', 'Land Conveyance'],
    credentials: ['PODITRA', 'LLM Oil and Gas Law, University of Aberdeen', 'Postgraduate Diploma in Legal Practice, Law Development Centre', 'LLB, Uganda Christian University', 'Member, Uganda Law Society', 'Member, East African Law Society', 'Member, AIEN', 'Member, IAWL'],
    quote: 'Clear legal advice should protect the client today and position them well for tomorrow.'
  },
  {
    name: 'SANDE HAPPY',
    role: 'Senior Associate',
    path: '/meet-team/daniel-crate/index.html',
    image: '/images/team-sande.png',
    profile: [
      'Sande Happy is a Senior Associate in Dispute Resolution and Corporate & Commercial practice. He is an Advocate of the High Court and subordinate courts of Uganda with over six years of experience.',
      'Happy handles commercial disputes before the Commercial Court, arbitration and alternative dispute resolution, land, employment and domestic disputes, labour matters and debt collection. His corporate work includes company registration, trademarks, patents, due diligence and mergers and acquisitions.'
    ],
    practice: ['Litigation', 'Banking and Finance', 'Energy and Infrastructure', 'Debt Recovery', 'Intellectual Property', 'Employment and Labour'],
    credentials: ['Diploma in Law, Law Development Centre', 'LLB, Uganda Christian University', 'Member, Uganda Law Society', 'Member, East African Law Society'],
    quote: 'Disputes are best handled with preparation, clarity and a steady focus on results.'
  },
  {
    name: 'AKELLO SHIRLEY MARYLIN',
    role: 'Associate',
    path: '/meet-team/charlotte-owens/index.html',
    image: '/images/team-akello.png',
    profile: [
      'Akello Shirley Marylin is an Associate in the Litigation Department. She first joined the firm as an intern and was retained after completing her Postgraduate Diploma in Legal Practice.',
      'Shirley supports corporate clients on contract review and drafting, loan documentation, perfection of securities, employment advisory, governance, compliance, quality assurance, banking, finance and employment matters. She has a strong interest in litigation, artificial intelligence and technology governance.'
    ],
    practice: ['Litigation', 'Debt Recovery', 'Intellectual Property', 'Employment and Labour'],
    credentials: ['Diploma in Law, Law Development Centre', 'LLB, Cavendish University', 'Member, Uganda Law Society', 'Member, East African Law Society'],
    quote: 'Resilient legal support means staying precise, responsive and client-focused.'
  },
  {
    name: 'MWAKA JAMES TOLIT',
    role: 'Associate',
    path: '/meet-team/mark-eiffe/index.html',
    image: '/images/team-mwaka.png',
    profile: [
      'Mwaka James Tolit is an Associate in Litigation and Commercial practice. He advises on corporate and commercial matters, governance, compliance, disputes and litigation.',
      'James has advised clients in banking, insurance, communications, e-commerce, oil and gas, agribusiness, hospitality, energy and transport. His work includes mergers and acquisitions, employment, new ventures, market entry, contracts, immigration, licensing and alternative dispute resolution.'
    ],
    practice: ['Litigation', 'Banking and Finance', 'Debt Recovery', 'Intellectual Property', 'Real Estate', 'Employment and Labour'],
    credentials: ['Diploma in Law, ILPD Kigali', 'LLB, Uganda Christian University', 'Member, East African Law Society'],
    quote: 'Strong advisory work connects commercial reality with dependable legal structure.'
  },
  {
    name: 'ECHIBA EDWIN MICHEAL',
    role: 'Consultant',
    path: '/meet-team/mohammad-khan/index.html',
    image: '/images/team-echiba.png',
    profile: [
      'Echiba Edwin Micheal is a Consultant and external tax consultant to Moonstone Advocates. He provides strategic tax advisory, tax dispute support and regulatory compliance guidance.',
      'Edwin is an Advocate of the High Court of Uganda, a tax consultant and governance professional with nine years of experience. He is a licensed tax agent with experience in tax advisory, compliance, disputes, transfer pricing and international tax, including prior work with KPMG Uganda and leading Ugandan tax lawyers and accountants.'
    ],
    practice: ['Taxation', 'Litigation', 'Banking and Finance', 'Debt Recovery', 'Employment and Labour'],
    credentials: ['ADIT, ongoing', 'Chartered Institute of Taxation UK', 'ICSA, ongoing', 'PODITRA', 'LLM Oil and Gas Law', 'Postgraduate Diploma in Legal Practice, Law Development Centre', 'LLB, Uganda Christian University', 'Member, Uganda Law Society', 'Member, East African Law Society', 'Member, UTAA', 'Member, UCLF'],
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
@media (max-width:767px){.moonstone-practice-grid{grid-template-columns:1fr}}
.moonstone-contact-form{display:grid;gap:1rem;max-width:560px;margin:1.5rem auto 0;text-align:left}
.moonstone-contact-form label{display:grid;gap:.35rem;font-weight:700}
.moonstone-contact-form input,.moonstone-contact-form textarea{width:100%;border:1px solid rgba(24,26,52,.2);border-radius:.25rem;padding:.85rem 1rem;color:#181a34;background:#fff}
.moonstone-contact-form textarea{resize:vertical}
.custom-css{overflow-x:hidden}
body:not(.moonstone-aos-ready) [data-aos]{opacity:1!important;transform:none!important}
.custom-css img{max-width:100%;height:auto}
.custom-css header img[src="/images/logo.png"]{max-width:118px;max-height:34px;width:auto;height:auto;object-fit:contain;transition:transform .35s ease,opacity .35s ease}
.custom-css header a:hover img[src="/images/logo.png"]{transform:translateY(-1px) scale(1.02)}
.custom-css footer img[src="/images/logo.png"]{max-width:180px;width:min(180px,48vw);height:auto}
.custom-css section>.relative,.custom-css section>.container,.custom-css .content,.custom-css footer .container{box-sizing:border-box}
.custom-css .btn,.custom-css .moonstone-practice-card,.custom-css #team .flex.flex-col,.custom-css .content a,.custom-css article,.custom-css form input,.custom-css form textarea{transition:transform .28s ease,box-shadow .28s ease,opacity .28s ease,background-color .28s ease,border-color .28s ease}
.custom-css .btn:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(24,26,51,.18)}
.custom-css .moonstone-practice-card:hover,.custom-css #team .flex.flex-col:hover,.custom-css article:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(24,26,51,.12)}
.custom-css form input:focus,.custom-css form textarea:focus{outline:none;border-color:#6481b9;box-shadow:0 0 0 4px rgba(100,129,185,.16)}
.custom-css .banner img,.custom-css section img[src="/images/image.png"]{animation:moonstone-soft-float 7s ease-in-out infinite alternate}
.custom-css .bg-yellow.rounded-full,.custom-css .bg-purple.rounded-full{animation:moonstone-pulse 5.5s ease-in-out infinite alternate}
.custom-css nav a{transition:opacity .25s ease,color .25s ease,transform .25s ease}
.custom-css nav a:hover{transform:translateY(-1px)}
.moonstone-page-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#fcf7fb;transition:opacity .55s ease,visibility .55s ease}
.moonstone-page-loader:before{content:"";width:44px;height:44px;border-radius:999px;border:4px solid rgba(24,26,51,.12);border-top-color:#eab736;animation:moonstone-spin .8s linear infinite}
.moonstone-page-loader.is-hidden{opacity:0;visibility:hidden;pointer-events:none}
.moonstone-page-ready main{animation:moonstone-page-in .7s ease both}
@keyframes moonstone-soft-float{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(0,-10px,0) scale(1.015)}}
@keyframes moonstone-pulse{from{transform:scale(1);opacity:.92}to{transform:scale(1.06);opacity:1}}
@keyframes moonstone-spin{to{transform:rotate(360deg)}}
@keyframes moonstone-page-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.custom-css *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@media (max-width:767px){.custom-css header img[src="/images/logo.png"]{max-width:92px;max-height:28px}.custom-css section>.relative,.custom-css section>.container,.custom-css .content,.custom-css footer .container{padding-left:1rem!important;padding-right:1rem!important}.custom-css .banner{margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important}.custom-css .banner .px-6,.custom-css .banner .px-8,.custom-css .banner .px-4{padding-left:1rem!important;padding-right:1rem!important}.custom-css h1{font-size:2.25rem!important;line-height:1.05!important;overflow-wrap:anywhere}.custom-css h2{font-size:1.85rem!important;line-height:1.12!important;overflow-wrap:anywhere}.custom-css p,.custom-css li,.custom-css a{overflow-wrap:anywhere}.custom-css .btn{white-space:normal;text-align:center}.custom-css nav:not(.hidden){left:0!important;right:0!important;width:100vw!important;max-width:100vw!important;padding-left:1rem!important;padding-right:1rem!important;overflow-y:auto}.custom-css #team .flex.flex-wrap{margin-left:0!important;margin-right:0!important}.custom-css #team .flex.flex-col{width:100%!important;max-width:320px}.moonstone-contact-form{max-width:100%}}
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
@media (max-width:1023px){nav:not(.hidden) .moonstone-services-menu{display:block!important}.moonstone-services-menu{width:100%!important}}
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
  html = html.replace(/href="blog\/[^"]*"/g, 'href="key-practice-area/index.html"');
  html = html.replace(/href="author\/[^"]*"/g, 'href="about/index.html"');
  html = html.replace(/href="category\/[^"]*"/g, 'href="key-practice-area/index.html"');
  html = html.replace(/href="briffa-case-study\/[^"]*"/g, 'href="key-practice-area/index.html"');
  html = html.replace(/href="\/?key-practice-area\/index\.html"/g, 'href="/services/"');
  html = html.replace(/href="\/?key-industry-sector\/index\.html"/g, 'href="/sectors/"');
  html = html.replace(/href="contact\/london-office\/index.html"/g, 'href="contact/index.html"');
  html = html.replace(/href="contact\/ireland-office\/index.html"/g, 'href="contact/index.html"');
  html = html.replace(/>Blog\s+</g, '>Legal Insights <');
  html = html.replace(/>Content Hub\s+</g, '>Legal Insights <');
  html = html.replace(/>Case Studies\s+</g, '>Practice Areas <');
  html = html.replace(/>Reviews\s+</g, '>Client Care <');
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
    html = html.replace(/<\/header>[\s\S]*?<footer class="relative z-0 text-base-light bg-navy overflow-hidden">/, `</header>${contactPageMain}<footer class="relative z-0 text-base-light bg-navy overflow-hidden">`);
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
    const memberPath = member.path.replace(/^\//, '');
    if (file.replace(/\\/g, '/').endsWith(memberPath)) {
      html = html.replace(/<p class="px-4 py-2 m-0 absolute bottom-0 left-0 inline-block font-bold bg-base-light font-heading">\s*[\s\S]*?\s*<\/p>/, `<p class="px-4 py-2 m-0 absolute bottom-0 left-0 inline-block font-bold bg-base-light font-heading">\n                    ${member.role}                </p>`);
      html = html.replace(/<h1 class="mt-12 mb-4">[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>\s*<p>[\s\S]*?<\/p>(?:\s*<p>[\s\S]*?<\/p>)*/m, `<h1 class="mt-12 mb-4">${member.name}</h1>\n                ${profileBody(member)}`);
      html = html.replace(/<h1 class="mt-12 mb-4">[\s\S]*?<\/h1>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<aside class="h-full transform/g, `<h1 class="mt-12 mb-4">${member.name}</h1>\n                ${profileBody(member)}\n\n            </div>\n        </div>\n    </div>\n\n    <aside class="h-full transform`);
      html = html.replace(/<p style="text-align: center;"><strong>Contact us now<\/strong><\/p>/g, `<p style="text-align: center;"><strong>Contact ${member.name}</strong></p>`);
      html = html.replace(/<p><strong>[\s\S]*?<\/strong><\/p>\s*<p>law lawyers[\s\S]*?<p>[\s\S]*?<\/p>\s*<p>– [\s\S]*?<\/p>/g, `<p><strong>${member.quote}</strong></p>\n<p>Moonstone Advocates provides practical, partner-led legal support from Kampala, Uganda.</p>\n<p>For assistance, contact info@moonstoneadvocates.com or +256 (0) 778 616565.</p>\n<p>– ${member.name}</p>`);
    }
  }
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
    html = html.replace(/<body([^>]*)>/, '<body$1><div class="moonstone-page-loader" aria-hidden="true"></div>');
  }

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
  const hideLoader = () => {
    document.body.classList.add('moonstone-page-ready');
    document.querySelector('.moonstone-page-loader')?.classList.add('is-hidden');
  };
  if (document.readyState === 'complete') {
    window.setTimeout(hideLoader, 120);
  } else {
    window.addEventListener('load', () => window.setTimeout(hideLoader, 180), { once: true });
    window.setTimeout(hideLoader, 1400);
  }

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
    ['footer .container > *', 'fade-up'],
    ['.btn', 'zoom-in']
  ];

  animatedSelectors.forEach(([selector, animation]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.hasAttribute('data-aos')) return;
      element.setAttribute('data-aos', animation);
      element.setAttribute('data-aos-delay', String(Math.min((index % 8) * 55, 385)));
    });
  });

  if (window.AOS && typeof window.AOS.init === 'function') {
    window.AOS.init({ once: true, duration: 760, offset: 80, easing: 'ease-out-cubic' });
    document.body.classList.add('moonstone-aos-ready');
  } else if (window.AOS && typeof window.AOS.refreshHard === 'function') {
    window.AOS.refreshHard();
    document.body.classList.add('moonstone-aos-ready');
  } else if (window.AOS && typeof window.AOS.refresh === 'function') {
    window.AOS.refresh();
    document.body.classList.add('moonstone-aos-ready');
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.moonstone-practice-card, #team .flex.flex-col, article').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
        card.style.transform = 'translateY(-6px) rotateX(' + y.toFixed(2) + 'deg) rotateY(' + x.toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    let message = form.parentElement?.querySelector('.moonstone-form-message');
    if (!message) {
      message = document.createElement('p');
      message.className = 'moonstone-form-message';
      message.style.marginTop = '1rem';
      message.style.fontWeight = '700';
      form.parentElement?.appendChild(message);
    }
    message.textContent = 'Thank you. Your enquiry has been received.';
    form.reset();
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
  path.join(root, 'www.briffa.com/key-practice-area/ip-disputes/index.html')
);
const sectorTemplate = pageTemplate(
  path.join(templateCacheDir, 'sector.html'),
  path.join(root, 'www.briffa.com/key-industry-sector/technology/index.html')
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
  const itemList = items.map((item) => `<li>${typeof item === 'string' ? escapeHtml(item) : item}</li>`).join('\n');
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
<section class="py-20 relative overflow-hidden bg-base-light">
  <div class="relative z-[1] px-4 | md:container">
    <div class="mb-8 mx-auto max-w-3xl content" data-aos="fade-up">
      <h2 style="text-align: center;">${type === 'sector' ? 'Other sectors' : 'Similar services'}</h2>
    </div>
    <div class="container flex flex-wrap justify-center">${relatedLinks(relatedAreas, title)}</div>
  </div>
</section>`;
  const beforeBanner = template.beforeBanner
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)} | Moonstone Advocates</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(intro)}"`);
  return `${beforeBanner}${banner}${middle}${template.footerAndAfter}`;
};

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
  items: serviceAreas.map((area) => `<a href="${cleanUrl(`/${area.path}`)}">${area.title}</a>`),
  type: 'service'
}));
mkdirSync(path.join(target, 'sectors'), { recursive: true });
writeFileSync(path.join(target, 'sectors/index.html'), styledPage({
  title: 'Sectors',
  intro: 'Moonstone Advocates supports clients across commercial, financial, property, energy, public sector, family, employment, tax, disputes and criminal defence sectors.',
  items: sectorAreas.map((area) => `<a href="${cleanUrl(`/${area.path}`)}">${area.title}</a>`),
  type: 'sector'
}));
for (const area of serviceAreas) writeCleanPage(area, 'service');
for (const area of sectorAreas) writeCleanPage(area, 'sector');
for (const oldGeneratedFolder of [
  'key-practice-area',
  'key-industry-sector',
  'contact/london-office',
  'contact/ireland-office'
]) {
  rmSync(path.join(target, oldGeneratedFolder), { recursive: true, force: true });
}

console.log(`Prepared ${htmlFiles.length} HTML files in ${path.relative(root, target)}`);
