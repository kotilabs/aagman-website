// Tests for forwarding the app's public pages from www.aagman.ai to the app server.
// Run: npm test   (or: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/forwarding.test.mjs)
//
// What is checked:
//  - vercel.json: every forwarded path is rewritten to https://app.aagman.ai/<same path>,
//    no marketing path is, and /charts, /chartered (and other look-alikes) are not.
//    Matching uses @vercel/routing-utils, the package Vercel uses to turn vercel.json
//    into routes, so the regexes are the real ones.
//  - middleware.ts: runs on the same paths, and sets the edge-secret header only
//    when PUBLIC_EDGE_SECRET is set (and well-formed), the visitor-IP header from the
//    real client address, and never passes through a client's own copy of either.
//    Since phase 3 it also runs on the marketing pages (one extra matcher, last), where
//    it only adds the aag_click cookie and never touches the request: see
//    tests/click-cookie.test.mjs and docs/analytics.md section 15.
//  - robots.txt: unchanged lines kept, the three app sitemap files added.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getTransformedRoutes, sourceToRegex } = require('@vercel/routing-utils');
// Vercel compiles a middleware matcher with path-to-regexp 6 and its default options
// (getRegExpFromMatchers in @vercel/node); routing-utils ships 6.1.0 and 6.3.0.
const pathToRegexpVersions = [require('path-to-regexp'), require('path-to-regexp-updated')];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = 'https://app.aagman.ai';
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Every check runs and is counted, so a failing run reports how many failed.
let checks = 0;
const failures = [];
const ok = (cond, msg) => { checks++; if (!cond) failures.push(msg); };
const eq = (a, b, msg) => {
  checks++;
  try { assert.deepEqual(a, b); } catch { failures.push(`${msg} (got ${JSON.stringify(a)})`); }
};

// ---------------------------------------------------------------------------
// The contract (deploy/docs/public-zone-edge.md in the app repo, plus the
// owner's list): these paths, and only these, go to the app server.
// ---------------------------------------------------------------------------
const FORWARDED = [
  '/stock',
  '/stock/reliance',
  '/stock/reliance/opengraph-image',
  '/fund',
  '/fund/parag-parikh-flexi-cap-fund-direct-plan-growth',
  '/stock-screener',
  '/stock-screener/defence-stocks',
  '/how-we-compute',
  '/how-we-compute/opengraph-image?abc',
  '/chart',
  '/chart/reliance',
  '/news',
  '/news/rbi-holds-rates',
  '/_next/static/x.js',
  '/_next/static/chunks/main-abc123.js',
  '/_next/static/css/app.css',
  '/_next/image',
  '/sitemap-stocks.xml',
  '/sitemap-funds.xml',
  '/sitemap-screens.xml',
  '/sitemap-charts.xml',
  '/sitemap-news.xml',
  '/llms.txt',
  '/0ea2491ba8dc98fd3c8de4a2fb8998ca.txt',
];

// Look-alikes and app paths that must stay on the marketing site.
const NOT_FORWARDED = [
  '/charts', '/charts/x', '/chartered', '/chart-of-accounts', '/chart.txt',
  '/stocks', '/stockx', '/stock-screeners', '/stock-screener-x',
  '/funds', '/fund-x', '/fundamentals',
  '/newsletter', '/newsroom', '/news-x',
  '/how-we-compute-2', '/how-we-computed', '/how-we-grade',
  '/sitemap.xml', '/sitemap-index.xml', '/sitemap-0.xml', '/sitemap-pulse.xml',
  '/blog/sitemap-index.xml', '/blog/sitemap-0.xml',
  '/llms-full.txt', '/robots.txt', '/0ea2491ba8dc98fd3c8de4a2fb8998ca', '/0ea2491ba8dc98fd3c8de4a2fb8998cb.txt', '/x/0ea2491ba8dc98fd3c8de4a2fb8998ca.txt',
  '/_nextx', '/_next-x', '/x/_next/static/a.js',
  '/pulse', '/pulse/feed.xml', '/login', '/api/x', '/securities/screener',
  '/blog/stock/reliance', '/docs/chart', '/x/stock',
];

// Every path the marketing site serves today: the files that end up in
// blog/dist (root files copied by blog/scripts/copy-root-assets.js, plus
// the Astro blog when it has been built), their clean-URL forms, and every
// <loc> in sitemap.xml.
function marketingPaths() {
  const exclude = new Set(['.git', '.gitignore', 'README.md', 'blog', 'node_modules',
    'package.json', 'package-lock.json', 'vercel.json', 'middleware.ts']);
  const files = [];
  const walk = (dir, rel) => {
    for (const entry of fs.readdirSync(dir)) {
      if (rel === '' && exclude.has(entry)) continue;
      const abs = path.join(dir, entry);
      const r = `${rel}/${entry}`;
      if (fs.statSync(abs).isDirectory()) walk(abs, r); else files.push(r);
    }
  };
  walk(ROOT, '');
  const dist = path.join(ROOT, 'blog', 'dist', 'blog');
  if (fs.existsSync(dist)) walk(dist, '/blog');
  for (const page of fs.readdirSync(path.join(ROOT, 'blog', 'src', 'pages'))) {
    if (!page.startsWith('[')) files.push(`/blog/${page.replace(/\.astro$/, '')}`);
  }
  const out = new Set(['/', '/blog', '/blog/', '/docs', '/docs/', '/invest', '/invest/']);
  for (const f of files) {
    out.add(f);
    if (f.endsWith('.html')) {
      out.add(f.slice(0, -5));
      if (f.endsWith('/index.html')) { out.add(f.slice(0, -10)); out.add(f.slice(0, -11) || '/'); }
    }
  }
  for (const [, loc] of read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    out.add(new URL(loc).pathname);
  }
  return [...out].sort();
}
const MARKETING = marketingPaths();
ok(MARKETING.length > 40, `found the marketing site's paths (${MARKETING.length})`);

// ---------------------------------------------------------------------------
// vercel.json
// ---------------------------------------------------------------------------
const vercel = JSON.parse(read('vercel.json'));
const rewrites = vercel.rewrites ?? [];
ok(rewrites.length > 0, 'vercel.json has rewrites');

// Existing settings are untouched.
eq(vercel.buildCommand, 'cd blog && npm install && npm run build', 'buildCommand unchanged');
eq(vercel.outputDirectory, 'blog/dist', 'outputDirectory unchanged');
eq(vercel.cleanUrls, true, 'cleanUrls unchanged');
eq(vercel.headers, [{ source: '/vendor/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }], 'headers unchanged');

for (const r of rewrites) {
  ok(r.destination.startsWith(`${APP}/`), `rewrite ${r.source} goes to the app server`);
  ok(!/\*\)?$/.test(r.source.replace(/:path\*$/, '')), `rewrite ${r.source} has no bare glob (use :path*)`);
  ok(!r.has && !r.missing, `rewrite ${r.source} is unconditional`);
}

// Vercel's own transform of vercel.json into routes.
const { routes, error } = getTransformedRoutes(vercel);
eq(error, null, 'vercel.json transforms without error');
const fsIndex = routes.findIndex((r) => r.handle === 'filesystem');
ok(fsIndex >= 0, 'routes have a filesystem phase');

// The first route after the filesystem phase that matches decides where a
// request goes (rewrites come after the filesystem check).
// Vercel matches the path without the query string (and passes the query on).
const pathOf = (p) => p.split('?')[0];
function rewriteTarget(p) {
  const pathname = pathOf(p);
  for (const route of routes.slice(fsIndex + 1)) {
    if (!route.src || !route.dest) continue;
    const m = new RegExp(route.src).exec(pathname);
    if (!m) continue;
    return route.dest.replace(/\$(\d+)/g, (_, n) => m[Number(n)] ?? '');
  }
  return null;
}
// Redirects that run before rewrites (cleanUrls): a forwarded path must not hit one.
function redirectedBeforeRewrite(pathname) {
  return routes.slice(0, fsIndex).some((r) => r.status >= 300 && r.status < 400 && new RegExp(r.src).test(pathname));
}

for (const p of FORWARDED) {
  eq(rewriteTarget(p), `${APP}${pathOf(p)}`, `${p} is forwarded to ${APP}${pathOf(p)} (same path, no added trailing slash)`);
  ok(!redirectedBeforeRewrite(pathOf(p)), `${p} is not redirected before the rewrite`);
}
for (const p of NOT_FORWARDED) {
  eq(rewriteTarget(p), null, `${p} is not forwarded`);
}
for (const p of MARKETING) {
  eq(rewriteTarget(p), null, `marketing path ${p} is not forwarded`);
}

// ---------------------------------------------------------------------------
// middleware.ts
// ---------------------------------------------------------------------------
let mw = null;
try { mw = await import('../middleware.ts'); } catch (e) { ok(false, `middleware.ts loads (${e.code ?? e.message})`); }
if (mw) {
const middleware = mw.default;
ok(typeof middleware === 'function', 'middleware.ts has a default export');

// Same paths as the rewrites, in the same order (Vercel reads config statically),
// except /_next/:path*: the app ignores the headers on its static assets, so the
// middleware (a function call per request) does not run on them.
// Phase 3 (changed deliberately): one more matcher, last, for the marketing pages: every
// path whose last segment has no dot (no files, no assets), except /_next. It also covers
// the extensionless forwarded paths, which were already matched; the code sends those down
// the forwarding path first, unchanged.
const FORWARDING_MATCHERS = rewrites.map((r) => r.source).filter((s) => s !== '/_next/:path*');
eq(mw.MARKETING_MATCHER, '/:path((?!_next(?:/|$))[^.]*)', 'marketing matcher: extensionless paths except /_next');
eq(mw.config.matcher, [...FORWARDING_MATCHERS, mw.MARKETING_MATCHER], 'middleware matcher = rewrite sources minus /_next/:path*, then the marketing matcher');
const matcherRes = mw.config.matcher.map((m) => new RegExp(sourceToRegex(m).src));
const vercelRes = pathToRegexpVersions.map((ptr) => mw.config.matcher.map((m) => ptr.pathToRegexp(m)));
const matcherHits = (p) => {
  const hit = matcherRes.some((re) => re.test(pathOf(p)));
  for (const res of vercelRes) ok(res.some((re) => re.test(pathOf(p))) === hit, `Vercel's matcher compile agrees on ${p}`);
  return hit;
};
// A page: the last path segment has no dot, and it is not /_next.
const isPage = (p) => !/^\/_next(\/|$)/.test(pathOf(p)) && !pathOf(p).split('/').pop().includes('.');
const NEXT_ASSETS = FORWARDED.filter((p) => p.startsWith('/_next/'));
const WITH_HEADERS = FORWARDED.filter((p) => !p.startsWith('/_next/'));
ok(NEXT_ASSETS.includes('/_next/static/x.js'), '/_next/static/x.js is in the forwarded list');
for (const p of NEXT_ASSETS) {
  eq(rewriteTarget(p), `${APP}${p}`, `${p} is still rewritten to the app`);
  ok(!matcherHits(p), `middleware does not run on ${p}`);
  ok(!mw.isForwardedPath(p), `!isForwardedPath(${p})`);
}
for (const p of WITH_HEADERS) {
  ok(matcherHits(p), `middleware runs on ${p}`);
  ok(mw.isForwardedPath(pathOf(p)), `isForwardedPath(${p})`);
}
for (const p of [...NOT_FORWARDED, ...MARKETING]) {
  // Phase 3: it now runs on pages (for the cookie only), still never on files or assets.
  ok(matcherHits(p) === isPage(p), `middleware ${isPage(p) ? 'runs' : 'does not run'} on ${p}`);
  ok(!mw.isForwardedPath(p), `!isForwardedPath(${p})`);
}
ok(MARKETING.filter(isPage).length > 20, `the marketing pages are matched (${MARKETING.filter(isPage).length})`);
for (const p of ['/', '/charts', '/pricing', '/blog', '/blog/', '/docs/how-to-prompt', '/invest']) ok(MARKETING.includes(p) && matcherHits(p), `middleware runs on ${p}`);
for (const p of ['/analytics.js', '/sitemap.xml', '/robots.txt', '/charts.html', '/og/home.png']) ok(!matcherHits(p), `middleware does not run on ${p}`);

eq(mw.EDGE_SECRET_HEADER, 'x-aagman-edge-secret', 'secret header name matches the app');
eq(mw.VISITOR_IP_HEADER, 'x-aagman-visitor-ip', 'visitor header name matches the app');

// A test value only (not a real secret): 64 hex characters, like `openssl rand -hex 32`.
const TEST_SECRET = 'a'.repeat(32) + '0123456789abcdef0123456789abcdef';

function run(url, headers, secret) {
  if (secret === undefined) delete process.env.PUBLIC_EDGE_SECRET;
  else process.env.PUBLIC_EDGE_SECRET = secret;
  try {
    return middleware(new Request(url, { headers }));
  } finally {
    delete process.env.PUBLIC_EDGE_SECRET;
  }
}
// What Vercel will send upstream: the override list names the final request
// headers; each one's value is in x-middleware-request-<name>.
function upstream(res) {
  const list = res.headers.get('x-middleware-override-headers');
  if (list === null) return null;
  const names = list.split(',').filter(Boolean);
  return Object.fromEntries(names.map((n) => [n, res.headers.get(`x-middleware-request-${n}`)]));
}

const visitor = { 'x-real-ip': '203.0.113.9', 'x-forwarded-for': '203.0.113.9', 'user-agent': 'test' };
const forged = { ...visitor, 'x-aagman-edge-secret': 'forged-by-client', 'x-aagman-visitor-ip': '198.51.100.1' };

// With the env var set: both headers, the secret from the env, the address from Vercel.
{
  const res = run('https://www.aagman.ai/stock/reliance?tab=1', forged, TEST_SECRET);
  eq(res.headers.get('x-middleware-next'), '1', 'continues to the vercel.json rewrite');
  const up = upstream(res);
  eq(up?.['x-aagman-edge-secret'], TEST_SECRET, 'secret header = PUBLIC_EDGE_SECRET (client copy overwritten)');
  eq(up?.['x-aagman-visitor-ip'], '203.0.113.9', 'visitor header = real client address (client copy overwritten)');
  eq(up?.['user-agent'], 'test', 'other request headers pass through');
  ok(![...res.headers.keys()].some((k) => !k.startsWith('x-middleware-')), 'no header is added to the visitor response');
}
// Every forwarded page and file gets the headers (the /_next assets never reach here).
for (const p of WITH_HEADERS) {
  const up = upstream(run(`https://www.aagman.ai${p}`, visitor, TEST_SECRET));
  eq(up?.['x-aagman-edge-secret'], TEST_SECRET, `secret header set on ${p}`);
  eq(up?.['x-aagman-visitor-ip'], '203.0.113.9', `visitor header set on ${p}`);
}
// Without the env var: forwarded without the secret, and a client's copy is dropped.
{
  const up = upstream(run('https://www.aagman.ai/stock/reliance', forged, undefined));
  ok(up !== null, 'still forwards when PUBLIC_EDGE_SECRET is unset');
  ok(!('x-aagman-edge-secret' in (up ?? {})), 'no secret header when PUBLIC_EDGE_SECRET is unset (client copy dropped)');
  eq(up?.['x-aagman-visitor-ip'], '203.0.113.9', 'visitor header still set when PUBLIC_EDGE_SECRET is unset');
}
// Empty or malformed env var: treated as unset (never throws, never sends it).
for (const bad of ['', '   ', 'short', `${TEST_SECRET}\n`.replace('\n', ' x'), `${TEST_SECRET}!`]) {
  let up = {};
  try { up = upstream(run('https://www.aagman.ai/fund/x', forged, bad)); } catch (e) { ok(false, `malformed PUBLIC_EDGE_SECRET does not throw (${e.message})`); }
  ok(up !== null && !('x-aagman-edge-secret' in (up ?? {})), `malformed PUBLIC_EDGE_SECRET (length ${bad.length}) is not sent`);
}
// Surrounding whitespace from a paste is trimmed.
eq(upstream(run('https://www.aagman.ai/fund/x', visitor, ` ${TEST_SECRET}\n`))?.['x-aagman-edge-secret'], TEST_SECRET, 'secret is trimmed');
// No usable client address from Vercel: the visitor header is dropped, never the client's.
{
  const up = upstream(run('https://www.aagman.ai/chart/x', { 'x-aagman-visitor-ip': '198.51.100.1' }, TEST_SECRET));
  ok(!('x-aagman-visitor-ip' in (up ?? {})), 'no visitor header without x-real-ip (client copy dropped)');
  const up2 = upstream(run('https://www.aagman.ai/chart/x', { 'x-real-ip': '1.2.3.4, 5.6.7.8<script>' }, TEST_SECRET));
  ok(!('x-aagman-visitor-ip' in (up2 ?? {})), 'malformed address is not sent');
  eq(upstream(run('https://www.aagman.ai/chart/x', { 'x-real-ip': '2001:db8::1' }, TEST_SECRET))?.['x-aagman-visitor-ip'], '2001:db8::1', 'IPv6 address is sent');
}
// Called on a marketing path: the request goes on untouched (no secret, no visitor header).
// Since phase 3 a page response gets the aag_click cookie and nothing else; a file gets nothing.
for (const p of ['/', '/pricing', '/blog/', '/charts', '/chartered', '/sitemap.xml']) {
  const res = run(`https://www.aagman.ai${p}`, forged, TEST_SECRET);
  eq(res.headers.get('x-middleware-next'), '1', `${p}: continues`);
  eq(upstream(res), null, `${p}: request headers untouched`);
  const extra = [...res.headers.keys()].filter((k) => !k.startsWith('x-middleware-'));
  eq(extra, isPage(p) ? ['set-cookie'] : [], `${p}: response headers added`);
  ok(res.headers.getSetCookie().every((c) => c.startsWith('aag_click=')), `${p}: only the aag_click cookie`);
}

}

// middleware.ts must not be published as a static file.
const copyScript = read('blog/scripts/copy-root-assets.js');
ok(/'middleware\.ts'/.test(copyScript.slice(copyScript.indexOf('const exclude'), copyScript.indexOf(']);'))), 'copy-root-assets.js excludes middleware.ts');

// ---------------------------------------------------------------------------
// robots.txt (the served one is the root file, copied into blog/dist by
// copy-root-assets.js; blog/public has none that could shadow it)
// ---------------------------------------------------------------------------
ok(!fs.existsSync(path.join(ROOT, 'blog', 'public', 'robots.txt')), 'no blog/public/robots.txt');
ok(!/'robots\.txt'/.test(copyScript), 'copy-root-assets.js copies robots.txt');
const robots = read('robots.txt');
const lines = robots.split('\n').map((l) => l.trim()).filter(Boolean);
for (const keep of ['User-agent: *', 'Allow: /', 'Sitemap: https://www.aagman.ai/sitemap.xml']) {
  ok(lines.includes(keep), `robots.txt keeps "${keep}"`);
}
for (const f of ['sitemap-stocks.xml', 'sitemap-funds.xml', 'sitemap-screens.xml', 'sitemap-charts.xml']) {
  ok(lines.includes(`Sitemap: https://www.aagman.ai/${f}`), `robots.txt lists ${f}`);
  ok(rewriteTarget(`/${f}`) === `${APP}/${f}`, `${f} listed in robots.txt is forwarded`);
}
ok(!/Disallow/i.test(robots), 'robots.txt blocks nothing');
// sitemap-news.xml is forwarded now but listed in robots.txt only with the news PR.
ok(!robots.includes('sitemap-news.xml'), 'robots.txt does not list sitemap-news.xml yet');

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  console.error(`forwarding.test.mjs: ${failures.length} of ${checks} checks failed`);
  process.exit(1);
}
console.log(`forwarding.test.mjs: all tests passed (${checks} checks; ${FORWARDED.length} forwarded paths, ${NOT_FORWARDED.length} look-alikes, ${MARKETING.length} marketing paths)`);
