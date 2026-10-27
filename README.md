# Gutter Genie — customer landing page

Live: **https://guttergenie.pages.dev**

Mirror: https://jaykk99.github.io/gutter-genie-site/

Single-file static landing page for **Gutter Genie** (gutter cleaning & repair, Winnipeg MB).

- Pricing matches the real ProQuote rate card: $1.75/ft, $100 base fee, $15/downspout flush, $8.50/ft guard install, $45 Steinbach / $55 Grunthal travel, no tax, 30% deposit
- **Instant estimator** (`#estimate`): live quote widget using the exact rate card (feet, storeys, debris level, downspouts, guards, zone), with line-item breakdown, deposit math, and a "Text me this estimate" SMS prefill. Math cross-checked against the ProQuote engine.
- FAQ section + FAQPage/LocalBusiness JSON-LD schema
- How-it-works, service areas, sticky mobile call/text bar
- Accessibility: skip link, main landmark, labeled form controls, focus-visible rings, aria-live estimate result, keyboard-operable FAQ accordion, reduced-motion support
- CTAs: call, SMS (after-hours), email
- Contact: 204-972-0325 · guttergeniewpg@gmail.com
- No build step, no dependencies — just `index.html` + `og.png`
- Tests: `npm test` (36 checks: links, rate card, estimator math executed with a DOM stub, JSON-LD, a11y basics, no-em-dash rule)

## Deploy

Deploys automatically to GitHub Pages on every push to `master`
(`.github/workflows/pages.yml`).
