const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect dataLayer pushes via page evaluation
  await page.goto('https://www.aagman.ai/', { waitUntil: 'networkidle' });

  // Check GTM loaded
  const gtmLoaded = await page.evaluate(() => {
    return !!(window.google_tag_manager && window.google_tag_manager['GTM-T72DN6HQ']);
  });
  console.log('GTM container loaded:', gtmLoaded);

  // Check dataLayer exists and has gtm.start
  const dataLayerCheck = await page.evaluate(() => {
    if (!window.dataLayer) return 'no dataLayer';
    const hasStart = window.dataLayer.some(e => e.event === 'gtm.js');
    return { length: window.dataLayer.length, hasGtmJs: hasStart };
  });
  console.log('dataLayer check:', dataLayerCheck);

  // Click Get Started and capture dataLayer before navigation
  let capturedEvent = null;
  page.on('framenavigated', async () => {
    capturedEvent = await page.evaluate(() => {
      if (!window.dataLayer) return null;
      return window.dataLayer.filter(e => e.event === 'get_started_click').pop();
    }).catch(() => null);
  });

  // Find and click a link to app.aagman.ai
  const getStarted = await page.locator('a[href*="app.aagman.ai"]').first();
  if (await getStarted.isVisible().catch(() => false)) {
    await getStarted.click();
    await page.waitForTimeout(1000);
    capturedEvent = await page.evaluate(() => {
      if (!window.dataLayer) return null;
      return window.dataLayer.filter(e => e.event === 'get_started_click').pop();
    }).catch(() => null);
    console.log('get_started_click event:', capturedEvent);
  } else {
    console.log('No Get Started link found');
  }

  await browser.close();
})();
