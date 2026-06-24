# Full SEO / AEO Audit — aagman.ai

**Date:** 2026-06-24  
**Scope:** All HTML pages on `https://www.aagman.ai/`  
**Auditor:** Manual audit of local files in `aagman-website-work`

---

## 1. Pages Audited

| # | Page | URL | Purpose |
|---|------|-----|---------|
| 1 | Home | `/` | Main landing page |
| 2 | Pricing | `/pricing.html` | Pricing info |
| 3 | Privacy Policy | `/privacy-policy.html` | Legal |
| 5 | Terms | `/terms.html` | Legal |
| 6 | Risk Disclosure | `/risk-disclosure.html` | Legal |
| 7 | Cancellations & Refunds | `/cancellation-refunds.html` | Legal |
| 8 | How to Prompt Aagman | `/how-to-prompt-aagman.html` | Guide / content hub |

---

## 2. Meta Tags Summary

| Page | Title | Description | Canonical | OG Title | OG Type | Twitter | Lang | Favicon |
|------|-------|-------------|-----------|----------|---------|---------|------|---------|
| Home | ✅ | ✅ | ✅ | ✅ | website | ✅ | en | ✅ |
| Pricing | ✅ | ✅ | ✅ | ✅ | website | ✅ | en | ✅ |
| Privacy Policy | ✅ | ✅ | ✅ | ✅ | website | ✅ | en | ✅ |
| Terms | ✅ | ✅ | ✅ | ✅ | website | ✅ | en | ✅ |
| Risk Disclosure | ✅ | ✅ | ✅ | ✅ | website | ✅ | en | ✅ |
| Cancellations | ✅ | ✅ | ✅ | ✅ | website | ✅ | en | ✅ |
| Prompt Guide | ✅ | ✅ | ✅ | ✅ | article | ✅ | en | ✅ |

**Verdict:** All pages have complete basic meta tags. Canonicals and OG URLs are now correctly pointing to `www.aagman.ai`.

---

## 3. Critical Issues (Fix First)

### 3.1 No H2s — Pricing Page
- **Page:** `pricing.html`
- **Issue:** 0 H2 headings.
- **Impact:** Flat content structure; harder for search engines to parse sections.
- **Fix:** Convert section subheads to H2s (e.g. "What's included", "What's coming", "FAQ").

---

## 4. Medium Issues

### 4.1 OG Type — Most Pages Use `website`
- **Issue:** `how-to-prompt-aagman.html` correctly uses `article`. Others use `website`.
- **Verdict:** Acceptable for static pages, but blog/guide-style pages should use `article`.

### 4.2 OG Image is Generic Across All Pages
- **Issue:** Every page uses the same `/uploads/og-image.png`.
- **Impact:** Social shares all look identical.
- **Fix:** Create page-specific OG images for high-traffic pages (Home, Pricing, Prompt Guide).

### 4.3 Schema Markup is Present but Untested
- **Observation:** All pages have `application/ld+json` blocks.
- **Action needed:** Validate each page in Google's [Rich Results Test](https://search.google.com/test/rich-results).

### 4.4 Breadcrumb Schema Missing on Most Pages
- **Issue:** Only `how-to-prompt-aagman.html` has `BreadcrumbList` schema.
- **Fix:** Add breadcrumb schema to all pages.

---

## 5. AEO / Content Opportunities

### 5.1 Question-Based Content Missing
- Most pages don't explicitly answer common search questions.
- **High-value additions:**
  - Home: "What is Aagman?" section
  - Pricing: "Is Aagman free?" FAQ
  - Prompt Guide: "Can I use Hindi?" FAQ (already added in schema)

### 5.2 Internal Linking is Weak
- Legal pages link to each other via footer ✅
- Home links to pricing ✅
- **Missing:** No links from Home → Prompt Guide yet
- **Fix:** Add a "How to Prompt Aagman" link in the main nav / footer / homepage resources section.

### 5.3 Content Depth
- **Prompt Guide:** Good depth, but could add a visible FAQ section matching the FAQ schema.
- **Pricing:** Very thin. Add FAQ, comparison table, and use-case sections.

---

## 6. Technical SEO

### 6.1 Sitemap
- ✅ Uses `www.aagman.ai` URLs
- ✅ Includes all active pages
- ❌ Lastmod dates are stale (2026-06-23)

### 6.2 Robots.txt
- ✅ Allows all
- ✅ Sitemap URL updated to `www.aagman.ai`

### 6.3 Images
- ✅ All images have `alt` attributes
- ⚠️ Home page uses 4 images — verify file sizes for LCP

### 6.4 Heading Hierarchy

| Page | H1 | H2 | H3 | Notes |
|------|----|----|----|-------|
| Home | 1 | 7 | ? | Good |
| Pricing | 1 | 0 | ? | Add H2s |
| Privacy Policy | 1 | 8 | ? | Good |
| Terms | 1 | 13 | ? | Good |
| Risk Disclosure | 1 | 4 | ? | Good |
| Cancellations | 1 | 8 | ? | Good |
| Prompt Guide | 1 | 7 | ? | Good |

---

## 7. Page-by-Page Quick Fixes

### Home (`index.html`)
- [ ] Add link to Prompt Guide in nav or footer
- [ ] Add "What is Aagman?" section for AEO
- [ ] Consider page-specific OG image

### Pricing (`pricing.html`)
- [ ] Deferred to separate pricing sprint

### Legal Pages (Privacy, Terms, Risk, Cancellations)
- [ ] Generally good
- [ ] Add `BreadcrumbList` schema
- [ ] Verify `lastmod` in sitemap

### Prompt Guide (`how-to-prompt-aagman.html`)
- [ ] Add visible FAQ section matching FAQ schema
- [ ] Create page-specific OG image
- [ ] Add internal links from homepage

---

## 8. Priority Action List

### P0 (Do before next deploy)
1. Validate all schema in Rich Results Test
2. Update sitemap `lastmod` dates

### P1 (This week)
3. Add visible FAQ section to Prompt Guide
4. Add BreadcrumbList schema to all pages
5. Add Prompt Guide link to main nav/footer
6. Add "What is Aagman?" section on Home

### P2 (Next sprint)
7. Create page-specific OG images
8. Add AEO question sections to Home and legal pages
9. Validate all schema in Rich Results Test (re-check)

---

## 9. AEO Keyword Targets

| Page | Primary Target | Secondary Targets |
|------|---------------|-------------------|
| Home | AI trading team India | AI trading copilot, trade with AI |
| Pricing | Aagman pricing | Is Aagman free, beta pricing |
| Prompt Guide | How to prompt Aagman | Aagman prompt examples, backtest prompts |
| Legal pages | [brand] privacy policy / terms | — |

---

## 10. Tools to Validate After Fixes

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Validator](https://validator.schema.org/)
- PageSpeed Insights (for LCP / CLS)
