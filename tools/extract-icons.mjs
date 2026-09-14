import fs from 'node:fs/promises';
import path from 'node:path';

const CAP = '/Users/techsaswata/Downloads/Wanderlust/capture';
const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/icons';
await fs.mkdir(OUT, { recursive: true });

const htmlFiles = [];
async function walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
}
await walk(CAP);
console.log('html files:', htmlFiles.map(f => path.relative(CAP, f)).join(', '));

const svgs = new Map(); // normalised markup -> {markup, count, viewBox}

for (const f of htmlFiles) {
  const html = await fs.readFile(f, 'utf8');
  for (const m of html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)) {
    let s = m[0];
    // strip volatile attributes so identical icons dedupe
    s = s.replace(/\s(class|style|id|aria-labelledby|data-[\w-]+)="[^"]*"/g, '');
    // only keep plausible icons (small, path-based, no <image>/<foreignObject>)
    if (/<image|<foreignObject/.test(s)) continue;
    if (s.length > 12000) continue;
    const vb = s.match(/viewBox="([^"]*)"/)?.[1] || null;
    const prev = svgs.get(s);
    if (prev) prev.count++;
    else svgs.set(s, { markup: s, count: 1, viewBox: vb });
  }
}

const list = [...svgs.values()].sort((a, b) => b.count - a.count);
console.log('unique svgs:', list.length);

// Write each as a file plus an index
const index = [];
for (let i = 0; i < list.length; i++) {
  const { markup, count, viewBox } = list[i];
  const name = `icon-${String(i).padStart(3, '0')}`;
  await fs.writeFile(path.join(OUT, `${name}.svg`), markup);
  index.push({ name, count, viewBox, length: markup.length, preview: markup.slice(0, 160) });
}
await fs.writeFile(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));

console.log('\ntop 30 by usage:');
index.slice(0, 30).forEach(x => console.log(`  ${x.name}  x${x.count}  vb=${x.viewBox}  len=${x.length}`));
console.log(`\nwrote ${index.length} svgs to ${OUT}`);
