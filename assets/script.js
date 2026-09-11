(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 1000px)');
  const syncMenu = (open = false) => {
    nav?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open && mobile.matches);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (nav) nav.inert = mobile.matches && !open;
  };
  toggle?.addEventListener('click', () => syncMenu(!nav?.classList.contains('open')));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => syncMenu(false)));
  mobile.addEventListener('change', () => syncMenu(false));
  syncMenu(false);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) { syncMenu(false); toggle?.focus(); }
    if (e.key === 'Tab' && mobile.matches && nav?.classList.contains('open')) {
      const links = [...nav.querySelectorAll('a')];
      const first = toggle, last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  });
  // Photo movement is small, bounded, integer-pixel, and disabled for touch/reduced motion.
  const motion = matchMedia('(min-width: 1001px) and (pointer: fine)');
  const photos = [...document.querySelectorAll('[data-parallax]')];
  let frame = 0;
  const update = () => {
    frame = 0;
    header?.classList.toggle('scrolled', scrollY > 30);
    for (const photo of photos) {
      if (reduced.matches || !motion.matches) { photo.style.transform = ''; continue; }
      const parent = photo.parentElement.getBoundingClientRect();
      if (parent.bottom < 0 || parent.top > innerHeight) continue;
      const offset = Math.round(Math.max(-14, Math.min(14, -parent.top * .035)));
      photo.style.transform = `translateY(${offset}px)`;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', schedule);
  motion.addEventListener('change', schedule);
  update();

  const dialog = document.querySelector('#lightbox');
  const full = document.querySelector('#viewer-photo');
  const caption = document.querySelector('#lightbox-caption');
  const count = document.querySelector('#viewer-count');
  const cards = [...document.querySelectorAll('.gallery-item')];
  let active = 0, opener;
  const show = (index) => {
    active = (index + cards.length) % cards.length;
    const card = cards[active];
    full.src = card.dataset.full;
    full.alt = card.dataset.alt || '';
    caption.textContent = full.alt;
    count.textContent = `${active + 1} / ${cards.length}`;
  };
  cards.forEach((card, index) => card.addEventListener('click', () => {
    if (!dialog || !full || !caption || !count) return;
    opener = card;
    show(index);
    if (typeof dialog.showModal === 'function') { dialog.showModal(); document.body.style.overflow = 'hidden'; }
    else window.open(card.dataset.full, '_blank', 'noopener');
  }));
  document.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  document.querySelector('#viewer-prev')?.addEventListener('click', () => show(active - 1));
  document.querySelector('#viewer-next')?.addEventListener('click', () => show(active + 1));
  dialog?.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog?.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(active - 1); }
  });
  dialog?.addEventListener('close', () => { document.body.style.overflow = ''; opener?.focus(); });
  full?.addEventListener('error', () => { if (caption) caption.textContent = 'This photograph could not load. Please close it and try again.'; });

  // Future specials are inert templates, never briefly displayed before this code runs.
  // Dates follow the studio's New York timezone, not the visitor's timezone.
  let renderedDay;
  const renderOffers = () => {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const get = type => parts.find(p => p.type === type)?.value;
    const day = `${get('year')}-${get('month')}-${get('day')}`;
    if (day === renderedDay) return;
    renderedDay = day;
    document.querySelectorAll('.published-promo').forEach(card => card.remove());
    let shown = 0;
    document.querySelectorAll('template[data-scheduled]').forEach(template => {
      if (day < template.dataset.start || day >= template.dataset.end) return;
      const fragment = template.content.cloneNode(true);
      fragment.firstElementChild?.classList.add('published-promo');
      template.after(fragment);
      shown++;
    });
    const note = document.querySelector('.schedule-note');
    if (note) note.hidden = shown > 0;
  };
  renderOffers();
  setInterval(renderOffers, 60000);
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
