/** Compare the product-tab strip on the live site with the clone. */
import { makeContext, dismissOverlays } from './lib-browser.mjs';

const probe = () => {
  const out = { tabs: [] };
  const seen = new Set();

  // Any anchor/button whose text is one of the four product labels.
  const LABELS = ['All', 'Homes', 'Experiences', 'Services'];
  for (const el of document.querySelectorAll('a, button')) {
    // Airbnb renders the label twice ("All\nAll" — one is visually hidden),
    // so match on the first line rather than the whole string.
    const lines = (el.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const label = lines[0];
    if (!label || !LABELS.includes(label) || seen.has(label)) continue;
    if (lines.some((l) => !LABELS.includes(l))) continue; // skip unrelated wrappers
    // The label lives in its own text node/span; find the deepest visible one.
    let textNode = el;
    for (const d of el.querySelectorAll('*')) {
      if ((d.innerText || '').trim() !== label || d.querySelector('img')) continue;
      const r = d.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) textNode = d;
    }
    const cs = getComputedStyle(textNode);
    const box = el.getBoundingClientRect();
    const img = el.querySelector('img');
    const ib = img?.getBoundingClientRect();
    seen.add(label);
    out.tabs.push({
      label,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color: cs.color,
      letterSpacing: cs.letterSpacing,
      icon: ib ? `${Math.round(ib.width)}x${Math.round(ib.height)}` : null,
      tab: `${Math.round(box.width)}x${Math.round(box.height)}`,
      gapToIcon: ib ? Math.round(textNode.getBoundingClientRect().left - ib.right) : null,
    });
  }

  // Spacing between adjacent tabs.
  const boxes = out.tabs
    .map((t) =>
      [...document.querySelectorAll('a,button')]
        .find((e) => ((e.innerText || '').split('\n')[0] || '').trim() === t.label)
        ?.getBoundingClientRect(),
    )
    .filter(Boolean);
  out.gaps = boxes.slice(1).map((b, i) => Math.round(b.left - boxes[i].right));
  return out;
};

const { browser, ctx } = await makeContext();

const page = await ctx.newPage();
await page.goto('https://www.airbnb.co.in/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await dismissOverlays(page);
await page.waitForTimeout(600);
console.log('=== LIVE airbnb.co.in ===');
console.log(JSON.stringify(await page.evaluate(probe), null, 1));
await page.close();

const mine = await ctx.newPage();
await mine.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await mine.waitForTimeout(1200);
console.log('\n=== CLONE localhost:3000 ===');
console.log(JSON.stringify(await mine.evaluate(probe), null, 1));

await browser.close();
