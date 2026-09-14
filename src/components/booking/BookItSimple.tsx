"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format/currency";
import { TODAY, addDays, formatShort } from "@/lib/format/date";
import { StarIcon } from "@/components/ui/icons";

export interface BookItSimpleProps {
  id: string;
  kind: "experience" | "service";
  price: number;
  unit: string;
  rating: number | null;
  reviewCount: number;
  cancellation: string | null;
}

/** Booking card for experiences and services: per-guest pricing, one date. */
export function BookItSimple({
  id,
  kind,
  price,
  unit,
  rating,
  reviewCount,
  cancellation,
}: BookItSimpleProps) {
  const router = useRouter();
  const [date, setDate] = useState(addDays(TODAY, 3));
  const [guests, setGuests] = useState(1);

  const total = price * (unit === "group" ? 1 : guests);

  return (
    <aside
      data-section-id={
        kind === "experience"
          ? "ExperiencesBookItController-sidebar"
          : "ServicesBookItController-sidebar"
      }
      className="sticky top-28 w-full rounded-xl border border-[#dddddd] bg-white p-6 shadow-[var(--shadow-elevation-2)]"
    >
      <p className="text-[22px] leading-[26px] text-[#222]">
        <span className="text-[16px]">From </span>
        <span className="font-semibold">{formatPrice(price)}</span>
        <span className="text-[16px]"> / {unit}</span>
      </p>

      {rating !== null && (
        <p className="mt-1 flex items-center gap-1.5 text-[14px] leading-[18px] text-[#222]">
          <StarIcon size={12} />
          {rating.toFixed(1)}
          <span aria-hidden="true">·</span>
          <span className="text-[#6a6a6a]">{reviewCount} reviews</span>
        </p>
      )}

      <div className="mt-6 rounded-lg border border-[#b0b0b0]">
        <label className="relative block px-3 py-2.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#222]">
            Date
          </span>
          <span className="block text-[14px] leading-[18px] text-[#222]">
            {formatShort(date)}
          </span>
          <input
            type="date"
            aria-label="Date"
            value={date}
            min={TODAY}
            onChange={(e) => setDate(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
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
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} guest{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        data-testid={
          kind === "experience"
            ? "ExperiencesBookItController-sidebar-button"
            : "ServicesBookItController-sidebar-button"
        }
        onClick={() =>
          router.push(
            `/book/${kind === "experience" ? "experiences" : "services"}/${id}?date=${date}&guests=${guests}`,
          )
        }
        className="mt-4 h-12 w-full rounded-lg bg-rausch-gradient text-[16px] font-medium leading-5 text-white transition hover:brightness-95"
      >
        Request to book
      </button>

      {cancellation && (
        <p className="mt-4 text-center text-[14px] leading-[18px] text-[#6a6a6a]">
          {cancellation}
        </p>
      )}

      <div className="mt-6 flex justify-between border-t border-[#dddddd] pt-4 text-[16px] font-semibold leading-5 text-[#222]">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </aside>
  );
}
