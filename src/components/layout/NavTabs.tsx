"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavTab {
  label: string;
  href: string;
  icon: string;
  iconActive: string;
}

/** The four product tabs Airbnb shows above the search bar. */
export const NAV_TABS: NavTab[] = [
  { label: "All", href: "/", icon: "/images/nav/all.webp", iconActive: "/images/nav/all-active.webp" },
  { label: "Homes", href: "/homes", icon: "/images/nav/homes.webp", iconActive: "/images/nav/homes-active.webp" },
  { label: "Experiences", href: "/experiences", icon: "/images/nav/experiences.webp", iconActive: "/images/nav/experiences-active.webp" },
  { label: "Services", href: "/services", icon: "/images/nav/services.webp", iconActive: "/images/nav/services-active.webp" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="tab-list-wrapper"
      className="flex items-center gap-6"
      aria-label="Product categories"
    >
      {NAV_TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="group relative flex items-center gap-0.5 py-1"
          >
            {/*
             * Airbnb's tab artwork is a PNG with generous transparent padding,
             * so the box has to be much larger than the glyph looks: the live
             * site uses a 72px box to render a ~34px icon.
             */}
            <Image
              src={active ? tab.iconActive : tab.icon}
              alt=""
              width={144}
              height={144}
              className="h-[68px] w-[68px] object-contain transition-transform duration-200 group-hover:-translate-y-0.5"
            />
            <span
              className={cn(
                // Live: font-size 0.875rem / line-height 1.125rem, with an 8px
                // gap to the icon. Active is #222 medium; the rest are foggy
                // grey and darken on hover.
                "-ml-3 whitespace-nowrap text-[14px] leading-[18px] transition-colors",
                active
                  ? "font-medium text-[#222]"
                  : "font-normal text-[#6a6a6a] group-hover:text-[#222]",
              )}
            >
              {tab.label}
            </span>
            {/* Active tab underline — 2px, sits just under the row */}
            <span
              data-testid={active ? "elements-underline" : undefined}
              className={cn(
                "absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-[#222] transition-opacity",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-30",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
