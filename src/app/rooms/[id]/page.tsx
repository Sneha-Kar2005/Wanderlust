import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Gallery } from "@/components/room/Gallery";
import { RoomOverview } from "@/components/room/RoomOverview";
import { HostSummary } from "@/components/room/HostSummary";
import { Highlights } from "@/components/room/Highlights";
import { DescriptionSection } from "@/components/room/DescriptionSection";
import { SleepingArrangement } from "@/components/room/SleepingArrangement";
import { AmenitiesSection } from "@/components/room/AmenitiesSection";
import { ReviewsSection } from "@/components/room/ReviewsSection";
import { HostCard } from "@/components/room/HostCard";
import { LocationMap } from "@/components/room/LocationMap";
import { PoliciesSection } from "@/components/room/PoliciesSection";
import { BookItSidebar } from "@/components/room/BookItSidebar";
import { RoomTitleBar } from "@/components/room/RoomTitleBar";
import { RailSection } from "@/components/listing/RailSection";
import { getListing, getReviews, listings } from "@/lib/db/static";

export async function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/rooms/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) return { title: "Airbnb" };
  return {
    title: `${listing.title} - ${listing.propertyType.replace(/^Entire /, "")} for Rent in ${listing.city}, ${listing.country} - Airbnb`,
    description: listing.description.slice(0, 160),
  };
}

export default async function RoomPage({
  params,
  searchParams,
}: PageProps<"/rooms/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const listing = getListing(id);
  if (!listing) notFound();

  const reviews = getReviews(id);
  const checkIn = typeof sp.check_in === "string" ? sp.check_in : undefined;
  const checkOut = typeof sp.check_out === "string" ? sp.check_out : undefined;

  // "Explore other options" — same city first, then anything else.
  const nearby = listings
    .filter((l) => l.id !== listing.id)
    .sort((a, b) => {
      const aSame = a.city === listing.city ? 0 : 1;
      const bSame = b.city === listing.city ? 0 : 1;
      return aSame - bSame || (b.rating ?? 0) - (a.rating ?? 0);
    })
    .slice(0, 12);

  return (
    <>
      <Header variant="compact" location={listing.city} />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-10 lg:px-20">
        <RoomTitleBar listing={listing} />
        <Gallery photos={listing.photos} title={listing.title} />

        <div className="grid grid-cols-1 gap-x-[94px] lg:grid-cols-[1fr_372px]">
          <div className="min-w-0">
            <RoomOverview listing={listing} />
            <HostSummary host={listing.host} />
            <Highlights highlights={listing.highlights} />
            <DescriptionSection description={listing.description} />
            <SleepingArrangement rooms={listing.sleeping} />
            <AmenitiesSection
              amenities={listing.amenities}
              unavailable={listing.amenitiesUnavailable}
              groups={listing.amenityGroups}
            />
          </div>

          <div className="pt-8">
            <BookItSidebar listing={listing} checkIn={checkIn} checkOut={checkOut} />
          </div>
        </div>

        <ReviewsSection
          rating={listing.rating}
          reviewCount={listing.reviewCount}
          categoryRatings={listing.categoryRatings}
          reviews={reviews}
          guestFavourite={listing.guestFavourite}
        />
        <LocationMap
          coordinates={listing.coordinates}
          city={listing.city}
          country={listing.country}
          blurb={listing.locationBlurb}
        />
        <HostCard host={listing.host} />
        <PoliciesSection houseRules={listing.houseRules} policies={listing.policiesRaw ?? []} />

        <div className="border-t border-[#dddddd] pt-6">
          <RailSection
            heading={`Explore other options in and around ${listing.city}`}
            listings={nearby}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
