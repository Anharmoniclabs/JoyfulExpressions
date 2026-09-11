(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); document.body.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded','false');
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  if (!reduced) {
    const items = [...document.querySelectorAll('[data-parallax]')];
    let ticking = false;
    const update = () => {
      items.forEach(el => {
        const rect = el.parentElement?.getBoundingClientRect();
        if (!rect || rect.bottom < -200 || rect.top > innerHeight + 200) return;
        const speed = Number(el.dataset.parallax || 0.08);
        const centerDelta = (rect.top + rect.height / 2) - innerHeight / 2;
        el.style.transform = `translate3d(0, ${centerDelta * speed}px, 0) scale(1.04)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive:true });
    window.addEventListener('resize', update);
    update();
  }

  const lightbox = document.querySelector('#lightbox');
  const lbImg = lightbox?.querySelector('img');
  const lbText = lightbox?.querySelector('p');
  document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
    if (!lightbox || !lbImg || !lbText) return;
    lbImg.src = item.dataset.full; lbImg.alt = item.dataset.alt || '';
    lbText.textContent = item.querySelector('span')?.textContent || '';
    lightbox.showModal();
  }));
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

  const booking = document.querySelector('#booking-form');
  booking?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(booking);
    const msg = [
      `Hi Joyful Expressions! My name is ${data.get('name')}.`,
      `I'd like to request: ${data.get('service')}.`,
      `Preferred date: ${data.get('date')}${data.get('time') ? ` at ${data.get('time')}` : ''}.`,
      data.get('notes') ? `Design/add-ons: ${data.get('notes')}.` : '',
      'Please let me know your availability and final price. Thank you!'
    ].filter(Boolean).join(' ');
    window.location.href = `sms:+19297316733?body=${encodeURIComponent(msg)}`;
  });

  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
