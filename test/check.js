// Sanity checks for the Gutter Genie marketing site.
// Run with: node test/check.js  (or: npm test)
// Tests the RESTORED Aug 2026 charcoal/red UI (index.html at repo root),
// which Jay restored on 2026-10-27. That design has no estimator, no FAQ
// accordion and no JSON-LD, so this suite checks what the live page actually
// promises: contact links, branding/theme, page structure, the seasonal
// price cards (Christmas lights + roof snow removal), and the no-em-dash rule. Do not re-add estimator/JSON-LD checks unless the page
// gets those features back.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log('PASS ' + name); };
const bad = (name, detail) => { fail++; console.log('FAIL ' + name + (detail ? ' - ' + detail : '')); };
const check = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

// --- contact links (canonical +1 format, house style) ---
check('tel link present (+1 format)', html.includes('href="tel:+12049720325"'));
check('no bare tel: links without +1', !/href="tel:1\d{10}"/.test(html));
check('sms link present (+1 format)', html.includes('href="sms:+12049720325"'));
check('no bare sms: links without +1', !/href="sms:1\d{10}"/.test(html));
check('mailto link present', html.includes('href="mailto:guttergeniewpg@gmail.com"'));
check('phone number shown', html.includes('204-972-0325'));
check('email address shown', html.includes('guttergeniewpg@gmail.com'));
check('og.png exists', existsSync(join(ROOT, 'og.png')), 'og.png missing');

// --- page identity ---
check('title names GutterGenie', /<title>GutterGenie[^<]*<\/title>/.test(html));
check('meta description present', html.includes('name="description"'));
check('lang attribute present', html.includes('<html lang="en">'));

// --- structure of the restored design ---
check('main landmark present', /<main[\s>]/.test(html));
check('hero section present', html.includes('<section class="hero"'));
check('services section present', html.includes('<section class="services"'));
check('service area section present', html.includes('<section class="area"'));
check('footer present', html.includes('<footer>'));
check('service areas list Winnipeg / Steinbach / Grunthal',
  html.includes('Winnipeg') && html.includes('Steinbach') && html.includes('Grunthal'));

// --- winter & holiday services (added Nov 2026) ---
check('seasonal section present', html.includes('<section class="seasonal" id="seasonal"'));
check('Christmas light hanging listed', html.includes('Christmas Light Hanging'));
check('roof snow removal listed', html.includes('Roof Snow Removal'));
check('lights pricing shown', html.includes('$3 / ft') && html.includes('$6 / ft'));
check('snow pricing shown', html.includes('$75 to $100 / hr') && html.includes('$150 to $350'));
check('seasonal sms CTAs use +1 format', (html.match(/href="sms:\+12049720325\?body=/g) || []).length === 2);

// --- charcoal/red theme (the restored design) ---
check('charcoal background color', html.includes('#0A0B0D'));
check('brand red present', html.includes('#B23028'));
check('Oswald display font', html.includes('Oswald'));

// --- house rules ---
const EM_DASH = '\u2014'; // U+2014 written as an escape so this file holds no literal em dash
check('no em dashes anywhere', !html.includes(EM_DASH), 'found an em dash');
check('no em dash entity either', !html.includes('&mdash;'));

// --- accessibility basics that the restored design actually has ---
check('decorative SVGs hidden from AT', html.includes('aria-hidden="true"'));
check('every img has alt or is decorative', !/<img(?![^>]*alt=)/.test(html));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
