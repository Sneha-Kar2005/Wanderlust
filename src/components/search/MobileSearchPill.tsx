"use client";

import { useState } from "react";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { SearchBar } from "./SearchBar";
import type { GuestCounts } from "@/types";

export interface MobileSearchPillProps {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: GuestCounts;
}

/**
 * Below `md` Airbnb collapses the whole search bar into a single pill that
 * opens a full-screen sheet.
 */
export function MobileSearchPill({
  location = "",
  checkIn = "",
  checkOut = "",
  guests,
}: MobileSearchPillProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid="little-search"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center gap-3 rounded-full border border-[#dddddd] bg-white px-4 shadow-[var(--shadow-elevation-1)]"
      >
        <SearchIcon size={14} strokeWidth={3} />
        <span className="min-w-0 text-left">
          <span className="block truncate text-[14px] font-medium leading-[18px] text-[#222]">
            {location || "Start your search"}
          </span>
          {(checkIn || guests?.adults) && (
            <span className="block truncate text-[12px] leading-4 text-[#6a6a6a]">
              {[checkIn && checkOut ? "Dates set" : "Any week", "Add guests"].join(" · ")}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-white">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close search"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dddddd]"
            >
              <CloseIcon size={12} />
            </button>
            <span className="text-[14px] font-medium leading-[18px] text-[#222]">
              Search
            </span>
            <span className="w-8" />
          </div>
          <div className="px-4 pb-10">
            <SearchBar
              initialLocation={location}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={guests}
            />
          </div>
        </div>
      )}
    </>
  );
}
