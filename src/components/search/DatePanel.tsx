"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  TODAY,
  monthGrid,
  monthLabel,
  isBefore,
  nightsBetween,
  parseISO,
} from "@/lib/format/date";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface DatePanelProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

/** Two-month calendar. Clicking sets check-in, then check-out. */
export function DatePanel({ checkIn, checkOut, onChange }: DatePanelProps) {
  const start = parseISO(checkIn || TODAY);
  const [cursor, setCursor] = useState({
    year: start.getUTCFullYear(),
    month: start.getUTCMonth(),
  });
  const [hover, setHover] = useState<string | null>(null);

  const next = {
    year: cursor.month === 11 ? cursor.year + 1 : cursor.year,
    month: (cursor.month + 1) % 12,
  };

  function shift(delta: number) {
    const m = cursor.month + delta;
    setCursor({
      year: cursor.year + Math.floor(m / 12),
      month: ((m % 12) + 12) % 12,
    });
  }

  function pick(iso: string) {
    if (!checkIn || (checkIn && checkOut)) return onChange(iso, "");
    if (isBefore(iso, checkIn)) return onChange(iso, "");
    onChange(checkIn, iso);
  }

  const rangeEnd = checkOut || (checkIn && hover && !isBefore(hover, checkIn) ? hover : "");
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <div
      data-testid="structured-search-input-field-dates-panel"
      className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-[840px] -translate-x-1/2 rounded-[32px] bg-white p-8 shadow-[var(--shadow-elevation-4)]"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-[16px] font-medium leading-5 text-[#222]">
          {nights > 0
            ? `${nights} ${nights === 1 ? "night" : "nights"}`
            : "Select check-in date"}
        </h3>
        {nights === 0 && (
          <p className="text-[14px] leading-[18px] text-[#6a6a6a]">
            Add your travel dates for exact pricing
          </p>
        )}
      </div>

      <div className="relative grid grid-cols-2 gap-16">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shift(-1)}
          className="absolute -left-2 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[#222] hover:bg-[#f7f7f7]"
        >
          <ChevronLeftIcon size={14} />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shift(1)}
          className="absolute -right-2 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[#222] hover:bg-[#f7f7f7]"
        >
          <ChevronRightIcon size={14} />
        </button>

        {[cursor, next].map((m) => (
          <Month
            key={`${m.year}-${m.month}`}
            year={m.year}
            month={m.month}
            checkIn={checkIn}
            checkOut={checkOut}
            rangeEnd={rangeEnd}
            onPick={pick}
            onHover={setHover}
          />
        ))}
      </div>

      {(checkIn || checkOut) && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="text-[14px] font-medium leading-[18px] text-[#222] underline underline-offset-2"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
}

function Month({
  year,
  month,
  checkIn,
  checkOut,
  rangeEnd,
  onPick,
  onHover,
}: {
  year: number;
  month: number;
  checkIn: string;
  checkOut: string;
  rangeEnd: string;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-center text-[16px] font-medium leading-5 text-[#222]">
        {monthLabel(year, month)}
      </p>
      <div className="mb-2 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-center text-[12px] font-medium leading-4 text-[#222]"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {monthGrid(year, month).map((iso, i) => {
          if (!iso) return <span key={`pad-${i}`} />;
          const past = isBefore(iso, TODAY);
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange =
            checkIn && rangeEnd && !isBefore(iso, checkIn) && isBefore(iso, rangeEnd);

          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => onPick(iso)}
              onMouseEnter={() => onHover(iso)}
              onMouseLeave={() => onHover(null)}
              aria-label={iso}
              aria-pressed={isStart || isEnd}
              className={cn(
                "relative flex aspect-square items-center justify-center text-[14px] leading-[18px] transition",
                past && "cursor-not-allowed text-[#dddddd] line-through",
                !past && !isStart && !isEnd && "text-[#222] hover:rounded-full hover:border hover:border-[#222]",
                inRange && !isStart && !isEnd && "bg-[#f7f7f7]",
                (isStart || isEnd) && "rounded-full bg-[#222] font-medium text-white",
              )}
            >
              {Number(iso.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
