import type { PriceLine } from "@/types";
import { nightsBetween } from "@/lib/format/date";

/**
 * Airbnb India shows an all-inclusive price ("Prices include all fees").
 * The breakdown below reproduces the line items shown on the checkout page.
 */

export const CLEANING_FEE_RATE = 0.08;
export const SERVICE_FEE_RATE = 0.142;
export const GST_RATE = 0.18;

/** Weekly (7+ nights) and monthly (28+ nights) discounts, as Airbnb applies them. */
export function stayDiscountRate(nights: number): number {
  if (nights >= 28) return 0.18;
  if (nights >= 7) return 0.08;
  return 0;
}

export interface QuoteInput {
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
}

export interface Quote {
  nights: number;
  lines: PriceLine[];
  total: number;
}

/**
 * Deterministic: the same listing and dates always produce the same quote.
 */
export function quote({ pricePerNight, checkIn, checkOut }: QuoteInput): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) return { nights: 0, lines: [], total: 0 };

  const base = pricePerNight * nights;
  const discountRate = stayDiscountRate(nights);
  const discount = Math.round(base * discountRate);
  const cleaning = Math.round(pricePerNight * CLEANING_FEE_RATE * Math.min(nights, 3));
  const service = Math.round((base - discount) * SERVICE_FEE_RATE);
  const taxable = base - discount + cleaning + service;
  const tax = Math.round(taxable * GST_RATE);

  const lines: PriceLine[] = [
    {
      label: `₹${pricePerNight.toLocaleString("en-IN")} x ${nights} ${nights === 1 ? "night" : "nights"}`,
      amount: base,
      kind: "base",
    },
  ];
  if (discount > 0) {
    lines.push({
      label: nights >= 28 ? "Monthly stay discount" : "Weekly stay discount",
      amount: -discount,
      kind: "discount",
    });
  }
  lines.push({ label: "Cleaning fee", amount: cleaning, kind: "fee" });
  lines.push({ label: "Airbnb service fee", amount: service, kind: "fee" });
  lines.push({ label: "Taxes", amount: tax, kind: "tax" });

  const total = base - discount + cleaning + service + tax;
  return { nights, lines, total };
}

/** The all-in nightly rate shown on cards when dates are selected. */
export function totalForNights(pricePerNight: number, nights: number): number {
  if (nights <= 0) return 0;
  const checkIn = "2026-09-21";
  const checkOut = new Date(Date.UTC(2026, 8, 21 + nights)).toISOString().slice(0, 10);
  return quote({ pricePerNight, checkIn, checkOut }).total;
}
