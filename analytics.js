/*
 * analytics.js: every piece of tracking on www.aagman.ai.
 * The contract is docs/analytics.md (the analytics framework). Change that first, then this file, then the tests.
 *
 * One event layer, two destinations: each event is defined once here and sent to Umami (source of truth)
 * and Google Analytics 4 (cross-check), with the same name and properties.
 * Dependency-free, deferred, and it can never break the page.
 */
(function (root) {
  'use strict';

  var CONFIG = {
    umamiSrc: 'https://analytics.aagman.ai/script.js',
    umamiLive: 'e2f79735-4b71-4458-81f6-bdcb71ea9c6f',
    umamiTest: '', // Umami website for Vercel previews; empty = previews print to the console only
    ga4: 'G-Z3F6FR2YVL',
    liveHosts: ['www.aagman.ai', 'aagman.ai'],
    visitorCookie: 'aag_vid',
    teamCookie: 'aag_team',
    cookieDays: 400
  };

  var SOCIAL_HOSTS = ['twitter.com', 'x.com', 'linkedin.com', 'youtube.com', 'github.com', 'reddit.com', 'instagram.com'];
  var PRODUCTS = { '/research': 'research', '/charts': 'charts', '/backtesting': 'backtesting', '/picks': 'picks', '/deploy': 'deploy' };
  var ITEMS = {
    '/': 'home', '/pricing': 'pricing', '/docs': 'docs', '/blog': 'blog', '/invest': 'investors', '/sitemap.xml': 'sitemap',
    '/terms': 'terms', '/privacy-policy': 'privacy_policy', '/risk-disclosure': 'risk_disclosure',
    '/cancellation-refunds': 'cancellation_refunds'
  };
  var CTA_LABELS = ['sign_up', 'talk_to_founders', 'join_whatsapp'];

  // ---------- pure helpers (tested in tests/analytics.test.mjs) ----------

  function parseUrl(href, pageHost, base) {
    try { return new URL(href, base || ('https://' + (pageHost || 'www.aagman.ai') + '/')); } catch (e) { return null; }
  }

  function isSiteHost(host, pageHost) {
    host = (host || '').replace(/^www\./, '');
    return host === 'aagman.ai' || host === (pageHost || '').replace(/^www\./, '');
  }

  /* '/charts.html' -> '/charts', '/blog/x/' -> '/blog/x', '/index.html' -> '/' */
  function normalizePath(pathname) {
    var p = (pathname || '/').replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return p || '/';
  }

  /* '/' -> 'home', '/privacy-policy' -> 'privacy_policy', '/blog/a-b' -> 'blog_a_b' */
  function pageName(path) {
    if (path === '/') return 'home';
    return path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  var SOCIAL_SHORT = { '/lp-linkedin': 'linkedin.com', '/x-lp': 'x.com', '/insta-lp': 'instagram.com' }; // dub.sh links to our profiles

  function socialPlatform(hostname, pathname) {
    if (hostname === 'dub.sh' && SOCIAL_SHORT[pathname]) return SOCIAL_SHORT[pathname];
    for (var i = 0; i < SOCIAL_HOSTS.length; i++) {
      var h = SOCIAL_HOSTS[i];
      if (hostname === h || hostname.slice(-(h.length + 1)) === '.' + h) return h;
    }
    return null;
  }

  function ctaLabel(url) {
    if (url.hostname === 'app.aagman.ai' && /^\/(login|signup|register)?\/?$/.test(url.pathname)) return 'sign_up';
    if (url.hostname === 'dub.sh' && url.pathname === '/fZsnb0w') return 'talk_to_founders';
    if (url.hostname === 'chat.whatsapp.com') return 'join_whatsapp';
    return null;
  }

  /* the nav item for an internal path, e.g. '/charts' -> 'charts', '/blog/x' -> 'blog', '/#founders' -> 'founders_letter' */
  function itemFor(path, hash) {
    if (path === '/' && hash === '#founders') return 'founders_letter';
    if (PRODUCTS[path]) return PRODUCTS[path];
    if (ITEMS[path]) return ITEMS[path];
    var top = '/' + path.split('/')[1];
    return ITEMS[top] || null;
  }

  /*
   * Pure click classifier (section 5 of the framework). desc:
   *   { href, dataset: {cta, card}, section, area: 'header'|'menu'|'footer'|null, pageHost, base }
   * Returns { name, params } or null. One click sends at most one event; earlier rules win.
   */
  function classifyClick(desc, page) {
    if (!desc) return null;
    var dataset = desc.dataset || {};
    var section = desc.section || 'body';
    var spot = pageName(page || '/') + '.' + section;
    var url = desc.href ? parseUrl(desc.href, desc.pageHost, desc.base) : null;
    if (desc.href && desc.href.indexOf('mailto:') === 0) url = null;

    // 1. call-to-action buttons
    var label = dataset.cta === 'primary' ? 'sign_up' : (CTA_LABELS.indexOf(dataset.cta) !== -1 ? dataset.cta : null);
    if (!label && url) label = ctaLabel(url);
    if (label) return { name: 'cta_click', params: { label: label, section: section, spot: spot } };

    // 2. any other link into the app
    if (url && url.hostname === 'app.aagman.ai') {
      return { name: 'app_link_click', params: { section: section, target: normalizePath(url.pathname) } };
    }

    // 3. product and action cards in the page body
    if (dataset.card) return { name: 'card_click', params: { card: dataset.card, section: section } };
    var internal = url && (url.protocol === 'http:' || url.protocol === 'https:') && isSiteHost(url.hostname, desc.pageHost);
    var path = internal ? normalizePath(url.pathname) : null;
    if (internal && !desc.area && PRODUCTS[path]) {
      return { name: 'card_click', params: { card: PRODUCTS[path], section: section } };
    }

    // 4. header, menu and footer navigation
    if (internal && desc.area) {
      var item = itemFor(path, url.hash);
      if (item) return { name: 'nav_click', params: { area: desc.area, item: item } };
      return null;
    }

    // 5-7. leaving the site
    if (desc.href && desc.href.indexOf('mailto:') === 0) {
      var inbox = desc.href.slice(7).split('?')[0].split('@')[0].toLowerCase(); // 'growth', never the full address
      return { name: 'contact_click', params: { inbox: inbox, section: section } };
    }
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:') || internal) return null;
    var platform = socialPlatform(url.hostname.replace(/^www\./, ''), url.pathname);
    if (platform) return { name: 'social_click', params: { platform: platform, section: section } };
    return { name: 'outbound_click', params: { href: url.origin + url.pathname, section: section } };
  }

  /* where tracking runs (section 7): 'live' | 'preview' | 'local' */
  function environment(host) {
    if (CONFIG.liveHosts.indexOf(host) !== -1) return 'live';
    if (/\.vercel\.app$/.test(host)) return 'preview';
    return 'local';
  }

  /* 22-character random id, base64url */
  function newVisitorId(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return (typeof btoa === 'function' ? btoa(s) : Buffer.from(s, 'binary').toString('base64'))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  var api = {
    CONFIG: CONFIG, classifyClick: classifyClick, normalizePath: normalizePath, pageName: pageName,
    itemFor: itemFor, environment: environment, newVisitorId: newVisitorId
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // ---------- browser only below ----------
  var doc = root.document;
  var loc = root.location;
  var host = loc.hostname;
  var env = environment(host);
  var page = normalizePath(loc.pathname);
  var query = new URLSearchParams(loc.search);

  function safe(fn) { try { return fn(); } catch (e) { return undefined; } }

  function readCookie(name) {
    return safe(function () {
      var m = doc.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    });
  }
  function writeCookie(name, value, days) {
    safe(function () {
      var domain = /(^|\.)aagman\.ai$/.test(host) ? '; domain=.aagman.ai' : '';
      doc.cookie = name + '=' + encodeURIComponent(value) + '; max-age=' + Math.round(days * 86400) +
        '; path=/' + domain + '; SameSite=Lax' + (loc.protocol === 'https:' ? '; Secure' : '');
    });
  }

  // debug mode: ?aag_debug=1 for this tab, ?aag_debug=0 to stop
  if (query.get('aag_debug') === '1') safe(function () { root.sessionStorage.setItem('aag_debug', '1'); });
  if (query.get('aag_debug') === '0') safe(function () { root.sessionStorage.removeItem('aag_debug'); });
  var debug = safe(function () { return root.sessionStorage.getItem('aag_debug') === '1'; }) || false;

  // team browsers: ?aag_team=on once; Umami stops recording, GA4 marks the traffic internal
  if (query.get('aag_team') === 'on') {
    writeCookie(CONFIG.teamCookie, '1', CONFIG.cookieDays);
    safe(function () { root.localStorage.setItem('umami.disabled', '1'); });
  }
  if (query.get('aag_team') === 'off') {
    writeCookie(CONFIG.teamCookie, '', 0);
    safe(function () { root.localStorage.removeItem('umami.disabled'); });
  }
  var team = readCookie(CONFIG.teamCookie) === '1';

  // anonymous visitor id (section 6)
  var vid = readCookie(CONFIG.visitorCookie);
  if (!vid || !/^[A-Za-z0-9_-]{22}$/.test(vid)) {
    vid = safe(function () { var b = new Uint8Array(16); root.crypto.getRandomValues(b); return newVisitorId(b); });
  }
  if (vid) writeCookie(CONFIG.visitorCookie, vid, CONFIG.cookieDays);

  var umamiId = env === 'live' ? CONFIG.umamiLive : (env === 'preview' ? CONFIG.umamiTest : '');
  var gaOn = env === 'live' || (env === 'preview' && debug);

  // Umami: queue until the tracker loads, then identify the visitor and flush
  var umamiQueue = [];
  var umamiReady = false;
  if (umamiId) {
    var us = doc.createElement('script');
    us.defer = true;
    us.src = CONFIG.umamiSrc;
    us.setAttribute('data-website-id', umamiId);
    us.setAttribute('data-auto-pageview', 'false'); // page view sent below, after the visitor is identified
    us.setAttribute('data-performance', 'true'); // page speed: load time, layout shift, responsiveness
    us.onload = function () {
      umamiReady = !!(root.umami && typeof root.umami.track === 'function');
      if (!umamiReady || team) return;
      if (vid) safe(function () { root.umami.identify(vid); });
      safe(function () { root.umami.track(); }); // the page view
      while (umamiQueue.length) { var e = umamiQueue.shift(); safe(function () { root.umami.track(e[0], e[1]); }); }
    };
    doc.head.appendChild(us);
  }

  // Google Analytics 4: gtag queues on its own until gtag.js loads
  if (gaOn) {
    root.dataLayer = root.dataLayer || [];
    root.gtag = root.gtag || function () { root.dataLayer.push(arguments); };
    root.gtag('js', new Date());
    var gaConfig = {};
    if (debug) gaConfig.debug_mode = true;
    else if (team || env !== 'live') gaConfig.traffic_type = 'internal'; // debug hits stay unmarked so DebugView shows them
    root.gtag('config', CONFIG.ga4, gaConfig);
    var gs = doc.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4;
    doc.head.appendChild(gs);
  }
  if (debug) root.console.log('[aag] ' + env + ' · umami ' + (umamiId || 'off') + ' · ga4 ' + (gaOn ? CONFIG.ga4 : 'off') + ' · team ' + team + ' · vid ' + vid);

  function track(name, params) {
    params = params || {};
    params.page = page;
    if (debug) root.console.log('[aag] ' + name, JSON.stringify(params));
    if (umamiId && !team) {
      if (umamiReady) safe(function () { root.umami.track(name, params); });
      else umamiQueue.push([name, params]);
    }
    if (gaOn) safe(function () {
      var p = {};
      for (var k in params) p[k] = params[k];
      if (debug) p.debug_mode = true;
      else if (team || env !== 'live') p.traffic_type = 'internal';
      root.gtag('event', name, p);
    });
  }

  function sectionOf(el) {
    var s = el.closest('[data-section]');
    if (s) return s.getAttribute('data-section');
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    return 'body';
  }
  function areaOf(el) {
    if (el.closest('footer')) return 'footer';
    if (el.closest('.dd-m, [role="menu"], .mn-sheet')) return 'menu'; // desktop dropdowns and the phone and tablet menu
    if (el.closest('header, nav:not(.toc):not(.rail)')) return 'header'; // any site nav bar (blog topnav, docs and investor bars)
    return null;
  }
  function slug(text) { return (text || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

  // nav_open: once per menu per page view, by click or a 300 ms hover
  var openedMenus = {};
  function menuOpened(dd) {
    var t = dd.querySelector('.dd-t');
    var menu = slug(t && t.textContent);
    if (!menu || openedMenus[menu]) return;
    openedMenus[menu] = true;
    track('nav_open', { menu: menu });
  }

  safe(function () {
    var onClick = function (event) {
      if (event.type === 'auxclick' && event.button !== 1) return; // middle-click only
      safe(function () {
        var t = event.target;
        if (!t || !t.closest) return;
        var mn = t.closest('.mn-btn');
        if (mn) { if (mn.getAttribute('aria-expanded') !== 'true' && !openedMenus.mobile) { openedMenus.mobile = true; track('nav_open', { menu: 'mobile' }); } return; }
        var toggle = t.closest('.dd-t');
        if (toggle) { if (toggle.closest('.dd')) menuOpened(toggle.closest('.dd')); return; }
        var soon = t.closest('.dd-i.soon');
        if (soon) { var b = soon.querySelector('b'); track('soon_click', { item: slug(b ? b.firstChild && b.firstChild.textContent : soon.textContent) }); return; }
        var el = t.closest('a');
        if (!el) return;
        var hit = classifyClick({
          href: el.getAttribute('href') || '', dataset: el.dataset || {},
          section: sectionOf(el), area: areaOf(el), pageHost: host, base: loc.href
        }, page);
        if (hit) track(hit.name, hit.params);
      });
    };
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('auxclick', onClick, true);

    [].forEach.call(doc.querySelectorAll('.dd'), function (dd) {
      var timer = null;
      dd.addEventListener('mouseenter', function () { timer = root.setTimeout(function () { menuOpened(dd); }, 300); });
      dd.addEventListener('mouseleave', function () { root.clearTimeout(timer); });
      dd.addEventListener('focusin', function () { menuOpened(dd); });
    });

    // faq_open: 'toggle' does not bubble, so listen in the capture phase
    doc.addEventListener('toggle', function (event) {
      safe(function () {
        var d = event.target;
        if (!d || d.tagName !== 'DETAILS' || !d.open) return;
        var s = d.querySelector('summary[data-question]');
        if (s) track('faq_open', { question: s.getAttribute('data-question') });
      });
    }, true);

    // section_view: half the section on screen, or the section filling half the screen; once each per page view
    // Two observers: half of a short section on screen, or any section crossing the middle line of the screen
    // (a section several screens tall never shows half of itself at once).
    if ('IntersectionObserver' in root) {
      var seen = {};
      var observers = [];
      var viewed = function (el) {
        var name = el.getAttribute('data-section');
        if (seen[name]) return;
        seen[name] = true;
        observers.forEach(function (o) { o.unobserve(el); });
        track('section_view', { section: name });
      };
      observers.push(new root.IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio >= 0.5) viewed(e.target); });
      }, { threshold: [0.5] }));
      observers.push(new root.IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) viewed(e.target); });
      }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 }));
      [].forEach.call(doc.querySelectorAll('[data-section]'), function (el) {
        var nm = el.getAttribute('data-section');
        if (nm === 'header' || nm === 'menu') return; // always on the page; the menu is hidden until opened
        observers.forEach(function (o) { o.observe(el); });
      });
    }

    // blog_read: past half of a blog or docs page, once per page view
    if (page.indexOf('/blog/') === 0 || page.indexOf('/docs/') === 0) {
      var readFired = false;
      var onScroll = function () {
        if (readFired) return;
        var height = doc.body && doc.body.scrollHeight;
        if (!height) return;
        if ((root.scrollY + root.innerHeight) / height >= 0.5) {
          readFired = true;
          root.removeEventListener('scroll', onScroll);
          track('blog_read', { slug: page });
        }
      };
      root.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
