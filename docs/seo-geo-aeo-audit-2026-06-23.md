# 🔍 Āagman Website Work — Full SEO / GEO / AEO Audit

**Domain:** `https://aagman-website-work.vercel.app`  
**Audit type:** Full  
**Pages reviewed:** 7  
**Audit date:** 2026-06-23

| Dimension | Score | Status | Key Takeaway |
|---|---|---|---|
| SEO | 3/10 | Needs Work | Titles and basic HTML exist, but nearly every on-page and technical SEO signal is missing. |
| GEO | 3/10 | Needs Work | Some brand and founder signals exist in content, but zero structured data or entity markup for AI engines. |
| AEO | 2/10 | Needs Work | FAQ content exists on the homepage but is not structured for snippets or voice search. |
| **Combined** | **8/30** | | The site is essentially invisible to search and AI engines in its current state. |

---

## Executive Summary

`aagman-website-work.vercel.app` is a single-page-style landing site with six HTML pages. The homepage has strong, readable content (~1,482 words) and a clear value proposition, but the technical SEO foundation is almost entirely missing. No meta descriptions, canonical tags, Open Graph tags, Twitter Cards, `html lang`, `robots.txt`, `sitemap.xml`, or schema markup exist on any page. The legal pages exist but are orphaned (not linked from the homepage navigation or footer). For GEO, there are genuine E-E-A-T signals — named founders, a founder's letter, LinkedIn profiles, and SEBI registration details — but none of this is machine-readable. For AEO, the homepage FAQ section has good questions and answers, but the questions are not semantic headings and there is no `FAQPage` schema, making rich results unlikely.

The most urgent fix is to port the complete SEO/GEO/AEO foundation that already exists in the `kotilabs/aagman-landing-page` repo to this site.

---

## Pages Audited

| URL | Page Type | Notes |
|---|---|---|
| `/` | Homepage | Strong content, hero, agents, proof, FAQ, CTA. |
| `/pricing.html` | Pricing | Short page (~207 words), no secondary headings. |
| `/founders-letter.html` | Founder narrative | ~177 words, no visible heading structure in HTML. |
| `/privacy-policy.html` | Legal | ~495 words, detailed DPDP-aligned policy. |
| `/terms.html` | Legal | ~740 words, includes SEBI RIA/algo-provider disclosures. |
| `/risk-disclosure.html` | Legal | ~296 words, market-risk disclaimers. |
| `/cancellation-refunds.html` | Legal | ~428 words, refund and grievance info. |

---

## 5. SEO Analysis

### Technical On-Page

| Signal | Finding | Status |
|---|---|---|
| Title tag | Present on all 7 pages. Homepage title is clear and keyword-relevant: “Āagman — Your AI Trading Team for Indian Markets”. | Good |
| Meta description | Missing on every page. | Missing |
| Canonical tag | Missing on every page. | Missing |
| Heading hierarchy | Homepage has 1 H1 and 7 H2s. Pricing has 1 H1, 0 H2/H3. Legal pages have 1 H1 and multiple H2s. Founders letter has no detectable H1/H2/H3. | Needs Attention |
| URL structure | Clean `.html` filenames, readable. | Good |
| Robots meta | Missing; no accidental `noindex` found. | Missing |
| Viewport meta | Present on all pages (`width=device-width, initial-scale=1`). | Good |
| Image alt text | All inspected images have alt text (e.g., `alt="Āagman"`). | Good |
| Internal links | Only `pricing.html` is linked from the nav/mobile menu. All five legal pages are orphaned — not linked from nav or footer. | Needs Attention |
| Open Graph tags | `og:title`, `og:description`, `og:image`, `og:url` all missing on every page. | Missing |
| Twitter Card tags | `twitter:card`, `twitter:title`, etc. all missing. | Missing |
| `html lang` | Missing on every page (`<html>` has no `lang` attribute). | Missing |
| `robots.txt` | Returns 404. | Missing |
| `sitemap.xml` | Returns 404. | Missing |

### Content Quality

| Signal | Finding | Status |
|---|---|---|
| Word count | Homepage: ~1,482 words. Legal pages: 177–740 words. Pricing: only ~207 words. | Good (homepage), Needs Attention (pricing) |
| Keyword signals | “AI trading team,” “Indian markets,” “SEBI,” “backtest,” “paper,” “live,” “broker” are clearly present. | Good |
| Content freshness | No visible publication or “last updated” dates on any page. | Missing |
| Readability | Content is scannable with short paragraphs, but no bullet lists in key sections and FAQ answers are plain text blocks. | On Track |

### Structured Data

| Signal | Finding | Status |
|---|---|---|
| JSON-LD schema | Zero schema markup detected across all pages. | Missing |
| Schema types | None. No `Organization`, `FAQPage`, `HowTo`, `WebSite`, or `WebPage`. | Missing |

---

## 6. GEO Analysis

### E-E-A-T Assessment

| Signal | Finding | Status |
|---|---|---|
| Author/founder information | Two founders named via LinkedIn: Ajit Kumar and Amit Kumar. Founder letter page exists. | Good |
| About page | Founders letter page exists but has no heading structure and no structured author data. | Needs Attention |
| Contact information | Grievance officer email (`amit@kotilabs.com`) and physical address appear only on `/cancellation-refunds.html`. Not on homepage or contact page. | Needs Attention |
| Trust signals | SEBI-Registered Investment Adviser (INA000021951) and NSE algo-provider details mentioned in Terms. Kill-switch, risk caps, compliance claims on homepage. | Good |
| Organization schema | Missing. Brand entity is not declared for AI engines. | Missing |
| Social profile links | LinkedIn company (`aagman`), X (`aagman_in`), and two founder LinkedIn profiles linked from homepage. | Good |

### Content for AI Synthesis

| Signal | Finding | Status |
|---|---|---|
| Factual density | Specific facts: SEBI reg no, NSE circular ref, address, 5-year backtest, kill-switch, daily cap 1.5%. | Good |
| Clear claims | Value prop is clear: “AI trading team for Indian markets.” | Good |
| Source citation | No external authoritative sources cited (e.g., SEBI link, NSE circular link). | Missing |
| Comprehensiveness | Homepage covers product, agents, proof, trust, order types, founders, FAQ. | Good |
| Entity clarity | Brand name “Āagman” and “Koti Labs Private Limited” appear, but not consistently machine-readable. | Needs Attention |
| Originality signals | Founder letter provides a unique point of view. | Good |

### Technical GEO

| Signal | Finding | Status |
|---|---|---|
| Structured data depth | No schema of any kind. | Missing |
| HTTPS | Site is served over HTTPS. | Good |
| Clean crawlability | No `robots.txt` blocks, but also no `robots.txt` or sitemap to guide crawlers. Legal pages are orphaned. | Needs Attention |
| SameAs / brand entity links | Social links exist in HTML but are not wrapped in `Organization` schema `sameAs`. | Needs Attention |

---

## 7. AEO Analysis

### Featured Snippet Eligibility

| Signal | Finding | Status |
|---|---|---|
| Direct answer paragraphs | FAQs answer questions directly, but answers are not placed immediately below semantic question headings. | Needs Attention |
| Definition patterns | No clear “Āagman is…” or “An AI trading team is…” definition paragraph. | Missing |
| List content | Some numbered steps (01, 02, 03) in the Backtest → Paper → Live section, but not in list markup. | Needs Attention |
| Table content | No comparison tables. | Missing |

### Structured Answer Formats

| Signal | Finding | Status |
|---|---|---|
| FAQ schema | FAQ section exists but no `FAQPage` JSON-LD. | Missing |
| HowTo schema | The “Backtest → Paper → Live” process is step-like but not marked as `HowTo`. | Missing |
| Question-phrased headings | FAQ questions are inside `<summary>`/`<details>`, not semantic `<h3>` headings. | Needs Attention |
| Speakable schema | Not present. | Missing |

### Voice Search Readiness

| Signal | Finding | Status |
|---|---|---|
| Conversational language | Content is conversational and plain-spoken. | Good |
| Long-tail question coverage | FAQs cover “Is Aagman a broker?”, “Does it predict markets?”, “Why not ChatGPT?”, etc. | Good |
| Local signals | Address exists only on cancellation page; no `LocalBusiness` schema. | Needs Attention |

---

## 8. Priority Recommendations Matrix

| Priority | Issue | Dimension | Effort | Impact |
|---|---|---|---|---|
| 🔴 Critical | Add unique `<meta name="description">`, canonical, `og:*`, and `twitter:*` tags to every page. | SEO | Low | Very High |
| 🔴 Critical | Create `/robots.txt` and `/sitemap.xml` and link all 6 pages. | SEO | Low | Very High |
| 🔴 Critical | Add `Organization` JSON-LD schema with name, legal name, logo, URL, email, address, founders, and `sameAs` social links. | SEO / GEO | Low | High |
| 🔴 Critical | Convert homepage FAQ questions to semantic `<h3>` headings and add `FAQPage` schema. | AEO | Low | High |
| 🟠 High | Add `html lang="en"` to every page. | SEO / Accessibility | Low | Medium |
| 🟠 High | Link all legal pages from the footer of every page; they are currently orphaned. | SEO / UX | Low | High |
| 🟠 High | Add `HowTo` schema to the “Backtest → Paper → Live” section. | AEO / GEO | Low | Medium |
| 🟠 High | Expand `/pricing.html` to at least 400–500 words and add an H2 section. | SEO / Content | Medium | Medium |
| 🟡 Medium | Add “last updated” dates to legal pages. | SEO / Trust | Low | Medium |
| 🟡 Medium | Add a visible definition paragraph (“Āagman is…”) near the top of the homepage. | AEO / GEO | Low | Medium |
| 🟡 Medium | Add SEBI/NSE source links in the Terms/Risk Disclosure pages. | GEO / Trust | Low | Medium |
| 🟢 Quick Win | Add `WebSite` schema and a search-action if applicable. | GEO | Low | Low |

---

## 9. What’s Working Well

- **Clear value proposition:** The homepage immediately communicates what Āagman is and who it’s for.
- **Substantial homepage content:** ~1,482 words gives search engines enough context to understand the topic.
- **Good alt text:** Images have descriptive alt attributes.
- **Real trust signals:** SEBI RIA registration, NSE algo-provider status, named founders, grievance process, and physical address are all present in content.
- **FAQ content exists:** The questions are natural and cover common objections, which is a strong AEO starting point.
- **HTTPS and mobile viewport:** Basic technical hygiene is in place.

---

## 10. Glossary

- **SEO (Search Engine Optimization):** Practices that help traditional search engines (Google, Bing) crawl, understand, and rank a website.
- **GEO (Generative Engine Optimization):** Optimizing content and markup so AI-powered search engines (Perplexity, ChatGPT Search, Google AI Overviews) can accurately synthesize and cite the site.
- **AEO (Answer Engine Optimization):** Structuring content so it can be extracted as direct answers for featured snippets, People Also Ask boxes, and voice search.
