"use client";

import Image from "next/image";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

export interface GalleryProps {
  photos: string[];
  title: string;
}

/**
 * The 1120 x 500 hero mosaic: one 560px hero on the left and a 2x2 grid of
 * 274px tiles on the right, with rounded outer corners only.
 */
export function Gallery({ photos, title }: GalleryProps) {
  const [open, setOpen] = useState(false);
  const shots = photos.slice(0, 5);
  const [hero, ...rest] = shots;

  return (
    <>
      <div
        data-section-id="HERO_DEFAULT"
        className="relative mt-6 grid h-[300px] grid-cols-1 gap-2 overflow-hidden rounded-xl sm:h-[500px] sm:grid-cols-2"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative h-full w-full overflow-hidden bg-[#f7f7f7] transition hover:brightness-95"
        >
          {hero && (
            <Image
              src={hero}
              alt={title}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </button>

        <div className="hidden grid-cols-2 grid-rows-2 gap-2 sm:grid">
          {rest.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(true)}
              className="relative h-full w-full overflow-hidden bg-[#f7f7f7] transition hover:brightness-95"
            >
              <Image
                src={src}
                alt={`${title} — photo ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-[#222] bg-white px-3.5 py-2 text-[14px] font-medium leading-[18px] text-[#222] shadow-[var(--shadow-tertiary)] transition hover:bg-[#f7f7f7]"
          >
            <MenuIcon size={12} />
            Show all photos
          </button>
        )}
      </div>

      {open && (
        <GalleryModal photos={photos} title={title} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function GalleryModal({
  photos,
  title,
  onClose,
}: {
  photos: string[];
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos of ${title}`}
      className="fixed inset-0 z-[100] overflow-y-auto bg-white"
    >
      <div className="sticky top-0 z-10 bg-white px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f7f7f7]"
        >
          <CloseIcon size={16} />
        </button>
      </div>
      <div className="mx-auto grid max-w-[860px] gap-2 px-6 pb-20">
        {photos.map((src, i) => (
          <div key={src} className="relative aspect-[3/2] w-full bg-[#f7f7f7]">
            <Image
              src={src}
              alt={`${title} — photo ${i + 1}`}
              fill
              sizes="860px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
