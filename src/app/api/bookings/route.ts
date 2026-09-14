import { NextResponse } from "next/server";
import { bookings } from "@/lib/db/store";
import { getCurrentUserId } from "@/lib/session";
import { getListing } from "@/lib/db/static";
import { quote } from "@/lib/domain/pricing";
import { nightsBetween } from "@/lib/format/date";
import type { Booking } from "@/types";

/** Deterministic, human-shaped confirmation code: e.g. "HMX4K2QP". */
function confirmationCode(seed: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[h % alphabet.length];
    h = Math.floor(h / alphabet.length) + (i + 1) * 7919;
  }
  return out;
}

export async function GET() {
  const userId = await getCurrentUserId();
  const all = await bookings.all(userId);
  return NextResponse.json({ bookings: all });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    listingId?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    infants?: number;
    pets?: number;
  };

  const { listingId, checkIn, checkOut } = body;
  if (!listingId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "listingId, checkIn and checkOut are required" },
      { status: 400 },
    );
  }

  const listing = getListing(listingId);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) {
    return NextResponse.json(
      { error: "checkOut must be after checkIn" },
      { status: 400 },
    );
  }

  const guests = {
    adults: body.adults ?? 1,
    children: body.children ?? 0,
    infants: body.infants ?? 0,
    pets: body.pets ?? 0,
  };
  if (guests.adults + guests.children > listing.guests) {
    return NextResponse.json(
      { error: `This home allows at most ${listing.guests} guests` },
      { status: 400 },
    );
  }

  const userId = await getCurrentUserId();
  const q = quote({ pricePerNight: listing.pricePerNight, checkIn, checkOut });
  const id = `bk-${listingId}-${checkIn}-${checkOut}-${userId}`;

  const booking: Booking = {
    id,
    confirmationCode: confirmationCode(id),
    listingId,
    listingKind: "home",
    userId,
    checkIn,
    checkOut,
    guests,
    nights: q.nights,
    lines: q.lines,
    total: q.total,
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };

  const existing = await bookings.get(id);
  if (existing) {
    return NextResponse.json({ booking: existing }, { status: 200 });
  }

  await bookings.create(booking);
  return NextResponse.json({ booking }, { status: 201 });
}
