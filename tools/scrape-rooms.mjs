import fs from 'node:fs/promises';
import { makeContext, dismissOverlays } from './lib-browser.mjs';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/rooms';
await fs.mkdir(OUT, { recursive: true });
const ids = JSON.parse(await fs.readFile('/Users/techsaswata/Downloads/Wanderlust/capture/listing-ids.json', 'utf8'));
const CONC = 3;
const { browser, ctx } = await makeContext();

async function scrapeOne(page, id) {
  const dest = `${OUT}/${id}.json`;
  try { await fs.access(dest); return 'cached'; } catch {}

  const res = await page.goto(`https://www.airbnb.co.in/rooms/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!res || res.status() >= 400) return `http${res?.status()}`;
  await page.waitForTimeout(4500);
  await dismissOverlays(page);
  for (let i = 0; i < 9; i++) { await page.evaluate(() => window.scrollBy(0, window.innerHeight)); await page.waitForTimeout(380); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  // ---- full photo gallery ----
  let galleryPhotos = [];
  try {
    const b = page.getByRole('button', { name: /Show all photos/i }).first();
    if (await b.isVisible({ timeout: 2500 })) {
      await b.click({ timeout: 4000 }); await page.waitForTimeout(2200);
      for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 2500); await page.waitForTimeout(500); }
      galleryPhotos = await page.evaluate(() => [...new Set([...document.querySelectorAll('[role="dialog"] img')]
        .map(i => (i.currentSrc || i.src).split('?')[0]).filter(u => /\/im\/pictures\//.test(u)))]);
      await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
    }
  } catch {}

  // ---- all amenities modal ----
  let allAmenities = [];
  try {
    const b = page.getByRole('button', { name: /Show all \d+ amenities/i }).first();
    if (await b.isVisible({ timeout: 2500 })) {
      await b.click({ timeout: 4000 }); await page.waitForTimeout(2000);
      allAmenities = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return [];
        const lines = dlg.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        const headings = new Set([...dlg.querySelectorAll('h2,h3')].map(h => h.innerText.trim()));
        const groups = []; let cur = null;
        for (const l of lines) {
          if (/^What this place offers$/i.test(l)) continue;
          if (headings.has(l)) { cur = { group: l, items: [] }; groups.push(cur); continue; }
          if (!cur) { cur = { group: 'General', items: [] }; groups.push(cur); }
          cur.items.push(l);
        }
        return groups.map(g => ({ group: g.group, items: [...new Set(g.items)] })).filter(g => g.items.length);
      });
      await page.keyboard.press('Escape'); await page.waitForTimeout(900);
    }
  } catch {}

  // ---- all reviews modal ----
  let allReviews = [];
  try {
    const b = page.getByRole('button', { name: /Show all \d+ reviews/i }).first();
    if (await b.isVisible({ timeout: 2500 })) {
      await b.click({ timeout: 4000 }); await page.waitForTimeout(2200);
      for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 2200); await page.waitForTimeout(600); }
      allReviews = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return [];
        return [...dlg.querySelectorAll('[data-review-id]')].map(r => {
          const L = r.innerText.split('\n').map(s => s.trim()).filter(Boolean);
          const dateIdx = L.findIndex(x => /^[A-Z][a-z]+ \d{4}$/.test(x));
          return {
            id: r.getAttribute('data-review-id'),
            author: L[0] || null,
            avatar: (r.querySelector('img')?.src || '').split('?')[0] || null,
            tenure: L.find(x => /on Airbnb|Lives in/i.test(x)) || null,
            stars: (L.find(x => /^Rating, \d/.test(x)) || '').match(/\d+/)?.[0] || null,
            date: dateIdx >= 0 ? L[dateIdx] : null,
            body: dateIdx >= 0 ? L.slice(dateIdx + 1).join(' ') : L[L.length - 1],
          };
        });
      });
      await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    }
  } catch {}

  const d = await page.evaluate(() => {
    const sec = id => document.querySelector(`[data-section-id="${id}"]`);
    const secText = id => sec(id)?.innerText?.trim() || null;
    const lines = t => (t || '').split('\n').map(s => s.trim()).filter(Boolean);

    const amenRaw = lines(secText('AMENITIES_DEFAULT')).slice(1);
    const unavailable = []; const available = [];
    for (let i = 0; i < amenRaw.length; i++) {
      const l = amenRaw[i];
      if (/^Show all \d+ amenities$/i.test(l)) continue;
      if (/^Unavailable: /.test(l)) { const n = l.replace(/^Unavailable: /, ''); unavailable.push(n); if (amenRaw[i + 1] === n) i++; continue; }
      available.push(l);
    }

    const hlRaw = lines(secText('HIGHLIGHTS_DEFAULT')).slice(1);
    const highlights = [];
    for (let i = 0; i < hlRaw.length; i += 2) highlights.push({ title: hlRaw[i], body: hlRaw[i + 1] || null });

    const oL = lines(secText('OVERVIEW_DEFAULT_V2'));

    const hostSec = sec('MEET_YOUR_HOST');
    const hL = lines(hostSec?.innerText);
    const host = hostSec ? {
      name: hL[1] || null,
      avatar: (hostSec.querySelector('img')?.src || '').split('?')[0] || null,
      superhost: hL.includes('Superhost'),
      reviews: hL.find(x => /^\d+ reviews$/.test(x))?.match(/\d+/)?.[0] || null,
      rating: hL.find(x => /out of 5 average rating/.test(x))?.match(/[\d.]+/)?.[0] || null,
      yearsHosting: hL.find(x => /years? of hosting/.test(x))?.match(/\d+/)?.[0] || null,
      speaks: hL.find(x => /^Speaks /.test(x)) || null,
      livesIn: hL.find(x => /^Lives in /.test(x)) || null,
      bio: hL.find(x => x.length > 80 && !/Superhost/.test(x)) || null,
    } : null;

    const rb = lines(secText('REVIEWS_DEFAULT'));
    const catRating = {};
    ['Cleanliness', 'Accuracy', 'Check-in', 'Communication', 'Location', 'Value'].forEach(c => {
      const i = rb.indexOf(c); if (i >= 0 && /^[\d.]+$/.test(rb[i + 1] || '')) catRating[c] = parseFloat(rb[i + 1]);
    });

    let coords = null;
    const ml = [...document.querySelectorAll('a[href*="google.com/maps"], a[href*="maps.google"]')].map(a => a.href)[0];
    if (ml) { const m = ml.match(/([-\d.]+),([-\d.]+)/); if (m) coords = { lat: +m[1], lng: +m[2] }; }

    const pol = lines(secText('POLICIES_DEFAULT'));
    const pick = pre => pol.find(x => x.startsWith(pre)) || null;

    let sleeping = [];
    if (sec('SLEEPING_ARRANGEMENT_WITH_IMAGES')) {
      const s = lines(secText('SLEEPING_ARRANGEMENT_WITH_IMAGES')).slice(1).filter(x => !/^\d+ (of|\/) \d+/.test(x));
      for (let i = 0; i < s.length; i += 2) sleeping.push({ name: s[i], beds: s[i + 1] || null });
    }

    return {
      url: location.href,
      title: document.querySelector('h1')?.innerText?.trim() || null,
      pageTitle: document.title,
      subtitle: oL[0] || null,
      capacity: oL.find(l => /guest/.test(l)) || null,
      guestFavourite: /Guest favourite/i.test(document.body.innerText),
      description: lines(secText('DESCRIPTION_DEFAULT')).slice(1).join('\n'),
      highlights, sleeping,
      amenities: available, amenitiesUnavailable: unavailable,
      host,
      rating: rb.find(x => /^[\d.]+$/.test(x)) || null,
      reviewCount: (secText('REVIEWS_DEFAULT') || '').match(/from (\d+) reviews/)?.[1] || null,
      categoryRatings: catRating,
      locationText: secText('LOCATION_DEFAULT'), coords,
      houseRules: { checkIn: pick('Check-in:'), checkout: pick('Checkout'), maxGuests: pol.find(x => /guests maximum/.test(x)) || null },
      policiesRaw: pol,
      priceText: document.querySelector('[data-section-id="BOOK_IT_SIDEBAR"]')?.innerText?.trim() || null,
      photos: [...new Set([...document.images].map(i => (i.currentSrc || i.src).split('?')[0])
        .filter(u => /\/im\/pictures\/(hosting|miso|prohost-api)/.test(u)))],
    };
  });

  d.id = id;
  d.photos = [...new Set([...d.photos, ...galleryPhotos.filter(u => /hosting|miso|prohost/.test(u))])];
  d.allAmenities = allAmenities;
  d.allReviews = allReviews;
  await fs.writeFile(dest, JSON.stringify(d, null, 2));
  return `ok ${d.photos.length}p ${d.amenities.length}am ${allAmenities.length}grp ${allReviews.length}rv ${d.highlights.length}hl`;
}

const queue = [...ids]; let done = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  const page = await ctx.newPage();
  while (queue.length) {
    const id = queue.shift(); let r;
    try { r = await scrapeOne(page, id); } catch (e) { r = 'ERR ' + e.message.slice(0, 60); }
    console.log(`[${++done}/${ids.length}] ${id} ${r}`);
  }
  await page.close();
}));
await browser.close();
console.log('ROOMS DONE');
