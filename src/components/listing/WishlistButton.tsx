"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface WishlistButtonProps {
  listingId: string;
  initialSaved?: boolean;
  /** "card" floats over a photo; "pdp" sits inline in the listing header. */
  variant?: "card" | "pdp";
}

/**
 * The heart overlay. Unsaved is a translucent white-stroked heart; saved
 * fills with rausch.
 */
export function WishlistButton({
  listingId,
  initialSaved = false,
  variant = "card",
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    setPending(true);
    try {
      await fetch("/api/wishlists", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
    } catch {
      setSaved(!next); // roll back on failure
    } finally {
      setPending(false);
    }
  }

  if (variant === "pdp") {
    return (
      <button
        type="button"
        data-testid={saved ? "pdp-save-button-saved" : "pdp-save-button-unsaved"}
        onClick={toggle}
        disabled={pending}
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[14px] font-medium leading-[18px] text-[#222] underline underline-offset-2 transition hover:bg-[#f7f7f7]"
      >
        <HeartIcon
          size={16}
          className={cn(saved ? "text-rausch" : "text-[#222]")}
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={saved ? 0 : 2}
        />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      data-testid="listing-card-save-button"
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      onClick={toggle}
      disabled={pending}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center transition-transform active:scale-90"
    >
      <HeartIcon
        size={24}
        className={cn("drop-shadow-sm", saved ? "text-rausch" : "text-black/50")}
        fill="currentColor"
        stroke="#fff"
        strokeWidth={2}
      />
    </button>
  );
}
