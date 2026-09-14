"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

export function DescriptionSection({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!description.trim()) return null;

  const long = description.length > 480;
  const shown = expanded || !long ? description : `${description.slice(0, 480)}…`;

  return (
    <section
      data-section-id="DESCRIPTION_DEFAULT"
      className="border-t border-[#dddddd] py-8"
    >
      <h2 className="sr-only">About this space</h2>
      <p className="whitespace-pre-line text-[16px] leading-6 text-[#222]">{shown}</p>
      {long && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 flex items-center gap-1 text-[16px] font-medium leading-5 text-[#222] underline underline-offset-2"
        >
          Show more
          <ChevronRightIcon size={12} />
        </button>
      )}
    </section>
  );
}
