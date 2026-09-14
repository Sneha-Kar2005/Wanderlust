import Image from "next/image";
import type { Host } from "@/types";
import { StarIcon } from "@/components/ui/icons";

export function HostCard({ host }: { host: Host }) {
  const stats = [
    host.reviewCount ? { value: host.reviewCount, label: "Reviews" } : null,
    host.rating ? { value: host.rating.toFixed(2), label: "Rating", star: true } : null,
    host.yearsHosting
      ? { value: host.yearsHosting, label: host.yearsHosting === 1 ? "Year hosting" : "Years hosting" }
      : null,
  ].filter(Boolean) as { value: string | number; label: string; star?: boolean }[];

  return (
    <section data-section-id="MEET_YOUR_HOST" className="border-t border-[#dddddd] py-12">
      <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
        Meet your host
      </h2>

      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <div className="rounded-[20px] bg-white p-8 shadow-[var(--shadow-elevation-3)]">
          <div className="flex items-center gap-6">
            <span
              data-testid="profile-photo-container"
              className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-full bg-[#ebebeb]"
            >
              {host.avatar && (
                <Image src={host.avatar} alt={host.name} fill sizes="104px" className="object-cover" />
              )}
            </span>
            <div>
              <p className="text-[32px] font-semibold leading-9 text-[#222]">{host.name}</p>
              {host.superhost && (
                <p className="mt-1 text-[14px] font-medium leading-[18px] text-[#222]">
                  Superhost
                </p>
              )}
            </div>
          </div>

          <dl className="mt-6 divide-y divide-[#ebebeb]">
            {stats.map((s) => (
              <div
                key={s.label}
                data-testid={`${s.label}-stat-heading`}
                className="flex items-baseline gap-1.5 py-3 first:pt-0 last:pb-0"
              >
                <dd className="flex items-center gap-1 text-[18px] font-semibold leading-6 text-[#222]">
                  {s.value}
                  {s.star && <StarIcon size={12} />}
                </dd>
                <dt className="text-[12px] leading-4 text-[#222]">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div>
          {host.livesIn && (
            <p className="mb-2 text-[16px] leading-5 text-[#222]">Lives in {host.livesIn}</p>
          )}
          {host.speaks.length > 0 && (
            <p className="mb-4 text-[16px] leading-5 text-[#222]">
              Speaks {host.speaks.join(", ")}
            </p>
          )}
          {host.bio && (
            <p className="text-[16px] leading-6 text-[#222]">{host.bio}</p>
          )}
          {host.superhost && (
            <>
              <p className="mt-6 text-[16px] font-medium leading-5 text-[#222]">
                {host.name} is a Superhost
              </p>
              <p className="mt-1 text-[16px] leading-6 text-[#6a6a6a]">
                Superhosts are experienced, highly rated hosts who are committed to
                providing great stays for guests.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
