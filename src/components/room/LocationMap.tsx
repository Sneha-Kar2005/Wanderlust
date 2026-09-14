import type { Coordinates } from "@/types";
import { StaticMap } from "@/components/ui/StaticMap";

export interface LocationMapProps {
  coordinates: Coordinates | null;
  city: string;
  country: string;
  blurb: string | null;
}

export function LocationMap({ coordinates, city, country, blurb }: LocationMapProps) {
  return (
    <section data-section-id="LOCATION_DEFAULT" className="border-t border-[#dddddd] py-12">
      <h2 className="mb-2 text-[22px] font-semibold leading-[26px] text-[#222]">
        Where you&apos;ll be
      </h2>
      <p className="mb-6 text-[16px] leading-5 text-[#222]">
        {city}, {country}
      </p>

      <StaticMap coordinates={coordinates} height={480} label={`${city}, ${country}`} />

      {blurb && (
        <p className="mt-6 text-[16px] leading-6 text-[#222]">{blurb}</p>
      )}
    </section>
  );
}
