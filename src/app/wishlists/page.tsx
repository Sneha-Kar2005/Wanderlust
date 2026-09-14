import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { wishlists } from "@/lib/db/store";
import { getCurrentUserId } from "@/lib/session";
import { resolveSaved } from "@/lib/db/static";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Wishlists - Airbnb" };

export default async function WishlistsPage() {
  const userId = await getCurrentUserId();
  const all = await wishlists.all(userId);

  // A wishlist can hold homes, experiences and services, so resolve across all
  // three; drop ids that no longer exist rather than rendering an empty tile.
  const lists = all
    .map((w) => ({ ...w, items: resolveSaved(w.listingIds) }))
    .filter((w) => w.items.length > 0);

  return (
    <>
      <Header variant="compact" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <h1 className="py-8 text-[32px] font-semibold leading-9 text-[#222]">
          Wishlists
        </h1>

        {lists.length === 0 ? (
          <div className="border-t border-[#ebebeb] py-10">
            <p className="text-[22px] font-medium leading-[26px] text-[#222]">
              Create your first wishlist
            </p>
            <p className="mt-2 text-[16px] leading-6 text-[#6a6a6a]">
              As you search, tap the heart icon to save your favourite places to stay to a
              wishlist.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((w) => {
              // Up to four covers, tiled like Airbnb's wishlist thumbnails.
              const covers = w.items
                .map((i) => i.photos[0])
                .filter(Boolean)
                .slice(0, 4);

              return (
                <li key={w.id}>
                  <Link href={`/wishlists/${w.id}`} className="group block">
                    <span className="relative block aspect-square w-full overflow-hidden rounded-[20px] bg-[#ebebeb]">
                      {/*
                       * The mosaic adapts to how many covers there are, so a
                       * list of 2 or 3 never leaves an empty grey cell:
                       *   1 -> full bleed   2 -> two columns
                       *   3 -> tall left + two stacked right   4+ -> 2x2
                       */}
                      <span
                        className={cn(
                          "grid h-full w-full gap-0.5",
                          covers.length === 1 && "grid-cols-1",
                          covers.length === 2 && "grid-cols-2",
                          covers.length >= 3 && "grid-cols-2 grid-rows-2",
                        )}
                      >
                        {covers.map((src, i) => (
                          <span
                            key={src + i}
                            className={cn(
                              "relative overflow-hidden",
                              covers.length === 3 && i === 0 && "row-span-2",
                            )}
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 50vw, 17vw"
                              className="object-cover transition group-hover:scale-[1.03]"
                            />
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="mt-3 block text-[16px] font-medium leading-5 text-[#222]">
                      {w.name}
                    </span>
                    <span className="block text-[14px] leading-[18px] text-[#6a6a6a]">
                      {w.items.length} saved
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Footer />
    </>
  );
}
