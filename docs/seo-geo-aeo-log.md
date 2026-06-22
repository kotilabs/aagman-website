# Āagman Landing Page — SEO / GEO / AEO Work Log

**Domain:** https://aagman-landing-page-hxgc.vercel.app  
**Planned future domain:** Company domain (TBD)  
**Started:** 2026-06-22  
**Last updated:** 2026-06-22

---

## Initial Audit — 2026-06-22

### Pages reviewed
- `/` (homepage)
- `/pricing.html`
- `/privacy-policy.html`
- `/terms.html`
- `/risk-disclosure.html`
- `/cancellation-refunds.html`
- `/robots.txt` (missing)
- `/sitemap.xml` (missing)

### Initial scores

| Dimension | Score | Status |
|---|---|---|
| **SEO** | 4/10 | Needs Work |
| **GEO** | 5/10 | On Track |
| **AEO** | 4/10 | Needs Work |

### Critical gaps found

| Issue | Impact |
|---|---|
| No static `<title>` tag in HTML | Search crawlers may not see a page title |
| No meta descriptions | Snippets look empty or auto-generated |
| No canonical tags | Risk of duplicate-content confusion |
| No Open Graph / Twitter Card tags | Social shares look broken |
| No `Organization` schema | AI engines can’t verify brand entity |
| No `FAQPage` schema | FAQs ineligible for rich results |
| No `robots.txt` or `sitemap.xml` | Harder for crawlers to discover pages |
| Missing `html lang` attribute | Hurts language targeting and accessibility |
| FAQ heading was generic “Common questions.” | Not optimized for featured snippets |
| FAQ questions were not semantic headings | Weak heading structure for AEO |
| Broken `{{ whatsappLink }}` on pricing | Crawlers saw an invalid URL |

### Strengths noted
- HTTPS with HSTS preload.
- All images have descriptive alt text.
- Strong homepage content (~1,400 words).
- Clear value proposition and founder E-E-A-T signals.
- Comprehensive legal pages.

---

## Phase 1 — Foundation *(deployed on 2026-06-22)*

**Commits:** `de85f4e`, `93cbd0a`, `b254da9`

### What was fixed
- ✅ Unique `<title>` + meta description on all 6 pages.
- ✅ Canonical tags on all 6 pages.
- ✅ Open Graph + Twitter Card tags on all 6 pages.
- ✅ `html lang="en"` on all 6 pages.
- ✅ `/robots.txt` created.
- ✅ `/sitemap.xml` created with all 6 URLs.
- ✅ 1200×630 OG image uploaded to `/uploads/og-image.png`.
- ✅ Pricing page WhatsApp link fixed to `+917704822233`.

### Files changed
- `index.html`
- `pricing.html`
- `privacy-policy.html`
- `terms.html`
- `risk-disclosure.html`
- `cancellation-refunds.html`
- `robots.txt`
- `sitemap.xml`
- `uploads/og-image.png`

---

## Phase 2 — Structured Data *(committed 2026-06-22; not yet live)*

**Commit:** `1bb93eb` (merged to `main`)

### What was fixed
- ✅ `Organization` schema added to all 6 pages.
  - Name: Āagman
  - Legal name: Koti Labs Private Limited
  - Founding year: 2025
  - Logo, URL, contact email, social `sameAs`
- ✅ `FAQPage` schema added to homepage with all 6 FAQs.
- ✅ `HowTo` schema added to homepage for “Backtest → Paper → Live”.

### Files changed
- `index.html` (Organization + FAQPage + HowTo)
- `pricing.html` (Organization)
- `privacy-policy.html` (Organization)
- `terms.html` (Organization)
- `risk-disclosure.html` (Organization)
- `cancellation-refunds.html` (Organization)

---

## Phase 3 — AEO / Content Optimization *(committed 2026-06-22; not yet live)*

**Commit:** `9d0b005`

### What was fixed
- ✅ FAQ section H2 changed from “Common questions.” → “Frequently asked questions.”
- ✅ Added visible definition/intro paragraph for snippet eligibility.
- ✅ Converted each FAQ question from `<span>` to semantic `<h3>`.

### Files changed
- `index.html`

---

## Current State

SEO/GEO/AEO foundation work (Phases 1–3) is complete and committed to `main`, but **Phases 2–3 are not yet live** on Vercel.

- Phase 1 is live on `https://aagman-landing-page-hxgc.vercel.app/`.
- Phases 2–3 are merged to `main` and pushed to GitHub (`origin/main` and `upstream/main`).
- The live site is still running the previous production deployment (`b254da9`) and does not yet include the JSON-LD schema or the AEO FAQ changes.

Estimated new scores after deployment:

| Dimension | Estimated Score | Status |
|---|---|---|
| **SEO** | 7–8/10 | Strong |
| **GEO** | 7/10 | On Track |
| **AEO** | 7/10 | On Track |

*(Exact scores require a live re-audit after Google indexes the changes.)*

---

## What Still Needs to Be Fixed

### Phase 4 — Technical / Performance
- [ ] Run Core Web Vitals audit via Google PageSpeed Insights.
- [ ] Perform a real mobile rendering check.
- [ ] Decide on and configure the company domain + 301 redirects from `vercel.app`.
- [ ] Review whether the JS-rendered `x-dc` runtime is blocking crawlers or hurting performance.

### Phase 5 — Measurement
- [ ] Set up Google Search Console and submit the sitemap.
- [ ] Set up Google Analytics 4 or Plausible.
- [ ] Re-run a full SEO/GEO/AEO audit 2–4 weeks after deployment.

### Optional improvements
- [ ] Add “Last updated” dates to legal pages.
- [ ] Replace `dub.sh` shortlinks in Organization `sameAs` with canonical social URLs.
- [ ] Add original research, data, or a `/blog` section for stronger GEO signals.
- [ ] Consider creating a dedicated `/about` page for stronger E-E-A-T.

---

## Deployment Notes

- Vercel auto-deploys from `origin/main` of the fork.
- The canonical domain is currently `aagman-landing-page-hxgc.vercel.app`.
- **Deployment blocker:** Vercel returned `api-deployments-free-per-day` (>100 deployments) when trying to deploy Phases 2–3. New deployments are blocked until the free-tier daily quota resets.
- A trigger commit (`9ef0fa8`) was pushed to force a new build once the quota resets.
- When moving to the company domain:
  1. Add the custom domain in Vercel.
  2. Update all canonical + OG URLs to the new domain.
  3. Set up 301 redirects from the Vercel domain.
  4. Re-submit the sitemap in Search Console.

---

## How to Deploy from Local Copy

Local working copy:

```
/Users/aryansinha/aagman-landing-page-work
```

To push any future local changes:

```bash
cd /Users/aryansinha/aagman-landing-page-work
git push upstream main
git push origin main
```
