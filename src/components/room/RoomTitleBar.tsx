import type { Listing } from "@/types";
import { ShareIcon } from "@/components/ui/icons";
import { WishlistButton } from "@/components/listing/WishlistButton";

export function RoomTitleBar({ listing }: { listing: Listing }) {
  return (
    <div
      data-section-id="TITLE_DEFAULT"
      className="flex items-end justify-between gap-4 pt-8"
    >
      <h1 className="text-[26px] font-medium leading-[30px] text-[#222]">
        {listing.title}
      </h1>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[14px] font-medium leading-[18px] text-[#222] underline underline-offset-2 transition hover:bg-[#f7f7f7]"
        >
          <ShareIcon size={14} />
          Share
        </button>
        <WishlistButton listingId={listing.id} variant="pdp" />
      </div>
    </div>
  );
}
