(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Never show broken logo icons. Until the binary logo asset is committed,
  // render a polished wordmark fallback that matches the Joyful aesthetic.
  const fallbackStyle = document.createElement('style');
  fallbackStyle.textContent = `
    .joyful-wordmark{display:inline-flex;flex-direction:column;line-height:.84;color:#fff;text-shadow:0 8px 24px rgba(0,0,0,.35)}
    .joyful-wordmark .joyful-script{font-family:Georgia,serif;font-style:italic;font-weight:700;font-size:clamp(28px,4vw,58px);color:#ff4d97;letter-spacing:-.055em}
    .joyful-wordmark .joyful-expressions{font-size:9px;font-weight:900;letter-spacing:.42em;text-transform:uppercase;margin-top:8px;color:#fff}
    .brand .joyful-wordmark .joyful-script{font-size:30px}
    .brand .joyful-wordmark .joyful-expressions{font-size:7px;letter-spacing:.28em;margin-top:4px}
    .footer-brand .joyful-wordmark .joyful-script,.careers-card .joyful-wordmark .joyful-script,.visit-logo .joyful-wordmark .joyful-script{font-size:46px}
    .visit-logo .joyful-wordmark{align-items:center;text-align:center}
  `;
  document.head.appendChild(fallbackStyle);

  const makeWordmark = () => {
    const span = document.createElement('span');
    span.className = 'joyful-wordmark';
    span.innerHTML = '<span class="joyful-script">Joyful</span><span class="joyful-expressions">Expressions</span>';
    return span;
  };

  document.querySelectorAll('img[src$="logo.webp"]').forEach(img => {
    const replace = () => img.replaceWith(makeWordmark());
    img.addEventListener('error', replace, { once: true });
    if (img.complete && img.naturalWidth === 0) replace();
  });

  // Hero fallback: prefer the red/black set, but never leave a blank hero.
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia) {
    const probe = new Image();
    probe.onerror = () => { heroMedia.style.backgroundImage = "url('assets/images/hero-crystal.webp')"; };
    probe.src = 'assets/images/red-black.webp';
  }

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
