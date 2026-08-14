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
    const body = ['Name: ' + values.get('name'), 'Email: ' + values.get('email'), 'Telephone: ' + (values.get('phone') || 'Not provided'), 'Organisation: ' + (values.get('organisation') || 'Not provided'), 'Preferred response: ' + values.get('contact_method'), '', 'Enquiry:', values.get('message')].join('\n');
    window.location.href = 'mailto:info@moonstoneadvocates.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }, true);
})();