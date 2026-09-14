# Airbnb Clone

A pixel-perfect clone of **airbnb.co.in** — accurate frontend, exact backend implementation.

Every colour, radius, shadow, font size and box measurement is taken from the live site
rather than eyeballed. Every listing, photo, review, host and price is real content
scraped from Airbnb, normalised into JSON and served locally. The app runs **completely
offline**: no CDN, no external fonts, no map API, no network calls at runtime.

![Home page](docs/screenshots/page-home.webp)

Next.js 16 (App Router) · TypeScript · Tailwind v4 · MongoDB (optional) · Vercel-ready.

**Built by Sneha Kar.**

---

## Contents

- [Quick start](#quick-start)
- [Pages](#pages)
- [The search box](#the-search-box)
- [Filters](#filters)
- [Listing detail components](#listing-detail-components)
- [Cards](#cards)
- [Mobile](#mobile)
- [Backend](#backend)
- [Data](#data)
- [How the pixel accuracy was achieved](#how-the-pixel-accuracy-was-achieved)
- [Architecture](#architecture)
- [Tooling](#tooling)
- [Notes and limits](#notes-and-limits)

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No configuration, no database and no network access are required — the app boots from
committed JSON and serves every asset from `public/`.

---

## Pages

All screenshots below are at a MacBook viewport (1512 × 900), showing what actually fits
on screen.

### Home — `/`

Ten destination rails, each a horizontally scrollable carousel of 7 cards with prev/next
paging. Below them, an SEO grid of destination links. The header carries the logo, the
four product tabs, and the expanded search bar.

![Home](docs/screenshots/page-home.webp)

The four product tabs (`All`, `Homes`, `Experiences`, `Services`) use Airbnb's 3D icons,
with a 2px underline marking the active tab:

![Product tabs](docs/screenshots/header-tabs.webp)

The profile menu splits guest actions from browse links:

![User menu](docs/screenshots/header-usermenu.webp)

### Homes — `/homes`

The stays-only tab. Same rails as the home page, with each heading linking through to a
filtered search for that destination.

![Homes tab](docs/screenshots/page-homes.webp)

### Experiences — `/experiences`

Activity rails grouped by when they run — "Happening today in Bengaluru", "Tomorrow in
Bengaluru", "Airbnb Originals". Cards are square and priced per guest.

![Experiences](docs/screenshots/page-experiences.webp)

### Services — `/services`

Local professionals — photographers, chefs, trainers — grouped by category and city.
Priced per group or per guest.

![Services](docs/screenshots/page-services.webp)

### Search results — `/s/[location]/homes`

Two-column card grid on the left, sticky map on the right, filter chips pinned below the
header. Results are paginated at 18 per page. Every filter lives in the URL, so a search
is fully shareable and reproducible.

![Search results](docs/screenshots/page-search.webp)

Searching a **region** works the way it does on the real site: `North Goa` returns homes
in Baga, Candolim, Nerul and Anjuna, because each listing's region is derived from the
rail it appeared in.

### Listing detail — `/rooms/[id]`

Title bar with share/save, the 1120 × 500 photo mosaic, then the two-column body: content
on the left (654px), sticky booking card on the right (372px).

![Listing detail](docs/screenshots/page-room.webp)

Scrolling down: sleeping arrangements, the full amenity list, the ratings breakdown with
per-category bars, and guest reviews.

![Listing detail, lower](docs/screenshots/page-room-lower.webp)

### Experience detail — `/experiences/[id]`

Gallery, a numbered "What you'll do" itinerary, listing highlights, reviews, location and
host — with a per-guest booking card.

![Experience detail](docs/screenshots/page-experience-detail.webp)

### Service detail — `/services/[id]`

Same shape, but the itinerary becomes a service menu (the packages the professional
offers) and pricing is per group.

![Service detail](docs/screenshots/page-service-detail.webp)

### Checkout — `/book/stays/[id]`

Trip summary, payment method (card or UPI), cancellation policy, and a sticky price
summary. Submitting validates the request and persists a booking.

![Checkout](docs/screenshots/page-checkout.webp)

> Checkout is simulated. It never collects or transmits real payment credentials.

### Trips — `/trips`

Bookings for the signed-in user, newest first, with a confirmation banner after checkout.
Empty state mirrors Airbnb's "No trips booked... yet!".

![Trips](docs/screenshots/page-trips.webp)

### Wishlists — `/wishlists` and `/wishlists/[id]`

Saved-listing collections. The index shows one cover tile per list; the detail page shows
the saved homes as a grid.

![Wishlists](docs/screenshots/page-wishlists.webp)

### Log in — `/login`

Phone-first auth with an India country selector, plus email and social alternatives.
Validates a 10-digit number or a well-formed email before continuing.

![Log in](docs/screenshots/page-login.webp)

### Account — `/account-settings`

The eight settings tiles, with a link through to the public profile at `/users/show/[id]`
(host profiles show stats, bio, languages and their listings).

![Account](docs/screenshots/page-account.webp)

### Host dashboard — `/host/homes`

A table of the host's listings: photo, location, rating, nightly rate and status.

![Host dashboard](docs/screenshots/page-host.webp)

### Become a host — `/become-a-host`

A three-step wizard — property type and capacity, then title and description, then
pricing — with per-step validation and a live "guests will see ₹X for 2 nights" preview.

![Become a host](docs/screenshots/page-become-a-host.webp)

### Help Centre — `/help`

Search field over four topic groups.

![Help Centre](docs/screenshots/page-help.webp)

### 404

![Not found](docs/screenshots/page-404.webp)

---

## The search box

The expanded bar has three segments and a submit button. Opening a segment lifts it to
white with elevation, dims the rest of the bar, and expands the pink button to show its
label.

![Search bar](docs/screenshots/search-bar.webp)

### Where

Typing filters a live list of destinations; each row shows the number of homes and the
country. Empty input shows suggested destinations. Picking one advances to dates.

![Where panel](docs/screenshots/search-where.webp)

### When

A two-month calendar starting Monday. First click sets check-in, second sets check-out,
and hovering previews the range. Past dates are struck through and disabled. The heading
switches from "Select check-in date" to the night count once a range is chosen.

![When panel](docs/screenshots/search-when.webp)

### Who

Steppers for adults, children, infants and pets, with min/max clamping. Adding a child or
infant automatically implies one adult.

![Who panel](docs/screenshots/search-who.webp)

### Compact pill

On inner pages the bar collapses to a 449 × 46 pill showing the current location, dates
and guests. Clicking it re-expands the full bar in an overlay.

![Compact search](docs/screenshots/search-compact.webp)

Submitting writes everything to the URL:

```
/s/North-Goa/homes?checkin=2026-09-21&checkout=2026-09-26&adults=2
```

---

## Filters

### Quick chips

Above the results: a `Filters` button carrying a count badge, then eight one-tap amenity
chips. Toggling a chip updates the URL and re-runs the search immediately.

![Filter chips](docs/screenshots/filters-pills.webp)

### Filters modal

**Price range** is a 50-bucket histogram computed from the actual result set, with bars
inside the selected range highlighted, plus min/max number inputs.
**Type of place** is Any / Room / Entire home.
**Rooms and beds** gives Any–8+ for bedrooms, beds and bathrooms.

![Filters modal](docs/screenshots/filters-modal.webp)

**Amenities** offers the 24 most common amenities across the catalogue. Matching is
substring-based in both directions, so the chip `Washing machine` also matches a listing
that lists `Free washer – In unit`. **Booking options** adds Guest favourite and
Superhost toggles.

![Amenities filters](docs/screenshots/filters-amenities.webp)

`Clear all` resets; `Show results` writes to the URL and closes.

| Filter | URL parameter |
| --- | --- |
| Price range | `price_min`, `price_max` |
| Type of place | `place_type=room \| entire` |
| Rooms and beds | `bedrooms`, `beds`, `bathrooms` |
| Amenities | `amenities=Wifi,Pool` |
| Guest favourite | `guest_favourite=1` |
| Superhost | `superhost=1` |
| Dates / guests | `checkin`, `checkout`, `adults`, `children`, `infants`, `pets` |
| Sort | `sort=price_asc \| price_desc \| rating` |
| Page | `page` |

---

## Listing detail components

### Photo gallery

One 560px hero plus a 2 × 2 grid, rounded on the outer corners only. "Show all photos"
opens a full-screen scrollable gallery.

![Gallery](docs/screenshots/room-gallery.webp)

### Booking card

With no dates it reads "Add dates for prices" and the CTA is `Check availability`:

![Booking card, empty](docs/screenshots/room-bookit.webp)

Once both dates are set it flips to a full breakdown and `Reserve`:

![Booking card, priced](docs/screenshots/room-bookit-priced.webp)

### Amenities modal

The preview lists ten amenities plus anything unavailable (struck through). "Show all N
amenities" opens the complete set, grouped exactly as Airbnb groups them.

![Amenities modal](docs/screenshots/room-amenities-modal.webp)

### Reviews modal

Six reviews inline; past that, a modal with the full set. Each carries the author,
avatar, tenure, star row and date.

![Reviews modal](docs/screenshots/room-reviews-modal.webp)

### Map

Deterministic vector cartography generated from the listing's coordinates — no tile
server, so it works offline and renders identically every time. On search results the
same component draws price-pill markers.

![Map](docs/screenshots/room-map.webp)

---

## Cards

Rail card — 181.7 × 214.6, image 20:19, title at 13/16 w500, then one 12px row of
`price for N nights · rating`:

![Rail card](docs/screenshots/card-rail.webp)

Search-result card — taller, with subtitle, bed summary, date range and an underlined
total:

![Search card](docs/screenshots/card-grid.webp)

Both support photo carousels with hover arrows and dot pagination, plus a wishlist heart
that writes through to the API.

---

## Mobile

Below `md` the search collapses into a single "Start your search" pill that opens a
full-screen sheet, and a fixed bottom tab bar appears. Verified free of horizontal
overflow at 390 × 844.

| Home | Listing | Search |
| --- | --- | --- |
| ![Mobile home](docs/screenshots/mobile-home.webp) | ![Mobile room](docs/screenshots/mobile-room.webp) | ![Mobile search](docs/screenshots/mobile-search.webp) |

---

## Backend

### API

| Method | Route | Behaviour |
| --- | --- | --- |
| `GET` | `/api/bookings` | Bookings for the current user |
| `POST` | `/api/bookings` | Validates dates and capacity, prices the stay, returns a booking with a deterministic confirmation code |
| `GET` | `/api/wishlists` | The user's wishlists |
| `POST` | `/api/wishlists` | Add a listing (creates a default wishlist on first save) |
| `DELETE` | `/api/wishlists` | Remove a listing from every wishlist |
| `GET` | `/api/reviews?listingId=` | Catalogue reviews plus any written through the API |
| `POST` | `/api/reviews` | Add a review (1–5 stars, non-empty body) |
| `DELETE` | `/api/reviews?id=` | Delete a review |

Validation is real, not decorative:

```bash
curl -X POST localhost:3000/api/bookings -H 'Content-Type: application/json' \
  -d '{"listingId":"1752121318473764362","checkIn":"2026-09-21","checkOut":"2026-09-26","adults":40}'
# {"error":"This home allows at most 7 guests"}
```

### Pricing

Airbnb India quotes an all-inclusive price, so the model in `lib/domain/pricing.ts`
reproduces it exactly:

| Line | Rate |
| --- | --- |
| Base | nightly rate × nights |
| Weekly / monthly discount | 8% at 7+ nights, 18% at 28+ |
| Cleaning fee | 8% of the nightly rate, capped at 3 nights |
| Service fee | 14.2% of the discounted base |
| GST | 18% of the subtotal |

The scraped card totals are already all-inclusive, so normalisation **inverts** this
model to recover each listing's base rate. Re-quoting a stay then reproduces the figure
the live site displayed — round-trip error is ≤ ₹2 across all 81 listings.

![Price breakdown](docs/screenshots/checkout-breakdown.webp)

### Storage

`src/data/*.json` is the read-only catalogue. Mutable state — bookings, wishlists,
reviews — goes through `lib/db/store.ts`:

- With `MONGODB_URI` set and reachable, it reads and writes MongoDB.
- Otherwise it falls back to an in-memory store, so the app always boots. The fallback is
  per-instance and resets on restart.

```bash
MONGODB_URI="mongodb+srv://…"   # optional
MONGODB_DB="airbnb"             # defaults to "airbnb"
```

Components never touch a driver; everything goes through `lib/db`.

---

## Data

Scraped from the live site and committed to `src/data/`:

| | Count |
| --- | --- |
| Listings | 81 |
| Experiences | 36 |
| Services | 35 |
| Reviews | 402 |
| Hosts | 152 |
| Destinations | 29 |
| Amenities (15 groups) | 88 |
| Images | 2,014 (132MB WebP) |

Each listing carries the real title, description, highlights, sleeping arrangements,
grouped amenities, house rules, coordinates, per-category ratings and host profile.

The environment is deterministic: "today" is pinned to `2026-09-14` in
`lib/format/date.ts`, so availability, pricing and copy are identical on every run.

---

## How the pixel accuracy was achieved

Nothing was approximated by eye.

**Design tokens** were extracted from Airbnb's production stylesheet — 541 CSS custom
properties, including the palette (`rausch #FF385C`, `hof #222222`, `foggy #6A6A6A`,
`deco #DDDDDD`, `faint #F7F7F7`, `arches #C13515`, `spruce #008A05`) and the full
elevation and radius scales. They live in `globals.css` under `@theme`.

**Icons** — 21 SVGs lifted from the live DOM with their path data unchanged, generated
into components by `tools/gen-icons.mjs`.

**Layout** came from reading computed styles off the real site:

| Element | Measured |
| --- | --- |
| Header row | 96px tall, 48px gutter |
| Content gutter | 84px |
| Rail card | 181.7 × 214.6, 12px gap, 7 columns |
| Card image | 20:19, 20px radius |
| Card title / price row | 13px/16px w500 · 12px/16px w400 `#6C6C6C` |
| Listing `h1` | 26px/30px w500 |
| Section `h2` | 22px/26px w500 |
| Gallery | 1120 × 500 |
| Booking sidebar | 372px |
| CTA button | 48px tall, fully rounded |
| Compact search pill | 449 × 46 |

**DOM contract** — the real `data-testid` and `data-section-id` values are reused
verbatim (`card-container`, `listing-card-title`, `listing-card-subtitle`,
`price-availability-row`, `listing-card-save-button`, `little-search-location`,
`BOOK_IT_SIDEBAR`, `AMENITIES_DEFAULT`, `REVIEWS_DEFAULT`, …), so selectors written
against airbnb.co.in work here unchanged.

**Offline** is enforced, not assumed: `tools/shot.mjs` fails the run if a page makes any
external request or logs a console error.

---

## Architecture

Routes stay thin; no page is one big file.

```
src/
  app/            # routes ONLY — compose components, fetch data, export metadata
    api/          # route handlers (bookings, wishlists, reviews)
  components/
    layout/       # Header, Footer, NavTabs, UserMenu, MobileBottomNav
    search/       # SearchBar, LocationPanel, DatePanel, GuestPanel, CompactSearch
    filters/      # FiltersModal, PriceHistogram, FilterPills
    listing/      # ListingCard, CardCarousel, WishlistButton, RailSection
    room/         # Gallery, AmenitiesSection, ReviewsSection, HostCard, BookItSidebar, …
    booking/      # CheckoutForm, BookItSimple
    auth/ host/   # LoginPanel, HostWizard
    ui/           # Button, Rating, Pagination, StaticMap, icons
  lib/
    db/           # Mongo client + static catalogue + fallback store
    domain/       # pure logic: pricing, search, searchParams
    format/       # currency, dates
  data/           # generated JSON — the committed offline source of truth
  types/
```

Conventions:

- One component per file; named export matching the filename.
- A component over ~200 lines is a smell — split it.
- Server Components by default; `"use client"` only for genuine interactivity.
- Pure logic (pricing, filtering, date maths) lives in `lib/domain` and is testable
  without React. No business logic in JSX, no inline `fetch` in components.
- Tailwind v4 with CSS-first config. Use the extracted tokens, not arbitrary hex values.
- Next.js 16: `params` and `searchParams` are async.

`CLAUDE.md` mirrors these rules for AI coding agents. It is git-ignored because
`next dev` regenerates it per-machine, so this section is the source of truth.

---

## Tooling

Everything under `tools/` is standalone Node — install once with `cd tools && npm install`.

**Rebuild the dataset** (in order):

```bash
node scrape-home.mjs        # home rails
node scrape-rooms.mjs       # listing detail pages
node scrape-tabs.mjs        # /homes /experiences /services
node scrape-exp-svc.mjs     # experience + service detail pages
node download-images.mjs    # fetch every asset into public/
node optimize-images.mjs    # convert to WebP (~50% smaller)
node normalize.mjs          # capture/ -> src/data/
node extract-icons.mjs && node gen-icons.mjs
```

**Verify and measure:**

| Script | Use |
| --- | --- |
| `shot.mjs <path…>` | Screenshot the running app; fails on console errors or external requests |
| `shot-mobile.mjs <path…>` | Same at 390 × 844, reporting horizontal overflow |
| `docs-shots.mjs` | Regenerate every screenshot in this README |
| `capture-metrics.mjs` | Re-measure computed styles on the live site |
| `measure-rail.mjs` / `measure-card.mjs` | Re-measure rail and card geometry |
| `extract-tokens.mjs` | Re-mine design tokens from Airbnb's stylesheet |
| `dump-mongo.mjs` | Dump an Atlas database to JSON |

---

## Notes and limits

- **Fonts.** Airbnb Cereal is proprietary and self-hosted here for visual fidelity. Swap
  `public/fonts/` and the `--font-sans` token before any public deployment.
- **Images** are real Airbnb listing photos, kept for realism — not for redistribution.
- **Maps** are generated vector art, not real cartography.
- `capture/` (~43MB of raw scrape output) is git-ignored and regenerable;
  `public/images` (132MB) is committed because the app needs it offline.

---

Built with ❤️ by **Sneha Kar**.
