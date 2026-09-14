import Image from "next/image";
import type { Host } from "@/types";

/** The compact "Hosted by X · Superhost · N years hosting" row under the overview. */
export function HostSummary({ host }: { host: Host }) {
  const meta = [
    host.superhost ? "Superhost" : null,
    host.yearsHosting
      ? `${host.yearsHosting} ${host.yearsHosting === 1 ? "year" : "years"} hosting`
      : null,
  ].filter(Boolean);

  return (
    <section
      data-section-id="HOST_OVERVIEW_DEFAULT"
      className="flex items-center gap-4 border-t border-[#dddddd] py-6"
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#ebebeb]">
        {host.avatar && (
          <Image src={host.avatar} alt="" fill sizes="48px" className="object-cover" />
        )}
      </span>
      <span>
        <span className="block text-[16px] font-medium leading-5 text-[#222]">
          Hosted by {host.name}
        </span>
        {meta.length > 0 && (
          <span className="block text-[14px] leading-[18px] text-[#6a6a6a]">
            {meta.join(" · ")}
          </span>
        )}
      </span>
    </section>
  );
}
