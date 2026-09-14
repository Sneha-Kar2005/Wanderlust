import type { Coordinates } from "@/types";
import { PlusIcon, MinusIcon } from "@/components/ui/icons";

export interface StaticMapProps {
  coordinates: Coordinates | null;
  height?: number;
  label?: string;
  /** Extra markers (search results); the primary pin is always centred. */
  markers?: { id: string; lat: number; lng: number; label?: string }[];
  className?: string;
  /** Stretch to the parent's height instead of using a fixed `height`. */
  fill?: boolean;
}

interface Scene {
  roads: { d: string; width: number }[];
  blocks: { x: number; y: number; w: number; h: number }[];
  water: { cx: number; cy: number; rx: number; ry: number };
}

/**
 * Builds the map geometry from a seed. Kept outside the component so its
 * mutable PRNG state is confined to one call and never survives a render.
 */
function buildScene(seed: number, W: number, H: number): Scene {
  let s = seed || 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  const roads = Array.from({ length: 14 }, () => {
    const horizontal = rand() > 0.5;
    const pos = rand() * (horizontal ? H : W);
    const drift = (rand() - 0.5) * 120;
    const width = rand() > 0.75 ? 6 : rand() > 0.4 ? 3 : 1.5;
    return horizontal
      ? { d: `M -20 ${pos} Q ${W / 2} ${pos + drift} ${W + 20} ${pos}`, width }
      : { d: `M ${pos} -20 Q ${pos + drift} ${H / 2} ${pos} ${H + 20}`, width };
  });

  const blocks = Array.from({ length: 26 }, () => ({
    x: rand() * W,
    y: rand() * H,
    w: 40 + rand() * 110,
    h: 30 + rand() * 90,
  }));

  const water = {
    cx: rand() * W,
    cy: rand() * H,
    rx: 120 + rand() * 180,
    ry: 80 + rand() * 130,
  };

  return { roads, blocks, water };
}

/**
 * A deterministic vector map. The environment runs fully offline, so there is
 * no tile server — the road network and water are generated from the
 * coordinates, giving each location a stable, distinct map.
 */
export function StaticMap({
  coordinates,
  height = 480,
  label,
  markers = [],
  className,
  fill = false,
}: StaticMapProps) {
  const seed = coordinates
    ? Math.abs(Math.round(coordinates.lat * 1000) ^ Math.round(coordinates.lng * 1000))
    : 12345;

  const W = 1120;
  // When filling a flex parent the pixel height is unknown at render time;
  // the viewBox stays fixed and `slice` crops it to whatever box it gets.
  const H = fill ? 900 : height;

  const { roads, blocks, water } = buildScene(seed, W, H);

  return (
    <div
      data-testid="universal-map-controlled"
      className={`relative w-full overflow-hidden bg-[#e8e6e1] ${fill ? "h-full" : "rounded-xl"} ${className ?? ""}`}
      style={fill ? undefined : { height }}
      role="img"
      aria-label={label ? `Map of ${label}` : "Map"}
    >
      <svg
        data-testid="map/GoogleMap"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <rect width={W} height={H} fill="#eae7e1" />

        <ellipse
          cx={water.cx}
          cy={water.cy}
          rx={water.rx}
          ry={water.ry}
          fill="#a3ccf0"
          opacity="0.85"
        />

        {blocks.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="3"
            fill="#e0ddd6"
            stroke="#d6d2ca"
          />
        ))}

        {roads.map((r, i) => (
          <path
            key={i}
            d={r.d}
            stroke={r.width > 4 ? "#f7d774" : "#ffffff"}
            strokeWidth={r.width}
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {/* Secondary markers (search results) as price pills */}
        {markers.map((m, i) => {
          const x = 120 + ((i * 137) % (W - 240));
          const y = 80 + ((i * 211) % (H - 160));
          return (
            <g key={m.id} data-testid="map/markers/BasePillMarker">
              <rect
                x={x - 34}
                y={y - 14}
                width="68"
                height="28"
                rx="14"
                fill="#ffffff"
                stroke="#dddddd"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#222222"
              >
                {m.label ?? "₹—"}
              </text>
            </g>
          );
        })}

        {/* Primary location pin */}
        <g
          data-testid="map/markers/BaseCircleMarker"
          transform={`translate(${W / 2}, ${H / 2})`}
        >
          <circle r="42" fill="#ff385c" opacity="0.18" />
          <circle r="14" fill="#ff385c" stroke="#ffffff" strokeWidth="3" />
        </g>
      </svg>

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg bg-white shadow-[var(--shadow-tertiary)]">
        <button
          type="button"
          data-testid="map/ZoomInButton"
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center border-b border-[#ebebeb] text-[#222] transition hover:bg-[#f7f7f7]"
        >
          <PlusIcon size={12} />
        </button>
        <button
          type="button"
          data-testid="map/ZoomOutButton"
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center text-[#222] transition hover:bg-[#f7f7f7]"
        >
          <MinusIcon size={12} />
        </button>
      </div>
    </div>
  );
}
