(() => {
  const animatedSelectors = [
    ['section:not(.banner)', 'fade-up'],
    ['.banner h1, .banner p', 'fade-up'],
    ['.content h1, .content h2, .content h3, .content p', 'fade-up'],
    ['.content li', 'fade-up'],
    ['.moonstone-practice-card', 'zoom-in'],
    ['.grid > div, .grid > article', 'fade-up'],
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