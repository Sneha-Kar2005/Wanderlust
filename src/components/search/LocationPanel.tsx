"use client";

import destinations from "@/data/destinations.json";
import {
  DestinationIcon,
  NearbyIcon,
  IconTile,
  tintFor,
  type Terrain,
} from "./DestinationIcon";

interface Destination {
  slug: string;
  name: string;
  state: string | null;
  terrain: Terrain;
  tagline: string;
  country: string;
  listingCount: number;
}

const ALL = destinations as Destination[];

/** "Nearby" sits above the destinations with its own blue paper-plane tile. */
const NEARBY_TINT = { bg: "bg-[#ebf2fe]", fg: "text-[#2b6fd6]" };

export interface LocationPanelProps {
  query: string;
  onSelect: (name: string) => void;
}

/**
 * Destination suggestions. With an empty query the live site shows "Nearby"
 * followed by "Suggested destinations"; typing filters to matching places.
 */
export function LocationPanel({ query, onSelect }: LocationPanelProps) {
  const q = query.trim().toLowerCase();
  const matches = (
    q
      ? ALL.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            (d.state ?? "").toLowerCase().includes(q),
        )
      : ALL
  ).slice(0, 8);

  // mousedown beats the input's blur, so the click always lands
  const pick = (name: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(name);
  };

  return (
    <div
      role="listbox"
      data-testid="structured-search-input-field-query-panel"
      aria-label="Destination suggestions"
      className="absolute left-0 top-[calc(100%+12px)] z-50 max-h-[480px] w-[430px] overflow-y-auto rounded-[32px] bg-white py-4 shadow-[var(--shadow-elevation-4)]"
    >
      <p className="px-6 pb-2 pt-1 text-[14px] font-medium leading-[18px] text-[#222]">
        {q ? "Destinations" : "Suggested destinations"}
      </p>

      {matches.length === 0 && (
        <p className="px-6 py-6 text-[14px] leading-[18px] text-[#6a6a6a]">
          No destinations match “{query}”.
        </p>
      )}

      <ul>
        {!q && (
          <li>
            <button
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={pick("")}
              className="flex w-full items-center gap-4 px-6 py-2 text-left hover:bg-[#f7f7f7]"
            >
              <IconTile tint={NEARBY_TINT}>
                <NearbyIcon size={26} />
              </IconTile>
              <span className="min-w-0">
                <span className="block truncate text-[16px] font-medium leading-5 text-[#222]">
                  Nearby
                </span>
                <span className="block truncate text-[14px] leading-[18px] text-[#6a6a6a]">
                  Find what&apos;s around you
                </span>
              </span>
            </button>
          </li>
        )}

        {matches.map((d, i) => (
          <li key={d.slug}>
            <button
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={pick(d.name)}
              className="flex w-full items-center gap-4 px-6 py-2 text-left hover:bg-[#f7f7f7]"
            >
              <IconTile tint={tintFor(i)}>
                <DestinationIcon terrain={d.terrain} size={26} />
              </IconTile>
              <span className="min-w-0">
                <span className="block truncate text-[16px] font-medium leading-5 text-[#222]">
                  {/* The live site repeats it for union territories: "Puducherry, Puducherry". */}
                  {d.state ? `${d.name}, ${d.state}` : d.name}
                </span>
                <span className="block truncate text-[14px] leading-[18px] text-[#6a6a6a]">
                  {d.tagline}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
