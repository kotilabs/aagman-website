# āagman analytics framework: website

Status: **phase 1, built** (2026-10-23) · approved by Aryan · Owner: Aryan · Scope: www.aagman.ai (marketing pages, docs, blog)

This is the contract for every piece of tracking on the website. Code follows this document. If an event is not in here, it does not ship.

Phases: **1. the whole website tracked** (this document) · 2. Google Ads infrastructure, the website-to-app hand-off (adds a section here) · 3. Safari fix (adds a section here).

---

## 1. The questions it answers

Every event exists to answer one of these. An event that answers none is noise and is not added.

| # | Question | Answered by |
|---|---|---|
| Q1 | Where do visitors come from (search, social, a campaign, a referral)? | page views with referrer and campaign tags |
| Q2 | Which page and which part of it comes right before someone clicks Sign up? | `cta_click` (page, section) + `section_view` |
| Q3 | How far down each page do people get? | `section_view` |
| Q4 | Which product story pulls people deeper (Research, Charts, Backtesting, Picks, Deploy)? | `card_click`, `nav_click`, page views |
| Q5 | Do people use the menus, and for what? | `nav_open`, `nav_click`, `soon_click` |
| Q6 | What are people unsure about before signing up? | `faq_open` |
| Q7 | Where do people leave the site to (founders call, WhatsApp, LinkedIn, docs)? | `cta_click`, `outbound_click`, `social_click`, `contact_click` |
| Q8 | Which blog and docs pages get read, not just opened? | `blog_read` |
| Q9 | Has tracking quietly broken? | the same events in Umami and Google Analytics, compared weekly (section 9) |

## 2. How it works

```
 page on www.aagman.ai
        │  data-section="…" on each part of the page
        ▼
 analytics.js  (one file, loaded on every page, deferred)
   - defines every event once (name, properties, when it fires)
   - sends each event to both destinations
        ├──► Umami            analytics.aagman.ai   source of truth
        └──► Google Analytics GA4 property 503925644 cross-check
```

- **Umami is the source of truth.** Self-hosted on analytics.aagman.ai, its own database. Website `e2f79735-4b71-4458-81f6-bdcb71ea9c6f` (live). History from the current site continues in the same website.
- **Google Analytics (GA4) is the cross-check.** It receives the same events with the same names and properties, through Google's own script (`gtag.js`) loaded by analytics.js. Measurement ID: `G-Z3F6FR2YVL` *(to confirm in GA4 admin that it belongs to property 503925644)*.
- **One file, two destinations.** No event is defined twice, so the two tools cannot drift apart because one was updated and the other was not.
- **Removed:** Google Tag Manager (`GTM-T72DN6HQ`), Piqo, the inline `gclid` cookie script and the inline `dataLayer` click tracker. GA4 now loads directly, so Tag Manager has nothing left to do.

## 3. Naming rules

| Thing | Rule | Examples |
|---|---|---|
| Event name | `snake_case`, `noun_verb`, ≤ 40 characters, never a GA4 reserved name (`page_view`, `click`, `scroll`, `session_start`, `first_visit`, `user_engagement`, anything starting `ga_`, `google_`, `firebase_`) | `cta_click`, `faq_open` |
| Property key | `snake_case`, ≤ 40 characters, at most 10 per event (GA4 allows 25) | `page`, `section`, `label` |
| Property value | lowercase `snake_case` slug from the lists in this document, ≤ 100 characters. URLs only in `href` | `sign_up`, `talk_to_founders` |
| `page` | the path, no `.html`, no trailing slash, `/` for the homepage | `/`, `/charts`, `/blog/zerodha-api` |
| `section` | the `data-section` value of the part of the page the element sits in (section 4) | `hero`, `faq`, `close` |
| `spot` | `<page name>.<section>`, the one value that says exactly where a click happened | `home.hero`, `charts.close`, `pricing.included` |
| Page name (for `spot`) | the page's slug, `home` for `/` | `home`, `research`, `privacy_policy` |

Never in any event, property or value: phone numbers, emails, names, typed text, full URLs with query strings.

## 4. Pages and section names

Each section below is marked in the HTML with `data-section="<name>"`. The header and footer are the same on every page: `header`, `footer`. On phones and tablets (1024px and below) the header's menu button opens `menu`, a full-height list of the products, Pricing, Docs, Blog, Sign up and Talk to founders; `menu` is not counted by `section_view`. A click outside any named section reports `section: body` (for example the "How we grade" link between two Picks sections, and every page that has no sections).

| Page (`page`, page name) | Sections, top to bottom |
|---|---|
| Homepage (`/`, `home`) | `hero` (headline, Sign up, product demo) · `products` (the glue story + Research, Charts, Backtesting cards) · `products_more` (Picks & strategies, Deploy cards) · `safety` (Built for real money) · `letter` (founders letter) · `faq` · `close` (Your desk is ready) |
| Research (`/research`, `research`) | `hero` · `features` (the main card and its smaller cards) · `onward` (cards to the other products) · `close` |
| Charts (`/charts`, `charts`) | same as Research |
| Backtesting (`/backtesting`, `backtesting`) | same as Research |
| Deploy (`/deploy`, `deploy`) | same as Research |
| Picks & strategies (`/picks`, `picks`) | `hero` · `this_week` · `gates` · `report_card` · `closed` · `rechecked` · `your_call` · `onward` · `close` |
| Pricing (`/pricing`, `pricing`) | `hero` (headline) · `plans` (Free, Pro, Desk) · `included` (Every plan includes the whole desk) · `stack` (The stack it replaces) · `charges` · `community` (WhatsApp) · `close` |
| Terms, Privacy policy, Risk disclosure, Cancellations & refunds (`terms`, `privacy_policy`, `risk_disclosure`, `cancellation_refunds`) | `hero` · `body` · `others` (links to the other policies) |
| Blog and docs (`/blog/…`, `/docs/…`) | page level only, no sections |

## 5. Events

Every event also carries `page`. Umami records page views, referrer, campaign tags (`utm_*`), country, device and browser by itself; GA4 does the same with its automatic `page_view`. Umami also records page speed for each page view (time to first byte, first and largest paint, layout shift, responsiveness).

| Event | Fires when | Properties (allowed values) | Answers |
|---|---|---|---|
| `cta_click` | a call-to-action button is clicked | `label`: `sign_up` · `talk_to_founders` · `join_whatsapp`; `section`; `spot` | Q2, Q7 |
| `app_link_click` | any other link to app.aagman.ai is clicked | `section`; `target` (the app path, e.g. `/how-we-grade`) | Q4 |
| `section_view` | half of a section is on screen, or the section crosses the middle line of the screen (for sections taller than the screen), once per section per page view | `section` | Q2, Q3 |
| `nav_open` | the Product or Resources menu opens, or the phone and tablet menu opens | `menu`: `product` · `resources` · `mobile` | Q5 |
| `nav_click` | an internal link in the header, a menu (desktop dropdowns or the phone and tablet menu) or the footer is clicked | `area`: `header` · `menu` · `footer`; `item`: `home` · `research` · `charts` · `backtesting` · `picks` · `deploy` · `pricing` · `docs` · `blog` · `founders_letter` · `investors` · `sitemap` · `terms` · `privacy_policy` · `risk_disclosure` · `cancellation_refunds` | Q4, Q5 |
| `soon_click` | a "Coming soon" item in the Resources menu is clicked | `item`: `charts` · `screener` · `pulse` | Q5 (demand for what is not built yet) |
| `card_click` | a product card or action card in the page body is clicked | `card`: `research` · `charts` · `backtesting` · `picks` · `deploy` · `deploy_algo` · `paper_first` · `adjust_rules`; `section` | Q4 |
| `faq_open` | an FAQ question is opened (not when it closes) | `question`: `what_is_aagman` · `is_it_a_broker` · `does_it_predict` · `why_not_chatgpt` · `trades_on_its_own` · `signals_or_tips` · `regulated` · `high_volatility` · `without_broker` · `shared_ip` | Q6 |
| `outbound_click` | a link to another site is clicked (not social, not a CTA) | `href`; `section` | Q7 |
| `social_click` | a link to LinkedIn, X, YouTube, GitHub, Reddit or Instagram is clicked, including our dub.sh short links to them | `platform`; `section` | Q7 |
| `contact_click` | an email link is clicked | `inbox` (the part before the @, e.g. `growth`; never the full address); `section` | Q7 |
| `blog_read` | a reader scrolls past half of a blog or docs page, once per page view | `slug` (the page path, e.g. `/blog/why-options-buyers-lose-money`) | Q8 |

**Which event wins when one click fits two:** `cta_click` → `app_link_click` → `card_click` → `nav_click` → `contact_click` → `social_click` → `outbound_click`. One click sends one event.

**How elements are recognised:** call-to-action buttons by their link (app.aagman.ai/login → `sign_up`, dub.sh/fZsnb0w → `talk_to_founders`, chat.whatsapp.com → `join_whatsapp`); a `data-cta="<label>"` on the element overrides that. Product cards by their link to a product page; action cards by `data-card="<card>"`; FAQ questions by `data-question="<question>"`. Sections and FAQ names are stamped into the pages by the site build (`build-site.py` in the site source), which stops if any marker is missing.

## 6. The visitor ID

- A random ID (`aag_vid`, 22 characters, no meaning) is created on the first visit and kept in a first-party cookie on `.aagman.ai` for 400 days (Chrome's maximum; Safari keeps it 7 days, see phase 3).
- It is passed to Umami with `umami.identify(aag_vid)` before the page view is sent, so one visitor's visits across days join into one journey.
- It is not sent to Google Analytics (GA4 keeps its own visitor ID in its `_ga` cookie).
- It never holds or is joined to a name, phone or email in phase 1. Phase 2 hands it to the app at sign-up.

## 7. Where tracking runs

| Where | Umami | Google Analytics |
|---|---|---|
| www.aagman.ai, aagman.ai | live website | live, normal |
| Vercel previews (`*.vercel.app`) | test website *(ID to create; until then nothing is sent)* | off; on with `?aag_debug=1`, sent in debug mode so it shows in GA4 DebugView |
| localhost | nothing sent | nothing sent |
| anywhere, with `?aag_debug=1` | every event is also printed in the browser console | same |
| a team member's browser | nothing sent | sent marked `traffic_type=internal`, removed by the GA4 internal-traffic filter (except in debug mode, so DebugView still works) |

**Marking a team browser:** open any page with `?aag_team=on` once (sets Umami's `umami.disabled` switch and an `aag_team` cookie). `?aag_team=off` undoes it.

## 8. Rules

1. **Production only.** Live numbers come only from www.aagman.ai and aagman.ai.
2. **Tracking never breaks a page.** Every send goes through one wrapper that does nothing if a tool failed to load.
3. **No personal data** in either tool (section 3).
4. **One definition per event.** Events are defined once in analytics.js and sent to both tools.
5. **New event = new row here first,** with the question it answers, then code, then a test.
6. **Section names never change once live.** Renaming breaks history; add a new name and retire the old one in section 11.

## 9. Drift check (weekly)

Each Monday, for the last 7 days, compare Umami and GA4 counts of: page views, `cta_click` (`sign_up`), `section_view`, `nav_click`, `faq_open`.

- Expect GA4 to be lower (ad blockers block Google more often). What matters is the **ratio**, not the totals.
- The first four weeks set the normal ratio for each event. After that, a ratio more than 25% away from normal means something broke: check the deploy log, both tools' scripts and the event in debug mode.
- Phase 1: done by hand from the two dashboards. Automating it is a later step.

## 10. Google Analytics setup (property 503925644)

- Data retention: 14 months for event and user data (event data was 2). **Done 2026-10-23.**
- Enhanced measurement: page views on; scrolls, outbound clicks, site search, form interactions, video and file downloads off (our events cover them; leaving them on double counts). **Done 2026-10-23.**
- Custom dimensions (event scope): `page`, `section`, `spot`, `label`, `target`, `menu`, `area`, `item`, `card`, `question`, `platform`, `slug`. **Done 2026-10-23.** (`href` and `inbox` are not registered: they are for spot checks, not reports.)
- Key event: `cta_click` (GA4 cannot filter a key event by `label`; the reports filter `label = sign_up`). GA4 only lets an event be starred once it has been received: star it after launch. The old `get_started_click` key event stops when Tag Manager goes.
- Internal-traffic filter (`traffic_type = internal`, exclude): Active. **Done 2026-10-23.**

## 11. Changes from the previous version (live until go-live)

| Before | Now |
|---|---|
| Umami only for custom events; GA4 via Tag Manager | Umami and GA4 both receive every event, from analytics.js |
| Google Tag Manager, Piqo, inline `gclid` and `dataLayer` scripts | removed |
| `cta_click` and `app_link_click` had `location` (`hero` / `nav` / `pricing` / `body` / `footer`) | replaced by `section` (+ `spot`, `label`); reports before go-live use `location` |
| `get_started_click`, `careers_click` (Tag Manager) | gone; covered by `cta_click`, `social_click` |
| Google Ads conversion tag `AW-18368771134` (fired on `get_started_click`, inside Tag Manager) | gone with Tag Manager; no campaign is live. Phase 2 sends Ads the real sign-ups instead |
| no `section_view`, `nav_open`, `nav_click`, `soon_click`, `card_click`, `faq_open` | added |

## 12. What is not tracked

- Screen recordings, heatmaps, mouse movement (Piqo is removed).
- Anything typed (the site has no forms).
- Pages served by the app through www (`/stock`, `/fund`, `/stock-screener`, `/chart`, `/news`, `/how-we-compute`): the app tracks those in its own Umami website.
- A person across two devices.
- A click in the first moment of a page load, before the trackers have loaded, if it leaves the page straight away (rare). Middle-clicks (open in a new tab) are counted.

## 13. How to add an event and test it

1. Add the row to section 5 (and any new value to its list).
2. Add it to analytics.js and a case to `tests/analytics.test.mjs`.
3. `node tests/analytics.test.mjs`
4. On the Vercel preview, open the page with `?aag_debug=1`, do the action, and check the console line, the Umami test website and GA4 DebugView.

## 14. Phase 2 and 3 (to be written)

Phase 2 adds: the click and trail cookies, the Sign up hand-off to the app, Google Ads settings and conversions. Phase 3 adds: the server-written click cookie for Safari.
