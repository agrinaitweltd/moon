(() => {
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
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'moonstone-scroll-progress';
  scrollProgress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(scrollProgress);
  const pageHeader = document.querySelector('header.menu');
  let scrollFrame = 0;
  const updateScrollEffects = () => {
    scrollFrame = 0;
    const available = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollProgress.style.transform = 'scaleX(' + Math.min(window.scrollY / available, 1) + ')';
    pageHeader?.classList.toggle('moonstone-scrolled', window.scrollY > 18);
  };
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

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

  const enquiryOptions = {"Corporate & Commercial Advisory":["Company incorporation and business structuring","Corporate governance and regulatory compliance","Shareholder agreements and corporate documentation","Commercial agreements and contract drafting","Legal due diligence","Business restructuring and reorganisations","Mergers, acquisitions and investment transactions","Corporate advisory and general business support"],"Tax & Regulatory Advisory":["Tax advisory","Tax compliance support","Regulatory compliance reviews","Business licensing and approvals","Advisory on statutory obligations","Tax dispute support"],"Dispute Resolution":["Commercial disputes","Civil disputes","Debt recovery","Contractual disputes","Employment disputes","Land and property disputes","Arbitration and alternative dispute resolution","Enforcement of judgments and court orders"],"Real Estate, Land & Property":["Land transactions","Property acquisitions and disposals","Conveyancing","Lease agreements","Real estate due diligence","Property development advisory","Land dispute resolution","Security documentation involving property"],"Employment, Labour & Immigration":["Employment contracts","Human resource policies and manuals","Labour law compliance","Disciplinary and termination processes","Workplace disputes","Employee benefits advisory","Immigration and work permit support"],"Family Law":["Marriage and matrimonial advisory","Divorce and separation matters","Child custody and maintenance disputes","Family mediation","Succession and inheritance planning","Wills and estate planning","Probate and administration of estates","Family property arrangements"],"Banking, Finance & Securities":["Loan and facility documentation","Security creation and perfection","Mortgages, charges and guarantees","Banking regulatory advisory","Debt recovery and enforcement","Financial services agreements","Lending and financing transactions","Restructuring and insolvency advisory"],"Public Sector & Regulatory Advisory":["Regulatory advisory","Public procurement support","Government contracting","Policy and compliance advisory","Administrative law matters"],"Energy & Infrastructure":["Oil and gas law","Energy regulatory compliance","Infrastructure development and financing","Project development agreements","Power Purchase Agreements (PPAs)","Environmental and social impact advisory","Construction and engineering contracts","Public-private partnerships (PPPs)","Renewable energy and sustainability advisory"],"Criminal Law":["Criminal defence","Bail and bond applications","Police station representation","Criminal appeals","Legal representation during investigations","Extradition matters","Regulatory and compliance offences","Human rights and constitutional petitions in criminal matters"]};
  const matterPrompts = {
    'Corporate & Commercial Advisory': ['Company, transaction or document details', 'For example: company name, transaction type or document involved'],
    'Tax & Regulatory Advisory': ['Tax period, licence or authority reference', 'For example: tax type, filing period, URA reference or licence'],
    'Dispute Resolution': ['Parties, court or case reference', 'For example: other party, court, claim number or hearing date'],
    'Real Estate, Land & Property': ['Property or title details', 'For example: location, block and plot, title number or landlord'],
    'Employment, Labour & Immigration': ['Employment or immigration details', 'For example: employer, role, permit type or disciplinary stage'],
    'Family Law': ['Family or estate details', 'For example: relationship, children, estate or probate reference'],
    'Banking, Finance & Securities': ['Facility or security details', 'For example: lender, borrower, facility, mortgage or guarantee'],
    'Public Sector & Regulatory Advisory': ['Authority, tender or decision details', 'For example: public body, procurement reference or decision date'],
    'Energy & Infrastructure': ['Project, site or regulator details', 'For example: project name, location, licence or contracting authority'],
    'Criminal Law': ['Police, court or case details', 'For example: police station, file number, court, charge or next appearance']
  };
  const matterSelect = document.querySelector('[data-matter-select]');
  const subserviceSelect = document.querySelector('[data-subservice-select]');
  const detailField = document.querySelector('[data-detail-field]');
  const contextField = document.querySelector('[data-context-field]');
  const contextLabel = document.querySelector('[data-context-label]');
  const contextInput = document.querySelector('[data-context-input]');
  matterSelect?.addEventListener('change', () => {
    const matter = matterSelect.value;
    const options = enquiryOptions[matter] || [];
    if (subserviceSelect) {
      subserviceSelect.innerHTML = '<option value="">Select the specific issue</option>' + options.map((option) => '<option value="' + option.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">' + option + '</option>').join('');
      subserviceSelect.disabled = options.length === 0;
      subserviceSelect.required = options.length > 0;
    }
    if (detailField) detailField.hidden = options.length === 0;
    const prompt = matterPrompts[matter];
    if (contextLabel) contextLabel.textContent = prompt?.[0] || 'Relevant details';
    if (contextInput) contextInput.placeholder = prompt?.[1] || '';
    if (contextField) contextField.hidden = !prompt;
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('moonstone-contact-form')) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const subject = 'Website enquiry: ' + (values.get('matter') || 'Legal assistance') + (values.get('subservice') ? ' - ' + values.get('subservice') : '');
    const body = ['Legal service: ' + values.get('matter'), 'Specific assistance: ' + (values.get('subservice') || 'Not selected'), 'Current stage: ' + (values.get('matter_stage') || 'Not provided'), 'Relevant details: ' + (values.get('matter_reference') || 'Not provided'), 'Important deadline: ' + (values.get('deadline') || 'Not provided'), 'Formal documents received: ' + values.get('documents'), '', 'Name: ' + values.get('name'), 'Email: ' + values.get('email'), 'Telephone: ' + (values.get('phone') || 'Not provided'), 'Organisation: ' + (values.get('organisation') || 'Not provided'), 'Preferred response: ' + values.get('contact_method'), '', 'Enquiry:', values.get('message')].join('\n');
    window.location.href = 'mailto:info@moonstoneadvocates.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }, true);
})();