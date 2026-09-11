"""One-time, hash-verified import of client-supplied photographs. Never generates image content."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
import json
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
records = json.loads((ROOT / 'scripts' / 'photo-import.json').read_text())
assert len(records) == 16 and len({r['name'] for r in records}) == 16

def transfer(record):
    name = record['name']
    assert re.fullmatch(r'[a-z0-9-]+', name), 'Invalid asset name'
    assert urlparse(record['url']).hostname == 'd2ol7oe51mr4n9.cloudfront.net'
    req = Request(record['url'], headers={'User-Agent': 'JoyfulExpressions-AssetImport/1.0'})
    with urlopen(req, timeout=45) as response:
        raw = response.read(12_000_001)
    assert len(raw) <= 12_000_000
    assert sha256(raw).hexdigest() == record['sha256'], f'Source integrity failed: {name}'
    with Image.open(BytesIO(raw)) as opened:
        opened.load()
        im = ImageOps.exif_transpose(opened).convert('RGBA' if name == 'logo' else 'RGB')
    assert im.width >= 1000 and im.height >= 1000, f'Undersized original: {name}'
    sizes = [im.width] if name == 'logo' else [480, 800, im.width]
    variants = []
    for width in sorted(set(sizes)):
        assert width <= im.width
        height = round(im.height * width / im.width)
        resized = im if width == im.width else im.resize((width, height), Image.Resampling.LANCZOS)
        suffix = '' if width == im.width else f'-{width}'
        target = OUT / f'{name}{suffix}.webp'
        resized.save(target, 'WEBP', quality=92, method=6, lossless=(name == 'logo'), exif=b'')
        with Image.open(target) as check:
            check.load()
            assert check.size == (width, height)
        variants.append({'path': target.relative_to(ROOT).as_posix(), 'width': width, 'height': height, 'sha256': sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size})
    if name == 'logo':
        im.save(OUT / 'logo.png', 'PNG', optimize=True)
    print(f'IMPORTED {name}: {im.width}x{im.height}; {len(variants)} validated variants', flush=True)
    return {'name': name, 'source_sha256': record['sha256'], 'source_width': im.width, 'source_height': im.height, 'variants': variants}

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(transfer, records))
(OUT / 'manifest.json').write_text(json.dumps(results, indent=2) + '\n')
print('PASS: 15 client photographs plus original logo, with full decoded-image verification.')
