"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@/types";
import { formatPrice } from "@/lib/format/currency";
import { quote } from "@/lib/domain/pricing";
import { TODAY, addDays, formatShort } from "@/lib/format/date";
import { cn } from "@/lib/cn";

export interface BookItSidebarProps {
  listing: Listing;
  checkIn?: string;
  checkOut?: string;
}

/**
 * The sticky 372px booking card. With no dates it shows "Add dates for
 * prices" and a "Check availability" CTA, exactly as production does;
 * once both dates are set it flips to a priced breakdown and "Reserve".
 */
export function BookItSidebar({ listing, checkIn, checkOut }: BookItSidebarProps) {
  const router = useRouter();
  const [ci, setCi] = useState(checkIn ?? "");
  const [co, setCo] = useState(checkOut ?? "");
  const [guests, setGuests] = useState(1);

  const priced = Boolean(ci && co && ci < co);
  const q = priced
    ? quote({ pricePerNight: listing.pricePerNight, checkIn: ci, checkOut: co })
    : null;

  function onCta() {
    if (!priced) {
      // Mirror production: seed a plausible stay so the calendar opens filled.
      setCi(addDays(TODAY, 7));
      setCo(addDays(TODAY, 12));
      return;
    }
    const params = new URLSearchParams({
      checkin: ci,
      checkout: co,
      adults: String(guests),
    });
    router.push(`/book/stays/${listing.id}?${params}`);
  }

  return (
    <aside
      data-section-id="BOOK_IT_SIDEBAR"
      data-testid="book-it-default"
      className="sticky top-28 w-full rounded-xl border border-[#dddddd] bg-white p-6 shadow-[var(--shadow-elevation-2)]"
    >
      {q ? (
        <p className="mb-6 text-[22px] leading-[26px] text-[#222]">
          <span className="font-semibold">{formatPrice(q.total)}</span>
          <span className="text-[16px] leading-5">
            {" "}
            for {q.nights} {q.nights === 1 ? "night" : "nights"}
          </span>
        </p>
      ) : (
        <p className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
          Add dates for prices
        </p>
      )}

      <div className="mb-4 rounded-lg border border-[#b0b0b0]">
        <div className="grid grid-cols-2">
          <DateField
            testId="change-dates-checkIn"
            label="Check-in"
            value={ci}
            min={TODAY}
            onChange={setCi}
            className="border-r border-[#b0b0b0]"
          />
          <DateField
            testId="change-dates-checkOut"
            label="Checkout"
            value={co}
            min={ci ? addDays(ci, 1) : addDays(TODAY, 1)}
            onChange={setCo}
          />
        </div>
        <label className="block border-t border-[#b0b0b0] px-3 py-2.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#222]">
            Guests
          </span>
          <select
            aria-label="Guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-transparent text-[14px] leading-[18px] text-[#222] outline-none"
          >
            {Array.from({ length: listing.guests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} guest{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        data-testid="homes-pdp-cta-btn"
        onClick={onCta}
        className="h-12 w-full rounded-lg bg-rausch-gradient text-[16px] font-medium leading-5 text-white transition hover:brightness-95"
      >
        {priced ? "Reserve" : "Check availability"}
      </button>

      {q && (
        <>
          <p className="mt-4 text-center text-[14px] leading-[18px] text-[#222]">
            You won&apos;t be charged yet
          </p>
          <div className="mt-6 space-y-3">
            {q.lines.map((line) => (
              <div
                key={line.label}
                className="flex justify-between gap-4 text-[16px] leading-5"
              >
                <span
                  className={cn(
                    line.kind === "discount"
                      ? "text-spruce"
                      : "text-[#222] underline underline-offset-2",
                  )}
                >
                  {line.label}
                </span>
                <span
                  className={cn(
                    "shrink-0",
                    line.kind === "discount" ? "text-spruce" : "text-[#222]",
                  )}
                >
                  {line.amount < 0 ? "-" : ""}
                  {formatPrice(Math.abs(line.amount))}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-[#dddddd] pt-3 text-[16px] font-semibold leading-5 text-[#222]">
              <span>Total</span>
              <span>{formatPrice(q.total)}</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function DateField({
  testId,
  label,
  value,
  min,
  onChange,
  className,
}: {
  testId: string;
  label: string;
  value: string;
  min: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("relative block px-3 py-2.5", className)}>
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#222]">
        {label}
      </span>
      <span
        className={cn(
          "block text-[14px] leading-[18px]",
          value ? "text-[#222]" : "text-[#6a6a6a]",
        )}
      >
        {value ? formatShort(value) : "Add date"}
      </span>
      <input
        type="date"
        data-testid={testId}
        aria-label={label}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}
