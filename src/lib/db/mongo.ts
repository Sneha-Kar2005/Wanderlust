import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * Mongo is the durable CRUD store when `MONGODB_URI` is set and reachable.
 * Otherwise the app transparently falls back to an in-memory store so it
 * always boots — with no config, and with no network access.
 */

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB ?? "airbnb";

/**
 * A shared-tier Atlas cluster's first TLS handshake regularly needs well over
 * five seconds, so a short timeout silently downgrades a perfectly healthy
 * database to the in-memory store. Only the first request pays this cost —
 * the client is cached and pooled thereafter.
 */
const CONNECT_TIMEOUT_MS = 15_000;
/** After a failed attempt, wait this long before trying Mongo again. */
const RETRY_COOLDOWN_MS = 30_000;

declare global {
  // Reused across HMR reloads in dev so we don't leak connections.
  var __mongo:
    | { promise: Promise<Db | null>; failedAt: number | null }
    | undefined;
}

async function connect(): Promise<Db | null> {
  if (!URI) return null;
  const client = new MongoClient(URI, {
    serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
    connectTimeoutMS: CONNECT_TIMEOUT_MS,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  });
  try {
    await client.connect();
    await client.db(DB_NAME).command({ ping: 1 });
    console.log(`[db] connected to MongoDB "${DB_NAME}"`);
    return client.db(DB_NAME);
  } catch (err) {
    // Don't leave a half-open client behind on failure.
    await client.close().catch(() => {});
    console.warn(
      `[db] Mongo unavailable (${(err as Error).message.slice(0, 140)}) — using in-memory store.`,
    );
    return null;
  }
}

/**
 * Resolves to a Db, or null when Mongo is not configured or not reachable.
 *
 * A failure is NOT cached permanently: after a cooldown the next caller
 * retries, so a transient blip at boot doesn't strand the process on the
 * in-memory store for its whole lifetime.
 */
export function getDb(): Promise<Db | null> {
  if (!URI) return Promise.resolve(null);

  const cached = globalThis.__mongo;
  if (cached) {
    const stale =
      cached.failedAt !== null && Date.now() - cached.failedAt > RETRY_COOLDOWN_MS;
    if (!stale) return cached.promise;
  }

  const entry: { promise: Promise<Db | null>; failedAt: number | null } = {
    promise: Promise.resolve(null),
    failedAt: null,
  };
  entry.promise = connect().then((db) => {
    if (!db) entry.failedAt = Date.now();
    return db;
  });
  globalThis.__mongo = entry;
  return entry.promise;
}
