import { chromium } from 'playwright';
import fs from 'node:fs/promises';

/**
 * Crops the top N CSS pixels of a saved full-page screenshot so the clone and
 * the real capture can be eyeballed at the same scale.
 * usage: node crop.mjs <in.png> <out.png> <heightCss> [scale]
 */
const [input, output, heightCss = '1000'] = process.argv.slice(2);
const buf = await fs.readFile(input);
const b64 = buf.toString('base64');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1512, height: Number(heightCss) },
  deviceScaleFactor: 1,
});
await page.setContent(
  `<style>html,body{margin:0;padding:0;overflow:hidden}
   img{display:block;width:1512px}</style>
   <img src="data:image/png;base64,${b64}">`,
);
await page.waitForTimeout(400);
await page.screenshot({ path: output, clip: { x: 0, y: 0, width: 1512, height: Number(heightCss) } });
await browser.close();
console.log('wrote', output);
