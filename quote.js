'use strict';
/*
 * Gutter Genie quote-request form.
 * Builds a mailto: link with the request details filled in, so the visitor's own
 * email app sends it to guttergeniewpg@gmail.com. No backend, no data stored.
 */
var QUOTE_EMAIL = 'guttergeniewpg@gmail.com';

var SERVICE_LABELS = {
  cleaning: 'Gutter cleaning',
  downspouts: 'Downspout clearing / flush',
  guards: 'Guard installation',
  repairs: 'Hanger / clip repair',
  replacement: 'Gutter replacement',
  inspection: 'Free inspection'
};

function buildQuoteEmail(data) {
  var services = (data.services || [])
    .map(function (key) { return SERVICE_LABELS[key] || key; });
  var lines = [
    'Name: ' + data.name,
    'Phone: ' + data.phone,
    data.email ? 'Email: ' + data.email : null,
    'Address: ' + data.address,
    services.length ? 'Services: ' + services.join(', ') : 'Services: (none selected)',
    '',
    'Details:',
    data.details || '(none)'
  ].filter(function (x) { return x !== null; });
  return {
    to: QUOTE_EMAIL,
    subject: 'Quote request - ' + data.name + ' (' + data.address + ')',
    body: lines.join('\n')
  };
}

function mailtoLink(msg) {
  return 'mailto:' + msg.to +
    '?subject=' + encodeURIComponent(msg.subject) +
    '&body=' + encodeURIComponent(msg.body);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('quote-form');
    if (!form) return;
    var errorEl = document.getElementById('quote-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.style.display = 'none';

      var name = document.getElementById('q-name').value.trim();
      var phone = document.getElementById('q-phone').value.trim();
      var email = document.getElementById('q-email').value.trim();
      var address = document.getElementById('q-address').value.trim();
      var details = document.getElementById('q-details').value.trim();
      var services = Array.prototype.slice.call(
        form.querySelectorAll('input[name="services"]:checked')
      ).map(function (box) { return box.value; });

      var missing = [];
      if (!name) missing.push('name');
      if (!phone) missing.push('phone');
      if (!address) missing.push('address');
      if (missing.length) {
        errorEl.textContent = 'Please fill in: ' + missing.join(', ') + '.';
        errorEl.style.display = 'block';
        return;
      }

      var msg = buildQuoteEmail({ name: name, phone: phone, email: email,
        address: address, details: details, services: services });
      window.location.href = mailtoLink(msg);
    });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildQuoteEmail: buildQuoteEmail, mailtoLink: mailtoLink,
    QUOTE_EMAIL: QUOTE_EMAIL, SERVICE_LABELS: SERVICE_LABELS };
}
