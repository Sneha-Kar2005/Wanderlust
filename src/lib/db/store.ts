import "server-only";
import type { Booking, Review, Wishlist } from "@/types";
import { getDb } from "./mongo";

/**
 * Collection-agnostic CRUD over Mongo, with an in-memory mirror used whenever
 * Mongo is unreachable. Every route handler goes through this — components
 * never touch a driver.
 */

type Doc = { id: string } & Record<string, unknown>;

const memory: Record<string, Doc[]> = {
  bookings: [],
  wishlists: [],
  reviews: [],
};

function mem(name: string): Doc[] {
  return (memory[name] ??= []);
}

export async function findAll<T extends Doc>(
  collection: string,
  filter: Partial<Record<keyof T, unknown>> = {},
): Promise<T[]> {
  const db = await getDb();
  if (db) {
    return db
      .collection<T>(collection)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .find(filter as any, { projection: { _id: 0 } })
      .toArray() as Promise<T[]>;
  }
  const entries = Object.entries(filter);
  return mem(collection).filter((d) =>
    entries.every(([k, v]) => v === undefined || d[k] === v),
  ) as T[];
}

export async function findOne<T extends Doc>(
  collection: string,
  id: string,
): Promise<T | null> {
  const db = await getDb();
  if (db) {
    return db
      .collection<T>(collection)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .findOne({ id } as any, { projection: { _id: 0 } }) as Promise<T | null>;
  }
  return (mem(collection).find((d) => d.id === id) as T | undefined) ?? null;
}

export async function insert<T extends Doc>(collection: string, doc: T): Promise<T> {
  const db = await getDb();
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection(collection).insertOne({ ...doc } as any);
  } else {
    mem(collection).push({ ...doc });
  }
  return doc;
}

export async function update<T extends Doc>(
  collection: string,
  id: string,
  patch: Partial<T>,
): Promise<T | null> {
  const db = await getDb();
  if (db) {
    await db
      .collection(collection)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .updateOne({ id } as any, { $set: patch as any });
    return findOne<T>(collection, id);
  }
  const list = mem(collection);
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], ...patch } as Doc;
  return list[i] as T;
}

export async function remove(collection: string, id: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await db.collection(collection).deleteOne({ id } as any);
    return res.deletedCount > 0;
  }
  const list = mem(collection);
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return false;
  list.splice(i, 1);
  return true;
}

/* ---------------------------------------------------------------- */
/* Typed helpers                                                     */
/* ---------------------------------------------------------------- */

export const bookings = {
  all: (userId?: string) =>
    findAll<Booking & Doc>("bookings", userId ? { userId } : {}),
  get: (id: string) => findOne<Booking & Doc>("bookings", id),
  create: (b: Booking) => insert<Booking & Doc>("bookings", b as Booking & Doc),
  cancel: (id: string) =>
    update<Booking & Doc>("bookings", id, { status: "cancelled" }),
};

export const wishlists = {
  all: (userId: string) => findAll<Wishlist & Doc>("wishlists", { userId }),
  get: (id: string) => findOne<Wishlist & Doc>("wishlists", id),
  create: (w: Wishlist) => insert<Wishlist & Doc>("wishlists", w as Wishlist & Doc),
  save: (id: string, listingIds: string[]) =>
    update<Wishlist & Doc>("wishlists", id, { listingIds }),
  remove: (id: string) => remove("wishlists", id),
};

export const userReviews = {
  forListing: (listingId: string) =>
    findAll<Review & Doc>("reviews", { listingId }),
  create: (r: Review) => insert<Review & Doc>("reviews", r as Review & Doc),
  remove: (id: string) => remove("reviews", id),
};
