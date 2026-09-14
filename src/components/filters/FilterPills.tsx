"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { SettingsIcon } from "@/components/ui/icons";
import { FiltersModal } from "./FiltersModal";

/** The quick-filter chips Airbnb shows above search results. */
export const QUICK_FILTERS = [
  "Washing machine",
  "Wifi",
  "Free parking",
  "Pool",
  "Air conditioning",
  "Kitchen",
  "TV",
  "Allows pets",
] as const;

export interface FilterPillsProps {
  activeCount: number;
  priceHistogram: number[];
  priceMin: number;
  priceMax: number;
}

export function FilterPills({
  activeCount,
  priceHistogram,
  priceMin,
  priceMax,
}: FilterPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const selected = new Set((params.get("amenities") ?? "").split(",").filter(Boolean));

  function toggle(name: string) {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    const q = new URLSearchParams(params.toString());
    if (next.size) q.set("amenities", [...next].join(","));
    else q.delete("amenities");
    q.delete("page");
    router.push(`${pathname}?${q}`);
  }

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto py-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex h-[34px] shrink-0 items-center gap-2 rounded-3xl border border-[#dddddd] bg-white px-3 text-[12px] leading-4 text-[#222] transition hover:border-[#222]"
        >
          <SettingsIcon size={14} />
          Filters
          {activeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#222] px-1 text-[10px] font-medium text-white">
              {activeCount}
            </span>
          )}
        </button>

        {QUICK_FILTERS.map((f) => {
          const on = selected.has(f);
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(f)}
              className={cn(
                "h-[34px] shrink-0 rounded-3xl border px-3 text-[12px] leading-4 transition",
                on
                  ? "border-[#222] bg-[#222] text-white"
                  : "border-[#dddddd] bg-white text-[#222] hover:border-[#222]",
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {open && (
        <FiltersModal
          onClose={() => setOpen(false)}
          histogram={priceHistogram}
          priceMin={priceMin}
          priceMax={priceMax}
        />
      )}
    </>
  );
}
