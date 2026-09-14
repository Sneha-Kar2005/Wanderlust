import fs from 'node:fs/promises';
import { makeContext, dismissOverlays } from './lib-browser.mjs';

const CAP = '/Users/techsaswata/Downloads/Wanderlust/capture';
const KINDS = [
  { key: 'experiences', idFile: `${CAP}/experience-ids.json`, out: `${CAP}/experiences` },
  { key: 'services', idFile: `${CAP}/service-ids.json`, out: `${CAP}/services` },
];
const CONC = 3;
const { browser, ctx } = await makeContext();

async function scrapeOne(page, kind, id) {
  const dest = `${kind.out}/${id}.json`;
  try { await fs.access(dest); return 'cached'; } catch {}

  const res = await page.goto(`https://www.airbnb.co.in/${kind.key}/${id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!res || res.status() >= 400) return `http${res?.status()}`;
  await page.waitForTimeout(4500);
  await dismissOverlays(page);
  for (let i = 0; i < 9; i++) { await page.evaluate(() => window.scrollBy(0, window.innerHeight)); await page.waitForTimeout(380); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // reviews modal
  let allReviews = [];
  try {
    const b = page.locator('[data-testid="pdp-show-all-reviews-button"]').first();
    if (await b.isVisible({ timeout: 2500 })) {
      await b.click({ timeout: 4000 }); await page.waitForTimeout(2200);
      for (let i = 0; i < 7; i++) { await page.mouse.wheel(0, 2200); await page.waitForTimeout(550); }
      allReviews = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return [];
        const nodes = dlg.querySelectorAll('[data-review-id]');
        return [...nodes].map(r => {
          const L = r.innerText.split('\n').map(s => s.trim()).filter(Boolean);
          return {
            id: r.getAttribute('data-review-id'), author: L[0] || null,
            avatar: (r.querySelector('img')?.src || '').split('?')[0] || null,
            location: L[1] && !/ago|Rating/.test(L[1]) ? L[1] : null,
            when: L.find(x => /ago$|^[A-Z][a-z]+ \d{4}$/.test(x)) || null,
            body: L[L.length - 1] || null,
          };
        });
      });
      await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    }
  } catch {}

  const d = await page.evaluate((kindKey) => {
    const sec = id => document.querySelector(`[data-section-id="${id}"]`);
    const secText = id => sec(id)?.innerText?.trim() || null;
    const lines = t => (t || '').split('\n').map(s => s.trim()).filter(Boolean);

    // Agenda (experiences) / Menu (services): heading + body pairs
    const listFrom = id => {
      const s = sec(id); if (!s) return [];
      const out = [];
      s.querySelectorAll('h2, h3').forEach(h => {
        const title = h.innerText.trim();
        if (!title) return;
        let body = '';
        let n = h.parentElement;
        for (let i = 0; i < 3 && n; i++) {
          const t = n.innerText.replace(title, '').trim();
          if (t && t.length < 600) { body = t.split('\n')[0]; break; }
          n = n.parentElement;
        }
        out.push({ title, body: body || null, img: (h.closest('div')?.querySelector('img')?.src || '').split('?')[0] || null });
      });
      return out;
    };

    const hostSec = sec('MeetYourHost');
    const hL = lines(hostSec?.innerText);

    const bodyL = lines(document.body.innerText);
    const priceIdx = bodyL.findIndex(x => /^From$/.test(x));
    const price = priceIdx >= 0 ? bodyL[priceIdx + 1] : bodyL.find(x => /^[₹$][\d,]+$/.test(x)) || null;
    const unit = bodyL.find(x => /^\/ (guest|group|person|night)$/.test(x)) || null;

    let coords = null;
    const ml = [...document.querySelectorAll('a[href*="google.com/maps"], a[href*="maps.google"]')].map(a => a.href)[0];
    if (ml) { const m = ml.match(/([-\d.]+),([-\d.]+)/); if (m) coords = { lat: +m[1], lng: +m[2] }; }

    const rv = lines(secText('Reviews'));

    return {
      kind: kindKey, url: location.href, pageTitle: document.title,
      title: document.querySelector('h1')?.innerText?.trim() || null,
      tagline: secText('Title') || secText('Sidebar')?.split('\n')[1] || null,
      price, unit,
      rating: rv.find(x => /^[\d.]+$/.test(x)) || null,
      reviewCount: (secText('Reviews') || '').match(/from (\d+) (?:reviews|ratings)/)?.[1] || null,
      agenda: listFrom('Agenda'),
      menu: listFrom('Menu'),
      highlights: (() => {
        const s = lines(secText('Highlights')).slice(1); const o = [];
        for (let i = 0; i < s.length; i += 2) o.push({ title: s[i], body: s[i + 1] || null });
        return o;
      })(),
      host: hostSec ? {
        name: (hL.find(x => /^Hosted by /.test(x)) || hL[1] || '').replace(/^Hosted by /, '') || null,
        avatar: (hostSec.querySelector('img')?.src || '').split('?')[0] || null,
        text: hostSec.innerText.trim().slice(0, 900),
      } : null,
      locationText: secText('Location'), coords,
      thingsToKnow: lines(secText('ThingsToKnow')),
      cancellation: bodyL.find(x => /Free cancellation/i.test(x)) || null,
      photos: [...new Set([...document.images].map(i => (i.currentSrc || i.src).split('?')[0])
        .filter(u => /\/im\/pictures\/(Mt|MtTemplate|hosting|miso|user)/.test(u)))],
    };
  }, kind.key);

  d.id = id;
  d.allReviews = allReviews;
  await fs.writeFile(dest, JSON.stringify(d, null, 2));
  return `ok ${d.photos.length}p ${d.agenda.length}ag ${d.menu.length}mn ${allReviews.length}rv`;
}

for (const kind of KINDS) {
  await fs.mkdir(kind.out, { recursive: true });
  const ids = JSON.parse(await fs.readFile(kind.idFile, 'utf8'));
  const queue = [...ids]; let done = 0;
  console.log(`\n===== ${kind.key}: ${ids.length} ids`);
  await Promise.all(Array.from({ length: CONC }, async () => {
    const page = await ctx.newPage();
    while (queue.length) {
      const id = queue.shift(); let r;
      try { r = await scrapeOne(page, kind, id); } catch (e) { r = 'ERR ' + e.message.slice(0, 60); }
      console.log(`[${kind.key} ${++done}/${ids.length}] ${id} ${r}`);
    }
    await page.close();
  }));
}
await browser.close();
console.log('EXP+SVC DONE');
