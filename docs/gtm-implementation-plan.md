# GTM Implementation Plan for aagman.ai

## 1. Goal
Deploy Google Tag Manager (GTM) so marketing, product, and growth can add / remove tracking pixels and event tags without touching code or redeploying the site.

## 2. What you need to give me
- **GTM Container ID** (looks like `GTM-XXXXXX`)
  - Create at https://tagmanager.google.com
  - Account name: `Koti Labs` (or `Aagman`)
  - Container name: `aagman.ai`
  - Target platform: **Web**

## 3. What I will do in code
Once you share the GTM ID, I will:
1. Remove the direct GA4 snippet (`G-Z3F6FR2YVL`) from all pages.
2. Add the GTM container snippet in `<head>` + `<body>` (noscript fallback) on every page.
3. Push a small data layer on key interactions so GTM can reliably fire events.
4. Deploy.

### GTM container snippet (head)
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

### GTM noscript snippet (body start)
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

## 4. Tags to create inside GTM

### 4.1 Base tracking tags
| Tag name | Type | Fires on | Purpose |
|----------|------|----------|---------|
| `GA4 - Config` | Google Analytics: GA4 Configuration | All Pages | Base pageview + user/session tracking |
| `Meta Pixel - Base` | Custom HTML | All Pages | Facebook/Instagram retargeting & conversion tracking |
| `LinkedIn Insight - Base` | Custom HTML | All Pages | LinkedIn ad attribution |
| `Google Ads - Remarketing` | Google Ads Remarketing | All Pages | Google Ads remarketing lists |

### 4.2 Event tags (GA4)
| Event name | Trigger | Why it matters |
|------------|---------|----------------|
| `click_get_started` | Click on "Get Started" / "Join Beta" buttons | Primary conversion intent |
| `click_pricing_cta` | Click on pricing page plan buttons | Plan selection intent |
| `click_linkedin_jobs` | Click on footer "Careers" link | Employer brand / hiring interest |
| `click_outbound_app` | Click on `app.aagman.ai` links | App signup starts |
| `click_social` | Click on LinkedIn / X / Instagram footer icons | Social proof engagement |
| `click_email_contact` | Click on `mailto:growth@kotilabs.com` | Direct contact intent |
| `scroll_50` | Scroll depth ≥ 50% | Content engagement |
| `scroll_90` | Scroll depth ≥ 90% | High content engagement |
| `file_download` | Click on `.pdf`, `.zip`, etc. | Resource downloads |
| `view_prompt_guide` | Pageview on `/how-to-prompt-aagman.html` | Content marketing KPI |
| `view_legal_page` | Pageview on terms / privacy / risk disclosure | Compliance content views |

### 4.3 Conversion / pixel event tags
| Tag | Event | Trigger |
|-----|-------|---------|
| `Meta - Lead` | `Lead` | `click_get_started` |
| `Meta - ViewContent` | `ViewContent` | All Pages |
| `LinkedIn - conversion` | `insight_tag` conversion | `click_get_started` |
| `Google Ads - Conversion` | `submit_lead_form` | `click_get_started` |

## 5. Triggers to create in GTM

### 5.1 Built-in / simple triggers
- **All Pages** (pageview)
- **Outbound Links** — click URL does not contain `aagman.ai`
- **Scroll Depth** — vertical 50%, 90%
- **File Downloads** — click URL ends with `.pdf`, `.zip`, `.docx`, etc.

### 5.2 Custom click triggers (need CSS selectors)
Use IDs/classes already present on the site:

| Trigger name | Selector / condition |
|--------------|----------------------|
| `Click - Get Started` | Click URL contains `app.aagman.ai` OR inner text contains "Get Started" / "Join Beta" |
| `Click - Pricing CTA` | Click on pricing page buttons near pricing cards |
| `Click - Careers` | Click URL equals `https://www.linkedin.com/company/aagman-ai/jobs/` |
| `Click - Social Icons` | Click URL contains `dub.sh/lp-linkedin`, `dub.sh/x-lp`, `dub.sh/insta-lp` |
| `Click - Email Contact` | Click URL starts with `mailto:` |
| `Page - Prompt Guide` | Page URL contains `how-to-prompt-aagman.html` |
| `Page - Legal` | Page URL contains `terms`, `privacy-policy`, `risk-disclosure`, `cancellation-refunds` |

## 6. Variables needed
Enable these built-in variables in GTM:
- Click URL
- Click Text
- Page URL
- Page Path
- Scroll Depth Threshold
- Event

## 7. Data layer pushes (optional but recommended)
I can add small JavaScript pushes so events are cleaner and not dependent on fragile CSS selectors:

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'get_started_click',
  location: 'hero',      // hero / nav / pricing / footer
  plan: 'beta'           // if applicable
});
```

Recommended data layer events:
- `get_started_click`
- `pricing_cta_click`
- `careers_click`
- `social_click` (with `platform`: linkedin/x/instagram)
- `contact_click`

## 8. Implementation sequence
1. You create GTM container and share `GTM-XXXXXX`.
2. I install GTM snippet on all pages + add data layer events for key CTAs.
3. I deploy.
4. In GTM, you (or I) create:
   - GA4 Config tag → publish
   - Triggers for clicks, scroll, outbound links
   - GA4 event tags
   - Meta / LinkedIn / Google Ads tags (optional)
5. Test with GTM Preview mode.
6. Submit and publish GTM container.
7. Verify events in GA4 DebugView.

## 9. Quick wins after GTM is live
- Retargeting audiences in Meta/LinkedIn/Google Ads
- Funnel: homepage → pricing → app.aagman.ai click
- Measure prompt guide traffic as a content KPI
- Track which CTA placement converts best (hero vs nav vs footer)

## 10. Files that will be touched
- `index.html`
- `pricing.html`
- `how-to-prompt-aagman.html`
- `terms.html`
- `privacy-policy.html`
- `risk-disclosure.html`
- `cancellation-refunds.html`
