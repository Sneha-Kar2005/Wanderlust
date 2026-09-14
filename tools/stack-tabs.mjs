/**
 * Stacks the real tab strip above the clone's at identical scale (both are
 * DPR-2 captures, so no resizing — one device pixel means the same thing in
 * each), for a true side-by-side.
 */
import sharp from 'sharp';
import { chromium } from 'playwright';

const DIR = '/Users/techsaswata/Downloads/Wanderlust/capture/tabs-compare';
const REAL_SRC = '/Users/techsaswata/Downloads/Wanderlust/capture/home/home-full.png';

// Real home page, DPR 2: the tab strip sits here.
const REAL = { left: 960, top: 40, width: 1160, height: 140 };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

// Same CSS region as the real crop so the comparison is honest.
const clip = { x: REAL.left / 2, y: REAL.top / 2, width: REAL.width / 2, height: REAL.height / 2 };
const cloneBuf = await page.screenshot({ clip });
await browser.close();

const realBuf = await sharp(REAL_SRC).extract(REAL).png().toBuffer();

const label = (text) =>
  Buffer.from(
    `<svg width="${REAL.width}" height="34"><rect width="100%" height="100%" fill="#111"/>` +
      `<text x="12" y="23" font-family="monospace" font-size="16" fill="#fff">${text}</text></svg>`,
  );

const H = REAL.height;
await sharp({
  create: { width: REAL.width, height: H * 2 + 34 * 2, channels: 3, background: '#fff' },
})
  .composite([
    { input: label('REAL  airbnb.co.in'), top: 0, left: 0 },
    { input: realBuf, top: 34, left: 0 },
    { input: label('CLONE localhost:3000'), top: 34 + H, left: 0 },
    { input: cloneBuf, top: 34 * 2 + H, left: 0 },
  ])
  .png()
  .toFile(`${DIR}/stacked.png`);

console.log(`wrote ${DIR}/stacked.png  (${REAL.width}x${H * 2 + 68} device px, DPR 2)`);
