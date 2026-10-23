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
    cookieDays: 400,
    clickCookie: 'aag_click', // how the visitor arrived: first touch + latest tagged touch (section 14)
    clickDays: 90,
    trailCookie: 'aag_trail', // last 12 pages + the Sign up spot clicked (section 14)
    trailDays: 30
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


  // ---------- phase 2: how the visitor arrived, handed to the app at Sign up (section 14) ----------

  var MAX_LEN = 128;        // characters, the app's and gateway's cap
  var MAX_ENCODED = 200;    // and at most this many once URL-encoded, so non-Latin text cannot bloat the cookie
  var CLICK_BUDGET = 3000;  // aag_click, encoded; browsers drop a cookie over 4096 bytes without a word
  var TRAIL_PAGES = 12;
  /* URL parameter -> touch key. The app and gateway use the same key names. */
  var TAG_PARAMS = [
    ['utm_source', 'source'], ['utm_medium', 'medium'], ['utm_campaign', 'campaign'], ['utm_term', 'term'],
    ['utm_content', 'content'], ['adgroup', 'adGroup'],
    ['gclid', 'gclid'], ['gbraid', 'gbraid'], ['wbraid', 'wbraid'], ['fbclid', 'fbclid'], ['msclkid', 'msclkid']
  ];
  var CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];
  var TOUCH_KEYS = ['source', 'medium', 'campaign', 'term', 'content', 'adGroup', 'gclid', 'gbraid', 'wbraid',
    'fbclid', 'msclkid', 'clickAt', 'landingPath', 'referrerHost'];
  var LAST_KEYS = TOUCH_KEYS.slice(0, 12); // tags, click ids and clickAt: the latest touch has no landing or referrer
  /* dropped first, from the latest touch then the first, if aag_click would outgrow its budget; click ids never */
  var FIT_ORDER = ['term', 'content', 'referrerHost', 'landingPath', 'campaign', 'adGroup', 'medium', 'source'];
  var APP_DEFAULT_PATH = '/trading-strategy'; // where the app sends a signed-in visitor; keeps bare app links working
  /* not put on the Sign up link: the app reads them from aag_click, and a link URL can be logged by other tools */
  var NOT_IN_LINK = ['fbclid', 'msclkid'];

  /* drop control characters (Postgres jsonb rejects NUL) and any half of a surrogate pair (half an emoji) */
  function wellFormed(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF) {
        var n = s.charCodeAt(i + 1);
        if (n >= 0xDC00 && n <= 0xDFFF) { out += s.charAt(i) + s.charAt(i + 1); i++; }
        continue;
      }
      if ((c >= 0xDC00 && c <= 0xDFFF) || c < 0x20 || c === 0x7F) continue;
      out += s.charAt(i);
    }
    return out;
  }
  function cap(v) {
    if (typeof v !== 'string') return undefined;
    v = wellFormed(wellFormed(v).trim().slice(0, MAX_LEN));
    while (v && encodeURIComponent(v).length > MAX_ENCODED) v = wellFormed(v.slice(0, -1));
    return v || undefined;
  }
  function isOwnHost(h) { return h === 'aagman.ai' || /\.aagman\.ai$/.test(h); }

  /* One visit as a touch: campaign tags, click id (+ when), landing page and an outside referrer. */
  function touchFromUrl(search, referrer, landingPath, now, pageHost) {
    var q = new URLSearchParams(search || '');
    var t = {};
    for (var i = 0; i < TAG_PARAMS.length; i++) {
      var v = cap(q.get(TAG_PARAMS[i][0]));
      if (v) t[TAG_PARAMS[i][1]] = v;
    }
    if (hasClickId(t)) t.clickAt = now.toISOString();
    var lp = cap(landingPath);
    if (lp) t.landingPath = lp;
    var r = referrer ? parseUrl(referrer, pageHost) : null;
    if (r && r.hostname && !isOwnHost(r.hostname) && r.hostname !== pageHost) t.referrerHost = cap(r.hostname);
    return t;
  }

  function hasClickId(t) {
    for (var i = 0; i < CLICK_IDS.length; i++) if (t && t[CLICK_IDS[i]]) return true;
    return false;
  }
  function isTagged(t) {
    for (var i = 0; i < TAG_PARAMS.length; i++) if (t && t[TAG_PARAMS[i][1]]) return true;
    return false;
  }
  function isPlain(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function pick(t, keys) {
    var out = {};
    for (var i = 0; i < keys.length; i++) { var v = cap(isPlain(t) ? t[keys[i]] : undefined); if (v) out[keys[i]] = v; }
    return out;
  }
  function validCookie(c) { return isPlain(c) && c.v === 1; }
  function encodedSize(o) { return encodeURIComponent(JSON.stringify(o)).length; }
  function fitClick(c) {
    for (var i = 0; i < FIT_ORDER.length && encodedSize(c) > CLICK_BUDGET; i++) {
      if (c.l) delete c.l[FIT_ORDER[i]];
      if (encodedSize(c) > CLICK_BUDGET) delete c.f[FIT_ORDER[i]];
    }
    return c;
  }

  /*
   * The new aag_click value after this visit. The first visit is the first touch, kept while the cookie lives.
   * A visit with a campaign tag or click id replaces the latest touch; when it carries no click id of its own,
   * the previous click id and its time stay, so a later newsletter or social link cannot erase the ad click.
   */
  function updateClick(existing, touch) {
    var first = validCookie(existing) ? pick(existing.f, TOUCH_KEYS) : {};
    if (!Object.keys(first).length) {
      var fresh = { v: 1, f: pick(touch, TOUCH_KEYS) };
      if (isTagged(touch)) fresh.l = pick(touch, LAST_KEYS);
      return fitClick(fresh);
    }
    var out = { v: 1, f: first };
    var prev = validCookie(existing) && isPlain(existing.l) ? pick(existing.l, LAST_KEYS) : null;
    if (isTagged(touch)) {
      out.l = pick(touch, LAST_KEYS);
      if (!hasClickId(touch) && prev && hasClickId(prev)) {
        for (var i = 0; i < CLICK_IDS.length; i++) if (prev[CLICK_IDS[i]]) out.l[CLICK_IDS[i]] = prev[CLICK_IDS[i]];
        if (prev.clickAt) out.l.clickAt = prev.clickAt;
      }
    } else if (prev && Object.keys(prev).length) {
      out.l = prev;
    }
    return fitClick(out);
  }

  /* aag_click's value as it sits in the cookie (URL-encoded JSON), and back; null when it cannot be read */
  function serializeClick(c) { return encodeURIComponent(JSON.stringify(c)); }
  function parseClick(raw) {
    if (typeof raw !== 'string' || !raw) return null;
    try { return JSON.parse(decodeURIComponent(raw)); } catch (e) { return null; }
  }

  /*
   * Phase 3 (section 15): has this visit already been applied to aag_click? The server (middleware.ts) writes the
   * cookie in the page's own response, which Safari keeps for 90 days; a script write would bring back Safari's
   * 7-day cap, so the page script writes aag_click only when this returns false (the fallback).
   * Applied = a usable cookie, and either the visit has no tag, or the latest touch holds this visit's tags and
   * click id. clickAt differs by clock and is not compared. A tag missing from the cookie counts as dropped by the
   * size cap only when putting it back would take the cookie over the cap (fitClick never drops a click id).
   */
  function clickApplied(click, touch) {
    if (!validCookie(click) || !Object.keys(pick(click.f, TOUCH_KEYS)).length) return false;
    if (!isTagged(touch)) return true;
    if (!isPlain(click.l)) return false;
    var restored = null;
    for (var i = 0; i < LAST_KEYS.length; i++) {
      var k = LAST_KEYS[i];
      var t = cap(touch[k]); // as stored: a value cut at a space loses that space when it is stored
      if (k === 'clickAt' || !t || click.l[k] === t) continue;
      if (click.l[k] !== undefined || FIT_ORDER.indexOf(k) === -1) return false;
      restored = restored || { v: 1, f: click.f, l: pick(click.l, LAST_KEYS) };
      restored.l[k] = t;
    }
    return !restored || encodedSize(restored) > CLICK_BUDGET;
  }

  /* aag_trail after visiting `path`: last 12 pages as path@unix-seconds, a reload is not a new page. */
  function updateTrail(existing, path, nowSec) {
    var tr = validCookie(existing) ? existing : { v: 1, p: '' };
    var clean = (cap(String(path || '/')) || '/').replace(/[@|]/g, '_');
    var pages = typeof tr.p === 'string' && tr.p ? tr.p.split('|') : [];
    var last = pages.length ? pages[pages.length - 1].split('@')[0] : null;
    if (last !== clean) pages.push(clean + '@' + Math.floor(nowSec));
    var out = { v: 1, p: pages.slice(-TRAIL_PAGES).join('|') };
    var spot = cap(tr.s);
    if (spot) out.s = spot;
    return out;
  }
  function setTrailSpot(existing, spot) {
    var tr = validCookie(existing) ? existing : { v: 1, p: '' };
    return { v: 1, p: typeof tr.p === 'string' ? tr.p : '', s: cap(spot) };
  }

  /*
   * The Sign up link with the hand-off added (backup for when the app cannot read the cookies): src=<page>.<section>
   * plus the latest touch's tags and click id (else the first touch's). Parameters already on the link win.
   * A bare app.aagman.ai link goes through /login?next=/trading-strategy: the root redirects drop the query,
   * and a signed-in visitor is sent straight on by the login page.
   */
  function handoffUrl(href, spot, click) {
    var url = parseUrl(href);
    if (!url || url.protocol !== 'https:' || url.hostname !== 'app.aagman.ai') return href;
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/login';
      if (!url.searchParams.has('next')) url.searchParams.set('next', APP_DEFAULT_PATH);
    }
    var touch = validCookie(click) ? (isTagged(click.l) ? click.l : click.f) : null;
    var add = [['src', spot]];
    for (var i = 0; i < TAG_PARAMS.length; i++) {
      if (NOT_IN_LINK.indexOf(TAG_PARAMS[i][0]) !== -1) continue;
      var v = isPlain(touch) && cap(touch[TAG_PARAMS[i][1]]);
      if (v) add.push([TAG_PARAMS[i][0], v]);
    }
    for (var j = 0; j < add.length; j++) if (add[j][1] && !url.searchParams.has(add[j][0])) url.searchParams.append(add[j][0], add[j][1]);
    return url.toString();
  }

  /* A Sign up click: the new trail (with the spot) and the new link, or null when the link is not into the app. */
  function signupClick(href, spot, trail, click) {
    var url = parseUrl(href);
    if (!url || url.protocol !== 'https:' || url.hostname !== 'app.aagman.ai') return null;
    return { trail: setTrailSpot(trail, spot), href: handoffUrl(url.toString(), spot, click) };
  }

  /*
   * Rule 3: Umami never stores a click id or any other per-person ad or tracker id. Allowlist, not a list of
   * known ids: the page URL keeps its path and only utm_* parameters, and a hash with a parameter in it goes.
   */
  function umamiUrl(href) {
    if (!href || typeof href !== 'string') return href;
    var url = parseUrl(href);
    if (!url) return href;
    var keep = [];
    url.searchParams.forEach(function (v, k) { if (/^utm_/i.test(k)) keep.push([k, v]); });
    url.search = '';
    for (var i = 0; i < keep.length; i++) url.searchParams.append(keep[i][0], keep[i][1]);
    if (url.hash.indexOf('=') !== -1) url.hash = '';
    return url.toString();
  }
  /* the referrer is another site's URL, with its own ids in path and query: keep its origin only */
  function umamiReferrer(href) {
    if (!href || typeof href !== 'string') return href;
    var url = parseUrl(href);
    return url && /^https?:$/.test(url.protocol) && href.indexOf('://') !== -1 ? url.origin : '';
  }
  /* Umami's data-before-send hook: runs on every send (page view, event, identify, performance). */
  function umamiBeforeSend(type, payload) {
    if (isPlain(payload)) {
      payload.url = umamiUrl(payload.url);
      payload.referrer = umamiReferrer(payload.referrer);
    }
    return payload;
  }

  var api = {
    CONFIG: CONFIG, classifyClick: classifyClick, normalizePath: normalizePath, pageName: pageName,
    itemFor: itemFor, environment: environment, newVisitorId: newVisitorId,
    touchFromUrl: touchFromUrl, updateClick: updateClick, updateTrail: updateTrail, setTrailSpot: setTrailSpot,
    handoffUrl: handoffUrl, signupClick: signupClick, umamiUrl: umamiUrl, umamiReferrer: umamiReferrer,
    umamiBeforeSend: umamiBeforeSend, TOUCH_KEYS: TOUCH_KEYS,
    serializeClick: serializeClick, parseClick: parseClick, clickApplied: clickApplied
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

  // how the visitor arrived (section 14): first touch + latest tagged touch, and the page trail.
  // Read by the app's login page on app.aagman.ai; never sent to Umami or GA4.
  function readJsonCookie(name) { return safe(function () { var v = readCookie(name); return v ? JSON.parse(v) : null; }) || null; }
  var now = new Date();
  var click = readJsonCookie(CONFIG.clickCookie);
  // Phase 3 (section 15): the server already wrote aag_click for this page view (and re-dated it, so it lasts
  // 90 days from the last visit). Writing it again here would cap it at 7 days in Safari, so the script writes
  // it only as the fallback, when this visit is not in the cookie (the middleware did not run).
  var touch = safe(function () { return touchFromUrl(loc.search, doc.referrer, page, now, host); });
  if (touch && !safe(function () { return clickApplied(click, touch); })) {
    var nextClick = safe(function () { return updateClick(click, touch); });
    if (nextClick) { click = nextClick; writeCookie(CONFIG.clickCookie, JSON.stringify(click), CONFIG.clickDays); }
  }
  var trail = safe(function () { return updateTrail(readJsonCookie(CONFIG.trailCookie), page, now.getTime() / 1000); });
  if (trail) writeCookie(CONFIG.trailCookie, JSON.stringify(trail), CONFIG.trailDays);

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
    us.crossOrigin = 'anonymous'; // fetch script.js without our cookies (aag_click holds the click id)
    root.aagUmamiBeforeSend = umamiBeforeSend; // scrubs the url and referrer of every send
    us.setAttribute('data-before-send', 'aagUmamiBeforeSend');
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
        // Sign up hand-off (section 14): remember the spot, and give the link the spot and the click
        if (hit && hit.name === 'cta_click' && hit.params.label === 'sign_up') {
          var target = parseUrl(el.getAttribute('href') || '', host, loc.href);
          var hand = signupClick(target ? target.toString() : '', hit.params.spot,
            readJsonCookie(CONFIG.trailCookie) || trail, readJsonCookie(CONFIG.clickCookie) || click);
          if (hand) {
            trail = hand.trail;
            writeCookie(CONFIG.trailCookie, JSON.stringify(trail), CONFIG.trailDays);
            el.setAttribute('href', hand.href);
          }
        }
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
