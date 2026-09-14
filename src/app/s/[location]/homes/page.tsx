import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FilterPills } from "@/components/filters/FilterPills";
import { ListingCard } from "@/components/listing/ListingCard";
import { Pagination } from "@/components/ui/Pagination";
import { StaticMap } from "@/components/ui/StaticMap";
import { searchListings, priceHistogram, priceBounds } from "@/lib/domain/search";
import { parseSearchParams, activeFilterCount } from "@/lib/domain/searchParams";
import { nightsBetween } from "@/lib/format/date";
import { formatPrice } from "@/lib/format/currency";

export async function generateMetadata({
  params,
}: PageProps<"/s/[location]/homes">): Promise<Metadata> {
  const { location } = await params;
  const name = decodeURIComponent(location).replace(/-/g, " ");
  return {
    title: `${name} holiday rentals & homes - Airbnb`,
    description: `Find and book unique accommodation in ${name} on Airbnb.`,
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/s/[location]/homes">) {
  const { location } = await params;
  const sp = await searchParams;

  const filters = parseSearchParams(sp, location);
  const { items, total, page, pageCount } = searchListings(filters);
  const { min, max } = priceBounds();
  const nights =
    filters.checkIn && filters.checkOut
      ? nightsBetween(filters.checkIn, filters.checkOut)
      : 2;

  const placeName = filters.location
    ? filters.location.replace(/\b\w/g, (c) => c.toUpperCase())
    : "Anywhere";

  const markers = items.slice(0, 12).map((l) => ({
    id: l.id,
    lat: l.coordinates?.lat ?? 0,
    lng: l.coordinates?.lng ?? 0,
    label: formatPrice(l.pricePerNight),
  }));

  return (
    <>
      <Header
        variant="compact"
        location={placeName === "Anywhere" ? "" : placeName}
        checkIn={filters.checkIn}
        checkOut={filters.checkOut}
        guests={filters.guests}
      />

      <div className="sticky top-24 z-30 border-b border-[#ebebeb] bg-white">
        <div className="page-gutter mx-auto max-w-[2520px]">
          <FilterPills
            activeCount={activeFilterCount(filters)}
            priceHistogram={priceHistogram()}
            priceMin={min}
            priceMax={max}
          />
        </div>
      </div>

      <main className="flex flex-1 flex-col lg:flex-row">
        <div className="page-gutter min-w-0 flex-1 py-6">
          <h1
            data-testid="stays-page-heading"
            className="mb-4 text-[20px] font-semibold leading-6 text-[#222]"
          >
            {total > 0
              ? `${total} ${total === 1 ? "home" : "homes"} in ${placeName}`
              : `No exact matches in ${placeName}`}
          </h1>

          {items.length === 0 ? (
            <p className="py-12 text-[16px] leading-6 text-[#6a6a6a]">
              Try changing or removing some of your filters, or adjusting your search
              area.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2">
              {items.map((l, i) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  layout="grid"
                  checkIn={filters.checkIn}
                  checkOut={filters.checkOut}
                  nights={nights}
                  priority={i < 4}
                />
              ))}
            </div>
          )}

          <Pagination page={page} pageCount={pageCount} />
        </div>

        <div className="hidden w-[45%] shrink-0 lg:block">
          <div className="sticky top-[152px] h-[calc(100vh-152px)]">
            <StaticMap
              fill
              coordinates={items[0]?.coordinates ?? null}
              markers={markers}
              label={placeName}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
