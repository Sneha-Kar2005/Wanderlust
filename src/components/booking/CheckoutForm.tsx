"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@/types";
import { formatLong } from "@/lib/format/date";
import { cn } from "@/lib/cn";

export interface CheckoutFormProps {
  listing: Listing;
  checkIn: string;
  checkOut: string;
  adults: number;
  /** Named `childrenCount`, not `children`: React reserves that prop name. */
  childrenCount: number;
  infants: number;
  pets: number;
}

/**
 * Simulated checkout: it validates and persists a booking, but never
 * collects or transmits real payment credentials.
 */
export function CheckoutForm({
  listing,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  infants,
  pets,
}: CheckoutFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          checkIn,
          checkOut,
          adults,
          children: childrenCount,
          infants,
          pets,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(`/trips?confirmed=${data.booking.confirmationCode}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <section className="border-b border-[#ebebeb] pb-8">
        <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
          Your trip
        </h2>

        <Row label="Dates" value={`${formatLong(checkIn)} – ${formatLong(checkOut)}`} />
        <Row
          label="Guests"
          value={[
            `${adults + childrenCount} guest${adults + childrenCount === 1 ? "" : "s"}`,
            infants ? `${infants} infant${infants === 1 ? "" : "s"}` : null,
            pets ? `${pets} pet${pets === 1 ? "" : "s"}` : null,
          ]
            .filter(Boolean)
            .join(", ")}
        />
      </section>

      <section className="border-b border-[#ebebeb] py-8">
        <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
          Pay with
        </h2>

        <div className="mb-6 flex gap-3">
          {(["card", "upi"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={method === m}
              onClick={() => setMethod(m)}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-[14px] leading-[18px] transition",
                method === m
                  ? "border-[#222] bg-[#f7f7f7] font-medium text-[#222]"
                  : "border-[#dddddd] text-[#222] hover:border-[#222]",
              )}
            >
              {m === "card" ? "Credit or debit card" : "UPI"}
            </button>
          ))}
        </div>

        {method === "card" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Card number" placeholder="•••• •••• •••• ••••" className="sm:col-span-2" />
            <Field label="Expiry" placeholder="MM / YY" />
            <Field label="CVV" placeholder="•••" />
            <Field label="Name on card" placeholder="" className="sm:col-span-2" />
          </div>
        ) : (
          <Field label="UPI ID" placeholder="name@bank" />
        )}
      </section>

      <section className="py-8">
        <h2 className="mb-4 text-[22px] font-semibold leading-[26px] text-[#222]">
          Cancellation policy
        </h2>
        <p className="text-[16px] leading-6 text-[#222]">
          Free cancellation before {formatLong(checkIn)}. After that, the reservation is
          non-refundable.
        </p>
      </section>

      {error && (
        <p role="alert" className="mb-4 text-[14px] leading-[18px] text-arches">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 rounded-lg bg-rausch-gradient px-8 text-[16px] font-medium leading-5 text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {submitting ? "Confirming…" : "Confirm and pay"}
      </button>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-[16px] font-medium leading-5 text-[#222]">{label}</span>
      <span className="text-right text-[16px] leading-5 text-[#222]">{value}</span>
    </div>
  );
}

function Field({
  label,
  placeholder,
  className,
}: {
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("block rounded-lg border border-[#b0b0b0] px-3 py-2", className)}>
      <span className="block text-[12px] leading-4 text-[#6a6a6a]">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-transparent text-[16px] leading-5 text-[#222] outline-none"
      />
    </label>
  );
}
