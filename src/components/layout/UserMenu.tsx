"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { GlobeIcon, MenuIcon } from "@/components/ui/icons";
import { useClickOutside } from "@/lib/useClickOutside";

const GUEST_LINKS = [
  { label: "Sign up", href: "/login?mode=signup", bold: true },
  { label: "Log in", href: "/login" },
];
const BROWSE_LINKS = [
  { label: "Wishlists", href: "/wishlists" },
  { label: "Trips", href: "/trips" },
  { label: "Airbnb your home", href: "/host/homes" },
  { label: "Help Centre", href: "/help" },
];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <Link
        href="/host/homes"
        className="hidden rounded-full px-3 py-2.5 text-[14px] font-medium leading-[18px] text-[#222] transition hover:bg-[#f7f7f7] lg:block"
      >
        Become a host
      </Link>

      <button
        type="button"
        aria-label="Choose a language and currency"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[#222] transition hover:bg-[#ebebeb]"
      >
        <GlobeIcon size={16} />
      </button>

      <button
        type="button"
        data-testid="cypress-headernav-profile"
        aria-label="Main navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[#222] transition hover:bg-[#ebebeb]"
      >
        <MenuIcon size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-2xl bg-white py-2 shadow-[var(--shadow-elevation-3)]"
        >
          {GUEST_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-[14px] leading-[18px] text-[#222] hover:bg-[#f7f7f7] ${l.bold ? "font-medium" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <hr className="my-2 border-[#ebebeb]" />
          {BROWSE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] leading-[18px] text-[#222] hover:bg-[#f7f7f7]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
