/**
 * Dumps every collection of a MongoDB database to JSON, one file per
 * collection.
 *
 *   MONGODB_URI="mongodb+srv://user:pass@host/db" node tools/dump-mongo.mjs
 *
 * Credentials come from the environment — never hardcode them here.
 */
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';

// Some networks fail to resolve Atlas SRV records with the system resolver.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { MongoClient } = await import('mongodb');

const URI = process.env.MONGODB_URI;
const OUT = process.env.DUMP_OUT ?? '/Users/techsaswata/Downloads/Wanderlust/capture/mongo-dump';

if (!URI) {
  console.error('MONGODB_URI is not set.\n');
  console.error('  MONGODB_URI="mongodb+srv://<user>:<password>@<host>/<db>" \\');
  console.error('    node tools/dump-mongo.mjs');
  process.exit(1);
}

const redacted = URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log(`connecting to ${redacted}`);

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 25000 });
try {
  await client.connect();
  console.log('connected');

  const { databases } = await client.db().admin().listDatabases();
  console.log('databases:', databases.map((d) => d.name).join(', '));
  await fs.mkdir(OUT, { recursive: true });

  for (const info of databases) {
    if (['admin', 'local', 'config'].includes(info.name)) continue;
    const db = client.db(info.name);
    for (const c of await db.listCollections().toArray()) {
      const docs = await db.collection(c.name).find({}).toArray();
      await fs.writeFile(
        path.join(OUT, `${info.name}.${c.name}.json`),
        JSON.stringify(docs, null, 2),
      );
      const keys = docs[0] ? Object.keys(docs[0]).join(',') : '-';
      console.log(`  ${info.name}.${c.name}: ${docs.length} docs | keys: ${keys}`);
    }
  }
  console.log(`\nwrote ${OUT}`);
} catch (e) {
  console.error('MONGO_ERROR:', e.name, e.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
