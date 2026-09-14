"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PriceHistogram } from "./PriceHistogram";
import amenityCatalogue from "@/data/amenities.json";

const AMENITIES = (amenityCatalogue as { name: string; count: number }[])
  .slice(0, 24)
  .map((a) => a.name);

const PLACE_TYPES = [
  { value: "any", label: "Any type" },
  { value: "room", label: "Room" },
  { value: "entire", label: "Entire home" },
] as const;

const COUNTS = ["Any", "1", "2", "3", "4", "5", "6", "7", "8+"];

export interface FiltersModalProps {
  onClose: () => void;
  histogram: number[];
  priceMin: number;
  priceMax: number;
}

export function FiltersModal({
  onClose,
  histogram,
  priceMin,
  priceMax,
}: FiltersModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [lower, setLower] = useState(Number(params.get("price_min") ?? priceMin));
  const [upper, setUpper] = useState(Number(params.get("price_max") ?? priceMax));
  const [placeType, setPlaceType] = useState(params.get("place_type") ?? "any");
  const [bedrooms, setBedrooms] = useState(params.get("bedrooms") ?? "Any");
  const [beds, setBeds] = useState(params.get("beds") ?? "Any");
  const [bathrooms, setBathrooms] = useState(params.get("bathrooms") ?? "Any");
  const [amenities, setAmenities] = useState<Set<string>>(
    new Set((params.get("amenities") ?? "").split(",").filter(Boolean)),
  );
  const [guestFav, setGuestFav] = useState(params.get("guest_favourite") === "1");
  const [superhost, setSuperhost] = useState(params.get("superhost") === "1");

  function apply() {
    const q = new URLSearchParams(params.toString());
    const set = (k: string, v: string | null) => (v ? q.set(k, v) : q.delete(k));

    set("price_min", lower > priceMin ? String(lower) : null);
    set("price_max", upper < priceMax ? String(upper) : null);
    set("place_type", placeType !== "any" ? placeType : null);
    set("bedrooms", bedrooms !== "Any" ? bedrooms.replace("+", "") : null);
    set("beds", beds !== "Any" ? beds.replace("+", "") : null);
    set("bathrooms", bathrooms !== "Any" ? bathrooms.replace("+", "") : null);
    set("amenities", amenities.size ? [...amenities].join(",") : null);
    set("guest_favourite", guestFav ? "1" : null);
    set("superhost", superhost ? "1" : null);
    q.delete("page");

    router.push(`${pathname}?${q}`);
    onClose();
  }

  function clearAll() {
    setLower(priceMin);
    setUpper(priceMax);
    setPlaceType("any");
    setBedrooms("Any");
    setBeds("Any");
    setBathrooms("Any");
    setAmenities(new Set());
    setGuestFav(false);
    setSuperhost(false);
  }

  function toggleAmenity(name: string) {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        data-testid="filters-modal-panel"
        className="flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative flex h-16 shrink-0 items-center justify-center border-b border-[#ebebeb]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute left-6 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f7f7f7]"
          >
            <CloseIcon size={14} />
          </button>
          <h2 className="text-[16px] font-semibold leading-5 text-[#222]">Filters</h2>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          <PriceHistogram
            bars={histogram}
            min={priceMin}
            max={priceMax}
            lower={lower}
            upper={upper}
            onChange={(lo, hi) => {
              setLower(lo);
              setUpper(hi);
            }}
          />

          <Section title="Type of place">
            <div className="flex gap-3">
              {PLACE_TYPES.map((t) => (
                <Chip
                  key={t.value}
                  active={placeType === t.value}
                  onClick={() => setPlaceType(t.value)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Rooms and beds">
            <CountRow label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
            <CountRow label="Beds" value={beds} onChange={setBeds} />
            <CountRow label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
          </Section>

          <Section title="Amenities">
            <div className="flex flex-wrap gap-3">
              {AMENITIES.map((a) => (
                <Chip key={a} active={amenities.has(a)} onClick={() => toggleAmenity(a)}>
                  {a}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Booking options">
            <Toggle label="Guest favourite" checked={guestFav} onChange={setGuestFav} />
            <Toggle label="Superhost" checked={superhost} onChange={setSuperhost} />
          </Section>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-[#ebebeb] px-6 py-4">
          <button
            type="button"
            onClick={clearAll}
            className="text-[16px] font-medium leading-5 text-[#222] underline underline-offset-2"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-[#222] px-6 py-3.5 text-[16px] font-medium leading-5 text-white transition hover:bg-black"
          >
            Show results
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#ebebeb] pt-8 first:border-0 first:pt-0">
      <h3 className="mb-4 text-[22px] font-semibold leading-[26px] text-[#222]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-3xl border px-4 py-2.5 text-[14px] leading-[18px] transition",
        active
          ? "border-[#222] bg-[#f7f7f7] text-[#222]"
          : "border-[#dddddd] text-[#222] hover:border-[#222]",
      )}
    >
      {children}
    </button>
  );
}

function CountRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[16px] leading-5 text-[#222]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {COUNTS.map((c) => (
          <Chip key={c} active={value === c} onClick={() => onChange(c)}>
            {c}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-[16px] leading-5 text-[#222]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-6 accent-[#222]"
      />
    </label>
  );
}
