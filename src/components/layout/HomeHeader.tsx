"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NavTabs, NAV_TABS } from "./NavTabs";
import { UserMenu } from "./UserMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { CompactSearch } from "@/components/search/CompactSearch";
import { MobileSearchPill } from "@/components/search/MobileSearchPill";
import { cn } from "@/lib/cn";
import type { GuestCounts } from "@/types";

export interface HomeHeaderProps {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: GuestCounts;
}

/** Past this many pixels the tabs and big search bar collapse into the pill. */
const COLLAPSE_AT = 24;

/**
 * The home/tab header. At the top it shows the product tabs above the full
 * search bar; once the page scrolls it collapses into a single row with a
 * 376x46 pill, exactly as the live site does.
 */
export function HomeHeader({
  location = "",
  checkIn = "",
  checkOut = "",
  guests,
}: HomeHeaderProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > COLLAPSE_AT);
    onScroll(); // handle a restored scroll position on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The collapsed pill carries the current tab's icon; "All" borrows Homes'.
  const activeTab =
    NAV_TABS.find((t) => t.href !== "/" && pathname.startsWith(t.href)) ??
    NAV_TABS.find((t) => t.label === "Homes")!;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white">
      <div className="header-gutter mx-auto flex h-16 max-w-[2520px] items-center justify-between gap-4 md:h-20">
        <Logo />

        {/* Desktop: tabs at the top, pill once scrolled. Both are mounted so
            the swap doesn't reflow the row. */}
        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          {/* `inert` keeps the hidden half out of the tab order and the
              accessibility tree while it is faded out. */}
          <div
            inert={collapsed}
            className={cn(
              "transition-all duration-200",
              collapsed
                ? "pointer-events-none absolute scale-95 opacity-0"
                : "scale-100 opacity-100",
            )}
          >
            <NavTabs />
          </div>
          <div
            inert={!collapsed}
            className={cn(
              "transition-all duration-200",
              collapsed
                ? "scale-100 opacity-100"
                : "pointer-events-none absolute scale-95 opacity-0",
            )}
          >
            <CompactSearch
              location={location}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              datesLabel="Anytime"
              icon={
                <Image
                  src={activeTab.icon}
                  alt=""
                  width={72}
                  height={72}
                  className="h-8 w-8 object-contain"
                />
              }
            />
          </div>
        </div>

        <UserMenu />
      </div>

      {/* Mobile keeps its own single pill on every page. */}
      <div className="header-gutter pb-3 md:hidden">
        <MobileSearchPill
          location={location}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
        />
      </div>

      {/* The full search bar collapses away on scroll. */}
      <div
        inert={collapsed}
        className={cn(
          "header-gutter hidden transition-all duration-200 md:block",
          // Clip only while collapsing — the search panels are absolutely
          // positioned children and would otherwise be cut off by this box.
          collapsed
            ? "max-h-0 overflow-hidden opacity-0"
            : "max-h-32 overflow-visible pb-5 opacity-100",
        )}
      >
        <SearchBar
          initialLocation={location}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialGuests={guests}
        />
      </div>
    </header>
  );
}
