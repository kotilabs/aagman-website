// Google Ads conversion tracking — Get Started Click
// Conversion action: Get Started Click (ID: 7721876354)
// Replace the conversion label below with the one from Google Ads UI:
// Tools & Settings → Conversions → "Get Started Click" → Tag setup → Install tag manually → Event snippet
(function () {
  'use strict';

  var GOOGLE_ADS_CONVERSION_LABEL = 'AW-18368771134/hS7OCIL3ieIcEL7o9LZE';
  var MAX_RETRIES = 50;

  function fireGetStartedConversion(attempt) {
    if (GOOGLE_ADS_CONVERSION_LABEL.indexOf('REPLACE_WITH_CONVERSION_LABEL') !== -1) {
      console.warn('[Google Ads] Conversion label not set; skipping conversion fire.');
      return;
    }
    attempt = attempt || 0;
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_CONVERSION_LABEL,
        value: 1.0,
        currency: 'INR'
      });
      return;
    }
    if (attempt < MAX_RETRIES) {
      setTimeout(function () {
        fireGetStartedConversion(attempt + 1);
      }, 100);
    } else {
      console.warn('[Google Ads] gtag not loaded after ' + MAX_RETRIES + ' retries; conversion not fired.');
    }
  }

  function isGetStartedLink(el) {
    if (!el || el.tagName !== 'A') return false;
    var href = (el.getAttribute('href') || '').toLowerCase();
    var text = (el.textContent || '').trim().toLowerCase();
    return href.indexOf('app.aagman.ai') !== -1 && text.indexOf('get started') !== -1;
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a');
      if (isGetStartedLink(el)) {
        fireGetStartedConversion();
      }
    });
  });
})();
