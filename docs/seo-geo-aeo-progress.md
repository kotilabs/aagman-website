# Āagman SEO / GEO / AEO Progress Tracker

**Domain:** `https://aagman-website-work.vercel.app` (production target: `https://aagman.ai`)  
**Last updated:** 23 June 2026  
**Status:** Phases 1–5 complete locally. Code not yet pushed to production domain.

---

## Phase 1 — On-page SEO foundation ✅

**Goal:** Make the site crawlable and shareable.

| Change | Pages | Visible? |
|---|---|---|
| Unique `<meta name="description">` | All 7 | No (search results) |
| Canonical tags | All 7 | No |
| Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) | All 7 | No (social shares) |
| Twitter Card tags | All 7 | No (social shares) |
| `html lang="en"` | All 7 | No |
| `robots.txt` | Site root | No |
| `sitemap.xml` | Site root | No |
| 1200×630 OG image (`uploads/og-image.png`) | Shared | Yes (link previews) |

---

## Phase 2 — Structured data (GEO / AEO) ✅

**Goal:** Make brand, FAQs, and process machine-readable.

| Change | Pages | Visible? |
|---|---|---|
| `Organization` JSON-LD (name, legalName, logo, sameAs, SEBI RIA, address) | All 7 | No (search/AI engines) |
| `FAQPage` JSON-LD | Homepage only | No (rich results) |
| `HowTo` JSON-LD for Backtest → Paper → Live | Homepage only | No (rich results) |
| Removed duplicate `<title>` in `pricing.html` | `pricing.html` | No |

---

## Phase 3 — Footer, trust signals, source links ✅

**Goal:** Fix orphaned pages and strengthen E-E-A-T / GEO.

| Change | Pages | Visible? |
|---|---|---|
| Footer "Contact Us" now links to `mailto:growth@kotilabs.com` | All 7 | Yes |
| Standardised last-updated date to 23 June 2026 | Legal pages | Yes |
| SEBI RIA reg `INA000021951` linked to `sebi.gov.in` | `terms.html`, `risk-disclosure.html` | Yes |
| NSE Circular Ref. 40/2026 linked to `nseindia.com` | `terms.html`, `risk-disclosure.html` | Yes |

---

## Phase 4 — Advanced structured data ✅

**Goal:** Strengthen entity graph and founder E-E-A-T.

| Change | Pages | Visible? |
|---|---|---|
| `WebSite` JSON-LD | All 7 | No |
| `Person` JSON-LD for Ajit Kumar & Amit Kumar | `index.html`, `landing-terminal.html` | No |

---

## Phase 5 — Technical performance ✅

**Goal:** Improve Core Web Vitals and page load.

| Change | Pages | Visible? |
|---|---|---|
| Compressed `aagman-logo.png` (2.74 MB → 36 KB) | All pages | No (same look, faster load) |
| Compressed `og-image.png` (490 KB → 379 KB) | Shared | No (same look, faster load) |
| Added `width` / `height` attributes to all images | All pages | No (reduces layout shift) |
| Added `loading="lazy"` + `decoding="async"` to founder photos | `index.html`, `landing-terminal.html`, `founders-letter.html` | No (faster below-fold load) |
| Verified Google Fonts already use `display=swap` | All pages | No |

---

## Copy updates (post-Phase 5)

| Change | Pages | Visible? |
|---|---|---|
| Homepage subheadline rewritten | `index.html`, `landing-terminal.html` | Yes |
| Meta / OG / Twitter descriptions synced with new subheadline | `index.html`, `landing-terminal.html` | No (search/social) |
| Feature label "NSE, BSE, F&O" → "Cash equity, commodity & futures" | `index.html`, `landing-terminal.html` | Yes |

---

## What’s left

### Pre-production migration
- Update every `aagman-website-work.vercel.app` reference to `aagman.ai` across canonicals, OG/Twitter URLs, sitemap, robots.txt, and all JSON-LD `@id` / `url` / `sameAs` values.
- Re-compress or resize `og-image.png` further if needed.

### Phase 6 — Content & AEO expansion (post-production)
- Add more direct-answer sections for long-tail queries.
- Build comparison tables (e.g., Aagman vs ChatGPT, Aagman vs broker research).
- Strengthen semantic heading structure on secondary pages.
- Add breadcrumb navigation + `BreadcrumbList` schema.

### Nice-to-have
- Add `Speakable` schema for key answer sections.
- Add `Review` / `AggregateRating` schema once testimonials exist.

---

## Visible vs. not-visible summary

**Visible to users:**
- Updated homepage subheadline.
- Updated feature label "Cash equity, commodity & futures".
- Footer "Contact Us" now opens email to `growth@kotilabs.com`.
- Last-updated dates on legal pages.
- SEBI / NSE references are now clickable links.
- OG image appears in social/link previews.

**Not visible to users (backend / SEO / GEO signals):**
- All meta tags, canonicals, Open Graph, Twitter Cards.
- `robots.txt`, `sitemap.xml`.
- All JSON-LD schema (Organization, FAQPage, HowTo, WebSite, Person).
- Image width/height attributes, lazy loading, decoding hints.
- Compressed image file sizes.
- `html lang="en"`.
