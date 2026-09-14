import fs from 'node:fs/promises';
import { makeContext, dismissOverlays, autoScroll } from './lib-browser.mjs';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/tabs';
await fs.mkdir(OUT, { recursive: true });

const TARGETS = [
  { key: 'homes', url: 'https://www.airbnb.co.in/homes' },
  { key: 'experiences', url: 'https://www.airbnb.co.in/experiences' },
  { key: 'services', url: 'https://www.airbnb.co.in/services' },
];

const { browser, ctx } = await makeContext();

for (const t of TARGETS) {
  const page = await ctx.newPage();
  try {
    const res = await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log(`\n===== ${t.key} :: ${res?.status()} -> ${page.url()}`);
    await page.waitForTimeout(6000);
    await dismissOverlays(page);
    await autoScroll(page, 12, 700);
    await dismissOverlays(page);

    // expand carousels
    const arrows = await page.locator('button[aria-label*="Next" i]').all();
    for (const a of arrows) {
      for (let i = 0; i < 8; i++) {
        try { if (!(await a.isEnabled({ timeout: 700 }))) break; await a.click({ timeout: 1800 }); await page.waitForTimeout(420); }
        catch { break; }
      }
    }
    await page.waitForTimeout(1200);

    const d = await page.evaluate(() => {
      const T = e => (e?.textContent || '').trim();
      const parseCard = c => {
        const a = c.querySelector('a[href]') || c.closest('a[href]');
        const img = c.querySelector('img');
        const L = c.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        return {
          title: T(c.querySelector('[data-testid="listing-card-title"]')) || L[0] || null,
          subtitle: T(c.querySelector('[data-testid="listing-card-subtitle"]')) || null,
          name: T(c.querySelector('[data-testid="listing-card-name"]')) || null,
          href: a?.getAttribute('href') || null,
          img: (img?.currentSrc || img?.getAttribute('src') || '').split('?')[0] || null,
          alt: img?.getAttribute('alt') || null,
          price: L.find(x => /[₹$]/.test(x)) || null,
          rating: L.find(x => /^\d(\.\d+)?( \(\d+\))?$/.test(x)) || null,
          badge: L.find(x => /Guest favourite|Popular|Superhost|New/i.test(x)) || null,
          lines: L,
        };
      };

      const sections = [];
      for (const h of document.querySelectorAll('h1, h2, h3')) {
        const heading = T(h);
        if (!heading || heading === 'Site Footer') continue;
        let n = h, host = null;
        for (let i = 0; n && i < 8; i++) {
          if (n.querySelectorAll('[data-testid="card-container"]').length) { host = n; break; }
          n = n.parentElement;
        }
        if (!host) continue;
        const cards = [...host.querySelectorAll('[data-testid="card-container"]')].map(parseCard);
        if (cards.length && !sections.some(s => s.heading === heading)) {
          sections.push({ heading, level: h.tagName, seeAllHref: h.closest('a')?.getAttribute('href') || null, cardCount: cards.length, cards });
        }
      }

      // category / filter chips
      const chips = [...document.querySelectorAll('[data-testid="tab-list-wrapper"] button, [role="tablist"] button, nav button')]
        .map(b => ({ text: b.innerText.trim(), img: (b.querySelector('img')?.src || '').split('?')[0] || null }))
        .filter(c => c.text);

      return {
        url: location.href, pageTitle: document.title,
        h1: document.querySelector('h1')?.innerText?.trim() || null,
        headings: [...document.querySelectorAll('h1,h2,h3')].map(h => T(h)).filter(Boolean).slice(0, 40),
        chips, sections,
        testIds: [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')))],
        sectionIds: [...new Set([...document.querySelectorAll('[data-section-id]')].map(e => e.getAttribute('data-section-id')))],
        images: [...new Set([...document.images].map(i => (i.currentSrc || i.src).split('?')[0]))],
        bodyPreview: document.body.innerText.slice(0, 1200),
      };
    });

    await fs.writeFile(`${OUT}/${t.key}.json`, JSON.stringify(d, null, 2));
    await fs.writeFile(`${OUT}/${t.key}.html`, await page.content());
    await page.screenshot({ path: `${OUT}/${t.key}.png`, fullPage: true });

    console.log('  title:', d.pageTitle);
    console.log('  h1:', d.h1);
    console.log('  chips:', d.chips.map(c => c.text).join(' | ').slice(0, 300));
    console.log('  sections:', d.sections.length, 'cards:', d.sections.reduce((a, s) => a + s.cardCount, 0));
    d.sections.forEach(s => console.log(`    - "${s.heading}" (${s.cardCount})`));
    console.log('  sectionIds:', d.sectionIds.join(', ').slice(0, 300));
    console.log('  sample card:', JSON.stringify(d.sections[0]?.cards[0]));
  } catch (e) {
    console.log(`  ERROR ${t.key}: ${e.message.slice(0, 140)}`);
  }
  await page.close();
}
await browser.close();
console.log('\nTABS DONE');
