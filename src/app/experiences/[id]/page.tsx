import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Gallery } from "@/components/room/Gallery";
import { AgendaSection } from "@/components/room/AgendaSection";
import { Highlights } from "@/components/room/Highlights";
import { ReviewsSection } from "@/components/room/ReviewsSection";
import { HostCard } from "@/components/room/HostCard";
import { LocationMap } from "@/components/room/LocationMap";
import { BookItSimple } from "@/components/booking/BookItSimple";
import { StarIcon } from "@/components/ui/icons";
import { getExperience, getReviews, experiences } from "@/lib/db/static";

export async function generateStaticParams() {
  return experiences.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/experiences/[id]">): Promise<Metadata> {
  const { id } = await params;
  const exp = getExperience(id);
  if (!exp) return { title: "Airbnb" };
  return {
    title: `${exp.title} · ★${exp.rating?.toFixed(1) ?? "New"}`,
    description: exp.tagline ?? exp.title,
  };
}

export default async function ExperiencePage({ params }: PageProps<"/experiences/[id]">) {
  const { id } = await params;
  const exp = getExperience(id);
  if (!exp) notFound();

  const reviews = getReviews(id);

  return (
    <>
      <Header variant="compact" location={exp.city} />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-10 lg:px-20">
        <div data-section-id="Title" className="pt-8">
          <h1 className="text-[26px] font-medium leading-[30px] text-[#222]">
            {exp.title}
          </h1>
          {exp.rating !== null && (
            <p className="mt-2 flex items-center gap-1.5 text-[16px] leading-5 text-[#222]">
              <StarIcon size={14} />
              <span className="font-medium">{exp.rating.toFixed(1)}</span>
              <span aria-hidden="true">·</span>
              <span className="underline underline-offset-2">
                {exp.reviewCount} reviews
              </span>
            </p>
          )}
        </div>

        <Gallery photos={exp.photos} title={exp.title} />

        <div className="grid grid-cols-1 gap-x-[94px] lg:grid-cols-[1fr_372px]">
          <div className="min-w-0">
            <AgendaSection
              heading="What you'll do"
              items={exp.agenda}
              sectionId="Agenda"
            />
            <Highlights highlights={exp.highlights} />
            {exp.thingsToKnow.length > 0 && (
              <section
                data-section-id="ThingsToKnow"
                className="border-t border-[#dddddd] py-12"
              >
                <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
                  Things to know
                </h2>
                <ul className="space-y-3">
                  {exp.thingsToKnow.slice(1, 12).map((t) => (
                    <li key={t} className="text-[16px] leading-6 text-[#222]">
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="pt-8">
            <BookItSimple
              id={exp.id}
              kind="experience"
              price={exp.price}
              unit={exp.priceUnit}
              rating={exp.rating}
              reviewCount={exp.reviewCount}
              cancellation={exp.cancellation}
            />
          </div>
        </div>

        <ReviewsSection
          rating={exp.rating}
          reviewCount={exp.reviewCount}
          categoryRatings={{}}
          reviews={reviews}
          guestFavourite={false}
        />
        <LocationMap
          coordinates={exp.coordinates}
          city={exp.city}
          country={exp.country}
          blurb={exp.locationBlurb}
        />
        <HostCard host={exp.host} />
      </main>

      <Footer />
    </>
  );
}
