import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/clone/mobile';
await fs.mkdir(OUT, { recursive: true });

const paths = process.argv.slice(2);
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await ctx.newPage();

for (const p of paths) {
  const name = p === '/' ? 'home' : p.replace(/^\//, '').replace(/[/?=&]/g, '_').slice(0, 50);
  const res = await page.goto(`http://localhost:3000${p}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);

  const overflow = await page.evaluate(() => {
    window.scrollTo(3000, 0);
    const x = window.scrollX;
    window.scrollTo(0, 0);
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('*')]
      .filter(el => el.getBoundingClientRect().right > vw + 1 && el.getBoundingClientRect().width > 40)
      .slice(0, 3)
      .map(el => `${el.tagName}.${(el.className || '').toString().slice(0, 40)}`);
    return { canScrollX: x, docW: document.documentElement.scrollWidth, vw, wide };
  });

  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  const ok = overflow.canScrollX === 0 ? 'OK' : 'H-SCROLL!';
  console.log(`${p} -> ${res?.status()} ${ok} doc=${overflow.docW} vw=${overflow.vw}`);
  if (overflow.canScrollX !== 0) console.log('   offenders:', overflow.wide.join(' | '));
}
await browser.close();
