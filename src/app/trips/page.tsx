import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { bookings } from "@/lib/db/store";
import { getCurrentUserId } from "@/lib/session";
import { getListing } from "@/lib/db/static";
import { formatPrice } from "@/lib/format/currency";
import { formatLong } from "@/lib/format/date";

export const metadata: Metadata = { title: "Trips - Airbnb" };

export default async function TripsPage({ searchParams }: PageProps<"/trips">) {
  const sp = await searchParams;
  const confirmed = Array.isArray(sp.confirmed) ? sp.confirmed[0] : sp.confirmed;

  const userId = await getCurrentUserId();
  const all = (await bookings.all(userId)).sort((a, b) =>
    a.checkIn < b.checkIn ? -1 : 1,
  );

  return (
    <>
      <Header variant="compact" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <h1 className="py-8 text-[32px] font-semibold leading-9 text-[#222]">Trips</h1>

        {confirmed && (
          <div
            role="status"
            className="mb-8 rounded-xl border border-[#dddddd] bg-[#f7f7f7] p-5"
          >
            <p className="text-[16px] font-medium leading-5 text-[#222]">
              Your reservation is confirmed
            </p>
            <p className="mt-1 text-[14px] leading-[18px] text-[#6a6a6a]">
              Confirmation code {confirmed}
            </p>
          </div>
        )}

        {all.length === 0 ? (
          <div className="border-t border-[#ebebeb] py-10">
            <p className="text-[22px] font-medium leading-[26px] text-[#222]">
              No trips booked... yet!
            </p>
            <p className="mt-2 text-[16px] leading-6 text-[#6a6a6a]">
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#222] px-6 py-3.5 text-[16px] font-medium leading-5 text-white transition hover:bg-black"
            >
              Start searching
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#ebebeb] border-t border-[#ebebeb]">
            {all.map((b) => {
              const listing = getListing(b.listingId);
              if (!listing) return null;
              return (
                <li key={b.id} className="py-6">
                  <Link href={`/rooms/${listing.id}`} className="flex gap-6">
                    <span className="relative h-[124px] w-[186px] shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7]">
                      {listing.photos[0] && (
                        <Image
                          src={listing.photos[0]}
                          alt={listing.title}
                          fill
                          sizes="186px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-medium uppercase tracking-wide text-[#6a6a6a]">
                        {b.status}
                      </span>
                      <span className="mt-1 block text-[18px] font-medium leading-6 text-[#222]">
                        {listing.title}
                      </span>
                      <span className="block text-[16px] leading-5 text-[#6a6a6a]">
                        {listing.city}, {listing.country}
                      </span>
                      <span className="mt-2 block text-[16px] leading-5 text-[#222]">
                        {formatLong(b.checkIn)} – {formatLong(b.checkOut)}
                      </span>
                      <span className="mt-1 block text-[14px] leading-[18px] text-[#6a6a6a]">
                        {b.nights} {b.nights === 1 ? "night" : "nights"} ·{" "}
                        {formatPrice(b.total)} · Code {b.confirmationCode}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Footer />
    </>
  );
}
