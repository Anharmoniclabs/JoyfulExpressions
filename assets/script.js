(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 35);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    document.body.classList.toggle('menu-open', !!open);
    toggle.setAttribute('aria-expanded', String(!!open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  if (!reduced) {
    const items = [...document.querySelectorAll('[data-parallax]')];
    let ticking = false;
    const update = () => {
      items.forEach(el => {
        const rect = el.parentElement?.getBoundingClientRect();
        if (!rect || rect.bottom < -200 || rect.top > innerHeight + 200) return;
        const speed = Number(el.dataset.parallax || 0.06);
        const centerDelta = (rect.top + rect.height / 2) - innerHeight / 2;
        el.style.transform = `translate3d(0, ${centerDelta * speed}px, 0) scale(1.035)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  const lightbox = document.querySelector('#lightbox');
  const lbImg = lightbox?.querySelector('img');
  const lbText = lightbox?.querySelector('p');
  document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
    if (!lightbox || !lbImg || !lbText) return;
    lbImg.src = item.dataset.full || item.querySelector('img')?.src || '';
    lbImg.alt = item.dataset.alt || '';
    lbText.textContent = item.dataset.alt || '';
    lightbox.showModal();
  }));
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  document.querySelectorAll('[data-publish]').forEach(card => {
    const publish = new Date(`${card.dataset.publish}T00:00:00`);
    if (today < publish) card.classList.add('future-hidden');
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
