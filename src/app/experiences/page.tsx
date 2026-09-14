import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExperienceRail } from "@/components/listing/ExperienceRail";
import { railsExperiences, experienceIndex, resolveRail, experiences } from "@/lib/db/static";

export const metadata: Metadata = {
  title: "Airbnb Experiences – Find Things to Do Hosted by Locals",
  description:
    "Book unforgettable activities hosted by locals — food tours, workshops, walks and more.",
};

export default function ExperiencesPage() {
  const rails = railsExperiences.length
    ? railsExperiences
    : [{ id: "all", heading: "Experiences", seeAllHref: null, itemIds: experiences.map((e) => e.id) }];

  return (
    <>
      <Header variant="full" />
      <main className="page-gutter mx-auto w-full max-w-[2520px] flex-1 pb-10">
        {rails.map((rail, i) => (
          <ExperienceRail
            key={rail.id}
            heading={rail.heading}
            items={resolveRail(rail.itemIds, experienceIndex)}
            priority={i === 0}
          />
        ))}
      </main>
      <Footer />
    </>
  );
}
