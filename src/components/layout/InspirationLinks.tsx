import Link from "next/link";
import { destinations } from "@/lib/db/static";

/**
 * The "Inspiration for future getaways" SEO grid at the bottom of the home
 * page: a tab strip over a multi-column list of destination links.
 */
export function InspirationLinks() {
  const cols = 6;
  const perCol = Math.ceil(destinations.length / cols);
  const chunks = Array.from({ length: cols }, (_, i) =>
    destinations.slice(i * perCol, (i + 1) * perCol),
  ).filter((c) => c.length);

  return (
    <section className="border-t border-[#ebebeb] pt-10">
      <h2 className="mb-5 text-[22px] font-semibold leading-[26px] text-[#222]">
        Inspiration for future getaways
      </h2>

      <div className="mb-6 flex gap-6 border-b border-[#ebebeb]">
        <span className="border-b-2 border-[#222] pb-3 text-[14px] font-medium leading-[18px] text-[#222]">
          Popular
        </span>
        {["Arts & culture", "Beach", "Mountains", "Outdoors", "Things to do"].map((t) => (
          <span
            key={t}
            className="cursor-pointer pb-3 text-[14px] leading-[18px] text-[#6a6a6a] hover:text-[#222]"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        {chunks.flat().map((d) => (
          <Link key={d.slug} href={`/s/${d.slug}/homes`} className="block">
            <span className="block truncate text-[14px] font-medium leading-[18px] text-[#222]">
              {d.name}
            </span>
            <span className="block truncate text-[14px] leading-[18px] text-[#6a6a6a]">
              Holiday rentals
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
