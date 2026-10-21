'use strict';
/*
 * Gutter Genie instant estimate calculator.
 * Rates match the owner-verified rate card (2026-10-18). Do not change rates here
 * without the owner confirming a new card.
 *   - Gutter cleaning: $1.75 per linear foot, $100 minimum charge (base fee)
 *   - 3-story homes: per-foot rate +50% -> $2.63/ft (minimum charge still $100)
 *   - Downspout flush: $15 each
 *   - Guard installation: $8.50 per foot
 *   - Travel: Steinbach $45, Grunthal $55, Winnipeg $0 (Selkirk/Stonewall/other: ask)
 *   - 30% deposit to book, balance on completion. No tax.
 */
var RATE_CARD = {
  cleaningPerFoot: 1.75,
  cleaningPerFootThreeStory: 2.63,
  cleaningMinimum: 100,
  flushEach: 15,
  guardPerFoot: 8.50,
  travel: { winnipeg: 0, steinbach: 45, grunthal: 55 },
  depositPct: 0.30
};

function money(n) {
  return '$' + n.toFixed(2);
}

function calcEstimate(opts) {
  var feet = Math.max(0, Number(opts.feet) || 0);
  var flushes = Math.max(0, Math.floor(Number(opts.flushes) || 0));
  var guardFeet = Math.max(0, Number(opts.guardFeet) || 0);
  var stories = opts.stories === '3' ? '3' : (opts.stories === '2' ? '2' : '1');
  var area = String(opts.area || 'winnipeg').toLowerCase();

  var lines = [];

  var cleaning = 0;
  if (feet > 0) {
    var rate = stories === '3' ? RATE_CARD.cleaningPerFootThreeStory : RATE_CARD.cleaningPerFoot;
    var raw = feet * rate;
    cleaning = Math.max(RATE_CARD.cleaningMinimum, raw);
    var desc = 'Gutter cleaning (' + feet + ' ft';
    if (stories === '3') desc += ', 3-story rate $2.63/ft';
    else desc += ', $1.75/ft';
    desc += ')';
    lines.push({ label: desc, amount: cleaning });
  }

  var flushTotal = flushes * RATE_CARD.flushEach;
  if (flushTotal > 0) {
    lines.push({ label: 'Downspout flush x ' + flushes + ' ($15 each)', amount: flushTotal });
  }

  var guardTotal = guardFeet * RATE_CARD.guardPerFoot;
  if (guardTotal > 0) {
    lines.push({ label: 'Guard installation (' + guardFeet + ' ft @ $8.50/ft)', amount: guardTotal });
  }

  var travel = 0;
  var travelNote = '';
  if (area === 'steinbach') {
    travel = RATE_CARD.travel.steinbach;
    lines.push({ label: 'Travel fee (Steinbach)', amount: travel });
  } else if (area === 'grunthal') {
    travel = RATE_CARD.travel.grunthal;
    lines.push({ label: 'Travel fee (Grunthal)', amount: travel });
  } else if (area === 'other') {
    travelNote = 'Travel fee: ask, depends on distance from Winnipeg.';
  }

  var total = lines.reduce(function (sum, l) { return sum + l.amount; }, 0);
  var deposit = total * RATE_CARD.depositPct;

  return { lines: lines, total: total, deposit: deposit, travelNote: travelNote };
}

function runEstimate() {
  var errorEl = document.getElementById('calc-error');
  var resultEl = document.getElementById('calc-result');
  errorEl.style.display = 'none';

  var feet = document.getElementById('calc-feet').value;
  var stories = document.querySelector('input[name="stories"]:checked');
  var area = document.getElementById('calc-area').value;
  var flushes = document.getElementById('calc-flushes').value;
  var guardFeet = document.getElementById('calc-guard-feet').value;

  if (feet !== '' && Number(feet) < 0) {
    errorEl.textContent = 'Gutter length cannot be negative.';
    errorEl.style.display = 'block';
    return;
  }

  var est = calcEstimate({
    feet: feet, flushes: flushes, guardFeet: guardFeet,
    stories: stories ? stories.value : '1', area: area
  });

  if (est.total <= 0) {
    errorEl.textContent = 'Enter a gutter length, some downspout flushes, or guard feet to get an estimate.';
    errorEl.style.display = 'block';
    resultEl.classList.remove('show');
    return;
  }

  var html = '';
  est.lines.forEach(function (l) {
    html += '<div class="line"><span>' + escapeHtml(l.label) + '</span><span>' + money(l.amount) + '</span></div>';
  });
  html += '<div class="line total"><span>Estimated total</span><b>' + money(est.total) + '</b></div>';
  html += '<div class="line"><span>Deposit to book (30%)</span><span>' + money(est.deposit) + '</span></div>';
  if (est.travelNote) {
    html += '<div class="line"><span>' + escapeHtml(est.travelNote) + '</span></div>';
  }
  html += '<p class="fine" style="margin-top:12px">Ballpark only. Exact written quote at the free inspection. No tax.</p>';

  resultEl.innerHTML = html;
  resultEl.classList.add('show');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('calc-button');
    if (btn) btn.addEventListener('click', runEstimate);
    var form = document.getElementById('calc-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); runEstimate(); });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcEstimate: calcEstimate, RATE_CARD: RATE_CARD, money: money };
}
