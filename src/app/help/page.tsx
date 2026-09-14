import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchIcon, ChevronRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Help Centre - Airbnb" };

const TOPICS = [
  {
    title: "Cancellations and refunds",
    items: [
      "How do I cancel my reservation?",
      "Getting a refund after cancelling",
      "Extenuating circumstances policy",
    ],
  },
  {
    title: "Payments and pricing",
    items: [
      "When am I charged for a booking?",
      "Why does the price change?",
      "Adding a payment method",
    ],
  },
  {
    title: "Your reservations",
    items: [
      "Changing your trip dates",
      "Messaging your host",
      "Checking in and out",
    ],
  },
  {
    title: "Safety and accessibility",
    items: [
      "AirCover for guests",
      "Accessibility features",
      "Reporting a safety issue",
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <Header variant="compact" />

      <main className="flex-1">
        <section className="border-b border-[#ebebeb] bg-[#f7f7f7] py-16">
          <div className="mx-auto max-w-[1120px] px-6">
            <h1 className="text-[32px] font-semibold leading-9 text-[#222]">
              Hi, how can we help?
            </h1>
            <div className="mt-6 flex h-14 max-w-[560px] items-center gap-3 rounded-full border border-[#dddddd] bg-white px-5 shadow-[var(--shadow-elevation-1)]">
              <SearchIcon size={16} />
              <input
                type="search"
                placeholder="Search how-tos and more"
                aria-label="Search the Help Centre"
                className="w-full bg-transparent text-[16px] leading-5 text-[#222] outline-none placeholder:text-[#6a6a6a]"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-6 py-12">
          <h2 className="mb-8 text-[22px] font-semibold leading-[26px] text-[#222]">
            Browse by topic
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
            {TOPICS.map((t) => (
              <div key={t.title}>
                <h3 className="mb-4 text-[18px] font-medium leading-6 text-[#222]">
                  {t.title}
                </h3>
                <ul className="divide-y divide-[#ebebeb] border-y border-[#ebebeb]">
                  {t.items.map((i) => (
                    <li key={i}>
                      <Link
                        href="/help"
                        className="flex items-center justify-between gap-4 py-4 text-[16px] leading-5 text-[#222] hover:underline"
                      >
                        {i}
                        <ChevronRightIcon size={12} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
