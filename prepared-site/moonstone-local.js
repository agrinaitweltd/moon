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
})();