import { makeContext, dismissOverlays } from './lib-browser.mjs';

const { browser, ctx } = await makeContext();
const page = await ctx.newPage();
await page.goto('https://www.airbnb.co.in/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await dismissOverlays(page);
await page.waitForTimeout(800);

const r = await page.evaluate(() => {
  const out = {};
  out.viewport = innerWidth;

  const h2 = document.querySelector('h2');
  if (h2) {
    const b = h2.getBoundingClientRect();
    const cs = getComputedStyle(h2);
    out.heading = { left: +b.left.toFixed(1), top: +b.top.toFixed(1), font: `${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight}` };
  }

  const cards = [...document.querySelectorAll('[data-testid="card-container"]')].slice(0, 10);
  out.cards = cards.map(c => {
    const b = c.getBoundingClientRect();
    return { left: +b.left.toFixed(1), right: +b.right.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
  });
  if (cards.length > 1) out.gap = +(cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().right).toFixed(1);

  // the scrolling rail container
  const sc = document.querySelector('[data-testid="content-scroller"]');
  if (sc) {
    const b = sc.getBoundingClientRect();
    const cs = getComputedStyle(sc);
    out.scroller = {
      left: +b.left.toFixed(1), width: +b.width.toFixed(1),
      clientWidth: sc.clientWidth, scrollWidth: sc.scrollWidth,
      overflowX: cs.overflowX, display: cs.display, gap: cs.gap,
      gridTemplateColumns: cs.gridTemplateColumns?.slice(0, 200),
      paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight,
    };
  }

  // the image inside a card
  const img = cards[0]?.querySelector('img');
  if (img) {
    const b = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    out.cardImage = { w: +b.width.toFixed(1), h: +b.height.toFixed(1), radius: cs.borderRadius, objectFit: cs.objectFit };
  }

  // outer page container that holds the rails
  let n = document.querySelector('h2');
  const chain = [];
  for (let i = 0; n && i < 8; i++) {
    const b = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    chain.push({ tag: n.tagName, w: +b.width.toFixed(1), left: +b.left.toFixed(1),
                 padL: cs.paddingLeft, padR: cs.paddingRight, maxW: cs.maxWidth });
    n = n.parentElement;
  }
  out.headingAncestors = chain;

  return out;
});

console.log(JSON.stringify(r, null, 2));
await browser.close();
