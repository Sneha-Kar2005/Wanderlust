import Image from "next/image";
import type { AgendaItem } from "@/types";

export interface AgendaSectionProps {
  heading: string;
  items: AgendaItem[];
  sectionId: string;
}

/** Experience itineraries ("What you'll do") and service menus share this shape. */
export function AgendaSection({ heading, items, sectionId }: AgendaSectionProps) {
  if (!items.length) return null;

  return (
    <section data-section-id={sectionId} className="border-t border-[#dddddd] py-12">
      <h2 className="mb-8 text-[22px] font-semibold leading-[26px] text-[#222]">
        {heading}
      </h2>
      <ol className="space-y-8">
        {items.map((item, i) => (
          <li key={`${item.title}-${i}`} className="flex gap-6">
            {item.image ? (
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7]">
                <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dddddd] text-[14px] font-medium text-[#222]"
              >
                {i + 1}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[16px] font-medium leading-5 text-[#222]">
                {item.title}
              </span>
              {item.body && (
                <span className="mt-1 block text-[16px] leading-6 text-[#6a6a6a]">
                  {item.body}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
