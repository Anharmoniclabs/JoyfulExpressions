(() => {
  'use strict';
  const salonPalette = document.createElement('link');
  salonPalette.rel = 'stylesheet';
  salonPalette.href = 'assets/salon-palette.css?v=salon-gray-pink-1';
  document.head.appendChild(salonPalette);

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

  // Client-final business identity and presentation.
  const LEGAL_NAME = 'JOYFUL EXPRESSIONS NAILS & WAXING INC.';
  const LEGAL_STREET = '2302 MERMAID AVE #3';
  const LEGAL_CITY = 'BROOKLYN, NY 11224-2208';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#727074');
  const structured = document.querySelector('script[type="application/ld+json"]');
  if (structured) {
    try {
      const data = JSON.parse(structured.textContent);
      data.legalName = LEGAL_NAME;
      data.address = {
        '@type': 'PostalAddress',
        streetAddress: LEGAL_STREET,
        addressLocality: 'Brooklyn',
        addressRegion: 'NY',
        postalCode: '11224-2208',
        addressCountry: 'US'
      };
      structured.textContent = JSON.stringify(data);
    } catch (_) { /* keep the existing valid structured data if parsing ever changes */ }
  }
  const footer = document.querySelector('.footer');
  if (footer && !footer.querySelector('.legal-business')) {
    const legal = document.createElement('div');
    legal.className = 'legal-business';
    legal.setAttribute('aria-label', 'Legal business information');
    legal.innerHTML = `<strong>${LEGAL_NAME}</strong><span>${LEGAL_STREET}</span><span>${LEGAL_CITY}</span>`;
    const copyright = footer.querySelector('.copyright');
    footer.insertBefore(legal, copyright || null);
  }

  // Use the logo once as the primary brand mark. Replace repeat-logo areas with work.
  const duplicateHiringLogo = document.querySelector('#careers .careers-card > .brand-image');
  duplicateHiringLogo?.remove();

  const footerBrand = document.querySelector('.footer-brand');
  if (footerBrand) {
    footerBrand.querySelector('.brand-image')?.remove();
    if (!footerBrand.querySelector('.footer-wordmark')) {
      const wordmark = document.createElement('div');
      wordmark.className = 'footer-wordmark';
      wordmark.innerHTML = '<strong>Joyful Expressions</strong><span>Nails & Waxing</span>';
      footerBrand.prepend(wordmark);
    }
  }

  const logoCard = document.querySelector('.visit-logo');
  if (logoCard) {
    logoCard.classList.add('visit-gallery-card');
    logoCard.innerHTML = `
      <figure class="mini-nail main-shot">
        <img src="assets/images/lavender-3d-800.webp?v=originals2" srcset="assets/images/lavender-3d-480.webp?v=originals2 480w, assets/images/lavender-3d-800.webp?v=originals2 800w" sizes="(max-width:650px) 58vw, 330px" width="800" height="933" alt="Lavender 3D flower and crystal nail set" loading="lazy" decoding="async">
      </figure>
      <figure class="mini-nail side-shot top-shot">
        <img src="assets/images/ladybug-french-480.webp?v=originals2" width="480" height="543" alt="Ladybug and daisy French nail set" loading="lazy" decoding="async">
      </figure>
      <figure class="mini-nail side-shot bottom-shot">
        <img src="assets/images/hibiscus-french-480.webp?v=originals2" width="480" height="559" alt="Red hibiscus French nail art" loading="lazy" decoding="async">
      </figure>
      <div class="work-card-label"><span>More Joyful work</span><strong>Every set has its own mood.</strong><a href="#gallery">View full gallery →</a></div>`;
  }

  const cardStyles = document.createElement('style');
  cardStyles.textContent = `
    .visit-gallery-card{position:relative;display:grid!important;grid-template-columns:1.35fr .85fr;grid-template-rows:1fr 1fr;gap:10px;min-height:430px!important;padding:10px!important;background:#d8d5d6!important;overflow:hidden}
    .visit-gallery-card .mini-nail{margin:0;overflow:hidden;border-radius:18px;background:#c9c5c7;min-width:0;min-height:0}
    .visit-gallery-card .main-shot{grid-row:1/3}
    .visit-gallery-card .mini-nail img{width:100%;height:100%;object-fit:cover;display:block}
    .visit-gallery-card .main-shot img{object-position:center 48%}
    .visit-gallery-card .top-shot img{object-position:center 40%}
    .visit-gallery-card .bottom-shot img{object-position:center 45%}
    .visit-gallery-card .work-card-label{position:absolute;left:24px;bottom:24px;max-width:245px;padding:15px 17px;border-radius:17px;background:rgba(251,250,248,.94);box-shadow:0 12px 35px rgba(72,70,72,.16);backdrop-filter:blur(12px);color:#302d30}
    .visit-gallery-card .work-card-label span{display:block;color:#b70d57;text-transform:uppercase;letter-spacing:.16em;font-size:9px;font-weight:900}
    .visit-gallery-card .work-card-label strong{display:block;font:600 19px/1.12 Georgia,serif;margin:5px 0 9px}
    .visit-gallery-card .work-card-label a{font-size:11px;font-weight:800;color:#4f4d51}
    .footer-wordmark{margin-bottom:13px}.footer-wordmark strong{display:block;font:italic 700 30px/1 Georgia,serif;color:#fff}.footer-wordmark span{display:block;margin-top:7px;text-transform:uppercase;letter-spacing:.17em;font-size:9px;font-weight:800;color:#f1dfe5}
    #careers .careers-card{padding-top:4px}
    @media(max-width:650px){.visit-gallery-card{min-height:330px!important;grid-template-columns:1.2fr .8fr}.visit-gallery-card .work-card-label{left:18px;bottom:18px;max-width:205px;padding:12px 14px}.visit-gallery-card .work-card-label strong{font-size:16px}}
  `;
  document.head.appendChild(cardStyles);

  // The owner asked for the hiring callout to be the last promotional block.
  const careers = document.querySelector('#careers');
  const visit = document.querySelector('#visit');
  if (careers && visit && careers.compareDocumentPosition(visit) & Node.DOCUMENT_POSITION_FOLLOWING) {
    visit.after(careers);
  }

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
