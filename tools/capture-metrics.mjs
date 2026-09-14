import fs from 'node:fs/promises';
import { makeContext, dismissOverlays } from './lib-browser.mjs';

const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/metrics';
await fs.mkdir(OUT, { recursive: true });

const PROPS = [
  'display', 'position', 'width', 'height', 'maxWidth', 'minHeight',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color',
  'backgroundColor', 'backgroundImage',
  'borderRadius', 'borderTopWidth', 'borderBottomWidth', 'borderColor', 'borderStyle',
  'boxShadow', 'gap', 'columnGap', 'rowGap', 'flexDirection', 'alignItems', 'justifyContent',
  'gridTemplateColumns', 'objectFit', 'overflow', 'zIndex', 'opacity', 'textAlign',
];

const TARGETS = {
  home: {
    url: 'https://www.airbnb.co.in/',
    selectors: {
      header: 'header',
      logo: 'header a[aria-label*="Airbnb" i], header [data-testid="header-logo"]',
      searchBarExpanded: '[data-testid="structured-search-input-field-query"]',
      searchButton: '[data-testid="structured-search-input-search-button"]',
      becomeHost: 'header a[href*="host/homes"]',
      railHeading: 'h2',
      cardContainer: '[data-testid="card-container"]',
      cardImage: '[data-testid="listing-image"] img, [data-testid="card-container"] img',
      cardTitle: '[data-testid="listing-card-title"]',
      saveButton: '[data-testid="listing-card-save-button"]',
      footer: 'footer',
    },
  },
  search: {
    url: 'https://www.airbnb.co.in/s/North-Goa/homes?refinement_paths%5B%5D=%2Fhomes',
    selectors: {
      header: 'header',
      littleSearch: '[data-testid="little-search"]',
      littleSearchLocation: '[data-testid="little-search-location"]',
      pageHeading: '[data-testid="stays-page-heading"]',
      card: '[data-testid="card-container"]',
      cardTitle: '[data-testid="listing-card-title"]',
      cardSubtitle: '[data-testid="listing-card-subtitle"]',
      priceRow: '[data-testid="price-availability-row"]',
      filtersButton: 'button:has-text("Filters")',
      map: '[data-testid="map/GoogleMap"]',
    },
  },
  room: {
    url: 'https://www.airbnb.co.in/rooms/1752121318473764362',
    selectors: {
      h1: 'h1',
      gallery: '[data-section-id="HERO_DEFAULT"]',
      galleryImg: '[data-section-id="HERO_DEFAULT"] img',
      overview: '[data-section-id="OVERVIEW_DEFAULT_V2"]',
      overviewH2: '[data-section-id="OVERVIEW_DEFAULT_V2"] h2',
      bookIt: '[data-section-id="BOOK_IT_SIDEBAR"]',
      ctaButton: '[data-testid="homes-pdp-cta-btn"]',
      amenities: '[data-section-id="AMENITIES_DEFAULT"]',
      amenitiesH2: '[data-section-id="AMENITIES_DEFAULT"] h2',
      reviews: '[data-section-id="REVIEWS_DEFAULT"]',
    },
  },
};

const { browser, ctx } = await makeContext();
const result = {};

for (const [key, target] of Object.entries(TARGETS)) {
  const page = await ctx.newPage();
  try {
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6500);
    await dismissOverlays(page);
    await page.waitForTimeout(800);

    result[key] = await page.evaluate(({ selectors, props }) => {
      const out = {};
      for (const [name, sel] of Object.entries(selectors)) {
        let el = null;
        try { el = document.querySelector(sel); } catch { /* :has-text is not valid CSS */ }
        if (!el && /has-text/.test(sel)) {
          const label = sel.match(/has-text\("([^"]+)"\)/)?.[1];
          el = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === label) || null;
        }
        if (!el) { out[name] = null; continue; }
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const styles = {};
        for (const p of props) styles[p] = cs[p];
        out[name] = { rect: { w: +r.width.toFixed(2), h: +r.height.toFixed(2), x: +r.x.toFixed(2), y: +r.y.toFixed(2) }, styles };
      }
      out._viewport = { w: innerWidth, h: innerHeight, scrollW: document.documentElement.scrollWidth };
      return out;
    }, { selectors: target.selectors, props: PROPS });

    console.log(`\n===== ${key} (${target.url})`);
    for (const [name, v] of Object.entries(result[key])) {
      if (name.startsWith('_')) { console.log(`  ${name}:`, JSON.stringify(v)); continue; }
      if (!v) { console.log(`  ${name}: NOT FOUND`); continue; }
      const s = v.styles;
      console.log(`  ${name}: ${v.rect.w}x${v.rect.h} | font ${s.fontSize}/${s.lineHeight} w${s.fontWeight} ${s.color} | pad ${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft} | radius ${s.borderRadius} | bg ${s.backgroundColor}`);
    }
  } catch (e) {
    console.log(`ERROR ${key}: ${e.message.slice(0, 120)}`);
  }
  await page.close();
}

await fs.writeFile(`${OUT}/computed.json`, JSON.stringify(result, null, 2));
await browser.close();
console.log('\nwrote', `${OUT}/computed.json`);
