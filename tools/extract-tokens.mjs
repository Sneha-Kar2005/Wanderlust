import fs from 'node:fs/promises';

const CSS = '/Users/techsaswata/Downloads/Wanderlust/capture/raw/airbnb-client.css';
const OUT = '/Users/techsaswata/Downloads/Wanderlust/capture/tokens';
await fs.mkdir(OUT, { recursive: true });

const css = await fs.readFile(CSS, 'utf8');

// Collect every :root { ... } declaration block
const rootVars = {};
for (const m of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
  for (const decl of m[1].split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (k.startsWith('--') && v) rootVars[k] = v;
  }
}

const FAMILIES = {
  radius: /^--corner-radius/,
  elevation: /^--elevation/,
  brand: /^--brand/,
  palette: /^--palette|^--color/,
  typography: /^--(font|text|type|title|heading|body|caption)/,
  spacing: /^--(spacing|space|gap)/,
  linkAndFocus: /^--(link|focus|outline)/,
};

const grouped = {};
for (const [k, v] of Object.entries(rootVars)) {
  let fam = 'other';
  for (const [name, re] of Object.entries(FAMILIES)) if (re.test(k)) { fam = name; break; }
  (grouped[fam] ??= {})[k] = v;
}

await fs.writeFile(`${OUT}/root-vars-all.json`, JSON.stringify(rootVars, null, 2));
await fs.writeFile(`${OUT}/root-vars-grouped.json`, JSON.stringify(grouped, null, 2));

console.log('total :root vars:', Object.keys(rootVars).length);
for (const [fam, obj] of Object.entries(grouped)) {
  const n = Object.keys(obj).length;
  console.log(`\n== ${fam} (${n}) ==`);
  if (fam !== 'other') for (const [k, v] of Object.entries(obj)) console.log(`  ${k}: ${v}`);
}

// Rausch (Airbnb pink) and other literal brand colours used in the sheet
const colorCounts = {};
for (const m of css.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
  const c = m[0].toLowerCase();
  colorCounts[c] = (colorCounts[c] || 0) + 1;
}
const topColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 40);
await fs.writeFile(`${OUT}/top-colors.json`, JSON.stringify(Object.fromEntries(topColors), null, 2));
console.log('\n== top 40 hex colours (count) ==');
console.log(topColors.map(([c, n]) => `${c}:${n}`).join('  '));
