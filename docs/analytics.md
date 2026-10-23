# āagman analytics framework: website

Status: **phase 1 live** (2026-10-23) · **phase 2 built** (2026-10-23, section 14) · **phase 3 built** (2026-10-23, section 15) · approved by Aryan · Owner: Aryan · Scope: www.aagman.ai (marketing pages, docs, blog)

This is the contract for every piece of tracking on the website. Code follows this document. If an event is not in here, it does not ship.

Phases: **1. the whole website tracked** · **2. Google Ads infrastructure, the website-to-app hand-off** (section 14) · **3. Safari fix: the server writes the click cookie** (section 15).

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
| Q10 | Which ad, keyword and page brought each account, and did those people use the product? | `aag_click` and `aag_trail` handed to the app at Sign up, stored on the account (section 14) |

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

- A random ID (`aag_vid`, 22 characters, no meaning) is created on the first visit and kept in a first-party cookie on `.aagman.ai` for 400 days (Chrome's maximum; Safari keeps a script-written cookie 7 days, and phase 3 moved only `aag_click` to the server, section 15).
- It is passed to Umami with `umami.identify(aag_vid)` before the page view is sent, so one visitor's visits across days join into one journey.
- It is not sent to Google Analytics (GA4 keeps its own visitor ID in its `_ga` cookie).
- It never holds or is joined to a name, phone or email. Phase 2 deliberately does **not** hand it to the app: joining it to an account would turn Umami into a per-person browsing record. The account gets the short trail in `aag_trail` instead (section 14).

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

## 14. Phase 2: how a visitor arrived, handed to the app at Sign up

Built 2026-10-23 (aagman-v2 issue #6343, PRD `docs/prd/platform/acquisition-attribution-google-ads.md` in aagman-v2). The app stores what these cookies hold on the new account; nothing here is sent to Umami or Google Analytics.

```
 ad click  www.aagman.ai/charts?gclid=…&utm_source=google&utm_medium=cpc&utm_campaign={campaignid}
                                &adgroup={adgroupid}&utm_term={keyword}&utm_content={creative}
     │ analytics.js, on every page view (since phase 3 the server writes aag_click, section 15)
     ├─ aag_click  (.aagman.ai, 90 days from the last visit)   first touch + latest tagged touch
     ├─ aag_trail  (.aagman.ai, 30 days)                       last 12 pages + the Sign up spot clicked
     ├─ Umami: url keeps only utm_* tags, referrer only its origin (aagUmamiBeforeSend)
     │ Sign up click
     ▼ app.aagman.ai/login?src=<page>.<section>&utm_*=…&adgroup=…&gclid=…   (backup if cookies are blocked)
 app login page reads the cookies and the link → sent with "Get OTP" → stored on the account
```

**Touch keys** (the same names the app and gateway use): `source`, `medium`, `campaign`, `term`, `content` (from `utm_*`), `adGroup` (from `adgroup`), the click ids `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `clickAt` (ISO time, only with a click id), `landingPath`, `referrerHost` (outside sites only). Every value is capped at 128 characters and at 200 once URL-encoded, so a Hindi keyword cannot bloat the cookie.

**`aag_click`** = URL-encoded JSON `{"v":1,"f":{…},"l":{…}}`.
- `f`, the first touch: written on the first visit (even a direct one, then only `landingPath`) and not changed after. The cookie is re-dated on every visit, so it lasts until 90 days pass with no visit; after that the next visit is a new first touch.
- `l`, the latest tagged touch: replaced by every visit that carries a campaign tag or a click id. It holds the tags, click id and `clickAt`, not the landing page or referrer. When the new visit has tags but no click id of its own (a newsletter, WhatsApp or social link), the previous click id and its `clickAt` stay in `l`, so the ad click is still credited.
- A visit with no tag leaves both touches as they were. A cookie with another `v`, or without a usable first touch, is replaced.
- At most 3,000 characters encoded (typically 300 to 600; browsers drop a cookie over 4 KB silently). If a cookie would exceed it, keyword, ad, referrer, landing page, campaign, ad group, medium and source are dropped in that order; click ids are always kept.

**`aag_trail`** = URL-encoded JSON `{"v":1,"p":"/charts@1729661400|/pricing@1729661460","s":"pricing.plans"}`: the last 12 page paths (each capped at 128 characters, `@` and `|` replaced by `_`) with the time (unix seconds) each was opened, a reload not counted twice, and `s`, the `spot` (section 3) of the last Sign up clicked.

**Sign up hand-off.** On a click classified as `cta_click` with `label = sign_up` whose link goes to app.aagman.ai (page buttons, the header, and the phone menu's `.mn-go`), analytics.js:
1. stores the click's `spot` in `aag_trail`;
2. adds to the link `src=<spot>` and the latest touch's `utm_*`, `adgroup` and Google click id (`gclid`, `gbraid`, `wbraid`; else the first touch's). Meta and Microsoft ids (`fbclid`, `msclkid`) stay in the cookie only: the app reads them from there, and a link URL can be logged by other tools. Only `https://app.aagman.ai` links are rewritten. Parameters already on the link are left alone.
3. A bare `https://app.aagman.ai` link becomes `https://app.aagman.ai/login?next=/trading-strategy&…` (URL-encoded): the app's root redirects drop the query, and the login page sends a signed-in visitor straight on to `next`.

The link is the backup for when the app cannot read the cookies; the cookies carry the full history. With cookies blocked, the link carries what is known on that page view only (the landing page's tags if Sign up is clicked there). Long-press "copy link" and right-click menus get no rewrite; the cookies still cover them.

The menu's `.mn-talk` goes to the founders' booking link (dub.sh), so it is a `cta_click` (`talk_to_founders`) with no hand-off.

**Umami strip.** The Umami script has `data-before-send="aagUmamiBeforeSend"`: before every send (page view, event, identify, performance) the `url` keeps its path and only its `utm_*` parameters (every click id, `_gl`, `dclid`, `twclid`, `li_fat_id`, `ttclid`, `igshid`, `srsltid` and anything else goes, in any letter case), a hash containing `=` is dropped, and the `referrer` is reduced to its origin. It is an allowlist, so a new tracker parameter cannot slip through. UTM tags stay, so campaign reports in Umami keep working. The script is loaded with `crossorigin="anonymous"`, so the browser does not send our cookies (which hold the click id) to analytics.aagman.ai. Google Analytics keeps the full URL: GA4 and Google Ads are linked, and the click id is Google's own.

**What the app does with it** (aagman-v2): the login page reads both cookies and its own URL. A click id in the app's own URL counts as the freshest click. The gateway stores the touches on the OTP request, then copies them onto the account once, when it is created. A daily file sends Google Ads one row per "Account created", "OTP requested" and "Activated", credited to the latest Google click.

**Google Ads account settings** (each changed only on Aryan's yes, recorded here when done):
- Final URL suffix, account level: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&adgroup={adgroupid}&utm_term={keyword}&utm_content={creative}`. A campaign must not set its own suffix: it would replace this one.
- Auto-tagging on (adds `gclid`, or `gbraid` / `wbraid` on iPhones).
- Conversion actions "Account created" (primary), "OTP requested" and "Activated" (secondary), imported from clicks, by a daily scheduled upload. The five old actions are removed. GA4 events are never imported as conversions.

**Test:** open `www.aagman.ai/charts?utm_source=test&utm_campaign=phase2&gclid=TEST123` with `?aag_debug=1`, open two more pages, click Sign up. The login URL carries `src=charts.hero` and `gclid=TEST123`; Umami shows the visit with `utm_campaign=phase2` and no `TEST123`.

**Known gaps:** a click on one device and a sign-up on another; Safari keeps script-written cookies for 7 days, not 90 (fixed for `aag_click` by phase 3, section 15); Safari Private Browsing and some in-app browsers drop click ids before the page loads. App pages served through www (`/stock`, `/fund`, `/stock-screener`, `/chart`, `/news`, `/how-we-compute`) do not load analytics.js, so **ads must land on marketing pages**; an ad landing on an app page is seen only by the app's own URL reading, for that session.

## 15. Phase 3: the server writes `aag_click`, so Safari keeps it 90 days

Built 2026-10-23. **Why:** Safari (ITP) keeps a cookie written by page script (`document.cookie`) for at most 7 days, and 1 day when the visitor arrives from a site it classes as a tracker and the landing URL has a query or fragment. A cookie set in the `Set-Cookie` of the page's own response keeps its full lifetime, because the response comes from the site's own server. Since Safari 16.4 a server cookie is also capped at 7 days when the responding server's IP address differs from the site's, so **`aag_click` must keep coming from the response for the page itself**: never move this behind a CNAME to another service or a proxy on another IP. About 93% of past ad clicks were on phones, many of them iPhones.

```
 GET www.aagman.ai/charts?gclid=…&utm_source=google…        (any marketing page)
     │ middleware.ts (Vercel Routing Middleware), before the page is served:
     │   aag_click from the Cookie header + this visit, by analytics.js's own updateClick
     ▼ Set-Cookie: aag_click=…; Max-Age=7776000; Path=/; Domain=.aagman.ai; SameSite=Lax; Secure
 analytics.js on the page
     ├─ aag_click   this visit already in it (clickApplied) → not written again
     │              not in it (the middleware did not run)  → written by the script, as in phase 2 (fallback)
     └─ aag_trail, aag_vid   written by the script, as before
```

**Where it runs.** `config.matcher` in `middleware.ts` = the forwarding paths (unchanged), then `/:path((?!_next(?:/|$))[^.]*)`: every path with no dot anywhere, except `/_next` (`isMarketingPage` applies the same rule). That is every page view of the marketing pages, docs, blog and investor pages (and 404s), and never a file (`.js`, `.css`, images, `sitemap.xml`, `robots.txt`; a `.html` URL is redirected to its clean path first). Pages forwarded to the app match too but go down the forwarding path first, exactly as before: the two request headers and no cookie. One function call per page view, GET only (HEAD gets nothing). `tests/forwarding.test.mjs` checks the list with Vercel's own matcher compiler. A page path with a dot (say `/blog/v1.2/post`) gets no server cookie; the script's fallback covers it.

**What it writes.** The phase 2 cookie, byte for byte: `middleware.ts` imports `touchFromUrl`, `updateClick` and `serializeClick` from analytics.js, so the format, the first and latest touch rules and both caps (128 characters a value, 3,000 a cookie) cannot drift apart. The touch comes from the request: tags and click ids from the URL, its path as `landingPath`, and the `Referer` header's host as `referrerHost` (outside sites only). Attributes: 90 days, `Path=/`, `Domain=.aagman.ai` (host-only on `*.vercel.app` previews, where that domain would be rejected), `SameSite=Lax`, `Secure`. Not `HttpOnly`: the app's login page reads it.

**On every page view, not only tagged ones.** A visit with no tag re-sends the cookie unchanged, so:
- the 90 days still run from the last visit (phase 2's rule) without a script write;
- an untagged first visit is still the first touch, now server-written;
- a cookie the script wrote as a fallback becomes a server cookie on the next page view.

**The page script, and the fallback.** analytics.js now writes `aag_click` only when `clickApplied(cookie, visit)` is false: no usable cookie, or a tagged visit whose tags and click id are not the latest touch. It then writes exactly as in phase 2. That covers visits the middleware did not: a middleware error (it writes nothing and the page loads as normal), local files, any host without the middleware. In Safari a fallback write lasts 7 days, until the next page view re-sends it from the server. `clickAt` is not compared (server and phone clocks differ). The latest touch must be exactly what this visit makes it, so a tag the visit dropped also means a write. A tag missing from the cookie counts as cut by the size cap only when the cookie is within one value of the 3,000-character cap.

**Reach.** The cookie is now set even when analytics.js is blocked or never runs (content blockers, bots, link previews). It holds nothing personal (section 3), but it is a change in who gets it, worth noting if consent rules ever apply.

**Not changed:** `aag_trail` and `aag_vid` are still written by the script, so Safari keeps them 7 days: the trail starts again after 7 days without a visit, and Umami stops joining visits after 7. The Sign up hand-off, the Umami strip and the forwarding are unchanged. Ads must still land on marketing pages: the cookie is not written on the pages forwarded to the app.

**Tests:** `tests/click-cookie.test.mjs`: the builder (parsing, first vs latest touch, refresh, size cap, nothing personal, never on forwarded pages, files or `/_next`, never throws) and analytics.js in a simulated browser (no rewrite after the server wrote this visit; fallback write when it did not).

**Check a deploy** (a GET: `curl -I` sends HEAD, which gets no cookie):
`curl -s -D - -o /dev/null 'https://www.aagman.ai/?gclid=TEST&utm_source=test'` shows one `set-cookie: aag_click=…; Max-Age=7776000; …`; the same for `https://www.aagman.ai/stock/reliance?gclid=TEST` shows none. A preview shows the same without `Domain`.

**Check in Safari** (Mac Safari has the same ITP as iPhone Safari):
1. Safari, Settings, Privacy, Manage Website Data: remove `aagman.ai` (on iPhone: Settings, Apps, Safari, Advanced, Website Data).
2. Open `https://www.aagman.ai/?gclid=SAFARI_TEST&utm_source=test` in a normal (not private) window.
3. Develop, Show Web Inspector (for an iPhone: Web Inspector switched on in its Safari settings, the phone plugged into the Mac, then Develop, *the iPhone*, the page), Storage, Cookies.
4. Expected: `aag_click` on `.aagman.ai` expires about 90 days from today; `aag_trail` (asked for 30 days, script-written) about 7 days, which shows ITP is active.

