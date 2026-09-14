import { chromium } from 'playwright';

export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

export async function makeContext({ width = 1512, height = 900, dsf = 2 } = {}) {
  const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: dsf,
    locale: 'en-IN', timezoneId: 'Asia/Kolkata', userAgent: UA,
  });
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
  return { browser, ctx };
}

export async function dismissOverlays(page) {
  const sels = [
    'button:has-text("Got it")', '[aria-label="Close"]', 'button:has-text("Accept")',
    'button:has-text("OK")', '[data-testid="modal-container"] button[aria-label*="Close" i]',
  ];
  for (const s of sels) {
    try {
      const el = page.locator(s).first();
      if (await el.isVisible({ timeout: 1200 })) { await el.click({ timeout: 2500 }); await page.waitForTimeout(500); }
    } catch {}
  }
}

export async function autoScroll(page, steps = 14, pause = 700) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.85));
    await page.waitForTimeout(pause);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}
