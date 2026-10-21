// Sanity checks for the Gutter Genie marketing site.
// Run with: node test/check.js  (or: npm test)
// Verifies contact links, the real rate card numbers, the no-em-dash rule,
// JSON-LD validity, estimator rate constants, and label/input pairing.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log('PASS ' + name); };
const bad = (name, detail) => { fail++; console.log('FAIL ' + name + (detail ? ' - ' + detail : '')); };
const check = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

// --- contact links ---
check('tel link present', html.includes('href="tel:+12049720325"'));
check('sms link present', html.includes('href="sms:+12049720325"'));
check('mailto link present', html.includes('href="mailto:guttergeniewpg@gmail.com"'));
check('og.png exists', existsSync(join(ROOT, 'og.png')), 'og.png missing');

// --- rate card honesty (must match the real ProQuote card) ---
check('rate: $1.75/ft cleaning', html.includes('$1.75'));
check('rate: $100 base fee', html.includes('$100'));
check('rate: $15 downspout', html.includes('$15'));
check('rate: $8.50/ft guards', html.includes('$8.50'));
check('deposit: 30%', html.includes('30%'));
check('no tax stated', /no tax/i.test(html));
check('travel: $45 Steinbach / $55 Grunthal', html.includes('$45') && html.includes('$55'));

// --- estimator uses the same constants as lib/pricing.js ---
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
for (const [label, re] of [
  ['est: perFoot 1.75', /perFoot\s*:\s*1\.75/],
  ['est: minimum 100', /minimum\s*:\s*100/],
  ['est: downspout 15', /downspout\s*:\s*15/],
  ['est: guardPerFoot 8.5', /guardPerFoot\s*:\s*8\.5/],
  ['est: storey multipliers 1.5/2.1', /storey2\s*:\s*1\.5/ && /storey3\s*:\s*2\.1/],
  ['est: condition multipliers 1.3/1.65', /condModerate\s*:\s*1\.3/ && /condHeavy\s*:\s*1\.65/],
  ['est: travel 45/55', /travelSteinbach\s*:\s*45/ && /travelGrunthal\s*:\s*55/]
]) check(label, re.test(script));

// --- house rules ---
check('no em dashes anywhere', !html.includes('—'), 'found an em dash');
check('no em dash entity either', !html.includes('&mdash;'));

// --- JSON-LD ---
const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
check('two JSON-LD blocks', ldBlocks.length === 2, 'found ' + ldBlocks.length);
let faqCount = 0;
for (const m of ldBlocks) {
  try {
    const doc = JSON.parse(m[1]);
    if (doc['@type'] === 'FAQPage') faqCount = (doc.mainEntity || []).length;
    ok('JSON-LD parses (' + doc['@type'] + ')');
  } catch (e) {
    bad('JSON-LD parses', String(e).slice(0, 120));
  }
}
check('FAQ schema has 6 questions', faqCount === 6, 'found ' + faqCount);
check('FAQ answers mention no tax', /no tax|does not charge tax/i.test(ldBlocks.map((m) => m[1]).join(' ')));

// --- accessibility basics ---
const inputIds = [...html.matchAll(/<input[^>]*id="([^"]+)"/g)].map((m) => m[1]);
const selectIds = [...html.matchAll(/<select[^>]*id="([^"]+)"/g)].map((m) => m[1]);
const labelFors = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map((m) => m[1]);
const unlabeled = [...inputIds, ...selectIds].filter((id) => !labelFors.includes(id));
check('every input/select has a label', unlabeled.length === 0, 'unlabeled: ' + unlabeled.join(','));
check('skip link present', html.includes('class="skip"'));
check('main landmark present', html.includes('<main>'));
check('estimate result has aria-live', html.includes('aria-live="polite"'));
check('faq buttons use aria-expanded', html.includes('aria-expanded="false"'));

// --- estimator math: execute the page's own script with a DOM stub ---------------
// Expected values verified against the real ProQuote engine (lib/pricing.js
// buildQuote subtotal = no-tax total): 120ft/1/light/4ds -> 270,
// 57ft Steinbach -> 145, 80ft moderate 2-storey Grunthal -> 328.
function makeStubDoc() {
  const els = {};
  const mk = (value = '') => ({
    value, textContent: '', innerHTML: '', href: '', style: {},
    listeners: {},
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    setAttribute() {}, getAttribute() { return 'false'; }
  });
  for (const id of ['estFeet', 'estStoreys', 'estCond', 'estDs', 'estGuards', 'estZone', 'estLines', 'estTotal', 'estTerms', 'estSms']) {
    els[id] = mk();
  }
  return { getElementById: (id) => els[id] || mk(), querySelectorAll: () => [], _els: els };
}
try {
  const doc = makeStubDoc();
  new Function('document', 'window', script)(doc, {});
  const set = (id, v) => { doc._els[id].value = v; };
  const fire = (id) => { for (const fn of doc._els[id].listeners.input || []) fn(); };
  const run = (feet, st, cond, ds, gf, zone) => {
    set('estFeet', feet); set('estStoreys', st); set('estCond', cond);
    set('estDs', ds); set('estGuards', gf); set('estZone', zone);
    fire('estFeet');
    return doc._els.estTotal.textContent;
  };
  check('estimator: 120ft + 4 downspouts = $270.00', run('120', '1', 'light', '4', '0', 'Winnipeg') === '$270.00', doc._els.estTotal.textContent);
  check('estimator: 57ft Steinbach = $145.00 (base fee + travel)', run('57', '1', 'light', '0', '0', 'Steinbach') === '$145.00');
  check('estimator: 80ft moderate 2-storey Grunthal = $328.00', run('80', '2', 'moderate', '0', '0', 'Grunthal') === '$328.00');
  check('estimator: empty inputs = $0.00', run('', '1', 'light', '', '', 'Winnipeg') === '$0.00');
  check('estimator: deposit terms shown', /30% deposit/.test(doc._els.estTerms.textContent), doc._els.estTerms.textContent);
  check('estimator: SMS link prefilled', doc._els.estSms.href.startsWith('sms:+12049720325?body='), doc._els.estSms.href.slice(0, 60));
} catch (e) {
  bad('estimator executes', String(e).slice(0, 160));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
