import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = '/Users/techsaswata/Downloads/Wanderlust';
const PUB = `${ROOT}/public/images`;
const MANIFEST = `${ROOT}/capture/image-manifest.json`;
const CONC = 6;

/**
 * Photos render at most ~560 CSS px (the PDP hero), so 1000px keeps retina
 * sharpness with roughly half the bytes. Avatars and UI chrome are smaller.
 */
function budgetFor(rel) {
  if (rel.startsWith('avatars/')) return { width: 320, quality: 80 };
  if (rel.startsWith('nav/')) return { width: 160, quality: 85 };
  if (rel.startsWith('ui/')) return { width: 800, quality: 78 };
  return { width: 1000, quality: 78 };
}

const files = [];
async function walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(jpe?g|png)$/i.test(e.name)) files.push(p);
  }
}
await walk(PUB);
console.log(`converting ${files.length} images to webp`);

let done = 0, before = 0, after = 0, failed = 0;
const renames = new Map(); // "/images/a/b.jpg" -> "/images/a/b.webp"

async function convert(abs) {
  const rel = path.relative(PUB, abs);
  const { width, quality } = budgetFor(rel);
  const out = abs.replace(/\.(jpe?g|png)$/i, '.webp');
  try {
    const src = await fs.stat(abs);
    const buf = await sharp(abs)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await fs.writeFile(out, buf);
    await fs.rm(abs);
    before += src.size;
    after += buf.length;
    renames.set(
      '/images/' + rel.split(path.sep).join('/'),
      '/images/' + path.relative(PUB, out).split(path.sep).join('/'),
    );
  } catch (e) {
    failed++;
    console.warn('  failed', rel, e && e.message ? e.message : e);
  }
  if (++done % 250 === 0) {
    console.log(`  ${done}/${files.length}  ${(before / 1e6).toFixed(0)}MB -> ${(after / 1e6).toFixed(0)}MB`);
  }
}

const queue = [...files];
await Promise.all(
  Array.from({ length: CONC }, async () => {
    while (queue.length) await convert(queue.shift());
  }),
);

// Point the manifest at the new .webp paths.
const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
let rewritten = 0;
for (const [url, p] of Object.entries(manifest)) {
  const next = renames.get(p);
  if (next) {
    manifest[url] = next;
    rewritten++;
  }
}
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));

console.log(`\nDONE ${done} converted, ${failed} failed`);
console.log(`size ${(before / 1e6).toFixed(0)}MB -> ${(after / 1e6).toFixed(0)}MB (${(100 - (100 * after) / before).toFixed(0)}% smaller)`);
console.log(`manifest paths rewritten: ${rewritten}`);
