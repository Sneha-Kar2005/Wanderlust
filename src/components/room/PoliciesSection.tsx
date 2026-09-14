import type { HouseRules } from "@/types";

export interface PoliciesSectionProps {
  houseRules: HouseRules;
  policies: string[];
}

/** "Things to know": cancellation, house rules and safety, in three columns. */
export function PoliciesSection({ houseRules, policies }: PoliciesSectionProps) {
  const safety = policies.filter((p) =>
    /alarm|camera|stairs|pool|weapon|noise|pet/i.test(p),
  );

  const rules = [
    houseRules.checkIn ? `Check-in: ${houseRules.checkIn}` : null,
    houseRules.checkout ? `Checkout ${houseRules.checkout}` : null,
    houseRules.maxGuests ? `${houseRules.maxGuests} guests maximum` : null,
  ].filter(Boolean) as string[];

  return (
    <section data-section-id="POLICIES_DEFAULT" className="border-t border-[#dddddd] py-12">
      <h2 className="mb-8 text-[22px] font-semibold leading-[26px] text-[#222]">
        Things to know
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Column heading="House rules" items={rules} />
        <Column
          heading="Safety &amp; property"
          items={safety.length ? safety : ["Carbon monoxide alarm not reported", "Smoke alarm not reported"]}
        />
        <Column
          heading="Cancellation policy"
          items={["Add your trip dates to get the cancellation details for this stay."]}
        />
      </div>
    </section>
  );
}

function Column({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-4 text-[16px] font-medium leading-5 text-[#222]">{heading}</h3>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i} className="text-[16px] leading-5 text-[#222]">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
