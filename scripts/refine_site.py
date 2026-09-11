"""Apply the original-photo layout once; preserve the approved service menu and policies."""
from pathlib import Path
from html import escape
import json
import re
from hashlib import sha256
from PIL import Image

root = Path(__file__).resolve().parents[1]
page = root / 'index.html'
html = page.read_text()
manifest_path = root / 'assets/images/manifest.json'
records = json.loads(manifest_path.read_text())
info = {r['name']: r for r in records}
# Preserve the supplied logo, including transparency. Make lossless small-screen variants.
logo = info['logo']
with Image.open(root / 'assets/images/logo.webp') as im:
    im.load()
    for width in (320, 640):
        path = root / f'assets/images/logo-{width}.webp'
        height = round(im.height * width / im.width)
        im.resize((width, height), Image.Resampling.LANCZOS).save(path, 'WEBP', lossless=True, method=6, exif=b'')
        logo['variants'] = [v for v in logo['variants'] if v['width'] != width]
        logo['variants'].append({'path': path.relative_to(root).as_posix(), 'width': width, 'height': height, 'sha256': sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size})
manifest_path.write_text(json.dumps(records, indent=2) + '\n')
if '<!-- Original photo layout v2 -->' in html:
    print('Layout already applied; assets verified.')
    raise SystemExit(0)

version = 'originals2'
def image(name, alt, sizes, eager=False, cls=''):
    rec = info[name]
    variants = sorted(rec['variants'], key=lambda v: v['width'])
    full = variants[-1]
    srcset = ', '.join(f"{v['path']}?v={version} {v['width']}w" for v in variants)
    return (f'<img class="{cls}" src="{full["path"]}?v={version}" srcset="{srcset}" '
            f'sizes="{escape(sizes, quote=True)}" width="{full["width"]}" height="{full["height"]}" '
            f'alt="{escape(alt, quote=True)}" loading="{"eager" if eager else "lazy"}" decoding="async"'
            + (' fetchpriority="high"' if eager else '') + '>')

def section(id):
    match = re.search(r'<section\b[^>]*\bid="' + id + r'"[^>]*>.*?</section>', html, re.S)
    if not match:
        raise ValueError('Missing existing section: ' + id)
    return match.group(0)

hero = '''<section class="hero hero-refined" aria-labelledby="hero-title">
<div class="hero-copy">
<p class="eyebrow">Coney Island, Brooklyn · Nails &amp; Waxing</p>
<h1 id="hero-title">Express yourself <em>beautifully.</em></h1>
<p class="hero-lede">Your shape. Your color. Your little details. Nail artistry and beauty care in our intimate, appointment-only Brooklyn studio.</p>
<div class="hero-actions"><a class="button primary" href="tel:+19297316733">Call to book <span aria-hidden="true">↗</span></a><a class="button ghost" href="#gallery">Explore the nail art</a></div>
<a class="hero-phone" href="tel:+19297316733">929-731-6733</a>
<p class="hero-location">2302 Mermaid Ave · Brooklyn, NY</p>
</div>
<figure class="hero-photo" data-parallax="0.035">''' + image('red-black', 'Glossy red and black nail art with nude French tips, by Joyful Expressions', '(max-width: 750px) calc(100vw - 36px), (max-width: 1400px) 48vw, 620px', True) + '''<figcaption><span>THE JOYFUL DETAILS</span><a href="#gallery">Discover your next set ↗</a></figcaption></figure>
</section>'''
strip = re.search(r'<section class="studio-strip".*?</section>', html, re.S)
if not strip:
    raise ValueError('Studio strip missing')
specials = section('specials')
specials = re.sub(r'<article class="special-card school reveal">(.*?)</article>', r'<template data-scheduled data-start="2026-09-01" data-end="2026-10-01"><article class="special-card school">\1</article></template>', specials, flags=re.S)
specials = re.sub(r'<article class="special-card october reveal" data-publish="2026-10-01">(.*?)</article>', r'<template data-scheduled data-start="2026-10-01" data-end="2026-11-01"><article class="special-card october">\1</article></template>', specials, flags=re.S)
specials = specials.replace('<div class="special-grid">', '<p class="schedule-note">Call the studio for current specials and availability.</p><div class="special-grid">')

items = [
 ('pastel-charms', 'Pastel charms', 'Long pink, blue and white nails with crystal and flower details'),
 ('white-floral', 'The floral French', 'White French tips with delicate green and black floral details'),
 ('hibiscus-french', 'Hand-painted hibiscus', 'Red hibiscus flowers and black-and-white striped French tips'),
 ('burgundy-stiletto', 'Sculpted stiletto', 'Pointed nude and burgundy stiletto nails with gold accents'),
 ('ladybug-french', 'Little garden details', 'Short French nails with ladybugs, daisies and green stems'),
 ('lavender-3d', 'Lavender in bloom', 'Lavender ombre nails with sculpted flowers, crystals and butterfly charms'),
 ('red-black', 'Red after dark', 'Glossy red and black patterned acrylic nails with nude French accents'),
 ('hero-crystal', 'Crystal French', 'Nude pink nails finished with iridescent crystal French tips'),
 ('blue-bows', 'Bows & little stars', 'Pale blue and white nail art with raised bows, flowers and gold stars'),
 ('pink-stripes', 'Graphic pink', 'Long pink nails with bold black striped French tips'),
 ('cherry-blossom', 'Cherry blossom', 'Pink blossom branches over nude and white French nails'),
 ('orange-stiletto', 'Peach statement', 'Peach-orange stiletto nails with striping and crystal accents'),
 ('hello-kitty', 'Playful pink', 'Extra-long pink character nails with charms and rhinestones'),
 ('red-floral', 'Red floral French', 'Red flowers painted over nude nails and graphic French tips'),
 ('mani-pedi', 'Hands & feet', 'Colorful short manicure paired with neon-yellow French pedicure')
]
cards = []
for i, (name, title, alt) in enumerate(items, 1):
    cards.append(f'<button type="button" class="gallery-item natural-card" data-full="assets/images/{name}.webp?v={version}" data-alt="{escape(alt, quote=True)}" aria-label="View {escape(title, quote=True)} in full size">'
                 + image(name, alt, '(max-width: 650px) calc((100vw - 46px) / 2), (max-width: 1000px) 45vw, 400px')
                 + f'<span class="photo-caption"><span>{title}</span><span aria-hidden="true">↗</span></span></button>')
gallery = '<section id="gallery" class="gallery section-pad"><div class="section-head"><div><p class="eyebrow">The work, up close</p><h2>Real nails.<br><em>Joyful details.</em></h2></div><p>Explore the studio\'s nail art, from a classic French to crystals and sculpted flowers. Tap any photograph to see the complete set.</p></div><div class="gallery-grid">' + '\n'.join(cards) + '</div><p class="gallery-footnote">Photographs of the studio\'s work. Bring your favorite as inspiration when you call to book.</p></section>'
careers = section('careers')
careers = re.sub(r'<div class="careers-bg.*?</div>', '', careers, flags=re.S)
careers = careers.replace('</section>', '<figure class="careers-visual">' + image('hero-crystal', 'Crystal French nail art by Joyful Expressions', '(max-width: 750px) calc(100vw - 36px), 440px') + '</figure></section>')
main = '\n'.join([hero, strip.group(0), specials, gallery, section('services'), section('policies'), careers, section('visit')])
html, n = re.subn(r'<main id="main">.*?</main>', '<main id="main">\n<!-- Original photo layout v2 -->\n' + main + '\n</main>', html, count=1, flags=re.S)
assert n == 1
# Replace all previously broken logo references with responsive, lossless versions.
html = re.sub(r'<img\b[^>]*src="assets/images/logo.webp"[^>]*>', lambda _: image('logo', 'Joyful Expressions Nails & Waxing', '(max-width: 650px) 240px, 320px'), html)
html = html.replace('<img class="" src="assets/images/logo.webp', '<img class="brand-image" src="assets/images/logo.webp')
html = html.replace('<a href="#services">Services</a>', '<a href="#top">Home</a><a href="#services">Services</a>')
html = html.replace('<meta property="og:image" content="assets/images/logo.webp" />', '<meta property="og:image" content="https://anharmoniclabs.github.io/JoyfulExpressions/assets/images/hero-crystal.webp?v=originals2" />')
html = html.replace('<link rel="stylesheet" href="assets/styles.css" />', '<link rel="canonical" href="https://anharmoniclabs.github.io/JoyfulExpressions/" />\n<link rel="stylesheet" href="assets/styles.css?v=originals2" />\n<link rel="stylesheet" href="assets/refined.css?v=originals2" />')
html = html.replace('src="assets/script.js"', 'src="assets/script.js?v=originals2"')
html = re.sub(r'<dialog class="lightbox".*?</dialog>', '<dialog class="lightbox" id="lightbox" aria-labelledby="lightbox-caption"><div class="viewer-toolbar"><span id="viewer-count"></span><button type="button" class="lightbox-close" aria-label="Close full-size photograph">×</button></div><img alt="" id="viewer-photo"><p id="lightbox-caption"></p><div class="viewer-controls"><button type="button" id="viewer-prev" aria-label="Previous photograph">← Previous</button><button type="button" id="viewer-next" aria-label="Next photograph">Next →</button></div></dialog>', html, count=1, flags=re.S)
page.write_text(html + '\n')
print('Applied: original logo, responsive hero, 15 uncropped photographs, full-size viewer, call-only booking, date-gated specials.')
