import type { Highlight } from "@/types";

export function Highlights({ highlights }: { highlights: Highlight[] }) {
  if (!highlights.length) return null;

  return (
    <section
      data-section-id="HIGHLIGHTS_DEFAULT"
      className="border-t border-[#dddddd] py-8"
    >
      <h2 className="sr-only">Listing highlights</h2>
      <ul className="space-y-6">
        {highlights.map((h) => (
          <li key={h.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#f7f7f7]"
            />
            <span>
              <span className="block text-[16px] font-medium leading-5 text-[#222]">
                {h.title}
              </span>
              {h.body && (
                <span className="block text-[14px] leading-[18px] text-[#6a6a6a]">
                  {h.body}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
