# Gutter Genie — customer landing page

Live: **https://guttergenie.pages.dev**

Mirror: https://jaykk99.github.io/gutter-genie-site/

Single-file static landing page for **Gutter Genie** (gutter cleaning & repair, Winnipeg MB).

Restored Oct 27, 2026 to the original Aug 2026 charcoal/red design ("GutterGenie, Keep the Flow Going"). That design has no estimator, no FAQ and no JSON-LD; pricing lives in the ProQuote app, not on this page.

- Charcoal `#0A0B0D` / red `#B23028` / `#E2483A`, Oswald/Inter/JetBrains Mono
- Hero, services, service areas, why-us, CTA banner, footer
- Sticky mobile call/text bar
- Accessibility: main landmark, decorative SVGs hidden from assistive tech
- CTAs: call, SMS, email (footer)
- Contact: 204-972-0325 · guttergeniewpg@gmail.com
- No build step, no dependencies — just `index.html` + `og.png`
- Tests: `npm test` (24 checks: contact links in canonical +1 format, page structure, charcoal/red theme markers, a11y basics, no-em-dash rule)

## Deploy

Deploys automatically to GitHub Pages on every push to `master`
(`.github/workflows/pages.yml`).
