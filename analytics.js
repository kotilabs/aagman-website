/*
 * analytics.js — Umami custom event tracking for the aagman marketing site.
 * Dependency-free. Deferred. Production-only (gated on hostname).
 * Taxonomy contract: docs/analytics.md
 */
(function (root) {
  'use strict';

  var SOCIAL_HOSTS = [
    'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
    'github.com', 'reddit.com', 'instagram.com'
  ];

  function parseHref(href, pageHost) {
    try {
      return new URL(href, 'https://' + (pageHost || 'www.aagman.ai'));
    } catch (e) {
      return null;
    }
  }

  function socialPlatform(hostname) {
    for (var i = 0; i < SOCIAL_HOSTS.length; i++) {
      var h = SOCIAL_HOSTS[i];
      if (hostname === h || hostname === 'www.' + h || hostname.slice(-(h.length + 1)) === '.' + h) {
        return h;
      }
    }
    return null;
  }

  /*
   * Pure click classifier. Takes a plain descriptor (no DOM required):
   *   { href: string|null, dataset: {cta, ctaLocation}, inFooter: bool, inNav: bool }
   * Returns { name, params } or null.
   */
  function classifyClick(desc, pagePath) {
    if (!desc) return null;
    var href = desc.href || '';
    var dataset = desc.dataset || {};
    var page = pagePath || '/';

    if (dataset.cta === 'primary') {
      return { name: 'cta_click', params: { location: dataset.ctaLocation || 'unknown', page: page } };
    }

    if (href.indexOf('app.aagman.ai') !== -1) {
      var loc = dataset.ctaLocation;
      if (!loc) loc = desc.inFooter ? 'footer' : desc.inNav ? 'nav' : 'body';
      return { name: 'app_link_click', params: { location: loc, page: page } };
    }

    if (href.indexOf('mailto:') === 0) {
      return { name: 'contact_click', params: { href: href, page: page } };
    }

    var url = parseHref(href, desc.pageHost);
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) return null;

    var host = url.hostname.replace(/^www\./, '');
    var platform = socialPlatform(url.hostname);
    if (platform) {
      return { name: 'social_click', params: { platform: platform, page: page } };
    }

    if (desc.pageHost && host !== desc.pageHost.replace(/^www\./, '')) {
      return { name: 'outbound_click', params: { href: href, page: page } };
    }

    return null; // internal link
  }

  var api = { classifyClick: classifyClick };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }

  // ---- browser-only below ----

  var hostname = root.location && root.location.hostname;
  if (hostname !== 'www.aagman.ai' && hostname !== 'aagman.ai') return;

  // Production-only collection: analytics.js owns Umami tracker injection.
  // Off production, nothing below this point runs — no script, no pageviews.
  var umamiScript = root.document.createElement('script');
  umamiScript.defer = true;
  umamiScript.src = 'https://analytics.aagman.ai/script.js';
  umamiScript.setAttribute('data-website-id', 'e2f79735-4b71-4458-81f6-bdcb71ea9c6f');
  root.document.head.appendChild(umamiScript);

  // Safe wrapper: no-ops until the async Umami script has loaded.
  function track(name, params) {
    try {
      if (root.umami && typeof root.umami.track === 'function') {
        root.umami.track(name, params);
      }
    } catch (e) { /* never break the page for analytics */ }
  }

  root.document.addEventListener('click', function (event) {
    var el = event.target;
    while (el && el.tagName !== 'A' && el.tagName !== 'BUTTON') {
      el = el.parentElement;
    }
    if (!el) return;

    var desc = {
      href: el.getAttribute('href') || '',
      dataset: el.dataset || {},
      inFooter: !!el.closest('footer'),
      inNav: !!(el.closest('nav') || el.closest('header')),
      pageHost: hostname
    };
    var hit = classifyClick(desc, root.location.pathname);
    if (hit) track(hit.name, hit.params);
  }, true);

  // blog_read: fire once when a reader scrolls past 50% of a blog/docs page.
  var pagePath = root.location.pathname;
  if (pagePath.indexOf('/blog/') === 0 || pagePath.indexOf('/docs/') === 0) {
    var readFired = false;
    var onScroll = function () {
      if (readFired) return;
      var height = root.document.body && root.document.body.scrollHeight;
      if (!height) return;
      if ((root.scrollY + root.innerHeight) / height >= 0.5) {
        readFired = true;
        root.removeEventListener('scroll', onScroll);
        track('blog_read', { slug: pagePath });
      }
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // short pages may already qualify without scrolling
  }
})(typeof window !== 'undefined' ? window : globalThis);
