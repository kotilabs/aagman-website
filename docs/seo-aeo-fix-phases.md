# SEO / AEO Fix Phases — aagman.ai

**Goal:** Fix all audit issues on `https://www.aagman.ai/` in staged deploys.  
**Note:** Pricing page fixes are deferred to a later phase. Founders Letter is not an independent page and is excluded.

---

## Phase 1 — Technical Cleanup (P0)
*Fix before any public promotion or next major deploy.*

| # | Fix | File(s) | Why |
|---|-----|---------|-----|
| 1.1 | Update all sitemap `lastmod` dates | `sitemap.xml` | Stale dates reduce crawler trust |
| 1.2 | Validate all schema markup | all `.html` files | Ensure no JSON-LD errors before rich results |
| 1.3 | Ensure `robots.txt` sitemap URL uses `www.aagman.ai` | `robots.txt` | Already done locally, verify on deploy |

---

## Phase 2 — Site-Wide Schema & Navigation
*Improves crawlability and rich results coverage.*

| # | Fix | File(s) |
|---|-----|---------|
| 2.1 | Add `BreadcrumbList` schema to all pages | all `.html` files |
| 2.2 | Add `Organization` schema to all pages that don't have it | all `.html` files |
| 2.3 | Add Prompt Guide link to main nav and footer | `index.html`, all page footers |
| 2.4 | Add footer link to Prompt Guide under Resources | all `.html` footers |
| 2.5 | Add "What is Aagman?" section or link on Home | `index.html` |

---

## Phase 3 — Prompt Guide AEO Optimization
*Turn the guide into a searchable answer-engine asset.*

| # | Fix | File |
|---|-----|------|
| 3.1 | Add visible FAQ section matching the FAQ schema | `how-to-prompt-aagman.html` |
| 3.2 | Add question-based H2s: "Can I use Hindi or Hinglish?", "What can I ask Aagman?" | `how-to-prompt-aagman.html` |
| 3.3 | Add page-specific OG image | create `/uploads/og-prompt-guide.png` |
| 3.4 | Add internal links from Home and footer to guide | `index.html`, footers |
| 3.5 | Add table of contents or jump links for the 4 sections | `how-to-prompt-aagman.html` |

---

## Phase 4 — Content Expansion (Non-Pricing)
*Add AEO content to other pages.*

| # | Fix | File |
|---|-----|------|
| 4.1 | Add "What is Aagman?" section on Home | `index.html` |
| 4.2 | Add "Is Aagman free?" / "How does beta access work?" FAQ on Home | `index.html` |
| 4.3 | Add short FAQ to Risk Disclosure | `risk-disclosure.html` |
| 4.4 | Add short FAQ to Cancellations | `cancellation-refunds.html` |
| 4.5 | Add "How do I contact Aagman?" to Privacy Policy or footer | `privacy-policy.html` or footer |

---

## Phase 5 — Visual / Social Optimization
*Make shares and SERP appearance more compelling.*

| # | Fix | File(s) |
|---|-----|---------|
| 5.1 | Create page-specific OG images for high-traffic pages | create image assets |
| 5.2 | Update `og:image` on Home | `index.html` |
| 5.3 | Update `og:image` on Prompt Guide | `how-to-prompt-aagman.html` |
| 5.4 | Verify all OG images are 1200×630 and under 1 MB | all pages |
| 5.5 | Test social share previews for Home, Pricing (later), Prompt Guide | — |

---

## Phase 6 — Measurement & Monitoring
*Track impact after deploys.*

| # | Fix | Tool |
|---|-----|------|
| 6.1 | Submit updated sitemap to Google Search Console | GSC |
| 6.2 | Request indexing for Prompt Guide | GSC |
| 6.3 | Validate all schema in Rich Results Test | Google Rich Results Test |
| 6.4 | Run PageSpeed Insights on Home and Prompt Guide | PageSpeed Insights |
| 6.5 | Track target keywords monthly | GSC + keyword tracker |

---

## Deferred — Pricing Page
*To be handled in a separate pricing-focused sprint.*

- Convert section titles to H2s
- Add pricing FAQ
- Add plan comparison structured data
- Create pricing-specific OG image

---

## Recommended Deploy Order

1. **Deploy Phase 1** — technical fixes only
2. **Deploy Phase 2** — schema + nav/footer
3. **Deploy Phase 3** — Prompt Guide AEO
4. **Deploy Phase 4** — content expansion
5. **Deploy Phase 5** — OG images
6. **Deploy Phase 6** — measurement (no code changes)

---

## Files Likely Touched Per Phase

| Phase | Files |
|-------|-------|
| Phase 1 | `sitemap.xml`, `robots.txt`, all `.html` (schema validation) |
| Phase 2 | all `.html` files, `sitemap.xml` |
| Phase 3 | `how-to-prompt-aagman.html`, `index.html`, all footers |
| Phase 4 | `index.html`, `risk-disclosure.html`, `cancellation-refunds.html`, `privacy-policy.html` |
| Phase 5 | `index.html`, `how-to-prompt-aagman.html`, new image assets |
| Phase 6 | no file changes |
