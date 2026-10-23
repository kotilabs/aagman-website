// Tests for analytics.js and its contract, docs/analytics.md.
// Run: node tests/analytics.test.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const A = require('../analytics.js');
const { classifyClick, normalizePath, pageName, itemFor, environment, newVisitorId } = A;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let passed = 0;
const docText = fs.readFileSync(path.join(ROOT, 'docs/analytics.md'), 'utf8');
const code = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
const test = (name, fn) => { fn(); passed++; };
const HOST = 'www.aagman.ai';
const d = (over) => ({ href: '', dataset: {}, section: 'body', area: null, pageHost: HOST, ...over });

// ---------- paths and names ----------
test('normalizePath', () => {
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('/index.html'), '/');
  assert.equal(normalizePath('/charts.html'), '/charts');
  assert.equal(normalizePath('/charts/'), '/charts');
  assert.equal(normalizePath('/blog/why-options-buyers-lose-money/'), '/blog/why-options-buyers-lose-money');
  assert.equal(normalizePath(''), '/');
});
test('pageName', () => {
  assert.equal(pageName('/'), 'home');
  assert.equal(pageName('/charts'), 'charts');
  assert.equal(pageName('/privacy-policy'), 'privacy_policy');
  assert.equal(pageName('/docs/how-to-prompt'), 'docs_how_to_prompt');
});
test('itemFor', () => {
  assert.equal(itemFor('/', '#founders'), 'founders_letter');
  assert.equal(itemFor('/', ''), 'home');
  assert.equal(itemFor('/picks', ''), 'picks');
  assert.equal(itemFor('/blog/some-post', ''), 'blog');
  assert.equal(itemFor('/invest', ''), 'investors');
  assert.equal(itemFor('/nope', ''), null);
});
test('environment', () => {
  assert.equal(environment('www.aagman.ai'), 'live');
  assert.equal(environment('aagman.ai'), 'live');
  assert.equal(environment('aagman-website-git-feat-x-kotilabs.vercel.app'), 'preview');
  assert.equal(environment('localhost'), 'local');
  assert.equal(environment('aagman-landing-preview.aagman-first-fold.workers.dev'), 'local');
});
test('visitor id is 22 url-safe characters', () => {
  const id = newVisitorId(new Uint8Array(16).fill(255));
  assert.match(id, /^[A-Za-z0-9_-]{22}$/);
});

// ---------- 1. cta_click ----------
test('Sign up in the hero', () => {
  assert.deepEqual(classifyClick(d({ href: 'https://app.aagman.ai/login', section: 'hero' }), '/'),
    { name: 'cta_click', params: { label: 'sign_up', section: 'hero', spot: 'home.hero' } });
});
test('Sign up in the header and on a product page close', () => {
  assert.deepEqual(classifyClick(d({ href: 'https://app.aagman.ai/login', section: 'header', area: 'header' }), '/charts'),
    { name: 'cta_click', params: { label: 'sign_up', section: 'header', spot: 'charts.header' } });
  assert.deepEqual(classifyClick(d({ href: 'https://app.aagman.ai/', section: 'close' }), '/pricing'),
    { name: 'cta_click', params: { label: 'sign_up', section: 'close', spot: 'pricing.close' } });
});
test('Talk to founders and WhatsApp', () => {
  assert.equal(classifyClick(d({ href: 'https://dub.sh/fZsnb0w', section: 'hero' }), '/').params.label, 'talk_to_founders');
  assert.deepEqual(classifyClick(d({ href: 'https://chat.whatsapp.com/JglEOeeQTF6AcmJCxenkzW', section: 'community' }), '/pricing'),
    { name: 'cta_click', params: { label: 'join_whatsapp', section: 'community', spot: 'pricing.community' } });
});
test('legacy data-cta="primary" still counts as sign_up', () => {
  assert.equal(classifyClick(d({ href: 'https://app.aagman.ai/login', dataset: { cta: 'primary' } }), '/docs').params.label, 'sign_up');
});

// ---------- 2. app_link_click ----------
test('other app links', () => {
  assert.deepEqual(classifyClick(d({ href: 'https://app.aagman.ai/how-we-grade', section: 'onward' }), '/picks'),
    { name: 'app_link_click', params: { section: 'onward', target: '/how-we-grade' } });
});

// ---------- 3. card_click ----------
test('homepage product cards and onward cards', () => {
  assert.deepEqual(classifyClick(d({ href: '/charts', section: 'products' }), '/'),
    { name: 'card_click', params: { card: 'charts', section: 'products' } });
  assert.deepEqual(classifyClick(d({ href: '/deploy', section: 'onward' }), '/research'),
    { name: 'card_click', params: { card: 'deploy', section: 'onward' } });
});
test('marked action cards on Picks', () => {
  assert.deepEqual(classifyClick(d({ href: '/deploy', dataset: { card: 'paper_first' }, section: 'your_call' }), '/picks'),
    { name: 'card_click', params: { card: 'paper_first', section: 'your_call' } });
});

// ---------- 4. nav_click ----------
test('menu, header and footer links', () => {
  assert.deepEqual(classifyClick(d({ href: '/research', section: 'header', area: 'menu' }), '/'),
    { name: 'nav_click', params: { area: 'menu', item: 'research' } });
  assert.deepEqual(classifyClick(d({ href: '/pricing', section: 'header', area: 'header' }), '/'),
    { name: 'nav_click', params: { area: 'header', item: 'pricing' } });
  assert.deepEqual(classifyClick(d({ href: 'https://www.aagman.ai/blog/', section: 'header', area: 'menu' }), '/'),
    { name: 'nav_click', params: { area: 'menu', item: 'blog' } });
  assert.deepEqual(classifyClick(d({ href: '/#founders', section: 'footer', area: 'footer' }), '/charts'),
    { name: 'nav_click', params: { area: 'footer', item: 'founders_letter' } });
  assert.deepEqual(classifyClick(d({ href: '/picks', section: 'footer', area: 'footer' }), '/terms'),
    { name: 'nav_click', params: { area: 'footer', item: 'picks' } });
});
test('docs and blog links count as internal on a preview host too', () => {
  const r = classifyClick(d({ href: 'https://www.aagman.ai/docs/', area: 'menu', pageHost: 'x.vercel.app' }), '/');
  assert.deepEqual(r, { name: 'nav_click', params: { area: 'menu', item: 'docs' } });
});

// ---------- 5-7. leaving the site ----------
test('email, social and other sites', () => {
  assert.deepEqual(classifyClick(d({ href: 'mailto:growth@kotilabs.com?subject=hi', section: 'footer', area: 'footer' }), '/'),
    { name: 'contact_click', params: { inbox: 'growth', section: 'footer' } });
  assert.deepEqual(classifyClick(d({ href: 'https://www.linkedin.com/in/ajitk2003/', section: 'letter' }), '/'),
    { name: 'social_click', params: { platform: 'linkedin.com', section: 'letter' } });
  assert.deepEqual(classifyClick(d({ href: 'https://example.com/a?b=c', section: 'body' }), '/docs'),
    { name: 'outbound_click', params: { href: 'https://example.com/a', section: 'body' } });
});

test('dub.sh links to our social profiles count as social', () => {
  assert.equal(classifyClick(d({ href: 'https://dub.sh/lp-linkedin', area: 'footer', section: 'footer' }), '/invest').params.platform, 'linkedin.com');
  assert.equal(classifyClick(d({ href: 'https://dub.sh/x-lp' }), '/invest').params.platform, 'x.com');
  assert.equal(classifyClick(d({ href: 'https://dub.sh/insta-lp' }), '/invest').params.platform, 'instagram.com');
});
test('no email address ever leaves in an event', () => {
  const r = classifyClick(d({ href: 'mailto:ajit@kotilabs.com' }), '/invest');
  assert.deepEqual(r, { name: 'contact_click', params: { inbox: 'ajit', section: 'body' } });
  assert.ok(!JSON.stringify(r).includes('@'));
});
test('relative links resolve against the page they are on', () => {
  const r = classifyClick(d({ href: 'connect-zerodha.html', base: 'https://www.aagman.ai/docs/how-to-prompt.html', area: 'header' }), '/docs/how-to-prompt');
  assert.deepEqual(r, { name: 'nav_click', params: { area: 'header', item: 'docs' } });
});

test('phone and tablet menu: product links are nav clicks, Sign up reports the menu spot', () => {
  assert.deepEqual(classifyClick(d({ href: '/charts', section: 'menu', area: 'menu' }), '/research'),
    { name: 'nav_click', params: { area: 'menu', item: 'charts' } });
  assert.deepEqual(classifyClick(d({ href: 'https://app.aagman.ai/login', section: 'menu', area: 'menu' }), '/research'),
    { name: 'cta_click', params: { label: 'sign_up', section: 'menu', spot: 'research.menu' } });
  assert.deepEqual(classifyClick(d({ href: 'https://dub.sh/fZsnb0w', section: 'menu', area: 'menu' }), '/'),
    { name: 'cta_click', params: { label: 'talk_to_founders', section: 'menu', spot: 'home.menu' } });
});
test('every page with the new header has the phone menu, wired for tracking', () => {
  for (const f of ['index.html', 'research.html', 'charts.html', 'backtesting.html', 'picks.html', 'deploy.html', 'pricing.html', 'terms.html']) {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(html.includes('class="mn-btn"') && html.includes('id="mn-sheet"') && html.includes('data-section="menu"'), f);
  }
  assert.ok(code.includes("'.mn-sheet") || code.includes('.mn-sheet'), 'analytics.js treats the phone menu as a menu');
  assert.ok(code.includes("menu: 'mobile'"), 'analytics.js sends nav_open for the phone menu');
});

// ---------- no event ----------
test('in-page anchors and unknown internal links send nothing', () => {
  assert.equal(classifyClick(d({ href: '#faq' }), '/'), null);
  assert.equal(classifyClick(d({ href: '/pricing', section: 'included' }), '/pricing'), null);
  assert.equal(classifyClick(d({ href: '/nope', area: 'footer' }), '/'), null);
  assert.equal(classifyClick(d({ href: 'javascript:void(0)' }), '/'), null);
  assert.equal(classifyClick(null, '/'), null);
});

// ---------- phase 2: click cookie, trail cookie, Sign up hand-off, Umami strip ----------
const { touchFromUrl, updateClick, updateTrail, setTrailSpot, handoffUrl, umamiUrl, umamiReferrer, umamiBeforeSend, signupClick, TOUCH_KEYS } = A;
const AD = '?gclid=G1&utm_source=google&utm_medium=cpc&utm_campaign=123&adgroup=456&utm_term=algo+app&utm_content=789';
const NOW = new Date('2026-10-23T05:30:00.000Z');

test('cookie names and lifetimes', () => {
  assert.equal(A.CONFIG.clickCookie, 'aag_click');
  assert.equal(A.CONFIG.clickDays, 90);
  assert.equal(A.CONFIG.trailCookie, 'aag_trail');
  assert.equal(A.CONFIG.trailDays, 30);
});
test('an ad visit becomes a touch: tags, ad group, click id and time, landing page, referrer', () => {
  assert.deepEqual(touchFromUrl(AD, 'https://www.google.com/', '/charts', NOW, HOST), {
    source: 'google', medium: 'cpc', campaign: '123', adGroup: '456', term: 'algo app', content: '789',
    gclid: 'G1', clickAt: '2026-10-23T05:30:00.000Z', landingPath: '/charts', referrerHost: 'www.google.com'
  });
});
test('every click id is caught; clickAt only comes with one', () => {
  for (const id of ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid']) {
    assert.equal(touchFromUrl('?' + id + '=X', '', '/', NOW, HOST)[id], 'X');
  }
  assert.equal(touchFromUrl('?utm_source=newsletter', '', '/', NOW, HOST).clickAt, undefined);
});
test('our own sites are not a referrer; values are capped at 128', () => {
  assert.equal(touchFromUrl('', 'https://www.aagman.ai/pricing', '/charts', NOW, HOST).referrerHost, undefined);
  assert.equal(touchFromUrl('', 'https://app.aagman.ai/x', '/charts', NOW, HOST).referrerHost, undefined);
  assert.equal(touchFromUrl('?utm_campaign=' + 'c'.repeat(500), '', '/', NOW, HOST).campaign.length, 128);
});
test('first visit is kept as the first touch, even a direct one', () => {
  const direct = touchFromUrl('', '', '/', NOW, HOST);
  assert.deepEqual(updateClick(null, direct), { v: 1, f: { landingPath: '/' } });
  const ad = touchFromUrl(AD, 'https://www.google.com/', '/charts', NOW, HOST);
  const c = updateClick(null, ad);
  assert.deepEqual(c.f, ad);
  assert.deepEqual(c.l, { source: 'google', medium: 'cpc', campaign: '123', adGroup: '456', term: 'algo app', content: '789', gclid: 'G1', clickAt: '2026-10-23T05:30:00.000Z' });
});
test('a later ad visit updates the latest touch and never the first', () => {
  const first = updateClick(null, touchFromUrl('', 'https://news.ycombinator.com/', '/', NOW, HOST));
  const later = updateClick(first, touchFromUrl('?gbraid=IPH&utm_source=google&utm_medium=cpc', '', '/pricing', NOW, HOST));
  assert.deepEqual(later.f, first.f);
  assert.deepEqual(later.l, { source: 'google', medium: 'cpc', gbraid: 'IPH', clickAt: '2026-10-23T05:30:00.000Z' });
});
test('an untagged later visit keeps both touches as they were (the cookie is only re-dated)', () => {
  const first = updateClick(null, touchFromUrl(AD, '', '/charts', NOW, HOST));
  assert.deepEqual(updateClick(first, touchFromUrl('', 'https://www.google.com/', '/pricing', NOW, HOST)), first);
});
test('a malformed or foreign cookie is replaced, not trusted', () => {
  const ad = touchFromUrl(AD, '', '/charts', NOW, HOST);
  for (const bad of [{ v: 9, f: { gclid: 'OLD' } }, 'nope', [], { v: 1 }]) assert.deepEqual(updateClick(bad, ad).f, ad);
});
test('a full click cookie stays under 1 KB', () => {
  const ad = touchFromUrl(AD + '&gbraid=' + 'g'.repeat(100), 'https://www.google.com/', '/charts', NOW, HOST);
  const c = updateClick(updateClick(null, ad), ad);
  assert.ok(encodeURIComponent(JSON.stringify(c)).length < 1024);
});
test('the trail keeps the last 12 pages with times, without repeating a reload', () => {
  let tr = null;
  for (let i = 0; i < 15; i++) tr = updateTrail(tr, '/p' + i, 1729661400 + i);
  const pages = tr.p.split('|');
  assert.equal(pages.length, 12);
  assert.equal(pages[0], '/p3@1729661403');
  assert.equal(pages[11], '/p14@1729661414');
  assert.equal(updateTrail(tr, '/p14', 1729669999).p, tr.p);
});
test('the Sign up spot rides the trail cookie', () => {
  const tr = setTrailSpot(updateTrail(null, '/charts', 1729661400), 'charts.hero');
  assert.deepEqual(tr, { v: 1, p: '/charts@1729661400', s: 'charts.hero' });
  assert.equal(updateTrail(tr, '/pricing', 1729661460).s, 'charts.hero');
  assert.deepEqual(setTrailSpot(null, 'home.menu'), { v: 1, p: '', s: 'home.menu' });
});
test('Sign up hand-off: the link carries the spot and the latest touch', () => {
  const first = updateClick(null, touchFromUrl('?gclid=G1&utm_source=google', '', '/', NOW, HOST));
  const both = updateClick(first, touchFromUrl(AD.replace('G1', 'G2'), '', '/charts', NOW, HOST));
  assert.equal(handoffUrl('https://app.aagman.ai/login', 'charts.hero', both),
    'https://app.aagman.ai/login?src=charts.hero&utm_source=google&utm_medium=cpc&utm_campaign=123&utm_term=algo+app&utm_content=789&adgroup=456&gclid=G2');
  assert.equal(handoffUrl('https://app.aagman.ai/login', 'home.hero', first),
    'https://app.aagman.ai/login?src=home.hero&utm_source=google&gclid=G1');
});
test('Sign up hand-off without a click cookie, and keeping params already on the link', () => {
  assert.equal(handoffUrl('https://app.aagman.ai/login', 'pricing.plans', null), 'https://app.aagman.ai/login?src=pricing.plans');
  assert.equal(handoffUrl('https://app.aagman.ai/login?next=%2Fcharts&src=keep', 'x.y', null), 'https://app.aagman.ai/login?next=%2Fcharts&src=keep');
});
test('the hand-off only touches app links', () => {
  assert.equal(handoffUrl('https://dub.sh/fZsnb0w', 'home.menu', null), 'https://dub.sh/fZsnb0w');
  assert.equal(handoffUrl('/pricing', 'home.hero', null), '/pricing');
});
test('Umami keeps only utm_* tags from the page URL: every click id, linker and tracker parameter goes', () => {
  assert.equal(umamiUrl('https://www.aagman.ai/charts?utm_source=google&gclid=X&gbraid=Y&wbraid=Z&fbclid=F&msclkid=M&x=1#h'),
    'https://www.aagman.ai/charts?utm_source=google#h');
  assert.equal(umamiUrl('https://www.aagman.ai/?GCLID=X&_gl=1*abc*_gcl_aw*R0NMLjE&dclid=D&twclid=T&li_fat_id=L&ttclid=TT&igshid=I&srsltid=S&rdt_cid=R&mc_eid=E&_hsenc=H&src=charts.hero'),
    'https://www.aagman.ai/');
  assert.equal(umamiUrl('https://www.aagman.ai/pricing#gclid=X'), 'https://www.aagman.ai/pricing');
  assert.equal(umamiUrl('https://www.aagman.ai/#founders'), 'https://www.aagman.ai/#founders');
  assert.equal(umamiUrl('https://www.aagman.ai/?UTM_Campaign=phase2'), 'https://www.aagman.ai/?UTM_Campaign=phase2');
  assert.equal(umamiUrl(''), '');
  assert.equal(umamiUrl(undefined), undefined);
});
test('Umami gets only the origin of the referrer', () => {
  assert.equal(umamiReferrer('https://l.facebook.com/l.php?u=x&fbclid=F'), 'https://l.facebook.com');
  assert.equal(umamiReferrer('https://www.google.com/'), 'https://www.google.com');
  assert.equal(umamiReferrer(''), '');
  assert.equal(umamiReferrer('not a url'), '');
});
test('the before-send hook scrubs every send', () => {
  const p = umamiBeforeSend('event', { url: 'https://www.aagman.ai/?gclid=TEST123&utm_campaign=phase2', referrer: 'https://l.facebook.com/?fbclid=F', name: 'cta_click' });
  assert.deepEqual(p, { url: 'https://www.aagman.ai/?utm_campaign=phase2', referrer: 'https://l.facebook.com', name: 'cta_click' });
  assert.ok(!JSON.stringify(p).includes('TEST123'));
});
test('a later tagged visit without a click id keeps the latest Google click', () => {
  let c = updateClick(null, touchFromUrl('', '', '/', NOW, HOST));
  c = updateClick(c, touchFromUrl('?gclid=G2&utm_source=google&utm_medium=cpc', '', '/charts', NOW, HOST));
  const later = new Date('2026-10-25T05:30:00.000Z');
  c = updateClick(c, touchFromUrl('?utm_source=newsletter&utm_medium=email', '', '/pricing', later, HOST));
  assert.deepEqual(c.l, { source: 'newsletter', medium: 'email', gclid: 'G2', clickAt: '2026-10-23T05:30:00.000Z' });
  assert.match(handoffUrl('https://app.aagman.ai/login', 'pricing.plans', c), /gclid=G2/);
  // a newer click id replaces the older ones
  c = updateClick(c, touchFromUrl('?wbraid=W3', '', '/', later, HOST));
  assert.deepEqual(c.l, { wbraid: 'W3', clickAt: '2026-10-25T05:30:00.000Z' });
});
test('a cookie with v:1 but a broken first touch is replaced', () => {
  const ad = touchFromUrl(AD, '', '/charts', NOW, HOST);
  for (const bad of [{ v: 1, f: 'str' }, { v: 1, f: { source: 7 } }, { v: 1, f: [] }]) assert.deepEqual(updateClick(bad, ad).f, ad);
});
test('non-ASCII and worst-case values still fit: every value under 200 encoded characters, the cookie under 3 KB', () => {
  const hindi = 'एल्गो ट्रेडिंग ऐप '.repeat(20);
  const q = '?' + ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'adgroup'].map((k) => k + '=' + encodeURIComponent(hindi)).join('&') +
    '&' + ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'].map((k) => k + '=' + 'x'.repeat(300)).join('&');
  const t1 = touchFromUrl(q, 'https://' + 'r'.repeat(250) + '.example.com/', '/' + 'p'.repeat(300), NOW, HOST);
  for (const v of Object.values(t1)) assert.ok(encodeURIComponent(v).length <= 200, v.slice(0, 20));
  const c = updateClick(updateClick(null, t1), t1);
  const size = encodeURIComponent(JSON.stringify(c)).length;
  assert.ok(size <= 3000, 'aag_click is ' + size);
  assert.ok(c.f.gclid && c.l.gclid, 'click ids survive the fit');
});
test('NUL, control characters and half an emoji never reach a cookie (the app database rejects them)', () => {
  const t1 = touchFromUrl('?utm_source=x%00y&utm_campaign=' + encodeURIComponent('a\u0007b') + '&utm_term=' + encodeURIComponent('😀'.repeat(70)), '', '/', NOW, HOST);
  assert.equal(t1.source, 'xy');
  assert.equal(t1.campaign, 'ab');
  assert.ok(t1.term.length <= 128 && t1.term.length % 2 === 0, 'emoji are never cut in half');
  assert.doesNotThrow(() => encodeURIComponent(t1.term));
  const lone = updateClick({ v: 1, f: { source: 'a\uD800b' } }, {});
  assert.equal(lone.f.source, 'ab');
});
test('trail paths are capped and cannot break the format', () => {
  const tr = updateTrail(null, '/a@b|c' + 'x'.repeat(300), 1729661400);
  assert.ok(!tr.p.split('@')[0].includes('|'));
  assert.equal(tr.p.split('|').length, 1);
  assert.ok(tr.p.length <= 128 + 11);
});
test('a bare app link is handed over through the login page, and signed-in people still go straight in', () => {
  assert.equal(handoffUrl('https://app.aagman.ai', 'home.hero', null), 'https://app.aagman.ai/login?next=%2Ftrading-strategy&src=home.hero');
  assert.equal(handoffUrl('https://app.aagman.ai/', 'home.nav', null), 'https://app.aagman.ai/login?next=%2Ftrading-strategy&src=home.nav');
});
test('the hand-off link never carries Meta or Microsoft click ids (link URLs can be logged by other tools)', () => {
  const c = updateClick(null, touchFromUrl('?fbclid=FB1&msclkid=MS1&utm_source=facebook&utm_medium=paid', '', '/', NOW, HOST));
  const href = handoffUrl('https://app.aagman.ai/login', 'home.hero', c);
  assert.ok(!/fbclid|msclkid|FB1|MS1/.test(href), href);
  assert.match(href, /utm_source=facebook/);
  assert.equal(c.f.fbclid, 'FB1', 'the cookie still holds it for the app');
});
test('only https app links are rewritten', () => {
  for (const href of ['javascript://app.aagman.ai/%0Aalert(1)', 'http://app.aagman.ai/login']) {
    assert.equal(handoffUrl(href, 'home.hero', null), href);
    assert.equal(signupClick(href, 'home.hero', null, null), null);
  }
});
test('a Sign up click: the spot goes into the trail and the link gets the hand-off', () => {
  const click = updateClick(null, touchFromUrl(AD, '', '/charts', NOW, HOST));
  const out = signupClick('https://app.aagman.ai/login', 'charts.hero', updateTrail(null, '/charts', 1729661400), click);
  assert.equal(out.trail.s, 'charts.hero');
  assert.equal(out.trail.p, '/charts@1729661400');
  assert.match(out.href, /^https:\/\/app\.aagman\.ai\/login\?src=charts\.hero&.*gclid=G1/);
  assert.equal(signupClick('https://dub.sh/fZsnb0w', 'home.menu', null, click), null, 'not an app link: nothing to do');
});
test('the Umami script is wired to the strip, loads without cookies, and Sign up clicks use signupClick', () => {
  const browser = code.split('// ---------- browser only below ----------')[1];
  assert.ok(browser.includes("us.setAttribute('data-before-send', 'aagUmamiBeforeSend')"), 'Umami script has data-before-send');
  assert.ok(browser.includes('root.aagUmamiBeforeSend = umamiBeforeSend'), 'the before-send hook is a global');
  assert.ok(browser.includes("us.crossOrigin = 'anonymous'"), 'script.js is fetched without our cookies');
  assert.ok(/var hand = signupClick\(/.test(browser) && /el\.setAttribute\('href', hand\.href\)/.test(browser), 'clicks rewrite Sign up links via signupClick');
});
test('the touch keys are the ones the framework documents for the app', () => {
  const section14 = docText.split('## 14. Phase 2')[1].split('\n## ')[0];
  for (const k of TOUCH_KEYS) assert.ok(section14.includes('`' + k + '`'), k);
  for (const k of ['aag_click', 'aag_trail', 'src', 'aagUmamiBeforeSend', 'crossorigin', 'next=/trading-strategy']) assert.ok(section14.includes(k), k);
});

// ---------- contract: code, pages and docs/analytics.md agree ----------
test('every event the code sends is in the framework, and the reverse', () => {
  const section5 = docText.split('## 5. Events')[1].split('\n## ')[0];
  const documented = new Set([...section5.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]));
  const sent = new Set([...code.matchAll(/(?:track\(|name: )'([a-z_]+)'/g)].map((m) => m[1]));
  assert.deepEqual([...sent].sort(), [...documented].sort());
});
test('every section name on every page is in the framework', () => {
  const section4 = docText.split('## 4. Pages and section names')[1].split('\n## ')[0];
  const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  for (const f of pages) {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of html.matchAll(/data-section="([a-z_]+)"/g)) {
      assert.ok(section4.includes('`' + m[1] + '`'), `${f}: section "${m[1]}" is not in docs/analytics.md section 4`);
    }
  }
});
test('every FAQ question name on the homepage is in the framework', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const m of html.matchAll(/data-question="([a-z_]+)"/g)) assert.ok(docText.includes('`' + m[1] + '`'), m[1]);
});
test('no page loads the removed trackers', () => {
  const files = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    if (['node_modules', '.git', 'dist', 'tests', 'docs'].includes(e.name) && dir === ROOT) { if (e.name !== 'docs') return; }
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.git', 'dist', '.astro'].includes(e.name)) walk(p); }
    else if (/\.(html|astro)$/.test(e.name)) files.push(p);
  });
  walk(ROOT);
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const bad of ['googletagmanager.com/gtm.js', 'GTM-T72DN6HQ', 'piqo.app', "document.cookie = 'gclid="]) {
      assert.ok(!s.includes(bad), `${path.relative(ROOT, f)} still has ${bad}`);
    }
  }
});

console.log(`analytics tests: ${passed} passed`);
