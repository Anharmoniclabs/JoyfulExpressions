# Custom domain setup

The site is designed to deploy automatically from GitHub Actions. Keep the domain in the business owner's own registrar account.

When the final domain is purchased:

1. In GitHub, open **Settings → Pages → Custom domain** and enter the domain.
2. For an apex domain such as `joyfulexpressionsnails.com`, create the GitHub Pages A/AAAA DNS records shown by GitHub.
3. For `www`, add a CNAME pointing to `anharmoniclabs.github.io`.
4. Enable **Enforce HTTPS** after DNS verification completes.
5. Update `sitemap.xml`, Open Graph metadata if needed, and add a root `CNAME` file containing the final domain.

Do not put customer payment data, appointment records, or private client information in this repository. The current booking flow creates an SMS request directly to the business phone and stores nothing on GitHub.
