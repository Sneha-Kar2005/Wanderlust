import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RailSection } from "@/components/listing/RailSection";
import { InspirationLinks } from "@/components/layout/InspirationLinks";
import { railsHome, listingIndex, resolveRail } from "@/lib/db/static";

export const metadata: Metadata = {
  title: "Airbnb | Holiday rentals, cabins, beach houses & more",
  description:
    "Find holiday rentals, cabins, beach houses, unique homes and experiences around the world.",
};

export default function HomesPage() {
  return (
    <>
      <Header variant="full" />
      <main className="page-gutter mx-auto w-full max-w-[2520px] flex-1 pb-10">
        {railsHome.map((rail, i) => (
          <RailSection
            key={rail.id}
            heading={rail.heading}
            href={`/s/${encodeURIComponent(rail.heading.split(" in ").pop()?.replace(/ this weekend$/, "").replace(/\s+/g, "-") ?? "all")}/homes`}
            listings={resolveRail(rail.itemIds, listingIndex)}
            priority={i === 0}
          />
        ))}
        <InspirationLinks />
      </main>
      <Footer />
    </>
  );
}
