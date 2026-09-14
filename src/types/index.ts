/**
 * Domain models. Shapes mirror the structures scraped from airbnb.co.in so the
 * UI can render real data without translation layers.
 */

export type ListingKind = "home" | "experience" | "service";

export interface Money {
  /** Minor-unit-free integer amount, e.g. 16205 for ₹16,205 */
  amount: number;
  currency: "INR";
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Host {
  id: string;
  name: string;
  avatar: string | null;
  superhost: boolean;
  reviewCount: number;
  rating: number | null;
  yearsHosting: number | null;
  speaks: string[];
  livesIn: string | null;
  bio: string | null;
}

export interface Review {
  id: string;
  listingId: string;
  author: string;
  avatar: string | null;
  /** e.g. "2 years on Airbnb" or "Melbourne, Australia" */
  tenure: string | null;
  location: string | null;
  stars: number;
  /** e.g. "June 2026" or "2 weeks ago" */
  date: string;
  /** ISO date used for sorting; derived from `date` */
  createdAt: string;
  body: string;
}

export interface SleepingArrangement {
  name: string;
  beds: string;
}

export interface Highlight {
  title: string;
  body: string | null;
  icon: string | null;
}

export interface AmenityGroup {
  group: string;
  items: string[];
}

export interface CategoryRatings {
  Cleanliness?: number;
  Accuracy?: number;
  "Check-in"?: number;
  Communication?: number;
  Location?: number;
  Value?: number;
}

export interface HouseRules {
  checkIn: string | null;
  checkout: string | null;
  maxGuests: number | null;
}

/** A stay — the `/rooms/[id]` entity. */
export interface Listing {
  id: string;
  kind: "home";
  /** e.g. "Luxury Lakeside 2BHK Villa | Near Baga Beach" */
  title: string;
  /** e.g. "Entire villa in Baga, India" */
  subtitle: string;
  /** e.g. "Villa in Baga" — the card heading */
  cardTitle: string;
  propertyType: string;
  city: string;
  region: string | null;
  country: string;

  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;

  /** Base nightly rate in INR, before fees and tax. */
  pricePerNight: number;
  /** Some listings show a struck-through original price */
  originalPricePerNight: number | null;
  /** All-in total as displayed on the card, and the nights it covers. */
  cardTotal: number | null;
  cardNights: number;

  rating: number | null;
  reviewCount: number;
  categoryRatings: CategoryRatings;
  guestFavourite: boolean;

  description: string;
  highlights: Highlight[];
  sleeping: SleepingArrangement[];
  amenities: string[];
  amenitiesUnavailable: string[];
  amenityGroups: AmenityGroup[];

  host: Host;
  coordinates: Coordinates | null;
  locationBlurb: string | null;
  houseRules: HouseRules;
  /** Raw "Things to know" lines, used to derive the safety column. */
  policiesRaw: string[];

  /** Local paths under /images/listings/<id>/ */
  photos: string[];
  reviewIds: string[];
}

/** An itinerary step on an experience, or a package on a service. */
export interface AgendaItem {
  title: string;
  body: string | null;
  image: string | null;
}

/** The `/experiences/[id]` entity. */
export interface Experience {
  id: string;
  kind: "experience";
  title: string;
  tagline: string | null;
  city: string;
  country: string;
  /** Price per guest */
  price: number;
  priceUnit: "guest" | "group" | "person";
  rating: number | null;
  reviewCount: number;
  agenda: AgendaItem[];
  highlights: Highlight[];
  host: Host;
  coordinates: Coordinates | null;
  locationBlurb: string | null;
  thingsToKnow: string[];
  cancellation: string | null;
  /** Times of day the experience runs, e.g. ["2:15 pm"] */
  startTimes: string[];
  photos: string[];
  reviewIds: string[];
}

/** The `/services/[id]` entity. */
export interface Service {
  id: string;
  kind: "service";
  title: string;
  tagline: string | null;
  /** e.g. "Photographer in Bangalore" */
  professionLine: string | null;
  category: string;
  city: string;
  country: string;
  price: number;
  priceUnit: "guest" | "group" | "person";
  rating: number | null;
  reviewCount: number;
  /** Service packages */
  menu: AgendaItem[];
  host: Host;
  coordinates: Coordinates | null;
  locationBlurb: string | null;
  thingsToKnow: string[];
  cancellation: string | null;
  photos: string[];
  reviewIds: string[];
}

export type AnyListing = Listing | Experience | Service;

/** A homepage / tab-page carousel. */
export interface Rail {
  id: string;
  heading: string;
  seeAllHref: string | null;
  /** ids into the matching entity collection */
  itemIds: string[];
}

export interface Destination {
  slug: string;
  name: string;
  region: string | null;
  /** Indian state or union territory, shown as "Ooty, Tamil Nadu". */
  state: string | null;
  /** Drives which line drawing the suggestion row uses. */
  terrain: "beach" | "hills" | "city";
  /** Editorial blurb, e.g. "Popular beach destination". */
  tagline: string;
  /** Position in the curated suggestion list; null sorts by listing count. */
  order: number | null;
  country: string;
  coordinates: Coordinates;
  listingCount: number;
}

/* -------------------------------------------------------------------------- */
/* Mutable state (CRUD)                                                       */
/* -------------------------------------------------------------------------- */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  joinedAt: string;
}

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface PriceLine {
  label: string;
  amount: number;
  /** Rendered struck-through / in green for discounts */
  kind?: "base" | "discount" | "fee" | "tax" | "total";
}

export interface Booking {
  id: string;
  confirmationCode: string;
  listingId: string;
  listingKind: ListingKind;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; infants: number; pets: number };
  nights: number;
  lines: PriceLine[];
  total: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  listingIds: string[];
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: GuestCounts;
  minPrice?: number;
  maxPrice?: number;
  placeType?: "any" | "room" | "entire";
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: string[];
  propertyTypes?: string[];
  instantBook?: boolean;
  guestFavourite?: boolean;
  superhost?: boolean;
  sort?: "recommended" | "price_asc" | "price_desc" | "rating";
  page?: number;
}
