import { cn } from "@/lib/cn";

export type Terrain = "beach" | "hills" | "city";

/**
 * Airbnb pairs each suggested destination with a small line drawing on a
 * tinted tile. The artwork is terrain-specific and the tint cycles, so the
 * list reads as colourful rather than a column of identical pins.
 */
const TINTS = [
  { bg: "bg-[#fbf3e9]", fg: "text-[#a8763e]" }, // sand
  { bg: "bg-[#edf6ee]", fg: "text-[#1b7f44]" }, // green
  { bg: "bg-[#fdf0ee]", fg: "text-[#d9503f]" }, // coral
] as const;

export function tintFor(index: number) {
  return TINTS[index % TINTS.length];
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Beach() {
  return (
    <>
      {/* palm */}
      <path d="M20.5 12.5v9" {...stroke} />
      <path d="M20.5 12.5c-1.8-1.9-4.2-2.3-6 -1M20.5 12.5c2.3-1.4 4.7-1.1 6.2.4M20.5 12.5c-.7-2.3.2-4.4 1.8-5.5M20.5 12.5c1.9.6 3.2 2.2 3.6 4" {...stroke} />
      {/* building */}
      <path d="M5 21.5v-8l5-3 5 3v8" {...stroke} />
      <path d="M8 21.5v-3.5h4v3.5" {...stroke} />
      <path d="M8 14.5h1.5M11.5 14.5H13" {...stroke} />
      {/* waves */}
      <path d="M3 25c1.6 0 1.6 1.4 3.2 1.4S7.8 25 9.4 25s1.6 1.4 3.2 1.4S14.2 25 15.8 25s1.6 1.4 3.2 1.4S20.6 25 22.2 25s1.6 1.4 3.2 1.4S27 25 28.6 25" {...stroke} />
      <path d="M3 28.6c1.6 0 1.6 1.4 3.2 1.4s1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4" {...stroke} />
    </>
  );
}

function Hills() {
  return (
    <>
      {/* back ridges */}
      <path d="M2 22 9 13l4.5 5.8" {...stroke} />
      <path d="M16 22l6.5-8.5L30 22" {...stroke} />
      {/* chalet */}
      <path d="M8 26.5v-7l5-3.6 5 3.6v7" {...stroke} />
      <path d="M11 26.5v-4h4v4" {...stroke} />
      {/* fir */}
      <path d="M24 26.5v-3" {...stroke} />
      <path d="M21.2 23.5h5.6L24 19.4z" {...stroke} />
      {/* ground */}
      <path d="M2 26.5h28" {...stroke} />
    </>
  );
}

function City() {
  return (
    <>
      <path d="M4 27V11l7-4 7 4v16" {...stroke} />
      <path d="M18 27V16h9v11" {...stroke} />
      <path d="M8 14h2.5M12.5 14H15M8 18.5h2.5M12.5 18.5H15" {...stroke} />
      <path d="M21 20h2M24.5 20h1.5M21 23.5h2M24.5 23.5h1.5" {...stroke} />
      <path d="M2 27h28" {...stroke} />
    </>
  );
}

export function DestinationIcon({
  terrain,
  size = 24,
}: {
  terrain: Terrain;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {terrain === "beach" ? <Beach /> : terrain === "hills" ? <Hills /> : <City />}
    </svg>
  );
}

/** The paper-plane that heads the list on the live site. */
export function NearbyIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M28.5 4.2 3.9 13.1c-.9.3-.8 1.6.1 1.8l10.2 2.4 2.4 10.2c.2.9 1.5 1 1.8.1L27.8 3.5" {...stroke} />
      <path d="M28.2 3.8 14.2 17.3" {...stroke} />
    </svg>
  );
}

/** Rounded tinted tile that the icon sits on. */
export function IconTile({
  children,
  tint,
}: {
  children: React.ReactNode;
  tint: { bg: string; fg: string };
}) {
  return (
    <span
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
        tint.bg,
        tint.fg,
      )}
    >
      {children}
    </span>
  );
}
