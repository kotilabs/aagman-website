# Analytics event taxonomy

All analytics collection uses [Umami](https://umami.is) and is owned by `analytics.js`, which is loaded statically with `defer` on every page and self-gates: unless the hostname is `www.aagman.ai` or `aagman.ai`, it returns immediately. On production it dynamically injects the Umami tracker (`https://analytics.aagman.ai/script.js`, website ID `e2f79735-4b71-4458-81f6-bdcb71ea9c6f`) into `<head>` and then registers its listeners. **Collection is production-only, pageviews included** — on localhost, previews, or staging no Umami script is ever loaded and nothing is collected. The `umami.track` wrapper no-ops until the async tracker finishes loading, so the injection gap is safe.

## Events

| Event | Trigger | Params | Decision it informs |
|---|---|---|---|
| `cta_click` | Click on a primary "Get started" CTA (`data-cta="primary"`) | `location` (`hero` / `nav` / `pricing` / `body` / `footer`), `page` | Landing effectiveness — which CTA placements actually convert (conversion proxy before signup) |
| `app_link_click` | Click on any other link to `app.aagman.ai` | `location` (`nav` / `body` / `footer`), `page` | Login-portal vs signup intent — how much app traffic is existing users vs prospects |
| `blog_read` | Reader scrolls past 50% of a `/blog/` or `/docs/` page (fires once per page view) | `slug` | Content strategy — which posts are actually read, not just opened |
| `social_click` | Click on a link to a social platform (twitter/x, linkedin, youtube, github, reddit, instagram) | `platform`, `page` | Channel interest — which social channels deserve investment |
| `contact_click` | Click on a `mailto:` link | `href`, `page` | Support demand — which pages push people to email us |
| `outbound_click` | Click on any other external `http(s)` link | `href`, `page` | Leakage — where users leave the site, and whether those exits need intercepting |

## Rules

- **Production-host gating.** `analytics.js` owns tracker injection: the Umami script is injected only on `www.aagman.ai` / `aagman.ai`. Never load the tracker statically, and never emit events from localhost, previews, or staging.
- **New events require a contract entry.** Any new event must be added to the table above *with the decision it informs* before it ships. An event without a stated decision is noise and must not be added.
- **Naming.** `snake_case`, `noun_verb` (e.g. `cta_click`, `blog_read`). Param keys are also `snake_case`.
- **Attribution via markup.** Primary CTAs are marked with `data-cta="primary"` and `data-cta-location="<location>"` in HTML. New primary CTAs must carry both attributes with a location from the existing set (or extend the set deliberately).
- **Failure isolation.** Tracking must never break the page: all calls go through a wrapper that no-ops if `window.umami.track` is unavailable.

## Verification

`node tests/analytics.test.mjs` covers the click classifier for every event type.
