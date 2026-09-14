"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface CardCarouselProps {
  photos: string[];
  alt: string;
  /** Measured on production: rail images are 20:19, search results 1:1. */
  aspect?: "card" | "square";
  sizes?: string;
  priority?: boolean;
}

/** Photo carousel with hover arrows and dot pagination, as on listing cards. */
export function CardCarousel({
  photos,
  alt,
  aspect = "card",
  sizes = "(max-width: 768px) 100vw, 25vw",
  priority = false,
}: CardCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = photos.length;

  function go(delta: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)));
  }

  return (
    <div
      data-testid="listing-image"
      className={cn(
        "group/carousel relative w-full overflow-hidden rounded-[20px] bg-[#f7f7f7]",
        aspect === "square" ? "aspect-square" : "aspect-[20/19]",
      )}
    >
      {count > 0 ? (
        <Image
          src={photos[index]}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full bg-[#ebebeb]" />
      )}

      {count > 1 && (
        <>
          {index > 0 && <Arrow side="left" onClick={(e) => go(-1, e)} />}
          {index < count - 1 && <Arrow side="right" onClick={(e) => go(1, e)} />}

          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {photos.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-white transition-opacity",
                  i === index ? "opacity-100" : "opacity-60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Arrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#222] opacity-0 shadow-[var(--shadow-tertiary)] transition hover:scale-105 hover:bg-white group-hover/carousel:opacity-100",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      {side === "left" ? <ChevronLeftIcon size={12} /> : <ChevronRightIcon size={12} />}
    </button>
  );
}
