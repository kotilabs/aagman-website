// Dependency-free test for analytics.js click classification.
// Run: node tests/analytics.test.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { classifyClick } = require('../analytics.js');

const HOST = 'www.aagman.ai';
const d = (over) => ({ href: '', dataset: {}, inFooter: false, inNav: false, pageHost: HOST, ...over });

// 1. data-cta="primary" element -> cta_click with correct location
assert.deepEqual(
  classifyClick(d({
    href: 'https://app.aagman.ai/login',
    dataset: { cta: 'primary', ctaLocation: 'hero' }
  }), '/'),
  { name: 'cta_click', params: { location: 'hero', page: '/' } }
);

// 2. app.aagman.ai link without data-cta -> app_link_click (footer/nav/body resolution)
assert.deepEqual(
  classifyClick(d({ href: 'https://app.aagman.ai/login' }), '/pricing.html'),
  { name: 'app_link_click', params: { location: 'body', page: '/pricing.html' } }
);
assert.deepEqual(
  classifyClick(d({ href: 'https://app.aagman.ai', inFooter: true }), '/'),
  { name: 'app_link_click', params: { location: 'footer', page: '/' } }
);
assert.deepEqual(
  classifyClick(d({ href: 'https://app.aagman.ai', inNav: true }), '/'),
  { name: 'app_link_click', params: { location: 'nav', page: '/' } }
);

// 3. mailto -> contact_click
assert.deepEqual(
  classifyClick(d({ href: 'mailto:hello@aagman.ai' }), '/'),
  { name: 'contact_click', params: { href: 'mailto:hello@aagman.ai', page: '/' } }
);

// 4. twitter link -> social_click
assert.deepEqual(
  classifyClick(d({ href: 'https://twitter.com/aagman_ai' }), '/'),
  { name: 'social_click', params: { platform: 'twitter.com', page: '/' } }
);
assert.deepEqual(
  classifyClick(d({ href: 'https://www.linkedin.com/company/aagman-ai/' }), '/'),
  { name: 'social_click', params: { platform: 'linkedin.com', page: '/' } }
);

// 5. other external link -> outbound_click
assert.deepEqual(
  classifyClick(d({ href: 'https://dub.sh/fZsnb0w' }), '/'),
  { name: 'outbound_click', params: { href: 'https://dub.sh/fZsnb0w', page: '/' } }
);

// 6. internal link -> null
assert.equal(classifyClick(d({ href: '/pricing.html' }), '/'), null);
assert.equal(classifyClick(d({ href: 'https://www.aagman.ai/docs/' }), '/'), null);
assert.equal(classifyClick(d({ href: '#features' }), '/'), null);
assert.equal(classifyClick(null, '/'), null);

console.log('analytics.test.mjs: all tests passed');
