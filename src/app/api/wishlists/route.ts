import { NextResponse } from "next/server";
import { wishlists } from "@/lib/db/store";
import { getCurrentUserId } from "@/lib/session";
import type { Wishlist } from "@/types";

const DEFAULT_NAME = "My next trip";

async function defaultWishlist(userId: string): Promise<Wishlist> {
  const all = await wishlists.all(userId);
  if (all.length) return all[0];
  const created: Wishlist = {
    id: `wl-${userId}-1`,
    userId,
    name: DEFAULT_NAME,
    listingIds: [],
    createdAt: new Date().toISOString(),
  };
  await wishlists.create(created);
  return created;
}

export async function GET() {
  const userId = await getCurrentUserId();
  const all = await wishlists.all(userId);
  return NextResponse.json({ wishlists: all });
}

/** Adds a listing to the default wishlist. */
export async function POST(request: Request) {
  const { listingId, wishlistId } = (await request.json()) as {
    listingId?: string;
    wishlistId?: string;
  };
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const target = wishlistId
    ? await wishlists.get(wishlistId)
    : await defaultWishlist(userId);
  if (!target) {
    return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
  }

  const next = target.listingIds.includes(listingId)
    ? target.listingIds
    : [...target.listingIds, listingId];
  const saved = await wishlists.save(target.id, next);
  return NextResponse.json({ wishlist: saved }, { status: 201 });
}

/** Removes a listing from every wishlist the user owns. */
export async function DELETE(request: Request) {
  const { listingId } = (await request.json()) as { listingId?: string };
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  const all = await wishlists.all(userId);
  for (const wl of all) {
    if (wl.listingIds.includes(listingId)) {
      await wishlists.save(
        wl.id,
        wl.listingIds.filter((id) => id !== listingId),
      );
    }
  }
  return NextResponse.json({ ok: true });
}
