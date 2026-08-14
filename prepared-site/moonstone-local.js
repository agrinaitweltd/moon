(() => {
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
      if (!element.hasAttribute('data-aos')) element.setAttribute('data-aos', animation);
      element.classList.add('moonstone-reveal');
      if (animation === 'zoom-in') element.classList.add('moonstone-reveal-scale');
      if (animation === 'fade-left') element.classList.add('moonstone-reveal-left');
      if (animation === 'fade-right') element.classList.add('moonstone-reveal-right');
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
})();