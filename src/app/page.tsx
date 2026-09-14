import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RailSection } from "@/components/listing/RailSection";
import { InspirationLinks } from "@/components/layout/InspirationLinks";
import { railsHome, listingIndex, resolveRail } from "@/lib/db/static";

export default function HomePage() {
  return (
    <>
      <Header variant="full" />

      <main className="page-gutter mx-auto w-full max-w-[2520px] flex-1 pb-10">
        {railsHome.map((rail, i) => (
          <RailSection
            key={rail.id}
            heading={rail.heading}
            href={rail.seeAllHref ? `/s/${encodeURIComponent(rail.heading.split(" in ").pop() ?? "all")}/homes` : null}
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
