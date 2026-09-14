import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StarIcon, PlusIcon } from "@/components/ui/icons";
import { listings } from "@/lib/db/static";
import { formatPrice } from "@/lib/format/currency";

export const metadata: Metadata = { title: "Your listings - Airbnb" };

export default function HostHomesPage() {
  // The signed-in host's portfolio: the superhost listings in this environment.
  const owned = listings.filter((l) => l.host.superhost).slice(0, 6);

  return (
    <>
      <Header variant="compact" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <div className="flex items-center justify-between py-8">
          <h1 className="text-[32px] font-semibold leading-9 text-[#222]">
            Your listings
          </h1>
          <Link
            href="/become-a-host"
            className="flex items-center gap-2 rounded-lg bg-[#222] px-5 py-3 text-[14px] font-medium leading-[18px] text-white transition hover:bg-black"
          >
            <PlusIcon size={12} />
            Create listing
          </Link>
        </div>

        <table className="w-full border-t border-[#ebebeb] text-left">
          <thead>
            <tr className="text-[12px] uppercase tracking-wide text-[#6a6a6a]">
              <th className="py-4 font-medium">Listing</th>
              <th className="py-4 font-medium">Location</th>
              <th className="py-4 font-medium">Rating</th>
              <th className="py-4 text-right font-medium">Nightly</th>
              <th className="py-4 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {owned.map((l) => (
              <tr key={l.id}>
                <td className="py-4">
                  <Link href={`/rooms/${l.id}`} className="flex items-center gap-4">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">
                      {l.photos[0] && (
                        <Image
                          src={l.photos[0]}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium leading-[18px] text-[#222]">
                        {l.title}
                      </span>
                      <span className="block text-[12px] leading-4 text-[#6a6a6a]">
                        {l.propertyType}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="py-4 text-[14px] leading-[18px] text-[#222]">{l.city}</td>
                <td className="py-4">
                  {l.rating !== null && (
                    <span className="flex items-center gap-1 text-[14px] leading-[18px] text-[#222]">
                      <StarIcon size={11} />
                      {l.rating.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="py-4 text-right text-[14px] leading-[18px] text-[#222]">
                  {formatPrice(l.pricePerNight)}
                </td>
                <td className="py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 text-[14px] leading-[18px] text-[#222]">
                    <span className="h-2 w-2 rounded-full bg-spruce" />
                    Listed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Footer />
    </>
  );
}
