"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import type { Listing } from "@/types";
import { ListingCard } from "./ListingCard";
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface RailSectionProps {
  heading: string;
  href?: string | null;
  listings: Listing[];
  priority?: boolean;
}

/**
 * A horizontally scrollable rail of cards, matching the home page: heading
 * with an arrow link, and prev/next buttons that page by one viewport.
 */
export function RailSection({ heading, href, listings, priority = false }: RailSectionProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function sync() {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function page(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (!listings.length) return null;

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        {href ? (
          <Link href={href} className="group flex items-center gap-1.5">
            <h2 className="text-[22px] font-semibold leading-[26px] text-[#222]">
              {heading}
            </h2>
            <ArrowRightIcon
              size={14}
              className="mt-0.5 text-[#222] transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : (
          <h2 className="text-[22px] font-semibold leading-[26px] text-[#222]">
            {heading}
          </h2>
        )}

        <div className="hidden items-center gap-2 md:flex">
          <RailArrow dir="left" disabled={atStart} onClick={() => page(-1)} />
          <RailArrow dir="right" disabled={atEnd} onClick={() => page(1)} />
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={sync}
        data-testid="content-scroller"
        className="no-scrollbar rail-track"
      >
        {listings.map((l, i) => (
          <div key={l.id}>
            <ListingCard listing={l} priority={priority && i < 7} />
          </div>
        ))}
      </div>
    </section>
  );
}

function RailArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Previous" : "Next"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-[#dddddd] bg-white text-[#222] transition",
        disabled ? "cursor-not-allowed opacity-30" : "hover:scale-105 hover:border-[#222]",
      )}
    >
      {dir === "left" ? <ChevronLeftIcon size={12} /> : <ChevronRightIcon size={12} />}
    </button>
  );
}
