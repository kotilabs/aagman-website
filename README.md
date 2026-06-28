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
| `support.js` | Shared runtime (required — keep alongside the HTML) | — |
| `uploads/` | Logo + founder photos | — |

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
