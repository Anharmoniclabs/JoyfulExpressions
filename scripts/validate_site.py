"""Validate real decoded images, their dimensions/hashes, and every local page asset."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from hashlib import sha256
import json
import re
from PIL import Image

root = Path(__file__).resolve().parents[1]
records = json.loads((root / 'assets/images/manifest.json').read_text())
assert len(records) == 16, 'Expect 15 real client photos plus logo'
count = 0
for rec in records:
    assert rec['source_width'] >= 1000
    variants = rec['variants']
    assert max(v['width'] for v in variants) == rec['source_width'], rec['name']
    for variant in variants:
        path = root / variant['path']
        assert path.is_file(), f'Missing: {path}'
        assert sha256(path.read_bytes()).hexdigest() == variant['sha256'], f'Changed/corrupt image: {path}'
        with Image.open(path) as image:
            image.load()
            assert image.size == (variant['width'], variant['height']), path
            assert image.width <= rec['source_width'], f'Artificial upscale: {path}'
        count += 1
with Image.open(root / 'assets/images/logo.png') as logo:
    logo.load()
    assert logo.size == (2048, 1524)

refs = []
anchors = set()
links = []
class Assets(HTMLParser):
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): anchors.add(a['id'])
        if a.get('href', '').startswith('#'): links.append(a['href'][1:])
        for attr in ('src', 'data-full'):
            if a.get(attr): refs.append((a[attr], root))
        if a.get('srcset'):
            for candidate in a['srcset'].split(','): refs.append((candidate.strip().split()[0], root))
        if tag == 'link' and a.get('rel') in ('stylesheet', 'icon'):
            refs.append((a['href'], root))
        if tag == 'img' and a.get('src'):
            assert 'alt' in a and 'width' in a and 'height' in a, 'Images need text and intrinsic dimensions'

html = (root / 'index.html').read_text()
Assets().feed(html)
for css in (root / 'assets').glob('*.css'):
    refs.extend((url, css.parent) for url in re.findall(r'url\([\"\']?([^\)\"\']+)', css.read_text()))
for url, base in refs:
    parsed = urlsplit(url)
    if parsed.scheme or url.startswith('//') or url.startswith('#'): continue
    path = (base / unquote(parsed.path)).resolve()
    assert path.is_relative_to(root) and path.is_file(), f'Broken local asset: {url}'
for anchor in links:
    assert not anchor or anchor in anchors, f'Broken anchor: #{anchor}'
assert html.count('class="gallery-item natural-card"') == 15
assert 'sms:' not in html and 'booking-form' not in html
assert 'logo.webp?v=originals2' in html
print(f'PASS: {count} decoded/hash-verified responsive image files, original PNG logo, 15 gallery entries, {len(refs)} local asset references, and all section links.')
