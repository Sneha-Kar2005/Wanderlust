import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { CheckoutForm } from "@/components/booking/CheckoutForm";
import { StarIcon, ChevronLeftIcon } from "@/components/ui/icons";
import { getListing } from "@/lib/db/static";
import { quote } from "@/lib/domain/pricing";
import { formatPrice } from "@/lib/format/currency";
import { TODAY, addDays } from "@/lib/format/date";

export const metadata: Metadata = { title: "Confirm and pay - Airbnb" };

export default async function CheckoutPage({
  params,
  searchParams,
}: PageProps<"/book/stays/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const listing = getListing(id);
  if (!listing) notFound();

  const one = (v: string | string[] | undefined, fallback: string) =>
    (Array.isArray(v) ? v[0] : v) ?? fallback;
  const num = (v: string | string[] | undefined, fallback: number) => {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) ? n : fallback;
  };

  const checkIn = one(sp.checkin, addDays(TODAY, 7));
  const checkOut = one(sp.checkout, addDays(TODAY, 12));
  const adults = num(sp.adults, 1);
  const children = num(sp.children, 0);
  const infants = num(sp.infants, 0);
  const pets = num(sp.pets, 0);

  const q = quote({ pricePerNight: listing.pricePerNight, checkIn, checkOut });

  return (
    <>
      <header className="border-b border-[#ebebeb] bg-white">
        <div className="header-gutter mx-auto flex h-20 max-w-[2520px] items-center">
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <div className="flex items-center gap-3 py-8">
          <Link
            href={`/rooms/${listing.id}`}
            aria-label="Back to listing"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f7f7f7]"
          >
            <ChevronLeftIcon size={14} />
          </Link>
          <h1 className="text-[32px] font-semibold leading-9 text-[#222]">
            Confirm and pay
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-x-[94px] lg:grid-cols-[1fr_372px]">
          <div className="min-w-0">
            <CheckoutForm
              listing={listing}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adults}
              childrenCount={children}
              infants={infants}
              pets={pets}
            />
          </div>

          <aside className="order-first lg:order-last">
            <div className="sticky top-8 rounded-xl border border-[#dddddd] p-6">
              <div className="flex gap-4 border-b border-[#ebebeb] pb-6">
                <span className="relative h-[104px] w-[124px] shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">
                  {listing.photos[0] && (
                    <Image
                      src={listing.photos[0]}
                      alt={listing.title}
                      fill
                      sizes="124px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] leading-[18px] text-[#6a6a6a]">
                    {listing.subtitle}
                  </span>
                  <span className="mt-1 block text-[16px] leading-5 text-[#222]">
                    {listing.title}
                  </span>
                  {listing.rating !== null && (
                    <span className="mt-2 flex items-center gap-1 text-[14px] leading-[18px] text-[#222]">
                      <StarIcon size={12} />
                      {listing.rating.toFixed(2)}
                      <span className="text-[#6a6a6a]">({listing.reviewCount})</span>
                    </span>
                  )}
                </span>
              </div>

              <h2 className="py-6 text-[22px] font-semibold leading-[26px] text-[#222]">
                Price details
              </h2>
              <div className="space-y-3 border-b border-[#ebebeb] pb-6">
                {q.lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex justify-between gap-4 text-[16px] leading-5"
                  >
                    <span
                      className={
                        line.kind === "discount"
                          ? "text-spruce"
                          : "text-[#222] underline underline-offset-2"
                      }
                    >
                      {line.label}
                    </span>
                    <span
                      className={
                        line.kind === "discount" ? "shrink-0 text-spruce" : "shrink-0 text-[#222]"
                      }
                    >
                      {line.amount < 0 ? "-" : ""}
                      {formatPrice(Math.abs(line.amount))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-6 text-[16px] font-semibold leading-5 text-[#222]">
                <span>Total (INR)</span>
                <span>{formatPrice(q.total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
