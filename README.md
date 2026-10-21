# Gutter Genie - customer website

Static multi-page website for **Gutter Genie** (gutter cleaning & repair, Winnipeg MB).
No build step, no dependencies, no backend.

## Pages

- `index.html` - home: services, pricing, areas, contact (JSON-LD LocalBusiness schema)
- `estimate.html` - instant estimate calculator (`estimate.js` runs the owner rate card)
- `quote.html` - quote request form; builds a `mailto:` to guttergeniewpg@gmail.com (`quote.js`)
- `faq.html` - FAQ with FAQPage schema markup
- `services/cleaning.html`, `downspouts.html`, `guards.html`, `repairs.html`, `replacement.html` - service detail pages with per-service schema
- `areas/steinbach.html`, `areas/grunthal.html` - service-area pages with travel fees
- `sitemap.xml`, `robots.txt`, `styles.css` (shared stylesheet), `og.png`

## Rate card (owner-verified, keep in sync)

- Gutter cleaning: $1.75/ft, $100 minimum charge
- 3-story cleaning: $2.63/ft (per-foot rate +50%)
- Downspout flush: $15 each
- Guard installation: $8.50/ft
- Travel: Steinbach $45, Grunthal $55 (Winnipeg free)
- Deposit: 30% to book, balance on completion. No tax.

Rates live in three places that must agree: `index.html` pricing band,
`estimate.js` (`RATE_CARD`), and `estimate.html` rate table.

## Contact

- Phone: 204-972-0325 (call, SMS)
- Email: guttergeniewpg@gmail.com

## Deploy

Deploys automatically to GitHub Pages on every push to `master`
(`.github/workflows/pages.yml`). Live at:

**https://jaykk99.github.io/gutter-genie-site/**

Cloudflare Pages mirror: **guttergenie.pages.dev**
