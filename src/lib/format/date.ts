/**
 * Date helpers. The environment is deterministic: "today" is fixed so that
 * repeated agent runs see identical availability, prices and copy.
 */

/** The environment's fixed "today". Everything date-related derives from this. */
export const TODAY = "2026-09-14";

export function today(): Date {
  return parseISO(TODAY);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseISO(checkOut).getTime() - parseISO(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-09-21" -> "21 Sept" */
export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

/** "2026-09-21" -> "21 September 2026" */
export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Airbnb collapses same-month ranges: "21–26 Sept", otherwise "28 Sept – 3 Oct".
 */
export function formatDateRange(checkIn: string, checkOut: string): string {
  const a = parseISO(checkIn);
  const b = parseISO(checkOut);
  if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) {
    return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS_SHORT[a.getUTCMonth()]}`;
  }
  return `${formatShort(checkIn)} – ${formatShort(checkOut)}`;
}

/** Month grid for a calendar, padded to whole weeks starting Monday. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // getUTCDay(): 0=Sun. Airbnb's IN calendar starts Monday.
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISO(new Date(Date.UTC(year, month, d))));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_LONG[month]} ${year}`;
}

export function isBefore(a: string, b: string): boolean {
  return parseISO(a).getTime() < parseISO(b).getTime();
}

export function isSameOrAfter(a: string, b: string): boolean {
  return parseISO(a).getTime() >= parseISO(b).getTime();
}
