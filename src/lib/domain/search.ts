import type { Listing, SearchFilters } from "@/types";
import { listings } from "@/lib/db/static";

export const RESULTS_PER_PAGE = 18;

/** Total guest headcount that counts against a listing's capacity. */
export function guestTotal(f: SearchFilters): number {
  const g = f.guests;
  if (!g) return 0;
  return g.adults + g.children;
}

function matchesLocation(l: Listing, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    l.city.toLowerCase().includes(q) ||
    (l.region?.toLowerCase().includes(q) ?? false) ||
    l.country.toLowerCase().includes(q) ||
    l.title.toLowerCase().includes(q) ||
    l.subtitle.toLowerCase().includes(q) ||
    l.propertyType.toLowerCase().includes(q)
  );
}

function matchesPlaceType(l: Listing, type: SearchFilters["placeType"]): boolean {
  if (!type || type === "any") return true;
  const entire = l.propertyType.toLowerCase().startsWith("entire");
  return type === "entire" ? entire : !entire;
}

export function filterListings(f: SearchFilters, source = listings): Listing[] {
  const guests = guestTotal(f);

  return source.filter((l) => {
    if (f.location && !matchesLocation(l, f.location)) return false;
    if (guests > 0 && l.guests < guests) return false;
    if (f.minPrice !== undefined && l.pricePerNight < f.minPrice) return false;
    if (f.maxPrice !== undefined && l.pricePerNight > f.maxPrice) return false;
    if (!matchesPlaceType(l, f.placeType)) return false;
    if (f.bedrooms !== undefined && l.bedrooms < f.bedrooms) return false;
    if (f.beds !== undefined && l.beds < f.beds) return false;
    if (f.bathrooms !== undefined && l.bathrooms < f.bathrooms) return false;
    if (f.guestFavourite && !l.guestFavourite) return false;
    if (f.superhost && !l.host.superhost) return false;
    if (f.propertyTypes?.length && !f.propertyTypes.includes(l.propertyType)) return false;
    if (f.amenities?.length) {
      const have = new Set([
        ...l.amenities,
        ...l.amenityGroups.flatMap((g) => g.items),
      ]);
      // Amenity labels vary in detail ("Free washer – In unit" vs "Washing machine"),
      // so match on substring in either direction.
      const hasAll = f.amenities.every((want) => {
        const w = want.toLowerCase();
        for (const h of have) {
          const hl = h.toLowerCase();
          if (hl.includes(w) || w.includes(hl)) return true;
        }
        return false;
      });
      if (!hasAll) return false;
    }
    return true;
  });
}

export function sortListings(list: Listing[], sort: SearchFilters["sort"]): Listing[] {
  const out = [...list];
  switch (sort) {
    case "price_asc":
      return out.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case "price_desc":
      return out.sort((a, b) => b.pricePerNight - a.pricePerNight);
    case "rating":
      return out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    default:
      // "Recommended": guest favourites first, then rating, then review volume.
      return out.sort((a, b) => {
        if (a.guestFavourite !== b.guestFavourite) return a.guestFavourite ? -1 : 1;
        if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
        return b.reviewCount - a.reviewCount;
      });
  }
}

export interface SearchResult {
  items: Listing[];
  total: number;
  page: number;
  pageCount: number;
}

export function searchListings(f: SearchFilters): SearchResult {
  const matched = sortListings(filterListings(f), f.sort);
  const page = Math.max(1, f.page ?? 1);
  const pageCount = Math.max(1, Math.ceil(matched.length / RESULTS_PER_PAGE));
  const start = (page - 1) * RESULTS_PER_PAGE;
  return {
    items: matched.slice(start, start + RESULTS_PER_PAGE),
    total: matched.length,
    page,
    pageCount,
  };
}

/**
 * Bucketed nightly prices for the filter modal's histogram. Airbnb renders
 * ~50 bars across the full price range of the current result set.
 */
export function priceHistogram(source = listings, buckets = 50): number[] {
  const prices = source.map((l) => l.pricePerNight);
  if (!prices.length) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(1, max - min);
  const bars = new Array(buckets).fill(0);
  for (const p of prices) {
    const i = Math.min(buckets - 1, Math.floor(((p - min) / span) * buckets));
    bars[i]++;
  }
  return bars;
}

export function priceBounds(source = listings): { min: number; max: number } {
  const prices = source.map((l) => l.pricePerNight);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
