"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon, HeartIcon, GlobeIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "Explore", Icon: SearchIcon },
  { href: "/wishlists", label: "Wishlists", Icon: HeartIcon },
  { href: "/trips", label: "Trips", Icon: GlobeIcon },
  { href: "/login", label: "Log in", Icon: MenuIcon },
] as const;

/** The fixed bottom tab bar shown on small screens. */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ebebeb] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] leading-3",
                  active ? "text-rausch" : "text-[#6a6a6a]",
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
