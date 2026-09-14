/** Indian-locale currency formatting, matching airbnb.co.in output exactly. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** 16205 -> "₹16,205" */
export function formatPrice(amount: number): string {
  return inr.format(Math.round(amount));
}

/** 16205 -> "16,205" (no symbol) */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(amount),
  );
}

/** "₹16,205 for 2 nights" */
export function formatTotalForNights(total: number, nights: number): string {
  return `${formatPrice(total)} for ${nights} ${nights === 1 ? "night" : "nights"}`;
}

/** "₹8,102 night" — the per-night line on a listing card */
export function formatPerNight(perNight: number): string {
  return `${formatPrice(perNight)} night`;
}

/** Parses "₹16,205" back to 16205. Returns null when unparseable. */
export function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}
