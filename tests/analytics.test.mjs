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
    { name: 'contact_click', params: { href: 'mailto:growth@kotilabs.com', section: 'footer' } });
  assert.deepEqual(classifyClick(d({ href: 'https://www.linkedin.com/in/ajitk2003/', section: 'letter' }), '/'),
    { name: 'social_click', params: { platform: 'linkedin.com', section: 'letter' } });
  assert.deepEqual(classifyClick(d({ href: 'https://example.com/a?b=c', section: 'body' }), '/docs'),
    { name: 'outbound_click', params: { href: 'https://example.com/a', section: 'body' } });
});

// ---------- no event ----------
test('in-page anchors and unknown internal links send nothing', () => {
  assert.equal(classifyClick(d({ href: '#faq' }), '/'), null);
  assert.equal(classifyClick(d({ href: '/pricing', section: 'included' }), '/pricing'), null);
  assert.equal(classifyClick(d({ href: '/nope', area: 'footer' }), '/'), null);
  assert.equal(classifyClick(d({ href: 'javascript:void(0)' }), '/'), null);
  assert.equal(classifyClick(null, '/'), null);
});

// ---------- contract: code, pages and docs/analytics.md agree ----------
const docText = fs.readFileSync(path.join(ROOT, 'docs/analytics.md'), 'utf8');
const code = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
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
