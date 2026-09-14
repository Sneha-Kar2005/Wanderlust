/**
 * Builds the screenshot set used by README.md.
 *
 *  - Page shots are VIEWPORT-sized at a MacBook logical resolution (1512x900),
 *    never full-page, so they read at the size a reader actually sees.
 *  - Component shots are clipped to the element's box plus a little padding,
 *    so a dropdown or modal fills the frame instead of being a speck.
 *
 * Captured at DPR 2 and downscaled to CSS width on write, so they stay crisp
 * without shipping huge files.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = 'http://localhost:3000';
const OUT = '/Users/techsaswata/Downloads/Wanderlust/docs/screenshots';
const MAC = { width: 1512, height: 900 };
const PHONE = { width: 390, height: 844 };

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

/** Write a PNG buffer as a width-capped WebP. */
async function write(name, buf, cssWidth) {
  const file = path.join(OUT, `${name}.webp`);
  await sharp(buf)
    .resize({ width: cssWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(file);
  const { size } = await fs.stat(file);
  console.log(`  ${name}.webp  ${(size / 1024).toFixed(0)}KB`);
}

async function newPage(viewport = MAC, mobile = false) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'en-IN',
  });
  const page = await ctx.newPage();
  // Freeze animations so shots are reproducible.
  await page.addStyleTag({
    content: `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}`,
  }).catch(() => {});
  return { ctx, page };
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(700);
}

/** Viewport screenshot of a route, optionally after running `prepare`. */
async function pageShot(name, route, { prepare, scrollTo = 0, viewport = MAC, mobile = false } = {}) {
  const { ctx, page } = await newPage(viewport, mobile);
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  await page.addStyleTag({
    content: `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}`,
  }).catch(() => {});
  if (scrollTo) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
    await page.waitForTimeout(600);
  }
  if (prepare) await prepare(page);
  await page.waitForTimeout(400);
  await write(name, await page.screenshot(), viewport.width);
  await ctx.close();
}

/**
 * Clipped screenshot of one element (plus padding), so small UI reads clearly.
 * `pad` may be a number or {top,right,bottom,left}.
 */
async function elementShot(name, route, selector, { prepare, pad = 16, scrollTo = 0, maxWidth } = {}) {
  const { ctx, page } = await newPage();
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  await page.addStyleTag({
    content: `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}`,
  }).catch(() => {});
  if (scrollTo) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
    await page.waitForTimeout(600);
  }
  if (prepare) await prepare(page);
  await page.waitForTimeout(500);

  const box = await page
    .locator(selector)
    .first()
    .boundingBox({ timeout: 5000 })
    .catch(() => null);
  if (!box) {
    console.warn(`  !! ${name}: "${selector}" not found`);
    await ctx.close();
    return;
  }
  const p = typeof pad === 'number' ? { top: pad, right: pad, bottom: pad, left: pad } : pad;
  const vp = page.viewportSize();
  const clip = {
    x: Math.max(0, box.x - p.left),
    y: Math.max(0, box.y - p.top),
    width: Math.min(vp.width - Math.max(0, box.x - p.left), box.width + p.left + p.right),
    height: Math.min(vp.height - Math.max(0, box.y - p.top), box.height + p.top + p.bottom),
  };
  await write(name, await page.screenshot({ clip }), maxWidth ?? Math.round(clip.width));
  await ctx.close();
}

/**
 * Clip the union of several elements — used for a trigger plus the panel it
 * opens, so the dropdown is never cut off.
 */
async function unionShot(name, route, selectors, { prepare, pad = 16, scrollTo = 0, maxWidth } = {}) {
  const { ctx, page } = await newPage();
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  await page.addStyleTag({
    content: `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}`,
  }).catch(() => {});
  if (scrollTo) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
    await page.waitForTimeout(600);
  }
  if (prepare) await prepare(page);
  await page.waitForTimeout(500);

  const boxes = [];
  for (const sel of selectors) {
    const b = await page
      .locator(sel)
      .first()
      .boundingBox({ timeout: 5000 })
      .catch(() => null);
    if (b) boxes.push(b);
    else console.warn(`  .. ${name}: "${sel}" not visible`);
  }
  if (!boxes.length) {
    console.warn(`  !! ${name}: nothing to clip`);
    await ctx.close();
    return;
  }

  const left = Math.min(...boxes.map((b) => b.x));
  const top = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  const bottom = Math.max(...boxes.map((b) => b.y + b.height));

  const vp = page.viewportSize();
  const x = Math.max(0, left - pad);
  const y = Math.max(0, top - pad);
  const clip = {
    x,
    y,
    width: Math.min(vp.width - x, right - left + pad * 2),
    height: Math.min(vp.height - y, bottom - top + pad * 2),
  };
  await write(name, await page.screenshot({ clip }), maxWidth ?? Math.round(clip.width));
  await ctx.close();
}

const ROOM = '/rooms/1752121318473764362';
const SEARCH = '/s/North-Goa/homes';

const click = (sel) => async (page) => {
  await page.locator(sel).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(900);
};

console.log('\n— pages (1512x900 viewport) —');
await pageShot('page-home', '/');
await pageShot('page-homes', '/homes');
await pageShot('page-experiences', '/experiences');
await pageShot('page-services', '/services');
await pageShot('page-search', SEARCH);
await pageShot('page-room', ROOM);
await pageShot('page-room-lower', ROOM, { scrollTo: 1500 });
await pageShot('page-experience-detail', '/experiences/6754224');
await pageShot('page-service-detail', '/services/7090495');
await pageShot('page-checkout', `/book/stays/1752121318473764362?checkin=2026-09-21&checkout=2026-09-26&adults=2`);
await pageShot('page-trips', '/trips');
await pageShot('page-wishlists', '/wishlists');
await pageShot('page-login', '/login');
await pageShot('page-help', '/help');
await pageShot('page-host', '/host/homes');
await pageShot('page-become-a-host', '/become-a-host');
await pageShot('page-account', '/account-settings');
await pageShot('page-404', '/no-such-page');

console.log('\n— search bar & its three panels —');
await elementShot('search-bar', '/', '[data-testid="structured-search-input"]', { pad: 20 });
await unionShot(
  'search-where',
  '/',
  ['[data-testid="structured-search-input"]', '[data-testid="structured-search-input-field-query-panel"]'],
  { prepare: click('#bigsearch-query-location-input'), pad: 20 },
);
await unionShot(
  'search-when',
  '/',
  ['[data-testid="structured-search-input"]', '[data-testid="structured-search-input-field-dates-panel"]'],
  { prepare: click('[data-testid="structured-search-input-field-dates"]'), pad: 20 },
);
await unionShot(
  'search-who',
  '/',
  ['[data-testid="structured-search-input"]', '[data-testid="structured-search-input-field-guests-panel"]'],
  { prepare: click('[data-testid="structured-search-input-field-guests"]'), pad: 20 },
);
await elementShot('header-tabs', '/', '[data-testid="tab-list-wrapper"]', { pad: 24 });
await elementShot('header-usermenu', '/', 'header', {
  prepare: click('[data-testid="cypress-headernav-profile"]'),
  pad: { top: 0, right: 8, bottom: 260, left: 900 },
});
await elementShot('search-compact', ROOM, '[data-testid="little-search"]', { pad: 20 });

console.log('\n— filters —');
await elementShot('filters-pills', SEARCH, '[data-testid="stays-page-heading"]', {
  pad: { top: 90, right: 40, bottom: 10, left: 40 },
});
await elementShot('filters-modal', SEARCH, '[data-testid="filters-modal-panel"]', {
  prepare: click('button:has-text("Filters")'),
  pad: 8,
});
await elementShot('filters-amenities', SEARCH, '[data-testid="filters-modal-panel"]', {
  prepare: async (page) => {
    await page.locator('button:has-text("Filters")').first().click().catch(() => {});
    await page.waitForTimeout(900);
    await page
      .locator('[data-testid="filters-modal-panel"] h3:has-text("Amenities")')
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => {});
    await page.waitForTimeout(700);
  },
  pad: 8,
});

console.log('\n— cards —');
await elementShot('card-rail', '/', '[data-testid="card-container"]', { pad: 14, maxWidth: 420 });
await elementShot('card-grid', SEARCH, '[data-testid="card-container"]', { pad: 14, maxWidth: 520 });

console.log('\n— listing detail parts —');
await elementShot('room-gallery', ROOM, '[data-section-id="HERO_DEFAULT"]', { pad: 12 });
await elementShot('room-bookit', ROOM, '[data-section-id="BOOK_IT_SIDEBAR"]', { pad: 16, maxWidth: 500 });
await elementShot('room-bookit-priced', `${ROOM}?check_in=2026-09-21&check_out=2026-09-26`, '[data-section-id="BOOK_IT_SIDEBAR"]', { pad: 16, maxWidth: 500 });
/** "Show all N amenities" / "Show all N reviews" — the count varies per listing. */
const clickByName = (re) => async (page) => {
  const b = page.getByRole('button', { name: re }).first();
  await b.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
  await b.click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);
};

await elementShot('room-amenities-modal', ROOM, '[data-testid="amenities-modal-panel"]', {
  prepare: clickByName(/Show all \d+ amenities/i),
  pad: 8,
});
// The "Show all reviews" button only appears past 6 reviews, so use a
// listing that actually has enough of them.
await elementShot('room-reviews-modal', '/rooms/12260743', '[data-testid="reviews-modal-panel"]', {
  prepare: clickByName(/Show all \d+ reviews/i),
  pad: 8,
});
await elementShot('room-map', ROOM, '[data-section-id="LOCATION_DEFAULT"]', { scrollTo: 4200, pad: 8 });

console.log('\n— checkout —');
await elementShot(
  'checkout-breakdown',
  '/book/stays/1752121318473764362?checkin=2026-09-21&checkout=2026-09-26&adults=2',
  'aside > div',
  { pad: 16, maxWidth: 500 },
);

console.log('\n— mobile (390x844) —');
await pageShot('mobile-home', '/', { viewport: PHONE, mobile: true });
await pageShot('mobile-room', ROOM, { viewport: PHONE, mobile: true });
await pageShot('mobile-search', SEARCH, { viewport: PHONE, mobile: true });

await browser.close();

const written = (await fs.readdir(OUT)).filter((f) => f.endsWith('.webp'));
let total = 0;
for (const f of written) total += (await fs.stat(path.join(OUT, f))).size;
console.log(`\n${written.length} screenshots, ${(total / 1024 / 1024).toFixed(1)}MB total -> ${OUT}`);
