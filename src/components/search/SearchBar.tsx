"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatDateRange } from "@/lib/format/date";
import type { GuestCounts } from "@/types";
import { LocationPanel } from "./LocationPanel";
import { DatePanel } from "./DatePanel";
import { GuestPanel } from "./GuestPanel";
import { useClickOutside } from "@/lib/useClickOutside";

type Field = "location" | "dates" | "guests" | null;

const EMPTY_GUESTS: GuestCounts = { adults: 0, children: 0, infants: 0, pets: 0 };

export interface SearchBarProps {
  initialLocation?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: GuestCounts;
}

/**
 * The expanded home-page search bar: 3 segments plus a 48px submit button.
 * Opening a segment lifts it to white with elevation-2 and dims the rest.
 */
export function SearchBar({
  initialLocation = "",
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = EMPTY_GUESTS,
}: SearchBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState<Field>(null);
  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState<GuestCounts>(initialGuests);

  const barRef = useRef<HTMLDivElement>(null);
  useClickOutside(barRef, () => setOpen(null));

  const guestTotal = guests.adults + guests.children;
  const guestLabel = guestTotal
    ? `${guestTotal} guest${guestTotal === 1 ? "" : "s"}${guests.infants ? `, ${guests.infants} infant${guests.infants === 1 ? "" : "s"}` : ""}`
    : "Add guests";
  const dateLabel = checkIn && checkOut ? formatDateRange(checkIn, checkOut) : "Add dates";

  function submit() {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (guests.adults) params.set("adults", String(guests.adults));
    if (guests.children) params.set("children", String(guests.children));
    if (guests.infants) params.set("infants", String(guests.infants));
    if (guests.pets) params.set("pets", String(guests.pets));
    const slug = location.trim() ? encodeURIComponent(location.trim().replace(/\s+/g, "-")) : "all";
    const qs = params.toString();
    setOpen(null);
    router.push(`/s/${slug}/homes${qs ? `?${qs}` : ""}`);
  }

  const segment = (field: Exclude<Field, null>, extra?: string) =>
    cn(
      "relative flex flex-col justify-center rounded-full text-left transition",
      open === field
        ? "bg-white shadow-[var(--shadow-elevation-2)]"
        : open === null
          ? "hover:bg-[#ebebeb]"
          : "hover:bg-[#dddddd]",
      extra,
    );

  return (
    <div
      ref={barRef}
      data-testid="structured-search-input"
      className={cn(
        "relative mx-auto flex h-16 w-full max-w-[848px] items-center rounded-full border border-[#dddddd] bg-white",
        open ? "bg-[#ebebeb]" : "shadow-[var(--shadow-elevation-1)]",
      )}
    >
      {/* -------- Where -------- */}
      <div className={segment("location", "flex-[1.2] py-2 pl-8 pr-4")}>
        <label
          htmlFor="bigsearch-query-location-input"
          className="text-[12px] font-medium leading-4 text-[#222]"
        >
          Where
        </label>
        <input
          id="bigsearch-query-location-input"
          data-testid="structured-search-input-field-query"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setOpen("location")}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Search destinations"
          autoComplete="off"
          className="w-full bg-transparent text-[14px] leading-[18px] text-[#222] outline-none placeholder:text-[#6a6a6a]"
        />
        {open === "location" && (
          <LocationPanel
            query={location}
            onSelect={(name) => {
              setLocation(name);
              setOpen("dates");
            }}
          />
        )}
      </div>

      <Divider hidden={open === "location" || open === "dates"} />

      {/* -------- When -------- */}
      <button
        type="button"
        data-testid="structured-search-input-field-dates"
        onClick={() => setOpen(open === "dates" ? null : "dates")}
        className={segment("dates", "flex-1 px-6 py-2")}
      >
        <span className="text-[12px] font-medium leading-4 text-[#222]">When</span>
        <span
          className={cn(
            "truncate text-[14px] leading-[18px]",
            checkIn && checkOut ? "text-[#222]" : "text-[#6a6a6a]",
          )}
        >
          {dateLabel}
        </span>
      </button>

      {open === "dates" && (
        <DatePanel
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(ci, co) => {
            setCheckIn(ci);
            setCheckOut(co);
            if (ci && co) setOpen("guests");
          }}
        />
      )}

      <Divider hidden={open === "dates" || open === "guests"} />

      {/* -------- Who -------- */}
      <div className={segment("guests", "flex-1 py-2 pl-6 pr-2")}>
        <button
          type="button"
          data-testid="structured-search-input-field-guests"
          onClick={() => setOpen(open === "guests" ? null : "guests")}
          className="flex w-full flex-col text-left"
        >
          <span className="text-[12px] font-medium leading-4 text-[#222]">Who</span>
          <span
            className={cn(
              "truncate text-[14px] leading-[18px]",
              guestTotal ? "text-[#222]" : "text-[#6a6a6a]",
            )}
          >
            {guestLabel}
          </span>
        </button>
        {open === "guests" && <GuestPanel value={guests} onChange={setGuests} />}
      </div>

      {/* -------- Submit -------- */}
      <button
        type="button"
        data-testid="structured-search-input-search-button"
        onClick={submit}
        aria-label="Search"
        className={cn(
          "mr-2 flex h-12 shrink-0 items-center gap-2 rounded-full bg-rausch-gradient px-4 text-white transition-all",
          open ? "w-auto" : "w-12 justify-center px-0",
        )}
      >
        <SearchIcon size={16} strokeWidth={3.5} />
        {open && <span className="text-[16px] font-medium leading-5">Search</span>}
      </button>
    </div>
  );
}

function Divider({ hidden }: { hidden: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-8 w-px shrink-0 bg-[#dddddd] transition-opacity",
        hidden && "opacity-0",
      )}
    />
  );
}
