import { makeContext, dismissOverlays } from './lib-browser.mjs';

const { browser, ctx } = await makeContext();
const page = await ctx.newPage();
await page.goto('https://www.airbnb.co.in/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await dismissOverlays(page);
await page.waitForTimeout(600);

const r = await page.evaluate(() => {
  const card = document.querySelector('[data-testid="card-container"]');
  if (!card) return { error: 'no card' };

  const describe = (el, name) => {
    if (!el) return { name, missing: true };
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      name,
      text: (el.innerText || '').replace(/\n/g, ' | ').slice(0, 90),
      x: +(b.left - card.getBoundingClientRect().left).toFixed(1),
      y: +(b.top - card.getBoundingClientRect().top).toFixed(1),
      w: +b.width.toFixed(1),
      h: +b.height.toFixed(1),
      font: `${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight}`,
      color: cs.color,
      display: cs.display,
      marginTop: cs.marginTop,
      paddingTop: cs.paddingTop,
    };
  };

  const rows = [];
  rows.push(describe(card, 'card'));
  rows.push(describe(card.querySelector('[data-testid="listing-image"]'), 'image-wrap'));
  rows.push(describe(card.querySelector('img'), 'img'));
  rows.push(describe(card.querySelector('[data-testid="listing-card-title"]'), 'title'));
  rows.push(describe(card.querySelector('[data-testid="listing-card-save-button"]'), 'save'));

  // every direct text-bearing descendant below the image, in order
  const below = [];
  card.querySelectorAll('div,span,p').forEach(el => {
    const b = el.getBoundingClientRect();
    const cardTop = card.getBoundingClientRect().top;
    if (b.top - cardTop > 170 && el.innerText && el.children.length <= 2) {
      const cs = getComputedStyle(el);
      below.push({
        text: el.innerText.replace(/\n/g, ' | ').slice(0, 70),
        y: +(b.top - cardTop).toFixed(1),
        h: +b.height.toFixed(1),
        font: `${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight}`,
        color: cs.color,
        display: cs.display,
      });
    }
  });

  return { rows, below: below.slice(0, 14), cardHTML: card.innerHTML.slice(0, 1800) };
});

console.log('=== card parts ===');
(r.rows || []).forEach(x => console.log(JSON.stringify(x)));
console.log('\n=== text nodes below image ===');
(r.below || []).forEach(x => console.log(JSON.stringify(x)));
console.log('\n=== card HTML ===\n', (r.cardHTML || '').replace(/class="[^"]*"/g, 'class="…"'));
await browser.close();
