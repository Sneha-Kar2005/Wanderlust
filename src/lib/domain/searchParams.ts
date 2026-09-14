import type { SearchFilters } from "@/types";

type Raw = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const int = (v: string | string[] | undefined): number | undefined => {
  const s = one(v);
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Translates the URL query into domain filters. The URL is the single source
 * of truth for search state, so agents can drive the page by navigation alone.
 */
export function parseSearchParams(sp: Raw, locationSlug?: string): SearchFilters {
  const placeType = one(sp.place_type);

  return {
    location:
      one(sp.query) ??
      (locationSlug && locationSlug !== "all"
        ? decodeURIComponent(locationSlug).replace(/-/g, " ")
        : undefined),
    checkIn: one(sp.checkin),
    checkOut: one(sp.checkout),
    guests: {
      adults: int(sp.adults) ?? 0,
      children: int(sp.children) ?? 0,
      infants: int(sp.infants) ?? 0,
      pets: int(sp.pets) ?? 0,
    },
    minPrice: int(sp.price_min),
    maxPrice: int(sp.price_max),
    placeType:
      placeType === "room" || placeType === "entire" ? placeType : undefined,
    bedrooms: int(sp.bedrooms),
    beds: int(sp.beds),
    bathrooms: int(sp.bathrooms),
    amenities: one(sp.amenities)?.split(",").filter(Boolean),
    instantBook: one(sp.instant_book) === "1",
    guestFavourite: one(sp.guest_favourite) === "1",
    superhost: one(sp.superhost) === "1",
    sort: (one(sp.sort) as SearchFilters["sort"]) ?? "recommended",
    page: int(sp.page) ?? 1,
  };
}

/** How many filter chips are active — drives the badge on the Filters button. */
export function activeFilterCount(f: SearchFilters): number {
  let n = 0;
  if (f.minPrice !== undefined) n++;
  if (f.maxPrice !== undefined) n++;
  if (f.placeType) n++;
  if (f.bedrooms !== undefined) n++;
  if (f.beds !== undefined) n++;
  if (f.bathrooms !== undefined) n++;
  if (f.guestFavourite) n++;
  if (f.superhost) n++;
  n += f.amenities?.length ?? 0;
  return n;
}
