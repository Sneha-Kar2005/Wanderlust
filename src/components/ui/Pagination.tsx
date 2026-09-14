"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  page: number;
  pageCount: number;
}

export function Pagination({ page, pageCount }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (pageCount <= 1) return null;

  function go(p: number) {
    const q = new URLSearchParams(params.toString());
    if (p > 1) q.set("page", String(p));
    else q.delete("page");
    router.push(`${pathname}?${q}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Airbnb shows first pages, an ellipsis, then the last page.
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p <= 3 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 py-10">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => go(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#222] transition hover:bg-[#f7f7f7] disabled:opacity-30"
      >
        <ChevronLeftIcon size={12} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-[14px] text-[#6a6a6a]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => go(p)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-[14px] leading-[18px] transition",
              p === page
                ? "bg-[#222] font-medium text-white"
                : "text-[#222] hover:bg-[#f7f7f7]",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => go(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#222] transition hover:bg-[#f7f7f7] disabled:opacity-30"
      >
        <ChevronRightIcon size={12} />
      </button>
    </nav>
  );
}
