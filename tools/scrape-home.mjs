import fs from 'node:fs/promises';
import { makeContext, dismissOverlays, autoScroll } from './lib-browser.mjs';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/home';
await fs.mkdir(OUT, { recursive: true });
const { browser, ctx } = await makeContext();
const page = await ctx.newPage();
await page.goto('https://www.airbnb.co.in/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);
await dismissOverlays(page);
await autoScroll(page, 10, 700);
await dismissOverlays(page);

// Expand every carousel by clicking its "next" arrow until exhausted
const arrows = await page.locator('button[aria-label="Next"], button[aria-label*="Next"]').all();
console.log('carousel arrows found:', arrows.length);
for (const arrow of arrows) {
  for (let i = 0; i < 8; i++) {
    try {
      if (!(await arrow.isEnabled({ timeout: 800 }))) break;
      await arrow.click({ timeout: 2000 });
      await page.waitForTimeout(450);
    } catch { break; }
  }
}
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const T = el => (el?.textContent || '').trim();

  const parseCard = c => {
    const link = c.querySelector('a[href]') || c.closest('a[href]');
    const img = c.querySelector('img');
    const title = T(c.querySelector('[data-testid="listing-card-title"]'));
    const text = c.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const priceLine = text.find(t => /₹|\$/.test(t)) || null;
    const ratingLine = text.find(t => /^\d(\.\d+)?$/.test(t)) || null;
    return {
      title: title || text[0] || null,
      href: link?.getAttribute('href') || null,
      img: img?.currentSrc || img?.getAttribute('src') || null,
      srcset: img?.getAttribute('srcset') || null,
      alt: img?.getAttribute('alt') || null,
      priceLine, rating: ratingLine ? parseFloat(ratingLine) : null,
      badge: text.find(t => /Guest favourite|Guest favorite|Superhost/i.test(t)) || null,
      lines: text,
    };
  };

  // map each h2 to the cards in its rail
  const sections = [];
  for (const h of document.querySelectorAll('h2')) {
    const heading = T(h);
    if (!heading || heading === 'Site Footer') continue;
    let n = h, host = null;
    for (let i = 0; n && i < 8; i++) {
      if (n.querySelectorAll('[data-testid="card-container"]').length > 0) { host = n; break; }
      n = n.parentElement;
    }
    if (!host) continue;
    const cards = [...host.querySelectorAll('[data-testid="card-container"]')].map(parseCard);
    sections.push({ heading, seeAllHref: h.closest('a')?.getAttribute('href') || h.parentElement?.querySelector('a')?.getAttribute('href') || null, cardCount: cards.length, cards });
  }

  // top nav tabs (All / Homes / Experiences / Services)
  const tabs = [...document.querySelectorAll('[data-testid="tab-list-wrapper"] a, [data-testid="tab-list-wrapper"] button')]
    .map(e => ({ text: e.innerText.trim(), href: e.getAttribute('href'), img: e.querySelector('img')?.src || null })).filter(t => t.text);

  // footer
  const f = document.querySelector('footer');
  const footerCols = f ? [...f.querySelectorAll('ul')].map(ul => ({
    heading: T(ul.closest('div')?.querySelector('h3, h4, div[id]')),
    items: [...ul.querySelectorAll('li')].map(li => ({ text: T(li), href: li.querySelector('a')?.getAttribute('href') })),
  })).filter(c => c.items.length) : [];

  const searchBar = document.querySelector('[data-testid="structured-search-input-field-query"]')?.closest('form, div[role="search"], header')?.outerHTML?.slice(0, 6000) || null;

  return { sections, tabs, footerCols, searchBarHtml: searchBar,
           allImages: [...new Set([...document.images].map(i => i.currentSrc || i.src))] };
});

await fs.writeFile(`${OUT}/home-data.json`, JSON.stringify(data, null, 2));
console.log('SECTIONS:');
data.sections.forEach(s => console.log(`  "${s.heading}" -> ${s.cardCount} cards | seeAll=${s.seeAllHref}`));
console.log('total cards:', data.sections.reduce((a, s) => a + s.cardCount, 0));
console.log('tabs:', JSON.stringify(data.tabs));
console.log('footer cols:', data.footerCols.length, data.footerCols.map(c => c.items.length).join('/'));
console.log('images:', data.allImages.length);
console.log('SAMPLE CARD:', JSON.stringify(data.sections[0]?.cards[0], null, 2));
await browser.close();
