# Joyful Expressions Nails & Waxing

Responsive, appointment-only salon website for Joyful Expressions, 2302 Mermaid Ave, Brooklyn, NY. Book by calling 929-731-6733.

## Production assets

All 15 client photographs and the supplied logo are actual binary files in `assets/images/`. No production image is reconstructed from base64, fetched from a temporary upload service, or substituted with generated portfolio work.

Photographs preserve their source dimensions (1319–1320 pixels wide) in the full-size WebP. Each also has 480px and 800px variants. The supplied 2048 × 1524 logo has lossless WebP variants and a PNG copy. EXIF metadata is not included in the exports. `assets/images/manifest.json` records dimensions, source hashes and export hashes.

The hero is constrained to an appropriately sized column rather than stretched across the screen. Gallery images retain their natural aspect ratios. The full-size viewer opens the full-resolution file, supports previous/next buttons and keyboard navigation, and returns focus on close.

## Editing

- Business copy, prices, policies and gallery markup: `index.html`.
- General layout: `assets/styles.css`.
- Original-photo layout and responsive refinements: `assets/refined.css`.
- Navigation, lightbox, restrained parallax and timed offers: `assets/script.js`.
- Image files and their integrity records: `assets/images/`.

When replacing images, regenerate the small variants and update the manifest hashes/dimensions and matching `srcset`/intrinsic dimensions. Validation intentionally rejects changed or missing image assets until their records are updated. Do not restore the removed `assets/encoded/` workaround.

## Test locally

```sh
python -m pip install Pillow==12.3.0
python scripts/validate_site.py
node --check assets/script.js
python -m http.server 8000
```

## Deployment

The GitHub Actions workflow validates decoded images, hashes, intrinsic dimensions, local asset references, section anchors and JavaScript syntax before publishing a clean `_site` artifact. Push to `main` to run it. Configure repository Settings → Pages → Source to **GitHub Actions** so a legacy branch deployment does not run alongside the validated workflow.

## Promotions and privacy

September's $29.99 regular mani + pedi offer is for students and teachers; teachers need valid work ID and gel/designs cost extra. The October promotion is an inert HTML template and becomes visible at October 1, 2026, midnight in America/New_York. Both monthly offers expire automatically. Before JavaScript runs, no future offer card is rendered. Because the repository is public, template text is not confidential or embargo-protected source material.

There is no appointment form, payment collection, customer database, analytics integration or third-party font dependency. Booking remains by telephone. No age cutoff has been invented for the client's no-kids policy.
