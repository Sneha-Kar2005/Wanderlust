/**
 * Measures rendered text height directly from the captured pixels, so the
 * answer doesn't depend on which DOM node getComputedStyle happened to pick.
 *
 * For each strip it finds dark-ish pixel columns (the labels), groups them
 * into words, and reports each word's ink height in CSS px.
 */
import sharp from 'sharp';

const DIR = '/Users/techsaswata/Downloads/Wanderlust/capture/tabs-compare';

async function inkBoxes(file, { dpr = 2, darkness = 110 } = {}) {
  const img = sharp(file).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  // A pixel counts as "ink" if it is dark AND near-neutral, which picks up
  // black text while ignoring the colourful icon artwork.
  const isInk = (x, y) => {
    const i = (y * width + x) * 4;
    const r = raw[i], g = raw[i + 1], b = raw[i + 2], a = raw[i + 3];
    if (a < 128) return false;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return max < darkness && max - min < 26;
  };

  // Which columns contain ink?
  const cols = new Array(width).fill(false);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (isInk(x, y)) { cols[x] = true; break; }
    }
  }

  // Group contiguous ink columns into words (allow small gaps between letters).
  const GAP = Math.round(6 * dpr);
  const words = [];
  let start = null, lastInk = null;
  for (let x = 0; x < width; x++) {
    if (cols[x]) {
      if (start === null) start = x;
      lastInk = x;
    } else if (start !== null && x - lastInk > GAP) {
      words.push([start, lastInk]);
      start = null;
    }
  }
  if (start !== null) words.push([start, lastInk]);

  return words
    .map(([x0, x1]) => {
      let top = Infinity, bottom = -Infinity;
      for (let x = x0; x <= x1; x++) {
        for (let y = 0; y < height; y++) {
          if (!isInk(x, y)) continue;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
      return {
        widthCss: +((x1 - x0 + 1) / dpr).toFixed(1),
        inkHeightCss: +((bottom - top + 1) / dpr).toFixed(1),
      };
    })
    // Drop slivers (underline bar, stray antialiasing).
    .filter((w) => w.widthCss > 14 && w.inkHeightCss > 4);
}

for (const [label, file] of [
  ['REAL  airbnb.co.in ', `${DIR}/real-raw.png`],
  ['CLONE localhost:3000', `${DIR}/clone-raw.png`],
]) {
  const boxes = await inkBoxes(file);
  console.log(`\n${label}`);
  boxes.forEach((b, i) =>
    console.log(`   word ${i + 1}: ink height ${b.inkHeightCss}px  width ${b.widthCss}px`),
  );
  const tall = boxes.map((b) => b.inkHeightCss).sort((a, b) => b - a);
  console.log(`   -> typical cap+descender ink height: ${tall[Math.floor(tall.length / 2)]}px`);
}
