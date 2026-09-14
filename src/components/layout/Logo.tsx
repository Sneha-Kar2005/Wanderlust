import Link from "next/link";
import { AirbnbWordmarkIcon, AirbnbBeloIcon } from "@/components/ui/icons";

/**
 * The wordmark collapses to the Bélo symbol below `lg`, exactly as on the
 * production site. Measured width at desktop: 102 x 32.
 */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Airbnb homepage"
      className="flex shrink-0 items-center text-rausch"
    >
      <AirbnbWordmarkIcon
        size={undefined}
        width={102}
        height={32}
        className="hidden lg:block"
      />
      <AirbnbBeloIcon
        size={undefined}
        width={30}
        height={32}
        className="block lg:hidden"
      />
    </Link>
  );
}
