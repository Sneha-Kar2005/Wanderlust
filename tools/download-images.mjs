import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = '/Users/techsaswata/Downloads/Wanderlust';
const CAP = `${ROOT}/capture`;
const PUB = `${ROOT}/public`;
const MANIFEST = `${CAP}/image-manifest.json`;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const CONC = 8;
const WIDTH = 1200;

async function readJsonDir(dir) {
  const out = [];
  let files;
  try { files = await fs.readdir(dir); } catch { return out; }
  for (const f of files.filter(f => f.endsWith('.json'))) {
    out.push(JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')));
  }
  return out;
}

/**
 * Each URL gets exactly ONE canonical directory. A photo that appears both on
 * a listing page and on the homepage belongs to the listing — otherwise the
 * same bytes land on disk twice and the manifest points at the wrong copy.
 */
const PRIORITY = { listings: 3, experiences: 3, services: 3, avatars: 2, ui: 1 };
const candidates = new Map(); // cleanUrl -> best dir

function add(url, dir) {
  if (!url || !/^https?:\/\//.test(url)) return;
  const clean = url.split('?')[0];
  const rank = PRIORITY[dir.split('/')[0]] ?? 0;
  const prev = candidates.get(clean);
  if (!prev || rank > (PRIORITY[prev.split('/')[0]] ?? 0)) candidates.set(clean, dir);
}

for (const d of await readJsonDir(`${CAP}/rooms`)) {
  (d.photos || []).forEach(u => add(u, `listings/${d.id}`));
  if (d.host?.avatar) add(d.host.avatar, 'avatars');
  (d.allReviews || []).forEach(r => r.avatar && add(r.avatar, 'avatars'));
}
for (const kind of ['experiences', 'services']) {
  for (const d of await readJsonDir(`${CAP}/${kind}`)) {
    (d.photos || []).forEach(u => add(u, `${kind}/${d.id}`));
    if (d.host?.avatar) add(d.host.avatar, 'avatars');
    (d.allReviews || []).forEach(r => r.avatar && add(r.avatar, 'avatars'));
    (d.agenda || []).forEach(a => a.img && add(a.img, `${kind}/${d.id}`));
    (d.menu || []).forEach(a => a.img && add(a.img, `${kind}/${d.id}`));
  }
}
for (const key of ['homes', 'experiences', 'services']) {
  try {
    const d = JSON.parse(await fs.readFile(`${CAP}/tabs/${key}.json`, 'utf8'));
    (d.images || []).forEach(u => add(u, 'ui'));
    (d.chips || []).forEach(c => c.img && add(c.img, 'ui'));
  } catch {}
}
try {
  const d = JSON.parse(await fs.readFile(`${CAP}/home/home-data.json`, 'utf8'));
  (d.allImages || []).forEach(u => add(u, 'ui'));
} catch {}

const jobs = [...candidates.entries()].map(([url, dir]) => {
  const ext0 = (url.match(/\.(jpe?g|png|webp|avif|gif|svg)$/i)?.[1] || 'jpg').toLowerCase();
  const ext = ext0 === 'jpeg' ? 'jpg' : ext0;
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12);
  return { url, dir, localPath: `/images/${dir}/${hash}.${ext}` };
});
console.log(`queued ${jobs.length} unique images`);

let ok = 0, skip = 0, fail = 0;
const failures = [];

async function download(job) {
  const dest = path.join(PUB, job.localPath);
  try { const st = await fs.stat(dest); if (st.size > 0) { skip++; return; } } catch {}
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const src = /\/im\/pictures\//.test(job.url) ? `${job.url}?im_w=${WIDTH}` : job.url;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(src, { headers: { 'User-Agent': UA, Referer: 'https://www.airbnb.co.in/' }, signal: AbortSignal.timeout(45000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) throw new Error('too small');
      await fs.writeFile(dest, buf);
      ok++; return;
    } catch (e) {
      if (attempt === 2) { fail++; failures.push(`${job.url} :: ${e.message}`); }
      else await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: CONC }, async () => {
  while (queue.length) {
    await download(queue.shift());
    const done = ok + skip + fail;
    if (done % 200 === 0) console.log(`  ${done}/${jobs.length} ok=${ok} skip=${skip} fail=${fail}`);
  }
}));

await fs.writeFile(MANIFEST, JSON.stringify(
  Object.fromEntries(jobs.map(j => [j.url, j.localPath])), null, 2));

// ---- prune anything on disk the manifest no longer references ----
const keep = new Set(jobs.map(j => path.join(PUB, j.localPath)));
let pruned = 0, prunedBytes = 0;
async function walk(dir) {
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (!keep.has(p)) {
      prunedBytes += (await fs.stat(p)).size;
      await fs.rm(p);
      pruned++;
    }
  }
}
await walk(`${PUB}/images`);
// drop now-empty directories
async function prunedirs(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) await prunedirs(path.join(dir, e.name));
  }
  const left = await fs.readdir(dir);
  if (!left.length && dir !== `${PUB}/images`) await fs.rmdir(dir);
}
await prunedirs(`${PUB}/images`);

console.log(`\nDONE ok=${ok} skipped=${skip} failed=${fail}`);
console.log(`pruned ${pruned} duplicate/orphan files (${(prunedBytes / 1e6).toFixed(0)} MB)`);
if (failures.length) console.log('failures:\n  ' + failures.slice(0, 12).join('\n  '));
