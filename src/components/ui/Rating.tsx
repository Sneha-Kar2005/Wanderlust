import { StarIcon } from "./icons";
import { cn } from "@/lib/cn";

export interface RatingProps {
  value: number | null;
  /** When given, renders "4.94 (35)" instead of a bare score. */
  count?: number | null;
  size?: number;
  className?: string;
}

/**
 * Airbnb renders the score next to a filled star, with the accessible label
 * spelled out for screen readers.
 */
export function Rating({ value, count, size = 12, className }: RatingProps) {
  if (value === null) return null;
  const score = value.toFixed(value % 1 === 0 ? 1 : 2);
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1", className)}>
      <StarIcon size={size} aria-hidden="true" />
      <span aria-hidden="true">
        {score}
        {count ? ` (${count})` : ""}
      </span>
      <span className="sr-only">
        {`${score} out of 5 average rating`}
        {count ? `, ${count} reviews` : ""}
      </span>
    </span>
  );
}
