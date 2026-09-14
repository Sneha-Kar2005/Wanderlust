import fs from 'node:fs/promises';
import path from 'node:path';

const CAP = '/Users/techsaswata/Downloads/Wanderlust/capture';
const DATA = '/Users/techsaswata/Downloads/Wanderlust/src/data';
await fs.mkdir(DATA, { recursive: true });

const manifest = JSON.parse(await fs.readFile(`${CAP}/image-manifest.json`, 'utf8'));

// Only reference images that actually landed on disk — a few upstream URLs 404.
const PUBLIC = '/Users/techsaswata/Downloads/Wanderlust/public';
const onDisk = new Set();
for (const p of Object.values(manifest)) {
  try { await fs.access(path.join(PUBLIC, p)); onDisk.add(p); } catch {}
}
const localOf = (url) => {
  if (!url) return null;
  const p = manifest[url.split('?')[0]];
  return p && onDisk.has(p) ? p : null;
};

async function readDir(dir) {
  const out = [];
  let files = [];
  try { files = await fs.readdir(dir); } catch { return out; }
  for (const f of files.filter(f => f.endsWith('.json'))) {
    out.push(JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')));
  }
  return out;
}

/* Inverse of quote() in src/lib/domain/pricing.ts — keep the constants in sync. */
const SERVICE_FEE_RATE = 0.142;
const GST_RATE = 0.18;
const CLEANING_FEE_RATE = 0.08;
const discountRate = (n) => (n >= 28 ? 0.18 : n >= 7 ? 0.08 : 0);

function basePerNightFromTotal(total, nights) {
  const d = discountRate(nights);
  const factor =
    (1 + GST_RATE) *
    (nights * (1 - d) * (1 + SERVICE_FEE_RATE) + CLEANING_FEE_RATE * Math.min(nights, 3));
  return Math.round(total / factor);
}

const num = (s) => { const m = String(s ?? '').match(/[\d.]+/); return m ? Number(m[0]) : null; };
const int = (s) => { const n = num(s); return n === null ? null : Math.round(n); };
const slug = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ------------------------------------------------------------------ */
/* Card index: card-level facts (price, cardTitle, badge) by listing id */
/* ------------------------------------------------------------------ */
const cardIndex = new Map();
function indexCards(sections) {
  for (const s of sections || []) {
    for (const c of s.cards || []) {
      const id = (c.href || '').match(/pinned_listings(?:%5B%5D|\[\])=(\d+)/)?.[1]
        || (c.href || '').match(/\/rooms\/(\d+)/)?.[1]
        || (c.img || '').match(/Hosting-(\d+)/)?.[1];
      if (!id) continue;
      const priceStr = (c.lines || []).find(l => /^[₹$][\d,]+$/.test(l));
      const nightsStr = (c.lines || []).find(l => /^for \d+ nights?$/.test(l));
      const price = priceStr ? Number(priceStr.replace(/[^\d]/g, '')) : null;
      const nights = nightsStr ? int(nightsStr) : null;
      const prev = cardIndex.get(id) || {};
      cardIndex.set(id, {
        cardTitle: c.title || prev.cardTitle || null,
        total: price ?? prev.total ?? null,
        nights: nights ?? prev.nights ?? null,
        rating: c.rating ?? prev.rating ?? null,
        badge: c.badge ?? prev.badge ?? null,
        image: c.img || prev.image || null,
      });
    }
  }
}

const homeData = JSON.parse(await fs.readFile(`${CAP}/home/home-data.json`, 'utf8'));
indexCards(homeData.sections);
for (const key of ['homes', 'experiences', 'services']) {
  try { indexCards(JSON.parse(await fs.readFile(`${CAP}/tabs/${key}.json`, 'utf8')).sections); } catch {}
}

/* ------------------------------------------------------------------ */
/* Hosts + reviews (shared collections)                                */
/* ------------------------------------------------------------------ */
const hosts = new Map();
const reviews = [];

function upsertHost(raw, fallbackId) {
  if (!raw?.name) return null;
  const id = 'h-' + slug(raw.name) + '-' + String(fallbackId).slice(-5);
  if (!hosts.has(id)) {
    hosts.set(id, {
      id,
      name: raw.name,
      avatar: localOf(raw.avatar),
      superhost: !!raw.superhost,
      reviewCount: int(raw.reviews) ?? 0,
      rating: raw.rating ? Number(raw.rating) : null,
      yearsHosting: int(raw.yearsHosting),
      speaks: raw.speaks ? raw.speaks.replace(/^Speaks /, '').split(/,| and /).map(s => s.trim()).filter(Boolean) : [],
      livesIn: raw.livesIn ? raw.livesIn.replace(/^Lives in /, '') : null,
      bio: raw.bio || null,
    });
  }
  return id;
}

const MONTHS = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
function reviewDateISO(date, i) {
  if (!date) return `2026-0${(i % 9) + 1}-15`;
  const m = date.match(/^([A-Z][a-z]+) (\d{4})$/);
  if (m && MONTHS[m[1]] !== undefined) return `${m[2]}-${String(MONTHS[m[1]] + 1).padStart(2, '0')}-15`;
  const w = date.match(/^(\d+) (day|week|month|year)s? ago$/);
  if (w) {
    const mult = { day: 1, week: 7, month: 30, year: 365 }[w[2]];
    const d = new Date(Date.UTC(2026, 8, 14) - Number(w[1]) * mult * 86400000);
    return d.toISOString().slice(0, 10);
  }
  return '2026-08-15';
}

function addReviews(listingId, raw) {
  const ids = [];
  (raw || []).forEach((r, i) => {
    if (!r.author || !r.body) return;
    const id = `r-${listingId}-${i}`;
    const date = r.date || r.when || null;
    reviews.push({
      id, listingId,
      author: r.author,
      avatar: localOf(r.avatar),
      tenure: r.tenure || null,
      location: r.location || null,
      stars: r.stars ? Number(r.stars) : 5,
      date: date || 'August 2026',
      createdAt: reviewDateISO(date, i),
      body: r.body,
    });
    ids.push(id);
  });
  return ids;
}

/* ------------------------------------------------------------------ */
/* Listings (homes)                                                    */
/* ------------------------------------------------------------------ */
const listings = [];
for (const r of await readDir(`${CAP}/rooms`)) {
  const card = cardIndex.get(r.id) || {};

  // "Entire villa in Baga, India" -> type "Entire villa", city "Baga", country "India"
  const sub = r.subtitle || '';
  const sm = sub.match(/^(.*?) in (.+?)(?:, (.+))?$/);
  const propertyType = sm?.[1]?.trim() || 'Entire home';
  const city = sm?.[2]?.trim() || 'Goa';
  const country = sm?.[3]?.trim() || 'India';

  const cap = r.capacity || '';
  const guests = int(cap.match(/(\d+) guests?/)?.[1]) ?? 2;
  const bedrooms = int(cap.match(/(\d+) bedrooms?/)?.[1]) ?? (/studio/i.test(cap) ? 0 : 1);
  const beds = int(cap.match(/(\d+) beds?/)?.[1]) ?? 1;
  const bathrooms = num(cap.match(/([\d.]+) bathrooms?/)?.[1]) ?? 1;

  // Airbnb India quotes an all-inclusive total ("Prices include all fees").
  // Invert the fee model in lib/domain/pricing.ts so that re-quoting the
  // stay reproduces the price the real site displayed.
  const cardNights = card.nights ?? 2;
  const pricePerNight = card.total
    ? basePerNightFromTotal(card.total, cardNights)
    : 7500;

  const hostId = upsertHost(r.host, r.id);
  const reviewIds = addReviews(r.id, r.allReviews);

  listings.push({
    id: r.id,
    kind: 'home',
    title: r.title || card.cardTitle || 'Home',
    subtitle: sub,
    cardTitle: card.cardTitle || `${propertyType.replace(/^Entire /, '')} in ${city}`,
    propertyType, city, region: null, country,
    guests, bedrooms, beds, bathrooms,
    pricePerNight,
    originalPricePerNight: null,
    // The exact all-in total the live site showed on this card, so rails
    // render byte-identical prices.
    cardTotal: card.total ?? null,
    cardNights,
    rating: r.rating ? Number(r.rating) : (card.rating ?? null),
    reviewCount: int(r.reviewCount) ?? reviewIds.length,
    categoryRatings: r.categoryRatings || {},
    guestFavourite: !!r.guestFavourite,
    description: r.description || '',
    highlights: (r.highlights || []).filter(h => h.title).map(h => ({ title: h.title, body: h.body, icon: null })),
    sleeping: (r.sleeping || []).filter(s => s.name && s.beds),
    amenities: r.amenities || [],
    amenitiesUnavailable: r.amenitiesUnavailable || [],
    amenityGroups: (r.allAmenities || []).filter(g => g.group && g.items?.length),
    hostId,
    coordinates: r.coords || null,
    locationBlurb: (r.locationText || '').split('\n').slice(1).join(' ').slice(0, 400) || null,
    houseRules: {
      checkIn: r.houseRules?.checkIn?.replace(/^Check-in: /, '') || null,
      checkout: r.houseRules?.checkout?.replace(/^Checkout /, '') || null,
      maxGuests: int(r.houseRules?.maxGuests) ?? guests,
    },
    policiesRaw: (r.policiesRaw || []).filter(x => x !== 'Things to know'),
    // A handful of rooms render their gallery lazily and yielded no photos;
    // fall back to the card image harvested from the rail.
    photos: (() => {
      const p = (r.photos || []).map(localOf).filter(Boolean);
      if (p.length) return p;
      const fallback = localOf(card.image);
      return fallback ? [fallback] : [];
    })(),
    reviewIds,
  });
}

/* ------------------------------------------------------------------ */
/* Experiences + services                                              */
/* ------------------------------------------------------------------ */
function priceUnitOf(unit) {
  if (!unit) return 'guest';
  if (/group/.test(unit)) return 'group';
  if (/person/.test(unit)) return 'person';
  return 'guest';
}

const experiences = [];
for (const r of await readDir(`${CAP}/experiences`)) {
  const hostId = upsertHost(r.host?.name ? { name: r.host.name, avatar: r.host.avatar, bio: r.host.text } : null, r.id);
  const reviewIds = addReviews(r.id, r.allReviews);
  const cityLine = (r.locationText || '').split('\n')[1] || 'Bengaluru';
  experiences.push({
    id: r.id, kind: 'experience',
    title: r.title || 'Experience',
    tagline: r.tagline || null,
    city: cityLine.split(',')[0].trim(), country: 'India',
    price: r.price ? Number(String(r.price).replace(/[^\d]/g, '')) : 1500,
    priceUnit: priceUnitOf(r.unit),
    rating: r.rating ? Number(r.rating) : null,
    reviewCount: int(r.reviewCount) ?? reviewIds.length,
    agenda: (r.agenda || []).filter(a => a.title).map(a => ({ title: a.title, body: a.body, image: localOf(a.img) })),
    highlights: (r.highlights || []).filter(h => h.title).map(h => ({ title: h.title, body: h.body, icon: null })),
    hostId,
    coordinates: r.coords || null,
    locationBlurb: (r.locationText || '').split('\n').slice(1).join(' ').slice(0, 300) || null,
    thingsToKnow: r.thingsToKnow || [],
    cancellation: r.cancellation || null,
    startTimes: [],
    photos: (r.photos || []).map(localOf).filter(Boolean),
    reviewIds,
  });
}

const services = [];
for (const r of await readDir(`${CAP}/services`)) {
  const hostId = upsertHost(r.host?.name ? { name: r.host.name, avatar: r.host.avatar, bio: r.host.text } : null, r.id);
  const reviewIds = addReviews(r.id, r.allReviews);
  const cityLine = (r.locationText || '').split('\n')[1] || 'Bengaluru';
  services.push({
    id: r.id, kind: 'service',
    title: r.title || 'Service',
    tagline: r.tagline || null,
    professionLine: null,
    category: (r.menu?.[0]?.title || 'Photography').split(' ')[0],
    city: cityLine.split(',')[0].trim(), country: 'India',
    price: r.price ? Number(String(r.price).replace(/[^\d]/g, '')) : 5000,
    priceUnit: priceUnitOf(r.unit),
    rating: r.rating ? Number(r.rating) : null,
    reviewCount: int(r.reviewCount) ?? reviewIds.length,
    menu: (r.menu || []).filter(a => a.title).map(a => ({ title: a.title, body: a.body, image: localOf(a.img) })),
    hostId,
    coordinates: r.coords || null,
    locationBlurb: (r.locationText || '').split('\n').slice(1).join(' ').slice(0, 300) || null,
    thingsToKnow: r.thingsToKnow || [],
    cancellation: r.cancellation || null,
    photos: (r.photos || []).map(localOf).filter(Boolean),
    reviewIds,
  });
}

/* ------------------------------------------------------------------ */
/* Rails                                                               */
/* ------------------------------------------------------------------ */
const FOOTER_HEADINGS = new Set(['Support', 'Hosting', 'Airbnb', 'Airbnb homepage', 'Site Footer', 'Inspiration for future getaways']);
function buildRails(sections, kindIds) {
  const rails = [];
  for (const s of sections || []) {
    if (FOOTER_HEADINGS.has(s.heading)) continue;
    const itemIds = [];
    for (const c of s.cards || []) {
      const id = (c.href || '').match(/pinned_listings(?:%5B%5D|\[\])=(\d+)/)?.[1]
        || (c.href || '').match(/\/(?:rooms|experiences|services)\/(\d+)/)?.[1]
        || (c.img || '').match(/Hosting-(\d+)/)?.[1];
      if (id && kindIds.has(id) && !itemIds.includes(id)) itemIds.push(id);
    }
    if (itemIds.length) rails.push({ id: slug(s.heading), heading: s.heading, seeAllHref: s.seeAllHref || null, itemIds });
  }
  return rails;
}
/*
 * Region is not on the listing page — a stay in Baga never says "North Goa".
 * The home rails do carry it ("Popular homes in North Goa"), so derive each
 * listing's region from the rail it appeared in. This is what makes a search
 * for "North Goa" return the Baga/Candolim/Calangute homes, as on the real site.
 */
function placeFromHeading(heading) {
  const m = heading.match(/ in ([A-Z][\w' -]+?)(?: this weekend)?$/);
  return m ? m[1].trim() : null;
}
const regionOf = new Map();
for (const s of homeData.sections || []) {
  const place = placeFromHeading(s.heading);
  if (!place) continue;
  for (const c of s.cards || []) {
    const id = (c.href || '').match(/pinned_listings(?:%5B%5D|\[\])=(\d+)/)?.[1]
      || (c.img || '').match(/Hosting-(\d+)/)?.[1];
    if (id && !regionOf.has(id)) regionOf.set(id, place);
  }
}
let regionHits = 0;
for (const l of listings) {
  const r = regionOf.get(l.id);
  if (r && r.toLowerCase() !== l.city.toLowerCase()) { l.region = r; regionHits++; }
}
console.log(`\nregions assigned from rails: ${regionHits}/${listings.length}`);

const homeIds = new Set(listings.map(l => l.id));
const expIds = new Set(experiences.map(l => l.id));
const svcIds = new Set(services.map(l => l.id));

const railsHome = buildRails(homeData.sections, homeIds);
let railsExperiences = [], railsServices = [];
try { railsExperiences = buildRails(JSON.parse(await fs.readFile(`${CAP}/tabs/experiences.json`, 'utf8')).sections, expIds); } catch {}
try { railsServices = buildRails(JSON.parse(await fs.readFile(`${CAP}/tabs/services.json`, 'utf8')).sections, svcIds); } catch {}

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */
/*
 * Airbnb's "Suggested destinations" rows read "<Place>, <State>" with a short
 * editorial blurb and a terrain-specific illustration. None of that is on a
 * listing page, so it is curated here.  `order` reproduces the sequence the
 * live site shows; anything unlisted falls in behind, ranked by listing count.
 */
const PLACE_META = {
  'North Goa':       { state: 'Goa',         terrain: 'beach', tagline: 'Popular beach destination',           order: 1 },
  'South Goa':       { state: 'Goa',         terrain: 'beach', tagline: 'For sights like Basilica of Bom Jesus', order: 2 },
  'Puducherry':      { state: 'Puducherry',  terrain: 'beach', tagline: 'For its seaside allure',              order: 3 },
  'Ooty':            { state: 'Tamil Nadu',  terrain: 'hills', tagline: 'Great for a weekend getaway',         order: 4 },
  'Nandi Hills':     { state: 'Karnataka',   terrain: 'hills', tagline: 'For nature lovers',                   order: 5 },
  'Madikeri':        { state: 'Karnataka',   terrain: 'hills', tagline: 'Great for a weekend getaway',         order: 6 },
  'Wayanad':         { state: 'Kerala',      terrain: 'hills', tagline: 'For nature lovers',                   order: 7 },
  'Mysore':          { state: 'Karnataka',   terrain: 'city',  tagline: 'For its palaces and heritage',        order: 8 },
  'Mangalore':       { state: 'Karnataka',   terrain: 'beach', tagline: 'For its beaches and temples',         order: 9 },
  'Mumbai':          { state: 'Maharashtra', terrain: 'city',  tagline: 'For its vibrant nightlife',           order: 10 },
  'Bengaluru':       { state: 'Karnataka',   terrain: 'city',  tagline: 'Great for a weekend getaway' },
  'Baga':            { state: 'Goa',         terrain: 'beach', tagline: 'Popular beach destination' },
  'Calangute':       { state: 'Goa',         terrain: 'beach', tagline: 'Popular beach destination' },
  'Candolim':        { state: 'Goa',         terrain: 'beach', tagline: 'Popular beach destination' },
  'Anjuna':          { state: 'Goa',         terrain: 'beach', tagline: 'For its beach shacks and markets' },
  'Nerul':           { state: 'Goa',         terrain: 'beach', tagline: 'Popular beach destination' },
  'Colva':           { state: 'Goa',         terrain: 'beach', tagline: 'For its quiet beaches' },
  'Varca':           { state: 'Goa',         terrain: 'beach', tagline: 'For its quiet beaches' },
  'Benaulim':        { state: 'Goa',         terrain: 'beach', tagline: 'For its quiet beaches' },
  'Betalbatim':      { state: 'Goa',         terrain: 'beach', tagline: 'For its quiet beaches' },
  'The Nilgiris':    { state: 'Tamil Nadu',  terrain: 'hills', tagline: 'For nature lovers' },
  'Kalpetta':        { state: 'Kerala',      terrain: 'hills', tagline: 'For nature lovers' },
  'Vayittiri':       { state: 'Kerala',      terrain: 'hills', tagline: 'For nature lovers' },
  'Sulthan Bathery': { state: 'Kerala',      terrain: 'hills', tagline: 'For nature lovers' },
  'Irulam':          { state: 'Kerala',      terrain: 'hills', tagline: 'For nature lovers' },
  'Chikkaballapura': { state: 'Karnataka',   terrain: 'hills', tagline: 'Great for a weekend getaway' },
  'Balamavatti':     { state: 'Karnataka',   terrain: 'hills', tagline: 'For nature lovers' },
  'Hosur':           { state: 'Tamil Nadu',  terrain: 'city',  tagline: 'Great for a weekend getaway' },
  'Krishnagiri':     { state: 'Tamil Nadu',  terrain: 'hills', tagline: 'Great for a weekend getaway' },
};

const destMap = new Map();
const addDest = (name, region, l) => {
  const key = slug(name);
  if (!key) return;
  if (!destMap.has(key)) {
    const meta = PLACE_META[name] ?? {};
    destMap.set(key, {
      slug: key,
      name,
      region,
      state: meta.state ?? null,
      terrain: meta.terrain ?? 'city',
      tagline: meta.tagline ?? 'Great for a weekend getaway',
      order: meta.order ?? null,
      country: l.country,
      coordinates: l.coordinates,
      listingCount: 0,
    });
  }
  const d = destMap.get(key);
  d.listingCount++;
  if (!d.coordinates && l.coordinates) d.coordinates = l.coordinates;
};
for (const l of listings) {
  addDest(l.city, l.region, l);
  // Regions are destinations in their own right ("North Goa", "Wayanad").
  if (l.region && slug(l.region) !== slug(l.city)) addDest(l.region, null, l);
}

/* ------------------------------------------------------------------ */
/* Amenity catalogue (for the filters modal)                           */
/* ------------------------------------------------------------------ */
const amenityCounts = new Map();
for (const l of listings) for (const a of l.amenities) amenityCounts.set(a, (amenityCounts.get(a) || 0) + 1);
const amenityCatalogue = [...amenityCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

const groupCatalogue = new Map();
for (const l of listings) for (const g of l.amenityGroups) {
  if (!groupCatalogue.has(g.group)) groupCatalogue.set(g.group, new Set());
  g.items.forEach(i => groupCatalogue.get(g.group).add(i));
}

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */
const files = {
  'listings.json': listings,
  'experiences.json': experiences,
  'services.json': services,
  'hosts.json': [...hosts.values()],
  'reviews.json': reviews,
  'rails-home.json': railsHome,
  'rails-experiences.json': railsExperiences,
  'rails-services.json': railsServices,
  'destinations.json': [...destMap.values()].sort((a, b) => {
    // Curated order first (matching the live suggestions), then by size.
    if (a.order && b.order) return a.order - b.order;
    if (a.order) return -1;
    if (b.order) return 1;
    return b.listingCount - a.listingCount;
  }),
  'amenities.json': amenityCatalogue,
  'amenity-groups.json': [...groupCatalogue.entries()].map(([group, items]) => ({ group, items: [...items] })),
  'footer.json': homeData.footerCols || [],
};
for (const [name, content] of Object.entries(files)) {
  await fs.writeFile(path.join(DATA, name), JSON.stringify(content, null, 2));
  const n = Array.isArray(content) ? content.length : Object.keys(content).length;
  console.log(`  ${name.padEnd(26)} ${String(n).padStart(5)} records`);
}

console.log('\n--- sanity ---');
const withPhotos = listings.filter(l => l.photos.length).length;
const withPrice = listings.filter(l => l.pricePerNight > 0).length;
const withCoords = listings.filter(l => l.coordinates).length;
const withAmen = listings.filter(l => l.amenityGroups.length).length;
console.log(`listings: ${listings.length} | photos ${withPhotos} | price ${withPrice} | coords ${withCoords} | amenityGroups ${withAmen}`);
console.log(`cities: ${[...destMap.keys()].join(', ')}`);
console.log(`price range: ₹${Math.min(...listings.map(l => l.pricePerNight))} – ₹${Math.max(...listings.map(l => l.pricePerNight))}`);
console.log(`reviews: ${reviews.length} | hosts: ${hosts.size}`);
console.log(`experiences w/ agenda: ${experiences.filter(e => e.agenda.length).length}/${experiences.length}`);
console.log(`services w/ menu: ${services.filter(s => s.menu.length).length}/${services.length}`);
console.log('\nSAMPLE LISTING:');
console.log(JSON.stringify({ ...listings[0], description: listings[0].description.slice(0, 120) + '…', photos: listings[0].photos.slice(0, 3) }, null, 2).slice(0, 2200));
