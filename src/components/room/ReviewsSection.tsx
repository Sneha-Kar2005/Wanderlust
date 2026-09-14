"use client";

import Image from "next/image";
import { useState } from "react";
import type { CategoryRatings, Review } from "@/types";
import { StarIcon, CloseIcon } from "@/components/ui/icons";

export interface ReviewsSectionProps {
  rating: number | null;
  reviewCount: number;
  categoryRatings: CategoryRatings;
  reviews: Review[];
  guestFavourite: boolean;
}

const CATEGORIES: (keyof CategoryRatings)[] = [
  "Cleanliness",
  "Accuracy",
  "Check-in",
  "Communication",
  "Location",
  "Value",
];

export function ReviewsSection({
  rating,
  reviewCount,
  categoryRatings,
  reviews,
  guestFavourite,
}: ReviewsSectionProps) {
  const [open, setOpen] = useState(false);
  if (!reviewCount && !reviews.length) return null;

  return (
    <section
      data-section-id="REVIEWS_DEFAULT"
      className="border-t border-[#dddddd] py-12"
    >
      <h2 className="flex items-center gap-2 text-[22px] font-semibold leading-[26px] text-[#222]">
        <StarIcon size={18} />
        {rating?.toFixed(2) ?? "New"}
        <span aria-hidden="true">·</span>
        {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
      </h2>

      {guestFavourite && (
        <p className="mt-2 text-[16px] leading-5 text-[#6a6a6a]">
          This home is a guest favourite based on ratings, reviews and reliability
        </p>
      )}

      {Object.keys(categoryRatings).length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-x-12 gap-y-4 border-b border-[#ebebeb] pb-8 sm:grid-cols-3">
          {CATEGORIES.filter((c) => categoryRatings[c] !== undefined).map((c) => (
            <div key={c} className="flex items-center justify-between gap-4">
              <dt className="text-[14px] leading-[18px] text-[#222]">{c}</dt>
              <dd className="flex items-center gap-2">
                <span className="text-[14px] font-medium leading-[18px] text-[#222]">
                  {categoryRatings[c]?.toFixed(1)}
                </span>
                <span className="h-1 w-20 overflow-hidden rounded-full bg-[#ebebeb]">
                  <span
                    className="block h-full rounded-full bg-[#222]"
                    style={{ width: `${((categoryRatings[c] ?? 0) / 5) * 100}%` }}
                  />
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        {reviews.slice(0, 6).map((r) => (
          <ReviewCard key={r.id} review={r} clamp />
        ))}
      </div>

      {reviews.length > 6 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-10 rounded-lg border border-[#222] px-5 py-3 text-[16px] font-medium leading-5 text-[#222] transition hover:bg-[#f7f7f7]"
        >
          Show all {reviews.length} reviews
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reviews"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            data-testid="reviews-modal-panel"
            className="max-h-[85vh] w-full max-w-[780px] overflow-y-auto rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 pb-2 pt-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f7f7f7]"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="grid gap-8 px-12 pb-12">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review, clamp = false }: { review: Review; clamp?: boolean }) {
  return (
    <article data-review-id={review.id}>
      <header className="mb-3 flex items-center gap-3">
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#ebebeb]">
          {review.avatar && (
            <Image src={review.avatar} alt="" fill sizes="44px" className="object-cover" />
          )}
        </span>
        <span>
          <span className="block text-[16px] font-medium leading-5 text-[#222]">
            {review.author}
          </span>
          <span className="block text-[14px] leading-[18px] text-[#6a6a6a]">
            {review.tenure ?? review.location ?? ""}
          </span>
        </span>
      </header>
      <p className="mb-2 flex items-center gap-1.5 text-[12px] leading-4 text-[#222]">
        <span className="flex items-center gap-0.5" aria-label={`${review.stars} stars`}>
          {Array.from({ length: review.stars }, (_, i) => (
            <StarIcon key={i} size={10} />
          ))}
        </span>
        <span aria-hidden="true">·</span>
        <span className="font-medium">{review.date}</span>
      </p>
      <p
        className={`text-[16px] leading-6 text-[#222] ${clamp ? "line-clamp-4" : ""}`}
      >
        {review.body}
      </p>
    </article>
  );
}
