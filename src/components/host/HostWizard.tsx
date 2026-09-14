"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format/currency";
import { PlusIcon, MinusIcon } from "@/components/ui/icons";

const PROPERTY_TYPES = [
  "Entire villa",
  "Entire apartment",
  "Entire home",
  "Entire bungalow",
  "Entire cottage",
  "Room",
  "Farm stay",
  "Entire cabin",
];

const STEPS = ["About your place", "Make it stand out", "Finish up and publish"] as const;

/** The three-step "Airbnb your home" flow. */
export function HostWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(5000);
  const [error, setError] = useState<string | null>(null);

  function next() {
    setError(null);
    if (step === 0) {
      if (!type) return setError("Choose a property type.");
      if (!city.trim()) return setError("Enter the city your place is in.");
    }
    if (step === 1) {
      if (title.trim().length < 8) return setError("Give your place a title of at least 8 characters.");
      if (description.trim().length < 20) return setError("Add a description of at least 20 characters.");
    }
    if (step === 2) {
      router.push("/host/homes");
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <ol className="flex gap-2 py-8" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <span
              className={cn(
                "block h-1 rounded-full",
                i <= step ? "bg-[#222]" : "bg-[#ebebeb]",
              )}
            />
            <span
              className={cn(
                "mt-2 block text-[12px] leading-4",
                i <= step ? "text-[#222]" : "text-[#6a6a6a]",
              )}
            >
              Step {i + 1}
            </span>
          </li>
        ))}
      </ol>

      <h1 className="mb-8 text-[32px] font-semibold leading-9 text-[#222]">
        {STEPS[step]}
      </h1>

      {step === 0 && (
        <div className="space-y-8">
          <fieldset>
            <legend className="mb-4 text-[18px] font-medium leading-6 text-[#222]">
              Which of these best describes your place?
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={type === t}
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-xl border p-4 text-left text-[14px] leading-[18px] transition",
                    type === t
                      ? "border-2 border-[#222] bg-[#f7f7f7]"
                      : "border-[#dddddd] hover:border-[#222]",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-[18px] font-medium leading-6 text-[#222]">
              Where is it?
            </span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full rounded-lg border border-[#b0b0b0] px-4 py-3 text-[16px] leading-5 text-[#222] outline-none focus:border-[#222]"
            />
          </label>

          <div className="space-y-1">
            <p className="mb-2 text-[18px] font-medium leading-6 text-[#222]">
              Share some basics
            </p>
            <Counter label="Guests" value={guests} onChange={setGuests} min={1} max={16} />
            <Counter label="Bedrooms" value={bedrooms} onChange={setBedrooms} min={0} max={10} />
            <Counter label="Beds" value={beds} onChange={setBeds} min={1} max={16} />
            <Counter label="Bathrooms" value={bathrooms} onChange={setBathrooms} min={1} max={10} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <label className="block">
            <span className="mb-2 block text-[18px] font-medium leading-6 text-[#222]">
              Now, let&apos;s give your place a title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="Luxury Lakeside 2BHK Villa"
              className="w-full rounded-lg border border-[#b0b0b0] px-4 py-3 text-[16px] leading-5 text-[#222] outline-none focus:border-[#222]"
            />
            <span className="mt-1 block text-[12px] leading-4 text-[#6a6a6a]">
              {title.length}/50
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-[18px] font-medium leading-6 text-[#222]">
              Create your description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={500}
              placeholder="You'll have a great time at this comfortable place to stay."
              className="w-full rounded-lg border border-[#b0b0b0] px-4 py-3 text-[16px] leading-6 text-[#222] outline-none focus:border-[#222]"
            />
            <span className="mt-1 block text-[12px] leading-4 text-[#6a6a6a]">
              {description.length}/500
            </span>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div>
            <p className="mb-2 text-[18px] font-medium leading-6 text-[#222]">
              Now, set your price
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-[48px] font-semibold leading-[56px] text-[#222]">
                {formatPrice(price)}
              </span>
              <span className="text-[16px] leading-5 text-[#6a6a6a]">night</span>
            </div>
            <input
              type="range"
              min={500}
              max={50000}
              step={100}
              value={price}
              aria-label="Nightly price"
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-4 w-full accent-[#222]"
            />
            <p className="mt-2 text-[14px] leading-[18px] text-[#6a6a6a]">
              Guests will see {formatPrice(Math.round(price * 2.884))} for a 2-night stay,
              all fees included.
            </p>
          </div>

          <dl className="rounded-xl border border-[#dddddd] p-6">
            <Summary label="Type" value={type ?? "—"} />
            <Summary label="Location" value={city || "—"} />
            <Summary
              label="Capacity"
              value={`${guests} guests · ${bedrooms} bedrooms · ${beds} beds · ${bathrooms} bathrooms`}
            />
            <Summary label="Title" value={title || "—"} />
          </dl>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 text-[14px] leading-[18px] text-arches">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-[#ebebeb] pt-6">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="text-[16px] font-medium leading-5 text-[#222] underline underline-offset-2 disabled:opacity-30"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-lg bg-[#222] px-8 py-3.5 text-[16px] font-medium leading-5 text-white transition hover:bg-black"
        >
          {step === 2 ? "Publish listing" : "Next"}
        </button>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#ebebeb] py-4 last:border-0">
      <span className="text-[16px] leading-5 text-[#222]">{label}</span>
      <span className="flex items-center gap-3">
        <Step
          label={`decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <MinusIcon size={12} />
        </Step>
        <span className="w-6 text-center text-[16px] leading-5 text-[#222]">{value}</span>
        <Step
          label={`increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <PlusIcon size={12} />
        </Step>
      </span>
    </div>
  );
}

function Step({
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-[#ebebeb] py-3 last:border-0">
      <dt className="text-[14px] leading-[18px] text-[#6a6a6a]">{label}</dt>
      <dd className="text-right text-[14px] leading-[18px] text-[#222]">{value}</dd>
    </div>
  );
}
