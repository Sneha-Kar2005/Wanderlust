/** Crop the product-tab strip from the live site and the clone, same scale. */
import fs from 'node:fs/promises';
import { makeContext, dismissOverlays } from './lib-browser.mjs';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/tabs-compare';
await fs.mkdir(OUT, { recursive: true });

/** Bounding box covering all four tab labels + their icons. */
const stripBox = () => {
  const LABELS = ['All', 'Homes', 'Experiences', 'Services'];
  const els = [...document.querySelectorAll('a,button')].filter((e) => {
    const lines = (e.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    return lines.length && lines.every((l) => LABELS.includes(l)) && LABELS.includes(lines[0]);
  });
  if (!els.length) return null;
  const boxes = els.map((e) => e.getBoundingClientRect());
  // include icon images, which can overflow the anchor box
  for (const e of els) {
    const img = e.querySelector('img');
    if (img) boxes.push(img.getBoundingClientRect());
  }
  return {
    x: Math.min(...boxes.map((b) => b.left)),
    y: Math.min(...boxes.map((b) => b.top)),
    right: Math.max(...boxes.map((b) => b.right)),
    bottom: Math.max(...boxes.map((b) => b.bottom)),
  };
};

async function grab(page, name) {
  const b = await page.evaluate(stripBox);
  if (!b) return console.warn(`  !! ${name}: strip not found`);
  const pad = 16;
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    clip: {
      x: Math.max(0, b.x - pad),
      y: Math.max(0, b.y - pad),
      width: b.right - b.x + pad * 2,
      height: b.bottom - b.y + pad * 2,
    },
  });
  console.log(
    `  ${name}: ${Math.round(b.right - b.x)} x ${Math.round(b.bottom - b.y)} css px`,
  );
}

const { browser, ctx } = await makeContext();

const live = await ctx.newPage();
await live.goto('https://www.airbnb.co.in/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await live.waitForTimeout(6000);
await dismissOverlays(live);
// Wait for the tab artwork to actually decode, not the grey skeleton.
await live.waitForFunction(() => {
  const imgs = [...document.querySelectorAll('img')].filter(i =>
    /search-bar-icons/.test(i.src));
  return imgs.length >= 4 && imgs.every(i => i.complete && i.naturalWidth > 0);
}, { timeout: 30000 }).catch(() => {});
await live.waitForTimeout(2500);
await grab(live, 'live');
await live.close();

const mine = await ctx.newPage();
await mine.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await mine.waitForTimeout(1200);
await grab(mine, 'clone');

await browser.close();
console.log(`\nwrote ${OUT}`);
