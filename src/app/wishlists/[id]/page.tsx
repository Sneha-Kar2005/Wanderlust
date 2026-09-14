import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listing/ListingCard";
import { ExperienceCard } from "@/components/listing/ExperienceCard";
import { wishlists } from "@/lib/db/store";
import { resolveSaved } from "@/lib/db/static";

export const metadata: Metadata = { title: "Wishlist - Airbnb" };

export default async function WishlistDetailPage({
  params,
}: PageProps<"/wishlists/[id]">) {
  const { id } = await params;
  const wl = await wishlists.get(id);
  if (!wl) notFound();

  const items = resolveSaved(wl.listingIds);

  return (
    <>
      <Header variant="compact" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <h1 className="pt-8 text-[32px] font-semibold leading-9 text-[#222]">
          {wl.name}
        </h1>
        <p className="mb-8 mt-1 text-[16px] leading-5 text-[#6a6a6a]">
          {items.length} saved
        </p>

        {items.length === 0 ? (
          <p className="border-t border-[#ebebeb] py-10 text-[16px] leading-6 text-[#6a6a6a]">
            Nothing saved here yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) =>
              // Homes get the stay card; experiences and services get the
              // square per-guest card they use on their own tabs.
              item.kind === "home" ? (
                <ListingCard key={item.id} listing={item} layout="grid" />
              ) : (
                <ExperienceCard key={item.id} item={item} />
              ),
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
