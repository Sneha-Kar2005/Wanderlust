/**
 * Seeds MongoDB from the committed JSON in src/data and verifies the app's
 * CRUD collections can be written to.
 *
 *   MONGODB_URI="mongodb+srv://…/airbnb?retryWrites=true&w=majority" node seed-mongo.mjs
 *
 * Safe to re-run: catalogue collections are replaced wholesale, and the
 * mutable collections (bookings, wishlists, reviews) are left untouched
 * unless --reset is passed.
 */
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';

// The local resolver fails on Atlas SRV records in some networks; Google/
// Cloudflare resolve them reliably.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { MongoClient } = await import('mongodb');

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'airbnb';
const RESET = process.argv.includes('--reset');
const DATA = '/Users/techsaswata/Downloads/Wanderlust/src/data';

if (!URI) {
  console.error('MONGODB_URI is not set.\n');
  console.error('  MONGODB_URI="mongodb+srv://user:pass@host/airbnb?retryWrites=true&w=majority" \\');
  console.error('    node tools/seed-mongo.mjs');
  process.exit(1);
}

/** Catalogue collections, loaded from JSON. Keyed by collection name. */
const CATALOGUE = {
  listings: 'listings.json',
  experiences: 'experiences.json',
  services: 'services.json',
  hosts: 'hosts.json',
  reviews_catalogue: 'reviews.json',
  destinations: 'destinations.json',
  amenities: 'amenities.json',
  amenity_groups: 'amenity-groups.json',
  rails_home: 'rails-home.json',
  rails_experiences: 'rails-experiences.json',
  rails_services: 'rails-services.json',
};

/** Collections the running app writes to. */
const MUTABLE = ['bookings', 'wishlists', 'reviews'];

const redacted = URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log(`connecting to ${redacted}`);
console.log(`database: ${DB_NAME}\n`);

const client = new MongoClient(URI, {
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
});

try {
  await client.connect();
  await client.db(DB_NAME).command({ ping: 1 });
  console.log('connected\n');

  const db = client.db(DB_NAME);

  for (const [collection, file] of Object.entries(CATALOGUE)) {
    const docs = JSON.parse(await fs.readFile(path.join(DATA, file), 'utf8'));
    const col = db.collection(collection);
    await col.deleteMany({});
    if (docs.length) await col.insertMany(docs, { ordered: false });
    console.log(`  ${collection.padEnd(20)} ${String(docs.length).padStart(4)} docs`);
  }

  // Indexes the app's queries actually use.
  await db.collection('listings').createIndex({ id: 1 }, { unique: true });
  await db.collection('listings').createIndex({ city: 1, region: 1 });
  await db.collection('listings').createIndex({ pricePerNight: 1 });
  await db.collection('reviews_catalogue').createIndex({ listingId: 1 });
  await db.collection('bookings').createIndex({ id: 1 }, { unique: true });
  await db.collection('bookings').createIndex({ userId: 1 });
  await db.collection('wishlists').createIndex({ id: 1 }, { unique: true });
  await db.collection('wishlists').createIndex({ userId: 1 });
  await db.collection('reviews').createIndex({ listingId: 1 });
  console.log('\nindexes created');

  if (RESET) {
    for (const c of MUTABLE) await db.collection(c).deleteMany({});
    console.log(`reset mutable collections: ${MUTABLE.join(', ')}`);
  }

  // Prove the app's write path works, then clean up after ourselves.
  const probe = { id: '__seed_probe__', userId: '__seed__', createdAt: new Date().toISOString() };
  await db.collection('bookings').insertOne(probe);
  const readBack = await db.collection('bookings').findOne({ id: probe.id });
  await db.collection('bookings').deleteOne({ id: probe.id });
  console.log(`write test: ${readBack ? 'ok' : 'FAILED'}`);

  const names = (await db.listCollections().toArray()).map((c) => c.name).sort();
  console.log(`\ncollections in "${DB_NAME}": ${names.join(', ')}`);
  console.log('\nSeed complete. Add this to .env.local:');
  console.log(`  MONGODB_URI="${URI}"`);
  console.log(`  MONGODB_DB="${DB_NAME}"`);
} catch (err) {
  const msg = err?.message ?? String(err);
  console.error(`\nFAILED: ${msg}\n`);
  if (/ENOTFOUND|ESERVFAIL|querySrv/i.test(msg)) {
    console.error('DNS could not resolve the SRV record — check the host in the URI.');
  } else if (/Authentication failed|bad auth/i.test(msg)) {
    console.error('Wrong username or password. If the password contains symbols,');
    console.error('percent-encode them (@ -> %40, / -> %2F, : -> %3A, # -> %23).');
  } else if (/tlsv1 alert|SSL|timed out|ETIMEDOUT/i.test(msg)) {
    console.error('Handshake or timeout — this is almost always the IP access list.');
    console.error('In Atlas: Security -> Database & Network Access -> add 0.0.0.0/0,');
    console.error('and confirm the entry is Active rather than Pending.');
  }
  process.exitCode = 1;
} finally {
  await client.close();
}
