import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listing/ListingCard";
import { StarIcon } from "@/components/ui/icons";
import { getHost, hosts, listings } from "@/lib/db/static";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: PageProps<"/users/show/[id]">): Promise<Metadata> {
  const { id } = await params;
  const host = getHost(id);
  return { title: `${host?.name ?? "Profile"} - Airbnb` };
}

export default async function ProfilePage({ params }: PageProps<"/users/show/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();

  // "u-1" is the signed-in guest; every other id is a host profile.
  const host = id === user.id ? null : getHost(id);
  if (id !== user.id && !host) notFound();

  const name = host?.name ?? `${user.firstName} ${user.lastName}`;
  const theirListings = host ? listings.filter((l) => l.host.id === host.id) : [];

  const stats = host
    ? [
        { value: host.reviewCount, label: "Reviews" },
        host.rating ? { value: host.rating.toFixed(2), label: "Rating", star: true } : null,
        host.yearsHosting
          ? { value: host.yearsHosting, label: host.yearsHosting === 1 ? "Year hosting" : "Years hosting" }
          : null,
      ].filter(Boolean as unknown as (v: unknown) => boolean)
    : [];

  return (
    <>
      <Header variant="compact" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <div className="grid gap-10 py-10 md:grid-cols-[380px_1fr]">
          <div className="rounded-[20px] bg-white p-8 shadow-[var(--shadow-elevation-3)]">
            <div className="flex items-center gap-6">
              <span
                data-testid="profile-photo-container"
                className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-full bg-[#ebebeb]"
              >
                {host?.avatar && (
                  <Image src={host.avatar} alt={name} fill sizes="104px" className="object-cover" />
                )}
              </span>
              <div>
                <p className="text-[32px] font-semibold leading-9 text-[#222]">{name}</p>
                <p className="mt-1 text-[14px] leading-[18px] text-[#222]">
                  {host?.superhost ? "Superhost" : "Guest"}
                </p>
              </div>
            </div>

            {stats.length > 0 && (
              <dl className="mt-6 divide-y divide-[#ebebeb]">
                {(stats as { value: string | number; label: string; star?: boolean }[]).map(
                  (s) => (
                    <div key={s.label} className="flex items-baseline gap-1.5 py-3">
                      <dd className="flex items-center gap-1 text-[18px] font-semibold leading-6 text-[#222]">
                        {s.value}
                        {s.star && <StarIcon size={12} />}
                      </dd>
                      <dt className="text-[12px] leading-4 text-[#222]">{s.label}</dt>
                    </div>
                  ),
                )}
              </dl>
            )}
          </div>

          <div>
            <h1 className="mb-4 text-[26px] font-semibold leading-[30px] text-[#222]">
              About {name}
            </h1>
            {host?.livesIn && (
              <p className="text-[16px] leading-5 text-[#222]">Lives in {host.livesIn}</p>
            )}
            {host?.speaks?.length ? (
              <p className="mt-1 text-[16px] leading-5 text-[#222]">
                Speaks {host.speaks.join(", ")}
              </p>
            ) : null}
            <p className="mt-4 text-[16px] leading-6 text-[#222]">
              {host?.bio ??
                `${name} joined Airbnb in ${new Date(user.joinedAt).getFullYear()}.`}
            </p>
          </div>
        </div>

        {theirListings.length > 0 && (
          <section className="border-t border-[#ebebeb] pt-10">
            <h2 className="mb-6 text-[22px] font-semibold leading-[26px] text-[#222]">
              {name}&apos;s listings
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {theirListings.map((l) => (
                <ListingCard key={l.id} listing={l} layout="grid" />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  return hosts.slice(0, 40).map((h) => ({ id: h.id }));
}
