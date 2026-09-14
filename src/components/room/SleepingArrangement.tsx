import type { SleepingArrangement as Arrangement } from "@/types";

export function SleepingArrangement({ rooms }: { rooms: Arrangement[] }) {
  if (!rooms.length) return null;

  return (
    <section
      data-section-id="SLEEPING_ARRANGEMENT_WITH_IMAGES"
      className="border-t border-[#dddddd] py-12"
    >
      <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
        Where you&apos;ll sleep
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <li
            key={r.name}
            className="rounded-xl border border-[#dddddd] p-5"
          >
            <span
              aria-hidden="true"
              className="mb-6 block h-6 w-6 rounded bg-[#f7f7f7]"
            />
            <span className="block text-[16px] font-medium leading-5 text-[#222]">
              {r.name}
            </span>
            <span className="block text-[14px] leading-[18px] text-[#6a6a6a]">
              {r.beds}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
