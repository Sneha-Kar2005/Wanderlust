"use client";

import { useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { formatDateRange } from "@/lib/format/date";
import type { GuestCounts } from "@/types";
import { SearchBar } from "./SearchBar";

export interface CompactSearchProps {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: GuestCounts;
  /** Small product-tab icon shown at the left of the pill when collapsed. */
  icon?: React.ReactNode;
  /** "Anytime" on the home page, "Any week" on search results. */
  datesLabel?: string;
  /** Shown in place of the location when nothing is set. */
  placeholder?: string;
}

/**
 * The 449 x 46 pill shown on inner pages. Clicking it expands the full
 * search bar in an overlay, matching production behaviour.
 */
export function CompactSearch({
  location = "",
  checkIn = "",
  checkOut = "",
  guests,
  icon,
  datesLabel = "Any week",
  placeholder = "Anywhere",
}: CompactSearchProps) {
  const [expanded, setExpanded] = useState(false);

  const guestTotal = (guests?.adults ?? 0) + (guests?.children ?? 0);

  if (expanded) {
    return (
      <>
        <div
          className="fixed inset-0 top-20 z-30 bg-black/20"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 top-full z-40 bg-white px-6 pb-5 pt-2 shadow-[var(--shadow-elevation-2)] lg:px-12">
          <SearchBar
            initialLocation={location}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests}
          />
        </div>
      </>
    );
  }

  return (
    <button
      type="button"
      data-testid="little-search"
      onClick={() => setExpanded(true)}
      className="flex h-[46px] items-center rounded-full border border-[#dddddd] bg-white py-1 pl-1.5 pr-1.5 shadow-[var(--shadow-elevation-1)] transition hover:shadow-[var(--shadow-elevation-2)]"
    >
      {icon && <span className="ml-1 flex shrink-0 items-center">{icon}</span>}
      <span
        data-testid="little-search-location"
        className="truncate px-3 text-[14px] font-medium leading-[18px] text-[#222]"
      >
        {location || placeholder}
      </span>
      <span aria-hidden="true" className="h-6 w-px bg-[#dddddd]" />
      <span
        data-testid="little-search-date"
        className="truncate px-3 text-[14px] font-medium leading-[18px] text-[#222]"
      >
        {checkIn && checkOut ? formatDateRange(checkIn, checkOut) : datesLabel}
      </span>
      <span aria-hidden="true" className="h-6 w-px bg-[#dddddd]" />
      <span
        data-testid="little-search-guests"
        className="truncate px-3 text-[14px] leading-[18px] text-[#6a6a6a]"
      >
        {guestTotal ? `${guestTotal} guest${guestTotal === 1 ? "" : "s"}` : "Add guests"}
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rausch-gradient text-white">
        <SearchIcon size={12} strokeWidth={4} />
      </span>
    </button>
  );
}
