(() => {
  const animatedSelectors = [
    ['section:not(.banner)', 'fade-up'],
    ['.content h1, .content h2, .content h3', 'fade-up'],
    ['.moonstone-practice-card', 'zoom-in'],
    ['#team .flex.flex-col', 'fade-up'],
    ['.btn', 'zoom-in']
  ];

  animatedSelectors.forEach(([selector, animation]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.hasAttribute('data-aos')) return;
      element.setAttribute('data-aos', animation);
      element.setAttribute('data-aos-delay', String(Math.min((index % 6) * 70, 350)));
    });
  });

  if (window.AOS && typeof window.AOS.refreshHard === 'function') {
    window.AOS.refreshHard();
  } else if (window.AOS && typeof window.AOS.refresh === 'function') {
    window.AOS.refresh();
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