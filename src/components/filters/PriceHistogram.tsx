"use client";

import { formatPrice } from "@/lib/format/currency";

export interface PriceHistogramProps {
  bars: number[];
  min: number;
  max: number;
  lower: number;
  upper: number;
  onChange: (lower: number, upper: number) => void;
}

/** The price-range histogram with a two-handle slider, as in the filters modal. */
export function PriceHistogram({
  bars,
  min,
  max,
  lower,
  upper,
  onChange,
}: PriceHistogramProps) {
  const peak = Math.max(1, ...bars);
  const span = Math.max(1, max - min);

  return (
    <div>
      <p className="mb-1 text-[16px] font-medium leading-5 text-[#222]">
        Price range
      </p>
      <p className="mb-6 text-[14px] leading-[18px] text-[#6a6a6a]">
        Trip price, includes all fees
      </p>

      <div className="flex h-24 items-end gap-[2px]" aria-hidden="true">
        {bars.map((count, i) => {
          const value = min + (i / bars.length) * span;
          const inRange = value >= lower && value <= upper;
          return (
            <span
              key={i}
              className={`flex-1 rounded-t-sm ${inRange ? "bg-rausch" : "bg-[#dddddd]"}`}
              style={{ height: `${Math.max(4, (count / peak) * 100)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="rounded-3xl border border-[#b0b0b0] px-4 py-2">
          <span className="block text-[12px] leading-4 text-[#6a6a6a]">Minimum</span>
          <input
            type="number"
            aria-label="Minimum price"
            value={lower}
            min={min}
            max={upper}
            onChange={(e) => onChange(Number(e.target.value), upper)}
            className="w-full bg-transparent text-[14px] leading-[18px] text-[#222] outline-none"
          />
        </label>
        <label className="rounded-3xl border border-[#b0b0b0] px-4 py-2">
          <span className="block text-[12px] leading-4 text-[#6a6a6a]">Maximum</span>
          <input
            type="number"
            aria-label="Maximum price"
            value={upper}
            min={lower}
            max={max}
            onChange={(e) => onChange(lower, Number(e.target.value))}
            className="w-full bg-transparent text-[14px] leading-[18px] text-[#222] outline-none"
          />
        </label>
      </div>

      <p className="mt-2 flex justify-between text-[12px] leading-4 text-[#6a6a6a]">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}+</span>
      </p>
    </div>
  );
}
