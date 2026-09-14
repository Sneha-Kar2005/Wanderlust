/**
 * Read-only catalogue. Sourced from the committed JSON in `src/data`, so the
 * app boots with zero configuration and never touches the network.
 */
import type {
  Listing,
  Experience,
  Service,
  Host,
  Review,
  Rail,
  Destination,
  AmenityGroup,
} from "@/types";

import listingsJson from "@/data/listings.json";
import experiencesJson from "@/data/experiences.json";
import servicesJson from "@/data/services.json";
import hostsJson from "@/data/hosts.json";
import reviewsJson from "@/data/reviews.json";
import railsHomeJson from "@/data/rails-home.json";
import railsExperiencesJson from "@/data/rails-experiences.json";
import railsServicesJson from "@/data/rails-services.json";
import destinationsJson from "@/data/destinations.json";
import amenitiesJson from "@/data/amenities.json";
import amenityGroupsJson from "@/data/amenity-groups.json";

/** `hostId` is a join key in the JSON; the domain type embeds the host. */
type RawListing = Omit<Listing, "host"> & { hostId: string };
type RawExperience = Omit<Experience, "host"> & { hostId: string };
type RawService = Omit<Service, "host"> & { hostId: string };

export const hosts = hostsJson as unknown as Host[];
export const reviews = reviewsJson as unknown as Review[];
export const destinations = destinationsJson as unknown as Destination[];
export const amenityCatalogue = amenitiesJson as unknown as {
  name: string;
  count: number;
}[];
export const amenityGroupCatalogue = amenityGroupsJson as unknown as AmenityGroup[];

const hostById = new Map(hosts.map((h) => [h.id, h]));

/** Fallback keeps rendering safe if a join key ever goes stale. */
const UNKNOWN_HOST: Host = {
  id: "unknown",
  name: "Host",
  avatar: null,
  superhost: false,
  reviewCount: 0,
  rating: null,
  yearsHosting: null,
  speaks: [],
  livesIn: null,
  bio: null,
};

function withHost<T extends { hostId: string }>(raw: T) {
  const { hostId, ...rest } = raw;
  return { ...rest, host: hostById.get(hostId) ?? UNKNOWN_HOST };
}

export const listings: Listing[] = (listingsJson as unknown as RawListing[]).map(
  (l) => withHost(l) as Listing,
);
export const experiences: Experience[] = (
  experiencesJson as unknown as RawExperience[]
).map((e) => withHost(e) as Experience);
export const services: Service[] = (servicesJson as unknown as RawService[]).map(
  (s) => withHost(s) as Service,
);

export const railsHome = railsHomeJson as unknown as Rail[];
export const railsExperiences = railsExperiencesJson as unknown as Rail[];
export const railsServices = railsServicesJson as unknown as Rail[];

const listingById = new Map(listings.map((l) => [l.id, l]));
const experienceById = new Map(experiences.map((e) => [e.id, e]));
const serviceById = new Map(services.map((s) => [s.id, s]));
const reviewsByListing = new Map<string, Review[]>();
for (const r of reviews) {
  const arr = reviewsByListing.get(r.listingId);
  if (arr) arr.push(r);
  else reviewsByListing.set(r.listingId, [r]);
}

export function getListing(id: string): Listing | undefined {
  return listingById.get(id);
}
export function getExperience(id: string): Experience | undefined {
  return experienceById.get(id);
}
export function getService(id: string): Service | undefined {
  return serviceById.get(id);
}
export function getReviews(listingId: string): Review[] {
  return reviewsByListing.get(listingId) ?? [];
}
export function getHost(id: string): Host | undefined {
  return hostById.get(id);
}
export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

/**
 * Wishlists can hold homes, experiences and services, so saved ids have to be
 * resolved across all three collections rather than assuming a stay.
 */
export function getAnySaveable(id: string): Listing | Experience | Service | undefined {
  return listingById.get(id) ?? experienceById.get(id) ?? serviceById.get(id);
}

/** Resolves saved ids to entities of any kind, dropping ones that no longer exist. */
export function resolveSaved(
  ids: string[],
): (Listing | Experience | Service)[] {
  return ids
    .map(getAnySaveable)
    .filter((x): x is Listing | Experience | Service => Boolean(x));
}

/** Resolves the ids on a rail to full entities, preserving rail order. */
export function resolveRail<T extends { id: string }>(
  ids: string[],
  index: Map<string, T>,
): T[] {
  return ids.map((id) => index.get(id)).filter((x): x is T => Boolean(x));
}

export const listingIndex = listingById;
export const experienceIndex = experienceById;
export const serviceIndex = serviceById;
