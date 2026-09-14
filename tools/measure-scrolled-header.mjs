/** Measure the live header before and after scrolling, to copy its collapse. */
import fs from 'node:fs/promises';
import { makeContext, dismissOverlays } from './lib-browser.mjs';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/header-scroll';
await fs.mkdir(OUT, { recursive: true });

const probe = () => {
  const h = document.querySelector('header');
  const r = h?.getBoundingClientRect();
  const cs = h ? getComputedStyle(h) : null;
  const pill = document.querySelector('[data-testid="little-search"]');
  const pr = pill?.getBoundingClientRect();
  const big = document.querySelector('[data-testid="structured-search-input-field-query"]');
  const tabs = document.querySelector('[data-testid="tab-list-wrapper"]');
  const tr = tabs?.getBoundingClientRect();
  return {
    headerHeight: r ? +r.height.toFixed(1) : null,
    headerPosition: cs?.position ?? null,
    headerTop: r ? +r.top.toFixed(1) : null,
    bigSearchVisible: !!big && big.getBoundingClientRect().height > 0,
    tabsVisible: !!tr && tr.height > 0,
    tabsHeight: tr ? +tr.height.toFixed(1) : null,
    pillVisible: !!pr && pr.height > 0,
    pill: pr ? `${Math.round(pr.width)}x${Math.round(pr.height)}` : null,
    pillText: pill?.innerText?.replace(/\n/g, ' | ') ?? null,
    scrollY: Math.round(window.scrollY),
  };
};

const { browser, ctx } = await makeContext();
const page = await ctx.newPage();
await page.goto('https://www.airbnb.co.in/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
await dismissOverlays(page);
await page.waitForTimeout(1000);

console.log('AT TOP:');
console.log(' ', JSON.stringify(await page.evaluate(probe)));
await page.screenshot({ path: `${OUT}/live-top.png`, clip: { x: 0, y: 0, width: 1512, height: 220 } });

for (const y of [200, 600, 1200]) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(1200);
  console.log(`AFTER SCROLL ${y}:`);
  console.log(' ', JSON.stringify(await page.evaluate(probe)));
}
await page.screenshot({ path: `${OUT}/live-scrolled.png`, clip: { x: 0, y: 0, width: 1512, height: 220 } });

await browser.close();
console.log(`\nwrote ${OUT}`);
