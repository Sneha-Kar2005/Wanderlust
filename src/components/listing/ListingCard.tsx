import Link from "next/link";
import type { Listing } from "@/types";
import { StarIcon } from "@/components/ui/icons";
import { CardCarousel } from "./CardCarousel";
import { WishlistButton } from "./WishlistButton";
import { formatPrice } from "@/lib/format/currency";
import { totalForNights } from "@/lib/domain/pricing";
import { formatDateRange } from "@/lib/format/date";

export interface ListingCardProps {
  listing: Listing;
  /** "rail" = 181.7 x 214.6 home card; "grid" = taller search-result card. */
  layout?: "rail" | "grid";
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  priority?: boolean;
}

/**
 * Metrics taken from production at 1512px:
 *   card 181.7 x 214.6 · image 20:19 · title 13/16 w500 #222 at y=180.6
 *   price row 12/16 w400 #6c6c6c at y=198.6 · save button 32px at 8,8
 */
export function ListingCard({
  listing,
  layout = "rail",
  checkIn,
  checkOut,
  nights = 2,
  priority = false,
}: ListingCardProps) {
  const grid = layout === "grid";

  // Rails reproduce the exact all-in total the live site quoted; anything
  // with caller-supplied dates is re-quoted from the base nightly rate.
  const useCardPrice =
    !grid && listing.cardTotal !== null && nights === listing.cardNights;
  const shownNights = useCardPrice ? listing.cardNights : nights;
  const total = useCardPrice
    ? (listing.cardTotal as number)
    : totalForNights(listing.pricePerNight, nights);
  const nightWord = shownNights === 1 ? "night" : "nights";

  return (
    <Link
      href={`/rooms/${listing.id}`}
      data-testid="card-container"
      aria-labelledby={`title_${listing.id}`}
      /* `relative` keeps absolutely-positioned descendants (notably the
         sr-only spans) inside the rail scroller. Without a positioned
         ancestor they resolve against the initial containing block and
         inflate the document's scroll width. */
      className="group relative block"
    >
      <div className="relative">
        <CardCarousel
          photos={listing.photos}
          alt={listing.title}
          aspect={grid ? "square" : "card"}
          sizes={
            grid
              ? "(max-width: 768px) 100vw, 33vw"
              : "(max-width: 744px) 50vw, (max-width: 1128px) 25vw, 15vw"
          }
          priority={priority}
        />
        <WishlistButton listingId={listing.id} />
        {listing.guestFavourite && (
          <span
            data-testid="listing-card-badge"
            className="absolute left-2 top-2 z-10 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium leading-4 text-[#222] shadow-[var(--shadow-tertiary)]"
          >
            Guest favourite
          </span>
        )}
      </div>

      {grid ? (
        <div className="pt-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              id={`title_${listing.id}`}
              data-testid="listing-card-title"
              className="truncate text-[15px] font-medium leading-[19px] text-[#222]"
            >
              {listing.cardTitle}
            </h3>
            {listing.rating !== null && (
              <span className="flex shrink-0 items-center gap-1 text-[15px] leading-[19px] text-[#222]">
                <StarIcon size={12} />
                {listing.rating.toFixed(2)} ({listing.reviewCount})
              </span>
            )}
          </div>
          <p
            data-testid="listing-card-name"
            className="truncate text-[15px] leading-[19px] text-[#6c6c6c]"
          >
            {listing.title}
          </p>
          <p
            data-testid="listing-card-subtitle"
            className="truncate text-[15px] leading-[19px] text-[#6c6c6c]"
          >
            {listing.bedrooms > 0
              ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}`
              : "Studio"}
            {` · ${listing.beds} bed${listing.beds === 1 ? "" : "s"}`}
            {` · ${listing.bathrooms} bathroom${listing.bathrooms === 1 ? "" : "s"}`}
          </p>
          {checkIn && checkOut && (
            <p className="truncate text-[15px] leading-[19px] text-[#6c6c6c]">
              {formatDateRange(checkIn, checkOut)}
            </p>
          )}
          <p
            data-testid="price-availability-row"
            className="pt-0.5 text-[15px] leading-[19px] text-[#222]"
          >
            <span className="font-medium underline underline-offset-2">
              {formatPrice(total)}
            </span>
            {` for ${shownNights} ${nightWord}`}
          </p>
        </div>
      ) : (
        /* Rail card: title, then one 12px row of "price for N nights · rating" */
        <div className="px-1 pt-2">
          <h3
            id={`title_${listing.id}`}
            data-testid="listing-card-title"
            className="truncate text-[13px] font-medium leading-4 text-[#222]"
          >
            {listing.cardTitle}
          </h3>
          <p
            data-testid="price-availability-row"
            className="flex items-center gap-1 truncate text-[12px] leading-4 text-[#6c6c6c]"
          >
            <span className="truncate">
              <span className="font-medium text-[#222]">{formatPrice(total)}</span>
              {` for ${shownNights} ${nightWord}`}
            </span>
            {listing.rating !== null && (
              <>
                <span aria-hidden="true" className="font-bold text-[#c1c1c1]">
                  ·
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-[#222]">
                  <StarIcon size={10} />
                  {listing.rating.toFixed(listing.rating % 1 === 0 ? 1 : 2)}
                </span>
                <span className="sr-only">
                  {listing.rating} out of 5 average rating
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </Link>
  );
}
