"use client";

import { useState } from "react";
import type { AmenityGroup } from "@/types";
import { CloseIcon } from "@/components/ui/icons";

export interface AmenitiesSectionProps {
  amenities: string[];
  unavailable: string[];
  groups: AmenityGroup[];
}

export function AmenitiesSection({
  amenities,
  unavailable,
  groups,
}: AmenitiesSectionProps) {
  const [open, setOpen] = useState(false);
  const totalCount = groups.reduce((n, g) => n + g.items.length, 0) || amenities.length;
  const preview = amenities.slice(0, 10);

  return (
    <section
      data-section-id="AMENITIES_DEFAULT"
      className="border-t border-[#dddddd] py-12"
    >
      <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
        What this place offers
      </h2>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {preview.map((a) => (
          <li key={a} className="text-[16px] leading-5 text-[#222]">
            {a}
          </li>
        ))}
        {unavailable.slice(0, 2).map((a) => (
          <li key={a} className="text-[16px] leading-5 text-[#6a6a6a] line-through">
            {a}
          </li>
        ))}
      </ul>

      {totalCount > preview.length && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 rounded-lg border border-[#222] px-5 py-3 text-[16px] font-medium leading-5 text-[#222] transition hover:bg-[#f7f7f7]"
        >
          Show all {totalCount} amenities
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="What this place offers"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            data-testid="amenities-modal-panel"
            className="max-h-[85vh] w-full max-w-[780px] overflow-y-auto rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 pb-2 pt-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f7f7f7]"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="px-12 pb-12">
              <h3 className="mb-8 text-[26px] font-semibold leading-[30px] text-[#222]">
                What this place offers
              </h3>
              {groups.map((g) => (
                <div key={g.group} className="mb-8">
                  <h4 className="mb-4 text-[18px] font-medium leading-6 text-[#222]">
                    {g.group}
                  </h4>
                  <ul>
                    {g.items.map((item) => (
                      <li
                        key={item}
                        className="border-b border-[#ebebeb] py-4 text-[16px] leading-5 text-[#222] last:border-0"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
