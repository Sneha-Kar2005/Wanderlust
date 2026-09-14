import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/clone';
await fs.mkdir(OUT, { recursive: true });

const paths = process.argv.slice(2);
if (!paths.length) paths.push('/');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1512, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message.slice(0, 200)));
page.on('requestfailed', r => errors.push(`REQFAIL ${r.url().slice(0, 120)} ${r.failure()?.errorText}`));

// Fail loudly if the page reaches for the internet — it must run fully offline.
const external = new Set();
page.on('request', r => {
  const u = r.url();
  if (!/^https?:\/\/localhost:3000/.test(u) && !/^data:|^blob:/.test(u)) external.add(u.slice(0, 140));
});

for (const p of paths) {
  const name = p === '/' ? 'home' : p.replace(/^\//, '').replace(/[/?=&]/g, '_').slice(0, 60);
  const res = await page.goto(`http://localhost:3000${p}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // trigger lazy images
  for (let i = 0; i < 8; i++) { await page.evaluate(() => window.scrollBy(0, window.innerHeight)); await page.waitForTimeout(350); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`${p} -> ${res?.status()} -> ${OUT}/${name}.png`);
}

if (errors.length) {
  console.log('\nCONSOLE/REQUEST ERRORS:');
  [...new Set(errors)].slice(0, 25).forEach(e => console.log('  ' + e));
} else console.log('\nno console errors');

if (external.size) {
  console.log('\nEXTERNAL REQUESTS (must be zero for offline):');
  [...external].slice(0, 25).forEach(u => console.log('  ' + u));
} else console.log('no external requests — fully offline');

await browser.close();
