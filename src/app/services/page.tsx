import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExperienceRail } from "@/components/listing/ExperienceRail";
import { railsServices, serviceIndex, resolveRail, services } from "@/lib/db/static";

export const metadata: Metadata = {
  title: "Airbnb Services – Enhance Your Stay with Vetted Local Professionals",
  description:
    "Book vetted local professionals — photographers, chefs, trainers and more — for your stay.",
};

export default function ServicesPage() {
  const rails = railsServices.length
    ? railsServices
    : [{ id: "all", heading: "Services", seeAllHref: null, itemIds: services.map((s) => s.id) }];

  return (
    <>
      <Header variant="full" />
      <main className="page-gutter mx-auto w-full max-w-[2520px] flex-1 pb-10">
        {rails.map((rail, i) => (
          <ExperienceRail
            key={rail.id}
            heading={rail.heading}
            items={resolveRail(rail.itemIds, serviceIndex)}
            priority={i === 0}
          />
        ))}
      </main>
      <Footer />
    </>
  );
}
