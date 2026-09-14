"use client";

import { PlusIcon, MinusIcon } from "@/components/ui/icons";
import type { GuestCounts } from "@/types";
import { cn } from "@/lib/cn";

const ROWS: {
  key: keyof GuestCounts;
  label: string;
  hint: string;
  min: number;
  max: number;
}[] = [
  { key: "adults", label: "Adults", hint: "Ages 13 or above", min: 0, max: 16 },
  { key: "children", label: "Children", hint: "Ages 2 – 12", min: 0, max: 15 },
  { key: "infants", label: "Infants", hint: "Under 2", min: 0, max: 5 },
  { key: "pets", label: "Pets", hint: "Bringing a service animal?", min: 0, max: 5 },
];

export interface GuestPanelProps {
  value: GuestCounts;
  onChange: (next: GuestCounts) => void;
}

export function GuestPanel({ value, onChange }: GuestPanelProps) {
  function step(key: keyof GuestCounts, delta: number, min: number, max: number) {
    const next = Math.min(max, Math.max(min, value[key] + delta));
    // Adding any child or infant implies at least one adult.
    const withAdult =
      (key === "children" || key === "infants") && next > 0 && value.adults === 0
        ? { ...value, [key]: next, adults: 1 }
        : { ...value, [key]: next };
    onChange(withAdult);
  }

  return (
    <div
      data-testid="structured-search-input-field-guests-panel"
      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[420px] rounded-[32px] bg-white p-6 shadow-[var(--shadow-elevation-4)]"
    >
      {ROWS.map((row, i) => (
        <div
          key={row.key}
          className={cn(
            "flex items-center justify-between py-4",
            i < ROWS.length - 1 && "border-b border-[#ebebeb]",
          )}
        >
          <div>
            <p className="text-[16px] font-medium leading-5 text-[#222]">{row.label}</p>
            <p className="mt-0.5 text-[14px] leading-[18px] text-[#6a6a6a]">{row.hint}</p>
          </div>

          <div className="flex items-center gap-3">
            <Stepper
              label={`decrease ${row.label}`}
              disabled={value[row.key] <= row.min}
              onClick={() => step(row.key, -1, row.min, row.max)}
            >
              <MinusIcon size={12} />
            </Stepper>
            <span
              aria-live="polite"
              className="w-6 text-center text-[16px] leading-5 text-[#222]"
            >
              {value[row.key]}
            </span>
            <Stepper
              label={`increase ${row.label}`}
              disabled={value[row.key] >= row.max}
              onClick={() => step(row.key, 1, row.min, row.max)}
            >
              <PlusIcon size={12} />
            </Stepper>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stepper({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border transition",
        disabled
          ? "cursor-not-allowed border-[#ebebeb] text-[#dddddd]"
          : "border-[#b0b0b0] text-[#6a6a6a] hover:border-[#222] hover:text-[#222]",
      )}
    >
      {children}
    </button>
  );
}
