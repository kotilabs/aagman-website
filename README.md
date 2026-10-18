# Āagman — Website (static, ready to host)

This folder is the complete Āagman marketing site as plain static HTML. No build step, no framework, no server code. Every page is a self-contained `.html` file that loads one shared runtime (`support.js`) and images from `uploads/`.

## Files

| File | Page | URL path |
|---|---|---|
| `index.html` | Landing page (home) | `/` |
| `landing-gradient.html` | Alternate landing — gradient headline variant | `/landing-gradient.html` |
| `pricing.html` | Pricing | `/pricing.html` |
| `founders-letter.html` | Founders Letter | `/founders-letter.html` |
| `terms.html` | Terms & Conditions | `/terms.html` |
| `privacy-policy.html` | Privacy Policy | `/privacy-policy.html` |
| `risk-disclosure.html` | Risk Disclosure | `/risk-disclosure.html` |
| `cancellation-refunds.html` | Cancellations & Refunds | `/cancellation-refunds.html` |
| `docs/` | Documentation section | `/docs/` |
| `support.js` | Shared runtime (required — keep alongside the HTML) | — |
| `uploads/` | Logo + founder photos | — |

### Docs section (`docs/`)

| File | Page | URL path |
|---|---|---|
| `docs/index.html` | Docs hub / guide listing | `/docs/` |
| `docs/how-to-prompt.html` | How to Prompt Āagman | `/docs/how-to-prompt.html` |
| `docs/connect-zerodha.html` | Connect Zerodha broker | `/docs/connect-zerodha.html` |

`index.html` is the homepage (the original "terminal" landing). `landing-gradient.html` is an alternate version with a green→cyan→blue→lavender gradient on the headlines. To use the gradient one as the homepage instead, swap the two files: rename `index.html` → `landing-terminal.html` and `landing-gradient.html` → `index.html`.

## Notes
- All internal navigation uses relative links and already points at these filenames.
- Pages render client-side via `support.js`; fonts load from Google Fonts over the network, so the host needs normal outbound access (any standard static host is fine).
- Keep the folder structure exactly as-is (HTML files at the root, `support.js` at the root, images under `uploads/`).

---

## Task for the agent: publish this site

1. **Create a new GitHub repo** (e.g. `aagman-website`), public.
2. **Push every file in this folder** to the `main` branch, preserving structure:
   ```
   /
   ├── index.html
   ├── landing-gradient.html
   ├── pricing.html
   ├── founders-letter.html
   ├── terms.html
   ├── privacy-policy.html
   ├── risk-disclosure.html
   ├── cancellation-refunds.html
   ├── support.js
   └── uploads/
       ├── aagman-logo.png
       ├── ajit-lp.jpeg
       └── auc0WBLWXQgFk2g0GKOIqOpOaH0.webp
   ```
3. **Host it.** Any static host works — pick one:
   - **Vercel / Netlify:** import the repo, framework preset "Other / no build command", output directory = root. Deploy.
   - **GitHub Pages:** repo → Settings → Pages → Source: "Deploy from a branch" → Branch `main` / `/ (root)` → Save.
   - **Cloudflare Pages:** connect repo, no build command, root output.
4. **Custom domain (optional):** add the domain in the host's dashboard and create the DNS record it gives you (CNAME for subdomains; the host's A/ALIAS records for an apex like `aagman.in`).

There is no build command and no environment variables. If the host asks for a build step, leave it blank — these are pre-built static files.


---

## Public app pages served on www (forwarding)

www.aagman.ai serves the app's public pages from the app server. `vercel.json` rewrites these paths to `https://app.aagman.ai/<same path>`, and nothing else:

- `/stock`, `/stock/*`, `/fund`, `/fund/*`, `/stock-screener`, `/stock-screener/*`, `/how-we-compute`, `/how-we-compute/*`
- `/chart`, `/chart/*`, `/news`, `/news/*` (whole segments only: `/charts` stays on this site)
- `/_next/*` (the app's scripts, styles and images)
- `/sitemap-stocks.xml`, `/sitemap-funds.xml`, `/sitemap-screens.xml`, `/sitemap-charts.xml`, `/sitemap-news.xml`, `/llms.txt`
- `/0ea2491ba8dc98fd3c8de4a2fb8998ca.txt` (the app's IndexNow key file)

`/sitemap.xml` and `/robots.txt` stay this site's own. `robots.txt` also lists the app's stocks, funds, screens and charts sitemap files. `sitemap-news.xml` is forwarded already, but its robots.txt line ships later with the news PR. A bare root such as `/fund` gets its own rule so it is not forwarded as `/fund/`.

`middleware.ts` (Vercel Routing Middleware, `@vercel/functions`) runs on the same paths except `/_next/*`: the app ignores these headers on its static assets, so no function call is spent per script or stylesheet. It sets two request headers for the app and drops any copy the visitor sent:

- `x-aagman-edge-secret`: the value of the `PUBLIC_EDGE_SECRET` env var. It must equal the app's `aagman-app:publicEdgeSecret` (32+ characters of `A-Z a-z 0-9 _ -`, e.g. `openssl rand -hex 32`). If the env var is unset or malformed, requests are forwarded without the header.
- `x-aagman-visitor-ip`: the visitor's address as Vercel saw it.

**Env var:** in the Vercel project, add `PUBLIC_EDGE_SECRET` for **Production only** (not Preview or Development). Never log it or commit it.

**Tests:** `npm install && npm test` (needs Node 22.18 or later, which can load `middleware.ts`).

**Switch day order:**

1. Set `PUBLIC_EDGE_SECRET` in Vercel (Production). Set the same value on the app side (`pulumi config set --secret aagman-app:publicEdgeSecret ...`).
2. Merge this change and let Vercel deploy production.
3. Check www:
   - `/stock/reliance`, a `/fund/<slug>` page, `/stock-screener`, `/how-we-compute`, `/chart` and the sitemap files render from the app.
   - `/`, `/pricing`, `/docs/`, `/blog/`, `/sitemap.xml` and `/robots.txt` are unchanged.
4. Only then change the app-side settings, as described in the app repo's `deploy/docs/public-zone-edge.md`: `publicSiteOrigin`, then `publicZoneRedirect`. If the app redirects to www before www sends the secret, those pages loop between the two hosts.

Until the app's PR 1 is live in production, the app sitemap lines in robots.txt point at 404s. On switch day this lasts a few hours, which is accepted.

**Roll back:**

1. Turn the app-side redirect (`publicZoneRedirect`) off first.
2. Revert this change (`git revert <commit>`) and let Vercel deploy.

Reverting removes the rewrites, the middleware and the robots.txt lines. The env var can stay; nothing reads it after the revert.
