import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Gallery } from "@/components/room/Gallery";
import { AgendaSection } from "@/components/room/AgendaSection";
import { ReviewsSection } from "@/components/room/ReviewsSection";
import { HostCard } from "@/components/room/HostCard";
import { LocationMap } from "@/components/room/LocationMap";
import { BookItSimple } from "@/components/booking/BookItSimple";
import { StarIcon } from "@/components/ui/icons";
import { getService, getReviews, services } from "@/lib/db/static";

export async function generateStaticParams() {
  return services.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  const svc = getService(id);
  if (!svc) return { title: "Airbnb" };
  return {
    title: `${svc.title} · ★${svc.rating?.toFixed(1) ?? "New"}`,
    description: svc.tagline ?? svc.title,
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[id]">) {
  const { id } = await params;
  const svc = getService(id);
  if (!svc) notFound();

  const reviews = getReviews(id);

  return (
    <>
      <Header variant="compact" location={svc.city} />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-10 lg:px-20">
        <div data-section-id="Sidebar" className="pt-8">
          <h1 className="text-[26px] font-medium leading-[30px] text-[#222]">
            {svc.title}
          </h1>
          {svc.tagline && (
            <p className="mt-2 max-w-[720px] text-[16px] leading-6 text-[#6a6a6a]">
              {svc.tagline}
            </p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[16px] leading-5 text-[#222]">
            {svc.rating !== null && (
              <>
                <StarIcon size={14} />
                <span className="font-medium">{svc.rating.toFixed(1)}</span>
                <span aria-hidden="true">·</span>
                <span className="underline underline-offset-2">
                  {svc.reviewCount} reviews
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>
              {svc.category} in {svc.city}
            </span>
          </p>
        </div>

        <Gallery photos={svc.photos} title={svc.title} />

        <div className="grid grid-cols-1 gap-x-[94px] lg:grid-cols-[1fr_372px]">
          <div className="min-w-0">
            <AgendaSection heading="Services offered" items={svc.menu} sectionId="Menu" />
            {svc.thingsToKnow.length > 0 && (
              <section
                data-section-id="ThingsToKnow"
                className="border-t border-[#dddddd] py-12"
              >
                <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
                  Things to know
                </h2>
                <ul className="space-y-3">
                  {svc.thingsToKnow.slice(1, 12).map((t) => (
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
              id={svc.id}
              kind="service"
              price={svc.price}
              unit={svc.priceUnit}
              rating={svc.rating}
              reviewCount={svc.reviewCount}
              cancellation={svc.cancellation}
            />
          </div>
        </div>

        <ReviewsSection
          rating={svc.rating}
          reviewCount={svc.reviewCount}
          categoryRatings={{}}
          reviews={reviews}
          guestFavourite={false}
        />
        <LocationMap
          coordinates={svc.coordinates}
          city={svc.city}
          country={svc.country}
          blurb={svc.locationBlurb}
        />
        <HostCard host={svc.host} />
      </main>

      <Footer />
    </>
  );
}
