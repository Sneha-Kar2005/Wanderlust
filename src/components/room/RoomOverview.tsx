import type { Listing } from "@/types";
import { StarIcon } from "@/components/ui/icons";

export function RoomOverview({ listing }: { listing: Listing }) {
  const parts = [
    `${listing.guests} guest${listing.guests === 1 ? "" : "s"}`,
    listing.bedrooms > 0
      ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}`
      : "Studio",
    `${listing.beds} bed${listing.beds === 1 ? "" : "s"}`,
    `${listing.bathrooms} bathroom${listing.bathrooms === 1 ? "" : "s"}`,
  ];

  return (
    <section data-section-id="OVERVIEW_DEFAULT_V2" className="py-8">
      <h2 className="text-[22px] font-semibold leading-[26px] text-[#222]">
        {listing.subtitle}
      </h2>
      <p className="mt-1 text-[16px] leading-5 text-[#222]">{parts.join(" · ")}</p>
      {listing.rating !== null && (
        <p className="mt-2 flex items-center gap-1.5 text-[16px] leading-5 text-[#222]">
          <StarIcon size={14} />
          <span className="font-medium">{listing.rating.toFixed(2)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium underline underline-offset-2">
            {listing.reviewCount} {listing.reviewCount === 1 ? "review" : "reviews"}
          </span>
        </p>
      )}
    </section>
  );
}
