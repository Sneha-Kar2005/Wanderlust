import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { HomeHeader } from "./HomeHeader";
import { CompactSearch } from "@/components/search/CompactSearch";
import { MobileSearchPill } from "@/components/search/MobileSearchPill";
import type { GuestCounts } from "@/types";

export interface HeaderProps {
  /** "full" = home/tab pages (tabs + search bar, collapsing on scroll);
   *  "compact" = inner pages, which show the pill straight away. */
  variant?: "full" | "compact";
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: GuestCounts;
}

/**
 * Measured against production: 96px nav row on the home page, 48px gutter,
 * 1px bottom hairline. Below `md` the search collapses to a single pill.
 */
export function Header({
  variant = "full",
  location = "",
  checkIn = "",
  checkOut = "",
  guests,
}: HeaderProps) {
  if (variant === "full") {
    return (
      <HomeHeader
        location={location}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white">
      <div className="header-gutter mx-auto flex h-16 max-w-[2520px] items-center justify-between gap-4 md:h-20">
        <Logo />

        <div className="hidden md:block">
          <CompactSearch
            location={location}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
          />
        </div>

        <UserMenu />
      </div>

      <div className="header-gutter pb-3 md:hidden">
        <MobileSearchPill
          location={location}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
        />
      </div>
    </header>
  );
}
