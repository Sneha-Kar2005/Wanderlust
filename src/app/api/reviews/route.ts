import { NextResponse } from "next/server";
import { userReviews } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/session";
import { getListing, getReviews } from "@/lib/db/static";
import type { Review } from "@/types";

/** GET /api/reviews?listingId=… — catalogue reviews plus any written here. */
export async function GET(request: Request) {
  const listingId = new URL(request.url).searchParams.get("listingId");
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }
  const authored = await userReviews.forListing(listingId);
  return NextResponse.json({ reviews: [...authored, ...getReviews(listingId)] });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    listingId?: string;
    stars?: number;
    text?: string;
  };
  const { listingId, stars, text } = body;

  if (!listingId || !text?.trim()) {
    return NextResponse.json(
      { error: "listingId and text are required" },
      { status: 400 },
    );
  }
  if (!getListing(listingId)) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  const rating = Math.round(stars ?? 5);
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "stars must be 1-5" }, { status: 400 });
  }

  const user = await getCurrentUser();
  const now = new Date();
  const review: Review = {
    id: `r-user-${listingId}-${now.getTime()}`,
    listingId,
    author: user.firstName,
    avatar: user.avatar,
    tenure: null,
    location: null,
    stars: rating,
    date: now.toLocaleString("en-IN", { month: "long", year: "numeric" }),
    createdAt: now.toISOString().slice(0, 10),
    body: text.trim(),
  };

  await userReviews.create(review);
  return NextResponse.json({ review }, { status: 201 });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const removed = await userReviews.remove(id);
  if (!removed) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
