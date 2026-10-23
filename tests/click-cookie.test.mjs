// Tests for phase 3 (docs/analytics.md section 15): the server writes aag_click, so Safari keeps it 90 days.
// Run: npm test   (or: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/click-cookie.test.mjs)
//
// What is checked:
//  - middleware.ts builds the Set-Cookie for a marketing page view: the exact phase 2 format (it calls the same
//    functions in analytics.js), first touch never overwritten, latest tagged touch replaced, refreshed on every
//    page view, size capped, nothing personal, never on forwarded pages, assets or /_next, never throws.
//  - analytics.js in a simulated browser: it does not re-write aag_click when the server already applied this
//    visit (a script write would bring back Safari's 7-day cap), and writes it itself when the server did not.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const A = require('../analytics.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
const mw = await import('../middleware.ts');
const middleware = mw.default;

let passed = 0;
const failures = [];
const test = (name, fn) => {
  try { fn(); passed++; } catch (e) { failures.push(`${name}: ${e.message}`); }
};

const NOW = new Date('2026-10-23T05:30:00.000Z');
const LATER = new Date('2026-10-30T09:00:00.000Z');
const WWW = 'https://www.aagman.ai';
const AD = '?gclid=TEST&utm_source=test';
const NINETY_DAYS = 90 * 86400;

const req = (url, { cookie, referer, method = 'GET' } = {}) => {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (referer) headers.referer = referer;
  return new Request(url, { method, headers });
};
/** { name, value (decoded object), attrs: {lowercase name: value|true}, raw } or null */
function parseSetCookie(header) {
  if (!header) return null;
  const [nv, ...rest] = header.split(';').map((s) => s.trim());
  const i = nv.indexOf('=');
  const attrs = {};
  for (const a of rest) {
    const j = a.indexOf('=');
    if (j === -1) attrs[a.toLowerCase()] = true; else attrs[a.slice(0, j).toLowerCase()] = a.slice(j + 1);
  }
  return { name: nv.slice(0, i), raw: nv.slice(i + 1), value: JSON.parse(decodeURIComponent(nv.slice(i + 1))), attrs };
}
const cookieOf = (url, opts, now = NOW) => parseSetCookie(mw.clickSetCookie(req(url, opts), now));
const asCookie = (obj) => `aag_click=${encodeURIComponent(JSON.stringify(obj))}`;
/** what phase 2's analytics.js would compute for the same visit */
const phase2 = (existing, url, referer, now = NOW) => {
  const u = new URL(url);
  return A.updateClick(existing, A.touchFromUrl(u.search, referer || '', A.normalizePath(u.pathname), now, u.hostname));
};

// ---------- the cookie builder ----------
test('an ad visit gets aag_click from the server: 90 days, .aagman.ai, Path=/, SameSite=Lax, Secure, readable by the app', () => {
  const c = cookieOf(`${WWW}/${AD}`);
  assert.equal(c.name, 'aag_click');
  assert.deepEqual(c.attrs, { 'max-age': String(NINETY_DAYS), path: '/', domain: '.aagman.ai', samesite: 'Lax', secure: true });
  assert.ok(!('httponly' in c.attrs), 'not HttpOnly: the app frontend reads it');
  assert.deepEqual(c.value, {
    v: 1,
    f: { source: 'test', gclid: 'TEST', clickAt: '2026-10-23T05:30:00.000Z', landingPath: '/' },
    l: { source: 'test', gclid: 'TEST', clickAt: '2026-10-23T05:30:00.000Z' },
  });
});
test('exactly the phase 2 format: same value analytics.js would write, same encoding', () => {
  const url = `${WWW}/charts?gclid=G1&utm_source=google&utm_medium=cpc&utm_campaign=123&adgroup=456&utm_term=algo+app&utm_content=789`;
  const c = cookieOf(url, { referer: 'https://www.google.com/' });
  assert.deepEqual(c.value, phase2(null, url, 'https://www.google.com/'));
  assert.equal(c.raw, A.serializeClick(c.value), 'URL-encoded JSON, as the script writes it');
  assert.equal(c.value.f.referrerHost, 'www.google.com');
  assert.equal(c.value.f.landingPath, '/charts');
});
test('the cookie on the request is read back (parsing), among other cookies', () => {
  const first = phase2(null, `${WWW}/?gclid=G1`);
  const cookie = `aag_vid=abc; ${asCookie(first)}; aag_trail=%7B%22v%22%3A1%7D`;
  assert.deepEqual(mw.readCookie(cookie, 'aag_click'), A.serializeClick(first));
  assert.deepEqual(A.parseClick(mw.readCookie(cookie, 'aag_click')), first);
  assert.equal(mw.readCookie('x_aag_click=1', 'aag_click'), null, 'whole names only');
  assert.equal(mw.readCookie('', 'aag_click'), null);
  assert.equal(mw.readCookie(null, 'aag_click'), null);
});
test('first touch is never overwritten; the latest tagged touch is', () => {
  const first = phase2(null, `${WWW}/?utm_source=newsletter`, 'https://news.ycombinator.com/');
  const c = cookieOf(`${WWW}/pricing?gbraid=IPH&utm_source=google&utm_medium=cpc`, { cookie: asCookie(first) }, LATER);
  assert.deepEqual(c.value.f, first.f);
  assert.deepEqual(c.value.l, { source: 'google', medium: 'cpc', gbraid: 'IPH', clickAt: '2026-10-30T09:00:00.000Z' });
  const again = cookieOf(`${WWW}/?wbraid=W3`, { cookie: asCookie(c.value) }, LATER);
  assert.deepEqual(again.value.f, first.f);
  assert.deepEqual(again.value.l, { wbraid: 'W3', clickAt: '2026-10-30T09:00:00.000Z' });
});
test('a tagged visit without a click id keeps the earlier ad click in the latest touch', () => {
  const ad = phase2(null, `${WWW}/charts?gclid=G2&utm_source=google`);
  const c = cookieOf(`${WWW}/?utm_source=whatsapp`, { cookie: asCookie(ad) }, LATER);
  assert.deepEqual(c.value.l, { source: 'whatsapp', gclid: 'G2', clickAt: '2026-10-23T05:30:00.000Z' });
});
test('an untagged page view re-sends the same value, so the 90 days count from the last visit', () => {
  const ad = phase2(null, `${WWW}/${AD}`);
  const c = cookieOf(`${WWW}/pricing`, { cookie: asCookie(ad), referer: 'https://www.google.com/' }, LATER);
  assert.deepEqual(c.value, ad);
  assert.equal(c.attrs['max-age'], String(NINETY_DAYS));
});
test('a first visit with no tags is still the first touch (landing page and outside referrer only)', () => {
  assert.deepEqual(cookieOf(`${WWW}/research`, { referer: 'https://www.bing.com/search?q=algo' }).value,
    { v: 1, f: { landingPath: '/research', referrerHost: 'www.bing.com' } });
  assert.deepEqual(cookieOf(`${WWW}/`, { referer: `${WWW}/pricing` }).value, { v: 1, f: { landingPath: '/' } });
});
test('a malformed, foreign or newer-version cookie is replaced, never trusted, never a throw', () => {
  for (const bad of ['%E0%A4%A', 'not-json', encodeURIComponent('[1]'), encodeURIComponent('{"v":2,"f":{"gclid":"OLD"}}'),
    encodeURIComponent('{"v":1,"f":"x"}'), encodeURIComponent('{"v":1}')]) {
    const c = cookieOf(`${WWW}/${AD}`, { cookie: `aag_click=${bad}` });
    assert.deepEqual(c.value, phase2(null, `${WWW}/${AD}`), bad);
  }
});
test('size cap: worst-case values stay under 3,000 encoded characters (4 KB browser limit) and click ids survive', () => {
  const hindi = encodeURIComponent('एल्गो ट्रेडिंग ऐप '.repeat(40));
  const q = '?' + ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'adgroup'].map((k) => `${k}=${hindi}`).join('&') +
    '&' + ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'].map((k) => `${k}=${'x'.repeat(5000)}`).join('&');
  const url = `${WWW}/${'p'.repeat(400)}${q}`;
  const once = mw.clickSetCookie(req(url, { referer: `https://${'r'.repeat(250)}.example.com/` }), NOW);
  const twice = mw.clickSetCookie(req(url, { cookie: once.split(';')[0], referer: `https://${'r'.repeat(250)}.example.com/` }), LATER);
  for (const header of [once, twice]) {
    const c = parseSetCookie(header);
    assert.ok(c.raw.length <= 3000, `value is ${c.raw.length}`);
    assert.ok(header.length < 3200, `header is ${header.length}`);
    for (const id of ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid']) assert.equal(c.value.f[id], 'x'.repeat(128), id);
  }
});
test('nothing personal: only the touch keys, no query values other than tags, no referrer path or query', () => {
  const url = `${WWW}/pricing?gclid=G1&email=aryan%40example.com&phone=9876543210&name=Aryan&otp=123456&token=SECRET&utm_campaign=c1`;
  const header = mw.clickSetCookie(req(url, { referer: 'https://mail.google.com/mail/u/0/?q=aryan%40example.com#inbox', cookie: 'session=SESSIONVALUE' }), NOW);
  const c = parseSetCookie(header);
  for (const bad of ['aryan', 'example.com', '9876543210', '123456', 'SECRET', 'SESSIONVALUE', '/mail/', 'inbox', 'email', 'phone']) {
    assert.ok(!decodeURIComponent(header).includes(bad), `cookie leaks ${bad}`);
  }
  for (const t of [c.value.f, c.value.l]) for (const k of Object.keys(t)) assert.ok(A.TOUCH_KEYS.includes(k), k);
  assert.equal(c.value.f.referrerHost, 'mail.google.com');
});
test('Vercel preview hosts get a host-only cookie (a .aagman.ai Domain would be rejected there)', () => {
  const c = cookieOf(`https://aagman-website-git-feat-x-kotilabs.vercel.app/${AD}`);
  assert.equal(c.attrs.domain, undefined);
  assert.equal(c.attrs.secure, true);
  assert.equal(cookieOf(`https://aagman.ai/${AD}`).attrs.domain, '.aagman.ai');
  assert.equal(cookieOf(`http://localhost:3000/${AD}`).attrs.secure, undefined, 'Secure only over https');
});
test('only GET page views: no cookie on POST, HEAD or OPTIONS', () => {
  for (const method of ['POST', 'HEAD', 'OPTIONS']) assert.equal(mw.clickSetCookie(req(`${WWW}/${AD}`, { method }), NOW), null, method);
});
test('never on forwarded app pages, /_next, or files', () => {
  for (const p of ['/stock/reliance', '/fund', '/chart/x', '/news', '/stock-screener/a', '/how-we-compute', '/llms.txt',
    '/sitemap-stocks.xml', '/_next/static/a.js', '/_next', '/analytics.js', '/og/home.png', '/sitemap.xml', '/robots.txt',
    '/blog/_astro/a.css', '/charts.html', '/favicon.ico']) {
    assert.equal(mw.clickSetCookie(req(`${WWW}${p}${AD}`), NOW), null, p);
    assert.equal(mw.isMarketingPage(p), false, p);
  }
  for (const p of ['/', '/charts', '/pricing/', '/blog', '/blog/why-options-buyers-lose-money', '/docs/how-to-prompt', '/invest/']) {
    assert.equal(mw.isMarketingPage(p), true, p);
  }
});
test('an internal error writes nothing and never throws', () => {
  assert.equal(mw.clickSetCookie(req(`${WWW}/${AD}`), new Date(NaN)), null);
});

// ---------- the middleware's response on a marketing page ----------
const upstream = (res) => res.headers.get('x-middleware-override-headers');
test('/?gclid=TEST&utm_source=test: continues to the page, with one Set-Cookie and nothing else', () => {
  const res = middleware(req(`${WWW}/${AD}`, { referer: 'https://www.google.com/' }));
  assert.equal(res.headers.get('x-middleware-next'), '1');
  assert.equal(upstream(res), null, 'request headers untouched');
  const cookies = res.headers.getSetCookie();
  assert.equal(cookies.length, 1);
  const c = parseSetCookie(cookies[0]);
  assert.equal(c.name, 'aag_click');
  assert.equal(c.value.f.gclid, 'TEST');
  assert.equal(c.value.f.source, 'test');
  assert.deepEqual([...res.headers.keys()].filter((k) => !k.startsWith('x-middleware-')), ['set-cookie']);
});
test('forwarded pages are exactly as before: secret and visitor headers, no Set-Cookie', () => {
  process.env.PUBLIC_EDGE_SECRET = 'a'.repeat(32) + '0123456789abcdef0123456789abcdef';
  try {
    const res = middleware(new Request(`${WWW}/stock/reliance${AD}`, { headers: { 'x-real-ip': '203.0.113.9' } }));
    assert.equal(res.headers.getSetCookie().length, 0);
    assert.equal(res.headers.get('x-middleware-request-x-aagman-edge-secret'), process.env.PUBLIC_EDGE_SECRET);
    assert.equal(res.headers.get('x-middleware-request-x-aagman-visitor-ip'), '203.0.113.9');
  } finally { delete process.env.PUBLIC_EDGE_SECRET; }
});
test('anything else that reaches it continues untouched', () => {
  for (const p of ['/og/home.png', '/_next/static/a.js', '/sitemap.xml']) {
    const res = middleware(req(`${WWW}${p}${AD}`));
    assert.equal(res.headers.get('x-middleware-next'), '1', p);
    assert.equal(res.headers.getSetCookie().length, 0, p);
    assert.equal(upstream(res), null, p);
  }
});

// ---------- analytics.js: skip the script write when the server already applied this visit ----------
test('clickApplied: the server cookie for this very visit counts as applied', () => {
  for (const [url, ref] of [[`${WWW}/${AD}`, ''], [`${WWW}/charts?utm_source=google&utm_term=x`, 'https://www.google.com/']]) {
    const u = new URL(url);
    const touch = A.touchFromUrl(u.search, ref, A.normalizePath(u.pathname), LATER, u.hostname);
    const server = cookieOf(url, { referer: ref }).value;
    assert.equal(A.clickApplied(server, touch), true, url);
  }
});
test('clickApplied: untagged visit with a usable cookie needs no write; no cookie or a broken one does', () => {
  const untagged = A.touchFromUrl('', '', '/pricing', NOW, 'www.aagman.ai');
  assert.equal(A.clickApplied(phase2(null, `${WWW}/${AD}`), untagged), true);
  for (const bad of [null, undefined, 'x', [], { v: 2, f: { landingPath: '/' } }, { v: 1 }, { v: 1, f: {} }]) {
    assert.equal(A.clickApplied(bad, untagged), false, JSON.stringify(bad));
  }
});
test('clickApplied: an ad visit the server did not record is not applied', () => {
  const old = phase2(null, `${WWW}/?gclid=OLD&utm_source=google`);
  const touch = A.touchFromUrl('?gclid=NEW&utm_source=google', '', '/', LATER, 'www.aagman.ai');
  assert.equal(A.clickApplied(old, touch), false);
  assert.equal(A.clickApplied(phase2(null, `${WWW}/`), touch), false, 'cookie with a first touch but no latest touch');
  assert.equal(A.clickApplied(old, A.touchFromUrl('?utm_source=google&utm_campaign=c2', '', '/', LATER, 'www.aagman.ai')), false);
});
test('clickApplied: tolerates tags the size cap really dropped, never a missing click id or a small cookie missing a tag', () => {
  const hindi = encodeURIComponent('एल्गो ट्रेडिंग ऐप '.repeat(40));
  const search = '?' + ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'adgroup'].map((k) => `${k}=${hindi}`).join('&') +
    '&' + ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'].map((k) => `${k}=${'x'.repeat(300)}`).join('&');
  const url = `${WWW}/charts${search}`;
  const first = cookieOf(url).value;
  const second = cookieOf(url, { cookie: asCookie(first) }, LATER).value;
  assert.ok(!('term' in second.l), 'the cap dropped the keyword from the latest touch');
  const touch = A.touchFromUrl(search, '', '/charts', LATER, 'www.aagman.ai');
  assert.equal(A.clickApplied(second, touch), true);
  const small = A.touchFromUrl('?gclid=G1&utm_term=long&utm_content=ad', '', '/', NOW, 'www.aagman.ai');
  assert.equal(A.clickApplied({ v: 1, f: { landingPath: '/' }, l: { gclid: 'G1', clickAt: small.clickAt } }, small), false, 'small cookie missing tags');
  assert.equal(A.clickApplied({ v: 1, f: { landingPath: '/' }, l: { term: 'long', content: 'ad' } }, small), false, 'missing click id');
});

test('clickApplied: a tag cut at a space by the 128 cap still matches the stored (trimmed) value', () => {
  const url = `${WWW}/?gclid=G1&utm_term=${'a'.repeat(127)}+b`;
  const u = new URL(url);
  const touch = A.touchFromUrl(u.search, '', '/', LATER, u.hostname);
  assert.equal(touch.term, 'a'.repeat(127) + ' ', 'the touch keeps the trailing space');
  assert.equal(A.clickApplied(cookieOf(url).value, touch), true);
});

// A page view in a simulated browser: document.cookie, location and referrer; Umami and GA4 calls are stubs.
function runPage(url, { cookies = {}, referrer = '' } = {}) {
  const jar = new Map(Object.entries(cookies));
  const writes = [];
  const u = new URL(url);
  const stubEl = () => ({ setAttribute() {} });
  const document = {
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join('; '); },
    set cookie(s) {
      writes.push(s);
      const nv = s.split(';')[0];
      jar.set(nv.slice(0, nv.indexOf('=')), nv.slice(nv.indexOf('=') + 1));
    },
    referrer,
    createElement: stubEl,
    head: { appendChild() {} },
    addEventListener() {},
    querySelectorAll: () => [],
  };
  const storage = { getItem: () => null, setItem() {}, removeItem() {} };
  const window = {
    document, location: { hostname: u.hostname, pathname: u.pathname, search: u.search, href: u.href, protocol: u.protocol },
    sessionStorage: storage, localStorage: storage, crypto: { getRandomValues: (b) => b.fill(7) },
    console: { log() {} }, setTimeout, clearTimeout, addEventListener() {}, removeEventListener() {},
  };
  vm.runInContext(CODE, vm.createContext({ window, URL, URLSearchParams, btoa }));
  return { writes, jar, clickWrites: writes.filter((w) => w.startsWith('aag_click=')) };
}

test('page script: after the server wrote this visit, it writes aag_trail and aag_vid but not aag_click', () => {
  const url = `${WWW}/${AD}`;
  const server = mw.clickSetCookie(req(url), NOW).split(';')[0].split('=')[1];
  const page = runPage(url, { cookies: { aag_click: server } });
  assert.deepEqual(page.clickWrites, []);
  assert.ok(page.writes.some((w) => w.startsWith('aag_trail=')), 'trail still written');
  assert.ok(page.writes.some((w) => w.startsWith('aag_vid=')), 'visitor id still written');
  assert.equal(page.jar.get('aag_click'), server);
});
test('page script: a later untagged page leaves the server cookie alone', () => {
  const server = mw.clickSetCookie(req(`${WWW}/${AD}`), NOW).split(';')[0].split('=')[1];
  assert.deepEqual(runPage(`${WWW}/pricing`, { cookies: { aag_click: server }, referrer: `${WWW}/` }).clickWrites, []);
});
test('fallback: with no server cookie (middleware did not run), the script writes it, phase 2 style', () => {
  const page = runPage(`${WWW}/charts${AD}`, { referrer: 'https://www.google.com/' });
  assert.equal(page.clickWrites.length, 1);
  const w = page.clickWrites[0];
  assert.match(w, /; max-age=7776000; path=\/; domain=\.aagman\.ai; SameSite=Lax; Secure$/);
  const value = A.parseClick(w.split(';')[0].split('=')[1]);
  assert.equal(value.f.gclid, 'TEST');
  assert.equal(value.f.landingPath, '/charts');
  assert.equal(value.f.referrerHost, 'www.google.com');
});
test('fallback: an ad visit the server did not record is added by the script, first touch kept', () => {
  const old = phase2(null, `${WWW}/?utm_source=newsletter`);
  const page = runPage(`${WWW}/?gclid=NEW&utm_source=google`, { cookies: { aag_click: A.serializeClick(old) } });
  assert.equal(page.clickWrites.length, 1);
  const value = A.parseClick(page.clickWrites[0].split(';')[0].split('=')[1]);
  assert.deepEqual(value.f, old.f);
  assert.equal(value.l.gclid, 'NEW');
});
test('fallback: a broken cookie is replaced by the script', () => {
  const page = runPage(`${WWW}/`, { cookies: { aag_click: 'garbage' } });
  assert.equal(page.clickWrites.length, 1);
  assert.deepEqual(A.parseClick(page.clickWrites[0].split(';')[0].split('=')[1]), { v: 1, f: { landingPath: '/' } });
});

// ---------- the contract ----------
test('docs/analytics.md has the phase 3 section', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/analytics.md'), 'utf8');
  const s15 = doc.slice(doc.indexOf('## 15.'));
  assert.ok(/## 15\. Phase 3/.test(doc));
  assert.ok(!/to be written/i.test(s15), 'section 15 is written');
  for (const must of ['Set-Cookie', 'middleware.ts', 'clickApplied', 'fallback', 'Safari']) assert.ok(s15.includes(must), must);
});

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  console.error(`click-cookie.test.mjs: ${failures.length} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`click-cookie.test.mjs: all ${passed} tests passed`);
